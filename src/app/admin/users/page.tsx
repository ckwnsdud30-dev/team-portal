import { requireAdmin } from "@/lib/admin";

export default async function AdminUsersPage() {
  const { supabase } = await requireAdmin();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name, is_admin, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1d1d1f] mb-6">회원 관리</h1>
      <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#d2d2d7]/60 bg-[#f5f5f7]">
              <th className="text-left p-3 font-medium text-[#86868b]">이름</th>
              <th className="text-left p-3 font-medium text-[#86868b]">관리자</th>
              <th className="text-left p-3 font-medium text-[#86868b]">가입일</th>
            </tr>
          </thead>
          <tbody>
            {profiles?.map((p) => (
              <tr key={p.id} className="border-b border-[#d2d2d7]/30 last:border-0">
                <td className="p-3 text-[#1d1d1f]">{p.name ?? "-"}</td>
                <td className="p-3">{p.is_admin ?
                  <span className="text-primary font-medium">관리자</span> :
                  <span className="text-[#86868b]">—</span>}
                </td>
                <td className="p-3 text-[#86868b]">
                  {new Date(p.created_at).toLocaleDateString("ko-KR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
