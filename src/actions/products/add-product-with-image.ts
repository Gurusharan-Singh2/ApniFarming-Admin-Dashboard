"use server";

import { uploadToS3, checkIfExistsInS3 } from "@/utils/s3";
import { createHash } from "crypto";
import prisma from "@/lib/prisma";

interface ProductInput {
  title: string;
  image: string;
  sizes: {
    option: string;
    value: string;
    in_Stock: number;
    costPrice: number;
    sellPrice: number;
  }[];
  tagline: string;
  categoryId: number;
  description: string;
  maxOrder: number;
  in_Stock: boolean;
  Sort_order: number;
}

export async function addProductWithImageAction(data: ProductInput) {
  const {
    title,
    image,
    sizes,
    tagline,
    categoryId,
    description,
    maxOrder,
    in_Stock,
    Sort_order,
  } = data;

  
  
  

  if (!title || !Array.isArray(sizes) || sizes.length === 0) {
    throw new Error("Invalid or missing sizes");
  }
  if (!image.startsWith("data:image/")) {
    throw new Error("Invalid image format");
  }

  const matches = image.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!matches) throw new Error("Invalid base64 format");

  const contentType = matches[1];
  const buffer = Buffer.from(matches[2], "base64");

  const hash = createHash("sha256").update(buffer).digest("hex");
  const extension = contentType.split("/")[1];
  const fileName = `products/${hash}.${extension}`;

  const exists = await checkIfExistsInS3(fileName);
  const imageUrl = exists
    ? `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`
    : await uploadToS3({ fileName, buffer, contentType });

  try {
   
    const product = await prisma.products.create({
      data: {
        name: title,
        image: imageUrl,
        tagline,
        category_id: Number(categoryId),
        description,
        in_stock: in_Stock===true ? 1 : 0,
        sort_order: Number(Sort_order),
        product_variants: {
          create: sizes.map((size) => ({
            option: size.option,
            value: size.value,
            max_order: Number(maxOrder),
            in_stock: in_Stock===true ? 1 : 0,
            mrp_price: Number(size.costPrice),
            sell_price: Number(size.sellPrice),
            quantity:0,
          })),
        },
      },
      include: {
        product_variants: true,
      },
    });

 

    return { success: true, product, imageUrl };
  } catch (error: any) {
    console.error("❌ Error adding product:", error);
    throw new Error("Failed to create product");
  }
}
