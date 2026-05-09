"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { MenuItem, MenuCategory } from '@/data/menu';
import { Search, Plus, Edit2, ChevronDown, ChevronUp, Image as ImageIcon, Clock, Power, Settings, Save, Trash2, Loader2, Upload, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useStoreStatusStore } from '@/store/storeStatusStore';
import { supabase } from '@/lib/supabase';
import { CustomModal } from '@/components/CustomModal';

// Brazilian price formatting helpers
function formatPriceBR(value: number): string {
  return value.toFixed(2).replace('.', ',');
}

function parsePriceBR(value: string): number {
  const cleaned = value.replace(/[^\d,]/g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

// Map full variant names to short labels
const VARIANT_SHORT_LABELS: Record<string, string> = {
  'PEQUENA': 'PEQ.',
  'MÉDIA': 'MED.',
  'MEDIA': 'MED.',
  'GRANDE': 'GRD.',
  'PEQ.': 'PEQ.',
  'MED.': 'MED.',
  'GRD.': 'GRD.',
};

function getShortLabel(name: string): string {
  return VARIANT_SHORT_LABELS[name.toUpperCase()] || name;
}

export default function AdminProductsPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
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
  const [saving, setSaving] = useState(false);

  const { isManualOpen, setManualOpen } = useStoreStatusStore();
  const currentStatus = isManualOpen;

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    try {
      const { data: cats } = await supabase.from('categories').select('*').order('sort_order');
      const { data: subs } = await supabase.from('subcategories').select('*').order('sort_order');
      const { data: prods } = await supabase.from('products').select('*').order('sort_order');
      const { data: vars } = await supabase.from('product_variants').select('*').order('sort_order');
      
      if (cats && prods) {
        const assembled: MenuCategory[] = cats.map(cat => {
          const catProds = prods.filter(p => p.category_id === cat.id && !p.subcategory_id);
          const catSubs = subs?.filter(s => s.category_id === cat.id).map(sub => ({
            name: sub.name,
            items: prods.filter(p => p.subcategory_id === sub.id).map(p => ({
              id: p.id,
              name: p.name,
              description: p.description,
              price: p.price,
              imageUrl: p.image_url,
              category_id: p.category_id,
              subcategory_id: p.subcategory_id,
              is_active: p.is_active,
              variants: vars?.filter(v => v.product_id === p.id).map(v => ({
                id: v.id,
                name: v.name,
                price: v.price
              }))
            }))
          }));

          return {
            id: cat.id,
            name: cat.name,
            items: catProds.map(p => ({
              id: p.id,
              name: p.name,
              description: p.description,
              price: p.price,
              imageUrl: p.image_url,
              category_id: p.category_id,
              is_active: p.is_active,
              variants: vars?.filter(v => v.product_id === p.id).map(v => ({
                id: v.id,
                name: v.name,
                price: v.price
              }))
            })),
            subcategories: catSubs
          };
        });
        setCategories(assembled);
      }
    } catch (err) {
      console.error("Erro ao carregar cardápio:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMenu();
  }, [fetchMenu]);


  const initializedRef = useRef(false);

  useEffect(() => {
    if (categories.length > 0 && !initializedRef.current) {
      setExpandedCategory(categories[0].id);
      initializedRef.current = true;
    }
  }, [categories]);

  const handleEditClick = (item: MenuItem) => {
    setIsNewProduct(false);
    setEditingItem({ ...item });
  };

  const handleNewClick = () => {
    setIsNewProduct(true);
    setEditingItem({
      id: '',
      name: '',
      description: '',
      price: 0,
      imageUrl: '',
      category_id: categories[0]?.id || ''
    });
  };

  const handleDeleteProduct = async (id: string) => {
    setModalConfig({
      isOpen: true,
      title: "Excluir Produto",
      message: "Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.",
      type: "danger",
      onConfirm: async () => {
        try {
          const { error } = await supabase.from('products').delete().eq('id', id);
          if (error) throw error;
          fetchMenu();
          setModalConfig({
            isOpen: true,
            title: "Sucesso",
            message: "Produto excluído com sucesso!",
            type: "success"
          });
        } catch (err) {
          setModalConfig({
            isOpen: true,
            title: "Erro",
            message: "Houve um erro ao excluir o produto.",
            type: "danger"
          });
        }
      }
    });
  };
  
  const handleToggleVisibility = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      if (error) throw error;
      
      setCategories(prev => prev.map(cat => ({
        ...cat,
        items: cat.items?.map(item => item.id === id ? { ...item, is_active: !currentStatus } : item),
        subcategories: cat.subcategories?.map(sub => ({
          ...sub,
          items: sub.items.map(item => item.id === id ? { ...item, is_active: !currentStatus } : item)
        }))
      })));
    } catch (err) {
      console.error("Erro ao alternar visibilidade:", err);
      setModalConfig({
        isOpen: true,
        title: "Erro",
        message: "Houve um erro ao alterar a visibilidade do produto.",
        type: "danger"
      });
    }
  };

  const handleSaveProduct = async () => {
    if (!editingItem) return;
    setSaving(true);
    try {
      let productId = editingItem.id;

      if (isNewProduct) {
        const { data: newProd, error } = await supabase
          .from('products')
          .insert({
            name: editingItem.name,
            description: editingItem.description,
            price: editingItem.price,
            image_url: editingItem.imageUrl,
            category_id: editingItem.category_id
          })
          .select()
          .single();
        if (error) throw error;
        productId = newProd.id;
      } else {
        const { error } = await supabase
          .from('products')
          .update({
            name: editingItem.name,
            description: editingItem.description,
            price: editingItem.price,
            image_url: editingItem.imageUrl,
            category_id: editingItem.category_id
          })
          .eq('id', editingItem.id);
        if (error) throw error;
      }

      if (editingItem.variants) {
        await supabase.from('product_variants').delete().eq('product_id', productId);
        
        if (editingItem.variants.length > 0) {
          const variantsToInsert = editingItem.variants.map((v, idx) => ({
            product_id: productId,
            name: v.name,
            price: v.price,
            sort_order: idx
          }));
          await supabase.from('product_variants').insert(variantsToInsert);
        }
      }
      
      await fetchMenu();
      setEditingItem(null);
    } catch (err) {
      console.error("Erro ao salvar produto:", err);
      setModalConfig({
        isOpen: true,
        title: "Erro ao Salvar",
        message: "Houve um problema ao salvar o produto. Verifique sua conexão.",
        type: "danger"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingItem) return;

    setSaving(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) {
        if (uploadError.message.includes('bucket not found')) {
          setModalConfig({
            isOpen: true,
            title: "Configuração Necessária",
            message: "O bucket 'products' não existe no Supabase. Crie-o para habilitar fotos.",
            type: "warning"
          });
          return;
        }
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      setEditingItem({ ...editingItem, imageUrl: publicUrl });
    } catch (err) {
      console.error("Erro no upload:", err);
      setModalConfig({
        isOpen: true,
        title: "Erro no Upload",
        message: "Não foi possível enviar a imagem. Tente novamente.",
        type: "danger"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">

      {/* Header Actions */}
      <div className="flex flex-col md:flex-row gap-2 items-start md:items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-[var(--color-brand-dark)] tracking-tight">Produtos</h2>
          <p className="text-[11.5px] text-gray-500 mt-0.5 font-medium">Gerencie os itens do cardápio.</p>
        </div>
        <button 
          onClick={handleNewClick}
          className="bg-[var(--color-brand-accent)] text-white px-4 h-10 rounded-xl text-[13px] font-bold flex justify-center items-center gap-2 w-full md:w-auto shadow-md shadow-[var(--color-brand-accent)]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" />
          Novo Produto
        </button>
      </div>


      {/* Categories & Products List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="font-medium">Carregando cardápio...</p>
        </div>
      ) : (
        <div className="space-y-1">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-50 hover:border-gray-100 transition-colors">
              <button 
                className="w-full px-4 py-3 flex items-center justify-between bg-white transition-colors"
                onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-1 h-5 rounded-full transition-colors ${expandedCategory === category.id ? 'bg-[var(--color-brand-accent)]' : 'bg-gray-100'}`} />
                  <h3 className="font-black text-[var(--color-brand-dark)] text-[15px] tracking-tight">{category.name}</h3>
                </div>
                <div className={`p-1.5 rounded-lg transition-colors ${expandedCategory === category.id ? 'bg-[var(--color-brand-accent)]/10 text-[var(--color-brand-accent)]' : 'bg-gray-50 text-gray-400'}`}>
                  {expandedCategory === category.id ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </button>
              
              <AnimatePresence>
                {expandedCategory === category.id && (
                  <motion.div 
                    initial={{ height: 0 }} 
                    animate={{ height: 'auto' }} 
                    exit={{ height: 0 }} 
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-2 flex flex-col gap-1">
                      {category.subcategories?.map(sub => (
                        <div key={sub.name} className="mt-4 first:mt-0">
                          <h4 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">{sub.name}</h4>
                          <div className="space-y-1">
                            {sub.items.map(item => (
                              <ProductListItem 
                                key={item.id} 
                                item={item} 
                                onEdit={() => handleEditClick(item)} 
                                onDelete={() => handleDeleteProduct(item.id)} 
                                onToggleVisibility={() => handleToggleVisibility(item.id, !!item.is_active)}
                              />
                            ))}
                          </div>
                        </div>
                      ))}

                      {category.items?.map(item => (
                        <ProductListItem 
                          key={item.id} 
                          item={item} 
                          onEdit={() => handleEditClick(item)} 
                          onDelete={() => handleDeleteProduct(item.id)} 
                          onToggleVisibility={() => handleToggleVisibility(item.id, !!item.is_active)}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal Overlay */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center items-center p-0 md:p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => !saving && setEditingItem(null)}
            />
            <motion.div 
              initial={{ y: '100%' }} 
              animate={{ y: 0 }} 
              exit={{ y: '100%' }} 
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white w-full md:max-w-md rounded-t-2xl md:rounded-2xl shadow-2xl relative z-10 flex flex-col max-h-[90vh]"
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 md:rounded-t-2xl shrink-0">
                <h3 className="font-black text-[16px] text-[var(--color-brand-dark)] tracking-tight">{isNewProduct ? 'Novo Produto' : 'Editar Produto'}</h3>
                <button 
                  onClick={() => setEditingItem(null)} 
                  disabled={saving}
                  className="w-8 h-8 flex items-center justify-center bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all shadow-sm text-xs font-bold"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-4 overflow-y-auto no-scrollbar flex-1">
                <div className="space-y-4">
                  {/* Image Uploader */}
                  <div className="relative group">
                    <div className="h-28 w-full bg-gray-50 border border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 overflow-hidden relative">
                      {editingItem.imageUrl ? (
                        <Image src={editingItem.imageUrl} alt={editingItem.name} fill sizes="400px" className="object-cover" />
                      ) : (
                        <>
                          <ImageIcon className="w-6 h-6 mb-1" />
                          <span className="text-[11.5px] font-bold">Sem imagem</span>
                        </>
                      )}
                      <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity cursor-pointer">
                        <Upload className="w-5 h-5 mb-1" />
                        <span className="text-[10px] font-black uppercase tracking-wider">Alterar Foto</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={saving} />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-[var(--color-brand-dark)] mb-1.5 block uppercase tracking-widest">Categoria</label>
                    <div className="relative">
                      <select 
                        className="w-full border border-gray-100 rounded-xl px-3 pr-9 h-10 outline-none focus:border-[var(--color-brand-accent)]/20 focus:ring-2 focus:ring-[var(--color-brand-accent)]/10 text-[var(--color-brand-dark)] bg-gray-50/50 text-[13px] transition-all font-bold appearance-none"
                        value={editingItem.category_id}
                        onChange={(e) => setEditingItem({...editingItem, category_id: e.target.value})}
                        disabled={saving}
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-[var(--color-brand-dark)] mb-1.5 block uppercase tracking-widest">Nome do Produto</label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-100 rounded-xl px-3 h-10 outline-none focus:border-[var(--color-brand-accent)]/20 focus:ring-2 focus:ring-[var(--color-brand-accent)]/10 text-[var(--color-brand-dark)] bg-gray-50/50 text-[13px] transition-all font-bold"
                      value={editingItem.name} 
                      onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-[var(--color-brand-dark)] mb-1.5 block uppercase tracking-widest">Descrição</label>
                    <textarea 
                      className="w-full border border-gray-100 rounded-xl p-3 outline-none focus:border-[var(--color-brand-accent)]/20 focus:ring-2 focus:ring-[var(--color-brand-accent)]/10 text-[var(--color-brand-dark)] bg-gray-50/50 text-[13px] transition-all font-medium resize-none h-20"
                      value={editingItem.description || ''} 
                      onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                      placeholder="Ex: chocolate belga, pedaços de nozes..."
                      disabled={saving}
                    />
                  </div>

                  {/* Price Section */}
                  <div className="pt-2">
                    <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 shadow-inner">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <label className="text-[11px] font-black text-[var(--color-brand-dark)] uppercase tracking-widest block">Gestão de Preços</label>
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">Defina valores únicos ou por tamanho</p>
                        </div>
                        <div className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${(!editingItem.variants || editingItem.variants.length === 0) ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                          {(!editingItem.variants || editingItem.variants.length === 0) ? 'Preço Único' : 'Múltiplos Tamanhos'}
                        </div>
                      </div>

                      {/* Base Price - Only show prominently if no variants */}
                      {(!editingItem.variants || editingItem.variants.length === 0) ? (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Preço do Produto</label>
                          <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-[var(--color-brand-accent)] text-[13px]">R$</span>
                            <input 
                              type="text" 
                              inputMode="decimal"
                              className="w-full border-2 border-white rounded-xl pl-10 pr-4 h-12 outline-none focus:border-[var(--color-brand-accent)]/30 focus:ring-4 focus:ring-[var(--color-brand-accent)]/5 text-[var(--color-brand-dark)] bg-white text-[16px] transition-all font-black shadow-sm"
                              value={formatPriceBR(editingItem.price || 0)} 
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => setEditingItem({...editingItem, price: parsePriceBR(e.target.value)})}
                              disabled={saving}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white/60 p-3 rounded-xl border border-dashed border-gray-200 mb-4">
                          <div className="flex justify-between items-center opacity-60">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Preço Base (Inativo)</span>
                            <span className="text-[12px] font-black text-gray-400">R$ 0,00</span>
                          </div>
                          <p className="text-[8px] text-gray-400 mt-1 uppercase font-bold">O preço será calculado com base nas variações abaixo</p>
                        </div>
                      )}

                      {/* Variations Section */}
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Variações de Tamanho</span>
                          <button 
                            type="button"
                            onClick={() => {
                              const vars = [...(editingItem.variants || [])];
                              vars.push({ name: '', price: 0 });
                              setEditingItem({...editingItem, variants: vars, price: 0});
                            }}
                            className="text-[9px] bg-white border border-gray-200 text-[var(--color-brand-dark)] px-3 py-1.5 rounded-lg font-black hover:bg-gray-50 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm uppercase tracking-widest"
                          >
                            <Plus className="w-3 h-3 text-[var(--color-brand-accent)]" />
                            Novo Tamanho
                          </button>
                        </div>

                        <div className="space-y-2.5">
                          <AnimatePresence initial={false}>
                            {editingItem.variants?.map((v, idx) => (
                              <motion.div 
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex gap-2 items-center bg-white p-2.5 rounded-xl border border-gray-100 shadow-sm relative group"
                              >
                                <div className="flex-1 min-w-0">
                                  <input 
                                    type="text" 
                                    placeholder="Ex: PEQ."
                                    className="w-full text-[12px] border-none bg-gray-50/50 rounded-lg h-9 px-3 outline-none focus:bg-white focus:ring-2 focus:ring-[var(--color-brand-accent)]/20 font-bold transition-all"
                                    value={v.name}
                                    onChange={(e) => {
                                      const vars = [...(editingItem.variants || [])];
                                      vars[idx].name = e.target.value;
                                      setEditingItem({...editingItem, variants: vars});
                                    }}
                                  />
                                </div>
                                <div className="relative w-28 shrink-0">
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-[var(--color-brand-accent)]">R$</span>
                                  <input 
                                    type="text" 
                                    inputMode="decimal"
                                    placeholder="0,00"
                                    className="w-full text-[14px] border-none bg-gray-50/50 rounded-lg h-9 pl-8 pr-3 outline-none focus:bg-white focus:ring-2 focus:ring-[var(--color-brand-accent)]/20 font-black transition-all"
                                    value={formatPriceBR(v.price)}
                                    onFocus={(e) => e.target.select()}
                                    onChange={(e) => {
                                      const vars = [...(editingItem.variants || [])];
                                      vars[idx].price = parsePriceBR(e.target.value);
                                      setEditingItem({...editingItem, variants: vars});
                                    }}
                                  />
                                </div>
                                <button 
                                  type="button"
                                  onClick={() => {
                                    const vars = editingItem.variants?.filter((_, i) => i !== idx);
                                    setEditingItem({...editingItem, variants: vars});
                                  }}
                                  className="w-8 h-9 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                          
                          {(!editingItem.variants || editingItem.variants.length === 0) && (
                            <div className="py-6 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl bg-white/40">
                              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Preço único ativo</p>
                              <p className="text-[9px] text-gray-300 font-bold">Adicione tamanhos se houver variações</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>


              <div className="p-4 border-t border-gray-100 bg-gray-50/50 md:rounded-b-2xl shrink-0">
                <button 
                  className="w-full bg-[var(--color-brand-accent)] text-white h-12 rounded-xl font-black text-[13px] shadow-md shadow-[var(--color-brand-accent)]/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  onClick={handleSaveProduct}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      SALVANDO...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {isNewProduct ? 'CRIAR PRODUTO' : 'SALVAR ALTERAÇÕES'}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

function ProductListItem({ item, onEdit, onDelete, onToggleVisibility }: { item: MenuItem, onEdit: () => void, onDelete: () => void, onToggleVisibility: () => void }) {
  return (
    <div className={`flex items-center justify-between p-2.5 bg-white hover:bg-[var(--color-brand-light)]/30 rounded-xl transition-all group border shadow-sm ${!item.is_active ? 'opacity-60 grayscale-[0.5]' : 'border-gray-50 hover:border-gray-100'}`}>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden shrink-0 flex items-center justify-center relative border border-gray-100">
          {item.imageUrl ? (
            <Image src={item.imageUrl} alt={item.name} fill sizes="48px" className="object-cover group-hover:scale-110 transition-transform duration-500" />
          ) : (
            <ImageIcon className="w-5 h-5 text-gray-300" />
          )}
          {!item.is_active && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <EyeOff className="w-5 h-5 text-white drop-shadow-md" />
            </div>
          )}
        </div>
        <div>
          <h4 className={`font-black text-[var(--color-brand-dark)] text-[13px] leading-tight flex items-center gap-2`}>
            {item.name}
            {!item.is_active && <span className="text-[9px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded uppercase tracking-widest font-black">Oculto</span>}
          </h4>
          {item.price !== undefined && item.price > 0 ? (
            <p className="text-[11.5px] text-gray-500 font-bold mt-0.5">R$ {formatPriceBR(item.price)}</p>
          ) : item.variants && item.variants.length > 0 ? (
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              {item.variants.map((v, i) => (
                <span key={i} className="text-[9px] font-black bg-[var(--color-brand-accent)]/10 text-[var(--color-brand-accent)] px-1.5 py-0.5 rounded-md uppercase tracking-wide">
                  {getShortLabel(v.name)} R${formatPriceBR(v.price)}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[11.5px] text-gray-400 mt-0.5 font-medium italic">Consulte as opções</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1.5 pr-1">
        <button 
          onClick={onToggleVisibility}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${item.is_active ? 'bg-blue-50 text-blue-500 hover:bg-blue-100' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
          title={item.is_active ? "Esconder Produto" : "Mostrar Produto"}
        >
          {item.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
        <button 
          onClick={onDelete}
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50 text-red-500 hover:text-red-700 hover:bg-red-100 transition-all"
          title="Excluir"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <button 
          onClick={onEdit}
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--color-brand-accent)] text-white hover:scale-105 transition-all shadow-sm"
          title="Editar"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
