import { describe, expect, it } from "vitest";
import { BattleEngine } from "../src/game/simulation";
import { campaignSummary, parseCampaignProgress, recordBattleResult } from "../src/game/progress";

describe("campaign progress", () => {
  it("recovers safely from empty and incompatible local data", () => {
    expect(parseCampaignProgress(null)).toEqual({ version: 1, battles: {} });
    expect(parseCampaignProgress("not-json")).toEqual({ version: 1, battles: {} });
    expect(parseCampaignProgress('{"version":2,"battles":{}}')).toEqual({ version: 1, battles: {} });
  });

  it("records attempts and retains the strongest grade", () => {
    const engine = new BattleEngine("parthia");
    for (let step = 0; step < 2400 && engine.snapshot().outcome === "undecided"; step += 1) engine.tick(0.05);
    const loss = engine.snapshot();
    const once = recordBattleResult({ version: 1, battles: {} }, loss, "2026-08-23T12:00:00.000Z");
    const twice = recordBattleResult(once, { ...loss, assessment: { ...loss.assessment!, overall: "A" }, outcome: "roman-victory" }, "2026-08-23T12:05:00.000Z");

    expect(twice.battles.parthia).toMatchObject({ attempts: 2, victories: 1, bestGrade: "A" });
    expect(campaignSummary(twice)).toEqual({ completed: 1, victories: 1, grade: "A" });
  });
});
