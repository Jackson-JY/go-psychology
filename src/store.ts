import { create } from "zustand";
import type { AnalyzeResponse, MoveRecord, PuzzleId, SgfAnalysisResponse } from "@/lib/types";
import { SCENARIOS } from "@/lib/scenarios";

export type Stage = "intro" | "tutorial" | "play" | "loading" | "result" | "poster" | "sgf-upload" | "sgf-loading" | "sgf-result";
export type ExperienceLevel = "beginner" | "skilled";

interface GameState {
  stage: Stage;
  experienceLevel: ExperienceLevel | null;
  currentScenarioIndex: number; // 0-2
  moves: MoveRecord[];
  scenarioStartTime: number;
  result: AnalyzeResponse | null;
  sgfResult: SgfAnalysisResponse | null;
  error: string | null;

  start: (level: ExperienceLevel) => void;
  startPlay: () => void;
  recordMove: (puzzleId: PuzzleId, x: number, y: number) => void;
  nextScenario: () => void;
  setResult: (result: AnalyzeResponse) => void;
  setSgfResult: (result: SgfAnalysisResponse) => void;
  setError: (error: string | null) => void;
  goPoster: () => void;
  restart: () => void;
  goSgfUpload: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  stage: "intro",
  experienceLevel: null,
  currentScenarioIndex: 0,
  moves: [],
  scenarioStartTime: 0,
  result: null,
  sgfResult: null,
  error: null,

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
    if (next < SCENARIOS.length) {
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
  goPoster: () => set({ stage: "poster" }),
  goSgfUpload: () => set({ stage: "sgf-upload", sgfResult: null, error: null }),
  restart: () =>
    set({
      stage: "intro",
      currentScenarioIndex: 0,
      moves: [],
      scenarioStartTime: 0,
      result: null,
      sgfResult: null,
      error: null,
    }),
}));

export { SCENARIOS };
