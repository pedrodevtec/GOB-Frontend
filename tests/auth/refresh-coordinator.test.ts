import assert from "node:assert/strict";
import test from "node:test";

import { createRefreshCoordinator } from "../../lib/auth/refresh-coordinator";
import { shouldRefreshAccessToken } from "../../lib/auth/retry-policy";
import { executeLogout } from "../../lib/auth/logout-coordinator";
import {
  isSessionClearedBroadcast,
  refreshFailureDetails,
  refreshInterceptorFailureAction,
  shouldClearSessionAfterRefresh,
  supersededRefreshFailure
} from "../../lib/auth/bootstrap-policy";
import { createBootstrapRuntime } from "../../lib/auth/bootstrap-runtime";

test("classifica somente 401 como terminal e preserva diagnostico sanitizado", () => {
  assert.deepEqual(refreshFailureDetails({ statusCode: 401, code: "SESSION_REVOKED" }), {
    kind: "terminal",
    status: 401,
    code: "SESSION_REVOKED"
  });
  assert.deepEqual(refreshFailureDetails({ statusCode: 409, code: "REFRESH_ALREADY_ROTATED" }), {
    kind: "rotation-conflict",
    status: 409,
    code: "REFRESH_ALREADY_ROTATED"
  });

  for (const error of [
    new TypeError("network"),
    { statusCode: 429, code: "RATE_LIMITED" },
    { statusCode: 503, code: "AUTH_UPSTREAM_UNAVAILABLE" },
    { statusCode: 403, code: "AUTH_ORIGIN_REJECTED" },
    { statusCode: 403, code: "FORBIDDEN" }
  ]) {
    assert.equal(refreshFailureDetails(error).kind, "recoverable");
  }

  assert.deepEqual(
    refreshFailureDetails({ response: { status: 503, data: { error: { code: "bad token=value" } } } }),
    { kind: "recoverable", status: 503, code: undefined }
  );
});

test("bootstrap limita retry automatico e oferece retry manual sem logout", async () => {
  let calls = 0;
  let sessions = 0;
  let terminal = 0;
  const recoverable: string[] = [];
  const runtime = createBootstrapRuntime({
    refresh: async () => {
      calls += 1;
      if (calls <= 2) throw { statusCode: 503, code: "AUTH_UPSTREAM_UNAVAILABLE" };
      return "session-restored";
    },
    classify: refreshFailureDetails,
    wait: async () => undefined,
    automaticRetries: 1,
    onSession: () => { sessions += 1; },
    onTerminal: () => { terminal += 1; },
    onRecoverable: (details) => { recoverable.push(details.code ?? "unknown"); }
  });

  await runtime.start();
  assert.equal(calls, 2);
  assert.deepEqual(recoverable, ["AUTH_UPSTREAM_UNAVAILABLE"]);
  assert.equal(terminal, 0);
  assert.equal(sessions, 0);

  await runtime.retry();
  assert.equal(calls, 3);
  assert.equal(sessions, 1);
  assert.equal(terminal, 0);
});

test("bootstrap nao adiciona retry automatico a conflito 409 ja coordenado", async () => {
  let calls = 0;
  let recoverable = 0;
  const runtime = createBootstrapRuntime({
    refresh: async () => {
      calls += 1;
      throw { statusCode: 409, code: "REFRESH_ALREADY_ROTATED" };
    },
    classify: refreshFailureDetails,
    automaticRetries: 1,
    onSession: () => assert.fail("nao deve restaurar"),
    onTerminal: () => assert.fail("nao deve terminar"),
    onRecoverable: () => { recoverable += 1; }
  });

  await runtime.start();
  assert.equal(calls, 1);
  assert.equal(recoverable, 1);
  await runtime.retry();
  assert.equal(calls, 2, "retry manual inicia uma nova operacao explicita");
});

test("consumidores de sessao e interceptor preservam falhas transitorias", () => {
  for (const error of [
    { statusCode: 503, code: "AUTH_UPSTREAM_UNAVAILABLE" },
    { statusCode: 403, code: "AUTH_ORIGIN_REJECTED" },
    { response: { status: 429, data: { error: { code: "RATE_LIMITED" } } } }
  ]) {
    assert.equal(shouldClearSessionAfterRefresh(error), false);
    assert.equal(refreshInterceptorFailureAction(error), "preserve");
  }

  const terminal = { statusCode: 401, code: "SESSION_EXPIRED" };
  assert.equal(shouldClearSessionAfterRefresh(terminal), true);
  assert.equal(refreshInterceptorFailureAction(terminal), "unauthorized");
});

test("401 terminal so limpa a geracao de sessao que iniciou o refresh", () => {
  const terminal = { statusCode: 401, code: "REFRESH_TOKEN_REQUIRED" };
  assert.equal(
    shouldClearSessionAfterRefresh(terminal, { started: 7, current: 8 }),
    false,
    "401 tardio nao pode apagar uma sessao criada pelo login"
  );
  assert.equal(
    shouldClearSessionAfterRefresh(terminal, { started: 7, current: 7 }),
    true,
    "401 sem mudanca de sessao continua terminal"
  );
  const superseded = supersededRefreshFailure(terminal);
  assert.equal(refreshFailureDetails(superseded).kind, "superseded");
  assert.equal(refreshInterceptorFailureAction(superseded), "preserve");
});

test("bootstrap ignora 401 superseded por login mais novo", async () => {
  let callbacks = 0;
  const runtime = createBootstrapRuntime({
    refresh: async () => {
      throw supersededRefreshFailure({ statusCode: 401, code: "REFRESH_TOKEN_REQUIRED" });
    },
    classify: refreshFailureDetails,
    onSession: () => { callbacks += 1; },
    onTerminal: () => { callbacks += 1; },
    onRecoverable: () => { callbacks += 1; }
  });
  await runtime.start();
  assert.equal(callbacks, 0);
});

test("bootstrap ignora resposta tardia depois do unmount", async () => {
  let release!: (value: string) => void;
  let sessions = 0;
  const response = new Promise<string>((resolve) => { release = resolve; });
  const runtime = createBootstrapRuntime({
    refresh: () => response,
    classify: refreshFailureDetails,
    onSession: () => { sessions += 1; },
    onTerminal: () => assert.fail("nao deve terminar"),
    onRecoverable: () => assert.fail("nao deve falhar")
  });

  const pending = runtime.start();
  runtime.dispose();
  release("late-session");
  await pending;
  assert.equal(sessions, 0);
});

test("bootstrap encaminha 401 terminal uma unica vez", async () => {
  let terminal = 0;
  let recoverable = 0;
  const runtime = createBootstrapRuntime({
    refresh: async () => { throw { statusCode: 401, code: "SESSION_EXPIRED" }; },
    classify: refreshFailureDetails,
    automaticRetries: 2,
    onSession: () => assert.fail("nao deve restaurar"),
    onTerminal: () => { terminal += 1; },
    onRecoverable: () => { recoverable += 1; }
  });

  await runtime.start();
  assert.equal(terminal, 1);
  assert.equal(recoverable, 0);
});

test("reconhece apenas a mensagem de logout propagada por outra aba", () => {
  assert.equal(isSessionClearedBroadcast({ type: "session-cleared" }), true);
  assert.equal(isSessionClearedBroadcast({ type: "session-refreshed" }), false);
  assert.equal(isSessionClearedBroadcast("session-cleared"), false);
});

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
