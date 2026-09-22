import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { CARDS, combatReducer, freshCombat, incomingDamage, type CombatState, type CardId } from '../../features/mvp/card-demo/engine';
import { allowsScene, loadSceneCharacter, projectCharacter, narrativeLink, outcomeText, type AccessResume, type SceneScope } from '../../features/mvp/card-demo/context';
const start = (approach: 'attack' | 'guard' = 'attack') => combatReducer(freshCombat(), { type: 'approach', approach, revision: 0 });
const play = (s: CombatState, card: CardId) => combatReducer(s, { type: 'card', card, revision: s.revision });
const respond = (s: CombatState) => combatReducer(s, { type: 'respond', revision: s.revision });

test('fixed resources and five rule cards; shield approach stacks and expires', () => {
  assert.deepEqual(CARDS.map(c => [c.id,c.cost,c.damage,c.shield,c.energy]), [['strike',0,4,0,0],['guard',1,0,7,0],['focus',0,0,0,3],['technique',3,9,0,0],['mark',4,12,4,0]]);
  const s = freshCombat();
  assert.deepEqual([s.hp,s.enemy,s.energy,s.round], [28,36,3,1]);
  const defended = play(start('guard'), 'guard');
  assert.equal(defended.shield, 11);
  const next = respond(defended);
  assert.deepEqual([next.hp,next.shield,next.energy,next.round],[28,0,3,2]);
});
test('first damaging action consumes bonus; focus caps and reply restores energy', () => {
  const focus = play(start(), 'focus');
  assert.equal(focus.energy, 5); assert.equal(focus.bonus, 3);
  const hit = play(respond(focus), 'technique');
  assert.equal(hit.enemy, 24); assert.equal(hit.bonus, 0); assert.equal(hit.energy, 2);
  assert.equal(respond(hit).energy, 3);
  assert.deepEqual([incomingDamage(1),incomingDamage(2),incomingDamage(3),incomingDamage(6)], [4,4,9,9]);
});
test('invalid, duplicated and delayed commands cannot resolve another phase', () => {
  const s = start();
  assert.equal(play(s, 'mark'), s);
  assert.equal(play(s, 'unknown' as CardId), s);
  assert.equal(respond(s), s);
  const action = { type: 'card' as const, card: 'strike' as const, revision: s.revision };
  const hit = combatReducer(s, action);
  assert.equal(combatReducer(hit, action), hit);
  const next = respond(hit);
  assert.equal(combatReducer(next, action), next);
  assert.equal(respond(next), next);
});
test('mark grants damage plus shield and cannot be reused', () => {
  const s = { ...start('guard'), energy: 5 };
  const hit = play(s, 'mark');
  assert.deepEqual([hit.enemy,hit.energy,hit.shield,hit.markUsed],[24,1,8,true]);
  const next = { ...respond(hit), energy: 5 };
  assert.equal(play(next, 'mark'), next);
});
test('immediate victory blocks retaliation and every terminal state blocks actions', () => {
  const won = play({ ...start(), enemy: 4 }, 'strike');
  assert.equal(won.phase,'victory'); assert.equal(won.hp,28);
  const lost = respond(play({ ...start(), hp: 1 }, 'focus'));
  assert.equal(lost.phase,'defeat'); assert.equal(lost.hp,0);
  const retreat = respond(play({ ...start('guard'), round: 18, shield: 20 }, 'focus'));
  assert.equal(retreat.phase,'retreat'); assert.equal(retreat.round,18);
  for (const s of [won,lost,retreat]) { assert.equal(respond(s),s); assert.equal(play(s,'strike'),s); }
  const fresh = freshCombat(); assert.equal(fresh.actions,0); assert.equal(fresh.markUsed,false); assert.equal(fresh.log.length,0); assert.equal(fresh.shield,0);
});
test('reachable manual play produces victory, defeat and 18-round retreat', () => {
  let victory = start();
  for (const card of ['technique','focus','mark','strike','strike','strike'] as CardId[]) {
    victory = play(victory,card); if(victory.phase === 'response') victory = respond(victory);
  }
  assert.equal(victory.phase,'victory');
  let defeat = start(); while(defeat.phase === 'player') defeat = respond(play(defeat,'focus'));
  assert.equal(defeat.phase,'defeat');
  let retreat = start('guard'); while(retreat.phase === 'player') retreat = respond(play(retreat,'guard'));
  assert.equal(retreat.phase,'retreat'); assert.equal(retreat.round,18);
});
const scope: SceneScope = { userId:'u1',session:'session-a',tableId:'t1',characterId:'c1' };
const resume: AccessResume = { membership:{id:'m1',tableId:'t1',role:'PLAYER',status:'ACTIVE'},character:{id:'c1'},consent:{status:'ACCEPTED'},journeyState:'CHARACTER_DRAFT' };
const source = { id:'c1',tableId:'t1',name:'Iara',ownerUserId:'u1',personalHistory:'Nasci perto do rio. Guardo uma semente.',masterFeedback:'SECRET',creativeDossier:{beforeMark:'Outra história',desire:'Encontrar um lar',contact:'PRIVATE',creatorName:'PRIVATE'} };
test('narrative allowlist quotes faithfully, uses neutral linkage and excludes private data', () => {
  const p = projectCharacter(source);
  assert.equal(p.name,'Iara'); assert.equal(p.excerpt,source.personalHistory);
  assert.deepEqual(Object.keys(p), ['id','name','excerpt','truncated','motivation','motivationTruncated']);
  assert.doesNotMatch(JSON.stringify(p), /SECRET|PRIVATE|Outra história/);
  assert.match(narrativeLink(p), /Sua história acompanha/);
  assert.match(outcomeText(p,'victory'), /Encontrar um lar/);
  const empty = projectCharacter({id:'c1',tableId:'t1',name:''}); assert.equal(empty.excerpt,''); assert.match(narrativeLink(empty),/ruínas/);
  const html = projectCharacter({...source,personalHistory:'<img src=x onerror=alert(1)>'}); assert.equal(html.excerpt,'<img src=x onerror=alert(1)>');
  const long = projectCharacter({...source,personalHistory:'x'.repeat(500)}); assert.equal(long.excerpt.length,420); assert.equal(long.truncated,true);
  assert.equal(projectCharacter({...source,personalHistory:''}).excerpt,'Outra história');
});
test('access rejects missing, changed, unknown, blocked and revoked context', () => {
  assert.equal(allowsScene(resume,scope),true);
  for(const r of [null, {}, {...resume,journeyState:'UNKNOWN'}, {...resume,journeyState:'BLOCKED'}, {...resume,consent:{status:'REVOKED'}}, {...resume,membership:{...resume.membership!,status:'REMOVED'}}, {...resume,membership:{...resume.membership!,role:'MASTER'}}, {...resume,character:{id:'c2'}}]) assert.equal(allowsScene(r,scope),false);
  assert.equal(allowsScene(resume,{...scope,session:''}),false);
});
test('fresh loader sequences resume and authorized own-sheet reads, and refuses failures', async () => {
  const calls:string[] = [];
  const deps = { currentScope:()=>scope, getResume:async()=>{calls.push('resume');return resume;},getCharacter:async(tableId:string)=>{calls.push(tableId);return source;} };
  assert.equal((await loadSceneCharacter(scope,deps)).name,'Iara'); assert.deepEqual(calls,['resume','t1']);
  await assert.rejects(loadSceneCharacter(scope,{...deps,getResume:async()=>{throw new Error('403');}}));
  await assert.rejects(loadSceneCharacter(scope,{...deps,getCharacter:async()=>{throw new Error('network');}}));
  for(const character of [null,{...source,id:'c2'},{...source,tableId:'t2'},{...source,ownerUserId:'u2'}]) await assert.rejects(loadSceneCharacter(scope,{...deps,getCharacter:async()=>character}));
});
test('in-flight account, token, table and character changes discard prior data', async () => {
  for(const change of [{userId:'u2'},{session:'session-b'},{tableId:'t2'},{characterId:'c2'}]) {
    let current = scope;
    let read = false;
    await assert.rejects(loadSceneCharacter(scope,{currentScope:()=>current,getResume:async()=>{current={...scope,...change};return resume;},getCharacter:async()=>{read=true;return source;}}));
    assert.equal(read,false);
    current = scope;
    await assert.rejects(loadSceneCharacter(scope,{currentScope:()=>current,getResume:async()=>resume,getCharacter:async()=>{current={...scope,...change};return source;}}));
  }
});

test('Unicode excerpts preserve code points and mark shortened motivation', () => {
  const p = projectCharacter({ ...source, personalHistory: '🌿'.repeat(421), creativeDossier: { desire: '🛡'.repeat(241) } });
  assert.equal(Array.from(p.excerpt).length, 420);
  assert.equal(Array.from(p.motivation).length, 240);
  assert.equal(p.truncated, true); assert.equal(p.motivationTruncated, true);
  assert.equal(p.excerpt.endsWith('🌿'), true);
  assert.match(outcomeText(p, 'victory'), /…”. /);
});
test('overkill reports nominal damage and actual life removed separately', () => {
  const won = play({ ...start(), enemy: 2 }, 'technique');
  assert.equal(won.log.at(-1)?.damage, 12);
  assert.equal(won.log.at(-1)?.hpRemoved, 2);
  const lost = respond(play({ ...start(), hp: 1 }, 'focus'));
  assert.equal(lost.log.at(-1)?.damage, 4);
  assert.equal(lost.log.at(-1)?.hpRemoved, 1);
});
