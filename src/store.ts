import { create } from "zustand";
import type { AnalyzeResponse, MoveRecord, PuzzleId, SgfAnalysisResponse, Scenario } from "@/lib/types";

export type Stage = "intro" | "tutorial" | "play" | "loading" | "result" | "poster" | "sgf-upload" | "sgf-loading" | "sgf-result" | "editor" | "editor-login" | "stats";
export type ExperienceLevel = "beginner" | "skilled";
export type Gender = "male" | "female";

interface GameState {
  stage: Stage;
  experienceLevel: ExperienceLevel | null;
  gender: Gender;
  currentScenarioIndex: number; // 0-3
  moves: MoveRecord[];
  scenarioStartTime: number;
  result: AnalyzeResponse | null;
  sgfResult: SgfAnalysisResponse | null;
  error: string | null;
  scenarios: Scenario[];

  start: (level: ExperienceLevel) => void;
  startPlay: () => void;
  recordMove: (puzzleId: PuzzleId, x: number, y: number) => void;
  nextScenario: () => void;
  setResult: (result: AnalyzeResponse) => void;
  setSgfResult: (result: SgfAnalysisResponse) => void;
  setError: (error: string | null) => void;
  setGender: (gender: Gender) => void;
  setScenarios: (scenarios: Scenario[]) => void;
  goPoster: () => void;
  restart: () => void;
  goSgfUpload: () => void;
  goEditor: () => void;
  goEditorLogin: () => void;
  goStats: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  stage: "intro",
  experienceLevel: null,
  gender: "male",
  currentScenarioIndex: 0,
  moves: [],
  scenarioStartTime: 0,
  result: null,
  sgfResult: null,
  error: null,
  scenarios: [],

  start: (level) => {
    set({
      stage: level === "skilled" ? "play" : "tutorial",
      experienceLevel: level,
      currentScenarioIndex: 0,
      moves: [],
      scenarioStartTime: Date.now(),
      result: null,
      error: null,
    });
  },

  startPlay: () => {
    set({
      stage: "play",
      currentScenarioIndex: 0,
      moves: [],
      scenarioStartTime: Date.now(),
    });
  },

  startTutorial: () => {
    set({ stage: "tutorial" });
  },

  recordMove: (puzzleId, x, y) => {
    const elapsedMs = Date.now() - get().scenarioStartTime;
    set((state) => ({
      moves: [...state.moves, { puzzleId, x, y, elapsedMs }],
    }));
  },

  nextScenario: () => {
    const next = get().currentScenarioIndex + 1;
    const scenarios = get().scenarios;
    if (next < scenarios.length) {
      set({
        currentScenarioIndex: next,
        scenarioStartTime: Date.now(),
      });
    } else {
      set({ stage: "loading" });
    }
  },

  setResult: (result) => set({ stage: "result", result }),
  setSgfResult: (sgfResult) => set({ stage: "sgf-result", sgfResult }),
  setError: (error) => set({ error, stage: "result" }),
  setGender: (gender) => set({ gender }),
  setScenarios: (scenarios) => set({ scenarios }),
  goPoster: () => set({ stage: "poster" }),
  goSgfUpload: () => set({ stage: "sgf-upload", sgfResult: null, error: null }),
  goEditor: () => set({ stage: "editor" }),
  goEditorLogin: () => set({ stage: "editor-login" }),
  goStats: () => set({ stage: "stats" }),
  restart: () =>
    set({
      stage: "intro",
      experienceLevel: null,
      currentScenarioIndex: 0,
      moves: [],
      scenarioStartTime: 0,
      result: null,
      sgfResult: null,
      error: null,
      // 保留 gender 与 scenarios（用户偏好与已加载配置）
    }),
}));
