"use client";

import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { Plus } from "lucide-react";
import { MenuItem } from "@/data/menu";

export function ProductCard({ item }: { item: MenuItem }) {
  const addItem = useCartStore(state => state.addItem);

  const handleAdd = (price: number, variant?: string) => {
    addItem({
      id: item.id,
      name: item.name,
      price: price,
      variant: variant
    });
  };

  return (
    <div className="bg-[#ffffff] rounded-2xl p-3 shadow-sm border border-[#f8ece3] mb-3">
      <div className="flex justify-between items-center gap-3">
        <div className="flex-1">
          <h3 className="text-base font-bold text-[#532120] leading-tight">{item.name}</h3>
          {item.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-snug">{item.description}</p>
          )}
        </div>
        
        {/* Product Image */}
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
              onClick={() => handleAdd(item.price!)}
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
              onClick={() => handleAdd(variant.price, variant.name)}
              className="bg-[#ff914a] text-[#381010] w-7 h-7 rounded-full flex items-center justify-center font-bold hover:scale-105 active:scale-95 transition-transform"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
