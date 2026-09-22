/** Experimental Abrir passagem rules v1. No remote or time-based effects. */
export const CARDS = [
  { id: 'strike', name: 'Golpe', icon: '⚔', cost: 0, damage: 4, shield: 0, energy: 0, description: 'Causa 4 de dano. Sempre disponível na sua vez.' },
  { id: 'guard', name: 'Guarda', icon: '◇', cost: 1, damage: 0, shield: 7, energy: 0, description: 'Concede 7 de escudo até a próxima resposta.' },
  { id: 'focus', name: 'Concentração', icon: '◉', cost: 0, damage: 0, shield: 0, energy: 3, description: 'Recupera 3 de energia, até o máximo de 5.' },
  { id: 'technique', name: 'Técnica', icon: '✦', cost: 3, damage: 9, shield: 0, energy: 0, description: 'Causa 9 de dano.' },
  { id: 'mark', name: 'Poder da Marca', icon: '✧', cost: 4, damage: 12, shield: 4, energy: 0, description: '12 de dano e 4 de escudo. Uma vez por tentativa.' }
] as const;
export type CardId = typeof CARDS[number]['id'];
export type Approach = 'attack' | 'guard';
export type Phase = 'intro' | 'player' | 'response' | 'victory' | 'defeat' | 'retreat';
export type CombatEvent = { actor: 'hero' | 'enemy'; damage: number; hpRemoved: number; blocked: number; text: string };
export interface CombatState {
  phase: Phase; hp: number; enemy: number; energy: number; shield: number; round: number;
  markUsed: boolean; bonus: number; approach: Approach | null; actions: number; revision: number; log: CombatEvent[];
}
export type CombatAction = { type: 'approach'; approach: Approach; revision: number } | { type: 'card'; card: CardId; revision: number } | { type: 'respond'; revision: number };
export function freshCombat(): CombatState {
  return { phase: 'intro', hp: 28, enemy: 36, energy: 3, shield: 0, round: 1, markUsed: false, bonus: 0, approach: null, actions: 0, revision: 0, log: [] };
}
export const incomingDamage = (round: number) => round % 3 === 0 ? 9 : 4;
export function cardBlockReason(state: CombatState, card: typeof CARDS[number]): string | null {
  if (state.phase !== 'player') return 'Aguarde sua vez de escolher.';
  if (card.id === 'mark' && state.markUsed) return 'Marca já usada nesta tentativa.';
  if (state.energy < card.cost) return `Precisa de ${card.cost} de energia.`;
  return null;
}
export function combatReducer(state: CombatState, action: CombatAction): CombatState {
  // The rendered revision makes delayed/replayed clicks inert even across phases.
  if (action.revision !== state.revision) return state;
  if (action.type === 'approach') {
    if (state.phase !== 'intro' || !['attack', 'guard'].includes(action.approach)) return state;
    return { ...state, phase: 'player', approach: action.approach, bonus: action.approach === 'attack' ? 3 : 0, shield: action.approach === 'guard' ? 4 : 0, revision: state.revision + 1,
      log: [{ actor: 'hero', damage: 0, hpRemoved: 0, blocked: 0, text: action.approach === 'attack' ? 'Abordagem: avançar com firmeza. +3 no primeiro golpe.' : 'Abordagem: proteger a aproximação. +4 de escudo inicial.' }] };
  }
  if (action.type === 'card') {
    const card = CARDS.find((item) => item.id === action.card);
    if (!card || cardBlockReason(state, card)) return state;
    const damage = card.damage ? card.damage + state.bonus : 0;
    const energy = Math.min(5, state.energy - card.cost + card.energy);
    const enemy = Math.max(0, state.enemy - damage);
    const hpRemoved = state.enemy - enemy;
    const text = damage ? `${card.name}: ${damage} de dano ao Mandukuru (${hpRemoved} de Vida removida)${card.shield ? ` e +${card.shield} de escudo` : ''}.`
      : card.shield ? `Guarda: +${card.shield} de escudo até a próxima resposta.` : `Concentração: +${energy - state.energy} de energia.`;
    return { ...state, phase: enemy === 0 ? 'victory' : 'response', enemy, energy, shield: state.shield + card.shield,
      bonus: damage ? 0 : state.bonus, markUsed: state.markUsed || card.id === 'mark', actions: state.actions + 1,
      revision: state.revision + 1, log: [...state.log, { actor: 'hero', damage, hpRemoved, blocked: 0, text }] };
  }
  if (action.type !== 'respond' || state.phase !== 'response') return state;
  const blocked = Math.min(incomingDamage(state.round), state.shield);
  const damage = incomingDamage(state.round) - blocked;
  const hp = Math.max(0, state.hp - damage);
  const phase = hp === 0 ? 'defeat' : state.round >= 18 ? 'retreat' : 'player';
  return { ...state, hp, phase, shield: 0, energy: Math.min(5, state.energy + 1), round: phase === 'player' ? state.round + 1 : state.round,
    revision: state.revision + 1, log: [...state.log, { actor: 'enemy', damage, hpRemoved: state.hp - hp, blocked, text: `Mandukuru responde: ${damage} de dano (${state.hp - hp} de Vida removida), ${blocked} bloqueados. +1 de energia (máximo 5).` }] };
}
