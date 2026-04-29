"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle, 
  ChevronRight, 
  Phone, 
  MapPin, 
  CreditCard, 
  ShoppingBag,
  Loader2,
  Filter,
  Calendar,
  Printer,
  History,
  Trash2,
  TrendingUp,
  DollarSign,
  Receipt,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomModal } from '@/components/CustomModal';

type OrderStatus = 'pending' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';

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
  pending: { label: 'Pendente', color: 'text-amber-600 bg-amber-50 border-amber-200', icon: Clock },
  preparing: { label: 'Em Preparo', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: ShoppingBag },
  shipped: { label: 'Saiu p/ Entrega', color: 'text-purple-600 bg-purple-50 border-purple-200', icon: Truck },
  delivered: { label: 'Entregue', color: 'text-green-600 bg-green-50 border-green-200', icon: CheckCircle2 },
  cancelled: { label: 'Cancelado', color: 'text-red-600 bg-red-50 border-red-200', icon: XCircle },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
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

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error("Erro ao buscar pedidos:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();

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
    } catch (err) {
      setModalConfig({
        isOpen: true,
        title: "Erro de Status",
        message: "Não foi possível atualizar o status do pedido agora.",
        type: "danger"
      });
    }
  };

  const [salesPeriod, setSalesPeriod] = useState<'1' | '3' | '7' | '15' | 'all'>('1');

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
          
          if (error) throw error;

          if (!data || data.length === 0) {
            throw new Error("O pedido não foi encontrado no banco ou você não tem permissão para apagá-lo.");
          }
          
          setOrders(prev => prev.filter(o => o.id !== orderId));
          setSelectedOrder(null);
          
          setModalConfig({
            isOpen: true,
            title: "Sucesso!",
            message: "Pedido removido com sucesso!",
            type: "success"
          });
        } catch (err: any) {
          setModalConfig({
            isOpen: true,
            title: "Erro na Exclusão",
            message: err.message || "Erro desconhecido ao apagar pedido.",
            type: "danger"
          });
        }
      }
    });
  };

  const calculateSales = (days: '1' | '3' | '7' | '15' | 'all') => {
    const now = new Date();
    const filtered = orders.filter(order => {
      if (order.status !== 'delivered') return false;
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
          if (order.status !== 'delivered') return false;
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
    // Adiciona uma classe temporária para imprimir apenas o recibo
    document.body.classList.add('printing-order');
    // Pequeno delay para garantir que o navegador processe o estado antes de abrir o diálogo de impressão no mobile
    setTimeout(() => {
      window.print();
      document.body.classList.remove('printing-order');
    }, 250);
  };

  const getCashClosingData = () => {
    const today = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    const todayOrders = orders.filter(o => 
      new Date(o.created_at).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }) === today && 
      o.status === 'delivered'
    );

    const totals: Record<string, number> = {};
    let total = 0;

    todayOrders.forEach(o => {
      const method = o.payment_method || 'Outros';
      const value = Number(o.total_price) || 0;
      totals[method] = (totals[method] || 0) + value;
      total += value;
    });

    return { totals, total, count: todayOrders.length };
  };

  const handlePrintCashReport = () => {
    // Adiciona uma classe temporária para imprimir apenas o relatório
    document.body.classList.add('printing-cash-report');
    setTimeout(() => {
      window.print();
      document.body.classList.remove('printing-cash-report');
    }, 250);
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          order.id.slice(-4).includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

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
    <>
      <div className="space-y-6 print:hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--color-brand-dark)] tracking-tight">Gestão de Pedidos</h1>
          <p className="text-gray-500 text-sm">Acompanhe e gerencie as solicitações em tempo real.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsCashModalOpen(true)}
            className="flex items-center gap-2 bg-[var(--color-brand-accent)] text-white px-6 py-3 rounded-2xl font-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[var(--color-brand-accent)]/20"
          >
            <Receipt className="w-5 h-5" /> Fechar Caixa
          </button>
          <button 
            onClick={fetchOrders}
            className="bg-white border-2 border-gray-100 p-3 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm text-gray-400 hover:text-[var(--color-brand-accent)]"
          >
            <Loader2 className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Sales Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-[var(--color-brand-dark)] rounded-[2rem] p-8 shadow-xl relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-48 h-48 bg-[var(--color-brand-accent)]/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-[var(--color-brand-accent)]/20 transition-all duration-700"></div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <p className="text-[var(--color-brand-accent)] text-[10px] font-black uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> FATURAMENTO {salesPeriod === 'all' ? 'TOTAL' : `ÚLTIMOS ${salesPeriod} DIAS`}
              </p>
              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                R$ {calculateSales(salesPeriod).toFixed(2).replace('.', ',')}
              </h2>
            </div>
            <div className="flex flex-wrap gap-1.5 bg-white/5 p-1 rounded-2xl backdrop-blur-sm border border-white/5">
              {[
                { id: '1', label: 'Hoje' },
                { id: '3', label: '3d' },
                { id: '7', label: '7d' },
                { id: '15', label: '15d' },
                { id: 'all', label: 'Tudo' }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSalesPeriod(p.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${salesPeriod === p.id ? 'bg-[var(--color-brand-accent)] text-white shadow-lg shadow-[var(--color-brand-accent)]/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mini Chart */}
          <div className="mt-8 flex items-end justify-between gap-2 h-24">
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
        <div className="bg-white rounded-[2rem] p-8 border border-white shadow-sm flex flex-col justify-center gap-4 hover:shadow-md transition-all">
          <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center border border-green-100">
            <DollarSign className="w-7 h-7 text-green-600" />
          </div>
          <div>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Ticket Médio</p>
            <p className="text-3xl font-black text-[var(--color-brand-dark)] tracking-tight">
              R$ {(calculateSales('all') / (orders.filter(o => o.status === 'delivered').length || 1)).toFixed(2).replace('.', ',')}
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[var(--color-brand-accent)] transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar por cliente ou ID..." 
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent rounded-2xl outline-none focus:border-[var(--color-brand-accent)]/20 focus:ring-4 focus:ring-[var(--color-brand-accent)]/5 transition-all shadow-sm text-[var(--color-brand-dark)] font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative group">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[var(--color-brand-accent)] transition-colors" />
          <select 
            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent rounded-2xl outline-none focus:border-[var(--color-brand-accent)]/20 focus:ring-4 focus:ring-[var(--color-brand-accent)]/5 transition-all shadow-sm text-[var(--color-brand-dark)] font-black appearance-none"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="all">TODOS STATUS</option>
            <option value="pending">PENDENTES</option>
            <option value="preparing">EM PREPARO</option>
            <option value="shipped">EM ENTREGA</option>
            <option value="delivered">ENTREGUES</option>
            <option value="cancelled">CANCELADOS</option>
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
              return (
                <motion.div 
                  layoutId={order.id}
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`group p-5 sm:p-6 rounded-[2rem] border-2 transition-all cursor-pointer hover:shadow-xl ${selectedOrder?.id === order.id ? 'bg-white border-[var(--color-brand-accent)] shadow-[var(--color-brand-accent)]/10' : 'bg-white border-white hover:border-gray-100 shadow-sm'}`}
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
                      <span className={`text-[8px] sm:text-[9px] font-black px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl uppercase tracking-[0.15em] ${statusConfig[order.status].color} border shadow-sm`}>
                        {order.status === 'delivered' && order.delivery_type === 'pickup' ? 'Retirado' : statusConfig[order.status].label}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Order Details Panel */}
        <div className="relative">
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
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setSelectedOrder(null)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <XCircle className="w-6 h-6" />
                      </button>
                      <button 
                        onClick={handlePrint}
                        className="text-[var(--color-brand-accent)] hover:text-[var(--color-brand-accent)]/80 transition-colors flex items-center gap-2 font-black text-xs uppercase tracking-widest"
                      >
                        <Printer className="w-5 h-5" /> Imprimir
                      </button>
                      <button 
                        onClick={() => deleteOrder(selectedOrder.id)}
                        className="text-rose-500 hover:text-rose-700 transition-colors flex items-center gap-2 font-black text-xs uppercase tracking-widest ml-4"
                        title="Apagar Pedido"
                      >
                        <Trash2 className="w-5 h-5" /> Apagar
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
                      <CreditCard className="w-3 h-3" /> {selectedOrder.payment_method}
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#381010]/40 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-[0_20px_50px_rgba(56,16,16,0.15)] border border-white/20"
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
                  {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>

              <div className="p-8 space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(getCashClosingData().totals).map(([method, value]) => (
                    <div key={method} className="flex justify-between items-center p-4 bg-[#fff8f4] rounded-2xl border border-[#ff914a]/5 group hover:border-[#ff914a]/20 transition-all">
                      <span className="text-[#381010] font-bold">{method}</span>
                      <span className="font-mono font-black text-[#381010] text-lg">R$ {value.toFixed(2).replace('.', ',')}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-6 mt-2 border-t border-dashed border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-xs uppercase font-black tracking-widest">Total de Pedidos</span>
                    <span className="font-bold text-[#381010] bg-gray-50 px-3 py-1 rounded-full text-xs">{getCashClosingData().count} entregues</span>
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

      {/* Printable Receipt Component - Otimizado para Impressoras Térmicas (58mm/80mm) */}
      <div id="print-receipt" className="hidden print:block font-mono text-black p-0 w-[58mm] text-[10px] leading-tight bg-white overflow-hidden">
        <div className="w-full mx-auto p-0 flex flex-col">
          <div className="text-center pb-2">
            <h1 className="text-sm font-black uppercase">GLORIOSO BROWNIE</h1>
            <p className="text-[8px]">--------------------------------</p>
            <p className="text-[9px] font-bold">PEDIDO: #{selectedOrder?.id.slice(-6).toUpperCase()}</p>
            <p className="text-[8px]">{selectedOrder && formatDate(selectedOrder.created_at)}</p>
            <p className="text-[8px]">--------------------------------</p>
          </div>

          <div className="mb-2">
            <p><strong>CLIENTE:</strong> {selectedOrder?.customer_name}</p>
            <p><strong>TEL:</strong> {selectedOrder?.customer_phone}</p>
            <p className="text-[8px]">--------------------------------</p>
            <p><strong>TIPO:</strong> {selectedOrder?.delivery_type === 'delivery' ? 'DELIVERY' : 'RETIRADA'}</p>
            <p><strong>PREVISÃO:</strong> {selectedOrder?.order_time}</p>
            {selectedOrder?.delivery_type === 'delivery' && (
              <>
                <p><strong>END:</strong> {selectedOrder.address_street}, {selectedOrder.address_number}</p>
                <p><strong>BAIRRO:</strong> {selectedOrder.address_neighborhood}</p>
                {selectedOrder.address_complement && <p><strong>COMPL:</strong> {selectedOrder.address_complement}</p>}
                {selectedOrder.address_reference && <p><strong>REF:</strong> {selectedOrder.address_reference}</p>}
              </>
            )}
            <p className="text-[8px]">--------------------------------</p>
          </div>

          <div className="mb-2">
            <p className="font-bold text-center mb-1">RESUMO DO PEDIDO</p>
            {selectedOrder?.items.map((item, idx) => (
              <div key={idx} className="mb-2">
                <div className="flex justify-between gap-2">
                  <span className="font-bold">{item.quantity}x {item.name.substring(0, 18)}</span>
                  <span className="font-bold shrink-0">R${(item.price * item.quantity).toFixed(2)}</span>
                </div>
                {item.variant && <p className="text-[8px] ml-2 opacity-70">• {item.variant}</p>}
                {item.addons?.map(a => (
                  <p key={a.name} className="text-[8px] ml-2 opacity-70">+ {a.name}</p>
                ))}
              </div>
            ))}
            <p className="text-[8px]">--------------------------------</p>
          </div>

          <div className="mb-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>R${(selectedOrder?.total_price || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-black mt-1">
              <span>TOTAL:</span>
              <span>R${(selectedOrder?.total_price || 0).toFixed(2)}</span>
            </div>
            <p className="text-[8px] mt-1">--------------------------------</p>
          </div>

          <div className="mb-4">
            <p><strong>PAGAMENTO:</strong> {selectedOrder?.payment_method}</p>
            {selectedOrder?.observation && (
              <div className="mt-1 whitespace-pre-wrap">
                <p className="text-[8px]"><strong>OBS:</strong> {selectedOrder.observation}</p>
              </div>
            )}
          </div>
          
          <div className="text-center mt-2 pb-8">
            <p className="text-[8px] uppercase tracking-widest">Obrigado pela preferência!</p>
            <p className="text-[7px] mt-1">gloriosobrownie.com.br</p>
            <p className="text-[8px] mt-2">. . . . . . . . . . . . . . . .</p>
          </div>
        </div>
      </div>

      {/* Printable Cash Report */}
      <div id="print-cash-report" className="hidden printing-cash-report:block font-mono text-black p-0 w-[58mm] text-[10px] bg-white overflow-hidden">
        <div className="w-full mx-auto p-0">
          <div className="text-center pb-2">
            <h1 className="text-sm font-black uppercase">GLORIOSO BROWNIE</h1>
            <p className="text-[8px]">--------------------------------</p>
            <h2 className="text-[10px] font-bold uppercase">FECHAMENTO DE CAIXA</h2>
            <p className="text-[8px]">{new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</p>
            <p className="text-[8px]">--------------------------------</p>
          </div>

          <div className="mb-4">
            <p className="font-bold text-center mb-2">RESUMO POR PAGAMENTO</p>
            {Object.entries(getCashClosingData().totals).map(([method, value]) => (
              <div key={method} className="flex justify-between py-0.5">
                <span>{method}:</span>
                <span className="font-bold">R${value.toFixed(2)}</span>
              </div>
            ))}
            <p className="text-[8px] mt-1">--------------------------------</p>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Qtd Pedidos:</span>
              <span>{getCashClosingData().count}</span>
            </div>
            <div className="flex justify-between text-sm font-black mt-1">
              <span>TOTAL BRUTO:</span>
              <span>R${getCashClosingData().total.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-10 pt-4 text-center pb-8">
            <p className="text-[8px]">________________________________</p>
            <p className="text-[7px] mt-1">Assinatura do Responsável</p>
            <p className="text-[8px] mt-4">********************************</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            margin: 0;
            size: 58mm auto;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 58mm !important;
            height: auto !important;
            background: white !important;
            font-family: 'Courier New', Courier, monospace !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          /* Esconde tudo */
          body * {
            visibility: hidden;
            height: 0;
            margin: 0;
            padding: 0;
          }
          /* Mostra apenas o conteúdo relevante baseado na classe do body */
          body.printing-order #print-receipt,
          body.printing-order #print-receipt *,
          body.printing-cash-report #print-cash-report,
          body.printing-cash-report #print-cash-report * {
            visibility: visible !important;
            height: auto !important;
          }

          body.printing-order #print-receipt,
          body.printing-cash-report #print-cash-report {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 58mm !important;
            display: block !important;
            background: white !important;
            margin: 0 !important;
            padding: 2mm !important;
            box-sizing: border-box !important;
          }

          /* Esconde o que não deve ser impresso */
          body:not(.printing-order) #print-receipt,
          body:not(.printing-cash-report) #print-cash-report {
            display: none !important;
            visibility: hidden !important;
          }
          .print\:hidden {
            display: none !important;
          }
          /* Estabilização de texto para impressoras térmicas */
          .font-mono {
            font-family: 'Courier New', Courier, monospace !important;
            letter-spacing: -0.5px;
          }
        }
      `}</style>
    </>
  );
}
