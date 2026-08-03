// 前后端共享的类型定义

/** 4 关残局 ID */
export type PuzzleId = "lifeDeath" | "opening" | "invasion" | "ko";

/** 围棋交叉点坐标（0-8） */
export interface Coord {
  x: number;
  y: number;
}

/** 棋子颜色 */
export type StoneColor = "B" | "W";

/** 棋盘上预设的残局落子 */
export interface PlacedStone extends Coord {
  color: StoneColor;
}

/** 一次用户落子记录 */
export interface MoveRecord extends Coord {
  puzzleId: PuzzleId;
  elapsedMs: number; // 思考时长（毫秒）
}

/** 性格雷达 5 维数据（0-100），与 SGF 棋谱分析保持一致 */
export interface RadarData {
  riskAppetite: number; // 风险偏好（激进 vs 保守）
  resilience: number; // 逆境抗压
  rationality: number; // 决策理性度（越高越理性，低=沉没成本）
  conflictResponse: number; // 冲突应对（高=对抗型，低=妥协型）
  focus: number; // 长效专注力
}

/** 用户围棋经验水平 */
export type ExperienceLevel = "beginner" | "skilled";

/** /api/analyze 请求体 */
export interface AnalyzeRequest {
  moves: MoveRecord[];
  experienceLevel?: ExperienceLevel;
}

/** MBTI 结果 */
export interface MbtiData {
  type: string; // e.g. "INTJ"
  letters: {
    ei: "E" | "I";
    sn: "S" | "N";
    tf: "T" | "F";
    jp: "J" | "P";
  };
  scores: {
    ei: number;
    sn: number;
    tf: number;
    jp: number;
  };
  title: string;
  subtitle: string;
}

/** Big Five 大五人格结果 */
export interface BigFiveData {
  openness: number; // 开放性
  conscientiousness: number; // 尽责性
  extraversion: number; // 外向性
  agreeableness: number; // 宜人性
  neuroticism: number; // 神经质/情绪稳定性
  type: string; // 类型名称
  description: string;
}

/** 投资风格分析 */
export interface InvestmentStyle {
  type: string; // 风格类型
  riskLevel: "conservative" | "moderate" | "aggressive"; // 风险等级
  suitableStrategies: string[]; // 适合的投资策略
  pitfalls: string[]; // 常见误区
  recommendations: string[]; // 建议
}

/** 职场建议 */
export interface CareerAdvice {
  suitableRoles: string[]; // 适合的岗位
  leadershipStyle: string; // 领导力风格
  collaborationStyle: string; // 协作风格
  growthAreas: string[]; // 成长领域
}

/** 热力图数据 */
export interface HeatmapData {
  grid: number[][]; // 9x9 热力值网格
  peaks: { x: number; y: number; value: number }[]; // 峰值点
}

/** 深度分析报告 */
export interface DeepReport {
  strengths: { dimension: string; score: number; description: string }[]; // 优势
  weaknesses: { dimension: string; score: number; description: string }[]; // 待改进
  insights: string[]; // 关键洞察
}

/** /api/analyze 响应体 */
export interface AnalyzeResponse {
  radar: RadarData;
  tags: string[];
  comment: string;
  headline: string;
  source: "deepseek" | "mock";
  mbti: MbtiData;
  bigFive: BigFiveData;
  investment: InvestmentStyle;
  career: CareerAdvice;
  heatmap: HeatmapData;
  deepReport: DeepReport;
}

/** /api/analyze-sgf 响应体 */
export interface SgfAnalysisResponse {
  radar: {
    riskAppetite: number;
    resilience: number;
    rationality: number;
    conflictResponse: number;
    focus: number;
  };
  tags: string[];
  keyMoments: {
    moveNumber: number;
    color: "B" | "W";
    x: number;
    y: number;
    type: string;
    description: string;
  }[];
  moveCount: number;
  boardSize: number;
  heatmap: HeatmapData;
  analyzedColor: "B" | "W";
  /** 图片分析时的额外备注 */
  imageNotes?: string;
  /** 数据来源：vision=视觉识别, mock=模拟数据, sgf=直接上传 */
  source?: "vision" | "mock" | "sgf";
  /** 图片是否识别出原始手数 */
  hasMoveNumbers?: boolean;
}

/** 单关残局文案配置 */
export interface ScenarioCopy {
  title: string; // 「围」
  subtitle: string; // 「团队被围」
  prompt: string; // 情境文案
  hint: string; // 落子提示
  /** A/B 选项在棋盘上的标签，仅用于零基础模式 */
  optionA?: string;
  optionB?: string;
  /** A/B 选项在 9×9 棋盘上的提示位置，仅用于零基础模式 */
  optionAPos?: Coord;
  optionBPos?: Coord;
}

/** 棋盘级别的配置（棋子、焦点等） */
export interface BoardConfig {
  /** 棋盘上的预设残局（黑=B，白=W） */
  stones: PlacedStone[];
  /** 棋盘最关键的视觉中心点（用于 highlight） */
  focus?: Coord;
}

/** 单关残局配置 */
export interface Scenario {
  id: PuzzleId;
  index: number; // 1-4
  /** 两套文案：beginner=零基础，skilled=入门用户 */
  copy: Record<"beginner" | "skilled", ScenarioCopy>;
  /** 两套棋盘配置：beginner=9×9，skilled=13×13 */
  boards: Record<"beginner" | "skilled", BoardConfig>;
}
