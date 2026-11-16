'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { DesktopSidebar } from './DesktopSidebar';
import { MessagesRail } from './MessagesRail';

export function AuthenticatedAppFrame({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [checked, setChecked] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let active = true;

    fetch('/api/auth/session', { credentials: 'include', cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!active) return;
        setAuthenticated(Boolean(data?.user));
        setChecked(true);
      })
      .catch(() => {
        if (active) setChecked(true);
      });

    return () => {
      active = false;
    };
  }, [pathname]);

  if (!checked || !authenticated) {
    return <>{children}</>;
  }

  const isMessagesPage = pathname.startsWith('/messages');

  return (
    <>
      <DesktopSidebar />
      {!isMessagesPage && <MessagesRail />}
      <div className={isMessagesPage ? '' : 'md:w-[80%] md:pt-20'}>
        {children}
      </div>
    </>
  );
}
