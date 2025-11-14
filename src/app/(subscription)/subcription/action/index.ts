"use server";

import prisma from "@/lib/prisma";
import { serializePrisma } from "@/utils/SerializePrisma";

export interface ItemType{
  name:string;
  image:string;
  sell_price:number;
}

export async function getAllSubscriptionAction() {
  try {
    const result = await prisma.$queryRawUnsafe(`
      SELECT 
        s.*, 
        s.id as subscription_id,
        c.id,
        c.first_name,
        c.phone,
        
        ual.street_address,
        ual.city,
        ual.pincode
      FROM 
        subscriptions s
      JOIN 
        customers c 
        ON s.user_id = c.id
      LEFT JOIN 
        user_addresslist ual 
        ON s.user_id = ual.uid;
      
    `);

    const serialized = serializePrisma(result);
    // const finalResult = JSON.parse(JSON.stringify(serialized));
    
    return serialized;
  } catch (error) {
    console.error("❌ getAllSubscriptionAction error:", error);
    return [];
  }
}




export const fetchItems = async (id: number) => {
  console.log("Fetching items for subscription ID:", id);
  try {
    const result = await prisma.$queryRawUnsafe(`
     SELECT p.name, p.image , s.cost,s.quantity,v.option FROM subscription_items s LEFT JOIN products p ON p.id = s.productid LEFT JOIN product_variants v ON v.id = s.varient_id WHERE s.subscription_id = ${id};
    `);
 
        const serialized = serializePrisma(result);
    const finalResult = JSON.parse(JSON.stringify(serialized));
    
    return finalResult ;


  } catch (error) {
    console.error("❌ fetchItems error:", error);
    return [];
  }
};


export const CancelSubscription = async (id: number) => {
  try {
    

    const res = await prisma.$executeRawUnsafe(`
      UPDATE subscriptions
      SET status = 'cancelled'
      WHERE id = ${id};
    `);


    return res;
  } catch (error) {
    console.error("❌ CancelSubscription error:", error);
    return null;
  }
};
