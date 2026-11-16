'use client';

import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  user1: { full_name: string; username: string; avatar_url?: string };
  user2: { full_name: string; username: string; avatar_url?: string };
  last_message?: { content: string; created_at: string };
  unread_count: number;
}

export function MessagesRail({ railWidth = 30 }: { railWidth?: number }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const sessionResponse = await fetch('/api/auth/session', { credentials: 'include', cache: 'no-store' });
        const sessionData = await sessionResponse.json();
        const id = sessionData?.user?.id;
        if (!id) return;

        setUserId(id);
        const response = await fetch(`/api/conversations?user_id=${id}`, { cache: 'no-store' });
        if (!response.ok) return;
        const data = await response.json();
        setConversations((data.data || []).slice(0, 8));
      } catch {
        setConversations([]);
      }
    };

    loadMessages();
  }, []);

  const getOtherUser = (conversation: Conversation) => (
    conversation.user1_id === userId ? conversation.user2 : conversation.user1
  );

  return (
    <aside
      className="hidden md:flex fixed right-0 top-0 z-30 h-screen min-w-[240px] flex-col border-l border-border bg-background"
      style={{ width: `${railWidth}%` }}
    >
      <div className="flex h-20 shrink-0 items-center justify-between border-b border-border px-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Inbox</p>
          <h2 className="font-[family-name:var(--font-syne)] text-xl font-bold">Sharable Messages</h2>
        </div>
        <Link href="/messages" aria-label="Open messages" className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <MessageCircle size={20} strokeWidth={1.8} />
        </Link>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {conversations.length === 0 ? (
          <Link href="/messages" className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-border px-5 text-center transition-colors hover:bg-muted">
            <MessageCircle size={24} className="mb-3 text-muted-foreground" strokeWidth={1.5} />
            <p className="text-sm font-semibold">No messages yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Start a conversation to see it here.</p>
          </Link>
        ) : (
          <div className="space-y-1">
            {conversations.map((conversation) => {
              const otherUser = getOtherUser(conversation);
              return (
                <Link
                  key={conversation.id}
                  href={`/messages?chat=${conversation.id}`}
                  className="flex items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-muted"
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
                    {otherUser.avatar_url ? (
                      <img src={`/api/media/avatars/${otherUser.avatar_url}`} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                        {otherUser.full_name?.charAt(0) || '?'}
                      </div>
                    )}
                    {conversation.unread_count > 0 && <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold">{otherUser.full_name || otherUser.username}</p>
                      {conversation.unread_count > 0 && <span className="text-[10px] font-bold text-red-500">{conversation.unread_count}</span>}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{conversation.last_message?.content || 'No messages yet'}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <Link href="/messages" className="m-3 rounded-full bg-foreground px-4 py-2.5 text-center text-sm font-semibold text-background transition-opacity hover:opacity-85">
        Open all messages
      </Link>
    </aside>
  );
}
