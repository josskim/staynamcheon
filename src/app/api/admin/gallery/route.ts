import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";

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

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get("limit");

  try {
    const items = await prisma.stayGalleryItem.findMany({
      orderBy: [
        { order: "asc" },
        { createdAt: "desc" }
      ],
      take: limit ? parseInt(limit) : undefined,
    });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching gallery items" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { items } = await request.json(); // Array of { id, order }
    
    // Perform bulk update in a transaction
    await prisma.$transaction(
      items.map((item: any) => 
        prisma.stayGalleryItem.update({
          where: { id: item.id },
          data: { order: item.order }
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Batch update error:", error);
    return NextResponse.json({ message: "Error reordering items" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const item = await prisma.stayGalleryItem.create({
      data: {
        ...data,
        order: (await prisma.stayGalleryItem.count()) + 1,
      },
    });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ message: "Error creating gallery item" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ message: "ID required" }, { status: 400 });

  try {
    const item = await prisma.stayGalleryItem.delete({
      where: { id },
    });

    const resourceType = item.type === "video" ? "video" : "image";
    const publicId = item.publicId || extractPublicIdFromUrl(item.imageUrl);
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
      } catch (cleanupErr) {
        console.warn("Cloudinary delete warning:", cleanupErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: "Error deleting gallery item" }, { status: 500 });
  }
}
