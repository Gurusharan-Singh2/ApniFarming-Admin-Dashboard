'use server';
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

  
  
  

if (!title || !image || !sizes?.length) {
    throw new Error("Missing required fields");
  }

  try {
   
    const product = await prisma.products.create({
      data: {
        name: title,
        image,
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

 

    return { success: true, product, image };
  } catch (error: any) {
    console.error("❌ Error adding product:", error);
    throw new Error("Failed to create product");
  }
}