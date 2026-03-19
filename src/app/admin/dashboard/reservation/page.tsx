"use client";

import { useState, useEffect } from "react";
import { Layout, Save, Loader2, Plus, Trash2, Phone, Clock, AlertCircle } from "lucide-react";
import SingleImageUploader from "@/components/admin/SingleImageUploader";

export default function ReservationManagementPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Form State
  const [hero, setHero] = useState({
    title: "Reservation",
    subtitle: "StayNamcheon Reservation & Policy",
    imageUrl: "/images/lovable/hero.jpg"
  });

  const [contact, setContact] = useState({
    phone: "010-9038-5822"
  });

  const [info, setInfo] = useState({
    checkin: "오후 3:00"
  });

  const [refundPolicy, setRefundPolicy] = useState([
    { period: "이용일 기준 10일전 취소", refund: "전액환불" }
  ]);

  useEffect(() => {
    fetch("/api/admin/content?page=reservation")
      .then(res => res.json())
      .then(data => {
        const getVal = (section: string, key: string, fallback: string) => 
          data.find((c: any) => c.section === section && c.key === key)?.value || fallback;
        const getJson = (section: string, key: string, fallback: any) => {
          const val = data.find((c: any) => c.section === section && c.key === key)?.value;
          return val ? JSON.parse(val) : fallback;
        };

        setHero({
          title: getVal("hero", "title", "Reservation"),
          subtitle: getVal("hero", "subtitle", "StayNamcheon Reservation & Policy"),
          imageUrl: getVal("hero", "imageUrl", "/images/lovable/hero.jpg")
        });
        
        setContact({ phone: getVal("contact", "phone", "010-9038-5822") });
        setInfo({ checkin: getVal("info", "checkin", "오후 3:00") });

        setRefundPolicy(getJson("policy", "refund", [
          { period: "이용일 기준 10일전 취소", refund: "전액환불" },
          { period: "이용일 기준 7~9일전 취소", refund: "10% 공제후 환불" },
          { period: "이용일 기준 6일전 취소", refund: "20% 공제후 환불" },
          { period: "이용일 기준 5일전 취소", refund: "30% 공제후 환불" },
          { period: "이용일 기준 4일전 취소", refund: "40% 공제후 환불" },
          { period: "이용일 기준 3일전 취소", refund: "50% 공제후 환불" },
          { period: "이용일 기준 2일전 취소", refund: "70% 공제후 환불" },
          { period: "이용일 기준 1일전 또는 당일 취소", refund: "환불불가" },
        ]));
        
        setLoading(false);
      });
  }, []);

  const markChanged = () => setHasChanges(true);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = [
        { page: "reservation", section: "hero", key: "title", value: hero.title, type: "text" },
        { page: "reservation", section: "hero", key: "subtitle", value: hero.subtitle, type: "text" },
        { page: "reservation", section: "hero", key: "imageUrl", value: hero.imageUrl, type: "image" },
        { page: "reservation", section: "contact", key: "phone", value: contact.phone, type: "text" },
        { page: "reservation", section: "info", key: "checkin", value: info.checkin, type: "text" },
        { page: "reservation", section: "policy", key: "refund", value: JSON.stringify(refundPolicy), type: "json" },
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

  const addPolicy = () => {
    setRefundPolicy([...refundPolicy, { period: "취소 시점", refund: "환불율" }]);
    markChanged();
  };

  const updatePolicy = (index: number, field: "period" | "refund", value: string) => {
    const newPolicy = [...refundPolicy];
    newPolicy[index][field] = value;
    setRefundPolicy(newPolicy);
    markChanged();
  };

  const removePolicy = (index: number) => {
    setRefundPolicy(refundPolicy.filter((_, i) => i !== index));
    markChanged();
  };

  if (loading) return <div className="p-12 animate-pulse font-medium text-[#856669]">Loading Reservation Management...</div>;

  return (
    <div className="space-y-8 max-w-7xl pb-40">
      <div className="flex items-center justify-between bg-white px-8 py-6 rounded-3xl border border-[#e4dcdd] shadow-sm sticky top-6 z-50">
        <div>
          <h1 className="text-3xl font-bold text-[#171212] tracking-tight">Reservation Management</h1>
          <p className="text-[#856669] mt-1 text-sm font-medium">예약 페이지의 안내 정보와 환불 규정을 관리합니다.</p>
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

        {/* INFO SECTION */}
        <section className="bg-white rounded-3xl border border-[#e4dcdd] overflow-hidden">
          <div className="p-8 border-b border-[#f4f1f1] bg-[#f8f6f6]/30">
            <h3 className="font-bold text-[#171212] flex items-center gap-2">
              <Phone size={18} className="text-[#DB5461]" />
              Contact & Info (예약문의 및 체크인 시간)
            </h3>
          </div>
          <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#856669]">전화번호 (Phone Number)</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#856669]" size={18} />
                <input 
                  type="text" 
                  value={contact.phone}
                  onChange={(e) => { setContact({ phone: e.target.value }); markChanged(); }}
                  className="w-full bg-[#f8f6f6] border border-[#e4dcdd] rounded-xl pl-12 pr-4 py-3 text-[#171212] focus:border-[#DB5461] outline-none transition-colors"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#856669]">체크인 기준 시간 (Check-in time)</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#856669]" size={18} />
                <input 
                  type="text" 
                  value={info.checkin}
                  onChange={(e) => { setInfo({ checkin: e.target.value }); markChanged(); }}
                  className="w-full bg-[#f8f6f6] border border-[#e4dcdd] rounded-xl pl-12 pr-4 py-3 text-[#171212] focus:border-[#DB5461] outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        </section>

        {/* POLICY SECTION */}
        <section className="bg-white rounded-3xl border border-[#e4dcdd] overflow-hidden">
          <div className="p-8 border-b border-[#f4f1f1] bg-[#f8f6f6]/30 flex justify-between items-center">
            <h3 className="font-bold text-[#171212] flex items-center gap-2">
              <AlertCircle size={18} className="text-[#DB5461]" />
              Refund Policy (환불 규정)
            </h3>
            <button onClick={addPolicy} className="text-sm font-bold bg-black text-white px-4 py-2 rounded-xl hover:bg-black/80 transition-colors flex items-center gap-2">
              <Plus size={16} /> 규정 추가
            </button>
          </div>
          <div className="p-8">
            <div className="border border-[#e4dcdd] rounded-2xl overflow-hidden">
              <div className="grid grid-cols-[1fr_1fr_40px] bg-[#f8f6f6] p-4 text-xs font-bold uppercase tracking-widest text-[#856669] border-b border-[#e4dcdd]">
                <span>취소 시점</span>
                <span>환불 규정</span>
                <span></span>
              </div>
              <div className="divide-y divide-[#e4dcdd]">
                {refundPolicy.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-[1fr_1fr_40px] bg-white text-sm">
                    <input 
                      type="text" value={item.period}
                      onChange={(e) => updatePolicy(idx, "period", e.target.value)}
                      className="p-4 w-full outline-none focus:bg-orange-50 transition-colors"
                    />
                    <input 
                      type="text" value={item.refund}
                      onChange={(e) => updatePolicy(idx, "refund", e.target.value)}
                      className="p-4 w-full outline-none focus:bg-orange-50 transition-colors font-semibold"
                    />
                    <div className="flex items-center justify-center border-l border-[#e4dcdd]">
                      <button onClick={() => removePolicy(idx)} className="text-red-400 hover:text-red-500 p-2">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
