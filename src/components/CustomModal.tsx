"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

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
      button: "bg-[#ff914a] text-[#381010] hover:bg-[#ff7a21]",
    },
    success: {
      button: "bg-emerald-500 text-white hover:bg-emerald-600",
    },
    warning: {
      button: "bg-amber-500 text-white hover:bg-amber-600",
    },
    danger: {
      button: "bg-rose-500 text-white hover:bg-rose-600",
    },
  };

  const theme = themes[type];
  const finalCancelText = !onConfirm ? "Fechar" : cancelText;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#381010]/40 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(56,16,16,0.15)] w-full max-w-sm overflow-hidden border border-white/20"
          >
            {/* Header - Admin Style */}
            <div className="bg-[#381010] p-8 text-white text-center relative">
              <button 
                onClick={onClose}
                className="absolute right-6 top-6 p-2 text-white/30 hover:text-white transition-colors rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
              
              
              <h3 className="font-black text-2xl tracking-tight leading-tight">{title}</h3>
            </div>
            
            <div className="p-8 text-center">
              <p className="text-gray-500 font-bold leading-relaxed text-sm">{message}</p>
            </div>

            <div className="p-8 pt-0 flex gap-3">
              <button
                onClick={onClose}
                className={`flex-1 px-4 py-4 rounded-2xl font-black transition-all text-xs uppercase tracking-widest ${
                  !onConfirm 
                    ? "bg-[#381010] text-white hover:bg-[#532120] shadow-lg shadow-[#381010]/10 active:scale-95" 
                    : "bg-gray-50 text-gray-400 hover:text-[#381010] hover:bg-gray-100 active:scale-95"
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
                  className={`flex-1 px-4 py-4 rounded-2xl font-black transition-all text-xs uppercase tracking-widest shadow-lg active:scale-95 ${theme.button}`}
                >
                  {confirmText}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
