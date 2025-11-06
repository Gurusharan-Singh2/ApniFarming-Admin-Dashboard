import { NextResponse } from "next/server";
import { uploadToS3 } from "@/utils/s3";
import crypto from "crypto";
export async function POST(req: Request) {
  try {
    const { base64Data, fileName, contentType } = await req.json();

    if (!base64Data || !fileName || !contentType) {
      return NextResponse.json({ error: "Invalid upload data" }, { status: 400 });
    }

    
    const buffer = Buffer.from(base64Data, "base64");

    
    const hash = crypto.createHash("sha256").update(buffer).digest("hex");
    const extension = fileName.split(".").pop() || "jpg";
    const finalFileName = `products/${hash}.${extension}`;

    
    const url = await uploadToS3({
      fileName: finalFileName,
      buffer,
      contentType,
    });

   
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

