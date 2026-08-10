import type { RadarData } from "@shared/types";

interface PromptInput {
  tags: string[];
  radar: RadarData;
  rationales: string[];
  experienceLevel?: "beginner" | "skilled";
}

const SYSTEM_PROMPT = `你是一位融合围棋哲学与行为心理学的人格侧写师。
你的语言风格：锋利如手术刀，不绕弯，不粉饰，每句话都要戳中用户的防御机制。
你擅长从围棋的"大局与局部"、"风险与收益"、"进攻与退让"三个维度，映射出一个人面对现实困境时的潜意识倾向。
你绝不提"MBTI"或"算命"等词。你不评判棋艺好坏，只撕开人格底色。
分析时聚焦于：损失厌恶、过度自信、控制欲、沉没成本、逃避冲突、执行乏力等核心痛点。`;

/** 构造给 DeepSeek 的 user prompt */
export function buildUserPrompt({ tags, radar, rationales, experienceLevel }: PromptInput): string {
  const radarLines = [
    `风险偏好：${radar.riskAppetite}`,
    `逆境抗压：${radar.resilience}`,
    `决策理性度：${radar.rationality}`,
    `冲突应对：${radar.conflictResponse}`,
    `长效专注：${radar.focus}`,
  ].join("\n");

  const rationaleBlock = rationales.map((r, i) => `${i + 1}. ${r}`).join("\n");

  const levelHint = experienceLevel === "beginner"
    ? "该用户是零基础围棋用户，测试时用生活化场景理解题目。请用更生活化、易懂的语言输出，少用围棋专业术语，多使用日常比喻。"
    : "该用户了解围棋基本规则，可以用围棋思维和术语进行表达。";

  return `用户刚刚完成了 4 关围棋决策测试，每关都需在"大局与局部"、"风险与收益"、"进攻与退让"之间做出选择。${levelHint}

【落子理由】
${rationaleBlock}

【性格标签】
${tags.join("、") || "无明显标签（克制型）"}

【性格雷达 5 维（0-100）】
${radarLines}

请输出一段 JSON，严格遵守以下 schema：
{
  "headline": "8 字以内的金句点题，例如『走钢丝的冒险家』『掌舵的隐忍者』",
  "comment": "200 字以内的中文潜意识侧写。开头一句刺痛性金句，直接点出用户的防御机制或潜意识陷阱；中间结合"大局与局部"、"风险与收益"、"进攻与退让"中的 1-2 个维度给出具体洞察，聚焦损失厌恶、过度自信、控制欲、沉没成本、逃避冲突、执行乏力等核心痛点；结尾给一句可执行的行动建议。不许用『你是一个』这种开头，不许用 emoji，不许泛泛而谈。"
}

只输出 JSON 本身，不要 markdown 代码块包裹，不要任何解释。`;
}

export { SYSTEM_PROMPT };
