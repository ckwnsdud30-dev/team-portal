import { requireAdmin } from "@/lib/admin";

export default async function AdminDashboard() {
  const { supabase } = await requireAdmin();

  const { count: userCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: postCount } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true });

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1d1d1f] mb-6">대시보드</h1>
      <div className="grid gap-4 sm:grid-cols-2 max-w-md">
        <div className="bg-white rounded-xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
          <p className="text-sm text-[#86868b]">회원 수</p>
          <p className="text-3xl font-bold text-[#1d1d1f]">{userCount ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
          <p className="text-sm text-[#86868b]">게시글 수</p>
          <p className="text-3xl font-bold text-[#1d1d1f]">{postCount ?? 0}</p>
        </div>
      </div>
    </div>
  );
}
