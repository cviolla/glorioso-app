import { ReactNode } from 'react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { CopyProtection } from '@/components/CopyProtection';

export const metadata = {
  title: "Admin",
  description: "Painel Administrativo - Glorioso Brownie",
  icons: {
    icon: "/admin-icon.png",
    apple: "/admin-icon.png",
  },
  openGraph: {
    title: 'Admin | Glorioso Brownie',
    description: 'Acesso restrito ao painel de gestão do Glorioso Brownie.',
    type: 'website',
    images: [
      {
        url: '/admin-icon.png',
        width: 512,
        height: 512,
        alt: 'Admin Icon Glorioso Brownie',
      },
    ],
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Isso acontece em Server Components, ignoramos pois o middleware trata
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Isso acontece em Server Components
          }
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Proteção extra além do middleware
  if (!user) {
    redirect('/admin/login');
  }

  return (
    <AdminSidebar>
      <CopyProtection />
      {children}
    </AdminSidebar>
  );
}
