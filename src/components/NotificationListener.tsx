"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { ShoppingBag, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OrderNotification {
  id: string;
  customer_name: string;
  total_price: number;
}

export function NotificationListener() {
  const [newOrder, setNewOrder] = useState<OrderNotification | null>(null);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const playNotificationSound = () => {
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
      audio.play().catch(err => console.log("Erro ao reproduzir som:", err));
    };

    const channel = supabase
      .channel("realtime_orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          console.log("Novo pedido recebido!", payload.new);
          setNewOrder(payload.new as OrderNotification);
          playNotificationSound();
          
          // Auto close after 10 seconds
          setTimeout(() => {
            setNewOrder(null);
          }, 10000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <AnimatePresence>
      {newOrder && (
        <motion.div
          initial={{ opacity: 0, x: 100, y: 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed top-6 right-6 z-[9999] w-full max-w-sm bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(56,16,16,0.15)] border-2 border-[var(--color-brand-accent)]/20 p-6 overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-2 h-full bg-[var(--color-brand-accent)]" />
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--color-brand-accent)]/10 flex items-center justify-center shrink-0 border border-[var(--color-brand-accent)]/10">
              <ShoppingBag className="w-6 h-6 text-[var(--color-brand-accent)]" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-black text-[var(--color-brand-dark)] text-lg tracking-tight">Novo Pedido!</h3>
                <button 
                  onClick={() => setNewOrder(null)}
                  className="text-gray-300 hover:text-gray-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm font-bold text-gray-500 mb-3">
                Cliente: <span className="text-[var(--color-brand-dark)]">{newOrder.customer_name}</span>
              </p>
              
              <div className="flex items-center justify-between">
                <span className="text-xl font-black text-[var(--color-brand-accent)]">
                  R$ {newOrder.total_price?.toFixed(2).replace('.', ',')}
                </span>
                <button 
                  onClick={() => {
                    window.location.href = '/admin/orders';
                    setNewOrder(null);
                  }}
                  className="bg-[var(--color-brand-dark)] text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl hover:bg-[var(--color-brand-accent)] transition-all"
                >
                  Ver Detalhes
                </button>
              </div>
            </div>
          </div>
          
          {/* Progress bar for auto-close */}
          <motion.div 
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: 10, ease: "linear" }}
            className="absolute bottom-0 left-0 h-1 bg-[var(--color-brand-accent)]/20"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
