// src/app/api/admin/export/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  // 1. STRICT AUTHORIZATION (Never trust unauthenticated exports)
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() } } }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Validate Admin Role (Hardcoded email for demonstration)
  if (!user || user.email !== 'admin@yourdomain.com') {
    return new NextResponse('Unauthorized access', { status: 403 });
  }

  try {
    // 2. FETCH THE RAW DATA
    // In production, this pulls directly from your Supabase table
    /*
    const { data: users, error } = await supabase.from('profiles').select('id, email, role, created_at');
    if (error) throw error;
    */
   
    // Mocking the database fetch for the architecture example
    const users = [
      { id: 'usr_1', email: 'alice@math.com', role: 'premium', created_at: '2026-06-25' },
      { id: 'usr_2', email: 'bob@science.com', role: 'free', created_at: '2026-06-26' },
      { id: 'usr_3', email: 'charlie@school.edu', role: 'premium', created_at: '2026-06-27' }
    ];

    // 3. THE CSV PARSER
    // Extract the keys for the top header row
    const headers = ['User ID', 'Email', 'Subscription Tier', 'Join Date'];
    
    // Map the JSON objects into comma-separated strings
    const csvRows = users.map(user => 
      `"${user.id}","${user.email}","${user.role}","${user.created_at}"`
    );

    // Join the headers and the rows with a standard line break (\n)
    const csvString = [headers.join(','), ...csvRows].join('\n');

    // 4. HTTP PROTOCOL MANIPULATION
    // We force the browser to treat this string as a downloadable file
    return new NextResponse(csvString, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="NOTEacher_Users_${new Date().toISOString().split('T')[0]}.csv"`,
        'Cache-Control': 'no-cache' // Ensure they always get the latest data
      },
    });
    
  } catch (error: any) {
    console.error("Export Failed:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}