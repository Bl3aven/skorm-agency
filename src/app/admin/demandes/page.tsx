import { AdminRequestsClient } from "@/components/admin-requests-client";
import { AdminPageHeading } from "@/components/admin-ui";
import { getAdminData } from "@/lib/admin-data";

export default async function RequestsPage() {
  const { inquiries: data } = await getAdminData();
  return (
    <main className="admin-main">
      <AdminPageHeading title="Demandes" description="Consultez les bookings, propositions de marques, presse et candidatures reçues depuis le site." />
      <AdminRequestsClient inquiries={data} />
    </main>
  );
}
