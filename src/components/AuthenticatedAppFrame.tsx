'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { DesktopSidebar } from './DesktopSidebar';
import { MessagesRail } from './MessagesRail';

export function AuthenticatedAppFrame({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [checked, setChecked] = useState(false);
  const [contentWidth, setContentWidth] = useState(70);
  const isResizing = useRef(false);
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

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!isResizing.current) return;
      const nextWidth = (event.clientX / window.innerWidth) * 100;
      setContentWidth(Math.min(85, Math.max(50, nextWidth)));
    };

    const stopResizing = () => {
      isResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', stopResizing);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', stopResizing);
    };
  }, []);

  if (!checked || !authenticated) {
    return <>{children}</>;
  }

  const isMessagesPage = pathname.startsWith('/messages');
  const leftWidth = isMessagesPage ? 100 : contentWidth;
  const rightWidth = 100 - leftWidth;

  const startResizing = () => {
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  return (
    <>
      <DesktopSidebar contentWidth={leftWidth} />
      {!isMessagesPage && <MessagesRail railWidth={rightWidth} />}
      {!isMessagesPage && (
        <div
          role="separator"
          aria-label="Resize content and messages panels"
          aria-orientation="vertical"
          className="fixed bottom-0 top-20 z-50 hidden w-2 -translate-x-1/2 cursor-col-resize items-center justify-center md:flex"
          style={{ right: `${rightWidth}%` }}
          onPointerDown={startResizing}
        >
          <span className="h-full w-px bg-border transition-colors hover:bg-foreground" />
        </div>
      )}
      <div
        className={isMessagesPage ? '' : 'w-full md:pt-20 md:w-[var(--desktop-content-width)]'}
        style={isMessagesPage ? undefined : ({ '--desktop-content-width': `${leftWidth}%` } as React.CSSProperties)}
      >
        {children}
      </div>
    </>
  );
}
