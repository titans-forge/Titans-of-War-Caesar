import { describe, expect, it } from "vitest";
import {
  casualtyOrder,
  directionFrame,
  formationFootprint,
  generateFormationSlots,
  projectFormationSlot,
  projectScale,
  survivorIndices,
  terrainProjectionFor,
  visibleFigureCount,
  visualProfileFor,
} from "../src/game/formationVisuals";
import { BattleEngine } from "../src/game/simulation";
import type { ScenarioId } from "../src/game/types";

describe("formation visuals", () => {
  it("generates deterministic slots and variants", () => {
    expect(generateFormationSlots("legio-x", "line", 48, 180)).toEqual(generateFormationSlots("legio-x", "line", 48, 180));
  });

  it("keeps line, deep, and column footprints distinct", () => {
    const line = formationFootprint(generateFormationSlots("unit", "line", 48, 180));
    const deep = formationFootprint(generateFormationSlots("unit", "deep", 48, 180));
    const column = formationFootprint(generateFormationSlots("unit", "column", 48, 180));
    expect(line.width).toBeGreaterThan(deep.width);
    expect(deep.width).toBeGreaterThan(column.width);
    expect(column.height).toBeGreaterThan(deep.height);
  });

  it("maps facing to eight stable directions", () => {
    expect(directionFrame(0)).toBe(0);
    expect(directionFrame(Math.PI / 2)).toBe(2);
    expect(directionFrame(Math.PI)).toBe(4);
    expect(directionFrame(-Math.PI / 2)).toBe(6);
  });

  it("grows figures toward the foreground", () => {
    const terrain = terrainProjectionFor("bibracte");
    expect(projectScale(780, 900, terrain)).toBeGreaterThan(projectScale(200, 900, terrain));
  });

  it("projects lateral and forward offsets around formation facing", () => {
    const point = projectFormationSlot({ x: 100, y: 100 }, 0, { lateral: 20, forward: 30 });
    expect(point.x).toBeCloseTo(130);
    expect(point.y).toBeCloseTo(120);
  });

  it("maps strength proportionally to representative figures", () => {
    expect(visibleFigureCount(480, 480, 48)).toBe(48);
    expect(visibleFigureCount(240, 480, 48)).toBe(24);
    expect(visibleFigureCount(1, 480, 48)).toBe(1);
    expect(visibleFigureCount(0, 480, 48)).toBe(0);
  });

  it("removes contact-facing ranks first and preserves deterministic gaps", () => {
    const slots = generateFormationSlots("legio-x", "deep", 48, 150);
    const order = casualtyOrder("legio-x", slots);
    expect(slots.find((slot) => slot.index === order[0])?.row).toBe(0);
    expect(survivorIndices("legio-x", slots, 30)).toEqual(survivorIndices("legio-x", slots, 30));
    expect(survivorIndices("legio-x", slots, 30).size).toBe(30);
  });

  it("maps every specialist formation to its intended visual family", () => {
    const archetype = (scenarioId: ScenarioId, formationId: string) => {
      const formation = new BattleEngine(scenarioId).snapshot().formations.find((candidate) => candidate.id === formationId);
      expect(formation).toBeDefined();
      return visualProfileFor(formation!, scenarioId).archetype;
    };

    expect(archetype("pharsalus", "pompey-cavalry")).toBe("auxiliary-cavalry");
    expect(archetype("pharsalus", "pompey-missiles")).toBe("missile-infantry");
    expect(archetype("alexandria", "alex-center")).toBe("hellenistic-infantry");
    expect(archetype("zela", "zela-chariots")).toBe("scythed-chariot");
    expect(archetype("zela", "pontic-center")).toBe("hellenistic-infantry");
    expect(archetype("parthia", "roman-cavalry-screen")).toBe("auxiliary-cavalry");
    expect(archetype("parthia", "parthian-archers-center")).toBe("horse-archer");
    expect(archetype("parthia", "parthian-cataphracts")).toBe("cataphract");
  });
});
