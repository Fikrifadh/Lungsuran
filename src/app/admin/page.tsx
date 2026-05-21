// Server Component — ambil data dari database
export const dynamic = 'force-dynamic';

import { 
  LayoutDashboard, Package, Layers, Settings, LogOut, Plus, CheckCircle2, Clock, TrendingUp, Users
} from 'lucide-react';
import prisma from '@/lib/db';
import Link from 'next/link';
import ProductActionsTable from './ProductActionsTable';
import LogoutButton from './LogoutButton';
import { getServerSession } from 'next-auth/next';

export default async function AdminDashboard() {
  const session = await getServerSession();
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    }),
    prisma.category.findMany(),
  ]);

  const totalAvailable = products.filter(p => p.status === 'AVAILABLE').length;
  const totalSold = products.filter(p => p.status === 'SOLD').length;

  const stats = [
    { label: 'Total Produk',    value: products.length,    icon: Package,       color: 'bg-blue-500' },
    { label: 'Tersedia',        value: totalAvailable,      icon: CheckCircle2,  color: 'bg-green-500' },
    { label: 'Terjual (Sold)', value: totalSold,            icon: Clock,         color: 'bg-red-500' },
    { label: 'Total Kategori', value: categories.length,    icon: Layers,        color: 'bg-purple-500' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#00519E] text-white flex flex-col shadow-xl shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="bg-white p-1 rounded-md">
            <LayoutDashboard className="w-6 h-6 text-[#00519E]" />
          </div>
          <span className="text-xl font-bold tracking-tight">Admin Badr</span>
        </div>

        <nav className="flex-1 p-4 space-y-1 mt-4">
          <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3 px-2">Menu Utama</p>
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-xl font-bold transition-all">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </Link>
          <Link href="/admin/products/new" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl font-medium transition-all text-white/80">
            <Package className="w-5 h-5" /> Produk
          </Link>
          <Link href="/admin/categories" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl font-medium transition-all text-white/80">
            <Layers className="w-5 h-5" /> Kategori
          </Link>

          <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-8 mb-3 px-2">Sistem</p>
          <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl font-medium transition-all text-white/80">
            <Users className="w-5 h-5" /> Manajemen Tim
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl font-medium transition-all text-white/80">
            <Settings className="w-5 h-5" /> Pengaturan WA
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <Link href="/" className="flex items-center justify-center gap-2 px-4 py-2 w-full text-white/80 hover:bg-white/10 rounded-xl font-medium transition-all text-sm">
             Lihat Katalog Publik
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div>
            <h1 className="text-2xl font-black text-slate-800">Dashboard Lungsuran</h1>
            <p className="text-slate-500 text-sm">Selamat datang kembali, {session?.user?.email || 'admin'}!</p>
          </div>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 bg-[#00519E] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#003d76] transition-all shadow-lg shadow-blue-100"
          >
            <Plus className="w-5 h-5" /> Tambah Produk
          </Link>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="relative z-10">
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white mb-4 shadow-md`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="text-3xl font-black text-slate-800">{stat.value}</div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</div>
                </div>
                <TrendingUp className="absolute bottom-6 right-6 w-12 h-12 text-slate-50 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>

          {/* Product Table — komponen client terpisah agar bisa ada interaksi */}
          <ProductActionsTable products={products.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            status: p.status,
            images: p.images,
            category: p.category.name,
          }))} />
        </div>
      </main>
    </div>
  );
}
