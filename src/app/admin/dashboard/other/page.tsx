"use client";

import { useState, useEffect } from "react";
import { Layout, Save, Loader2, Plus, Trash2, Dumbbell, Image as ImageIcon } from "lucide-react";
import SingleImageUploader from "@/components/admin/SingleImageUploader";
import MultiImageUploader, { MultiImageItem } from "@/components/admin/MultiImageUploader";

const FACILITY_IDS = ["pool", "bounce", "pingpong", "golf"];

export default function OtherManagementPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Form State
  const [hero, setHero] = useState({
    title: "Experiences",
    subtitle: "Memorable Moments at StayNamcheon",
    imageUrl: "/images/lovable/other.jpg"
  });

  const [facilities, setFacilities] = useState<Record<string, any>>({
    pool: { title: "Pool", subtitle: "", description: "", rules: [], images: [] },
    bounce: { title: "Bounce", subtitle: "", description: "", rules: [], images: [] },
    pingpong: { title: "Pingpong", subtitle: "", description: "", rules: [], images: [] },
    golf: { title: "Golf", subtitle: "", description: "", rules: [], images: [] }
  });

  const [galleryImages, setGalleryImages] = useState<MultiImageItem[]>([]);

  useEffect(() => {
    fetch("/api/admin/content?page=other")
      .then(res => res.json())
      .then(data => {
        const getVal = (section: string, key: string, fallback: string) => 
          data.find((c: any) => c.section === section && c.key === key)?.value || fallback;
        const getJson = (section: string, key: string, fallback: any) => {
          const val = data.find((c: any) => c.section === section && c.key === key)?.value;
          return val ? JSON.parse(val) : fallback;
        };

        setHero({
          title: getVal("hero", "title", "Experiences"),
          subtitle: getVal("hero", "subtitle", "Memorable Moments at StayNamcheon"),
          imageUrl: getVal("hero", "imageUrl", "/images/lovable/other.jpg")
        });
        
        const loadedFacilities: Record<string, any> = {};
        FACILITY_IDS.forEach(id => {
          loadedFacilities[id] = {
            title: getVal(id, "title", id.charAt(0).toUpperCase() + id.slice(1)),
            subtitle: getVal(id, "subtitle", ""),
            description: getVal(id, "description", ""),
            rules: getJson(id, "rules", []),
            images: getJson(id, "images", []).map((img: any, idx: number) => ({ id: String(idx), src: img.src, alt: img.alt, type: img.type }))
          };
        });
        setFacilities(loadedFacilities);

        const rawGallery = getJson("gallery", "images", [
          { src: "/images/lovable/gallery1.jpg", alt: "" }
        ]);
        setGalleryImages(rawGallery.map((g: any, i: number) => ({ id: String(i), src: g.src, alt: g.alt })));
        
        setLoading(false);
      });
  }, []);

  const markChanged = () => setHasChanges(true);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = [
        { page: "other", section: "hero", key: "title", value: hero.title, type: "text" },
        { page: "other", section: "hero", key: "subtitle", value: hero.subtitle, type: "text" },
        { page: "other", section: "hero", key: "imageUrl", value: hero.imageUrl, type: "image" },
        { 
          page: "other", 
          section: "gallery", 
          key: "images", 
          value: JSON.stringify(galleryImages.map(gi => ({ src: gi.src, alt: gi.alt }))), 
          type: "json" 
        }
      ];

      FACILITY_IDS.forEach(id => {
        const fac = facilities[id];
        updates.push({ page: "other", section: id, key: "title", value: fac.title, type: "text" });
        updates.push({ page: "other", section: id, key: "subtitle", value: fac.subtitle, type: "text" });
        updates.push({ page: "other", section: id, key: "description", value: fac.description, type: "text" });
        updates.push({ page: "other", section: id, key: "rules", value: JSON.stringify(fac.rules), type: "json" });
        updates.push({ 
          page: "other", 
          section: id, 
          key: "images", 
          value: JSON.stringify(fac.images.map((gi: any) => ({ src: gi.src, alt: gi.alt, type: gi.type }))), 
          type: "json" 
        });
      });

      await Promise.all(updates.map(update => 
        fetch("/api/admin/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(update),
        })
      ));
      
      setHasChanges(false);
      alert("성공적으로 저장되었습니다.");
    } catch (err) {
      alert("Error saving content");
    } finally {
      setSaving(false);
    }
  };

  const updateFacility = (id: string, field: string, value: any) => {
    setFacilities(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
    markChanged();
  };

  const addRule = (id: string) => {
    const rules = [...facilities[id].rules, "새 규칙을 입력하세요."];
    updateFacility(id, "rules", rules);
  };

  const updateRule = (id: string, index: number, value: string) => {
    const rules = [...facilities[id].rules];
    rules[index] = value;
    updateFacility(id, "rules", rules);
  };

  const removeRule = (id: string, index: number) => {
    const rules = facilities[id].rules.filter((_: any, i: number) => i !== index);
    updateFacility(id, "rules", rules);
  };

  if (loading) return <div className="p-12 animate-pulse font-medium text-[#856669]">Loading Other Management...</div>;

  return (
    <div className="space-y-8 max-w-7xl pb-40">
      <div className="flex items-center justify-between bg-white px-8 py-6 rounded-3xl border border-[#e4dcdd] shadow-sm sticky top-6 z-50">
        <div>
          <h1 className="text-3xl font-bold text-[#171212] tracking-tight">Facilities Management</h1>
          <p className="text-[#856669] mt-1 text-sm font-medium">부대시설 (Other) 페이지의 전반적인 내용을 관리합니다.</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="flex items-center gap-2 bg-[#DB5461] text-white px-6 py-3 rounded-2xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#DB5461]/20 disabled:opacity-50 disabled:grayscale"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            변경사항 저장
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* HERO SECTION */}
        <section className="bg-white rounded-3xl border border-[#e4dcdd] overflow-hidden">
          <div className="p-8 border-b border-[#f4f1f1] bg-[#f8f6f6]/30">
            <h3 className="font-bold text-[#171212] flex items-center gap-2">
              <Layout size={18} className="text-[#DB5461]" />
              Hero Section (상단 배너)
            </h3>
          </div>
          <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#856669]">Hero Title</label>
                <input 
                  type="text" 
                  value={hero.title}
                  onChange={(e) => { setHero({...hero, title: e.target.value}); markChanged(); }}
                  className="w-full bg-[#f8f6f6] border border-[#e4dcdd] rounded-xl px-4 py-3 text-[#171212] focus:border-[#DB5461] outline-none transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#856669]">Hero Subtitle</label>
                <input 
                  type="text" 
                  value={hero.subtitle}
                  onChange={(e) => { setHero({...hero, subtitle: e.target.value}); markChanged(); }}
                  className="w-full bg-[#f8f6f6] border border-[#e4dcdd] rounded-xl px-4 py-3 text-[#171212] focus:border-[#DB5461] outline-none transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-[#856669] mb-2 block">Background Image</label>
              <SingleImageUploader 
                currentImageUrl={hero.imageUrl}
                onUpload={(url) => { setHero({...hero, imageUrl: url}); markChanged(); }}
              />
            </div>
          </div>
        </section>

        {/* FACILITIES SECTION */}
        <section className="bg-white rounded-3xl border border-[#e4dcdd] overflow-hidden">
          <div className="p-8 border-b border-[#f4f1f1] bg-[#f8f6f6]/30">
            <h3 className="font-bold text-[#171212] flex items-center gap-2">
              <Dumbbell size={18} className="text-[#DB5461]" />
              Facilities (부대시설 상세 설정)
            </h3>
          </div>
          <div className="p-8 space-y-16">
            {FACILITY_IDS.map((id) => {
              const fac = facilities[id];
              return (
                <div key={id} className="pt-8 border-t border-[#e4dcdd] first:pt-0 first:border-0 relative">
                  <div className="mb-6">
                    <h4 className="text-xl font-bold uppercase tracking-widest text-[#171212]">{fac.title}</h4>
                    <p className="text-sm text-[#856669]">해당 부대시설의 내용을 비워두면 프론트엔드에 노출되지 않습니다.</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pr-12">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-[#856669]">섹션 부제목 (Subtitle)</label>
                        <input 
                          type="text" value={fac.subtitle} placeholder="예: 야외 수영장"
                          onChange={(e) => updateFacility(id, "subtitle", e.target.value)}
                          className="w-full bg-[#fdfcfc] border border-[#e4dcdd] rounded-xl px-4 py-2 text-[#171212] focus:border-[#DB5461] outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-[#856669]">설명 (Description)</label>
                        <textarea 
                          rows={3} value={fac.description} placeholder="시설 운영 관련 상세 내용"
                          onChange={(e) => updateFacility(id, "description", e.target.value)}
                          className="w-full bg-[#fdfcfc] border border-[#e4dcdd] rounded-xl px-4 py-2 text-[#171212] focus:border-[#DB5461] outline-none resize-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-[#856669]">이용 수칙 (Rules)</label>
                          <button onClick={() => addRule(id)} className="text-xs font-bold text-[#DB5461] flex items-center gap-1 hover:underline">
                            <Plus size={14} /> 규칙 추가
                          </button>
                        </div>
                        <div className="space-y-2">
                          {fac.rules.map((rule: string, rIdx: number) => (
                            <div key={rIdx} className="flex gap-2 items-center">
                              <input 
                                type="text" value={rule}
                                onChange={(e) => updateRule(id, rIdx, e.target.value)}
                                className="flex-1 bg-white border border-[#e4dcdd] rounded-lg px-3 py-1.5 text-sm focus:border-[#DB5461] outline-none"
                              />
                              <button onClick={() => removeRule(id, rIdx)} className="text-red-400 hover:text-red-600 p-1">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="lg:col-span-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-[#856669] mb-4 block flex items-center gap-2">
                        <ImageIcon size={14} className="text-[#DB5461]" /> 시설 갤러리 이미지
                        <span className="text-xs font-normal text-muted-foreground normal-case tracking-normal ml-2">첫 번째 이미지가 대표 썸네일로 사용됩니다. 1개 이상 추가 시 슬라이드로 노출됩니다.</span>
                      </label>
                      <MultiImageUploader 
                        items={fac.images}
                        onChange={(items) => updateFacility(id, "images", items)}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* GALLERY SECTION */}
        <section className="bg-white rounded-3xl border border-[#e4dcdd] overflow-hidden">
          <div className="p-8 border-b border-[#f4f1f1] bg-[#f8f6f6]/30">
            <h3 className="font-bold text-[#171212] flex items-center gap-2">
              <Layout size={18} className="text-[#DB5461]" />
              Other Full Gallery (하단 전시 영역)
            </h3>
          </div>
          <div className="p-8">
            <MultiImageUploader 
              items={galleryImages}
              onChange={(items) => { setGalleryImages(items); markChanged(); }}
            />
          </div>
        </section>

      </div>
    </div>
  );
}
