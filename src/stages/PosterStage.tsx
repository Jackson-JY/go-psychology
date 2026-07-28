import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { motion } from "framer-motion";
import Seal from "@/components/Seal";
import { useGameStore } from "@/store";
import type { MoveRecord, Scenario } from "@/lib/types";

export default function PosterStage() {
  const { result, moves, restart, experienceLevel } = useGameStore();
  const posterRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "generating" | "done">("idle");
  const [imgUrl, setImgUrl] = useState<string>("");

  if (!result) {
    return null;
  }

  // 把 4 关的落子在海报上小图重绘（SVG）
  const miniBoards = moves.length === 4 ? moves : [];

  const handleGenerate = async () => {
    if (!posterRef.current) return;
    setStatus("generating");
    try {
      // 等字体加载
      if ((document as Document).fonts?.ready) {
        await (document as Document).fonts.ready;
      }
      const canvas = await html2canvas(posterRef.current, {
        scale: 2,
        backgroundColor: "#F5F1E8",
        useCORS: true,
        logging: false,
      });
      const url = canvas.toDataURL("image/png");
      setImgUrl(url);
      setStatus("done");
    } catch (err) {
      console.error(err);
      setStatus("idle");
      alert("海报生成失败，请重试");
    }
  };

  const handleDownload = () => {
    if (!imgUrl) return;
    const a = document.createElement("a");
    a.href = imgUrl;
    a.download = `黑白潜意识-${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="relative min-h-[100dvh] bg-paper-100 px-5 py-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto flex max-w-md flex-col items-center"
      >
        <header className="mb-4 text-center">
          <div className="font-mono text-[10px] tracking-[0.4em] text-ink-900/40">
            YOUR PSYCHE POSTER
          </div>
          <h2 className="mt-1 font-serif text-xl font-bold text-ink-900">
            你的潜意识海报
          </h2>
        </header>

        {/* 海报本体（要被截图的容器） */}
        <div
          ref={posterRef}
          className="poster-snapshot relative w-full max-w-[360px] overflow-hidden bg-paper-100 px-6 pb-7 pt-6"
          style={{
            aspectRatio: "9 / 16",
            boxShadow:
              "0 20px 60px -20px rgba(60,40,15,0.35), 0 4px 12px rgba(60,40,15,0.12)",
          }}
        >
          {/* 顶部品牌 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Seal char="墨" size={28} />
              <div className="leading-none">
                <div className="font-serif text-[13px] font-bold text-ink-900">
                  黑白潜意识
                </div>
                <div className="font-mono text-[8px] tracking-widest text-ink-900/50">
                  MO · PSYCHE
                </div>
              </div>
            </div>
            <div className="font-mono text-[9px] tracking-widest text-ink-900/40">
              {new Date().toISOString().slice(0, 10)}
            </div>
          </div>

          {/* headline */}
          <div className="mt-5 text-center">
            <div className="font-mono text-[9px] tracking-[0.3em] text-ink-900/40">
              YOUR ARCHETYPE
            </div>
            <div className="mt-1 font-serif text-[26px] font-black leading-tight text-cinnabar">
              {result.headline}
            </div>
            <div className="mx-auto mt-2 h-px w-10 bg-ink-900/30" />
          </div>

          {/* 4 个迷你棋盘 */}
          <div className="mt-5 grid grid-cols-4 gap-2">
            {miniBoards.map((m: MoveRecord, i: number) => {
              const scenarios = useGameStore.getState().scenarios;
              const scenario = scenarios[i];
              if (!scenario) return null;
              const copy = scenario.copy[experienceLevel ?? "skilled"];
              return (
                <MiniBoard
                  key={i}
                  move={m}
                  scenario={scenario}
                  title={copy.title}
                />
              );
            })}
          </div>

          {/* 评语 */}
          <div className="mt-5 border-l-2 border-cinnabar pl-3">
            <p className="font-kai text-[12px] leading-relaxed text-ink-900">
              {result.comment}
            </p>
          </div>

          {/* 标签 */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {result.tags.slice(0, 5).map((tag, i) => (
              <span
                key={tag}
                className={`rounded-sm px-1.5 py-0.5 font-kai text-[10px] ${
                  i % 2 === 0
                    ? "bg-cinnabar text-paper-50"
                    : "bg-ink-900 text-paper-100"
                }`}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* 底部二维码占位 */}
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2">
            <div
              className="grid h-10 w-10 grid-cols-5 grid-rows-5 gap-px bg-paper-50 p-0.5"
              style={{ boxShadow: "0 0 0 1px rgba(10,10,10,0.4)" }}
            >
              {/* 假二维码：固定图案 */}
              {Array.from({ length: 25 }).map((_, i) => {
                const r = Math.floor(i / 5);
                const c = i % 5;
                const on =
                  (r + c) % 2 === 0 ||
                  r === 0 ||
                  r === 4 ||
                  c === 0 ||
                  c === 4 ||
                  (r === 2 && c === 2);
                return (
                  <span
                    key={i}
                    className={on ? "bg-ink-900" : "bg-paper-50"}
                  />
                );
              })}
            </div>
            <div className="leading-tight">
              <div className="font-kai text-[10px] text-ink-900">
                长按识别
              </div>
              <div className="font-mono text-[8px] tracking-widest text-ink-900/50">
                测你的潜意识
              </div>
            </div>
          </div>
        </div>

        {/* 操作区 */}
        <div className="mt-6 flex w-full max-w-[360px] flex-col gap-3">
          {status === "done" && imgUrl ? (
            <>
              <img
                src={imgUrl}
                alt="poster"
                className="w-full rounded-sm shadow-ink"
              />
              <button onClick={handleDownload} className="btn-ink">
                下载到相册
              </button>
              <p className="text-center font-kai text-xs text-ink-900/60">
                或长按上方图片保存 · 发朋友圈分享
              </p>
            </>
          ) : (
            <>
              <button
                onClick={handleGenerate}
                disabled={status === "generating"}
                className="btn-ink"
              >
                {status === "generating" ? "生成中……" : "合成海报 →"}
              </button>
              <p className="text-center font-mono text-[10px] tracking-widest text-ink-900/40">
                HTML2CANVAS · 2x 高清
              </p>
            </>
          )}

          <button
            onClick={restart}
            className="font-mono text-[11px] tracking-widest text-ink-900/40 underline-offset-4 hover:underline"
          >
            重新测试
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/** 海报里的迷你棋盘 SVG */
function MiniBoard({
  move,
  scenario,
  title,
}: {
  move: MoveRecord;
  scenario: Scenario;
  title: string;
}) {
  const N = 9;
  const size = 80;
  const padding = 6;
  const inner = size - padding * 2;
  const cell = inner / (N - 1);
  const toPx = (x: number, y: number) => ({
    px: padding + x * cell,
    py: padding + y * cell,
  });

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="font-mono text-[8px] tracking-widest text-ink-900/50">
        {title}
      </div>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <rect
          x={0}
          y={0}
          width={size}
          height={size}
          fill="#F2E8D0"
          rx={2}
        />
        {/* 网格 */}
        <g stroke="rgba(40,30,15,0.55)" strokeWidth={0.6}>
          {Array.from({ length: N }).map((_, i) => (
            <g key={i}>
              <line
                x1={padding}
                y1={padding + i * cell}
                x2={padding + inner}
                y2={padding + i * cell}
              />
              <line
                x1={padding + i * cell}
                y1={padding}
                x2={padding + i * cell}
                y2={padding + inner}
              />
            </g>
          ))}
        </g>
        {/* 预设棋子 */}
        {scenario.stones.map((s, i) => {
          const { px, py } = toPx(s.x, s.y);
          return (
            <circle
              key={i}
              cx={px}
              cy={py}
              r={cell * 0.42}
              fill={s.color === "B" ? "#0A0A0A" : "#F8F1E0"}
              stroke={s.color === "W" ? "#999" : "none"}
              strokeWidth={0.5}
            />
          );
        })}
        {/* 用户落子（朱砂高亮） */}
        {(() => {
          const { px, py } = toPx(move.x, move.y);
          return (
            <>
              <circle cx={px} cy={py} r={cell * 0.55} fill="#C8392B" />
              <circle cx={px} cy={py} r={cell * 0.4} fill="#0A0A0A" />
            </>
          );
        })()}
      </svg>
    </div>
  );
}
