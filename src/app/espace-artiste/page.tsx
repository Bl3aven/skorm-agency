import { redirect } from "next/navigation";
import { ArtistPrivateDashboard } from "@/components/artist-private-dashboard";
import { getArtistSessionSlug } from "@/lib/artist-auth";
import { getAdminData } from "@/lib/admin-data";

export default async function ArtistPrivatePage() {
  const slug = await getArtistSessionSlug();
  if (!slug) redirect("/connexion");

  const { artists } = await getAdminData();
  const artist = artists.find((item) => item.slug === slug);
  if (!artist) redirect("/connexion");

  return <ArtistPrivateDashboard artist={artist as Parameters<typeof ArtistPrivateDashboard>[0]["artist"]} />;
}
