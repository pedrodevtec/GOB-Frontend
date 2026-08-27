---
name: Guardian of Bravantus — Pilot v1
status: final
sources:
  - ../../prds/prd-GOB-Frontend-2026-08-27/prd.md
  - ../../prds/prd-GOB-Frontend-2026-08-27/addendum.md
updated: 2026-08-27
---

# Guardian of Bravantus — Experience Spine

## Foundation

A experiência é uma aplicação web responsiva e light-first, de 320 CSS px a desktop, construída com Next.js 15, React 19, Tailwind CSS e primitivos acessíveis baseados em Radix UI. A base existente é herdada quando preserva semântica, foco e composição; este spine registra os deltas necessários para o `pilot-v1`. `DESIGN.md` é a referência de identidade visual; este arquivo governa arquitetura de informação, comportamento, estado, interação, acessibilidade e jornadas. Os dois spines vencem em qualquer conflito com mock, wireframe ou importação futura.

Tese: RPG antes de dashboard; Personagem no centro; narrativa antes da mecânica; uma decisão compreensível por vez. Uma pessoa sem experiência em RPG deve concluir sem conhecer vocabulário técnico, lore completa ou sistema D20. O frontend não está pronto para uso em ambiente real até a validação E2E integrada; nenhuma regra abaixo pressupõe que o backend já foi validado.

O backend é a fonte de verdade para autenticação, papéis, membership, estados, transições, autorização, configuração versionada, limites de geração e `nextRoute`. A interface representa essa verdade em linguagem humana, nunca avança por inferência e nunca transforma botão oculto em autorização.

## Information Architecture

### Públicos e navegação

| Público | Navegação visível | Regra |
|---|---|---|
| Visitante | Landing do produto; landing da campanha; cadastro/login; confirmação de e-mail; termos e privacidade; Perfil Público elegível | Somente a landing da campanha é pública dentro do fluxo; nenhuma subetapa, dado administrativo ou Segredo do Mestre é exposto. |
| Participante | Minha Jornada; Meu Personagem quando existir; Perfil da conta | A próxima ação vem do estado persistido; Perfil da conta e Perfil do Personagem permanecem distintos. |
| Administrador do Piloto | Visão geral; Revisões; Participantes; Uso e custos de IA; Configurações; visualizar como participante | Shell e tarefas separados do Participante. `ADMIN` não implica `MASTER`; revisão excepcional é limitada a `pilot-v1` e validada pelo backend. |

### Superfícies

| Superfície | Acesso | Propósito e encerramento |
|---|---|---|
| Landing do produto | Navegação pública | Apresenta o produto sem criar expectativa de VTT, sessão ou campanha completa. |
| Landing da campanha | Link do Piloto | Explica proposta, status e etapas; conduz a cadastro/login com `returnTo` interno. Campanha indisponível encerra com estado seguro. |
| Cadastro e login | Landing ou rota protegida | Cria ou recupera sessão e retorna à campanha de origem; rejeita destino externo ou malformado. |
| Confirmação de e-mail | Cadastro pendente | Confirma ou reenvia; sucesso oferece “Continuar”; token ausente, inválido ou expirado permanece recuperável. |
| Termos e privacidade | Landing e Consentimento | Informa tratamento, fornecedores, retenção e direitos antes do convite externo. |
| Consentimento | Retomada exige Consentimento | Registra aceite explícito da versão vigente e cria/retoma participação; falha de persistência bloqueia avanço. |
| Contexto Público | Participação ativa, contexto pendente | Mostra apenas contexto público necessário; cria ou retoma um único Rascunho antes de seguir. |
| Minha Jornada | Entrada autenticada | Mostra estado, feedback, artefatos e próxima ação canônica sem misturar conta e Personagem. |
| Builder | Rascunho ou ajustes permitidos | Organiza história, confirmação e mecânica; fecha quando todos os blocos obrigatórios estão válidos e decididos. |
| Revisão | Builder válido ou consulta permitida | Exibe Ficha em leitura canônica, faltantes e confirmação explícita; envio cria Snapshot imutável e segue à Pesquisa Final. |
| Pesquisa Final | Submissão realizada | Cria ou atualiza resposta sem duplicar; salvar conduz à Conclusão e não finge aprovação. |
| Conclusão | Pesquisa salva | Separa participação concluída de revisão; libera geração explícita e downloads sem depender da aprovação. |
| Meu Personagem | Consulta ou retomada | Reúne Ficha, feedback, artefatos e ação permitida; não é o Perfil da conta. |
| Perfil da conta | Navegação autenticada | Mantém dados da conta separados do Personagem. |
| Perfil Público | Opt-in após aprovação | Mostra allowlist do último Snapshot aprovado; revogação ou perda de elegibilidade torna o link indisponível. |
| Visão geral | Entrada administrativa | Mostra funil e pendências reais; erro de API nunca vira zero. |
| Revisões | Pendência administrativa | Mostra somente submissões autorizadas e o último Snapshot; pedir ajustes ou aprovar atualiza fila e próxima ação. |
| Participantes | Navegação administrativa | Busca, filtra, pagina e oferece apenas ações globais autorizadas, com confirmação e auditoria quando destrutivas. |
| Configurações | Navegação administrativa | Edita somente apresentação e transições compatíveis do Piloto; CRUDs futuros ficam ocultos. |
| Uso e custos de IA | Navegação administrativa | Filtra uso, status e custo; ausência de preço permanece sinalizada e fora do total. |

### Referências de composição

[Minha Jornada](mockups/key-minha-jornada.html), [Builder](mockups/key-builder.html), [Revisão Admin](mockups/key-revisao-admin.html) e [Conclusão](mockups/key-conclusao.html) possuem mockups. Landing, autenticação, confirmação de e-mail, termos, privacidade, Consentimento, Contexto Público, Pesquisa Final, Meu Personagem, Perfil da conta, Perfil Público, Visão geral, Participantes, Configurações e Uso/custos ficam deliberadamente `spine-only`.

### Limites da arquitetura

Etapas visíveis do Participante: boas-vindas, Consentimento, contexto, criação, revisão, pesquisa e conclusão. Dentro da criação, quatro capítulos: contar a história, confirmar o Personagem, definir como quer jogar e revisar. Combate, rolagens, condução de sessões, Crônica, espectador, criação de Mesas e menus legados estão fora desta arquitetura.

## AI Assistance

| Princípio | Comportamento obrigatório |
|---|---|
| Opcional | O caminho manual permanece completo em erro, timeout, limite, resposta vazia ou indisponibilidade. |
| Sob demanda | Geração só começa após ação explícita por campo/capítulo, proposta mecânica ou artefato. |
| Contextual e restrita | A IA usa apenas contexto autorizado; pode fazer no máximo uma pergunta complementar; não acessa Segredo do Mestre, não inventa Cânone nem cria regras. |
| Decisão humana | Toda sugestão permite aceitar, editar ou descartar; aplicação é separada e pode ser desfeita localmente antes da persistência. |
| Mecânica em blocos | Arquétipo, Atributos, Traits, Treinamentos e Equipamentos são decididos separadamente; todos precisam de decisão antes de confirmar e salvar. |
| Recuperação | Resposta parcial mostra o que chegou e o que falta; conflito preserva conteúdo local e pede sincronização; edição manual continua disponível. |
| Transparência | A experiência chama IA de ajuda opcional e identifica imagem como arte pessoal gerada por IA, nunca arte oficial ou Cânone. |
| Privacidade e telemetria | Registra apenas caso de uso, status, modelo, tokens, custo e decisão; nunca prompt integral, narrativa/Ficha completa, Pesquisa, credencial ou segredo. |
| Sucesso | Não busca maximizar o número de chamadas nem a taxa de aceite. Mede autoria reconhecível e conclusão, inclusive sem IA. |

## Voice and Tone

Microcopy é acolhedora, heroica e direta. A voz de marca e a postura estética vivem em `DESIGN.md`.

Cada tela responde, nesta ordem: onde a pessoa está; por que isso importa; o que pode fazer; quando a IA pode ajudar; o que acontece depois. O texto assume curiosidade, não conhecimento de RPG. Estado técnico é traduzido em ação humana e aprovação é atribuída à pessoa correta.

| Do | Don't |
|---|---|
| “Conte quem é seu personagem. Poucas palavras já ajudam.” | “Preencha os campos obrigatórios do schema.” |
| “Quer uma sugestão? Você decide se usa.” | “Gerar resposta correta com IA.” |
| “Salvando…” / “Tudo salvo.” / “Não conseguimos salvar. Seu texto continua aqui.” | “PATCH pendente” / “Erro 409”. |
| “Aguardando o Mestre” | “SUBMITTED” ou “Aprovado” antes da decisão humana. |
| “Pedir ajustes” e um motivo claro | “Rejeitar ficha”. |
| “Não usei IA” | Forçar avaliação de uma ferramenta não usada. |
| “Arte pessoal gerada por IA. Não é arte oficial nem Cânone.” | Esconder a origem ou sugerir oficialidade. |
| “Este link ficará indisponível se você revogar a publicação.” | Prometer recolher arquivos já baixados ou republicados. |

Não usar enums, endpoints, payloads, IDs internos, mojibake, texto sem acentuação intencional ou sinônimos que contradigam o Glossário. Mensagens de erro afirmam preservação somente quando ela é garantida.

## Component Patterns

As especificações visuais estão em `DESIGN.md.Components`.

| Componente | Uso | Regras de comportamento |
|---|---|---|
| Primary action | Próxima ação canônica, confirmação e conclusão | Uma ação dominante por região; impede duplo envio; em processamento troca o rótulo por verbo em andamento; só navega após persistência confirmada. |
| Editorial panel | Contexto, blocos narrativos, resumo e operação | Agrupa uma decisão ou assunto; não vira card decorativo; seleção, erro e bloqueio incluem texto/ícone. |
| Narrative field | História, comentário de ajustes e respostas abertas | Rótulo persistente, ajuda e erro associados; pouco texto é válido; preserva conteúdo em falha; foco vai ao primeiro erro após validação. |
| Journey navigation | Etapas do Participante e orientação de retomada | Mostra posição e estado em linguagem humana; a etapa atual vem de `journeyState`/`nextRoute`; não permite ignorar regras de navegação nem reintroduzir menus legados. |
| AI assistance | Sugestão por campo/capítulo e proposta mecânica | Ação explícita para gerar; aceitar, editar ou descartar antes de persistir; desfazer local quando aplicável; falha mantém caminho manual. |
| Canonical sheet | Revisão, Meu Personagem e Conclusão | Mantém uma única apresentação de rótulos e valores; lista os itens faltantes e os respectivos motivos; durante submissão ou aprovação, fica somente leitura; não mistura conta e Personagem. |
| Status indicator | Salvamento, revisão, bloqueio, custo e disponibilidade | Sempre combina texto e ícone quando necessário; desconhecido usa fallback humano; erro não vira vazio e zero não mascara falha. |
| Guardian progress | Progresso, carregamento geral e espera da IA | Determinado/indeterminado com nome da ação; animação após atraso quando útil; alternativa estática preserva informação; nunca bloqueia compreensão. |
| Confirmation dialog | Submissão, publicação, revogação, adaptação e exclusão | Explica consequência e reversibilidade; uma camada apenas; ação destrutiva exige motivo quando definido e confirmação explícita; fechar é totalmente operável. |
| Personal artifact | Retrato, Carta Jogável, PDF e Story | Prévia antes da geração; usa disponibilidade/limite do backend; persistência sobrevive a refresh; download é fallback; nunca publica automaticamente. |

## State Patterns

`journeyState` e `nextRoute` governam rota e retomada; os demais estados modulam somente a etapa atual. Ao encontrar uma rota incompatível, a interface consulta a retomada e usa a rota devolvida. Falha na retomada, estado ausente ou rota não informada não autorizam avanço otimista nem inferência.

### Estados da jornada

| Estado recebido | Significado apresentado | Tratamento |
|---|---|---|
| e-mail pendente | Confirme seu e-mail | Confirmar ou reenviar; token inválido ou expirado oferece uma opção de recuperação. |
| `CONSENT_REQUIRED` | Leia e escolha se quer participar | Nada é aceito automaticamente. |
| `JOIN_REQUIRED` | Confirme sua entrada | Somente vínculo ativo libera criação. |
| `CONTEXT_REQUIRED` | Conheça o ponto de partida | Mostrar apenas contexto público; ausência bloqueia sem inventar lore. |
| `CHARACTER_DRAFT` | Continue criando | Retomar o mesmo Personagem e a mesma configuração. |
| `CHANGES_REQUIRED` | Revise os ajustes pedidos | Mostrar feedback; editar apenas quando autorizado. |
| `SURVEY_REQUIRED` | Conte como foi criar | Pesquisa aceita Ficha submetida ou aprovada. |
| `COMPLETED_PENDING_REVIEW` | Participação concluída; aguardando o Mestre | Manter conclusão e acompanhamento separados da aprovação. |
| `COMPLETED_CHANGES_REQUIRED` | Participação concluída; há ajustes | Reabrir criação sem apagar Pesquisa. |
| `COMPLETED_APPROVED` | Participação concluída; Personagem aprovado | Liberar consulta e ações conforme contrato. |
| `LEGACY_REVIEW` | Este Personagem precisa ser adaptado | Evitar loop; aguardar ação administrativa autorizada antes de editar. |
| `BLOCKED` | Não é possível continuar agora | Exibir mensagem/ação segura devolvida; não liberar conteúdo por inferência. |

### Estados transversais de interface

| Estado | Tratamento |
|---|---|
| Hidratando/autenticando | Nomear a ação e não piscar conteúdo protegido. |
| Carregando dados | Nomear o objeto da espera; skeleton só quando reproduz a estrutura esperada. |
| Sessão ausente/expirada | Voltar ao login com `returnTo` interno; preservar progresso persistido. |
| Acesso negado | Explicar pré-condição/autoridade ausente e não renderizar dados protegidos. |
| Erro recuperável | Mensagem honesta e nova tentativa quando segura; nunca prometer preservação sem garantia. |
| Vazio legítimo | Explicar que não há itens e o que acontece depois; distinguir de falha. |
| Bloqueado por contrato | Mostrar indisponibilidade e ação segura; não improvisar configuração, workflow ou rota. |
| Somente leitura | Manter consulta, remover/desabilitar mutação e explicar o motivo. |
| Validação | Associar erros aos campos, resumir faltantes e levar foco ao primeiro erro. |
| Em processamento | Desabilitar concorrência e trocar rótulo; duplo clique não duplica entidade ou transição. |
| Sucesso persistido | Atualizar estado canônico, invalidar consulta e mostrar próxima ação. |
| Conflito `409` | Não sobrescrever; preservar local quando aplicável, sincronizar e reapresentar decisão. |
| Falha periférica | IA, e-mail, imagem e download não corrompem estado central nem bloqueiam o caminho manual. |

### Independência entre dimensões

Participação concluída, aprovação, elegibilidade/publicação do Perfil Público e disponibilidade dos artefatos são dimensões independentes. A interface nunca usa uma como atalho visual para a outra.

## Interaction Primitives

- Clique/toque para agir; nada depende de hover. Em desktop, o hover pode revelar uma indicação redundante, nunca a única forma de executar uma ação.
- Teclado completa todas as tarefas. `Tab` segue ordem de leitura; `Shift+Tab` retorna; `Enter`/`Space` ativam controles; `Esc` fecha somente a camada superior e devolve foco à origem.
- Salvamento parcial omite blocos vazios ou inválidos, mostra salvando/salvo/erro e não navega antes da confirmação. O sistema não salva antes de existir um nome nem enquanto uma proposta de IA aguarda decisão.
- Início da criação consulta Personagem existente e cria um único Rascunho se ausente; repetição após falha é idempotente.
- Submissão mostra Ficha, faltantes e confirmação; usa revisão esperada e não duplica Snapshot em clique repetido ou versão obsoleta.
- Ajustes exibem comentário e permitem edição somente quando o backend autoriza; nova submissão preserva histórico e Pesquisa existente.
- Geração visual apresenta prévia/uso, exige clique explícito, respeita limite recebido e oferece download ou nova tentativa conforme disponibilidade.
- Publicação e revogação informam o recorte, a atualização, a retenção e os limites de controle sobre cópias externas; se o compartilhamento nativo não estiver disponível, o download funciona como alternativa.
- Ações destrutivas exigem autorização; exclusão exige motivo, confirmação e auditoria.
- **Banned:** avanço otimista de etapa, aceite automático de IA, publicação automática, modal sobre modal, hover-only, carrossel de formulário, menu legado visível, cor como única pista, animação indispensável e infinite scroll em operação.

## Accessibility Floor

- WCAG 2.2 AA nas rotas críticas. Texto comum exige 4,5:1; texto grande e gráficos essenciais, 3:1. Combinações verificadas e limitações estão em `DESIGN.md.Colors`.
- Alvos interativos têm no mínimo 44 × 44 CSS px, inclusive botões de ícone, botões de fechar, opções, links e controles compactos.
- Landmarks e skip link; hierarquia de títulos sem saltos funcionais; ordem do DOM acompanha leitura e ordem visual.
- Foco sempre visível e não coberto; após erro, foco vai ao primeiro campo inválido e o resumo liga ao campo correspondente.
- Rótulo, descrição e erro são associados programaticamente. Estado dinâmico relevante usa anúncio apropriado sem repetir toda digitação.
- Estado, IA, seleção, aprovação, aviso e erro usam texto e, quando útil, ícone além da cor.
- Zoom de 200% sem perda, sobreposição ou scroll horizontal comum. Conteúdo longo e nomes longos quebram sem truncar decisões.
- `prefers-reduced-motion` remove animações de viagem, ataque, balanço e celebração; percentual, ação e resultado permanecem disponíveis em estado estático.
- Leitor de tela recebe nome, papel, estado e consequência dos controles. Imagem decorativa é ignorada; retrato e artefato recebem alternativa útil.
- A validação inclui teclado completo, leitor de tela, contraste, zoom, movimento reduzido e dispositivo móvel real; intenção no código não substitui evidência.

## Responsive & Platform

| Largura/contexto | Comportamento |
|---|---|
| 320–767 CSS px | Uma coluna; margens mínimas de 16 px; navegação administrativa em painel acionável; progresso e ação atual permanecem visíveis; ações ocupam largura útil; ilustração migra para borda/topo ou é reduzida. |
| 768–1023 CSS px | Uma coluna larga ou duas colunas somente quando apoio não interrompe leitura; tabelas operacionais priorizam colunas essenciais e oferecem detalhe separado. |
| ≥1024 CSS px | Participante pode usar conteúdo + apoio/progresso; operação usa navegação persistente e largura maior; leitura narrativa continua limitada. |
| Zoom 200% | Reflui como viewport estreito; nenhuma orientação obrigatória, corte de texto ou barra cobrindo conteúdo. |
| Teclado virtual/safe area | Campo focado, ajuda, erro e ação atual ficam alcançáveis; barra fixa recua e não cobre entrada. |
| Artefatos em aparelho real | Testar geração, cancelamento, ausência de compartilhamento nativo e fallback de download para Retrato, Carta, PDF e Story. |

Desktop e celular têm paridade funcional na jornada do Participante e na retomada entre dispositivos. A Administração pode priorizar desktop para densidade, mas as tarefas críticas continuam operáveis em telas pequenas. Não existe orientação obrigatória nem gesto exclusivo.

## Inspiration & Anti-patterns

- **Preservar da Fundação Visual:** papel/marfim, caráter artesanal, títulos narrativos raros, escudo em marcos e contraste funcional.
- **Preservar do frontend atual:** separação dos shells, progressão com Guardiões, ilustrações modulares e estados estáticos para movimento reduzido.
- **Rejeitar — dark-first histórico:** contradiz a decisão vigente do Piloto e reduzia acolhimento e legibilidade.
- **Rejeitar — dashboardização:** menus amplos, cards redundantes, enums e métricas na jornada do Participante escondem a narrativa atrás do sistema.
- **Rejeitar — questionário do Episódio 1:** perguntas específicas da história não bloqueiam a criação; o Builder trata identidade, passado, motivações, vínculos e Marca.
- **Rejeitar — IA como preenchimento automático:** sugestão gerada não é decisão, aplicação nem persistência; autoria precisa ser observável.
- **Rejeitar — celebração enganosa:** Pesquisa concluída não significa Ficha aprovada; artefato disponível não significa publicação pública.
- **Rejeitar — estética “cara de IA”:** evitar gradientes saturados, brilho plástico, texto sobre cenário, ornamentação repetitiva e arte gerada ocupando o papel de identidade oficial.

## Key Flows

### UJ-1. Lucas cria seu primeiro Personagem sem conhecer RPG.

> Lucas recebe o link do Piloto no celular. Ele entende a proposta, cria a conta, confirma o e-mail, aceita o Consentimento e conhece apenas o Contexto Público necessário. Conta em três blocos quem é seu Personagem, confirma a interpretação e escolhe preencher a parte mecânica manualmente. A Ficha mostra o que falta e por quê. Lucas revisa, envia e sabe que o Administrador do Piloto fará a revisão. O valor chega quando ele vê uma Ficha coerente que reconhece como sua, não um Personagem pronto entregue pelo sistema.

1. Link do Piloto no celular → landing `/campanhas/[slug]`.
2. Cadastro/login com `returnTo` preservado → confirmação de e-mail → **“Continuar”**.
3. Consentimento → **“Li e quero participar”** → entrada idempotente.
4. Contexto Público `/episodio-1` → **“Criar meu personagem”**.
5. Builder: contar a história → confirmar o Personagem → definir como quer jogar → revisar.
6. Revisão canônica somente leitura → confirmação explícita → submissão.
7. Pesquisa Final e Conclusão, conforme o estado persistido.

- Clímax declarado pela jornada: Lucas reconhece como sua uma Ficha coerente, em vez de receber um Personagem pronto.
- Falhas/recuperação: campanha indisponível mostra estado seguro; token inválido/expirado oferece reenvio; Consentimento não persistido bloqueia; contexto ausente bloqueia sem inventar lore; ação repetida não duplica Personagem; salvamento e conflito preservam progresso; submissão incompleta permanece bloqueada.

### UJ-2. Bianca retoma o rascunho e usa IA sem perder autoria.

> Bianca já conhece RPG, interrompe a criação no computador e volta pelo celular. A jornada recupera o mesmo Rascunho e a mesma versão do Builder. Ela pede uma Sugestão de IA para um campo, edita a proposta e descarta outra; nada é gravado antes de sua confirmação. Depois aplica ou descarta cada bloco da Proposta Mecânica, revisa e envia. Se a IA falhar, Bianca continua manualmente sem perder progresso.

1. Retorno pelo celular após interrupção no computador.
2. Login/retomada → `resume` e `GET .../characters/me` recuperam o mesmo `Character.id`, revisão e `builderConfigVersion`.
3. Builder no progresso salvo.
4. Ajuda por campo/capítulo e Proposta Mecânica.
5. Revisão canônica → submissão → Pesquisa Final.

- Clímax declarado pela jornada: Bianca revisa e envia com autoria preservada; nada gerado entra na Ficha por simples geração.
- Falhas/recuperação: IA indisponível, timeout, limite, resposta parcial ou vazia mantém edição manual; conflito `409` preserva estado local e pede sincronização; refresh, logout e novo login restauram progresso; configuração antiga indisponível abre recuperação somente leitura até restauração ou migração explícita e confirmada.

### UJ-3. Rafael opera a revisão do Piloto.

> Rafael entra como Administrador do Piloto, vê a fila real de Fichas submetidas e abre o Snapshot confirmado de Lucas. Ele pede um ajuste com comentário e revisão esperada. Lucas recebe o retorno, corrige e reenvia; Rafael aprova a nova revisão. O valor chega quando a fila, o estado persistido e a próxima ação do Participante concordam, sem Rafael precisar interpretar payloads técnicos.

1. Conta autenticada com acesso administrativo → visão geral `/admin/piloto`.
2. Pendência de revisão → `/admin/piloto/revisoes`.
3. Fila mostra somente itens `SUBMITTED` → abertura do último Snapshot confirmado.
4. **“Pedir ajustes”** com motivo e `expectedRevision`.
5. Participante recebe feedback → Builder, Revisão e ressubmissão.
6. Nova revisão volta à fila → **“Aprovar”** com `expectedRevision`.
7. Visão geral, Participantes e Uso/custos apoiam acompanhamento operacional.

- Clímax declarado pela jornada: fila, estado persistido e próxima ação concordam sem leitura de payload técnico.
- Falhas/recuperação: autorrevisão, papel inadequado, membership inativa, atribuição removida e revisão obsoleta não aplicam decisão; conflito `409` mantém versão persistida íntegra; falha de e-mail não reverte submissão, ajuste ou aprovação; erro operacional de API não vira zero.

### UJ-4. Camila conclui e compartilha seu Guardião.

> Camila responde a Pesquisa Final enquanto sua Ficha ainda aguarda revisão e chega à Conclusão sem uma mensagem enganosa de aprovação. A Pesquisa Final libera a geração explícita de um Retrato e uma Carta Jogável e o download do PDF. Depois da aprovação, Camila opta por publicar o Perfil Público e gerar a imagem de Story. Antes de publicar, entende o recorte, a atualização e a revogação do link. Falha na geração ou no compartilhamento não desfaz a conclusão.

1. Ficha `SUBMITTED` ou `APPROVED` com pesquisa pendente → Pesquisa Final `/campanhas/[slug]/pesquisa`.
2. Salvar/atualizar resposta → Conclusão `/campanhas/[slug]/conclusao`.
3. Conclusão separa Pesquisa concluída de estado da revisão.
4. Após a Pesquisa: prévia da geração → clique explícito → um Retrato e uma Carta Jogável, conforme a disponibilidade e o limite de cada variante; download das imagens e do PDF.
5. Após aprovação: opt-in explícito para Perfil Público.
6. Perfil ativo no mesmo Snapshot aprovado → prévia e geração/download da composição de Story.

- Clímax declarado pela jornada: Camila conclui sem mensagem enganosa, recebe Retrato, Carta e PDF e, após aprovação, controla o compartilhamento.
- Falhas/recuperação: falha de geração preserva Ficha/jornada e permite nova tentativa quando autorizada; limite esgotado ou imagem existente respeita contrato; falha de download/compartilhamento não desfaz conclusão; revogação ou perda de elegibilidade indisponibiliza o Perfil; arquivos externos já baixados/republicados não podem ser recolhidos.
