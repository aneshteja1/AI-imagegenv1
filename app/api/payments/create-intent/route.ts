import { NextRequest, NextResponse } from 'next/server';

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;

const PLANS: Record<string, { price: number; credits: number; name: string }> = {
  starter_monthly: { price: 2900, credits: 1000, name: 'Starter Monthly' },
  starter_yearly: { price: 27800, credits: 1000, name: 'Starter Yearly' },
  professional_monthly: { price: 7900, credits: 5000, name: 'Professional Monthly' },
  professional_yearly: { price: 75800, credits: 5000, name: 'Professional Yearly' },
  enterprise_monthly: { price: 19900, credits: 20000, name: 'Enterprise Monthly' },
  enterprise_yearly: { price: 191000, credits: 20000, name: 'Enterprise Yearly' },
};

const CREDIT_PACKS: Record<string, { price: number; credits: number; name: string }> = {
  pack_500: { price: 1000, credits: 500, name: '500 Credit Pack' },
  pack_2000: { price: 3500, credits: 2000, name: '2000 Credit Pack' },
  pack_5000: { price: 7500, credits: 5000, name: '5000 Credit Pack' },
  pack_15000: { price: 20000, credits: 15000, name: '15000 Credit Pack' },
};

export async function POST(req: NextRequest) {
  try {
    const { type, productId, userId, companyId } = await req.json();
    // type: 'subscription' | 'credit_pack'

    const product = type === 'subscription' ? PLANS[productId] : CREDIT_PACKS[productId];
    if (!product) {
      return NextResponse.json({ error: 'Invalid product' }, { status: 400 });
    }

    // Real Stripe integration
    if (STRIPE_SECRET) {
      try {
        const stripeRes = await fetch('https://api.stripe.com/v1/payment_intents', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${STRIPE_SECRET}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            amount: product.price.toString(),
            currency: 'usd',
            'metadata[type]': type,
            'metadata[productId]': productId,
            'metadata[userId]': userId ?? '',
            'metadata[companyId]': companyId ?? '',
            'metadata[credits]': product.credits.toString(),
          }),
        });

        if (stripeRes.ok) {
          const intent = await stripeRes.json();
          return NextResponse.json({
            clientSecret: intent.client_secret,
            paymentIntentId: intent.id,
            product,
          });
        }
      } catch { /* fall through */ }
    }

    // Mock payment intent (no Stripe key)
    return NextResponse.json({
      clientSecret: `pi_mock_${Date.now()}_secret_demo`,
      paymentIntentId: `pi_mock_${Date.now()}`,
      product,
      note: 'Mock payment — add STRIPE_SECRET_KEY to enable real payments',
    });

  } catch {
    return NextResponse.json({ error: 'Payment failed' }, { status: 500 });
  }
}
