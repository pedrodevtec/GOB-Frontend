import { PageHeader } from "@/components/layout/page-header";
import { ActionPanel } from "@/components/game/action-panel";

const adminLinks = [
  { title: "Monstros", description: "Gerencie registros de monstros.", href: "/admin/monsters" },
  { title: "Bounties", description: "Cadastre e revise caçadas.", href: "/admin/bounties" },
  { title: "Missões", description: "Edite missões do jogo.", href: "/admin/missions" },
  { title: "Treinamentos", description: "Controle sessões de treino.", href: "/admin/trainings" },
  { title: "NPCs", description: "Administre interações e NPCs.", href: "/admin/npcs" },
  { title: "Shop Products", description: "Cadastre e mantenha produtos da loja.", href: "/admin/shop-products" }
];

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Painel administrativo"
        description="CRUD parcial e manutenção das entidades operacionais do jogo."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {adminLinks.map((link) => (
          <ActionPanel key={link.href} {...link} />
        ))}
      </div>
    </div>
  );
}
