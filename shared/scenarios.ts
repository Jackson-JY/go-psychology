import type { Scenario, RadarData, Coord, PlacedStone } from "./types.js";

/** 热区矩形 */
export interface HeatRect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** 雷达 5 维 key */
export type RadarKey = keyof RadarData;

/** 单关热区配置 */
export interface HeatZone {
  rect: HeatRect;
  delta: Partial<Record<RadarKey, number>>;
  rationale: string;
}

/** 棋盘级别配置（棋子、焦点）—— 与 types 中的 BoardConfig 保持一致 */
export interface BoardConfig {
  stones: PlacedStone[];
  focus?: Coord;
}

/** 完整题目配置：包含棋盘、文案、热区分析规则 */
export interface ScenarioConfig {
  scenario: Scenario;
  /** 两套热区：beginner=9×9 坐标，skilled=13×13 坐标 */
  heatmaps: Record<"beginner" | "skilled", HeatZone[]>;
}

/** 9×9 坐标映射到 13×13 */
function s9to13(c: Coord): Coord {
  const scale = (13 - 1) / (9 - 1);
  return { x: Math.round(c.x * scale), y: Math.round(c.y * scale) };
}

function stones9to13(stones: PlacedStone[]): PlacedStone[] {
  return stones.map((s) => ({ ...s, ...s9to13(s) }));
}

function rect9to13(r: HeatRect): HeatRect {
  const a = s9to13({ x: r.x0, y: r.y0 });
  const b = s9to13({ x: r.x1, y: r.y1 });
  return { x0: a.x, y0: a.y, x1: b.x, y1: b.y };
}

const BEGINNER_1_LIFEDEATH_BOARD: BoardConfig = {
  stones: [
    { x: 1, y: 7, color: "B" as const },
    { x: 2, y: 7, color: "B" as const },
    { x: 3, y: 7, color: "B" as const },
    { x: 4, y: 7, color: "B" as const },
    { x: 0, y: 6, color: "W" as const },
    { x: 1, y: 6, color: "W" as const },
    { x: 2, y: 6, color: "W" as const },
    { x: 3, y: 6, color: "W" as const },
    { x: 4, y: 6, color: "W" as const },
    { x: 5, y: 6, color: "W" as const },
    { x: 0, y: 7, color: "W" as const },
  ],
  focus: { x: 2, y: 6 },
};

const BEGINNER_2_OPENING_BOARD: BoardConfig = {
  stones: [
    { x: 1, y: 1, color: "B" as const },
    { x: 1, y: 7, color: "W" as const },
    { x: 7, y: 7, color: "B" as const },
  ],
};

const BEGINNER_3_INVASION_BOARD: BoardConfig = {
  stones: [
    { x: 1, y: 3, color: "B" as const },
    { x: 1, y: 4, color: "B" as const },
    { x: 1, y: 5, color: "B" as const },
    { x: 2, y: 3, color: "B" as const },
    { x: 2, y: 4, color: "B" as const },
    { x: 2, y: 5, color: "B" as const },
    { x: 3, y: 4, color: "W" as const },
  ],
  focus: { x: 3, y: 4 },
};

const BEGINNER_4_KO_BOARD: BoardConfig = {
  stones: [
    { x: 7, y: 1, color: "B" as const },
    { x: 8, y: 1, color: "W" as const },
    { x: 7, y: 2, color: "W" as const },
    { x: 8, y: 2, color: "B" as const },
    { x: 6, y: 2, color: "W" as const },
    { x: 1, y: 6, color: "W" as const },
    { x: 2, y: 6, color: "W" as const },
    { x: 1, y: 7, color: "W" as const },
    { x: 2, y: 7, color: "W" as const },
    { x: 3, y: 6, color: "W" as const },
    { x: 0, y: 5, color: "B" as const },
    { x: 4, y: 8, color: "B" as const },
  ],
  focus: { x: 7, y: 1 },
};

const BEGINNER_1_HEATMAP: HeatZone[] = [
  // 高风险/沉没成本：继续救援被困子
  {
    rect: { x0: 4, y0: 6, x1: 8, y1: 8 },
    delta: { rationality: -20, resilience: +10, conflictResponse: +8, riskAppetite: +5 },
    rationale: "二路黑子已被白棋三路厚壁压制，仍继续爬二路试图突围，不愿放弃已有投入，损失厌恶显著",
  },
  // 理性止损：中腹/上边开辟新战场
  {
    rect: { x0: 3, y0: 0, x1: 8, y1: 5 },
    delta: { rationality: +20, focus: +10, riskAppetite: -5, resilience: +3 },
    rationale: "放弃二路被压制的黑子，转而在中腹或边路开辟新战场，懂得止损、放眼全局",
  },
  // 犹豫观望
  {
    rect: { x0: 1, y0: 4, x1: 4, y1: 5 },
    delta: { rationality: +5, focus: -8, conflictResponse: -5 },
    rationale: "既不甘心放弃二路黑子，又不敢彻底投入突围，处于观望犹豫状态",
  },
  // 极端弃子：左上角狠心割舍，抗压受损
  {
    rect: { x0: 0, y0: 0, x1: 2, y1: 3 },
    delta: { rationality: +25, riskAppetite: -15, resilience: -15, focus: +5 },
    rationale: "彻底放弃被围黑子并远远躲开，虽能止损，但显露对压力的逃避",
  },
];

const BEGINNER_2_HEATMAP: HeatZone[] = [
  // 四角：稳健保守（含一点回避倾向）
  { rect: { x0: 0, y0: 0, x1: 2, y1: 2 }, delta: { riskAppetite: -15, rationality: +8, focus: +5, resilience: +3, conflictResponse: -3 }, rationale: "选择角部巩固实地，优先追求确定性和安全感" },
  { rect: { x0: 0, y0: 6, x1: 2, y1: 8 }, delta: { riskAppetite: -15, rationality: +8, focus: +5, resilience: +3, conflictResponse: -3 }, rationale: "选择角部巩固实地，优先追求确定性和安全感" },
  { rect: { x0: 6, y0: 0, x1: 8, y1: 2 }, delta: { riskAppetite: -15, rationality: +8, focus: +5, resilience: +3, conflictResponse: -3 }, rationale: "选择角部巩固实地，优先追求确定性和安全感" },
  { rect: { x0: 6, y0: 6, x1: 8, y1: 8 }, delta: { riskAppetite: -15, rationality: +8, focus: +5, resilience: +3, conflictResponse: -3 }, rationale: "选择角部巩固实地，优先追求确定性和安全感" },
  // 中腹：宏大布局
  { rect: { x0: 3, y0: 3, x1: 5, y1: 5 }, delta: { riskAppetite: +20, conflictResponse: +10, focus: -8 }, rationale: "选择中腹高位，追求全局掌控和宏大布局，控制欲强" },
  // 边线：平衡发展（避免与四角重叠）
  { rect: { x0: 0, y0: 3, x1: 1, y1: 5 }, delta: { riskAppetite: +5, rationality: +5, focus: +3 }, rationale: "选择边线发展，兼顾安全与扩张，走中间路线" },
  { rect: { x0: 7, y0: 3, x1: 8, y1: 5 }, delta: { riskAppetite: +5, rationality: +5, focus: +3 }, rationale: "选择边线发展，兼顾安全与扩张，走中间路线" },
  { rect: { x0: 3, y0: 0, x1: 5, y1: 1 }, delta: { riskAppetite: +5, rationality: +5, focus: +3 }, rationale: "选择边线发展，兼顾安全与扩张，走中间路线" },
  { rect: { x0: 3, y0: 7, x1: 5, y1: 8 }, delta: { riskAppetite: +5, rationality: +5, focus: +3 }, rationale: "选择边线发展，兼顾安全与扩张，走中间路线" },
  // 靠近对手：主动挑衅
  { rect: { x0: 0, y0: 5, x1: 3, y1: 7 }, delta: { riskAppetite: +15, conflictResponse: +18, rationality: -5, focus: -5 }, rationale: "主动靠近对方厚势挑起战斗，风险偏好与对抗性都很强" },
  { rect: { x0: 5, y0: 0, x1: 8, y1: 3 }, delta: { riskAppetite: +15, conflictResponse: +18, rationality: -5, focus: -5 }, rationale: "主动靠近对方厚势挑起战斗，风险偏好与对抗性都很强" },
];

const BEGINNER_3_HEATMAP: HeatZone[] = [
  // 正面迎击
  { rect: { x0: 3, y0: 3, x1: 5, y1: 5 }, delta: { conflictResponse: +25, riskAppetite: +10, rationality: -8, resilience: +5 }, rationale: "面对挑衅选择正面迎击，攻击性强，冲突应对模式偏对抗" },
  // 侧面反击
  { rect: { x0: 3, y0: 0, x1: 5, y1: 2 }, delta: { conflictResponse: +10, rationality: +8, focus: +5 }, rationale: "不正面硬碰，而是从侧面施压，理性中保留反击空间" },
  { rect: { x0: 3, y0: 6, x1: 5, y1: 8 }, delta: { conflictResponse: +10, rationality: +8, focus: +5 }, rationale: "不正面硬碰，而是从侧面施压，理性中保留反击空间" },
  // 退让稳守
  { rect: { x0: 0, y0: 3, x1: 2, y1: 5 }, delta: { conflictResponse: -20, rationality: +10, resilience: +8 }, rationale: "面对挑衅选择退让巩固，避免正面冲突，重视全局安定" },
  // 大幅逃离/回避
  { rect: { x0: 0, y0: 0, x1: 2, y1: 2 }, delta: { conflictResponse: -25, riskAppetite: -10, focus: -8, resilience: -10 }, rationale: "大幅退让甚至逃离战场，对冲突有较强回避倾向，抗压也受损" },
  { rect: { x0: 0, y0: 6, x1: 2, y1: 8 }, delta: { conflictResponse: -25, riskAppetite: -10, focus: -8, resilience: -10 }, rationale: "大幅退让甚至逃离战场，对冲突有较强回避倾向，抗压也受损" },
];

const BEGINNER_4_HEATMAP: HeatZone[] = [
  // 主战场劫争到底
  { rect: { x0: 5, y0: 0, x1: 8, y1: 4 }, delta: { focus: -20, resilience: +10, conflictResponse: +10, rationality: -15 }, rationale: "紧盯主战场劫争不放，隧道视野明显，难以接受局部受损" },
  // 侧翼转移
  { rect: { x0: 0, y0: 5, x1: 4, y1: 8 }, delta: { focus: +25, rationality: +10, riskAppetite: +5, resilience: +3 }, rationale: "放弃主战场劫争，转而攻击侧翼，展现灵活的多任务应变能力" },
  // 中间犹豫
  { rect: { x0: 3, y0: 3, x1: 5, y1: 5 }, delta: { focus: +5, rationality: -8, conflictResponse: -5 }, rationale: "既想处理劫争又想照顾侧翼，犹豫不决，缺乏明确优先级" },
  // 彻底慌乱逃离
  { rect: { x0: 0, y0: 0, x1: 2, y1: 2 }, delta: { focus: -15, rationality: -15, resilience: -15, riskAppetite: -10 }, rationale: "两边都放弃，选择远离战场的角落，显示慌乱与抗压不足" },
  { rect: { x0: 6, y0: 6, x1: 8, y1: 8 }, delta: { focus: -15, rationality: -15, resilience: -15, riskAppetite: -10 }, rationale: "两边都放弃，选择远离战场的角落，显示慌乱与抗压不足" },
];

export const DEFAULT_SCENARIO_CONFIG: ScenarioConfig[] = [
  {
    scenario: {
      id: "lifeDeath",
      index: 1,
      copy: {
        beginner: {
          title: "困",
          subtitle: "困境抉择",
          prompt: "你的一支小队被困在峡谷底部，上方有敌人重兵把守。你决定？",
          hint: "红色区域：继续救援被困小队  ·  蓝色区域：放弃小队，另寻出路",
          optionA: "继续救援",
          optionB: "放弃转移",
          optionAPos: { x: 5, y: 7 },
          optionBPos: { x: 6, y: 3 },
        },
        skilled: {
          title: "困",
          subtitle: "死活困境",
          prompt: "黑棋二路被白棋三路厚壁压制，左边已被封住。你选择？",
          hint: "A. 继续爬二路试图突围  B. 弃子封外，在外围构筑厚势",
        },
      },
      boards: {
        beginner: BEGINNER_1_LIFEDEATH_BOARD,
        skilled: {
          stones: stones9to13(BEGINNER_1_LIFEDEATH_BOARD.stones),
          focus: BEGINNER_1_LIFEDEATH_BOARD.focus ? s9to13(BEGINNER_1_LIFEDEATH_BOARD.focus) : undefined,
        },
      },
    },
    heatmaps: {
      beginner: BEGINNER_1_HEATMAP,
      skilled: BEGINNER_1_HEATMAP.map((z) => ({ ...z, rect: rect9to13(z.rect) })),
    },
  },
  {
    scenario: {
      id: "opening",
      index: 2,
      copy: {
        beginner: {
          title: "始",
          subtitle: "开局策略",
          prompt: "面对一个全新的机会，你更想先拿到手的好处，还是先占住有利位置？",
          hint: "红色区域：先拿到确定的好处  ·  蓝色区域：先占据中心有利位置",
          optionA: "拿到手再说",
          optionB: "占住中心",
          optionAPos: { x: 2, y: 2 },
          optionBPos: { x: 4, y: 4 },
        },
        skilled: {
          title: "始",
          subtitle: "布局偏好",
          prompt: "面对全新的项目启动期，你更倾向于哪种开局策略？",
          hint: "A. 稳扎稳打先拿实地  B. 布局宏大占据中央",
        },
      },
      boards: {
        beginner: BEGINNER_2_OPENING_BOARD,
        skilled: {
          stones: stones9to13(BEGINNER_2_OPENING_BOARD.stones),
          focus: BEGINNER_2_OPENING_BOARD.focus ? s9to13(BEGINNER_2_OPENING_BOARD.focus) : undefined,
        },
      },
    },
    heatmaps: {
      beginner: BEGINNER_2_HEATMAP,
      skilled: BEGINNER_2_HEATMAP.map((z) => ({ ...z, rect: rect9to13(z.rect) })),
    },
  },
  {
    scenario: {
      id: "invasion",
      index: 3,
      copy: {
        beginner: {
          title: "侵",
          subtitle: "冲突应对",
          prompt: "对方突然对你提出了不合理且带有挑衅的要求，你的第一反应是？",
          hint: "红色区域：正面硬碰硬顶回去  ·  蓝色区域：退让一步，稳住阵脚",
          optionA: "正面迎击",
          optionB: "退让稳守",
          optionAPos: { x: 4, y: 4 },
          optionBPos: { x: 0, y: 4 },
        },
        skilled: {
          title: "侵",
          subtitle: "侵犯应对",
          prompt: "对方突然对你提出了不合理且带有挑衅性质的竞争要求，你的第一反应是？",
          hint: "A. 正面迎头痛击  B. 退让一步稳住阵脚",
        },
      },
      boards: {
        beginner: BEGINNER_3_INVASION_BOARD,
        skilled: {
          stones: stones9to13(BEGINNER_3_INVASION_BOARD.stones),
          focus: BEGINNER_3_INVASION_BOARD.focus ? s9to13(BEGINNER_3_INVASION_BOARD.focus) : undefined,
        },
      },
    },
    heatmaps: {
      beginner: BEGINNER_3_HEATMAP,
      skilled: BEGINNER_3_HEATMAP.map((z) => ({ ...z, rect: rect9to13(z.rect) })),
    },
  },
  {
    scenario: {
      id: "ko",
      index: 4,
      copy: {
        beginner: {
          title: "劫",
          subtitle: "多线取舍",
          prompt: "你和一个对手在争执一件小事，僵持不下。这时另一个机会出现了，你会？",
          hint: "红色区域：继续争执到底  ·  蓝色区域：放手争议，抓住新机会",
          optionA: "争执到底",
          optionB: "转向新机",
          optionAPos: { x: 6, y: 1 },
          optionBPos: { x: 5, y: 7 },
        },
        skilled: {
          title: "劫",
          subtitle: "劫争转换",
          prompt: "你与竞争对手在主战场陷入了焦灼的拉锯战，此时对方在侧翼发起了骚扰，你会？",
          hint: "A. 紧盯主战场必须打赢  B. 避其锋芒换取侧翼开花",
        },
      },
      boards: {
        beginner: BEGINNER_4_KO_BOARD,
        skilled: {
          stones: stones9to13(BEGINNER_4_KO_BOARD.stones),
          focus: BEGINNER_4_KO_BOARD.focus ? s9to13(BEGINNER_4_KO_BOARD.focus) : undefined,
        },
      },
    },
    heatmaps: {
      beginner: BEGINNER_4_HEATMAP,
      skilled: BEGINNER_4_HEATMAP.map((z) => ({ ...z, rect: rect9to13(z.rect) })),
    },
  },
];

