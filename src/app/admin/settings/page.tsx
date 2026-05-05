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
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CustomModal } from "@/components/CustomModal";

// Brazilian price formatting helpers
function formatPriceBR(value: number): string {
  return value.toFixed(2).replace('.', ',');
}

function parsePriceBR(value: string): number {
  const cleaned = value.replace(/[^\d,]/g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

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
      // Use microtask to avoid synchronous setState warning during initial mount
      queueMicrotask(() => {
        setHasInitialized(true);
        if (whatsappNumber) setLocalWhatsapp(whatsappNumber);
        if (deliveryFees && Object.keys(deliveryFees).length > 0) setLocalFees(deliveryFees);
        if (paymentMethods) setLocalMethods(paymentMethods);
      });
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

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        {/* Top bar: Status & Contact */}
        <div className="p-4 border-b border-gray-50 bg-gray-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${isManualOpen ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
              <RefreshCw className={`w-5 h-5 ${isManualOpen ? 'animate-spin-slow' : ''}`} />
            </div>
            <div className="flex items-center gap-3">
              <AnimatePresence mode="wait">
                <motion.span
                  key={isManualOpen ? 'aberta' : 'fechada'}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 10, opacity: 0 }}
                  className={`text-xl font-black ${isManualOpen ? 'text-emerald-600' : 'text-rose-600'}`}
                >
                  {isManualOpen ? 'ABERTA' : 'FECHADA'}
                </motion.span>
              </AnimatePresence>
              <button 
                onClick={async () => {
                  if (isSaving) return;
                  setIsSaving(true);
                  try {
                    await setManualOpen(!isManualOpen);
                  } catch (error: any) {
                    setModalConfig({
                      isOpen: true,
                      title: "Erro",
                      message: error.message || "Erro ao atualizar status",
                      type: "danger"
                    });
                  } finally {
                    setIsSaving(false);
                  }
                }}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isManualOpen ? 'bg-rose-500 text-white hover:bg-rose-600' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
              >
                {isManualOpen ? 'Fechar' : 'Abrir'}
              </button>
            </div>
          </div>

          <div className="flex-1 max-w-sm relative group">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-[var(--color-brand-accent)] transition-colors" />
            <input 
              type="text" 
              value={localWhatsapp}
              onChange={(e) => setLocalWhatsapp(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl focus:border-[var(--color-brand-accent)]/30 outline-none transition-all font-bold text-sm text-[var(--color-brand-dark)]"
              placeholder="WhatsApp"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-50">
          {/* Payment Methods - Left Column */}
          <div className="p-4 space-y-4">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <CreditCard className="w-3.5 h-3.5" /> Pagamento
            </h2>
            <div className="grid grid-cols-1 gap-2">
              {allPossibleMethods.map((method) => {
                const isActive = localMethods.includes(method);
                return (
                  <div 
                    key={method} 
                    onClick={() => toggleMethod(method)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${isActive ? 'bg-indigo-50/50 border-indigo-100' : 'bg-gray-50/30 border-transparent opacity-60'}`}
                  >
                    <span className={`text-[10px] font-black uppercase tracking-tight ${isActive ? 'text-indigo-900' : 'text-gray-400'}`}>{method}</span>
                    {isActive ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5 text-gray-300" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Fees - Right Columns */}
          <div className="lg:col-span-2 p-4 space-y-4">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <Phone className="w-3.5 h-3.5" /> Taxas de Entrega
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(localFees).map(([neighborhood, fee]) => (
                <div key={neighborhood} className="bg-gray-50/30 p-2.5 rounded-xl border border-gray-50 hover:border-[var(--color-brand-accent)]/20 transition-all group shadow-xs">
                  <label className="text-[8px] font-black text-gray-400 uppercase tracking-wider mb-1 block truncate">
                    {neighborhood}
                  </label>
                  <div className="relative flex items-center gap-1">
                    <span className="text-[10px] font-black text-gray-300">R$</span>
                    <input 
                      type="text" 
                      inputMode="decimal"
                      value={formatPriceBR(fee as number)}
                      onChange={(e) => setLocalFees({ ...localFees, [neighborhood]: parsePriceBR(e.target.value) })}
                      className="w-full bg-transparent outline-none transition-all font-black text-sm text-[var(--color-brand-dark)]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 bg-gray-50/30 border-t border-gray-50 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[var(--color-brand-accent)] text-white font-black px-8 py-3 rounded-xl shadow-lg shadow-[var(--color-brand-accent)]/20 flex items-center gap-2 hover:scale-105 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest text-[10px]"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar Configurações
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
