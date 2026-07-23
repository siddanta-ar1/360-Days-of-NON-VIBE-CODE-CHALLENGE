// src/components/ChatStream.tsx
'use client';

import React, { useState } from 'react';

export function ChatStream() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const handleStartStream = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isStreaming) return;

    setIsStreaming(true);
    setResponse(''); // Clear previous response

    try:
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, user_id: 'user_123' }),
      });

      if (!res.ok || !res.body) throw new Error('Network stream failed.');

      // 1. ATTACH THE STREAM READER
      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;

      // 2. CONTINUOUS INGESTION LOOP
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (done) break;

        // Decode the raw Uint8Array byte chunk into an ASCII/UTF-8 string
        const chunkString = decoder.decode(value, { stream: true });

        // SSE chunks can arrive batched together, split by line breaks
        const lines = chunkString.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.replace('data: ', '').trim();
            if (!jsonStr) continue;

            try {
              const parsed = JSON.parse(jsonStr);
              if (parsed.error) {
                console.error("Stream Error:", parsed.error);
                break;
              }
              if (parsed.done) {
                done = true;
                break;
              }
              // 3. APPEND TOKEN TO DOM IN REAL-TIME
              if (parsed.token) {
                setResponse((prev) => prev + parsed.token);
              }
            } catch (err) {
              // Ignore partial JSON splits across packet boundaries
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming fatal error:', error);
      setResponse((prev) => prev + '\n[Connection Lost]');
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col max-w-2xl mx-auto p-6 bg-gray-900 text-white rounded-xl">
      <div className="min-h-[200px] mb-4 p-4 bg-gray-950 rounded-lg font-mono text-sm whitespace-pre-wrap leading-relaxed">
        {response || (isStreaming ? '⚡ Establishing neural stream...' : 'Ask a question to stream tokens...')}
      </div>
      
      <form onSubmit={handleStartStream} className="flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Explain differential equations..."
          disabled={isStreaming}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={isStreaming}
          className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {isStreaming ? 'Streaming...' : 'Send'}
        </button>
      </form>
    </div>
  );
}