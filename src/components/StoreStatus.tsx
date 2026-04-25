"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export function StoreStatus({ className = "" }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = () => {
      // Create a date object with Brasília timezone
      const date = new Date();
      const options = { timeZone: "America/Sao_Paulo", hour12: false };
      const brTimeStr = date.toLocaleString("en-US", options);
      const brDate = new Date(brTimeStr);
      
      const day = brDate.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, ...
      const hour = brDate.getHours();

      // Closed on Mondays
      if (day === 1) {
        setIsOpen(false);
      } else {
        // Open from 15:00 to 23:59
        if (hour >= 15 && hour < 24) {
          setIsOpen(true);
        } else {
          setIsOpen(false);
        }
      }
      setLoading(false);
    };

    checkStatus();
    const interval = setInterval(checkStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) return null;

  return (
    <div className={`flex justify-center ${className}`}>
      <div 
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold shadow-md border-2 ${
          isOpen 
            ? "bg-[#25D366] text-white border-[#25D366]" 
            : "bg-gray-800 text-gray-200 border-gray-600"
        } animate-blink`}
      >
        <Clock className="w-4 h-4" />
        {isOpen ? "LOJA ABERTA" : "LOJA FECHADA"}
      </div>
    </div>
  );
}

