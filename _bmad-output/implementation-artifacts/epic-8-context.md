# Epic 8 Context: Experimentar meu Guardião em uma demo de cartas

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Oferecer uma extensão opcional no navegador em que o jogador reconheça seu próprio Guardião numa história curta, escolha manualmente entre cinco habilidades fixas e perceba o efeito das suas decisões. O recorte autorizado para integração é o primeiro cenário, “Abrir passagem”, numa página própria com sentinela Mandukuru, retrato e contexto narrativo do personagem; o segundo cenário permanece posterior. A demo é experimental, não altera o pilot-core e não comprova o loop com Mestre nem o equilíbrio do RPG D20.

## Stories

- Story 8.1: Fechar contrato, roteiro e acesso da demo
- Story 8.2: Escolher cenário com meu personagem
- Story 8.3: Conhecer habilidades e preparar minha estratégia
- Story 8.4: Jogar o primeiro cenário do início ao desfecho
- Story 8.5: Jogar um segundo cenário com objetivo diferente
- Story 8.6: Repetir e sair da demo com estado íntegro
- Story 8.7: Validar a demo com jogadores e registrar aprendizado

## Requirements & Constraints

- Usar o `Character` do jogador por leitura autorizada, nunca o avatar da conta. Ausência de ficha não cria personagem automaticamente. Mostrar o retrato `PORTRAIT` salvo na arena, com fallback neutro se ausente ou inválido; não gerar imagem nem consumir cota.
- Abrir com o nome e um trecho fiel da história salva, usando apenas uma ligação narrativa neutra, e retomar a motivação no desfecho. Narrativa autorizada é texto, não HTML. Segredos do Mestre e dados privados não podem chegar ao navegador, analytics ou bundle público.
- O combate é manual: o jogador escolhe uma das cinco cartas por turno, conhece custo e efeito e vê a intenção inimiga. A resposta inimiga avança explicitamente, mantendo o ritmo controlável para teste e vídeo. Espera, aba oculta, animação e cliques repetidos não alteram o resultado nem duplicam ações.
- As cinco habilidades formam um catálogo experimental versionado e não reutilizam nem multiplicam a geração da arte “Carta Jogável”. Mandukuru, arte, parâmetros e acontecimentos da cena não estabelecem aparência ou regra canônica do RPG.
- Ficha, revisão, aprovação, pesquisa, Crônica, jornada e dados canônicos permanecem inalterados. Não há recompensa, progressão persistente, publicação automática, IA em runtime, PvP, loja ou multiplayer.
- Backend continua autoridade para sessão e acesso. Estados ausentes, desconhecidos ou bloqueados não autorizam a cena. `401/403`, logout, troca de conta ou perda de elegibilidade removem identidade, história e URL local de retrato da superfície; respostas atrasadas não podem repovoar a cena. Indisponibilidade da demo não bloqueia a experiência principal.
- O primeiro cenário precisa permitir vitória, derrota/recuo, reinício limpo e saída segura. O segundo cenário não bloqueia essa entrega e não está autorizado para integração neste recorte.
- Evidência deve separar testes determinísticos, inspeção visual/acessível e integração autenticada. Mock, lint ou build não comprovam acesso real, acessibilidade ou valor do playtest; registrar versão do experimento, limitações e achados sem alegar diversão apenas pelo código.

## Technical Decisions

- A cena vive em `/meu-personagem/combate`, aberta pelo card existente em Meu personagem, carrega automaticamente e oferece retorno explícito. É uma rota opcional: não sintetizar `journeyState`, alterar `nextRoute` ou torná-la etapa obrigatória.
- Reutilizar somente contratos existentes e confirmados para personagem e arte. Não inventar DTO, endpoint, permissão ou backend novo. A projeção mínima inclui identidade, trecho narrativo permitido e retrato; o personagem remoto é somente leitura.
- Manter domínio/motor puro, conteúdo versionado e apresentação separados. O motor calcula estado e emite eventos ordenados; animações de ataque, dano, vitória e derrota apenas apresentam resultados já calculados.
- A tentativa é local, determinística e efêmera. Reinício ou troca de contexto limpa Vida, Energia, rodada, proteção, uso único, efeitos, fila e callbacks pendentes. Vitória, derrota ou recuo produzem um único desfecho e impedem novas ações.
- A configuração de referência usa Vida/Energia, cinco ações fixas, proteção válida até a próxima resposta, Marca de uso único, intenção previsível e limite de rodadas. Tratar esses valores como configuração de experimento, não como regras globais.
- Liberar qualquer URL de objeto do retrato ao sair, desmontar, perder acesso ou trocar de personagem. A carta completa não substitui o retrato; o Guardião pixel art permanece apenas como companheiro da interface.

## UX & Interaction Patterns

A sequência é entrada opcional, introdução/objetivo, escolha com consequência conhecida, combate e desfecho com repetir ou sair. Preservar papel/marfim, tinta, terracota, verde e caráter artesanal; a arte provisória do Mandukuru não pode prejudicar a leitura. Cartas funcionam por toque e teclado, sem arrastar, com alvos de pelo menos 44 px, foco visível e custo/bloqueio expressos por texto e ícone além de cor. Suportar reflow desde 320 px, zoom de 200% e movimento reduzido sem perder ação, intenção ou resultado. Loading, personagem ausente, retrato ausente, sessão expirada, acesso negado, cenário inválido e erro têm mensagens distintas e saída segura. O modo de gravação só ajusta a apresentação; não publica vídeo nem muda o combate.

## Cross-Story Dependencies

8.1 fecha contratos e configurações; 8.2 fornece entrada e personagem; 8.3 apresenta preparação e habilidades; 8.4 entrega “Abrir passagem”. 8.6 depende de 8.4 e viabiliza repetição do primeiro cenário sem esperar 8.5. A rodada inicial de 8.7 valida esse percurso; comparação entre cenários só ocorre depois de 8.5. A autorização de integração cobre apenas a primeira cena; demais histórias e expansão continuam sujeitas aos respectivos gates.
