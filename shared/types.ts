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

/** 性格雷达 8 维数据（0-100） */
export interface RadarData {
  sunkCost: number; // 沉没成本谬误
  riskAppetite: number; // 风险偏好
  bigPicture: number; // 大局观
  decisiveness: number; // 决断力
  controlDesire: number; // 掌控欲
  emotionalStability: number; // 情绪稳定性
  cooperation: number; // 合作倾向
  innovation: number; // 创新思维
  patience: number; // 耐心程度
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

/** 单关残局文案配置 */
export interface ScenarioCopy {
  title: string; // 「围」
  subtitle: string; // 「团队被围」
  prompt: string; // 情境文案
  hint: string; // 落子提示
  /** A/B 选项在棋盘上的标签，仅用于零基础模式 */
  optionA?: string;
  optionB?: string;
}

/** 单关残局配置 */
export interface Scenario {
  id: PuzzleId;
  index: number; // 1-4
  /** 两套文案：beginner=零基础，skilled=入门用户 */
  copy: Record<"beginner" | "skilled", ScenarioCopy>;
  /** 棋盘 9x9 的预设残局（黑=B，白=W） */
  stones: PlacedStone[];
  /** 棋盘最关键的视觉中心点（用于 highlight） */
  focus?: Coord;
}
