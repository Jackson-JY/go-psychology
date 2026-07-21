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
 * 3 关残局热区配置
 * 坐标范围 0-8，原点左上
 */
const HEATMAP: Record<PuzzleId, HeatZone[]> = {
  // 第 1 关 · 围：黑 3 子被白 5 子包围在中央
  siege: [
    {
      // 死子附近（贴着死子救援）
      rect: { x0: 2, y0: 2, x1: 5, y1: 5 },
      tags: ["执念深", "沉没成本谬误", "团队至上"],
      delta: { sunkCost: +35, decisiveness: -8, bigPicture: -10 },
      rationale: "明知被困仍贴身救援死子，沉没成本谬误显著，难以止损",
    },
    {
      // 外围开阔地（远离战场）
      rect: { x0: 0, y0: 0, x1: 1, y1: 8 },
      tags: ["大局观好", "果断止损", "战略定力"],
      delta: { bigPicture: +30, riskAppetite: -10, decisiveness: +15 },
      rationale: "放弃局部、转向外围开阔地，大局观强、懂得及时止损",
    },
    {
      rect: { x0: 7, y0: 0, x1: 8, y1: 8 },
      tags: ["大局观好", "果断止损", "战略定力"],
      delta: { bigPicture: +30, riskAppetite: -10, decisiveness: +15 },
      rationale: "放弃局部、转向外围开阔地，大局观强、懂得及时止损",
    },
    {
      // 直接贴靠敌方阵地（中央偏右下）
      rect: { x0: 5, y0: 5, x1: 6, y1: 6 },
      tags: ["极度激进", "风险偏好高", "主动出击"],
      delta: { riskAppetite: +35, controlDesire: +25, decisiveness: +12 },
      rationale: "贴靠敌方阵地正面硬刚，风险偏好极高，掌控欲强",
    },
    {
      // 中央上方（半推半就）
      rect: { x0: 3, y0: 0, x1: 5, y1: 1 },
      tags: ["审慎", "中立偏守"],
      delta: { riskAppetite: -5, bigPicture: +10, decisiveness: +5 },
      rationale: "选在不远不近的次线，审慎但缺乏决断",
    },
  ],
  // 第 2 关 · 贪：中央有黑白交错的肥肉
  greed: [
    {
      // 中央肥肉（直冲 4,4）
      rect: { x0: 3, y0: 3, x1: 5, y1: 5 },
      tags: ["贪婪", "过度自信", "FOMO"],
      delta: { riskAppetite: +35, sunkCost: +12, controlDesire: +20 },
      rationale: "直扑中央肥肉，贪婪与 FOMO 驱动，过度自信易踩坑",
    },
    {
      // 角部退守
      rect: { x0: 0, y0: 0, x1: 1, y1: 1 },
      tags: ["风控稳健", "守拙", "长期主义"],
      delta: { riskAppetite: -25, bigPicture: +20, decisiveness: +8 },
      rationale: "退守角部稳健布局，风控意识强，但可能错过机会",
    },
    {
      rect: { x0: 7, y0: 7, x1: 8, y1: 8 },
      tags: ["风控稳健", "守拙"],
      delta: { riskAppetite: -25, bigPicture: +20 },
      rationale: "退守角部稳健布局，风控意识强，但可能错过机会",
    },
    {
      // 边线逃避
      rect: { x0: 0, y0: 3, x1: 0, y1: 5 },
      tags: ["保守", "逃避倾向", "机会盲区"],
      delta: { riskAppetite: -15, bigPicture: -10, decisiveness: -8 },
      rationale: "落子边线逃避主战场，过于保守，可能错失主机会",
    },
    {
      rect: { x0: 8, y0: 3, x1: 8, y1: 5 },
      tags: ["保守", "逃避倾向", "机会盲区"],
      delta: { riskAppetite: -15, bigPicture: -10, decisiveness: -8 },
      rationale: "落子边线逃避主战场，过于保守，可能错失主机会",
    },
    {
      // 上方高位压制
      rect: { x0: 3, y0: 0, x1: 5, y1: 2 },
      tags: ["高位压制", "主动卡位"],
      delta: { controlDesire: +18, riskAppetite: +12, bigPicture: +10 },
      rationale: "选择高位主动卡位，掌控欲强，攻守兼备",
    },
  ],
  // 第 3 关 · 局：全盘稀疏
  overall: [
    {
      // 角部星位（左上、右上、左下、右下）
      rect: { x0: 2, y0: 2, x1: 2, y1: 2 },
      tags: ["大局观", "经典格局", "厚实主义"],
      delta: { bigPicture: +28, decisiveness: +10, riskAppetite: -8 },
      rationale: "选择角部星位，大局观好，遵循经典格局",
    },
    {
      rect: { x0: 6, y0: 2, x1: 6, y1: 2 },
      tags: ["大局观", "经典格局"],
      delta: { bigPicture: +28, decisiveness: +10, riskAppetite: -8 },
      rationale: "选择角部星位，大局观好，遵循经典格局",
    },
    {
      rect: { x0: 2, y0: 6, x1: 2, y1: 6 },
      tags: ["大局观", "经典格局"],
      delta: { bigPicture: +28, decisiveness: +10, riskAppetite: -8 },
      rationale: "选择角部星位，大局观好，遵循经典格局",
    },
    {
      rect: { x0: 6, y0: 6, x1: 6, y1: 6 },
      tags: ["大局观", "经典格局"],
      delta: { bigPicture: +28, decisiveness: +10, riskAppetite: -8 },
      rationale: "选择角部星位，大局观好，遵循经典格局",
    },
    {
      // 天元（中央 4,4）
      rect: { x0: 4, y0: 4, x1: 4, y1: 4 },
      tags: ["掌控欲", "全局统御", "英雄主义"],
      delta: { controlDesire: +35, bigPicture: +15, riskAppetite: +10 },
      rationale: "直取天元，掌控欲极强，有英雄主义倾向",
    },
    {
      // 边线
      rect: { x0: 0, y0: 4, x1: 0, y1: 4 },
      tags: ["防御性人格", "边缘站位"],
      delta: { riskAppetite: -12, bigPicture: -8, controlDesire: -10 },
      rationale: "落子边线，防御性人格，倾向边缘站位",
    },
    {
      rect: { x0: 8, y0: 4, x1: 8, y1: 4 },
      tags: ["防御性人格", "边缘站位"],
      delta: { riskAppetite: -12, bigPicture: -8, controlDesire: -10 },
      rationale: "落子边线，防御性人格，倾向边缘站位",
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
};

/** 思考时长对决断力的影响：<3s 果断+；>10s 犹豫- */
function timeEffect(elapsedMs: number): number {
  if (elapsedMs < 3000) return +12;
  if (elapsedMs < 6000) return +4;
  if (elapsedMs < 10000) return -4;
  return -14;
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

/** 把 3 关落子映射为雷达 + 标签 */
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
      // 未命中热区：当作中性探索
      rationales.push(`【${move.puzzleId}】落子位置游离，未明显倾向，性格克制不冒头`);
    }
    radar.decisiveness += timeEffect(move.elapsedMs);
  }

  // 限制范围
  (Object.keys(radar) as RadarKey[]).forEach((k) => {
    radar[k] = clamp(radar[k]);
  });

  return {
    radar,
    tags: Array.from(tagSet),
    rationales,
  };
}
