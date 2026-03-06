'use client';

import { useState } from 'react';
import { useAuth } from '@/app/context/auth-context';
import { Check, Coins, CreditCard, Zap } from 'lucide-react';
import { toast } from 'sonner';
import type { Plan, SubscriptionPlan } from '@/lib/types';

const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    priceYearly: 290,
    credits: 1000,
    maxUsers: 5,
    maxStorage: '10 GB',
    features: ['1,000 credits/month', 'Face swap', 'Image generation', 'Up to 5 users', '10 GB storage', 'Email support'],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 79,
    priceYearly: 790,
    credits: 5000,
    maxUsers: 25,
    maxStorage: '50 GB',
    features: ['5,000 credits/month', 'All Starter features', 'Video generation', 'Avatar generation', 'Bulk processing', 'Up to 25 users', '50 GB storage', 'Priority support'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    priceYearly: 1990,
    credits: 20000,
    maxUsers: -1,
    maxStorage: '500 GB',
    features: ['20,000 credits/month', 'All Professional features', 'Unlimited users', '500 GB storage', 'Custom integrations', 'Dedicated support', 'SLA guarantee', 'Custom billing'],
  },
];

const CREDIT_PACKS = [
  { credits: 500,   price: 10,  perCredit: '2¢' },
  { credits: 2000,  price: 35,  perCredit: '1.75¢' },
  { credits: 5000,  price: 75,  perCredit: '1.5¢' },
  { credits: 15000, price: 200, perCredit: '1.33¢' },
];

export default function BillingPage() {
  const { user } = useAuth();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  async function handleSubscribe(planId: SubscriptionPlan) {
    setIsProcessing(planId);
    await new Promise(r => setTimeout(r, 1200)); // simulate
    toast.success(`Subscribed to ${planId} plan! (Stripe integration required for live payments)`);
    setIsProcessing(null);
  }

  async function handleCreditPurchase(credits: number, price: number) {
    setIsProcessing(`credits-${credits}`);
    await new Promise(r => setTimeout(r, 1000));
    toast.success(`Purchased ${credits} credits! (Stripe integration required for live payments)`);
    setIsProcessing(null);
  }

  const currentPlan = user?.companyId ? 'professional' : 'free';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Current Usage */}
      {user && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem' }}>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: '1rem' }}>Current Usage</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', marginBottom: '0.25rem' }}>Credits Balance</div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>{user.credits.toLocaleString()}</div>
              <div className="credit-bar" style={{ marginTop: '0.5rem' }}>
                <div className="credit-bar-fill high" style={{ width: `${Math.round((user.credits / user.creditLimit) * 100)}%` }} />
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
                of {user.creditLimit.toLocaleString()} total
              </div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', marginBottom: '0.25rem' }}>Current Plan</div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, textTransform: 'capitalize' }}>{currentPlan}</div>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Plans */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>Subscription Plans</h3>
          <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--secondary)', borderRadius: '8px', padding: '3px' }}>
            {(['monthly', 'yearly'] as const).map(b => (
              <button key={b} onClick={() => setBilling(b)} style={{
                padding: '0.375rem 0.875rem', borderRadius: '6px', border: 'none',
                background: billing === b ? 'var(--card)' : 'transparent',
                cursor: 'pointer', fontSize: 'var(--text-xs)', fontWeight: billing === b ? 600 : 400,
                color: billing === b ? 'var(--foreground)' : 'var(--muted-foreground)',
              }}>
                {b === 'yearly' ? '💰 Yearly (Save 17%)' : 'Monthly'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(240px, 30%, 320px), 1fr))', gap: '1rem' }}>
          {PLANS.map(plan => {
            const price = billing === 'yearly' ? plan.priceYearly / 12 : plan.price;
            const isCurrent = plan.id === currentPlan;
            return (
              <div key={plan.id} style={{
                background: isCurrent ? 'var(--foreground)' : 'var(--card)',
                border: `1px solid ${isCurrent ? 'var(--foreground)' : 'var(--border)'}`,
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex', flexDirection: 'column',
                color: isCurrent ? 'var(--background)' : 'var(--foreground)',
              }}>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>{plan.name}</span>
                    {isCurrent && <span style={{ fontSize: 'var(--text-xs)', padding: '2px 8px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', fontWeight: 600 }}>Current</span>}
                  </div>
                  <div style={{ marginTop: '0.5rem' }}>
                    <span style={{ fontSize: 'var(--text-3xl)', fontWeight: 700 }}>${Math.round(price)}</span>
                    <span style={{ fontSize: 'var(--text-sm)', opacity: 0.7 }}>/mo</span>
                  </div>
                  {billing === 'yearly' && (
                    <div style={{ fontSize: 'var(--text-xs)', opacity: 0.7 }}>${plan.priceYearly}/year · billed annually</div>
                  )}
                  <div style={{ fontSize: 'var(--text-sm)', marginTop: '0.25rem', opacity: 0.8 }}>
                    {plan.credits.toLocaleString()} credits/month
                  </div>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  {plan.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: 'var(--text-sm)' }}>
                      <Check size={14} style={{ flexShrink: 0, marginTop: '2px', color: isCurrent ? 'rgba(255,255,255,0.7)' : '#15803d' }} />
                      <span style={{ opacity: 0.9 }}>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isCurrent || isProcessing === plan.id}
                  style={{
                    padding: '0.625rem',
                    background: isCurrent ? 'rgba(255,255,255,0.2)' : 'var(--foreground)',
                    color: isCurrent ? 'rgba(255,255,255,0.9)' : 'var(--background)',
                    border: `1px solid ${isCurrent ? 'rgba(255,255,255,0.3)' : 'transparent'}`,
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: 'var(--text-sm)',
                    cursor: isCurrent ? 'default' : 'pointer',
                    opacity: isProcessing === plan.id ? 0.7 : 1,
                  }}
                >
                  {isProcessing === plan.id ? 'Processing...' : isCurrent ? 'Current Plan' : `Upgrade to ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Credit Packs */}
      <div>
        <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: '1rem' }}>Buy Credit Packs</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(180px, 22%, 240px), 1fr))', gap: '0.75rem' }}>
          {CREDIT_PACKS.map(pack => (
            <div key={pack.credits} style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: '12px', padding: '1.25rem',
              display: 'flex', flexDirection: 'column', gap: '0.5rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Coins size={16} style={{ color: 'var(--muted-foreground)' }} />
                <span style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>{pack.credits.toLocaleString()}</span>
              </div>
              <div style={{ color: 'var(--muted-foreground)', fontSize: 'var(--text-xs)' }}>
                {pack.perCredit} per credit
              </div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>${pack.price}</div>
              <button
                onClick={() => handleCreditPurchase(pack.credits, pack.price)}
                disabled={isProcessing === `credits-${pack.credits}`}
                style={{
                  marginTop: '0.25rem',
                  padding: '0.5rem',
                  background: 'var(--foreground)', color: 'var(--background)',
                  border: 'none', borderRadius: '6px',
                  fontWeight: 600, fontSize: 'var(--text-sm)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                }}
              >
                <CreditCard size={14} />
                {isProcessing === `credits-${pack.credits}` ? 'Processing...' : 'Buy Now'}
              </button>
            </div>
          ))}
        </div>
        <p style={{ marginTop: '0.75rem', fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)' }}>
          💳 Payments processed via Stripe. Credits never expire. Stripe API keys required in .env.local for live payments.
        </p>
      </div>
    </div>
  );
}
