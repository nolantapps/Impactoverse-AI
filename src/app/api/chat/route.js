import { NextResponse } from "next/server";

import dbConnect from "@/app/lib/mongodb"; //DB connection
import { ChatHistory } from "@/app/lib/db";

// GET - Fetch chat history for a user-mentor pair
export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get("user_id");
    const mentor_id = searchParams.get("mentor_id");

    if (!user_id || !mentor_id) {
      return NextResponse.json(
        { error: "user_id and mentor_id are required" },
        { status: 400 }
      );
    }

    let chat = await ChatHistory.findOne({ user_id, mentor_id });

    // If no chat exists, create one
    if (!chat) {
      chat = await ChatHistory.create({
        user_id,
        mentor_id,
        messages: [],
      });
    }

    return NextResponse.json({ success: true, data: chat }, { status: 200 });
  } catch (error) {
    console.error("Error fetching chat:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Add a message to chat history
export async function POST(request) {
  try {
    await dbConnect();

    const { user_id, mentor_id, role, content } = await request.json();

    if (!user_id || !mentor_id || !role || !content) {
      return NextResponse.json(
        { error: "user_id, mentor_id, role, and content are required" },
        { status: 400 }
      );
    }

    const newMessage = {
      role,
      content,
      timestamp: new Date(),
    };

    // Use findOneAndUpdate with upsert to create chat if it doesn't exist
    const chat = await ChatHistory.findOneAndUpdate(
      { user_id, mentor_id },
      {
        $push: { messages: newMessage },
        $set: { lastMessageAt: new Date() },
      },
      {
        new: true, // Return updated document
        upsert: true, // Create if doesn't exist
      }
    );

    return NextResponse.json(
      { success: true, data: chat, message: "Message added successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding message:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
