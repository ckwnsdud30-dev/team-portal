import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("query");
  const x = req.nextUrl.searchParams.get("x") || "";
  const y = req.nextUrl.searchParams.get("y") || "";
  const radius = req.nextUrl.searchParams.get("radius") || "3000";
  const page = req.nextUrl.searchParams.get("page") || "1";
  const sort = req.nextUrl.searchParams.get("sort") || "distance";
  const apiKey = process.env.KAKAO_REST_API_KEY;

  if (!query) return NextResponse.json({ error: "query required" }, { status: 400 });
  if (!apiKey) return NextResponse.json({ error: "Kakao API key not configured" }, { status: 500 });

  const params = new URLSearchParams({ query, page, size: "15", sort });
  if (x && y) { params.set("x", x); params.set("y", y); params.set("radius", radius); }

  const res = await fetch(`https://dapi.kakao.com/v2/local/search/keyword.json?${params}`, {
    headers: { Authorization: `KakaoAK ${apiKey}` },
  });
  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json({ error: data.message || "Kakao API error", meta: data }, { status: res.status });
  }

  return NextResponse.json(data);
}
