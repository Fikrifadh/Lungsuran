// INI ADALAH SERVER COMPONENT - Tidak boleh ada "use client"
// Prisma hanya boleh dipakai di sini (server side)
export const dynamic = 'force-dynamic';

import { Search, ShoppingBag, Phone, Menu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import prisma from '@/lib/db';
import { parseImages } from '@/lib/image-utils';

// Fungsi format harga Rupiah
function formatRupiah(price: number) {
  return 'Rp ' + price.toLocaleString('id-ID');
}

export default async function Home() {
  // Ambil data dari database (server side)
  let categories = [];
  let products = [];
  let waPhone = '6281234567890';
  let waTemplate = 'Halo Admin Lungsuran! Saya tertarik dengan produk *{nama_produk}* seharga *{harga}*. Apakah masih tersedia?';

  try {
    const [catData, prodData, phoneRow, msgRow] = await Promise.all([
      prisma.category.findMany({ where: { isActive: true }, orderBy: { createdAt: 'asc' } }),
      prisma.product.findMany({ take: 12, orderBy: { createdAt: 'desc' }, include: { category: true } }),
      prisma.setting.findUnique({ where: { key: 'wa_phone' } }),
      prisma.setting.findUnique({ where: { key: 'wa_message_template' } }),
    ]);
    categories = catData;
    products = prodData;
    if (phoneRow) waPhone = phoneRow.value;
    if (msgRow) waTemplate = msgRow.value;
  } catch (err: any) {
    return (
      <div className="p-10 bg-red-50 text-red-900 font-mono text-sm border-2 border-red-200 rounded-xl m-10">
        <h1 className="text-xl font-bold mb-4">Database Connection Error</h1>
        <p className="mb-4">Terjadi kesalahan saat menghubungkan ke database:</p>
        <pre className="bg-red-100 p-4 rounded overflow-auto max-h-96">
          {err.message || 'Unknown error'}
          {"\n\nStack:\n"}
          {err.stack}
        </pre>
        <p className="mt-4 text-xs">Coba periksa Environment Variables di Dashboard Vercel.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header - static, no interactivity needed */}
      <header className="sticky top-0 z-50 bg-[#00519E] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="bg-white p-1.5 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-[#00519E]" />
              </div>
              <span className="text-2xl font-bold tracking-tight">Lungsuran</span>
            </Link>

            <div className="flex-1 max-w-xl hidden md:flex">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                <input
                  type="text"
                  placeholder="Cari katalog Lungsuran..."
                  className="w-full bg-white/10 border border-white/20 rounded-full py-2 pl-10 pr-4 outline-none placeholder:text-white/60 text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/admin/login" className="hidden sm:block text-sm font-bold bg-white/10 hover:bg-white/20 px-4 py-1.5 rounded-full transition-all">
                Admin
              </Link>
              <Menu className="w-6 h-6 md:hidden" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Hero Banner */}
        <section className="mb-10 sm:mb-16 bg-gradient-to-br from-[#00519E] to-[#003d76] rounded-3xl p-8 sm:p-12 text-white overflow-hidden relative">
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-5xl font-black mb-4">Katalog Barang Berkualitas</h1>
            <p className="text-blue-100 text-lg max-w-2xl leading-relaxed">
              Temukan barang pilihan dari Badr. Harga transparan, kondisi terjamin, dan beli langsung via WhatsApp.
            </p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        </section>

        {/* Categories */}
        {categories.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-extrabold text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#00519E] rounded-full" />
              Pilih Kategori
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/?kategori=${cat.slug}`}
                  className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl hover:shadow-md hover:border-[#00519E] transition-all border border-slate-200 group"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform">📦</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-600 group-hover:text-[#00519E] text-center">{cat.name}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Products */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#00519E] rounded-full" />
              Barang Terbaru
            </h2>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-bold text-slate-600 mb-2">Belum Ada Produk</h3>
              <p className="text-slate-400">Admin belum menambahkan barang ke katalog.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => {
                const parsedImages = parseImages(product.images);
                const firstImage = parsedImages.length > 0 ? parsedImages[0] : '';
                const waMessage = encodeURIComponent(
                  waTemplate
                    .replace('{nama_produk}', product.name)
                    .replace('{harga}', formatRupiah(product.price))
                );
                return (
                  <div key={product.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 group">
                    {/* Image */}
                    <Link href={`/products/${product.id}`}>
                      <div className="relative aspect-square bg-slate-100">
                        {firstImage ? (
                          <Image
                            src={firstImage}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className={`object-cover group-hover:scale-105 transition-transform duration-500 ${product.status === 'SOLD' ? 'grayscale opacity-60' : ''}`}
                            unoptimized={true}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300 text-5xl">📦</div>
                        )}
                        {product.status === 'SOLD' ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <span className="px-5 py-2 bg-red-600 text-white font-black rounded-lg transform -rotate-12 border-2 border-white shadow-xl text-xl">SOLD</span>
                          </div>
                        ) : (
                          <div className="absolute top-3 left-3 px-3 py-1 bg-green-500 text-white text-[10px] font-black rounded-full uppercase">
                            READY
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="p-4">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.category.name}</span>
                      <Link href={`/products/${product.id}`}>
                        <h3 className="font-bold text-slate-800 mt-1 mb-2 group-hover:text-[#00519E] transition-colors leading-tight line-clamp-2">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="text-lg font-black text-[#00519E] mb-4">{formatRupiah(product.price)}</div>

                      {product.status === 'SOLD' ? (
                        <div className="w-full py-3 rounded-xl font-bold bg-slate-100 text-slate-400 text-center text-sm">
                          Sudah Terjual
                        </div>
                      ) : (
                        <a
                          href={`https://wa.me/${waPhone}?text=${waMessage}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-[#00519E] text-white hover:bg-[#003d76] shadow-md shadow-blue-100 transition-all"
                        >
                          <Phone className="w-4 h-4" fill="currentColor" />
                          Beli via WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t border-slate-200 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-[#00519E] p-1.5 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[#00519E]">Lungsuran</span>
          </div>
          <p className="text-slate-400 text-sm text-center">Etalase digital resmi Badr Interactive · © 2024</p>
          <Link href="/admin/login" className="text-sm font-bold text-slate-400 hover:text-[#00519E] transition-colors">
            Login Admin →
          </Link>
        </div>
      </footer>
    </div>
  );
}
