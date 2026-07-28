import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { ScenarioConfig } from "./scenarios.js";
import { DEFAULT_SCENARIO_CONFIG } from "./scenarios.js";

const CONFIG_FILE = resolve(process.cwd(), "data", "scenarios.json");

/** 读取当前题目配置，未保存过则使用默认配置 */
export function loadScenarioConfig(): ScenarioConfig[] {
  if (!existsSync(CONFIG_FILE)) {
    return DEFAULT_SCENARIO_CONFIG;
  }
  try {
    const raw = readFileSync(CONFIG_FILE, "utf-8");
    const parsed = JSON.parse(raw) as ScenarioConfig[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error("[config] 读取 scenarios.json 失败，使用默认配置:", (err as Error).message);
  }
  return DEFAULT_SCENARIO_CONFIG;
}

/** 保存题目配置到 JSON 文件 */
export function saveScenarioConfig(config: ScenarioConfig[]): void {
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
}
