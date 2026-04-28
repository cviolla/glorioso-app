"use client";

import { useSettingsStore } from "@/store/settingsStore";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Share2, Clock } from "lucide-react";
import { StoreStatus } from "@/components/StoreStatus";

export default function Home() {
  const { whatsappNumber } = useSettingsStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Glorioso Brownie",
          text: "Peça agora o seu lanche no Glorioso Brownie!",
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      alert("Compartilhamento não suportado neste navegador.");
    }
  };

  const formatPhone = (phone: string) => {
    // Basic format: 5521990062956 -> (21) 99006-2956
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 11) {
      const area = cleaned.slice(2, 4);
      const first = cleaned.slice(4, 9);
      const last = cleaned.slice(9);
      return `(${area}) ${first}-${last}`;
    }
    return phone;
  };

  if (!isHydrated) return null;

  return (
    <div 
      className="flex flex-col min-h-[100dvh] text-[#f8ece3] font-sans selection:bg-[#ff914a] selection:text-[#381010] overflow-hidden relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/GB1.png')" }}
    >
      {/* Subtle overlay for text readability */}
      <div className="absolute inset-0 bg-black/20 z-0 pointer-events-none"></div>

      <StoreStatus className="absolute top-4 right-4 z-40 scale-90 origin-top-right" />

      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 w-full">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="flex flex-col items-center text-center w-full max-w-md mt-4 sm:mt-0"
        >
          {/* Official Logo */}
          <div className="w-36 h-36 sm:w-44 sm:h-44 bg-[#f8ece3] rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(255,145,74,0.4)] mb-6 sm:mb-8 overflow-hidden relative border-[3px] border-[#ff914a]">
            <Image 
              src="/GloriosoBrownie_Logo_fuul.png" 
              alt="Logo Glorioso Brownie" 
              fill
              className="object-cover"
              priority
              sizes="(max-width: 640px) 144px, 176px"
            />
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-black mb-2 sm:mb-3 leading-tight">
            O Sabor Que <span className="text-[#ff914a]">Impressiona.</span>
          </h1>
          
          <a 
            href="https://www.instagram.com/gloriosobrownie/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 text-sm sm:text-base text-[#f8ece3]/80 hover:text-[#ff914a] transition-colors mb-8 sm:mb-10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
            <span className="font-medium">@gloriosobrownie</span>
          </a>

          <Link 
            href="/menu"
            className="w-full sm:w-3/4 max-w-[280px] sm:max-w-none bg-[#ff914a] text-[#381010] font-black text-lg py-4 px-6 rounded-full shadow-[0_8px_20px_rgba(255,145,74,0.3)] hover:scale-105 hover:bg-[#ff9f61] transition-all flex items-center justify-center gap-3 mb-8 sm:mb-10"
          >
            Peça seu Lanche
            <ArrowRight className="w-5 h-5" />
          </Link>

          <div className="flex flex-col items-center gap-4 sm:gap-5 w-full">
            <div className="flex flex-col items-center gap-3 text-xs sm:text-sm text-[#f8ece3]/80">
              <a 
                href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent('Olá!')}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-center hover:text-[#ff914a] transition-colors inline-block"
              >
                <svg className="w-4 h-4 text-[#ff914a] inline-block mr-2 -mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.031 0C5.385 0 0 5.383 0 12.029c0 2.122.553 4.195 1.604 6.012L.207 24l6.096-1.597A11.966 11.966 0 0 0 12.031 24c6.643 0 12.028-5.385 12.028-12.029S18.674 0 12.031 0zm3.896 17.135c-.168.473-.974.928-1.343.972-.371.045-1.026.136-3.329-.817-2.782-1.15-4.577-3.985-4.717-4.171-.141-.186-1.127-1.5-1.127-2.864 0-1.363.704-2.035.952-2.309.248-.274.542-.343.725-.343.183 0 .367.004.524.012.164.009.385-.065.604.464.225.545.726 1.776.791 1.905.066.129.11.28.026.448-.084.168-.128.274-.255.424-.128.15-.265.333-.382.443-.129.124-.265.26-.118.514.148.254.656 1.082 1.406 1.752.969.866 1.775 1.135 2.035 1.258.261.124.413.104.568-.07.155-.175.67-0.776.85-1.042.18-.266.36-.222.597-.132.238.09 1.503.71 1.761.839.258.129.431.194.494.301.062.107.062.624-.106 1.097z"/>
                </svg>
                <span className="font-medium underline underline-offset-2">{formatPhone(whatsappNumber)}</span>
              </a>
              
              <a 
                href="https://maps.app.goo.gl/DM5P4tAFEQ8G99rJ7" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-center hover:text-[#ff914a] transition-colors max-w-[280px] sm:max-w-none inline-block leading-snug"
              >
                <MapPin className="w-4 h-4 text-[#ff914a] inline-block mr-1.5 -mt-1" />
                <span className="font-medium underline underline-offset-2">Avenida B Nº 195, Nova Campinas</span>
              </a>
              
              <div className="text-center text-[#f8ece3]/60 inline-block">
                <Clock className="w-4 h-4 text-[#ff914a] inline-block mr-1.5 -mt-0.5" />
                <span className="font-medium">Terça a Domingo das 15h às 00h</span>
              </div>
            </div>

            <button 
              onClick={handleShare}
              className="bg-[#532120] text-[#ff914a] p-3 rounded-full shadow-md hover:bg-[#954e3a] hover:text-[#f8ece3] transition-colors mt-2"
              aria-label="Compartilhar"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full px-4 py-4 text-center text-[#f8ece3]/60 text-[10px] sm:text-xs relative z-10">
        <p className="opacity-80">
          Ao pedir, você aceita nossos <Link href="/termos" className="font-bold text-[#ff914a] hover:underline">TERMOS</Link> e <Link href="/privacidade" className="font-bold text-[#ff914a] hover:underline">PRIVACIDADE</Link>.
        </p>
      </footer>
    </div>
  );
}
