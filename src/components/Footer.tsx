const Footer = () => {
  return (
    <footer className="border-t border-border py-16 section-padding">
      <div className="flex flex-col md:flex-row justify-between items-start gap-12">
        <div>
          <h3 className="font-display text-2xl tracking-widest mb-4">Stay Namcheon</h3>
          <p className="text-sm text-muted-foreground font-body leading-relaxed max-w-xs">
            A serene retreat where architecture meets nature. Namcheon, South Korea.
          </p>
        </div>
        <div className="flex gap-16">
          <div>
            <h4 className="text-xs font-body font-medium tracking-[0.2em] uppercase text-accent mb-4">Explore</h4>
            <div className="flex flex-col gap-3">
              <a href="#pension" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pension</a>
              <a href="#campnic" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Campnic</a>
              <a href="#cafe" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cafe</a>
              <a href="#gallery" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Gallery</a>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-body font-medium tracking-[0.2em] uppercase text-accent mb-4">Contact</h4>
            <div className="flex flex-col gap-3">
              <span className="text-sm text-muted-foreground">+82 10-1234-5678</span>
              <span className="text-sm text-muted-foreground">info@staynamcheon.kr</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-16 pt-8 border-t border-border">
        <p className="text-xs text-muted-foreground text-center tracking-widest">
          © 2026 Stay Namcheon. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
