# Epic 1 Context: Entrar e retomar o Piloto com segurança

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Permitir que uma pessoa conheça o Piloto, autentique-se, registre Consentimento, ingresse uma única vez e retome sempre a etapa autorizada pelo backend, sem exposição de dados, duplicação ou perda de progresso. Este épico estabelece o caminho de entrada do `pilot-core` e o baseline técnico necessário para que as demais jornadas funcionem sobre dependências suportadas, estado canônico e recuperação segura.

## Stories

- Story 1.1: Corrigir o baseline de segurança do frontend
- Story 1.2: Unificar sessão e autenticação protegida
- Story 1.3: Abrir a campanha e retornar após autenticação
- Story 1.4: Consentir e ingressar sem duplicação
- Story 1.5: Conhecer o contexto e iniciar um único Rascunho
- Story 1.6: Retomar pela rota canônica sem loops

## Requirements & Constraints

- A landing pública explica proposta, status, etapas e ações do Piloto sem incluir dados internos. Cadastro, login e confirmação preservam somente `returnTo` interno validado.
- Consentimento é versionado, explícito e auditável. Recusa não cria aceite; mudança material exige novo aceite; revogação impede novas ações conforme política aprovada.
- Ingresso, retomada e criação inicial são idempotentes. Retry ou concorrência não podem duplicar membership nem Personagem, e a navegação só ocorre após persistência confirmada.
- O backend governa membership, capacidade, `journeyState`, `nextRoute`, revisão, editabilidade e autorização. Estado ausente, desconhecido, incompatível ou bloqueado termina em mensagem humana recuperável, nunca avanço inferido ou loader permanente.
- O Contexto Público contém somente o necessário para iniciar; perguntas específicas do Episódio 1 não integram nem bloqueiam o Builder. O primeiro Rascunho preserva `Character.id`, revisão e `builderConfigVersion`.
- Toda ação protegida depende de autorização vigente do backend. Presença de cookie, localStorage, store ou botão visível não constitui autorização.
- Antes do Piloto externo, a sessão deve ser curta ou revogável, com rotação, logout efetivo e cenários reais de expiração, `401` e `403` comprovados.
- As rotas críticas atendem WCAG 2.2 AA, funcionam por teclado, não comunicam estado apenas por cor, refluentem a 200% e permanecem utilizáveis desde 320 CSS px.
- O baseline precisa usar Next.js e `eslint-config-next` em versão corrigida suportada, tipos React na mesma major do runtime e dependências estáveis em vez de ranges RC legados. Instalação limpa, lint, typecheck e build devem passar sem supressão de erro.

## Technical Decisions

- Preservar módulos por feature em camadas: rota/layout compõe; componente chama hook; hook coordena service e cache; service/mapper encerra o transporte em `lib/api`.
- React Query possui estado remoto; Zustand/localStorage servem apenas a estado local ou efêmero. Sessão será consumida por uma fronteira única definida em ADR conjunta com o backend; o mecanismo legado atual não deve ser ampliado antes dessa decisão.
- `lib/campaign` normaliza respostas de retomada e `lib/routing` retorna `permit | redirect | block` por catálogo seguro de rotas. A UI não sintetiza estado canônico.
- Respostas externas são validadas e mapeadas na fronteira de service; componentes não interpretam envelopes nem usam cast bruto como contrato.
- Erros de autenticação, autorização, conflito, validação e indisponibilidade preservam código/causa técnica na camada de domínio e recebem microcopy na feature.
- Operações remotas não avançam em erro. Estado decisório é relido em mount/focus e após transições; idempotência atômica permanece bloqueada onde o OpenAPI oficial ainda não define o contrato.
- Superfícies protegidas permanecem no transporte browser até a ADR de sessão. Server Components só podem buscar DTOs públicos sem credencial e sem cache privado.

## UX & Interaction Patterns

- A entrada deve responder continuamente: onde a pessoa está, por que a ação importa, o que acontecerá depois e como se recuperar.
- Loading, vazio, bloqueio, validação, processamento, sucesso e conflito usam texto humano e ação segura. Enum, payload ou erro bruto não chegam ao Participante.
- A ação principal previne duplo envio e só confirma avanço após persistência. Foco é visível e restaurado; erro leva ao primeiro campo relacionado.
- Visitante, Participante e Administrador usam shells e allowlists distintos. Rotas legadas permanecem preservadas, mas não reaparecem em menus ou CTAs do Piloto.
- Desktop e celular mantêm paridade funcional; controles têm ao menos 44 × 44 CSS px e nenhuma ação depende de hover ou animação.

## Cross-Story Dependencies

- Story 1.1 é independente e deve preceder o restante do desenvolvimento para estabelecer um runtime suportado.
- Story 1.2 só inicia após ADR frontend/backend e contrato oficial de sessão.
- Stories 1.3 e 1.6 podem avançar usando contratos vigentes sem alterar autenticação ou inventar estados.
- Story 1.4 depende da sessão válida e da política de Consentimento; Story 1.5 depende de membership ativa e de contrato backend atômico para retomar/criar um único Rascunho.
- O Épico 1 habilita todos os demais épicos. Gates ainda abertos não podem ser substituídos por inferência do frontend legado.
