import { NextResponse } from "next/server";
import { generateBirdTip } from "@/lib/tips/generateBirdTip";

export const dynamic = "force-dynamic";

export async function GET() {
  const tip = await generateBirdTip();
  return NextResponse.json(tip, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
    },
  });
}
