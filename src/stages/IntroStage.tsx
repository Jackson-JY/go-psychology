import { useState } from "react";
import { motion } from "framer-motion";
import InkParticles from "@/components/InkParticles";
import Seal from "@/components/Seal";
import ShareQR from "@/components/ShareQR";
import { useGameStore, type ExperienceLevel } from "@/store";
import { trackEvent, fetchScenarioConfig } from "@/lib/api";

export default function IntroStage() {
  const start = useGameStore((s) => s.start);
  const setScenarios = useGameStore((s) => s.setScenarios);
  const [loading, setLoading] = useState(false);
  const [showSgfComingSoon, setShowSgfComingSoon] = useState(false);

  const handleStart = async (level: ExperienceLevel) => {
    setLoading(true);
    trackEvent("test_start", { experienceLevel: level });
    try {
      const config = await fetchScenarioConfig();
      setScenarios(config.map((c) => c.scenario));
    } catch {
      // 加载失败也继续，PlayStage 有空数组保护
    }
    start(level);
  };

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center overflow-x-hidden bg-paper-100 px-6 py-8">
      <InkParticles />
      <ShareQR delay={0.8} floating />

      {/* 顶部 logo 印 */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Seal char="墨" size={28} />
          <span className="font-mono text-[10px] tracking-[0.3em] text-ink-900/60">
            MO·PSYCHE
          </span>
        </div>
        <span className="font-mono text-[10px] tracking-widest text-ink-900/40">
          v0.1 · 9×9
        </span>
      </motion.div>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mb-4"
        >
          <div className="font-serif text-[64px] leading-none text-ink-900 sm:text-[80px]" style={{ fontWeight: 900 }}>
            黑白
          </div>
          <div className="font-serif text-[34px] font-semibold leading-none text-cinnabar -mt-1 sm:text-[42px]">
            潜意识
          </div>
          <div className="mx-auto mt-2 h-px w-12 bg-ink-900/40" />
          <div className="mt-2 font-mono text-[9px] tracking-[0.4em] text-ink-900/50">
            AI · GO · PSYCHE
          </div>
        </motion.div>

        <div className="mb-6 space-y-1">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="font-kai text-lg leading-relaxed text-ink-900"
          >
            你以为你在下棋，
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.8 }}
            className="font-kai text-lg leading-relaxed text-ink-900"
          >
            其实是你的
            <span className="font-semibold text-cinnabar">潜意识</span>
            在做决定。
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.6 }}
          className="flex flex-col gap-3"
        >
          <p className="mb-2 font-mono text-[10px] tracking-widest text-ink-900/50">
            你的围棋水平？
          </p>
          <button
            onClick={() => handleStart("beginner")}
            disabled={loading}
            className="btn-ink !px-6 !py-3 text-sm disabled:opacity-50"
          >
            {loading ? "加载中..." : "从未下过围棋 →"}
          </button>
          <button
            onClick={() => handleStart("skilled")}
            disabled={loading}
            className="rounded-sm border border-ink-900/20 bg-paper-100 px-6 py-3 font-kai text-sm text-ink-900 transition-colors hover:bg-ink-900 hover:text-paper-100 disabled:opacity-50"
          >
            了解围棋基本规则 →
          </button>
          <div className="my-1 h-px w-full bg-ink-900/10" />
          <button
            onClick={() => setShowSgfComingSoon(true)}
            className="flex items-center justify-center gap-2 rounded-sm border border-cinnabar/20 bg-cinnabar/5 px-6 py-3 font-kai text-sm text-cinnabar transition-colors hover:bg-cinnabar hover:text-white"
          >
            <span className="font-mono text-[10px]">SGF</span>
            上传棋谱深度分析 →
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.0, duration: 0.6 }}
          className="mt-6 flex flex-col items-center gap-1 font-mono text-[10px] tracking-widest text-ink-900/40"
        >
          <span>4 关残局 · 1 分钟 · 即玩即测</span>
          <span className="text-cinnabar/60">凭第一直觉落子</span>
        </motion.div>
      </main>

      <footer className="mt-4 font-mono text-[9px] tracking-widest text-ink-900/30">
        BAI · DAO · PSYCHE / 黑白潜意识心理沙盘
      </footer>

      {/* SGF 棋谱分析 · 开发中浮层 */}
      {showSgfComingSoon && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 px-6 backdrop-blur-sm"
          onClick={() => setShowSgfComingSoon(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-sm border border-ink-900/10 bg-paper-100 p-6 shadow-2xl"
          >
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-cinnabar/30 bg-cinnabar/5">
                <span className="font-serif text-xl text-cinnabar">棋</span>
              </div>
              <h3 className="font-serif text-lg font-semibold text-ink-900">
                正在接入 KataGo
              </h3>
              <p className="mt-1 font-mono text-[10px] tracking-[0.25em] text-ink-900/40">
                SGF DEEP ANALYSIS · WIP
              </p>
            </div>

            <p className="mt-5 font-kai text-[13px] leading-relaxed text-ink-900/65 text-center">
              上传棋谱的深度分析功能正在开发中，
              <br />
              我们正在接入 <span className="font-semibold text-cinnabar">KataGo</span> 引擎，
              <br />
              结合每步棋的胜率波动幅度进行潜意识分析，
              <br />
              叠加棋力评估与五维心理模型，
              <br />
              为你的每一局棋，写一份更准确的专属侧写。
            </p>
            <p className="mt-4 font-kai text-[12px] leading-relaxed text-ink-900/50 text-center">
              敬请期待。
              <br />
              欢迎加好友入群，第一时间获得最新进展。
              <br />
              <span className="text-[11px] text-cinnabar/70">
                若这个项目让你有所期待，也可以清茶一杯，共赴此局 ☕
              </span>
            </p>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center">
                <div className="rounded-md border border-cinnabar/20 p-1.5 bg-white">
                  <img
                    src="/receive.jpg"
                    alt="清茶一杯"
                    className="h-24 w-24 rounded-sm object-contain"
                  />
                </div>
                <span className="mt-2 font-kai text-[10px] text-ink-900/50">清茶 · 支持</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="rounded-md border border-cinnabar/25 p-1.5 bg-white">
                  <img
                    src="/weixin.jpg"
                    alt="加好友入群"
                    className="h-24 w-24 rounded-sm object-contain"
                  />
                </div>
                <span className="mt-2 font-kai text-[10px] text-ink-900/50">加好友 · 入群</span>
              </div>
            </div>

            <button
              onClick={() => setShowSgfComingSoon(false)}
              className="mt-6 w-full rounded-sm bg-ink-900 px-4 py-2.5 font-kai text-sm text-paper-100 transition-colors hover:bg-cinnabar"
            >
              我知道了
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
