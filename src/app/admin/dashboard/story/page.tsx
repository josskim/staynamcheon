"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit, Trash2, Settings, Calendar, Eye, EyeOff } from "lucide-react";
import { getThumbnailUrl, getVideoThumbnailUrl } from "@/lib/cloudinary";

type Story = {
  id: string;
  title: string;
  content: string;
  images: string;
  tags: string;
  isVisible: boolean;
  createdAt: string;
};

export default function AdminStoryPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStories = async () => {
    setIsLoading(true);
    try {
      // 관리자는 비공개 게시글도 봐야하므로 ?all=true 파라미터 추가
      const res = await fetch("/api/stories?all=true");
      const data = await res.json();
      setStories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("정말 이 스토리를 삭제하시겠습니까? (삭제 후 복구할 수 없습니다)")) return;
    try {
      const res = await fetch(`/api/stories/${id}`, { method: "DELETE" });
      if (res.ok) {
        setStories(stories.filter((s) => s.id !== id));
      } else {
        alert("삭제에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const toggleVisibility = async (story: Story) => {
    try {
      const res = await fetch(`/api/stories/${story.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...story, isVisible: !story.isVisible })
      });
      if (res.ok) {
        setStories(stories.map(s => s.id === story.id ? { ...s, isVisible: !s.isVisible } : s));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Story Management</h2>
          <p className="text-muted-foreground mt-1">블로그 형식의 소식과 스토리를 관리합니다.</p>
        </div>
        <div className="flex gap-2">
          <Link 
            href="/admin/dashboard/story/settings" 
            className="inline-flex items-center gap-2 bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
          >
            <Settings size={16} />
            기본 태그 설정
          </Link>
          <Link 
            href="/admin/dashboard/story/new" 
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} />
            새 스토리 작성
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow border border-gray-200">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : stories.length === 0 ? (
        <div className="p-12 text-center text-gray-500 bg-white rounded-lg shadow border border-gray-200">
          아직 작성된 스토리가 없습니다. 새 스토리를 작성해보세요.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => {
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
            
            const textContent = story.content.replace(/<[^>]+>/g, '').trim() || '(내용 없음)';

            const getRenderableThumbnail = (url: string) => {
              if (url.match(/\.(mp4|webm|mkv|mov|avi)$/i) || url.includes('/video/upload/')) {
                return getVideoThumbnailUrl(url, 600);
              }
              return getThumbnailUrl(url, 600);
            };

            return (
              <div key={story.id} className="group flex flex-col h-full bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                  <Image 
                    src={getRenderableThumbnail(firstImage)}
                    alt={story.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                  {parsedTags.length > 0 && (
                    <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                      {parsedTags.slice(0, 2).map((tag: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-black/60 backdrop-blur-sm text-[10px] font-medium text-white rounded-md shadow-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {/* Public/Private Badge overlay on top of image */}
                  <div className="absolute top-2 right-2">
                    {story.isVisible ? (
                      <span className="flex items-center gap-1 bg-green-500/90 text-white text-xs px-2 py-1 rounded shadow-sm font-medium">
                        <Eye size={12} /> 공개됨
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 bg-gray-600/90 text-white text-xs px-2 py-1 rounded shadow-sm font-medium">
                        <EyeOff size={12} /> 비공개
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                      <Calendar size={12} />
                      {new Date(story.createdAt).toLocaleDateString()}
                    </div>
                    {/* Toggle Switch */}
                    <label className="relative inline-flex items-center cursor-pointer" title={story.isVisible ? "숨기기" : "공개하기"}>
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={story.isVisible} 
                        onChange={() => toggleVisibility(story)} 
                      />
                      <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  
                  <h3 className="text-lg font-bold tracking-tight text-gray-900 mb-2 line-clamp-2">
                    <Link href={`/story/${story.id}`} target="_blank" className="hover:text-primary transition-colors">
                      {story.title}
                    </Link>
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-5 flex-1">
                    {textContent}
                  </p>
                  
                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <Link href={`/story/${story.id}`} target="_blank" className="text-sm font-medium text-primary hover:underline">
                      미리보기
                    </Link>
                    <div className="flex items-center gap-1">
                      <Link 
                        href={`/admin/dashboard/story/edit/${story.id}`}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="수정하기"
                      >
                        <Edit size={16} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(story.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="삭제하기"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
