# Check de cobertura — PRD/Addendum versus UX e Fundação Visual

Data: 2026-08-27
Documentos comparados: `prd.md`, `addendum.md` e `reconcile-ux-visual.md`.
Escopo: cobertura confirmada e gaps de tom, acessibilidade, visual, compartilhamento e mobile. Este check não altera os documentos comparados.

## 1. Resultado executivo

O PRD cobre de forma forte a jornada centrada no Personagem, narrativa antes da mecânica, retomada por estado, IA subordinada à decisão humana, ficha canônica, navegação reduzida, artefatos e privacidade por allowlist. O addendum preserva corretamente os mecanismos brownfield e a necessidade de E2E real.

Ainda não há cobertura suficiente para declarar o conjunto UX/visual fechado. Os gaps mais relevantes são:

1. acessibilidade está registrada como `[ASSUMPTION]`, sem critérios operacionais completos nem plano de validação;
2. a direção light-first aparece como direção atual, mas continua aberta na questão 14, sem decisão vinculante sobre tokens, tipografia e marca;
3. compartilhar um Personagem aprovado não está inequivocamente separado de publicar o Perfil Público por opt-in persistido;
4. o consentimento de compartilhamento por vínculo/campo não entrou no PRD;
5. mobile tem apenas uma exigência transversal genérica, sem matriz de dispositivos, reflow, teclado virtual, safe areas ou critérios das ações críticas;
6. o tom está bem definido, mas não há critério de aceite para ortografia, caracteres corrompidos e glossário aplicado à UI.

## 2. Cobertura confirmada

| Área | Cobertura no PRD/Addendum | Avaliação |
|---|---|---|
| Personagem no centro e RPG antes de formulário | Visão, UJ-1/UJ-2, FR-9 a FR-14, risco “preenchimento burocrático” e §8.1 | Confirmada |
| Narrativa antes da mecânica | Visão, FR-9, FR-10, FR-12 e descrição do Builder | Confirmada |
| Jornada progressiva, retomável e governada pelo backend | FR-2, FR-6, FR-7, FR-8, FR-13; addendum §§2–5 | Confirmada |
| Separação Participante/Admin/Mestre | JTBD, FR-20 a FR-22, FR-30 a FR-34 e addendum §3 | Confirmada |
| Ficha canônica | Glossário, FR-14 e FR-27 | Confirmada |
| IA opcional e caminho manual | Visão, UJ-2, FR-15, FR-16, FR-17 e SM-7 | Confirmada |
| Aceitar, editar, descartar e desfazer | Glossário de Sugestão de IA e FR-16 | Confirmada |
| Proposta mecânica por blocos | Glossário e FR-17 | Confirmada |
| Contexto permitido e telemetria sem conteúdo criativo | FR-15, FR-18, §7.1 e SM-9 | Confirmada |
| Navegação reduzida | FR-34, §6.1 e §8.3 | Confirmada |
| PDF local como fotografia, não documento oficial | FR-27 e §6.2 | Confirmada |
| Retrato e Carta Jogável por ação explícita | FR-26 e FR-27 | Confirmada |
| Perfil Público por allowlist | Glossário, FR-28 e §7.1 | Confirmada |
| Story sem publicação automática e com fallback | FR-29 | Confirmada |
| Movimento reduzido e ausência de dependência de hover | §7.2 e §8.1 | Coberta como requisito, ainda não validada |
| E2E integrado, Network e Analytics | SM-5 e addendum §5 | Confirmada como obrigação pendente |

## 3. Gaps de tom e conteúdo

### Coberto

- `TON-01`: §8.2 exige português claro, acolhedor e direto; §8.1 afasta painel SaaS genérico e interface sombria ilegível.
- `TON-02`: Visão, FR-15 a FR-18 e §8.2 deixam claro que IA ajuda, Participante decide e pessoa autorizada aprova.
- O Glossário dá uma base sólida de termos controlados.

### Parcial ou ausente

| Gap | Impacto | Inclusão recomendada |
|---|---|---|
| Não há critério de aceite “zero texto visível sem acentuação, mojibake ou caractere corrompido” | O código atual contém ocorrências em superfícies centrais | Adicionar consequência testável de revisão editorial em todas as rotas do Piloto |
| O Glossário existe, mas não há exigência de varredura da UI contra ele | Termos como ajuda criativa/IA, Carta/Retrato e Perfil/Ficha podem divergir | Exigir inventário de microcopy e uso consistente dos termos controlados |
| “RPG antes de dashboard” está implícito, não operacionalizado | Subtítulos e linguagem corporativa podem voltar sem violar FR | Proibir “dashboard” e jargão técnico na experiência do Participante, salvo nome administrativo necessário |
| A fundação também dizia “não parecer cassino” e “não decorar sem função” | Ornamentação/recompensa pode derivar para linguagem promocional | Registrar como guardrail visual/editorial em §8.1 |

## 4. Gaps de acessibilidade

O maior problema é de força normativa: §7.2 declara WCAG 2.2 AA, teclado, zoom, foco e movimento reduzido como `[ASSUMPTION]`. Isso reconhece a meta, mas não cria aceite verificável nem cobertura no addendum §5.

| Requisito da reconciliação | Cobertura atual | Gap |
|---|---|---|
| Contraste 4,5:1 normal e 3:1 grande/gráfico essencial | “WCAG 2.2 AA” como premissa | Incluir razões mínimas e teste por tema/superfície |
| Foco dourado sempre visível | “foco visível” como premissa | Cor, espessura, offset e verificação não definidos |
| Alvo mínimo 44 × 44 CSS px | Ausente | Adicionar para todos os controles, inclusive fechar, ícones e botões pequenos |
| Texto/ícone além da cor | FR-8 e §7.2 | Confirmada |
| Zoom/reflow a 200% | Premissa em §7.2 | Definir ausência de sobreposição, perda de conteúdo e scroll bidimensional comum |
| `prefers-reduced-motion` | Premissa em §7.2 e §8.1 | Incluir deslocamento programático/transições e teste manual |
| Rótulo, erro associado e foco no primeiro erro | Ausente | Adicionar requisitos de formulário: label programático, `aria-describedby` e gestão de foco |
| Skip link/landmarks e ordem de foco | Ausente | Adicionar às superfícies críticas |
| Teste automatizado e roteiro manual | Ausente no `package.json` e no addendum §5 | Exigir axe/equivalente mais teclado, leitor de tela, contraste e reflow |

Recomendação: remover a conformidade de §7.2 do índice de premissas e transformá-la em qualidade obrigatória com evidência. Se a equipe ainda não puder assumir WCAG 2.2 AA completa, definir explicitamente o subconjunto bloqueador do Piloto e uma dívida datada; não deixar “atende” como hipótese não testada.

## 5. Gaps da identidade visual

### Coberto

- §8.1 captura RPG acessível/artesanal, ornamentação contida, áreas limpas, pixel art funcional e separação entre arte pessoal e marca/editorial.
- A direção atual clara em papel/marfim, verde-sálvia/musgo, terracota e dourado envelhecido descreve bem o código existente.

### Parcial ou ausente

| Gap | Evidência da tensão | Inclusão recomendada |
|---|---|---|
| Light-first não é decisão final inequívoca | §8.1 afirma direção atual; questão aberta 14 pergunta se é final ou se haverá tema escuro | Marcar como decisão, hipótese ou experimento com dono e checkpoint; evitar os três estados ao mesmo tempo |
| Tokens oficiais da marca não foram incorporados | PRD usa nomes de cores, mas não semântica/token canônico | Referenciar tokens aprovados e papéis: dourado=foco/recompensa, verde=proteção/aprovação, marrom=estrutura |
| Regras de uso da logo ausentes | Fundação proíbe recriar, deformar, recolorir e fundo ruidoso | Adicionar guardrail de marca ou referência normativa ao asset/guia |
| Tipografia não definida | Cinzel + Inter era hipótese a validar; PRD não registra decisão nem fallback | Incluir questão/decisão e regras de uso por contexto antes de expandir componentes |
| Ritmo visual não definido | Sem grid de 4 px, alvos, raios e bordas | Incorporar em design tokens/critério de consistência, sem engessar exceções justificadas |
| Contextos visuais pouco diferenciados | §8.1 não descreve IA, Segredo, Corrupção e Aprovação | Exigir rótulo/ícone e tratamento localizado por contexto, preservando identidade única |
| Temas alternativos sem regra semântica | Ausente | Proibir tema/personalização de alterar significado ou contraste de estados |
| Character Builder não aparece como checkpoint visual | Reconciliação o indica como quadro de validação | Tornar Builder a primeira superfície de aceite antes de ampliar a biblioteca visual |

## 6. Gaps de compartilhamento e publicidade

### Coberto

- `Rascunho` é definido como privado.
- `Perfil Público` é um recorte limitado a campos explicitamente permitidos.
- FR-28 exige aprovação, explicação prévia dos campos e exclusão de dados privados/técnicos.
- FR-29 exige ação do Participante, fallback e ausência de postagem automática.
- §7.1 exige DTO/allowlist separado do payload administrativo.

### Parcial ou ausente

| Gap | Risco | Inclusão recomendada |
|---|---|---|
| Aprovação e publicação não estão separadas por estado testável | Um backend pode tornar toda Ficha aprovada pública e ainda parecer aderente à redação | Exigir `approved != public`: opt-in persistido do dono antes de o endpoint público responder |
| Consentimento por vínculo/campo do grupo ausente | O manual exige que cada vínculo indique se pode ser compartilhado com o grupo | Adicionar controle e persistência por vínculo/campo, independente do Perfil Público |
| Revogação é `[ASSUMPTION]` e questão aberta | Link pode permanecer público sem controle do dono | Promover a requisito ou retirar compartilhamento público do MVP até decisão |
| Comportamento pós-revogação não definido | Links distribuídos, cache e arte já baixada têm efeitos diferentes | Definir 404/indisponível para URL, invalidação de cache e aviso de que downloads não podem ser recolhidos |
| Story não exige prévia completa em critérios | Participante pode não perceber nome, imagem, handle, hashtag ou destino | Exigir prévia do artefato e destino antes de compartilhar/baixar |
| Allowlist não nomeia categorias públicas | Auditoria fica aberta a interpretações | Registrar campos permitidos por versão ou exigir endpoint versionado de configuração pública |

## 7. Gaps de mobile

O PRD reconhece mobile em UJ-1/UJ-2, §6.1 e §7.2, e proíbe dependência de hover. Isso confirma intenção, mas não define quando a experiência mobile passa.

| Gap | Critério recomendado |
|---|---|
| Navegação mobile reduzida não tem aceite próprio | Confirmar exatamente os mesmos itens e regras do menu participante/admin, sem overflow ou truncamento que oculte a distinção |
| Sem matriz mínima de viewport/dispositivo | Testar ao menos 320 CSS px, 360/375 px, tablet e desktop, em retrato e paisagem quando aplicável |
| Teclado virtual não é coberto | Campos, sugestões e barra sticky não podem encobrir foco, erro ou CTA; scroll deve revelar o controle ativo |
| Safe areas não são mencionadas | Navegação fixa e ações no rodapé devem respeitar `env(safe-area-inset-*)` |
| Reflow/zoom não está ligado a mobile | Em 200%, tarefa principal permanece linear, sem conteúdo perdido ou scroll horizontal comum |
| Builder longo não tem aceite de progresso móvel | Troca de etapa, pergunta atual, salvar, voltar e continuar permanecem alcançáveis sem foco saltar ou estado se perder |
| Compartilhamento mobile só tem fallback funcional | Testar Web Share com arquivo/link, cancelamento, ausência de `canShare`, clipboard negado e download |
| PDF/carta não têm QA mobile explícito | Confirmar geração, memória, preview, nome longo, download e retorno à jornada em dispositivo real |
| Orientação e gesto não definidos | Nenhuma tarefa pode exigir orientação específica, hover, gesto complexo ou precisão fina |

## 8. Ajustes mínimos recomendados antes de congelar o PRD

1. Transformar acessibilidade de premissa em requisitos e evidências de aceite, incluindo 44 × 44, contraste, formulários, reflow e testes.
2. Resolver a questão visual 14 e registrar light-first/dark-first, tokens, tipografia e regras de marca como decisão ou experimento explícito.
3. Acrescentar `approved != public`, opt-in persistido, compartilhamento por vínculo e revogação ao FR-28 ou retirar Perfil Público do MVP até a decisão.
4. Adicionar uma subseção mobile com viewports, teclado virtual, safe areas, reflow e testes de Builder/Story/PDF.
5. Adicionar critério editorial de zero mojibake/texto sem acentuação e aderência ao Glossário.
6. Estender o addendum §5 com evidência de acessibilidade e mobile; build/lint/typecheck não satisfazem esses critérios.

## 9. Veredito

- **Cobertura funcional de UX:** forte.
- **Tom:** forte na intenção, parcial no controle de qualidade.
- **Identidade visual:** parcial e ainda ambígua como decisão.
- **Acessibilidade:** insuficiente para aceite; está como premissa.
- **Compartilhamento:** parcial; privacidade de payload está forte, governança de publicação está incompleta.
- **Mobile:** intenção confirmada, critérios verificáveis insuficientes.

O PRD pode seguir como draft, mas não deve ser congelado como baseline UX/visual até os itens 1–4 dos ajustes mínimos serem resolvidos ou explicitamente aceitos como dívida com responsável e prazo.
