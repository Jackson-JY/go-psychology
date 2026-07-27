import type { RadarData } from "@shared/types";

export type MbtiLetter = "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P";
export type MbtiType =
  | "ESTJ" | "ESTP" | "ESFJ" | "ESFP"
  | "ENTJ" | "ENTP" | "ENFJ" | "ENFP"
  | "ISTJ" | "ISTP" | "ISFJ" | "ISFP"
  | "INTJ" | "INTP" | "INFJ" | "INFP";

export interface MbtiResult {
  type: MbtiType;
  letters: {
    ei: "E" | "I";
    sn: "S" | "N";
    tf: "T" | "F";
    jp: "J" | "P";
  };
  scores: {
    ei: number; // 0-100, >50 偏 E
    sn: number; // 0-100, >50 偏 S
    tf: number; // 0-100, >50 偏 T
    jp: number; // 0-100, >50 偏 J
  };
  title: string;
  subtitle: string;
}

/** 16 种 MBTI 的标题和副标题 */
const MBTI_META: Record<MbtiType, { title: string; subtitle: string }> = {
  ESTJ: { title: "铁腕指挥官", subtitle: "天生的组织者，用规则与效率驱动一切" },
  ESTP: { title: "极限投机者", subtitle: "活在当下，用直觉和勇气捕获机会" },
  ESFJ: { title: "团队粘合剂", subtitle: "关注每一个人，用关怀维系集体温度" },
  ESFP: { title: "舞台聚光灯", subtitle: "天生的表演者，热情感染周围所有人" },
  ENTJ: { title: "战略统帅", subtitle: "远见与执行并存，天生的领袖型人格" },
  ENTP: { title: "规则破坏者", subtitle: "用辩论和挑战重塑世界的边界" },
  ENFJ: { title: "灵魂导师", subtitle: "洞察他人潜能，用愿景引领团队前行" },
  ENFP: { title: "自由梦想家", subtitle: "追随内心火花，用创意点燃无限可能" },
  ISTJ: { title: "精密守序者", subtitle: "可靠、务实，用行动诠释责任二字" },
  ISTP: { title: "冷面匠人", subtitle: "沉默的观察者，关键时刻一击即中" },
  ISFJ: { title: "温暖守护者", subtitle: "默默付出，用稳定感守护身边的人" },
  ISFP: { title: "静谧艺术家", subtitle: "敏感而独立，在内心构建独特的美学" },
  INTJ: { title: "系统架构师", subtitle: "用逻辑和远见搭建未来的蓝图" },
  INTP: { title: "真理探索者", subtitle: "痴迷于原理与可能性，思想永远自由" },
  INFJ: { title: "神秘洞察者", subtitle: "稀少的理想主义者，用深度连接世界" },
  INFP: { title: "诗意理想家", subtitle: "内心有座永不熄灭的理想主义灯塔" },
};

/**
 * 将 5 维雷达数据映射为 MBTI 4 维分数
 *
 * 映射逻辑（与 SGF 五维保持一致）：
 * - E/I: 风险偏好(riskAppetite) + 冲突应对(conflictResponse) → 主动/外向型 vs 观察/内向型
 * - S/N: 决策理性度(rationality)反向 + 专注(focus) → 关注当下细节 vs 关注未来可能
 * - T/F: 理性(rationality) + 专注(focus) → 理性决策 vs 感性牵绊
 * - J/P: 专注(focus) + 风险偏好反向 → 规划果断 vs 灵活开放
 */
export function mapRadarToMbti(radar: RadarData): MbtiResult {
  const { riskAppetite, conflictResponse, rationality, focus } = radar;

  // E/I: 主动能量指数 (0-100)
  // 高冒险 + 高对抗 = 外向(E)；低冒险 + 低对抗 = 内向(I)
  const eiScore = Math.round((riskAppetite * 0.6 + conflictResponse * 0.4));

  // S/N: 感知方式指数 (0-100)
  // 低理性 = 关注已发生的具体事实(S)；高理性 + 高专注 = 关注抽象未来(N)
  const snScore = Math.round(((100 - rationality) * 0.6 + focus * 0.4));

  // T/F: 决策方式指数 (0-100)
  // 高理性 + 高专注 = 理性思考(T)；低理性 = 感性情感(F)
  const tfScore = Math.round((rationality * 0.6 + focus * 0.4));

  // J/P: 生活方式指数 (0-100)
  // 高专注 = 判断型喜欢规划(J)；高冒险 + 低专注 = 感知型灵活开放(P)
  const jpScore = Math.round((focus * 0.7 + (100 - riskAppetite) * 0.3));

  const ei: "E" | "I" = eiScore >= 50 ? "E" : "I";
  const sn: "S" | "N" = snScore >= 50 ? "S" : "N";
  const tf: "T" | "F" = tfScore >= 50 ? "T" : "F";
  const jp: "J" | "P" = jpScore >= 50 ? "J" : "P";

  const type = (ei + sn + tf + jp) as MbtiType;

  return {
    type,
    letters: { ei, sn, tf, jp },
    scores: { ei: eiScore, sn: snScore, tf: tfScore, jp: jpScore },
    ...MBTI_META[type],
  };
}
