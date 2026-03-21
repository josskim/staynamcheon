import ScrollReveal from "./ScrollReveal";

interface PriceItem {
  price: string;
  label: string;
}

interface RoomCardProps {
  name: string;
  description: string;
  image: string;
  gallery?: { id?: string; src: string; alt?: string; type?: "image" | "video" }[];
  prices: PriceItem[];
  index: number;
}

import { useState } from "react";

const RoomCard = ({ name, description, image, gallery, prices, index }: RoomCardProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const images = gallery && gallery.length > 0 ? gallery : [{ src: image }];
  const currentImage = images[activeIndex] || images[0];

  return (

    <ScrollReveal delay={index * 0.1}>
      <div className="card-border rounded-lg overflow-hidden bg-card group">
        <div className="image-hover aspect-[21/9] md:aspect-[3/1] relative">
          {currentImage.type === "video" || currentImage.src?.endsWith(".mp4") ? (
            <video
              src={currentImage.src}
              className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <img
              src={currentImage.src}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
              loading="lazy"
            />
          )}
        </div>
        {images.length > 1 && (
          <div className="flex gap-3 p-4 overflow-x-auto bg-muted/30 border-b border-border hide-scrollbar">
            {images.map((img, idx) => (
              <button 
                key={idx} 
                onClick={() => setActiveIndex(idx)}
                className={`relative flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all ${idx === activeIndex ? "border-foreground scale-105 shadow-md" : "border-transparent opacity-60 hover:opacity-100"}`}
              >
                {img.type === "video" || img.src?.endsWith(".mp4") ? (
                  <video src={img.src} className="w-full h-full object-cover" />
                ) : (
                  <img src={img.src} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                )}
              </button>
            ))}
          </div>
        )}
        <div className="p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-xl">
              <h3 className="text-3xl font-semibold tracking-tight md:text-4xl">
                {name}
              </h3>
              <p className="mt-4 text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {description}
              </p>
            </div>

            <div className="flex-1 min-w-[300px] space-y-4">
              {prices.map((item, i) => (
                <div
                  key={i}
                  className="flex items-baseline justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <span className="text-xl font-medium text-secondary md:text-2xl">
                    {item.price}
                  </span>
                  <span className="text-xs text-muted-foreground tracking-widest uppercase">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
};

export default RoomCard;
