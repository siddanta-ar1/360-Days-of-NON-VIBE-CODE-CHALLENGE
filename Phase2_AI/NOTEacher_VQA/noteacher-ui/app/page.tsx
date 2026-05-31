"use client";

import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

export default function Home() {
  const [input, setInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [messages, setMessages] = useState([
    {
      role: "system",
      content: "Welcome to NOTEacher. Upload an equation or ask a question.",
    },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !imageFile) return;

    const userContent = imageFile
      ? `[Attached Image: ${imageFile.name}] ${input}`
      : input;

    // 1. Add User Message and an EMPTY AI message that we will slowly fill up
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userContent },
      { role: "ai", content: "" }, // This empty string is our canvas
    ]);

    setInput("");
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    try {
      const formData = new FormData();
      formData.append("question", input || "What is in this image?");
      if (imageFile) formData.append("image", imageFile);

      // 2. Fetch from a new streaming endpoint on our backend
      const response = await fetch("http://127.0.0.1:8000/ask_stream", {
        method: "POST",
        body: formData,
      });

      if (!response.body)
        throw new Error("ReadableStream not supported in this browser.");

      // 3. THE STREAM READER
      // We grab the raw binary data stream from the network connection
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedResponse = "";

      // 4. THE CONSUMPTION LOOP
      while (true) {
        // Read the next chunk of binary data sent by the Python server
        const { done, value } = await reader.read();

        // If the server closes the connection, the stream is finished
        if (done) break;

        // Decode the binary bytes into a Javascript String
        const textChunk = decoder.decode(value, { stream: true });
        streamedResponse += textChunk;

        // 5. UPDATE REACT STATE IN REAL-TIME
        // We update the VERY LAST message in our array (the empty AI canvas)
        setMessages((prev) => {
          const updatedMessages = [...prev];
          updatedMessages[updatedMessages.length - 1].content =
            streamedResponse;
          return updatedMessages;
        });
      }
    } catch (error) {
      setMessages((prev) => {
        const updatedMessages = [...prev];
        updatedMessages[updatedMessages.length - 1].content =
          "Error connecting to streaming backend.";
        return updatedMessages;
      });
    }
  };
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 bg-slate-950 text-slate-200 font-sans">
      <div className="z-10 max-w-3xl w-full flex-col flex gap-4 h-[75vh] overflow-y-auto border border-slate-800 rounded-xl p-6 bg-slate-900 shadow-2xl">
        <div className="flex flex-col gap-4 flex-grow">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg max-w-[80%] overflow-x-auto ${
                msg.role === "user"
                  ? "bg-blue-600 text-white self-end"
                  : msg.role === "system"
                    ? "bg-slate-800 text-slate-400 self-center text-sm border border-slate-700"
                    : "bg-slate-800 text-slate-200 self-start border border-slate-700 prose prose-invert max-w-none"
              }`}
            >
              {msg.role === "ai" ? (
                // THE RENDERING ENGINE
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  className="text-sm md:text-base leading-relaxed"
                >
                  {msg.content}
                </ReactMarkdown>
              ) : (
                // Users and System messages just get standard text
                msg.content
              )}
            </div>
          ))}
        </div>
      </div>

      {/* The Multimodal Input Console */}
      <div className="w-full max-w-3xl mt-4 flex flex-col gap-2">
        {/* Image Preview Window */}
        {imagePreview && (
          <div className="p-2 bg-slate-800 rounded border border-slate-700 inline-block w-max">
            <img
              src={imagePreview}
              alt="Upload Preview"
              className="h-20 object-contain rounded"
            />
          </div>
        )}

        <div className="flex gap-2 w-full">
          {/* Hidden File Input */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Custom Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg border border-slate-700 transition-colors"
          >
            📸 Attach
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask a question about the image..."
            className="flex-grow p-4 rounded-lg bg-slate-900 border border-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            onClick={handleSend}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}
