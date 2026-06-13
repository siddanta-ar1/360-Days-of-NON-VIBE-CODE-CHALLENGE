// src/app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' });

// We must use the Service Role Key to bypass RLS, because this request is coming from Stripe, not the user!
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    // 1. CRYPTOGRAPHIC VERIFICATION
    // This mathematically guarantees the request actually came from Stripe, and not a hacker trying to spoof a payment.
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error(`🚨 Webhook signature verification failed: ${error.message}`);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // 2. FULFILLMENT LOGIC
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Grab the ID we attached in Step 3
    const userId = session.client_reference_id; 

    if (userId) {
      console.log(`💰 Payment successful for User ${userId}. Upgrading tier...`);
      
      // 3. UPDATE THE DATABASE
      await supabase
        .from('profiles') // Adjust based on your schema
        .update({ subscription_tier: 'premium' })
        .eq('id', userId);
        
      // Now, your Day 165 Middleware can check this column and lift the rate limit!
    }
  }

  // 4. ALWAYS return a 200 OK so Stripe knows we received the message, otherwise it will retry for 3 days.
  return NextResponse.json({ received: true });
}