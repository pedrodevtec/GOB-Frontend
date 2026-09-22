# Retrato do personagem na arena

Pedido: aplicar o retrato existente aprovado pelo PO, mantendo o combate manual.

Implementação: hook de leitura opcional da galeria após validação do personagem; escolhe PORTRAIT mais recente, baixa pelo serviço autenticado e exibe URL blob local na arena. Arte inteira preservada com object-fit contain, 300px desktop/210px mobile. Efeitos existentes continuam aplicados ao personagem. Fallback em ausência, erro de serviço ou erro de decodificação; não lê PLAYABLE_CARD nem gera imagem. Cancelamento lógico evita uso de respostas antigas e libera object URLs no cleanup.

Contrato confirmado: Gob-Backend src/docs/openapi.ts SHA 3af93e135c5d90088991a006f38ae65f901bd5bd, GET galeria/card-art e GET conteúdo. Nenhum endpoint ou backend novo.

Verificação: 22 testes passaram (12 domínio + 10 consumidor React), incluindo download autenticado só do retrato, preservação entre turnos, liberação ao sair da cena, ausência/carta completa, falha do serviço, resposta atrasada e imagem inválida. Typecheck/build registrados na PR. Testes com transporte simulado não comprovam autorização real ou visual no aparelho. Validação desta imagem com conta real e celular fica pendente após deploy. O bug de sessão #60 não é alterado neste recorte.
