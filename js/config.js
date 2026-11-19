/* =========================================================
   CONFIG.JS — les listes de choix de ton journal
   Modifie les textes et les couleurs comme tu veux.
   ========================================================= */
window.CONFIG = {

  // Valeurs de départ (tu pourras ensuite tout changer dans « Personnaliser »)
  nomParDefaut: 'Mon Journal',
  sousTitre: 'mes pensées, mes jours',
  citationParDefaut: 'Chaque jour est une nouvelle page.',

  // Ambiances : l'identifiant doit correspondre à un bloc [data-ambiance="..."] de css/theme.css
  AMBIANCES: [
    { id: 'rose',    nom: 'Rose poudré', apercu: '#FFF5F8' },
    { id: 'lavande', nom: 'Lavande',     apercu: '#F6F1FB' },
    { id: 'peche',   nom: 'Pêche',       apercu: '#FFF4EE' },
    { id: 'nuit',    nom: 'Nuit rose',   apercu: '#22131F' }
  ],

  // Couleur principale (boutons, titre…). Choisis des couleurs assez foncées
  // pour que le texte blanc reste lisible dessus.
  COULEURS: [
    { nom: 'Framboise', code: '#B8336A' },
    { nom: 'Orchidée',  code: '#9C4DCC' },
    { nom: 'Corail',    code: '#C2410C' },
    { nom: 'Prune',     code: '#7A4A8C' },
    { nom: 'Rose vif',  code: '#C2185B' }
  ],

  // Polices proposées pour écrire (elles doivent être chargées dans index.html)
  POLICES: [
    { nom: 'Élégante',   css: "'Playfair Display', Georgia, serif", taille: 18 },
    { nom: 'Manuscrite', css: "'Dancing Script', cursive",           taille: 24 },
    { nom: 'Douce',      css: "'Nunito', system-ui, sans-serif",     taille: 17 }
  ],

  // Styles de papier
  PAPIERS: [
    { id: 'lignes', nom: 'Lignes' },
    { id: 'points', nom: 'Points' },
    { id: 'blanc',  nom: 'Blanche' }
  ],

  // Humeurs proposées sous chaque page
  HUMEURS: ['Radieuse', 'Sereine', 'Fatiguée', 'Pensive', 'Amoureuse'],

  // Catégories des plannings du calendrier (couleurs foncées = texte blanc lisible)
  CATEGORIES: [
    { id: 'moi',    nom: 'Moi & bien-être',  couleur: 'accent' },   // 'accent' = la couleur principale
    { id: 'etudes', nom: 'Études / travail', couleur: '#8E44AD' },
    { id: 'amis',   nom: 'Sorties & amis',   couleur: '#A8611A' },
    { id: 'sport',  nom: 'Sport',            couleur: '#1F7A6B' },
    { id: 'autre',  nom: 'Autre',            couleur: '#6B5B73' }
  ],

  // Calendrier
  semaineCommenceLundi: true,
  heureDebutAffichee: 8      // l'heure visible en haut quand tu ouvres le calendrier
};
