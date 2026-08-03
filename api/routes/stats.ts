import { Router, type Request, type Response } from "express";
import { getStats } from "../lib/db.js";

const router = Router();

function getPassword(): string | undefined {
  return process.env.EDITOR_PASSWORD;
}

router.post("/", (req: Request, res: Response) => {
  const expected = getPassword();
  const { password, days: rawDays } = req.body as { password?: string; days?: number };

  if (!expected) {
    res.status(403).json({ error: "未配置管理密码" });
    return;
  }

  if (!password || password !== expected) {
    res.status(401).json({ error: "密码错误" });
    return;
  }

  const days = Math.min(Math.max(rawDays ?? 7, 1), 30);

  try {
    const stats = getStats(days);
    res.json(stats);
  } catch (err) {
    console.error("[stats] 获取统计失败:", (err as Error).message);
    res.status(500).json({ error: "获取统计失败" });
  }
});

export default router;
