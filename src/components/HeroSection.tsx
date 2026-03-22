"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { getOptimizeImageUrl } from "@/lib/cloudinary";

const HeroSection = () => {
  const [content, setContent] = useState<any>(null);
  const ref = useRef(null);

  useEffect(() => {
    fetch("/api/admin/content?page=home&section=hero")
      .then(res => res.json())
      .then(data => {
        const heroData: any = {};
        data.forEach((item: any) => {
          if (item.section === "hero") heroData[item.key] = item.value;
        });
        setContent(heroData);
      });
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  const imageUrl = content?.imageUrl || "/images/lovable/hero.jpg";
  const isVideo = imageUrl?.match(/\.(mp4|webm|ogg|mov)$/i) || imageUrl?.includes("/video/upload/");

  return (
    <section ref={ref} className="relative h-screen w-full overflow-hidden">
      <motion.div className="absolute inset-0" style={{ y, scale }}>
        {isVideo ? (
          <video
            src={imageUrl}
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <Image
            src={getOptimizeImageUrl(imageUrl)}
            alt="Stay Namcheon — a serene pension retreat nestled in the Korean countryside"
            fill
            className="object-cover"
            priority
            unoptimized
          />
        )}

        <div className="absolute inset-0 bg-foreground/35" />
      </motion.div>

      <motion.div
        className="relative h-full flex flex-col items-center justify-center text-center section-padding"
        style={{ opacity }}
      >
        <motion.p
          className="text-xs font-body font-medium tracking-[0.4em] uppercase text-primary-foreground/60 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          {content?.subtitle || "A Retreat into Nature"}
        </motion.p>
        <motion.h1
          className="font-display text-6xl md:text-8xl lg:text-9xl xl:text-[11rem] text-primary-foreground font-normal tracking-wide leading-none"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 1.2, ease: "easeOut" }}
        >
          {content?.title || "Stay Namcheon"}
        </motion.h1>
        <motion.div
          className="w-20 h-px bg-primary-foreground/40 mt-10 mb-10"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <a href="#pension" className="inline-block border border-primary-foreground/30 px-10 py-4 text-sm font-body font-medium tracking-widest uppercase text-primary-foreground/80 transition-all duration-300 hover:bg-primary-foreground hover:text-foreground">
            Explore
          </a>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ delay: 2.2, duration: 2.5, repeat: Infinity }}
      >
        <div className="w-px h-16 bg-primary-foreground/30" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
