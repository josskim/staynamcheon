"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TagsInput from "@/components/admin/TagsInput";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function StorySettingsPage() {
  const router = useRouter();
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await fetch("/api/stories/settings/tags");
        if (res.ok) {
          const data = await res.json();
          setTags(data.tags || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTags();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/stories/settings/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags })
      });

      if (res.ok) {
        alert("기본 태그가 성공적으로 저장되었습니다!");
      } else {
        alert("저장에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">로딩 중...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/admin/dashboard/story"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-600" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">스토리 환경설정 (태그 관리)</h2>
          <p className="text-muted-foreground mt-1">스토리 작성 시 항상 기본적으로 세팅되는 태그를 직접 관리합니다.</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow border border-gray-200">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">기본 해시태그 목록</h3>
          <p className="text-sm text-gray-500 mb-4">
            새 스토리를 작성할 때마다 아래 태그들이 자동으로 작성 폼에 나타납니다. 
            태그 텍스트 박스에 태그를 입력하고 "엔터(Enter)"를 치면 추가되며 "X"를 누르면 삭제됩니다.
          </p>

          <TagsInput 
            tags={tags} 
            onChange={setTags} 
            placeholder="#을 포함하거나 생략하고 입력 후 엔터를 치세요"
          />
        </div>

        <div className="pt-6 border-t border-gray-200 flex justify-end gap-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            {isSaving ? "저장 중..." : "설정 저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
