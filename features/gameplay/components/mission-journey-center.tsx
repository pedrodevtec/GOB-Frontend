"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, MessageSquare, Swords } from "lucide-react";

import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { useGameplayList } from "@/features/gameplay/hooks/use-gameplay";
import {
  useAbandonMissionJourney,
  useCombatTurn,
  useMissionSession,
  useMissionSessions,
  useProgressMissionJourney,
  useStartMissionJourney
} from "@/features/gameplay/hooks/use-mission-journey";
import { useActiveCharacter } from "@/hooks/use-active-character";
import type {
  CombatSessionAction,
  CombatSessionState,
  CombatTurnResult,
  GameplayCombatRound,
  GameplayEntity,
  MissionSessionState
} from "@/types/app";

type GameplayViewState =
  | { screen: "hub" }
  | { screen: "mission-node"; session: MissionSessionState }
  | { screen: "combat"; combat: CombatSessionState; missionSessionId?: string }
  | { screen: "mission-complete"; session: MissionSessionState };

function statusLabel(status: MissionSessionState["status"]) {
  if (status === "READY_TO_TURN_IN") return "Pronta para entrega";
  if (status === "COMPLETED") return "Concluida";
  if (status === "FAILED") return "Falhou";
  if (status === "ABANDONED") return "Abandonada";
  return "Em andamento";
}

function statusTone(status: MissionSessionState["status"]) {
  if (status === "READY_TO_TURN_IN") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-100";
  if (status === "COMPLETED") return "border-sky-500/30 bg-sky-500/10 text-sky-100";
  if (status === "FAILED" || status === "ABANDONED") {
    return "border-rose-500/30 bg-rose-500/10 text-rose-100";
  }
  return "border-amber-500/30 bg-amber-500/10 text-amber-100";
}

function actionLabel(action: CombatSessionAction) {
  if (action === "POWER_ATTACK") return "Ataque forte";
  if (action === "DEFEND") return "Defender";
  return "Atacar";
}

function resolveTargetNpcId(session: MissionSessionState) {
  return (
    session.currentNode?.npcId ??
    session.mission.completionNpcId ??
    session.mission.startNpcId
  );
}

function hasRenderableCombat(session: MissionSessionState) {
  return Boolean(
    session.combatSession?.id &&
      session.combatSession.enemy.name &&
      session.combatSession.actions.length
  );
}

function resolveSessionHeadline(session: MissionSessionState) {
  return (
    session.currentNode?.title ??
    session.currentNode?.text ??
    session.journeySummary[0]?.title ??
    session.journeySummary[0]?.text ??
    session.mission.name
  );
}

function resolveSessionDescription(session: MissionSessionState) {
  const missionDescription =
    session.mission.description && session.mission.description !== "Sem descricao detalhada na API."
      ? session.mission.description
      : null;

  return (
    session.currentNode?.text ??
    session.currentNode?.title ??
    session.journeySummary[0]?.text ??
    session.journeySummary[0]?.title ??
    missionDescription ??
    "Aguardando a proxima etapa da jornada."
  );
}

function syncMissionResult(result: MissionSessionState): GameplayViewState {
  if (hasRenderableCombat(result)) {
    return {
      screen: "combat",
      combat: result.combatSession!,
      missionSessionId: result.sessionId
    };
  }

  if (result.status === "COMPLETED" || result.currentNode?.type === "COMPLETE") {
    return { screen: "mission-complete", session: result };
  }

  return { screen: "mission-node", session: result };
}

function syncCombatResult(result: CombatTurnResult): GameplayViewState {
  if (result.outcome === "IN_PROGRESS") {
    return {
      screen: "combat",
      combat: result.combatSession,
      missionSessionId: result.mission?.sessionId ?? result.combatSession.missionSessionId ?? undefined
    };
  }

  if (result.mission) {
    return syncMissionResult(result.mission);
  }

  return { screen: "hub" };
}

function formatCombatLogEntry(entry: GameplayCombatRound, enemyName: string) {
  const actor =
    entry.actor === "character"
      ? "Voce"
      : entry.actor === "monster"
        ? enemyName
        : entry.attacker ?? "Atacante";
  const target =
    entry.actor === "character" ? enemyName : entry.defender ?? "voce";
  const damage = entry.damage ?? 0;
  const round = entry.round ?? 0;
  const enemyHealth = entry.remainingEnemyHealth ?? entry.enemyHealth;
  const characterHealth = entry.remainingCharacterHealth ?? entry.characterHealth;

  return {
    title: `Turno ${round || "?"} - ${actor}`,
    description: `${actor} usou ${entry.action ?? "ATTACK"} e causou ${damage} em ${target}. HP ${characterHealth ?? "-"} / Inimigo ${enemyHealth ?? "-"}`,
    critical: entry.critical === true
  };
}

function NpcMissionDialog({
  npc,
  open,
  onOpenChange,
  activeSessions,
  onStartMission,
  onTurnInMission,
  pending
}: {
  npc: GameplayEntity | null;
  open: boolean;
  onOpenChange: (value: boolean) => void;
  activeSessions: MissionSessionState[];
  onStartMission: (missionId: string, npcId: string) => void;
  onTurnInMission: (sessionId: string, npcId: string) => void;
  pending: boolean;
}) {
  if (!npc) return null;

  const startableMissions = npc.startingMissions?.filter((mission) => mission.isActive !== false) ?? [];
  const turnInSessions = activeSessions.filter((session) => resolveTargetNpcId(session) === npc.id);
  const blockedMissionIds = new Set(activeSessions.map((session) => session.mission.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{npc.name}</DialogTitle>
          <DialogDescription>
            {npc.dialogue ?? npc.description ?? "Escolha uma acao disponivel com este NPC."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-primary">Missoes disponiveis</p>
            {startableMissions.length ? (
              <div className="grid gap-3">
                {startableMissions.map((mission) => (
                  <div key={mission.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="font-semibold">{mission.title}</p>
                    {blockedMissionIds.has(mission.id) ? (
                      <p className="mt-2 text-sm text-muted-foreground">
                        Esta missao ja esta em andamento para este personagem.
                      </p>
                    ) : null}
                    <Button
                      className="mt-3"
                      disabled={pending || blockedMissionIds.has(mission.id)}
                      onClick={() => onStartMission(mission.id, npc.id)}
                    >
                      Iniciar missao
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Este NPC nao tem novas missoes para iniciar.</p>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-primary">Entregas e progresso</p>
            {turnInSessions.length ? (
              <div className="grid gap-3">
                {turnInSessions.map((session) => {
                  const canTurnIn =
                    session.status === "READY_TO_TURN_IN" ||
                    session.currentNode?.type === "RETURN_TO_NPC" ||
                    session.currentNode?.type === "COMPLETE";

                  return (
                    <div key={session.sessionId} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{session.mission.name}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {session.currentNode?.text ??
                              session.currentNode?.title ??
                              "A sessao esta aguardando retorno ao NPC."}
                          </p>
                        </div>
                        <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${statusTone(session.status)}`}>
                          {statusLabel(session.status)}
                        </span>
                      </div>
                      <Button
                        className="mt-3"
                        disabled={pending || !canTurnIn}
                        variant={canTurnIn ? "default" : "outline"}
                        onClick={() => onTurnInMission(session.sessionId, npc.id)}
                      >
                        {canTurnIn ? "Entregar missao" : "Falar sobre a missao"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma sessao desta jornada depende deste NPC agora.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MissionNodePanel({
  session,
  pending,
  npcName,
  onContinue,
  onChoose,
  onComplete,
  onAbandon,
  onOpenTargetNpc,
  onOpenCombat
}: {
  session: MissionSessionState;
  pending: boolean;
  npcName?: string;
  onContinue: (sessionId: string) => void;
  onChoose: (sessionId: string, choiceId: string) => void;
  onComplete: (sessionId: string) => void;
  onAbandon: (sessionId: string) => void;
  onOpenTargetNpc: (npcId?: string) => void;
  onOpenCombat: (session: MissionSessionState) => void;
}) {
  const currentNode = session.currentNode;

  return (
    <Card className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <CardTitle className="text-xl">{session.mission.name}</CardTitle>
          <CardDescription className="mt-2">
            {resolveSessionHeadline(session)}
          </CardDescription>
        </div>
        <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${statusTone(session.status)}`}>
          {statusLabel(session.status)}
        </span>
      </div>

      {currentNode?.text ? (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-muted-foreground">
          {currentNode.text}
        </div>
      ) : null}

      {currentNode?.type === "DIALOGUE" ? (
        <Button disabled={pending} onClick={() => onContinue(session.sessionId)}>
          Continuar
        </Button>
      ) : null}

      {currentNode?.type === "CHOICE" && currentNode.choices.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {currentNode.choices.map((choice) => (
            <button
              key={choice.id}
              type="button"
              disabled={pending}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-primary/40 hover:bg-white/10 disabled:opacity-50"
              onClick={() => onChoose(session.sessionId, choice.id)}
            >
              <p className="font-semibold">{choice.label}</p>
              {choice.description ? (
                <p className="mt-2 text-sm text-muted-foreground">{choice.description}</p>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}

      {currentNode?.type === "COMBAT" ? (
        <div className="space-y-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-rose-100">
            <Swords className="h-4 w-4" />
            Combate liberado pelo backend
          </p>
          {hasRenderableCombat(session) ? (
            <>
              <p className="text-sm text-rose-100">
                {session.combatSession!.enemy.name} - HP {session.combatSession!.enemy.currentHealth}/
                {session.combatSession!.enemy.maxHealth}
              </p>
              <Button disabled={pending} onClick={() => onOpenCombat(session)}>
                Ir para combate
              </Button>
            </>
          ) : (
            <p className="text-sm text-rose-100">
              A jornada entrou em combate, mas a sessao de combate ainda nao veio completa do backend.
            </p>
          )}
        </div>
      ) : null}

      {currentNode?.type === "RETURN_TO_NPC" ? (
        <div className="space-y-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">
          <p>
            Retorne para <span className="font-semibold">{npcName ?? "o NPC correto"}</span> para entregar a missao.
          </p>
          <Button
            disabled={pending}
            variant="secondary"
            onClick={() => onOpenTargetNpc(currentNode.npcId ?? resolveTargetNpcId(session))}
          >
            Falar com NPC
          </Button>
        </div>
      ) : null}

      {currentNode?.type === "COMPLETE" ? (
        <Button disabled={pending} onClick={() => onComplete(session.sessionId)}>
          Finalizar missao
        </Button>
      ) : null}

      {session.status === "IN_PROGRESS" ? (
        <Button disabled={pending} variant="outline" onClick={() => onAbandon(session.sessionId)}>
          Abandonar missao
        </Button>
      ) : null}
    </Card>
  );
}

function CombatPanel({
  combat,
  pending,
  onAction
}: {
  combat: CombatSessionState;
  pending: boolean;
  onAction: (combatSessionId: string, action: CombatSessionAction) => void;
}) {
  return (
    <Card className="space-y-4 border-rose-500/20 bg-rose-500/10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
            <Swords className="h-4 w-4 text-rose-200" />
            Combate em andamento
          </p>
          <p className="mt-2 text-lg font-semibold">
            {combat.enemy.name} - Lv. {combat.enemy.level}
          </p>
          <p className="mt-1 text-sm text-rose-100">
            Inimigo: {combat.enemy.currentHealth}/{combat.enemy.maxHealth} HP
          </p>
          <p className="mt-1 text-sm text-rose-100">
            Voce: {combat.character.currentHealth}/{combat.character.maxHealth} HP
          </p>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] font-semibold text-rose-50">
          Turno {combat.turnNumber}
        </span>
      </div>

      {combat.character.stats ? (
        <div className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm md:grid-cols-2 xl:grid-cols-5">
          <div>Ataque {combat.character.stats.attack}</div>
          <div>Defesa {combat.character.stats.defense}</div>
          <div>HP max {combat.character.stats.maxHealth}</div>
          <div>Crit {combat.character.stats.critChance}</div>
          <div>Crit % {combat.character.stats.critChancePercent}</div>
        </div>
      ) : null}

      {combat.battleLog.length ? (
        <div className="max-h-80 space-y-2 overflow-y-auto pr-1 text-sm text-rose-50/90">
          {combat.battleLog.map((entry, index) => {
            const item = formatCombatLogEntry(entry, combat.enemy.name);
            return (
              <div key={`${combat.id}-${index}`} className="rounded-xl border border-white/10 bg-black/20 px-3 py-3">
                <p className="font-semibold text-foreground">
                  {item.title} {item.critical ? "CRITICO" : ""}
                </p>
                <p className="mt-1">{item.description}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-rose-50/90">
          Nenhum turno registrado ainda. Escolha uma acao para iniciar o combate.
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {combat.actions.map((action) => (
          <Button
            key={action}
            disabled={pending || combat.status !== "IN_PROGRESS"}
            onClick={() => onAction(combat.id, action)}
          >
            {actionLabel(action)}
          </Button>
        ))}
      </div>
    </Card>
  );
}

function MissionCompletePanel({
  session,
  onBack
}: {
  session: MissionSessionState;
  onBack: () => void;
}) {
  return (
    <Card className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-primary">Missao concluida</p>
        <CardTitle className="mt-2 text-2xl">{session.mission.name}</CardTitle>
        <CardDescription className="mt-2">
          {session.currentNode?.text ?? session.currentNode?.title ?? "A jornada foi encerrada com sucesso."}
        </CardDescription>
      </div>

      {session.completion?.rewards ? (
        <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4 text-sm text-sky-100">
          Recompensas: XP {session.completion.rewards.xp} - Coins {session.completion.rewards.coins}
        </div>
      ) : null}

      <Button onClick={onBack}>Voltar para o hub</Button>
    </Card>
  );
}

export function MissionJourneyCenter() {
  const activeCharacter = useActiveCharacter();
  const [selectedNpc, setSelectedNpc] = useState<GameplayEntity | null>(null);
  const [viewState, setViewState] = useState<GameplayViewState>({ screen: "hub" });
  const [selectedSessionId, setSelectedSessionId] = useState("");

  const npcsQuery = useGameplayList("npcs");
  const sessionsQuery = useMissionSessions(activeCharacter?.id ?? "");
  const selectedSessionQuery = useMissionSession(activeCharacter?.id ?? "", selectedSessionId);
  const startMission = useStartMissionJourney(activeCharacter?.id ?? "");
  const progressMission = useProgressMissionJourney(activeCharacter?.id ?? "");
  const abandonMission = useAbandonMissionJourney(activeCharacter?.id ?? "");
  const combatTurn = useCombatTurn(activeCharacter?.id ?? "");

  const missionNpcs = useMemo(
    () =>
      (npcsQuery.data ?? []).filter(
        (npc) => (npc.startingMissions?.length ?? 0) > 0 || (npc.completionMissions?.length ?? 0) > 0
      ),
    [npcsQuery.data]
  );

  const activeSessions = useMemo(
    () =>
      (sessionsQuery.data ?? []).filter(
        (session) => session.status === "IN_PROGRESS" || session.status === "READY_TO_TURN_IN"
      ),
    [sessionsQuery.data]
  );

  const npcMap = useMemo(
    () => Object.fromEntries((npcsQuery.data ?? []).map((npc) => [npc.id, npc])),
    [npcsQuery.data]
  );

  const isPending =
    startMission.isPending ||
    progressMission.isPending ||
    abandonMission.isPending ||
    combatTurn.isPending;

  useEffect(() => {
    if (!selectedSessionQuery.data) return;

    setViewState(syncMissionResult(selectedSessionQuery.data));
    setSelectedSessionId("");
  }, [selectedSessionQuery.data]);

  useEffect(() => {
    setViewState((current) => {
      if (!activeSessions.length) {
        return current.screen === "hub" ? current : { screen: "hub" };
      }

      if (current.screen === "hub") {
        const combatSession = activeSessions.find((session) => session.combatSession?.status === "IN_PROGRESS");
        return combatSession?.combatSession ? syncMissionResult(combatSession) : current;
      }

      if (current.screen === "combat" && current.missionSessionId) {
        const updatedSession = activeSessions.find((session) => session.sessionId === current.missionSessionId);
        if (!updatedSession) return current;

        if (updatedSession.combatSession?.id === current.combat.id) {
          return current;
        }

        return syncMissionResult(updatedSession);
      }

      if (current.screen === "mission-node" || current.screen === "mission-complete") {
        const updatedSession = sessionsQuery.data?.find((session) => session.sessionId === current.session.sessionId);
        if (!updatedSession) return current;

        const nextViewState = syncMissionResult(updatedSession);
        if (nextViewState.screen === current.screen) {
          if (nextViewState.screen === "mission-node" || nextViewState.screen === "mission-complete") {
            if (
              nextViewState.session.sessionId === current.session.sessionId &&
              nextViewState.session.updatedAt === current.session.updatedAt
            ) {
              return current;
            }
          }
        }

        return nextViewState;
      }

      return current;
    });
  }, [activeSessions, sessionsQuery.data]);

  if (!activeCharacter?.id) {
    return (
      <EmptyState
        title="Nenhum personagem ativo"
        description="Ative um personagem antes de iniciar uma jornada de missao."
      />
    );
  }

  if (npcsQuery.isLoading || sessionsQuery.isLoading) {
    return <LoadingState label="Carregando NPCs e sessoes de missao..." />;
  }

  if (npcsQuery.isError || sessionsQuery.isError) {
    return (
      <ErrorState
        description={
          (npcsQuery.error as Error)?.message ||
          (sessionsQuery.error as Error)?.message ||
          "Falha ao carregar a jornada de missoes."
        }
        onRetry={() => {
          void npcsQuery.refetch();
          void sessionsQuery.refetch();
        }}
      />
    );
  }

  const currentNpcName =
    viewState.screen === "mission-node" || viewState.screen === "mission-complete"
      ? npcMap[resolveTargetNpcId(viewState.session) ?? ""]?.name
      : undefined;

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-primary">NPCs de missao</p>
          <h3 className="mt-2 text-2xl font-semibold">Jornada guiada pelo backend</h3>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            O front so renderiza o estado atual da jornada. Dialogo, escolha, combate e retorno ao NPC
            passam a seguir exatamente o payload devolvido pela API.
          </p>
        </div>

        {missionNpcs.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {missionNpcs.map((npc) => {
              const availableStarts = npc.startingMissions?.filter((mission) => mission.isActive !== false) ?? [];
              const pendingTurnIns = activeSessions.filter((session) => resolveTargetNpcId(session) === npc.id);

              return (
                <Card key={npc.id} className="space-y-4">
                  <div>
                    <CardTitle>{npc.name}</CardTitle>
                    <CardDescription className="mt-2">
                      {npc.dialogue ?? npc.description ?? "NPC pronto para entregar ou receber tarefas."}
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                    <span>{availableStarts.length} missoes para iniciar</span>
                    <span>{pendingTurnIns.length} interacoes em aberto</span>
                  </div>
                  <Button onClick={() => setSelectedNpc(npc)}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Falar com NPC
                  </Button>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="Nenhum NPC de missao encontrado"
            description="Configure NPCs com missoes iniciais ou de conclusao para usar este fluxo."
          />
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary">Sessoes ativas</p>
            <h3 className="mt-2 text-2xl font-semibold">Acompanhe a jornada em andamento</h3>
          </div>
          {viewState.screen !== "hub" ? (
            <Button variant="outline" onClick={() => setViewState({ screen: "hub" })}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao hub
            </Button>
          ) : null}
        </div>

        {activeSessions.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {activeSessions.map((session) => {
              const hasCombat =
                hasRenderableCombat(session) || session.currentNode?.type === "COMBAT";
              return (
                <Card key={session.sessionId} className="space-y-4">
                    <div>
                      <CardTitle>{session.mission.name}</CardTitle>
                      <CardDescription className="mt-2">
                      {resolveSessionDescription(session)}
                      </CardDescription>
                    </div>
                  <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold ${statusTone(session.status)}`}>
                    {statusLabel(session.status)}
                  </span>
                  <Button
                    disabled={isPending || selectedSessionQuery.isFetching}
                    onClick={() => {
                      if (hasCombat && !hasRenderableCombat(session)) {
                        setSelectedSessionId(session.sessionId);
                        return;
                      }

                      setViewState(syncMissionResult(session));
                    }}
                  >
                    {hasCombat ? "Retomar combate" : "Continuar jornada"}
                  </Button>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="Nenhuma missao em andamento"
            description="Fale com um NPC de missao para iniciar uma jornada."
          />
        )}
      </div>

      {viewState.screen === "mission-node" ? (
        <MissionNodePanel
          session={viewState.session}
          pending={isPending}
          npcName={currentNpcName}
          onContinue={(sessionId) =>
            progressMission.mutate(
              { sessionId },
              {
                onSuccess: (result) => setViewState(syncMissionResult(result))
              }
            )
          }
          onChoose={(sessionId, choiceId) =>
            progressMission.mutate(
              { sessionId, choiceId },
              {
                onSuccess: (result) => setViewState(syncMissionResult(result))
              }
            )
          }
          onComplete={(sessionId) =>
            progressMission.mutate(
              { sessionId },
              {
                onSuccess: (result) => setViewState(syncMissionResult(result))
              }
            )
          }
          onAbandon={(sessionId) =>
            abandonMission.mutate(
              { sessionId },
              {
                onSuccess: () => setViewState({ screen: "hub" })
              }
            )
          }
          onOpenTargetNpc={(npcId) => setSelectedNpc(npcId ? npcMap[npcId] ?? null : null)}
          onOpenCombat={(session) => {
            if (session.combatSession) {
              setViewState({
                screen: "combat",
                combat: session.combatSession,
                missionSessionId: session.sessionId
              });
            }
          }}
        />
      ) : null}

      {viewState.screen === "combat" ? (
        <CombatPanel
          combat={viewState.combat}
          pending={isPending}
          onAction={(combatSessionId, action) =>
            combatTurn.mutate(
              { combatSessionId, action },
              {
                onSuccess: (result) => setViewState(syncCombatResult(result))
              }
            )
          }
        />
      ) : null}

      {viewState.screen === "mission-complete" ? (
        <MissionCompletePanel
          session={viewState.session}
          onBack={() => setViewState({ screen: "hub" })}
        />
      ) : null}

      {selectedNpc ? (
        <NpcMissionDialog
          npc={selectedNpc}
          open={Boolean(selectedNpc)}
          onOpenChange={(open) => !open && setSelectedNpc(null)}
          activeSessions={activeSessions}
          pending={isPending}
          onStartMission={(missionId, npcId) =>
            startMission.mutate(
              { missionId, npcId },
              {
                onSuccess: (result) => {
                  setSelectedNpc(null);
                  setViewState(syncMissionResult(result));
                }
              }
            )
          }
          onTurnInMission={(sessionId, npcId) =>
            progressMission.mutate(
              { sessionId, npcId },
              {
                onSuccess: (result) => {
                  setSelectedNpc(null);
                  setViewState(syncMissionResult(result));
                }
              }
            )
          }
        />
      ) : null}
    </div>
  );
}
