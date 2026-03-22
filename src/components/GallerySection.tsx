"use client";

import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { getThumbnailUrl } from "@/lib/cloudinary";

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

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-40%"]);

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
            </motion.div>
          ))}

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
