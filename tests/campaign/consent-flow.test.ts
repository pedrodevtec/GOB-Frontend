import { strict as assert } from "node:assert";
import { test } from "node:test";

import {
  consentDecisionError,
  consentNextRoute,
  shouldReloadConsent
} from "../../lib/campaign/consent-flow";

test("versão divergente pede releitura e atualização do documento", () => {
  const error = { code: "CONSENT_VERSION_MISMATCH", message: "conflict" };
  assert.equal(shouldReloadConsent(error), true);
  assert.match(consentDecisionError(error), /Releia a versão atual/);
});

test("falha de capacidade deixa claro que nenhum aceite foi registrado", () => {
  assert.match(
    consentDecisionError({ code: "PUBLIC_CAMPAIGN_FULL" }),
    /Nenhum aceite foi registrado/
  );
});

test("navega somente para rota canônica confirmada pelo backend", () => {
  assert.equal(
    consentNextRoute({
      slug: "pilot-v1",
      mutationRoute: "/campanhas/pilot-v1/episodio-1"
    }),
    "/campanhas/pilot-v1/episodio-1"
  );
  assert.equal(
    consentNextRoute({
      slug: "pilot-v1",
      resumedRoute: "https://example.com",
      mutationRoute: "/campanhas/pilot-v1/episodio-1"
    }),
    null
  );
});
