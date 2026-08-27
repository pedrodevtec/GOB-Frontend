<!-- bmad:context -->
<!-- Verified 2026-08-27 against 3803260ef218adb27feaadd85d55ad409ad5c0d4. Managed by bmad-project-context; edits inside this block are replaced on refresh. Keep anything you want preserved outside the markers. -->

## Guardian of Bravantus — Frontend

Aplicação Next.js 15/React 19 do playtest de Guardian of Bravantus. O fluxo principal separa a jornada do participante da operação de Administrador/Mestre; IA auxilia, mas não decide. Conhecimento de produto, regras e QA vive em `docs/`; artefatos BMAD ficam em `_bmad-output/`.

## Policy

- Trabalhe por branch e PR; nunca envie alterações diretamente para `main`.
- Não invente regra, endpoint ou campo: confirme regras em `docs/` e contratos no OpenAPI vigente do backend antes de alterar o cliente.
- Não altere autenticação, autorização ou fronteiras de dados sem pedido explícito; o backend é a fonte de verdade para `401`, `403`, papéis e transições.
- A IA apenas sugere; o jogador aceita, edita ou descarta, e o Mestre aprova — nunca salve, aplique ou envie uma decisão automaticamente.
- Nunca exponha segredo do Mestre, canon secreto, prompt integral, token, credencial, ficha completa ou narrativa em analytics; envie apenas metadados técnicos.
- Preserve as rotas legadas, mas não as recoloque em menus ou CTAs do piloto sem aprovação explícita.

## Where things are

- Rotas e layouts: `app/`; autenticação de navegação: `middleware.ts`, `app/(protected)/layout.tsx` e `lib/routing/auth-redirects.ts`.
- Código de domínio: `features/<domínio>/`; transporte e contratos: `lib/api/`; estado remoto em hooks React Query e estado local em `stores/`.
- Fluxo do piloto: `features/mvp/`; regras de Builder: `features/mvp/builder/character-builder-schema.ts`; máquina de jornada: `lib/campaign/player-journey.ts`.
- Alterando ficha, Builder ou piloto? Leia `docs/playtest-status-2026-08-14.md`, `docs/pilot-e2e-matrix.md` e `docs/frontend-permissions-model.md`.

## Running and verifying

- Não execute `npm run generate:api` enquanto `openapi/openapi.yaml` estiver ausente; obtenha primeiro a especificação oficial do backend, e nunca edite manualmente `types/api-schema.d.ts`.
- Não declare o fluxo “validado” só com lint, typecheck ou build: para E2E, registre papel/conta, chamadas HTTP, estado persistido e rota final usando backend e banco reais, sem credenciais na evidência.

## Conventions that differ from defaults

- `ADMIN` é papel global e não implica `MASTER`; derive autorização da mesa apenas de `currentUserRole`, `isMaster` e membership ativa retornados pelo backend.
- Mantenha personagens existentes vinculados à própria `builderConfigVersion`; atualize DTO, mapper, tipos, schema, formulário e revisão em conjunto.
- Persista rascunhos por partes, omitindo valores vazios ou inválidos; nunca apague capítulos incompletos e só navegue ao Builder após criar ou retomar o rascunho.
- Normalize envelopes e compatibilidade de respostas na camada de service/mapper, não em componentes de UI.
- Reutilize a ficha canônica em revisão, perfil e conclusão; não misture perfil da conta com estado do personagem.

## Known pitfalls

- `(public)` é apenas um route group: somente a landing da campanha é pública; as subetapas dependem das regras centralizadas em `lib/routing/auth-redirects.ts`.
- Não confunda os dois conjuntos: atributos somam 12 pontos; Ecos/Essência somam 10 e incluem ao menos um Fardo.
- Use sempre `Character.id` como `characterId`; nunca substitua por `userId`, `tableMemberId` ou nome.

<!-- /bmad:context -->
