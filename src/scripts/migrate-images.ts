import { v2 as cloudinary } from "cloudinary";
import { PrismaClient } from "@prisma/client";
import * as https from "https";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const prisma = new PrismaClient();
const DRY_RUN = process.argv.includes("--dry-run");
const urlCache = new Map<string, string>();
const tmpDir = path.join(os.tmpdir(), "staynamcheon-migrate");

async function migrate() {
  console.log(`\n🚀 ${DRY_RUN ? "DRY RUN MODE" : "MIGRATION MODE"}\n`);
  console.log("Strategy: Download from CDN → Save locally → Upload to gallery → Update DB\n");

  if (!DRY_RUN && !fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  let successCount = 0;
  let failCount = 0;

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

      if (item.imageUrl?.includes("/staynamcheon/temp/")) {
        const newUrl = await reuploadViaDownload(item.imageUrl, "staynamcheon/gallery");
        if (newUrl && newUrl !== item.imageUrl) {
          updates.imageUrl = newUrl;
          successCount++;
        } else { failCount++; }
      }

      if (item.videoUrl?.includes("/staynamcheon/temp/")) {
        const newUrl = await reuploadViaDownload(item.videoUrl, "staynamcheon/gallery", "video");
        if (newUrl && newUrl !== item.videoUrl) {
          updates.videoUrl = newUrl;
          successCount++;
        } else { failCount++; }
      }

      if (Object.keys(updates).length > 0 && !DRY_RUN) {
        await prisma.stayGalleryItem.update({ where: { id: item.id }, data: updates });
        console.log(`  ✅ Updated Gallery Item: ${item.id}`);
      }
    }

    // 2. Process StayPageContent
    const pageContents = await prisma.stayPageContent.findMany({
      where: { value: { contains: "/staynamcheon/temp/" } },
    });

    console.log(`\nFound ${pageContents.length} Page Content items to migrate.`);

    for (const content of pageContents) {
      console.log(`\n📄 Processing: ${content.page}/${content.section}/${content.key}`);
      let newValue: string | null = null;

      if (content.value.startsWith("[") || content.value.startsWith("{")) {
        try {
          const data = JSON.parse(content.value);
          const { result, stats } = await processJsonImages(data);
          newValue = JSON.stringify(result);
          successCount += stats.success;
          failCount += stats.fail;
          console.log(`  JSON processed: ${stats.success} migrated, ${stats.fail} failed`);
        } catch (e) {
          console.error(`  ❌ Failed to parse JSON`);
          failCount++;
        }
      } else {
        const newUrl = await reuploadViaDownload(content.value, "staynamcheon/gallery");
        if (newUrl && newUrl !== content.value) {
          newValue = newUrl;
          successCount++;
        } else { failCount++; }
      }

      if (newValue && newValue !== content.value) {
        if (!DRY_RUN) {
          await prisma.stayPageContent.update({ where: { id: content.id }, data: { value: newValue } });
          console.log(`  ✅ DB Updated: ${content.page}/${content.section}/${content.key}`);
        } else {
          console.log(`  [DRY RUN] Would update ${content.page}/${content.section}/${content.key}`);
        }
      }
    }

    console.log(`\n📊 Results: ${successCount} migrated, ${failCount} failed`);
    console.log("✨ Migration finished.");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
  } finally {
    await prisma.$disconnect();
    // Clean up temp dir
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  }
}

function downloadFile(url: string, dest: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      res.pipe(file);
      file.on("finish", () => { file.close(); resolve(dest); });
    }).on("error", (e) => {
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      reject(e);
    });
  });
}

async function reuploadViaDownload(
  url: string,
  targetFolder: string,
  _resourceType?: string
): Promise<string | null> {
  if (!url || !url.includes("/staynamcheon/temp/")) return url;

  if (urlCache.has(url)) {
    return urlCache.get(url)!;
  }

  const detectedType = url.includes("/video/upload/") ? "video" : "image";
  const segments = url.split("/");
  const filenameWithExt = segments[segments.length - 1];
  const filename = filenameWithExt.split(".").slice(0, -1).join(".");
  const newPublicId = `${targetFolder}/${filename}`;

  if (DRY_RUN) {
    console.log(`  [DRY RUN] Would migrate: ${filenameWithExt} → ${newPublicId}`);
    const fakeUrl = url.replace("/staynamcheon/temp/", "/staynamcheon/gallery/");
    urlCache.set(url, fakeUrl);
    return fakeUrl;
  }

  try {
    // Check if already exists in gallery
    try {
      const existing = await cloudinary.api.resource(newPublicId, { resource_type: detectedType });
      if (existing) {
        console.log(`  ✓ Already in gallery: ${filename}`);
        urlCache.set(url, existing.secure_url);
        return existing.secure_url;
      }
    } catch { /* not found, proceed */ }

    // Download from CDN (versioned URL still works)
    const tmpFile = path.join(tmpDir, filenameWithExt);
    await downloadFile(url, tmpFile);

    // Upload to gallery
    const result = await cloudinary.uploader.upload(tmpFile, {
      public_id: newPublicId,
      resource_type: detectedType as any,
      overwrite: false,
    });

    // Clean up temp file
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);

    console.log(`  ✅ ${filenameWithExt} → gallery`);
    urlCache.set(url, result.secure_url);
    return result.secure_url;
  } catch (e: any) {
    console.error(`  ❌ Failed: ${filenameWithExt} - ${e.message}`);
    return url;
  }
}

async function processJsonImages(obj: any): Promise<{ result: any; stats: { success: number; fail: number } }> {
  const stats = { success: 0, fail: 0 };

  async function process(val: any): Promise<any> {
    if (typeof val === "string") {
      if (val.includes("/staynamcheon/temp/")) {
        const newUrl = await reuploadViaDownload(val, "staynamcheon/gallery");
        if (newUrl && newUrl !== val) { stats.success++; return newUrl; }
        else { stats.fail++; return val; }
      }
      return val;
    }
    if (Array.isArray(val)) {
      const results = [];
      for (const item of val) {
        results.push(await process(item));
      }
      return results;
    }
    if (val !== null && typeof val === "object") {
      const newObj: any = {};
      for (const [key, value] of Object.entries(val)) {
        newObj[key] = await process(value);
      }
      return newObj;
    }
    return val;
  }

  const result = await process(obj);
  return { result, stats };
}

migrate();
