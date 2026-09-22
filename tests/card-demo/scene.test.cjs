// React component tests, without a DOM. Transport is a boundary double;
// these tests do not certify browser layout, focus trapping, or backend authorization.
const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const postcss = require('postcss');
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
let getGallery = async () => ({ items: [] });
let getArt = async () => new Blob(["portrait"], { type: "image/png" });
const useAuthStore = (selector) => selector(React.useSyncExternalStore((notify) => { listeners.add(notify); return () => listeners.delete(notify); }, () => auth));
useAuthStore.getState = () => auth;
const element = (tag) => ({ children, ...props }) => React.createElement(tag, props, children);
Module._resolveFilename = function(request, parent, ...rest) {
  if (request.startsWith('@/')) request = path.join(project, request.slice(2));
  return originalResolve.call(this, request, parent, ...rest);
};
Module._load = function(request, parent, isMain) {
  if (request === '@/components/ui/button') return { Button: element('button') };
  if (request === '@/components/ui/card') return { Card: element('section'), CardTitle: element('h2'), CardDescription: element('p') };
  if (request === '@/stores/auth-store') return { useAuthStore };
  if (request === '@/lib/auth/token-storage') return { hasUsableAccessToken: token => token === auth.accessToken && Boolean(token) };
  if (request === '@/features/mvp/services/mvp.service') return { mvpService: { getMyCharacter: (...args) => getCharacter(...args), listCharacterCardArt: (...args) => getGallery(...args), getCharacterCardArtContent: (...args) => getArt(...args) } };
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
afterEach(async () => { if (renderer) await act(async () => renderer.unmount()); renderer = null; getGallery = async () => ({ items: [] }); getArt = async () => new Blob(["portrait"], { type: "image/png" }); });
const content = node => typeof node === 'string' ? node : (node.children ?? []).map(content).join('');
const button = label => renderer.root.findAllByType('button').find(node => content(node).includes(label));
const click = async label => { const node = button(label); assert.ok(node, label); await act(async () => node.props.onClick()); };
const rendered = () => content(renderer.root);
const deferred = () => { let resolve, reject; const promise = new Promise((yes,no) => { resolve=yes; reject=no; }); return { promise, resolve, reject }; };
const normalizedMediaParams = value => value.replace(/\s/g, '').replace(/^\(|\)$/g, '');
const cssMedia = (root, params) => {
  let media;
  root.walkAtRules('media', rule => {
    if (normalizedMediaParams(rule.params) === normalizedMediaParams(params)) media = rule;
  });
  assert.ok(media, `missing CSS media query ${params}`);
  return media;
};
const cssRule = (container, selector) => {
  let match;
  container.walkRules(rule => {
    if (rule.selector === selector) match = rule;
  });
  assert.ok(match, `missing CSS rule ${selector}`);
  return match;
};
const cssValue = (rule, property) => {
  const declaration = rule.nodes.find(node => node.type === 'decl' && node.prop === property);
  assert.ok(declaration, `missing CSS declaration ${property} in ${rule.selector}`);
  return `${declaration.value}${declaration.important ? ' !important' : ''}`;
};
async function renderEncounter(props = {}) { await act(async () => { renderer = create(React.createElement(MandukuruEncounter, { character: projectCharacter(source), ...props })); }); }
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
const leaveScene = async () => { await act(async () => renderer.unmount()); renderer = null; };
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
test('combatants share the same image and status-panel structure without losing combat information', async () => {
  await renderEncounter({ portraitUrl: 'blob:portrait' });
  await click('Avançar com firmeza');
  const combatants = renderer.root.findAll(node => node.type === 'article' && String(node.props.className).split(' ').includes('combatant'));
  assert.equal(combatants.length, 2);
  for (const combatant of combatants) {
    assert.equal(combatant.findAll(node => String(node.props.className).split(' ').includes('combatantVisual')).length, 1);
    assert.equal(combatant.findAll(node => String(node.props.className).split(' ').includes('statusPanel')).length, 1);
  }
  assert.match(rendered(), /Vida 28 \/ 28/);
  assert.match(rendered(), /Energia 3 \/ 5/);
  assert.match(rendered(), /Escudo 0/);
  assert.match(rendered(), /Vida 36 \/ 36/);
  assert.match(rendered(), /A seguir: Investida · 4 de dano/);
});
test('long character name and portrait fallback preserve shared structure and untruncated critical text', async () => {
  const longName = 'Iara Guardiã das Sete Correntes do Rio de Pedra e da Passagem do Norte';
  await renderEncounter({ character: { ...projectCharacter(source), name: longName } });
  await click('Avançar com firmeza');
  const combatants = renderer.root.findAll(node => node.type === 'article' && String(node.props.className).split(' ').includes('combatant'));
  assert.equal(combatants.length, 2);
  for (const combatant of combatants) {
    assert.equal(combatant.findAll(node => String(node.props.className).split(' ').includes('combatantVisual')).length, 1);
    assert.equal(combatant.findAll(node => String(node.props.className).split(' ').includes('statusPanel')).length, 1);
  }
  assert.equal(content(combatants[0].findByType('h2')), longName);
  assert.ok(combatants[0].findByProps({ 'aria-label': `Retrato indisponível de ${longName}` }));
  assert.match(rendered(), /Vida 28 \/ 28/);
  assert.match(rendered(), /Energia 3 \/ 5/);
  assert.match(rendered(), /Escudo 0/);
  assert.match(rendered(), /Primeiro golpe: \+3 de dano pendente/);
  assert.match(rendered(), /Vida 36 \/ 36/);
  assert.match(rendered(), /A seguir: Investida · 4 de dano/);
  await click('Golpe');
  assert.match(rendered(), /−7 Vida/);
  assert.match(rendered(), /Resolver resposta · 4 de dano/);
});
test('combat CSS retains narrow reflow, minimum control target and reduced-motion contracts', () => {
  const root = postcss.parse(fs.readFileSync(path.join(project, 'features/mvp/components/mandukuru-card-scene.module.css'), 'utf8'));
  const narrow = cssMedia(root, 'max-width:420px');
  assert.equal(cssValue(cssRule(narrow, '.combat'), 'grid-template-columns'), '1fr');
  assert.equal(narrow.nodes.some(node => node.type === 'rule' && node.selector === '.cards'), false);
  const mobile = cssMedia(root, 'max-width:700px');
  assert.equal(cssValue(cssRule(mobile, '.cards'), 'grid-template-columns'), 'repeat(2,minmax(0,1fr))');
  assert.equal(cssValue(cssRule(mobile, '.card:last-child'), 'grid-column'), '1/-1');
  assert.equal(cssValue(cssRule(root, '.control'), 'min-height'), '44px');
  const portraitRule = cssRule(root, '.portrait');
  assert.equal(cssValue(portraitRule, 'border-radius'), '6px');
  assert.match(cssValue(portraitRule, 'background'), /^radial-gradient/);
  assert.equal(portraitRule.nodes.some(node => node.type === 'decl' && node.prop === 'filter'), false);
  assert.match(cssValue(cssRule(root, '.enemyArt'), 'filter'), /^drop-shadow/);
  const reduced = cssMedia(root, 'prefers-reduced-motion:reduce');
  const reducedScene = cssRule(reduced, '.scene *');
  assert.equal(cssValue(reducedScene, 'animation'), 'none !important');
  assert.equal(cssValue(reducedScene, 'transition'), 'none !important');
});
test('React focus revalidation hides and suspends the encounter, then preserves unchanged attempt', async () => {
  await renderEntry(); await click('Avançar com firmeza'); await click('Golpe');
  const pending = deferred(); getCharacter = () => pending.promise;
  await focusWindow();
  assert.match(rendered(), /Conferindo seu acesso/);
  const encounter = renderer.root.findByType(MandukuruEncounter);
  assert.equal(encounter.props.suspended, true); let ancestor = encounter.parent;
  while (ancestor && ancestor.props.hidden !== true) ancestor = ancestor.parent;
  assert.ok(ancestor, "encounter remains under a hidden surface while revalidating");
  await click('Resolver resposta'); // A queued invocation cannot advance while suspended.
  await act(async () => pending.resolve(source));
  assert.equal(renderer.root.findByType(MandukuruEncounter).props.suspended, false);
  assert.match(rendered(), /29 \/ 36/);
  assert.match(rendered(), /Rodada 1 de 18/);
  await click('Resolver resposta'); assert.match(rendered(), /Rodada 2 de 18/);
});
test('React revalidation failure discards the attempt and narrative; retry starts fresh', async () => {
  await renderEntry(); await click('Avançar com firmeza'); await click('Golpe');
  getCharacter = async () => { throw new Error('403'); };
  await focusWindow();
  assert.equal(renderer.root.findAllByType(MandukuruEncounter).length, 0);
  assert.doesNotMatch(rendered(), /Cresci junto ao rio/);
  getCharacter = async () => source; await click('Tentar novamente');
  assert.match(rendered(), /Iara, há uma saída/);
});
test('React leaving the page during loading ignores the late response and allows a clean return', async () => {
  await renderEntry(); const pending = deferred(); getCharacter = () => pending.promise;
  await focusWindow(); await leaveScene(); await act(async () => pending.resolve(source));
  getCharacter = async () => source; await renderEntry(); assert.match(rendered(), /Iara, há uma saída/);
});
test('React ignores superseded focus responses; changed narrative starts a fresh attempt', async () => {
  await renderEntry(); await click('Avançar com firmeza'); await click('Golpe');
  const old = deferred(); getCharacter = () => old.promise; await focusWindow();
  getCharacter = async () => ({...source, personalHistory: 'Nova história salva.'}); await focusWindow();
  assert.match(rendered(), /Nova história salva/); assert.match(rendered(), /Iara, há uma saída/);
  await act(async () => old.resolve(source)); assert.doesNotMatch(rendered(), /Cresci junto ao rio/);
});
test('React retry reconciles stale denied resume and observes a later fresh revocation', async () => {
  let fresh = resume;
  await renderEntry(async () => fresh, {...resume, consent:{status:'REVOKED'}});
  assert.equal(renderer.root.findAllByType(MandukuruEncounter).length, 1);
  fresh = {...resume, consent:{status:'REVOKED'}}; await focusWindow();
  assert.equal(renderer.root.findAllByType(MandukuruEncounter).length, 0);
  fresh = resume; await click('Tentar novamente'); assert.equal(renderer.root.findAllByType(MandukuruEncounter).length, 1);
});

const portrait = { id:'portrait', variant:'PORTRAIT', imagePath:'/authorized/portrait', createdAt:'2026-09-22' };
const heroImages = () => renderer.root.findAllByType('img').filter(node => node.props.alt === 'Retrato de Iara');
test('arena loads only existing portrait through authenticated services, keeps it across turns and releases on page exit', async () => {
  const calls = []; const revoked = [];
  const originalRevoke = URL.revokeObjectURL;
  URL.revokeObjectURL = url => { revoked.push(url); originalRevoke(url); };
  try {
    getGallery = async (...args) => { calls.push(args); return { items:[{...portrait,id:'card',variant:'PLAYABLE_CARD',imagePath:'/card'},portrait] }; };
    getArt = async path => { calls.push(path); return new Blob(['portrait'],{type:'image/png'}); };
    await renderEntry(); await click('Avançar com firmeza');
    const url = heroImages()[0].props.src; assert.match(url,/^blob:/);
    assert.deepEqual(calls,[['t1','c1'],'/authorized/portrait']);
    await click('Golpe'); await click('Resolver resposta');
    assert.equal(heroImages()[0].props.src,url); assert.equal(calls.length,2);
    await leaveScene(); assert.ok(revoked.includes(url));
  } finally { URL.revokeObjectURL = originalRevoke; }
});
test('missing portrait or failed download preserves playable fallback without using full card', async () => {
  for (const fail of [false,true]) {
    getGallery = async () => ({items:fail ? [portrait] : [{...portrait,variant:'PLAYABLE_CARD'}]});
    getArt = async () => { if(!fail) assert.fail('must not load full card'); throw new Error('403'); };
    await renderEntry(); await click('Avançar com firmeza');
    assert.equal(heroImages().length,0); assert.ok(renderer.root.findByProps({'aria-label':'Retrato indisponível de Iara'}));
    await click('Golpe'); assert.match(rendered(),/Resolver resposta/);
    await act(async()=>renderer.unmount()); renderer=null;
  }
});
test('late portrait response after leaving the page does not create an object URL', async () => {
  const pending=deferred(); let created=0; const originalCreate=URL.createObjectURL;
  URL.createObjectURL=blob=>{created++;return originalCreate(blob);};
  try {
    getGallery=async()=>({items:[portrait]}); getArt=()=>pending.promise;
    await renderEntry(); await leaveScene();
    await act(async()=>pending.resolve(new Blob(['old'])));
    assert.equal(created,0);
  } finally {URL.createObjectURL=originalCreate;}
});
test('broken portrait falls back without resetting combat', async () => {
  getGallery=async()=>({items:[portrait]});
  await renderEntry(); await click('Avançar com firmeza'); await click('Golpe');
  await act(async()=>heroImages()[0].props.onError());
  assert.equal(heroImages().length,0); assert.match(rendered(),/Resolver resposta/); assert.match(rendered(),/29 \/ 36/);
});
