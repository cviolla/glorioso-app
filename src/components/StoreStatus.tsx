"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { useStoreStatusStore } from "@/store/storeStatusStore";

export function StoreStatus({ className = "" }: { className?: string }) {
  const { getIsOpen } = useStoreStatusStore();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updateStatus = () => {
      setIsOpen(getIsOpen());
      setLoading(false);
    };

    updateStatus();
    const interval = setInterval(updateStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [getIsOpen]);

  if (loading) return null;

  return (
    <div className={`flex justify-center ${className}`}>
      <div 
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold shadow-md border-2 ${
          isOpen 
            ? "bg-[#25D366] text-white border-[#25D366]" 
            : "bg-gray-800 text-gray-200 border-gray-600"
        } ${isOpen ? "animate-blink" : ""}`}
      >
        <Clock className="w-4 h-4" />
        {isOpen ? "LOJA ABERTA" : "LOJA FECHADA"}
      </div>
    </div>
  );
}

