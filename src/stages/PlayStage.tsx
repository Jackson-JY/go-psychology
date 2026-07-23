import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GoBoard from "@/components/GoBoard";
import CharStream from "@/components/CharStream";
import Seal from "@/components/Seal";
import OptionOverlays from "@/components/OptionOverlays";
import { SCENARIOS, useGameStore } from "@/store";
import { analyzeMoves } from "@/lib/api";
import type { Coord } from "@/lib/types";

const AUTO_ADVANCE_MS = 2000;

export default function PlayStage() {
  const {
    currentScenarioIndex,
    recordMove,
    nextScenario,
    setResult,
    setError,
    experienceLevel,
  } = useGameStore();

  const scenario = SCENARIOS[currentScenarioIndex];
  const effectiveLevel = experienceLevel ?? "beginner";
  const copy = scenario.copy[effectiveLevel];
  const isBeginner = effectiveLevel === "beginner";

  const [userMove, setUserMove] = useState<Coord | null>(null);
  const [phase, setPhase] = useState<"play" | "placed">("play");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userMoveRef = useRef<Coord | null>(null);

  // 零基础模式下 A/B 选项的视觉区域提示
  const optionAreas = isBeginner
    ? [
        // A 区域：红色，继续投入/攻击型选择（基于当前题目的热区）
        { x: scenario.id === "lifeDeath" ? 5 : scenario.id === "opening" ? 2 : scenario.id === "invasion" ? 4 : 6,
          y: scenario.id === "lifeDeath" ? 7 : scenario.id === "opening" ? 2 : scenario.id === "invasion" ? 4 : 1,
          label: copy.optionA ?? "选择 A",
          color: "cinnabar" as const },
        // B 区域：蓝色，放弃/转移型选择
        { x: scenario.id === "lifeDeath" ? 6 : scenario.id === "opening" ? 4 : scenario.id === "invasion" ? 0 : 5,
          y: scenario.id === "lifeDeath" ? 3 : scenario.id === "opening" ? 4 : scenario.id === "invasion" ? 4 : 7,
          label: copy.optionB ?? "选择 B",
          color: "bamboo" as const },
      ]
    : [];

  // 切关时重置
  useEffect(() => {
    setUserMove(null);
    userMoveRef.current = null;
    setPhase("play");
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [currentScenarioIndex]);

  // 卸载时清理 timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const advance = async () => {
    const coord = userMoveRef.current;
    if (!coord) return;
    recordMove(scenario.id, coord.x, coord.y);

    if (currentScenarioIndex < SCENARIOS.length - 1) {
      nextScenario();
    } else {
      useGameStore.setState({ stage: "loading" });
      try {
        const finalMoves = useGameStore.getState().moves;
        const res = await analyzeMoves(finalMoves, experienceLevel ?? undefined);
        setResult(res);
      } catch (err) {
        setError((err as Error).message || "分析失败，请重试");
      }
    }
  };

  const handlePlace = (x: number, y: number) => {
    if (phase !== "play") return;
    const coord = { x, y };
    setUserMove(coord);
    userMoveRef.current = coord;
    setPhase("placed");
    // 2 秒后自动进入下一步
    timerRef.current = setTimeout(() => {
      advance();
    }, AUTO_ADVANCE_MS);
  };

  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-paper-100 px-5 py-6">
      {/* 顶部：进度 + 关卡 */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Seal char={copy.title} size={32} />
          <div className="leading-tight">
            <div className="font-mono text-[10px] tracking-widest text-ink-900/50">
              QUESTION 0{scenario.index} / 0{SCENARIOS.length}
            </div>
            <div className="font-serif text-sm font-semibold text-ink-900">
              第 {["一", "二", "三", "四"][scenario.index - 1]} 题 · {copy.subtitle}
            </div>
          </div>
        </div>
        <div className="flex gap-1.5">
          {SCENARIOS.map((s, i) => (
            <span
              key={s.id}
              className={`h-1.5 w-7 transition-colors ${
                i <= currentScenarioIndex ? "bg-ink-900" : "bg-ink-900/15"
              }`}
            />
          ))}
        </div>
      </header>

      {/* 进度条 */}
      <div className="mt-3 h-px w-full bg-ink-900/10">
        <motion.div
          className="h-full bg-cinnabar"
          initial={{ width: 0 }}
          animate={{ width: `${(scenario.index / SCENARIOS.length) * 100}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>

      {/* 情境文案 */}
      <motion.section
        key={scenario.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="mt-7 flex h-[100px] flex-col items-center justify-center text-center"
      >
        <div className="font-mono text-[10px] tracking-[0.3em] text-ink-900/40">
          SCENE
        </div>
        <p className="mx-auto mt-2 max-w-[16em] font-kai text-lg leading-relaxed text-ink-900">
          <CharStream text={copy.prompt} step={45} />
        </p>
        <p className="mt-2 font-mono text-[10px] tracking-widest text-cinnabar/70">
          {copy.hint}
        </p>
      </motion.section>

      {/* 棋盘 */}
      <div className="mt-6 flex flex-1 items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <GoBoard
            stones={scenario.stones}
            userMove={userMove}
            focus={scenario.focus}
            onPlace={handlePlace}
            disabled={phase !== "play"}
            size={320}
          />
          {/* 零基础 A/B 选项浮层 */}
          {isBeginner && phase === "play" && (
            <OptionOverlays areas={optionAreas} />
          )}
        </motion.div>
      </div>

      {/* 底部提示区 - 固定高度，无确认按钮 */}
      <div className="mt-6 h-[80px] flex flex-col items-center justify-center text-center">
        <AnimatePresence mode="wait">
          {phase === "play" && (
            <motion.footer
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-mono text-[11px] tracking-widest text-ink-900/40"
            >
              点击棋盘落子 · 凭第一反应
            </motion.footer>
          )}

          {phase === "placed" && (
            <motion.footer
              key="placed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-mono text-[11px] tracking-widest text-cinnabar"
            >
              已落子 · 正在进入下一题
            </motion.footer>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
