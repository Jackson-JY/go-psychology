import { useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, RotateCcw, Target, Brain, Shield, Swords, Eye } from "lucide-react";
import Seal from "@/components/Seal";
import HeatmapChart from "@/components/HeatmapChart";
import { useGameStore } from "@/store";
import type { SgfAnalysisResponse } from "@/lib/types";
import {
  matchArchetype,
  getArchetypeSvgUrl,
  type CoreRadar,
} from "@/lib/archetypes";

const RADAR_AXES = [
  { key: "riskAppetite" as const, label: "风险偏好", icon: Target },
  { key: "resilience" as const, label: "逆境抗压", icon: Shield },
  { key: "rationality" as const, label: "决策理性", icon: Brain },
  { key: "conflictResponse" as const, label: "冲突应对", icon: Swords },
  { key: "focus" as const, label: "长效专注", icon: Eye },
];

/** 5 轴雷达图 */
function SgfRadarChart({ data, size = 220 }: { data: SgfAnalysisResponse["radar"]; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 32;
  const levels = 4;
  const count = RADAR_AXES.length;

  const angleOf = (i: number) => (Math.PI * 2 * i) / count - Math.PI / 2;
  const pointOf = (i: number, value01: number) => ({
    x: cx + Math.cos(angleOf(i)) * radius * value01,
    y: cy + Math.sin(angleOf(i)) * radius * value01,
  });

  const values = RADAR_AXES.map((a) => Math.max(0, Math.min(100, data[a.key])) / 100);
  const polyPoints = values.map((v, i) => pointOf(i, v));
  const polyPath = polyPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto block">
      {Array.from({ length: levels }).map((_, li) => {
        const ratio = (li + 1) / levels;
        const pts = Array.from({ length: count }).map((_, i) => pointOf(i, ratio));
        return (
          <polygon
            key={li}
            points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke="rgba(40,30,15,0.12)"
            strokeWidth={0.8}
          />
        );
      })}
      {Array.from({ length: count }).map((_, i) => {
        const p = pointOf(i, 1);
        return (
          <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(40,30,15,0.12)" strokeWidth={0.8} />
        );
      })}
      <polygon points={polyPath} fill="rgba(200,57,43,0.15)" stroke="#C8392B" strokeWidth={1.5} />
      {polyPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="#C8392B" stroke="#fff" strokeWidth={1} />
      ))}
      {RADAR_AXES.map((a, i) => {
        const p = pointOf(i, 1.22);
        return (
          <text
            key={a.key}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#3a3028"
            style={{ fontSize: 11, fontWeight: 500 }}
          >
            {a.label}
          </text>
        );
      })}
      {RADAR_AXES.map((a, i) => {
        const v = data[a.key];
        const p = pointOf(i, Math.min(1, v / 100) + 0.12);
        return (
          <text
            key={`v-${a.key}`}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#C8392B"
            style={{ fontSize: 9, opacity: 0.7 }}
          >
            {v}
          </text>
        );
      })}
    </svg>
  );
}

/** 维度卡片 */
function DimensionCard({
  label,
  score,
  icon: Icon,
  description,
}: {
  label: string;
  score: number;
  icon: React.ElementType;
  description: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 rounded-lg border border-ink-900/8 bg-white/60 p-3"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cinnabar/10">
        <Icon size={15} className="text-cinnabar" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="font-kai text-sm text-ink-900">{label}</span>
          <span className="font-mono text-xs font-medium text-cinnabar">{score}</span>
        </div>
        <div className="mt-1 h-1 w-full rounded-full bg-ink-900/8">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-full rounded-full bg-cinnabar"
          />
        </div>
        <p className="mt-1.5 font-kai text-[11px] leading-relaxed text-ink-900/50">{description}</p>
      </div>
    </motion.div>
  );
}

/** 关键节点时间线 */
function KeyMoments({ moments }: { moments: SgfAnalysisResponse["keyMoments"] }) {
  if (moments.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="mb-3 font-kai text-base font-semibold text-ink-900">关键棋局节点</h3>
      <div className="space-y-2">
        {moments.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i }}
            className="flex items-start gap-2.5 rounded-md border border-ink-900/6 bg-white/40 px-3 py-2.5"
          >
            <span className="mt-0.5 shrink-0 rounded-sm bg-cinnabar/10 px-1.5 py-0.5 font-mono text-[9px] text-cinnabar">
              {m.moveNumber}手
            </span>
            <span className="font-kai text-[12px] leading-relaxed text-ink-900/70">
              {m.description}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function SgfResultStage() {
  const sgfResult = useGameStore((s) => s.sgfResult);
  const restart = useGameStore((s) => s.restart);
  const goSgfUpload = useGameStore((s) => s.goSgfUpload);
  const gender = useGameStore((s) => s.gender);
  const setGender = useGameStore((s) => s.setGender);

  if (!sgfResult) return null;

  const { radar, tags, keyMoments, moveCount, boardSize, heatmap } = sgfResult;

  const archetype = useMemo(() => {
    return matchArchetype(radar as CoreRadar);
  }, [radar]);

  const archetypeImgUrl = useMemo(() => {
    return getArchetypeSvgUrl(archetype, gender);
  }, [archetype, gender]);

  // 维度描述映射
  const dimensionDescriptions: Record<string, string> = {
    riskAppetite:
      radar.riskAppetite >= 60
        ? "你偏好激进冒险，敢于深入对方腹地，追求高收益"
        : radar.riskAppetite <= 40
          ? "你偏好稳健保守，注重实地和安全性"
          : "你在激进与保守之间保持平衡",
    resilience:
      radar.resilience >= 60
        ? "逆境中仍能保持战略定力，不轻易崩盘"
        : radar.resilience <= 40
          ? "局势不利时容易心态波动，需要加强抗压训练"
          : "抗压能力处于中等水平",
    rationality:
      radar.rationality >= 60
        ? "能及时止损，不被沉没成本绑架，决策理性"
        : radar.rationality <= 40
          ? "容易执着于已投入的成本，难以放手"
          : "理性与情感在决策中交替主导",
    conflictResponse:
      radar.conflictResponse >= 60
        ? "面对冲突倾向于正面迎战，不畏对抗"
        : radar.conflictResponse <= 40
          ? "面对冲突倾向于退让妥协，以和为贵"
          : "根据局势灵活选择对抗或退让",
    focus:
      radar.focus >= 60
        ? "全程保持高度专注，后期失误率控制良好"
        : radar.focus <= 40
          ? "后半盘专注力明显下降，容易出现随手"
          : "专注力整体平稳，偶有松懈",
  };

  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-paper-100 px-5 py-6">
      {/* 顶部 */}
      <header className="flex items-center justify-between">
        <button
          onClick={restart}
          className="flex items-center gap-1.5 font-mono text-[11px] tracking-widest text-ink-900/50 transition-colors hover:text-ink-900"
        >
          <ArrowLeft size={14} />
          返回首页
        </button>
        <div className="flex items-center gap-2">
          <Seal char="析" size={28} />
          <span className="font-mono text-[10px] tracking-[0.3em] text-ink-900/60">
            棋谱心理分析
          </span>
        </div>
      </header>

      {/* 标题 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-6 text-center"
      >
        <div className="font-mono text-[10px] tracking-widest text-ink-900/40">
          {boardSize}×{boardSize} · {moveCount} 手 · {sgfResult.analyzedColor === "B" ? "黑棋" : "白棋"}视角 · 五维心理画像
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-cinnabar/20 bg-cinnabar/5 px-2.5 py-0.5 font-kai text-[11px] text-cinnabar"
            >
              {tag}
            </span>
          ))}
        </div>
        {/* 图片来源提示 */}
        {sgfResult.source === "vision" && (
          <div className="mt-2 rounded-md border border-ink-900/8 bg-white/40 px-3 py-1.5 font-kai text-[11px] text-ink-900/60">
            {sgfResult.imageNotes || "基于图片视觉识别分析"}
            {sgfResult.hasMoveNumbers === false && (
              <span className="ml-1 text-cinnabar/70">（未识别出手数，落子顺序为 AI 估算）</span>
            )}
          </div>
        )}
        {sgfResult.source === "mock" && (
          <div className="mt-2 rounded-md border border-ink-900/8 bg-amber-50/50 px-3 py-1.5 font-kai text-[11px] text-amber-700/70">
            演示模式：未配置视觉识别 API，当前为示例数据
          </div>
        )}
      </motion.div>

      {/* 人物原型卡片 */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="mt-5"
      >
        <div className="relative overflow-hidden rounded-lg border border-ink-900/8 bg-paper-200">
          <div className="flex flex-col items-center p-4">
            <div className="relative">
              <img
                src={archetypeImgUrl}
                alt={archetype.name}
                className="h-auto w-36 rounded-md shadow-md"
              />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-cinnabar px-3 py-0.5 font-kai text-[10px] text-paper-100">
                你的原型
              </div>
            </div>
            <div className="mt-5 text-center">
              <h3 className="font-serif text-lg font-bold text-ink-900">
                「{archetype.name}」
              </h3>
              <p className="mt-1 font-mono text-[9px] tracking-widest text-ink-900/40">
                {archetype.subtitle}
              </p>
            </div>
            <p className="mt-2.5 text-center font-kai text-[12px] leading-relaxed text-ink-900/70">
              {archetype.description}
            </p>
            {/* 性别切换 */}
            <div className="mt-3.5 flex items-center gap-3">
              <span className="font-mono text-[9px] tracking-widest text-ink-900/30">
                切换形象：
              </span>
              <div className="flex overflow-hidden rounded-sm border border-ink-900/15">
                <button
                  onClick={() => setGender("male")}
                  className={`px-2.5 py-1 font-kai text-[11px] transition-colors ${
                    gender === "male"
                      ? "bg-ink-900 text-paper-100"
                      : "bg-paper-100 text-ink-900/60 hover:bg-ink-900/5"
                  }`}
                >
                  男性
                </button>
                <button
                  onClick={() => setGender("female")}
                  className={`px-2.5 py-1 font-kai text-[11px] transition-colors ${
                    gender === "female"
                      ? "bg-ink-900 text-paper-100"
                      : "bg-paper-100 text-ink-900/60 hover:bg-ink-900/5"
                  }`}
                >
                  女性
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 雷达图 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="mt-4 flex justify-center"
      >
        <SgfRadarChart data={radar} />
      </motion.div>

      {/* 五维卡片 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-4 space-y-2"
      >
        {RADAR_AXES.map((axis) => (
          <DimensionCard
            key={axis.key}
            label={axis.label}
            score={radar[axis.key]}
            icon={axis.icon}
            description={dimensionDescriptions[axis.key]}
          />
        ))}
      </motion.div>

      {/* 热力图 */}
      {heatmap && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 flex flex-col items-center"
        >
          <h3 className="mb-2 font-kai text-base font-semibold text-ink-900">落子热力分布</h3>
          <HeatmapChart data={heatmap} />
        </motion.div>
      )}

      {/* 关键节点 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <KeyMoments moments={keyMoments} />
      </motion.div>

      {/* 底部操作 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 flex flex-col items-center gap-3"
      >
        <button onClick={goSgfUpload} className="btn-ink !px-6 !py-2.5 text-sm">
          <RotateCcw size={14} className="mr-1 inline" />
          分析另一盘棋谱
        </button>
        <button
          onClick={restart}
          className="font-mono text-[10px] tracking-widest text-ink-900/40 transition-colors hover:text-ink-900"
        >
          返回首页
        </button>
      </motion.div>

      <footer className="mt-6 text-center font-mono text-[9px] tracking-widest text-ink-900/30">
        基于规则引擎分析 · 不涉及 AI 引擎
      </footer>
    </div>
  );
}
