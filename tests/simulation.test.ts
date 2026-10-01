import { describe, expect, it } from "vitest";
import { BattleEngine } from "../src/game/simulation";

describe("BattleEngine", () => {
  it("starts paused-ready with intact formations", () => {
    const snapshot = new BattleEngine().snapshot();
    expect(snapshot.formations).toHaveLength(9);
    expect(snapshot.outcome).toBe("undecided");
    expect(snapshot.romanLosses).toBe(0);
  });

  it("accepts movement orders for Roman cohorts", () => {
    const engine = new BattleEngine();
    const startY = engine.snapshot().formations.find((unit) => unit.id === "legio-x")!.y;
    engine.move("legio-x", { x: 900, y: 500 });
    engine.tick(1);
    const cohort = engine.snapshot().formations.find((unit) => unit.id === "legio-x")!;
    expect(cohort.order).toBe("advance");
    expect(cohort.y).toBeLessThan(startY);
  });

  it("uses drag geometry to set facing and frontage", () => {
    const engine = new BattleEngine();
    engine.move("legio-x", { x: 900, y: 500 }, 0, 205);
    const cohort = engine.snapshot().formations.find((unit) => unit.id === "legio-x")!;
    expect(cohort.facing).toBe(0);
    expect(cohort.frontage).toBe(205);
    expect(cohort.formationMode).toBe("line");
  });

  it("changes formation mode outside contact", () => {
    const engine = new BattleEngine();
    engine.setFormation("legio-x", "column");
    const cohort = engine.snapshot().formations.find((unit) => unit.id === "legio-x")!;
    expect(cohort.formationMode).toBe("column");
    expect(cohort.frontage).toBe(95);
    expect(cohort.order).toBe("reform");
  });

  it("reform restores cohesion and reduces fatigue", () => {
    const engine = new BattleEngine();
    engine.order("legio-x", "charge");
    engine.tick(1);
    const tired = engine.snapshot().formations.find((unit) => unit.id === "legio-x")!;
    engine.order("legio-x", "reform");
    engine.tick(1);
    const reformed = engine.snapshot().formations.find((unit) => unit.id === "legio-x")!;
    expect(reformed.cohesion).toBeGreaterThan(tired.cohesion);
    expect(reformed.fatigue).toBeLessThan(tired.fatigue);
  });

  it("keeps snapshots detached from engine state", () => {
    const engine = new BattleEngine();
    const snapshot = engine.snapshot();
    snapshot.formations[0].strength = 0;
    expect(engine.snapshot().formations[0].strength).toBeGreaterThan(0);
  });

  it("holds the second force off-map until the flank crisis", () => {
    const engine = new BattleEngine();
    const opening = engine.snapshot();
    expect(opening.phase).toBe("opening");
    expect(opening.formations.find((unit) => unit.id === "legio-x")?.role).toBe("reserve");
    expect(opening.formations.find((unit) => unit.id === "helv-reserve")?.active).toBe(false);

    for (let step = 0; step < 245; step += 1) engine.tick(0.05);
    const crisis = engine.snapshot();
    expect(crisis.phase).toBe("flank-crisis");
    expect(crisis.formations.find((unit) => unit.id === "helv-reserve")?.active).toBe(true);
    expect(crisis.events.map((event) => event.id)).toContain("flank-crisis");
  });

  it("produces a graded report when the battle reaches a decision", () => {
    const engine = new BattleEngine();
    for (let step = 0; step < 2400 && engine.snapshot().outcome === "undecided"; step += 1) engine.tick(0.05);
    const result = engine.snapshot();
    expect(result.outcome).not.toBe("undecided");
    expect(result.assessment?.overall).toMatch(/^[A-F]$/);
    expect(result.assessment?.lesson.length).toBeGreaterThan(40);
  });

  it("allows a disciplined line and timed reserve commitment to win", () => {
    const engine = new BattleEngine();
    for (const id of ["legio-vii", "legio-viii", "legio-ix", "legio-x"]) engine.setFormation(id, "line");
    for (let step = 0; step < 245; step += 1) engine.tick(0.05);
    engine.order("legio-x", "charge");
    for (let step = 0; step < 160; step += 1) engine.tick(0.05);
    for (const id of ["legio-vii", "legio-viii", "legio-ix"]) engine.order(id, "charge");
    for (let step = 0; step < 2000 && engine.snapshot().outcome === "undecided"; step += 1) engine.tick(0.05);
    const result = engine.snapshot();
    expect(result.outcome, JSON.stringify({
      time: result.time,
      romans: result.formations.filter((unit) => unit.side === "roman").map((unit) => [unit.id, unit.status, Math.round(unit.strength), Math.round(unit.cohesion)]),
      helvetians: result.formations.filter((unit) => unit.side === "helvetian").map((unit) => [unit.id, unit.status, Math.round(unit.strength), Math.round(unit.cohesion)]),
    })).toBe("roman-victory");
  });

  it("loads the Sabis with a disordered line and delayed rear column", () => {
    const engine = new BattleEngine("sabis");
    const opening = engine.snapshot();
    expect(opening.battleName).toBe("The Sabis");
    expect(opening.phaseTitle).toBe("Alarm on the Sabis");
    expect(opening.formations.find((unit) => unit.id === "legio-xii")?.cohesion).toBeLessThan(60);
    expect(opening.formations.find((unit) => unit.id === "legio-xiii")?.active).toBe(false);

    for (let step = 0; step < 285; step += 1) engine.tick(0.05);
    const reinforcement = engine.snapshot();
    expect(reinforcement.formations.find((unit) => unit.id === "legio-xiii")?.active).toBe(true);
    expect(reinforcement.phaseTitle).toBe("The rear column arrives");
    expect(reinforcement.events.map((event) => event.id)).toContain("rear-arrival");
  });

  it("allows rapid reform and a committed rear column to recover the Sabis", () => {
    const engine = new BattleEngine("sabis");
    for (const id of ["legio-ix", "legio-x", "legio-xii", "legio-vii"]) engine.order(id, "reform");
    for (let step = 0; step < 285; step += 1) engine.tick(0.05);
    engine.order("legio-xiii", "charge");
    for (const id of ["legio-ix", "legio-x", "legio-xii", "legio-vii"]) engine.order(id, "charge");
    for (let step = 0; step < 1900 && engine.snapshot().outcome === "undecided"; step += 1) engine.tick(0.05);
    const result = engine.snapshot();
    expect(result.outcome, JSON.stringify(result.formations.map((unit) => [unit.id, unit.status, Math.round(unit.cohesion)]))).toBe("roman-victory");
    expect(result.assessment?.grades.find((grade) => grade.label === "Cohort rally")?.grade).toBe("A");
  });

  it("loads Gergovia as a limited assault with hidden upper reserves", () => {
    const engine = new BattleEngine("gergovia");
    const opening = engine.snapshot();
    expect(opening.battleName).toBe("Gergovia");
    expect(opening.phaseTitle).toBe("A limited opportunity");
    expect(opening.formations.filter((unit) => unit.id.startsWith("arv-upper")).every((unit) => !unit.active)).toBe(true);
    expect(opening.objective).toContain("feint");
  });

  it("rewards taking the lower camps and obeying the recall", () => {
    const engine = new BattleEngine("gergovia");
    for (const id of ["legio-viii", "legio-x", "legio-xiii", "legio-xv"]) engine.order(id, "charge");
    for (let step = 0; step < 2400 && !engine.snapshot().events.some((event) => event.id === "recall"); step += 1) engine.tick(0.05);
    const recall = engine.snapshot();
    expect(recall.events.map((event) => event.id)).toContain("recall");
    expect(recall.formations.filter((unit) => unit.id.startsWith("arv-upper")).every((unit) => unit.active)).toBe(true);

    for (const id of ["legio-viii", "legio-x", "legio-xiii", "legio-xv"]) engine.order(id, "withdraw");
    for (let step = 0; step < 80 && engine.snapshot().outcome === "undecided"; step += 1) engine.tick(0.05);
    const result = engine.snapshot();
    expect(result.outcome).toBe("roman-victory");
    expect(result.assessment?.grades.find((grade) => grade.label === "Recall discipline")?.grade).toBe("A");
    expect(result.assessment?.lesson).toContain("limited seizure");
  });

  it("loads Alesia with two siege fronts and a central reserve", () => {
    const engine = new BattleEngine("alesia");
    const opening = engine.snapshot();
    expect(opening.battleName).toBe("Alesia");
    expect(opening.phaseTitle).toBe("The inner line erupts");
    expect(opening.formations.find((unit) => unit.id === "legio-reserve")?.role).toBe("reserve");
    expect(opening.formations.find((unit) => unit.id === "relief-west")?.active).toBe(false);

    for (let step = 0; step < 325; step += 1) engine.tick(0.05);
    const weakPoint = engine.snapshot();
    expect(weakPoint.phaseTitle).toBe("The weak point");
    expect(weakPoint.formations.find((unit) => unit.id === "relief-west")?.active).toBe(true);
    expect(weakPoint.formations.find((unit) => unit.id === "relief-weak")?.active).toBe(true);
    expect(weakPoint.events.map((event) => event.id)).toContain("weak-point");
  });

  it("allows the held sectors and a late reserve commitment to save Alesia", () => {
    const engine = new BattleEngine("alesia");
    for (let step = 0; step < 325; step += 1) engine.tick(0.05);
    engine.setFormation("legio-reserve", "deep");
    engine.order("legio-reserve", "charge");
    for (let step = 0; step < 2200 && engine.snapshot().outcome === "undecided"; step += 1) engine.tick(0.05);
    const result = engine.snapshot();
    expect(result.outcome, JSON.stringify({
      time: result.time,
      romans: result.formations.filter((unit) => unit.side === "roman").map((unit) => [unit.id, unit.status, Math.round(unit.strength), Math.round(unit.cohesion)]),
      enemies: result.formations.filter((unit) => unit.side === "helvetian").map((unit) => [unit.id, unit.status, Math.round(unit.strength), Math.round(unit.cohesion), Math.round(unit.y)]),
    })).toBe("roman-victory");
    expect(result.assessment?.grades.find((grade) => grade.label === "Reserve decision")?.grade).toBe("A");
  });

  it("loads Pharsalus with opposed Roman lines and a concealed cavalry threat", () => {
    const engine = new BattleEngine("pharsalus");
    const opening = engine.snapshot();
    expect(opening.battleName).toBe("Pharsalus");
    expect(opening.phaseTitle).toBe("The concealed fourth line");
    expect(opening.formations.find((unit) => unit.id === "caesar-fourth-line")?.role).toBe("reserve");
    expect(opening.formations.find((unit) => unit.id === "pompey-cavalry")?.active).toBe(false);

    for (let step = 0; step < 205; step += 1) engine.tick(0.05);
    const cavalryCrisis = engine.snapshot();
    expect(cavalryCrisis.phaseTitle).toBe("The cavalry gamble");
    expect(cavalryCrisis.formations.find((unit) => unit.id === "pompey-cavalry")?.active).toBe(true);
    expect(cavalryCrisis.events.map((event) => event.id)).toContain("cavalry-attack");
  });

  it("rewards a timed fourth-line counter and flank turn at Pharsalus", () => {
    const engine = new BattleEngine("pharsalus");
    for (let step = 0; step < 205; step += 1) engine.tick(0.05);
    engine.order("caesar-fourth-line", "charge");

    for (let step = 0; step < 2400 && !engine.snapshot().events.some((event) => event.id === "cavalry-rout"); step += 1) engine.tick(0.05);
    expect(engine.snapshot().events.map((event) => event.id)).toContain("cavalry-rout");

    engine.order("caesar-fourth-line", "charge");
    for (const id of ["caesar-left", "caesar-center", "caesar-right"]) engine.order(id, "charge");
    for (let step = 0; step < 2400 && engine.snapshot().outcome === "undecided"; step += 1) engine.tick(0.05);
    const result = engine.snapshot();
    expect(result.outcome, JSON.stringify({
      time: result.time,
      romans: result.formations.filter((unit) => unit.side === "roman").map((unit) => [unit.id, unit.status, Math.round(unit.strength), Math.round(unit.cohesion), Math.round(unit.y)]),
      pompeians: result.formations.filter((unit) => unit.side === "helvetian").map((unit) => [unit.id, unit.status, Math.round(unit.strength), Math.round(unit.cohesion), Math.round(unit.y)]),
      events: result.events.map((event) => event.id),
    })).toBe("roman-victory");
    expect(result.assessment?.grades.find((grade) => grade.label === "Reserve timing")?.grade).toBe("A");
    expect(result.assessment?.grades.find((grade) => grade.label === "Flank turn")?.grade).toBe("A");
  });

  it("leaves a fair fourth-line reaction window at accelerated play speed", () => {
    const engine = new BattleEngine("pharsalus");
    for (let step = 0; step < 250; step += 1) engine.tick(0.05);
    engine.order("caesar-fourth-line", "charge");
    for (let step = 0; step < 1200 && !engine.snapshot().events.some((event) => event.id === "cavalry-rout") && engine.snapshot().outcome === "undecided"; step += 1) engine.tick(0.05);
    const counter = engine.snapshot();
    expect(counter.outcome).not.toBe("helvetian-victory");
    expect(counter.events.map((event) => event.id)).toContain("cavalry-rout");
  });

  it("loads Alexandria as an urban defense with a separate harbor column", () => {
    const engine = new BattleEngine("alexandria");
    const opening = engine.snapshot();
    expect(opening.battleName).toBe("Alexandria");
    expect(opening.phaseTitle).toBe("A small army in a hostile capital");
    expect(opening.formations.find((unit) => unit.id === "pharos-column")?.role).toBe("reserve");
    expect(opening.formations.find((unit) => unit.id === "royal-reserve")?.active).toBe(false);

    for (let step = 0; step < 125; step += 1) engine.tick(0.05);
    const harborCrisis = engine.snapshot();
    expect(harborCrisis.phaseTitle).toBe("Seize the harbor key");
    expect(harborCrisis.events.map((event) => event.id)).toContain("harbor-decision");
  });

  it("rewards holding the city strongpoints while the harbor column takes Pharos", () => {
    const engine = new BattleEngine("alexandria");
    for (let step = 0; step < 125; step += 1) engine.tick(0.05);
    engine.setFormation("pharos-column", "deep");
    engine.order("pharos-column", "charge");
    for (let step = 0; step < 2600 && engine.snapshot().outcome === "undecided"; step += 1) engine.tick(0.05);
    const result = engine.snapshot();
    expect(result.outcome, JSON.stringify({
      time: result.time,
      romans: result.formations.filter((unit) => unit.side === "roman").map((unit) => [unit.id, unit.status, Math.round(unit.strength), Math.round(unit.cohesion), Math.round(unit.y)]),
      alexandrians: result.formations.filter((unit) => unit.side === "helvetian").map((unit) => [unit.id, unit.status, Math.round(unit.strength), Math.round(unit.cohesion), Math.round(unit.y)]),
      events: result.events.map((event) => event.id),
    })).toBe("roman-victory");
    expect(result.assessment?.grades.find((grade) => grade.label === "Harbor control")?.grade).toBe("A");
    expect(result.assessment?.grades.find((grade) => grade.label === "Pharos timing")?.grade).toBe("A");
  });

  it("loads Zela with working columns and a delayed surprise attack", () => {
    const engine = new BattleEngine("zela");
    const opening = engine.snapshot();
    expect(opening.battleName).toBe("Zela");
    expect(opening.phaseTitle).toBe("An unfinished camp at dawn");
    expect(opening.formations.filter((unit) => unit.side === "roman").every((unit) => unit.formationMode === "column")).toBe(true);
    expect(opening.formations.find((unit) => unit.id === "zela-chariots")?.active).toBe(false);

    for (let step = 0; step < 65; step += 1) engine.tick(0.05);
    const attack = engine.snapshot();
    expect(attack.phaseTitle).toBe("The attack nobody expected");
    expect(attack.formations.find((unit) => unit.id === "zela-chariots")?.active).toBe(true);
    expect(attack.events.map((event) => event.id)).toContain("surprise-attack");
  });

  it("rewards forming line, stopping the chariots, and sending Legio VI into the camp", () => {
    const engine = new BattleEngine("zela");
    const romanIds = ["zela-left", "zela-center", "zela-center-right", "legio-vi"];
    for (const id of romanIds) {
      engine.setFormation(id, "line");
      engine.order(id, "hold");
    }

    for (let step = 0; step < 2400 && !engine.snapshot().events.some((event) => event.id === "chariots-stopped"); step += 1) engine.tick(0.05);
    const chariotCheck = engine.snapshot();
    expect(chariotCheck.outcome, JSON.stringify({
      time: chariotCheck.time,
      romans: chariotCheck.formations.filter((unit) => unit.side === "roman").map((unit) => [unit.id, unit.status, Math.round(unit.strength), Math.round(unit.cohesion), Math.round(unit.y)]),
      pontics: chariotCheck.formations.filter((unit) => unit.side === "helvetian").map((unit) => [unit.id, unit.status, Math.round(unit.strength), Math.round(unit.cohesion), Math.round(unit.y)]),
      events: chariotCheck.events.map((event) => event.id),
    })).not.toBe("helvetian-victory");
    expect(chariotCheck.events.map((event) => event.id)).toContain("chariots-stopped");

    engine.order("legio-vi", "charge");
    for (let step = 0; step < 3200 && engine.snapshot().outcome === "undecided"; step += 1) engine.tick(0.05);
    const result = engine.snapshot();
    expect(result.outcome, JSON.stringify({
      time: result.time,
      romans: result.formations.filter((unit) => unit.side === "roman").map((unit) => [unit.id, unit.status, Math.round(unit.strength), Math.round(unit.cohesion), Math.round(unit.y)]),
      pontics: result.formations.filter((unit) => unit.side === "helvetian").map((unit) => [unit.id, unit.status, Math.round(unit.strength), Math.round(unit.cohesion), Math.round(unit.y)]),
      events: result.events.map((event) => event.id),
    })).toBe("roman-victory");
    expect(result.assessment?.grades.find((grade) => grade.label === "Reaction drill")?.grade).toBe("A");
    expect(result.assessment?.grades.find((grade) => grade.label === "Chariot defense")?.grade).toBe("A");
  });

  it("marks Parthia as an alternate-history battle with a delayed armored reserve", () => {
    const engine = new BattleEngine("parthia");
    const opening = engine.snapshot();
    expect(opening.battleName).toBe("Beyond Carrhae");
    expect(opening.battleDate).toContain("AU");
    expect(opening.formations.find((unit) => unit.id === "parthian-cataphracts")?.active).toBe(false);

    for (let step = 0; step < 310; step += 1) engine.tick(0.05);
    const crisis = engine.snapshot();
    expect(crisis.formations.find((unit) => unit.id === "parthian-cataphracts")?.active).toBe(true);
    expect(crisis.events.map((event) => event.id)).toContain("cataphracts");
  });

  it("rewards formed infantry, pursuit restraint, and a timed cavalry screen in Parthia", () => {
    const engine = new BattleEngine("parthia");
    for (const id of ["parthia-left", "parthia-center", "parthia-right"]) {
      engine.setFormation(id, "deep");
      engine.order(id, "hold");
    }
    for (let step = 0; step < 310; step += 1) engine.tick(0.05);
    engine.order("roman-cavalry-screen", "charge");
    for (let step = 0; step < 2400 && engine.snapshot().outcome === "undecided"; step += 1) engine.tick(0.05);
    const result = engine.snapshot();
    expect(result.outcome, JSON.stringify({
      time: result.time,
      romans: result.formations.filter((unit) => unit.side === "roman").map((unit) => [unit.id, unit.status, Math.round(unit.strength), Math.round(unit.cohesion), Math.round(unit.y)]),
      parthians: result.formations.filter((unit) => unit.side === "helvetian").map((unit) => [unit.id, unit.status, Math.round(unit.strength), Math.round(unit.cohesion), Math.round(unit.y)]),
      events: result.events.map((event) => event.id),
    })).toBe("roman-victory");
    expect(result.assessment?.grades.find((grade) => grade.label === "Pursuit restraint")?.grade).toBe("A");
    expect(result.assessment?.grades.find((grade) => grade.label === "Cavalry screen")?.grade).toBe("A");
  });

  it("does not award the Parthian epilogue to a passive commander", () => {
    const engine = new BattleEngine("parthia");
    for (let step = 0; step < 2400 && engine.snapshot().outcome === "undecided"; step += 1) engine.tick(0.05);
    expect(engine.snapshot().outcome).toBe("helvetian-victory");
  });

  it("locks orders and formation changes after the battle is decided", () => {
    const engine = new BattleEngine("parthia");
    for (let step = 0; step < 2400 && engine.snapshot().outcome === "undecided"; step += 1) engine.tick(0.05);

    const before = engine.snapshot().formations.find((unit) => unit.id === "parthia-center")!;
    engine.order(before.id, "charge");
    engine.move(before.id, { x: 200, y: 200 });
    engine.setFormation(before.id, "column");
    const after = engine.snapshot().formations.find((unit) => unit.id === before.id)!;

    expect(after).toEqual(before);
  });
});
