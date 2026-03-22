"use client";

import { motion } from "framer-motion";

interface HeroProps {
  title: string;
  subtitle?: string;
  backgroundImage: string;
}

const Hero = ({ title, subtitle, backgroundImage }: HeroProps) => {
  const isVideo = backgroundImage?.match(/\.(mp4|webm|ogg|mov)$/i) || backgroundImage?.includes("/video/upload/");

  return (
    <section className="relative h-[85vh] w-full overflow-hidden">
      <motion.div 
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0"
      >
        {isVideo ? (
          <video
            src={backgroundImage}
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <img
            src={backgroundImage}
            alt={title}
            className="h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
      </motion.div>
      
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mb-6 text-5xl font-semibold tracking-tight text-white md:text-8xl"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="max-w-xl text-sm font-light uppercase tracking-[0.4em] text-white/90 md:text-base"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <div className="w-px h-12 bg-gradient-to-b from-white to-transparent" />
      </motion.div>
    </section>
  );
};

export default Hero;
