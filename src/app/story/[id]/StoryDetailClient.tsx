"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Tag, Share2, PlayCircle } from "lucide-react";
import Footer from "@/components/Footer";
import { getOptimizeImageUrl } from "@/lib/cloudinary";

export default function StoryDetailClient({ story }: { story: any }) {
  let images: string[] = [];
  try {
    const firstParse = JSON.parse(story.images || "[]");
    images = typeof firstParse === 'string' ? JSON.parse(firstParse) : firstParse;
    if (!Array.isArray(images)) images = [];
  } catch(e) { images = []; }
  let tags: string[] = [];
  try {
    const firstParse = JSON.parse(story.tags || "[]");
    tags = typeof firstParse === 'string' ? JSON.parse(firstParse) : firstParse;
    if (!Array.isArray(tags)) tags = [];
  } catch(e) { tags = []; }
  const heroImage = images[0] || "/images/lovable/hero.jpg";

  const isVideo = (url: string) => url.match(/\.(mp4|webm|mkv|mov|avi)$/i) || url.includes('/video/upload/');

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: story.title,
          text: "Stay Namcheon Story",
          url: window.location.href,
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("링크가 복사되었습니다.");
    }
  };

  return (
    <main className="min-h-screen bg-background pt-24">
      {/* Article Header */}
      <article className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <Link 
          href="/story" 
          className="inline-flex items-center gap-2 text-sm font-bold tracking-widest uppercase text-muted-foreground hover:text-accent transition-colors mb-12"
        >
          <ArrowLeft size={16} />
          Back to Stories
        </Link>
        
        <header className="mb-12">
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {tags.map((tag: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-secondary/10 text-xs font-bold text-secondary rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-foreground leading-tight mb-8">
            {story.title}
          </h1>
          
          <div className="flex items-center justify-between border-y border-border py-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium uppercase tracking-wider">
              <Calendar size={16} className="text-accent" />
              {new Date(story.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 text-sm font-bold tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
            >
              <Share2 size={16} />
              Share
            </button>
          </div>
        </header>

        {/* Hero Image */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative aspect-video w-full rounded-3xl overflow-hidden mb-16 shadow-2xl"
        >
          {isVideo(heroImage) ? (
            <video 
              src={heroImage}
              autoPlay
              loop
              muted
              playsInline
              className="object-cover w-full h-full"
            />
          ) : (
            <Image 
              src={getOptimizeImageUrl(heroImage, { width: 1200 })}
              alt={story.title}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          )}
        </motion.div>

        {/* Content */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="prose prose-lg md:prose-xl max-w-none text-foreground prose-p:leading-relaxed prose-headings:font-semibold prose-img:rounded-2xl"
          dangerouslySetInnerHTML={{ __html: story.content }}
        />

        {/* Extra Images Masonry (if any besides hero) */}
        {images.length > 1 && (
          <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-4">
            {images.slice(1).map((imgUrl: string, idx: number) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-md"
              >
                {isVideo(imgUrl) ? (
                  <video 
                    src={imgUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <Image 
                    src={getOptimizeImageUrl(imgUrl, { width: 800 })}
                    alt={`Story Image ${idx + 2}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover hover:scale-105 transition-transform duration-700"
                  />
                )}
              </motion.div>
            ))}
          </div>
        )}
      </article>

      <Footer />
    </main>
  );
}
