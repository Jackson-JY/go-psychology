import type { Coord, MoveRecord, RadarData, PuzzleId } from "@shared/types";
import { generateTags } from "@shared/archetypes.js";

/** 雷达 5 维 key */
type RadarKey = keyof RadarData;

/** 热区矩形 */
interface Rect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

interface HeatZone {
  rect: Rect;
  delta: Partial<Record<RadarKey, number>>;
  /** 用户落子理由描述（用于 prompt） */
  rationale: string;
}

/** 判断坐标是否在矩形内 */
function inRect(c: Coord, r: Rect): boolean {
  return c.x >= r.x0 && c.x <= r.x1 && c.y >= r.y0 && c.y <= r.y1;
}

/**
 * 4 关残局热区配置（与 SGF 五维心理模型保持一致）
 * 坐标范围 0-8，原点左上
 *
 * 五维映射设计：
 * - lifeDeath → rationality（决策理性度：止损 vs 执念）
 * - opening   → riskAppetite（风险偏好：角部保守 vs 中腹激进）
 * - invasion  → conflictResponse（冲突应对：对抗 vs 妥协）
 * - ko        → focus（长效专注：灵活应变 vs 隧道视野）
 */
const HEATMAP: Record<PuzzleId, HeatZone[]> = {
  // 第 1 关 · 死活困境：测试决策理性度（止损 vs 沉没成本）
  lifeDeath: [
    {
      // 继续爬二路：在二路(y=7)或一路(y=8)继续投入，试图让黑子突围
      rect: { x0: 4, y0: 6, x1: 8, y1: 8 },
      delta: { rationality: -25, resilience: +8, conflictResponse: +5 },
      rationale: "二路黑子已被白棋三路厚壁压制，仍继续爬二路试图突围，不愿放弃已有投入，损失厌恶显著",
    },
    {
      // 弃子封外：在中腹/边路落子，放弃底部黑子，开辟新战场
      rect: { x0: 3, y0: 0, x1: 8, y1: 5 },
      delta: { rationality: +25, focus: +10, riskAppetite: -5 },
      rationale: "放弃二路被压制的黑子，转而在中腹或边路开辟新战场，懂得止损、放眼全局",
    },
    {
      // 中间过渡区域
      rect: { x0: 1, y0: 4, x1: 4, y1: 5 },
      delta: { rationality: +5, focus: -5 },
      rationale: "既不甘心放弃二路黑子，又不敢彻底投入突围，处于观望犹豫状态",
    },
  ],
  // 第 2 关 · 布局偏好：测试风险偏好（角部保守 vs 中腹激进）
  opening: [
    {
      // 占角 / 守角 / 爬二路：稳扎稳打拿实地
      rect: { x0: 0, y0: 0, x1: 2, y1: 2 },
      delta: { riskAppetite: -20, rationality: +5, focus: +5 },
      rationale: "选择角部巩固实地，优先追求确定性和安全感",
    },
    {
      rect: { x0: 0, y0: 6, x1: 2, y1: 8 },
      delta: { riskAppetite: -20, rationality: +5, focus: +5 },
      rationale: "选择角部巩固实地，优先追求确定性和安全感",
    },
    {
      rect: { x0: 6, y0: 0, x1: 8, y1: 2 },
      delta: { riskAppetite: -20, rationality: +5, focus: +5 },
      rationale: "选择角部巩固实地，优先追求确定性和安全感",
    },
    {
      rect: { x0: 6, y0: 6, x1: 8, y1: 8 },
      delta: { riskAppetite: -20, rationality: +5, focus: +5 },
      rationale: "选择角部巩固实地，优先追求确定性和安全感",
    },
    {
      // 占中腹 / 高位构筑大势
      rect: { x0: 3, y0: 3, x1: 5, y1: 5 },
      delta: { riskAppetite: +25, conflictResponse: +10, focus: -5 },
      rationale: "选择中腹高位，追求全局掌控和宏大布局，控制欲强",
    },
    {
      // 边线中央：折中方案
      rect: { x0: 0, y0: 3, x1: 2, y1: 5 },
      delta: { riskAppetite: +5, rationality: +3 },
      rationale: "选择边线发展，兼顾安全与扩张，走中间路线",
    },
    {
      rect: { x0: 6, y0: 3, x1: 8, y1: 5 },
      delta: { riskAppetite: +5, rationality: +3 },
      rationale: "选择边线发展，兼顾安全与扩张，走中间路线",
    },
  ],
  // 第 3 关 · 侵犯应对：测试冲突应对（对抗型 vs 妥协型）
  invasion: [
    {
      // 强行扳 / 断：正面硬碰硬
      rect: { x0: 3, y0: 3, x1: 5, y1: 5 },
      delta: { conflictResponse: +25, riskAppetite: +10, rationality: -5 },
      rationale: "面对挑衅选择正面迎击，攻击性强，冲突应对模式偏对抗",
    },
    {
      // 退让 / 补强：稳妥后退
      rect: { x0: 0, y0: 3, x1: 2, y1: 5 },
      delta: { conflictResponse: -20, rationality: +10, resilience: +5 },
      rationale: "面对挑衅选择退让巩固，避免正面冲突，重视全局安定",
    },
    {
      rect: { x0: 0, y0: 0, x1: 2, y1: 2 },
      delta: { conflictResponse: -25, riskAppetite: -10, focus: -5 },
      rationale: "大幅退让甚至逃离战场，对冲突有较强回避倾向",
    },
  ],
  // 第 4 关 · 劫争转换：测试长效专注（灵活应变 vs 隧道视野）
  ko: [
    {
      // 应劫 / 粘劫：继续主战场
      rect: { x0: 5, y0: 0, x1: 8, y1: 4 },
      delta: { focus: -20, resilience: +10, conflictResponse: +10, rationality: -10 },
      rationale: "紧盯主战场劫争不放，隧道视野明显，难以接受局部受损",
    },
    {
      // 消劫 / 别处连下两手：转向侧翼
      rect: { x0: 0, y0: 5, x1: 4, y1: 8 },
      delta: { focus: +25, rationality: +10, riskAppetite: +5 },
      rationale: "放弃主战场劫争，转而攻击侧翼，展现灵活的多任务应变能力",
    },
    {
      // 中间观望
      rect: { x0: 3, y0: 3, x1: 5, y1: 5 },
      delta: { focus: +5, rationality: -5 },
      rationale: "既想处理劫争又想照顾侧翼，犹豫不决，缺乏明确优先级",
    },
  ],
};

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

  for (const move of moves) {
    const zones = HEATMAP[move.puzzleId];
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
