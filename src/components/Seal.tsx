interface SealProps {
  char: string;
  size?: number;
  className?: string;
}

/** 朱砂方印 */
export default function Seal({ char, size = 40, className = "" }: SealProps) {
  return (
    <span
      className={`seal ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.55,
        borderRadius: 2,
        border: "2px solid #9E2A20",
        transform: `rotate(${(char.charCodeAt(0) % 7) - 3}deg)`,
      }}
    >
      {char}
    </span>
  );
}
