// Server Component — ambil data produk dari database berdasarkan ID dari URL
export const dynamic = 'force-dynamic';
import prisma from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ShieldCheck, Share2 } from 'lucide-react';
import ProductDetailClient from './ProductDetailClient';
import { parseImages } from '@/lib/image-utils';

function formatRupiah(price: number) {
  return 'Rp ' + price.toLocaleString('id-ID');
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Ambil produk milik ID ini
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!product) notFound();

  // Ambil produk lain (bukan yang ini) untuk seksi "Lihat Juga"
  const related = await prisma.product.findMany({
    where: {
      id: { not: id },
      status: 'AVAILABLE',
    },
    take: 4,
    orderBy: { createdAt: 'desc' },
    include: { category: true },
  });

  // Ambil setting nomor WA
  const [phoneRow, msgRow] = await Promise.all([
    prisma.setting.findUnique({ where: { key: 'wa_phone' } }),
    prisma.setting.findUnique({ where: { key: 'wa_message_template' } }),
  ]);

  const waPhone = phoneRow?.value || '6281234567890';
  const waTemplate = msgRow?.value || 'Halo Admin Lungsuran! 👋\n\nSaya tertarik dengan produk *{nama_produk}* seharga *{harga}*.\n\nApakah masih tersedia? Terima kasih!';

  const images = parseImages(product.images);

  const waMessage = encodeURIComponent(
    waTemplate
      .replace('{nama_produk}', product.name)
      .replace('{harga}', formatRupiah(product.price))
  );
  const waUrl = `https://wa.me/${waPhone}?text=${waMessage}`;

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 md:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-[#00519E] font-bold transition-all">
            <ArrowLeft className="w-5 h-5" /> <span className="hidden sm:inline">Kembali ke Katalog</span>
          </Link>
          <span className="font-black text-slate-800 text-sm sm:text-base truncate max-w-[200px] sm:max-w-sm">
            {product.name}
          </span>
          <button className="p-2 hover:bg-slate-100 rounded-full transition-all" title="Share">
            <Share2 className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Kolom Kiri: Galeri Foto — perlu "use client" untuk slider, pakai komponen terpisah */}
          <ProductDetailClient
            images={images}
            productName={product.name}
            status={product.status}
          />

          {/* Kolom Kanan: Info Produk */}
          <div className="flex flex-col">
            {/* Kategori + Status */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="bg-blue-50 text-[#00519E] text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
                {product.category.name}
              </span>
              {product.status === 'AVAILABLE' ? (
                <span className="bg-green-50 text-green-700 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Tersedia
                </span>
              ) : (
                <span className="bg-red-50 text-red-700 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
                  Terjual
                </span>
              )}
            </div>

            {/* Nama Produk */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-800 leading-tight mb-4">
              {product.name}
            </h1>

            {/* Harga */}
            <div className="text-3xl sm:text-4xl font-black text-[#00519E] mb-8">
              {formatRupiah(product.price)}
            </div>

            {/* Trust Signals */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <ShieldCheck className="w-5 h-5 text-[#00519E] shrink-0" />
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase">Kondisi</div>
                  <div className="text-xs font-bold text-slate-700">Terjamin (Badr)</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-5 h-5 shrink-0 flex items-center justify-center text-lg">🏢</div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase">Penjual</div>
                  <div className="text-xs font-bold text-slate-700">Badr Interactive</div>
                </div>
              </div>
            </div>

            {/* Deskripsi */}
            <div className="mb-10">
              <h3 className="text-base font-black text-slate-800 mb-3 border-b border-slate-100 pb-2">
                Deskripsi Produk
              </h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-sm font-medium">
                {product.description}
              </p>
            </div>

            {/* CTA WhatsApp */}
            <div className="mt-auto pt-4">
              {product.status === 'SOLD' ? (
                <div className="w-full py-5 rounded-3xl font-black text-xl text-center bg-slate-100 text-slate-400">
                  Produk Sudah Terjual
                </div>
              ) : (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#00519E] text-white py-5 rounded-3xl font-black text-xl flex items-center justify-center gap-3 hover:bg-[#003d76] transition-all shadow-2xl shadow-blue-100 active:scale-95"
                >
                  <span className="text-2xl">📱</span>
                  Beli via WhatsApp
                </a>
              )}
              <p className="text-center text-[11px] font-bold text-slate-400 mt-4 uppercase tracking-widest">
                Klik untuk diarahkan langsung ke Admin Badr
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Lihat Juga */}
      {related.length > 0 && (
        <section className="bg-slate-50 mt-16 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#00519E] rounded-full" />
              Lihat Juga
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map(rel => {
                const relParsedImages = parseImages(rel.images);
                const relImage = relParsedImages.length > 0 ? relParsedImages[0] : '';
                return (
                  <Link
                    key={rel.id}
                    href={`/products/${rel.id}`}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-blue-100 transition-all group"
                  >
                    <div className="relative aspect-square bg-slate-100">
                      {relImage ? (
                        <Image
                          src={relImage}
                          alt={rel.name}
                          fill
                          sizes="(max-width: 640px) 50vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          unoptimized={true}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl text-slate-200">📦</div>
                      )}
                    </div>
                    <div className="p-3">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        {rel.category.name}
                      </span>
                      <h3 className="font-bold text-slate-800 text-sm mt-0.5 line-clamp-2 group-hover:text-[#00519E] transition-colors">
                        {rel.name}
                      </h3>
                      <div className="font-black text-[#00519E] text-sm mt-1">
                        {formatRupiah(rel.price)}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
