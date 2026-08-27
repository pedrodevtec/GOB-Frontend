# Reconciliation check — PRD versus panorama de mercado

**Data:** 2026-08-27
**Arquivos comparados:** `prd.md`, `addendum.md` e `research-market-landscape.md`.

Este check contém somente lacunas materiais e possíveis ampliações indevidas. Comparáveis servem para contextualizar expectativa e risco; não constituem especificação nem autorização para copiar funcionalidades.

## Expectativas e riscos relevantes omitidos

### MKT-1 — “Pesquisa Final” pode medir criação antes de medir jogo

O PRD permite responder a Pesquisa Final logo após a submissão, antes da aprovação e sem exigir uso do Personagem em uma sessão. Isso é adequado para avaliar onboarding e Builder, mas não sustenta, sozinho, conclusões sobre jogabilidade, compreensão em mesa, diversão ou equilíbrio. As práticas oficiais de D&D/Paizo consultadas solicitam feedback após leitura ou uso do material, e o digest recomenda separar métricas de fluxo das métricas de jogo.

**Risco:** resultados de UX da criação serem apresentados como evidência do playtest do RPG. O documento não explicita essa fronteira nem identifica qual instrumento/momento produzirá evidência de jogo.

### MKT-2 — Protocolo formativo insuficientemente definido

SM-1 a SM-3 citam três perfis e metas de conclusão/tempo, mas PRD e addendum não distinguem claramente observação comportamental, entrevista, logs e questionário, nem registram a tarefa real, hipótese e evidência por participante. A “validação integrada mínima” do addendum é predominantemente E2E técnica.

**Risco:** três execuções tecnicamente bem-sucedidas serem tratadas como validação de compreensão/autonomia sem evidência observacional comparável; opinião declarada e comportamento podem se misturar.

### MKT-3 — Mutabilidade do conteúdo de playtest não é comunicada ao Participante

O produto versiona Builder, configuração, Consentimento, Snapshot e Pesquisa, mas não há requisito equivalente para informar ao Participante que regras, conteúdo e artefatos do Piloto podem mudar entre rodadas. O PDF é descrito como fotografia local, porém a mesma expectativa não aparece de forma transversal no onboarding, Ficha e Perfil Público.

**Risco:** expectativa de permanência ou oficialidade sobre regra, nomenclatura ou Personagem criado em uma versão experimental, especialmente quando o artefato é compartilhado fora da plataforma.

### MKT-4 — Semântica temporal e revogação do compartilhamento permanecem indefinidas

FR-28 informa quais campos ficarão públicos e usa allowlist, mas a revogação é apenas uma premissa aberta. Também não fica explícito se um link mostra um snapshot aprovado ou acompanha alterações futuras, nem o efeito da revogação sobre URL, caches e materiais já baixados/compartilhados. O mercado demonstra que snapshot, vínculo vivo, cópia e revogação geram expectativas diferentes.

**Risco:** o Participante não conseguir prever a duração e a atualização da exposição, apesar de compreender o recorte inicial. Isso é particularmente sensível para backstory, identidade visual e indicação de IA.

### MKT-5 — Governança de IA visual cobre autoria, mas não direitos e semelhança pessoal

FR-26 exige ação explícita e identifica Retrato/Carta como arte pessoal gerada por IA; §8 impede seu uso editorial. Não aparecem limites sobre pedidos envolvendo pessoas reais, confirmação de direitos sobre eventual imagem de referência, consentimento para semelhança, tratamento de menores ou personagens/ativos protegidos.

**Risco:** gerar ou publicar imagem pessoal que viole direitos, privacidade ou políticas do provedor. A sensibilidade é material porque editoras e marketplaces oficiais do ecossistema variam entre divulgação obrigatória e proibição de IA.

### MKT-6 — Moderação de prompts e resultados visuais não está no modelo de risco

O PRD trata falha, timeout, custo, Cânone e vazamento de Segredo, mas não define o risco operacional de nudez, sexualização de menores, ódio, assédio ou violência gráfica em prompt/resultado/link público.

**Risco:** conteúdo abusivo tornar-se ativo persistente ou publicamente compartilhável, sem que “uso pessoal e não canônico” seja mitigação suficiente.

### MKT-7 — Tratamento por fornecedor e ciclo de vida de dados criativos estão incompletos

Há minimização forte de Analytics, mas isso não responde se prompts, narrativa e imagens são enviados a terceiros, retidos pelo fornecedor, usados para treinamento, armazenados pela plataforma ou excluídos a pedido. Consentimento é versionado, porém o PRD não liga a decisão de uso de IA a essas condições específicas.

**Risco:** interpretar “não entra em Analytics” como “não sai do produto” ou “não é retido”, criando surpresa de privacidade e lacuna de transparência.

### MKT-8 — Proveniência da saída de IA não acompanha explicitamente o artefato

A telemetria registra provedor/modelo/custo e o resultado visual recebe rótulo de IA, mas não está claro se Retrato, Carta e conteúdo textual aplicado preservam vínculo auditável com origem, data, versão e edição humana. A proveniência de decisões é citada de forma geral em §7.1, sem consequência testável para os artefatos públicos/baixáveis.

**Risco:** impossibilidade de responder a contestação, mudança de política externa ou necessidade de divulgação posterior sem correlacionar conteúdo público à geração que o originou.

### MKT-9 — Critério de “Personagem jogável” está implícito

A visão promete Personagem “jogável”, FR-12 valida a mecânica e FR-19 exige Ficha completa, mas não há definição observável que separe completude de formulário, validade mecânica, aprovação humana e uso bem-sucedido em sessão.

**Risco:** estados “completo”, “aprovado” e “jogável” serem usados como equivalentes, produzindo expectativa maior do que a evidência obtida pelo Piloto.

## Possível escopo indevidamente ampliado

### MKT-S1 — Geração visual foi elevada a compromisso do MVP sem evidência de necessidade no panorama

Retrato e Carta Jogável aparecem como JTBD, jornada, FR-26, downloads, métrica primária, operação e escopo obrigatório. O levantamento de mercado registra expectativa de representação visual, mas conclui explicitamente que não há evidência de que **geração de imagens** seja necessária ao MVP; também alerta para direitos, moderação, privacidade, custo e rejeição comunitária.

**Classificação:** ampliação de escopo se estiver sendo justificada pelo mercado. Pode permanecer como aposta autoral independente, mas o PRD atual a trata como resultado esperado antes de demonstrar que ela é necessária para validar a hipótese central de criação de Personagem.

### MKT-S2 — Um padrão genérico de compartilhamento virou três entregáveis específicos

O mercado sustenta a expectativa de compartilhar com escopo, autoridade e visibilidade claros. Ele não sustenta especificamente que o MVP precise combinar Perfil Público, composição para Story, compartilhamento nativo, Carta, Retrato e PDF. No PRD, esse conjunto ocupa FR-27 a FR-29, superfícies públicas, jornada e validação integrada.

**Classificação:** possível ampliação por solução. O risco de mercado relevante é a previsibilidade do compartilhamento, não a quantidade de canais ou formatos.

### MKT-S3 — Oferta pós-Piloto e monetização futura excedem o recorte de evidência

§9 e as questões abertas introduzem experiência gratuita pós-Piloto, gerações adicionais e possíveis ofertas de Mesa/personalização/conteúdo. O panorama apenas observa que plataformas deixam claro o que é gratuito, licenciado ou restrito; não fornece evidência para desenho de oferta de GOB.

**Classificação:** antecipação de estratégia, não requisito derivado do mercado atual. Se mantida no PRD do Piloto, há risco de decisões sobre aquisição/monetização competirem com a validação da hipótese central.

## Conclusão do check

As lacunas materiais concentram-se em três fronteiras: **criação versus jogo**, **compartilhamento inicial versus ciclo de vida da exposição** e **rótulo de IA versus governança completa de conteúdo/dados**. As ampliações potenciais decorrem de transformar sinais amplos de mercado — identidade visual, compartilhamento e acesso gratuito — em formatos e compromissos específicos de MVP sem evidência correspondente no levantamento.
