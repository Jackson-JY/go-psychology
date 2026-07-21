import { Router, type Request, type Response } from "express";
import { mapMovesToProfile } from "../lib/heatmap.js";
import { callDeepSeek, hasDeepSeekKey } from "../lib/deepseek.js";
import { mockComment, mockMbtiComment } from "../lib/mock.js";
import { mapRadarToMbti } from "../lib/mbti.js";
import type { AnalyzeRequest, AnalyzeResponse } from "@shared/types";

const router = Router();

/** 简易频率限制：内存计数，10 req/min/IP */
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

  const { moves } = req.body as AnalyzeRequest;
  if (!Array.isArray(moves) || moves.length === 0) {
    res.status(400).json({ error: "缺少 moves 数据" });
    return;
  }
  if (moves.length > 3) {
    res.status(400).json({ error: "moves 数量异常" });
    return;
  }

  const profile = mapMovesToProfile(moves);

  // 计算 MBTI
  const mbti = mapRadarToMbti(profile.radar);

  let source: "deepseek" | "mock" = "mock";
  let headline: string;
  let comment: string;

  if (hasDeepSeekKey()) {
    try {
      const ai = await callDeepSeek(profile);
      headline = ai.headline;
      comment = ai.comment;
      source = "deepseek";
    } catch (err) {
      console.error("[analyze] DeepSeek 失败，降级 mock:", (err as Error).message);
      const mock = mockComment(profile);
      headline = mock.headline;
      comment = mock.comment;
    }
  } else {
    const mock = mockComment(profile);
    headline = mock.headline;
    comment = mock.comment;
  }

  // 如果 comment 来自 mock，追加 MBTI 专属解读
  if (source === "mock") {
    const mbtiComment = mockMbtiComment(mbti.type);
    comment = `${comment}\n\n【MBTI · ${mbti.type} · ${mbti.title}】\n${mbtiComment}`;
  }

  const response: AnalyzeResponse = {
    radar: profile.radar,
    tags: profile.tags,
    comment,
    headline,
    source,
    mbti,
  };

  res.json(response);
});

export default router;
