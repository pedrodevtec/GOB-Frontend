import { AxiosError } from "axios";

import { apiClient } from "@/lib/api/client";
import {
  ApiContractNotConfiguredError,
  ApiRequestError
} from "@/lib/api/errors";
import type {
  AdminEntity,
  AuthSession,
  AuthUser,
  CharacterClass,
  CharacterActionLog,
  CharacterDetailSummary,
  CharacterPublicProfile,
  CharacterRankingEntry,
  CharacterRankings,
  CharacterSummary,
  GameplayActionResult,
  GameplayCombat,
  GameplayCombatRound,
  GameplayEntity,
  GameplayProgression,
  InventoryItem,
  MarketActionType,
  MarketCatalogEntry,
  MarketOverview,
  MarketSellableEquipment,
  MarketSellableItem,
  PublicProfileEquipment,
  Reward,
  TransactionRecord,
  WalletSummary
} from "@/types/app";

type Dict = Record<string, unknown>;

const ARRAY_KEYS = [
  "data",
  "items",
  "results",
  "rows",
  "claims",
  "catalog",
  "characters",
  "journey",
  "monsters",
  "bounties",
  "missions",
  "trainings",
  "npcs",
  "inventory",
  "transactions",
  "orders",
  "classes",
  "activities",
  "recentGameplayActions",
  "recentTransactions",
  "rounds"
];

function isObject(value: unknown): value is Dict {
  return typeof value === "object" && value !== null;
}

function asRecord(value: unknown): Dict {
  return isObject(value) ? value : {};
}

function pickRecord(value: unknown, keys: string[]): Dict | null {
  if (!isObject(value)) return null;

  for (const key of keys) {
    const candidate = value[key];
    if (isObject(candidate)) return candidate;
  }

  return null;
}

function pickArray(value: unknown, keys: string[]): unknown[] | null {
  if (!isObject(value)) return null;

  for (const key of keys) {
    const candidate = value[key];
    if (Array.isArray(candidate)) return candidate;
  }

  return null;
}

function asArray<T>(value: unknown, mapper: (entry: unknown) => T): T[] {
  if (Array.isArray(value)) return value.map(mapper);
  const wrapped = pickArray(value, ARRAY_KEYS);
  return wrapped ? wrapped.map(mapper) : [];
}

function unwrapEntity(value: unknown): Dict {
  return (
    pickRecord(value, [
      "data",
      "item",
      "result",
      "user",
      "character",
      "profile",
      "wallet",
      "summary",
      "order"
    ]) ?? asRecord(value)
  );
}

function toStringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function toNumberValue(value: unknown, fallback = 0) {
  return typeof value === "number" ? value : fallback;
}

function toBooleanValue(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function mapUser(input: unknown): AuthUser {
  const record = unwrapEntity(input);
  return {
    id: toStringValue(record.id),
    email: toStringValue(record.email),
    username:
      toStringValue(record.username) ||
      toStringValue(record.nome) ||
      toStringValue(record.name),
    role: (toStringValue(record.role, "PLAYER") as AuthUser["role"]) ?? "PLAYER"
  };
}

function mapClassName(input: unknown) {
  if (isObject(input)) {
    return toStringValue(input.name);
  }
  return toStringValue(input);
}

function mapCharacter(input: unknown): CharacterSummary {
  const record = unwrapEntity(input);
  const inventory = asRecord(record.inventory);
  return {
    id: toStringValue(record.id),
    name: toStringValue(record.name ?? record.nome ?? record.title),
    level: toNumberValue(record.level),
    xp: toNumberValue(record.xp),
    hp: toNumberValue(record.currentHealth ?? record.hp ?? record.health),
    currentHealth: toNumberValue(record.currentHealth ?? record.hp ?? record.health),
    stamina: toNumberValue(record.stamina),
    gold: toNumberValue(record.gold ?? inventory.coins ?? record.coins ?? record.wallet),
    status: toStringValue(record.status, "READY") as CharacterSummary["status"],
    className: mapClassName(record.className ?? record.classId ?? record.class),
    location: toStringValue(record.location ?? record.lastCheckpoint)
  };
}

function mapCharacterActionLog(input: unknown): CharacterActionLog {
  const record = unwrapEntity(input);
  return {
    id: toStringValue(record.id),
    actionType: toStringValue(record.actionType) as CharacterActionLog["actionType"],
    referenceId: toStringValue(record.referenceId),
    outcome: toStringValue(record.outcome),
    availableAt: toStringValue(record.availableAt) || undefined,
    createdAt: toStringValue(record.createdAt)
  };
}

function mapCharacterSummaryDetail(input: unknown): CharacterDetailSummary {
  const record = unwrapEntity(input);
  const inventory = asRecord(record.inventory);
  return {
    id: toStringValue(record.id),
    name: toStringValue(record.name),
    level: toNumberValue(record.level),
    xp: toNumberValue(record.xp),
    currentHealth: toNumberValue(record.currentHealth ?? record.hp ?? record.health),
    status: toStringValue(record.status, "READY") as CharacterDetailSummary["status"],
    className: mapClassName(record.className ?? record.classId ?? record.class),
    inventory: {
      id: toStringValue(inventory.id) || null,
      coins: toNumberValue(inventory.coins ?? record.gold ?? record.coins),
      totalItems: toNumberValue(inventory.totalItems),
      totalEquipments: toNumberValue(inventory.totalEquipments)
    },
    recentGameplayActions: asArray(record.recentGameplayActions, mapCharacterActionLog)
  };
}

function mapCharacterClass(input: unknown): CharacterClass {
  const record = unwrapEntity(input);
  return {
    id: toStringValue(record.id),
    name: toStringValue(record.name),
    modifier: toStringValue(record.modifier) || undefined,
    description: toStringValue(record.description) || undefined,
    passive: toStringValue(record.passive) || undefined
  };
}

function mapPublicProfileEquipment(input: unknown): PublicProfileEquipment {
  const record = unwrapEntity(input);
  return {
    id: toStringValue(record.id),
    name: toStringValue(record.name),
    category: toStringValue(record.category) || undefined,
    type: toStringValue(record.type) || undefined,
    img: toStringValue(record.img) || undefined,
    effect: toStringValue(record.effect) || undefined
  };
}

function mapRankingEntry(input: unknown): CharacterRankingEntry {
  const record = asRecord(input);
  const characterSource =
    pickRecord(record, ["character", "player", "profile"]) ?? asRecord(record.character);
  return {
    position: toNumberValue(record.position),
    score: toNumberValue(record.score),
    metric: toStringValue(record.metric),
    character: mapCharacter(characterSource)
  };
}

function mapCharacterRankings(input: unknown): CharacterRankings {
  const record = unwrapEntity(input);
  const rankingsContainer = asRecord(
    record.rankings ?? record.leaderboard ?? record.result ?? record
  );
  const rankings = asRecord(rankingsContainer.rankings ?? rankingsContainer);

  return {
    highestLevel: asArray(rankings.highestLevel, mapRankingEntry),
    mostMissions: asArray(rankings.mostMissions, mapRankingEntry),
    mostBounties: asArray(rankings.mostBounties, mapRankingEntry)
  };
}

function mapCharacterPublicProfile(input: unknown): CharacterPublicProfile {
  const record = unwrapEntity(input);
  const progression = asRecord(record.progression);
  const equipment = asRecord(record.equipment);
  const statsSource = asRecord(record.stats);
  const stats: Record<string, number> = {};

  for (const [key, value] of Object.entries(statsSource)) {
    if (typeof value === "number") {
      stats[key] = value;
    }
  }

  return {
    id: toStringValue(record.id),
    name: toStringValue(record.name),
    level: toNumberValue(record.level),
    xp: toNumberValue(record.xp),
    currentHealth: toNumberValue(record.currentHealth ?? record.hp ?? record.health),
    status: toStringValue(record.status, "READY") as CharacterPublicProfile["status"],
    coins: toNumberValue(record.coins ?? record.gold),
    className: mapClassName(record.className ?? record.classId ?? record.class),
    stats,
    progression: {
      missionsCompleted: toNumberValue(progression.missionsCompleted),
      bountiesCompleted: toNumberValue(progression.bountiesCompleted)
    },
    equipment: {
      totalEquipped: toNumberValue(equipment.totalEquipped),
      equipped: asArray(equipment.equipped, mapPublicProfileEquipment)
    }
  };
}

function mapReward(input: unknown): Reward {
  const record = unwrapEntity(input);
  const metadata = asRecord(record.metadata);
  return {
    id: toStringValue(record.id ?? record.claimKey),
    title: toStringValue(record.title ?? record.type, "Reward"),
    description:
      toStringValue(record.description) ||
      toStringValue(record.message) ||
      "Recompensa processada.",
    claimable: toBooleanValue(record.claimable ?? record.canClaim, true),
    gold: toNumberValue(record.gold ?? record.coins ?? record.reward ?? record.value),
    xp: toNumberValue(record.xp ?? record.rewardXp),
    items: Array.isArray(record.items)
      ? record.items.map((item) => String(item))
      : Array.isArray(metadata.items)
        ? metadata.items.map((item) => String(item))
        : []
  };
}

function mapInventoryItem(input: unknown): InventoryItem {
  const record = unwrapEntity(input);
  return {
    id: toStringValue(record.id),
    name: toStringValue(record.name ?? record.title),
    type: toStringValue(record.type ?? record.category, "ITEM"),
    quantity: toNumberValue(record.quantity, 1),
    rarity: toStringValue(record.rarity),
    equipped: toBooleanValue(record.equipped ?? record.isEquipped)
  };
}

function mapInventoryCollection(input: unknown): InventoryItem[] {
  if (Array.isArray(input)) {
    return input.map(mapInventoryItem);
  }

  const record = unwrapEntity(input);
  const inventoryRecord = asRecord(record.inventory);
  const rootItems = Array.isArray(record.items) ? record.items.map(mapInventoryItem) : [];
  const rootEquipments = Array.isArray(record.equipments)
    ? record.equipments.map((entry) =>
        mapInventoryItem({
          ...asRecord(entry),
          type: asRecord(entry).type ?? asRecord(entry).category ?? "EQUIPMENT"
        })
      )
    : [];
  const nestedItems = Array.isArray(inventoryRecord.items)
    ? inventoryRecord.items.map(mapInventoryItem)
    : [];
  const nestedEquipments = Array.isArray(inventoryRecord.equipments)
    ? inventoryRecord.equipments.map((entry) =>
        mapInventoryItem({
          ...asRecord(entry),
          type: asRecord(entry).type ?? asRecord(entry).category ?? "EQUIPMENT"
        })
      )
    : [];

  const merged = [...rootItems, ...rootEquipments, ...nestedItems, ...nestedEquipments];
  if (merged.length) {
    return merged;
  }

  return asArray(input, mapInventoryItem);
}

function mapWallet(input: unknown): WalletSummary {
  const record = unwrapEntity(input);
  return {
    gold: toNumberValue(record.gold ?? record.coins ?? record.balance),
    gems: toNumberValue(record.gems),
    dust: toNumberValue(record.dust)
  };
}

function mapMarketCatalogEntry(input: unknown): MarketCatalogEntry {
  const record = unwrapEntity(input);
  return {
    id: toStringValue(record.id),
    slug: toStringValue(record.slug) || undefined,
    name: toStringValue(record.name ?? record.title),
    description:
      toStringValue(record.description) ||
      toStringValue(record.effect) ||
      "Sem descricao detalhada.",
    category: toStringValue(record.category) || undefined,
    type: toStringValue(record.type) || undefined,
    img: toStringValue(record.img) || undefined,
    effect: toStringValue(record.effect) || undefined,
    assetKind: toStringValue(record.assetKind) || undefined,
    buyPrice: toNumberValue(record.buyPrice),
    currency: toStringValue(record.currency) || undefined,
    rewardQuantity: toNumberValue(record.rewardQuantity) || undefined,
    suggestedSellPrice: toNumberValue(record.suggestedSellPrice) || undefined,
    canAfford: toBooleanValue(record.canAfford, false)
  };
}

function mapMarketSellableItem(input: unknown): MarketSellableItem {
  const record = unwrapEntity(input);
  return {
    id: toStringValue(record.id),
    name: toStringValue(record.name),
    category: toStringValue(record.category) || undefined,
    type: toStringValue(record.type) || undefined,
    img: toStringValue(record.img) || undefined,
    effect: toStringValue(record.effect) || undefined,
    quantity: toNumberValue(record.quantity),
    unitSellPrice: toNumberValue(record.unitSellPrice),
    totalSellPrice: toNumberValue(record.totalSellPrice)
  };
}

function mapMarketSellableEquipment(input: unknown): MarketSellableEquipment {
  const record = unwrapEntity(input);
  return {
    id: toStringValue(record.id),
    name: toStringValue(record.name),
    category: toStringValue(record.category) || undefined,
    type: toStringValue(record.type) || undefined,
    img: toStringValue(record.img) || undefined,
    effect: toStringValue(record.effect) || undefined,
    isEquipped: toBooleanValue(record.isEquipped),
    unitSellPrice: toNumberValue(record.unitSellPrice)
  };
}

function mapMarketOverview(input: unknown): MarketOverview {
  const record = unwrapEntity(input);
  const market = asRecord(record.market ?? record);
  const wallet = asRecord(market.wallet);

  return {
    wallet: {
      inventoryId: toStringValue(wallet.inventoryId) || null,
      coins: toNumberValue(wallet.coins)
    },
    buyCatalog: asArray(market.buyCatalog, mapMarketCatalogEntry),
    sellableItems: asArray(market.sellableItems, mapMarketSellableItem),
    sellableEquipments: asArray(market.sellableEquipments, mapMarketSellableEquipment)
  };
}

function mapGameplayEntity(input: unknown): GameplayEntity {
  const record = unwrapEntity(input);
  const title = toStringValue(record.title ?? record.name ?? record.label ?? record.key);
  const rewardXp = toNumberValue(record.rewardXp ?? record.xpReward);
  const rewardCoins = toNumberValue(record.reward ?? record.rewardCoins ?? record.coinsReward);
  const interactionType = toStringValue(record.interactionType).toLowerCase() || undefined;

  return {
    id: toStringValue(record.id),
    name: title,
    description:
      toStringValue(record.description) ||
      toStringValue(record.dialogue) ||
      toStringValue(record.role) ||
      "Sem descricao detalhada na API.",
    difficulty: (toStringValue(record.difficulty, "MEDIUM") as GameplayEntity["difficulty"]) ?? "MEDIUM",
    rewardHint:
      rewardXp || rewardCoins
        ? `XP ${rewardXp} • Gold ${rewardCoins}`
        : undefined,
    unlocked: toBooleanValue(record.isActive, true),
    actionType: interactionType === "healer" ? "NPC_INTERACTION" : undefined,
    cooldownSeconds: toNumberValue(record.cooldownSeconds) || undefined,
    interactionType,
    recommendedLevel: toNumberValue(record.recommendedLevel) || undefined,
    nextAvailableAt:
      toStringValue(record.nextAvailableAt) ||
      toStringValue(record.availableAt) ||
      undefined,
    activeUntil: toStringValue(record.timeLimit) || undefined
  };
}

function mapTransaction(input: unknown): TransactionRecord {
  const record = unwrapEntity(input);
  return {
    id: toStringValue(record.id),
    description:
      toStringValue(record.description) ||
      toStringValue(record.title) ||
      toStringValue(record.status, "Transacao"),
    type: toStringValue(record.type ?? record.status),
    amount: toNumberValue(record.amount ?? record.value ?? record.total ?? record.totalPrice),
    createdAt: toStringValue(record.createdAt ?? record.updatedAt ?? record.timeLimit)
  };
}

function mapAdminEntity(input: unknown): AdminEntity {
  const record = unwrapEntity(input);
  const monster = asRecord(record.monster);
  return {
    id: toStringValue(record.id),
    name: toStringValue(record.name ?? record.title ?? monster.name),
    description:
      toStringValue(record.description) ||
      toStringValue(monster.name) ||
      toStringValue(record.dialogue) ||
      toStringValue(record.enemyName) ||
      "Sem descricao detalhada.",
    difficulty: toStringValue(record.difficulty) as AdminEntity["difficulty"],
    active: toBooleanValue(record.isActive, true),
    relatedId: toStringValue(record.monsterId) || undefined
  };
}

function mapGameplayCombatRound(input: unknown): GameplayCombatRound {
  const record = unwrapEntity(input);
  const actor = toStringValue(record.actor) || undefined;
  const rawCharacterHealth = record.remainingCharacterHealth ?? record.characterHealth;
  const rawEnemyHealth = record.remainingEnemyHealth ?? record.enemyHealth;
  const remainingCharacterHealth =
    typeof rawCharacterHealth === "number" ? rawCharacterHealth : undefined;
  const remainingEnemyHealth = typeof rawEnemyHealth === "number" ? rawEnemyHealth : undefined;

  return {
    round: toNumberValue(record.round) || undefined,
    actor:
      actor === "character" || actor === "monster"
        ? actor
        : undefined,
    attacker: toStringValue(record.attacker) || undefined,
    defender: toStringValue(record.defender) || undefined,
    damage: toNumberValue(record.damage) || undefined,
    remainingCharacterHealth,
    remainingEnemyHealth,
    characterHealth: remainingCharacterHealth,
    enemyHealth: remainingEnemyHealth
  };
}

function mapGameplayCombat(input: unknown): GameplayCombat | undefined {
  if (!isObject(input)) return undefined;
  const record = asRecord(input);
  return {
    victory: toBooleanValue(record.victory),
    characterHealthRemaining: toNumberValue(record.characterHealthRemaining),
    enemyHealthRemaining: toNumberValue(record.enemyHealthRemaining),
    rounds: asArray(record.rounds, mapGameplayCombatRound)
  };
}

function mapGameplayProgression(input: unknown): GameplayProgression | undefined {
  if (!isObject(input)) return undefined;
  const record = asRecord(input);
  return {
    previousXp: toNumberValue(record.previousXp),
    currentXp: toNumberValue(record.currentXp),
    previousLevel: toNumberValue(record.previousLevel),
    currentLevel: toNumberValue(record.currentLevel),
    levelUps: toNumberValue(record.levelUps)
  };
}

function mapGameplayActionResult(input: unknown): GameplayActionResult {
  const record = unwrapEntity(input);
  const rewards = asRecord(record.rewards);
  const rewardItem = asRecord(rewards.item);
  const characterState = asRecord(record.characterState);
  const availability = asRecord(record.availability);
  const inventory = asRecord(record.inventory);
  const nextAvailableAt =
    toStringValue(availability.nextAvailableAt) ||
    toStringValue(record.nextAvailableAt) ||
    undefined;
  const availabilityActionType =
    toStringValue(availability.actionType) ||
    toStringValue(record.actionType) ||
    undefined;

  const items =
    rewardItem && Object.keys(rewardItem).length > 0
      ? [toStringValue(rewardItem.name)].filter(Boolean)
      : [];

  return {
    action: toStringValue(record.action) as GameplayActionResult["action"],
    enemy: toStringValue(record.enemy) || undefined,
    note: toStringValue(record.note) || undefined,
    marketAction: (toStringValue(record.marketAction) || undefined) as MarketActionType | undefined,
    rewards: {
      xp: toNumberValue(rewards.xp),
      coins: toNumberValue(rewards.coins),
      items
    },
    progression: mapGameplayProgression(record.progression),
    characterState: {
      currentHealth: toNumberValue(characterState.currentHealth),
      maxHealth: toNumberValue(characterState.maxHealth),
      status: toStringValue(characterState.status, "READY") as GameplayActionResult["characterState"]["status"],
      lastCombatAt: toStringValue(characterState.lastCombatAt) || undefined,
      lastRecoveredAt: toStringValue(characterState.lastRecoveredAt) || undefined
    },
    inventory:
      Object.keys(inventory).length > 0
        ? {
            id: toStringValue(inventory.id) || undefined,
            coins: toNumberValue(inventory.coins)
          }
        : undefined,
    combat: mapGameplayCombat(record.combat),
    availability:
      nextAvailableAt || availabilityActionType
        ? {
            actionType: availabilityActionType,
            nextAvailableAt
          }
        : undefined,
    interactionType: toStringValue(record.interactionType) || undefined
  };
}

function apiRequestError(error: unknown, fallback: string) {
  if (error instanceof ApiContractNotConfiguredError) return error;
  if (error instanceof ApiRequestError) return error;

  if (error instanceof AxiosError) {
    const data = asRecord(error.response?.data);
    const nested = pickRecord(data, ["error"]);
    const source = nested ?? data;
    return new ApiRequestError(
      toStringValue(source.message, fallback),
      {
        statusCode: error.response?.status,
        code: toStringValue(source.code) || undefined,
        details: isObject(source.details) ? source.details : undefined
      }
    );
  }

  if (error instanceof Error) return error;
  return new Error(fallback);
}

async function request<T>(promise: Promise<{ data: unknown }>, mapper: (value: unknown) => T) {
  try {
    const response = await promise;
    return mapper(response.data);
  } catch (error) {
    throw apiRequestError(error, "Falha ao processar requisicao.");
  }
}

export interface AuthApiContract {
  login(input: { email: string; password: string }): Promise<AuthSession>;
  register(input: { email: string; username: string; password: string }): Promise<AuthSession>;
  me(): Promise<AuthUser>;
}

export interface CharactersApiContract {
  classes(): Promise<CharacterClass[]>;
  list(): Promise<CharacterSummary[]>;
  create(input: { name: string; classId?: string }): Promise<CharacterSummary>;
  byId(id: string): Promise<CharacterSummary>;
  summary(id: string): Promise<CharacterDetailSummary>;
  rankings(limit?: number): Promise<CharacterRankings>;
  publicProfile(id: string): Promise<CharacterPublicProfile>;
  updateName(id: string, input: { name: string }): Promise<CharacterSummary>;
  remove(id: string): Promise<void>;
  updateProgress(
    id: string,
    input: { xp?: number; level?: number; lastCheckpoint?: string }
  ): Promise<void>;
  updatePosition(
    id: string,
    input: { posX?: number; posY?: number; posZ?: number; lastCheckpoint?: string }
  ): Promise<void>;
}

export interface InventoryApiContract {
  inventory(characterId: string): Promise<InventoryItem[]>;
  wallet(characterId: string): Promise<WalletSummary>;
  useItem(characterId: string, itemId: string): Promise<void>;
  equip(characterId: string, itemId: string): Promise<void>;
  unequip(characterId: string, itemId: string): Promise<void>;
}

export interface GameplayApiContract {
  journey(): Promise<GameplayEntity[]>;
  monsters(): Promise<GameplayEntity[]>;
  bounties(): Promise<GameplayEntity[]>;
  missions(): Promise<GameplayEntity[]>;
  trainings(): Promise<GameplayEntity[]>;
  npcs(): Promise<GameplayEntity[]>;
  execute(
    action: "bounty" | "mission" | "training" | "npc" | "market",
    payload: Record<string, unknown>
  ): Promise<GameplayActionResult>;
}

export interface RewardsApiContract {
  list(characterId: string): Promise<Reward[]>;
  claim(input: {
    characterId: string;
    claimKey: string;
    type: "COINS" | "XP";
    value: number;
    metadata?: string;
  }): Promise<void>;
}

export interface ShopApiContract {
  marketOverview(characterId: string): Promise<MarketOverview>;
  buy(input: { characterId: string; productId: string; quantity: number }): Promise<void>;
  sell(input: {
    characterId: string;
    assetType: "ITEM" | "EQUIPMENT";
    assetId: string;
    quantity: number;
  }): Promise<void>;
  orders(): Promise<TransactionRecord[]>;
  paymentOrder(input: {
    characterId: string;
    productId: string;
    quantity: number;
    provider?: string;
  }): Promise<void>;
}

export interface TransactionsApiContract {
  list(characterId: string): Promise<TransactionRecord[]>;
}

export interface AdminApiContract {
  list(type: string): Promise<AdminEntity[]>;
  create(type: string, input: Record<string, unknown>): Promise<AdminEntity>;
  update(type: string, id: string, input: Record<string, unknown>): Promise<AdminEntity>;
}

function adminBasePath(type: string) {
  const allowed = ["monsters", "bounties", "missions", "trainings", "npcs"];
  if (!allowed.includes(type)) {
    throw new ApiContractNotConfiguredError(`admin.${type}`);
  }
  return `/api/v1/admin/${type}`;
}

export const apiContracts = {
  auth: {
    login: (input) =>
      request(
        apiClient.post("/api/v1/auth/login", {
          email: input.email,
          senha: input.password
        }),
        (data) => {
          const root = asRecord(data);
          return {
            accessToken: toStringValue(root.token),
            user: mapUser(root.user),
            refreshToken: undefined
          };
        }
      ),
    register: (input) =>
      request(
        apiClient.post("/api/v1/auth/register", {
          nome: input.username,
          email: input.email,
          senha: input.password
        }),
        (data) => {
          const root = asRecord(data);
          return {
            accessToken: toStringValue(root.token),
            user: mapUser(root.user),
            refreshToken: undefined
          };
        }
      ),
    me: () => request(apiClient.get("/api/v1/auth/me"), mapUser)
  } satisfies AuthApiContract,
  characters: {
    classes: () =>
      request(apiClient.get("/api/v1/characters/classes"), (data) =>
        asArray(data, mapCharacterClass)
      ),
    list: () => request(apiClient.get("/api/v1/characters"), (data) => asArray(data, mapCharacter)),
    create: (input) => request(apiClient.post("/api/v1/characters", input), mapCharacter),
    byId: (id) => request(apiClient.get(`/api/v1/characters/${id}`), mapCharacter),
    summary: (id) =>
      request(apiClient.get(`/api/v1/characters/${id}/summary`), mapCharacterSummaryDetail),
    rankings: (limit) =>
      request(
        apiClient.get("/api/v1/characters/rankings", {
          params: typeof limit === "number" ? { limit } : undefined
        }),
        mapCharacterRankings
      ),
    publicProfile: (id) =>
      request(apiClient.get(`/api/v1/characters/${id}/public-profile`), mapCharacterPublicProfile),
    updateName: (id, input) =>
      request(apiClient.put(`/api/v1/characters/${id}`, input), mapCharacter),
    remove: async (id) => {
      await apiClient.delete(`/api/v1/characters/${id}`);
    },
    updateProgress: async (id, input) => {
      await apiClient.patch(`/api/v1/characters/${id}/progress`, input);
    },
    updatePosition: async (id, input) => {
      await apiClient.patch(`/api/v1/characters/${id}/position`, input);
    }
  } satisfies CharactersApiContract,
  inventory: {
    inventory: (characterId) =>
      request(apiClient.get(`/api/v1/inventory/characters/${characterId}`), mapInventoryCollection),
    wallet: (characterId) =>
      request(apiClient.get(`/api/v1/inventory/characters/${characterId}/wallet`), mapWallet),
    useItem: async (characterId, itemId) => {
      await apiClient.post(`/api/v1/inventory/characters/${characterId}/items/${itemId}/use`);
    },
    equip: async (characterId, itemId) => {
      await apiClient.post(
        `/api/v1/inventory/characters/${characterId}/equipments/${itemId}/equip`
      );
    },
    unequip: async (characterId, itemId) => {
      await apiClient.post(
        `/api/v1/inventory/characters/${characterId}/equipments/${itemId}/unequip`
      );
    }
  } satisfies InventoryApiContract,
  gameplay: {
    journey: () =>
      request(apiClient.get("/api/v1/gameplay/journey"), (data) => asArray(data, mapGameplayEntity)),
    monsters: () =>
      request(apiClient.get("/api/v1/gameplay/monsters"), (data) => asArray(data, mapGameplayEntity)),
    bounties: () =>
      request(apiClient.get("/api/v1/gameplay/bounties"), (data) => asArray(data, mapGameplayEntity)),
    missions: () =>
      request(apiClient.get("/api/v1/gameplay/missions"), (data) => asArray(data, mapGameplayEntity)),
    trainings: () =>
      request(apiClient.get("/api/v1/gameplay/trainings"), (data) => asArray(data, mapGameplayEntity)),
    npcs: () =>
      request(apiClient.get("/api/v1/gameplay/npcs"), (data) => asArray(data, mapGameplayEntity)),
    execute: (action, payload) => {
      const characterId = String(payload.characterId ?? "");

      if (!characterId) {
        return Promise.reject(new Error("Selecione um personagem ativo para executar a acao."));
      }

      if (action === "bounty") {
        return request(
          apiClient.post(`/api/v1/gameplay/characters/${characterId}/actions/bounty-hunt`, {
            bountyId: payload.bountyId
          }),
          mapGameplayActionResult
        );
      }

      if (action === "mission") {
        return request(
          apiClient.post(`/api/v1/gameplay/characters/${characterId}/actions/missions`, {
            missionId: payload.missionId
          }),
          mapGameplayActionResult
        );
      }

      if (action === "training") {
        return request(
          apiClient.post(`/api/v1/gameplay/characters/${characterId}/actions/training`, {
            trainingId: payload.trainingId
          }),
          mapGameplayActionResult
        );
      }

      if (action === "npc") {
        return request(
          apiClient.post(`/api/v1/gameplay/characters/${characterId}/actions/npc-interaction`, {
            npcId: payload.npcId
          }),
          mapGameplayActionResult
        );
      }

      return request(
        apiClient.post(`/api/v1/gameplay/characters/${characterId}/actions/market`, {
          action: (payload.action ?? "barter") as MarketActionType
        }),
        mapGameplayActionResult
      );
    }
  } satisfies GameplayApiContract,
  rewards: {
    list: (characterId) =>
      request(apiClient.get(`/api/v1/rewards/characters/${characterId}`), (data) =>
        asArray(data, mapReward)
      ),
    claim: async (input) => {
      await apiClient.post("/api/v1/rewards/claim", input);
    }
  } satisfies RewardsApiContract,
  shop: {
    marketOverview: (characterId) =>
      request(
        apiClient.get(`/api/v1/shop/market/characters/${characterId}`),
        mapMarketOverview
      ),
    buy: async (input) => {
      await apiClient.post("/api/v1/shop/market/purchases", input);
    },
    sell: async (input) => {
      await apiClient.post("/api/v1/shop/market/sales", input);
    },
    orders: () =>
      request(apiClient.get("/api/v1/shop/payment-orders"), (data) =>
        asArray(data, mapTransaction)
      ),
    paymentOrder: async (input) => {
      await apiClient.post("/api/v1/shop/payment-orders", input);
    }
  } satisfies ShopApiContract,
  transactions: {
    list: (characterId) =>
      request(apiClient.get(`/api/v1/transactions/characters/${characterId}`), (data) =>
        asArray(data, mapTransaction)
      )
  } satisfies TransactionsApiContract,
  admin: {
    list: (type) =>
      request(apiClient.get(adminBasePath(type)), (data) => asArray(data, mapAdminEntity)),
    create: (type, input) => request(apiClient.post(adminBasePath(type), input), mapAdminEntity),
    update: (type, id, input) =>
      request(apiClient.patch(`${adminBasePath(type)}/${id}`, input), mapAdminEntity)
  } satisfies AdminApiContract
};
