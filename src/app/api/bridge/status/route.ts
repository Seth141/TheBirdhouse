import { NextResponse } from "next/server";
import { isCameraSleeping } from "@/lib/camera/sleepSchedule";
import {
  getLatestDeployment,
  getKeepAliveUntil,
  isRailwayBridgeControlConfigured,
  probeHlsReady,
  stopBridgeForNight,
  touchBridgeKeepAlive,
} from "@/lib/railway/wyzeBridge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Poll while waking — also extends keep-alive when the page is open. */
export async function GET() {
  const controlConfigured = isRailwayBridgeControlConfigured();

  if (isCameraSleeping()) {
    if (controlConfigured) {
      void stopBridgeForNight().catch(() => undefined);
    }
    return NextResponse.json({
      phase: "stopped",
      message:
        "The birds and camera are sleeping. Check back tomorrow starting 5:00 AM PST.",
      deploymentStatus: null,
      keepAliveUntil: null,
      controlConfigured,
      sleeping: true,
    });
  }

  const ready = await probeHlsReady(4000);
  if (ready) {
    const until = controlConfigured ? await touchBridgeKeepAlive() : null;
    return NextResponse.json({
      phase: "ready",
      message: "Live",
      deploymentStatus:
        (await getLatestDeployment().catch(() => null))?.status ?? null,
      keepAliveUntil: until,
      controlConfigured,
      sleeping: false,
    });
  }

  const latest = await getLatestDeployment().catch(() => null);
  const until = await getKeepAliveUntil().catch(() => null);

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
    sleeping: false,
  });
}
