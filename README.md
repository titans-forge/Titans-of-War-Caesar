# Titans of War: Caesar

> **Current licensing policy — Forge Game License 2.0 (FG2-TITANS-OF-WAR-CAESAR-20261015).** This licensing-only edition requires separate permission for either public hosting or AI training by above-threshold entities on qualifying new Forge-controlled material. Previously supplied gameplay/media retain MIT, earlier Forge and other applicable grants. No retroactive restriction is claimed. See [release scope](LICENSING.md), [complete current terms](LICENSE), [preserved prior terms](LICENSE-LEGACY-PRE-FORGE-2.0.txt), [offline licensing page](FORGE-LICENSING.html) and [new download](https://github.com/titans-forge/Titans-of-War-Caesar/releases/tag/forge-license-2.0-20261015). Earlier statements below describe the earlier game and preserved grants.


[Play](https://titans-forge.itch.io/titans-of-war-caesar) · [Game collection](https://github.com/titans-forge/educational-games)

The upgraded edition's current release policy is [Forge Game Hosting License 1.0](LICENSE).
See [the licensing checkpoint](LICENSING.md) for covered material and retained
earlier grants. The owner-confirmed image-provider record is included in
`docs/MEDIA_PROVIDER_CONFIRMATION.json`.

An experimental formation-based historical strategy game. The historical campaign recreates seven command problems from Bibracte in 58 BC through Zela in 47 BC. A separately marked alternate-history epilogue explores Caesar's planned Parthian expedition in 44 BC.

## Run locally

```bash
npm ci
npm run dev
```

## First-build controls

- Click a Roman cohort to select it.
- Click the battlefield to issue a movement order, or drag across it to set the formation's destination, facing, and frontage.
- Choose Line for greater attack frontage, Deep for balanced staying power, or Column for faster movement at greater combat risk.
- Use Hold, Advance, Charge, Reform, and Withdraw to change behavior.
- Pause or change battle speed from the top rail.
- Select a speed before the battle without starting it; Begin Battle or Play starts at the selected speed.
- Use the mouse wheel or zoom buttons to inspect formations.
- Use the arrow buttons around the formation name to cycle Roman units with a keyboard or on mobile.
- On mobile, use the battle menu in the objective panel to jump directly between scenarios.

## Campaign record

Each resolved battle records attempts, victories, and the best overall command grade in versioned browser storage. The campaign header shows completed battles and the average of their best grades. This record never locks a scenario or changes battle difficulty.

Open Historical Context and use **Clear campaign record** to remove the local record. No account, server, telemetry, or internet connection is required after the game has loaded.

## Bibracte command problem

The battle now progresses through opening deployment, the main clash, a flank crisis, and the final decision. Keep X Cohort available when the Boii and Tulingi force appears on the Roman right. Victory requires routing three opposing formations, including the flank force, while preserving at least two Roman cohorts.

The after-action report grades line integrity, casualty control, reserve handling, and overall command. The scenario compresses Caesar's reported three legionary lines into four controllable cohorts; it is a tactical teaching model rather than a literal order of battle.

Bibracte established the Formation V2 battlefield used across all eight scenarios. Its figures are globally
depth-sorted against the terrain, remain upright during diagonal movement, use
eight-direction walk/contact/route/fall atlases, and contract as representative
strength falls. Development builds can append `?renderer=legacy` for an A/B
comparison; release builds always use Formation V2 throughout the campaign.

## The Sabis command problem

The Nervii and their allies attack while the Roman camp and formation are incomplete. Rally the scattered cohorts, stabilize the Twelfth and Seventh on the exposed right, and commit the fresh rear column once it appears. This battle grades line survival, casualties, speed of rally, reinforcement use, and overall command.

The familiar name "Sambre" remains common, although the ancient Sabis is often identified with the Selle. See [docs/SOURCES.md](docs/SOURCES.md) for the primary-source and interpretation notes used by the scenarios.

## Gergovia command problem

Caesar's feint opens the lower Gallic camps, but the plateau remains a lethal objective. Seize two lower positions and then obey the recall before the operation becomes an unsupported uphill assault. This stage rewards command restraint, signal discipline, preservation, and the ability to stop successful troops.

## Alesia command problem

The besiegers are themselves surrounded. Fixed cohorts must hold the inward-facing line against sorties and the outward-facing works against the relief army. Keep the mobile reserve in hand until Vercassivellaunus attacks the vulnerable sector, reform it out of column, and commit it to the decisive breach.

The simulation tracks formation strength, facing, frontage, cohesion, morale, fatigue, contact, flank exposure, casualties, and routing independently from the rendered soldier count. Nearby steady formations provide support, while columns and exposed flanks suffer sharply in close combat.

## Pharsalus command problem

Roman infantry now faces Roman infantry. Pompey concentrates his cavalry and missile troops against Caesar's right while Caesar removes cohorts from the third line to form a fourth. Hold that reserve out of the opening infantry collision, counter the cavalry when it begins the enveloping move, then turn the same cohorts into Pompey's exposed left.

Pompeian formations use the Roman soldier art with a cool steel tint, preserving the visual fact that this is civil war while keeping command ownership immediately readable. The report grades infantry endurance, the cavalry counter, reserve timing, flank conversion, and casualties.

## Alexandria command problem

Caesar's small force must defend three disconnected urban strongpoints: the palace quarter, central street, and dockyard. These fixed cohorts gain defensive value by holding their ground. After the harbor warning, reform the dedicated Pharos column out of marching order, seize the lighthouse garrison, and hold the sea gate against the royal counterattack.

The scenario is won through control rather than general destruction. Losing either the palace or dockyard ends the operation even if enemy casualties are high. The report grades urban defense, harbor control, Pharos timing, and preservation of Caesar's limited manpower.

## Zela command problem

Pharnaces attacks while Caesar's cohorts are still fortifying their captured ridge. The Roman formations begin in working columns rather than battle order. Form at least three into line, hold against the scythed chariots, and wait until their shock has failed before committing the veteran Sixth Legion.

Stopping the surprise is only the first half of the battle. Legio VI must break the Pontic right and carry the counterattack across the ravine into Pharnaces' camp. The report grades reaction drill, chariot defense, Sixth Legion timing, camp assault, and casualties.

## Beyond Carrhae alternate-history epilogue

Caesar survives the Ides of March and advances through Lesser Armenia toward Parthia. This is explicitly a counterfactual command exercise: the intended expedition is documented, but the battlefield and outcome are not.

Horse archers harass from outside close-combat range and withdraw from pursuit. Keep three infantry groups formed around the camp and water route, refuse the chase, and preserve the auxiliary cavalry screen until the royal cataphracts commit. Victory means securing the army's route rather than claiming the conquest of Parthia in one battle.

## Build and package

```bash
npm run check
npm run release:itch
```

The release command creates an itch.io-ready HTML5 ZIP, SHA-256 checksum, and release manifest under `release/`. `index.html` is verified at the archive root.

The package remains deliberately marked `private` because this project is distributed through GitHub and itch.io rather than npm. That setting prevents accidental `npm publish`; it does not restrict source-code access.

The optional offline formation-art pipeline is documented in
[`art-source/README.md`](art-source/README.md). Blender is only needed to edit
or reproduce the source atlases, not to run the game.

## License and media

Previously supplied code and written game content retain MIT permissions; current policy is in `LICENSING.md`. Generated visual assets are governed separately; see [MEDIA_RIGHTS.md](MEDIA_RIGHTS.md). Historical claims, primary sources, and scenario abstractions are documented in [docs/SOURCES.md](docs/SOURCES.md).

## Status

This is an experimental game containing a seven-battle historical campaign and
a clearly bounded counterfactual epilogue. The retained image-provider and
procedural-art records are described in `MEDIA_RIGHTS.md`; no validated learning
outcome or complete historical reconstruction is claimed.
