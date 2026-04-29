import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, type Bot } from '../lib/api';
import { useAuth } from '../lib/auth';
import PaddleCheckout from '../components/PaddleCheckout';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    api.bots
      .list()
      .then(({ bots }) => setBots(bots))
      .catch(() => setError('Failed to load bots'))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    if (!confirm('Delete this bot? This cannot be undone.')) return;
    await api.bots.delete(id);
    setBots((prev) => prev.filter((b) => b.id !== id));
  }

  const planBadge: Record<string, string> = {
    FREE: 'bg-gray-100 text-gray-600',
    STARTER: 'bg-blue-100 text-blue-700',
    PRO: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-bold text-gray-900 text-lg">ChatFlow</span>
          {user && (
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${planBadge[user.plan] ?? ''}`}
            >
              {user.plan}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {user?.plan === 'FREE' && (
            <button
              onClick={() => setShowUpgrade(true)}
              className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700"
            >
              Upgrade to Pro
            </button>
          )}
          <span className="text-sm text-gray-500">{user?.email}</span>
          <button onClick={logout} className="text-sm text-gray-500 hover:text-gray-700">
            Sign out
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Your Bots</h2>
          <button
            onClick={() => navigate('/bots/new')}
            className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            + New Bot
          </button>
        </div>

        {loading && <p className="text-gray-500 text-sm">Loading…</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}

        {!loading && bots.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg mb-2">No bots yet</p>
            <p className="text-sm">Create your first bot to get started.</p>
          </div>
        )}

        <div className="space-y-3">
          {bots.map((bot) => (
            <div
              key={bot.id}
              className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: bot.accentColor }}
                />
                <div>
                  <p className="font-medium text-gray-900">{bot.name}</p>
                  <p className="text-xs text-gray-400">
                    {bot.isActive ? 'Active' : 'Inactive'} ·{' '}
                    {new Date(bot.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to={`/bots/${bot.id}/conversations`}
                  className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50"
                >
                  Conversations
                </Link>
                <Link
                  to={`/bots/${bot.id}`}
                  className="text-sm text-indigo-600 hover:text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-50"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(bot.id)}
                  className="text-sm text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {showUpgrade && <PaddleCheckout onClose={() => setShowUpgrade(false)} />}
    </div>
  );
}
