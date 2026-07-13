import { NextResponse } from "next/server";
import { stopBridgeIfIdle } from "@/lib/railway/wyzeBridge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Vercel Cron: stop wyze-bridge after the idle keep-alive window.
 * Secured with CRON_SECRET when set.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await stopBridgeIfIdle();
    return NextResponse.json(result);
  } catch (err) {
    console.error("[camera/idle-check]", err);
    return NextResponse.json(
      { stopped: false, reason: err instanceof Error ? err.message : "error" },
      { status: 500 }
    );
  }
}
