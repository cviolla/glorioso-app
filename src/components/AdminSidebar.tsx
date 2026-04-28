"use client";

import { ReactNode } from 'react';
import Link from 'next/link';
import { Package, LayoutDashboard, Settings, LogOut } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter, usePathname } from 'next/navigation';
import { NotificationListener } from './NotificationListener';

export function AdminSidebar({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[var(--color-brand-light)] flex flex-col pb-20 md:pb-0 md:flex-row">
      <NotificationListener />
      
      {/* Mobile Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20 md:hidden print:hidden">
        <div className="flex items-center gap-2">
          <img src="/logo glorioso brownie.png" alt="Admin" className="w-10 h-10 object-contain" />
          <h1 className="font-black text-[var(--color-brand-dark)] text-lg tracking-tight">ADMIN</h1>
        </div>
        <button 
          onClick={handleLogout}
          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
          title="Sair"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 min-h-screen sticky top-0 print:hidden">
        <div className="p-8 flex flex-col items-center border-b border-gray-50">
          <img src="/logo glorioso brownie.png" alt="Admin" className="w-24 h-24 object-contain mb-4" />
          <h1 className="font-black text-[var(--color-brand-dark)] text-xl tracking-tighter">Glorioso <span className="text-[var(--color-brand-accent)]">Admin</span></h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link 
            href="/admin" 
            className={`flex items-center gap-3 px-4 py-4 font-black text-xs uppercase tracking-widest rounded-2xl transition-all ${
              pathname === '/admin' 
                ? 'bg-[var(--color-brand-accent)] text-white shadow-lg shadow-[var(--color-brand-accent)]/20' 
                : 'text-gray-400 hover:bg-gray-50 hover:text-[var(--color-brand-dark)]'
            }`}
          >
            <Package className="w-5 h-5" />
            Produtos
          </Link>
          <Link 
            href="/admin/orders" 
            className={`flex items-center gap-3 px-4 py-4 font-black text-xs uppercase tracking-widest rounded-2xl transition-all ${
              pathname === '/admin/orders' 
                ? 'bg-[var(--color-brand-accent)] text-white shadow-lg shadow-[var(--color-brand-accent)]/20' 
                : 'text-gray-400 hover:bg-gray-50 hover:text-[var(--color-brand-dark)]'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Pedidos
          </Link>
          <Link 
            href="/admin/settings" 
            className={`flex items-center gap-3 px-4 py-4 font-black text-xs uppercase tracking-widest rounded-2xl transition-all ${
              pathname === '/admin/settings' 
                ? 'bg-[var(--color-brand-accent)] text-white shadow-lg shadow-[var(--color-brand-accent)]/20' 
                : 'text-gray-400 hover:bg-gray-50 hover:text-[var(--color-brand-dark)]'
            }`}
          >
            <Settings className="w-5 h-5" />
            Configurações
          </Link>
        </nav>

        {/* Admin Footer */}
        <div className="p-6 border-t border-gray-50 space-y-4">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 text-rose-500 font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 rounded-xl transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sair do Painel
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-12 max-w-6xl mx-auto w-full">
        {children}
      </main>

      {/* Mobile Bottom Nav - Optimized */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around p-3 pb-safe z-20 md:hidden print:hidden">
        <Link href="/admin" className={`flex flex-col items-center gap-1 transition-colors ${pathname === '/admin' ? 'text-[var(--color-brand-accent)]' : 'text-gray-400'}`}>
          <Package className="w-6 h-6" />
          <span className="text-[10px] font-black uppercase tracking-tight">Produtos</span>
        </Link>
        <Link href="/admin/orders" className={`flex flex-col items-center gap-1 transition-colors ${pathname === '/admin/orders' ? 'text-[var(--color-brand-accent)]' : 'text-gray-400'}`}>
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px] font-black uppercase tracking-tight">Pedidos</span>
        </Link>
        <Link href="/admin/settings" className={`flex flex-col items-center gap-1 transition-colors ${pathname === '/admin/settings' ? 'text-[var(--color-brand-accent)]' : 'text-gray-400'}`}>
          <Settings className="w-6 h-6" />
          <span className="text-[10px] font-black uppercase tracking-tight">Ajustes</span>
        </Link>
      </nav>
    </div>
  );
}
