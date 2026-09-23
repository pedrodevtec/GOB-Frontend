const assert = require("node:assert/strict");
const Module = require("node:module");
const path = require("node:path");
const test = require("node:test");
const rendererRequire = Module.createRequire(require.resolve("react-test-renderer"));
const React = rendererRequire("react");
const jsxRuntime = rendererRequire("react/jsx-runtime");
const { act, create } = require("react-test-renderer");

global.IS_REACT_ACT_ENVIRONMENT = true;

const outputRoot = path.resolve(__dirname, "../../.tmp-tests-auth-ui");
const policy = require(path.join(outputRoot, "lib/auth/bootstrap-policy.js"));
const runtime = require(path.join(outputRoot, "lib/auth/bootstrap-runtime.js"));

let pathname = "/dashboard";
const defaultRefresh = async () => {
  throw { statusCode: 401, code: "REFRESH_TOKEN_REQUIRED" };
};
let refresh = defaultRefresh;
let clears = 0;
let assigned = [];
let channels = [];
let state;
let listeners;
const queryClient = { clear: () => { clears += 1; } };

function resetHarness() {
  refresh = defaultRefresh;
  pathname = "/dashboard";
  clears = 0;
  assigned = [];
  channels = [];
  window.location.search = "";
  listeners = new Set();
  state = {
    user: null,
    accessToken: null,
    hydrated: false,
    setSession(session) {
      setStore({ user: session.user, accessToken: session.accessToken });
    },
    markHydrated() { setStore({ hydrated: true }); }
  };
}

function setStore(patch) {
  state = { ...state, ...patch };
  for (const listener of listeners) listener();
}

function useAuthStore(selector) {
  return React.useSyncExternalStore(
    (listener) => { listeners.add(listener); return () => listeners.delete(listener); },
    () => selector(state),
    () => selector(state)
  );
}
useAuthStore.getState = () => state;
useAuthStore.setState = setStore;

class FakeBroadcastChannel {
  constructor() { this.onmessage = null; channels.push(this); }
  close() {}
  postMessage() {}
}

global.window = new EventTarget();
window.location = {
  pathname: "/dashboard",
  search: "",
  assign(value) { assigned.push(value); }
};
window.setTimeout = (callback) => { callback(); return 1; };
global.BroadcastChannel = FakeBroadcastChannel;

const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
  const mocks = {
    "react": React,
    "react/jsx-runtime": jsxRuntime,
    "next/navigation": { usePathname: () => pathname },
    "@tanstack/react-query": { useQueryClient: () => queryClient },
    "@/components/ui/button": {
      Button: ({ children, ...props }) => React.createElement("button", props, children)
    },
    "@/lib/auth/bootstrap-policy": policy,
    "@/lib/auth/bootstrap-runtime": runtime,
    "@/lib/auth/constants": {
      AUTH_SESSION_CLEARED_EVENT: "gob:session-cleared",
      AUTH_SESSION_REFRESHED_EVENT: "gob:session-refreshed"
    },
    "@/lib/auth/session": { refreshSession: () => refresh() },
    "@/lib/auth/token-storage": { clearLegacyAuthStorage: () => undefined },
    "@/lib/routing/auth-redirects": {
      isAuthEntryRoute: (value) => value === "/login",
      isPublicRoute: (value) => value === "/" || value === "/login",
      authPathWithReturnTo: (entry, returnTo) => `${entry}?returnTo=${encodeURIComponent(returnTo)}`
    },
    "@/stores/auth-store": { useAuthStore }
  };
  if (Object.hasOwn(mocks, request)) return mocks[request];
  return originalLoad.call(this, request, parent, isMain);
};

const { AuthBootstrap } = require(path.join(
  outputRoot,
  "components/providers/auth-bootstrap.js"
));

async function flush() {
  await Promise.resolve();
  await Promise.resolve();
}

test.beforeEach(resetHarness);

test("mantem filhos protegidos desmontados ate retry recuperar a sessao", async () => {
  let attempts = 0;
  let rejectFirst;
  refresh = async () => {
    attempts += 1;
    if (attempts === 1) {
      return new Promise((resolve, reject) => { rejectFirst = reject; });
    }
    if (attempts === 2) throw { statusCode: 503, code: "AUTH_UPSTREAM_UNAVAILABLE" };
    return { accessToken: "token", user: { id: "u1" } };
  };
  let root;
  await act(async () => {
    root = create(React.createElement(AuthBootstrap, null, React.createElement("p", null, "privado")));
    await flush();
  });
  assert.equal(root.root.findAllByType("p").some((node) => node.children.includes("privado")), false);
  assert.equal(root.root.findAll((node) => String(node.props.className || "").includes("animate-spin")).length, 1);

  await act(async () => {
    rejectFirst({ statusCode: 503, code: "AUTH_UPSTREAM_UNAVAILABLE" });
    await flush();
  });
  assert.equal(root.root.findAllByType("p").some((node) => node.children.includes("privado")), false);
  const retry = root.root.findByType("button");
  assert.equal(retry.children.join(""), "Tentar novamente");

  await act(async () => { retry.props.onClick(); await flush(); });
  assert.equal(root.root.findAllByType("p").some((node) => node.children.includes("privado")), true);
  await act(async () => root.unmount());
});

test("login publico libera navegacao protegida sem remontar o provider", async () => {
  pathname = "/login";
  window.location.pathname = "/login";
  refresh = async () => { throw { statusCode: 401, code: "REFRESH_TOKEN_REQUIRED" }; };
  let root;
  await act(async () => {
    root = create(React.createElement(AuthBootstrap, null, React.createElement("p", null, "conteudo")));
    await flush();
  });
  assert.equal(clears, 0, "401 anonimo nao apaga consultas publicas");

  await act(async () => {
    state.setSession({ accessToken: "login-token", user: { id: "u1" } });
    pathname = "/dashboard";
    window.location.pathname = "/dashboard";
    root.update(React.createElement(AuthBootstrap, null, React.createElement("p", null, "conteudo")));
    await flush();
  });
  assert.equal(root.root.findByType("p").children.join(""), "conteudo");
  assert.deepEqual(assigned, []);
  await act(async () => root.unmount());
});

test("terminal publico seguido de rota protegida preserva returnTo e nao mostra spinner", async () => {
  pathname = "/login";
  window.location.pathname = "/login";
  let root;
  await act(async () => {
    root = create(React.createElement(AuthBootstrap, null, React.createElement("p", null, "publico")));
    await flush();
  });

  await act(async () => {
    pathname = "/dashboard";
    window.location.pathname = "/dashboard";
    window.location.search = "?aba=2";
    root.update(React.createElement(AuthBootstrap, null, React.createElement("p", null, "privado")));
    await flush();
  });
  assert.deepEqual(assigned, ["/login?returnTo=%2Fdashboard%3Faba%3D2"]);
  assert.match(root.root.findByType("h1").children.join(""), /sessão foi encerrada/i);
  assert.equal(root.root.findAll((node) => String(node.props.className || "").includes("animate-spin")).length, 0);
  await act(async () => root.unmount());
});

test("evento entre abas limpa cache apenas quando havia projecao autenticada", async () => {
  pathname = "/login";
  window.location.pathname = "/login";
  refresh = async () => ({ accessToken: "token", user: { id: "u1" } });
  let root;
  await act(async () => {
    root = create(React.createElement(AuthBootstrap, null, React.createElement("p", null, "publico")));
    await flush();
  });
  assert.equal(channels.length, 1);
  await act(async () => { channels[0].onmessage({ data: { type: "session-cleared" } }); await flush(); });
  assert.equal(clears, 1);
  assert.equal(state.accessToken, null);
  await act(async () => root.unmount());
});
