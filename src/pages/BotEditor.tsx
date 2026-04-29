import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, type BotPayload } from '../lib/api';

const RENDER_URL = import.meta.env.VITE_API_URL ?? 'https://chatflow-api.onrender.com';

export default function BotEditor() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const navigate = useNavigate();

  const [form, setForm] = useState<BotPayload>({
    name: '',
    welcomeMessage: 'Hi! How can I help you?',
    systemPrompt: 'You are a helpful assistant.',
    accentColor: '#6366f1',
  });
  const [botId, setBotId] = useState<string | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isNew) return;
    api.bots
      .get(id!)
      .then(({ bot }) => {
        setForm({
          name: bot.name,
          welcomeMessage: bot.welcomeMessage,
          systemPrompt: bot.systemPrompt,
          accentColor: bot.accentColor,
        });
        setBotId(bot.id);
      })
      .catch(() => setError('Bot not found'))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (isNew) {
        const { bot } = await api.bots.create(form);
        setBotId(bot.id);
        setSaved(true);
        navigate(`/bots/${bot.id}`, { replace: true });
      } else {
        await api.bots.update(id!, form);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  function copyEmbedCode() {
    const currentBotId = isNew ? botId : id;
    if (!currentBotId) return;
    const code = `<script src="${RENDER_URL}/widget.js" data-bot-id="${currentBotId}"><\/script>`;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (loading) return <div className="p-10 text-gray-400 text-sm">Loading…</div>;

  const currentBotId = isNew ? botId : id;
  const embedCode = currentBotId
    ? `<script src="${RENDER_URL}/widget.js" data-bot-id="${currentBotId}"><\/script>`
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back
        </button>
        <span className="font-semibold text-gray-900">{isNew ? 'New Bot' : 'Edit Bot'}</span>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bot name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Support Bot"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Welcome message</label>
            <input
              type="text"
              value={form.welcomeMessage}
              onChange={(e) => setForm({ ...form, welcomeMessage: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">System prompt</label>
            <textarea
              rows={5}
              value={form.systemPrompt}
              onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="You are a helpful assistant for Acme Corp…"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Accent color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.accentColor}
                onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border border-gray-200"
              />
              <span className="text-sm text-gray-500 font-mono">{form.accentColor}</span>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Saving…' : isNew ? 'Create bot' : 'Save changes'}
            </button>
            {saved && <span className="text-sm text-green-600">Saved!</span>}
          </div>
        </form>

        {/* Embed code — shown after bot is created */}
        {embedCode && (
          <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-1">Embed on your site</h3>
            <p className="text-sm text-gray-500 mb-3">
              Paste this <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">&lt;script&gt;</code> tag before the closing{' '}
              <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">&lt;/body&gt;</code> tag:
            </p>
            <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-xs overflow-x-auto">
              {embedCode}
            </div>
            <button
              onClick={copyEmbedCode}
              className="mt-3 text-sm text-indigo-600 hover:text-indigo-700"
            >
              {copied ? '✓ Copied!' : 'Copy to clipboard'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
