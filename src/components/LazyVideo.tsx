"use client";

import { useRef, useEffect, useState } from "react";

interface LazyVideoProps {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  controls?: boolean;
  preload?: "none" | "metadata" | "auto";
  eager?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onMouseOver?: (e: React.MouseEvent<HTMLVideoElement>) => void;
  onMouseOut?: (e: React.MouseEvent<HTMLVideoElement>) => void;
}

export default function LazyVideo({
  src,
  poster,
  className,
  autoPlay = false,
  muted = true,
  loop = true,
  playsInline = true,
  controls = false,
  preload = "none",
  eager = false,
  onClick,
  onMouseOver,
  onMouseOut,
}: LazyVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(eager);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (eager) return;
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [eager]);

  // Play/pause based on visibility — runs after src is set in DOM
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isVisible && autoPlay) {
      video.play().catch(() => {});
    } else if (!isVisible) {
      video.pause();
    }
  }, [isVisible, autoPlay]);

  return (
    <video
      ref={videoRef}
      src={isVisible ? src : undefined}
      poster={poster}
      className={className}
      muted={muted}
      loop={loop}
      playsInline={playsInline}
      controls={controls}
      preload={eager ? "auto" : preload}
      onClick={onClick}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    />
  );
}
