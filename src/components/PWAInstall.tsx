"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado ou em modo standalone
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      setShowInstall(false);
      setDeferredPrompt(null);
      setIsInstalled(true);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowInstall(false);
      setDeferredPrompt(null);
    }
  };

  if (isInstalled || !showInstall) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-8 left-4 right-4 z-50 flex justify-center"
      >
        <div className="bg-[var(--color-brand-dark)] text-white p-4 rounded-3xl shadow-2xl flex items-center justify-between gap-4 max-w-sm w-full border border-white/10 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[var(--color-brand-accent)] rounded-2xl flex items-center justify-center shadow-lg shadow-[var(--color-brand-accent)]/20">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black uppercase tracking-wider leading-tight">Instalar App</span>
              <span className="text-[10px] text-gray-400 font-bold">Acesso rápido ao Admin</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleInstall}
              className="bg-white text-[var(--color-brand-dark)] px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-[1.05] transition-transform active:scale-[0.95]"
            >
              Instalar
            </button>
            <button
              onClick={() => setShowInstall(false)}
              className="p-2.5 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
