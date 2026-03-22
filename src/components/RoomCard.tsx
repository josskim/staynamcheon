"use client";

import { useState, useEffect } from "react";
import ScrollReveal from "./ScrollReveal";
import { ChevronLeft, ChevronRight, X, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


interface PriceItem {
  price: string;
  label: string;
}

interface RoomCardProps {
  name: string;
  description: string;
  image: string;
  gallery?: { id?: string; src: string; alt?: string; type?: "image" | "video" }[];
  prices: PriceItem[];
  index: number;
}


const RoomCard = ({ name, description, image, gallery, prices, index }: RoomCardProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const images = gallery && gallery.length > 0 ? gallery : [{ src: image }];
  const currentImage = images[activeIndex] || images[0];

  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = "hidden";
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setIsLightboxOpen(false);
        if (e.key === "ArrowRight") setActiveIndex((prev) => (prev + 1) % images.length);
        if (e.key === "ArrowLeft") setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
      };
      window.addEventListener("keydown", handleKey);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKey);
      };
    }
  }, [isLightboxOpen, images.length]);

  return (

    <ScrollReveal delay={index * 0.1}>
      <div className="card-border rounded-lg overflow-hidden bg-card group">
        <div 
          className="image-hover aspect-[21/9] md:aspect-[3/1] relative cursor-pointer"
          onClick={() => setIsLightboxOpen(true)}
        >
          {currentImage.type === "video" || currentImage.src?.endsWith(".mp4") ? (
            <video
              src={currentImage.src}
              className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <img
              src={currentImage.src}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
              loading="lazy"
            />
          )}

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all z-30"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex((prev) => (prev + 1) % images.length);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all z-30"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Description Overlay */}
          {currentImage.alt && (
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-20">
              <p className="text-white text-sm font-medium tracking-wide drop-shadow-md">
                {currentImage.alt}
              </p>
            </div>
          )}

          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-black/10 z-10 pointer-events-none">
            <span className="text-white text-sm font-light tracking-[0.3em] uppercase drop-shadow-md">
              View Image
            </span>
          </div>
        </div>

        {images.length > 1 && (
          <div className="flex gap-3 p-4 overflow-x-auto bg-muted/30 border-b border-border hide-scrollbar">
            {images.map((img, idx) => (
              <button 
                key={idx} 
                onClick={() => setActiveIndex(idx)}
                className={`relative flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all ${idx === activeIndex ? "border-foreground scale-105 shadow-md" : "border-transparent opacity-60 hover:opacity-100"}`}
              >
                {img.type === "video" || img.src?.endsWith(".mp4") ? (
                  <video src={img.src} className="w-full h-full object-cover" />
                ) : (
                  <img src={img.src} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                )}
              </button>
            ))}
          </div>
        )}
        <div className="p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-xl">
              <h3 className="text-3xl font-semibold tracking-tight md:text-4xl">
                {name}
              </h3>
              <p className="mt-4 text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {description}
              </p>
            </div>

            <div className="flex-1 min-w-[300px] space-y-4">
              {prices.map((item, i) => (
                <div
                  key={i}
                  className="flex items-baseline justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <span className="text-xl font-medium text-secondary md:text-2xl">
                    {item.price}
                  </span>
                  <span className="text-xs text-muted-foreground tracking-widest uppercase">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md"
            onClick={() => setIsLightboxOpen(false)}
          >
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute right-8 top-8 rounded-full p-2 text-white/50 transition-colors hover:text-white z-50"
              aria-label="Close lightbox"
            >
              <X className="h-10 w-10" />
            </button>

            {images.length > 1 && (
              <>
                <button
                  className="absolute left-8 top-1/2 -translate-y-1/2 rounded-full p-4 text-4xl text-white/30 transition-colors hover:text-white z-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
                  }}
                >
                  <ChevronLeft size={48} strokeWidth={1} />
                </button>
                <button
                  className="absolute right-8 top-1/2 -translate-y-1/2 rounded-full p-4 text-4xl text-white/30 transition-colors hover:text-white z-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveIndex((prev) => (prev + 1) % images.length);
                  }}
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
              className="px-4 relative flex items-center justify-center"
            >
              {currentImage.type === "video" || currentImage.src?.endsWith(".mp4") ? (
                <video
                  src={currentImage.src}
                  className="max-h-[85vh] max-w-[90vw] rounded-lg shadow-2xl object-contain"
                  controls
                  autoPlay
                  playsInline
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <img
                  src={currentImage.src}
                  alt={currentImage.alt || name}
                  className="max-h-[85vh] max-w-[90vw] rounded-lg shadow-2xl object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              {currentImage.alt && (
                <div className="absolute bottom-0 left-4 right-4 p-6 bg-gradient-to-t from-black/80 via-black/30 to-transparent rounded-b-lg pointer-events-none">
                  <p className="text-white text-center text-lg drop-shadow-md">
                    {currentImage.alt}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ScrollReveal>
  );
};

export default RoomCard;
