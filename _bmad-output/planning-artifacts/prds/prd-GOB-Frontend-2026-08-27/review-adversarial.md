# Revisão adversarial — PRD Guardian of Bravantus

Artefatos revisados: `prd.md` e `addendum.md`.

## Achados

### 1. Capacidade excepcional de revisão não define quem, além do papel global, recebe autoridade no Piloto

- `location` — `prd.md`, FR-22; `addendum.md`, §3 Estado e autorização
- `trigger_condition` — Se toda conta com papel global `ADMIN` puder usar automaticamente a capacidade excepcional em `pilot-v1`, um administrador sem atribuição operacional à campanha poderá ler e decidir sobre Fichas do Piloto.
- `guard_snippet` — “A revisão excepcional exige simultaneamente `ADMIN`, campanha com identificador canônico `pilot-v1`, atribuição administrativa ativa à campanha e permissão explícita `pilot:review`; ausência ou revogação de qualquer condição retorna `403`. O backend registra ator, escopo, Snapshot, decisão e timestamp.”
- `potential_consequence` — A separação declarada entre administração global e autoridade narrativa vira apenas semântica de UI, ampliando acesso indevido a conteúdo criativo e permitindo decisões por pessoas não designadas.

### 2. A futura autoridade `MASTER` não está protegida contra membership obsoleta ou mesa errada

- `location` — `prd.md`, FR-20 a FR-22 e Questão em aberto 8; `addendum.md`, §3 Estado e autorização
- `trigger_condition` — Quando criação de Mesas for liberada, histórias podem validar apenas `MASTER` e ignorar que a membership precisa estar ativa e pertencer à mesma Mesa e campanha do Snapshot.
- `guard_snippet` — “Para cada leitura ou transição de revisão, o backend resolve o Snapshot para uma Mesa e exige `currentUserRole=MASTER`, `isMaster=true` e membership ativa nessa mesma Mesa no instante da requisição; mudança ou remoção da membership revoga acesso imediatamente e tentativas cross-table retornam `403`.”
- `potential_consequence` — Um antigo Mestre, ou Mestre de outra Mesa, poderá acessar, aprovar ou devolver Personagens fora do próprio contexto.

### 3. Configuração e operação do Piloto aparecem no escopo sem matriz de permissões por ação

- `location` — `prd.md`, FR-30 a FR-34 e §8.3 Superfícies principais
- `trigger_condition` — “Configurações do Piloto”, gestão de Participantes, adaptação e exclusão de legado são agrupadas sob Administrador sem distinguir leitura de métricas, revisão, alteração de campanha e exclusão destrutiva.
- `guard_snippet` — “Antes de derivar histórias, publicar uma matriz ator × recurso × ação × escopo para `ADMIN`, Administrador atribuído ao Piloto, `MASTER` e Participante, incluindo respostas `401/403`, auditoria e revogação. Nenhuma permissão de leitura implica mutação ou exclusão.”
- `potential_consequence` — Stories downstream tenderão a reutilizar um guarda genérico de administrador, concedendo poderes destrutivos e acesso a dados além do necessário.

### 4. Exclusão de Personagem legado não define cascata, retenção nem possibilidade de recuperação

- `location` — `prd.md`, FR-32 e §6.1 Escopo do MVP
- `trigger_condition` — Ao excluir um legado com Perfil Público, imagens, PDF, Snapshots, Pesquisa Final e eventos associados, o PRD não determina quais objetos são apagados, anonimizados, retidos ou revogados.
- `guard_snippet` — “A história de exclusão deve listar a cascata por tipo de dado, revogar imediatamente links e URLs de artefatos, invalidar caches, definir janela recuperável ou declarar exclusão irreversível, preservar somente auditoria minimizada com base definida e informar o dono antes da confirmação.”
- `potential_consequence` — Dados supostamente excluídos podem continuar públicos ou recuperáveis por URL, enquanto uma cascata excessiva pode destruir evidência e conteúdo sem expectativa clara do usuário.

### 5. O modelo de sessão brownfield permite acesso residual e não possui critério de contenção para o MVP

- `location` — `addendum.md`, §4 Autenticação e riscos atuais; `prd.md`, §7.1 Segurança e privacidade
- `trigger_condition` — JWT em `localStorage`, cookie JavaScript verificado apenas por presença e logout sem revogação deixam tokens expostos a XSS e sessões utilizáveis após logout ou remoção de autoridade.
- `guard_snippet` — “Criar uma decisão explícita antes do piloto externo: ou migrar para sessão revogável em cookie `HttpOnly`, `Secure` e `SameSite`, ou documentar aceite de risco com TTL curto, rotação, validação server-side em toda chamada, revogação ao remover membership/papel e teste de token expirado, adulterado e reutilizado após logout.”
- `potential_consequence` — Ocultar rotas no frontend não impedirá reutilização de credencial roubada ou antiga para acessar Fichas, administração e artefatos privados.

### 6. Consentimento do Piloto não cobre ciclo de vida, direitos e finalidades dos dados

- `location` — `prd.md`, FR-3, FR-24, §7.1 e Questão em aberto 9
- `trigger_condition` — O aceite versionado registra entrada, mas não define finalidades, retenção, retirada, exclusão, exportação, controlador, contato, idade mínima ou o que acontece com dados após encerramento da campanha.
- `guard_snippet` — “O Piloto externo permanece bloqueado até política aprovada definir finalidades e bases, categorias coletadas, retenção por categoria, fornecedores/subprocessadores, idade aplicável, canal para acesso/correção/exportação/exclusão e efeito da retirada sobre participação e dados já tratados.”
- `potential_consequence` — A implementação pode coletar e reter narrativa, pesquisa e imagens sem expectativa transparente ou mecanismo operacional para atender solicitações do titular.

### 7. “Contexto autorizado” da IA não é uma allowlist verificável

- `location` — `prd.md`, FR-15, FR-17, FR-18 e §7.1
- `trigger_condition` — Uma story pode montar prompts com objetos ricos de campanha ou Personagem e confiar em instruções textuais para não incluir Segredo do Mestre, em vez de restringir os campos enviados ao provedor.
- `guard_snippet` — “Definir, por caso de uso de IA, uma allowlist de campos e tamanho máximo; construir o payload em serviço server-side dedicado; excluir Segredo do Mestre, comentário de revisão, Pesquisa Final, e-mail, IDs desnecessários e payloads administrativos; registrar somente metadados permitidos e testar o corpo real enviado ao fornecedor.”
- `potential_consequence` — Conteúdo secreto, pessoal ou administrativo pode sair da fronteira do produto mesmo sem aparecer em Analytics.

### 8. Não há defesa explícita contra prompt injection e saída ativa da IA

- `location` — `prd.md`, FR-15 a FR-18; `addendum.md`, §5 Validação integrada mínima
- `trigger_condition` — Narrativa do usuário ou Contexto Público pode conter instruções que tentem alterar o comportamento do modelo, extrair contexto oculto ou produzir HTML/Markdown/URLs perigosos.
- `guard_snippet` — “Tratar todo conteúdo de usuário e lore como dados não confiáveis, separar instruções de sistema, nunca disponibilizar Segredo do Mestre à chamada, validar a saída contra schema e catálogos, renderizar como texto seguro e acrescentar testes de exfiltração, instrução conflitante, link malicioso e conteúdo fora do schema.”
- `potential_consequence` — A IA pode vazar contexto, inventar regra, inserir conteúdo executável ou induzir o Participante a sair para destinos maliciosos.

### 9. Retenção e treinamento por fornecedores de IA textual permanecem indefinidos

- `location` — `prd.md`, FR-18 e FR-26; §7.1 Segurança e privacidade
- `trigger_condition` — FR-26 informa retenção e envio antes da geração visual, mas não exige transparência equivalente para IA textual nem impede uso do conteúdo para treinamento pelo fornecedor.
- `guard_snippet` — “Antes da primeira chamada textual ou visual, informar fornecedor, categorias enviadas, região e prazo de retenção; usar configuração contratual sem treinamento quando disponível; bloquear provedores sem política compatível; persistir versão do aviso e permitir caminho manual sem aceite opcional.”
- `potential_consequence` — Narrativas e atributos pessoais podem ser retidos ou reutilizados externamente de modo incompatível com o consentimento e com a promessa de privacidade do produto.

### 10. Moderação e direitos de imagem são requisitos declarativos, não um fluxo testável

- `location` — `prd.md`, FR-26
- `trigger_condition` — “Exige direitos e consentimento” não especifica como o produto detecta referência a pessoa real, idade, conteúdo sexual/violento, falsificação de identidade ou material protegido, nem o que ocorre em falso positivo.
- `guard_snippet` — “A geração visual deve coletar declaração de direitos quando houver referência, impedir upload ou geração de pessoa real sem consentimento verificável, aplicar moderação antes e depois da geração, não publicar resultado reprovado, oferecer mensagem segura e canal de contestação, e registrar somente códigos de decisão minimizados.”
- `potential_consequence` — O sistema poderá produzir ou compartilhar deepfakes, imagens abusivas ou material infrator, ou bloquear usuários legítimos sem explicação e remediação.

### 11. O limite de “um Retrato e uma Carta” é vulnerável a corrida, falha parcial e cobrança ambígua

- `location` — `prd.md`, FR-26, §6.1 e §7.5
- `trigger_condition` — Cliques concorrentes, timeout após geração no fornecedor ou falha entre criação e persistência podem consumir mais de uma geração, cobrar duas vezes ou deixar o usuário sem artefato e sem tentativa disponível.
- `guard_snippet` — “Cada variante usa chave idempotente server-side, estados `requested/generating/succeeded/failed`, unicidade por Personagem+variante, reconciliação com o fornecedor e regra explícita de quando uma tentativa conta para o limite; retry técnico da mesma operação não cria nem cobra nova geração.”
- `potential_consequence` — Custos ultrapassam o orçamento, artefatos duplicam e Participantes perdem o único benefício por uma falha não causada por eles.

### 12. Artefatos privados não têm requisitos de autorização, URL e exclusão

- `location` — `prd.md`, FR-26 a FR-29 e §7.1
- `trigger_condition` — Retrato, Carta e PDF podem ser armazenados com URL estática ou pública; o PRD não exige autorização por download, expiração, anti-enumeração, remoção de metadados ou invalidação após exclusão.
- `guard_snippet` — “Retrato, Carta e PDF permanecem privados por padrão, são servidos após autorização ou por URL assinada curta e não enumerável, removem metadados desnecessários, recebem `Cache-Control` compatível e são apagados/invalidados conforme revogação, exclusão e retenção definidas.”
- `potential_consequence` — Um link vazado ou previsível poderá expor indefinidamente identidade, imagem e Ficha mesmo sem Perfil Público ativo.

### 13. O Perfil Público não define indexação, descoberta, abuso nem campos efetivamente permitidos

- `location` — `prd.md`, FR-28 e §7.1
- `trigger_condition` — “Recorte permitido” e “allowlist explícita” não enumeram campos, enquanto nada define se mecanismos de busca podem indexar o perfil, se o slug é enumerável ou como denunciar conteúdo publicado.
- `guard_snippet` — “Antes das stories, aprovar allowlist nominal e renderização por campo; usar identificador público não sequencial; definir política `noindex`/indexável deliberada, rate limit e proteção contra scraping; oferecer denúncia e despublicação administrativa auditada sem conceder acesso ao restante da Ficha.”
- `potential_consequence` — Informações narrativas ou identificadoras podem ser descobertas em massa, indexadas além da intenção do dono ou permanecer disponíveis em caso de abuso.

### 14. A relação entre nova revisão e Perfil Público anterior é ambígua

- `location` — `prd.md`, FR-21, FR-25 e FR-28
- `trigger_condition` — O PRD diz que nova revisão exige nova confirmação de publicação, mas não declara se o snapshot aprovado anterior permanece público durante ajustes, se é suspenso ao pedir mudanças ou se a revogação alcança todas as versões.
- `guard_snippet` — “Definir máquina de estado de publicação separada da revisão: qual snapshot está público, efeito de `CHANGES_REQUIRED`, nova aprovação, revogação e exclusão. Por padrão seguro, pedido de ajustes suspende o Perfil Público até novo opt-in sobre o novo Snapshot; revogação invalida todas as versões públicas.”
- `potential_consequence` — Conteúdo que o revisor deixou de considerar aceitável pode continuar público, ou uma atualização pode trocar silenciosamente o que o Participante consentiu compartilhar.

### 15. Story pode expor conteúdo ainda não aprovado ou ultrapassar o opt-in do Perfil Público

- `location` — `prd.md`, UJ-4, FR-26, FR-28 e FR-29
- `trigger_condition` — Artefatos podem ser gerados antes da aprovação, e FR-29 não declara como pré-condição que o Personagem esteja aprovado, o Perfil Público esteja ativo e a composição derive exatamente do snapshot consentido.
- `guard_snippet` — “Gerar Story somente quando houver Snapshot aprovado e Perfil Público ativo; compor apenas campos da allowlist e do mesmo Snapshot publicado; prévia e compartilhamento falham de modo seguro se o perfil for revogado ou alterado; nunca embutir URL privada, identificador interno ou conteúdo pendente.”
- `potential_consequence` — O Participante poderá distribuir em redes sociais dados de uma versão rejeitada, privada ou diferente do perfil que autorizou publicar.

### 16. Notificações não têm proteção contra enumeração, links persistentes e exposição em e-mail

- `location` — `prd.md`, FR-23
- `trigger_condition` — As mensagens podem incluir comentário, nome completo, estado sensível ou link direto utilizável sem sessão, e endpoints de reenvio podem revelar quem participa do Piloto.
- `guard_snippet` — “E-mails contêm apenas contexto operacional mínimo e CTA para rota autenticada, nunca Snapshot, comentário de revisão ou token duradouro; links sensíveis são únicos, curtos e consumíveis; respostas de reenvio não revelam existência da conta e possuem rate limit.”
- `potential_consequence` — Caixa postal compartilhada, encaminhamento ou enumeração de contas pode expor participação e conteúdo privado ou facilitar acesso indevido.

### 17. Telemetria ainda pode reidentificar conteúdo apesar de não guardar texto integral

- `location` — `prd.md`, FR-16, FR-18, FR-30, FR-33 e §7.5
- `trigger_condition` — Registrar decisão por sugestão, identificadores persistentes, timestamps precisos, modelo, tokens e trajetória pode reconstruir comportamento individual ou ligar operações a uma Ficha, mesmo sem copiar a narrativa.
- `guard_snippet` — “Publicar schema de eventos com allowlist, finalidade, retenção e acesso; usar identificador pseudônimo rotacionável, granularidade temporal mínima e agregação para painéis; proibir IDs de Personagem/usuário quando não indispensáveis; testar eventos reais e consultas de reidentificação.”
- `potential_consequence` — Analytics vira uma segunda base comportamental identificável, contrariando minimização e ampliando o impacto de acesso interno ou vazamento.

### 18. O escopo compartilhável não possui gates de entrega e dependências explícitas

- `location` — `prd.md`, §6 Escopo do MVP, SM-1 a SM-5; `addendum.md`, §5 Validação integrada mínima
- `trigger_condition` — Perfil Público, Story, IA, imagem, legado e administração estão todos no mesmo MVP, mas o sucesso formativo é baseado em três perfis e não há ordem obrigatória entre autorização, privacidade, aprovação e publicação.
- `guard_snippet` — “Na derivação de epics/stories, declarar dependências e feature flags: identidade/consentimento → Builder manual → submissão/revisão com matriz de autoridade → conclusão → IA textual → imagem privada → Perfil Público → Story. Nenhuma feature pública é habilitada antes dos testes negativos de autorização, privacidade, revogação e cache correspondentes.”
- `potential_consequence` — Times podem entregar uma superfície pública ou destrutiva sobre fundações ainda não validadas, e SM-5 pode marcar o conjunto como pronto sem comprovar cada fronteira crítica.

### 19. A matriz E2E citada não exige explicitamente os principais casos negativos de autoridade e compartilhamento

- `location` — `addendum.md`, §5 Validação integrada mínima
- `trigger_condition` — Os cenários adicionais mencionam privacidade, perfil e estados, mas não enumeram `ADMIN` fora do Piloto, `MASTER` de outra Mesa, membership revogada, acesso ao próprio Personagem pelo revisor, URL de artefato vazada, cache após revogação e corrida de geração.
- `guard_snippet` — “Acrescentar casos normativos para: `ADMIN` não atribuído e fora de `pilot-v1`; `MASTER` de outra Mesa e removido; revisor do próprio Personagem; leitura/mutação por ID trocado; artefato privado sem sessão; Perfil revogado em origem e cache; nova revisão sobre perfil existente; dupla geração/submissão concorrente; prompt injection e corpo real enviado aos provedores.”
- `potential_consequence` — As histórias podem satisfazer a matriz nominal e ainda deixar abertas exatamente as rotas de escalada, vazamento e custo abusivo mais prováveis.
