# Reconciliação de UX e Fundação Visual — GOB Frontend

Data da análise: 2026-08-27
Escopo: requisitos de UX, tom, identidade visual, IA assistiva, navegação reduzida, acessibilidade, compartilhamento, PDF/carta e problemas observados.
Natureza: insumo para o PRD; este arquivo não altera nem substitui `prd.md`.

## 1. Fontes e regra de precedência

Esta reconciliação confronta:

1. `docs/Bravantus_Fundacao_Visual_v0.1.md`, fonte da intenção visual e dos mínimos de acessibilidade;
2. `docs/playtest-status-2026-08-14.md`, fonte do escopo funcional declarado e do nível de validação;
3. `docs/mvp-pilot-flow-critical-analysis.md`, fonte dos riscos já identificados;
4. código atual em `app/`, `components/`, `features/mvp/` e `lib/`, fonte da evidência implementada.

Quando há conflito, regra de produto e privacidade prevalecem sobre a aparência já implementada. O estado do código é evidência, não aprovação automática de uma decisão de design. A Fundação Visual também distingue decisões de hipóteses: paleta semântica, Cinzel + Inter, dark-first, linguagem da Corrupção, ornamentos e textura ainda precisam de validação com o Product Owner.

## 2. Síntese executiva

| Tema | Intenção reconciliada | Evidência atual | Situação para o PRD |
|---|---|---|---|
| UX principal | RPG antes de dashboard; personagem e decisão no centro; jornada progressiva e retomável | Fluxo público/autenticado, builder narrativo em quatro etapas, ficha, revisão, pesquisa e conclusão | Incorporar como requisito obrigatório |
| Tom | Fantasia heroica acolhedora, clara, calma na preparação e responsável nas decisões | Microcopy majoritariamente acolhedora e orientada; há textos sem acentuação e vocabulário de dashboard | Adequação parcial; requer revisão editorial |
| Identidade visual | Robusta, artesanal, misteriosa e jogável; dourado seletivo, verde de proteção/aprovação, Corrupção localizada | UI light-first em creme, primário terracota/laranja, fontes de sistema e logo oficial em imagem | Divergência material; decisão visual precisa ser fechada antes da expansão |
| IA assistiva | Opcional, identificada, explicável e subordinada ao jogador e ao Mestre | Sugestões por campo/bloco, origem/racional, aplicar/editar/descartar, edição manual e fallback | Boa base; nomenclatura, consentimento e estados de falha precisam ser endurecidos |
| Navegação | Participante vê somente Minha Jornada, Meu Personagem quando existir e Perfil; Admin/Mestre usa shell próprio | Menus reduzidos implementados; rotas futuras permanecem no código, fora dos menus e CTAs | Atendido no shell; proteger contra regressão |
| Acessibilidade | WCAG AA mínimo, foco visível, 44 × 44, cor + texto/ícone, zoom 200%, movimento reduzido | Há semântica de status/progresso, foco em vários controles e `prefers-reduced-motion`; contraste e tamanho são inconsistentes e não há suíte de a11y | Parcial, sem validação suficiente |
| Compartilhamento | Conteúdo público somente quando autorizado; rascunhos privados; jogador controla a publicação | Perfil público de personagem aprovado, Web Share/cópia de link e Story com confirmação | Falta evidência de opt-in de perfil e de controle por vínculo/campo |
| PDF e carta | Ficha consultável/exportável; carta visual persistida e controlada pelo usuário | PDF A4 local; retrato/carta e carta jogável; downloads; prévia do prompt | Implementado tecnicamente, mas E2E real e política de versão/privacidade seguem pendentes |

## 3. Requisitos de experiência e tom

### 3.1 Experiência principal

- **UX-01 — Personagem no centro.** Cada tela do piloto deve reforçar personagem, narrativa, decisão ou progressão. A ficha é o núcleo emocional, não um formulário administrativo genérico.
- **UX-02 — Narrativa antes da mecânica.** A jornada deve apresentar primeiro a pessoa atual, sua origem, desejos, vínculos e Marca; arquétipo, atributos, treinamentos e equipamentos vêm depois. Alma/Legado não pode parecer classe rígida nem apagar a identidade anterior à Marca.
- **UX-03 — Progressão guiada e retomável.** A interface deve mostrar etapa atual, próximo passo, bloqueios e progresso persistido, e retomar pela verdade retornada pelo backend.
- **UX-04 — Uma decisão compreensível por vez.** Preparação deve ser quente, guiada e calma, com ação principal evidente, instruções curtas e informação avançada em camadas.
- **UX-05 — Participante e operação separados.** O participante não deve receber navegação, linguagem ou métricas administrativas. Admin/Mestre deve ter shell e tarefas próprios; `ADMIN` não implica `MASTER`.
- **UX-06 — Ficha canônica.** Revisão, Meu Personagem, conclusão e exportação devem usar a mesma representação canônica, com nomes legíveis ao jogador e sem payloads, enums ou chaves internas.
- **UX-07 — Estados seguros.** Loading, vazio, erro, sessão expirada, campanha encerrada, bloqueio, submissão, ajustes e aprovação devem explicar o que aconteceu, preservar o trabalho e oferecer somente ações válidas.

### 3.2 Tom e microcopy

- **TON-01 — Voz.** Usar português brasileiro acolhedor, heroico e direto. Falar com “você”; preferir verbos de ação e consequências claras; evitar tom de painel corporativo, cassino, propaganda ou autoridade absoluta.
- **TON-02 — Autonomia explícita.** Repetir apenas nos momentos decisivos que o jogador cria/confirma, a IA orienta e o Mestre aprova. Não antropomorfizar a IA como árbitro ou fonte de verdade.
- **TON-03 — Consistência editorial.** Todo texto visível deve ter acentuação e caracteres corretos. Termos do produto devem ter glossário único: Guardião, Marca, Mestre, ficha, jornada, ajuda criativa/IA, arquétipo, atributos, treinamentos, carta e aprovação.

O código já demonstra um bom padrão em frases como “Conte sua ideia com liberdade e confirme cada escolha antes de continuar” e “Você pode continuar normalmente”. Porém, há dezenas de textos sem acentos (`voce`, `historia`, `revisao`, `opcao`, `Guardiao`) em componentes centrais, e a logo inclui o subtítulo “Game Dashboard”, em conflito com “RPG antes de dashboard”.

## 4. Identidade e sistema visual

### 4.1 Direção de marca

- **VIS-01 — Personalidade.** A interface deve ser heroica, acolhedora, artesanal, misteriosa e jogável. Clareza vem antes de ornamento.
- **VIS-02 — Marca oficial.** Usar a arte original do escudo/nome, sem recriar a marca com uma fonte, deformar, inclinar, recolorir livremente ou aplicar sobre fundo ruidoso. Preparar variantes digital, horizontal, principal, favicon e avatar com área livre.
- **VIS-03 — Hierarquia sem excesso medieval.** Formas robustas, contorno e textura sutil são permitidos; recorte inspirado no escudo fica reservado à ficha, marcos e decisões importantes.
- **VIS-04 — Semântica de cor.** Dourado indica foco/recompensa; verde, proteção/aprovação; marrom, contorno/profundidade. Corrupção deve ser rara, localizada e legível. Cor nunca pode ser a única pista.
- **VIS-05 — Contextos.** Preparação é quente/guiada/calma; episódio ativo realça estado da cena; IA é editável e identificada; segredo explicita acesso/origem; aprovação explicita responsável/estado e registra a decisão humana.
- **VIS-06 — Ritmo e forma.** Adotar grid de 4 px, raios previstos pela fundação (6 em campos, 10 em cards, com exceções justificadas), borda padrão de 1 px, 2 px para ênfase e alvo mínimo de 44 × 44 px.
- **VIS-07 — Tipografia candidata.** Cinzel 600/700 somente para títulos especiais, páginas e momentos narrativos; Inter 400–700 para interface, formulários, regras e textos longos. Não usar Cinzel em campos, botões pequenos, tabelas densas ou parágrafos. A combinação continua hipótese até validação.
- **VIS-08 — Temas e personalização.** Temas alternativos não podem mudar o significado de estados, reduzir contraste ou diluir a identidade de Bravantus.

### 4.2 Divergência atual que exige decisão

A Fundação Visual aponta superfícies dark-first como direção crítica, mas também lista dark-first entre as hipóteses a validar. O frontend atual é claramente light-first: creme/branco, foreground marrom, primário terracota e accent oliva. Também usa `Trebuchet MS`/`Segoe UI` e `Cambria`/`Georgia`, não Inter/Cinzel. Portanto, o PRD não deve declarar o tema atual como aprovado nem exigir uma migração dark-first sem checkpoint do Product Owner. Deve exigir uma decisão registrada e, depois dela, tokens únicos implementados e testados.

Os tokens de marca documentados (`#FFDD72`, `#F7C43F`, `#C47A13`, `#00742E`, `#005D25`, `#014A1E`, `#3D1C15`, `#3F3627`) não estão representados como sistema canônico no CSS atual; predominam HSL genérico e valores hexadecimais locais. Isso aumenta inconsistência, manutenção e risco de contraste.

## 5. IA assistiva e decisão humana

- **AI-01 — Opcionalidade real.** O fluxo manual deve continuar utilizável quando o jogador não quiser IA, quando o provedor falhar ou quando a sugestão for descartada.
- **AI-02 — Nunca decidir.** IA não escolhe Legado/Alma, arquétipo, história, vínculo, segredo, regra, item, aprovação ou consequência pelo jogador/Mestre.
- **AI-03 — Contexto permitido.** Usar somente conteúdo público e dados confirmados pelo próprio jogador. Segredo do Mestre, canon secreto, prompt integral de sistema, token e dados de outra pessoa nunca entram no assistente do jogador.
- **AI-04 — Rotulagem e proveniência.** Toda saída deve aparecer como sugestão/ideia da IA, com racional e, quando útil, campos em que se baseou; não deve parecer conteúdo já confirmado.
- **AI-05 — Ações humanas obrigatórias.** Cada sugestão narrativa oferece equivalentes claros a Aceitar, Editar e Descartar. Só Aceitar ou Editar pode inserir conteúdo na ficha; proposta mecânica deve exigir decisão explícita para todos os blocos antes de persistir.
- **AI-06 — Reversibilidade.** Após aplicar, permitir revisar e desfazer antes da submissão. Mudança de capítulo ou autosave não pode contornar confirmação pendente.
- **AI-07 — Limites de geração.** Fazer no máximo uma pergunta complementar quando faltar informação essencial; oferecer formulações, detectar lacunas/incoerências e explicar regras aprovadas, sem inventar cânone ou mecânica.
- **AI-08 — Falha segura.** Falha, timeout ou conflito de versão preserva rascunho, explica que a edição manual segue disponível e permite tentar novamente sem duplicar decisões.
- **AI-09 — Telemetria privada.** Analytics registra caso de uso, provedor, modelo, tokens, latência, resultado e custo, nunca narrativa completa, ficha, prompt integral ou segredo.

O builder atual evidencia boa parte desses requisitos: ajuda por campo e capítulo, preferência local, proposta mecânica por cinco blocos, “Aplicar”, “Editar antes de aplicar”, “Descartar”, “Desfazer”, racional e “Baseada em”. O autosave é bloqueado enquanto blocos mecânicos aguardam confirmação. Pontos a corrigir/decidir:

- a preferência “Receber ajuda ao continuar” nasce ativada; validar se opt-out é aceitável para o piloto ou se o consentimento deve ser opt-in;
- harmonizar “Aplicar”/“Usar e revisar”/“Não usar” com o trio canônico Aceitar/Editar/Descartar sem perder precisão;
- em falha ao registrar uma decisão de sugestão de campo, a UI informa que o texto aplicado foi mantido localmente; deve haver reconciliação visível do estado e retentativa, para evitar divergência entre conteúdo persistido e trilha de decisão;
- “Guardião está preparando” funciona como companhia visual, mas precisa continuar identificado como ajuda criativa, não como personagem que decide.

## 6. Navegação reduzida e arquitetura da jornada

- **NAV-01 — Menu do participante.** Exibir somente `Minha Jornada`, `Meu Personagem` quando houver personagem e `Perfil`.
- **NAV-02 — Menu administrativo.** Exibir Visão geral do piloto, Revisões, Participantes, Uso e custos de IA, Configurações do piloto e opção explícita de visualizar como participante.
- **NAV-03 — Módulos futuros ocultos.** Monstros, Bounties, Missões, Treinamentos, NPCs, Loja, PvP, rankings, trocas, recompensas, criação de mesa, entrada por código e demais áreas futuras podem continuar roteáveis por compatibilidade, mas não aparecem em menu ou CTA do piloto sem decisão explícita.
- **NAV-04 — Retorno e hidratação.** Login, cadastro e confirmação de e-mail preservam `returnTo`. Páginas públicas não exibem CTA de visitante antes de saber o estado da sessão; refresh, sessão expirada e acesso direto por URL devem levar à etapa correta sem flashes enganosos.

`lib/navigation.ts`, `Sidebar`, `MobileNavigation`, `AppShell` e `Topbar` atendem ao desenho reduzido. A implementação ainda depende de hidratação client-side e consulta de personagem para mostrar o segundo item; isso deve ter estado neutro e teste de regressão. As rotas legadas continuam presentes, conforme esperado.

## 7. Acessibilidade

- **A11Y-01 — Contraste.** Atender WCAG AA: mínimo 4,5:1 para texto normal e 3:1 para texto grande e elementos gráficos essenciais.
- **A11Y-02 — Foco.** Todo elemento interativo deve ter anel de foco dourado, claramente visível sobre qualquer superfície, e ordem de tabulação coerente.
- **A11Y-03 — Alvo.** Controles acionáveis devem ter no mínimo 44 × 44 CSS px, inclusive ícones, botões pequenos, opções, fechar modal e navegação móvel.
- **A11Y-04 — Semântica além da cor.** IA, segredo, Corrupção, aprovação, erro, sucesso, bloqueio e seleção devem combinar texto e/ou ícone com a cor. Estados não podem depender apenas de tonalidade.
- **A11Y-05 — Zoom e responsividade.** Em zoom de 200%, conteúdo e controles não podem se sobrepor, desaparecer ou exigir rolagem em duas dimensões para leitura comum.
- **A11Y-06 — Movimento reduzido.** Respeitar `prefers-reduced-motion` em animações, transições e deslocamentos programáticos; o estado deve continuar compreensível sem movimento.
- **A11Y-07 — Formulários.** Campos precisam de rótulo programático, erro associado por `aria-describedby`, instrução não dependente de placeholder e foco levado ao primeiro erro após validação.
- **A11Y-08 — Validação verificável.** Adicionar checagem automatizada (axe ou equivalente) e roteiro manual de teclado, leitor de tela, contraste, reflow/zoom e movimento reduzido nas rotas críticas.

Evidências positivas atuais incluem `lang="pt-BR"`, Radix Dialog, `aria-live`/`aria-busy`, progressbar com valores, imagens decorativas ocultas, foco em botões e alguns links, mobile nav com rótulo e CSS para movimento reduzido. Lacunas observadas:

- botões `sm` têm 36 px e botões de ícone 40 px;
- o ring é o `primary` mutável por tema, não necessariamente dourado;
- inputs/selects usam foco inconsistente; o botão de fechar do diálogo não define foco visível;
- erros usam `aria-invalid`, mas não há associação sistemática do texto do erro;
- não há skip link identificado;
- há combinações provavelmente insuficientes no tema claro, como `text-amber-300`, `text-amber-200` e `text-emerald-100` sobre superfícies claras/translúcidas;
- não há scripts ou testes de acessibilidade no `package.json`;
- a análise de zoom 200% e navegação somente por teclado não está documentada.

## 8. Compartilhamento, publicidade e privacidade

- **SHR-01 — Rascunho privado.** Rascunhos pertencem ao jogador e não ficam públicos. O Mestre recebe a ficha somente após submissão válida.
- **SHR-02 — Aprovação não basta para presumir consentimento público.** Perfil público, link e Story devem exigir regra explícita de publicação/opt-in do jogador, além da aprovação do Mestre, ou uma decisão de produto documentada no consentimento do piloto.
- **SHR-03 — Controle por conteúdo.** Cada vínculo deve registrar se pode ser compartilhado com o grupo. O perfil público deve usar DTO allowlist e expor apenas campos autorizados; nunca simplesmente a ficha completa menos campos ocultos no frontend.
- **SHR-04 — Ação do jogador.** Compartilhar/copy link/download não deve ocorrer automaticamente. Web Share pode ser usado com fallback de cópia/download e cancelamento não deve aparecer como erro.
- **SHR-05 — Story transparente.** Prévia, nome, imagem, handle, hashtag e destino do link devem ser visíveis antes da ação. A plataforma deve informar que a publicação final e o adesivo de link ficam sob controle do usuário.
- **SHR-06 — Revogação.** O produto deve definir como despublicar/revogar o perfil e o que acontece com links já distribuídos e imagens baixadas.

O código limita a ação de compartilhar dentro da ficha a personagens `APPROVED`, oferece `navigator.share` com fallback de clipboard e exige uma confirmação antes do Story. A rota pública também retorna “não existe ou ainda não foi aprovado”. Porém, não foi localizado no frontend controle de opt-in/opt-out do perfil público, revogação ou flag de compartilhamento por vínculo, apesar de o manual exigir esse consentimento. O endpoint público precisa ser validado por inspeção de payload; esconder campos no componente não é fronteira de segurança.

## 9. PDF, carta ilustrada e carta jogável

- **EXP-01 — PDF A4.** Permitir download da ficha completa em A4 a partir de Meu Personagem, revisão e conclusão, com múltiplas páginas sem truncamento.
- **EXP-02 — Conteúdo do PDF.** Incluir identidade, história, Marca, traços, atributos, recursos, treinamentos e equipamentos. Excluir feedback privado do Mestre, revisões, payloads, enums, chaves internas e segredos.
- **EXP-03 — Geração local.** No piloto, gerar o PDF no navegador, sem novo endpoint nem envio a terceiro; nomear `<nome-normalizado>-ficha.pdf`.
- **EXP-04 — Natureza da cópia.** Informar que o PDF é uma fotografia local do momento do clique. Se virar documento oficial imutável, backend deve gerar, datar e versionar a cópia aprovada.
- **EXP-05 — Carta ilustrada.** A geração é opcional, ocorre somente após confirmação, mostra antes os campos e instruções que serão usados e persiste uma imagem por personagem conforme a regra vigente.
- **EXP-06 — Downloads.** Permitir visualizar e baixar retrato/carta. A carta jogável pode oferecer frente e verso, com frente narrativa e verso mecânico, mantendo dados legíveis e aprovados.
- **EXP-07 — Privacidade e segurança.** Prompt de prévia contém somente informações confirmadas e autorizadas; nunca segredo do Mestre. URLs autenticadas/blob devem expirar e não ser tratadas como links públicos permanentes.
- **EXP-08 — Evidência integrada.** Validar PDF, carta, links e downloads com personagem real no ambiente integrado, incluindo mobile e nomes/conteúdo longo.

O PDF atual usa `pdf-lib`, A4, quebra de página, metadados, rótulos legíveis e geração local. O status registra teste visual e extração de uma fixture de três páginas, mas não E2E com dados reais. A carta atual permite prévia do prompt, geração confirmada, persistência, download e uma variante jogável frente/verso. Há uma inconsistência documental: o status afirma “uma geração de carta por personagem”, enquanto o código apresenta disponibilidades separadas para `PORTRAIT` e `PLAYABLE_CARD` e anuncia uma criação adicional; a quota e sua mensagem precisam de regra única no PRD/backend.

## 10. Problemas observados e prioridades

### P0 — Bloqueiam exposição segura ou decisão estrutural

1. **Publicação sem controle visível suficiente.** Não há evidência de opt-in do perfil público, consentimento por vínculo ou revogação. Definir contrato e UX antes de promover compartilhamento.
2. **Segredo depende do backend.** Validar com Network que endpoints públicos, builder, contexto, IA, analytics e perfil público não entregam `gm_secret`, `SECRET_CANON`, prompts integrais, dados de outro jogador ou ficha além da allowlist.
3. **E2E real não executado.** O produto permanece PARCIAL para ambiente real; faltam contas reais, backend/banco, provedor de IA, e-mails e downloads reais.

### P1 — Afetam compreensão, inclusão ou coerência do MVP

1. **Fundação visual e implementação divergem.** Dark-first, paleta e tipografia aguardam decisão; o código usa tema claro, cores locais e fontes substitutas. Criar checkpoint de direção e consolidar tokens.
2. **Contraste e toque não atendem comprovadamente aos mínimos.** Há cores de texto muito claras sobre fundo claro e controles menores que 44 px.
3. **Microcopy inconsistente.** Textos sem acentuação aparecem no builder, revisão, carta e estados. Corrigir antes do playtest com participantes.
4. **Sem automação de acessibilidade.** Lint/typecheck/build não provam teclado, leitor de tela, contraste, zoom ou reflow.
5. **Hidratação pode produzir estado enganoso.** Testar flashes de visitante, refresh e retorno direto em toda a jornada.
6. **IA com estado de decisão potencialmente divergente.** Se o registro da decisão falhar após aplicação local, tornar a pendência explícita e reconciliável.

### P2 — Devem ser fechados após a validação do piloto

1. **Quota de carta inconsistente** entre documentação e variantes implementadas.
2. **PDF não é documento oficial versionado.** Manter como snapshot até haver necessidade comprovada.
3. **Crescimento visual prematuro.** Não criar biblioteca ornamental extensa antes de validar o quadro de referência do Character Builder.
4. **Rotas futuras presentes.** Continuar fora de menus/CTAs e cobrir essa regra com teste de regressão.

## 11. Critérios mínimos de aceite para UX/visual do piloto

O conjunto pode ser considerado pronto para playtest integrado quando:

1. participante novo, retomada, IA, manual, ajuste, reenvio, aprovação, pesquisa, conclusão e Admin forem executados na matriz E2E com estado e rota final registrados;
2. a direção visual light-first ou dark-first for decidida e os tokens/contrastes correspondentes forem aprovados;
3. todas as rotas críticas funcionarem por teclado, em zoom 200% e com movimento reduzido;
4. nenhuma verificação automatizada de acessibilidade crítica/séria falhar e o roteiro manual estiver anexado;
5. todo texto do piloto estiver em português correto, sem caracteres corrompidos, e o glossário estiver consistente;
6. IA permanecer identificada, opcional e reversível, sem aplicação automática nem segredo no contexto/telemetria;
7. menu do participante e do Admin corresponder exatamente ao escopo reduzido;
8. publicação e compartilhamento tiverem consentimento, allowlist de campos e revogação definidos;
9. PDF e carta forem testados com dados reais, conteúdo longo e mobile, sem vazamento ou truncamento;
10. discrepâncias de quota da carta e natureza oficial do PDF estiverem registradas como regra única.

## 12. Arquivos do código usados como evidência principal

- Navegação e shells: `lib/navigation.ts`, `components/layout/sidebar.tsx`, `components/layout/app-shell.tsx`, `components/layout/mvp-flow-shell.tsx`, `components/layout/topbar.tsx`.
- Visual: `app/globals.css`, `tailwind.config.ts`, `components/common/logo.tsx`, `components/ui/*`, `components/visual/*`.
- Builder e IA: `features/mvp/components/character-builder-form.tsx`, `features/mvp/components/player-ai-panel.tsx`.
- Ficha/revisão: `features/mvp/components/character-builder/my-character-readonly-panel.tsx`, `features/mvp/components/character-review-submit-panel.tsx`.
- Compartilhamento: `features/mvp/components/share-character-button.tsx`, `features/mvp/components/instagram-story-share-button.tsx`, `features/mvp/components/public-approved-character-panel.tsx`.
- PDF/carta: `features/mvp/components/character-sheet-download-button.tsx`, `features/mvp/pdf/character-sheet-pdf.ts`, `features/mvp/components/completion-experience-panel.tsx`, `features/mvp/components/playable-character-card.tsx`.
