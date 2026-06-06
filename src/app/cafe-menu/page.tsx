"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

const brands = [
  {
    name: "스타벅스",
    color: "#00704a",
    items: [
      { name: "아메리카노", price: "4,500원" },
      { name: "카페라떼", price: "5,000원" },
      { name: "카푸치노", price: "5,000원" },
      { name: "돌체라떼", price: "5,800원" },
      { name: "자바칩프라푸치노", price: "6,300원" },
      { name: "그린티프라푸치노", price: "6,300원" },
      { name: "딸기딜라이트요거트블렌디드", price: "6,300원" },
    ],
  },
  {
    name: "할리스",
    color: "#b2242a",
    items: [
      { name: "아메리카노", price: "3,800원" },
      { name: "카페라떼", price: "4,300원" },
      { name: "바닐라라떼", price: "4,600원" },
      { name: "카라멜마끼아또", price: "4,600원" },
      { name: "할리치노", price: "5,200원" },
    ],
  },
  {
    name: "투썸플레이스",
    color: "#2c2c2c",
    items: [
      { name: "아메리카노", price: "4,500원" },
      { name: "카페라떼", price: "5,000원" },
      { name: "바닐라라떼", price: "5,500원" },
      { name: "카라멜마끼아또", price: "5,500원" },
      { name: "스트로베리프레셔", price: "5,500원" },
      { name: "아이스자바", price: "5,800원" },
    ],
  },
  {
    name: "이디야",
    color: "#1a3a5c",
    items: [
      { name: "아메리카노", price: "2,500원" },
      { name: "카페라떼", price: "3,000원" },
      { name: "바닐라라떼", price: "3,500원" },
      { name: "카라멜마끼아또", price: "3,500원" },
      { name: "자바칩프라푸치노", price: "4,000원" },
    ],
  },
  {
    name: "메가커피",
    color: "#f5a623",
    items: [
      { name: "아메리카노", price: "2,000원" },
      { name: "카페라떼", price: "2,500원" },
      { name: "바닐라라떼", price: "2,800원" },
      { name: "카라멜마끼아또", price: "2,800원" },
      { name: "딸기라떼", price: "3,200원" },
    ],
  },
  {
    name: "컴포즈커피",
    color: "#8b4513",
    items: [
      { name: "아메리카노", price: "1,500원" },
      { name: "카페라떼", price: "2,000원" },
      { name: "바닐라라떼", price: "2,500원" },
      { name: "카라멜마끼아또", price: "2,500원" },
      { name: "초코라떼", price: "2,500원" },
    ],
  },
  {
    name: "빽다방",
    color: "#c0392b",
    items: [
      { name: "아메리카노", price: "1,500원" },
      { name: "카페라떼", price: "2,500원" },
      { name: "바닐라라떼", price: "2,800원" },
      { name: "카라멜마끼아또", price: "2,800원" },
      { name: "달달커피", price: "1,500원" },
      { name: "민트초코라떼", price: "3,000원" },
    ],
  },
  {
    name: "더벤티",
    color: "#003366",
    items: [
      { name: "아메리카노", price: "1,500원" },
      { name: "카페라떼", price: "2,000원" },
      { name: "바닐라라떼", price: "2,500원" },
      { name: "카라멜마끼아또", price: "2,500원" },
      { name: "딸기바나나주스", price: "2,500원" },
    ],
  },
];

export default function CafeMenuPage() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <Link href="/" className="text-sm text-primary hover:underline mb-6 inline-block">← 홈으로</Link>
      <h1 className="text-3xl font-bold tracking-tight text-[#1d1d1f] mb-2">카페 메뉴</h1>
      <p className="text-sm text-[#86868b] mb-8">8개 브랜드 대표 메뉴와 가격 비교</p>

      <div className="flex flex-wrap gap-2 mb-8">
        <button onClick={() => setSelected(null)}
          className={`h-8 px-4 rounded-lg text-xs font-medium transition-all ${!selected ? "bg-primary text-primary-foreground" : "bg-white border border-[#d2d2d7] text-[#86868b] hover:bg-[#f5f5f7]"}`}>
          전체
        </button>
        {brands.map(b => (
          <button key={b.name} onClick={() => setSelected(b.name)}
            className={`h-8 px-4 rounded-lg text-xs font-medium transition-all ${selected === b.name ? "bg-primary text-primary-foreground" : "bg-white border border-[#d2d2d7] text-[#86868b] hover:bg-[#f5f5f7]"}`}>
            {b.name}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {(selected ? brands.filter(b => b.name === selected) : brands).map(brand => (
          <div key={brand.name} className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="px-5 py-3" style={{ backgroundColor: brand.color }}>
              <h2 className="font-semibold text-white text-sm">{brand.name}</h2>
            </div>
            <div className="p-4 space-y-2">
              {brand.items.map(item => (
                <div key={item.name} className="flex justify-between items-center text-sm">
                  <span className="text-[#1d1d1f]">{item.name}</span>
                  <span className="text-[#86868b] text-xs">{item.price}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-[#86868b] text-center mt-8">
        가격은 브랜드 공식 홈페이지 기준이며 매장에 따라 다를 수 있습니다.
      </p>
    </div>
  );
}
