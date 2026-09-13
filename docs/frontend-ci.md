# Frontend CI — issue #41

Executa em PRs, pushes na main e por acionamento manual. Node 22 está definido em `.nvmrc`; instalação usa o lockfile com scripts automáticos desabilitados. O cache guarda downloads npm, não node_modules. Execuções antigas da mesma referência são canceladas.

Checks estáveis: `Quality gate` e `Critical dependency audit`. Não usam secrets, banco, migrations nem deploy. Actions fixadas por SHA e token com apenas leitura de conteúdo; não se utiliza pull_request_target.

## Ativação administrativa pendente

O YAML sozinho não impede merges. Após a primeira execução, o administrador deve configurar proteção/ruleset da main exigindo os dois checks acima, PR e branch atualizada. Não desabilitar proteções existentes. Essa configuração não foi alterada por esta entrega.

## Aceite ainda pendente

- Registrar execução verde no GitHub Actions.
- Em uma PR temporária, introduzir erro de lint/typecheck e comprovar check vermelho e merge bloqueado; corrigir o erro e verificar recuperação.
- Registrar configuração dos required checks.

O teste de rascunho é opcional enquanto a PR #45 estiver separada; após seu merge, o script existente também é executado. Esta CI não substitui a matriz integrada da issue #42. A auditoria bloqueia criticidade crítica e mantém os demais achados visíveis para #43. Erro de rede na auditoria também falha o job.
