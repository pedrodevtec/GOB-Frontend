---
title: Guardian of Bravantus — Plataforma de Playtest
status: final
created: 2026-08-27
updated: 2026-08-27
---

# PRD: Guardian of Bravantus — Plataforma de Playtest

## 0. Propósito do documento

Este PRD orienta Produto, UX, Arquitetura e criação de histórias para a fatia atual de Guardian of Bravantus: a jornada digital de entrada no playtest e criação, revisão, aprovação e compartilhamento de um Personagem. Os termos controlados estão no Glossário; as capacidades são agrupadas em Features, com Requisitos Funcionais numerados globalmente. Detalhes técnicos brownfield e decisões de implementação ficam em `addendum.md`; premissas ainda não confirmadas aparecem como `[ASSUMPTION]` e são reunidas no índice final.

## 1. Visão

Guardian of Bravantus é um RPG autoral no qual pessoas comuns recebem Marcas ligadas a Almas antigas, mas continuam donas de suas escolhas. A plataforma deve transformar essa fantasia em uma experiência compreensível para quem nunca jogou RPG, sem fazer o Participante sentir que está preenchendo um sistema técnico ou respondendo um questionário sobre uma história pronta.

A aposta do MVP é que uma jornada guiada, retomável e assistida consegue levar o Participante do convite a um Personagem autoral, mecanicamente válido e revisável. A IA reduz a barreira da ficha vazia, traduz narrativa em possibilidades mecânicas e valida coerência; ela não escolhe, não aplica conteúdo automaticamente e não cria Cânone. Durante o `pilot-v1`, o Administrador do Piloto recebe capacidade excepcional e restrita de revisão. Quando a criação de jogos for liberada, essa autoridade pertence ao Mestre da Mesa.

O resultado esperado não é um VTT completo. É evidência confiável de que a criação de Personagem sustenta a fantasia de Bravantus, preserva autonomia, protege Segredos do Mestre e gera uma base sólida para futuras Mesas, Crônica e comunidade.

## 2. Público-alvo

### 2.1 Jobs To Be Done

#### Participante

- Ao receber um convite, entender o que é Bravantus, o que acontecerá no playtest e quais dados serão usados, sem receber spoiler.
- Criar um Personagem coerente mesmo sem conhecer RPG, o sistema D20 ou toda a lore.
- Retomar a jornada exatamente onde parou, sem perder respostas nem criar Personagens duplicados.
- Contar quem é o Personagem em linguagem natural e receber ajuda proporcional, sem ceder autoria à IA.
- Traduzir a história confirmada em Arquétipo, Atributos, Traits, Treinamentos e Equipamentos válidos.
- Revisar o resultado antes do envio, acompanhar ajustes e saber quem toma a decisão final.
- Encerrar o playtest com um Retrato, uma Carta Jogável e uma Ficha em PDF que possa consultar e compartilhar com segurança.

#### Administrador do Piloto e Mestre da Mesa

- Ver quem iniciou, onde cada Participante parou e quais pendências exigem ação, sem acessar conteúdo desnecessário.
- Revisar o Snapshot enviado, pedir ajustes ou aprovar sem reconstruir a Ficha.
- Distinguir operação global de autoridade narrativa: Administrador opera o Piloto; Mestre decide dentro da Mesa.
- Acompanhar adoção, falhas e custo da IA sem registrar prompts integrais, Segredos do Mestre ou conteúdo criativo completo em Analytics.

### 2.2 Não usuários no MVP

- Espectadores e comunidade aberta, que pertencem à futura Crônica e ao Modo Espectador.
- Criadores de campanhas públicas e Mestres configurando novas Mesas; o Piloto atual usa campanha preparada.
- Jogadores buscando combate, rolagens, inventário econômico, PvP, loja ou progressão pós-criação.

### 2.3 Jornadas principais

- **UJ-1. Lucas cria seu primeiro Personagem sem conhecer RPG.** Lucas recebe o link do Piloto no celular. Ele entende a proposta, cria a conta, confirma o e-mail, aceita o Consentimento e conhece apenas o Contexto Público necessário. Conta em três blocos quem é seu Personagem, confirma a interpretação e escolhe preencher a parte mecânica manualmente. A Ficha mostra o que falta e por quê. Lucas revisa, envia e sabe que o Administrador do Piloto fará a revisão. O valor chega quando ele vê uma Ficha coerente que reconhece como sua, não um Personagem pronto entregue pelo sistema.
- **UJ-2. Bianca retoma o rascunho e usa IA sem perder autoria.** Bianca já conhece RPG, interrompe a criação no computador e volta pelo celular. A jornada recupera o mesmo Rascunho e a mesma versão do Builder. Ela pede uma Sugestão de IA para um campo, edita a proposta e descarta outra; nada é gravado antes de sua confirmação. Depois aplica ou descarta cada bloco da Proposta Mecânica, revisa e envia. Se a IA falhar, Bianca continua manualmente sem perder progresso.
- **UJ-3. Rafael opera a revisão do Piloto.** Rafael entra como Administrador do Piloto, vê a fila real de Fichas submetidas e abre o Snapshot confirmado de Lucas. Ele pede um ajuste com comentário e revisão esperada. Lucas recebe o retorno, corrige e reenvia; Rafael aprova a nova revisão. O valor chega quando a fila, o estado persistido e a próxima ação do Participante concordam, sem Rafael precisar interpretar payloads técnicos.
- **UJ-4. Camila conclui e compartilha seu Guardião.** Camila responde a Pesquisa Final enquanto sua Ficha ainda aguarda revisão e chega à Conclusão sem uma mensagem enganosa de aprovação. A Pesquisa Final libera a geração explícita de um Retrato e uma Carta Jogável e o download do PDF. Depois da aprovação, Camila opta por publicar o Perfil Público e gerar a imagem de Story. Antes de publicar, entende o recorte, a atualização e a revogação do link. Falha na geração ou no compartilhamento não desfaz a conclusão.

## 3. Glossário

- **Administrador do Piloto** — Pessoa com papel global `ADMIN` responsável por operar a campanha preparada. Em `pilot-v1`, possui capacidade excepcional de revisão limitada à campanha, sem adquirir papel `MASTER` em qualquer Mesa.
- **Alma** — Presença antiga ligada ao Personagem pela Marca; influencia por memórias, sensações e possibilidades, mas não controla a pessoa atual.
- **Analytics** — Eventos e agregados técnicos usados para medir funil, estado e operação; não incluem conteúdo criativo completo.
- **Atributos** — Seis valores mecânicos do Personagem. No Builder vigente, somam 12 pontos conforme configuração versionada.
- **Arquétipo** — Forma de atuar diante de risco; não define personalidade e permanece independente da Alma.
- **Builder** — Jornada versionada de criação do Personagem, composta por narrativa, confirmações e Ficha Mecânica.
- **Cânone** — Fato reconhecido como verdadeiro. Cânone da Mesa depende do Mestre; Cânone oficial depende do Autor/Product Owner.
- **Carta Jogável** — Artefato visual digital com identidade e informações úteis do Personagem; é pessoal e não canônico.
- **Consentimento** — Aceite versionado, persistido e auditável para participação no Piloto.
- **Contexto Público** — Lore e orientação aprovadas que podem ser mostradas ao Participante sem revelar Segredo do Mestre.
- **Ficha** — Representação única e legível dos dados narrativos e mecânicos confirmados do Personagem; não transforma toda afirmação narrativa em Cânone oficial.
- **IA** — Assistente opcional que explica, sugere, pergunta e propõe, sem decidir, persistir ou aprovar automaticamente.
- **Marca** — Manifestação da ligação entre a pessoa atual e uma Alma, incluindo aparência, reação e consequência narrativa.
- **Mesa** — Contexto de jogo que reúne Participantes e um Mestre; autoridade é contextual à Mesa.
- **Mestre da Mesa** — Papel `MASTER` contextual que revisa e decide sobre Personagens da própria Mesa quando a criação de jogos for liberada.
- **Participante** — Pessoa convidada a realizar o Piloto e proprietária de seu Personagem.
- **Personagem** — Pessoa atual criada pelo Participante, com identidade, história, Marca e Ficha Mecânica próprias.
- **Perfil Público** — Recorte compartilhável de um Personagem aprovado, limitado a campos explicitamente permitidos.
- **Piloto** — Campanha preparada usada para validar a jornada antes de liberar criação ampla de jogos.
- **Pesquisa Final** — Instrumento versionado de feedback que conclui a participação, podendo ocorrer antes da decisão da revisão.
- **Proposta Mecânica** — Sugestão estruturada da IA para Arquétipo, Atributos, Traits, Treinamentos e Equipamentos, decidida em blocos independentes.
- **Rascunho** — Estado editável e privado do Personagem, salvo progressivamente e ligado à versão do Builder em que nasceu.
- **Retrato** — Representação visual pessoal do Personagem, gerada por ação explícita; não é arte oficial nem Cânone.
- **Segredo do Mestre** — Conteúdo restrito que nunca deve chegar ao Participante, ao Perfil Público ou à IA do jogador.
- **Snapshot** — Cópia imutável da revisão enviada para análise.
- **Sugestão de IA** — Alternativa identificável que o Participante aceita, edita ou descarta antes de qualquer persistência na Ficha.
- **Trait** — Característica narrativa positiva ou negativa que pode influenciar cenas.
- **Treinamento** — Competência mecânica selecionada do catálogo vigente.

## 4. Features

### 4.1 Entrada segura no Piloto

**Descrição:** O convite deve conduzir o Participante por descoberta, autenticação, Consentimento e Contexto Público sem perder a campanha de origem. Realiza UJ-1 e UJ-2.

#### FR-1: Landing pública da campanha

Visitantes podem abrir a landing do Piloto sem sessão e compreender proposta, status, etapas e ações disponíveis.

**Consequências testáveis:**
- Campanha inexistente, indisponível ou encerrada apresenta estado seguro sem revelar dados internos.
- A landing não expõe Segredo do Mestre, dados de outros Participantes ou conteúdo administrativo.

#### FR-2: Autenticação com retorno preservado

O Participante pode alternar entre cadastro e login, confirmar ou reenviar e-mail e retornar à campanha de origem.

**Consequências testáveis:**
- `returnTo` interno é preservado durante cadastro, login e confirmação.
- Destinos externos ou malformados são rejeitados.
- Sessão expirada oferece nova entrada sem apagar progresso persistido.

#### FR-3: Consentimento versionado

O Participante pode consultar e aceitar explicitamente o Consentimento vigente antes de entrar no Piloto.

**Consequências testáveis:**
- O aceite contém versão, campanha, Participante, status e timestamp persistidos.
- Falha ao persistir impede o avanço; clique local não equivale a aceite.
- Nova versão material exige reaceite antes de continuar o tratamento coberto por ela; recusa mantém o acesso bloqueado sem produzir aceite implícito.
- Revogação encerra novas ações do Piloto, despublica o Perfil Público e inicia o fluxo informado de retenção ou exclusão; dados cuja retenção seja obrigatória permanecem apenas pelo prazo e finalidade documentados.
- Antes da abertura externa, a interface informa finalidade, base aplicável, fornecedores, prazos e canais de acesso, exportação, correção e exclusão.

#### FR-4: Entrada idempotente

O Participante consentido pode ingressar ou retomar sua participação sem criar participações duplicadas.

**Consequências testáveis:**
- Apenas participação ativa libera o Contexto Público e o Builder.
- Mesa cheia, participação removida e campanha encerrada resultam em estado recuperável definido pelo backend.

#### FR-5: Contexto suficiente, sem questionário do Episódio 1

O Participante pode conhecer o cenário necessário antes de criar, sem responder perguntas específicas do Episódio 1 como requisito do Builder ou da submissão.

**Consequências testáveis:**
- O frontend apresenta somente Contexto Público aprovado.
- Ausência de conteúdo bloqueia a criação com mensagem clara; a interface não inventa lore.

### 4.2 Jornada retomável e governada por estado

**Descrição:** A próxima etapa é sempre derivada do estado persistido. URLs diretas, refresh e novo login não podem criar uma segunda verdade. Realiza UJ-1, UJ-2 e UJ-4.

#### FR-6: Próxima ação canônica

O sistema apresenta a próxima ação e rota a partir do estado retornado pelo backend.

**Consequências testáveis:**
- Rota incompatível redireciona para a próxima etapa permitida.
- Ausência de estado ou rota não autoriza avanço otimista; apresenta bloqueio recuperável.

#### FR-7: Criação ou retomada antes da navegação

Ao iniciar o Builder, o sistema retoma o Personagem existente ou cria um único Rascunho antes de navegar.

**Consequências testáveis:**
- Repetir a ação após falha não duplica Personagem.
- Refresh, logout e novo login retornam ao mesmo `Character.id`, revisão e versão do Builder.

#### FR-8: Estados legíveis

O Participante vê estados funcionais em linguagem humana: pendência de e-mail, Consentimento, contexto, Rascunho, aguardando revisão, ajustes, aprovado e concluído.

**Consequências testáveis:**
- Enums, payloads e nomes internos não aparecem na interface.
- Cor não é o único meio de comunicar estado ou ação.

### 4.3 Builder narrativo e Ficha Mecânica

**Descrição:** O Builder começa pela pessoa atual e traduz narrativa confirmada em opções mecânicas oficiais. Não exige conhecimento prévio de RPG e não reduz a criação a uma classe pronta. Realiza UJ-1 e UJ-2.

#### FR-9: Narrativa em blocos curtos

O Participante pode descrever identidade, motivações e Marca em poucos blocos narrativos amplos.

**Consequências testáveis:**
- Perguntas específicas do Episódio 1 não são requisito.
- Pouco texto é aceito; a jornada oferece orientação sem exigir redação longa.

#### FR-10: Interpretação confirmada

Antes da Ficha Mecânica, o Participante confirma ou corrige a interpretação de identidade, motivações e Marca.

**Consequências testáveis:**
- Cada bloco pode ser revisado sem apagar os demais.
- A confirmação permanece identificável na retomada e no Snapshot.

#### FR-11: Configuração versionada

O Builder usa catálogos, limites, campos e validações da versão ligada ao Personagem.

**Consequências testáveis:**
- Personagem existente não migra silenciosamente para a configuração atual da campanha.
- Ausência ou inconsistência de configuração bloqueia submissão de forma segura.
- Se a versão original ficar indisponível, o Rascunho preservado abre em recuperação somente leitura; edição e submissão só retornam quando a versão exata for restaurada ou uma migração explícita, auditável e confirmada pelo Participante for oferecida pelo backend.

#### FR-12: Ficha Mecânica válida

O Participante pode definir Arquétipo, Atributos, Traits, Treinamentos e Equipamentos segundo a configuração vigente.

**Consequências testáveis:**
- No contrato atual, Atributos somam exatamente 12, respeitam limites e mantêm ao menos 1 ponto em Vigor ou Espírito.
- A quantidade de Treinamentos e os Equipamentos válidos vêm do catálogo; o frontend não inventa Defesa ou item.

#### FR-13: Salvamento progressivo

O Participante pode salvar e retomar partes válidas do Rascunho sem perder capítulos incompletos.

**Consequências testáveis:**
- Valores vazios ou blocos inválidos são omitidos, não usados para apagar dados válidos.
- Salvamento em andamento, sucesso e falha são perceptíveis.
- Conflito de revisão preserva conteúdo local e orienta sincronização.

#### FR-14: Revisão canônica da Ficha

O Participante pode revisar uma única Ficha de Referência antes do envio e depois da conclusão.

**Consequências testáveis:**
- Revisão, Perfil e Conclusão reutilizam os mesmos rótulos e valores.
- Perfil da conta não é apresentado como Perfil do Personagem.

### 4.4 IA assistiva com decisão humana

**Descrição:** A IA reduz dúvidas no ponto da decisão e pode propor mecânicas a partir da história confirmada. O caminho manual permanece completo. Realiza UJ-2.

#### FR-15: Ajuda opcional e contextual

O Participante pode solicitar ajuda por campo ou capítulo e continuar sem IA.

**Consequências testáveis:**
- Geração só ocorre após ação explícita.
- Indisponibilidade, timeout ou limite não bloqueiam edição manual.
- A IA usa somente contexto autorizado e pode fazer no máximo uma pergunta complementar quando faltar informação.
- O backend aplica allowlist de dados por caso de uso e exclui tokens, credenciais, dados pessoais desnecessários e Segredo do Mestre antes de chamar o provedor.

#### FR-16: Aceitar, editar ou descartar

Cada Sugestão de IA oferece decisão explícita antes de afetar o Rascunho.

**Consequências testáveis:**
- Sugestão gerada não é salva nem aplicada automaticamente.
- Aceite, edição e descarte são registrados; aplicação na Ficha exige ação explícita separada.
- O Participante pode desfazer aplicação local antes de persistir.

#### FR-17: Proposta Mecânica por blocos

O Participante pode decidir separadamente Arquétipo, Atributos, Traits, Treinamentos e Equipamentos sugeridos.

**Consequências testáveis:**
- Todos os blocos são aplicados ou descartados antes da confirmação.
- A proposta obedece configuração e contexto confirmados; não cria regra ou Cânone.

#### FR-18: Telemetria de IA

O sistema registra caso de uso, provedor, modelo, tokens, status, custo e decisão sem registrar conteúdo proibido.

**Consequências testáveis:**
- Prompt integral, Ficha completa, narrativa, resposta da Pesquisa Final e Segredo do Mestre não entram em Analytics.
- Custos não precificados são separados; BRL é identificado como estimativa com taxa e data.

### 4.5 Submissão, ajustes e aprovação

**Descrição:** A submissão cria um Snapshot revisável e separa claramente autoria, operação e autoridade. Realiza UJ-3.

#### FR-19: Submissão explícita e imutável

O Participante pode enviar uma Ficha completa após confirmação final.

**Consequências testáveis:**
- Envio usa a revisão esperada e cria Snapshot imutável.
- Ficha submetida ou aprovada é somente leitura.
- Dupla submissão ou revisão obsoleta não cria Snapshot duplicado.

#### FR-20: Fila de revisão

O revisor autorizado pode ver somente Fichas submetidas e abrir o último Snapshot confirmado.

**Consequências testáveis:**
- Rascunho mutável posterior não substitui o Snapshot em análise.
- O revisor não acessa Segredo do Mestre de outra Mesa nem dados não necessários à revisão.

#### FR-21: Pedido de ajustes

O revisor autorizado pode devolver a Ficha com comentário e revisão esperada.

**Consequências testáveis:**
- O Participante vê o feedback e só edita quando o backend indica editabilidade.
- Ressubmissão cria nova revisão, preservando histórico e Pesquisa Final já respondida.

#### FR-22: Aprovação humana no Piloto

Em `pilot-v1`, o Administrador do Piloto pode revisar por uma capacidade excepcional limitada à campanha preparada.

**Consequências testáveis:**
- A capacidade exige atribuição ativa ao `pilot-v1`, permissão explícita e validação backend da campanha; ela não concede papel `MASTER`.
- Fora de `pilot-v1`, papel global `ADMIN` não concede autoridade de revisão.
- A autorização final é validada pelo backend, não apenas pela presença de botões.
- O backend impede que o revisor aprove ou peça ajustes no próprio Personagem.

#### FR-23: Notificações operacionais

O dono do Personagem recebe mensagens de Ficha enviada, ajustes solicitados e aprovação quando o provedor está disponível.

**Consequências testáveis:**
- Falha de e-mail não reverte transição persistida.
- Mensagens são operacionais, sem marketing, Segredo do Mestre ou credenciais.

### 4.6 Pesquisa, conclusão e artefatos

**Descrição:** O Participante encerra o teste, distingue conclusão de aprovação e recebe artefatos persistentes. Realiza UJ-4.

#### FR-24: Pesquisa Final versionada

O Participante pode responder ou atualizar a Pesquisa Final após a submissão, inclusive antes da aprovação.

**Consequências testáveis:**
- “Não usei IA” é resposta válida e não exige detalhe de IA.
- Uma atualização não cria resposta duplicada.
- Enquanto a campanha estiver ativa, o dono pode atualizar a própria resposta; após encerramento, ela fica somente leitura.
- Conteúdo da pesquisa não é replicado em Analytics.

#### FR-25: Conclusão honesta

A Conclusão mostra separadamente participação concluída e estado da revisão.

**Consequências testáveis:**
- Ficha aguardando revisão não é apresentada como aprovada.
- Pedido posterior de ajustes reabre o Builder sem apagar a Pesquisa Final.

#### FR-26: Um Retrato e uma Carta Jogável

Depois de concluir a Pesquisa Final, o Participante pode gerar por ação explícita um Retrato e uma Carta Jogável, mesmo que a revisão ainda esteja pendente.

**Consequências testáveis:**
- Cada variante tem disponibilidade e limite próprios retornados pelo backend.
- Geração não é condição para criar, submeter, aprovar ou concluir o Personagem.
- Resultado é identificado como arte pessoal gerada por IA, não arte oficial ou Cânone.
- Falha preserva Ficha e jornada e permite nova tentativa quando o contrato autorizar.
- O sistema preserva proveniência mínima do artefato — variante, data, fornecedor/modelo e vínculo com o Personagem — sem exibir prompt interno ou Segredo do Mestre.
- Pedido ou referência envolvendo pessoa real exige direitos e consentimento; conteúdo proibido pelo provedor ou pela política do produto é recusado e não pode ser publicado.
- Retenção, exclusão e envio de dados criativos ao fornecedor são informados antes do uso da geração visual.

#### FR-27: Downloads

O Participante pode baixar Retrato, Carta Jogável e Ficha em PDF.

**Consequências testáveis:**
- PDF usa linguagem do jogador e exclui comentário do Mestre, revisão, enums e payloads internos.
- Conteúdo longo e múltiplas páginas não truncam informações essenciais.
- O PDF é apresentado como fotografia local, não documento oficial imutável.

#### FR-28: Perfil Público aprovado

O Participante pode tornar compartilhável apenas o recorte permitido de um Personagem aprovado.

**Consequências testáveis:**
- Antes de compartilhar, a interface informa quais campos ficarão públicos.
- E-mail, IDs internos, feedback privado, Segredo do Mestre e dados técnicos nunca são públicos.
- Aprovação não publica automaticamente: o dono precisa registrar opt-in explícito.
- O link mostra um snapshot da última revisão aprovada; nova revisão exige nova confirmação de publicação.
- O dono pode revogar o Perfil Público sem excluir o Personagem; o link passa a responder como indisponível e caches controlados pela plataforma são invalidados.
- Perda de aprovação, participação, campanha ativa, Consentimento ou existência do Personagem torna o Perfil indisponível e invalida o opt-in; recuperação ou nova aprovação exige novo opt-in informado.
- A interface avisa que arquivos já baixados ou republicados fora da plataforma não podem ser recolhidos.

#### FR-29: Compartilhamento para Story

O Participante pode gerar uma composição vertical com Carta Jogável, identidade da campanha e instrução para anexar o link do Perfil Público.

**Consequências testáveis:**
- Em dispositivo compatível, o compartilhamento nativo é oferecido; download é fallback.
- A imagem não contém dados privados e não publica automaticamente em rede social.
- Uma prévia exibe imagem, nome, marca da campanha, handle, hashtag e destino antes de compartilhar ou baixar.
- Story com link só pode ser gerado enquanto o Perfil Público correspondente estiver ativo e apontar para o mesmo Snapshot aprovado.

### 4.7 Operação do Piloto

**Descrição:** O Administrador do Piloto acompanha funil, participantes, revisões, legado e custos com visão acionável, sem transformar a operação em acesso irrestrito. Realiza UJ-3.

#### FR-30: Funil operacional

O Administrador do Piloto pode consultar contagens reais por etapa e pendências acionáveis.

**Consequências testáveis:**
- Erro de API não vira zero ou métrica inventada.
- Contadores reconciliam com estados persistidos e distinguem pendência do Participante, revisão e conclusão.
- Funil recebe apenas identificação e estado mínimos; não reutiliza payload de revisão ou telemetria.

#### FR-31: Gestão de Participantes

O Administrador do Piloto pode buscar, filtrar e paginar Participantes e consultar o estado necessário à operação.

**Consequências testáveis:**
- Dados pessoais e Ficha completa aparecem apenas quando necessários e autorizados.
- Lista, detalhe e funil usam o mesmo estado canônico.
- Lista usa allowlist mínima; somente o detalhe de revisão autorizado recebe o Snapshot do Personagem selecionado.

#### FR-32: Personagens legados

O Administrador do Piloto pode adaptar ou excluir Personagem legado com confirmação, motivo e auditoria.

**Consequências testáveis:**
- Adaptação preserva referência anterior e cria Rascunho não confirmado na versão vigente.
- Exclusão exige autorização global específica e não decorre de ser Mestre.

#### FR-33: Painel de uso e custos de IA

O Administrador do Piloto pode filtrar resumo, série temporal e detalhamento de uso da IA.

**Consequências testáveis:**
- Filtros incluem período, caso de uso, provedor, modelo e status.
- USD e estimativa BRL são distinguíveis; valores sem preço não contaminam total conhecido.

#### FR-34: Escopo visível reduzido

Menus e CTAs do Piloto mostram somente a jornada do Participante e a operação necessária.

**Consequências testáveis:**
- Rotas legadas podem permanecer no código, mas Monstros, Missões, Loja, PvP, rankings, trocas, recompensas, criar Mesa e entrar por código não reaparecem na navegação do Piloto sem decisão de produto.
- Administrador não recebe CTA genérico para continuar a jornada do Participante; “ver como Participante” é ação explícita.

## 5. Não objetivos

- Não construir um VTT, motor de combate ou Rules Engine D20 completo nesta fatia.
- Não liberar criação pública de Mesas ou campanhas no Piloto atual.
- Não transformar IA em autora, Mestre, aprovadora ou fonte de Cânone.
- Não canonizar Legados, Ecos, Pontos de Essência ou histórias provisórias sem aprovação do Product Owner.
- Não expor módulos futuros apenas porque suas rotas existem.
- Não criar rede social de Personagens, marketplace, loja cosmética ou sincronização com plataformas externas.
- Não produzir arte editorial/oficial por IA; Retrato e Carta Jogável são artefatos pessoais do playtest.
- Não enviar marketing ou lembretes agendados sem preferência, descadastro e infraestrutura confiável.

## 6. Escopo do MVP

### 6.0 Fatias e ordem de corte

| Fatia | Requisitos | Dependência | Decisão de corte |
|---|---|---|---|
| `pilot-core` | FR-1 a FR-25 | Nenhuma outra fatia | Mínimo necessário para testar entrada, criação autoral, submissão, revisão e conclusão; é a única fatia exigida por SM-1 a SM-4. |
| `pilot-share` | FR-26 a FR-29 | `pilot-core`, políticas de imagem e privacidade aprovadas | Pode sair da primeira rodada sem invalidar a tese; entra antes de testar artefatos e compartilhamento público. |
| `pilot-ops` | FR-30 a FR-34 | Estados e autorização do `pilot-core` | Pode começar em paralelo, mas só entra no Piloto externo após reconciliar fila, funil e permissões com dados reais. |

O menor lançamento formativo é `pilot-core` com os gates de segurança, privacidade e validação integrada deste PRD. `pilot-share` e `pilot-ops` não podem ser usadas para declarar sucesso da tese quando `pilot-core` falhar.

### 6.1 Em escopo

- Entrada por campanha, autenticação, confirmação de e-mail, Consentimento e Contexto Público.
- Jornada retomável governada por estado do backend.
- Builder narrativo e mecânico, manual e com IA opcional.
- Revisão, submissão, ajustes, ressubmissão e aprovação humana.
- Pesquisa Final e Conclusão independentes do tempo da aprovação.
- Um Retrato e uma Carta Jogável por Personagem conforme limites do backend.
- Perfil Público aprovado, compartilhamento para Story e downloads.
- Operação do Piloto, legado, telemetria e custos de IA.
- Notificações operacionais e estados críticos em desktop e mobile.

### 6.2 Fora do escopo do MVP

- Mesas criadas por usuários e revisão contextual pelo Mestre da Mesa. Requisito diferido DR-1: quando essa capacidade for liberada, somente `MASTER` ativo na Mesa pode revisar seus Personagens; `ADMIN` global não herda essa autoridade e a arquitetura deve registrar a decisão em ADR antes da implementação.
- Crônica da Mesa, Modo Espectador e comunidade — dependem de visibilidade e governança de Cânone maduras.
- Combate, sessões, rolagens, progressão, inventário econômico e demais módulos legados.
- PDF oficial imutável/versionado no backend — o uso real deve demonstrar necessidade.
- Retentativa/outbox de e-mail — envio tolerante a falha é suficiente para o Piloto controlado.
- Regenerações extras ou compra de gerações visuais — dependem de custo real e política comercial.

## 7. Qualidades transversais

### 7.1 Segurança e privacidade

- O backend deve impedir acesso não autorizado mesmo quando a UI esconde ações.
- Segredo do Mestre, tokens, credenciais, prompts integrais, respostas narrativas completas e Ficha completa não entram em payload público ou Analytics.
- Perfil Público usa allowlist explícita de campos e nunca reutiliza automaticamente o payload administrativo.
- Consentimento, Pesquisa Final, submissões e decisões de IA mantêm versão e proveniência suficientes para auditoria.
- Cada requisição protegida valida sessão e autorização vigentes no servidor. Logout, remoção da campanha e revogação de papel invalidam o acesso; reautenticação rotaciona a sessão.
- O Piloto externo fica bloqueado até existir sessão revogável ou de curta duração, com expiração e resposta segura testadas; a mera presença de cookie ou token no browser não é autenticação suficiente.
- O endpoint do Perfil Público retorna allowlist própria e mínima; feedback de revisão, Ficha privada, e-mail, IDs, histórico e Segredo do Mestre não podem sequer compor seu DTO.
- Antes do Piloto externo, revisão jurídica aprova o ciclo de Consentimento, finalidades, bases, retenção, fornecedores e exercício de direitos; ausência dessa aprovação é gate de não lançamento.

### 7.2 Acessibilidade e experiência

- Rotas críticas devem atender WCAG 2.2 AA, incluindo contraste mínimo de 4,5:1 para texto comum e 3:1 para texto grande e gráficos essenciais.
- Toda tarefa funciona por teclado, com foco visível, ordem coerente, skip link/landmarks e foco movido ao primeiro erro de formulário.
- Controles possuem alvo mínimo de 44 × 44 CSS px; rótulos e erros são programaticamente associados.
- Em zoom de 200%, não há perda, sobreposição ou scroll horizontal comum; animações respeitam `prefers-reduced-motion`.
- A interface usa texto e ícone além de cor para estado, IA, aprovação e erro.
- O Participante nunca precisa conhecer enum, endpoint, payload ou termo técnico para escolher a próxima ação.
- O fluxo deve funcionar em desktop e mobile; a tarefa principal não depende de hover.

### 7.3 Mobile

- As rotas críticas funcionam a partir de 320 CSS px, em 360/375 px, tablet e desktop, sem exigir orientação específica.
- Teclado virtual, barras fixas e safe areas não encobrem campo ativo, erro ou CTA; o Builder mantém progresso e ação principal alcançáveis.
- Story, Retrato, Carta Jogável e PDF são testados em dispositivo móvel real, incluindo cancelamento de compartilhamento, ausência de `canShare` e fallback de download.

### 7.4 Desempenho e confiabilidade

- [ASSUMPTION: a resposta visual de navegação e ações locais ocorre em até 100 ms; páginas críticas tornam-se utilizáveis em até 3 s no percentil 75 sob rede móvel típica.]
- [ASSUMPTION: salvamento confirmado ou erro recuperável aparece em até 2 s após a resposta do backend.]
- Operações idempotentes impedem duplicação de participação, Personagem, submissão e Pesquisa Final.
- Falha de IA, e-mail, geração visual ou download não corrompe estado central nem bloqueia caminho manual.

### 7.5 Observabilidade e custo

- Eventos técnicos permitem reconstruir funil e falhas sem coletar conteúdo criativo completo.
- Toda chamada de IA registra caso de uso, status, modelo, tokens e custo conhecido.
- Limites e disponibilidade de Retrato/Carta Jogável vêm do backend; a UI não calcula saldo comercial por conta própria.

## 8. Identidade, tom e arquitetura de informação

### 8.1 Experiência visual

- O produto deve parecer um RPG acessível e artesanal, não um painel SaaS genérico nem uma interface sombria ilegível.
- A direção oficial do Piloto é light-first: superfícies claras de papel/marfim, verde-sálvia/musgo, terracota e dourado envelhecido, com ornamentação contida e áreas de leitura limpas; azul não integra a paleta principal.
- Dourado comunica foco/recompensa, verde comunica proteção/aprovação e marrom sustenta estrutura. Temas não podem alterar esse significado nem reduzir contraste.
- Pixel art e personagens Guardiões podem comunicar progresso, carregamento e ação da IA, respeitando movimento reduzido.
- Arte gerada não substitui elementos de marca, molduras ou ilustrações editoriais aprovadas.
- A marca não pode ser deformada, recriada, recolorida fora das variantes aprovadas ou aplicada sobre fundo que prejudique leitura.

### 8.2 Voz e texto

- Textos são em português claro, acolhedor e direto, sem termos técnicos de implementação.
- Cada etapa responde: onde estou, por que isso importa, o que posso fazer, quando a IA ajuda e o que acontece depois.
- IA é descrita como ajuda opcional; aprovação é atribuída à pessoa correta.
- Nenhuma rota do Piloto pode exibir mojibake, texto sem acentuação intencional ou sinônimo conflitante com o Glossário.

### 8.3 Superfícies principais

- Públicas: landing do produto, landing da campanha, autenticação, confirmação de e-mail, termos, privacidade e Perfil Público.
- Participante: Minha Jornada, Builder, Revisão, Pesquisa Final, Conclusão, Meu Personagem e Perfil da conta.
- Administrador do Piloto: visão geral, Revisões, Participantes, configurações do Piloto e uso/custos da IA.

## 9. Monetização e política de acesso

- O Piloto permanece gratuito e controlado; seu objetivo é validar valor, compreensão e custo, não receita imediata.
- Limites de IA e geração visual protegem orçamento e devem ser transparentes ao Participante.
- [ASSUMPTION: após o Piloto haverá uma experiência gratuita suficiente para criar e consultar ao menos um Personagem, sem bloquear o uso básico da plataforma.]
- Gerações adicionais, recursos de Mesa, personalização avançada ou conteúdo editorial podem formar ofertas futuras apenas após medir uso e custo.
- Publicidade que interrompa criação, revisão ou consulta de Ficha não faz parte do MVP.

## 10. Métricas de sucesso

### Primárias

- **SM-1 — Conclusão do teste formativo:** 3 de 3 perfis — iniciante, orientado e experiente — concluem uma Ficha válida. Valida FR-1 a FR-25.
- **SM-2 — Autoria reconhecível:** todos distinguem pessoa atual, Alma e Arquétipo, apontam sem ajuda ao menos duas escolhas próprias na Ficha e explicam uma decisão mantida ou alterada; no máximo duas intervenções humanas por Participante. Para quem usa IA, o log e a entrevista devem comprovar ao menos uma decisão consciente de aceitar, editar ou descartar, e ninguém pode acreditar que sugestão foi persistida automaticamente. Instrumento: observação da tarefa, trilha de decisões e entrevista pós-tarefa de três minutos. Valida FR-9 a FR-17.
- **SM-3 — Tempo de criação:** iniciante ≤ 25 min, orientado ≤ 40 min e experiente ≤ 55 min no teste formativo. Valida FR-6 a FR-17.
- **SM-4 — Revisabilidade:** o revisor identifica pendências e decide sem reconstruir a Ficha. Valida FR-14 e FR-19 a FR-22.
- **SM-5 — Validação integrada:** 100% dos cenários críticos da matriz E2E passam com conta/papel, chamadas HTTP, estado persistido e rota final registrados. Valida FR-1 a FR-34.

### Secundárias

- **SM-6 — Retomada íntegra:** 100% dos cenários de refresh, logout, novo login e sessão expirada preservam um único Personagem e o progresso válido. Valida FR-2, FR-6, FR-7 e FR-13.
- **SM-7 — IA não bloqueante:** 100% dos cenários de indisponibilidade ou falha da IA permitem conclusão manual; aceite, edição e descarte permanecem distinguíveis. Valida FR-15 a FR-18.
- **SM-8 — Operação coerente:** painel, fila, Participantes e estados persistidos concordam nos cenários E2E. Valida FR-20 a FR-23 e FR-30 a FR-34.
- **SM-9 — Privacidade:** zero Segredo do Mestre, prompt integral, Ficha completa, narrativa completa, token ou credencial em superfície pública e Analytics. Valida FR-1, FR-18, FR-20, FR-28 a FR-33.
- **SM-10 — Custo observável:** 100% das chamadas de IA mostram custo conhecido ou estado “não precificado”; BRL sempre é identificado como estimativa. Valida FR-18 e FR-33.
- **SM-11 — Conversão do Piloto:** [ASSUMPTION: pelo menos 70% dos Participantes que aceitam o Consentimento enviam uma Ficha e pelo menos 60% concluem a Pesquisa Final.] Valida FR-3 a FR-25.

### Contramétricas

- **SM-C1 — Texto produzido:** não otimizar quantidade de texto; Personagem curto e coerente vale mais que história longa criada para satisfazer a interface. Contrabalança SM-2 e SM-3.
- **SM-C2 — Uso de IA:** não maximizar chamadas ou taxa de aceite; sucesso é autonomia e conclusão, inclusive sem IA. Contrabalança SM-7 e SM-10.
- **SM-C3 — Aprovação sem ajustes:** não minimizar pedidos de ajuste a qualquer custo; feedback útil é preferível a aprovação superficial. Contrabalança SM-4.
- **SM-C4 — Exposição pública:** não maximizar compartilhamentos sacrificando consentimento, privacidade ou clareza sobre IA. Contrabalança FR-28, FR-29 e SM-9.

### Limite da evidência

- SM-1 a SM-4 medem compreensão e experiência de criação, não diversão, equilíbrio ou uso efetivo em sessão.
- “Mecanicamente válido” significa Ficha completa segundo a configuração vigente; “aprovado” significa decisão humana; “jogável em sessão” exige rodada posterior com uso real do Personagem.

## 11. Riscos e mitigação

- **Deriva entre manual, contrato e frontend:** usar configuração versionada, contrato vigente e reconciliação explícita; nunca codificar hipótese como Cânone.
- **IA reduzir autoria ou inventar regra:** ação explícita, decisão por campo/bloco, caminho manual e validação mecânica independente.
- **Segredo chegar ao browser:** separação no backend, allowlists e inspeção de Network nos testes integrados.
- **Papel global ser confundido com autoridade da Mesa:** separar Administrador do Piloto de Mestre da Mesa e testar `401/403` por contexto.
- **Interface parecer preenchimento burocrático:** começar pela identidade, usar blocos curtos, contexto suficiente e Ficha canônica legível.
- **Custo visual crescer sem controle:** um Retrato e uma Carta Jogável por Personagem, disponibilidade do backend e painel de custo.
- **Build verde mascarar falha real:** status permanece parcial até matriz E2E com ambiente integrado e e-mails reais.
- **Conteúdo gerado por IA gerar rejeição comunitária:** transparência, uso pessoal não canônico e separação total de arte oficial humana.
- **Compartilhamento sobreviver ao contexto pretendido:** opt-in, snapshot aprovado, revogação e aviso sobre cópias externas.
- **Sessão presente porém inválida parecer autenticada:** validação no servidor, expiração/revogação e rotação antes da abertura externa.
- **Política de dados ficar implícita:** gate jurídico e operacional anterior ao convite externo, com ciclo completo de Consentimento e fornecedores documentado.

## 12. Registro de decisões abertas

| ID | Decisão | Responsável | Prazo/gate | Alternativa padrão e impacto |
|---|---|---|---|---|
| D-1 | Oficializar Legado de Alma, Ecos da Alma e Pontos de Essência. | Product Owner/Autor | Antes de UX usar os termos | Mantê-los fora do Cânone; não bloqueia `pilot-core`. |
| D-2 | Escolher rodada para 10 Pontos de Essência e Fardo obrigatório. | Product Owner + Design de Jogo | Antes de alterar a configuração do Builder | Preservar os 12 pontos de Atributos atuais; bloqueia apenas a evolução mecânica. |
| D-3 | Definir conteúdo público de Alma/Legado. | Product Owner/Autor + Privacidade | Antes de `pilot-share` | Omitir todo conteúdo não aprovado; bloqueia Perfil Público com esses campos. |
| D-4 | Aprovar catálogo de armaduras e escudos. | Design de Jogo + Backend | Antes de incluir cálculo de Defesa | Não inventar Defesa/item; bloqueia apenas essa mecânica. |
| D-5 | Fixar volume e orçamento de IA/imagem do Piloto. | Product Owner + Operação | Antes de convidar a coorte externa | Usar coorte controlada e limites conservadores do backend; bloqueia escala, não teste interno. |
| D-6 | Substituir metas assumidas de conversão. | Produto/Research | Após a primeira coorte, antes da segunda | Reportar baseline sem declarar alcance de SM-11. |
| D-7 | Definir gratuidade e limites pós-Piloto. | Produto/Negócio | Antes do plano comercial | Manter decisão fora do MVP; não bloqueia Piloto. |
| D-8 | Definir entradas operacionais de `ADMIN` e `MASTER`. | Produto + Arquitetura | Antes da ADR e histórias de Mesas | Separar autoridade e não liberar criação de Mesas; bloqueia DR-1. |
| D-9 | Aprovar juridicamente Consentimento e ciclo de dados. | Responsável jurídico/privacidade + Product Owner | Antes de qualquer convite externo | Não abrir o Piloto externamente; bloqueia o lançamento, não testes internos com dados controlados. |

## 13. Índice de premissas

| Premissa | Responsável | Revisitada quando |
|---|---|---|
| §7.4 — resposta visual local em 100 ms e páginas utilizáveis em 3 s no percentil 75 de rede móvel típica. | Engenharia + Produto | Primeiro teste de desempenho em ambiente integrado, antes do Piloto externo. |
| §7.4 — confirmação ou erro de salvamento em até 2 s após resposta do backend. | Engenharia | Instrumentação de latência do salvamento, antes da segunda coorte. |
| §9 — experiência gratuita pós-Piloto inclui ao menos um Personagem utilizável. | Produto/Negócio | Definição do plano comercial, conforme D-7. |
| SM-11 — 70% dos consentidos enviam Ficha e 60% concluem Pesquisa Final. | Produto/Research | Após a primeira coorte, conforme D-6. |
