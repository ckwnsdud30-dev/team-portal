import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Plus } from "lucide-react";

export default async function BoardPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#1d1d1f]">게시판</h1>
        {user && (
          <Link
            href="/board/new"
            className="inline-flex items-center gap-1 h-9 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] hover:opacity-90 transition-all duration-200 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] active:translate-y-[1px]"
          >
            <Plus className="h-4 w-4" />
            글쓰기
          </Link>
        )}
      </div>

      {!posts || posts.length === 0 ? (
        <p className="text-[#86868b] text-center py-16">
          아직 게시글이 없습니다.
          {!user && " 로그인하면 첫 글을 작성할 수 있습니다."}
        </p>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/board/${post.id}`}
              className="block bg-white rounded-xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-200"
            >
              <h2 className="font-medium text-[#1d1d1f]">{post.title}</h2>
              <p className="text-sm text-[#86868b] mt-1">
                {new Date(post.created_at).toLocaleDateString("ko-KR")}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
