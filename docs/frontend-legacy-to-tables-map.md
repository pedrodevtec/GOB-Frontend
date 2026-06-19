# Frontend Legacy to Tables Map

## New Primary Journey

1. Master cria uma mesa em `/tables/create`.
2. Master copia o `joinCode` e convida jogadores.
3. Player entra pela rota `/tables/join`.
4. Player cria personagem em `/tables/[id]/player`.
5. Master revisa e aprova personagem em `/tables/[id]/master`.
6. Master cria missoes da campanha.
7. Player envia respostas de missao.
8. Master valida submissoes.
9. Timeline da mesa registra o historico da campanha.

## Primary MVP Navigation

- `/dashboard`: central de campanhas e pendencias.
- `/tables`: minhas mesas/campanhas.
- `/tables/create`: criar mesa.
- `/tables/join`: entrar com codigo.
- `/profile`: perfil do usuario.

## Routes Adapted to the Table Model

- `/dashboard`: deixou de destacar economia, PvP, shop e loops soltos; agora resume mesas, pendencias de mestre/jogador e timeline.
- `/tables`: lista campanhas do usuario.
- `/tables/[id]`: resumo da campanha, papel do usuario, codigo para Master, missoes recentes e timeline.
- `/tables/[id]/master`: cockpit do mestre para universo, convites, reviews, traits, missoes, submissoes e timeline.
- `/tables/[id]/player`: area do jogador para personagem da mesa, status de review, traits, missoes e respostas.
- `/characters`: mantido como arquivo legado, com copy orientando criacao de personagens dentro de uma mesa.

## Hidden from Primary Navigation for MVP

Estas rotas continuam no codigo e podem voltar como futuras areas, mas nao aparecem mais na navegacao principal:

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

## Preserved for Future Use

- Gameplay antigo pode virar "Biblioteca do Mestre" ou gerador de conteudo.
- Admin pode evoluir para curadoria da Biblioteca do Mestre.
- Inventario, wallet, shop, trades, PvP e transactions ficam preservados para campanha/economia futura.
- Character detail, inventory e summary continuam acessiveis por URL, mas nao conduzem o MVP principal.

## Implementation Notes

- Legacy modules nao foram removidos.
- Primary layout, topbar e dashboard agora apresentam o produto como gerenciador de campanhas assincronas.
- Join table usa somente `{ "joinCode": "VALUE" }`, com trim e uppercase no cliente.
- Create table redireciona o criador para `/tables/[id]/master` quando a resposta do backend confirma papel de Master.
