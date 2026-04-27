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
      color: "text-blue-500",
      bg: "bg-blue-50",
      border: "border-blue-100",
      button: "bg-blue-500 hover:bg-blue-600",
    },
    success: {
      icon: CheckCircle2,
      color: "text-green-500",
      bg: "bg-green-50",
      border: "border-green-100",
      button: "bg-green-500 hover:bg-green-600",
    },
    warning: {
      icon: AlertTriangle,
      color: "text-amber-500",
      bg: "bg-amber-50",
      border: "border-amber-100",
      button: "bg-amber-500 hover:bg-amber-600",
    },
    danger: {
      icon: AlertTriangle,
      color: "text-red-500",
      bg: "bg-red-50",
      border: "border-red-100",
      button: "bg-red-500 hover:bg-red-600",
    },
  };

  const theme = themes[type];
  const Icon = theme.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#1a0808]/60 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[101] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden pointer-events-auto"
            >
              <div className={`p-6 ${theme.bg} border-b ${theme.border} flex items-center gap-4`}>
                <div className={`p-2 rounded-xl bg-white shadow-sm ${theme.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-black text-[#381010] text-lg">{title}</h3>
                <button 
                  onClick={onClose}
                  className="ml-auto p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                <p className="text-gray-600 leading-relaxed">{message}</p>
              </div>

              <div className="p-6 pt-0 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all text-sm"
                >
                  {cancelText}
                </button>
                {onConfirm && (
                  <button
                    onClick={() => {
                      onConfirm();
                      onClose();
                    }}
                    className={`flex-1 px-4 py-3 rounded-xl font-bold text-white transition-all text-sm shadow-lg ${theme.button}`}
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
