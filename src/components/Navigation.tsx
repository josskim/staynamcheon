"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Pension", href: "/pension" },
  { label: "Campnic", href: "/campnic" },
  { label: "Cafe", href: "/cafe" },
  { label: "Other", href: "/other" },
  { label: "Gallery", href: "/gallery" },
  { label: "Reservation", href: "/reservation" },
];

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 section-padding pointer-events-none">
      <div className="flex items-center justify-between py-6 md:py-10 pointer-events-auto">
        <Link 
          href="/" 
          className="font-display text-xl md:text-2xl tracking-widest text-primary-foreground mix-blend-difference"
        >
          Stay Namcheon
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-12">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <a
                key={item.label}
                href={item.href}
                className={cn(
                  "relative text-[10px] font-body font-medium tracking-[0.3em] uppercase text-primary-foreground mix-blend-difference transition-all duration-300 hover:opacity-100",
                  isActive ? "opacity-100" : "opacity-60 hover:opacity-80"
                )}
              >
                {item.label}
                {isActive && (
                  <span className="absolute -bottom-2 left-0 w-full h-px bg-primary-foreground" />
                )}
              </a>
            );
          })}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-primary-foreground mix-blend-difference z-50 p-2"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "fixed inset-0 md:hidden pointer-events-none",
          isOpen ? "pointer-events-auto" : ""
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
            isOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setIsOpen(false)}
        />
        <div
          className={cn(
            "absolute inset-0 flex flex-col justify-center px-8 transition-all duration-300",
            isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <div className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between px-6 pt-6">
              <div className="text-[11px] uppercase tracking-[0.4em] text-white/60">Menu</div>
              <button
                onClick={() => setIsOpen(false)}
                className="h-10 w-10 rounded-full bg-white/10 text-white flex items-center justify-center"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-4 pb-6 pt-4">
              {navItems.map((item, i) => {
                const isActive = pathname === item.href;
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "group flex items-center justify-between rounded-2xl px-5 py-4 transition-all",
                      isActive
                        ? "bg-white text-[#1a1a2e] shadow-lg"
                        : "text-white/90 hover:bg-white/10"
                    )}
                    style={{ transitionDelay: `${isOpen ? i * 40 : 0}ms` }}
                  >
                    <div>
                      <div className={cn("font-display text-2xl tracking-[0.14em]", isActive ? "text-[#1a1a2e]" : "")}>
                        {item.label}
                      </div>
                      <div className={cn("text-[10px] uppercase tracking-[0.35em]", isActive ? "text-[#1a1a2e]/60" : "text-white/40")}>
                        Stay Namcheon
                      </div>
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-[0.3em] transition-opacity",
                        isActive ? "text-[#1a1a2e]" : "text-white/50 group-hover:text-white"
                      )}
                    >
                      {isActive ? "On" : "Go"}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
