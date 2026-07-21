import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import RadarChart from "@/components/RadarChart";
import HeatmapChart from "@/components/HeatmapChart";
import Seal from "@/components/Seal";
import { useGameStore } from "@/store";

export default function ResultStage() {
  const { result, error, goPoster, restart } = useGameStore();
  const [typedComment, setTypedComment] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

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

  const tabs = [
    { id: "overview", label: "概览" },
    { id: "personality", label: "人格" },
    { id: "career", label: "职场" },
    { id: "investment", label: "投资" },
    { id: "deep", label: "深度" },
  ];

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

        <div className="flex justify-center gap-1 px-5 mt-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 font-mono text-[10px] tracking-wider transition-colors ${
                activeTab === tab.id
                  ? "bg-ink-900 text-paper-100"
                  : "text-ink-900/50 hover:text-ink-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="px-5 pb-8"
        >
          {activeTab === "overview" && (
            <div className="space-y-6">
              <RadarChart data={result.radar} size={280} />
              
              <div className="flex flex-wrap justify-center gap-2">
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
              </div>

              <div className="border-l-2 border-cinnabar/60 pl-4">
                <p className="whitespace-pre-wrap font-kai text-[15px] leading-relaxed text-ink-900">
                  {typedComment}
                  <span className="ml-0.5 inline-block h-4 w-px bg-cinnabar align-middle animate-pulse" />
                </p>
              </div>

              <div className="text-right">
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
            </div>
          )}

          {activeTab === "personality" && (
            <div className="space-y-6">
              <div className="bg-paper-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-cinnabar text-white font-serif text-xl font-bold flex items-center justify-center rounded">
                    {result.mbti.type}
                  </div>
                  <div>
                    <div className="font-serif font-bold text-lg">{result.mbti.title}</div>
                    <div className="font-kai text-sm text-ink-900/60">{result.mbti.subtitle}</div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {Object.entries(result.mbti.scores).map(([key, value]) => (
                    <div key={key} className="bg-paper-100 rounded p-2">
                      <div className="font-mono text-xs text-ink-900/50 uppercase">{key}</div>
                      <div className="font-bold text-cinnabar">{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-paper-200 rounded-lg p-4">
                <div className="font-serif font-bold mb-3 text-lg">大五人格</div>
                <div className="font-kai text-sm text-ink-900/80 mb-4">{result.bigFive.description}</div>
                <div className="space-y-3">
                  {[
                    { label: "开放性", value: result.bigFive.openness, key: "O" },
                    { label: "尽责性", value: result.bigFive.conscientiousness, key: "C" },
                    { label: "外向性", value: result.bigFive.extraversion, key: "E" },
                    { label: "宜人性", value: result.bigFive.agreeableness, key: "A" },
                    { label: "情绪稳定", value: 100 - result.bigFive.neuroticism, key: "N" },
                  ].map((item) => (
                    <div key={item.key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-kai">{item.label}</span>
                        <span className="font-mono text-cinnabar">{item.value}</span>
                      </div>
                      <div className="h-1.5 bg-paper-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-cinnabar rounded-full transition-all duration-500"
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-paper-200 rounded-lg p-4">
                <div className="font-serif font-bold mb-3 text-lg">落子热力图</div>
                <HeatmapChart data={result.heatmap} />
              </div>
            </div>
          )}

          {activeTab === "career" && (
            <div className="space-y-6">
              <div className="bg-paper-200 rounded-lg p-4">
                <div className="font-serif font-bold mb-3 text-lg">适合岗位</div>
                <div className="flex flex-wrap gap-2">
                  {result.career.suitableRoles.map((role) => (
                    <span key={role} className="bg-ink-900 text-paper-100 px-3 py-1 rounded font-kai text-sm">
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-paper-200 rounded-lg p-4">
                <div className="font-serif font-bold mb-2 text-lg">领导力风格</div>
                <p className="font-kai text-sm text-ink-900/80">{result.career.leadershipStyle}</p>
              </div>

              <div className="bg-paper-200 rounded-lg p-4">
                <div className="font-serif font-bold mb-2 text-lg">协作风格</div>
                <p className="font-kai text-sm text-ink-900/80">{result.career.collaborationStyle}</p>
              </div>

              <div className="bg-paper-200 rounded-lg p-4">
                <div className="font-serif font-bold mb-3 text-lg">成长领域</div>
                <ul className="space-y-2">
                  {result.career.growthAreas.map((area, i) => (
                    <li key={i} className="flex items-start gap-2 font-kai text-sm text-ink-900/80">
                      <span className="text-cinnabar mt-1">●</span>
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === "investment" && (
            <div className="space-y-6">
              <div className="bg-paper-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`px-3 py-1 rounded font-mono text-xs ${
                    result.investment.riskLevel === "aggressive" ? "bg-red-100 text-red-700" :
                    result.investment.riskLevel === "moderate" ? "bg-yellow-100 text-yellow-700" :
                    "bg-green-100 text-green-700"
                  }`}>
                    {result.investment.riskLevel === "aggressive" ? "进取型" :
                     result.investment.riskLevel === "moderate" ? "平衡型" : "稳健型"}
                  </div>
                  <div className="font-serif font-bold text-lg">{result.investment.type}</div>
                </div>
              </div>

              <div className="bg-paper-200 rounded-lg p-4">
                <div className="font-serif font-bold mb-3 text-lg">适合策略</div>
                <ul className="space-y-2">
                  {result.investment.suitableStrategies.map((strat, i) => (
                    <li key={i} className="flex items-start gap-2 font-kai text-sm text-ink-900/80">
                      <span className="text-cinnabar mt-1">○</span>
                      <span>{strat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-paper-200 rounded-lg p-4">
                <div className="font-serif font-bold mb-3 text-lg">常见误区</div>
                <ul className="space-y-2">
                  {result.investment.pitfalls.map((pitfall, i) => (
                    <li key={i} className="flex items-start gap-2 font-kai text-sm text-red-700">
                      <span className="text-red-500 mt-1">●</span>
                      <span>{pitfall}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-paper-200 rounded-lg p-4">
                <div className="font-serif font-bold mb-3 text-lg">投资建议</div>
                <ul className="space-y-2">
                  {result.investment.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 font-kai text-sm text-ink-900/80">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === "deep" && (
            <div className="space-y-6">
              {result.deepReport.strengths.length > 0 && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="font-serif font-bold mb-3 text-lg text-green-800">核心优势</div>
                  <div className="space-y-3">
                    {result.deepReport.strengths.map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between mb-1">
                          <span className="font-kai font-bold">{item.dimension}</span>
                          <span className="font-mono text-green-600">{item.score}</span>
                        </div>
                        <p className="font-kai text-sm text-ink-900/70">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.deepReport.weaknesses.length > 0 && (
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <div className="font-serif font-bold mb-3 text-lg text-yellow-800">待改进</div>
                  <div className="space-y-3">
                    {result.deepReport.weaknesses.map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between mb-1">
                          <span className="font-kai font-bold">{item.dimension}</span>
                          <span className="font-mono text-yellow-600">{item.score}</span>
                        </div>
                        <p className="font-kai text-sm text-ink-900/70">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.deepReport.insights.length > 0 && (
                <div className="bg-paper-200 rounded-lg p-4">
                  <div className="font-serif font-bold mb-3 text-lg">关键洞察</div>
                  <ul className="space-y-3">
                    {result.deepReport.insights.map((insight, i) => (
                      <li key={i} className="font-kai text-sm text-ink-900/80 leading-relaxed">
                        <span className="text-cinnabar mr-2">◆</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
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
      </motion.div>
    </div>
  );
}
