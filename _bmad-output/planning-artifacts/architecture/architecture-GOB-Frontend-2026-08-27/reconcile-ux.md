# Reconciliação independente — UX × Arquitetura

Data: 27 de agosto de 2026.

## Escopo e veredito

Fontes confrontadas: `DESIGN.md`, `EXPERIENCE.md` e `ARCHITECTURE-SPINE.md` da mesma rodada BMAD.

O Architecture Spine cobre corretamente as decisões estruturais centrais: camadas, backend como fonte de verdade, separação entre remoto e local, normalização de transporte, idempotência, identidade/configuração do Personagem, concorrência de revisão e fronteiras mínimas de IA/publicação. A reconciliação encontrou **seis seams parciais** e **três seams sem dono explícito** que podem fazer implementações compatíveis com o spine divergirem da experiência aprovada.

Nenhuma decisão puramente estética precisa virar AD. Paleta, tipografia, raios, textura, densidade ornamental e composição permanecem governados por `DESIGN.md` e pelos componentes.

## Matriz de cobertura

| Contrato UX | Cobertura no spine | Veredito |
|---|---|---|
| Camadas e direção de dependência | Paradigma + AD-1, AD-3 e AD-4 | Coberto. |
| Backend governa jornada, autorização e configuração | AD-2, AD-6 e convenção de autorização | Coberto. |
| Idempotência, navegação após persistência e cache coerente | AD-5 e convenção de consultas/mutações | Coberto. |
| Snapshot, `expectedRevision`, `409` e autoridade contextual | AD-7 | Coberto. |
| `journeyState`/`nextRoute` e retomada | AD-2 + mapa de entrada | Parcial: falta dono do catálogo, normalização e recuperação terminal. |
| Estado técnico traduzido em linguagem humana | `lib/campaign` no Structural Seed; erros na convenção | Parcial: não há contrato para labels/fallbacks e estados transversais. |
| Ficha canônica compartilhada | AD-6 + mapa Builder/Ficha | Parcial: não fixa um renderer/modelo de apresentação único. |
| Configuração antiga indisponível | AD-6 preserva versão | Parcial: não define recuperação somente leitura/migração explícita. |
| Ciclo de IA com decisão humana | AD-8 | Parcial e ambíguo: fronteira de persistência e máquina de decisão não estão precisas. |
| Artefatos, Perfil Público e Story | AD-8 + mapa | Parcial: ciclos independentes foram agrupados sem seams próprios. |
| Falhas periféricas | AD-8 | Parcial: princípio existe, mas não há dono de retry/estado de disponibilidade por variante. |
| Acessibilidade, foco, anúncios e movimento reduzido | Somente UX como fonte/companion | Sem dono arquitetural explícito. |
| Responsividade e paridade funcional móvel | Não mapeada | Sem dono arquitetural explícito. |
| Rotas/shells e escopo visível reduzido | Mapa amplo + convenção `(public)` | Sem seam explícito para exposição de rota/menu por público. |

## Achados que exigem disposição arquitetural

### UX-A1 — Recuperação de jornada não possui contrato completo

**Evidência UX:** `journeyState` e `nextRoute` são canônicos; estado ausente, `BLOCKED`, `LEGACY_REVIEW`, falha de `resume` ou ausência de `nextRoute` devem terminar em experiência recuperável, sem loop nem inferência. Rota incompatível precisa voltar à etapa permitida, preservando `returnTo` apenas interno.

**Spine atual:** AD-2 define a fonte de verdade e o mapa aponta para `lib/routing`/`lib/campaign`, mas não define:

- quem normaliza estados desconhecidos e `nextRoute` ausente;
- quem detecta e interrompe loop de redirecionamento;
- qual seam entrega um estado terminal recuperável em vez de loader permanente;
- como `LEGACY_REVIEW` impede o CTA atual de apontar de volta a uma guarda incompatível.

**Disposição recomendada:** atribuir a `lib/campaign` a normalização do contrato de retomada e a `lib/routing` a decisão pura `estado + rota atual → permitir | redirecionar | bloquear`. A UI de guarda apenas executa o resultado e renderiza o estado transversal. Registrar o comportamento terminal para estado/rota ausentes e proteção contra loop. Isso complementa AD-2; não muda a autoridade do backend.

### UX-A2 — Estados humanos e estados transversais não têm proprietário

**Evidência UX:** loading, sessão expirada, acesso negado, erro recuperável, vazio, bloqueado, somente leitura, validação, processamento, sucesso, `409` e falha periférica possuem semânticas diferentes. Enum técnico nunca chega ao Participante; desconhecido usa fallback humano; erro não vira vazio e falha não vira zero.

**Spine atual:** a convenção de erros trata `401`, `409` e falha de infraestrutura, mas não define a fronteira entre normalização de domínio, mensagem humana e componente transversal. `lib/campaign` aparece apenas como “leitura compartilhada da jornada”.

**Disposição recomendada:** manter códigos/causas normalizados no service/mapper e concentrar tradução de estado funcional em helpers de domínio; componentes transversais recebem uma variante semântica, título, descrição e ações já permitidas. Não colocar microcopy dentro de `lib/api`, nem interpretar erro bruto em cada tela. Incluir fallback humano para valores desconhecidos.

### UX-A3 — Ficha canônica está mapeada, mas não está fixada como seam reutilizável

**Evidência UX:** Revisão, Meu Personagem e Conclusão reutilizam os mesmos rótulos e valores. Estados editável/somente leitura e faltantes mudam a interação, não a semântica da Ficha. Perfil da conta e Perfil do Personagem são entidades visuais e funcionais distintas.

**Spine atual:** AD-6 garante identidade/configuração e o mapa agrupa Builder/Ficha, porém permite que cada superfície monte sua própria projeção e rotulagem.

**Risco:** três representações divergentes, campos omitidos em uma rota, labels diferentes e artefato/PDF construído de shape bruto.

**Disposição recomendada:** declarar um modelo de apresentação canônico produzido por mapper de domínio e um renderer de Ficha reutilizado pelas superfícies. Revisão, consulta e conclusão passam apenas modo, ações e estado; PDF recebe a mesma projeção permitida, com seu adaptador de paginação. O DTO público continua separado e allowlisted.

### UX-A4 — Recuperação de `builderConfigVersion` retirada está incompleta

**Evidência UX:** Personagem existente mantém a versão vinculada. Se ela estiver indisponível, o Rascunho abre em recuperação somente leitura; edição/submissão só voltam após restauração exata ou migração explícita, auditável e confirmada pelo Participante.

**Spine atual:** AD-6 proíbe migração silenciosa, mas não atribui dono ao estado de configuração ausente nem ao contrato de migração.

**Disposição recomendada:** o service/mapper do Builder deve representar configuração como união explícita (`available`/`unavailable`), nunca como objeto parcialmente preenchido ou fallback para a ativa. Hook e guarda do Builder bloqueiam mutação no segundo caso. Migração é uma mutação backend distinta, versionada e confirmada; não é PATCH do Rascunho nem fallback de frontend.

### UX-A5 — “Gerar nunca persiste” é ambíguo e o ciclo da IA ficou sem máquina de estado

**Evidência UX:** gerar uma sugestão não aplica nem persiste seu conteúdo na Ficha. Contudo, sugestão, telemetria, decisão e artefato possuem registros/proveniência no backend. Sugestões permitem aceitar, editar, descartar e desfazer local antes de persistir; a proposta mecânica possui cinco blocos independentes; resposta parcial e `409` têm recuperação própria.

**Spine atual:** AD-8 diz “gerar nunca persiste”, o que pode ser lido como proibição de persistir a entidade Suggestion, uso/custo ou o artefato gerado. Também não fixa o dono dos estados `generated → local decision/application → persisted decision` nem do gate dos cinco blocos.

**Disposição recomendada:** corrigir semanticamente a regra para “gerar nunca altera a Ficha nem confirma decisão automaticamente”. Modelar separadamente:

1. registro/proveniência da geração e telemetria;
2. proposta recebida e estado local editável/desfazível;
3. decisão `ACCEPTED | EDITED | DISCARDED` persistida;
4. PATCH explícito da Ficha;
5. gate local dos cinco blocos mecânicos antes do PATCH.

O service normaliza resposta parcial e conflito; o hook coordena sequência/cache; componente não grava decisão por efeito de renderização.

### UX-A6 — Artefatos e publicação foram agrupados além do limite útil

**Evidência UX:** quatro dimensões são independentes: participação concluída, aprovação, disponibilidade de Retrato/Carta e elegibilidade/publicação do Perfil Público. `PORTRAIT` e `PLAYABLE_CARD` têm limites próprios. Perfil exige Snapshot aprovado + opt-in; revogação/perda de elegibilidade invalida o link e caches controlados; nova aprovação exige novo opt-in. Story depende de Perfil ativo no mesmo Snapshot. PDF é fotografia local, não documento oficial.

**Spine atual:** AD-8 protege a fronteira e o mapa indica `features/mvp`, mas não atribui seams aos ciclos de artefato, publicação e share. “Falha de PDF” aparece junto a falhas remotas, embora o PDF atual seja gerado no navegador.

**Disposição recomendada:** manter uma feature compartilhada apenas se ela expuser três contratos separados:

- **artefatos:** disponibilidade por variante, geração, galeria, proveniência, download/retry;
- **publicação:** elegibilidade, allowlist, opt-in, snapshot publicado, revogação/invalidação;
- **share:** prévia e compartilhamento nativo com fallback de download, condicionado ao perfil/snapshot.

PDF permanece adaptador cliente da Ficha canônica e não participa da transação de geração remota. Falha em qualquer contrato não altera a conclusão nem a Ficha.

### UX-A7 — Acessibilidade não tem seam transversal nem gate verificável

**Evidência UX/Design:** WCAG 2.2 AA; teclado completo; landmarks/skip link; alvo 44 × 44; foco visível e restaurado; foco no primeiro erro; associação label/descrição/erro; anúncios dinâmicos; zoom 200%; `prefers-reduced-motion`; alt útil; nenhuma informação apenas por cor. `DESIGN.md` já verifica contrastes dos tokens e define limitações de uso.

**Spine atual:** não há regra, convenção, componente/provedor ou capability map para acessibilidade. Citar `EXPERIENCE.md` como source não define onde futuros builders implementam nem como a matriz E2E comprova.

**Disposição recomendada:** criar convenção transversal (não AD estética) que atribua:

- `components/` aos primitivos acessíveis, estado transversal, diálogo/foco e progressão;
- layouts em `app/` aos landmarks, skip link e ordem estrutural;
- componentes de formulário ao vínculo de erro e foco após validação;
- camada de movimento a um único mecanismo de preferência reduzida;
- validação a testes automatizados de semântica/teclado onde possível e roteiro real de leitor de tela, zoom e mobile.

Tokens de cor, tipografia e forma continuam em `DESIGN.md`; apenas os limites funcionais entram na arquitetura.

### UX-A8 — Responsividade possui regra de produto, mas nenhum dono de composição/teste

**Evidência UX:** paridade funcional do Participante entre 320 px e desktop; retomada entre dispositivos; safe area/teclado virtual; admin crítico operável em tela pequena; nada depende de hover; share/download testados em aparelho real.

**Spine atual:** Tailwind está na stack, mas não há convenção de composição responsiva nem gate. Uma dependência de CSS não garante ordem DOM, foco, safe area ou paridade.

**Disposição recomendada:** registrar como convenção de UI: mobile-first; DOM segue leitura independentemente do grid; segunda coluna é apoio removível; ações fixas usam safe-area e cedem ao teclado; tabela reduz a colunas essenciais + detalhe, sem infinite scroll. Vincular a validação a 320/360/375 px, zoom 200% e dispositivo real. Não transformar breakpoints ou estética em AD.

### UX-A9 — Exposição de rotas e menus não possui seam explícito

**Evidência UX:** visitante, Participante e Administrador possuem shells distintos; somente a landing da campanha é pública dentro do fluxo; próxima ação do Participante é canônica; menus legados e CTAs futuros permanecem ocultos; Admin só “visualiza como participante” por ação explícita.

**Spine atual:** AD-2/convenção de autorização protegem decisão backend e reconhecem `(public)` como estrutural, mas o mapa não fixa quem governa a superfície visível. Rotas em `app/` e componentes de navegação podem divergir independentemente sem violar uma AD atual.

**Disposição recomendada:** centralizar por shell uma allowlist de entradas visíveis e separar três decisões: rota existe, rota é acessível, rota aparece na navegação. `lib/routing` resolve acesso/retomada; layouts/shells consomem um modelo de navegação por público; feature não injeta CTA global. Isso preserva rotas legadas no código sem reintroduzi-las no Piloto.

## Pontos já corretamente resolvidos — não duplicar

- Não criar uma nova AD para “backend é fonte de verdade”: AD-2 já cobre.
- Não criar nova AD para React Query versus Zustand: AD-3 já cobre.
- Não repetir idempotência, invalidar cache ou “não navegar antes de persistir”: AD-5 já cobre.
- Não repetir `Character.id`, `builderConfigVersion` e PATCH parcial: AD-6 já cobre; somente adicionar o caminho de configuração indisponível.
- Não repetir Snapshot/`expectedRevision`/`409`/autorrevisão: AD-7 já cobre.
- Não criar AD para cores, fontes, sombras, raios, papel, ilustração ou breakpoints específicos. Esses contratos pertencem a `DESIGN.md` e ao sistema de componentes.
- Não incluir combate, sessão, Crônica, espectador, criação de Mesas ou menus legados: permanecem fora do escopo.

## Gate de fechamento sugerido

O spine pode ser finalizado do ponto de vista UX quando cada achado acima tiver uma destas disposições registradas: incorporado em AD/convenção/mapa; explicitamente diferido com responsável e gate; ou rejeitado por conflito documentado. Antes do Piloto externo, a evidência mínima ainda precisa cobrir:

- `BLOCKED`, `LEGACY_REVIEW`, estado ausente, `nextRoute` ausente e proteção contra loop;
- sessão expirada/revogada e `401/403` vigentes;
- configuração antiga indisponível e migração explícita;
- ciclo completo de sugestão/decisão/PATCH e falha de IA;
- variantes de artefato, opt-in/revogação/perda de elegibilidade e Story no mesmo Snapshot;
- teclado, foco, leitor de tela, contraste, zoom, movimento reduzido, 320 px e dispositivo real.

Sem essas disposições, o spine ainda permite implementações estruturalmente conformes, porém incompatíveis com a experiência final aprovada.
