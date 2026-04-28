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
      const dateStr = date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' });
      
      const dayTotal = orders
        .filter(order => {
          if (order.status !== 'delivered') return false;
          const orderDate = new Date(order.created_at);
          return orderDate.toDateString() === date.toDateString();
        })
        .reduce((sum, order) => sum + order.total_price, 0);
        
      data.push({ label: dateStr, value: dayTotal });
    }
    return data;
  };

  const handlePrint = () => {
    if (!selectedOrder) return;
    // Pequeno delay para garantir que o navegador processe o estado antes de abrir o diálogo de impressão no mobile
    setTimeout(() => {
      window.print();
    }, 250);
  };

  const getCashClosingData = () => {
    const today = new Date().toDateString();
    const todayOrders = orders.filter(o => 
      new Date(o.created_at).toDateString() === today && 
      o.status === 'delivered'
    );

    const totals: Record<string, number> = {
      'PIX': 0,
      'Cartão de Crédito': 0,
      'Cartão de Débito': 0,
      'Dinheiro': 0,
    };

    let total = 0;
    todayOrders.forEach(o => {
      const method = o.payment_method;
      if (totals[method] !== undefined) {
        totals[method] += o.total_price;
      } else {
        // Fallback para métodos não listados ou variações de nome
        const normalized = Object.keys(totals).find(k => method.toUpperCase().includes(k.toUpperCase()));
        if (normalized) totals[normalized] += o.total_price;
      }
      total += o.total_price;
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
          <h1 className="text-2xl font-black text-[#381010]">Gestão de Pedidos</h1>
          <p className="text-gray-500 text-sm">Acompanhe e gerencie as solicitações em tempo real.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsCashModalOpen(true)}
            className="flex items-center gap-2 bg-[#ff914a] text-[#381010] px-4 py-2 rounded-xl font-bold hover:bg-[#ff7a21] transition-all shadow-md active:scale-95"
          >
            <Receipt className="w-5 h-5" /> Fechar Caixa
          </button>
          <button 
            onClick={fetchOrders}
            className="bg-white border border-gray-200 p-2 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Loader2 className={`w-5 h-5 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Sales Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-[#381010] rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-[#ff914a]/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-[#ff914a]/20 transition-all duration-700"></div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <p className="text-[#ff914a] text-xs font-black uppercase tracking-widest mb-1 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Faturamento {salesPeriod === 'all' ? 'Total' : `(Últimos ${salesPeriod} dias)`}
              </p>
              <h2 className="text-3xl sm:text-4xl font-black text-white">
                R$ {calculateSales(salesPeriod).toFixed(2).replace('.', ',')}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
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
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${salesPeriod === p.id ? 'bg-[#ff914a] text-[#381010]' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
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
                      className={`w-full max-w-[30px] rounded-t-lg bg-gradient-to-t from-[#ff914a] to-[#ffb385] relative`}
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-white text-[#381010] text-[10px] font-bold px-1.5 py-0.5 rounded shadow-lg pointer-events-none whitespace-nowrap">
                        R$ {day.value.toFixed(0)}
                      </div>
                    </motion.div>
                  </div>
                  <span className="text-[10px] text-white/40 font-bold uppercase">{day.label.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center border border-green-100">
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase">Ticket Médio</p>
            <p className="text-xl font-black text-[#381010]">
              R$ {(calculateSales('all') / (orders.filter(o => o.status === 'delivered').length || 1)).toFixed(2).replace('.', ',')}
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar por cliente ou ID..." 
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#ff914a] focus:border-transparent outline-none transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select 
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl appearance-none outline-none focus:ring-2 focus:ring-[#ff914a] shadow-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="all">Todos os Status</option>
            <option value="pending">Pendentes</option>
            <option value="preparing">Em Preparo</option>
            <option value="shipped">Em Entrega</option>
            <option value="delivered">Entregues</option>
            <option value="cancelled">Cancelados</option>
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
                  className={`group p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${selectedOrder?.id === order.id ? 'bg-white border-[#ff914a] ring-2 ring-[#ff914a]/10' : 'bg-white border-gray-100'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${statusConfig[order.status].color}`}>
                        <StatusIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-[#381010]">{order.customer_name}</span>
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-mono">#{order.id.slice(-4).toUpperCase()}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(order.created_at)}</span>
                          <span className="flex items-center gap-1"><ShoppingBag className="w-3 h-3" /> {order.items.length} itens</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-[#381010] mb-1">R$ {order.total_price.toFixed(2).replace('.', ',')}</p>
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg uppercase tracking-wider ${statusConfig[order.status].color} border`}>
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
                        className="text-[#ff914a] hover:text-[#ff7a21] transition-colors flex items-center gap-1 font-bold text-sm"
                      >
                        <Printer className="w-5 h-5" /> Imprimir
                      </button>
                      <button 
                        onClick={() => deleteOrder(selectedOrder.id)}
                        className="text-red-500 hover:text-red-700 transition-colors flex items-center gap-1 font-bold text-sm ml-2"
                        title="Apagar Pedido"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <span className="font-mono text-xs text-gray-400">ID: {selectedOrder.id.slice(-6).toUpperCase()}</span>
                  </div>
                  <h2 className="text-xl font-black text-[#381010]">{selectedOrder.customer_name}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <a href={`tel:${selectedOrder.customer_phone}`} className="flex items-center gap-1 text-sm font-bold text-[#ff914a] hover:underline">
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
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                      <p className="text-xs font-bold text-amber-800 mb-1">Observação:</p>
                      <p className="text-sm text-amber-900">{selectedOrder.observation}</p>
                    </div>
                  )}
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-bold">Total do Pedido</span>
                    <span className="text-2xl font-black text-[#381010]">R$ {selectedOrder.total_price.toFixed(2).replace('.', ',')}</span>
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

      {/* Printable Receipt Component - Otimizado para Impressoras Térmicas */}
      <div className="hidden print:block font-mono text-black p-0 w-full text-[12px] leading-tight bg-white">
        <div className="max-w-[72mm] mx-auto">
          <div className="text-center border-b border-dashed border-black pb-4 mb-4">
            <h1 className="text-lg font-black uppercase">GLORIOSO BROWNIE</h1>
            <p className="text-[10px]">PEDIDO: #{selectedOrder?.id.slice(-6).toUpperCase()}</p>
            <p className="text-[10px]">{selectedOrder && formatDate(selectedOrder.created_at)}</p>
          </div>

          <div className="mb-4 space-y-1">
            <p><strong>CLIENTE:</strong> {selectedOrder?.customer_name}</p>
            <p><strong>TEL:</strong> {selectedOrder?.customer_phone}</p>
            <div className="border-y border-dashed border-black/20 py-1 my-1">
              <p><strong>TIPO:</strong> {selectedOrder?.delivery_type === 'delivery' ? 'DELIVERY' : 'RETIRADA'}</p>
              <p><strong>PREVISÃO:</strong> {selectedOrder?.order_time}</p>
            </div>
            {selectedOrder?.delivery_type === 'delivery' && (
              <div className="text-[11px]">
                <p><strong>END:</strong> {selectedOrder.address_street}, {selectedOrder.address_number}</p>
                <p><strong>BAIRRO:</strong> {selectedOrder.address_neighborhood}</p>
                {selectedOrder.address_complement && <p><strong>COMPL:</strong> {selectedOrder.address_complement}</p>}
                {selectedOrder.address_reference && <p><strong>REF:</strong> {selectedOrder.address_reference}</p>}
              </div>
            )}
          </div>

          <div className="border-b border-dashed border-black pb-2 mb-2">
            <p className="font-bold text-center border-b border-black mb-2 py-1">RESUMO DO PEDIDO</p>
            {selectedOrder?.items.map((item, idx) => (
              <div key={idx} className="mb-2">
                <div className="flex justify-between font-bold">
                  <span>{item.quantity}x {item.name}</span>
                  <span>R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                </div>
                {item.variant && <p className="text-[10px] ml-2">• {item.variant}</p>}
                {item.addons?.map(a => (
                  <p key={a.name} className="text-[10px] ml-2 text-gray-700">+ {a.name}</p>
                ))}
              </div>
            ))}
          </div>

          <div className="space-y-1 border-b border-dashed border-black pb-2 mb-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>R$ {(selectedOrder?.total_price || 0).toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="flex justify-between text-base font-black">
              <span>TOTAL:</span>
              <span>R$ {(selectedOrder?.total_price || 0).toFixed(2).replace('.', ',')}</span>
            </div>
          </div>

          <div className="mb-4">
            <p><strong>PAGAMENTO:</strong> {selectedOrder?.payment_method}</p>
            {selectedOrder?.observation && (
              <div className="mt-2 p-1 border border-black border-dotted">
                <p className="text-[10px]"><strong>OBS:</strong> {selectedOrder.observation}</p>
              </div>
            )}
          </div>

          <div className="text-center mt-6 pt-4 border-t border-dashed border-black text-[10px]">
            <p className="font-bold">Obrigado pela preferência!</p>
            <p>www.gloriosobrownie.com.br</p>
            <p className="mt-2 italic">Documento não fiscal</p>
          </div>
        </div>
      </div>

      {/* Printable Cash Report */}
      <div className="hidden printing-cash-report:block font-mono text-black p-0 w-full text-sm bg-white">
        <div className="max-w-[72mm] mx-auto">
          <div className="text-center border-b-2 border-double border-black pb-4 mb-4">
            <h1 className="text-xl font-black uppercase">GLORIOSO BROWNIE</h1>
            <h2 className="text-lg font-bold">FECHAMENTO DE CAIXA</h2>
            <p>{new Date().toLocaleString('pt-BR')}</p>
          </div>

          <div className="space-y-2 mb-6">
            <p className="font-bold border-b border-black">RESUMO POR PAGAMENTO</p>
            {Object.entries(getCashClosingData().totals).map(([method, value]) => (
              <div key={method} className="flex justify-between">
                <span>{method}:</span>
                <span>R$ {value.toFixed(2).replace('.', ',')}</span>
              </div>
            ))}
          </div>

          <div className="border-t-2 border-black pt-2 space-y-1">
            <div className="flex justify-between">
              <span>Qtd Pedidos:</span>
              <span>{getCashClosingData().count}</span>
            </div>
            <div className="flex justify-between text-lg font-black">
              <span>TOTAL BRUTO:</span>
              <span>R$ {getCashClosingData().total.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>

          <div className="mt-10 pt-4 border-t border-dashed border-black text-center">
            <div className="w-full h-px bg-black mb-1"></div>
            <p className="text-[10px]">Assinatura do Responsável</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            margin: 0;
            size: auto;
          }
          body {
            margin: 0;
            padding: 0;
            height: auto !important;
            overflow: hidden !important;
            -webkit-print-color-adjust: exact;
          }
          .print\:hidden {
            display: none !important;
          }
          .printing-cash-report .print\:hidden {
            display: none !important;
          }
          .printing-cash-report .printing-cash-report\:block {
            display: block !important;
          }
          .printing-cash-report .print\:block {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
