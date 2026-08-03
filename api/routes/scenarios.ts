import { Router, type Request, type Response } from "express";
import { loadScenarioConfig, saveScenarioConfig } from "@shared/config.js";
import type { ScenarioConfig } from "@shared/scenarios.js";
import { logEvent } from "../lib/db.js";

const router = Router();

function getPassword(): string | undefined {
  return process.env.EDITOR_PASSWORD;
}

function isValidConfig(body: unknown): body is ScenarioConfig[] {
  if (!Array.isArray(body)) return false;
  return body.every((item) => {
    if (!item || typeof item !== "object") return false;
    const { scenario, heatmaps } = item as { scenario?: unknown; heatmaps?: unknown };
    if (!scenario || typeof scenario !== "object") return false;
    if (!heatmaps || typeof heatmaps !== "object") return false;
    return true;
  });
}

/** 读取当前题目配置 */
router.get("/", (_req: Request, res: Response) => {
  try {
    const config = loadScenarioConfig();
    res.json(config);
  } catch (err) {
    console.error("[scenarios] 读取配置失败:", (err as Error).message);
    res.status(500).json({ error: "读取配置失败" });
  }
});

/** 保存题目配置（需要密码） */
router.post("/", (req: Request, res: Response) => {
  const expected = getPassword();
  if (!expected) {
    res.status(403).json({ error: "未配置编辑密码，禁止保存" });
    return;
  }

  const { password, config } = req.body as { password?: string; config?: ScenarioConfig[] };
  if (!password || password !== expected) {
    res.status(401).json({ error: "密码错误" });
    return;
  }

  // 仅验证密码的探测请求（config 为空）
  if (!config) {
    res.json({ ok: true });
    return;
  }

  if (!isValidConfig(config)) {
    res.status(400).json({ error: "配置格式不正确" });
    return;
  }

  try {
    saveScenarioConfig(config);
    logEvent({
      type: "scenario_save",
      payload: { scenarioIds: config.map((c) => c.scenario.id) },
      ip: (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() || req.ip || "",
      userAgent: req.headers["user-agent"] as string | undefined,
    });
    res.json({ ok: true });
  } catch (err) {
    console.error("[scenarios] 保存配置失败:", (err as Error).message);
    res.status(500).json({ error: "保存配置失败" });
  }
});

export default router;
