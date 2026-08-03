interface SealProps {
  char: string;
  size?: number;
  className?: string;
}

/** 品牌 Logo */
export default function Seal({ char, size = 40, className = "" }: SealProps) {
  return (
    <img
      src="/logo.png"
      alt={char}
      width={size}
      height={size}
      className={className}
      style={{ objectFit: "contain", display: "block" }}
    />
  );
}
