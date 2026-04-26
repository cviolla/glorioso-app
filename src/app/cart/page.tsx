"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { ArrowLeft, ArrowRight, Trash2, Plus, Minus, MapPin, CreditCard, Motorbike, Store, User, Phone } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

type CheckoutStep = 'cart' | 'address' | 'summary';
type DeliveryType = 'delivery' | 'pickup' | null;

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCartStore();
  const [step, setStep] = useState<CheckoutStep>('cart');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>(null);

  const [userInfo, setUserInfo] = useState({ name: '', phone: '' });
  const [address, setAddress] = useState({ street: '', number: '', neighborhood: 'Nova Campinas (R$ 5,00)', complement: '', reference: '' });
  const [paymentInfo, setPaymentInfo] = useState({ observation: '', paymentMethod: 'PIX', orderTime: 'Para agora', coupon: '' });

  const isCartEmpty = items.length === 0;
  const deliveryFee = deliveryType === 'delivery' ? 5 : 0;
  const finalTotal = totalPrice() + deliveryFee;

  const handleCheckoutSubmit = () => {
    if (items.length === 0) return;
    
    let text = `Olá, gostaria de fazer um pedido para *${deliveryType === 'pickup' ? 'Retirada' : 'Delivery'}*:%0A%0A`;
    
    items.forEach(item => {
      const itemTotal = item.price + (item.addons?.reduce((sum, a) => sum + a.price, 0) || 0);
      let itemDesc = `*${item.quantity}x ${item.name}*`;
      if (item.variant) itemDesc += ` (${item.variant})`;
      text += `${itemDesc} - R$ ${(itemTotal * item.quantity).toFixed(2).replace('.', ',')}%0A`;
      if (item.addons && item.addons.length > 0) {
        text += `   + Adicionais: ${item.addons.map(a => a.name).join(', ')}%0A`;
      }
    });
    
    text += `%0A*Subtotal:* R$ ${totalPrice().toFixed(2).replace('.', ',')}`;
    if (deliveryType === 'delivery') {
      text += `%0A*Taxa de entrega:* R$ ${deliveryFee.toFixed(2).replace('.', ',')}`;
    }
    text += `%0A*Total: R$ ${finalTotal.toFixed(2).replace('.', ',')}*%0A`;
    text += `%0A👤 *Cliente:* ${userInfo.name || 'Não informado'} | ${userInfo.phone || 'Não informado'}`;
    
    if (deliveryType === 'delivery') {
      text += `%0A📍 *Endereço:* ${address.street}, ${address.number} - ${address.neighborhood}`;
      if (address.complement) text += ` (${address.complement})`;
      if (address.reference) text += `%0ARef: ${address.reference}`;
    }

    text += `%0A💳 *Pagamento:* ${paymentInfo.paymentMethod}`;
    text += `%0A🕒 *Tempo:* ${paymentInfo.orderTime}`;
    if (paymentInfo.observation) {
      text += `%0A📝 *Observação:* ${paymentInfo.observation}`;
    }
    
    window.open(`https://wa.me/5521990062956?text=${text}`, '_blank');
  };

  const handleBack = () => {
    if (step === 'summary') {
      setStep(deliveryType === 'delivery' ? 'address' : 'cart');
    } else if (step === 'address') {
      setStep('cart');
    }
  };

  return (
    <div className={`min-h-screen font-sans pb-32 ${step === 'cart' ? 'bg-[#1a0808] text-[#f8ece3]' : 'bg-[#f8ece3] text-[#381010]'}`}>
      <header className={`p-5 flex items-center justify-between border-b sticky top-0 z-40 backdrop-blur-md ${step === 'cart' ? 'border-white/5 bg-[#1a0808]/95' : 'border-[#532120]/10 bg-[#f8ece3]/95'}`}>
        <div className="flex items-center gap-3">
          {step === 'cart' ? (
            <Link href="/" className="hover:bg-white/10 p-2 -ml-2 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          ) : (
            <button onClick={handleBack} className="hover:bg-[#532120]/10 p-2 -ml-2 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <span className="font-bold text-lg">
            {step === 'cart' ? 'Sacola' : step === 'address' ? 'Endereço de entrega' : 'Resumo e Pagamento'}
          </span>
        </div>
        {step === 'cart' && (
          <div className="text-right flex flex-col">
            <span className="text-xs opacity-60">Subtotal</span>
            <span className="font-bold">R$ {totalPrice().toFixed(2).replace('.', ',')}</span>
          </div>
        )}
      </header>

      <main className="max-w-3xl mx-auto p-4 sm:p-6">
        <AnimatePresence mode="wait">
          {step === 'cart' && (
            <motion.div key="cart" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {isCartEmpty ? (
                <div className="text-center mt-20">
                  <h2 className="text-2xl font-bold mb-2 text-[#ff914a]">Sua sacola está vazia</h2>
                  <p className="text-white/60 mb-8">Deseja adicionar algo delicioso?</p>
                  <Link href="/menu" className="bg-[#ff914a] text-[#381010] font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 transition-transform inline-block">
                    Ver Cardápio
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => {
                    const itemTotal = item.price + (item.addons?.reduce((sum, a) => sum + a.price, 0) || 0);
                    return (
                      <div key={item.cartItemId} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="w-16 h-16 bg-[#381010] rounded-xl flex items-center justify-center shrink-0 border border-[#ff914a]/30 overflow-hidden relative">
                           <Image src="/GloriosoBrownie_Logo_fuul.png" alt="Logo" fill className="object-cover opacity-50" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-[15px] leading-tight mb-1">{item.name}</h3>
                          {item.variant && <p className="text-xs text-white/50">{item.variant}</p>}
                          {item.addons && item.addons.length > 0 && <p className="text-xs text-[#ff914a]/80 mt-0.5">+ {item.addons.map(a => a.name).join(', ')}</p>}
                          <p className="font-bold mt-2 text-[#ff914a]">R$ {itemTotal.toFixed(2).replace('.', ',')}</p>
                        </div>
                        <div className="flex flex-col items-end justify-between">
                          <button onClick={() => removeItem(item.cartItemId)} className="p-2 text-white/40 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                          <div className="flex items-center gap-3 bg-white/10 rounded-full px-2 py-1">
                            <button onClick={() => updateQuantity(item.cartItemId, -1)} className="p-1 text-[#ff914a] hover:bg-white/10 rounded-full"><Minus className="w-4 h-4" /></button>
                            <span className="font-semibold text-sm w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.cartItemId, 1)} className="p-1 text-[#ff914a] hover:bg-white/10 rounded-full"><Plus className="w-4 h-4" /></button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {step === 'address' && (
            <motion.div key="address" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
              {/* User Info Section */}
              <div>
                <h3 className="font-bold text-[#381010] text-lg mb-4">Minhas informações</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-[#381010] mb-1 block">Nome completo</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                      <input 
                        type="text" placeholder="Ex: João da Silva" 
                        className="w-full border border-gray-300 rounded-xl py-3 pl-10 pr-3 outline-none focus:border-[#ff914a] focus:ring-1 focus:ring-[#ff914a] text-[#381010] bg-white text-[16px] transition-all" 
                        value={userInfo.name} onChange={e => setUserInfo({...userInfo, name: e.target.value})} 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-[#381010] mb-1 block">WhatsApp</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="w-5 h-5 text-gray-400" />
                      </div>
                      <input 
                        type="tel" placeholder="Ex: (21) 99999-9999" 
                        className="w-full border border-gray-300 rounded-xl py-3 pl-10 pr-3 outline-none focus:border-[#ff914a] focus:ring-1 focus:ring-[#ff914a] text-[#381010] bg-white text-[16px] transition-all" 
                        value={userInfo.phone} onChange={e => setUserInfo({...userInfo, phone: e.target.value})} 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div>
                <h3 className="font-bold text-[#381010] text-lg mb-4">Endereço de entrega</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-[#381010] mb-1 block">Rua/Avenida</label>
                    <input type="text" placeholder="Ex: Avenida das Américas" className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-[#ff914a] focus:ring-1 focus:ring-[#ff914a] text-[#381010] bg-white text-[16px] transition-all" value={address.street} onChange={e => setAddress({...address, street: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-bold text-[#381010] mb-1 block">Número</label>
                      <input type="text" placeholder="Ex: 1000" className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-[#ff914a] focus:ring-1 focus:ring-[#ff914a] text-[#381010] bg-white text-[16px] transition-all" value={address.number} onChange={e => setAddress({...address, number: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-sm font-bold text-[#381010] mb-1 block">Complemento</label>
                      <input type="text" placeholder="Apto 201" className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-[#ff914a] focus:ring-1 focus:ring-[#ff914a] text-[#381010] bg-white text-[16px] transition-all" value={address.complement} onChange={e => setAddress({...address, complement: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-[#381010] mb-1 block">Bairro</label>
                    <select className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-[#ff914a] focus:ring-1 focus:ring-[#ff914a] text-[#381010] bg-white text-[16px] transition-all" value={address.neighborhood} onChange={e => setAddress({...address, neighborhood: e.target.value})}>
                      <option>Nova Campinas (R$ 5,00)</option>
                      <option>Centro (R$ 7,00)</option>
                      <option>Outros (A combinar)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-[#381010] mb-1 block">Referência <span className="text-gray-400 font-normal">(opcional)</span></label>
                    <input type="text" placeholder="Próximo a..." className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-[#ff914a] focus:ring-1 focus:ring-[#ff914a] text-[#381010] bg-white text-[16px] transition-all" value={address.reference} onChange={e => setAddress({...address, reference: e.target.value})} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'summary' && (
            <motion.div key="summary" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
              <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#381010]">Resumo da conta</p>
                  <p className="text-sm text-gray-600">{totalItems()} produto(s) <span className="font-bold text-[#ff914a] ml-2">R$ {finalTotal.toFixed(2).replace('.', ',')}</span></p>
                </div>
                <button onClick={() => setStep('cart')} className="text-sm text-[#0066FF] font-medium hover:underline">Editar</button>
              </div>
              <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-[#381010]">Minhas informações</p>
                  <button onClick={() => setStep('address')} className="text-sm text-[#0066FF] font-medium hover:underline">Editar</button>
                </div>
                <p className="text-sm text-gray-600">{userInfo.name} • {userInfo.phone}</p>
                {deliveryType === 'delivery' && address.street && (
                  <div className="mt-2 pt-2 border-t border-gray-100 flex gap-2">
                    <MapPin className="w-4 h-4 text-[#ff914a] shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-600">{address.street}, {address.number} - {address.neighborhood}</p>
                  </div>
                )}
              </div>
              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-sm font-bold text-[#381010] mb-1 block">Tipo de pedido</label>
                  <select className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-[#ff914a] focus:ring-1 focus:ring-[#ff914a] text-[#381010] bg-white text-[16px] transition-all" value={paymentInfo.orderTime} onChange={e => setPaymentInfo({...paymentInfo, orderTime: e.target.value})}><option>Para agora</option><option>Agendar para mais tarde</option></select>
                </div>
                <div>
                  <label className="text-sm font-bold text-[#381010] mb-1 block">Observações do pedido</label>
                  <textarea placeholder="Ex: Tirar cebola, enviar bastante calda..." className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-[#ff914a] focus:ring-1 focus:ring-[#ff914a] text-[#381010] bg-white h-24 resize-none text-[16px] transition-all" value={paymentInfo.observation} onChange={e => setPaymentInfo({...paymentInfo, observation: e.target.value})} />
                </div>
                <div className="border border-gray-300 rounded-xl p-4 bg-white/50">
                  <label className="text-sm font-bold text-[#381010] flex gap-2 items-center mb-2"><CreditCard className="w-4 h-4" /> Forma de pagamento</label>
                  <select className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-[#ff914a] focus:ring-1 focus:ring-[#ff914a] text-[#381010] bg-white text-[16px] transition-all" value={paymentInfo.paymentMethod} onChange={e => setPaymentInfo({...paymentInfo, paymentMethod: e.target.value})}><option>PIX</option><option>Cartão de Crédito</option><option>Cartão de Débito</option><option>Dinheiro (Levar troco)</option></select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {!isCartEmpty && (
        <div className={`fixed bottom-0 inset-x-0 border-t p-4 pb-6 z-30 transition-colors duration-300 ${step === 'cart' ? 'bg-[#1a0808] border-white/10' : 'bg-[#f8ece3] border-[#532120]/10 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]'}`}>
          <div className="max-w-3xl mx-auto">
            {step === 'cart' && (
              <>
                <p className="text-center text-sm font-medium mb-4 text-white/80">Selecione o tipo de serviço:</p>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => { setDeliveryType('pickup'); setStep('summary'); }} className="bg-[#ff914a] text-[#381010] flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold hover:bg-[#ff9f61]"><Store className="w-5 h-5" /> Retirada</button>
                  <button onClick={() => { setDeliveryType('delivery'); setStep('address'); }} className="bg-[#ff914a] text-[#381010] flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold hover:bg-[#ff9f61]"><Motorbike className="w-5 h-5" /> Delivery</button>
                </div>
              </>
            )}
            {step === 'address' && (
              <button onClick={() => setStep('summary')} className="w-full bg-[#ff914a] text-[#381010] font-bold py-4 rounded-xl shadow-md" disabled={!userInfo.name || !userInfo.phone || !address.street || !address.number || !address.complement}>Continuar</button>
            )}
            {step === 'summary' && (
              <button onClick={handleCheckoutSubmit} className="w-full bg-[#ff914a] text-[#381010] font-bold py-4 rounded-xl shadow-md flex items-center justify-center gap-2">Enviar via WhatsApp <ArrowRight className="w-5 h-5" /></button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
