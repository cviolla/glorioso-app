import { ReactNode } from 'react';
import Link from 'next/link';
import { Package, LayoutDashboard, Settings } from 'lucide-react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col pb-20 md:pb-0 md:flex-row">
      {/* Mobile Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between sticky top-0 z-20 md:hidden">
        <h1 className="font-black text-[#381010] text-xl tracking-tight">GB <span className="text-[#ff914a]">ADMIN</span></h1>
        <div className="w-8 h-8 bg-[#ff914a] text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
          A
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 min-h-screen sticky top-0">
        <div className="p-6 border-b border-gray-100">
          <h1 className="font-black text-[#381010] text-2xl tracking-tight">Glorioso <br/><span className="text-[#ff914a]">Admin</span></h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-gray-500 font-medium hover:bg-gray-50 hover:text-[#ff914a] rounded-xl transition-all">
            <Package className="w-5 h-5" />
            Produtos
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-3 px-4 py-3 text-gray-500 font-medium hover:bg-gray-50 hover:text-[#ff914a] rounded-xl transition-all">
            <LayoutDashboard className="w-5 h-5" />
            Pedidos
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 text-gray-500 font-medium hover:bg-gray-50 hover:text-[#ff914a] rounded-xl transition-all">
            <Settings className="w-5 h-5" />
            Configurações
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-3 pb-safe z-20 md:hidden">
        <Link href="/admin" className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#ff914a]">
          <Package className="w-6 h-6" />
          <span className="text-[10px] font-bold">Produtos</span>
        </Link>
        <Link href="/admin/orders" className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#ff914a]">
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px] font-medium">Pedidos</span>
        </Link>
        <Link href="/admin/settings" className="flex flex-col items-center gap-1 text-gray-400 hover:text-[#ff914a]">
          <Settings className="w-6 h-6" />
          <span className="text-[10px] font-medium">Ajustes</span>
        </Link>
      </nav>
    </div>
  );
}
