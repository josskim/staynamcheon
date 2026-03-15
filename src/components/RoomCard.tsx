import ScrollReveal from "./ScrollReveal";

interface PriceItem {
  price: string;
  label: string;
}

interface RoomCardProps {
  name: string;
  description: string;
  image: string;
  prices: PriceItem[];
  index: number;
}

const RoomCard = ({ name, description, image, prices, index }: RoomCardProps) => {
  return (
    <ScrollReveal delay={index * 0.1}>
      <div className="card-border rounded-lg overflow-hidden bg-card group">
        <div className="image-hover aspect-[21/9] md:aspect-[3/1]">
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        <div className="p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-xl">
              <h3 className="text-3xl font-semibold tracking-tight md:text-4xl">
                {name}
              </h3>
              <p className="mt-4 text-base text-muted-foreground leading-relaxed">
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
