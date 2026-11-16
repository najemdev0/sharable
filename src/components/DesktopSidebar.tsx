'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Home, Search, PlusSquare, Bell, UserCircle } from 'lucide-react';
import { CreateBottomSheet } from './CreateBottomSheet';

export function DesktopSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      let id = session?.user?.id;
      if (!id) {
        try {
          const response = await fetch('/api/auth/session', { credentials: 'include', cache: 'no-store' });
          const data = await response.json();
          id = data?.user?.id;
        } catch {
          id = undefined;
        }
      }
      if (!id) return;
      setUserId(id);

      const { data } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', id)
        .single();

      if (data?.avatar_url?.trim()) {
        setUserAvatarUrl(`/api/media/avatars/${data.avatar_url}`);
      }
    };

    getSession();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchUnreadCount = async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      setUnreadCount(count ?? 0);
    };

    fetchUnreadCount();
    const channel = supabase
      .channel('desktop-unread-alerts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, fetchUnreadCount)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const query = String(form.get('query') || '').trim();
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : '/search');
  };

  const navLinkClass = (href: string) => {
    const active = pathname === href;
    return `flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors ${
      active
        ? 'bg-foreground text-background'
        : 'text-foreground hover:bg-muted'
    }`;
  };

  return (
    <>
      <CreateBottomSheet isOpen={showCreateSheet} onClose={() => setShowCreateSheet(false)} />

      <header className="hidden md:flex fixed left-0 top-0 z-40 h-20 w-[80%] items-center gap-3 border-b border-border bg-background/95 px-6 backdrop-blur">
        <Link href="/home" aria-label="Home" className={navLinkClass('/home')}>
          <Home size={21} strokeWidth={1.8} fill={pathname === '/home' ? 'currentColor' : 'none'} />
        </Link>

        <form onSubmit={handleSearch} className="min-w-0 flex-1">
          <label className="sr-only" htmlFor="desktop-search">Search Sharable</label>
          <div className="flex h-11 w-full items-center rounded-full bg-muted px-4 transition-colors focus-within:ring-2 focus-within:ring-foreground/20">
            <Search size={19} className="mr-2 shrink-0 text-muted-foreground" strokeWidth={1.8} />
            <input
              id="desktop-search"
              name="query"
              type="search"
              placeholder="Search Sharable"
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
        </form>

        <button
          type="button"
          aria-label="Create"
          onClick={() => setShowCreateSheet(true)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
        >
          <PlusSquare size={21} strokeWidth={1.8} />
        </button>

        <Link href="/alerts" aria-label="Alerts" className={`${navLinkClass('/alerts')} relative`}>
          <Bell size={21} strokeWidth={1.8} fill={pathname === '/alerts' ? 'currentColor' : 'none'} />
          {unreadCount > 0 && (
            <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        <Link href="/profile" aria-label="Profile" className={`${navLinkClass('/profile')} overflow-hidden`}>
          {userAvatarUrl ? (
            <img src={userAvatarUrl} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <UserCircle size={22} strokeWidth={1.8} fill={pathname === '/profile' ? 'currentColor' : 'none'} />
          )}
        </Link>
      </header>
    </>
  );
}
