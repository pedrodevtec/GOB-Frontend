# Story 1.3 — Abrir campanha e retornar após autenticação

**Issue:** #33  
**Status:** review  
**Requisitos:** FR-1, FR-2

## Objetivo

Garantir que a landing pública explique o Piloto sem expor estado interno e que cadastro, login e confirmação de e-mail preservem somente um `returnTo` interno bem formado.

## Decisões de implementação

- A landing continua consumindo somente `GET /api/v1/campaigns/public/{slug}`.
- `404 PUBLIC_CAMPAIGN_NOT_FOUND` produz a mesma mensagem para campanha inexistente, fechada ou indisponível.
- `returnTo` rejeita esquema, protocol-relative URL, barra invertida, controle, encoding inválido e variante codificada de rota externa.
- Login, cadastro, confirmação e reenvio carregam o destino interno validado sem revelar o token.
- CTAs autenticados aguardam hidratação e a resposta de `resume`; nenhum CTA aponta para uma etapa inferida localmente.

## Critérios cobertos

- proposta e etapas permanecem visíveis na landing responsiva;
- indisponibilidade falha com mensagem segura;
- destino interno é preservado entre autenticação e confirmação;
- destino externo ou malformado usa fallback seguro;
- confirmação inválida oferece reenvio e retorno ao login preservando `returnTo`;
- não há CTA autenticado antes da hidratação.

## Validação

- `npm run test:routing`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- cenários integrados permanecem registrados em `docs/pilot-e2e-matrix.md` e só podem ser marcados como `PASSOU` com frontend, backend e banco reais.

