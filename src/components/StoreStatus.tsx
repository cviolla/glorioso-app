"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useStoreStatusStore } from "@/store/storeStatusStore";
import { supabase } from "@/lib/supabase";

export function StoreStatus({ className = "" }: { className?: string }) {
  const router = useRouter();
  const { getIsOpen, fetchStatus, isAutoMode, isManualOpen } = useStoreStatusStore();
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0); // Força re-render a cada minuto

  useEffect(() => {
    fetchStatus().then(() => setLoading(false));

    // Subscribe to real-time changes
    const channel = supabase
      .channel('store_config_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'store_config',
          filter: 'id=eq.1',
        },
        () => {
          fetchStatus().then(() => {
            router.refresh();
            setTick(t => t + 1); // Força re-render local
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStatus, router]);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return null;

  const isOpen = getIsOpen();

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

