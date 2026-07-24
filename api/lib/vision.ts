/**
 * 视觉识别模块：将围棋棋盘图片转换为 SGF
 * 支持 OpenAI-compatible API（OpenAI GPT-4o、通义千问 Qwen-VL 等）
 */

const DEFAULT_BASE_URL = "https://api.openai.com";
const DEFAULT_MODEL = "gpt-4o";
const TIMEOUT_MS = 30000;

export interface VisionApiResponse {
  boardSize: number;
  hasMoveNumbers: boolean;
  moves: {
    moveNumber: number;
    color: "B" | "W";
    coord: string;
    estimated?: boolean;
  }[];
  blackStones: string[];
  whiteStones: string[];
  sgf?: string;
  notes?: string;
}

/** 是否配置了视觉识别 API key */
export function hasVisionKey(): boolean {
  return !!process.env.VISION_API_KEY;
}

/** 调用视觉 API 分析棋盘图片 */
export async function analyzeBoardImage(
  base64Image: string,
): Promise<VisionApiResponse> {
  const apiKey = process.env.VISION_API_KEY;
  const baseUrl = process.env.VISION_BASE_URL || DEFAULT_BASE_URL;
  const model = process.env.VISION_MODEL || DEFAULT_MODEL;

  if (!apiKey) {
    throw new Error("VISION_API_KEY 未配置");
  }

  const prompt = `You are a Go board image analyzer. Examine the provided image carefully.

1. Determine the board size (9x9, 13x13, or 19x19).
2. Identify EVERY stone on the board and its color (black/white).
3. If stones have move numbers visible, record them in order.
4. If NO move numbers are visible, try to estimate the likely move order based on Go opening theory (corner moves first, then sides, then center). Mark estimated moves with "estimated": true.
5. Return your analysis as a JSON object with this exact structure:
{
  "boardSize": 19,
  "hasMoveNumbers": true,
  "moves": [
    {"moveNumber": 1, "color": "B", "coord": "dd", "estimated": false},
    {"moveNumber": 2, "color": "W", "coord": "qq", "estimated": false}
  ],
  "blackStones": ["dd", "qq", "dp"],
  "whiteStones": ["pd", "dq", "pp"],
  "sgf": "(;SZ[19]KM[7.5];B[dd];W[qq];B[dp]...)",
  "notes": "Any observations about the board position"
}

Rules:
- Coordinates use SGF format: 'a' = first line. For 19x19, 'a' to 's'. 'aa' = top-left corner from viewer's perspective, 'ss' = bottom-right.
- 'B' = Black, 'W' = White.
- The SGF string should include SZ[boardSize] and all moves in order.
- If you cannot determine a move order, return hasMoveNumbers: false and an empty moves array, but still include all stones in blackStones/whiteStones.
- Return ONLY valid JSON, no markdown code blocks.`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: { url: base64Image, detail: "high" },
              },
            ],
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      throw new Error(`Vision API HTTP ${res.status}: ${await res.text()}`);
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Vision API 返回内容为空");
    }

    return parseVisionJson(content);
  } finally {
    clearTimeout(timer);
  }
}

/** 容错解析视觉 API 返回的 JSON */
function parseVisionJson(content: string): VisionApiResponse {
  let text = content.trim();
  if (text.startsWith("```")) {
    text = text
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/i, "")
      .trim();
  }
  try {
    const obj = JSON.parse(text);
    if (
      !obj.boardSize ||
      !Array.isArray(obj.blackStones) ||
      !Array.isArray(obj.whiteStones)
    ) {
      throw new Error("缺少必要字段");
    }
    return obj as VisionApiResponse;
  } catch (err) {
    throw new Error(
      `Vision API JSON 解析失败: ${(err as Error).message}`,
    );
  }
}

/** Mock fallback：未配置 API key 时返回示例数据 */
export function mockAnalyzeBoardImage(): VisionApiResponse {
  return {
    boardSize: 19,
    hasMoveNumbers: true,
    moves: [
      { moveNumber: 1, color: "B", coord: "dd" },
      { moveNumber: 2, color: "W", coord: "qq" },
      { moveNumber: 3, color: "B", coord: "dp" },
      { moveNumber: 4, color: "W", coord: "pd" },
      { moveNumber: 5, color: "B", coord: "pp" },
      { moveNumber: 6, color: "W", coord: "dq" },
      { moveNumber: 7, color: "B", coord: "qf" },
      { moveNumber: 8, color: "W", coord: "fq" },
      { moveNumber: 9, color: "B", coord: "jc" },
      { moveNumber: 10, color: "W", coord: "cj" },
      { moveNumber: 11, color: "B", coord: "cn" },
      { moveNumber: 12, color: "W", coord: "qn" },
      { moveNumber: 13, color: "B", coord: "jq" },
      { moveNumber: 14, color: "W", coord: "jp" },
      { moveNumber: 15, color: "B", coord: "np" },
      { moveNumber: 16, color: "W", coord: "pj" },
      { moveNumber: 17, color: "B", coord: "qi" },
      { moveNumber: 18, color: "W", coord: "ph" },
      { moveNumber: 19, color: "B", coord: "nm" },
      { moveNumber: 20, color: "W", coord: "mj" },
      { moveNumber: 21, color: "B", coord: "lk" },
      { moveNumber: 22, color: "W", coord: "kk" },
      { moveNumber: 23, color: "B", coord: "kl" },
      { moveNumber: 24, color: "W", coord: "jl" },
      { moveNumber: 25, color: "B", coord: "km" },
      { moveNumber: 26, color: "W", coord: "im" },
      { moveNumber: 27, color: "B", coord: "kn" },
      { moveNumber: 28, color: "W", coord: "jn" },
      { moveNumber: 29, color: "B", coord: "ko" },
      { moveNumber: 30, color: "W", coord: "jo" },
    ],
    blackStones: [
      "dd",
      "dp",
      "pp",
      "qf",
      "jc",
      "cn",
      "jq",
      "np",
      "qi",
      "nm",
      "lk",
      "kl",
      "km",
      "kn",
      "ko",
    ],
    whiteStones: [
      "qq",
      "pd",
      "dq",
      "fq",
      "cj",
      "qn",
      "jp",
      "pj",
      "ph",
      "mj",
      "kk",
      "jl",
      "im",
      "jn",
      "jo",
    ],
    sgf:
      "(;SZ[19]KM[7.5];B[dd];W[qq];B[dp];W[pd];B[pp];W[dq];B[qf];W[fq];B[jc];W[cj];B[cn];W[qn];B[jq];W[jp];B[np];W[pj];B[qi];W[ph];B[nm];W[mj];B[lk];W[kk];B[kl];W[jl];B[km];W[im];B[kn];W[jn];B[ko];W[jo])",
    notes: "Mock 分析：这是一局典型的高中国流布局对二连星。",
  };
}
