"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Phone, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";

const FloatingContact = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [content, setContent] = useState({ line1: "예약문의 010-9038-5822", line2: "" });

  useEffect(() => {
    // Show after a short delay
    const timer = setTimeout(() => setIsVisible(true), 1000);
    
    // Fetch custom text
    fetch("/api/admin/content?page=home")
      .then(res => res.json())
      .then(data => {
        const l1 = data.find((c: any) => c.section === "floating" && c.key === "line1")?.value;
        const l2 = data.find((c: any) => c.section === "floating" && c.key === "line2")?.value;
        setContent({ 
          line1: l1 || "예약문의 010-9038-5822", 
          line2: l2 || "" 
        });
      })
      .catch(err => console.error(err));
      
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.5, y: 50 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="fixed bottom-[24px] right-[24px] md:bottom-[40px] md:right-[40px] z-[9999]"
        >
          <motion.a
            href="tel:010-9038-5822"
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative flex items-center gap-4 pl-2 pr-6 py-2 rounded-full bg-black/80 backdrop-blur-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-secondary/20 transition-shadow duration-500"
          >
            {/* Ambient Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-secondary/50 to-accent/50 rounded-full opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
            
            <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-white text-black shadow-inner overflow-hidden">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.8, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-secondary/10"
              />
              <Phone size={20} className="relative z-10 fill-current" />
            </div>
            
            <div className="relative flex flex-col pt-0.5">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-white/40 leading-none">
                  Stay Namcheon
                </span>
                <ArrowUpRight size={10} className="text-secondary opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
              <span className="text-sm md:text-lg font-medium tracking-tight text-white whitespace-nowrap">
                {content.line1}
              </span>
              {content.line2 && (
                <span className="text-xs md:text-sm text-secondary font-bold whitespace-nowrap mt-0.5">
                  {content.line2}
                </span>
              )}
            </div>

            {/* Subtle Shine Reflection */}
            <div className="absolute top-0 left-0 w-full h-full rounded-full overflow-hidden pointer-events-none">
              <motion.div 
                animate={{
                  x: ["-100%", "200%"]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 4,
                  ease: "easeInOut"
                }}
                className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
              />
            </div>
          </motion.a>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingContact;
