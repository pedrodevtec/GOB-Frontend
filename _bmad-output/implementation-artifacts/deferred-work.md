- source_spec: `_bmad-output/implementation-artifacts/spec-1-2-auth-session.md`
  issue: `#42`
  status: `pending`
  summary: Executar a matriz E2E integrada do Épico 1 e da recuperação de senha.
  evidence: Login, rotação, revogação, logout, duas abas, Consentimento, retorno canônico e recuperação de senha possuem testes isolados, mas ainda não foram comprovados juntos com frontend, backend, PostgreSQL migrado, navegador e e-mail reais. Esta pendência substitui o teste antigo de hidratação da sessão persistida, pois a Story 1.2 removeu a autenticação de Zustand/localStorage.

- source_spec: `_bmad-output/implementation-artifacts/spec-gh-60-restaurar-sessao-apos-reload.md`
  issue: `#60`
  status: `pending-e2e`
  summary: Comprovar restauração após F5 contra o backend real em desktop, mobile e duas abas.
  evidence: A política local cobre `401`, `409`, rede, `429`, `5xx`, origem rejeitada, retry limitado e resposta tardia. A causa real só pode ser fechada após login novo + F5 com registro sanitizado do status e `error.code` de `/api/auth/refresh`, sem cookie, token ou dados pessoais.

- source_spec: `_bmad-output/implementation-artifacts/spec-gh-60-restaurar-sessao-apos-reload.md`
  issue: `#60-follow-up-web-locks`
  status: `pending-design`
  summary: Definir recuperação de `409 REFRESH_ALREADY_ROTATED` quando Web Locks está disponível.
  evidence: `createRefreshCoordinator` retorna diretamente de `withCrossTabLock(options.run)` e, nesse caminho preexistente, não consulta `isRotationConflict`; o fallback sem Web Locks mantém a repetição única. Alterar a semântica entre abas exige desenho e teste integrado próprios, fora desta correção.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-1-security-baseline.md`
  issue: `#41`
  status: `pending-repository-setting`
  summary: Exigir os checks `Quality gate` e `Critical dependency audit` na proteção da `main`.
  evidence: O workflow contínuo foi mesclado pela PR #46 e já executa instalação limpa, lint, typecheck, testes, build e auditoria crítica. Resta configurar esses dois checks como obrigatórios nas regras de proteção do repositório; essa configuração não vive no código.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-1-security-baseline.md`
  issue: `#43`
  status: `resolved`
  summary: Reauditar e tratar as vulnerabilidades residuais do frontend contra o lockfile atual.
  evidence: Em 2026-09-13, a auditoria partiu de 14 ocorrências na árvore completa e 7 em produção. Atualizações compatíveis corrigiram Axios, form-data, follow-redirects, nanoid, Sharp e ferramentas de desenvolvimento; o PostCSS interno do Next 15 foi fixado na mesma versão segura declarada pelo projeto por meio de override. `npm audit` e `npm audit --omit=dev` passaram com zero vulnerabilidades, assim como lint, typecheck, quatro suítes de teste e build. A migração para Next 16 não foi necessária e continua fora deste escopo.

- source_spec: `_bmad-output/implementation-artifacts/spec-8-4-unificar-paineis-e-densidade-do-combate.md`
  summary: Adicionar fallback visual para falha de carregamento da arte local do Mandukuru.
  evidence: A imagem do inimigo já dependia de um asset local sem tratamento de `onError`; se o arquivo falhar, a caixa visual permanece vazia. A correção não é causada pela unificação dos painéis e merece tratamento separado sem ampliar este refactor.
