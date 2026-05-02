"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle, 
  ChevronRight,
  ArrowLeft,
  Star,
  History,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BottomNav } from "@/components/BottomNav";

type OrderStatus = 'pending' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';

const statusConfig = {
  pending: { label: 'Pendente', color: 'text-amber-600 bg-amber-50', icon: Clock },
  preparing: { label: 'Em Preparo', color: 'text-blue-600 bg-blue-50', icon: ShoppingBag },
  shipped: { label: 'Saiu para Entrega', color: 'text-purple-600 bg-purple-50', icon: Truck },
  delivered: { label: 'Entregue', color: 'text-green-600 bg-green-50', icon: CheckCircle2 },
  cancelled: { label: 'Cancelado', color: 'text-red-600 bg-red-50', icon: XCircle },
};

export default function MyOrdersPage() {
  const { verifiedPhone, isVerified } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isVerified) {
      // Pequeno delay para garantir que o LocalStorage foi lido pelo Zustand persist
      const timer = setTimeout(() => {
        if (!useAuthStore.getState().isVerified) {
          router.push('/menu');
        }
      }, 500);
      return () => clearTimeout(timer);
    }

    const fetchMyOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_phone', verifiedPhone)
        .order('created_at', { ascending: false });

      if (data) setOrders(data);
      setLoading(false);
    };

    fetchMyOrders();
  }, [isVerified, verifiedPhone, router]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#fff5e9] pb-32">
      {/* Background Image Pattern */}
      <div 
        className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{ 
          backgroundImage: "url('/background_home.jpg')",
          backgroundRepeat: 'repeat',
          backgroundSize: '320px',
          backgroundAttachment: 'fixed'
        }}
      />

      <header className="p-6 flex items-center gap-4 border-b border-[#532120]/10 sticky top-0 bg-[#fff5e9]/80 backdrop-blur-md z-40">
        <button onClick={() => router.push('/menu')} className="p-2 hover:bg-[#532120]/5 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-[#532120]" />
        </button>
        <div className="flex flex-col">
          <h1 className="text-2xl font-black text-[#381010] leading-none">Meus Pedidos</h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{verifiedPhone}</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6 relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#ff914a] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Buscando seu histórico...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 px-6 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
            <History className="w-16 h-16 text-gray-200 mx-auto mb-6" />
            <h2 className="text-2xl font-black text-[#381010] mb-2">Nenhum pedido ainda?</h2>
            <p className="text-gray-400 text-sm mb-8">Parece que você ainda não experimentou nossas delícias. Que tal começar agora?</p>
            <button 
              onClick={() => router.push('/menu')}
              className="bg-[#ff914a] text-white font-black py-4 px-8 rounded-2xl shadow-lg shadow-[#ff914a]/20 hover:scale-105 active:scale-95 transition-all"
            >
              Ver Cardápio
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-[#ff914a]" />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Toque em um pedido para ver detalhes</p>
            </div>
            
            {orders.map((order, idx) => {
              const status = statusConfig[order.status as OrderStatus] || statusConfig.pending;
              return (
                <motion.div 
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#ff914a]/20 transition-all active:scale-[0.98] cursor-pointer relative overflow-hidden"
                >
                  {/* Status Banner */}
                  <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl text-[9px] font-black uppercase tracking-widest ${status.color}`}>
                    {status.label}
                  </div>

                  <div className="mb-4">
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Pedido #{order.id.slice(-4).toUpperCase()}</span>
                    <p className="text-sm font-bold text-[#381010] mt-1">
                      {new Date(order.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })} às {new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="space-y-2 mb-6">
                    {order.items.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between items-center bg-gray-50/50 p-2 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 flex items-center justify-center bg-white border border-gray-100 rounded-lg text-[10px] font-black text-[#ff914a]">
                            {item.quantity}x
                          </span>
                          <span className="text-xs font-bold text-[#381010]">{item.name}</span>
                        </div>
                        <span className="text-xs font-black text-gray-400">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Pago</p>
                      <p className="text-2xl font-black text-[#381010] tracking-tighter">R$ {order.total_price.toFixed(2).replace('.', ',')}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      {order.status === 'delivered' && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            // Futura lógica de avaliação
                          }}
                          className="flex items-center gap-2 bg-[#ff914a] text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#ff914a]/20 hover:scale-105 active:scale-95 transition-all"
                        >
                          <Star className="w-3.5 h-3.5" /> Avaliar
                        </button>
                      )}
                      <div className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl text-gray-300 group-hover:text-[#ff914a] transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
