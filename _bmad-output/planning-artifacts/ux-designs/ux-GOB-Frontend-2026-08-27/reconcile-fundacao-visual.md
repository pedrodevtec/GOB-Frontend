# Reconciliação — Fundação Visual v0.1

Fonte reconciliada: `docs/Bravantus_Fundacao_Visual_v0.1.md`
Referências vigentes: `DESIGN.md` e `EXPERIENCE.md`
Data: 2026-08-27

## Resultado

A Fundação Visual continua válida como origem da personalidade e de vários princípios do sistema, mas não é mais a especificação vigente. `DESIGN.md` governa a identidade visual e `EXPERIENCE.md` governa comportamento, estados, interação, acessibilidade e jornadas. Em conflitos, os dois spines prevalecem.

A mudança decisiva é **light-first substituindo dark-first**. A experiência vigente usa papel/marfim, tinta envelhecida e couro claro, com área central limpa, textura periférica e contraste comprovado. A combinação tipográfica **Cinzel + Inter**, que na Fundação ainda aparecia entre as hipóteses a validar, está agora decidida: Cinzel 600/700 somente em títulos narrativos especiais; Inter 400–700 em interface e leitura longa, com fallbacks definidos.

## Preservado

| Entrada da Fundação | Estado vigente |
|---|---|
| “RPG antes de dashboard” | Preservado como tese explícita da experiência. A jornada do Participante não expõe menus amplos, métricas, enums ou estrutura administrativa. |
| Personagem no centro e Ficha como núcleo emocional | Preservado. A Ficha canônica é a leitura compartilhada entre Revisão, Meu Personagem e Conclusão; conta e Personagem permanecem conceitos distintos. |
| Personalidade heroica, acolhedora, artesanal, misteriosa e jogável | Preservada como postura de marca, agora acompanhada da exigência de acessibilidade e de não parecer fantasia sombria ilegível ou SaaS genérico. |
| Superfícies quentes, dourado seletivo, contorno e textura sutil | Preservados. Textura e ilustração ficam fora da zona de leitura; dourado comunica marco/recompensa e não serve como texto pequeno sobre papel. |
| Não parecer cassino, não dominar com preto, não sujar a leitura, não esconder informação e não decorar sem função | Preservado e ampliado pelos anti-patterns: sem gradientes saturados, brilho plástico, texto sobre cenário, cards decorativos ou ornamentação repetitiva. |
| Marca original, sem deformar, inclinar, recolorir livremente ou recriar o nome com outra fonte | Preservado. A logo continua sendo arte original; Cinzel não a substitui. |
| Grid de 4 px | Preservado e convertido em escala completa de espaçamento, margens responsivas e larguras máximas de leitura/conteúdo. |
| Raios contidos, bordas de 1 px e 2 px para ênfase | Preservado. Campos/ações usam 6 px, painéis/Ficha 10 px e diálogos 16 px; raios inflados e excesso de pílulas são evitados. |
| Alvo mínimo de 44 × 44 px | Preservado como piso para todos os controles, inclusive ícones, fechar, links e opções compactas. |
| Ornamento apenas quando reforça hierarquia ou narrativa | Preservado. Ornamento fica nas bordas/topo/lateral e nunca disputa atenção com ação, campo ou erro. |
| Recorte de escudo reservado a Ficha, marcos e decisões importantes | Preservado exatamente como uso raro, não como moldura repetida. |
| IA identificada, editável e sujeita a aceitar, editar ou descartar | Preservado e tornado comportamental: geração é explícita, aplicação é separada, nada é persistido automaticamente e o caminho manual permanece completo. |
| Aprovação com responsável e estado claros | Preservado. A interface atribui a decisão humana à autoridade correta e não confunde conclusão, submissão, aprovação ou publicação. |
| Cor nunca como única pista | Preservado para IA, seleção, aprovação, aviso, erro e estados; texto e, quando útil, ícone são obrigatórios. |
| Contraste AA, foco visível, zoom de 200%, movimento reduzido e textura controlada | Preservados e elevados a piso WCAG 2.2 AA, com combinações medidas, foco de 2 px, reflow, teclado, leitor de tela e validação em dispositivo real. |

## Substituído por decisão mais recente

| Entrada da Fundação | Decisão vigente |
|---|---|
| **Superfícies dark-first** | **Substituídas por light-first.** Canvas `#F7F2E8`, papel `#FFFAF2`, tinta `#2F291F` e superfícies claras são a base. O dark-first histórico é rejeitado por reduzir acolhimento e legibilidade no Piloto. |
| Paleta de origem da logo como principal referência cromática da interface | A marca continua preservada, mas a interface usa uma paleta semântica própria e verificável: terracota escura para ação, floresta para proteção/aprovação, sálvia para apoio discreto da IA, dourado envelhecido para marco/recompensa e cores específicas de aviso/erro. Azul não integra a paleta principal. |
| “Anel dourado” genérico para foco | Substituído pelo dourado escurecido `#8A6427`, pois o dourado de recompensa `#C8A96E` é claro demais para sustentar sozinho o foco essencial sobre marfim. |
| Quadro do Builder com “pergunta contextual” | Substituído pela criação centrada em identidade, passado, motivações, vínculos e Marca. Perguntas específicas do Episódio 1 não bloqueiam a criação. O Contexto Público vem antes do Builder. |
| `bravantus.ai` tratado como “fonte oficial” visual | Não é autoridade visual vigente. Marca, molduras e ilustrações editoriais precisam ser aprovadas; arte gerada pelo participante é pessoal, deve ser identificada como IA e não é arte oficial nem Cânone. |

## Refinado

| Entrada da Fundação | Refinamento vigente |
|---|---|
| Paleta semântica | Ganhou tokens, funções e limites de contraste concretos. `border`, `sage`, `terracotta` e `gold` não comunicam texto/estado essencial em combinações insuficientes. Estado sempre recebe reforço textual ou estrutural. |
| **Cinzel + Inter** | **Agora decidido.** Cinzel 600/700 aparece raramente em abertura de jornada, nome do Personagem, Ficha e conclusão. Inter 400–700 atende títulos funcionais, campos, botões, tabelas, mensagens, instruções e texto longo. Fallbacks e regras de quebra também são parte do contrato. |
| Escala tipográfica 48/36/28 e 20/16/14/12 | Refinada para display desktop de 36 px, display mobile de 28 px, heading de 24 px, body de 16 px, label de 14 px e meta de 13 px. Títulos quebram sem truncamento; caixa alta é rara. |
| “Card padrão” e “painel hero” | Refinados para componentes com função: painel editorial, campo narrativo, Ficha canônica, ajuda de IA, progresso, diálogo e artefato pessoal. Card decorativo e coleção de molduras são proibidos. |
| Contexto de preparação “quente, guiado e calmo” | Refinado em uma decisão compreensível por tela, conteúdo de leitura com até 720 px, ação dominante e ilustração periférica. No mobile, apoio retorna à ordem de leitura. |
| Sugestão da IA | Refinada com estados de gerando, proposta, aplicada localmente, descartada e erro; recuperação de timeout, limite, vazio e resposta parcial; privacidade de telemetria; e métrica de autoria, não de volume de aceite. |
| Aprovação | Refinada em estados independentes de participação concluída, revisão, aprovação, artefatos e publicação. Pesquisa concluída nunca comunica aprovação. |
| Corrupção rara e localizada | Mantida como linguagem futura possível, mas sem receber token ou padrão funcional no `pilot-v1`; se entrar, não poderá reduzir leitura nem competir com erro/aviso. |
| Uso responsivo | Expandido de zoom e toque mínimos para contratos de 320 px a desktop, paridade funcional do Participante, reflow a 200%, teclado virtual/safe area e ausência de gesto ou orientação obrigatórios. |
| Movimento reduzido | Expandido para Guardiões/chibis/pixel art: corrida, ataque, balanço e celebração são decorativos; percentual, ação e resultado permanecem completos em estado estático. |

## Fora do MVP atual

| Ideia da Fundação | Tratamento |
|---|---|
| Linguagem visual do Episódio Ativo | Fora da fatia de criação, revisão e apresentação de Personagem do `pilot-v1`. Não deve ser implementada como novo tema agora. |
| Interface e linguagem de Segredo do Mestre | Fora da jornada visual atual. O princípio de proteção permanece, mas condução de episódio e superfícies próprias do Mestre exigem especificação posterior. |
| Sistema visual completo da Corrupção | Fora do MVP. A noção qualitativa fica estacionada; não há autorização para criar estados, medidores ou efeitos de Corrupção no Piloto. |
| Biblioteca completa de componentes | Fora do escopo imediato. Os spines definem contratos dos componentes necessários à fatia; expansão ocorre por evidência de uso. |
| Produção de todas as assinaturas digitais da marca | O uso correto da marca é vigente, mas criar horizontal, principal, favicon e avatar não é entrega deste UX spine. Depende de assets oficiais e tarefa própria. |

## Ideias qualitativas descartadas

- **Dark-first como identidade do Piloto:** descartado explicitamente em favor de light-first.
- **Pergunta contextual do Episódio 1 dentro do Builder:** descartada como bloqueio ou eixo da criação; contexto público e identidade do Personagem têm papéis separados.
- **Arte gerada como fonte oficial da marca ou do Cânone:** descartada. Arte pessoal de IA é identificada e não substitui identidade aprovada.
- **Ornamento medieval recorrente para produzir “cara de RPG”:** descartado quando não reforça hierarquia ou narrativa.
- **Paleta da logo aplicada diretamente a todos os componentes:** descartada; identidade, ação, estado e contexto narrativo não competem.
- **Interface de Participante organizada como dashboard:** descartada; operação administrativa usa shell próprio.
- **Animação como portadora de progresso ou significado:** descartada; todo significado precisa sobreviver sem movimento.
- **Uma mudança completa de tema para cada contexto:** descartada. A interface muda ênfase, não identidade.

## Decisão de precedência

Para implementação e QA, usar `DESIGN.md` para tokens, marca, composição e componentes visuais; usar `EXPERIENCE.md` para arquitetura de informação, comportamento, estados, acessibilidade e jornadas. A Fundação Visual permanece como registro de origem e inspiração, não como contrato concorrente.
