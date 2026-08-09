import { motion } from "framer-motion";

interface ShareQRProps {
  /** 延迟动画时间（秒） */
  delay?: number;
  /** 尺寸 */
  size?: number;
}

/** 轻量分享二维码组件，用于页面间传播 */
export default function ShareQR({ delay = 0, size = 72 }: ShareQRProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.6 }}
      className="flex flex-col items-center gap-1.5"
    >
      <div className="rounded-md border border-ink-900/10 bg-white p-1.5">
        <img
          src="/qrcode.png"
          alt="分享二维码"
          className="object-contain"
          style={{ width: size, height: size }}
        />
      </div>
      <span className="font-kai text-[10px] text-ink-900/45">
        扫码分享给朋友
      </span>
    </motion.div>
  );
}
