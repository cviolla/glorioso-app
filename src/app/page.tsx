"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Phone, MapPin, Share2, Search, Info } from "lucide-react";
import { StoreStatus } from "@/components/StoreStatus";
import { BottomNav } from "@/components/BottomNav";
import { Sidebar } from "@/components/Sidebar";
import { ProductCard } from "@/components/ProductCard";
import { menuData, MenuItem } from "@/data/menu";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string>(menuData[0].id);
  const [searchQuery, setSearchQuery] = useState("");

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

  // Flatten all items for search
  const allItems = menuData.flatMap(category => {
    let items: MenuItem[] = [];
    if (category.items) items = [...items, ...category.items];
    if (category.subcategories) {
      category.subcategories.forEach(sub => {
        items = [...items, ...sub.items];
      });
    }
    return items;
  });

  const filteredItems = searchQuery 
    ? allItems.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen bg-[#f8ece3] font-sans pb-24">
      <Sidebar onSelectCategory={(id) => {
        setActiveCategory(id);
        setSearchQuery(""); // Clear search when navigating from sidebar
      }} />

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
            <div className="flex items-center justify-center gap-1 w-full px-2">
              <MapPin className="w-4 h-4 text-[#ff914a] shrink-0" />
              <span className="truncate text-xs sm:text-sm">Avenida B Nº 195 - R. da Feira, Nova Campinas</span>
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
        
        {/* Search Bar */}
        <div className="relative mb-8 shadow-md rounded-2xl overflow-hidden bg-white border-2 border-transparent focus-within:border-[#ff914a] transition-colors">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#532120]/50 w-6 h-6" />
          <input 
            type="text"
            placeholder="Buscar lanches, pizzas, bebidas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-4 pl-14 pr-4 bg-transparent outline-none text-[#381010] placeholder:text-[#532120]/50 font-medium"
          />
        </div>

        {/* Dynamic Section (Search vs Category) */}
        {searchQuery ? (
          <div id="menu-section" className="pt-2">
            <h2 className="text-xl font-black text-[#381010] mb-6 flex items-center gap-2 border-b-2 border-[#954e3a] pb-2">
              Resultados para "{searchQuery}"
            </h2>

            {filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <ProductCard key={item.id} item={item} />
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-[#954e3a] font-medium">Nenhum produto encontrado.</p>
              </div>
            )}
          </div>
        ) : (
          <div id="menu-section" className="pt-2">
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
        )}
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
