import { v2 as cloudinary } from "cloudinary";
import { PrismaClient } from "@prisma/client";

const VIDEO_PATH = "C:\\Users\\youby\\.claude\\channels\\telegram\\inbox\\1774704330816-AgADeBwAAjnMQVY.mp4";

const requireEnv = (key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is required`);
  }
  return value;
};

cloudinary.config({
  cloud_name: requireEnv("CLOUDINARY_CLOUD_NAME"),
  api_key: requireEnv("CLOUDINARY_API_KEY"),
  api_secret: requireEnv("CLOUDINARY_API_SECRET"),
});

const prisma = new PrismaClient({
  datasources: { db: { url: requireEnv("DATABASE_URL") } }
});

async function main() {
  console.log("Uploading video...");
  const result = await cloudinary.uploader.upload(VIDEO_PATH, {
    folder: "staynamcheon/gallery",
    asset_folder: "staynamcheon/gallery",
    resource_type: "video",
  });

  const videoUrl = result.secure_url;
  const publicId = result.public_id;
  const posterUrl = cloudinary.url(publicId, {
    resource_type: "video", format: "jpg",
    transformation: [{ width: 1280, height: 720, crop: "fill", quality: "auto", fetch_format: "auto", start_offset: "0" }],
  });

  console.log("Uploaded:", videoUrl);

  // Shift items at order >= 5
  const allItems = await prisma.stayGalleryItem.findMany({ orderBy: { order: "asc" } });
  for (const item of allItems.filter(i => i.order >= 5)) {
    await prisma.stayGalleryItem.update({ where: { id: item.id }, data: { order: item.order + 1 } });
  }

  const newItem = await prisma.stayGalleryItem.create({
    data: { imageUrl: posterUrl, videoUrl, publicId, type: "video", order: 5, isVisible: true, isMain: false, pages: null },
  });

  console.log("Created:", newItem.id, "at order 5");
  console.log("Done!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
