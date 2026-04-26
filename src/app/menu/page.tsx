"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Loader2 } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { ProductCard } from "@/components/ProductCard";
import { MenuItem, MenuCategory } from "@/data/menu";
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
          const catProds = prods.filter(p => p.category_id === cat.id && !p.subcategory_id);
          const catSubs = subs?.filter(s => s.category_id === cat.id).map(sub => ({
            name: sub.name,
            items: prods.filter(p => p.subcategory_id === sub.id).map(p => ({
              id: p.id,
              name: p.name,
              description: p.description,
              price: p.price,
              imageUrl: p.image_url,
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

  return (
    <div className="min-h-screen bg-[#f8ece3] font-sans pb-24 pt-4 px-4">
      
      {/* Sticky Top Category Navigation */}
      {!loading && categories.length > 0 && (
        <nav className="sticky top-0 z-40 bg-[#f8ece3] -mx-4 px-4 py-4 mb-6 overflow-x-auto whitespace-nowrap no-scrollbar border-b border-[#381010]/10 shadow-[0_4px_10px_rgba(0,0,0,0.05)]">
          <div className="flex gap-3 max-w-md mx-auto">
            {categories.map(category => (
              <button
                key={category.id}
                id={`nav-btn-${category.id}`}
                onClick={() => scrollToCategory(category.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all shrink-0 ${
                  activeCategory === category.id && !searchQuery
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

      <main className="max-w-md mx-auto relative z-10">
        {/* Search Bar */}
        <div className="relative mb-6 shadow-sm rounded-2xl overflow-hidden bg-white border border-[#f8ece3] focus-within:border-[#ff914a] transition-colors">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#532120]/40 w-5 h-5" />
          <input 
            type="text"
            placeholder="Buscar lanches, pizzas, bebidas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-3 pl-12 pr-4 bg-transparent outline-none text-[#381010] placeholder:text-[#532120]/40 font-medium text-sm"
          />
        </div>

        {/* Dynamic Section (Search vs Full List) */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#532120]/40 gap-3">
            <Loader2 className="w-10 h-10 animate-spin" />
            <p className="font-bold">Carregando cardápio...</p>
          </div>
        ) : searchQuery ? (
          <div className="pt-2">
            <h2 className="text-xl font-black text-[#381010] mb-6 flex items-center gap-2 border-b-2 border-[#954e3a] pb-2">
              Resultados para "{searchQuery}"
            </h2>

            {filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <ProductCard key={item.id} item={item} />
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-[#954e3a] font-medium">Nenhum produto encontrado.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="pt-2 flex flex-col gap-10">
            {categories.map(category => (
              <div key={category.id} id={`category-${category.id}`} className="scroll-mt-24">
                <h2 className="text-2xl font-black text-[#381010] mb-6 flex items-center gap-2 border-b-2 border-[#954e3a] pb-2">
                  {category.name}
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

      <BottomNav />
    </div>
  );
}
