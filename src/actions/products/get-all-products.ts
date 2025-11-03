"use server";

import prisma from "@/lib/prisma";

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

    
    
    return formatted; // ✅ Always return array
  } catch (error) {
    console.error("❌ getAllProductsAction error:", error);
    return []; // ✅ Never undefined
  }
}
