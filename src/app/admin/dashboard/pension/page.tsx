"use client";

import { useState, useEffect } from "react";
import { Layout, Type, Save, Loader2, Plus, Trash2, BedDouble, Image as ImageIcon } from "lucide-react";
import SingleImageUploader from "@/components/admin/SingleImageUploader";
import MultiImageUploader, { MultiImageItem } from "@/components/admin/MultiImageUploader";

export default function PensionManagementPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Form State
  const [hero, setHero] = useState({
    title: "Living in Nature",
    subtitle: "StayNamcheon Pension Showcase",
    imageUrl: "/images/hero.png"
  });

  const [rooms, setRooms] = useState<any[]>([]);
  const [galleryImages, setGalleryImages] = useState<MultiImageItem[]>([]);

  useEffect(() => {
    fetch("/api/admin/content?page=pension")
      .then(res => res.json())
      .then(data => {
        const getVal = (section: string, key: string, fallback: string) => 
          data.find((c: any) => c.section === section && c.key === key)?.value || fallback;
        const getJson = (section: string, key: string, fallback: any) => {
          const val = data.find((c: any) => c.section === section && c.key === key)?.value;
          return val ? JSON.parse(val) : fallback;
        };

        setHero({
          title: getVal("hero", "title", "Living in Nature"),
          subtitle: getVal("hero", "subtitle", "StayNamcheon Pension Showcase"),
          imageUrl: getVal("hero", "imageUrl", "/images/hero.png")
        });
        
        const rawRooms = getJson("rooms", "list", [
          {
            name: "2F Room 201",
            description: "2 Rooms — Spacious suite with mountain views and modern amenities.",
            image: "/images/lovable/pension.jpg",
            gallery: [],
            prices: [
              { price: "300,000 KRW", label: "Off-season Weekdays (Mon–Thu)" },
              { price: "400,000 KRW", label: "Peak Season (Jul 15 – Aug 30)" }
            ]
          }
        ]);
        
        setRooms(rawRooms.map((r: any) => ({
          ...r,
          gallery: r.gallery && r.gallery.length > 0 
            ? r.gallery 
            : (r.image ? [{ id: Math.random().toString(36).substring(7), src: r.image }] : [])
        })));


        const rawGallery = getJson("gallery", "images", [
          { src: "/images/lovable/gallery1.jpg", alt: "Living space" },
          { src: "/images/lovable/gallery2.jpg", alt: "Bedroom detail" }
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
        { page: "pension", section: "hero", key: "title", value: hero.title, type: "text" },
        { page: "pension", section: "hero", key: "subtitle", value: hero.subtitle, type: "text" },
        { page: "pension", section: "hero", key: "imageUrl", value: hero.imageUrl, type: "image" },
        { page: "pension", section: "rooms", key: "list", value: JSON.stringify(rooms), type: "json" },
        { 
          page: "pension", 
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

  const addRoom = () => {
    setRooms([...rooms, { name: "New Room", description: "", image: "", gallery: [], prices: [] }]);
    markChanged();
  };


  const updateRoom = (index: number, updates: any) => {
    const newRooms = [...rooms];
    newRooms[index] = { ...newRooms[index], ...updates };
    setRooms(newRooms);
    markChanged();
  };

  const removeRoom = (index: number) => {
    if (!confirm("이 객실을 삭제하시겠습니까?")) return;
    setRooms(rooms.filter((_, i) => i !== index));
    markChanged();
  };

  const addPrice = (roomIndex: number) => {
    const newRooms = [...rooms];
    newRooms[roomIndex].prices.push({ price: "0 KRW", label: "New Price Season" });
    setRooms(newRooms);
    markChanged();
  };

  const updatePrice = (roomIndex: number, priceIndex: number, field: string, value: string) => {
    const newRooms = [...rooms];
    newRooms[roomIndex].prices[priceIndex][field] = value;
    setRooms(newRooms);
    markChanged();
  };

  const removePrice = (roomIndex: number, priceIndex: number) => {
    const newRooms = [...rooms];
    newRooms[roomIndex].prices = newRooms[roomIndex].prices.filter((_: any, i: number) => i !== priceIndex);
    setRooms(newRooms);
    markChanged();
  };

  if (loading) return <div className="p-12 animate-pulse font-medium text-[#856669]">Loading Pension Management...</div>;

  return (
    <div className="space-y-8 max-w-7xl pb-40">
      <div className="flex items-center justify-between bg-white px-8 py-6 rounded-3xl border border-[#e4dcdd] shadow-sm sticky top-6 z-50">
        <div>
          <h1 className="text-3xl font-bold text-[#171212] tracking-tight">Pension Management</h1>
          <p className="text-[#856669] mt-1 text-sm font-medium">객실(Pension) 페이지의 히어로 배너, 객실 정보 및 갤러리를 관리합니다.</p>
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

        {/* ROOMS SECTION */}
        <section className="bg-white rounded-3xl border border-[#e4dcdd] overflow-hidden">
          <div className="p-8 border-b border-[#f4f1f1] bg-[#f8f6f6]/30 flex justify-between items-center">
            <h3 className="font-bold text-[#171212] flex items-center gap-2">
              <BedDouble size={18} className="text-[#DB5461]" />
              Rooms (객실 관리)
            </h3>
            <button onClick={addRoom} className="text-sm font-bold bg-black text-white px-4 py-2 rounded-xl hover:bg-black/80 transition-colors flex items-center gap-2">
              <Plus size={16} /> 객실 추가
            </button>
          </div>
          <div className="p-8 space-y-12">
            {rooms.length === 0 && <p className="text-sm text-[#856669] text-center">등록된 객실이 없습니다.</p>}
            {rooms.map((room, idx) => (
              <div key={idx} className="p-6 rounded-2xl border border-[#e4dcdd] bg-[#fdfcfc] space-y-6 relative">
                <button 
                  onClick={() => removeRoom(idx)}
                  className="absolute top-6 right-6 text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pr-12">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-[#856669]">객실명 (Room Name)</label>
                      <input 
                        type="text" value={room.name}
                        onChange={(e) => updateRoom(idx, { name: e.target.value })}
                        className="w-full bg-white border border-[#e4dcdd] rounded-xl px-4 py-2 text-[#171212] focus:border-[#DB5461] outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-[#856669]">객실 설명 (Description)</label>
                      <textarea 
                        rows={3} value={room.description}
                        onChange={(e) => updateRoom(idx, { description: e.target.value })}
                        className="w-full bg-white border border-[#e4dcdd] rounded-xl px-4 py-2 text-[#171212] focus:border-[#DB5461] outline-none resize-none"
                      />
                    </div>
                  </div>
                  <div className="lg:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#856669] mb-4 block flex items-center gap-2">
                      <ImageIcon size={14} /> 객실 이미지 갤러리 
                      <span className="text-xs font-normal text-muted-foreground normal-case tracking-normal ml-2">첫 번째 이미지가 대표 썸네일로 사용됩니다.</span>
                    </label>
                    <MultiImageUploader 
                      items={room.gallery || []}
                      onChange={(items) => {
                        // First image synced to 'image' for backwards compatibility
                        const firstImage = items.length > 0 ? items[0].src : "";
                        updateRoom(idx, { gallery: items, image: firstImage });
                      }}
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-[#e4dcdd]">

                  <div className="flex justify-between items-center mb-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#856669] block">객실 요금 (Prices)</label>
                    <button onClick={() => addPrice(idx)} className="text-xs font-bold text-[#DB5461] flex items-center gap-1 hover:underline">
                      <Plus size={14} /> 요금 추가
                    </button>
                  </div>
                  <div className="space-y-3">
                    {room.prices.map((p: any, pIdx: number) => (
                      <div key={pIdx} className="flex gap-3 items-center">
                        <input 
                          type="text" placeholder="시즌/날짜 라벨 (예: 비수기 주말)"
                          value={p.label} onChange={(e) => updatePrice(idx, pIdx, 'label', e.target.value)}
                          className="flex-1 bg-white border border-[#e4dcdd] rounded-lg px-3 py-2 text-sm focus:border-[#DB5461] outline-none"
                        />
                        <input 
                          type="text" placeholder="가격 (예: 300,000 KRW)"
                          value={p.price} onChange={(e) => updatePrice(idx, pIdx, 'price', e.target.value)}
                          className="w-48 bg-white border border-[#e4dcdd] rounded-lg px-3 py-2 text-sm focus:border-[#DB5461] outline-none"
                        />
                        <button onClick={() => removePrice(idx, pIdx)} className="text-red-400 hover:text-red-600 p-2">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* GALLERY SECTION */}
        <section className="bg-white rounded-3xl border border-[#e4dcdd] overflow-hidden">
          <div className="p-8 border-b border-[#f4f1f1] bg-[#f8f6f6]/30">
            <h3 className="font-bold text-[#171212] flex items-center gap-2">
              <Type size={18} className="text-[#DB5461]" />
              Pension Gallery (하단 갤러리)
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
