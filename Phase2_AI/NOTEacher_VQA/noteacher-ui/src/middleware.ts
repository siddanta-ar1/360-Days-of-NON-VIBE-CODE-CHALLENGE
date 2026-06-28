// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { createServerClient } from '@supabase/ssr';

// 1. CONNECT TO THE IN-MEMORY DATABASE
// (You will get these keys for free from upstash.com)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || 'dummy_url',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || 'dummy_token',
});

// 2. DEFINE THE ALGORITHM
// We use a Sliding Window algorithm. 
// Free Tier: Limit to 5 requests per 1 minute per IP address.
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  analytics: true, // This allows you to view blocked requests in your Upstash dashboard
});

// 3. THE MIDDLEWARE INTERCEPTOR
export async function middleware(request: NextRequest) {
  // Extract the user's IP address (Vercel provides this automatically via headers)
  const ip = request.headers.get('x-forwarded-for') ?? request.ip ?? '127.0.0.1';

  try {
    // 4. CHECK THE LEDGER
    const { success, limit, reset, remaining } = await ratelimit.limit(ip);

    // If the user has exceeded their quota, physically block the request
    if (!success) {
      console.warn(`🚨 Rate Limit Exceeded for IP: ${ip}`);
      
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please upgrade to Premium via Stripe to unlock unlimited VQA inference.',
          action: 'UPGRADE_REQUIRED'
        },
        {
          status: 429, // Standard HTTP code for "Too Many Requests"
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      );
    }

    // 5. ALLOW ACCESS
    // If they have remaining tokens, let the request pass through to the AI backend
    const response = NextResponse.next();
    
    // Attach current limit status to the response headers for the frontend to read
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    return response;

  } catch (error) {
    // Fail open: If Redis goes down, we don't want to break the entire application
    console.error('Redis connection failed. Bypassing rate limit.', error);
    return NextResponse.next();
  }
}

// 6. THE ROUTER CONFIG
// We ONLY want to rate limit our expensive API routes, not our static HTML/CSS pages.
export const config = {
  matcher: [
    /*
     * Match all request paths starting with:
     * - api (our backend routes)
     */
    '/api/:path*',
  ],
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { /* your cookie handlers */ } }
    );
    
    const { data: { user } } = await supabase.auth.getUser();
    
    // 2. CHECK CUSTOM CLAIM OR EMAIL
    // In production, use custom claims. For now, hardcode your admin email.
    if (!user || user.email !== 'admin@yourdomain.com') {
      console.warn(`🚨 Unauthorized admin access attempt by ${user?.email || 'Anonymous'}`);
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }
  
  return NextResponse.next();
};