export interface DailyStat {
  date: string;
  pv: number;
  uv: number;
}

export interface EventTypeStat {
  type: string;
  count: number;
}

export interface StatsSummary {
  totalAccess: number;
  totalEvents: number;
  todayPv: number;
  todayUv: number;
  daily: DailyStat[];
  events: EventTypeStat[];
  recentEvents: {
    id: number;
    type: string;
    payload: Record<string, unknown> | null;
    ip: string | null;
    createdAt: number;
  }[];
}
