"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import Hero from "@/components/Hero";
import ScrollReveal from "@/components/ScrollReveal";
import Footer from "@/components/Footer";
import { Calendar } from "lucide-react";
import { getThumbnailUrl, getVideoThumbnailUrl } from "@/lib/cloudinary";

type Story = {
  id: string;
  title: string;
  content: string;
  images: string;
  tags: string;
  createdAt: string;
};

export default function StoryClient() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stories")
      .then((res) => res.json())
      .then((data) => {
        setStories(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Failed to fetch stories:", err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <Hero 
        title="Stay Story" 
        subtitle="우리가 만들어가는 소소한 이야기와 소식들" 
        backgroundImage="/images/lovable/hero.jpg" 
      />

      <section className="section-spacing bg-white">
        <div className="mx-auto max-w-7xl px-6">
          <ScrollReveal>
            <div className="mb-20 text-center">
              <span className="text-xs font-medium tracking-[0.4em] uppercase text-accent mb-4 block">Our Journal</span>
              <h2 className="text-4xl font-semibold tracking-tight md:text-5xl mb-6">
                스테이남천 스토리<span className="text-secondary">.</span>
              </h2>
            </div>
          </ScrollReveal>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-32 text-muted-foreground border border-dashed border-border rounded-3xl bg-secondary/5">
              아직 등록된 스토리가 없습니다.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {stories.map((story, idx) => {
                let parsedImages: string[] = [];
                try {
                  const firstParse = JSON.parse(story.images || "[]");
                  parsedImages = typeof firstParse === 'string' ? JSON.parse(firstParse) : firstParse;
                  if (!Array.isArray(parsedImages)) parsedImages = [];
                } catch(e) { parsedImages = []; }
                const firstImage = parsedImages.length > 0 ? parsedImages[0] : "/images/placeholder.jpg";
                
                let parsedTags: string[] = [];
                try {
                  const firstParse = JSON.parse(story.tags || "[]");
                  const secondParse = typeof firstParse === 'string' ? JSON.parse(firstParse) : firstParse;
                  if (Array.isArray(secondParse)) {
                    parsedTags = secondParse;
                  } else if (typeof secondParse === 'string') {
                    parsedTags = secondParse.split(",").map(t => t.trim());
                  }
                } catch (e) {
                  parsedTags = [];
                }
                
                // 간단하게 내용에서 텍스트만 추출 (HTML 제거)
                const textContent = story.content.replace(/<[^>]+>/g, '');

                const getRenderableThumbnail = (url: string) => {
                  if (url.match(/\.(mp4|webm|mkv|mov|avi)$/i) || url.includes('/video/upload/')) {
                    return getVideoThumbnailUrl(url, 600);
                  }
                  return getThumbnailUrl(url, 600);
                };

                return (
                  <ScrollReveal key={story.id} delay={idx % 3 * 0.1}>
                    <Link href={`/story/${story.id}`} className="group block h-full">
                      <article className="flex flex-col h-full bg-card rounded-3xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                          <Image 
                            src={getRenderableThumbnail(firstImage)}
                            alt={story.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          {parsedTags.length > 0 && (
                            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                              {parsedTags.slice(0, 2).map((tag: string, i: number) => (
                                <span key={i} className="px-3 py-1 bg-white/90 backdrop-blur-md text-xs font-bold text-foreground rounded-full shadow-sm">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="p-6 md:p-8 flex flex-col flex-1">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 font-medium uppercase tracking-wider">
                            <Calendar size={14} />
                            {new Date(story.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </div>
                          <h3 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground mb-4 group-hover:text-accent transition-colors line-clamp-2">
                            {story.title}
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-6 flex-1">
                            {textContent}
                          </p>
                          <div className="mt-auto w-full pt-6 border-t border-border flex items-center justify-between text-sm font-bold tracking-widest uppercase text-accent group-hover:text-secondary transition-colors">
                            <span>Read Story</span>
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  </ScrollReveal>
                );
              })}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
