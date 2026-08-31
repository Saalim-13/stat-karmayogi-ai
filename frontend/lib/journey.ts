const KEY = "stat-karmayogi-twin-journey";

export type JourneyMap = Record<string, number[]>;

export function getJourneys(): JourneyMap {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as JourneyMap) : {};
}

export function recordJourneyPoint(competencyId: string, value: number) {
  const journeys = getJourneys();
  const path = journeys[competencyId] ?? [];
  const next = path.length && path[path.length - 1] === value ? path : [...path, Math.max(0, Math.min(100, value))];
  window.localStorage.setItem(KEY, JSON.stringify({ ...journeys, [competencyId]: next }));
}

export function setJourneys(journeys: JourneyMap) {
  window.localStorage.setItem(KEY, JSON.stringify(journeys));
}
