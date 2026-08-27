# Reconciliação de produto e playtest — Guardian of Bravantus

Data da consolidação: 2026-08-27

Finalidade: insumo factual para o PRD do frontend; este documento não altera `prd.md`.

## Critério de reconciliação

- Para **estado implementado e prontidão**, prevalece `docs/playtest-status-2026-08-14.md`, por ser a evidência mais recente. `docs/mvp-pilot-flow-critical-analysis.md` (11/08) complementa riscos de fluxo. O `docs/mvp-frontend-backlog.md` registra a intenção e os critérios originais, mas seu diagnóstico de capacidades é anterior à implementação consolidada em 14/08.
- Para **visão, princípios e governança**, prevalecem `docs/plano_sdd_bravantus_codex.md` e `docs/bravantus-framework-mapeamento-produto (1).md`.
- Para **hipóteses e metas do teste de criação**, foi usada também a fonte especializada `docs/Bravantus_Manual_Construcao_Personagem_v0.1.md`; propostas nela ainda aguardando Product Owner ou playtest não são tratadas como decisões definitivas.

## Síntese executiva

Guardian of Bravantus é um RPG autoral episódico, ambientado inicialmente em Ascendência dos Guardiões/Lacius, no qual jogadores criam pessoas atuais marcadas por ecos de almas antigas, o Mestre conduz o mundo e decide consequências, e a plataforma registra a história construída por cada mesa. A visão mais ampla inclui sistema D20, manuais, mundo próprio, campanhas, episódios, Crônica da Mesa, comunidade e IA assistiva; a fatia atual é deliberadamente menor: validar ponta a ponta a entrada no playtest e a criação, revisão e aprovação de personagem.

A proposta de valor do frontend do piloto é transformar uma criação potencialmente intimidadora e dependente do autor/Mestre em uma jornada guiada, retomável e segura, sem reduzir o personagem a uma classe pronta nem transferir agência à IA. O produto já cobre a jornada funcional principal, mas sua prontidão em ambiente real permanece **PARCIAL** porque o E2E com backend/banco reais, contas separadas, provedor de IA e entrega real de e-mail ainda não foi executado.

## Visão e princípios do produto

### Visão

- Entregar uma experiência digital que faça Bravantus parecer **RPG antes de dashboard**, sustente a fantasia autoral e incentive retorno.
- Conectar visão de produto, domínio narrativo, regras, permissões, IA e implementação por contratos pequenos, versionáveis, auditáveis e testáveis.
- Usar o Character Builder como primeiro fluxo jogável central e como ponte entre contexto público, autoria do jogador, regra mecânica e aprovação do Mestre.
- Evoluir depois para mesas/campanhas, lore público e secreto, regras D20, episódios, Crônica da Mesa, governança de IA, manuais e comunidade, sem expor tudo no piloto.

### Princípios inegociáveis

- **O jogador cria, confirma e personaliza; a IA sugere; o Mestre revisa, decide e aprova; a plataforma registra.**
- Canon, spoilers, permissões e autonomia humana são requisitos de produto, não apenas detalhes técnicos.
- O backend é fonte de verdade para estados, transições, consentimento, papéis e acesso; esconder conteúdo apenas na UI não é segurança.
- Conteúdo público e conteúdo secreto do Mestre devem permanecer separados. Prompts integrais, texto narrativo completo, ficha completa, tokens e segredos não entram em analytics operacionais.
- Sugestões de IA são opcionais, identificáveis, editáveis e descartáveis; nunca são aplicadas, salvas ou submetidas automaticamente.
- Quando faltar decisão de produto ou regra aprovada, registrar a lacuna; não inventar canon, regra, endpoint ou fluxo.

## Problema a resolver

### Problema central

Um participante, especialmente iniciante, pode travar diante de uma ficha vazia, não distinguir o que pertence à pessoa atual, ao Legado/Alma e ao arquétipo, ou depender de intervenção humana para transformar uma ideia em personagem válido. Ao mesmo tempo, materiais e regras ainda em evolução podem divergir entre manual, produto e sistema, levando a retrabalho do Mestre, personagens genéricos ou incompatíveis e implementação baseada em suposições.

### Dores e riscos observáveis

- Entrada fragmentada: cadastro, confirmação de e-mail, retorno à campanha, consentimento e retomada podem perder contexto ou mostrar estados incorretos durante hidratação/sessão.
- Criação sem orientação suficiente pode transformar a Alma em classe rígida, superficializar identidade, Marca, Ecos, Fardo e vínculos ou exigir que alguém preencha pelo participante.
- Regras ainda não oficializadas podem ser codificadas como verdade; o catálogo do backend precisa continuar sendo a fonte oficial para opções e restrições.
- Conteúdo público pode carregar segredo do Mestre, canon secreto ou prompt indevido se os payloads não forem inspecionados.
- Consentimento e pesquisa podem parecer concluídos na UI sem versão e timestamp persistidos no backend.
- A IA pode invadir a autoria do jogador, inventar regra/canon ou revelar spoiler se não houver contexto permitido, decisão humana e auditoria.
- A operação pode coletar conteúdo criativo sensível quando só precisa de funil, pendências e custos agregados.
- Build, lint e testes isolados não provam a jornada integrada; hoje faltam evidências com backend/banco reais, contas por papel e e-mails reais.

## Público e papéis

### Público primário do piloto

- **Participante iniciante em RPG:** quer criar sem dominar muitas regras; precisa de escolhas simples, contexto público suficiente e conclusão em até 25 minutos no protótipo.
- **Participante familiarizado/orientado:** quer controlar escolhas com apoio e alertas de coerência; meta de até 40 minutos.
- **Participante experiente:** quer liberdade para combinações e justificativas, sabendo que exceções dependem do Mestre; meta de até 55 minutos.

O teste de compreensão proposto usa um participante de cada perfil. Experiência anterior, desenho, texto longo ou vocabulário sofisticado não devem determinar sucesso; clareza, identidade própria e potencial de jogo importam mais.

### Papéis secundários

- **Mestre:** recebe snapshot da ficha, identifica pendências, pede ajustes, aprova e protege canon/segredos sem reconstruir a criação.
- **Administrador/operador:** acompanha funil e pendências, administra legados e observa uso/custo de IA dentro de autorização explícita.
- **Autor/Product Owner:** aprova nomes, regras, histórias públicas, limites de canon e decisões que ainda são hipóteses.
- **IA assistente:** pergunta, explica, sugere, resume ou revisa dentro do contexto permitido; não decide por jogador, Mestre ou autor.
- **Espectador/comunidade:** público futuro ligado à Crônica e conteúdo público; não é usuário central desta fatia do piloto.

## Jobs to Be Done

### Participante

1. **Quando recebo um convite/link de playtest**, quero entender a proposta, as etapas, termos e o que posso criar, para decidir participar sem receber spoiler.
2. **Quando me cadastro ou volto depois**, quero retomar exatamente a próxima etapa e meu rascunho, para não perder trabalho nem contexto de campanha.
3. **Quando parto de uma ideia incompleta**, quero orientação proporcional à minha experiência, para criar uma pessoa atual com identidade própria, Marca, motivação, vínculos e escolhas jogáveis.
4. **Quando preciso traduzir fantasia em ficha**, quero opções e validações oficiais, para produzir um personagem coerente sem memorizar o sistema.
5. **Quando uso IA**, quero aceitar, editar ou descartar cada sugestão, para continuar sendo autor do personagem.
6. **Quando termino a ficha**, quero revisá-la antes de enviar e acompanhar pedidos de ajuste/aprovação, para saber o que acontece e quem decide.
7. **Quando concluo o playtest**, quero responder a pesquisa, consultar ficha/carta e fazer downloads, para ter confirmação e um artefato persistente da criação.

### Mestre e operador

1. **Quando uma ficha chega para revisão**, quero ver o snapshot e as evidências de coerência/consentimento, para aprovar ou pedir ajustes sem reconstruí-la.
2. **Quando acompanho o piloto**, quero ver participantes por estado, bloqueios e pendências acionáveis, para operar o teste sem expor conteúdo criativo ou secreto desnecessário.
3. **Quando a IA é usada**, quero telemetria por caso de uso, modelo, tokens e custo, para avaliar viabilidade sem registrar prompt, ficha ou narrativa completos.

## Escopo reconciliado

### Em escopo para o piloto atual

- Landing pública por campanha, termos e privacidade.
- Cadastro orientado pela campanha, confirmação/reenvio de e-mail e preservação de `returnTo`.
- Consentimento versionado e entrada na campanha.
- Contexto público do Episódio 1, sem respostas obrigatórias do episódio para iniciar a ficha.
- Character Builder progressivo: narrativa, interpretação confirmada, ficha mecânica, salvamento/retomada de rascunho, revisão e submissão.
- Criação manual completa e IA assistiva opcional por campo/capítulo.
- Estados `DRAFT`, `SUBMITTED`, `CHANGES_REQUESTED`, reenvio, `APPROVED` e conclusão orientada pelo backend.
- Pesquisa final, confirmação de conclusão, carta ilustrada persistida e downloads da carta e da ficha PDF.
- Operação mínima: visão geral, fila de revisões, participantes, estados e uso/custos de IA.
- Notificações operacionais de ficha enviada, ajustes solicitados e aprovação; falha de e-mail não desfaz transição persistida.
- Adaptação/exclusão administrativa de personagens legados com auditoria.
- Estados críticos e responsividade desktop/mobile: carregamento, vazio, erro, acesso negado, sessão expirada, campanha encerrada, salvamento e conteúdo já submetido.

### Fora do escopo desta fatia

- Combate, rolagens, condução de sessões e Rules Engine D20 completo.
- Monstros, Bounties, missões, treinamentos como módulo, NPCs, loja, PvP, rankings, trocas, recompensas, criação de mesa e entrada por código como caminhos principais.
- Crônica pública, modo espectador, comunidade e expansão ampla de lore/canon.
- Analytics avançado, exportações operacionais e edição de personagem pelo operador.
- E-mails promocionais ou lembretes agendados; exigem preferência de comunicação, descadastro e fila confiável.
- Documento oficial imutável da ficha gerado/versionado no backend; o PDF atual é uma fotografia local no clique.
- Material físico, cartas físicas e QR Code antes de o fluxo digital demonstrar compreensão.

## Jornada funcional vigente

| Etapa | Estado funcional | Próxima ação/saída |
|---|---|---|
| Cadastro | e-mail pendente | confirmar e-mail |
| E-mail confirmado | consentimento pendente | ler e aceitar documento versionado |
| Consentimento aceito | contexto pendente | conhecer o cenário público |
| Contexto concluído | sem personagem | criar ou retomar personagem |
| Criação iniciada | `DRAFT` | continuar e salvar por partes |
| Ficha revisada | pronta para envio | confirmar e submeter ao Mestre |
| Enviada | `SUBMITTED` | responder pesquisa e acompanhar revisão |
| Ajustes pedidos | `CHANGES_REQUESTED` | ajustar e ressubmeter |
| Aprovada | `APPROVED` | concluir jornada se ainda pendente |
| Pesquisa concluída | concluída | consultar ficha, carta e downloads |

## Métricas e critérios de sucesso

### Metas explícitas do teste de compreensão

| Dimensão | Meta inicial |
|---|---|
| Conclusão | 3 de 3 participantes concluem uma ficha válida |
| Autonomia | todos distinguem pessoa atual, Legado e arquétipo |
| Essência | ao menos 2 de 3 montam 10 pontos sem explicação verbal |
| Tempo | iniciante ≤ 25 min; orientado ≤ 40 min; experiente ≤ 55 min |
| Intervenção humana | no máximo 2 intervenções por participante |
| Qualidade narrativa | toda ficha tem motivo para agir, algo a proteger e um Fardo jogável |
| Liberdade percebida | participantes não sentem que receberam personagem fechado |
| Revisabilidade | Mestre identifica pendências sem reconstruir a ficha |
| Diferenciação | dois jogadores com o mesmo Legado ainda criam pessoas diferentes |

### Métricas operacionais do piloto

- Conversão/contagem por estado: inscrito, e-mail confirmado, consentido, contexto concluído, rascunho, submetido, ajustes, aprovado, pesquisa concluída e conclusão.
- Abandono e tempo por etapa/rota de criação; retornos de etapa e quantidade de intervenções.
- Taxa de retomada bem-sucedida após logout, refresh, sessão expirada e URL direta.
- Taxa de submissão válida; taxa e motivos de pedido de ajustes; taxa de aprovação e ressubmissão.
- Pesquisa final: conclusão e respostas mantidas separadas de analytics técnicos.
- IA: adoção por caso de uso, sugestões aceitas/editadas/descartadas, falha sem bloqueio do fluxo manual, tokens e custo em USD/estimativa BRL.
- Operação: coerência entre painel, estados persistidos e contas; entrega/falha das três notificações operacionais.
- Segurança/privacidade: zero payload público ou evento de analytics com segredo do Mestre, canon secreto, prompt integral, ficha completa ou narrativa completa.

### Estado de evidência atual

- Typecheck, lint, build, testes isolados e inspeção do PDF passaram na entrega consolidada de 14/08.
- O fluxo **não deve ser chamado de validado em produção** até executar a matriz E2E com backend/banco reais, papéis/contas separados, IA configurada e provedor de e-mail real.

## Decisões consolidadas

### Confirmadas para o produto/piloto

- Character Builder e jornada de playtest são a prioridade atual; a plataforma ampla não entra de uma vez.
- A pessoa atual precisa existir antes e além da Marca/Alma; bases de Alma não são classes rígidas.
- Jogador e Mestre mantêm agência; IA nunca aplica ou decide automaticamente.
- Contexto público, segredo do Mestre e canon devem ter visibilidade e auditoria explícitas.
- Criação manual deve funcionar quando IA não é usada ou está indisponível.
- Rascunho é editável e retomável; submissão é explícita e bloqueia edição até retorno do Mestre; ajustes reabrem a ficha; aprovação é do Mestre.
- Consentimento deve ser versionado, auditável e persistido no backend.
- Analytics operacionais usam metadados técnicos, não conteúdo criativo completo.
- Rotas legadas permanecem no código, mas fora da navegação/CTAs do piloto.
- Pesquisa vem antes da conclusão; ficha e carta ficam consultáveis depois.
- O PDF atual é gerado no navegador e não é documento oficial imutável.
- Notificações atuais são operacionais, não promocionais, e reutilizam o provedor já existente.

### Propostas/hipóteses — não elevar a requisito definitivo sem aprovação

- Nomes de trabalho: **Legado de Alma**, **Ecos da Alma** e **Pontos de Essência**.
- Quatro Legados prototípicos como ponte inicial do Builder.
- Legado e arquétipo independentes.
- Orçamento narrativo de 10 Pontos de Essência com pelo menos um Fardo.
- Eco positivo e Fardo ocupando as Traits existentes para evitar duplicação.
- Histórias públicas do manual ainda não são canon oficial.

## Open questions e decisões pendentes

### Produto e regra

1. O Product Owner aprova os nomes Legado de Alma, Ecos da Alma e Pontos de Essência?
2. Quatro Legados são a quantidade correta para P0, e Legado/arquétipo permanecem formalmente independentes?
3. O teste confirma que 10 pontos e um Fardo obrigatório são compreensíveis, equilibrados e geram escolhas diferentes?
4. Eco positivo/Fardo deve ocupar as Traits existentes ou o modelo precisa separar as duas camadas?
5. Quais histórias públicas podem ser aprovadas como conteúdo de playtest e quais, se alguma, viram canon?
6. Qual é o catálogo defensivo oficial de armaduras/escudos antes de calcular Defesa?
7. Os campos obrigatórios finais do Builder cobrem suficientemente identidade, Marca, Ecos/Fardo, motivo de grupo e os vínculos necessários sem tornar o episódio uma barreira?

### Experiência e pesquisa

8. Onde cada perfil mais trava, qual informação chega cedo/tarde demais e em que ponto a Alma ajuda ou limita a ideia?
9. A pesquisa pode ser editada enquanto a campanha está ativa? Qual estado e política valem quando já respondida ou quando a campanha encerra?
10. A pesquisa deve ocorrer imediatamente após submissão ou apenas após aprovação? A implementação atual permite responder enquanto aguarda o Mestre; isso deve ser explicitado no PRD.
11. Uma geração de carta por personagem continua sendo a regra desejada, inclusive após ajustes/reaprovação?

### Operação, segurança e prontidão

12. Quais métricas mínimas o painel deve expor e a que papéis, sem misturar funil operacional com conteúdo de revisão?
13. A distinção entre `ADMIN` global e Mestre da mesa está validada em todos os estados 401/403 e ações de legado?
14. Os payloads reais confirmam ausência de `gm_secret`, `SECRET_CANON`, prompt integral, ficha/narrativa completas e outros dados proibidos no browser/analytics?
15. Consentimento e pesquisa persistem versão/timestamp e mantêm estado correto após refresh, novo login e campanha encerrada?
16. O E2E obrigatório passa para participante novo, retomada, com/sem IA, ajuste, ressubmissão, aprovação, pesquisa/conclusão, admin e legado?
17. Os três e-mails chegam no ambiente real, e qual será a política de retentativa/observabilidade se o piloto crescer?
18. A taxa BRL mostrará data/origem e continuará explicitamente estimativa, não valor contábil?
19. Quando, se necessário, a ficha aprovada deve ganhar uma cópia oficial imutável gerada e versionada no backend?

### Programa do teste fechado

20. Antes de funcionar como regulamento público, ainda precisam ser definidos prazo e canal de envio, quantidade de selecionados, data de retorno, cronograma/território do jogo físico e responsável por dúvidas.

## Evidências mínimas para declarar o piloto validado

- Executar todos os cenários de `docs/pilot-e2e-matrix.md` em instância integrada.
- Para cada cenário, registrar conta/papel sem senha, estado inicial, endpoints e códigos HTTP, estado final no backend/banco, rota final e evidência visual.
- Repetir refresh e novo login em consentimento, rascunho, ajuste, pesquisa e conclusão.
- Testar URLs diretas incompatíveis, sessão expirada, campanha encerrada, 401/403 e provedor de IA indisponível.
- Confirmar que Mestre não revisa o próprio personagem e que somente papel autorizado adapta/exclui legado.
- Inspecionar Network e analytics para provar separação entre público, privado e secreto.
- Confirmar recebimento real dos três e-mails e downloads da ficha/carta com dados reais.

## Fontes principais

- `docs/playtest-status-2026-08-14.md` — estado mais recente, jornada, IA, notificações, downloads, validação e riscos.
- `docs/mvp-pilot-flow-critical-analysis.md` — lacunas de autenticação, segurança, personagem, consentimento, pesquisa e operação.
- `docs/mvp-frontend-backlog.md` — intenção original, critérios de aceite, dependências e fora de escopo das 14 capacidades.
- `docs/plano_sdd_bravantus_codex.md` — visão da plataforma, princípios, módulos e governança de execução.
- `docs/bravantus-framework-mapeamento-produto (1).md` — método de fluxos reais, papéis, entregas, riscos e hotspots.
- `docs/Bravantus_Manual_Construcao_Personagem_v0.1.md` — perfis, JTBD implícitos, hipóteses, metas e decisões pendentes do Builder.
- `docs/Bravantus_Kit_Teste_Fechado_Criacao_Personagens_v0.1.md` — proposta ao participante, critérios de avaliação e pendências do programa.
- `docs/pilot-e2e-matrix.md` — cenários e evidências obrigatórias para validação integrada.
