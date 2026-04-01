import { v2 as cloudinary } from "cloudinary";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const IMAGE_PATH = "C:\\Users\\youby\\.claude\\channels\\telegram\\inbox\\1774700501246-AQAD1g9rGznMOVZ-.jpg";

cloudinary.config({
  cloud_name: "ddwzlwbt8",
  api_key: "277488845234155",
  api_secret: "HLwJdLF-D6afeCSpYg6tTehsctg",
});

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_etYKQh15ZuTR@ep-late-frost-a1dl7dc2-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
    }
  }
});

// pages: array of "page>section" tags, e.g. ["gallery>gallery", "cafe>gallery"]
// insertOrder: which order position to insert (default 5)
async function uploadAndTag(filePath, resourceType, pages, insertOrder = 5) {
  console.log(`Uploading ${resourceType} to Cloudinary...`);

  const uploadResult = await cloudinary.uploader.upload(filePath, {
    folder: "staynamcheon/gallery",
    asset_folder: "staynamcheon/gallery",
    resource_type: resourceType,
  });

  const imageUrl = uploadResult.secure_url;
  const publicId = uploadResult.public_id;
  let posterUrl = imageUrl;

  if (resourceType === "video") {
    posterUrl = cloudinary.url(publicId, {
      resource_type: "video",
      format: "jpg",
      transformation: [{ width: 1280, height: 720, crop: "fill", quality: "auto", fetch_format: "auto", start_offset: "0" }],
    });
  }

  console.log("Uploaded:", imageUrl);

  // Shift items at insertOrder and above
  const allItems = await prisma.stayGalleryItem.findMany({ orderBy: { order: "asc" } });
  const itemsToShift = allItems.filter(item => item.order >= insertOrder);
  for (const item of itemsToShift) {
    await prisma.stayGalleryItem.update({ where: { id: item.id }, data: { order: item.order + 1 } });
  }

  const newItem = await prisma.stayGalleryItem.create({
    data: {
      imageUrl: resourceType === "video" ? posterUrl : imageUrl,
      videoUrl: resourceType === "video" ? imageUrl : undefined,
      publicId,
      type: resourceType,
      order: insertOrder,
      isVisible: true,
      isMain: false,
      pages: pages.length > 0 ? JSON.stringify(pages) : null,
    },
  });

  console.log("Created:", newItem.id, "at order", insertOrder, "| pages:", pages);
  return { imageUrl, publicId, newItem };
}

async function main() {
  // Example: change these per upload
  const FILE_PATH = IMAGE_PATH;
  const RESOURCE_TYPE = "image"; // "image" or "video"
  const PAGES = ["gallery>gallery", "cafe>gallery"]; // target pages
  const INSERT_ORDER = 5;

  await uploadAndTag(FILE_PATH, RESOURCE_TYPE, PAGES, INSERT_ORDER);
  console.log("\nDone!");
}

main()
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
