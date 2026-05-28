"use client";

import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "system",
      content: "Welcome to NOTEacher. Upload an equation or ask a question.",
    },
  ]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // 1. Instantly update UI with User's message
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");

    // 2. Add a temporary loading state
    setMessages((prev) => [
      ...prev,
      { role: "system", content: "Thinking..." },
    ]);

    try {
      // 3. Fire the request to our FastAPI backend from Phase 4
      const response = await fetch("http://127.0.0.1:8000/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ question: input }),
      });

      const data = await response.json();

      // 4. Remove loading state and show AI response
      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg.content !== "Thinking...");
        return [...filtered, { role: "ai", content: data.answer }];
      });
    } catch (error) {
      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg.content !== "Thinking...");
        return [
          ...filtered,
          { role: "system", content: "Error connecting to backend." },
        ];
      });
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 bg-slate-950 text-slate-200 font-sans">
      <div className="z-10 max-w-3xl w-full flex-col flex gap-4 h-[80vh] overflow-y-auto border border-slate-800 rounded-xl p-6 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="border-b border-slate-800 pb-4 mb-4">
          <h1 className="text-2xl font-bold text-blue-500 tracking-tight">
            NOTEacher Engine
          </h1>
          <p className="text-sm text-slate-400">Agentic Multimodal Assistant</p>
        </div>

        {/* Chat Log */}
        <div className="flex flex-col gap-4 flex-grow">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg max-w-[80%] ${
                msg.role === "user"
                  ? "bg-blue-600 text-white self-end"
                  : msg.role === "system"
                    ? "bg-slate-800 text-slate-400 self-center text-sm border border-slate-700"
                    : "bg-slate-800 text-slate-200 self-start border border-slate-700"
              }`}
            >
              {msg.content}
            </div>
          ))}
        </div>
      </div>

      {/* Input Field */}
      <div className="flex w-full max-w-3xl mt-6 gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask a question..."
          className="flex-grow p-4 rounded-lg bg-slate-900 border border-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
        />
        <button
          onClick={handleSend}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors"
        >
          Send
        </button>
      </div>
    </main>
  );
}
