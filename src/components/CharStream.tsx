import { useMemo } from "react";

interface CharStreamProps {
  text: string;
  className?: string;
  /** 每个字的延迟（毫秒） */
  step?: number;
  /** 起始延迟（毫秒） */
  startDelay?: number;
  onComplete?: () => void;
}

/** 逐字浮现的容器 */
export default function CharStream({
  text,
  className = "",
  step = 50,
  startDelay = 100,
  onComplete,
}: CharStreamProps) {
  const chars = useMemo(() => Array.from(text), [text]);

  return (
    <span className={`char-stream ${className}`}>
      {chars.map((c, i) => (
        <span
          key={i}
          style={{
            animationDelay: `${startDelay + i * step}ms`,
          }}
          onAnimationEnd={i === chars.length - 1 ? onComplete : undefined}
        >
          {c === " " ? "\u00A0" : c}
        </span>
      ))}
    </span>
  );
}
