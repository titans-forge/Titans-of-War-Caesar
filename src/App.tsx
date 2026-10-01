import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, ChevronsDown, Crosshair, Flag, Minus, Pause, Play, RotateCcw, Shield, Swords, Trophy, Undo2, ZoomIn } from "lucide-react";
import { Battlefield, type BattlefieldHandle } from "./components/Battlefield";
import { campaignSummary, loadCampaignProgress, recordBattleResult, saveCampaignProgress } from "./game/progress";
import { BattleEngine } from "./game/simulation";
import type { BattleSnapshot, FormationMode, FormationOrder, ScenarioId } from "./game/types";

const initialSnapshot = new BattleEngine().snapshot();

const commandButtons: Array<{ order: FormationOrder; label: string; icon: typeof Shield }> = [
  { order: "hold", label: "Hold", icon: Shield },
  { order: "advance", label: "Advance", icon: ChevronsDown },
  { order: "charge", label: "Charge", icon: Swords },
  { order: "reform", label: "Reform", icon: Crosshair },
  { order: "withdraw", label: "Withdraw", icon: Undo2 },
];

const scenarios: Array<{ id: ScenarioId; date: string; label: string; selected: string }> = [
  { id: "bibracte", date: "58 BC", label: "Bibracte", selected: "legio-x" },
  { id: "sabis", date: "57 BC", label: "The Sabis", selected: "legio-xii" },
  { id: "gergovia", date: "52 BC", label: "Gergovia", selected: "legio-x" },
  { id: "alesia", date: "52 BC", label: "Alesia", selected: "legio-reserve" },
  { id: "pharsalus", date: "48 BC", label: "Pharsalus", selected: "caesar-fourth-line" },
  { id: "alexandria", date: "48 BC", label: "Alexandria", selected: "pharos-column" },
  { id: "zela", date: "47 BC", label: "Zela", selected: "legio-vi" },
  { id: "parthia", date: "44 BC · AU", label: "Parthia", selected: "roman-cavalry-screen" },
];

export default function App() {
  const battlefieldRef = useRef<BattlefieldHandle>(null);
  const contextButtonRef = useRef<HTMLButtonElement>(null);
  const contextPanelRef = useRef<HTMLElement>(null);
  const closeContextButtonRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const recordedResultRef = useRef("");
  const [speed, setSpeed] = useState(0);
  const [preferredSpeed, setPreferredSpeed] = useState(1);
  const [selectedId, setSelectedId] = useState("legio-x");
  const [snapshot, setSnapshot] = useState<BattleSnapshot>(initialSnapshot);
  const [contextOpen, setContextOpen] = useState(false);
  const [confirmProgressReset, setConfirmProgressReset] = useState(false);
  const [scenarioId, setScenarioId] = useState<ScenarioId>("bibracte");
  const [progress, setProgress] = useState(loadCampaignProgress);

  const selected = useMemo(
    () => snapshot.formations.find((formation) => formation.id === selectedId) ?? snapshot.formations[0],
    [selectedId, snapshot.formations],
  );
  const selectableFormations = useMemo(
    () => snapshot.formations.filter((formation) => formation.side === "roman" && formation.active && formation.status !== "broken"),
    [snapshot.formations],
  );
  const progressSummary = useMemo(() => campaignSummary(progress), [progress]);
  const currentRecord = progress.battles[scenarioId];

  const handleSnapshot = useCallback((next: BattleSnapshot) => setSnapshot(next), []);
  const handleSelect = useCallback((id: string) => setSelectedId(id), []);

  useEffect(() => {
    if (snapshot.outcome !== "undecided") setSpeed(0);
  }, [snapshot.outcome]);

  useEffect(() => {
    if (snapshot.outcome === "undecided") {
      recordedResultRef.current = "";
      return;
    }
    const resultKey = `${snapshot.scenarioId}:${snapshot.outcome}:${snapshot.time.toFixed(2)}`;
    if (recordedResultRef.current === resultKey) return;
    recordedResultRef.current = resultKey;
    setProgress((current) => {
      const next = recordBattleResult(current, snapshot);
      saveCampaignProgress(next);
      return next;
    });
  }, [snapshot]);

  useEffect(() => {
    if (!contextOpen) return;
    closeContextButtonRef.current?.focus();
    const handleDialogKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeContext();
        return;
      }
      if (event.key !== "Tab" || !contextPanelRef.current) return;
      const focusable = [...contextPanelRef.current.querySelectorAll<HTMLElement>('button, a[href], [tabindex]:not([tabindex="-1"])')]
        .filter((element) => !element.hasAttribute("disabled"));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable.at(-1)!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleDialogKey);
    return () => document.removeEventListener("keydown", handleDialogKey);
  }, [contextOpen]);

  const openContext = () => {
    restoreFocusRef.current = document.activeElement as HTMLElement;
    setContextOpen(true);
  };

  const closeContext = () => {
    setContextOpen(false);
    setConfirmProgressReset(false);
    window.requestAnimationFrame(() => (restoreFocusRef.current ?? contextButtonRef.current)?.focus());
  };

  const clearCampaignRecord = () => {
    if (!confirmProgressReset) {
      setConfirmProgressReset(true);
      return;
    }
    const cleared = { version: 1 as const, battles: {} };
    setProgress(cleared);
    saveCampaignProgress(cleared);
    setConfirmProgressReset(false);
  };

  const cycleFormation = (direction: -1 | 1) => {
    if (selectableFormations.length === 0) return;
    const currentIndex = selectableFormations.findIndex((formation) => formation.id === selected.id);
    const nextIndex = (Math.max(0, currentIndex) + direction + selectableFormations.length) % selectableFormations.length;
    const next = selectableFormations[nextIndex];
    if (next) setSelectedId(next.id);
  };

  const reset = () => {
    setSpeed(0);
    battlefieldRef.current?.reset();
  };

  const chooseSpeed = (value: number) => {
    setPreferredSpeed(value);
    if (speed > 0) setSpeed(value);
  };

  const selectScenario = (nextScenario: ScenarioId) => {
    if (nextScenario === scenarioId) return;
    setSpeed(0);
    setSelectedId(scenarios.find((scenario) => scenario.id === nextScenario)?.selected ?? "legio-x");
    setScenarioId(nextScenario);
  };

  const nextScenario = scenarios[(scenarios.findIndex((scenario) => scenario.id === scenarioId) + 1) % scenarios.length];
  const enemyLabel = scenarioId === "bibracte" ? "Helvetian" : scenarioId === "sabis" ? "Belgic" : scenarioId === "gergovia" ? "Arvernian" : scenarioId === "alesia" ? "Gallic coalition" : scenarioId === "pharsalus" ? "Pompeian" : scenarioId === "alexandria" ? "Alexandrian" : scenarioId === "parthia" ? "Parthian" : "Pontic";

  return (
    <main className="game-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="standard-mark">SPQR</div>
          <div>
            <h1>Titans of War: Caesar</h1>
            <p>{snapshot.battleName} · {snapshot.battleDate}<span className="record-line">Campaign {progressSummary.completed}/{scenarios.length}{progressSummary.grade ? ` · Grade ${progressSummary.grade}` : ""}</span></p>
          </div>
        </div>
        <div className="campaign-tabs" aria-label="Caesar campaign battles">
          {scenarios.map((scenario) => (
            <button key={scenario.id} aria-label={`${scenario.label}, ${scenario.date}${progress.battles[scenario.id] ? `, best grade ${progress.battles[scenario.id]?.bestGrade}` : ""}`} className={`${scenarioId === scenario.id ? "active" : ""}${scenario.id === "parthia" ? " alternate" : ""}${progress.battles[scenario.id] ? " completed" : ""}${progress.battles[scenario.id]?.victories ? " victorious" : ""}`} onClick={() => selectScenario(scenario.id)}>
              <span>{scenario.date}</span>{scenario.label}
            </button>
          ))}
        </div>
        <div className="top-controls">
          <button className="icon-button" disabled={snapshot.outcome !== "undecided"} onClick={() => setSpeed(speed === 0 ? preferredSpeed : 0)} title={speed === 0 ? "Resume battle" : "Pause battle"}>
            {speed === 0 ? <Play /> : <Pause />}
          </button>
          {[1, 2, 4].map((value) => (
            <button key={value} disabled={snapshot.outcome !== "undecided"} aria-pressed={preferredSpeed === value} className={preferredSpeed === value ? "speed active" : "speed"} onClick={() => chooseSpeed(value)} title={`Set battle speed to ${value}x`}>{value}x</button>
          ))}
          <button ref={contextButtonRef} className="text-button" onClick={openContext}><BookOpen />Historical Context</button>
          <button className="icon-button" onClick={reset} title="Restart battle"><RotateCcw /></button>
        </div>
      </header>

      <section className="battle-region">
        <aside className="unit-rail">
          <p className="rail-label">Selected formation</p>
          <div className="unit-heading">
            <button onClick={() => cycleFormation(-1)} aria-label="Select previous Roman formation" title="Previous formation"><ChevronLeft /></button>
            <h2>{selected.name}</h2>
            <button onClick={() => cycleFormation(1)} aria-label="Select next Roman formation" title="Next formation"><ChevronRight /></button>
          </div>
          {selected.role === "reserve" && <p className="role-marker"><Flag /> {scenarioId === "sabis" ? "Rear column" : scenarioId === "gergovia" ? "Demonstration force" : scenarioId === "alesia" ? "Mobile reserve" : scenarioId === "pharsalus" ? "Concealed fourth line" : scenarioId === "alexandria" ? "Harbor assault column" : scenarioId === "zela" ? "Veteran striking wing" : scenarioId === "parthia" ? "Cavalry screen" : "Roman reserve"}</p>}
          <p className="order-line">Order: <strong>{selected.order}</strong></p>
          <div className="formation-picker" aria-label="Formation depth">
            {(["line", "deep", "column"] as FormationMode[]).map((mode) => (
              <button key={mode} disabled={snapshot.outcome !== "undecided"} className={selected.formationMode === mode ? "active" : ""} onClick={() => battlefieldRef.current?.formation(mode)}>{mode}</button>
            ))}
          </div>
          <p className="formation-note">
            {selected.formationMode === "line" && "Broad attack front; slower to turn."}
            {selected.formationMode === "deep" && "Balanced frontage and staying power."}
            {selected.formationMode === "column" && "Fast on the march; exposed in combat."}
          </p>
          {selected.flanked && <p className="flank-warning">Flank exposed</p>}
          <Meter label="Strength" value={(selected.strength / selected.initialStrength) * 100} display={`${Math.round(selected.strength)} / ${selected.initialStrength}`} tone="red" />
          <Meter label="Cohesion" value={selected.cohesion} display={`${Math.round(selected.cohesion)}%`} tone="gold" />
          <Meter label="Morale" value={selected.morale} display={`${Math.round(selected.morale)}%`} tone="green" />
          <Meter label="Fatigue" value={selected.fatigue} display={`${Math.round(selected.fatigue)}%`} tone="blue" />
          <div className="battle-tally">
            <span>Roman losses <strong>{Math.round(snapshot.romanLosses)}</strong></span>
            <span>{enemyLabel} losses <strong>{Math.round(snapshot.helvetianLosses)}</strong></span>
          </div>
        </aside>

        <Battlefield ref={battlefieldRef} speed={speed} selectedId={selectedId} onSelect={handleSelect} onSnapshot={handleSnapshot} scenarioId={scenarioId} />

        {snapshot.outcome === "undecided" && (
          <section className={`phase-brief phase-${snapshot.phase}`} aria-live="polite">
            <span>{snapshot.phaseTitle}</span>
            <strong>{snapshot.objective}</strong>
            <select className="mobile-scenario-select" aria-label="Select campaign battle" value={scenarioId} onChange={(event) => selectScenario(event.target.value as ScenarioId)}>
              {scenarios.map((scenario) => <option key={scenario.id} value={scenario.id}>{scenario.date} · {scenario.label}{progress.battles[scenario.id] ? ` · ${progress.battles[scenario.id]?.bestGrade}` : ""}</option>)}
            </select>
          </section>
        )}

        {snapshot.events.length > 0 && snapshot.outcome === "undecided" && (
          <aside className="field-dispatch">
            <span>Field dispatch</span>
            <strong>{snapshot.events.at(-1)?.title}</strong>
            <p>{snapshot.events.at(-1)?.detail}</p>
          </aside>
        )}

        <div className="zoom-controls" aria-label="Battlefield zoom">
          <button onClick={() => battlefieldRef.current?.zoom(0.12)} title="Zoom in"><ZoomIn /></button>
          <button onClick={() => battlefieldRef.current?.zoom(-0.12)} title="Zoom out"><Minus /></button>
        </div>

        {speed === 0 && snapshot.time === 0 && snapshot.outcome === "undecided" && (
          <button className="start-battle" onClick={() => setSpeed(preferredSpeed)}><Play /> Begin battle at {preferredSpeed}x</button>
        )}

        {snapshot.outcome !== "undecided" && (
          <div className="outcome-banner">
            <span>After-action report</span>
            <strong>{scenarioId === "gergovia" ? (snapshot.outcome === "roman-victory" ? "The limited operation is complete" : "The uphill assault has been repulsed") : scenarioId === "alesia" ? (snapshot.outcome === "roman-victory" ? "The siege ring holds" : "The investment has been broken") : scenarioId === "pharsalus" ? (snapshot.outcome === "roman-victory" ? "Pompey's line has broken" : "Caesar's right has collapsed") : scenarioId === "alexandria" ? (snapshot.outcome === "roman-victory" ? "The harbor road remains open" : "The Roman quarter is isolated") : scenarioId === "zela" ? (snapshot.outcome === "roman-victory" ? "Came, saw, conquered" : "The unfinished Roman camp is overrun") : scenarioId === "parthia" ? (snapshot.outcome === "roman-victory" ? "The eastern route is secured" : "The expedition repeats Carrhae's danger") : (snapshot.outcome === "roman-victory" ? "The enemy attack has broken" : "The Roman position has collapsed")}</strong>
            {snapshot.assessment && (
              <>
                <div className="assessment-grid">
                  {snapshot.assessment.grades.map((grade) => <Grade key={grade.label} label={grade.label} grade={grade.grade} />)}
                  <Grade label="Overall command" grade={snapshot.assessment.overall} featured />
                </div>
                <p className="assessment-summary">{snapshot.assessment.summary}</p>
                <p className="assessment-lesson">{snapshot.assessment.lesson}</p>
                <p className="campaign-result"><Trophy /> Campaign {progressSummary.completed}/{scenarios.length} · {progressSummary.victories} victories · Grade {progressSummary.grade ?? "—"}{currentRecord ? ` · Best here ${currentRecord.bestGrade}` : ""}</p>
              </>
            )}
            <div className="outcome-actions">
              <button onClick={reset}>Fight again</button>
              <button onClick={() => selectScenario(nextScenario.id)}>Next: {nextScenario.label}</button>
            </div>
          </div>
        )}
      </section>

      <nav className="command-rail" aria-label="Formation commands">
        <p>Select a cohort. Click to move, or drag from its destination to set facing and frontage.</p>
        <div className="command-buttons">
          {commandButtons.map(({ order, label, icon: Icon }) => (
            <button key={order} disabled={snapshot.outcome !== "undecided"} className={selected.order === order ? "command active" : "command"} onClick={() => battlefieldRef.current?.order(order)}>
              <Icon />
              <span>{label}</span>
            </button>
          ))}
        </div>
        <p className="status-copy">{snapshot.outcome !== "undecided" ? "Battle decided" : speed === 0 ? `Orders paused · ${preferredSpeed}x selected` : `Battle running at ${speed}x`}</p>
      </nav>

      {contextOpen && (
        <div className="modal-backdrop" onMouseDown={closeContext}>
          <section ref={contextPanelRef} className="context-panel" onMouseDown={(event) => event.stopPropagation()} aria-modal="true" role="dialog" aria-labelledby="context-title">
            <button ref={closeContextButtonRef} className="close-button" onClick={closeContext} aria-label="Close historical context">×</button>
            <p className="rail-label">Historical context</p>
            {scenarioId === "bibracte" && <BibracteContext />}
            {scenarioId === "sabis" && <SabisContext />}
            {scenarioId === "gergovia" && <GergoviaContext />}
            {scenarioId === "alesia" && <AlesiaContext />}
            {scenarioId === "pharsalus" && <PharsalusContext />}
            {scenarioId === "alexandria" && <AlexandriaContext />}
            {scenarioId === "zela" && <ZelaContext />}
            {scenarioId === "parthia" && <ParthiaContext />}
            <div className="local-record-controls">
              <p className="rail-label">Local campaign record</p>
              <p>Progress stays in this browser. Clearing it does not affect battle access.</p>
              <button onClick={clearCampaignRecord}>{confirmProgressReset ? "Confirm clear record" : "Clear campaign record"}</button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function BibracteContext() {
  return <><h2 id="context-title">The Helvetian campaign</h2><p>In 58 BC, the migrating Helvetii crossed into territory Rome considered strategically sensitive. Caesar used the crisis to move into Gaul with several legions.</p><p>At Bibracte, Caesar reported forming his experienced legions on rising ground while baggage and less experienced troops remained higher on the slope. The Helvetii attacked uphill before the battle became a prolonged contest.</p><p>Caesar then describes Boii and Tulingi forces striking the exposed Roman flank while the main Helvetian body renewed the fight. His third line turned to meet this second danger while the first two lines continued the original action.</p><h3>Command problem</h3><p>Roman discipline favors a steady line and controlled reserves. This scenario compresses Caesar's three legionary lines into three front-line cohorts and X Cohort as the player's reserve.</p><div className="source-note"><strong>Source note:</strong> Caesar, <em>Commentarii de Bello Gallico</em>, Book I, should be read as both a military narrative and Caesar's own political account.</div></>;
}

function SabisContext() {
  return <><h2 id="context-title">The Nervian surprise</h2><p>In 57 BC, the Nervii, Atrebates, and Viromandui waited beyond the Sabis. Caesar says hedges and woodland concealed movement while the Roman column reached its proposed camp in separated elements.</p><p>The attack began before camp construction and deployment were complete. The Ninth and Tenth succeeded on the Roman left, but the Nervii pressed the Twelfth and Seventh, crowded standards, and threatened the camp.</p><h3>Command problem</h3><p>There is no time for a perfect line. Rally the cohorts already present, prevent the right from dissolving, and commit the fresh rear column when it reaches the field.</p><div className="source-note"><strong>Source note:</strong> Caesar, <em>Commentarii de Bello Gallico</em>, Book II. The traditional name Sambre remains familiar, although modern scholarship often identifies the ancient Sabis with the Selle.</div></>;
}

function GergoviaContext() {
  return <><h2 id="context-title">The limit at Gergovia</h2><p>In 52 BC, Vercingetorix held Gergovia on commanding high ground. Caesar judged the oppidum too difficult to storm directly and used maneuver and deception to draw defenders away from part of the position.</p><p>Caesar describes the ensuing action as an opportunity to seize limited ground, not a general battle. Some Roman troops continued beyond the intended objective, signals did not stop the advance, and the slope broke communication between formations. Gallic counterattacks then drove the exposed cohorts back with serious losses.</p><h3>Command problem</h3><p>Take two lower camps while the feint works, then obey the recall. Destruction of the enemy is not the objective. A commander who cannot stop an attack has lost control even while moving forward.</p><div className="source-note"><strong>Source note:</strong> Caesar, <em>Commentarii de Bello Gallico</em>, Book VII, chapters 44-53. Caesar's explanation shifts responsibility toward troops who exceeded orders, so the narrative should be read with the same caution applied to his other reverses.</div></>;
}

function AlesiaContext() {
  return <><h2 id="context-title">An army besieged while besieging</h2><p>After Gergovia, Vercingetorix withdrew into Alesia. Caesar surrounded the hilltop oppidum with an inward-facing line to contain the garrison and an outward-facing line to resist the relief army gathering across Gaul.</p><p>Caesar describes simultaneous pressure from inside and outside. The decisive assault came against works made vulnerable by the terrain. Reserves moved between sectors while troops elsewhere had to hold positions they already knew.</p><h3>Command problem</h3><p>The inner and outer lines must fight independently. Preserve the mobile reserve through the early attacks, then send it against Vercassivellaunus at the weak point before the siege ring opens.</p><div className="source-note"><strong>Source note:</strong> Caesar, <em>Commentarii de Bello Gallico</em>, Book VII, chapters 69-90. The double siege lines are well attested in Caesar's narrative, but his enormous enemy totals and presentation of the final victory serve the political purpose of magnifying the achievement.</div></>;
}

function PharsalusContext() {
  return <><h2 id="context-title">The civil war turns on one reserve</h2><p>In 48 BC, Caesar and Pompey met in Thessaly after a campaign that had already tested both armies. Pompey held the larger cavalry force and concentrated it on his left, opposite Caesar's right.</p><p>Caesar says he recognized the intended envelopment and withdrew cohorts from his third line to form a concealed fourth line. Once Pompey's cavalry drove back Caesar's horse and began to wheel around the flank, this reserve attacked, dispersed the cavalry and unsupported missile troops, then turned into Pompey's infantry.</p><h3>Command problem</h3><p>Roman infantry faces Roman infantry, so a frontal advantage is hard to create. Preserve the fourth line until the cavalry commits, break that maneuver, then redirect the same formed reserve into Pompey's exposed left.</p><div className="source-note"><strong>Source note:</strong> Caesar, <em>Commentarii de Bello Civili</em>, Book III, chapters 84-99. Caesar's sequence is the principal surviving command account, but it is also the victor's political explanation of a civil war battle.</div></>;
}

function AlexandriaContext() {
  return <><h2 id="context-title">A small army inside Alexandria</h2><p>Caesar followed Pompey to Egypt with only a fraction of his army. He entered a divided royal capital, became involved in the dispute between Cleopatra VII and Ptolemy XIII, and soon faced Achillas' much larger force inside the city.</p><p>Caesar's account describes fighting in several streets and an especially dangerous struggle for the fleet and harbor. Unable to guard every Alexandrian warship, he burned the ships and docks, then landed troops on Pharos. Control of the lighthouse island kept the harbor entrance open for corn and reinforcements.</p><h3>Command problem</h3><p>The palace is the political center, the dockyard is the supply base, and Pharos is the sea gate. Fixed cohorts must hold their own streets while one mobile column takes the harbor key.</p><div className="source-note"><strong>Source note:</strong> Caesar, <em>Commentarii de Bello Civili</em>, Book III, chapters 106-112, followed by the anonymous <em>Alexandrian War</em>. Both works present the Roman operational viewpoint; exact troop totals, urban geometry, and the extent of the famous fire remain disputed.</div></>;
}

function ZelaContext() {
  return <><h2 id="context-title">A battle before the camp was finished</h2><p>After leaving Egypt, Caesar hurried into Pontus with a small, uneven army. The veteran Sixth Legion numbered fewer than one thousand men; the remaining formations included troops previously defeated by Pharnaces and a Galatian legion trained in Roman fashion.</p><p>Caesar seized a ridge opposite Pharnaces and began fortifying it. The ancient account says Pharnaces unexpectedly descended into the ravine and climbed toward the unfinished Roman position. Caesar recalled troops from construction, formed them under pressure, and stopped the scythed chariots with missiles before the infantry collision.</p><h3>Command problem</h3><p>Turn workers into a battle line before the attack reaches the works. Blunt the chariots with formed troops, let the veteran Sixth Legion begin the recovery on the right, then carry the counterattack across the ravine and into the Pontic camp.</p><div className="source-note"><strong>Source note:</strong> The anonymous <em>Alexandrian War</em>, chapters 65-78, is the principal tactical narrative and presents Caesar's side. Plutarch preserves the later association between the rapid victory and <em>veni, vidi, vici</em>. Exact numbers and the author's providential explanation should be treated cautiously.</div></>;
}

function ParthiaContext() {
  return <><p className="counterfactual-label">Alternate-history command exercise</p><h2 id="context-title">The campaign that never happened</h2><p>Caesar was preparing an eastern expedition when he was assassinated in 44 BC. Suetonius says the projected advance would pass through Lesser Armenia and that Caesar intended to test Parthian strength before risking a major battle. Appian likewise records preparations against the Getae and Parthians.</p><p>No source can tell us the battle Caesar would have fought. This scenario therefore combines documented Roman intentions with the military problems demonstrated at Carrhae and in later Roman-Parthian wars: mobile horse archers, armored cavalry, long supply lines, and an enemy able to refuse close battle.</p><h3>Command problem</h3><p>Secure the camp, water, and line of march. Form the infantry against sustained archery, refuse the false retreat, and preserve the auxiliary cavalry screen until the cataphracts commit. Victory is operational security, not the imaginary conquest of Parthia in one afternoon.</p><div className="source-note"><strong>Historical boundary:</strong> Caesar's intended expedition is historical; this battlefield, force arrangement, and outcome are explicitly counterfactual. Sources: Suetonius, <em>Julius Caesar</em> 44.3; Appian, <em>Civil Wars</em> 2.110; Plutarch, <em>Caesar</em> 58.</div></>;
}

function Meter({ label, value, display, tone }: { label: string; value: number; display: string; tone: string }) {
  return (
    <div className="meter">
      <div><span>{label}</span><strong>{display}</strong></div>
      <div className="meter-track"><span className={tone} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>
    </div>
  );
}

function Grade({ label, grade, featured = false }: { label: string; grade: string; featured?: boolean }) {
  return <div className={featured ? "grade featured" : "grade"}><span>{label}</span><strong>{grade}</strong></div>;
}
