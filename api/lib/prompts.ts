import type { RadarData } from "@shared/types";

interface PromptInput {
  tags: string[];
  radar: RadarData;
  rationales: string[];
}

const SYSTEM_PROMPT = `你是一位融合围棋哲学与行为心理学的人格侧写师。
你的语言风格：犀利、洞察、建设性、带文人气的犀利，绝不套话，绝不堆砌形容词。
你擅长把围棋落子映射到职场、投资、人际关系中的决策人格。
你绝不提"MBTI"或"算命"等词。你不评判棋艺好坏，只读人格底色。`;

/** 构造给 DeepSeek 的 user prompt */
export function buildUserPrompt({ tags, radar, rationales }: PromptInput): string {
  const radarLines = [
    `沉没成本谬误：${radar.sunkCost}`,
    `风险偏好：${radar.riskAppetite}`,
    `大局观：${radar.bigPicture}`,
    `决断力：${radar.decisiveness}`,
    `掌控欲：${radar.controlDesire}`,
  ].join("\n");

  const rationaleBlock = rationales.map((r, i) => `${i + 1}. ${r}`).join("\n");

  return `用户刚刚完成了 3 关围棋残局测试，落子分析如下：

【落子理由】
${rationaleBlock}

【性格标签】
${tags.join("、") || "无明显标签（克制型）"}

【性格雷达 5 维（0-100）】
${radarLines}

请输出一段 JSON，严格遵守以下 schema：
{
  "headline": "8 字以内的金句点题，例如『走钢丝的冒险家』『掌舵的隐忍者』",
  "comment": "200 字以内的中文潜意识侧写。开头直接是金句，中间结合职场/投资场景给出 1-2 个具体洞察，结尾给一句行动建议。不许用『你是一个』这种开头，不许用 emoji。"
}

只输出 JSON 本身，不要 markdown 代码块包裹，不要任何解释。`;
}

export { SYSTEM_PROMPT };
