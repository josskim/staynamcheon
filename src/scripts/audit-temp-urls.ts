import { v2 as cloudinary } from "cloudinary";
import { PrismaClient } from "@prisma/client";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const prisma = new PrismaClient();

function extractPublicId(url: string): string | null {
  const parts = url.split("/upload/");
  if (parts.length < 2) return null;
  const pathParts = parts[1].split("/");
  const startIndex = pathParts.indexOf("staynamcheon");
  if (startIndex === -1) return null;
  const publicIdWithExt = pathParts.slice(startIndex).join("/");
  return publicIdWithExt.split(".").slice(0, -1).join(".");
}

function tempToGallery(publicId: string): string {
  return publicId.replace("staynamcheon/temp", "staynamcheon/gallery");
}

async function checkExists(publicId: string, resourceType: string = "image"): Promise<boolean> {
  try {
    await cloudinary.api.resource(publicId, { resource_type: resourceType });
    return true;
  } catch {
    return false;
  }
}

async function audit() {
  console.log("\n=== DB Audit: temp URL References ===\n");

  // 1. StayGalleryItem
  const galleryItems = await prisma.stayGalleryItem.findMany({
    where: {
      OR: [
        { imageUrl: { contains: "/staynamcheon/temp/" } },
        { videoUrl: { contains: "/staynamcheon/temp/" } },
      ],
    },
  });

  console.log(`\n📦 StayGalleryItem with temp URLs: ${galleryItems.length}`);
  for (const item of galleryItems) {
    console.log(`  ID: ${item.id}`);
    if (item.imageUrl?.includes("/staynamcheon/temp/")) {
      const pubId = extractPublicId(item.imageUrl);
      const galleryId = pubId ? tempToGallery(pubId) : null;
      const tempExists = pubId ? await checkExists(pubId) : false;
      const galleryExists = galleryId ? await checkExists(galleryId) : false;
      console.log(`    imageUrl: ${item.imageUrl}`);
      console.log(`    publicId: ${pubId}`);
      console.log(`    temp exists: ${tempExists} | gallery exists: ${galleryExists}`);
    }
    if (item.videoUrl?.includes("/staynamcheon/temp/")) {
      const pubId = extractPublicId(item.videoUrl);
      const galleryId = pubId ? tempToGallery(pubId) : null;
      const tempExists = pubId ? await checkExists(pubId, "video") : false;
      const galleryExists = galleryId ? await checkExists(galleryId, "video") : false;
      console.log(`    videoUrl: ${item.videoUrl}`);
      console.log(`    publicId: ${pubId}`);
      console.log(`    temp exists: ${tempExists} | gallery exists: ${galleryExists}`);
    }
  }

  // 2. StayPageContent
  const pageContents = await prisma.stayPageContent.findMany({
    where: {
      value: { contains: "/staynamcheon/temp/" },
    },
  });

  console.log(`\n📄 StayPageContent with temp URLs: ${pageContents.length}`);
  for (const content of pageContents) {
    console.log(`  ${content.page}/${content.section}/${content.key} (type: ${content.type})`);

    // Extract all temp URLs from the value
    const urlMatches = content.value.match(/https?:\/\/[^\s"',]+\/staynamcheon\/temp\/[^\s"',]+/g) || [];
    for (const url of urlMatches.slice(0, 5)) { // limit to 5 per record
      const pubId = extractPublicId(url);
      const galleryId = pubId ? tempToGallery(pubId) : null;
      const isVideo = url.includes("/video/upload/");
      const tempExists = pubId ? await checkExists(pubId, isVideo ? "video" : "image") : false;
      const galleryExists = galleryId ? await checkExists(galleryId, isVideo ? "video" : "image") : false;
      console.log(`    URL: ${url.substring(0, 80)}...`);
      console.log(`    publicId: ${pubId}`);
      console.log(`    temp exists: ${tempExists} | gallery exists: ${galleryExists}`);
    }
    if (urlMatches.length > 5) {
      console.log(`    ... and ${urlMatches.length - 5} more URLs`);
    }
  }

  // 3. Summary of ALL gallery items (not just temp)
  const totalGallery = await prisma.stayGalleryItem.count();
  const totalContent = await prisma.stayPageContent.count();
  console.log(`\n📊 Summary:`);
  console.log(`  Total StayGalleryItem records: ${totalGallery}`);
  console.log(`  Total StayPageContent records: ${totalContent}`);
  console.log(`  Gallery items with temp URLs: ${galleryItems.length}`);
  console.log(`  Page content with temp URLs: ${pageContents.length}`);

  // 4. List Cloudinary folder contents
  console.log(`\n☁️  Cloudinary folder status:`);
  try {
    const tempResources: any = await cloudinary.api.resources({
      type: "upload",
      prefix: "staynamcheon/temp",
      max_results: 10,
    });
    console.log(`  staynamcheon/temp: ${tempResources.resources.length} resources`);
  } catch (e: any) {
    console.log(`  staynamcheon/temp: error - ${e.message}`);
  }

  try {
    const galleryResources: any = await cloudinary.api.resources({
      type: "upload",
      prefix: "staynamcheon/gallery",
      max_results: 100,
    });
    console.log(`  staynamcheon/gallery: ${galleryResources.resources.length} resources`);
  } catch (e: any) {
    console.log(`  staynamcheon/gallery: error - ${e.message}`);
  }

  await prisma.$disconnect();
  console.log("\n✅ Audit complete.\n");
}

audit();
