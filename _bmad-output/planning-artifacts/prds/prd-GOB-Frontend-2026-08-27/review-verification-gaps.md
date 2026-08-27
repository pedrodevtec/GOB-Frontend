# Review — Verification Gaps

## Base de evidência

- O frontend não declara runner, script de teste ou dependência de teste da aplicação; o caminho normal exposto em `package.json:5-11` contém apenas `dev`, `build`, `start`, `lint`, `typecheck` e geração de tipos.
- A busca por arquivos `*test*`, `*spec*`, `*e2e*` e configurações de Jest, Vitest e Playwright em todo o repositório encontrou somente testes das ferramentas BMAD, não testes que importem ou exercitem `app/`, `features/`, `lib/`, `middleware.ts` ou `stores/`.
- A matriz integrada diz que um cenário só passa após observar HTTP, estado persistido, rota final e evidência visual (`docs/pilot-e2e-matrix.md:1-3,31-33`), mas todas as dez linhas registradas permanecem `NÃO EXECUTADO` (`docs/pilot-e2e-matrix.md:18-29`). O status brownfield confirma que o E2E real não foi executado e não pode ser chamado de validado em produção (`docs/playtest-status-2026-08-14.md:138-155`).
- O checklist alternativo é explicitamente manual e “sem criar testes automatizados” (`docs/mvp-pilot-manual-checklist.md:1-3`); seus itens estão desmarcados. Portanto, ele define verificações úteis, mas não falharia no caminho normal se o comportamento regredisse.

## Findings

### VG-1 — Retorno de autenticação e jornada governada por `resume` não têm guarda executável

- **location:** FR-2, FR-4, FR-6 e FR-7 em `prd.md:105-152`; implementação em `lib/routing/auth-redirects.ts:20-64`, `middleware.ts:16-47`, `features/mvp/components/journey-route-guard.tsx:14-64` e `features/mvp/hooks/use-mvp.ts:309-353`.
- **trigger_condition:** Uma alteração passa a aceitar um `returnTo` externo, perde query string, redireciona uma etapa incompatível para uma rota diferente de `nextRoute`, deixa `BLOCKED`/ausência de `nextRoute` em loop, ou cria um segundo Rascunho após falha de navegação.
- **guard_snippet:** Executar E2E-P01, E2E-P02, E2E-S01 e E2E-S02 com asserções de destino interno, mesmo `Character.id`/revisão/`builderConfigVersion`, um único membership/Rascunho persistido, `nextRoute` exato e estado recuperável sem loop quando a rota não vier.
- **potential_consequence:** O Participante pode ser redirecionado para fora da aplicação, perder a campanha de origem, ficar preso em `GuardianPageLoader` ou duplicar participação/Personagem; lint, typecheck e build continuariam verdes.
- **gap_shape:** `regression-gap`
- **consumer:** O middleware e as páginas protegidas por `JourneyRouteGuard`, incluindo consentimento, contexto, Builder, revisão, pesquisa e conclusão em `app/(public)/campanhas/[slug]/**`; o início do Rascunho é consumido por `features/mvp/components/episode-context-panel.tsx:24`.
- **evidence:** A busca global por `isSafeReturnPath`, `safeReturnPath`, `authPathWithReturnTo`, `JourneyRouteGuard`, `useCampaignResume`, `journeyState` e `nextRoute` encontrou somente código de produção e documentação, nenhum teste. A matriz pede redirecionamento por `nextRoute`, refresh/login e idempotência (`docs/pilot-e2e-matrix.md:20-21,37-40`), mas marca esses cenários como não executados. O próprio documento de jornadas registra `LEGACY_REVIEW` e `BLOCKED` como decisões ainda abertas (`reconcile-user-journeys.md:210-211`).

### VG-2 — Configuração versionada, validação e PATCH parcial do Builder podem divergir sem falha de verificação

- **location:** FR-9 a FR-14 em `prd.md:166-213` e invariantes do addendum em `addendum.md:14-19`; implementação em `features/mvp/builder/character-builder-schema.ts:182-224,252-358,392-492`, `features/mvp/hooks/use-mvp.ts:112-117` e `features/mvp/components/character-builder-form.tsx:417-425,573-609`.
- **trigger_condition:** O Builder busca a configuração ativa para um Personagem existente, deixa de omitir string vazia/bloco mecânico inválido no PATCH, aceita total diferente de 12 ou Vigor/Espírito ambos zero, exige respostas do Episódio 1 no fluxo novo, ou não mantém a confirmação dos três blocos ao retomar.
- **guard_snippet:** Para um Personagem ligado a versão antiga, afirmar a URL da configuração por `builderConfigVersion`, serializar cada capítulo e comparar o payload parcial exato (ausências incluídas), depois exercer submissão inválida/válida para total, limites, núcleo Vigor/Espírito, quantidade de Treinamentos e ausência das perguntas do Episódio 1.
- **potential_consequence:** Um PATCH pode apagar conteúdo já persistido, um Personagem pode migrar silenciosamente de regra, ou uma Ficha mecanicamente inválida pode ser enviada sem que qualquer verificação do frontend falhe.
- **gap_shape:** `regression-gap`
- **consumer:** O formulário em `features/mvp/components/character-builder-form.tsx:425,587` e a revisão/submissão em `features/mvp/components/character-review-submit-panel.tsx:96-105`, ambos dependentes de `formStateFromCharacter`, `serializeCharacterPayload` e `validateBuilderForm`.
- **evidence:** A busca global pelos três helpers e por `getBuilderConfig` encontrou apenas esses consumidores de produção, nenhum teste. E2E-P02 e E2E-P05 especificam versão preservada e todas as validações mecânicas (`reconcile-user-journeys.md:188,191`), porém a matriz executável atual não contém resultado passado; `docs/playtest-status-2026-08-14.md:142-145` lista retomada, IA e criação manual entre os E2E pendentes.

### VG-3 — A fronteira de decisão humana da IA e o fallback manual não são observados por teste

- **location:** FR-15 a FR-18 em `prd.md:219-251`; implementação em `features/mvp/components/character-builder-form.tsx:493-571,573-609,658-783`, hooks em `features/mvp/hooks/use-mvp.ts:170-229` e eventos em `features/mvp/components/analytics-event.tsx:7-32`.
- **trigger_condition:** Uma sugestão passa a alterar/salvar o Rascunho ao ser gerada, um bloco aplicado escapa antes da confirmação, descarte/edição deixa de ser registrado, falha/timeout bloqueia o caminho manual, ou metadados passam a incluir narrativa, prompt ou resposta da Pesquisa.
- **guard_snippet:** No cenário com IA, capturar estado/payload antes e depois de gerar, aceitar, editar, desfazer e descartar; afirmar que só a confirmação separada persiste e que os cinco blocos recebem decisão. No cenário de provedor indisponível, concluir e submeter manualmente. Inspecionar cada request de Analytics com uma allowlist de metadados técnicos e ausência explícita de conteúdo criativo/proibido.
- **potential_consequence:** A IA pode se tornar autora de fato, o Participante pode perder o caminho manual ou conteúdo sensível pode ser enviado a Analytics sem que lint/build percebam.
- **gap_shape:** `regression-gap`
- **consumer:** O Builder do Participante em `features/mvp/components/character-builder-form.tsx`, que aplica conteúdo local e registra decisões pela API; o funil consome eventos enviados por `AnalyticsEvent` nas páginas de campanha.
- **evidence:** E2E-P03, E2E-P04 e E2E-S03 são os aceites normativos para persistência, fallback e privacidade (`reconcile-user-journeys.md:189-190`; `addendum.md:40-42`). O cenário com IA está `NÃO EXECUTADO` em `docs/pilot-e2e-matrix.md:22`, e a indisponibilidade é apenas um critério manual em `docs/pilot-e2e-matrix.md:40`. A busca por `AnalyticsEvent`, `decideChapterSuggestion`, `applyFieldSuggestion` e `confirmMechanicalChoices` não encontrou teste da aplicação.

### VG-4 — Snapshot, concorrência e autoridade da revisão só estão descritos, não protegidos

- **location:** FR-19 a FR-23 em `prd.md:257-298`; implementação em `features/mvp/components/character-review-submit-panel.tsx:96-117`, `features/mvp/components/review-queue-panel.tsx:40-127`, `features/mvp/hooks/use-mvp.ts:356-395,469-473` e `features/mvp/services/mvp.service.ts:970-999`.
- **trigger_condition:** Submissão deixa de enviar `expectedRevision`, a fila renderiza o Rascunho atual em vez de `latestSubmission.characterSnapshot`, uma revisão obsoleta cria duplicata, `ADMIN` fora do piloto ou Mestre inativo consegue decidir, o autor revisa a própria Ficha, ou falha de e-mail reverte a transição.
- **guard_snippet:** Com contas separadas e estados persistidos, afirmar snapshot/revisão exatos na fila, `409` sem duplicata para revisão obsoleta/dupla decisão, `401/403` por combinação de papel/campanha/membership/autoria, nova revisão na ressubmissão com Pesquisa preservada e transição mantida quando o provedor de e-mail falha.
- **potential_consequence:** O revisor pode decidir sobre dados mutáveis ou antigos, duplicar snapshots, exercer autoridade fora do escopo ou perder uma transição válida por falha periférica; nenhuma etapa normal do frontend falharia.
- **gap_shape:** `regression-gap`
- **consumer:** O envio do Participante em `character-review-submit-panel.tsx:110-117` e a operação do revisor em `review-queue-panel.tsx:62-64,94-116`.
- **evidence:** E2E-M01, P06, M02, S01, S02 e N01 definem precisamente essas observações (`reconcile-user-journeys.md:192-202`). Os cenários equivalentes estão todos `NÃO EXECUTADO` em `docs/pilot-e2e-matrix.md:24-29`, e o status declara pendentes ajuste, ressubmissão, aprovação e recebimento real dos e-mails (`docs/playtest-status-2026-08-14.md:146-153`). A busca por `submitCharacter`, `getCharacterReviewQueue`, `requestCharacterChanges`, `approveCharacter`, `expectedRevision` e `latestSubmission` encontrou consumidores de produção, sem testes do frontend.

### VG-5 — Pesquisa, conclusão e limites de artefatos não têm verificação que observe estado persistido

- **location:** FR-24 a FR-26 em `prd.md:304-333`; implementação em `features/mvp/components/final-survey-panel.tsx:26-84,118-183`, `features/mvp/components/completion-experience-panel.tsx:43-140` e `features/mvp/hooks/use-mvp.ts:135-167,250-280`.
- **trigger_condition:** “Não usei IA” passa a exigir nota/detalhe, atualização cria uma segunda resposta, conclusão pendente é rotulada como aprovada, ajuste posterior apaga a Pesquisa, ou a UI habilita Retrato/Carta por fallback local divergente do limite retornado pelo backend.
- **guard_snippet:** Salvar e atualizar a mesma Pesquisa antes e depois da aprovação, verificar uma única resposta/versionamento e o estado funcional/label final; pedir ajuste após a conclusão e afirmar Pesquisa preservada + Builder reaberto; para cada variante de arte, afirmar `availability.remaining`, ação explícita, falha não destrutiva e persistência após refresh.
- **potential_consequence:** O Participante pode ver uma aprovação inexistente, duplicar/perder feedback ou gerar arte além do contrato; a jornada ainda compilaria e renderizaria.
- **gap_shape:** `regression-gap`
- **consumer:** `FinalSurveyPanel` salva e navega à conclusão em `final-survey-panel.tsx:63-83`; `CompletionExperiencePanel` deriva status e disponibilidade em `completion-experience-panel.tsx:107-138`.
- **evidence:** E2E-P07, P08 e P09 cobrem esses estados e artefatos em `reconcile-user-journeys.md:195-197`, mas pesquisa/conclusão e downloads permanecem pendentes em `docs/playtest-status-2026-08-14.md:149-153`. A matriz atual marca Pesquisa e conclusão como `NÃO EXECUTADO` (`docs/pilot-e2e-matrix.md:27`) e não há teste que importe os componentes/hooks pesquisados.

### VG-6 — O Perfil Público novo não adotou opt-in, revogação e republicação por revisão

- **location:** FR-28 em `prd.md:344-354` e E2E-P10 exigido em `addendum.md:42`; superfícies atuais em `features/mvp/components/character-builder/my-character-readonly-panel.tsx:181-189`, `features/mvp/components/public-approved-character-panel.tsx:13-35` e `features/mvp/services/mvp.service.ts:719-728`.
- **trigger_condition:** Um Personagem aprovado continua recebendo ação/link público apenas pelo status, sem registrar opt-in, informar o recorte, revogar o link ou exigir nova confirmação após nova revisão.
- **guard_snippet:** Adicionar E2E-P10 com `APPROVED` inicialmente indisponível, publicação somente após confirmação explícita dos campos, snapshot da revisão aprovada, revogação retornando indisponível e invalidação de cache; após nova revisão, exigir novo opt-in.
- **potential_consequence:** Aprovação pode equivaler na prática a publicação e o dono não consegue retirar ou renovar conscientemente o recorte compartilhado.
- **gap_shape:** `missing-adoption-gap`
- **consumer:** A ação de compartilhamento aparece para qualquer `character.sheetStatus === "APPROVED"` em `my-character-readonly-panel.tsx:188`, enquanto a rota pública `/personagens/[characterId]` busca diretamente `/api/v1/characters/public/{id}` por `public-approved-character-panel.tsx:13-17` e `mvp.service.ts:720-727`.
- **evidence:** O PRD fornece sinal explícito de supersessão: aprovação não publica automaticamente e o dono precisa de opt-in/revogação (`prd.md:351-354`). A busca global por `publish`, `revoke`, `opt-in`, `public profile` e equivalentes não encontrou mutação MVP de publicação/revogação; encontrou apenas leitura pública e um perfil legado autenticado. O addendum manda acrescentar E2E-P10, mas `docs/pilot-e2e-matrix.md` termina sem esse cenário (`docs/pilot-e2e-matrix.md:18-29`).

### VG-7 — A allowlist pública pode regredir para exposição da Ficha/feedback sem teste de contrato

- **location:** FR-28 e qualidade de privacidade em `prd.md:348-353,447-452`; implementação em `features/mvp/services/mvp.service.ts:720-727` e `features/mvp/components/public-approved-character-panel.tsx:28-33`, reutilizando `features/mvp/components/character-builder/my-character-readonly-panel.tsx:131-155,201-205`.
- **trigger_condition:** O endpoint público passa a devolver `masterFeedback`, e-mail, IDs, narrativa integral ou outro campo administrativo e o mapper genérico `mapMvpCharacter` o preserva; o renderer canônico então o exibe na página pública.
- **guard_snippet:** Teste de contrato/integração do GET público com fixture contendo deliberadamente campos privados no objeto-fonte; afirmar allowlist exata da resposta consumida pelo browser e ausência de `masterFeedback`, e-mail, IDs internos, Segredo, revisão e payload técnico no DOM/Network.
- **potential_consequence:** Feedback privado ou conteúdo além do recorte aprovado pode chegar ao browser e ser renderizado publicamente — `MyCharacterReadonlyPanel` mostra `character.masterFeedback` quando presente (`my-character-readonly-panel.tsx:201-205`).
- **gap_shape:** `regression-gap`
- **consumer:** A página pública `app/(public)/personagens/[characterId]/page.tsx:10-12`, que entrega o objeto mapeado inteiro ao mesmo renderer usado nas superfícies privadas em `public-approved-character-panel.tsx:32`.
- **evidence:** A busca por `getPublicApprovedCharacter` e `PublicApprovedCharacterPanel` encontrou somente a query e a rota de produção, nenhum teste. A inspeção de Network/Analytics para impedir dados proibidos é apenas uma instrução futura (`addendum.md:40`), e E2E-S03 também está apenas solicitado (`addendum.md:42`).

### VG-8 — Operação, legado e custos podem discordar do estado canônico sem alarme

- **location:** FR-30 a FR-34 em `prd.md:369-409`; implementação em `features/mvp/components/operational-funnel.tsx`, `features/mvp/components/pilot-participants-panel.tsx:32-98,126-177`, `features/mvp/components/admin-ai-usage-panel.tsx` e hooks de operação em `features/mvp/hooks/use-mvp.ts:232-247,287-295`.
- **trigger_condition:** Erro vira contador zero, lista/funil classificam o mesmo Participante em etapas diferentes, paginação/filtro omitem entradas, custo sem preço contamina total, BRL perde marca/data de estimativa, ou adaptação/exclusão de legado não preserva referência/motivo/auditoria.
- **guard_snippet:** Construir o conjunto integrado de contas/estados usado em E2E-A01/A02 e afirmar contagens exatas em cada superfície, erro distinto de zero, filtros/paginação, payload mínimo, preço desconhecido fora do total, BRL com taxa/data, e estado/auditoria após adaptar e excluir.
- **potential_consequence:** O Administrador toma decisão sobre métricas inventadas ou dados inconsistentes, perde Participantes no recorte operacional ou executa uma adaptação/exclusão sem trilha verificável.
- **gap_shape:** `regression-gap`
- **consumer:** O painel administrativo `/admin/piloto`, suas páginas de Participantes, Revisões e Uso/custos, particularmente a classificação local `stageFor` em `pilot-participants-panel.tsx:32-42` e os contadores derivados em `:67-92`.
- **evidence:** E2E-A01/A02 definem reconciliação, custos e legado em `reconcile-user-journeys.md:198-199`; ambos estão `NÃO EXECUTADO` em `docs/pilot-e2e-matrix.md:28-29`. O checklist manual só verifica que contadores não sejam inventados e não haja conteúdo secreto (`docs/mvp-pilot-manual-checklist.md:41-46`), sem resultado marcado ou execução automática. As buscas pelos componentes/hooks de operação não encontraram testes da aplicação.

### VG-9 — A validação declarada do PDF não é reproduzível pelo caminho normal

- **location:** FR-27 em `prd.md:335-342`; gerador em `features/mvp/pdf/character-sheet-pdf.ts:78-168,278-304` e download em `features/mvp/components/character-sheet-download-button.tsx:19-38`.
- **trigger_condition:** Uma alteração passa a incluir comentário/revisão/enums, trunca conteúdo longo, quebra paginação ou produz arquivo inválido; o build continua passando porque não inspeciona bytes, texto ou páginas do PDF.
- **guard_snippet:** Fixture determinística com texto longo, múltiplos equipamentos e campos privados sentinela; gerar o PDF no script normal de verificação, abrir/extrair todas as páginas, afirmar presença do conteúdo essencial e ausência dos sentinelas, enums, revisão e payload interno.
- **potential_consequence:** O download pode vazar conteúdo privado ou entregar uma Ficha truncada/corrompida sem falhar em lint, typecheck ou build.
- **gap_shape:** `broken-verification-gap`
- **consumer:** `CharacterSheetDownloadButton`, reutilizado pela Ficha canônica, chama dinamicamente `buildCharacterSheetPdf` e baixa os bytes em `character-sheet-download-button.tsx:22-32`.
- **evidence:** `docs/playtest-status-2026-08-14.md:121-127` afirma que uma fixture completa foi gerada, inspecionada e extraída, mas a busca global por `buildCharacterSheetPdf`, `character-sheet-pdf`, `PDFDocument` e arquivos de teste encontrou apenas a implementação e o botão; não há fixture, teste ou script reproduzível em `package.json:5-11`. O download com dados reais continua explicitamente pendente (`docs/playtest-status-2026-08-14.md:152-153`).

### VG-10 — Acessibilidade, mobile e fallback de Story não entram em nenhuma verificação executada

- **location:** qualidades transversais em `prd.md:454-468` e FR-29 em `prd.md:356-363`; implementação do compartilhamento em `features/mvp/components/instagram-story-share-button.tsx:49-142,154-225,228-287`.
- **trigger_condition:** Uma mudança quebra teclado/foco/labels, alvo mínimo, zoom 200%, layout a 320 px, reduced motion, safe areas ou o ramo sem `navigator.canShare`; cancelamento nativo passa a exibir erro ou download fallback deixa de acontecer.
- **guard_snippet:** Executar E2E-S04 nas rotas críticas em 320/360/375 px e desktop com teclado, foco no primeiro erro, zoom, reduced motion e verificação de nomes acessíveis; em dispositivo móvel real ou harness equivalente, cobrir `canShare=true`, `canShare=false`, ausência da API e `AbortError`, afirmando prévia e download fallback sem publicação automática.
- **potential_consequence:** O fluxo principal ou o compartilhamento pode ficar inutilizável para teclado/mobile sem que build ou typecheck detectem; o usuário pode não conseguir baixar o Story quando share nativo não aceita arquivos.
- **gap_shape:** `regression-gap`
- **consumer:** As rotas críticas do Participante e Administrador; especificamente `InstagramStoryShareButton`, que escolhe share/download em `instagram-story-share-button.tsx:208-225`.
- **evidence:** O PRD exige dispositivo móvel real e os ramos de cancelamento/ausência de `canShare` (`prd.md:464-468`), e o addendum manda criar E2E-S04 (`addendum.md:42`). A matriz atual não contém E2E-S04 (`docs/pilot-e2e-matrix.md:18-29`); o checklist só traz “Validar em desktop e mobile” desmarcado (`docs/mvp-pilot-manual-checklist.md:5-10`). A busca por `navigator.share`, `navigator.canShare`, `AbortError` e `InstagramStoryShareButton` encontrou apenas código de produção, nenhum teste.
