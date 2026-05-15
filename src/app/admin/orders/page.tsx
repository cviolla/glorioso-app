"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle, 
  Phone, 
  MapPin, 
  CreditCard, 
  ShoppingBag,
  Loader2,
  Filter,
  Printer,
  Trash2,
  TrendingUp,
  DollarSign,
  Receipt,
  X,
  RefreshCw,
  Archive,
  ChefHat,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomModal } from '@/components/CustomModal';
import { useCashStore } from '@/store/cashStore';
import { useSettingsStore } from '@/store/settingsStore';

type OrderStatus = 'draft' | 'pending' | 'preparing' | 'shipped' | 'delivered' | 'cancelled' | 'archived';

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
  status: OrderStatus;
}

const statusConfig = {
  draft: { label: 'Rascunho', color: 'text-gray-500 bg-gray-50 border-gray-200', icon: Clock },
  pending: { label: 'Pendente', color: 'text-amber-600 bg-amber-50 border-amber-200', icon: Clock },
  preparing: { label: 'Em Preparo', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: ShoppingBag },
  shipped: { label: 'Saiu p/ Entrega', color: 'text-purple-600 bg-purple-50 border-purple-200', icon: Truck },
  delivered: { label: 'Entregue', color: 'text-green-600 bg-green-50 border-green-200', icon: CheckCircle2 },
  cancelled: { label: 'Cancelado', color: 'text-red-600 bg-red-50 border-red-200', icon: XCircle },
  archived: { label: 'Arquivado', color: 'text-gray-600 bg-gray-100 border-gray-300', icon: Archive },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all' | 'active'>('active');
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "danger";
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info"
  });
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [showRefreshSuccess, setShowRefreshSuccess] = useState(false);
  const { currentSession, fetchCurrentSession, openCashSession, closeCashSession } = useCashStore();
  const { paymentMethods: storePaymentMethods } = useSettingsStore();
  const [savingPaymentId, setSavingPaymentId] = useState<string | null>(null);

  const FALLBACK_METHODS = ['PIX', 'Dinheiro', 'Cartão de Débito', 'Cartão de Crédito', 'Voucher'];
  const availablePaymentMethods = storePaymentMethods.length > 0 ? storePaymentMethods : FALLBACK_METHODS;

  const updatePaymentMethod = async (orderId: string, newMethod: string) => {
    const original = orders.find(o => o.id === orderId)?.payment_method;
    // Optimistic update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, payment_method: newMethod } : o));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, payment_method: newMethod } : null);
    }
    setSavingPaymentId(orderId);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ payment_method: newMethod })
        .eq('id', orderId);
      if (error) throw error;
    } catch {
      // Revert on failure
      if (original !== undefined) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, payment_method: original } : o));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, payment_method: original } : null);
        }
      }
    } finally {
      setSavingPaymentId(null);
    }
  };

  const fetchOrders = useCallback(async (isInitial = false) => {
    if (!isInitial) setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setOrders(data || []);
      setLastUpdated(new Date());
      
      if (!isInitial) {
        setShowRefreshSuccess(true);
        setTimeout(() => setShowRefreshSuccess(false), 2000);
      }
    } catch (err) {
      console.error("Erro ao buscar pedidos:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      setIsMounted(true);
      fetchOrders(true);
      fetchCurrentSession();
    });

    const channel = supabase
      .channel('orders_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);
      
      if (error) throw error;
      
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch {
      setModalConfig({
        isOpen: true,
        title: "Erro de Status",
        message: "Não foi possível atualizar o status do pedido agora.",
        type: "danger"
      });
    }
  };

  const [salesPeriod, setSalesPeriod] = useState<'1' | '3' | '7' | '15' | '30' | 'all'>('1');

  const deleteOrder = async (orderId: string) => {
    setModalConfig({
      isOpen: true,
      title: "Confirmar Exclusão",
      message: "Tem certeza que deseja apagar este pedido definitivamente? Esta ação não poderá ser desfeita no banco de dados.",
      type: "danger",
      onConfirm: async () => {
        try {
          console.log("Tentando apagar pedido ID:", orderId);
          const { data, error } = await supabase
            .from('orders')
            .delete()
            .eq('id', orderId)
            .select();
          
          if (error) {
            console.error("Erro detalhado do Supabase ao apagar:", error);
            throw error;
          }

          // Se não houver erro, assumimos que a tentativa de exclusão foi processada.
          // Se o pedido não foi apagado por falta de política RLS, o erro detalhado seria pego acima.
          // Mas se o RLS apenas filtrar o retorno, prosseguimos para limpar a UI.
          
          setOrders(prev => prev.filter(o => o.id !== orderId));
          setSelectedOrder(null);
          
          setModalConfig({
            isOpen: true,
            title: "Sucesso!",
            message: "Pedido removido com sucesso!",
            type: "success"
          });
        } catch (err: unknown) {
          setModalConfig({
            isOpen: true,
            title: "Erro na Exclusão",
            message: err instanceof Error ? err.message : "Erro desconhecido ao apagar pedido.",
            type: "danger"
          });
        }
      }
    });
  };

  const calculateSales = (days: '1' | '3' | '7' | '15' | '30' | 'all') => {
    const now = new Date();
    const filtered = orders.filter(order => {
      if (order.status === 'cancelled') return false;
      if (days === 'all') return true;
      
      const orderDate = new Date(order.created_at);
      const diffTime = Math.abs(now.getTime() - orderDate.getTime());
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      return diffDays <= parseInt(days);
    });
    
    return filtered.reduce((sum, order) => sum + order.total_price, 0);
  };

  const getDailySalesData = () => {
    const days = 7;
    const data = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', weekday: 'short', day: '2-digit' });
      const fullDateStr = date.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
      
      const dayTotal = orders
        .filter(order => {
          if (order.status === 'cancelled') return false;
          const orderDateStr = new Date(order.created_at).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
          return orderDateStr === fullDateStr;
        })
        .reduce((sum, order) => sum + order.total_price, 0);
        
      data.push({ label: dateStr, value: dayTotal });
    }
    return data;
  };

  const handlePrint = () => {
    if (!selectedOrder) return;
    window.open(`/admin/orders/${selectedOrder.id}/print`, '_blank');
  };

  const handlePrintKitchen = (orderId?: string) => {
    const id = orderId || selectedOrder?.id;
    if (!id) return;
    window.open(`/admin/orders/${id}/print?mode=kitchen`, '_blank');
  };

  const handleShareOrder = (order: Order) => {
    let text = `*PEDIDO #${order.id.slice(-4).toUpperCase()}*\n`;
    text += `*Cliente:* ${order.customer_name}\n`;
    text += `*Telefone:* ${order.customer_phone}\n`;
    if (order.delivery_type === 'delivery') {
      text += `*Endereço:* ${order.address_street}, ${order.address_number} - ${order.address_neighborhood}\n`;
      if (order.address_complement) text += `*Ref:* ${order.address_complement}\n`;
    } else {
      text += `*Tipo:* Retirada\n`;
    }
    text += `*Pagamento:* ${order.payment_method}\n`;
    text += `*Valor:* R$ ${order.total_price.toFixed(2).replace('.', ',')}\n\n`;
    
    text += `*ITENS:*\n`;
    order.items.forEach(item => {
      text += `${item.quantity}x ${item.name}`;
      if (item.variant) text += ` (${item.variant})`;
      text += '\n';
      if (item.addons && item.addons.length > 0) {
        text += `  + ${item.addons.map(a => a.name).join(', ')}\n`;
      }
    });
    
    if (order.observation) {
      text += `\n*Obs:* ${order.observation}`;
    }

    if (navigator.share) {
      navigator.share({
        title: `Pedido #${order.id.slice(-4).toUpperCase()}`,
        text: text
      }).catch(console.error);
    } else {
      const encodedText = encodeURIComponent(text);
      window.open(`https://wa.me/?text=${encodedText}`, '_blank');
    }
  };

  const getCashClosingData = () => {
    let sessionOrders = [];
    let isDayMode = false;
    
    if (currentSession) {
      // Caixa por sessão
      const openTime = new Date(currentSession.opened_at).getTime();
      sessionOrders = orders.filter(o => 
        new Date(o.created_at).getTime() >= openTime && 
        o.status === 'delivered'
      );
    } else {
      // Fallback para dia se não houver sessão ativa
      isDayMode = true;
      const today = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
      sessionOrders = orders.filter(o => 
        new Date(o.created_at).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }) === today && 
        o.status === 'delivered'
      );
    }

    const totals: Record<string, number> = {};
    let total = 0;

    sessionOrders.forEach(o => {
      const method = o.payment_method || 'Outros';
      const value = Number(o.total_price) || 0;
      totals[method] = (totals[method] || 0) + value;
      total += value;
    });

    return { totals, total, count: sessionOrders.length, items: sessionOrders, isDayMode };
  };

  const handlePrintCashReport = async () => {
    const data = getCashClosingData();
    // Se há uma sessão atual, fechar ela no banco antes de imprimir
    if (currentSession) {
      try {
        await closeCashSession();
      } catch (err) {
        console.error('Erro ao fechar caixa:', err);
      }
    }
    
    // Constrói a URL para a página de impressão
    let url = '/admin/cash-report/print';
    if (currentSession) {
      url += `?session_start=${encodeURIComponent(currentSession.opened_at)}&session_end=${encodeURIComponent(new Date().toISOString())}`;
    }
    
    window.open(url, '_blank');
    setIsCashModalOpen(false);
  };

  const filteredOrders = orders.filter(order => {
    let matchesStatus = false;
    if (filterStatus === 'all') {
      matchesStatus = order.status !== 'archived' && order.status !== 'draft';
    } else if (filterStatus === 'active') {
      matchesStatus = ['pending', 'preparing', 'shipped'].includes(order.status);
    } else {
      matchesStatus = order.status === filterStatus;
    }
    return matchesStatus;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/[\u202f\u00a0]/g, ' ');
  };

  return (
    <>
      <div className="space-y-6 print:hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--color-brand-dark)] tracking-tight">Gestão de Pedidos</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sincronização</span>
            <span className="text-[10px] text-gray-400 font-medium">
              Última: {isMounted && lastUpdated ? lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
            </span>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchOrders()}
            disabled={loading}
            title="Atualizar Pedidos"
            className={`relative p-3 rounded-2xl transition-all duration-500 shadow-sm border-2 overflow-hidden ${
              showRefreshSuccess 
                ? 'bg-green-50 border-green-200 text-green-500 shadow-green-100' 
                : 'bg-white border-gray-100 text-gray-400 hover:text-[var(--color-brand-accent)] hover:border-[var(--color-brand-accent)]/30 hover:shadow-xl hover:shadow-[var(--color-brand-accent)]/10'
            }`}
          >
            <AnimatePresence mode="wait">
              {showRefreshSuccess ? (
                <motion.div
                  key="success"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                >
                  <CheckCircle2 className="w-5 h-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ rotate: -180, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 180, opacity: 0 }}
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </motion.div>
              )}
            </AnimatePresence>
            
            {loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-[var(--color-brand-accent)]/5 flex items-center justify-center"
              >
                <div className="absolute inset-0 border-2 border-[var(--color-brand-accent)] border-t-transparent rounded-2xl animate-spin" />
              </motion.div>
            )}
          </motion.button>
          {!currentSession ? (
            <button 
              onClick={() => {
                setModalConfig({
                  isOpen: true,
                  title: "Confirmar Abertura",
                  message: "Deseja abrir o caixa neste momento? O relatório de fechamento contará a partir de agora.",
                  type: "info",
                  onConfirm: async () => {
                    await openCashSession();
                    setModalConfig(prev => ({ ...prev, isOpen: false }));
                  }
                });
              }}
              className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
            >
              <Receipt className="w-5 h-5" /> Abrir Caixa
            </button>
          ) : (
            <button 
              onClick={() => setIsCashModalOpen(true)}
              className="flex items-center gap-2 bg-[var(--color-brand-accent)] text-white px-6 py-3 rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[var(--color-brand-accent)]/20"
            >
              <Receipt className="w-5 h-5" /> Fechamento de Caixa
            </button>
          )}
        </div>
      </div>

      {/* Sales Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-[var(--color-brand-dark)] rounded-[2rem] px-5 sm:px-6 py-4 sm:py-5 shadow-xl relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-48 h-48 bg-[var(--color-brand-accent)]/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-[var(--color-brand-accent)]/20 transition-all duration-700"></div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-[var(--color-brand-accent)] text-[10px] font-black uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> FATURAMENTO {salesPeriod === 'all' ? 'TOTAL' : `ÚLTIMOS ${salesPeriod} DIAS`}
              </p>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                R$ {calculateSales(salesPeriod).toFixed(2).replace('.', ',')}
              </h2>
            </div>
            <div className="flex flex-wrap gap-1 bg-white/5 p-1 rounded-2xl backdrop-blur-sm border border-white/5">
              {[
                { id: '1', label: 'Hoje' },
                { id: '3', label: '3' },
                { id: '7', label: '7' },
                { id: '15', label: '15' },
                { id: '30', label: '30' },
                { id: 'all', label: 'All' }
              ].map((p: { id: string; label: string }) => (
                <button
                  key={p.id}
                  onClick={() => setSalesPeriod(p.id as '1' | '3' | '7' | '15' | '30' | 'all')}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${salesPeriod === p.id ? 'bg-[var(--color-brand-accent)] text-white shadow-lg shadow-[var(--color-brand-accent)]/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mini Chart */}
          <div className="mt-3 flex items-end justify-between gap-2 h-14">
            {getDailySalesData().map((day, idx) => {
              const maxVal = Math.max(...getDailySalesData().map(d => d.value), 1);
              const height = (day.value / maxVal) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group/bar">
                  <div className="relative w-full flex justify-center items-end h-full">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 1, delay: idx * 0.1, ease: "easeOut" }}
                      className={`w-full max-w-[24px] rounded-t-xl bg-gradient-to-t from-[var(--color-brand-accent)] to-[var(--color-brand-accent)]/60 relative`}
                    >
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-all bg-white text-[var(--color-brand-dark)] text-[10px] font-black px-2 py-1 rounded-lg shadow-xl pointer-events-none whitespace-nowrap border border-gray-100">
                        R$ {day.value.toFixed(0)}
                      </div>
                    </motion.div>
                  </div>
                  <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">{day.label.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-white rounded-[2rem] px-5 sm:px-6 py-4 sm:py-5 border border-white shadow-sm flex flex-col justify-center gap-2 hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center border border-green-100">
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Ticket Médio</p>
            <p className="text-2xl font-black text-[var(--color-brand-dark)] tracking-tight">
              R$ {(calculateSales('all') / (orders.filter(o => o.status !== 'cancelled').length || 1)).toFixed(2).replace('.', ',')}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex justify-end">
        <div className="relative group w-full md:w-64">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[var(--color-brand-accent)] transition-colors" />
          <select 
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent rounded-2xl outline-none focus:border-[var(--color-brand-accent)]/20 focus:ring-4 focus:ring-[var(--color-brand-accent)]/5 transition-all shadow-sm text-[var(--color-brand-dark)] font-black appearance-none"
            value={filterStatus}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value as OrderStatus | 'all' | 'active')}
          >
            <option value="active">PEDIDOS ATIVOS</option>
            <option value="all">TODOS VISÍVEIS</option>
            <option value="pending">PENDENTES</option>
            <option value="preparing">EM PREPARO</option>
            <option value="shipped">EM ENTREGA</option>
            <option value="delivered">ENTREGUES</option>
            <option value="cancelled">CANCELADOS</option>
            <option value="archived">ARQUIVADOS</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Orders List */}
        <div className="lg:col-span-2 space-y-4">
          {loading && orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
              <Loader2 className="w-10 h-10 text-[#ff914a] animate-spin mb-4" />
              <p className="text-gray-500 font-medium">Carregando pedidos...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
              <ShoppingBag className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">Nenhum pedido encontrado.</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const StatusIcon = statusConfig[order.status].icon;
              
              const cardStatusStyles: Record<OrderStatus, string> = {
                draft: 'bg-gray-50/40 border-gray-200 grayscale opacity-50',
                pending: 'bg-amber-50/80 border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.3)] animate-pulse',
                preparing: 'bg-blue-50/40 border-blue-200',
                shipped: 'bg-purple-50/40 border-purple-200',
                delivered: 'bg-green-50/40 border-green-200',
                cancelled: 'bg-red-50/40 border-red-200',
                archived: 'bg-gray-50/40 border-gray-200 grayscale opacity-80',
              };
              
              const baseCardStyle = cardStatusStyles[order.status];
              const isSelected = selectedOrder?.id === order.id;
              
              return (
                <motion.div 
                  layoutId={order.id}
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`group p-5 sm:p-6 rounded-[2rem] border-2 transition-all cursor-pointer hover:shadow-xl ${isSelected ? 'border-[var(--color-brand-accent)] shadow-[var(--color-brand-accent)]/10 scale-[1.01]' : 'hover:scale-[1.01] shadow-sm'} ${baseCardStyle}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                    {/* Top Section / Left Section */}
                    <div className="flex items-center gap-4 sm:gap-5">
                      <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shrink-0 border-2 shadow-inner ${statusConfig[order.status].color}`}>
                        <StatusIcon className="w-7 h-7 sm:w-8 sm:h-8" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-black text-[var(--color-brand-dark)] text-lg sm:text-xl tracking-tight leading-none truncate">{order.customer_name}</span>
                          <span className="text-[9px] bg-gray-50 text-gray-400 px-2 py-0.5 rounded-full font-black tracking-widest border border-gray-100">#{order.id.slice(-4).toUpperCase()}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] sm:text-[11px] text-gray-400 font-black uppercase tracking-wider">
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[var(--color-brand-accent)]/50" /> {formatDate(order.created_at)}</span>
                          <span className="flex items-center gap-1.5"><ShoppingBag className="w-3.5 h-3.5 text-[var(--color-brand-accent)]/50" /> {order.items.length} itens</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Section / Right Section */}
                    <div className="flex items-center sm:flex-col justify-between sm:justify-center sm:items-end pt-3 sm:pt-0 border-t sm:border-0 border-gray-50 gap-2">
                      <p className="font-black text-[var(--color-brand-dark)] text-xl sm:text-2xl tracking-tighter">R$ {order.total_price.toFixed(2).replace('.', ',')}</p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`/admin/orders/${order.id}/print`, '_blank');
                          }}
                          className="p-2.5 bg-gray-50 text-[var(--color-brand-accent)] border border-gray-100 rounded-xl hover:bg-[var(--color-brand-accent)]/10 hover:border-[var(--color-brand-accent)]/20 transition-all shadow-sm"
                          title="Imprimir Pedido"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrintKitchen(order.id);
                          }}
                          className="p-2.5 bg-gray-50 text-blue-600 border border-gray-100 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all shadow-sm"
                          title="Imprimir p/ Cozinha"
                        >
                          <ChefHat className="w-4 h-4" />
                        </button>
                        <span className={`text-[8px] sm:text-[9px] font-black px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl uppercase tracking-[0.15em] ${statusConfig[order.status].color} border shadow-sm`}>
                          {order.status === 'delivered' && order.delivery_type === 'pickup' ? 'Retirado' : statusConfig[order.status].label}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Order Details Panel */}
        <div className="relative hidden lg:block">
          <AnimatePresence mode="wait">
            {selectedOrder ? (
              <motion.div 
                key={selectedOrder.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden sticky top-24"
              >
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <button 
                        onClick={() => setSelectedOrder(null)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        title="Fechar Detalhes"
                        aria-label="Fechar Detalhes do Pedido"
                      >
                        <XCircle className="w-6 h-6" />
                      </button>
                      <button 
                        onClick={handlePrint}
                        className="text-[var(--color-brand-accent)] hover:text-[var(--color-brand-accent)]/80 transition-colors flex items-center gap-1.5 font-black text-xs uppercase tracking-widest"
                      >
                        <Printer className="w-4 h-4" /> IMPRIMIR
                      </button>
                      <button 
                        onClick={() => handlePrintKitchen()}
                        className="text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1.5 font-black text-xs uppercase tracking-widest"
                      >
                        <ChefHat className="w-4 h-4" /> COZINHA
                      </button>
                      <button 
                        onClick={() => handleShareOrder(selectedOrder)}
                        className="text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1.5 font-black text-xs uppercase tracking-widest"
                        title="Enviar para Entregador"
                      >
                        <Share2 className="w-4 h-4" /> ENVIAR
                      </button>
                      <button 
                        onClick={() => deleteOrder(selectedOrder.id)}
                        className="text-rose-500 hover:text-rose-700 transition-colors flex items-center gap-1.5 font-black text-xs uppercase tracking-widest"
                        title="Apagar Pedido"
                      >
                        <Trash2 className="w-4 h-4" /> APAGAR
                      </button>
                    </div>
                    <span className="font-black text-[10px] text-gray-300 tracking-widest uppercase">ID: {selectedOrder.id.slice(-6).toUpperCase()}</span>
                  </div>
                  <h2 className="text-2xl font-black text-[var(--color-brand-dark)] tracking-tight">{selectedOrder.customer_name}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <a href={`tel:${selectedOrder.customer_phone}`} className="flex items-center gap-2 text-sm font-black text-[var(--color-brand-accent)] hover:underline">
                      <Phone className="w-4 h-4" /> {selectedOrder.customer_phone}
                    </a>
                  </div>
                </div>

                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto no-scrollbar">
                  {/* Status Timeline / Buttons */}
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mudar Status</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => updateOrderStatus(selectedOrder.id, 'preparing')}
                        disabled={selectedOrder.status === 'preparing'}
                        className={`text-xs font-bold py-2 px-3 rounded-lg border transition-all ${selectedOrder.status === 'preparing' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'}`}
                      >
                        Em Preparo
                      </button>
                      <button 
                        onClick={() => updateOrderStatus(selectedOrder.id, 'shipped')}
                        disabled={selectedOrder.status === 'shipped'}
                        className={`text-xs font-bold py-2 px-3 rounded-lg border transition-all ${selectedOrder.status === 'shipped' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-purple-600 border-purple-200 hover:bg-purple-50'}`}
                      >
                        Sair p/ Entrega
                      </button>
                      <button 
                        onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}
                        disabled={selectedOrder.status === 'delivered'}
                        className={`text-xs font-bold py-2 px-3 rounded-lg border transition-all ${selectedOrder.status === 'delivered' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-green-600 border-green-200 hover:bg-green-50'}`}
                      >
                        {selectedOrder.delivery_type === 'pickup' ? 'Retirado' : 'Entregue'}
                      </button>
                      <button 
                        onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                        disabled={selectedOrder.status === 'cancelled'}
                        className={`text-xs font-bold py-2 px-3 rounded-lg border transition-all ${selectedOrder.status === 'cancelled' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-red-600 border-red-200 hover:bg-red-50'}`}
                      >
                        Cancelar
                      </button>
                      {['delivered', 'cancelled', 'archived'].includes(selectedOrder.status) && (
                        <button 
                          onClick={() => updateOrderStatus(selectedOrder.id, selectedOrder.status === 'archived' ? 'delivered' : 'archived')}
                          className={`text-xs font-bold py-2 px-3 rounded-lg border transition-all col-span-2 ${selectedOrder.status === 'archived' ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                        >
                          <span className="flex items-center justify-center gap-2"><Archive className="w-3.5 h-3.5"/> {selectedOrder.status === 'archived' ? 'Desarquivar Pedido' : 'Arquivar Pedido'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="space-y-3 p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-2 text-[#381010] font-bold text-sm">
                      {selectedOrder.delivery_type === 'delivery' ? <Truck className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                      {selectedOrder.delivery_type === 'delivery' ? 'Delivery' : 'Retirada'}
                    </div>
                    {selectedOrder.delivery_type === 'delivery' && (
                      <div className="space-y-1">
                        <p className="text-xs text-gray-600 flex items-start gap-1">
                          <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                          {selectedOrder.address_street}, {selectedOrder.address_number} - {selectedOrder.address_neighborhood}
                        </p>
                        {selectedOrder.address_complement && <p className="text-xs text-gray-400 ml-4">Ref: {selectedOrder.address_complement}</p>}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-200">
                      <CreditCard className="w-3 h-3 shrink-0" />
                      <select
                        value={selectedOrder.payment_method}
                        onChange={(e) => updatePaymentMethod(selectedOrder.id, e.target.value)}
                        disabled={savingPaymentId === selectedOrder.id}
                        className={`flex-1 text-xs font-bold bg-transparent border-0 outline-none cursor-pointer rounded transition-colors ${
                          savingPaymentId === selectedOrder.id ? 'opacity-50' : 'hover:text-[var(--color-brand-accent)]'
                        }`}
                        title="Trocar forma de pagamento"
                      >
                        {availablePaymentMethods.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                        {!availablePaymentMethods.includes(selectedOrder.payment_method) && (
                          <option value={selectedOrder.payment_method}>{selectedOrder.payment_method}</option>
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Itens do Pedido</p>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm font-bold text-[#381010]">{item.quantity}x {item.name}</p>
                            {item.variant && <p className="text-xs text-gray-500">{item.variant}</p>}
                            {item.addons && item.addons.length > 0 && (
                              <p className="text-xs text-[#ff914a] font-medium">+ {item.addons.map(a => a.name).join(', ')}</p>
                            )}
                          </div>
                          <p className="text-sm font-mono text-gray-400">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedOrder.observation && (
                    <div className="p-5 bg-[var(--color-brand-light)] border-2 border-[var(--color-brand-accent)]/10 rounded-2xl">
                      <p className="text-[10px] font-black text-[var(--color-brand-dark)] mb-2 uppercase tracking-widest">Observação:</p>
                      <p className="text-sm text-[var(--color-brand-dark)]/80 font-medium italic">&quot;{selectedOrder.observation}&quot;</p>
                    </div>
                  )}
                </div>

                <div className="p-8 bg-gray-50/50 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 font-black text-xs uppercase tracking-[0.2em]">Total do Pedido</span>
                    <span className="text-3xl font-black text-[var(--color-brand-dark)] tracking-tighter">R$ {selectedOrder.total_price.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-[60vh] flex flex-col items-center justify-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200 p-8 text-center">
                <ShoppingBag className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="font-bold text-gray-400">Selecione um pedido</h3>
                <p className="text-sm text-gray-400">Clique em um card ao lado para ver os detalhes completos.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>

    {/* Mobile Order Detail Bottom Sheet */}
    <AnimatePresence>
      {selectedOrder && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#381010]/40 backdrop-blur-sm"
            onClick={() => setSelectedOrder(null)}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] max-h-[92vh] flex flex-col"
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            {/* Header */}
            <div className="px-5 pb-4 border-b border-gray-100 shrink-0">
              <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handlePrint}
                    className="text-[var(--color-brand-accent)] hover:text-[var(--color-brand-accent)]/80 transition-colors flex items-center gap-1.5 font-black text-xs uppercase tracking-widest"
                  >
                    <Printer className="w-4 h-4" /> IMPRIMIR
                  </button>
                  <button 
                    onClick={() => handlePrintKitchen()}
                    className="text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1.5 font-black text-xs uppercase tracking-widest"
                  >
                    <ChefHat className="w-4 h-4" /> COZINHA
                  </button>
                  <button 
                    onClick={() => handleShareOrder(selectedOrder)}
                    className="text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1.5 font-black text-xs uppercase tracking-widest"
                    title="Enviar para Entregador"
                  >
                    <Share2 className="w-4 h-4" /> ENVIAR
                  </button>
                  <button 
                    onClick={() => deleteOrder(selectedOrder.id)}
                    className="text-rose-500 hover:text-rose-700 transition-colors flex items-center gap-1.5 font-black text-xs uppercase tracking-widest"
                    title="Apagar Pedido"
                  >
                    <Trash2 className="w-4 h-4" /> APAGAR
                  </button>
                </div>
                <span className="font-black text-[10px] text-gray-300 tracking-widest uppercase">ID: {selectedOrder.id.slice(-6).toUpperCase()}</span>
              </div>
              <h2 className="text-xl font-black text-[var(--color-brand-dark)] tracking-tight">{selectedOrder.customer_name}</h2>
              <a href={`tel:${selectedOrder.customer_phone}`} className="flex items-center gap-1.5 text-sm font-black text-[var(--color-brand-accent)] hover:underline mt-1">
                <Phone className="w-4 h-4" /> {selectedOrder.customer_phone}
              </a>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar">
              {/* Status Buttons */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mudar Status</p>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => updateOrderStatus(selectedOrder.id, 'preparing')}
                    disabled={selectedOrder.status === 'preparing'}
                    className={`text-xs font-bold py-2.5 px-3 rounded-xl border transition-all ${selectedOrder.status === 'preparing' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'}`}
                  >
                    Em Preparo
                  </button>
                  <button 
                    onClick={() => updateOrderStatus(selectedOrder.id, 'shipped')}
                    disabled={selectedOrder.status === 'shipped'}
                    className={`text-xs font-bold py-2.5 px-3 rounded-xl border transition-all ${selectedOrder.status === 'shipped' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-purple-600 border-purple-200 hover:bg-purple-50'}`}
                  >
                    Sair p/ Entrega
                  </button>
                  <button 
                    onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}
                    disabled={selectedOrder.status === 'delivered'}
                    className={`text-xs font-bold py-2.5 px-3 rounded-xl border transition-all ${selectedOrder.status === 'delivered' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-green-600 border-green-200 hover:bg-green-50'}`}
                  >
                    {selectedOrder.delivery_type === 'pickup' ? 'Retirado' : 'Entregue'}
                  </button>
                  <button 
                    onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                    disabled={selectedOrder.status === 'cancelled'}
                    className={`text-xs font-bold py-2.5 px-3 rounded-xl border transition-all ${selectedOrder.status === 'cancelled' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-red-600 border-red-200 hover:bg-red-50'}`}
                  >
                    Cancelar
                  </button>
                  {['delivered', 'cancelled', 'archived'].includes(selectedOrder.status) && (
                    <button 
                      onClick={() => updateOrderStatus(selectedOrder.id, selectedOrder.status === 'archived' ? 'delivered' : 'archived')}
                      className={`text-xs font-bold py-2.5 px-3 rounded-xl border transition-all col-span-2 ${selectedOrder.status === 'archived' ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                    >
                      <span className="flex items-center justify-center gap-2"><Archive className="w-3.5 h-3.5"/> {selectedOrder.status === 'archived' ? 'Desarquivar Pedido' : 'Arquivar Pedido'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Delivery Info */}
              <div className="space-y-3 p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-2 text-[#381010] font-bold text-sm">
                  {selectedOrder.delivery_type === 'delivery' ? <Truck className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                  {selectedOrder.delivery_type === 'delivery' ? 'Delivery' : 'Retirada'}
                </div>
                {selectedOrder.delivery_type === 'delivery' && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600 flex items-start gap-1">
                      <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                      {selectedOrder.address_street}, {selectedOrder.address_number} - {selectedOrder.address_neighborhood}
                    </p>
                    {selectedOrder.address_complement && <p className="text-xs text-gray-400 ml-4">Ref: {selectedOrder.address_complement}</p>}
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-200">
                  <CreditCard className="w-3 h-3 shrink-0" />
                  <select
                    value={selectedOrder.payment_method}
                    onChange={(e) => updatePaymentMethod(selectedOrder.id, e.target.value)}
                    disabled={savingPaymentId === selectedOrder.id}
                    className={`flex-1 text-xs font-bold bg-transparent border-0 outline-none cursor-pointer rounded transition-colors ${
                      savingPaymentId === selectedOrder.id ? 'opacity-50' : 'hover:text-[var(--color-brand-accent)]'
                    }`}
                    title="Trocar forma de pagamento"
                  >
                    {availablePaymentMethods.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                    {!availablePaymentMethods.includes(selectedOrder.payment_method) && (
                      <option value={selectedOrder.payment_method}>{selectedOrder.payment_method}</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Itens do Pedido</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-bold text-[#381010]">{item.quantity}x {item.name}</p>
                        {item.variant && <p className="text-xs text-gray-500">{item.variant}</p>}
                        {item.addons && item.addons.length > 0 && (
                          <p className="text-xs text-[#ff914a] font-medium">+ {item.addons.map(a => a.name).join(', ')}</p>
                        )}
                      </div>
                      <p className="text-sm font-mono text-gray-400">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Observation */}
              {selectedOrder.observation && (
                <div className="p-4 bg-[var(--color-brand-light)] border-2 border-[var(--color-brand-accent)]/10 rounded-2xl">
                  <p className="text-[10px] font-black text-[var(--color-brand-dark)] mb-1.5 uppercase tracking-widest">Observação:</p>
                  <p className="text-sm text-[var(--color-brand-dark)]/80 font-medium italic">&quot;{selectedOrder.observation}&quot;</p>
                </div>
              )}
            </div>

            {/* Footer Total */}
            <div className="p-5 bg-gray-50/50 border-t border-gray-100 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-black text-xs uppercase tracking-[0.2em]">Total do Pedido</span>
                <span className="text-2xl font-black text-[var(--color-brand-dark)] tracking-tighter">R$ {selectedOrder.total_price.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    <CustomModal 
      isOpen={modalConfig.isOpen}
      onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
      onConfirm={modalConfig.onConfirm}
      title={modalConfig.title}
      message={modalConfig.message}
      type={modalConfig.type}
    />

    {/* Cash Closing Modal */}
    <AnimatePresence>
        {isCashModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:items-center bg-[#381010]/40 backdrop-blur-md overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] w-full max-w-md max-h-[90vh] overflow-y-auto shadow-[0_20px_50px_rgba(56,16,16,0.15)] border border-white/20 mt-4 sm:mt-0 flex flex-col"
            >
              <div className="bg-[#381010] p-8 text-white text-center relative">
                <button 
                  onClick={() => setIsCashModalOpen(false)}
                  className="absolute right-6 top-6 p-2 text-white/30 hover:text-white transition-colors rounded-full hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="mb-4 p-4 rounded-3xl bg-white/10 w-fit mx-auto shadow-inner">
                  <Receipt className="w-10 h-10 text-[#ff914a]" />
                </div>
                <h2 className="text-2xl font-black tracking-tight">Fechamento de Caixa</h2>
                <p className="text-[#ff914a] font-bold text-xs uppercase tracking-widest mt-1">
                  {currentSession ? `Caixa Aberto em: ${new Date(currentSession.opened_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : 'Resumo do Dia'}
                </p>
              </div>

              <div className="p-8 space-y-4">
                {currentSession && (
                  <div className="bg-orange-50 border border-orange-100 p-3 rounded-xl text-orange-800 text-xs text-center font-medium mb-4">
                    Ao imprimir, a sessão de caixa atual será fechada e zerada.
                  </div>
                )}
                
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(getCashClosingData().totals).map(([method, value]) => (
                    <div key={method} className="flex justify-between items-center p-4 bg-[#fff8f4] rounded-2xl border border-[#ff914a]/5 group hover:border-[#ff914a]/20 transition-all">
                      <span className="text-[#381010] font-bold">{method}</span>
                      <span className="font-mono font-black text-[#381010] text-lg">R$ {value.toFixed(2).replace('.', ',')}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-6 mt-2 border-t border-dashed border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-400 text-xs uppercase font-black tracking-widest">Detalhamento do Dia</span>
                    <span className="font-bold text-[#381010] bg-gray-50 px-3 py-1 rounded-full text-xs">{getCashClosingData().count} entregues</span>
                  </div>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar mb-6 pr-1">
                    {getCashClosingData().items.map((order) => (
                      <div key={order.id} className="flex justify-between items-center text-xs p-2 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50">
                        <div className="flex flex-col">
                          <span className="font-black text-[#381010] truncate max-w-[120px]">{order.customer_name}</span>
                          <span className="text-[10px] text-gray-400">{new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • {order.payment_method}</span>
                        </div>
                        <span className="font-bold text-[#381010]">R$ {order.total_price.toFixed(2).replace('.', ',')}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center p-4 bg-[#381010] rounded-2xl shadow-xl shadow-[#381010]/10">
                    <span className="text-white/60 font-bold">Total Bruto</span>
                    <span className="text-2xl font-black text-[#ff914a]">R$ {getCashClosingData().total.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-6">
                  <button 
                    onClick={() => setIsCashModalOpen(false)}
                    className="flex-1 py-4 px-4 rounded-2xl font-black text-gray-400 hover:text-[#381010] hover:bg-gray-50 transition-all text-sm active:scale-95"
                  >
                    Voltar
                  </button>
                  <button 
                    onClick={handlePrintCashReport}
                    className="flex-1 py-4 px-4 bg-[#ff914a] text-[#381010] rounded-2xl font-black hover:bg-[#ff7a21] transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-[#ff914a]/20 active:scale-95"
                  >
                    <Printer className="w-5 h-5" /> Imprimir
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </>
  );
}
