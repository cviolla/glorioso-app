"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Share2, Clock, ArrowRight, Instagram } from "lucide-react";
import { StoreStatus } from "@/components/StoreStatus";

export default function Home() {
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

  return (
    <div className="h-[100dvh] bg-[#381010] font-sans flex flex-col relative overflow-hidden text-[#f8ece3]">
      {/* Background abstract elements for modern feel */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-[#532120] rounded-full mix-blend-screen filter blur-[80px] opacity-50"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 bg-[#954e3a] rounded-full mix-blend-screen filter blur-[80px] opacity-50"></div>

      <StoreStatus className="absolute top-4 right-4 z-40 scale-90 origin-top-right" />

      <main className="flex-1 flex flex-col items-center justify-center px-4 relative z-10 w-full">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="flex flex-col items-center text-center w-full max-w-md"
        >
          {/* Official Logo */}
          <div className="w-28 h-28 sm:w-40 sm:h-40 bg-[#f8ece3] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,145,74,0.4)] mb-4 sm:mb-6 overflow-hidden relative border-[3px] border-[#ff914a]">
            <Image 
              src="/GloriosoBrownie_Logo_fuul.png" 
              alt="Logo Glorioso Brownie" 
              fill
              className="object-cover"
              priority
              sizes="(max-width: 640px) 112px, 160px"
            />
          </div>
          
          <h1 className="text-2xl sm:text-4xl font-black mb-1 sm:mb-2 leading-tight">
            O Sabor Que <br className="sm:hidden" /><span className="text-[#ff914a]">Impressiona.</span>
          </h1>
          
          <a 
            href="https://www.instagram.com/gloriosobrownie/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 text-[13px] sm:text-base text-[#f8ece3]/80 hover:text-[#ff914a] transition-colors mb-5 sm:mb-8"
          >
            <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-medium">@gloriosobrownie</span>
          </a>

          <Link 
            href="/menu"
            className="w-2/3 sm:w-3/4 bg-[#ff914a] text-[#381010] font-black text-sm sm:text-lg py-3 sm:py-4 px-6 rounded-full shadow-[0_6px_15px_rgba(255,145,74,0.3)] hover:scale-105 hover:bg-[#ff9f61] transition-all flex items-center justify-center gap-2 sm:gap-3 mb-5 sm:mb-8"
          >
            Peça seu Lanche
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>

          <div className="flex flex-col items-center gap-3 sm:gap-4 w-full">
            <div className="flex flex-col gap-1.5 sm:gap-2 text-[10px] sm:text-sm text-[#f8ece3]/80">
              <a 
                href="https://wa.me/5521990062956?text=Olá!" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 hover:text-[#ff914a] transition-colors"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ff914a]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.031 0C5.385 0 0 5.383 0 12.029c0 2.122.553 4.195 1.604 6.012L.207 24l6.096-1.597A11.966 11.966 0 0 0 12.031 24c6.643 0 12.028-5.385 12.028-12.029S18.674 0 12.031 0zm3.896 17.135c-.168.473-.974.928-1.343.972-.371.045-1.026.136-3.329-.817-2.782-1.15-4.577-3.985-4.717-4.171-.141-.186-1.127-1.5-1.127-2.864 0-1.363.704-2.035.952-2.309.248-.274.542-.343.725-.343.183 0 .367.004.524.012.164.009.385-.065.604.464.225.545.726 1.776.791 1.905.066.129.11.28.026.448-.084.168-.128.274-.255.424-.128.15-.265.333-.382.443-.129.124-.265.26-.118.514.148.254.656 1.082 1.406 1.752.969.866 1.775 1.135 2.035 1.258.261.124.413.104.568-.07.155-.175.67-0.776.85-1.042.18-.266.36-.222.597-.132.238.09 1.503.71 1.761.839.258.129.431.194.494.301.062.107.062.624-.106 1.097z"/>
                </svg>
                <span className="font-medium underline underline-offset-2">(21) 99006-2956</span>
              </a>
              <a 
                href="https://maps.app.goo.gl/DM5P4tAFEQ8G99rJ7" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-center gap-1.5 text-center hover:text-[#ff914a] transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ff914a] shrink-0" />
                <span className="font-medium underline underline-offset-2 w-5/6 mx-auto sm:w-auto">Avenida B Nº 195 - R. da Feira, Nova Campinas</span>
              </a>
            </div>

            <button 
              onClick={handleShare}
              className="bg-[#532120] text-[#ff914a] p-2.5 sm:p-3 rounded-full shadow-md hover:bg-[#954e3a] hover:text-[#f8ece3] transition-colors mt-1"
              aria-label="Compartilhar"
            >
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full px-4 py-4 text-center text-[#f8ece3]/60 text-[10px] sm:text-xs relative z-10">
        <div className="flex items-center justify-center gap-1 mb-1">
          <Clock className="w-3 h-3" />
          <span>Terça a Domingo das 15h às 00h</span>
        </div>
        <p className="opacity-80">
          Ao pedir, você aceita nossos <Link href="/termos" className="font-bold text-[#ff914a] hover:underline">TERMOS</Link> e <Link href="/privacidade" className="font-bold text-[#ff914a] hover:underline">PRIVACIDADE</Link>.
        </p>
      </footer>
    </div>
  );
}
