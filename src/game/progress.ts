import type { BattleSnapshot, ScenarioId } from "./types";

export const CAMPAIGN_PROGRESS_KEY = "titans-of-war-caesar:campaign:v1";

export interface BattleRecord {
  attempts: number;
  victories: number;
  bestGrade: string;
  lastOutcome: BattleSnapshot["outcome"];
  lastPlayedAt: string;
}

export interface CampaignProgress {
  version: 1;
  battles: Partial<Record<ScenarioId, BattleRecord>>;
}

const emptyProgress = (): CampaignProgress => ({ version: 1, battles: {} });
const gradeOrder = ["A", "B", "C", "D", "F"];

export function parseCampaignProgress(raw: string | null): CampaignProgress {
  if (!raw) return emptyProgress();
  try {
    const parsed = JSON.parse(raw) as Partial<CampaignProgress>;
    if (parsed.version !== 1 || !parsed.battles || typeof parsed.battles !== "object") return emptyProgress();
    return { version: 1, battles: parsed.battles };
  } catch {
    return emptyProgress();
  }
}

export function loadCampaignProgress(): CampaignProgress {
  if (typeof window === "undefined") return emptyProgress();
  try {
    return parseCampaignProgress(window.localStorage.getItem(CAMPAIGN_PROGRESS_KEY));
  } catch {
    return emptyProgress();
  }
}

export function saveCampaignProgress(progress: CampaignProgress) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CAMPAIGN_PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // Campaign play remains available when browser storage is unavailable.
  }
}

export function recordBattleResult(
  progress: CampaignProgress,
  snapshot: BattleSnapshot,
  playedAt = new Date().toISOString(),
): CampaignProgress {
  if (snapshot.outcome === "undecided" || !snapshot.assessment) return progress;
  const previous = progress.battles[snapshot.scenarioId];
  const grade = snapshot.assessment.overall;
  const bestGrade = !previous || gradeOrder.indexOf(grade) < gradeOrder.indexOf(previous.bestGrade) ? grade : previous.bestGrade;
  return {
    version: 1,
    battles: {
      ...progress.battles,
      [snapshot.scenarioId]: {
        attempts: (previous?.attempts ?? 0) + 1,
        victories: (previous?.victories ?? 0) + (snapshot.outcome === "roman-victory" ? 1 : 0),
        bestGrade,
        lastOutcome: snapshot.outcome,
        lastPlayedAt: playedAt,
      },
    },
  };
}

export function campaignSummary(progress: CampaignProgress) {
  const records = Object.values(progress.battles).filter((record): record is BattleRecord => Boolean(record));
  const gradeValues: Record<string, number> = { A: 4, B: 3, C: 2, D: 1, F: 0 };
  const average = records.length === 0 ? undefined : records.reduce((sum, record) => sum + (gradeValues[record.bestGrade] ?? 0), 0) / records.length;
  const grade = average === undefined ? undefined : average >= 3.5 ? "A" : average >= 2.5 ? "B" : average >= 1.5 ? "C" : average >= 0.5 ? "D" : "F";
  return {
    completed: records.length,
    victories: records.filter((record) => record.victories > 0).length,
    grade,
  };
}
