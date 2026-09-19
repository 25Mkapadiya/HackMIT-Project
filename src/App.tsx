import { useMemo, useState } from "react";
import { useGeoData } from "./lib/useGeoData";
import {
  computeCountyFactors,
  DEFAULT_WEIGHTS,
  scoreFromFactors,
} from "./lib/scoring";
import type { CountyFactors } from "./lib/scoring";
import { metersForState } from "./lib/simulation";
import type { CountyScore, Placement, ScenarioInputs } from "./lib/types";
import stateNotes from "./data/state-notes.json";
import USMap from "./components/USMap";
import StateMap from "./components/StateMap";
import ControlsPanel from "./components/ControlsPanel";
import DetailPanel from "./components/DetailPanel";
import TopList from "./components/TopList";
import StateResourcesPanel from "./components/StateResourcesPanel";
import Legend from "./components/Legend";

export default function App() {
  const { data, error } = useGeoData();

  const [inputs, setInputs] = useState<ScenarioInputs>({
    loadMW: 150,
    interconnect: "grid-tied",
    cooling: "air",
    weights: DEFAULT_WEIGHTS,
  });

  const [selectedStateFips, setSelectedStateFips] = useState<string | null>(null);
  const [selectedStatePostal, setSelectedStatePostal] = useState<string | null>(null);
  const [hoveredStateFips, setHoveredStateFips] = useState<string | null>(null);
  const [selectedCountyFips, setSelectedCountyFips] = useState<string | null>(null);
  const [hoveredCountyFips, setHoveredCountyFips] = useState<string | null>(null);
  const [placements, setPlacements] = useState<Placement[]>([]);

  // Geography-derived factors, computed once per county when data loads —
  // independent of the scenario weights so slider drags stay cheap.
  const factorsByFips = useMemo<Map<string, CountyFactors>>(() => {
    const map = new Map<string, CountyFactors>();
    if (!data) return map;
    for (const f of data.counties.features) {
      map.set(f.properties.fips, computeCountyFactors(f));
    }
    return map;
  }, [data]);

  const scoresByFips = useMemo<Map<string, CountyScore>>(() => {
    const map = new Map<string, CountyScore>();
    for (const [fips, factors] of factorsByFips) {
      map.set(fips, scoreFromFactors(factors, inputs));
    }
    return map;
  }, [factorsByFips, inputs]);

  const stateAvgScore = useMemo(() => {
    const sums = new Map<string, { total: number; count: number }>();
    if (!data) return new Map<string, number>();
    for (const f of data.counties.features) {
      const s = scoresByFips.get(f.properties.fips);
      if (!s || s.blocked) continue;
      const entry = sums.get(f.properties.stateFips) ?? { total: 0, count: 0 };
      entry.total += s.score;
      entry.count += 1;
      sums.set(f.properties.stateFips, entry);
    }
    const out = new Map<string, number>();
    for (const [fips, { total, count }] of sums) {
      if (count > 0) out.set(fips, total / count);
    }
    return out;
  }, [data, scoresByFips]);

  const countiesInState = useMemo(() => {
    if (!data || !selectedStateFips) return null;
    return {
      type: "FeatureCollection" as const,
      features: data.counties.features.filter(
        (f) => f.properties.stateFips === selectedStateFips
      ),
    };
  }, [data, selectedStateFips]);

  const scoresInState = useMemo(() => {
    if (!countiesInState) return [];
    return countiesInState.features
      .map((f) => scoresByFips.get(f.properties.fips))
      .filter((s): s is CountyScore => !!s);
  }, [countiesInState, scoresByFips]);

  const selectedCountyScore = selectedCountyFips
    ? scoresByFips.get(selectedCountyFips) ?? null
    : null;

  const stateHasCustomRules = selectedStatePostal
    ? Object.prototype.hasOwnProperty.call(stateNotes, selectedStatePostal)
    : false;

  const selectedStateName = useMemo(() => {
    if (!data || !selectedStateFips) return null;
    return (
      data.states.features.find((f) => f.properties.fips === selectedStateFips)
        ?.properties.name ?? null
    );
  }, [data, selectedStateFips]);

  const placementsInState = useMemo(
    () => placements.filter((p) => p.stateFips === selectedStateFips),
    [placements, selectedStateFips]
  );
  const placedFipsInState = useMemo(
    () => new Set(placementsInState.map((p) => p.countyFips)),
    [placementsInState]
  );

  const stateMeters = useMemo(() => {
    if (!selectedStateFips) return null;
    return metersForState(
      selectedStatePostal,
      stateAvgScore.get(selectedStateFips) ?? 50,
      placementsInState
    );
  }, [selectedStateFips, selectedStatePostal, stateAvgScore, placementsInState]);

  const isSelectedCountyPlaced = selectedCountyFips
    ? placedFipsInState.has(selectedCountyFips)
    : false;

  function handleSelectState(fips: string, postal: string | null) {
    setSelectedStateFips(fips);
    setSelectedStatePostal(postal);
    setSelectedCountyFips(null);
  }

  function handleBack() {
    setSelectedStateFips(null);
    setSelectedStatePostal(null);
    setSelectedCountyFips(null);
  }

  function handlePlace() {
    if (!selectedStateFips || !selectedCountyFips || !selectedCountyScore) return;
    if (selectedCountyScore.blocked || isSelectedCountyPlaced) return;
    const placement: Placement = {
      id: `${selectedCountyFips}-${Date.now()}`,
      stateFips: selectedStateFips,
      countyFips: selectedCountyFips,
      countyName: selectedCountyScore.name,
      loadMW: inputs.loadMW,
      interconnect: inputs.interconnect,
      cooling: inputs.cooling,
      score: selectedCountyScore.score,
      tier: selectedCountyScore.tier.cls,
    };
    setPlacements((prev) => [...prev, placement]);
  }

  function handleResetState() {
    setPlacements((prev) => prev.filter((p) => p.stateFips !== selectedStateFips));
  }

  function handleDemo(kind: "good" | "bad") {
    let pick: CountyScore | undefined;
    if (kind === "good") {
      pick = scoresInState
        .filter((s) => !s.blocked)
        .reduce<CountyScore | undefined>(
          (best, s) => (!best || s.score > best.score ? s : best),
          undefined
        );
    } else {
      const blocked = scoresInState.filter((s) => s.blocked);
      pick = blocked[0] ??
        scoresInState
          .filter((s) => !s.blocked)
          .reduce<CountyScore | undefined>(
            (worst, s) => (!worst || s.score < worst.score ? s : worst),
            undefined
          );
    }
    if (!pick) return;
    handleResetState();
    setSelectedCountyFips(pick.fips);
  }

  if (error) {
    return <div className="load-error">Failed to load map data: {error}</div>;
  }
  if (!data) {
    return <div className="load-error">Loading nationwide county data…</div>;
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-left">
          <div className="title">Datacenter Siting Advisor</div>
          <div className="subtitle">
            {selectedStateName
              ? `${selectedStateName} — county-level siting scores`
              : "United States — click a state to drill into counties"}
          </div>
        </div>
        <div className="topbar-right">
          {selectedStateFips && (
            <button className="btn btn-ghost" onClick={handleBack}>
              ← Back to US map
            </button>
          )}
        </div>
      </header>

      <div className="layout">
        <div className="map-col">
          <div className="map-card">
            {selectedStateFips && countiesInState ? (
              <StateMap
                counties={countiesInState}
                scores={scoresByFips}
                selectedFips={selectedCountyFips}
                hoveredFips={hoveredCountyFips}
                placedFips={placedFipsInState}
                onHover={setHoveredCountyFips}
                onSelect={setSelectedCountyFips}
              />
            ) : (
              <USMap
                states={data.states}
                stateAvgScore={stateAvgScore}
                selectedFips={selectedStateFips}
                hoveredFips={hoveredStateFips}
                onHover={setHoveredStateFips}
                onSelect={handleSelectState}
              />
            )}
            <Legend />
            <p className="map-note">
              County boundaries from Census TIGER/Line (via us-atlas). Grid-proximity,
              carbon-intensity and land-availability factors are precomputed from real
              geometry plus an illustrative reference dataset — see README for what's
              real vs. a stand-in.
            </p>
          </div>
        </div>

        <div className="side-col">
          <ControlsPanel inputs={inputs} onChange={setInputs} />
          <DetailPanel
            score={selectedCountyScore}
            stateHasCustomRules={stateHasCustomRules}
            isPlaced={isSelectedCountyPlaced}
            onPlace={handlePlace}
          />
          {selectedStateFips && stateMeters && (
            <StateResourcesPanel
              stateName={selectedStateName ?? "Selected state"}
              meters={stateMeters}
              placedCount={placementsInState.length}
              onReset={handleResetState}
              onDemoGood={() => handleDemo("good")}
              onDemoBad={() => handleDemo("bad")}
            />
          )}
          {selectedStateFips && (
            <TopList
              scores={scoresInState}
              selectedFips={selectedCountyFips}
              onSelect={setSelectedCountyFips}
            />
          )}
        </div>
      </div>
    </div>
  );
}
