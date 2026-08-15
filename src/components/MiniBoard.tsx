import type { Coord, PlacedStone } from "@/lib/types";

interface MiniBoardProps {
  /** 棋盘原始尺寸（9 或 13） */
  boardSize: number;
  /** 初始棋子 */
  stones: PlacedStone[];
  /** 用户落子位置 */
  userMove?: Coord | null;
  /** 组件像素尺寸 */
  size?: number;
}

/** 轻量小棋盘：仅显示网格、星位、初始棋子和用户落子标记 */
export default function MiniBoard({
  boardSize,
  stones,
  userMove,
  size = 72,
}: MiniBoardProps) {
  const padding = size / (boardSize + 1);
  const cell = (size - padding * 2) / (boardSize - 1);
  const toPx = (v: number) => padding + v * cell;

  const starPoints: Coord[] =
    boardSize === 9
      ? [
          { x: 2, y: 2 },
          { x: 6, y: 2 },
          { x: 4, y: 4 },
          { x: 2, y: 6 },
          { x: 6, y: 6 },
        ]
      : boardSize === 13
        ? [
            { x: 3, y: 3 },
            { x: 9, y: 3 },
            { x: 6, y: 6 },
            { x: 3, y: 9 },
            { x: 9, y: 9 },
          ]
        : [];

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="shrink-0 rounded-sm bg-[#f3e8d3]"
    >
      {/* 棋盘背景 */}
      <rect x={0} y={0} width={size} height={size} fill="#f3e8d3" />
      {/* 网格线 */}
      {Array.from({ length: boardSize }).map((_, i) => (
        <g key={i}>
          <line
            x1={toPx(0)}
            y1={toPx(i)}
            x2={toPx(boardSize - 1)}
            y2={toPx(i)}
            stroke="#8b7e66"
            strokeWidth={0.8}
          />
          <line
            x1={toPx(i)}
            y1={toPx(0)}
            x2={toPx(i)}
            y2={toPx(boardSize - 1)}
            stroke="#8b7e66"
            strokeWidth={0.8}
          />
        </g>
      ))}
      {/* 星位 */}
      {starPoints.map((p, idx) => (
        <circle
          key={`star-${idx}`}
          cx={toPx(p.x)}
          cy={toPx(p.y)}
          r={size * 0.035}
          fill="#6b5e4a"
        />
      ))}
      {/* 初始棋子 */}
      {stones.map((s, idx) => (
        <circle
          key={`stone-${idx}`}
          cx={toPx(s.x)}
          cy={toPx(s.y)}
          r={cell * 0.42}
          fill={s.color === "B" ? "#1a1a1a" : "#f5f5f0"}
          stroke={s.color === "B" ? "#000" : "#d4d4c8"}
          strokeWidth={0.6}
        />
      ))}
      {/* 用户落子标记 */}
      {userMove && (
        <g>
          <circle
            cx={toPx(userMove.x)}
            cy={toPx(userMove.y)}
            r={cell * 0.5}
            fill="none"
            stroke="#c45c48"
            strokeWidth={2}
          />
          <circle
            cx={toPx(userMove.x)}
            cy={toPx(userMove.y)}
            r={cell * 0.22}
            fill="#c45c48"
          />
        </g>
      )}
    </svg>
  );
}
