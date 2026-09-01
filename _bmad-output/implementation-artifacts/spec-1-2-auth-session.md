# Story 1.2 — Unificar sessão e autenticação protegida

**Issue:** #32  
**Status:** review  
**Requisitos:** FR-2, NFR-1–NFR-2

## Objetivo

Aplicar a ADR conjunta de sessão sobre uma única fronteira em `lib/auth`, usando o contrato backend publicado na versão 1.4 sem expor refresh token ao JavaScript do navegador.

## Decisões de implementação

- `POST /api/auth/login`, `refresh` e `logout` formam o BFF same-origin e validam `Origin` antes de qualquer mutação.
- O refresh token fica somente no cookie `HttpOnly`, `SameSite=Lax`, `Path=/`; em produção usa o prefixo `__Host-` e `Secure`.
- O access token e sua expiração ficam somente em memória. As chaves e o cookie legados são removidos durante o bootstrap.
- Zustand mantém apenas a projeção efêmera necessária à interface e não usa persistência para autenticação.
- O bootstrap recupera a sessão pelo BFF; o middleware usa somente a presença do cookie de refresh como pré-filtro de navegação e nunca como autorização.
- Axios tenta refresh e repete a chamada uma vez somente para `401 TOKEN_EXPIRED`. `403`, demais `401` e conflitos de domínio não acionam refresh.
- Requisições simultâneas na mesma aba compartilham uma única Promise. Abas diferentes usam Web Locks quando disponível; no fallback, um `409` de rotação concorrente aguarda e faz uma única nova requisição.
- Logout chama o backend, limpa cookie, memória e cache. Uma indisponibilidade upstream produz `local_only`, evitando afirmar que a revogação remota ocorreu.
- `returnTo` continua restrito aos destinos internos validados pela fronteira de roteamento existente.

## Cobertura automatizada

- deduplicação de refresh concorrente na mesma aba;
- serialização de refresh entre duas abas;
- recuperação única após `409 REFRESH_ALREADY_ROTATED`;
- falha `401` não repetida;
- regressão do catálogo de `returnTo` e roteamento canônico.

## Validação

- `npm run test:auth`
- `npm run test:routing`
- `npm run typecheck`
- `npm run build`
- `git diff --check`

Login, rotação, revogação, logout e expiração contra backend/banco reais permanecem `NÃO EXECUTADO` até execução registrada da matriz E2E em ambiente integrado.

