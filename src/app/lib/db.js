import mongoose, { Schema } from "mongoose";
import crypto from "node:crypto";
const UUID = Schema.Types.UUID;

const UserSchema = new mongoose.Schema(
  {
    uuid: { type: String, required: true, unique: true },
    email: { type: String, unique: true },
    username: { type: String, unique: true },
    mentor_ids: {
      type: [{ type: String, ref: "Mentor" }],
      default: [],
    },
  },
  { timestamps: true }
);

const MentorSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true, ref: "User", index: true },
    document_ids: { type: [{ type: String, ref: "Document" }], default: [] },
    name: { type: String },
    description: { type: String },
    aiSettings: {
      audience: { type: String, default: "adults" },
      knowledge: { type: String, default: "docs-only" },
      outOfScope: { type: String, default: "say-idk" },
      responseStyle: { type: String, default: "short" },
    },
  },
  { timestamps: true }
);

const DocumentSchema = new mongoose.Schema(
  {
    mentor_id: { type: String, ref: "Mentor" },
    generatedBy: { type: String, ref: "User" },
    fileName: { type: String },
    chunk_count: { type: Number },
  },
  { timestamps: true }
);

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "mentor"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const chatHistorySchema = new mongoose.Schema(
  {
    mentor_id: {
      type: String, // you’re using string-based ids
      ref: "Mentor",
      required: true,
    },
    user_id: {
      type: String,
      ref: "User",
      required: true,
    },
    messages: [messageSchema],
  },
  { timestamps: true }
);

// Ensure 1 chat per user-mentor pair
chatHistorySchema.index({ user_id: 1, mentor_id: 1 }, { unique: true });

export const ChatHistory =
  mongoose.models.ChatHistory ??
  mongoose.model("ChatHistory", chatHistorySchema);

export const User = mongoose.models.User ?? mongoose.model("User", UserSchema);
export const Mentor =
  mongoose.models.Mentor ?? mongoose.model("Mentor", MentorSchema);

export const Document =
  mongoose.models.Document ?? mongoose.model("Document", DocumentSchema);
console.log("documnets");
