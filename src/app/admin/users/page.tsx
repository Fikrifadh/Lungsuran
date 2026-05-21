import { getServerSession } from "next-auth/next";
import prisma from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Users, Shield, Mail, Trash2 } from "lucide-react";
import AddAdminForm from "./AddAdminForm";
import { deleteAdminUser } from "./actions";

export default async function ManageAdminsPage() {
  const session = await getServerSession();
  if (!session?.user) {
    return <div>Akses Ditolak</div>;
  }

  const admins = await prisma.user.findMany({
    orderBy: { createdAt: "asc" }
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-6 sm:p-10">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-slate-200 rounded-full transition-all text-slate-500">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                <Users className="w-6 h-6 text-[#00519E]" />
                Manajemen Tim (Admin)
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-1">Kelola akses email anggota tim untuk login</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Kiri: Daftar Admin */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest pl-2">
              Daftar Admin Aktif ({admins.length})
            </h2>
            
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="divide-y divide-slate-100">
                {admins.map((admin) => (
                  <div key={admin.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-[#00519E]" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-700">{admin.email}</div>
                        <div className="text-xs text-slate-400 font-medium">Ditambahkan: {new Date(admin.createdAt).toLocaleDateString('id-ID')}</div>
                      </div>
                    </div>
                    {/* Jangan boleh hapus diri sendiri (opsional) */}
                    {admin.email !== session.user?.email && (
                      <form action={async () => {
                        "use server";
                        await deleteAdminUser(admin.id);
                      }}>
                        <button 
                          type="submit" 
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Cabut Akses"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </form>
                    )}
                    {admin.email === session.user?.email && (
                      <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded-md uppercase">Anda</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Kanan: Form Tambah Admin */}
          <div className="md:col-span-1">
            <AddAdminForm />
          </div>

        </div>
      </div>
    </div>
  );
}
