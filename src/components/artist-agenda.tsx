"use client";
import { useEffect, useState, type FormEvent } from "react";

type Entry = { id: string; title: string; starts_at: string; ends_at?: string | null; location: string; notes: string; image_url?: string; visibility: "private" | "public" };
function dayKey(date: Date) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`; }
function localTime(value: string) { const date = new Date(value); return `${dayKey(date)}T${String(date.getHours()).padStart(2,"0")}:${String(date.getMinutes()).padStart(2,"0")}`; }

export function ArtistAgenda({ action }: { action: "agenda" | "date" | "notes" }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [note, setNote] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [imagesEnabled, setImagesEnabled] = useState(false);
  const [image, setImage] = useState("");
  const [imageBusy, setImageBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selected, setSelected] = useState(() => dayKey(new Date()));
  const [editing, setEditing] = useState<Entry | null>(null);
  const [showForm, setShowForm] = useState(action === "date");
  const [allDates, setAllDates] = useState(true);
  const [visibility, setVisibility] = useState<"private" | "public">(action === "date" ? "public" : "private");

  async function load(signal?: AbortSignal) {
    const response = await fetch("/api/artist/agenda", { cache: "no-store", signal });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    setEntries(data.events); setNote(data.note); setImagesEnabled(Boolean(data.imagesEnabled)); setLoaded(true);
  }
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/artist/agenda", { cache: "no-store", signal: controller.signal })
      .then(async response => { const data = await response.json(); if (!response.ok) throw new Error(data.error); return data; })
      .then(data => { setEntries(data.events); setNote(data.note); setImagesEnabled(Boolean(data.imagesEnabled)); setLoaded(true); })
      .catch(error => { if (!controller.signal.aborted) setMessage(error.message); });
    return () => controller.abort();
  }, []);

  async function send(payload: object) {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/artist/agenda", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      await load(); setMessage("Enregistré."); return true;
    } catch (error) { setMessage(error instanceof Error ? error.message : "Enregistrement impossible."); return false; }
    finally { setBusy(false); }
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const starts_at = new Date(String(form.get("start"))).toISOString();
    const ends_at = form.get("end") ? new Date(String(form.get("end"))).toISOString() : null;
    if (await send({ action: "event", id: editing?.id, visibility, title: form.get("title"), starts_at, ends_at, location: form.get("location"), notes: form.get("notes") || "", ...(visibility === "public" && imagesEnabled ? { image_url: image } : {}) })) {
      setSelected(dayKey(new Date(starts_at))); setMonth(new Date(new Date(starts_at).getFullYear(),new Date(starts_at).getMonth(),1));
      setEditing(null); setShowForm(false);
      setMessage(visibility === "public" ? "Date publiée sur ta page artiste et dans l’agenda public." : "Rendez-vous enregistré dans ton agenda privé.");
    }
  }
  const days = new Date(month.getFullYear(),month.getMonth()+1,0).getDate();
  const offset = (month.getDay()+6)%7;
  const selectedEntries = entries.filter(e => allDates || dayKey(new Date(e.starts_at)) === selected).sort((a,b)=>a.starts_at.localeCompare(b.starts_at));

  return <section className="artist-agenda">
    <h2>{action === "notes" ? "Mon bloc-notes" : "Mon agenda"}</h2>
    <p>Les rendez-vous et notes restent hors du site public. Les dates publiques apparaissent sur ta page. L’équipe SKORM peut accéder au planning privé.</p>
    <p role="status">{message || (!loaded ? "Chargement…" : "")}</p>
    {!loaded && message && <button onClick={() => load().catch(e => setMessage(e.message))}>Réessayer</button>}
    {loaded && action !== "notes" && <>
      <div className="artist-calendar-heading"><button aria-label="Mois précédent" onClick={() => setMonth(new Date(month.getFullYear(),month.getMonth()-1,1))}>←</button><strong>{month.toLocaleDateString("fr-FR",{month:"long",year:"numeric"})}</strong><button aria-label="Mois suivant" onClick={() => setMonth(new Date(month.getFullYear(),month.getMonth()+1,1))}>→</button></div>
      <div className="artist-calendar">
        {["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].map(d=><small key={d}>{d}</small>)}
        {Array.from({length:offset},(_,i)=><span key={`blank-${i}`} />)}
        {Array.from({length:days},(_,i)=>{ const key=dayKey(new Date(month.getFullYear(),month.getMonth(),i+1)); const list=entries.filter(e=>dayKey(new Date(e.starts_at))===key); return <button key={key} aria-pressed={selected===key} onClick={()=>setSelected(key)}><span>{i+1}</span><small>{list.length ? `${list.length} •` : " "}</small></button>; })}
      </div>
      <div className="artist-agenda-actions"><button aria-pressed={allDates} onClick={()=>setAllDates(true)}>Toutes mes dates ({entries.length})</button><button aria-pressed={!allDates} onClick={()=>setAllDates(false)}>Jour sélectionné</button></div>
      <h3>{allDates ? "Toutes mes dates enregistrées" : new Date(`${selected}T12:00`).toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}</h3>
      {!selectedEntries.length && <p>Aucune date ce jour.</p>}
      {selectedEntries.map(e=><article className="artist-agenda-entry" key={e.id}><small>{e.visibility === "private" ? "🔒 Privé" : "Public"} · {new Date(e.starts_at).toLocaleString("fr-FR",{dateStyle:"medium",timeStyle:"short"})}</small><h3>{e.title}</h3><p>{e.location}</p>{e.image_url && <img src={e.image_url} alt={`Affiche ${e.title}`} style={{maxWidth:240,maxHeight:240,objectFit:"contain"}} />}{e.notes && <p style={{whiteSpace:"pre-wrap"}}>{e.notes}</p>}<div><button disabled={busy} onClick={()=>{setEditing(e);setVisibility(e.visibility);setImage(e.image_url || "");setShowForm(true);}}>Modifier</button><button disabled={busy} onClick={async()=>{if(window.confirm(e.visibility === "public" ? "Supprimer cette date publique ? Elle sera retirée de ta page et de l’agenda du site." : "Supprimer ce rendez-vous privé ?")) { if(await send({action:"delete",id:e.id,visibility:e.visibility})) {setEditing(null);setShowForm(false);setMessage("Date supprimée.");} }}}>Supprimer</button></div></article>)}
      <div className="artist-agenda-actions"><button onClick={()=>{setEditing(null);setVisibility("private");setImage("");setShowForm(true);}}>+ Rendez-vous privé</button><button onClick={()=>{setEditing(null);setVisibility("public");setImage("");setShowForm(true);}}>+ Date publique</button></div>
      {showForm && <form key={editing?.id || `${visibility}-${selected}`} className="artist-private-fields" onSubmit={save}>
        <h3 className="wide">{editing ? "Modifier cette date" : visibility === "public" ? "Publier une date sur ma page" : "Rendez-vous privé"}</h3>
        <label className="wide">Titre<input name="title" required minLength={2} maxLength={180} defaultValue={editing?.title} /></label>
        <label>Début (heure locale)<input name="start" type="datetime-local" required defaultValue={editing ? localTime(editing.starts_at) : `${selected}T20:00`} /></label>
        {visibility === "private" && <label>Fin<input name="end" type="datetime-local" defaultValue={editing?.ends_at ? localTime(editing.ends_at) : ""} /></label>}
        <label className="wide">Lieu / ville<input name="location" maxLength={240} required={visibility === "public"} defaultValue={editing?.location} /></label>
        {visibility === "public" && imagesEnabled && <div className="wide">
          <label>Affiche / image<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy || imageBusy} onChange={async e=>{
            const file=e.currentTarget.files?.[0]; e.currentTarget.value=""; if(!file) return;
            if(file.size>10000000 || !["image/jpeg","image/png","image/webp"].includes(file.type)) {setMessage("Choisis une image JPG, PNG ou WebP de moins de 10 Mo.");return;}
            setImageBusy(true);
            try {const bitmap=await createImageBitmap(file);const ratio=Math.min(1,1200/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement("canvas");canvas.width=Math.round(bitmap.width*ratio);canvas.height=Math.round(bitmap.height*ratio);canvas.getContext("2d")!.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();const value=canvas.toDataURL("image/jpeg",0.8);if(value.length>2000000)throw new Error();setImage(value);setMessage("");}catch{setMessage("Impossible de lire cette image. Essaie un autre fichier.");}finally{setImageBusy(false);}
          }} /></label>
          {image && <><img src={image} alt="Aperçu de l’affiche" style={{maxWidth:"100%",maxHeight:280,objectFit:"contain"}} /><button type="button" onClick={()=>setImage("")}>Retirer l’image</button></>}
        </div>}
        {visibility === "private" && <label className="wide">Notes privées<textarea name="notes" maxLength={2000} rows={4} defaultValue={editing?.notes} /></label>}
        <button disabled={busy || imageBusy}>{busy ? "Enregistrement…" : editing ? "Enregistrer les modifications" : visibility === "public" ? "Publier cette date" : "Enregistrer"}</button><button type="button" disabled={busy} onClick={()=>setShowForm(false)}>Annuler</button>
      </form>}
    </>}
    {loaded && <section className="artist-notebook"><h3>Bloc-notes privé</h3><textarea aria-label="Mes notes privées" rows={8} maxLength={20000} value={note} onChange={e=>setNote(e.target.value)} placeholder="Idées, préparation d’un set, choses à prévoir…" /><button disabled={busy} onClick={()=>void send({action:"note",content:note})}>{busy ? "Enregistrement…" : "Enregistrer mes notes"}</button></section>}
  </section>;
}
