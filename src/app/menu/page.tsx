"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Loader2 } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { StoreStatus } from "@/components/StoreStatus";
import { ProductCard } from "@/components/ProductCard";
import { MenuItem, MenuCategory, artesanalAddons, traditionalAddons } from "@/data/menu";
import { supabase } from "@/lib/supabase";

export default function MenuPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const observerRef = useRef<IntersectionObserver | null>(null);

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    try {
      const { data: cats } = await supabase.from('categories').select('*').order('sort_order');
      const { data: subs } = await supabase.from('subcategories').select('*').order('sort_order');
      const { data: prods } = await supabase.from('products').select('*').order('sort_order');
      const { data: vars } = await supabase.from('product_variants').select('*').order('sort_order');
      
      if (cats && prods) {
        const assembled: MenuCategory[] = cats.map(cat => {
          const isBurgerCategory = cat.name === 'HAMBURGUER' || cat.name === 'ARTESANAIS';
          
          const addonsToUse = cat.name === 'ARTESANAIS' ? artesanalAddons : (cat.name === 'HAMBURGUER' ? traditionalAddons : undefined);
          
          const catProds = prods.filter(p => p.category_id === cat.id && !p.subcategory_id);
          const catSubs = subs?.filter(s => s.category_id === cat.id).map(sub => ({
            name: sub.name,
            items: prods.filter(p => p.subcategory_id === sub.id).map(p => ({
              id: p.id,
              name: p.name,
              description: p.description,
              price: p.price,
              imageUrl: p.image_url,
              addons: addonsToUse,
              variants: vars?.filter(v => v.product_id === p.id).map(v => ({
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
              addons: addonsToUse,
              variants: vars?.filter(v => v.product_id === p.id).map(v => ({
                name: v.name,
                price: v.price
              }))
            })),
            subcategories: catSubs
          };
        });
        setCategories(assembled);
        if (assembled.length > 0) {
          setActiveCategory(assembled[0].id);
        }
      }
    } catch (err) {
      console.error("Erro ao carregar cardápio:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  // Intersection Observer for scroll spy
  useEffect(() => {
    if (searchQuery || categories.length === 0) return;

    observerRef.current = new IntersectionObserver((entries) => {
      const visibleEntries = entries.filter(entry => entry.isIntersecting);
      if (visibleEntries.length > 0) {
        const topEntry = visibleEntries.reduce((prev, curr) => {
          return prev.boundingClientRect.top < curr.boundingClientRect.top ? prev : curr;
        });
        
        const visibleCategoryId = topEntry.target.id.replace('category-', '');
        setActiveCategory(visibleCategoryId);
        
        const btn = document.getElementById(`nav-btn-${visibleCategoryId}`);
        if (btn) {
          btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }
    }, {
      rootMargin: '-100px 0px -70% 0px',
      threshold: 0
    });

    categories.forEach(category => {
      const el = document.getElementById(`category-${category.id}`);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [searchQuery, categories]);

  const scrollToCategory = (categoryId: string) => {
    setActiveCategory(categoryId);
    setSearchQuery("");
    
    setTimeout(() => {
      const el = document.getElementById(`category-${categoryId}`);
      if (el) {
        const yOffset = -90; 
        const y = el.getBoundingClientRect().top + window.scrollY + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 50);
  };

  const allItems = categories.flatMap(category => {
    let items: MenuItem[] = [];
    if (category.items) items = [...items, ...category.items];
    if (category.subcategories) {
      category.subcategories.forEach(sub => {
        items = [...items, ...sub.items];
      });
    }
    return items;
  });

  const filteredItems = searchQuery 
    ? allItems.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearchClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 400);
  };

  return (
    <div className="min-h-screen font-sans pb-6 pt-4 px-4 relative bg-[#fff5e9]">
      {/* Background Image Pattern */}
      <div 
        className="fixed inset-0 z-0 opacity-25 pointer-events-none"
        style={{ 
          backgroundImage: "url('/GB1.png?v=2')",
          backgroundRepeat: 'repeat',
          backgroundSize: '320px',
          backgroundAttachment: 'fixed'
        }}
      />
      
      {/* Sticky Top Category Navigation */}
      {!loading && categories.length > 0 && !searchQuery && (
        <nav className="sticky top-0 z-40 -mx-4 px-4 py-4 mb-6 overflow-x-auto whitespace-nowrap no-scrollbar backdrop-blur-md bg-[#fff5e9]/10">
          <div className="flex gap-3 max-w-md mx-auto">
            {categories.map(category => (
              <button
                key={category.id}
                id={`nav-btn-${category.id}`}
                onClick={() => scrollToCategory(category.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all shrink-0 ${
                  activeCategory === category.id
                    ? "bg-[#532120] text-[#ff914a] shadow-md scale-105"
                    : "bg-white text-[#532120] border border-[#532120]/20 hover:bg-[#532120]/5"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </nav>
      )}

      <main className="max-w-md mx-auto relative">
        {/* Top Info Bar */}
        <div className="flex justify-between items-center mb-4 px-1">
          <a 
            href="https://www.instagram.com/gloriosobrownie/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[#381010] hover:text-[#ff914a] transition-all active:scale-95"
          >
            <div className="bg-[#532120] p-1.5 rounded-lg shadow-sm">
              <svg 
                className="w-4 h-4 text-[#f8ece3]" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                viewBox="0 0 24 24"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </div>
            <span className="text-[15px] font-black lowercase tracking-tighter text-[#532120]">@gloriosobrownie</span>
          </a>
          <StoreStatus className="!justify-end" />
        </div>

        {/* Search Bar */}
        <div className="relative mb-6 shadow-lg rounded-2xl overflow-hidden bg-white/90 backdrop-blur-md border-2 border-[#f8ece3] focus-within:border-[#ff914a] transition-all group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#532120]/40 w-5 h-5 group-focus-within:text-[#ff914a] transition-colors" />
          <input 
            ref={searchInputRef}
            type="text"
            placeholder="O que você deseja hoje?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-4 pl-12 pr-12 bg-transparent outline-none text-[#381010] placeholder:text-[#532120]/30 font-bold text-sm"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-all"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          )}
        </div>

        {/* Dynamic Section (Search vs Full List) */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#532120]/40 gap-3">
            <Loader2 className="w-10 h-10 animate-spin" />
            <p className="font-bold">Carregando cardápio...</p>
          </div>
        ) : searchQuery ? (
          <div className="pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-black text-[#381010] mb-6 flex items-center gap-2 border-b-2 border-[#954e3a] pb-2">
              Resultados para "{searchQuery}"
            </h2>

            {filteredItems.length > 0 ? (
              <div className="flex flex-col gap-1">
                {filteredItems.map(item => (
                  <ProductCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-[#954e3a] font-black uppercase tracking-widest text-xs">Nenhum produto encontrado</p>
                <button 
                  onClick={() => setSearchQuery("")}
                  className="mt-4 text-[var(--color-brand-accent)] font-bold text-sm hover:underline"
                >
                  Limpar busca
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="pt-2 flex flex-col gap-10">
            {categories.map(category => (
              <div key={category.id} id={`category-${category.id}`} className="scroll-mt-24">
                <h2 className="text-2xl font-black text-[#381010] mb-6 flex items-center justify-between border-b-2 border-[#954e3a] pb-2">
                  {category.name}
                  <img 
                    src="/logo glorioso brownie 3.png" 
                    alt="Logo Glorioso Brownie" 
                    className="h-[13px] sm:h-[18px] object-contain"
                  />
                </h2>

                {category.items && category.items.map(item => (
                  <ProductCard key={item.id} item={item} />
                ))}

                {category.subcategories && category.subcategories.map((sub, idx) => (
                  <div key={idx} className="mt-8 mb-4">
                    <h3 className="text-lg font-bold text-[#954e3a] mb-4 bg-[#f8ece3] sticky top-[72px] z-20 py-2 border-l-4 border-[#ff914a] pl-3">
                      {sub.name}
                    </h3>
                    {sub.items.map(item => (
                      <ProductCard key={item.id} item={item} />
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav onSearchClick={handleSearchClick} />
    </div>
  );
}
