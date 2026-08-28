# Story 1.6 — Retomar jornada pela rota canônica sem loops

**Issue:** #34  
**Status:** review  
**Requisitos:** FR-6, FR-8, AR-11

## Objetivo

Usar `journeyState`, `nextRoute` e revisão do `resume` como fonte de verdade para refresh, novo login, URL direta e mudança de estado entre abas.

## Decisões de implementação

- `lib/campaign/player-journey.ts` valida o estado conhecido e normaliza a revisão retornada.
- `lib/routing/journey-routing.ts` mantém catálogo fechado das rotas do Piloto e retorna somente `permit | redirect | block`.
- Uma rota compatível com o estado pode ser aberta; uma rota incompatível redireciona exclusivamente para o `nextRoute` validado do backend.
- `BLOCKED`, `LEGACY_REVIEW`, estado desconhecido, rota ausente/inválida e inconsistência encerram em recuperação humana.
- Um histórico curto em `sessionStorage` interrompe ciclos A → B → A sem transformar storage em fonte de autorização.
- A consulta de `resume` é refeita em mount, foco e reconexão; mutações existentes continuam invalidando a mesma query após transições.
- A landing não cria fallback de etapa com base em consentimento, membership ou personagem.

## Cobertura automatizada

- estado conhecido e desconhecido;
- normalização de revisão;
- rota permitida e URL direta incompatível;
- rota externa, desconhecida, com query e de outra campanha;
- estado legado e conflito estado/rota;
- ciclo de redirecionamento dentro da janela de segurança.

## Validação

- `npm run test:routing`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- expiração real, mudança entre abas e persistência final permanecem `NÃO EXECUTADO` até execução da matriz com backend e banco reais.

