import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GoBoard from "@/components/GoBoard";
import CharStream from "@/components/CharStream";
import Seal from "@/components/Seal";
import { SCENARIOS, useGameStore } from "@/store";
import { analyzeMoves } from "@/lib/api";
import type { Coord } from "@/lib/types";

export default function PlayStage() {
  const {
    currentScenarioIndex,
    recordMove,
    nextScenario,
    setResult,
    setError,
  } = useGameStore();

  const scenario = SCENARIOS[currentScenarioIndex];
  const [userMove, setUserMove] = useState<Coord | null>(null);
  const [phase, setPhase] = useState<"play" | "confirm">("play");
  const [progressText, setProgressText] = useState("");

  // 切关时重置
  useEffect(() => {
    setUserMove(null);
    setPhase("play");
    setProgressText("");
  }, [currentScenarioIndex]);

  const handlePlace = (x: number, y: number) => {
    if (phase !== "play") return;
    setUserMove({ x, y });
    setPhase("confirm");
  };

  const handleConfirm = async () => {
    if (!userMove) return;
    recordMove(scenario.id, userMove.x, userMove.y);

    if (currentScenarioIndex < SCENARIOS.length - 1) {
      setProgressText("好棋。下一关。");
      setTimeout(() => nextScenario(), 900);
    } else {
      // 最后一关：进入 loading 后调 API
      useGameStore.setState({ stage: "loading" });
      try {
        const finalMoves = useGameStore.getState().moves;
        const res = await analyzeMoves(finalMoves);
        setResult(res);
      } catch (err) {
        setError((err as Error).message || "分析失败，请重试");
      }
    }
  };

  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-paper-100 px-5 py-6">
      {/* 顶部：进度 + 关卡 */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Seal char={scenario.title} size={32} />
          <div className="leading-tight">
            <div className="font-mono text-[10px] tracking-widest text-ink-900/50">
              CASE 0{scenario.index} / 03
            </div>
            <div className="font-serif text-sm font-semibold text-ink-900">
              第 {["一", "二", "三"][scenario.index - 1]} 关 · {scenario.subtitle}
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
        className="mt-7 text-center"
      >
        <div className="font-mono text-[10px] tracking-[0.3em] text-ink-900/40">
          SCENE
        </div>
        <p className="mx-auto mt-2 max-w-[16em] font-kai text-lg leading-relaxed text-ink-900">
          <CharStream text={scenario.prompt} step={45} />
        </p>
        <p className="mt-2 font-mono text-[10px] tracking-widest text-cinnabar/70">
          {scenario.hint}
        </p>
      </motion.section>

      {/* 棋盘 */}
      <div className="mt-6 flex flex-1 items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <GoBoard
            stones={scenario.stones}
            userMove={userMove}
            focus={scenario.focus}
            onPlace={handlePlace}
            disabled={phase !== "play"}
            size={320}
          />
        </motion.div>
      </div>

      {/* 底部确认区 */}
      <AnimatePresence mode="wait">
        {phase === "play" && (
          <motion.footer
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-6 text-center font-mono text-[11px] tracking-widest text-ink-900/40"
          >
            点击交叉点落子 · 凭第一直觉
          </motion.footer>
        )}

        {phase === "confirm" && (
          <motion.footer
            key="confirm"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 flex flex-col items-center gap-3"
          >
            <div className="font-mono text-[11px] tracking-widest text-cinnabar">
              {progressText || "确认这一手？"}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setUserMove(null);
                  setPhase("play");
                }}
                className="font-mono text-[11px] tracking-widest text-ink-900/50 underline-offset-4 hover:underline"
              >
                ← 重选
              </button>
              <button
                onClick={handleConfirm}
                className="btn-ink !px-6 !py-2 text-sm"
              >
                {currentScenarioIndex < SCENARIOS.length - 1
                  ? "下一手 →"
                  : "出侧写 →"}
              </button>
            </div>
          </motion.footer>
        )}
      </AnimatePresence>
    </div>
  );
}
