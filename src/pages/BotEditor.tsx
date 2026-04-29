import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';

const RENDER_URL = import.meta.env.VITE_API_URL ?? 'https://chatflow-api.onrender.com';

const STEPS = ['Identity', 'Behavior', 'Test', 'Deploy'] as const;
type Step = 0 | 1 | 2 | 3;

const TONE_LABELS = ['Professional', 'Friendly', 'Casual'] as const;
type Tone = (typeof TONE_LABELS)[number];

const TONE_HINTS: Record<Tone, string> = {
  Professional: 'Formal, precise and business-like.',
  Friendly: 'Warm, approachable and conversational.',
  Casual: 'Relaxed, informal and easy-going.',
};

const TONE_SUFFIX: Record<Tone, string> = {
  Professional: ' Maintain a formal, professional tone.',
  Friendly: ' Be warm, approachable and conversational.',
  Casual: ' Keep your tone relaxed and casual.',
};

interface WizardForm {
  name: string;
  businessName: string;
  tagline: string;
  welcomeMessage: string;
  systemPrompt: string;
  allowedTopics: string;
  tone: Tone;
  accentColor: string;
}

interface ChatMsg { role: 'user' | 'bot'; content: string; }

function buildSystemPrompt(f: WizardForm): string {
  const base = f.businessName
    ? `You are a helpful assistant for ${f.businessName}.${f.tagline ? ` ${f.tagline}` : ''}`
    : (f.systemPrompt.trim() || 'You are a helpful assistant.');
  return base + TONE_SUFFIX[f.tone];
}

// ── Confetti ──────────────────────────────────────────────────────────────────
function Confetti() {
  const COLORS = ['#7c3aed', '#a78bfa', '#ec4899', '#f59e0b', '#10b981', '#60a5fa'];
  const pieces = Array.from({ length: 70 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    color: COLORS[i % COLORS.length],
    delay: `${Math.random() * 1}s`,
    duration: `${1.8 + Math.random() * 1.4}s`,
    size: `${6 + Math.random() * 8}px`,
    rotate: `${Math.random() * 360}deg`,
  }));
  return (
    <>
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(900deg); opacity: 0; }
        }
      `}</style>
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
        {pieces.map(p => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              left: p.left,
              top: 0,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: '2px',
              transform: `rotate(${p.rotate})`,
              animation: `confettiFall ${p.duration} ease-in ${p.delay} forwards`,
              opacity: 0,
            }}
          />
        ))}
      </div>
    </>
  );
}

// ── Step indicator ────────────────────────────────────────────────────────────
function StepIndicator({ current }: { current: Step }) {
  return (
    <div className="flex items-center justify-center mb-10">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  done
                    ? 'bg-violet-600 text-white'
                    : active
                    ? 'bg-violet-600 text-white ring-4 ring-violet-500/20'
                    : 'bg-white/[0.06] text-slate-500'
                }`}
              >
                {done ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className={`text-[11px] font-medium ${active ? 'text-violet-400' : done ? 'text-slate-400' : 'text-slate-600'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-14 h-px mx-2 mb-4 transition-colors ${done ? 'bg-violet-600' : 'bg-white/[0.08]'}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function BotEditor() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>(0);
  const [form, setForm] = useState<WizardForm>({
    name: '',
    businessName: '',
    tagline: '',
    welcomeMessage: 'Hi! How can I help you?',
    systemPrompt: 'You are a helpful assistant.',
    allowedTopics: '',
    tone: 'Friendly',
    accentColor: '#7c3aed',
  });
  const [botId, setBotId] = useState<string | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [copied, setCopied] = useState<'embed' | 'demo' | null>(null);

  // Chat preview
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isNew) return;
    api.bots.get(id!)
      .then(({ bot }) => {
        setForm({
          name: bot.name,
          businessName: '',
          tagline: '',
          welcomeMessage: bot.welcomeMessage,
          systemPrompt: bot.systemPrompt,
          allowedTopics: bot.allowedTopics ?? '',
          tone: 'Friendly',
          accentColor: bot.accentColor,
        });
        setBotId(bot.id);
      })
      .catch(() => setError('Bot not found'))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMsgs]);

  const set = (patch: Partial<WizardForm>) => setForm(prev => ({ ...prev, ...patch }));

  function canProceed() {
    if (step === 0) return form.name.trim().length > 0;
    return true;
  }

  async function saveBot(): Promise<string | null> {
    setSaving(true);
    setError('');
    const payload = {
      name: form.name.trim(),
      welcomeMessage: form.welcomeMessage.trim(),
      systemPrompt: buildSystemPrompt(form),
      allowedTopics: form.allowedTopics.trim(),
      accentColor: form.accentColor,
    };
    try {
      if (isNew && !botId) {
        const { bot } = await api.bots.create(payload);
        setBotId(bot.id);
        navigate(`/bots/${bot.id}`, { replace: true });
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
        return bot.id;
      } else {
        const target = botId ?? id!;
        await api.bots.update(target, payload);
        return target;
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function handleNext() {
    if (step === 2) {
      const saved = await saveBot();
      if (!saved) return;
    }
    setStep(s => Math.min(s + 1, 3) as Step);
  }

  function handleBack() {
    setError('');
    setStep(s => Math.max(s - 1, 0) as Step);
  }

  const sendPreview = useCallback(async () => {
    const msg = chatInput.trim();
    if (!msg || chatLoading) return;
    setChatInput('');
    setChatMsgs(prev => [...prev, { role: 'user', content: msg }]);
    setChatLoading(true);
    try {
      const { response } = await api.bots.previewChat(msg, {
        name: form.name || 'Assistant',
        systemPrompt: buildSystemPrompt(form),
        allowedTopics: form.allowedTopics,
      });
      setChatMsgs(prev => [...prev, { role: 'bot', content: response }]);
    } catch {
      setChatMsgs(prev => [...prev, { role: 'bot', content: 'Preview unavailable right now.' }]);
    } finally {
      setChatLoading(false);
    }
  }, [chatInput, chatLoading, form]);

  function copyText(text: string, which: 'embed' | 'demo') {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(which);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center gap-3 text-slate-500 text-sm">
        <svg className="w-4 h-4 animate-spin text-violet-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        Loading bot…
      </div>
    </div>
  );

  const currentBotId = botId ?? (isNew ? null : id);
  const embedCode = currentBotId
    ? `<script src="${RENDER_URL}/widget.js" data-bot-id="${currentBotId}"><\/script>`
    : null;
  const demoUrl = currentBotId ? `${RENDER_URL}/demo/${currentBotId}` : null;

  return (
    <div className="min-h-screen">
      {showConfetti && <Confetti />}

      <nav className="nav-dark">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
            Back
          </button>
          <span className="text-slate-700">/</span>
          <span className="font-semibold text-white text-sm">
            {isNew ? 'Create Bot' : 'Edit Bot'}
          </span>
        </div>
        {/* Step label in nav on small widths */}
        <span className="text-xs text-slate-500 hidden sm:block">
          Step {step + 1} of {STEPS.length} — {STEPS[step]}
        </span>
      </nav>

      <main className="max-w-2xl mx-auto px-6 pt-24 pb-16">
        <StepIndicator current={step} />

        {error && (
          <div className="mb-5 flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
            <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            </svg>
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        {/* ── Step 0: Identity ── */}
        {step === 0 && (
          <div className="card-dark noise p-6 space-y-5">
            <div className="pb-1 border-b border-white/[0.06]">
              <h2 className="font-semibold text-white">Identity</h2>
              <p className="text-xs text-slate-500 mt-1">What is this bot called and what does it do?</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Bot name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => set({ name: e.target.value })}
                className="input-dark"
                placeholder="Support Bot"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Business name</label>
              <input
                type="text"
                value={form.businessName}
                onChange={e => set({ businessName: e.target.value })}
                className="input-dark"
                placeholder="Acme Corp"
              />
              <p className="mt-1.5 text-xs text-slate-600">Used to personalise the bot's system prompt automatically.</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Purpose / tagline</label>
              <input
                type="text"
                value={form.tagline}
                onChange={e => set({ tagline: e.target.value })}
                className="input-dark"
                placeholder="I help customers with order tracking and returns."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Welcome message</label>
              <input
                type="text"
                value={form.welcomeMessage}
                onChange={e => set({ welcomeMessage: e.target.value })}
                className="input-dark"
              />
            </div>
          </div>
        )}

        {/* ── Step 1: Behavior ── */}
        {step === 1 && (
          <div className="card-dark noise p-6 space-y-5">
            <div className="pb-1 border-b border-white/[0.06]">
              <h2 className="font-semibold text-white">Behavior</h2>
              <p className="text-xs text-slate-500 mt-1">Define how your bot thinks and what it talks about.</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">System instructions</label>
              {form.businessName ? (
                <div className="text-xs text-violet-300 bg-violet-500/10 border border-violet-500/20 rounded-lg px-3 py-2.5 leading-relaxed">
                  <span className="text-slate-500 mr-1">Auto-generated:</span>
                  {buildSystemPrompt(form)}
                </div>
              ) : (
                <textarea
                  rows={4}
                  value={form.systemPrompt}
                  onChange={e => set({ systemPrompt: e.target.value })}
                  className="input-dark resize-none"
                  placeholder="You are a helpful assistant for Acme Corp…"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Allowed topics
                <span className="ml-1 text-slate-600 font-normal">(guardrail)</span>
              </label>
              <input
                type="text"
                value={form.allowedTopics}
                onChange={e => set({ allowedTopics: e.target.value })}
                className="input-dark"
                placeholder="order tracking, returns, shipping"
              />
              <p className="mt-1.5 text-xs text-slate-600">
                Comma-separated. Leave blank to allow any topic. When set, off-topic questions are politely declined.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Tone</label>
              <div className="flex gap-2">
                {TONE_LABELS.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set({ tone: t })}
                    className={`flex-1 border rounded-lg px-3 py-2.5 text-xs text-left transition-all ${
                      form.tone === t
                        ? 'border-violet-500/60 bg-violet-500/10 text-violet-300'
                        : 'border-white/[0.08] text-slate-400 hover:border-white/[0.16]'
                    }`}
                  >
                    <div className="font-medium mb-0.5">{t}</div>
                    <div className="opacity-60">{TONE_HINTS[t]}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Accent color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.accentColor}
                  onChange={e => set({ accentColor: e.target.value })}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-white/[0.1] bg-transparent p-0.5"
                />
                <span className="text-sm text-slate-500 font-mono">{form.accentColor}</span>
                <div className="w-6 h-6 rounded-full ring-2 ring-white/10" style={{ backgroundColor: form.accentColor }} />
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Test ── */}
        {step === 2 && (
          <div className="card-dark noise p-6">
            <div className="pb-4 mb-4 border-b border-white/[0.06]">
              <h2 className="font-semibold text-white">Test your bot</h2>
              <p className="text-xs text-slate-500 mt-1">
                Chat with a live preview using your current config. No messages are saved here.
              </p>
            </div>

            {/* Config summary */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2.5 mb-4 text-xs text-slate-500 space-y-1">
              <div>
                <span className="text-slate-400 font-medium">Prompt: </span>
                {buildSystemPrompt(form).slice(0, 100)}{buildSystemPrompt(form).length > 100 ? '…' : ''}
              </div>
              {form.allowedTopics && (
                <div><span className="text-slate-400 font-medium">Topics: </span>{form.allowedTopics}</div>
              )}
            </div>

            {/* Chat widget preview */}
            <div className="border border-white/[0.08] rounded-xl overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 flex items-center gap-2" style={{ backgroundColor: form.accentColor }}>
                <div className="w-7 h-7 rounded-full bg-black/20 flex items-center justify-center text-white text-sm font-bold">
                  {form.name.charAt(0).toUpperCase() || 'B'}
                </div>
                <span className="text-white text-sm font-medium">{form.name || 'Bot'}</span>
                <span className="ml-auto bg-black/20 text-white/70 text-[10px] px-2 py-0.5 rounded-full">Preview</span>
              </div>

              {/* Messages */}
              <div className="h-64 overflow-y-auto px-4 py-3 space-y-3 bg-[#0a0a0f]">
                {chatMsgs.length === 0 && (
                  <div className="text-center text-xs text-slate-600 mt-20">
                    <div className="text-2xl mb-2">💬</div>
                    Send a message to test how your bot responds.
                  </div>
                )}
                {chatMsgs.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[75%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                        m.role === 'user'
                          ? 'text-white'
                          : 'bg-white/[0.06] border border-white/[0.08] text-slate-200'
                      }`}
                      style={m.role === 'user' ? { backgroundColor: form.accentColor } : {}}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2 flex items-center gap-1">
                      {[0, 0.15, 0.3].map((d, i) => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                          style={{ animationDelay: `${d}s` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-white/[0.06] px-3 py-2 flex gap-2 bg-[#0d0d18]">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendPreview(); } }}
                  placeholder="Type a message…"
                  disabled={chatLoading}
                  className="input-dark flex-1 py-1.5"
                />
                <button
                  onClick={sendPreview}
                  disabled={!chatInput.trim() || chatLoading}
                  className="px-3 py-1.5 rounded-lg text-white text-sm font-medium disabled:opacity-50 transition-opacity"
                  style={{ backgroundColor: form.accentColor }}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Deploy ── */}
        {step === 3 && (
          <div className="space-y-4">
            {/* Celebration banner */}
            {isNew && (
              <div
                className="rounded-xl p-6 text-center"
                style={{ background: `linear-gradient(135deg, ${form.accentColor}cc, #1e1b4b)` }}
              >
                <div className="text-3xl mb-2">🎉</div>
                <h2 className="text-xl font-bold text-white">{form.name} is live!</h2>
                <p className="text-white/70 text-sm mt-1">Your bot is deployed and ready to embed on any website.</p>
              </div>
            )}

            {/* Embed snippet */}
            <div className="card-dark noise p-6">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-white text-sm">Embed on your site</h3>
                {embedCode && (
                  <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                    Ready
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Paste this before the closing{' '}
                <code className="text-xs bg-white/[0.06] text-violet-300 px-1 py-0.5 rounded">&lt;/body&gt;</code> tag:
              </p>

              {embedCode ? (
                <>
                  <div className="bg-black/40 border border-white/[0.06] rounded-lg p-4 font-mono text-xs text-emerald-400 overflow-x-auto whitespace-nowrap leading-relaxed">
                    {embedCode}
                  </div>
                  <button
                    onClick={() => copyText(embedCode, 'embed')}
                    className="mt-3 flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    {copied === 'embed' ? (
                      <>
                        <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                        </svg>
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                        </svg>
                        Copy snippet
                      </>
                    )}
                  </button>
                </>
              ) : (
                <div className="text-xs text-slate-500 italic">Generating snippet…</div>
              )}
            </div>

            {/* Demo link */}
            {demoUrl && (
              <div className="card-dark noise p-6">
                <h3 className="font-semibold text-white text-sm mb-1">Public demo link</h3>
                <p className="text-xs text-slate-500 mb-3">Share a standalone page with clients to preview your bot.</p>
                <div className="bg-black/30 border border-white/[0.06] rounded-lg px-3 py-2 text-xs font-mono text-slate-400 break-all">
                  {demoUrl}
                </div>
                <button
                  onClick={() => copyText(demoUrl, 'demo')}
                  className="mt-3 flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors"
                >
                  {copied === 'demo' ? (
                    <>
                      <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                      </svg>
                      Copy link
                    </>
                  )}
                </button>
              </div>
            )}

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full text-center text-sm text-slate-500 hover:text-slate-300 py-2 transition-colors"
            >
              ← Back to dashboard
            </button>
          </div>
        )}

        {/* Navigation */}
        {step < 3 && (
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={handleBack}
              disabled={step === 0}
              className="btn-ghost px-4 py-2 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← Back
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed() || saving}
              className="btn-primary px-6 py-2.5"
            >
              {saving ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Saving…
                </>
              ) : step === 2 ? 'Save & Deploy →' : 'Next →'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
