import { DEFAULT_SCENARIO_CONFIG } from "../shared/scenarios.ts";
import { matchArchetype, generateTags, ARCHETYPES } from "../shared/archetypes.ts";

// 简化的 mapMovesToProfile 逻辑（不考虑时间影响，假设 elapsedMs 在 3-6s 区间，只有 +2 rationality +2 focus）
const BASE_RADAR = {
  riskAppetite: 50,
  resilience: 50,
  rationality: 50,
  conflictResponse: 50,
  focus: 50,
};

function clamp(v) {
  return Math.max(0, Math.min(100, Math.round(v)));
}

function inRect(c, r) {
  return c.x >= r.x0 && c.x <= r.x1 && c.y >= r.y0 && c.y <= r.y1;
}

// 获取每关所有不重复的落子选择（按热区中心点，保证落在该热区内）
function getRepresentativePoints(level, scenarioIndex) {
  const cfg = DEFAULT_SCENARIO_CONFIG[scenarioIndex];
  const zones = cfg.heatmaps[level];
  const stones = cfg.scenario.boards[level].stones;
  const occupied = new Set(stones.map((s) => `${s.x},${s.y}`));

  const points = [];
  // 为每个热区找一个代表性的、不与其他热区重叠的点（优先中心）
  for (let zi = 0; zi < zones.length; zi++) {
    const z = zones[zi];
    let found = null;
    // 优先中心
    const cx = Math.floor((z.rect.x0 + z.rect.x1) / 2);
    const cy = Math.floor((z.rect.y0 + z.rect.y1) / 2);
    for (let dx = 0; dx <= 1; dx++) {
      for (let dy = 0; dy <= 1; dy++) {
        const x = cx + dx;
        const y = cy + dy;
        if (x >= z.rect.x0 && x <= z.rect.x1 && y >= z.rect.y0 && y <= z.rect.y1 && !occupied.has(`${x},${y}`)) {
          // 检查该点是否只属于当前热区（按 heatmap 顺序第一个匹配）
          const first = zones.find((zz) => inRect({ x, y }, zz.rect));
          if (first === z) {
            found = { x, y, zoneIndex: zi };
            break;
          }
        }
      }
      if (found) break;
    }
    if (!found) {
      // 找不到独占点，找任意在热区内的点
      for (let x = z.rect.x0; x <= z.rect.x1 && !found; x++) {
        for (let y = z.rect.y0; y <= z.rect.y1 && !found; y++) {
          if (!occupied.has(`${x},${y}`)) {
            const first = zones.find((zz) => inRect({ x, y }, zz.rect));
            if (first === z) {
              found = { x, y, zoneIndex: zi };
            }
          }
        }
      }
    }
    if (found) points.push(found);
  }
  return points;
}

function computeRadar(choices, level) {
  const radar = { ...BASE_RADAR };
  for (let i = 0; i < 4; i++) {
    const cfg = DEFAULT_SCENARIO_CONFIG[i];
    const zones = cfg.heatmaps[level];
    const choice = choices[i];
    const zone = zones[choice.zoneIndex];
    for (const [k, v] of Object.entries(zone.delta)) {
      radar[k] += v;
    }
    // 时间效果：假设 3-6s
    radar.rationality += 2;
    radar.focus += 2;
  }
  for (const k of Object.keys(radar)) {
    radar[k] = clamp(radar[k]);
  }
  return radar;
}

function cartesian(arrays) {
  return arrays.reduce((acc, curr) => acc.flatMap((a) => curr.map((c) => [...a, c])), [[]]);
}

for (const level of ["beginner", "skilled"]) {
  console.log(`\n=== ${level} ===`);
  const allChoices = [];
  for (let i = 0; i < 4; i++) {
    const pts = getRepresentativePoints(level, i);
    console.log(`  第${i + 1}关可选热区: ${pts.map((p) => p.zoneIndex).join(", ")}`);
    allChoices.push(pts);
  }

  const combinations = cartesian(allChoices);
  console.log(`  总组合数: ${combinations.length}`);

  const archetypeCounts = {};
  const tagCounts = {};
  const radarRanges = {
    riskAppetite: [100, 0],
    resilience: [100, 0],
    rationality: [100, 0],
    conflictResponse: [100, 0],
    focus: [100, 0],
  };

  for (const combo of combinations) {
    const radar = computeRadar(combo, level);
    const arch = matchArchetype(radar);
    const tags = generateTags(radar);
    archetypeCounts[arch.name] = (archetypeCounts[arch.name] || 0) + 1;
    for (const tag of tags) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
    for (const [k, v] of Object.entries(radar)) {
      radarRanges[k][0] = Math.min(radarRanges[k][0], v);
      radarRanges[k][1] = Math.max(radarRanges[k][1], v);
    }
  }

  console.log("\n  雷达分数范围:");
  for (const [k, [min, max]] of Object.entries(radarRanges)) {
    console.log(`    ${k}: ${min} ~ ${max}`);
  }

  console.log("\n  原型出现次数:");
  const sortedArchetypes = Object.entries(archetypeCounts).sort((a, b) => b[1] - a[1]);
  for (const [name, count] of sortedArchetypes) {
    console.log(`    ${name}: ${count}`);
  }

  console.log("\n  未出现的原型:");
  const appeared = new Set(Object.keys(archetypeCounts));
  for (const arch of ARCHETYPES) {
    if (!appeared.has(arch.name)) {
      console.log(`    ${arch.name}`);
    }
  }

  console.log("\n  标签出现次数:");
  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
  for (const [tag, count] of sortedTags) {
    console.log(`    ${tag}: ${count}`);
  }
}
