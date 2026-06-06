import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.is_admin ?? false;
  }

  return (
    <header className="border-b border-[#d2d2d7]/60 bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-12 flex items-center justify-between">
        <Link href="/" className="text-base font-semibold text-[#1d1d1f] tracking-tight">
          팀 포털
        </Link>
        <nav className="flex items-center gap-5 text-sm text-[#86868b]">
          {user ? (
            <>
              {isAdmin && (
                <Link href="/admin" className="text-primary font-medium">
                  관리자
                </Link>
              )}
              <span>{user.user_metadata?.name ?? user.email}</span>
              <form action="/auth/signout" method="post">
                <button type="submit" className="hover:text-[#1d1d1f] transition-colors">
                  로그아웃
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-[#1d1d1f] transition-colors">로그인</Link>
              <Link
                href="/signup"
                className="bg-primary text-primary-foreground px-4 h-8 inline-flex items-center rounded-lg text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] hover:opacity-90 transition-all"
              >
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
