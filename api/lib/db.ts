import { resolve } from "node:path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import type { StatsSummary, DailyStat, EventTypeStat } from "@shared/stats.js";

const DB_DIR = resolve(process.cwd(), "data");
const DB_PATH = resolve(DB_DIR, "analytics.json");

/** 写盘间隔（毫秒） */
const FLUSH_INTERVAL_MS = 5_000;
/** 内存缓冲条数上限，超过立即刷盘 */
const BUFFER_LIMIT = 100;

export interface AccessLogInput {
  ip: string;
  method: string;
  path: string;
  statusCode: number;
  userAgent?: string;
  referer?: string;
  responseTimeMs: number;
}

interface AccessLog extends AccessLogInput {
  id: number;
  createdAt: number;
}

export interface EventInput {
  type: string;
  payload?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}

interface EventRecord extends EventInput {
  id: number;
  createdAt: number;
}

interface AnalyticsData {
  accessLogs: AccessLog[];
  events: EventRecord[];
}

let nextId = 1;
let pendingWrites = 0;
let flushTimer: NodeJS.Timeout | null = null;

function ensureDir(path: string) {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
}

function loadData(): AnalyticsData {
  ensureDir(DB_DIR);
  if (!existsSync(DB_PATH)) {
    return { accessLogs: [], events: [] };
  }
  try {
    const raw = readFileSync(DB_PATH, "utf-8");
    const parsed = JSON.parse(raw) as AnalyticsData;
    return {
      accessLogs: Array.isArray(parsed.accessLogs) ? parsed.accessLogs : [],
      events: Array.isArray(parsed.events) ? parsed.events : [],
    };
  } catch (err) {
    console.error("[json-db] 加载分析数据失败:", (err as Error).message);
    return { accessLogs: [], events: [] };
  }
}

function saveData(data: AnalyticsData): void {
  ensureDir(DB_DIR);
  writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

let data = loadData();

function recalcNextId() {
  const maxAccess = data.accessLogs.reduce((m, l) => Math.max(m, l.id || 0), 0);
  const maxEvent = data.events.reduce((m, e) => Math.max(m, e.id || 0), 0);
  nextId = Math.max(maxAccess, maxEvent) + 1;
}

recalcNextId();

function scheduleFlush(): void {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flush();
  }, FLUSH_INTERVAL_MS);
}

function flush(): void {
  if (pendingWrites === 0) return;
  pendingWrites = 0;
  try {
    saveData(data);
  } catch (err) {
    console.error("[json-db] 刷盘失败:", (err as Error).message);
  }
}

export function logAccess(input: AccessLogInput): void {
  data.accessLogs.push({
    ...input,
    id: nextId++,
    createdAt: Math.floor(Date.now() / 1000),
  });
  pendingWrites += 1;
  if (pendingWrites >= BUFFER_LIMIT) {
    flush();
  } else {
    scheduleFlush();
  }
}

export function logEvent(input: EventInput): void {
  data.events.push({
    ...input,
    id: nextId++,
    createdAt: Math.floor(Date.now() / 1000),
  });
  pendingWrites += 1;
  if (pendingWrites >= BUFFER_LIMIT) {
    flush();
  } else {
    scheduleFlush();
  }
}

/** 强制立即写入磁盘（用于优雅退出前） */
export function flushSync(): void {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  flush();
}

function formatLocalDate(tsSec: number): string {
  const d = new Date(tsSec * 1000);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getStats(days = 7): StatsSummary {
  const totalAccess = data.accessLogs.length;
  const totalEvents = data.events.length;

  const nowSec = Math.floor(Date.now() / 1000);
  const todayStart = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);
  const todayEnd = todayStart + 86400;
  const cutoff = nowSec - days * 86400;

  const todayAccess = data.accessLogs.filter(
    (l) => l.createdAt >= todayStart && l.createdAt < todayEnd,
  );
  const todayPv = todayAccess.length;
  const todayUv = new Set(todayAccess.map((l) => l.ip)).size;

  const dailyMap = new Map<string, { pv: number; ips: Set<string> }>();
  for (const log of data.accessLogs) {
    if (log.createdAt < cutoff) continue;
    const date = formatLocalDate(log.createdAt);
    const entry = dailyMap.get(date) || { pv: 0, ips: new Set<string>() };
    entry.pv += 1;
    entry.ips.add(log.ip);
    dailyMap.set(date, entry);
  }
  const daily: DailyStat[] = Array.from(dailyMap.entries())
    .map(([date, entry]) => ({ date, pv: entry.pv, uv: entry.ips.size }))
    .sort((a, b) => (a.date > b.date ? -1 : 1));

  const eventCounts = new Map<string, number>();
  for (const e of data.events) {
    if (e.createdAt < cutoff) continue;
    eventCounts.set(e.type, (eventCounts.get(e.type) || 0) + 1);
  }
  const events: EventTypeStat[] = Array.from(eventCounts.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  const recentEvents = data.events
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 50)
    .map((r) => ({
      id: r.id,
      type: r.type,
      payload: r.payload ?? null,
      ip: r.ip ?? null,
      createdAt: r.createdAt,
    }));

  return {
    totalAccess,
    totalEvents,
    todayPv,
    todayUv,
    daily,
    events,
    recentEvents,
  };
}

export function closeDb(): void {
  // no-op for JSON storage
}
