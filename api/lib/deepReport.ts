import type { RadarData, DeepReport } from "@shared/types";

/** 5 维雷达维度标签（与 SGF 保持一致） */
const DIMENSION_LABELS: Record<keyof RadarData, string> = {
  riskAppetite: "风险偏好",
  resilience: "逆境抗压",
  rationality: "决策理性",
  conflictResponse: "冲突应对",
  focus: "长效专注",
};

const DIMENSION_DESCRIPTIONS: Record<keyof RadarData, { high: string; low: string }> = {
  riskAppetite: {
    high: "敢于冒险追求高回报，享受挑战带来的刺激",
    low: "偏好稳健安全，注重风险控制",
  },
  resilience: {
    high: "逆境中仍能保持战略定力，不轻易崩盘",
    low: "局势不利时容易心态波动，需要加强抗压训练",
  },
  rationality: {
    high: "能及时止损，不被沉没成本绑架，决策理性",
    low: "容易执着于已投入的成本，难以放手",
  },
  conflictResponse: {
    high: "面对冲突倾向于正面迎战，不畏对抗",
    low: "面对冲突倾向于退让妥协，以和为贵",
  },
  focus: {
    high: "全程保持高度专注，后期失误率控制良好",
    low: "后半盘专注力明显下降，容易出现随手",
  },
};

const BEGINNER_INSIGHTS = {
  rationalityVsRisk: {
    highHigh: "你既理性又敢于冒险，能在控制风险的前提下抓住机会",
    highLow: "你很理性，但过于保守可能让你错过一些值得尝试的机会",
    lowHigh: "你敢于冒险，但决策时容易被情绪带跑，重大决定前多冷静一下",
  },
  conflictVsResilience: {
    highHigh: "你既能正面迎战，又能在压力下稳住，是团队里的定海神针",
    highLow: "你不怕冲突，但压力下容易心态崩，学会在战斗间隙给自己充电",
    lowHigh: "你很能扛压，但有时候太退让了，该争取的利益别轻易放手",
  },
  focusNeutral: {
    high: "你能长时间保持专注，不容易被干扰，这是稀缺的竞争力",
    low: "你容易分心，后半程动力不足，试着把大目标拆成小里程碑",
  },
  neutral: "你的决策风格比较均衡，没有特别极端的偏向",
};

export function generateDeepReport(
  radar: RadarData,
  experienceLevel?: "beginner" | "skilled",
): DeepReport {
  const dimensions = Object.entries(radar) as [keyof RadarData, number][];
  const isBeginner = experienceLevel === "beginner";

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

  if (isBeginner) {
    // 零基础版本：更生活化、口语化
    if (radar.rationality >= 65 && radar.riskAppetite >= 60) {
      insights.push(BEGINNER_INSIGHTS.rationalityVsRisk.highHigh);
    }
    if (radar.rationality >= 65 && radar.riskAppetite <= 40) {
      insights.push(BEGINNER_INSIGHTS.rationalityVsRisk.highLow);
    }
    if (radar.rationality <= 35 && radar.riskAppetite >= 60) {
      insights.push(BEGINNER_INSIGHTS.rationalityVsRisk.lowHigh);
    }

    if (radar.conflictResponse >= 65 && radar.resilience >= 60) {
      insights.push(BEGINNER_INSIGHTS.conflictVsResilience.highHigh);
    }
    if (radar.conflictResponse >= 65 && radar.resilience <= 40) {
      insights.push(BEGINNER_INSIGHTS.conflictVsResilience.highLow);
    }
    if (radar.conflictResponse <= 35 && radar.resilience >= 60) {
      insights.push(BEGINNER_INSIGHTS.conflictVsResilience.lowHigh);
    }

    if (radar.focus >= 65) {
      insights.push(BEGINNER_INSIGHTS.focusNeutral.high);
    }
    if (radar.focus <= 35) {
      insights.push(BEGINNER_INSIGHTS.focusNeutral.low);
    }

    if (insights.length === 0) {
      insights.push(BEGINNER_INSIGHTS.neutral);
    }
  } else {
    // 入门/熟练版本：可保留围棋术语和抽象表达
    if (radar.rationality >= 65 && radar.riskAppetite >= 60) {
      insights.push("理性与冒险并存，善于在控制风险的前提下抓住机会");
    }
    if (radar.rationality >= 65 && radar.riskAppetite <= 40) {
      insights.push("决策理性稳健，但过于保守可能错过爆发性机会");
    }
    if (radar.rationality <= 35 && radar.riskAppetite >= 60) {
      insights.push("敢于冒险但决策理性不足，容易在冲动下做出选择");
    }

    if (radar.conflictResponse >= 65 && radar.resilience >= 60) {
      insights.push("对抗性强且抗压能力出色，是团队里的攻坚手");
    }
    if (radar.conflictResponse >= 65 && radar.resilience <= 40) {
      insights.push("不惧冲突但抗压能力偏弱，持久战容易心态崩");
    }
    if (radar.conflictResponse <= 35 && radar.resilience >= 60) {
      insights.push("抗压能力强且善于退让，但需警惕在关键利益上过度妥协");
    }

    if (radar.focus >= 65) {
      insights.push("全程专注力在线，能坚持到底，适合需要持久投入的任务");
    }
    if (radar.focus <= 35) {
      insights.push("后半程专注力明显下降，建议把目标拆成阶段性里程碑");
    }

    if (insights.length === 0) {
      insights.push("你的决策风格较为均衡，没有极端偏向");
    }
  }

  return {
    strengths: strengths.slice(0, 3),
    weaknesses: weaknesses.slice(0, 3),
    insights: insights.slice(0, 5),
  };
}