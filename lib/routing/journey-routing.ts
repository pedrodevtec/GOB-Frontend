import type { JourneyState } from "../campaign/player-journey";

const JOURNEY_SUFFIXES = [
  "/consentimento",
  "/episodio-1",
  "/personagem",
  "/personagem/revisao",
  "/pesquisa",
  "/conclusao"
] as const;

const BLOCKING_STATES = new Set<JourneyState>(["BLOCKED", "LEGACY_REVIEW"]);

export type JourneyRouteBlockReason =
  | "BLOCKED"
  | "LEGACY_REVIEW"
  | "UNKNOWN_STATE"
  | "MISSING_ROUTE"
  | "INVALID_ROUTE"
  | "STATE_ROUTE_MISMATCH"
  | "REDIRECT_LOOP";

export type JourneyRouteDecision =
  | { kind: "permit"; route: string }
  | { kind: "redirect"; route: string }
  | { kind: "block"; reason: JourneyRouteBlockReason };

export interface JourneyRedirectTrace {
  at: number;
  routes: string[];
}

function campaignBasePath(slug: string) {
  return `/campanhas/${encodeURIComponent(slug)}`;
}

function pathnameOnly(value: string) {
  try {
    const parsed = new URL(value, "https://bravantus.invalid");
    return parsed.origin === "https://bravantus.invalid" ? parsed.pathname : null;
  } catch {
    return null;
  }
}

export function safeCampaignJourneyRoute(slug: string, value?: string | null) {
  if (!slug || !value || !value.startsWith("/") || value.startsWith("//")) return null;
  if (value.includes("\\") || /[\u0000-\u001f\u007f]/.test(value)) return null;

  const pathname = pathnameOnly(value);
  if (!pathname || pathname !== value) return null;

  const base = campaignBasePath(slug);
  const allowed = new Set(JOURNEY_SUFFIXES.map((suffix) => `${base}${suffix}`));
  return allowed.has(pathname) ? pathname : null;
}

export function decideCampaignJourneyRoute(input: {
  slug: string;
  currentPath: string;
  allowedStates: readonly JourneyState[];
  journeyState?: JourneyState | null;
  nextRoute?: string | null;
}): JourneyRouteDecision {
  const { slug, currentPath, allowedStates, journeyState, nextRoute } = input;

  if (!journeyState) return { kind: "block", reason: "UNKNOWN_STATE" };
  if (BLOCKING_STATES.has(journeyState)) {
    return { kind: "block", reason: journeyState as "BLOCKED" | "LEGACY_REVIEW" };
  }
  if (!nextRoute) return { kind: "block", reason: "MISSING_ROUTE" };

  const target = safeCampaignJourneyRoute(slug, nextRoute);
  if (!target) return { kind: "block", reason: "INVALID_ROUTE" };

  const current = safeCampaignJourneyRoute(slug, currentPath);
  if (!current) return { kind: "block", reason: "INVALID_ROUTE" };
  if (allowedStates.includes(journeyState)) {
    return { kind: "permit", route: current };
  }
  if (current === target) {
    return { kind: "block", reason: "STATE_ROUTE_MISMATCH" };
  }

  return { kind: "redirect", route: target };
}

export function nextJourneyRedirectTrace(input: {
  previous?: JourneyRedirectTrace | null;
  currentRoute: string;
  targetRoute: string;
  now?: number;
  windowMs?: number;
}): { loop: boolean; trace: JourneyRedirectTrace } {
  const now = input.now ?? Date.now();
  const windowMs = input.windowMs ?? 10_000;
  const previous =
    input.previous && now - input.previous.at <= windowMs
      ? input.previous
      : null;
  const routes = previous?.routes.length
    ? [...previous.routes]
    : [input.currentRoute];
  const loop = routes.includes(input.targetRoute);

  if (!loop) routes.push(input.targetRoute);

  return {
    loop,
    trace: { at: now, routes: routes.slice(-8) }
  };
}
