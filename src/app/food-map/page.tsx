"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Shuffle, MapPin, Navigation, Search, Plus, Store } from "lucide-react";
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

type KakaoPlace = {
  id: string;
  place_name: string;
  address_name: string;
  road_address_name: string;
  category_name: string;
  phone: string;
  x: string;
  y: string;
};

const CATEGORIES = [
  "한식", "중식", "일식", "양식", "분식",
  "치킨", "피자", "야식", "고기", "회/초밥",
  "찜/탕", "국물", "면류", "샐러드", "도시락",
  "카페/디저트", "패스트푸드", "기타",
];

const RADII = [1, 3, 5, 10];

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function FoodMapPage() {
  const [tab, setTab] = useState<"search" | "saved">("search");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [user, setUser] = useState<any>(null);
  const [myPos, setMyPos] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);

  const [search, setSearch] = useState("");
  const [kakaoResults, setKakaoResults] = useState<KakaoPlace[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimer = useRef<any>(null);

  const [regPlace, setRegPlace] = useState<KakaoPlace | null>(null);
  const [regCategory, setRegCategory] = useState("");
  const [regDesc, setRegDesc] = useState("");

  const [rouletteResult, setRouletteResult] = useState<Restaurant | null>(null);
  const [filter, setFilter] = useState("");
  const [sortMode, setSortMode] = useState<"latest" | "near">("latest");
  const [radius, setRadius] = useState(0);

  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const myMarkerRef = useRef<any>(null);

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

      const list = tab === "saved" ? displayList : [];
      list.forEach(r => {
        if (!r.lat || !r.lng) return;
        const marker = L2.marker([r.lat, r.lng]).addTo(map);
        marker.bindPopup(`<b>${r.name}</b><br/>${r.category}${r.address ? "<br/>" + r.address : ""}`);
        markersRef.current.push(marker);
      });

      if (myPos) {
        if (myMarkerRef.current) myMarkerRef.current.remove();
        myMarkerRef.current = L2.marker([myPos.lat, myPos.lng], { icon: L2.divIcon({ className: "bg-transparent", html: "<div style='width:16px;height:16px;background:#0071e3;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3)'></div>", iconSize: [16, 16], iconAnchor: [8, 8] }) }).addTo(map);
      }

      if (list.length > 0 && list.some(r => r.lat && r.lng)) {
        const bounds = L2.latLngBounds(list.filter(r => r.lat && r.lng).map(r => [r.lat!, r.lng!]));
        if (myPos) bounds.extend([myPos.lat, myPos.lng]);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
    }
    updateMarkers();
  }, [restaurants, myPos, sortMode, filter, radius, tab]);

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

  function doSearch(q: string) {
    setSearch(q);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (q.trim().length < 2) { setKakaoResults([]); return; }
    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      const params = new URLSearchParams({ query: q });
      if (myPos) { params.set("x", String(myPos.lng)); params.set("y", String(myPos.lat)); params.set("radius", "2000"); }
      const res = await fetch(`/api/kakao-search?${params}`);
      const data = await res.json();
      setKakaoResults(data.documents || []);
      setSearching(false);
    }, 400);
  }

  async function registerPlace(place: KakaoPlace) {
    if (!user) return;
    const supabase = createClient();
    const { error } = await supabase.from("restaurants").insert({
      name: place.place_name,
      description: regDesc,
      address: place.road_address_name || place.address_name,
      category: regCategory || "기타",
      lat: parseFloat(place.y),
      lng: parseFloat(place.x),
      added_by: user.id,
    });
    if (!error) {
      setRegPlace(null); setRegCategory(""); setRegDesc("");
      loadRestaurants(supabase);
    }
  }

  function runRoulette() {
    if (displayList.length === 0) return;
    setRouletteResult(null);
    setTimeout(() => setRouletteResult(displayList[Math.floor(Math.random() * displayList.length)]), 300);
  }

  const filtered = filter ? restaurants.filter(r => r.category === filter) : restaurants;
  const radiusFiltered = (myPos && radius > 0)
    ? filtered.filter(r => { if (!r.lat || !r.lng) return false; return haversine(myPos.lat, myPos.lng, r.lat, r.lng) <= radius; })
    : filtered;
  const sortedList = myPos ? [...radiusFiltered].sort((a, b) => {
    const da = a.lat && a.lng ? haversine(myPos.lat, myPos.lng, a.lat, a.lng) : Infinity;
    const db = b.lat && b.lng ? haversine(myPos.lat, myPos.lng, b.lat, b.lng) : Infinity;
    return da - db;
  }) : radiusFiltered;
  const displayList = sortMode === "near" && myPos ? sortedList : radiusFiltered;

  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <Link href="/" className="text-sm text-primary hover:underline mb-6 inline-block">← 홈으로</Link>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-[#1d1d1f]">맛집 지도</h1>
        {!myPos && (
          <button onClick={getMyLocation} disabled={locating}
            className="h-8 px-4 rounded-lg border border-[#d2d2d7] text-xs font-medium bg-white hover:bg-[#f5f5f7] transition-all flex items-center gap-1.5">
            <Navigation className="h-3.5 w-3.5" />{locating ? "..." : "내 위치"}
          </button>
        )}
      </div>

      <div className="h-[250px] rounded-xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.04)] mb-6 bg-[#f5f5f7]" id="food-map" />

      {myPos && <div className="flex items-center gap-1 mb-4 text-xs text-[#86868b]"><Navigation className="h-3 w-3 text-primary" />내 위치 사용 중</div>}

      <div className="flex gap-1 mb-6 bg-[#f5f5f7] rounded-xl p-1">
        <button onClick={() => setTab("search")}
          className={`flex-1 h-9 rounded-lg text-sm font-medium transition-all ${tab === "search" ? "bg-white shadow-sm text-[#1d1d1f]" : "text-[#86868b]"}`}>
          <Search className="h-4 w-4 inline mr-1.5 -mt-0.5" />음식점 검색
        </button>
        <button onClick={() => setTab("saved")}
          className={`flex-1 h-9 rounded-lg text-sm font-medium transition-all ${tab === "saved" ? "bg-white shadow-sm text-[#1d1d1f]" : "text-[#86868b]"}`}>
          <Store className="h-4 w-4 inline mr-1.5 -mt-0.5" />등록한 맛집 ({restaurants.length})
        </button>
      </div>

      {tab === "search" ? (
        <>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#86868b]" />
            <input value={search} onChange={e => doSearch(e.target.value)} placeholder="예: 삼겹살, 강남역 맛집, 치킨..."
              className="w-full h-11 rounded-xl border border-[#d2d2d7] bg-white pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
            {searching && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#86868b]">검색 중...</span>}
          </div>

          {regPlace && (
            <div className="bg-white rounded-xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.08)] mb-4 border border-primary/20">
              <p className="text-xs text-[#86868b] mb-2">선택한 가게: <span className="font-medium text-[#1d1d1f]">{regPlace.place_name}</span></p>
              <input value={regDesc} onChange={e => setRegDesc(e.target.value)} placeholder="설명 (선택)"
                className="w-full h-9 rounded-lg border border-[#d2d2d7] bg-white px-3 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <select value={regCategory} onChange={e => setRegCategory(e.target.value)}
                className="w-full h-9 rounded-lg border border-[#d2d2d7] bg-white px-3 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">카테고리 선택</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="flex gap-2">
                <button onClick={() => registerPlace(regPlace)} disabled={!regCategory}
                  className="h-8 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] hover:opacity-90 transition-all disabled:opacity-40">
                  등록하기
                </button>
                <button onClick={() => setRegPlace(null)}
                  className="h-8 px-4 rounded-lg border border-[#d2d2d7] text-xs font-medium bg-white hover:bg-[#f5f5f7] transition-all">취소</button>
              </div>
            </div>
          )}

          {kakaoResults.length === 0 && search.length >= 2 && !searching && (
            <div className="bg-white rounded-xl p-8 shadow-[0_2px_10px_rgba(0,0,0,0.04)] text-center text-sm text-[#86868b]">
              검색 결과가 없습니다.
            </div>
          )}

          <div className="space-y-2">
            {kakaoResults.map(p => {
              const already = restaurants.some(r => r.name === p.place_name && r.address === (p.road_address_name || p.address_name));
              const dist = myPos ? haversine(myPos.lat, myPos.lng, parseFloat(p.y), parseFloat(p.x)) : null;
              return (
                <div key={p.id} className="bg-white rounded-xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium text-[#1d1d1f]">{p.place_name}</h3>
                        {dist !== null && <span className="text-xs text-[#86868b]">{dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`}</span>}
                      </div>
                      <p className="text-xs text-[#86868b] mt-0.5">{p.road_address_name || p.address_name}</p>
                      {p.category_name && <p className="text-xs text-[#86868b] mt-0.5">{p.category_name.split(">").pop()?.trim()}</p>}
                    </div>
                    {user && !already && (
                      <button onClick={() => { setRegPlace(p); setRegCategory(""); setRegDesc(""); }}
                        className="shrink-0 ml-2 h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] hover:opacity-90 transition-all flex items-center gap-1">
                        <Plus className="h-3 w-3" />등록
                      </button>
                    )}
                    {already && <span className="shrink-0 ml-2 text-xs text-primary">✓ 등록됨</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-3">
            <button onClick={() => setFilter("")}
              className={`h-7 px-3 rounded-lg text-xs font-medium transition-all ${!filter ? "bg-primary text-primary-foreground" : "bg-white border border-[#d2d2d7] text-[#86868b]"}`}>전체</button>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setFilter(c)}
                className={`h-7 px-3 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${filter === c ? "bg-primary text-primary-foreground" : "bg-white border border-[#d2d2d7] text-[#86868b]"}`}>{c}</button>
            ))}
          </div>

          {myPos && (
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-xs text-[#86868b]">반경:</span>
              <button onClick={() => setRadius(0)} className={`h-6 px-3 rounded-lg text-xs font-medium transition-all ${radius === 0 ? "bg-[#1d1d1f] text-white" : "bg-white border border-[#d2d2d7] text-[#86868b]"}`}>전체</button>
              {RADII.map(r => (
                <button key={r} onClick={() => setRadius(r)} className={`h-6 px-3 rounded-lg text-xs font-medium transition-all ${radius === r ? "bg-[#1d1d1f] text-white" : "bg-white border border-[#d2d2d7] text-[#86868b]"}`}>{r}km</button>
              ))}
              <div className="ml-auto flex gap-2">
                <button onClick={() => setSortMode(sortMode === "near" ? "latest" : "near")}
                  className={`h-6 px-3 rounded-lg text-xs font-medium transition-all ${sortMode === "near" ? "bg-[#1d1d1f] text-white" : "bg-white border border-[#d2d2d7] text-[#86868b]"}`}>
                  {sortMode === "near" ? "✓ 가까운순" : "가까운순"}
                </button>
                <button onClick={runRoulette} disabled={displayList.length === 0}
                  className="h-6 px-3 rounded-lg bg-[#1d1d1f] text-white text-xs font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] hover:opacity-90 transition-all flex items-center gap-1 disabled:opacity-40">
                  <Shuffle className="h-3 w-3" />룰렛
                </button>
              </div>
            </div>
          )}

          {!myPos && (
            <div className="flex justify-end gap-2 mb-4">
              <button onClick={runRoulette} disabled={displayList.length === 0}
                className="h-6 px-3 rounded-lg bg-[#1d1d1f] text-white text-xs font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] hover:opacity-90 transition-all flex items-center gap-1 disabled:opacity-40">
                <Shuffle className="h-3 w-3" />룰렛
              </button>
            </div>
          )}

          {rouletteResult && (
            <div className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] mb-6 text-center">
              <p className="text-xs text-[#86868b] mb-1">오늘은 여기 어때요?</p>
              <p className="text-xl font-bold text-primary">{rouletteResult.name}</p>
              <p className="text-sm text-[#86868b]">{rouletteResult.category}{rouletteResult.description && ` · ${rouletteResult.description}`}</p>
            </div>
          )}

          {displayList.length === 0 ? (
            <div className="bg-white rounded-xl p-12 shadow-[0_2px_10px_rgba(0,0,0,0.04)] text-center">
              <p className="text-[#86868b]">등록된 맛집이 없습니다.<br/>검색 탭에서 음식점을 찾아 등록해보세요!</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-[#86868b] mb-3">총 {displayList.length}개</p>
              <div className="space-y-3">
                {displayList.map(r => {
                  const dist = r.lat && r.lng && myPos ? haversine(myPos.lat, myPos.lng, r.lat, r.lng) : null;
                  return (
                    <div key={r.id} className="bg-white rounded-xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium text-[#1d1d1f]">{r.name}</h3>
                            {dist !== null && <span className="text-xs text-[#86868b]">{dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`}</span>}
                          </div>
                          {r.description && <p className="text-sm text-[#86868b] mt-0.5">{r.description}</p>}
                          {r.address && <p className="text-xs text-[#86868b] mt-1 flex items-center gap-1"><MapPin className="h-3 w-3 shrink-0" />{r.address}</p>}
                        </div>
                        <span className="text-xs bg-[#f5f5f7] text-[#86868b] px-2 py-1 rounded-lg shrink-0 ml-2">{r.category}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
