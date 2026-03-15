"use client";

import { useState, useEffect } from "react";
import { 
  ChevronRight, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Play, 
  CheckCircle2, 
  Compass, 
  Settings2,
  ListOrdered
} from "lucide-react";

const SECTIONS = [
  { id: "hero", name: "Hero Section", description: "Top banner and messaging" },
  { id: "pool", name: "Swimming Pool", description: "Water activity guide" },
  { id: "bounce", name: "Air Bounce", description: "Playground area" },
  { id: "pingpong", name: "Table Tennis", description: "Recreation lounge" },
  { id: "golf", name: "Golf Range", description: "Practice field" },
];

export default function OtherManagementPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("hero");

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = () => {
    fetch("/api/admin/content?page=other")
      .then(res => res.json())
      .then(data => {
        setContent(data);
        setLoading(false);
      });
  };

  const findVal = (section: string, key: string) => content.find(c => c.section === section && c.key === key);

  const handleUpdate = async (section: string, key: string, value: any, type: string = "text") => {
    setSaving(true);
    const valString = typeof value === 'string' ? value : JSON.stringify(value);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: "other", section, key, value: valString, type }),
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

  const handleImageUpload = async (section: string, key: string, file: File, isGallery: boolean = false) => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      
      const { url } = await uploadRes.json();
      
      if (isGallery) {
        const currentImages = JSON.parse(findVal(section, "images")?.value || "[]");
        await handleUpdate(section, "images", [...currentImages, { src: url, alt: section }], "json");
      } else {
        await handleUpdate(section, key, url, "image");
      }
    } catch (err) {
      alert("Error uploading file");
    } finally {
      setSaving(false);
    }
  };

  const removeGalleryImage = async (section: string, index: number) => {
    const currentImages = JSON.parse(findVal(section, "images")?.value || "[]");
    const updatedImages = currentImages.filter((_: any, i: number) => i !== index);
    await handleUpdate(section, "images", updatedImages, "json");
  };

  const updateRule = async (section: string, index: number, value: string) => {
    const currentRules = JSON.parse(findVal(section, "rules")?.value || "[]");
    const updatedRules = [...currentRules];
    updatedRules[index] = value;
    await handleUpdate(section, "rules", updatedRules, "json");
  };

  const addRule = async (section: string) => {
    const currentRules = JSON.parse(findVal(section, "rules")?.value || "[]");
    await handleUpdate(section, "rules", [...currentRules, ""], "json");
  };

  const removeRule = async (section: string, index: number) => {
    const currentRules = JSON.parse(findVal(section, "rules")?.value || "[]");
    const updatedRules = currentRules.filter((_: any, i: number) => i !== index);
    await handleUpdate(section, "rules", updatedRules, "json");
  };

  if (loading) return <div className="p-12 animate-pulse font-medium text-[#856669]">Loading management console...</div>;

  return (
    <div className="flex gap-12 max-w-7xl mx-auto pb-40">
      {/* Mini Sidebar */}
      <div className="w-64 shrink-0 space-y-2">
        <h3 className="px-4 text-[10px] font-bold uppercase tracking-widest text-[#856669] mb-4">Content Sections</h3>
        {SECTIONS.map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveTab(sec.id)}
            className={`w-full text-left px-4 py-4 rounded-2xl transition-all duration-300 flex items-center justify-between group ${
              activeTab === sec.id 
                ? "bg-[#DB5461] text-white shadow-lg shadow-[#DB5461]/20" 
                : "hover:bg-white text-[#856669] hover:text-[#DB5461]"
            }`}
          >
            <div>
              <p className="font-bold text-sm">{sec.name}</p>
              <p className={`text-[10px] mt-0.5 ${activeTab === sec.id ? "text-white/70" : "text-[#856669]/60"}`}>
                {sec.description}
              </p>
            </div>
            <ChevronRight size={14} className={`${activeTab === sec.id ? "opacity-100" : "opacity-0 group-hover:opacity-40"}`} />
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 space-y-8">
        <div className="flex items-center justify-between bg-white px-8 py-4 rounded-3xl border border-[#e4dcdd] shadow-sm">
          <h2 className="font-bold text-[#171212] flex items-center gap-2">
            <Settings2 size={18} className="text-[#DB5461]" />
            Editing: {SECTIONS.find(s => s.id === activeTab)?.name}
          </h2>
          <div className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest ${saving ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
            {saving ? 'Saving...' : 'Status: Ready'}
          </div>
        </div>

        {activeTab === "hero" ? (
          <div className="bg-white rounded-3xl border border-[#e4dcdd] overflow-hidden p-8 space-y-8">
            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#856669]">Background Image</label>
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-[#e4dcdd] group">
                <img 
                  src={findVal("hero", "imageUrl")?.value || "/images/lovable/other.jpg"} 
                  className="w-full h-full object-cover"
                  alt="Hero"
                />
                <button 
                  onClick={() => document.getElementById("file-hero")?.click()}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                >
                  <ImageIcon size={20} className="mr-2" /> Change Image
                </button>
                <input 
                  type="file" id="file-hero" className="hidden" 
                  onChange={(e) => e.target.files?.[0] && handleImageUpload("hero", "imageUrl", e.target.files[0])} 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#856669]">Title</label>
                <input 
                  type="text" 
                  defaultValue={findVal("hero", "title")?.value || ""}
                  onBlur={(e) => handleUpdate("hero", "title", e.target.value)}
                  className="w-full bg-[#f8f6f6] border border-[#e4dcdd] rounded-xl px-4 py-3 outline-none focus:border-[#DB5461]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#856669]">Subtitle</label>
                <input 
                  type="text" 
                  defaultValue={findVal("hero", "subtitle")?.value || ""}
                  onBlur={(e) => handleUpdate("hero", "subtitle", e.target.value)}
                  className="w-full bg-[#f8f6f6] border border-[#e4dcdd] rounded-xl px-4 py-3 outline-none focus:border-[#DB5461]"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Gallery Management */}
            <div className="bg-white rounded-3xl border border-[#e4dcdd] p-8 space-y-6">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#856669]">Facility Gallery</label>
                <button 
                  onClick={() => document.getElementById("file-gallery")?.click()}
                  className="text-[10px] font-bold uppercase tracking-widest bg-black text-white px-4 py-2 rounded-full hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Plus size={14} /> Add Image/Video
                </button>
                <input 
                  type="file" id="file-gallery" className="hidden" 
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(activeTab, "images", e.target.files[0], true)} 
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {JSON.parse(findVal(activeTab, "images")?.value || "[]").map((img: any, i: number) => (
                  <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-[#e4dcdd] group">
                    {img.src.endsWith(".mp4") ? (
                      <div className="w-full h-full bg-black flex items-center justify-center">
                        <Play size={24} className="text-white" />
                      </div>
                    ) : (
                      <img src={img.src} alt="" className="w-full h-full object-cover" />
                    )}
                    <button 
                      onClick={() => removeGalleryImage(activeTab, i)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:scale-110"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Details */}
            <div className="bg-white rounded-3xl border border-[#e4dcdd] p-8 space-y-8">
               <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#856669]">Display Label (e.g. 수영장)</label>
                  <input 
                    type="text" 
                    defaultValue={findVal(activeTab, "subtitle")?.value || ""}
                    onBlur={(e) => handleUpdate(activeTab, "subtitle", e.target.value)}
                    className="w-full bg-[#f8f6f6] border border-[#e4dcdd] rounded-xl px-4 py-3 outline-none focus:border-[#DB5461]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#856669]">English Title (e.g. Pool)</label>
                  <input 
                    type="text" 
                    defaultValue={findVal(activeTab, "title")?.value || ""}
                    onBlur={(e) => handleUpdate(activeTab, "title", e.target.value)}
                    className="w-full bg-[#f8f6f6] border border-[#e4dcdd] rounded-xl px-4 py-3 outline-none focus:border-[#DB5461]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#856669]">Description</label>
                <textarea 
                  rows={4}
                  defaultValue={findVal(activeTab, "description")?.value || ""}
                  onBlur={(e) => handleUpdate(activeTab, "description", e.target.value)}
                  className="w-full bg-[#f8f6f6] border border-[#e4dcdd] rounded-xl px-4 py-4 outline-none focus:border-[#DB5461] resize-none leading-relaxed"
                />
              </div>

              {/* Rules Management */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#856669] flex items-center gap-2">
                    <ListOrdered size={14} /> Utilization Rules
                  </label>
                  <button 
                    onClick={() => addRule(activeTab)}
                    className="text-[10px] font-bold text-[#DB5461] hover:underline flex items-center gap-1"
                  >
                    <Plus size={12} /> Add Rule
                  </button>
                </div>
                <div className="space-y-3">
                  {JSON.parse(findVal(activeTab, "rules")?.value || "[]").map((rule: string, i: number) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-8 h-8 shrink-0 rounded-lg bg-[#f8f6f6] border border-[#e4dcdd] flex items-center justify-center">
                         <CheckCircle2 size={14} className="text-[#DB5461]" />
                      </div>
                      <input 
                        type="text" 
                        defaultValue={rule}
                        onBlur={(e) => updateRule(activeTab, i, e.target.value)}
                        className="flex-1 bg-[#f8f6f6] border border-[#e4dcdd] rounded-xl px-4 py-2 outline-none focus:border-[#DB5461] text-sm"
                      />
                      <button 
                        onClick={() => removeRule(activeTab, i)}
                        className="w-8 h-8 rounded-lg bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
