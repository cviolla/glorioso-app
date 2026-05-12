"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Users, Search, Key, Phone, User as UserIcon, ShieldAlert, Loader2, CheckCircle2, XCircle, Trash2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Customer = {
  id: string;
  name: string;
  phone: string;
  user_id: string | null;
  created_at: string;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setCustomers(data);
    }
    setIsLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !newPassword) return;

    setIsResetting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: selectedCustomer.phone,
          newPassword: newPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
        setTimeout(() => {
          setSelectedCustomer(null);
          setNewPassword("");
          setMessage(null);
        }, 2000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao resetar senha' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro de conexão com o servidor' });
    } finally {
      setIsResetting(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;
    setIsDeleting(true);

    try {
      const response = await fetch('/api/admin/delete-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: customerToDelete.phone })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Erro ao excluir cliente');

      setCustomers(prev => prev.filter(c => c.phone !== customerToDelete.phone));
      setCustomerToDelete(null);
    } catch (error: any) {
      alert(error.message || "Erro ao excluir cliente.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone?.includes(searchTerm)
  );

  return (
    <div className="space-y-6 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#381010] flex items-center gap-2">
            <Users className="w-8 h-8 text-[#ff914a]" /> Gestão de Clientes
          </h1>
          <p className="text-sm text-gray-500">Gerencie perfis e acessos dos seus clientes.</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou telefone..."
            className="pl-10 pr-4 py-2.5 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#ff914a] bg-white shadow-sm w-full md:w-72 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-[#ff914a] animate-spin" />
          <p className="text-gray-500 font-medium">Carregando clientes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          <AnimatePresence>
            {filteredCustomers.map((customer) => (
              <motion.div
                key={customer.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${customer.user_id ? 'bg-[#ff914a]/10 text-[#ff914a]' : 'bg-gray-100 text-gray-400'}`}>
                    <UserIcon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-bold text-[#381010] truncate text-sm" title={customer.name}>{customer.name || 'Sem nome'}</h3>
                      {customer.user_id ? (
                        <span className="bg-green-100 text-green-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter shrink-0">Logado</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-400 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter shrink-0">Anônimo</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Phone className="w-3 h-3" />
                      <span>{customer.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between gap-2">
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">
                    {new Date(customer.created_at).toLocaleDateString('pt-BR')}
                  </span>
                  
                    <div className="flex items-center gap-1">
                      {customer.user_id && (
                        <button
                          onClick={() => setSelectedCustomer(customer)}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-[#532120] text-white rounded-lg text-[10px] font-bold hover:bg-[#381010] transition-colors whitespace-nowrap"
                        >
                          <Key className="w-3 h-3" />
                          Resetar
                        </button>
                      )}
                      <button
                        onClick={() => setCustomerToDelete(customer)}
                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Excluir cliente"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!isLoading && filteredCustomers.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500">Nenhum cliente encontrado.</p>
        </div>
      )}

      {/* Modal de Reset de Senha */}
      <AnimatePresence>
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isResetting && setSelectedCustomer(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative overflow-hidden p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#ff914a]/10 rounded-2xl flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6 text-[#ff914a]" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#381010]">Alterar Senha</h2>
                  <p className="text-sm text-gray-500">{selectedCustomer.name}</p>
                </div>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Nova Senha</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Ex: glorioso123"
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#ff914a] bg-gray-50 text-sm font-medium"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isResetting}
                  />
                </div>

                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl flex items-center gap-3 text-sm font-bold ${
                      message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}
                  >
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    {message.text}
                  </motion.div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCustomer(null)}
                    disabled={isResetting}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-100 text-gray-500 font-bold hover:bg-gray-50 transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isResetting || !newPassword}
                    className="flex-1 px-4 py-3 rounded-xl bg-[#532120] text-white font-bold hover:bg-[#381010] transition-colors shadow-lg shadow-[#532120]/20 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 text-sm"
                  >
                    {isResetting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : 'Confirmar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Modal de Exclusão */}
      <AnimatePresence>
        {customerToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isDeleting && setCustomerToDelete(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-sm rounded-3xl shadow-2xl relative overflow-hidden p-6"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                
                <h2 className="text-xl font-black text-[#381010] mb-2">Excluir Cliente?</h2>
                <p className="text-sm text-gray-500 mb-6">
                  Você está prestes a excluir <span className="font-bold text-[#381010]">{customerToDelete.name || customerToDelete.phone}</span>.
                </p>

                <div className="w-full bg-red-50 border border-red-100 rounded-2xl p-4 mb-6">
                  <p className="text-xs text-red-600 font-bold leading-relaxed">
                    ⚠️ ATENÇÃO: Esta ação é permanente e não pode ser desfeita. O perfil do cliente será removido da base de dados.
                  </p>
                </div>

                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => setCustomerToDelete(null)}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-100 text-gray-500 font-bold hover:bg-gray-50 transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeleteCustomer}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 text-sm"
                  >
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Excluir'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
