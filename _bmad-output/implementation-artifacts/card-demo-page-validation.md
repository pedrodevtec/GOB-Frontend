# Combate em página dedicada

Pedido: substituir o popup da cena experimental por uma página própria, porque a área visível do diálogo prejudicava a experiência.

Implementação: o card em Meu personagem agora navega para `/meu-personagem/combate`. A rota protegida apresenta título, contexto, retorno para a ficha e a arena em uma superfície de largura de página. O diálogo e seu controle de abertura foram removidos; a cena valida acesso, participação e personagem ao entrar na rota e novamente quando a janela recupera foco.

Escopo preservado: motor manual, cinco cartas, estado efêmero, narrativa da ficha, Mandukuru e retrato autenticado. Sair da rota desmonta a tentativa e libera a URL local do retrato; respostas atrasadas são ignoradas. Não houve mudança de backend, autenticação, banco, quota de imagens ou progressão da jornada.

Verificação automatizada: testes de domínio e consumidor React cobrem carregamento direto, revalidação, suspensão, retry, troca de narrativa, saída durante requisição e ciclo de vida do retrato. Typecheck e build são gates desta entrega. Validação visual em navegador real continua necessária após deploy.

## Painéis equivalentes e compactação

Personagem e Mandukuru agora compartilham a mesma estrutura externa de combatente, caixa visual e painel de status. O retrato autenticado, seu fallback neutro e a arte contida do Mandukuru ocupam caixas equivalentes; Vida, Energia, Escudo, intenção, bônus, dano e desfecho permanecem visíveis e podem aumentar naturalmente a altura do painel.

A densidade foi reduzida em incrementos da grade de 4 px na arena, entre combatentes, nas mensagens, nas cartas e no espaçamento da rota. O breakpoint estrutural existente de 420 px foi preservado e, nele, os combatentes usam uma coluna; as cartas mantêm duas colunas compactas, com a última ocupando a linha completa. Controles mantêm altura mínima de 44 px, foco visível e a regra de movimento reduzido.

Evidência automatizada: o teste do consumidor React verifica que os dois artigos de combate contêm exatamente uma caixa visual e um painel de status compartilhados, além da permanência das informações críticas; os testes de retrato existentes continuam cobrindo ausência, falha e fallback jogável. Typecheck, suíte `test:card-demo`, build e `git diff --check` são registrados separadamente na execução. Não houve navegador autenticado real nesta verificação, portanto ela não é evidência E2E nem substitui inspeção visual em 1368, 537 e 320 CSS px.
