# ADR-001 — Fronteira de autenticação e sessão do Piloto

**Status:** Proposta — torna-se aceita quando esta PR for aprovada e mergeada  
**Data:** 2026-08-27  
**Decisores:** Product Owner + responsáveis por `GOB-Frontend` e `Gob-Backend`  
**Escopo BMAD:** gate da Story 1.2 — Unificar sessão e autenticação protegida  
**Requisitos:** FR-2, NFR-1, NFR-2, AR-4, AR-16

## Contexto

O frontend e o backend possuem hoje uma sessão funcional, porém insuficiente para um Piloto externo:

- `Gob-Backend` assina um JWT de 1 hora e não possui refresh, rotação, sessão persistida, revogação ou logout remoto;
- `GOB-Frontend` replica o token no Zustand persistido, em `localStorage` e no cookie `gob_access_token` legível por JavaScript;
- o middleware considera a simples presença do cookie como sinal para navegação;
- o Axios lê o token do `localStorage`;
- `authService.logout` não chama o backend;
- expiração limpa somente o cliente e não comprova revogação server-side;
- middleware, store e cliente HTTP podem discordar sobre o estado da autenticação.

A Story 1.2 está bloqueada até existir uma decisão conjunta e um contrato oficial. A Story 1.1, que trata apenas do baseline de dependências do frontend, permanece independente deste ADR.

## Decisão

Adotar uma sessão híbrida com:

1. **access token JWT curto**, com validade padrão de 10 minutos;
2. **access token somente em memória no browser**, sem `localStorage`, `sessionStorage` ou cookie legível por JavaScript;
3. **refresh token opaco, aleatório e de uso único**, com validade deslizante máxima de 7 dias;
4. **refresh token em cookie `HttpOnly`**, criado e rotacionado por Route Handlers/BFF do Next.js;
5. **sessão persistida e revogável no backend**, identificada por `sid` e família de rotação;
6. **validação de sessão ativa no backend** para toda chamada protegida;
7. **rotação a cada refresh**, com detecção de reutilização fora da janela segura de concorrência;
8. **logout remoto idempotente**, que revoga a sessão no backend antes de limpar o cliente;
9. **uma única fronteira frontend em `lib/auth`**, consumida por bootstrap, middleware, cliente HTTP, logout e store;
10. **middleware somente como pré-filtro de navegação**; autorização real continua no backend.

Essa decisão não transforma todas as chamadas protegidas em BFF. O browser continua chamando a API com Bearer access token em memória. As rotas same-origin `/api/auth/*` existem somente para manter o refresh token fora do JavaScript.

## Alternativas consideradas

### A. Manter JWT no `localStorage`

Rejeitada. Não oferece logout remoto, rotação ou revogação e mantém o token acessível a JavaScript.

### B. Cookie de access token direto entre browser e backend

Rejeitada para este ciclo. Exige fechar antecipadamente domínios, CORS, CSRF e política de cookies entre ambientes ainda não definidos.

### C. BFF completo para toda API

Adiada. É segura, porém amplia muito a migração brownfield e altera todos os services do frontend. O BFF parcial de autenticação entrega a proteção necessária sem reescrever o transporte inteiro.

## Modelo de sessão no backend

O backend deve persistir uma entidade equivalente a:

```text
AuthSession
- id: UUID
- userId: UUID
- familyId: UUID
- refreshTokenHash: string
- createdAt: datetime
- expiresAt: datetime
- lastUsedAt: datetime nullable
- revokedAt: datetime nullable
- revokeReason: enum nullable
- replacedBySessionId: UUID nullable
```

Regras:

- armazenar somente hash do refresh token;
- não persistir access token;
- não registrar refresh token, access token ou credenciais em logs;
- IP e user-agent brutos não são obrigatórios e não devem ser coletados neste P0;
- exclusão do usuário revoga todas as sessões;
- alteração de senha, quando existir, revoga todas as sessões;
- uma sessão revogada invalida imediatamente access tokens que carreguem seu `sid`.

## Claims do access token

```json
{
  "sub": "user-id",
  "sid": "session-id",
  "accountRole": "USER",
  "iss": "gob-backend",
  "aud": "gob-frontend",
  "iat": 1787860800,
  "exp": 1787861400,
  "jti": "token-id"
}
```

O backend continua sendo a autoridade para papel global, membership de mesa, capabilities e `401/403`. O frontend nunca deriva autorização somente das claims.

## Cookie de refresh

Produção:

```http
Set-Cookie: __Host-gob_refresh_token=<opaque>; HttpOnly; Secure; SameSite=Lax; Path=/
```

Desenvolvimento local pode usar `gob_refresh_token` sem prefixo `__Host-` e sem `Secure`, somente quando `NODE_ENV != production`.

Regras:

- não definir `Domain` em produção;
- nunca devolver o refresh token ao JavaScript;
- respostas de autenticação usam `Cache-Control: no-store`;
- rotas BFF mutáveis validam `Origin` contra o host permitido;
- `SameSite=Lax` e validação de origem compõem a proteção CSRF do P0.

## Fronteiras e responsabilidades

### `GOB-Frontend`

- `app/api/auth/login/route.ts`: encaminha credenciais ao backend, recebe os dois tokens, grava o refresh em cookie `HttpOnly` e devolve somente a sessão pública e o access token curto;
- `app/api/auth/refresh/route.ts`: lê o refresh cookie server-side, rotaciona no backend, substitui o cookie e devolve novo access token;
- `app/api/auth/logout/route.ts`: revoga no backend e sempre limpa o cookie local;
- `lib/auth`: única fronteira para estado em memória, bootstrap, refresh com mutex, logout e limpeza;
- `middleware.ts`: pode redirecionar quando o refresh cookie está ausente, mas a presença do cookie nunca concede acesso;
- `apiClient`: envia Bearer em memória; em `401 TOKEN_EXPIRED`, tenta um único refresh e repete a chamada uma vez;
- store: guarda apenas projeção não sensível do usuário e estado efêmero; tokens deixam de integrar persistência Zustand.

### `Gob-Backend`

- autentica credenciais e cria sessão persistida;
- emite access token curto e refresh token opaco;
- rotaciona refresh token atomicamente;
- revoga sessão no logout;
- consulta `sid` ativo nas rotas protegidas;
- distingue autenticação inválida (`401`) de permissão insuficiente (`403`);
- documenta o contrato no OpenAPI oficial do backend;
- aplica rate limit por IP no login/refresh e por usuário/sessão nas rotas autenticadas.

## Fluxos

### Login

1. Browser chama `POST /api/auth/login` same-origin.
2. Route Handler chama `POST /api/v1/auth/login` no backend.
3. Backend valida credenciais, cria `AuthSession` e devolve access + refresh.
4. Route Handler grava refresh em cookie `HttpOnly` e remove refresh do payload.
5. Browser mantém access token somente em memória e consulta a jornada canônica.

### Bootstrap/refresh

1. Ao montar a aplicação protegida sem access token em memória, o frontend chama `POST /api/auth/refresh`.
2. Route Handler lê o cookie e chama `POST /api/v1/auth/refresh`.
3. Backend consome o refresh atual, cria sucessor na mesma família e devolve novos tokens.
4. Route Handler substitui o cookie e devolve novo access token e usuário.
5. Falha limpa a sessão local e preserva somente `returnTo` interno validado.

### Concorrência de refresh

- o frontend usa mutex para consolidar chamadas na mesma aba;
- o backend serializa a rotação por sessão;
- uma segunda tentativa com o token anterior dentro de 5 segundos retorna `409 REFRESH_ALREADY_ROTATED`, sem revogar a família;
- o BFF relê o cookie compartilhado e tenta uma vez com o sucessor;
- reutilização fora dessa janela revoga a família e retorna `401 REFRESH_TOKEN_REUSED`.

### Logout

1. Browser chama `POST /api/auth/logout`.
2. BFF envia o refresh token ao backend.
3. Backend revoga a sessão de forma idempotente.
4. BFF limpa o cookie mesmo se a sessão já estiver expirada ou revogada.
5. Frontend limpa memória, cache privado e usuário; redireciona para login.

Falha transitória do backend não deve gerar mensagem falsa de logout efetivo. O BFF limpa o cookie, o frontend encerra localmente e a resposta diferencia `revoked` de `local_only`; o Piloto externo só considera o cenário aprovado quando a revogação server-side estiver comprovada.

## Semântica HTTP

| Situação | HTTP | Código |
|---|---:|---|
| Sem credencial | 401 | `AUTH_REQUIRED` |
| Access token expirado | 401 | `TOKEN_EXPIRED` |
| Access token inválido | 401 | `INVALID_TOKEN` |
| Sessão revogada/expirada | 401 | `SESSION_REVOKED` / `SESSION_EXPIRED` |
| Refresh ausente/inválido | 401 | `REFRESH_REQUIRED` / `INVALID_REFRESH_TOKEN` |
| Reutilização fora da tolerância | 401 | `REFRESH_TOKEN_REUSED` |
| Refresh concorrente já rotacionado | 409 | `REFRESH_ALREADY_ROTATED` |
| Usuário autenticado sem capability | 403 | `FORBIDDEN` |
| Credenciais incorretas | 401 | `INVALID_CREDENTIALS` |
| E-mail não confirmado | 403 | `EMAIL_NOT_VERIFIED` |

`401` pode iniciar refresh somente quando o código for recuperável. `403` nunca inicia refresh ou troca de papel.

## Cache e privacidade

- endpoints de login, refresh, logout e `me`: `Cache-Control: no-store`;
- logout limpa React Query e qualquer projeção privada da sessão anterior;
- nenhum Server Component busca DTO privado usando cookie de refresh;
- Analytics registra somente evento, outcome, latência e código técnico; nunca token, e-mail, credencial, payload privado ou narrativa;
- `returnTo` aceita somente caminho interno pertencente ao catálogo seguro de rotas.

## Migração coordenada

1. Backend cria persistência de sessão e endpoints de refresh/logout sem remover login Bearer atual.
2. Backend publica contrato e testes de rotação, revogação e concorrência.
3. Frontend cria Route Handlers BFF e `lib/auth` atrás de feature flag.
4. Frontend migra bootstrap, Axios, middleware, store e logout como uma unidade.
5. E2E com backend/banco reais comprova login, refresh, expiração, logout, duas abas, `401`, `403` e `returnTo`.
6. Remover `gob_access_token`, `gob.access-token`, `gob.refresh-token` e tokens do Zustand persistido.
7. Encerrar compatibilidade legada somente após observação e rollback testados.

Não criar quarta fonte de sessão durante a migração.

## Critérios para liberar a Story 1.2

- [ ] Este ADR e o contrato OpenAPI foram aprovados por merge.
- [ ] Nenhum endpoint, DTO ou código de erro da implementação diverge sem novo ADR.
- [ ] O backend consegue revogar uma sessão e rejeitar o access token ainda não expirado.
- [ ] Refresh é rotacionado e reutilização é detectada sem quebrar concorrência legítima.
- [ ] Logout chama o backend e produz evidência do outcome.
- [ ] Frontend não persiste access/refresh token em JavaScript.
- [ ] Middleware não é tratado como autorização.
- [ ] `401` e `403` têm comportamentos distintos e testados.
- [ ] `returnTo` externo ou malformado é rejeitado.
- [ ] Teste integrado registra HTTP, estado persistido, caches e rota final sem credenciais.

## Consequências

### Positivas

- sessão curta, rotacionável e revogável;
- logout efetivo e comprovável;
- refresh token inacessível ao JavaScript;
- uma fronteira explícita para os cinco consumidores atuais;
- migração incremental sem BFF completo.

### Custos e riscos

- nova tabela/migration e consulta de sessão no middleware do backend;
- três Route Handlers no frontend;
- cuidado com concorrência entre abas;
- necessidade de configuração correta de cookie e origem por ambiente;
- mais testes integrados antes do convite externo.

## Fora do escopo

- SSO/OAuth social;
- “lembrar de mim” com prazo configurável;
- painel de dispositivos/sessões do usuário;
- BFF para todos os domínios;
- autorização de mesa baseada no frontend;
- mudança do papel global `ADMIN` ou das regras `MASTER`/`PLAYER`.

## Referências do repositório

- `middleware.ts`
- `lib/auth/token-storage.ts`
- `stores/auth-store.ts`
- `lib/api/client.ts`
- `features/auth/services/auth.service.ts`
- `features/auth/hooks/use-auth.ts`
- `_bmad-output/planning-artifacts/epics.md`
- `_bmad-output/planning-artifacts/implementation-readiness.md`
- `_bmad-output/planning-artifacts/architecture/architecture-GOB-Frontend-2026-08-27/ARCHITECTURE-SPINE.md`
- `Gob-Backend/src/Modules/auth/*`
- `Gob-Backend/src/middleware/auth.ts`
- `Gob-Backend/src/docs/openapi.ts`

## Registro de decisão

- **Decisão:** access token curto em memória + refresh opaco rotativo em cookie `HttpOnly` via BFF parcial + sessão revogável no backend.
- **Status:** proposta; o merge desta PR registra a aprovação.
- **Motivo:** corrigir o seam bloqueante sem persistir credenciais no JavaScript nem reescrever toda a API como BFF.
- **Impactos:** frontend, backend, banco, OpenAPI, middleware, cliente HTTP, store, logout, testes e configuração de ambientes.
- **Próximo passo após merge:** executar `bmad-create-story` para a Story 1.2 e decompor a implementação coordenada entre os dois repositórios.
