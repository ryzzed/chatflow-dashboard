import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, type Bot, type Conversation } from '../lib/api';

export default function Conversations() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bot, setBot] = useState<Bot | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.bots.get(id!), api.bots.conversations(id!)])
      .then(([{ bot }, { conversations }]) => {
        setBot(bot);
        setConversations(conversations);
      })
      .catch(() => setError('Failed to load conversations'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-10 text-gray-400 text-sm">Loading…</div>;
  if (error) return <div className="p-10 text-red-600 text-sm">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back
        </button>
        <span className="font-semibold text-gray-900">{bot?.name} — Conversations</span>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {conversations.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg mb-2">No conversations yet</p>
            <p className="text-sm">Embed the bot on your site to start receiving messages.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conv) => {
              const firstMsg = conv.messages[0];
              return (
                <div
                  key={conv.id}
                  className="bg-white border border-gray-200 rounded-xl px-5 py-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono text-gray-400 mb-1">{conv.sessionId}</p>
                      {firstMsg ? (
                        <p className="text-sm text-gray-700 truncate">{firstMsg.content}</p>
                      ) : (
                        <p className="text-sm text-gray-400 italic">Empty session</p>
                      )}
                    </div>
                    <div className="ml-4 text-right flex-shrink-0">
                      <p className="text-xs text-gray-400">
                        {new Date(conv.updatedAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {conv._count.messages} message{conv._count.messages !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
