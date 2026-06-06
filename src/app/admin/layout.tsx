import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";

const adminMenu = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/users", label: "회원 관리" },
  { href: "/admin/posts", label: "게시글 관리" },
  { href: "/admin/ads", label: "광고 관리" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireAdmin();
  } catch {
    redirect("/login");
  }

  return (
    <div className="flex flex-1">
      <aside className="w-56 border-r border-[#d2d2d7]/60 shrink-0 p-5 space-y-1 bg-white">
        <h2 className="font-semibold text-xs text-[#86868b] uppercase tracking-wider mb-4 px-3">관리자</h2>
        {adminMenu.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </aside>
      <div className="flex-1 p-8 bg-[#f5f5f7]">{children}</div>
    </div>
  );
}
