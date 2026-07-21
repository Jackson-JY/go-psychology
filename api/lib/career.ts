import type { RadarData, CareerAdvice } from "@shared/types";

interface CareerResult {
  suitableRoles: string[];
  leadershipStyle: string;
  collaborationStyle: string;
  growthAreas: string[];
}

const CAREER_ROLES: Record<string, string[]> = {
  analytical: ["产品经理", "数据分析师", "战略规划师", "投资分析师", "咨询顾问"],
  creative: ["设计师", "内容创作者", "产品创新", "市场策划", "品牌经理"],
  execution: ["项目经理", "运营总监", "生产管理", "供应链管理", "技术主管"],
  people: ["人力资源", "团队管理", "培训讲师", "客户成功", "公共关系"],
  strategic: ["创业者", "企业高管", "业务负责人", "投资合伙人", "董事会成员"],
  technical: ["技术专家", "架构师", "研发工程师", "算法工程师", "系统管理员"],
};

function determineRoleCategory(radar: RadarData): string[] {
  const categories: string[] = [];
  const { innovation, bigPicture, decisiveness, cooperation, controlDesire, emotionalStability } = radar;

  if (bigPicture >= 65 && decisiveness >= 55) {
    categories.push("strategic");
  }
  if (innovation >= 60) {
    categories.push("creative");
  }
  if (decisiveness >= 65 && controlDesire >= 55) {
    categories.push("execution");
  }
  if (cooperation >= 60 && emotionalStability >= 55) {
    categories.push("people");
  }
  if (bigPicture >= 60 && (innovation >= 50 || decisiveness >= 50)) {
    categories.push("analytical");
  }
  if (innovation >= 55 && controlDesire >= 50) {
    categories.push("technical");
  }

  return categories.length > 0 ? categories : ["analytical", "people"];
}

function getLeadershipStyle(radar: RadarData): string {
  const { controlDesire, cooperation, decisiveness, emotionalStability } = radar;

  if (controlDesire >= 70) {
    return "指挥型领导：目标导向，决策果断，善于驱动团队达成结果";
  }
  if (cooperation >= 65 && emotionalStability >= 60) {
    return "赋能型领导：善于倾听，信任团队，注重培养成员成长";
  }
  if (decisiveness >= 60 && cooperation >= 55) {
    return "平衡型领导：既能果断决策，又能充分考虑团队意见";
  }
  return "稳健型领导：审慎决策，注重细节，稳步推进目标";
}

function getCollaborationStyle(radar: RadarData): string {
  const { cooperation, controlDesire, emotionalStability, patience } = radar;

  if (cooperation >= 70) {
    return "协作型：乐于分享，善于沟通，重视团队共识";
  }
  if (controlDesire >= 65) {
    return "主导型：习惯掌控全局，善于推动事情向前";
  }
  if (patience >= 60 && emotionalStability >= 60) {
    return "包容型：耐心倾听，包容不同观点，营造和谐氛围";
  }
  return "独立型：善于独立思考，必要时寻求协作";
}

function getGrowthAreas(radar: RadarData): string[] {
  const areas: string[] = [];
  const { decisiveness, cooperation, innovation, patience, emotionalStability, sunkCost } = radar;

  if (decisiveness <= 35) {
    areas.push("提升决策速度：在信息不完整时也要敢于做出选择");
  }
  if (cooperation <= 40) {
    areas.push("增强团队协作：学会倾听和授权，发挥团队力量");
  }
  if (innovation <= 40) {
    areas.push("培养创新思维：尝试跳出固有框架，探索新可能性");
  }
  if (patience <= 35) {
    areas.push("提升耐心：学会延迟满足，关注长期价值");
  }
  if (emotionalStability <= 40) {
    areas.push("情绪管理：在压力下保持冷静，避免情绪化决策");
  }
  if (sunkCost >= 65) {
    areas.push("学会止损：接受损失，及时调整方向");
  }

  return areas.length > 0 ? areas : ["持续学习：保持好奇心，关注行业动态"];
}

export function mapRadarToCareer(radar: RadarData): CareerResult {
  const categories = determineRoleCategory(radar);
  const roleSet = new Set<string>();
  categories.forEach((cat) => {
    CAREER_ROLES[cat].forEach((role) => roleSet.add(role));
  });

  return {
    suitableRoles: Array.from(roleSet).slice(0, 6),
    leadershipStyle: getLeadershipStyle(radar),
    collaborationStyle: getCollaborationStyle(radar),
    growthAreas: getGrowthAreas(radar),
  };
}