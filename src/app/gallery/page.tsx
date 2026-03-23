"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, PlayCircle, Share2, X, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import ScrollReveal from "@/components/ScrollReveal";
import Image from "next/image";
import { getThumbnailUrl, getMiniThumbnailUrl, getOptimizeImageUrl, getH264VideoUrl } from "@/lib/cloudinary";
import LazyVideo from "@/components/LazyVideo";

type GalleryItem = {
  id: string;
  type: "image" | "video";
  src: string;
  alt?: string;
  category?: string;
  poster?: string;
};

const fallbackItems: GalleryItem[] = [
  { id: "1", type: "video", src: "/videos/movie.mp4", alt: "Cinematic Namcheon", category: "Cinema" },
  { id: "2", type: "image", src: "/images/lovable/hero.jpg", alt: "Golden Hour Terrace", category: "Nature" },
  { id: "3", type: "image", src: "/images/lovable/pension.jpg", alt: "Modern Suite Interior", category: "Design" },
  { id: "4", type: "image", src: "/images/lovable/cafe.jpg", alt: "Morning Brew", category: "Life" },
  { id: "5", type: "image", src: "/images/lovable/campnic.jpg", alt: "Starlit Campnic", category: "Nature" },
  { id: "6", type: "image", src: "/images/lovable/other.jpg", alt: "Peaceful Morning", category: "Peace" },
  { id: "7", type: "image", src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=1200", alt: "Mountain Lake", category: "Nature" },
  { id: "8", type: "image", src: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=1200", alt: "Alpine Village", category: "Design" },
  { id: "9", type: "image", src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1200", alt: "Sunlight Forest", category: "Life" },
  { id: "10", type: "image", src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1200", alt: "River Sunset", category: "Peace" },
  { id: "11", type: "image", src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200", alt: "High Mountains", category: "Nature" },
];

export default function GalleryPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const thumbScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHasMounted(true);
    // Set initial state
    setIsMobile(window.innerWidth < 768);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    const handleWheel = (e: WheelEvent) => {
      if (thumbScrollRef.current && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        thumbScrollRef.current.scrollLeft += e.deltaY;
      }
    };

    window.addEventListener("resize", handleResize);
    const container = thumbScrollRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (container) {
        container.removeEventListener("wheel", handleWheel);
      }
    };
  }, []);

  useEffect(() => {
    if (!hasMounted) return;
    setCurrentIndex(0);
  }, [hasMounted]);

  useEffect(() => {
    fetch("/api/admin/gallery")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: GalleryItem[] = data
            .filter((item: any) => item?.isVisible)
            .map((item: any) => ({
              id: item.id,
              type: item.type === "video" || (item.imageUrl || "").toLowerCase().endsWith(".mp4") ? "video" : "image",
              src: item.videoUrl || item.imageUrl,
              alt: item.title || item.description || "Gallery",
              category: item.category || "Gallery",
              poster: item.imageUrl,
            }));
          setItems(mapped);
          setCurrentIndex(0);
        }
      })
      .catch((err) => console.error("Gallery fetch error:", err));
  }, []);

  const displayItems = items.length > 0 ? items : fallbackItems;

  useLayoutEffect(() => {
    // Reset focus when the data set changes (initial load or refresh)
    setCurrentIndex(0);
  }, [displayItems.length]);

  useEffect(() => {
    if (!Number.isFinite(currentIndex) || currentIndex < 0 || currentIndex >= displayItems.length) {
      setCurrentIndex(0);
    }
  }, [currentIndex, displayItems.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!selectedItem) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedItem(null);
      if (e.key === "ArrowRight") {
        const idx = displayItems.findIndex(i => i.id === selectedItem.id);
        if (idx >= 0) setSelectedItem(displayItems[(idx + 1) % displayItems.length]);
      }
      if (e.key === "ArrowLeft") {
        const idx = displayItems.findIndex(i => i.id === selectedItem.id);
        if (idx >= 0) setSelectedItem(displayItems[(idx - 1 + displayItems.length) % displayItems.length]);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedItem, displayItems]);

  const scrollThumbToIndex = (index: number) => {
    const container = thumbScrollRef.current;
    if (!container) return;
    const run = () => {
      const target = container.querySelector<HTMLButtonElement>(`[data-thumb-index="${index}"]`);
      if (!target) return;
      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const currentScroll = container.scrollLeft;
      const targetCenter = targetRect.left - containerRect.left + targetRect.width / 2;
      const containerCenter = containerRect.width / 2;
      const nextScroll = currentScroll + (targetCenter - containerCenter);
      container.scrollTo({ left: nextScroll, behavior: "smooth" });
    };
    // Ensure layout is ready before calculating positions
    requestAnimationFrame(() => requestAnimationFrame(run));
  };

  useEffect(() => {
    if (!hasMounted) return;
    if (currentIndex === 0 && thumbScrollRef.current) {
      thumbScrollRef.current.scrollLeft = 0;
    }
    scrollThumbToIndex(currentIndex);
  }, [currentIndex, displayItems.length, hasMounted]);

  if (!hasMounted) return null;

  const handleShare = async () => {
    if (typeof window === "undefined") return;

    const shareData = {
      title: "StayNamcheon | 프리미엄 펜션 스테이 남천",
      text: "StayNamcheon의 아름다운 순간들을 확인해보세요.",
      url: window.location.href,
    };

    // Use a more robust check for Web Share API
    const canShare = typeof navigator !== "undefined" && !!navigator.share && !!navigator.canShare && navigator.canShare(shareData);

    try {
      if (canShare) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        alert("갤러리 주소가 복사되었습니다.");
      } else {
        throw new Error("Clipboard API not available");
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error("Share/Copy failed", err);
        // Robust fallback for older browsers or non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = window.location.href;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand("copy");
          alert("갤러리 주소가 복사되었습니다.");
        } catch (copyErr) {
          console.error("execCommand fallback failed", copyErr);
          alert("공유를 위해 주소를 직접 복사해주세요: " + window.location.href);
        }
        document.body.removeChild(textArea);
      }
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % displayItems.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + displayItems.length) % displayItems.length);
  };

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center overflow-x-hidden bg-[#171212] font-body p-4 md:p-8 pt-[100px] md:pt-[130px]">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#171212] via-[#1e1616] to-[#2a1f1f] opacity-100" />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(219,84,97,0.08),transparent_60%)]" />

      {/* Hero Carousel Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-[1240px] bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-[40px] shadow-2xl overflow-hidden flex flex-col items-center p-6 md:p-12 mb-16"
      >
        {/* Coverflow Carousel Section */}
        <div className="relative w-full h-[300px] md:h-[500px] mb-6 max-md:mb-3 flex items-center justify-center overflow-visible">
          <div className="relative w-full h-full flex items-center justify-center">
            {displayItems.map((item, index) => {
              const length = displayItems.length;
              let position = index - currentIndex;
              
              if (position > length / 2) position -= length;
              if (position < -length / 2) position += length;
              
              const absPosition = Math.abs(position);
              if (absPosition > 3) return null;

              return (
                <motion.div
                  key={item.id}
                  initial={false}
                  animate={{
                    x: position * (isMobile ? 160 : 300),
                    scale: 1 - absPosition * 0.15,
                    zIndex: 10 - absPosition,
                    opacity: 1 - absPosition * 0.4,
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(e, { offset, velocity }) => {
                    const swipe = offset.x + velocity.x * 20;
                    if (swipe < -100) nextSlide();
                    if (swipe > 100) prevSlide();
                  }}
                  onClick={() => setSelectedItem(item)}
                  className={cn(
                    "absolute w-[80%] md:w-[60%] aspect-[16/9] rounded-3xl overflow-hidden bg-black/20 shadow-2xl transition-shadow duration-300",
                    absPosition === 0 ? "cursor-pointer border-2 border-white/15 ring-4 ring-white/[0.06]" : "cursor-pointer cursor-grab active:cursor-grabbing"
                  )}
                >
                  {item.type === "video" ? (
                    <div className="relative h-full w-full">
                      <LazyVideo src={item.src} poster={item.poster} className="h-full w-full object-cover" autoPlay muted loop playsInline />
                    </div>
                  ) : (
                    <div className="relative h-full w-full">
                      <Image src={getThumbnailUrl(item.src, 800)} alt={item.alt || ""} fill sizes="60vw" className="object-cover" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          <button onClick={prevSlide} className="absolute left-4 z-40 p-3 rounded-full bg-white/[0.06] hover:bg-white/15 text-white/70 hover:text-white border border-white/10 backdrop-blur-md transition-all">
            <ChevronLeft size={24} />
          </button>
          <button onClick={nextSlide} className="absolute right-4 z-40 p-3 rounded-full bg-white/[0.06] hover:bg-white/15 text-white/70 hover:text-white border border-white/10 backdrop-blur-md transition-all">
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Thumbnail Strip */}
        <div className="w-full max-w-[900px] mb-4">
          <style dangerouslySetInnerHTML={{ __html: `
            .no-scrollbar::-webkit-scrollbar {
              display: none;
            }
            .no-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}} />
          <div 
            ref={thumbScrollRef}
            className="flex gap-4 overflow-x-auto pb-4 px-4 no-scrollbar snap-x justify-start items-center"
          >
            {displayItems.map((item, idx) => {
              const isActive = idx === Number(currentIndex);
              return (
                <button
                  key={`thumb-${item.id}`}
                  onClick={() => setCurrentIndex(idx)}
                  data-thumb-index={idx}
                  className={cn(
                    "relative w-20 h-20 md:w-28 md:h-28 max-md:w-[54px] max-md:h-[54px] shrink-0 rounded-2xl overflow-hidden transition-all duration-300 snap-start border border-white/10",
                    isActive ? "scale-110 z-10" : "opacity-40 hover:opacity-100"
                  )}
                  style={isActive ? { opacity: 1, boxShadow: "0 0 0 4px rgba(255,255,255,0.55)" } : undefined}
                  aria-current={isActive}
                >
                  {item.type === "video" ? (
                    <div className="relative h-full w-full">
                      <video src={getH264VideoUrl(item.src)} poster={item.poster} className="h-full w-full object-cover" preload="none" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <PlayCircle size={12} className="text-white/80" />
                      </div>
                    </div>
                  ) : (
                    <div className="relative h-full w-full">
                      <Image src={getMiniThumbnailUrl(item.src)} alt="" fill sizes="112px" className="object-cover" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

      <div className="absolute md:top-10 md:right-10 top-5 right-5 z-30">
        <button
          onClick={handleShare}
          aria-label="Share Gallery"
          className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white/70 shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-md transition-all hover:bg-white/15 hover:text-white hover:border-white/30 active:scale-95"
        >
          <Share2 size={16} className="transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
        </button>
      </div>
      </motion.div>

      {/* Gallery Grid Section */}
      <section className="relative z-10 w-full max-w-[1240px] px-6 pb-20">
        <ScrollReveal>
          <div className="mb-16 text-center">
            <div className="text-[11px] md:text-xs font-bold tracking-[0.4em] uppercase text-white/70">
              All Gallery
            </div>
          </div>
        </ScrollReveal>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {displayItems.map((item, i) => (
            <ScrollReveal key={`${item.id}-${i}`} delay={i % 4 * 0.1}>
              <div
                className="group relative cursor-pointer overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm shadow-xl hover:border-white/15 transition-colors"
                onClick={() => setSelectedItem(item)}
              >
                {item.type === "video" ? (
                  <div className="relative aspect-[4/5]">
                    <video
                      src={getH264VideoUrl(item.src)}
                      poster={item.poster}
                      className="h-full w-full object-cover opacity-80 transition-all duration-700 group-hover:opacity-100 group-hover:scale-110"
                      muted
                      playsInline
                      loop
                      preload="none"
                      onMouseOver={(e) => e.currentTarget.play()}
                      onMouseOut={(e) => {
                        e.currentTarget.pause();
                        e.currentTarget.currentTime = 0;
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-colors">
                      <Play className="text-white w-10 h-10 opacity-60" strokeWidth={1.5} />
                    </div>
                  </div>
                ) : (
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={getThumbnailUrl(item.src)}
                      alt={item.alt || ""}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover opacity-80 transition-all duration-700 group-hover:opacity-100 group-hover:scale-110"
                    />
                  </div>
                )}
                <div className="absolute inset-0 flex flex-col justify-end p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                  <span className="text-white/60 text-[10px] font-bold tracking-widest uppercase mb-1">{item.category}</span>
                  <span className="text-white text-sm font-medium">
                    {item.alt}
                  </span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
        
        <div className="mt-20 text-center">
          <p className="text-white/20 text-[10px] font-bold tracking-[0.8em] uppercase">End of Gallery</p>
        </div>
      </section>

      {/* Lightbox / Enlarged View */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-12"
            onClick={() => setSelectedItem(null)}
          >
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
              onClick={() => setSelectedItem(null)}
            >
              <X size={32} />
            </motion.button>
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full aspect-video rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedItem.type === "video" ? (
                <video src={getH264VideoUrl(selectedItem.src)} poster={selectedItem.poster} className="h-full w-full object-contain" autoPlay controls />
              ) : (
                <Image
                  src={getOptimizeImageUrl(selectedItem.src, { width: 1600, quality: "auto:good", format: "auto" })}
                  alt={selectedItem.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 1600px"
                  className="object-contain"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-4 text-white/20 text-[10px] font-bold tracking-[0.5em] uppercase">
        <span>Lifestyle</span><span>•</span><span>Cinema</span><span>•</span><span>Namcheon</span>
      </div>
    </main>
  );
}
