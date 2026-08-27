---
project: GOB-Frontend
date: 2026-08-27
verdict: CONCERNS
source: epics.md
---

# Prontidão para implementação

## Veredito

**CONCERNS — o trabalho pode começar pelas histórias desbloqueadas, mas o pacote completo não pode ser encerrado sem quatro gates externos.**

## Evidência positiva

- PRD, UX e Arquitetura estão finais e reconciliados.
- `epics.md` cobre 34/34 FRs e 20/20 requisitos de UX em 38 histórias.
- Todas as histórias têm critérios Given/When/Then, numeração contínua e nenhuma dependência para história futura.
- Contradições brownfield estão registradas como migração ou bloqueio, não como realidade concluída.

## Concerns e disposição

1. **Sessão/ADR frontend + backend — bloqueia Story 1.2 e Piloto externo.** É preciso escolher e publicar o contrato de sessão curta/revogável antes de migrar middleware, cliente, logout e store.
2. **OpenAPI oficial ausente — bloqueia Stories 1.5 (idempotência atômica), 3.3 e 6.1–6.4, além de partes concorrentes de revisão/artefatos.** Não inventar endpoint, header, capability ou DTO.
3. **Revisão jurídica/privacidade — bloqueia convite externo e Épico 6.** Precisa aprovar Consentimento, finalidade, fornecedores, retenção, direitos e política de imagem.
4. **Deploy/ambientes — bloqueia release externo.** Provedor, separação de ambiente, segredos, observabilidade e rollback ainda não estão definidos no repositório.

## Trabalho liberado imediatamente

- Story 1.1: patch de segurança e alinhamento de dependências.
- Stories 1.3 e 1.6: landing/retorno seguro e normalização/roteamento canônico, respeitando contratos já existentes.
- Stories 2.1–2.6: caminho manual do Builder, projeção canônica, salvamento e validação UX.
- Story 3.1 e parte não persistente da 3.2: allowlists, Analytics tipado e estado local da assistência.
- Stories 4.5 e melhorias frontend das superfícies 4.1–4.4 que não alterem contrato.
- Stories 5.1–5.5 conforme endpoints vigentes comprovados.
- Stories 7.1–7.3 e 7.5 conforme DTOs vigentes, sem ampliar autorização.

## Regra para o agente

Ao encontrar um gate acima, manter a história em `backlog`, registrar o contrato ausente na evidência de execução e seguir para a próxima história liberada. Só mover para `ready-for-dev` quando o gate estiver comprovadamente resolvido; não substituir o gate por inferência do frontend legado.
