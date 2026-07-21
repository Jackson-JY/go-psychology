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
}

const BOARD_N = 9;
const STAR_POINTS: Coord[] = [
  { x: 2, y: 2 },
  { x: 6, y: 2 },
  { x: 4, y: 4 },
  { x: 2, y: 6 },
  { x: 6, y: 6 },
];

export default function GoBoard({
  stones,
  userMove,
  focus,
  highlightAreas = [],
  onPlace,
  disabled = false,
  size = 320,
  showHint = false,
}: GoBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ripple, setRipple] = useState<{ x: number; y: number; t: number } | null>(null);
  const [hoverPoint, setHoverPoint] = useState<Coord | null>(null);

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
  }, [toPx, stones, cellSize]);

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

    if (showHint && !disabled && !userMove) {
      for (let y = 0; y < BOARD_N; y++) {
        for (let x = 0; x < BOARD_N; x++) {
          const occupied = stones.some((s) => s.x === x && s.y === y);
          if (!occupied) {
            const { px, py } = toPx({ x, y });
            ctx.fillStyle = "rgba(200, 57, 43, 0.08)";
            ctx.beginPath();
            ctx.arc(px, py, cellSize * 0.25, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    for (const s of stones) {
      drawStone(ctx, toPx(s), s.color, cellSize * 0.46);
    }

    if (hoverPoint && !userMove && !disabled) {
      const { px, py } = toPx(hoverPoint);
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = "rgba(20, 20, 20, 0.7)";
      ctx.beginPath();
      ctx.arc(px, py, cellSize * 0.42, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      ctx.beginPath();
      ctx.arc(px - cellSize * 0.15, py - cellSize * 0.15, cellSize * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (userMove) {
      drawStone(ctx, toPx(userMove), "B", cellSize * 0.46);
      const { px, py } = toPx(userMove);
      ctx.fillStyle = "#C8392B";
      ctx.beginPath();
      ctx.arc(px, py, cellSize * 0.12, 0, Math.PI * 2);
      ctx.fill();
    }

    if (ripple) {
      const elapsed = (performance.now() - ripple.t) / 600;
      if (elapsed < 1) {
        const { px, py } = toPx({ x: ripple.x, y: ripple.y });
        const r = cellSize * 0.5 + elapsed * cellSize * 1.6;
        ctx.strokeStyle = `rgba(10,10,10,${0.5 * (1 - elapsed)})`;
        ctx.lineWidth = 2 * (1 - elapsed);
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        setRipple(null);
      }
    }
  }, [size, padding, inner, cellSize, stones, userMove, focus, highlightAreas, ripple, hoverPoint, toPx, disabled, showHint]);

  useEffect(() => {
    if (!ripple) return;
    let raf = 0;
    const tick = () => {
      setRipple((prev) => (prev ? { ...prev } : prev));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ripple]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (disabled || !!userMove) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = size / rect.width;
    const scaleY = size / rect.height;
    const cx = (e.clientX - rect.left) * scaleX;
    const cy = (e.clientY - rect.top) * scaleY;
    const point = findNearestPoint(cx, cy);
    setHoverPoint(point);
  };

  const handleMouseLeave = () => {
    setHoverPoint(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = size / rect.width;
    const scaleY = size / rect.height;
    const cx = (e.clientX - rect.left) * scaleX;
    const cy = (e.clientY - rect.top) * scaleY;

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
    if (!best) return;
    if (best.dist > cellSize * 0.8) return;

    setRipple({ x: best.x, y: best.y, t: performance.now() });
    onPlace(best.x, best.y);
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
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
