/**
 * /api/analyze-image
 * 接收棋盘图片（base64），通过视觉 API 转换为 SGF，返回心理分析报告
 */

import { Router, type Request, type Response } from "express";
import {
  analyzeBoardImage,
  hasVisionKey,
  mockAnalyzeBoardImage,
  type VisionApiResponse,
} from "../lib/vision.js";
import { parseSgf } from "../lib/sgf.js";
import { analyzeSgfGame } from "../lib/sgfAnalyzer.js";

const router = Router();

interface ImageRequestBody {
  image: string; // base64 data URL
  color?: "B" | "W";
}

router.post("/", async (req: Request, res: Response) => {
  try {
    const { image, color = "B" } = req.body as ImageRequestBody;

    if (!image || typeof image !== "string") {
      res.status(400).json({ error: "请上传有效的图片" });
      return;
    }

    if (!image.startsWith("data:image/")) {
      res.status(400).json({ error: "图片格式不正确" });
      return;
    }

    // 检查图片大小（base64 解码后）
    const base64Data = image.split(",")[1] || "";
    const sizeInBytes = Buffer.byteLength(base64Data, "base64");
    if (sizeInBytes > 5 * 1024 * 1024) {
      res.status(413).json({ error: "图片过大，请上传小于 5MB 的图片" });
      return;
    }

    // 调用视觉 API 或 Mock
    let visionResult: VisionApiResponse;
    if (hasVisionKey()) {
      visionResult = await analyzeBoardImage(image);
    } else {
      visionResult = mockAnalyzeBoardImage();
    }

    // 构建 SGF
    let sgf: string;
    if (visionResult.sgf && visionResult.sgf.includes("SZ[")) {
      sgf = normalizeSgf(visionResult.sgf);
    } else {
      sgf = buildSgfFromVisionResult(visionResult);
    }

    // 解析 SGF
    const parsed = parseSgf(sgf);

    if (parsed.moves.length === 0) {
      res
        .status(400)
        .json({ error: "无法从图片中识别出有效棋局，请尝试上传 SGF 文件" });
      return;
    }

    if (parsed.moves.length < 10) {
      res.status(400).json({
        error: `识别出的落子数过少（仅 ${parsed.moves.length} 手，至少 10 手），请尝试上传更清晰的图片或直接上传 SGF 文件`,
      });
      return;
    }

    // 执行分析
    const analysis = analyzeSgfGame(parsed);

    res.json({
      ...analysis,
      analyzedColor: color,
      imageNotes: visionResult.notes,
      hasMoveNumbers: visionResult.hasMoveNumbers,
      source: hasVisionKey() ? "vision" : "mock",
    });
  } catch (err) {
    console.error("[analyze-image] 分析失败:", (err as Error).message);
    res.status(500).json({ error: "图片分析失败，请稍后重试" });
  }
});

/** 将 SGF 中的 AB[]/AW[] 设置属性转换为常规落子序列，确保 parseSgf 能识别 */
function normalizeSgf(sgf: string): string {
  return sgf
    .replace(/AB((?:\[[a-z]{2}\])+)/gi, (_, coords: string) => {
      const matches = coords.match(/\[[a-z]{2}\]/gi) || [];
      return matches.map((c: string) => `;B${c}`).join("");
    })
    .replace(/AW((?:\[[a-z]{2}\])+)/gi, (_, coords: string) => {
      const matches = coords.match(/\[[a-z]{2}\]/gi) || [];
      return matches.map((c: string) => `;W${c}`).join("");
    });
}

/** 从视觉识别结果构建 SGF 字符串 */
function buildSgfFromVisionResult(result: VisionApiResponse): string {
  const { boardSize, moves, blackStones, whiteStones } = result;

  if (moves.length > 0) {
    let sgf = `(;SZ[${boardSize}]KM[7.5]`;
    for (const m of moves) {
      sgf += `;${m.color}[${m.coord}]`;
    }
    sgf += ")";
    return sgf;
  }

  // 无序列时，将黑白子交替生成为伪序列
  let sgf = `(;SZ[${boardSize}]KM[7.5]`;
  const maxLen = Math.max(blackStones.length, whiteStones.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < blackStones.length) sgf += `;B[${blackStones[i]}]`;
    if (i < whiteStones.length) sgf += `;W[${whiteStones[i]}]`;
  }
  sgf += ")";
  return sgf;
}

export default router;
