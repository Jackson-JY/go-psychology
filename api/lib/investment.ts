import type { RadarData, InvestmentStyle } from "@shared/types";

interface InvestmentResult {
  type: string;
  riskLevel: "conservative" | "moderate" | "aggressive";
  suitableStrategies: string[];
  pitfalls: string[];
  recommendations: string[];
}

const INVESTMENT_TYPES: Record<string, InvestmentResult> = {
  conservative: {
    type: "稳健守财型",
    riskLevel: "conservative",
    suitableStrategies: ["指数基金定投", "国债/银行理财", "红利股长期持有", "保险型储蓄"],
    pitfalls: ["过于保守导致跑输通胀", "错过结构性机会", "对市场变化反应迟钝"],
    recommendations: ["配置 10-20% 成长型资产", "定期复盘资产配置", "关注通胀对冲工具"],
  },
  moderate: {
    type: "平衡增长型",
    riskLevel: "moderate",
    suitableStrategies: ["核心+卫星策略", "股债平衡配置", "优质赛道长期持有", "定投+波段结合"],
    pitfalls: ["市场波动时容易情绪化操作", "仓位管理不够严格", "分散过度导致收益平庸"],
    recommendations: ["设定明确的止盈止损规则", "定期再平衡", "聚焦 3-5 个核心标的"],
  },
  aggressive: {
    type: "进取成长型",
    riskLevel: "aggressive",
    suitableStrategies: ["成长股集中投资", "行业主题基金", "期权对冲策略", "一级市场参与"],
    pitfalls: ["过度自信导致重仓", "追涨杀跌频繁交易", "忽视风险控制"],
    recommendations: ["单只标的仓位不超过 20%", "建立止损机制", "保留 30% 现金应对回撤"],
  },
};

function determineRiskLevel(radar: RadarData): "conservative" | "moderate" | "aggressive" {
  const { riskAppetite, decisiveness, patience } = radar;
  
  if (riskAppetite >= 65 || (riskAppetite >= 55 && decisiveness >= 60)) {
    return "aggressive";
  }
  if (riskAppetite <= 35 || (riskAppetite <= 45 && patience >= 60)) {
    return "conservative";
  }
  return "moderate";
}

export function mapRadarToInvestment(radar: RadarData): InvestmentResult {
  const riskLevel = determineRiskLevel(radar);
  const base = INVESTMENT_TYPES[riskLevel];

  if (radar.sunkCost >= 60) {
    base.pitfalls.push("容易越跌越补，陷入沉没成本陷阱");
    base.recommendations.push("设定硬性止损线，触发即执行");
  }

  if (radar.bigPicture >= 70) {
    base.suitableStrategies.push("宏观对冲策略");
    base.recommendations.push("关注政策和周期变化");
  }

  if (radar.innovation >= 65) {
    base.suitableStrategies.push("新兴行业早期布局");
  }

  return { ...base };
}