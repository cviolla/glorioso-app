'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function VisibilityRefresh() {
  const router = useRouter();

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Força o Next.js a revalidar os dados da rota atual
        // Isso resolve o problema de usuários que deixam o app em background
        // e voltam horas depois
        router.refresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [router]);

  return null;
}
