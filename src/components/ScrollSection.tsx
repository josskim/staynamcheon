"use client";

import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

interface ScrollSectionProps {
  id: string;
  label: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  reverse?: boolean;
  exploreHref?: string;
  children?: React.ReactNode;
}

const ScrollSection = ({ id, label: defaultLabel, title: defaultTitle, description: defaultDescription, image: defaultImage, imageAlt, exploreHref = "/pension" }: ScrollSectionProps) => {
  const [content, setContent] = useState<any>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-15%" });

  useEffect(() => {
    fetch(`/api/admin/content?page=home&section=${id}`)
      .then(res => res.json())
      .then(data => {
        const sectionData: any = {};
        data.forEach((item: any) => {
          sectionData[item.key] = item.value;
        });
        setContent(sectionData);
      });
  }, [id]);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.5, 0.35, 0.6]);

  return (
    <section
      id={id}
      ref={ref}
      className="relative h-screen w-full overflow-hidden flex items-center justify-center"
    >
      {/* Parallax background */}
      <motion.div className="absolute inset-[-15%] w-[130%] h-[130%]" style={{ y }}>
        <img
          src={content?.imageUrl || defaultImage}
          alt={imageAlt}
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Dark overlay */}
      <motion.div
        className="absolute inset-0 bg-foreground"
        style={{ opacity: overlayOpacity }}
      />

      {/* Content */}
      <div className="relative z-10 text-center section-padding max-w-4xl mx-auto flex flex-col items-center gap-6">
        <motion.span
          className="text-xs font-body font-medium tracking-[0.4em] uppercase text-primary-foreground/60"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          {content?.label || defaultLabel}
        </motion.span>

        <motion.h2
          className="font-display text-6xl md:text-8xl lg:text-9xl xl:text-[10rem] font-normal tracking-tight text-primary-foreground leading-none"
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        >
          {content?.title || defaultTitle}
        </motion.h2>

        <motion.div
          className="w-16 h-px bg-primary-foreground/40 my-2"
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
        />

        <motion.p
          className="font-body text-base md:text-lg font-light leading-relaxed text-primary-foreground/75 max-w-xl"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {content?.description || defaultDescription}
        </motion.p>

        <motion.div
          className="mt-6"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <a
            href={exploreHref}
            className="inline-block border border-primary-foreground/30 px-8 py-3 text-sm font-body font-medium tracking-widest uppercase text-primary-foreground/80 transition-all duration-300 hover:bg-primary-foreground hover:text-foreground"
          >
            Explore
          </a>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background/20 to-transparent" />
    </section>
  );
};

export default ScrollSection;
