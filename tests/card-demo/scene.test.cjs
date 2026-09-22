// React component tests, without a DOM. Radix and transport are boundary doubles;
// these tests do not certify browser layout, focus trapping, or backend authorization.
const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const React = require('react');
const { act, create } = require('react-test-renderer');
global.IS_REACT_ACT_ENVIRONMENT = true;
const project = path.resolve(__dirname, '../..');
const originalLoad = Module._load;
const originalResolve = Module._resolveFilename;
const auth = { user: { id: 'u1' }, accessToken: 'session-a' };
const listeners = new Set();
const mockWindow = new EventTarget();
global.window = mockWindow;
let getCharacter;
const useAuthStore = (selector) => selector(React.useSyncExternalStore((notify) => { listeners.add(notify); return () => listeners.delete(notify); }, () => auth));
useAuthStore.getState = () => auth;
const element = (tag) => ({ children, ...props }) => React.createElement(tag, props, children);
const dialog = {
  Dialog: element('dialog-root'), DialogContent: element('dialog-content'), DialogTitle: element('h1'),
  DialogDescription: element('p'), DialogClose: element('dialog-close'), DialogTrigger: element('dialog-trigger')
};
Module._resolveFilename = function(request, parent, ...rest) {
  if (request.startsWith('@/')) request = path.join(project, request.slice(2));
  return originalResolve.call(this, request, parent, ...rest);
};
Module._load = function(request, parent, isMain) {
  if (request === '@/components/ui/dialog') return dialog;
  if (request === '@/components/ui/button') return { Button: element('button') };
  if (request === '@/components/ui/card') return { Card: element('section'), CardTitle: element('h2'), CardDescription: element('p') };
  if (request === '@/stores/auth-store') return { useAuthStore };
  if (request === '@/lib/auth/token-storage') return { hasUsableAccessToken: token => token === auth.accessToken && Boolean(token) };
  if (request === '@/features/mvp/services/mvp.service') return { mvpService: { getMyCharacter: (...args) => getCharacter(...args) } };
  return originalLoad.call(this, request, parent, isMain);
};
for (const ext of ['.ts', '.tsx']) require.extensions[ext] = (module, filename) => {
  const result = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true }, fileName: filename });
  module._compile(result.outputText, filename);
};
require.extensions['.css'] = (module) => { module.exports = new Proxy({}, { get: (_, name) => name === '__esModule' ? false : String(name) }); };
const { MandukuruEncounter, MandukuruCardSceneEntry } = require('../../features/mvp/components/mandukuru-card-scene.tsx');
const { projectCharacter } = require('../../features/mvp/card-demo/context.ts');
const resume = { membership: { id: 'm1', tableId: 't1', role: 'PLAYER', status: 'ACTIVE' }, character: { id: 'c1' }, consent: { status: 'ACCEPTED' }, journeyState: 'CHARACTER_DRAFT' };
const source = { id: 'c1', tableId: 't1', name: 'Iara', personalHistory: 'Cresci junto ao rio.', creativeDossier: { desire: 'Encontrar abrigo.' } };
let renderer;
afterEach(async () => { if (renderer) await act(async () => renderer.unmount()); renderer = null; });
const content = node => typeof node === 'string' ? node : (node.children ?? []).map(content).join('');
const button = label => renderer.root.findAllByType('button').find(node => content(node).includes(label));
const click = async label => { const node = button(label); assert.ok(node, label); await act(async () => node.props.onClick()); };
const rendered = () => content(renderer.root);
const deferred = () => { let resolve, reject; const promise = new Promise((yes,no) => { resolve=yes; reject=no; }); return { promise, resolve, reject }; };
async function renderEncounter() { await act(async () => { renderer = create(React.createElement(MandukuruEncounter, { character: projectCharacter(source) })); }); }
async function renderEntry(readResume = async () => resume, initialResume = resume) {
  getCharacter = async () => source;
  function Parent() {
    const [currentResume, setResume] = React.useState(initialResume);
    return React.createElement(MandukuruCardSceneEntry, { resume: currentResume, characterId:'c1', tableId:'t1', revalidateResume: async () => {
      const fresh = await readResume(); setResume(fresh); return fresh;
    } });
  }
  await act(async () => { renderer = create(React.createElement(Parent)); });
}
const open = async () => { await act(async () => renderer.root.findByType('dialog-root').props.onOpenChange(true)); };
const close = async () => { await act(async () => renderer.root.findByType('dialog-root').props.onOpenChange(false)); };
const focusWindow = async () => { await act(async () => mockWindow.dispatchEvent(new Event('focus'))); };

test('React consumer chooses approach, card, explicit response and restart; unavailable cards remain inspectable', async () => {
  await renderEncounter();
  const mark = button('Poder da Marca');
  assert.equal(mark.props['aria-disabled'], true); assert.equal(mark.props.disabled, undefined);
  await click('Avançar com firmeza');
  assert.match(rendered(), /Primeiro golpe: \+3 de dano pendente/);
  assert.match(content(button('Técnica')), /Dano com abordagem: 12/);
  await click('Poder da Marca'); // Insufficient energy, keyboard activation remains inert.
  assert.match(rendered(), /Primeiro golpe: \+3 de dano pendente/);
  await click('Técnica');
  assert.match(rendered(), /12 de dano ao Mandukuru/);
  assert.match(rendered(), /24 \/ 36/);
  assert.equal(button('Golpe').props['aria-disabled'], true);
  await click('Resolver resposta');
  assert.match(rendered(), /Rodada 2 de 18/);
  assert.match(rendered(), /24 \/ 28/);
  await click('Reiniciar cena');
  assert.match(rendered(), /Iara, há uma saída/);
  await click('Proteger a aproximação');
  assert.match(rendered(), /28 \/ 28/);
  assert.match(rendered(), /36 \/ 36/);
  assert.doesNotMatch(rendered(), /12 de dano ao Mandukuru/);
});
test('React focus revalidation hides and suspends the encounter, then preserves unchanged attempt', async () => {
  await renderEntry(); await open(); await click('Avançar com firmeza'); await click('Golpe');
  const pending = deferred(); getCharacter = () => pending.promise;
  await focusWindow();
  assert.match(rendered(), /Conferindo seu acesso/);
  const encounter = renderer.root.findByType(MandukuruEncounter);
  assert.equal(encounter.props.suspended, true); assert.equal(encounter.parent.props.hidden, true);
  await click('Resolver resposta'); // A queued invocation cannot advance while suspended.
  await act(async () => pending.resolve(source));
  assert.equal(renderer.root.findByType(MandukuruEncounter).props.suspended, false);
  assert.match(rendered(), /29 \/ 36/);
  assert.match(rendered(), /Rodada 1 de 18/);
  await click('Resolver resposta'); assert.match(rendered(), /Rodada 2 de 18/);
});
test('React revalidation failure discards the attempt and narrative; retry starts fresh', async () => {
  await renderEntry(); await open(); await click('Avançar com firmeza'); await click('Golpe');
  getCharacter = async () => { throw new Error('403'); };
  await focusWindow();
  assert.equal(renderer.root.findAllByType(MandukuruEncounter).length, 0);
  assert.doesNotMatch(rendered(), /Cresci junto ao rio/);
  getCharacter = async () => source; await click('Tentar novamente');
  assert.match(rendered(), /Iara, há uma saída/);
});
test('React close during loading ignores the late response and allows a clean reopen', async () => {
  await renderEntry(); const pending = deferred(); getCharacter = () => pending.promise;
  await open(); await close(); await act(async () => pending.resolve(source));
  assert.equal(renderer.root.findAllByType(MandukuruEncounter).length, 0);
  assert.equal(renderer.root.findByType('dialog-root').props.open, false);
  getCharacter = async () => source; await open(); assert.match(rendered(), /Iara, há uma saída/);
});
test('React ignores superseded focus responses; changed narrative starts a fresh attempt', async () => {
  await renderEntry(); await open(); await click('Avançar com firmeza'); await click('Golpe');
  const old = deferred(); getCharacter = () => old.promise; await focusWindow();
  getCharacter = async () => ({...source, personalHistory: 'Nova história salva.'}); await focusWindow();
  assert.match(rendered(), /Nova história salva/); assert.match(rendered(), /Iara, há uma saída/);
  await act(async () => old.resolve(source)); assert.doesNotMatch(rendered(), /Cresci junto ao rio/);
});
test('React retry reconciles stale denied resume and observes a later fresh revocation', async () => {
  let fresh = resume;
  await renderEntry(async () => fresh, {...resume, consent:{status:'REVOKED'}});
  await open(); assert.equal(renderer.root.findAllByType(MandukuruEncounter).length, 1);
  fresh = {...resume, consent:{status:'REVOKED'}}; await focusWindow();
  assert.equal(renderer.root.findAllByType(MandukuruEncounter).length, 0);
  fresh = resume; await click('Tentar novamente'); assert.equal(renderer.root.findAllByType(MandukuruEncounter).length, 1);
});
