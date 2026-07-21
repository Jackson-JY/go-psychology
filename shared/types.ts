// 前后端共享的类型定义

/** 3 关残局 ID */
export type PuzzleId = "siege" | "greed" | "overall";

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

/** 性格雷达 5 维数据（0-100） */
export interface RadarData {
  sunkCost: number; // 沉没成本谬误
  riskAppetite: number; // 风险偏好
  bigPicture: number; // 大局观
  decisiveness: number; // 决断力
  controlDesire: number; // 掌控欲
}

/** /api/analyze 请求体 */
export interface AnalyzeRequest {
  moves: MoveRecord[];
}

/** /api/analyze 响应体 */
export interface AnalyzeResponse {
  radar: RadarData;
  tags: string[];
  comment: string;
  headline: string;
  source: "deepseek" | "mock";
}

/** 单关残局配置 */
export interface Scenario {
  id: PuzzleId;
  index: number; // 1-3
  title: string; // 「围」
  subtitle: string; // 「团队被围」
  prompt: string; // 情境文案
  hint: string; // 落子提示
  /** 棋盘 9x9 的预设残局（黑=B，白=W） */
  stones: PlacedStone[];
  /** 棋盘最关键的视觉中心点（用于 highlight） */
  focus?: Coord;
}
