"use client";

import { useMemo, useState } from "react";
import { HomeArtistCard } from "@/components/home-artist-card";
import type { PublicArtist } from "@/lib/public-site-data";
import { artistBpms, artistGenres, artistStyles } from "@/lib/artist-filters";

function cleanRosterText(value = "") {
  return value
    .replace(/쨌|夷/g, "·")
    .replace(/\s+\?\s+/g, " · ")
    .replace(/\s*·\s*/g, " · ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function styleTokens(artist: PublicArtist) {
  return cleanRosterText(artist.genre)
    .split(/·|,|\/|\||-/)
    .map((item) => cleanRosterText(item))
    .filter(Boolean);
}

export function RosterBrowser({ artists }: { artists: PublicArtist[] }) {
  const [query, setQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [styleFilter, setStyleFilter] = useState("");
  const [bpmFilter, setBpmFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  const countries = useMemo(() => Array.from(new Set(artists.map((artist) => artist.filters?.country).filter((item): item is string => Boolean(item)))).sort(), [artists]);
  const locations = useMemo(() => Array.from(new Set(artists.map((artist) => artist.filters?.location).filter((item): item is string => Boolean(item)))).sort(), [artists]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return artists.filter((artist) => {
      const genre = cleanRosterText(artist.genre);
      const matchesQuery =
        !normalizedQuery ||
        [artist.name, genre, artist.bio, artist.role]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      const fallbackTokens = styleTokens(artist).map((item) => item.toLowerCase());
      const matchesGenre = !genreFilter || artist.filters?.genres.includes(genreFilter) || fallbackTokens.includes(genreFilter.toLowerCase());
      const matchesStyle = !styleFilter || artist.filters?.styles.includes(styleFilter) || fallbackTokens.includes(styleFilter.toLowerCase());
      const matchesBpm = !bpmFilter || artist.filters?.bpm === bpmFilter;
      const matchesCountry = !countryFilter || artist.filters?.country === countryFilter;
      const matchesLocation = !locationFilter || artist.filters?.location === locationFilter;
      return matchesQuery && matchesGenre && matchesStyle && matchesBpm && matchesCountry && matchesLocation;
    });
  }, [artists, query, genreFilter, styleFilter, bpmFilter, countryFilter, locationFilter]);

  return (
    <section className="roster-browser" aria-label="Recherche roster">
      <div className="roster-browser-tools">
        <label>
          <span>Rechercher</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nom, style, univers..."
          />
        </label>
        <div className="roster-filter-heading"><strong>Filtrer les artistes</strong><button type="button" onClick={() => { setGenreFilter(""); setStyleFilter(""); setBpmFilter(""); setCountryFilter(""); setLocationFilter(""); }}>Réinitialiser</button></div>
        <div className="roster-filter-selects" aria-label="Filtres du roster">
          <label>Genre<select value={genreFilter} onChange={(event) => setGenreFilter(event.target.value)}><option value="">Tous</option>{artistGenres.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Style<select value={styleFilter} onChange={(event) => setStyleFilter(event.target.value)}><option value="">Tous</option>{artistStyles.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>BPM<select value={bpmFilter} onChange={(event) => setBpmFilter(event.target.value)}><option value="">Tous</option>{artistBpms.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Pays<select value={countryFilter} onChange={(event) => setCountryFilter(event.target.value)}><option value="">Tous</option>{countries.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>Localisation<select value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)}><option value="">Toutes</option>{locations.map((item) => <option key={item}>{item}</option>)}</select></label>
        </div>
      </div>

      <div className="roster-gallery">
        {filtered.map((artist) => (
          <HomeArtistCard
            key={artist.slug}
            artist={artist}
            release={artist.featuredSound || undefined}
          />
        ))}
      </div>

      {!filtered.length && (
        <p className="roster-empty">Aucun artiste ne correspond à cette recherche.</p>
      )}
    </section>
  );
}
