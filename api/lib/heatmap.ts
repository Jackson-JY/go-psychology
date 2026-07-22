import type { Coord, MoveRecord, RadarData, PuzzleId } from "@shared/types";

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
  tags: string[];
  delta: Partial<Record<RadarKey, number>>;
  /** 用户落子理由描述（用于 prompt） */
  rationale: string;
}

/** 判断坐标是否在矩形内 */
function inRect(c: Coord, r: Rect): boolean {
  return c.x >= r.x0 && c.x <= r.x1 && c.y >= r.y0 && c.y <= r.y1;
}

/**
 * 4 关残局热区配置
 * 坐标范围 0-8，原点左上
 */
const HEATMAP: Record<PuzzleId, HeatZone[]> = {
  // 第 1 关 · 死活困境：测试损失厌恶与止损决策
  lifeDeath: [
    {
      // 强行突围：在死子附近继续投入
      rect: { x0: 0, y0: 5, x1: 3, y1: 8 },
      tags: ["执念深", "沉没成本谬误", "损失厌恶"],
      delta: { sunkCost: +40, decisiveness: -12, bigPicture: -10, emotionalStability: -10 },
      rationale: "被围残子已无生路，仍强行突围救援，损失厌恶显著，难以止损",
    },
    {
      // 弃子封外：在右上方或外围构筑厚势
      rect: { x0: 4, y0: 0, x1: 8, y1: 5 },
      tags: ["果断止损", "大局观好", "战略定力"],
      delta: { bigPicture: +35, decisiveness: +18, sunkCost: -25, emotionalStability: +15 },
      rationale: "放弃濒死残子，转而在外围构筑厚势，懂得止损、放眼全局",
    },
    {
      // 半推半就的过渡区域
      rect: { x0: 3, y0: 5, x1: 4, y1: 7 },
      tags: ["犹豫观望", "中间路线"],
      delta: { decisiveness: -8, bigPicture: +5, emotionalStability: -5 },
      rationale: "既不甘心放弃，又不敢彻底救援，处于观望犹豫状态",
    },
  ],
  // 第 2 关 · 布局偏好：测试安全感倾向与控制欲
  opening: [
    {
      // 占角 / 守角 / 爬二路：稳扎稳打拿实地
      rect: { x0: 0, y0: 0, x1: 2, y1: 2 },
      tags: ["安全感强", "稳健务实", "风控意识"],
      delta: { riskAppetite: -25, bigPicture: +10, decisiveness: +8, emotionalStability: +10 },
      rationale: "选择角部巩固实地，优先追求确定性和安全感",
    },
    {
      rect: { x0: 0, y0: 6, x1: 2, y1: 8 },
      tags: ["安全感强", "稳健务实"],
      delta: { riskAppetite: -25, bigPicture: +10, decisiveness: +8 },
      rationale: "选择角部巩固实地，优先追求确定性和安全感",
    },
    {
      rect: { x0: 6, y0: 0, x1: 8, y1: 2 },
      tags: ["安全感强", "稳健务实"],
      delta: { riskAppetite: -25, bigPicture: +10, decisiveness: +8 },
      rationale: "选择角部巩固实地，优先追求确定性和安全感",
    },
    {
      rect: { x0: 6, y0: 6, x1: 8, y1: 8 },
      tags: ["安全感强", "稳健务实"],
      delta: { riskAppetite: -25, bigPicture: +10, decisiveness: +8 },
      rationale: "选择角部巩固实地，优先追求确定性和安全感",
    },
    {
      // 占中腹 / 高位构筑大势
      rect: { x0: 3, y0: 3, x1: 5, y1: 5 },
      tags: ["掌控欲强", "大局观", "格局宏大"],
      delta: { controlDesire: +35, bigPicture: +25, riskAppetite: +15, innovation: +10 },
      rationale: "选择中腹高位，追求全局掌控和宏大布局，控制欲强",
    },
    {
      // 边线中央：折中方案
      rect: { x0: 0, y0: 3, x1: 2, y1: 5 },
      tags: ["平衡型", "攻守兼备"],
      delta: { bigPicture: +8, riskAppetite: -5, controlDesire: +5 },
      rationale: "选择边线发展，兼顾安全与扩张，走中间路线",
    },
    {
      rect: { x0: 6, y0: 3, x1: 8, y1: 5 },
      tags: ["平衡型", "攻守兼备"],
      delta: { bigPicture: +8, riskAppetite: -5, controlDesire: +5 },
      rationale: "选择边线发展，兼顾安全与扩张，走中间路线",
    },
  ],
  // 第 3 关 · 侵犯应对：测试攻击性与冲突应对模式
  invasion: [
    {
      // 强行扳 / 断：正面硬碰硬
      rect: { x0: 3, y0: 3, x1: 5, y1: 5 },
      tags: ["攻击性强", "正面冲突", "不退让"],
      delta: { riskAppetite: +30, controlDesire: +25, decisiveness: +15, cooperation: -15 },
      rationale: "面对挑衅选择正面迎击，攻击性强，冲突应对模式偏对抗",
    },
    {
      // 退让 / 补强：稳妥后退
      rect: { x0: 0, y0: 3, x1: 2, y1: 5 },
      tags: ["退让型", "避免冲突", "全局安定"],
      delta: { cooperation: +20, emotionalStability: +15, riskAppetite: -15, controlDesire: -10 },
      rationale: "面对挑衅选择退让巩固，避免正面冲突，重视全局安定",
    },
    {
      rect: { x0: 0, y0: 0, x1: 2, y1: 2 },
      tags: ["退让型", "逃避倾向"],
      delta: { cooperation: +10, riskAppetite: -20, controlDesire: -15, decisiveness: -8 },
      rationale: "大幅退让甚至逃离战场，对冲突有较强回避倾向",
    },
  ],
  // 第 4 关 · 劫争转换：测试隧道视野与多任务应变
  ko: [
    {
      // 应劫 / 粘劫：继续主战场
      rect: { x0: 5, y0: 0, x1: 8, y1: 4 },
      tags: ["隧道视野", "执念主战场", "不服输"],
      delta: { sunkCost: +25, controlDesire: +20, bigPicture: -15, decisiveness: -10 },
      rationale: "紧盯主战场劫争不放，隧道视野明显，难以接受局部受损",
    },
    {
      // 消劫 / 别处连下两手：转向侧翼
      rect: { x0: 0, y0: 5, x1: 4, y1: 8 },
      tags: ["灵活应变", "全局思维", "战略转移"],
      delta: { bigPicture: +35, decisiveness: +20, innovation: +15, controlDesire: -10 },
      rationale: "放弃主战场劫争，转而攻击侧翼，展现灵活的多任务应变能力",
    },
    {
      // 中间观望
      rect: { x0: 3, y0: 3, x1: 5, y1: 5 },
      tags: ["犹豫不决", "中间路线"],
      delta: { decisiveness: -12, bigPicture: +5, emotionalStability: -5 },
      rationale: "既想处理劫争又想照顾侧翼，犹豫不决，缺乏明确优先级",
    },
  ],
};

/** 默认雷达基线（中性 50） */
const BASE_RADAR: RadarData = {
  sunkCost: 50,
  riskAppetite: 50,
  bigPicture: 50,
  decisiveness: 50,
  controlDesire: 50,
  emotionalStability: 50,
  cooperation: 50,
  innovation: 50,
  patience: 50,
};

function timeEffect(elapsedMs: number): { decisiveness: number; patience: number; emotionalStability: number } {
  if (elapsedMs < 3000) {
    return { decisiveness: +12, patience: -8, emotionalStability: +5 };
  }
  if (elapsedMs < 6000) {
    return { decisiveness: +4, patience: +2, emotionalStability: +3 };
  }
  if (elapsedMs < 10000) {
    return { decisiveness: -4, patience: +6, emotionalStability: -2 };
  }
  return { decisiveness: -14, patience: +12, emotionalStability: -8 };
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

export function mapMovesToProfile(moves: MoveRecord[]): AnalyzeInternal {
  const radar: RadarData = { ...BASE_RADAR };
  const tagSet = new Set<string>();
  const rationales: string[] = [];

  for (const move of moves) {
    const zones = HEATMAP[move.puzzleId];
    const matched = zones.find((z) => inRect(move, z.rect));
    if (matched) {
      matched.tags.forEach((t) => tagSet.add(t));
      rationales.push(`【${move.puzzleId}】${matched.rationale}`);
      for (const [k, v] of Object.entries(matched.delta) as [RadarKey, number][]) {
        radar[k] += v;
      }
    } else {
      rationales.push(`【${move.puzzleId}】落子位置游离，未明显倾向，性格克制不冒头`);
    }
    const timeEffects = timeEffect(move.elapsedMs);
    radar.decisiveness += timeEffects.decisiveness;
    radar.patience += timeEffects.patience;
    radar.emotionalStability += timeEffects.emotionalStability;
  }

  (Object.keys(radar) as RadarKey[]).forEach((k) => {
    radar[k] = clamp(radar[k]);
  });

  return {
    radar,
    tags: Array.from(tagSet),
    rationales,
  };
}
