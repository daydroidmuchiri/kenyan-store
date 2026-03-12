// src/app/api/designs/upload/route.ts
// Upload design images to Cloudinary

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const uploadPreset = (formData.get("upload_preset") as string) || "kweli_designs";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type server-side
    const allowedTypes = ["image/png", "image/jpeg", "image/svg+xml"];
    if (!allowedTypes.includes(file.type) && file.type !== "application/octet-stream") {
      // Allow octet-stream for preview blobs
      if (uploadPreset !== "kweli_previews") {
        return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
      }
    }

    // Validate file size
    const MAX_SIZE = 20 * 1024 * 1024; // 20MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 20MB)" }, { status: 400 });
    }

    // Upload to Cloudinary
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Cloudinary not configured" },
        { status: 500 }
      );
    }

    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append("file", file);
    cloudinaryFormData.append("upload_preset", uploadPreset);
    cloudinaryFormData.append("folder", `kweli/designs/${session.user?.id}`);

    // Add timestamp + signature for signed upload
    const timestamp = Math.round(Date.now() / 1000);
    const folder = `kweli/designs/${session.user?.id}`;
    
    // Build signature string
    const signatureStr = `folder=${folder}&timestamp=${timestamp}&upload_preset=${uploadPreset}${apiSecret}`;
    const signature = await sha1(signatureStr);

    cloudinaryFormData.append("api_key", apiKey);
    cloudinaryFormData.append("timestamp", String(timestamp));
    cloudinaryFormData.append("signature", signature);

    const cloudRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: cloudinaryFormData,
      }
    );

    if (!cloudRes.ok) {
      const errData = await cloudRes.json();
      console.error("Cloudinary error:", errData);
      // Fallback: return a placeholder for development without Cloudinary configured
      if (process.env.NODE_ENV === "development") {
        return NextResponse.json({
          secure_url: URL.createObjectURL ? null : "https://via.placeholder.com/500",
          public_id: `dev-${Date.now()}`,
        });
      }
      return NextResponse.json(
        { error: "Image upload service error" },
        { status: 500 }
      );
    }

    const cloudData = await cloudRes.json();

    return NextResponse.json({
      secure_url: cloudData.secure_url,
      public_id: cloudData.public_id,
      width: cloudData.width,
      height: cloudData.height,
      format: cloudData.format,
      bytes: cloudData.bytes,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

// SHA1 hash for Cloudinary signature
async function sha1(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
