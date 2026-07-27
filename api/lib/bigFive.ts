import type { RadarData, BigFiveData } from "@shared/types";

interface BigFiveResult {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  type: string;
  description: string;
}

const BIGFIVE_TYPES: Record<string, { type: string; description: string }> = {
  O: { type: "创意探索型", description: "好奇心旺盛，乐于尝试新事物，思维开放" },
  C: { type: "尽责严谨型", description: "自律可靠，追求卓越，善于规划与执行" },
  E: { type: "活力外向型", description: "善于社交，精力充沛，享受与人互动" },
  A: { type: "亲和助人型", description: "温和友善，乐于助人，重视人际关系" },
  N: { type: "敏感细腻型", description: "情感丰富，对环境敏感，善于觉察细节" },
  O_C: { type: "战略创新型", description: "既有创新思维，又能严谨执行，平衡理想与现实" },
  O_E: { type: "社交创意型", description: "善于将创意分享给他人，是团队中的灵感来源" },
  C_A: { type: "可靠协作型", description: "既尽责可靠，又善于与人合作，是团队的稳定器" },
  E_A: { type: "团队凝聚型", description: "外向开朗且乐于助人，是团队的粘合剂" },
  C_N: { type: "细致谨慎型", description: "严谨细致且敏感细腻，善于处理复杂细节" },
  O_A: { type: "理想协作型", description: "开放包容且亲和助人，追求共同成长" },
  default: { type: "均衡发展型", description: "各项特质均衡，善于根据情境灵活调整" },
};

function determineType(scores: { O: number; C: number; E: number; A: number; N: number }): string {
  const sorted = Object.entries(scores)
    .filter(([k]) => k !== "N")
    .sort((a, b) => b[1] - a[1]);

  const top1 = sorted[0][0];
  const top2 = sorted[1][0];
  const top1Score = sorted[0][1];
  const top2Score = sorted[1][1];

  if (top1Score >= 70 && top2Score >= 60) {
    return `${top1}_${top2}`;
  }
  if (top1Score >= 75) {
    return top1;
  }
  return "default";
}

/**
 * 将 5 维雷达数据映射为 BigFive 分数
 *
 * 映射逻辑（与 SGF 五维保持一致）：
 * - O(开放性): 风险偏好 + 专注 → 愿意尝试新事物、思维开放
 * - C(尽责性): 理性 + 专注 + 抗压 → 自律、可靠、善于规划
 * - E(外向性): 风险偏好 + 冲突应对 → 善于社交、精力充沛
 * - A(宜人性): 冲突应对反向 + 抗压 → 温和友善、乐于助人
 * - N(神经质): 抗压反向 + 理性反向 → 情绪波动、敏感
 */
export function mapRadarToBigFive(radar: RadarData): BigFiveResult {
  const { riskAppetite, resilience, rationality, conflictResponse, focus } = radar;

  const O = Math.round((riskAppetite * 0.5 + focus * 0.3 + (100 - rationality) * 0.2));
  const C = Math.round((rationality * 0.4 + focus * 0.4 + resilience * 0.2));
  const E = Math.round((riskAppetite * 0.5 + conflictResponse * 0.5));
  const A = Math.round(((100 - conflictResponse) * 0.6 + resilience * 0.4));
  const N = Math.round(((100 - resilience) * 0.6 + (100 - rationality) * 0.4));

  const typeKey = determineType({ O, C, E, A, N });
  const meta = BIGFIVE_TYPES[typeKey] || BIGFIVE_TYPES.default;

  return {
    openness: O,
    conscientiousness: C,
    extraversion: E,
    agreeableness: A,
    neuroticism: N,
    type: meta.type,
    description: meta.description,
  };
}