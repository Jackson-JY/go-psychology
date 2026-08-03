import { useEffect, useRef, useState, useCallback } from "react";
import type { Coord, PlacedStone } from "@/lib/types";

interface GoBoardProps {
  stones: PlacedStone[];
  userMove?: Coord | null;
  focus?: Coord;
  highlightAreas?: Coord[];
  onPlace: (x: number, y: number) => void;
  disabled?: boolean;
  size?: number;
  showHint?: boolean;
  boardSize?: number;
}

function getStarPoints(n: number): Coord[] {
  if (n === 9) {
    return [
      { x: 2, y: 2 },
      { x: 6, y: 2 },
      { x: 4, y: 4 },
      { x: 2, y: 6 },
      { x: 6, y: 6 },
    ];
  }
  if (n === 13) {
    return [
      { x: 3, y: 3 },
      { x: 9, y: 3 },
      { x: 6, y: 6 },
      { x: 3, y: 9 },
      { x: 9, y: 9 },
    ];
  }
  // 默认无星位（其他尺寸）
  return [];
}

export default function GoBoard({
  stones,
  userMove,
  focus,
  highlightAreas = [],
  onPlace,
  disabled = false,
  size = 320,
  showHint: _showHint = false,
  boardSize = 9,
}: GoBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  /** 用于触发 CSS 波纹渲染的 key，只在落子时变化 */
  const [ripple, setRipple] = useState<{ x: number; y: number; key: number } | null>(null);

  const BOARD_N = boardSize;
  const STAR_POINTS = getStarPoints(BOARD_N);

  const padding = size / (BOARD_N + 1);
  const inner = size - padding * 2;
  const cellSize = inner / (BOARD_N - 1);

  const toPx = useCallback(
    (c: Coord): { px: number; py: number } => ({
      px: padding + c.x * cellSize,
      py: padding + c.y * cellSize,
    }),
    [padding, cellSize],
  );

  const findNearestPoint = useCallback((cx: number, cy: number): Coord | null => {
    let best: { x: number; y: number; dist: number } | null = null;
    for (let y = 0; y < BOARD_N; y++) {
      for (let x = 0; x < BOARD_N; x++) {
        const { px, py } = toPx({ x, y });
        const d = Math.hypot(cx - px, cy - py);
        if (!best || d < best.dist) {
          best = { x, y, dist: d };
        }
      }
    }
    if (!best || best.dist > cellSize * 0.8) return null;
    const occupied = stones.some((s) => s.x === best!.x && s.y === best!.y);
    if (occupied) return null;
    return { x: best.x, y: best.y };
  }, [toPx, stones, cellSize, BOARD_N]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, "#F8F2E2");
    grad.addColorStop(0.5, "#F2E8D0");
    grad.addColorStop(1, "#EADBB8");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = "rgba(120, 90, 50, 0.05)";
    for (let i = 0; i < 80; i++) {
      ctx.fillRect(Math.random() * size, Math.random() * size, 1, 1);
    }

    ctx.strokeStyle = "rgba(40, 30, 15, 0.55)";
    ctx.lineWidth = 1.4;
    ctx.strokeRect(padding, padding, inner, inner);

    ctx.strokeStyle = "rgba(40, 30, 15, 0.4)";
    ctx.lineWidth = 1;
    for (let i = 0; i < BOARD_N; i++) {
      ctx.beginPath();
      ctx.moveTo(padding, padding + i * cellSize);
      ctx.lineTo(padding + inner, padding + i * cellSize);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(padding + i * cellSize, padding);
      ctx.lineTo(padding + i * cellSize, padding + inner);
      ctx.stroke();
    }

    ctx.fillStyle = "rgba(20, 15, 8, 0.85)";
    for (const sp of STAR_POINTS) {
      const { px, py } = toPx(sp);
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    for (const area of highlightAreas) {
      const { px, py } = toPx(area);
      ctx.fillStyle = "rgba(200, 57, 43, 0.12)";
      ctx.beginPath();
      ctx.arc(px, py, cellSize * 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(200, 57, 43, 0.25)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(px, py, cellSize * 0.6, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (focus) {
      const { px, py } = toPx(focus);
      ctx.strokeStyle = "rgba(200, 57, 43, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(px, py, cellSize * 1.4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    for (const s of stones) {
      drawStone(ctx, toPx(s), s.color, cellSize * 0.46);
    }

    if (userMove) {
      drawStone(ctx, toPx(userMove), "B", cellSize * 0.46);
      const { px, py } = toPx(userMove);
      ctx.fillStyle = "#C8392B";
      ctx.beginPath();
      ctx.arc(px, py, cellSize * 0.12, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [size, padding, inner, cellSize, BOARD_N, STAR_POINTS, stones, userMove, focus, highlightAreas, toPx]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = size / rect.width;
    const scaleY = size / rect.height;
    const cx = (e.clientX - rect.left) * scaleX;
    const cy = (e.clientY - rect.top) * scaleY;

    const nearest = findNearestPoint(cx, cy);
    if (!nearest) return;

    setRipple({ x: nearest.x, y: nearest.y, key: Date.now() });
    onPlace(nearest.x, nearest.y);
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        style={{
          width: "100%",
          height: "100%",
          cursor: disabled ? "default" : "crosshair",
          touchAction: "manipulation",
          boxShadow:
            "0 10px 30px -10px rgba(60,40,15,0.4), 0 2px 8px rgba(60,40,15,0.15), inset 0 0 24px rgba(150,110,60,0.18)",
        }}
        className="rounded-sm"
      />
      {ripple && (
        <span
          key={ripple.key}
          className="pointer-events-none absolute rounded-full border border-ink-900/30"
          style={{
            left: padding + ripple.x * cellSize,
            top: padding + ripple.y * cellSize,
            width: cellSize,
            height: cellSize,
            transform: "translate(-50%, -50%) scale(0)",
            animation: "go-board-ripple 600ms ease-out forwards",
          }}
        />
      )}
      <style>{`
        @keyframes go-board-ripple {
          to {
            transform: translate(-50%, -50%) scale(2.6);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

function drawStone(
  ctx: CanvasRenderingContext2D,
  pos: { px: number; py: number },
  color: "B" | "W",
  radius: number,
) {
  const { px, py } = pos;
  const r = Math.max(2, radius);

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;

  if (color === "B") {
    const g = ctx.createRadialGradient(
      px - r * 0.3,
      py - r * 0.3,
      r * 0.1,
      px,
      py,
      r,
    );
    g.addColorStop(0, "#3a3a3a");
    g.addColorStop(0.6, "#101010");
    g.addColorStop(1, "#000");
    ctx.fillStyle = g;
  } else {
    const g = ctx.createRadialGradient(
      px - r * 0.3,
      py - r * 0.3,
      r * 0.1,
      px,
      py,
      r,
    );
    g.addColorStop(0, "#ffffff");
    g.addColorStop(0.85, "#f1ead9");
    g.addColorStop(1, "#cdc3a8");
    ctx.fillStyle = g;
  }

  ctx.beginPath();
  ctx.arc(px, py, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = color === "B" ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.65)";
  ctx.beginPath();
  ctx.arc(px - r * 0.35, py - r * 0.35, r * 0.28, 0, Math.PI * 2);
  ctx.fill();
}
