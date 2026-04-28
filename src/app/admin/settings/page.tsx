"use client";

import { useStoreStatusStore } from "@/store/storeStatusStore";
import { useSettingsStore } from "@/store/settingsStore";
import { 
  Store, 
  Clock, 
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

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setWhatsappNumber(localWhatsapp);
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

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      <div>
        <h1 className="text-2xl font-black text-[#381010]">Configurações</h1>
        <p className="text-gray-500 text-sm">Gerencie o funcionamento da sua loja e canais de contato.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status da Loja */}
        <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Store className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-[#381010]">Status da Loja</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div>
                <p className="text-sm font-bold text-[#381010]">Modo Automático</p>
                <p className="text-sm text-gray-500">Abre/fecha conforme o horário configurado.</p>
              </div>
              <button 
                onClick={toggleAutoMode}
                className={`transition-colors ${isAutoMode ? 'text-[#ff914a]' : 'text-gray-300'}`}
              >
                {isAutoMode ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
              </button>
            </div>

            {!isAutoMode && (
              <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                <div>
                  <p className="text-sm font-bold text-amber-900">Controle Manual</p>
                  <p className="text-sm text-amber-700">A loja está atualmente {isManualOpen ? 'ABERTA' : 'FECHADA'}.</p>
                </div>
                <button 
                  onClick={() => setManualOpen(!isManualOpen)}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${isManualOpen ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
                >
                  {isManualOpen ? 'Fechar Loja' : 'Abrir Loja'}
                </button>
              </div>
            )}

            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3">
              <Clock className="w-5 h-5 text-blue-600 shrink-0" />
              <div className="text-sm text-blue-700 leading-relaxed">
                <p className="font-bold mb-1">Horário Padrão:</p>
                <p>Terça a Domingo: 15:00 às 23:59</p>
                <p>Segunda-feira: Fechado</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contato e Delivery */}
        <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
              <Phone className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-[#381010]">Contato e Taxas</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">WhatsApp de Recebimento</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  value={localWhatsapp}
                  onChange={(e) => setLocalWhatsapp(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#ff914a] outline-none transition-all"
                  placeholder="Ex: 5521999999999"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(localFees).map(([neighborhood, fee]) => (
                <div key={neighborhood}>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block truncate">
                    {neighborhood}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                    <input 
                      type="number" 
                      value={fee}
                      onChange={(e) => setLocalFees({ ...localFees, [neighborhood]: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#ff914a] outline-none transition-all text-sm font-bold text-[#381010]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Métodos de Pagamento */}
        <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <CreditCard className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-[#381010]">Pagamento</h2>
          </div>

          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <div key={method} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium text-[#381010]">{method}</span>
                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-bold uppercase">Ativo</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 italic flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Edição de métodos de pagamento disponível na próxima atualização.
          </p>
        </section>

        {/* Botão Salvar */}
        <div className="lg:col-span-2 flex justify-center pt-8">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#ff914a] text-[#381010] font-black px-12 py-4 rounded-2xl shadow-lg shadow-[#ff914a]/20 flex items-center gap-2 hover:scale-105 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
          >
            {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
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
