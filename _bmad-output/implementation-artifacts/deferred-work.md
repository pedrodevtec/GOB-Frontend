- source_spec: `_bmad-output/implementation-artifacts/spec-1-2-auth-session.md`
  issue: `#42`
  status: `pending`
  summary: Executar a matriz E2E integrada do Épico 1 e da recuperação de senha.
  evidence: Login, rotação, revogação, logout, duas abas, Consentimento, retorno canônico e recuperação de senha possuem testes isolados, mas ainda não foram comprovados juntos com frontend, backend, PostgreSQL migrado, navegador e e-mail reais. Esta pendência substitui o teste antigo de hidratação da sessão persistida, pois a Story 1.2 removeu a autenticação de Zustand/localStorage.

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
