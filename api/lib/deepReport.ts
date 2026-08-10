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
    high: "把冒险当能力，把鲁莽当魄力，对危险上瘾",
    low: "把不行动当安全，用保守掩盖怯懦",
  },
  resilience: {
    high: "压力下能稳住，但也可能把稳定当迟钝的挡箭牌",
    low: "一遇逆风就心态崩，抗压是最大短板",
  },
  rationality: {
    high: "能及时止损，不被沉没成本绑架",
    low: "被沉没成本绑架，救的是自尊不是棋子",
  },
  conflictResponse: {
    high: "习惯正面迎战，但可能把对抗当唯一沟通语言",
    low: "害怕冲突所以退让，沉默补位被忽视",
  },
  focus: {
    high: "能长时间专注，但也可能用坚持为拖延买单",
    low: "后半程专注力崩盘，执行乏力是硬伤",
  },
};

const BEGINNER_INSIGHTS = {
  rationalityVsRisk: {
    highHigh: "你既理性又敢冒险，但别让计算变成过度自信的遮羞布，冒险前仍要设止损线",
    highLow: "你很理性，但过于保守可能让你错过值得尝试的机会，别把不行动当安全",
    lowHigh: "你敢冒险但容易被情绪带跑，重大决定前先冷却二十四小时，区分直觉和冲动",
  },
  conflictVsResilience: {
    highHigh: "你能扛也能打，但别把对抗当唯一沟通方式，学会在战斗间隙照顾关系",
    highLow: "你不怕冲突但压力下容易崩，冲突前先问自己：这一仗值得打吗",
    lowHigh: "你很能扛压，但太退让会让别人忽视你的底线，该争取时别只说「好的」",
  },
  focusNeutral: {
    high: "你能长时间专注，这是稀缺竞争力，但别让坚持变成拖延的遮羞布",
    low: "你容易分心、后半程乏力，把大目标拆成每天必须完成的小里程碑",
  },
  neutral: "你的决策风格没有明显偏向，但这可能意味着你缺乏鲜明立场，找到那个你愿意坚定一次的事",
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
      insights.push("理性与冒险并存，能在控制风险的前提下抓住机会，但别让自信变成鲁莽");
    }
    if (radar.rationality >= 65 && radar.riskAppetite <= 40) {
      insights.push("决策理性稳健，但过于保守可能让你错过爆发性机会，把安全区往外扩半步");
    }
    if (radar.rationality <= 35 && radar.riskAppetite >= 60) {
      insights.push("敢于冒险但决策理性不足，容易在冲动下做选择，重大决定前先写三个最坏结果");
    }

    if (radar.conflictResponse >= 65 && radar.resilience >= 60) {
      insights.push("对抗性强且抗压出色，是团队里的攻坚手，但别把周围人都当对手");
    }
    if (radar.conflictResponse >= 65 && radar.resilience <= 40) {
      insights.push("不惧冲突但抗压偏弱，持久战容易心态崩，学会在冲突中给自己充电");
    }
    if (radar.conflictResponse <= 35 && radar.resilience >= 60) {
      insights.push("抗压能力强且善于退让，但需警惕在关键利益上过度妥协，该争时要发声");
    }

    if (radar.focus >= 65) {
      insights.push("全程专注力在线，能坚持到底，适合需要持久投入的任务，但别让专注变成固执");
    }
    if (radar.focus <= 35) {
      insights.push("后半程专注力明显下降，建议把目标拆成阶段性里程碑，每完成一个就奖励自己");
    }

    if (insights.length === 0) {
      insights.push("你的决策风格较为均衡，没有极端偏向，但中庸过头就是失去立场");
    }
  }

  return {
    strengths: strengths.slice(0, 3),
    weaknesses: weaknesses.slice(0, 3),
    insights: insights.slice(0, 5),
  };
}