"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Shuffle, MapPin, Navigation, Crosshair } from "lucide-react";
import "leaflet/dist/leaflet.css";

type Restaurant = {
  id: number;
  name: string;
  description: string;
  address: string;
  category: string;
  lat: number | null;
  lng: number | null;
};

const CATEGORIES = ["한식", "중식", "일식", "양식", "분식", "야식", "카페/디저트", "기타"];

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function geocodeAddress(address: string) {
  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
  const data = await res.json();
  if (data.length > 0) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  return null;
}

export default function FoodMapPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [user, setUser] = useState<any>(null);
  const [myPos, setMyPos] = useState<{ lat: number; lng: number } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [rouletteResult, setRouletteResult] = useState<Restaurant | null>(null);
  const [filter, setFilter] = useState("");
  const [sortMode, setSortMode] = useState<"latest" | "near">("latest");
  const [locating, setLocating] = useState(false);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const myMarkerRef = useRef<any>(null);

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [addr, setAddr] = useState("");
  const [category, setCategory] = useState("기타");
  const [regLat, setRegLat] = useState<number | null>(null);
  const [regLng, setRegLng] = useState<number | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    loadRestaurants(supabase);
    getMyLocation();
  }, []);

  useEffect(() => {
    async function initMap() {
      const L2: any = await import("leaflet").then(m => m.default || m);
      if (mapRef.current) return;

      mapRef.current = L2.map("food-map", { zoomControl: true }).setView([37.5665, 126.978], 12);
      L2.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(mapRef.current);
    }
    initMap();
  }, []);

  useEffect(() => {
    async function updateMarkers() {
      const L2: any = await import("leaflet").then(m => m.default || m);
      const map = mapRef.current;
      if (!map) return;

      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      const visible = sortMode === "near" && myPos ? sortedList : displayList;
      visible.forEach(r => {
        if (!r.lat || !r.lng) return;
        const marker = L2.marker([r.lat, r.lng]).addTo(map);
        marker.bindPopup(`<b>${r.name}</b><br/>${r.category}${r.address ? "<br/>" + r.address : ""}`);
        markersRef.current.push(marker);
      });

      if (myPos) {
        if (myMarkerRef.current) myMarkerRef.current.remove();
        myMarkerRef.current = L2.marker([myPos.lat, myPos.lng], { icon: L2.divIcon({ className: "bg-transparent", html: "<div style='width:16px;height:16px;background:#0071e3;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3)'></div>", iconSize: [16, 16], iconAnchor: [8, 8] }) }).addTo(map);
      }

      if (visible.length > 0 && visible.some(r => r.lat && r.lng)) {
        const bounds = L2.latLngBounds(visible.filter(r => r.lat && r.lng).map(r => [r.lat!, r.lng!]));
        if (myPos) bounds.extend([myPos.lat, myPos.lng]);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
    }
    updateMarkers();
  }, [restaurants, myPos, sortMode, filter]);

  async function loadRestaurants(supabase: any) {
    const { data } = await supabase.from("restaurants").select("*").order("created_at", { ascending: false });
    if (data) setRestaurants(data);
  }

  function getMyLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => { setMyPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocating(false); },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  async function geocodeAddr() {
    if (!addr.trim()) return;
    const result = await geocodeAddress(addr);
    if (result) { setRegLat(result.lat); setRegLng(result.lng); }
  }

  function useMyLocForReg() {
    if (!myPos) return;
    setRegLat(myPos.lat);
    setRegLng(myPos.lng);
    setAddr("내 위치");
  }

  async function addRestaurant(e: React.FormEvent) {
    e.preventDefault();
    let lat = regLat;
    let lng = regLng;
    if (!lat && !lng && addr.trim()) {
      const geocoded = await geocodeAddress(addr);
      if (geocoded) { lat = geocoded.lat; lng = geocoded.lng; }
    }
    const supabase = createClient();
    const { error } = await supabase.from("restaurants").insert({
      name, description: desc, address: addr, category, lat, lng, added_by: user.id,
    });
    if (!error) {
      setName(""); setDesc(""); setAddr(""); setCategory("기타"); setRegLat(null); setRegLng(null);
      setShowForm(false);
      loadRestaurants(supabase);
    }
  }

  function runRoulette() {
    const list = sortMode === "near" && myPos ? sortedList : filtered;
    if (list.length === 0) return;
    setRouletteResult(null);
    setTimeout(() => setRouletteResult(list[Math.floor(Math.random() * list.length)]), 300);
  }

  const filtered = filter ? restaurants.filter(r => r.category === filter) : restaurants;
  const sortedList = myPos
    ? [...filtered].sort((a, b) => {
        const da = a.lat && a.lng ? haversine(myPos.lat, myPos.lng, a.lat, a.lng) : Infinity;
        const db = b.lat && b.lng ? haversine(myPos.lat, myPos.lng, b.lat, b.lng) : Infinity;
        return da - db;
      })
    : filtered;
  const displayList = sortMode === "near" && myPos ? sortedList : filtered;

  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <Link href="/" className="text-sm text-primary hover:underline mb-6 inline-block">← 홈으로</Link>

      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1d1d1f]">맛집 지도</h1>
          <p className="text-sm text-[#86868b] mt-1">팀원들이 등록한 우리 팀만의 맛집</p>
        </div>
        <div className="flex gap-2">
          {user && (
            <button onClick={() => setShowForm(!showForm)}
              className="h-9 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] hover:opacity-90 transition-all">
              {showForm ? "취소" : "맛집 등록"}
            </button>
          )}
        </div>
      </div>

      <div className="h-[300px] rounded-xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.04)] mb-6 bg-[#f5f5f7]" id="food-map" />

      {!myPos && (
        <button onClick={getMyLocation} disabled={locating}
          className="mb-4 h-8 px-4 rounded-lg border border-[#d2d2d7] text-xs font-medium bg-white hover:bg-[#f5f5f7] transition-all flex items-center gap-1.5">
          <Navigation className="h-3.5 w-3.5" />
          {locating ? "위치 확인 중..." : "내 위치 사용하기"}
        </button>
      )}

      {showForm && (
        <form onSubmit={addRestaurant} className="bg-white rounded-xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)] mb-6 space-y-4">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="가게 이름" required
            className="w-full h-10 rounded-lg border border-[#d2d2d7] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="설명 (예: 여기 삼겹살 맛집!)"
            className="w-full h-10 rounded-lg border border-[#d2d2d7] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <div className="flex gap-2">
            <input value={addr} onChange={e => { setAddr(e.target.value); setRegLat(null); setRegLng(null); }} placeholder="주소 (예: 서울시 강남구 역삼동)"
              className="flex-1 h-10 rounded-lg border border-[#d2d2d7] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <button type="button" onClick={geocodeAddr}
              className="h-10 px-4 rounded-lg border border-[#d2d2d7] text-xs font-medium bg-white hover:bg-[#f5f5f7] transition-all">주소 찾기</button>
            {myPos && (
              <button type="button" onClick={useMyLocForReg}
                className="h-10 px-4 rounded-lg border border-[#d2d2d7] text-xs font-medium bg-white hover:bg-[#f5f5f7] transition-all flex items-center gap-1">
                <Crosshair className="h-3 w-3" />내 위치
              </button>
            )}
          </div>
          {(regLat && regLng) ? <p className="text-xs text-primary">✓ 위치 확인됨</p> : addr && <p className="text-xs text-[#86868b]">주소를 입력 후 &quot;주소 찾기&quot; 클릭</p>}
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

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilter("")}
            className={`h-7 px-3 rounded-lg text-xs font-medium transition-all ${!filter ? "bg-primary text-primary-foreground" : "bg-white border border-[#d2d2d7] text-[#86868b]"}`}>전체</button>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setFilter(c)}
              className={`h-7 px-3 rounded-lg text-xs font-medium transition-all ${filter === c ? "bg-primary text-primary-foreground" : "bg-white border border-[#d2d2d7] text-[#86868b]"}`}>{c}</button>
          ))}
        </div>
        <div className="flex gap-2 ml-auto">
          {myPos && (
            <button onClick={() => setSortMode(sortMode === "near" ? "latest" : "near")}
              className={`h-7 px-3 rounded-lg text-xs font-medium transition-all ${sortMode === "near" ? "bg-[#1d1d1f] text-white" : "bg-white border border-[#d2d2d7] text-[#86868b]"}`}>
              {sortMode === "near" ? "✓ 가까운순" : "가까운순"}
            </button>
          )}
          <button onClick={runRoulette} disabled={displayList.length === 0}
            className="h-7 px-3 rounded-lg bg-[#1d1d1f] text-white text-xs font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] hover:opacity-90 transition-all flex items-center gap-1 disabled:opacity-40">
            <Shuffle className="h-3 w-3" />룰렛
          </button>
        </div>
      </div>

      {rouletteResult && (
        <div className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] mb-6 text-center">
          <p className="text-xs text-[#86868b] mb-1">오늘은 여기 어때요?</p>
          <p className="text-xl font-bold text-primary">{rouletteResult.name}</p>
          <p className="text-sm text-[#86868b]">{rouletteResult.category}{rouletteResult.description && ` · ${rouletteResult.description}`}</p>
        </div>
      )}

      {displayList.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-[0_2px_10px_rgba(0,0,0,0.04)] text-center">
          <p className="text-[#86868b]">등록된 맛집이 없습니다.</p>
          {user ? <p className="text-sm text-[#86868b] mt-1">&quot;맛집 등록&quot; 버튼으로 추가해보세요!</p> :
            <p className="text-sm text-[#86868b] mt-1"><Link href="/login" className="text-primary hover:underline">로그인</Link>하면 맛집을 등록할 수 있습니다.</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {displayList.map(r => {
            const dist = r.lat && r.lng && myPos ? haversine(myPos.lat, myPos.lng, r.lat, r.lng) : null;
            return (
              <div key={r.id} className="bg-white rounded-xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-[#1d1d1f]">{r.name}</h3>
                      {dist !== null && <span className="text-xs text-[#86868b]">{dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`}</span>}
                    </div>
                    {r.description && <p className="text-sm text-[#86868b] mt-0.5">{r.description}</p>}
                    {r.address && <p className="text-xs text-[#86868b] mt-1 flex items-center gap-1"><MapPin className="h-3 w-3" />{r.address}</p>}
                  </div>
                  <span className="text-xs bg-[#f5f5f7] text-[#86868b] px-2 py-1 rounded-lg shrink-0 ml-2">{r.category}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
