# Bravantus Frontend

Frontend base em Next.js para um RPG/web game com App Router, Tailwind, React Query, React Hook Form, Zod e Zustand.

## Stack

- Next.js + TypeScript
- Tailwind CSS
- shadcn/ui style components
- TanStack Query
- React Hook Form + Zod
- Zustand
- Axios

## Estrutura

```text
app/
components/
features/
hooks/
lib/
openapi/
public/
stores/
types/
```

### Pastas principais

- `app/`: rotas, layouts e composição de páginas.
- `components/`: UI base, shell autenticado, estados e widgets de jogo.
- `features/`: serviços, hooks, formulários e componentes por domínio.
- `lib/api/`: config, cliente HTTP, contratos e erros.
- `stores/`: autenticação e personagem ativo.
- `openapi/`: local esperado para a especificação oficial da API.

## Como rodar

1. Instale dependências:

```bash
npm install
```

2. Configure ambiente:

```bash
cp .env.example .env.local
```

3. Ajuste `NEXT_PUBLIC_API_BASE_URL`.

4. Rode o projeto:

```bash
npm run dev
```

## Integração OpenAPI

Este repositório foi montado para **não inventar endpoints**.

Hoje o workspace não contém a spec OpenAPI. Por isso:

- a UI, navegação, estado global, autenticação de frontend, guards e módulos já estão estruturados;
- a camada `lib/api/contracts.ts` marca explicitamente todas as operações necessárias;
- os serviços por domínio dependem desses contratos;
- ao conectar a spec, basta substituir os contratos por implementações reais derivadas da documentação.

### Passos recomendados

1. Coloque a spec em `openapi/openapi.yaml` ou ajuste o script.
2. Gere os tipos:

```bash
npm run generate:api
```

3. Implemente os contratos reais em `lib/api/contracts.ts` ou extraia para `lib/api/generated/`.
4. Troque os tipos UI mínimos pelos tipos gerados sempre que o schema estiver explícito.

## Rotas implementadas

### Públicas

- `/login`
- `/register`

### Autenticadas

- `/dashboard`
- `/profile`
- `/characters`
- `/characters/create`
- `/characters/[id]`
- `/characters/[id]/summary`
- `/characters/[id]/inventory`
- `/characters/[id]/wallet`
- `/gameplay/journey`
- `/gameplay/trainings`
- `/gameplay/missions`
- `/gameplay/bounties`
- `/gameplay/npcs`
- `/shop`
- `/shop/orders`
- `/rewards`
- `/transactions`

### Admin

- `/admin`
- `/admin/monsters`
- `/admin/bounties`
- `/admin/missions`
- `/admin/trainings`
- `/admin/npcs`

## Observações

- O middleware protege rotas privadas por cookie de token.
- O estado do usuário e do personagem ativo é persistido no frontend.
- O visual usa dark mode por padrão com shell de game dashboard.
- As imagens da pasta `Imagens` foram reaproveitadas em `public/images`.

## Próximo passo obrigatório

Adicionar a especificação OpenAPI no repositório para ligar:

- login/register/me reais
- CRUD de personagens
- inventário e wallet
- gameplay e rewards
- shop, orders e transactions
- endpoints administrativos
"# GOB-Frontend" 
