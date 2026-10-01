# Caesar Campaign Vertical Slice Fidelity Ledger

Reverified August 23, 2026 at 1280 x 720 and 390 x 844. Coverage includes all seven historical battle openings plus the separately marked Parthian counterfactual, campaign switching, delayed reserves, objective transitions, loss reports, and responsive controls.

| Area | Concept target | Implemented result |
|---|---|---|
| Battlefield priority | Roughly three quarters of the screen remains terrain | The WebGL battlefield occupies the full center band with only one compact status rail over it |
| Formation readability | Roman rectangles oppose looser enemy ranks, while specialist troops remain identifiable | Formation V2 renders up to 48 representative infantry or 16 mounted figures per formation with line, deep, and column footprints across all eight scenarios |
| Command hierarchy | Five primary orders in a narrow bottom rail | Hold, Advance, Charge, Reform, and Withdraw share one stable rectangular control family |
| Tactical feedback | Selected formation, movement direction, and contact are visible | Every scenario uses projected ground selection, upright directional figures, front-rank attack cycles, deterministic contact-facing casualties, temporary fallen figures, flank warnings, and routing scatter |
| Scenario structure | The battle presents a specific command problem rather than a generic collision | Four phases, a delayed flank force, changing objectives, field dispatches, and objective-based victory now frame the freeform battle |
| Campaign extension | A second battle should change the command problem, not only the labels | The Sabis adds surprise, low starting cohesion, immediate attack, a threatened right, delayed Roman reinforcement, separate grading, and dedicated river terrain |
| Command restraint | Later battles should not all reward annihilation | Gergovia requires a limited seizure followed by withdrawal; climbing past the objective triggers overextension and defeat |
| Two-front defense | A culminating battle should test sector command and reserve economy | Alesia attacks the inner and outer works in timed waves, then makes a mobile reserve decisive at the vulnerable sector |
| Civil War transition | A new act should change both faction identity and tactical problem | Pharsalus opposes two disciplined Roman lines, distinguishes Pompeian troops with a steel tint, and makes a two-step fourth-line counter decisive |
| Urban and harbor command | The eastern campaign should not become another open-field collision | Alexandria separates palace, street, dockyard, and Pharos obligations; victory depends on preserving political and maritime access |
| Surprise while fortifying | Speed should mean transitions under pressure, not indiscriminate charging | Zela starts every Roman formation in working column, requires a formed missile line against scythed chariots, and makes the Sixth Legion's later counterattack decisive |
| Counterfactual boundary | Alternate history must teach a real problem without presenting invention as an event | Beyond Carrhae carries an AU marker, identifies the documentary boundary in context, and rewards route security, anti-missile discipline, pursuit restraint, and cavalry screening |
| Learning feedback | Results explain command quality | The after-action report separately grades line integrity, losses, reserve handling, and overall command, then states the tactical lesson |
| Visual language | Charcoal, antique gold, oxblood, and natural terrain | Palette, borders, serif battlefield typography, and generated assets remain consistent with the concept |
| Information density | Strength, cohesion, morale, and fatigue remain legible | Selected-cohort rail updates all four values without obscuring the main line of advance |
| Responsive behavior | Controls remain usable on portrait mobile | Top controls simplify, command buttons retain all five orders, and status remains readable at 390 x 844 |

## Copy check

The primary title, battle, objective, historical-context control, and five command labels match the concept. Additional visible copy is limited to required gameplay feedback: selected formation, losses, pause state, and the first-run Begin Battle control.

## Intentional deviations

- The first slice displays four Roman cohorts and five Helvetian formations rather than the larger armies suggested by the concept. This keeps the simulation and command problem readable while the combat engine is being proven.
- Line, deep, and column formations are intentionally legible abstractions. Their frontage, movement, attack, and exposure tradeoffs are simulated without claiming drill-manual precision for every cohort.
- Caesar's three-line deployment is compressed into three front-line cohorts and X Cohort as a visible reserve. The Boii and Tulingi appearance is delayed to reproduce the reported command problem without claiming exact battlefield timing.
- The Sabis uses cohort-sized formations as readable proxies for larger legionary elements. Its familiar older name, the Sambre, is not presented as a settled modern location identification.
- Gergovia compresses a larger operation into two lower objectives, four cohorts, and a visible recall. Its plateau geometry and timings are educational abstractions, not a claim of exact reconstruction.
- Alesia renders circumvallation and contravallation as readable tactical belts. Five formations and three attack waves stand in for the much larger siege and relief battle.
- Pharsalus compresses Caesar's fourth line into one selectable reserve and Pompey's cavalry, archers, and slingers into two formations. Its timed cavalry sweep teaches the reported sequence without claiming exact battlefield timing or numbers.
- Alexandria uses four Roman formations and five Alexandrian groups as readable proxies for a much larger urban conflict. Its palace quarter, harbor, causeway, and lighthouse are spatial teaching aids rather than an exact archaeological plan.
- Zela compresses working parties, legions, scythed chariots, and Pharnaces' camp into nine formations. The opposing ridges, ravine, reaction window, and Sixth Legion attack teach the reported sequence rather than reconstructing exact distances or troop totals.
- Beyond Carrhae is not a reconstruction. Its terrain and force arrangement are an explicit composite built around Caesar's documented expedition preparations and recurring Roman-Parthian command problems.
- Bibracte was the Formation V2 approval slice. All eight scenarios now use repository-authored Blender geometry rendered into eight-direction `idle`, `walk`, `attack`, `route`, and `fall` atlases. Displayed soldiers remain representative figures, not a literal order of battle.
- Every displayed soldier is a representative figure. Visible figure count follows formation strength proportionally but is not a literal order of battle or a claim about exact rank count.
- The mobile battlefield is intentionally cropped and zoomable rather than shrinking the entire army below a useful interaction size.

No material desktop layout mismatch remains. The core path from selection to order, phase transition, delayed flank appearance, reserve commitment, contact, casualties, routing, decision, and graded after-action report was verified in the browser without console warnings or errors. A deterministic disciplined-command test also proves a Roman victory path remains available.
