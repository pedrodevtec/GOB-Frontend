# Verificação de cobertura — PRD/addendum × jornadas reconciliadas

Data: 27 de agosto de 2026.

## Resultado executivo

O `prd.md` e o `addendum.md` incorporam a maior parte das jornadas de `reconcile-user-journeys.md`: entrada, retomada, Builder manual/IA, submissão, ajustes, aprovação, Pesquisa Final, conclusão, artefatos, operação e legado estão representados. As quatro jornadas UJ cobrem corretamente o caminho feliz e os FR-1 a FR-27 e FR-30 a FR-33 possuem correspondência material com pelo menos um cenário reconciliado.

A cobertura ainda não é suficiente para declarar o PRD verificável ponta a ponta por quatro motivos:

1. os 16 IDs E2E da reconciliação não foram preservados no PRD nem no addendum;
2. existe conflito de autoridade entre `ADMIN` e `MASTER` no fluxo de revisão;
3. `LEGACY_REVIEW` e `BLOCKED` foram listados, mas suas lacunas reais de roteamento não foram convertidas em decisão ou aceite;
4. Perfil Público e compartilhamento para Story foram adicionados ao PRD sem cenário E2E equivalente na matriz reconciliada.

Status recomendado desta verificação: **COBERTURA FUNCIONAL ALTA, RASTREABILIDADE E2E PARCIAL, 1 CONFLITO CRÍTICO ABERTO**.

## Cobertura confirmada das jornadas

| Jornada do PRD | Evidência correspondente na reconciliação | Situação |
|---|---|---|
| UJ-1 — entrada e criação manual | P1–P3, P5; E2E-P01, E2E-P04 e E2E-P05 | Confirmada para o fluxo descrito. |
| UJ-2 — retomada e IA opcional | P3–P4; E2E-P02, E2E-P03, E2E-P04 e E2E-S02 | Confirmada, inclusive fallback manual e conflito de revisão. |
| UJ-3 — operação de revisão | A1–A3, P6; E2E-M01, E2E-P06, E2E-M02 e E2E-A01 | Coberta funcionalmente; autorização do revisor está em conflito. |
| UJ-4 — pesquisa, conclusão e artefatos | P6–P7; E2E-P07, E2E-P08 e E2E-P09 | Parcial: pesquisa, conclusão, arte e downloads cobertos; Perfil Público e Story não. |

### Cobertura confirmada por grupo de FR

| Requisitos | Cenários reconciliados | Avaliação |
|---|---|---|
| FR-1 a FR-5 — entrada segura | E2E-P01, E2E-S01 | Cobertos; casos finos de token, consentimento e membership estão apenas na lista de edge cases. |
| FR-6 a FR-8 — estado e retomada | E2E-P01, P02, P06–P08, S01 e S02 | Cobertos; `LEGACY_REVIEW`/`BLOCKED` permanecem sem aceite específico. |
| FR-9 a FR-14 — Builder e ficha | E2E-P02, P04 e P05 | Cobertos, incluindo versão, 12 Atributos, Vigor/Espírito, Treinamentos e revisão canônica. |
| FR-15 a FR-17 — IA assistiva | E2E-P03, P04 e P05 | Cobertos, incluindo cinco blocos, decisão explícita e caminho manual. |
| FR-18 — telemetria | E2E-A01 e inspeção exigida pelo addendum | Parcial: custo/uso cobertos; ausência de conteúdo proibido não tem ID próprio. |
| FR-19 a FR-21 — submissão e ajustes | E2E-P04, M01, P06, M02 e S02 | Cobertos. |
| FR-22 — aprovação por escopo | E2E-M01, M02 e S01 | Cenários existem, mas a regra de autoridade é contraditória. |
| FR-23 — e-mails | E2E-M01, M02 e N01 | Coberto, incluindo falha tolerante. |
| FR-24 e FR-25 — pesquisa/conclusão | E2E-P06, P07 e P08 | Cobertos antes/depois da aprovação e após ajustes. |
| FR-26 e FR-27 — arte/downloads | E2E-P09 | Cobertos, sujeito à decisão de evento liberador. |
| FR-28 e FR-29 — Perfil Público/Story | Nenhum | Ausentes da reconciliação e da validação mínima do addendum. |
| FR-30 e FR-31 — operação/participantes | E2E-A01 | Cobertos. |
| FR-32 — legado | E2E-A02 | Coberto para adaptar/excluir; roteamento de `LEGACY_REVIEW` não. |
| FR-33 — uso/custos | E2E-A01 | Coberto. |
| FR-34 — navegação reduzida | E2E-S01 apenas por inferência | Parcial: não há verificação explícita de menus/CTAs ocultos e “ver como Participante”. |

## Conflitos

### C-1 — Autoridade para revisar no Piloto — crítico

- A reconciliação afirma que pedido de ajuste e aprovação são decisões de Mestre, que `ADMIN` não implica `MASTER` e que o backend deve rejeitar um `ADMIN` sem membership ativa de Mestre.
- O PRD, em Visão, Glossário e FR-22, afirma que no Piloto o Administrador do Piloto executa e pode aprovar, deixando `MASTER` para Mesas futuras.
- O addendum repete que “o Piloto atual usa operação administrativa para revisão”, mas também preserva a separação `ADMIN`/`MASTER`.
- A UI atual só oferece Revisões dentro de `/admin/*`, portanto uma conta apenas `MASTER` não alcança a tela; isso não resolve qual papel o endpoint aceita.

Decisão necessária: declarar uma das regras abaixo e alinhar contrato, tela e E2E-S01:

1. **Administrador-revisor do Piloto:** `ADMIN` pode revisar especificamente `pilot-v1`, sem adquirir papel `MASTER`; ou
2. **Mestre contextual:** toda revisão exige membership `MASTER` ativa, e o operador do Piloto precisa acumular `ADMIN` + `MASTER` enquanto a entrada separada não existe.

Até essa decisão, FR-22 e UJ-3 não têm aceite inequívoco.

### C-2 — Evento que libera Retrato/Carta — médio

- O código reconciliado libera a experiência visual depois da Pesquisa Final e permite gerar enquanto a Ficha aguarda o Mestre.
- UJ-4 narra geração “após a aprovação”.
- FR-26 diz “após a etapa definida pelo backend”.
- Questão aberta 6 reconhece que o evento ainda não foi decidido.

O PRD não deve usar UJ-4 como aceite de “aprovação obrigatória” enquanto FR-26 permanecer agnóstico. E2E-P07/P09 deve ser parametrizado pelo evento canônico escolhido.

### C-3 — Revisão do próprio Personagem — médio

- A reconciliação trata a proibição como comportamento obrigatório e E2E-S01 a testa.
- A UI atual bloqueia a ação quando `ownerUserId` coincide.
- FR-22 ainda marca a regra como `[ASSUMPTION]` e a questão aberta 5 pede confirmação do backend.

Não é seguro considerar a proteção de UI como aceite. A regra precisa ser confirmada no contrato e retornar `403`/erro de domínio no E2E.

## Gaps de jornada e estado

| Gap | Onde aparece | O que falta no PRD/addendum |
|---|---|---|
| JG-1 — `LEGACY_REVIEW` pode entrar em loop | Addendum lista o estado; reconcile registra CTA para Builder, cuja guarda não aceita o estado | Decisão de `nextRoute`, pré-condição de adaptação e aceite que prove ausência de loop. |
| JG-2 — `BLOCKED` sem rota | FR-6 fala em bloqueio recuperável e addendum lista o estado | Superfície/CTA de recuperação para campanha encerrada, membership removida ou `nextRoute` ausente. |
| JG-3 — configurações do Piloto | Reconciliação A4 inclui `/admin/piloto/configuracoes`; PRD apenas lista a superfície em §8.3 | FR e E2E para editar apresentação/publicar/encerrar apenas em transições permitidas, ou remoção explícita do escopo. |
| JG-4 — Perfil Público aprovado | FR-28 e UJ-4 adicionam publicação/revogação | Jornada concreta, contrato de visibilidade/allowlist, evento de publicação, revogação e E2E. |
| JG-5 — compartilhamento para Story | FR-29 e UJ-4 adicionam compartilhamento | E2E em dispositivo compatível + fallback de download, confirmação do conteúdo público e falha segura. |

## IDs e aceites ausentes

O addendum enumera por nome os cenários da reconciliação, mas não preserva os IDs nem suas evidências mínimas. O PRD referencia apenas uma “matriz E2E” genérica em SM-5. Assim, estes 16 IDs estão ausentes dos dois documentos como referências rastreáveis:

- Participante: `E2E-P01` a `E2E-P09`;
- Mestre/revisor: `E2E-M01` e `E2E-M02`;
- Administração: `E2E-A01` e `E2E-A02`;
- segurança/consistência: `E2E-S01` e `E2E-S02`;
- notificações: `E2E-N01`.

O addendum preserva a regra geral de evidência — conta/papel, estado, HTTP, persistência, rota e visual —, mas perde os resultados específicos esperados de cada ID. Para fechar a rastreabilidade, o PRD ou addendum deve apontar nominalmente para `reconcile-user-journeys.md` como matriz normativa ou incorporar uma tabela `FR → E2E`.

### Novos aceites necessários para o escopo atual do PRD

| ID proposto | Necessidade | Resultado mínimo |
|---|---|---|
| `E2E-P10` | Perfil Público aprovado | Somente aprovado pode publicar; preview mostra allowlist; perfil público não contém e-mail, IDs internos, feedback, Segredo ou dados técnicos; revogação segue decisão de produto. |
| `E2E-P11` | Story | Composição vertical contém apenas dados permitidos; Web Share é oferecido quando suportado; download funciona como fallback; nenhuma publicação ocorre automaticamente. |
| `E2E-A03` | Configurações do Piloto | Estados `DRAFT`/`ACTIVE`/`CLOSED` habilitam apenas edições/transições permitidas e refletem imediatamente na landing e nos bloqueios da jornada. |
| `E2E-S03` | Privacidade de browser/Analytics | Inspeção de Network e eventos comprova ausência de Segredo, prompt integral, narrativa/Ficha completa, Pesquisa Final, token e credencial. |
| `E2E-S04` | Estados críticos e acessibilidade | Loading, erro, vazio, `401`, `403`, sessão expirada, teclado, foco, zoom e movimento reduzido são verificados nas rotas críticas em desktop/mobile. |
| `E2E-S05` | Estados sem rota comum | `LEGACY_REVIEW`, `BLOCKED` e ausência de `nextRoute` chegam a uma ação segura e não produzem redirect loop. |

### Aceites existentes que precisam ficar explícitos, não apenas agregados

- token ausente, inválido, expirado e reenvio com `returnTo` preservado;
- consentimento com versão alterada/revogado e falha de persistência;
- `join` duplicado, mesa cheia, membership `INVITED`/`REMOVED` e campanha `CLOSED`;
- Contexto Público ausente sem lore inventada;
- workflow incompleto e `CHANGES_REQUESTED` sem `editable: true`;
- IA com timeout, resposta parcial, sugestão vazia e proposta não confirmada;
- dupla submissão, dupla decisão e revisão concorrente com `409`;
- atualização da Pesquisa Final sem duplicação;
- limite esgotado/imagem existente/falha de download;
- PDF com nome longo, múltiplas páginas e nenhum campo interno;
- menus e CTAs de módulos futuros ausentes do Piloto.

## Cobertura das oito decisões abertas da reconciliação

| Decisão original | Situação em PRD/addendum |
|---|---|
| Status permanece `PARCIAL` até E2E | Confirmada no addendum e em Riscos/SM-5. |
| Acesso Mestre/Admin | Não resolvida e contraditória; conflito C-1. |
| Corrigir `LEGACY_REVIEW` | Não resolvida; apenas o enum foi documentado. |
| Tratar `BLOCKED` sem rota | Parcial em FR-6; experiência concreta e E2E ausentes. |
| Limite de carta por variante | Resolvida por FR-26 e §6.1: um Retrato e uma Carta, disponibilidade por variante no backend. |
| E-mail sem outbox no Piloto | Confirmada como fora do escopo em §6.2. |
| PDF local, não oficial | Confirmada em FR-27 e §6.2. |
| Módulos futuros fora do escopo | Confirmada em FR-34, Não objetivos e §6.2; falta aceite explícito de navegação. |

## Ajustes mínimos recomendados antes de baselinar

1. Resolver C-1 e reescrever FR-22/UJ-3/addendum com uma única regra de autoridade.
2. Referenciar formalmente os 16 IDs existentes e adicionar uma matriz `FR → E2E`.
3. Adicionar `E2E-P10`, `E2E-P11`, `E2E-S03` e `E2E-S05`; adicionar `E2E-A03` se Configurações permanecer em escopo.
4. Converter `LEGACY_REVIEW` e `BLOCKED` em decisões testáveis de rota/recuperação.
5. Alinhar UJ-4 ao evento de liberação escolhido para Retrato/Carta.
6. Manter o status geral como **PARCIAL** até executar e registrar a matriz integrada completa.
