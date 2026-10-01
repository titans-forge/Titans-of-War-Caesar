import type { BattleAssessment, BattleEvent, BattlePhase, BattleSnapshot, FormationMode, FormationOrder, FormationRole, FormationState, Point, ScenarioId, Side } from "./types";

const WORLD = { width: 1600, height: 900 };
const CONTACT_DISTANCE = 86;

interface FormationSeed {
  id: string;
  name: string;
  side: Side;
  x: number;
  y: number;
  strength: number;
  role?: FormationRole;
  active?: boolean;
  cohesion?: number;
  morale?: number;
  fatigue?: number;
  order?: FormationOrder;
  formationMode?: FormationMode;
}

const bibracteFormations: FormationSeed[] = [
  { id: "legio-vii", name: "VII Cohort", side: "roman", x: 500, y: 670, strength: 480 },
  { id: "legio-viii", name: "VIII Cohort", side: "roman", x: 710, y: 700, strength: 480 },
  { id: "legio-ix", name: "IX Cohort", side: "roman", x: 920, y: 700, strength: 480 },
  { id: "legio-x", name: "X Cohort", side: "roman", x: 1090, y: 805, strength: 480, role: "reserve" },
  { id: "helv-tigurini", name: "Tigurini", side: "helvetian", x: 420, y: 210, strength: 560 },
  { id: "helv-tougeni", name: "Tougeni", side: "helvetian", x: 620, y: 185, strength: 540 },
  { id: "helv-verbigeni", name: "Verbigeni", side: "helvetian", x: 820, y: 195, strength: 530 },
  { id: "helv-ambrones", name: "Ambrones", side: "helvetian", x: 1020, y: 180, strength: 550 },
  { id: "helv-reserve", name: "Boii & Tulingi", side: "helvetian", x: 1515, y: 470, strength: 620, role: "flank-force", active: false },
];

const sabisFormations: FormationSeed[] = [
  { id: "legio-ix", name: "IX Cohort", side: "roman", x: 430, y: 675, strength: 470, cohesion: 68, fatigue: 26, order: "hold" },
  { id: "legio-x", name: "X Cohort", side: "roman", x: 650, y: 650, strength: 490, cohesion: 72, fatigue: 24, order: "hold" },
  { id: "legio-xii", name: "XII Cohort", side: "roman", x: 900, y: 720, strength: 455, cohesion: 54, morale: 72, fatigue: 31, order: "hold" },
  { id: "legio-vii", name: "VII Cohort", side: "roman", x: 1110, y: 740, strength: 465, cohesion: 58, morale: 74, fatigue: 29, order: "hold" },
  { id: "legio-xiii", name: "Rear Column", side: "roman", x: 1320, y: 680, strength: 500, cohesion: 82, fatigue: 18, role: "reserve", active: false, formationMode: "column" },
  { id: "belg-atrebates", name: "Atrebates", side: "helvetian", x: 350, y: 235, strength: 520, cohesion: 78, fatigue: 8, order: "charge" },
  { id: "belg-viromandui", name: "Viromandui", side: "helvetian", x: 650, y: 220, strength: 540, cohesion: 80, fatigue: 8, order: "charge" },
  { id: "belg-nervii-a", name: "Nervii Center", side: "helvetian", x: 940, y: 205, strength: 590, cohesion: 86, morale: 86, fatigue: 6, order: "charge" },
  { id: "belg-nervii-b", name: "Nervii Wing", side: "helvetian", x: 1210, y: 250, strength: 580, cohesion: 84, morale: 86, fatigue: 6, order: "charge" },
];

const gergoviaFormations: FormationSeed[] = [
  { id: "legio-viii", name: "VIII Cohort", side: "roman", x: 470, y: 620, strength: 475, cohesion: 84, fatigue: 18 },
  { id: "legio-x", name: "X Cohort", side: "roman", x: 700, y: 640, strength: 490, cohesion: 88, fatigue: 16 },
  { id: "legio-xiii", name: "XIII Cohort", side: "roman", x: 930, y: 635, strength: 470, cohesion: 82, fatigue: 20 },
  { id: "legio-xv", name: "XV Cohort", side: "roman", x: 1160, y: 615, strength: 465, cohesion: 80, fatigue: 22, role: "reserve" },
  { id: "arv-lower-a", name: "Lower Camp West", side: "helvetian", x: 520, y: 445, strength: 420, cohesion: 62, morale: 68, fatigue: 12, order: "hold" },
  { id: "arv-lower-b", name: "Lower Camp East", side: "helvetian", x: 820, y: 405, strength: 430, cohesion: 64, morale: 70, fatigue: 12, order: "hold" },
  { id: "arv-lower-c", name: "Slope Guard", side: "helvetian", x: 1100, y: 365, strength: 450, cohesion: 66, morale: 72, fatigue: 10, order: "hold" },
  { id: "arv-upper-a", name: "Arvernian Reserve", side: "helvetian", x: 670, y: 175, strength: 610, cohesion: 88, morale: 88, fatigue: 6, active: false, order: "charge" },
  { id: "arv-upper-b", name: "Vercingetorix's Guard", side: "helvetian", x: 1010, y: 150, strength: 630, cohesion: 90, morale: 90, fatigue: 4, active: false, order: "charge" },
];

const alesiaFormations: FormationSeed[] = [
  { id: "legio-inner-west", name: "Inner Wall West", side: "roman", x: 470, y: 355, strength: 460, cohesion: 86, fatigue: 24, order: "hold", formationMode: "line" },
  { id: "legio-inner-east", name: "Inner Wall East", side: "roman", x: 820, y: 340, strength: 455, cohesion: 84, fatigue: 26, order: "hold", formationMode: "line" },
  { id: "legio-outer-west", name: "Outer Wall West", side: "roman", x: 500, y: 610, strength: 470, cohesion: 82, fatigue: 28, order: "hold", formationMode: "line" },
  { id: "legio-outer-east", name: "Outer Wall East", side: "roman", x: 1030, y: 605, strength: 465, cohesion: 80, fatigue: 30, order: "hold", formationMode: "line" },
  { id: "legio-reserve", name: "Mobile Reserve", side: "roman", x: 900, y: 485, strength: 510, cohesion: 90, morale: 88, fatigue: 16, role: "reserve", formationMode: "column" },
  { id: "alesia-sortie-west", name: "Alesia Sortie West", side: "helvetian", x: 470, y: 210, strength: 500, cohesion: 78, morale: 82, fatigue: 12, order: "charge" },
  { id: "alesia-sortie-east", name: "Alesia Sortie East", side: "helvetian", x: 850, y: 200, strength: 520, cohesion: 80, morale: 84, fatigue: 10, order: "charge" },
  { id: "relief-west", name: "Relief Army West", side: "helvetian", x: 420, y: 825, strength: 610, cohesion: 82, morale: 86, fatigue: 8, active: false, order: "charge" },
  { id: "relief-east", name: "Relief Army East", side: "helvetian", x: 1030, y: 825, strength: 620, cohesion: 84, morale: 86, fatigue: 8, active: false, order: "charge" },
  { id: "relief-weak", name: "Vercassivellaunus", side: "helvetian", x: 1320, y: 820, strength: 690, cohesion: 90, morale: 92, fatigue: 5, role: "flank-force", active: false, order: "charge" },
];

const pharsalusFormations: FormationSeed[] = [
  { id: "caesar-left", name: "Caesar's Left", side: "roman", x: 430, y: 675, strength: 470, cohesion: 88, morale: 88, fatigue: 18, order: "hold", formationMode: "line" },
  { id: "caesar-center", name: "Caesar's Center", side: "roman", x: 710, y: 685, strength: 480, cohesion: 90, morale: 89, fatigue: 17, order: "hold", formationMode: "line" },
  { id: "caesar-right", name: "Legio X", side: "roman", x: 990, y: 665, strength: 490, cohesion: 92, morale: 91, fatigue: 16, order: "hold", formationMode: "line" },
  { id: "caesar-fourth-line", name: "Fourth Line", side: "roman", x: 1210, y: 770, strength: 520, cohesion: 94, morale: 92, fatigue: 10, role: "reserve", order: "hold", formationMode: "deep" },
  { id: "pompey-right", name: "Pompey's Right", side: "helvetian", x: 430, y: 240, strength: 530, cohesion: 88, morale: 86, fatigue: 12, order: "hold", formationMode: "line" },
  { id: "pompey-center", name: "Pompey's Center", side: "helvetian", x: 720, y: 230, strength: 550, cohesion: 90, morale: 87, fatigue: 11, order: "hold", formationMode: "line" },
  { id: "pompey-left", name: "Pompey's Left", side: "helvetian", x: 1010, y: 245, strength: 555, cohesion: 91, morale: 88, fatigue: 10, order: "hold", formationMode: "line" },
  { id: "pompey-cavalry", name: "Pompeian Cavalry", side: "helvetian", x: 1200, y: 285, strength: 700, cohesion: 88, morale: 90, fatigue: 7, role: "flank-force", active: false, order: "charge", formationMode: "line" },
  { id: "pompey-missiles", name: "Archers & Slingers", side: "helvetian", x: 1430, y: 320, strength: 400, cohesion: 72, morale: 76, fatigue: 8, active: false, order: "advance", formationMode: "line" },
];

const alexandriaFormations: FormationSeed[] = [
  { id: "palace-guard", name: "Palace Guard", side: "roman", x: 390, y: 690, strength: 430, cohesion: 86, morale: 84, fatigue: 22, order: "hold", formationMode: "line" },
  { id: "street-cohort", name: "Street Cohort", side: "roman", x: 680, y: 700, strength: 420, cohesion: 82, morale: 82, fatigue: 25, order: "hold", formationMode: "line" },
  { id: "dockyard-cohort", name: "Dockyard Cohort", side: "roman", x: 980, y: 650, strength: 435, cohesion: 85, morale: 84, fatigue: 21, order: "hold", formationMode: "line" },
  { id: "pharos-column", name: "Pharos Column", side: "roman", x: 1160, y: 560, strength: 470, cohesion: 90, morale: 88, fatigue: 16, role: "reserve", order: "hold", formationMode: "column" },
  { id: "alex-west", name: "Achillas' West Wing", side: "helvetian", x: 390, y: 245, strength: 520, cohesion: 82, morale: 84, fatigue: 10, order: "charge", formationMode: "line" },
  { id: "alex-center", name: "Alexandrian Veterans", side: "helvetian", x: 690, y: 225, strength: 540, cohesion: 86, morale: 86, fatigue: 9, order: "charge", formationMode: "line" },
  { id: "alex-harbor", name: "Harbor Assault", side: "helvetian", x: 980, y: 245, strength: 525, cohesion: 82, morale: 85, fatigue: 9, order: "charge", formationMode: "line" },
  { id: "pharos-garrison", name: "Pharos Garrison", side: "helvetian", x: 1360, y: 245, strength: 460, cohesion: 74, morale: 78, fatigue: 14, order: "hold", formationMode: "deep" },
  { id: "royal-reserve", name: "Royal Reinforcement", side: "helvetian", x: 1500, y: 430, strength: 560, cohesion: 84, morale: 86, fatigue: 7, role: "flank-force", active: false, order: "charge", formationMode: "column" },
];

const zelaFormations: FormationSeed[] = [
  { id: "zela-left", name: "XXXVI Legion", side: "roman", x: 430, y: 675, strength: 470, cohesion: 70, morale: 80, fatigue: 24, order: "reform", formationMode: "column" },
  { id: "zela-center", name: "Galatian Legion", side: "roman", x: 690, y: 700, strength: 480, cohesion: 68, morale: 79, fatigue: 22, order: "reform", formationMode: "column" },
  { id: "zela-center-right", name: "Pontic Veterans", side: "roman", x: 950, y: 680, strength: 470, cohesion: 72, morale: 81, fatigue: 21, order: "reform", formationMode: "column" },
  { id: "legio-vi", name: "Legio VI", side: "roman", x: 1210, y: 650, strength: 540, cohesion: 92, morale: 94, fatigue: 24, role: "reserve", order: "reform", formationMode: "column" },
  { id: "zela-chariots", name: "Scythed Chariots", side: "helvetian", x: 800, y: 305, strength: 430, cohesion: 82, morale: 86, fatigue: 4, active: false, order: "charge", formationMode: "line" },
  { id: "pontic-left", name: "Pontic Left", side: "helvetian", x: 430, y: 185, strength: 490, cohesion: 74, morale: 80, fatigue: 7, active: false, order: "charge", formationMode: "line" },
  { id: "pontic-center", name: "Pontic Center", side: "helvetian", x: 760, y: 170, strength: 510, cohesion: 76, morale: 81, fatigue: 6, active: false, order: "charge", formationMode: "line" },
  { id: "pontic-right", name: "Pontic Right", side: "helvetian", x: 1090, y: 180, strength: 505, cohesion: 75, morale: 81, fatigue: 7, active: false, order: "charge", formationMode: "line" },
  { id: "pharnaces-camp", name: "Royal Camp Guard", side: "helvetian", x: 1220, y: 95, strength: 430, cohesion: 66, morale: 72, fatigue: 10, order: "hold", formationMode: "deep" },
];

const parthiaFormations: FormationSeed[] = [
  { id: "parthia-left", name: "Legio X", side: "roman", x: 470, y: 680, strength: 500, cohesion: 90, morale: 90, fatigue: 18, order: "hold", formationMode: "deep" },
  { id: "parthia-center", name: "Legio VI", side: "roman", x: 760, y: 700, strength: 490, cohesion: 92, morale: 92, fatigue: 20, order: "hold", formationMode: "deep" },
  { id: "parthia-right", name: "Legio XII", side: "roman", x: 1050, y: 680, strength: 500, cohesion: 88, morale: 89, fatigue: 18, order: "hold", formationMode: "deep" },
  { id: "roman-cavalry-screen", name: "Auxiliary Cavalry", side: "roman", x: 1280, y: 735, strength: 430, cohesion: 86, morale: 87, fatigue: 14, role: "reserve", order: "hold", formationMode: "line" },
  { id: "parthian-archers-left", name: "Horse Archers West", side: "helvetian", x: 430, y: 250, strength: 450, cohesion: 88, morale: 90, fatigue: 8, order: "advance", formationMode: "line" },
  { id: "parthian-archers-center", name: "Horse Archers Center", side: "helvetian", x: 770, y: 210, strength: 470, cohesion: 90, morale: 91, fatigue: 7, order: "advance", formationMode: "line" },
  { id: "parthian-archers-right", name: "Horse Archers East", side: "helvetian", x: 1110, y: 245, strength: 450, cohesion: 88, morale: 90, fatigue: 8, order: "advance", formationMode: "line" },
  { id: "parthian-cataphracts", name: "Royal Cataphracts", side: "helvetian", x: 1370, y: 165, strength: 620, cohesion: 94, morale: 94, fatigue: 5, role: "flank-force", active: false, order: "charge", formationMode: "deep" },
];

const scenarioFormations = (scenarioId: ScenarioId) => {
  if (scenarioId === "sabis") return sabisFormations;
  if (scenarioId === "gergovia") return gergoviaFormations;
  if (scenarioId === "alesia") return alesiaFormations;
  if (scenarioId === "pharsalus") return pharsalusFormations;
  if (scenarioId === "alexandria") return alexandriaFormations;
  if (scenarioId === "zela") return zelaFormations;
  if (scenarioId === "parthia") return parthiaFormations;
  return bibracteFormations;
};

function initialFormation({ id, name, side, x, y, strength, role = "battle-line", active = true, cohesion, morale, fatigue, order, formationMode }: FormationSeed): FormationState {
  return {
    id,
    name,
    side,
    x,
    y,
    facing: side === "roman" ? -Math.PI / 2 : Math.PI / 2,
    frontage: formationMode === "column" ? 95 : side === "roman" ? 150 : 170,
    formationMode: formationMode ?? (side === "roman" ? "deep" : "line"),
    role,
    active,
    strength,
    initialStrength: strength,
    cohesion: cohesion ?? (side === "roman" ? 88 : 74),
    morale: morale ?? (side === "roman" ? 84 : 78),
    fatigue: fatigue ?? (side === "roman" ? 14 : 20),
    order: order ?? (side === "roman" ? "hold" : "advance"),
    status: "steady",
    target: { x, y: side === "roman" ? 460 : 485 },
    flanked: false,
  };
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const distance = (a: FormationState, b: FormationState) => Math.hypot(a.x - b.x, a.y - b.y);

export class BattleEngine {
  private time = 0;
  private state: FormationState[];
  private outcome: BattleSnapshot["outcome"] = "undecided";
  private events: BattleEvent[] = [];
  private reserveCommittedAt?: number;
  private reserveCountered = false;
  private rallied = new Set<string>();
  private rearCommitted = false;
  private lowerCampsTaken = false;
  private withdrawalSignalAt?: number;
  private withdrewAfterSignal = new Set<string>();
  private overextended = new Set<string>();
  private alesiaReserveCountered = false;
  private pharsalusReserveCommittedAt?: number;
  private pharsalusCavalryCountered = false;
  private pharsalusFlankTurned = false;
  private alexandriaPharosCommittedAt?: number;
  private alexandriaPharosSecured = false;
  private zelaFormedLines = new Set<string>();
  private zelaChariotsStopped = false;
  private zelaLegioVICommittedAt?: number;
  private zelaCampStormed = false;
  private parthiaFormedInfantry = new Set<string>();
  private parthiaRecklessChases = new Set<string>();
  private parthiaCataphractsCommitted = false;
  private parthiaScreenCountered = false;
  private parthiaRouteSecured = false;

  constructor(private scenarioId: ScenarioId = "bibracte") {
    this.state = scenarioFormations(scenarioId).map(initialFormation);
  }

  loadScenario(scenarioId: ScenarioId) {
    this.scenarioId = scenarioId;
    this.reset();
  }

  reset() {
    this.time = 0;
    this.state = scenarioFormations(this.scenarioId).map(initialFormation);
    this.outcome = "undecided";
    this.events = [];
    this.reserveCommittedAt = undefined;
    this.reserveCountered = false;
    this.rallied.clear();
    this.rearCommitted = false;
    this.lowerCampsTaken = false;
    this.withdrawalSignalAt = undefined;
    this.withdrewAfterSignal.clear();
    this.overextended.clear();
    this.alesiaReserveCountered = false;
    this.pharsalusReserveCommittedAt = undefined;
    this.pharsalusCavalryCountered = false;
    this.pharsalusFlankTurned = false;
    this.alexandriaPharosCommittedAt = undefined;
    this.alexandriaPharosSecured = false;
    this.zelaFormedLines.clear();
    this.zelaChariotsStopped = false;
    this.zelaLegioVICommittedAt = undefined;
    this.zelaCampStormed = false;
    this.parthiaFormedInfantry.clear();
    this.parthiaRecklessChases.clear();
    this.parthiaCataphractsCommitted = false;
    this.parthiaScreenCountered = false;
    this.parthiaRouteSecured = false;
  }

  order(id: string, order: FormationOrder) {
    if (this.outcome !== "undecided") return;
    const unit = this.state.find((formation) => formation.id === id && formation.side === "roman");
    if (!unit || unit.status === "broken") return;
    this.noteReserveCommitment(unit, order);
    if (order === "reform") this.rallied.add(unit.id);
    if (unit.id === "legio-xiii" && unit.active && (order === "advance" || order === "charge")) this.rearCommitted = true;
    if (this.scenarioId === "pharsalus" && unit.id === "caesar-fourth-line" && (order === "advance" || order === "charge") && this.pharsalusReserveCommittedAt === undefined) this.pharsalusReserveCommittedAt = this.time;
    if (this.scenarioId === "alexandria" && unit.id === "pharos-column" && (order === "advance" || order === "charge") && this.alexandriaPharosCommittedAt === undefined) this.alexandriaPharosCommittedAt = this.time;
    if (this.scenarioId === "zela" && unit.id === "legio-vi" && (order === "advance" || order === "charge") && this.zelaLegioVICommittedAt === undefined) this.zelaLegioVICommittedAt = this.time;
    if (this.scenarioId === "parthia" && unit.id !== "roman-cavalry-screen" && order === "charge" && !this.parthiaCataphractsCommitted) this.parthiaRecklessChases.add(unit.id);
    if (this.scenarioId === "parthia" && unit.id === "roman-cavalry-screen" && order === "charge" && this.parthiaCataphractsCommitted) this.parthiaScreenCountered = true;
    if (this.scenarioId === "gergovia" && this.withdrawalSignalAt !== undefined && order === "withdraw") this.withdrewAfterSignal.add(unit.id);
    unit.order = order;
    if (order === "withdraw") unit.target = { x: unit.x, y: WORLD.height - 90 };
    if (order === "advance" || order === "charge") {
      const alesiaThreat = this.scenarioId === "alesia" && unit.id === "legio-reserve"
        ? this.state.find((formation) => formation.id === "relief-weak" && formation.active && formation.status !== "broken")
        : undefined;
      const pharsalusThreat = this.scenarioId === "pharsalus" && unit.id === "caesar-fourth-line"
        ? this.pharsalusReserveTarget()
        : undefined;
      const alexandriaThreat = this.scenarioId === "alexandria" && unit.id === "pharos-column"
        ? this.alexandriaPharosTarget()
        : undefined;
      const zelaThreat = this.scenarioId === "zela" && unit.id === "legio-vi"
        ? this.zelaVeteranTarget()
        : undefined;
      const parthiaThreat = this.scenarioId === "parthia" && unit.id === "roman-cavalry-screen"
        ? this.parthiaReserveTarget()
        : undefined;
      const flankThreat = unit.id === "legio-x"
        ? this.state.find((formation) => formation.id === "helv-reserve" && formation.active && formation.status !== "broken")
        : undefined;
      const enemy = alesiaThreat ?? pharsalusThreat ?? alexandriaThreat ?? zelaThreat ?? parthiaThreat ?? flankThreat ?? this.nearestEnemy(unit);
      if (enemy) unit.target = { x: enemy.x, y: enemy.y };
    }
  }

  move(id: string, target: Point, facing?: number, frontage?: number) {
    if (this.outcome !== "undecided") return;
    const unit = this.state.find((formation) => formation.id === id && formation.side === "roman");
    if (!unit || unit.status === "broken") return;
    this.noteReserveCommitment(unit, "advance");
    unit.order = "advance";
    unit.target = {
      x: clamp(target.x, 80, WORLD.width - 80),
      y: clamp(target.y, 100, WORLD.height - 70),
    };
    if (facing !== undefined) unit.facing = facing;
    if (frontage !== undefined) {
      unit.frontage = clamp(frontage, 90, 210);
      unit.formationMode = unit.frontage >= 170 ? "line" : unit.frontage <= 110 ? "column" : "deep";
    }
  }

  setFormation(id: string, formationMode: FormationMode) {
    if (this.outcome !== "undecided") return;
    const unit = this.state.find((formation) => formation.id === id && formation.side === "roman");
    if (!unit || unit.status === "broken" || unit.status === "engaged") return;
    unit.formationMode = formationMode;
    unit.frontage = formationMode === "line" ? 190 : formationMode === "column" ? 95 : 140;
    unit.order = "reform";
    unit.cohesion = clamp(unit.cohesion - 3, 0, 100);
    this.rallied.add(unit.id);
    if (this.scenarioId === "zela" && formationMode === "line") this.zelaFormedLines.add(unit.id);
    if (this.scenarioId === "parthia" && unit.id !== "roman-cavalry-screen" && formationMode !== "column") this.parthiaFormedInfantry.add(unit.id);
  }

  tick(seconds: number) {
    if (this.outcome !== "undecided" || seconds <= 0) return;
    const dt = Math.min(seconds, 0.05);
    this.time += dt;
    this.updateScenario();
    for (const unit of this.state) this.updateFormation(unit, dt);
    this.resolveCombat(dt);
    this.resolveOutcome();
  }

  snapshot(): BattleSnapshot {
    const romans = this.state.filter((unit) => unit.side === "roman");
    const helvetians = this.state.filter((unit) => unit.side === "helvetian");
    return {
      scenarioId: this.scenarioId,
      battleName: this.scenarioId === "sabis" ? "The Sabis" : this.scenarioId === "gergovia" ? "Gergovia" : this.scenarioId === "alesia" ? "Alesia" : this.scenarioId === "pharsalus" ? "Pharsalus" : this.scenarioId === "alexandria" ? "Alexandria" : this.scenarioId === "zela" ? "Zela" : this.scenarioId === "parthia" ? "Beyond Carrhae" : "Bibracte",
      battleDate: this.scenarioId === "sabis" ? "57 BC" : this.scenarioId === "gergovia" || this.scenarioId === "alesia" ? "52 BC" : this.scenarioId === "pharsalus" || this.scenarioId === "alexandria" ? "48 BC" : this.scenarioId === "zela" ? "47 BC" : this.scenarioId === "parthia" ? "44 BC · AU" : "58 BC",
      time: this.time,
      formations: this.state.map((unit) => ({ ...unit, target: { ...unit.target } })),
      phase: this.phase(),
      phaseTitle: this.phaseTitle(),
      objective: this.objective(),
      events: this.events.map((event) => ({ ...event })),
      outcome: this.outcome,
      romanLosses: romans.reduce((sum, unit) => sum + unit.initialStrength - unit.strength, 0),
      helvetianLosses: helvetians.reduce((sum, unit) => sum + unit.initialStrength - unit.strength, 0),
      assessment: this.outcome === "undecided" ? undefined : this.assessBattle(),
    };
  }

  private nearestEnemy(unit: FormationState) {
    return this.state
      .filter((candidate) => candidate.side !== unit.side && candidate.active && candidate.status !== "broken")
      .sort((a, b) => distance(unit, a) - distance(unit, b))[0];
  }

  private pharsalusReserveTarget() {
    const cavalry = this.state.find((unit) => unit.id === "pompey-cavalry" && unit.active && unit.status !== "routing" && unit.status !== "broken");
    if (cavalry) return cavalry;
    return this.state.find((unit) => unit.id === "pompey-left" && unit.active && unit.status !== "routing" && unit.status !== "broken");
  }

  private alexandriaPharosTarget() {
    const garrison = this.state.find((unit) => unit.id === "pharos-garrison" && unit.active && unit.status !== "routing" && unit.status !== "broken");
    if (garrison) return garrison;
    return this.state.find((unit) => unit.id === "royal-reserve" && unit.active && unit.status !== "routing" && unit.status !== "broken");
  }

  private zelaVeteranTarget() {
    const chariots = this.state.find((unit) => unit.id === "zela-chariots" && unit.active && unit.status !== "routing" && unit.status !== "broken");
    if (chariots) return chariots;
    const right = this.state.find((unit) => unit.id === "pontic-right" && unit.active && unit.status !== "routing" && unit.status !== "broken");
    if (right) return right;
    return this.state.find((unit) => unit.id === "pharnaces-camp" && unit.status !== "routing" && unit.status !== "broken");
  }

  private zelaChariotThreat(unit: FormationState) {
    if (unit.id === "zela-chariots") return undefined;
    const chariots = this.state.find((candidate) => candidate.id === "zela-chariots" && candidate.active && candidate.status !== "routing" && candidate.status !== "broken");
    return chariots && distance(unit, chariots) < 180 ? chariots : undefined;
  }

  private parthiaReserveTarget() {
    return this.state.find((unit) => unit.id === "parthian-cataphracts" && unit.active && unit.status !== "routing" && unit.status !== "broken");
  }

  private updateFormation(unit: FormationState, dt: number) {
    if (!unit.active || unit.status === "broken") return;
    if (this.scenarioId === "gergovia" && unit.side === "roman" && unit.y < 315) this.overextended.add(unit.id);
    if (unit.status === "engaged") unit.status = "steady";
    unit.engagedWith = undefined;
    unit.flanked = false;
    if (unit.morale <= 10 || unit.cohesion <= 5 || unit.strength <= unit.initialStrength * 0.18) {
      unit.status = "routing";
      unit.order = "withdraw";
      unit.target = { x: unit.x, y: unit.side === "roman" ? WORLD.height + 80 : -80 };
    }
    if (unit.status === "routing" && (unit.y < -40 || unit.y > WORLD.height + 40)) {
      unit.status = "broken";
      return;
    }
    if (unit.order === "reform") {
      unit.cohesion = clamp(unit.cohesion + 8 * dt, 0, 100);
      unit.fatigue = clamp(unit.fatigue - 5 * dt, 0, 100);
      return;
    }
    if (unit.order === "hold") {
      unit.fatigue = clamp(unit.fatigue - 1.5 * dt, 0, 100);
      return;
    }
    if (unit.side === "helvetian" && this.scenarioId === "bibracte" && this.time < 2.5) return;
    if (unit.side === "helvetian") {
      if (this.scenarioId === "bibracte" && unit.role === "flank-force") {
        const reserve = this.state.find((candidate) => candidate.id === "legio-x" && candidate.status !== "broken");
        const target = reserve ?? this.state.find((candidate) => candidate.id === "legio-ix");
        if (target) unit.target = { x: target.x, y: target.y };
      } else if (this.scenarioId === "pharsalus" && unit.id === "pompey-cavalry") {
        const right = this.state.find((candidate) => candidate.id === "caesar-right" && candidate.status !== "broken");
        const reserve = this.state.find((candidate) => candidate.id === "caesar-fourth-line" && candidate.status !== "broken");
        const target = right ?? reserve;
        if (target) unit.target = { x: target.x + 90, y: target.y };
      } else if (this.scenarioId === "pharsalus" && unit.id === "pompey-missiles") {
        const right = this.state.find((candidate) => candidate.id === "caesar-right" && candidate.status !== "broken");
        if (right) unit.target = { x: right.x + 55, y: right.y - 30 };
      } else if (this.scenarioId === "alexandria") {
        const targetId = unit.id === "alex-west"
          ? "palace-guard"
          : unit.id === "alex-center"
            ? "street-cohort"
            : unit.id === "alex-harbor"
              ? "dockyard-cohort"
              : unit.id === "royal-reserve"
                ? "pharos-column"
                : undefined;
        const target = targetId ? this.state.find((candidate) => candidate.id === targetId && candidate.status !== "broken") : undefined;
        if (target) unit.target = { x: target.x, y: target.y };
      } else if (this.scenarioId === "zela") {
        const targetId = unit.id === "zela-chariots" || unit.id === "pontic-center"
          ? "zela-center"
          : unit.id === "pontic-left"
            ? "zela-left"
            : unit.id === "pontic-right"
              ? "legio-vi"
              : undefined;
        const target = targetId ? this.state.find((candidate) => candidate.id === targetId && candidate.status !== "broken") : undefined;
        if (target) unit.target = { x: target.x, y: target.y };
      } else if (this.scenarioId === "parthia") {
        if (unit.id.startsWith("parthian-archers")) {
          const target = this.nearestEnemy(unit);
          if (target) {
            const gap = distance(unit, target);
            unit.target = gap < 175
              ? { x: clamp(unit.x + (unit.x < target.x ? -170 : 170), 110, WORLD.width - 110), y: 120 }
              : { x: target.x, y: target.y - 185 };
          }
        } else if (unit.id === "parthian-cataphracts") {
          const exposed = this.state.find((candidate) => candidate.side === "roman" && candidate.id !== "roman-cavalry-screen" && (candidate.order === "charge" || candidate.y < 470) && candidate.status !== "broken");
          const screen = this.state.find((candidate) => candidate.id === "roman-cavalry-screen" && candidate.status !== "broken");
          const target = exposed ?? screen ?? this.nearestEnemy(unit);
          if (target) unit.target = { x: target.x, y: target.y };
        }
      } else {
        const enemy = this.nearestEnemy(unit);
        unit.target = enemy && distance(unit, enemy) < 180
          ? { x: enemy.x, y: enemy.y }
          : { x: unit.x, y: 485 };
      }
    }
    const designatedAlesiaThreat = this.scenarioId === "alesia" && unit.id === "legio-reserve"
      ? this.state.find((candidate) => candidate.id === "relief-weak" && candidate.active && candidate.status !== "broken")
      : undefined;
    const designatedPharsalusThreat = this.scenarioId === "pharsalus" && unit.id === "caesar-fourth-line"
      ? this.pharsalusReserveTarget()
      : undefined;
    const designatedAlexandriaThreat = this.scenarioId === "alexandria" && unit.id === "pharos-column"
      ? this.alexandriaPharosTarget()
      : undefined;
    const designatedZelaThreat = this.scenarioId === "zela"
      ? this.zelaChariotThreat(unit) ?? (unit.id === "legio-vi" ? this.zelaVeteranTarget() : undefined)
      : undefined;
    const designatedParthiaThreat = this.scenarioId === "parthia" && unit.id === "roman-cavalry-screen" ? this.parthiaReserveTarget() : undefined;
    const designatedThreat = designatedAlesiaThreat ?? designatedPharsalusThreat ?? designatedAlexandriaThreat ?? designatedZelaThreat ?? designatedParthiaThreat;
    if (designatedThreat && (unit.order === "advance" || unit.order === "charge")) unit.target = { x: designatedThreat.x, y: designatedThreat.y };
    const blockingEnemy = designatedThreat ?? this.nearestEnemy(unit);
    if (unit.status !== "routing" && blockingEnemy && distance(unit, blockingEnemy) <= CONTACT_DISTANCE) return;
    const dx = unit.target.x - unit.x;
    const dy = unit.target.y - unit.y;
    const length = Math.hypot(dx, dy);
    if (length < 5) return;
    const baseSpeed = unit.order === "charge" ? 54 : unit.status === "routing" ? 70 : 34;
    const formationSpeed = unit.formationMode === "column" ? 1.22 : unit.formationMode === "line" ? 0.92 : 1;
    const speed = baseSpeed * formationSpeed * (1 - unit.fatigue / 180);
    unit.x += (dx / length) * speed * dt;
    unit.y += (dy / length) * speed * dt;
    unit.facing = Math.atan2(dy, dx);
    unit.fatigue = clamp(unit.fatigue + (unit.order === "charge" ? 7 : 2.2) * dt, 0, 100);
    if (unit.order === "charge") unit.cohesion = clamp(unit.cohesion - 1.5 * dt, 0, 100);
  }

  private resolveCombat(dt: number) {
    if (this.scenarioId === "parthia") this.resolveParthianHarassment(dt);
    for (const roman of this.state.filter((unit) => unit.side === "roman" && unit.active && unit.status !== "broken")) {
      const designatedAlesiaThreat = this.scenarioId === "alesia" && roman.id === "legio-reserve"
        ? this.state.find((unit) => unit.id === "relief-weak" && unit.active && unit.status !== "broken")
        : undefined;
      const designatedPharsalusThreat = this.scenarioId === "pharsalus" && roman.id === "caesar-fourth-line"
        ? this.pharsalusReserveTarget()
        : undefined;
      const designatedAlexandriaThreat = this.scenarioId === "alexandria" && roman.id === "pharos-column"
        ? this.alexandriaPharosTarget()
        : undefined;
      const designatedZelaThreat = this.scenarioId === "zela"
        ? this.zelaChariotThreat(roman) ?? (roman.id === "legio-vi" ? this.zelaVeteranTarget() : undefined)
        : undefined;
      const designatedParthiaThreat = this.scenarioId === "parthia" && roman.id === "roman-cavalry-screen" ? this.parthiaReserveTarget() : undefined;
      const enemy = designatedAlesiaThreat ?? designatedPharsalusThreat ?? designatedAlexandriaThreat ?? designatedZelaThreat ?? designatedParthiaThreat ?? this.nearestEnemy(roman);
      if (!enemy || distance(roman, enemy) > CONTACT_DISTANCE) continue;
      roman.status = roman.status === "routing" ? "routing" : "engaged";
      enemy.status = enemy.status === "routing" ? "routing" : "engaged";
      roman.engagedWith = enemy.id;
      enemy.engagedWith = roman.id;
      if (roman.id === "legio-x" && enemy.id === "helv-reserve") this.reserveCountered = true;
      if (this.scenarioId === "alesia" && roman.id === "legio-reserve" && enemy.id === "relief-weak") this.alesiaReserveCountered = true;
      if (this.scenarioId === "pharsalus" && roman.id === "caesar-fourth-line" && enemy.id === "pompey-cavalry") this.pharsalusCavalryCountered = true;
      if (this.scenarioId === "pharsalus" && roman.id === "caesar-fourth-line" && enemy.id === "pompey-left") this.pharsalusFlankTurned = true;
      const romanPower = this.combatPower(roman);
      const enemyPower = this.combatPower(enemy);
      const romanFlanked = this.isFlanked(roman, enemy);
      const enemyFlanked = this.isFlanked(enemy, roman);
      roman.flanked = romanFlanked;
      enemy.flanked = enemyFlanked;
      const fortifiedExposure = this.scenarioId === "alesia" && roman.role !== "reserve" && roman.order === "hold"
        ? 0.58
        : this.scenarioId === "alexandria" && roman.id !== "pharos-column" && roman.order === "hold"
          ? 0.64
          : this.scenarioId === "zela" && roman.formationMode === "line" && (roman.order === "hold" || roman.order === "reform")
            ? 0.56
          : 1;
      const zelaVeteranExposure = this.scenarioId === "zela" && roman.id === "legio-vi" ? 0.62 : 1;
      const parthiaDisciplineExposure = this.scenarioId === "parthia" && roman.id !== "roman-cavalry-screen" && roman.formationMode !== "column" && (roman.order === "hold" || roman.order === "reform") ? 0.62 : 1;
      const romanExposure = (romanFlanked ? 1.55 : 1) * (roman.formationMode === "column" ? 1.25 : 1) * fortifiedExposure * zelaVeteranExposure * parthiaDisciplineExposure;
      const enemyExposure = (enemyFlanked ? 1.55 : 1) * (enemy.formationMode === "column" ? 1.25 : 1);
      const romanLoss = (3.2 * enemyPower / Math.max(0.45, romanPower)) * romanExposure * dt;
      const enemyLoss = (3.5 * romanPower / Math.max(0.45, enemyPower)) * enemyExposure * dt;
      roman.strength = Math.max(0, roman.strength - romanLoss);
      enemy.strength = Math.max(0, enemy.strength - enemyLoss);
      roman.cohesion = clamp(roman.cohesion - (2.2 + enemyPower) * romanExposure * dt, 0, 100);
      enemy.cohesion = clamp(enemy.cohesion - (2.6 + romanPower) * enemyExposure * dt, 0, 100);
      roman.morale = clamp(roman.morale - romanLoss * 0.17, 0, 100);
      enemy.morale = clamp(enemy.morale - enemyLoss * 0.2, 0, 100);
      const push = (romanPower - enemyPower) * 4 * dt;
      roman.y -= push;
      enemy.y -= push;
    }
  }

  private resolveParthianHarassment(dt: number) {
    const archers = this.state.filter((unit) => unit.id.startsWith("parthian-archers") && unit.active && unit.status !== "broken" && unit.status !== "routing");
    for (const archer of archers) {
      const target = this.nearestEnemy(archer);
      if (!target) continue;
      const gap = distance(archer, target);
      if (gap < 105 || gap > 285) continue;
      const protectedFormation = target.formationMode !== "column" && (target.order === "hold" || target.order === "reform");
      const exposure = protectedFormation ? 0.35 : target.order === "charge" ? 1.45 : 1;
      target.strength = Math.max(0, target.strength - 0.52 * exposure * dt);
      target.cohesion = clamp(target.cohesion - 0.8 * exposure * dt, 0, 100);
      target.morale = clamp(target.morale - 0.08 * exposure * dt, 0, 100);
      archer.fatigue = clamp(archer.fatigue + 0.18 * dt, 0, 100);
    }
  }

  private combatPower(unit: FormationState) {
    const discipline = unit.side === "roman" ? 1.12 : this.scenarioId === "pharsalus" ? 1.12 : this.scenarioId === "alexandria" ? 1.06 : this.scenarioId === "zela" ? 1.04 : 1;
    const charge = unit.order === "charge" ? 1.12 : 1;
    const formation = unit.formationMode === "line" ? 1.12 : unit.formationMode === "column" ? 0.72 : 1;
    const support = this.state.some((ally) => ally.id !== unit.id && ally.side === unit.side && ally.status === "steady" && distance(unit, ally) < 165) ? 1.06 : 1;
    const uphillExposure = this.scenarioId === "gergovia" && unit.side === "roman" && unit.y < 430 ? 0.72 : 1;
    const siegeWorks = this.scenarioId === "alesia" && unit.side === "roman" && unit.role !== "reserve" && unit.order === "hold" ? 1.42 : 1;
    const pharsalusFourthLine = this.scenarioId === "pharsalus" && unit.id === "caesar-fourth-line" && unit.engagedWith === "pompey-cavalry" ? 1.28 : 1;
    const alexandriaStreetWorks = this.scenarioId === "alexandria" && unit.side === "roman" && unit.id !== "pharos-column" && unit.order === "hold" ? 1.32 : 1;
    const pharosAssault = this.scenarioId === "alexandria" && unit.id === "pharos-column" && unit.engagedWith === "pharos-garrison" ? 1.2 : 1;
    const antiChariotLine = this.scenarioId === "zela" && unit.side === "roman" && unit.engagedWith === "zela-chariots" && unit.formationMode === "line" ? 1.62 : 1;
    const chariotShock = this.scenarioId === "zela" && unit.id === "zela-chariots" && !this.zelaChariotsStopped ? 1.32 : 1;
    const zelaLineDefense = this.scenarioId === "zela" && unit.side === "roman" && unit.formationMode === "line" && (unit.order === "hold" || unit.order === "reform") ? 1.34 : 1;
    const sixthLegion = this.scenarioId === "zela" && unit.id === "legio-vi" ? 1.52 : 1;
    const cataphractShock = this.scenarioId === "parthia" && unit.id === "parthian-cataphracts" ? 1.42 : 1;
    const cavalryScreen = this.scenarioId === "parthia" && unit.id === "roman-cavalry-screen" && unit.engagedWith === "parthian-cataphracts" ? 1.34 : 1;
    return discipline * charge * formation * support * uphillExposure * siegeWorks * pharsalusFourthLine * alexandriaStreetWorks * pharosAssault * antiChariotLine * chariotShock * zelaLineDefense * sixthLegion * cataphractShock * cavalryScreen * (0.45 + unit.cohesion / 100) * (0.55 + unit.morale / 120) * (1 - unit.fatigue / 180);
  }

  private isFlanked(defender: FormationState, attacker: FormationState) {
    const bearing = Math.atan2(attacker.y - defender.y, attacker.x - defender.x);
    const delta = Math.abs(Math.atan2(Math.sin(bearing - defender.facing), Math.cos(bearing - defender.facing)));
    return delta > Math.PI * 0.56;
  }

  private resolveOutcome() {
    const romans = this.state.filter((unit) => unit.side === "roman");
    const helvetians = this.state.filter((unit) => unit.side === "helvetian" && unit.active);
    const brokenRomans = romans.filter((unit) => unit.status === "routing" || unit.status === "broken").length;
    const brokenHelvetians = helvetians.filter((unit) => unit.status === "routing" || unit.status === "broken").length;
    if (this.scenarioId === "parthia") {
      const cataphracts = this.state.find((unit) => unit.id === "parthian-cataphracts");
      const cataphractsBroken = cataphracts?.status === "routing" || cataphracts?.status === "broken";
      const campPenetrated = helvetians.some((unit) => unit.status !== "routing" && unit.status !== "broken" && unit.y > 735);
      if (this.parthiaRouteSecured && cataphractsBroken && this.parthiaScreenCountered && brokenRomans < 2) this.outcome = "roman-victory";
      else if (brokenRomans >= 2 || campPenetrated || this.parthiaRecklessChases.size >= 2) this.outcome = "helvetian-victory";
      if (this.time >= 100 && this.outcome === "undecided") this.outcome = cataphractsBroken && this.parthiaScreenCountered && brokenRomans < 2 && this.parthiaRecklessChases.size === 0 ? "roman-victory" : "helvetian-victory";
    } else if (this.scenarioId === "zela") {
      const chariots = this.state.find((unit) => unit.id === "zela-chariots");
      const chariotBreakthrough = chariots?.active && !this.zelaChariotsStopped && chariots.y > 720;
      if (this.zelaCampStormed && brokenHelvetians >= 4 && brokenRomans < 3) this.outcome = "roman-victory";
      else if (brokenRomans >= 3 || chariotBreakthrough) this.outcome = "helvetian-victory";
      if (this.time >= 105 && this.outcome === "undecided") this.outcome = this.zelaCampStormed && brokenHelvetians > brokenRomans ? "roman-victory" : "helvetian-victory";
    } else if (this.scenarioId === "alexandria") {
      const palace = this.state.find((unit) => unit.id === "palace-guard");
      const dockyard = this.state.find((unit) => unit.id === "dockyard-cohort");
      const palaceLost = palace?.status === "routing" || palace?.status === "broken";
      const dockyardLost = dockyard?.status === "routing" || dockyard?.status === "broken";
      if (this.alexandriaPharosSecured && brokenHelvetians >= 3 && this.time >= 20 && !palaceLost && !dockyardLost && brokenRomans < 3) this.outcome = "roman-victory";
      else if (palaceLost || dockyardLost || brokenRomans >= 3) this.outcome = "helvetian-victory";
      if (this.time >= 105 && this.outcome === "undecided") this.outcome = this.alexandriaPharosSecured && !palaceLost && !dockyardLost && brokenHelvetians > brokenRomans ? "roman-victory" : "helvetian-victory";
    } else if (this.scenarioId === "pharsalus") {
      const cavalry = this.state.find((unit) => unit.id === "pompey-cavalry");
      const cavalryBroken = cavalry?.status === "routing" || cavalry?.status === "broken";
      const cavalryBreakthrough = cavalry?.active && !cavalryBroken && cavalry.y > 710 && !this.pharsalusCavalryCountered;
      if (cavalryBroken && this.pharsalusFlankTurned && brokenHelvetians >= 3 && brokenRomans < 3) this.outcome = "roman-victory";
      else if (brokenRomans >= 3 || cavalryBreakthrough) this.outcome = "helvetian-victory";
      if (this.time >= 110 && this.outcome === "undecided") this.outcome = cavalryBroken && this.pharsalusFlankTurned && brokenHelvetians > brokenRomans ? "roman-victory" : "helvetian-victory";
    } else if (this.scenarioId === "alesia") {
      const weakForce = this.state.find((unit) => unit.id === "relief-weak");
      const weakPointBreached = weakForce?.active && weakForce.status !== "routing" && weakForce.status !== "broken" && weakForce.y < 420;
      if (brokenHelvetians >= 4 && weakForce && (weakForce.status === "routing" || weakForce.status === "broken") && brokenRomans < 3) this.outcome = "roman-victory";
      else if (brokenRomans >= 3 || weakPointBreached) this.outcome = "helvetian-victory";
      if (this.time >= 105 && this.outcome === "undecided") this.outcome = brokenHelvetians > brokenRomans && this.alesiaReserveCountered ? "roman-victory" : "helvetian-victory";
    } else if (this.scenarioId === "gergovia") {
      if (this.lowerCampsTaken && this.withdrewAfterSignal.size >= 3 && brokenRomans < 2 && this.time >= (this.withdrawalSignalAt ?? 0) + 1.5) this.outcome = "roman-victory";
      else if (brokenRomans >= 2 || this.overextended.size >= 3) this.outcome = "helvetian-victory";
      else if (this.time >= 95) this.outcome = this.lowerCampsTaken && this.withdrewAfterSignal.size >= 2 ? "roman-victory" : "helvetian-victory";
    } else if (this.scenarioId === "sabis") {
      if (brokenHelvetians >= 3 && brokenRomans < 3) this.outcome = "roman-victory";
      else if (brokenRomans >= 3) this.outcome = "helvetian-victory";
      if (this.time >= 105 && this.outcome === "undecided") this.outcome = brokenHelvetians > brokenRomans ? "roman-victory" : "helvetian-victory";
    } else {
      const flankForce = this.state.find((unit) => unit.id === "helv-reserve");
      if (this.time >= 12 && brokenHelvetians >= 3 && (flankForce?.status === "routing" || flankForce?.status === "broken")) this.outcome = "roman-victory";
      else if (brokenRomans >= 3) this.outcome = "helvetian-victory";
      if (this.time >= 115 && this.outcome === "undecided") {
        this.outcome = brokenHelvetians > brokenRomans && flankForce?.status !== "steady" ? "roman-victory" : "helvetian-victory";
      }
    }
  }

  private updateScenario() {
    if (this.scenarioId === "parthia") {
      if (this.time >= 0.5) this.addEvent("parthia-contact", "The enemy refuses Caesar's battle", "Horse archers probe the marching camp from beyond pila range. Keep the legions formed and protect the water route.");
      for (const formation of this.state.filter((unit) => unit.side === "roman" && unit.id !== "roman-cavalry-screen" && unit.formationMode !== "column" && (unit.order === "hold" || unit.order === "reform"))) this.parthiaFormedInfantry.add(formation.id);
      if (this.parthiaFormedInfantry.size >= 3) this.addEvent("parthia-line", "The infantry closes its intervals", "The legions present no loose flank to the circling archers. Do not dissolve the formation by chasing them.");
      if (this.time >= 15) {
        const cataphracts = this.state.find((unit) => unit.id === "parthian-cataphracts");
        if (cataphracts) cataphracts.active = true;
        this.parthiaCataphractsCommitted = true;
        this.addEvent("cataphracts", "The royal cataphracts commit", "The armored reserve is aiming for the most exposed Roman sector. Send the auxiliary cavalry screen to meet it while the infantry holds.");
      }
      if (this.parthiaRecklessChases.size > 0) this.addEvent("chase", "The horse archers draw pursuit", "A Roman formation has broken the protected line. Recall it before the cataphracts exploit the opening.");
      const cataphracts = this.state.find((unit) => unit.id === "parthian-cataphracts");
      if (cataphracts && (cataphracts.status === "routing" || cataphracts.status === "broken") && !this.parthiaRouteSecured) {
        this.parthiaRouteSecured = true;
        this.addEvent("route-secured", "The armored attack has failed", "The Parthians retain their mobility, but Caesar's camp, water, and line of march remain secure. Do not turn success into a futile pursuit.");
      }
      return;
    }
    if (this.scenarioId === "zela") {
      if (this.time >= 0.5) this.addEvent("camp-work", "The ridge is still being fortified", "Most cohorts are carrying tools and fascines rather than standing in battle order. Form at least three legions into line before the enemy reaches the works.");
      if (this.time >= 3) {
        const chariots = this.state.find((unit) => unit.id === "zela-chariots");
        if (chariots) chariots.active = true;
        this.addEvent("surprise-attack", "Pharnaces descends into the ravine", "The attack is real. Recall the workers, form line, and hold position so massed missiles can stop the scythed chariots.");
      }
      if (this.zelaFormedLines.size >= 3) this.addEvent("line-formed", "The working parties form a battle line", "Enough cohorts are ready to meet the shock. Hold the ridge and let the enemy exhaust its uphill momentum.");
      if (this.time >= 6) {
        for (const formation of this.state.filter((unit) => unit.id.startsWith("pontic-"))) formation.active = true;
        this.addEvent("pontic-line", "The Pontic infantry follows uphill", "The chariots are only the first shock. Keep the improvised Roman line intact while the veteran Sixth Legion secures the right.");
      }
      const chariots = this.state.find((unit) => unit.id === "zela-chariots");
      if (chariots && (chariots.status === "routing" || chariots.status === "broken")) {
        this.zelaChariotsStopped = true;
        this.addEvent("chariots-stopped", "Missiles break the scythed chariots", "The sudden danger has passed. Charge Legio VI into the Pontic right and turn recovery into a counterattack.");
      }
      const camp = this.state.find((unit) => unit.id === "pharnaces-camp");
      if (camp && (camp.status === "routing" || camp.status === "broken") && !this.zelaCampStormed) {
        this.zelaCampStormed = true;
        this.addEvent("camp-stormed", "Pharnaces' camp is taken", "The Pontic army has lost its fortified refuge. Complete the rout without dissolving the Roman line.");
      }
      return;
    }
    if (this.scenarioId === "alexandria") {
      if (this.time >= 0.5) this.addEvent("street-assault", "Achillas attacks through the city", "Caesar's small force is fighting in separated streets. Hold the palace, central avenue, and dockyard as independent strongpoints.");
      if (this.time >= 6) this.addEvent("harbor-decision", "The harbor decides survival", "The Alexandrian fleet cannot be allowed to close the sea route. Send only the Pharos column along the causeway and seize the lighthouse garrison.");
      const pharos = this.state.find((unit) => unit.id === "pharos-garrison");
      if (pharos && (pharos.status === "routing" || pharos.status === "broken") && !this.alexandriaPharosSecured) {
        this.alexandriaPharosSecured = true;
        this.addEvent("pharos-secured", "Pharos is in Roman hands", "The harbor entrance is open. Hold the palace and dockyard while the remaining Alexandrian forces try to reverse the seizure.");
      }
      if (this.time >= 14) {
        const reserve = this.state.find((unit) => unit.id === "royal-reserve");
        if (reserve) reserve.active = true;
        this.addEvent("royal-counterattack", "A royal reinforcement moves on the causeway", "Fresh troops are trying to retake Pharos. The assault column must hold while the street cohorts remain at their posts.");
      }
      if (this.time >= 20 && this.alexandriaPharosSecured) this.addEvent("sea-route", "The sea route remains open", "Corn and reinforcements can enter the harbor. Caesar's isolated quarter can now survive a longer Alexandrian war.");
      return;
    }
    if (this.scenarioId === "pharsalus") {
      if (this.time >= 0.5) this.addEvent("civil-lines", "Roman faces Roman", "Pompey's infantry holds its ground while Caesar's veterans advance. Preserve the fourth line on the right rather than feeding it into the first collision.");
      if (this.time >= 2) {
        for (const formation of this.state.filter((unit) => unit.id.startsWith("pompey-") && unit.role !== "flank-force" && unit.id !== "pompey-missiles")) formation.order = "advance";
        this.addEvent("infantry-clash", "The legionary lines close", "The first ranks are exhausting each other. Hold Caesar's front together and wait for the cavalry maneuver Pompey expects to decide the battle.");
      }
      if (this.time >= 10) {
        for (const formation of this.state.filter((unit) => unit.id === "pompey-cavalry" || unit.id === "pompey-missiles")) formation.active = true;
        this.addEvent("cavalry-attack", "Pompey's cavalry sweeps around the right", "The massed horse and missile troops are passing Caesar's outnumbered cavalry. Commit the fourth line now and strike the cavalry before it reaches the infantry flank.");
      }
      const cavalry = this.state.find((unit) => unit.id === "pompey-cavalry");
      if (cavalry && (cavalry.status === "routing" || cavalry.status === "broken")) this.addEvent("cavalry-rout", "The cavalry screen collapses", "Turn the same cohorts into Pompey's exposed left. The infantry front can only be broken after this flank maneuver succeeds.");
      if (this.pharsalusFlankTurned) this.addEvent("flank-turned", "The fourth line reaches Pompey's rear", "Pompey's left is fighting in two directions. Bring the fresh pressure through the line before Caesar's front is exhausted.");
      return;
    }
    if (this.scenarioId === "alesia") {
      if (this.time >= 0.5) this.addEvent("inner-sortie", "Alesia's gates open", "The besieged army attacks the inward-facing works. Hold both inner sectors without spending the mobile reserve.");
      if (this.time >= 8) {
        for (const relief of this.state.filter((unit) => unit.id === "relief-west" || unit.id === "relief-east")) relief.active = true;
        this.addEvent("relief-arrives", "The relief army strikes the outer works", "Battle now runs in two directions. The outer sectors must hold while the sortie continues behind them.");
      }
      if (this.time >= 16) {
        const weakForce = this.state.find((unit) => unit.id === "relief-weak");
        if (weakForce) weakForce.active = true;
        this.addEvent("weak-point", "The vulnerable sector is under massed attack", "Vercassivellaunus has found ground the Roman works could not fully enclose. Commit the mobile reserve to the far right.");
      }
      const brokenAttackers = this.state.filter((unit) => unit.side === "helvetian" && (unit.status === "routing" || unit.status === "broken")).length;
      if (brokenAttackers >= 3) this.addEvent("counterstroke", "The two attacks lose coordination", "One more concentrated counterstroke against the vulnerable sector can decide the siege.");
      return;
    }
    if (this.scenarioId === "gergovia") {
      if (this.time >= 0.5) this.addEvent("feint", "The feint draws defenders away", "The Gallic upper defenses shift toward Caesar's demonstration. Advance only far enough to seize the exposed camps below the oppidum.");
      const lowerBroken = this.state.filter((unit) => unit.id.startsWith("arv-lower") && (unit.status === "routing" || unit.status === "broken")).length;
      if (lowerBroken >= 2 && !this.lowerCampsTaken) {
        this.lowerCampsTaken = true;
        this.withdrawalSignalAt = this.time;
        for (const reserve of this.state.filter((unit) => unit.id.startsWith("arv-upper"))) reserve.active = true;
        this.addEvent("recall", "The recall sounds", "The limited objective is complete. Halt the advance and withdraw at least three cohorts before the upper reserves close downhill.");
      }
      if (this.lowerCampsTaken && this.time >= (this.withdrawalSignalAt ?? 0) + 4) {
        this.addEvent("counterattack", "The Arvernian counterattack descends", "Fresh troops are pouring from the plateau. Cohorts still climbing are isolated by slope, walls, and confused signals.");
      }
      if (this.overextended.size > 0) this.addEvent("overextension", "Cohorts pass the intended limit", "The assault is becoming a battle Caesar did not intend. Sound the withdrawal before neighboring units follow uphill.");
      return;
    }
    if (this.scenarioId === "sabis") {
      if (this.time >= 0.5) this.addEvent("alarm", "The concealed attack breaks cover", "The Nervii and their allies cross the river before the Roman camp and line are ready. Rally the cohorts already on the slope.");
      if (this.time >= 5) this.addEvent("main-clash", "The Roman right buckles", "The Nervii mass against the Twelfth and Seventh. Caesar's account places the crisis here, where standards crowded and formations lost room.");
      if (this.time >= 14) {
        const rear = this.state.find((unit) => unit.id === "legio-xiii");
        if (rear && !rear.active) rear.active = true;
        this.addEvent("rear-arrival", "The rear column reaches the field", "A fresh cohort appears beyond the camp works. Commit it where the line is closest to collapse.");
      }
      const brokenBelgae = this.state.filter((unit) => unit.side === "helvetian" && (unit.status === "routing" || unit.status === "broken")).length;
      if (brokenBelgae >= 2) this.addEvent("decision", "The Belgic attack loses shape", "Two attacking groups are giving way. A controlled counterstroke can decide the field.");
      return;
    }
    if (this.time >= 2.5) this.addEvent("main-clash", "The main lines close", "The Helvetian attack climbs toward the Roman position. Preserve cohesion before committing to a charge.");
    if (this.time >= 12) {
      const flankForce = this.state.find((unit) => unit.id === "helv-reserve");
      if (flankForce && !flankForce.active) flankForce.active = true;
      this.addEvent("flank-crisis", "A second force appears", "Boii and Tulingi warriors threaten the Roman right. Turn the reserve before the line is taken from the flank.");
    }
    const brokenHelvetians = this.state.filter((unit) => unit.side === "helvetian" && (unit.status === "routing" || unit.status === "broken")).length;
    if (brokenHelvetians >= 2) this.addEvent("decision", "The enemy line wavers", "Two formations are leaving the field. Keep the reserve threat contained and press the decision without dissolving the line.");
  }

  private phase(): BattlePhase {
    const brokenHelvetians = this.state.filter((unit) => unit.side === "helvetian" && (unit.status === "routing" || unit.status === "broken")).length;
    if (this.scenarioId === "parthia") {
      if (this.parthiaRouteSecured) return "decision";
      if (this.parthiaCataphractsCommitted) return "flank-crisis";
      if (this.time >= 3) return "main-clash";
      return "opening";
    }
    if (this.scenarioId === "zela") {
      if (this.zelaCampStormed) return "decision";
      if (this.zelaChariotsStopped) return "flank-crisis";
      if (this.time >= 3) return "main-clash";
      return "opening";
    }
    if (this.scenarioId === "alexandria") {
      if (this.alexandriaPharosSecured) return "decision";
      if (this.time >= 6) return "flank-crisis";
      if (this.time >= 2) return "main-clash";
      return "opening";
    }
    if (this.scenarioId === "pharsalus") {
      const cavalry = this.state.find((unit) => unit.id === "pompey-cavalry");
      if (this.pharsalusFlankTurned || cavalry?.status === "routing" || cavalry?.status === "broken") return "decision";
      if (this.time >= 10) return "flank-crisis";
      if (this.time >= 2) return "main-clash";
      return "opening";
    }
    if (this.scenarioId === "alesia") {
      if (brokenHelvetians >= 3) return "decision";
      if (this.time >= 16) return "flank-crisis";
      if (this.time >= 8) return "main-clash";
      return "opening";
    }
    if (this.scenarioId === "gergovia") {
      if (this.overextended.size > 0) return "decision";
      if (this.lowerCampsTaken) return "flank-crisis";
      if (this.time >= 2.5 || brokenHelvetians > 0) return "main-clash";
      return "opening";
    }
    if (brokenHelvetians >= 2) return "decision";
    if (this.scenarioId === "sabis") {
      if (this.time >= 14) return "flank-crisis";
      if (this.time >= 4) return "main-clash";
      return "opening";
    }
    if (this.time >= 12) return "flank-crisis";
    if (this.time >= 2.5) return "main-clash";
    return "opening";
  }

  private objective() {
    if (this.scenarioId === "parthia") {
      switch (this.phase()) {
        case "opening": return "Hold three infantry groups in formed order around the camp and water route.";
        case "main-clash": return "Absorb the horse-archer harassment. Do not chase their withdrawal.";
        case "flank-crisis": return "Commit the auxiliary cavalry screen against the royal cataphracts.";
        case "decision": return "Secure the line of march and refuse a wasteful pursuit.";
      }
    }
    if (this.scenarioId === "zela") {
      switch (this.phase()) {
        case "opening": return "Turn at least three working columns into a battle line.";
        case "main-clash": return "Hold formed lines and stop the scythed chariots with missiles.";
        case "flank-crisis": return "Charge Legio VI through the Pontic right and toward the royal camp.";
        case "decision": return "Complete the rout while preserving the improvised Roman line.";
      }
    }
    if (this.scenarioId === "alexandria") {
      switch (this.phase()) {
        case "opening": return "Hold the palace, central street, and dockyard. Caesar cannot replace these cohorts.";
        case "main-clash": return "Defend each urban strongpoint locally. Keep the Pharos column free.";
        case "flank-crisis": return "Send the Pharos column along the causeway and break the lighthouse garrison.";
        case "decision": return "Hold Pharos and the dockyard until the sea route is secure.";
      }
    }
    if (this.scenarioId === "pharsalus") {
      switch (this.phase()) {
        case "opening": return "Hold the infantry front. Keep the fourth line concealed on Caesar's right.";
        case "main-clash": return "Let the legionary lines absorb one another. Do not spend the fourth line.";
        case "flank-crisis": return "Charge the fourth line into Pompey's massed cavalry.";
        case "decision": return "Turn the fourth line into Pompey's exposed left, then break the infantry line.";
      }
    }
    if (this.scenarioId === "alesia") {
      switch (this.phase()) {
        case "opening": return "Hold the inner siege line. Keep the mobile reserve uncommitted.";
        case "main-clash": return "Defend inward and outward works at the same time.";
        case "flank-crisis": return "Send the mobile reserve against Vercassivellaunus on the weak right.";
        case "decision": return "Break the vulnerable-sector assault and preserve both siege lines.";
      }
    }
    if (this.scenarioId === "gergovia") {
      switch (this.phase()) {
        case "opening": return "Hold the line until the feint draws defenders from the lower camps.";
        case "main-clash": return "Seize two lower camps. Do not climb toward the oppidum.";
        case "flank-crisis": return "The recall has sounded: withdraw at least three cohorts.";
        case "decision": return "Stop the unauthorized advance before the upper reserves descend.";
      }
    }
    if (this.scenarioId === "sabis") {
      switch (this.phase()) {
        case "opening": return "Reform two cohorts before the concealed attack reaches the slope.";
        case "main-clash": return "Rally the Twelfth and Seventh; do not let the right collapse.";
        case "flank-crisis": return "Commit the fresh rear column where the line is weakest.";
        case "decision": return "Counterattack and rout three Belgic formations.";
      }
    }
    switch (this.phase()) {
      case "opening": return "Dress the line. Keep X Cohort in reserve.";
      case "main-clash": return "Absorb the uphill attack without exhausting the line.";
      case "flank-crisis": return "Turn X Cohort against the threat on the Roman right.";
      case "decision": return "Break the wavering formations and preserve two cohorts.";
    }
  }

  private phaseTitle() {
    if (this.scenarioId === "parthia") {
      switch (this.phase()) {
        case "opening": return "Beyond Carrhae: the campaign that never was";
        case "main-clash": return "An enemy who will not stand";
        case "flank-crisis": return "The armored reserve appears";
        case "decision": return "A route secured, not an empire conquered";
      }
    }
    if (this.scenarioId === "zela") {
      switch (this.phase()) {
        case "opening": return "An unfinished camp at dawn";
        case "main-clash": return "The attack nobody expected";
        case "flank-crisis": return "The Sixth Legion turns the battle";
        case "decision": return "Across the ravine to Pharnaces' camp";
      }
    }
    if (this.scenarioId === "alexandria") {
      switch (this.phase()) {
        case "opening": return "A small army in a hostile capital";
        case "main-clash": return "War in the palace streets";
        case "flank-crisis": return "Seize the harbor key";
        case "decision": return "Keep the sea road open";
      }
    }
    if (this.scenarioId === "pharsalus") {
      switch (this.phase()) {
        case "opening": return "The concealed fourth line";
        case "main-clash": return "Veterans against veterans";
        case "flank-crisis": return "The cavalry gamble";
        case "decision": return "Turn into the exposed flank";
      }
    }
    if (this.scenarioId === "alesia") {
      switch (this.phase()) {
        case "opening": return "The inner line erupts";
        case "main-clash": return "Surrounded by the relief army";
        case "flank-crisis": return "The weak point";
        case "decision": return "Caesar commits the last reserve";
      }
    }
    if (this.scenarioId === "gergovia") {
      switch (this.phase()) {
        case "opening": return "A limited opportunity";
        case "main-clash": return "Take the lower camps";
        case "flank-crisis": return "Sound the withdrawal";
        case "decision": return "The slope consumes command";
      }
    }
    if (this.scenarioId === "sabis") {
      switch (this.phase()) {
        case "opening": return "Alarm on the Sabis";
        case "main-clash": return "The right buckles";
        case "flank-crisis": return "The rear column arrives";
        case "decision": return "Counterstroke";
      }
    }
    switch (this.phase()) {
      case "opening": return "Opening deployment";
      case "main-clash": return "Main clash";
      case "flank-crisis": return "Flank crisis";
      case "decision": return "Decision";
    }
  }

  private addEvent(id: string, title: string, detail: string) {
    if (this.events.some((event) => event.id === id)) return;
    this.events.push({ id, title, detail });
  }

  private noteReserveCommitment(unit: FormationState, order: FormationOrder) {
    if (this.scenarioId !== "bibracte" || unit.id !== "legio-x" || order === "hold" || order === "reform" || this.reserveCommittedAt !== undefined) return;
    this.reserveCommittedAt = this.time;
  }

  private grade(score: number) {
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 68) return "C";
    if (score >= 55) return "D";
    return "F";
  }

  private assessBattle(): BattleAssessment {
    const romans = this.state.filter((unit) => unit.side === "roman");
    const avgCohesion = romans.reduce((sum, unit) => sum + unit.cohesion, 0) / romans.length;
    const intact = romans.filter((unit) => unit.status !== "broken").length;
    const romanLosses = romans.reduce((sum, unit) => sum + unit.initialStrength - unit.strength, 0);
    const lineScore = clamp(avgCohesion * 0.65 + intact * 10, 0, 100);
    const casualtyScore = clamp(100 - romanLosses / 8, 0, 100);
    const victory = this.outcome === "roman-victory";
    if (this.scenarioId === "parthia") {
      const formationScore = clamp(this.parthiaFormedInfantry.size * 32, 0, 100);
      const restraintScore = this.parthiaRecklessChases.size === 0 ? 98 : this.parthiaRecklessChases.size === 1 ? 58 : 20;
      const screenScore = this.parthiaScreenCountered ? 96 : 30;
      const routeScore = this.parthiaRouteSecured ? 96 : 35;
      const overallScore = formationScore * 0.25 + restraintScore * 0.25 + screenScore * 0.2 + routeScore * 0.2 + casualtyScore * 0.1;
      return {
        grades: [
          { label: "Formation discipline", grade: this.grade(formationScore) },
          { label: "Pursuit restraint", grade: this.grade(restraintScore) },
          { label: "Cavalry screen", grade: this.grade(screenScore) },
          { label: "Route security", grade: this.grade(routeScore) },
          { label: "Casualty control", grade: this.grade(casualtyScore) },
        ],
        overall: this.grade(victory ? overallScore : Math.min(overallScore, 64)),
        summary: victory
          ? "The legions endured the arrow storm, refused the false retreat, and used the auxiliary screen to blunt the cataphract attack without surrendering the route."
          : "The Roman line was opened by pursuit or armored shock before the army had secured its camp, water, and line of march.",
        lesson: this.parthiaRecklessChases.size > 0
          ? "Parthian mobility turns pursuit into exposure. Holding useful ground matters more than catching horse archers who choose when to disengage."
          : !this.parthiaScreenCountered
            ? "Formed infantry can endure harassment, but the cataphract commitment still demands a mobile counter. Preserve the auxiliary cavalry until that moment."
            : "The objective was operational rather than theatrical: preserve the army and route while compelling the enemy's heavy reserve to withdraw.",
      };
    }
    if (this.scenarioId === "zela") {
      const formationScore = clamp(this.zelaFormedLines.size * 24, 0, 100);
      const chariotScore = this.zelaChariotsStopped ? 96 : 25;
      const timingScore = this.zelaLegioVICommittedAt === undefined
        ? 25
        : this.zelaLegioVICommittedAt >= 8 && this.zelaLegioVICommittedAt <= 24
          ? 98
          : this.zelaLegioVICommittedAt < 8
            ? 58
            : 72;
      const campScore = this.zelaCampStormed ? 96 : 30;
      const overallScore = formationScore * 0.25 + chariotScore * 0.25 + timingScore * 0.2 + campScore * 0.2 + casualtyScore * 0.1;
      return {
        grades: [
          { label: "Reaction drill", grade: this.grade(formationScore) },
          { label: "Chariot defense", grade: this.grade(chariotScore) },
          { label: "Sixth Legion timing", grade: this.grade(timingScore) },
          { label: "Camp assault", grade: this.grade(campScore) },
          { label: "Casualty control", grade: this.grade(casualtyScore) },
        ],
        overall: this.grade(victory ? overallScore : Math.min(overallScore, 64)),
        summary: victory
          ? "The working parties formed under pressure, stopped the chariots, and converted the Sixth Legion's local success into the destruction of Pharnaces' camp."
          : "The surprise attack reached the unfinished works before the scattered Roman force could establish a coherent line and counterattack.",
        lesson: this.zelaFormedLines.size < 3
          ? "The first task is not attack but organization. Select the scattered cohorts and form them into line before Pharnaces crosses the ravine."
          : !this.zelaChariotsStopped
            ? "Scythed chariots are dangerous against disorder, not a formed missile line. Hold position and let pila break the shock before advancing."
            : !this.zelaCampStormed
              ? "Stopping the surprise preserves the army; storming the royal camp ends the campaign. Commit the Sixth Legion after the chariots fail and keep it moving uphill."
              : "The sequence was decisive: form, absorb, counterattack, and exploit. Speed came from disciplined transitions rather than an immediate general charge.",
      };
    }
    if (this.scenarioId === "alexandria") {
      const fixedIds = ["palace-guard", "street-cohort", "dockyard-cohort"];
      const fixed = romans.filter((unit) => fixedIds.includes(unit.id));
      const strongpointScore = clamp(fixed.reduce((sum, unit) => sum + unit.cohesion + (unit.status === "broken" ? 0 : 24), 0) / fixed.length, 0, 100);
      const harborScore = this.alexandriaPharosSecured && this.state.find((unit) => unit.id === "dockyard-cohort")?.status !== "broken" ? 96 : 34;
      const timingScore = this.alexandriaPharosCommittedAt === undefined
        ? 25
        : this.alexandriaPharosCommittedAt >= 5 && this.alexandriaPharosCommittedAt <= 12
          ? 97
          : this.alexandriaPharosCommittedAt < 5
            ? 68
            : 70;
      const overallScore = strongpointScore * 0.3 + harborScore * 0.3 + timingScore * 0.2 + casualtyScore * 0.2;
      return {
        grades: [
          { label: "Urban defense", grade: this.grade(strongpointScore) },
          { label: "Harbor control", grade: this.grade(harborScore) },
          { label: "Pharos timing", grade: this.grade(timingScore) },
          { label: "Force preservation", grade: this.grade(casualtyScore) },
        ],
        overall: this.grade(victory ? overallScore : Math.min(overallScore, 64)),
        summary: victory
          ? "The palace quarter endured while the harbor column secured Pharos and kept Alexandria open to Roman supplies and reinforcements."
          : "The isolated Roman quarter lost either its political center or its sea connection before the small force could stabilize Alexandria.",
        lesson: !this.alexandriaPharosSecured
          ? "Caesar could not defend every ship and street. Hold the three urban strongpoints, then send the dedicated column to seize Pharos and preserve access by sea."
          : strongpointScore < 68
            ? "Pharos was taken, but stripping or exhausting the palace streets made harbor control strategically hollow. The city positions and sea route must support one another."
            : this.alexandriaPharosCommittedAt !== undefined && this.alexandriaPharosCommittedAt < 5
              ? "The early dash succeeded, but it exposed the harbor column before the urban defense had fixed Achillas' main attack."
              : "The fixed cohorts held locally while the one mobile column took the harbor key: economy of force solved a battle fought across disconnected streets.",
      };
    }
    if (this.scenarioId === "pharsalus") {
      const front = romans.filter((unit) => unit.id !== "caesar-fourth-line");
      const frontScore = clamp(front.reduce((sum, unit) => sum + unit.cohesion + (unit.status === "broken" ? 0 : 22), 0) / front.length, 0, 100);
      const cavalryScore = this.pharsalusCavalryCountered ? 96 : 30;
      const reserveTimingScore = this.pharsalusReserveCommittedAt === undefined
        ? 25
        : this.pharsalusReserveCommittedAt >= 9 && this.pharsalusReserveCommittedAt <= 18
          ? 98
          : this.pharsalusReserveCommittedAt < 9
            ? 58
            : 72;
      const flankScore = this.pharsalusFlankTurned ? 96 : 34;
      const overallScore = frontScore * 0.2 + cavalryScore * 0.25 + reserveTimingScore * 0.2 + flankScore * 0.25 + casualtyScore * 0.1;
      return {
        grades: [
          { label: "Infantry line", grade: this.grade(frontScore) },
          { label: "Cavalry counter", grade: this.grade(cavalryScore) },
          { label: "Reserve timing", grade: this.grade(reserveTimingScore) },
          { label: "Flank turn", grade: this.grade(flankScore) },
          { label: "Casualty control", grade: this.grade(casualtyScore) },
        ],
        overall: this.grade(victory ? overallScore : Math.min(overallScore, 64)),
        summary: victory
          ? "The fourth line broke Pompey's cavalry and converted that local success into pressure against the exposed infantry flank."
          : "Caesar's line was exhausted before the fourth line could overturn Pompey's cavalry advantage and reach the infantry flank.",
        lesson: !this.pharsalusCavalryCountered
          ? "The fourth line exists for the cavalry crisis. Hold it out of the infantry fight, then commit it when Pompey's horse begins the enveloping move."
          : !this.pharsalusFlankTurned
            ? "Repelling the cavalry solves only half the command problem. Keep the fourth line moving into Pompey's exposed left while the infantry is fixed in front."
            : this.pharsalusReserveCommittedAt !== undefined && this.pharsalusReserveCommittedAt < 9
              ? "The reserve recovered from an early commitment, but its decisive power came from meeting the cavalry as a formed body and then turning the flank."
              : "The reserve was preserved, committed against the decisive threat, and redirected into the exposed flank: the sequence Caesar presents as the battle's turning point.",
      };
    }
    if (this.scenarioId === "alesia") {
      const sectorScore = (ids: string[]) => {
        const sectors = romans.filter((unit) => ids.includes(unit.id));
        return clamp(sectors.reduce((sum, unit) => sum + unit.cohesion + (unit.status === "broken" ? 0 : 25), 0) / sectors.length, 0, 100);
      };
      const innerScore = sectorScore(["legio-inner-west", "legio-inner-east"]);
      const outerScore = sectorScore(["legio-outer-west", "legio-outer-east"]);
      const reserveScore = this.alesiaReserveCountered ? 96 : 35;
      const overallScore = innerScore * 0.2 + outerScore * 0.25 + reserveScore * 0.35 + casualtyScore * 0.2;
      return {
        grades: [
          { label: "Inner line", grade: this.grade(innerScore) },
          { label: "Outer line", grade: this.grade(outerScore) },
          { label: "Reserve decision", grade: this.grade(reserveScore) },
          { label: "Casualty control", grade: this.grade(casualtyScore) },
        ],
        overall: this.grade(victory ? overallScore : Math.min(overallScore, 64)),
        summary: victory ? "The inward sortie and external relief attack were contained before the vulnerable sector could open the siege ring." : "Pressure on two fronts consumed the fixed sectors before the mobile reserve solved the decisive breach.",
        lesson: !this.alesiaReserveCountered
          ? "At Alesia the reserve cannot repair every sector. Hold locally, preserve the central force, and commit it only when Vercassivellaunus attacks the incomplete works."
          : victory
            ? "Both siege lines endured long enough for the reserve to restore the vulnerable sector, reproducing the central command logic of the final battle."
            : "The reserve reached the decisive sector, but the inner or outer line had already lost too much cohesion to sustain the investment.",
      };
    }
    if (this.scenarioId === "gergovia") {
      const objectiveScore = this.lowerCampsTaken ? 95 : 35;
      const recallScore = clamp(this.withdrewAfterSignal.size * 24 + (this.lowerCampsTaken ? 4 : 0), 0, 100);
      const restraintScore = clamp(100 - this.overextended.size * 34, 0, 100);
      const overallScore = casualtyScore * 0.2 + objectiveScore * 0.25 + recallScore * 0.3 + restraintScore * 0.25;
      return {
        grades: [
          { label: "Limited objective", grade: this.grade(objectiveScore) },
          { label: "Recall discipline", grade: this.grade(recallScore) },
          { label: "Command restraint", grade: this.grade(restraintScore) },
          { label: "Casualty control", grade: this.grade(casualtyScore) },
        ],
        overall: this.grade(victory ? overallScore : Math.min(overallScore, 64)),
        summary: victory
          ? "The lower camps were taken and the cohorts returned before a limited success became a general assault."
          : this.overextended.size > 0
            ? "The advance passed its intended limit and exposed the cohorts beneath Gergovia's upper defenses."
            : "The lower objective was reached, but the recall did not disengage the cohorts before the counterattack struck.",
        lesson: !this.lowerCampsTaken
          ? "The feint created an opportunity, not permission for an immediate general attack. Wait for the opening, then concentrate against the lower camps."
          : this.withdrewAfterSignal.size < 3
            ? "A recall that does not move formations is only noise. Select each engaged cohort and issue the withdrawal before the upper reserves descend."
            : this.overextended.size > 0
              ? "The objective was achieved, but formations climbing past the lower camps risked repeating the command failure Caesar described."
              : "You treated the operation as a limited seizure of ground and preserved the army when the signal ordered disengagement.",
      };
    }
    if (this.scenarioId === "sabis") {
      const crisisRallies = ["legio-xii", "legio-vii"].filter((id) => this.rallied.has(id)).length;
      const rallyScore = clamp(this.rallied.size * 17 + crisisRallies * 16, 0, 100);
      const reinforcementScore = this.rearCommitted ? 95 : 40;
      const overallScore = lineScore * 0.25 + casualtyScore * 0.2 + rallyScore * 0.3 + reinforcementScore * 0.25;
      return {
        grades: [
          { label: "Line survival", grade: this.grade(lineScore) },
          { label: "Casualty control", grade: this.grade(casualtyScore) },
          { label: "Cohort rally", grade: this.grade(rallyScore) },
          { label: "Rear column", grade: this.grade(reinforcementScore) },
        ],
        overall: this.grade(victory ? overallScore : Math.min(overallScore, 64)),
        summary: victory ? "The incomplete Roman deployment recovered before the Nervian assault could divide the army." : "The surprise attack reached the camp before the scattered cohorts formed a common front.",
        lesson: crisisRallies < 2
          ? "At the Sabis, speed of command mattered more than elegant deployment. Reform the Twelfth and Seventh immediately, then use the fresh rear column to restore local superiority."
          : this.rearCommitted
            ? "The endangered right was rallied and the fresh rear column entered the decision, reproducing the essential logic of Caesar's recovery."
            : "The first line recovered, but an uncommitted reinforcement cannot change the local balance where the crisis is greatest.",
      };
    }
    const reserveScore = this.reserveCountered ? (this.reserveCommittedAt !== undefined && this.reserveCommittedAt < 12 ? 76 : 96) : 38;
    const overallScore = lineScore * 0.35 + casualtyScore * 0.25 + reserveScore * 0.4;
    return {
      grades: [
        { label: "Line integrity", grade: this.grade(lineScore) },
        { label: "Casualty control", grade: this.grade(casualtyScore) },
        { label: "Reserve handling", grade: this.grade(reserveScore) },
      ],
      overall: this.grade(victory ? overallScore : Math.min(overallScore, 64)),
      summary: victory ? "The Roman line survived the main collision and answered the second threat." : "Local fighting consumed the Roman line before the command problem was solved.",
      lesson: !this.reserveCountered
        ? "A reserve has value because it remains available when a new danger appears. Keep X Cohort back until the right flank is threatened."
        : this.reserveCommittedAt !== undefined && this.reserveCommittedAt < 12
          ? "X Cohort recovered from an early commitment, but the reserve was nearly absent when the second force arrived."
          : "The reserve met the late flank attack as intended. The remaining question was how economically the main line fought.",
    };
  }
}
