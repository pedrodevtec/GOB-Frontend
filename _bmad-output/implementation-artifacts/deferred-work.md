- source_spec: `_bmad-output/implementation-artifacts/spec-1-2-auth-session.md`
  issue: `#42`
  summary: Executar a matriz E2E integrada do Épico 1 e da recuperação de senha.
  evidence: Login, rotação, revogação, logout, duas abas, Consentimento, retorno canônico e recuperação de senha possuem testes isolados, mas ainda não foram comprovados juntos com frontend, backend, PostgreSQL migrado, navegador e e-mail reais. Esta pendência substitui o teste antigo de hidratação da sessão persistida, pois a Story 1.2 removeu a autenticação de Zustand/localStorage.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-1-security-baseline.md`
  issue: `#41`
  summary: Automatizar instalação, lint, typecheck, testes, build e auditoria crítica em CI.
  evidence: As validações foram executadas nas histórias, mas o repositório ainda não possui um gate contínuo que impeça regressão do lockfile ou merge com verificação obrigatória falhando.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-1-security-baseline.md`
  issue: `#43`
  summary: Reauditar e tratar as vulnerabilidades residuais do frontend contra o lockfile atual.
  evidence: A fotografia da Story 1.1 registrou grupos altos em Axios, form-data, nanoid, PostCSS e Sharp. O backend chegou a zero vulnerabilidades em trabalho próprio, mas isso não comprova o estado atual do frontend; qualquer migração major permanece decisão separada.
