"use client";

import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";
import { useStoreStatusStore } from "@/store/storeStatusStore";
import { supabase } from "@/lib/supabase";

export function StoreStatus({ className = "" }: { className?: string }) {
  const { fetchStatus, isManualOpen } = useStoreStatusStore();
  const [loading, setLoading] = useState(true);
  // Tick forces re-render every minute to recompute time-based open/close logic
  const [tick, setTick] = useState(0);
  const subscribedRef = useRef(false);

  // Initial fetch — runs only once on mount
  useEffect(() => {
    fetchStatus().then(() => {
      setLoading(false);
    });
  }, [fetchStatus]);

  // Realtime subscription — separate effect so it never re-subscribes on state changes
  useEffect(() => {
    if (subscribedRef.current) return;
    subscribedRef.current = true;

    const channel = supabase
      .channel('store_config_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'store_config',
        },
        (payload) => {
          const { is_manual_open } = payload.new;
          if (is_manual_open !== undefined) {
            useStoreStatusStore.setState({ isManualOpen: is_manual_open });
            setTick(t => t + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      subscribedRef.current = false;
    };
  // Empty deps — subscribe once for the lifetime of this component mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-render every minute (for time-based open/close logic)
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60_000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return null;

  const isOpen = isManualOpen;

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
