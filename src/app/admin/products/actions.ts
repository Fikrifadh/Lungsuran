"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createProduct(formData: FormData) {
  const name        = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price       = parseFloat(formData.get("price") as string);
  const status      = formData.get("status") as string || "AVAILABLE";
  const categoryName  = formData.get("category") as string;
  const customCategory = formData.get("customCategory") as string;
  const imageUrls   = formData.get("imageUrls") as string;

  // Tentukan nama kategori final
  const finalCategory = (categoryName === "Lainnya (Ketik Baru)" && customCategory)
    ? customCategory
    : categoryName;

  // Buat slug sederhana dari nama kategori
  const slug = finalCategory.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  // Ambil atau buat kategori
  let category = await prisma.category.findFirst({
    where: { name: finalCategory },
  });

  if (!category) {
    category = await prisma.category.create({
      data: { name: finalCategory, slug },
    });
  }

  // Simpan produk
  await prisma.product.create({
    data: {
      name,
      description,
      price,
      status,
      images: imageUrls || "",
      categoryId: category.id,
    },
  });

  // Refresh cache halaman publik & admin
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function updateProductStatus(productId: string, status: string) {
  await prisma.product.update({
    where: { id: productId },
    data: { status },
  });
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteProduct(productId: string) {
  await prisma.product.delete({
    where: { id: productId },
  });
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function updateProduct(productId: string, formData: FormData) {
  const name        = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price       = parseFloat(formData.get("price") as string);
  const status      = formData.get("status") as string;
  const categoryId  = formData.get("categoryId") as string;
  const imageUrls   = formData.get("imageUrls") as string;

  await prisma.product.update({
    where: { id: productId },
    data: { name, description, price, status, categoryId, images: imageUrls },
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/products/${productId}`);
}
