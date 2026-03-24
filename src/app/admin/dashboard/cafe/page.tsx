"use client";

import { useState, useEffect } from "react";
import { Layout, Save, Loader2, Plus, Trash2, Coffee, Flame, Snowflake, GlassWater } from "lucide-react";
import SingleImageUploader from "@/components/admin/SingleImageUploader";
import MultiImageUploader, { MultiImageItem } from "@/components/admin/MultiImageUploader";

export default function CafeManagementPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Form State
  const [hero, setHero] = useState({
    title: "Cafe Namcheon",
    subtitle: "A Minimalist Space for Thoughtful Moments",
    imageUrl: "/images/lovable/cafe.jpg"
  });

  const [menus, setMenus] = useState({
    hot: [] as { name: string; price: string }[],
    ice: [] as { name: string; price: string }[],
    ade: [] as { name: string; price: string }[]
  });

  const [galleryImages, setGalleryImages] = useState<MultiImageItem[]>([]);

  useEffect(() => {
    fetch("/api/admin/content?page=cafe")
      .then(res => res.json())
      .then(data => {
        const getVal = (section: string, key: string, fallback: string) => 
          data.find((c: any) => c.section === section && c.key === key)?.value || fallback;
        const getJson = (section: string, key: string, fallback: any) => {
          const val = data.find((c: any) => c.section === section && c.key === key)?.value;
          return val ? JSON.parse(val) : fallback;
        };

        setHero({
          title: getVal("hero", "title", "Cafe Namcheon"),
          subtitle: getVal("hero", "subtitle", "A Minimalist Space for Thoughtful Moments"),
          imageUrl: getVal("hero", "imageUrl", "/images/lovable/cafe.jpg")
        });
        
        setMenus(getJson("menu", "items", {
          hot: [
            { name: "아메리카노", price: "2,500원" },
            { name: "카페라떼", price: "3,000원" }
          ],
          ice: [
            { name: "아이스 아메리카노", price: "2,500원" }
          ],
          ade: [
            { name: "자몽에이드", price: "3,500원" }
          ]
        }));

        const rawGallery = getJson("gallery", "images", [
          { src: "/videos/movie.mp4", alt: "Cafe vibe video" },
          { src: "/images/lovable/cafe.jpg", alt: "Cafe interior" }
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
        { page: "cafe", section: "hero", key: "title", value: hero.title, type: "text" },
        { page: "cafe", section: "hero", key: "subtitle", value: hero.subtitle, type: "text" },
        { page: "cafe", section: "hero", key: "imageUrl", value: hero.imageUrl, type: "image" },
        { page: "cafe", section: "menu", key: "items", value: JSON.stringify(menus), type: "json" },
        { 
          page: "cafe", 
          section: "gallery", 
          key: "images", 
          value: JSON.stringify(galleryImages.map(gi => ({ src: gi.src, alt: gi.alt }))), 
          type: "json" 
        }
      ];

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

  const addMenuItem = (category: 'hot' | 'ice' | 'ade') => {
    setMenus({
      ...menus,
      [category]: [...menus[category], { name: "새 메뉴", price: "0원" }]
    });
    markChanged();
  };

  const updateMenuItem = (category: 'hot' | 'ice' | 'ade', index: number, field: string, value: string) => {
    const newCat = [...menus[category]];
    (newCat[index] as any)[field] = value;
    setMenus({ ...menus, [category]: newCat });
    markChanged();
  };

  const removeMenuItem = (category: 'hot' | 'ice' | 'ade', index: number) => {
    setMenus({
      ...menus,
      [category]: menus[category].filter((_, i) => i !== index)
    });
    markChanged();
  };

  if (loading) return <div className="p-12 animate-pulse font-medium text-[#856669]">Loading Cafe Management...</div>;

  const renderMenuEditor = (category: 'hot' | 'ice' | 'ade', title: string, icon: React.ReactNode, colorClass: string) => (
    <div className="p-6 rounded-2xl border border-[#e4dcdd] bg-[#fdfcfc]">
      <div className={`flex items-center justify-between mb-6 pb-4 border-b border-[#e4dcdd] ${colorClass}`}>
        <h4 className="font-bold flex items-center gap-2">
          {icon}
          {title} MENU
        </h4>
        <button onClick={() => addMenuItem(category)} className="text-sm font-bold bg-black text-white px-3 py-1.5 rounded-lg hover:bg-black/80 transition-colors flex items-center gap-1">
          <Plus size={14} /> 메뉴 추가
        </button>
      </div>
      <div className="space-y-3">
        {menus[category].map((item, idx) => (
          <div key={idx} className="flex gap-3 items-center">
            <input 
              type="text" placeholder="메뉴명 (예: 아메리카노)"
              value={item.name} onChange={(e) => updateMenuItem(category, idx, 'name', e.target.value)}
              className="flex-1 bg-white border border-[#e4dcdd] rounded-lg px-3 py-2 text-sm focus:border-[#DB5461] outline-none"
            />
            <input 
              type="text" placeholder="가격 (예: 2,500원)"
              value={item.price} onChange={(e) => updateMenuItem(category, idx, 'price', e.target.value)}
              className="w-32 bg-white border border-[#e4dcdd] rounded-lg px-3 py-2 text-sm focus:border-[#DB5461] outline-none"
            />
            <button onClick={() => removeMenuItem(category, idx)} className="text-red-400 hover:text-red-600 p-2">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {menus[category].length === 0 && <p className="text-xs text-[#856669] text-center py-4">등록된 메뉴가 없습니다.</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-7xl pb-40">
      <div className="flex items-center justify-between bg-white px-8 py-6 rounded-3xl border border-[#e4dcdd] shadow-sm sticky top-6 z-50">
        <div>
          <h1 className="text-3xl font-bold text-[#171212] tracking-tight">Cafe Management</h1>
          <p className="text-[#856669] mt-1 text-sm font-medium">카페 페이지의 메뉴 정보 및 이미지 갤러리를 관리합니다.</p>
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
                <textarea 
                  rows={3}
                  value={hero.subtitle}
                  onChange={(e) => { setHero({...hero, subtitle: e.target.value}); markChanged(); }}
                  className="w-full bg-[#f8f6f6] border border-[#e4dcdd] rounded-xl px-4 py-3 text-[#171212] focus:border-[#DB5461] outline-none transition-colors resize-none"
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

        {/* MENU SECTION */}
        <section className="bg-white rounded-3xl border border-[#e4dcdd] overflow-hidden">
          <div className="p-8 border-b border-[#f4f1f1] bg-[#f8f6f6]/30">
            <h3 className="font-bold text-[#171212] flex items-center gap-2">
              <Coffee size={18} className="text-[#DB5461]" />
              Cafe Menu (메뉴 관리)
            </h3>
          </div>
          <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {renderMenuEditor('hot', 'HOT', <Flame size={18} />, 'text-orange-500 border-orange-100')}
            {renderMenuEditor('ice', 'ICE', <Snowflake size={18} />, 'text-blue-500 border-blue-100')}
            {renderMenuEditor('ade', 'ADE', <GlassWater size={18} />, 'text-purple-500 border-purple-100')}
          </div>
        </section>

        {/* GALLERY SECTION */}
        <section className="bg-white rounded-3xl border border-[#e4dcdd] overflow-hidden">
          <div className="p-8 border-b border-[#f4f1f1] bg-[#f8f6f6]/30">
            <h3 className="font-bold text-[#171212] flex items-center gap-2">
              <Layout size={18} className="text-[#DB5461]" />
              Cafe Gallery (하단 갤러리/영상 목록)
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
