"use server";

import prisma from "@/lib/prisma";
import { checkIfExistsInS3, deleteFromS3, getFileNameFromUrl, uploadToS3 } from "@/utils/s3";
import { createHash } from "crypto";

export async function getAllProductsAction() {
  try {
    const products = await prisma.products.findMany({
      where: { status: 1 },
      include: { product_variants: true },
      orderBy: { sort_order: "asc" },
    });

    const formatted = products.map((product) => {
      const sizes = product.product_variants.map((variant) => {
        const mrp = parseFloat(variant.mrp_price?.toString() || "0");
        const sell = parseFloat(variant.sell_price?.toString() || "0");
        let discount = "";
        if (mrp > sell) {
          discount = `${Math.round(((mrp - sell) / mrp) * 100)}% OFF`;
        }
        return {
          id: variant.id,
          option: variant.option,
          size: variant.value,
          inStock: variant.in_stock === 1,
          costPrice: mrp,
          sellPrice: sell,
          maxOrder: variant.max_order,
          discount,
        };
      });

      return {
        id: product.id,
        name: product.name,
        tagline: product.tagline,
        image: product.image,
        description: product.description,
        category_id: product.category_id,
        in_stock: product.in_stock === 1,
        sort_order: product.sort_order,
        sizes,
      };
    });

    
    
    return formatted; 
  } catch (error) {
    console.error("❌ getAllProductsAction error:", error);
    return []; 
  }
}


export async function getProductsByCategoryAction(categoryId:number) {
  try {
    const products = await prisma.products.findMany({
      where: {
        status: 1,
        category_id: categoryId,
      },
      include: { product_variants: true },
      orderBy: { sort_order: "asc" },
    });

    const formatted = products.map((product) => {
      const sizes = product.product_variants.map((variant) => {
        const mrp = parseFloat(variant.mrp_price?.toString() || "0");
        const sell = parseFloat(variant.sell_price?.toString() || "0");
        let discount = "";
        if (mrp > sell) {
          discount = `${Math.round(((mrp - sell) / mrp) * 100)}% OFF`;
        }

        return {
          id: variant.id,
          option: variant.option,
          size: variant.value,
          inStock: variant.in_stock === 1,
          costPrice: mrp,
          sellPrice: sell,
          maxOrder: variant.max_order,
          discount,
        };
      });

      return {
        id: product.id,
        name: product.name,
        tagline: product.tagline,
        image: product.image,
        description: product.description,
        category_id: product.category_id,
        in_stock: product.in_stock === 1,
        sort_order: product.sort_order,
        sizes,
      };
    });

    return formatted;
  } catch (error) {
    console.error("❌ getProductsByCategoryAction error:", error);
    return [];
  }
}



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

 

  return { success: true, message: "Product deleted successfully" };
}





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

  const existing = await prisma.products.findUnique({ where: { id } });
  if (!existing) throw new Error("Product not found");

  let imageUrl = existing.image;

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

    const oldFileName = await getFileNameFromUrl(existing.image);
    if (oldFileName && oldFileName !== fileName) {
      await deleteFromS3(oldFileName);
    }
  }

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
        deleteMany: {},
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


  return { success: true, product: updated, imageUrl };
}

