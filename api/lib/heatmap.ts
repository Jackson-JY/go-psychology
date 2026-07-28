import type { Coord, MoveRecord, RadarData, PuzzleId } from "@shared/types";
import { generateTags } from "@shared/archetypes.js";
import type { HeatRect } from "@shared/scenarios.js";
import { loadScenarioConfig } from "@shared/config.js";

/** 雷达 5 维 key */
type RadarKey = keyof RadarData;

/** 判断坐标是否在矩形内 */
function inRect(c: Coord, r: HeatRect): boolean {
  return c.x >= r.x0 && c.x <= r.x1 && c.y >= r.y0 && c.y <= r.y1;
}

/** 当前加载的题目配置（热区规则） */
function getHeatmapConfig(): Record<PuzzleId, import("@shared/scenarios.js").HeatZone[]> {
  const configs = loadScenarioConfig();
  const map: Record<PuzzleId, import("@shared/scenarios.js").HeatZone[]> = {
    lifeDeath: [],
    opening: [],
    invasion: [],
    ko: [],
  };
  for (const cfg of configs) {
    map[cfg.scenario.id] = cfg.heatmap;
  }
  return map;
}

/** 默认雷达基线（中性 50） */
const BASE_RADAR: RadarData = {
  riskAppetite: 50,
  resilience: 50,
  rationality: 50,
  conflictResponse: 50,
  focus: 50,
};

/**
 * 思考时间对五维的影响
 * - 极快（<3s）：冲动型，风险偏好略升，专注略降
 * - 较快（3-6s）：正常范围
 * - 较慢（6-10s）：理性与专注略升
 * - 极慢（>10s）：理性与专注提升，但风险偏好感下降（过于谨慎）
 */
function timeEffect(elapsedMs: number): Partial<Record<RadarKey, number>> {
  if (elapsedMs < 3000) {
    return { riskAppetite: +5, focus: -5, conflictResponse: +3 };
  }
  if (elapsedMs < 6000) {
    return { rationality: +2, focus: +2 };
  }
  if (elapsedMs < 10000) {
    return { rationality: +5, focus: +5, riskAppetite: -3 };
  }
  return { rationality: +8, focus: +8, riskAppetite: -5, conflictResponse: -3 };
}

/** 限制 0-100 */
function clamp(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)));
}

export interface AnalyzeInternal {
  radar: RadarData;
  tags: string[];
  rationales: string[]; // 每关落子理由，用于 prompt
}

export function mapMovesToProfile(
  moves: MoveRecord[],
  _experienceLevel?: "beginner" | "skilled",
): AnalyzeInternal {
  const radar: RadarData = { ...BASE_RADAR };
  const rationales: string[] = [];

  const heatmapConfig = getHeatmapConfig();
  for (const move of moves) {
    const zones = heatmapConfig[move.puzzleId];
    const matched = zones.find((z) => inRect(move, z.rect));
    if (matched) {
      rationales.push(`【${move.puzzleId}】${matched.rationale}`);
      for (const [k, v] of Object.entries(matched.delta) as [RadarKey, number][]) {
        radar[k] += v;
      }
    } else {
      rationales.push(`【${move.puzzleId}】落子位置游离，未明显倾向，性格克制不冒头`);
    }
    const timeEffects = timeEffect(move.elapsedMs);
    for (const [k, v] of Object.entries(timeEffects) as [RadarKey, number][]) {
      radar[k] += v;
    }
  }

  (Object.keys(radar) as RadarKey[]).forEach((k) => {
    radar[k] = clamp(radar[k]);
  });

  // 标签与 SGF 分析共用同一套生成规则，确保两套入口输出一致
  const tags = generateTags(radar);

  return {
    radar,
    tags,
    rationales,
  };
}
