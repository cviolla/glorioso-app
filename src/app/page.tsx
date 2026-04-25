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
    <div className="min-h-screen bg-[#381010] font-sans flex flex-col relative overflow-hidden text-[#f8ece3]">
      {/* Background abstract elements for modern feel */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#532120] rounded-full mix-blend-screen filter blur-[100px] opacity-50"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#954e3a] rounded-full mix-blend-screen filter blur-[100px] opacity-50"></div>

      <StoreStatus className="absolute top-6 right-6 z-40" />

      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 pt-20 pb-10">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="flex flex-col items-center text-center w-full max-w-md"
        >
          {/* Official Logo */}
          <div className="w-48 h-48 bg-[#f8ece3] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(255,145,74,0.4)] mb-8 overflow-hidden relative border-4 border-[#ff914a]">
            <Image 
              src="/GloriosoBrownie_Logo_fuul.png" 
              alt="Logo Glorioso Brownie" 
              fill
              className="object-cover"
              priority
            />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
            O Sabor Que <span className="text-[#ff914a]">Impressiona.</span>
          </h1>
          
          <p className="text-lg text-[#f8ece3]/80 mb-10">
            Glorioso Brownie • O seu melhor momento.
          </p>

          <Link 
            href="/menu"
            className="w-full bg-[#ff914a] text-[#381010] font-black text-lg py-5 px-6 rounded-full shadow-[0_10px_25px_rgba(255,145,74,0.3)] hover:scale-105 hover:bg-[#ff9f61] transition-all flex items-center justify-center gap-3 mb-10"
          >
            Peça seu Lanche
            <ArrowRight className="w-6 h-6" />
          </Link>

          <div className="flex flex-col items-center gap-6 w-full">
            <div className="flex flex-col gap-3 text-sm text-[#f8ece3]/80">
              <div className="flex items-center justify-center gap-2">
                <Phone className="w-5 h-5 text-[#ff914a]" />
                <span className="font-medium">(21) 99006-2956</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-center">
                <MapPin className="w-5 h-5 text-[#ff914a] shrink-0" />
                <span className="font-medium">Avenida B Nº 195 - R. da Feira, Nova Campinas</span>
              </div>
            </div>

            <button 
              onClick={handleShare}
              className="bg-[#532120] text-[#ff914a] p-4 rounded-full shadow-lg hover:bg-[#954e3a] hover:text-[#f8ece3] transition-colors mt-4"
              aria-label="Compartilhar"
            >
              <Share2 className="w-6 h-6" />
            </button>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full px-4 py-8 text-center text-[#f8ece3]/60 text-xs relative z-10">
        <div className="flex items-center justify-center gap-1 mb-2">
          <Info className="w-4 h-4" />
          <span>Funcionamento: Terça a Domingo das 15h às 00h</span>
        </div>
        <p className="mt-4">
          Ao clicar em Peça seu Lanche, você aceita nossos <br/>
          <a href="#" className="font-bold text-[#ff914a] hover:underline">TERMOS</a> e <a href="#" className="font-bold text-[#ff914a] hover:underline">PRIVACIDADE</a>.
        </p>
      </footer>
    </div>
  );
}
