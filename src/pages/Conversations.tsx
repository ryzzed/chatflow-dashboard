import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, type Bot, type Conversation, type ConversationDetail } from '../lib/api';

export default function Conversations() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bot, setBot] = useState<Bot | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [threadCache, setThreadCache] = useState<Record<string, ConversationDetail>>({});
  const [threadLoading, setThreadLoading] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.bots.get(id!), api.bots.conversations(id!)])
      .then(([{ bot }, { conversations }]) => {
        setBot(bot);
        setConversations(conversations);
      })
      .catch(() => setError('Failed to load conversations'))
      .finally(() => setLoading(false));
  }, [id]);

  async function toggleExpanded(convId: string) {
    if (expanded === convId) {
      setExpanded(null);
      return;
    }
    setExpanded(convId);
    if (threadCache[convId]) return;
    setThreadLoading(convId);
    try {
      const { conversation } = await api.bots.conversation(id!, convId);
      setThreadCache((prev) => ({ ...prev, [convId]: conversation }));
    } catch {
      // silently fail — user sees "Failed to load"
    } finally {
      setThreadLoading(null);
    }
  }

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
            onClick={() => navigate('/dashboard')}
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
            {conversations.length > 0 && <span className="ml-1">— click a row to read the thread</span>}
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
              const isOpen = expanded === conv.id;
              const thread = threadCache[conv.id];
              const isLoadingThread = threadLoading === conv.id;

              return (
                <div key={conv.id} className="card-dark overflow-hidden">
                  {/* Summary row — clickable */}
                  <button
                    onClick={() => toggleExpanded(conv.id)}
                    className="w-full flex items-start justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
                  >
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
                    <div className="ml-6 text-right flex-shrink-0 flex items-center gap-3">
                      <div>
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
                      <svg
                        className={`w-4 h-4 text-slate-500 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </div>
                  </button>

                  {/* Expanded thread */}
                  {isOpen && (
                    <div className="border-t border-white/5 px-5 py-4 bg-slate-950/40">
                      {isLoadingThread ? (
                        <div className="flex items-center gap-2 text-slate-500 text-sm py-2">
                          <svg className="w-3.5 h-3.5 animate-spin text-violet-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                          Loading thread…
                        </div>
                      ) : thread ? (
                        <div className="space-y-3">
                          {thread.messages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex gap-3 ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
                            >
                              {msg.role === 'user' && (
                                <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                  </svg>
                                </div>
                              )}
                              <div className={`max-w-[75%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                                msg.role === 'user'
                                  ? 'bg-slate-800 text-slate-200'
                                  : 'text-slate-200'
                              }`}
                              style={msg.role === 'assistant' && bot?.accentColor
                                ? { backgroundColor: bot.accentColor + '22', border: `1px solid ${bot.accentColor}33` }
                                : msg.role === 'assistant'
                                ? { backgroundColor: 'rgb(124 58 237 / 0.13)', border: '1px solid rgb(124 58 237 / 0.2)' }
                                : {}}
                              >
                                {msg.content}
                              </div>
                              {msg.role === 'assistant' && (
                                <div
                                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                                  style={{ backgroundColor: bot?.accentColor ? bot.accentColor + '33' : 'rgb(124 58 237 / 0.2)' }}
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                                    style={{ color: bot?.accentColor ?? '#7c3aed' }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2"/>
                                  </svg>
                                </div>
                              )}
                            </div>
                          ))}
                          <p className="text-[10px] text-slate-700 text-right pt-1">
                            {new Date(thread.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-red-400 py-2">Failed to load thread.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
