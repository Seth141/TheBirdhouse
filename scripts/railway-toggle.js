#!/usr/bin/env node
/**
 * Start/stop the combined Railway camera + inference service via GraphQL.
 *
 * Confirmed mutations (introspected 2026-07-14 against backboard.railway.com):
 *   deploymentStop(id: String!)
 *   serviceInstanceRedeploy(environmentId: String!, serviceId: String!)
 *
 * Usage:
 *   node scripts/railway-toggle.js --stop
 *   node scripts/railway-toggle.js --start
 *
 * Env (GitHub Actions secrets / .env.local):
 *   RAILWAY_API_TOKEN
 *   RAILWAY_SERVICE_ID
 *   RAILWAY_ENVIRONMENT_ID
 */

const RAILWAY_API = "https://backboard.railway.com/graphql/v2";
const PACIFIC_TZ = "America/Los_Angeles";

/** True from 8:00 PM Pacific until 5:00 AM Pacific. */
function isCameraSleeping(now = new Date()) {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: PACIFIC_TZ,
      hour: "numeric",
      hourCycle: "h23",
    }).format(now)
  );
  return hour >= 20 || hour < 5;
}

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    console.error(`Missing required env: ${name}`);
    process.exit(1);
  }
  return value;
}

async function railwayGraphql(query, variables) {
  const token = requireEnv("RAILWAY_API_TOKEN");
  const body = JSON.stringify({ query, variables });

  // Account/workspace tokens use Bearer. Project tokens use Project-Access-Token.
  const authStyles = [
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
    });

    const json = await res.json();
    if (res.ok && !json.errors?.length && json.data) {
      return json.data;
    }

    lastError =
      json.errors?.map((e) => e.message).join("; ") ||
      `Railway API HTTP ${res.status}`;

    if (res.status !== 401 && res.status !== 403) break;
  }

  throw new Error(lastError);
}

async function getLatestDeployment(serviceId, environmentId) {
  const data = await railwayGraphql(
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

async function stopService(serviceId, environmentId) {
  const latest = await getLatestDeployment(serviceId, environmentId);
  if (!latest) {
    console.log("No deployment found — nothing to stop.");
    return;
  }

  console.log(`Latest deployment: ${latest.id} (${latest.status})`);

  if (
    latest.status === "REMOVED" ||
    latest.status === "FAILED" ||
    latest.status === "CRASHED"
  ) {
    console.log(`Already ${latest.status} — skipping stop.`);
    return;
  }

  await railwayGraphql(
    `mutation ($id: String!) { deploymentStop(id: $id) }`,
    { id: latest.id }
  );
  console.log("Stopped deployment via deploymentStop.");
}

async function startService(serviceId, environmentId) {
  const latest = await getLatestDeployment(serviceId, environmentId);
  if (latest) {
    console.log(`Latest deployment: ${latest.id} (${latest.status})`);
  } else {
    console.log("No prior deployment found.");
  }

  // A stopped Railway deployment can remain recorded as SUCCESS. The morning
  // job runs after a deliberate overnight stop, so SUCCESS must be redeployed.
  // Only skip states that are actively starting.
  if (
    latest &&
    (latest.status === "BUILDING" ||
      latest.status === "DEPLOYING" ||
      latest.status === "QUEUED" ||
      latest.status === "WAITING" ||
      latest.status === "SLEEPING")
  ) {
    console.log(`Already ${latest.status} — skipping redeploy.`);
    return;
  }

  await railwayGraphql(
    `mutation ($serviceId: String!, $environmentId: String!) {
      serviceInstanceRedeploy(serviceId: $serviceId, environmentId: $environmentId)
    }`,
    { serviceId, environmentId }
  );
  console.log("Started via serviceInstanceRedeploy (existing image, no rebuild).");
}

function parseArgs(argv) {
  const flags = new Set(argv.slice(2));
  const start = flags.has("--start");
  const stop = flags.has("--stop");
  if (start === stop) {
    console.error("Usage: node scripts/railway-toggle.js --start | --stop");
    process.exit(1);
  }
  return { start, stop };
}

async function main() {
  const { start, stop } = parseArgs(process.argv);
  const serviceId = requireEnv("RAILWAY_SERVICE_ID");
  const environmentId = requireEnv("RAILWAY_ENVIRONMENT_ID");
  const sleeping = isCameraSleeping();
  const pacificHour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: PACIFIC_TZ,
      hour: "numeric",
      hourCycle: "h23",
    }).format(new Date())
  );

  if (stop) {
    // Dual UTC crons cover PST/PDT; only the one landing at 8 PM acts.
    if (pacificHour !== 20 && !process.env.FORCE_RAILWAY_TOGGLE) {
      console.log("Not 8 PM Pacific — skipping duplicate night stop.");
      return;
    }
    await stopService(serviceId, environmentId);
  } else if (start) {
    // Dual UTC crons cover PST/PDT; only the one landing at 5 AM acts.
    if ((sleeping || pacificHour !== 5) && !process.env.FORCE_RAILWAY_TOGGLE) {
      console.log("Not 5 AM Pacific — skipping duplicate morning start.");
      return;
    }
    await startService(serviceId, environmentId);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
