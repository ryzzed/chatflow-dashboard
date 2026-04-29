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
  const { user } = useAuth();
  const [paddleReady, setPaddleReady] = useState(false);
  const [selected, setSelected] = useState<'STARTER' | 'PRO'>('STARTER');
  const [error, setError] = useState('');
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    // Load Paddle.js if not already present
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
    scriptRef.current = script;

    return () => {
      // Don't remove the script on unmount — it may be reused
    };
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
        // Capture async Paddle errors (invalid token, network failures, bad price IDs)
        eventCallback: (data: { name: string; error?: { detail?: string } }) => {
          if (data.name === 'checkout.error') {
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
          theme: 'light',
          locale: 'en',
        },
      });
      onClose();
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
      price: '$39/mo',
      priceId: STARTER_PRICE_ID,
      features: ['500 messages/month', '5 bots', 'Email support'],
    },
    {
      key: 'PRO' as const,
      name: 'Pro',
      price: '$79/mo',
      priceId: PRO_PRICE_ID,
      features: ['2,000 messages/month', 'Unlimited bots', 'Priority support', 'Custom branding'],
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Upgrade your plan</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
            ×
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {plans.map((plan) => (
            <button
              key={plan.key}
              onClick={() => setSelected(plan.key)}
              className={`border-2 rounded-xl p-4 text-left transition-all ${
                selected === plan.key
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="font-semibold text-gray-900">{plan.name}</p>
              <p className="text-lg font-bold text-indigo-600 mt-1">{plan.price}</p>
              <ul className="mt-3 space-y-1">
                {plan.features.map((f) => (
                  <li key={f} className="text-xs text-gray-600 flex items-center gap-1">
                    <span className="text-green-500">✓</span> {f}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        {!PADDLE_CLIENT_TOKEN ? (
          <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
            Paddle not configured. Set <code>VITE_PADDLE_CLIENT_TOKEN</code> in your environment.
          </p>
        ) : !paddleReady ? (
          <p className="text-sm text-gray-500 mb-4">Loading payment provider…</p>
        ) : null}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
            {error}
          </p>
        )}

        <button
          onClick={() => {
            const plan = plans.find((p) => p.key === selected)!;
            openCheckout(plan.priceId);
          }}
          disabled={!paddleReady || !PADDLE_CLIENT_TOKEN}
          className="w-full bg-indigo-600 text-white rounded-xl py-3 font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue with {plans.find((p) => p.key === selected)?.name} —{' '}
          {plans.find((p) => p.key === selected)?.price}
        </button>

        <p className="text-xs text-gray-400 text-center mt-3">
          Payments handled securely by Paddle. Cancel anytime.
        </p>
      </div>
    </div>
  );
}
