"use client";

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

type Props = {
  images: string[];
  productName: string;
  status: string;
};

export default function ProductDetailClient({ images, productName, status }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const hasImages = images.length > 0;

  const prev = () => setActiveIndex(i => (i - 1 + images.length) % images.length);
  const next = () => setActiveIndex(i => (i + 1) % images.length);

  return (
    <div className="space-y-4">
      {/* Gambar Utama */}
      <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 group shadow-inner">
        {hasImages ? (
          <Image
            src={images[activeIndex]}
            alt={`${productName} - foto ${activeIndex + 1}`}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-opacity duration-300"
            priority
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-300">
            <span className="text-7xl">📦</span>
            <span className="text-sm font-bold">Belum ada foto</span>
          </div>
        )}

        {/* Navigasi Slider — muncul saat hover, hanya kalau ada lebih dari 1 foto */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-6 h-6 text-slate-800" />
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-6 h-6 text-slate-800" />
            </button>
            {/* Indicator dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === activeIndex ? 'w-5 bg-white' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Badge status */}
        <div className="absolute top-4 left-4">
          <span className={`px-4 py-2 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg ${
            status === 'AVAILABLE'
              ? 'bg-[#00519E] text-white'
              : 'bg-red-600 text-white'
          }`}>
            <CheckCircle2 className="w-4 h-4" />
            {status === 'AVAILABLE' ? 'Tersedia' : 'Terjual'}
          </span>
        </div>
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative w-20 aspect-square rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                activeIndex === idx
                  ? 'border-[#00519E] scale-105 shadow-md'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <Image src={img} alt={`Thumbnail ${idx + 1}`} fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
