import { AdminCreateButton } from "@/components/admin-create-button";
import { AdminPageHeading, AdminPanel, MetricCard, Status } from "@/components/admin-ui";
import { getAdminData } from "@/lib/admin-data";

export default async function AdminPage() {
  const data = await getAdminData();
  const { artists, events, inquiries, tasks, campaigns, bookings } = data;

  return (
    <main className="admin-main">
      <AdminPageHeading title="Vue d’ensemble" description="Tout ce qui demande votre attention aujourd’hui." action={<AdminCreateButton kind="event" artists={artists} />} />
      <section className="metrics-grid">
        <MetricCard label="Demandes ouvertes" value={inquiries.length} hint="Booking, marques, presse et artistes" />
        <MetricCard label="Dates à venir" value={events.length} hint="Tous artistes confondus" />
        <MetricCard label="Bookings en cours" value={bookings.length} hint="Prospection → contrat signé" />
        <MetricCard label="Campagnes actives" value={campaigns.length} hint="Partenariats et contenus" />
      </section>

      <section className="admin-grid">
        <AdminPanel title="Pipeline des demandes" wide>
          <div className="admin-table">
            <div className="admin-table-head"><span>Contact</span><span>Type</span><span>Artiste</span><span>Statut</span></div>
            {inquiries.length ? inquiries.map((item) => (
              <div className="admin-table-row" key={item.id}>
                <span><b>{item.contact_name}</b><small>{item.company || item.email}</small></span>
                <span>{item.inquiry_type}</span><span>{item.artist_slug || "Général"}</span>
                <span><Status tone={item.status === "new" ? "warn" : "neutral"}>{item.status}</Status></span>
              </div>
            )) : <Empty text="Aucune demande reçue." />}
          </div>
        </AdminPanel>

        <AdminPanel title="Priorités">
          <div className="task-list">
            {tasks.length ? tasks.map((task) => (
              <div key={task.id}><i className={task.priority === "urgent" ? "urgent" : ""} /><span><b>{task.title}</b><small>{task.category}</small></span></div>
            )) : <Empty text="Aucune tâche urgente." />}
          </div>
        </AdminPanel>

        <AdminPanel title="Roster">
          <div className="admin-roster">
            {artists.map((artist) => (
              <div key={artist.id}><span>{artist.name.slice(0, 2).toUpperCase()}</span><p><b>{artist.name}</b><small>{artist.tagline}</small></p><Status tone="good">Actif</Status></div>
            ))}
          </div>
        </AdminPanel>

        <AdminPanel title="Prochaines dates" wide>
          <div className="compact-events">
            {events.length ? events.map((event) => (
              <div key={event.id}><time>{new Date(event.starts_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}</time><span><b>{event.title}</b><small>{event.city} · {event.artist_name}</small></span><Status tone="good">{event.status}</Status></div>
            )) : <Empty text="Ajoutez les dates confirmées au calendrier." />}
          </div>
        </AdminPanel>
      </section>
    </main>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="admin-empty">{text}</p>;
}
