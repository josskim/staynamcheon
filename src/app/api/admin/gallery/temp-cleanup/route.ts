import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items = Array.isArray(body?.items) ? body.items : [];
    const publicIds = Array.isArray(body?.publicIds) ? body.publicIds : [];
    const mode = typeof body?.mode === "string" ? body.mode : "";

    const normalized = [
      ...items.map((item: any) => ({
        publicId: item.publicId || item.public_id || "",
        type: item.type || "image",
      })),
      ...publicIds.map((publicId: string) => ({
        publicId,
        type: "image",
      })),
    ].filter((entry) => typeof entry.publicId === "string" && entry.publicId.length > 0);

    if (mode === "all") {
      let deleted = 0;
      const assetFolder = "staynamcheon/temp";

      const deleteByAssetFolder = async (resourceType: "image" | "video") => {
        let nextCursor: string | undefined;
        do {
          const result: any = await cloudinary.api.resources_by_asset_folder(assetFolder, {
            type: "upload",
            resource_type: resourceType,
            max_results: 500,
            next_cursor: nextCursor,
          });
          const resources = Array.isArray(result?.resources) ? result.resources : [];
          for (const res of resources) {
            if (!res?.public_id) continue;
            try {
              await cloudinary.uploader.destroy(res.public_id, { resource_type: resourceType });
              deleted += 1;
            } catch (cleanupErr) {
              console.warn("Temp cleanup warning:", cleanupErr);
            }
          }
          nextCursor = result?.next_cursor;
        } while (nextCursor);
      };

      await deleteByAssetFolder("image");
      await deleteByAssetFolder("video");

      return NextResponse.json({ success: true, deleted });
    }

    if (normalized.length === 0) {
      return NextResponse.json({ success: true, deleted: 0 });
    }

    let deleted = 0;
    for (const entry of normalized) {
      if (!entry.publicId.includes("temp/")) continue;
      const resourceType = entry.type === "video" ? "video" : "image";
      try {
        await cloudinary.uploader.destroy(entry.publicId, { resource_type: resourceType });
        deleted += 1;
      } catch (cleanupErr) {
        console.warn("Temp cleanup warning:", cleanupErr);
      }
    }

    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    console.error("Temp cleanup error:", error);
    return NextResponse.json({ message: "Error cleaning temp assets" }, { status: 500 });
  }
}
