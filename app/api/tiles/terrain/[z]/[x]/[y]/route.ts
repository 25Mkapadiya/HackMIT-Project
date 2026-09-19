import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const USGS_3DEP =
  "https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer/exportImage";

function tileBounds3857(z: number, x: number, y: number) {
  const originShift = 20037508.342789244;
  const tileCount = 2 ** z;
  const tileSpan = (originShift * 2) / tileCount;

  const xmin = -originShift + x * tileSpan;
  const xmax = xmin + tileSpan;
  const ymax = originShift - y * tileSpan;
  const ymin = ymax - tileSpan;

  return [xmin, ymin, xmax, ymax] as const;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { z: string; x: string; y: string } }
) {
  const z = Number(params.z);
  const x = Number(params.x);
  const y = Number(params.y);

  if (
    !Number.isInteger(z) ||
    !Number.isInteger(x) ||
    !Number.isInteger(y) ||
    z < 4 ||
    z > 15 ||
    x < 0 ||
    y < 0 ||
    x >= 2 ** z ||
    y >= 2 ** z
  ) {
    return new NextResponse(null, { status: 404 });
  }

  const [xmin, ymin, xmax, ymax] = tileBounds3857(z, x, y);
  const url = new URL(USGS_3DEP);
  url.searchParams.set("bbox", `${xmin},${ymin},${xmax},${ymax}`);
  url.searchParams.set("bboxSR", "3857");
  url.searchParams.set("imageSR", "3857");
  url.searchParams.set("size", "256,256");
  url.searchParams.set("format", "png32");
  url.searchParams.set("transparent", "true");
  url.searchParams.set(
    "renderingRule",
    JSON.stringify({ rasterFunction: "Hillshade Multidirectional" })
  );
  url.searchParams.set("f", "image");

  try {
    const upstream = await fetch(url, {
      headers: { Accept: "image/png,image/*;q=0.8" },
      next: { revalidate: 86400 },
    });

    const contentType = upstream.headers.get("content-type") ?? "";
    if (!upstream.ok || !contentType.startsWith("image/")) {
      return new NextResponse(null, { status: 204 });
    }

    const image = await upstream.arrayBuffer();
    return new NextResponse(image, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
