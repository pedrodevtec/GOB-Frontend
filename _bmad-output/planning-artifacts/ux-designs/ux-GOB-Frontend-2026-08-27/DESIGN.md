---
name: Guardian of Bravantus — Pilot v1
description: Sistema visual light-first da jornada guiada de criação, revisão e apresentação de personagem.
status: final
sources:
  - ../../prds/prd-GOB-Frontend-2026-08-27/prd.md
  - ../../prds/prd-GOB-Frontend-2026-08-27/addendum.md
colors:
  canvas: '#F7F2E8'
  paper: '#FFFAF2'
  ink: '#2F291F'
  muted: '#665D50'
  action: '#8F4933'
  on-action: '#FFF8ED'
  focus: '#8A6427'
  gold: '#C8A96E'
  forest: '#3F684B'
  sage: '#77836E'
  terracotta: '#B86F52'
  error: '#A33F36'
  warning: '#8B5A20'
  border: '#CFC1A8'
typography:
  display:
    fontFamily: 'Cinzel, Cambria, Georgia, serif'
    fontSize: 36px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: '-0.01em'
  display-mobile:
    fontFamily: 'Cinzel, Cambria, Georgia, serif'
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.25'
  heading:
    fontFamily: 'Inter, Segoe UI, Arial, sans-serif'
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  body:
    fontFamily: 'Inter, Segoe UI, Arial, sans-serif'
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label:
    fontFamily: 'Inter, Segoe UI, Arial, sans-serif'
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
  meta:
    fontFamily: 'Inter, Segoe UI, Arial, sans-serif'
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 6px
  md: 10px
  lg: 16px
  full: 9999px
spacing:
  '1': 4px
  '2': 8px
  '3': 12px
  '4': 16px
  '5': 20px
  '6': 24px
  '8': 32px
  '10': 40px
  '12': 48px
  '16': 64px
  margin-mobile: 16px
  margin-desktop: 32px
  reading-width: 720px
  content-width: 1200px
components:
  primary-action:
    background: '{colors.action}'
    foreground: '{colors.on-action}'
    radius: '{rounded.sm}'
    minHeight: 44px
    focusRing: '{colors.focus}'
  editorial-panel:
    background: '{colors.paper}'
    foreground: '{colors.ink}'
    border: '{colors.border}'
    radius: '{rounded.md}'
  narrative-field:
    background: '{colors.paper}'
    foreground: '{colors.ink}'
    border: '{colors.border}'
    radius: '{rounded.sm}'
    minHeight: 44px
    focusRing: '{colors.focus}'
  journey-navigation:
    current: '{colors.action}'
    complete: '{colors.forest}'
    pending: '{colors.muted}'
    reward: '{colors.gold}'
  ai-assistance:
    background: '{colors.paper}'
    foreground: '{colors.ink}'
    accent: '{colors.sage}'
    border: '{colors.border}'
    radius: '{rounded.md}'
  canonical-sheet:
    background: '{colors.paper}'
    foreground: '{colors.ink}'
    border: '{colors.border}'
    radius: '{rounded.md}'
  status-indicator:
    neutral: '{colors.muted}'
    success: '{colors.forest}'
    warning: '{colors.warning}'
    error: '{colors.error}'
  guardian-progress:
    track: '{colors.border}'
    progress: '{colors.forest}'
    reward: '{colors.gold}'
  confirmation-dialog:
    background: '{colors.paper}'
    foreground: '{colors.ink}'
    border: '{colors.border}'
    radius: '{rounded.lg}'
  personal-artifact:
    background: '{colors.paper}'
    foreground: '{colors.ink}'
    border: '{colors.gold}'
    radius: '{rounded.md}'
updated: 2026-08-27
---

# Guardian of Bravantus — Design Spine

## Brand & Style

Guardian of Bravantus deve parecer um RPG acessível e artesanal antes de parecer um sistema. O Personagem é o centro emocional; narrativa, decisão e progressão vêm antes de mecânicas, indicadores e operação. A postura é heroica, acolhedora, misteriosa e jogável, sem transformar a experiência em fantasia sombria ilegível ou dashboard SaaS genérico.

A direção é light-first. Superfícies lembram papel preservado, tinta envelhecida e couro claro, com ornamentação fina nas bordas e áreas centrais limpas. Ilustrações editoriais se concentram nas bordas ou em uma lateral para preservar a zona de leitura. Referências ao escudo aparecem somente na Ficha, em marcos e em decisões importantes.

Chibis e pixel art acompanham progresso, carregamento e ações da IA. Movimento é decorativo e dispensável: o significado permanece completo quando a animação é removida. Arte gerada pelo participante é pessoal e não substitui marca, molduras ou ilustrações editoriais aprovadas.

## Colors

- **Canvas `{colors.canvas}`** é o fundo geral. O tom marfim reduz a aparência clínica e sustenta áreas extensas.
- **Paper `{colors.paper}`** recebe conteúdo, formulários, leitura e decisões. Deve permanecer quase uniforme; textura nunca fica atrás de texto de leitura longa.
- **Ink `{colors.ink}`** é texto principal, ícones essenciais e contorno de alta importância.
- **Muted `{colors.muted}`** é texto secundário, metadado e explicação. Não use um tom mais claro que `{colors.muted}` nesses conteúdos.
- **Action `{colors.action}`** identifica ação primária. É terracota escura o bastante para sustentar texto claro.
- **Focus `{colors.focus}`** é o dourado escurecido reservado ao anel de foco. Ele mantém a linguagem da Fundação Visual sem usar `{colors.gold}`, claro demais para funcionar como contorno essencial sobre marfim.
- **Gold `{colors.gold}`** comunica foco narrativo, marco e recompensa. Não é cor de texto pequeno sobre papel; quando usado como preenchimento, deve receber texto em `{colors.ink}`.
- **Forest `{colors.forest}`** comunica proteção, confirmação e aprovação humana, sempre acompanhado por texto ou ícone.
- **Sage `{colors.sage}`** apoia progresso e presença discreta da IA. Não substitui `{colors.ink}` em texto comum.
- **Terracotta `{colors.terracotta}`** é acento editorial e calor humano. Não é cor de texto pequeno sobre papel.
- **Error `{colors.error}`** e **Warning `{colors.warning}`** são semânticos, nunca ornamentais. Ambos exigem mensagem textual e, quando útil, ícone.
- **Border `{colors.border}`** separa superfícies sem virar pista única de estado; seu baixo contraste é intencional e precisa de forma, espaço ou texto como reforço.

### Contraste verificado

Valores calculados em sRGB.

| Foreground | Background | Razão | Uso |
|---|---|---:|---|
| `{colors.ink}` | `{colors.canvas}` | 12,91:1 | Texto comum permitido. |
| `{colors.ink}` | `{colors.paper}` | 13,86:1 | Texto comum permitido. |
| `{colors.muted}` | `{colors.canvas}` | 5,80:1 | Texto comum permitido. |
| `{colors.muted}` | `{colors.paper}` | 6,22:1 | Texto comum permitido. |
| `{colors.on-action}` | `{colors.action}` | 6,28:1 | Texto de ação permitido. |
| `{colors.paper}` | `{colors.forest}` | 6,14:1 | Texto de aprovação permitido. |
| `{colors.paper}` | `{colors.error}` | 6,08:1 | Texto de erro permitido. |
| `{colors.paper}` | `{colors.warning}` | 5,64:1 | Texto de alerta permitido. |
| `{colors.ink}` | `{colors.gold}` | 6,42:1 | Texto sobre marco/recompensa permitido. |
| `{colors.focus}` | `{colors.canvas}` | 4,79:1 | Anel de foco permitido. |
| `{colors.paper}` | `{colors.terracotta}` | 3,72:1 | Não usar em texto comum. |
| `{colors.ink}` | `{colors.sage}` | 3,61:1 | Não usar em texto comum. |
| `{colors.border}` | `{colors.canvas}` | 1,59:1 | Não comunica foco, seleção ou estado sozinho. |

Azul não integra a paleta principal. Temas herdados que mudem a semântica de ação, estado ou contraste não fazem parte do Piloto.

## Typography

Cinzel 600/700 é a fonte dos títulos narrativos especiais, e Inter 400–700 atende à interface e à leitura longa. Os fallbacks são parte do contrato: Cambria/Georgia preservam a função editorial; Segoe UI/Arial preservam legibilidade funcional.

O papel serifado é raro: abertura de jornada, nome do Personagem, Ficha e marco de conclusão. Campos, botões pequenos, tabelas densas, mensagens, instruções e parágrafos usam a família de interface. A logo nunca é recriada com texto tipográfico.

Títulos devem quebrar em múltiplas linhas sem truncamento. Texto corrido usa `{typography.body}` e largura de leitura limitada por `{spacing.reading-width}`. Caixa alta fica restrita a metadados muito curtos; não é usada em instruções, estado ou ação.

## Layout & Spacing

A base é um grid de 4 px. O conteúdo responsivo usa margem mínima `{spacing.margin-mobile}`, cresce para `{spacing.margin-desktop}` e respeita `{spacing.content-width}`. Leitura narrativa e formulários longos ficam em uma coluna de até `{spacing.reading-width}`; operação administrativa pode usar maior largura quando comparação e tabela exigirem.

No Participante, uma decisão compreensível ocupa o foco principal de cada tela. Ornamento e ilustração vivem nas bordas, no topo ou em uma lateral; nunca dividem atenção com campo ativo, erro ou ação principal. No desktop, apoio e progresso podem ocupar uma segunda coluna. No mobile, tudo retorna à ordem de leitura e nenhuma ação depende da lateral existir.

Espaçamento pequeno agrupa rótulo, campo, ajuda e erro. Espaçamento médio separa blocos da mesma decisão. Espaçamento grande separa capítulos, estados e mudanças de contexto. Barras fixas respeitam safe areas e não cobrem conteúdo nem teclado virtual.

## Elevation & Depth

Profundidade vem primeiro de camadas tonais: `{colors.canvas}` abaixo de `{colors.paper}`. Bordas de 1 px delimitam conteúdo; 2 px ficam reservados a foco ou ênfase. Sombras são ambientais, marrons e de baixa opacidade, compatíveis com `0 18px 50px rgba(78, 63, 39, 0.08)` em superfícies importantes e `0 24px 70px rgba(78, 63, 39, 0.12)` em painéis de destaque.

Blur e transparência nunca reduzem contraste. A hierarquia não depende de sombra; funciona com cor sólida, borda, tipografia e espaço. Não há empilhamento visual de mais de um modal.

## Shapes

Campos e ações usam `{rounded.sm}`; painéis e Ficha usam `{rounded.md}`; diálogos podem usar `{rounded.lg}`. O sistema evita os raios inflados de 24–32 px observados no legado e também evita excesso de pílulas, que aproxima a experiência de um aplicativo genérico.

Círculos ficam reservados a retrato/avatar e indicadores que tenham essa geometria por natureza. Recortes inspirados em escudo pertencem somente a marcos, Ficha e decisões importantes. Imagens acompanham o raio do contêiner.

## Components

| Componente | Anatomia e contrato visual | Estados |
|---|---|---|
| Primary action | Preenchimento `{colors.action}`, texto `{colors.on-action}`, raio `{rounded.sm}`, altura mínima de 44 px e padding horizontal generoso. Uma ação dominante por região. | Foco com contorno de 2 px em `{colors.focus}` e offset sobre o canvas; processamento mantém contraste e troca o rótulo; desabilitado conserva legibilidade e não usa apenas opacidade extrema. |
| Editorial panel | Superfície `{colors.paper}`, texto `{colors.ink}`, borda de 1 px `{colors.border}` e raio `{rounded.md}`. Textura apenas periférica. | Seleção usa borda de 2 px e texto/ícone; erro ou sucesso não troca a superfície inteira. |
| Narrative field | Superfície `{colors.paper}`, texto `{colors.ink}`, borda `{colors.border}`, raio `{rounded.sm}`, altura mínima de 44 px; rótulo acima e ajuda/erro abaixo. | Foco visível de 2 px em `{colors.focus}`; erro usa `{colors.error}` com mensagem; somente leitura mantém contraste e explica o motivo. |
| Journey navigation | Sequência de etapas com rótulo textual, estado e posição; atual em `{colors.action}`, concluída em `{colors.forest}`, futura em `{colors.muted}` e marco em `{colors.gold}` com `{colors.ink}`. | Atual, concluída, pendente e bloqueada nunca dependem só de cor; no mobile preserva a etapa atual e o contexto sem virar menu lateral. |
| AI assistance | Área secundária em `{colors.paper}`, borda `{colors.border}` e acento `{colors.sage}`; rótulo explícito de ajuda opcional. Pixel art pode acompanhar espera sem ocupar a zona de leitura. | Gerando, proposta, aplicada localmente, descartada e erro têm texto próprio; nenhuma aparência sugere que gerar equivale a salvar. |
| Canonical sheet | Página clara em `{colors.paper}`, texto `{colors.ink}`, borda `{colors.border}`, raio `{rounded.md}` e divisões ornamentais finas; retrato tem moldura circular reservada. | Editável ou somente leitura é explicado em texto; faltantes aparecem próximos ao bloco e em resumo navegável. |
| Status indicator | Rótulo curto com texto e ícone; neutro `{colors.muted}`, sucesso `{colors.forest}`, alerta `{colors.warning}` e erro `{colors.error}`. | Loading, vazio, bloqueio, somente leitura, aprovação e falha mantêm vocabulário humano; não exibem enums. |
| Guardian progress | Trilha `{colors.border}`, progresso `{colors.forest}` e marco `{colors.gold}`; personagem pixelado é decorativo e possui equivalente estático. | Determinado e indeterminado são distinguíveis por texto; com movimento reduzido, a ilustração fica estática, e o percentual e a ação permanecem visíveis. |
| Confirmation dialog | Superfície `{colors.paper}`, texto `{colors.ink}`, borda `{colors.border}`, raio `{rounded.lg}`; título, consequência, ação segura e ação confirmatória. | A ação destrutiva usa `{colors.error}`; foco inicia no controle seguro quando a consequência é irreversível; fechar tem alvo mínimo de 44 px. |
| Personal artifact | Moldura contida em `{colors.paper}` com borda `{colors.gold}`, identificação textual e área de prévia sem sobreposição. | Disponível, gerando, existente, limite esgotado e erro são explícitos; sempre identifica arte pessoal gerada por IA e nunca arte oficial ou Cânone. |

Referências de composição: [Minha Jornada](mockups/key-minha-jornada.html) demonstra hierarquia, progresso e artefatos; o [Builder](mockups/key-builder.html) demonstra campo narrativo e ajuda opcional; a [Revisão Admin](mockups/key-revisao-admin.html) demonstra Ficha canônica e decisão humana; e a [Conclusão](mockups/key-conclusao.html) demonstra a separação entre participação, revisão e geração visual. Os spines vencem em qualquer conflito com os mockups.

## Do's and Don'ts

| Do | Don't |
|---|---|
| Tratar o Personagem e sua história como foco visual. | Fazer a experiência parecer um painel administrativo ou formulário técnico. |
| Preservar centro limpo e ilustração nas bordas/laterais. | Colocar texto de leitura sobre mapa, ruína, textura ou cenário. |
| Usar dourado para foco, marco e recompensa, sempre com contraste adequado. | Usar dourado como texto pequeno ou decoração espalhada. |
| Usar texto e ícone junto da cor para estados. | Codificar IA, erro, aprovação, segredo ou seleção somente pela paleta. |
| Usar a arte original da marca e variantes aprovadas. | Deformar, inclinar, recolorir ou recriar a marca com fonte. |
| Manter movimento opcional e substituível por estado estático. | Fazer animação carregar significado, bloquear ação ou competir com leitura. |
| Usar uma coluna de leitura e decisões progressivas. | Reintroduzir menus legados, cards excessivos ou várias decisões concorrentes. |
| Aplicar `{colors.focus}` ao foco interativo visível. | Usar `{colors.border}` ou `{colors.gold}` sozinhos como foco. |
| Identificar imagens geradas como arte pessoal e não canônica. | Misturar arte gerada com ilustração editorial oficial ou Cânone. |
