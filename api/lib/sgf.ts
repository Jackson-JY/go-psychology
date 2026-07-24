/**
 * 轻量级 SGF 解析器
 * 提取棋盘大小、落子序列、让子等基础信息
 */

export interface SgfMove {
  color: "B" | "W";
  x: number;
  y: number;
}

export interface ParsedSgf {
  boardSize: number;
  moves: SgfMove[];
  handicap: number;
  playerBlack?: string;
  playerWhite?: string;
  result?: string;
  komi?: number;
}

/** SGF 坐标字母转数字：a=0, b=1, ...（SGF 不跳 i） */
function charToNum(c: string): number {
  const code = c.charCodeAt(0);
  if (code >= 97 && code <= 122) return code - 97; // a-z
  if (code >= 65 && code <= 90) return code - 65; // A-Z
  return -1;
}

/** 解析单条属性值，如 SZ[19] → "19" */
function extractProp(content: string, prop: string): string | undefined {
  const regex = new RegExp(`${prop}\\[([^\\]]*)\\]`);
  const match = content.match(regex);
  return match ? match[1] : undefined;
}

/**
 * 解析 SGF 文件内容
 * 支持标准 FF[4] 格式，兼容 9/13/19 路棋盘
 */
export function parseSgf(content: string): ParsedSgf {
  const cleaned = content.replace(/\s+/g, "").replace(/\n|\r/g, "");

  // 棋盘大小
  const szRaw = extractProp(cleaned, "SZ");
  const boardSize = szRaw ? parseInt(szRaw, 10) : 19;

  // 让子数
  const haRaw = extractProp(cleaned, "HA");
  const handicap = haRaw ? parseInt(haRaw, 10) : 0;

  // 玩家信息
  const playerBlack = extractProp(cleaned, "PB");
  const playerWhite = extractProp(cleaned, "PW");
  const result = extractProp(cleaned, "RE");
  const kmRaw = extractProp(cleaned, "KM");
  const komi = kmRaw ? parseFloat(kmRaw) : undefined;

  // 提取落子序列
  const moves: SgfMove[] = [];
  const moveRegex = /;([BW])\[([a-z]{0,2})\]/gi;
  let match: RegExpExecArray | null;

  while ((match = moveRegex.exec(cleaned)) !== null) {
    const color = match[1].toUpperCase() as "B" | "W";
    const coord = match[2];

    // 空坐标 = 停一手（跳过）
    if (!coord || coord.length !== 2) continue;

    const x = charToNum(coord[0]);
    const y = charToNum(coord[1]);

    if (x >= 0 && x < boardSize && y >= 0 && y < boardSize) {
      moves.push({ color, x, y });
    }
  }

  return { boardSize, moves, handicap, playerBlack, playerWhite, result, komi };
}

/**
 * 简易 SGF 生成器（用于测试）
 */
export function generateSgf(
  boardSize: number,
  moves: SgfMove[],
  meta: { pb?: string; pw?: string; re?: string } = {},
): string {
  const lines = [
    "(;GM[1]FF[4]",
    `SZ[${boardSize}]`,
    meta.pb ? `PB[${meta.pb}]` : "",
    meta.pw ? `PW[${meta.pw}]` : "",
    meta.re ? `RE[${meta.re}]` : "",
  ];

  for (const m of moves) {
    const xc = String.fromCharCode(97 + m.x);
    const yc = String.fromCharCode(97 + m.y);
    lines.push(`;${m.color}[${xc}${yc}]`);
  }

  lines.push(")");
  return lines.filter(Boolean).join("");
}
