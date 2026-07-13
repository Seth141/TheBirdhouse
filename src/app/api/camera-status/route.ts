import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Safe diagnostics for production camera wiring (no secrets).
 * Open: https://YOUR-APP.vercel.app/api/camera-status
 */
export async function GET() {
  const upstream = Boolean(
    (process.env.CAMERA_UPSTREAM_BASE ?? process.env.NEXT_PUBLIC_CAMERA_UPSTREAM_BASE ?? "").trim()
  );
  const auth = Boolean(
    (
      process.env.CAMERA_STREAM_PASSWORD ??
      process.env.NEXT_PUBLIC_CAMERA_STREAM_PASSWORD ??
      ""
    ).trim()
  );
  const protocol = process.env.NEXT_PUBLIC_CAMERA_PROTOCOL ?? "(unset)";
  const streamUrl = process.env.NEXT_PUBLIC_CAMERA_STREAM_URL ?? "(unset)";

  let upstreamReachable: boolean | null = null;
  let upstreamStatus: number | null = null;
  let detail = "";

  const base = (
    process.env.CAMERA_UPSTREAM_BASE ??
    process.env.NEXT_PUBLIC_CAMERA_UPSTREAM_BASE ??
    ""
  ).replace(/\/$/, "");

  if (upstream && auth && base) {
    const user =
      process.env.CAMERA_STREAM_USER ??
      process.env.NEXT_PUBLIC_CAMERA_STREAM_USER ??
      "wb";
    const pass =
      process.env.CAMERA_STREAM_PASSWORD ??
      process.env.NEXT_PUBLIC_CAMERA_STREAM_PASSWORD ??
      "";
    try {
      const res = await fetch(`${base}/bird/stream.m3u8`, {
        headers: {
          Authorization: `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`,
        },
        cache: "no-store",
      });
      upstreamStatus = res.status;
      upstreamReachable = res.ok;
      if (!res.ok) detail = `Upstream returned HTTP ${res.status}`;
    } catch (err) {
      upstreamReachable = false;
      detail = err instanceof Error ? err.message : "fetch failed";
    }
  } else if (!upstream) {
    detail = "Set CAMERA_UPSTREAM_BASE on Vercel, then Redeploy";
  } else if (!auth) {
    detail = "Set CAMERA_STREAM_PASSWORD on Vercel, then Redeploy";
  }

  const ok =
    protocol === "hls" &&
    streamUrl.includes("/api/camera/") &&
    upstream &&
    auth &&
    upstreamReachable === true;

  return NextResponse.json({
    ok,
    protocol,
    streamUrl,
    upstreamConfigured: upstream,
    authConfigured: auth,
    upstreamReachable,
    upstreamStatus,
    detail: detail || (ok ? "Camera pipeline looks good" : "Check missing fields above"),
  });
}
