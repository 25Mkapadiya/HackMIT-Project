import { NextResponse } from "next/server";
import usStates from "@/lib/gis/data/usStates.json";

export async function GET() {
  return NextResponse.json(usStates, {
    headers: {
      "Cache-Control": "public, max-age=86400, s-maxage=604800",
    },
  });
}
