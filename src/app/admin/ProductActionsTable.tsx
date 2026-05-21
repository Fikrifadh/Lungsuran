"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Pencil, Trash2, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { deleteProduct, updateProductStatus } from './products/actions';
import { parseImages } from '@/lib/image-utils';

type Product = {
  id: string;
  name: string;
  price: number;
  status: string;
  images: string;
  category: string;
};

export default function ProductActionsTable({ products: initialProducts }: { products: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Toggle AVAILABLE <-> SOLD
  const handleToggleStatus = async (product: Product) => {
    if (loadingId) return;
    const newStatus = product.status === 'AVAILABLE' ? 'SOLD' : 'AVAILABLE';
    setLoadingId(product.id);
    try {
      await updateProductStatus(product.id, newStatus);
      setProducts(prev => prev.map(p =>
        p.id === product.id ? { ...p, status: newStatus } : p
      ));
    } catch (err) {
      console.error('Gagal update status:', err);
      alert('Gagal mengubah status produk.');
    } finally {
      setLoadingId(null);
    }
  };

  // Konfirmasi dulu baru hapus
  const handleDelete = async (productId: string) => {
    if (loadingId) return;
    setLoadingId(productId);
    try {
      await deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      setConfirmDeleteId(null);
    } catch (err) {
      console.error('Gagal hapus produk:', err);
      alert('Gagal menghapus produk.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
      {/* Header tabel */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-black text-slate-800">Semua Produk ({products.length})</h3>
        <Link href="/admin/products/new" className="text-sm font-bold text-[#00519E] hover:underline">
          + Tambah Baru
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="py-20 text-center">
          <div className="text-5xl mb-4">📦</div>
          <p className="font-bold text-slate-500">Belum ada produk.</p>
          <Link href="/admin/products/new" className="mt-4 inline-block text-sm font-bold text-[#00519E] hover:underline">
            Tambah produk pertama →
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">Produk</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Harga</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => {
                const parsedImages = parseImages(p.images);
                const firstImage = parsedImages.length > 0 ? parsedImages[0] : '';
                const isThisLoading = loadingId === p.id;
                const isConfirmingDelete = confirmDeleteId === p.id;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Nama Produk */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden relative shrink-0 border border-slate-200">
                          {firstImage ? (
                            <Image src={firstImage} alt={p.name} fill sizes="48px" className="object-cover" unoptimized={true} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                          )}
                        </div>
                        <span className="font-bold text-slate-700 text-sm max-w-[180px] line-clamp-2">{p.name}</span>
                      </div>
                    </td>

                    {/* Kategori */}
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold bg-slate-100 px-3 py-1 rounded-full text-slate-600">
                        {p.category}
                      </span>
                    </td>

                    {/* Harga */}
                    <td className="px-6 py-4 font-bold text-slate-700 text-sm whitespace-nowrap">
                      Rp {p.price.toLocaleString('id-ID')}
                    </td>

                    {/* Status — klik untuk toggle */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(p)}
                        disabled={!!loadingId}
                        title="Klik untuk ubah status"
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all disabled:opacity-60 ${
                          p.status === 'AVAILABLE'
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {isThisLoading ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : p.status === 'AVAILABLE' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {p.status === 'AVAILABLE' ? 'Tersedia' : 'Terjual'}
                      </button>
                    </td>

                    {/* Aksi */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        {/* Tombol Edit — arahkan ke /admin/products/[id] */}
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </Link>

                        {/* Tombol Hapus dengan konfirmasi */}
                        {isConfirmingDelete ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(p.id)}
                              disabled={isThisLoading}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-black bg-red-600 text-white hover:bg-red-700 transition-all disabled:opacity-60"
                            >
                              {isThisLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                              Yakin Hapus?
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              disabled={isThisLoading}
                              className="px-2 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(p.id)}
                            disabled={!!loadingId}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-all disabled:opacity-60"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Hapus
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
