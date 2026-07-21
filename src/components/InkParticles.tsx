import { useEffect, useRef } from "react";

/** 飘墨粒子背景 canvas，禅意氛围 */
export default function InkParticles({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    interface Drop {
      x: number;
      y: number;
      r: number;
      vy: number;
      vx: number;
      alpha: number;
      hue: "ink" | "cinnabar";
      life: number;
    }
    const drops: Drop[] = [];

    const spawn = () => {
      const fromTop = Math.random() > 0.5;
      drops.push({
        x: Math.random() * w,
        y: fromTop ? -10 : Math.random() * h,
        r: 1 + Math.random() * 3,
        vy: 0.2 + Math.random() * 0.6,
        vx: (Math.random() - 0.5) * 0.3,
        alpha: 0.08 + Math.random() * 0.22,
        hue: Math.random() > 0.85 ? "cinnabar" : "ink",
        life: 0,
      });
    };

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      if (drops.length < 40 && Math.random() > 0.6) spawn();

      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        d.life += 1;
        d.y += d.vy;
        d.x += d.vx;
        if (d.y > h + 20) {
          drops.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.fillStyle =
          d.hue === "ink"
            ? `rgba(10,10,10,${d.alpha})`
            : `rgba(200,57,43,${d.alpha * 0.85})`;
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
        // 拖尾
        ctx.beginPath();
        ctx.fillStyle =
          d.hue === "ink"
            ? `rgba(10,10,10,${d.alpha * 0.3})`
            : `rgba(200,57,43,${d.alpha * 0.25})`;
        ctx.arc(d.x - d.vx * 3, d.y - d.vy * 5, d.r * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className={`pointer-events-none absolute inset-0 ${className}`}
      aria-hidden
    />
  );
}
