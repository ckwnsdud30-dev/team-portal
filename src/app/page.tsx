import Link from "next/link";
import {
  MapPin,
  Coffee,
  ArrowUpDown,
  Vote,
  Car,
  ClipboardList,
} from "lucide-react";

const features = [
  {
    title: "맛집 지도",
    description: "팀원들이 등록한 우리 팀만의 맛집 지도, GPS 기반 필터링, 룰렛",
    icon: MapPin,
    href: "/food-map",
  },
  {
    title: "카페 메뉴",
    description: "스타벅스, 할리스 등 8개 브랜드 메뉴 비교",
    icon: Coffee,
    href: "/cafe-menu",
  },
  {
    title: "사다리 게임",
    description: "팀원 입력하고 랜덤 결과 확인",
    icon: ArrowUpDown,
    href: "/ladder",
  },
  {
    title: "회식 투표",
    description: "메뉴 후보 등록하고 팀원들이 투표",
    icon: Vote,
    href: "/vote",
  },
  {
    title: "차량 배차",
    description: "팀원/차량 입력하면 랜덤 배차",
    icon: Car,
    href: "/car-pool",
  },
  {
    title: "게시판",
    description: "누구나 읽기 가능, 로그인하면 글쓰기 가능",
    icon: ClipboardList,
    href: "/board",
  },
];

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16 sm:py-24">
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center border border-[#d2d2d7] rounded-xl px-5 py-2 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]">
          <h1 className="text-xl font-semibold tracking-tight text-[#1d1d1f]">
            팀 포털
          </h1>
        </div>
        <p className="mt-2 text-sm text-[#86868b] max-w-md mx-auto">
          우리 팀만의 미니 포털사이트
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
        {features.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className="group bg-white rounded-xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-200 ease-in-out"
          >
            <f.icon className="h-8 w-8 mb-3 text-primary" />
            <h2 className="font-semibold text-[#1d1d1f] mb-1">
              {f.title}
            </h2>
            <p className="text-sm text-[#86868b]">{f.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
