---
title: 'Unificar painéis e densidade visual do combate'
type: 'refactor'
created: '2026-09-22'
status: 'done'
baseline_commit: '5bbe6e84f588c87998c9dc81b949be2be2ef94dc'
review_loop_iteration: 0
context:
  - /workspace/scratch/98e02dd22fc6/GOB-Frontend-demo-plan/AGENTS.md
  - /workspace/scratch/98e02dd22fc6/GOB-Frontend-demo-plan/_bmad-output/implementation-artifacts/epic-8-context.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** No combate, o personagem aparece dentro de um painel alto que reúne retrato e atributos, enquanto o Mandukuru usa arte solta e apenas uma faixa de atributos. Essa assimetria e a soma de paddings, gaps e alturas mínimas deixam a página visualmente desequilibrada e mais longa do que o necessário.

**Approach:** Dar aos dois combatentes a mesma hierarquia visual — área de imagem equivalente e painel de atributos compartilhado — e compactar o ritmo vertical da cena sem reduzir texto, informação, foco ou alvos interativos.

## Boundaries & Constraints

**Always:** Preservar retrato autenticado e fallback neutro, arte do Mandukuru com `object-fit: contain`, textos e medidores distintos, efeitos de ataque/dano/derrota, controles de pelo menos 44 px, foco visível, uma coluna em 320 px, zoom/reflow e movimento reduzido. Usar a grade de espaçamento de 4 px e manter papel/marfim, tinta e bordas atuais.

**Ask First:** Alterar arte, regras, valores, conteúdo narrativo, breakpoint estrutural acima de 420 px ou remover informação atualmente visível.

**Never:** Cortar retratos, esconder Energia/Escudo/intenção/dano, encolher alvos para ganhar espaço, mudar motor/estado/acesso, introduzir rolagem interna na arena ou tornar os painéis iguais apenas em uma largura.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Retrato disponível | Personagem e Mandukuru em combate | Duas colunas equivalentes: imagem de mesma área e painel de atributos com a mesma superfície | N/A |
| Retrato ausente/inválido | Hook sem URL ou erro de imagem | Fallback ocupa a mesma caixa visual e mantém alinhamento | Combate continua jogável |
| Conteúdo variável | Nome longo, bônus, intenção e mensagem de dano | Painel cresce sem corte, sobreposição ou perda de leitura | Reflow natural |
| Tela estreita | 320–420 CSS px ou zoom equivalente | Combatentes empilham, controles permanecem alcançáveis e não há scroll horizontal | N/A |

</frozen-after-approval>

## Code Map

- `features/mvp/components/mandukuru-card-scene.tsx:161-179` — `MandukuruEncounter` usa estruturas diferentes: `.fighter` contém retrato e status; `.enemy` contém arte solta e `.enemyStats`. Espelhar a estrutura preservando classes de animação nos `article` externos.
- `features/mvp/components/mandukuru-card-scene.module.css:51-57,142-200,212-259,379-454` — origem da assimetria e do excesso de espaço: stage 24 px, gap 30 px, superfícies distintas, cartões com 210 px e regras móveis separadas. Consolidar combatente, imagem e painel de status; compactar somente em passos da grade de 4 px.
- `app/(protected)/meu-personagem/combate/page.tsx:8-17` — espaçamento externo da rota; reduzir um nível sem alterar navegação ou conteúdo.
- `tests/card-demo/scene.test.cjs` — consumidor React já cobre fases e retrato. Acrescentar evidência estrutural de dois painéis de status equivalentes e preservar fallback/estados.
- `_bmad-output/planning-artifacts/card-demo/decisions.md` e `_bmad-output/implementation-artifacts/card-demo-page-validation.md` — registrar que a mudança é somente de apresentação e densidade.
- `_bmad-output/planning-artifacts/ux-designs/ux-GOB-Frontend-2026-08-27/DESIGN.md` e `EXPERIENCE.md` — evidência somente leitura: grid de 4 px, alvo mínimo 44 px, reflow desde 320 px e proibição de esconder conteúdo crítico.

## Tasks & Acceptance

**Execution:**
- [x] `features/mvp/components/mandukuru-card-scene.tsx` — tornar personagem e Mandukuru estruturalmente equivalentes, compartilhando painel de status e caixa visual de imagem.
- [x] `features/mvp/components/mandukuru-card-scene.module.css` e `app/(protected)/meu-personagem/combate/page.tsx` — consolidar estilos e reduzir paddings, gaps e alturas ociosas, preservando regras responsivas e acessíveis.
- [x] `tests/card-demo/scene.test.cjs` — testar simetria estrutural, fallback e permanência das informações de combate.
- [x] Artefatos BMAD — registrar decisão e evidência visual/automatizada sem afirmar E2E real.

**Acceptance Criteria:**
- Given combate iniciado com retrato válido, when a arena é exibida, then personagem e Mandukuru usam a mesma composição imagem + painel de atributos, com alinhamento e largura equivalentes.
- Given ausência de retrato ou nome/conteúdo maior, when o layout reflui, then não há corte, sobreposição ou alteração das regras e informações.
- Given desktop, captura de 537×742 e viewport de 320 px, when comparados ao estado atual, then a cena ocupa menos espaço vertical, mantém hierarquia legível e todos os controles continuam com pelo menos 44 px.

## Spec Change Log

## Design Notes

A simetria deve vir da mesma estrutura e das mesmas classes compartilhadas, não de compensações com alturas diferentes. O espaço pode ser reduzido em `scene`, `stage`, `combat`, `result/narration` e cartões, sempre em incrementos de 4 px; conteúdo variável continua determinando a altura final.

## Verification

**Commands:**
- `npm run typecheck` — esperado: zero erros.
- `npm run test:card-demo` — esperado: suíte existente e novas asserções passando.
- `npm run build` — esperado: rota `/meu-personagem/combate` gerada sem erro.
- `git diff --check` — esperado: nenhuma falha de whitespace.

**Manual checks:**
- Comparar estados normal, dano, vitória/derrota e fallback nas larguras 1368, 537 e 320 CSS px; conferir teclado e `prefers-reduced-motion`. Registrar separadamente qualquer ausência de navegador autenticado real.

## Suggested Review Order

**Composição dos combatentes**

- Estrutura compartilhada torna retrato, fallback e Mandukuru comparáveis sem tocar no motor.
  [`mandukuru-card-scene.tsx:161`](../../features/mvp/components/mandukuru-card-scene.tsx#L161)

- Caixa visual comum preserva proporção; tratamentos de retrato e inimigo permanecem explícitos.
  [`mandukuru-card-scene.module.css:141`](../../features/mvp/components/mandukuru-card-scene.module.css#L141)

**Densidade e responsividade**

- Cartas e mensagens usam ritmo compacto mantendo conteúdo e alvos acessíveis.
  [`mandukuru-card-scene.module.css:259`](../../features/mvp/components/mandukuru-card-scene.module.css#L259)

- Mobile empilha combatentes, mas preserva cartas na grade compacta 2+2+1.
  [`mandukuru-card-scene.module.css:400`](../../features/mvp/components/mandukuru-card-scene.module.css#L400)

- A rota remove apenas espaço externo ocioso.
  [`page.tsx:8`](<../../app/(protected)/meu-personagem/combate/page.tsx#L8>)

**Evidência e decisões**

- Testes cobrem simetria estrutural, conteúdo longo, fallback e contratos CSS.
  [`scene.test.cjs:113`](../../tests/card-demo/scene.test.cjs#L113)

- Decisão registra compactação como apresentação, sem alterar regras.
  [`decisions.md:82`](../planning-artifacts/card-demo/decisions.md#L82)
