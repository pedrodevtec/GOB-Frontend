# Bravantus Frontend

Frontend em Next.js para o RPG/web game Bravantus, com App Router, Tailwind, React Query, React Hook Form, Zod e Zustand.

## Stack

- Next.js + TypeScript
- Tailwind CSS
- Componentes UI locais no estilo shadcn/ui
- TanStack Query
- React Hook Form + Zod
- Zustand
- Axios

## Como Rodar

1. Instale dependencias:

```bash
npm install
```

2. Configure o ambiente:

```bash
cp .env.example .env.local
```

3. Ajuste `NEXT_PUBLIC_API_BASE_URL` para apontar para o backend.

4. Rode o projeto:

```bash
npm run dev
```

## Rotas de Mesas RPG

- `/tables`: lista mesas do usuario autenticado.
- `/tables/create`: cria uma mesa e gera um codigo de entrada.
- `/tables/join`: permite entrar em uma mesa usando `joinCode`.
- `/tables/[id]`: resumo da mesa, membros, missoes recentes e timeline.
- `/tables/[id]/master`: painel do mestre para mundo, personagens, traits, missoes, submissoes e timeline.
- `/tables/[id]/player`: painel do jogador para personagem da mesa, review, traits, missoes ativas e respostas.

## Fluxo de Uso das Mesas

1. O mestre cria uma mesa em `/tables/create`.
2. O mestre compartilha o codigo de entrada exibido na mesa.
3. O jogador entra em `/tables/join` usando o codigo. O payload enviado ao backend e `{ "joinCode": "CODIGO" }`.
4. O jogador acessa `/tables/[id]/player` e cria um personagem da mesa.
5. O mestre acessa `/tables/[id]/master` e aprova o personagem.
6. O mestre cria uma missao ativa.
7. O jogador envia uma resposta de missao no painel do jogador.
8. O mestre aprova a submissao no painel do mestre.
9. A timeline registra eventos automaticos de criacao de mesa, aprovacao de personagem, criacao de missao e aprovacao de submissao.

## Rotas Principais

### Publicas

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
- `/gameplay`
- `/gameplay/missions`
- `/gameplay/bounties`
- `/gameplay/npcs`
- `/gameplay/trainings`
- `/shop`
- `/shop/orders`
- `/rewards`
- `/transactions`
- `/trades`
- `/pvp`
- `/tables`

### Admin

- `/admin`
- `/admin/monsters`
- `/admin/bounties`
- `/admin/missions`
- `/admin/trainings`
- `/admin/npcs`
- `/admin/shop-products`

## Verificacao

```bash
npm run typecheck
npm run build
```

Use tambem o checklist manual em [`docs/rpg-tables-mvp-qa.md`](docs/rpg-tables-mvp-qa.md) antes de demonstrar o MVP de mesas.
