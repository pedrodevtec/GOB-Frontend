# Revisão de prontidão e roteiro — Épico 8

Data: 2026-09-22. Status: planejamento revisado; **não pronto para implementação**.

## Processo BMAD executado

BMAD instalado 6.11.0, skill `.agents/skills/bmad-create-epics-and-stories/SKILL.md`.
Resolver de customização executado via Python; nenhuma instrução prepend/append, nenhum project-context.md encontrado. AGENTS.md e configuração carregados.
Passos lidos e trabalhados sequencialmente: extração de requisitos, desenho do épico, decomposição de histórias e revisão final de cobertura/prontidão.
A autorização do usuário para fazer o processo e registrar o planejamento foi usada para preparar os artefatos revisáveis sem repetir confirmações de continuidade. Isso não foi tratado como aprovação das hipóteses mecânicas.
Saída aditiva em card-demo, vinculada ao índice principal, para preservar os épicos 1–7. Não alteramos a skill, instalação, spines históricos ou regras de aprovação.
A revisão final NÃO libera ready-for-dev: faltam ratificação de regras, roteiro específico e contrato de acesso. Nenhum desenvolvimento, E2E ou balanceamento foi executado.

## Achados e reconciliação

| Achado | Efeito | Resolução |
|---|---|---|
| PRD §5/§6.2 e UX excluem combate do pilot-v1 | Alteração explícita de escopo necessária | Planejamento da extensão autorizado; piloto obrigatório preservado |
| Arquitetura prevê character-presentation.ts, mas arquivo ausente | Reuso não pode ser assumido | 8.1 identifica apresentação atual e mínimo adaptador |
| getMyCharacter e listCharacterCardArt presentes no cliente | Caminho provável de leitura | Confirmar OpenAPI e HTTP real antes da integração; não afirmar API validada |
| Cinco habilidades ≠ uma Carta Jogável gerada | Risco de alterar quota ou gerar imagens em excesso | Catálogo fixo independente das variantes de arte existentes |
| Valores de combate e formato não ratificados | Não há contrato executável | 8.1 registra decisão antes de 8.2–8.7 |
| Novo CTA pode conflitar com jornada canônica | Guardas poderiam redirecionar ou bloquear | Definir rota/elegibilidade sem inferir novo nextRoute |
| Demo automática pode reduzir agência | Pode virar apenas animação | Playtest deve mostrar efeito da escolha/preparação; ajustar ou estacionar se não houver |

## Roteiros propostos (HIPÓTESE; não canon)

### A — Abrir passagem

- Abertura: o personagem encontra uma rota de saída bloqueada por uma ameaça genérica. Não definir facção, NPC ou evento oficial antes da aprovação.
- Decisão: avançar diretamente ou preparar aproximação protegida.
- Efeito proposto: bônus inicial de ataque ou proteção; valores pendentes.
- Preparação: compreender cinco cartas e organizar estratégia, se H01 aprovada.
- Confronto: ameaça com padrão previsível e objetivo de derrotá-la antes de cair; limite de rodadas definido na 8.1.
- Desfechos propostos: passagem aberta ou recuo necessário; o texto reflete a escolha sem alterar canon.
- Uso no teste: aprendizado básico de recursos e reconhecimento do personagem.

### B — Sustentar a defesa

- Abertura: pessoas precisam de tempo para chegar a um local seguro; identidades e locais permanecem genéricos até revisão narrativa.
- Decisão: preparar barricada ou reservar energia.
- Efeito proposto: proteção inicial ou energia adicional; valores pendentes.
- Confronto: resistir por N rodadas diante de ataques leves/fortes anunciados. N, dano, empate e morte na rodada final são pendências obrigatórias da 8.1.
- Desfechos propostos: defesa sustentada ou retirada antecipada; não aplicar perdas oficiais.
- Uso no teste: verificar se defesa/recuperação e ordem das mesmas cartas geram outra estratégia.

## Sequência de execução proposta

1. 8.1: contrato de regras e decisões, roteiros, acesso e mockups da demo.
2. 8.2–8.3: personagem e escolha de cenário, cartas e preparação.
3. 8.4: primeiro percurso completo, engine mínimo e desfecho.
4. 8.5: segundo objetivo sobre o mesmo engine.
5. 8.6: repetição, saída e isolamento do estado.
6. 8.7: playtest e decisão de continuidade.

Não há prazo nem responsável de execução presumidos. Aprovação de regras: PO; validação de contratos: engenharia; narrativa: Autor/PO; coleta formativa: responsável a designar.

## Revisão final BMAD

- Cobertura: 11 FR, 6 NFR e 6 requisitos UX com histórias/aceites correspondentes.
- Dependências: 8.1 → 8.2 → 8.3 → 8.4 → 8.5 → 8.6 → 8.7; sem dependência de história futura.
- Valor: um épico entrega experiência completa; 8.1 é habilitadora de planejamento, não funcionalidade de usuário.
- Tamanho: 8.4 limita-se a engine mínimo e UI funcional do primeiro cenário; acabamento e expansão permanecem fora. Se contrato crescer, dividir antes da implementação, mantendo primeiro percurso jogável.
- Brownfield: sem novo template, banco, auth ou pipeline; preservar módulos, contratos e configurações existentes.
- Prontidão: **PENDENTE**. Bloqueios CD-H01..09 e contrato/rota específicos são visíveis; não marcar workflow como final/ready-for-dev.
- Testes desta PR: verificação documental, links locais, cobertura e preservação de status anteriores. Nenhum teste funcional declarado.

## Revisão v0.2 — decisão mais recente

Combate manual aprovado pelo PO; H01 automática foi superada. Primeiro cenário e protótipo para teste/vídeo passam à frente do segundo cenário.
Sequência vigente: 8.1 (contrato + protótipo local) → 8.2 → 8.3 → 8.4 → 8.6 (repetição do primeiro cenário) → 8.7 (primeira rodada formativa). 8.5 entra depois, seguida de ampliação do teste em 8.7.
Sem reordenação de cartas, autoplay, velocidade de combate ou dependência do cenário B para gravar A. Os registros de processo anteriores são históricos; a implementação integrada permanece pendente.
