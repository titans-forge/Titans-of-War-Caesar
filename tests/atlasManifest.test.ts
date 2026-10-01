import { describe, expect, it } from "vitest";
import romanAtlas from "../public/unit-atlases/roman-infantry.json";
import gallicAtlas from "../public/unit-atlases/gallic-infantry.json";
import hellenisticAtlas from "../public/unit-atlases/hellenistic-infantry.json";
import missileAtlas from "../public/unit-atlases/missile-infantry.json";
import auxiliaryCavalryAtlas from "../public/unit-atlases/auxiliary-cavalry.json";
import horseArcherAtlas from "../public/unit-atlases/horse-archer.json";
import cataphractAtlas from "../public/unit-atlases/cataphract.json";
import chariotAtlas from "../public/unit-atlases/scythed-chariot.json";

const expectedFrames = { idle: 2, walk: 4, attack: 4, route: 4, fall: 5 };

describe("Formation V2 atlas manifests", () => {
  const atlases = [
    ["Roman", romanAtlas],
    ["Gallic", gallicAtlas],
    ["Hellenistic", hellenisticAtlas],
    ["Missile", missileAtlas],
    ["Auxiliary cavalry", auxiliaryCavalryAtlas],
    ["Horse archer", horseArcherAtlas],
    ["Cataphract", cataphractAtlas],
    ["Scythed chariot", chariotAtlas],
  ] as const;

  for (const [name, atlas] of atlases) {
    it(`${name} atlas contains every state and direction`, () => {
      expect(Object.keys(atlas.frames)).toHaveLength(152);
      for (const [state, count] of Object.entries(expectedFrames)) {
        for (let direction = 0; direction < 8; direction += 1) {
          for (let frame = 0; frame < count; frame += 1) {
            expect(atlas.frames).toHaveProperty(`${state}/d${direction}/f${frame}`);
          }
        }
      }
    });
  }
});
