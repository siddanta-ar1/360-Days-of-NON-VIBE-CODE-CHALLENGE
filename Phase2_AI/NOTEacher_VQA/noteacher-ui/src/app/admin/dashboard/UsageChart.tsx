// src/app/admin/dashboard/UsageChart.tsx
'use client'; // Recharts requires the client environment to render interactive SVGs

import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart 
} from 'recharts';

interface ChartProps {
  data: { date: string; tokens: number; users: number }[];
}

export function UsageChart({ data }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        {/* The Grid */}
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
        
        {/* The Axes */}
        <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
        <YAxis yAxisId="left" stroke="#F87171" tick={{ fill: '#9CA3AF' }} />
        <YAxis yAxisId="right" orientation="right" stroke="#60A5FA" tick={{ fill: '#9CA3AF' }} />
        
        {/* Interactive Hover */}
        <Tooltip 
          contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }}
          itemStyle={{ color: '#fff' }}
        />
        
        {/* The Data Lines */}
        <Area yAxisId="left" type="monotone" dataKey="tokens" stroke="#F87171" fill="#7f1d1d" fillOpacity={0.3} name="Tokens Burned" />
        <Line yAxisId="right" type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={3} name="Active Users" />
      </AreaChart>
    </ResponsiveContainer>
  );
}