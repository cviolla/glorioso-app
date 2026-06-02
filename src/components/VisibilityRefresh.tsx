'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

// Only refreshes if the tab was hidden for more than 30 seconds.
// Avoids hammering the server on every background/foreground on mobile.
const STALE_THRESHOLD_MS = 30_000;

export function VisibilityRefresh() {
  const router = useRouter();
  const hiddenAtRef = useRef<number | null>(null);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        hiddenAtRef.current = Date.now();
      } else if (document.visibilityState === 'visible') {
        const hiddenAt = hiddenAtRef.current;
        if (hiddenAt !== null && Date.now() - hiddenAt > STALE_THRESHOLD_MS) {
          router.refresh();
        }
        hiddenAtRef.current = null;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [router]);

  return null;
}
