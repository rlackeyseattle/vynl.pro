import { NextResponse } from "next/server";
import { discoverTargets } from "@/lib/xai";

export async function POST(req: Request) {
  try {
    const { region, type } = await req.json();

    if (!region || !type) {
      return NextResponse.json({ error: "Region and Type are required" }, { status: 400 });
    }

    const targets = await discoverTargets(region, type as any);

    return NextResponse.json({ targets });
  } catch (error) {
    console.error("Discovery API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
