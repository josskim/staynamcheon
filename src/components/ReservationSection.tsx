"use client";

import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { MapPin, Navigation } from "lucide-react";
import Image from "next/image";
import { getHeroImageUrl } from "@/lib/cloudinary";

const ReservationSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-15%" });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    <section id="reservation" ref={ref} className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center py-20">
      {/* Parallax background */}
      <motion.div className="absolute inset-[-15%] w-[130%] h-[130%] z-0" style={{ y }}>
        <Image
          src={getHeroImageUrl("/images/lovable/hero.jpg")}
          alt="Stay Namcheon landscape"
          fill
          sizes="130vw"
          className="object-cover"
        />
      </motion.div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-foreground/60 z-0" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left: Text Content */}
        <motion.div
          className="flex flex-col items-start text-left gap-8"
          initial={{ opacity: 0, x: -50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 1.2 }}
        >
          <motion.span
            className="text-xs font-body font-medium tracking-[0.4em] uppercase text-primary-foreground/60"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Book Your Stay
          </motion.span>

          <motion.h2
            className="font-display text-5xl md:text-7xl font-normal text-primary-foreground tracking-tight"
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 1 }}
          >
            Location<span className="text-secondary">.</span>
          </motion.h2>

          <motion.div
            className="w-16 h-px bg-secondary"
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ delay: 0.6, duration: 0.8 }}
          />

          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            <p className="font-body text-base md:text-xl font-light leading-relaxed text-primary-foreground/90">
              경상북도 경산시 남천면 남천로 31 스테이남천
            </p>
            <p className="font-body text-sm md:text-base font-light leading-relaxed text-primary-foreground/60">
              Escape to the quiet beauty of Namcheon. Whether you seek a peaceful pension room, an outdoor campnic experience, or simply a cup of coffee surrounded by nature — we're here to welcome you.
            </p>
          </motion.div>

          <motion.div
            className="flex flex-wrap gap-4 pt-4"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <a
              href="tel:010-9038-5822"
              className="group flex items-center gap-3 border border-secondary/50 px-8 py-4 text-sm font-body font-medium tracking-widest uppercase text-white transition-all duration-300 hover:bg-secondary hover:border-secondary shadow-lg hover:shadow-secondary/20"
            >
              Call to Reserve
            </a>
            <a
              href="https://map.naver.com/p/search/%EA%B2%BD%EC%83%81%EB%B6%81%EB%8F%84%20%EA%B2%BD%EC%82%B0%EC%8B%9C%20%EB%82%A8%EC%B2%9C%EB%A9%B4%20%EB%82%A8%EC%B2%9C%EB%A1%9C%2031%20%EC%8A%A4%ED%85%8C%EC%9D%B4%EB%82%A8%EC%B2%9C"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 bg-[#03C75A]/10 backdrop-blur-md border border-[#03C75A]/20 px-8 py-4 text-sm font-body font-medium tracking-widest uppercase text-white transition-all duration-300 hover:bg-[#03C75A] hover:text-white shadow-lg hover:shadow-[#03C75A]/20"
            >
              <Navigation size={18} className="text-[#03C75A] group-hover:text-white transition-colors capitalize" />
              Naver Map
            </a>
          </motion.div>
        </motion.div>

        {/* Right: Map Container */}
        <motion.div
          className="relative w-full aspect-square md:aspect-video lg:aspect-square rounded-3xl overflow-hidden shadow-2xl border border-white/10"
          initial={{ opacity: 0, x: 50, scale: 0.95 }}
          animate={isInView ? { opacity: 1, x: 0, scale: 1 } : {}}
          transition={{ duration: 1.2, delay: 0.4 }}
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3238.648354652233!2d128.733384!3d35.738521!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3566133ef2825585%3A0x6d9006e885ed36e4!2z7Iqk7YWM7J2064Ko7LKc!5e0!3m2!1sko!2skr!4v1710500000000!5m2!1sko!2skr"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
          <div className="absolute top-6 left-6 flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <MapPin size={14} className="text-secondary" />
            <span className="text-[10px] text-white font-medium tracking-wider">경상북도 경산시 남천면 남천로 31</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ReservationSection;
