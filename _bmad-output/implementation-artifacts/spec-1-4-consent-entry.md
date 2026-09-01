# Story 1.4 — Consentir e ingressar sem duplicação

**Issues:** frontend #36; backend #19  
**Status:** review

## Objetivo

Permitir que uma pessoa autenticada leia a versão vigente do consentimento, registre uma decisão consciente e ingresse no Piloto sem aceite parcial, membership duplicada ou navegação prematura.

## Decisões de implementação

- O documento vem de `GET /api/v1/campaigns/public/{slug}/consent`; a versão não é inferida no cliente.
- `POST /api/v1/campaigns/public/{slug}/consent` sempre envia `status`, `consentVersion` e `source`.
- `ACCEPTED` cria ou reutiliza a membership na mesma transação backend; o frontend não chama `/join` no fluxo novo.
- A próxima página só abre após sucesso, nova leitura de `resume` e validação da rota canônica.
- `409 CONSENT_VERSION_MISMATCH` limpa a confirmação local, recarrega documento e estado e exige nova leitura.
- Recusa não avança. Revogação fica atrás de confirmação explícita e pode encerrar a sessão por segurança.
- O modo `?gerenciar=1` permite consultar ou interromper participação sem enfraquecer a proteção canônica das demais entradas diretas.

## Critérios cobertos

- versão, finalidade, usos de dados, voluntariedade e revogabilidade visíveis;
- aceite vinculado à versão exibida;
- nenhuma navegação em falha;
- retry não chama `/join` nem cria transição local;
- mensagens próprias para versão alterada, lotação, indisponibilidade e sessão;
- recusa e revogação possuem confirmação e estado humano;
- rota final aceita somente destino canônico da campanha.

## Validação

- `npm run typecheck`
- `npm run test:consent`
- `npm run test:routing`
- `npm run test:auth`
- `npm run lint`
- `npm run build`

O E2E com backend, banco e navegador reais continua obrigatório antes do convite externo e permanece como `NÃO EXECUTADO` na matriz do Piloto.
