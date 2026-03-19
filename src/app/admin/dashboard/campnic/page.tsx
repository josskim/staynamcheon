"use client";

import { useState, useEffect } from "react";
import { Layout, Save, Loader2, Plus, Trash2, Tent, Clock, Users, DollarSign, ListChecks } from "lucide-react";
import SingleImageUploader from "@/components/admin/SingleImageUploader";
import MultiImageUploader, { MultiImageItem } from "@/components/admin/MultiImageUploader";

export default function CampnicManagementPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Hero
  const [hero, setHero] = useState({
    title: "Campnic Experience",
    subtitle: "Where Camping meets Picnic — Pure Stillness",
    imageUrl: "/images/lovable/campnic.jpg"
  });

  // Intro
  const [intro, setIntro] = useState({
    label: "Day Trip Glamping",
    heading: "Stillness in Nature",
    description: "StayNamcheon의 캠프닉은 1부와 2부로 나누어 운영되는 당일 글램핑 서비스입니다.\n복잡한 준비 없이 자연 속에서 여유로운 시간을 보내실 수 있도록 최상의 시설을 갖추고 있습니다.",
    petNote: "🐶 애견 동반 가능"
  });

  // Pricing
  const [prices, setPrices] = useState<{ label: string; price: string; note: string }[]>([]);

  // Pricing Note
  const [priceNote, setPriceNote] = useState("");

  // Schedule
  const [schedule, setSchedule] = useState<{ name: string; time: string }[]>([]);
  const [scheduleNote, setScheduleNote] = useState("");

  // Amenities
  const [amenities, setAmenities] = useState<{ title: string; description: string }[]>([]);

  // Preparation Guide
  const [prepRules, setPrepRules] = useState<string[]>([]);

  // Extra Charges
  const [extraCharges, setExtraCharges] = useState<{ label: string; price: string }[]>([]);
  const [extraNote, setExtraNote] = useState("");

  // Gallery
  const [galleryImages, setGalleryImages] = useState<MultiImageItem[]>([]);

  useEffect(() => {
    fetch("/api/admin/content?page=campnic")
      .then(res => res.json())
      .then(data => {
        const getVal = (section: string, key: string, fallback: string) =>
          data.find((c: any) => c.section === section && c.key === key)?.value || fallback;
        const getJson = (section: string, key: string, fallback: any) => {
          const val = data.find((c: any) => c.section === section && c.key === key)?.value;
          try { return val ? JSON.parse(val) : fallback; } catch { return fallback; }
        };

        setHero({
          title: getVal("hero", "title", "Campnic Experience"),
          subtitle: getVal("hero", "subtitle", "Where Camping meets Picnic — Pure Stillness"),
          imageUrl: getVal("hero", "imageUrl", "/images/lovable/campnic.jpg")
        });

        setIntro({
          label: getVal("intro", "label", "Day Trip Glamping"),
          heading: getVal("intro", "heading", "Stillness in Nature"),
          description: getVal("intro", "description", "StayNamcheon의 캠프닉은 1부와 2부로 나누어 운영되는 당일 글램핑 서비스입니다.\n복잡한 준비 없이 자연 속에서 여유로운 시간을 보내실 수 있도록 최상의 시설을 갖추고 있습니다."),
          petNote: getVal("intro", "petNote", "🐶 애견 동반 가능")
        });

        setPrices(getJson("pricing", "list", [
          { label: "Weekdays (Mon-Thu)", price: "50,000 KRW", note: "Base 2 / Max 10" },
          { label: "Weekend / Holidays", price: "70,000 KRW", note: "Fri-Sun / Peak Season" },
          { label: "Military Families", price: "80,000 KRW", note: "No pax/time limit" },
        ]));
        setPriceNote(getVal("pricing", "note", "* 7월 15일~8월 30일(성수기)은 주말 요금이 적용됩니다.\n* 제2야수교/제2야전수송교육단 면회객분들은 전화 문의 부탁드립니다."));

        setSchedule(getJson("schedule", "list", [
          { name: "Part 1 - Morning", time: "오전 11:00 ~ 오후 03:00" },
          { name: "Part 2 - Evening", time: "오후 05:00 ~ 오후 09:00" },
        ]));
        setScheduleNote(getVal("schedule", "note", "체크인/아웃 시간 조정이 필요하시면\n전화로 언제든지 문의해 주세요."));

        setAmenities(getJson("amenities", "list", [
          { title: "All Seasons", description: "겨울에는 따뜻한 전기판넬, 여름에는 시원한 에어컨이 구비되어 있어 언제나 편안합니다." },
          { title: "Entertainment", description: "스마트폰 미러링 기능을 통해 캠핑 중에도 영화와 드라마를 자유롭게 감상하실 수 있습니다." },
          { title: "Included Essentials", description: "숯, 그릴, 버너, 집게, 가위, 라면냄비, 장갑 등 취사에 필요한 핵심 도구가 기본 포함되어 있습니다." },
        ]));

        setPrepRules(getJson("prep", "rules", [
          "고기 등 드실 음식물과 양념류",
          "편리한 이용을 위한 일회용품",
          "쓰레기 분리수거 및 식기 세척 필수",
          "현장에서 음식물은 따로 판매하지 않습니다"
        ]));

        setExtraCharges(getJson("extra", "charges", [
          { label: "인원 추가", price: "5,000 KRW / 인" },
          { label: "시간 연장", price: "20,000 KRW / 시" },
          { label: "12개월 이하 영유아", price: "무료" },
        ]));
        setExtraNote(getVal("extra", "note", "추가 요금은 현장에서 계좌이체 또는 현금 결제만 가능하며, 시간 연장은 사전 확인 후 가능합니다."));

        const rawGallery = getJson("gallery", "images", [
          { src: "/images/lovable/campnic.jpg", alt: "Campnic area outdoors" },
          { src: "/images/lovable/gallery1.jpg", alt: "Cozy tent interior" },
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
        { page: "campnic", section: "hero", key: "title", value: hero.title, type: "text" },
        { page: "campnic", section: "hero", key: "subtitle", value: hero.subtitle, type: "text" },
        { page: "campnic", section: "hero", key: "imageUrl", value: hero.imageUrl, type: "image" },
        { page: "campnic", section: "intro", key: "label", value: intro.label, type: "text" },
        { page: "campnic", section: "intro", key: "heading", value: intro.heading, type: "text" },
        { page: "campnic", section: "intro", key: "description", value: intro.description, type: "text" },
        { page: "campnic", section: "intro", key: "petNote", value: intro.petNote, type: "text" },
        { page: "campnic", section: "pricing", key: "list", value: JSON.stringify(prices), type: "json" },
        { page: "campnic", section: "pricing", key: "note", value: priceNote, type: "text" },
        { page: "campnic", section: "schedule", key: "list", value: JSON.stringify(schedule), type: "json" },
        { page: "campnic", section: "schedule", key: "note", value: scheduleNote, type: "text" },
        { page: "campnic", section: "amenities", key: "list", value: JSON.stringify(amenities), type: "json" },
        { page: "campnic", section: "prep", key: "rules", value: JSON.stringify(prepRules), type: "json" },
        { page: "campnic", section: "extra", key: "charges", value: JSON.stringify(extraCharges), type: "json" },
        { page: "campnic", section: "extra", key: "note", value: extraNote, type: "text" },
        {
          page: "campnic", section: "gallery", key: "images",
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

  if (loading) return <div className="p-12 animate-pulse font-medium text-[#856669]">Loading Campnic Management...</div>;

  return (
    <div className="space-y-8 max-w-7xl pb-40">
      {/* HEADER */}
      <div className="flex items-center justify-between bg-white px-8 py-6 rounded-3xl border border-[#e4dcdd] shadow-sm sticky top-6 z-50">
        <div>
          <h1 className="text-3xl font-bold text-[#171212] tracking-tight">Campnic Management</h1>
          <p className="text-[#856669] mt-1 text-sm font-medium">캠프닉 페이지의 모든 콘텐츠를 관리합니다.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className="flex items-center gap-2 bg-[#DB5461] text-white px-6 py-3 rounded-2xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#DB5461]/20 disabled:opacity-50 disabled:grayscale"
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          변경사항 저장
        </button>
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
              <InputField label="Hero Title" value={hero.title} onChange={v => { setHero({ ...hero, title: v }); markChanged(); }} />
              <InputField label="Hero Subtitle" value={hero.subtitle} onChange={v => { setHero({ ...hero, subtitle: v }); markChanged(); }} />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-[#856669] mb-2 block">Background Image</label>
              <SingleImageUploader currentImageUrl={hero.imageUrl} onUpload={url => { setHero({ ...hero, imageUrl: url }); markChanged(); }} />
            </div>
          </div>
        </section>

        {/* INTRO SECTION */}
        <section className="bg-white rounded-3xl border border-[#e4dcdd] overflow-hidden">
          <div className="p-8 border-b border-[#f4f1f1] bg-[#f8f6f6]/30">
            <h3 className="font-bold text-[#171212] flex items-center gap-2">
              <Tent size={18} className="text-[#DB5461]" />
              Intro Section (소개)
            </h3>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <InputField label="소제목 라벨" value={intro.label} onChange={v => { setIntro({ ...intro, label: v }); markChanged(); }} />
              <InputField label="대제목 (Heading)" value={intro.heading} onChange={v => { setIntro({ ...intro, heading: v }); markChanged(); }} />
            </div>
            <TextareaField label="설명 (Description)" value={intro.description} onChange={v => { setIntro({ ...intro, description: v }); markChanged(); }} rows={4} />
            <InputField label="비고 (예: 애견 동반 가능)" value={intro.petNote} onChange={v => { setIntro({ ...intro, petNote: v }); markChanged(); }} />
          </div>
        </section>

        {/* PRICING SECTION */}
        <section className="bg-white rounded-3xl border border-[#e4dcdd] overflow-hidden">
          <div className="p-8 border-b border-[#f4f1f1] bg-[#f8f6f6]/30 flex justify-between items-center">
            <h3 className="font-bold text-[#171212] flex items-center gap-2">
              <DollarSign size={18} className="text-[#DB5461]" />
              Pricing (요금)
            </h3>
            <button onClick={() => { setPrices([...prices, { label: "New", price: "0 KRW", note: "" }]); markChanged(); }}
              className="text-sm font-bold bg-black text-white px-4 py-2 rounded-xl hover:bg-black/80 flex items-center gap-2">
              <Plus size={16} /> 요금 추가
            </button>
          </div>
          <div className="p-8 space-y-4">
            {prices.map((p, idx) => (
              <div key={idx} className="flex gap-3 items-center">
                <input type="text" placeholder="라벨 (예: Weekdays)" value={p.label}
                  onChange={e => { const n = [...prices]; n[idx].label = e.target.value; setPrices(n); markChanged(); }}
                  className="flex-1 bg-[#f8f6f6] border border-[#e4dcdd] rounded-lg px-3 py-2 text-sm focus:border-[#DB5461] outline-none" />
                <input type="text" placeholder="가격" value={p.price}
                  onChange={e => { const n = [...prices]; n[idx].price = e.target.value; setPrices(n); markChanged(); }}
                  className="w-40 bg-[#f8f6f6] border border-[#e4dcdd] rounded-lg px-3 py-2 text-sm focus:border-[#DB5461] outline-none" />
                <input type="text" placeholder="비고" value={p.note}
                  onChange={e => { const n = [...prices]; n[idx].note = e.target.value; setPrices(n); markChanged(); }}
                  className="w-40 bg-[#f8f6f6] border border-[#e4dcdd] rounded-lg px-3 py-2 text-sm focus:border-[#DB5461] outline-none" />
                <button onClick={() => { setPrices(prices.filter((_, i) => i !== idx)); markChanged(); }} className="text-red-400 hover:text-red-600 p-2">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <TextareaField label="요금 관련 비고" value={priceNote} onChange={v => { setPriceNote(v); markChanged(); }} rows={2} />
          </div>
        </section>

        {/* SCHEDULE SECTION */}
        <section className="bg-white rounded-3xl border border-[#e4dcdd] overflow-hidden">
          <div className="p-8 border-b border-[#f4f1f1] bg-[#f8f6f6]/30 flex justify-between items-center">
            <h3 className="font-bold text-[#171212] flex items-center gap-2">
              <Clock size={18} className="text-[#DB5461]" />
              Schedule (시간표)
            </h3>
            <button onClick={() => { setSchedule([...schedule, { name: "New Part", time: "" }]); markChanged(); }}
              className="text-sm font-bold bg-black text-white px-4 py-2 rounded-xl hover:bg-black/80 flex items-center gap-2">
              <Plus size={16} /> 시간대 추가
            </button>
          </div>
          <div className="p-8 space-y-4">
            {schedule.map((s, idx) => (
              <div key={idx} className="flex gap-3 items-center">
                <input type="text" placeholder="이름 (예: Part 1 - Morning)" value={s.name}
                  onChange={e => { const n = [...schedule]; n[idx].name = e.target.value; setSchedule(n); markChanged(); }}
                  className="flex-1 bg-[#f8f6f6] border border-[#e4dcdd] rounded-lg px-3 py-2 text-sm focus:border-[#DB5461] outline-none" />
                <input type="text" placeholder="시간 (예: 오전 11:00 ~ 오후 03:00)" value={s.time}
                  onChange={e => { const n = [...schedule]; n[idx].time = e.target.value; setSchedule(n); markChanged(); }}
                  className="flex-1 bg-[#f8f6f6] border border-[#e4dcdd] rounded-lg px-3 py-2 text-sm focus:border-[#DB5461] outline-none" />
                <button onClick={() => { setSchedule(schedule.filter((_, i) => i !== idx)); markChanged(); }} className="text-red-400 hover:text-red-600 p-2">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <TextareaField label="시간표 안내 비고" value={scheduleNote} onChange={v => { setScheduleNote(v); markChanged(); }} rows={2} />
          </div>
        </section>

        {/* AMENITIES SECTION */}
        <section className="bg-white rounded-3xl border border-[#e4dcdd] overflow-hidden">
          <div className="p-8 border-b border-[#f4f1f1] bg-[#f8f6f6]/30 flex justify-between items-center">
            <h3 className="font-bold text-[#171212] flex items-center gap-2">
              <Users size={18} className="text-[#DB5461]" />
              Amenities (편의시설)
            </h3>
            <button onClick={() => { setAmenities([...amenities, { title: "New", description: "" }]); markChanged(); }}
              className="text-sm font-bold bg-black text-white px-4 py-2 rounded-xl hover:bg-black/80 flex items-center gap-2">
              <Plus size={16} /> 항목 추가
            </button>
          </div>
          <div className="p-8 space-y-6">
            {amenities.map((a, idx) => (
              <div key={idx} className="flex gap-3 items-start p-4 border border-[#e4dcdd] rounded-xl bg-[#fdfcfc]">
                <div className="flex-1 space-y-3">
                  <input type="text" placeholder="제목" value={a.title}
                    onChange={e => { const n = [...amenities]; n[idx].title = e.target.value; setAmenities(n); markChanged(); }}
                    className="w-full bg-white border border-[#e4dcdd] rounded-lg px-3 py-2 text-sm focus:border-[#DB5461] outline-none font-bold" />
                  <textarea rows={2} placeholder="설명" value={a.description}
                    onChange={e => { const n = [...amenities]; n[idx].description = e.target.value; setAmenities(n); markChanged(); }}
                    className="w-full bg-white border border-[#e4dcdd] rounded-lg px-3 py-2 text-sm focus:border-[#DB5461] outline-none resize-none" />
                </div>
                <button onClick={() => { setAmenities(amenities.filter((_, i) => i !== idx)); markChanged(); }} className="text-red-400 hover:text-red-600 p-2 mt-1">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* PREPARATION + EXTRA CHARGES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Preparation Guide */}
          <section className="bg-white rounded-3xl border border-[#e4dcdd] overflow-hidden">
            <div className="p-8 border-b border-[#f4f1f1] bg-[#f8f6f6]/30 flex justify-between items-center">
              <h3 className="font-bold text-[#171212] flex items-center gap-2">
                <ListChecks size={18} className="text-[#DB5461]" />
                Preparation Guide (준비물)
              </h3>
              <button onClick={() => { setPrepRules([...prepRules, ""]); markChanged(); }}
                className="text-xs font-bold text-[#DB5461] flex items-center gap-1 hover:underline">
                <Plus size={14} /> 추가
              </button>
            </div>
            <div className="p-8 space-y-3">
              {prepRules.map((rule, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input type="text" value={rule}
                    onChange={e => { const n = [...prepRules]; n[idx] = e.target.value; setPrepRules(n); markChanged(); }}
                    className="flex-1 bg-[#f8f6f6] border border-[#e4dcdd] rounded-lg px-3 py-2 text-sm focus:border-[#DB5461] outline-none" />
                  <button onClick={() => { setPrepRules(prepRules.filter((_, i) => i !== idx)); markChanged(); }} className="text-red-400 hover:text-red-600 p-1">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Extra Charges */}
          <section className="bg-white rounded-3xl border border-[#e4dcdd] overflow-hidden">
            <div className="p-8 border-b border-[#f4f1f1] bg-[#f8f6f6]/30 flex justify-between items-center">
              <h3 className="font-bold text-[#171212] flex items-center gap-2">
                <DollarSign size={18} className="text-[#DB5461]" />
                Extra Charges (추가 요금)
              </h3>
              <button onClick={() => { setExtraCharges([...extraCharges, { label: "", price: "" }]); markChanged(); }}
                className="text-xs font-bold text-[#DB5461] flex items-center gap-1 hover:underline">
                <Plus size={14} /> 추가
              </button>
            </div>
            <div className="p-8 space-y-3">
              {extraCharges.map((c, idx) => (
                <div key={idx} className="flex gap-3 items-center">
                  <input type="text" placeholder="항목" value={c.label}
                    onChange={e => { const n = [...extraCharges]; n[idx].label = e.target.value; setExtraCharges(n); markChanged(); }}
                    className="flex-1 bg-[#f8f6f6] border border-[#e4dcdd] rounded-lg px-3 py-2 text-sm focus:border-[#DB5461] outline-none" />
                  <input type="text" placeholder="요금" value={c.price}
                    onChange={e => { const n = [...extraCharges]; n[idx].price = e.target.value; setExtraCharges(n); markChanged(); }}
                    className="w-40 bg-[#f8f6f6] border border-[#e4dcdd] rounded-lg px-3 py-2 text-sm focus:border-[#DB5461] outline-none" />
                  <button onClick={() => { setExtraCharges(extraCharges.filter((_, i) => i !== idx)); markChanged(); }} className="text-red-400 hover:text-red-600 p-1">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <TextareaField label="비고" value={extraNote} onChange={v => { setExtraNote(v); markChanged(); }} rows={2} />
            </div>
          </section>
        </div>

        {/* GALLERY SECTION */}
        <section className="bg-white rounded-3xl border border-[#e4dcdd] overflow-hidden">
          <div className="p-8 border-b border-[#f4f1f1] bg-[#f8f6f6]/30">
            <h3 className="font-bold text-[#171212] flex items-center gap-2">
              <Layout size={18} className="text-[#DB5461]" />
              Campnic Gallery (하단 갤러리)
            </h3>
          </div>
          <div className="p-8">
            <MultiImageUploader
              items={galleryImages}
              onChange={items => { setGalleryImages(items); markChanged(); }}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

/* ---- Inline Helper Fields ---- */
function InputField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-widest text-[#856669]">{label}</label>
      <input type="text" value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-[#f8f6f6] border border-[#e4dcdd] rounded-xl px-4 py-3 text-[#171212] focus:border-[#DB5461] outline-none transition-colors" />
    </div>
  );
}

function TextareaField({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-widest text-[#856669]">{label}</label>
      <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)}
        className="w-full bg-[#f8f6f6] border border-[#e4dcdd] rounded-xl px-4 py-3 text-[#171212] focus:border-[#DB5461] outline-none transition-colors resize-none" />
    </div>
  );
}
