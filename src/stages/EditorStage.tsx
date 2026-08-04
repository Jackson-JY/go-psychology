import { useEffect, useMemo, useState } from "react";
import { useGameStore } from "@/store";
import type { ScenarioConfig, Scenario, HeatZone, PlacedStone, Coord } from "@/lib/types";
import { fetchScenarioConfig, saveScenarioConfig } from "@/lib/api";
import GoBoard from "@/components/GoBoard";

const RADAR_KEYS = [
  { key: "riskAppetite", label: "风险偏好" },
  { key: "resilience", label: "逆境抗压" },
  { key: "rationality", label: "决策理性" },
  { key: "conflictResponse", label: "冲突应对" },
  { key: "focus", label: "长效专注" },
] as const;

type EditLevel = "beginner" | "skilled";

const LEVEL_META: Record<EditLevel, { boardSize: number; label: string }> = {
  beginner: { boardSize: 9, label: "零基础 · 9×9" },
  skilled: { boardSize: 13, label: "有基础 · 13×13" },
};

const BOARD_PX = 320;

function boardMetrics(size: number, boardSize: number) {
  const padding = size / (boardSize + 1);
  const inner = size - padding * 2;
  const cell = inner / (boardSize - 1);
  return { padding, inner, cell };
}

function coordToPx(c: Coord, size: number, boardSize: number) {
  const { padding, cell } = boardMetrics(size, boardSize);
  return {
    left: padding + c.x * cell,
    top: padding + c.y * cell,
  };
}

function rectToStyle(
  rect: HeatZone["rect"],
  size: number,
  boardSize: number,
) {
  const { padding, cell } = boardMetrics(size, boardSize);
  const left = padding + Math.min(rect.x0, rect.x1) * cell;
  const top = padding + Math.min(rect.y0, rect.y1) * cell;
  const width = Math.abs(rect.x1 - rect.x0) * cell;
  const height = Math.abs(rect.y1 - rect.y0) * cell;
  return { left, top, width, height };
}

export default function EditorStage() {
  const restart = useGameStore((s) => s.restart);
  const goStats = useGameStore((s) => s.goStats);
  const [config, setConfig] = useState<ScenarioConfig[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [editLevel, setEditLevel] = useState<EditLevel>("beginner");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [placingMode, setPlacingMode] = useState<
    "black" | "white" | "focus" | "area-a" | "area-b" | "heat" | null
  >(null);
  const [editHeatmapIndex, setEditHeatmapIndex] = useState<number | null>(null);
  const [heatStart, setHeatStart] = useState<Coord | null>(null);

  useEffect(() => {
    fetchScenarioConfig().then((cfg) => {
      setConfig(cfg);
    });
  }, []);

  const active = config[activeIndex];
  const activeBoardSize = LEVEL_META[editLevel].boardSize;

  const updateScenario = (scenario: Scenario) => {
    const next = [...config];
    next[activeIndex] = { ...next[activeIndex], scenario };
    setConfig(next);
  };

  const updateHeatmaps = (heatmaps: Record<EditLevel, HeatZone[]>) => {
    const next = [...config];
    next[activeIndex] = { ...next[activeIndex], heatmaps };
    setConfig(next);
  };

  /** 更新当前级别棋盘：stones / focus */
  const updateLevelBoard = (updater: (board: { stones: PlacedStone[]; focus?: Coord }) => { stones: PlacedStone[]; focus?: Coord }) => {
    if (!active) return;
    const scenario = active.scenario;
    const nextBoard = updater(scenario.boards[editLevel]);
    updateScenario({
      ...scenario,
      boards: { ...scenario.boards, [editLevel]: nextBoard },
    });
  };

  const normalizeRect = (a: Coord, b: Coord): HeatZone["rect"] => ({
    x0: Math.min(a.x, b.x),
    y0: Math.min(a.y, b.y),
    x1: Math.max(a.x, b.x),
    y1: Math.max(a.y, b.y),
  });

  const currentBoard = active?.scenario.boards[editLevel];
  const currentHeatmap = active?.heatmaps[editLevel] ?? [];

  const handleBoardClick = (x: number, y: number) => {
    if (!active || !placingMode) return;
    const scenario = active.scenario;
    const board = scenario.boards[editLevel];

    if (placingMode === "focus") {
      updateLevelBoard(() => ({ ...board, focus: { x, y } }));
      return;
    }

    if (placingMode === "black" || placingMode === "white") {
      const exists = board.stones.findIndex((s) => s.x === x && s.y === y);
      if (exists >= 0) {
        updateLevelBoard(() => ({ ...board, stones: board.stones.filter((_, i) => i !== exists) }));
      } else {
        const color = placingMode === "black" ? "B" : "W";
        updateLevelBoard(() => ({ ...board, stones: [...board.stones, { x, y, color }] }));
      }
      return;
    }

    if (placingMode === "area-a" || placingMode === "area-b") {
      const posKey = placingMode === "area-a" ? "optionAPos" : "optionBPos";
      updateScenario({
        ...scenario,
        copy: {
          ...scenario.copy,
          beginner: { ...scenario.copy.beginner, [posKey]: { x, y } },
        },
      });
      return;
    }

    if (placingMode === "heat") {
      const end = { x, y };
      if (!heatStart) {
        setHeatStart(end);
        return;
      }
      const rect = normalizeRect(heatStart, end);
      const heatmaps = { ...active.heatmaps };
      if (editHeatmapIndex != null) {
        heatmaps[editLevel] = heatmaps[editLevel].map((z, i) =>
          i === editHeatmapIndex ? { ...z, rect } : z,
        );
      } else {
        heatmaps[editLevel] = [
          ...heatmaps[editLevel],
          { rect, delta: {}, rationale: "" },
        ];
        setEditHeatmapIndex(heatmaps[editLevel].length - 1);
      }
      updateHeatmaps(heatmaps);
      setHeatStart(null);
    }
  };

  const handleAddHeatZone = () => {
    if (!active) return;
    const heatmaps = { ...active.heatmaps };
    heatmaps[editLevel] = [
      ...heatmaps[editLevel],
      { rect: { x0: 0, y0: 0, x1: 1, y1: 1 }, delta: {}, rationale: "" },
    ];
    updateHeatmaps(heatmaps);
    setEditHeatmapIndex(heatmaps[editLevel].length - 1);
    setPlacingMode("heat");
    setHeatStart(null);
  };

  const handleUpdateHeatZone = (idx: number, zone: HeatZone) => {
    if (!active) return;
    const heatmaps = { ...active.heatmaps };
    heatmaps[editLevel] = heatmaps[editLevel].map((z, i) => (i === idx ? zone : z));
    updateHeatmaps(heatmaps);
  };

  const handleRemoveHeatZone = (idx: number) => {
    if (!active) return;
    const heatmaps = { ...active.heatmaps };
    heatmaps[editLevel] = heatmaps[editLevel].filter((_, i) => i !== idx);
    updateHeatmaps(heatmaps);
    if (editHeatmapIndex === idx) setEditHeatmapIndex(null);
  };

  /** 9×9 → 13×13 坐标缩放 */
  const scaleCoord = (c: Coord): Coord => {
    const scale = (13 - 1) / (9 - 1);
    return { x: Math.round(c.x * scale), y: Math.round(c.y * scale) };
  };

  /** 将 beginer 的棋盘/热区同步到 skilled（一键缩放拷贝） */
  const handleCopyFromOtherLevel = (from: EditLevel) => {
    if (!active) return;
    const to = from === "beginner" ? "skilled" : "beginner";
    const fromBoard = active.scenario.boards[from];

    // 若从 9→13 则缩放，从 13→9 反缩放
    const convert = (c: Coord): Coord => {
      if (from === "beginner" && to === "skilled") return scaleCoord(c);
      if (from === "skilled" && to === "beginner") {
        const scale = (9 - 1) / (13 - 1);
        return { x: Math.round(c.x * scale), y: Math.round(c.y * scale) };
      }
      return c;
    };

    const newBoard = {
      stones: fromBoard.stones.map((s) => ({ ...s, ...convert(s) })),
      focus: fromBoard.focus ? convert(fromBoard.focus) : undefined,
    };

    const heatmaps = { ...active.heatmaps };
    heatmaps[to] = heatmaps[from].map((z) => {
      const a = convert({ x: z.rect.x0, y: z.rect.y0 });
      const b = convert({ x: z.rect.x1, y: z.rect.y1 });
      return {
        ...z,
        rect: { x0: a.x, y0: a.y, x1: b.x, y1: b.y },
      };
    });

    updateScenario({
      ...active.scenario,
      boards: { ...active.scenario.boards, [to]: newBoard },
    });
    updateHeatmaps(heatmaps);
    setMessage(`已从 ${LEVEL_META[from].label} 同步到 ${LEVEL_META[to].label}`);
  };

  const handleSave = async () => {
    if (!password) {
      setMessage("请输入编辑密码");
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      await saveScenarioConfig(config, password);
      setMessage("保存成功");
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const optionHints = useMemo(() => {
    if (!active) return [];
    const list: { coord: Coord; label: string; color: string }[] = [];
    // A/B 提示只在 beginner 有意义，但在编辑 beginner 模式时显示
    if (editLevel === "beginner") {
      const a = active.scenario.copy.beginner.optionAPos;
      const b = active.scenario.copy.beginner.optionBPos;
      if (a) list.push({ coord: a, label: active.scenario.copy.beginner.optionA || "A", color: "#C8392B" });
      if (b) list.push({ coord: b, label: active.scenario.copy.beginner.optionB || "B", color: "#5A7A6B" });
    }
    return list;
  }, [active, editLevel]);

  const { cell } = boardMetrics(BOARD_PX, activeBoardSize);

  if (!active) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-paper-100">
        <span className="font-mono text-[10px] text-ink-900/50">加载中...</span>
      </div>
    );
  }

  const otherLevel: EditLevel = editLevel === "beginner" ? "skilled" : "beginner";

  return (
    <div className="min-h-[100dvh] bg-paper-100 px-4 py-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-serif text-xl font-semibold text-ink-900">题目编辑器</h1>
        <div className="flex gap-2">
          <button onClick={restart} className="btn-outline text-xs">返回首页</button>
          <button onClick={goStats} className="btn-outline text-xs">数据概览</button>
          <button onClick={handleSave} disabled={loading} className="btn-primary text-xs">
            {loading ? "保存中..." : "保存"}
          </button>
        </div>
      </header>

      {message && (
        <div className={`mb-4 rounded-sm px-3 py-2 font-mono text-[11px] ${message.includes("成功") || message.includes("同步") ? "bg-green-100 text-green-800" : "bg-cinnabar/10 text-cinnabar"}`}>
          {message}
        </div>
      )}

      {/* 关卡切换 */}
      <div className="mb-3 flex flex-wrap gap-2">
        {config.map((c, i) => (
          <button
            key={c.scenario.id + i}
            onClick={() => { setActiveIndex(i); setEditHeatmapIndex(null); setHeatStart(null); }}
            className={`rounded-sm px-3 py-1.5 text-xs ${i === activeIndex ? "bg-ink-900 text-paper-100" : "bg-white text-ink-900 border border-ink-900/10"}`}
          >
            {c.scenario.copy.beginner.title || `第 ${i + 1} 关`}
          </button>
        ))}
      </div>

      {/* 级别切换 */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-sm border border-ink-900/10 bg-white/50 p-1">
          {(["beginner", "skilled"] as const).map((lv) => (
            <button
              key={lv}
              onClick={() => { setEditLevel(lv); setEditHeatmapIndex(null); setHeatStart(null); }}
              className={`rounded-sm px-3 py-1.5 text-xs ${editLevel === lv ? "bg-cinnabar text-white" : "text-ink-900 hover:bg-ink-900/5"}`}
            >
              {LEVEL_META[lv].label}
            </button>
          ))}
        </div>
        <button
          onClick={() => handleCopyFromOtherLevel(otherLevel)}
          className="rounded-sm border border-ink-900/10 bg-white/50 px-3 py-1.5 text-[11px] text-ink-900 hover:bg-ink-900/5"
        >
          从 {LEVEL_META[otherLevel].label} 同步缩放
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* 左侧：棋盘与落子模式 */}
        <div className="space-y-4 rounded-sm border border-ink-900/10 bg-white/50 p-4">
          <div className="flex flex-wrap gap-2">
            {[
              { key: "black", label: "黑子" },
              { key: "white", label: "白子" },
              { key: "focus", label: "焦点" },
              { key: "area-a", label: "A区提示" },
              { key: "area-b", label: "B区提示" },
              { key: "heat", label: "热区绘制" },
            ].map((m) => (
              <button
                key={m.key}
                onClick={() => {
                  const next = placingMode === (m.key as typeof placingMode) ? null : (m.key as typeof placingMode);
                  setPlacingMode(next);
                  if (next !== "heat") setHeatStart(null);
                }}
                className={`rounded-sm px-3 py-1.5 text-xs ${placingMode === m.key ? "bg-cinnabar text-white" : "bg-ink-900/5 text-ink-900"}`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="flex justify-center">
            <div className="relative" style={{ width: BOARD_PX, height: BOARD_PX }}>
              <GoBoard
                stones={currentBoard?.stones ?? []}
                focus={currentBoard?.focus}
                highlightAreas={optionHints.map((h) => h.coord)}
                onPlace={handleBoardClick}
                size={BOARD_PX}
                boardSize={activeBoardSize}
                allowOccupiedClick
              />
              {/* 热区与 AB 提示覆盖层 */}
              <svg
                className="pointer-events-none absolute left-0 top-0"
                width={BOARD_PX}
                height={BOARD_PX}
              >
                {currentHeatmap.map((zone, idx) => {
                  const { left, top, width, height } = rectToStyle(zone.rect, BOARD_PX, activeBoardSize);
                  const selected = editHeatmapIndex === idx;
                  return (
                    <g key={idx}>
                      <rect
                        x={left}
                        y={top}
                        width={width}
                        height={height}
                        fill={selected ? "rgba(200,57,43,0.18)" : "rgba(90,122,107,0.12)"}
                        stroke={selected ? "rgba(200,57,43,0.6)" : "rgba(90,122,107,0.4)"}
                        strokeWidth={selected ? 2 : 1}
                        strokeDasharray={selected ? undefined : "4 2"}
                      />
                      <text
                        x={left + 4}
                        y={top + 14}
                        fill={selected ? "#C8392B" : "#5A7A6B"}
                        fontSize={10}
                        fontFamily="monospace"
                      >
                        热区 {idx + 1}
                      </text>
                    </g>
                  );
                })}
                {heatStart && (
                  <g>
                    {(() => {
                      const { left, top } = coordToPx(heatStart, BOARD_PX, activeBoardSize);
                      return (
                        <>
                          <circle cx={left} cy={top} r={cell * 0.25} fill="#C8392B" />
                          <text x={left + 8} y={top - 8} fill="#C8392B" fontSize={10} fontFamily="monospace">
                            起点
                          </text>
                        </>
                      );
                    })()}
                  </g>
                )}
                {optionHints.map((hint, i) => {
                  const { left, top } = coordToPx(hint.coord, BOARD_PX, activeBoardSize);
                  return (
                    <g key={i}>
                      <circle cx={left} cy={top} r={cell * 0.35} fill={hint.color} opacity={0.8} />
                      <text x={left + 10} y={top + 4} fill={hint.color} fontSize={10} fontFamily="monospace">
                        {hint.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <p className="font-mono text-[10px] text-ink-900/50">
            {placingMode === "heat"
              ? heatStart
                ? "已选起点，再点击对角完成热区矩形"
                : "点击棋盘设置热区矩形起点"
              : placingMode === "area-a" || placingMode === "area-b"
                ? editLevel === "beginner"
                  ? `点击棋盘设置 ${placingMode === "area-a" ? "A" : "B"} 提示位置`
                  : "A/B 提示仅用于零基础模式，请切换到 9×9 编辑"
                : "点击上方模式后，在棋盘上点击以添加/移除。"}
          </p>
        </div>

        {/* 右侧：表单 */}
        <div className="space-y-4 rounded-sm border border-ink-900/10 bg-white/50 p-4">
          <label className="block">
            <span className="font-mono text-[10px] text-ink-900/60">关卡 ID</span>
            <input
              value={active.scenario.id}
              onChange={(e) => updateScenario({ ...active.scenario, id: e.target.value as typeof active.scenario.id })}
              className="mt-1 w-full rounded-sm border border-ink-900/10 px-2 py-1 text-sm"
            />
          </label>

          <label className="block">
            <span className="font-mono text-[10px] text-ink-900/60">排序 Index</span>
            <input
              type="number"
              value={active.scenario.index}
              onChange={(e) => updateScenario({ ...active.scenario, index: Number(e.target.value) })}
              className="mt-1 w-full rounded-sm border border-ink-900/10 px-2 py-1 text-sm"
            />
          </label>

          {(["beginner", "skilled"] as const).map((level) => (
            <div key={level} className={`space-y-2 border-t border-ink-900/10 pt-3 ${editLevel !== level ? "opacity-70" : ""}`}>
              <h3 className="font-mono text-[10px] tracking-widest text-ink-900/60">
                {level === "beginner" ? "零基础文案" : "有基础文案"}
                {editLevel === level && <span className="ml-2 text-cinnabar">●</span>}
              </h3>
              <div className="grid gap-2">
                <input
                  value={active.scenario.copy[level].title}
                  onChange={(e) => updateScenario({
                    ...active.scenario,
                    copy: { ...active.scenario.copy, [level]: { ...active.scenario.copy[level], title: e.target.value } },
                  })}
                  placeholder="标题"
                  className="w-full rounded-sm border border-ink-900/10 px-2 py-1 text-sm"
                />
                <input
                  value={active.scenario.copy[level].subtitle}
                  onChange={(e) => updateScenario({
                    ...active.scenario,
                    copy: { ...active.scenario.copy, [level]: { ...active.scenario.copy[level], subtitle: e.target.value } },
                  })}
                  placeholder="副标题"
                  className="w-full rounded-sm border border-ink-900/10 px-2 py-1 text-sm"
                />
                <textarea
                  value={active.scenario.copy[level].prompt}
                  onChange={(e) => updateScenario({
                    ...active.scenario,
                    copy: { ...active.scenario.copy, [level]: { ...active.scenario.copy[level], prompt: e.target.value } },
                  })}
                  placeholder="情境文案"
                  rows={2}
                  className="w-full rounded-sm border border-ink-900/10 px-2 py-1 text-sm"
                />
                <input
                  value={active.scenario.copy[level].hint}
                  onChange={(e) => updateScenario({
                    ...active.scenario,
                    copy: { ...active.scenario.copy, [level]: { ...active.scenario.copy[level], hint: e.target.value } },
                  })}
                  placeholder="落子提示"
                  className="w-full rounded-sm border border-ink-900/10 px-2 py-1 text-sm"
                />
                {level === "beginner" && (
                  <div className="grid gap-2 rounded-sm bg-ink-900/5 p-2">
                    <div className="grid grid-cols-2 gap-2">
                      <label className="block">
                        <span className="font-mono text-[10px] text-ink-900/50">A 标签</span>
                        <input
                          value={active.scenario.copy[level].optionA || ""}
                          onChange={(e) => updateScenario({
                            ...active.scenario,
                            copy: { ...active.scenario.copy, [level]: { ...active.scenario.copy[level], optionA: e.target.value } },
                          })}
                          placeholder="如：继续救援"
                          className="mt-1 w-full rounded-sm border border-ink-900/10 px-2 py-1 text-xs"
                        />
                      </label>
                      <label className="block">
                        <span className="font-mono text-[10px] text-ink-900/50">B 标签</span>
                        <input
                          value={active.scenario.copy[level].optionB || ""}
                          onChange={(e) => updateScenario({
                            ...active.scenario,
                            copy: { ...active.scenario.copy, [level]: { ...active.scenario.copy[level], optionB: e.target.value } },
                          })}
                          placeholder="如：放弃转移"
                          className="mt-1 w-full rounded-sm border border-ink-900/10 px-2 py-1 text-xs"
                        />
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <PosReadout
                        label="A 提示位置"
                        pos={active.scenario.copy[level].optionAPos}
                        onClear={() => updateScenario({
                          ...active.scenario,
                          copy: { ...active.scenario.copy, [level]: { ...active.scenario.copy[level], optionAPos: undefined } },
                        })}
                      />
                      <PosReadout
                        label="B 提示位置"
                        pos={active.scenario.copy[level].optionBPos}
                        onClear={() => updateScenario({
                          ...active.scenario,
                          copy: { ...active.scenario.copy, [level]: { ...active.scenario.copy[level], optionBPos: undefined } },
                        })}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          <div className="border-t border-ink-900/10 pt-3">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-mono text-[10px] tracking-widest text-ink-900/60">
                热区规则 · {LEVEL_META[editLevel].label}
              </h3>
              <button onClick={handleAddHeatZone} className="text-xs text-cinnabar hover:underline">+ 添加热区</button>
            </div>
            <div className="space-y-2">
              {currentHeatmap.map((zone, idx) => (
                <div key={idx} className={`rounded-sm border p-2 text-xs ${editHeatmapIndex === idx ? "border-cinnabar bg-cinnabar/5" : "border-ink-900/10"}`}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-mono text-[10px]">热区 {idx + 1}</span>
                    <div className="flex gap-2">
                      <button onClick={() => setEditHeatmapIndex(editHeatmapIndex === idx ? null : idx)} className="text-cinnabar hover:underline">
                        {editHeatmapIndex === idx ? "收起" : "编辑"}
                      </button>
                      <button onClick={() => handleRemoveHeatZone(idx)} className="text-ink-900/40 hover:text-cinnabar">删除</button>
                    </div>
                  </div>
                  {editHeatmapIndex === idx && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-4 gap-1">
                        {(["x0", "y0", "x1", "y1"] as const).map((k) => (
                          <label key={k} className="flex items-center gap-1">
                            <span className="font-mono text-[10px]">{k}</span>
                            <input
                              type="number"
                              min={0}
                              max={activeBoardSize - 1}
                              value={zone.rect[k]}
                              onChange={(e) => handleUpdateHeatZone(idx, {
                                ...zone,
                                rect: { ...zone.rect, [k]: Number(e.target.value) },
                              })}
                              className="w-full rounded-sm border border-ink-900/10 px-1 py-0.5 text-xs"
                            />
                          </label>
                        ))}
                      </div>
                      <button
                        onClick={() => {
                          setEditHeatmapIndex(idx);
                          setPlacingMode("heat");
                          setHeatStart(null);
                        }}
                        className={`w-full rounded-sm px-2 py-1 text-[10px] ${placingMode === "heat" && editHeatmapIndex === idx ? "bg-cinnabar text-white" : "bg-ink-900/5 text-ink-900"}`}
                      >
                        在棋盘上绘制此热区
                      </button>
                      <textarea
                        value={zone.rationale}
                        onChange={(e) => handleUpdateHeatZone(idx, { ...zone, rationale: e.target.value })}
                        placeholder="落子理由说明"
                        rows={2}
                        className="w-full rounded-sm border border-ink-900/10 px-2 py-1 text-xs"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        {RADAR_KEYS.map(({ key, label }) => (
                          <label key={key} className="flex items-center gap-1">
                            <span className="font-mono text-[10px]">{label}</span>
                            <input
                              type="number"
                              value={zone.delta[key] ?? ""}
                              onChange={(e) => handleUpdateHeatZone(idx, {
                                ...zone,
                                delta: { ...zone.delta, [key]: e.target.value === "" ? undefined : Number(e.target.value) },
                              })}
                              className="w-full rounded-sm border border-ink-900/10 px-1 py-0.5 text-xs"
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {currentHeatmap.length === 0 && (
                <p className="font-mono text-[10px] text-ink-900/40">暂无热区</p>
              )}
            </div>
          </div>

          <label className="block border-t border-ink-900/10 pt-3">
            <span className="font-mono text-[10px] text-ink-900/60">编辑密码</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="保存时需要"
              className="mt-1 w-full rounded-sm border border-ink-900/10 px-2 py-1 text-sm"
            />
          </label>
        </div>
      </div>
    </div>
  );
}

function PosReadout({
  label,
  pos,
  onClear,
}: {
  label: string;
  pos?: Coord;
  onClear: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-sm bg-white/60 px-2 py-1">
      <span className="font-mono text-[10px] text-ink-900/60">
        {label}: {pos ? `${pos.x},${pos.y}` : "未设置"}
      </span>
      {pos && (
        <button onClick={onClear} className="text-[10px] text-cinnabar hover:underline">
          清除
        </button>
      )}
    </div>
  );
}
