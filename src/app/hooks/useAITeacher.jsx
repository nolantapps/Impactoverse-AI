import { getCookie } from "@/utils/getCookies";

const { create } = require("zustand");
const teachers = ["Abbi", "Alfie"];

export const useAITeacher = create((set, get) => ({
  messages: [],
  currentMessages: null,

  teacher: teachers[0],
  setTeacher: (teacher) => {
    set(() => ({
      teacher,
      messages: get().messages.map((message) => {
        message.audioPlayer = null; // New teacher, new Voice
        return message;
      }),
    }));
  },

  // NEW: mentorId stored in the client state
  mentorId: null,
  setMentorId: (mentorId) => {
    set(() => ({ mentorId }));
  },

  classroom: "default",
  setClassroom: (classroom) => {
    set(() => ({
      classroom,
    }));
  },
  loading: false,

  askAI: async (question, opts = {}) => {
    if (!question) return;

    const message = {
      question,
      id: get().messages.length,
    };

    set(() => ({ loading: true }));

    try {
      // Resolve mentorId: prefer store -> fallback to localStorage
      const mentorId =
        get().mentorId ?? localStorage.getItem("selectedMentorId");
      // optional user_id (if you have auth), otherwise null

      const user_id = await getCookie("userId");
      console.log("User ID: ", user_id);

      let context = "";
      // If we have a mentorId, first query Pinecone endpoint to get context
      if (mentorId) {
        const contextRes = await fetch(`/api/mentor/${mentorId}/query`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question }),
        });

        if (contextRes.ok) {
          const ctxJson = await contextRes.json();

          console.log("Context from server:", ctxJson);

          context = ctxJson.context || "";
        } else {
          console.warn("Context fetch failed:", await contextRes.text());
        }
      } else {
        console.warn("No mentorId found for context lookup.");
      }

      // Compose prompt: context (if any) + user question
      const composed =
        (context ? `Context:\n${context}\n\n` : "") + `User: ${question}`;
      // Grab mentor details from /api/mentor/[mentorId]/route.js
      const mentor = await fetch(`/api/mentor/${mentorId}`);
      const mentorData = await mentor.json();
      console.log("mentor is -----> ", mentorData.mentor);

      const aiSettings = mentorData?.mentor?.aiSettings;
      const { audience, knowledge, outOfScope, responseStyle } = aiSettings;

      // Now call LLM (your existing endpoint)
      const aiRes = await fetch(
        `/api/ai?question=${encodeURIComponent(
          composed
        )}&audience=${audience}&knowledge=${knowledge}&outOfScope=${outOfScope}&responseStyle=${responseStyle}`
      );
      const aiJson = await aiRes.json();

      message.answer = aiJson.message ?? aiJson?.response ?? "No response";

      console.log("Question: ", question, "Answer: ", message.answer);

      // this saves the response from AI to mongodb
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/mentor/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user_id,
          mentor_id: mentorId,
          role: "mentor",
          content: message.answer,
        }),
      });

      // update store
      set(() => ({ currentMessages: message }));
      set((state) => ({
        messages: [...state.messages, message],
        loading: false,
      }));

      // play TTS
      get().playMessage(message);
    } catch (err) {
      console.error("askAI error:", err);
      set(() => ({ loading: false }));
    }
  },

  playMessage: async (message) => {
    set(() => ({ currentMessages: message }));
    set(() => ({ loading: true }));

    const audioRes = await fetch(
      `/api/tts?teacher=${get().teacher}&text=${encodeURIComponent(
        message.answer
      )}`
    );

    const audio = await audioRes.blob();
    const visemes = JSON.parse(await audioRes.headers.get("visemes"));
    const audioUrl = URL.createObjectURL(audio);
    const audioPlayer = new Audio(audioUrl);

    message.visemes = visemes;
    message.audioPlayer = audioPlayer;
    message.audioPlayer.onended = () => {
      set(() => ({ currentMessages: null }));
      set(() => ({
        loading: false,
        messages: get().messages.map((m) =>
          m.id === message.id ? message : m
        ),
      }));
    };
    message.audioPlayer.currentTime = 0;
    message.audioPlayer.play();
  },

  stopMessage: (message) => {
    message.audioPlayer.pause();
    set(() => ({ currentMessages: null }));
  },
}));

export { teachers };
