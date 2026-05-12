"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, RefreshCw, Cloud, LogOut, Phone, Mail, Lock } from "lucide-react";
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
  user_id?: string | null;
};

export default function OrdersPage() {
  const [trackedIds, setTrackedIds] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Auth States
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [authForm, setAuthForm] = useState({ phone: '', email: '', password: '' });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    setIsHydrated(true);
    const savedIds = JSON.parse(localStorage.getItem("glorioso_tracked_orders") || "[]");
    if (savedIds && savedIds.length > 0) {
      setTrackedIds(savedIds);
    }
    
    // Check User
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      fetchOrders(savedIds, session?.user?.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchOrders(savedIds, session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchOrders = async (idsToSearch: string[], userId?: string) => {
    if ((!idsToSearch || idsToSearch.length === 0) && !userId) {
      setSearched(true);
      return;
    }

    setIsLoading(true);
    setSearched(true);
    try {
      let query = supabase
        .from('orders')
        .select('id, created_at, status, total_price, delivery_type, items, user_id')
        .order('created_at', { ascending: false })
        .limit(20);

      if (userId && idsToSearch.length > 0) {
        query = query.or(`id.in.(${idsToSearch.join(',')}),user_id.eq.${userId}`);
      } else if (userId) {
        query = query.eq('user_id', userId);
      } else {
        query = query.in('id', idsToSearch);
      }

      const { data, error } = await query;
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusConfig = (status: Order['status']) => {
    switch (status) {
      case 'pending': return { label: 'Pendente', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-200' };
      case 'preparing': return { label: 'Preparando', icon: Package, color: 'text-[#0066FF]', bg: 'bg-blue-100', border: 'border-blue-200' };
      case 'shipped': return { label: 'A Caminho', icon: Package, color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-200' };
      case 'delivered': case 'archived': return { label: 'Concluído', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' };
      case 'cancelled': return { label: 'Cancelado', icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' };
      default: return { label: 'Pendente', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-200' };
    }
  };

  useEffect(() => {
    if (orders.length === 0) return;
    const filterString = user ? `user_id=eq.${user.id}` : `id=in.(${trackedIds.join(',')})`;
    const channel = supabase.channel('orders-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: filterString }, () => {
        fetchOrders(trackedIds, user?.id);
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [orders.length, trackedIds, user]);

  const handleLinkOrders = async (userId: string) => {
    if (trackedIds.length > 0) {
      // Ignorar erros caso RLS bloqueie sem estar configurado corretamente
      await supabase.from('orders').update({ user_id: userId }).in('id', trackedIds).catch(console.error);
    }
  };

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, '');
    let num = digits.startsWith('5521') ? digits.slice(4) : (digits.startsWith('21') ? digits.slice(2) : digits);
    num = num.slice(0, 9);
    return num.length <= 5 ? `+55 (21) ${num}` : `+55 (21) ${num.slice(0, 5)}-${num.slice(5)}`;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      if (authMode === 'register') {
        if (!authForm.email || !authForm.password || authForm.phone.replace(/\D/g, '').length < 13) {
          throw new Error('Preencha todos os campos corretamente.');
        }
        const { data, error } = await supabase.auth.signUp({
          email: authForm.email,
          password: authForm.password,
          options: { data: { phone: authForm.phone } }
        });
        if (error) throw error;
        if (data.user) {
          await supabase.from('customers').upsert({ phone: authForm.phone, email: authForm.email, user_id: data.user.id }, { onConflict: 'phone' });
          await handleLinkOrders(data.user.id);
          setShowAuthModal(false);
        }
      } else {
        const { data: customerData, error: customerError } = await supabase.from('customers').select('email').eq('phone', authForm.phone).single();
        if (customerError || !customerData?.email) throw new Error('Telefone não encontrado. Verifique se você já tem conta.');
        
        const { data, error } = await supabase.auth.signInWithPassword({ email: customerData.email, password: authForm.password });
        if (error) throw new Error('Senha incorreta.');
        if (data.user) {
          await handleLinkOrders(data.user.id);
          setShowAuthModal(false);
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Erro inesperado.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setOrders([]);
    fetchOrders(trackedIds); // Refetch just local
  };

  if (!isHydrated) return null;

  return (
    <div className="min-h-screen font-sans bg-[#f8ece3] text-[#381010] pb-20">
      <header className="p-5 flex items-center justify-between gap-3 border-b border-[#532120]/10 sticky top-0 z-40 bg-[#f8ece3]/95 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link href="/menu" className="hover:bg-[#532120]/10 p-2 -ml-2 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-bold text-lg">Meus Pedidos</span>
        </div>
        {user && (
          <button onClick={handleLogout} className="p-2 hover:bg-red-100 rounded-full text-red-600 transition-colors" title="Sair da conta">
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </header>

      <main className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
        
        {!user && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#532120] text-white p-5 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute right-[-20px] top-[-20px] opacity-10">
              <Cloud className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                <Cloud className="w-5 h-5 text-[#ff914a]" /> Salve na Nuvem!
              </h3>
              <p className="text-sm text-white/80 mb-4 leading-relaxed">
                Crie uma conta rápida com seu celular para nunca mais perder o histórico dos seus pedidos, mesmo se trocar de aparelho.
              </p>
              <button onClick={() => setShowAuthModal(true)} className="bg-[#ff914a] text-[#381010] font-bold px-6 py-2.5 rounded-xl shadow-md hover:scale-105 transition-transform text-sm">
                Salvar meu histórico agora
              </button>
            </div>
          </motion.div>
        )}

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-[#381010] mb-1">{user ? 'Histórico na Nuvem' : 'Acompanhamento Ativo'}</h2>
            <p className="text-sm text-gray-600">
              {user ? 'Todos os seus pedidos salvos.' : 'Seus pedidos recentes neste dispositivo.'}
            </p>
          </div>
          <button onClick={() => fetchOrders(trackedIds, user?.id)} disabled={isLoading || (trackedIds.length === 0 && !user)} className="bg-[#532120]/10 text-[#532120] p-3 rounded-xl font-bold flex items-center justify-center disabled:opacity-50 transition-colors hover:bg-[#532120]/20">
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <AnimatePresence mode="popLayout">
          {searched && orders.length === 0 && !isLoading && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="text-center py-10">
              <div className="w-16 h-16 bg-[#532120]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-[#532120]/40" />
              </div>
              <h3 className="font-bold text-[#381010] mb-2">Nenhum pedido encontrado</h3>
              <p className="text-sm text-gray-500">Ainda não há histórico de pedidos para exibir.</p>
            </motion.div>
          )}

          {orders.map((order, index) => {
            const statusConfig = getStatusConfig(order.status);
            const shortId = order.id.slice(-6).toUpperCase();
            return (
              <motion.div key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 overflow-hidden relative">
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
                    <div className="absolute top-3 left-0 h-0.5 bg-[#532120] transition-all duration-500" style={{ width: order.status === 'pending' ? '15%' : order.status === 'preparing' ? '50%' : order.status === 'shipped' ? '75%' : '100%' }}></div>
                    <div className="relative flex justify-between">
                      <div className="flex flex-col items-center gap-1 bg-white px-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 transition-colors ${['pending', 'preparing', 'shipped', 'delivered', 'archived'].includes(order.status) ? 'bg-[#532120] text-white' : 'bg-gray-200 text-gray-400'}`}><Clock className="w-3.5 h-3.5" /></div>
                        <span className={`text-[10px] font-bold uppercase tracking-wide ${['pending', 'preparing', 'shipped', 'delivered', 'archived'].includes(order.status) ? 'text-[#532120]' : 'text-gray-400'}`}>Recebido</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 bg-white px-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 transition-colors ${['preparing', 'shipped', 'delivered', 'archived'].includes(order.status) ? 'bg-[#ff914a] text-white' : 'bg-gray-200 text-gray-400'}`}><Package className="w-3.5 h-3.5" /></div>
                        <span className={`text-[10px] font-bold uppercase tracking-wide ${['preparing', 'shipped', 'delivered', 'archived'].includes(order.status) ? 'text-[#ff914a]' : 'text-gray-400'}`}>Preparando</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 bg-white px-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 transition-colors ${['delivered', 'archived'].includes(order.status) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}><CheckCircle className="w-3.5 h-3.5" /></div>
                        <span className={`text-[10px] font-bold uppercase tracking-wide ${['delivered', 'archived'].includes(order.status) ? 'text-green-600' : 'text-gray-400'}`}>Concluído</span>
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
                          {item.addons && item.addons.length > 0 && <p className="text-xs text-[#ff914a]">+ {item.addons.map(a => a.name).join(', ')}</p>}
                        </div>
                      </div>
                      <span className="font-medium text-[#381010]">R$ {((item.price + (item.addons?.reduce((sum, a) => sum + a.price, 0) || 0)) * item.quantity).toFixed(2).replace('.', ',')}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{order.delivery_type === 'pickup' ? 'Retirada' : 'Delivery'}</span>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-0.5">Total</p>
                      <p className="font-bold text-lg text-[#532120]">R$ {order.total_price.toFixed(2).replace('.', ',')}</p>
                    </div>
                  </div>
                  {['delivered', 'archived'].includes(order.status) && (
                    <Link href="/menu" className="w-full mt-2 bg-[#f8ece3] text-[#532120] border border-[#532120]/20 py-3 rounded-xl font-bold text-center text-sm hover:bg-[#532120]/10 transition-colors">Fazer novo pedido</Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAuthModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white w-full max-w-md rounded-3xl overflow-hidden relative z-10 shadow-2xl">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-xl text-[#381010]">{authMode === 'register' ? 'Criar Conta' : 'Acessar Conta'}</h3>
                  <button onClick={() => setShowAuthModal(false)} className="text-gray-400 hover:text-gray-600"><XCircle className="w-6 h-6" /></button>
                </div>

                <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-6">
                  <button type="button" onClick={() => { setAuthMode('register'); setAuthError(''); }} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${authMode === 'register' ? 'bg-white text-[#532120] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Criar Senha</button>
                  <button type="button" onClick={() => { setAuthMode('login'); setAuthError(''); }} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${authMode === 'login' ? 'bg-white text-[#532120] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Já tenho conta</button>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-[#381010] mb-1 block">WhatsApp</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Phone className="w-5 h-5 text-gray-400" /></div>
                      <input type="tel" placeholder="99999-9999" required className="w-full border border-gray-300 rounded-xl py-3 pl-10 pr-3 outline-none focus:border-[#ff914a] focus:ring-1 focus:ring-[#ff914a] text-[#381010] bg-white transition-all" value={authForm.phone} onChange={e => setAuthForm({...authForm, phone: formatPhone(e.target.value)})} />
                    </div>
                  </div>

                  {authMode === 'register' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                      <label className="text-sm font-bold text-[#381010] mb-1 block mt-4">E-mail (Para recuperar senha)</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="w-5 h-5 text-gray-400" /></div>
                        <input type="email" placeholder="seu@email.com" required className="w-full border border-gray-300 rounded-xl py-3 pl-10 pr-3 outline-none focus:border-[#ff914a] focus:ring-1 focus:ring-[#ff914a] text-[#381010] bg-white transition-all" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} />
                      </div>
                    </motion.div>
                  )}

                  <div className={authMode === 'register' ? 'mt-4' : ''}>
                    <label className="text-sm font-bold text-[#381010] mb-1 block">Senha</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="w-5 h-5 text-gray-400" /></div>
                      <input type="password" placeholder="••••••••" required minLength={6} className="w-full border border-gray-300 rounded-xl py-3 pl-10 pr-3 outline-none focus:border-[#ff914a] focus:ring-1 focus:ring-[#ff914a] text-[#381010] bg-white transition-all" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} />
                    </div>
                  </div>

                  {authError && <p className="text-red-500 text-sm font-medium p-3 bg-red-50 rounded-xl border border-red-100 text-center">{authError}</p>}

                  <button type="submit" disabled={authLoading} className="w-full bg-[#532120] text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 hover:bg-[#381010] transition-colors disabled:opacity-70 mt-4">
                    {authLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : (authMode === 'register' ? 'Criar Conta e Salvar' : 'Entrar na Conta')}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
