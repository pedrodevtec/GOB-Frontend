export type UserRole = "PLAYER" | "ADMIN";

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  theme?: string | null;
}

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
}

export type Difficulty = "EASY" | "MEDIUM" | "HARD" | "ELITE";
export type CharacterStatus = "READY" | "WOUNDED" | "DEFEATED";
export type TradeStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELED" | "EXPIRED";
export type TradeAssetType = "ITEM" | "EQUIPMENT";
export type TradeAction = "ACCEPT" | "REJECT" | "CANCEL";
export type GameplayActionType =
  | "BOUNTY_HUNT"
  | "MISSION"
  | "TRAINING"
  | "NPC_INTERACTION"
  | "MARKET"
  | "PVP";

export type MarketActionType = "barter" | "scavenge";

export interface CharacterClass {
  id: string;
  name: string;
  tier?: number;
  evolvesFrom?: string | null;
  modifier?: string;
  description?: string;
  passive?: string;
  isBaseClass?: boolean;
  isAwakenedClass?: boolean;
  awakensTo?: string[];
  awakenLevelRequirement?: number | null;
}

export interface CharacterCustomization {
  avatarId?: string | null;
  titleId?: string | null;
  bannerId?: string | null;
}

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
  customization?: CharacterCustomization;
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
  classDetail?: CharacterClass;
  customization?: CharacterCustomization;
  inventory: CharacterInventorySnapshot;
  progression?: {
    currentXp: number;
    currentLevel: number;
    currentLevelFloorXp: number;
    nextLevelFloorXp: number;
    xpIntoLevel: number;
    xpForNextLevel: number;
    xpRemainingToNextLevel: number;
  };
  awakening?: {
    requiredLevel: number;
    currentClass: string;
    currentTier?: number;
    evolvesFrom?: string | null;
    isBaseClass: boolean;
    isAwakenedClass: boolean;
    available: boolean;
    hasRequiredItem: boolean;
    requiredItemType: string;
    requiredItemName: string;
    targetClasses: CharacterClass[];
  };
  recentGameplayActions: CharacterActionLog[];
}

export interface CharacterRankingEntry {
  position: number;
  score: number;
  metric: string;
  character: CharacterSummary;
}

export interface CharacterRankings {
  highestLevel: CharacterRankingEntry[];
  mostMissions: CharacterRankingEntry[];
  mostBounties: CharacterRankingEntry[];
}

export interface PublicProfileEquipment {
  id: string;
  name: string;
  category?: string;
  type?: string;
  img?: string;
  effect?: string;
  equippedAt?: string;
}

export interface DerivedStatDescriptions {
  attack?: string;
  defense?: string;
  maxHealth?: string;
  critChance?: string;
}

export interface PresentedStats {
  attack?: number;
  defense?: number;
  maxHealth?: number;
  critChance?: number;
  critChancePercent?: number;
  descriptions?: DerivedStatDescriptions;
  [key: string]: number | DerivedStatDescriptions | undefined;
}

export interface CharacterPublicProfile {
  id: string;
  name: string;
  level: number;
  xp: number;
  currentHealth: number;
  status: CharacterStatus;
  coins: number;
  className?: string;
  classDetail?: CharacterClass;
  customization?: CharacterCustomization;
  stats: PresentedStats;
  progression: {
    missionsCompleted: number;
    bountiesCompleted: number;
  };
  equipment: {
    totalEquipped: number;
    equipped: PublicProfileEquipment[];
  };
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
  assetKind?: "ITEM" | "EQUIPMENT";
  category?: string;
  type: string;
  img?: string;
  effect?: string;
  levelRequirement?: number;
  quantity: number;
  rarity?: string;
  equipped?: boolean;
}

export interface WalletSummary {
  gold: number;
  gems?: number;
  dust?: number;
}

export interface MarketWallet {
  inventoryId?: string | null;
  coins: number;
}

export interface MarketCatalogEntry {
  id: string;
  slug?: string;
  name: string;
  description: string;
  category?: string;
  type?: string;
  img?: string;
  effect?: string;
  levelRequirement?: number;
  assetKind?: string;
  buyPrice: number;
  currency?: string;
  rewardQuantity?: number;
  suggestedSellPrice?: number;
  canAfford: boolean;
}

export interface MarketSellableItem {
  id: string;
  name: string;
  category?: string;
  type?: string;
  img?: string;
  effect?: string;
  levelRequirement?: number;
  quantity: number;
  unitSellPrice: number;
  totalSellPrice: number;
}

export interface MarketSellableEquipment {
  id: string;
  name: string;
  category?: string;
  type?: string;
  img?: string;
  effect?: string;
  levelRequirement?: number;
  isEquipped: boolean;
  unitSellPrice: number;
}

export interface MarketOverview {
  wallet: MarketWallet;
  buyCatalog: MarketCatalogEntry[];
  sellableItems: MarketSellableItem[];
  sellableEquipments: MarketSellableEquipment[];
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
  role?: string;
  dialogue?: string;
  defeatPenalty?: {
    difficulty?: Difficulty;
    xpLossPercent?: number;
    coinsLossPercent?: number;
    forceDefeat?: boolean;
    description?: string;
  };
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
  stats?: PresentedStats;
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
  npcId?: string;
  npcName?: string;
  rewards: GameplayRewards;
  progression?: GameplayProgression;
  characterState: GameplayCharacterState;
  buff?: {
    percent: number;
    cost: number;
    expiresAt: string;
  };
  inventory?: {
    id?: string;
    coins: number;
  };
  combat?: GameplayCombat;
  defeatPenalty?: {
    difficulty?: Difficulty;
    xpLoss: number;
    coinsLoss: number;
    forceDefeat: boolean;
  } | null;
  availability?: {
    actionType?: GameplayActionType | string;
    nextAvailableAt?: string;
  };
  interactionType?: string;
  transaction?: {
    id?: string;
    type?: string;
    value?: number;
  };
}

export interface TradeAsset {
  id?: string;
  side?: "REQUESTER" | "TARGET";
  assetType: TradeAssetType;
  assetId: string;
  quantity: number;
}

export interface TradeCharacterRef {
  id: string;
  name: string;
  userId?: string;
}

export interface TradeRecord {
  id: string;
  status: TradeStatus;
  requesterCharacterId: string;
  targetCharacterId: string;
  offeredCoins: number;
  requestedCoins: number;
  note?: string | null;
  expiresAt?: string;
  createdAt?: string;
  requesterCharacter?: TradeCharacterRef;
  targetCharacter?: TradeCharacterRef;
  assets: TradeAsset[];
}

export interface TradeList {
  characterId: string;
  incoming: TradeRecord[];
  outgoing: TradeRecord[];
}

export interface PvpOverview {
  characterId: string;
  level: number;
  maxLevel: number;
  pvpUnlocked: boolean;
  requiredLevel: number;
  cooldownSeconds: number;
  availability: {
    available: boolean;
    nextAvailableAt?: string;
  };
  ranking: {
    rating: number;
    wins: number;
    losses: number;
  };
}

export interface PvpRankingEntry {
  position: number;
  rating: number;
  wins: number;
  losses: number;
  character: {
    id: string;
    name: string;
    level: number;
    status: CharacterStatus;
    class?: {
      id: string;
      name: string;
      tier?: number;
      modifier?: string;
    };
  };
}

export interface PvpRanking {
  requiredLevel: number;
  cooldownSeconds: number;
  entries: PvpRankingEntry[];
}

export interface PvpCombatRound {
  round: number;
  actor: "challenger" | "opponent";
  damage: number;
  remainingChallengerHealth: number;
  remainingOpponentHealth: number;
  critical: boolean;
}

export interface PvpMatchResult {
  match: {
    id: string;
    createdAt?: string;
    cooldownEndsAt?: string;
    winnerCharacterId: string;
    loserCharacterId: string;
  };
  challenger: {
    id: string;
    name: string;
    ratingBefore: number;
    ratingAfter: number;
    state: GameplayCharacterState;
    stats: PresentedStats;
  };
  opponent: {
    id: string;
    name: string;
    ratingBefore: number;
    ratingAfter: number;
    state: GameplayCharacterState;
    stats: PresentedStats;
  };
  combat: {
    winner: "challenger" | "opponent";
    challengerHealthRemaining: number;
    opponentHealthRemaining: number;
    challengerStats: PresentedStats;
    opponentStats: PresentedStats;
    rounds: PvpCombatRound[];
  };
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
  relatedId?: string;
  title?: string;
  level?: number;
  health?: number;
  attack?: number;
  defense?: number;
  experience?: number;
  monsterId?: string;
  recommendedLevel?: number;
  reward?: number;
  rewardXp?: number;
  timeLimit?: string;
  status?: string;
  enemyName?: string;
  enemyLevel?: number;
  enemyHealth?: number;
  enemyAttack?: number;
  enemyDefense?: number;
  rewardCoins?: number;
  trainingType?: string;
  xpReward?: number;
  coinsReward?: number;
  cooldownSeconds?: number;
  role?: string;
  interactionType?: string;
  dialogue?: string;
  slug?: string;
  category?: string;
  type?: string;
  img?: string;
  effect?: string;
  assetKind?: string;
  buyPrice?: number;
  currency?: string;
  rewardQuantity?: number;
  suggestedSellPrice?: number;
}
