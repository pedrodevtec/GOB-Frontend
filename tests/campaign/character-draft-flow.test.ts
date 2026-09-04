import { strict as assert } from "node:assert";
import { test } from "node:test";

import {
  characterDraftRecovery,
  validateAtomicCharacterDraftContract
} from "../../lib/campaign/character-draft-flow";

const slug = "pilot-v1";

function response(characterId = "character-1") {
  return {
    created: true,
    character: {
      id: characterId,
      builderConfigVersion: "pilot-v1"
    },
    journeyState: "CHARACTER_DRAFT",
    nextRoute: `/campanhas/${slug}/personagem`,
    publicContext: {
      id: "context-1",
      status: "PUBLISHED",
      units: [
        {
          id: "unit-1",
          classification: "PUBLIC_CANON",
          visibility: "PUBLIC",
          title: "O chamado",
          content: "Os guardiões foram convocados."
        }
      ]
    }
  };
}

test("aceita o id e a rota somente após validar a resposta atômica", () => {
  const result = validateAtomicCharacterDraftContract(response(), slug);

  assert.equal(result.characterId, "character-1");
  assert.equal(result.journeyState, "CHARACTER_DRAFT");
  assert.equal(result.nextRoute, `/campanhas/${slug}/personagem`);
});

test("duas abas podem retomar o mesmo id retornado pelo backend", async () => {
  const officialOperation = async () => response("same-character");
  const results = await Promise.all(
    Array.from({ length: 8 }, async () =>
      validateAtomicCharacterDraftContract(await officialOperation(), slug)
    )
  );

  assert.deepEqual(
    new Set(results.map((result) => result.characterId)),
    new Set(["same-character"])
  );
});

test("bloqueia rota externa, contexto não publicado e qualquer marcador secreto", () => {
  assert.throws(() =>
    validateAtomicCharacterDraftContract(
      { ...response(), nextRoute: "https://example.com" },
      slug
    )
  );
  assert.throws(() =>
    validateAtomicCharacterDraftContract(
      {
        ...response(),
        publicContext: { ...response().publicContext, status: "DRAFT" }
      },
      slug
    )
  );
  assert.throws(() =>
    validateAtomicCharacterDraftContract(
      {
        ...response(),
        publicContext: {
          ...response().publicContext,
          units: [
            {
              ...response().publicContext.units[0],
              classification: "SECRET_CANON",
              visibility: "TABLE_MASTER"
            }
          ]
        }
      },
      slug
    )
  );
});

test("traduz os conflitos contratuais em recuperações seguras", () => {
  assert.equal(
    characterDraftRecovery({ code: "CAMPAIGN_CONSENT_REQUIRED" }).kind,
    "CONSENT"
  );
  assert.equal(
    characterDraftRecovery({ code: "PUBLIC_CAMPAIGN_FULL" }).kind,
    "CAMPAIGN"
  );
  assert.equal(
    characterDraftRecovery({ code: "CAMPAIGN_MEMBERSHIP_REMOVED" }).kind,
    "CAMPAIGN"
  );
  assert.equal(
    characterDraftRecovery({ code: "CAMPAIGN_PUBLIC_CONTEXT_REQUIRED" }).kind,
    "RETRY"
  );
  assert.equal(characterDraftRecovery({ statusCode: 401 }).kind, "LOGIN");
});
