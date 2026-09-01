import assert from "node:assert/strict";
import test from "node:test";

import { createRefreshCoordinator } from "../../lib/auth/refresh-coordinator";
import { shouldRefreshAccessToken } from "../../lib/auth/retry-policy";
import { executeLogout } from "../../lib/auth/logout-coordinator";

test("renova somente 401 TOKEN_EXPIRED e nunca 403", () => {
  assert.equal(shouldRefreshAccessToken(401, "TOKEN_EXPIRED", false), true);
  assert.equal(shouldRefreshAccessToken(401, "SESSION_REVOKED", false), false);
  assert.equal(shouldRefreshAccessToken(403, "FORBIDDEN", false), false);
  assert.equal(shouldRefreshAccessToken(409, "REFRESH_ALREADY_ROTATED", false), false);
  assert.equal(shouldRefreshAccessToken(401, "TOKEN_EXPIRED", true), false);
});

test("logout sempre limpa estado e diferencia revogacao remota de local_only", async () => {
  let clears = 0;
  const options = {
    clearLocal: () => { clears += 1; },
    isUpstreamUnavailable: (error: unknown) => error === "unavailable"
  };

  assert.deepEqual(
    await executeLogout({ ...options, request: async () => "revoked" }),
    { remote: true, outcome: "revoked" }
  );
  assert.deepEqual(
    await executeLogout({ ...options, request: async () => { throw "unavailable"; } }),
    { remote: false, outcome: "local_only" }
  );
  await assert.rejects(
    executeLogout({ ...options, request: async () => { throw new Error("forbidden"); } }),
    /forbidden/
  );
  assert.equal(clears, 3);
});

test("deduplica refresh concorrente na mesma aba", async () => {
  let calls = 0;
  let release!: (value: string) => void;
  const response = new Promise<string>((resolve) => { release = resolve; });
  const refresh = createRefreshCoordinator({
    run: () => {
      calls += 1;
      return response;
    }
  });

  const first = refresh();
  const second = refresh();
  assert.strictEqual(first, second);
  release("token-1");
  assert.equal(await first, "token-1");
  assert.equal(calls, 1);
});

test("serializa duas abas quando Web Locks esta disponivel", async () => {
  let tail = Promise.resolve();
  const order: string[] = [];
  const lock = <T>(run: () => Promise<T>) => {
    const result = tail.then(run);
    tail = result.then(() => undefined, () => undefined);
    return result;
  };

  const tabA = createRefreshCoordinator({
    withCrossTabLock: lock,
    run: async () => { order.push("A"); return "token-A"; }
  });
  const tabB = createRefreshCoordinator({
    withCrossTabLock: lock,
    run: async () => { order.push("B"); return "token-B"; }
  });

  assert.deepEqual(await Promise.all([tabA(), tabB()]), ["token-A", "token-B"]);
  assert.deepEqual(order, ["A", "B"]);
});

test("repete uma unica vez apos conflito de rotacao 409", async () => {
  let calls = 0;
  const refresh = createRefreshCoordinator({
    run: async () => {
      calls += 1;
      if (calls === 1) throw { statusCode: 409 };
      return "token-winner";
    },
    isRotationConflict: (error) =>
      typeof error === "object" && error !== null && "statusCode" in error &&
      error.statusCode === 409
  });

  assert.equal(await refresh(), "token-winner");
  assert.equal(calls, 2);
});

test("nao repete falhas 401 de sessao revogada", async () => {
  let calls = 0;
  const refresh = createRefreshCoordinator({
    run: async () => {
      calls += 1;
      throw { statusCode: 401 };
    },
    isRotationConflict: (error) =>
      typeof error === "object" && error !== null && "statusCode" in error &&
      error.statusCode === 409
  });

  await assert.rejects(refresh(), { statusCode: 401 });
  assert.equal(calls, 1);
});
