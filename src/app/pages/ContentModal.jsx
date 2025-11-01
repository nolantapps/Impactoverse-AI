import { getCookie } from "@/utils/getCookies";
import { useEffect, useRef, useState } from "react";

function ChatArea() {
  // const [messages] = useState([
  //   {
  //     id: "m1",
  //     text: "Hello! I'm your chatbot. How can I help you?",
  //     sender: "bot",
  //     timestamp: new Date(),
  //   },
  //   {
  //     id: "m2",
  //     text: "Tell me about your features.",
  //     sender: "user",
  //     timestamp: new Date(),
  //   },
  //   {
  //     id: "m3",
  //     text: "Sure! I can chat with you, answer questions, and help with tasks.",
  //     sender: "bot",
  //     timestamp: new Date(),
  //   },
  // ]);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [mentorName, setMentorName] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    let interval;
    const fetchChatHistory = async () => {
      try {
        setLoading(true);
        const userId = await getCookie("userId");
        const mentorId = localStorage.getItem("selectedMentorId");
        if (!userId || !mentorId) {
          console.error("Missing userId or mentorId");
          setLoading(false);
          return;
        }
        console.log("Fetching chat for:", { userId, mentorId });
        const mentorResponse = await fetch(`/api/mentor/${mentorId}`);
        const mentorData = await mentorResponse.json();

        if (mentorData.mentor) {
          setMentorName(mentorData.mentor.name || "Chat Area");
        }

        // Fetch chat history
        const chatResponse = await fetch(
          `/api/chat?user_id=${userId}&mentor_id=${mentorId}`
        );
        const chatData = await chatResponse.json();
        if (chatData.data) {
          // Transform messages to match UI format
          const formattedMessages = chatData.data.messages.map(
            (msg, index) => ({
              id: `msg-${index}`,
              text: msg.content,
              sender: msg.role === "user" ? "user" : "mentor",
              timestamp: new Date(msg.timestamp),
            })
          );
          console.log(formattedMessages);

          setMessages(formattedMessages);
          console.log("Loaded messages:", formattedMessages.length);
        }
      } catch (error) {
        console.log(error, "Error");
      }
    };

    fetchChatHistory();
    // this grabs the chat history every 5 seconds. not efficient
    interval = setInterval(() => {
      fetchChatHistory();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col z-10 w-[350px] h-[450px] bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Chat Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-800">{mentorName}</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            } animate-fade-in`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
                message.sender === "user"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-sm"
                  : "bg-white text-slate-800 border border-slate-200 rounded-bl-sm"
              }`}
            >
              <p className="text-sm leading-relaxed">{message.text}</p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-white text-slate-800 border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <span
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></span>
                <span
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></span>
                <span
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatArea;
