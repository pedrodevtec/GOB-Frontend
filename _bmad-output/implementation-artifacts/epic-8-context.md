# Epic 8 Context: Experimentar meu Guardião em uma demo de cartas

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Oferecer uma extensão opcional no navegador em que o jogador reconheça seu próprio Guardião numa história curta, escolha manualmente entre cinco habilidades fixas e compreenda os efeitos das suas decisões. A entrega inicial concentra o cenário “Abrir passagem”, com impacto visual para teste e vídeo; o segundo cenário vem depois. O experimento não comprova o loop com Mestre nem o equilíbrio do RPG D20. Os artefatos anteriores autorizavam somente planejamento/protótipo; a solicitação atual do PO autoriza integrar a cena ao projeto com uma sentinela Mandukuru, vínculo com a história salva e efeitos de ataque, dano e derrota. Essa atualização precisa ser registrada nas decisões e no escopo da implementação.

## Stories

- Story 8.1: Fechar contrato, roteiro e acesso da demo
- Story 8.2: Escolher cenário com meu personagem
- Story 8.3: Conhecer habilidades e preparar minha estratégia
- Story 8.4: Jogar o primeiro cenário do início ao desfecho
- Story 8.5: Jogar um segundo cenário com objetivo diferente
- Story 8.6: Repetir e sair da demo com estado íntegro
- Story 8.7: Validar a demo com jogadores e registrar aprendizado

## Requirements & Constraints

- Personagem é o Character do próprio jogador, com leitura autorizada; não usar o avatar da conta. A ausência de ficha não cria personagem automaticamente. Retrato é opcional e tem fallback neutro, sem disparar geração.
- Combate é manual: uma carta por decisão, custo e efeito conhecidos, intenção inimiga visível. Nenhuma espera, animação, aba oculta ou clique duplicado pode alterar a resolução. A resposta inimiga explícita mantém controle do ritmo para gravação.
- Cinco cartas experimentais não equivalem à arte “Carta Jogável” existente. Valores e acontecimentos continuam parâmetros de teste, sem canonizar facção, poderes ou história; a implementação deve registrar a versão adotada.
- Ficha oficial, revisões, aprovação, pesquisa, Crônica e jornada não mudam. Sem recompensas, progressão persistente, publicação automática, PvP, loja, multiplayer ou IA durante o combate.
- Personalização usa somente contexto narrativo autorizado e necessário. Segredo do Mestre, feedback privado, credenciais e dados pessoais desnecessários não integram o roteiro; narrativa completa e ficha não entram em analytics ou bundle público.
- Backend permanece autoridade de acesso. Sessão expirada, acesso negado, troca de conta e perda de elegibilidade removem dados anteriores da superfície. Demo indisponível não bloqueia a experiência principal.
- Evidência deve distinguir testes determinísticos, build, inspeção visual e integração real. Mocks não comprovam acesso ao personagem; registrar versão, limitações e achados de playtest sem afirmar diversão ou acessibilidade apenas pelo código.

## Technical Decisions

- Reutilizar contratos existentes de consulta autorizada do personagem e sua arte, confirmados no OpenAPI oficial antes da integração. Não deduzir endpoints, campos ou permissões por conveniência; lacunas concretas viram dependências específicas.
- Separar domínio/motor puro, conteúdo versionado e apresentação. O motor emite resultados/eventos; animações apresentam esses eventos e nunca calculam dano. Estado da tentativa é local e efêmero; personagem remoto é somente leitura.
- A entrada é opcional na área do personagem, com elegibilidade e recuperação explícitas, sem sintetizar `journeyState` ou mudar `nextRoute`. Estados ausentes, desconhecidos ou bloqueados não autorizam avanço.
- O protótipo de referência usa Vida/Energia padronizadas, cinco ações fixas, proteção até a próxima resposta, Marca única e teto de rodadas. Reinício limpa recursos, flags, efeitos e fila; vitória, derrota ou recuo produzem um único desfecho e bloqueiam novas ações.
- Não presumir pronta a projeção de personagem prevista na arquitetura. Definir uma projeção mínima para identidade e contexto narrativo, preservando a fronteira entre leitura autorizada e conteúdo do encontro.

## UX & Interaction Patterns

Narrativa vem antes da mecânica: entrada opcional, introdução com objetivo, escolha com consequência conhecida, combate legível e desfecho com repetir/sair. Preservar papel/marfim, tinta, terracota, verde e caráter artesanal; integrar arte inimiga sem prejudicar leitura. Cartas funcionam por toque e teclado, sem depender de arrastar. Controles têm alvo mínimo de 44 px e foco visível; custos, bloqueios, ações e resultados usam texto além de cor. Reflow desde 320 px, zoom de 200% e movimento reduzido preservam toda informação. Loading, ficha ausente, retrato ausente, erros e perda de acesso têm mensagem e saída segura. Modo de gravação não publica vídeo e não interfere no estado do combate.

## Cross-Story Dependencies

8.1 fecha contrato, elegibilidade e versão do experimento; 8.2 fornece personagem/entrada; 8.3 prepara habilidades e escolha; 8.4 entrega a primeira cena completa. 8.6 depende de 8.4, sem esperar 8.5. A validação inicial de 8.7 cobre o primeiro cenário; comparação dos dois só ocorre após 8.5. Sessão, retomada da campanha e leitura autorizada existentes sustentam a integração. Nenhuma conclusão da demo substitui os gates do piloto principal.
