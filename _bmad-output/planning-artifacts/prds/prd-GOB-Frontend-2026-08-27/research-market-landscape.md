# Digest de pesquisa — panorama de mercado para plataforma de playtest TTRPG

**Data da pesquisa:** 2026-08-27
**Objetivo:** contextualizar expectativas e riscos para *Guardian of Bravantus* (GOB). Este material não prescreve funcionalidades, não amplia o escopo do PRD e não recomenda copiar fluxos, regras, textos ou ativos de terceiros.

## Leitura executiva

O padrão mais consistente entre plataformas atuais é um ciclo curto e compreensível: **criar com orientação → chegar a uma ficha utilizável → levar essa ficha para uma mesa/grupo → revisá-la sem perder trabalho**. A diferenciação varia, mas o mercado já acostumou usuários a ajuda contextual, validação de escolhas, salvamento contínuo ou explícito, ficha compartilhável e clareza sobre o que é gratuito, licenciado ou restrito.

Para GOB, o principal risco de expectativa não é “faltar um VTT completo”; é o fluxo prometer assistência e ainda deixar o jogador sem saber se o personagem está pronto para o playtest, quem pode vê-lo ou qual conteúdo foi gerado por IA. O principal risco de produto é confundir evidência de playtest com preferência declarada: as práticas oficiais consultadas privilegiam uso real, observação, pesquisa estruturada e iteração.

IA e imagens são uma área especialmente sensível no ecossistema TTRPG. As políticas oficiais variam de **divulgação obrigatória** a **proibição completa em arte/publicações**. Logo, qualquer uso deve ser tratado como escolha explícita e rastreável, não como detalhe invisível do onboarding.

## Comparáveis atuais e sinais relevantes

| Comparável | Evidência oficial observada | Expectativa de usuário que isso ajuda a formar | Risco a considerar em GOB |
|---|---|---|---|
| **D&D Beyond** | O builder oferece seis fichas gratuitas, as classes-base e compartilhamento de rolagens; a orientação oficial apresenta o **Quick Build** como caminho para iniciantes, one-shots ou jogos improvisados. A documentação histórica do próprio beta descreve ajuda ligada por padrão, marcação de escolhas pendentes, estado “sheet ready” e salvamento do rascunho desde a entrada no fluxo. ([Character Builder](https://www.dndbeyond.com/characters), [guia para o primeiro personagem](https://www.dndbeyond.com/posts/1059-how-to-create-your-first-dungeons-dragons), [notas oficiais do beta](https://www.dndbeyond.com/forums/d-d-beyond-general/news-announcements/3653-updated-beta-release-notes-phase-2-3-character)) | Caminho rápido e caminho detalhado; indicação clara de pendências; personagem “pronto para jogar”; trabalho preservado durante uma criação longa. | Não inferir que GOB precisa reproduzir múltiplos modos de criação. Validar primeiro se jogadores entendem o próximo passo e o critério de prontidão. Evitar reproduzir texto, ordem, taxonomia ou material protegido de D&D. |
| **Roll20 Characters + Charactermancer** | Personagens podem ser criados fora de uma mesa e depois adicionados, copiados ou transferidos; o produto explicita diferenças entre snapshot e sincronização. O Charactermancer conduz o usuário passo a passo, mas permite navegar entre etapas e conclui com revisão/salvamento. ([Roll20 Characters](https://help.roll20.net/hc/en-us/articles/360037258594-Roll20-Characters), [criar personagem](https://help.roll20.net/hc/en-us/articles/360046574454-How-to-Create-a-Character), [fluxo em slides](https://help.roll20.net/hc/en-us/articles/360053135454-Call-of-Cthulhu-7E-Charactermancer)) | A ficha tem vida própria, não apenas dentro de uma sessão; estados de cópia, vínculo e sincronização precisam ser inequívocos. | Compartilhamento sem modelo explícito de propriedade pode causar duplicatas, sobrescrita ou dúvida sobre a “fonte de verdade”. Mesmo um MVP deve usar verbos e estados consistentes. |
| **Demiplane** | O builder guia a criação com tooltips, regras e mecânicas; a ficha permite rolagens e referências. Há acesso gratuito limitado por primer/pregenerados, compartilhamento de personagens e integração beta com Roll20 para usar a ficha no VTT. ([Getting Started](https://support.demiplane.com/hc/en-us/articles/33046325857815-Getting-Started-on-Demiplane-Your-Official-Digital-Companion), [FAQ de Character Tools](https://resources.demiplane.com/nexus/pathfinder/character-tools/faqs), [integração beta](https://help.roll20.net/hc/en-us/articles/30050730960151-Demiplane-and-Roll20-Character-Sheet-Integration-Beta)) | Orientação deve aparecer no ponto da decisão; conteúdo inicial/pregenerado reduz o tempo até experimentar o jogo; integração beta deve declarar estabilidade e pedir feedback. | Não esconder limitações de conteúdo ou maturidade. Se houver conteúdo parcial de playtest, rotulá-lo e não sugerir cobertura de regras que não existe. |
| **World Anvil** | Oferece fichas para dezenas de sistemas, perfil narrativo, diário/equipamento e compartilhamento. A privacidade pode separar a ficha pública do perfil completo; também há estado “stored” sem exclusão. ([Character Creator](https://www.worldanvil.com/player), [Character Manager](https://www.worldanvil.com/learn/player/character-manager)) | Personagem mecânico e identidade narrativa podem ter exposições diferentes; ocultar/arquivar não deve significar apagar. | Publicação acidental de backstory, notas ou dados do jogador. A visibilidade deve ser entendida antes de gerar qualquer link público. |
| **Hero Forge** | Ferramenta gratuita no navegador, focada em design visual, com salvamento/compartilhamento de criações e produtos derivados. ([visão geral oficial](https://heroforge.com/content/), [Termos de Uso](https://www.heroforge.com/ToS/)) | Usuários esperam experimentar visualmente e compartilhar uma representação do personagem. | Um retrato não precisa se tornar requisito para concluir a ficha. Upload, geração e compartilhamento de imagem trazem direitos, privacidade, moderação e custo próprios. |
| **Foundry VTT** | O sistema oficial de D&D 5e destaca ficha reorganizada com tooltips; o tutorial oficial modela personagens como atores persistentes editáveis. O ecossistema é extensível por sistemas/módulos. ([sistema D&D 5e](https://foundryvtt.com/packages/dnd5e), [tutorial de GM](https://foundryvtt.com/article/tutorial-two/)) | Usuários experientes podem esperar ficha editável durante o jogo e capacidade de acomodar variações de sistema. | Não transformar extensibilidade de VTT em requisito implícito. Para playtest, customização irrestrita pode reduzir a qualidade dos dados se mudanças não forem distinguíveis das regras testadas. |

### Padrões que aparecem repetidamente

1. **Progressão orientada, sem aprisionamento.** Etapas, ajuda contextual e revisão reduzem carga cognitiva; poder voltar e corrigir evita recomeços.
2. **Estado de prontidão legível.** “Completo”, “jogável”, “faltam escolhas” e “rascunho” precisam ter significado observável, não apenas cor ou sensação visual.
3. **Preservação do trabalho.** Fluxos longos tornam perda silenciosa especialmente danosa; autosave, salvar explícito ou ambos exigem confirmação perceptível.
4. **Ficha como artefato persistente.** Criação, uso na sessão e revisão posterior formam um ciclo. Isso não implica que o MVP precise oferecer mesa virtual, rolagens ou integração externa.
5. **Compartilhamento com escopo e autoridade.** Ver, editar, copiar, assumir e sincronizar são ações diferentes. Um link sem permissão clara cria risco de privacidade e integridade.
6. **Gratuito/licenciado/parcial claramente separado.** Plataformas ligadas a sistemas comerciais restringem opções conforme conteúdo adquirido ou compartilhado. GOB deve evitar importar a expectativa de que material ausente esteja apenas “bloqueado” se ele na verdade não faz parte do playtest.

## Onboarding e desenho do playtest

### O que as fontes oficiais sugerem

- **Deixar o usuário jogar antes de avaliar.** D&D Beyond e Paizo pedem feedback depois da leitura ou uso do material; Paizo combina pesquisas específicas com espaço aberto. ([exemplo D&D de 2026](https://www.dndbeyond.com/posts/2194-designer-insights-from-unearthed-arcana-villainous), [Pathfinder Playtest](https://paizo.com/pathfinderplaytest), [Starfinder Playtesting Overview](https://paizo.com/blog/starfinder-playtesting-overview))
- **Testar o fluxo como tarefa real.** O GOV.UK recomenda teste moderado em alpha, beta e live e diferencia claramente testar o serviço de testar a pessoa. Prototipar antes de se comprometer com construção reduz desperdício. ([teste moderado](https://www.gov.uk/service-manual/user-research/using-moderated-usability-testing), [prototipagem](https://www.gov.uk/service-manual/design/making-prototypes))
- **Coletar comportamento e percepção, não só opinião final.** A orientação oficial lista observação, entrevista, analytics/logs e questionários como fontes complementares; a planilha “rainbow” registra tarefa, hipótese, resultado por participante e notas. ([métodos de pesquisa](https://userresearch.blog.gov.uk/2016/06/08/choosing-the-best-methods-to-answer-user-research-questions/), [análise de usabilidade](https://userresearch.blog.gov.uk/2019/09/13/how-a-spreadsheet-can-make-usability-analysis-faster-and-easier/))
- **Iterar em lotes pequenos e frequentes.** O Service Manual recomenda pesquisa contínua em cada fase, em vez de um estudo grande apenas no início ou no fim. ([como pesquisa melhora o serviço](https://www.gov.uk/service-manual/user-research/how-user-research-improves-service-design))

### Aplicação prudente ao contexto GOB

Estas são hipóteses de pesquisa, não requisitos de produto:

- A tarefa de onboarding a observar deve terminar em um resultado concreto, por exemplo: “crie um personagem que você levaria para uma sessão de teste e identifique o que ainda falta”.
- Separar métricas de **fluxo** (concluiu, abandonou, voltou, corrigiu, tempo até ficha utilizável) de métricas de **jogo** (entendeu opções, conseguiu usá-las, diversão, equilíbrio percebido).
- Registrar versão das regras, versão do fluxo e momento do feedback; sem isso, resultados de rodadas diferentes podem se misturar.
- Capturar eventos mínimos e consentidos, evitando gravar livremente backstory, prompts ou imagens quando contagens/estados bastam.
- Incluir participantes iniciantes e experientes: assistência excessiva pode irritar veteranos, enquanto terminologia implícita bloqueia iniciantes.
- Rotular protótipos e conteúdo de playtest como mutáveis; não prometer permanência de personagens/dados sem política definida.

## Compartilhamento: riscos e expectativas

Um modelo mínimo de compartilhamento deve responder, em linguagem simples, antes da ação:

- **O quê:** ficha inteira, resumo, retrato, link ou dados de playtest.
- **Com quem:** privado, pessoas convidadas, grupo/campanha ou público.
- **Permissão:** visualizar, comentar, editar, duplicar ou assumir controle.
- **Atualização:** snapshot ou vínculo vivo.
- **Revogação:** quem pode retirar o acesso e o que acontece às cópias.
- **Proveniência:** versão das regras e indicação de conteúdo gerado/assistido por IA, quando aplicável.

Esse vocabulário deriva dos problemas que Roll20, Demiplane e World Anvil precisam resolver, mas não implica implementar todos esses modos. O risco imediato é lançar um único botão “Compartilhar” cuja consequência o usuário não consiga prever.

## Uso responsável de IA e imagens

### Evidência de sensibilidade do ecossistema

- A **Wizards of the Coast** declara que não permite arte generativa em arte de D&D e descreve investigação e revisão quando há suspeita. ([FAQ oficial](https://dnd-support.wizards.com/hc/en-us/articles/26243094975252-Generative-AI-art-FAQ))
- A **Paizo** não permite conteúdo gerado por IA em seus marketplaces comunitários e afirma que não usará arte ou texto gerados por IA em seus produtos. ([política oficial](https://paizo.com/blog/paizo-and-artificial-intelligence))
- O **Roll20 Marketplace** não aceita produtos que usem arte gerada por IA; o ecossistema DriveThru exige tags em determinadas categorias e proíbe IA em programas específicos. ([política Roll20](https://app.roll20.net/forum/post/11379379/ai-generated-artwork-policy-updates), [política DriveThruRPG, atualizada em 2026](https://help.drivethrurpg.com/hc/en-us/articles/26794784634007-Managing-AI-Generated-Content-and-DriveThru-Policy))
- O **itch.io** exige divulgação precisa de material gerado por IA e pode remover ativos não marcados da descoberta. ([Quality Guidelines](https://itch.io/docs/creators/quality-guidelines))
- Como referência de fornecedor, as políticas atuais da **OpenAI** proíbem uso enganoso de semelhança fotorealista sem consentimento; os termos para capacidades visuais exigem consentimento expresso e direitos necessários para reproduzir a semelhança de uma pessoa. ([Usage Policies](https://openai.com/policies/usage-policies/), [Service Terms](https://openai.com/policies/service-terms/))

### Guardrails a avaliar antes de qualquer feature de IA

| Área | Pergunta de decisão | Falha provável se ficar implícita |
|---|---|---|
| Transparência | O usuário sabe quando está recebendo texto/imagem gerado ou transformado por IA? | Perda de confiança e impossibilidade de cumprir políticas de publicação externas. |
| Controle criativo | A saída é sugestão editável, há regeneração e existe caminho sem IA? | A ferramenta substitui escolhas do jogador e empobrece o próprio playtest. |
| Exatidão de regras | A IA só reorganiza conteúdo autorizado ou também inventa regra/estatística? Como a saída é validada? | “Alucinação” apresentada como regra oficial e dados de teste contaminados. |
| Direitos e IP | Há confirmação de direitos sobre uploads e bloqueio/alerta para personagens, logos ou estilos protegidos quando necessário? | Reclamação de titular, remoção em marketplace e custo de moderação. |
| Likeness e privacidade | Fotos de pessoas reais são aceitas? Há consentimento verificável e tratamento especial para menores? | Uso indevido de imagem, exposição de dados pessoais e dano reputacional. |
| Segurança temática | Como lidar com nudez, violência gráfica, ódio, assédio e sexualização, especialmente envolvendo menores? | Conteúdo abusivo em geração, galeria ou link compartilhado. |
| Dados | Prompts, backstories e imagens são retidos? Enviados a terceiro? Usados para treino? Por quanto tempo e como excluir? | Coleta além do necessário e surpresa sobre uso de conteúdo privado. |
| Proveniência | Origem, modelo/fornecedor, data e edições precisam acompanhar o ativo? | Impossibilidade de auditar, moderar ou divulgar uso de IA depois. |
| Operação | O que acontece em recusa, timeout, custo elevado ou indisponibilidade do provedor? | Onboarding bloqueado por uma capacidade não essencial. |

**Limite importante:** as políticas citadas pertencem a plataformas e editoras específicas; não são, por si, lei nem obrigação automática para GOB. Elas demonstram expectativa comunitária e risco de interoperabilidade/publicação. Avaliação jurídica de direitos autorais, proteção de dados e imagem deve ser feita separadamente para as jurisdições e fornecedores efetivamente escolhidos.

## Implicações para descoberta — sem expansão de escopo

Antes de transformar qualquer padrão de mercado em requisito, o playtest deve responder:

1. Qual é o menor artefato que jogadores e facilitadores reconhecem como “personagem pronto para testar”?
2. Quais escolhas exigem explicação contextual e quais jogadores já entendem sem ajuda?
3. O personagem precisa apenas ser exibido por link, ou alguém além do autor realmente precisa editá-lo?
4. A imagem ajuda a concluir a tarefa principal ou é enriquecimento opcional?
5. Se IA for usada, ela melhora tempo/compreensão sem alterar regras nem autoria percebida pelo jogador?
6. Quais dados são realmente necessários para avaliar o playtest e quais devem permanecer privados?

Não há evidência, neste levantamento, de que GOB precise no MVP de VTT, marketplace, compêndio comercial, rolagens integradas, rede social de personagens, sincronização externa, geração de imagens ou múltiplos modos de builder. Esses são apenas pontos de comparação para detectar expectativas e riscos.

## Fontes e recorte

Pesquisa realizada em **2026-08-27**, usando páginas de produto, centrais de ajuda, termos e publicações oficiais. Foram priorizadas fontes primárias; páginas históricas foram usadas somente quando documentam racional de design ou práticas de beta, e estão identificadas como tal. Produtos e políticas mudam: validar novamente antes de decisões de implementação, integração ou publicação.
