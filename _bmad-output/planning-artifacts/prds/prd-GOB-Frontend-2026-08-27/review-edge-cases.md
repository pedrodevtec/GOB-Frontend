```json
[
  {
    "location": "prd.md:93-99",
    "trigger_condition": "Convite expira ou é revogado antes da abertura da landing",
    "guard_snippet": "if (!invite.active) return showInviteUnavailable();",
    "potential_consequence": "Participante entra por convite inválido ou recebe estado ambíguo"
  },
  {
    "location": "prd.md:101-108",
    "trigger_condition": "Link de confirmação expirou ou já foi consumido",
    "guard_snippet": "if (confirmation.expired || confirmation.used) return offerResend();",
    "potential_consequence": "Participante fica preso sem caminho claro de recuperação"
  },
  {
    "location": "prd.md:101-108",
    "trigger_condition": "Reenvios de confirmação atingem limite do provedor",
    "guard_snippet": "if (resend.rateLimited) return showRetryAfter(resend.retryAfter);",
    "potential_consequence": "Cliques repetidos parecem falhar silenciosamente ou agravam bloqueio"
  },
  {
    "location": "prd.md:110-116",
    "trigger_condition": "Consentimento vigente muda após aceite de versão anterior",
    "guard_snippet": "if (acceptedVersion !== currentVersion) return requireConsentAgain();",
    "potential_consequence": "Participante avança sem aceitar os termos atualmente vigentes"
  },
  {
    "location": "prd.md:110-116",
    "trigger_condition": "Participante recusa ou revoga o Consentimento",
    "guard_snippet": "if (!consent.granted) return exitPilotAndRestrictData();",
    "potential_consequence": "Jornada continua sem base de consentimento válida"
  },
  {
    "location": "prd.md:118-124",
    "trigger_condition": "Membership muda entre carregamento da etapa e ação protegida",
    "guard_snippet": "if (!freshMembership.active) return reconcileJourney();",
    "potential_consequence": "Ação usa autorização obsoleta após remoção ou encerramento"
  },
  {
    "location": "prd.md:138-144",
    "trigger_condition": "Backend retorna estado funcional desconhecido pelo frontend",
    "guard_snippet": "default: return showRecoverableUnsupportedState();",
    "potential_consequence": "Rota trava, entra em loop ou libera etapa indevida"
  },
  {
    "location": "prd.md:138-144",
    "trigger_condition": "Backend retorna nextRoute externo, malformado ou incompatível com estado",
    "guard_snippet": "if (!isAllowedRoute(nextRoute, state)) return showRecoverableBlock();",
    "potential_consequence": "Redirecionamento inseguro ou avanço para etapa não autorizada"
  },
  {
    "location": "prd.md:166-172",
    "trigger_condition": "Bloco narrativo contém somente espaços ou caracteres invisíveis",
    "guard_snippet": "if (!text.trim()) return markBlockEmpty();",
    "potential_consequence": "Narrativa vazia é tratada como resposta válida"
  },
  {
    "location": "prd.md:166-172",
    "trigger_condition": "Texto narrativo excede limite aceito pelo backend",
    "guard_snippet": "if (text.length > config.maxLength) return showLengthError();",
    "potential_consequence": "Salvamento falha tardiamente ou payload degrada a interface"
  },
  {
    "location": "prd.md:182-188",
    "trigger_condition": "Versão antiga do Builder existe, mas seu catálogo foi retirado",
    "guard_snippet": "if (!catalogFor(character.builderConfigVersion)) return offerSupportedRecovery();",
    "potential_consequence": "Rascunho torna-se permanentemente impossível de concluir"
  },
  {
    "location": "prd.md:190-196",
    "trigger_condition": "Atributo recebido é fracionário, NaN ou numérico como texto",
    "guard_snippet": "if (!values.every(Number.isInteger)) return rejectAttributes();",
    "potential_consequence": "Soma aparente passa apesar de valores mecânicos inválidos"
  },
  {
    "location": "prd.md:198-205",
    "trigger_condition": "Respostas de salvamentos concorrentes chegam fora de ordem",
    "guard_snippet": "if (response.revision < currentRevision) return ignoreResponse();",
    "potential_consequence": "Resposta antiga sobrescreve conteúdo mais recente"
  },
  {
    "location": "prd.md:198-205",
    "trigger_condition": "Backend persiste PATCH, mas a resposta se perde",
    "guard_snippet": "if (outcome.unknown) return refetchBeforeRetry();",
    "potential_consequence": "Retentativa reaplica mudança ou mostra progresso incorreto"
  },
  {
    "location": "prd.md:198-205",
    "trigger_condition": "Participante navega ou fecha a página durante salvamento",
    "guard_snippet": "if (save.pending) return confirmExitOrAwaitSave();",
    "potential_consequence": "Edição recente desaparece sem aviso"
  },
  {
    "location": "prd.md:198-205",
    "trigger_condition": "Submissão começa enquanto existe salvamento ainda pendente",
    "guard_snippet": "if (save.pending) return awaitSaveBeforeSubmit();",
    "potential_consequence": "Snapshot omite alterações visíveis ao Participante"
  },
  {
    "location": "prd.md:198-205",
    "trigger_condition": "Falha comum de salvamento ocorre após edição local",
    "guard_snippet": "if (save.failed) preserveLocalDraftAndOfferRetry();",
    "potential_consequence": "Conteúdo local pode desaparecer durante recuperação"
  },
  {
    "location": "prd.md:219-226",
    "trigger_condition": "Participante altera o campo enquanto a IA ainda responde",
    "guard_snippet": "if (request.inputHash !== currentInputHash) return markSuggestionStale();",
    "potential_consequence": "Sugestão obsoleta substitui intenção mais recente"
  },
  {
    "location": "prd.md:219-226",
    "trigger_condition": "Duas solicitações de IA retornam em ordem invertida",
    "guard_snippet": "if (response.requestId !== activeRequestId) return ignoreResponse();",
    "potential_consequence": "Resposta antiga é exibida como proposta atual"
  },
  {
    "location": "prd.md:237-243",
    "trigger_condition": "IA retorna proposta parcial, malformada ou com bloco desconhecido",
    "guard_snippet": "if (!proposalSchema.safeParse(payload).success) return manualFallback();",
    "potential_consequence": "Confirmação fica impossível ou aplica mecânica inconsistente"
  },
  {
    "location": "prd.md:228-235",
    "trigger_condition": "Aplicação da mesma sugestão é acionada repetidamente",
    "guard_snippet": "if (suggestion.applied) return noOp();",
    "potential_consequence": "Valores ou registros de decisão são duplicados"
  },
  {
    "location": "prd.md:245-251",
    "trigger_condition": "Persistência da telemetria falha após decisão de IA",
    "guard_snippet": "if (telemetry.failed) queueMetadataOnlyRetry();",
    "potential_consequence": "Auditoria e custos ficam incompletos ou bloqueiam indevidamente a jornada"
  },
  {
    "location": "prd.md:274-290",
    "trigger_condition": "Aprovação e pedido de ajustes ocorrem simultaneamente",
    "guard_snippet": "if (expectedRevision !== currentRevision) return rejectReviewDecision();",
    "potential_consequence": "Decisões contraditórias são persistidas para o mesmo Snapshot"
  },
  {
    "location": "prd.md:266-290",
    "trigger_condition": "Permissão do revisor é revogada após abrir o Snapshot",
    "guard_snippet": "if (!freshAuthorization.canReview) return forbidDecision();",
    "potential_consequence": "Revisor desautorizado decide usando sessão ou tela antiga"
  },
  {
    "location": "prd.md:292-298",
    "trigger_condition": "Retentativa envia notificação duplicada ou fora de ordem",
    "guard_snippet": "sendNotificationOnce(characterId, revision, transition);",
    "potential_consequence": "Participante recebe aprovação antiga após pedido de ajustes"
  },
  {
    "location": "prd.md:304-312",
    "trigger_condition": "Versão da Pesquisa muda depois da primeira resposta",
    "guard_snippet": "if (answer.version !== survey.version) return requestVersionedUpdate();",
    "potential_consequence": "Resposta antiga é reinterpretada pelo questionário novo"
  },
  {
    "location": "prd.md:304-312",
    "trigger_condition": "Duas atualizações da Pesquisa ocorrem simultaneamente",
    "guard_snippet": "updateSurvey({ expectedRevision, answers });",
    "potential_consequence": "Última gravação apaga respostas concorrentes sem aviso"
  },
  {
    "location": "prd.md:304-312",
    "trigger_condition": "Campanha encerra enquanto atualização da Pesquisa está em trânsito",
    "guard_snippet": "if (!freshCampaign.active) return showReadOnlySurvey();",
    "potential_consequence": "Resposta é aceita depois do limite ou perdida ambiguamente"
  },
  {
    "location": "prd.md:322-333",
    "trigger_condition": "Duas gerações da mesma variante são solicitadas simultaneamente",
    "guard_snippet": "generateOnce(characterId, variant, idempotencyKey);",
    "potential_consequence": "Limite e custo são consumidos duas vezes"
  },
  {
    "location": "prd.md:322-333",
    "trigger_condition": "Refresh ocorre enquanto geração visual permanece pendente",
    "guard_snippet": "if (artifact.pending) return resumeGenerationStatus(artifact.id);",
    "potential_consequence": "Participante reinicia geração ou perde acesso ao resultado"
  },
  {
    "location": "prd.md:322-333",
    "trigger_condition": "Personagem muda enquanto artefato visual está sendo gerado",
    "guard_snippet": "bindArtifactToSnapshot(characterId, sourceRevision);",
    "potential_consequence": "Imagem não corresponde à revisão exibida"
  },
  {
    "location": "prd.md:322-333",
    "trigger_condition": "Referência de pessoa real é enviada sem prova de consentimento",
    "guard_snippet": "if (!rightsAttested) return refuseRealPersonReference();",
    "potential_consequence": "Conteúdo é gerado sem direitos verificáveis"
  },
  {
    "location": "prd.md:335-342",
    "trigger_condition": "Arquivo ou URL de download expirou antes do clique",
    "guard_snippet": "if (download.expired) return refreshDownloadUrl();",
    "potential_consequence": "Download falha sem recuperação apesar de artefato existente"
  },
  {
    "location": "prd.md:335-342",
    "trigger_condition": "Ficha muda durante a geração do PDF",
    "guard_snippet": "renderPdfFromSnapshot(characterId, sourceRevision);",
    "potential_consequence": "Páginas combinam dados de revisões diferentes"
  },
  {
    "location": "prd.md:344-354",
    "trigger_condition": "Personagem publicado volta para estado de ajustes",
    "guard_snippet": "if (!character.currentRevisionApproved) unpublishOrFreezeApprovedSnapshot();",
    "potential_consequence": "Perfil continua público sem política explícita para aprovação retirada"
  },
  {
    "location": "prd.md:344-354",
    "trigger_condition": "Personagem, participação ou campanha é removida após publicação",
    "guard_snippet": "if (!publicEligibility.active) return revokePublicProfile();",
    "potential_consequence": "Link público sobrevive à perda do contexto autorizado"
  },
  {
    "location": "prd.md:344-354",
    "trigger_condition": "Publicação e revogação são solicitadas simultaneamente",
    "guard_snippet": "mutatePublication({ expectedVersion, desiredState });",
    "potential_consequence": "Estado final do link contradiz a escolha mais recente"
  },
  {
    "location": "prd.md:344-354",
    "trigger_condition": "Identificador de Perfil Público é previsível ou enumerável",
    "guard_snippet": "publicSlug = generateUnpredictableToken();",
    "potential_consequence": "Perfis não divulgados podem ser descobertos por enumeração"
  },
  {
    "location": "prd.md:356-363",
    "trigger_condition": "Perfil Público é revogado depois que a Story foi preparada",
    "guard_snippet": "if (!profile.published) return disableStoryShare();",
    "potential_consequence": "Story distribuída aponta para destino indisponível ou indevido"
  },
  {
    "location": "prd.md:378-385",
    "trigger_condition": "Participantes mudam enquanto o administrador percorre páginas",
    "guard_snippet": "paginateWithStableCursorAndSort(filters);",
    "potential_consequence": "Registros aparecem duplicados ou são omitidos"
  },
  {
    "location": "prd.md:387-393",
    "trigger_condition": "Adaptação e exclusão do mesmo legado ocorrem simultaneamente",
    "guard_snippet": "mutateLegacy({ expectedRevision, action });",
    "potential_consequence": "Rascunho adaptado referencia Personagem já excluído"
  },
  {
    "location": "prd.md:387-393",
    "trigger_condition": "Auditoria falha durante adaptação ou exclusão",
    "guard_snippet": "transaction(() => mutateLegacyAndWriteAudit());",
    "potential_consequence": "Mudança destrutiva persiste sem trilha obrigatória"
  },
  {
    "location": "prd.md:387-393",
    "trigger_condition": "Legado excluído ainda possui Perfil Público ou artefatos vinculados",
    "guard_snippet": "beforeDeleteLegacyRevokeAndResolveDependents(characterId);",
    "potential_consequence": "Links órfãos continuam expondo dados ou retornam erros inconsistentes"
  },
  {
    "location": "prd.md:395-401",
    "trigger_condition": "Filtro de custos recebe período invertido ou intervalo vazio",
    "guard_snippet": "if (from >= to) return rejectInvalidPeriod();",
    "potential_consequence": "Série e totais ficam vazios ou enganosos"
  },
  {
    "location": "prd.md:395-401",
    "trigger_condition": "Eventos cruzam fuso horário ou mudança de data da taxa",
    "guard_snippet": "aggregateByUtcInstantThenRenderInSelectedTimezone();",
    "potential_consequence": "Chamadas e custos caem no período incorreto"
  },
  {
    "location": "prd.md:395-401",
    "trigger_condition": "Custo contém valor negativo, não finito ou precisão excessiva",
    "guard_snippet": "if (!isValidMoney(cost)) return markUnpriced();",
    "potential_consequence": "Total financeiro torna-se incorreto ou impossível de exibir"
  },
  {
    "location": "prd.md:472-475",
    "trigger_condition": "Analytics repete evento após timeout e retentativa",
    "guard_snippet": "recordEventOnce(eventId);",
    "potential_consequence": "Funil, decisões e custos ficam supercontados"
  },
  {
    "location": "addendum.md:23-24",
    "trigger_condition": "Estado conhecido chega com combinação contraditória de nextRoute",
    "guard_snippet": "if (!routeAllowedForState(state, nextRoute)) return BLOCKED;",
    "potential_consequence": "UI segue rota incompatível apesar do estado persistido"
  },
  {
    "location": "addendum.md:30-31",
    "trigger_condition": "Logout local ocorre com token backend ainda válido",
    "guard_snippet": "await revokeSession(); clearLocalSession();",
    "potential_consequence": "Token copiado continua autorizando ações após logout"
  },
  {
    "location": "addendum.md:30-33",
    "trigger_condition": "Papel ou sessão é revogado enquanto tela protegida permanece aberta",
    "guard_snippet": "if (api.status === 401 || api.status === 403) reconcileAuth();",
    "potential_consequence": "Interface mantém dados e ações obsoletamente disponíveis"
  },
  {
    "location": "addendum.md:30-31",
    "trigger_condition": "localStorage ou cookie está indisponível, corrompido ou excede cota",
    "guard_snippet": "if (!sessionStorageHealthy()) return recoverableSignIn();",
    "potential_consequence": "Sessão entra em loop ou falha sem recuperação"
  },
  {
    "location": "prd.md:519-532",
    "trigger_condition": "Métrica percentual é calculada com denominador zero",
    "guard_snippet": "if (eligibleCount === 0) return metricNotApplicable();",
    "potential_consequence": "Resultado aparece como sucesso, falha ou NaN enganoso"
  },
  {
    "location": "prd.md:521-521",
    "trigger_condition": "Participante pausa e retoma durante medição de tempo",
    "guard_snippet": "measureActiveTaskTimeExcludingDefinedPauses();",
    "potential_consequence": "Tempo de criação mistura trabalho ativo e abandono"
  }
]
```
