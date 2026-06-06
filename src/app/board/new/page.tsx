"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("posts").insert({
      title,
      content,
      author_id: user.id,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push("/board");
      router.refresh();
    }
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight text-[#1d1d1f] mb-8">새 게시글</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-sm font-medium text-[#1d1d1f]">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="flex h-10 w-full rounded-lg border border-[#d2d2d7] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-[#1d1d1f]">내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={10}
            className="flex w-full rounded-lg border border-[#d2d2d7] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex gap-3">
          <button
            type="submit"
            className="h-9 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] hover:opacity-90 transition-all duration-200 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] active:translate-y-[1px]"
          >
            저장
          </button>
          <Link
            href="/board"
            className="h-9 px-5 rounded-lg border border-[#d2d2d7] text-sm font-medium inline-flex items-center bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] active:translate-y-[1px] transition-all duration-200"
          >
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
