import type { RadarData, DeepReport } from "@shared/types";

const DIMENSION_LABELS: Record<keyof RadarData, string> = {
  sunkCost: "沉没成本",
  riskAppetite: "风险偏好",
  bigPicture: "大局观",
  decisiveness: "决断力",
  controlDesire: "掌控欲",
  emotionalStability: "情绪稳定性",
  cooperation: "合作倾向",
  innovation: "创新思维",
  patience: "耐心程度",
};

const DIMENSION_DESCRIPTIONS: Record<keyof RadarData, { high: string; low: string }> = {
  sunkCost: {
    high: "难以割舍过去的投入，容易陷入沉没成本陷阱",
    low: "能够理性看待损失，懂得及时止损",
  },
  riskAppetite: {
    high: "敢于冒险追求高回报，享受挑战带来的刺激",
    low: "偏好稳健安全，注重风险控制",
  },
  bigPicture: {
    high: "善于从全局视角思考，关注长远利益",
    low: "更关注眼前细节，注重当下利益",
  },
  decisiveness: {
    high: "决策果断，行动迅速，不拖泥带水",
    low: "决策谨慎，倾向深思熟虑，避免冲动",
  },
  controlDesire: {
    high: "希望掌控局面，倾向主导决策过程",
    low: "善于放手，愿意授权他人",
  },
  emotionalStability: {
    high: "情绪稳定，面对压力能够保持冷静",
    low: "情绪波动较大，容易受外界影响",
  },
  cooperation: {
    high: "乐于合作，善于团队协作",
    low: "倾向独立工作，注重个人空间",
  },
  innovation: {
    high: "思维开放，善于发现新机会",
    low: "遵循传统，偏好稳健可靠的方法",
  },
  patience: {
    high: "耐心持久，能够等待长期价值",
    low: "追求效率，希望快速看到结果",
  },
};

export function generateDeepReport(radar: RadarData): DeepReport {
  const dimensions = Object.entries(radar) as [keyof RadarData, number][];
  
  const strengths = dimensions
    .filter(([, score]) => score >= 65)
    .map(([key, score]) => ({
      dimension: DIMENSION_LABELS[key],
      score,
      description: DIMENSION_DESCRIPTIONS[key].high,
    }))
    .sort((a, b) => b.score - a.score);

  const weaknesses = dimensions
    .filter(([, score]) => score <= 35)
    .map(([key, score]) => ({
      dimension: DIMENSION_LABELS[key],
      score,
      description: DIMENSION_DESCRIPTIONS[key].low,
    }))
    .sort((a, b) => a.score - b.score);

  const insights: string[] = [];

  if (radar.bigPicture >= 70 && radar.decisiveness >= 70) {
    insights.push("战略视野与执行能力兼备，是难得的决策者特质");
  }
  if (radar.riskAppetite >= 70 && radar.patience <= 35) {
    insights.push("高风险偏好但缺乏耐心，容易在市场波动中被情绪左右");
  }
  if (radar.cooperation >= 70 && radar.controlDesire <= 35) {
    insights.push("天生的团队合作者，善于倾听但需要提升决策主导能力");
  }
  if (radar.sunkCost >= 70) {
    insights.push("强烈的损失厌恶可能导致在错误方向上继续投入");
  }
  if (radar.innovation >= 70 && radar.bigPicture >= 65) {
    insights.push("创新思维与大局观结合，善于发现蓝海机会");
  }
  if (radar.emotionalStability >= 70 && radar.patience >= 60) {
    insights.push("强大的情绪管理能力让你在压力下保持冷静，是长期主义者");
  }
  if (radar.decisiveness >= 70 && radar.riskAppetite <= 35) {
    insights.push("果断但保守，善于在安全范围内做出最优选择");
  }
  if (radar.controlDesire >= 70 && radar.cooperation <= 35) {
    insights.push("掌控欲强但合作意愿低，可能影响团队协同效率");
  }
  if (strengths.length === 0 && weaknesses.length === 0) {
    insights.push("各项特质均衡发展，善于根据不同情境灵活调整策略");
  }

  return {
    strengths: strengths.slice(0, 3),
    weaknesses: weaknesses.slice(0, 3),
    insights: insights.slice(0, 5),
  };
}