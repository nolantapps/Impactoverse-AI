"use client";
import { useState } from "react";
import { useAITeacher } from "@/app/hooks/useAITeacher";
import { useTranscriptStore } from "@/app/hooks/useTranscriptStore";
import VoiceRecord from "./VoiceRecord";
import { getCookie } from "@/utils/getCookies";

export const TypingBox = () => {
  const [language, setLanguage] = useState("English");
  const askAI = useAITeacher((state) => state.askAI);
  const loading = useAITeacher((state) => state.loading);
  const { transcript } = useTranscriptStore();
  const setTranscript = useTranscriptStore((state) => state.setTranscript);
  // const [question, setQuestion] = useState("");

  // this function saves the users question to mongodb. the response from the ai is saved. the code will be in useAITeacher.jsx
  const saveChatMessage = async (role, content) => {
    try {
      console.log("Got into savemesage function");

      // getting user_id from cookies-browser
      const user_id = await getCookie("userId");
      // getting mentor id from localstorage in the browser
      const mentorId = localStorage.getItem("selectedMentorId");

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/mentor/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user_id,
          mentor_id: mentorId,
          role: role,
          content: content,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        console.error("Failed to save message:", data.error);
      }

      return data;
    } catch (error) {
      console.error("Error saving message:", error);
      throw error;
    }
  };
  // this where questions get passed to the LLM
  const ask = () => {
    askAI(transcript);
    const userQuestion = transcript;
    saveChatMessage("user", userQuestion);
    setTranscript("");
  };
  return (
    <div className="z-10 relative w-lg flex space-y-6 flex-col bg-gradient-to-tr  from-slate-300/30 via-gray-400/30 to-slate-600-400/30 p-4  backdrop-blur-md rounded-xl border-slate-100/30 border">
      <div className="relative">
        <div>
          <h2 className="text-white font-bold text-xl">Expert Session</h2>
          <p className="text-white/65">Ask your guide a question</p>
          <div className="absolute top-0 right-0 p-0 m-0">
            <VoiceRecord />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center">
          <span className="relative flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
          </span>
        </div>
      ) : (
        <div className="gap-3 flex">
          <input
            className="focus:outline focus:outline-white/80 flex-grow bg-slate-800/60 p-2 px-4 rounded-full text-white placeholder:text-white/50 shadow-inner shadow-slate-900/60"
            placeholder="Ask a question"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                ask();
              }
            }}
          />

          <button
            className="bg-slate-100/20 p-2 px-6 rounded-full text-white"
            onClick={ask}
          >
            Ask
          </button>
        </div>
      )}
    </div>
  );
};
