"use server";

import prisma from "@/lib/prisma";



export async function getAllSubscriptionAction() {
  try {
    const result = await prisma.$queryRaw`
      SELECT s.*, c.*, ual.*
      FROM subscriptions s 
      JOIN customers c ON s.user_id = c.id 
      LEFT JOIN user_addresslist ual ON s.user_id = ual.uid 
     
    `;

  return result
  } catch (error) {
    console.error("❌ getAllSubscriptionAction error:", error);
    return [];
  }
}
