# Registro de decisões — Demo de cartas

Versão: 0.1 • Registro: 2026-09-22 • Responsável por aprovação: Joao Pedro (Product Owner).
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
| CD-H01 | Combate automático após ordenar as cinco cartas | Rodadas discretas; alternativa é ativação manual por turno | PO confirma antes do contrato executável |
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
