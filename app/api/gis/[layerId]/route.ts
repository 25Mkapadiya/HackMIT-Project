import { NextRequest, NextResponse } from "next/server";
import { WA_LAYER_FETCHERS, type Bbox } from "@/lib/gis/layerFetchers";

export const dynamic = "force-dynamic";

function parseBbox(param: string | null): Bbox | null {
  if (!param) return null;
  const parts = param.split(",").map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return null;
  return parts as Bbox;
}

export async function GET(req: NextRequest, { params }: { params: { layerId: string } }) {
  const layerId = params.layerId;
  const fetcher = WA_LAYER_FETCHERS[layerId];

  if (!fetcher) {
    return NextResponse.json({ error: `Unknown layer id: ${layerId}` }, { status: 404 });
  }

  const bbox = parseBbox(req.nextUrl.searchParams.get("bbox"));
  if (!bbox) {
    return NextResponse.json(
      { error: "Missing or invalid bbox query param. Expected bbox=xmin,ymin,xmax,ymax" },
      { status: 400 }
    );
  }

  try {
    const fc = await fetcher(bbox);
    return NextResponse.json(fc, {
      headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
    });
  } catch (err) {
    console.error(`[api/gis/${layerId}] fetch failed:`, err);
    return NextResponse.json(
      { type: "FeatureCollection", features: [], error: "Upstream data source unavailable" },
      { status: 200 }
    );
  }
}
