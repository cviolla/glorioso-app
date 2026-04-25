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
    <nav className="fixed bottom-0 w-full bg-[#532120] text-[#f8ece3] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
      <div className="flex justify-around items-center h-20 max-w-md mx-auto px-4">
        <Link 
          href="/menu" 
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${pathname === '/menu' ? 'text-[#ff914a]' : 'text-[#f8ece3] opacity-80 hover:opacity-100'}`}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs font-semibold">Cardápio</span>
        </Link>
        
        <Link 
          href="/cart" 
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${pathname === '/cart' ? 'text-[#ff914a]' : 'text-[#f8ece3] opacity-80 hover:opacity-100'}`}
        >
          <div className="relative">
            <ShoppingBag className="w-6 h-6" />
            {mounted && totalItems > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#ff914a] text-[#381010] text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-xs font-semibold">Carrinho</span>
        </Link>

        <Link 
          href="/"
          className="flex flex-col items-center gap-1 p-2 rounded-xl transition-colors text-[#f8ece3] opacity-80 hover:opacity-100"
        >
          <LogOut className="w-6 h-6" />
          <span className="text-xs font-semibold">Sair</span>
        </Link>
      </div>
    </nav>
  );
}
