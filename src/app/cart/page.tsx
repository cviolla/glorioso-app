"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useSettingsStore } from "@/store/settingsStore";
import { ArrowLeft, ArrowRight, Trash2, Plus, Minus, MapPin, CreditCard, Motorbike, Store, User, Phone, Loader2, X, Banknote } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { CustomModal } from "@/components/CustomModal";
import { useStoreStatusStore } from "@/store/storeStatusStore";

type CheckoutStep = 'cart' | 'address' | 'summary';
type DeliveryType = 'delivery' | 'pickup' | null;

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, totalPrice, totalItems, clearCart } = useCartStore();
  const { whatsappNumber, deliveryFees, paymentMethods, fetchSettings } = useSettingsStore();
  const [isHydrated, setIsHydrated] = useState(false);
  
  const [step, setStep] = useState<CheckoutStep>('cart');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "danger";
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info"
  });
  const [userInfo, setUserInfo] = useState({ name: '', phone: '' });
  const [address, setAddress] = useState({ street: '', number: '', neighborhood: 'Santa Cruz da Serra', complement: '', reference: '' });
  const [paymentInfo, setPaymentInfo] = useState({ observation: '', paymentMethod: '', orderTime: 'Para agora', coupon: '' });
  const [splitPayments, setSplitPayments] = useState<{ method: string; value: string }[]>([]);
  const [needsChange, setNeedsChange] = useState(false);
  const [changeFor, setChangeFor] = useState('');
  const [voucherBrand, setVoucherBrand] = useState('');

  useEffect(() => {
    fetchSettings();
    
    // Use a small delay to avoid the synchronous setState warning on mount
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 0);
    
    return () => clearTimeout(timer);
  }, [fetchSettings]);

  // Force scroll to top on step change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const formatPhone = (value: string) => {
    // Remove tudo que não é dígito
    const digits = value.replace(/\D/g, '');
    
    // Se começar com 5521, remove para tratar apenas o número
    let number = digits;
    if (digits.startsWith('5521')) {
      number = digits.slice(4);
    } else if (digits.startsWith('21')) {
      number = digits.slice(2);
    }

    // Limita a 9 dígitos (padrão celular BR)
    number = number.slice(0, 9);

    // Aplica a máscara: +55 (21) 9XXXX-XXXX
    if (number.length <= 5) {
      return `+55 (21) ${number}`;
    }
    return `+55 (21) ${number.slice(0, 5)}-${number.slice(5)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setUserInfo({ ...userInfo, phone: formatted });
  };

  const getDeliveryFee = () => {
    if (deliveryType !== 'delivery') return 0;
    const neighborhood = address.neighborhood;
    return deliveryFees[neighborhood] || deliveryFees['Outros'] || 7.00;
  };
  
  const deliveryFee = getDeliveryFee();
  const finalTotal = totalPrice() + deliveryFee;

  const currentSplitTotal = splitPayments.reduce((sum, p) => {
    const val = parseFloat(p.value.replace(',', '.')) || 0;
    return sum + val;
  }, 0);

  const isTotalMatched = Math.abs(currentSplitTotal - finalTotal) < 0.01;
  const isCartEmpty = items.length === 0;

  useEffect(() => {
    if (isHydrated && !userInfo.phone) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUserInfo(prev => ({ ...prev, phone: '+55 (21) ' }));
    }
  }, [isHydrated, userInfo.phone]);

  useEffect(() => {
    if (isHydrated && paymentMethods.length > 0 && splitPayments.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSplitPayments([{ method: paymentMethods[0], value: finalTotal.toFixed(2).replace('.', ',') }]);
    }
  }, [isHydrated, paymentMethods, finalTotal, splitPayments.length]);

  useEffect(() => {
    const fetchCustomerData = async () => {
      const cleanPhone = userInfo.phone.replace(/\D/g, '');
      // Verifica se tem os 4 do prefixo (5521) + 8 ou 9 do número
      if (cleanPhone.length >= 12) {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('phone', userInfo.phone)
          .single();
        
        if (data && !error) {
          if (!userInfo.name) setUserInfo(prev => ({ ...prev, name: data.name }));
          setAddress({
            street: data.street || '',
            number: data.number || '',
            neighborhood: data.neighborhood || 'Santa Cruz da Serra',
            complement: data.complement || '',
            reference: data.reference || ''
          });
        }
      }
    };

    fetchCustomerData();
  }, [userInfo.phone, userInfo.name]);

  if (!isHydrated) return null;

  const handleCheckoutSubmit = async () => {
    if (items.length === 0 || isSubmitting) return;

    // Segurança: Verificar se a loja está aberta antes de processar
    const { isManualOpen } = useStoreStatusStore.getState();
    if (!isManualOpen) {
      setModalConfig({
        isOpen: true,
        title: "Loja Fechada",
        message: "Desculpe, a loja fechou enquanto você montava seu pedido. Não podemos processar novos pedidos agora.",
        type: "warning"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 1. Salvar/Atualizar Cliente para agilizar pedidos futuros
      await supabase.from('customers').upsert({
        phone: userInfo.phone,
        name: userInfo.name,
        street: address.street,
        number: address.number,
        neighborhood: address.neighborhood,
        complement: address.complement,
        reference: address.reference,
        last_order_at: new Date().toISOString()
      }, { onConflict: 'phone' });

      // 2. Montar observação final (inclui info de troco se aplicável)
      let finalObservation = paymentInfo.observation;
      const hasCash = splitPayments.some(p => p.method === 'Dinheiro');
      
      if (hasCash && needsChange && changeFor) {
        const cashPayment = splitPayments.find(p => p.method === 'Dinheiro');
        const cashValue = parseFloat(cashPayment?.value.replace(',', '.') || '0');
        const changeAmount = parseFloat(changeFor.replace(',', '.'));
        
        if (!isNaN(changeAmount) && changeAmount > cashValue) {
          const trocoValue = (changeAmount - cashValue).toFixed(2).replace('.', ',');
          const trocoInfo = `💰 TROCO: Levar troco para R$ ${changeFor} (troco de R$ ${trocoValue})`;
          finalObservation = finalObservation ? `${trocoInfo}\n${finalObservation}` : trocoInfo;
        }
      } else if (hasCash && !needsChange) {
        const trocoInfo = `💰 TROCO: Não precisa de troco`;
        finalObservation = finalObservation ? `${trocoInfo}\n${finalObservation}` : trocoInfo;
      }

      // Montar string de métodos de pagamento para o banco
      const paymentSummary = splitPayments
        .map(p => {
          let methodStr = `${p.method}: R$ ${p.value}`;
          if (p.method === 'Voucher' && voucherBrand) methodStr += ` (${voucherBrand})`;
          return methodStr;
        })
        .join(' | ');

      // 3. Salvar Pedido no Supabase
      const { data: savedOrder, error } = await supabase.from('orders').insert({
        customer_name: userInfo.name,
        customer_phone: userInfo.phone,
        delivery_type: deliveryType,
        address_street: address.street,
        address_number: address.number,
        address_neighborhood: address.neighborhood,
        address_complement: address.complement,
        address_reference: address.reference,
        payment_method: paymentSummary,
        order_time: paymentInfo.orderTime,
        observation: finalObservation,
        total_price: finalTotal,
        items: items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          variant: item.variant,
          addons: item.addons
        })),
        status: 'pending'
      }).select().single();

      if (error) throw error;

      // 4. Montar texto do WhatsApp conforme novo template
      const orderId = savedOrder.id.slice(-6).toUpperCase();
      const now = new Date();
      const formattedDateTime = now.toLocaleString('pt-BR', { 
        timeZone: 'America/Sao_Paulo',
        day: '2-digit', month: '2-digit', year: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
      }).replace(',', '');

      let text = `Venho do app *Glorioso Brownie*\n`;
      text += `BR-${orderId}\n`;
      text += `${formattedDateTime}\n\n`;
      
      text += `*Tipo de serviço:* ${deliveryType === 'pickup' ? 'Retirada' : 'Delivery'}\n\n`;
      
      text += `*Nome:* ${userInfo.name}\n`;
      text += `*Telefone:* ${userInfo.phone}\n`;
      if (deliveryType === 'delivery') {
        text += `*Endereço:* ${address.neighborhood}, ${address.street} #${address.number}`;
        if (address.complement) text += ` - ${address.complement}`;
        if (address.reference) text += ` | Ref: ${address.reference}`;
        text += `\n`;
      }

      text += `*Previsão:* ${paymentInfo.orderTime}\n`;
      
      text += `\n*Produtos*\n`;
      items.forEach(item => {
        const itemTotal = item.price + (item.addons?.reduce((sum, a) => sum + a.price, 0) || 0);
        let itemDesc = `X${item.quantity} ${item.name}`;
        if (item.variant) itemDesc += ` (${item.variant})`;
        text += `${itemDesc}  R$ ${(itemTotal * item.quantity).toFixed(2).replace('.', ',')}\n`;
        if (item.addons && item.addons.length > 0) {
          text += `   _Adicionais: ${item.addons.map(a => a.name).join(', ')}_\n`;
        }
      });
      
      text += `\n*Subtotal:* R$ ${totalPrice().toFixed(2).replace('.', ',')}\n`;
      if (deliveryType === 'delivery') {
        text += `*Delivery:* R$ ${deliveryFee.toFixed(2).replace('.', ',')}\n`;
      }
      text += `*Total:* R$ ${finalTotal.toFixed(2).replace('.', ',')}\n`;
      
      text += `\n*Pagamento*\n`;
      text += `Estado do pagamento: Não pago\n`;
      text += `Total a pagar: R$ ${finalTotal.toFixed(2).replace('.', ',')}\n`;
      
      splitPayments.forEach(p => {
        let pMethod = p.method;
        if (pMethod === 'Voucher' && voucherBrand) pMethod += ` (${voucherBrand})`;
        text += `${pMethod}: R$ ${p.value}\n`;
      });
      
      if (hasCash) {
        const cashPayment = splitPayments.find(p => p.method === 'Dinheiro');
        const cashValue = parseFloat(cashPayment?.value.replace(',', '.') || '0');
        
        if (needsChange && changeFor) {
          const changeAmount = parseFloat(changeFor.replace(',', '.'));
          if (!isNaN(changeAmount) && changeAmount > cashValue) {
            text += `💰 *Troco para:* R$ ${changeFor} (troco de R$ ${(changeAmount - cashValue).toFixed(2).replace('.', ',')})\n`;
          }
        } else {
          text += `💰 *Não precisa de troco*\n`;
        }
      }
      
      if (paymentInfo.observation) {
        text += `\n*Comentários adicionais:*\n${paymentInfo.observation}\n`;
      }
      
      text += `\nPor favor, envie-nos esta mensagem agora. Assim que recebermos estaremos atendendo você.`;
      
      // 5. Abrir WhatsApp e limpar carrinho
      const cleanNumber = whatsappNumber.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, '_blank');
      
      // Automatização: Limpar e voltar para o menu após um pequeno delay
      setTimeout(() => {
        clearCart();
        router.push('/menu');
      }, 500);
      
    } catch (err: unknown) {
      console.error("Erro ao salvar pedido:", err);
      setModalConfig({
        isOpen: true,
        title: "Erro no Pedido",
        message: "Houve um erro ao processar seu pedido no banco de dados. Por favor, tente novamente ou entre em contato.",
        type: "danger"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    const cleanPhone = userInfo.phone.replace(/\D/g, '');
    // Nome > 2 chars e Telefone válido (55 + 21 + 9 dígitos = 13)
    const isBasicInfoValid = userInfo.name.trim().length > 2 && cleanPhone.length >= 13;
    
    if (step === 'address') {
      if (deliveryType === 'pickup') return isBasicInfoValid;
      
      return (
        isBasicInfoValid &&
        address.street.trim().length > 3 &&
        address.number.trim().length >= 1 &&
        address.neighborhood.trim() !== ''
      );
    }

    if (step === 'summary') {
      const isVoucherSelected = splitPayments.some(p => p.method === 'Voucher');
      const isVoucherValid = isVoucherSelected ? voucherBrand !== '' : true;
      return isBasicInfoValid && splitPayments.length > 0 && isVoucherValid && isTotalMatched;
    }

    return true;
  };

  const handleBack = () => {
    if (step === 'summary') {
      setStep(deliveryType === 'delivery' ? 'address' : 'cart');
    } else if (step === 'address') {
      setStep('cart');
    }
  };

  return (
    <div className={`min-h-screen font-sans pb-6 ${step === 'cart' ? 'bg-[#1a0808] text-[#f8ece3]' : 'bg-[#fff5e9] text-[#381010]'}`}>
      <header className={`p-5 flex items-center justify-between border-b sticky top-0 z-40 backdrop-blur-md ${step === 'cart' ? 'border-white/5 bg-[#1a0808]/95' : 'border-[#532120]/10 bg-[#fff5e9]/95'}`}>
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
        {step === 'cart' ? (
          <div className="text-right flex flex-col">
            <span className="text-xs opacity-60">Subtotal</span>
            <span className="font-bold">R$ {totalPrice().toFixed(2).replace('.', ',')}</span>
          </div>
        ) : (
          <button 
            onClick={() => router.push('/menu')}
            className="p-2 hover:bg-[#532120]/10 rounded-full transition-colors text-[#532120]/60 hover:text-[#532120]"
            title="Fechar e voltar ao cardápio"
          >
            <X className="w-6 h-6" />
          </button>
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
                        <div className="w-16 h-16 shrink-0 overflow-hidden relative rounded-xl border border-white/10">
                           <Image 
                             src={item.imageUrl || "/logo glorioso brownie 3.png"} 
                             alt={item.name} 
                             fill 
                             className="object-cover" 
                           />
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
                        className={`w-full border rounded-xl py-3 pl-10 pr-3 outline-none focus:ring-1 text-[#381010] bg-white text-[16px] transition-all ${userInfo.name.length > 0 && userInfo.name.length <= 2 ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:border-[#ff914a] focus:ring-[#ff914a]'}`} 
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
                        type="tel" placeholder="99999-9999" 
                        className={`w-full border rounded-xl py-3 pl-10 pr-3 outline-none focus:ring-1 text-[#381010] bg-white text-[16px] transition-all ${userInfo.phone.length > 13 && userInfo.phone.replace(/\D/g, '').length < 12 ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:border-[#ff914a] focus:ring-[#ff914a]'}`} 
                        value={userInfo.phone} onChange={handlePhoneChange} 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Section */}
              {deliveryType === 'delivery' && (
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
                        <input type="text" placeholder="Apto 201 ou Casa" className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-[#ff914a] focus:ring-1 focus:ring-[#ff914a] text-[#381010] bg-white text-[16px] transition-all" value={address.complement} onChange={e => setAddress({...address, complement: e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-[#381010] mb-1 block">Bairro</label>
                      <select className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-[#ff914a] focus:ring-1 focus:ring-[#ff914a] text-[#381010] bg-white text-[16px] transition-all" value={address.neighborhood} onChange={e => setAddress({...address, neighborhood: e.target.value})}>
                        {Object.keys(deliveryFees).filter(n => n !== 'Outros').sort().map(neighborhood => (
                          <option key={neighborhood}>{neighborhood}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-bold text-[#381010] mb-1 block">Referência</label>
                      <input type="text" placeholder="Próximo a..." className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-[#ff914a] focus:ring-1 focus:ring-[#ff914a] text-[#381010] bg-white text-[16px] transition-all" value={address.reference} onChange={e => setAddress({...address, reference: e.target.value})} />
                    </div>
                  </div>
                </div>
              )}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-[#381010] mb-1 block">Tipo de pedido</label>
                    <select 
                      className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-[#ff914a] focus:ring-1 focus:ring-[#ff914a] text-[#381010] bg-white text-[16px] transition-all" 
                      value={paymentInfo.orderTime === 'Para agora' ? 'Para agora' : 'Agendar para mais tarde'} 
                      onChange={e => setPaymentInfo({...paymentInfo, orderTime: e.target.value === 'Para agora' ? 'Para agora' : '15:30'})}
                    >
                      <option>Para agora</option>
                      <option>Agendar para mais tarde</option>
                    </select>
                  </div>
                  {paymentInfo.orderTime !== 'Para agora' && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                      <label className="text-sm font-bold text-[#381010] mb-1 block">Horário de {deliveryType === 'pickup' ? 'retirada' : 'entrega'}</label>
                      <input 
                        type="time" 
                        className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-[#ff914a] focus:ring-1 focus:ring-[#ff914a] text-[#381010] bg-white text-[16px] transition-all"
                        value={paymentInfo.orderTime === 'Agendar para mais tarde' ? '' : paymentInfo.orderTime}
                        onChange={e => setPaymentInfo({...paymentInfo, orderTime: e.target.value})}
                      />
                    </motion.div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-bold text-[#381010] mb-1 block">Observações do pedido</label>
                  <textarea placeholder="Ex: Tirar cebola, enviar bastante calda..." className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-[#ff914a] focus:ring-1 focus:ring-[#ff914a] text-[#381010] bg-white h-24 resize-none text-[16px] transition-all" value={paymentInfo.observation} onChange={e => setPaymentInfo({...paymentInfo, observation: e.target.value})} />
                </div>
                <div className="border border-gray-300 rounded-xl p-4 bg-white/50">
                  <label className="text-sm font-bold text-[#381010] flex gap-2 items-center mb-3"><CreditCard className="w-4 h-4" /> Formas de pagamento</label>
                  
                  <div className="space-y-3">
                    {/* Lista de formas selecionadas */}
                    <div className="space-y-3">
                      {splitPayments.map((payment, index) => (
                        <div key={index} className="flex flex-col gap-2 p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
                          <div className="flex items-center justify-between">
                            <select 
                              className="bg-transparent font-bold text-[14px] outline-none text-[#381010]"
                              value={payment.method}
                              onChange={(e) => {
                                const newPayments = [...splitPayments];
                                newPayments[index].method = e.target.value;
                                setSplitPayments(newPayments);
                                if (!newPayments.some(p => p.method === 'Dinheiro')) {
                                  setNeedsChange(false);
                                  setChangeFor('');
                                }
                                if (!newPayments.some(p => p.method === 'Voucher')) {
                                  setVoucherBrand('');
                                }
                              }}
                            >
                              {paymentMethods.map(method => (
                                <option key={method} value={method}>{method}</option>
                              ))}
                            </select>
                            <button 
                              onClick={() => {
                                if (splitPayments.length > 1) {
                                  setSplitPayments(splitPayments.filter((_, i) => i !== index));
                                }
                              }}
                              className="text-red-400 p-1 hover:bg-red-50 rounded-full transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">R$</span>
                            <input 
                              type="text"
                              inputMode="decimal"
                              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-[#ff914a] font-mono text-[15px]"
                              value={payment.value}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9,\.]/g, '');
                                const newPayments = [...splitPayments];
                                newPayments[index].value = val;
                                setSplitPayments(newPayments);
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Botão para adicionar outra forma */}
                    {splitPayments.length < paymentMethods.length && (
                      <button 
                        onClick={() => setSplitPayments([...splitPayments, { method: paymentMethods.find(m => !splitPayments.some(p => p.method === m)) || paymentMethods[0], value: '0,00' }])}
                        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 text-sm font-bold flex items-center justify-center gap-2 hover:border-[#ff914a]/40 hover:text-[#ff914a]/60 transition-all"
                      >
                        <Plus className="w-4 h-4" /> Adicionar outra forma
                      </button>
                    )}

                    {/* Resumo da Validação */}
                    <div className={`p-3 rounded-xl border ${isTotalMatched ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'} transition-all`}>
                      <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                        <span>Total Inserido:</span>
                        <span>R$ {currentSplitTotal.toFixed(2).replace('.', ',')}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] opacity-70 mt-1">
                        <span>Faltando:</span>
                        <span>R$ {Math.max(0, finalTotal - currentSplitTotal).toFixed(2).replace('.', ',')}</span>
                      </div>
                      {!isTotalMatched && (
                        <p className="text-[10px] mt-2 font-bold animate-pulse">
                          ⚠️ O total inserido deve ser exatamente R$ {finalTotal.toFixed(2).replace('.', ',')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Seleção de Bandeira do Voucher */}
                  <AnimatePresence>
                    {splitPayments.some(p => p.method === 'Voucher') && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 p-4 bg-[#fff8f0] border border-[#ff914a]/20 rounded-xl space-y-3">
                          <span className="text-xs font-bold text-[#381010]">Selecione a bandeira do Voucher:</span>
                          <div className="grid grid-cols-2 gap-2">
                            {['Alelo', 'Ticket', 'iFood', 'VR'].map(brand => (
                              <button
                                key={brand}
                                type="button"
                                onClick={() => setVoucherBrand(brand)}
                                className={`py-2.5 rounded-lg text-[13px] font-bold transition-all border-2 ${
                                  voucherBrand === brand 
                                    ? 'bg-[#ff914a] text-white border-[#ff914a] shadow-md shadow-[#ff914a]/20' 
                                    : 'bg-white text-[#381010] border-gray-200 hover:border-[#ff914a]/40'
                                }`}
                              >
                                {brand}
                              </button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Seção de Troco - aparece somente quando algum método é Dinheiro */}
                  <AnimatePresence>
                    {splitPayments.some(p => p.method === 'Dinheiro') && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 p-4 bg-[#fff8f0] border border-[#ff914a]/20 rounded-xl space-y-3">
                          <div className="flex items-center gap-2">
                            <Banknote className="w-4 h-4 text-[#ff914a]" />
                            <span className="text-sm font-bold text-[#381010]">Precisa de troco para o Dinheiro?</span>
                          </div>
                          
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => { setNeedsChange(false); setChangeFor(''); }}
                              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all border-2 ${
                                !needsChange 
                                  ? 'bg-[#ff914a] text-white border-[#ff914a] shadow-md shadow-[#ff914a]/20' 
                                  : 'bg-white text-[#381010] border-gray-200 hover:border-[#ff914a]/40'
                              }`}
                            >
                              Não
                            </button>
                            <button
                              type="button"
                              onClick={() => setNeedsChange(true)}
                              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all border-2 ${
                                needsChange 
                                  ? 'bg-[#ff914a] text-white border-[#ff914a] shadow-md shadow-[#ff914a]/20' 
                                  : 'bg-white text-[#381010] border-gray-200 hover:border-[#ff914a]/40'
                              }`}
                            >
                              Sim
                            </button>
                          </div>

                          <AnimatePresence>
                            {needsChange && (
                              <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.2 }}
                              >
                                <label className="text-xs font-bold text-[#381010]/70 mb-1 block">Troco para quanto?</label>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#381010]/40 font-bold text-sm">R$</span>
                                  <input
                                    type="text"
                                    inputMode="decimal"
                                    placeholder={`Ex: 50,00`}
                                    className="w-full border border-gray-300 rounded-lg py-2.5 pl-10 pr-3 outline-none focus:border-[#ff914a] focus:ring-1 focus:ring-[#ff914a] text-[#381010] bg-white text-[16px] transition-all"
                                    value={changeFor}
                                    onChange={e => {
                                      const val = e.target.value.replace(/[^0-9,\.]/g, '');
                                      setChangeFor(val);
                                    }}
                                  />
                                </div>
                                {changeFor && (() => {
                                  const amount = parseFloat(changeFor.replace(',', '.'));
                                  const cashPayment = splitPayments.find(p => p.method === 'Dinheiro');
                                  const cashValue = parseFloat(cashPayment?.value.replace(',', '.') || '0');
                                  
                                  if (!isNaN(amount) && amount > cashValue) {
                                    const trocoVal = (amount - cashValue).toFixed(2).replace('.', ',');
                                    return (
                                      <p className="text-xs text-green-600 font-semibold mt-1 flex items-center gap-1">
                                        <Banknote className="w-3 h-3" /> Troco: R$ {trocoVal}
                                      </p>
                                    );
                                  } else if (!isNaN(amount) && amount <= cashValue) {
                                    return (
                                      <p className="text-xs text-red-500 font-semibold mt-1">
                                        O valor precisa ser maior que a parte em dinheiro (R$ {cashValue.toFixed(2).replace('.', ',')})
                                      </p>
                                    );
                                  }
                                  return null;
                                })()}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {!isCartEmpty && (
        <div className={`fixed bottom-0 inset-x-0 border-t p-4 pb-6 z-30 transition-colors duration-300 ${step === 'cart' ? 'bg-[#1a0808] border-white/10' : 'bg-[#fff5e9] border-[#532120]/10 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]'}`}>
          <div className="max-w-3xl mx-auto">
            {step === 'cart' && (
              <>
                <p className="text-center text-sm font-medium mb-4 text-white/80">Selecione o tipo de serviço:</p>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => { setDeliveryType('pickup'); setStep('address'); }} className="bg-[#ff914a] text-[#381010] flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold hover:bg-[#ff9f61]"><Store className="w-5 h-5" /> Retirada</button>
                  <button onClick={() => { setDeliveryType('delivery'); setStep('address'); }} className="bg-[#ff914a] text-[#381010] flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold hover:bg-[#ff9f61]"><Motorbike className="w-5 h-5" /> Delivery</button>
                </div>
              </>
            )}
            {step === 'address' && (
              <button 
                onClick={() => setStep('summary')} 
                className="w-full bg-[#ff914a] text-[#381010] font-bold py-4 rounded-xl shadow-md disabled:opacity-50 disabled:grayscale transition-all" 
                disabled={!isStepValid()}
              >
                {isStepValid() ? 'Continuar para Pagamento' : 'Preencha todos os campos'}
              </button>
            )}
            {step === 'summary' && (
              <button 
                onClick={handleCheckoutSubmit} 
                disabled={isSubmitting}
                className="w-full bg-[#ff914a] text-[#381010] font-bold py-4 rounded-xl shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    Enviar via WhatsApp <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
      <CustomModal 
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </div>
  );
}
