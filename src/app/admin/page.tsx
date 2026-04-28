"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { MenuItem, MenuCategory } from '@/data/menu';
import { Search, Plus, Edit2, ChevronDown, ChevronUp, Image as ImageIcon, Clock, Power, Settings, Save, Trash2, Loader2, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStoreStatusStore } from '@/store/storeStatusStore';
import { supabase } from '@/lib/supabase';
import { CustomModal } from '@/components/CustomModal';

export default function AdminProductsPage() {
  const [search, setSearch] = useState('');
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

  const { isManualOpen, setManualOpen, getIsOpen } = useStoreStatusStore();
  const currentStatus = getIsOpen();

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
              subcategory_id: p.subcategory_id
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
    fetchMenu().then(() => {
      // Abre a primeira categoria apenas no carregamento inicial
      if (categories.length === 0) {
        // O fetchMenu acima já vai atualizar o estado, 
        // mas precisamos de um jeito de pegar o ID da primeira categoria
      }
    });
  }, [fetchMenu]);

  const initializedRef = useRef(false);

  // Efeito separado para inicializar a primeira categoria aberta
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
    } as any);
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
            category_id: (editingItem as any).category_id
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
            image_url: editingItem.imageUrl
          })
          .eq('id', editingItem.id);
        if (error) throw error;
      }

      // SALVAR VARIANTES
      if (editingItem.variants) {
        // Para simplificar, deletamos as antigas e inserimos as novas
        // Em um sistema real, faríamos um diff (update/insert/delete)
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
    <div className="space-y-6">

      {/* Header Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-[var(--color-brand-dark)] tracking-tight">Gerenciar Produtos</h2>
          <p className="text-sm text-gray-500 mt-1">Altere preços, nomes e descrições do cardápio.</p>
        </div>
        <button 
          onClick={handleNewClick}
          className="bg-[var(--color-brand-accent)] text-white px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2 w-full md:w-auto shadow-lg shadow-[var(--color-brand-accent)]/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus className="w-5 h-5" />
          Novo Produto
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[var(--color-brand-accent)] transition-colors" />
        <input 
          type="text" 
          placeholder="Buscar produto por nome..." 
          className="w-full bg-white border-2 border-transparent rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-[var(--color-brand-accent)]/20 focus:ring-4 focus:ring-[var(--color-brand-accent)]/5 text-[var(--color-brand-dark)] text-[16px] shadow-sm transition-all placeholder:text-gray-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Categories & Products List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="font-medium">Carregando cardápio...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-white hover:shadow-md transition-shadow">
              <button 
                className="w-full px-6 py-5 flex items-center justify-between bg-white transition-colors"
                onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-8 rounded-full transition-colors ${expandedCategory === category.id ? 'bg-[var(--color-brand-accent)]' : 'bg-gray-100'}`} />
                  <h3 className="font-black text-[var(--color-brand-dark)] text-xl tracking-tight">{category.name}</h3>
                </div>
                <div className={`p-2 rounded-xl transition-colors ${expandedCategory === category.id ? 'bg-[var(--color-brand-accent)]/10 text-[var(--color-brand-accent)]' : 'bg-gray-50 text-gray-400'}`}>
                  {expandedCategory === category.id ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
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
                    <div className="px-5 pb-5 pt-2 flex flex-col gap-3">
                      {category.subcategories?.map(sub => (
                        <div key={sub.name} className="mt-4 first:mt-0">
                          <h4 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">{sub.name}</h4>
                          <div className="space-y-3">
                            {sub.items.filter(item => item.name.toLowerCase().includes(search.toLowerCase())).map(item => (
                              <ProductListItem key={item.id} item={item} onEdit={() => handleEditClick(item)} onDelete={() => handleDeleteProduct(item.id)} />
                            ))}
                          </div>
                        </div>
                      ))}

                      {category.items?.filter(item => item.name.toLowerCase().includes(search.toLowerCase())).map(item => (
                        <ProductListItem key={item.id} item={item} onEdit={() => handleEditClick(item)} onDelete={() => handleDeleteProduct(item.id)} />
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
              className="bg-white w-full md:w-full md:max-w-md rounded-t-3xl md:rounded-3xl shadow-2xl relative z-10 flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 md:rounded-t-3xl">
                <h3 className="font-black text-2xl text-[var(--color-brand-dark)] tracking-tight">{isNewProduct ? 'Novo Produto' : 'Editar Produto'}</h3>
                <button 
                  onClick={() => setEditingItem(null)} 
                  disabled={saving}
                  className="w-10 h-10 flex items-center justify-center bg-white border border-gray-100 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <div className="space-y-5">
                  {/* Image Uploader */}
                  <div className="relative group">
                    <div className="h-40 w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 overflow-hidden relative">
                      {editingItem.imageUrl ? (
                        <img src={editingItem.imageUrl} alt={editingItem.name} className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <ImageIcon className="w-8 h-8" />
                          <span className="text-sm font-medium">Sem imagem</span>
                        </>
                      )}
                      <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity cursor-pointer">
                        <Upload className="w-6 h-6 mb-2" />
                        <span className="text-xs font-bold uppercase tracking-wider">Alterar Foto</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={saving} />
                      </label>
                    </div>
                  </div>

                  {isNewProduct && (
                    <div>
                      <label className="text-sm font-black text-[var(--color-brand-dark)] mb-2 block uppercase tracking-wider">Categoria</label>
                      <select 
                        className="w-full border-2 border-gray-100 rounded-2xl p-4 outline-none focus:border-[var(--color-brand-accent)]/20 focus:ring-4 focus:ring-[var(--color-brand-accent)]/5 text-[var(--color-brand-dark)] bg-gray-50/30 text-[16px] transition-all font-medium appearance-none"
                        value={(editingItem as any).category_id}
                        onChange={(e) => setEditingItem({...editingItem, category_id: e.target.value} as any)}
                        disabled={saving}
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-black text-[var(--color-brand-dark)] mb-2 block uppercase tracking-wider">Nome do Produto</label>
                    <input 
                      type="text" 
                      className="w-full border-2 border-gray-100 rounded-2xl p-4 outline-none focus:border-[var(--color-brand-accent)]/20 focus:ring-4 focus:ring-[var(--color-brand-accent)]/5 text-[var(--color-brand-dark)] bg-gray-50/30 text-[16px] transition-all font-medium"
                      value={editingItem.name} 
                      onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-black text-[var(--color-brand-dark)] mb-2 block uppercase tracking-wider">Descrição</label>
                    <textarea 
                      className="w-full border-2 border-gray-100 rounded-2xl p-4 outline-none focus:border-[var(--color-brand-accent)]/20 focus:ring-4 focus:ring-[var(--color-brand-accent)]/5 text-[var(--color-brand-dark)] bg-gray-50/30 text-[16px] transition-all font-medium resize-none h-28"
                      value={editingItem.description || ''} 
                      onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                      placeholder="Ex: chocolate belga, pedaços de nozes..."
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-black text-[var(--color-brand-dark)] mb-2 block uppercase tracking-wider">Preço Base (R$)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">R$</span>
                      <input 
                        type="number" 
                        step="0.01"
                        className="w-full border-2 border-gray-100 rounded-2xl p-4 pl-12 outline-none focus:border-[var(--color-brand-accent)]/20 focus:ring-4 focus:ring-[var(--color-brand-accent)]/5 text-[var(--color-brand-dark)] bg-gray-50/30 text-[16px] transition-all font-bold"
                        value={editingItem.price || 0} 
                        onChange={(e) => setEditingItem({...editingItem, price: parseFloat(e.target.value)})}
                        disabled={saving}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 uppercase font-black tracking-widest">Use 0 se o produto tiver variações abaixo</p>
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm font-black text-[var(--color-brand-dark)] uppercase tracking-wider">Variações</label>
                      <button 
                        type="button"
                        onClick={() => {
                          const vars = [...(editingItem.variants || [])];
                          vars.push({ name: '', price: 0 } as any);
                          setEditingItem({...editingItem, variants: vars});
                        }}
                        className="text-xs bg-[var(--color-brand-accent)] text-white px-4 py-2 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm shadow-[var(--color-brand-accent)]/10"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Novo Tamanho
                      </button>
                    </div>

                    <div className="space-y-3">
                      {editingItem.variants?.map((v, idx) => (
                        <div key={idx} className="flex gap-2 items-start bg-gray-50 p-3 rounded-xl border border-gray-100">
                          <div className="flex-1 space-y-2">
                            <input 
                              type="text" 
                              placeholder="Nome (Ex: 30CM)"
                              className="w-full text-xs border-none bg-white rounded-lg p-2 outline-none focus:ring-1 focus:ring-[#ff914a] font-bold"
                              value={v.name}
                              onChange={(e) => {
                                const vars = [...(editingItem.variants || [])];
                                vars[idx].name = e.target.value;
                                setEditingItem({...editingItem, variants: vars});
                              }}
                            />
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">R$</span>
                              <input 
                                type="number" 
                                step="0.01"
                                placeholder="0,00"
                                className="w-full text-xs border-none bg-white rounded-lg py-2 pl-7 pr-2 outline-none focus:ring-1 focus:ring-[#ff914a] font-bold"
                                value={v.price}
                                onChange={(e) => {
                                  const vars = [...(editingItem.variants || [])];
                                  vars[idx].price = parseFloat(e.target.value);
                                  setEditingItem({...editingItem, variants: vars});
                                }}
                              />
                            </div>
                          </div>
                          <button 
                            type="button"
                            onClick={() => {
                              const vars = editingItem.variants?.filter((_, i) => i !== idx);
                              setEditingItem({...editingItem, variants: vars});
                            }}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      
                      {(!editingItem.variants || editingItem.variants.length === 0) && (
                        <p className="text-center py-4 text-xs text-gray-400 italic">Nenhum tamanho adicional configurado.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50/50 md:rounded-b-3xl">
                <button 
                  className="w-full bg-[var(--color-brand-accent)] text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-[var(--color-brand-accent)]/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  onClick={handleSaveProduct}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      SALVANDO...
                    </>
                  ) : (
                    <>
                      <Save className="w-6 h-6" />
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

function ProductListItem({ item, onEdit, onDelete }: { item: MenuItem, onEdit: () => void, onDelete: () => void }) {
  return (
    <div className="flex items-center justify-between p-3 bg-white hover:bg-[var(--color-brand-light)]/30 rounded-2xl transition-all group border border-gray-50 hover:border-[var(--color-brand-accent)]/10">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-gray-50 rounded-xl overflow-hidden shrink-0 flex items-center justify-center relative shadow-inner">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          ) : (
            <ImageIcon className="w-6 h-6 text-gray-300" />
          )}
        </div>
        <div>
          <h4 className="font-bold text-[var(--color-brand-dark)] text-lg leading-tight">{item.name}</h4>
          {item.price !== undefined && item.price > 0 ? (
            <p className="text-sm text-gray-500 font-semibold mt-0.5">R$ {item.price.toFixed(2).replace('.', ',')}</p>
          ) : item.variants && item.variants.length > 0 ? (
            <p className="text-sm text-[var(--color-brand-accent)] font-bold mt-0.5">Várias opções</p>
          ) : (
            <p className="text-sm text-gray-400 mt-0.5 italic">Consulte as opções</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 pr-2">
        <button 
          onClick={onDelete}
          className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
          title="Excluir"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <button 
          onClick={onEdit}
          className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--color-brand-accent)] text-white hover:scale-110 transition-all shadow-md shadow-[var(--color-brand-accent)]/20"
          title="Editar"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
