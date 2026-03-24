"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import Image from "next/image";
import { getThumbnailUrl, getMiniThumbnailUrl, getOptimizeImageUrl, getH264VideoUrl, getVideoThumbnailUrl } from "@/lib/cloudinary";
import LazyVideo from "@/components/LazyVideo";

interface ImageItem {
  src: string;
  alt: string;
}

export default function FacilityGallery({ images }: { images: ImageItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!images || images.length === 0) {
    return <div className="aspect-[4/3] rounded-2xl bg-muted animate-pulse" />;
  }

  const next = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  const isVideo = (src: string) => src.toLowerCase().endsWith(".mp4") || src.includes("/video/upload/");

  return (
    <div className="relative group">
      <div
        className="aspect-[4/3] overflow-hidden rounded-2xl bg-muted shadow-xl border border-border/50 cursor-pointer"
        onClick={() => setLightboxOpen(true)}
      >
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
              <LazyVideo
                src={getH264VideoUrl(images[currentIndex].src)}
                className="h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <div className="relative h-full w-full">
                <Image
                  src={getThumbnailUrl(images[currentIndex].src, 1400)}
                  alt={images[currentIndex].alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* 확대 아이콘 */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
          <Maximize2 className="text-white w-10 h-10 drop-shadow-lg" strokeWidth={1.5} />
        </div>
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40 z-10"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
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
            className={`relative w-16 aspect-square rounded-md overflow-hidden border-2 shrink-0 transition-all ${
              idx === currentIndex ? "border-secondary opacity-100 scale-105" : "border-transparent opacity-50 hover:opacity-100"
            }`}
          >
            {isVideo(img.src) ? (
              <div className="h-full w-full relative">
                <Image
                  src={getVideoThumbnailUrl(img.src, 200)}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover opacity-60"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                   <Maximize2 size={12} className="text-white" />
                </div>
              </div>
            ) : (
              <Image
                src={getMiniThumbnailUrl(img.src)}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            )}
          </button>
        ))}
      </div>

      {/* 라이트박스 */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute right-8 top-8 rounded-full p-2 text-white/50 hover:text-white transition-colors z-50"
            >
              <X className="h-10 w-10" />
            </button>

            {images.length > 1 && (
              <>
                <button
                  className="absolute left-8 top-1/2 -translate-y-1/2 p-4 text-white/30 hover:text-white transition-colors z-50"
                  onClick={(e) => { e.stopPropagation(); prev(); }}
                >
                  <ChevronLeft size={48} strokeWidth={1} />
                </button>
                <button
                  className="absolute right-8 top-1/2 -translate-y-1/2 p-4 text-white/30 hover:text-white transition-colors z-50"
                  onClick={(e) => { e.stopPropagation(); next(); }}
                >
                  <ChevronRight size={48} strokeWidth={1} />
                </button>
              </>
            )}

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative flex items-center justify-center w-full max-w-[90vw] px-4"
              onClick={(e) => e.stopPropagation()}
            >
              {isVideo(images[currentIndex].src) ? (
                <video
                  src={getH264VideoUrl(images[currentIndex].src)}
                  className="max-h-[85vh] max-w-full rounded-lg shadow-2xl object-contain"
                  controls
                  autoPlay
                  playsInline
                />
              ) : (
                <div className="relative w-full aspect-video max-h-[85vh]">
                  <Image
                    src={getOptimizeImageUrl(images[currentIndex].src, { width: 1600 })}
                    alt={images[currentIndex].alt}
                    fill
                    sizes="90vw"
                    className="rounded-lg shadow-2xl object-contain"
                  />
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
