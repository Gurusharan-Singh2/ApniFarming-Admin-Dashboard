"use server";

import prisma from "@/lib/prisma";
import { uploadToS3, deleteFromS3, getFileNameFromUrl, checkIfExistsInS3 } from "@/utils/s3";
import { createHash } from "crypto";
import { revalidateTag } from "next/cache";

interface ProductInput {
  id: number;
  title: string;
  image?: string;
  sizes: {
    id?: number;
    option: string;
    size: string;
    in_Stock: number;
    costPrice: number;
    sellPrice: number;
    maxOrder: number;
  }[];
  tagline: string;
  categoryId: number;
  description: string;
  
  in_Stock: boolean;
  Sort_order: number;
}

export async function editProductWithImageAction(data: ProductInput) {
  const {
    id,
    title,
    image,
    sizes,
    tagline,
    categoryId,
    description,
    in_Stock,
    Sort_order,
  } = data;
  
  

  if (!id) throw new Error("Product ID is required");

  // Fetch existing product
  const existing = await prisma.products.findUnique({ where: { id } });
  if (!existing) throw new Error("Product not found");

  let imageUrl = existing.image;

  // 🖼️ If image is base64 (new upload), replace S3 image
  if (image && image.startsWith("data:image/")) {
    const matches = image.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!matches) throw new Error("Invalid base64 image format");

    const contentType = matches[1];
    const buffer = Buffer.from(matches[2], "base64");
    const hash = createHash("sha256").update(buffer).digest("hex");
    const extension = contentType.split("/")[1];
    const fileName = `products/${hash}.${extension}`;

    const exists = await checkIfExistsInS3(fileName);
    imageUrl = exists
      ? `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`
      : await uploadToS3({ fileName, buffer, contentType });

    // Delete old image if new one uploaded
    const oldFileName = await getFileNameFromUrl(existing.image);
    if (oldFileName && oldFileName !== fileName) {
      await deleteFromS3(oldFileName);
    }
  }

  // 🧾 Update product + variants
  const updated = await prisma.products.update({
    where: { id },
    data: {
      name: title,
      tagline,
      description,
      category_id: Number(categoryId),
      in_stock: in_Stock ? 1 : 0,
      sort_order: Sort_order,
      image: imageUrl,
      product_variants: {
        deleteMany: {}, // remove old variants
        create: sizes.map((size) => ({
          option: size.option,
          value: size.size,
          max_order: Number(size.maxOrder),
          in_stock: in_Stock ? 1 : 0,
          mrp_price: Number(size.costPrice),
          sell_price: Number(size.sellPrice),
          quantity: 0,
        })),
      },
    },
    include: {
      product_variants: true,
    },
  });

  revalidateTag("products");

  return { success: true, product: updated, imageUrl };
}
