"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="flex items-center justify-center gap-3 px-4 py-3 w-full text-red-300 hover:text-red-100 hover:bg-red-900/20 rounded-xl font-medium transition-all"
    >
      <LogOut className="w-5 h-5" /> Keluar (Logout)
    </button>
  );
}
