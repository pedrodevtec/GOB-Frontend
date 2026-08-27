# Reconciliação de regras de domínio — GOB Frontend

Data de consolidação: 2026-08-27
Escopo: manuais de jogador/construção, kit de teste fechado, documentos de IA, contratos do MVP e modelo de permissões.
Objetivo: separar regras vigentes de hipóteses e impedir que o PRD transforme conteúdo experimental em regra ou cânone.

## 1. Critério de precedência

Quando os documentos diferirem, usar esta ordem para especificar o frontend:

1. **Contrato vigente do backend e modelo de permissões** para autenticação, autorização, campos, estados, transições, privacidade e validações executáveis.
2. **Estado consolidado do playtest (2026-08-14)** para capacidades que já existem, mas ainda precisam de validação E2E real.
3. **Manual do Jogador v0.1** para regras existentes do jogo e conhecimento público do jogador.
4. **Manual de Construção v0.1 e Kit de Teste Fechado** para a experiência guiada, preservando as classificações explícitas de hipótese, proposta e pendência.
5. **Critérios de hotspots de IA e Fundação Visual** como princípios de governança/UX, não como novos contratos de domínio.

O frontend não resolve divergência inventando valores ou conteúdo local. A configuração versionada do Builder retornada pelo backend é a fonte operacional; personagens existentes permanecem ligados à versão com que foram criados.

## 2. Núcleo do domínio vigente

### 2.1 Princípio central

**A Alma influencia. O jogador personaliza e confirma. A IA sugere. O Mestre revisa e decide. A plataforma registra estados, versões, consentimentos e auditoria.**

Consequências obrigatórias:

- a pessoa atual deve existir além da Alma/Legado e do arquétipo;
- a Marca, memórias e Ecos podem sugerir impulsos, sensações e conflitos, mas não controlam o personagem;
- nenhuma sugestão de IA altera ficha, ação, dado, consequência, item, regra ou cânone por conta própria;
- aprovação e pedido de ajustes são decisões humanas do Mestre, registradas com comentário/estado;
- regras objetivas devem ser validadas pelo sistema; julgamento narrativo permanece humano.

### 2.2 Identidade e composição do personagem

Camadas usadas no produto:

| Camada | Função | Situação |
|---|---|---|
| Pessoa atual | Identidade, origem, aparência, ocupação, desejo, medo, promessa/culpa e motivo para agir | Vigente |
| Marca | Manifestação da ligação espiritual e reação pessoal a ela | Vigente |
| Arquétipo | Maneira de atuar em risco; não determina personalidade | Vigente |
| Trait positiva, Trait negativa e Vínculo | Características/ganchos narrativos usados em cena | Vigente no Manual do Jogador |
| Legado de Alma | Ponte guiada entre ficha vazia e personagem | Hipótese de produto |
| Ecos da Alma / Fardo / Pontos de Essência | Menu de forças, memórias e custos narrativos do Legado | Hipótese de regra/produto |

Legado e arquétipo devem permanecer independentes. Ladino, Paladino, Arqueiro e Sacerdote são bases prototípicas de Alma, não classes nem identidades fechadas.

### 2.3 Atributos, treinamentos e recursos

Regras existentes e também refletidas no contrato `pilot-v1`:

- seis atributos: Força, Agilidade, Vigor, Intelecto, Presença e Espírito;
- distribuir **exatamente 12 pontos**;
- valor comum inicial entre **0 e 4**; valor 5 somente com autorização explícita do Mestre;
- Vigor ou Espírito deve ter pelo menos 1 ponto;
- escolher **exatamente três treinamentos**; treinamento aplicável concede +2 segundo o Manual do Jogador;
- PV = `10 + Vigor × 4`;
- Energia = `6 + Vigor + Espírito`;
- PA = `2 + Espírito`;
- iniciativa = `1D20 + Agilidade`;
- Defesa depende de catálogo aprovado de armadura/escudo; não criar bônus no frontend.

Catálogos, chaves, limites e perguntas vêm da configuração versionada do Builder/API. A UI não mantém catálogo definitivo próprio de atributos, arquétipos, Traits, treinamentos ou equipamentos.

### 2.4 Ecos e Essência

Para o protótipo documentado:

- orçamento de 10 Pontos de Essência;
- Dom ancestral obrigatório e sem custo;
- Eco menor custa 2 e Eco maior custa 4;
- seleção totaliza exatamente 10 e contém ao menos um Fardo;
- exceção exige autorização documentada do Mestre;
- Eco não concede bônus permanente; quando claramente acionado, o Mestre pode aplicar mecanismos existentes de Trait;
- um Eco positivo pode ocupar a Trait positiva e um Fardo a Trait negativa, evitando listas duplicadas.

**Classificação correta:** tudo neste bloco é hipótese de regra para teste, inclusive 10 pontos, Fardo obrigatório, dez Ecos por Legado e o mapeamento Eco→Trait. Pode ser aplicado no `pilot-v1` quando a configuração ativa assim determinar, mas não deve ser descrito como regra canônica definitiva nem codificado fora da configuração versionada.

## 3. Cânone, conhecimento e segredos

### 3.1 Classes de informação

| Classe | Quem pode receber | Regra |
|---|---|---|
| Contexto público | visitante/jogador | Somente conteúdo explicitamente aprovado e devolvido por endpoint público/configuração pública |
| Conteúdo do próprio jogador | dono; Mestre após envio quando previsto | Rascunho é privado; respostas e ficha entram na revisão após submissão |
| Cânone da mesa / Crônica | membros conforme visibilidade definida pelo Mestre | Mestre decide o que entra no cânone daquela mesa e o que pode ser publicado |
| Segredo de Mestre/cânone secreto | Mestre/autor autorizado | Nunca chega ao browser, prompt ou resposta do jogador/espectador |
| Agregados operacionais | ADMIN | Métricas e estados técnicos; não autorizam acesso a conteúdo narrativo integral |
| Conteúdo oficial do universo | público somente após aprovação autoral/produto | Uma inscrição ou sugestão não se torna cânone automaticamente |

Marcadores/campos proibidos ao jogador incluem `gm_secret`, `SECRET_CANON`, `TABLE_MASTER`, `AUTHOR_ADMIN`, notas internas, dados de outros personagens e qualquer conteúdo de Mestre. Campanhas indisponíveis retornam erro genérico para não revelar estado interno.

As quatro histórias de Alma do Manual de Construção são **não canônicas e provisórias** até aprovação do Product Owner. Respostas de vínculo criam possibilidades; não tornam hipóteses, segredos, relações com Mandukuru ou revelações verdadeiras sem decisão do Mestre.

Uma criação enviada ao teste autoriza leitura e avaliação, não incorporação oficial. Adaptação, publicação, entrada oficial e crédito exigem etapa posterior apresentada ao criador para aprovação.

## 4. IA: usos, limites e persistência

### 4.1 Usos permitidos

- explicar diferenças, regras públicas e efeitos sem escolher pelo jogador;
- sugerir alternativas de origem, Marca, desejo, medo, vínculo ou redação;
- reescrever sem mudar a intenção confirmada;
- fazer no máximo uma pergunta complementar quando faltarem dados, conforme o fluxo atual do playtest;
- explicar custos de Ecos, detectar soma incorreta, repetição e lacunas;
- validar soma de atributos e consistência com manual/contexto público;
- preparar proposta mecânica a partir de contexto narrativo confirmado;
- resumir evento já aprovado, apontar inconsistências e produzir rascunho de Crônica;
- sugerir consequências ao Mestre, sempre como alternativas.

### 4.2 Proibições

A IA não pode:

- escolher Legado, arquétipo, atributos, ação ou decisão pelo jogador;
- inventar passado definitivo, vínculo, poder, item, regra, segredo ou fato canônico;
- acessar/revelar segredo de Mestre, cânone secreto ou dados de outros usuários;
- alterar dado, dano, resultado, consequência, ficha ou estado automaticamente;
- aprovar ficha, aplicar morte/perda permanente ou publicar Crônica;
- alterar cânone oficial ou ignorar Manual do Jogador/Mestre;
- declarar hipótese como verdade;
- bloquear o fluxo manual quando o provedor estiver ausente, limitado ou indisponível.

### 4.3 Decisão e gravação

- toda sugestão começa como `GENERATED` e deve oferecer **Aceitar, Editar ou Descartar**;
- decisões resultam em `ACCEPTED`, `EDITED` ou `DISCARDED` e pertencem ao próprio jogador;
- registrar a decisão **não aplica o texto à ficha**: aceitar/editar exige ação separada e explícita de persistência do rascunho;
- sugestão, origem, status e decisão devem permanecer identificáveis/auditáveis;
- conteúdo descartado não é aplicado;
- o Mestre pode ver o resultado pertinente à ficha submetida, mas não precisa receber prompt integral ou cadeia interna do provedor.

## 5. Aprovação e estados

### 5.1 Estados de ficha vigentes no backend

| Estado | Regra |
|---|---|
| `DRAFT` | Dono ativo pode salvar progressivamente e editar |
| `SUBMITTED` | Snapshot/revisão enviada; não editar como rascunho enquanto aguarda Mestre |
| `CHANGES_REQUESTED` | Feedback do Mestre reabre correção e posterior reenvio |
| `APPROVED` | Mestre aprovou; ficha passa ao contexto permitido da mesa |

O estado “Ativo” citado no Manual de Construção não integra o enum atual `sheetStatus`; deve ser tratado como disponibilidade do personagem/episódio ou futura transição, não acrescentado ao contrato atual sem backend.

### 5.2 Portões e autoridade

- criar/editar/submeter: dono do personagem com membership `PLAYER` ativa;
- revisar/pedir ajustes/aprovar: `MASTER` da mesa, conforme autorização do backend;
- `ADMIN` é papel global e **não implica `MASTER`**; um `USER` pode ser Mestre e um `ADMIN` pode ser jogador;
- acesso de Mestre deriva de `currentUserRole`, `isMaster` e membership ativa, nunca do papel global ou do campo legado `role`;
- o backend é a fonte de verdade para `401`, `403`, transições e concorrência; esconder botão não é controle de acesso;
- checklist narrativo do Mestre: contexto público, identidade independente, versão, regras mecânicas, equipamentos, consentimentos, coerência e confirmação de IA;
- decisão deve registrar aprovado ou ajustes solicitados, com comentário.

**Intenção ainda não validada em E2E:** o Mestre não deve revisar o próprio personagem. A matriz exige testar essa proteção, mas está marcada como não executada; tratar como requisito a confirmar no contrato/backend, não como comportamento comprovado.

## 6. Criação, revisão e perguntas do Episódio 1

Reconciliação da aparente divergência:

- o fluxo atual permite **criar e salvar a ficha básica/narrativa sem exigir imediatamente** as quatro respostas do Episódio 1;
- o contrato de submissão exige que as quatro perguntas públicas estejam respondidas antes de mudar para `SUBMITTED`;
- portanto, respostas do episódio são portão de **envio**, não necessariamente portão de **criação do rascunho**.

As três perguntas narrativas amplas e a confirmação da interpretação pertencem ao builder assistido atual; as quatro perguntas versionadas do Episódio 1 pertencem ao dossiê/submissão. Não colapsar os dois conjuntos nem hardcodá-los no frontend.

Persistência deve ser progressiva por partes, omitindo valores vazios/inválidos e sem apagar capítulos incompletos. A submissão gera snapshot/revisão imutável para o Mestre; alterações posteriores ocorrem após `CHANGES_REQUESTED` e novo envio.

## 7. Imagem, retrato e carta

### 7.1 Capacidade operacional documentada

- após a conclusão/pesquisa, o playtest oferece preparação/consulta do prompt da carta;
- geração automática só é considerada funcional quando provedor de IA e armazenamento estiverem configurados;
- a arte gerada é persistida, visualizável e baixável pelo participante;
- a regra atual documentada é **uma geração de carta por personagem**;
- preparação do parecer/prompt e geração efetiva são aceites separados; falha/ausência do gerador não invalida a criação, submissão ou aprovação do personagem.

Os documentos não definem de forma suficiente retries, regeneração, moderação, expiração, variante ou troca da imagem. O PRD não deve prometer essas capacidades sem contrato oficial. A geração precisa usar apenas contexto permitido/confirmado do personagem e não incluir segredo de Mestre ou prompt integral em analytics.

### 7.2 Oficialidade e uso de IA

Não há contradição se os artefatos forem classificados corretamente:

- **carta/retrato gerado no playtest:** lembrança pessoal e não canônica da jornada, produzida por IA quando o ambiente permite;
- **ilustração oficial do produto/universo:** será produzida por artista humano; referência visual do participante é opcional e não é critério de seleção.

A carta gerada não concede aprovação, não transforma personagem em cânone, não substitui arte oficial e não deve ser apresentada como ilustração editorial definitiva. Cartas físicas, envelopes e QR Code estão estacionados em P2 até o fluxo digital ser validado.

## 8. Privacidade, consentimento e telemetria

### 8.1 Consentimento e dados pessoais

- termos, privacidade, campanha e documento operacional de consentimento devem ser acessíveis publicamente;
- entrada na campanha exige consentimento `ACCEPTED` salvo pelo backend;
- consentimento é versionado (atualmente `research-pilot-v1`), associado ao usuário/campanha e auditável por timestamp/status;
- clique local não basta; em falha de API, não avançar;
- rascunhos ficam privados do jogador; o Mestre recebe a ficha/respostas conforme submissão;
- dados de outros participantes, e-mails, join code, tokens/hashes de convite e motivos internos de indisponibilidade são secretos;
- e-mails do piloto são operacionais, não promocionais; falha de envio não desfaz transição já persistida e logs não expõem dados pessoais/credenciais.

O texto de consentimento vigente ainda carrega `requiresLegalReviewBeforeExternalPilot: true`; não tratar o documento operacional como revisão jurídica concluída para piloto externo.

### 8.2 Analytics e operação

Analytics aceita apenas metadados técnicos, como IDs autorizados, origem, versão, contagens, duração, status técnico e decisão da sugestão.

Nunca enviar:

- senha, token, `Authorization` ou credencial;
- prompt integral ou cadeia interna do provedor;
- ficha completa, texto narrativo, respostas de pesquisa ou respostas do episódio;
- segredo de Mestre, `gm_secret`, cânone secreto ou conteúdo de outros usuários.

O painel `ADMIN` recebe agregados operacionais e telemetria de IA por caso de uso, provedor, modelo, tokens e custos configurados; isso não autoriza prompts integrais, respostas narrativas ou fichas completas. Conteúdo de revisão do Mestre deve permanecer separado de métricas de funil.

O PDF da ficha é gerado localmente no navegador, sem novo endpoint ou envio a terceiros, e contém somente dados legíveis do personagem. Exclui comentário do Mestre, números internos de revisão, payloads e enums. É uma fotografia local, não um documento oficial imutável/versionado.

## 9. Glossário controlado

| Termo | Definição para o PRD | Status |
|---|---|---|
| Pessoa atual | Pessoa que existia antes da Marca; centro da autoria do jogador | Vigente |
| Marca | Manifestação da ligação com uma Alma antiga; fonte de poder, memória e consequência | Vigente |
| Arquétipo | Caminho de atuação em risco; independente de personalidade/Legado | Vigente |
| Trait | Característica narrativa positiva ou negativa acionada em cena | Vigente |
| Vínculo | Pessoa, lugar, promessa ou lembrança que liga o personagem ao mundo | Vigente |
| Legado de Alma | Memória/alma antiga que influencia sem substituir a pessoa atual | Nome e modelo propostos |
| Dom ancestral | Singularidade oferecida pelo Legado; no protótipo é obrigatório e sem custo | Hipótese ligada ao Legado |
| Eco da Alma | Capacidade, hábito, memória ou peso narrativo associado ao Legado | Nome/regra propostos |
| Fardo | Eco que cria custo, tensão e decisões; não é punição nem controle do personagem | Conceito vigente; obrigatoriedade é hipótese |
| Pontos de Essência | Orçamento prototípico de peso narrativo dos Ecos | Hipótese de regra |
| Pontos de Ascensão (PA) | Recurso ligado à Marca e a momentos heroicos | Vigente |
| Contexto público | Lore e perguntas aprovadas que podem chegar ao jogador | Vigente |
| Cânone da mesa | Versão dos fatos validada pelo Mestre para aquela campanha | Vigente |
| Cânone oficial | Conteúdo do universo aprovado pela autoridade autoral/produto | Vigente como governança |
| Segredo do Mestre | Conteúdo restrito que nunca deve chegar a jogador/espectador ou IA do jogador | Vigente |
| Sugestão de IA | Alternativa estruturada e auditável, sem efeito até decisão/persistência humana | Vigente |
| Carta ilustrada | Arte pessoal do playtest, persistida e baixável; não é ilustração oficial/canônica | Vigente, com ambiente configurado |
| ADMIN | Papel global para operação do sistema | Vigente |
| MASTER | Papel contextual da mesa; revisa e aprova dentro daquela mesa | Vigente |

## 10. Matriz final de contradições e decisões

| Tema | Evidência conflitante/aparente | Reconciliação para o PRD |
|---|---|---|
| 10 Pontos de Essência | Manual usa como fluxo, mas o chama de hipótese | Aplicar somente pela configuração versionada do piloto; não canonizar |
| Ecos como Traits | Manual do Jogador pede Traits livres; construção mapeia Eco/Fardo | Mapeamento é hipótese para evitar duplicação, não regra global definitiva |
| Quatro histórias/Legados | Conteúdo detalhado parece lore pronta | Histórias e nomes são protótipos não canônicos até aprovação |
| Perguntas do episódio | Status diz que criar ficha não as exige; backend exige na submissão | Rascunho pode nascer sem elas; envio não pode |
| `APPROVED` versus “Ativo” | Manual lista cinco estados; backend lista quatro | “Ativo” não é `sheetStatus` vigente |
| ADMIN versus Mestre | UI administrativa pode mostrar operação | ADMIN global não herda autoridade de Mestre na mesa |
| Aceitar IA versus aplicar | Interface fala “Aceitar”; contrato diz que decisão não altera ficha | Aceite registra decisão; persistência da ficha é ação explícita separada |
| Carta por IA versus arte oficial humana | Playtest gera carta; kit proíbe IA em ilustração oficial | Carta é arte pessoal não canônica; arte editorial/oficial é humana |
| Uma carta versus futuras variantes/retries | Estado do playtest fixa uma geração; docs não detalham variantes | Garantir uma geração por personagem; demais capacidades ficam fora de escopo |
| Regra de auto-revisão | Matriz manda testar que Mestre não revise o próprio personagem | Requisito pretendido, ainda não comprovado em E2E/contrato detalhado |
| Privacidade no frontend | UI pode esconder campos | Segurança deve ocorrer no backend; segredo não pode chegar ao browser |

## 11. Fontes consideradas

- `AGENTS.md`
- `docs/manual_do_jogador_bravantus_v0_1.md`
- `docs/Bravantus_Manual_Construcao_Personagem_v0.1.md`
- `docs/Bravantus_Kit_Teste_Fechado_Criacao_Personagens_v0.1.md`
- `docs/bravantus-criterios-hotspots-ia.md`
- `docs/frontend-permissions-model.md`
- `docs/mvp-backend-endpoints.md`
- `docs/mvp-pilot-flow-critical-analysis.md`
- `docs/playtest-status-2026-08-14.md`
- `docs/pilot-e2e-matrix.md`
- `docs/Bravantus_Fundacao_Visual_v0.1.md`
