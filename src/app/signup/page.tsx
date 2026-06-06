"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error) {
      setError(error.message);
    } else {
      router.push("/login?message=이메일을 확인해주세요");
      router.refresh();
    }
  }

  return (
    <div className="container mx-auto px-4 py-24 max-w-sm">
      <h1 className="text-3xl font-bold tracking-tight text-[#1d1d1f] mb-8 text-center">회원가입</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-sm font-medium text-[#1d1d1f]">이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="flex h-10 w-full rounded-lg border border-[#d2d2d7] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-[#1d1d1f]">이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex h-10 w-full rounded-lg border border-[#d2d2d7] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-[#1d1d1f]">비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="flex h-10 w-full rounded-lg border border-[#d2d2d7] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] hover:opacity-90 transition-all duration-200 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] active:translate-y-[1px]"
        >
          가입하기
        </button>
      </form>
      <p className="text-sm text-center mt-6 text-[#86868b]">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="text-primary hover:underline">로그인</Link>
      </p>
    </div>
  );
}
