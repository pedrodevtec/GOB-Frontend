# Story 1.7 — Recuperar acesso sem expor contas

**PRs:** frontend #40; backend pedrodevtec/Gob-Backend#26  
**Status:** review  
**Requisitos:** NFR-1–NFR-2; extensão operacional aprovada do fluxo de autenticação

## Objetivo

Permitir recuperação segura de acesso sem enumerar contas, expor o token ao armazenamento da aplicação ou manter sessões anteriores válidas após a troca de senha.

## Decisões de implementação

- A solicitação sempre devolve resposta pública genérica.
- O backend gera token aleatório, persiste somente SHA-256, aplica validade de 30 minutos, uso único, cooldown e rate limit.
- A confirmação troca a senha em transação e revoga todas as sessões ativas com motivo `PASSWORD_CHANGED`.
- O frontend usa BFF same-origin, valida senha/confirmação e remove cookie de refresh, access token em memória e caches após sucesso.
- Token ausente, inválido, expirado ou já utilizado produz estado recuperável.
- As rotas de recuperação não podem ser usadas como destino de `returnTo`.

## Validação executada

Backend:

- `npx prisma validate`
- `npm test`
- `npm run typecheck`
- `VERCEL_ENV=preview npm run build:vercel`

Frontend:

- `npm run test:routing`
- `npm run test:auth`
- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Validação pendente

Envio real de e-mail, migration aplicada, token válido/expirado/reutilizado e revogação observada das sessões anteriores permanecem `NÃO EXECUTADO` até a execução da issue #42 em ambiente integrado.
