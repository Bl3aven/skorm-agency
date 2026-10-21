export const commerce = {
  sunoEssential: {
    key: "suno-essential",
    name: "Formation IA musicale - Fondations",
    price: Number(process.env.NEXT_PUBLIC_SUNO_ESSENTIAL_PRICE_CENTS || 25000),
    currency: "eur",
    displayPrice: process.env.NEXT_PUBLIC_SUNO_ESSENTIAL_PRICE_LABEL || "250 €",
  },
  sunoExpert: {
    key: "suno-expert",
    name: "Formation IA musicale - Production Expert",
    price: Number(process.env.NEXT_PUBLIC_SUNO_EXPERT_PRICE_CENTS || 59000),
    currency: "eur",
    displayPrice: process.env.NEXT_PUBLIC_SUNO_EXPERT_PRICE_LABEL || "590 €",
  },
} as const;

export const aiTrainingPrices = [
  {
    title: "Création musicale IA - Fondations",
    titleEn: "AI Music Creation - Foundations",
    price: "250 €",
    text: "Accès illimité au niveau 1 : méthode, prompts, structure, QCM par niveau et examen final.",
    textEn: "Unlimited access to level 1: method, prompts, structure, level quizzes and final exam.",
    active: true,
  },
  {
    title: "Production musicale IA - Expert",
    titleEn: "AI Music Production - Expert",
    price: "590 €",
    text: "Parcours expert complet : workflow studio, voix/personas, examen final et composition à valider. Paiement en 3 fois possible.",
    textEn: "Full expert track: studio workflow, voices/personas, final exam and composition submission. Payment in 3 installments available.",
    active: true,
  },
  {
    title: "Formation en groupe",
    titleEn: "Group training",
    price: "Sur devis",
    text: "Pour écoles, collectifs, labels ou structures qui veulent former plusieurs profils avec un programme adapté.",
    textEn: "For schools, collectives, labels or teams training several profiles.",
    active: false,
  },
];
