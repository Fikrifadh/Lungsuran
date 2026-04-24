"use client";

import { useState } from "react";
import { Layers, Plus, Trash2, ToggleLeft, ToggleRight, Loader2, Package } from "lucide-react";
import { createCategory, deleteCategory, toggleCategoryActive } from "../admin-actions";

type Category = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  _count: { products: number };
};

export default function CategoriesClient({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [newName, setNewName] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setIsAdding(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set("name", newName);
      await createCategory(fd);
      // Tambahkan ke daftar lokal tanpa reload
      setCategories(prev => [...prev, {
        id: Math.random().toString(),
        name: newName,
        slug: newName.toLowerCase().replace(/\s+/g, "-"),
        isActive: true,
        _count: { products: 0 },
      }]);
      setNewName("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menambah kategori");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoadingId(id);
    setError(null);
    try {
      await deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      setConfirmDeleteId(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menghapus kategori");
    } finally {
      setLoadingId(null);
    }
  };

  const handleToggle = async (cat: Category) => {
    setLoadingId(cat.id);
    setError(null);
    try {
      await toggleCategoryActive(cat.id, !cat.isActive);
      setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, isActive: !c.isActive } : c));
    } catch {
      setError("Gagal mengubah status kategori");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Form Tambah Kategori */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="font-black text-slate-800 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-[#00519E]" /> Tambah Kategori Baru
        </h2>
        <form onSubmit={handleAdd} className="flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Contoh: Tas & Dompet"
            className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-xl py-3 px-4 outline-none focus:border-[#00519E] font-medium transition-all"
            disabled={isAdding}
          />
          <button
            type="submit"
            disabled={isAdding || !newName.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-[#00519E] text-white font-bold rounded-xl hover:bg-[#003d76] transition-all disabled:opacity-50"
          >
            {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Tambah
          </button>
        </form>
        {error && (
          <div className="mt-3 text-sm text-red-600 font-semibold bg-red-50 px-4 py-2 rounded-lg">
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Daftar Kategori */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-black text-slate-800 flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#00519E]" /> Semua Kategori ({categories.length})
          </h2>
        </div>

        {categories.length === 0 ? (
          <div className="py-16 text-center">
            <Layers className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-bold">Belum ada kategori</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {categories.map(cat => {
              const isThisLoading = loadingId === cat.id;
              const isConfirming = confirmDeleteId === cat.id;

              return (
                <div key={cat.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors">
                  {/* Info Kategori */}
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${cat.isActive ? "bg-blue-50" : "bg-slate-100"}`}>
                      📦
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{cat.name}</span>
                        {!cat.isActive && (
                          <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-500 rounded-full font-bold uppercase">
                            Disembunyikan
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-400 font-medium">
                        <Package className="w-3 h-3" />
                        {cat._count.products} produk · /{cat.slug}
                      </div>
                    </div>
                  </div>

                  {/* Aksi */}
                  <div className="flex items-center gap-2">
                    {/* Toggle Tampilkan/Sembunyikan */}
                    <button
                      onClick={() => handleToggle(cat)}
                      disabled={!!loadingId}
                      title={cat.isActive ? "Sembunyikan dari katalog" : "Tampilkan di katalog"}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${
                        cat.isActive
                          ? "bg-green-50 text-green-700 hover:bg-green-100"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {isThisLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : cat.isActive ? (
                        <ToggleRight className="w-3.5 h-3.5" />
                      ) : (
                        <ToggleLeft className="w-3.5 h-3.5" />
                      )}
                      {cat.isActive ? "Aktif" : "Nonaktif"}
                    </button>

                    {/* Hapus dengan konfirmasi */}
                    {isConfirming ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(cat.id)}
                          disabled={isThisLoading}
                          className="px-3 py-1.5 rounded-lg text-xs font-black bg-red-600 text-white hover:bg-red-700 transition-all flex items-center gap-1 disabled:opacity-60"
                        >
                          {isThisLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                          Yakin?
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setError(null);
                          setConfirmDeleteId(cat.id);
                        }}
                        disabled={!!loadingId}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-all disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Hapus
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
