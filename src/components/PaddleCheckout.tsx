import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../lib/auth';

// Paddle product price IDs (set via env vars; sandbox IDs used until launch)
const STARTER_PRICE_ID = import.meta.env.VITE_PADDLE_STARTER_PRICE_ID ?? '';
const PRO_PRICE_ID = import.meta.env.VITE_PADDLE_PRO_PRICE_ID ?? '';
const PADDLE_ENV = (import.meta.env.VITE_PADDLE_ENV ?? 'sandbox') as 'sandbox' | 'production';
const PADDLE_CLIENT_TOKEN = import.meta.env.VITE_PADDLE_CLIENT_TOKEN ?? '';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Paddle?: any;
  }
}

interface Props {
  onClose: () => void;
}

export default function PaddleCheckout({ onClose }: Props) {
  const { user, refreshUser } = useAuth();
  const [paddleReady, setPaddleReady] = useState(false);
  const [selected, setSelected] = useState<'STARTER' | 'PRO'>('STARTER');
  const [error, setError] = useState('');
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // Use refs so the Paddle event callback always has fresh values without
  // re-running the initialization effect.
  const onCloseRef    = useRef(onClose);
  const refreshRef    = useRef(refreshUser);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  useEffect(() => { refreshRef.current = refreshUser; }, [refreshUser]);

  useEffect(() => {
    if (window.Paddle) {
      initPaddle();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
    script.async = true;
    script.onload = initPaddle;
    script.onerror = () =>
      setError('Failed to load payment provider. Please refresh and try again.');
    document.head.appendChild(script);
    // Don't remove script on unmount — it may be reused
  }, []);

  function initPaddle() {
    if (!window.Paddle || !PADDLE_CLIENT_TOKEN) {
      setPaddleReady(false);
      return;
    }
    try {
      window.Paddle.Environment.set(PADDLE_ENV);
      window.Paddle.Initialize({
        token: PADDLE_CLIENT_TOKEN,
        eventCallback: (data: { name: string; error?: { detail?: string } }) => {
          if (data.name === 'checkout.completed') {
            // Checkout succeeded — refresh user plan then close modal.
            // Paddle may fire this slightly before the webhook arrives;
            // we poll /auth/me with a short delay to give the webhook time.
            setCheckoutSuccess(true);
            setTimeout(() => {
              refreshRef.current().finally(() => onCloseRef.current());
            }, 2000);
          } else if (data.name === 'checkout.closed') {
            // User dismissed the Paddle overlay without completing
            onCloseRef.current();
          } else if (data.name === 'checkout.error') {
            setError(
              data.error?.detail ?? 'Checkout failed. Please try again or contact support.'
            );
          }
        },
      });
      setPaddleReady(true);
    } catch (err) {
      console.error('Paddle init error:', err);
      setError('Failed to initialise payment provider. Please refresh and try again.');
    }
  }

  function openCheckout(priceId: string) {
    if (!window.Paddle) return;
    if (!priceId) {
      setError('This plan is not yet available for purchase. Please contact support.');
      return;
    }
    setError('');
    try {
      window.Paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customer: user?.email ? { email: user.email } : undefined,
        settings: {
          displayMode: 'overlay',
          theme: 'dark',
          locale: 'en',
        },
      });
      // Do NOT call onClose() here — we close after checkout.completed or checkout.closed
    } catch (err) {
      console.error('Paddle checkout error:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to open checkout. Please try again.'
      );
    }
  }

  const plans = [
    {
      key: 'STARTER' as const,
      name: 'Starter',
      price: '$39',
      period: '/mo',
      priceId: STARTER_PRICE_ID,
      features: ['500 messages/month', '5 bots', 'Email support'],
    },
    {
      key: 'PRO' as const,
      name: 'Pro',
      price: '$79',
      period: '/mo',
      priceId: PRO_PRICE_ID,
      features: ['2,000 messages/month', 'Unlimited bots', 'Priority support', 'Custom branding'],
      popular: true,
    },
  ];

  const selectedPlan = plans.find((p) => p.key === selected)!;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card-dark noise w-full max-w-lg p-8 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <h2 className="text-xl font-bold text-white">Upgrade your plan</h2>
            <p className="text-xs text-slate-500 mt-0.5">Unlock more bots and higher limits</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {plans.map((plan) => {
            const isSelected = selected === plan.key;
            return (
              <button
                key={plan.key}
                onClick={() => setSelected(plan.key)}
                className={`relative text-left p-5 rounded-xl border transition-all duration-150 ${
                  isSelected
                    ? 'border-violet-500/60 bg-violet-600/10'
                    : 'border-white/[0.07] bg-white/[0.02] hover:border-white/[0.14]'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    <span className="text-[9px] font-bold bg-violet-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
                      Most popular
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-sm text-white">{plan.name}</p>
                  {isSelected && (
                    <div className="w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex items-baseline gap-0.5 mb-3">
                  <span className="text-2xl font-black text-white">{plan.price}</span>
                  <span className="text-xs text-slate-500">{plan.period}</span>
                </div>
                <ul className="space-y-1.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-1.5 text-xs text-slate-500">
                      <svg className="w-3 h-3 text-violet-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        {/* Status messages */}
        {checkoutSuccess && (
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2.5 mb-4">
            <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
            <p className="text-xs text-green-400">Payment successful! Activating your plan…</p>
          </div>
        )}

        {!PADDLE_CLIENT_TOKEN && (
          <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2.5 mb-4">
            <svg className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
            <p className="text-xs text-amber-400">
              Paddle not configured. Set <code className="font-mono text-amber-300">VITE_PADDLE_CLIENT_TOKEN</code> to enable checkout.
            </p>
          </div>
        )}

        {!paddleReady && PADDLE_CLIENT_TOKEN && !error && !checkoutSuccess && (
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-4">
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Loading payment provider…
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5 mb-4">
            <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={() => openCheckout(selectedPlan.priceId)}
          disabled={!paddleReady || !PADDLE_CLIENT_TOKEN || checkoutSuccess}
          className="btn-primary w-full py-3 text-sm"
        >
          Continue with {selectedPlan.name} — {selectedPlan.price}{selectedPlan.period}
        </button>

        <p className="text-[11px] text-slate-600 text-center mt-3">
          Payments processed securely by Paddle · Cancel anytime
        </p>
      </div>
    </div>
  );
}
