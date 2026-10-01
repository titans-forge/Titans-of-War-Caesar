import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import Phaser from "phaser";
import terrainUrl from "../assets/bibracte-terrain.webp";
import sabisTerrainUrl from "../assets/sabis-terrain.webp";
import gergoviaTerrainUrl from "../assets/gergovia-terrain.webp";
import alesiaTerrainUrl from "../assets/alesia-terrain.webp";
import pharsalusTerrainUrl from "../assets/pharsalus-terrain.webp";
import alexandriaTerrainUrl from "../assets/alexandria-terrain.webp";
import zelaTerrainUrl from "../assets/zela-terrain.webp";
import parthiaTerrainUrl from "../assets/parthia-terrain.webp";
import scythedChariotUrl from "../assets/pontic-scythed-chariot.webp";
import parthianHorseArchersUrl from "../assets/parthian-horse-archers.webp";
import parthianCataphractsUrl from "../assets/parthian-cataphracts.webp";
import romanAuxiliaryCavalryUrl from "../assets/roman-auxiliary-cavalry.webp";
import romanUrl from "../assets/roman-legionary.webp";
import helvetianUrl from "../assets/helvetian-warrior.webp";
import romanAttackUrl from "../assets/roman-legionary-attack.webp";
import helvetianAttackUrl from "../assets/helvetian-warrior-attack.webp";
import {
  casualtyOrder,
  deterministicUnitValue,
  directionFrame,
  formationFootprint,
  generateFormationSlots,
  projectFormationSlot,
  projectScale,
  survivorIndices,
  terrainProjectionFor,
  visibleFigureCount,
  visualProfileFor,
  type FormationSlot,
  type UnitArchetype,
} from "../game/formationVisuals";
import { BattleEngine } from "../game/simulation";
import type { BattleSnapshot, FormationMode, FormationOrder, FormationState, Point, ScenarioId } from "../game/types";

export interface BattlefieldHandle {
  order: (order: FormationOrder) => void;
  formation: (mode: FormationMode) => void;
  reset: () => void;
  zoom: (delta: number) => void;
}

interface BattlefieldProps {
  speed: number;
  selectedId: string;
  onSelect: (id: string) => void;
  onSnapshot: (snapshot: BattleSnapshot) => void;
  scenarioId: ScenarioId;
}

interface LegacyFormationView {
  kind: "legacy";
  container: Phaser.GameObjects.Container;
  soldiers: Phaser.GameObjects.Image[];
  selection: Phaser.GameObjects.Rectangle;
  status: Phaser.GameObjects.Text;
  hitArea: Phaser.GameObjects.Zone;
}

interface FormationV2View {
  kind: "v2";
  soldiers: Phaser.GameObjects.Image[];
  shadow: Phaser.GameObjects.Graphics;
  selection: Phaser.GameObjects.Graphics;
  standard: Phaser.GameObjects.Container;
  standardFlag: Phaser.GameObjects.Rectangle;
  standardText: Phaser.GameObjects.Text;
  strengthBack: Phaser.GameObjects.Rectangle;
  strengthFill: Phaser.GameObjects.Rectangle;
  status: Phaser.GameObjects.Text;
  hitArea: Phaser.GameObjects.Zone;
  baseSlots: FormationSlot[];
  displayedCount: number;
  casualtyOrder: number[];
  casualtyAt: Map<number, number>;
  hovered: boolean;
}

type FormationView = LegacyFormationView | FormationV2View;

const WORLD = { width: 1600, height: 900 };
const V2_BASE_SCALE: Record<UnitArchetype, number> = {
  "roman-infantry": 0.17,
  "gallic-infantry": 0.17,
  "hellenistic-infantry": 0.17,
  "missile-infantry": 0.17,
  "auxiliary-cavalry": 0.2,
  "horse-archer": 0.2,
  cataphract: 0.2,
  "scythed-chariot": 0.22,
};
const V2_FRAME_COUNTS = { idle: 2, walk: 4, attack: 4, route: 4, fall: 5 } as const;
const UNIT_ARCHETYPES: UnitArchetype[] = [
  "roman-infantry",
  "gallic-infantry",
  "hellenistic-infantry",
  "missile-infantry",
  "auxiliary-cavalry",
  "horse-archer",
  "cataphract",
  "scythed-chariot",
];
const atlasKey = (archetype: UnitArchetype) => `${archetype}-v2`;
const terrainKey = (scenarioId: ScenarioId) => scenarioId === "sabis" ? "sabis-terrain" : scenarioId === "gergovia" ? "gergovia-terrain" : scenarioId === "alesia" ? "alesia-terrain" : scenarioId === "pharsalus" ? "pharsalus-terrain" : scenarioId === "alexandria" ? "alexandria-terrain" : scenarioId === "zela" ? "zela-terrain" : scenarioId === "parthia" ? "parthia-terrain" : "terrain";
const battlefieldName = (scenarioId: ScenarioId) => scenarioId === "sabis" ? "Battlefield of the Sabis" : scenarioId === "gergovia" ? "Battlefield of Gergovia" : scenarioId === "alesia" ? "Siege lines at Alesia" : scenarioId === "pharsalus" ? "Battlefield of Pharsalus" : scenarioId === "alexandria" ? "Palace quarter and Great Harbour at Alexandria" : scenarioId === "zela" ? "Ridge and ravine at Zela" : scenarioId === "parthia" ? "Hypothetical Armenian frontier battlefield" : "Battlefield of Bibracte";
const cameraCenterY = (scenarioId: ScenarioId) => scenarioId === "gergovia" ? 350 : scenarioId === "alesia" || scenarioId === "alexandria" ? 410 : WORLD.height / 2;
const terrainUrls: Record<ScenarioId, string> = {
  bibracte: terrainUrl,
  sabis: sabisTerrainUrl,
  gergovia: gergoviaTerrainUrl,
  alesia: alesiaTerrainUrl,
  pharsalus: pharsalusTerrainUrl,
  alexandria: alexandriaTerrainUrl,
  zela: zelaTerrainUrl,
  parthia: parthiaTerrainUrl,
};

const scenarioAssets = (scenarioId: ScenarioId): Array<[string, string]> => {
  const assets: Array<[string, string]> = [[terrainKey(scenarioId), terrainUrls[scenarioId]]];
  if (scenarioId === "zela") assets.push(["scythed-chariot", scythedChariotUrl]);
  if (scenarioId === "parthia") {
    assets.push(
      ["parthian-horse-archers", parthianHorseArchersUrl],
      ["parthian-cataphracts", parthianCataphractsUrl],
      ["roman-auxiliary-cavalry", romanAuxiliaryCavalryUrl],
    );
  }
  return assets;
};

export const Battlefield = forwardRef<BattlefieldHandle, BattlefieldProps>(function Battlefield(
  { speed, selectedId, onSelect, onSnapshot, scenarioId },
  ref,
) {
  const hostRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<BattleScene | null>(null);

  useImperativeHandle(ref, () => ({
    order: (order) => sceneRef.current?.issueOrder(order),
    formation: (mode) => sceneRef.current?.setFormation(mode),
    reset: () => sceneRef.current?.resetBattle(),
    zoom: (delta) => sceneRef.current?.changeZoom(delta),
  }));

  useEffect(() => {
    if (!hostRef.current) return;
    const scene = new BattleScene(onSelect, onSnapshot, scenarioId);
    sceneRef.current = scene;
    const game = new Phaser.Game({
      type: Phaser.WEBGL,
      parent: hostRef.current,
      backgroundColor: "#1a1d17",
      scale: { mode: Phaser.Scale.RESIZE, width: "100%", height: "100%" },
      render: { antialias: true, pixelArt: false },
      scene,
    });
    return () => {
      sceneRef.current = null;
      game.destroy(true);
    };
  }, [onSelect, onSnapshot]);

  useEffect(() => sceneRef.current?.setSpeed(speed), [speed]);
  useEffect(() => sceneRef.current?.setSelected(selectedId), [selectedId]);
  useEffect(() => sceneRef.current?.setScenario(scenarioId), [scenarioId]);

  return (
    <div
      className="battlefield-host"
      ref={hostRef}
      aria-label={battlefieldName(scenarioId)}
    />
  );
});

class BattleScene extends Phaser.Scene {
  private engine: BattleEngine;
  private views = new Map<string, FormationView>();
  private selectedId = "legio-x";
  private speed = 0;
  private accumulator = 0;
  private onSelectFormation: (id: string) => void;
  private onBattleSnapshot: (snapshot: BattleSnapshot) => void;
  private orderLine?: Phaser.GameObjects.Graphics;
  private dragPreview?: Phaser.GameObjects.Graphics;
  private dragStart?: Point;
  private terrain?: Phaser.GameObjects.Image;
  private scenarioId: ScenarioId;

  constructor(onSelectFormation: (id: string) => void, onBattleSnapshot: (snapshot: BattleSnapshot) => void, scenarioId: ScenarioId) {
    super("battle");
    this.onSelectFormation = onSelectFormation;
    this.onBattleSnapshot = onBattleSnapshot;
    this.scenarioId = scenarioId;
    this.engine = new BattleEngine(scenarioId);
  }

  preload() {
    for (const [key, url] of scenarioAssets(this.scenarioId)) this.load.image(key, url);
    this.load.image("roman", romanUrl);
    this.load.image("helvetian", helvetianUrl);
    this.load.image("roman-attack", romanAttackUrl);
    this.load.image("helvetian-attack", helvetianAttackUrl);
    for (const archetype of UNIT_ARCHETYPES) {
      this.load.atlas(atlasKey(archetype), `./unit-atlases/${archetype}.webp`, `./unit-atlases/${archetype}.json`);
    }
  }

  create() {
    this.cameras.main.setBounds(0, 0, WORLD.width, WORLD.height);
    this.cameras.main.centerOn(WORLD.width / 2, cameraCenterY(this.scenarioId));
    this.cameras.main.setZoom(Math.max(this.scale.width / WORLD.width, this.scale.height / WORLD.height));
    this.terrain = this.add.image(0, 0, terrainKey(this.scenarioId)).setOrigin(0).setDisplaySize(WORLD.width, WORLD.height);
    this.terrain.setInteractive();
    this.terrain.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.dragStart = pointer.positionToCamera(this.cameras.main) as Point;
    });
    this.orderLine = this.add.graphics().setDepth(4);
    this.dragPreview = this.add.graphics().setDepth(5);
    for (const formation of this.engine.snapshot().formations) this.createFormation(formation);
    this.input.on("wheel", (_pointer: unknown, _objects: unknown, _dx: number, dy: number) => this.changeZoom(dy > 0 ? -0.08 : 0.08));
    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => this.previewDrag(pointer));
    this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => this.finishDrag(pointer));
    this.scale.on("resize", () => this.cameras.main.centerOn(WORLD.width / 2, cameraCenterY(this.scenarioId)));
    this.setSelected(this.selectedId);
    this.emitSnapshot();
  }

  update(_time: number, delta: number) {
    if (!this.views.size) return;
    if (this.speed > 0) {
      let remaining = (delta / 1000) * this.speed;
      while (remaining > 0) {
        const step = Math.min(remaining, 0.05);
        this.engine.tick(step);
        remaining -= step;
      }
      this.accumulator += delta;
    }
    const snapshot = this.engine.snapshot();
    for (const formation of snapshot.formations) this.syncFormation(formation);
    this.drawOrderLine(snapshot);
    if (this.accumulator > 140) {
      this.emitSnapshot(snapshot);
      this.accumulator = 0;
    }
  }

  setSpeed(speed: number) {
    this.speed = speed;
  }

  setSelected(id: string) {
    this.selectedId = id;
    for (const [viewId, view] of this.views) view.selection.setVisible(viewId === id);
    if (!this.views.size) return;
    const selected = this.engine.snapshot().formations.find((formation) => formation.id === id && formation.active && formation.status !== "broken");
    const fitZoom = Math.max(this.scale.width / WORLD.width, this.scale.height / WORLD.height);
    if (selected && this.cameras.main.zoom > fitZoom + 0.05) this.cameras.main.centerOn(selected.x, selected.y);
  }

  issueOrder(order: FormationOrder) {
    this.engine.order(this.selectedId, order);
    this.emitSnapshot();
  }

  setFormation(mode: FormationMode) {
    this.engine.setFormation(this.selectedId, mode);
    this.emitSnapshot();
  }

  resetBattle() {
    this.engine.reset();
    this.emitSnapshot();
  }

  setScenario(scenarioId: ScenarioId) {
    if (this.scenarioId === scenarioId) return;
    this.scenarioId = scenarioId;
    this.speed = 0;
    this.engine.loadScenario(scenarioId);
    for (const view of this.views.values()) this.destroyFormationView(view);
    this.views.clear();
    this.emitSnapshot();

    const finish = () => {
      if (this.scenarioId !== scenarioId) return;
      this.terrain?.setTexture(terrainKey(scenarioId)).setDisplaySize(WORLD.width, WORLD.height);
      this.cameras.main.centerOn(WORLD.width / 2, cameraCenterY(scenarioId));
      for (const formation of this.engine.snapshot().formations) this.createFormation(formation);
      this.setSelected(this.selectedId);
      this.emitSnapshot();
    };
    const missing = scenarioAssets(scenarioId).filter(([key]) => !this.textures.exists(key));
    if (missing.length === 0) {
      finish();
      return;
    }
    for (const [key, url] of missing) this.load.image(key, url);
    this.load.once(Phaser.Loader.Events.COMPLETE, finish);
    this.load.start();
  }

  changeZoom(delta: number) {
    this.cameras.main.setZoom(Phaser.Math.Clamp(this.cameras.main.zoom + delta, 0.65, 1.65));
    const selected = this.engine.snapshot().formations.find((formation) => formation.id === this.selectedId && formation.active && formation.status !== "broken");
    if (selected) this.cameras.main.centerOn(selected.x, selected.y);
  }

  private useFormationV2() {
    return !import.meta.env.DEV || new URLSearchParams(window.location.search).get("renderer") !== "legacy";
  }

  private destroyFormationView(view: FormationView) {
    if (view.kind === "legacy") {
      view.container.destroy(true);
      return;
    }
    for (const soldier of view.soldiers) soldier.destroy();
    view.shadow.destroy();
    view.selection.destroy();
    view.standard.destroy(true);
    view.hitArea.destroy();
  }

  private createFormation(formation: FormationState) {
    if (this.useFormationV2()) this.createFormationV2(formation);
    else this.createLegacyFormation(formation);
  }

  private createLegacyFormation(formation: FormationState) {
    const container = this.add.container(formation.x, formation.y).setDepth(formation.side === "roman" ? 3 : 2);
    const selection = this.add.rectangle(0, 0, 146, 88, 0x000000, 0).setStrokeStyle(3, 0xd8b55b, 1).setVisible(false);
    container.add(selection);
    const soldiers: Phaser.GameObjects.Image[] = [];
    const chariotFormation = formation.id === "zela-chariots";
    const horseArchers = formation.id.startsWith("parthian-archers");
    const cataphracts = formation.id === "parthian-cataphracts";
    const romanCavalry = formation.id === "roman-cavalry-screen";
    const mountedFormation = chariotFormation || horseArchers || cataphracts || romanCavalry;
    const romanOpponent = (this.scenarioId === "pharsalus" || this.scenarioId === "alexandria") && formation.side === "helvetian";
    const texture = formation.side === "roman" || romanOpponent ? "roman" : "helvetian";
    const rows = mountedFormation ? 2 : 4;
    const columns = mountedFormation ? 3 : 6;
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const jitter = formation.side === "helvetian" ? ((row * 7 + column * 11) % 7) - 3 : 0;
        const mountedTexture = chariotFormation ? "scythed-chariot" : horseArchers ? "parthian-horse-archers" : cataphracts ? "parthian-cataphracts" : "roman-auxiliary-cavalry";
        const soldier = this.add.image((column - (columns - 1) / 2) * (mountedFormation ? 48 : 19) + jitter, (row - (rows - 1) / 2) * (mountedFormation ? 31 : 14) + jitter / 2, mountedFormation ? mountedTexture : texture);
        soldier.setScale(chariotFormation ? 0.085 : horseArchers ? 0.065 : cataphracts ? 0.064 : romanCavalry ? 0.065 : formation.side === "roman" || romanOpponent ? 0.021 : 0.019);
        if (romanOpponent) soldier.setTint(this.scenarioId === "alexandria" ? 0x7ea6a1 : 0x93a9bb);
        soldier.setOrigin(0.5, 0.78);
        soldiers.push(soldier);
        container.add(soldier);
      }
    }
    const statusY = Math.max(55, 145 - formation.y);
    const status = this.add.text(0, statusY, formation.name, {
      fontFamily: "Georgia, serif",
      fontSize: "16px",
      color: formation.side === "roman" ? "#f0dfae" : romanOpponent ? (this.scenarioId === "alexandria" ? "#bfe3d9" : "#c9dced") : "#f2d3be",
      backgroundColor: "rgba(12, 14, 12, .82)",
      padding: { x: 7, y: 3 },
    }).setOrigin(0.5, 0);
    container.add(status);
    const hitArea = this.add.zone(0, 0, 148, 100).setInteractive({ cursor: formation.side === "roman" ? "pointer" : "default" });
    if (formation.side === "roman") {
      hitArea.on("pointerdown", (_pointer: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
        event.stopPropagation();
        this.onSelectFormation(formation.id);
      });
    }
    container.add(hitArea);
    this.views.set(formation.id, { kind: "legacy", container, soldiers, selection, status, hitArea });
  }

  private syncFormation(formation: FormationState) {
    const view = this.views.get(formation.id);
    if (!view) return;
    if (view.kind === "v2") {
      this.syncFormationV2(view, formation);
      return;
    }
    view.container.setVisible(formation.active);
    if (!formation.active) return;
    view.container.setPosition(formation.x, formation.y);
    const baseFacing = formation.side === "roman" ? -Math.PI / 2 : Math.PI / 2;
    const rotation = formation.facing - baseFacing;
    view.container.setRotation(rotation);
    view.status.setRotation(-rotation);
    view.status.setY(Math.max(55, 145 - formation.y));
    this.applyFormationLayout(view, formation);
    const ratio = formation.strength / formation.initialStrength;
    const visibleCount = Math.max(0, Math.ceil(view.soldiers.length * ratio));
    view.soldiers.forEach((soldier, index) => {
      soldier.setVisible(index < visibleCount && formation.status !== "broken");
      const chariotFormation = formation.id === "zela-chariots";
      const horseArchers = formation.id.startsWith("parthian-archers");
      const cataphracts = formation.id === "parthian-cataphracts";
      const romanCavalry = formation.id === "roman-cavalry-screen";
      const romanOpponent = (this.scenarioId === "pharsalus" || this.scenarioId === "alexandria") && formation.side === "helvetian";
      const readyTexture = formation.side === "roman" || romanOpponent ? "roman" : "helvetian";
      const attackTexture = formation.side === "roman" || romanOpponent ? "roman-attack" : "helvetian-attack";
      const attackFrame = formation.status === "engaged" && Math.floor(this.time.now / 220 + index / 3) % 2 === 0;
      soldier.setTexture(chariotFormation ? "scythed-chariot" : horseArchers ? "parthian-horse-archers" : cataphracts ? "parthian-cataphracts" : romanCavalry ? "roman-auxiliary-cavalry" : attackFrame ? attackTexture : readyTexture);
      if (romanOpponent) soldier.setTint(this.scenarioId === "alexandria" ? 0x7ea6a1 : 0x93a9bb);
      else soldier.clearTint();
      const engagedMotion = formation.status === "engaged" ? Math.sin(this.time.now / 75 + index) * 2.5 : 0;
      soldier.y += (engagedMotion - ((soldier.getData("motion") as number | undefined) ?? 0));
      soldier.setData("motion", engagedMotion);
      soldier.setAlpha(formation.status === "routing" ? 0.72 : 1);
    });
    view.status.setText(`${formation.name} · ${Math.round(formation.strength)}${formation.flanked ? " · FLANKED" : formation.status === "engaged" ? " · ENGAGED" : formation.status === "routing" ? " · ROUTING" : ""}`);
    view.status.setVisible(formation.status !== "broken");
    view.selection.setVisible(this.selectedId === formation.id && formation.status !== "broken");
  }

  private applyFormationLayout(view: LegacyFormationView, formation: FormationState) {
    const mountedFormation = formation.id === "zela-chariots" || formation.id.startsWith("parthian-archers") || formation.id === "parthian-cataphracts" || formation.id === "roman-cavalry-screen";
    const columns = mountedFormation ? 3 : formation.formationMode === "line" ? 8 : formation.formationMode === "column" ? 3 : 6;
    const rows = Math.ceil(view.soldiers.length / columns);
    const xSpacing = formation.frontage / Math.max(columns, 1) * 0.62;
    const ySpacing = mountedFormation ? 32 : formation.formationMode === "column" ? 12 : 14;
    view.soldiers.forEach((soldier, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const jitter = formation.side === "helvetian" ? ((row * 7 + column * 11) % 7) - 3 : 0;
      const motion = (soldier.getData("motion") as number | undefined) ?? 0;
      soldier.setPosition((column - (columns - 1) / 2) * (mountedFormation ? 48 : xSpacing) + jitter, (row - (rows - 1) / 2) * ySpacing + jitter / 2 + motion);
    });
    const width = Math.max(72, (columns - 1) * xSpacing + 42);
    const height = Math.max(76, (rows - 1) * ySpacing + 48);
    view.selection.setSize(width, height);
    view.hitArea.setSize(width + 10, height + 24);
  }

  private createFormationV2(formation: FormationState) {
    const projection = terrainProjectionFor(this.scenarioId);
    const profile = visualProfileFor(formation, this.scenarioId);
    const capacity = this.scale.width < 700 ? profile.mobileFigures : profile.desktopFigures;
    const baseSlots = generateFormationSlots(formation.id, formation.formationMode, capacity, formation.frontage, projection.verticalCompression);
    const shadow = this.add.graphics();
    const selection = this.add.graphics().setVisible(false);
    const atlas = atlasKey(profile.archetype);
    const initialDirection = directionFrame(formation.facing);
    const soldiers = baseSlots.map(() => this.add.image(formation.x, formation.y, atlas, `idle/d${initialDirection}/f0`).setOrigin(0.5, 0.82));

    const pole = this.add.rectangle(0, 0, 3, 48, formation.side === "roman" ? 0xd9bd72 : 0x9a8059).setOrigin(0.5, 1);
    const standardFlag = this.add.rectangle(3, -43, 34, 19, formation.side === "roman" ? 0x8b231d : 0x3f5d42).setOrigin(0, 0.5).setStrokeStyle(1, 0xe4cf91, 0.9);
    const standardText = this.add.text(20, -43, formation.side === "roman" ? formation.name.replace(" Cohort", "") : "◆", {
      fontFamily: "Georgia, serif",
      fontSize: "10px",
      fontStyle: "bold",
      color: "#fff2c7",
    }).setOrigin(0.5);
    const strengthBack = this.add.rectangle(-20, 5, 40, 5, 0x121510, 0.92).setOrigin(0, 0.5).setStrokeStyle(1, 0xe0c56d, 0.7);
    const strengthFill = this.add.rectangle(-19, 5, 38, 3, formation.side === "roman" ? 0xc74a3c : 0x8cac70).setOrigin(0, 0.5);
    const status = this.add.text(0, 13, formation.name, {
      fontFamily: "Georgia, serif",
      fontSize: "14px",
      color: formation.side === "roman" ? "#f4e1ad" : "#f1d1b5",
      backgroundColor: "rgba(12, 14, 12, .88)",
      padding: { x: 6, y: 3 },
    }).setOrigin(0.5, 0);
    const standard = this.add.container(formation.x, formation.y, [pole, standardFlag, standardText, strengthBack, strengthFill, status]);
    const footprint = formationFootprint(baseSlots, 22);
    const hitArea = this.add.zone(formation.x, formation.y, footprint.width, Math.max(70, footprint.height)).setInteractive({ cursor: formation.side === "roman" ? "pointer" : "default" });
    const view: FormationV2View = {
      kind: "v2",
      soldiers,
      shadow,
      selection,
      standard,
      standardFlag,
      standardText,
      strengthBack,
      strengthFill,
      status,
      hitArea,
      baseSlots,
      displayedCount: capacity,
      casualtyOrder: casualtyOrder(formation.id, baseSlots),
      casualtyAt: new Map(),
      hovered: false,
    };

    hitArea.on("pointerover", () => { view.hovered = true; });
    hitArea.on("pointerout", () => { view.hovered = false; });
    if (formation.side === "roman") {
      hitArea.on("pointerdown", (_pointer: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
        event.stopPropagation();
        this.onSelectFormation(formation.id);
      });
    }
    this.views.set(formation.id, view);
    this.syncFormationV2(view, formation);
  }

  private syncFormationV2(view: FormationV2View, formation: FormationState) {
    const visible = formation.active;
    view.shadow.setVisible(visible);
    view.selection.setVisible(visible && this.selectedId === formation.id && formation.status !== "broken");
    view.standard.setVisible(visible && formation.status !== "broken");
    view.hitArea.setVisible(visible && formation.status !== "broken");
    if (!visible) {
      for (const soldier of view.soldiers) soldier.setVisible(false);
      return;
    }

    const projection = terrainProjectionFor(this.scenarioId);
    const profile = visualProfileFor(formation, this.scenarioId);
    const capacity = view.soldiers.length;
    const targetCount = formation.status === "broken" ? 0 : visibleFigureCount(formation.strength, formation.initialStrength, capacity);
    const previousLosses = capacity - view.displayedCount;
    const currentLosses = capacity - targetCount;
    if (currentLosses > previousLosses) {
      for (const index of view.casualtyOrder.slice(previousLosses, currentLosses)) view.casualtyAt.set(index, this.time.now);
    } else if (currentLosses < previousLosses) {
      view.casualtyAt.clear();
    }
    view.displayedCount = targetCount;

    view.baseSlots = generateFormationSlots(formation.id, formation.formationMode, capacity, formation.frontage, projection.verticalCompression);
    view.casualtyOrder = casualtyOrder(formation.id, view.baseSlots);
    const survivors = survivorIndices(formation.id, view.baseSlots, targetCount);
    const survivingIndices = [...survivors].sort((a, b) => a - b);
    const packedSlots = generateFormationSlots(formation.id, formation.formationMode, targetCount, formation.frontage, projection.verticalCompression);
    const preserveGaps = formation.status === "engaged";
    const alivePosition = new Map(survivingIndices.map((index, order) => [index, preserveGaps ? view.baseSlots[index] : packedSlots[order]]));
    const scaleAtFormation = projectScale(formation.y, WORLD.height, projection);
    const atlas = atlasKey(profile.archetype);
    const direction = directionFrame(formation.facing);
    const baseScale = V2_BASE_SCALE[profile.archetype];

    view.shadow.clear();
    view.shadow.setDepth(formation.y * 10 - 3);
    for (let index = 0; index < capacity; index += 1) {
      const soldier = view.soldiers[index];
      const slot = alivePosition.get(index);
      const casualtyTime = view.casualtyAt.get(index);
      if (!slot) {
        if (casualtyTime === undefined || this.time.now - casualtyTime > 1900) {
          soldier.setVisible(false);
          continue;
        }
        const fallSlot = view.baseSlots[index];
        const point = projectFormationSlot(formation, formation.facing, fallSlot);
        const age = this.time.now - casualtyTime;
        const progress = Math.min(1, age / 420);
        const fallFrame = Math.min(V2_FRAME_COUNTS.fall - 1, Math.floor(progress * V2_FRAME_COUNTS.fall));
        soldier.setVisible(true).setTexture(atlas, `fall/d${direction}/f${fallFrame}`).setPosition(point.x, point.y + progress * 5);
        soldier.setScale(baseScale * scaleAtFormation);
        soldier.setRotation(0);
        soldier.setAlpha(Math.max(0.28, 0.78 - age / 3800)).setDepth(point.y * 10 + 1);
        continue;
      }

      const point = projectFormationSlot(formation, formation.facing, slot);
      const marching = formation.order === "advance" || formation.order === "charge" || formation.order === "withdraw";
      const frontAttack = formation.status === "engaged" && slot.frontRank && Math.floor(this.time.now / 210 + index / 2) % 2 === 0;
      const motion = frontAttack ? Math.sin(this.time.now / 70 + index) * 2.4 : marching ? Math.sin(this.time.now / 115 + index * 0.8) * 1.2 : 0;
      const routingScatter = formation.status === "routing" ? (deterministicUnitValue(formation.id, index, 47) - 0.5) * 32 : 0;
      const variantScale = 0.96 + deterministicUnitValue(formation.id, index, 53) * 0.08;
      const state = formation.status === "routing" ? "route" : frontAttack ? "attack" : marching ? "walk" : "idle";
      const stateFrames = V2_FRAME_COUNTS[state];
      const stateFrame = Math.floor(this.time.now / (state === "idle" ? 520 : 130) + index * 0.37) % stateFrames;
      soldier
        .setVisible(true)
        .setTexture(atlas, `${state}/d${direction}/f${stateFrame}`)
        .setPosition(point.x + routingScatter, point.y + motion + Math.abs(routingScatter) * 0.18)
        .setScale(baseScale * scaleAtFormation * variantScale)
        .setRotation(0)
        .setFlipX(false)
        .setAlpha(formation.status === "routing" ? 0.78 : 1)
        .setDepth((point.y + motion) * 10 + 2);
      if (formation.side === "roman") {
        const romanTints = [0xffffff, 0xf4e9dc, 0xe9d1c2, 0xfff4df];
        soldier.setTint(romanTints[slot.variant] ?? 0xffffff);
      } else if (profile.archetype === "gallic-infantry") {
        const gallicTints = [0xffffff, 0xe4c8a8, 0xc8d0a4, 0xdcb6a0];
        soldier.setTint(gallicTints[slot.variant] ?? 0xffffff);
      } else {
        const easternTints = [0xffffff, 0xe5d7b5, 0xc8d8d0, 0xd7c1a1];
        soldier.setTint(easternTints[slot.variant] ?? 0xffffff);
      }
      view.shadow.fillStyle(0x0b0d09, formation.status === "routing" ? 0.18 : 0.3);
      view.shadow.fillEllipse(point.x + 7, point.y + 8, 20 * scaleAtFormation, 7 * scaleAtFormation);
    }

    if (formation.status === "engaged") {
      const pulse = (Math.sin(this.time.now / 120) + 1) / 2;
      view.shadow.fillStyle(0xb68b58, 0.08 + pulse * 0.08);
      for (let dust = 0; dust < 5; dust += 1) {
        const lateral = (deterministicUnitValue(formation.id, dust, 89) - 0.5) * formation.frontage * 0.72;
        const point = projectFormationSlot(formation, formation.facing, { lateral, forward: 16 });
        view.shadow.fillCircle(point.x, point.y, 4 + pulse * 3);
      }
    }

    this.drawV2Selection(view, formation, preserveGaps ? view.baseSlots : packedSlots);
    const footprint = formationFootprint(preserveGaps ? view.baseSlots : packedSlots, 26);
    view.hitArea.setPosition(formation.x, formation.y).setSize(footprint.width, Math.max(68, footprint.height + 28));
    view.hitArea.setRotation(formation.facing + Math.PI / 2);

    const standardY = formation.y - Math.max(42, footprint.height * 0.42) * scaleAtFormation;
    view.standard.setPosition(formation.x, standardY).setDepth(20000 + formation.y);
    view.standard.setScale(Math.max(0.82, scaleAtFormation));
    view.standardFlag.setFillStyle(formation.side === "roman" ? 0x8b231d : profile.palette === "gallic-earth" ? 0x3f5d42 : 0x385d68);
    view.standardText.setText(formation.side === "roman" ? formation.name.replace(" Cohort", "") : profile.standard === "TRIBE" ? "◆" : "✦");
    view.strengthFill.setDisplaySize(38 * Math.max(0, formation.strength / formation.initialStrength), 3);
    const emphasized = this.selectedId === formation.id || view.hovered || formation.flanked || formation.status === "routing";
    view.status.setVisible(emphasized);
    view.status.setText(`${formation.name} · ${Math.round(formation.strength)}${formation.flanked ? " · FLANKED" : formation.status === "routing" ? " · ROUTING" : ""}`);
  }

  private drawV2Selection(view: FormationV2View, formation: FormationState, slots: FormationSlot[]) {
    view.selection.clear();
    if (this.selectedId !== formation.id || formation.status === "broken") return;
    const footprint = formationFootprint(slots, 24);
    const corners = [
      { lateral: -footprint.width / 2, forward: -footprint.height / 2 },
      { lateral: footprint.width / 2, forward: -footprint.height / 2 },
      { lateral: footprint.width / 2, forward: footprint.height / 2 },
      { lateral: -footprint.width / 2, forward: footprint.height / 2 },
    ].map((corner) => projectFormationSlot(formation, formation.facing, corner));
    view.selection.setDepth(formation.y * 10 - 2);
    view.selection.lineStyle(3, 0xe3c464, 0.95);
    view.selection.fillStyle(0xe3c464, 0.08);
    view.selection.beginPath();
    view.selection.moveTo(corners[0].x, corners[0].y);
    for (const corner of corners.slice(1)) view.selection.lineTo(corner.x, corner.y);
    view.selection.closePath();
    view.selection.fillPath();
    view.selection.strokePath();
  }

  private previewDrag(pointer: Phaser.Input.Pointer) {
    if (!this.dragStart || !pointer.isDown || !this.dragPreview) return;
    const end = pointer.positionToCamera(this.cameras.main) as Point;
    this.dragPreview.clear();
    this.dragPreview.lineStyle(3, 0xf0d47d, 0.9);
    this.dragPreview.lineBetween(this.dragStart.x, this.dragStart.y, end.x, end.y);
    const angle = Math.atan2(end.y - this.dragStart.y, end.x - this.dragStart.x);
    const frontage = Phaser.Math.Clamp(Math.hypot(end.x - this.dragStart.x, end.y - this.dragStart.y) * 1.15, 90, 210);
    const normalX = Math.cos(angle + Math.PI / 2) * frontage / 2;
    const normalY = Math.sin(angle + Math.PI / 2) * frontage / 2;
    this.dragPreview.lineStyle(5, 0xd8b55b, 0.75);
    this.dragPreview.lineBetween(this.dragStart.x - normalX, this.dragStart.y - normalY, this.dragStart.x + normalX, this.dragStart.y + normalY);
  }

  private finishDrag(pointer: Phaser.Input.Pointer) {
    if (!this.dragStart) return;
    const start = this.dragStart;
    const end = pointer.positionToCamera(this.cameras.main) as Point;
    this.dragStart = undefined;
    this.dragPreview?.clear();
    const length = Math.hypot(end.x - start.x, end.y - start.y);
    if (length < 18) this.engine.move(this.selectedId, start);
    else this.engine.move(this.selectedId, start, Math.atan2(end.y - start.y, end.x - start.x), length * 1.15);
    this.emitSnapshot();
  }

  private emitSnapshot(snapshot = this.engine.snapshot()) {
    this.onBattleSnapshot(snapshot);
  }

  private drawOrderLine(snapshot: BattleSnapshot) {
    if (!this.orderLine) return;
    this.orderLine.clear();
    const selected = snapshot.formations.find((formation) => formation.id === this.selectedId);
    if (!selected || selected.status === "broken" || selected.order === "hold" || selected.order === "reform") return;
    const length = Math.hypot(selected.target.x - selected.x, selected.target.y - selected.y);
    if (length < 12) return;
    this.orderLine.lineStyle(3, 0xe2c465, 0.8);
    this.orderLine.beginPath();
    this.orderLine.moveTo(selected.x, selected.y);
    this.orderLine.lineTo(selected.target.x, selected.target.y);
    this.orderLine.strokePath();
    this.orderLine.fillStyle(0xe2c465, 0.85);
    this.orderLine.fillCircle(selected.target.x, selected.target.y, 7);
    this.orderLine.lineStyle(2, 0x171a16, 0.9);
    this.orderLine.strokeCircle(selected.target.x, selected.target.y, 12);
  }
}
