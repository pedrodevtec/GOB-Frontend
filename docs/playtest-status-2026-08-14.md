# Guardian of Bravantus — estado do playtest

Data de consolidação: 14 de agosto de 2026.

## Resumo executivo

O produto já apresenta uma jornada própria para o participante e uma operação separada para Administrador/Mestre. O fluxo principal cobre cadastro, confirmação de e-mail, consentimento, contexto, criação assistida ou manual do personagem, revisão, envio, retorno do Mestre, pesquisa, conclusão, carta ilustrada e consulta posterior.

Os ajustes desta entrega acrescentam notificações operacionais em momentos decisivos e o download direto da ficha em PDF. Eles não reabrem o desenho do fluxo nem expõem áreas futuras.

Status geral: **PARCIAL para ambiente real**. Código, typecheck, lint, build e testes isolados foram executados; o percurso E2E com contas reais, banco do ambiente e entrega real de e-mail ainda precisa ser executado.

## Experiência do participante

- Navegação do playtest reduzida a Minha Jornada, Meu Personagem quando existente e Perfil.
- Entrada orientada, com explicação simples do que acontecerá antes do cadastro.
- Confirmação de e-mail e retomada da próxima etapa disponível.
- Consentimento e contexto do episódio separados da criação do personagem.
- Builder narrativo progressivo, sem exigir respostas do Episódio 1 para criar a ficha.
- Três perguntas narrativas amplas e confirmação da interpretação antes da proposta mecânica.
- Sugestões de IA opcionais, editáveis e nunca salvas ou enviadas automaticamente.
- Criação manual preservada quando a IA não for usada ou estiver indisponível.
- Ficha mecânica organizada por arquétipo, atributos, Traits, treinamentos e equipamentos.
- Revisão final em formato de ficha, com navegação por Resumo, História, Habilidades, Equipamentos e Jornada.
- Envio ao Mestre, espera, pedido de ajustes, reenvio e aprovação.
- Pesquisa de satisfação apresentada antes da conclusão.
- Conclusão com carta ilustrada persistida, visualização e download da imagem.
- Uma geração de carta por personagem, conforme a regra atual.
- Download da ficha completa em PDF A4 pela página Meu Personagem, revisão e conclusão.
- Personagem pode ser criado e excluído; personagens legados podem ser retirados pelo administrador ou adaptados para o modelo vigente.

## Experiência do Administrador/Mestre

- Shell administrativo próprio, sem chamada padrão para continuar a jornada do participante.
- Visão geral do piloto com estados da participação.
- Fila de revisões e leitura da ficha confirmada.
- Ações para pedir ajustes com retorno textual e aprovar o personagem.
- Lista de participantes com camadas mais compactas e foco no estado atual.
- Uso de IA com filtros, consumo por caso de uso e detalhamento por modelo.
- Custos apresentados em dólar e estimativa em real quando preços e câmbio estão configurados.
- Configurações do piloto separadas dos CRUDs futuros.
- Visualização como participante disponível de forma explícita quando necessária.

## Menus e áreas ocultas no playtest

As rotas foram preservadas no código, mas removidas da navegação e dos principais chamados do piloto: Monstros, Bounties, Missões, Treinamentos, NPCs, Loja, PvP, rankings, trocas, recompensas, criar mesa, entrar por código e demais funcionalidades futuras.

## Estados e transições em uso

| Momento | Estado funcional | Próxima ação |
|---|---|---|
| Cadastro | e-mail pendente | Confirmar e-mail |
| E-mail confirmado | consentimento pendente | Ler e aceitar |
| Consentimento aceito | contexto pendente | Conhecer o cenário |
| Contexto concluído | sem personagem | Criar personagem |
| Criação iniciada | rascunho | Continuar criação |
| Ficha revisada | pronta para envio | Enviar ao Mestre |
| Enviada | aguardando Mestre | Responder pesquisa e acompanhar |
| Ajustes pedidos | ação do participante | Ajustar e reenviar |
| Aprovada | pesquisa ou conclusão pendente | Concluir jornada |
| Pesquisa concluída | concluída | Consultar ficha, carta e downloads |

O backend continua sendo a fonte de verdade para as transições, e as páginas retomam a jornada a partir do estado recebido.

## Notificações por e-mail desta entrega

O mesmo provedor Resend já usado na confirmação de conta foi reutilizado. Não foi criada uma segunda infraestrutura de e-mail.

| Evento | Destinatário | Conteúdo | Ação |
|---|---|---|---|
| Ficha enviada | dono do personagem | Confirma recebimento e explica a espera | Acompanhar jornada |
| Ajustes solicitados | dono do personagem | Mostra o retorno do Mestre | Ver ajustes |
| Personagem aprovado | dono do personagem | Confirma aprovação | Ver personagem e baixar ficha |

As notificações são enviadas apenas para personagens de uma campanha pública do playtest. Falha do provedor é registrada sem expor dados pessoais ou credenciais e não desfaz a transição já salva. A política de privacidade agora esclarece que essas mensagens são operacionais e não publicidade.

Não foram incluídos e-mails promocionais nem lembretes agendados. Eles exigem preferência de comunicação, descadastro e uma fila de tarefas confiável antes de serem ativados.

## Download da ficha

- PDF gerado no navegador, sem novo endpoint e sem enviar dados a terceiros.
- Formato A4, múltiplas páginas, identidade visual escura e dourada.
- Inclui somente informações do personagem: identidade, história, Marca, traços, atributos, recursos, treinamentos e equipamentos.
- Exclui comentários do Mestre, números de revisão, payloads, enums e nomes internos.
- Chaves conhecidas são traduzidas para nomes legíveis ao jogador.
- O arquivo é baixado como `<nome-do-personagem>-ficha.pdf`.

## IA disponível

- Ajuda opcional por campo e por capítulo.
- Interpretação narrativa confirmada pelo participante.
- No máximo uma pergunta complementar quando faltam dados.
- Proposta mecânica baseada no contexto confirmado.
- Blocos aceitos, editados ou descartados pelo jogador.
- Telemetria centralizada por caso de uso, provedor, modelo e tokens.
- Custos administrativos em USD e BRL configurável.
- Prompt da carta disponível para consulta antes da geração.
- Uma imagem persistida por personagem e download da arte gerada.

## Contratos e banco

Nesta entrega de notificações e PDF não há endpoint novo, mudança de payload nem migration.

Contratos já existentes e utilizados pelo playtest incluem jornada pública, consentimento, builder narrativo, sugestões de IA, submissões imutáveis, revisão do Mestre, pesquisa final, telemetria de IA, adaptação de legado e geração de carta.

Migrations relevantes já existentes:

- `20260804120000_add_public_campaigns_and_consent`
- `20260804123000_add_player_ai_suggestions`
- `20260804130000_add_final_survey_and_analytics`
- `20260805170000_add_character_creative_dossier`
- `20260811140000_add_character_submission_snapshots`
- `20260811153000_add_ai_usage_telemetry`
- `20260812170000_add_narrative_assisted_builder`
- `20260812203000_add_character_legacy_adaptation`
- `20260813150000_add_character_card_art_generation`
- `20260813183000_seed_openai_ai_pricing`

## Validação executada nesta entrega

Frontend:

- TypeScript sem emissão: passou.
- Next lint: passou sem alertas.
- Build de produção: passou, 53 rotas geradas.
- `git diff --check`: passou.
- PDF de fixture completa: gerado com 3 páginas A4, inspecionado visualmente e extraído como texto sem truncamento.

Backend:

- Prisma Client: gerado.
- TypeScript sem emissão: passou.
- Testes das três notificações e falha segura do provedor: passaram.
- Regressão de cadastro, confirmação e reenvio de e-mail: passou.
- Regressão unitária do pacote de personagem: passou.
- `git diff --check`: passou.

## E2E ainda não executado

Ainda precisam ser registrados em ambiente integrado:

1. participante novo;
2. participante retomando rascunho;
3. participante usando IA;
4. participante sem IA;
5. Mestre solicitando ajuste;
6. participante ressubmetendo;
7. Mestre aprovando;
8. pesquisa e conclusão;
9. administrador acompanhando;
10. personagem legado;
11. recebimento real dos três e-mails;
12. download da ficha e da carta com dados reais.

Bloqueios atuais: ausência de `TEST_DATABASE_URL`, contas reais do ambiente e credenciais Resend de teste neste workspace. Portanto, a entrega não deve ser classificada como VALIDADA em produção.

## Riscos e próximos passos sugeridos

- E-mail síncrono e tolerante a falha é suficiente para o piloto, mas não garante retentativa. Uma próxima etapa pode adicionar outbox/fila e painel de entregas.
- Câmbio BRL é uma estimativa configurada; deve mostrar a data da taxa e não ser tratado como valor contábil.
- O PDF é uma fotografia local da ficha no momento do clique. Se for necessário um documento oficial imutável, o backend deverá gerar e versionar a cópia aprovada.
- Antes de abrir a próxima fase, executar a matriz E2E acima em staging e registrar conta, estado inicial, chamadas, estado final, rota final e evidência.
- Depois da validação do piloto, definir a próxima fatia de produto a partir dos dados de conclusão, retornos do Mestre e custo real de IA, sem reexpor os módulos futuros de uma só vez.
