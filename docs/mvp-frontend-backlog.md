# Backlog Frontend MVP - Guardian of Bravantus

Auditoria realizada somente no repositório frontend.

## Escopo auditado

- Instruções locais: `AGENTS.md` não encontrado no repositório.
- Stack e scripts: `package.json`.
- Ambiente: `.env.example` expõe as chaves `NEXT_PUBLIC_API_BASE_URL` e `NEXT_PUBLIC_APP_NAME`.
- Rotas: `app/page.tsx`, `app/(public)/*`, `app/(protected)/*`, `middleware.ts`.
- Layouts: `app/layout.tsx`, `app/(public)/layout.tsx`, `app/(protected)/layout.tsx`, `components/layout/*`.
- Autenticação e sessão: `features/auth/*`, `stores/auth-store.ts`, `lib/auth/token-storage.ts`, `components/providers/auth-bootstrap.ts`.
- API: `lib/api/client.ts`, `lib/api/contracts.ts`, `features/*/services/*`, `features/*/hooks/*`.
- Estado: Zustand em `stores/*`, TanStack Query em `lib/api/query-client.ts`.
- Formulários: `features/auth/components/*`, `features/characters/components/character-form.tsx`, `features/tables/components/*`.
- Componentes reutilizáveis: `components/ui/*`, `components/states/*`, `components/common/logo.tsx`.
- Estilos e identidade: `app/globals.css`, `tailwind.config.ts`, `public/images/*`, `Imagens/*`.
- Documentação: `README.md`, `docs/frontend-table-gameplay-flow.md`, `docs/frontend-permissions-model.md`, `docs/frontend-legacy-to-tables-map.md`, `docs/rpg-tables-mvp-qa.md`, `openapi/README.md`.

## Diagnóstico por capacidade

| Capacidade | Status | Evidência |
| --- | --- | --- |
| Fundação visual do Bravantus | PARCIAL | Tokens em `app/globals.css` e `tailwind.config.ts`; `Logo`; imagens em `public/images` e `Imagens`; falta aplicar padrão específico ao fluxo público do piloto sem trocar identidade. |
| Componentes compartilhados de interface | PARCIAL | `components/ui/*`, `LoadingState`, `ErrorState`, `EmptyState`; faltam estados específicos de campanha encerrada, sessão expirada no fluxo, conteúdo submetido e salvamento. |
| Cliente API e tratamento de erro | PARCIAL | `apiClient`, interceptador 401, `ApiRequestError`, contratos normalizados; faltam módulos do MVP público: campanha pública, consentimento, builder, pesquisa e conclusão. |
| Sessão/autenticação | PARCIAL | Login, registro, cookie `gob_access_token`, Zustand persistido, middleware; falta confirmação de e-mail, retorno ao link público e estados de campanha. |
| Link público da campanha | AUSENTE | `middleware.ts` só libera `/`, `/login`, `/register`; não há rota pública de campanha. |
| Landing pública da campanha | PARCIAL | `app/page.tsx` é landing genérica do produto; não há landing pública específica por campanha/piloto. |
| Termos e privacidade | AUSENTE | Não há rotas ou componentes de termos/privacidade. |
| Consentimento | AUSENTE | Não há UI, estado ou contrato de consentimento. |
| Cadastro | PARCIAL | `RegisterForm` existe; redireciona para `/characters/create`; não preserva contexto de campanha nem confirmação de e-mail. |
| Confirmação de e-mail | AUSENTE | Não há rota, formulário ou contrato no frontend. |
| Entrada na campanha | PARCIAL | Existe `/tables/join` por código autenticado; não atende entrada por link público e consentimento. |
| Contexto público do Episódio 1 | AUSENTE | Não há rota/conteúdo público específico do Episódio 1. |
| Character Builder em etapas | PARCIAL | `CharacterForm` e `TablePlayerPanel` criam personagem com `name` e `classId`; não há fluxo em etapas. |
| Catálogo do Builder via API | PARCIAL | Classes vêm de `/api/v1/characters/classes`; não há catálogo completo do builder nem contrato de schema por etapa. |
| Salvar e retomar rascunho | AUSENTE | Stores persistem auth/personagem ativo, mas não rascunho de campanha. |
| IA assistiva para participante | PARCIAL | IA existe no painel do mestre em `TableMasterPanel`; sugestões de traits aparecem para jogador, mas sem aceitar/editar/descartar pelo participante no builder. |
| Revisão e submissão do personagem | PARCIAL | Criação de personagem de mesa envia para revisão do mestre; não há revisão final multi-etapas nem submissão de builder. |
| Pesquisa final | AUSENTE | Não há rota, formulário, estado ou contrato. |
| Confirmação de conclusão | AUSENTE | Não há tela final de conclusão do participante. |
| Painel operacional mínimo | PARCIAL | `CampaignDashboard`, `/admin`, `/tables/[id]/master`; falta visão específica do piloto com funil e status do MVP. |

## BRA-FE-01 - Fundação visual e componentes compartilhados do MVP

**Camada:** Frontend  
**Prioridade:** P0  
**Status atual:** Parcial  
**Depende de:** nenhuma  
**Desbloqueia:** BRA-FE-02, BRA-FE-03, BRA-FE-07, BRA-FE-12, BRA-FE-13, BRA-FE-14

### Objetivo

Padronizar a base visual e os estados reutilizáveis necessários para todo o fluxo público do piloto.

### Evidência atual

- `app/globals.css` define tokens de cor, fontes e painéis.
- `tailwind.config.ts` expõe tokens semânticos e fontes.
- `components/ui/button.tsx`, `card.tsx`, `input.tsx`, `textarea.tsx`, `badge.tsx`, `dialog.tsx`.
- `components/states/loading-state.tsx`, `error-state.tsx`, `empty-state.tsx`.
- `components/common/logo.tsx` usa `public/images/logos/brand.png`.
- Imagens de fundo em `public/images/backgrounds/*` e identidade em `Imagens/*`.

### Implementação necessária

- [ ] Criar variações reutilizáveis para estados de campanha encerrada, acesso negado, sessão expirada, conteúdo já submetido e salvamento em andamento.
- [ ] Definir padrões de layout responsivo para páginas públicas de campanha e páginas protegidas do builder.
- [ ] Revisar textos quebrados/encoding visíveis antes de expor telas públicas novas.
- [ ] Documentar no próprio código/componentes quais elementos fazem parte da fundação do MVP.
- [ ] Preservar tokens, logos, fundos e estilo atual, sem substituir identidade visual.

### Dependência da API

- Contrato necessário: nenhum.
- Task do backend relacionada: nenhuma.
- Dados consumidos: nenhum.
- Estados esperados: estados visuais locais.
- Comportamento temporário permitido enquanto a API não estiver disponível: componentes podem receber props estáticas ou estados derivados das páginas consumidoras.

### Estados obrigatórios da interface

- carregamento;
- sucesso;
- vazio;
- erro;
- acesso negado;
- sessão expirada;
- campanha encerrada;
- salvamento em andamento;
- conteúdo já submetido.

### Critérios de aprovação

- Componentes funcionam em desktop e mobile.
- Componentes preservam tokens existentes de `globals.css` e `tailwind.config.ts`.
- Estados obrigatórios podem ser usados sem duplicação nas páginas do MVP.
- Nenhum módulo legado de combate, rolagem, PvP, shop ou missões é promovido ao fluxo do piloto.
- Textos públicos não apresentam caracteres corrompidos.

### Validação permitida

- inspeção do código;
- typecheck;
- lint, se configurado;
- build;
- conferência visual em desktop e mobile;
- comparação com a Fundação Visual.

### Fora do escopo

- Alterar regras de RPG.
- Trocar a marca ou identidade visual.
- Implementar páginas do fluxo.
- Criar testes automatizados.

### Instrução de execução futura

Implemente somente esta Task. Antes de alterar arquivos, confira novamente a evidência atual e preserve os padrões existentes.

## BRA-FE-02 - Rotas públicas, sessão e estados de campanha

**Camada:** Integração  
**Prioridade:** P0  
**Status atual:** Parcial  
**Depende de:** BRA-FE-01  
**Desbloqueia:** BRA-FE-03, BRA-FE-04, BRA-FE-05, BRA-FE-06, BRA-FE-07, BRA-FE-12

### Objetivo

Permitir que links públicos de campanha e etapas autenticadas do MVP convivam com login, retorno de sessão e bloqueios claros.

### Evidência atual

- `middleware.ts` libera apenas `/`, `/login`, `/register`.
- `stores/auth-store.ts` persiste sessão.
- `lib/auth/token-storage.ts` grava token em localStorage e cookie.
- `features/auth/hooks/use-auth.ts` redireciona login para `/dashboard` e cadastro para `/characters/create`.
- `components/providers/auth-bootstrap.tsx` tenta carregar usuário autenticado.
- `lib/api/client.ts` limpa token em 401.

### Implementação necessária

- [ ] Criar estratégia de rotas públicas para campanha, termos, privacidade e confirmação de e-mail.
- [ ] Preservar origem do link público durante cadastro, login, confirmação e retorno ao fluxo.
- [ ] Tratar sessão expirada dentro do fluxo de campanha sem perder rascunho local permitido.
- [ ] Adicionar camada de estado de campanha: aberta, encerrada, indisponível e acesso negado.
- [ ] Encapsular redirecionamentos para evitar envio genérico ao dashboard quando o usuário está em campanha do piloto.

### Dependência da API

- Contrato necessário: status público da campanha e status de participação do usuário autenticado.
- Task do backend relacionada: CONTRATO BACKEND PENDENTE: consultar campanha pública e participação do usuário.
- Dados consumidos: identificador público da campanha, status, datas, flags de inscrição, consentimento, e-mail confirmado e submissão final.
- Estados esperados: carregamento, aberta, encerrada, não encontrada, acesso negado, sessão expirada.
- Comportamento temporário permitido enquanto a API não estiver disponível: preparar rotas, guards visuais e navegação, sem presumir formato final de endpoint.

### Estados obrigatórios da interface

- carregamento;
- sucesso;
- erro;
- acesso negado;
- sessão expirada;
- campanha encerrada;
- conteúdo já submetido.

### Critérios de aprovação

- Link público de campanha não é redirecionado indevidamente para login antes de carregar dados públicos permitidos.
- Usuário autenticado retorna à campanha correta após login ou cadastro.
- Sessão expirada mostra ação clara para entrar novamente.
- Campanha encerrada bloqueia ações de cadastro/submissão com mensagem clara.
- Middleware mantém proteção das rotas privadas existentes.

### Validação permitida

- inspeção do código;
- typecheck;
- lint, se configurado;
- build;
- verificação manual do fluxo.

### Fora do escopo

- Implementar conteúdo da landing.
- Criar contratos definitivos de backend.
- Alterar módulos de gameplay legado.
- Criar testes automatizados.

### Instrução de execução futura

Implemente somente esta Task. Antes de alterar arquivos, confira novamente a evidência atual e preserve os padrões existentes.

## BRA-FE-03 - Landing pública da campanha, termos e privacidade

**Camada:** Integração  
**Prioridade:** P0  
**Status atual:** Parcial  
**Depende de:** BRA-FE-01, BRA-FE-02  
**Desbloqueia:** BRA-FE-04, BRA-FE-05, BRA-FE-06

### Objetivo

Exibir a proposta pública da campanha, com acesso claro a termos e privacidade antes do cadastro e consentimento.

### Evidência atual

- `app/page.tsx` é landing genérica do produto com CTA para `/register` e `/login`.
- `app/(public)/layout.tsx` existe, mas sem estrutura específica de campanha.
- `README.md` lista apenas `/login` e `/register` como rotas públicas.
- Não há páginas de termos ou privacidade.

### Implementação necessária

- [ ] Criar rota pública de campanha por identificador público.
- [ ] Exibir proposta, status, datas visíveis, chamada para cadastro/login e links de termos/privacidade.
- [ ] Criar rotas públicas de termos e privacidade usando conteúdo aprovado.
- [ ] Exibir estados de campanha não encontrada, encerrada e indisponível.
- [ ] Garantir que nenhum conteúdo secreto ou expansão de lore seja renderizado.

### Dependência da API

- Contrato necessário: consulta pública de campanha e documentos legais publicados.
- Task do backend relacionada: CONTRATO BACKEND PENDENTE: campanha pública, termos e privacidade.
- Dados consumidos: título, descrição pública, status, datas, imagem/tema permitido, versão dos termos, versão da privacidade.
- Estados esperados: carregamento, sucesso, campanha encerrada, não encontrada, erro.
- Comportamento temporário permitido enquanto a API não estiver disponível: criar estrutura visual e estados; textos legais definitivos dependem de decisão/conteúdo aprovado.

### Estados obrigatórios da interface

- carregamento;
- sucesso;
- vazio;
- erro;
- campanha encerrada.

### Critérios de aprovação

- Interface funciona em desktop e mobile.
- CTA preserva a campanha de origem para cadastro/login.
- Termos e privacidade são acessíveis sem autenticação.
- Conteúdo secreto do episódio/campanha não é renderizado.
- Campanha encerrada não oferece cadastro como ação principal.

### Validação permitida

- inspeção do código;
- typecheck;
- lint, se configurado;
- build;
- conferência visual em desktop e mobile;
- comparação com a Fundação Visual.

### Fora do escopo

- Redigir juridicamente termos e privacidade.
- Implementar consentimento.
- Implementar cadastro ou confirmação de e-mail.
- Criar regras de RPG no frontend.

### Instrução de execução futura

Implemente somente esta Task. Antes de alterar arquivos, confira novamente a evidência atual e preserve os padrões existentes.

## BRA-FE-04 - Cadastro orientado por campanha e confirmação de e-mail

**Camada:** Integração  
**Prioridade:** P0  
**Status atual:** Parcial  
**Depende de:** BRA-FE-02, BRA-FE-03  
**Desbloqueia:** BRA-FE-05, BRA-FE-07

### Objetivo

Permitir que o participante se cadastre a partir da campanha e confirme o e-mail antes de entrar no fluxo protegido.

### Evidência atual

- `app/(public)/register/page.tsx` e `RegisterForm` existem.
- `features/auth/schemas.ts` valida usuário, e-mail, senha e confirmação de senha.
- `features/auth/hooks/use-auth.ts` autentica após cadastro e redireciona para `/characters/create`.
- `apiContracts.auth.register` chama `/api/v1/auth/register`.
- Não há rota de confirmação de e-mail.

### Implementação necessária

- [ ] Adaptar cadastro para preservar campanha de origem.
- [ ] Criar telas de confirmação pendente, confirmação por token e reenvio.
- [ ] Ajustar redirecionamento pós-cadastro para consentimento/entrada da campanha, não para personagem solto.
- [ ] Mostrar estados de e-mail já confirmado, token inválido, token expirado e campanha encerrada.
- [ ] Manter login/cadastro genéricos funcionando fora do fluxo de campanha.

### Dependência da API

- Contrato necessário: cadastro com contexto opcional de campanha, confirmação de e-mail, reenvio de confirmação e status de e-mail confirmado.
- Task do backend relacionada: CONTRATO BACKEND PENDENTE: confirmação de e-mail e cadastro associado à campanha.
- Dados consumidos: usuário, token/status de confirmação, campanha pendente, erros de token.
- Estados esperados: carregamento, sucesso, e-mail pendente, token inválido, token expirado, erro, sessão expirada.
- Comportamento temporário permitido enquanto a API não estiver disponível: criar rotas e estados visuais; não simular confirmação como se fosse contrato final.

### Estados obrigatórios da interface

- carregamento;
- sucesso;
- erro;
- acesso negado;
- sessão expirada;
- campanha encerrada.

### Critérios de aprovação

- Usuário iniciado em link público volta à campanha correta após cadastro.
- Usuário não confirmado vê orientação clara de confirmação/reenvio.
- Token inválido ou expirado não deixa o usuário preso sem ação.
- Cadastro fora de campanha mantém comportamento coerente com o produto atual.
- Nenhum rascunho de personagem é submetido antes da confirmação exigida.

### Validação permitida

- inspeção do código;
- typecheck;
- lint, se configurado;
- build;
- verificação manual do fluxo.

### Fora do escopo

- Implementar provedor de e-mail.
- Alterar backend.
- Criar testes automatizados.
- Criar Character Builder.

### Instrução de execução futura

Implemente somente esta Task. Antes de alterar arquivos, confira novamente a evidência atual e preserve os padrões existentes.

## BRA-FE-05 - Consentimento e entrada na campanha

**Camada:** Integração  
**Prioridade:** P0  
**Status atual:** Ausente  
**Depende de:** BRA-FE-02, BRA-FE-03, BRA-FE-04  
**Desbloqueia:** BRA-FE-06, BRA-FE-07, BRA-FE-09

### Objetivo

Registrar consentimento explícito e colocar o participante autenticado dentro da campanha correta.

### Evidência atual

- Existe `/tables/join` com `TableJoinForm` por código.
- `useJoinTable` envia `{ joinCode }` e redireciona para `/tables/[id]/player`.
- Não há componente de consentimento.
- Não há estado de versão de termos/privacidade aceitos.

### Implementação necessária

- [ ] Criar etapa de consentimento vinculada à campanha e às versões de termos/privacidade.
- [ ] Criar fluxo de entrada por link público, sem depender de digitar código manualmente.
- [ ] Exibir resumo do consentimento antes do aceite.
- [ ] Bloquear avanço quando e-mail, consentimento ou campanha não estiverem válidos.
- [ ] Registrar visualmente sucesso, erro e campanha encerrada.

### Dependência da API

- Contrato necessário: registrar consentimento, consultar consentimento atual e entrar na campanha pelo identificador público.
- Task do backend relacionada: CONTRATO BACKEND PENDENTE: consentimento versionado e entrada por campanha pública.
- Dados consumidos: versão dos termos, versão da privacidade, timestamp de aceite, status de participação, identificador da campanha vinculada.
- Estados esperados: carregamento, sem consentimento, consentido, entrada concluída, acesso negado, campanha encerrada, erro.
- Comportamento temporário permitido enquanto a API não estiver disponível: preparar tela e navegação; não persistir consentimento definitivo apenas no cliente.

### Estados obrigatórios da interface

- carregamento;
- sucesso;
- erro;
- acesso negado;
- sessão expirada;
- campanha encerrada.

### Critérios de aprovação

- Usuário só avança para campanha após consentimento registrado.
- Versões de termos e privacidade aceitas ficam visíveis na interface.
- Usuário que já consentiu não repete etapa desnecessariamente.
- Campanha encerrada impede consentimento novo.
- Estados de erro possuem retorno claro e ação possível.

### Validação permitida

- inspeção do código;
- typecheck;
- lint, se configurado;
- build;
- verificação manual do fluxo.

### Fora do escopo

- Redigir textos legais.
- Criar regras de RPG.
- Implementar builder.
- Criar testes automatizados.

### Instrução de execução futura

Implemente somente esta Task. Antes de alterar arquivos, confira novamente a evidência atual e preserve os padrões existentes.

## BRA-FE-06 - Contexto público do Episódio 1

**Camada:** Integração  
**Prioridade:** P0  
**Status atual:** Ausente  
**Depende de:** BRA-FE-03, BRA-FE-05  
**Desbloqueia:** BRA-FE-07

### Objetivo

Apresentar ao participante o contexto público aprovado do Episódio 1 antes da criação do personagem.

### Evidência atual

- `TablePlayerPanel` mostra resumo da mesa e timeline autenticada.
- `TableMasterPanel` permite configurar mundo/campanha.
- Não há rota ou componente público/protegido específico para contexto do Episódio 1.
- Documentação atual fala em mesas, missões e timeline, não em episódio público de onboarding.

### Implementação necessária

- [ ] Criar tela do contexto público do Episódio 1 após entrada/consentimento.
- [ ] Exibir apenas campos públicos aprovados pelo backend/conteúdo.
- [ ] Adicionar navegação para iniciar ou retomar o builder.
- [ ] Bloquear acesso quando consentimento, e-mail ou participação estiverem pendentes.
- [ ] Tratar campanha encerrada e conteúdo indisponível.

### Dependência da API

- Contrato necessário: obter contexto público do episódio atual da campanha.
- Task do backend relacionada: CONTRATO BACKEND PENDENTE: contexto público do Episódio 1.
- Dados consumidos: título público, resumo público, orientações ao participante, status de publicação e campanha.
- Estados esperados: carregamento, publicado, não publicado, vazio, erro, acesso negado, campanha encerrada.
- Comportamento temporário permitido enquanto a API não estiver disponível: criar estrutura visual sem expandir lore nem escrever conteúdo definitivo no frontend.

### Estados obrigatórios da interface

- carregamento;
- sucesso;
- vazio;
- erro;
- acesso negado;
- sessão expirada;
- campanha encerrada.

### Critérios de aprovação

- Conteúdo secreto não é renderizado.
- Participante entende o contexto público antes de iniciar o builder.
- Interface funciona em desktop e mobile.
- Conteúdo indisponível mostra fallback claro sem inventar lore.
- Navegação preserva campanha e progresso do participante.

### Validação permitida

- inspeção do código;
- typecheck;
- lint, se configurado;
- build;
- conferência visual em desktop e mobile.

### Fora do escopo

- Expandir lore.
- Criar regras de RPG.
- Implementar sessão de jogo.
- Criar testes automatizados.

### Instrução de execução futura

Implemente somente esta Task. Antes de alterar arquivos, confira novamente a evidência atual e preserve os padrões existentes.

## BRA-FE-07 - Estrutura do Character Builder em etapas

**Camada:** Frontend  
**Prioridade:** P0  
**Status atual:** Parcial  
**Depende de:** BRA-FE-01, BRA-FE-02, BRA-FE-05, BRA-FE-06  
**Desbloqueia:** BRA-FE-08, BRA-FE-09, BRA-FE-10, BRA-FE-11

### Objetivo

Criar a experiência guiada de criação de personagem em etapas dentro da campanha do piloto.

### Evidência atual

- `features/characters/components/character-form.tsx` cria personagem com nome e classe.
- `features/tables/components/table-player-panel.tsx` cria personagem de mesa com nome e classe.
- `useCreateTableCharacter` envia o personagem diretamente para revisão.
- `CharacterForm` consome classes da API e exibe cartões de classe.
- Não há stepper, rascunho, revisão final ou navegação de etapas.

### Implementação necessária

- [ ] Criar shell de builder com etapas, progresso, navegação anterior/próxima e responsividade.
- [ ] Separar rascunho de submissão final.
- [ ] Reaproveitar componentes UI existentes e padrões visuais.
- [ ] Bloquear etapas por status de campanha, consentimento, e-mail e conteúdo já submetido.
- [ ] Preparar pontos de integração para catálogo e salvamento, sem criar regras próprias no frontend.

### Dependência da API

- Contrato necessário: consultar progresso do participante e estado do builder.
- Task do backend relacionada: CONTRATO BACKEND PENDENTE: estado de progresso do builder de personagem por campanha.
- Dados consumidos: etapa atual, status do rascunho, status de submissão, bloqueios, campanha.
- Estados esperados: carregamento, sucesso, vazio, erro, acesso negado, sessão expirada, campanha encerrada, conteúdo já submetido.
- Comportamento temporário permitido enquanto a API não estiver disponível: montar shell e navegação visual com dados vazios controlados; não considerar mocks como contrato definitivo.

### Estados obrigatórios da interface

- carregamento;
- sucesso;
- vazio;
- erro;
- acesso negado;
- sessão expirada;
- campanha encerrada;
- salvamento em andamento;
- conteúdo já submetido.

### Critérios de aprovação

- Builder exibe etapas e progresso em desktop e mobile.
- Participante não perde contexto de campanha durante navegação.
- Conteúdo já submetido bloqueia edição indevida.
- Shell não contém catálogo próprio de atributos, traits ou equipamentos.
- Estados obrigatórios possuem retorno claro.

### Validação permitida

- inspeção do código;
- typecheck;
- lint, se configurado;
- build;
- verificação manual do fluxo;
- conferência visual em desktop e mobile.

### Fora do escopo

- Implementar campos definitivos de cada etapa.
- Implementar IA assistiva.
- Criar regras de RPG no frontend.
- Criar testes automatizados.

### Instrução de execução futura

Implemente somente esta Task. Antes de alterar arquivos, confira novamente a evidência atual e preserve os padrões existentes.

## BRA-FE-08 - Etapas e formulários do Builder orientados por catálogo da API

**Camada:** Integração  
**Prioridade:** P0  
**Status atual:** Parcial  
**Depende de:** BRA-FE-07  
**Desbloqueia:** BRA-FE-09, BRA-FE-10, BRA-FE-11

### Objetivo

Renderizar as etapas e campos de criação usando dados oficiais vindos da API, sem manter regras ou catálogos próprios no frontend.

### Evidência atual

- `CharacterForm` usa `useCharacterClasses` e `apiContracts.characters.classes`.
- `class-presentation.ts` contém apenas apresentação de classes, mas também infere classe base por campos retornados.
- `TablePlayerPanel` possui schema local mínimo `{ name, classId }`.
- `types/app.ts` contém muitos DTOs de personagem, traits e mesa.

### Implementação necessária

- [ ] Mapear DTOs de catálogo do builder somente após contrato backend.
- [ ] Renderizar campos por etapa com validações de presença/formato, não regras oficiais completas.
- [ ] Consumir opções de atributos, arquétipos, traits ou equipamentos apenas da API.
- [ ] Exibir descrições e restrições retornadas pelo backend como conteúdo informativo.
- [ ] Garantir que campos ausentes ou contrato incompleto gerem estado de erro claro.

### Dependência da API

- Contrato necessário: catálogo/schema do Character Builder por campanha.
- Task do backend relacionada: CONTRATO BACKEND PENDENTE: catálogo oficial do builder por campanha/episódio.
- Dados consumidos: etapas, campos, opções, textos públicos, restrições apresentáveis, defaults permitidos, metadados de validação.
- Estados esperados: carregamento, sucesso, catálogo vazio, erro, acesso negado, campanha encerrada.
- Comportamento temporário permitido enquanto a API não estiver disponível: manter shell visual; não criar catálogo local definitivo.

### Estados obrigatórios da interface

- carregamento;
- sucesso;
- vazio;
- erro;
- acesso negado;
- sessão expirada;
- campanha encerrada;
- salvamento em andamento.

### Critérios de aprovação

- Catálogo do Builder vem da API.
- Frontend não mantém lista própria de atributos, traits ou equipamentos.
- Formulários funcionam em desktop e mobile.
- Erro de catálogo indisponível não deixa usuário preencher dados inválidos.
- Campos obrigatórios apresentam feedback claro antes de avançar.

### Validação permitida

- inspeção do código;
- typecheck;
- lint, se configurado;
- build;
- verificação manual do fluxo.

### Fora do escopo

- Definir regras oficiais.
- Criar ou alterar endpoints no backend.
- Implementar salvamento definitivo.
- Criar testes automatizados.

### Instrução de execução futura

Implemente somente esta Task. Antes de alterar arquivos, confira novamente a evidência atual e preserve os padrões existentes.

## BRA-FE-09 - Salvamento e retomada do rascunho

**Camada:** Integração  
**Prioridade:** P0  
**Status atual:** Ausente  
**Depende de:** BRA-FE-07, BRA-FE-08  
**Desbloqueia:** BRA-FE-10, BRA-FE-11

### Objetivo

Permitir que o participante salve o rascunho do personagem e retome a criação após sair ou fazer novo login.

### Evidência atual

- Zustand persiste sessão e personagem ativo, não rascunho do builder.
- TanStack Query já é usado para cache e invalidação.
- `TablePlayerPanel` só mantém respostas de missão em `useState`.
- `useCreateTableCharacter` submete diretamente, sem rascunho intermediário.

### Implementação necessária

- [ ] Criar hooks/serviço para carregar, salvar e atualizar rascunho.
- [ ] Exibir estado visível de salvamento em andamento, salvo e erro de salvamento.
- [ ] Retomar etapa correta após novo login.
- [ ] Evitar sobrescrever submissão final com alterações locais.
- [ ] Definir comportamento local temporário apenas para proteção contra perda de edição, quando permitido.

### Dependência da API

- Contrato necessário: CRUD ou upsert de rascunho do builder por participante/campanha.
- Task do backend relacionada: CONTRATO BACKEND PENDENTE: persistência de rascunho do personagem.
- Dados consumidos: draftId, campaignId, currentStep, payload parcial, updatedAt, version/revision, status.
- Estados esperados: carregamento, sem rascunho, salvando, salvo, conflito, erro, sessão expirada, campanha encerrada, conteúdo já submetido.
- Comportamento temporário permitido enquanto a API não estiver disponível: persistência local apenas como proteção de formulário e com aviso de não sincronizado; não tratar como fonte definitiva.

### Estados obrigatórios da interface

- carregamento;
- sucesso;
- vazio;
- erro;
- sessão expirada;
- campanha encerrada;
- salvamento em andamento;
- conteúdo já submetido.

### Critérios de aprovação

- Usuário retoma a campanha após novo login.
- Salvamento apresenta estado visível.
- Falha de salvamento mantém dados editados na tela quando possível.
- Rascunho não é editável após submissão final.
- Conflito ou versão desatualizada mostra orientação clara.

### Validação permitida

- inspeção do código;
- typecheck;
- lint, se configurado;
- build;
- verificação manual do fluxo.

### Fora do escopo

- Criar testes automatizados.
- Definir schema oficial do personagem.
- Implementar IA assistiva.
- Alterar backend.

### Instrução de execução futura

Implemente somente esta Task. Antes de alterar arquivos, confira novamente a evidência atual e preserve os padrões existentes.

## BRA-FE-10 - Revisão e submissão final do personagem

**Camada:** Integração  
**Prioridade:** P0  
**Status atual:** Parcial  
**Depende de:** BRA-FE-07, BRA-FE-08, BRA-FE-09  
**Desbloqueia:** BRA-FE-12, BRA-FE-13, BRA-FE-14

### Objetivo

Permitir que o participante revise o personagem completo e envie a submissão final para o piloto.

### Evidência atual

- `useCreateTableCharacter` envia personagem para revisão do mestre.
- `TablePlayerPanel` exibe status de review de personagem.
- `TableMasterPanel` revisa personagens pendentes.
- Não há tela de revisão final do builder nem bloqueio de edição pós-submissão.

### Implementação necessária

- [ ] Criar etapa de revisão com resumo do personagem preenchido.
- [ ] Exigir confirmação explícita antes da submissão final.
- [ ] Enviar payload normalizado conforme contrato backend.
- [ ] Bloquear edição e nova submissão quando conteúdo já estiver submetido.
- [ ] Exibir sucesso, erro, conteúdo já submetido e campanha encerrada.

### Dependência da API

- Contrato necessário: validar e submeter personagem final do builder.
- Task do backend relacionada: CONTRATO BACKEND PENDENTE: submissão final do personagem do piloto.
- Dados consumidos: draft validado, resumo de submissão, status final, erros de validação por etapa/campo.
- Estados esperados: carregamento, válido, inválido, submetendo, submetido, erro, campanha encerrada, conteúdo já submetido.
- Comportamento temporário permitido enquanto a API não estiver disponível: tela de revisão visual; botão de submissão deve ficar bloqueado ou indicar dependência pendente.

### Estados obrigatórios da interface

- carregamento;
- sucesso;
- vazio;
- erro;
- acesso negado;
- sessão expirada;
- campanha encerrada;
- salvamento em andamento;
- conteúdo já submetido.

### Critérios de aprovação

- Participante revisa todos os dados antes de enviar.
- Submissão final não ocorre automaticamente ao salvar rascunho.
- Conteúdo já submetido bloqueia alterações indevidas.
- Erros de validação apontam etapa/campo afetado.
- Interface funciona em desktop e mobile.

### Validação permitida

- inspeção do código;
- typecheck;
- lint, se configurado;
- build;
- verificação manual do fluxo.

### Fora do escopo

- Aprovação do mestre.
- Regras oficiais de validação no frontend.
- Combate, rolagens ou sessões.
- Criar testes automatizados.

### Instrução de execução futura

Implemente somente esta Task. Antes de alterar arquivos, confira novamente a evidência atual e preserve os padrões existentes.

## BRA-FE-11 - Interface da IA assistiva para o participante

**Camada:** Integração  
**Prioridade:** P0  
**Status atual:** Parcial  
**Depende de:** BRA-FE-07, BRA-FE-08, BRA-FE-09  
**Desbloqueia:** BRA-FE-10

### Objetivo

Oferecer ajuda opcional da IA no builder, garantindo que o jogador aceite, edite ou descarte cada sugestão.

### Evidência atual

- `TableMasterPanel` possui assistente IA para mestre.
- `AIAssistantActionCard` existe.
- `TablePlayerPanel` lista sugestões de traits vindas do mestre/IA.
- `useApplyTraitSuggestion` e `useDismissTraitSuggestion` existem, mas não são usados na interface do jogador atual.
- IA atual é orientada a mesa/mestre, não ao builder do participante.

### Implementação necessária

- [ ] Criar UI opcional de IA dentro das etapas do builder.
- [ ] Mostrar sugestão como rascunho, sem alterar a ficha automaticamente.
- [ ] Permitir aceitar, editar antes de aplicar ou descartar sugestão.
- [ ] Registrar visualmente fonte, status e histórico mínimo da decisão.
- [ ] Tratar IA não configurada como estado de ambiente sem bloquear o fluxo manual.

### Dependência da API

- Contrato necessário: gerar sugestões de builder por etapa, registrar decisão do jogador e recuperar histórico/status.
- Task do backend relacionada: CONTRATO BACKEND PENDENTE: IA assistiva do builder e registro de decisões.
- Dados consumidos: sugestão, campo/etapa alvo, source, status, decisão, texto editado, erros de ambiente.
- Estados esperados: carregando, sugestão gerada, vazio, erro, IA não configurada, aceito, editado, descartado, salvando.
- Comportamento temporário permitido enquanto a API não estiver disponível: preparar slots visuais e estados; não gerar mocks definitivos nem aplicar sugestão automaticamente.

### Estados obrigatórios da interface

- carregamento;
- sucesso;
- vazio;
- erro;
- acesso negado;
- sessão expirada;
- campanha encerrada;
- salvamento em andamento.

### Critérios de aprovação

- Sugestão da IA pode ser aceita, editada ou descartada.
- Sugestão não altera a ficha automaticamente.
- Fluxo manual continua disponível quando IA não estiver configurada.
- Decisão do jogador fica visualmente clara.
- Interface funciona em desktop e mobile.

### Validação permitida

- inspeção do código;
- typecheck;
- lint, se configurado;
- build;
- verificação manual do fluxo.

### Fora do escopo

- Criar regras oficiais.
- Substituir julgamento do jogador.
- Implementar assistente do mestre.
- Criar testes automatizados.

### Instrução de execução futura

Implemente somente esta Task. Antes de alterar arquivos, confira novamente a evidência atual e preserve os padrões existentes.

## BRA-FE-12 - Pesquisa final e confirmação de conclusão

**Camada:** Integração  
**Prioridade:** P0  
**Status atual:** Ausente  
**Depende de:** BRA-FE-10  
**Desbloqueia:** BRA-FE-13, BRA-FE-14

### Objetivo

Coletar a pesquisa final após submissão do personagem e exibir confirmação de conclusão ao participante.

### Evidência atual

- Não há rotas de pesquisa ou conclusão.
- `components/states/*` pode ser reaproveitado.
- Dashboard e painéis atuais não modelam conclusão do piloto.

### Implementação necessária

- [ ] Criar formulário de pesquisa final conforme contrato/conteúdo aprovado.
- [ ] Bloquear pesquisa antes da submissão do personagem.
- [ ] Salvar respostas e tratar erro sem perder preenchimento.
- [ ] Exibir confirmação final clara após envio.
- [ ] Bloquear reenvio quando pesquisa já foi submetida.

### Dependência da API

- Contrato necessário: consultar schema/status da pesquisa, enviar respostas e consultar conclusão do participante.
- Task do backend relacionada: CONTRATO BACKEND PENDENTE: pesquisa final e status de conclusão.
- Dados consumidos: perguntas, tipos de campo, obrigatoriedade, respostas, status de envio, conclusão.
- Estados esperados: carregamento, vazio, respondendo, salvando, enviado, já submetido, erro, campanha encerrada, sessão expirada.
- Comportamento temporário permitido enquanto a API não estiver disponível: preparar tela e estados; não armazenar pesquisa definitiva só no cliente.

### Estados obrigatórios da interface

- carregamento;
- sucesso;
- vazio;
- erro;
- acesso negado;
- sessão expirada;
- campanha encerrada;
- salvamento em andamento;
- conteúdo já submetido.

### Critérios de aprovação

- Participante só acessa pesquisa após submissão final do personagem.
- Respostas obrigatórias são validadas antes do envio.
- Falha de envio preserva respostas na tela quando possível.
- Pesquisa já submetida exibe confirmação, não novo formulário.
- Tela final comunica conclusão do fluxo.

### Validação permitida

- inspeção do código;
- typecheck;
- lint, se configurado;
- build;
- verificação manual do fluxo;
- conferência visual em desktop e mobile.

### Fora do escopo

- Análise de resultados.
- Painel operacional.
- Criar testes automatizados.
- Alterar backend.

### Instrução de execução futura

Implemente somente esta Task. Antes de alterar arquivos, confira novamente a evidência atual e preserve os padrões existentes.

## BRA-FE-13 - Painel operacional mínimo do piloto

**Camada:** Integração  
**Prioridade:** P1  
**Status atual:** Parcial  
**Depende de:** BRA-FE-02, BRA-FE-05, BRA-FE-10, BRA-FE-12  
**Desbloqueia:** BRA-FE-14

### Objetivo

Permitir que operadores acompanhem inscrições, consentimentos, confirmações, rascunhos, submissões, pesquisas e conclusões do piloto.

### Evidência atual

- `CampaignDashboard` mostra campanhas, pendências, missões e timeline para o usuário.
- `TableMasterPanel` mostra mundo, personagens, traits, missões, submissões, timeline e assistente IA do mestre.
- `/admin` e `features/admin/*` existem para entidades genéricas.
- Não há painel específico de funil do piloto.

### Implementação necessária

- [ ] Criar visão operacional mínima com métricas de funil do MVP.
- [ ] Listar participantes por status: inscrito, e-mail pendente, consentido, em rascunho, submetido, pesquisa concluída.
- [ ] Exibir erros/pendências acionáveis sem expor conteúdo secreto.
- [ ] Reaproveitar permissões globais/admin e padrões de layout atuais.
- [ ] Tratar estados vazios, erro, carregamento e acesso negado.

### Dependência da API

- Contrato necessário: overview operacional do piloto e listagem filtrável de participantes/status.
- Task do backend relacionada: CONTRATO BACKEND PENDENTE: painel operacional do piloto.
- Dados consumidos: contadores, participantes, status por etapa, timestamps, flags de erro/pendência.
- Estados esperados: carregamento, sucesso, vazio, erro, acesso negado.
- Comportamento temporário permitido enquanto a API não estiver disponível: criar estrutura de painel com estados vazios; não inventar métricas reais.

### Estados obrigatórios da interface

- carregamento;
- sucesso;
- vazio;
- erro;
- acesso negado.

### Critérios de aprovação

- Operador identifica quantos participantes estão em cada etapa do MVP.
- Painel funciona em desktop e mobile.
- Dados secretos de campanha/personagem não são exibidos indevidamente.
- Filtros ou seções principais não presumem contratos inexistentes.
- Acesso é restrito a perfil autorizado.

### Validação permitida

- inspeção do código;
- typecheck;
- lint, se configurado;
- build;
- verificação manual do fluxo.

### Fora do escopo

- Analytics avançado.
- Exportações.
- Edição de personagens pelo operador.
- Criar testes automatizados.

### Instrução de execução futura

Implemente somente esta Task. Antes de alterar arquivos, confira novamente a evidência atual e preserve os padrões existentes.

## BRA-FE-14 - Preparação visual e funcional do piloto

**Camada:** Frontend  
**Prioridade:** P1  
**Status atual:** Parcial  
**Depende de:** BRA-FE-03, BRA-FE-04, BRA-FE-05, BRA-FE-06, BRA-FE-07, BRA-FE-08, BRA-FE-09, BRA-FE-10, BRA-FE-11, BRA-FE-12, BRA-FE-13  
**Desbloqueia:** nenhuma

### Objetivo

Consolidar o fluxo completo do piloto para demonstração manual em desktop e mobile.

### Evidência atual

- `docs/rpg-tables-mvp-qa.md` contém checklist manual do MVP anterior de mesas.
- `README.md` recomenda `npm run typecheck` e `npm run build`.
- Módulos legados de gameplay, shop, PvP e transações existem, mas ficam fora da navegação principal.
- Não há checklist manual do novo fluxo público do piloto.

### Implementação necessária

- [ ] Criar checklist manual do fluxo do participante do link público até conclusão.
- [ ] Conferir responsividade das telas do MVP em desktop e mobile.
- [ ] Garantir que navegação principal não leve o participante para módulos fora de escopo.
- [ ] Revisar mensagens finais de erro, vazio, campanha encerrada e conteúdo submetido.
- [ ] Conferir aderência visual à Fundação Visual do Bravantus.

### Dependência da API

- Contrato necessário: nenhum contrato novo; depende dos contratos das Tasks anteriores.
- Task do backend relacionada: contratos das Tasks BRA-FE-02 a BRA-FE-13.
- Dados consumidos: dados integrados nas Tasks anteriores.
- Estados esperados: todos os estados integrados nas Tasks anteriores.
- Comportamento temporário permitido enquanto a API não estiver disponível: registrar bloqueios por contrato pendente no checklist, sem declarar fluxo como pronto.

### Estados obrigatórios da interface

- carregamento;
- sucesso;
- vazio;
- erro;
- acesso negado;
- sessão expirada;
- campanha encerrada;
- salvamento em andamento;
- conteúdo já submetido.

### Critérios de aprovação

- Checklist manual cobre os 15 passos do fluxo do participante.
- Fluxo visual é verificável em desktop e mobile.
- Módulos fora de escopo não aparecem como caminho principal do piloto.
- Estados críticos possuem retorno claro.
- Fundação Visual do Bravantus é preservada.

### Validação permitida

- inspeção do código;
- typecheck;
- lint, se configurado;
- build;
- verificação manual do fluxo;
- conferência visual em desktop e mobile;
- comparação com a Fundação Visual.

### Fora do escopo

- Criar ou executar testes automatizados.
- Implementar novas funcionalidades além de ajustes de preparação.
- Alterar backend.
- Expandir lore, combate, rolagens ou condução de sessões.

### Instrução de execução futura

Implemente somente esta Task. Antes de alterar arquivos, confira novamente a evidência atual e preserve os padrões existentes.
