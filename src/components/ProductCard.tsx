"use client";

import { useState } from "react";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { Plus, Minus, X } from "lucide-react";
import { MenuItem } from "@/data/menu";

export function ProductCard({ item }: { item: MenuItem }) {
  const addItem = useCartStore(state => state.addItem);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Modal state
  const [selectedVariant, setSelectedVariant] = useState(item.variants?.[0]?.name || '');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);

  const handleAddFast = (e: React.MouseEvent, price: number, variant?: string) => {
    e.stopPropagation();
    addItem({
      id: item.id,
      name: item.name,
      price: price,
      variant: variant
    });
  };

  const handleOpenModal = () => {
    setQuantity(1);
    setSelectedVariant(item.variants?.[0]?.name || '');
    setSelectedAddons([]);
    setIsModalOpen(true);
  };

  const handleAddFromModal = () => {
    let basePrice = item.price || 0;
    if (item.variants) {
      const v = item.variants.find(v => v.name === selectedVariant);
      if (v) basePrice = v.price;
    }
    
    const addonsToAdd = item.addons?.filter(a => selectedAddons.includes(a.name)) || [];

    for(let i = 0; i < quantity; i++) {
      addItem({
        id: item.id,
        name: item.name,
        price: basePrice,
        variant: selectedVariant || undefined,
        addons: addonsToAdd
      });
    }
    setIsModalOpen(false);
  };

  const toggleAddon = (addonName: string) => {
    setSelectedAddons(prev => 
      prev.includes(addonName) ? prev.filter(n => n !== addonName) : [...prev, addonName]
    );
  };

  // Calculate dynamic price for modal
  let currentModalPrice = item.price || 0;
  if (item.variants) {
    const v = item.variants.find(v => v.name === selectedVariant);
    if (v) currentModalPrice = v.price;
  }
  const addonsPrice = item.addons?.filter(a => selectedAddons.includes(a.name)).reduce((sum, a) => sum + a.price, 0) || 0;
  const totalModalPrice = (currentModalPrice + addonsPrice) * quantity;

  return (
    <>
      {/* Product Card */}
      <div 
        onClick={handleOpenModal}
        className="bg-[#ffffff] rounded-2xl p-3 shadow-sm border border-[#f8ece3] mb-3 cursor-pointer hover:shadow-md transition-shadow"
      >
        <div className="flex justify-between items-center gap-3">
          <div className="flex-1">
            <h3 className="text-base font-bold text-[#532120] leading-tight">{item.name}</h3>
            {item.description && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-snug">{item.description}</p>
            )}
          </div>
          
          <div className="w-20 h-20 shrink-0 bg-[#f8ece3] rounded-xl overflow-hidden relative border border-[#ff914a]/30 shadow-inner">
            <Image 
              src={item.imageUrl || "/GloriosoBrownie_Logo_fuul.png"} 
              alt={item.name}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-2">
          {item.price !== undefined && (
            <div className="flex justify-between items-center bg-[#f8ece3] px-3 py-2 rounded-xl">
              <span className="font-bold text-[#954e3a] text-sm">R$ {item.price.toFixed(2).replace('.', ',')}</span>
              <button 
                onClick={(e) => handleAddFast(e, item.price!)}
                className="bg-[#ff914a] text-[#381010] w-7 h-7 rounded-full flex items-center justify-center font-bold hover:scale-105 active:scale-95 transition-transform"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}

          {item.variants?.map((variant, idx) => (
            <div key={idx} className="flex justify-between items-center bg-[#f8ece3] px-3 py-2 rounded-xl">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-[#532120] leading-tight">{variant.name}</span>
                <span className="font-bold text-[#954e3a] text-sm leading-tight">R$ {variant.price.toFixed(2).replace('.', ',')}</span>
              </div>
              <button 
                onClick={(e) => handleAddFast(e, variant.price, variant.name)}
                className="bg-[#ff914a] text-[#381010] w-7 h-7 rounded-full flex items-center justify-center font-bold hover:scale-105 active:scale-95 transition-transform"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Product Details Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
          {/* Click to close area */}
          <div className="absolute inset-0" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
            {/* Close button */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-md p-2 rounded-full text-[#381010] shadow-md"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="overflow-y-auto no-scrollbar flex-1 pb-24">
              {/* Header Image */}
              <div className="w-full h-48 sm:h-64 relative bg-[#f8ece3]">
                <Image 
                  src={item.imageUrl || "/GloriosoBrownie_Logo_fuul.png"} 
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-5">
                <h2 className="text-2xl font-black text-[#532120]">{item.name}</h2>
                {item.description && (
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">{item.description}</p>
                )}

                {/* Variants Selection */}
                {item.variants && item.variants.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-bold text-[#381010] mb-3 bg-[#f8ece3] px-3 py-1 rounded-lg inline-block">Opções</h4>
                    <div className="flex flex-col gap-2">
                      {item.variants.map((v, idx) => (
                        <label key={idx} className="flex justify-between items-center p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-[#f8ece3]/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <input 
                              type="radio" 
                              name={`variant-${item.id}`}
                              checked={selectedVariant === v.name}
                              onChange={() => setSelectedVariant(v.name)}
                              className="w-5 h-5 accent-[#954e3a]"
                            />
                            <span className="font-semibold text-[#532120]">{v.name}</span>
                          </div>
                          <span className="font-bold text-[#954e3a]">R$ {v.price.toFixed(2).replace('.', ',')}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Addons Selection */}
                {item.addons && item.addons.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-bold text-[#381010] mb-3 bg-[#f8ece3] px-3 py-1 rounded-lg inline-block">Adicionais</h4>
                    <div className="flex flex-col gap-2">
                      {item.addons.map((a, idx) => (
                        <label key={idx} className="flex justify-between items-center p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-[#f8ece3]/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <input 
                              type="checkbox"
                              checked={selectedAddons.includes(a.name)}
                              onChange={() => toggleAddon(a.name)}
                              className="w-5 h-5 accent-[#954e3a] rounded"
                            />
                            <span className="font-semibold text-[#532120]">{a.name}</span>
                          </div>
                          <span className="font-bold text-[#954e3a]">+ R$ {a.price.toFixed(2).replace('.', ',')}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 flex gap-4 items-center shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
              {/* Quantity */}
              <div className="flex items-center gap-3 bg-[#f8ece3] rounded-2xl p-2 border border-[#532120]/10">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-8 h-8 flex items-center justify-center text-[#532120] bg-white rounded-xl shadow-sm disabled:opacity-50"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4 font-bold" />
                </button>
                <span className="w-4 text-center font-bold text-[#381010]">{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-8 h-8 flex items-center justify-center text-[#532120] bg-white rounded-xl shadow-sm"
                >
                  <Plus className="w-4 h-4 font-bold" />
                </button>
              </div>

              {/* Add Button */}
              <button 
                onClick={handleAddFromModal}
                className="flex-1 bg-[#ff914a] text-[#381010] font-black py-4 rounded-2xl flex justify-between items-center px-5 shadow-md hover:scale-[1.02] active:scale-95 transition-all"
              >
                <span>Adicionar</span>
                <span>R$ {totalModalPrice.toFixed(2).replace('.', ',')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
