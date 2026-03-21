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
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string || "staynamcheon";
    const isVideo = !!file?.type?.startsWith("video/");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary using a promise to handle the stream
    const result: any = await new Promise((resolve, reject) => {
      // Diagnostic log for Cloudinary and Environment Variables
      console.log("Upload Request:", { 
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        folder,
        envCheck: {
          hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
          hasApiKey: !!process.env.CLOUDINARY_API_KEY,
          hasApiSecret: !!process.env.CLOUDINARY_API_SECRET
        }
      });

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          asset_folder: folder,
          resource_type: isVideo ? "video" : "image",
          eager: isVideo
            ? [
                {
                  width: 1280,
                  height: 720,
                  crop: "fill",
                  format: "jpg",
                  quality: "auto",
                  fetch_format: "auto",
                  start_offset: "0",
                },
              ]
            : undefined,
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary Stream Error:", error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({
      url: result.secure_url,
      public_id: result.public_id,
      publicId: result.public_id,
      posterUrl: Array.isArray(result?.eager) && result.eager[0]?.secure_url ? result.eager[0].secure_url : undefined,
    });
  } catch (error: any) {
    console.error("Full Upload Route Error:", error);
    return NextResponse.json(
      { 
        error: "Failed to upload image", 
        details: error.message || String(error) 
      },
      { status: 500 }
    );
  }
}
