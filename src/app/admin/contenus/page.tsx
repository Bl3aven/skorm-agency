import { AdminCreateButton } from "@/components/admin-create-button";
import { AdminItemActions } from "@/components/admin-item-actions";
import { AdminPageHeading, Status } from "@/components/admin-ui";
import { getAdminData } from "@/lib/admin-data";

export default async function ContentPage() {
  const { content_items: data, artists } = await getAdminData();
  return (
    <main className="admin-main">
      <AdminPageHeading title="Planning contenus" description="Idées, production, validation et programmation sur tous les canaux." action={<AdminCreateButton kind="content" artists={artists} />} />
      <section className="content-board">
        {["idea", "production", "review", "scheduled"].map((status) => (
          <div key={status}><header><b>{status}</b><span>{data.filter((c) => c.status === status).length}</span></header>
            {data.filter((c) => c.status === status).map((content) => (
              <article key={content.id}>
                <small>{content.platform} · {content.artist_name}</small><h3>{content.title}</h3><p>{content.publish_at ? new Date(content.publish_at).toLocaleDateString("fr-FR") : "Date à définir"}</p><Status>{content.content_type}</Status>
                <AdminItemActions kind="content" item={content} />
              </article>
            ))}
            {!data.some((c) => c.status === status) && <p className="kanban-empty">Vide</p>}
          </div>
        ))}
      </section>
    </main>
  );
}
