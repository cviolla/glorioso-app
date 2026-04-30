"use client";

import { useStoreStatusStore } from "@/store/storeStatusStore";
import { useSettingsStore } from "@/store/settingsStore";
import { 
  Phone, 
  CreditCard, 
  Save, 
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  AlertTriangle
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CustomModal } from "@/components/CustomModal";

export default function AdminSettingsPage() {
  const { isManualOpen, setManualOpen, fetchStatus } = useStoreStatusStore();
  const { 
    whatsappNumber, 
    deliveryFees,
    paymentMethods,
    fetchSettings,
    setWhatsappNumber,
    setPaymentMethods,
    updateAllFees
  } = useSettingsStore();
  
  useEffect(() => {
    fetchStatus();
    fetchSettings();
  }, [fetchStatus, fetchSettings]);

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

  // Sincroniza estado local apenas na primeira vez que os dados chegam do Supabase
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (!hasInitialized && !useSettingsStore.getState().isLoading) {
      if (whatsappNumber) setLocalWhatsapp(whatsappNumber);
      if (deliveryFees && Object.keys(deliveryFees).length > 0) setLocalFees(deliveryFees);
      if (paymentMethods) setLocalMethods(paymentMethods);
      setHasInitialized(true);
    }
  }, [whatsappNumber, deliveryFees, paymentMethods, hasInitialized]);

  const toggleMethod = (method: string) => {
    setLocalMethods(prev => 
      prev.includes(method) 
        ? prev.filter(m => m !== method) 
        : [...prev, method]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setWhatsappNumber(localWhatsapp);
      await setPaymentMethods(localMethods);
      await updateAllFees(localFees);
      
      setIsSaving(false);
      setModalConfig({
        isOpen: true,
        title: "Sucesso!",
        message: "Configurações salvas com sucesso no banco de dados.",
        type: "success"
      });
    } catch (err) {
      console.error(err);
      setIsSaving(false);
      setModalConfig({
        isOpen: true,
        title: "Erro",
        message: "Erro ao salvar no banco de dados.",
        type: "danger"
      });
    }
  };

  const allPossibleMethods = ['PIX', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro', 'Voucher'];
  const methodSubLabels: Record<string, string> = {
    'Voucher': 'Alelo, Ticket, iFood, VR'
  };

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      <div>
        <h1 className="text-3xl font-black text-[var(--color-brand-dark)] tracking-tight">Configurações</h1>
        <p className="text-gray-500 text-sm">Gerencie o funcionamento da sua loja e canais de contato.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status da Loja */}
        <section className="bg-white p-8 rounded-[2rem] border border-white shadow-sm space-y-8 hover:shadow-md transition-all">
          <div className="flex items-center gap-4 mb-2">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${isManualOpen ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
              <RefreshCw className={`w-6 h-6 ${isManualOpen ? 'animate-spin-slow' : ''}`} />
            </div>
            <div>
              <h2 className="text-xl font-black text-[var(--color-brand-dark)] tracking-tight">Status da Loja</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Controle Direto</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className={`p-8 rounded-[2.5rem] border-2 transition-all flex flex-col items-center text-center gap-6 ${isManualOpen ? 'bg-emerald-50/50 border-emerald-100' : 'bg-rose-50/50 border-rose-100'}`}>
              <div>
                <p className={`text-sm font-black uppercase tracking-widest mb-1 ${isManualOpen ? 'text-emerald-900' : 'text-rose-900'}`}>
                  Sua loja está atualmente:
                </p>
                <h3 className={`text-4xl font-black ${isManualOpen ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {isManualOpen ? 'ABERTA' : 'FECHADA'}
                </h3>
              </div>

              <button 
                onClick={async () => {
                  if (isSaving) return;
                  setIsSaving(true);
                  try {
                    await setManualOpen(!isManualOpen);
                  } catch (err: any) {
                    setModalConfig({
                      isOpen: true,
                      title: "Erro de Permissão",
                      message: `Não foi possível atualizar o status no banco de dados. Verifique se você rodou o SQL de permissão de UPDATE no Supabase.\n\nErro: ${err.message || 'Desconhecido'}`,
                      type: "danger"
                    });
                  } finally {
                    setIsSaving(false);
                  }
                }}
                disabled={isSaving}
                className={`w-full py-6 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 ${
                  isManualOpen 
                    ? 'bg-rose-500 text-white shadow-rose-500/20 hover:bg-rose-600' 
                    : 'bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-600'
                } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSaving ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  isManualOpen ? 'Fechar Loja Agora' : 'Abrir Loja Agora'
                )}
              </button>

              <p className="text-[10px] text-gray-400 font-medium max-w-[200px]">
                * Esta alteração é imediata e afetará o que os clientes veem no site.
              </p>
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
              const subLabel = methodSubLabels[method];
              return (
                <div 
                  key={method} 
                  onClick={() => toggleMethod(method)}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${isActive ? 'bg-indigo-50 border-indigo-100 shadow-sm' : 'bg-gray-50 border-transparent hover:border-gray-200 opacity-60'}`}
                >
                  <div className="flex flex-col min-w-0">
                    <span className={`text-sm font-black uppercase tracking-tight ${isActive ? 'text-indigo-900' : 'text-gray-400'}`}>{method}</span>
                    {subLabel && (
                      <span className={`text-[10px] font-bold tracking-wide mt-0.5 ${isActive ? 'text-indigo-500' : 'text-gray-400'}`}>{subLabel}</span>
                    )}
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shrink-0 ${isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-400'}`}>
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
