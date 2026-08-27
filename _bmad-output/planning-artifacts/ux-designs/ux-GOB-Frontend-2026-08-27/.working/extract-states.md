# Extração UX — estados, comportamento e guardrails

Data: 27 de agosto de 2026.

Fontes: `prd.md`, `addendum.md`, `reconcile-user-journeys.md`, `features/mvp/`, `lib/campaign/` e `lib/routing/`. O backend é a fonte de verdade para estado, transição, autorização, configuração e limites. O código registra a experiência atual; requisitos do PRD que ainda não têm comprovação E2E são marcados abaixo como **requerido**, não como implementado.

## 1. Modelo de estado

Não derivar a jornada a partir do status da ficha. `journeyState` + `nextRoute` governam rota e retomada; os estados de campanha, conta, consentimento, membership, ficha, IA, salvamento e artefato governam apenas o comportamento dentro da etapa.

### 1.1 Estados canônicos da jornada

| Estado | Significado humano | Destino/ação canônica | Regra de interação |
|---|---|---|---|
| e-mail pendente | Conta criada, confirmação ausente | `/confirmar-email`; confirmar ou reenviar | Token ausente mantém pendência; inválido/expirado mostra erro recuperável. |
| `CONSENT_REQUIRED` | Consentimento vigente ainda não aceito | `/campanhas/{slug}/consentimento` | Nada é aceito automaticamente. |
| `JOIN_REQUIRED` | Consentimento aceito, sem participação ativa | Consentimento/entrada; executar `join` | Somente membership `ACTIVE` libera criação. |
| `CONTEXT_REQUIRED` | Participação ativa, contexto ainda pendente | `/campanhas/{slug}/episodio-1` | Mostrar apenas contexto público recebido; ausência bloqueia criação. |
| `CHARACTER_DRAFT` | Rascunho editável | `/campanhas/{slug}/personagem` | Builder e revisão aceitam o estado. |
| `CHANGES_REQUIRED` | Mestre pediu ajustes antes da pesquisa | Builder, revisão e ressubmissão | Feedback visível; editar só com `editable: true`. |
| `SURVEY_REQUIRED` | Ficha submetida ou aprovada, pesquisa pendente | `/campanhas/{slug}/pesquisa` | Pesquisa e revisão aceitam o estado. |
| `COMPLETED_PENDING_REVIEW` | Pesquisa concluída; ficha ainda submetida | Conclusão e acompanhamento | Separar “participação concluída” de “aguardando Mestre”. |
| `COMPLETED_CHANGES_REQUIRED` | Pesquisa concluída; Mestre pediu ajustes | Builder, revisão e ressubmissão | Pesquisa continua concluída e única. |
| `COMPLETED_APPROVED` | Pesquisa concluída e ficha aprovada | Conclusão e consulta | Ficha, artefatos e próxima ação disponíveis conforme contrato. |
| `LEGACY_REVIEW` | Personagem antigo requer adaptação | Ação administrativa antes da retomada | Lacuna atual: CTA aponta ao Builder, mas sua guarda não aceita o estado; evitar loop. |
| `BLOCKED` | Campanha, vínculo ou transição indisponível | Mensagem/ação ou `nextRoute` do backend | Nenhuma etapa de conteúdo aceita diretamente; ausência de rota deve gerar bloqueio recuperável. |

Regra universal: rota incompatível consulta `resume` e substitui pela `nextRoute`. Falha de `resume`, estado ausente ou ausência de `nextRoute` não autoriza avanço otimista nem adivinha etapa.

### 1.2 Estados de domínio que modulam a interface

| Dimensão | Estados evidenciados | Consequência UX |
|---|---|---|
| Campanha | `DRAFT`, `ACTIVE`, `CLOSED` | Só `ACTIVE` permite iniciar/retomar; rascunho, encerrada ou inexistente não revelam conteúdo protegido. |
| Consentimento | ausente, `ACCEPTED`, `DECLINED`, `REVOKED`; versão alterada/indisponível | Aceite explícito e versionado; revogação/recusa/versão nova voltam à decisão apropriada, sem aceite implícito. |
| Membership | ausente, `INVITED`, `ACTIVE`, `REMOVED` | Só `ACTIVE` libera criação; duplicidade, remoção, mesa cheia ou encerramento são estados bloqueados/recuperáveis. |
| Ficha (`sheetStatus`) | `DRAFT`, `SUBMITTED`, `CHANGES_REQUESTED`, `APPROVED`, fallback `WORKFLOW_UNAVAILABLE` | `DRAFT` e `CHANGES_REQUESTED` podem enviar se válidos e editáveis; `SUBMITTED`/`APPROVED` são somente leitura; workflow ausente bloqueia edição/submissão insegura. |
| Ação recomendada | `EDIT_CHARACTER`, `UPDATE_CHARACTER`, `WAIT_APPROVAL`, `VIEW_CHARACTER` | Exibir como “Continuar criando”, “Revisar os ajustes pedidos”, “Aguardar a avaliação do Mestre” e “Ver personagem”; desconhecido cai em “Continue sua jornada”. |
| Salvamento do Builder | `idle`, `saving`, `saved`, `error` | Estado perceptível; erro preserva dados e pede nova tentativa antes de sair. Não salvar antes de existir nome ou com proposta de IA pendente. |
| Sugestão de IA local | `pending`, `applying`, `applied`, `discarded`, `error` | Desabilitar ações concorrentes; permitir editar, aplicar, desfazer localmente ou descartar; erro não bloqueia edição manual. |
| Decisão persistida de IA | `ACCEPTED`, `EDITED`, `DISCARDED` | Toda sugestão requer decisão explícita; geração não equivale a aplicação ou persistência. |
| Sugestão recebida | `GENERATED` | Deve permanecer proposta até decisão do jogador. |
| Proposta mecânica | cinco blocos sem decisão/decididos | Arquétipo, atributos, Traits, treinamentos e equipamentos são independentes; todos precisam ser aplicados ou descartados antes de confirmar/salvar. |
| Revisão concorrente | revisão vigente / `409` obsoleto | Preservar conteúdo local quando aplicável, informar versão mais nova e pedir sincronização; nunca duplicar submissão/decisão. |
| Pesquisa | ausente / existente e editável / somente leitura após encerramento | `PUT` cria ou atualiza sem duplicar; “Não usei IA” é válido; pedido de ajustes não reabre a pesquisa. |
| Artefato por variante | disponível, gerando, existente, limite esgotado, erro | `PORTRAIT` e `PLAYABLE_CARD` têm limites próprios do backend; existente/sem saldo desabilita nova geração; erro preserva ficha e jornada. |
| Perfil Público | inelegível, elegível não publicado, publicado, revogado/inativado | Aprovação não publica; opt-in explícito, allowlist e snapshot aprovado. Perda de elegibilidade invalida opt-in; nova aprovação exige novo opt-in. |

## 2. Matriz de estados de interface

Aplicar estes estados às superfícies críticas sem transformar cada variação em feature separada.

| Estado transversal | Tratamento consolidado | Evidência atual / obrigação |
|---|---|---|
| Hidratando/autenticando | Loader com ação descrita; não piscar conteúdo protegido | `JourneyRouteGuard` usa “Localizando sua próxima etapa” e “Redirecionando para entrar”. |
| Carregando dados | Loader ou `MvpState loading` com objeto da espera nomeado | Implementado em campanha, consentimento, Builder, revisão, pesquisa, conclusão e filas. |
| Sessão ausente/expirada | Redirecionar a login com `returnTo` interno; progresso persistido permanece | Implementado em guardas e superfícies; validação/revogação real de sessão ainda é gate técnico antes do piloto externo. |
| Acesso negado | Explicar pré-condição ou autoridade ausente; não renderizar dados protegidos | Implementado em algumas superfícies; backend deve confirmar `401/403`. |
| Erro recuperável | Mensagem honesta, afirmar preservação somente quando garantida, oferecer retry quando possível | Guardas e vários painéis já fazem isso; UX deve padronizar ação de retry. |
| Vazio legítimo | Explicar que não há itens e o que acontecerá depois; zero é diferente de erro | Fila vazia e personagem ausente já têm estados; painel não pode converter falha em zero. |
| Bloqueado por contrato | Mostrar indisponibilidade e ação segura; nunca liberar por inferência | Aplica a workflow/configuração ausente, contexto ausente, `BLOCKED` e `LEGACY_REVIEW`. |
| Somente leitura | Manter conteúdo consultável, remover/desabilitar mutações e explicar por quê | `SUBMITTED`, `APPROVED`, configuração antiga indisponível e pesquisa após encerramento. |
| Validação | Erros associados ao campo, resumo do que falta e CTA desabilitado | Builder usa `aria-invalid`; revisão lista faltantes. Requer foco no primeiro erro e associação programática completa. |
| Em processamento | Desabilitar ação duplicada e trocar rótulo por verbo em andamento | Evidenciado em consentimento/join, envio, IA, pesquisa e geração visual. |
| Sucesso persistido | Atualizar estado canônico/invalidar consulta e mostrar próxima ação | Submissão leva à pesquisa; decisão do Mestre remove item da fila; pesquisa leva à conclusão. |
| Conflito `409` | Não sobrescrever silenciosamente; preservar local, sincronizar e reapresentar decisão | Requerido para salvamento, sugestão, submissão e revisão. |
| Falha periférica | Manter fluxo central utilizável | IA, e-mail, geração visual e download não podem corromper estado nem bloquear caminho manual. |

## 3. Padrões comportamentais

| Situação | Padrão obrigatório |
|---|---|
| Entrada e retomada | Preservar `returnTo` apenas se for caminho interno; alternar login/cadastro sem perdê-lo. `resume` determina a etapa após autenticação, refresh e novo login. |
| Início do Builder | Consultar personagem existente; criar um único rascunho se ausente; navegar só depois da persistência. Repetição após falha é idempotente. |
| Progresso | Etapas visíveis: boas-vindas, consentimento, contexto, criação, revisão, pesquisa e conclusão; status visual `pending`, `current`, `complete`, `blocked`. |
| Builder | Quatro capítulos visíveis: contar a história, confirmar o personagem, definir como quer jogar e revisar. Blocos confirmados separadamente; capítulo incompleto não apaga os demais. |
| Mecânica | Exatamente 12 pontos de atributos conforme limites, ao menos 1 em Vigor ou Espírito, quantidade configurada de treinamentos e catálogos versionados. Não inventar item/Defesa. |
| Salvamento | PATCH parcial; omitir vazios/blocos inválidos; indicar salvando/salvo/erro. Personagem existente preserva `builderConfigVersion`. |
| Envio | Mostrar a ficha canônica, faltantes e confirmação explícita; enviar `expectedRevision`; criar snapshot imutável. Duplo clique/revisão obsoleta não duplica. |
| Ajustes | Mostrar comentário do Mestre; habilitar edição apenas com `editable: true`; ressubmeter nova revisão preservando histórico e pesquisa existente. |
| Conclusão | Mostrar separadamente “participação/pesquisa concluída” e “estado da revisão”; ajustes posteriores reabrem Builder, não desfazem conclusão da pesquisa. |
| Geração visual | Prévia antes da geração; clique explícito; limites por variante recebidos do backend; arte pessoal gerada por IA, não Cânone/arte oficial. Download e retry conforme disponibilidade. |
| Operação | Funil, lista, fila e detalhe usam o mesmo estado canônico. Erro não vira zero. Fila mostra apenas `SUBMITTED` e snapshot da última submissão. |
| Ação destrutiva | Adaptação/exclusão de legado exigem autorização; exclusão exige motivo, confirmação e auditoria. |

## 4. IA assistiva

| Princípio | Comportamento verificável |
|---|---|
| Opcional | O fluxo manual é completo sem IA, em timeout, erro, limite ou indisponibilidade. |
| Sob demanda | Geração ocorre somente após ação explícita por campo/capítulo, proposta mecânica ou artefato. |
| Contextual e restrita | Usa contexto autorizado; backend aplica allowlist por caso de uso; no máximo uma pergunta complementar; não acessa Segredo do Mestre nem inventa Cânone/regra. |
| Decisão humana | Jogador aceita, edita ou descarta. Nada gerado é aplicado ou salvo automaticamente; aplicação é ação separada e pode ser desfeita localmente antes de persistir. |
| Proposta mecânica | Cinco blocos independentes; todos decididos antes da confirmação. A proposta respeita configuração versionada e narrativa confirmada. |
| Recuperação | Resposta parcial destaca o que chegou e o que falta; sugestão vazia/erro mantém campos manuais; `409` preserva local e pede sincronização. |
| Transparência | Textos apresentam IA como ajuda opcional. Imagem é identificada como arte pessoal gerada por IA; não mostrar prompt interno nem segredo. |
| Telemetria | Registrar caso de uso, status, modelo, tokens, custo e decisão; nunca prompt integral, narrativa/ficha completa, pesquisa, credencial ou segredo. |
| Métrica de sucesso | Não maximizar chamadas/aceites; sucesso é autoria reconhecível e conclusão, inclusive sem IA. |

## 5. Autorização e visibilidade

| Ator/capacidade | Pode | Não pode / condição |
|---|---|---|
| Visitante | Ver landing pública da campanha `ACTIVE`, autenticação e superfícies públicas permitidas | Subetapas da campanha não são públicas; `(public)` é apenas route group. |
| Participante autenticado + membership `ACTIVE` | Acessar a própria etapa, próprio personagem, pesquisa e artefatos conforme `journeyState` | Não acessar ficha de outro usuário, conteúdo administrativo ou Segredo do Mestre. |
| Dono do Personagem | Editar rascunho quando `editable`, submeter, atualizar própria pesquisa, optar/revogar Perfil Público elegível | Não editar `SUBMITTED`/`APPROVED`, publicar automaticamente ou recolher cópias externas já baixadas. |
| `MASTER` ativo da Mesa | Revisar snapshot submetido de outro usuário, pedir ajustes ou aprovar | Não revisar o próprio personagem; membership inativa nega; ser Mestre não autoriza legado/admin global. |
| `ADMIN` global | Entrar no shell administrativo e executar ações globais explicitamente autorizadas, como legado | Não herda `MASTER`; fora de `pilot-v1` não revisa por ser Admin. |
| Administrador do `pilot-v1` | Revisar por capacidade excepcional, com atribuição ativa, permissão explícita e checagem backend por campanha | Não recebe papel `MASTER`; remoção da atribuição invalida acesso; autorrevisão proibida. |
| Mestre sem `ADMIN` no frontend atual | Autoridade contextual pode existir no backend | Lacuna atual: não alcança `/admin/piloto/revisoes`; não inferir permissão nem criar entrada sem decisão de arquitetura/produto. |

Visibilidade mínima: landing não revela lore secreta/ficha/admin; operação recebe identificação e estado mínimos; fila recebe snapshot somente do selecionado e autorizado; Perfil Público usa DTO/allowlist próprios e exclui e-mail, IDs, feedback, ficha privada, histórico e segredo. Botão oculto nunca substitui autorização no backend.

## 6. Acessibilidade e responsividade

### 6.1 Critério requerido pelo PRD

| Tema | Critério |
|---|---|
| Norma/contraste | Rotas críticas WCAG 2.2 AA; 4,5:1 para texto comum, 3:1 para texto grande e gráficos essenciais. |
| Teclado/foco | Toda tarefa por teclado; foco visível; ordem coerente; skip link/landmarks; foco no primeiro erro. |
| Controles/formulário | Alvo mínimo 44 × 44 CSS px; rótulos e erros programaticamente associados. |
| Semântica de estado | Texto e ícone além de cor para estado, IA, aprovação e erro; nenhum enum/endpoint/payload exposto ao participante. |
| Zoom/movimento | Sem perda, sobreposição ou scroll horizontal comum em 200%; respeitar `prefers-reduced-motion`. |
| Largura/dispositivo | Rotas críticas desde 320 CSS px, testadas em 360/375 px, tablet e desktop, sem orientação obrigatória. |
| Interação móvel | Nada depende de hover; teclado virtual, barras fixas e safe areas não cobrem campo, erro ou CTA; progresso e ação do Builder permanecem alcançáveis. |
| Artefatos móveis | Testar Story, Retrato, Carta e PDF em aparelho real: cancelamento, ausência de `canShare` e fallback de download. |

### 6.2 Evidência no código e lacunas de validação

| Evidência atual | Leitura para UX |
|---|---|
| Layouts usam empilhamento móvel e breakpoints `sm`/`md`/`lg`; CTAs frequentemente ocupam largura total ou reorganizam a ordem. | Há intenção responsiva, mas isso não comprova 320 px, zoom, safe area ou teclado virtual. |
| Builder usa `aria-invalid`, `aria-live="polite"`, `aria-busy`, labels e foco visível em vários controles; imagens decorativas usam `aria-hidden`; imagens de personagem têm `alt`. | Preservar e completar associação erro-campo, anúncio de estados e foco no primeiro erro. |
| Botões principais usam `min-h-11`/`h-11` em vários pontos. | Aproxima 44 px, mas deve ser auditado em todos os controles, inclusive ícones, opções e links. |
| Progresso da pergunta tem `aria-label`; estados não dependem apenas de cor em textos/badges. | Manter equivalentes textuais e não codificar significado apenas na paleta. |
| Não há evidência nas fontes de auditoria completa de landmarks/skip link, `prefers-reduced-motion`, zoom 200% ou dispositivo móvel real. | Tratar como critério de aceite pendente, não como capacidade comprovada. |

## 7. Edge cases consolidados por família

| Família | Casos que uma mesma estratégia de estado deve cobrir |
|---|---|
| Disponibilidade/entrada | Campanha inexistente, `DRAFT`, `CLOSED`; e-mail/token ausente, inválido ou expirado; `returnTo` externo/malformado; troca login/cadastro. |
| Consentimento/participação | Documento indisponível ou nova versão; aceito, recusado, revogado; `join` repetido; membership `INVITED`/`REMOVED`; mesa cheia/campanha encerrada. |
| Roteamento/sessão | Refresh, logout, sessão expirada e novo login em toda etapa; rota incompatível; `BLOCKED`; estado/`nextRoute` ausente; evitar redirecionamento circular. |
| Contexto/configuração | Contexto público ausente; workflow incompleto; configuração versionada ausente/retirada; recuperação somente leitura ou migração explícita. |
| Persistência | Criação repetida, salvamento parcial/automático/erro, vazios e inválidos; conflito `409`; nunca duplicar personagem, submissão ou pesquisa nem apagar válido. |
| IA | Provedor indisponível, timeout, parcial, vazio, limite; sugestão/proposta pendente; tentativa de salvar antes de decidir; caminho manual sempre aberto. |
| Revisão | Incompleta, dupla submissão, edição após envio/aprovação, revisão obsoleta; autorrevisão, Mestre inativo, Admin sem autoridade, Mestre sem entrada UI; decisões concorrentes. |
| Pesquisa/notificação | Pesquisa existente atualizada sem duplicar; continua concluída após ajustes; falha de cada e-mail não reverte transição. |
| Artefatos/compartilhamento | Provedor/armazenamento ausente, limite esgotado, imagem existente, download falho; PDF longo sem truncar/internos; share cancelado/indisponível; perfil perde elegibilidade. |
| Legado/operação | Adaptação preserva referência e volta a rascunho não confirmado; exclusão com motivo/autorização/auditoria; erro de API não vira contador zero. |
| Apresentação | Loading, erro, vazio, acesso negado e sessão expirada claros em desktop/mobile; conteúdo longo, nomes longos e zoom sem perda. |

## 8. Restrições para o EXPERIENCE.md

- Não transformar edge case em nova tela por padrão; primeiro reutilizar os estados transversais: loading, vazio, erro recuperável, sessão expirada, acesso negado, bloqueado, somente leitura, conflito e sucesso.
- Não expor termos internos. `player-journey.ts` já traduz status de ficha e próxima ação; estados desconhecidos usam fallback humano.
- Não confundir conclusão da pesquisa, aprovação da ficha, elegibilidade do Perfil Público e geração dos artefatos: são dimensões independentes.
- Não afirmar produção validada. O frontend está parcial para ambiente real e a matriz E2E integrada ainda não foi executada.
- Não colocar no MVP combate, rolagens, sessão, Crônica, espectador, criação de Mesas ou menus legados.
