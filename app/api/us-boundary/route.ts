import { NextResponse } from "next/server";
import usStates from "../../../reference/nationwide-advisor/public/data/us-states.json";

export async function GET() {
  return NextResponse.json(usStates, {
    headers: {
      "Cache-Control": "public, max-age=86400, s-maxage=604800",
    },
  });
}
