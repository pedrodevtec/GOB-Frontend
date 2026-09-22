/** Only this allowlist crosses from the authorized sheet into encounter content. */
export interface NarrativeSource {
  id: string; tableId: string; name: string; ownerUserId?: string;
  personalHistory?: string; narrativeBond?: string;
  creativeDossier?: { beforeMark?: string; desire?: string };
}
export interface SceneCharacter { id: string; name: string; excerpt: string; truncated: boolean; motivation: string; motivationTruncated: boolean }
const text = (value: unknown) => typeof value === 'string' ? value.trim() : '';
export function projectCharacter(source: NarrativeSource): SceneCharacter {
  const history = Array.from(text(source.personalHistory) || text(source.creativeDossier?.beforeMark));
  const motivation = Array.from(text(source.creativeDossier?.desire) || text(source.narrativeBond));
  return { id: source.id, name: text(source.name) || 'Seu Guardião', excerpt: history.slice(0, 420).join(''), truncated: history.length > 420,
    motivation: motivation.slice(0, 240).join(''), motivationTruncated: motivation.length > 240 };
}
export function narrativeLink(character: SceneCharacter): string {
  return character.excerpt
    ? 'Sua história acompanha você até estas ruínas. Nesta cena experimental, o desafio é decidir como abrir a passagem diante do Mandukuru.'
    : 'Entre as ruínas e o caminho adiante, um Mandukuru bloqueia a passagem. Nesta cena experimental, você decide como atravessar.';
}
export function outcomeText(character: SceneCharacter, phase: string): string {
  const outcome = phase === 'victory' ? `${character.name}, o Mandukuru cede e a passagem está livre.`
    : phase === 'retreat' ? `${character.name}, após 18 rodadas, é hora de recuar e preparar outra estratégia.`
    : `${character.name}, sua Vida chegou a zero. A tentativa termina diante do Mandukuru.`;
  return `${outcome} ${character.motivation ? `Seu motivo para seguir continua: “${character.motivation}${character.motivationTruncated ? '…' : ''}”.` : character.excerpt ? 'A história que trouxe você até aqui continua sua.' : 'Você pode tentar outra abordagem.'} Sua ficha e a história da mesa permanecem intactas.`;
}
export interface AccessResume {
  membership?: { id: string; tableId: string; status: string; role: string } | null;
  character?: { id: string } | null; consent?: { status: string } | null; journeyState?: string;
}
export interface SceneScope { userId: string; session: string; tableId: string; characterId: string }
const eligibleJourneys = new Set(['CHARACTER_DRAFT', 'CHANGES_REQUIRED', 'SURVEY_REQUIRED', 'COMPLETED_PENDING_REVIEW', 'COMPLETED_CHANGES_REQUIRED', 'COMPLETED_APPROVED']);
export function allowsScene(resume: AccessResume | null | undefined, scope: SceneScope): boolean {
  return Boolean(scope.userId && scope.session && scope.tableId && scope.characterId && resume?.membership?.id
    && resume.membership.status === 'ACTIVE' && resume.membership.role === 'PLAYER'
    && resume.membership.tableId === scope.tableId && resume.character?.id === scope.characterId
    && resume.consent?.status === 'ACCEPTED' && eligibleJourneys.has(resume.journeyState ?? ''));
}
export function sameScope(a: SceneScope, b: SceneScope | null): boolean {
  return Boolean(b && a.userId === b.userId && a.session === b.session && a.tableId === b.tableId && a.characterId === b.characterId);
}
export async function loadSceneCharacter(scope: SceneScope, deps: {
  currentScope: () => SceneScope | null;
  getResume: () => Promise<AccessResume>;
  getCharacter: (tableId: string) => Promise<NarrativeSource | null>;
}): Promise<SceneCharacter> {
  const valid = () => sameScope(scope, deps.currentScope());
  if (!valid()) throw new Error('SCENE_CONTEXT_CHANGED');
  const resume = await deps.getResume();
  if (!valid() || !allowsScene(resume, scope)) throw new Error('SCENE_UNAVAILABLE');
  const source = await deps.getCharacter(scope.tableId);
  if (!valid() || !source || source.id !== scope.characterId || source.tableId !== scope.tableId
    || (source.ownerUserId && source.ownerUserId !== scope.userId)) throw new Error('SCENE_UNAVAILABLE');
  return projectCharacter(source);
}
