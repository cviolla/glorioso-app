"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, LogIn, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push("/admin/orders");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-brand-light)] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-[var(--color-brand-accent)]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[25rem] h-[25rem] bg-[var(--color-brand-accent)]/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(56,16,16,0.1)] overflow-hidden border border-white">
          <div className="p-12 text-center">
            <div className="w-32 h-32 mx-auto mb-8 relative">
              <img src="/GloriosoBrownie_Logo_fuul.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-[var(--color-brand-dark)] font-black text-3xl tracking-tight">Painel <span className="text-[var(--color-brand-accent)]">Admin</span></h1>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-3">Acesso Administrativo</p>
          </div>

          <form onSubmit={handleLogin} className="px-12 pb-12 space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-[var(--color-brand-dark)] text-[10px] font-black uppercase tracking-widest ml-1">E-mail</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-[var(--color-brand-accent)] transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl text-[var(--color-brand-dark)] font-bold outline-none focus:bg-white focus:border-[var(--color-brand-accent)]/20 focus:ring-4 focus:ring-[var(--color-brand-accent)]/5 transition-all"
                  placeholder="admin@glorioso.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[var(--color-brand-dark)] text-[10px] font-black uppercase tracking-widest ml-1">Senha</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-[var(--color-brand-accent)] transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border-2 border-transparent rounded-2xl text-[var(--color-brand-dark)] font-bold outline-none focus:bg-white focus:border-[var(--color-brand-accent)]/20 focus:ring-4 focus:ring-[var(--color-brand-accent)]/5 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--color-brand-accent)] text-white font-black py-5 rounded-2xl shadow-xl shadow-[var(--color-brand-accent)]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-4 uppercase tracking-widest text-sm"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Entrar no Sistema <LogIn className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>

      <footer className="mt-12 text-center relative z-10">
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">
          Created by <a href="https://instagram.com/cviolla" target="_blank" rel="noopener noreferrer" className="text-[var(--color-brand-accent)] hover:underline">@cviolla</a>
        </p>
        <p className="text-gray-300 text-[9px] font-medium">Copyright©2026-2027</p>
      </footer>
    </div>
  );
}
