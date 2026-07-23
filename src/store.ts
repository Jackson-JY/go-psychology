import { create } from "zustand";
import type { AnalyzeResponse, MoveRecord, PuzzleId } from "@/lib/types";
import { SCENARIOS } from "@/lib/scenarios";

export type Stage = "intro" | "tutorial" | "play" | "loading" | "result" | "poster";
export type ExperienceLevel = "beginner" | "skilled";

interface GameState {
  stage: Stage;
  experienceLevel: ExperienceLevel | null;
  currentScenarioIndex: number; // 0-2
  moves: MoveRecord[];
  scenarioStartTime: number;
  result: AnalyzeResponse | null;
  error: string | null;

  start: (level: ExperienceLevel) => void;
  startPlay: () => void;
  recordMove: (puzzleId: PuzzleId, x: number, y: number) => void;
  nextScenario: () => void;
  setResult: (result: AnalyzeResponse) => void;
  setError: (error: string | null) => void;
  goPoster: () => void;
  restart: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  stage: "intro",
  experienceLevel: null,
  currentScenarioIndex: 0,
  moves: [],
  scenarioStartTime: 0,
  result: null,
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
  setError: (error) => set({ error, stage: "result" }),
  goPoster: () => set({ stage: "poster" }),
  restart: () =>
    set({
      stage: "intro",
      currentScenarioIndex: 0,
      moves: [],
      scenarioStartTime: 0,
      result: null,
      error: null,
    }),
}));

export { SCENARIOS };
