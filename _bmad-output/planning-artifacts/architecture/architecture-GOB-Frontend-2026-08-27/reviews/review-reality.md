# Review Gate — Reality / Current Tech (closure)

Data: 2026-08-27
Objeto: `ARCHITECTURE-SPINE.md` atual
Escopo deste rerun: RR-1 capabilities e RR-2 evidência de acessibilidade.

## Veredito

**APROVADO COMO BUILD-SUBSTRATE, COM GATES BLOQUEANTES PRESERVADOS.**
Contagem: **0 críticos; 0 altos**.

## Rechecagem dos dois achados

### RR-1 — capabilities de revisão — FECHADO

AD-7 não fixa mais `canReview`, `canRequestChanges`, `canApprove` ou outro shape inventado. O spine preserva somente a obrigação semântica: o contrato oficial deve devolver capabilities explícitas para visualizar, pedir ajustes e aprovar, incluindo motivo de negação; nomes e formato pertencem ao OpenAPI ainda ausente. A UI não deriva autoridade de papel local, e backend continua responsável por papel, membership, autoria e atribuição.

Isso é apropriado para build-substrate: decide a fronteira e o comportamento necessário sem inventar o contrato de transporte. Implementação permanece bloqueada até o OpenAPI oficial, conforme o Deferred.

### RR-2 — matriz de acessibilidade — FECHADO

A convenção não afirma mais que `docs/pilot-e2e-matrix.md` já possui cobertura ou evidência. Ela agora exige que, **antes do Piloto externo**, a matriz registre por rota crítica evidência automatizada e manual de teclado, contraste, zoom, mobile, movimento e leitor de tela.

A redação corresponde à realidade brownfield: a matriz atual ainda está não executada e incompleta nessas dimensões, enquanto o spine registra corretamente a expansão e execução como gate futuro.

## Estado dos gates de reality/current-tech

- Stack continua reproduzindo exatamente o `package-lock.json`, sem alegar aprovação para release.
- Next.js 15.5.15 e tipos React 18 permanecem baseline current-not-release; atualização para Next.js 15.5.24+ e tipos React 19 bloqueia o Piloto externo.
- Somente AD-1 permanece `[ADOPTED]`; decisões de jornada, autenticação, mapper, idempotência, IA e publicação continuam regras de construção, não afirmações sobre implementação atual.
- Sessão revogável, OpenAPI, política jurídica/retensão, deploy/ambientes e E2E integrado permanecem gates explícitos.

## Conclusão

Nenhuma das duas correções criou nova afirmação não verificada ou contraditória com o brownfield. O spine pode seguir ao próximo gate; este parecer aprova o substrato arquitetural, não o código atual para lançamento externo.
