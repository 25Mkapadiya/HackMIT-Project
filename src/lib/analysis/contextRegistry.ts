import type { StateAnalysisContext } from "./context";
import { WASHINGTON_CONTEXT } from "@/states/washington/analysisContext";
import { MINNESOTA_CONTEXT } from "@/states/minnesota/analysisContext";

/**
 * The one place that knows every state's analysis context exists. Adding a
 * new state means adding one entry here (and building the context object
 * itself under src/states/<state>/analysisContext.ts) — nothing in
 * src/lib/analysis/*.ts changes.
 */
const CONTEXTS: Record<string, StateAnalysisContext> = {
  washington: WASHINGTON_CONTEXT,
  minnesota: MINNESOTA_CONTEXT,
};

export function getAnalysisContext(stateId: string): StateAnalysisContext {
  const ctx = CONTEXTS[stateId];
  if (!ctx) {
    throw new Error(`No analysis context registered for state "${stateId}" — this state has no live analysis pipeline yet.`);
  }
  return ctx;
}
