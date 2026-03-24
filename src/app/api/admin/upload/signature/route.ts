import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

const cloud_name = (process.env.CLOUDINARY_CLOUD_NAME || "").replace(/['"]/g, '').trim();
const api_key = (process.env.CLOUDINARY_API_KEY || "").replace(/['"]/g, '').trim();
const api_secret = (process.env.CLOUDINARY_API_SECRET || "").replace(/['"]/g, '').trim();

cloudinary.config({
  cloud_name,
  api_key,
  api_secret,
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { paramsToSign } = await request.json();
    
    // Diagnostic log
    console.log("Signature Request:", {
      paramsToSign,
      hasSecret: !!process.env.CLOUDINARY_API_SECRET,
      hasKey: !!process.env.CLOUDINARY_API_KEY,
      hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME
    });

    if (!process.env.CLOUDINARY_API_SECRET) {
       throw new Error("CLOUDINARY_API_SECRET is not set in environment variables.");
    }

    // Generate signature using Cloudinary SDK
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET
    );

    const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || "").replace(/['"]/g, '').trim();
    const apiKey = (process.env.CLOUDINARY_API_KEY || "").replace(/['"]/g, '').trim();

    return NextResponse.json({ 
      signature,
      apiKey,
      cloudName
    });
  } catch (error: any) {
    console.error("Signature generation error:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate signature", 
        details: error.message || String(error) 
      }, 
      { status: 500 }
    );
  }
}
