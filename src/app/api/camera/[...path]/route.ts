import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Same-origin HLS proxy for wyze-bridge.
 *
 * Browsers struggle with cross-origin Basic auth + MediaMTX CORS
 * (`Access-Control-Allow-Origin: *` with credentials). The player loads
 * `/api/camera/bird/stream.m3u8`; we fetch upstream with server-side auth.
 */
function upstreamBase(): string | null {
  const raw =
    process.env.CAMERA_UPSTREAM_BASE ??
    process.env.NEXT_PUBLIC_CAMERA_UPSTREAM_BASE ??
    "";
  const trimmed = raw.replace(/\/$/, "");
  return trimmed || null;
}

function authHeader(): string | null {
  const user =
    process.env.CAMERA_STREAM_USER ??
    process.env.NEXT_PUBLIC_CAMERA_STREAM_USER ??
    "wb";
  const pass =
    process.env.CAMERA_STREAM_PASSWORD ??
    process.env.NEXT_PUBLIC_CAMERA_STREAM_PASSWORD ??
    "";
  if (!pass) return null;
  return `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const base = upstreamBase();
  if (!base) {
    return NextResponse.json(
      { error: "CAMERA_UPSTREAM_BASE is not configured" },
      { status: 503 }
    );
  }

  const { path } = await context.params;
  if (!path?.length) {
    return NextResponse.json({ error: "Missing camera path" }, { status: 400 });
  }

  const rel = path.map(encodeURIComponent).join("/");
  const search = request.nextUrl.search;
  const upstreamUrl = `${base}/${rel}${search}`;

  const headers: HeadersInit = {
    Accept: request.headers.get("accept") ?? "*/*",
  };
  const auth = authHeader();
  if (auth) headers.Authorization = auth;

  const range = request.headers.get("range");
  if (range) headers.Range = range;

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      headers,
      cache: "no-store",
      redirect: "follow",
    });
  } catch (err) {
    console.error("[camera proxy] fetch failed", upstreamUrl, err);
    return NextResponse.json(
      { error: "Upstream camera unreachable" },
      { status: 502 }
    );
  }

  if (!upstream.ok && upstream.status !== 206) {
    console.error(
      "[camera proxy] upstream status",
      upstream.status,
      upstreamUrl
    );
    return new NextResponse(null, { status: upstream.status });
  }

  const contentType =
    upstream.headers.get("content-type") ?? "application/octet-stream";
  const body = await upstream.arrayBuffer();

  const out = new NextResponse(body, {
    status: upstream.status,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Access-Control-Allow-Origin": "*",
    },
  });

  const contentLength = upstream.headers.get("content-length");
  if (contentLength) out.headers.set("Content-Length", contentLength);
  const contentRange = upstream.headers.get("content-range");
  if (contentRange) out.headers.set("Content-Range", contentRange);
  const acceptRanges = upstream.headers.get("accept-ranges");
  if (acceptRanges) out.headers.set("Accept-Ranges", acceptRanges);

  return out;
}
