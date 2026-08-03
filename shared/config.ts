import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { ScenarioConfig, HeatZone } from "./scenarios.js";
import { DEFAULT_SCENARIO_CONFIG } from "./scenarios.js";
import type { PlacedStone, Coord } from "./types.js";

const CONFIG_FILE = resolve(process.cwd(), "data", "scenarios.json");

/** 9×9 坐标映射到 13×13 */
function s9to13(c: Coord): Coord {
  const scale = (13 - 1) / (9 - 1);
  return { x: Math.round(c.x * scale), y: Math.round(c.y * scale) };
}

/** 将旧格式（scenario.stones / heatmap 单数组）迁移到新的 boards / heatmaps 结构 */
function migrateConfig(raw: any[]): ScenarioConfig[] {
  return raw.map((item) => {
    const scen = item.scenario ?? {};
    const oldStones = scen.stones as PlacedStone[] | undefined;
    const oldFocus = scen.focus as Coord | undefined;
    const oldHeatmap = item.heatmap as HeatZone[] | undefined;

    const board = {
      stones: oldStones ?? [],
      focus: oldFocus,
    };
    const boardSkilled = {
      stones: (oldStones ?? []).map((s) => ({ ...s, ...s9to13(s) })),
      focus: oldFocus ? s9to13(oldFocus) : undefined,
    };

    const heatmapsBeginner = oldHeatmap ?? [];
    const heatmapsSkilled = heatmapsBeginner.map((z) => {
      const a = s9to13({ x: z.rect.x0, y: z.rect.y0 });
      const b = s9to13({ x: z.rect.x1, y: z.rect.y1 });
      return {
        ...z,
        rect: { x0: a.x, y0: a.y, x1: b.x, y1: b.y },
      };
    });

    return {
      scenario: {
        id: scen.id,
        index: scen.index,
        copy: scen.copy ?? { beginner: {}, skilled: {} },
        boards: scen.boards ?? { beginner: board, skilled: boardSkilled },
      },
      heatmaps: item.heatmaps ?? { beginner: heatmapsBeginner, skilled: heatmapsSkilled },
    } as ScenarioConfig;
  });
}

/** 读取当前题目配置，未保存过则使用默认配置；自动兼容旧格式 */
export function loadScenarioConfig(): ScenarioConfig[] {
  if (!existsSync(CONFIG_FILE)) {
    return DEFAULT_SCENARIO_CONFIG;
  }
  try {
    const raw = readFileSync(CONFIG_FILE, "utf-8");
    const parsed = JSON.parse(raw) as any[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      return migrateConfig(parsed);
    }
  } catch (err) {
    console.error("[config] 读取 scenarios.json 失败，使用默认配置:", (err as Error).message);
  }
  return DEFAULT_SCENARIO_CONFIG;
}

/** 保存题目配置到 JSON 文件 */
export function saveScenarioConfig(config: ScenarioConfig[]): void {
  const dir = dirname(CONFIG_FILE);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
}
