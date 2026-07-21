import { motion } from "framer-motion";

export default function LoadingStage() {
  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-paper-100 px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-6 flex flex-col items-center gap-3"
      >
        <div className="relative h-12 w-12">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-ink-900/20"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-t-2 border-cinnabar"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          />
        </div>
        <p className="font-kai text-base text-ink-900">潜意识正在浮现……</p>
        <p className="font-mono text-[10px] tracking-widest text-ink-900/40">
          AI 正在读取你的落子轨迹
        </p>
      </motion.div>
    </div>
  );
}
