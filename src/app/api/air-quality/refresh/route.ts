import { NextResponse } from "next/server";

import { malaysiaStates } from "@/app/(main)/dashboard/air-quality/_components/malaysia-states";
import { fetchAllStatesAqi } from "@/app/(main)/dashboard/air-quality/_components/waqi-service";

export const revalidate = 0;

export async function GET() {
  try {
    const results = await fetchAllStatesAqi(malaysiaStates);
    return NextResponse.json({ results, updatedAt: new Date().toISOString() });
  } catch {
    return NextResponse.json({ error: "Failed to fetch air quality data" }, { status: 500 });
  }
}
