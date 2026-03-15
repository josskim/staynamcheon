"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

interface Image {
  src: string;
  alt: string;
}

export default function FacilityGallery({ images }: { images: Image[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return <div className="aspect-[4/3] rounded-2xl bg-muted animate-pulse" />;
  }

  const next = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  const isVideo = (src: string) => src.toLowerCase().endsWith(".mp4");

  return (
    <div className="relative group">
      <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-muted shadow-xl border border-border/50">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="h-full w-full"
          >
            {isVideo(images[currentIndex].src) ? (
              <video
                src={images[currentIndex].src}
                className="h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <img
                src={images[currentIndex].src}
                alt={images[currentIndex].alt}
                className="h-full w-full object-cover"
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40 z-10"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40 z-10"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-16 aspect-square rounded-md overflow-hidden border-2 shrink-0 transition-all ${
              idx === currentIndex ? "border-secondary opacity-100 scale-105" : "border-transparent opacity-50 hover:opacity-100"
            }`}
          >
            {isVideo(img.src) ? (
              <div className="h-full w-full bg-muted flex items-center justify-center relative">
                <video src={img.src} className="h-full w-full object-cover opacity-50" />
                <Maximize2 size={12} className="absolute text-white" />
              </div>
            ) : (
              <img src={img.src} alt="" className="h-full w-full object-cover" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
