"use client";

import { useEffect, useState } from "react";
import { X, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ScrollReveal from "./ScrollReveal";

interface GalleryItem {
  src: string;
  alt: string;
}

interface RoomGalleryProps {
  images: GalleryItem[];
}

const RoomGallery = ({ images }: RoomGalleryProps) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = "hidden";
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setLightboxIndex(null);
        if (e.key === "ArrowRight") setLightboxIndex((prev) => (prev !== null ? (prev + 1) % images.length : null));
        if (e.key === "ArrowLeft") setLightboxIndex((prev) => (prev !== null ? (prev - 1 + images.length) % images.length : null));
      };
      window.addEventListener("keydown", handleKey);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKey);
      };
    }
  }, [lightboxIndex, images.length]);

  const isVideo = (src: string) => src.toLowerCase().endsWith(".mp4");

  return (
    <>
      <section className="section-spacing">
        <div className="mx-auto max-w-7xl px-6">
          <ScrollReveal>
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-semibold tracking-tight md:text-6xl">
                Gallery
              </h2>
              <p className="mt-4 text-sm text-muted-foreground tracking-[0.2em] uppercase">
                A glimpse into the stillness of StayNamcheon
              </p>
            </div>
          </ScrollReveal>
          
          <div className="columns-1 gap-8 sm:columns-2 lg:columns-3">
            {images.map((item, i) => (
              <ScrollReveal key={i} delay={i % 3 * 0.1}>
                <div
                  className="group relative mb-8 cursor-pointer overflow-hidden rounded-xl bg-muted"
                  onClick={() => setLightboxIndex(i)}
                >
                  {isVideo(item.src) ? (
                    <div className="relative aspect-video">
                      <video
                        src={item.src}
                        className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                        muted
                        playsInline
                        loop
                        onMouseOver={(e) => e.currentTarget.play()}
                        onMouseOut={(e) => {
                          e.currentTarget.pause();
                          e.currentTarget.currentTime = 0;
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-colors">
                        <Play className="text-white w-12 h-12 opacity-80" strokeWidth={1.5} />
                      </div>
                    </div>
                  ) : (
                    <img
                      src={item.src}
                      alt={item.alt}
                      className="w-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-75"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-black/10">
                    <span className="text-white text-sm font-light tracking-[0.3em] uppercase">
                      {isVideo(item.src) ? "Play Video" : "View Image"}
                    </span>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute right-8 top-8 rounded-full p-2 text-white/50 transition-colors hover:text-white"
              aria-label="Close lightbox"
            >
              <X className="h-10 w-10" />
            </button>
            <button
              className="absolute left-8 top-1/2 -translate-y-1/2 rounded-full p-4 text-4xl text-white/30 transition-colors hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev !== null ? (prev - 1 + images.length) % images.length : null));
              }}
            >
              ‹
            </button>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="px-4"
            >
              {isVideo(images[lightboxIndex].src) ? (
                <video
                  src={images[lightboxIndex].src}
                  className="max-h-[85vh] max-w-[90vw] rounded-lg shadow-2xl object-contain"
                  controls
                  autoPlay
                  playsInline
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <img
                  src={images[lightboxIndex].src}
                  alt={images[lightboxIndex].alt}
                  className="max-h-[85vh] max-w-[90vw] rounded-lg shadow-2xl object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
            </motion.div>
            <button
              className="absolute right-8 top-1/2 -translate-y-1/2 rounded-full p-4 text-4xl text-white/30 transition-colors hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev !== null ? (prev + 1) % images.length : null));
              }}
            >
              ›
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default RoomGallery;
