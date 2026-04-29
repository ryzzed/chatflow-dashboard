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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center gap-3 text-slate-500 text-sm">
        <svg className="w-4 h-4 animate-spin text-violet-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        Loading conversations…
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center gap-2 text-red-400 text-sm">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        </svg>
        {error}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="nav-dark">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
            Back
          </button>
          <span className="text-slate-700">/</span>
          <div className="flex items-center gap-2">
            {bot?.accentColor && (
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: bot.accentColor }}/>
            )}
            <span className="font-semibold text-white text-sm">{bot?.name}</span>
            <span className="text-slate-600 text-sm">Conversations</span>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">Conversations</h1>
          <p className="text-sm text-slate-600 mt-0.5">
            {conversations.length} session{conversations.length !== 1 ? 's' : ''} recorded
          </p>
        </div>

        {conversations.length === 0 ? (
          <div className="card-dark noise text-center py-20 px-8">
            <div className="w-14 h-14 rounded-2xl bg-violet-600/20 border border-violet-500/20 flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-violet-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
            </div>
            <p className="text-lg font-semibold text-white mb-2">No conversations yet</p>
            <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              Once you embed the bot on your site and visitors start chatting, sessions will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 animate-fade-in">
            {conversations.map((conv) => {
              const firstMsg = conv.messages[0];
              return (
                <div key={conv.id} className="card-dark flex items-start justify-between px-5 py-4 group">
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-mono text-slate-600 mb-1 tracking-wide">
                      {conv.sessionId}
                    </p>
                    {firstMsg ? (
                      <p className="text-sm text-slate-300 truncate">{firstMsg.content}</p>
                    ) : (
                      <p className="text-sm text-slate-600 italic">Empty session</p>
                    )}
                  </div>
                  <div className="ml-6 text-right flex-shrink-0">
                    <p className="text-xs text-slate-600">
                      {new Date(conv.updatedAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5 flex items-center justify-end gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                      </svg>
                      {conv._count.messages} msg{conv._count.messages !== 1 ? 's' : ''}
                    </p>
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
