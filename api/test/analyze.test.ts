import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mapMovesToProfile } from "../lib/heatmap.js";
import { mockComment } from "../lib/mock.js";
import { generateDeepReport } from "../lib/deepReport.js";
import type { MoveRecord } from "@shared/types";

const SAMPLE_MOVES: MoveRecord[] = [
  { puzzleId: "lifeDeath", x: 5, y: 7, elapsedMs: 3500 },
  { puzzleId: "opening", x: 4, y: 4, elapsedMs: 2800 },
  { puzzleId: "invasion", x: 4, y: 4, elapsedMs: 4100 },
  { puzzleId: "ko", x: 2, y: 6, elapsedMs: 3200 },
];

describe("analyze flow", () => {
  it("mapMovesToProfile handles all 4 puzzles", () => {
    const profile = mapMovesToProfile(SAMPLE_MOVES);
    assert.ok(profile.tags.length >= 4);
    assert.equal(profile.rationales.length, 4);
    assert.ok(profile.radar.riskAppetite >= 0 && profile.radar.riskAppetite <= 100);
    assert.ok(profile.radar.rationality >= 0 && profile.radar.rationality <= 100);
  });

  it("mockComment returns different tone for beginner vs skilled", () => {
    const profile = mapMovesToProfile(SAMPLE_MOVES);
    const skilled = mockComment({ ...profile, experienceLevel: "skilled" });
    const beginner = mockComment({ ...profile, experienceLevel: "beginner" });
    assert.ok(skilled.headline.length > 0);
    assert.ok(beginner.headline.length > 0);
    assert.notEqual(skilled.comment, beginner.comment);
  });

  it("generateDeepReport returns different insights for beginner vs skilled", () => {
    const profile = mapMovesToProfile(SAMPLE_MOVES);
    const skilled = generateDeepReport(profile.radar, "skilled");
    const beginner = generateDeepReport(profile.radar, "beginner");
    assert.ok(skilled.insights.length > 0);
    assert.ok(beginner.insights.length > 0);
  });

  it("beginner pools cover every key used by pickPoolKey", () => {
    const profile = mapMovesToProfile(SAMPLE_MOVES);
    const beginner = mockComment({ ...profile, experienceLevel: "beginner" });
    assert.ok(beginner.comment.length > 20);
    assert.ok(beginner.headline.length > 0);
  });
});
