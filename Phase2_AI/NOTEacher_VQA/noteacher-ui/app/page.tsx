'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(true);

  // 1. CHECK SESSION ON BOOT
  useEffect(() => {
    // Check if the user is already logged in (token stored in local storage)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    // Listen for login/logout events dynamically
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. AUTHENTICATION HANDLERS
  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert('Success! Check your email to verify your account.');
  };

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (authLoading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading Engine...</div>;

  // 3. THE LOGIN SCREEN (Unauthenticated State)
  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-8">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-xl shadow-2xl flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-blue-500 text-center mb-4">NOTEacher Login</h1>
          <input
            type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="p-3 bg-slate-950 border border-slate-700 rounded text-white focus:border-blue-500 outline-none"
          />
          <input
            type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="p-3 bg-slate-950 border border-slate-700 rounded text-white focus:border-blue-500 outline-none"
          />
          <div className="flex gap-2 mt-4">
            <button onClick={handleLogin} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded transition-colors">Log In</button>
            <button onClick={handleSignUp} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded transition-colors">Sign Up</button>
          </div>
        </div>
      </main>
    );
  }

  // 4. THE AI INTERFACE (Authenticated State)
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 bg-slate-950 text-slate-200">
      <div className="w-full max-w-3xl flex justify-between items-center mb-4">
        <div className="text-sm text-slate-400">Authenticated as: <span className="text-blue-400 font-bold">{user.email}</span></div>
        <button onClick={handleLogout} className="text-xs bg-red-900/50 hover:bg-red-900 text-red-200 px-3 py-1 border border-red-800 rounded transition-colors">Logout</button>
      </div>

      {/* (Insert your massive Chat UI Box and Input from Day 150 here) */}
      <div className="z-10 max-w-3xl w-full flex-col flex gap-4 h-[75vh] border border-slate-800 rounded-xl p-6 bg-slate-900 shadow-2xl items-center justify-center">
        <h2 className="text-xl text-slate-500">Secure AI Session Initialized.</h2>
      </div>
    </main>
  );
}
