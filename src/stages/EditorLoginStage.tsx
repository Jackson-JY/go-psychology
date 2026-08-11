import { useState } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "@/store";
import { fetchScenarioConfig } from "@/lib/api";

export default function EditorLoginStage() {
  const goEditor = useGameStore((s) => s.goEditor);
  const setScenarios = useGameStore((s) => s.setScenarios);
  const goAdmin = useGameStore((s) => s.goAdmin);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // 通过带密码请求验证身份，密码错误时后端会返回 401
      const res = await fetch("/api/scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "密码错误");
      }
      const config = await fetchScenarioConfig();
      setScenarios(config.map((c) => c.scenario));
      goEditor();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-paper-100 px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-6 rounded-sm border border-ink-900/10 bg-white/50 p-6 shadow-sm"
      >
        <div className="text-center">
          <h1 className="font-serif text-2xl font-semibold text-ink-900">管理题目</h1>
          <p className="mt-2 font-mono text-[10px] tracking-widest text-ink-900/50">
            请输入编辑密码进入
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="编辑密码"
            className="w-full rounded-sm border border-ink-900/20 bg-paper-100 px-4 py-3 font-mono text-sm text-ink-900 outline-none focus:border-cinnabar"
          />
          {error && (
            <p className="font-mono text-[10px] text-cinnabar">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full rounded-sm bg-ink-900 px-4 py-3 font-kai text-sm text-paper-100 transition-colors hover:bg-cinnabar disabled:opacity-50"
          >
            {loading ? "验证中..." : "进入编辑器"}
          </button>
        </form>

        <button
          onClick={goAdmin}
          className="block w-full text-center font-mono text-[10px] tracking-widest text-ink-900/40 underline hover:text-cinnabar"
        >
          返回后台
        </button>
      </motion.div>
    </div>
  );
}
