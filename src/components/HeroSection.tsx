"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { getHeroImageUrl } from "@/lib/cloudinary";
import LazyVideo from "./LazyVideo";

interface HeroContent {
  title?: string;
  subtitle?: string;
  imageUrl?: string;
}

const HeroSection = ({ content }: { content?: HeroContent }) => {
  const ref = useRef(null);

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
          <LazyVideo
            src={imageUrl}
            autoPlay
            loop
            muted
            playsInline
            eager
            className="h-full w-full object-cover"
          />
        ) : (
          <Image
            src={getHeroImageUrl(imageUrl)}
            alt="경산 대형 단체 펜션 스테이남천"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        )}

        <div className="absolute inset-0 bg-foreground/35" />
      </motion.div>

      <motion.div
        className="relative h-full flex flex-col items-center justify-center text-center section-padding"
        style={{ opacity }}
      >
        <motion.p
          className="mb-7 whitespace-pre-wrap text-xs font-body font-medium leading-6 tracking-[0.22em] text-primary-foreground/80 md:text-sm md:leading-7 md:tracking-[0.3em]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          {content?.subtitle || "공식 숙박 최대 24명 · 30명 내외 단체 별도 상담\n모임·워크숍 · 독채 · 제2야수교 면회 · 캠프닉"}
        </motion.p>
        <motion.h1
          className="whitespace-pre-line font-display text-5xl font-semibold leading-[1.05] tracking-tight text-primary-foreground sm:text-6xl md:text-8xl lg:text-9xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 1.2, ease: "easeOut" }}
        >
          {content?.title || "경산 대형 단체 펜션\n스테이남천"}
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
          <a href="#stay-options" className="inline-block border border-primary-foreground/40 px-8 py-4 text-sm font-body font-medium tracking-[0.18em] text-primary-foreground/90 transition-all duration-300 hover:bg-primary-foreground hover:text-foreground">
            이용 유형 보기
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
