"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Option = { id: number; name: string; count: number };
type Vote = { id: number; title: string };

export default function VotePage() {
  const [vote, setVote] = useState<Vote | null>(null);
  const [options, setOptions] = useState<Option[]>([]);
  const [userVote, setUserVote] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    loadVote(supabase);
  }, []);

  async function loadVote(supabase: any) {
    const { data: votes } = await supabase.from("votes").select("*").eq("active", true).order("id", { ascending: false }).limit(1);
    if (!votes || votes.length === 0) return;
    const v = votes[0];
    setVote(v);

    const { data: opts } = await supabase.from("vote_options").select("id, name").eq("vote_id", v.id);
    if (!opts) return;

    const { data: responses } = await supabase.from("vote_responses").select("option_id, user_id").eq("vote_id", v.id);
    const counts: Record<number, number> = {};
    responses?.forEach((r: any) => { counts[r.option_id] = (counts[r.option_id] || 0) + 1; });

    setOptions(opts.map((o: any) => ({ ...o, count: counts[o.id] || 0 })));
    setTotal(responses?.length ?? 0);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const my = responses?.find((r: any) => r.user_id === user.id);
      if (my) setUserVote(my.option_id);
    }
  }

  async function vote(optionId: number) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("vote_responses").insert({ vote_id: vote!.id, option_id: optionId, user_id: user.id });
    if (!error) {
      setUserVote(optionId);
      loadVote(supabase);
    }
  }

  const maxCount = Math.max(...options.map(o => o.count), 1);

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <Link href="/" className="text-sm text-primary hover:underline mb-6 inline-block">← 홈으로</Link>
      <h1 className="text-3xl font-bold tracking-tight text-[#1d1d1f] mb-8">회식 투표</h1>

      {!vote ? (
        <div className="bg-white rounded-xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)] text-center text-[#86868b] py-12">
          현재 진행 중인 투표가 없습니다.
        </div>
      ) : (
        <>
          <p className="text-lg font-medium text-[#1d1d1f] mb-6">{vote.title}</p>

          <div className="space-y-3">
            {options.map(opt => {
              const pct = total > 0 ? Math.round((opt.count / total) * 100) : 0;
              const isMine = userVote === opt.id;
              return (
                <div key={opt.id}>
                  <button
                    onClick={() => vote(opt.id)}
                    disabled={!user || userVote !== null}
                    className={`w-full text-left bg-white rounded-xl p-4 shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-all ${isMine ? "ring-2 ring-primary" : ""} ${user && !userVote ? "hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] cursor-pointer" : "cursor-default"}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-[#1d1d1f]">{opt.name} {isMine && "✓"}</span>
                      <span className="text-sm text-[#86868b]">{opt.count}표 ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-[#f5f5f7] rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          <p className="text-sm text-[#86868b] mt-4 text-center">총 {total}명 참여</p>
          {!user && (
            <p className="text-sm text-[#86868b] mt-2 text-center">
              <Link href="/login" className="text-primary hover:underline">로그인</Link>하면 투표할 수 있습니다.
            </p>
          )}
          {user && userVote !== null && (
            <p className="text-sm text-[#86868b] mt-2 text-center">이미 투표하셨습니다.</p>
          )}
        </>
      )}
    </div>
  );
}
