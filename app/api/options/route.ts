import { NextRequest, NextResponse } from "next/server";
import { fetchAllOptions } from "@/lib/exchanges";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const assetParam = request.nextUrl.searchParams.get("asset");
  const asset = assetParam === "ETH" ? "ETH" : "BTC";

  try {
    const { options, spotPrice, errors, isDemo } = await fetchAllOptions(asset);

    return NextResponse.json(
      { options, spotPrice, errors, isDemo, timestamp: Date.now() },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (err) {
    return NextResponse.json(
      {
        error: String(err),
        options: [],
        spotPrice: 0,
        errors: [],
        isDemo: true,
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}
