import { getCookie } from "@/utils/getCookies";
import { Pinecone } from "@pinecone-database/pinecone";
import { UNSTABLE_REVALIDATE_RENAME_ERROR } from "next/dist/lib/constants";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req, { params }) {
  const { question } = await req.json();

  const cookieStore = await cookies();
  const user_id = cookieStore.get("userId")?.value; // server-side cookie reading
  console.log("Cookie userId:", user_id);

  const mentor_id = await params;

  const embeddingResponse = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: question,
    dimensions: 1024,
  });

  const embedding = embeddingResponse.data[0].embedding;

  const matches = await pc
    .index(process.env.PINECONE_INDEX)
    .namespace(mentor_id.mentorId)
    .query({
      vector: embedding,
      topK: 2,
      includeMetadata: true,
      includeValues: false,
      filter: { user_id },
    });

  const context =
    matches.matches?.map((m) => m.metadata?.chunk_text).join("\n\n") ?? "";
  return NextResponse.json({ context, matches });
}
