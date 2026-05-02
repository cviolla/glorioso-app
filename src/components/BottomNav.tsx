import { Home, ShoppingBag, ClipboardList, Search } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import { OTPVerification } from "./OTPVerification";

export function BottomNav({ onSearchClick }: { onSearchClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const totalItems = useCartStore(state => state.totalItems());
  const { isVerified, setVerifiedPhone } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleOrdersClick = () => {
    if (isVerified) {
      router.push('/orders');
    } else {
      setIsOTPModalOpen(true);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none">
        <nav className="bg-white/40 backdrop-blur-xl border border-white/60 text-[#532120] shadow-[0_8px_32px_rgba(83,33,32,0.1)] rounded-full w-full max-w-[360px] pointer-events-auto">
          <div className="flex justify-around items-center h-16 px-2">
            <Link 
              href="/menu" 
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${pathname === '/menu' ? 'text-[#ff914a] drop-shadow-sm' : 'text-[#532120] opacity-80 hover:opacity-100'}`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px] font-bold">Início</span>
            </Link>

            <button 
              onClick={onSearchClick}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors text-[#532120] opacity-80 hover:opacity-100`}
            >
              <Search className="w-5 h-5" />
              <span className="text-[10px] font-bold">Busca</span>
            </button>
            
            <Link 
              href="/cart" 
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${pathname === '/cart' ? 'text-[#ff914a] drop-shadow-sm' : 'text-[#532120] opacity-80 hover:opacity-100'}`}
            >
              <motion.div 
                key={totalItems}
                initial={mounted && totalItems > 0 ? { scale: 1.2 } : { scale: 1 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="relative"
              >
                <ShoppingBag className="w-5 h-5" />
                {mounted && totalItems > 0 && (
                  <motion.span 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -top-1.5 -right-2 bg-[#ff914a] text-[#381010] text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full shadow-sm"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </motion.div>
              <span className="text-[10px] font-bold">Sacola</span>
            </Link>

            <button 
              onClick={handleOrdersClick}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${pathname === '/orders' ? 'text-[#ff914a] drop-shadow-sm' : 'text-[#532120] opacity-80 hover:opacity-100'}`}
            >
              <ClipboardList className="w-5 h-5" />
              <span className="text-[10px] font-bold">Pedidos</span>
            </button>
          </div>
        </nav>
      </div>

      <OTPVerification 
        isOpen={isOTPModalOpen}
        onClose={() => setIsOTPModalOpen(false)}
        onVerified={(phone) => {
          setVerifiedPhone(phone);
          router.push('/orders');
        }}
      />
    </>
  );
}
