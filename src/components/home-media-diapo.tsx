"use client";

import { useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Pause, Play, Power, Volume1, Volume2 } from "lucide-react";

export type HomeDiapoItem = {
  id: string;
  title: string;
  meta: string;
  type: string;
  src?: string;
  previewSrc?: string;
  thumbSrc?: string;
  artist?: string;
  location?: string;
  date?: string;
  description?: string;
  duration?: string;
  instagram?: string;
  audioSrc?: string;
  storyChannel?: boolean;
};

export const fallbackMediaItems: HomeDiapoItem[] = [
  { id: "paga-local", title: "PAGA", meta: "Live booth", type: "Photo", src: "/artists/paga-home-mixing.jpg", artist: "PAGA", description: "Sélection officielle SKORM" },
  { id: "cgl-local", title: "CGL", meta: "Shooting District", type: "Photo", src: "/artists/cgl-profile.jpg", artist: "CGL" },
  { id: "enkor-local", title: "ENKOR", meta: "Live stage", type: "Photo", src: "/artists/enkor-photo.png", artist: "ENKOR" },
  { id: "nova-local", title: "N.O.V.A.", meta: "Hardlab", type: "Photo", src: "/artists/nova-hardlab-photo.png", artist: "N.O.V.A." },
  { id: "vs-local", title: "VS TECHNO", meta: "Photo officielle", type: "Photo", src: "/artists/vs-techno-blue-smoke.jpg", artist: "VS TECHNO" },
  { id: "oskana-local", title: "Oskana", meta: "Summer tour", type: "Photo", src: "/artists/oskana-photo.jpg", artist: "Oskana" },
  { id: "andrea-local", title: "Andrea Tutti", meta: "Dark oriental techno", type: "Photo", src: "/artists/andrea-tutti-profile.png", artist: "Andrea Tutti" },
  { id: "impact-local", title: "IMPACT", meta: "Raw energy", type: "Photo", src: "/artists/impact-dj-raw-photo.png", artist: "IMPACT" },
  { id: "dante-local", title: "Dante", meta: "Techno", type: "Photo", src: "/artists/dante-techno-photo.png", artist: "Dante" },
  { id: "vielusos-local", title: "Vielusos", meta: "Hard techno", type: "Photo", src: "/artists/vielusos-photo.png", artist: "Vielusos" },
  { id: "tiito-local", title: "Tiito", meta: "International dates", type: "Photo", src: "/artists/tiito-photo.png", artist: "Tiito" },
  { id: "wolvi-local", title: "Wolvi Akela", meta: "Visual shooting", type: "Photo", src: "/artists/wolvi-photo-1.jpg", artist: "Wolvi Akela" },
];

function driveId(src?: string) { return src?.match(/drive\.google\.com\/file\/d\/([^/]+)/)?.[1] || src?.match(/[?&]id=([^&]+)/)?.[1] || null; }
function preview(item: HomeDiapoItem) {
  const source = item.previewSrc || item.src || "";
  const youtube = source.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([^?&/]+)/)?.[1];
  if (youtube) return `https://www.youtube.com/embed/${youtube}?autoplay=1&rel=0`;
  const id = driveId(source);
  if (id && item.type === "Vidéo") return `https://drive.google.com/file/d/${id}/preview`;
  return source;
}
function thumb(item: HomeDiapoItem) {
  if (item.thumbSrc) return item.thumbSrc;
  const id = driveId(item.src);
  if (id) return `https://drive.google.com/thumbnail?id=${id}&sz=w900`;
  return item.src || "/skorm-header-logo.webp";
}
function unique(items: HomeDiapoItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => { const key = item.audioSrc || item.src || item.instagram || item.id; if (seen.has(key)) return false; seen.add(key); return true; });
}
function mediaCategory(item: HomeDiapoItem): "Photo" | "Vidéo" | "Story" | "Music" {
  if (item.type === "Story") return "Story";
  if (item.type === "Music") return "Music";
  return item.type.toLowerCase().startsWith("vid") ? "Vidéo" : "Photo";
}
function instagramFrame(item: HomeDiapoItem) {
  const source = item.instagram || item.src || "";
  if (!source) return "";
  try { const url = new URL(source); return url.pathname.startsWith("/stories/") ? url.href : `${url.origin}${url.pathname.replace(/\/$/, "")}/embed`; }
  catch { return source; }
}
function isStoryVideo(item: HomeDiapoItem) { return /^(data:video\/)|\.(mp4|webm|mov)(?:\?|$)/i.test(item.src || ""); }
function instagramHandle(item?: HomeDiapoItem) {
  if (!item?.instagram) return "@instagram";
  try {
    const part = new URL(item.instagram).pathname.split("/").filter(Boolean)[0];
    return part ? `@${part}` : "@instagram";
  } catch { return item.instagram.startsWith("@") ? item.instagram : `@${item.instagram}`; }
}

const categories = ["Photo", "Vidéo", "Music"] as const;
function InstagramGlyph() { return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>; }

export function HomeMediaDiapo({ items = [], stories = [] }: { items?: HomeDiapoItem[]; stories?: HomeDiapoItem[] }) {
  const [category, setCategory] = useState<(typeof categories)[number]>("Photo");
  const [activeIndex, setActiveIndex] = useState(0);
  const [awake, setAwake] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const railRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const storyVideoRef = useRef<HTMLVideoElement>(null);
  const allItems = useMemo(() => {
    // L'admin reprend la main : les médias statiques de secours ne servent
    // que si aucun média n'a été ajouté depuis l'admin (sinon on ne pourrait
    // jamais supprimer les photos de démonstration comme « VS TECHNO »).
    const provided = unique([...items, ...stories]);
    return provided.length ? provided : unique([...fallbackMediaItems]);
  }, [items, stories]);
  const visible = useMemo(() => allItems.filter((item) => mediaCategory(item) === category), [allItems, category]);
  const active = awake ? visible[Math.min(activeIndex, Math.max(0, visible.length - 1))] : undefined;
  const activeCategory = active ? mediaCategory(active) : category;

  function choose(nextCategory: typeof category) { setCategory(nextCategory); setActiveIndex(0); setAwake(false); setPlaying(false); }
  function move(direction: -1 | 1) {
    if (!visible.length) return;
    const next = (activeIndex + direction + visible.length) % visible.length;
    setActiveIndex(next); setAwake(true); setPlaying(category === "Vidéo");
    (railRef.current?.children[next] as HTMLElement | undefined)?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }
  function shiftCategory(direction: -1 | 1) {
    const index = categories.indexOf(category);
    choose(categories[(index + direction + categories.length) % categories.length]);
  }
  async function togglePlayback() {
    if (!active) return;
    if (mediaCategory(active) === "Story" && active.storyChannel) {
      const nextStory = visible.findIndex((item, index) => index > activeIndex && !item.storyChannel);
      const wrappedStory = visible.findIndex((item) => !item.storyChannel);
      const next = nextStory >= 0 ? nextStory : wrappedStory;
      if (next >= 0) {
        setActiveIndex(next);
        setAwake(true);
        setPlaying(isStoryVideo(visible[next]));
      } else {
        move(1);
        setPlaying(false);
      }
      return;
    }
    if (mediaCategory(active) === "Music" && audioRef.current) {
      if (playing) { audioRef.current.pause(); setPlaying(false); }
      else { try { await audioRef.current.play(); setPlaying(true); } catch { setPlaying(false); } }
      return;
    }
    if (mediaCategory(active) === "Story" && storyVideoRef.current) {
      if (playing) { storyVideoRef.current.pause(); setPlaying(false); }
      else { try { await storyVideoRef.current.play(); setPlaying(true); } catch { setPlaying(false); } }
      return;
    }
    setPlaying((value) => !value);
  }

  return (
    <section className="skorm-tv" aria-labelledby="skorm-tv-title">
      <header className="skorm-tv-title"><span /> <h2 id="skorm-tv-title">SKORM TV</h2><span /></header>
      <div className="skorm-tv-console">
        <nav className="skorm-tv-categories" aria-label="Catégories médias">
          <img src="/skorm-header-logo.webp" alt="SKORM" />
          {categories.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => choose(item)}>{item === "Music" ? "Musique" : `${item}s`}</button>)}
        </nav>

        <div className="skorm-tv-center">
          <div className="skorm-tv-screen">
            {!active ? <div className="skorm-tv-idle"><img src="/skorm-tv-idle.png" alt="Univers visuel SKORM" /><p>Sélectionnez un média</p></div>
              : mediaCategory(active) === "Music" ? <div className={`skorm-tv-music${playing ? " playing" : ""}`}><img src={thumb(active)} alt={`Pochette de ${active.title}`} onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = active.previewSrc || "/skorm-header-logo.webp"; }}/><div className="skorm-tv-equalizer">{Array.from({length:18},(_,index)=><i key={index}/>)}</div><strong>{active.title}</strong><span>{active.artist || active.meta}</span><audio ref={audioRef} src={active.audioSrc || active.src} onEnded={() => setPlaying(false)} /></div>
              : mediaCategory(active) === "Vidéo" && playing ? <iframe src={preview(active)} title={active.title} allow="autoplay; fullscreen" allowFullScreen />
              : mediaCategory(active) === "Story" && active.storyChannel ? <div className="skorm-tv-story skorm-tv-no-story"><img src={thumb(active)} alt={active.title}/><InstagramGlyph/><strong>{active.artist || active.title}</strong><p>Pas de story aujourd’hui… dommage&nbsp;! 👀</p><small>Reviens vite, ça peut changer à tout moment.</small></div>
              : mediaCategory(active) === "Story" && isStoryVideo(active) ? <video ref={storyVideoRef} className="skorm-tv-story-media" src={active.src} autoPlay={playing} playsInline onEnded={() => setPlaying(false)} />
              : mediaCategory(active) === "Story" ? <img className="skorm-tv-story-media" src={active.src || thumb(active)} alt={`Story ${active.artist || active.title}`} />
              : <img src={thumb(active)} alt={`${active.title} · ${active.meta}`} />}
            {active && <button className="skorm-tv-screen-play" onClick={() => void togglePlayback()}>{playing ? <Pause /> : <Play fill="currentColor" />}</button>}
          </div>
          <div className="skorm-tv-progress"><button onClick={() => move(-1)} className="skorm-tv-blue-dot" aria-label="Précédent"/><span><i style={{ width: `${visible.length ? ((activeIndex + 1) / visible.length) * 100 : 0}%` }} /></span><button onClick={() => move(1)} className="skorm-tv-blue-dot" aria-label="Suivant"/></div>
        </div>

        <aside className="skorm-tv-info">
          <small>{active ? "EN LECTURE" : "SIGNAL SKORM"}</small>
          <h3>{active?.artist || active?.title || "SKORM"}</h3>
          <strong>{activeCategory === "Story" ? instagramHandle(active) : active?.title || "MODE TV"}</strong>
          <p>{active?.description || active?.meta || "Photos, vidéos et stories du roster."}</p>
          <dl><div><dt>TYPE</dt><dd>{activeCategory}</dd></div>{activeCategory === "Story" && <div><dt>INSTA</dt><dd>{instagramHandle(active)}</dd></div>}<div><dt>LIEU</dt><dd>{active?.location || "—"}</dd></div><div><dt>DATE</dt><dd>{active?.date || "—"}</dd></div>{activeCategory !== "Story" && <div><dt>DURÉE</dt><dd>{active?.duration || "—"}</dd></div>}</dl>
        </aside>

        <aside className="skorm-tv-remote" aria-label="Télécommande SKORM TV">
          <button onClick={() => { audioRef.current?.pause(); setAwake((value) => !value); setPlaying(false); }} aria-label="Allumer ou éteindre"><Power /></button>
          <div className="skorm-tv-remote-pad"><button onClick={() => shiftCategory(-1)}><ChevronUp /></button><button onClick={() => move(-1)}><ChevronLeft /></button><button onClick={() => { setAwake(true); void togglePlayback(); }}>{playing ? <Pause /> : <Play fill="currentColor" />}</button><button onClick={() => move(1)}><ChevronRight /></button><button onClick={() => shiftCategory(1)}><ChevronDown /></button></div>
          <div className="skorm-tv-volume"><button onClick={() => setVolume(Math.max(0, volume - 10))}><Volume1 /></button><span>{volume}</span><button onClick={() => setVolume(Math.min(100, volume + 10))}><Volume2 /></button></div>
        </aside>
      </div>

      <div className="skorm-tv-preview-shell">
        <button className="skorm-tv-blue-dot" onClick={() => move(-1)} aria-label="Précédent" />
        <div className="skorm-tv-previews" ref={railRef}>
          {visible.map((item, index) => <button key={item.id} className={awake && index === activeIndex ? "active" : ""} onClick={() => { setActiveIndex(index); setAwake(true); setPlaying(false); }}><img src={thumb(item)} alt="" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = item.previewSrc || "/skorm-header-logo.webp"; }}/><span><strong>{item.artist || item.title}</strong><small>{item.storyChannel ? "Aucune story en ligne" : item.meta}</small></span></button>)}
        </div>
        <button className="skorm-tv-blue-dot" onClick={() => move(1)} aria-label="Suivant" />
      </div>
    </section>
  );
}
