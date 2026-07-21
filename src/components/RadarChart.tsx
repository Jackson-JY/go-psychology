import type { RadarData } from "@/lib/types";

interface RadarChartProps {
  data: RadarData;
  size?: number;
}

interface AxisDef {
  key: keyof RadarData;
  label: string;
}

const AXES: AxisDef[] = [
  { key: "sunkCost", label: "沉没成本" },
  { key: "riskAppetite", label: "风险偏好" },
  { key: "bigPicture", label: "大局观" },
  { key: "decisiveness", label: "决断力" },
  { key: "controlDesire", label: "掌控欲" },
  { key: "emotionalStability", label: "情绪稳定" },
  { key: "cooperation", label: "合作倾向" },
  { key: "innovation", label: "创新思维" },
];

export default function RadarChart({ data, size = 240 }: RadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 36;
  const levels = 4;

  const angleOf = (i: number) => (Math.PI * 2 * i) / AXES.length - Math.PI / 2;
  const pointOf = (i: number, value01: number) => ({
    x: cx + Math.cos(angleOf(i)) * radius * value01,
    y: cy + Math.sin(angleOf(i)) * radius * value01,
  });

  // 数据多边形
  const polyPoints = AXES.map((a, i) => {
    const v = Math.max(0, Math.min(100, data[a.key])) / 100;
    return pointOf(i, v);
  });
  const polyPath = polyPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto block">
      {/* 同心多边形 */}
      {Array.from({ length: levels }).map((_, li) => {
        const ratio = (li + 1) / levels;
        const pts = AXES.map((_, i) => pointOf(i, ratio));
        return (
          <polygon
            key={li}
            points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            className="radar-axis"
          />
        );
      })}
      {/* 轴线 */}
      {AXES.map((_, i) => {
        const p = pointOf(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} className="radar-axis" />;
      })}
      {/* 数据多边形 */}
      <polygon points={polyPath} className="radar-poly" />
      {/* 顶点小圆 */}
      {polyPoints.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={3}
          fill="#C8392B"
          stroke="#fff"
          strokeWidth={1}
        />
      ))}
      {/* 轴标签 */}
      {AXES.map((a, i) => {
        const p = pointOf(i, 1.18);
        return (
          <text
            key={a.key}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-ink-900"
            style={{
              fontFamily: '"LXGW WenKai", "Noto Serif SC", serif',
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            {a.label}
          </text>
        );
      })}
      {/* 数值小标 */}
      {AXES.map((a, i) => {
        const v = data[a.key];
        const p = pointOf(i, Math.min(1, Math.max(0, v) / 100) + 0.14);
        return (
          <text
            key={`v-${a.key}`}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#C8392B"
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 9,
              opacity: 0.7,
            }}
          >
            {v}
          </text>
        );
      })}
    </svg>
  );
}
