import { motion } from "framer-motion";

interface ShareQRProps {
  /** 延迟动画时间（秒） */
  delay?: number;
}

/** 分享二维码组件 — 扫码进入服务 */
export default function ShareQR({ delay = 0 }: ShareQRProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      className="flex flex-col items-center gap-2"
    >
      <div className="relative rounded-xl border-2 border-cinnabar/30 bg-white p-3 shadow-sm">
        <img
          src="/qrcode.png"
          alt="扫码进入"
          className="h-24 w-24 object-contain"
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
