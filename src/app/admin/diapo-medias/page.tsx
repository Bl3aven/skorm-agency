import { AdminDiapoMediaClient } from "@/components/admin-diapo-media-client";
import { AdminPageHeading, MetricCard } from "@/components/admin-ui";
import { getAdminData } from "@/lib/admin-data";

export default async function AdminDiapoMediasPage() {
  const { content_items } = await getAdminData();
  const items = content_items
    .filter((item) => item.platform === "diapo")
    .sort((a, b) => String(b.publish_at || "").localeCompare(String(a.publish_at || "")));

  return (
    <main className="admin-main">
      <AdminPageHeading
        title="Diapo médias"
        description="Photos et vidéos affichées sur la home avant le footer."
      />
      <section className="metrics-grid three">
        <MetricCard label="Médias" value={items.length} hint="Affichés sur la home" />
        <MetricCard
          label="Photos"
          value={items.filter((item) => item.content_type === "photo").length}
          hint="Images uploadées ou URL"
        />
        <MetricCard
          label="Vidéos"
          value={items.filter((item) => item.content_type === "video").length}
          hint="Liens vidéo intégrés"
        />
      </section>
      <AdminDiapoMediaClient items={items} />
    </main>
  );
}
