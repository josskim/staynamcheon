"use client";

import { useState, useEffect } from "react";
import { Type, Image as ImageIcon } from "lucide-react";

export default function CafeManagementPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/content?page=cafe")
      .then(res => res.json())
      .then(data => {
        setContent(data);
        setLoading(false);
      });
  }, []);

  const handleUpdate = async (section: string, key: string, value: string) => {
    setSaving(true);
    try {
      await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: "cafe", section, key, value, type: "text" }),
      });
    } catch (err) {
      alert("Error saving content");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="animate-pulse">Loading Cafe Management...</div>;

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-[#171212] tracking-tight">Cafe Management</h1>
          <p className="text-[#856669] mt-2 font-medium">Manage the details and imagery for the Cafe section.</p>
        </div>
        <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest ${saving ? 'bg-orange-100 text-orange-600 animate-bounce' : 'bg-green-100 text-green-600'}`}>
          {saving ? 'Saving...' : 'All Changes Saved'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white rounded-3xl border border-[#e4dcdd] overflow-hidden">
          <div className="p-8 border-b border-[#f4f1f1] bg-[#f8f6f6]/30">
            <h3 className="font-bold text-[#171212] flex items-center gap-2">
              <Type size={18} className="text-[#DB5461]" />
              Detail Content
            </h3>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#856669]">Hero Title</label>
              <input 
                type="text" 
                defaultValue={content.find(c => c.section === "hero" && c.key === "title")?.value || "Cafe"}
                onChange={(e) => handleUpdate("hero", "title", e.target.value)}
                className="w-full bg-[#f8f6f6] border border-[#e4dcdd] rounded-xl px-4 py-3 text-[#171212] focus:border-[#DB5461] outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#856669]">Description</label>
              <textarea 
                rows={4}
                defaultValue={content.find(c => c.section === "about" && c.key === "description")?.value || "A minimalist cafe nestled within the property."}
                onChange={(e) => handleUpdate("about", "description", e.target.value)}
                className="w-full bg-[#f8f6f6] border border-[#e4dcdd] rounded-xl px-4 py-3 text-[#171212] focus:border-[#DB5461] outline-none transition-colors resize-none"
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-[#e4dcdd] overflow-hidden">
          <div className="p-8 border-b border-[#f4f1f1] bg-[#f8f6f6]/30">
            <h3 className="font-bold text-[#171212] flex items-center gap-2">
              <ImageIcon size={18} className="text-[#DB5461]" />
              Featured Images
            </h3>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#856669]">Hero Image URL</label>
              <input 
                type="text" 
                defaultValue={content.find(c => c.section === "hero" && c.key === "imageUrl")?.value || "/images/lovable/cafe.jpg"}
                onChange={(e) => handleUpdate("hero", "imageUrl", e.target.value)}
                className="w-full bg-[#f8f6f6] border border-[#e4dcdd] rounded-xl px-4 py-3 text-[#171212] focus:border-[#DB5461] outline-none transition-colors"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
