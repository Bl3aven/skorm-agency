"use client";
import {useState} from 'react';

export function MediaLinkImport({onImport}:{onImport:(item:{title:string;href:string;cover:string;meta:string})=>void}) {
  const [href,setHref]=useState('');
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  async function importUrl(value=href) {
    if(busy || !value.trim()) return;
    setBusy(true);setMessage('');
    try {const response=await fetch('/api/artist/media',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({href:value.trim()})});const data=await response.json();if(!response.ok)throw new Error(data.error);onImport(data);setHref('');setMessage(data.cover?'Titre et miniature importés. Clique ensuite sur Sauvegarder.':'Lien ajouté. Ajoute une image si nécessaire puis sauvegarde.');}catch(error){setMessage(error instanceof Error?error.message:'Import impossible.');}finally{setBusy(false);}
  }
  return <div className="wide"><label>Coller un lien Spotify, SoundCloud, YouTube ou autre plateforme<input type="url" value={href} onChange={e=>setHref(e.target.value)} onPaste={e=>{const value=e.clipboardData.getData('text');setHref(value);window.setTimeout(()=>void importUrl(value),0);}} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();void importUrl();}}} onBlur={()=>{if(href.trim()) void importUrl();}} placeholder="https://…" /></label><button type="button" disabled={busy || !href.trim()} onClick={()=>void importUrl()}>{busy?'Import…':'Importer le lien et sa miniature'}</button><p role="status">{message}</p></div>;
}
