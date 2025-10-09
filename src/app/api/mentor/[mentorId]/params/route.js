import { Mentor } from "@/app/lib/db";
import dbConnect from "@/app/lib/mongodb";

export async function POST(req, { params }) {
  await dbConnect();
  const id = await params;
  const mentorId = id.mentorId;

  console.log(id);

  const { audience, knowledge, outOfScope, responseStyle } = await req.json();

  try {
    const mentor = await Mentor.findByIdAndUpdate(
      mentorId,
      {
        aiSettings: { audience, knowledge, outOfScope, responseStyle },
      },
      { new: true }
    );

    if (!mentor) {
      return Response.json({ error: "Mentor not found" }, { status: 404 });
    }

    return Response.json({ message: "Parameters saved", mentor });
  } catch (error) {
    console.error("Error updating mentor parameters:", error);
    return Response.json(
      { error: "Failed to save parameters" },
      { status: 500 }
    );
  }
}
