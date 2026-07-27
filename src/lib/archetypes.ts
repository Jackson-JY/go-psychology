/**
 * 前端原型模块：re-export shared 逻辑，保留前端专有的图片路径函数
 */

export {
  type Gender,
  type CoreRadar,
  type RadarData,
  type Archetype,
  matchArchetype,
  ARCHETYPES,
} from "@shared/archetypes";

import type { Archetype, Gender } from "@shared/archetypes";

const ARCHETYPE_IMAGE_MAP: Record<number, string> = {
  1: "走钢丝的冒险家",
  2: "贴身肉搏的赌徒",
  3: "刀尖上的舞者",
  4: "执念的殉道者",
  5: "舍不得的守陵人",
  6: "深情的执迷者",
  7: "掌舵的隐忍者",
  8: "谋局的园丁",
  9: "棋盘外的棋手",
  10: "布局的建筑师",
  11: "全局统御的帝王",
  12: "中军帐里的指挥官",
  13: "操控木偶的戏师",
  14: "不动如山的磐石",
  15: "深海里的潜水员",
  16: "以和为贵的调停者",
  17: "润物无声的合作者",
  18: "跳出棋盘的造局者",
  19: "破局而出的先行者",
  20: "静待花开的守望者",
  21: "细水长流的修行者",
  22: "快刀斩乱麻的决策者",
  23: "当机立断的行动派",
};

/** 获取原型人物形象图片路径 */
export function getArchetypeSvgUrl(archetype: Archetype, gender: Gender): string {
  const index = String(archetype.imageIndex).padStart(2, "0");
  const name = ARCHETYPE_IMAGE_MAP[archetype.imageIndex] || archetype.name;
  return `/archetypes/${gender}/${index}_${name}.jpg`;
}
