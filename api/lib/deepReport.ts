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

  // 大局与局部
  if (radar.bigPicture >= 70 && radar.sunkCost <= 40) {
    insights.push("大局观强且不被沉没成本束缚，能在关键时刻做出取舍");
  }
  if (radar.bigPicture <= 35 && radar.sunkCost >= 60) {
    insights.push("容易被局部得失牵绊，难以跳出来看全局");
  }
  if (radar.bigPicture >= 60 && radar.controlDesire >= 60) {
    insights.push("既有全局视野又有掌控欲，善于主导局面走向");
  }

  // 风险与收益
  if (radar.riskAppetite >= 70 && radar.emotionalStability <= 40) {
    insights.push("敢于冒险但情绪稳定性不足，容易在压力下做出冲动决策");
  }
  if (radar.riskAppetite <= 35 && radar.patience >= 60) {
    insights.push("稳健而耐心，适合长期主义但可能错过爆发性机会");
  }
  if (radar.riskAppetite >= 60 && radar.decisiveness >= 60) {
    insights.push("风险偏好与决断力兼具，面对机会时能快速出手");
  }

  // 进攻与退让
  if (radar.riskAppetite >= 70 && radar.cooperation <= 40) {
    insights.push("进攻性强，但在冲突中容易把对抗作为首选");
  }
  if (radar.cooperation >= 60 && radar.controlDesire <= 40) {
    insights.push("善于退让与协调，但需警惕在关键利益上过度妥协");
  }
  if (radar.riskAppetite >= 50 && radar.cooperation >= 50) {
    insights.push("攻守平衡，懂得在对抗与合作之间灵活切换");
  }

  if (insights.length === 0) {
    insights.push("你的决策风格较为均衡，没有极端偏向");
  }

  return {
    strengths: strengths.slice(0, 3),
    weaknesses: weaknesses.slice(0, 3),
    insights: insights.slice(0, 5),
  };
}