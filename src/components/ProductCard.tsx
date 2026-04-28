"use client";

import { useState } from "react";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { useStoreStatusStore } from "@/store/storeStatusStore";
import { Plus, Minus, X, Lock } from "lucide-react";
import { MenuItem } from "@/data/menu";
import { motion, AnimatePresence } from "framer-motion";

export function ProductCard({ item }: { item: MenuItem }) {
  const addItem = useCartStore(state => state.addItem);
  const items = useCartStore(state => state.items);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const removeItem = useCartStore(state => state.removeItem);
  
  const { getIsOpen } = useStoreStatusStore();
  const isOpen = getIsOpen();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Modal state
  const [selectedVariant, setSelectedVariant] = useState(item.variants?.[0]?.name || '');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);

  const totalInCart = items.filter(i => i.id === item.id).reduce((sum, i) => sum + i.quantity, 0);

  const getFastCartItem = (variantName?: string) => {
    return items.find(i => 
      i.id === item.id && 
      (i.variant || '') === (variantName || '') && 
      (!i.addons || i.addons.length === 0)
    );
  };

  const [isZooming, setIsZooming] = useState(false);

  const handleAddFast = (e: React.MouseEvent, price: number, variant?: string) => {
    e.stopPropagation();
    if (!isOpen) return;
    
    // Trigger zoom animation
    setIsZooming(true);
    setTimeout(() => setIsZooming(false), 200);

    addItem({
      id: item.id,
      name: item.name,
      price: price,
      variant: variant
    });
  };

  const handleRemoveFast = (e: React.MouseEvent, cartItemId: string, currentQty: number) => {
    e.stopPropagation();
    if (currentQty > 1) {
      updateQuantity(cartItemId, -1);
    } else {
      removeItem(cartItemId);
    }
  };

  const handleIncrementFast = (e: React.MouseEvent, cartItemId: string) => {
    e.stopPropagation();
    
    // Trigger zoom animation
    setIsZooming(true);
    setTimeout(() => setIsZooming(false), 200);

    updateQuantity(cartItemId, 1);
  };

  const renderActionButton = (price: number, variantName?: string) => {
    const cartItem = getFastCartItem(variantName);
    
    if (cartItem && cartItem.quantity > 0) {
      return (
        <div className="flex items-center gap-2 bg-[var(--color-brand-accent)] rounded-full px-1.5 py-1 shadow-sm" onClick={e => e.stopPropagation()}>
          <button 
            onClick={(e) => handleRemoveFast(e, cartItem.cartItemId, cartItem.quantity)}
            className="w-6 h-6 flex items-center justify-center text-[var(--color-brand-dark)] bg-black/10 rounded-full hover:bg-black/20 transition-colors"
          >
            <Minus className="w-3.5 h-3.5 font-bold" />
          </button>
          <motion.span 
            key={cartItem.quantity}
            initial={{ scale: 1.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
            className="text-[var(--color-brand-dark)] font-black text-xs w-3 text-center"
          >
            {cartItem.quantity}
          </motion.span>
          <button 
            onClick={(e) => handleIncrementFast(e, cartItem.cartItemId)}
            className="w-6 h-6 flex items-center justify-center text-[var(--color-brand-dark)] bg-black/10 rounded-full hover:bg-black/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 font-bold" />
          </button>
        </div>
      );
    }

    return (
      <button 
        onClick={(e) => handleAddFast(e, price, variantName)}
        disabled={!isOpen}
        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold transition-all ${
          isOpen 
            ? "bg-[var(--color-brand-accent)] text-[var(--color-brand-dark)] hover:scale-110 active:scale-90" 
            : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-50"
        }`}
      >
        {isOpen ? <Plus className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5" />}
      </button>
    );
  };

  const handleOpenModal = () => {
    setQuantity(1);
    setSelectedVariant(item.variants?.[0]?.name || '');
    setSelectedAddons([]);
    setIsModalOpen(true);
  };

  const handleAddFromModal = () => {
    if (!isOpen) return;
    
    // Trigger zoom animation
    setIsZooming(true);
    setTimeout(() => setIsZooming(false), 200);

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
      <motion.div 
        onClick={handleOpenModal}
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: "-20px" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="bg-[#ffffff] rounded-2xl p-3 shadow-sm border border-[#f8ece3] mb-3 cursor-pointer hover:shadow-md transition-all group"
      >
        <div className="flex justify-between items-center gap-3">
          <div className="flex-1">
            <h3 className="text-base font-bold text-[#532120] leading-tight">{item.name}</h3>
            {item.description && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-snug">{item.description}</p>
            )}
          </div>
          
          <div className="w-20 h-20 shrink-0 overflow-hidden relative">
            <motion.div
              animate={isZooming ? { scale: 1.15 } : { scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="w-full h-full relative"
            >
              <Image 
                src={item.imageUrl || "/glorioso brownie.png"} 
                alt={item.name}
                fill
                className="object-contain opacity-80"
                sizes="80px"
              />
            </motion.div>
            <AnimatePresence>
              {totalInCart > 0 && (
                <motion.div 
                  key="badge"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ 
                    scale: isZooming ? [1, 1.2, 1] : 1,
                    opacity: 1 
                  }}
                  transition={{ duration: 0.2 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="absolute top-1 right-1 bg-[#ff914a] text-[#381010] text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-md z-10 border-2 border-white"
                >
                  {totalInCart}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-2">
          {item.price !== undefined && item.price > 0 && (
            <div className="flex justify-between items-center bg-[#f8ece3] px-3 py-2 rounded-xl">
              <span className="font-bold text-[#954e3a] text-sm">
                R$ {item.price.toFixed(2).replace('.', ',')}
              </span>
              {renderActionButton(item.price)}
            </div>
          )}

          {item.variants?.map((variant, idx) => (
            <div key={idx} className="flex justify-between items-center bg-[#f8ece3] px-3 py-2 rounded-xl">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-[#532120] leading-tight">{variant.name}</span>
                <span className="font-bold text-[#954e3a] text-sm leading-tight">
                  R$ {variant.price.toFixed(2).replace('.', ',')}
                </span>
              </div>
              {renderActionButton(variant.price, variant.name)}
            </div>
          ))}
        </div>
      </motion.div>

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

            <div className="overflow-y-auto no-scrollbar flex-1 pb-32">
              {/* Header Image */}
              <div className="w-full h-48 sm:h-64 relative bg-[#f8ece3]">
                <Image 
                  src={item.imageUrl || "/glorioso brownie.png"} 
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
                      {item.variants.map((v, idx) => {
                        const isSelected = selectedVariant === v.name;
                        return (
                          <label 
                            key={idx} 
                            className={`flex justify-between items-center p-4 border rounded-2xl cursor-pointer transition-all duration-200 ${
                              isSelected 
                                ? 'border-[#ff914a] bg-[#f8ece3] ring-1 ring-[#ff914a]/20 shadow-sm' 
                                : 'border-gray-100 bg-white hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input 
                                type="radio" 
                                name={`variant-${item.id}`}
                                checked={isSelected}
                                onChange={() => setSelectedVariant(v.name)}
                                className="w-5 h-5 accent-[#954e3a]"
                              />
                              <span className={`font-bold ${isSelected ? 'text-[#381010]' : 'text-gray-600'}`}>{v.name}</span>
                            </div>
                            <span className="font-black text-[#954e3a]">R$ {v.price.toFixed(2).replace('.', ',')}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Addons Selection */}
                {item.addons && item.addons.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-bold text-[#381010] mb-3 bg-[#f8ece3] px-3 py-1 rounded-lg inline-block">Adicionais</h4>
                    <div className="flex flex-col gap-2">
                      {item.addons.map((a, idx) => {
                        const isSelected = selectedAddons.includes(a.name);
                        return (
                          <label 
                            key={idx} 
                            className={`flex justify-between items-center p-4 border rounded-2xl cursor-pointer transition-all duration-200 ${
                              isSelected 
                                ? 'border-[#ff914a] bg-[#f8ece3] ring-1 ring-[#ff914a]/20 shadow-sm' 
                                : 'border-gray-100 bg-white hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input 
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleAddon(a.name)}
                                className="w-5 h-5 accent-[#954e3a] rounded"
                              />
                              <span className={`font-bold ${isSelected ? 'text-[#381010]' : 'text-gray-600'}`}>{a.name}</span>
                            </div>
                            <span className="font-black text-[#954e3a]">+ R$ {a.price.toFixed(2).replace('.', ',')}</span>
                          </label>
                        );
                      })}
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
                <motion.span 
                  key={quantity}
                  initial={{ scale: 1.4 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  className="w-4 text-center font-bold text-[#381010]"
                >
                  {quantity}
                </motion.span>
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
                disabled={!isOpen}
                className={`flex-1 font-black py-4 rounded-2xl flex justify-between items-center px-5 shadow-md transition-all ${
                  isOpen 
                    ? "bg-[#ff914a] text-[#381010] hover:scale-[1.02] active:scale-95" 
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                <span>{isOpen ? "Adicionar" : "Loja Fechada"}</span>
                <motion.span
                  key={totalModalPrice}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                >
                  R$ {totalModalPrice.toFixed(2).replace('.', ',')}
                </motion.span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
