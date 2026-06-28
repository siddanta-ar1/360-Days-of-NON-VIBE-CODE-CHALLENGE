// src/app/admin/dashboard/page.tsx
import { createServerClient } from '@supabase/ssr';
import { UsageChart } from './UsageChart'; // We will build this next

export default async function AdminDashboard() {
  // 1. SECURE SERVER-SIDE FETCH
  // Assume we have a function that aggregates daily token usage from Supabase
  const aggregatedData = [
    { date: 'Jun 22', tokens: 12000, users: 150 },
    { date: 'Jun 23', tokens: 18000, users: 210 },
    { date: 'Jun 24', tokens: 25000, users: 340 },
    { date: 'Jun 25', tokens: 22000, users: 310 },
    { date: 'Jun 26', tokens: 45000, users: 600 },
    { date: 'Jun 27', tokens: 85000, users: 1100 }, // A viral spike!
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">System Telemetry</h1>
      
      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* KPI Cards */}
        <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
          <p className="text-gray-400 text-sm">Total Active Users</p>
          <p className="text-3xl font-bold text-white">1,100</p>
        </div>
        <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
          <p className="text-gray-400 text-sm">API Token Burn (24h)</p>
          <p className="text-3xl font-bold text-red-400">85,000</p>
        </div>
        <div className="p-6 bg-gray-900 rounded-xl border border-gray-800">
          <p className="text-gray-400 text-sm">System Status</p>
          <p className="text-3xl font-bold text-emerald-400">Nominal</p>
        </div>
      </div>

      {/* The Visualizer */}
      <div className="p-6 bg-gray-900 rounded-xl border border-gray-800 h-96">
        <h2 className="text-xl font-semibold mb-6">Token Burn vs User Growth</h2>
        <UsageChart data={aggregatedData} />
      </div>
    </div>
  );
}