import type { StateDefinition } from "@/lib/types";
import { WASHINGTON } from "./washington";

/**
 * Adding a new state is meant to be exactly this: build a StateDefinition
 * (bounds, center, layer list backed by that state's own sources + API
 * routes under app/api/gis/[layerId] or a state-specific namespace) and
 * register it here. Nothing in the map, layer panel, or analysis engine
 * needs to change — they all read from this registry / the active
 * StateDefinition's layer list.
 */
export const STATE_REGISTRY: StateDefinition[] = [WASHINGTON];

export function getState(id: string): StateDefinition | undefined {
  return STATE_REGISTRY.find((s) => s.id === id);
}

export function getEnabledStates(): StateDefinition[] {
  return STATE_REGISTRY.filter((s) => s.enabled);
}

export const DEFAULT_STATE_ID = "washington";
