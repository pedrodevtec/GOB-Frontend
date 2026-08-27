# Extração factual — UX visual do GOB-Frontend

Data: 2026-08-27
Escopo: `docs/Bravantus_Fundacao_Visual_v0.1.md`, PRD §8, `reconcile-ux-visual.md`, `app/globals.css`, `tailwind.config.ts` e componentes visuais/UI existentes.
Natureza: insumo de descoberta para o UX Design; não aprova novos tokens nem substitui o PRD.

## 1. Regra de precedência observada

1. O PRD final é a decisão de produto mais recente para o Piloto.
2. A Fundação Visual v0.1, de julho de 2026, é uma proposta para validação e fornece intenção, personalidade, semântica de marca e mínimos de forma/acessibilidade.
3. `reconcile-ux-visual.md` registra as tensões entre a fundação, as necessidades do piloto e o código.
4. O código demonstra o sistema herdado e o estado implementado; não transforma automaticamente escolhas locais em decisões aprovadas.

Consequência principal: **light-first é a direção oficial do Piloto**. A indicação `dark-first` da Fundação Visual não é mais a direção a decidir para esta fatia; permanece apenas como registro histórico de uma proposta anterior. O PRD também exclui azul da paleta principal.

## 2. Decisões recentes aplicáveis

### 2.1 Direção e personalidade

- O Piloto deve parecer um **RPG acessível e artesanal**, não um dashboard SaaS genérico nem uma interface sombria ilegível.
- A personalidade herdada e compatível com o PRD é: **heroica, acolhedora, artesanal, misteriosa e jogável**.
- A interface deve colocar personagem, narrativa, decisão e progressão no centro; a ficha é o núcleo emocional, não um formulário administrativo.
- Clareza vem antes de ornamento. Textura, contornos e referências medievais devem ser sutis e funcionais.
- O recorte inspirado em escudo fica reservado a ficha, marcos e decisões importantes.

### 2.2 Paleta e semântica

- Direção oficial: superfícies claras de **papel/marfim**, verde-sálvia/musgo, terracota e dourado envelhecido, com áreas de leitura limpas.
- Dourado comunica foco e recompensa.
- Verde comunica proteção e aprovação.
- Marrom sustenta estrutura, contorno e profundidade.
- Corrupção deve aparecer de maneira rara, localizada e legível.
- Cor nunca deve ser a única pista de IA, segredo, Corrupção, aprovação, erro ou seleção.
- Temas alternativos não podem mudar a semântica dos estados nem reduzir contraste.
- Azul não integra a paleta principal do Piloto.

### 2.3 Marca, imagens e movimento

- Usar a arte original da marca; não deformar, inclinar, recriar tipograficamente, recolorir fora de variantes aprovadas ou aplicar sobre fundo ruidoso.
- A Fundação prevê assinaturas principal, horizontal, favicon e avatar, mas o repositório inspecionado usa atualmente uma única imagem em `components/common/logo.tsx`.
- Pixel art e Guardiões podem comunicar progresso, carregamento e ação da IA.
- Movimento deve respeitar `prefers-reduced-motion`; o código já troca animações por estados estáticos ou remove animação nos componentes Guardião.
- Arte gerada não substitui marca, molduras ou ilustrações editoriais aprovadas.

### 2.4 Tipografia, forma e acessibilidade

- A Fundação propõe Cinzel 600/700 para títulos especiais e Inter 400–700 para interface e leitura longa.
- Mesmo na proposta, Cinzel não deve entrar em campos, botões pequenos, tabelas densas ou parágrafos; a logo não deve ser recriada com Cinzel.
- Grid de 4 px, borda padrão de 1 px, 2 px para ênfase e alvo interativo mínimo de 44 × 44 px são critérios documentados.
- A Fundação indica raio 6 para campos e 10 para cards; o código ainda não segue essa escala.
- Contraste mínimo documentado: 4,5:1 para texto normal e 3:1 para texto grande.

## 3. Hipóteses e pontos ainda não aprovados

| Tema | Estado factual |
|---|---|
| Cinzel + Inter | Candidata da Fundação Visual; `reconcile-ux-visual.md` a mantém como hipótese até validação. Não está implementada. |
| Tokens finais | Não há mapa canônico aprovado que traduza a paleta light-first do PRD em tokens completos de UI. Os hex abaixo são candidatos extraídos, não uma decisão nova. |
| Ornamentação e textura | Permitidas de forma contida, mas não existe biblioteca ornamental aprovada nem escala de intensidade por superfície. |
| Variantes digitais da marca | Necessidade prevista na Fundação; não foram encontradas especificações de clear space, tamanhos mínimos ou arquivos separados para horizontal/favicon/avatar. |
| Corrupção | A semântica de uso é definida, mas não há token ou componente canônico identificado no conjunto inspecionado. |
| Tema alternativo | O CSS possui `ocean`, `ember` e `verdant`, porém o PRD não aprova essas três opções para o Piloto. |
| Tipos de elevação | A intenção diferencia card e painel hero, mas o código combina vários shadows locais; não há escala canônica completa. |

## 4. Tokens candidatos extraídos

### 4.1 Cores de origem da marca documentadas

Estes valores vêm da Fundação Visual. O próprio documento diz que não devem ser copiados indiscriminadamente para todos os componentes.

| Token documentado | Hex | Papel documentado |
|---|---:|---|
| `brand.gold.300` | `#FFDD72` | família de dourado |
| `brand.gold.500` | `#F7C43F` | família de dourado |
| `brand.gold.700` | `#C47A13` | família de dourado |
| `brand.forest.500` | `#00742E` | família de verde |
| `brand.forest.700` | `#005D25` | família de verde |
| `brand.forest.900` | `#014A1E` | família de verde |
| `brand.brown.900` | `#3D1C15` | contorno/profundidade |
| `brand.shield.dark` | `#3F3627` | cor escura do escudo |

### 4.2 Tokens semânticos existentes em `app/globals.css`

Os hex são conversões aproximadas dos HSL declarados, incluídas apenas para comparação visual.

| Token CSS atual | HSL | Hex aproximado | Leitura do estado atual |
|---|---:|---:|---|
| `--background` | `42 42% 96%` | `#F9F7F1` | marfim claro |
| `--foreground` | `34 24% 17%` | `#362D21` | marrom escuro |
| `--card` | `42 55% 98%` | `#FDFBF7` | papel quase branco |
| `--popover` | `42 55% 99%` | `#FEFDFB` | papel quase branco |
| `--primary` | `18 86% 58%` | `#F06F38` | laranja/terracota saturado |
| `--primary-foreground` | `36 70% 98%` | `#FDFBF6` | texto claro sobre primário |
| `--secondary` | `43 34% 91%` | `#F0EBE0` | bege claro |
| `--secondary-foreground` | `34 24% 22%` | `#463A2B` | marrom |
| `--muted` | `40 26% 91%` | `#EEEAE2` | bege neutro |
| `--muted-foreground` | `35 12% 42%` | `#786D5E` | marrom acinzentado |
| `--accent` | `92 16% 48%` | `#798E67` | oliva/sálvia |
| `--accent-foreground` | `40 50% 98%` | `#FCFBF7` | texto claro sobre accent |
| `--destructive` | `2 65% 49%` | `#CE312C` | vermelho de erro/ação destrutiva |
| `--border`, `--input` | `36 26% 79%` | `#D7CCBC` | borda bege |
| `--ring` | `18 86% 58%` | `#F06F38` | foco acompanha o primário atual |
| `--success` | `142 35% 38%` | `#3F8358` | verde de sucesso |
| `--warning` | `34 74% 49%` | `#D98920` | âmbar de alerta |

### 4.3 Candidatos recorrentes já usados no frontend light-first

Esses valores são recorrentes no código e se aproximam mais da direção recente do PRD. Ainda são valores locais, não tokens canônicos aprovados.

| Papel candidato | Hex recorrente | Evidência de uso |
|---|---:|---|
| canvas/papel base | `#F7F2E8`, `#F3EFE5`, `#FBF8F1` | shells, landing e gradientes globais |
| superfície elevada | `#FFFAF2`, `#FFFAF0`, `#FFFDF8` | cards, dialog, sidebars, loaders e builder |
| texto principal | `#2D281F`, `#3B3428` | títulos e labels narrativos |
| texto secundário | `#625B50`, `#706657` | descrições e apoio |
| borda artesanal | `#B99B61`, `#CFC1A7`, `#D8C9AD` | painéis, seletores e cartões |
| dourado envelhecido | `#C8A96E` | progresso, Story e realces visuais |
| dourado de ação/foco local | `#B17B2B`, `#8A6427`, `#9A6B25` | seleção, foco, labels e percentuais |
| sálvia/musgo | `#77836E`, `#637153` | progresso e confirmação textual |
| terracota local | `#B76548` | uso pontual; o primário global atual é mais laranja (`#F06F38`) |

### 4.4 Espaçamento, forma, sombra e tipografia implementados

- Tailwind fornece a escala padrão de espaçamento; a Fundação pede alinhamento ao grid de 4 px, mas não existe alias semântico próprio.
- `Button` usa altura 44 px no padrão, 48 px no `lg`, 36 px no `sm` e 40 px no `icon`.
- `Input` usa altura 44 px; `Textarea` usa altura mínima de 112 px.
- Primitivos usam predominantemente `rounded-xl` (16 px), `rounded-2xl` (24 px), além de `1.75rem` (28 px) e `2rem` (32 px) em shells/heroes.
- `tailwind.config.ts` redefine `xl` como 16 px e `2xl` como 24 px; isso diverge dos raios 6/10 propostos pela Fundação.
- Sombra semântica `panel`: `0 24px 70px rgba(78, 63, 39, 0.12)`.
- `.glass-panel`: borda, fundo translúcido, blur e `0 18px 50px rgba(78, 63, 39, 0.08)`.
- Fonte `body` atual: `Trebuchet MS`, fallback `Segoe UI`, sans-serif.
- Fonte `display` atual: Cambria, fallback Georgia, serif.

## 5. Sistema e componentes herdados

### 5.1 Infraestrutura visual

- Tailwind CSS com cores semânticas ligadas a CSS custom properties.
- Primitivos em React com `class-variance-authority` para variantes (`Button`, `Badge`).
- Radix UI em `Dialog` e `Slot`, preservando uma base acessível para composição.
- `cn` centraliza combinação de classes.
- Ícones Lucide são usados em navegação, ações, status e dialog.
- O sistema é parcialmente tokenizado: cores base estão em CSS variables, mas muitas superfícies do MVP usam hex e sombras diretamente nos componentes.

### 5.2 Primitivos reaproveitáveis existentes

| Componente | Herança visual e funcional |
|---|---|
| `Button` | variantes default, secondary, outline, ghost e destructive; tamanhos sm/default/lg/icon; focus ring ligado a `--ring` |
| `Card`, `CardTitle`, `CardDescription` | painel translúcido com textura radial sutil, sombra `panel` e display type |
| `Badge` | variantes default, secondary, success, warning e destructive; texto uppercase em pill |
| `Input`, `Textarea` | superfícies brancas translúcidas, borda semântica, sombra interna e foco no primário |
| `Dialog` | overlay escuro translúcido, blur, card marfim e primitivos Radix; botão fechar visualmente pequeno |
| `Logo` | imagem oficial dentro de tile marfim; nome em `font-display`; subtítulo legado “Game Dashboard” |

### 5.3 Shells e padrões de composição

| Componente/padrão | Herança visual |
|---|---|
| `AppShell` | canvas light-first com gradiente marfim; estrutura separada para sidebar, topbar e conteúdo |
| `Sidebar` / `MobileNavigation` | glass panels claros; seleção com `primary`; navegação reduzida já implementada |
| `Topbar` | painel claro, modo Participante/Admin e alternância explícita de visão |
| `MvpFlowShell` | fundo papel, radiais dourado/sálvia, título narrativo, conteúdo principal e aside sticky |
| `AuthExperienceShell` | ilustração editorial de ruínas, overlay claro, painel de formulário e três notas da jornada |
| heroes de jornada/ficha | ilustrações `journey-chronicle.webp` e `character-archive.webp`, superfícies marfim e títulos display |
| Builder | ilustração `builder-path.webp`, pergunta em painel editorial e progresso local |

### 5.4 Componentes Guardião/pixel art

- `PixelGuardian` possui variantes `sword`, `punch` e `scout`, com WebP animado e PNG estático para movimento reduzido.
- `GuardianAvatarSelector` deixa explícito que a escolha é somente visual e não altera classe, ficha, atributos ou sugestões.
- `GuardianProgressTrack` suporta progresso determinado e indeterminado, estados ARIA e Guardião em ação.
- `GuardianAiLoader` só aparece após 400 ms e apresenta a IA como preparação de sugestão; usa o Guardião como companhia visual.
- `GuardianPageLoader` comunica carregamento geral com texto, trilha e Guardião em movimento.
- Animações existentes: bob de corrida, carga/ataque de IA, descoberta/celebração, erro, energia cruzando a barra e viagem de página.
- `prefers-reduced-motion: reduce` remove animações/transições e posiciona os elementos em um estado estático compreensível.

## 6. Divergências e dívidas visuais atuais

### 6.1 Direção histórica versus decisão atual

- Fundação: superfícies `dark-first` como regra crítica/proposta.
- PRD final: **light-first oficial para o Piloto** e rejeição de interface sombria ilegível.
- Código: já é light-first. Portanto, migrar para dark-first contrariaria a decisão recente.

### 6.2 Paleta e tokens

- As cores de origem da marca (`brand.gold`, `brand.forest`, `brand.brown`) não estão registradas como tokens canônicos no Tailwind/CSS atual.
- O frontend combina HSL semântico com muitos hex locais. A repetição de `#2D281F`, `#B99B61`, `#FFFDF8`, `#9A6B25`, `#C8A96E` e outros revela uma paleta emergente, mas duplicada e sem contrato.
- `--primary` atual é laranja vivo aproximado `#F06F38`; o PRD pede terracota/dourado envelhecido como linguagem principal. É necessário validar se o primário deve continuar tão saturado.
- `--ring` herda o laranja do primário; a reconciliação pede foco dourado visível.
- Os temas `ocean`, `ember` e `verdant` alteram primário/accent/ring. `ocean` introduz azul como primário, em tensão direta com o PRD.

### 6.3 Tipografia e marca

- A implementação usa Trebuchet/Segoe UI no corpo e Cambria/Georgia em display, não Cinzel/Inter.
- Cinzel + Inter continua candidata, não uma migração já aprovada.
- `Logo` exibe “Game Dashboard”, em conflito com “RPG antes de dashboard” e com o tom recente.
- O nome da variável importada `darkBrandLogo` não comprova que exista um tema dark; é apenas nomenclatura de código.

### 6.4 Forma, toque e acessibilidade

- A escala de raio implementada (16–32 px) é muito maior que os 6/10 px propostos na Fundação.
- `Button sm` tem 36 px e `Button icon` 40 px, abaixo do mínimo documentado de 44 × 44 px.
- O botão de fechar do Dialog usa `p-1` com ícone 16 px e não declara foco visível próprio.
- Inputs e Textareas usam foco no `primary`, enquanto Buttons usam `ring`; não há uma única regra de foco aplicada a todos os primitivos.
- O código contém suporte positivo a movimento reduzido e semântica ARIA em loaders/progressos, mas isso não substitui validação de contraste, zoom, teclado e leitor de tela.

### 6.5 Consistência de componentes

- `Card` padroniza glass + section grid, mas muitos fluxos constroem painéis equivalentes com classes locais, raios e sombras diferentes.
- Status usam tanto tokens (`success`, `warning`, `destructive`) quanto classes Tailwind locais (`emerald`, `amber`, `rose`).
- A Fundação pede ornamento funcional; o sistema atual usa radiais, blur, sombras e bordas artesanais de forma recorrente, porém sem níveis documentados por contexto.
- O Guardião já serve como linguagem de progresso/IA, mas o texto deve continuar deixando claro que é ajuda criativa, não uma entidade que decide.

## 7. Base segura para continuidade do UX

Pode ser herdado sem rediscutir a tese do produto:

- light-first com papel/marfim e leitura limpa;
- semântica dourado = foco/recompensa, verde = proteção/aprovação, marrom = estrutura;
- clareza antes de ornamento;
- personagem e jornada no centro;
- marca original protegida;
- shells separados para Participante e Admin;
- primitivos existentes de Button/Card/Badge/Input/Textarea/Dialog como base técnica;
- Guardiões em pixel art para progresso e IA, com fallback de movimento reduzido;
- ilustrações editoriais existentes para landing, autenticação, Minha Jornada, Builder e Meu Personagem.

Exige decisão ou consolidação no próximo artefato de UX:

- mapa final de tokens da paleta light-first;
- escolha tipográfica definitiva;
- escala final de raios e elevação;
- token único de foco e ajuste dos alvos menores que 44 px;
- destino dos temas `ocean`/`ember`/`verdant` no Piloto;
- remoção/substituição de “Game Dashboard”;
- componentes/semântica visual específicos de segredo e Corrupção;
- variantes digitais aprovadas da marca;
- conversão dos hex recorrentes em tokens e redução das construções locais duplicadas.

## 8. Arquivos de evidência visual inspecionados

- `docs/Bravantus_Fundacao_Visual_v0.1.md`
- `_bmad-output/planning-artifacts/prds/prd-GOB-Frontend-2026-08-27/prd.md` (§8)
- `_bmad-output/planning-artifacts/prds/prd-GOB-Frontend-2026-08-27/reconcile-ux-visual.md`
- `app/globals.css`
- `tailwind.config.ts`
- `components/common/logo.tsx`
- `components/ui/button.tsx`
- `components/ui/card.tsx`
- `components/ui/badge.tsx`
- `components/ui/input.tsx`
- `components/ui/textarea.tsx`
- `components/ui/dialog.tsx`
- `components/layout/app-shell.tsx`
- `components/layout/sidebar.tsx`
- `components/layout/topbar.tsx`
- `components/layout/mvp-flow-shell.tsx`
- `components/auth/auth-experience-shell.tsx`
- `components/visual/guardian-ai-loader.tsx`
- `components/visual/guardian-page-loader.tsx`
- `components/visual/guardian-progress-track.tsx`
- `components/visual/pixel-guardian.tsx`
- `components/visual/guardian-avatar-selector.tsx`
- `components/visual/selected-pixel-guardian.tsx`
