# Check de reconciliação de regras — PRD + addendum

Data: 2026-08-27
Comparados: `prd.md`, `addendum.md` e `reconcile-domain-rules.md`.

## 1. Regra de leitura deste check

Para este documento, decisões explícitas mais recentes de `prd.md` e `addendum.md` prevalecem sobre a reconciliação anterior. O arquivo `reconcile-domain-rules.md` continua útil como rastreio dos manuais e contratos consultados, mas não deve reintroduzir uma decisão que o PRD já superou.

Classificação:

- **Superado:** divergência histórica já decidida; não é gap do PRD.
- **Conflito:** duas afirmações vigentes não podem ser verdade ao mesmo tempo.
- **Gap:** decisão ou critério necessário ainda não está fechado/testável.
- **Alinhado:** regra relevante coberta de modo suficiente.

## 2. Decisões superadas pela versão atual

| Tema | Reconciliação anterior | Decisão vigente | Resultado |
|---|---|---|---|
| Perguntas do Episódio 1 | Eram portão de submissão | FR-5, FR-9 e addendum §6 determinam que não integram o Builder nem bloqueiam submissão | **Superado.** Remover esse portão de histórias, contratos e testes novos; não tratar como gap a restaurar |
| Autoridade de aprovação no Piloto | Apenas `MASTER` revisava/aprovava | FR-22 dá ao Administrador do Piloto autoridade específica de revisão; o futuro Mestre aprova dentro da própria Mesa | **Superado no Piloto.** `ADMIN` continua sem implicar `MASTER`; a autorização administrativa precisa de escopo/backend próprios |
| Quantidade de artefatos visuais | Uma geração de carta por Personagem, sem variante assegurada | FR-26 e §6.1 definem um Retrato e uma Carta Jogável, cada variante com limite/disponibilidade do backend | **Superado.** A unidade vigente é uma por variante, não uma carta total |
| Retry visual | Não prometer retry sem contrato | FR-26 permite nova tentativa somente quando o contrato autorizar; regenerações extras/compra ficam fora do MVP | **Compatibilizado.** Retry técnico autorizado não equivale a geração extra comercial |
| Operação `ADMIN` | Painel administrativo limitado a agregados | PRD separa funil/telemetria de uma superfície de revisão específica | **Refinado.** Analytics continua sem conteúdo criativo; o snapshot só aparece no contexto autorizado de revisão |

## 3. Regras alinhadas

O PRD e o addendum cobrem adequadamente:

- pessoa atual como centro da criação; Alma e Arquétipo influenciam sem controlar;
- 12 pontos de Atributos separados da hipótese de 10 Pontos de Essência/Ecos;
- Legados, Ecos, nomes e histórias permanecem não canônicos até decisão do Product Owner;
- configuração do Builder versionada por Personagem, sem migração silenciosa;
- `Character.id` como identificador canônico e PATCH parcial que não apaga capítulos incompletos;
- IA opcional, acionada pelo Participante, limitada a contexto autorizado e no máximo uma pergunta complementar;
- aceitar, editar ou descartar com decisão auditável e aplicação explícita separada;
- nenhuma criação de regra ou Cânone pela Proposta Mecânica;
- caminho manual íntegro quando IA, e-mail, geração visual ou download falham;
- Snapshot imutável, pedido de ajustes, ressubmissão e aprovação humana;
- distinção entre `ADMIN` global, Administrador do Piloto e `MASTER` contextual;
- estado “Ativo” antigo não adicionado ao enum de Ficha;
- Retrato/Carta como arte pessoal de IA, não oficial nem canônica; arte editorial oficial continua humana;
- Segredo do Mestre, prompt integral, Ficha/narrativa completa, respostas da Pesquisa Final, tokens e credenciais fora de payload público e Analytics;
- PDF como fotografia local legível, não documento oficial imutável;
- revisão jurídica do Consentimento externo mantida como questão aberta;
- autoaprovação do revisor corretamente marcada como premissa dependente de contrato/E2E.

## 4. Gaps e conflitos restantes

### G1 — Contrato de autorização da revisão administrativa do Piloto

**Severidade:** alta
**Evidência:** FR-22 autoriza o Administrador do Piloto; addendum §3 afirma que o Piloto usa operação administrativa; a reconciliação anterior e os contratos de Mesa conhecidos associavam revisão a `MASTER`.

**Gap:** falta registrar qual permissão/endpoint do backend concede ao Administrador do Piloto acesso à fila, Snapshot, pedido de ajustes e aprovação sem transformá-lo em Mestre da Mesa. Também falta a matriz de `401/403` para separar:

- `ADMIN` fora do Piloto;
- Administrador autorizado para a campanha preparada;
- `MASTER` de outra Mesa;
- dono do Personagem;
- tentativa de autoaprovação.

**Disposição:** decisão de produto está fechada; mecanismo contratual e prova E2E continuam pendentes.

### G2 — Pesquisa Final está decidida e simultaneamente aberta

**Severidade:** média
**Evidência:** FR-24 afirma que a Pesquisa pode ser respondida ou atualizada após submissão, inclusive antes da aprovação; FR-21 preserva a resposta durante ressubmissão; a questão aberta 8 pergunta se ela pode ser editada enquanto o Piloto estiver ativo e permanecer antes da aprovação.

**Conflito interno:** o requisito já compromete mutabilidade e posição temporal, mas a seção de questões em aberto ainda trata ambos como indecisões.

**Disposição recomendada:** considerar vigente o comportamento de FR-24 — uma resposta por usuário/campanha, atualizável enquanto a campanha permitir — e manter aberta somente a política exata de encerramento/bloqueio, caso ainda não esteja contratada.

### G3 — Evento que libera Retrato e Carta Jogável

**Severidade:** alta
**Evidência:** UJ-4 descreve geração após aprovação; FR-26 diz “após a etapa definida pelo backend”; a questão aberta 6 admite submissão, Pesquisa Final, aprovação ou combinação.

**Conflito:** a jornada promete uma sequência específica que o requisito e a questão aberta ainda não confirmam.

**Disposição necessária:** escolher um único portão de produto e fazê-lo coincidir em UJ-4, FR-26, estado de retomada e contrato. Até lá, histórias não devem codificar “após aprovação” nem “após pesquisa” por inferência.

### G4 — Consentimento cobre aceite, mas não recusa/revogação

**Severidade:** alta, privacidade
**Evidência:** FR-3 especifica consulta e aceite; FR-4 exige participação ativa; a reconciliação registra estados `ACCEPTED`, `DECLINED` e `REVOKED` e dados auditáveis.

**Gap:** não há comportamento funcional para recusar ou revogar, nem definição do efeito sobre membership, Rascunho, Pesquisa, Perfil Público, links e retenção. Isso é diferente da premissa de revogar apenas o Perfil Público.

**Disposição necessária:** decidir se recusa/revogação faz parte do MVP. Se sim, criar requisito e transições; se não, declarar explicitamente fora do escopo e não expor controle sem contrato.

### G5 — Termos e privacidade aparecem como superfícies, não como requisito verificável

**Severidade:** média
**Evidência:** §8.3 lista termos e privacidade entre superfícies públicas; FR-3 cobre apenas Consentimento.

**Gap:** faltam critérios para acesso sem autenticação, versão/conteúdo aprovado, indisponibilidade e vínculo entre versões legais e o aceite. A questão jurídica 13 não substitui um requisito funcional de apresentação.

**Disposição necessária:** adicionar rastreabilidade funcional em histórias/arquitetura sem presumir que o texto operacional atual recebeu revisão jurídica externa.

### G6 — Escopo de dados do Administrador está ambíguo

**Severidade:** alta, privacidade
**Evidência:** FR-31 permite “dados pessoais e Ficha completa” quando necessários/autorizados; FR-20 limita o revisor ao Snapshot e dados necessários; FR-30/FR-33 e a reconciliação limitam operação/Analytics a agregados técnicos.

**Gap:** “quando necessários” não é uma allowlist testável. Uma implementação pode reutilizar payload de revisão na lista/funil e ampliar acesso indevidamente.

**Disposição necessária:** separar contratos e allowlists por superfície:

- lista/funil: identificação e estado mínimos;
- revisão: Snapshot e feedback do Personagem selecionado;
- telemetria: metadados técnicos sem conteúdo;
- legado: somente campos necessários à adaptação/exclusão auditada.

### G7 — Perfil Público e Story avançam além da reconciliação/contratos registrados

**Severidade:** alta, contrato e privacidade
**Evidência:** FR-28 e FR-29 colocam Perfil Público e Story no MVP; a reconciliação anterior não registra contrato de publicação, allowlist, revogação ou lifecycle de URL.

**Gap:** ainda faltam contrato e decisões para:

- campos exatos permitidos e sua proveniência no Snapshot aprovado;
- opt-in explícito e estado inicial privado;
- URL não enumerável e resposta após revogação;
- efeito de ajustes/reprovação posterior ou nova revisão;
- cache/indexação e expiração de links;
- confirmação de que Story não incorpora dados fora da allowlist.

**Disposição:** a capacidade é decisão de produto; revogação segue marcada como premissa e não pode ser considerada pronta sem backend/E2E.

### G8 — Regras mecânicas vigentes estão parcialmente implícitas

**Severidade:** média
**Evidência:** FR-12 fixa 12 pontos, Vigor/Espírito e origem versionada de catálogos, mas não explicita os fatos operacionais documentados de três Treinamentos, limite inicial de atributo, nem recursos derivados PV/EN/PA/Iniciativa.

**Gap:** não está claro se recursos derivados e respectivos cálculos continuam dentro da Ficha do MVP ou foram conscientemente retirados. “Respeita limites” é testável apenas se a história referenciar a configuração/contrato exatos.

**Disposição necessária:** manter os números dinâmicos no backend, mas registrar no addendum/histórias quais campos do contrato `pilot-v1` precisam ser renderizados e validados. Se PV/EN/PA/Iniciativa não fizerem parte desta fatia, declará-los fora do escopo em vez de omiti-los silenciosamente.

### G9 — Critério de aprovação narrativa não está suficientemente testável

**Severidade:** média
**Evidência:** FR-20 e FR-22 definem acesso e decisão, mas o checklist reconciliado também exige coerência com Contexto Público, identidade própria, configuração/versão, mecânicas, equipamentos, consentimentos e origem/decisão da IA.

**Gap:** o PRD mede se o revisor decide sem reconstruir a Ficha, mas não define o conjunto mínimo de sinais que a revisão deve apresentar. Aprovação também não esclarece se comentário é opcional ou obrigatório; pedido de ajustes exige comentário.

**Disposição necessária:** levar o checklist para critérios de história/UX da fila, sem transformar julgamento narrativo em decisão automática da IA.

### G10 — Preparação do prompt e governança da geração visual ficaram sem destino

**Severidade:** média
**Evidência:** a reconciliação registra consulta/preparação do prompt antes da geração; FR-26 cobre geração, limites, classificação e falha, mas não diz se o Participante revisa o briefing/prompt permitido.

**Gap:** não está decidido se preview é requisito do MVP ou apenas capacidade brownfield. Também faltam regras explícitas de moderação, retenção, remoção e tratamento de geração que contradiga a Ficha ou inclua elemento indevido.

**Disposição necessária:** preservar preview/proveniência em histórias se ele continuar parte do produto; caso contrário, deprecar explicitamente. Nunca expor prompt integral interno, Segredo do Mestre ou contexto de outros usuários.

### G11 — “Ficha canônica” pode ser confundida com Cânone narrativo

**Severidade:** baixa, semântica
**Evidência:** Glossário define Ficha como representação “canônica”; FR-14 fala em revisão canônica; Cânone é também termo controlado para fatos oficiais/da Mesa.

**Risco:** uma Ficha aprovada pode ser entendida como oficialização de toda afirmação narrativa ou do Personagem no universo oficial.

**Disposição recomendada:** interpretar “canônica” em FR-14 como **representação única/consistente da Ficha**, não como Cânone do universo. Em histórias e UX, preferir “Ficha de referência” ou “representação única”.

## 5. Itens que não são gaps

- A ausência das quatro perguntas do Episódio 1 é intencional e vigente.
- “Ativo” não precisa ser novo `sheetStatus`; estados funcionais de jornada cobrem a experiência sem alterar o enum.
- Legado/Ecos/Essência não precisam entrar na Ficha atual enquanto continuarem hipóteses e fora da configuração ativa.
- Valor de Defesa não deve ser inventado antes do catálogo aprovado; a questão aberta 4 é a postura correta.
- Retrato e Carta não precisam desbloquear criação, submissão, aprovação ou conclusão.
- Regenerações extras, compra de gerações, arte física e ilustração oficial por IA continuam fora do MVP.
- O fato de o Administrador revisar o Piloto não permite usar payload de revisão em Analytics nem lhe concede autoridade sobre outras Mesas.

## 6. Ordem sugerida de fechamento

1. Fechar contrato/autorização da revisão administrativa e matriz `401/403` (G1).
2. Escolher o portão de Retrato/Carta e alinhar UJ-4/FR-26/estado (G3).
3. Definir consentimento revogado/recusado e allowlists de operação/perfil (G4, G6, G7).
4. Limpar a contradição da Pesquisa Final (G2).
5. Confirmar escopo mecânico e checklist de revisão (G8, G9).
6. Decidir preview e governança da arte gerada (G10).
7. Ajustar a ambiguidade terminológica de “Ficha canônica” (G11).

## 7. Conclusão

O núcleo de domínio do PRD está coerente com as decisões recentes: autonomia do Participante, IA assistiva, configuração versionada, aprovação humana, separação de papéis, privacidade e arte pessoal não canônica. Os bloqueios reais não estão mais nas perguntas do Episódio 1 nem na quantidade de artefatos; concentram-se em contrato de autoridade do Administrador do Piloto, portão dos artefatos, lifecycle de consentimento/perfil público e allowlists de dados.
