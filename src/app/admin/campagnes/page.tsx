import { AdminCreateButton } from "@/components/admin-create-button";
import { AdminItemActions } from "@/components/admin-item-actions";
import { AdminPageHeading, MetricCard, Status } from "@/components/admin-ui";
import { getAdminData } from "@/lib/admin-data";

export default async function CampaignsPage() {
  const { campaigns: data, artists } = await getAdminData();
  return (
    <main className="admin-main">
      <AdminPageHeading title="Campagnes" description="Propositions de marques, livrables, validations et budgets." action={<AdminCreateButton kind="campaign" artists={artists} />} />
      <section className="metrics-grid three">
        <MetricCard label="Actives" value={data.filter((c) => c.status === "active").length} hint="En production" />
        <MetricCard label="En négociation" value={data.filter((c) => c.status === "proposal").length} hint="Offres à suivre" />
        <MetricCard label="Budget total" value={`${data.reduce((s, c) => s + Number(c.budget || 0), 0).toLocaleString("fr-FR")} €`} hint="Brut négocié" />
      </section>
      <section className="campaign-list">
        {data.length ? data.map((campaign) => (
          <article key={campaign.id}>
            <div className="campaign-mark">{campaign.brand_name.slice(0, 2).toUpperCase()}</div>
            <div><small>{campaign.artist_name}</small><h2>{campaign.title}</h2><p>{campaign.brand_name} · échéance {campaign.deadline || "à définir"}</p></div>
            <b>{Number(campaign.budget || 0).toLocaleString("fr-FR")} €</b>
            <Status tone={campaign.status === "active" ? "good" : "warn"}>{campaign.status}</Status>
            <AdminItemActions kind="campaign" item={campaign} />
          </article>
        )) : <p className="admin-empty">Ajoutez ici les propositions et campagnes de marques.</p>}
      </section>
    </main>
  );
}
