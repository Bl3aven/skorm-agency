"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Disc3, Plus } from "lucide-react";
import { MediaPlayButton } from "@/components/media-play-button";

export function HomeArtistCard({ artist, release, en = false }: {
  artist: { slug: string; name: string; genre: string; instagram: string; homeImage?: string };
  release?: { title: string; meta?: string; cover?: string; href?: string; audioUrl?: string; fullAudioUrl?: string; src?: string; deezerId?: string; previewUrl?: string };
  en?: boolean;
}) {
  const href = `/artistes/${artist.slug}`;
  const playable = release && (release.href || release.audioUrl || release.fullAudioUrl || release.previewUrl || release.deezerId || release.src);
  return <article className="noir-artist-card">
    <Link href={href} className="noir-artist-photo" aria-label={`${en ? "View artist" : "Voir le profil de"} ${artist.name}`}>
      {artist.homeImage ? <Image src={artist.homeImage} alt={artist.name} fill sizes="(max-width: 600px) 65vw, (max-width: 1000px) 30vw, 260px" unoptimized={artist.homeImage.startsWith("http")} /> : <div className="noir-artist-placeholder"><Disc3 size={70} /></div>}
    </Link>
    <div className="noir-artist-title"><p>{artist.genre}</p><h3 className={artist.name.length > 11 ? "noir-long-name" : undefined}><Link href={href}>{artist.name}</Link></h3></div>
    <div className="noir-artist-player">
      <span className="noir-artist-cover">{release?.cover ? <img loading="lazy" src={release.cover} alt="" width={42} height={42} /> : <Disc3 size={27} />}</span>
      <div className="noir-artist-track"><strong title={release?.title}>{release?.title || (en ? "Coming soon" : "À venir")}</strong><small>{artist.name}</small></div>
      <div className="noir-artist-buttons">{playable ? <MediaPlayButton {...release} label={en ? "Play" : "Écouter"} title={release.title} /> : <Link className="noir-artist-discover" href={href} aria-label={`${en ? "Discover" : "Découvrir"} ${artist.name}`}><ArrowUpRight size={13} /></Link>}<Link className="noir-artist-more" href={href} aria-label={`${en ? "View artist" : "Voir le profil de"} ${artist.name}`}><Plus size={13} /></Link></div>
    </div>
  </article>;
}
