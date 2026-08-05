import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import RadarChart from "@/components/RadarChart";

import Seal from "@/components/Seal";
import { useGameStore } from "@/store";
import {
  matchArchetype,
  getArchetypeSvgUrl,
} from "@/lib/archetypes";

export default function ResultStage() {
  const { result, error, goPoster, restart, gender, setGender } = useGameStore();
  const [typedComment, setTypedComment] = useState("");

  const archetype = useMemo(() => {
    if (!result) return null;
    return matchArchetype(result.radar);
  }, [result]);

  const archetypeImgUrl = useMemo(() => {
    if (!archetype) return "";
    return getArchetypeSvgUrl(archetype, gender);
  }, [archetype, gender]);

  useEffect(() => {
    if (!result) return;
    setTypedComment("");
    let i = 0;
    const text = result.comment;
    const id = setInterval(() => {
      i += 1;
      setTypedComment(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 18);
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
    <div className="min-h-[100dvh] bg-paper-100">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mx-auto flex max-w-md flex-col"
      >
        <header className="text-center pt-6 pb-4">
          <div className="font-mono text-[10px] tracking-[0.4em] text-ink-900/40">
            SUBCONSCIOUS PROFILE
          </div>
          <h2 className="mt-1 font-serif text-2xl font-bold text-ink-900">
            潜意识侧写
          </h2>
          <div className="mx-auto mt-2 h-px w-12 bg-cinnabar" />
        </header>

        {/* 人物原型卡片 */}
        {archetype && (
          <motion.section
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="mx-5 mb-5"
          >
            <div className="relative overflow-hidden rounded-lg border border-ink-900/8 bg-paper-200">
              <div className="flex flex-col items-center p-4">
                <div className="relative">
                  <img
                    src={archetypeImgUrl}
                    alt={archetype.name}
                    className="h-auto w-40 rounded-md shadow-md"
                  />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-cinnabar px-3 py-0.5 font-kai text-[10px] text-paper-100">
                    你的原型
                  </div>
                </div>
                <div className="mt-5 text-center">
                  <h3 className="font-serif text-xl font-bold text-ink-900">
                    「{archetype.name}」
                  </h3>
                  <p className="mt-1 font-mono text-[10px] tracking-widest text-ink-900/40">
                    {archetype.subtitle}
                  </p>
                </div>
                <p className="mt-3 text-center font-kai text-[13px] leading-relaxed text-ink-900/70">
                  {archetype.description}
                </p>
                {/* 性别切换 */}
                <div className="mt-4 flex items-center gap-3">
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
        )}

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="px-5 text-center"
        >
          <div className="mb-2 font-mono text-[10px] tracking-widest text-ink-900/40">
            你的底色
          </div>
          <div className="font-serif text-3xl font-black leading-tight text-cinnabar">
            「{result.headline}」
          </div>
        </motion.section>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="px-5 pb-8 space-y-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-2"
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-paper-200 rounded-lg p-4"
          >
            <div className="font-mono text-[10px] tracking-widest text-ink-900/40 mb-3 text-center">
              潜意识维度
            </div>
            <RadarChart data={result.radar} size={280} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="border-l-2 border-cinnabar/60 pl-4"
          >
            <p className="whitespace-pre-wrap font-kai text-[15px] leading-relaxed text-ink-900">
              {typedComment}
              <span className="ml-0.5 inline-block h-4 w-px bg-cinnabar align-middle animate-pulse" />
            </p>
          </motion.div>

          {result.deepReport.insights.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-cinnabar/5 rounded-lg p-4 border border-cinnabar/20"
            >
              <div className="font-serif font-bold mb-3 text-lg text-cinnabar">关键洞察</div>
              <ul className="space-y-2">
                {result.deepReport.insights.map((insight, i) => (
                  <li key={i} className="font-kai text-sm text-ink-900/80 leading-relaxed">
                    <span className="text-cinnabar mr-2">◆</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          <div className="text-right pt-4">
            <span
              className={`font-mono text-[9px] tracking-widest ${
                result.source === "deepseek" ? "text-ink-900/50" : "text-ink-900/30"
              }`}
            >
              {result.source === "deepseek"
                ? "● DEEPSEEK GENERATED"
                : "○ DEMO MODE"}
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="px-5 pb-8 flex flex-col items-center gap-3"
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

        {/* 支持作者 */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          className="px-5 pb-10"
        >
          <div className="rounded-lg border border-ink-900/8 bg-paper-200/60 p-5">
            <div className="mb-1 text-center">
              <div className="font-mono text-[10px] tracking-[0.3em] text-ink-900/40">
                SUPPORT · 连接作者
              </div>
              <p className="mt-2 font-kai text-[13px] leading-relaxed text-ink-900/60">
                如果这次测写触动了你，
                <br />
                可以请作者喝杯茶 ☕
                <br />
                <span className="text-[11px] text-ink-900/40">
                  用于服务器维护与接入 KataGo / DeepSeek 更精准分析
                </span>
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="flex flex-col items-center">
                <img
                  src="/receive.jpg"
                  alt="赞赏码"
                  className="h-32 w-32 rounded-md border border-ink-900/10 object-contain bg-white"
                />
                <span className="mt-2 font-kai text-[11px] text-ink-900/50">赞赏支持</span>
              </div>
              <div className="flex flex-col items-center">
                <img
                  src="/weixin.png"
                  alt="微信二维码"
                  className="h-32 w-32 rounded-md border border-ink-900/10 object-contain bg-white"
                />
                <span className="mt-2 font-kai text-[11px] text-ink-900/50">加好友 · 进群</span>
              </div>
            </div>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}