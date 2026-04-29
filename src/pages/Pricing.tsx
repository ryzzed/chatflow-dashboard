import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import PaddleCheckout from '../components/PaddleCheckout';

const plans = [
  {
    key: 'FREE',
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Try ChatFlow with no commitment.',
    features: [
      '1 AI chatbot',
      '1,000 conversations/month',
      'Full AI capabilities',
      'Conversation dashboard',
      'ChatFlow branding on widget',
    ],
    cta: 'Get started free',
    ctaType: 'ghost' as const,
    href: '/register',
  },
  {
    key: 'STARTER',
    name: 'Starter',
    price: '$39',
    period: '/month',
    description: 'For small businesses ready to grow.',
    popular: true,
    features: [
      '1 AI chatbot',
      '5,000 conversations/month',
      'Remove ChatFlow branding',
      'Conversation dashboard',
      'Priority support',
    ],
    cta: 'Upgrade to Starter',
    ctaType: 'primary' as const,
  },
  {
    key: 'PRO',
    name: 'Pro',
    price: '$79',
    period: '/month',
    description: 'Multiple bots, unlimited scale.',
    features: [
      'Up to 5 AI chatbots',
      'Unlimited conversations',
      'Full white-label branding',
      'Conversation dashboard',
      'Priority support',
    ],
    cta: 'Upgrade to Pro',
    ctaType: 'primary' as const,
  },
];

const faqs = [
  {
    q: 'What counts as a conversation?',
    a: 'Each user message sent to your bot counts as one conversation. Bot responses don\'t count. The counter resets on the 1st of each month.',
  },
  {
    q: 'Can I switch plans anytime?',
    a: 'Yes. Upgrades take effect immediately. Downgrades apply at the next billing cycle.',
  },
  {
    q: 'What happens when I hit the monthly limit?',
    a: 'Your bot shows a friendly message letting visitors know the monthly quota has been reached and links to your site to contact you. You can upgrade at any time to restore service.',
  },
  {
    q: 'Is there an annual plan?',
    a: 'Monthly billing only for now. Annual plans with a discount are on the roadmap.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'All major credit and debit cards (Visa, Mastercard, Amex). Payments processed by Paddle.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes — cancel from your Paddle billing portal at any time. Your plan stays active until the end of the billing period.',
  },
];

export default function Pricing() {
  const { user } = useAuth();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [targetPlan, setTargetPlan] = useState<'STARTER' | 'PRO'>('STARTER');

  function handlePlanCTA(planKey: string) {
    if (!user) return; // shouldn't happen on protected route
    if (planKey === 'FREE') return;
    if (user.plan !== 'FREE') return; // already paid
    setTargetPlan(planKey as 'STARTER' | 'PRO');
    setShowUpgrade(true);
  }

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0f', color: '#e2e8f0' }}>
      {/* Nav */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'inherit' }}>
          <div style={{ width: 32, height: 32, background: '#7c3aed', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 17 }}>ChatFlow</span>
        </Link>
        <Link to="/dashboard" style={{ fontSize: 14, color: '#64748b', textDecoration: 'none' }}>← Back to dashboard</Link>
      </div>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '52px 24px 40px', maxWidth: 640, margin: '0 auto' }}>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: 16 }}>
          Simple, transparent pricing
        </h1>
        <p style={{ fontSize: 17, color: '#64748b', lineHeight: 1.6 }}>
          No per-seat fees. No AI surcharges. No annual contracts. Pay for what you use.
        </p>
        {user && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 16, background: 'rgba(124,58,237,.12)', border: '1px solid rgba(124,58,237,.25)', borderRadius: 100, padding: '5px 14px', fontSize: 12, color: '#a78bfa' }}>
            You're on the <strong style={{ color: '#c4b5fd' }}>{user.plan.charAt(0) + user.plan.slice(1).toLowerCase()}</strong> plan
          </div>
        )}
      </div>

      {/* Plan cards */}
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '0 24px 64px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {plans.map((plan) => {
          const isCurrent = user?.plan === plan.key;
          const isUpgradeable = user?.plan === 'FREE' && plan.key !== 'FREE';
          const featured = plan.popular;

          return (
            <div
              key={plan.key}
              style={{
                background: featured ? 'rgba(124,58,237,.07)' : 'rgba(255,255,255,.03)',
                border: `1px solid ${isCurrent ? 'rgba(34,197,94,.4)' : featured ? 'rgba(124,58,237,.4)' : 'rgba(255,255,255,.07)'}`,
                borderRadius: 16,
                padding: 28,
                position: 'relative',
              }}
            >
              {featured && !isCurrent && (
                <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)' }}>
                  <span style={{ background: '#7c3aed', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 12px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '.06em', whiteSpace: 'nowrap' }}>
                    Most popular
                  </span>
                </div>
              )}
              {isCurrent && (
                <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)' }}>
                  <span style={{ background: '#22c55e', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 12px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '.06em', whiteSpace: 'nowrap' }}>
                    Current plan
                  </span>
                </div>
              )}

              <div style={{ marginBottom: 6, fontSize: 12, textTransform: 'uppercase', letterSpacing: '.08em', color: '#64748b', fontWeight: 600 }}>{plan.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 8 }}>
                <span style={{ fontSize: 40, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{plan.price}</span>
                <span style={{ fontSize: 14, color: '#64748b' }}>{plan.period}</span>
              </div>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20, lineHeight: 1.5 }}>{plan.description}</p>

              <ul style={{ listStyle: 'none', marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#94a3b8' }}>
                    <svg width="14" height="14" fill="none" stroke="#7c3aed" strokeWidth="2.5" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <div style={{ textAlign: 'center', padding: '10px', borderRadius: 8, background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.2)', fontSize: 13, color: '#4ade80', fontWeight: 600 }}>
                  ✓ Active plan
                </div>
              ) : plan.key === 'FREE' ? (
                <Link
                  to="/dashboard"
                  style={{ display: 'block', textAlign: 'center', padding: '11px', borderRadius: 8, border: '1px solid rgba(255,255,255,.12)', color: '#cbd5e1', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}
                >
                  {user ? 'Go to dashboard' : plan.cta}
                </Link>
              ) : isUpgradeable ? (
                <button
                  onClick={() => handlePlanCTA(plan.key)}
                  style={{ width: '100%', padding: '11px', borderRadius: 8, background: '#7c3aed', border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
                >
                  {plan.cta}
                </button>
              ) : (
                <div style={{ textAlign: 'center', padding: '10px', borderRadius: 8, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', fontSize: 13, color: '#475569' }}>
                  Contact support to change plan
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Feature comparison table */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px 64px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 28 }}>Full feature comparison</h2>
        <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,.07)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,.03)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Feature</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', color: '#64748b', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Free</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', color: '#a78bfa', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Starter</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', color: '#64748b', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Pro</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Monthly conversations', '1,000', '5,000', 'Unlimited'],
                ['AI chatbots', '1', '1', '5'],
                ['AI response quality', '✓', '✓', '✓'],
                ['Conversation history', '✓', '✓', '✓'],
                ['Remove ChatFlow branding', '–', '✓', '✓'],
                ['Custom accent color', '✓', '✓', '✓'],
                ['Analytics dashboard', '✓', '✓', '✓'],
                ['Priority support', '–', '✓', '✓'],
                ['White-label (no branding)', '–', '–', '✓'],
                ['Uptime SLA', 'Best effort', 'Best effort', 'Best effort'],
              ].map(([feature, free, starter, pro], i) => (
                <tr key={feature} style={{ borderTop: '1px solid rgba(255,255,255,.05)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,.01)' }}>
                  <td style={{ padding: '12px 16px', color: '#e2e8f0', fontWeight: 500 }}>{feature}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', color: free === '–' ? '#374151' : '#94a3b8' }}>{free}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', color: starter === '–' ? '#374151' : '#a78bfa', fontWeight: starter !== '–' ? 600 : 400 }}>{starter}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', color: pro === '–' ? '#374151' : '#94a3b8' }}>{pro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 32 }}>Pricing FAQ</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {faqs.map((faq, i) => (
            <div key={faq.q} style={{ borderBottom: '1px solid rgba(255,255,255,.07)', padding: '18px 0', ...(i === 0 ? { borderTop: '1px solid rgba(255,255,255,.07)' } : {}) }}>
              <p style={{ fontWeight: 600, color: '#e2e8f0', marginBottom: 8, fontSize: 15 }}>{faq.q}</p>
              <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      {user?.plan === 'FREE' && (
        <div style={{ padding: '0 24px 80px', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: 'rgba(124,58,237,.1)', border: '1px solid rgba(124,58,237,.2)', borderRadius: 20, padding: '40px 48px', maxWidth: 520 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 10 }}>Ready to remove limits?</h2>
            <p style={{ color: '#94a3b8', fontSize: 15, marginBottom: 24 }}>Upgrade to Starter for $39/month — 5,000 conversations, no branding.</p>
            <button
              onClick={() => { setTargetPlan('STARTER'); setShowUpgrade(true); }}
              style={{ background: '#7c3aed', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
            >
              Upgrade to Starter
            </button>
          </div>
        </div>
      )}

      {showUpgrade && <PaddleCheckout onClose={() => setShowUpgrade(false)} />}
    </div>
  );
}
