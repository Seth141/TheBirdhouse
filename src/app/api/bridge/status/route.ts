import { NextResponse } from "next/server";
import {
  getLatestDeployment,
  getKeepAliveUntil,
  isRailwayBridgeControlConfigured,
  probeHlsReady,
  touchBridgeKeepAlive,
} from "@/lib/railway/wyzeBridge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Poll while waking — also extends keep-alive when the page is open. */
export async function GET() {
  const ready = await probeHlsReady(4000);
  if (ready) {
    const until = isRailwayBridgeControlConfigured()
      ? await touchBridgeKeepAlive()
      : null;
    return NextResponse.json({
      phase: "ready",
      message: "Live",
      deploymentStatus: (await getLatestDeployment().catch(() => null))?.status ?? null,
      keepAliveUntil: until,
      controlConfigured: isRailwayBridgeControlConfigured(),
    });
  }

  const latest = await getLatestDeployment().catch(() => null);
  const until = await getKeepAliveUntil().catch(() => null);
  const controlConfigured = isRailwayBridgeControlConfigured();

  return NextResponse.json({
    phase: latest ? "starting" : controlConfigured ? "starting" : "unconfigured",
    message: latest
      ? "Waking camera…"
      : controlConfigured
        ? "Starting camera bridge…"
        : "Set RAILWAY_API_TOKEN, RAILWAY_SERVICE_ID, and RAILWAY_ENVIRONMENT_ID",
    deploymentStatus: latest?.status ?? null,
    keepAliveUntil: until,
    controlConfigured,
  });
}
