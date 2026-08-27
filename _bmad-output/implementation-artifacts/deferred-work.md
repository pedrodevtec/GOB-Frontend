- source_spec: `_bmad-output/implementation-artifacts/spec-1-1-security-baseline.md`
  summary: Adicionar teste de integração para hidratação da sessão persistida em `useAuthStore` e `AuthBootstrap`.
  evidence: O repositório não possui harness de testes de aplicação; lint, typecheck, build e smoke público não exercitam a reidratação browser de uma sessão autenticada após upgrades de React/Zustand.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-1-security-baseline.md`
  summary: Automatizar instalação, build e auditoria crítica em CI para impedir regressão do baseline de dependências.
  evidence: A Story 1.1 valida os comandos nesta execução, mas o repositório ainda não possui workflow que os execute a cada alteração futura do lockfile.

- source_spec: `_bmad-output/implementation-artifacts/spec-1-1-security-baseline.md`
  summary: Tratar as vulnerabilidades altas restantes em Axios, form-data, nanoid, PostCSS e Sharp numa história própria.
  evidence: A auditoria de produção passou no gate crítico, porém reportou cinco grupos de severidade alta; o PostCSS embarcado no Next 15 exige migração para Next 16 segundo o fix sugerido pelo npm, mudança proibida no escopo aprovado desta história.
