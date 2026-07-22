/**
 * Railway GraphQL helpers for on-demand wyze-bridge start/stop.
 * Prefer redeploy/restart of the existing image (no rebuild) for faster wakes.
 */

import { isCameraSleeping } from "@/lib/camera/sleepSchedule";

const RAILWAY_API = "https://backboard.railway.com/graphql/v2";
const KEEP_ALIVE_VAR = "BIRDHOUSE_KEEP_ALIVE_UNTIL";

type GraphqlResult<T> = { data?: T; errors?: { message: string }[] };

export type BridgePhase =
  | "ready"
  | "starting"
  | "stopped"
  | "unknown"
  | "unconfigured";

function config() {
  const token = process.env.RAILWAY_API_TOKEN?.trim();
  const serviceId = process.env.RAILWAY_SERVICE_ID?.trim();
  const environmentId = process.env.RAILWAY_ENVIRONMENT_ID?.trim();
  const idleMinutes = Number(process.env.CAMERA_IDLE_MINUTES ?? "12");
  const monitoringEnabled = ["1", "true", "yes", "on"].includes(
    process.env.CAMERA_MONITORING_ENABLED?.trim().toLowerCase() ?? ""
  );
  return {
    token,
    serviceId,
    environmentId,
    idleMs: (Number.isFinite(idleMinutes) ? idleMinutes : 12) * 60_000,
    monitoringEnabled,
    configured: Boolean(token && serviceId && environmentId),
  };
}

/** Daytime monitoring window — inverse of the Pacific overnight sleep. */
export function isScheduledInferenceActive(now = new Date()): boolean {
  const { monitoringEnabled } = config();
  if (!monitoringEnabled) return false;
  return !isCameraSleeping(now);
}

export function isRailwayBridgeControlConfigured(): boolean {
  return config().configured;
}

async function railwayGraphql<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const { token } = config();
  if (!token) throw new Error("RAILWAY_API_TOKEN is not set");

  const body = JSON.stringify({ query, variables });

  // Account/workspace tokens use Bearer. Project tokens use Project-Access-Token.
  const authStyles: Record<string, string>[] = [
    { Authorization: `Bearer ${token}` },
    { "Project-Access-Token": token },
  ];

  let lastError = "Railway API request failed";
  for (const auth of authStyles) {
    const res = await fetch(RAILWAY_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...auth,
      },
      body,
      cache: "no-store",
    });

    const json = (await res.json()) as GraphqlResult<T>;
    if (res.ok && !json.errors?.length && json.data) {
      return json.data;
    }

    lastError =
      json.errors?.map((e) => e.message).join("; ") ||
      `Railway API HTTP ${res.status}`;

    // Only fall through to the other auth style on 401/403.
    if (res.status !== 401 && res.status !== 403) break;
  }

  throw new Error(lastError);
}

type DeploymentNode = {
  id: string;
  status: string;
  createdAt: string;
};

export async function getLatestDeployment(): Promise<DeploymentNode | null> {
  const { serviceId, environmentId } = config();
  const data = await railwayGraphql<{
    deployments: { edges: { node: DeploymentNode }[] };
  }>(
    `query ($serviceId: String!, $environmentId: String!) {
      deployments(
        first: 1
        input: { serviceId: $serviceId, environmentId: $environmentId }
      ) {
        edges { node { id status createdAt } }
      }
    }`,
    { serviceId, environmentId }
  );
  return data.deployments.edges[0]?.node ?? null;
}

async function setKeepAliveUntil(timestampMs: number): Promise<void> {
  const { serviceId, environmentId } = config();
  await railwayGraphql(
    `mutation ($input: VariableUpsertInput!) {
      variableUpsert(input: $input)
    }`,
    {
      input: {
        environmentId,
        serviceId,
        name: KEEP_ALIVE_VAR,
        value: String(timestampMs),
        skipDeploys: true,
      },
    }
  );
}

/** Extend keep-alive window (call on wake + while viewing). */
export async function touchBridgeKeepAlive(): Promise<number> {
  const { idleMs, configured } = config();
  const until = Date.now() + idleMs;
  if (!configured) return until;
  try {
    await setKeepAliveUntil(until);
  } catch (err) {
    console.warn("[railway] keep-alive upsert failed", err);
  }
  return until;
}

export async function getKeepAliveUntil(): Promise<number | null> {
  const { serviceId, environmentId, configured } = config();
  if (!configured) return null;
  try {
    const data = await railwayGraphql<{ variables: Record<string, string> }>(
      `query ($environmentId: String!, $serviceId: String!) {
        variables(environmentId: $environmentId, serviceId: $serviceId)
      }`,
      { environmentId, serviceId }
    );
    const raw = data.variables?.[KEEP_ALIVE_VAR];
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

/** Probe HLS — fastest signal that the bridge is actually usable. */
export async function probeHlsReady(timeoutMs = 4000): Promise<boolean> {
  const base = (
    process.env.CAMERA_UPSTREAM_BASE ??
    process.env.NEXT_PUBLIC_CAMERA_UPSTREAM_BASE ??
    ""
  ).replace(/\/$/, "");
  if (!base) return false;

  const user =
    process.env.CAMERA_STREAM_USER ??
    process.env.NEXT_PUBLIC_CAMERA_STREAM_USER ??
    "wb";
  const pass =
    process.env.CAMERA_STREAM_PASSWORD ??
    process.env.NEXT_PUBLIC_CAMERA_STREAM_PASSWORD ??
    "";
  if (!pass) return false;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${base}/bird/stream.m3u8`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`,
      },
      cache: "no-store",
      signal: ctrl.signal,
    });
    if (!res.ok) return false;
    const text = await res.text();
    return text.includes("#EXTM3U");
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Ensure the bridge is running. Uses cached-image redeploy (no git rebuild).
 * Returns immediately if HLS already answers.
 */
export async function ensureBridgeAwake(): Promise<{
  phase: BridgePhase;
  deploymentStatus: string | null;
  message: string;
  keepAliveUntil: number | null;
}> {
  const { configured, serviceId, environmentId } = config();

  // Overnight: never wake / keep the bridge alive — show the sleeping state.
  if (isCameraSleeping()) {
    if (configured) {
      void stopBridgeForNight().catch(() => undefined);
    }
    return {
      phase: "stopped",
      deploymentStatus: null,
      message:
        "The birds and camera are sleeping. Check back tomorrow starting 5:00 AM PST.",
      keepAliveUntil: null,
    };
  }

  if (!configured) {
    // Still allow streaming if bridge is left running manually.
    const ready = await probeHlsReady();
    return {
      phase: ready ? "ready" : "unconfigured",
      deploymentStatus: null,
      message: ready
        ? "Bridge responding (Railway control not configured)"
        : "Set RAILWAY_API_TOKEN, RAILWAY_SERVICE_ID, RAILWAY_ENVIRONMENT_ID",
      keepAliveUntil: null,
    };
  }

  if (await probeHlsReady(3500)) {
    const until = await touchBridgeKeepAlive();
    return {
      phase: "ready",
      deploymentStatus: "SUCCESS",
      message: "Live",
      keepAliveUntil: until,
    };
  }

  const latest = await getLatestDeployment();
  const status = latest?.status ?? "UNKNOWN";

  // Already deploying / starting — just wait and extend keep-alive.
  if (
    status === "BUILDING" ||
    status === "DEPLOYING" ||
    status === "QUEUED" ||
    status === "WAITING"
  ) {
    await touchBridgeKeepAlive();
    return {
      phase: "starting",
      deploymentStatus: status,
      message: "Camera is starting…",
      keepAliveUntil: await getKeepAliveUntil(),
    };
  }

  // Serverless sleeping only needs a request to wake. A SUCCESS record with
  // no HLS response may be a deployment that was stopped overnight; Railway
  // leaves the historical deployment status as SUCCESS.
  if (status === "SLEEPING") {
    void probeHlsReady(2500);
    const until = await touchBridgeKeepAlive();
    return {
      phase: "starting",
      deploymentStatus: status,
      message: "Waking camera…",
      keepAliveUntil: until,
    };
  }

  // Stopped, failed, or stale SUCCESS — redeploy existing image (no rebuild).
  await railwayGraphql(
    `mutation ($serviceId: String!, $environmentId: String!) {
      serviceInstanceRedeploy(serviceId: $serviceId, environmentId: $environmentId)
    }`,
    { serviceId, environmentId }
  );
  const until = await touchBridgeKeepAlive();
  return {
    phase: "starting",
    deploymentStatus: status,
    message: "Starting camera bridge…",
    keepAliveUntil: until,
  };
}

/** Force-stop for the overnight sleep window (ignores keep-alive). */
export async function stopBridgeForNight(): Promise<{
  stopped: boolean;
  reason: string;
}> {
  const { configured } = config();
  if (!configured) {
    return { stopped: false, reason: "Railway control not configured" };
  }

  const latest = await getLatestDeployment();
  if (!latest) {
    return { stopped: false, reason: "No deployment found" };
  }
  if (
    latest.status === "REMOVED" ||
    latest.status === "FAILED" ||
    latest.status === "CRASHED"
  ) {
    return { stopped: false, reason: `Already ${latest.status}` };
  }

  await railwayGraphql(
    `mutation ($id: String!) { deploymentStop(id: $id) }`,
    { id: latest.id }
  );
  return { stopped: true, reason: "Stopped for overnight sleep window" };
}

export async function stopBridgeIfIdle(): Promise<{
  stopped: boolean;
  reason: string;
}> {
  const { configured } = config();
  if (!configured) {
    return { stopped: false, reason: "Railway control not configured" };
  }

  // Night window always wins — stop even if someone left Live Cam open.
  if (isCameraSleeping()) {
    return stopBridgeForNight();
  }

  if (isScheduledInferenceActive()) {
    return {
      stopped: false,
      reason: "Scheduled bird inference is active",
    };
  }

  const until = await getKeepAliveUntil();
  if (until != null && Date.now() < until) {
    return {
      stopped: false,
      reason: `Keep-alive until ${new Date(until).toISOString()}`,
    };
  }

  // If HLS still has active viewers somehow but keep-alive missing, don't stop.
  if (await probeHlsReady(2500) && until == null) {
    await touchBridgeKeepAlive();
    return { stopped: false, reason: "Bridge busy; refreshed keep-alive" };
  }

  return stopBridgeForNight().then((result) =>
    result.stopped
      ? { stopped: true, reason: "Stopped after idle window" }
      : result
  );
}
