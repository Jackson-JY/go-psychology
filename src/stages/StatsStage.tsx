import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "@/store";
import { fetchStats } from "@/lib/api";
import type { StatsSummary } from "@/lib/types";

const EVENT_LABELS: Record<string, string> = {
  test_start: "开始测试",
  test_complete: "完成测试",
  poster_generate: "生成海报",
  poster_download: "下载海报",
  sgf_analyze: "SGF 分析",
  image_analyze: "图片分析",
  scenario_save: "保存题目",
};

export default function StatsStage() {
  const restart = useGameStore((s) => s.restart);
  const [password, setPassword] = useState("");
  const [days, setDays] = useState(7);
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (!authed) return;
    setLoading(true);
    setError(null);
    fetchStats(password, days)
      .then((data) => {
        setStats(data);
      })
      .catch((err) => {
        setError(err.message);
        if (err.message.includes("密码")) {
          setAuthed(false);
        }
      })
      .finally(() => setLoading(false));
  }, [authed, days, password]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setAuthed(true);
  };

  if (!authed) {
    return (
      <div className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-paper-100 px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm space-y-6 rounded-sm border border-ink-900/10 bg-white/50 p-6 shadow-sm"
        >
          <div className="text-center">
            <h1 className="font-serif text-2xl font-semibold text-ink-900">数据概览</h1>
            <p className="mt-2 font-mono text-[10px] tracking-widest text-ink-900/50">
              请输入管理密码查看统计
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="管理密码"
              className="w-full rounded-sm border border-ink-900/20 bg-paper-100 px-4 py-3 font-mono text-sm text-ink-900 outline-none focus:border-cinnabar"
            />
            {error && <p className="font-mono text-[10px] text-cinnabar">{error}</p>}
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full rounded-sm bg-ink-900 px-4 py-3 font-kai text-sm text-paper-100 transition-colors hover:bg-cinnabar disabled:opacity-50"
            >
              {loading ? "加载中..." : "查看数据"}
            </button>
          </form>

          <button
            onClick={restart}
            className="block w-full text-center font-mono text-[10px] tracking-widest text-ink-900/40 underline hover:text-cinnabar"
          >
            返回首页
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[100dvh] bg-paper-100 px-5 py-6">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-xl font-semibold text-ink-900">数据概览</h1>
          <p className="font-mono text-[10px] tracking-widest text-ink-900/50">访问与行为统计</p>
        </div>
        <div className="flex gap-2">
          <button onClick={restart} className="btn-outline text-xs">返回首页</button>
          <button onClick={() => setAuthed(false)} className="btn-outline text-xs">退出</button>
        </div>
      </header>

      <div className="mb-4 flex items-center gap-2">
        <span className="font-mono text-[10px] text-ink-900/50">近</span>
        {[7, 14, 30].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`rounded-sm px-2.5 py-1 text-xs ${
              days === d ? "bg-ink-900 text-paper-100" : "bg-ink-900/5 text-ink-900"
            }`}
          >
            {d} 天
          </button>
        ))}
      </div>

      {loading && <p className="font-mono text-xs text-ink-900/50">加载中...</p>}
      {error && <p className="font-mono text-xs text-cinnabar">{error}</p>}

      {stats && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* 核心指标 */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="总访问" value={stats.totalAccess} />
            <StatCard label="总事件" value={stats.totalEvents} />
            <StatCard label="今日 PV" value={stats.todayPv} />
            <StatCard label="今日 UV" value={stats.todayUv} />
          </div>

          {/* 事件分布 */}
          <section className="rounded-sm border border-ink-900/10 bg-white/50 p-4">
            <h2 className="mb-3 font-serif text-sm font-semibold text-ink-900">事件分布</h2>
            {stats.events.length === 0 ? (
              <p className="font-mono text-[10px] text-ink-900/40">暂无数据</p>
            ) : (
              <div className="space-y-2">
                {stats.events.map((e) => (
                  <div key={e.type} className="flex items-center justify-between">
                    <span className="font-kai text-xs text-ink-900">
                      {EVENT_LABELS[e.type] || e.type}
                    </span>
                    <span className="font-mono text-xs text-cinnabar">{e.count}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 每日访问 */}
          <section className="rounded-sm border border-ink-900/10 bg-white/50 p-4">
            <h2 className="mb-3 font-serif text-sm font-semibold text-ink-900">每日访问</h2>
            {stats.daily.length === 0 ? (
              <p className="font-mono text-[10px] text-ink-900/40">暂无数据</p>
            ) : (
              <div className="space-y-2">
                {stats.daily.map((d) => (
                  <div key={d.date} className="flex items-center justify-between">
                    <span className="font-mono text-xs text-ink-900/70">{d.date}</span>
                    <div className="flex gap-4">
                      <span className="font-mono text-xs text-ink-900">PV {d.pv}</span>
                      <span className="font-mono text-xs text-ink-900/60">UV {d.uv}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 最近事件 */}
          <section className="rounded-sm border border-ink-900/10 bg-white/50 p-4">
            <h2 className="mb-3 font-serif text-sm font-semibold text-ink-900">最近事件</h2>
            {stats.recentEvents.length === 0 ? (
              <p className="font-mono text-[10px] text-ink-900/40">暂无数据</p>
            ) : (
              <ul className="space-y-2">
                {stats.recentEvents.map((e) => (
                  <li key={e.id} className="border-b border-ink-900/5 pb-2 last:border-0">
                    <div className="flex items-center justify-between">
                      <span className="font-kai text-xs text-cinnabar">
                        {EVENT_LABELS[e.type] || e.type}
                      </span>
                      <span className="font-mono text-[9px] text-ink-900/40">
                        {new Date(e.createdAt * 1000).toLocaleString()}
                      </span>
                    </div>
                    {e.payload && (
                      <pre className="mt-1 overflow-x-auto font-mono text-[9px] text-ink-900/60">
                        {JSON.stringify(e.payload, null, 2)}
                      </pre>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </motion.div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-sm border border-ink-900/10 bg-white/50 p-3 text-center">
      <div className="font-mono text-[10px] tracking-widest text-ink-900/50">{label}</div>
      <div className="mt-1 font-serif text-2xl font-bold text-ink-900">{value}</div>
    </div>
  );
}
