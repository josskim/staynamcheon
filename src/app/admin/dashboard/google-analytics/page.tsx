"use client";

import { useEffect, useState } from "react";
import { Loader2, TrendingUp, Users, PieChart as PieChartIcon, Smartphone } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from "recharts";

const COLORS = ["#DB5461", "#4F8EF7", "#F7C04F", "#5CB87A", "#A78BFA", "#F97316"];

export default function GoogleAnalyticsDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/ga4")
      .then((res) => res.json())
      .then((d) => {
        if (d.error) {
          setError(d.error);
        } else {
          setData(d);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 size={32} className="animate-spin text-[#DB5461]" />
        <p className="text-[#856669] font-medium pulse">Google Analytics 데이터를 불러오고 있습니다...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-100 rounded-3xl p-12 text-center max-w-2xl mx-auto mt-10">
        <div className="w-16 h-16 bg-rose-100 text-[#DB5461] rounded-2xl flex items-center justify-center mx-auto mb-6">
          <PieChartIcon size={32} />
        </div>
        <h2 className="text-2xl font-bold text-[#171212] mb-4">설정이 필요합니다</h2>
        <p className="text-[#856669] mb-8 leading-relaxed">
          {error}
        </p>
        <div className="bg-white p-6 rounded-2xl border border-rose-100 text-left text-sm text-[#856669] space-y-2">
          <p>🔧 <strong>해결 방법:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>제공해드린 [단계별 가이드]를 따라 구글 클라우드에서 서비스 계정을 만듭니다.</li>
            <li>환경 변수(.env)에 GA4_PROPERTY_ID, GA4_CLIENT_EMAIL, GA4_PRIVATE_KEY를 등록합니다.</li>
            <li>Vercel 또는 호스팅 서버를 다시 시작합니다.</li>
          </ul>
        </div>
      </div>
    );
  }

  // 데이터 가공 (AgeBracket, Gender 등)
  const ageData = data.demographics.rows?.map((row: any) => ({
    name: row.dimensionValues[0].value,
    count: parseInt(row.metricValues[0].value),
  })).sort((a: any, b: any) => a.name.localeCompare(b.name)) || [];

  const genderData = data.demographics.rows?.map((row: any) => ({
    name: row.dimensionValues[1].value === "male" ? "남성" : row.dimensionValues[1].value === "female" ? "여성" : "알 수 없음",
    value: parseInt(row.metricValues[0].value),
  })) || [];

  const trendData = data.main.rows?.map((row: any) => ({
    date: row.dimensionValues[0].value.replace(/^(\d{4})(\d{2})(\d{2})$/, "$2/$3"),
    users: parseInt(row.metricValues[0].value),
    views: parseInt(row.metricValues[1].value),
  })) || [];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h1 className="text-4xl font-bold text-[#171212] tracking-tight">Google Analytics</h1>
        <p className="text-[#856669] mt-2 font-medium">구글 통계 기반 사용자 행동 및 인구통계 분석</p>
      </header>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-[#e4dcdd] shadow-sm">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4">
            <Users size={24} />
          </div>
          <p className="text-sm font-medium text-[#856669] uppercase tracking-widest">7일 활성 사용자</p>
          <p className="text-4xl font-bold text-[#171212] mt-2">
            {trendData.reduce((acc: number, cur: any) => acc + cur.users, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-[#e4dcdd] shadow-sm">
          <div className="w-12 h-12 bg-rose-50 text-[#DB5461] rounded-2xl flex items-center justify-center mb-4">
            <TrendingUp size={24} />
          </div>
          <p className="text-sm font-medium text-[#856669] uppercase tracking-widest">7일 페이지뷰</p>
          <p className="text-4xl font-bold text-[#171212] mt-2">
            {trendData.reduce((acc: number, cur: any) => acc + cur.views, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-[#e4dcdd] shadow-sm">
          <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center mb-4">
            <Smartphone size={24} />
          </div>
          <p className="text-sm font-medium text-[#856669] uppercase tracking-widest">주요 기기</p>
          <p className="text-4xl font-bold text-[#171212] mt-2">Mobile</p>
        </div>
      </div>

      {/* Charts Row 1: Trend */}
      <div className="bg-white p-8 rounded-3xl border border-[#e4dcdd]">
        <h3 className="text-xl font-bold text-[#171212] mb-8">방문자 및 페이지뷰 추이 (7일)</h3>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f1f1" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#856669', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#856669', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
              />
              <Legend verticalAlign="top" height={36}/>
              <Bar dataKey="users" name="사용자" fill="#DB5461" radius={[4, 4, 0, 0]} barSize={24} />
              <Bar dataKey="views" name="뷰" fill="#4F8EF7" radius={[4, 4, 0, 0]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2: Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Age Bracket Bar Chart */}
        <div className="bg-white p-8 rounded-3xl border border-[#e4dcdd]">
          <h3 className="text-xl font-bold text-[#171212] mb-8">연령 피라미드 (30일)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f4f1f1" />
                <XAxis type="number" axisLine={false} tickLine={false} hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#171212', fontWeight: 500}} />
                <Tooltip 
                  cursor={{fill: '#f8f6f6'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" name="사용자" fill="#DB5461" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gender Pie Chart */}
        <div className="bg-white p-8 rounded-3xl border border-[#e4dcdd]">
          <h3 className="text-xl font-bold text-[#171212] mb-8">성별 비율</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {genderData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
