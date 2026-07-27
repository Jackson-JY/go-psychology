import { Router, type Request, type Response } from "express";
import { mapMovesToProfile } from "../lib/heatmap.js";
import { callDeepSeek, hasDeepSeekKey } from "../lib/deepseek.js";
import { mockComment } from "../lib/mock.js";
import { mapRadarToMbti } from "../lib/mbti.js";
import { mapRadarToBigFive } from "../lib/bigFive.js";
import { mapRadarToInvestment } from "../lib/investment.js";
import { mapRadarToCareer } from "../lib/career.js";
import { generateHeatmap } from "../lib/heatmapData.js";
import { generateDeepReport } from "../lib/deepReport.js";
import { matchArchetype } from "@shared/archetypes.js";
import type { AnalyzeRequest, AnalyzeResponse } from "@shared/types";

const router = Router();

const rateBuckets = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(ip);
  if (!bucket || bucket.resetAt < now) {
    rateBuckets.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  bucket.count += 1;
  return bucket.count > RATE_LIMIT;
}

router.post("/", async (req: Request, res: Response) => {
  const ip = (req.headers["x-forwarded-for"] as string) || req.ip || "unknown";
  if (rateLimited(ip)) {
    res.status(429).json({ error: "请求过于频繁，请稍后再试" });
    return;
  }

  const { moves, experienceLevel } = req.body as AnalyzeRequest;
  if (!Array.isArray(moves) || moves.length === 0) {
    res.status(400).json({ error: "缺少 moves 数据" });
    return;
  }
  if (moves.length > 4) {
    res.status(400).json({ error: "moves 数量异常" });
    return;
  }

  // 如果 skilled 级别使用了 13x13 棋盘，将坐标归一化回 9x9 基准，便于热区匹配
  const sourceBoardSize = experienceLevel === "skilled" ? 13 : 9;
  const normalizedMoves = sourceBoardSize === 9
    ? moves
    : moves.map((m) => ({
        ...m,
        x: Math.round(m.x * 8 / (sourceBoardSize - 1)),
        y: Math.round(m.y * 8 / (sourceBoardSize - 1)),
      }));

  const profile = mapMovesToProfile(normalizedMoves, experienceLevel);

  const mbti = mapRadarToMbti(profile.radar);
  const bigFive = mapRadarToBigFive(profile.radar);
  const investment = mapRadarToInvestment(profile.radar);
  const career = mapRadarToCareer(profile.radar);
  const heatmap = generateHeatmap(moves);
  const deepReport = generateDeepReport(profile.radar, experienceLevel);

  // 统一使用 matchArchetype 匹配原型，确保 headline 与前端原型卡片一致
  const archetype = matchArchetype(profile.radar);

  let source: "deepseek" | "mock" = "mock";
  let headline: string;
  let comment: string;

  if (hasDeepSeekKey()) {
    try {
      const ai = await callDeepSeek({ ...profile, experienceLevel });
      // DeepSeek 生成的 headline 可能与 matchArchetype 不一致，
      // 统一用 archetype.name 作为 headline，保留 AI 的 comment
      headline = archetype.name;
      comment = ai.comment;
      source = "deepseek";
    } catch (err) {
      console.error("[analyze] DeepSeek 失败，降级 mock:", (err as Error).message);
      const mock = mockComment({ ...profile, experienceLevel, archetypeName: archetype.name });
      headline = archetype.name;
      comment = mock.comment;
    }
  } else {
    const mock = mockComment({ ...profile, experienceLevel, archetypeName: archetype.name });
    headline = archetype.name;
    comment = mock.comment;
  }



  const response: AnalyzeResponse = {
    radar: profile.radar,
    tags: profile.tags,
    comment,
    headline,
    source,
    mbti,
    bigFive,
    investment,
    career,
    heatmap,
    deepReport,
  };

  res.json(response);
});

export default router;
