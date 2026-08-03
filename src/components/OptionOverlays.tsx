import { motion } from "framer-motion";

interface OptionArea {
  x: number;
  y: number;
  label: string;
  color: "cinnabar" | "bamboo";
}

interface OptionOverlaysProps {
  areas: OptionArea[];
  size?: number;
  boardSize?: number;
}

export default function OptionOverlays({ areas, size = 320, boardSize = 9 }: OptionOverlaysProps) {
  const BOARD_N = boardSize;
  const padding = size / (BOARD_N + 1);
  const inner = size - padding * 2;
  const cellSize = inner / (BOARD_N - 1);

  const toPx = (x: number, y: number) => ({
    left: padding + x * cellSize,
    top: padding + y * cellSize,
  });

  return (
    <div
      className="pointer-events-none absolute left-0 top-0"
      style={{ width: size, height: size }}
    >
      {areas.map((area, i) => {
        const { left, top } = toPx(area.x, area.y);
        const isCinnabar = area.color === "cinnabar";
        const colorHex = isCinnabar ? "#C8392B" : "#5A7A6B";

        return (
          <motion.div
            key={area.label}
            initial={{ opacity: 0, scale: 0.8, x: "-50%", y: "-50%" }}
            animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
            transition={{ delay: 0.4 + i * 0.15, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute flex flex-col items-center"
            style={{
              left,
              top,
            }}
          >
            <div
              className="relative flex items-center justify-center"
              style={{ width: cellSize * 1.6, height: cellSize * 1.6 }}
            >
              <span
                className="absolute inset-0 rounded-full"
                style={{
                  backgroundColor: `${colorHex}18`,
                  boxShadow: `inset 0 0 0 1px ${colorHex}33`,
                }}
              />
              <motion.span
                className="absolute inset-0 rounded-full"
                style={{
                  backgroundColor: `${colorHex}10`,
                  boxShadow: `inset 0 0 0 1px ${colorHex}20`,
                }}
                animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.2, 0.5] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              />
              <span
                className="relative rounded-full"
                style={{
                  width: cellSize * 0.32,
                  height: cellSize * 0.32,
                  backgroundColor: colorHex,
                  boxShadow: `0 2px 6px ${colorHex}55`,
                }}
              />
            </div>
            <span
              className="mt-1 whitespace-nowrap rounded-sm px-1.5 py-0.5 font-mono text-[10px] font-medium tracking-wider"
              style={{
                backgroundColor: `${colorHex}14`,
                color: colorHex,
              }}
            >
              {area.label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}
