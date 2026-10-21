import { AdminPricingClient } from "@/components/admin-pricing-client";
import { AdminPageHeading } from "@/components/admin-ui";
import { getPricingEntries } from "@/lib/pricing-admin";

export default async function AdminPricingPage() {
  const entries = await getPricingEntries();
  return (
    <main className="admin-main">
      <AdminPageHeading
        title="Prestations & tarifs"
        description="Grille complète issue du catalogue SKORM : prestations, détails, cibles, types de facturation et tarifs. Tout est modifiable."
      />
      <AdminPricingClient entries={entries} />
    </main>
  );
}
