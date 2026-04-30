"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Calendar, 
  ChevronRight, 
  TrendingUp, 
  ShoppingBag,
  Loader2,
  Search,
  ArrowLeft,
  CalendarDays,
  Filter,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  total_price: number;
  payment_method: string;
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
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [availableMethods, setAvailableMethods] = useState<string[]>([]);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, created_at, customer_name, total_price, payment_method, status')
        .eq('status', 'delivered')
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      if (data) {
        // Agrupar pedidos por data (YYYY-MM-DD)
        const groups: Record<string, DailySummary> = {};
        
        data.forEach((order: any) => {
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

        // Extrair métodos de pagamento únicos
        const methods = Array.from(new Set(data.map((o: any) => o.payment_method))).filter(Boolean) as string[];
        setAvailableMethods(methods);
      }
    } catch (err) {
      console.error("Erro ao buscar histórico:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const filteredSummaries = dailySummaries.map(summary => {
    // Se o filtro for 'all', retorna o sumário original
    if (paymentFilter === 'all') return summary;
    
    // Filtrar pedidos dentro do sumário
    const filteredOrders = summary.orders.filter(o => o.payment_method === paymentFilter);
    
    // Recalcular total e count para este filtro específico
    return {
      ...summary,
      total: filteredOrders.reduce((sum, o) => sum + Number(o.total_price), 0),
      count: filteredOrders.length,
      orders: filteredOrders
    };
  }).filter(summary => 
    summary.date.includes(searchQuery) && summary.count > 0
  );

  // Sincronizar o selectedDay se o filtro mudar
  useEffect(() => {
    if (selectedDay) {
      const updated = filteredSummaries.find(s => s.date === selectedDay.date);
      setSelectedDay(updated || null);
    }
  }, [paymentFilter, searchQuery, dailySummaries]);

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
                onClick={() => setSelectedDay(summary)}
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

        {/* Day Details */}
        <div className="lg:col-span-2">
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
                      <div key={order.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-[var(--color-brand-dark)] font-black text-xs shadow-sm group-hover:border-[var(--color-brand-accent)]/30 transition-all">
                            {new Date(order.created_at).getHours().toString().padStart(2, '0')}:
                            {new Date(order.created_at).getMinutes().toString().padStart(2, '0')}
                          </div>
                          <div>
                            <p className="font-black text-[var(--color-brand-dark)] text-sm">{order.customer_name}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{order.payment_method}</p>
                          </div>
                        </div>
                        <p className="font-black text-[var(--color-brand-dark)]">R$ {order.total_price.toFixed(2).replace('.', ',')}</p>
                      </div>
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
    </div>
  );
}
