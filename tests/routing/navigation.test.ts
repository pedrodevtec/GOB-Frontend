import { strict as assert } from "node:assert";
import { test } from "node:test";

import {
  isSafeReturnPath,
  safeReturnPath
} from "../../lib/routing/auth-redirects";
import {
  isJourneyState,
  normalizeJourneyResumeDecision
} from "../../lib/campaign/player-journey";
import {
  decideCampaignJourneyRoute,
  nextJourneyRedirectTrace,
  safeCampaignJourneyRoute
} from "../../lib/routing/journey-routing";

test("returnTo aceita somente destinos internos bem formados", () => {
  assert.equal(isSafeReturnPath("/campanhas/pilot-v1?origem=convite"), true);
  assert.equal(isSafeReturnPath("https://example.com"), false);
  assert.equal(isSafeReturnPath("//example.com"), false);
  assert.equal(isSafeReturnPath("/%2f%2fexample.com"), false);
  assert.equal(isSafeReturnPath("/campanhas\\example.com"), false);
  assert.equal(isSafeReturnPath("/%5cexample.com"), false);
  assert.equal(isSafeReturnPath("/%invalid"), false);
  assert.equal(isSafeReturnPath("/login?returnTo=/login"), false);
  assert.equal(isSafeReturnPath("/esqueci-senha"), false);
  assert.equal(isSafeReturnPath("/redefinir-senha?token=secret"), false);
  assert.equal(safeReturnPath("//example.com", "/dashboard"), "/dashboard");
});

test("normalização preserva somente estado conhecido, rota textual e revisão válida", () => {
  assert.equal(isJourneyState("CHARACTER_DRAFT"), true);
  assert.equal(isJourneyState("FUTURE_STATE"), false);
  assert.deepEqual(
    normalizeJourneyResumeDecision({
      journeyState: "CHARACTER_DRAFT",
      nextRoute: " /campanhas/pilot-v1/personagem ",
      character: { sheetRevision: 4 }
    }),
    {
      journeyState: "CHARACTER_DRAFT",
      nextRoute: "/campanhas/pilot-v1/personagem",
      revision: 4
    }
  );
  assert.deepEqual(
    normalizeJourneyResumeDecision({
      journeyState: "FUTURE_STATE",
      nextRoute: 42,
      revision: -1
    }),
    { journeyState: null, nextRoute: null, revision: null }
  );
});

test("catálogo da jornada rejeita rotas externas, desconhecidas e de outra campanha", () => {
  assert.equal(
    safeCampaignJourneyRoute("pilot-v1", "/campanhas/pilot-v1/personagem"),
    "/campanhas/pilot-v1/personagem"
  );
  assert.equal(safeCampaignJourneyRoute("pilot-v1", "https://example.com"), null);
  assert.equal(safeCampaignJourneyRoute("pilot-v1", "/campanhas/outra/personagem"), null);
  assert.equal(safeCampaignJourneyRoute("pilot-v1", "/campanhas/pilot-v1/admin"), null);
  assert.equal(
    safeCampaignJourneyRoute("pilot-v1", "/campanhas/pilot-v1/personagem?next=/admin"),
    null
  );
});

test("decisão permite a rota canônica e redireciona URL direta para o backend", () => {
  assert.deepEqual(
    decideCampaignJourneyRoute({
      slug: "pilot-v1",
      currentPath: "/campanhas/pilot-v1/personagem/revisao",
      allowedStates: ["CHARACTER_DRAFT"],
      journeyState: "CHARACTER_DRAFT",
      nextRoute: "/campanhas/pilot-v1/personagem"
    }),
    { kind: "permit", route: "/campanhas/pilot-v1/personagem/revisao" }
  );
  assert.deepEqual(
    decideCampaignJourneyRoute({
      slug: "pilot-v1",
      currentPath: "/campanhas/pilot-v1/personagem",
      allowedStates: ["CHARACTER_DRAFT"],
      journeyState: "CHARACTER_DRAFT",
      nextRoute: "/campanhas/pilot-v1/personagem"
    }),
    { kind: "permit", route: "/campanhas/pilot-v1/personagem" }
  );
  assert.deepEqual(
    decideCampaignJourneyRoute({
      slug: "pilot-v1",
      currentPath: "/campanhas/pilot-v1/pesquisa",
      allowedStates: ["SURVEY_REQUIRED"],
      journeyState: "CHARACTER_DRAFT",
      nextRoute: "/campanhas/pilot-v1/personagem"
    }),
    { kind: "redirect", route: "/campanhas/pilot-v1/personagem" }
  );
});

test("decisão bloqueia estado desconhecido, legado, rota inválida e inconsistência", () => {
  assert.deepEqual(
    decideCampaignJourneyRoute({
      slug: "pilot-v1",
      currentPath: "/campanhas/pilot-v1/personagem",
      allowedStates: ["CHARACTER_DRAFT"],
      journeyState: null,
      nextRoute: "/campanhas/pilot-v1/personagem"
    }),
    { kind: "block", reason: "UNKNOWN_STATE" }
  );
  assert.deepEqual(
    decideCampaignJourneyRoute({
      slug: "pilot-v1",
      currentPath: "/campanhas/pilot-v1/personagem",
      allowedStates: ["CHARACTER_DRAFT"],
      journeyState: "LEGACY_REVIEW",
      nextRoute: "/campanhas/pilot-v1/personagem"
    }),
    { kind: "block", reason: "LEGACY_REVIEW" }
  );
  assert.deepEqual(
    decideCampaignJourneyRoute({
      slug: "pilot-v1",
      currentPath: "/campanhas/pilot-v1/personagem",
      allowedStates: ["CHARACTER_DRAFT"],
      journeyState: "CHARACTER_DRAFT",
      nextRoute: "//example.com"
    }),
    { kind: "block", reason: "INVALID_ROUTE" }
  );
  assert.deepEqual(
    decideCampaignJourneyRoute({
      slug: "pilot-v1",
      currentPath: "/campanhas/pilot-v1/personagem",
      allowedStates: ["SURVEY_REQUIRED"],
      journeyState: "CHARACTER_DRAFT",
      nextRoute: "/campanhas/pilot-v1/personagem"
    }),
    { kind: "block", reason: "STATE_ROUTE_MISMATCH" }
  );
});

test("histórico interrompe ciclo A → B → A dentro da janela", () => {
  const first = nextJourneyRedirectTrace({
    currentRoute: "/campanhas/pilot-v1/personagem",
    targetRoute: "/campanhas/pilot-v1/pesquisa",
    now: 1_000
  });
  assert.equal(first.loop, false);

  const second = nextJourneyRedirectTrace({
    previous: first.trace,
    currentRoute: "/campanhas/pilot-v1/pesquisa",
    targetRoute: "/campanhas/pilot-v1/personagem",
    now: 1_500
  });
  assert.equal(second.loop, true);
});
