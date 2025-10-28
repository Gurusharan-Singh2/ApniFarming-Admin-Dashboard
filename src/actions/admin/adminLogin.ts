"use server";

import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers"; // Next.js server action cookies

interface LoginResponse {
  success?: boolean;
  error?: string;
  admin?: {
    id: bigint;
    first_name: string;
    last_name: string;
    email: string;
    role?: string | null;
  };
}

export async function adminLoginAction(formData: FormData): Promise<LoginResponse> {
  const email = formData.get("email") as string | null;
  const password = formData.get("password") as string | null;

  if (!email || !password) return { error: "Email and password are required" };

  try {
    const admin = await prisma.admins.findUnique({ where: { email } });

    if (!admin || admin.password !== password) {
      return { error: "Invalid email or password" };
    }

    // Create JWT token
    const token = jwt.sign(
      { id: admin.id.toString(), email: admin.email, role: admin.role || "admin" },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

     const cookieStore = await cookies();
  cookieStore.set({
    name: "admin_token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // false in dev
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });


    return {
      success: true,
      admin: {
        id: admin.id,
        first_name: admin.first_name,
        last_name: admin.last_name,
        email: admin.email,
        role: admin.role,
      },
    };
  } catch (err) {
    console.error("Admin login error:", err);
    return { error: "Something went wrong" };
  }
}
