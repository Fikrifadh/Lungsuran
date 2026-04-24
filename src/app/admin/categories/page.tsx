import prisma from "@/lib/db";
import Link from "next/link";
import { LayoutDashboard, Package, Layers, Settings, LogOut } from "lucide-react";
import CategoriesClient from "./CategoriesClient";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar — sama dengan dashboard */}
      <aside className="w-64 bg-[#00519E] text-white flex flex-col shadow-xl shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="bg-white p-1 rounded-md">
            <LayoutDashboard className="w-6 h-6 text-[#00519E]" />
          </div>
          <span className="text-xl font-bold">Admin Badr</span>
        </div>
        <nav className="flex-1 p-4 space-y-1 mt-4">
          <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3 px-2">Menu Utama</p>
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl font-medium text-white/80 transition-all">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </Link>
          <Link href="/admin/products/new" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl font-medium text-white/80 transition-all">
            <Package className="w-5 h-5" /> Produk
          </Link>
          <Link href="/admin/categories" className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-xl font-bold transition-all">
            <Layers className="w-5 h-5" /> Kategori
          </Link>
          <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-8 mb-3 px-2">Sistem</p>
          <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl font-medium text-white/80 transition-all">
            <Settings className="w-5 h-5" /> Pengaturan WA
          </Link>
        </nav>
        <div className="p-4 border-t border-white/10">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 text-red-300 hover:bg-red-900/20 rounded-xl font-medium transition-all">
            <LogOut className="w-5 h-5" /> Keluar ke Katalog
          </Link>
        </div>
      </aside>

      {/* Konten */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center px-8 shrink-0">
          <div>
            <h1 className="text-2xl font-black text-slate-800">Manajemen Kategori</h1>
            <p className="text-slate-500 text-sm">Kelola kategori produk yang tampil di katalog.</p>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          <CategoriesClient initialCategories={categories} />
        </div>
      </main>
    </div>
  );
}
