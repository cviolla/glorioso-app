"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, Search, RefreshCw } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
  variant?: string;
  addons?: { name: string; price: number }[];
};

type Order = {
  id: string;
  created_at: string;
  status: 'pending' | 'preparing' | 'shipped' | 'delivered' | 'cancelled' | 'archived';
  total_price: number;
  delivery_type: 'delivery' | 'pickup' | null;
  items: OrderItem[];
};

export default function OrdersPage() {
  const [trackedIds, setTrackedIds] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchOrders = async (idsToSearch: string[]) => {
    if (!idsToSearch || idsToSearch.length === 0) {
      setSearched(true);
      return;
    }

    setIsLoading(true);
    setSearched(true);
    try {
      const { data, error } = await supabase
        .rpc('get_public_orders', { order_ids: idsToSearch });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsHydrated(true);
    const savedIds = JSON.parse(localStorage.getItem("glorioso_tracked_orders") || "[]");
    if (savedIds && savedIds.length > 0) {
      setTrackedIds(savedIds);
      fetchOrders(savedIds);
    } else {
      setSearched(true);
    }
  }, []);

  const getStatusConfig = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return { label: 'Pendente', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-200' };
      case 'preparing':
        return { label: 'Preparando', icon: Package, color: 'text-[#0066FF]', bg: 'bg-blue-100', border: 'border-blue-200' };
      case 'shipped':
        return { label: 'A Caminho', icon: Package, color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-200' };
      case 'delivered':
      case 'archived':
        return { label: 'Concluído', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' };
      case 'cancelled':
        return { label: 'Cancelado', icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' };
      default:
        return { label: 'Pendente', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-200' };
    }
  };

  // Setup Realtime Subscription and Auto-refresh
  useEffect(() => {
    if (trackedIds.length === 0) return;

    // Realtime Supabase
    const filterString = `id=in.(${trackedIds.join(',')})`;
    const channel = supabase
      .channel('orders-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: filterString
        },
        () => {
          // Atualiza a lista quando houver mudança num pedido em realtime
          fetchOrders(trackedIds);
        }
      )
      .subscribe();

    // Fallback polling
    const hasActiveOrders = orders.some(o => ['pending', 'preparing', 'shipped'].includes(o.status));
    let interval: NodeJS.Timeout;
    if (hasActiveOrders) {
      interval = setInterval(() => {
        fetchOrders(trackedIds);
      }, 30000);
    }

    return () => {
      supabase.removeChannel(channel);
      if (interval) clearInterval(interval);
    };
  }, [orders, trackedIds]);

  if (!isHydrated) return null;

  return (
    <div className="min-h-screen font-sans bg-[#f8ece3] text-[#381010] pb-20">
      <header className="p-5 flex items-center gap-3 border-b border-[#532120]/10 sticky top-0 z-40 bg-[#f8ece3]/95 backdrop-blur-md">
        <Link href="/menu" className="hover:bg-[#532120]/10 p-2 -ml-2 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="font-bold text-lg">Meus Pedidos</span>
      </header>

      <main className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-[#381010] mb-1">Acompanhamento Ativo</h2>
            <p className="text-sm text-gray-600">
              Seus pedidos recentes neste dispositivo.
            </p>
          </div>
          <button 
            onClick={() => fetchOrders(trackedIds)}
            disabled={isLoading || trackedIds.length === 0}
            className="bg-[#532120]/10 text-[#532120] p-3 rounded-xl font-bold flex items-center justify-center disabled:opacity-50 transition-colors hover:bg-[#532120]/20"
            aria-label="Atualizar pedidos"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <AnimatePresence mode="popLayout">
          {searched && orders.length === 0 && !isLoading && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-10"
            >
              <div className="w-16 h-16 bg-[#532120]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-[#532120]/40" />
              </div>
              <h3 className="font-bold text-[#381010] mb-2">Nenhum pedido recente</h3>
              <p className="text-sm text-gray-500">
                Não encontramos pedidos recentes feitos por este aparelho.
              </p>
            </motion.div>
          )}

          {orders.map((order, index) => {
            const StatusIcon = getStatusConfig(order.status).icon;
            const statusConfig = getStatusConfig(order.status);
            const shortId = order.id.slice(-6).toUpperCase();
            
            return (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 overflow-hidden relative"
              >
                {/* Status Indicator */}
                <div className={`absolute top-0 inset-x-0 h-1.5 ${statusConfig.bg}`}>
                  <div className={`h-full w-1/3 ${statusConfig.bg.replace('100', '400')} animate-pulse rounded-r-full`}></div>
                </div>

                <div className="flex justify-between items-start mb-4 mt-2">
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pedido BR-{shortId}</span>
                    <p className="text-sm font-semibold text-[#381010] mt-0.5">
                      {new Date(order.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {order.status === 'cancelled' && (
                    <div className="px-3 py-1.5 rounded-lg border flex items-center gap-1.5 bg-red-100 border-red-200 text-red-600">
                      <XCircle className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wide">Cancelado</span>
                    </div>
                  )}
                </div>

                {order.status !== 'cancelled' && (
                  <div className="mb-6 mt-2 relative">
                    <div className="absolute top-3 left-0 w-full h-0.5 bg-gray-200"></div>
                    <div 
                      className="absolute top-3 left-0 h-0.5 bg-[#532120] transition-all duration-500"
                      style={{ width: order.status === 'pending' ? '15%' : order.status === 'preparing' ? '50%' : order.status === 'shipped' ? '75%' : '100%' }}
                    ></div>
                    
                    <div className="relative flex justify-between">
                      <div className="flex flex-col items-center gap-1 bg-white px-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 transition-colors ${['pending', 'preparing', 'shipped', 'delivered', 'archived'].includes(order.status) ? 'bg-[#532120] text-white' : 'bg-gray-200 text-gray-400'}`}>
                          <Clock className="w-3.5 h-3.5" />
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wide ${['pending', 'preparing', 'shipped', 'delivered', 'archived'].includes(order.status) ? 'text-[#532120]' : 'text-gray-400'}`}>Recebido</span>
                      </div>
                      
                      <div className="flex flex-col items-center gap-1 bg-white px-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 transition-colors ${['preparing', 'shipped', 'delivered', 'archived'].includes(order.status) ? 'bg-[#ff914a] text-white' : 'bg-gray-200 text-gray-400'}`}>
                          <Package className="w-3.5 h-3.5" />
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wide ${['preparing', 'shipped', 'delivered', 'archived'].includes(order.status) ? 'text-[#ff914a]' : 'text-gray-400'}`}>Preparando</span>
                      </div>
                      
                      <div className="flex flex-col items-center gap-1 bg-white px-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 transition-colors ${['delivered', 'archived'].includes(order.status) ? 'bg-green-500 text-white' : 'bg-gray-200 text-white'}`}>
                          <CheckCircle className="w-3.5 h-3.5" />
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wide ${['delivered', 'archived'].includes(order.status) ? 'text-green-700' : 'text-[#381010]/40'}`}>Concluído</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3 mb-4 border-t border-gray-100 pt-4">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <div className="flex gap-2">
                        <span className="font-bold text-gray-500">{item.quantity}x</span>
                        <div>
                          <p className="font-semibold text-[#381010]">{item.name}</p>
                          {item.variant && <p className="text-xs text-gray-500">{item.variant}</p>}
                          {item.addons && item.addons.length > 0 && (
                            <p className="text-xs text-[#ff914a]">+ {item.addons.map(a => a.name).join(', ')}</p>
                          )}
                        </div>
                      </div>
                      <span className="font-medium text-[#381010]">
                        R$ {((item.price + (item.addons?.reduce((sum, a) => sum + a.price, 0) || 0)) * item.quantity).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {order.delivery_type === 'pickup' ? 'Retirada' : 'Delivery'}
                    </span>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-0.5">Total</p>
                      <p className="font-bold text-lg text-[#532120]">R$ {order.total_price.toFixed(2).replace('.', ',')}</p>
                    </div>
                  </div>
                  {['delivered', 'archived'].includes(order.status) && (
                    <Link 
                      href="/menu"
                      className="w-full mt-2 bg-[#f8ece3] text-[#532120] border border-[#532120]/20 py-3 rounded-xl font-bold text-center text-sm hover:bg-[#532120]/10 transition-colors"
                    >
                      Fazer novo pedido
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </main>
      
      {orders.some(o => ['pending', 'preparing', 'shipped'].includes(o.status)) && (
        <div className="fixed bottom-6 inset-x-0 flex justify-center z-50 pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#532120] text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#532120]/20 pointer-events-auto"
          >
            <RefreshCw className="w-3 h-3 animate-spin" /> Atualizando em tempo real
          </motion.div>
        </div>
      )}
    </div>
  );
}
