import { Mentor, User } from "@/app/lib/db";
import dbConnect from "@/app/lib/mongodb";
import { getCookie } from "@/utils/getCookies";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = cookies();
  const userId = await cookieStore.get("userId")?.value; // server-side cookie reading
  console.log("Cookie userId:", userId);

  await dbConnect();
  const user = await User.findOne({ uuid: userId });

  try {
    const mentors = await Mentor.find({
      _id: { $in: user.mentor_ids },
    });
    return NextResponse.json(mentors);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
