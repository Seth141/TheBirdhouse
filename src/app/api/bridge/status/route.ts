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

  return NextResponse.json({
    phase: latest ? "starting" : "stopped",
    message: latest ? "Waking camera…" : "Camera is offline",
    deploymentStatus: latest?.status ?? null,
    keepAliveUntil: until,
    controlConfigured: isRailwayBridgeControlConfigured(),
  });
}
