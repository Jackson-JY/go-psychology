/**
 * /api/analyze-sgf
 * 接收 SGF 文件内容，返回棋谱心理分析报告
 */

import { Router, type Request, type Response } from "express";
import { parseSgf } from "../lib/sgf.js";
import { analyzeSgfGame } from "../lib/sgfAnalyzer.js";

const router = Router();

// SGF 文件大小限制：最大 5MB（约 15 万手棋谱）
const MAX_SGF_SIZE = 5 * 1024 * 1024;

router.post("/", (req: Request, res: Response) => {
  try {
    const { sgf, color = "B" } = req.body as { sgf?: string; color?: "B" | "W" };

    if (!sgf || typeof sgf !== "string") {
      res.status(400).json({ error: "请上传有效的 SGF 棋谱内容" });
      return;
    }

    if (sgf.length > MAX_SGF_SIZE) {
      res.status(413).json({ error: "棋谱文件过大，请上传小于 5MB 的文件" });
      return;
    }

    // 解析 SGF
    const parsed = parseSgf(sgf);

    if (parsed.moves.length === 0) {
      res.status(400).json({ error: "无法从 SGF 中解析出有效落子，请检查文件格式" });
      return;
    }

    if (parsed.moves.length < 10) {
      res.status(400).json({ error: "棋谱落子数过少（至少 10 手），无法进行有效分析" });
      return;
    }

    // 执行分析
    const analysis = analyzeSgfGame(parsed);

    // 返回结果
    res.json({
      ...analysis,
      analyzedColor: color,
    });
  } catch (err) {
    console.error("[analyze-sgf] 分析失败:", (err as Error).message);
    res.status(500).json({ error: "棋谱分析失败，请稍后重试" });
  }
});

export default router;
