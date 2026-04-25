"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Phone, MapPin, Share2, Info, ArrowRight } from "lucide-react";
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

      <main className="flex-1 flex flex-col items-center justify-center px-4 relative z-10">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="flex flex-col items-center text-center w-full max-w-md mt-6"
        >
          {/* Official Logo */}
          <div className="w-36 h-36 sm:w-44 sm:h-44 bg-[#f8ece3] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,145,74,0.4)] mb-6 overflow-hidden relative border-4 border-[#ff914a]">
            <Image 
              src="/GloriosoBrownie_Logo_fuul.png" 
              alt="Logo Glorioso Brownie" 
              fill
              className="object-cover"
              priority
              sizes="(max-width: 640px) 144px, 176px"
            />
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-black mb-2 leading-tight">
            O Sabor Que <span className="text-[#ff914a]">Impressiona.</span>
          </h1>
          
          <p className="text-sm sm:text-base text-[#f8ece3]/80 mb-6 sm:mb-8">
            Glorioso Brownie • O seu melhor momento.
          </p>

          <Link 
            href="/menu"
            className="w-full bg-[#ff914a] text-[#381010] font-black text-lg py-4 px-6 rounded-full shadow-[0_8px_20px_rgba(255,145,74,0.3)] hover:scale-105 hover:bg-[#ff9f61] transition-all flex items-center justify-center gap-3 mb-6"
          >
            Peça seu Lanche
            <ArrowRight className="w-5 h-5" />
          </Link>

          <div className="flex flex-col items-center gap-4 w-full">
            <div className="flex flex-col gap-2 text-xs sm:text-sm text-[#f8ece3]/80">
              <a 
                href="https://wa.me/5521990062956?text=Olá!" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 hover:text-[#ff914a] transition-colors"
              >
                <Phone className="w-4 h-4 text-[#ff914a]" />
                <span className="font-medium underline underline-offset-2">(21) 99006-2956</span>
              </a>
              <a 
                href="https://maps.app.goo.gl/DM5P4tAFEQ8G99rJ7" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-center gap-2 text-center hover:text-[#ff914a] transition-colors"
              >
                <MapPin className="w-4 h-4 text-[#ff914a] shrink-0" />
                <span className="font-medium underline underline-offset-2">Avenida B Nº 195 - R. da Feira, Nova Campinas</span>
              </a>
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
        <div className="flex items-center justify-center gap-1 mb-1">
          <Info className="w-3 h-3" />
          <span>Terça a Domingo das 15h às 00h</span>
        </div>
        <p className="opacity-80">
          Ao pedir, você aceita nossos <a href="#" className="font-bold text-[#ff914a] hover:underline">TERMOS</a> e <a href="#" className="font-bold text-[#ff914a] hover:underline">PRIVACIDADE</a>.
        </p>
      </footer>
    </div>
  );
}
