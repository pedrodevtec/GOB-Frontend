# MVP Pilot Manual Checklist

Use este checklist para validar o fluxo visual e funcional do piloto sem criar testes automatizados.

## Preparacao

- [ ] Frontend aponta para o backend esperado em `NEXT_PUBLIC_API_BASE_URL`.
- [ ] Ambiente tem uma campanha publica publicada pelo backend quando o contrato existir.
- [ ] Termos e privacidade possuem versoes aprovadas quando o contrato existir.
- [ ] Validar em desktop e mobile.

## Fluxo do participante

- [ ] Abrir `/campanhas/[slug]`.
- [ ] Confirmar que a pagina publica nao exibe conteudo secreto.
- [ ] Abrir `/termos` sem autenticacao.
- [ ] Abrir `/privacidade` sem autenticacao.
- [ ] Iniciar cadastro a partir da campanha e conferir `returnTo`.
- [ ] Alternar entre cadastro e login sem perder `returnTo`.
- [ ] Abrir `/confirmar-email` sem token e conferir estado pendente.
- [ ] Abrir `/confirmar-email?token=exemplo` e conferir que a validacao real fica pendente.
- [ ] Abrir `/confirmar-email?status=invalid_token` e conferir erro claro.
- [ ] Abrir `/confirmar-email?status=expired_token` e conferir reenvio claro.
- [ ] Abrir `/campanhas/[slug]/consentimento`.
- [ ] Confirmar que o aceite definitivo fica bloqueado enquanto o backend nao registrar versao e timestamp.
- [ ] Abrir `/campanhas/[slug]/episodio-1`.
- [ ] Confirmar que nenhum conteudo de lore e inventado.
- [ ] Abrir `/campanhas/[slug]/personagem`.
- [ ] Confirmar que catalogo, atributos, traits e equipamentos nao existem no frontend.
- [ ] Salvar anotacao no rascunho local temporario.
- [ ] Recarregar a pagina e confirmar que a anotacao local reaparece.
- [ ] Abrir `/campanhas/[slug]/personagem/ia`.
- [ ] Confirmar que a IA nao aplica sugestao automaticamente.
- [ ] Abrir `/campanhas/[slug]/personagem/revisao`.
- [ ] Confirmar que submissao final fica bloqueada por contrato backend.
- [ ] Abrir `/campanhas/[slug]/pesquisa`.
- [ ] Confirmar que perguntas nao sao inventadas.
- [ ] Abrir `/campanhas/[slug]/conclusao`.
- [ ] Confirmar que status final nao e assumido sem API.

## Operacao

- [ ] Entrar com conta ADMIN.
- [ ] Abrir `/admin/piloto`.
- [ ] Confirmar que contadores ficam pendentes sem inventar metricas.
- [ ] Confirmar que a pagina nao exibe conteudo secreto de personagem/campanha.

## Estados criticos

- [ ] Carregamento tem retorno claro.
- [ ] Erro tem retorno claro.
- [ ] Acesso negado tem retorno claro.
- [ ] Sessao expirada tem retorno claro.
- [ ] Campanha encerrada tem retorno claro.
- [ ] Conteudo ja submetido tem retorno claro.
- [ ] Salvamento em andamento/salvamento local tem retorno claro.

## Fora do escopo nesta validacao

- [ ] Nao validar combate.
- [ ] Nao validar rolagens.
- [ ] Nao validar conducao de sessoes.
- [ ] Nao validar Cronica da Mesa.
- [ ] Nao validar modo espectador.
- [ ] Nao validar jogo fisico.
