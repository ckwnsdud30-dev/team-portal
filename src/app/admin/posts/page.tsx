import { requireAdmin } from "@/lib/admin";
import { deletePost } from "./actions";

export default async function AdminPostsPage() {
  const { supabase } = await requireAdmin();

  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, author_id, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1d1d1f] mb-6">게시글 관리</h1>
      <div className="bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.04)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#d2d2d7]/60 bg-[#f5f5f7]">
              <th className="text-left p-3 font-medium text-[#86868b]">제목</th>
              <th className="text-left p-3 font-medium text-[#86868b]">작성일</th>
              <th className="text-right p-3 font-medium text-[#86868b]">관리</th>
            </tr>
          </thead>
          <tbody>
            {posts?.map((post) => (
              <tr key={post.id} className="border-b border-[#d2d2d7]/30 last:border-0">
                <td className="p-3 text-[#1d1d1f]">{post.title}</td>
                <td className="p-3 text-[#86868b]">
                  {new Date(post.created_at).toLocaleDateString("ko-KR")}
                </td>
                <td className="p-3 text-right">
                  <form action={deletePost}>
                    <input type="hidden" name="id" value={post.id} />
                    <button
                      type="submit"
                      className="text-sm text-red-500 hover:text-red-600 transition-colors"
                    >
                      삭제
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
