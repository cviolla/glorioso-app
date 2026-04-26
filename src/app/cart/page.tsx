"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import { ArrowLeft, ArrowRight, Trash2, Plus, Minus, MapPin, CreditCard, ChevronRight, X, Motorbike, Store, User, Phone, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

type CheckoutStep = 'cart' | 'address' | 'summary';
type DeliveryType = 'delivery' | 'pickup' | null;

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice, totalItems } = useCartStore();
  const [step, setStep] = useState<CheckoutStep>('cart');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>(null);

  // Form states
  const [userInfo, setUserInfo] = useState({ name: '', phone: '' });
  const [address, setAddress] = useState({ street: '', number: '', neighborhood: 'Nova Campinas (R$ 5,00)', complement: '', reference: '' });
  const [paymentInfo, setPaymentInfo] = useState({ observation: '', paymentMethod: 'PIX', orderTime: 'Para agora', coupon: '' });

  const isCartEmpty = items.length === 0;
  
  // Calculate final total (including static delivery fee for now)
  const deliveryFee = deliveryType === 'delivery' ? 5 : 0;
  const finalTotal = totalPrice() + deliveryFee;

  const handleCheckoutSubmit = () => {
    if (items.length === 0) return;
    
    let text = `Olá, gostaria de fazer um pedido para *${deliveryType === 'pickup' ? 'Retirada' : 'Delivery'}*:%0A%0A`;
    
    // Items
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
    
    // Customer Info
    text += `%0A👤 *Cliente:* ${userInfo.name || 'Não informado'} | ${userInfo.phone || 'Não informado'}`;
    
    // Address (if delivery)
    if (deliveryType === 'delivery') {
      text += `%0A📍 *Endereço:* ${address.street}, ${address.number} - ${address.neighborhood}`;
      if (address.complement) text += ` (${address.complement})`;
      if (address.reference) text += `%0ARef: ${address.reference}`;
    }

    // Payment and obs
    text += `%0A💳 *Pagamento:* ${paymentInfo.paymentMethod}`;
    text += `%0A🕒 *Tempo:* ${paymentInfo.orderTime}`;
    if (paymentInfo.observation) {
      text += `%0A📝 *Observação:* ${paymentInfo.observation}`;
    }
    
    window.open(`https://wa.me/5521990062956?text=${text}`, '_blank');
  };

  const DrawerOverlay = ({ isOpen, onClose, children, title }: { isOpen: boolean, onClose: () => void, children: React.ReactNode, title: string }) => {
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
      } else {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.height = '';
      }
      return () => { 
        document.body.style.overflow = ''; 
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.height = '';
      };
    }, [isOpen]);

    return (
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden" style={{ touchAction: 'none' }}>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/60"
            />
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="absolute top-12 inset-x-0 bottom-0 w-full max-w-3xl mx-auto bg-[#f8ece3] rounded-t-3xl flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)] overflow-hidden"
              style={{ touchAction: 'auto' }}
            >
              <div className="flex items-center justify-between p-5 border-b border-[#532120]/10 shrink-0 bg-[#f8ece3] relative z-10">
                <div className="flex items-center gap-3">
                  <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-[#532120]/10 text-[#381010]">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-lg font-bold text-[#381010]">{title}</h2>
                </div>
              </div>
              <div className="overflow-y-auto flex-1 p-5 pb-32 relative">
                {children}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <div className="min-h-screen bg-[#1a0808] font-sans pb-32 text-[#f8ece3]">
      {/* HEADER */}
      <header className="p-5 flex items-center justify-between border-b border-white/5 sticky top-0 bg-[#1a0808]/95 backdrop-blur-md z-40">
        <div className="flex items-center gap-3">
          <Link href="/" className="hover:bg-white/10 p-2 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-medium text-lg">Voltar</span>
        </div>
        <div className="text-right flex flex-col">
          <span className="text-xs text-white/60">Sua sacola</span>
          <span className="font-bold text-xl">R$ {totalPrice().toFixed(2).replace('.', ',')}</span>
        </div>
      </header>

      {/* MAIN CART CONTENT */}
      <main className="max-w-3xl mx-auto p-4 sm:p-6">
        {isCartEmpty ? (
          <div className="text-center mt-20">
            <h2 className="text-2xl font-bold mb-2 text-[#ff914a]">Sua sacola está vazia</h2>
            <p className="text-white/60 mb-8">Deseja adicionar algo delicioso?</p>
            <Link href="/menu" className="bg-[#ff914a] text-[#381010] font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 transition-transform inline-block">
              Ver Cardápio
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              {items.map((item) => {
                const itemTotal = item.price + (item.addons?.reduce((sum, a) => sum + a.price, 0) || 0);
                return (
                  <div key={item.cartItemId} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                    {/* Placeholder for product image if exists later */}
                    <div className="w-16 h-16 bg-[#381010] rounded-xl flex items-center justify-center shrink-0 border border-[#ff914a]/30 overflow-hidden relative">
                       <Image src="/GloriosoBrownie_Logo_fuul.png" alt="Logo" fill className="object-cover opacity-50" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-[15px] leading-tight mb-1">
                        {item.name}
                      </h3>
                      {item.variant && <p className="text-xs text-white/50">{item.variant}</p>}
                      {item.addons && item.addons.length > 0 && (
                        <p className="text-xs text-[#ff914a]/80 mt-0.5">
                          + {item.addons.map(a => a.name).join(', ')}
                        </p>
                      )}
                      <p className="font-bold mt-2 text-[#ff914a]">
                        R$ {itemTotal.toFixed(2).replace('.', ',')}
                      </p>
                    </div>

                    <div className="flex flex-col items-end justify-between">
                      <button onClick={() => removeItem(item.cartItemId)} className="p-2 text-white/40 hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      <div className="flex items-center gap-3 bg-white/10 rounded-full px-2 py-1">
                        <button onClick={() => updateQuantity(item.cartItemId, -1)} className="p-1 text-[#ff914a] hover:bg-white/10 rounded-full">
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-semibold text-sm w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.cartItemId, 1)} className="p-1 text-[#ff914a] hover:bg-white/10 rounded-full">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* BOTTOM ACTION BAR (Service Selection) */}
      {!isCartEmpty && (
        <div className="fixed bottom-0 inset-x-0 bg-[#1a0808] border-t border-white/10 p-4 pb-6 z-30">
          <div className="max-w-3xl mx-auto">
            <p className="text-center text-sm font-medium mb-4 text-white/80">Selecione o tipo de serviço:</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button 
                onClick={() => { setDeliveryType('pickup'); setStep('summary'); }}
                className="bg-[#ff914a] text-[#381010] flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold hover:bg-[#ff9f61] transition-colors"
              >
                <Store className="w-5 h-5" /> Retirada
              </button>
              <button 
                onClick={() => { setDeliveryType('delivery'); setStep('address'); }}
                className="bg-[#ff914a] text-[#381010] flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold hover:bg-[#ff9f61] transition-colors"
              >
                <Motorbike className="w-5 h-5" /> Delivery
              </button>
            </div>
            <p className="text-center text-[10px] text-white/40">
              Ao clicar em um serviço, você aceita os <span className="underline">TERMOS</span> e a <span className="underline">PRIVACIDADE</span>.
            </p>
          </div>
        </div>
      )}

      {/* MODAL 1: ADDRESS & USER INFO */}
      <DrawerOverlay isOpen={step === 'address'} onClose={() => setStep('cart')} title="Adicione seu endereço">
        <div className="space-y-6">
          {/* User Info Section */}
          <div>
            <h3 className="font-bold text-[#381010] text-lg mb-4 flex items-center justify-between">
              Minhas informações
            </h3>
            <div className="space-y-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 text-gray-700">
                <User className="w-5 h-5 text-[#ff914a]" />
                <input 
                  type="text" placeholder="Seu nome completo" 
                  className="flex-1 bg-transparent outline-none border-b border-gray-200 pb-1 focus:border-[#ff914a] text-[16px]"
                  value={userInfo.name} onChange={e => setUserInfo({...userInfo, name: e.target.value})}
                />
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Phone className="w-5 h-5 text-[#ff914a]" />
                <input 
                  type="tel" placeholder="Seu WhatsApp (ex: 21 99999-9999)" 
                  className="flex-1 bg-transparent outline-none border-b border-gray-200 pb-1 focus:border-[#ff914a] text-[16px]"
                  value={userInfo.phone} onChange={e => setUserInfo({...userInfo, phone: e.target.value})}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                🔒 Por motivos de segurança, não compartilhamos seus dados.
              </p>
            </div>
          </div>

          {/* Address Section */}
          <div>
            <h3 className="font-bold text-[#381010] text-lg mb-4">Endereço de entrega</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-[#381010] mb-1 block">Rua/Avenida</label>
                <input 
                  type="text" placeholder="Ex: Avenida A" 
                  className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-[#ff914a] focus:ring-1 focus:ring-[#ff914a] text-gray-800 text-[16px]"
                  value={address.street} onChange={e => setAddress({...address, street: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-bold text-[#381010] mb-1 block">Número</label>
                <input 
                  type="text" placeholder="Ex: 71" 
                  className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-[#ff914a] focus:ring-1 focus:ring-[#ff914a] text-gray-800 text-[16px]"
                  value={address.number} onChange={e => setAddress({...address, number: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-bold text-[#381010] mb-1 block">Bairro</label>
                <select 
                  className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-[#ff914a] focus:ring-1 focus:ring-[#ff914a] text-gray-800 bg-white text-[16px]"
                  value={address.neighborhood} onChange={e => setAddress({...address, neighborhood: e.target.value})}
                >
                  <option>Nova Campinas (R$ 5,00)</option>
                  <option>Centro (R$ 7,00)</option>
                  <option>Outros (A combinar)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-[#381010] mb-1 block">Complemento (Obrigatório)</label>
                <input 
                  type="text" placeholder="Ex: Casa 1, Apto 202" 
                  className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-[#ff914a] focus:ring-1 focus:ring-[#ff914a] text-gray-800 text-[16px]"
                  value={address.complement} onChange={e => setAddress({...address, complement: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-bold text-[#381010] mb-1 block">Referência <span className="text-gray-400 font-normal">(opcional)</span></label>
                <input 
                  type="text" placeholder="Ex: Portão branco" 
                  className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-[#ff914a] focus:ring-1 focus:ring-[#ff914a] text-gray-800 text-[16px]"
                  value={address.reference} onChange={e => setAddress({...address, reference: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 inset-x-0 p-4 bg-[#f8ece3] border-t border-[#532120]/10 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
          <button 
            onClick={() => {
              if (userInfo.name && userInfo.phone && address.street && address.number && address.complement) {
                setStep('summary');
              } else {
                alert("Por favor, preencha os campos obrigatórios.");
              }
            }}
            className="w-full bg-[#ff914a] text-[#381010] font-bold py-4 rounded-xl shadow-md disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
            disabled={!userInfo.name || !userInfo.phone || !address.street || !address.number || !address.complement}
          >
            Confirme o endereço
          </button>
        </div>
      </DrawerOverlay>

      {/* MODAL 2: ORDER SUMMARY & PAYMENT */}
      <DrawerOverlay isOpen={step === 'summary'} onClose={() => deliveryType === 'delivery' ? setStep('address') : setStep('cart')} title={deliveryType === 'delivery' ? "Delivery" : "Retirada"}>
        <div className="space-y-6 pb-20">
          
          {/* Order Summary Dropdown-like */}
          <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm flex items-center justify-between">
            <div>
              <p className="font-bold text-[#381010]">Resumo da conta</p>
              <p className="text-sm text-gray-600">{totalItems()} produto(s) <span className="font-bold text-[#ff914a] ml-2">R$ {finalTotal.toFixed(2).replace('.', ',')}</span></p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>

          {/* User Info Dropdown-like */}
          <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between">
               <p className="font-bold text-[#381010]">Minhas informações</p>
               <ChevronRight className="w-5 h-5 text-gray-400 rotate-90" />
            </div>
            {userInfo.name ? (
              <p className="text-sm text-gray-600">{userInfo.name} • {userInfo.phone}</p>
            ) : (
              <p className="text-sm text-red-500 font-medium">Informações pendentes</p>
            )}
            {deliveryType === 'delivery' && address.street && (
              <div className="mt-2 pt-2 border-t border-gray-100 flex gap-2">
                <MapPin className="w-4 h-4 text-[#ff914a] shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600">{address.street}, {address.number} - {address.neighborhood}</p>
              </div>
            )}
          </div>

          {/* Order Preferences */}
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Tipo de pedido</label>
              <select 
                className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-[#ff914a] text-[#381010] font-medium bg-white text-[16px]"
                value={paymentInfo.orderTime} onChange={e => setPaymentInfo({...paymentInfo, orderTime: e.target.value})}
              >
                <option>Para agora</option>
                <option>Agendar para mais tarde</option>
              </select>
            </div>

            <div>
              <textarea 
                placeholder="Por gentileza, enviar bastante calda..." 
                className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-[#ff914a] text-gray-800 h-24 resize-none text-[16px]"
                value={paymentInfo.observation} onChange={e => setPaymentInfo({...paymentInfo, observation: e.target.value})}
              />
            </div>

            {/* Coupon */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-bold text-[#381010]">Cupom</label>
                <button className="text-sm text-[#0066FF] font-medium hover:underline">Ver detalhes</button>
              </div>
              <input 
                type="text" placeholder="Inserir cupom" 
                className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-[#ff914a] text-gray-800 text-[16px]"
                value={paymentInfo.coupon} onChange={e => setPaymentInfo({...paymentInfo, coupon: e.target.value})}
              />
            </div>

            {/* Payment Method */}
            <div className="border border-gray-300 rounded-xl p-4 bg-white/50">
              <label className="text-sm font-bold text-[#381010] flex gap-2 items-center mb-2">
                <CreditCard className="w-4 h-4" /> Forma de pagamento
                <span className="text-[10px] text-gray-500 font-normal ml-auto">O pagamento é coordenado posteriormente</span>
              </label>
              <select 
                className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-[#ff914a] text-[#381010] font-medium bg-white text-[16px]"
                value={paymentInfo.paymentMethod} onChange={e => setPaymentInfo({...paymentInfo, paymentMethod: e.target.value})}
              >
                <option>PIX</option>
                <option>Cartão de Crédito</option>
                <option>Cartão de Débito</option>
                <option>Dinheiro (Exige troco)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 inset-x-0 p-4 bg-[#f8ece3] border-t border-[#532120]/10 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
          <button 
            onClick={handleCheckoutSubmit}
            className="w-full bg-[#ff914a] text-[#381010] font-bold py-4 rounded-xl shadow-md hover:bg-[#ff9f61] transition-colors flex items-center justify-center gap-2"
          >
            Enviar Pedido via WhatsApp <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </DrawerOverlay>

    </div>
  );
}
