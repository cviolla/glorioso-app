"use client";

import { useState } from "react";
import { Menu, X, ChevronRight } from "lucide-react";
import { menuData } from "@/data/menu";
import { motion, AnimatePresence } from "framer-motion";

export function Sidebar({ onSelectCategory }: { onSelectCategory: (id: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (id: string) => {
    onSelectCategory(id);
    setIsOpen(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-40 bg-[#532120] text-[#f8ece3] p-3 rounded-full shadow-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 w-3/4 max-w-sm bg-[#f8ece3] shadow-2xl z-50 flex flex-col overflow-y-auto"
            >
              <div className="flex justify-between items-center p-6 bg-[#532120] text-[#f8ece3]">
                <h2 className="text-xl font-bold">Cardápio</h2>
                <button onClick={() => setIsOpen(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 py-4">
                {menuData.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleSelect(category.id)}
                    className="w-full flex items-center justify-between px-6 py-4 border-b border-[#381010]/10 hover:bg-[#ff914a]/10 transition-colors"
                  >
                    <span className="font-bold text-[#381010]">{category.name}</span>
                    <ChevronRight className="w-5 h-5 text-[#954e3a]" />
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
