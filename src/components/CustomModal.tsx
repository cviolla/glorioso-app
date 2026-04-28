"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, X, AlertTriangle } from "lucide-react";

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "danger";
  confirmText?: string;
  cancelText?: string;
}

export function CustomModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "info",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
}: CustomModalProps) {
  const themes = {
    info: {
      icon: AlertCircle,
      color: "text-[#ff914a]",
      bg: "bg-[#fff8f4]",
      border: "border-[#ff914a]/10",
      button: "bg-[#381010] hover:bg-[#4a1616]",
    },
    success: {
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      button: "bg-[#381010] hover:bg-[#4a1616]",
    },
    warning: {
      icon: AlertTriangle,
      color: "text-amber-500",
      bg: "bg-amber-50",
      border: "border-amber-100",
      button: "bg-[#ff914a] hover:bg-[#ff7a21]",
    },
    danger: {
      icon: AlertTriangle,
      color: "text-rose-500",
      bg: "bg-rose-50",
      border: "border-rose-100",
      button: "bg-rose-500 hover:bg-rose-600",
    },
  };

  const theme = themes[type];
  const Icon = theme.icon;

  // Se não houver função de confirmação, o texto de cancelar vira "Fechar"
  const finalCancelText = !onConfirm ? "Fechar" : cancelText;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#381010]/40 backdrop-blur-md z-[100]"
          />
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[101] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(56,16,16,0.15)] w-full max-w-sm overflow-hidden pointer-events-auto border border-white/20"
            >
              <div className={`p-8 ${theme.bg} border-b ${theme.border} flex flex-col items-center text-center relative`}>
                <button 
                  onClick={onClose}
                  className="absolute right-6 top-6 p-2 text-gray-300 hover:text-[#381010] transition-colors rounded-full hover:bg-white/50"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className={`mb-4 p-4 rounded-3xl bg-white shadow-xl shadow-[#381010]/5 ${theme.color}`}>
                  <Icon className="w-10 h-10" />
                </div>
                
                <h3 className="font-black text-[#381010] text-2xl tracking-tight">{title}</h3>
              </div>
              
              <div className="p-8 text-center">
                <p className="text-gray-500 font-medium leading-relaxed">{message}</p>
              </div>

              <div className="p-8 pt-0 flex gap-3">
                <button
                  onClick={onClose}
                  className={`flex-1 px-4 py-4 rounded-2xl font-black transition-all text-sm ${
                    !onConfirm 
                      ? "bg-[#381010] text-white hover:bg-[#4a1616] shadow-lg shadow-[#381010]/20 active:scale-95" 
                      : "bg-gray-100 text-gray-400 hover:bg-gray-200 active:scale-95"
                  }`}
                >
                  {finalCancelText}
                </button>
                
                {onConfirm && (
                  <button
                    onClick={() => {
                      onConfirm();
                      onClose();
                    }}
                    className={`flex-1 px-4 py-4 rounded-2xl font-black text-white transition-all text-sm shadow-lg active:scale-95 ${theme.button}`}
                  >
                    {confirmText}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
