export type QuizQuestion = {
  prompt: string;
  options: string[];
  answer: number;
};

export type TrainingLevel = {
  id: string;
  eyebrow: string;
  title: string;
  intro: string;
  lessons: string[];
  exercise: string;
  quiz: QuizQuestion[];
};

function q(prompt: string, options: string[], answer: number): QuizQuestion {
  return { prompt, options, answer };
}

export const MODULE_PASS_SCORE = 8;
export const FINAL_PASS_SCORE = 76;

export const trainingLevels: TrainingLevel[] = [
  {
    id: "foundation-1",
    eyebrow: "Niveau 01",
    title: "Comprendre la création musicale IA",
    intro:
      "Avant de générer, il faut savoir cadrer une intention musicale. Ce niveau pose les bases : logique de génération, interface, méthode d’écoute et premiers choix artistiques.",
    lessons: [
      "Une IA musicale ne colle pas simplement des boucles : elle génère une proposition complète à partir d’une intention, comme un orchestre dirigé par un réalisateur.",
      "La musique générée reste probabiliste : le même prompt peut donner deux résultats très différents. Ce hasard doit être accueilli, puis trié.",
      "Le mode rapide sert à tester une idée en quelques secondes. Le mode avancé sert à contrôler la structure, les paroles, les sections et la direction musicale.",
      "La bibliothèque devient le studio personnel : on y range les essais, les favoris, les versions retenues et les prompts à réutiliser.",
      "Les crédits se gèrent comme un budget créatif : moins d’essais au hasard, plus d’essais préparés et analysés.",
      "Un bon résultat vient rarement du premier essai : il faut écouter, comparer, isoler ce qui fonctionne, puis itérer.",
      "Une demande vague produit souvent un résultat générique. Une demande précise donne une identité plus claire et plus facile à défendre.",
      "La bonne méthode : écrire l’intention, générer peu, noter les forces/faiblesses, corriger un seul axe à la fois.",
    ],
    exercise:
      "Créer trois versions d’un même style prompt et noter ce qui change : énergie, voix, structure, instruments, rendu final.",
    quiz: [
      q("Quel est le rôle principal d’un outil de création musicale IA ?", ["Copier des boucles existantes", "Générer une proposition à partir d’une intention", "Masteriser un fichier WAV", "Publier automatiquement sur Spotify"], 1),
      q("Quand utiliser un mode avancé ou custom ?", ["Quand on veut contrôler paroles et structure", "Uniquement pour exporter", "Pour supprimer les crédits", "Pour créer une playlist"], 0),
      q("Pourquoi comparer plusieurs générations ?", ["Pour choisir au hasard", "Pour repérer ce qui fonctionne et itérer", "Pour réduire la durée du morceau", "Pour éviter d’écrire un prompt"], 1),
      q("Un prompt trop vague donne souvent…", ["Un rendu très personnel", "Un résultat générique", "Un meilleur mixage", "Un fichier plus léger"], 1),
      q("Que faut-il noter après chaque génération ?", ["Le lien, le prompt, les forces et faiblesses", "Uniquement la durée", "Le nom du navigateur", "Le nombre de likes"], 0),
      q("Le mode rapide est surtout utile pour…", ["Tester une idée", "Gérer un contrat", "Créer une pochette", "Envoyer un mail"], 0),
      q("Quelle attitude évite de gaspiller les crédits ?", ["Préparer l’intention avant de générer", "Générer trente versions sans lire", "Changer tout à chaque essai", "Ne jamais écouter jusqu’au bout"], 0),
      q("Une IA comprend mieux une demande si elle contient…", ["Genre, énergie, texture et intention", "Seulement un emoji", "Un texte sans ponctuation", "Un nom de marque"], 0),
      q("Une génération ratée doit d’abord être…", ["Analysée avant d’être jetée", "Publiée immédiatement", "Gardée sans modification", "Transformée en logo"], 0),
      q("Le meilleur workflow est…", ["Idée, prompt, écoute, analyse, itération", "Hasard, export, publication", "Copie, collage, oubli", "Achat, silence, publication"], 0),
    ],
  },
  {
    id: "foundation-2",
    eyebrow: "Niveau 02",
    title: "Écrire une direction musicale précise",
    intro:
      "Un prompt n’est pas une phrase magique. C’est une mini direction artistique : émotion, genre, tempo, texture, voix, énergie et limites.",
    lessons: [
      "Commencer par l’émotion évite de produire un morceau techniquement correct mais vide.",
      "Le genre guide la famille musicale ; l’énergie guide l’usage : club, performance, radio, trailer, introspection.",
      "Un prompt lisible peut suivre une formule simple : genre + énergie + texture + voix + instruments + contexte + exclusions.",
      "Les textures donnent la couleur du son : raw, glossy, distorted, metallic, warm, cinematic, underground.",
      "Le BPM aide à guider le rythme et l’intensité, sans devenir une contrainte absurde.",
      "La tonalité et les instruments sont parfois interprétés, pas toujours appliqués au millimètre : il faut juger le résultat à l’écoute.",
      "Un bon prompt retire autant qu’il ajoute : les exclusions évitent les clichés et les rendus trop génériques.",
      "La meilleure direction tient en peu de mots, mais chaque mot doit avoir une utilité musicale.",
    ],
    exercise:
      "Transformer une idée vague en trois directions : version club, version émotionnelle, version plus expérimentale.",
    quiz: [
      q("Un prompt fort doit d’abord clarifier…", ["L’intention artistique", "La météo", "Le logo", "Le navigateur"], 0),
      q("Le BPM sert à…", ["Guider l’énergie et le rythme", "Garantir un tube", "Choisir une pochette", "Créer une facture"], 0),
      q("Un prompt surchargé risque de…", ["Diluer l’intention", "Améliorer chaque instrument", "Réduire le prix", "Créer un certificat"], 0),
      q("Le mot “metallic” décrit plutôt…", ["Une texture sonore", "Une date de concert", "Un moyen de paiement", "Un format de fichier"], 0),
      q("Pour une identité reproductible, il faut…", ["Conserver une palette de mots-clés cohérente", "Changer totalement de style à chaque essai", "Ne jamais noter ses prompts", "Écrire seulement le titre"], 0),
      q("Le genre musical indique…", ["La famille esthétique du morceau", "Le nombre de vues", "Le nom du manager", "La couleur du bouton"], 0),
      q("L’énergie d’un morceau peut être guidée par…", ["Club, raw, intense, hypnotic", "Adresse email", "CGV", "Numéro de téléphone"], 0),
      q("Une bonne variante change…", ["Quelques paramètres sans perdre l’identité", "Tout le concept", "Le nom de l’artiste uniquement", "La langue du site"], 0),
      q("Quelle formulation est la plus exploitable ?", ["Dark hypnotic techno, 132 BPM, metallic synths, no vocals", "Fais un truc cool", "Musique", "Très bien merci"], 0),
      q("Le prompt expert doit rester…", ["Précis, hiérarchisé et lisible", "Long et contradictoire", "Vide", "Uniquement composé de références"], 0),
    ],
  },
  {
    id: "foundation-3",
    eyebrow: "Niveau 03",
    title: "Structurer un morceau propre",
    intro:
      "Même avec une bonne idée, un morceau peut échouer si la structure est floue. Ce niveau apprend à cadrer les sections, diagnostiquer les ratés et préparer un export propre.",
    lessons: [
      "Les sections comme couplet, refrain, bridge, drop et outro aident l’IA à organiser le morceau et le chant.",
      "Une structure claire évite les morceaux qui tournent en rond ou changent d’idée sans raison.",
      "Les paroles doivent respecter le ton voulu : pas de clichés si l’univers est premium, sombre, techno ou cinématique.",
      "Une génération peut être sauvée si l’idée est bonne mais la structure faible : on corrige alors un axe précis.",
      "Une génération doit être jetée si la voix, le rythme ou l’intention sont incohérents dès la base.",
      "Le diagnostic se fait en cinq points : voix, structure, énergie, texture et intention.",
      "Un export propre doit être nommé, classé et accompagné du prompt utilisé.",
      "Un morceau présentable doit pouvoir être envoyé sans explication confuse : lien clair, titre, version et contexte.",
    ],
    exercise:
      "Réparer une génération faible en modifiant seulement quatre éléments : structure, énergie, voix, texture.",
    quiz: [
      q("À quoi sert une section “refrain” ?", ["Identifier le moment central du morceau", "Changer le prix", "Ouvrir Stripe", "Supprimer une piste"], 0),
      q("Une structure claire aide l’IA à…", ["Organiser le morceau", "Créer un logo", "Envoyer un email", "Signer un contrat"], 0),
      q("Une génération à jeter présente souvent…", ["Une incohérence forte entre intention, voix et rythme", "Un bon refrain", "Une identité claire", "Un export propre"], 0),
      q("Un bon export doit être…", ["Nommé, classé et relié au prompt", "Perdu dans les téléchargements", "Sans information", "Renommé au hasard"], 0),
      q("Les paroles doivent éviter…", ["Les clichés qui cassent l’univers", "La cohérence", "La structure", "La clarté"], 0),
      q("Un drop est utile surtout pour…", ["Marquer une montée ou rupture d’énergie", "Écrire une adresse", "Ajouter une photo", "Créer une facture"], 0),
      q("Avant de relancer une génération, il faut…", ["Identifier précisément ce qui ne va pas", "Tout effacer sans écouter", "Changer uniquement le titre", "Publier"], 0),
      q("Un morceau propre est un morceau…", ["Cohérent, exploitable et présentable", "Long sans raison", "Sans direction", "Impossible à retrouver"], 0),
      q("Le diagnostic d’un morceau analyse…", ["Voix, structure, énergie, texture, intention", "Uniquement le volume", "Uniquement la pochette", "Le nom du navigateur"], 0),
      q("Une modification efficace est…", ["Ciblée et mesurable", "Totale et confuse", "Invisible", "Sans écoute"], 0),
    ],
  },
  {
    id: "foundation-4",
    eyebrow: "Niveau 04",
    title: "Construire un mini-catalogue crédible",
    intro:
      "Le but n’est pas de générer beaucoup, mais de construire une direction identifiable. Ce niveau transforme les essais en catalogue cohérent et présentable.",
    lessons: [
      "Un artiste IA crédible a une direction sonore, visuelle et narrative cohérente.",
      "Un mini-catalogue doit montrer une identité : pas seulement une accumulation de tests sans lien.",
      "Chaque morceau doit avoir un rôle : single, démo, intro live, contenu social, maquette ou univers.",
      "Les meilleurs prompts deviennent une bibliothèque personnelle à améliorer.",
      "Un projet solide note ses versions : ce qui marche, ce qui fatigue, ce qui mérite d’être prolongé.",
      "La présentation compte : titre, description, cover, liens, contexte et storytelling.",
      "Le catalogue doit être court mais défendable : quelques morceaux propres valent mieux que trente essais flous.",
      "La fin du niveau prépare l’autonomie : méthode, identité, écoute critique et capacité à refaire un résultat cohérent.",
    ],
    exercise:
      "Créer cinq prompts personnels cohérents et définir pour chaque morceau son rôle dans le projet.",
    quiz: [
      q("Un mini-catalogue crédible doit montrer…", ["Une identité cohérente", "Des tests sans lien", "Uniquement des titres", "Une liste de prix"], 0),
      q("Un artiste IA doit avoir…", ["Direction sonore, visuelle et narrative", "Seulement un logo", "Uniquement une adresse email", "Aucune histoire"], 0),
      q("Pourquoi garder une bibliothèque de prompts ?", ["Pour reproduire et améliorer une identité", "Pour oublier les meilleurs essais", "Pour vendre des billets", "Pour remplacer l’écoute"], 0),
      q("Un morceau dans le catalogue doit avoir…", ["Un rôle clair", "Un nom au hasard", "Aucune intention", "Un bouton bleu"], 0),
      q("La présentation d’un morceau inclut…", ["Titre, contexte, cover, lien, storytelling", "Seulement le fichier", "Un mot de passe", "Une facture"], 0),
      q("Le storytelling sert à…", ["Rendre le projet lisible et mémorable", "Remplacer la musique", "Créer un paiement", "Cacher le son"], 0),
      q("Une identité cohérente exige…", ["Des choix répétés et maîtrisés", "Un changement total à chaque morceau", "Aucun cadre", "Des prompts secrets non notés"], 0),
      q("Un contenu social peut servir à…", ["Présenter l’univers et tester l’intérêt", "Remplacer toutes les sorties", "Supprimer la stratégie", "Éviter la musique"], 0),
      q("Une démo doit être…", ["Claire, propre et compréhensible", "Inaudible", "Sans nom", "Sans lien"], 0),
      q("La bonne fin de parcours consiste à…", ["Valider un univers et préparer l’examen final", "Tout supprimer", "Changer de projet sans raison", "Ne pas écouter"], 0),
    ],
  },
];

export const expertTrainingLevels: TrainingLevel[] = [
  {
    id: "expert-1",
    eyebrow: "Expert 01",
    title: "Architecture avancée du prompt",
    intro:
      "Le niveau expert commence par une méthode de cadrage plus professionnelle : intention, références d’ambiance, exclusions, structure, contraintes et logique de versions.",
    lessons: [
      "Un prompt expert se lit comme une direction artistique courte : intention claire, vocabulaire précis et priorités assumées.",
      "Les exclusions évitent les clichés : no cheesy lead, no generic vocals, no overcompressed drop.",
      "La hiérarchie du prompt compte : l’outil comprend mieux une demande organisée qu’une liste confuse.",
      "Les références doivent décrire une énergie ou une texture, pas copier une œuvre existante.",
      "La version finale se construit par comparaison : garder, isoler, corriger, relancer.",
    ],
    exercise:
      "Écrire un prompt expert complet avec intention, texture, structure, exclusions et trois variantes contrôlées.",
    quiz: [
      q("Le prompt expert doit rester…", ["Précis, hiérarchisé et lisible", "Long et contradictoire", "Vide", "Uniquement composé de références"], 0),
      q("Une exclusion utile peut être…", ["no vocals, no cheesy lead", "plus fort", "merci", "logo noir"], 0),
      q("Une référence doit surtout transmettre…", ["Une énergie ou texture", "Une copie exacte", "Un mot de passe", "Une facture"], 0),
      q("La hiérarchie du prompt aide à…", ["Clarifier les priorités", "Rendre le morceau plus long", "Supprimer le mixage", "Cacher l’intention"], 0),
      q("Une variante contrôlée change…", ["Un paramètre précis", "Toute la direction", "Uniquement le nom", "Rien"], 0),
      q("Un signal faible est…", ["Une demande vague sans priorité", "Une direction claire", "Une exclusion utile", "Un export propre"], 0),
      q("Une bonne itération commence par…", ["L’écoute critique", "Le hasard", "La publication", "La suppression"], 0),
      q("Le vocabulaire de texture sert à…", ["Colorer le son", "Choisir une police", "Acheter un domaine", "Créer un compte"], 0),
      q("Trop de références peuvent…", ["Diluer l’identité", "Garantir la qualité", "Créer un master", "Exporter plus vite"], 0),
      q("Le meilleur prompt expert est…", ["Court, dense et actionnable", "Très long et flou", "Sans contrainte", "Uniquement en emojis"], 0),
    ],
  },
  {
    id: "expert-2",
    eyebrow: "Expert 02",
    title: "Sections, Extend et versions longues",
    intro:
      "Ce niveau apprend à construire un morceau exploitable : intro, tension, drop, pont, relance, outro, Extend et corrections ciblées.",
    lessons: [
      "La structure doit raconter une progression : installer, tendre, ouvrir, relancer, terminer.",
      "Extend sert à prolonger une bonne base, pas à sauver une idée faible.",
      "Une relance propre demande une intention claire : plus sombre, plus club, plus vocal, plus minimal.",
      "Les sections doivent être nommées pour guider le moteur et garder une cohérence.",
      "Une version longue doit rester musicale : pas seulement additionner des blocs.",
    ],
    exercise:
      "Partir d’une génération courte et créer une version longue avec intro, drop, pont, outro et notes de correction.",
    quiz: [
      q("Extend sert surtout à…", ["Prolonger une bonne base", "Réparer n’importe quoi", "Créer une facture", "Changer le logo"], 0),
      q("Une version longue réussie doit…", ["Raconter une progression", "Empiler des blocs au hasard", "Supprimer l’intro", "Ignorer le drop"], 0),
      q("Une relance doit préciser…", ["La direction de correction", "Le prix", "L’email", "Le navigateur"], 0),
      q("Les sections aident à…", ["Guider la structure", "Rendre le son gratuit", "Créer un compte", "Changer les CGV"], 0),
      q("Un pont sert souvent à…", ["Créer une respiration ou transition", "Remplacer tout le morceau", "Supprimer la voix", "Ajouter une facture"], 0),
      q("Un mauvais Extend peut produire…", ["Une suite incohérente", "Un meilleur logo", "Un paiement", "Un certificat"], 0),
      q("La progression d’un morceau se pense en…", ["Tension, relâchement et dynamique", "Hasard uniquement", "Prix et devis", "Photos et footer"], 0),
      q("Une correction ciblée est…", ["Un changement précis et mesurable", "Un changement total", "Une absence d’écoute", "Une suppression"], 0),
      q("L’outro doit…", ["Fermer le morceau proprement", "Ouvrir Stripe", "Cacher le refrain", "Faire disparaître l’export"], 0),
      q("Le meilleur usage d’Extend vient après…", ["Une écoute et un diagnostic", "Une publication immédiate", "Un paiement", "Un changement de police"], 0),
    ],
  },
  {
    id: "expert-3",
    eyebrow: "Expert 03",
    title: "Workflow studio, DAW et export",
    intro:
      "L’objectif est de passer d’une génération intéressante à un rendu présentable : tri, stems, nettoyage, EQ, arrangement, export et documentation.",
    lessons: [
      "Un bon workflow sépare création, sélection, correction et finition.",
      "Le DAW sert à organiser, nettoyer, équilibrer, couper et préparer le morceau.",
      "L’EQ corrige les zones trop agressives ou trop floues sans détruire l’identité.",
      "Les stems permettent de travailler plus finement quand la source le permet.",
      "Un export professionnel doit être nommé, versionné, sauvegardé et documenté.",
    ],
    exercise:
      "Préparer une fiche d’export : titre, version, prompt, corrections, outils, points forts et limites.",
    quiz: [
      q("Un DAW sert principalement à…", ["Organiser et finaliser le son", "Créer une adresse email", "Remplacer toute écoute", "Changer le nom du site"], 0),
      q("L’EQ permet de…", ["Corriger des zones de fréquence", "Écrire un contrat", "Acheter un ticket", "Créer une cover automatiquement"], 0),
      q("Les stems sont utiles pour…", ["Travailler des éléments séparés", "Créer un mot de passe", "Supprimer la structure", "Éviter l’export"], 0),
      q("Un export pro doit être…", ["Nommé, versionné et documenté", "Sans nom", "Perdu dans le dossier téléchargement", "Envoyé sans contexte"], 0),
      q("La finition commence après…", ["La sélection d’une bonne base", "Le hasard", "La newsletter", "Le logo"], 0),
      q("Une correction EQ excessive peut…", ["Détruire l’identité du morceau", "Garantir un hit", "Créer une vidéo", "Ouvrir un compte"], 0),
      q("La documentation sert à…", ["Retrouver la méthode et reproduire le résultat", "Rendre le fichier plus lourd", "Créer un bouton", "Cacher les erreurs"], 0),
      q("Le tri des versions permet de…", ["Identifier la meilleure base", "Tout publier", "Tout supprimer", "Changer la langue"], 0),
      q("Un rendu présentable doit être…", ["Cohérent, propre et contextualisé", "Fort uniquement", "Sans titre", "Sans intention"], 0),
      q("Le workflow pro sépare…", ["Création, sélection, correction, finition", "Hasard, oubli, publication", "Prix, logo, footer", "Email, domaine, CGV"], 0),
    ],
  },
  {
    id: "expert-4",
    eyebrow: "Expert 04",
    title: "Voix, personas et identité d’artiste IA",
    intro:
      "La voix et l’univers doivent être pensés comme une marque artistique : cohérence, persona, storytelling, limites éthiques et présentation publique.",
    lessons: [
      "Une persona vocale doit servir l’univers, pas juste impressionner techniquement.",
      "La cohérence entre voix, image, texte et son rend le projet plus crédible.",
      "Le clonage ou l’imitation doivent être traités avec prudence et autorisations adaptées.",
      "Un artiste IA a besoin d’une narration claire : origine, esthétique, intention, territoire.",
      "La sortie finale doit être présentée avec contexte, visuel, description et stratégie de diffusion.",
    ],
    exercise:
      "Définir une fiche d’artiste IA : nom, univers, voix, esthétique, règles, limites et premier plan de sortie.",
    quiz: [
      q("Une persona vocale doit servir…", ["L’univers artistique", "Le hasard", "Le prix", "Le footer"], 0),
      q("La cohérence d’un artiste IA repose sur…", ["Son, image, texte et narration", "Un seul prompt", "Un logo seulement", "Aucune direction"], 0),
      q("L’imitation vocale demande…", ["Prudence et autorisations adaptées", "Aucune règle", "Une publication immédiate", "Un simple emoji"], 0),
      q("Le storytelling sert à…", ["Rendre l’artiste lisible", "Remplacer la musique", "Cacher le projet", "Supprimer le son"], 0),
      q("Une sortie finale doit inclure…", ["Contexte, visuel, description et stratégie", "Uniquement le fichier", "Un mot de passe", "Une capture floue"], 0),
      q("Un artiste IA crédible évite…", ["Les incohérences fortes d’univers", "La clarté", "La documentation", "La cohérence"], 0),
      q("La voix doit être choisie selon…", ["L’intention du projet", "Le hasard uniquement", "Le prix du domaine", "La taille du bouton"], 0),
      q("Une fiche artiste utile contient…", ["Nom, univers, voix, esthétique, limites", "Uniquement un prénom", "Un lien cassé", "Une facture"], 0),
      q("La stratégie de diffusion sert à…", ["Présenter le morceau au bon endroit", "Éviter l’écoute", "Supprimer les liens", "Changer la police"], 0),
      q("Le niveau expert se termine par…", ["Un examen et une composition expliquée", "Un simple like", "Une photo", "Un paiement sans cours"], 0),
    ],
  },
];

const foundationFinalBase: QuizQuestion[] = [
  q("Quel est l’objectif d’un prompt musical ?", ["Donner une direction exploitable", "Remplacer l’écoute", "Créer une facture", "Choisir un mot de passe"], 0),
  q("Une identité sonore cohérente vient de…", ["Choix répétés et maîtrisés", "Hasard permanent", "Prompts contradictoires", "Absence de notes"], 0),
  q("Le mode avancé est utile pour…", ["Contrôler structure et paroles", "Changer la carte bancaire", "Publier sur Instagram", "Créer une newsletter"], 0),
  q("Un prompt trop vague donne souvent…", ["Un rendu générique", "Un rendu plus premium", "Une vidéo", "Un contrat"], 0),
  q("La texture sonore décrit…", ["La couleur du son", "Le prix de la formation", "Le nom du compte", "La ville de l’artiste"], 0),
  q("Le BPM permet de guider…", ["Le rythme et l’énergie", "Le logo", "La facture", "Le footer"], 0),
  q("Pourquoi utiliser des sections ?", ["Structurer le morceau", "Payer Stripe", "Créer un visuel", "Supprimer un compte"], 0),
  q("Une génération exploitable doit être…", ["Cohérente avec l’intention", "Longue à tout prix", "Sans structure", "Impossible à classer"], 0),
  q("Le diagnostic d’un morceau regarde…", ["Voix, rythme, structure, texture, intention", "Seulement le volume", "Seulement le nom", "Seulement le navigateur"], 0),
  q("Un artiste IA crédible a besoin…", ["D’un univers clair", "D’un seul prompt vide", "D’aucune image", "D’aucun suivi"], 0),
  q("Le meilleur usage des crédits consiste à…", ["Préparer avant de générer", "Générer sans écouter", "Tout publier", "Ne rien comparer"], 0),
  q("Une variante doit changer…", ["Quelques paramètres ciblés", "Toute l’identité", "Uniquement la date", "Le nom du navigateur"], 0),
  q("Une bibliothèque de prompts sert à…", ["Capitaliser sur ce qui marche", "Perdre les idées", "Bloquer l’export", "Remplacer la musique"], 0),
  q("Le storytelling musical sert à…", ["Rendre le projet lisible", "Cacher une mauvaise intention", "Remplacer le son", "Éviter les titres"], 0),
  q("Un export propre doit contenir…", ["Fichier nommé et contexte", "Aucune information", "Un nom aléatoire", "Une capture floue"], 0),
  q("Pour éviter le rendu générique, il faut…", ["Préciser émotion, texture et direction", "Écrire “fais un hit”", "Ne rien écrire", "Changer seulement le titre"], 0),
  q("Le genre musical guide…", ["La famille esthétique", "Le statut admin", "Le paiement", "Le footer"], 0),
  q("Un morceau pour le club demande souvent…", ["Énergie, dynamique et intention live", "Uniquement des paroles longues", "Une bio", "Un devis"], 0),
  q("Quand une génération doit-elle être jetée ?", ["Quand elle trahit l’intention globale", "Quand elle est bien nommée", "Quand elle est cohérente", "Quand elle a une bonne base"], 0),
  q("La fin d’un parcours de formation doit valider…", ["Compréhension, méthode et autonomie", "Uniquement le paiement", "La couleur du site", "Le logo"], 0),
];

const expertFinalBase: QuizQuestion[] = [
  ...expertTrainingLevels.flatMap((level) => level.quiz.slice(0, 5)),
  q("Dans l’épreuve pratique expert, il faut soumettre…", ["Un morceau et une explication de méthode", "Uniquement une capture", "Un logo", "Un mot de passe"], 0),
  q("Une analyse professionnelle doit inclure…", ["Intention, outils, prompts, corrections, export", "Seulement le titre", "Uniquement le prix", "Une phrase vague"], 0),
  q("Une composition finale crédible doit prouver…", ["Méthode, cohérence et autonomie", "Hasard", "Vitesse uniquement", "Budget publicitaire"], 0),
  q("La certification expert valide…", ["La capacité à produire et expliquer un rendu complet", "Un simple achat", "Une présence Instagram", "Une adresse mail"], 0),
  q("Le meilleur dossier final est…", ["Clair, vérifiable et bien documenté", "Flou et incomplet", "Sans lien", "Sans explication"], 0),
];

export const finalExam: QuizQuestion[] = Array.from({ length: 100 }, (_, index) => {
  const base = foundationFinalBase[index % foundationFinalBase.length];
  return { ...base, prompt: `${index + 1}. ${base.prompt}` };
});

export const expertFinalExam: QuizQuestion[] = Array.from({ length: 100 }, (_, index) => {
  const base = expertFinalBase[index % expertFinalBase.length];
  return { ...base, prompt: `${index + 1}. ${base.prompt}` };
});

function distributeAnswers(questions: QuizQuestion[], seed = 0): QuizQuestion[] {
  return questions.map((question, index) => {
    const offset = ((index + seed) % (question.options.length - 1)) + 1;
    const rotated = question.options.map((_, optionIndex) => question.options[(optionIndex + offset) % question.options.length]);
    const answer = rotated.findIndex((option) => option === question.options[question.answer]);
    return { ...question, options: rotated, answer };
  });
}

trainingLevels.forEach((level, index) => {
  level.quiz = distributeAnswers(level.quiz, index);
});

expertTrainingLevels.forEach((level, index) => {
  level.quiz = distributeAnswers(level.quiz, index + 2);
});

finalExam.forEach((question, index) => {
  const shuffled = distributeAnswers([question], index)[0];
  question.options = shuffled.options;
  question.answer = shuffled.answer;
});

expertFinalExam.forEach((question, index) => {
  const shuffled = distributeAnswers([question], index + 3)[0];
  question.options = shuffled.options;
  question.answer = shuffled.answer;
});
