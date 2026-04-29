import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, type Bot, type Stats } from '../lib/api';
import { useAuth } from '../lib/auth';
import PaddleCheckout from '../components/PaddleCheckout';

const API_BASE = import.meta.env.VITE_API_URL ?? 'https://chatflow-api-406c.onrender.com';

const PLAN_CAPS: Record<string, number> = { FREE: 100, STARTER: 500, PRO: 1_000_000 };

const PLAN_BADGE: Record<string, { label: string; cls: string }> = {
  FREE:    { label: 'Free',    cls: 'bg-white/[0.06] text-slate-400' },
  STARTER: { label: 'Starter', cls: 'bg-blue-500/20 text-blue-300' },
  PRO:     { label: 'Pro',     cls: 'bg-violet-500/20 text-violet-300' },
};

function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 2) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function MetricCard({ icon, value, label, sub }: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  sub?: React.ReactNode;
}) {
  return (
    <div className="card-dark px-5 py-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">{label}</span>
        <span className="text-slate-600">{icon}</span>
      </div>
      <div>
        <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
        {sub}
      </div>
    </div>
  );
}

function UsageBar({ used, cap }: { used: number; cap: number }) {
  const isUnlimited = cap >= 1_000_000;
  const pct = isUnlimited ? 0 : Math.min(100, Math.round((used / cap) * 100));
  const over = pct >= 100;
  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${over ? 'bg-red-500' : 'bg-violet-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-[10px] font-medium tabular-nums ${over ? 'text-red-400' : 'text-slate-500'}`}>
        {isUnlimited ? '∞' : `${used}/${cap}`}
      </span>
    </div>
  );
}

function BotCard({
  bot,
  onDelete,
  onCopyEmbed,
}: {
  bot: Bot;
  onDelete: (id: string) => void;
  onCopyEmbed: (id: string) => void;
}) {
  const initials = bot.name.slice(0, 2).toUpperCase();
  return (
    <div className="card-dark p-5 flex flex-col gap-4 group">
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 ring-1 ring-white/10"
          style={{ backgroundColor: bot.accentColor }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-white truncate">{bot.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${bot.isActive ? 'bg-emerald-400' : 'bg-slate-600'}`} />
            <span className="text-xs text-slate-500">
              {bot.isActive ? 'Active' : 'Inactive'} · Last active {timeAgo(bot.lastActiveAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          {(bot.conversationCount ?? 0).toLocaleString()} conversations
        </span>
      </div>

      <div className="flex items-center gap-1 pt-3 border-t border-white/[0.06] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150">
        <Link
          to={`/bots/${bot.id}`}
          className="flex-1 text-center text-xs font-medium text-violet-400 hover:text-violet-300 py-1.5 px-2 rounded-lg hover:bg-violet-500/10 transition-colors"
        >
          Edit
        </Link>
        <Link
          to={`/bots/${bot.id}/conversations`}
          className="flex-1 text-center text-xs font-medium text-slate-400 hover:text-slate-200 py-1.5 px-2 rounded-lg hover:bg-white/[0.05] transition-colors"
        >
          Analytics
        </Link>
        <button
          onClick={() => onCopyEmbed(bot.id)}
          className="flex-1 text-center text-xs font-medium text-slate-400 hover:text-slate-200 py-1.5 px-2 rounded-lg hover:bg-white/[0.05] transition-colors"
        >
          Copy embed
        </button>
        <button
          onClick={() => onDelete(bot.id)}
          className="btn-danger py-1.5 px-2 text-xs"
          title="Delete bot"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="col-span-full">
      <div className="card-dark noise text-center py-20 px-8">
        <div className="w-16 h-16 rounded-2xl bg-violet-600/15 border border-violet-500/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Launch your first chatbot</h3>
        <p className="text-sm text-slate-500 max-w-xs mx-auto mb-8 leading-relaxed">
          Give your website visitors instant answers — 24/7, no code required. Set up in 2 minutes.
        </p>
        <button onClick={onCreate} className="btn-primary px-7 py-2.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create your first bot
        </button>
        <div className="mt-10 flex justify-center gap-8">
          {['Configure', 'Copy embed code', 'Go live'].map((step, i) => (
            <div key={step} className="flex flex-col items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-violet-500/15 border border-violet-500/25 text-violet-400 flex items-center justify-center text-xs font-bold">
                {i + 1}
              </span>
              <span className="text-xs text-slate-600 text-center">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bots, setBots] = useState<Bot[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [copyToast, setCopyToast] = useState('');

  useEffect(() => {
    Promise.all([api.bots.list(), api.stats.get()])
      .then(([{ bots: b }, s]) => {
        setBots(b);
        setStats(s);
      })
      .catch(() => setError('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    if (!confirm('Delete this bot? This cannot be undone.')) return;
    await api.bots.delete(id);
    setBots((prev) => prev.filter((b) => b.id !== id));
  }

  function handleCopyEmbed(botId: string) {
    const snippet = `<script src="${API_BASE}/widget.js" data-bot-id="${botId}"></script>`;
    navigator.clipboard.writeText(snippet).then(() => {
      setCopyToast('Embed code copied!');
      setTimeout(() => setCopyToast(''), 2500);
    });
  }

  const cap = PLAN_CAPS[user?.plan ?? 'FREE'] ?? 100;
  const isOverLimit = (stats?.messagesThisMonth ?? 0) >= cap && cap < 1_000_000;
  const badge = user ? (PLAN_BADGE[user.plan] ?? PLAN_BADGE.FREE) : null;
  const planChip = isOverLimit
    ? { label: 'Over limit', cls: 'bg-red-500/20 text-red-400' }
    : (badge ?? PLAN_BADGE.FREE);

  return (
    <div className="min-h-screen">
      {/* ── Nav ── */}
      <nav className="nav-dark">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <span className="font-bold text-white text-base tracking-tight">ChatFlow</span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${planChip.cls}`}>
            {planChip.label}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            {user?.name && <p className="text-xs font-medium text-slate-300">{user.name}</p>}
            <p className="text-xs text-slate-600">{user?.email}</p>
          </div>
          {user?.plan !== 'PRO' && (
            <button onClick={() => setShowUpgrade(true)} className="btn-primary py-1.5 text-xs">
              Upgrade
            </button>
          )}
          <button onClick={logout} className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
            Sign out
          </button>
        </div>
      </nav>

      {/* ── Main ── */}
      <main className="max-w-5xl mx-auto px-5 sm:px-8 pt-24 pb-16 space-y-8">

        {/* Page title + New Bot */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Dashboard</h1>
            <p className="text-sm text-slate-600 mt-0.5">
              {loading ? 'Loading…' : `${bots.length} bot${bots.length !== 1 ? 's' : ''} configured`}
            </p>
          </div>
          <button onClick={() => navigate('/bots/new')} className="btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Bot
          </button>
        </div>

        {/* ── Metrics row ── */}
        {!loading && stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCard
              label="Total Conversations"
              value={stats.totalConversations.toLocaleString()}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              }
            />
            <MetricCard
              label="Messages This Month"
              value={stats.messagesThisMonth.toLocaleString()}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
              sub={<UsageBar used={stats.messagesThisMonth} cap={cap} />}
            />
            <MetricCard
              label="Active Bots"
              value={stats.activeBots}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
            />
            {/* Billing card */}
            <div className="card-dark px-5 py-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">Plan</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${planChip.cls}`}>
                  {planChip.label}
                </span>
              </div>
              <div className="text-sm leading-snug">
                {user?.plan === 'PRO' ? (
                  <span className="text-emerald-400 font-medium">Unlimited messages</span>
                ) : (
                  <span className="text-slate-400">{Math.max(0, cap - (stats.messagesThisMonth))} messages remaining</span>
                )}
                {user?.paddleNextBillDate && (
                  <p className="text-xs text-slate-600 mt-1">
                    Renews {new Date(user.paddleNextBillDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              {user?.plan !== 'PRO' && (
                <button
                  onClick={() => setShowUpgrade(true)}
                  className="text-xs font-semibold text-violet-400 hover:text-violet-300 text-left transition-colors"
                >
                  Upgrade to Pro →
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* ── Bot grid ── */}
        <div>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Your Bots</h2>

          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card-dark p-5 space-y-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.04]" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-white/[0.04] rounded-md w-3/4" />
                      <div className="h-2 bg-white/[0.04] rounded-md w-1/2" />
                    </div>
                  </div>
                  <div className="h-2 bg-white/[0.04] rounded-md w-1/3" />
                  <div className="h-8 bg-white/[0.02] rounded-lg" />
                </div>
              ))}
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
              {bots.length === 0 ? (
                <EmptyState onCreate={() => navigate('/bots/new')} />
              ) : (
                bots.map((bot) => (
                  <BotCard
                    key={bot.id}
                    bot={bot}
                    onDelete={handleDelete}
                    onCopyEmbed={handleCopyEmbed}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </main>

      {/* ── Copy toast ── */}
      {copyToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white text-gray-900 text-sm font-medium px-5 py-2.5 rounded-full shadow-xl z-50">
          {copyToast}
        </div>
      )}

      {showUpgrade && <PaddleCheckout onClose={() => setShowUpgrade(false)} />}
    </div>
  );
}
