import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const extractPublicIdFromUrl = (url: string | undefined | null) => {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("res.cloudinary.com")) return "";
    const parts = parsed.pathname.split("/").filter(Boolean);
    const uploadIndex = parts.findIndex((p) => p === "upload");
    if (uploadIndex === -1 || uploadIndex + 1 >= parts.length) return "";
    let remainder = parts.slice(uploadIndex + 1);
    if (remainder[0]?.startsWith("v") && /^v\d+$/.test(remainder[0])) {
      remainder = remainder.slice(1);
    }
    const joined = remainder.join("/");
    const lastDot = joined.lastIndexOf(".");
    return lastDot === -1 ? joined : joined.slice(0, lastDot);
  } catch {
    return "";
  }
};

const setAssetFolder = async (
  publicId: string,
  resourceType: "image" | "video",
  assetFolder: string
) => {
  try {
    await cloudinary.api.update(publicId, {
      resource_type: resourceType,
      type: "upload",
      asset_folder: assetFolder,
    });
  } catch (err) {
    console.warn("Asset folder update warning:", err);
  }
};

const buildVideoPosterUrl = (publicId: string) =>
  cloudinary.url(publicId, {
    resource_type: "video",
    format: "jpg",
    transformation: [
      {
        width: 1280,
        height: 720,
        crop: "fill",
        quality: "auto",
        fetch_format: "auto",
        start_offset: "0",
      },
    ],
  });

export async function POST(request: Request) {
  try {
    const { items } = await request.json(); // Array of { publicId/public_id, id?, type, order, imageUrl? }
    
    const committedItems = [];

    for (const item of items) {
      let imageUrl = "";
      const resourceType = item.type === "video" ? "video" : "image";
      let incomingPublicId = item.publicId || item.public_id || extractPublicIdFromUrl(item.imageUrl);
      const imageUrlHasTemp = typeof item.imageUrl === "string" && item.imageUrl.includes("/temp/");
      if (imageUrlHasTemp && !incomingPublicId?.includes("temp/")) {
        const derived = extractPublicIdFromUrl(item.imageUrl);
        if (derived) incomingPublicId = derived;
      }
      
      // If it's a new item (from temp), move it
      if (!item.id) {
        if (!incomingPublicId) {
          return NextResponse.json({ message: "Missing publicId for new item" }, { status: 400 });
        }

        if (incomingPublicId.includes("temp/") || imageUrlHasTemp) {
          const newPublicId = incomingPublicId
            .replace("/temp/", "/gallery/")
            .replace("temp/", "gallery/");
          let moveResult: any = null;
          try {
            moveResult = await cloudinary.uploader.rename(incomingPublicId, newPublicId, {
              resource_type: resourceType,
              overwrite: true,
            });
            imageUrl = moveResult.secure_url;

            // Safety cleanup in case the original temp asset still exists
            try {
              await cloudinary.uploader.destroy(incomingPublicId, { resource_type: resourceType });
            } catch (cleanupErr) {
              console.warn("Temp cleanup warning:", cleanupErr);
            }
          } catch (err) {
            console.error("Cloudinary move error:", err);
            // If move fails (maybe already moved?), try to use original if possible or skip
            return NextResponse.json({ message: `Failed to move ${incomingPublicId}` }, { status: 500 });
          }

          // Create in DB
          const movedUrl = moveResult?.secure_url || imageUrl;
          const videoUrl = item.type === "video" ? movedUrl : undefined;
          const posterUrl = item.type === "video" ? buildVideoPosterUrl(newPublicId) : undefined;
          imageUrl = item.type === "video" ? (posterUrl || movedUrl) : movedUrl;

          const newItem = await prisma.stayGalleryItem.create({
            data: {
              imageUrl,
              videoUrl,
              publicId: newPublicId,
              type: item.type,
              order: item.order,
              isMain: item.isMain || false,
            }
          });
          committedItems.push(newItem);

          await setAssetFolder(newPublicId, resourceType, "staynamcheon/gallery");

          // Extra safety: if a gallery copy exists and a temp variant remains, try deleting it.
          if (newPublicId.includes("/gallery/")) {
            const tempCandidate = newPublicId.replace("/gallery/", "/temp/");
            try {
              await cloudinary.uploader.destroy(tempCandidate, { resource_type: resourceType });
            } catch (cleanupErr) {
              console.warn("Temp cleanup warning:", cleanupErr);
            }
          }
        } else {
          const fallbackUrl = item.imageUrl || "";
          if (!fallbackUrl) {
            return NextResponse.json({ message: "Missing imageUrl for new item" }, { status: 400 });
          }
          const isVideo = item.type === "video" || fallbackUrl.toLowerCase().endsWith(".mp4");
          const videoUrl = isVideo ? (item.videoUrl || fallbackUrl) : undefined;
          const posterUrl = isVideo && incomingPublicId ? buildVideoPosterUrl(incomingPublicId) : undefined;

          const newItem = await prisma.stayGalleryItem.create({
            data: {
              imageUrl: isVideo ? (posterUrl || fallbackUrl) : fallbackUrl,
              videoUrl,
              publicId: incomingPublicId,
              type: item.type,
              order: item.order,
              isMain: item.isMain || false,
            }
          });
          committedItems.push(newItem);

          await setAssetFolder(incomingPublicId, resourceType, "staynamcheon/gallery");

          if (incomingPublicId?.includes("/gallery/")) {
            const tempCandidate = incomingPublicId.replace("/gallery/", "/temp/");
            try {
              await cloudinary.uploader.destroy(tempCandidate, { resource_type: resourceType });
            } catch (cleanupErr) {
              console.warn("Temp cleanup warning:", cleanupErr);
            }
          }
        }
      } else {
        // Existing item, just update order
        await prisma.stayGalleryItem.update({
          where: { id: item.id },
          data: { 
            order: item.order,
            isMain: item.isMain
          }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Gallery commit error:", error);
    return NextResponse.json({ 
      message: "Error committing gallery changes", 
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    }, { status: 500 });
  }
}
