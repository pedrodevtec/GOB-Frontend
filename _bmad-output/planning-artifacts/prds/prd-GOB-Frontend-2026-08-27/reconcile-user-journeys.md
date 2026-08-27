# Reconciliação de jornadas, estados e aceite E2E

Data da reconciliação: 27 de agosto de 2026.

## Objetivo e fonte de verdade

Este documento reconcilia a experiência efetivamente implementada em `features/mvp/` e nas rotas de `app/` com `docs/pilot-e2e-matrix.md`, `docs/mvp-pilot-manual-checklist.md` e `docs/playtest-status-2026-08-14.md`. Ele deve orientar a seção de jornadas e os critérios de aceite do PRD, sem promover funcionalidades legadas ou futuras ao escopo do piloto.

Quando as fontes divergem, vale a seguinte leitura:

1. o backend é a fonte de verdade para autenticação, papéis, membership, transições, `journeyState`, `nextRoute` e persistência;
2. o código atual demonstra a experiência disponível e os contratos consumidos;
3. `playtest-status-2026-08-14.md` descreve a entrega atual, ainda classificada como **PARCIAL para ambiente real**;
4. `mvp-pilot-manual-checklist.md` é um registro anterior de validação defensiva, no qual vários contratos ainda eram deliberadamente tratados como pendentes; seus itens continuam úteis para regressão de estados vazios e de erro, mas não representam a capacidade atual completa.

Não há evidência de E2E integrado executado. Typecheck, lint, build e testes isolados não substituem a comprovação com contas reais, API e banco.

## Atores e fronteiras

### Participante

Pessoa convidada para o playtest que cria e confirma a própria conta, aceita o consentimento, entra na campanha, cria um personagem manualmente ou com ajuda opcional de IA, submete a ficha, responde ao Mestre quando necessário, conclui a pesquisa e consulta ficha, PDF e carta.

### Administrador e Mestre

São capacidades diferentes e não devem ser fundidas no requisito de autorização:

- `ADMIN` é papel global e libera o shell `/admin/*` no frontend atual;
- `MASTER` é papel da mesa e deve ser derivado de membership ativa, `currentUserRole` ou `isMaster`, sempre conforme o backend;
- ser `ADMIN` não torna a pessoa Mestre da mesa;
- aprovação e pedido de ajustes são decisões do Mestre sobre personagem de outro usuário;
- adaptação e exclusão de personagem legado são ações exclusivas de `ADMIN`.

O piloto atual expõe Revisões dentro do shell global de `ADMIN`. O backend ainda deve rejeitar qualquer decisão sem vínculo ativo de Mestre. Uma conta apenas `MASTER`, sem papel global `ADMIN`, não alcança essa tela pela UI atual; isso é uma lacuna de acesso a resolver ou assumir explicitamente no PRD, não uma permissão implícita.

## Jornada ponta a ponta do Participante

### P1. Descoberta, cadastro e confirmação

1. O participante abre `/campanhas/{slug}`, que é a única etapa da campanha publicamente acessível sem sessão.
2. A landing consome `GET /api/v1/campaigns/public/{slug}` e não revela lore secreta, ficha completa ou conteúdo administrativo.
3. O CTA leva a cadastro ou login preservando `returnTo`; alternar entre ambos não pode perder o destino. Caminhos externos ou inseguros em `returnTo` são rejeitados.
4. O cadastro sem token de sessão leva a `/confirmar-email?returnTo=...`.
5. A confirmação com token chama `POST /api/v1/auth/email-verification/confirm`. Sucesso libera “Continuar” para o `returnTo`; token ausente mantém estado pendente; token inválido ou expirado mostra erro e oferece reenvio por `POST /api/v1/auth/email-verification/resend`.
6. Uma rota protegida sem sessão redireciona para `/login?returnTo=...`; sessão expirada oferece reentrada sem descartar progresso persistido.

### P2. Consentimento, entrada e contexto

1. Após autenticação, `GET /api/v1/campaigns/public/{slug}/resume` determina a etapa real.
2. Em `CONSENT_REQUIRED`, `/campanhas/{slug}/consentimento` carrega o texto vigente por `GET /api/v1/campaigns/public/consent`.
3. “Li e quero participar” registra explicitamente `ACCEPTED` e a origem `campaign_public_flow` em `POST /api/v1/campaigns/public/{slug}/consent`. Nada é aceito automaticamente.
4. Depois do consentimento, ou diretamente em `JOIN_REQUIRED`, `POST /api/v1/campaigns/public/{slug}/join` cria/retoma a membership. Apenas membership `ACTIVE` libera a criação.
5. Em `CONTEXT_REQUIRED`, `/campanhas/{slug}/episodio-1` exibe somente `world.title`, `world.summary` e `world.tone` recebidos da campanha pública. A interface não inventa lore.
6. “Criar meu personagem” primeiro consulta `GET /api/v1/tables/{tableId}/characters/me`; retoma o personagem existente ou cria um único rascunho por `POST /api/v1/tables/{tableId}/characters`, e só então navega para o Builder.

### P3. Criação e retomada do personagem

1. `CHARACTER_DRAFT`, `CHANGES_REQUIRED` e `COMPLETED_CHANGES_REQUIRED` liberam `/campanhas/{slug}/personagem`.
2. O Builder usa a versão vinculada ao personagem (`builderConfigVersion`) ou, apenas para personagem novo, a configuração ativa. O catálogo não é codificado na página.
3. A experiência narrativa atual possui quatro capítulos visíveis: contar a história, confirmar o personagem, definir como quer jogar e revisar.
4. O participante responde três perguntas narrativas amplas, revisa os campos derivados e confirma separadamente os blocos de identidade, motivações e Marca.
5. A ficha mecânica exige arquétipo, exatamente 12 pontos de atributos dentro dos limites configurados, pelo menos 1 ponto em Vigor ou Espírito, a quantidade exata de treinamentos da configuração, Trait positiva, Trait negativa e equipamentos aplicáveis.
6. Rascunhos são salvos em partes por `PATCH /api/v1/tables/{tableId}/characters/{characterId}`. Valores vazios ou blocos mecânicos inválidos são omitidos; o salvamento automático ocorre após pausa, mas não antes de existir nome nem enquanto houver proposta de IA aguardando decisão.
7. Refresh, logout e novo login devem restaurar os mesmos dados e revisão por `resume` e `GET .../characters/me`, sem duplicar personagem nem apagar capítulos incompletos.
8. Em `CHANGES_REQUESTED`, o feedback do Mestre é exibido e a edição só é liberada quando o contrato devolve `editable: true`. Ausência ou inconsistência de workflow bloqueia submissão de forma segura.

### P4. Ajuda opcional de IA

1. O fluxo manual permanece completo quando a IA não é usada ou está indisponível.
2. Sugestões por capítulo usam a revisão persistida do personagem em `POST .../ai/chapter-suggestions`; uma proposta mecânica usa `POST .../ai/mechanical-proposal`.
3. Nenhum conteúdo gerado entra na ficha por simples geração. Para cada sugestão, o participante pode aceitar, editar, descartar e, para campos, desfazer a aplicação local.
4. A proposta mecânica é decidida em cinco blocos independentes: arquétipo, atributos, Traits, treinamentos e equipamentos. Todos devem ser aplicados ou descartados antes da confirmação e do salvamento.
5. Decisões são registradas por `PATCH .../ai/suggestions/{suggestionId}` como `ACCEPTED`, `EDITED` ou `DISCARDED`.
6. Conflito de revisão `409` preserva o estado local e pede nova sincronização. Falha parcial ou total do provedor mostra retorno recuperável e mantém a edição manual utilizável.
7. A IA pode fazer no máximo uma pergunta complementar quando faltar informação e não decide canon, conteúdo secreto ou escolhas pelo participante.

### P5. Revisão, envio e espera

1. `/campanhas/{slug}/personagem/revisao` apresenta a ficha canônica em modo somente leitura e valida o formulário completo.
2. O envio fica desabilitado se faltarem campos, se o workflow estiver incompleto, se o personagem não estiver editável ou se o estado não for `DRAFT`/`CHANGES_REQUESTED`.
3. Após confirmação explícita, `POST /api/v1/tables/{tableId}/characters/{characterId}/submit` envia `expectedRevision` e cria uma submissão imutável. O estado esperado é `SUBMITTED` e a rota seguinte é `/campanhas/{slug}/pesquisa`.
4. Uma ficha `SUBMITTED` ou `APPROVED` é somente leitura. Reabrir a revisão não pode criar nova submissão ou editar a versão enviada.
5. O envio dispara e-mail operacional ao dono quando configurado; falha do provedor é registrada e não reverte a transição persistida.

### P6. Pesquisa, ajustes e ressubmissão

1. `SURVEY_REQUIRED`, `COMPLETED_PENDING_REVIEW` e `COMPLETED_APPROVED` liberam `/campanhas/{slug}/pesquisa`.
2. A página obtém a configuração e a resposta atual por `GET /api/v1/campaigns/public/final-survey` e `GET .../{slug}/final-survey/me`.
3. `PUT .../{slug}/final-survey/me` cria ou atualiza a resposta. “Não usei IA” é uma resposta válida; relato de violação do limite da IA aceita detalhe opcional.
4. Ao salvar, a rota final é `/campanhas/{slug}/conclusao`. Se a ficha ainda aguarda Mestre, o estado é `COMPLETED_PENDING_REVIEW`; se aprovada, `COMPLETED_APPROVED`.
5. Se o Mestre pedir ajustes depois da pesquisa, o estado é `COMPLETED_CHANGES_REQUIRED`; a pesquisa permanece concluída, o participante edita, revisa e ressubmete com nova `expectedRevision`.
6. Pedido de ajuste e aprovação disparam seus respectivos e-mails operacionais ao dono, sem desfazer a transição se a entrega falhar.

### P7. Conclusão e consulta posterior

1. `/campanhas/{slug}/conclusao` aceita apenas `COMPLETED_PENDING_REVIEW` e `COMPLETED_APPROVED`.
2. A conclusão mostra separadamente pesquisa concluída e situação do Mestre; a pesquisa pode ser concluída antes da aprovação.
3. O participante pode pré-visualizar o parecer/prompt da imagem, mas a geração só acontece após clique explícito.
4. A galeria e os limites por variante vêm do backend. O fallback atual admite uma geração `PORTRAIT` e uma `PLAYABLE_CARD`; uma imagem existente desabilita nova geração daquela variante.
5. Falha de geração preserva jornada e ficha, permitindo nova tentativa. Imagem persistida pode ser visualizada e baixada.
6. A ficha completa pode ser baixada como PDF A4 no navegador, sem endpoint adicional e sem incluir feedback do Mestre, revisão, enums ou payloads internos.
7. “Minha Jornada” e “Meu Personagem” retomam estado, feedback, ficha, carta e próxima ação sem confundir perfil da conta com personagem.

## Jornada ponta a ponta do Administrador/Mestre

### A1. Acompanhar o piloto

1. Uma conta autenticada com papel global `ADMIN` abre `/admin/piloto`.
2. O frontend localiza `pilot-v1` por `GET /api/v1/campaigns/admin/by-slug/{slug}` e carrega `GET /api/v1/campaigns/admin/{campaignId}/operations`.
3. A visão geral deriva do payload real: inscritos, e-mails confirmados, consentimentos, personagens iniciados/aprovados, pesquisas, pendências do participante, submissões para o Mestre e legados.
4. Contadores vazios são zero/estado vazio; erro de API não vira métrica inventada. Nenhuma visão agrega segredo ou ficha completa em analytics.

### A2. Revisar como Mestre

1. `/admin/piloto/revisoes` carrega `GET /api/v1/tables/{tableId}/character-reviews` e mostra apenas itens `SUBMITTED`.
2. A leitura usa o snapshot da última submissão, não o rascunho mutável atual.
3. O Mestre não pode revisar personagem cujo `ownerUserId` seja o seu próprio usuário; a UI pede outro Mestre e o backend deve igualmente negar a ação.
4. “Pedir ajustes” exige motivo textual e `expectedRevision`, chama `POST .../request-changes` e resulta em `CHANGES_REQUESTED`.
5. “Aprovar” exige `expectedRevision`, chama `POST .../approve` e resulta em `APPROVED`.
6. Sucesso remove o item da fila pendente após invalidação. Conflito de revisão, papel inadequado ou membership inativa não podem aplicar decisão.

### A3. Acompanhar participantes e legados

1. `/admin/piloto/participantes` permite busca, filtros, paginação e inspeção compacta de e-mail, consentimento, personagem e pesquisa.
2. Personagem legado aparece em atenção. “Adaptar ao modelo atual” chama `POST .../adapt-legacy`, preserva referências anteriores e devolve rascunho não confirmado na versão vigente.
3. “Excluir personagem” exige motivo e confirmação explícita, chama `DELETE .../characters/{characterId}` e remove o item da operação com auditoria no backend.
4. Adaptação e exclusão devem falhar para não-`ADMIN`; nenhuma dessas ações decorre apenas de ser Mestre.

### A4. Monitorar uso e configurar o piloto

1. `/admin/ai-usage` combina summary, timeseries e breakdown, com filtros de período, caso de uso, provedor, modelo, status e mesa.
2. Custos não precificados são indicados e excluídos do total; BRL é estimativa com taxa, fonte e data, não valor contábil.
3. `/admin/piloto/configuracoes` limita a edição ao escopo do piloto: apresentação em `DRAFT`/`ACTIVE` e transições compatíveis de publicação/encerramento. CRUDs futuros permanecem fora da navegação.

## Estados canônicos e roteamento

| Estado recebido | Significado | Próxima rota/ação esperada | Rotas que aceitam o estado hoje |
|---|---|---|---|
| e-mail pendente | Conta criada sem confirmação | `/confirmar-email`, confirmar ou reenviar | fluxo de confirmação |
| `CONSENT_REQUIRED` | Consentimento vigente não aceito | `/campanhas/{slug}/consentimento` | consentimento |
| `JOIN_REQUIRED` | Consentimento aceito, sem membership ativa | consentimento e entrada | consentimento |
| `CONTEXT_REQUIRED` | Membership ativa, contexto ainda pendente | `/campanhas/{slug}/episodio-1` | episódio 1 |
| `CHARACTER_DRAFT` | Rascunho editável | `/campanhas/{slug}/personagem` | Builder e revisão |
| `CHANGES_REQUIRED` | Ajustes pedidos antes da pesquisa | Builder, revisar e ressubmeter | Builder e revisão |
| `SURVEY_REQUIRED` | Ficha submetida/aprovada, pesquisa pendente | `/campanhas/{slug}/pesquisa` | pesquisa e revisão |
| `COMPLETED_PENDING_REVIEW` | Pesquisa concluída, ficha submetida | conclusão/acompanhar Mestre | conclusão, pesquisa e revisão |
| `COMPLETED_CHANGES_REQUIRED` | Pesquisa concluída, ajustes pedidos | Builder, revisar e ressubmeter | Builder e revisão |
| `COMPLETED_APPROVED` | Pesquisa concluída e ficha aprovada | conclusão e consulta | conclusão, pesquisa e revisão |
| `LEGACY_REVIEW` | Personagem precisa de adaptação/revisão | ação administrativa e posterior retomada | há CTA para Builder, mas a guarda do Builder não aceita o estado |
| `BLOCKED` | Campanha, vínculo ou transição indisponível | `nextRoute`/mensagem definida pelo backend | nenhuma etapa de conteúdo aceita diretamente |

Toda tentativa de abrir etapa incompatível deve consultar `resume` e substituir a rota por `nextRoute`. Se `resume` falhar, a interface deve manter o usuário em estado recuperável, sem adivinhar uma etapa.

## Edge cases obrigatórios

- campanha inexistente, `DRAFT` ou `CLOSED`, sem revelar conteúdo protegido;
- e-mail não confirmado, token ausente, inválido ou expirado, reenvio e retomada de `returnTo`;
- `returnTo` externo/malformado e troca login/cadastro;
- consentimento indisponível, versão alterada, já aceito, revogado ou recusado;
- tentativa de `join` duplicada, membership `INVITED`/`REMOVED`, mesa cheia ou campanha encerrada;
- contexto público ausente: criação permanece bloqueada e lore não é inventada;
- refresh, sessão expirada e novo login em consentimento, rascunho, ajuste, pesquisa e conclusão;
- criação repetida após falha de navegação: retomar rascunho existente, nunca duplicar personagem;
- salvamento parcial, automático em andamento, erro de salvamento e campos vazios/invalidáveis sem apagar dados válidos;
- conflito `409` em salvamento, sugestão, submissão ou revisão, preservando a versão mais nova e o conteúdo local quando aplicável;
- workflow ausente/incompleto em `/characters/me`: exibir indisponibilidade e bloquear edição/submissão insegura;
- `CHANGES_REQUESTED` sem `editable: true`: mostrar feedback, mas bloquear alteração até o backend liberar;
- acesso direto a rota incompatível, ausência de `nextRoute` e `BLOCKED`;
- IA indisponível, timeout, resposta parcial, sugestão vazia e proposta pendente de decisão; criação manual continua;
- tentativa de salvar/aplicar proposta de IA antes de decidir todos os cinco blocos;
- submissão incompleta, dupla submissão, edição após `SUBMITTED`/`APPROVED` e ressubmissão com revisão obsoleta;
- Mestre revisando o próprio personagem, Mestre sem membership ativa, `ADMIN` sem autoridade de Mestre e Mestre sem papel global `ADMIN` na UI atual;
- aprovação ou ajuste concorrente da mesma revisão;
- pesquisa já existente deve ser editável sem criar duplicata; pesquisa continua concluída após pedido de ajustes;
- falha nos três e-mails operacionais não reverte submissão, ajuste ou aprovação;
- geração de carta sem provedor/armazenamento, limite esgotado, imagem já existente e falha no download;
- PDF com dados reais, nomes longos e múltiplas páginas, sem truncar e sem incluir dados internos;
- legado adaptado preserva snapshot/referências e volta como rascunho não confirmado; exclusão exige motivo, autorização e auditoria;
- loading, erro, vazio, acesso negado e sessão expirada possuem retorno claro em desktop e mobile.

## Critérios de aceite E2E integrado

Um cenário só passa quando forem registrados: conta e papel sem credencial, estado inicial consultado, passos, códigos HTTP e endpoints, estado final na API/banco, rota final e evidência visual. Deve ser usado backend real com banco migrado, campanha `pilot-v1` ativa e contas separadas.

| ID | Cenário | Evidência mínima de aceite |
|---|---|---|
| E2E-P01 | Participante novo | Cadastro, confirmação real de e-mail, `resume`, consentimento e `join`; membership `ACTIVE`; criação idempotente do rascunho; estado `CHARACTER_DRAFT`; rota `/campanhas/pilot-v1/personagem`. |
| E2E-P02 | Retomar rascunho | Após refresh, logout e novo login, `resume` + `GET .../characters/me` devolvem mesmo `Character.id`, `builderConfigVersion`, revisão e dados; Builder abre no progresso salvo. |
| E2E-P03 | Criação com IA | Gerar, aceitar, editar e descartar sugestões; decidir os cinco blocos mecânicos; comprovar que nada foi persistido antes da confirmação e que as decisões foram registradas. |
| E2E-P04 | Criação sem IA/falha de IA | Com provedor indisponível, completar narrativa e mecânica manualmente, revisar e submeter; `SUBMITTED`; rota `/campanhas/pilot-v1/pesquisa`. |
| E2E-P05 | Validação do Builder | Bloquear avanço/submissão com narrativa ou confirmações faltantes, atributos diferentes de 12, limites inválidos, Vigor/Espírito ambos zero ou treinamentos em quantidade incorreta; liberar com configuração válida. |
| E2E-M01 | Mestre pede ajuste | Com outro usuário em `SUBMITTED`, ler snapshot da revisão enviada e postar motivo + `expectedRevision`; `CHANGES_REQUESTED`; fila atualizada; e-mail real recebido ou falha tolerante comprovada. |
| E2E-P06 | Participante ressubmete | Novo login, feedback visível, edição liberada, nova revisão submetida; estado `SUBMITTED`; pesquisa anterior continua única e concluída. |
| E2E-M02 | Mestre aprova | Aprovar nova submissão de outro usuário com `expectedRevision`; `APPROVED`; item removido da fila; e-mail real recebido ou falha tolerante comprovada. |
| E2E-P07 | Pesquisa antes da decisão | De `SUBMITTED`, salvar pesquisa; `COMPLETED_PENDING_REVIEW`; conclusão acessível e status “Aguardando o Mestre”. |
| E2E-P08 | Pesquisa após aprovação | De `APPROVED` sem pesquisa, salvar/atualizar resposta; `COMPLETED_APPROVED`; conclusão e Meu Personagem disponíveis. |
| E2E-P09 | Carta e downloads | Pré-visualizar prompt sem gerar; confirmar geração; persistir uma imagem por variante conforme disponibilidade; refresh mantém galeria; baixar imagem e PDF A4 com dados reais e sem campos internos. |
| E2E-A01 | Admin acompanha | Visão geral, Revisões, Participantes e Uso/custos refletem exatamente as contas e chamadas usadas; custos sem preço e conversão BRL são sinalizados corretamente. |
| E2E-A02 | Personagem legado | Admin adapta um legado e comprova referências preservadas + `DRAFT` não confirmado; em outra ficha, exclui com motivo e comprova remoção e auditoria. |
| E2E-S01 | Guardas e autorização | Abrir diretamente todas as etapas incompatíveis e confirmar `nextRoute`; testar `401`, `403`, sessão expirada, campanha encerrada, Mestre sobre ficha própria, Mestre inativo, não-Admin em legado e Admin sem vínculo de Mestre. |
| E2E-S02 | Concorrência e idempotência | Repetir criação, envio e decisão com revisão obsoleta; nenhum personagem/submissão duplicado; `409` claro; versão persistida permanece íntegra. |
| E2E-N01 | Notificações reais | Receber os três e-mails — ficha enviada, ajustes solicitados e personagem aprovado — com links corretos e sem segredo; simular falha do provedor e comprovar que transições não são revertidas. |

Também são obrigatórios refresh e novo login após consentimento, salvamento do rascunho, pedido de ajuste, envio da pesquisa e conclusão. Todos os cenários críticos devem ser repetidos em desktop e mobile.

## Lacunas e decisões para o PRD

1. **Status de validação:** manter o produto como `PARCIAL` até concluir a matriz integrada; não declarar produção validada com evidência local.
2. **Acesso Mestre/Admin:** decidir se todo Mestre operador do piloto também será `ADMIN` ou se Revisões ganhará uma entrada protegida por papel de mesa. Em ambos os casos, a autorização final continua no backend.
3. **`LEGACY_REVIEW`:** alinhar `nextRoute`, CTA de Meu Personagem e guarda do Builder para evitar redirecionamento circular; adaptação administrativa deve preceder edição no modelo vigente.
4. **`BLOCKED` sem rota:** definir uma tela/ação recuperável para campanha encerrada, membership removida ou jornada sem próxima etapa.
5. **Carta por variante:** o status de 14/08 afirma uma geração por personagem, enquanto o código atual modela disponibilidade separada para `PORTRAIT` e `PLAYABLE_CARD`. O PRD deve escolher a regra comercial canônica e o backend deve devolvê-la explicitamente.
6. **E-mail confiável:** para o piloto, envio síncrono tolerante a falha é aceito; retentativa, outbox e painel de entrega permanecem evolução posterior.
7. **Documento oficial:** o PDF atual é uma fotografia local. Imutabilidade e versionamento oficial exigiriam geração no backend e estão fora do comportamento atual.
8. **Fora do escopo:** combate, rolagens, condução de sessões, Crônica da Mesa, espectador, jogo físico e módulos legados/futuros ocultos da navegação.
