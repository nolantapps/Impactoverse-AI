"use client";
import { useState } from "react";
import { MessageSquarePlus, Send } from "lucide-react";

function Chat() {
  const [chats, setChats] = useState([
    {
      id: "1",
      title: "Welcome Chat",
      messages: [
        {
          id: "m1",
          text: "Hello! I'm your chatbot. How can I help you?",
          sender: "bot",
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
    },
  ]);

  const [activeChatId, setActiveChatId] = useState("1");
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const activeChat = chats.find((chat) => chat.id === activeChatId);

  const handleNewChat = () => {
    const newChat = {
      id: Date.now().toString(),
      title: `Chat ${chats.length + 1}`,
      messages: [
        {
          id: "m" + Date.now(),
          text: "Hello! I'm your chatbot. How can I help you?",
          sender: "bot",
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
    };
    setChats([newChat, ...chats]);
    setActiveChatId(newChat.id);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !activeChat) return;

    const userMessage = {
      id: "m" + Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === activeChatId
          ? {
              ...chat,
              messages: [...chat.messages, userMessage],
              title:
                chat.messages.length === 1
                  ? inputMessage.slice(0, 30)
                  : chat.title,
            }
          : chat
      )
    );

    setInputMessage("");
    setIsTyping(true);

    setTimeout(() => {
      const botMessage = {
        id: "m" + Date.now(),
        text: "Hello! I'm your chatbot. How can I help you?",
        sender: "bot",
        timestamp: new Date(),
      };

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === activeChatId
            ? { ...chat, messages: [...chat.messages, botMessage] }
            : chat
        )
      );
      setIsTyping(false);
    }, 800);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-lg">
        <div className="p-4 border-b border-slate-200">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
          >
            <MessageSquarePlus size={20} />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-all duration-200 ${
                  chat.id === activeChatId
                    ? "bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 shadow-sm"
                    : "hover:bg-slate-50"
                }`}
              >
                <div className="font-medium text-slate-800 truncate">
                  {chat.title}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {chat.messages.length} message
                  {chat.messages.length !== 1 ? "s" : ""}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-800">
                {activeChat.title}
              </h2>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {activeChat.messages.map((message) => (
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

            {/* Input Area */}
            <div className="bg-white border-t border-slate-200 p-4 shadow-lg">
              <div className="max-w-4xl mx-auto flex gap-3">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 font-medium"
                >
                  <Send size={18} />
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-slate-400 text-lg">
              Select a chat to start messaging
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;
