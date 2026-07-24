import type { AnalyzeRequest, AnalyzeResponse, SgfAnalysisResponse } from "@/lib/types";

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

export async function analyzeSgf(
  sgf: string,
  color: "B" | "W" = "B",
): Promise<SgfAnalysisResponse> {
  const res = await fetch("/api/analyze-sgf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sgf, color }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `棋谱分析失败 (HTTP ${res.status})`);
  }
  return (await res.json()) as SgfAnalysisResponse;
}

export async function analyzeImage(
  imageBase64: string,
  color: "B" | "W" = "B",
): Promise<SgfAnalysisResponse> {
  const res = await fetch("/api/analyze-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: imageBase64, color }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `图片分析失败 (HTTP ${res.status})`);
  }
  return (await res.json()) as SgfAnalysisResponse;
}
