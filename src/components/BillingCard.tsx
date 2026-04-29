import type { User } from '../lib/api';

interface Props {
  user: User;
  monthlyMessageCount: number;
  onUpgrade: () => void;
}

const PLAN_LIMITS: Record<string, number> = {
  FREE:    50,
  STARTER: 500,
  PRO:     2000,
};

const PLAN_LABELS: Record<string, string> = {
  FREE:    'Free',
  STARTER: 'Starter',
  PRO:     'Pro',
};

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  active:    { bg: 'bg-emerald-500/10', text: 'text-emerald-400', dot: 'bg-emerald-500' },
  trialing:  { bg: 'bg-blue-500/10',    text: 'text-blue-400',    dot: 'bg-blue-500' },
  past_due:  { bg: 'bg-red-500/10',     text: 'text-red-400',     dot: 'bg-red-500' },
  paused:    { bg: 'bg-amber-500/10',   text: 'text-amber-400',   dot: 'bg-amber-500' },
  cancelled: { bg: 'bg-white/[0.05]',   text: 'text-slate-500',   dot: 'bg-slate-600' },
};

const STATUS_LABELS: Record<string, string> = {
  active:    'Active',
  trialing:  'Trial',
  past_due:  'Payment failed',
  paused:    'Paused',
  cancelled: 'Cancelled',
};

export default function BillingCard({ user, monthlyMessageCount, onUpgrade }: Props) {
  const limit   = PLAN_LIMITS[user.plan] ?? 50;
  const usagePct = Math.min(100, Math.round((monthlyMessageCount / limit) * 100));

  let barColor = 'bg-violet-500';
  if (usagePct >= 90) barColor = 'bg-red-500';
  else if (usagePct >= 70) barColor = 'bg-amber-500';

  const subStatus  = user.paddleSubscriptionStatus;
  const statusStyle = subStatus ? (STATUS_STYLES[subStatus] ?? STATUS_STYLES.active) : null;
  const statusLabel = subStatus ? (STATUS_LABELS[subStatus] ?? subStatus) : null;

  const nextBillDate = user.paddleNextBillDate
    ? new Date(user.paddleNextBillDate).toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
      })
    : null;

  const isPastDue = subStatus === 'past_due';
  const isPaused  = subStatus === 'paused';

  return (
    <div className="card-dark p-5 space-y-4">
      {/* Plan row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] text-slate-600 uppercase tracking-wider font-semibold mb-1">Current plan</p>
          <p className="text-base font-bold text-white">
            {PLAN_LABELS[user.plan] ?? user.plan}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {statusLabel && statusStyle && (
            <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}/>
              {statusLabel}
            </div>
          )}
          {user.plan === 'FREE' && (
            <button onClick={onUpgrade} className="btn-primary py-1.5 text-xs">
              Upgrade
            </button>
          )}
        </div>
      </div>

      {/* Error: past_due */}
      {isPastDue && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
          <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          </svg>
          <p className="text-xs text-red-400">
            <strong>Payment failed.</strong> Update your payment method in the{' '}
            <a
              href="https://sandbox-checkout.paddle.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline"
            >
              Paddle billing portal
            </a>
            {' '}to avoid interruption.
          </p>
        </div>
      )}

      {/* Warning: paused */}
      {isPaused && (
        <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2.5">
          <svg className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          </svg>
          <p className="text-xs text-amber-400">
            Your subscription is <strong>paused</strong>. Reactivate via the Paddle billing portal to restore paid features.
          </p>
        </div>
      )}

      {/* Next renewal */}
      {nextBillDate && !isPastDue && !isPaused && (
        <p className="text-xs text-slate-600">
          Renews on <span className="text-slate-400">{nextBillDate}</span>
        </p>
      )}

      {/* Usage bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-slate-600">Messages this month</p>
          <p className="text-xs font-medium text-slate-400">
            {monthlyMessageCount.toLocaleString()} / {limit.toLocaleString()}
          </p>
        </div>
        <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${usagePct}%` }}
          />
        </div>
        {usagePct >= 90 && (
          <p className="text-xs text-red-400 mt-1.5">
            Near monthly limit.{' '}
            {user.plan === 'FREE' ? (
              <button onClick={onUpgrade} className="underline hover:no-underline">
                Upgrade now
              </button>
            ) : 'Contact support for more capacity.'}
          </p>
        )}
      </div>
    </div>
  );
}
