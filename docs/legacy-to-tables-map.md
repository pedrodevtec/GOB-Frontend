# Legacy to Tables Map

This MVP repositions the product as an asynchronous tabletop RPG campaign manager.

## Primary Journey

1. Master creates a table.
2. Master copies the join code and invites players.
3. Player joins with the code.
4. Player creates a table/campaign character.
5. Master approves the character.
6. Master creates missions.
7. Player submits mission responses.
8. Master validates submissions.
9. Timeline keeps the campaign history.

## Primary Navigation

- `/dashboard`: campaign hub.
- `/tables`: user's tables/campaigns.
- `/tables/create`: create a table.
- `/tables/join`: join by code.
- `/profile`: user profile.

## Adapted to Tables

- `/dashboard`: now focuses on campaigns, pending reviews, pending missions, and timeline updates.
- `/tables`: main campaign list.
- `/tables/[id]`: role-aware campaign detail.
- `/tables/[id]/master`: Master operations for world, invite code, reviews, missions, submissions, and timeline.
- `/tables/[id]/player`: Player operations for table character, review status, traits, missions, and submissions.
- `/characters`: preserved as a character archive, with copy directing users to create campaign characters inside tables.

## Hidden from MVP Navigation

These routes are preserved but no longer dominate the main navigation:

- `/gameplay`
- `/gameplay/missions`
- `/gameplay/bounties`
- `/gameplay/npcs`
- `/gameplay/trainings`
- `/shop`
- `/shop/orders`
- `/transactions`
- `/trades`
- `/pvp`
- `/characters/rankings`
- `/characters/[id]/wallet`

## Future Areas

- Old gameplay can become a Master library or content reference.
- Admin can become a Master content library.
- Inventory, wallet, shop, trades, PvP, transactions, and rankings can return later as campaign support systems.

## Current Rule

Legacy pages remain in the codebase. The MVP shell, dashboard, table flows, and documentation should present Tables/Campaigns as the product center.
