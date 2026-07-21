import { SYSTEM_PROMPT, buildUserPrompt } from "./prompts.js";
import type { RadarData } from "@shared/types";

const DEFAULT_BASE_URL = "https://api.deepseek.com";
const DEFAULT_MODEL = "deepseek-chat";
const TIMEOUT_MS = 15000;

interface DeepSeekResponse {
  headline: string;
  comment: string;
}

interface PromptInput {
  tags: string[];
  radar: RadarData;
  rationales: string[];
}

/** 是否配置了 DeepSeek key */
export function hasDeepSeekKey(): boolean {
  return !!process.env.DEEPSEEK_API_KEY;
}

/** 调用 DeepSeek Chat Completions，解析 JSON */
export async function callDeepSeek(input: PromptInput): Promise<DeepSeekResponse> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const baseUrl = process.env.DEEPSEEK_BASE_URL || DEFAULT_BASE_URL;
  const model = process.env.DEEPSEEK_MODEL || DEFAULT_MODEL;

  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY 未配置");
  }

  const userPrompt = buildUserPrompt(input);
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
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.85,
        max_tokens: 600,
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      throw new Error(`DeepSeek HTTP ${res.status}: ${await res.text()}`);
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("DeepSeek 返回内容为空");
    }

    return parseDeepSeekJson(content);
  } finally {
    clearTimeout(timer);
  }
}

/** 容错解析 DeepSeek 返回的 JSON */
function parseDeepSeekJson(content: string): DeepSeekResponse {
  let text = content.trim();
  // 去掉可能的 ```json 包裹
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  }
  try {
    const obj = JSON.parse(text);
    if (!obj.headline || !obj.comment) {
      throw new Error("缺少必要字段");
    }
    return { headline: String(obj.headline), comment: String(obj.comment) };
  } catch (err) {
    throw new Error(`DeepSeek JSON 解析失败: ${(err as Error).message}`);
  }
}
