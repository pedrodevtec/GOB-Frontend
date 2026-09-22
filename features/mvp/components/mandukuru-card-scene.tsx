"use client";

import { useEffect, useRef, useState } from 'react';
import { MvpState } from '@/components/states/mvp-state';
import { GuardianPageLoader } from '@/components/visual/guardian-page-loader';
import { useAuthStore } from '@/stores/auth-store';
import { hasUsableAccessToken } from '@/lib/auth/token-storage';
import { mvpService } from '@/features/mvp/services/mvp.service';
import { useCampaignResume, useMyMvpCharacter } from '@/features/mvp/hooks/use-mvp';
import { allowsScene, loadSceneCharacter, narrativeLink, outcomeText, sameScope, type AccessResume, type SceneCharacter, type SceneScope } from '@/features/mvp/card-demo/context';
import { CARDS, cardBlockReason, combatReducer, freshCombat, incomingDamage, type CombatAction } from '@/features/mvp/card-demo/engine';
import { useScenePortrait } from '@/features/mvp/card-demo/use-scene-portrait';
import styles from './mandukuru-card-scene.module.css';

export function MandukuruCardScenePage() {
  const resume = useCampaignResume('pilot-v1');
  const tableId = resume.data?.membership?.tableId;
  const character = useMyMvpCharacter(tableId);

  if (resume.isLoading || character.isLoading) {
    return <GuardianPageLoader title="Preparando a passagem" />;
  }

  if (resume.isError || character.isError) {
    return <MvpState variant="error" title="Não foi possível preparar o combate" description="Sua ficha continua guardada. Tente carregar a cena novamente." actions={[{ label: 'Tentar novamente', onClick: () => void Promise.all([resume.refetch(), character.refetch()]) }]} />;
  }

  if (!character.data) {
    return <MvpState variant="empty" title="Personagem não encontrado" description="Crie ou retome sua ficha antes de entrar nesta cena." actions={[{ label: 'Voltar para Meu personagem', href: '/meu-personagem' }]} />;
  }

  return <MandukuruCardSceneEntry
    resume={resume.data}
    characterId={character.data.id}
    tableId={tableId}
    revalidateResume={async () => {
      const result = await resume.refetch();
      if (result.isError || !result.data) throw new Error('SCENE_UNAVAILABLE');
      return result.data;
    }}
  />;
}

export function MandukuruCardSceneEntry({ resume, characterId, tableId, revalidateResume }: { resume?: AccessResume; characterId: string; tableId?: string; revalidateResume: () => Promise<AccessResume> }) {
  const userId = useAuthStore((state) => state.user?.id);
  const token = useAuthStore((state) => state.accessToken);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState<{ scope: SceneScope; character: SceneCharacter; generation: number } | null>(null);
  const [error, setError] = useState(false);
  const request = useRef(0);
  const generation = useRef(0);
  const scope: SceneScope = { userId: userId ?? '', session: token ?? '', tableId: tableId ?? '', characterId };
  const current = useRef(scope);
  current.current = scope;
  const eligible = hasUsableAccessToken(token) && allowsScene(resume, scope);
  const visible = eligible && loaded && sameScope(loaded.scope, scope);
  async function validate() {
    const ticket = ++request.current;
    const expected = current.current;
    setLoading(true); setError(false);
    try {
      const character = await loadSceneCharacter(expected, {
        currentScope: () => {
          const auth = useAuthStore.getState();
          return auth.user?.id === expected.userId && auth.accessToken === expected.session && hasUsableAccessToken(auth.accessToken) ? current.current : null;
        },
        getResume: revalidateResume,
        getCharacter: mvpService.getMyCharacter
      });
      if (ticket === request.current) setLoaded((previous) =>
        previous && sameScope(previous.scope, expected) && JSON.stringify(previous.character) === JSON.stringify(character)
          ? previous
          : { scope: expected, character, generation: ++generation.current });
    } catch {
      if (ticket === request.current) { setLoaded(null); setError(true); }
    } finally {
      if (ticket === request.current) setLoading(false);
    }
  }
  useEffect(() => {
    // Discard attempts on session/context changes, including a silent token rotation,
    // and validate whenever this dedicated page receives a complete context.
    request.current++;
    setLoaded(null); setLoading(false); setError(false);
    if (userId && token && tableId && characterId) void validate();
    else setError(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, token, tableId, characterId]);
  useEffect(() => {
    if (!loading && !eligible && loaded) { setLoaded(null); setError(true); }
  }, [eligible, loaded, loading]);
  useEffect(() => () => { request.current++; }, []);
  useEffect(() => {
    // Suspend the surface while checking access; identical context keeps the attempt mounted.
    const onFocus = () => { void validate(); };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revalidateResume]);

  return <section className={`rounded-[1.5rem] border border-[#b99b61]/35 p-3 shadow-[0_22px_60px_rgba(45,40,31,0.12)] sm:p-6 ${styles.scene}`}>
    <div className={styles.heading}>
      <div><h2>Abrir passagem</h2><p>Cena manual · Mandukuru provisório · Regras experimentais v1</p></div>
    </div>
    {loading && <p role="status" className={styles.notice}>Conferindo seu acesso e a história salva…</p>}
    {loaded && <div hidden={loading || !visible}>
      <PortraitEncounter key={loaded.generation} character={loaded.character} tableId={loaded.scope.tableId} suspended={loading || !visible} />
    </div>}
    {!loading && !visible && <div className={styles.notice} role="alert"><p>{error || !eligible ? 'A cena foi descartada: não foi possível confirmar seu personagem e acesso atuais.' : 'Carregue uma nova tentativa para conferir seu personagem.'}</p><button className={styles.control} onClick={() => void validate()}>Tentar novamente</button></div>}
  </section>;
}

function PortraitEncounter({ character, tableId, suspended }: { character: SceneCharacter; tableId: string; suspended: boolean }) {
  const portraitUrl = useScenePortrait(tableId, character.id, !suspended);
  return <MandukuruEncounter character={character} suspended={suspended} portraitUrl={portraitUrl} />;
}

/** Exported for isolated rendering; receives only the authorized allowlist projection. */
export function MandukuruEncounter({ character, suspended = false, portraitUrl }: { character: SceneCharacter; suspended?: boolean; portraitUrl?: string }) {
  const [failedPortrait, setFailedPortrait] = useState<string>();
  const [state, setState] = useState(freshCombat);
  const [attempt, setAttempt] = useState(0);
  const stateRef = useRef(state);
  stateRef.current = state;
  const focus = useRef<HTMLDivElement>(null);
  const firstCard = useRef<HTMLButtonElement>(null);
  const responseButton = useRef<HTMLButtonElement>(null);
  const introduction = useRef<HTMLHeadingElement>(null);
  const ended = ['victory', 'defeat', 'retreat'].includes(state.phase);
  const last = state.log.at(-1);
  useEffect(() => {
    if (suspended) return;
    if (ended) focus.current?.focus();
    else if (state.phase === 'response') responseButton.current?.focus();
    else if (state.phase === 'player') firstCard.current?.focus();
    else introduction.current?.focus();
  }, [state.phase, ended, attempt, suspended]);
  function act(action: CombatAction) {
    if (suspended) return;
    const next = combatReducer(stateRef.current, action);
    stateRef.current = next;
    setState(next);
  }
  function restart() { if (suspended) return; const fresh = freshCombat(); stateRef.current = fresh; setState(fresh); setAttempt((n) => n + 1); }
  return <div>
    <div className={styles.toolbar}><span>Vida 28 · Energia inicial 3 · Limite de 18 rodadas</span><button className={styles.control} onClick={restart}>Reiniciar cena</button></div>
    <div className={styles.stage}>
      {state.phase === 'intro' ? <div className={styles.introGrid}>
        <article className={styles.paper}>
          <p className={styles.eyebrow}>Antes do primeiro golpe</p>
          <h2 ref={introduction} tabIndex={-1}>{character.name}, há uma saída.</h2>
          {character.excerpt && <div><p className={styles.eyebrow}>Da sua história salva</p><blockquote>{character.excerpt}{character.truncated && <span aria-label="Trecho abreviado">…</span>}</blockquote></div>}
          <p>{narrativeLink(character)}</p>
          {character.motivation && <p>Seu motivo para seguir: “{character.motivation}{character.motivationTruncated && <span aria-label="Motivação abreviada">…</span>}”.</p>}
          <div className={styles.choices}>
            <button className={styles.control} onClick={() => act({ type: 'approach', approach: 'attack', revision: state.revision })}>Avançar com firmeza <small>+3 no primeiro golpe</small></button>
            <button className={styles.control} onClick={() => act({ type: 'approach', approach: 'guard', revision: state.revision })}>Proteger a aproximação <small>+4 de escudo inicial</small></button>
          </div>
        </article>
        <div className={styles.enemyIntro}><img src="/images/bravantus/enemies/mandukuru-sentinel-v1.webp" alt="Mandukuru, sentinela que bloqueia a passagem" /><span>Mandukuru · aparência provisória</span></div>
      </div> : <div className={styles.combat}>
        <article key={`hero-${attempt}-${state.revision}`} className={`${styles.fighter} ${last?.actor === 'hero' && last.damage ? styles.heroAttack : last?.actor === 'enemy' ? styles.hit : ''} ${state.phase === 'defeat' ? styles.defeated : ''}`}>
          {portraitUrl && portraitUrl !== failedPortrait
            ? <img className={styles.portrait} src={portraitUrl} alt={`Retrato de ${character.name}`} onError={() => setFailedPortrait(portraitUrl)} />
            : <div className={styles.avatar} role="img" aria-label={`Retrato indisponível de ${character.name}`}>✧</div>}
          <h2>{character.name}</h2><p>Vida <strong>{state.hp} / 28</strong></p><meter min={0} max={28} value={state.hp} aria-label="Vida do personagem" />
          <p>Energia <strong>{state.energy} / 5</strong><br />Escudo <strong>{state.shield}</strong></p>
          {state.bonus > 0 && <p><strong>Primeiro golpe: +{state.bonus} de dano pendente</strong></p>}
          {last?.actor === 'enemy' && <span className={styles.damage}>−{last.hpRemoved} Vida · {last.blocked} bloqueados</span>}
          {state.phase === 'defeat' && <strong>Derrota · Vida esgotada</strong>}
        </article>
        <article key={`enemy-${attempt}-${state.revision}`} className={`${styles.enemy} ${last?.actor === 'enemy' ? styles.enemyAttack : last?.damage ? styles.hit : ''} ${state.phase === 'victory' ? styles.defeated : ''}`}>
          <img src="/images/bravantus/enemies/mandukuru-sentinel-v1.webp" alt="Sentinela Mandukuru" />
          <div className={styles.enemyStats}><h2>Mandukuru</h2><p>Vida <strong>{state.enemy} / 36</strong></p><meter min={0} max={36} value={state.enemy} aria-label="Vida do Mandukuru" />
            {!ended && <p>A seguir: <strong>{incomingDamage(state.round) === 9 ? 'Golpe pesado' : 'Investida'} · {incomingDamage(state.round)} de dano</strong></p>}
            {last?.actor === 'hero' && last.damage > 0 && <span className={styles.damage}>−{last.hpRemoved} Vida</span>}
            {state.phase === 'victory' && <strong>Mandukuru derrotado</strong>}
          </div>
        </article>
      </div>}
    </div>
    {ended ? <div ref={focus} tabIndex={-1} className={styles.result}>
      <p className={styles.eyebrow}>{state.phase === 'victory' ? 'Vitória' : state.phase === 'defeat' ? 'Derrota' : 'Recuo'}</p>
      <h2>{state.phase === 'victory' ? 'O caminho está livre.' : state.phase === 'defeat' ? 'A tentativa chegou ao fim.' : 'É hora de recuar.'}</h2>
      <p>{outcomeText(character, state.phase)}</p><p>{state.actions} cartas escolhidas · {state.round} rodadas · {state.hp} de Vida restante</p>
      <button className={styles.control} onClick={restart}>Experimentar outra escolha</button>
    </div> : state.phase !== 'intro' && <div className={styles.narration}>
      <p role="status" aria-live="polite" aria-atomic="true">Rodada {state.round} de 18. {last?.text ?? 'Escolha sua primeira carta.'} {state.phase === 'response' ? 'Resolva a resposta quando quiser.' : 'Sua vez de escolher.'}</p>
      {state.phase === 'response' && <button ref={responseButton} className={styles.control} onClick={() => act({ type: 'respond', revision: state.revision })}>Resolver resposta · {incomingDamage(state.round)} de dano</button>}
    </div>}
    <div className={styles.cards} aria-label="Cinco habilidades experimentais">
      {CARDS.map((card, index) => {
        const reason = cardBlockReason(state, card);
        return <button ref={index === 0 ? firstCard : undefined} key={card.id} className={styles.card} aria-disabled={Boolean(reason) || suspended} onClick={() => act({ type: 'card', card: card.id, revision: state.revision })}>
          <span className={styles.cost}>{card.cost} EN</span><span className={styles.icon} aria-hidden="true">{card.icon}</span><strong>{card.name}</strong><span>{card.description}</span>{card.damage > 0 && state.bonus > 0 && !ended && <span>Dano com abordagem: {card.damage + state.bonus} (bônus +{state.bonus})</span>}
          <small>{ended ? 'Tentativa encerrada' : state.phase === 'intro' ? 'Escolha sua abordagem para começar' : reason ?? 'Disponível'}</small>
        </button>;
      })}
    </div>
    <p className={styles.help}>Uma carta por vez. Depois, resolva a resposta do Mandukuru. O escudo expira após a resposta; você recupera 1 de energia, até 5. Nada avança sozinho.</p>
    {state.log.length > 0 && <details className={styles.history}><summary>O que aconteceu nesta tentativa</summary><ol>{state.log.map((event, index) => <li key={index}>{event.text}</li>)}</ol></details>}
  </div>;
}
