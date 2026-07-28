import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
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

const EMPTY_SCENARIO: Scenario = {
  id: "lifeDeath",
  index: 0,
  copy: {
    beginner: { title: "新", subtitle: "新题目", prompt: "", hint: "" },
    skilled: { title: "新", subtitle: "新题目", prompt: "", hint: "" },
  },
  stones: [],
};

export default function EditorStage() {
  const restart = useGameStore((s) => s.restart);
  const [config, setConfig] = useState<ScenarioConfig[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [placingMode, setPlacingMode] = useState<"black" | "white" | "focus" | "area-a" | "area-b" | null>(null);
  const [selectedArea, setSelectedArea] = useState<"area-a" | "area-b">("area-a");
  const [editHeatmapIndex, setEditHeatmapIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchScenarioConfig().then((cfg) => {
      setConfig(cfg);
    });
  }, []);

  const active = config[activeIndex];

  const updateScenario = (scenario: Scenario) => {
    const next = [...config];
    next[activeIndex] = { ...next[activeIndex], scenario };
    setConfig(next);
  };

  const updateHeatmap = (heatmap: HeatZone[]) => {
    const next = [...config];
    next[activeIndex] = { ...next[activeIndex], heatmap };
    setConfig(next);
  };

  const handleBoardClick = (x: number, y: number) => {
    if (!active || !placingMode) return;
    const scenario = active.scenario;

    if (placingMode === "focus") {
      updateScenario({ ...scenario, focus: { x, y } });
      return;
    }

    if (placingMode === "black" || placingMode === "white") {
      const exists = scenario.stones.findIndex((s) => s.x === x && s.y === y);
      if (exists >= 0) {
        const stones = scenario.stones.filter((_, i) => i !== exists);
        updateScenario({ ...scenario, stones });
      } else {
        const stones: PlacedStone[] = [...scenario.stones, { x, y, color: placingMode === "black" ? "B" : "W" }];
        updateScenario({ ...scenario, stones });
      }
      return;
    }

    if (placingMode === "area-a" || placingMode === "area-b") {
      const copyKey = placingMode === "area-a" ? "optionA" : "optionB";
      updateScenario({
        ...scenario,
        copy: {
          ...scenario.copy,
          beginner: { ...scenario.copy.beginner, [copyKey]: `${x},${y}` },
        },
      });
    }
  };

  const handleAddHeatZone = () => {
    if (!active) return;
    const heatmap = [
      ...active.heatmap,
      { rect: { x0: 0, y0: 0, x1: 1, y1: 1 }, delta: {}, rationale: "" },
    ];
    updateHeatmap(heatmap);
    setEditHeatmapIndex(heatmap.length - 1);
  };

  const handleUpdateHeatZone = (idx: number, zone: HeatZone) => {
    if (!active) return;
    const heatmap = active.heatmap.map((z, i) => (i === idx ? zone : z));
    updateHeatmap(heatmap);
  };

  const handleRemoveHeatZone = (idx: number) => {
    if (!active) return;
    updateHeatmap(active.heatmap.filter((_, i) => i !== idx));
    if (editHeatmapIndex === idx) setEditHeatmapIndex(null);
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
    const a = active.scenario.copy.beginner.optionA;
    const b = active.scenario.copy.beginner.optionB;
    const list: Coord[] = [];
    if (a) {
      const [x, y] = a.split(",").map(Number);
      if (!Number.isNaN(x) && !Number.isNaN(y)) list.push({ x, y });
    }
    if (b) {
      const [x, y] = b.split(",").map(Number);
      if (!Number.isNaN(x) && !Number.isNaN(y)) list.push({ x, y });
    }
    return list;
  }, [active]);

  if (!active) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-paper-100">
        <span className="font-mono text-[10px] text-ink-900/50">加载中...</span>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-paper-100 px-4 py-6">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="font-serif text-xl font-semibold text-ink-900">题目编辑器</h1>
        <div className="flex gap-2">
          <button onClick={restart} className="btn-outline text-xs">返回首页</button>
          <button onClick={handleSave} disabled={loading} className="btn-primary text-xs">
            {loading ? "保存中..." : "保存"}
          </button>
        </div>
      </header>

      {message && (
        <div className={`mb-4 rounded-sm px-3 py-2 font-mono text-[11px] ${message.includes("成功") ? "bg-green-100 text-green-800" : "bg-cinnabar/10 text-cinnabar"}`}>
          {message}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {config.map((c, i) => (
          <button
            key={c.scenario.id + i}
            onClick={() => { setActiveIndex(i); setEditHeatmapIndex(null); }}
            className={`rounded-sm px-3 py-1.5 text-xs ${i === activeIndex ? "bg-ink-900 text-paper-100" : "bg-white text-ink-900 border border-ink-900/10"}`}
          >
            {c.scenario.copy.beginner.title || `第 ${i + 1} 关`}
          </button>
        ))}
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
            ].map((m) => (
              <button
                key={m.key}
                onClick={() => setPlacingMode(placingMode === (m.key as typeof placingMode) ? null : (m.key as typeof placingMode))}
                className={`rounded-sm px-3 py-1.5 text-xs ${placingMode === m.key ? "bg-cinnabar text-white" : "bg-ink-900/5 text-ink-900"}`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="flex justify-center">
            <GoBoard
              stones={active.scenario.stones}
              focus={active.scenario.focus}
              highlightAreas={optionHints}
              onPlace={handleBoardClick}
              size={320}
              boardSize={9}
            />
          </div>

          <p className="font-mono text-[10px] text-ink-900/50">
            点击上方模式后，在棋盘上点击以添加/移除。A/B 区提示会写入「零基础」文案的 optionA/optionB。
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
            <div key={level} className="space-y-2 border-t border-ink-900/10 pt-3">
              <h3 className="font-mono text-[10px] tracking-widest text-ink-900/60">{level === "beginner" ? "零基础文案" : "有基础文案"}</h3>
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
                  <>
                    <input
                      value={active.scenario.copy[level].optionA || ""}
                      onChange={(e) => updateScenario({
                        ...active.scenario,
                        copy: { ...active.scenario.copy, [level]: { ...active.scenario.copy[level], optionA: e.target.value } },
                      })}
                      placeholder="A 选项坐标（如 5,7）"
                      className="w-full rounded-sm border border-ink-900/10 px-2 py-1 text-sm"
                    />
                    <input
                      value={active.scenario.copy[level].optionB || ""}
                      onChange={(e) => updateScenario({
                        ...active.scenario,
                        copy: { ...active.scenario.copy, [level]: { ...active.scenario.copy[level], optionB: e.target.value } },
                      })}
                      placeholder="B 选项坐标（如 6,3）"
                      className="w-full rounded-sm border border-ink-900/10 px-2 py-1 text-sm"
                    />
                  </>
                )}
              </div>
            </div>
          ))}

          <div className="border-t border-ink-900/10 pt-3">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-mono text-[10px] tracking-widest text-ink-900/60">热区规则</h3>
              <button onClick={handleAddHeatZone} className="text-xs text-cinnabar hover:underline">+ 添加热区</button>
            </div>
            <div className="space-y-2">
              {active.heatmap.map((zone, idx) => (
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
                              max={8}
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
