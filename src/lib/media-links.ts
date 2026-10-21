export function mediaLink(raw?: string) {
  if (!raw) return null;
  try {
    const url = new URL(raw.trim());
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return null;
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    url.protocol = 'https:';
    if (host === 'open.spotify.com') {
      const path = url.pathname.replace(/^\/intl-[^/]+/, '').replace(/^\/embed/, '');
      if (!/^\/(track|album|playlist|artist|episode|show)\/[a-zA-Z0-9]+\/?$/.test(path)) return { href:url.href };
      const href = `https://open.spotify.com${path}`;
      return { href, provider:'Spotify', embed:`https://open.spotify.com/embed${path}`, endpoint:`https://open.spotify.com/oembed?url=${encodeURIComponent(href)}`, video:false };
    }
    if (['youtube.com','m.youtube.com','music.youtube.com','youtu.be','youtube-nocookie.com'].includes(host)) {
      const id = host === 'youtu.be' ? url.pathname.split('/')[1] : url.searchParams.get('v') || url.pathname.match(/^\/(?:shorts|live|embed)\/([\w-]+)/)?.[1];
      const list = url.searchParams.get('list');
      if (id && /^[\w-]{11}$/.test(id)) {
        const href = `https://www.youtube.com/watch?v=${id}`;
        return {href,provider:'YouTube',embed:`https://www.youtube.com/embed/${id}`,endpoint:`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(href)}`,thumbnail:`https://i.ytimg.com/vi/${id}/hqdefault.jpg`,video:true};
      }
      if (list && /^[\w-]+$/.test(list)) return {href:url.href,provider:'YouTube',embed:`https://www.youtube.com/embed/videoseries?list=${list}`,video:true};
    }
    if (host === 'soundcloud.com' || host === 'm.soundcloud.com') {
      url.hostname='soundcloud.com';
      return {href:url.href,provider:'SoundCloud',embed:`https://w.soundcloud.com/player/?url=${encodeURIComponent(url.href)}&visual=true&auto_play=false`,endpoint:`https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(url.href)}`,video:false};
    }
    if (host === 'deezer.com') {
      const match=url.pathname.match(/\/(track|album|playlist|artist)\/(\d+)/);
      if(match) return {href:url.href,provider:'Deezer',embed:`https://widget.deezer.com/widget/dark/${match[1]}/${match[2]}`,video:false};
    }
    if (host === 'music.apple.com') return {href:url.href,provider:'Apple Music',embed:url.href.replace('music.apple.com','embed.music.apple.com'),video:false};
    if (host === 'vimeo.com' && /^\/\d+/.test(url.pathname)) return {href:url.href,provider:'Vimeo',embed:`https://player.vimeo.com/video/${url.pathname.split('/')[1]}`,video:true};
    return {href:url.href};
  } catch { return null; }
}

export function directAudioUrl(value?: string) {
  if (!value) return '';
  if (value.startsWith('/api/audio-preview/')) return value;
  const link=mediaLink(value);
  if (!link || link.provider) return '';
  return link.href;
}
