import Link from "next/link";

export default function CafeMenuPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-4">카페 메뉴</h1>
      <p className="text-muted-foreground">준비 중입니다.</p>
      <Link href="/" className="text-sm underline mt-4 inline-block">← 홈으로</Link>
    </div>
  );
}
