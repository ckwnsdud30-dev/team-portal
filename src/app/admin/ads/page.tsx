import { requireAdmin } from "@/lib/admin";
import { saveAdCode } from "./actions";

export default async function AdminAdsPage() {
  const { supabase } = await requireAdmin();

  const { data: ads } = await supabase
    .from("ad_settings")
    .select("*")
    .order("id");

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1d1d1f] mb-2">광고 관리</h1>
      <p className="text-sm text-[#86868b] mb-6">
        Google AdSense 코드를 각 위치에 입력하세요. 광고는 활성화된 위치에만 표시됩니다.
      </p>

      <div className="space-y-4 max-w-xl">
        {ads?.map((ad) => (
          <form key={ad.id} action={saveAdCode} className="bg-white rounded-xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
            <input type="hidden" name="id" value={ad.id} />
            <div className="flex items-center justify-between mb-3">
              <label className="font-medium text-sm text-[#1d1d1f]">{ad.location}</label>
              <label className="flex items-center gap-2 text-sm text-[#86868b]">
                <input
                  type="checkbox"
                  name="enabled"
                  defaultChecked={ad.enabled}
                  className="rounded border-[#d2d2d7]"
                />
                활성화
              </label>
            </div>
            <textarea
              name="code"
              defaultValue={ad.code}
              rows={3}
              className="w-full rounded-lg border border-[#d2d2d7] bg-white px-3 py-2 text-xs font-mono mb-3 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              placeholder="AdSense 코드를 여기에 붙여넣으세요"
            />
            <button
              type="submit"
              className="h-8 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] hover:opacity-90 transition-all duration-200 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] active:translate-y-[1px]"
            >
              저장
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
