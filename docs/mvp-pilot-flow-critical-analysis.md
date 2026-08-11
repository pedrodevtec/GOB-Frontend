# Analise critica dos fluxos do MVP piloto

Data: 2026-08-11

Escopo: fluxo publico e autenticado do piloto `pilot-v1`, com base nos documentos em `docs` e no estado atual do frontend.

## Documentos usados como referencia

- `docs/mvp-frontend-backlog.md`
- `docs/mvp-backend-endpoints.md`
- `docs/mvp-pilot-manual-checklist.md`
- `docs/Bravantus_Kit_Teste_Fechado_Criacao_Personagens_v0.1.md`
- `docs/Bravantus_Manual_Construcao_Personagem_v0.1.md`
- `docs/frontend-permissions-model.md`
- `docs/frontend-table-gameplay-flow.md`

## Fluxo implementado hoje

O frontend ja possui uma rota publica por campanha em `/campanhas/[slug]`, com painel de campanha, estados de carregamento, erro, campanha encerrada, sessao expirada e disponibilidade. A pagina preserva `returnTo` para login e cadastro, e o painel decide o proximo passo com base em `resume`, consentimento, membership e status do personagem.

As etapas publicas/autenticadas do piloto existem como rotas:

- `/campanhas/[slug]`
- `/campanhas/[slug]/consentimento`
- `/campanhas/[slug]/entrada`
- `/campanhas/[slug]/episodio-1`
- `/campanhas/[slug]/personagem`
- `/campanhas/[slug]/personagem/ia`
- `/campanhas/[slug]/personagem/revisao`
- `/campanhas/[slug]/pesquisa`
- `/campanhas/[slug]/conclusao`

O frontend tambem ja possui contratos para campanha publica, retomada do usuario, consentimento, entrada na campanha, builder, personagem, sugestoes de IA, decisao da sugestao, pesquisa final, eventos de analytics e painel operacional. Isso esta alinhado com o inventario de `docs/mvp-backend-endpoints.md`.

## Correcao aplicada no fluxo de campanha

A pagina publica da campanha renderizava "Entrar" e "Criar conta" no topo a partir de um Server Component, sem consultar a sessao do usuario. Isso fazia os CTAs aparecerem mesmo para usuarios logados.

Ajuste aplicado:

- Os CTAs do topo foram movidos para `CampaignAuthActions`, um Client Component que consulta `useAuthStore`.
- Enquanto o Zustand ainda nao hidratou, o topo mostra estado neutro de verificacao de sessao.
- Se houver usuario ou token valido, o topo mostra "Painel" e "Continuar campanha".
- O painel publico tambem espera a hidratacao antes de renderizar acoes de visitante.

Esse comportamento atende melhor o criterio do backlog: usuario autenticado deve retornar a campanha correta apos login/cadastro, e a rota publica nao deve tratar sessao valida como visitante.

## Analise critica por tema

### 1. Autenticacao e retorno ao fluxo

Status: parcialmente adequado.

Pontos fortes:

- `returnTo` existe e e usado em login/cadastro.
- O token e persistido em localStorage e cookie.
- `AuthBootstrap` tenta restaurar o usuario autenticado.
- 401 leva a estado de sessao expirada ou redirecionamento conforme contexto.

Riscos:

- A experiencia ainda depende bastante da hidratacao client-side. Sem cuidado, telas publicas podem piscar estados de visitante antes de reconhecer sessao.
- A confirmacao de e-mail precisa continuar preservando `returnTo` ate o retorno ao fluxo, principalmente em cadastro iniciado pela campanha.

Recomendacao:

- Padronizar componentes de CTA autenticado para todas as paginas publicas do piloto.
- Validar manualmente: login, cadastro, confirmacao de e-mail, refresh da pagina e retorno direto por URL.

### 2. Separacao entre publico e secreto

Status: adequado na intencao, exige vigilancia.

Pontos fortes:

- O contrato backend explicita campos proibidos: `gm_secret`, `SECRET_CANON`, prompts integrais, tokens, ficha completa em analytics e conteudo de Mestre.
- As rotas publicas do piloto consomem endpoints publicos ou endpoints autenticados do proprio usuario.
- A IA do jogador segue o principio "A IA sugere; o jogador decide".

Riscos:

- A seguranca real depende do backend filtrar corretamente contexto, builder e campanha. O frontend nao deve compensar vazamento de campos secretos apenas escondendo UI.
- Eventos de analytics precisam continuar enviando somente metadados tecnicos, nunca texto narrativo completo, prompt ou ficha.

Recomendacao:

- Manter uma revisao especifica de payloads antes de fechar o piloto.
- Criar checklist de inspecao de Network para confirmar que nenhum dado secreto chega ao browser do jogador.

### 3. Fluxo de personagem

Status: funcional como MVP, mas ainda sensivel a completude de contrato.

Pontos fortes:

- Existe builder em `/personagem`, etapa de IA, revisao e submissao.
- O status `DRAFT`/`SUBMITTED` e considerado para bloquear ou redirecionar.
- O kit do teste fechado pede foco em identidade, Alma antiga, Marca, Ecos, Fardo e vinculos; o fluxo ja se organiza ao redor de dossie criativo.

Riscos:

- O documento do kit exige que o personagem seja uma pessoa atual antes da Marca. O fluxo deve garantir que essa parte nao vire apenas selecao mecanica de classe/base.
- O manual de criacao tem linguagem e criterios ricos; se o backend nao devolver catalogos/perguntas completas, o frontend pode acabar com campos genericos demais.

Recomendacao:

- Conferir se os campos obrigatorios do frontend cobrem as quatro perguntas do Episodio 1 e os elementos centrais do dossie.
- Evitar transformar bases de Alma em classes rigidas na UI.

### 4. Consentimento, termos e privacidade

Status: parcialmente adequado.

Pontos fortes:

- Existem rotas e componentes para termos, privacidade e consentimento.
- O contrato backend possui documento de consentimento publico e aceite autenticado.

Riscos:

- O checklist exige bloqueio do aceite definitivo quando versao/timestamp nao forem registrados.
- O consentimento precisa ser versionado (`research-pilot-v1`) e auditavel. A UI nao pode tratar um clique local como aceite suficiente.

Recomendacao:

- Garantir que a tela de consentimento exponha versao retornada pela API e so avance apos sucesso do backend.
- Em erro de API, manter o usuario no consentimento com mensagem clara.

### 5. Pesquisa final e conclusao

Status: implementacao presente, validacao ainda necessaria.

Pontos fortes:

- O contrato de pesquisa final existe e diferencia configuracao publica de resposta autenticada.
- O fluxo reconhece personagem submetido e encaminha para pesquisa.

Riscos:

- A conclusao nao deve presumir sucesso do piloto sem resposta final registrada.
- Respostas narrativas da pesquisa nao devem ser enviadas em analytics.

Recomendacao:

- Validar estado "ja respondido", edicao permitida enquanto campanha ativa e bloqueio quando campanha encerrada.

### 6. Operacao/admin

Status: util para MVP, mas ainda precisa de prova operacional.

Pontos fortes:

- Ha painel em `/admin/piloto`.
- Contrato backend preve funil operacional agregado.

Riscos:

- O admin nao deve receber prompts integrais, respostas narrativas ou ficha completa se o objetivo da tela for apenas funil.
- O projeto precisa decidir quais metricas sao essenciais para acompanhar o piloto sem invadir conteudo criativo.

Recomendacao:

- Separar claramente metricas operacionais de conteudo de revisao do Mestre.
- Validar permissao ADMIN e estados 403/401.

## Estamos atendendo o necessario para seguir?

Resposta curta: sim, para seguir com validacao integrada do MVP; ainda nao para considerar o fluxo fechado.

O frontend ja tem a estrutura principal: rota publica, preservacao de retorno, consentimento, entrada, contexto, builder, IA assistiva, revisao, pesquisa, conclusao e operacao. Isso corresponde ao desenho prescrito nos documentos.

Os pontos que impedem considerar pronto sao:

- validar end-to-end com backend real e campanha `pilot-v1` ativa;
- confirmar que os payloads publicos nao incluem segredo de Mestre;
- confirmar que consentimento e pesquisa salvam versao/timestamp no backend;
- revisar o builder contra o kit de criacao para garantir que identidade, vinculos, Marca, Ecos e Fardo nao fiquem superficiais;
- testar refresh, sessao expirada e retorno por URL em todas as etapas;
- revisar textos com caracteres corrompidos antes de expor para participantes.

## Proxima validacao recomendada

Executar `docs/mvp-pilot-manual-checklist.md` contra um backend real, com pelo menos:

- usuario novo;
- usuario ja logado;
- usuario com consentimento aceito;
- usuario com membership ativa;
- usuario com personagem em rascunho;
- usuario com personagem submetido;
- conta ADMIN.

Durante a validacao, manter DevTools aberto em Network e registrar qualquer payload que contrarie `docs/mvp-backend-endpoints.md`.
