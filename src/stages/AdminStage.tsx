import { motion } from "framer-motion";
import { useGameStore } from "@/store";

export default function AdminStage() {
  const goEditorLogin = useGameStore((s) => s.goEditorLogin);
  const goStats = useGameStore((s) => s.goStats);
  const restart = useGameStore((s) => s.restart);

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-paper-100 px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-6"
      >
        <div className="text-center">
          <h1 className="font-serif text-2xl font-semibold text-ink-900">后台管理</h1>
          <p className="mt-2 font-mono text-[10px] tracking-widest text-ink-900/50">
            ADMIN · 管理控制台
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={goEditorLogin}
            className="flex w-full items-center gap-4 rounded-sm border border-ink-900/10 bg-white/50 p-4 text-left transition-colors hover:border-cinnabar/30 hover:bg-cinnabar/5"
          >
            <span className="font-serif text-2xl text-cinnabar/70">题</span>
            <div className="flex-1">
              <div className="font-kai text-sm font-medium text-ink-900">管理题目</div>
              <div className="font-mono text-[10px] text-ink-900/40">
                编辑 9×9 / 13×13 测试题目配置
              </div>
            </div>
            <span className="font-mono text-[10px] text-ink-900/30">→</span>
          </button>

          <button
            onClick={goStats}
            className="flex w-full items-center gap-4 rounded-sm border border-ink-900/10 bg-white/50 p-4 text-left transition-colors hover:border-cinnabar/30 hover:bg-cinnabar/5"
          >
            <span className="font-serif text-2xl text-cinnabar/70">数</span>
            <div className="flex-1">
              <div className="font-kai text-sm font-medium text-ink-900">数据概览</div>
              <div className="font-mono text-[10px] text-ink-900/40">
                PV / UV / 事件统计与访问日志
              </div>
            </div>
            <span className="font-mono text-[10px] text-ink-900/30">→</span>
          </button>
        </div>

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
