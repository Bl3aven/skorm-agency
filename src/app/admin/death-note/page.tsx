import { AdminDeathNoteClient } from "@/components/admin-private-list-client";
import { AdminPageHeading } from "@/components/admin-ui";
import { getPrivateAdminLists } from "@/lib/private-admin";

export default async function AdminDeathNotePage() {
  const { death_note_entries } = await getPrivateAdminLists();
  return (
    <main className="admin-main">
      <AdminPageHeading
        title="Death Note"
        description="Liste privée des personnes, marques ou structures à éviter ou surveiller. Tout est modifiable."
      />
      <AdminDeathNoteClient entries={death_note_entries} />
    </main>
  );
}
