import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
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

    return NextResponse.json({ 
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME
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
