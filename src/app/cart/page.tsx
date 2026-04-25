"use client";

import { useCartStore } from "@/store/cartStore";
import { BottomNav } from "@/components/BottomNav";
import { Trash2, MessageCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const { items, removeItem, clearCart, totalPrice, totalItems } = useCartStore();

  const handleCheckout = () => {
    if (items.length === 0) return;
    
    let text = "Olá, gostaria de fazer o seguinte pedido:%0A%0A";
    items.forEach(item => {
      const itemTotal = item.price + (item.addons?.reduce((sum, a) => sum + a.price, 0) || 0);
      let itemDesc = `${item.quantity}x ${item.name}`;
      if (item.variant) itemDesc += ` (${item.variant})`;
      text += `${itemDesc} - R$ ${(itemTotal * item.quantity).toFixed(2).replace('.', ',')}%0A`;
      if (item.addons && item.addons.length > 0) {
        text += `   + Adicionais: ${item.addons.map(a => a.name).join(', ')}%0A`;
      }
    });
    text += `%0A*Total: R$ ${totalPrice().toFixed(2).replace('.', ',')}*`;
    
    window.open(`https://wa.me/5521990062956?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#f8ece3] font-sans pb-24">
      <header className="bg-[#532120] text-[#f8ece3] p-4 flex items-center shadow-md">
        <Link href="/" className="mr-4 hover:bg-[#381010] p-2 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold flex-1">Seu Carrinho</h1>
        {items.length > 0 && (
          <button onClick={clearCart} className="text-sm underline opacity-80 hover:opacity-100">
            Limpar
          </button>
        )}
      </header>

      <main className="max-w-md mx-auto px-4 pt-6">
        {items.length === 0 ? (
          <div className="text-center mt-20">
            <h2 className="text-2xl font-bold text-[#381010] mb-2">Sacola Vazia</h2>
            <p className="text-[#954e3a] mb-6">Que tal adicionar um lanche delicioso?</p>
            <Link href="/" className="bg-[#ff914a] text-[#381010] font-bold py-3 px-6 rounded-full shadow-md inline-block">
              Ver Cardápio
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const itemTotal = item.price + (item.addons?.reduce((sum, a) => sum + a.price, 0) || 0);
              return (
                <div key={item.cartItemId} className="bg-white p-4 rounded-2xl shadow-sm border border-[#532120]/10 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-[#532120]">
                      {item.quantity}x {item.name}
                    </h3>
                    {item.variant && <p className="text-sm text-gray-500">{item.variant}</p>}
                    {item.addons && item.addons.length > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        + {item.addons.map(a => a.name).join(', ')}
                      </p>
                    )}
                    <p className="text-[#954e3a] font-semibold mt-1">
                      R$ {(itemTotal * item.quantity).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                  <button 
                    onClick={() => removeItem(item.cartItemId)}
                    className="text-red-500 p-2 hover:bg-red-50 rounded-full"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              );
            })}

            <div className="mt-8 bg-[#532120] text-[#f8ece3] p-6 rounded-2xl shadow-lg">
              <div className="flex justify-between items-center mb-4 text-lg">
                <span>Total ({totalItems()} itens)</span>
                <span className="font-bold text-2xl">R$ {totalPrice().toFixed(2).replace('.', ',')}</span>
              </div>
              
              <button 
                onClick={handleCheckout}
                className="w-full bg-[#25D366] text-white font-bold py-4 rounded-xl shadow-md flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
              >
                <MessageCircle className="w-6 h-6" />
                Finalizar pelo WhatsApp
              </button>
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
