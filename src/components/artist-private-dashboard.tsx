"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, ImagePlus, Music2, Plus, Trash2, Video, UserRound } from "lucide-react";
import { ArtistAgenda } from "@/components/artist-agenda";
import { MediaLinkImport } from "@/components/media-link-import";
import { artistBpms, artistGenres, artistStyles } from "@/lib/artist-filters";
import { mediaLink } from "@/lib/media-links";

type MediaItem = {
  title?: string;
  meta?: string;
  cover?: string;
  href?: string;
  audioUrl?: string;
  fullAudioUrl?: string;
  src?: string;
  previewUrl?: string;
  durationSec?: number | string;
  mediaType?: "photo" | "video";
  showOnHome?: boolean;
  genres?: string[];
  styles?: string[];
  bpm?: string;
  country?: string;
  location?: string;
};

type ArtistPrivateItem = {
  id: string;
  slug: string;
  name: string;
  tagline?: string | null;
  bio?: string | null;
  instagram_url?: string | null;
  image_url?: string | null;
  home_image_url?: string | null;
  featured_sound?: MediaItem | null;
  media_sounds?: MediaItem[] | null;
  media_videos?: MediaItem[] | null;
};

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    if (file.type.startsWith("image/") && typeof window !== "undefined") {
      const reader = new FileReader();
      reader.onload = () => {
        const image = new window.Image();
        image.onload = () => {
          const maxSide = 1200;
          const ratio = Math.min(1, maxSide / Math.max(image.width, image.height));
          const width = Math.max(1, Math.round(image.width * ratio));
          const height = Math.max(1, Math.round(image.height * ratio));
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          canvas.getContext("2d")?.drawImage(image, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.72));
        };
        image.onerror = reject;
        image.src = String(reader.result || "");
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function ImageInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="artist-private-image-field">
      <span>{label}</span>
      <div>{value ? <img src={value} alt="" /> : <><ImagePlus size={18} /> Ajouter une image</>}</div>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder="URL image ou fichier ci-dessous" />
      <input
        type="file"
        accept="image/*"
        onChange={async (event) => {
          const input = event.currentTarget;
          const file = input.files?.[0];
          if (file) onChange(await fileToDataUrl(file));
          input.value = "";
        }}
      />
    </label>
  );
}

export function ArtistPrivateDashboard({ artist }: { artist: ArtistPrivateItem }) {
  const router = useRouter();
  const [tab, setTab] = useState("profil");
  const [saving, setSaving] = useState(false);
  function navigate(next: string) { setTab(next); window.scrollTo({top:0,behavior:"smooth"}); }
  function addSound() { navigate("sons"); }
  const featured = artist.featured_sound || {};
  const [message, setMessage] = useState("");
  const [tagline, setTagline] = useState(artist.tagline || "");
  const [bio, setBio] = useState(artist.bio || "");
  const [instagram, setInstagram] = useState(artist.instagram_url || "");
  const [image, setImage] = useState(artist.image_url || "");
  const [homeImage, setHomeImage] = useState(artist.home_image_url || "");
  const [featuredTitle, setFeaturedTitle] = useState(featured.title || "");
  const [featuredMeta, setFeaturedMeta] = useState(featured.meta || "");
  const [featuredCover, setFeaturedCover] = useState(featured.cover || "");
  const [featuredHref, setFeaturedHref] = useState(featured.href || "");
  const [featuredAudio, setFeaturedAudio] = useState(featured.audioUrl || featured.fullAudioUrl || featured.src || "");
  const [featuredDuration, setFeaturedDuration] = useState(String(featured.durationSec || ""));
  const [featuredPreview, setFeaturedPreview] = useState(featured.previewUrl || "");
  const [genres, setGenres] = useState<string[]>(featured.genres || []);
  const [profileStyles, setProfileStyles] = useState<string[]>(featured.styles || []);
  const [bpm, setBpm] = useState(featured.bpm || "");
  const [country, setCountry] = useState(featured.country || "");
  const [location, setLocation] = useState(featured.location || "");
  const [visuals, setVisuals] = useState<MediaItem[]>(Array.isArray(artist.media_videos) ? artist.media_videos : []);
  const [sounds, setSounds] = useState<MediaItem[]>(
    Array.isArray(artist.media_sounds) && artist.media_sounds.length
      ? artist.media_sounds
      : artist.featured_sound?.title
        ? [artist.featured_sound]
        : [],
  );

  function updateVisual(index: number, patch: Partial<MediaItem>) {
    setVisuals((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setMessage("Enregistrement...");
    try {
    const response = await fetch("/api/artist/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tagline,
        bio,
        instagram_url: instagram,
        image_url: image,
        home_image_url: homeImage,
        featured_sound: {
          title: featuredTitle,
          meta: featuredMeta,
          cover: featuredCover,
          href: featuredHref,
          audioUrl: featuredAudio,
          fullAudioUrl: featuredAudio,
          durationSec: featuredDuration ? Number(featuredDuration) : undefined,
          previewUrl: featuredPreview,
          genres,
          styles: profileStyles,
          bpm,
          country,
          location,
        },
        media_sounds: sounds.filter((item) => item.title || item.href || item.audioUrl).map((item) => ({
          ...item,
          durationSec: item.durationSec ? Number(item.durationSec) : undefined,
        })),
        media_videos: visuals.filter((item) => item.cover || item.href).map((item) => ({
          title: item.title || artist.name,
          meta: item.meta || "Média officiel",
          cover: item.cover || "",
          href: item.href || "",
          mediaType: item.mediaType || "video",
          showOnHome: item.showOnHome !== false,
        })),
      }),
    });
    if (!response.ok) {
      const result = await response.json().catch(()=>({}));
      setMessage(result.error || "Impossible d’enregistrer pour le moment.");
      return;
    }
    setMessage("Sauvegardé.");
    router.refresh();
    } catch { setMessage("Connexion interrompue. Tes modifications restent dans le formulaire : réessaie."); }
    finally { setSaving(false); }
  }

  return (
    <main className="artist-private-shell artist-studio">
      <header className="artist-studio-top"><strong>Mon espace · {artist.name}</strong><details><summary>Menu</summary><nav aria-label="Menu artiste">{[["profil","Mon profil"],["sons","Mes sons"],["videos","Photos et vidéos"],["agenda","Agenda privé"],["date","Ajouter une date publique"],["notes","Bloc-notes"]].map(([value,label])=><button key={value} onClick={e=>{navigate(value);e.currentTarget.closest("details")?.removeAttribute("open");}}>{label}</button>)}<button onClick={e=>{addSound();e.currentTarget.closest("details")?.removeAttribute("open");}}>Ajouter un son</button><a href={`/artistes/${artist.slug}`} target="_blank" rel="noreferrer">Voir ma page publique ↗</a></nav></details></header>
      <section className="artist-private-hero">
        <small>ESPACE ARTISTE SKORM</small>
        <h1>{artist.name}</h1>
        <p>Ta page, tes sons et ton planning, au même endroit.</p>
        <div>
          <a href={`/artistes/${artist.slug}`} target="_blank">Voir ma page publique</a>
        </div>
      </section>

      <section className="artist-private-grid">
        {["agenda","date","notes"].includes(tab) && <ArtistAgenda key={tab} action={tab as "agenda" | "date" | "notes"} />}
        <form hidden={["agenda","date","notes"].includes(tab)} className="artist-private-card artist-private-form" onSubmit={save}>
          <header>
            <span><ImagePlus size={17} /> {tab === "sons" ? "Mes sons" : tab === "videos" ? "Photos et vidéos" : "Mon profil"}</span>
            <button type="submit" disabled={saving}>{saving ? "Enregistrement…" : "Sauvegarder"}</button>
          </header>

          <div className="artist-private-fields" hidden={tab !== "profil"}>
            <label>Style / rôle<input value={tagline} onChange={(event) => setTagline(event.target.value)} /></label>
            <label>Instagram<input value={instagram} onChange={(event) => setInstagram(event.target.value)} placeholder="https://instagram.com/..." /></label>
            <label className="wide">Bio<textarea value={bio} onChange={(event) => setBio(event.target.value)} rows={5} /></label>
            <ImageInput label="Bannière / page artiste" value={image} onChange={setImage} />
            <ImageInput label="Photo affichée sur la home" value={homeImage} onChange={setHomeImage} />
          </div>

          <section className="artist-private-featured" hidden={tab !== "profil"}>
            <h2>Filtres du roster</h2>
            <p>Ces choix servent uniquement à la recherche du roster et ne s’affichent pas en bulles sur ton profil.</p>
            <div className="artist-private-fields">
              <label>Genres<select multiple value={genres} onChange={(event) => setGenres(Array.from(event.currentTarget.selectedOptions, (option) => option.value))}>{artistGenres.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label>Styles<select multiple value={profileStyles} onChange={(event) => setProfileStyles(Array.from(event.currentTarget.selectedOptions, (option) => option.value))}>{artistStyles.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label>BPM<select value={bpm} onChange={(event) => setBpm(event.target.value)}><option value="">Non renseigné</option>{artistBpms.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label>Pays<input value={country} onChange={(event) => setCountry(event.target.value)} placeholder="France" /></label>
              <label>Localisation<input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Paris, Lyon, Bruxelles…" /></label>
            </div>
          </section>

          <section className="artist-private-featured" hidden={tab !== "sons"}>
            <h2><Music2 size={17} /> Son mis en avant</h2>
            <MediaLinkImport onImport={item=>{setFeaturedHref(item.href);setFeaturedTitle(item.title);setFeaturedCover(item.cover);setFeaturedMeta(item.meta);setFeaturedAudio("");setFeaturedPreview("");}} />
            <div className="artist-private-fields">
              <ImageInput label="Miniature officielle" value={featuredCover} onChange={setFeaturedCover} />
              <label>Titre<input value={featuredTitle} onChange={(event) => setFeaturedTitle(event.target.value)} /></label>
              <label>Artiste / plateforme<input value={featuredMeta} onChange={(event) => setFeaturedMeta(event.target.value)} /></label>
              <label className="wide">Lien officiel<input value={featuredHref} onChange={(event) => setFeaturedHref(event.target.value)} /></label>
              <details className="wide"><summary>Options audio avancées (facultatif)</summary><label className="wide">Audio complet MP3/WAV<input value={featuredAudio} onChange={(event) => setFeaturedAudio(event.target.value)} placeholder="https://.../titre-complet.mp3" /></label>
              <label>Durée en secondes<input value={featuredDuration} onChange={(event) => setFeaturedDuration(event.target.value)} inputMode="numeric" placeholder="Ex : 214" /></label>
              <label className="wide">Preview / secours<input value={featuredPreview} onChange={(event) => setFeaturedPreview(event.target.value)} /></label></details>
            </div>
          </section>

          <section className="artist-private-featured" hidden={tab !== "sons"}>
            <h2><Music2 size={17} /> Derniers sons</h2>
            <p>Ajoute plusieurs titres : ils apparaîtront en cartes dans la section « Derniers sons » de ta page publique.</p>
            <MediaLinkImport onImport={item=>setSounds(current=>[...current.filter(sound=>sound.title||sound.href||sound.audioUrl),item])} />
            {sounds.map((item, index) => (
              <div className="artist-private-fields artist-sound-card" key={`sound-${index}`}>
                <div className="artist-sound-card-heading"><strong>{mediaLink(item.href)?.provider || "Lien officiel"}</strong><span>Son {String(index + 1).padStart(2, "0")}</span></div>
                <ImageInput label="Cover" value={item.cover || ""} onChange={(value) => setSounds((current) => current.map((sound, soundIndex) => soundIndex === index ? { ...sound, cover: value } : sound))} />
                <label>Titre<input value={item.title || ""} onChange={(event) => setSounds((current) => current.map((sound, soundIndex) => soundIndex === index ? { ...sound, title: event.target.value } : sound))} /></label>
                <label>Artiste / plateforme<input value={item.meta || ""} onChange={(event) => setSounds((current) => current.map((sound, soundIndex) => soundIndex === index ? { ...sound, meta: event.target.value } : sound))} /></label>
                <label className="wide">Lien officiel<input value={item.href || ""} onChange={(event) => setSounds((current) => current.map((sound, soundIndex) => soundIndex === index ? { ...sound, href: event.target.value } : sound))} /></label>
                <label className="wide">Audio / preview<input value={item.audioUrl || item.previewUrl || ""} onChange={(event) => setSounds((current) => current.map((sound, soundIndex) => soundIndex === index ? { ...sound, audioUrl: event.target.value, previewUrl: event.target.value } : sound))} /></label>
                <button type="button" onClick={() => setSounds((current) => current.filter((_, soundIndex) => soundIndex !== index))}><Trash2 size={14} /> Retirer</button>
              </div>
            ))}
            <button type="button" onClick={() => setSounds((current) => [...current, { mediaType: "photo" }])}><Plus size={15} /> Ajouter un son</button>
          </section>

          <section className="artist-private-featured" hidden={tab !== "videos"}>
            <h2><Video size={17} /> Photos & vidéos</h2>
            <p>Ces médias apparaissent dans ton diaporama. Active « home » pour les ajouter aussi au diaporama d’accueil.</p>
            {visuals.map((item, index) => (
              <div className="artist-private-fields" key={`visual-${index}`}>
                <label>Type<select value={item.mediaType || "video"} onChange={(event) => updateVisual(index, { mediaType: event.target.value as "photo" | "video" })}><option value="photo">Photo</option><option value="video">Vidéo</option></select></label>
                <label>Titre<input value={item.title || ""} onChange={(event) => updateVisual(index, { title: event.target.value })} /></label>
                <ImageInput label={item.mediaType === "photo" ? "Photo" : "Miniature"} value={item.cover || ""} onChange={(value) => updateVisual(index, { cover: value })} />
                <label className="wide">Source lue dans le site<input value={item.href || ""} onChange={(event) => updateVisual(index, { href: event.target.value })} placeholder="Fichier vidéo, YouTube ou Google Drive" /></label>
                <label><input type="checkbox" checked={item.showOnHome !== false} onChange={(event) => updateVisual(index, { showOnHome: event.target.checked })} /> Aussi sur la home</label>
                <button type="button" onClick={() => setVisuals((current) => current.filter((_, itemIndex) => itemIndex !== index))}><Trash2 size={14} /> Retirer</button>
              </div>
            ))}
            <button type="button" onClick={() => setVisuals((current) => [...current, { mediaType: "photo", showOnHome: true }])}><Plus size={15} /> Ajouter une photo ou vidéo</button>
          </section>
          {message && <p role="status" className="artist-private-message">{message}</p>}
          <button type="submit" disabled={saving}>{saving ? "Enregistrement…" : "Sauvegarder mes modifications"}</button>
        </form>

      </section>
      <nav className="artist-studio-dock" aria-label="Actions artiste">
        <button aria-pressed={tab === "profil"} onClick={()=>navigate("profil")}><UserRound size={20}/>Profil</button>
        <button aria-pressed={tab === "agenda"} onClick={()=>navigate("agenda")}><CalendarDays size={20}/>Agenda</button>
        <button aria-pressed={tab === "date"} onClick={()=>navigate("date")}><Plus size={20}/>Ajouter date</button>
        <button onClick={addSound}><Music2 size={20}/>Ajouter son</button>
      </nav>
    </main>
  );
}
