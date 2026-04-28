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

  const { isAutoMode, isManualOpen, toggleAutoMode, setManualOpen, getIsOpen } = useStoreStatusStore();
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
      {/* Store Status Control */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#ff914a]/10 rounded-xl flex items-center justify-center">
            <Settings className="w-6 h-6 text-[#ff914a]" />
          </div>
          <div>
            <h3 className="font-bold text-[#381010] text-lg">Configurações da Loja</h3>
            <p className="text-sm text-gray-500">Controle o funcionamento do cardápio.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <span className="block font-bold text-[#381010] text-sm">Horário Automático</span>
                <span className="text-xs text-gray-500 uppercase font-bold tracking-tight">15:00 - 00:00 (Ter-Dom)</span>
              </div>
            </div>
            <button 
              onClick={toggleAutoMode}
              className={`w-12 h-6 rounded-full relative transition-colors ${isAutoMode ? 'bg-[#25D366]' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isAutoMode ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <div className={`flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 transition-opacity ${isAutoMode ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <div className="flex items-center gap-3">
              <Power className={`w-5 h-5 ${isManualOpen ? 'text-[#25D366]' : 'text-red-500'}`} />
              <div>
                <span className="block font-bold text-[#381010] text-sm">Status Manual</span>
                <span className={`text-xs uppercase font-bold tracking-tight ${isManualOpen ? 'text-[#25D366]' : 'text-red-500'}`}>
                  {isManualOpen ? 'Forçar Loja Aberta' : 'Forçar Loja Fechada'}
                </span>
              </div>
            </div>
            <button 
              onClick={() => setManualOpen(!isManualOpen)}
              className={`w-12 h-6 rounded-full relative transition-colors ${isManualOpen ? 'bg-[#25D366]' : 'bg-red-500'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isManualOpen ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>

        <div className={`mt-4 p-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold shadow-inner ${
          currentStatus ? 'bg-[#25D366]/10 text-[#25D366]' : 'bg-gray-100 text-gray-500'
        }`}>
          <div className={`w-2 h-2 rounded-full ${currentStatus ? 'bg-[#25D366] animate-pulse' : 'bg-gray-400'}`} />
          STATUS ATUAL: {currentStatus ? 'LOJA ABERTA' : 'LOJA FECHADA'}
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#381010]">Gerenciar Produtos</h2>
          <p className="text-sm text-gray-500 mt-1">Altere preços, nomes e descrições do cardápio.</p>
        </div>
        <button 
          onClick={handleNewClick}
          className="bg-[#ff914a] text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 w-full md:w-auto shadow-sm hover:bg-[#e07d3c] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Produto
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Buscar produto por nome..." 
          className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-[#ff914a] focus:ring-1 focus:ring-[#ff914a] text-[#381010] text-[16px] transition-all"
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
            <div key={category.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <button 
                className="w-full px-5 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
              >
                <h3 className="font-bold text-[#381010] text-lg">{category.name}</h3>
                {expandedCategory === category.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
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
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-xl text-[#381010]">{isNewProduct ? 'Novo Produto' : 'Editar Produto'}</h3>
                <button 
                  onClick={() => setEditingItem(null)} 
                  disabled={saving}
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 font-bold hover:bg-gray-200"
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
                      <label className="text-sm font-bold text-[#381010] mb-1 block">Categoria</label>
                      <select 
                        className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-[#ff914a] focus:ring-1 focus:ring-[#ff914a] text-[#381010] bg-white text-[16px]"
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
                    <label className="text-sm font-bold text-[#381010] mb-1 block">Nome do Produto</label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-[#ff914a] focus:ring-1 focus:ring-[#ff914a] text-[#381010] bg-white text-[16px]"
                      value={editingItem.name} 
                      onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-[#381010] mb-1 block">Descrição</label>
                    <textarea 
                      className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-[#ff914a] focus:ring-1 focus:ring-[#ff914a] text-[#381010] bg-white text-[16px] resize-none h-24"
                      value={editingItem.description || ''} 
                      onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                      placeholder="Ex: pão, carne, queijo..."
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-bold text-[#381010] mb-1 block">Preço Base (R$)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-[#ff914a] focus:ring-1 focus:ring-[#ff914a] text-[#381010] bg-white text-[16px]"
                      value={editingItem.price || 0} 
                      onChange={(e) => setEditingItem({...editingItem, price: parseFloat(e.target.value)})}
                      disabled={saving}
                    />
                    <p className="text-xs text-gray-400 mt-1 uppercase font-bold">Use 0 se o produto tiver tamanhos abaixo</p>
                  </div>

                  {/* Variants Manager */}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm font-bold text-[#381010]">Tamanhos / Variações</label>
                      <button 
                        type="button"
                        onClick={() => {
                          const vars = [...(editingItem.variants || [])];
                          vars.push({ name: '', price: 0 } as any);
                          setEditingItem({...editingItem, variants: vars});
                        }}
                        className="text-xs bg-[#ff914a]/10 text-[#ff914a] px-3 py-1.5 rounded-lg font-bold hover:bg-[#ff914a]/20 transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Add Tamanho
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

              <div className="p-4 border-t border-gray-100 bg-white md:rounded-b-3xl">
                <button 
                  className="w-full bg-[#ff914a] text-white py-4 rounded-xl font-bold shadow-md shadow-[#ff914a]/20 hover:bg-[#e07d3c] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  onClick={handleSaveProduct}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {isNewProduct ? 'Criar Produto' : 'Salvar Alterações'}
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
    <div className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200 rounded-xl transition-all group">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden shrink-0 flex items-center justify-center relative">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-5 h-5 text-gray-400" />
          )}
        </div>
        <div>
          <h4 className="font-bold text-[#381010]">{item.name}</h4>
          {item.price !== undefined && item.price > 0 ? (
            <p className="text-sm text-gray-500 font-medium">R$ {item.price.toFixed(2).replace('.', ',')}</p>
          ) : item.variants && item.variants.length > 0 ? (
            <p className="text-sm text-[#ff914a] font-bold">Múltiplos tamanhos</p>
          ) : (
            <p className="text-sm text-gray-400">Preço não definido</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={onDelete}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-500 transition-colors shadow-sm"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <button 
          onClick={onEdit}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-gray-200 text-gray-600 hover:text-[#ff914a] hover:border-[#ff914a] transition-colors shadow-sm"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
