import { AxiosError } from "axios";

import { apiClient } from "@/lib/api/client";
import {
  ApiContractNotConfiguredError,
  ApiRequestError
} from "@/lib/api/errors";
import type {
  AccountRole,
  AdminEntity,
  AIInstructionPayload,
  AIMissionIdeasResponse,
  AITimelineSummaryPayload,
  AITimelineSummaryResponse,
  AITraitsPayload,
  AITraitsResponse,
  AITraitSuggestion,
  AIWorldSummaryResponse,
  AuthSession,
  AuthUser,
  CharacterClass,
  CharacterActionLog,
  CharacterDetailSummary,
  CharacterPublicProfile,
  CharacterRankingEntry,
  CharacterRankings,
  CharacterSummary,
  Difficulty,
  GameplayActionResult,
  CombatSessionAction,
  CombatTurnResult,
  CombatSessionState,
  GameplayCharacterState,
  GameplayCombat,
  GameplayCombatRound,
  GameplayEntity,
  MissionJourneyChoice,
  MissionJourneyEnemy,
  MissionJourneyNode,
  MissionSessionState,
  GameplayProgression,
  InventoryItem,
  MarketActionType,
  MarketCatalogEntry,
  MarketOverview,
  MarketSellableEquipment,
  MarketSellableItem,
  MasterOverview,
  MasterOverviewChecklistItem,
  MasterPanelSection,
  PublicProfileEquipment,
  PvpMatchResult,
  PvpOverview,
  PvpRanking,
  PvpCombatRound,
  PresentedStats,
  Reward,
  Table,
  TableCharacter,
  TableDashboardResponse,
  TableDashboardTimelineItem,
  TableMember,
  TableMission,
  TableMissionSubmission,
  TableSubmissionFilters,
  TableSubmissionListItem,
  TableSubmissionListResponse,
  TableTimelineEvent,
  TableWorld,
  CharacterReview,
  CharacterTrait,
  TransactionRecord,
  TradeAction,
  TradeAsset,
  TradeList,
  TradeRecord,
  TradeStatus,
  WalletSummary
} from "@/types/app";
import { normalizeAccountRole } from "@/lib/permissions";

type Dict = Record<string, unknown>;

const ARRAY_KEYS = [
  "data",
  "items",
  "results",
  "rows",
  "products",
  "shopCatalog",
  "buyCatalog",
  "claims",
  "catalog",
  "characters",
  "journey",
  "monsters",
  "bounties",
  "missions",
  "trainings",
  "npcs",
  "shopProducts",
  "shop-products",
  "inventory",
  "transactions",
  "orders",
  "tables",
  "members",
  "reviews",
  "traits",
  "submissions",
  "timeline",
  "timelineEvents",
  "classes",
  "activities",
  "recentGameplayActions",
  "recentTransactions",
  "rounds",
  "choices",
  "nodes",
  "sessions",
  "missionSessions",
  "actions",
  "battleLog",
  "startingMissions",
  "completionMissions"
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
      "session",
      "user",
      "character",
      "profile",
      "wallet",
      "summary",
      "order",
      "product",
      "shopProduct"
    ]) ?? asRecord(value)
  );
}

function toStringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function toJsonTextValue(value: unknown): string {
  if (typeof value === "string") return value;

  const record = asRecord(value);
  return toStringValue(record.text);
}

function toNumberValue(value: unknown, fallback = 0) {
  return typeof value === "number" ? value : fallback;
}

function toOptionalNumberValue(value: unknown) {
  return typeof value === "number" ? value : undefined;
}

function toBooleanValue(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function mapUser(input: unknown): AuthUser {
  const record = unwrapEntity(input);
  const accountRole = normalizeAccountRole(
    record.accountRole ?? record.systemRole ?? record.role
  );

  return {
    id: toStringValue(record.id),
    email: toStringValue(record.email),
    username:
      toStringValue(record.username) ||
      toStringValue(record.nome) ||
      toStringValue(record.name),
    accountRole,
    systemRole: accountRole,
    role: toStringValue(record.role) || undefined,
    theme: toStringValue(record.theme) || null
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
  const customization = asRecord(record.customization);
  const review = asRecord(record.review);
  return {
    id: toStringValue(record.id),
    tableId: toStringValue(record.tableId) || null,
    name: toStringValue(record.name ?? record.nome ?? record.title),
    level: toNumberValue(record.level),
    xp: toNumberValue(record.xp),
    hp: toNumberValue(record.currentHealth ?? record.hp ?? record.health),
    currentHealth: toNumberValue(record.currentHealth ?? record.hp ?? record.health),
    stamina: toNumberValue(record.stamina),
    gold: toNumberValue(record.gold ?? inventory.coins ?? record.coins ?? record.wallet),
    status: toStringValue(record.status, "READY") as CharacterSummary["status"],
    className: mapClassName(record.className ?? record.classId ?? record.class),
    location: toStringValue(record.location ?? record.lastCheckpoint),
    reviewStatus: toStringValue(record.reviewStatus ?? record.tableReviewStatus ?? review.status) as
      | CharacterSummary["reviewStatus"]
      | undefined,
    masterFeedback:
      toStringValue(record.masterFeedback ?? review.masterFeedback ?? review.notes) || null,
    customization: {
      avatarId: toStringValue(record.avatarId ?? customization.avatarId) || null,
      titleId: toStringValue(record.titleId ?? customization.titleId) || null,
      bannerId: toStringValue(record.bannerId ?? customization.bannerId) || null
    }
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
  const progression = asRecord(record.progression);
  const awakening = asRecord(record.awakening);
  const customization = asRecord(record.customization);
  const classDetail = asRecord(record.class);
  return {
    id: toStringValue(record.id),
    name: toStringValue(record.name),
    level: toNumberValue(record.level),
    xp: toNumberValue(record.xp),
    currentHealth: toNumberValue(record.currentHealth ?? record.hp ?? record.health),
    status: toStringValue(record.status, "READY") as CharacterDetailSummary["status"],
    className: mapClassName(record.className ?? record.classId ?? record.class),
    classDetail:
      Object.keys(classDetail).length > 0 ? mapCharacterClass(classDetail) : undefined,
    customization: {
      avatarId: toStringValue(record.avatarId ?? customization.avatarId) || null,
      titleId: toStringValue(record.titleId ?? customization.titleId) || null,
      bannerId: toStringValue(record.bannerId ?? customization.bannerId) || null
    },
    inventory: {
      id: toStringValue(inventory.id) || null,
      coins: toNumberValue(inventory.coins ?? record.gold ?? record.coins),
      totalItems: toNumberValue(inventory.totalItems),
      totalEquipments: toNumberValue(inventory.totalEquipments)
    },
    progression:
      Object.keys(progression).length > 0
        ? {
            currentXp: toNumberValue(progression.currentXp),
            currentLevel: toNumberValue(progression.currentLevel),
            currentLevelFloorXp: toNumberValue(progression.currentLevelFloorXp),
            nextLevelFloorXp: toNumberValue(progression.nextLevelFloorXp),
            xpIntoLevel: toNumberValue(progression.xpIntoLevel),
            xpForNextLevel: toNumberValue(progression.xpForNextLevel),
            xpRemainingToNextLevel: toNumberValue(progression.xpRemainingToNextLevel)
          }
        : undefined,
    awakening:
      Object.keys(awakening).length > 0
        ? {
            requiredLevel: toNumberValue(awakening.requiredLevel),
            currentClass: toStringValue(awakening.currentClass),
            currentTier: toOptionalNumberValue(awakening.currentTier),
            evolvesFrom: toStringValue(awakening.evolvesFrom) || null,
            isBaseClass: toBooleanValue(awakening.isBaseClass),
            isAwakenedClass: toBooleanValue(awakening.isAwakenedClass),
            available: toBooleanValue(awakening.available),
            hasRequiredItem: toBooleanValue(awakening.hasRequiredItem),
            requiredItemType: toStringValue(awakening.requiredItemType),
            requiredItemName: toStringValue(awakening.requiredItemName),
            targetClasses: asArray(awakening.targetClasses, mapCharacterClass)
          }
        : undefined,
    recentGameplayActions: asArray(record.recentGameplayActions, mapCharacterActionLog)
  };
}

function mapCharacterClass(input: unknown): CharacterClass {
  const record = unwrapEntity(input);
  return {
    id: toStringValue(record.id),
    name: toStringValue(record.name),
    tier: toOptionalNumberValue(record.tier),
    evolvesFrom: toStringValue(record.evolvesFrom) || null,
    modifier: toStringValue(record.modifier) || undefined,
    description: toStringValue(record.description) || undefined,
    passive: toStringValue(record.passive) || undefined,
    isBaseClass: typeof record.isBaseClass === "boolean" ? record.isBaseClass : undefined,
    isAwakenedClass:
      typeof record.isAwakenedClass === "boolean" ? record.isAwakenedClass : undefined,
    awakensTo: Array.isArray(record.awakensTo) ? record.awakensTo.map((item) => String(item)) : undefined,
    awakenLevelRequirement:
      typeof record.awakenLevelRequirement === "number" ? record.awakenLevelRequirement : null
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
    effect: toStringValue(record.effect) || undefined,
    equippedAt: toStringValue(record.equippedAt) || undefined
  };
}

function mapPresentedStats(input: unknown): PresentedStats {
  const record = asRecord(input);
  const descriptionsRecord = asRecord(record.descriptions);
  const stats: PresentedStats = {};

  for (const [key, value] of Object.entries(record)) {
    if (typeof value === "number") {
      stats[key] = value;
    }
  }

  if (Object.keys(descriptionsRecord).length > 0) {
    stats.descriptions = {
      attack: toStringValue(descriptionsRecord.attack) || undefined,
      defense: toStringValue(descriptionsRecord.defense) || undefined,
      maxHealth: toStringValue(descriptionsRecord.maxHealth) || undefined,
      critChance: toStringValue(descriptionsRecord.critChance) || undefined
    };
  }

  return stats;
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
  const classDetail = asRecord(record.class);
  const customization = asRecord(record.customization);

  return {
    id: toStringValue(record.id),
    name: toStringValue(record.name),
    level: toNumberValue(record.level),
    xp: toNumberValue(record.xp),
    currentHealth: toNumberValue(record.currentHealth ?? record.hp ?? record.health),
    status: toStringValue(record.status, "READY") as CharacterPublicProfile["status"],
    coins: toNumberValue(record.coins ?? record.gold),
    className: mapClassName(record.className ?? record.classId ?? record.class),
    classDetail:
      Object.keys(classDetail).length > 0 ? mapCharacterClass(classDetail) : undefined,
    customization: {
      avatarId: toStringValue(record.avatarId ?? customization.avatarId) || null,
      titleId: toStringValue(record.titleId ?? customization.titleId) || null,
      bannerId: toStringValue(record.bannerId ?? customization.bannerId) || null
    },
    stats: mapPresentedStats(record.stats),
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
    assetKind:
      toStringValue(record.assetKind).toUpperCase() === "EQUIPMENT" ? "EQUIPMENT" : "ITEM",
    category: toStringValue(record.category) || undefined,
    type: toStringValue(record.type ?? record.category, "ITEM"),
    img: toStringValue(record.img) || undefined,
    effect: toStringValue(record.effect) || undefined,
    levelRequirement: toOptionalNumberValue(record.levelRequirement),
    quantity: toNumberValue(record.quantity, 1),
    rarity: toStringValue(record.rarity),
    equipped:
      typeof record.equipped === "boolean" || typeof record.isEquipped === "boolean"
        ? toBooleanValue(record.equipped ?? record.isEquipped)
        : undefined
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
          assetKind: "EQUIPMENT",
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
          assetKind: "EQUIPMENT",
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
    levelRequirement: toOptionalNumberValue(record.levelRequirement),
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
    levelRequirement: toOptionalNumberValue(record.levelRequirement),
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
    levelRequirement: toOptionalNumberValue(record.levelRequirement),
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
  const startNpc = asRecord(record.startNpc);
  const completionNpc = asRecord(record.completionNpc);
  const title = toStringValue(record.title ?? record.name ?? record.label ?? record.key);
  const rewardXp = toNumberValue(record.rewardXp ?? record.xpReward);
  const rewardCoins = toNumberValue(record.reward ?? record.rewardCoins ?? record.coinsReward);
  const interactionType = toStringValue(record.interactionType).toLowerCase() || undefined;
  const defeatPenalty = asRecord(record.defeatPenalty);
  const journeySummary = asArray(record.journeySummary, (entry) => {
    const node = asRecord(entry);
    return (
      toStringValue(node.title) ||
      toStringValue(node.text) ||
      toStringValue(node.type)
    );
  }).filter(Boolean);

  return {
    id: toStringValue(record.id),
    name: title,
    description:
      toStringValue(record.description) ||
      toStringValue(record.startDialogue) ||
      toStringValue(record.completionDialogue) ||
      journeySummary[0] ||
      toStringValue(record.dialogue) ||
      toStringValue(record.role) ||
      "Sem descricao detalhada na API.",
    difficulty: (toStringValue(record.difficulty, "MEDIUM") as GameplayEntity["difficulty"]) ?? "MEDIUM",
    imageUrl: toStringValue(record.imageUrl) || undefined,
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
    activeUntil: toStringValue(record.timeLimit) || undefined,
    role: toStringValue(record.role) || undefined,
    dialogue: toStringValue(record.dialogue) || undefined,
    startNpcId: toStringValue(record.startNpcId ?? startNpc.id) || undefined,
    completionNpcId: toStringValue(record.completionNpcId ?? completionNpc.id) || undefined,
    startDialogue: toStringValue(record.startDialogue) || undefined,
    completionDialogue: toStringValue(record.completionDialogue) || undefined,
    repeatCooldownSeconds: toOptionalNumberValue(record.repeatCooldownSeconds),
    journeySummary: journeySummary.length ? journeySummary : undefined,
    startingMissions: asArray(record.startingMissions, mapMissionReference),
    completionMissions: asArray(record.completionMissions, mapMissionReference),
    defeatPenalty:
      Object.keys(defeatPenalty).length > 0
        ? {
            difficulty: (toStringValue(defeatPenalty.difficulty) ||
              undefined) as GameplayEntity["difficulty"] | undefined,
            xpLossPercent: toOptionalNumberValue(defeatPenalty.xpLossPercent),
            coinsLossPercent: toOptionalNumberValue(defeatPenalty.coinsLossPercent),
            forceDefeat:
              typeof defeatPenalty.forceDefeat === "boolean"
                ? defeatPenalty.forceDefeat
                : undefined,
            description: toStringValue(defeatPenalty.description) || undefined
          }
        : undefined
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

function mapTradeAsset(input: unknown): TradeAsset {
  const record = unwrapEntity(input);
  return {
    id: toStringValue(record.id) || undefined,
    side: (toStringValue(record.side) || undefined) as TradeAsset["side"],
    assetType: (toStringValue(record.assetType, "ITEM") as TradeAsset["assetType"]) ?? "ITEM",
    assetId: toStringValue(record.assetId),
    quantity: toNumberValue(record.quantity, 1)
  };
}

function mapTradeCharacterRef(input: unknown) {
  const record = unwrapEntity(input);
  return {
    id: toStringValue(record.id),
    name: toStringValue(record.name),
    userId: toStringValue(record.userId) || undefined
  };
}

function mapTradeRecord(input: unknown): TradeRecord {
  const record = unwrapEntity(input);
  return {
    id: toStringValue(record.id),
    status: (toStringValue(record.status, "PENDING") as TradeStatus) ?? "PENDING",
    requesterCharacterId: toStringValue(record.requesterCharacterId),
    targetCharacterId: toStringValue(record.targetCharacterId),
    offeredCoins: toNumberValue(record.offeredCoins),
    requestedCoins: toNumberValue(record.requestedCoins),
    note: toStringValue(record.note) || null,
    expiresAt: toStringValue(record.expiresAt) || undefined,
    createdAt: toStringValue(record.createdAt) || undefined,
    requesterCharacter: isObject(record.requesterCharacter)
      ? mapTradeCharacterRef(record.requesterCharacter)
      : undefined,
    targetCharacter: isObject(record.targetCharacter)
      ? mapTradeCharacterRef(record.targetCharacter)
      : undefined,
    assets: asArray(record.assets, mapTradeAsset)
  };
}

function mapTradeList(input: unknown): TradeList {
  const record = unwrapEntity(input);
  return {
    characterId: toStringValue(record.characterId),
    incoming: asArray(record.incoming, mapTradeRecord),
    outgoing: asArray(record.outgoing, mapTradeRecord)
  };
}

function mapPvpCombatRound(input: unknown): PvpCombatRound {
  const record = unwrapEntity(input);
  return {
    round: toNumberValue(record.round),
    actor: (toStringValue(record.actor, "challenger") as PvpCombatRound["actor"]) ?? "challenger",
    damage: toNumberValue(record.damage),
    remainingChallengerHealth: toNumberValue(record.remainingChallengerHealth),
    remainingOpponentHealth: toNumberValue(record.remainingOpponentHealth),
    critical: toBooleanValue(record.critical)
  };
}

function mapPvpOverview(input: unknown): PvpOverview {
  const record = unwrapEntity(input);
  const availability = asRecord(record.availability);
  const ranking = asRecord(record.ranking);
  return {
    characterId: toStringValue(record.characterId),
    level: toNumberValue(record.level),
    maxLevel: toNumberValue(record.maxLevel, 60),
    pvpUnlocked: toBooleanValue(record.pvpUnlocked),
    requiredLevel: toNumberValue(record.requiredLevel, 45),
    cooldownSeconds: toNumberValue(record.cooldownSeconds, 1800),
    availability: {
      available: toBooleanValue(availability.available),
      nextAvailableAt: toStringValue(availability.nextAvailableAt) || undefined
    },
    ranking: {
      rating: toNumberValue(ranking.rating, 1000),
      wins: toNumberValue(ranking.wins),
      losses: toNumberValue(ranking.losses)
    }
  };
}

function mapPvpRanking(input: unknown): PvpRanking {
  const record = unwrapEntity(input);
  return {
    requiredLevel: toNumberValue(record.requiredLevel, 45),
    cooldownSeconds: toNumberValue(record.cooldownSeconds, 1800),
    entries: asArray(record.entries, (entry) => {
      const item = unwrapEntity(entry);
      const character = asRecord(item.character);
      const classRecord = asRecord(character.class);
      return {
        position: toNumberValue(item.position),
        rating: toNumberValue(item.rating, 1000),
        wins: toNumberValue(item.wins),
        losses: toNumberValue(item.losses),
        character: {
          id: toStringValue(character.id),
          name: toStringValue(character.name),
          level: toNumberValue(character.level),
          status: toStringValue(character.status, "READY") as PvpRanking["entries"][number]["character"]["status"],
          class:
            Object.keys(classRecord).length > 0
              ? {
                  id: toStringValue(classRecord.id),
                  name: toStringValue(classRecord.name),
                  tier: toOptionalNumberValue(classRecord.tier),
                  modifier: toStringValue(classRecord.modifier) || undefined
                }
              : undefined
        }
      };
    })
  };
}

function mapGameplayCharacterState(input: unknown): GameplayActionResult["characterState"] {
  const record = asRecord(input);
  return {
    currentHealth: toNumberValue(record.currentHealth),
    maxHealth: toNumberValue(record.maxHealth),
    status: toStringValue(record.status, "READY") as GameplayActionResult["characterState"]["status"],
    lastCombatAt: toStringValue(record.lastCombatAt) || undefined,
    lastRecoveredAt: toStringValue(record.lastRecoveredAt) || undefined
  };
}

function mapPvpMatchResult(input: unknown): PvpMatchResult {
  const record = unwrapEntity(input);
  const match = asRecord(record.match);
  const challenger = asRecord(record.challenger);
  const opponent = asRecord(record.opponent);
  const combat = asRecord(record.combat);

  return {
    match: {
      id: toStringValue(match.id),
      createdAt: toStringValue(match.createdAt) || undefined,
      cooldownEndsAt: toStringValue(match.cooldownEndsAt) || undefined,
      winnerCharacterId: toStringValue(match.winnerCharacterId),
      loserCharacterId: toStringValue(match.loserCharacterId)
    },
    challenger: {
      id: toStringValue(challenger.id),
      name: toStringValue(challenger.name),
      ratingBefore: toNumberValue(challenger.ratingBefore, 1000),
      ratingAfter: toNumberValue(challenger.ratingAfter, 1000),
      state: mapGameplayCharacterState(challenger.state),
      stats: mapPresentedStats(challenger.stats)
    },
    opponent: {
      id: toStringValue(opponent.id),
      name: toStringValue(opponent.name),
      ratingBefore: toNumberValue(opponent.ratingBefore, 1000),
      ratingAfter: toNumberValue(opponent.ratingAfter, 1000),
      state: mapGameplayCharacterState(opponent.state),
      stats: mapPresentedStats(opponent.stats)
    },
    combat: {
      winner: (toStringValue(combat.winner, "challenger") as PvpMatchResult["combat"]["winner"]) ?? "challenger",
      challengerHealthRemaining: toNumberValue(combat.challengerHealthRemaining),
      opponentHealthRemaining: toNumberValue(combat.opponentHealthRemaining),
      challengerStats: mapPresentedStats(combat.challengerStats),
      opponentStats: mapPresentedStats(combat.opponentStats),
      rounds: asArray(combat.rounds, mapPvpCombatRound)
    }
  };
}

function mapTableMember(input: unknown): TableMember {
  const record = unwrapEntity(input);
  const user = asRecord(record.user);
  const character = asRecord(record.character);

  return {
    id: toStringValue(record.id),
    tableId: toStringValue(record.tableId),
    userId: toStringValue(record.userId ?? user.id),
    username:
      toStringValue(record.username) ||
      toStringValue(user.username) ||
      toStringValue(user.nome) ||
      toStringValue(user.name) ||
      toStringValue(user.email),
    role: normalizeTableRole(record.role) ?? "PLAYER",
    status: normalizeTableMemberStatus(record.status) ?? "ACTIVE",
    characterId: toStringValue(record.characterId ?? character.id) || null,
    characterName:
      toStringValue(record.characterName ?? character.name ?? character.title) || null,
    joinedAt: toStringValue(record.joinedAt ?? record.createdAt) || undefined
  };
}

function normalizeTableRole(value: unknown): Table["currentUserRole"] {
  const role = toStringValue(value).toUpperCase();
  return role === "MASTER" || role === "PLAYER" ? role : null;
}

function normalizeTableMemberStatus(value: unknown): Table["memberStatus"] {
  const status = toStringValue(value).toUpperCase();
  if (status === "ACTIVE" || status === "INVITED" || status === "REMOVED") return status;
  if (status === "LEFT") return "REMOVED";
  return null;
}

function mapTableWorld(input: unknown): TableWorld {
  const record = unwrapEntity(input);

  return {
    id: toStringValue(record.id),
    tableId: toStringValue(record.tableId),
    name: toStringValue(record.name ?? record.campaignTitle ?? record.title, "Mundo da mesa"),
    summary:
      toStringValue(record.summary) ||
      toStringValue(record.description) ||
      "Resumo de mundo ainda nao informado.",
    currentArc: toStringValue(record.currentArc ?? record.arc) || null,
    tone: toStringValue(record.tone) || null,
    rules: toJsonTextValue(record.rules ?? record.houseRules) || null,
    characterCreationCriteria:
      toJsonTextValue(
        record.characterCreationCriteria ?? record.characterCriteria
      ) || null,
    updatedAt: toStringValue(record.updatedAt) || undefined
  };
}

function mapCharacterTrait(input: unknown): CharacterTrait {
  const record = unwrapEntity(input);

  return {
    id: toStringValue(record.id),
    characterId: toStringValue(record.characterId),
    tableId: toStringValue(record.tableId) || undefined,
    name: toStringValue(record.name ?? record.title),
    description: toStringValue(record.description ?? record.effect),
    tone: toStringValue(record.tone ?? record.type ?? record.alignment, "NEUTRAL") as CharacterTrait["tone"],
    category: toStringValue(record.category) || undefined,
    value: toOptionalNumberValue(record.value)
  };
}

function mapCharacterReview(input: unknown): CharacterReview {
  const record = unwrapEntity(input);
  const character = asRecord(record.character);
  const submitter = asRecord(record.submittedBy ?? record.user);

  return {
    id: toStringValue(record.id),
    tableId: toStringValue(record.tableId),
    characterId: toStringValue(record.characterId ?? character.id),
    characterName: toStringValue(record.characterName ?? character.name) || undefined,
    submittedBy:
      toStringValue(record.submittedByName) ||
      toStringValue(submitter.username) ||
      toStringValue(submitter.nome) ||
      toStringValue(submitter.name) ||
      undefined,
    status: toStringValue(record.status, "PENDING") as CharacterReview["status"],
    notes: toStringValue(record.notes ?? record.masterFeedback ?? record.message) || null,
    traits: asArray(record.traits, mapCharacterTrait),
    createdAt: toStringValue(record.createdAt) || undefined,
    reviewedAt: toStringValue(record.reviewedAt) || null
  };
}

function mapTableCharacter(input: unknown): TableCharacter {
  // Character list items contain a nested `user`. Using unwrapEntity here
  // incorrectly unwraps that user and drops the character reviews.
  const record = asRecord(input);
  const user = asRecord(record.user);
  const reviews = asArray(record.reviews, mapCharacterReview);

  return {
    id: toStringValue(record.id),
    tableId: toStringValue(record.tableId) || null,
    userId: toStringValue(record.userId ?? user.id) || null,
    userName:
      toStringValue(record.userName) ||
      toStringValue(user.username) ||
      toStringValue(user.nome) ||
      toStringValue(user.name) ||
      toStringValue(user.email) ||
      null,
    name: toStringValue(record.name ?? record.nome ?? record.title),
    level: toNumberValue(record.level),
    className: mapClassName(record.className ?? record.classId ?? record.class),
    status: toStringValue(record.status, "READY") as TableCharacter["status"],
    review: reviews[0] ?? null
  };
}

function mapTableMissionSubmission(input: unknown): TableMissionSubmission {
  const record = unwrapEntity(input);
  const character = asRecord(record.character);

  return {
    id: toStringValue(record.id),
    tableId: toStringValue(record.tableId),
    missionId: toStringValue(record.missionId),
    characterId: toStringValue(record.characterId ?? character.id),
    characterName: toStringValue(record.characterName ?? character.name) || undefined,
    status: toStringValue(record.status, "PENDING") as TableMissionSubmission["status"],
    content:
      toStringValue(record.content) ||
      toStringValue(record.description) ||
      toStringValue(record.note),
    rewardXp: toOptionalNumberValue(record.rewardXp),
    rewardCoins: toOptionalNumberValue(record.rewardCoins ?? record.reward),
    masterNote: toStringValue(record.masterNote ?? record.masterFeedback ?? record.notes) || null,
    submittedAt: toStringValue(record.submittedAt ?? record.createdAt) || undefined,
    reviewedAt: toStringValue(record.reviewedAt) || null
  };
}

function mapTableMission(input: unknown): TableMission {
  const record = unwrapEntity(input);

  return {
    id: toStringValue(record.id),
    tableId: toStringValue(record.tableId),
    title: toStringValue(record.title ?? record.name),
    description: toStringValue(record.description) || "Missao sem descricao detalhada.",
    status: toStringValue(record.status, "ACTIVE") as TableMission["status"],
    recommendedLevel: toOptionalNumberValue(record.recommendedLevel),
    rewardHint:
      toStringValue(record.rewardHint) ||
      toStringValue(record.rewardDescription) ||
      undefined,
    dueAt: toStringValue(record.dueAt ?? record.dueDate ?? record.endsAt) || null,
    submissions: asArray(record.submissions, mapTableMissionSubmission),
    createdAt: toStringValue(record.createdAt) || undefined
  };
}

function mapTableTimelineEvent(input: unknown): TableTimelineEvent {
  const record = unwrapEntity(input);
  const actor = asRecord(record.actor ?? record.user);

  return {
    id: toStringValue(record.id),
    tableId: toStringValue(record.tableId),
    kind: toStringValue(record.kind ?? record.type, "NOTE") as TableTimelineEvent["kind"],
    title: toStringValue(record.title ?? record.name),
    description:
      toStringValue(record.description) ||
      toStringValue(record.content) ||
      toStringValue(record.message),
    occurredAt: toStringValue(record.createdAt ?? record.occurredAt ?? record.updatedAt),
    actorName:
      toStringValue(record.actorName) ||
      toStringValue(actor.username) ||
      toStringValue(actor.name) ||
      undefined,
    metadata: isObject(record.metadata) ? record.metadata : undefined
  };
}

function mapDashboardTimelineItem(input: unknown): TableDashboardTimelineItem {
  const record = asRecord(input);
  const table = asRecord(record.table);
  const character = asRecord(record.character);
  const createdBy = asRecord(record.createdBy);

  return {
    id: toStringValue(record.id),
    tableId: toStringValue(record.tableId ?? table.id),
    kind: toStringValue(record.kind ?? record.type, "NOTE") as TableTimelineEvent["kind"],
    title: toStringValue(record.title),
    description: toStringValue(record.description),
    occurredAt: toStringValue(record.occurredAt ?? record.createdAt),
    actorName: toStringValue(createdBy.name ?? createdBy.nome) || undefined,
    metadata: isObject(record.metadata) ? record.metadata : undefined,
    table: {
      id: toStringValue(table.id),
      name: toStringValue(table.name)
    },
    character: Object.keys(character).length
      ? {
          id: toStringValue(character.id),
          name: toStringValue(character.name)
        }
      : null,
    createdBy: Object.keys(createdBy).length
      ? {
          id: toStringValue(createdBy.id),
          name: toStringValue(createdBy.name ?? createdBy.nome),
          email: toStringValue(createdBy.email) || undefined
        }
      : undefined
  };
}

function mapTablesDashboard(input: unknown): TableDashboardResponse {
  const record = asRecord(input);
  const summary = asRecord(record.summary);

  return {
    summary: {
      totalTables: toNumberValue(summary.totalTables),
      masterTables: toNumberValue(summary.masterTables),
      playerTables: toNumberValue(summary.playerTables),
      pendingCharacterReviews: toNumberValue(summary.pendingCharacterReviews),
      activePlayerMissions: toNumberValue(summary.activePlayerMissions)
    },
    tables: asArray(record.tables, (entry) => {
      const table = asRecord(entry);
      const latestTimelineEvent = table.latestTimelineEvent;

      return {
        id: toStringValue(table.id),
        name: toStringValue(table.name),
        description: toStringValue(table.description) || "Mesa sem descricao detalhada.",
        status: toStringValue(table.status) || undefined,
        currentUserRole: normalizeTableRole(table.currentUserRole) ?? "PLAYER",
        isMaster: toBooleanValue(table.isMaster),
        memberStatus: normalizeTableMemberStatus(table.memberStatus) ?? "ACTIVE",
        membersCount: toNumberValue(table.membersCount),
        worldTitle: toStringValue(table.worldTitle) || null,
        latestTimelineEvent: isObject(latestTimelineEvent)
          ? mapTableTimelineEvent(latestTimelineEvent)
          : null
      };
    }),
    pendingCharacterReviews: asArray(record.pendingCharacterReviews, (entry) => {
      const review = asRecord(entry);
      const table = asRecord(review.table);
      const character = asRecord(review.character);
      const characterClass = asRecord(character.class);
      const user = asRecord(character.user);

      return {
        id: toStringValue(review.id),
        status: toStringValue(review.status, "PENDING") as CharacterReview["status"],
        masterFeedback: toStringValue(review.masterFeedback) || null,
        createdAt: toStringValue(review.createdAt) || undefined,
        updatedAt: toStringValue(review.updatedAt) || undefined,
        table: {
          id: toStringValue(table.id),
          name: toStringValue(table.name)
        },
        character: {
          id: toStringValue(character.id),
          name: toStringValue(character.name),
          level: toNumberValue(character.level),
          class: Object.keys(characterClass).length
            ? {
                id: toStringValue(characterClass.id),
                name: toStringValue(characterClass.name)
              }
            : null,
          user: {
            id: toStringValue(user.id),
            name: toStringValue(user.name ?? user.nome),
            email: toStringValue(user.email) || undefined
          }
        }
      };
    }),
    activePlayerMissions: asArray(record.activePlayerMissions, (entry) => {
      const mission = asRecord(entry);
      const table = asRecord(mission.table);

      return {
        id: toStringValue(mission.id),
        title: toStringValue(mission.title),
        description: toStringValue(mission.description),
        objective: toStringValue(mission.objective) || null,
        isRequired:
          typeof mission.isRequired === "boolean" ? mission.isRequired : undefined,
        status: toStringValue(mission.status, "ACTIVE") as TableMission["status"],
        dueAt: toStringValue(mission.dueAt ?? mission.dueDate) || null,
        createdAt: toStringValue(mission.createdAt) || undefined,
        table: {
          id: toStringValue(table.id),
          name: toStringValue(table.name)
        }
      };
    }),
    recentTimeline: asArray(record.recentTimeline, mapDashboardTimelineItem)
  };
}

function mapTableSubmissionListItem(input: unknown): TableSubmissionListItem {
  const record = asRecord(input);
  const mission = asRecord(record.mission);
  const character = asRecord(record.character);
  const user = asRecord(record.user);

  return {
    id: toStringValue(record.id),
    status: toStringValue(record.status, "SUBMITTED") as TableMissionSubmission["status"],
    content: toStringValue(record.content),
    masterNote: toStringValue(record.masterNote) || null,
    createdAt: toStringValue(record.createdAt) || undefined,
    mission: {
      id: toStringValue(mission.id),
      title: toStringValue(mission.title)
    },
    character: {
      id: toStringValue(character.id),
      name: toStringValue(character.name)
    },
    user: {
      id: toStringValue(user.id),
      name: toStringValue(user.name ?? user.nome),
      email: toStringValue(user.email) || undefined
    }
  };
}

function mapTableSubmissionList(input: unknown): TableSubmissionListResponse {
  const record = asRecord(input);

  return {
    items: asArray(record.items, mapTableSubmissionListItem),
    nextCursor: toStringValue(record.nextCursor) || null
  };
}

function mapTable(input: unknown): Table {
  const root = asRecord(input);
  const unwrapped = unwrapEntity(input);
  const nestedTable = asRecord(unwrapped.table ?? root.table);
  const permissionSource = asRecord(
    unwrapped.permissions ?? unwrapped.membership ?? root.permissions ?? root.membership
  );
  const record = Object.keys(nestedTable).length
    ? {
        ...nestedTable,
        currentUserRole:
          unwrapped.currentUserRole ??
          root.currentUserRole ??
          permissionSource.currentUserRole ??
          nestedTable.currentUserRole,
        isMaster:
          unwrapped.isMaster ??
          root.isMaster ??
          permissionSource.isMaster ??
          nestedTable.isMaster,
        memberStatus:
          unwrapped.memberStatus ??
          root.memberStatus ??
          permissionSource.memberStatus ??
          nestedTable.memberStatus,
        membersCount:
          unwrapped.membersCount ??
          root.membersCount ??
          nestedTable.membersCount,
        joinCode:
          unwrapped.joinCode ??
          root.joinCode ??
          nestedTable.joinCode
      }
    : unwrapped;
  const world = record.world ? mapTableWorld(record.world) : null;
  const members = asArray(record.members, mapTableMember);
  const master = asRecord(record.master);
  const playerCount = toOptionalNumberValue(record.playerCount);
  const counts = asRecord(record.counts);
  const membersCount = toOptionalNumberValue(
    record.membersCount ?? record.memberCount ?? counts.members
  );
  const currentUserRole = normalizeTableRole(record.currentUserRole);
  const isMaster = toBooleanValue(record.isMaster);

  // TODO(integration): table role must be supplied as currentUserRole/isMaster.
  // The legacy record.role field is intentionally not used because it is ambiguous.
  if (process.env.NODE_ENV !== "production" && !currentUserRole && !isMaster) {
    console.warn("[permission-debug] frontend.table-role.missing", {
      tableId: toStringValue(record.id),
      currentUserRole: record.currentUserRole ?? null,
      isMaster: record.isMaster ?? null,
      memberStatus: record.memberStatus ?? null,
      responseKeys: Object.keys(root),
      unwrappedKeys: Object.keys(unwrapped),
      nestedTableKeys: Object.keys(nestedTable)
    });
  }

  return {
    id: toStringValue(record.id),
    name: toStringValue(record.name ?? record.title),
    description: toStringValue(record.description) || "Mesa sem descricao detalhada.",
    code: toStringValue(record.code ?? record.inviteCode ?? record.joinCode),
    masterId: toStringValue(record.masterId ?? record.ownerId ?? master.id) || undefined,
    currentUserRole,
    isMaster,
    memberStatus: normalizeTableMemberStatus(record.memberStatus),
    membersCount:
      membersCount ?? (members.length || (playerCount !== undefined ? playerCount + 1 : 0)),
    memberCount:
      membersCount ?? (members.length || (playerCount !== undefined ? playerCount + 1 : 0)),
    currentArc: toStringValue(record.currentArc ?? record.arc ?? world?.currentArc) || null,
    createdAt: toStringValue(record.createdAt) || undefined,
    updatedAt: toStringValue(record.updatedAt) || undefined,
    members,
    world,
    characterReviews: asArray(record.characterReviews ?? record.reviews, mapCharacterReview),
    missions: asArray(record.missions, mapTableMission),
    timeline: asArray(record.timeline ?? record.timelineEvents, mapTableTimelineEvent)
  };
}

function mapMasterOverview(input: unknown): MasterOverview {
  const root = asRecord(input);
  const nestedOverview = asRecord(root.overview);
  const record = Object.keys(nestedOverview).length ? nestedOverview : unwrapEntity(input);
  const table = mapTable(record.table ?? root.table ?? record);
  const worldStatus = asRecord(record.worldStatus ?? record.world);
  const membersSummary = asRecord(record.membersSummary ?? record.members);
  const charactersSummary = asRecord(record.charactersSummary ?? record.characters);
  const missionsSummary = asRecord(record.missionsSummary ?? record.missions);
  const submissionsSummary = asRecord(record.submissionsSummary ?? record.submissions);
  const timelineSummary = asRecord(record.timelineSummary ?? record.timeline);
  const recommendedAction = asRecord(record.nextRecommendedAction);
  const onboardingChecklist = asArray(
    record.onboardingChecklist,
    (entry): MasterOverviewChecklistItem => {
      const item = asRecord(entry);
      const section = toStringValue(item.section ?? item.target ?? item.anchor);

      return {
        key: toStringValue(item.key ?? item.id ?? item.code),
        label: toStringValue(item.label ?? item.title ?? item.name),
        completed:
          toBooleanValue(item.completed ?? item.done ?? item.isCompleted) ||
          ["DONE", "COMPLETED"].includes(toStringValue(item.status).toUpperCase()),
        section: section ? (section as MasterPanelSection) : undefined,
        actionLabel: toStringValue(item.actionLabel ?? item.buttonLabel) || undefined
      };
    }
  );
  const recommendedSection = toStringValue(
    recommendedAction.section ?? recommendedAction.target ?? recommendedAction.anchor
  );

  return {
    table,
    worldStatus: {
      configured: toBooleanValue(
        worldStatus.configured ?? worldStatus.completed ?? worldStatus.hasWorld
      )
    },
    membersSummary: {
      total: toNumberValue(
        membersSummary.total ?? membersSummary.count ?? membersSummary.totalMembers,
        table.membersCount
      ),
      pending: toOptionalNumberValue(membersSummary.pending)
    },
    charactersSummary: {
      total: toNumberValue(
        charactersSummary.total ?? charactersSummary.count ?? charactersSummary.totalCharacters
      ),
      pending: toOptionalNumberValue(
        charactersSummary.pending ?? charactersSummary.pendingCharacters
      )
    },
    missionsSummary: {
      total: toNumberValue(
        missionsSummary.total ?? missionsSummary.count ?? missionsSummary.totalMissions
      ),
      active: toOptionalNumberValue(
        missionsSummary.active ?? missionsSummary.activeMissions
      ),
      completed: toOptionalNumberValue(missionsSummary.completed)
    },
    submissionsSummary: {
      total: toNumberValue(
        submissionsSummary.total ??
          submissionsSummary.count ??
          (typeof submissionsSummary.pendingSubmissions === "number" &&
          typeof submissionsSummary.reviewedSubmissions === "number"
            ? submissionsSummary.pendingSubmissions + submissionsSummary.reviewedSubmissions
            : undefined)
      ),
      pending: toOptionalNumberValue(
        submissionsSummary.pending ?? submissionsSummary.pendingSubmissions
      )
    },
    timelineSummary: {
      total: toNumberValue(
        timelineSummary.total ?? timelineSummary.count ?? timelineSummary.totalEvents
      )
    },
    onboardingChecklist,
    nextRecommendedAction: Object.keys(recommendedAction).length
      ? {
          title: toStringValue(recommendedAction.title),
          description: toStringValue(recommendedAction.description),
          actionLabel:
            toStringValue(recommendedAction.actionLabel ?? recommendedAction.buttonLabel) ||
            undefined,
          section: recommendedSection
            ? (recommendedSection as MasterPanelSection)
            : undefined
        }
      : null
  };
}

function mapAIWorldSummary(input: unknown): AIWorldSummaryResponse {
  const record = unwrapEntity(input);

  return {
    suggestedTitle: toStringValue(record.suggestedTitle ?? record.title),
    suggestedSummary: toStringValue(record.suggestedSummary ?? record.summary),
    suggestedTone: toStringValue(record.suggestedTone ?? record.tone),
    suggestedRules: toJsonTextValue(record.suggestedRules ?? record.rules),
    suggestedCharacterCreationCriteria: toJsonTextValue(
      record.suggestedCharacterCreationCriteria ??
        record.suggestedCharacterCriteria ??
        record.characterCreationCriteria ??
        record.characterCriteria
    )
  };
}

function mapAIMissionIdeas(input: unknown): AIMissionIdeasResponse {
  const record = unwrapEntity(input);
  const source = record.ideas ?? record.missions ?? input;

  return {
    ideas: asArray(source, (entry) => {
      const idea = asRecord(entry);
      return {
        title: toStringValue(idea.title ?? idea.name),
        description: toStringValue(idea.description ?? idea.summary),
        objective: toStringValue(idea.objective ?? idea.goal),
        rewardSuggestion: toStringValue(
          idea.rewardSuggestion ?? idea.reward ?? idea.suggestedReward
        ),
        consequenceSuggestion: toStringValue(
          idea.consequenceSuggestion ?? idea.consequence ?? idea.suggestedConsequence
        )
      };
    }).slice(0, 3)
  };
}

function mapAITraitSuggestion(input: unknown): AITraitSuggestion {
  if (typeof input === "string") {
    return { name: input, description: "" };
  }

  const record = asRecord(input);
  return {
    name: toStringValue(record.name ?? record.title ?? record.trait),
    description: toStringValue(record.description ?? record.effect ?? record.summary)
  };
}

function mapAITraits(input: unknown): AITraitsResponse {
  const record = unwrapEntity(input);
  const suggestions = asRecord(record.suggestions);

  return {
    positive: asArray(record.positive ?? suggestions.positive, mapAITraitSuggestion),
    negative: asArray(record.negative ?? suggestions.negative, mapAITraitSuggestion),
    neutral: asArray(record.neutral ?? suggestions.neutral, mapAITraitSuggestion)
  };
}

function mapAITimelineSummary(input: unknown): AITimelineSummaryResponse {
  const record = unwrapEntity(input);

  return {
    suggestedTitle: toStringValue(record.suggestedTitle ?? record.title),
    suggestedDescription: toStringValue(
      record.suggestedDescription ?? record.description ?? record.summary
    )
  };
}

function mapAdminEntity(input: unknown): AdminEntity {
  const record = unwrapEntity(input);
  const product = asRecord(record.product ?? record.shopProduct);
  const monster = asRecord(record.monster);
  const journey = asRecord(record.journey);
  const journeySummary = asArray(record.journeySummary, (entry) => {
    const node = asRecord(entry);
    return (
      toStringValue(node.title) ||
      toStringValue(node.text) ||
      toStringValue(node.type)
    );
  }).filter(Boolean);
  return {
    id: toStringValue(record.id ?? product.id ?? record.productId),
    name: toStringValue(
      record.name ?? record.title ?? product.name ?? product.title ?? record.slug ?? monster.name
    ),
    title: toStringValue(record.title ?? product.title) || undefined,
    description:
      toStringValue(record.description) ||
      toStringValue(record.startDialogue) ||
      toStringValue(record.completionDialogue) ||
      toStringValue(product.description) ||
      toStringValue(record.effect) ||
      toStringValue(product.effect) ||
      toStringValue(monster.description) ||
      toStringValue(monster.name) ||
      toStringValue(record.dialogue) ||
      toStringValue(record.enemyName) ||
      "Sem descricao detalhada.",
    difficulty: toStringValue(record.difficulty) as AdminEntity["difficulty"],
    active: toBooleanValue(record.isActive ?? product.isActive, true),
    imageUrl:
      toStringValue(record.imageUrl ?? monster.imageUrl ?? product.img) || undefined,
    relatedId: toStringValue(record.monsterId) || undefined,
    level: toOptionalNumberValue(record.level),
    health: toOptionalNumberValue(record.health),
    attack: toOptionalNumberValue(record.attack),
    defense: toOptionalNumberValue(record.defense),
    experience: toOptionalNumberValue(record.experience),
    monsterId: toStringValue(record.monsterId) || undefined,
    recommendedLevel: toOptionalNumberValue(record.recommendedLevel),
    reward: toOptionalNumberValue(record.reward),
    rewardXp: toOptionalNumberValue(record.rewardXp),
    timeLimit: toStringValue(record.timeLimit) || undefined,
    status: toStringValue(record.status) || undefined,
    enemyName: toStringValue(record.enemyName) || undefined,
    enemyLevel: toOptionalNumberValue(record.enemyLevel),
    enemyHealth: toOptionalNumberValue(record.enemyHealth),
    enemyAttack: toOptionalNumberValue(record.enemyAttack),
    enemyDefense: toOptionalNumberValue(record.enemyDefense),
    rewardCoins: toOptionalNumberValue(record.rewardCoins),
    startNpcId: toStringValue(record.startNpcId) || undefined,
    completionNpcId: toStringValue(record.completionNpcId) || undefined,
    startDialogue: toStringValue(record.startDialogue) || undefined,
    completionDialogue: toStringValue(record.completionDialogue) || undefined,
    repeatCooldownSeconds: toOptionalNumberValue(record.repeatCooldownSeconds),
    journey:
      Object.keys(journey).length > 0
        ? {
            startNodeId: toStringValue(journey.startNodeId) || undefined,
            nodes: Array.isArray(journey.nodes) ? journey.nodes : undefined
          }
        : undefined,
    journeySummary: journeySummary.length ? journeySummary : undefined,
    trainingType: toStringValue(record.trainingType) || undefined,
    xpReward: toOptionalNumberValue(record.xpReward),
    coinsReward: toOptionalNumberValue(record.coinsReward),
    cooldownSeconds: toOptionalNumberValue(record.cooldownSeconds),
    role: toStringValue(record.role) || undefined,
    interactionType: toStringValue(record.interactionType) || undefined,
    dialogue: toStringValue(record.dialogue) || undefined,
    slug: toStringValue(record.slug ?? product.slug) || undefined,
    category: toStringValue(record.category ?? product.category) || undefined,
    type: toStringValue(record.type ?? product.type) || undefined,
    img: toStringValue(record.img ?? product.img) || undefined,
    effect: toStringValue(record.effect ?? product.effect) || undefined,
    assetKind: toStringValue(record.assetKind ?? product.assetKind) || undefined,
    buyPrice: toOptionalNumberValue(record.buyPrice ?? product.buyPrice),
    currency: toStringValue(record.currency ?? product.currency) || undefined,
    rewardQuantity: toOptionalNumberValue(record.rewardQuantity ?? product.rewardQuantity),
    suggestedSellPrice: toOptionalNumberValue(
      record.suggestedSellPrice ?? product.suggestedSellPrice
    )
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
    stats: mapPresentedStats(record.stats),
    rounds: asArray(record.rounds, mapGameplayCombatRound)
  };
}

function mapMissionReference(input: unknown) {
  const record = unwrapEntity(input);
  return {
    id: toStringValue(record.id),
    title: toStringValue(record.title ?? record.name),
    isActive:
      typeof record.isActive === "boolean"
        ? record.isActive
        : undefined
  };
}

function mapMissionJourneyChoice(input: unknown): MissionJourneyChoice {
  const record = unwrapEntity(input);
  return {
    id: toStringValue(record.id),
    label: toStringValue(record.label),
    description: toStringValue(record.description) || undefined,
    nextNodeId: toStringValue(record.nextNodeId)
  };
}

function mapMissionJourneyEnemy(input: unknown): MissionJourneyEnemy {
  const record = unwrapEntity(input);
  return {
    name: toStringValue(record.name),
    imageUrl: toStringValue(record.imageUrl) || undefined,
    level: toNumberValue(record.level),
    health: toNumberValue(record.health),
    attack: toNumberValue(record.attack),
    defense: toNumberValue(record.defense)
  };
}

function mapMissionJourneyNode(input: unknown): MissionJourneyNode {
  const record = unwrapEntity(input);
  return {
    id: toStringValue(record.id),
    type: toStringValue(record.type, "DIALOGUE") as MissionJourneyNode["type"],
    title: toStringValue(record.title) || undefined,
    text: toStringValue(record.text) || undefined,
    nextNodeId: toStringValue(record.nextNodeId) || undefined,
    npcId: toStringValue(record.npcId) || undefined,
    enemy: isObject(record.enemy) ? mapMissionJourneyEnemy(record.enemy) : undefined,
    choices: asArray(record.choices, mapMissionJourneyChoice)
  };
}

function mapBattleLogEntry(input: unknown) {
  if (typeof input === "string") {
    return {
      action: input
    };
  }

  const record = asRecord(input);
  return {
    round: toOptionalNumberValue(record.round),
    actor:
      (toStringValue(record.actor) || undefined) as
        | "character"
        | "monster"
        | undefined,
    action: toStringValue(record.action) || undefined,
    damage: toOptionalNumberValue(record.damage),
    critical:
      typeof record.critical === "boolean" ? record.critical : undefined,
    attacker: toStringValue(record.attacker) || undefined,
    defender: toStringValue(record.defender) || undefined,
    remainingCharacterHealth: toOptionalNumberValue(record.remainingCharacterHealth),
    remainingEnemyHealth: toOptionalNumberValue(record.remainingEnemyHealth),
    characterHealth: toOptionalNumberValue(record.characterHealth),
    enemyHealth: toOptionalNumberValue(record.enemyHealth)
  };
}

function mapCombatSession(input: unknown): CombatSessionState | undefined {
  if (!isObject(input)) return undefined;
  const record = asRecord(input);
  const enemy = asRecord(record.enemy);
  const character = asRecord(record.character);
  const characterStats = asRecord(character.stats);
  const id = toStringValue(record.id);
  const enemyName = toStringValue(enemy.name);
  const actions = asArray(record.actions, (entry) =>
    toStringValue(entry, "ATTACK") as CombatSessionAction
  );

  if (!id || !enemyName || actions.length === 0) {
    return undefined;
  }

  return {
    id,
    missionSessionId: toStringValue(record.missionSessionId) || null,
    sourceType: (toStringValue(record.sourceType) || undefined) as CombatSessionState["sourceType"],
    sourceId: toStringValue(record.sourceId) || undefined,
    status: (toStringValue(record.status, "IN_PROGRESS") as CombatSessionState["status"]) ?? "IN_PROGRESS",
    turnNumber: toNumberValue(record.turnNumber),
    availableAt: toStringValue(record.availableAt) || undefined,
    enemy: {
      name: enemyName,
      imageUrl: toStringValue(enemy.imageUrl) || undefined,
      level: toNumberValue(enemy.level),
      attack: toNumberValue(enemy.attack),
      defense: toNumberValue(enemy.defense),
      currentHealth: toNumberValue(enemy.currentHealth),
      maxHealth: toNumberValue(enemy.maxHealth)
    },
    character: {
      currentHealth: toNumberValue(character.currentHealth),
      maxHealth: toNumberValue(character.maxHealth),
      stats:
        Object.keys(characterStats).length > 0
          ? {
              attack: toNumberValue(characterStats.attack),
              defense: toNumberValue(characterStats.defense),
              maxHealth: toNumberValue(characterStats.maxHealth),
              critChance: toNumberValue(characterStats.critChance),
              critChancePercent: toNumberValue(characterStats.critChancePercent)
            }
          : undefined
    },
    actions,
    battleLog: asArray(record.battleLog, mapBattleLogEntry)
  };
}

function mapMissionSession(input: unknown): MissionSessionState {
  const record = unwrapEntity(input);
  const completion = asRecord(record.completion);
  const completionInventory = asRecord(completion.inventory);
  return {
    sessionId: toStringValue(record.sessionId ?? record.id),
    status:
      (toStringValue(record.status, "IN_PROGRESS") as MissionSessionState["status"]) ??
      "IN_PROGRESS",
    startedAt: toStringValue(record.startedAt ?? record.createdAt),
    updatedAt: toStringValue(record.updatedAt ?? record.startedAt),
    completedAt: toStringValue(record.completedAt) || null,
    nextAvailableAt: toStringValue(record.nextAvailableAt) || null,
    mission: mapGameplayEntity(record.mission ?? record.missionDefinition ?? {}),
    currentNode: isObject(record.currentNode) ? mapMissionJourneyNode(record.currentNode) : undefined,
    journeySummary: asArray(record.journeySummary, mapMissionJourneyNode),
    combatSession: mapCombatSession(record.combatSession) ?? null,
    completion:
      Object.keys(completion).length > 0
        ? {
            rewards: Object.keys(asRecord(completion.rewards)).length > 0
              ? {
                  xp: toNumberValue(asRecord(completion.rewards).xp),
                  coins: toNumberValue(asRecord(completion.rewards).coins),
                  items: []
                }
              : undefined,
            progression: mapGameplayProgression(completion.progression),
            inventory:
              Object.keys(completionInventory).length > 0
                ? {
                    id: toStringValue(completionInventory.id) || undefined,
                    coins: toNumberValue(completionInventory.coins)
                  }
                : undefined
          }
        : null
  };
}

function mapCombatTurnResult(input: unknown): CombatTurnResult {
  const record = unwrapEntity(input);
  const rewardsRecord = asRecord(record.rewards);
  const inventoryRecord = asRecord(record.inventory);
  const transactionRecord = asRecord(record.transaction);
  const defeatPenaltyRecord = asRecord(record.defeatPenalty);
  const combatSession =
    mapCombatSession(record.combatSession ?? record.session ?? record.result) ??
    mapCombatSession(record);

  if (!combatSession) {
    throw new Error("A API nao retornou combatSession para o turno de combate.");
  }

  return {
    action: toStringValue(record.action) || undefined,
    outcome:
      (toStringValue(record.outcome, "IN_PROGRESS") as CombatTurnResult["outcome"]) ??
      "IN_PROGRESS",
    combatSession,
    characterState: isObject(record.characterState)
      ? {
          currentHealth: toNumberValue(asRecord(record.characterState).currentHealth),
          maxHealth: toNumberValue(asRecord(record.characterState).maxHealth),
          status:
            (toStringValue(asRecord(record.characterState).status, "READY") as
              GameplayCharacterState["status"]) ?? "READY",
          lastCombatAt: toStringValue(asRecord(record.characterState).lastCombatAt) || undefined,
          lastRecoveredAt:
            toStringValue(asRecord(record.characterState).lastRecoveredAt) || undefined
        }
      : undefined,
    mission: isObject(record.mission) ? mapMissionSession(record.mission) : undefined,
    rewards:
      Object.keys(rewardsRecord).length > 0
        ? {
            xp: toNumberValue(rewardsRecord.xp),
            coins: toNumberValue(rewardsRecord.coins),
            items: []
          }
        : undefined,
    progression:
      Object.keys(asRecord(record.progression)).length > 0
        ? mapGameplayProgression(record.progression)
        : undefined,
    inventory:
      Object.keys(inventoryRecord).length > 0
        ? {
            id: toStringValue(inventoryRecord.id) || undefined,
            coins: toNumberValue(inventoryRecord.coins)
          }
        : undefined,
    transaction:
      Object.keys(transactionRecord).length > 0
        ? {
            id: toStringValue(transactionRecord.id) || undefined,
            type: toStringValue(transactionRecord.type) || undefined,
            value:
              typeof transactionRecord.value === "number"
                ? transactionRecord.value
                : undefined
          }
        : undefined,
    defeatPenalty:
      Object.keys(defeatPenaltyRecord).length > 0
        ? {
            difficulty:
              (toStringValue(defeatPenaltyRecord.difficulty) || undefined) as
                | Difficulty
                | undefined,
            xpLossPercent: toOptionalNumberValue(defeatPenaltyRecord.xpLossPercent),
            coinsLossPercent: toOptionalNumberValue(defeatPenaltyRecord.coinsLossPercent),
            forceDefeat:
              typeof defeatPenaltyRecord.forceDefeat === "boolean"
                ? defeatPenaltyRecord.forceDefeat
                : undefined
          }
        : null
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
  const buff = asRecord(record.buff);
  const transaction = asRecord(record.transaction);
  const defeatPenalty = asRecord(record.defeatPenalty);
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
    npcId: toStringValue(record.npcId) || undefined,
    npcName: toStringValue(record.npcName) || undefined,
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
    buff:
      Object.keys(buff).length > 0
        ? {
            percent: toNumberValue(buff.percent),
            cost: toNumberValue(buff.cost),
            expiresAt: toStringValue(buff.expiresAt)
          }
        : undefined,
    combat: mapGameplayCombat(record.combat),
    defeatPenalty:
      Object.keys(defeatPenalty).length > 0
        ? {
            difficulty: (toStringValue(defeatPenalty.difficulty) || undefined) as
              | Difficulty
              | undefined,
            xpLoss: toNumberValue(defeatPenalty.xpLoss),
            coinsLoss: toNumberValue(defeatPenalty.coinsLoss),
            forceDefeat: toBooleanValue(defeatPenalty.forceDefeat)
          }
        : null,
    availability:
      nextAvailableAt || availabilityActionType
        ? {
            actionType: availabilityActionType,
            nextAvailableAt
          }
        : undefined,
    interactionType: toStringValue(record.interactionType) || undefined,
    transaction:
      Object.keys(transaction).length > 0
        ? {
            id: toStringValue(transaction.id) || undefined,
            type: toStringValue(transaction.type) || undefined,
            value: typeof transaction.value === "number" ? transaction.value : undefined
          }
        : undefined
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
  updateCustomization(
    id: string,
    input: { avatarId?: string; titleId?: string; bannerId?: string }
  ): Promise<CharacterSummary>;
  awaken(id: string, input: { targetClassId: string }): Promise<void>;
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
  missionSessions(characterId: string): Promise<MissionSessionState[]>;
  missionSession(characterId: string, sessionId: string): Promise<MissionSessionState>;
  startMissionJourney(
    characterId: string,
    input: { missionId: string; npcId: string }
  ): Promise<MissionSessionState>;
  progressMissionJourney(
    characterId: string,
    sessionId: string,
    input: { choiceId?: string; npcId?: string }
  ): Promise<MissionSessionState>;
  abandonMissionJourney(characterId: string, sessionId: string): Promise<MissionSessionState>;
  combatTurn(
    characterId: string,
    combatSessionId: string,
    input: { action: CombatSessionAction }
  ): Promise<CombatTurnResult>;
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

export interface TradesApiContract {
  list(characterId: string): Promise<TradeList>;
  create(input: {
    requesterCharacterId: string;
    targetCharacterId: string;
    offeredCoins?: number;
    requestedCoins?: number;
    note?: string;
    expiresInHours?: number;
    offeredAssets?: Array<{ assetType: "ITEM" | "EQUIPMENT"; assetId: string; quantity?: number }>;
    requestedAssets?: Array<{ assetType: "ITEM" | "EQUIPMENT"; assetId: string; quantity?: number }>;
  }): Promise<TradeRecord>;
  respond(tradeId: string, input: { action: TradeAction }): Promise<TradeRecord>;
}

export interface PvpApiContract {
  rankings(limit?: number): Promise<PvpRanking>;
  overview(characterId: string): Promise<PvpOverview>;
  createMatch(input: { characterId: string; opponentCharacterId: string }): Promise<PvpMatchResult>;
}

export interface TablesApiContract {
  list(): Promise<Table[]>;
  getTablesDashboard(): Promise<TableDashboardResponse>;
  create(input: { name: string }): Promise<Table>;
  join(input: { joinCode: string }): Promise<Table>;
  byId(id: string): Promise<Table>;
  masterOverview(tableId: string): Promise<MasterOverview>;
  generateWorldSummary(
    tableId: string,
    input: AIInstructionPayload
  ): Promise<AIWorldSummaryResponse>;
  generateMissionIdeas(
    tableId: string,
    input: AIInstructionPayload
  ): Promise<AIMissionIdeasResponse>;
  generateTraitSuggestions(
    tableId: string,
    input: AITraitsPayload
  ): Promise<AITraitsResponse>;
  generateTimelineSummary(
    tableId: string,
    input: AITimelineSummaryPayload
  ): Promise<AITimelineSummaryResponse>;
  characters(tableId: string): Promise<TableCharacter[]>;
  createCharacter(tableId: string, input: { name: string; classId?: string }): Promise<TableCharacter>;
  characterTraits(tableId: string, characterId: string): Promise<CharacterTrait[]>;
  updateWorld(
    tableId: string,
    input: {
      name?: string;
      summary?: string;
      currentArc?: string;
      tone?: string;
      rules?: string | Record<string, unknown>;
      characterCreationCriteria?: string | Record<string, unknown>;
      characterCriteria?: string | Record<string, unknown>;
    }
  ): Promise<TableWorld>;
  missions(tableId: string): Promise<TableMission[]>;
  timeline(tableId: string): Promise<TableTimelineEvent[]>;
  missionSubmissions(tableId: string, missionId: string): Promise<TableMissionSubmission[]>;
  getTableSubmissions(
    tableId: string,
    filters?: TableSubmissionFilters
  ): Promise<TableSubmissionListResponse>;
  getMyTableSubmissions(
    tableId: string,
    filters?: TableSubmissionFilters
  ): Promise<TableSubmissionListResponse>;
  createMissionSubmission(
    tableId: string,
    missionId: string,
    input: { characterId: string; content: string }
  ): Promise<TableMissionSubmission>;
  reviewCharacter(
    tableId: string,
    characterId: string,
    input: { status: CharacterReview["status"]; notes?: string }
  ): Promise<CharacterReview>;
  createTrait(
    tableId: string,
    characterId: string,
    input: { name: string; description?: string; tone: CharacterTrait["tone"]; category?: string; value?: number }
  ): Promise<CharacterTrait>;
  createMission(
    tableId: string,
    input: {
      title: string;
      description?: string;
      status?: TableMission["status"];
      recommendedLevel?: number;
      rewardHint?: string;
      dueAt?: string;
    }
  ): Promise<TableMission>;
  reviewMissionSubmission(
    tableId: string,
    missionId: string,
    submissionId: string,
    input: { status: TableMissionSubmission["status"]; notes?: string; rewardXp?: number; rewardCoins?: number }
  ): Promise<TableMissionSubmission>;
  createTimelineEvent(
    tableId: string,
    input: {
      kind: TableTimelineEvent["kind"];
      title: string;
      description?: string;
      occurredAt?: string;
    }
  ): Promise<TableTimelineEvent>;
}

export interface AdminApiContract {
  list(type: string): Promise<AdminEntity[]>;
  create(type: string, input: Record<string, unknown>): Promise<AdminEntity>;
  update(type: string, id: string, input: Record<string, unknown>): Promise<AdminEntity>;
  remove(type: string, id: string): Promise<void>;
}

function adminBasePath(type: string) {
  const allowed = ["monsters", "bounties", "missions", "trainings", "npcs", "shop-products"];
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
    updateCustomization: (id, input) =>
      request(apiClient.patch(`/api/v1/characters/${id}/customization`, input), mapCharacter),
    awaken: async (id, input) => {
      await apiClient.post(`/api/v1/characters/${id}/awaken`, input);
    },
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
    missionSessions: (characterId) =>
      request(
        apiClient.get(`/api/v1/gameplay/characters/${characterId}/missions/sessions`),
        (data) => asArray(data, mapMissionSession)
      ),
    missionSession: (characterId, sessionId) =>
      request(
        apiClient.get(`/api/v1/gameplay/characters/${characterId}/missions/sessions/${sessionId}`),
        mapMissionSession
      ),
    startMissionJourney: (characterId, input) =>
      request(
        apiClient.post(`/api/v1/gameplay/characters/${characterId}/missions/start`, input),
        mapMissionSession
      ),
    progressMissionJourney: (characterId, sessionId, input) =>
      request(
        apiClient.post(
          `/api/v1/gameplay/characters/${characterId}/missions/sessions/${sessionId}/progress`,
          input
        ),
        mapMissionSession
      ),
    abandonMissionJourney: (characterId, sessionId) =>
      request(
        apiClient.post(
          `/api/v1/gameplay/characters/${characterId}/missions/sessions/${sessionId}/abandon`
        ),
        mapMissionSession
      ),
    combatTurn: async (characterId, combatSessionId, input): Promise<CombatTurnResult> => {
      try {
        const response = await apiClient.post(
          `/api/v1/gameplay/characters/${characterId}/combat-sessions/${combatSessionId}/actions`,
          input
        );
        return mapCombatTurnResult(response.data);
      } catch (error) {
        throw apiRequestError(error, "Falha ao processar turno de combate.");
      }
    },
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
            npcId: payload.npcId,
            ...(typeof payload.buffPercent === "number" ? { buffPercent: payload.buffPercent } : {})
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
  trades: {
    list: (characterId) =>
      request(apiClient.get(`/api/v1/trades/characters/${characterId}`), mapTradeList),
    create: (input) => request(apiClient.post("/api/v1/trades/requests", input), mapTradeRecord),
    respond: (tradeId, input) =>
      request(apiClient.post(`/api/v1/trades/${tradeId}/respond`, input), mapTradeRecord)
  } satisfies TradesApiContract,
  pvp: {
    rankings: (limit) =>
      request(
        apiClient.get("/api/v1/pvp/rankings", {
          params: typeof limit === "number" ? { limit } : undefined
        }),
        mapPvpRanking
      ),
    overview: (characterId) =>
      request(apiClient.get(`/api/v1/pvp/characters/${characterId}/overview`), mapPvpOverview),
    createMatch: (input) => request(apiClient.post("/api/v1/pvp/matches", input), mapPvpMatchResult)
  } satisfies PvpApiContract,
  tables: {
    list: () => request(apiClient.get("/api/v1/tables"), (data) => asArray(data, mapTable)),
    getTablesDashboard: () =>
      request(apiClient.get("/api/v1/tables/dashboard"), mapTablesDashboard),
    create: (input) => request(apiClient.post("/api/v1/tables", input), mapTable),
    join: (input) => request(apiClient.post("/api/v1/tables/join", input), mapTable),
    byId: (id) => request(apiClient.get(`/api/v1/tables/${id}`), mapTable),
    masterOverview: (tableId) =>
      request(
        apiClient.get(`/api/v1/tables/${tableId}/master/overview`),
        mapMasterOverview
      ),
    generateWorldSummary: (tableId, input) =>
      request(
        apiClient.post(`/api/v1/tables/${tableId}/ai/world-summary`, input),
        mapAIWorldSummary
      ),
    generateMissionIdeas: (tableId, input) =>
      request(
        apiClient.post(`/api/v1/tables/${tableId}/ai/mission-ideas`, input),
        mapAIMissionIdeas
      ),
    generateTraitSuggestions: (tableId, input) => {
      if (!input.characterId.trim()) {
        return Promise.reject(new Error("Selecione um personagem válido da mesa."));
      }

      return request(
        apiClient.post(`/api/v1/tables/${tableId}/ai/traits`, input),
        mapAITraits
      );
    },
    generateTimelineSummary: (tableId, input) =>
      request(
        apiClient.post(`/api/v1/tables/${tableId}/ai/timeline-summary`, input),
        mapAITimelineSummary
      ),
    characters: (tableId) =>
      request(
        apiClient.get(`/api/v1/tables/${tableId}/characters`),
        (data) => asArray(data, mapTableCharacter)
      ),
    createCharacter: (tableId, input) =>
      request(apiClient.post(`/api/v1/tables/${tableId}/characters`, input), (data) => {
        const record = unwrapEntity(data);
        return mapTableCharacter(record.character ?? record);
      }),
    characterTraits: (tableId, characterId) =>
      request(
        apiClient.get(`/api/v1/tables/${tableId}/characters/${characterId}/traits`),
        (data) => asArray(data, mapCharacterTrait)
      ),
    updateWorld: (tableId, input) =>
      request(
        apiClient.put(`/api/v1/tables/${tableId}/world`, {
          campaignTitle: input.name,
          summary: input.summary || "Resumo ainda nao informado.",
          currentArc: input.currentArc || undefined,
          tone: input.tone || undefined,
          rules:
            typeof input.rules === "string"
              ? { text: input.rules }
              : input.rules,
          characterCreationCriteria:
            typeof (input.characterCreationCriteria ?? input.characterCriteria) === "string"
              ? {
                  text: input.characterCreationCriteria ?? input.characterCriteria
                }
              : input.characterCreationCriteria ?? input.characterCriteria
        }),
        mapTableWorld
      ),
    missions: (tableId) =>
      request(
        apiClient.get(`/api/v1/tables/${tableId}/missions`),
        (data) => asArray(data, mapTableMission)
      ),
    timeline: (tableId) =>
      request(
        apiClient.get(`/api/v1/tables/${tableId}/timeline`),
        (data) => asArray(data, mapTableTimelineEvent)
      ),
    missionSubmissions: (tableId, missionId) =>
      request(
        apiClient.get(`/api/v1/tables/${tableId}/missions/${missionId}/submissions`),
        (data) => asArray(data, mapTableMissionSubmission)
      ),
    getTableSubmissions: (tableId, filters) =>
      request(
        apiClient.get(`/api/v1/tables/${tableId}/submissions`, { params: filters }),
        mapTableSubmissionList
      ),
    getMyTableSubmissions: (tableId, filters) =>
      request(
        apiClient.get(`/api/v1/tables/${tableId}/submissions/me`, { params: filters }),
        mapTableSubmissionList
      ),
    createMissionSubmission: (tableId, missionId, input) =>
      request(
        apiClient.post(`/api/v1/tables/${tableId}/missions/${missionId}/submissions`, input),
        mapTableMissionSubmission
      ),
    reviewCharacter: (tableId, reviewId, input) =>
      request(
        apiClient.patch(`/api/v1/tables/${tableId}/characters/${reviewId}/review`, {
          status: input.status === "CHANGES_REQUESTED" ? "NEEDS_CHANGES" : input.status,
          masterFeedback: input.notes
        }),
        mapCharacterReview
      ),
    createTrait: (tableId, characterId, input) =>
      request(
        apiClient.post(`/api/v1/tables/${tableId}/characters/${characterId}/traits`, {
          type: input.tone,
          name: input.name,
          description: input.description
        }),
        mapCharacterTrait
      ),
    createMission: (tableId, input) =>
      request(
        apiClient.post(`/api/v1/tables/${tableId}/missions`, {
          title: input.title,
          description: input.description || "Sem descricao detalhada.",
          dueDate: input.dueAt
        }),
        mapTableMission
      ),
    reviewMissionSubmission: (tableId, missionId, submissionId, input) =>
      request(
        apiClient.patch(
          `/api/v1/tables/${tableId}/missions/${missionId}/submissions/${submissionId}/review`,
          {
            status: input.status === "PENDING" ? "SUBMITTED" : input.status,
            masterNote: input.notes
          }
        ),
        mapTableMissionSubmission
      ),
    createTimelineEvent: (tableId, input) =>
      request(
        apiClient.post(`/api/v1/tables/${tableId}/timeline`, {
          type: input.kind === "NOTE" ? "MASTER_NOTE" : input.kind,
          title: input.title,
          description: input.description || "Sem descricao detalhada."
        }),
        mapTableTimelineEvent
      )
  } satisfies TablesApiContract,
  admin: {
    list: (type) =>
      request(apiClient.get(adminBasePath(type)), (data) => asArray(data, mapAdminEntity)),
    create: (type, input) => request(apiClient.post(adminBasePath(type), input), mapAdminEntity),
    update: (type, id, input) =>
      request(apiClient.patch(`${adminBasePath(type)}/${id}`, input), mapAdminEntity),
    remove: async (type, id) => {
      await apiClient.delete(`${adminBasePath(type)}/${id}`);
    }
  } satisfies AdminApiContract
};
