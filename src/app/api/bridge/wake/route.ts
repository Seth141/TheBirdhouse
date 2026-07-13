import { NextResponse } from "next/server";
import {
  ensureBridgeAwake,
  isRailwayBridgeControlConfigured,
  probeHlsReady,
} from "@/lib/railway/wyzeBridge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Wake wyze-bridge as fast as possible (cached redeploy / restart, no rebuild).
 * Call on Live Cam tap (pre-warm) and on /live-camera mount.
 */
export async function POST() {
  try {
    const result = await ensureBridgeAwake();
    // One quick re-probe after kick so a warm bridge returns ready in one round-trip.
    if (result.phase === "starting") {
      const ready = await probeHlsReady(5000);
      if (ready) {
        return NextResponse.json({
          ...result,
          phase: "ready",
          message: "Live",
          controlConfigured: isRailwayBridgeControlConfigured(),
        });
      }
    }
    return NextResponse.json({
      ...result,
      controlConfigured: isRailwayBridgeControlConfigured(),
    });
  } catch (err) {
    console.error("[camera/wake]", err);
    return NextResponse.json(
      {
        phase: "unknown",
        message: err instanceof Error ? err.message : "Wake failed",
        controlConfigured: isRailwayBridgeControlConfigured(),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
