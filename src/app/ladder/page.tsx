"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

const COLORS = ["#0071e3", "#e34c00", "#34c759", "#af52de", "#ff9500", "#5856d6", "#ff2d55", "#00c7be"];

function generateLadder(players: number) {
  const steps = 8;
  const bridges: { col: number; row: number }[] = [];
  for (let col = 0; col < players - 1; col++) {
    for (let row = 0; row < steps; row++) {
      if (Math.random() < 0.45) {
        bridges.push({ col, row });
        row++;
      }
    }
  }
  return { steps, bridges };
}

function tracePath(players: number, steps: number, bridges: { col: number; row: number }[], start: number) {
  let col = start;
  for (let row = 0; row < steps; row++) {
    if (col > 0 && bridges.some(b => b.col === col - 1 && b.row === row)) {
      col--;
    } else if (col < players - 1 && bridges.some(b => b.col === col && b.row === row)) {
      col++;
    }
  }
  return col;
}

export default function LadderPage() {
  const [names, setNames] = useState<string[]>(["", ""]);
  const [results, setResults] = useState<string[]>(["", ""]);
  const [started, setStarted] = useState(false);
  const [ladder, setLadder] = useState<{ steps: number; bridges: { col: number; row: number }[] } | null>(null);
  const [paths, setPaths] = useState<number[] | null>(null);
  const [revealed, setRevealed] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  function addName() {
    setNames([...names, ""]);
  }

  function updateName(i: number, v: string) {
    const next = [...names];
    next[i] = v;
    setNames(next);
  }

  function removeName(i: number) {
    if (names.length <= 2) return;
    setNames(names.filter((_, idx) => idx !== i));
    setResults(results.filter((_, idx) => idx !== i));
  }

  function updateResult(i: number, v: string) {
    const next = [...results];
    next[i] = v;
    setResults(next);
  }

  function runLadder() {
    const activeNames = names.filter(Boolean);
    if (activeNames.length < 2) return;
    const players = activeNames.length;
    const gen = generateLadder(players);
    const pathResults = Array.from({ length: players }, (_, i) => tracePath(players, gen.steps, gen.bridges, i));
    setLadder(gen);
    setPaths(pathResults);
    setRevealed(false);
    setStarted(true);

    setTimeout(() => setRevealed(true), 1500);
  }

  function reset() {
    setStarted(false);
    setLadder(null);
    setPaths(null);
    setRevealed(false);
  }

  const activeNames = names.filter(Boolean);
  const playerCount = activeNames.length;
  const cellW = 60;
  const cellH = 40;
  const svgW = playerCount * cellW + 40;
  const svgH = (ladder?.steps ?? 8) * cellH + 40;

  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <Link href="/" className="text-sm text-primary hover:underline mb-6 inline-block">← 홈으로</Link>
      <h1 className="text-3xl font-bold tracking-tight text-[#1d1d1f] mb-8">사다리 게임</h1>

      {!started ? (
        <>
          <div className="bg-white rounded-xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)] mb-6">
            <h2 className="font-medium text-[#1d1d1f] mb-3">참가자</h2>
            <div className="space-y-2">
              {names.map((n, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    value={n}
                    onChange={e => updateName(i, e.target.value)}
                    placeholder={`참가자 ${i + 1}`}
                    className="flex-1 h-9 rounded-lg border border-[#d2d2d7] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <input
                    value={results[i] ?? ""}
                    onChange={e => updateResult(i, e.target.value)}
                    placeholder="결과 (선택)"
                    className="w-28 h-9 rounded-lg border border-[#d2d2d7] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <button onClick={() => removeName(i)} className="text-[#86868b] hover:text-red-500 text-lg leading-none">&times;</button>
                </div>
              ))}
            </div>
            <button onClick={addName} className="mt-2 text-sm text-primary hover:underline">+ 추가</button>
          </div>

          <button
            onClick={runLadder}
            disabled={playerCount < 2}
            className="h-10 px-6 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] hover:opacity-90 transition-all duration-200 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] disabled:opacity-40"
          >
            사다리 타기
          </button>
        </>
      ) : (
        <div className="bg-white rounded-xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
          <svg ref={svgRef} viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-full" style={{ height: svgH }}>
            {activeNames.map((name, i) => (
              <line key={`v-${i}`} x1={20 + i * cellW + cellW / 2} y1={20} x2={20 + i * cellW + cellW / 2} y2={svgH - 20} stroke="#1d1d1f" strokeWidth={2} />
            ))}
            {ladder?.bridges.map((b, i) => {
              const y = 20 + b.row * cellH + cellH / 2;
              const x1 = 20 + b.col * cellW + cellW / 2;
              const x2 = 20 + (b.col + 1) * cellW + cellW / 2;
              return <line key={`b-${i}`} x1={x1} y1={y} x2={x2} y2={y} stroke="#1d1d1f" strokeWidth={2} />;
            })}
            {paths && revealed && paths.map((end, i) => {
              const color = COLORS[i % COLORS.length];
              return (
                <g key={`path-${i}`}>
                  <circle cx={20 + i * cellW + cellW / 2} cy={14} r={6} fill={color} />
                  <line x1={20 + i * cellW + cellW / 2} y1={20} x2={20 + end * cellW + cellW / 2} y2={svgH - 20} stroke={color} strokeWidth={3} strokeOpacity={0.5} />
                  <circle cx={20 + end * cellW + cellW / 2} cy={svgH - 14} r={6} fill={color} />
                </g>
              );
            })}
          </svg>

          <div className="flex justify-between mt-2 text-xs text-[#86868b]">
            {activeNames.map((name, i) => (
              <span key={i} className="text-center" style={{ width: cellW }}>{name}</span>
            ))}
          </div>

          {revealed && paths && (
            <div className="flex justify-between mt-4 pt-4 border-t border-[#d2d2d7]/60">
              {activeNames.map((name, i) => {
                const endIdx = paths[i];
                const result = results[endIdx];
                return (
                  <div key={i} className="text-center" style={{ width: cellW }}>
                    {result ? (
                      <span className="text-sm font-medium text-[#1d1d1f]" style={{ color: COLORS[i % COLORS.length] }}>{result}</span>
                    ) : (
                      <span className="text-xs text-[#86868b]">-</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            {!revealed && (
              <p className="text-sm text-[#86868b]">사다리 결과를 계산 중...</p>
            )}
            <button onClick={reset} className="h-9 px-5 rounded-lg border border-[#d2d2d7] text-sm font-medium bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] hover:bg-[#f5f5f7] transition-all">
              다시하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
