import type { AnalyzeRequest, AnalyzeResponse } from "@/lib/types";

export async function analyzeMoves(
  moves: AnalyzeRequest["moves"],
  experienceLevel?: AnalyzeRequest["experienceLevel"],
): Promise<AnalyzeResponse> {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ moves, experienceLevel }),
  });
  if (!res.ok) {
    throw new Error(`分析失败 (HTTP ${res.status})`);
  }
  return (await res.json()) as AnalyzeResponse;
}
