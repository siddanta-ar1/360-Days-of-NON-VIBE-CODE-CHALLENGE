// src/app/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { telemetry } from '@/lib/telemetry';
import type { User } from '@supabase/supabase-js';

// Markdown & Math Rendering
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

// Type definitions for the chat state
type Message = { role: string; content: string };

export default function Home() {
  // Authentication State
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(true);

  // Chat State
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Multimodal State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. BOOT SEQUENCE: AUTH & RLS HISTORY FETCHING
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const loadHistory = async () => {
      telemetry.log('INFO', 'SUPABASE_DB', 'Fetching user chat history via RLS...');
      
      const { data: chatData } = await supabase
        .from('chats')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1);

      if (chatData && chatData.length > 0) {
        const chatId = chatData[0].id;
        setCurrentChatId(chatId);
        
        const { data: messageData } = await supabase
          .from('messages')
          .select('role, content')
          .eq('chat_id', chatId)
          .order('created_at', { ascending: true });

        if (messageData) setMessages(messageData);
      } else {
        const { data: newChat } = await supabase
          .from('chats')
          .insert([{ user_id: user.id, title: 'Session 1' }])
          .select()
          .single();
          
        if (newChat) setCurrentChatId(newChat.id);
      }
    };

    loadHistory();
  }, [user]);

  // 2. AUTHENTICATION HANDLERS
  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) telemetry.log('ERROR', 'SUPABASE_DB', error.message);
    else alert('Success! Check your email.');
  };

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) telemetry.log('ERROR', 'SUPABASE_DB', error.message);
  };

  const handleLogout = async () => await supabase.auth.signOut();

  // 3. MULTIMODAL ATTACHMENTS
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      telemetry.log('INFO', 'FRONTEND_UI', 'Multimodal payload attached.', { size: file.size });
    }
  };

  // 4. THE CORE EXECUTION LOOP (Streaming & Telemetry)
  const handleSend = async () => {
    if (!input.trim() && !imageFile) return;

    const userContent = imageFile ? `[Attached Image: ${imageFile.name}]\n${input}` : input;
    
    // Optimistic UI Update
    setMessages((prev) => [
      ...prev, 
      { role: 'user', content: userContent },
      { role: 'ai', content: '' } // Empty canvas for the SSE stream
    ]);

    // Save user message to PostgreSQL
    if (currentChatId) {
      await supabase.from('messages').insert([
        { chat_id: currentChatId, role: 'user', content: userContent }
      ]);
    }
    
    // Clear Input State
    setInput('');
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    // --- TELEMETRY TRACING START ---
    const networkTraceId = telemetry.startTrace('NETWORK_HANDSHAKE');
    const ttftTraceId = telemetry.startTrace('AI_TIME_TO_FIRST_TOKEN');

    try {
      const formData = new FormData();
      formData.append('question', input || "Analyze this image.");
      if (imageFile) formData.append('image', imageFile);

      // Replace with your actual Cloud Run API
      const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/ask_stream';

      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        body: formData,
      });

      telemetry.endTrace(networkTraceId, 'NETWORK', { statusCode: response.status });

      if (!response.body) throw new Error('ReadableStream not supported.');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedResponse = '';
      let isFirstToken = true;

      // Inter-token latency tracking
      let tokenStartTime = performance.now();
      let totalTokenDelay = 0;
      let tokenCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const textChunk = decoder.decode(value, { stream: true });
        streamedResponse += textChunk;
        tokenCount++;

        // --- RESOLVE TTFT TRACE ---
        if (isFirstToken && streamedResponse.length > 0) {
          telemetry.endTrace(ttftTraceId, 'AI_ENGINE');
          isFirstToken = false;
        }

        const currentTokenTime = performance.now();
        totalTokenDelay += (currentTokenTime - tokenStartTime);
        tokenStartTime = currentTokenTime;

        // Update React State
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].content = streamedResponse;
          return updated;
        });
      }

      // Save final AI generation to PostgreSQL
      if (currentChatId) {
        await supabase.from('messages').insert([
          { chat_id: currentChatId, role: 'ai', content: streamedResponse }
        ]);
      }

      if (tokenCount > 0) {
        telemetry.log('INFO', 'AI_ENGINE', 'Streaming sequence completed.', {
          avgTokenGenerationMs: totalTokenDelay / tokenCount,
          totalTokens: tokenCount,
        });
      }

    } catch (error) {
      telemetry.log('ERROR', 'FRONTEND_UI', 'Inference pipeline failure.', { error: String(error) });
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].content = '**SYSTEM ERROR:** Connection to Edge/Cloud node failed.';
        return updated;
      });
    }
  };

  // 5. RENDER LIFECYCLE
  if (authLoading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500 font-mono">Initializing System...</div>;

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-8 font-sans">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-xl shadow-2xl flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-blue-500 text-center mb-4 tracking-tight">NOTEacher Engine</h1>
          <input 
            type="email" placeholder="System Email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="p-3 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:border-blue-500 outline-none transition-colors"
          />
          <input 
            type="password" placeholder="Passkey" value={password} onChange={(e) => setPassword(e.target.value)}
            className="p-3 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:border-blue-500 outline-none transition-colors"
          />
          <div className="flex gap-2 mt-4">
            <button onClick={handleLogin} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded transition-colors">Authenticate</button>
            <button onClick={handleSignUp} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded transition-colors">Register</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8 bg-slate-950 text-slate-200 font-sans">
      <div className="w-full max-w-4xl flex justify-between items-center mb-4">
        <div className="text-xs text-slate-500 font-mono tracking-widest">
          NODE: <span className="text-blue-500">{user.email}</span>
        </div>
        <button onClick={handleLogout} className="text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-400 px-4 py-2 border border-slate-800 rounded transition-colors">TERMINATE SESSION</button>
      </div>
      
      {/* Chat Interface */}
      <div className="z-10 max-w-4xl w-full flex-col flex gap-4 h-[75vh] overflow-y-auto border border-slate-800 rounded-xl p-4 md:p-6 bg-slate-900 shadow-2xl">
        <div className="flex flex-col gap-6 flex-grow">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`p-4 rounded-xl max-w-[85%] overflow-x-auto ${
                msg.role === 'user' 
                  ? 'bg-blue-600/20 border border-blue-500/30 text-blue-50 self-end' 
                  : 'bg-slate-950 border border-slate-800 text-slate-300 self-start prose prose-invert prose-blue max-w-none'
              }`}
            >
              {msg.role === 'ai' ? (
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  className="text-sm md:text-base leading-relaxed"
                >
                  {msg.content}
                </ReactMarkdown>
              ) : (
                <span className="text-sm md:text-base whitespace-pre-wrap">{msg.content}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Input Console */}
      <div className="w-full max-w-4xl mt-4 flex flex-col gap-2">
        {imagePreview && (
          <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 inline-block w-max">
            <img src={imagePreview} alt="Payload Preview" className="h-20 object-contain rounded" />
          </div>
        )}
        
        <div className="flex gap-2 w-full">
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
          />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-4 bg-slate-900 hover:bg-slate-800 text-slate-400 font-bold rounded-xl border border-slate-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Initialize query..."
            className="flex-grow p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
          <button 
            onClick={handleSend}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-900/20"
          >
            Execute
          </button>
        </div>
      </div>
    </main>
  );
}