"use client";

import { Pause, Play, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { mediaLink, directAudioUrl } from "@/lib/media-links";

function getEmbedUrl(href?: string) {
  if (!href) return null;
  const official = mediaLink(href);
  if (official?.embed) return official.embed;
  if (/\.(mp4|webm|mov)(?:\?|$)/i.test(href)) return href;
  try {
    const url = new URL(href);
    if (url.hostname.includes("youtube.com")) {
      const id = url.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : null;
    }
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : null;
    }
    if (url.hostname.includes("instagram.com")) {
      const parts = url.pathname.split("/").filter(Boolean);
      const kind = parts[0];
      const code = parts[1];
      return kind && code ? `https://www.instagram.com/${kind}/${code}/embed` : null;
    }
    if (url.hostname.includes("open.spotify.com")) {
      return href.replace("open.spotify.com/", "open.spotify.com/embed/");
    }
    if (url.hostname.includes("soundcloud.com")) {
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(href)}&auto_play=true&visual=false&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`;
    }
    if (url.hostname.includes("drive.google.com")) {
      const directId = url.pathname.match(/\/file\/d\/([^/]+)/)?.[1] || url.searchParams.get("id");
      return directId ? `https://drive.google.com/file/d/${directId}/preview` : null;
    }
  } catch {
    return null;
  }
  return null;
}

export function MediaPlayButton({
  href,
  audioUrl,
  fullAudioUrl,
  src,
  deezerId,
  previewUrl,
  label = "Lire",
  title,
}: {
  href?: string;
  audioUrl?: string;
  fullAudioUrl?: string;
  src?: string;
  deezerId?: string;
  previewUrl?: string;
  label?: string;
  title: string;
}) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [open, setOpen] = useState(false);
  const playbackHref = [href,audioUrl,fullAudioUrl,previewUrl].find(value => mediaLink(value)?.embed) || href;
  const directAudio = [audioUrl,fullAudioUrl,src,previewUrl].map(directAudioUrl).find(Boolean) || (deezerId ? `/api/audio-preview/${deezerId}` : /\.(mp3|wav|ogg|m4a)(\?|$)/i.test(href || '') ? href : "");
  const embedUrl = useMemo(() => getEmbedUrl(playbackHref), [playbackHref]);
  const compactEmbed = false;
  const isActive = playing;

  useEffect(() => {
    if (!open || compactEmbed) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open, compactEmbed]);

  async function play() {
    if (directAudio) {
      if (!audio.current) return;
      if (playing) {
        audio.current.pause();
        setPlaying(false);
      } else {
        try {
          await audio.current.play();
          setPlaying(true);
        } catch {
          if (embedUrl && compactEmbed) setOpen(true);
          else if (embedUrl) setOpen(true);
          else if (href) setOpen(true);
        }
      }
      return;
    }
    if (embedUrl && compactEmbed) {
      setOpen((current) => !current);
      return;
    }
    if (embedUrl) setOpen(true);
    else if (href) setOpen(true);
  }

  return (
    <>
      {directAudio && (
        <audio ref={audio} src={directAudio} onEnded={() => setPlaying(false)} onError={() => setPlaying(false)} />
      )}
      <button type="button" className="media-play-button" onClick={play} aria-label={`${label} ${title}`}>
        {isActive ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
        <span>{isActive ? "Pause" : label}</span>
      </button>
      {open && embedUrl && compactEmbed && (
        <iframe
          className="media-hidden-player"
          src={embedUrl}
          title={title}
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          aria-hidden="true"
          tabIndex={-1}
        />
      )}
      {open && !compactEmbed && createPortal(
        <div className="media-modal" role="dialog" aria-modal="true" aria-label={title}>
          <button type="button" className="media-modal-close" onClick={() => setOpen(false)} aria-label="Fermer">
            <X size={18} />
          </button>
          <div className="media-modal-frame">
            {embedUrl ? <iframe
              src={embedUrl}
              title={title}
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              allowFullScreen
            /> : <p>Cette plateforme ne propose pas de lecteur intégré pour ce lien.</p>}
            {mediaLink(playbackHref) && <a href={mediaLink(playbackHref)!.href} target="_blank" rel="noreferrer">Ouvrir sur la plateforme ↗</a>}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
