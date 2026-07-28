import { Router, type Request, type Response } from "express";
import { logEvent } from "../lib/db.js";

const router = Router();

const ALLOWED_TYPES = new Set(["test_start", "poster_generate", "poster_download"]);

router.post("/", (req: Request, res: Response) => {
  const { type, payload } = req.body as { type?: string; payload?: Record<string, unknown> };

  if (!type || !ALLOWED_TYPES.has(type)) {
    res.status(400).json({ error: "未知事件类型" });
    return;
  }

  try {
    logEvent({
      type,
      payload,
      ip: (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() || req.ip || "",
      userAgent: req.headers["user-agent"] as string | undefined,
    });
    res.json({ ok: true });
  } catch (err) {
    console.error("[events] 记录事件失败:", (err as Error).message);
    res.status(500).json({ error: "记录事件失败" });
  }
});

export default router;
