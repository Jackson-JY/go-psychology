import type { AnalyzeRequest, AnalyzeResponse, SgfAnalysisResponse, ScenarioConfig, StatsSummary } from "@/lib/types";

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

export async function fetchScenarioConfig(): Promise<ScenarioConfig[]> {
  const res = await fetch("/api/scenarios", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error(`获取题目配置失败 (HTTP ${res.status})`);
  }
  return (await res.json()) as ScenarioConfig[];
}

export async function saveScenarioConfig(config: ScenarioConfig[], password: string): Promise<void> {
  const res = await fetch("/api/scenarios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ config, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `保存题目配置失败 (HTTP ${res.status})`);
  }
}

export async function trackEvent(type: string, payload?: Record<string, unknown>): Promise<void> {
  try {
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, payload }),
    });
  } catch {
    // 事件记录失败不应影响主流程
  }
}

export async function fetchStats(password: string, days = 7): Promise<StatsSummary> {
  const res = await fetch("/api/stats", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password, days }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `获取统计数据失败 (HTTP ${res.status})`);
  }
  return (await res.json()) as StatsSummary;
}
