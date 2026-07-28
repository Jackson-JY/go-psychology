import Database from "better-sqlite3";
import { resolve, dirname } from "node:path";
import { existsSync, mkdirSync } from "node:fs";
import type { StatsSummary, DailyStat, EventTypeStat } from "@shared/stats.js";

const DB_DIR = resolve(process.cwd(), "data");
const DB_PATH = resolve(DB_DIR, "analytics.db");

function ensureDir(path: string) {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
}

ensureDir(DB_DIR);

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

// 访问日志表
db.exec(`
  CREATE TABLE IF NOT EXISTS access_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip TEXT,
    method TEXT,
    path TEXT,
    status_code INTEGER,
    user_agent TEXT,
    referer TEXT,
    response_time_ms INTEGER,
    created_at INTEGER DEFAULT (unixepoch())
  );
  CREATE INDEX IF NOT EXISTS idx_access_created_at ON access_logs(created_at);
  CREATE INDEX IF NOT EXISTS idx_access_path ON access_logs(path);
`);

// 行为事件表
db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    payload TEXT,
    ip TEXT,
    user_agent TEXT,
    created_at INTEGER DEFAULT (unixepoch())
  );
  CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);
  CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
`);

export interface AccessLogInput {
  ip: string;
  method: string;
  path: string;
  statusCode: number;
  userAgent?: string;
  referer?: string;
  responseTimeMs: number;
}

export interface EventInput {
  type: string;
  payload?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}

export function logAccess(input: AccessLogInput): void {
  const stmt = db.prepare(`
    INSERT INTO access_logs (ip, method, path, status_code, user_agent, referer, response_time_ms)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    input.ip,
    input.method,
    input.path,
    input.statusCode,
    input.userAgent ?? null,
    input.referer ?? null,
    input.responseTimeMs,
  );
}

export function logEvent(input: EventInput): void {
  const stmt = db.prepare(`
    INSERT INTO events (type, payload, ip, user_agent)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(
    input.type,
    input.payload ? JSON.stringify(input.payload) : null,
    input.ip ?? null,
    input.userAgent ?? null,
  );
}

export function getStats(days = 7): StatsSummary {
  const totalAccess = (db.prepare("SELECT COUNT(*) AS c FROM access_logs").get() as { c: number }).c;
  const totalEvents = (db.prepare("SELECT COUNT(*) AS c FROM events").get() as { c: number }).c;

  const todayStart = Math.floor(new Date().setHours(0, 0, 0, 0) / 1000);
  const todayEnd = todayStart + 86400;
  const todayRow = db
    .prepare(
      "SELECT COUNT(*) AS pv, COUNT(DISTINCT ip) AS uv FROM access_logs WHERE created_at >= ? AND created_at < ?",
    )
    .get(todayStart, todayEnd) as { pv: number; uv: number };

  const dailyRows = db
    .prepare(
      `
      SELECT date(created_at, 'unixepoch', 'localtime') AS date,
             COUNT(*) AS pv,
             COUNT(DISTINCT ip) AS uv
      FROM access_logs
      WHERE created_at >= unixepoch('now', '-' || ? || ' days')
      GROUP BY date
      ORDER BY date DESC
    `,
    )
    .all(days) as DailyStat[];

  const eventRows = db
    .prepare(
      `
      SELECT type, COUNT(*) AS count
      FROM events
      WHERE created_at >= unixepoch('now', '-' || ? || ' days')
      GROUP BY type
      ORDER BY count DESC
    `,
    )
    .all(days) as EventTypeStat[];

  const recentRows = db
    .prepare(
      `
      SELECT id, type, payload, ip, created_at AS createdAt
      FROM events
      ORDER BY created_at DESC
      LIMIT 50
    `,
    )
    .all() as { id: number; type: string; payload: string | null; ip: string | null; createdAt: number }[];

  return {
    totalAccess,
    totalEvents,
    todayPv: todayRow.pv,
    todayUv: todayRow.uv,
    daily: dailyRows,
    events: eventRows,
    recentEvents: recentRows.map((r) => ({
      ...r,
      payload: r.payload ? (JSON.parse(r.payload) as Record<string, unknown>) : null,
    })),
  };
}

export function closeDb(): void {
  db.close();
}
