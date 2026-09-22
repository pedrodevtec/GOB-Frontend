# Combate em página dedicada

Pedido: substituir o popup da cena experimental por uma página própria, porque a área visível do diálogo prejudicava a experiência.

Implementação: o card em Meu personagem agora navega para `/meu-personagem/combate`. A rota protegida apresenta título, contexto, retorno para a ficha e a arena em uma superfície de largura de página. O diálogo e seu controle de abertura foram removidos; a cena valida acesso, participação e personagem ao entrar na rota e novamente quando a janela recupera foco.

Escopo preservado: motor manual, cinco cartas, estado efêmero, narrativa da ficha, Mandukuru e retrato autenticado. Sair da rota desmonta a tentativa e libera a URL local do retrato; respostas atrasadas são ignoradas. Não houve mudança de backend, autenticação, banco, quota de imagens ou progressão da jornada.

Verificação automatizada: testes de domínio e consumidor React cobrem carregamento direto, revalidação, suspensão, retry, troca de narrativa, saída durante requisição e ciclo de vida do retrato. Typecheck e build são gates desta entrega. Validação visual em navegador real continua necessária após deploy.
