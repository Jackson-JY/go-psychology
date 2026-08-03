import type { RadarData } from "@shared/types";

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

/**
 * 根据 5 维雷达确定角色类别
 */
function determineRoleCategory(radar: RadarData): string[] {
  const categories: string[] = [];
  const { riskAppetite, resilience, rationality, conflictResponse, focus } = radar;

  if (rationality >= 65 && focus >= 55) {
    categories.push("strategic");
  }
  if (riskAppetite >= 60 && rationality >= 50) {
    categories.push("creative");
  }
  if (rationality >= 65 && conflictResponse >= 55) {
    categories.push("execution");
  }
  if (conflictResponse <= 40 && resilience >= 55) {
    categories.push("people");
  }
  if (rationality >= 60 && (focus >= 50 || riskAppetite >= 50)) {
    categories.push("analytical");
  }
  if (focus >= 60 && conflictResponse >= 50) {
    categories.push("technical");
  }

  return categories.length > 0 ? categories : ["analytical", "people"];
}

function getLeadershipStyle(radar: RadarData): string {
  const { riskAppetite, resilience, rationality, conflictResponse, focus } = radar;

  if (conflictResponse >= 70 && rationality >= 60) {
    return "指挥型领导：目标导向，决策果断，善于驱动团队达成结果";
  }
  if (conflictResponse <= 40 && resilience >= 60) {
    return "赋能型领导：善于倾听，信任团队，注重培养成员成长";
  }
  if (rationality >= 60 && conflictResponse >= 50) {
    return "平衡型领导：既能果断决策，又能充分考虑团队意见";
  }
  if (focus >= 65 && riskAppetite <= 45) {
    return "稳健型领导：审慎决策，注重细节，稳步推进目标";
  }
  return "适应型领导：根据情境灵活调整风格，善于在变化中找到方向";
}

function getCollaborationStyle(radar: RadarData): string {
  const { conflictResponse, resilience, focus, riskAppetite } = radar;

  if (conflictResponse <= 40) {
    return "协作型：乐于分享，善于沟通，重视团队共识";
  }
  if (conflictResponse >= 65) {
    return "主导型：习惯掌控全局，善于推动事情向前";
  }
  if (resilience >= 60 && focus >= 60) {
    return "包容型：耐心倾听，包容不同观点，营造和谐氛围";
  }
  if (riskAppetite <= 40 && focus >= 60) {
    return "稳健型：注重流程和质量，是团队的稳定器";
  }
  return "独立型：善于独立思考，必要时寻求协作";
}

function getGrowthAreas(radar: RadarData): string[] {
  const areas: string[] = [];
  const { riskAppetite, resilience, rationality, conflictResponse, focus } = radar;

  if (rationality <= 35) {
    areas.push("提升决策理性：学会及时止损，不被沉没成本绑架");
  }
  if (conflictResponse >= 75) {
    areas.push("学会妥协：不是所有战斗都值得打，找到合作共赢的空间");
  }
  if (conflictResponse <= 30) {
    areas.push("增强主见：在关键利益上学会坚定表达自己的立场");
  }
  if (focus <= 35) {
    areas.push("提升专注力：减少分心，把精力集中在最重要的事情上");
  }
  if (resilience <= 40) {
    areas.push("抗压训练：在压力下保持冷静，避免情绪化决策");
  }
  if (riskAppetite >= 75) {
    areas.push("风险控制：冒险前评估最坏情况，建立安全边界");
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