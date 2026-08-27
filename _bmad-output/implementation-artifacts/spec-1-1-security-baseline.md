---
title: 'Story 1.1 — Corrigir o baseline de segurança do frontend'
type: 'chore'
created: '2026-08-27'
status: 'done'
review_loop_iteration: 0
baseline_commit: '17ceeef045b1d893dfedbb9946e510c315e0163b'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** O manifesto ainda declara Next.js anterior ao patch de segurança 15.5.24, React/React DOM em ranges RC e tipos React 18, embora o lock já resolva runtimes React 19. Isso deixa a instalação não reprodutível em um baseline coerente e mantém duas vulnerabilidades críticas corrigidas somente no patch de agosto de 2026.

**Approach:** Atualizar apenas as dependências diretas necessárias para o baseline suportado, regenerar o lockfile e comprovar uma instalação limpa seguida de lint, typecheck, build e auditoria crítica, sem alterar comportamento funcional.

## Boundaries & Constraints

**Always:** Manter Next.js na linha Maintenance LTS 15.5 e `eslint-config-next` na mesma versão; manter `react` e `react-dom` na mesma versão estável da major 19; alinhar `@types/react` e `@types/react-dom` à major 19; substituir também o range RC direto de Zustand por range estável da major 5; preservar scripts, configuração e código da aplicação quando as validações passarem sem mudanças.

**Ask First:** Qualquer incompatibilidade que exija alterar código, configuração de Next/TypeScript/ESLint, trocar gerenciador de pacotes, adicionar override/resolution ou subir Next.js para a major 16.

**Never:** Usar `--force`, `--legacy-peer-deps`, suprimir erro de lint/TypeScript/build, editar dependência transitiva manualmente, executar `generate:api`, alterar autenticação ou misturar outra história nesta PR.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|----------------------------|----------------|
| Instalação suportada | Manifesto e lock atualizados | `npm ci` instala uma árvore coerente sem conflito de peer dependency | Falha interrompe a história; não contornar resolução |
| Baseline verificável | Árvore instalada do zero | Next/eslint-config-next ≥15.5.24, React/DOM estáveis e tipos na major 19 | Versão divergente exige corrigir manifesto/lock e repetir instalação |
| Regressão de toolchain | Dependências atualizadas | lint, typecheck e build passam sem mudança de código | Se exigir código/configuração, parar e pedir aprovação |
| Auditoria crítica | Dependências de produção instaladas | Nenhum alerta crítico permanece no baseline de produção | Registrar pacote/caminho e interromper antes de declarar conclusão |

</frozen-after-approval>

## Code Map

- `package.json` — manifesto atualizado a partir do baseline que declarava `next ^15.0.3`, React/DOM RC, tipos React 18, `eslint-config-next ^15.5.15` e Zustand RC.
- `package-lock.json` — lockfile v3 regenerado a partir do baseline que resolvia Next/eslint-config-next 15.5.15, React/DOM 19.2.5, tipos React 18.3.x e Zustand 5.0.12.
- `.eslintrc.json` — somente leitura; preserva `next/core-web-vitals`, compatível com eslint-config-next 15.5.24.
- `next.config.mjs` — somente leitura; configuração mínima sem opção experimental dependente de patch.
- `tsconfig.json` — somente leitura; TypeScript estrito e plugin Next devem continuar válidos com tipos React 19.

## Tasks & Acceptance

**Execution:**
- [x] `package.json` — fixar ranges estáveis mínimos/atuais compatíveis: Next e eslint-config-next 15.5.24, React/DOM 19.2.8, tipos React 19.2.x e Zustand 5.0.15 — eliminar ranges RC e desalinhamento de tipos sem mudar majors funcionais.
- [x] `package-lock.json` — regenerar pelo npm a partir do manifesto e confirmar versões diretas/peer dependencies resolvidas — tornar a instalação reproduzível sem edição manual.
- [x] `package.json` + árvore instalada — executar instalação limpa e todas as verificações definidas abaixo — provar o baseline antes de marcar a história concluída.

**Acceptance Criteria:**
- Given a branch baseada na `main` pós-PR #27, when o manifesto e o lockfile forem inspecionados, then Next.js e `eslint-config-next` resolvem pelo menos 15.5.24, React/DOM não usam RC, os tipos estão na major 19 e nenhum range direto contém `-rc`.
- Given uma árvore ausente ou limpa, when `npm ci` for executado, then a instalação termina sem `--force`, `--legacy-peer-deps` ou conflito de peer dependency.
- Given a instalação limpa concluída, when lint, typecheck e build forem executados, then todos terminam com código zero sem supressão ou alteração funcional.
- Given a árvore instalada, when a auditoria de produção no nível crítico for executada, then nenhum alerta crítico permanece.

## Spec Change Log

## Design Notes

O patch 15.5.24 é o Maintenance LTS indicado pela publicação oficial [August 2026 Security Release](https://nextjs.org/blog/nextjs-security-release-august-2026-update), consultada em 2026-08-27. A atualização permanece na major 15 para reduzir blast radius; React e React DOM avançam apenas dentro da major 19 já adotada pelo projeto. React 19 é o baseline estável escolhido para manter runtime e tipos coerentes.

## Verification

**Commands:**
- `npm ci` — expected: instalação limpa sem conflito ou flags de contorno.
- `npm ls next eslint-config-next react react-dom @types/react @types/react-dom zustand --depth=0` — expected: versões diretas coerentes com o manifesto e sem `invalid`/`extraneous`.
- `npm run lint` — expected: código zero.
- `npm run typecheck` — expected: código zero.
- `npm run build` — expected: código zero.
- `npm audit --omit=dev --audit-level=critical` — expected: nenhum alerta crítico de produção.

## Verification Evidence

Execução final em `2026-08-27T20:50:25Z`, Node.js `v24.19.0` e npm `11.9.0`:

- Baseline `17ceeef045b1d893dfedbb9946e510c315e0163b` confirmado como ancestral da branch (`git merge-base --is-ancestor`, exit `0`).
- `npm ci`: exit `0`, 445 pacotes instalados sem conflito de peer dependency ou flag de contorno.
- Árvore direta: Next/eslint-config-next `15.5.24`; React/DOM `19.2.8`; tipos React `19.2.18`/`19.2.5`; Zustand `5.0.15`; nenhum range direto RC, pacote `invalid` ou `extraneous`.
- `npm run lint`, `npm run typecheck` e `npm run build`: exit `0`; build compilou e gerou 53 páginas.
- Smoke do build: `next start -H 127.0.0.1 -p 3102` ficou pronto e `GET /` respondeu HTTP `200`. A primeira tentativa sem host explícito falhou apenas na enumeração de interfaces do ambiente (`uv_interface_addresses`), antes de carregar a aplicação.
- Auditoria de produção no nível crítico: exit `0`, nenhum crítico; permaneceram 2 moderadas e 5 altas registradas em `deferred-work.md`.
- Auditoria da árvore completa no nível crítico: exit `0`, nenhum crítico; permaneceram 3 moderadas e 7 altas, também fora do gate aprovado.
- `git diff --check`: sem erros.

## Suggested Review Order

**Baseline de dependências**

- Versões exatas mantêm framework, runtime e tipos alinhados e reproduzíveis.
  [`package.json:22`](../../package.json#L22)

- Lockfile confirma a árvore efetivamente resolvida pelo npm.
  [`package-lock.json:19`](../../package-lock.json#L19)

**Evidência e risco residual**

- Evidência registra ambiente, comandos, versões, smoke e resultados das auditorias.
  [`spec-1-1-security-baseline.md:78`](spec-1-1-security-baseline.md#L78)

- Riscos fora da 1.1 permanecem explícitos para histórias futuras.
  [`deferred-work.md:1`](deferred-work.md#L1)

**Rastreabilidade BMAD**

- Contexto do Épico 1 preserva limites e dependências das próximas histórias.
  [`epic-1-context.md:1`](epic-1-context.md#L1)

- Sprint mantém Épico 1 ativo e Story 1.1 pronta para revisão.
  [`sprint-status.yaml:38`](sprint-status.yaml#L38)
