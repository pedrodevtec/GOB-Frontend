# Check de reconciliação — produto e playtest

Comparação: `prd.md` + `addendum.md` contra `reconcile-product-playtest.md`.

## Gaps

| Severidade | Gap no PRD/addendum | Evidência esperada do extrato |
|---|---|---|
| Alta | As metas formativas não incluem **Essência: 2 de 3 participantes montam 10 pontos sem explicação verbal**. | Métricas do teste de compreensão; deve permanecer identificada como validação de hipótese, não regra oficial. |
| Alta | Não há critério explícito de **qualidade narrativa**: toda Ficha deve ter motivo para agir, algo a proteger e um Fardo jogável. | Meta explícita do protótipo. |
| Alta | Não há critério explícito de **liberdade percebida** nem o teste decisivo de diferenciação: dois Participantes com o mesmo Legado ainda criam pessoas diferentes. | Metas de liberdade e diferenciação do teste formativo. |
| Média | O público-alvo não descreve claramente os três perfis — iniciante, orientado/familiarizado e experiente — nem suas necessidades distintas; eles aparecem apenas nas métricas e jornadas. | Segmentação primária usada pelo teste de compreensão. |
| Média | Falta uma formulação explícita do problema e de suas dores: ficha vazia, dependência de intervenção humana, confusão entre pessoa atual/Alma/Arquétipo, divergência entre manual/regra/sistema e retrabalho do revisor. | Seções “Problema a resolver” e “Dores e riscos observáveis”. |
| Média | As métricas não pedem diretamente registro de abandono, tempo e retorno por etapa, quantidade de intervenções, taxa/motivos de ajustes e decisões de IA aceitas/editadas/descartadas. | Métricas operacionais propostas no extrato. |
| Média | Não há questão aberta sobre a suficiência dos campos finais do Builder para identidade, Marca, Ecos/Fardo, motivo de grupo e vínculos, sem transformar o Episódio 1 em barreira. | Open question de produto/regra nº 7 do extrato. |
| Média | O programa do teste fechado não registra como pendências prazo e canal de envio, quantidade de selecionados, data de retorno, cronograma/território do jogo físico e responsável por dúvidas. | Open question nº 20; necessário antes de o material funcionar como regulamento público. |
| Baixa | Não há pergunta de pesquisa/formativa que capture onde cada perfil travou, qual informação apareceu cedo/tarde e se a Alma ajudou ou limitou a ideia. | Open question de experiência nº 8 e perguntas pós-teste. |
| Baixa | A cobertura de notificação exige E2E real, mas não explicita como questão futura a política de retentativa/observabilidade caso o Piloto cresça. | Open question operacional nº 17; o PRD corretamente deixa outbox fora do MVP. |

## Conflitos

| Severidade | Conflito | Correção de reconciliação necessária |
|---|---|---|
| Bloqueante | **FR-24** afirma que a Pesquisa Final pode ser “responder ou atualizar” após a submissão, inclusive antes da aprovação; **Questão aberta 8** pergunta se ela pode ser editada e se deve permanecer antes da aprovação. O extrato também mantém essa política em aberto. | Não tratar atualização/editabilidade como requisito confirmado até decisão. Preservar como confirmado apenas: Pesquisa após submissão, antes da Conclusão, sem duplicação e sem conteúdo narrativo em Analytics. |
| Alta | **FR-26/FR-27, UJ-4 e escopo 6.1** introduzem dois artefatos de geração — **Retrato e Carta Jogável**. O extrato confirma uma única carta/imagem persistida por Personagem conforme a regra atual, com download; não confirma um Retrato independente. | Reduzir ao artefato atualmente confirmado ou marcar o Retrato separado como hipótese/expansão. |
| Alta | **FR-28 Perfil Público** e **FR-29 compartilhamento para Story** entram como escopo do MVP, mas não aparecem no escopo atual do extrato. O extrato posiciona espectador/comunidade como futuro e confirma apenas consulta e downloads pessoais. | Retirar do MVP reconciliado ou marcar explicitamente como extensão não suportada pela evidência de produto/playtest. |
| Alta | O Glossário declara que o **Arquétipo “permanece independente da Alma”** como fato; no extrato, essa relação é recomendada e ainda integra o checkpoint de aprovação do Product Owner. | Marcar a independência Alma/Arquétipo como hipótese/recomendação até aprovação, sem codificá-la como regra definitiva. |
| Média | A Visão diz que a IA “**valida coerência**”. O princípio confirmado é que a IA orienta/sugere e o jogador confirma, enquanto regras/backend validam e o Mestre aprova. “Validar” pode atribuir autoridade indevida à IA. | Trocar por “sinaliza possíveis incoerências” ou limitar explicitamente a checagens informativas de configuração, nunca decisão de canon/regra. |
| Média | **FR-26** permite limites próprios e possível nova tentativa de cada variante, enquanto o extrato registra a regra atual de **uma geração de carta por Personagem**. | Fazer o limite atual explícito; regeneração só pode existir como hipótese dependente de contrato e política futura. |
| Média | O PRD define o **Administrador do Piloto** como revisor/aprovador atual e o Mestre apenas para Mesas futuras. O extrato descreve a operação atual como “Administrador/Mestre” e atribui revisão/aprovação ao Mestre, sem formalizar essa transição de autoridade. | Registrar essa modelagem como decisão brownfield/operacional a validar no E2E, ou citar a fonte de domínio que a confirma; não apresentá-la como derivada do extrato de produto/playtest. |

## Cobertura confirmada

| Área do extrato | Cobertura em `prd.md` / `addendum.md` |
|---|---|
| Visão do RPG autoral, pessoa atual ligada a Alma antiga e plataforma como registro | Visão §§1 e 5; glossário de Alma, Marca, Personagem e Cânone. |
| MVP como jornada de entrada, criação, revisão e aprovação — não VTT/plataforma inteira | Propósito §0, Visão §1, Não objetivos §5 e Escopo §6. |
| RPG antes de dashboard; criação compreensível para iniciantes | Visão §1, Builder §4.3, UX §§7.2 e 8. |
| Jogador cria/confirma; IA sugere; humano aprova; backend governa estado e autorização | Visão §1, FR-6, FR-15–22 e addendum §§1–3. |
| Separação entre Contexto Público, Segredo do Mestre, Cânone e Analytics | Glossário, FR-1, FR-5, FR-18, FR-20, §7.1, SM-9 e addendum §5. |
| Entrada por campanha, `returnTo`, confirmação de e-mail, Consentimento versionado e entrada idempotente | FR-1–5 e escopo §6.1. |
| Jornada retomável, um único `Character.id`, Builder versionado e Rascunho parcial | FR-6–13 e addendum §§2–3. |
| Pessoa atual antes da mecânica; narrativa curta; interpretação confirmada | FR-9–10 e descrição de §4.3. |
| Atributos somam 12; catálogo/configuração vêm do backend | Glossário, FR-11–12 e addendum §§1–2. |
| IA opcional, caminho manual, no máximo uma pergunta complementar, aceitar/editar/descartar e proposta por blocos | FR-15–17, UJ-2 e SM-7. |
| Telemetria de IA sem conteúdo proibido; USD/BRL estimado com taxa/data | FR-18, FR-33, §7.4, SM-9 e SM-10. |
| Submissão explícita, Snapshot imutável, ajustes, ressubmissão e aprovação humana | FR-19–22 e UJ-3. |
| Notificações operacionais sem rollback da transição e sem marketing | FR-23, §5 e §6.1. |
| Pesquisa após submissão, Conclusão separada de aprovação e preservação após ajustes | FR-24–25 e UJ-4, ressalvado o conflito sobre editabilidade. |
| Download da Ficha em PDF como fotografia local, sem dados internos | FR-27 e §6.2. |
| Operação por funil, Participantes, legado e custos de IA | FR-30–34. |
| Módulos legados, combate, VTT, Crônica, comunidade, marketing e PDF oficial fora do MVP | Não objetivos §5, fora de escopo §6.2 e FR-34. |
| Metas de conclusão 3/3, autonomia, ≤2 intervenções, tempos por perfil e revisabilidade | SM-1–4. |
| E2E com papéis, HTTP, estado persistido, rota final, refresh/login, Network/Analytics e e-mails reais | SM-5–10, risco “build verde” e addendum §5. |
| Hipóteses de nomes, 10 Pontos de Essência/Fardo, histórias públicas e catálogo defensivo não canonizadas | Não objetivo §5, Questões 1–4 e addendum §6. |
| Estado real permanece parcial apesar de typecheck/lint/build/testes isolados | Addendum §1, SM-5 e risco de validação integrada §11. |
