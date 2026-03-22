"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { getThumbnailUrl } from "@/lib/cloudinary";
import LazyVideo from "./LazyVideo";

const GallerySection = () => {
  const [items, setItems] = useState<any[]>([]);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-10%" });

  useEffect(() => {
    fetch("/api/admin/gallery?isMain=true")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setItems(data.filter((item: any) => item.isVisible));
        }
      })
      .catch(err => console.error("Gallery fetch error:", err));
  }, []);

  // Fallback items if database is empty
  const displayItems = items.length > 0 ? items : [
    { id: 'f1', imageUrl: "/images/lovable/gallery1.jpg" },
    { id: 'f2', imageUrl: "/images/lovable/gallery2.jpg" },
    { id: 'f3', imageUrl: "/images/lovable/gallery3.jpg" },
    { id: 'f4', imageUrl: "/images/lovable/hero.jpg" },
    { id: 'f5', imageUrl: "/images/lovable/pension.jpg" },
    { id: 'f6', imageUrl: "/images/lovable/cafe.jpg" },
    { id: 'f7', imageUrl: "/images/lovable/campnic.jpg" },
  ];

  const isVideo = (item: any) => {
    if (item?.type === "video") return true;
    if (typeof item?.imageUrl === "string" && item.imageUrl.toLowerCase().endsWith(".mp4")) return true;
    return false;
  };

  return (
    <section id="gallery" ref={containerRef} className="py-24 bg-background">
      <div className="section-padding mb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center"
        >
          <h2 className="font-display text-7xl md:text-8xl font-normal text-foreground tracking-tight mb-4">Gallery<span className="text-secondary">.</span></h2>
          <span className="text-[10px] md:text-xs font-body font-medium tracking-[0.6em] uppercase text-foreground/40 block">A glimpse into the stillness of staynamcheon</span>
        </motion.div>
      </div>

      <div className="section-padding max-w-[1500px] mx-auto">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {displayItems.map((rawItem: any, i: number) => {
            const item = typeof rawItem === 'string' ? { imageUrl: rawItem, title: "" } : rawItem;
            return (
              <motion.div
                key={item.id || i}
                className="break-inside-avoid relative rounded-3xl overflow-hidden cursor-pointer group mb-8"
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: i * 0.1 }}
                whileHover={{ scale: 0.99, transition: { duration: 0.4 } }}
              >
                {isVideo(item) ? (
                  <LazyVideo
                    src={item.videoUrl || item.imageUrl}
                    className={`w-full h-auto object-cover grayscale-30 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-in-out ${
                      i % 3 === 0 ? "aspect-[4/5]" : i % 3 === 1 ? "aspect-square" : "aspect-[3/4]"
                    }`}
                    muted
                    playsInline
                    loop
                    autoPlay
                    poster={item.imageUrl ? getThumbnailUrl(item.imageUrl, 300) : ""}
                  />
                ) : (
                  <div className={cn(
                    "relative group-hover:scale-105 transition-all duration-1000 ease-in-out",
                    i % 3 === 0 ? "aspect-[4/5]" : i % 3 === 1 ? "aspect-square" : "aspect-[3/4]"
                  )}>
                    <Image
                      src={getThumbnailUrl(item.imageUrl)}
                      alt={item.title || "Gallery image"}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </motion.div>
            );
          })}

          {/* More Button */}
          <motion.div
            className={cn(
              "break-inside-avoid relative rounded-3xl overflow-hidden cursor-pointer group mb-8 aspect-square",
              "border border-dashed border-foreground/20 flex flex-col items-center justify-center bg-foreground/5 hover:bg-foreground/10 transition-colors"
            )}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: displayItems.length * 0.1 }}
          >
            <Link href="/gallery" className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <span className="font-display text-4xl mb-2">More.</span>
              <span className="text-[10px] uppercase tracking-widest text-foreground/40 font-medium">View Full Gallery</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
