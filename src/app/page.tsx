"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Phone, MapPin, Share2, MessageCircle, Info } from "lucide-react";
import { StoreStatus } from "@/components/StoreStatus";
import { BottomNav } from "@/components/BottomNav";
import { Sidebar } from "@/components/Sidebar";
import { ProductCard } from "@/components/ProductCard";
import { menuData } from "@/data/menu";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string>(menuData[0].id);

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

  const currentCategoryData = menuData.find(c => c.id === activeCategory);

  return (
    <div className="min-h-screen bg-[#f8ece3] font-sans pb-24">
      <Sidebar onSelectCategory={setActiveCategory} />

      {/* Header / Hero Section */}
      <header className="bg-[#532120] text-[#f8ece3] pt-16 pb-12 px-6 rounded-b-[40px] shadow-lg relative overflow-hidden">
        <StoreStatus className="absolute top-4 right-4 z-40" />
        
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="flex flex-col items-center text-center"
        >
          {/* Official Logo */}
          <div className="w-40 h-40 bg-[#f8ece3] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,145,74,0.3)] mb-4 overflow-hidden relative border-4 border-[#ff914a]">
            <Image 
              src="/GloriosoBrownie_Logo_fuul.png" 
              alt="Logo Glorioso Brownie" 
              fill
              className="object-cover"
              priority
            />
          </div>
          
          <h1 className="text-2xl font-bold mb-2">O Sabor Que Impressiona!</h1>
          
          <div className="flex flex-col gap-2 text-sm text-[#f8ece3]/80 mb-6">
            <div className="flex items-center justify-center gap-2">
              <Phone className="w-4 h-4 text-[#ff914a]" />
              <span>(21) 99006-2956</span>
            </div>
            <div className="flex items-center justify-center gap-2 max-w-xs text-center">
              <MapPin className="w-5 h-5 text-[#ff914a] shrink-0" />
              <span>Avenida B Nº 195 - rua da Feira, Nova Campinas</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-[#ff914a] text-[#381010] font-bold py-3 px-6 rounded-full shadow-lg hover:scale-105 transition-transform"
            >
              Peça seu lanche
            </button>
            <button 
              onClick={handleShare}
              className="bg-[#381010] text-[#f8ece3] p-3 rounded-full shadow-lg hover:bg-[#954e3a] transition-colors"
              aria-label="Compartilhar"
            >
              <Share2 className="w-6 h-6" />
            </button>
          </div>
        </motion.div>
      </header>

      <main className="max-w-md mx-auto px-4 mt-[-20px] relative z-10">
        {/* WhatsApp Button */}
        <a 
          href="https://wa.me/5521990062956?text=Olá, gostaria de fazer um pedido!" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold py-4 rounded-2xl shadow-md mb-8 hover:scale-[1.02] transition-transform"
        >
          <MessageCircle className="w-6 h-6" />
          Fazer Pedido pelo WhatsApp
        </a>

        {/* Menu Section */}
        <div id="menu-section" className="pt-4">
          <h2 className="text-2xl font-black text-[#381010] mb-6 flex items-center gap-2 border-b-2 border-[#954e3a] pb-2">
            {currentCategoryData?.name}
          </h2>

          {/* Render regular items */}
          {currentCategoryData?.items && currentCategoryData.items.map(item => (
            <ProductCard key={item.id} item={item} />
          ))}

          {/* Render subcategories if any */}
          {currentCategoryData?.subcategories && currentCategoryData.subcategories.map((sub, idx) => (
            <div key={idx} className="mb-8">
              <h3 className="text-lg font-bold text-[#954e3a] mb-4 bg-[#f8ece3] sticky top-20 z-20 py-2 border-l-4 border-[#ff914a] pl-3">
                {sub.name}
              </h3>
              {sub.items.map(item => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-md mx-auto px-4 py-8 text-center text-[#532120] text-xs pb-32">
        <div className="flex items-center justify-center gap-1 mb-2">
          <Info className="w-4 h-4" />
          <span>Funcionamento: Terça a Domingo das 15h às 00h</span>
        </div>
        <a href="#" className="underline hover:text-[#954e3a]">Termos e Privacidade</a>
        <p className="mt-4 opacity-60">© 2026 Glorioso Brownie. Todos os direitos reservados.</p>
      </footer>

      <BottomNav />
    </div>
  );
}
