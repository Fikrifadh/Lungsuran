"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function createAdminUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    throw new Error("Email dan password harus diisi");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("Email sudah terdaftar");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  
  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: "ADMIN"
    }
  });

  revalidatePath("/admin/users");
}

export async function deleteAdminUser(id: string) {
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/users");
}
