export type UserRole = "PLAYER" | "ADMIN";

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: UserRole;
}

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
}

export type Difficulty = "EASY" | "MEDIUM" | "HARD" | "ELITE";
export type CharacterStatus = "READY" | "WOUNDED" | "DEFEATED";
export type GameplayActionType =
  | "BOUNTY_HUNT"
  | "MISSION"
  | "TRAINING"
  | "NPC_INTERACTION"
  | "MARKET";

export type MarketActionType = "barter" | "scavenge";

export interface CharacterSummary {
  id: string;
  name: string;
  level: number;
  xp: number;
  hp: number;
  currentHealth: number;
  stamina: number;
  gold: number;
  status: CharacterStatus;
  className?: string;
  location?: string;
}

export interface CharacterInventorySnapshot {
  id: string | null;
  coins: number;
  totalItems: number;
  totalEquipments: number;
}

export interface CharacterActionLog {
  id: string;
  actionType: GameplayActionType;
  referenceId: string;
  outcome: string;
  availableAt?: string;
  createdAt: string;
}

export interface CharacterDetailSummary {
  id: string;
  name: string;
  level: number;
  xp: number;
  currentHealth: number;
  status: CharacterStatus;
  className?: string;
  inventory: CharacterInventorySnapshot;
  recentGameplayActions: CharacterActionLog[];
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  claimable: boolean;
  gold?: number;
  xp?: number;
  items?: string[];
}

export interface InventoryItem {
  id: string;
  name: string;
  type: string;
  quantity: number;
  rarity?: string;
  equipped?: boolean;
}

export interface WalletSummary {
  gold: number;
  gems?: number;
  dust?: number;
}

export interface GameplayEntity {
  id: string;
  name: string;
  description: string;
  difficulty: Difficulty;
  rewardHint?: string;
  unlocked?: boolean;
  actionType?: GameplayActionType;
  cooldownSeconds?: number;
  interactionType?: string;
  recommendedLevel?: number;
  nextAvailableAt?: string;
  activeUntil?: string;
  marketAction?: MarketActionType;
}

export interface GameplayCharacterState {
  currentHealth: number;
  maxHealth: number;
  status: CharacterStatus;
  lastCombatAt?: string;
  lastRecoveredAt?: string;
}

export interface GameplayProgression {
  previousXp: number;
  currentXp: number;
  previousLevel: number;
  currentLevel: number;
  levelUps: number;
}

export interface GameplayCombatRound {
  round?: number;
  actor?: "character" | "monster";
  damage?: number;
  attacker?: string;
  defender?: string;
  remainingCharacterHealth?: number;
  remainingEnemyHealth?: number;
  characterHealth?: number;
  enemyHealth?: number;
}

export interface GameplayCombat {
  victory: boolean;
  characterHealthRemaining: number;
  enemyHealthRemaining: number;
  rounds: GameplayCombatRound[];
}

export interface GameplayRewards {
  xp: number;
  coins: number;
  items: string[];
}

export interface GameplayActionResult {
  action: GameplayActionType;
  enemy?: string;
  note?: string;
  marketAction?: MarketActionType;
  rewards: GameplayRewards;
  progression?: GameplayProgression;
  characterState: GameplayCharacterState;
  inventory?: {
    id?: string;
    coins: number;
  };
  combat?: GameplayCombat;
  availability?: {
    actionType?: GameplayActionType | string;
    nextAvailableAt?: string;
  };
  interactionType?: string;
}

export interface TransactionRecord {
  id: string;
  description: string;
  type: string;
  amount: number;
  createdAt: string;
}

export interface AdminEntity {
  id: string;
  name: string;
  description: string;
  difficulty?: Difficulty;
  active?: boolean;
}
