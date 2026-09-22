---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
validationStatus: blocked-for-implementation
status: draft-for-review
updated: 2026-09-22
inputDocuments:
  - ../prds/prd-GOB-Frontend-2026-08-27/prd.md
  - ../prds/prd-GOB-Frontend-2026-08-27/addendum.md
  - ../architecture/architecture-GOB-Frontend-2026-08-27/ARCHITECTURE-SPINE.md
  - ../ux-designs/ux-GOB-Frontend-2026-08-27/DESIGN.md
  - ../ux-designs/ux-GOB-Frontend-2026-08-27/EXPERIENCE.md
  - decisions.md
---

# Épico 8 — Experimentar meu Guardião em uma demo de cartas

## Visão geral

Extensão experimental, não obrigatória, do piloto. O objetivo é o jogador reconhecer seu personagem em uma pequena história jogável com cinco habilidades fixas e dois cenários selecionáveis. O sucesso da demo não comprova o loop com Mestre, nem o equilíbrio do RPG D20.

Documento incremental: épicos 1–7 e FR-1..34 continuam no índice principal sem reescrita. Requisitos CD-FR condicionais são propostas de planejamento e dependem de CD-H01..09; não ficam ready-for-dev por constarem aqui.

## Inventário de requisitos

### Funcionais

- CD-FR01: exibir identidade do personagem do próprio jogador com leitura autorizada e tratamento de ausência/erro.
- CD-FR02: oferecer exatamente dois cenários com objetivo e escolha explícita.
- CD-FR03: apresentar cinco habilidades fixas, nome, efeito e custo legíveis; catálogo versionado.
- CD-FR04 (condicional H01): permitir ordenar cinco cartas e revisar a preparação antes de iniciar.
- CD-FR05 (condicional H03/H05): apresentar introdução e uma escolha narrativa com consequência mecânica conhecida.
- CD-FR06 (condicional H01/H03/H07): resolver combate conforme contrato fechado, com registro ordenado dos eventos.
- CD-FR07 (condicional H01): mostrar Vida, Energia, intenção inimiga, carta ativa, pausa e velocidade.
- CD-FR08 (condicional H05): produzir desfecho previamente escrito, ligado à escolha e ao resultado.
- CD-FR09: permitir nova tentativa e troca de cenário sem resíduos da partida anterior.
- CD-FR10: manter demo separada de ficha oficial, aprovação, pesquisa, canon e Crônica; nenhuma recompensa persistente.
- CD-FR11: registrar evidência formativa sobre reconhecimento do personagem, entendimento das cartas, influência da preparação e interesse em repetir.

### Não funcionais

- CD-NFR01: respeitar backend como autoridade; dados privados não vão para bundle público ou analytics.
- CD-NFR02: versão de cenário/regras acompanha evidência; mesma configuração e mesmas decisões produzem resultado repetível se H07 aprovada.
- CD-NFR03: pausa, velocidade, aba oculta e desempenho não mudam resultado; não processar eventos duplicados.
- CD-NFR04: indisponibilidade da demo/retrato não bloqueia criação ou consulta normal.
- CD-NFR05: validar integração com backend real; mock não comprova acesso ao personagem.
- CD-NFR06: sem chamadas de IA em runtime na proposta H09; sem nova geração de arte automática.

### Arquitetura e evidências

Base inspecionada: pedrodevtec/GOB-Frontend, main 89d6971, em 22/09/2026.
Next.js/React já existentes; preservar módulos por feature e fronteira service/mapper.
`features/mvp/services/mvp.service.ts` implementa `getMyCharacter(tableId)` e `listCharacterCardArt(tableId, characterId)`; isso é evidência do cliente, não validação do contrato/backend.
`features/mvp/builder/character-presentation.ts`, previsto no spine, NÃO existe nesta base. Não assumir dependência pronta. Localizar apresentação atual e definir reuso mínimo na Story 8.1, sem duplicar toda a ficha.
Não criar DTO/endpoint por dedução. Confirmar OpenAPI oficial do backend antes de integrar; se faltar contrato necessário, abrir dependência específica no backend, não uma issue genérica de motor remoto.
Proposta de módulo: `features/card-demo/` com domínio, motor puro, conteúdo versionado, componentes e hook coordenador. Caminho e rota finais são decididos após análise de guardas na 8.1.
Estado de partida seria local; personagem permanece remoto e somente leitura. Eventos do motor alimentam apresentação; animação não calcula dano.

### UX

- CD-UX01: preservar papel/marfim, tinta, terracota e verde dos tokens existentes; não mudar tema global.
- CD-UX02: ordem das cartas operável com teclado e botões de mover; arrastar pode ser extra, nunca obrigatório.
- CD-UX03: controles ≥44px, foco visível, texto e ícone além de cor, zoom 200%, reflow desde 320px.
- CD-UX04: movimento reduzido substitui animações sem ocultar ação ou resultado; log legível sem anúncio excessivo.
- CD-UX05: loading, sem personagem, retrato ausente, sessão expirada, acesso negado, cenário inválido e erro têm mensagem e saída segura.
- CD-UX06: nova superfície de seleção → introdução → preparação → combate → resultado; mockup da demo ainda pendente, spines atuais cobrem identidade e acessibilidade.

## Reconciliação de escopo

PRD §5/§6.2 e EXPERIENCE excluem combate do pilot-v1. A solicitação recente autoriza PLANEJAR esta extensão; não transforma todas as hipóteses em novos requisitos oficiais. A demo terá entrada opcional cuja rota/elegibilidade precisam ser confirmadas, sem modificar journeyState/nextRoute ou liberar etapas proibidas.
A Carta Jogável atual é um artefato visual; as cinco cartas desta demo são ações do motor experimental. Não reutilizar o fluxo de geração como requisito para cada habilidade.

## Lista de épicos e cobertura

Um único épico adicional: **8 — Experimentar meu Guardião em uma demo de cartas**.
Resultado: jogador usa o próprio personagem em dois desafios narrativos, compreende as habilidades e pode repetir.
Cobertura: CD-FR01..11, CD-NFR01..06 e CD-UX01..06. Não depende de novos épicos de loja, progressão ou multiplayer.
Dependências existentes: consulta autorizada de personagem, disponibilidade de retrato (com fallback), sessão e catálogo de rotas seguro. Evidência atual ainda não comprova integração.

## Épico 8: Experimentar meu Guardião em uma demo de cartas

Status de todas as histórias: backlog. 8.1 é planejamento; 8.2–8.7 dependem de ratificação e contratos. Nenhuma está ready-for-dev.

### Story 8.1: Fechar contrato, roteiro e acesso da demo

Como Product Owner, quero revisar decisões, regras e integração, para autorizar um experimento verificável.

**Status:** backlog. **Dependências:** Nenhuma história nova; consultar baseline atual.

**Cobertura:** CD-FR01..11; CD-NFR01..06; CD-UX01..06.

**Escopo e arquivos prováveis:** Somente documentação em card-demo; consulta de features/mvp/services/mvp.service.ts, features/mvp/types.ts, lib/routing e contrato oficial backend.

**Critérios de aceite:**

- **Dado** as decisões CD-D01..06 e hipóteses CD-H01..09, **quando** revisarmos o contrato, **então** cada hipótese terá aceite, ajuste ou descarte explícito do PO, com origem, versão, visibilidade e responsável; nenhuma hipótese será tratada como canon.
- **Dado** a proposta de combate, **quando** fecharmos as regras, **então** ficarão definidos modo manual/automático, Vida, Energia inicial/máxima/recuperação, custos, dano, duração e acúmulo de defesa, ordem de resolução, empate, Marca única, limite de rodadas e comportamento com energia insuficiente.
- **Dado** o cliente atual e OpenAPI oficial do backend, **quando** avaliarmos reuso, **então** registraremos operações existentes, projeção mínima de personagem/retrato, estados elegíveis e rota segura sem mudar nextRoute; lacunas viram dependências específicas antes da integração.
- **Dado** os dois roteiros propostos, **quando** revisarmos conteúdo e UX, **então** haverá introdução, escolha, consequência e finais aprovados para a audiência da demo, mais mockup de seleção/preparação/combate/resultado seguindo os spines.
- **Dado** o escopo aprovado, **quando** encerrarmos a análise, **então** prioridade e sequência de execução serão ratificadas; liberação de planejamento não equivalerá a liberação de código.

**Gate:** regras e roteiros são hipóteses até decisão registrada na 8.1; não implementar por inferência.

### Story 8.2: Escolher cenário com meu personagem

Como jogador, quero ver meu personagem e escolher um de dois cenários, para entender o desafio antes de jogar.

**Status:** backlog. **Dependências:** 8.1

**Cobertura:** CD-FR01,02,10; CD-NFR01,04,05; CD-UX01,03,05,06.

**Escopo e arquivos prováveis:** Nova feature card-demo e rota a confirmar na 8.1; reuso de serviço/hook existente sem inventar endpoint.

**Critérios de aceite:**

- **Dado** sessão e personagem autorizados, **quando** abrir a demo, **então** verei identidade do meu Character.id, exatamente dois cenários aprovados e seus objetivos.
- **Dado** ausência de personagem, retrato indisponível ou erro de leitura, **quando** abrir a seleção, **então** receberei estados distintos; retrato ausente terá fallback neutro sem gerar imagem e ausência de personagem não criará um automaticamente.
- **Dado** 401, 403, perda de acesso ou troca de conta, **quando** revalidar a leitura, **então** dados anteriores serão removidos da superfície e haverá recuperação segura; URL manipulada não permitirá personagem alheio.
- **Dado** a seleção, **quando** usar teclado, toque ou viewport de 320px, **então** poderei escolher cenário e voltar sem alterar ficha ou jornada oficial.

**Gate:** regras e roteiros são hipóteses até decisão registrada na 8.1; não implementar por inferência.

### Story 8.3: Conhecer habilidades e preparar minha estratégia

Como jogador, quero compreender cinco cartas e revisar minha preparação, para saber como minhas escolhas afetam o confronto.

**Status:** backlog. **Dependências:** 8.2

**Cobertura:** CD-FR03,04,05; CD-NFR02; CD-UX01,02,03,06.

**Escopo e arquivos prováveis:** features/card-demo: conteúdo versionado, preparação e validação de configuração local.

**Critérios de aceite:**

- **Dado** cenário escolhido e catálogo aprovado, **quando** abrir preparação, **então** verei introdução, uma escolha com efeito conhecido e cinco cartas distintas com custos e efeitos completos.
- **Dado** H01 ratificada como automática, **quando** reordenar cartas, **então** cada carta continuará presente exatamente uma vez; botões de mover funcionarão por teclado e toque, com anúncio da nova posição.
- **Dado** catálogo inválido ou versão desconhecida, **quando** tentar iniciar, **então** o início será bloqueado com recuperação segura, sem preencher regra faltante por fallback.
- **Dado** preparação válida, **quando** confirmar, **então** a configuração local conservará versão, cenário, escolha e ordem; nenhuma habilidade será gravada na ficha oficial.

**Gate:** regras e roteiros são hipóteses até decisão registrada na 8.1; não implementar por inferência.

### Story 8.4: Jogar o primeiro cenário do início ao desfecho

Como jogador, quero executar meu confronto e compreender o resultado, para sentir meu personagem participando de uma história.

**Status:** backlog. **Dependências:** 8.3

**Cobertura:** CD-FR06,07,08,10; CD-NFR02,03,06; CD-UX01,03,04,05,06.

**Escopo e arquivos prováveis:** features/card-demo: engine puro, eventos, coordenador e interface mínima completa do cenário A; testes determinísticos focados nos limites.

**Critérios de aceite:**

- **Dado** configuração válida do cenário A, **quando** iniciar uma vez ou com clique repetido, **então** existirá uma única partida com eventos ordenados e resultados calculados pelo motor puro, sem dependência de animação.
- **Dado** combate em execução, **quando** pausar, acelerar ou ocultar a aba, **então** o estado respeitará a política definida na 8.1 e o resultado será idêntico ao da execução normal; não haverá ativação duplicada.
- **Dado** energia insuficiente, defesa ativa ou Marca já usada, **quando** resolver a próxima ação, **então** o contrato aprovado será aplicado exatamente, sem energia negativa, repetição da Marca ou loop infinito.
- **Dado** vitória, derrota ou limite de rodadas, **quando** encerrar, **então** verei um único desfecho pré-escrito coerente com a escolha e resultado, e nenhuma ação posterior será processada.
- **Dado** movimento reduzido ou leitor de tela, **quando** acompanhar o combate, **então** carta ativa, recursos, intenção e resultado terão equivalente textual; não haverá chamada a IA nem mutação da ficha.

**Gate:** regras e roteiros são hipóteses até decisão registrada na 8.1; não implementar por inferência.

### Story 8.5: Jogar um segundo cenário com objetivo diferente

Como jogador, quero escolher e concluir outro desafio, para experimentar outra estratégia com as mesmas habilidades.

**Status:** backlog. **Dependências:** 8.4

**Cobertura:** CD-FR02,05,06,08; CD-NFR02; CD-UX06.

**Escopo e arquivos prováveis:** Configuração/roteiro do cenário B e testes do objetivo; reaproveitar engine e UI.

**Critérios de aceite:**

- **Dado** cenário B aprovado, **quando** selecionar e jogar, **então** a introdução, escolha, objetivo e padrão inimigo serão distintos do cenário A, usando o mesmo motor.
- **Dado** objetivo de sobrevivência ratificado, **quando** alcançar a rodada alvo ou cair antes dela, **então** o resultado seguirá a ordem de resolução e regra de empate definidas, com desfecho correspondente.
- **Dado** mesmo personagem e cartas, **quando** alternar cenário, **então** apenas configuração do encontro será alterada; não haverá cópia divergente do motor.
- **Dado** duas preparações previstas no teste de balanceamento, **quando** simular o cenário, **então** a evidência mostrará influência mensurável da estratégia ou registrará necessidade de ajuste antes de afirmar que é divertida.

**Gate:** regras e roteiros são hipóteses até decisão registrada na 8.1; não implementar por inferência.

### Story 8.6: Repetir e sair da demo com estado íntegro

Como jogador, quero recomeçar ou trocar de cenário, para experimentar estratégias sem perder meu personagem.

**Status:** backlog. **Dependências:** 8.5

**Cobertura:** CD-FR09,10; CD-NFR01,03,04,05; CD-UX03,04,05.

**Escopo e arquivos prováveis:** Lifecycle do hook/estado card-demo; integração de retorno e teste de ausência de mutações.

**Critérios de aceite:**

- **Dado** partida encerrada ou em andamento, **quando** reiniciar com confirmação quando aplicável, **então** recursos, flags de uso único, rodada, efeitos e fila serão zerados; timers antigos não produzirão eventos.
- **Dado** uma partida, **quando** trocar cenário ou sair, **então** terei saída segura e explícita; retorno à plataforma respeitará rota autorizada sem alterar estado canônico.
- **Dado** refresh, logout ou troca de conta, **quando** retomar a interface, **então** a partida efêmera não será prometida como salva; dados privados não sobreviverão à sessão anterior e o backend será reconsultado.
- **Dado** ficha antes do teste, **quando** concluir, perder e reiniciar, **então** revisão, atributos, pesquisa e aprovação permanecerão iguais; nenhuma recompensa ou Crônica será publicada.

**Gate:** regras e roteiros são hipóteses até decisão registrada na 8.1; não implementar por inferência.

### Story 8.7: Validar a demo com jogadores e registrar aprendizado

Como Product Owner, quero observar ambos os cenários em uso, para decidir se devemos evoluir ou encerrar o experimento.

**Status:** backlog. **Dependências:** 8.6

**Cobertura:** CD-FR11; CD-NFR01..06; CD-UX01..06.

**Escopo e arquivos prováveis:** Matriz específica e relatório em card-demo; não criar analytics remoto ou pesquisa persistida sem contrato.

**Critérios de aceite:**

- **Dado** build candidata e backend real, **quando** executar matriz integrada, **então** registraremos versão, papel/conta sem credenciais, HTTP, rota final e estado antes/depois; mocks, lint e build não serão chamados de E2E real.
- **Dado** participantes de teste, **quando** jogar os dois cenários, **então** registraremos reconhecimento do personagem, entendimento de energia/cartas, influência da ordem, intervenções e vontade de repetir; tamanho da amostra será informado.
- **Dado** interface em desktop e celular, **quando** validar teclado, zoom 200%, reflow, contraste e movimento reduzido, **então** resultados e falhas terão evidência, sem afirmar acessibilidade só pela intenção no código.
- **Dado** resultados coletados, **quando** revisar com o PO, **então** decidiremos continuar, ajustar ou estacionar; nenhum resultado provará automaticamente o loop com Mestre ou balanceamento do D20.

**Gate:** regras e roteiros são hipóteses até decisão registrada na 8.1; não implementar por inferência.

## Mapa de cobertura

| Requisito | Histórias |
|---|---|
| CD-FR01 | 8.1, 8.2 |
| CD-FR02 | 8.2, 8.5 |
| CD-FR03–05 | 8.1, 8.3, 8.5 |
| CD-FR06–08 | 8.4, 8.5 |
| CD-FR09–10 | 8.6; isolamento também em 8.2/8.4 |
| CD-FR11 | 8.7 |
| CD-NFR01–06 | critérios distribuídos e verificação 8.7 |
| CD-UX01–06 | 8.1–8.6 e evidência 8.7 |

## Issues

Épico: [#50](https://github.com/pedrodevtec/GOB-Frontend/issues/50).

- Story 8.1: [#51](https://github.com/pedrodevtec/GOB-Frontend/issues/51).
- Story 8.2: [#52](https://github.com/pedrodevtec/GOB-Frontend/issues/52).
- Story 8.3: [#53](https://github.com/pedrodevtec/GOB-Frontend/issues/53).
- Story 8.4: [#54](https://github.com/pedrodevtec/GOB-Frontend/issues/54).
- Story 8.5: [#55](https://github.com/pedrodevtec/GOB-Frontend/issues/55).
- Story 8.6: [#56](https://github.com/pedrodevtec/GOB-Frontend/issues/56).
- Story 8.7: [#57](https://github.com/pedrodevtec/GOB-Frontend/issues/57).

Passo 4: revisão executada com pendências; consultar [prontidão](readiness-and-roadmap.md). Não registrado como concluído para não sinalizar aprovação de implementação.
