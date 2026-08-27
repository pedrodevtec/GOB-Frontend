# Extração factual — jornadas e superfícies UX

Fontes exclusivas desta extração:

- `prd.md` final;
- `addendum.md`;
- `reconcile-user-journeys.md`.

Esta extração não resolve lacunas nem adiciona comportamento. O backend permanece fonte de verdade para autenticação, papéis, membership, estados, transições, autorização, configuração do Builder, limites de geração e `nextRoute`. A validação integrada ainda não foi executada; o estado do produto continua **PARCIAL para ambiente real**.

## Inventário de superfícies

### Públicas

| Superfície | Chegada factual | Propósito factual | Fechamento/saída factual |
|---|---|---|---|
| Landing do produto | Navegação pública | Apresentar o produto | Não detalhado nas fontes reconciliadas. |
| Landing da campanha `/campanhas/{slug}` | Link do Piloto; única etapa da campanha pública sem sessão | Explicar proposta, status, etapas e ações disponíveis, sem expor segredo, dados de participantes ou conteúdo administrativo | CTA para cadastro ou login com `returnTo` preservado; campanha inexistente, indisponível ou encerrada mostra estado seguro. |
| Cadastro e login | CTA da landing ou redirecionamento de rota protegida | Criar sessão ou reentrar na jornada | Retorno à campanha de origem; destino externo ou malformado é rejeitado; sessão expirada oferece reentrada sem apagar progresso persistido. |
| Confirmação de e-mail `/confirmar-email?returnTo=...` | Cadastro sem token de sessão | Confirmar e-mail ou reenviar confirmação | Sucesso libera **“Continuar”** para `returnTo`; token ausente mantém pendência; inválido/expirado oferece reenvio. |
| Termos e privacidade | Acesso público e apoio ao Consentimento | Informar tratamento, fornecedores, retenção e direitos antes do convite externo | Não detalhado além do aceite/recusa/revogação do Consentimento. |
| Perfil Público | Link publicado por opt-in do dono após aprovação | Exibir somente recorte permitido do último Snapshot aprovado | Revogação ou perda de elegibilidade torna o link indisponível; recuperação/nova aprovação exige novo opt-in. |

### Participante

| Superfície | Chegada factual | Propósito factual | Fechamento/saída factual |
|---|---|---|---|
| Consentimento `/campanhas/{slug}/consentimento` | `resume` retorna `CONSENT_REQUIRED` ou entrada ainda necessária | Consultar e aceitar explicitamente o Consentimento vigente; criar/retomar membership | **“Li e quero participar”** registra aceite; apenas membership `ACTIVE` permite seguir; falha de persistência bloqueia avanço. |
| Contexto `/campanhas/{slug}/episodio-1` | `CONTEXT_REQUIRED` | Mostrar somente Contexto Público (`world.title`, `world.summary`, `world.tone`) necessário à criação | **“Criar meu personagem”** retoma ou cria um único Rascunho antes de navegar; contexto ausente bloqueia a criação com mensagem clara. |
| Minha Jornada | Entrada autenticada/retomada | Apresentar estado, feedback, artefatos e próxima ação canônica | Conduz à próxima rota permitida, sem confundir conta e Personagem. |
| Builder `/campanhas/{slug}/personagem` | `CHARACTER_DRAFT`, `CHANGES_REQUIRED` ou `COMPLETED_CHANGES_REQUIRED`; retomada pelo mesmo `Character.id` e `builderConfigVersion` | Contar a história, confirmar o Personagem, definir como quer jogar e preparar a Ficha | Avança à Revisão quando narrativa, confirmações e mecânicas estão válidas; falhas de IA não bloqueiam o caminho manual. |
| Revisão `/campanhas/{slug}/personagem/revisao` | Builder válido ou consulta em estado compatível | Exibir a Ficha canônica somente leitura e validar completude | Confirmação explícita cria Snapshot imutável, estado `SUBMITTED` e segue para Pesquisa Final; incompletude, não editabilidade ou workflow inseguro bloqueiam envio. |
| Pesquisa Final `/campanhas/{slug}/pesquisa` | `SURVEY_REQUIRED`, `COMPLETED_PENDING_REVIEW` ou `COMPLETED_APPROVED` | Criar ou atualizar resposta versionada após submissão | Salvar leva à Conclusão; pesquisa permanece concluída após pedido posterior de ajustes. |
| Conclusão `/campanhas/{slug}/conclusao` | `COMPLETED_PENDING_REVIEW` ou `COMPLETED_APPROVED` após Pesquisa Final | Separar participação concluída da situação da revisão; liberar Retrato, Carta Jogável e PDF | Mantém acesso à consulta e aos artefatos; falha visual ou de download não desfaz conclusão; ajuste posterior reabre Builder sem apagar Pesquisa. |
| Meu Personagem | Consulta/retomada autenticada | Reunir Ficha, feedback, Carta e próxima ação | Mantém leitura canônica e conduz à ação permitida; não é Perfil da conta. |
| Perfil da conta | Navegação autenticada | Dados da conta | Deve permanecer distinto do Perfil do Personagem. |

### Administrador do Piloto

| Superfície | Chegada factual | Propósito factual | Fechamento/saída factual |
|---|---|---|---|
| Visão geral `/admin/piloto` | Conta autenticada com papel global `ADMIN` | Mostrar funil real, pendências e contagens acionáveis | Pendências conduzem às áreas operacionais; erro de API não vira zero nem métrica inventada. |
| Revisões `/admin/piloto/revisoes` | Shell `/admin/*`; capacidade excepcional requer atribuição ativa e permissão explícita em `pilot-v1`, validada pelo backend | Ver itens `SUBMITTED`, abrir o último Snapshot e decidir sobre Personagem de outro usuário | **“Pedir ajustes”** produz `CHANGES_REQUESTED`; **“Aprovar”** produz `APPROVED`; sucesso remove item da fila; conflito, papel inadequado, inatividade ou autorrevisão não aplicam decisão. |
| Participantes `/admin/piloto/participantes` | Navegação administrativa | Buscar, filtrar, paginar e inspecionar estado operacional mínimo | **“Adaptar ao modelo atual”** devolve Rascunho não confirmado; **“Excluir personagem”** exige motivo e confirmação e remove com auditoria. |
| Configurações `/admin/piloto/configuracoes` | Navegação administrativa | Editar apenas apresentação e transições compatíveis do Piloto | CRUDs futuros permanecem fora da navegação. |
| Uso/custos `/admin/ai-usage` | Navegação administrativa | Filtrar resumo, série temporal e detalhamento por período, caso de uso, provedor, modelo, status e mesa | Custos sem preço permanecem sinalizados e fora do total; BRL é estimativa com taxa, fonte e data. |

## UJ-1. Lucas cria seu primeiro Personagem sem conhecer RPG.

> Lucas recebe o link do Piloto no celular. Ele entende a proposta, cria a conta, confirma o e-mail, aceita o Consentimento e conhece apenas o Contexto Público necessário. Conta em três blocos quem é seu Personagem, confirma a interpretação e escolhe preencher a parte mecânica manualmente. A Ficha mostra o que falta e por quê. Lucas revisa, envia e sabe que o Administrador do Piloto fará a revisão. O valor chega quando ele vê uma Ficha coerente que reconhece como sua, não um Personagem pronto entregue pelo sistema.

### Propósito

Levar um Participante iniciante do convite a uma Ficha autoral, válida e revisável, sem exigir conhecimento prévio de RPG, sistema D20 ou lore completa.

### Caminho de chegada e superfícies

1. Link do Piloto no celular → landing `/campanhas/{slug}`.
2. Cadastro/login com `returnTo` preservado → confirmação de e-mail → **“Continuar”**.
3. Consentimento → **“Li e quero participar”** → entrada idempotente.
4. Contexto Público `/episodio-1` → **“Criar meu personagem”**.
5. Builder: contar a história → confirmar o Personagem → definir como quer jogar → revisar.
6. Revisão canônica somente leitura → confirmação explícita → submissão.
7. Pesquisa Final e Conclusão, conforme o estado persistido.

### Etapas, clímax e falhas factuais

- Etapas narrativas: três perguntas amplas; confirmação separada de identidade, motivações e Marca.
- Etapa mecânica manual: Arquétipo, 12 pontos de Atributos dentro dos limites, ao menos 1 ponto em Vigor ou Espírito, quantidade exata de Treinamentos, Trait positiva, Trait negativa e Equipamentos do catálogo.
- Clímax declarado pela jornada: Lucas reconhece como sua uma Ficha coerente, em vez de receber um Personagem pronto.
- Falhas/recuperação: campanha indisponível mostra estado seguro; token inválido/expirado oferece reenvio; Consentimento não persistido bloqueia; contexto ausente bloqueia sem inventar lore; ação repetida não duplica Personagem; salvamento e conflito preservam progresso; submissão incompleta permanece bloqueada.

### Microcopy obrigatória ou controlada

- **“Continuar”** após confirmação do e-mail.
- **“Li e quero participar”** no Consentimento.
- **“Criar meu personagem”** no Contexto Público.
- Estados em linguagem humana: pendência de e-mail, Consentimento, contexto, Rascunho, aguardando revisão, ajustes, aprovado e concluído.
- A Ficha deve explicar o que falta e por quê; não pode expor enums, payloads ou nomes internos.

### Surface closure

- Fechamento primário: Snapshot submetido e transição para `/campanhas/{slug}/pesquisa`.
- O Participante deve saber que o Administrador do Piloto fará a revisão em `pilot-v1`.
- A Ficha submetida fica somente leitura; reabrir Revisão não cria novo envio.
- Pesquisa salva conduz à Conclusão, que separa participação concluída do estado da revisão.

## UJ-2. Bianca retoma o rascunho e usa IA sem perder autoria.

> Bianca já conhece RPG, interrompe a criação no computador e volta pelo celular. A jornada recupera o mesmo Rascunho e a mesma versão do Builder. Ela pede uma Sugestão de IA para um campo, edita a proposta e descarta outra; nada é gravado antes de sua confirmação. Depois aplica ou descarta cada bloco da Proposta Mecânica, revisa e envia. Se a IA falhar, Bianca continua manualmente sem perder progresso.

### Propósito

Provar retomada cross-device e ajuda opcional da IA sem substituir autoria nem bloquear o caminho manual.

### Caminho de chegada e superfícies

1. Retorno pelo celular após interrupção no computador.
2. Login/retomada → `resume` e `GET .../characters/me` recuperam o mesmo `Character.id`, revisão e `builderConfigVersion`.
3. Builder no progresso salvo.
4. Ajuda por campo/capítulo e Proposta Mecânica.
5. Revisão canônica → submissão → Pesquisa Final.

### Etapas, clímax e falhas factuais

- Para cada Sugestão de IA: gerar por ação explícita; aceitar, editar ou descartar; em campos, desfazer aplicação local antes da persistência.
- Para a Proposta Mecânica: decidir separadamente Arquétipo, Atributos, Traits, Treinamentos e Equipamentos; todos os cinco blocos precisam ser aplicados ou descartados antes de confirmar e salvar.
- Clímax declarado pela jornada: Bianca revisa e envia com autoria preservada; nada gerado entra na Ficha por simples geração.
- Falhas/recuperação: IA indisponível, timeout, limite, resposta parcial ou vazia mantém edição manual; conflito `409` preserva estado local e pede sincronização; refresh, logout e novo login restauram progresso; configuração antiga indisponível abre recuperação somente leitura até restauração ou migração explícita e confirmada.

### Microcopy obrigatória ou controlada

- IA deve ser descrita como **ajuda opcional**.
- Decisões explícitas: **aceitar**, **editar**, **descartar** e, para campos antes da persistência, **desfazer**.
- Falha da IA deve apresentar retorno recuperável e manter o caminho manual utilizável.
- Salvamento em andamento, sucesso e falha devem ser perceptíveis.

### Surface closure

- Fechamento primário: todos os blocos de IA decididos, Ficha revisada e Snapshot submetido.
- Falha da IA não altera o fechamento: Bianca pode concluir manualmente.
- Retomada deve sempre reabrir o mesmo Personagem e a mesma versão do Builder; não há segunda verdade local.

## UJ-3. Rafael opera a revisão do Piloto.

> Rafael entra como Administrador do Piloto, vê a fila real de Fichas submetidas e abre o Snapshot confirmado de Lucas. Ele pede um ajuste com comentário e revisão esperada. Lucas recebe o retorno, corrige e reenvia; Rafael aprova a nova revisão. O valor chega quando a fila, o estado persistido e a próxima ação do Participante concordam, sem Rafael precisar interpretar payloads técnicos.

### Propósito

Permitir operação e revisão humana do `pilot-v1`, mantendo Snapshot, fila, estado persistido e próxima ação coerentes e separando `ADMIN` global de `MASTER` contextual.

### Caminho de chegada e superfícies

1. Conta autenticada com acesso administrativo → visão geral `/admin/piloto`.
2. Pendência de revisão → `/admin/piloto/revisoes`.
3. Fila mostra somente itens `SUBMITTED` → abertura do último Snapshot confirmado.
4. **“Pedir ajustes”** com motivo e `expectedRevision`.
5. Participante recebe feedback → Builder, Revisão e ressubmissão.
6. Nova revisão volta à fila → **“Aprovar”** com `expectedRevision`.
7. Visão geral, Participantes e Uso/custos apoiam acompanhamento operacional.

### Etapas, clímax e falhas factuais

- Capacidade excepcional no `pilot-v1`: exige atribuição ativa, permissão explícita e validação backend por campanha; não concede papel `MASTER`.
- Pedido de ajustes: comentário obrigatório; estado `CHANGES_REQUESTED`; Participante só edita se backend devolver `editable: true`; histórico e Pesquisa Final já respondida são preservados.
- Aprovação: estado `APPROVED`; item sai da fila após invalidação.
- Clímax declarado pela jornada: fila, estado persistido e próxima ação concordam sem leitura de payload técnico.
- Falhas/recuperação: autorrevisão, papel inadequado, membership inativa, atribuição removida e revisão obsoleta não aplicam decisão; conflito `409` mantém versão persistida íntegra; falha de e-mail não reverte submissão, ajuste ou aprovação; erro operacional de API não vira zero.

### Microcopy obrigatória ou controlada

- **“Pedir ajustes”** exige motivo textual.
- **“Aprovar”** exige revisão esperada.
- Na autorrevisão, a UI pede outro Mestre.
- Estados e pendências devem ser funcionais e legíveis, sem enums ou payloads técnicos.
- Mensagens operacionais ao dono: Ficha enviada, ajustes solicitados e aprovação; sem marketing, Segredo do Mestre ou credenciais.

### Surface closure

- Fechamento de ajuste: item deixa a decisão atual, Participante recebe próxima ação de corrigir e ressubmeter, e nova revisão pode retornar à fila.
- Fechamento de aprovação: item removido da fila e Personagem em `APPROVED`.
- Estado vazio real é mostrado como vazio/zero; falha de carregamento permanece erro, não conclusão falsa.

## UJ-4. Camila conclui e compartilha seu Guardião.

> Camila responde a Pesquisa Final enquanto sua Ficha ainda aguarda revisão e chega à Conclusão sem uma mensagem enganosa de aprovação. A Pesquisa Final libera a geração explícita de um Retrato e uma Carta Jogável e o download do PDF. Depois da aprovação, Camila opta por publicar o Perfil Público e gerar a imagem de Story. Antes de publicar, entende o recorte, a atualização e a revogação do link. Falha na geração ou no compartilhamento não desfaz a conclusão.

### Propósito

Encerrar o teste de forma honesta, entregar artefatos persistentes e permitir compartilhamento informado somente quando o Personagem estiver aprovado.

### Caminho de chegada e superfícies

1. Ficha `SUBMITTED` ou `APPROVED` com pesquisa pendente → Pesquisa Final `/campanhas/{slug}/pesquisa`.
2. Salvar/atualizar resposta → Conclusão `/campanhas/{slug}/conclusao`.
3. Conclusão separa Pesquisa concluída de estado da revisão.
4. Após Pesquisa: prévia da geração → clique explícito → um Retrato e uma Carta Jogável conforme disponibilidade/limite por variante; download de imagens e PDF.
5. Após aprovação: opt-in explícito para Perfil Público.
6. Perfil ativo no mesmo Snapshot aprovado → prévia e geração/download da composição de Story.

### Etapas, clímax e falhas factuais

- Pesquisa pode ocorrer antes da aprovação; **“Não usei IA”** é resposta válida; atualização não duplica resposta.
- Conclusão em `COMPLETED_PENDING_REVIEW` não pode parecer aprovação; em `COMPLETED_APPROVED`, consulta e Meu Personagem ficam disponíveis.
- Geração visual ocorre somente por ação explícita, não condiciona submissão, aprovação ou conclusão e identifica o resultado como arte pessoal gerada por IA, não arte oficial ou Cânone.
- Perfil Público mostra allowlist do último Snapshot aprovado; publicação exige opt-in; nova revisão exige nova confirmação.
- Story oferece compartilhamento nativo quando compatível e download como fallback; não publica automaticamente.
- Clímax declarado pela jornada: Camila conclui sem mensagem enganosa, recebe Retrato, Carta e PDF e, após aprovação, controla o compartilhamento.
- Falhas/recuperação: falha de geração preserva Ficha/jornada e permite nova tentativa quando autorizada; limite esgotado ou imagem existente respeita contrato; falha de download/compartilhamento não desfaz conclusão; revogação ou perda de elegibilidade indisponibiliza o Perfil; arquivos externos já baixados/republicados não podem ser recolhidos.

### Microcopy obrigatória ou controlada

- Estado E2E obrigatório enquanto aguarda decisão: **“Aguardando o Mestre”**.
- **“Não usei IA”** é opção válida na Pesquisa Final.
- Antes de gerar: prévia/parecer do uso da imagem e ação explícita de confirmação.
- Artefato: identificação como **arte pessoal gerada por IA**, não arte oficial ou Cânone.
- Antes de publicar: informar campos públicos, atualização, revogação, retenção e o limite de recolhimento de cópias externas.
- Prévia de Story: imagem, nome, marca da campanha, handle, hashtag e destino.

### Surface closure

- Fechamento da participação: Pesquisa Final salva e Conclusão acessível, independentemente do tempo da aprovação.
- Fechamento da revisão pendente: situação exibida separadamente como **“Aguardando o Mestre”**, com acompanhamento posterior.
- Fechamento dos artefatos: imagem persistida permanece na galeria após refresh; Retrato, Carta e PDF podem ser baixados.
- Fechamento do Perfil: opt-in ativa o link; revogação o torna indisponível e invalida caches controlados.
- Fechamento do Story: compartilhamento nativo ou download; nenhuma publicação automática.

## Microcopy transversal obrigatória

- Português claro, acolhedor e direto; sem termos técnicos de implementação.
- Cada etapa responde: onde estou, por que isso importa, o que posso fazer, quando a IA ajuda e o que acontece depois.
- IA é **ajuda opcional**; aprovação é atribuída à pessoa correta.
- Rótulos e valores da Ficha são os mesmos em Revisão, Perfil e Conclusão.
- Perfil da conta e Perfil do Personagem não podem ser tratados como a mesma superfície.
- Cor não é o único meio de informar estado ou ação.
- Nenhuma rota pode exibir mojibake, texto sem acentuação intencional ou sinônimo conflitante com o Glossário.
- Loading, erro, vazio, acesso negado e sessão expirada têm retorno claro em desktop e mobile.

## Fechamentos e lacunas que permanecem explícitos

- Rota incompatível deve consultar `resume` e usar `nextRoute`; falha de `resume` mantém estado recuperável e não adivinha etapa.
- `BLOCKED` depende de `nextRoute`/mensagem do backend, mas ainda não possui superfície de conteúdo própria definida.
- `LEGACY_REVIEW` exige adaptação administrativa antes da edição; existe lacuna entre CTA e guarda atual do Builder.
- Uma conta apenas `MASTER`, sem `ADMIN`, não alcança Revisões pela UI atual; o PRD final define capacidade excepcional do `pilot-v1`, mas não autoriza inferir papéis.
- O backend deve devolver limites de Retrato e Carta por variante; a UI não decide regra comercial.
- PDF é fotografia local, não documento oficial imutável.
- Combate, rolagens, condução de sessões, Crônica da Mesa, espectador, jogo físico e módulos legados/futuros ficam fora destas jornadas.
