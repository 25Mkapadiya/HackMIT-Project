import type { StateDefinition } from "@/lib/types";
import { WASHINGTON } from "./washington";
import { OKLAHOMA } from "./oklahoma";
import { ARKANSAS } from "./arkansas";
import { LOUISIANA } from "./louisiana";
import { MISSISSIPPI } from "./mississippi";
import { ALABAMA } from "./alabama";
import { TENNESSEE } from "./tennessee";
import { KENTUCKY } from "./kentucky";
import { FLORIDA } from "./florida";
import { GEORGIA } from "./georgia";
import { SOUTH_CAROLINA } from "./southcarolina";
import { NORTH_CAROLINA } from "./northcarolina";
import { VIRGINIA } from "./virginia";
import { WEST_VIRGINIA } from "./westvirginia";
import { MARYLAND } from "./maryland";
import { TEXAS } from "./texas";
import { DELAWARE } from "./delaware";
import { ILLINOIS } from "./illinois";
import { MISSOURI } from "./missouri";
import { MAINE } from "./maine";
import { NEW_HAMPSHIRE } from "./newhampshire";
import { VERMONT } from "./vermont";
import { MASSACHUSETTS } from "./massachusetts";
import { US_STATES_DIRECTORY } from "./directory";

/**
 * Adding a new state with a full live analysis experience is meant to be
 * exactly this: build a StateDefinition (bounds, center, layer list backed
 * by that state's own sources + API routes under app/api/gis/[layerId] or a
 * state-specific namespace), then replace its stub entry below with it.
 * Nothing in the map, layer panel, or analysis engine needs to change — they
 * all read from this registry / the active StateDefinition's layer list.
 *
 * Every other state below is a real place (name/abbreviation/bounds derived
 * from actual Census boundary data — see src/states/directory.ts) with no
 * layers and enabled: false, so the state picker can show the full country
 * and fly the map to any of them, without claiming analysis coverage that
 * doesn't exist yet.
 */
const LIVE_STATES: StateDefinition[] = [
  WASHINGTON,
  OKLAHOMA,
  ARKANSAS,
  LOUISIANA,
  MISSISSIPPI,
  ALABAMA,
  TENNESSEE,
  KENTUCKY,
  FLORIDA,
  GEORGIA,
  SOUTH_CAROLINA,
  NORTH_CAROLINA,
  VIRGINIA,
  WEST_VIRGINIA,
  MARYLAND,
  TEXAS,
  DELAWARE,
  MISSOURI,
  ILLINOIS,
  MAINE,
  NEW_HAMPSHIRE,
  VERMONT,
  MASSACHUSETTS,
];
const LIVE_ABBREVIATIONS = new Set(LIVE_STATES.map((s) => s.abbreviation));
const STUB_STATES: StateDefinition[] = US_STATES_DIRECTORY.filter((s) => !LIVE_ABBREVIATIONS.has(s.abbreviation)).map(
  (s) => ({
    id: s.id,
    name: s.name,
    abbreviation: s.abbreviation,
    bounds: s.bounds,
    center: s.center,
    defaultZoom: 6,
    layers: [],
    enabled: false,
  })
);

export const STATE_REGISTRY: StateDefinition[] = [...LIVE_STATES, ...STUB_STATES].sort((a, b) =>
  a.name.localeCompare(b.name)
);

export function getState(id: string): StateDefinition | undefined {
  return STATE_REGISTRY.find((s) => s.id === id);
}

export function getEnabledStates(): StateDefinition[] {
  return STATE_REGISTRY.filter((s) => s.enabled);
}

export const DEFAULT_STATE_ID = "washington";
