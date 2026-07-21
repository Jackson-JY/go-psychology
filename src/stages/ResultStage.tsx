import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import RadarChart from "@/components/RadarChart";
import Seal from "@/components/Seal";
import { useGameStore } from "@/store";

export default function ResultStage() {
  const { result, error, goPoster, restart } = useGameStore();
  const [typedComment, setTypedComment] = useState("");

  // 打字机效果
  useEffect(() => {
    if (!result) return;
    setTypedComment("");
    let i = 0;
    const text = result.comment;
    const id = setInterval(() => {
      i += 1;
      setTypedComment(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 22);
    return () => clearInterval(id);
  }, [result]);

  if (error || !result) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-paper-100 px-6 text-center">
        <Seal char="失" size={48} />
        <p className="font-kai text-lg text-ink-900">
          {error || "侧写失败，请重试"}
        </p>
        <button onClick={restart} className="btn-ink">
          重新开始
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-[100dvh] bg-paper-100 px-5 py-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mx-auto flex max-w-md flex-col"
      >
        {/* 标题 */}
        <header className="text-center">
          <div className="font-mono text-[10px] tracking-[0.4em] text-ink-900/40">
            SUBCONSCIOUS PROFILE
          </div>
          <h2 className="mt-1 font-serif text-2xl font-bold text-ink-900">
            潜意识侧写
          </h2>
          <div className="mx-auto mt-2 h-px w-12 bg-cinnabar" />
        </header>

        {/* 一句话人设 */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-8 flex flex-col items-center text-center"
        >
          <div className="mb-2 font-mono text-[10px] tracking-widest text-ink-900/40">
            你的底色
          </div>
          <div className="font-serif text-3xl font-black leading-tight text-cinnabar">
            「{result.headline}」
          </div>
        </motion.section>

        {/* 雷达图 */}
        <motion.section
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6"
        >
          <RadarChart data={result.radar} size={260} />
        </motion.section>

        {/* 标签云 */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-4 flex flex-wrap justify-center gap-2"
        >
          {result.tags.map((tag, i) => (
            <span
              key={tag}
              className={`rounded-sm px-2.5 py-1 font-kai text-xs ${
                i % 3 === 0
                  ? "bg-cinnabar text-paper-50"
                  : i % 3 === 1
                    ? "bg-ink-900 text-paper-100"
                    : "bg-paper-300 text-ink-900"
              }`}
            >
              # {tag}
            </span>
          ))}
        </motion.section>

        {/* AI 评语（打字机） */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-8 border-l-2 border-cinnabar/60 pl-4"
        >
          <p className="whitespace-pre-wrap font-kai text-[15px] leading-relaxed text-ink-900">
            {typedComment}
            <span className="ml-0.5 inline-block h-4 w-px bg-cinnabar align-middle animate-pulse" />
          </p>
        </motion.section>

        {/* 来源徽标 */}
        <div className="mt-3 text-right">
          <span
            className={`font-mono text-[9px] tracking-widest ${
              result.source === "deepseek" ? "text-ink-900/50" : "text-ink-900/30"
            }`}
          >
            {result.source === "deepseek"
              ? "● DEEPSEEK GENERATED"
              : "○ DEMO MODE（mock）"}
          </span>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="mt-8 flex flex-col items-center gap-3"
        >
          <button onClick={goPoster} className="btn-ink w-full max-w-xs">
            生成专属海报 →
          </button>
          <button
            onClick={restart}
            className="font-mono text-[11px] tracking-widest text-ink-900/40 underline-offset-4 hover:underline"
          >
            重新测试
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
