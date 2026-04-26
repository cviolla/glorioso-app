"use client";

import { useState } from 'react';
import { menuData, MenuItem, MenuCategory } from '@/data/menu';
import { Search, Plus, Edit2, ChevronDown, ChevronUp, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminProductsPage() {
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<MenuCategory[]>(menuData);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(menuData[0].id);

  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const handleEditClick = (item: MenuItem) => {
    setEditingItem(item);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#381010]">Gerenciar Produtos</h2>
          <p className="text-sm text-gray-500 mt-1">Altere preços, nomes e descrições do cardápio.</p>
        </div>
        <button className="bg-[#ff914a] text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 w-full md:w-auto shadow-sm hover:bg-[#e07d3c] transition-colors">
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
                    {/* Render subcategories if any */}
                    {category.subcategories?.map(sub => (
                      <div key={sub.name} className="mt-4 first:mt-0">
                        <h4 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">{sub.name}</h4>
                        <div className="space-y-3">
                          {sub.items.filter(item => item.name.toLowerCase().includes(search.toLowerCase())).map(item => (
                            <ProductListItem key={item.id} item={item} onEdit={() => handleEditClick(item)} />
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Render direct items if any */}
                    {category.items?.filter(item => item.name.toLowerCase().includes(search.toLowerCase())).map(item => (
                      <ProductListItem key={item.id} item={item} onEdit={() => handleEditClick(item)} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Edit Modal Overlay */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center items-center p-0 md:p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setEditingItem(null)}
            />
            <motion.div 
              initial={{ y: '100%' }} 
              animate={{ y: 0 }} 
              exit={{ y: '100%' }} 
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white w-full md:w-full md:max-w-md rounded-t-3xl md:rounded-3xl shadow-2xl relative z-10 flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-xl text-[#381010]">Editar Produto</h3>
                <button onClick={() => setEditingItem(null)} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 font-bold hover:bg-gray-200">
                  ✕
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <div className="space-y-5">
                  {/* Fake Image Uploader */}
                  <div className="h-32 w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 gap-2 cursor-pointer hover:bg-gray-100 transition-colors">
                    <ImageIcon className="w-8 h-8" />
                    <span className="text-sm font-medium">Alterar foto do produto</span>
                  </div>

                  <div>
                    <label className="text-sm font-bold text-[#381010] mb-1 block">Nome do Produto</label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-[#ff914a] focus:ring-1 focus:ring-[#ff914a] text-[#381010] bg-white text-[16px]"
                      defaultValue={editingItem.name} 
                    />
                  </div>

                  {editingItem.description && (
                    <div>
                      <label className="text-sm font-bold text-[#381010] mb-1 block">Descrição</label>
                      <textarea 
                        className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-[#ff914a] focus:ring-1 focus:ring-[#ff914a] text-[#381010] bg-white text-[16px] resize-none h-24"
                        defaultValue={editingItem.description} 
                      />
                    </div>
                  )}

                  {editingItem.price !== undefined && (
                    <div>
                      <label className="text-sm font-bold text-[#381010] mb-1 block">Preço Base (R$)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:border-[#ff914a] focus:ring-1 focus:ring-[#ff914a] text-[#381010] bg-white text-[16px]"
                        defaultValue={editingItem.price} 
                      />
                    </div>
                  )}

                  <div className="bg-[#ff914a]/10 text-[#ff914a] p-4 rounded-xl text-sm font-medium">
                    ⚠️ Esta é apenas a interface visual. As edições ainda não serão salvas permanentemente até conectarmos ao banco de dados.
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 bg-white md:rounded-b-3xl">
                <button 
                  className="w-full bg-[#ff914a] text-white py-4 rounded-xl font-bold shadow-md shadow-[#ff914a]/20 hover:bg-[#e07d3c] transition-colors"
                  onClick={() => setEditingItem(null)}
                >
                  Salvar Alterações
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Subcomponent for Product List Item
function ProductListItem({ item, onEdit }: { item: MenuItem, onEdit: () => void }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200 rounded-xl transition-all group">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
          <ImageIcon className="w-5 h-5 text-gray-400" />
        </div>
        <div>
          <h4 className="font-bold text-[#381010]">{item.name}</h4>
          {item.price !== undefined ? (
            <p className="text-sm text-gray-500 font-medium">R$ {item.price.toFixed(2).replace('.', ',')}</p>
          ) : item.variants ? (
            <p className="text-sm text-gray-500 font-medium">Múltiplos tamanhos</p>
          ) : null}
        </div>
      </div>
      <button 
        onClick={onEdit}
        className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-gray-200 text-gray-600 hover:text-[#ff914a] hover:border-[#ff914a] transition-colors shadow-sm"
      >
        <Edit2 className="w-4 h-4" />
      </button>
    </div>
  );
}
