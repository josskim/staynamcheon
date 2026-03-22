import { v2 as cloudinary } from "cloudinary";
import { PrismaClient } from "@prisma/client";
import * as path from "path";

// Environment variables will be loaded via Node.js --env-file flag

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const prisma = new PrismaClient();

const DRY_RUN = process.argv.includes("--dry-run");

async function migrate() {
  console.log(`\n🚀 ${DRY_RUN ? "DRY RUN MODE" : "MIGRATION MODE"}\n`);

  try {
    // 1. Process StayGalleryItem
    const galleryItems = await prisma.stayGalleryItem.findMany({
      where: {
        OR: [
          { imageUrl: { contains: "/staynamcheon/temp/" } },
          { videoUrl: { contains: "/staynamcheon/temp/" } },
        ],
      },
    });

    console.log(`Found ${galleryItems.length} Gallery items to migrate.`);

    for (const item of galleryItems) {
      const updates: any = {};
      
      if (item.imageUrl && item.imageUrl.includes("/staynamcheon/temp/")) {
        const newUrl = await moveCloudinaryFile(item.imageUrl, "staynamcheon/gallery");
        if (newUrl) updates.imageUrl = newUrl;
      }
      
      if (item.videoUrl && item.videoUrl.includes("/staynamcheon/temp/")) {
        const newUrl = await moveCloudinaryFile(item.videoUrl, "staynamcheon/gallery", "video");
        if (newUrl) updates.videoUrl = newUrl;
      }

      if (Object.keys(updates).length > 0) {
        if (!DRY_RUN) {
          await prisma.stayGalleryItem.update({
            where: { id: item.id },
            data: updates,
          });
          console.log(`✅ Updated Gallery Item: ${item.id}`);
        } else {
          console.log(`[DRY RUN] Would update Gallery Item ${item.id} with ${JSON.stringify(updates)}`);
        }
      }
    }

    // 2. Process StayPageContent
    const pageContents = await prisma.stayPageContent.findMany({
      where: {
        value: { contains: "/staynamcheon/temp/" },
      },
    });

    console.log(`\nFound ${pageContents.length} Page Content items to migrate.`);

    for (const content of pageContents) {
      let newValue: string | null = null;

      if (content.type === "gallery" || content.value.startsWith("[") || content.value.startsWith("{")) {
        // Handle JSON array/object
        try {
          const data = JSON.parse(content.value);
          const updatedData = await processJsonImages(data);
          newValue = JSON.stringify(updatedData);
          console.log(`Processed JSON for ${content.page}/${content.section}/${content.key}`);
        } catch (e) {
          console.error(`Failed to parse JSON for ${content.page}/${content.section}/${content.key}`);
          // Fallback to simple string replacement if JSON fails but contains the path
          newValue = content.value.split("/staynamcheon/temp/").join("/staynamcheon/gallery/");
        }
      } else {
        // Handle single URL
        newValue = await moveCloudinaryFile(content.value, "staynamcheon/single");
      }

      if (newValue && newValue !== content.value) {
        if (!DRY_RUN) {
          await prisma.stayPageContent.update({
            where: { id: content.id },
            data: { value: newValue },
          });
          console.log(`✅ Updated Page Content: ${content.page}/${content.section}/${content.key}`);
        } else {
          console.log(`[DRY RUN] Would update Page Content ${content.page}/${content.section}/${content.key}`);
        }
      }
    }

    console.log("\n✨ Migration finished.");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

async function moveCloudinaryFile(url: string, targetFolder: string, resourceType: "image" | "video" = "image"): Promise<string | null> {
  if (!url || !url.includes("/staynamcheon/temp/")) return url;

  // Extract public ID
  // Format: .../upload/v1234567/staynamcheon/temp/filename.ext
  const parts = url.split("/upload/");
  if (parts.length < 2) return url;

  const pathParts = parts[1].split("/");
  // pathParts will look like ["v1234567", "staynamcheon", "temp", "filename.jpg"]
  // Public ID in Cloudinary API is everything after "upload/" and optional version, MINUS EXTENSION
  
  // Find where staynamcheon starts
  const startIndex = pathParts.indexOf("staynamcheon");
  if (startIndex === -1) return url;

  const publicIdWithExt = pathParts.slice(startIndex).join("/");
  const publicId = publicIdWithExt.split(".").slice(0, -1).join(".");
  
  const newPublicId = publicId.replace("staynamcheon/temp", targetFolder);
  
  if (!DRY_RUN) {
    try {
      // First verify it exists and get correct resource type
      const resourceInfo = await cloudinary.api.resource(publicId).catch(() => null);
      if (!resourceInfo) {
        // Try without staynamcheon/ prefix just in case
        const altPublicId = publicId.replace("staynamcheon/", "");
        const altInfo = await cloudinary.api.resource(altPublicId).catch(() => null);
        if (altInfo) {
           console.log(`💡 Found with alt ID: ${altPublicId}`);
           await cloudinary.uploader.rename(altPublicId, newPublicId.replace("staynamcheon/", ""), { resource_type: altInfo.resource_type });
           return url.replace(altPublicId, newPublicId.replace("staynamcheon/", ""));
        }
        console.error(`❌ Resource not found: ${publicId}`);
        return url;
      }

      await cloudinary.uploader.rename(publicId, newPublicId, { resource_type: resourceInfo.resource_type });
      console.log(`➡️ Renamed: ${publicId} -> ${newPublicId}`);
      return url.replace(publicId, newPublicId);
    } catch (e: any) {
      console.error(`Failed to rename ${publicId}:`, e.message);
      return url;
    }
  } else {
    console.log(`[DRY RUN] Rename: ${publicId} -> ${newPublicId}`);
    return url.replace(publicId, newPublicId);
  }
}

async function processJsonImages(obj: any): Promise<any> {
  if (typeof obj === "string") {
    if (obj.includes("/staynamcheon/temp/")) {
      return await moveCloudinaryFile(obj, "staynamcheon/gallery");
    }
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return await Promise.all(obj.map(item => processJsonImages(item)));
  }
  
  if (obj !== null && typeof obj === "object") {
    const newObj: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === "src" || key === "image" || key === "imageUrl" || key === "videoUrl") {
        newObj[key] = await processJsonImages(value);
      } else {
        newObj[key] = await processJsonImages(value);
      }
    }
    return newObj;
  }
  
  return obj;
}

migrate();
