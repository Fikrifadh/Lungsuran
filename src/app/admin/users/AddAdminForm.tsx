"use client";

import { useState } from "react";
import { UserPlus, Mail, Lock, Loader2 } from "lucide-react";
import { createAdminUser } from "./actions";

export default function AddAdminForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    try {
      await createAdminUser(formData);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setError(err.message || "Gagal menambahkan admin");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
      <h3 className="font-black text-slate-800 flex items-center gap-2 mb-6">
        <UserPlus className="w-5 h-5 text-[#00519E]" /> Tambah Anggota Tim
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-xl border border-red-100">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Tim</label>
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#00519E] transition-colors" />
            <input
              type="email"
              name="email"
              required
              placeholder="email@perusahaan.com"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-3 outline-none focus:border-[#00519E] text-sm font-medium transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password Awal</label>
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#00519E] transition-colors" />
            <input
              type="text"
              name="password"
              required
              placeholder="Buatkan password..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-3 outline-none focus:border-[#00519E] text-sm font-medium transition-colors"
            />
          </div>
          <p className="text-[9px] text-slate-400 ml-1">
            Berikan password ini ke anggota tim Anda agar mereka bisa login.
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 bg-[#00519E] text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#003d76] transition-all active:scale-95 disabled:opacity-60"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isLoading ? 'Menyimpan...' : 'Tambahkan Admin'}
        </button>
      </form>
    </div>
  );
}
