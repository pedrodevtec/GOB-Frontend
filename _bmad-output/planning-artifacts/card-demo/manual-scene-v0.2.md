# Cena inicial manual — protótipo v0.2

Origem: orientação do PO em 22/09/2026. Sem combate automático; cenário inicial primeiro; experiência demonstrável para teste e vídeo. Conteúdo abaixo é HIPÓTESE DE PROTÓTIPO, não canon nem regra oficial do RPG.

## Entrega

[abrir-passagem.html](prototypes/abrir-passagem.html) é HTML autocontido: baixar e abrir no navegador, sem servidor, instalação ou conta. Não é rota publicada do aplicativo.
Cenário: Abrir passagem. A sentinela e os acontecimentos são provisórios. Imagem de fundo reaproveitada de public/images/bravantus/landing-ruins.webp; apresentação segue papel/marfim e tokens vigentes.
“Meu personagem” permite informar nome e selecionar retrato local. Isso é uma personalização de demonstração, não leitura do personagem salvo. Não envia arquivo, chama IA, grava dados ou altera ficha. Refresh descarta partida e personalização.

## Regras implementadas somente para explorar a experiência

- Jogador: 28 Vida, 3 Energia inicial, teto 5. Inimigo: 36 Vida.
- Uma carta escolhida por turno. Não há ordem automática nem compra de cartas.
- Golpe: 0 EN, 4 dano. Guarda: 1 EN, 7 proteção. Concentração: 0 EN, +3 EN até o teto. Técnica: 3 EN, 9 dano. Marca: 4 EN, 12 dano e 4 proteção, uma vez por tentativa.
- Guarda/proteção acumulam dentro do turno e expiram após a próxima resposta inimiga. Primeiro aproximação defensiva concede 4 proteção; aproximação ofensiva concede +3 apenas ao primeiro ataque que causar dano.
- Após a carta, jogador clica “Resolver resposta”. Inimigo causa 4 dano; a cada terceira rodada causa 9. Intenção é visível antes da carta. Próximo turno recupera 1 EN.
- Energia insuficiente bloqueia carta, sem gasto ou avanço. Ação duplicada é ignorada enquanto o estado não permite.
- Vitória ao reduzir inimigo a zero, antes da resposta. Derrota ao cair a zero. Após resposta da rodada 18 sem vitória, encerra por recuo. Não existe dano simultâneo/empate.
- Ficar parado, mudar aba ou ocultar controles não avança combate. Animação só apresenta estado já calculado.

## Roteiro sugerido de vídeo — 60 a 90 segundos

1. Personalizar nome/retrato antes de gravar; se usar exemplo, indicar na legenda que é protótipo.
2. Abrir com título e contexto: “Há uma saída. Mas ela não está livre.”
3. Mostrar a escolha inicial e usar “Avançar com firmeza”.
4. Mostrar nome/retrato e intenção do inimigo. Usar Técnica e Golpe, resolvendo uma resposta após cada carta.
5. Na rodada de ataque pesado, usar Guarda. Destacar o bloqueio visível.
6. Usar Concentração, depois Poder da Marca. Mostrar a energia como escolha, não contador decorativo.
7. Concluir com Golpes e desfecho: “O caminho está livre.”
8. Encerrar com “Protótipo em desenvolvimento — uma cena do que estamos testando”. Não dizer que a integração com conta ou o RPG completo está pronto.

Modo vídeo: botão ou tecla V oculta ferramentas e notas para enquadramento; Esc restaura. Não grava nem publica vídeo automaticamente.

## Limites e próximos passos

Aprovação de valores, roteiro e balanceamento pendente. Sem segundo cenário, persistência, autenticação, coleta remota, trilha oficial ou integração de ficha. A Story 8.1 continua aberta e o protótipo não encerra as Stories 8.2–8.7.
Validar primeiro: clareza das escolhas, ritmo, impacto visual e vontade de repetir. Depois integrar personagem via contrato confirmado; então avaliar segundo cenário.

## Verificação executada

Script real do HTML executado em Node com DOM simulado: vitória, derrota, energia insuficiente, proteção, Marca única, clique duplicado e reinício passaram. Sem requisições externas no protótipo.
Revisão visual/interação real em navegador não executada: Chromium não instalado e download indisponível. Isso não é E2E nem comprovação de acessibilidade ou integração com backend.
