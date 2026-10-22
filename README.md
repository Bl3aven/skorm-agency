<div align="center">

# 🎧 SKORM Agency

**Le site officiel de l'agence SKORM — management, communication & booking.

*Design noir immersif • Bilingue FR/EN • Back-office complet*

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com)
[![License](https://img.shields.io/badge/Licence-MIT-green)](LICENSE)

[**skorm-agency.com**](https://skorm-agency.com) · [Voir les artistes](https://skorm-agency.com/artistes) · [Agenda](https://skorm-agency.com/agenda)

</div>

---

## ✨ Présentation

**SKORM** est une agence de management, communication et booking qui fédère des artistes
de **hard techno, rawstyle, dark indus et rave**. Ce dépôt contient le site officiel V2 :
une expérience **noir immersive**, pensée pour les artistes, les bookers et les fans.

> ⚙️ **Capacités** : roster dynamique, agenda des dates, embedding SoundCloud / Spotify /
> Deezer / Apple Music, espace artiste privé, back-office complet, billetterie, i18n FR/EN.

---

## 🚀 Fonctionnalités

- 🎨 **Design noir immersif** — glassmorphism, animations de particules, effet "respiration" sur les boutons
- 🌍 **Bilingue FR / EN** — routage `/` et `/en`, textes complets
- 🎵 **Médias intégrés** — lecteurs SoundCloud, Spotify, Deezer, Apple Music, YouTube, Instagram (embeds officiels)
- 👤 **Roster dynamique** — artistes, profils, photos, sons en avant (featured), réordonnancement admin
- 📅 **Agenda & dates** — événements, statuts, affichage public
- 🎟️ **Booker / contact** — formulaires, demandes de booking, sponsors
- 🔐 **Back-office complet** — admin `/admin` (artistes, événements, médias, prix, demandes, notes, IA) + **espace artiste** `/espace-artiste` (profil, sons, vidéos, agenda privé, notes)
- 🛒 **Commerce** — checkout, prix, formation IA, monitoring

---

## 🧱 Stack technique

| Couche | Technologie |
|--------|-------------|
| **Framework** | [Next.js 15](https://nextjs.org) (`app router`, RSC, standalone) |
| **Langage** | TypeScript (strict) |
| **UI** | React 19 + Tailwind CSS + [lucide-react](https://lucide.dev) |
| **Base de données** | MySQL 8 (via `mysql2`, RPC typées) |
| **Validations** | Zod |
| **Déploiement** | Node.js (CloudLinux / Passenger, o2switch) — `output: standalone` |

---

## 📁 Structure

```
src/
├── app/                    # Routes Next.js (App Router)
│   ├── api/                # API (admin, artist, checkout, v1, audio-preview…)
│   │   ├── admin/          # Back-office (artists, item, pricing, workspace…)
│   │   └── artist/         # Espace artiste (profil, agenda, médias)
│   ├── artistes/           # Pages publiques des artistes
│   ├── en/                 # Version anglaise
│   └── …                   # agence, agenda, contact, cgv, cookies…
├── components/             # Composants React (cards, rails, hero, admin…)
├── lib/                    # Logique métier (db, content, media-links, auth…)
└── app/                    # Styles (globals, noir, noir-motion…)
```

---

## 🛠️ Installation

```bash
# 1. Cloner
git clone https://github.com/Bl3aven/skorm-agency.git
cd skorm-agency

# 2. Installer
npm install

# 3. Configurer l'environnement
cp .env.example .env.local   # (si fourni) sinon renseigner les variables

# 4. Lancer en dev
npm run dev                  # http://localhost:3000

# 5. Build production
npm run build
npm start
```

### Variables d'environnement clés

| Variable | Rôle |
|----------|------|
| `DATABASE_URL` | Connexion MySQL (`mysql://user:***@host:port/db`) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Compte administrateur (back-office) |
| `ADMIN_SESSION_SECRET` / `ADMIN_DB_SECRET` | Sessions & accès DB sécurisés |
| `ARTIST_DEFAULT_PASSWORD` | Mot de passe par défaut des artistes |
| `NEXT_PUBLIC_SITE_URL` | URL publique du site |

> 🔒 **Sécurité** : les secrets sont lus depuis l'environnement (`process.env`), jamais
> commités. Le mot de passe artiste est **roté** et géré par variable d'environnement.

---

## 🔐 Accès

- **Admin** : `/admin` (login via `ADMIN_EMAIL` / `ADMIN_PASSWORD`)
- **Artiste** : `/connexion` (email + mot de passe — `ARTIST_DEFAULT_PASSWORD`)
- L'API `/api/v1/*` est protégée par clé API.

---

## 📄 Licence

MIT — voir [LICENSE](LICENSE).

---

<div align="center">

**SKORM Agency** — *Dark. Raw. Live.*

[🌐 Site](https://skorm-agency.com) · [📅 Agenda](https://skorm-agency.com/agenda) · [📩 Contact](https://skorm-agency.com/contact)

</div>
