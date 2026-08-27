# Reviewer Gate — Adversarial Units (final rerun)

## Veredito

**Aprovar no gate adversarial.** Não restou par de épicos que consiga obedecer literalmente ao spine atual e ainda divergir em severidade crítica ou alta. Os furos anteriores agora terminam em owner único, contrato nominal, direção de dependência ou blocker explícito antes que duas implementações incompatíveis possam ser consideradas conformes.

## Pares reatacados

| Ataque | Épico A × Épico B | Resultado |
| --- | --- | --- |
| Projeção da Ficha | Builder define shape × PDF/Consulta redefine shape | **Contido:** AD-6 fixa arquivo, tipo e proíbe redefinição. |
| Cache por transição | Submissão invalida jornada × aprovação invalida apenas operação | **Contido:** AD-5 fixa owner e inclui todas as projeções remotas relevantes na matriz. |
| Duas sessões | Admin invalida localmente × Participante conserva estado decisório stale | **Contido:** mount/focus/revisão diferente exigem releitura; invalidação local não pode alegar atualizar outra sessão. |
| Dependência entre features | Admin importa MVP × MVP importa Admin | **Contido:** AD-1 permite somente `features/admin -> features/mvp`. |
| Autenticação | cookie HttpOnly/BFF × bearer/refresh | **Contido por blocker:** nenhuma estratégia é conforme antes da ADR conjunta e das provas exigidas. |
| Server/client | fetch protegido no servidor × fetch protegido no browser | **Contido:** a convenção limita superfície protegida ao transporte browser até a ADR e proíbe cache público de resposta privada. |
| Autorização operacional | UI deriva de `ADMIN` × UI usa capability backend | **Contido:** AD-7 exige capabilities explícitas e proíbe derivação de papel local. |
| Publicação | estado em `features/mvp` × estado em `features/characters` | **Contido:** AD-10 fixa `features/mvp/publication` como único owner. |
| Gatilho de despublicação | primeiro PATCH × novo Snapshot | **Contido:** AD-10 distingue `CHANGES_REQUIRED`, nova submissão/aprovação e re-opt-in. |
| Analytics | dois nomes/shapes para o mesmo evento | **Contido:** AD-9 fixa catálogo fechado, versionado e sem evento ad hoc. |
| Erros | `conflict`/retry × `stale_revision`/block | **Contido:** vocabulário de `kind` e `action` está fechado; só a microcopy varia por feature. |
| IA mecânica | PATCH por bloco × commit em lote | **Contido por contrato/blocker:** AD-8 exige uma operação backend atômica e bloqueia aplicação até OpenAPI. |
| DTO de decisão de IA | frontend inventa envelope por sugestão × por proposta | **Contido:** AD-8 fixa requisitos semânticos e proíbe inventar DTO antes do contrato oficial. |
| Artefato/Perfil | galeria escolhe última imagem × Story escolhe arte de outro Snapshot | **Contido:** `ArtifactRef.sourceSnapshotId` e AD-10/AD-11 exigem o mesmo Snapshot publicado. |

## Críticos

Nenhum.

## Altos

Nenhum.

## Cauda média

Três pontos de precisão permanecem, mas não permitem dois épicos críticos/altos conformes porque os contratos de integração afetados já estão bloqueados ou possuem owner único:

1. AD-1 diz genericamente `UI -> hook -> service`, enquanto a convenção Server/client permite Server Components buscarem DTO público; no handoff, convém nomear a exceção `public server loader -> service` para evitar discussão estrutural.
2. `ArtifactRef` possui campos mínimos, mas não um arquivo owner nominal; a integração está bloqueada pelo OpenAPI e AD-11 impede divergência semântica, portanto o risco atual é de organização, não de integridade.
3. A projeção BRL exige taxa, fonte e data, mas ainda não fixa se o cálculo ocorre no backend ou no frontend; como USD em micros é o valor canônico, a divergência fica limitada à apresentação estimada.

## Resultado

**0 críticos, 0 altos, 3 médios.**
