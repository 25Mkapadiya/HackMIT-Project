import type { StateDefinition } from "@/lib/types";
import { WASHINGTON } from "./washington";
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
const STUB_STATES: StateDefinition[] = US_STATES_DIRECTORY.filter((s) => s.abbreviation !== "WA").map((s) => ({
  id: s.id,
  name: s.name,
  abbreviation: s.abbreviation,
  bounds: s.bounds,
  center: s.center,
  defaultZoom: 6,
  layers: [],
  enabled: false,
}));

export const STATE_REGISTRY: StateDefinition[] = [WASHINGTON, ...STUB_STATES].sort((a, b) =>
  a.name.localeCompare(b.name)
);

export function getState(id: string): StateDefinition | undefined {
  return STATE_REGISTRY.find((s) => s.id === id);
}

export function getEnabledStates(): StateDefinition[] {
  return STATE_REGISTRY.filter((s) => s.enabled);
}

export const DEFAULT_STATE_ID = "washington";
