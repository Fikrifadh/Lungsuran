"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

// ========== KATEGORI ==========

export async function createCategory(formData: FormData) {
  const name = (formData.get("name") as string).trim();
  if (!name) throw new Error("Nama kategori tidak boleh kosong");

  const slug = name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  // Cek duplikat
  const existing = await prisma.category.findFirst({ where: { name } });
  if (existing) throw new Error("Kategori sudah ada");

  await prisma.category.create({ data: { name, slug } });
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

export async function deleteCategory(categoryId: string) {
  // Cek apakah ada produk di kategori ini
  const count = await prisma.product.count({ where: { categoryId } });
  if (count > 0) {
    throw new Error(`Kategori masih memiliki ${count} produk. Pindahkan produk terlebih dahulu.`);
  }
  await prisma.category.delete({ where: { id: categoryId } });
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

export async function toggleCategoryActive(categoryId: string, isActive: boolean) {
  await prisma.category.update({
    where: { id: categoryId },
    data: { isActive },
  });
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

// ========== PENGATURAN WA ==========

export async function saveSetting(key: string, value: string) {
  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
  revalidatePath("/");
  revalidatePath("/admin/settings");
}

export async function getSetting(key: string): Promise<string> {
  const setting = await prisma.setting.findUnique({ where: { key } });
  return setting?.value ?? "";
}
