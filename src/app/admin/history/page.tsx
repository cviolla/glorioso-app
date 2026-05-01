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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--color-brand-dark)] tracking-tight">Histórico de Vendas</h1>
          <p className="text-gray-400 font-medium text-sm">Resumo financeiro agrupado por dia.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por data..." 
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl outline-none focus:border-[var(--color-brand-accent)]/20 transition-all text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="relative group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select 
              className="pl-10 pr-8 py-2.5 bg-white border border-gray-100 rounded-xl outline-none focus:border-[var(--color-brand-accent)]/20 transition-all text-sm font-bold appearance-none cursor-pointer"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
            >
              <option value="all">TODOS MÉTODOS</option>
              {availableMethods.map(method => (
                <option key={method} value={method}>{method.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* List of Days */}
        <div className="lg:col-span-1 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
              <Loader2 className="w-8 h-8 text-[#ff914a] animate-spin mb-2" />
              <p className="text-gray-500 text-xs font-medium">Processando histórico...</p>
            </div>
          ) : filteredSummaries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
              <CalendarDays className="w-10 h-10 text-gray-200 mb-2" />
              <p className="text-gray-400 text-xs font-medium">Nenhum registro encontrado.</p>
            </div>
          ) : (
            filteredSummaries.map((summary) => (
              <motion.div
                layoutId={summary.date}
                key={summary.date}
                onClick={() => { setSelectedDay(summary); setSelectedOrder(null); }}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                  selectedDay?.date === summary.date 
                    ? 'bg-white border-[var(--color-brand-accent)] shadow-lg shadow-[var(--color-brand-accent)]/10' 
                    : 'bg-white border-white hover:border-gray-50 shadow-sm'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">DATA</p>
                    <p className="font-black text-[var(--color-brand-dark)]">{summary.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">TOTAL</p>
                    <p className="font-black text-[var(--color-brand-accent)]">R$ {summary.total.toFixed(2).replace('.', ',')}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-50 flex justify-between items-center">
                   <span className="text-[10px] font-black text-gray-300 uppercase tracking-tighter">{summary.count} pedidos realizados</span>
                   <ChevronRight className={`w-4 h-4 transition-transform ${selectedDay?.date === summary.date ? 'text-[var(--color-brand-accent)]' : 'text-gray-300'}`} />
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
                className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden sticky top-24"
              >
                <div className="bg-[var(--color-brand-dark)] p-8 text-white relative">
                  <div className="absolute right-0 top-0 w-32 h-32 bg-[var(--color-brand-accent)]/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <h2 className="text-3xl font-black tracking-tight">{selectedDay.date}</h2>
                      <p className="text-[var(--color-brand-accent)] font-black text-xs uppercase tracking-widest mt-1">Detalhamento das Vendas</p>
                      <button 
                        onClick={() => window.open(`/admin/cash-report/print?date=${selectedDay.date}`, '_blank')}
                        className="mt-4 flex items-center gap-2 bg-[#ff914a] text-[#381010] px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#ff914a]/20"
                      >
                        <Printer className="w-4 h-4" /> Imprimir Relatório
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">FATURAMENTO</p>
                      <p className="text-3xl font-black text-[#ff914a]">R$ {selectedDay.total.toFixed(2).replace('.', ',')}</p>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <div className="space-y-4">
                    {selectedDay.orders.map((order) => (
                      <motion.div 
                        key={order.id} 
                        onClick={() => setSelectedOrder(order)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={`flex justify-between items-center p-4 rounded-2xl transition-all cursor-pointer group ${
                          selectedOrder?.id === order.id
                            ? 'bg-[var(--color-brand-accent)]/10 border-2 border-[var(--color-brand-accent)]/30 shadow-md'
                            : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shadow-sm transition-all ${
                            selectedOrder?.id === order.id
                              ? 'bg-[var(--color-brand-accent)] text-white border border-[var(--color-brand-accent)]'
                              : 'bg-white border border-gray-100 text-[var(--color-brand-dark)] group-hover:border-[var(--color-brand-accent)]/30'
                          }`}>
                            {new Date(order.created_at).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div>
                            <p className="font-black text-[var(--color-brand-dark)] text-sm">{order.customer_name}</p>
                            <div className="flex items-center gap-2">
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{order.payment_method}</p>
                              {order.delivery_type === 'delivery' && (
                                <span className="text-[9px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded font-bold">DELIVERY</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => { e.stopPropagation(); window.open(`/admin/orders/${order.id}/print`, '_blank'); }}
                            className="text-[var(--color-brand-accent)] hover:text-[var(--color-brand-accent)]/80 transition-colors p-1.5 hover:bg-[var(--color-brand-accent)]/10 rounded-lg opacity-0 group-hover:opacity-100"
                            title="Imprimir pedido"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <p className="font-black text-[var(--color-brand-dark)]">R$ {order.total_price.toFixed(2).replace('.', ',')}</p>
                          <ChevronRight className={`w-4 h-4 transition-all ${
                            selectedOrder?.id === order.id ? 'text-[var(--color-brand-accent)]' : 'text-gray-300 group-hover:text-gray-400'
                          }`} />
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-8 pt-8 border-t border-dashed border-gray-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-[var(--color-brand-accent)]/5 rounded-2xl border border-[var(--color-brand-accent)]/10">
                        <p className="text-[10px] font-black text-[var(--color-brand-accent)] uppercase tracking-widest mb-1">Média por Pedido</p>
                        <p className="text-xl font-black text-[var(--color-brand-dark)]">R$ {(selectedDay.total / selectedDay.count).toFixed(2).replace('.', ',')}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Volume de Vendas</p>
                        <p className="text-xl font-black text-[var(--color-brand-dark)]">{selectedDay.count} Pedidos</p>
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

      {/* Mobile Day Detail Modal */}
      <AnimatePresence>
        {selectedDay && (
          <div 
            className="lg:hidden fixed inset-0 z-[100] flex items-end justify-center bg-[#381010]/40 backdrop-blur-md"
            onClick={(e) => { if (e.target === e.currentTarget) setSelectedDay(null); }}
          >
            <motion.div 
              key={`mobile-${selectedDay.date}`}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="bg-white rounded-t-[2rem] w-full overflow-hidden shadow-xl border border-gray-100 h-[92dvh] flex flex-col"
            >
              {/* Mobile Drag Handle */}
              <div className="flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-1 rounded-full bg-gray-200" />
              </div>
              
              <div className="bg-[var(--color-brand-dark)] p-8 text-white relative shrink-0">
                <div className="absolute right-0 top-0 w-32 h-32 bg-[var(--color-brand-accent)]/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                
                <button 
                  onClick={() => setSelectedDay(null)}
                  className="absolute right-6 top-6 p-2 text-white/30 hover:text-white transition-colors rounded-full hover:bg-white/10 z-20"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <h2 className="text-3xl font-black tracking-tight">{selectedDay.date}</h2>
                    <p className="text-[var(--color-brand-accent)] font-black text-xs uppercase tracking-widest mt-1">Detalhamento das Vendas</p>
                    <button 
                      onClick={() => window.open(`/admin/cash-report/print?date=${selectedDay.date}`, '_blank')}
                      className="mt-4 flex items-center gap-2 bg-[#ff914a] text-[#381010] px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#ff914a]/20"
                    >
                      <Printer className="w-4 h-4" /> Imprimir Relatório
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">FATURAMENTO</p>
                    <p className="text-3xl font-black text-[#ff914a]">R$ {selectedDay.total.toFixed(2).replace('.', ',')}</p>
                  </div>
                </div>
              </div>

              <div className="p-8 overflow-y-auto no-scrollbar flex-1">
                <div className="space-y-4">
                  {selectedDay.orders.map((order) => (
                    <motion.div 
                      key={`mobile-order-${order.id}`}
                      onClick={() => setSelectedOrder(order)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={`flex justify-between items-center p-4 rounded-2xl transition-all cursor-pointer group ${
                        selectedOrder?.id === order.id
                          ? 'bg-[var(--color-brand-accent)]/10 border-2 border-[var(--color-brand-accent)]/30 shadow-md'
                          : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shadow-sm transition-all ${
                          selectedOrder?.id === order.id
                            ? 'bg-[var(--color-brand-accent)] text-white border border-[var(--color-brand-accent)]'
                            : 'bg-white border border-gray-100 text-[var(--color-brand-dark)] group-hover:border-[var(--color-brand-accent)]/30'
                        }`}>
                          {new Date(order.created_at).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div>
                          <p className="font-black text-[var(--color-brand-dark)] text-sm">{order.customer_name}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{order.payment_method}</p>
                            {order.delivery_type === 'delivery' && (
                              <span className="text-[9px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded font-bold">DELIVERY</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-black text-[var(--color-brand-dark)] text-sm">R$ {order.total_price.toFixed(2).replace('.', ',')}</p>
                        <ChevronRight className={`w-4 h-4 transition-all ${
                          selectedOrder?.id === order.id ? 'text-[var(--color-brand-accent)]' : 'text-gray-300'
                        }`} />
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-8 pt-8 border-t border-dashed border-gray-200 pb-10">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-[var(--color-brand-accent)]/5 rounded-2xl border border-[var(--color-brand-accent)]/10">
                      <p className="text-[10px] font-black text-[var(--color-brand-accent)] uppercase tracking-widest mb-1">Média por Pedido</p>
                      <p className="text-xl font-black text-[var(--color-brand-dark)]">R$ {(selectedDay.total / selectedDay.count).toFixed(2).replace('.', ',')}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Volume de Vendas</p>
                      <p className="text-xl font-black text-[var(--color-brand-dark)]">{selectedDay.count} Pedidos</p>
                    </div>
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
              className="bg-white rounded-t-[2rem] lg:rounded-[2rem] w-full max-w-lg overflow-hidden shadow-[0_20px_60px_rgba(56,16,16,0.2)] border border-white/20 max-h-[96dvh] lg:h-auto lg:max-h-[90vh] flex flex-col"
            >
              {/* Mobile Drag Handle */}
              <div className="flex justify-center pt-3 pb-1 lg:hidden shrink-0">
                <div className="w-10 h-1 rounded-full bg-gray-200" />
              </div>

              {/* Header */}
              <div className="p-6 border-b border-gray-100 shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setSelectedOrder(null)}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={handlePrintOrder}
                      className="text-[var(--color-brand-accent)] hover:text-[var(--color-brand-accent)]/80 transition-colors flex items-center gap-1.5 font-black text-xs uppercase tracking-widest"
                    >
                      <Printer className="w-4 h-4" /> Imprimir
                    </button>
                  </div>
                  <span className="font-black text-[10px] text-gray-300 tracking-widest uppercase bg-gray-50 px-3 py-1.5 rounded-full">ID: {selectedOrder.id.slice(-6).toUpperCase()}</span>
                </div>
                <h2 className="text-2xl font-black text-[var(--color-brand-dark)] tracking-tight">{selectedOrder.customer_name}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <a href={`tel:${selectedOrder.customer_phone}`} className="flex items-center gap-1.5 text-sm font-black text-[var(--color-brand-accent)] hover:underline">
                    <Phone className="w-4 h-4" /> {selectedOrder.customer_phone}
                  </a>
                  <span className="text-xs text-gray-300">•</span>
                  <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                    <Clock className="w-3 h-3" /> {formatDate(selectedOrder.created_at)}
                  </span>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="p-6 space-y-5 overflow-y-auto no-scrollbar flex-1">
                {/* Delivery / Pickup Info */}
                <div className="space-y-3 p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-2 text-[#381010] font-bold text-sm">
                    {selectedOrder.delivery_type === 'delivery' ? <Truck className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                    {selectedOrder.delivery_type === 'delivery' ? 'Delivery' : 'Retirada'}
                    <span className="ml-auto text-[9px] bg-green-50 text-green-600 px-2 py-1 rounded-lg font-black uppercase tracking-wider border border-green-100">Entregue</span>
                  </div>
                  {selectedOrder.delivery_type === 'delivery' && (
                    <div className="space-y-1">
                      <p className="text-xs text-gray-600 flex items-start gap-1">
                        <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                        {selectedOrder.address_street}, {selectedOrder.address_number} - {selectedOrder.address_neighborhood}
                      </p>
                      {selectedOrder.address_complement && <p className="text-xs text-gray-400 ml-4">Compl: {selectedOrder.address_complement}</p>}
                      {selectedOrder.address_reference && <p className="text-xs text-gray-400 ml-4">Ref: {selectedOrder.address_reference}</p>}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-200">
                    <CreditCard className="w-3 h-3" /> {selectedOrder.payment_method}
                    {selectedOrder.order_time && selectedOrder.order_time !== 'Para agora' && (
                      <span className="ml-auto text-[10px] text-gray-400">Agendado: {selectedOrder.order_time}</span>
                    )}
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Itens do Pedido</p>
                  <div className="space-y-2.5">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start p-3 bg-gray-50/70 rounded-xl">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-[#381010]">{item.quantity}x {item.name}</p>
                          {item.variant && <p className="text-xs text-gray-500">{item.variant}</p>}
                          {item.addons && item.addons.length > 0 && (
                            <p className="text-xs text-[#ff914a] font-medium">+ {item.addons.map(a => a.name).join(', ')}</p>
                          )}
                        </div>
                        <p className="text-sm font-mono text-gray-400 shrink-0 ml-3">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Observation */}
                {selectedOrder.observation && (
                  <div className="p-4 bg-[var(--color-brand-light)] border-2 border-[var(--color-brand-accent)]/10 rounded-2xl">
                    <p className="text-[10px] font-black text-[var(--color-brand-dark)] mb-1.5 uppercase tracking-widest">Observação:</p>
                    <p className="text-sm text-[var(--color-brand-dark)]/80 font-medium italic whitespace-pre-line">&quot;{selectedOrder.observation}&quot;</p>
                  </div>
                )}
              </div>

              {/* Footer - Total */}
              <div className="p-6 bg-gray-50/50 border-t border-gray-100 shrink-0 pb-14 lg:pb-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-black text-xs uppercase tracking-[0.2em]">Total do Pedido</span>
                  <span className="text-3xl font-black text-[var(--color-brand-dark)] tracking-tighter">R$ {selectedOrder.total_price.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
