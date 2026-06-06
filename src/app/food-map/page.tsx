"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Shuffle } from "lucide-react";

type Restaurant = {
  id: number;
  name: string;
  description: string;
  address: string;
  category: string;
};

const CATEGORIES = ["한식", "중식", "일식", "양식", "분식", "야식", "카페/디저트", "기타"];

export default function FoodMapPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [user, setUser] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [rouletteResult, setRouletteResult] = useState<Restaurant | null>(null);
  const [filter, setFilter] = useState("");

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [addr, setAddr] = useState("");
  const [category, setCategory] = useState("기타");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    loadRestaurants(supabase);
  }, []);

  async function loadRestaurants(supabase: any) {
    const { data } = await supabase.from("restaurants").select("*").order("created_at", { ascending: false });
    if (data) setRestaurants(data);
  }

  async function addRestaurant(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    const { error } = await supabase.from("restaurants").insert({
      name, description: desc, address: addr, category, added_by: user.id,
    });
    if (!error) {
      setName(""); setDesc(""); setAddr(""); setCategory("기타");
      setShowForm(false);
      loadRestaurants(supabase);
    }
  }

  function runRoulette() {
    const filtered = filter ? restaurants.filter(r => r.category === filter) : restaurants;
    if (filtered.length === 0) return;
    setRouletteResult(null);
    setTimeout(() => {
      const pick = filtered[Math.floor(Math.random() * filtered.length)];
      setRouletteResult(pick);
    }, 300);
  }

  const filtered = filter ? restaurants.filter(r => r.category === filter) : restaurants;

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <Link href="/" className="text-sm text-primary hover:underline mb-6 inline-block">← 홈으로</Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1d1d1f]">맛집 지도</h1>
          <p className="text-sm text-[#86868b] mt-1">팀원들이 등록한 우리 팀만의 맛집 리스트</p>
        </div>
        {user && (
          <button onClick={() => setShowForm(!showForm)}
            className="h-9 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] hover:opacity-90 transition-all">
            {showForm ? "취소" : "맛집 등록"}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={addRestaurant} className="bg-white rounded-xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)] mb-6 space-y-4">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="가게 이름" required
            className="w-full h-10 rounded-lg border border-[#d2d2d7] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="설명 (예: 여기 삼겹살 맛집이에요!)"
            className="w-full h-10 rounded-lg border border-[#d2d2d7] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <input value={addr} onChange={e => setAddr(e.target.value)} placeholder="주소 (선택)"
            className="w-full h-10 rounded-lg border border-[#d2d2d7] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="w-full h-10 rounded-lg border border-[#d2d2d7] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button type="submit"
            className="h-9 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] hover:opacity-90 transition-all">
            등록하기
          </button>
        </form>
      )}

      <div className="flex items-center gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilter("")}
            className={`h-7 px-3 rounded-lg text-xs font-medium transition-all ${!filter ? "bg-primary text-primary-foreground" : "bg-white border border-[#d2d2d7] text-[#86868b]"}`}>
            전체
          </button>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setFilter(c)}
              className={`h-7 px-3 rounded-lg text-xs font-medium transition-all ${filter === c ? "bg-primary text-primary-foreground" : "bg-white border border-[#d2d2d7] text-[#86868b]"}`}>
              {c}
            </button>
          ))}
        </div>
        <button onClick={runRoulette} disabled={filtered.length === 0}
          className="h-9 px-5 rounded-lg bg-[#1d1d1f] text-white text-sm font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-40 ml-auto">
          <Shuffle className="h-4 w-4" />
          룰렛
        </button>
      </div>

      {rouletteResult && (
        <div className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] mb-6 text-center animate-in slide-in-from-top-2">
          <p className="text-xs text-[#86868b] mb-1">오늘은 여기 어때요?</p>
          <p className="text-xl font-bold text-primary">{rouletteResult.name}</p>
          <p className="text-sm text-[#86868b]">{rouletteResult.category} · {rouletteResult.description}</p>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-[0_2px_10px_rgba(0,0,0,0.04)] text-center">
          <p className="text-[#86868b]">등록된 맛집이 없습니다.</p>
          {user ? <p className="text-sm text-[#86868b] mt-1">위에 있는 &quot;맛집 등록&quot; 버튼으로 추가해보세요!</p> :
            <p className="text-sm text-[#86868b] mt-1"><Link href="/login" className="text-primary hover:underline">로그인</Link>하면 맛집을 등록할 수 있습니다.</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r.id} className="bg-white rounded-xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium text-[#1d1d1f]">{r.name}</h3>
                  {r.description && <p className="text-sm text-[#86868b] mt-0.5">{r.description}</p>}
                  {r.address && <p className="text-xs text-[#86868b] mt-1">{r.address}</p>}
                </div>
                <span className="text-xs bg-[#f5f5f7] text-[#86868b] px-2 py-1 rounded-lg">{r.category}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
