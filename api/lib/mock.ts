import type { RadarData } from "@shared/types";

interface MockInput {
  tags: string[];
  radar: RadarData;
  rationales: string[];
}

interface MockOutput {
  headline: string;
  comment: string;
}

/** 按 headline 类型组织话术池 */
const POOLS: Record<string, { headline: string; comment: string }[]> = {
  // 高风险偏好
  aggressive: [
    {
      headline: "走钢丝的冒险家",
      comment:
        "你是走钢丝的冒险家。三手落子都直扑敌方腹地，像在投资里满仓加杠杆——赢了封神，输了清零。职场里你敢拍板，但同事已经学会在你提案的数字后面多加一个零当安全垫。你的致命伤不是不够勇，而是把『敢』等同于『对』。下次出手前，问自己一句：如果输了，我能撑三个月吗？",
    },
    {
      headline: "贴身肉搏的赌徒",
      comment:
        "你是贴身肉搏的赌徒。三手棋都贴着对方下，像极了股市里追涨杀跌的人——你相信自己总能踩对节奏，但节奏停下来的那天就是爆仓的那天。你的优点是临场反应快，缺点是把运气算进了能力。建议把仓位的 30% 永远留给『最坏情况』，留得青山比一时爽快更重要。",
    },
  ],
  // 高沉没成本
  stubborn: [
    {
      headline: "执念的殉道者",
      comment:
        "你是执念的殉道者。死子你都要救，亏的项目你都不肯关——这种『再给一点时间就好』的心态，是职场和投资里最贵的人格税。你的忠诚是优点，但也是枷锁。建议给自己设一个止损线：任何决策，三个月无起色就强制复盘，半年无起色就果断关掉。沉没成本不是你的勋章，是你该扔掉的背包。",
    },
    {
      headline: "舍不得的守陵人",
      comment:
        "你是舍不得的守陵人。明知团队已经被围，你还要往里冲——这不是勇敢，是放不下。投资里你最容易越跌越补，越补越深。你的好是重情，你的痛是情大于理。建议给每个决策预设一个『退出条件』，触发就执行，不许加戏。学会止损，不是背叛过去，而是放过未来。",
    },
  ],
  // 高大局观
  strategic: [
    {
      headline: "掌舵的隐忍者",
      comment:
        "你是掌舵的隐忍者。三手棋都舍得放弃局部、看向外围——这种大局观在职场里是稀缺品。你不抢功，但每一步都把船摆向了正确的航向。你的风险是太稳：有时候机会就是那一下冲动的窗口期，错过就没了。建议留 20% 的仓位给『明知冒险但值得一试』的事，让稳中也带点锋。",
    },
    {
      headline: "谋局的园丁",
      comment:
        "你是谋局的园丁。落子不见锋芒，但每颗子都种在了将来能长成大树的点位。你像极了那种闷声做长线、最后穿越牛熊的人。你的盲点是节奏——有时候市场不给你十年的耐心，你的好就被埋没了。建议学会阶段性『收割』，把抽象的格局变成看得见的成果，让别人也能跟上你的节奏。",
    },
  ],
  // 高掌控欲
  controller: [
    {
      headline: "全局统御的帝王",
      comment:
        "你是全局统御的帝王。天元、中央、主动卡位——你天然要站在能俯瞰全盘的位置。职场里你是天生的操盘手，但你的代价是不放心任何人。你以为这是责任，其实是控制欲。建议学着授权一次：把一件小事彻底交出去，只看结果不看过程。你会发现，没你盯着的船，也能开到对岸。",
    },
    {
      headline: "中军帐里的指挥官",
      comment:
        "你是中军帐里的指挥官。你天然往中央走，要掌控所有变量。这种人格在创业初期是优势，在成熟期是瓶颈——你越想抓，团队越依赖，组织就越脆。建议给自己定一个『不在场测试』：离开三天看团队会不会崩。如果会崩，说明你的掌控是假掌控，是替代。真掌控是让体系离开你也能转。",
    },
  ],
  // 中庸 / 防御
  defensible: [
    {
      headline: "守拙的潜行者",
      comment:
        "你是守拙的潜行者。落子边线、不冒头——你的好是稳健，你的痛是『稳健到错过』。职场里你可能长期被忽视，不是能力不够，是不肯上台。投资里你可能长期跑输通胀，因为安全是你的第一性。建议一年至少做一件『轻度冒险』的事——未必赚钱，但要让自己习惯『不安全』。舒适区里长不出第二曲线。",
    },
    {
      headline: "低调的旁观者",
      comment:
        "你是低调的旁观者。落子游离、不表态、不冒头——你在职场里是『不出错也不出彩』的那类人。你的好是稳定，你的痛是『稳定到隐形』。建议给自己一个『主动暴露』的小目标：每月主动争取一次发言、一次提案、一次被看见的机会。你的潜力，需要一个出口才能被验证。",
    },
  ],
};

/** 根据雷达数据挑选最合适的话术池 */
function pickPoolKey(radar: RadarData, tags: string[]): string {
  if (tags.includes("极度激进") || radar.riskAppetite >= 70) return "aggressive";
  if (tags.includes("执念深") || radar.sunkCost >= 70) return "stubborn";
  if (tags.includes("掌控欲") || radar.controlDesire >= 70) return "controller";
  if (tags.includes("大局观好") || radar.bigPicture >= 70) return "strategic";
  if (radar.riskAppetite <= 35 || tags.includes("保守")) return "defensible";
  // 默认走战略型
  return "strategic";
}

/** 兜底 mock：从话术池中按标签 hash 挑一条 */
export function mockComment(input: MockInput): MockOutput {
  const { radar, tags, rationales } = input;
  const poolKey = pickPoolKey(radar, tags);
  const pool = POOLS[poolKey];
  // 用 rationales 的字符长度做 hash 选条目，保证同输入同输出
  const seed = rationales.join("").length + tags.length;
  const pick = pool[seed % pool.length];
  return pick;
}
