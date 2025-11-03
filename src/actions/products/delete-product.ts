"use server";

import prisma from "@/lib/prisma";
import { deleteFromS3, getFileNameFromUrl } from "@/utils/s3";
import { revalidateTag } from "next/cache";

export async function deleteProductAction(productId: number) {
  if (!productId) throw new Error("Product ID is required");

  const product = await prisma.products.findUnique({ where: { id: productId } });
  if (!product) throw new Error("Product not found");

  if (product.image) {
    const key = await getFileNameFromUrl(product.image);
    if (key) await deleteFromS3(key);
  }

  await prisma.product_variants.deleteMany({ where: { product_id: productId } });
  await prisma.products.delete({ where: { id: productId } });

  revalidateTag("products");

  return { success: true, message: "Product deleted successfully" };
}
