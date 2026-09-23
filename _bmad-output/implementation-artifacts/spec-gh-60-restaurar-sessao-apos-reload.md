---
title: 'Issue #60 — Restaurar sessão após recarregar uma rota protegida'
type: 'bugfix'
created: '2026-09-22'
status: 'done'
review_loop_iteration: 1
baseline_commit: '3cb55159fb64ab313995a6687c0ad2e71c97de29'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
  - '{project-root}/_bmad-output/implementation-artifacts/spec-1-2-auth-session.md'
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-GOB-Frontend-2026-08-27/ADR-001-AUTH-SESSION.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Após login válido, recarregar uma rota protegida pode levar o participante ao login. O frontend comprovadamente trata qualquer falha do refresh — inclusive rede, `503` ou rejeição de origem — como sessão inválida, limpa o estado e transmite logout para outras abas; o status/código original observado no ambiente real ainda não foi capturado.

**Approach:** Separar falha terminal de autenticação de falha recuperável, preservar a rota e bloquear conteúdo privado enquanto a restauração é tentada novamente, redirecionando apenas quando o backend confirmar sessão inválida. Registrar status e código sanitizados, sem token, cookie ou dados pessoais, para permitir fechar a causa real no E2E.

## Boundaries & Constraints

**Always:** Tratar o backend como autoridade; somente `401` terminal limpa sessão e redireciona; `409` mantém a repetição única já contratada; rede, `429`, `5xx` e `403 AUTH_ORIGIN_REJECTED` não publicam logout. Retentativas são limitadas e a falha persistente oferece ação explícita. A mesma política governa bootstrap, refresh em memória e interceptor Axios.

**Ask First:** Alterar códigos HTTP do backend, contrato OpenAPI, atributos/nome do cookie, duração da sessão, mecanismo de rotação ou transformar chamadas protegidas em BFF completo.

**Never:** Persistir access/refresh token em JavaScript; exibir conteúdo privado antes da restauração; registrar credenciais, valores de token/cookie, e-mail, ficha ou narrativa; declarar a #60 resolvida sem login novo + F5, mobile e duas abas contra backend real.

## I/O & Edge-Case Matrix

| Cenário | Entrada / estado | Resultado esperado | Tratamento de erro |
|---|---|---|---|
| Restauração válida | cookie válido; F5 em rota protegida | sessão volta e a rota é preservada | sem redirecionamento |
| Sessão terminal | refresh retorna `401` | memória/cache de autenticação são limpos e login recebe `returnTo` seguro | logout pode ser propagado entre abas |
| Falha temporária | rede, `429` ou `5xx` | conteúdo permanece bloqueado; tentativa limitada e ação “Tentar novamente” | não limpar nem redirecionar |
| Origem rejeitada | `403 AUTH_ORIGIN_REJECTED` | estado recuperável/configuração, com código sanitizado | não tratar como logout |
| Rotação concorrente | `409 REFRESH_ALREADY_ROTATED` | aguardar e tentar uma única vez com o cookie sucessor | falha posterior segue sua classe real |

</frozen-after-approval>

## Code Map

- `components/providers/auth-bootstrap.tsx` — restaura a sessão no mount; hoje os dois catches sempre limpam e redirecionam. Deve ter uma única rotina, estado recuperável e retry manual.
- `lib/auth/session.ts` — `refreshSession()` hoje chama `clearMemorySession()` para todo `ApiRequestError` não-409; restringir invalidação a falha terminal.
- `lib/auth/bootstrap-policy.ts` — nova política pura compartilhada para classificar `401`, `403`, `409`, `429`, `5xx` e erro de transporte.
- `lib/api/client.ts` — no retry de `TOKEN_EXPIRED`, preservar a falha temporária em vez de convertê-la em `UnauthorizedApiError`; `401` terminal continua limpando e redirecionando.
- `app/api/auth/refresh/route.ts` — somente leitura/contrato: já remove cookie em `401` e o preserva em `409/503`; não ampliar o BFF sem evidência.
- `tests/auth/refresh-coordinator.test.ts` e novo teste de política/bootstrap — runner `node:test`; cobrir matriz e garantir ausência de limpeza/redirecionamento transitório.
- `docs/pilot-e2e-matrix.md` — registrar F5 após login, falha temporária, duas abas e mobile como gates reais.
- `spec-1-2-auth-session.md`, `ADR-001-AUTH-SESSION.md`, `sprint-status.yaml` e `deferred-work.md` — alinhar regra, status e pendência E2E da #60.

## Tasks & Acceptance

**Execution:**
- [x] `lib/auth/bootstrap-policy.ts`, `lib/auth/session.ts` e `lib/api/client.ts` — centralizar a classificação e impedir limpeza/redirecionamento por falha não terminal.
- [x] `components/providers/auth-bootstrap.tsx` — consolidar bootstrap, bloquear a superfície durante falha recuperável, aplicar retry limitado e oferecer nova tentativa sem perder `returnTo`.
- [x] `tests/auth/*` e `package.json` — testar a matriz, consumidor do bootstrap, resposta tardia/unmount e propagação entre abas no comando `test:auth`.
- [x] Artefatos BMAD, ADR e matriz E2E — registrar decisão, evidências locais e gates reais sem atribuir causa não comprovada ao backend.

**Acceptance Criteria:**
- Given uma sessão válida, when a rota protegida é recarregada e o refresh responde, then usuário e access token voltam à memória e a URL original é mantida.
- Given uma falha temporária na restauração, when as tentativas automáticas se esgotam, then nenhum logout é emitido, dados privados não aparecem e o participante pode tentar novamente.
- Given um `401` terminal, when a restauração falha, then a sessão local é limpa uma vez, outras abas recebem o evento e o login preserva somente `returnTo` interno.
- Given a suíte local, when `test:auth`, lint, typecheck e build executam, then a política terminal/transitória e a regressão existente passam sem alterar o contrato backend.

## Spec Change Log

- 2026-09-22: implementação concluída localmente; política terminal/transitória, bloqueio da superfície protegida, retry limitado, diagnóstico sanitizado, testes e documentação adicionados. Validação integrada permanece pendente e registrada em `deferred-work.md`.
- 2026-09-22: findings da revisão aplicados: fase sincronizada com login sem remount, navegação público→protegido terminal, cache público preservado, conflito `409` sem retry automático adicional, estado terminal e acessibilidade corrigidos, além de harness consumidor real. A limitação preexistente de Web Locks foi deferida.
- 2026-09-22: limpeza terminal protegida pela geração da sessão em memória; um `401` tardio de refresh iniciado antes do login não pode apagar a sessão recém-criada.

## Design Notes

A decisão usa status e `error.code` juntos para diagnóstico, mas mantém `401` como única classe terminal do refresh. O overlay de recuperação deve ser modal do ponto de vista visual e de interação, impedindo uso do shell já renderizado sem afirmar que a sessão acabou.

## Verification

**Commands:**
- `npm run test:auth` — política, bootstrap, concorrência e regressões aprovadas.
- `npm run lint` — sem erros ou supressões novas.
- `npm run typecheck` — tipos coerentes.
- `npm run build` — rotas compiladas.
- `git diff --check` — patch sem erros de whitespace.

**Manual checks:**
- Em ambiente integrado: login novo → F5 na mesma rota; repetir no mobile e em duas abas; observar somente status e `error.code` de `/api/auth/refresh`, nunca valores de cookie/token.

**Resultado local (2026-09-22):** `test:auth` (19/19, incluindo o componente real, proteção contra `401` tardio e decisões puras usadas por `session`/interceptor), lint, typecheck, build e `git diff --check` aprovados. Os testes de composição provam as decisões de produção para não limpar/converter `503` e `403`; não simulam o transporte Axios/fetch completo. Checks manuais em backend real: `NÃO EXECUTADO`.

## Suggested Review Order

**Restauração e bloqueio da interface**

- Entrada principal coordena sessão, retry, redirecionamento e bloqueio de conteúdo protegido.
  [`auth-bootstrap.tsx:30`](../../components/providers/auth-bootstrap.tsx#L30)

- Estados recuperável e terminal oferecem mensagens e controles acessíveis sem expor a aplicação.
  [`auth-bootstrap.tsx:146`](../../components/providers/auth-bootstrap.tsx#L146)

**Política e concorrência da sessão**

- Classificação central separa falha terminal, transitória, conflito e resposta superada.
  [`bootstrap-policy.ts:25`](../../lib/auth/bootstrap-policy.ts#L25)

- Geração da sessão impede um `401` antigo de apagar login recém-concluído.
  [`session.ts:139`](../../lib/auth/session.ts#L139)

- Interceptor preserva indisponibilidade transitória e redireciona apenas em falha terminal vigente.
  [`client.ts:53`](../../lib/api/client.ts#L53)

**Cobertura e validação integrada**

- Teste consumidor prova bloqueio, retry, login sem remount, `returnTo` e cache entre abas.
  [`auth-bootstrap.consumer.test.cjs:118`](../../tests/auth/auth-bootstrap.consumer.test.cjs#L118)

- Matriz unitária cobre classificação, limite de retry, `409` e corrida com login novo.
  [`refresh-coordinator.test.ts:16`](../../tests/auth/refresh-coordinator.test.ts#L16)

- Matriz E2E preserva os gates reais de F5, mobile e duas abas.
  [`pilot-e2e-matrix.md:30`](../../docs/pilot-e2e-matrix.md#L30)
