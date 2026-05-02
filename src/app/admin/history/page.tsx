"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  ChevronRight, 
  TrendingUp, 
  ShoppingBag,
  Loader2,
  Search,
  CalendarDays,
  Filter,
  CreditCard,
  Phone,
  MapPin,
  Truck,
  Clock,
  Printer,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  variant?: string;
  addons?: { name: string; price: number }[];
}

interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  delivery_type: 'delivery' | 'pickup';
  address_street?: string;
  address_number?: string;
  address_neighborhood?: string;
  address_complement?: string;
  address_reference?: string;
  payment_method: string;
  order_time: string;
  observation?: string;
  total_price: number;
  items: OrderItem[];
  status: string;
}

interface DailySummary {
  date: string;
  total: number;
  count: number;
  orders: Order[];
}

export default function AdminHistoryPage() {
  const [dailySummaries, setDailySummaries] = useState<DailySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<DailySummary | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [availableMethods, setAvailableMethods] = useState<string[]>([]);

  const fetchHistory = useCallback(async (isInitial = false) => {
    if (!isInitial) setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'delivered')
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      if (data) {
        const groups: Record<string, DailySummary> = {};
        
        data.forEach((order: Order) => {
          const date = new Date(order.created_at).toLocaleDateString('pt-BR', { 
            timeZone: 'America/Sao_Paulo',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          });
          
          if (!groups[date]) {
            groups[date] = {
              date,
              total: 0,
              count: 0,
              orders: []
            };
          }
          
          groups[date].total += Number(order.total_price);
          groups[date].count += 1;
          groups[date].orders.push(order);
        });

        setDailySummaries(Object.values(groups));

        const methods = Array.from(new Set(data.map((o: Order) => o.payment_method))).filter(Boolean) as string[];
        setAvailableMethods(methods);
      }
    } catch (err) {
      console.error("Erro ao buscar histórico:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(true);
  }, [fetchHistory]);

  const filteredSummaries = dailySummaries.map(summary => {
    if (paymentFilter === 'all') return summary;
    
    const filteredOrders = summary.orders.filter(o => o.payment_method === paymentFilter);
    
    return {
      ...summary,
      total: filteredOrders.reduce((sum, o) => sum + Number(o.total_price), 0),
      count: filteredOrders.length,
      orders: filteredOrders
    };
  }).filter(summary => 
    summary.date.includes(searchQuery) && summary.count > 0
  );

  useEffect(() => {
    if (selectedDay) {
      const updated = filteredSummaries.find(s => s.date === selectedDay.date);
      queueMicrotask(() => {
        setSelectedDay(updated || null);
      });
    }
  }, [paymentFilter, searchQuery, dailySummaries, selectedDay?.date, filteredSummaries]);

  const handlePrintOrder = () => {
    if (!selectedOrder) return;
    window.open(`/admin/orders/${selectedOrder.id}/print`, '_blank');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header Section - Refined for Mobile */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1 md:px-0">
        <div>
          <h1 className="text-lg md:text-xl font-black text-[var(--color-brand-dark)] tracking-tight">Histórico de Vendas</h1>
          <p className="text-gray-400 font-medium text-[9px] md:text-[11px] uppercase tracking-wider">Gestão financeira diária</p>
        </div>
        <div className="grid grid-cols-2 gap-2 px-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="BUSCAR" 
              className="w-full h-9 pl-8 pr-2 bg-white border border-gray-100 rounded-xl outline-none focus:border-[var(--color-brand-accent)]/20 transition-all text-[10px] md:text-[11.5px] font-bold"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <select 
              className="w-full h-9 pl-8 pr-6 bg-white border border-gray-100 rounded-xl outline-none focus:border-[var(--color-brand-accent)]/20 transition-all text-[10px] md:text-[11.5px] font-bold appearance-none cursor-pointer uppercase"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
            >
              <option value="all">FILTRAR</option>
              {availableMethods.map(method => (
                <option key={method} value={method}>{method.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        {/* List of Days - Compacted */}
        <div className="lg:col-span-1 space-y-2 md:space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 md:py-12 bg-white rounded-2xl border border-dashed border-gray-200">
              <Loader2 className="w-5 h-5 text-[#ff914a] animate-spin mb-2" />
              <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest">Carregando...</p>
            </div>
          ) : filteredSummaries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 md:py-12 bg-white rounded-2xl border border-dashed border-gray-200">
              <CalendarDays className="w-6 h-6 text-gray-100 mb-2" />
              <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest">Sem registros</p>
            </div>
          ) : (
            filteredSummaries.map((summary) => (
              <motion.div
                layoutId={summary.date}
                key={summary.date}
                onClick={() => { setSelectedDay(summary); setSelectedOrder(null); }}
                className={`p-3 md:p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedDay?.date === summary.date 
                    ? 'bg-white border-[var(--color-brand-accent)] shadow-md shadow-[var(--color-brand-accent)]/5' 
                    : 'bg-white border-white hover:border-gray-50 shadow-sm'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[8.5px] font-black text-gray-300 uppercase tracking-widest mb-0.5">DATA</p>
                    <p className="font-black text-[var(--color-brand-dark)] text-[13px] md:text-sm">{summary.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8.5px] font-black text-gray-300 uppercase tracking-widest mb-0.5">TOTAL</p>
                    <p className="font-black text-[var(--color-brand-accent)] text-[13px] md:text-sm">R$ {summary.total.toFixed(2).replace('.', ',')}</p>
                  </div>
                </div>
                <div className="mt-2.5 pt-2.5 border-t border-gray-50 flex justify-between items-center">
                   <span className="text-[8.5px] font-bold text-gray-300 uppercase">{summary.count} {summary.count === 1 ? 'pedido' : 'pedidos'}</span>
                   <ChevronRight className={`w-3.5 h-3.5 transition-transform ${selectedDay?.date === summary.date ? 'text-[var(--color-brand-accent)] translate-x-1' : 'text-gray-200'}`} />
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Day Details (Desktop) */}
        <div className="hidden lg:block lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedDay ? (
              <motion.div 
                key={selectedDay.date}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden sticky top-24"
              >
                <div className="bg-[var(--color-brand-dark)] p-5 text-white relative">
                  <div className="absolute right-0 top-0 w-32 h-32 bg-[var(--color-brand-accent)]/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <h2 className="text-2xl font-black tracking-tight">{selectedDay.date}</h2>
                      <p className="text-[var(--color-brand-accent)] font-black text-[9px] uppercase tracking-widest mt-0.5">Detalhamento das Vendas</p>
                      <button 
                        onClick={() => window.open(`/admin/cash-report/print?date=${selectedDay.date}`, '_blank')}
                        className="mt-3 flex items-center gap-1.5 bg-[#ff914a] text-[#381010] px-3 h-8 rounded-lg font-black text-[9px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md shadow-[#ff914a]/20"
                      >
                        <Printer className="w-3.5 h-3.5" /> Imprimir
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">FATURAMENTO</p>
                      <p className="text-2xl font-black text-[#ff914a]">R$ {selectedDay.total.toFixed(2).replace('.', ',')}</p>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="space-y-2">
                    {selectedDay.orders.map((order) => (
                      <motion.div 
                        key={order.id} 
                        onClick={() => setSelectedOrder(order)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={`flex justify-between items-center p-2.5 rounded-xl transition-all cursor-pointer group ${
                          selectedOrder?.id === order.id
                            ? 'bg-[var(--color-brand-accent)]/10 border-2 border-[var(--color-brand-accent)]/30 shadow-sm'
                            : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] shadow-sm transition-all ${
                            selectedOrder?.id === order.id
                              ? 'bg-[var(--color-brand-accent)] text-white border border-[var(--color-brand-accent)]'
                              : 'bg-white border border-gray-100 text-[var(--color-brand-dark)] group-hover:border-[var(--color-brand-accent)]/30'
                          }`}>
                            {new Date(order.created_at).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div>
                            <p className="font-black text-[var(--color-brand-dark)] text-[13px]">{order.customer_name}</p>
                            <div className="flex items-center gap-2">
                              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{order.payment_method}</p>
                              {order.delivery_type === 'delivery' && (
                                <span className="text-[8px] bg-blue-50 text-blue-500 px-1.5 py-[1px] rounded font-bold">DELIVERY</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); window.open(`/admin/orders/${order.id}/print`, '_blank'); }}
                            className="text-[var(--color-brand-accent)] hover:text-[var(--color-brand-accent)]/80 transition-colors p-1.5 hover:bg-[var(--color-brand-accent)]/10 rounded-lg opacity-0 group-hover:opacity-100"
                            title="Imprimir pedido"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <p className="font-black text-[var(--color-brand-dark)] text-[13px]">R$ {order.total_price.toFixed(2).replace('.', ',')}</p>
                          <ChevronRight className={`w-4 h-4 transition-all ${
                            selectedOrder?.id === order.id ? 'text-[var(--color-brand-accent)]' : 'text-gray-300 group-hover:text-gray-400'
                          }`} />
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-5 pt-5 border-t border-dashed border-gray-200">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-[var(--color-brand-accent)]/5 rounded-xl border border-[var(--color-brand-accent)]/10">
                        <p className="text-[9px] font-black text-[var(--color-brand-accent)] uppercase tracking-widest mb-1">Média por Pedido</p>
                        <p className="text-lg font-black text-[var(--color-brand-dark)]">R$ {(selectedDay.total / (selectedDay.count || 1)).toFixed(2).replace('.', ',')}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Volume de Vendas</p>
                        <p className="text-lg font-black text-[var(--color-brand-dark)]">{selectedDay.count} Pedidos</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-[60vh] flex flex-col items-center justify-center bg-gray-50/50 rounded-[2.5rem] border-2 border-dashed border-gray-200 p-8 text-center">
                <div className="p-6 rounded-3xl bg-white shadow-sm mb-6">
                  <TrendingUp className="w-12 h-12 text-[var(--color-brand-accent)] opacity-20" />
                </div>
                <h3 className="font-black text-[var(--color-brand-dark)] text-xl mb-2">Selecione um Dia</h3>
                <p className="text-sm text-gray-400 max-w-xs mx-auto font-medium">Clique em uma data à esquerda para visualizar o faturamento detalhado e os pedidos realizados.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Day Detail Modal - PREMIUM OVERHAUL */}
      <AnimatePresence>
        {selectedDay && (
          <div 
            className="lg:hidden fixed inset-0 z-[100] flex flex-col bg-[#381010]/80 backdrop-blur-md"
            onClick={(e) => { if (e.target === e.currentTarget) setSelectedDay(null); }}
          >
            <motion.div 
              key={`mobile-modal-premium-${selectedDay.date}`}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: 'spring', damping: 30, stiffness: 250 }}
              className="bg-white rounded-t-2xl w-full shadow-[0_-15px_50px_rgba(0,0,0,0.4)] fixed top-[12dvh] bottom-0 left-0 right-0 flex flex-col overflow-hidden"
            >
              {/* Drag Handle */}
              <div className="flex justify-center pt-2 pb-1 bg-[var(--color-brand-dark)]">
                <div className="w-10 h-1 rounded-full bg-white/10" />
              </div>
              
              {/* Compact Premium Header */}
              <div className="bg-[var(--color-brand-dark)] px-4 pb-4 text-white relative shrink-0">
                <button 
                  onClick={() => setSelectedDay(null)}
                  className="absolute right-3 top-0 p-2 text-white/30 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex justify-between items-center relative z-10 pt-0">
                  <div>
                    <h2 className="text-lg font-black tracking-tight">{selectedDay.date}</h2>
                    <p className="text-[var(--color-brand-accent)] font-bold text-[8.5px] uppercase tracking-wider mt-0.5">RESUMO DIÁRIO</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/40 text-[8.5px] font-black uppercase tracking-widest mb-0.5">FATURAMENTO</p>
                    <p className="text-lg font-black text-[#ff914a]">R$ {selectedDay.total.toFixed(2).replace('.', ',')}</p>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <button 
                    onClick={() => window.open(`/admin/cash-report/print?date=${selectedDay.date}`, '_blank')}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-[#ff914a] text-[#381010] h-9 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm active:scale-95 transition-all"
                  >
                    <Printer className="w-3.5 h-3.5" /> Imprimir
                  </button>
                  <div className="px-3 h-9 bg-white/5 rounded-xl flex flex-col items-center justify-center border border-white/5">
                    <span className="text-[7.5px] text-white/40 font-black uppercase tracking-widest mb-0.5">PEDIDOS</span>
                    <span className="text-[11px] font-black text-white">{selectedDay.count}</span>
                  </div>
                </div>
              </div>

              {/* Clean Orders List - Optimized Spacing */}
              <div className="flex-1 overflow-y-auto no-scrollbar bg-gray-50/50">
                <div className="p-3 space-y-1.5 pb-24">
                  {selectedDay.orders.map((order) => (
                    <motion.div 
                      key={`mob-order-ref-${order.id}`}
                      onClick={() => setSelectedOrder(order)}
                      whileTap={{ scale: 0.98 }}
                      className={`flex justify-between items-center p-2.5 rounded-xl transition-all cursor-pointer bg-white border ${
                        selectedOrder?.id === order.id ? 'border-[var(--color-brand-accent)] shadow-sm' : 'border-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-md bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0">
                          <span className="text-[8.5px] font-black text-[var(--color-brand-dark)]">
                            {new Date(order.created_at).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[var(--color-brand-dark)] text-[12px] truncate">{order.customer_name}</p>
                          <div className="flex items-center gap-1.5">
                            <p className="text-[8.5px] text-gray-400 font-semibold uppercase truncate">{order.payment_method}</p>
                            {order.delivery_type === 'delivery' && (
                              <span className="text-[8px] text-blue-500 font-black uppercase tracking-tighter">DELIVERY</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <p className="font-black text-[var(--color-brand-dark)] text-[13px]">R$ {order.total_price.toFixed(2).replace('.', ',')}</p>
                        <ChevronRight className="w-3.5 h-3.5 text-gray-200" />
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Stats Summary */}
                  <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm mt-2 flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Tíquete Médio</span>
                      <span className="text-[13px] font-black text-[var(--color-brand-dark)]">R$ {(selectedDay.total / (selectedDay.count || 1)).toFixed(2).replace('.', ',')}</span>
                    </div>
                    <TrendingUp className="w-4 h-4 text-[var(--color-brand-accent)]/20" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Order Detail Modal / Mobile Bottom Sheet */}
      <AnimatePresence>
        {selectedOrder && (
          <div 
            className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center lg:p-4 bg-[#381010]/40 backdrop-blur-md"
            onClick={(e) => { if (e.target === e.currentTarget) setSelectedOrder(null); }}
          >
            <motion.div 
              initial={typeof window !== 'undefined' && window.innerWidth < 1024 ? { y: "100%" } : { scale: 0.9, opacity: 0, y: 20 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={typeof window !== 'undefined' && window.innerWidth < 1024 ? { y: "100%" } : { scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="bg-white rounded-t-2xl lg:rounded-2xl w-full max-w-lg overflow-hidden shadow-[0_20px_60px_rgba(56,16,16,0.2)] border border-white/20 max-h-[96dvh] lg:h-auto lg:max-h-[90vh] flex flex-col"
            >
              {/* Mobile Drag Handle */}
              <div className="flex justify-center pt-2 pb-1 lg:hidden shrink-0">
                <div className="w-10 h-1 rounded-full bg-gray-200" />
              </div>

              {/* Header */}
              <div className="p-4 border-b border-gray-100 shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setSelectedOrder(null)}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={handlePrintOrder}
                      className="text-[var(--color-brand-accent)] hover:text-[var(--color-brand-accent)]/80 transition-colors flex items-center gap-1.5 font-black text-[10px] uppercase tracking-widest"
                    >
                      <Printer className="w-3.5 h-3.5" /> Imprimir
                    </button>
                  </div>
                  <span className="font-black text-[9px] text-gray-300 tracking-widest uppercase bg-gray-50 px-2 py-1 rounded-md">ID: {selectedOrder.id.slice(-6).toUpperCase()}</span>
                </div>
                <h2 className="text-xl font-black text-[var(--color-brand-dark)] tracking-tight">{selectedOrder.customer_name}</h2>
                <div className="flex items-center gap-2.5 mt-1">
                  <a href={`tel:${selectedOrder.customer_phone}`} className="flex items-center gap-1 text-[11.5px] font-black text-[var(--color-brand-accent)] hover:underline">
                    <Phone className="w-3 h-3" /> {selectedOrder.customer_phone}
                  </a>
                  <span className="text-[10px] text-gray-300">•</span>
                  <span className="flex items-center gap-1 text-[10.5px] text-gray-400 font-medium">
                    <Clock className="w-3 h-3" /> {formatDate(selectedOrder.created_at)}
                  </span>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="p-4 space-y-4 overflow-y-auto no-scrollbar flex-1">
                {/* Delivery / Pickup Info */}
                <div className="space-y-2 p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-1.5 text-[#381010] font-bold text-[13px]">
                    {selectedOrder.delivery_type === 'delivery' ? <Truck className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                    {selectedOrder.delivery_type === 'delivery' ? 'Delivery' : 'Retirada'}
                    <span className="ml-auto text-[8.5px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded font-black uppercase tracking-wider border border-green-100">Entregue</span>
                  </div>
                  {selectedOrder.delivery_type === 'delivery' && (
                    <div className="space-y-0.5">
                      <p className="text-[11.5px] text-gray-600 flex items-start gap-1">
                        <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                        {selectedOrder.address_street}, {selectedOrder.address_number} - {selectedOrder.address_neighborhood}
                      </p>
                      {selectedOrder.address_complement && <p className="text-[10.5px] text-gray-400 ml-4">Compl: {selectedOrder.address_complement}</p>}
                      {selectedOrder.address_reference && <p className="text-[10.5px] text-gray-400 ml-4">Ref: {selectedOrder.address_reference}</p>}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-[11.5px] text-gray-500 pt-1.5 border-t border-gray-200">
                    <CreditCard className="w-3.5 h-3.5" /> {selectedOrder.payment_method}
                    {selectedOrder.order_time && selectedOrder.order_time !== 'Para agora' && (
                      <span className="ml-auto text-[9.5px] text-gray-400">Agendado: {selectedOrder.order_time}</span>
                    )}
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-2">
                  <p className="text-[9.5px] font-bold text-gray-400 uppercase tracking-widest">Itens do Pedido</p>
                  <div className="space-y-1.5">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start p-2.5 bg-gray-50/70 rounded-xl">
                        <div className="flex-1">
                          <p className="text-[13px] font-bold text-[#381010]">{item.quantity}x {item.name}</p>
                          {item.variant && <p className="text-[11.5px] text-gray-500">{item.variant}</p>}
                          {item.addons && item.addons.length > 0 && (
                            <p className="text-[11.5px] text-[#ff914a] font-medium">+ {item.addons.map(a => a.name).join(', ')}</p>
                          )}
                        </div>
                        <p className="text-[13px] font-mono text-gray-400 shrink-0 ml-3">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Observation */}
                {selectedOrder.observation && (
                  <div className="p-3 bg-[var(--color-brand-light)] border border-[var(--color-brand-accent)]/10 rounded-xl">
                    <p className="text-[9px] font-black text-[var(--color-brand-dark)] mb-1 uppercase tracking-widest">Observação:</p>
                    <p className="text-[12px] text-[var(--color-brand-dark)]/80 font-medium italic whitespace-pre-line">&quot;{selectedOrder.observation}&quot;</p>
                  </div>
                )}
              </div>

              {/* Footer - Total */}
              <div className="p-4 bg-gray-50/50 border-t border-gray-100 shrink-0 pb-10 lg:pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em]">Total</span>
                  <span className="text-2xl font-black text-[var(--color-brand-dark)] tracking-tighter">R$ {selectedOrder.total_price.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
