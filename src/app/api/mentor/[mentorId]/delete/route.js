import { Document, Mentor } from "@/app/lib/db";
import dbConnect from "@/app/lib/mongodb";
import { Pinecone } from "@pinecone-database/pinecone";
import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const id = await params;
    const mentor_id = id.mentorId;

    // deleteing mentor
    await Mentor.findByIdAndDelete(mentor_id);
    // deleteing all the related document of the mentor
    await Document.deleteMany({
      mentor_id: mentor_id,
    });
    // deletes all the vector embeddings from vector db
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const index = pc.index(process.env.PINECONE_INDEX);
    const namespace = await index.deleteNamespace(mentor_id);
    console.log(namespace);
    return NextResponse.json({ message: "mentor and related data deleted" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
