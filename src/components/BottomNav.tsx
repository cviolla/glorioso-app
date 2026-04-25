"use client";

import { Home, ShoppingBag, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useEffect, useState } from "react";

export function BottomNav() {
  const pathname = usePathname();
  const totalItems = useCartStore(state => state.totalItems());
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none">
      <nav className="bg-[#532120]/85 backdrop-blur-lg border border-white/10 text-[#f8ece3] shadow-2xl rounded-full w-full max-w-[320px] pointer-events-auto">
        <div className="flex justify-around items-center h-16 px-2">
          <Link 
            href="/menu" 
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${pathname === '/menu' ? 'text-[#ff914a]' : 'text-[#f8ece3] opacity-80 hover:opacity-100'}`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-bold">Cardápio</span>
          </Link>
          
          <Link 
            href="/cart" 
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${pathname === '/cart' ? 'text-[#ff914a]' : 'text-[#f8ece3] opacity-80 hover:opacity-100'}`}
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#ff914a] text-[#381010] text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full shadow-sm">
                  {totalItems}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold">Carrinho</span>
          </Link>

          <Link 
            href="/"
            className="flex flex-col items-center gap-1 p-2 rounded-xl transition-colors text-[#f8ece3] opacity-80 hover:opacity-100"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[10px] font-bold">Sair</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
