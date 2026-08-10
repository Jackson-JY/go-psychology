import { motion } from "framer-motion";

interface ShareQRProps {
  /** 延迟动画时间（秒） */
  delay?: number;
  /** 紧凑模式（二维码稍小） */
  compact?: boolean;
  /** 悬浮模式（固定在右上角，小尺寸） */
  floating?: boolean;
}

/** 分享二维码组件 — 扫码进入服务 */
export default function ShareQR({
  delay = 0,
  compact = false,
  floating = false,
}: ShareQRProps) {
  if (floating) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay, duration: 0.5 }}
        className="absolute right-3 top-3 z-20 flex flex-col items-center gap-1"
      >
        <div className="rounded-lg border border-cinnabar/20 bg-white p-1.5 shadow-sm">
          <img
            src="/qrcode.png"
            alt="扫码体验"
            className="h-12 w-12 object-contain"
          />
        </div>
        <span className="font-kai text-[9px] text-cinnabar/70">扫码体验</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      className="flex flex-col items-center gap-2"
    >
      <div
        className={`relative rounded-xl border-2 border-cinnabar/30 bg-white shadow-sm ${
          compact ? "p-2" : "p-3"
        }`}
      >
        <img
          src="/qrcode.png"
          alt="扫码进入"
          className="object-contain"
          style={{ width: compact ? 80 : 96, height: compact ? 80 : 96 }}
        />
        {/* 四角装饰 */}
        <span className="absolute -left-1 -top-1 h-3 w-3 rounded-bl-sm rounded-tl-lg border-l-2 border-t-2 border-cinnabar" />
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-br-sm rounded-tr-lg border-r-2 border-t-2 border-cinnabar" />
        <span className="absolute -left-1 -bottom-1 h-3 w-3 rounded-tr-sm rounded-bl-lg border-l-2 border-b-2 border-cinnabar" />
        <span className="absolute -right-1 -bottom-1 h-3 w-3 rounded-tl-sm rounded-br-lg border-r-2 border-b-2 border-cinnabar" />
      </div>
      <div className="flex flex-col items-center gap-0.5">
        <span className="font-kai text-[12px] font-medium text-ink-900/70">
          扫码体验
        </span>
        <span className="font-mono text-[9px] tracking-widest text-cinnabar/60">
          gomind.fyi
        </span>
      </div>
    </motion.div>
  );
}
