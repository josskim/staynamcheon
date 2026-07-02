import { v2 as cloudinary } from "cloudinary";
import { PrismaClient } from "@prisma/client";

const VIDEO_PATH = "C:\\Users\\youby\\.claude\\channels\\telegram\\inbox\\1774700954138-AgADfxoAAjnMOVY.mp4";

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
  datasources: {
    db: {
      url: requireEnv("DATABASE_URL")
    }
  }
});

const buildVideoPosterUrl = (publicId) =>
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

async function main() {
  console.log("Uploading video to Cloudinary...");

  const uploadResult = await cloudinary.uploader.upload(VIDEO_PATH, {
    folder: "staynamcheon/gallery",
    asset_folder: "staynamcheon/gallery",
    resource_type: "video",
  });

  const videoUrl = uploadResult.secure_url;
  const publicId = uploadResult.public_id;
  const posterUrl = buildVideoPosterUrl(publicId);

  console.log("Uploaded:", videoUrl);
  console.log("Poster:", posterUrl);

  // Get all current items ordered by order
  const allItems = await prisma.stayGalleryItem.findMany({
    orderBy: { order: "asc" },
  });

  console.log(`Current gallery items: ${allItems.length}`);

  // Shift items at order >= 5 up by 1
  const itemsToShift = allItems.filter(item => item.order >= 5);
  for (const item of itemsToShift) {
    await prisma.stayGalleryItem.update({
      where: { id: item.id },
      data: { order: item.order + 1 },
    });
  }

  // Insert new video at order=5
  const newItem = await prisma.stayGalleryItem.create({
    data: {
      imageUrl: posterUrl,
      videoUrl,
      publicId,
      type: "video",
      order: 5,
      isVisible: true,
      isMain: false,
    },
  });

  console.log("Gallery video created:", newItem.id, "at order 5");
  console.log("\nDone!");
}

main()
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
