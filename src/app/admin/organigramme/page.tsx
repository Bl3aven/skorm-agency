import { AdminOrgClient } from "@/components/admin-private-list-client";
import { AdminPageHeading } from "@/components/admin-ui";
import { getPrivateAdminLists } from "@/lib/private-admin";

export default async function AdminOrganigrammePage() {
  const { org_entries } = await getPrivateAdminLists();
  return (
    <main className="admin-main">
      <AdminPageHeading
        title="Organigramme"
        description="Tâches, personnes, missions, statuts et commissions. Chaque ligne est modifiable et supprimable."
      />
      <AdminOrgClient entries={org_entries} />
    </main>
  );
}
