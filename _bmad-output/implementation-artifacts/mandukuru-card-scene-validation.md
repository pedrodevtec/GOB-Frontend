# Cena Mandukuru — implementação e evidência

Data: 2026-09-22. Regras: Abrir passagem v1. Escopo: spec `spec-mandukuru-personalized-card-scene.md`, baseline `88878534b7b3d12d7ff9aa67a684777277dce436`.

## Decisões implementadas

- Pedido atual autoriza a integração antes restrita ao protótipo. Apenas o primeiro cenário foi integrado em Meu personagem, num diálogo; nenhuma história inteira do épico 8 foi encerrada.
- Motor puro e determinístico: 28/36 Vida, energia 3/5, cinco cartas fixas, duas abordagens, resposta explícita de 4/9, escudo temporário, Marca única, três finais e teto de 18 rodadas. Revisão monotônica por tentativa rejeita comandos duplicados ou atrasados. Animação não avança combate.
- Projeção mínima: `id`, nome, trecho de `personalHistory` (fallback `creativeDossier.beforeMark`) e motivação de `creativeDossier.desire` (fallback `narrativeBond`). História limitada a 420 pontos de código Unicode, com indicação de abreviação; motivação limitada a 240 pontos de código, com reticências na abertura e desfecho. Pares substitutos não são cortados. Sem creatorName, contato, feedback, snapshot ou spread da ficha na cena. React interpola strings como texto.
- Vínculo narrativo neutro, sem deduzir acontecimentos biográficos. Abertura cita a história e motivação salvas; desfecho retoma a motivação ou a continuidade da história. Sem narrativa salva, abertura genérica.
- Acesso usa somente serviços existentes: `getResume('pilot-v1')` seguido de `getMyCharacter(tableId)`, conforme contrato confirmado na spec (Gob-Backend OpenAPI SHA `3af93e135c5d90088991a006f38ae65f901bd5bd`). Nenhum endpoint ou contrato alterado.
- Requer consentimento aceito, membership PLAYER ACTIVE, personagem corrente e estado conhecido da jornada com ficha; rejeita desconhecido, bloqueado e LEGACY_REVIEW. Não exige aprovação do Mestre nem pesquisa concluída.
- Cada abertura/reentrada confere acesso fresco. Perda/troca de sessão, conta, mesa, personagem ou elegibilidade descarta dados locais; resultados assíncronos antigos são ignorados. Retorno do foco à janela revalida ambas as consultas e suspende a interação/exibição narrativa. A tentativa permanece montada e é preservada quando escopo e projeção narrativa continuam idênticos; alteração ou falha descarta a tentativa. O resume é revalidado pelo refetch do parent, reconciliando o cache e props no retry sem ignorar uma revogação posterior. Rotação de token também descarta conservadoramente a cena, com opção de tentar novamente. Auth global e cache global não foram alterados.
- Retrato opcional não solicitado ao serviço nesta versão: avatar neutro, sem usar avatar da conta ou publicar imagePath. Arte autorizada convertida em WebP RGBA 733×1100 (126.584 bytes); transparência preservada (alpha 0–255), sem redesenho.
- Diálogo Radix, botões nativos, saída/Escape, foco por fase, feedback textual, alvos de 44px, grades responsivas e reduced-motion implementados. Não equivalem a certificação de acessibilidade sem ensaio no navegador.

## Validação executada

| Verificação | Resultado |
|---|---|
| `npm run typecheck` | PASSOU |
| `npm run test:card-demo` | PASSOU: 18 testes: 12 puros Node/TS e 6 do consumidor React |
| `npm run build` | PASSOU: compilação, tipos e 60 páginas estáticas |
| `git diff --check` | PASSOU |
| Inspeção da imagem convertida | Imagem aberta; dimensões, alpha e peso conferidos |
| UI em Chromium (componente real isolado, serviços simulados) | PASSOU: introdução, combate, vitória/derrota/recuo, reinício, Enter, Escape e retorno de foco; foco da janela preserva tentativa autorizada e revogação remove narrativa. 320px sem overflow; movimento reduzido sem animações. Reflow a 720×500 conferido como equivalente geométrico de 200% sobre 1440×1000 (não zoom nativo). |
| E2E autenticado com backend/banco real | NÃO EXECUTADO: sem sessão de teste real provisionada |

Testes puros cobrem Unicode, distinção entre dano nominal e Vida removida, recursos, efeitos das cinco cartas, limites, primeiro golpe, escudo, Marca única, resposta pesada, comandos inválidos/duplicados/atrasados, vitória imediata sem retaliação, derrota e recuo alcançáveis por sequências manuais, projeção fiel/ausente/longa, exclusão de campos privados, contexto ausente/negado/desconhecido/revogado, falhas de consulta e troca de conta/token/mesa/personagem durante as duas leituras.

Testes do consumidor React usam `react-test-renderer` com doubles somente nas fronteiras Radix, sessão e transporte. Executam abordagem/carta/resposta/reinício, cartas indisponíveis, suspensão e preservação por foco, descarte por falha, fechamento durante carregamento, respostas antigas, mudança de narrativa e reconciliação de resume no retry seguida de revogação. Não simulam navegador nem comprovam foco DOM real. O pacote de testes emite aviso de depreciação; permanece dependência de desenvolvimento, sem impacto no bundle do jogo.

Revisão também tornou as cartas indisponíveis focáveis com `aria-disabled`; o motor mantém o bloqueio de comandos. Bônus pendente e dano efetivo aparecem nas cartas; abordagem entra no histórico. Indicadores mostram somente a Vida realmente removida, mantendo o dano nominal no relato.

O guard existente `AuthBootstrap` já trata eventos de sessão limpa/renovada e logout entre abas. A helper `hasUsableAccessToken` verifica identidade de token em memória, não expiração local por relógio: a autorização efetiva é revalidada nas leituras existentes, sem criar mecanismo global novo nesta cena.

## Pendências e limites

- Testar toque em dispositivo físico e zoom nativo do navegador; reflow e teclado foram conferidos em Chromium isolado com dados fictícios. Não equivale a E2E com backend real.
- Executar matriz integrada com conta PLAYER, registrar GET resume + GET ficha própria, negação 401/403, troca de conta/mesa, personagem removido, estado persistido inalterado e rota final `/meu-personagem`. Testes com dependências simuladas não comprovam autorização real.
- A aparência Mandukuru é provisória. Nenhuma validação de equilíbrio, diversão ou cânone foi alegada. Segundo cenário, playtest e fechamento global do épico ficam fora desta entrega.
- Sem publicação em produção, mudanças no backend/autenticação, IA durante partida, persistência de combate ou telemetria narrativa. Entrega em branch/PR para revisão.

## Revisão BMAD

Três revisões: lacunas, casos de borda e verificação. Corrigidos descarte por alt-tab, reconciliação de resume, Unicode, abreviação, bônus pendente, dano real, inspeção por teclado e cobertura React. A verificação Chromium posterior exercitou os controles reais com respostas HTTP simuladas. A validade temporal do token continua responsabilidade do mecanismo de sessão existente; esta mudança não acrescenta persistência ou acesso a dados além da ficha já autorizada.

## Arte

Criada por geração de imagem para este teste: soldado humano de corpo inteiro, armadura de ferro escuro gasto, tecido terracota, elmo fechado e lança, voltado à esquerda, pintura de fantasia com luz quente e fundo transparente; sem texto ou insígnias. Arquivo integrado: `public/images/bravantus/enemies/mandukuru-sentinel-v1.webp`. A conversão preservou alpha; conceito provisório, sem canonização.
