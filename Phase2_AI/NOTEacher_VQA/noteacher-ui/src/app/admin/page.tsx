'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Define the structure of a flagged hallucination
type FlaggedMessage = {
  id: string;
  content: string;
  audit_flag: string;
  created_at: string;
  chat_id: string;
};

export default function AdminDashboard() {
  const [flaggedMessages, setFlaggedMessages] = useState<FlaggedMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. FETCH TELEMETRY DATA ON BOOT
  useEffect(() => {
    const fetchDashboardData = async () => {
      // In a real app, you MUST protect this route with an Admin-only RLS policy!
      
      // Fetch messages where the Nightly Auditor detected a hallucination
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .ilike('audit_flag', '%[FAIL]%') // Match any string containing [FAIL]
        .order('created_at', { ascending: false });

      if (data) setFlaggedMessages(data);
      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  // 2. THE TRIAGE FUNCTION
  const dismissFlag = async (messageId: string) => {
    // Optimistic UI update
    setFlaggedMessages(prev => prev.filter(msg => msg.id !== messageId));
    
    // Update the database to mark the hallucination as reviewed by a human
    await supabase
      .from('messages')
      .update({ audit_flag: 'RESOLVED_BY_ADMIN' })
      .eq('id', messageId);
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500 font-mono">Loading Command Center...</div>;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex justify-between items-end border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-red-500 tracking-tight">System Telemetry</h1>
            <p className="text-slate-400 text-sm mt-1">Global Observability & QA Command Center</p>
          </div>
          <div className="text-xs font-mono bg-red-900/20 text-red-400 px-3 py-1 border border-red-900/50 rounded">
            ADMINISTRATOR CLEARANCE
          </div>
        </div>

        {/* KPI Cards (Metrics are mocked for the visual layout) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">Avg TTFT Latency</h3>
            <p className="text-4xl font-bold text-emerald-400 mt-2">142<span className="text-xl text-slate-600">ms</span></p>
            <p className="text-xs text-slate-500 mt-2">Optimal range. WebGL Edge Cache active.</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">Nightly Audits</h3>
            <p className="text-4xl font-bold text-blue-400 mt-2">4,209</p>
            <p className="text-xs text-slate-500 mt-2">Generations reviewed in the last 24h.</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
            <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">Active Hallucinations</h3>
            <p className="text-4xl font-bold text-red-500 mt-2">{flaggedMessages.length}</p>
            <p className="text-xs text-slate-500 mt-2">Require immediate human triage.</p>
          </div>
        </div>

        {/* The QA Triage Queue */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-xl font-bold text-slate-200">Adversarial Audit Queue</h2>
            <p className="text-sm text-slate-500 mt-1">AI outputs flagged by the autonomous Judge pipeline.</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">Timestamp</th>
                  <th className="p-4 font-medium">AI Output (Excerpt)</th>
                  <th className="p-4 font-medium">Judge Critique</th>
                  <th className="p-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-800">
                {flaggedMessages.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">No active hallucinations detected. System nominal.</td>
                  </tr>
                ) : (
                  flaggedMessages.map((msg) => (
                    <tr key={msg.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 text-slate-500 font-mono text-xs whitespace-nowrap">
                        {new Date(msg.created_at).toLocaleString()}
                      </td>
                      <td className="p-4 text-slate-300 max-w-xs truncate">
                        {msg.content}
                      </td>
                      <td className="p-4 text-red-400 font-mono text-xs max-w-sm">
                        {msg.audit_flag}
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => dismissFlag(msg.id)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded text-xs border border-slate-700 transition-colors"
                        >
                          Dismiss / Resolve
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}