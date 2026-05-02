"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Lock, ArrowRight, Loader2, MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSettingsStore } from "@/store/settingsStore";

interface OTPVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (phone: string) => void;
}

export function OTPVerification({ isOpen, onClose, onVerified }: OTPVerificationProps) {
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { whatsappNumber } = useSettingsStore();

  const handleSendOTP = async () => {
    if (phone.length < 10) {
      setError("Por favor, insira um telefone válido.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // 1. Gerar código aleatório de 6 dígitos
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();

      // 2. Salvar no Supabase
      const { error: dbError } = await supabase.from('otp_codes').insert({
        phone: phone.replace(/\D/g, ''),
        code: generatedCode
      });

      if (dbError) throw dbError;

      // 3. Abrir WhatsApp para o cliente solicitar o código à loja
      const text = encodeURIComponent(`Olá! Estou tentando acessar meu histórico no app Glorioso Brownie. Pode me enviar meu código de verificação? (Ref: ${generatedCode.slice(0, 3)})`);
      window.open(`https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${text}`, '_blank');

      setStep('code');
    } catch (err) {
      console.error(err);
      setError("Erro ao gerar código. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (code.length !== 6) {
      setError("O código deve ter 6 dígitos.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const { data, error: verifyError } = await supabase
        .from('otp_codes')
        .select('*')
        .eq('phone', cleanPhone)
        .eq('code', code)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (verifyError || !data || data.length === 0) {
        setError("Código inválido ou expirado.");
        return;
      }

      // Sucesso!
      onVerified(cleanPhone);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Erro na verificação. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl"
      >
        <div className="p-8">
          <div className="w-16 h-16 bg-[#ff914a]/10 rounded-2xl flex items-center justify-center mb-6 mx-auto">
            {step === 'phone' ? <Phone className="w-8 h-8 text-[#ff914a]" /> : <Lock className="w-8 h-8 text-[#ff914a]" />}
          </div>

          <h2 className="text-2xl font-black text-[#381010] text-center mb-2">
            {step === 'phone' ? 'Verificar Histórico' : 'Digite o Código'}
          </h2>
          <p className="text-gray-500 text-center text-sm mb-8">
            {step === 'phone' 
              ? 'Insira seu WhatsApp para que possamos localizar seus pedidos com segurança.' 
              : 'Solicite seu código via WhatsApp e insira os 6 dígitos abaixo.'}
          </p>

          <div className="space-y-4">
            {step === 'phone' ? (
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:border-[#ff914a] outline-none transition-all font-bold text-[#381010]"
                />
              </div>
            ) : (
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:border-[#ff914a] outline-none transition-all font-black text-center text-2xl tracking-[0.5em] text-[#381010]"
                />
              </div>
            )}

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-xs font-bold text-center">
                {error}
              </motion.p>
            )}

            <button
              onClick={step === 'phone' ? handleSendOTP : handleVerifyOTP}
              disabled={isLoading}
              className="w-full bg-[#ff914a] text-white font-black py-4 rounded-2xl shadow-lg shadow-[#ff914a]/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                <>
                  {step === 'phone' ? 'Solicitar Código via WhatsApp' : 'Verificar e Acessar'}
                  {step === 'phone' ? <MessageSquare className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                </>
              )}
            </button>

            <button 
              onClick={onClose}
              className="w-full text-gray-400 font-bold text-sm py-2 hover:text-gray-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
