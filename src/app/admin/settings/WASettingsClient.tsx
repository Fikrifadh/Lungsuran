"use client";

import { useState } from "react";
import { Phone, Save, CheckCircle2, Loader2, ExternalLink } from "lucide-react";
import { saveSetting } from "../admin-actions";

type Props = {
  initialPhone: string;
  initialMessage: string;
};

export default function WASettingsClient({ initialPhone, initialMessage }: Props) {
  const [phone, setPhone]     = useState(initialPhone);
  const [message, setMessage] = useState(initialMessage);
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState<string | null>(null);

  // Preview link WA
  const previewMessage = message.replace("{nama_produk}", "Contoh Produk").replace("{harga}", "Rp 500.000");
  const previewUrl = phone
    ? `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(previewMessage)}`
    : "#";

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) { setError("Nomor WhatsApp tidak boleh kosong"); return; }
    setIsLoading(true);
    setError(null);
    setSaved(false);
    try {
      await saveSetting("wa_phone", phone.trim());
      await saveSetting("wa_message_template", message.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Gagal menyimpan pengaturan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <form onSubmit={handleSave} className="space-y-6">
        {/* Nomor WhatsApp */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <h2 className="font-black text-slate-800 flex items-center gap-2">
            <Phone className="w-5 h-5 text-green-600" /> Nomor WhatsApp Admin
          </h2>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Nomor (format internasional, tanpa +)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">+</span>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="6281234567890"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 pl-8 pr-4 outline-none focus:border-[#00519E] font-mono font-medium transition-all"
              />
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Contoh: <span className="font-mono text-slate-600">6281234567890</span> (kode negara 62 = Indonesia, tanpa 0 di depan)
            </p>
          </div>
        </div>

        {/* Template Pesan */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <h2 className="font-black text-slate-800">Template Pesan WhatsApp</h2>
          <p className="text-sm text-slate-500">
            Gunakan variabel berikut dalam pesan:
            <span className="font-mono text-[#00519E] bg-blue-50 px-1.5 py-0.5 rounded ml-2">{"{nama_produk}"}</span>
            <span className="font-mono text-[#00519E] bg-blue-50 px-1.5 py-0.5 rounded ml-2">{"{harga}"}</span>
          </p>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Isi Pesan</label>
            <textarea
              rows={5}
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 px-4 outline-none focus:border-[#00519E] font-medium leading-relaxed transition-all font-mono text-sm"
            />
          </div>

          {/* Preview */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-2">Preview Pesan</p>
            <p className="text-sm text-green-900 leading-relaxed whitespace-pre-line font-medium">
              {previewMessage}
            </p>
            {phone && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-green-700 hover:underline"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Tes buka WhatsApp
              </a>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-semibold">
            ⚠️ {error}
          </div>
        )}

        {/* Sukses */}
        {saved && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Pengaturan berhasil disimpan!
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-4 bg-[#00519E] text-white font-black text-lg rounded-2xl hover:bg-[#003d76] transition-all shadow-lg shadow-blue-100 active:scale-95 disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {isLoading ? "Menyimpan..." : "Simpan Pengaturan"}
        </button>
      </form>
    </div>
  );
}
