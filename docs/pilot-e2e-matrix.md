# Playtest ponta a ponta — roteiro e registro

Este roteiro deve ser executado contra uma instância com banco migrado, campanha `pilot-v1` ativa, provedor de IA configurado e contas reais separadas. Um cenário só recebe `PASSOU` quando as chamadas, o estado persistido e a rota final forem conferidos.

## Variáveis do ambiente de teste

- URL do frontend:
- URL da API:
- participante novo:
- participante com rascunho:
- participante sem IA:
- administrador/Mestre:
- personagem legado:
- data e responsável pela execução:

## Cenários obrigatórios

| Cenário | Estado inicial | Ações e chamadas que devem ser observadas | Estado e rota final esperados | Resultado |
|---|---|---|---|---|
| Convite e retorno seguro | visitante sem sessão | abrir landing; iniciar cadastro/login com `returnTo`; confirmar e-mail; repetir com `https://externo.test`, `//externo.test` e rota codificada | destino interno preservado; destinos externos rejeitados; nenhuma navegação fora da aplicação | NÃO EXECUTADO |
| Campanha indisponível | slug inexistente, campanha encerrada ou mesa indisponível | abrir a landing e observar `GET /campaigns/public/{slug}` | mesma mensagem pública segura, sem revelar o motivo interno | NÃO EXECUTADO |
| Participante novo | E-mail ainda não confirmado; sem consentimento e sem vínculo | cadastrar; confirmar e-mail; `GET /campaigns/public/pilot-v1/resume`; aceitar consentimento; entrar; ler contexto; iniciar ficha | `CHARACTER_DRAFT`; `/campanhas/pilot-v1/personagem` | NÃO EXECUTADO |
| URL direta incompatível | participante autenticado em cada estado canônico | abrir diretamente consentimento, contexto, builder, revisão, pesquisa e conclusão; observar `GET .../resume` | rota compatível é permitida; incompatível usa somente `nextRoute`; rota ausente/desconhecida bloqueia com recuperação | NÃO EXECUTADO |
| Estado alterado em outra aba | mesma conta aberta em duas abas | avançar uma transição na aba A; focar e atualizar uma rota antiga na aba B | novo `resume` é consultado e a aba B converge para o estado vigente sem loop | NÃO EXECUTADO |
| Sessão expirada durante retomada | access token expirado em rota protegida | atualizar a página ou focar a aba; observar `401 TOKEN_EXPIRED`, `POST /api/auth/refresh` e repetição única; repetir em duas abas; revogar a sessão e tentar novamente | rotação converge sem expor refresh token; `403` nunca renova; sessão revogada limpa memória/cache e login recebe somente `returnTo` interno seguro | NÃO EXECUTADO |
| Retomar rascunho | `DRAFT` persistido | sair; entrar novamente; abrir Minha Jornada; `GET .../resume`; `GET /tables/{tableId}/characters/me` | mesmos dados e revisão; builder no ponto salvo | NÃO EXECUTADO |
| Criação com IA | narrativa confirmada e revisão conhecida | pedir ajuda em um campo; usar/editar/descartar; pedir proposta mecânica; decidir os cinco blocos; confirmar escolhas | nenhuma sugestão aplicada antes da confirmação; rascunho salvo depois dela | NÃO EXECUTADO |
| Criação sem IA | participante em `DRAFT` | preencher manualmente os três blocos narrativos e a ficha mecânica; revisar; submeter | `SUBMITTED`; `/campanhas/pilot-v1/pesquisa` | NÃO EXECUTADO |
| Mestre pede ajuste | personagem de outro usuário em `SUBMITTED` | abrir Revisões; ler snapshot enviado; informar feedback; `POST .../request-changes` | `CHANGES_REQUESTED`; fila atualizada | NÃO EXECUTADO |
| Participante ressubmete | `CHANGES_REQUESTED` com feedback | novo login; retomar; ajustar; revisar; `POST .../submit` | nova revisão `SUBMITTED`; pesquisa continua concluída se já enviada | NÃO EXECUTADO |
| Mestre aprova | nova submissão de outro usuário | abrir Revisões; conferir snapshot/revisão; `POST .../approve` | `APPROVED`; removido da fila pendente | NÃO EXECUTADO |
| Pesquisa e conclusão | personagem submetido; sem pesquisa | responder pesquisa; `PUT .../final-survey/me`; preparar parecer visual | `COMPLETED_PENDING_REVIEW` ou `COMPLETED_APPROVED`; `/campanhas/pilot-v1/conclusao`; prompt disponível | NÃO EXECUTADO |
| Admin acompanha | participantes em estados variados | abrir Visão geral, Revisões, Participantes e Uso e custos de IA | números e estados coerentes com as contas usadas | NÃO EXECUTADO |
| Personagem legado | ficha sem blocos narrativos atuais | Admin escolhe adaptar; conferir snapshot preservado e rascunho não confirmado; em outra ficha, excluir com motivo | adaptado em `DRAFT`; excluído deixa de aparecer; auditoria registrada | NÃO EXECUTADO |

## Registro por execução

Para cada linha, anexar: conta/papel (sem senha), estado inicial consultado, passos, códigos HTTP e endpoints, estado final no banco/API, rota final e evidência visual. Falhas devem registrar o primeiro ponto de quebra e o identificador retornado pela API.

## Critérios adicionais

- Repetir refresh e novo login em consentimento, rascunho, ajuste, pesquisa e conclusão.
- Tentar abrir diretamente todas as etapas incompatíveis e confirmar o redirecionamento para `nextRoute`.
- Confirmar que o Mestre não revisa o próprio personagem e que somente `ADMIN` exclui/adapta legados.
- Executar a criação com o provedor de IA indisponível e confirmar que a edição manual continua utilizável.
- A geração automática da imagem só pode passar quando provedor e armazenamento estiverem configurados; a preparação do parecer e do prompt é um aceite separado.
