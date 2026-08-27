# Addendum técnico — Guardian of Bravantus

Este addendum preserva detalhes brownfield e decisões de mecanismo úteis para Arquitetura, UX e histórias. Ele não altera o escopo do PRD.

## 1. Estado brownfield

- Aplicação Next.js 15/React 19 com App Router.
- Rotas em `app/`; domínio em `features/`; transporte e contratos em `lib/api/`; React Query para estado remoto e Zustand para estado local persistido.
- O frontend vigente já implementa as superfícies principais do Piloto, mas a matriz integrada permanece não executada.
- O backend é a fonte de verdade para estado, transição, autorização, configuração do Builder e limites de geração.

## 2. Invariantes de integração

- Não inventar endpoint ou shape. O script `npm run generate:api` não funciona enquanto `openapi/openapi.yaml` estiver ausente; `lib/api/openapi.ts` não representa a especificação atual do Piloto.
- Alterações de DTO do Builder devem manter mapper, tipos, schema, formulário, revisão e renderer canônico sincronizados.
- Rascunhos usam PATCH parcial e omitem blocos vazios/inválidos; nunca limpam capítulos incompletos por ausência no payload.
- Personagem existente permanece ligado a `builderConfigVersion`; apenas personagem novo usa configuração ativa.
- `Character.id` é o identificador canônico do Personagem; não substituir por `userId`, `tableMemberId` ou nome.
- Compatibilidade de envelopes e campos opcionais pertence à camada service/mapper, não à UI.

## 3. Estado e autorização

- A jornada usa estados funcionais equivalentes a `CONSENT_REQUIRED`, `JOIN_REQUIRED`, `CONTEXT_REQUIRED`, `CHARACTER_DRAFT`, `CHANGES_REQUIRED`, `SURVEY_REQUIRED`, `COMPLETED_PENDING_REVIEW`, `COMPLETED_CHANGES_REQUIRED`, `COMPLETED_APPROVED`, `LEGACY_REVIEW` e `BLOCKED`.
- `nextRoute` e o estado retornado governam retomada e guardas; a UI não avança por inferência otimista.
- `ADMIN` é papel global; `MASTER` é papel contextual da Mesa. A autorização real permanece no backend.
- `pilot-v1` usa capacidade administrativa excepcional e limitada para revisão; fora dessa campanha, a revisão exige `MASTER` ativo na Mesa. A arquitetura deve separar essas autorizações, não inferir uma da outra.
- A capacidade excepcional exige atribuição ativa ao `pilot-v1`, permissão explícita e checagem backend por campanha; remoção da atribuição invalida acesso, e autorrevisão permanece proibida.

## 4. Autenticação e riscos atuais

- O JWT é armazenado em localStorage/Zustand e espelhado em cookie JavaScript para o middleware; o middleware verifica presença, não validade ou papel.
- Logout é limpeza local e não revoga sessão no backend.
- Route group `(public)` é estrutural; somente a landing da campanha é realmente pública, conforme `lib/routing/auth-redirects.ts`.
- Mudanças de autenticação ou autorização exigem decisão explícita e análise de migração.
- Antes de qualquer convite externo, a sessão precisa ser revogável ou curta, validada pelo servidor e invalidada em logout, remoção da campanha ou revogação de papel; a matriz deve provar expiração, rotação e `401/403` frescos.

## 5. Validação integrada mínima

- Participante novo; retomada; criação com IA; criação sem IA/falha; validação do Builder; ajuste; ressubmissão; aprovação; Pesquisa Final antes e depois da aprovação; Retrato/Carta/downloads; operação; legado; guardas/autorização; concorrência/idempotência; notificações reais.
- Cada cenário registra conta e papel sem senha, estado inicial, endpoints/códigos HTTP, estado final persistido, rota final e evidência visual.
- Repetir refresh e novo login após Consentimento, Rascunho, ajuste, Pesquisa Final e Conclusão.
- Inspecionar Network e Analytics para comprovar que dados proibidos não chegaram ao browser ou evento técnico.
- A matriz normativa com resultados esperados é `reconcile-user-journeys.md`, cenários `E2E-P01` a `E2E-P09`, `E2E-M01` a `E2E-M02`, `E2E-A01` a `E2E-A02`, `E2E-S01` a `E2E-S02` e `E2E-N01`.
- Acrescentar `E2E-P10` para opt-in/revogação do Perfil Público, `E2E-P11` para Story, `E2E-S03` para privacidade de browser/Analytics, `E2E-S04` para acessibilidade/mobile e `E2E-S05` para `LEGACY_REVIEW`, `BLOCKED` e ausência de `nextRoute` sem loop.
- Acrescentar `E2E-S06` para ciclo de Consentimento e sessão, `E2E-P12` para recuperação de configuração antiga e `E2E-P13` para perda de elegibilidade do Perfil Público.
- `E2E-S03` deve usar sentinelas privadas e comprovar allowlist exata no payload e DOM público, além do payload real enviado a IA/Analytics.
- `E2E-M01/M02` deve cobrir Snapshot imutável, `expectedRevision`, conflito `409`, contas distintas e matriz por campanha, atribuição, papel e autoria.
- `E2E-P01/P02/S05/S06` deve cobrir retorno interno ou malformado, sessão expirada, rota incompatível, `BLOCKED`, estado ausente e repetição após falha sem loop nem duplicação.
- `E2E-P02/P05/P12` deve cobrir serialização parcial por capítulo, todas as validações mecânicas, preservação de `builderConfigVersion` e recuperação de configuração retirada.
- `E2E-P03/P04/S03` deve capturar estado e payload antes e depois de gerar, aceitar, editar, desfazer e descartar; indisponibilidade do provedor mantém o caminho manual.

## 6. Protocolo de pesquisa formativa

- Para cada perfil — iniciante, orientado e experiente — registrar tarefa, hipótese, tempo, retornos de etapa, intervenções e resultado observável.
- Separar observação comportamental, entrevista, eventos técnicos e Pesquisa Final; uma fonte não substitui as demais.
- Resultados desta rodada validam criação/onboarding. Diversão, equilíbrio e uso da Ficha exigem sessão real posterior.
- Registrar versão do Builder, regras e campanha para não misturar rodadas incompatíveis.

## 7. Decisões superadas ou não canônicas

- `mvp-frontend-backlog.md` é fotografia anterior à implementação e não descreve o estado atual.
- Perguntas específicas do Episódio 1 não integram o Builder nem bloqueiam submissão na decisão de produto vigente.
- 12 pontos pertencem aos Atributos; o conjunto de 10 Pontos de Essência/Ecos é hipótese separada.
- O estado “Ativo” de manuais antigos não deve ser adicionado ao enum de Ficha sem contrato do backend.
- Histórias e nomes de Legados permanecem protótipos até aprovação do Product Owner.

## 8. Fontes reconciliadas

- `reconcile-product-playtest.md`
- `reconcile-user-journeys.md`
- `reconcile-domain-rules.md`
- `reconcile-ux-visual.md`
- `research-market-landscape.md`
