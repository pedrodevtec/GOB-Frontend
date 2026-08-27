# PRD Quality Review — Guardian of Bravantus — Plataforma de Playtest

## Overall verdict

**Adequate — aprovar com revisões antes do compromisso integral de build ou da abertura externa do Piloto.** O PRD tem uma tese específica, jornadas coerentes, fronteiras de autoridade claras e requisitos excepcionalmente verificáveis para um produto brownfield. O risco não está em falta de conteúdo, mas em tratar 34 FRs como um único MVP indivisível, enquanto decisões que afetam validade mecânica, legalidade e limite econômico ainda não têm dono, prazo ou gate de liberação; além disso, as métricas não medem diretamente o resultado autoral que sustenta a Visão.

## Decision-readiness — adequate

As principais escolhas estão declaradas, e não suavizadas: IA não persiste nem decide (§1, §4.4), aprovação é humana e contextual (§4.5), conclusão não equivale a aprovação (§4.6), e VTT, criação de Mesas e módulos legados são excluídos (§5–§6). Os trade-offs de autoria versus assistência, operação global versus autoridade narrativa e tolerância à falha versus consistência central são inteligíveis. As nove Questões em aberto são reais, e a questão jurídica é honestamente tratada como impeditiva de lançamento externo (§12.9).

Porém, o documento ainda não permite decidir *qual fatia financiar ou liberar primeiro*: todos os 34 FRs aparecem igualmente dentro do MVP, embora alguns sirvam à hipótese central de criação e outros sejam artefatos, compartilhamento, legado ou operação avançada. Também faltam responsáveis, datas e critérios de fechamento para decisões abertas que bloqueiam requisitos já escritos.

### Findings

- **high** MVP sem prioridade interna ou caminho de corte (§4, §6.1) — Os 34 FRs são apresentados como um único compromisso, sem Must/Should, fatias de entrega, dependências ou critério de descope. Perfil Público, Story, adaptação de legado e painel de custos têm o mesmo status que consentimento, Builder e submissão, embora não validem a mesma parte da aposta. *Fix:* separar `pilot-core`, `pilot-ops` e `pilot-share` (ou equivalente), declarar dependências e identificar a menor fatia que permite rodar SM-1 a SM-4.
- **high** Decisões impeditivas não têm owner, prazo nem efeito de gate (§12.4, §12.5, §12.9) — O catálogo de armaduras/Defesa afeta diretamente FR-12; orçamento/volume afeta os limites de FR-26 e a continuidade do Piloto; a revisão jurídica impede abertura externa. Apenas o último efeito está explicitado, e nenhum item tem responsável ou data. *Fix:* converter esses itens em Decision Log com owner, deadline, alternativa padrão e entregas bloqueadas; marcar FR-12/FR-26 e o lançamento externo com gates explícitos.

## Substance over theater — strong

O conteúdo é conquistado. As quatro jornadas têm protagonistas, mudança de estado, falha e valor observável (§2.3), e cada uma dirige conjuntos concretos de FRs. A Visão é própria de Bravantus — pessoa atual, Alma, Marca, autonomia, Cânone e Segredo do Mestre — e não poderia ser transplantada para um produto genérico (§1). As qualidades transversais trazem limites específicos de acessibilidade, viewport, privacidade, idempotência, telemetria e custo (§7), em vez de adjetivos de template. A diferenciação da IA é operacionalizada repetidamente em FR-15 a FR-18, não apresentada como novidade vazia.

### Findings

Nenhum achado material.

## Strategic coherence — adequate

A tese é clara: uma jornada guiada, retomável e assistida deve levar pessoas com diferentes níveis de experiência a um Personagem autoral, válido e revisável (§1). Entrada, Builder, IA assistiva, submissão e revisão seguem esse arco, e as contramétricas impedem otimização por texto, uso de IA, aprovação fácil ou exposição pública (§10). O limite de evidência também distingue corretamente criação de diversão e jogabilidade em sessão.

O principal desvio é de medição. “Reconhecer a Ficha como sua”, autonomia percebida e preservação de autoria são o valor declarado em §1 e UJ-1/UJ-2, mas nenhuma métrica os observa diretamente. Parte das métricas primárias mede conformidade técnica, e SM-2 depende de conceitos ainda pouco operacionalizados.

### Findings

- **high** Resultado autoral central não tem métrica direta (§1, UJ-1, UJ-2, §10) — Conclusão, validade, tempo e número de intervenções podem melhorar mesmo se a pessoa sentir que a IA ou o formulário “escreveu por ela”. Isso deixa a tese principal parcialmente não falsificável. *Fix:* acrescentar um critério comportamental e um item de entrevista/escala previamente definido para reconhecimento, controle e autoria; registrar também divergência entre sugestão, edição e resultado final.
- **medium** Validação de engenharia aparece como sucesso primário de produto (SM-5) — Passar 100% da matriz E2E é um gate de release necessário, mas não valida valor, compreensão ou adoção. Misturá-lo com SM-1 a SM-4 enfraquece a leitura executiva do resultado do Piloto. *Fix:* mover SM-5 para “Quality/Release gates” e manter como primárias apenas métricas que testam a hipótese de produto.
- **medium** “Intervenção humana” e “distinguir” não têm regra de medição (SM-2; addendum §6) — Não está definido o que conta como intervenção, quem avalia a distinção entre pessoa atual/Alma/Arquétipo nem qual resposta constitui êxito. *Fix:* anexar rubrica de codificação, roteiro, momento de medição e tratamento de ajuda solicitada versus resgate do moderador.

## Done-ness clarity — adequate

Esta é uma das partes mais fortes do PRD. Todos os FRs têm consequências testáveis, estados concorrentes e falhas relevantes são tratados, e termos como idempotência, snapshot, revisão esperada, allowlist e fallback tornam “done” muito mais concreto do que acceptance criteria genéricos (§4). As NFRs também incluem WCAG, contraste, tamanhos de alvo, viewport, percentil e tempos (§7).

Ainda há cláusulas cujo oráculo fica fora do documento ou depende de qualificadores subjetivos. Isso não invalida o conjunto, mas produzirá histórias com critérios divergentes se não for fechado antes do detalhamento.

### Findings

- **medium** Estados de erro importantes são delegados ao backend sem contrato observável (§4, FR-4) — “estado recuperável definido pelo backend” não diz quais estados/códigos existem, qual próxima ação deve aparecer nem o que caracteriza recuperação para Mesa cheia, remoção e campanha encerrada. *Fix:* enumerar resultado funcional, ação disponível e rota/estado final para cada caso, ou referenciar um contrato versionado obrigatório.
- **medium** Qualificadores subjetivos permanecem em critérios funcionais (§4, FR-5, FR-9, FR-30, FR-31) — “mensagem clara”, “poucos blocos”, “pouco texto”, “pendências acionáveis” e dados exibidos “quando necessários” não têm um teste único. *Fix:* definir limites de bloco/campo, conteúdo mínimo das mensagens, taxonomia de pendências e allowlist por superfície.
- **medium** Ciclo de vida de dados da geração visual não está definido (§4, FR-26; §7.1) — O PRD exige apenas que retenção, exclusão e envio sejam “informados”, sem estabelecer prazo, mecanismo de exclusão, dados enviados, base de consentimento ou comportamento ao revogar/excluir o Personagem. *Fix:* acrescentar matriz de dados por fornecedor, retenção máxima, eventos de exclusão, efeito da revogação e critérios verificáveis na UI e no backend.

## Scope honesty — adequate

As omissões são explícitas e úteis. §5 e §6.2 retiram VTT, Mesas públicas, combate, progressão, economia, comunidade, PDF oficial, outbox e regenerações comerciais; quatro premissas estão marcadas inline e retornam integralmente no índice (§13). O documento também admite que a matriz integrada ainda não foi executada (addendum §1) e limita corretamente o que os testes formativos podem provar (§10 e addendum §6).

A honestidade cai em dois pontos: uma regra futura aparece dentro de um FR do MVP, e superfícies periféricas à hipótese central continuam em escopo sem uma justificativa de aprendizado proporcional ao custo.

### Findings

- **high** FR-22 mistura obrigação do Piloto com comportamento declarado fora do MVP (§4, FR-22; §6.2) — A consequência “fora de `pilot-v1` ... depende de `MASTER` ativo” pode ser interpretada como implementação/teste obrigatório agora, enquanto §6.2 diz que Mesas criadas por usuários e transferência ao Mestre são evolução posterior. *Fix:* manter no FR-22 apenas a restrição negativa que deve valer hoje (capacidade `ADMIN` não concede `MASTER`) e mover o fluxo futuro do Mestre para requisito diferido/ADR com status explícito.
- **medium** Artefatos públicos e operação avançada ampliam o MVP sem critério de aprendizagem correspondente (§4.6–§4.7, §10) — Perfil Público, Story, legado e série temporal de custos acrescentam privacidade, cache, autorização e UI, mas SM-1 a SM-4 testam sobretudo criação/revisão; as métricas secundárias verificam conformidade, não se esses recursos são necessários. *Fix:* ligar cada fatia a uma hipótese/métrica do Piloto ou movê-la para uma tranche posterior condicionada ao sucesso do `pilot-core`.

## Downstream usability — strong

O PRD foi escrito para extração por UX, Arquitetura e histórias (§0) e sustenta essa promessa. O Glossário controla os substantivos centrais; FR-1 a FR-34 e UJ-1 a UJ-4 são contíguos e únicos; todas as jornadas têm protagonista nomeado; Features citam UJs e métricas citam FRs. O addendum preserva detalhes brownfield, identifica a fonte de verdade, mappers, estados, autorização, riscos atuais e cenários E2E sem poluir o requisito de produto. As cinco fontes de §8 do addendum existem no mesmo workspace.

### Findings

- **low** “Legado” está semanticamente sobrecarregado (§5, §12.1–§12.3, FR-32, addendum §7) — “Personagem legado” significa dado brownfield a adaptar, enquanto “Legado de Alma/Legados” é um conceito de domínio ainda não canônico; nenhum dos dois consta separadamente no Glossário. *Fix:* criar termos distintos no Glossário (por exemplo, `Personagem legado (brownfield)` e `Legado de Alma (hipótese)`) e evitar “Legado” isolado.
- **low** “Perfil” aparece sem qualificador em um requisito canônico (§4, FR-14) — “Revisão, Perfil e Conclusão” pode significar Perfil Público, Meu Personagem ou Perfil da conta, superfícies que o próprio PRD distingue. *Fix:* substituir por nomes controlados das superfícies e declarar qual renderer reutilizam.

## Shape fit — strong

O formato corresponde ao produto: é uma experiência consumer-like com UX significativa e múltiplos stakeholders, portanto as UJs são load-bearing; ao mesmo tempo, o addendum assume corretamente a forma de capability/integration spec para o brownfield. As jornadas novas são descritas como experiência desejada, enquanto riscos e invariantes do código existente são isolados no addendum. Como o PRD alimenta UX, Arquitetura e histórias, a densidade de rastreabilidade e critérios é proporcional aos stakes, não excesso de formalismo.

### Findings

Nenhum achado material.

## Mechanical notes

- **ID continuity:** FR-1–FR-34, UJ-1–UJ-4, SM-1–SM-11 e SM-C1–SM-C4 são contíguos e não duplicados como definições; referências citadas resolvem.
- **Assumptions Index roundtrip:** as quatro tags `[ASSUMPTION]` inline aparecem em §13, e todas as quatro entradas do índice têm correspondente inline.
- **UJ protagonist naming:** Lucas, Bianca, Rafael e Camila carregam contexto diretamente em UJ-1–UJ-4.
- **Cross-references:** `addendum.md` e as cinco fontes reconciliadas existem no workspace. A referência à matriz `reconcile-user-journeys.md` resolve; os IDs E2E deverão ser verificados novamente quando a matriz receber os cinco cenários adicionais propostos.
- **Glossary drift:** corrigir a sobrecarga de “Legado” e o “Perfil” não qualificado descritos em Downstream usability; fora isso, os termos controlados mantêm capitalização e sentido de forma consistente.
- **Required shape:** Visão, público/JTBD, UJs, Glossário, FRs, Não objetivos, escopo, NFRs, métricas/contramétricas, riscos, questões abertas e índice de premissas estão presentes; o addendum cobre contexto brownfield e integração.

## Severity summary

- Critical: 0
- High: 4
- Medium: 6
- Low: 2
