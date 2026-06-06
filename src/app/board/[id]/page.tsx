import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (!post) notFound();

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <Link href="/board" className="text-sm text-primary hover:underline mb-6 inline-block">
        ← 목록으로
      </Link>
      <div className="bg-white rounded-xl p-8 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
        <h1 className="text-2xl font-bold text-[#1d1d1f] mb-2">{post.title}</h1>
        <p className="text-sm text-[#86868b] mb-6">
          {new Date(post.created_at).toLocaleDateString("ko-KR")}
        </p>
        <div className="whitespace-pre-wrap text-[#1d1d1f] leading-relaxed">{post.content}</div>
      </div>
    </div>
  );
}
