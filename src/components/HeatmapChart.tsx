import type { HeatmapData } from "@/lib/types";

interface HeatmapChartProps {
  data: HeatmapData;
  size?: number;
}

export default function HeatmapChart({ data, size = 220 }: HeatmapChartProps) {
  const cellSize = size / 9;
  const padding = 8;

  function getColor(value: number): string {
    if (value >= 80) return "#C8392B";
    if (value >= 60) return "#E65C4F";
    if (value >= 40) return "#F4A698";
    if (value >= 20) return "#FADAD5";
    return "#FDF8F7";
  }

  return (
    <div className="flex flex-col items-center">
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
        className="block"
      >
        {data.grid.map((row, y) =>
          row.map((value, x) => (
            <rect
              key={`${x}-${y}`}
              x={x * cellSize + padding / 2}
              y={y * cellSize + padding / 2}
              width={cellSize - padding}
              height={cellSize - padding}
              fill={getColor(value)}
              rx={2}
            />
          ))
        )}
        {data.peaks.map((peak) => (
          <circle
            key={`peak-${peak.x}-${peak.y}`}
            cx={peak.x * cellSize + cellSize / 2}
            cy={peak.y * cellSize + cellSize / 2}
            r={4}
            fill="#fff"
            stroke="#C8392B"
            strokeWidth={2}
          />
        ))}
      </svg>
      <div className="flex items-center gap-2 mt-2">
        <span className="font-mono text-[9px] text-ink-900/50">低</span>
        <div className="flex gap-1">
          {[0, 20, 40, 60, 80].map((val) => (
            <div
              key={val}
              className="w-4 h-3 rounded"
              style={{ backgroundColor: getColor(val) }}
            />
          ))}
        </div>
        <span className="font-mono text-[9px] text-ink-900/50">高</span>
      </div>
    </div>
  );
}