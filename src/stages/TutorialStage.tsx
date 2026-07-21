import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GoBoard from "@/components/GoBoard";
import Seal from "@/components/Seal";
import { useGameStore } from "@/store";
import type { Coord, PlacedStone, StoneColor } from "@/lib/types";

type TutorialStep = 1 | 2;

const TUTORIAL_STEPS = [
  {
    step: 1 as TutorialStep,
    title: "棋子的生存",
    subtitle: "周围有空位才能活",
    description: "每颗棋子周围有上下左右4个空位，这些空位叫『气』。气被堵住，棋子就会被拿走。",
    hint: "观察这颗黑子，它的气被白子堵住了",
    stones: [
      { x: 4, y: 4, color: "B" as StoneColor },
      { x: 4, y: 3, color: "W" as StoneColor },
      { x: 4, y: 5, color: "W" as StoneColor },
      { x: 3, y: 4, color: "W" as StoneColor },
      { x: 5, y: 4, color: "W" as StoneColor },
    ],
    focus: { x: 4, y: 4 },
    highlightAreas: [{ x: 4, y: 4 }],
    expectedAction: "observe",
    successMessage: "这颗黑子没有气了，会被吃掉！",
    showCapture: true,
    capturedStones: [{ x: 4, y: 4, color: "B" as StoneColor }],
  },
  {
    step: 2 as TutorialStep,
    title: "亲手吃一子",
    subtitle: "轮到你来体验",
    description: "白子只有一口气了！点击黑点位置，堵住它的最后一口气，亲眼看着它被吃掉。",
    hint: "点击亮点位置，吃掉白子！",
    stones: [
      { x: 4, y: 4, color: "W" as StoneColor },
      { x: 4, y: 3, color: "B" as StoneColor },
      { x: 4, y: 5, color: "B" as StoneColor },
      { x: 3, y: 4, color: "B" as StoneColor },
    ],
    focus: undefined,
    highlightAreas: [{ x: 5, y: 4 }],
    expectedAction: "place",
    targetMove: { x: 5, y: 4 },
    successMessage: "爽！你成功吃掉了白子！",
    showCapture: true,
    capturedStones: [{ x: 4, y: 4, color: "W" as StoneColor }],
  },
];

export default function TutorialStage() {
  const startPlay = useGameStore((s) => s.startPlay);
  const [currentStep, setCurrentStep] = useState<TutorialStep>(1);
  const [userMove, setUserMove] = useState<Coord | null>(null);
  const [phase, setPhase] = useState<"play" | "success">("play");
  const [showCapture, setShowCapture] = useState(false);
  const [captured, setCaptured] = useState(false);

  const step = TUTORIAL_STEPS[currentStep - 1];

  useEffect(() => {
    setUserMove(null);
    setPhase("play");
    setShowCapture(false);
    setCaptured(false);
  }, [currentStep]);

  const handlePlace = (x: number, y: number) => {
    if (phase !== "play") return;
    
    if (currentStep === 2) {
      const target = (step as typeof TUTORIAL_STEPS[1]).targetMove;
      if (x !== target.x || y !== target.y) {
        return;
      }
    }
    
    setUserMove({ x, y });
  };

  const handleConfirm = () => {
    setPhase("success");
    setShowCapture(true);

    setTimeout(() => {
      setCaptured(true);
    }, 800);

    setTimeout(() => {
      if (currentStep < 2) {
        setCurrentStep((prev) => (prev + 1) as TutorialStep);
      } else {
        startPlay();
      }
    }, 2500);
  };

  const handleNext = () => {
    setPhase("success");
    setShowCapture(true);
    
    setTimeout(() => {
      setCaptured(true);
    }, 800);
    
    setTimeout(() => {
      if (currentStep < 2) {
        setCurrentStep((prev) => (prev + 1) as TutorialStep);
      } else {
        startPlay();
      }
    }, 2500);
  };

  const displayStones = captured && step.showCapture
    ? step.stones.filter(s => !step.capturedStones.some(c => c.x === s.x && c.y === s.y))
    : step.stones;

  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-paper-100 px-5 py-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Seal char="学" size={32} />
          <div className="leading-tight">
            <div className="font-mono text-[10px] tracking-widest text-ink-900/50">
              RULES
            </div>
            <div className="font-serif text-sm font-semibold text-ink-900">
              规则速成 {currentStep}/2
            </div>
          </div>
        </div>
        <div className="flex gap-1.5">
          {[1, 2].map((i) => (
            <span
              key={i}
              className={`h-1.5 w-10 transition-colors ${
                i < currentStep ? "bg-cinnabar" : i === currentStep ? "bg-ink-900" : "bg-ink-900/15"
              }`}
            />
          ))}
        </div>
      </header>

      <div className="mt-3 h-px w-full bg-ink-900/10">
        <motion.div
          className="h-full bg-cinnabar"
          initial={{ width: 0 }}
          animate={{ width: `${((currentStep - 1) / 2) * 100}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>

      <motion.section
        key={currentStep}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.4 }}
        className="mt-7 flex h-[130px] flex-col items-center justify-center text-center"
      >
        <div className="font-mono text-[10px] tracking-[0.3em] text-ink-900/40">
          STEP 0{currentStep}
        </div>
        <h2 className="mt-2 font-serif text-2xl font-semibold text-ink-900">
          {step.title}
        </h2>
        <p className="mt-1 font-mono text-[11px] tracking-widest text-cinnabar">
          {step.subtitle}
        </p>
        <p className="mx-auto mt-4 max-w-[20em] font-kai text-base leading-relaxed text-ink-900/80">
          {step.description}
        </p>
      </motion.section>

      <div className="mt-6 flex flex-1 items-center justify-center">
        <motion.div
          key={`board-${currentStep}-${captured}`}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <GoBoard
            stones={displayStones}
            userMove={userMove}
            focus={step.focus}
            highlightAreas={step.highlightAreas}
            onPlace={handlePlace}
            disabled={phase !== "play"}
            size={320}
            showHint
          />
        </motion.div>
      </div>

      <AnimatePresence>
        {showCapture && !captured && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-cinnabar text-white px-4 py-2 rounded-full font-mono text-sm tracking-wider shadow-lg">
              提子！
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 h-[100px]">
        <AnimatePresence mode="wait">
          {phase === "success" && captured && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex h-full flex-col items-center justify-center text-center"
            >
              <div className="font-mono text-sm tracking-widest text-cinnabar animate-pulse">
                ✓ {step.successMessage}
              </div>
              <div className="mt-2 font-mono text-[10px] tracking-widest text-ink-900/40">
                {currentStep < 2 ? "继续..." : "开始测试..."}
              </div>
            </motion.div>
          )}

          {phase === "play" && !userMove && (
            <motion.footer
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full flex-col items-center justify-center text-center"
            >
              <p className="font-mono text-[11px] tracking-widest text-ink-900/50 mb-2">
                {step.hint}
              </p>
              {step.expectedAction === "observe" && (
                <button
                  onClick={handleNext}
                  className="btn-ink !px-6 !py-2 text-sm"
                >
                  明白了 →
                </button>
              )}
            </motion.footer>
          )}

          {phase === "play" && userMove && step.expectedAction === "place" && (
            <motion.footer
              key="confirm"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex h-full flex-col items-center justify-center gap-2"
            >
              <div className="font-mono text-[11px] tracking-widest text-cinnabar animate-pulse">
                就在这里！
              </div>
              <button
                onClick={handleConfirm}
                className="btn-ink !px-6 !py-2 text-sm"
              >
                吃掉它！ →
              </button>
            </motion.footer>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}