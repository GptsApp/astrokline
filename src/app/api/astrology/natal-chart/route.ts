import { NextResponse } from "next/server";
import { calculateNatalChart, timeSlotToHourMinute, type BirthInput } from "@/lib/astrology/engine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { year, month, day, timeSlot, timezone, latitude, longitude } = body;

    if (!year || !month || !day || !latitude || !longitude) {
      return NextResponse.json(
        { error: "Missing required fields: year, month, day, latitude, longitude" },
        { status: 400 }
      );
    }

    // Parse time slot to hour/minute
    const { hour, minute } = timeSlotToHourMinute(timeSlot || "unknown");

    const input: BirthInput = {
      year: Number(year),
      month: Number(month),
      day: Number(day),
      hour,
      minute,
      timezone: Number(timezone) || 0,
      latitude: Number(latitude),
      longitude: Number(longitude),
    };

    const chart = await calculateNatalChart(input);

    return NextResponse.json({ success: true, data: chart });
  } catch (error: any) {
    console.error("Natal Chart API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to calculate natal chart" },
      { status: 500 }
    );
  }
}
