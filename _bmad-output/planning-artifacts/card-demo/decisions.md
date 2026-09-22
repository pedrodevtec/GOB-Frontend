# Registro de decisões — Demo de cartas

Versão: 0.2 • Registro: 2026-09-22 • Responsável por aprovação: Joao Pedro (Product Owner).
Origem: conversa de produto de 21–22/09/2026. Autor do registro: assistente de desenvolvimento.
Visibilidade: documentação interna de produto; sem segredos narrativos. Nada neste documento cria canon.

## Decisões explícitas

| ID | Decisão | Status | Motivo / impacto |
|---|---|---|---|
| CD-D01 | Planejar uma demo de jogo de cartas no navegador | DECISÃO DE PRODUTO — aprovada para planejamento | Testar experiência jogável e vínculo com personagem; não autoriza implementação ou lançamento nesta tarefa |
| CD-D02 | Usar o personagem criado pelo jogador | DECISÃO DE PRODUTO | Reaproveitar identidade autorizada; não trocar pelo avatar da conta |
| CD-D03 | Cinco cartas de habilidades fixas para teste | DECISÃO DE PRODUTO | Limitar o catálogo e tornar comparações de teste possíveis |
| CD-D04 | Dois cenários selecionáveis pelo jogador | DECISÃO DE PRODUTO | Escolha explícita de experiência; não campanha completa |
| CD-D05 | The Bazaar é referência de inspiração | DECISÃO DE PRODUTO | Não equivale à aprovação de todas as suas mecânicas ou ao uso de seus assets |
| CD-D06 | Usar BMAD já instalado, registrar decisões e planejar épico no repositório | DECISÃO DE PRODUTO | Executar planejamento em branch/PR; preservar instalação e trabalho existente |

## Hipóteses propostas pelo assistente, não aprovadas como regras

| ID | Hipótese | Recomendação para validação | Gate |
|---|---|---|---|
| CD-H01 | Combate automático após ordenar as cinco cartas | SUPERADA em 22/09: PO pediu sem combate automático | Substituída por CD-D07 |
| CD-H02 | Atributos padronizados; identidade visual real | Facilita balanceamento; não traduz ainda toda a ficha para o combate | PO confirma antes da integração |
| CD-H03 | Vida e Energia; recuperação por rodada | Valores, teto, ordem de resolução e empate ainda pendentes | Design de jogo + PO antes do motor |
| CD-H04 | Golpe, Guarda, Concentração, Técnica, Poder da Marca | Catálogo provisório; Marca de uso único é hipótese | PO aprova efeitos, custos e nomes |
| CD-H05 | Abrir passagem e Sustentar a defesa | Roteiros de teste separados do canon do Episódio 1 | Autor/PO aprova conteúdo e visibilidade |
| CD-H06 | Partidas de 5–10 minutos | Meta de teste, não resultado medido | Playtest confirma ou ajusta |
| CD-H07 | Motor local, determinístico e estado efêmero | Não persistir resultados nem conceder recompensas | Arquitetura verifica contratos e isolamento |
| CD-H08 | CTA opcional na área do personagem | Não alterar nextRoute nem tornar demo etapa obrigatória | UX/arquitetura + PO confirmam elegibilidade e acesso |
| CD-H09 | Sem IA durante o combate; roteiro pré-escrito | Evitar custo e resultados narrativos imprevisíveis | PO confirma contrato do experimento |

## Limites herdados

A IA sugere; humanos decidem. Demo não altera ficha, aprovação, pesquisa, canon ou Crônica.
Nenhuma geração de retrato é disparada automaticamente. Cinco cartas de habilidades são distintas da variante de arte Carta Jogável já prevista no piloto; não multiplicam a quota de imagens.
Segredo do Mestre não chega ao navegador. Conteúdo do cenário será explicitamente aprovado para a audiência da demo. Não rotular hipótese como CANON PÚBLICO.
Não alterar autenticação, autorização, banco ou infraestrutura neste planejamento. Não reexpor menus legados.

## Prioridade e estacionadas

P1 candidata se apoiar diretamente o primeiro playtest; P2 se ficar para rodada posterior. Planejamento autorizado, sem prioridade de execução ratificada e sem substituir os gates do piloto.
ESTACIONADAS: PvP, loja, compra aleatória de cartas, progressão permanente, criação livre de poderes por IA, campanha extensa, multiplayer e publicação automática de resultados.

## Registro de decisão consolidado

- Decisão: planejar a demo com personagem próprio, cinco habilidades fixas e dois cenários.
- Status: planejamento autorizado; propostas mecânicas aguardam ratificação.
- Motivo: testar vínculo, compreensão e valor das cartas.
- Impactos: extensão experimental do PRD; não altera escopo obrigatório de pilot-core.
- Pendências: CD-H01..09, acesso elegível, valores de combate e validação narrativa.
- Próximo passo: revisar contrato e dependências na Story 8.1; implementação continua em backlog.

## Atualização do PO — 22/09/2026 (prevalece sobre o registro anterior)

- **CD-D07 — DECISÃO DE PRODUTO:** sem combate automático por enquanto. O jogador escolhe manualmente cada habilidade. Preparar uma sequência para execução automática está fora do recorte.
- **CD-D08 — DECISÃO DE PRODUTO:** produzir primeiro o cenário inicial, com impacto visual e narrativo para teste e gravação de vídeo. O segundo cenário continua na visão posterior, mas não bloqueia a primeira entrega.
- **CD-D09 — DECISÃO DE PRODUTO:** começar pela cena/protótipo demonstrável; isto não equivale à autorização de publicar em produção ou alterar ficha/conta.
- **Proposta de implementação visual:** uma resposta inimiga explícita após cada escolha, avançada pelo botão “Resolver resposta”, para controlar ritmo do vídeo. Não é combate autônomo.
- **Valores e narrativa:** parâmetros de protótipo em manual-scene-v0.2.md, não regras oficiais aprovadas.
- **Próximo passo:** avaliar protótipo inicial; depois fechar contrato de integração do personagem e calibrar regras.

## Integração autorizada — 22/09/2026

- **CD-D10 — DECISÃO DE PRODUTO:** pedido explícito autoriza integrar a cena manual Abrir passagem em Meu personagem, com os parâmetros da spec `spec-mandukuru-personalized-card-scene.md`. A autorização anterior restrita ao planejamento/protótipo fica superada somente neste recorte. Não autoriza publicação em produção, backend novo ou segundo cenário.
- **CD-D11 — DECISÃO DE PRODUTO:** a sentinela da primeira cena é um Mandukuru. A arte fornecida é provisória e pode ser convertida/otimizada com transparência; não estabelece aparência canônica.
- **CD-D12 — DECISÃO DE PRODUTO:** a abertura usa nome e trecho fiel da história salva, com ligação neutra e desfecho retomando a motivação. Ataque, dano, vitória e derrota recebem efeitos visuais. A narrativa autorizada permanece texto, não HTML; ficha, aprovação, cânone e dados privados do Mestre não são alterados ou divulgados.

Implementação registrada em `mandukuru-card-scene-validation.md`. Primeiro cenário em revisão; validação visual e integração autenticada são gates separados dos testes determinísticos. Demais histórias do épico permanecem abertas.
