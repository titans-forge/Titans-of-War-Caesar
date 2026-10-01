import type { FormationMode, FormationState, ScenarioId, Side } from "./types";

export type UnitArchetype =
  | "roman-infantry"
  | "gallic-infantry"
  | "hellenistic-infantry"
  | "missile-infantry"
  | "auxiliary-cavalry"
  | "horse-archer"
  | "cataphract"
  | "scythed-chariot";

export interface FormationVisualProfile {
  archetype: UnitArchetype;
  palette: string;
  standard: string;
  desktopFigures: number;
  mobileFigures: number;
}

export interface TerrainProjectionProfile {
  horizonY: number;
  farScale: number;
  nearScale: number;
  verticalCompression: number;
  shadowAngle: number;
}

export interface FormationSlot {
  index: number;
  row: number;
  column: number;
  lateral: number;
  forward: number;
  frontRank: boolean;
  variant: number;
}

export interface ProjectedPoint {
  x: number;
  y: number;
}

const TERRAIN_PROFILES: Record<ScenarioId, TerrainProjectionProfile> = {
  bibracte: { horizonY: 118, farScale: 0.62, nearScale: 1.04, verticalCompression: 0.68, shadowAngle: 0.42 },
  sabis: { horizonY: 115, farScale: 0.62, nearScale: 1.03, verticalCompression: 0.7, shadowAngle: 0.35 },
  gergovia: { horizonY: 95, farScale: 0.57, nearScale: 1.02, verticalCompression: 0.64, shadowAngle: 0.48 },
  alesia: { horizonY: 110, farScale: 0.6, nearScale: 1.03, verticalCompression: 0.7, shadowAngle: 0.38 },
  pharsalus: { horizonY: 120, farScale: 0.63, nearScale: 1.02, verticalCompression: 0.72, shadowAngle: 0.32 },
  alexandria: { horizonY: 105, farScale: 0.61, nearScale: 1.02, verticalCompression: 0.73, shadowAngle: 0.34 },
  zela: { horizonY: 100, farScale: 0.59, nearScale: 1.03, verticalCompression: 0.67, shadowAngle: 0.46 },
  parthia: { horizonY: 105, farScale: 0.6, nearScale: 1.04, verticalCompression: 0.69, shadowAngle: 0.4 },
};

const profile = (archetype: UnitArchetype, side: Side): FormationVisualProfile => ({
  archetype,
  palette: side === "roman" ? "roman-red" : archetype === "gallic-infantry" ? "gallic-earth" : "eastern-bronze",
  standard: side === "roman" ? "SPQR" : archetype === "gallic-infantry" ? "TRIBE" : "HOST",
  desktopFigures: archetype.includes("cavalry") || archetype === "horse-archer" || archetype === "cataphract" || archetype === "scythed-chariot" ? 16 : 48,
  mobileFigures: archetype.includes("cavalry") || archetype === "horse-archer" || archetype === "cataphract" || archetype === "scythed-chariot" ? 10 : 28,
});

export function visualProfileFor(formation: FormationState, scenarioId: ScenarioId): FormationVisualProfile {
  if (formation.id === "zela-chariots") return profile("scythed-chariot", formation.side);
  if (formation.id.startsWith("parthian-archers")) return profile("horse-archer", formation.side);
  if (formation.id === "parthian-cataphracts") return profile("cataphract", formation.side);
  if (formation.id === "roman-cavalry-screen" || formation.id === "pompey-cavalry") return profile("auxiliary-cavalry", formation.side);
  if (formation.id === "pompey-missiles") return profile("missile-infantry", formation.side);
  if (scenarioId === "pharsalus") return profile("roman-infantry", formation.side);
  if (scenarioId === "alexandria" && formation.side === "helvetian") return profile("hellenistic-infantry", formation.side);
  if (scenarioId === "zela" && formation.side === "helvetian") return profile("hellenistic-infantry", formation.side);
  return profile(formation.side === "roman" ? "roman-infantry" : "gallic-infantry", formation.side);
}

export function terrainProjectionFor(scenarioId: ScenarioId): TerrainProjectionProfile {
  return TERRAIN_PROFILES[scenarioId];
}

export function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function deterministicUnitValue(formationId: string, index: number, salt = 0): number {
  let value = hashString(`${formationId}:${index}:${salt}`);
  value ^= value << 13;
  value ^= value >>> 17;
  value ^= value << 5;
  return (value >>> 0) / 0xffffffff;
}

export function directionFrame(angle: number): number {
  const turn = Math.PI * 2;
  const normalized = ((angle % turn) + turn) % turn;
  return Math.round(normalized / (turn / 8)) % 8;
}

export function projectScale(y: number, worldHeight: number, terrain: TerrainProjectionProfile): number {
  const depth = Math.max(0, Math.min(1, (y - terrain.horizonY) / Math.max(1, worldHeight - terrain.horizonY)));
  return terrain.farScale + (terrain.nearScale - terrain.farScale) * depth;
}

function formationDimensions(mode: FormationMode, count: number): { columns: number; rows: number } {
  if (mode === "line") {
    const rows = count <= 16 ? 2 : 3;
    return { rows, columns: Math.ceil(count / rows) };
  }
  if (mode === "column") {
    const columns = count <= 16 ? 2 : 4;
    return { columns, rows: Math.ceil(count / columns) };
  }
  const columns = Math.max(3, Math.ceil(Math.sqrt(count * 1.35)));
  return { columns, rows: Math.ceil(count / columns) };
}

export function generateFormationSlots(
  formationId: string,
  mode: FormationMode,
  count: number,
  frontage: number,
  verticalCompression = 0.68,
): FormationSlot[] {
  if (count <= 0) return [];
  const { columns, rows } = formationDimensions(mode, count);
  const lateralSpacing = Math.min(20, Math.max(10, frontage / Math.max(columns, 1) * 0.86));
  const depthSpacing = (mode === "column" ? 15 : mode === "deep" ? 14 : 13) * verticalCompression;
  const slots: FormationSlot[] = [];

  for (let index = 0; index < count; index += 1) {
    const row = Math.floor(index / columns);
    const column = index % columns;
    const rowCount = Math.min(columns, count - row * columns);
    const irregularity = deterministicUnitValue(formationId, index, 7) - 0.5;
    slots.push({
      index,
      row,
      column,
      lateral: (column - (rowCount - 1) / 2) * lateralSpacing + irregularity * (mode === "line" ? 2.5 : 1.4),
      forward: ((rows - 1) / 2 - row) * depthSpacing + irregularity * 1.2,
      frontRank: row === 0,
      variant: Math.floor(deterministicUnitValue(formationId, index, 19) * 4),
    });
  }
  return slots;
}

export function projectFormationSlot(
  origin: ProjectedPoint,
  facing: number,
  slot: Pick<FormationSlot, "lateral" | "forward">,
): ProjectedPoint {
  const rightAngle = facing + Math.PI / 2;
  return {
    x: origin.x + Math.cos(rightAngle) * slot.lateral + Math.cos(facing) * slot.forward,
    y: origin.y + Math.sin(rightAngle) * slot.lateral + Math.sin(facing) * slot.forward,
  };
}

export function visibleFigureCount(strength: number, initialStrength: number, capacity: number): number {
  if (initialStrength <= 0 || capacity <= 0 || strength <= 0) return 0;
  return Math.max(1, Math.min(capacity, Math.round(capacity * strength / initialStrength)));
}

export function casualtyOrder(formationId: string, slots: FormationSlot[]): number[] {
  return [...slots]
    .sort((a, b) => {
      if (a.row !== b.row) return a.row - b.row;
      return deterministicUnitValue(formationId, a.index, 31) - deterministicUnitValue(formationId, b.index, 31);
    })
    .map((slot) => slot.index);
}

export function survivorIndices(formationId: string, slots: FormationSlot[], survivorCount: number): Set<number> {
  const losses = Math.max(0, slots.length - survivorCount);
  const removed = new Set(casualtyOrder(formationId, slots).slice(0, losses));
  return new Set(slots.filter((slot) => !removed.has(slot.index)).map((slot) => slot.index));
}

export function formationFootprint(slots: FormationSlot[], padding = 16): { width: number; height: number } {
  if (!slots.length) return { width: padding * 2, height: padding * 2 };
  const lateral = slots.map((slot) => slot.lateral);
  const forward = slots.map((slot) => slot.forward);
  return {
    width: Math.max(...lateral) - Math.min(...lateral) + padding * 2,
    height: Math.max(...forward) - Math.min(...forward) + padding * 2,
  };
}
