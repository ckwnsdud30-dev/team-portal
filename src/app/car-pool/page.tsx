"use client";

import { useState } from "react";
import Link from "next/link";

export default function CarPoolPage() {
  const [members, setMembers] = useState<string[]>(["", ""]);
  const [cars, setCars] = useState<string[]>(["", ""]);
  const [result, setResult] = useState<{ car: string; members: string[] }[] | null>(null);

  function addItem(list: string[], setter: (v: string[]) => void, empty: string) {
    setter([...list, empty]);
  }

  function updateItem(list: string[], setter: (v: string[]) => void, i: number, v: string) {
    const next = [...list];
    next[i] = v;
    setter(next);
  }

  function removeItem(list: string[], setter: (v: string[]) => void, i: number) {
    if (list.length <= 2) return;
    setter(list.filter((_, idx) => idx !== i));
  }

  function randomShuffle(arr: string[]) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function assignCars() {
    const activeMembers = members.filter(Boolean);
    const activeCars = cars.filter(Boolean);
    if (activeMembers.length === 0 || activeCars.length === 0) return;

    const shuffled = randomShuffle(activeMembers);
    const perCar = Math.ceil(shuffled.length / activeCars.length);
    const assigned: { car: string; members: string[] }[] = activeCars.map((car, i) => ({
      car,
      members: shuffled.slice(i * perCar, (i + 1) * perCar),
    }));
    setResult(assigned);
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <Link href="/" className="text-sm text-primary hover:underline mb-6 inline-block">← 홈으로</Link>
      <h1 className="text-3xl font-bold tracking-tight text-[#1d1d1f] mb-8">차량 배차</h1>

      <div className="bg-white rounded-xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)] mb-6">
        <h2 className="font-medium text-[#1d1d1f] mb-3">팀원</h2>
        <div className="space-y-2">
          {members.map((m, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input value={m} onChange={e => updateItem(members, setMembers, i, e.target.value)}
                placeholder={`팀원 ${i + 1}`}
                className="flex-1 h-9 rounded-lg border border-[#d2d2d7] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <button onClick={() => removeItem(members, setMembers, i)} className="text-[#86868b] hover:text-red-500 text-lg">&times;</button>
            </div>
          ))}
        </div>
        <button onClick={() => addItem(members, setMembers, "")} className="mt-2 text-sm text-primary hover:underline">+ 추가</button>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)] mb-6">
        <h2 className="font-medium text-[#1d1d1f] mb-3">차량</h2>
        <div className="space-y-2">
          {cars.map((c, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input value={c} onChange={e => updateItem(cars, setCars, i, e.target.value)}
                placeholder={`차량 ${i + 1}`}
                className="flex-1 h-9 rounded-lg border border-[#d2d2d7] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <button onClick={() => removeItem(cars, setCars, i)} className="text-[#86868b] hover:text-red-500 text-lg">&times;</button>
            </div>
          ))}
        </div>
        <button onClick={() => addItem(cars, setCars, "")} className="mt-2 text-sm text-primary hover:underline">+ 추가</button>
      </div>

      <button onClick={assignCars}
        className="h-10 px-6 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] hover:opacity-90 transition-all duration-200 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
        배차하기
      </button>

      {result && (
        <div className="mt-8 space-y-4">
          <h2 className="font-medium text-[#1d1d1f]">배차 결과</h2>
          {result.map((r, i) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
              <p className="font-medium text-primary mb-1">{r.car}</p>
              <p className="text-sm text-[#1d1d1f]">{r.members.join(", ") || "(없음)"}</p>
            </div>
          ))}
          <button onClick={() => setResult(null)}
            className="h-9 px-5 rounded-lg border border-[#d2d2d7] text-sm font-medium bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] hover:bg-[#f5f5f7] transition-all mt-2">
            다시하기
          </button>
        </div>
      )}
    </div>
  );
}
