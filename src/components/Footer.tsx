import Link from "next/link";

const Footer = () => {
  return (
    <footer className="border-t border-border pt-16 pb-32 section-padding">
      <div className="flex flex-col md:flex-row justify-between items-start gap-12">
        <div className="flex flex-col gap-4">
          <h3 className="font-display text-2xl tracking-widest text-[#DB5461]">Stay Namcheon</h3>
          <div className="space-y-1">
            <p className="text-sm font-body leading-relaxed max-w-xs">
              Stay Namcheon
            </p>
            <p className="text-xs text-muted-foreground font-body leading-relaxed max-w-xs">
              경산시 남천면 남천로31 스테이남천
            </p>
          </div>
        </div>
        <div className="flex gap-16">
          <div>
            <h4 className="text-xs font-body font-medium tracking-[0.2em] uppercase text-accent mb-6 border-b border-accent/20 pb-2">Explore</h4>
            <div className="flex flex-col gap-3">
              <Link href="/pension" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pension</Link>
              <Link href="/campnic" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Campnic</Link>
              <Link href="/cafe" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cafe</Link>
              <Link href="/gallery" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Gallery</Link>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-body font-medium tracking-[0.2em] uppercase text-accent mb-6 border-b border-accent/20 pb-2">Contact</h4>
            <div className="flex flex-col gap-4">
              <a href="tel:010-9038-5822" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex flex-col">
                <span className="text-[10px] text-accent/50 mb-0.5">Phone</span>
                010.9038.5822
              </a>
              <a href="mailto:trustprice@naver.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex flex-col">
                <span className="text-[10px] text-accent/50 mb-0.5">Email</span>
                trustprice@naver.com
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[10px] text-muted-foreground tracking-widest uppercase">
          © 2026 Stay Namcheon. All rights reserved.
        </p>
        <div className="flex items-center gap-2 group cursor-default">
          <span className="text-[8px] text-muted-foreground/60 font-medium tracking-[0.2em] uppercase transition-all group-hover:text-accent/80 italic">Crafted with precision</span>
          <span className="text-[10px] font-medium tracking-[0.15em] text-accent/90 group-hover:text-[#DB5461] transition-all">
            Designed by <span className="font-bold border-b border-[#DB5461]/40 hover:border-[#DB5461]/80 transition-all">LucasDesign</span>
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
