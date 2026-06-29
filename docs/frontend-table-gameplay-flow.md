# Frontend Table Gameplay Flow

## Player journey

1. Player joins a table with the join code.
2. Player opens `/tables/[id]/player`.
3. Player creates a table character.
4. Character waits for Master review.
5. When approved, player sees applied traits/perks, suggested perks, active missions, own submissions, feedback, and timeline.
6. Player submits mission responses with `characterId = Character.id`.
7. Player follows Master feedback and timeline updates before continuing to the next mission.

## Master journey

1. Master creates or opens a table.
2. Master configures the world summary and campaign rules.
3. Master reviews submitted characters.
4. Master applies traits/perks and may use AI suggestions as drafts.
5. Master creates active missions.
6. Master reviews player submissions and updates timeline events.

## API sections

- Campaign header and next action: `getTablePlayerOverview(tableId)`.
- My character: `getMyTableCharacter(tableId)` or `overview.character`.
- Create character: `createTableCharacter(tableId, payload)`.
- Applied traits: `characterTraits(tableId, characterId)` or `overview.appliedTraits`.
- Suggested perks: `getCharacterTraitSuggestions(tableId, characterId)` or `overview.suggestedTraits`.
- Active missions: `missions(tableId)` or `overview.activeMissions`.
- Submit mission: `createMissionSubmission(tableId, missionId, { characterId, content })`.
- My submissions: `getMyTableSubmissions(tableId, filters)` or `overview.recentSubmissions`.
- Timeline preview: `timeline(tableId)` or `overview.timeline`.

## Role rules

- `accountRole` / `systemRole` are global account permissions, such as admin access.
- `currentUserRole` / `isMaster` are table permissions.
- Master-only UI must use table permissions, not global roles.
- Player gameplay must require an active table membership and `currentUserRole = PLAYER` or equivalent player access.

## Entity rules

- User is not Character.
- TableMember is not Character.
- Character name is display-only.
- `characterId` must always be `Character.id`.
- Do not send `userId`, `tableMemberId`, or character name as `characterId`.
- Dropdowns for character operations must use `option.value = character.id`.
- If no `Character.id` is available, disable the action and show a friendly message.

## Cache invalidation

- Create character:
  - invalidate `tableKeys.playerOverview(tableId)`
  - invalidate `tableKeys.myCharacter(tableId)`
  - invalidate table characters/master overview only when Master screens depend on the change

- Submit mission:
  - invalidate `tableKeys.playerOverview(tableId)`
  - invalidate `tableKeys.mySubmissions(tableId, filters)`
  - invalidate `tableKeys.missions(tableId)` when mission cards display submission status

- Apply or dismiss trait suggestion:
  - invalidate `tableKeys.playerOverview(tableId)`
  - invalidate `tableKeys.traitSuggestions(tableId, characterId)`
  - invalidate `tableKeys.characterTraits(tableId, characterId)` after apply

Avoid broad `invalidateQueries(["tables"])` unless a mutation genuinely changes every table surface.

## Adding a new player gameplay section safely

1. Add or extend a DTO in `types/app.ts`.
2. Map backend response shape in `lib/api/contracts.ts`.
3. Expose a service function in `features/tables/services/tables.service.ts`.
4. Add a scoped query key in `features/tables/query-keys.ts`.
5. Add a hook in `features/tables/hooks/use-tables.ts`.
6. Build UI components against normalized DTOs only.
7. Use `Character.id` for character operations and block actions when it is missing.
8. Add specific mutation invalidation for the new section.
