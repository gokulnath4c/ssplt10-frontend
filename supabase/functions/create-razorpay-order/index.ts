// @ts-ignore
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
// @ts-ignore
import Razorpay from 'https://esm.sh/razorpay@2.9.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { amount, key_id, key_secret } = await req.json();

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      throw new Error('Invalid amount provided');
    }

    // Get credentials from environment variables or request body
    // @ts-ignore
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID') || key_id || '';
    // @ts-ignore
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET') || key_secret || '';

    if (!razorpayKeyId || !razorpayKeySecret) {
      throw new Error('Razorpay credentials not configured. Please provide key_id and key_secret in request body or set environment variables.');
    }

    const razorpay = new Razorpay({
      // @ts-ignore
      key_id: razorpayKeyId,
      // @ts-ignore
      key_secret: razorpayKeySecret,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // amount in paise
      currency: 'INR',
      receipt: `sspl_${Date.now()}`,
    });

    return new Response(JSON.stringify(order), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
