"use client";

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
    <div className="bg-[#ffffff] rounded-2xl p-4 shadow-sm border border-[#f8ece3] mb-4">
      <div className="flex justify-between items-start">
        <div className="flex-1 pr-4">
          <h3 className="text-lg font-bold text-[#532120]">{item.name}</h3>
          {item.description && (
            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {item.price !== undefined && (
          <div className="flex justify-between items-center bg-[#f8ece3] p-2 rounded-xl">
            <span className="font-bold text-[#954e3a]">R$ {item.price.toFixed(2).replace('.', ',')}</span>
            <button 
              onClick={() => handleAdd(item.price!)}
              className="bg-[#ff914a] text-[#381010] w-8 h-8 rounded-full flex items-center justify-center font-bold hover:scale-105 active:scale-95 transition-transform"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        )}

        {item.variants?.map((variant, idx) => (
          <div key={idx} className="flex justify-between items-center bg-[#f8ece3] p-2 rounded-xl">
            <div>
              <span className="text-sm font-semibold text-[#532120] block">{variant.name}</span>
              <span className="font-bold text-[#954e3a]">R$ {variant.price.toFixed(2).replace('.', ',')}</span>
            </div>
            <button 
              onClick={() => handleAdd(variant.price, variant.name)}
              className="bg-[#ff914a] text-[#381010] w-8 h-8 rounded-full flex items-center justify-center font-bold hover:scale-105 active:scale-95 transition-transform"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
