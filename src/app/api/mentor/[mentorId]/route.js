import { Mentor } from "@/app/lib/db";
import dbConnect from "@/app/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const id = await params;
    const mentorId = id.mentorId;

    if (!mentorId) {
      return NextResponse.json({ error: "mentorId required" }, { status: 400 });
    }

    const mentor = await Mentor.findById(mentorId);
    console.log(mentor);

    if (!mentor) {
      return NextResponse.json(
        { error: "mentor from db not recieved" },
        { status: 404 }
      );
    }

    return NextResponse.json({ mentor });
  } catch (error) {
    console.error("Error fetching mentor:", error);
    return NextResponse.json(
      { error: "Failed to fetch mentor" },
      { status: 500 }
    );
  }
}
