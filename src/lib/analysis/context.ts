import type { SourceMeta } from "@/lib/types";
import type { Bbox, LayerFetcher } from "@/lib/gis/types";
import type { FeatureCollection, Geometry } from "geojson";

/**
 * Everything the (state-agnostic) analysis engine needs to know about the
 * state a scenario was proposed in. Built once per state under
 * src/states/<state>/analysisContext.ts and looked up by scenario.stateId —
 * see getAnalysisContext() below. Adding a state means adding one of these,
 * not touching power.ts/water.ts/land.ts/etc.
 */
export interface StateAnalysisContext {
  /** Matches StateDefinition.id in the registry, e.g. "washington". */
  stateId: string;
  /** USPS abbreviation — also the Supabase state_code used by utilities/hazards/incentives/existing_data_centers. */
  stateCode: string;
  bounds: [[number, number], [number, number]];
  /** Keyed by the same generic layer-concept ids as LayerDefinition.id (e.g. "transmission-lines"). */
  fetchers: Partial<Record<string, LayerFetcher<any>>>;
  /** Keyed by a stable role name (e.g. "transmission", "eia") read directly by the analysis modules. */
  sources: Partial<Record<string, SourceMeta>>;
  /** State-specific environmental-review regulatory context sentence (e.g. WA's SEPA, MN's MEPA/EAW). Falls back to a generic line when absent. */
  environmentalReviewNote?: string;
  /** State-specific general permitting-context paragraph shown in the Regulation section. Falls back to a generic line when absent. */
  permittingNote?: string;
}

/**
 * Runs a named layer fetcher if this state has one, otherwise returns an
 * empty FeatureCollection — the same "unavailable" signal a live fetch
 * failure already produces, so every downstream Metric degrades to UNKNOWN
 * instead of the pipeline throwing when a state simply doesn't have a layer.
 */
export async function fetchLayer<P = Record<string, unknown>>(
  ctx: StateAnalysisContext,
  layerId: string,
  bbox: Bbox
): Promise<FeatureCollection<Geometry, P>> {
  const fetcher = ctx.fetchers[layerId];
  if (!fetcher) return { type: "FeatureCollection", features: [] };
  return (await fetcher(bbox)) as FeatureCollection<Geometry, P>;
}

/** A placeholder SourceMeta for a role a state's context doesn't define, so Metric.source is never undefined. */
export function unavailableSource(stateCode: string, roleLabel: string): SourceMeta {
  return {
    id: `unavailable-${stateCode.toLowerCase()}-${roleLabel}`,
    name: `${roleLabel} (no source integrated for ${stateCode})`,
    url: "",
    methodology: "No public dataset has been integrated for this yet — treat as UNKNOWN, not zero.",
  };
}

export function getSource(ctx: StateAnalysisContext, role: string): SourceMeta {
  return ctx.sources[role] ?? unavailableSource(ctx.stateCode, role);
}
