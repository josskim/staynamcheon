"use client";

import { useState, useEffect } from "react";
import { Save, Image as ImageIcon, Type, Layout, Coffee, Bed, Tent, Compass, Plus, Phone } from "lucide-react";
import { uploadToCloudinary } from "@/lib/upload";

const SECTIONS = [
  { id: "hero", name: "Hero Section", icon: Layout },
  { id: "pension", name: "Pension Section", icon: Bed },
  { id: "campnic", name: "Campnic Section", icon: Tent },
  { id: "cafe", name: "Cafe Section", icon: Coffee },
  { id: "other", name: "Other Experiences", icon: Compass },
];

export default function HomeManagementPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<any[]>([]);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = () => {
    fetch("/api/admin/content?page=home")
      .then(res => res.json())
      .then(data => {
        setContent(data);
        setLoading(false);
      });
  };

  const handleUpdate = async (section: string, key: string, value: string) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: "home", section, key, value, type: key === "imageUrl" ? "image" : "text" }),
      });
      if (res.ok) {
        const updatedItem = await res.json();
        setContent(prev => {
          const exists = prev.find(c => c.section === section && c.key === key);
          if (exists) {
            return prev.map(c => (c.section === section && c.key === key ? updatedItem : c));
          }
          return [...prev, updatedItem];
        });
      }
    } catch (err) {
      alert("Error saving content");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (section: string, file: File) => {
    setSaving(true);
    try {
      const result = await uploadToCloudinary(file, "staynamcheon/home");
      await handleUpdate(section, "imageUrl", result.secure_url);
    } catch (err) {
      console.error(err);
      alert("Error uploading image");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 animate-pulse">Loading management console...</div>;

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-[#171212] tracking-tight">Main Page Management</h1>
          <p className="text-[#856669] mt-2 font-medium">Manage the visuals and messaging of your landing page.</p>
        </div>
        <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest ${saving ? 'bg-orange-100 text-orange-600 animate-bounce' : 'bg-green-100 text-green-600'}`}>
          {saving ? 'Saving...' : 'All Changes Saved'}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pb-20">
        {SECTIONS.map((sec) => (
          <section key={sec.id} className="bg-white rounded-3xl border border-[#e4dcdd] overflow-hidden shadow-sm flex flex-col">
            <div className="p-8 border-b border-[#f4f1f1] flex items-center justify-between bg-[#f8f6f6]/30">
              <h3 className="font-bold text-[#171212] flex items-center gap-2">
                <sec.icon size={18} className="text-[#DB5461]" />
                {sec.name}
              </h3>
            </div>
            
            <div className="p-8 flex-1 space-y-8">
              {/* Image/Video Preview & Upload */}
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest text-[#856669] block">Background Media (Image or MP4)</label>
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-[#e4dcdd] bg-[#f8f6f6] group">
                  {(() => {
                    const url = content.find(c => c.section === sec.id && c.key === "imageUrl")?.value || "/images/lovable/hero.jpg";
                    const isVid = url.endsWith(".mp4") || url.includes("/video/upload/");
                    if (isVid) {
                      return <video src={url} autoPlay loop muted playsInline className="w-full h-full object-cover" />;
                    }
                    return <img src={url} alt={sec.name} className="w-full h-full object-cover" />;
                  })()}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">

                    <button 
                      onClick={() => document.getElementById(`upload-${sec.id}`)?.click()}
                      className="bg-white text-[#171212] px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
                    >
                      <ImageIcon size={16} />
                      Change Media
                    </button>
                  </div>
                  <input 
                    type="file" 
                    id={`upload-${sec.id}`}
                    className="hidden" 
                    accept="image/*,video/mp4"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(sec.id, file);
                    }}
                  />
                </div>
              </div>

              {/* Text Fields */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#856669]">
                    {sec.id === "hero" ? "Main Title" : "Section Title"}
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enter title..."
                    defaultValue={content.find(c => c.section === sec.id && c.key === "title")?.value || ""}
                    onBlur={(e) => handleUpdate(sec.id, "title", e.target.value)}
                    className="w-full bg-[#f8f6f6] border border-[#e4dcdd] rounded-xl px-4 py-3 text-[#171212] focus:border-[#DB5461] outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#856669]">
                    {sec.id === "hero" ? "Hero Subtitle" : "Description"}
                  </label>
                  <textarea 
                    rows={4}
                    placeholder="Enter description..."
                    defaultValue={content.find(c => c.section === sec.id && (c.key === "description" || c.key === "subtitle"))?.value || ""}
                    onBlur={(e) => handleUpdate(sec.id, sec.id === "hero" ? "subtitle" : "description", e.target.value)}
                    className="w-full bg-[#f8f6f6] border border-[#e4dcdd] rounded-xl px-4 py-4 text-[#171212] focus:border-[#DB5461] outline-none transition-colors resize-none text-sm leading-relaxed"
                  />
                </div>

                {sec.id !== "hero" && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#856669]">Label</label>
                    <input 
                      type="text" 
                      placeholder="Enter label (e.g. Accommodation)"
                      defaultValue={content.find(c => c.section === sec.id && c.key === "label")?.value || ""}
                      onBlur={(e) => handleUpdate(sec.id, "label", e.target.value)}
                      className="w-full bg-[#f8f6f6] border border-[#e4dcdd] rounded-xl px-4 py-3 text-[#171212] focus:border-[#DB5461] outline-none transition-colors"
                    />
                  </div>
                )}
              </div>
            </div>
          </section>
        ))}

        {/* Floating Contact Button */}
        <section className="bg-white rounded-3xl border border-[#e4dcdd] overflow-hidden shadow-sm flex flex-col xl:col-span-2">
            <div className="p-8 border-b border-[#f4f1f1] flex items-center justify-between bg-[#f8f6f6]/30">
              <h3 className="font-bold text-[#171212] flex items-center gap-2">
                <Phone size={18} className="text-[#DB5461]" />
                우측 하단 예약문의 플로팅 버튼
              </h3>
            </div>
            
            <div className="p-8 flex-1 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#856669]">첫 번째 줄 (예: 예약문의 010-9038-5822)</label>
                <input 
                  type="text" 
                  placeholder="예약문의 010-9038-5822"
                  defaultValue={content.find(c => c.section === "floating" && c.key === "line1")?.value || ""}
                  onBlur={(e) => handleUpdate("floating", "line1", e.target.value)}
                  className="w-full bg-[#f8f6f6] border border-[#e4dcdd] rounded-xl px-4 py-3 text-[#171212] focus:border-[#DB5461] outline-none transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#856669]">두 번째 줄 (추가 안내문, 예: 제2야수교 면회객은 별도문의주세요.)</label>
                <input 
                  type="text" 
                  placeholder="안내문이 필요 없을 경우 비워주세요."
                  defaultValue={content.find(c => c.section === "floating" && c.key === "line2")?.value || ""}
                  onBlur={(e) => handleUpdate("floating", "line2", e.target.value)}
                  className="w-full bg-[#f8f6f6] border border-[#e4dcdd] rounded-xl px-4 py-3 text-[#171212] focus:border-[#DB5461] outline-none transition-colors"
                />
              </div>
            </div>
        </section>
      </div>
    </div>
  );
}
