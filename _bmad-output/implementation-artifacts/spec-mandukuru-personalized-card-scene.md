---
title: 'Cena manual personalizada contra Mandukuru'
type: feature
created: '2026-09-22'
status: done
baseline_commit: 88878534b7b3d12d7ff9aa67a684777277dce436
review_loop_iteration: 0
context:
  - /workspace/scratch/98e02dd22fc6/GOB-Frontend-demo-plan/AGENTS.md
  - /workspace/scratch/98e02dd22fc6/GOB-Frontend-demo-plan/_bmad-output/implementation-artifacts/epic-8-context.md
---

<frozen-after-approval reason="intenção autorizada pelo pedido de implementação do usuário">

## Intent

**Problem:** O protótipo amado pelo usuário ainda está isolado. A sentinela precisa ser um Mandukuru e o encontro deve usar a história do personagem salvo.

**Approach:** Integrar uma cena jogável em Meu personagem, com cinco cartas fixas, decisões manuais, arte de inimigo e efeitos de ataque, dano e derrota. Personalizar a abertura com trecho explícito da história salva e ligação narrativa neutra.

## Boundaries & Constraints

**Always:** Reutilizar serviços autorizados da ficha própria; validar contexto atual ao abrir. Combate em memória, sem efeitos sobre ficha, aprovação ou cânone. Aparência Mandukuru provisória. Controles acessíveis, teclado, foco, mobile e movimento reduzido. Texto de ficha renderizado como texto, nunca HTML.

**Ask First:** Publicação em produção ou alterações no backend/autenticação.

**Never:** Combate automático, segundo cenário, geração por IA durante partida, novos endpoints, dados secretos/feedback do Mestre, persistência de dano, telemetria narrativa.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| História | Ficha própria com história | Trecho fiel e abertura relacionada, nome salvo | Sem inventar eventos biográficos |
| História ausente | Ficha sem narrativa | Abertura genérica funcional | Sem bloquear |
| Acesso | Contexto ausente, trocado, negado ou consulta falha | Não iniciar; descartar cena anterior | Mensagem e tentar novamente |
| Combate | Carta e resposta manual | Energia/dano/escudo corretos; uma ação por fase | Inválida ou duplicada não altera estado |
| Fim | Vida zero ou 18 rodadas | Vitória, derrota ou recuo; sem retaliação após vitória | Reinício restaura tudo |

</frozen-after-approval>

## Code Map

- `features/mvp/components/my-character-profile-panel.tsx`: ponto de entrada; hooks atuais de resume/ficha própria. Usar painel ou diálogo sem nova rota.
- `features/mvp/hooks/use-mvp.ts`, `services/mvp.service.ts`, `types.ts`: consultas existentes. `useCampaignResume` revalida; ficha precisa revalidação ao abrir. API GET `/api/v1/tables/{tableId}/characters/me` confirmada no OpenAPI oficial Gob-Backend, `src/docs/openapi.ts`, SHA `3af93e135c5d90088991a006f38ae65f901bd5bd`. Schema expõe `personalHistory`, `creativeDossier`, `narrativeBond`. Sem mudanças de contrato.
- `_bmad-output/planning-artifacts/card-demo/prototypes/abrir-passagem.html`: referência visual e regras. Preservar pergaminho/ruínas; não embutir HTML legado na aplicação.
- `public/images/bravantus/landing-ruins.webp`: cenário. Arte gerada autorizada em `/workspace/scratch/98e02dd22fc6/generated_images/exec-1265daac-5753-4564-a9cc-78ddb4a7eef0.png`; copiar/otimizar com alpha para `public/images/bravantus/enemies/mandukuru-sentinel-v1.webp`. Conversão de formato permitida; não redesenhar.
- Retrato próprio opcional via biblioteca de card-art existente; falha deve usar avatar. Nunca usar imagePath como URL pública sem serviço autenticado.
- `package.json`: testes Node/TS existentes. Dependências possivelmente reutilizáveis no checkout `/workspace/scratch/b972e73d4acb/gob-frontend-issue-43/node_modules` ou npm ci.

## Tasks & Acceptance

**Execution:**
- [x] Criar motor puro de combate e adaptação narrativa com allowlist; testes cobrindo matriz.
- [x] Integrar cena visual com arte, movimentos de ataque, indicador de dano, derrota/vitória, reiniciar e sair; abertura cita história e desfecho retoma motivação sem inventar biografia.
- [x] Validar acesso fresco e isolamento por personagem/mesa/sessão, sem modificar autenticação global.
- [x] Registrar decisões e evidência de validação BMAD; não fechar todas as histórias do épico.

**Acceptance Criteria:**
- Nome salvo e inimigo Mandukuru aparecem na cena. Jogo completamente manual, funcional por teclado, com 5 cartas e final legível.
- Vida jogador28/inimigo36; energia3 máximo5; Golpe0/dano4; Guarda1/escudo7; Concentração0/+3energia; Técnica3/dano9; Marca4/dano12+escudo4 uma vez. Abordagem ataque +3 no primeiro golpe ou defesa +4escudo. Resposta inimiga4, cada terceira9, anunciada; escudo expira após resposta, energia+1. Vitória imediata; limite18 rodadas.

## Spec Change Log

## Verification

- `npm run typecheck`, `npm run build` e teste específico do motor/acesso/narrativa devem passar.
- Validar navegador se disponível; declarar honestamente ausência de E2E real autenticado. Não afirmar validação visual sem renderizar.

### Evidência da implementação — 2026-09-22

`npm run typecheck`, `npm run build` e `npm run test:card-demo` passaram (18 testes: 12 puros e 6 do consumidor React). Detalhes e limites em `mandukuru-card-scene-validation.md`. Acesso verificado por testes determinísticos; E2E autenticado não executado; componente real isolado renderizado em Chromium com serviços simulados, com detalhes de inspeção em registro de validação. Nenhuma história inteira do épico foi encerrada.

## Suggested Review Order

- Entrada opcional revalida a ficha própria sem alterar a jornada.
  [my-character-profile-panel.tsx:120](../../features/mvp/components/my-character-profile-panel.tsx#L120)
- Projeção narrativa mínima e validação de escopo.
  [context.ts:1](../../features/mvp/card-demo/context.ts#L1)
- Regras determinísticas independem das animações.
  [engine.ts:1](../../features/mvp/card-demo/engine.ts#L1)
- Diálogo coordena acesso, controles e efeitos.
  [mandukuru-card-scene.tsx:14](../../features/mvp/components/mandukuru-card-scene.tsx#L14)
- Testes exercitam domínio e interação React.
  [mandukuru.test.ts:1](../../tests/card-demo/mandukuru.test.ts#L1)
  [scene.test.cjs:1](../../tests/card-demo/scene.test.cjs#L1)
- Evidência distingue navegador isolado de autorização real.
  [mandukuru-card-scene-validation.md:1](mandukuru-card-scene-validation.md#L1)
