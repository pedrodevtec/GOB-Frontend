# Frontend CI — issue #41

Checks: `Quality gate` e `Critical dependency audit`, executados em PRs e pushes da main com Node 22, lockfile, lint, typecheck, testes, build e auditoria crítica. O workflow não usa secrets nem executa migrations/deploy. A integração Vercel existente pode gerar previews de PR independentemente desse workflow.

## Proteção ativa — 2026-09-21

Ruleset [main-quality-gates](https://github.com/pedrodevtec/GOB-Frontend/rules/23790598), ativo na branch padrão `main`:

- pull request obrigatório;
- `Quality gate` e `Critical dependency audit` obrigatórios, origem GitHub Actions;
- branch atualizada antes do merge;
- bloqueio de force push e exclusão;
- nenhum ator de bypass.

A proteção clássica estava desativada e recusou a criação. O ruleset foi salvo e confirmado como ativo.

## Evidências

- Main verde após #47: https://github.com/pedrodevtec/GOB-Frontend/actions/runs/35651166965
- Erro proposital de tipo faz Quality gate falhar: https://github.com/pedrodevtec/GOB-Frontend/actions/runs/35651851205
- Correção recupera ambos os checks: https://github.com/pedrodevtec/GOB-Frontend/actions/runs/35651995447
- PR temporária #48 usada para validar bloqueio de merge com checks obrigatórios; não deve ser mesclada.

## Limite

Esta CI não substitui a matriz E2E da #42. Integração PostgreSQL foi executada no backend pela PR pedrodevtec/Gob-Backend#28. Testes com frontend, navegador, duas abas e e-mail real continuam pendentes.
