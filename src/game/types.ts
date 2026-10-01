export type Side = "roman" | "helvetian";

export type FormationOrder = "hold" | "advance" | "charge" | "reform" | "withdraw";

export type FormationStatus = "steady" | "engaged" | "routing" | "broken";

export type FormationMode = "line" | "deep" | "column";

export type FormationRole = "battle-line" | "reserve" | "flank-force";

export type BattlePhase = "opening" | "main-clash" | "flank-crisis" | "decision";

export type ScenarioId = "bibracte" | "sabis" | "gergovia" | "alesia" | "pharsalus" | "alexandria" | "zela" | "parthia";

export interface BattleEvent {
  id: string;
  title: string;
  detail: string;
}

export interface BattleAssessment {
  grades: Array<{ label: string; grade: string }>;
  overall: string;
  summary: string;
  lesson: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface FormationState {
  id: string;
  name: string;
  side: Side;
  x: number;
  y: number;
  facing: number;
  frontage: number;
  formationMode: FormationMode;
  role: FormationRole;
  active: boolean;
  strength: number;
  initialStrength: number;
  cohesion: number;
  morale: number;
  fatigue: number;
  order: FormationOrder;
  status: FormationStatus;
  target: Point;
  engagedWith?: string;
  flanked: boolean;
}

export interface BattleSnapshot {
  scenarioId: ScenarioId;
  battleName: string;
  battleDate: string;
  time: number;
  formations: FormationState[];
  phase: BattlePhase;
  phaseTitle: string;
  objective: string;
  events: BattleEvent[];
  outcome: "undecided" | "roman-victory" | "helvetian-victory";
  romanLosses: number;
  helvetianLosses: number;
  assessment?: BattleAssessment;
}
