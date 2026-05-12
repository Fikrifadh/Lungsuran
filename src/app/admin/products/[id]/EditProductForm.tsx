"use client";

import { useState, useRef } from 'react';
import { ArrowLeft, Save, Tag, DollarSign, Type, Info, CheckCircle2, Upload, X, Link2 } from 'lucide-react';
import Image from 'next/image';
import { updateProduct } from '../actions';

type Props = {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    status: string;
    images: string;
    categoryId: string;
    category: { id: string; name: string };
  };
  categories: { id: string; name: string }[];
};

export default function EditProductForm({ product, categories }: Props) {
  const existingImages = product.images
    ? product.images.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const [images, setImages] = useState<string[]>(existingImages);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [brokenImages, setBrokenImages] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hapus foto dari daftar
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setBrokenImages(prev => {
      const n = new Set<number>();
      prev.forEach(i => { if (i < index) n.add(i); else if (i > index) n.add(i - 1); });
      return n;
    });
  };

  // Tambah foto dari file lokal — konversi ke Base64 agar tersimpan permanen
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) {
      alert('Maksimal 5 foto');
      return;
    }
    
    for (const f of files) {
      if (f.size > 2.5 * 1024 * 1024) {
        alert(`Ukuran ${f.name} terlalu besar (maks 2.5MB). Harap kompres foto Anda.`);
        continue;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImages(prev => [...prev, base64String]);
      };
      reader.readAsDataURL(f);
    }
    
    // Reset file input agar bisa pilih file lagi
    e.target.value = '';
  };

  // Helper menggunakan proxy internal untuk mem-bypass batasan CORS/HTML Viewer SharePoint & OneDrive
  const transformOneDriveUrl = (url: string) => {
    // Jika sudah proxy, biarkan
    if (url.startsWith('/api/proxy-image')) return url;

    // 1. Cek SharePoint / OneDrive
    if (url.includes('sharepoint.com') || url.includes('1drv.ms') || url.includes('onedrive.live.com')) {
      return `/api/proxy-image?url=${encodeURIComponent(url)}`;
    }

    return url;
  };

  const handleAddUrl = () => {
    let url = urlInput.trim();
    if (!url) return;

    // Auto fix if user pasted embed code instead of link
    if (url.includes('<iframe')) {
      const match = url.match(/src="([^"]+)"/);
      if (match) url = match[1];
    }

    // Ensure URL starts with proper protocol
    if (!url.startsWith('http') && !url.startsWith('/api/')) {
      alert('URL harus diawali dengan http:// atau https://');
      return;
    }
    if (images.length >= 5) {
      alert('Maksimal 5 foto');
      return;
    }
    // Convert OneDrive share links to direct download URLs
    const finalUrl = transformOneDriveUrl(url);
    setImages(prev => [...prev, finalUrl]);
    setUrlInput('');
    setShowUrlInput(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    // Hanya simpan URL yang valid (termasuk http, /api/, dan base64 data:image)
    const permanentImages = images.filter((img) => img.startsWith('http') || img.startsWith('/api/') || img.startsWith('data:image/'));
    formData.set('imageUrls', permanentImages.join(','));
    try {
      await updateProduct(product.id, formData);
      setSuccess(true);
      setTimeout(() => { window.location.href = '/admin'; }, 1500);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan perubahan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-6 sm:p-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <a href="/admin" className="flex items-center gap-2 text-slate-500 hover:text-[#00519E] font-bold transition-all">
            <ArrowLeft className="w-5 h-5" /> Kembali
          </a>
          <h1 className="text-2xl font-black text-slate-800">Edit Produk</h1>
        </div>

        {success && (
          <div className="mb-8 bg-green-50 border border-green-200 p-6 rounded-3xl flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <p className="font-black text-green-800 text-lg">Perubahan Disimpan!</p>
            <p className="text-green-600 text-sm">Mengalihkan kembali ke dashboard...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ===== SEKSI FOTO ===== */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#00519E]" /> Foto Produk
              </h2>
              <span className="text-xs text-slate-400 font-medium">{images.length}/5 foto</span>
            </div>

            {/* Grid Foto */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              {/* Foto yang sudah ada / baru ditambahkan */}
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded-2xl overflow-hidden group border-2 border-slate-100 bg-slate-50"
                >
                  {brokenImages.has(idx) ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-slate-300 text-center p-2">
                      <span className="text-xl">⚠️</span>
                      <span className="text-[9px] font-bold">Link gambar tidak bisa diakses</span>
                    </div>
                  ) : (
                    <Image
                      src={img}
                      alt={`Foto ${idx + 1}`}
                      fill
                      sizes="120px"
                      className="object-cover"
                      unoptimized={true}
                      onError={() => setBrokenImages(prev => new Set(prev).add(idx))}
                    />
                  )}
                  {/* Tombol hapus — muncul saat hover */}
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  {/* Label urutan */}
                  {idx === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 py-1 bg-[#00519E]/80 text-white text-[10px] font-black text-center">
                      UTAMA
                    </div>
                  )}
                </div>
              ))}

              {/* Tombol tambah foto — hanya muncul jika belum 5 */}
              {images.length < 5 && (
                <label
                  htmlFor="file-upload-edit"
                  className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#00519E] hover:bg-blue-50 transition-all group"
                >
                  <Upload className="w-7 h-7 text-slate-300 group-hover:text-[#00519E] transition-colors" />
                  <span className="text-[11px] font-bold text-slate-400 group-hover:text-[#00519E]">Pilih Foto</span>
                  <input
                    ref={fileInputRef}
                    id="file-upload-edit"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>

            {/* Tombol tambah via URL */}
            {images.length < 5 && (
              <div className="mt-2">
                {showUrlInput ? (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={e => setUrlInput(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-xl py-2 px-3 text-sm outline-none focus:border-[#00519E]"
                    />
                    <button
                      type="button"
                      onClick={handleAddUrl}
                      className="px-4 py-2 bg-[#00519E] text-white text-sm font-bold rounded-xl hover:bg-[#003d76] transition-all"
                    >
                      Tambah
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowUrlInput(false); setUrlInput(''); }}
                      className="px-3 py-2 bg-slate-100 text-slate-500 text-sm font-bold rounded-xl hover:bg-slate-200 transition-all"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(true)}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-[#00519E] transition-colors mt-1"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    Atau tambah via URL gambar
                  </button>
                )}
              </div>
            )}

            <p className="text-[11px] text-slate-400 mt-3 italic">
              * Hover pada foto untuk menghapusnya. Foto pertama akan menjadi gambar utama.
            </p>
          </div>

          {/* ===== SEKSI DETAIL ===== */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Info className="w-5 h-5 text-[#00519E]" /> Informasi Barang
            </h2>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Type className="w-3 h-3" /> Nama Produk
              </label>
              <input name="name" type="text" defaultValue={product.name} required
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 outline-none focus:border-[#00519E] font-medium" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> Harga (Rp)
                </label>
                <input name="price" type="number" defaultValue={product.price} required
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 outline-none focus:border-[#00519E] font-medium font-mono" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Tag className="w-3 h-3" /> Kategori
                </label>
                <select name="categoryId" defaultValue={product.categoryId}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 outline-none focus:border-[#00519E] font-medium cursor-pointer">
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deskripsi Lengkap</label>
              <textarea name="description" rows={4} defaultValue={product.description} required
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-4 outline-none focus:border-[#00519E] font-medium leading-relaxed" />
            </div>

            <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-2xl">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status:</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="status" value="AVAILABLE" defaultChecked={product.status === 'AVAILABLE'} className="w-4 h-4" />
                <span className="text-sm font-bold text-slate-600">Tersedia</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="status" value="SOLD" defaultChecked={product.status === 'SOLD'} className="w-4 h-4" />
                <span className="text-sm font-bold text-slate-600">Terjual</span>
              </label>
            </div>
          </div>

          <button type="submit" disabled={isLoading || success}
            className="w-full bg-[#00519E] text-white py-5 rounded-3xl font-black text-xl flex items-center justify-center gap-3 hover:bg-[#003d76] transition-all shadow-xl shadow-blue-100 active:scale-95 disabled:opacity-50">
            <Save className="w-6 h-6" />
            {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </form>
      </div>
    </div>
  );
}
