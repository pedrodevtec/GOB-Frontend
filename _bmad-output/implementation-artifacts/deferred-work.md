- source_spec: `_bmad-output/implementation-artifacts/spec-1-2-auth-session.md`
  issue: `#42`
  status: `pending`
  summary: Executar a matriz E2E integrada do Épico 1 e da recuperação de senha.
  evidence: Login, rotação, revogação, logout, duas abas, Consentimento, retorno canônico e recuperação de senha possuem testes isolados, mas ainda não foram comprovados juntos com frontend, backend, PostgreSQL migrado, navegador e e-mail reais. Em 2026-09-21, os runners de sessão, consentimento/membership e rascunho passaram com PostgreSQL 16 descartável e migrations reais na PR pedrodevtec/Gob-Backend#28 (run 35653603598); isso não comprova o E2E com browser/e-mail. Esta pendência substitui o teste antigo de hidratação da sessão persistida, pois a Story 1.2 removeu a autenticação de Zustand/localStorage.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-1-security-baseline.md`
  issue: `#41`
  status: `resolved`
  summary: Checks obrigatórios ativados em 2026-09-21 — exigir os checks `Quality gate` e `Critical dependency audit` na proteção da `main`.
  evidence: O workflow contínuo foi mesclado pela PR #46 e já executa instalação limpa, lint, typecheck, testes, build e auditoria crítica. Em 2026-09-21 o ruleset main-quality-gates (23790598) foi ativado: PR, ambos os checks do GitHub Actions, branch atualizada e nenhum bypass. Testes negativo e de recuperação executados na PR temporária #48; ver docs/frontend-ci.md.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-1-security-baseline.md`
  issue: `#43`
  status: `resolved`
  summary: Reauditar e tratar as vulnerabilidades residuais do frontend contra o lockfile atual.
  evidence: Em 2026-09-13, a auditoria partiu de 14 ocorrências na árvore completa e 7 em produção. Atualizações compatíveis corrigiram Axios, form-data, follow-redirects, nanoid, Sharp e ferramentas de desenvolvimento; o PostCSS interno do Next 15 foi fixado na mesma versão segura declarada pelo projeto por meio de override. `npm audit` e `npm audit --omit=dev` passaram com zero vulnerabilidades, assim como lint, typecheck, quatro suítes de teste e build. A migração para Next 16 não foi necessária e continua fora deste escopo.
