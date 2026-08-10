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
    high: "愿意承担风险，敢在不确定中下注，倾向于把勇气推得很满",
    low: "偏好稳妥，善于守住基本盘，倾向于在风险前多看一看",
  },
  resilience: {
    high: "压力下能保持稳定，是团队里让人安心的存在，偶尔可能把冷静用成观望",
    low: "逆风时容易波动，内心戏比较足，也需要更多恢复和确认",
  },
  rationality: {
    high: "擅长及时止损，能跳出沉没成本做选择，决策相对清醒",
    low: "很重感情和投入，容易为已经付出的心意追加成本，需要练习转身",
  },
  conflictResponse: {
    high: "敢于正面表达，在冲突中不退缩，偶尔可能把对抗当成唯一语言",
    low: "倾向于维护和谐，愿意退让保全局，也需要练习守住自己的边界",
  },
  focus: {
    high: "能长时间专注，有坚持到底的韧性，偶尔可能把坚持用成固执",
    low: "注意力容易漂移，后半程需要外力提醒自己，适合把目标切小",
  },
};

const BEGINNER_INSIGHTS = {
  rationalityVsRisk: {
    highHigh: "你既理性又敢冒险，能在算清楚之后果断下注。下次冒险前，先给自己设一条止损线，勇气会更有根基",
    highLow: "你很理性，但有时也会因为过于谨慎而错过值得尝试的机会。试着把安全区往外扩半步，小的试错也是一种成长",
    lowHigh: "你敢冒险，但容易被情绪带跑。重大决定前先睡一觉或冷却一天，让直觉和冲动各退一步",
  },
  conflictVsResilience: {
    highHigh: "你能扛也能打，是团队里的攻坚手。只是战斗之外，也记得给关系留一点缓冲带，不是所有人都需要被说服",
    highLow: "你不怕冲突，但压力下容易消耗过快。冲上去之前，先问自己：这一仗值得打吗？值得，再全力",
    lowHigh: "你很能扛压，也习惯退让。你的包容是礼物，但也要在关键利益上为自己发一次声，别总把好的挂在嘴边",
  },
  focusNeutral: {
    high: "你能长时间专注，这是稀缺的竞争力。也别忘了定期抬头看看方向，别让坚持变成盲目的惯性",
    low: "你容易分心、后半程乏力，把大目标拆成每天必须完成的小里程碑，完成一个就给自己一点肯定",
  },
  neutral: "你的决策风格比较均衡，没有特别突出的偏向。这也说明你有很多可能性，找到一件愿意坚定一次的事，慢慢长出你的主线",
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
      insights.push("理性与冒险并存，能在控制风险的前提下抓住机会，但别让自信越过止损线，给勇气配一把尺子");
    }
    if (radar.rationality >= 65 && radar.riskAppetite <= 40) {
      insights.push("决策理性稳健，但过于保守可能让你错过爆发性机会，试着把安全区往外扩半步");
    }
    if (radar.rationality <= 35 && radar.riskAppetite >= 60) {
      insights.push("敢于冒险但决策理性不足，容易在冲动下做选择，重大决定前先写三个最坏结果");
    }

    if (radar.conflictResponse >= 65 && radar.resilience >= 60) {
      insights.push("对抗性强且抗压出色，是团队里的攻坚手，但别把周围人都当对手，给关系留一点缓冲带");
    }
    if (radar.conflictResponse >= 65 && radar.resilience <= 40) {
      insights.push("不惧冲突但抗压偏弱，持久战容易心态崩，学会在冲突中给自己充电");
    }
    if (radar.conflictResponse <= 35 && radar.resilience >= 60) {
      insights.push("抗压能力强且善于退让，但需警惕在关键利益上过度妥协，该争时要温和而坚定地发声");
    }

    if (radar.focus >= 65) {
      insights.push("全程专注力在线，能坚持到底，适合需要持久投入的任务，但别让专注变成固执，定期校准方向");
    }
    if (radar.focus <= 35) {
      insights.push("后半程专注力明显下降，建议把目标拆成阶段性里程碑，每完成一个就给自己一次小肯定");
    }

    if (insights.length === 0) {
      insights.push("你的决策风格较为均衡，没有极端偏向，这是一种灵活，也需要找到一件愿意坚定一次的事");
    }
  }

  return {
    strengths: strengths.slice(0, 3),
    weaknesses: weaknesses.slice(0, 3),
    insights: insights.slice(0, 5),
  };
}