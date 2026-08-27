---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
status: final
updated: 2026-08-27
inputDocuments:
  - prds/prd-GOB-Frontend-2026-08-27/prd.md
  - prds/prd-GOB-Frontend-2026-08-27/addendum.md
  - architecture/architecture-GOB-Frontend-2026-08-27/ARCHITECTURE-SPINE.md
  - ux-designs/ux-GOB-Frontend-2026-08-27/DESIGN.md
  - ux-designs/ux-GOB-Frontend-2026-08-27/EXPERIENCE.md
---

# GOB-Frontend — Decomposição de Épicos

## Visão geral

Este documento transforma o PRD, o contrato de UX e o Architecture Spine finais do `pilot-v1` em épicos e histórias implementáveis. As fontes antigas permanecem rastreabilidade indireta; decisões superadas não são reintroduzidas.

## Inventário de requisitos

### Requisitos funcionais

- **FR-1:** Visitantes abrem a landing pública do Piloto e compreendem proposta, status, etapas e ações sem exposição de dados internos.
- **FR-2:** O Participante cadastra, autentica, confirma e-mail e retorna à campanha por `returnTo` interno seguro.
- **FR-3:** O Participante consulta, aceita, renova ou revoga Consentimento versionado, persistido e auditável.
- **FR-4:** Entrada e retomada da campanha são idempotentes e respeitam membership/capacidade retornadas pelo backend.
- **FR-5:** O Participante recebe somente Contexto Público suficiente; perguntas do Episódio 1 não integram nem bloqueiam o Builder.
- **FR-6:** Próxima ação e rota vêm do estado canônico do backend, com recuperação segura para estado/rota ausente ou incompatível.
- **FR-7:** Iniciar criação retoma ou cria um único Rascunho antes de navegar, preservando `Character.id`, revisão e versão do Builder.
- **FR-8:** Estados funcionais são apresentados em linguagem humana, sem enum/payload e sem depender somente de cor.
- **FR-9:** O Builder coleta identidade, motivações e Marca em blocos narrativos curtos e acessíveis.
- **FR-10:** O Participante confirma ou corrige a interpretação narrativa antes da Ficha Mecânica.
- **FR-11:** O Builder usa a `builderConfigVersion` do Personagem e trata versão indisponível sem migração silenciosa.
- **FR-12:** Arquétipo, Atributos, Traits, Treinamentos e Equipamentos obedecem ao catálogo e às validações vigentes.
- **FR-13:** Salvamento progressivo preserva dados válidos, omite blocos inválidos/vazios e recupera conflitos sem perda silenciosa.
- **FR-14:** Revisão, Meu Personagem, Conclusão e PDF reutilizam uma projeção canônica da Ficha.
- **FR-15:** Ajuda de IA é opcional, contextual e não bloqueia o caminho manual em falha, limite ou indisponibilidade.
- **FR-16:** Sugestões de IA exigem decisão explícita de aceitar, editar ou descartar antes de alterar/persistir a Ficha.
- **FR-17:** A Proposta Mecânica permite decisão independente dos cinco blocos e confirmação atômica conforme contrato oficial.
- **FR-18:** Telemetria de IA registra uso, modelo, tokens, status, custo e decisão sem conteúdo criativo proibido.
- **FR-19:** Submissão explícita usa `expectedRevision` e cria Snapshot imutável, sem duplicação em retry ou conflito.
- **FR-20:** Revisor autorizado acessa somente Fichas submetidas e o último Snapshot confirmado necessário à revisão.
- **FR-21:** Revisor autorizado pede ajustes com motivo e revisão esperada; ressubmissão preserva histórico e Pesquisa.
- **FR-22:** Em `pilot-v1`, ADMIN atribuído recebe capability excepcional de revisão sem se tornar MASTER e sem autorrevisão.
- **FR-23:** Notificações de submissão, ajustes e aprovação são efeitos operacionais tolerantes a falha.
- **FR-24:** Pesquisa Final versionada pode ser criada/atualizada sem duplicação, inclusive antes da aprovação.
- **FR-25:** Conclusão separa participação concluída do estado real da revisão e reabre Builder quando necessário.
- **FR-26:** Após Pesquisa, o Participante gera explicitamente um Retrato e uma Carta, com limites/proveniência por variante.
- **FR-27:** Retrato, Carta e Ficha em PDF podem ser baixados; PDF é snapshot local, legível e sem dados internos.
- **FR-28:** Perfil Público exige Personagem aprovado, allowlist, opt-in por Snapshot, revogação e invalidação por perda de elegibilidade.
- **FR-29:** Story usa prévia do mesmo Snapshot publicado, share nativo quando disponível e fallback de download.
- **FR-30:** Administrador consulta funil e pendências reais; erro não vira zero e DTO de funil é mínimo.
- **FR-31:** Administrador busca, filtra e pagina Participantes com dados mínimos e detalhe autorizado separado.
- **FR-32:** Administrador adapta ou exclui Personagem legado com autorização, confirmação, motivo e auditoria.
- **FR-33:** Administrador filtra uso/custos de IA, distinguindo USD, BRL estimado e chamadas não precificadas.
- **FR-34:** Menus/CTAs do Piloto ocultam módulos legados e separam shell de Participante e Administrador.

### Requisitos não funcionais

- **NFR-1 — Autorização:** Toda leitura/mutação protegida é validada pelo backend; botão oculto não constitui segurança.
- **NFR-2 — Sessão:** Piloto externo exige sessão curta ou revogável, rotação, logout efetivo e `401/403` frescos.
- **NFR-3 — Privacidade:** Segredo do Mestre, credenciais, prompts integrais e conteúdo criativo completo não entram em payload público ou Analytics.
- **NFR-4 — Minimização:** Perfil, IA, revisão, operação, artefato e Analytics usam DTOs allowlisted distintos.
- **NFR-5 — Auditoria:** Consentimento, Pesquisa, Snapshot e decisões de IA mantêm versão e proveniência.
- **NFR-6 — Jurídico:** Piloto externo depende de aprovação de finalidade, base, fornecedores, retenção e direitos.
- **NFR-7 — Acessibilidade:** Rotas críticas atendem WCAG 2.2 AA, contraste, teclado, landmarks, foco e associação de erros.
- **NFR-8 — Alvos e reflow:** Controles têm 44 × 44 CSS px; zoom 200% não perde conteúdo nem cria scroll horizontal comum.
- **NFR-9 — Movimento e semântica:** `prefers-reduced-motion` é respeitado; texto/ícone complementam cor.
- **NFR-10 — Mobile:** Jornada funciona desde 320 CSS px, incluindo safe area, teclado virtual e sem dependência de hover.
- **NFR-11 — Dispositivo real:** Artefatos/share/download são testados em dispositivo real, com cancelamento e fallback.
- **NFR-12 — Resposta percebida:** `[ASSUMPTION]` ação local responde em até 100 ms e página crítica fica utilizável em até 3 s p75 em rede móvel típica.
- **NFR-13 — Salvamento:** `[ASSUMPTION]` após resposta do backend, confirmação ou erro recuperável aparece em até 2 s.
- **NFR-14 — Idempotência:** Participação, Personagem, submissão e Pesquisa não duplicam sob retry/concorrência.
- **NFR-15 — Isolamento de falha:** IA, e-mail, imagem e download não corrompem estado central nem bloqueiam caminho manual.
- **NFR-16 — Observabilidade:** Funil/falhas são reconstruíveis sem coletar conteúdo criativo completo.
- **NFR-17 — Custo:** Toda chamada de IA registra status/modelo/tokens/custo; desconhecido não vira zero.
- **NFR-18 — Validação integrada:** Fluxo crítico exige backend/banco reais e evidência de papel, HTTP, persistência, caches e rota final.
- **NFR-19 — Segurança de dependências:** Antes do Piloto externo, atualizar Next.js/eslint-config-next para ao menos 15.5.24 e alinhar tipos React 19.
- **NFR-20 — Release:** Deploy externo exige ambientes, segredos, observabilidade, rollback e URLs por ambiente definidos/testados.

### Requisitos adicionais de Arquitetura

- **AR-1:** Preservar arquitetura `Layered feature modules`: rota → UI → hook → service/mapper → `lib/api`.
- **AR-2:** Para revisão, `features/admin` pode depender de `features/mvp`; a dependência inversa é proibida.
- **AR-3:** React Query é dono do estado remoto; store/localStorage não replica entidade remota como fonte canônica.
- **AR-4:** Criar fronteira única de autenticação para middleware, cliente HTTP, logout e store; o mecanismo depende de ADR frontend/backend.
- **AR-5:** Validar payload externo em runtime e mapear para domínio; cast bruto não conta como contrato.
- **AR-6:** Criar `features/mvp/query-topology.ts` com chaves/matriz por transição e política de frescor entre sessões.
- **AR-7:** Criar `features/mvp/builder/character-presentation.ts` como owner da projeção canônica da Ficha.
- **AR-8:** `features/mvp` é owner único de fila, detalhe e transições de revisão.
- **AR-9:** Criar `features/mvp/analytics-contract.ts` com catálogo tipado e versionado de eventos.
- **AR-10:** Criar `features/mvp/publication` como owner de opt-in, revogação e elegibilidade; `features/characters` só apresenta DTO público.
- **AR-11:** `lib/campaign` normaliza retomada e `lib/routing` produz `permit | redirect | block` usando catálogo seguro de rotas.
- **AR-12:** Padronizar `DomainFailure` e ações técnicas comuns; microcopy permanece na feature.
- **AR-13:** Operações concorrentes usam `expectedRevision`; `409` invalida topologia e força ressincronização.
- **AR-14:** OpenAPI oficial é gate: não executar `generate:api`, editar schema gerado nem inventar endpoint/DTO enquanto ausente.
- **AR-15:** Idempotência atômica, decisão mecânica de IA, publicação/revogação e quota/cancelamento de arte ficam bloqueados até contrato backend.
- **AR-16:** Superfícies protegidas usam transporte browser até ADR de sessão; Server Components só buscam DTOs públicos sem credencial/cache privado.
- **AR-17:** Valor de custo usa micros de USD; não precificado é união distinta e BRL inclui taxa, fonte e data.
- **AR-18:** Notificação possui outcome independente da transição e nunca impede próxima ação.

### Requisitos de UX Design

- **UX-DR1:** Implementar tokens light-first de cor, tipografia, espaçamento e raios definidos em `DESIGN.md`.
- **UX-DR2:** Usar Cinzel apenas em títulos narrativos especiais e Inter na interface/leitura, com fallbacks documentados.
- **UX-DR3:** Implementar Primary action com uma ação dominante, foco visível, estado de processamento e prevenção de duplo envio.
- **UX-DR4:** Implementar Editorial panel como agrupador semântico, sem card decorativo redundante.
- **UX-DR5:** Implementar Narrative field com rótulo persistente, ajuda/erro associados, preservação de conteúdo e foco no primeiro erro.
- **UX-DR6:** Implementar Journey navigation baseada em `journeyState`/`nextRoute`, sem permitir pular guarda ou reexpor menus legados.
- **UX-DR7:** Implementar AI assistance com estados gerar/proposta/aplicação local/decisão/erro e caminho manual completo.
- **UX-DR8:** Implementar Canonical sheet reutilizável, legível, com faltantes, modos editável/somente leitura e separação conta/Personagem.
- **UX-DR9:** Implementar Status indicator com texto/ícone e vocabulário humano para loading, vazio, bloqueio, aprovação e falha.
- **UX-DR10:** Implementar Guardian progress com estados determinado/indeterminado e equivalente estático para movimento reduzido.
- **UX-DR11:** Implementar Confirmation dialog acessível para submissão, publicação, revogação, adaptação e exclusão.
- **UX-DR12:** Implementar Personal artifact com prévia, disponibilidade/limite, proveniência, galeria, retry e identificação de arte pessoal por IA.
- **UX-DR13:** Separar shells e allowlists de navegação de Visitante, Participante e Administrador do Piloto.
- **UX-DR14:** Traduzir todos os estados da jornada e falhas transversais para linguagem humana e recuperação segura.
- **UX-DR15:** Garantir operação integral por teclado, foco restaurado, anúncios dinâmicos adequados, alt text e nenhuma informação apenas por cor.
- **UX-DR16:** Garantir reflow em 200%, alvos 44 × 44 e contraste conforme combinações aprovadas no Design Spine.
- **UX-DR17:** Implementar composição mobile-first de 320 px a desktop, respeitando safe areas/teclado e paridade funcional.
- **UX-DR18:** Garantir que conclusão, aprovação, publicação e disponibilidade de artefatos sejam dimensões visuais independentes.
- **UX-DR19:** Implementar share/download com progressive enhancement: prévia, `navigator.share` quando suportado e fallback de arquivo.
- **UX-DR20:** Validar as quatro jornadas e estados de recuperação com matriz E2E, teclado, leitor de tela, zoom e dispositivo real.

### Mapa de cobertura de FRs

- **FR-1–FR-8 → Épico 1:** entrada segura, Consentimento, membership e retomada canônica.
- **FR-9–FR-14 → Épico 2:** Builder narrativo, configuração versionada, salvamento e Ficha canônica.
- **FR-15–FR-18 → Épico 3:** assistência opcional de IA, decisões humanas e telemetria segura.
- **FR-19–FR-23 → Épico 4:** submissão, Snapshot, revisão, ajustes, aprovação e notificações.
- **FR-24–FR-27 → Épico 5:** Pesquisa, conclusão honesta, Retrato, Carta e PDF.
- **FR-28–FR-29 → Épico 6:** publicação opt-in, revogação e Story do Snapshot aprovado.
- **FR-30–FR-34 → Épico 7:** funil, Participantes, legado, custos e escopo administrativo.

### Mapa de cobertura de UX

- **UX-DR1–UX-DR6:** Stories 1.3, 1.6, 2.1, 2.4, 2.6 e 7.1 — tokens, ações, painéis, campos e navegação.
- **UX-DR7:** Stories 3.2–3.3 — estados e decisão da assistência de IA.
- **UX-DR8:** Story 2.5 — Ficha canônica reutilizável.
- **UX-DR9–UX-DR10:** Stories 1.6, 2.4, 5.2 e 2.6 — estados humanos e progresso com alternativa estática.
- **UX-DR11:** Stories 4.1, 6.2, 6.3 e 7.4 — confirmações acessíveis e consequências.
- **UX-DR12:** Stories 5.3–5.4 — artefatos pessoais e seus estados.
- **UX-DR13–UX-DR14:** Stories 1.6 e 7.1 — shells/allowlists e tradução de estado.
- **UX-DR15–UX-DR17:** Stories 2.1 e 2.6 — teclado, foco, leitor de tela, contraste, reflow e mobile-first.
- **UX-DR18:** Story 5.2 — independência entre conclusão, aprovação, publicação e artefatos.
- **UX-DR19:** Stories 5.4 e 6.4 — progressive enhancement de share/download.
- **UX-DR20:** Stories 2.6, 6.5 e 7.6 — validação integrada das jornadas e recuperação.

## Lista de épicos

### Épico 1: Entrar e retomar o Piloto com segurança

O Participante entende o Piloto, autentica, consente, entra uma única vez e sempre retorna à etapa permitida, sem exposição de dados nem perda de progresso.

**FRs cobertos:** FR-1 a FR-8.

**Habilita:** todos os demais épicos; inclui os gates de sessão, segurança de dependências, contrato de retomada e estados humanos.

### Épico 2: Criar um Personagem autoral e mecanicamente válido

O Participante constrói narrativa e mecânica em etapas compreensíveis, salva progressivamente e reconhece uma única Ficha como sua.

**FRs cobertos:** FR-9 a FR-14.

**Dependência natural:** Épico 1. Entrega o caminho manual completo, portanto funciona sem o Épico 3.

### Épico 3: Receber ajuda de IA sem perder autoria

O Participante solicita ajuda opcional, decide cada sugestão e continua manualmente quando a IA falha; operação acompanha uso/custo sem conteúdo proibido.

**FRs cobertos:** FR-15 a FR-18.

**Dependência natural:** Épico 2. Aplicação mecânica fica feature-gated até o OpenAPI definir a operação atômica.

### Épico 4: Enviar, revisar e aprovar com autoridade correta

O Participante envia um Snapshot imutável; o revisor autorizado pede ajustes ou aprova sem autorrevisão, sobrescrita concorrente ou rollback por falha de e-mail.

**FRs cobertos:** FR-19 a FR-23.

**Dependência natural:** Épicos 1 e 2; estabelece o Snapshot usado posteriormente pela publicação.

### Épico 5: Concluir o playtest e receber artefatos pessoais

O Participante responde a Pesquisa sem confundir conclusão com aprovação e obtém Retrato, Carta e PDF por ações explícitas e recuperáveis.

**FRs cobertos:** FR-24 a FR-27.

**Dependência natural:** Épico 4 para submissão; aprovação não é necessária para Pesquisa nem artefatos privados.

### Épico 6: Publicar e compartilhar um Snapshot aprovado com controle

O Participante escolhe publicar o recorte permitido, revoga quando quiser e gera Story apenas do mesmo Snapshot enquanto elegível.

**FRs cobertos:** FR-28 e FR-29.

**Dependência natural:** Épico 4 para aprovação e Épico 5 para Carta; gate jurídico/privacidade e contrato OpenAPI bloqueiam exposição externa.

### Épico 7: Operar o Piloto sem acesso excessivo

O Administrador acompanha funil, participantes, legado e custos com dados mínimos, estados canônicos e um shell limitado às tarefas do Piloto.

**FRs cobertos:** FR-30 a FR-34.

**Dependência natural:** consome estados entregues pelos Épicos 1–6, mas cada superfície administrativa produz valor independente conforme sua fonte estiver disponível.

## Épico 1: Entrar e retomar o Piloto com segurança

O Participante entende o Piloto, autentica, consente, entra uma única vez e sempre retorna à etapa permitida, sem exposição de dados nem perda de progresso.

### Story 1.1: Corrigir o baseline de segurança do frontend

**Requisitos:** NFR-19

As a Participante,
I want acessar uma aplicação com dependências suportadas e verificadas,
So that minha entrada no Piloto não dependa de um runtime com vulnerabilidades críticas conhecidas.

**Acceptance Criteria:**

**Given** o lock atual com Next.js 15.5.15 e tipos React 18
**When** a manutenção de segurança for aplicada
**Then** Next.js e `eslint-config-next` ficam em pelo menos 15.5.24 e `@types/react`/`@types/react-dom` na major 19
**And** ranges RC legados são substituídos por ranges estáveis, instalação limpa, lint, typecheck e build passam sem suprimir erros.

### Story 1.2: Unificar sessão e autenticação protegida

**Requisitos:** FR-2, NFR-1–NFR-2

As a Participante,
I want uma sessão que expire, seja revogada e encerre de verdade,
So that ninguém continue acessando o Piloto apenas por possuir um token local antigo.

**Acceptance Criteria:**

**Given** uma ADR frontend/backend e contrato oficial de sessão aprovados
**When** middleware, cliente HTTP, bootstrap, store e logout forem migrados
**Then** todos consomem uma única fronteira em `lib/auth`
**And** presença de cookie/localStorage não autoriza ações, logout/revogação invalidam a sessão, reentrada preserva somente `returnTo` interno e os cenários de expiração/rotação/`401`/`403` passam com backend real.

### Story 1.3: Abrir a campanha e retornar após autenticação

**Requisitos:** FR-1–FR-2

As a Visitante,
I want entender o Piloto e autenticar sem perder o convite,
So that eu volte à campanha correta após cadastro, login ou confirmação de e-mail.

**Acceptance Criteria:**

**Given** uma landing pública de campanha existente, encerrada ou indisponível
**When** o Visitante abre o link e escolhe cadastrar ou entrar
**Then** proposta, status e etapas são mostrados sem dados internos, e estados indisponíveis falham com segurança
**And** cadastro/login/confirmação preservam somente destino interno validado; destino externo/malformado é rejeitado e token de e-mail inválido permanece recuperável.

### Story 1.4: Consentir e ingressar sem duplicação

**Requisitos:** FR-3–FR-4

As a Participante,
I want aceitar a versão vigente e ingressar uma única vez,
So that minha participação seja consciente, auditável e retomável.

**Acceptance Criteria:**

**Given** sessão válida e Consentimento vigente
**When** o Participante aceita e ingressa
**Then** aceite e membership são persistidos antes de avançar, com versão, campanha, usuário, status e timestamp
**And** falha/recusa não produzem aceite, nova versão exige reaceite, retry concorrente não duplica participação, e revogação bloqueia novas ações e aciona despublicação conforme política aprovada.

### Story 1.5: Conhecer o contexto e iniciar um único Rascunho

**Requisitos:** FR-4–FR-5, FR-7

As a Participante consentido,
I want conhecer o ponto de partida e iniciar ou retomar meu Personagem,
So that eu avance sem spoiler, questionário do Episódio 1 ou duplicação.

**Acceptance Criteria:**

**Given** membership ativa e Contexto Público disponível
**When** o Participante escolhe criar o Personagem
**Then** apenas contexto aprovado é mostrado e o backend retoma/cria atomicamente um único `Character.id` antes da navegação
**And** contexto ausente, mesa cheia, membership removida ou campanha encerrada produz estado recuperável sem inventar lore ou usar `GET`→`POST` como garantia de idempotência.

### Story 1.6: Retomar pela rota canônica sem loops

**Requisitos:** FR-6, FR-8

As a Participante,
I want retornar exatamente à etapa permitida,
So that refresh, novo login ou URL direta não criem uma segunda verdade.

**Acceptance Criteria:**

**Given** resposta de `resume` com estado, rota e revisão
**When** uma rota é aberta ou uma transição termina
**Then** `lib/campaign` normaliza o estado e `lib/routing` retorna `permit | redirect | block` usando catálogo seguro de rotas
**And** a UI não sintetiza `journeyState`/`nextRoute`; estado desconhecido, rota ausente, `BLOCKED`, `LEGACY_REVIEW` e repetição de redirect terminam em mensagem humana recuperável, com refetch em mount/focus para estado decisório.

## Épico 2: Criar um Personagem autoral e mecanicamente válido

O Participante constrói narrativa e mecânica em etapas compreensíveis, salva progressivamente e reconhece uma única Ficha como sua.

### Story 2.1: Contar a história em blocos curtos

**Requisitos:** FR-9

As a Participante sem experiência em RPG,
I want descrever identidade, motivações e Marca em linguagem natural,
So that eu comece pelo Personagem, não por terminologia mecânica.

**Acceptance Criteria:**

**Given** um Rascunho editável
**When** o Participante percorre o capítulo narrativo
**Then** recebe poucos campos amplos, orientação acolhedora e aceita pouco texto válido
**And** perguntas do Episódio 1 não aparecem como requisito; campos têm rótulo/ajuda/erro associados, foco visível, alvo de 44 px e funcionam desde 320 px sem hover.

### Story 2.2: Confirmar a interpretação narrativa

**Requisitos:** FR-10

As a Participante,
I want confirmar ou corrigir identidade, motivações e Marca,
So that a mecânica seja baseada no que eu realmente quis dizer.

**Acceptance Criteria:**

**Given** os três blocos narrativos preenchidos
**When** a interpretação é apresentada
**Then** cada bloco pode ser confirmado ou editado sem apagar os demais
**And** o estado de confirmação permanece no Rascunho, retomada e Snapshot; nada é promovido a Cânone oficial ou Segredo do Mestre.

### Story 2.3: Aplicar configuração mecânica versionada

**Requisitos:** FR-11–FR-12

As a Participante,
I want montar uma Ficha válida segundo a versão do meu Personagem,
So that minhas escolhas permaneçam coerentes mesmo quando a configuração ativa mudar.

**Acceptance Criteria:**

**Given** um Personagem com `builderConfigVersion`
**When** Arquétipo, seis Atributos, Traits, Treinamentos e Equipamentos são editados
**Then** opções/limites vêm da versão vinculada e a validação atual exige total 12, limites e ao menos 1 em Vigor ou Espírito
**And** versão ausente abre somente leitura; não usa configuração ativa como fallback e só libera edição após restauração exata ou migração backend versionada, auditável e confirmada.

### Story 2.4: Salvar progressivamente sem apagar capítulos

**Requisitos:** FR-13

As a Participante,
I want salvar partes válidas e continuar depois,
So that interrupção, erro ou conflito não destruam minha criação.

**Acceptance Criteria:**

**Given** alterações parciais no Builder
**When** o salvamento é disparado
**Then** PATCH omite campos vazios/blocos inválidos e preserva dados persistidos ausentes do payload
**And** a UI mostra salvando/salvo/erro; erro não navega, `409` mantém edição local, refaz leitura canônica e reapresenta a decisão sem sobrescrita silenciosa.

### Story 2.5: Reutilizar a Ficha canônica

**Requisitos:** FR-14

As a Participante ou Revisor,
I want ver os mesmos rótulos e valores em todas as superfícies,
So that eu não precise reconstruir ou reinterpretar o Personagem.

**Acceptance Criteria:**

**Given** dados narrativos e mecânicos de um Personagem
**When** aparecem no Builder, Revisão, Meu Personagem, Conclusão ou PDF
**Then** são derivados de `CanonicalCharacterPresentation` em `features/mvp/builder/character-presentation.ts`
**And** nenhum consumidor redefine o shape; modos editável/somente leitura mudam interação, não semântica, e Perfil da conta permanece separado do Personagem.

### Story 2.6: Validar o Builder manual de ponta a ponta

**Requisitos:** FR-8–FR-14

As a Participante,
I want concluir a criação manual por teclado e celular,
So that IA, animação ou dispositivo não sejam pré-requisitos de autoria.

**Acceptance Criteria:**

**Given** um Participante iniciante em viewport 320/360/375 px ou desktop
**When** percorre narrativa, confirmação, mecânica e revisão sem IA
**Then** completa todas as tarefas por teclado, com ordem/foco/erros programáticos, zoom 200% e movimento reduzido
**And** nenhuma ação depende de hover/cor; safe area e teclado virtual não cobrem campo, erro ou CTA, e evidência é registrada na matriz E2E.

## Épico 3: Receber ajuda de IA sem perder autoria

O Participante solicita ajuda opcional, decide cada sugestão e continua manualmente quando a IA falha; operação acompanha uso/custo sem conteúdo proibido.

### Story 3.1: Fechar o contrato seguro de IA e Analytics

**Requisitos:** FR-15, FR-18

As a Participante,
I want que somente o contexto necessário seja enviado à IA,
So that minha criação receba ajuda sem expor Segredos ou dados desnecessários.

**Acceptance Criteria:**

**Given** um caso de uso de ajuda textual ou mecânica
**When** o service prepara a chamada e o evento técnico
**Then** valida DTO em runtime e aplica allowlist por destinatário
**And** `analytics-contract.ts` aceita apenas eventos/metadata versionados; token, credencial, Segredo, prompt integral, Pesquisa, narrativa/Ficha completas são rejeitados por tipo/schema e por teste com sentinelas.

### Story 3.2: Pedir e decidir sugestões por campo

**Requisitos:** FR-15–FR-16

As a Participante,
I want gerar, aceitar, editar, descartar ou desfazer uma sugestão,
So that a IA ajude sem tomar minha decisão.

**Acceptance Criteria:**

**Given** um campo/capítulo e contexto autorizado
**When** o Participante solicita ajuda
**Then** gerar apenas registra proposta/proveniência e não altera a Ficha
**And** aceitar/editar/descartar exige ação explícita; decisão é persistida antes do PATCH ou a aplicação fica local não persistível/reversível em erro, enquanto timeout, limite, vazio e indisponibilidade mantêm o caminho manual.

### Story 3.3: Confirmar uma Proposta Mecânica atômica

**Requisitos:** FR-17

As a Participante,
I want decidir Arquétipo, Atributos, Traits, Treinamentos e Equipamentos separadamente,
So that eu controle cada parte antes de aplicar a proposta inteira.

**Acceptance Criteria:**

**Given** OpenAPI oficial com operação atômica e `expectedRevision`
**When** a Proposta Mecânica é recebida
**Then** cada um dos cinco blocos fica aceito/editado/descartado localmente e nenhum PATCH ocorre antes de todos terem decisão
**And** a confirmação registra decisões e Ficha numa operação idempotente; conflito/resultado parcial não deixa meia proposta persistida, e a feature permanece desativada enquanto o contrato não existir.

### Story 3.4: Registrar uso e custo sem conteúdo criativo

**Requisitos:** FR-18

As a Operador do Piloto,
I want telemetria confiável das chamadas de IA,
So that eu acompanhe falhas e custo sem vigiar a criação dos Participantes.

**Acceptance Criteria:**

**Given** uma chamada concluída, falha ou não precificada
**When** a telemetria é persistida
**Then** registra caso de uso, provedor, modelo, tokens, status, decisão e micros de USD quando conhecidos
**And** não precificado é união distinta de zero; BRL inclui taxa/fonte/data e nenhum conteúdo proibido aparece no payload real ou Analytics.

## Épico 4: Enviar, revisar e aprovar com autoridade correta

O Participante envia um Snapshot imutável; o revisor autorizado pede ajustes ou aprova sem autorrevisão, sobrescrita concorrente ou rollback por falha de e-mail.

### Story 4.1: Submeter um Snapshot imutável

**Requisitos:** FR-19

As a Participante,
I want revisar e enviar explicitamente a versão atual,
So that o revisor analise exatamente o que confirmei.

**Acceptance Criteria:**

**Given** Ficha canônica completa e `expectedRevision` vigente
**When** o Participante confirma o envio
**Then** o backend cria um único Snapshot imutável e a Ficha submetida fica somente leitura
**And** duplo clique/retry não duplica Snapshot; `409` preserva local, sincroniza e exige nova confirmação, e navegação só ocorre após persistência.

### Story 4.2: Abrir fila e detalhe autorizados

**Requisitos:** FR-20

As a Revisor do Piloto,
I want ver Fichas submetidas e abrir o último Snapshot,
So that eu decida sem reconstruir o Personagem nem acessar dados excessivos.

**Acceptance Criteria:**

**Given** capability vigente para visualizar revisão em `pilot-v1`
**When** o revisor abre fila e detalhe
**Then** a fila contém apenas itens submetidos/identificação mínima e o detalhe autorizado usa Snapshot canônico
**And** Rascunho posterior não substitui Snapshot; papel/membership/atribuição inválidos retornam `403` sem renderizar dados, e `features/mvp` permanece owner de keys/mappers/transições.

### Story 4.3: Pedir ajustes e ressubmeter

**Requisitos:** FR-21

As a Revisor e Participante,
I want solicitar uma correção e enviar nova revisão,
So that a Ficha evolua sem perder histórico ou Pesquisa já respondida.

**Acceptance Criteria:**

**Given** Snapshot submetido, capability de pedir ajustes e revisão esperada
**When** o revisor informa motivo e confirma
**Then** a transição é persistida, o Participante vê feedback e só edita quando o backend autoriza
**And** ressubmissão cria nova revisão/Snapshot, preserva histórico e Pesquisa; `CHANGES_REQUIRED` suspende Perfil Público e conflito não sobrescreve decisão mais nova.

### Story 4.4: Aprovar sem confundir ADMIN e MASTER

**Requisitos:** FR-22

As a Revisor autorizado,
I want aprovar a revisão correta,
So that autoridade humana seja aplicada somente no contexto permitido.

**Acceptance Criteria:**

**Given** capability explícita para aprovar, atribuição ativa ao `pilot-v1` e `expectedRevision`
**When** a aprovação é enviada
**Then** backend valida campanha, membership, autoria e revisão antes de persistir
**And** ADMIN não vira MASTER, ADMIN fora do Piloto não recebe autoridade, autorrevisão é negada, e Perfil permanece privado até opt-in posterior.

### Story 4.5: Sincronizar caches após cada transição

**Requisitos:** FR-19–FR-22

As a Participante ou Administrador,
I want que Jornada, fila, detalhe e funil concordem,
So that eu nunca aja sobre estado obsoleto.

**Acceptance Criteria:**

**Given** submissão, pedido de ajustes ou aprovação persistida
**When** a mutação termina
**Then** `query-topology.ts` atualiza/invalida `myCharacter`, detalhe, `resume`, fila, operação e publicação/elegibilidade aplicáveis
**And** outro browser refaz estado decisório em mount/focus ou revisão divergente; erro não vira zero/vazio e E2E registra caches, HTTP, persistência e rota final.

### Story 4.6: Notificar sem reverter a decisão

**Requisitos:** FR-23

As a Participante,
I want receber aviso de envio, ajustes ou aprovação,
So that eu acompanhe o processo sem depender do provedor de e-mail para a Ficha continuar válida.

**Acceptance Criteria:**

**Given** uma transição de revisão já persistida
**When** a notificação é solicitada
**Then** `notificationOutcome` é separado do resultado canônico e nunca bloqueia próxima ação
**And** falha é observável/reprocessável sem repetir a transição; mensagem não contém marketing, segredo ou credencial.

## Épico 5: Concluir o playtest e receber artefatos pessoais

O Participante responde a Pesquisa sem confundir conclusão com aprovação e obtém Retrato, Carta e PDF por ações explícitas e recuperáveis.

### Story 5.1: Responder e atualizar a Pesquisa Final

**Requisitos:** FR-24

As a Participante com Ficha submetida,
I want registrar como foi a criação,
So that eu conclua o teste mesmo antes da aprovação.

**Acceptance Criteria:**

**Given** Ficha `SUBMITTED` ou `APPROVED`
**When** a Pesquisa é criada ou atualizada
**Then** uma única resposta versionada é persistida e “Não usei IA” não exige avaliação da ferramenta
**And** atualização não duplica registro, campanha encerrada torna somente leitura e respostas abertas não são copiadas para Analytics.

### Story 5.2: Mostrar uma Conclusão honesta

**Requisitos:** FR-25

As a Participante,
I want distinguir participação concluída de revisão aprovada,
So that eu saiba o que terminei e o que ainda depende de outra pessoa.

**Acceptance Criteria:**

**Given** Pesquisa salva e qualquer estado de revisão
**When** a Conclusão é aberta
**Then** mostra separadamente conclusão, revisão, próxima ação e disponibilidade de artefatos em linguagem humana
**And** `PENDING_REVIEW` não vira aprovação; ajuste posterior reabre Builder sem apagar Pesquisa, e falha periférica não desfaz conclusão.

### Story 5.3: Gerar Retrato e Carta por variante

**Requisitos:** FR-26

As a Participante que concluiu a Pesquisa,
I want gerar um Retrato e uma Carta Jogável,
So that eu tenha artefatos pessoais do meu Guardião sem torná-los oficiais.

**Acceptance Criteria:**

**Given** disponibilidade/limite retornados pelo backend para `PORTRAIT` ou `PLAYABLE_CARD`
**When** o Participante vê a prévia e confirma explicitamente
**Then** geração persistente registra `ArtifactRef`, variante, `sourceSnapshotId`, data, fornecedor/modelo e estado sem expor prompt interno
**And** cada variante tem quota própria; pessoa real exige direitos/consentimento, política proibida falha fechada, retry/cancelamento respeitam contrato e a imagem é rotulada como arte pessoal por IA.

### Story 5.4: Consultar galeria e baixar imagens

**Requisitos:** FR-26–FR-27

As a Participante,
I want reencontrar e baixar meus artefatos após refresh,
So that uma falha de navegação ou share não destrua o resultado.

**Acceptance Criteria:**

**Given** artefatos existentes, processando, falhos ou limite esgotado
**When** a galeria é aberta
**Then** cada variante apresenta estado, proveniência permitida, ação disponível e download por hook/service de blob
**And** componente não chama service diretamente, erro não altera Ficha/revisão/conclusão e dispositivo real valida cancelamento, retry e arquivo.

### Story 5.5: Gerar a Ficha em PDF da revisão correta

**Requisitos:** FR-27

As a Participante,
I want baixar uma Ficha legível,
So that eu consulte meu Personagem fora da plataforma sem confundi-la com documento oficial.

**Acceptance Criteria:**

**Given** `CanonicalCharacterPresentation` e estado atual
**When** o PDF é solicitado na Conclusão ou após aprovação
**Then** usa respectivamente Snapshot submetido ou aprovado e identifica-se como fotografia local não oficial
**And** exclui feedback privado, enums, IDs/payloads internos; conteúdo longo/múltiplas páginas não truncam informação essencial e prévia de Rascunho, se existir, recebe rótulo/capability distintos.

## Épico 6: Publicar e compartilhar um Snapshot aprovado com controle

O Participante escolhe publicar o recorte permitido, revoga quando quiser e gera Story apenas do mesmo Snapshot enquanto elegível.

### Story 6.1: Implementar o contrato mínimo de publicação

**Requisitos:** FR-28

As a Participante,
I want que publicação tenha um estado próprio e privado por padrão,
So that aprovação nunca exponha automaticamente meu Personagem.

**Acceptance Criteria:**

**Given** OpenAPI oficial de opt-in, revogação, elegibilidade e Perfil Público
**When** `features/mvp/publication` é implementado
**Then** torna-se owner único de schema runtime, mapper, keys e transições; `features/characters` somente apresenta o DTO público
**And** o DTO contém allowlist mínima do Snapshot aprovado e nunca inclui e-mail, ID interno, feedback, histórico privado, dados técnicos ou Segredo; sem contrato oficial a capability permanece desativada.

### Story 6.2: Publicar com opt-in informado

**Requisitos:** FR-28

As a Dono de Personagem aprovado,
I want ver o recorte e confirmar sua publicação,
So that o link público represente uma escolha consciente sobre uma revisão específica.

**Acceptance Criteria:**

**Given** Snapshot aprovado, elegibilidade vigente e Consentimento válido
**When** o dono revisa a prévia e confirma opt-in
**Then** publicação vincula `Character.id` + Snapshot aprovado e só então o endpoint público responde com allowlist
**And** aprovação isolada não publica; `CHANGES_REQUIRED`, nova submissão/aprovação ou perda de campanha/participação/Consentimento/elegibilidade suspende/invalida opt-in e exige nova confirmação.

### Story 6.3: Revogar e indisponibilizar o Perfil

**Requisitos:** FR-28

As a Dono,
I want revogar o Perfil sem excluir o Personagem,
So that eu interrompa a exposição futura controlada pela plataforma.

**Acceptance Criteria:**

**Given** Perfil Público ativo
**When** o dono confirma revogação
**Then** o estado é persistido, endpoint passa a indisponível e caches controlados/CDN são invalidados conforme contrato
**And** o sistema informa que cópias externas não podem ser recolhidas; retry é idempotente, auditoria/retensão seguem política jurídica e nenhuma versão anterior permanece acessível.

### Story 6.4: Gerar e compartilhar Story do mesmo Snapshot

**Requisitos:** FR-29

As a Dono com Perfil ativo,
I want criar uma composição vertical e compartilhar ou baixar,
So that eu divulgue meu Guardião sem incluir dados privados ou revisão diferente.

**Acceptance Criteria:**

**Given** Perfil ativo e Carta cujo `sourceSnapshotId` coincide com o Snapshot publicado
**When** a prévia de Story é gerada
**Then** mostra imagem, nome, marca, handle, hashtag e destino allowlisted antes da ação
**And** revogação/mismatch bloqueiam; `navigator.share`/`canShare` são progressive enhancement, download é fallback, cancelamento não publica e nenhum ID/URL privada é embutido.

### Story 6.5: Provar privacidade do compartilhamento público

**Requisitos:** FR-28–FR-29

As a Product Owner,
I want evidência negativa de autorização e cache,
So that o Piloto não exponha Ficha privada por erro de integração.

**Acceptance Criteria:**

**Given** sentinelas em Segredo, feedback, e-mail, narrativa privada e IDs
**When** opt-in, leitura pública, Story, revogação, nova revisão e perda de elegibilidade são testados com contas distintas
**Then** somente campos nominalmente permitidos aparecem em DOM, rede, arquivo e cache
**And** acesso por ID trocado, Perfil nunca publicado/revogado e Snapshot incompatível falham fechados; revisão jurídica e política de imagem estão aprovadas antes de habilitar externamente.

## Épico 7: Operar o Piloto sem acesso excessivo

O Administrador acompanha funil, participantes, legado e custos com dados mínimos, estados canônicos e um shell limitado às tarefas do Piloto.

### Story 7.1: Limitar o shell administrativo ao Piloto

**Requisitos:** FR-34

As a Administrador do Piloto,
I want ver apenas navegação operacional relevante,
So that módulos legados não confundam nem ampliem meu acesso.

**Acceptance Criteria:**

**Given** conta ADMIN autenticada
**When** abre o shell administrativo
**Then** vê Visão geral, Revisões, Participantes, Uso/custos e Configurações permitidas
**And** Monstros, Missões, Loja, PvP, rankings, trocas, recompensas, criar Mesa/entrar por código ficam fora de menus/CTAs; “ver como Participante” é explícito e não concede MASTER.

### Story 7.2: Consultar funil e pendências reais

**Requisitos:** FR-30

As a Administrador do Piloto,
I want visualizar contagens e pendências por etapa,
So that eu saiba onde agir sem abrir Fichas desnecessariamente.

**Acceptance Criteria:**

**Given** DTO mínimo de operação validado em runtime
**When** a Visão geral é carregada ou filtrada
**Then** contagens distinguem Consentimento, criação, submissão, revisão, Pesquisa e conclusão conforme estado persistido
**And** erro/ausência não vira zero; funil não reutiliza payload de lista/revisão/Analytics e reconcilia com Participantes/fila nos cenários E2E.

### Story 7.3: Buscar e consultar Participantes com minimização

**Requisitos:** FR-31

As a Administrador do Piloto,
I want buscar, filtrar e paginar Participantes,
So that eu resolva pendências usando somente os dados necessários.

**Acceptance Criteria:**

**Given** acesso administrativo vigente ao `pilot-v1`
**When** lista, busca, filtro, paginação e detalhe são usados
**Then** lista recebe identificação/estado mínimos e o detalhe só obtém Snapshot quando há capability contextual
**And** lista/detalhe/funil compartilham estado canônico; acesso negado não renderiza dados e payload privilegiado não é reutilizado.

### Story 7.4: Adaptar ou excluir Personagem legado com auditoria

**Requisitos:** FR-32

As a Administrador autorizado,
I want tratar Personagens legados com confirmação,
So that o Piloto migre casos antigos sem perda silenciosa nem exclusão acidental.

**Acceptance Criteria:**

**Given** Personagem em `LEGACY_REVIEW` e capability específica
**When** adaptar é confirmado
**Then** preserva referência anterior e cria Rascunho não confirmado na versão vigente
**And** excluir exige autorização global específica, motivo e diálogo acessível; ser MASTER não basta, autor/impacto são exibidos e ação fica auditada/idempotente.

### Story 7.5: Analisar uso e custos de IA

**Requisitos:** FR-33

As a Administrador do Piloto,
I want filtrar resumo, série e detalhamento de IA,
So that eu acompanhe orçamento e falhas sem acessar conteúdo criativo.

**Acceptance Criteria:**

**Given** telemetria allowlisted disponível
**When** filtros de período, caso de uso, provedor, modelo e status são aplicados
**Then** resumo, série e detalhamento usam micros de USD e intervalo/timezone consistentes
**And** BRL é estimativa com taxa/fonte/data, não precificado fica fora do total, erro não vira zero e nenhum prompt/Ficha/narrativa/Pesquisa aparece.

### Story 7.6: Comprovar autorização e coerência operacional

**Requisitos:** FR-30–FR-34

As a Product Owner,
I want uma matriz integrada da operação,
So that o Piloto seja aberto somente quando papéis, estados e superfícies concordarem.

**Acceptance Criteria:**

**Given** contas distintas de Participante, ADMIN atribuído/não atribuído, MASTER de outra Mesa e usuário removido
**When** fila, revisão, funil, Participantes, legado e custos são exercitados com backend/banco reais
**Then** `401/403/409`, autorrevisão, ID trocado, membership e atribuição são validados pelo backend e nenhuma UI vazada antecede a negação
**And** evidência registra papel, HTTP, persistência, caches, rota e DOM sem credenciais; lint/typecheck/build ou mocks isolados não substituem a matriz.
