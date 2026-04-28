"use client";

import { useStoreStatusStore } from "@/store/storeStatusStore";
import { useSettingsStore } from "@/store/settingsStore";
import { 
  Phone, 
  CreditCard, 
  Truck, 
  Save, 
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  AlertTriangle
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { CustomModal } from "@/components/CustomModal";

export default function AdminSettingsPage() {
  const { isAutoMode, isManualOpen, toggleAutoMode, setManualOpen } = useStoreStatusStore();
  const { 
    whatsappNumber, 
    deliveryFees,
    paymentMethods,
    setWhatsappNumber,
    setDeliveryFee,
    setPaymentMethods
  } = useSettingsStore();

  const [localWhatsapp, setLocalWhatsapp] = useState(whatsappNumber);
  const [localFees, setLocalFees] = useState(deliveryFees);
  const [isSaving, setIsSaving] = useState(false);
  const [localMethods, setLocalMethods] = useState(paymentMethods);
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "danger";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "success"
  });

  const toggleMethod = (method: string) => {
    setLocalMethods(prev => 
      prev.includes(method) 
        ? prev.filter(m => m !== method) 
        : [...prev, method]
    );
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setWhatsappNumber(localWhatsapp);
      setPaymentMethods(localMethods);
      // Salva cada taxa individualmente no store
      Object.entries(localFees).forEach(([neighborhood, fee]) => {
        setDeliveryFee(neighborhood, fee);
      });
      setIsSaving(false);
      
      // Abre o modal customizado em vez do alert nativo
      setModalConfig({
        isOpen: true,
        title: "Sucesso!",
        message: "Configurações salvas com sucesso no sistema.",
        type: "success"
      });
    }, 800);
  };

  const allPossibleMethods = ['PIX', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro'];

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      <div>
        <h1 className="text-3xl font-black text-[var(--color-brand-dark)] tracking-tight">Configurações</h1>
        <p className="text-gray-500 text-sm">Gerencie o funcionamento da sua loja e canais de contato.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status da Loja */}
        <section className="bg-white p-8 rounded-[2rem] border border-white shadow-sm space-y-8 hover:shadow-md transition-all">
          <div className="mb-2">
            <h2 className="text-xl font-black text-[var(--color-brand-dark)] tracking-tight">Status da Loja</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-5 bg-gray-50/50 rounded-2xl border border-transparent hover:border-gray-100 transition-all">
              <div>
                <p className="text-sm font-black text-[var(--color-brand-dark)] uppercase tracking-tight">Modo Automático</p>
                <p className="text-xs text-gray-500 font-medium mt-1">Abre/fecha conforme o horário configurado.</p>
              </div>
              <button 
                onClick={toggleAutoMode}
                className={`transition-all hover:scale-110 active:scale-95 ${isAutoMode ? 'text-[var(--color-brand-accent)]' : 'text-gray-200'}`}
              >
                {isAutoMode ? <ToggleRight className="w-12 h-12" /> : <ToggleLeft className="w-12 h-12" />}
              </button>
            </div>

            {!isAutoMode && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-5 bg-rose-50 border-2 border-rose-100 rounded-2xl"
              >
                <div>
                  <p className="text-sm font-black text-rose-900 uppercase tracking-tight">Controle Manual</p>
                  <p className="text-xs text-rose-700 font-bold mt-1">Status: {isManualOpen ? 'ABERTA AGORA' : 'FECHADA AGORA'}.</p>
                </div>
                <button 
                  onClick={() => setManualOpen(!isManualOpen)}
                  className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-sm ${isManualOpen ? 'bg-white text-rose-600 hover:bg-rose-100' : 'bg-white text-emerald-600 hover:bg-emerald-50'}`}
                >
                  {isManualOpen ? 'Fechar Loja' : 'Abrir Loja'}
                </button>
              </motion.div>
            )}

            <div className="p-6 bg-[#f8ece3]/40 border border-[#381010]/5 rounded-[2.5rem] space-y-4">
              <div className="mb-2">
                <h3 className="text-sm font-black text-[#381010] uppercase tracking-tight">Horário Padrão</h3>
                <p className="text-[10px] text-[#ff914a] font-bold uppercase tracking-widest">Configuração Semanal</p>
              </div>
              
              <div className="grid grid-cols-1 gap-2.5">
                <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-white shadow-sm transition-all hover:shadow-md group">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#ff914a] shadow-[0_0_8px_rgba(255,145,74,0.5)] group-hover:scale-125 transition-transform" />
                    <span className="text-xs font-black text-[#381010]/80 uppercase tracking-tight">Terça a Domingo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-[#ff914a]/60 uppercase tracking-widest">Das</span>
                    <span className="text-xs font-black text-[#ff914a] bg-[#ff914a]/5 px-3 py-1.5 rounded-xl border border-[#ff914a]/10">15:00 — 23:59</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-[#f8ece3]/20 rounded-2xl border border-dashed border-[#381010]/10 opacity-60">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-gray-300" />
                    <span className="text-xs font-black text-gray-400 uppercase tracking-tight">Segunda-feira</span>
                  </div>
                  <div className="px-4 py-1.5 bg-gray-100/50 rounded-xl">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loja Fechada</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-[9px] text-[#381010]/30 font-bold uppercase tracking-tighter text-center">
                  * Alterações no horário fixo requerem atualização de sistema
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contato e Delivery */}
        <section className="bg-white p-8 rounded-[2rem] border border-white shadow-sm space-y-8 hover:shadow-md transition-all">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
              <Phone className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-[var(--color-brand-dark)] tracking-tight">Contato e Taxas</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">WhatsApp de Recebimento</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-[var(--color-brand-accent)] transition-colors" />
                <input 
                  type="text" 
                  value={localWhatsapp}
                  onChange={(e) => setLocalWhatsapp(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[var(--color-brand-accent)]/20 focus:ring-4 focus:ring-[var(--color-brand-accent)]/5 outline-none transition-all font-bold text-[var(--color-brand-dark)]"
                  placeholder="Ex: 5521999999999"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(localFees).map(([neighborhood, fee]) => (
                <div key={neighborhood}>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block truncate">
                    {neighborhood}
                  </label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 font-black group-focus-within:text-[var(--color-brand-accent)] transition-colors">R$</span>
                    <input 
                      type="number" 
                      value={fee}
                      onChange={(e) => setLocalFees({ ...localFees, [neighborhood]: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[var(--color-brand-accent)]/20 focus:ring-4 focus:ring-[var(--color-brand-accent)]/5 outline-none transition-all font-black text-[var(--color-brand-dark)]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Métodos de Pagamento */}
        <section className="bg-white p-8 rounded-[2rem] border border-white shadow-sm space-y-8 hover:shadow-md transition-all">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
              <CreditCard className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-[var(--color-brand-dark)] tracking-tight">Pagamento</h2>
          </div>

          <div className="space-y-3">
            {allPossibleMethods.map((method) => {
              const isActive = localMethods.includes(method);
              return (
                <div 
                  key={method} 
                  onClick={() => toggleMethod(method)}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${isActive ? 'bg-indigo-50 border-indigo-100 shadow-sm' : 'bg-gray-50 border-transparent hover:border-gray-200 opacity-60'}`}
                >
                  <span className={`text-sm font-black uppercase tracking-tight ${isActive ? 'text-indigo-900' : 'text-gray-400'}`}>{method}</span>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-400'}`}>
                    {isActive ? 'Ativo' : 'Inativo'}
                    {isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Botão Salvar */}
        <div className="lg:col-span-2 flex justify-center pt-8">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[var(--color-brand-accent)] text-white font-black px-16 py-5 rounded-2xl shadow-xl shadow-[var(--color-brand-accent)]/20 flex items-center gap-3 hover:scale-105 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 uppercase tracking-widest text-sm"
          >
            {isSaving ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
            Salvar Alterações
          </button>
        </div>
      </div>
      
      <CustomModal 
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </div>
  );
}
