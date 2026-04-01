"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminCloudinaryUpload from "@/components/admin/AdminCloudinaryUpload";
import TagsInput from "@/components/admin/TagsInput";

export default function NewStoryPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [useAI, setUseAI] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDefaultTags = async () => {
      try {
        const res = await fetch("/api/stories/settings/tags");
        if (res.ok) {
          const data = await res.json();
          setTags(data.tags || []);
        }
      } catch (err) {
        console.error("Failed to load default tags:", err);
      }
    };
    fetchDefaultTags();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용은 필수입니다.");
      return;
    }

    setIsSubmitting(true);

    const formattedTags = tags.map(t => t.startsWith("#") ? t : `#${t}`);

    try {
      const res = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          images,
          tags: formattedTags,
          isVisible,
          useAI
        })
      });

      if (res.ok) {
        router.push("/admin/dashboard/story");
        router.refresh();
      } else {
        throw new Error("Failed to create story");
      }
    } catch (err) {
      console.error(err);
      alert("스토리 등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">새 스토리 작성</h2>
        <p className="text-muted-foreground mt-1">
          다이나믹한 레이아웃을 위해 HTML 태그를 이용해 작성하거나 AI 편집 지원을 받으세요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg shadow border border-gray-200">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-900">제목 (Title)</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            placeholder="제목을 입력하세요"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-900 flex justify-between">
            <span>내용 (Content)</span>
            <span className="text-xs text-gray-500 font-normal">HTML 지원 (AI를 통해 화려한 레이아웃 삽입 가능)</span>
          </label>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-md h-64 focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-y font-mono text-sm"
            placeholder="여기에 직접 텍스트를 입력하거나 HTML 코드를 붙여넣으세요..."
            required
          />
        </div>

        <div className="space-y-4">
          <label className="text-sm font-semibold text-gray-900 flex justify-between">
            <span>태그 (Tags)</span>
            <span className="text-xs text-gray-500 font-normal">엔터(Enter)를 눌러 태그를 추가하세요</span>
          </label>
          <TagsInput 
            tags={tags}
            onChange={setTags}
            placeholder="#을 포함하거나 생략하고 입력 후 엔터를 치세요"
          />
        </div>

        <div className="space-y-4">
          <label className="text-sm font-semibold text-gray-900">사진 등록 (다중 선택 가능)</label>
          <div className="border border-dashed border-gray-300 rounded-xl p-6 bg-gray-50">
            <AdminCloudinaryUpload
              onUploadSuccess={(url) => setImages(prev => [...prev, url])}
              folder="staynamcheon/stories"
            />
            {images.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-4">
                {images.map((img, idx) => (
                  <div key={idx} className="relative w-32 h-32 rounded-lg overflow-hidden shadow-sm group border">
                    {img.match(/\.(mp4|webm|mkv|mov|avi)$/i) || img.includes('/video/upload/') ? (
                      <video src={img} muted playsInline className="w-full h-full object-cover" />
                    ) : (
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                    >
                      ✕
                    </button>
                    {idx === 0 && (
                      <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] text-center py-1">
                        대표(메인) 사진
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {images.length === 0 && (
              <p className="text-sm text-gray-500 mt-2 text-center">첫 번째 사진이 리스트의 대표 이미지로 사용됩니다.</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-4">
          <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div>
              <h4 className="font-semibold text-primary mb-1 text-sm">✨ AI 에디터 렌더링 사용 (권장)</h4>
              <p className="text-xs text-gray-500">내용에 적힌 지시사항을 바탕으로 감성적인 HTML 잡지 스타일 구조를 자동으로 만들어 적용합니다.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={useAI} 
                onChange={(e) => setUseAI(e.target.checked)} 
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="isVisible"
              checked={isVisible}
              onChange={(e) => setIsVisible(e.target.checked)}
              className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
            />
            <label htmlFor="isVisible" className="text-sm font-medium text-gray-700">작성 완료 후 즉시 공개하기</label>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (useAI ? "✨ AI 렌더링 중..." : "저장 중...") : "스토리 등록"}
          </button>
        </div>
      </form>
    </div>
  );
}
