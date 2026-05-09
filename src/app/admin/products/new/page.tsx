"use client";

import { useState, useRef } from 'react';
import {
  ArrowLeft, Upload, X, Save, Tag, DollarSign,
  Type, Info, CheckCircle2, Link2, ImageOff
} from 'lucide-react';
import Image from 'next/image';
import { createProduct } from '../actions';

export default function NewProduct() {
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Pakaian');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [brokenImages, setBrokenImages] = useState<Set<number>>(new Set());

  const categories = ['Pakaian', 'Kebutuhan Anak', 'Elektronik', 'Buku', 'Furniture', 'Lainnya (Ketik Baru)'];

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setIsCustomCategory(value === 'Lainnya (Ketik Baru)');
    setSelectedCategory(value);
  };

  // Upload dari file lokal — simpan sebagai preview dan pertahankan file untuk upload permanen
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) { alert('Maksimal 5 foto'); return; }
    const newPreviews = files.map(f => ({ src: URL.createObjectURL(f), file: f }));
    setImages(prev => [...prev, ...newPreviews.map(p => p.src)]);
    // Simpan file ke FormData melalui input tersembunyi (name="images") otomatis oleh form
    // (input already memiliki attribute name="images" dan multiple)
    e.target.value = '';
  };

  // Helper untuk mengubah link sharing OneDrive menjadi direct image link
  const transformOneDriveUrl = (url: string) => {
    if (url.includes('1drv.ms') || url.includes('onedrive.live.com')) {
      try {
        // Encode URL ke Base64 (tanpa padding)
        const base64Value = btoa(url).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        return `https://api.onedrive.com/v1.0/shares/u!${base64Value}/root/content`;
      } catch (e) {
        return url;
      }
    }
    return url;
  };

  // Tambah via URL eksternal
  const handleAddUrl = () => {
    let url = urlInput.trim();
    if (!url) return;
    if (!url.startsWith('http')) { alert('URL harus diawali http:// atau https://'); return; }
    if (images.length >= 5) { alert('Maksimal 5 foto'); return; }
    
    // Transformasi jika itu link OneDrive
    url = transformOneDriveUrl(url);

    setImages(prev => [...prev, url]);
    setBrokenImages(prev => { const n = new Set(prev); n.delete(images.length); return n; });
    setUrlInput('');
    setShowUrlInput(false);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setBrokenImages(prev => {
      const n = new Set<number>();
      prev.forEach(i => { if (i < index) n.add(i); else if (i > index) n.add(i - 1); });
      return n;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    // Filter gambar blob (tidak bisa disimpan ke DB) — hanya simpan URL https
    const validImages = images.filter(img => img.startsWith('http'));
    if (validImages.length === 0 && images.length > 0) {
      alert('Harap tambahkan gambar via URL (bukan upload file lokal) agar tersimpan permanen. Gunakan tombol "URL Gambar".');
      setIsLoading(false);
      return;
    }
    const formData = new FormData(e.currentTarget);
    formData.set('imageUrls', validImages.join(','));
    if (isCustomCategory) formData.set('customCategory', customCategory);
    try {
      await createProduct(formData);
      setSuccess(true);
      setTimeout(() => { window.location.href = '/admin'; }, 1500);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan produk');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-6 sm:p-10">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <a href="/admin" className="flex items-center gap-2 text-slate-500 hover:text-[#00519E] font-bold transition-all">
            <ArrowLeft className="w-5 h-5" /> Kembali
          </a>
          <h1 className="text-2xl font-black text-slate-800">Tambah Produk Baru</h1>
        </div>

        {success && (
          <div className="mb-8 bg-green-50 border border-green-200 p-6 rounded-3xl flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <p className="font-black text-green-800 text-lg">Berhasil Disimpan!</p>
            <p className="text-green-600 text-sm">Mengalihkan kembali ke dashboard...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* === FOTO PRODUK === */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#00519E]" /> Foto Produk
              </h2>
              <span className="text-xs font-medium text-slate-400">{images.length}/5 foto</span>
            </div>

            {/* Panduan penting */}
            <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 font-medium">
              💡 <strong>Gunakan tombol "URL Gambar"</strong> agar foto tersimpan permanen di katalog. 
              Upload file lokal hanya untuk preview sementara.
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              {/* Preview foto yang sudah ditambahkan */}
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group border-2 border-slate-100 bg-slate-50">
                  {brokenImages.has(idx) ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-slate-300">
                      <ImageOff className="w-8 h-8" />
                      <span className="text-[10px] font-bold">URL tidak valid</span>
                    </div>
                  ) : (
                    <Image
                      src={img}
                      alt={`Foto ${idx + 1}`}
                      fill
                      sizes="120px"
                      className="object-cover"
                      unoptimized={img.startsWith('blob:')}
                      onError={() => setBrokenImages(prev => new Set(prev).add(idx))}
                    />
                  )}
                  <button type="button" onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow">
                    <X className="w-3.5 h-3.5" />
                  </button>
                  {idx === 0 && (
                    <div className="absolute bottom-0 inset-x-0 py-1 bg-[#00519E]/80 text-white text-[10px] font-black text-center">
                      UTAMA
                    </div>
                  )}
                  {img.startsWith('blob:') && (
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-amber-500 text-white text-[9px] font-black rounded">
                      PREVIEW
                    </div>
                  )}
                </div>
              ))}

              {/* Tombol tambah foto */}
              {images.length < 5 && (
                <label htmlFor="file-upload-new"
                  className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#00519E] hover:bg-blue-50 transition-all group">
                  <Upload className="w-7 h-7 text-slate-300 group-hover:text-[#00519E] transition-colors" />
                  <span className="text-[11px] font-bold text-slate-400 group-hover:text-[#00519E]">Pilih File</span>
                  <input id="file-upload-new" type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                </label>
              )}
            </div>

            {/* Input URL */}
            {images.length < 5 && (
              <div>
                {showUrlInput ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={e => setUrlInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddUrl())}
                      placeholder="https://contoh.com/foto-produk.jpg"
                      className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-xl py-2.5 px-4 text-sm outline-none focus:border-[#00519E] transition-all font-mono"
                      autoFocus
                    />
                    <button type="button" onClick={handleAddUrl}
                      className="px-4 py-2.5 bg-[#00519E] text-white text-sm font-bold rounded-xl hover:bg-[#003d76] transition-all">
                      Tambah
                    </button>
                    <button type="button" onClick={() => { setShowUrlInput(false); setUrlInput(''); }}
                      className="px-3 py-2.5 bg-slate-100 text-slate-500 text-sm font-bold rounded-xl hover:bg-slate-200 transition-all">
                      Batal
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setShowUrlInput(true)}
                    className="flex items-center gap-1.5 text-sm font-bold text-[#00519E] hover:underline transition-colors">
                    <Link2 className="w-4 h-4" />
                    + URL Gambar (disarankan, tersimpan permanen)
                  </button>
                )}
              </div>
            )}
          </div>

          {/* === DETAIL PRODUK === */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Info className="w-5 h-5 text-[#00519E]" /> Informasi Barang
            </h2>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Type className="w-3 h-3" /> Nama Produk
              </label>
              <input type="text" name="name" placeholder="Contoh: MacBook Air M1 2020" required
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 outline-none focus:border-[#00519E] transition-all font-medium" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> Harga (Rp)
                </label>
                <input type="number" name="price" placeholder="Contoh: 10500000" required
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 outline-none focus:border-[#00519E] transition-all font-medium font-mono" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Tag className="w-3 h-3" /> Kategori
                </label>
                <div className="space-y-2">
                  <select name="category" onChange={handleCategoryChange}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 outline-none focus:border-[#00519E] font-medium cursor-pointer">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {isCustomCategory && (
                    <input type="text" name="customCategory" value={customCategory}
                      onChange={e => setCustomCategory(e.target.value)}
                      placeholder="Ketik kategori baru..."
                      className="w-full bg-blue-50 border-2 border-[#00519E]/20 rounded-2xl py-3 px-4 outline-none focus:border-[#00519E] font-medium"
                      autoFocus />
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deskripsi Lengkap</label>
              <textarea name="description" rows={4} required
                placeholder="Tuliskan spesifikasi, kondisi, dan kelengkapan barang..."
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-4 outline-none focus:border-[#00519E] transition-all font-medium leading-relaxed" />
            </div>

            <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-2xl">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status:</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="status" value="AVAILABLE" defaultChecked className="w-4 h-4 text-[#00519E]" />
                <span className="text-sm font-bold text-slate-600">Available (Tersedia)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="status" value="SOLD" className="w-4 h-4 text-[#00519E]" />
                <span className="text-sm font-bold text-slate-600">Sold (Terjual)</span>
              </label>
            </div>
          </div>

          <button type="submit" disabled={isLoading || success}
            className="w-full bg-[#00519E] text-white py-5 rounded-3xl font-black text-xl flex items-center justify-center gap-3 hover:bg-[#003d76] transition-all shadow-xl shadow-blue-100 active:scale-95 disabled:opacity-50">
            <Save className="w-6 h-6" />
            {isLoading ? 'Sedang Menyimpan...' : 'Simpan Ke Katalog'}
          </button>
        </form>
      </div>
    </div>
  );
}
