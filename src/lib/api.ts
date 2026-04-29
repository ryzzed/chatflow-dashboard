const BASE_URL = import.meta.env.VITE_API_URL ?? 'https://chatflow-api.onrender.com';

function getToken(): string | null {
  return localStorage.getItem('chatflow_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? `Request failed: ${res.status}`);
  }
  return data as T;
}

export const api = {
  auth: {
    register: (email: string, password: string, name?: string) =>
      request<{ user: User; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      }),
    login: (email: string, password: string) =>
      request<{ user: User; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    me: () => request<{ user: User }>('/auth/me'),
  },

  bots: {
    list: () => request<{ bots: Bot[] }>('/bots'),
    get: (id: string) => request<{ bot: Bot }>(`/bots/${id}`),
    create: (data: BotPayload) =>
      request<{ bot: Bot }>('/bots', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<BotPayload>) =>
      request<{ bot: Bot }>(`/bots/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) =>
      fetch(`${BASE_URL}/bots/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      }),
    conversations: (id: string) =>
      request<{ conversations: Conversation[] }>(`/bots/${id}/conversations`),
  },
};

export interface User {
  id: string;
  email: string;
  name?: string;
  plan: 'FREE' | 'STARTER' | 'PRO';
  createdAt: string;
}

export interface Bot {
  id: string;
  name: string;
  welcomeMessage: string;
  systemPrompt: string;
  accentColor: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BotPayload {
  name: string;
  welcomeMessage?: string;
  systemPrompt?: string;
  accentColor?: string;
  isActive?: boolean;
}

export interface Conversation {
  id: string;
  sessionId: string;
  createdAt: string;
  updatedAt: string;
  messages: { content: string; role: string; createdAt: string }[];
  _count: { messages: number };
}
