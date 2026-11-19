/* =========================================================
   STICKERS.JS — la planche de stickers
   ---------------------------------------------------------
   Chaque sticker est un petit dessin SVG (format d'image en texte).
   Pour en ajouter un :
     - copie une ligne { id: ..., nom: ..., svg: `...` },
     - donne-lui un id unique (lettres minuscules, sans espace),
     - colle ton SVG entre les accents graves ` `.
   Tu trouves des SVG gratuits sur des sites comme svgrepo.com.
   Le contour blanc « autocollant » est ajouté automatiquement.

   Tu peux aussi ajouter tes propres images directement dans le journal
   (bouton Stickers → « Ajouter mon image »), sans toucher à ce fichier.
   ========================================================= */
window.STICKERS = [
  { id: 'coeur', nom: 'Cœur', svg: `<svg viewBox="0 0 100 100"><path d="M50 88C20 67 7 49 7 32 7 18 18 8 31 8c9 0 15 5 19 12 4-7 10-12 19-12 13 0 24 10 24 24 0 17-13 35-43 56z" fill="#F06292"/><ellipse cx="29" cy="28" rx="9" ry="5.5" fill="#fff" opacity=".55" transform="rotate(-35 29 28)"/></svg>` },

  { id: 'etoile', nom: 'Étoile', svg: `<svg viewBox="0 0 100 100"><path d="M50 8l11.2 28.6 30.6 1.8-23.7 19.5 7.8 29.7L50 71 24.1 87.6l7.8-29.7L8.2 38.4l30.6-1.8z" fill="#FFD54F" stroke="#FFD54F" stroke-width="7" stroke-linejoin="round"/><circle cx="42" cy="52" r="3.2" fill="#4A2340"/><circle cx="58" cy="52" r="3.2" fill="#4A2340"/><path d="M45 59q5 5 10 0" fill="none" stroke="#4A2340" stroke-width="2.6" stroke-linecap="round"/><circle cx="36" cy="59" r="3.5" fill="#F48FB1" opacity=".8"/><circle cx="64" cy="59" r="3.5" fill="#F48FB1" opacity=".8"/></svg>` },

  { id: 'etincelles', nom: 'Étincelles', svg: `<svg viewBox="0 0 100 100"><path d="M44 16c3 24 13 34 36 37-23 3-33 13-36 37-3-24-13-34-36-37 23-3 33-13 36-37z" fill="#CE93D8"/><path d="M78 8c1.5 10 6 14.5 15 16-9 1.5-13.5 6-15 16-1.5-10-6-14.5-15-16 9-1.5 13.5-6 15-16z" fill="#F48FB1"/><path d="M80 66c1 7 4 10 10 11-6 1-9 4-10 11-1-7-4-10-10-11 6-1 9-4 10-11z" fill="#FFD54F"/></svg>` },

  { id: 'fleur', nom: 'Fleur', svg: `<svg viewBox="0 0 100 100"><g fill="#F8BBD0"><circle cx="50" cy="27" r="19"/><circle cx="72" cy="43" r="19"/><circle cx="64" cy="69" r="19"/><circle cx="36" cy="69" r="19"/><circle cx="28" cy="43" r="19"/></g><circle cx="50" cy="50" r="15" fill="#FFD54F"/><circle cx="45" cy="47" r="2.5" fill="#4A2340"/><circle cx="55" cy="47" r="2.5" fill="#4A2340"/><path d="M46 54q4 4 8 0" fill="none" stroke="#4A2340" stroke-width="2.2" stroke-linecap="round"/></svg>` },

  { id: 'tulipe', nom: 'Tulipe', svg: `<svg viewBox="0 0 100 100"><path d="M50 60v32" stroke="#66BB6A" stroke-width="6" stroke-linecap="round"/><path d="M50 82c-14 0-22-8-24-20 12 1 20 8 24 20z" fill="#81C784"/><path d="M50 78c12-1 19-8 21-18-11 1-18 7-21 18z" fill="#66BB6A"/><path d="M28 38c0-18 8-24 14-24l8 14 8-14c6 0 14 6 14 24 0 16-9 24-22 24s-22-8-22-24z" fill="#EC407A"/><path d="M40 22c-4 6-5 14-4 22" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none" opacity=".5"/></svg>` },

  { id: 'noeud', nom: 'Nœud', svg: `<svg viewBox="0 0 100 100"><path d="M47 52 35 86l9-4 6 6 2-34z" fill="#EC407A"/><path d="M53 52l12 34-9-4-6 6-2-34z" fill="#EC407A"/><path d="M47 46C22 18 10 30 10 44s14 22 37 10z" fill="#F48FB1"/><path d="M53 46c25-28 37-16 37-2s-14 22-37 10z" fill="#F48FB1"/><rect x="42" y="40" width="16" height="17" rx="6" fill="#EC407A"/><path d="M20 38q6-6 14 0" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".55"/></svg>` },

  { id: 'cerises', nom: 'Cerises', svg: `<svg viewBox="0 0 100 100"><path d="M33 58Q38 32 57 16M66 62Q62 38 57 16" fill="none" stroke="#6D4C41" stroke-width="4" stroke-linecap="round"/><path d="M57 16q14-12 26-2-12 12-26 2z" fill="#66BB6A"/><circle cx="32" cy="68" r="16" fill="#E53935"/><circle cx="66" cy="72" r="16" fill="#E53935"/><circle cx="26" cy="62" r="4" fill="#fff" opacity=".6"/><circle cx="60" cy="66" r="4" fill="#fff" opacity=".6"/></svg>` },

  { id: 'fraise', nom: 'Fraise', svg: `<svg viewBox="0 0 100 100"><path d="M50 92C22 74 18 54 22 42c3-9 14-12 28-12s25 3 28 12c4 12 0 32-28 50z" fill="#EF5350"/><path d="M28 34l10-12 7 9 5-14 5 14 7-9 10 12c-14 6-30 6-44 0z" fill="#66BB6A"/><g fill="#FFF59D"><ellipse cx="36" cy="50" rx="2" ry="3"/><ellipse cx="50" cy="46" rx="2" ry="3"/><ellipse cx="64" cy="50" rx="2" ry="3"/><ellipse cx="42" cy="62" rx="2" ry="3"/><ellipse cx="58" cy="62" rx="2" ry="3"/><ellipse cx="50" cy="75" rx="2" ry="3"/></g></svg>` },

  { id: 'lune', nom: 'Lune', svg: `<svg viewBox="0 0 100 100"><path d="M60 10A42 42 0 1 0 90 68 34 34 0 1 1 60 10z" fill="#FFE082"/><path d="M32 52q4 4 8 0M48 60q4 4 8 0" fill="none" stroke="#4A2340" stroke-width="2.6" stroke-linecap="round"/><circle cx="34" cy="62" r="3.5" fill="#F48FB1" opacity=".8"/><path d="M80 18c1 6 3 8 9 9-6 1-8 3-9 9-1-6-3-8-9-9 6-1 8-3 9-9z" fill="#CE93D8"/></svg>` },

  { id: 'nuage', nom: 'Nuage', svg: `<svg viewBox="0 0 100 100"><path d="M27 74c-12 0-18-7-18-16s7-15 17-15c2-13 11-19 22-19 10 0 17 6 20 14 3-2 7-3 10-3 10 0 17 8 15 18 4 2 6 6 6 10 0 7-6 11-13 11z" fill="#E3F2FD"/><circle cx="42" cy="54" r="3" fill="#4A2340"/><circle cx="60" cy="54" r="3" fill="#4A2340"/><path d="M47 61q4 4 8 0" fill="none" stroke="#4A2340" stroke-width="2.4" stroke-linecap="round"/><circle cx="36" cy="61" r="3.5" fill="#F48FB1" opacity=".8"/><circle cx="66" cy="61" r="3.5" fill="#F48FB1" opacity=".8"/></svg>` },

  { id: 'arcenciel', nom: 'Arc-en-ciel', svg: `<svg viewBox="0 0 100 100"><g fill="none" stroke-width="8" stroke-linecap="round"><path d="M12 72a38 38 0 0 1 76 0" stroke="#F48FB1"/><path d="M21 72a29 29 0 0 1 58 0" stroke="#FFD54F"/><path d="M30 72a20 20 0 0 1 40 0" stroke="#A5D6A7"/><path d="M39 72a11 11 0 0 1 22 0" stroke="#90CAF9"/></g><g fill="#F3E5F5"><circle cx="12" cy="76" r="9"/><circle cx="22" cy="78" r="7"/><circle cx="88" cy="76" r="9"/><circle cx="78" cy="78" r="7"/></g></svg>` },

  { id: 'papillon', nom: 'Papillon', svg: `<svg viewBox="0 0 100 100"><ellipse cx="31" cy="36" rx="20" ry="17" fill="#CE93D8" transform="rotate(-20 31 36)"/><ellipse cx="69" cy="36" rx="20" ry="17" fill="#CE93D8" transform="rotate(20 69 36)"/><ellipse cx="35" cy="65" rx="14" ry="12" fill="#F48FB1" transform="rotate(20 35 65)"/><ellipse cx="65" cy="65" rx="14" ry="12" fill="#F48FB1" transform="rotate(-20 65 65)"/><circle cx="30" cy="34" r="6" fill="#fff" opacity=".5"/><circle cx="70" cy="34" r="6" fill="#fff" opacity=".5"/><rect x="46" y="28" width="8" height="50" rx="4" fill="#4A2340"/><path d="M48 29q-6-14-12-16M52 29q6-14 12-16" fill="none" stroke="#4A2340" stroke-width="2.5" stroke-linecap="round"/></svg>` },

  { id: 'tasse', nom: 'Tasse', svg: `<svg viewBox="0 0 100 100"><path d="M40 22q-4-6 0-12M52 22q-4-6 0-12" fill="none" stroke="#CE93D8" stroke-width="3.5" stroke-linecap="round"/><path d="M70 44q16 0 16 12t-16 12" fill="none" stroke="#F8BBD0" stroke-width="7"/><path d="M18 32h56v32c0 14-9 22-22 22H40c-13 0-22-8-22-22z" fill="#F8BBD0"/><path d="M46 66c-8-5-12-9-12-14 0-4 3-6 6-6 3 0 5 2 6 4 1-2 3-4 6-4 3 0 6 2 6 6 0 5-4 9-12 14z" fill="#EC407A"/></svg>` },

  { id: 'couronne', nom: 'Couronne', svg: `<svg viewBox="0 0 100 100"><path d="M14 72l4-42 18 20 14-28 14 28 18-20 4 42z" fill="#FFD54F" stroke="#FFD54F" stroke-width="5" stroke-linejoin="round"/><rect x="14" y="68" width="72" height="14" rx="4" fill="#FFC107"/><circle cx="50" cy="75" r="5" fill="#EC407A"/><circle cx="30" cy="75" r="4" fill="#CE93D8"/><circle cx="70" cy="75" r="4" fill="#CE93D8"/><circle cx="18" cy="28" r="5" fill="#FFD54F"/><circle cx="50" cy="20" r="5" fill="#FFD54F"/><circle cx="82" cy="28" r="5" fill="#FFD54F"/></svg>` },

  { id: 'lettre', nom: 'Lettre', svg: `<svg viewBox="0 0 100 100"><rect x="12" y="26" width="76" height="52" rx="8" fill="#FCE4EC"/><path d="M14 32l36 26 36-26" fill="none" stroke="#F06292" stroke-width="3.5" stroke-linejoin="round"/><path d="M50 66c-8-5-12-9-12-14 0-4 3-6 6-6 3 0 5 2 6 4 1-2 3-4 6-4 3 0 6 2 6 6 0 5-4 9-12 14z" fill="#E53935"/></svg>` },

  { id: 'soleil', nom: 'Soleil', svg: `<svg viewBox="0 0 100 100"><g stroke="#FFB74D" stroke-width="6" stroke-linecap="round"><path d="M50 6v12M50 82v12M6 50h12M82 50h12M19 19l8 8M73 73l8 8M81 19l-8 8M27 73l-8 8"/></g><circle cx="50" cy="50" r="24" fill="#FFD54F"/><circle cx="43" cy="47" r="3" fill="#4A2340"/><circle cx="57" cy="47" r="3" fill="#4A2340"/><path d="M45 55q5 5 10 0" fill="none" stroke="#4A2340" stroke-width="2.6" stroke-linecap="round"/><circle cx="38" cy="55" r="3.5" fill="#F48FB1" opacity=".8"/><circle cx="62" cy="55" r="3.5" fill="#F48FB1" opacity=".8"/></svg>` },

  // Stickers « mots »
  { id: 'mot-love', nom: 'love', svg: `<svg viewBox="0 0 100 60"><rect x="4" y="8" width="92" height="44" rx="22" fill="#EC407A"/><text x="50" y="40" text-anchor="middle" font-family="Dancing Script, cursive" font-weight="600" font-size="28" fill="#fff">love</text></svg>` },
  { id: 'mot-yay', nom: 'yay !', svg: `<svg viewBox="0 0 100 60"><rect x="4" y="8" width="92" height="44" rx="22" fill="#9C4DCC"/><text x="50" y="40" text-anchor="middle" font-family="Dancing Script, cursive" font-weight="600" font-size="28" fill="#fff">yay !</text></svg>` },
  { id: 'mot-merci', nom: 'merci', svg: `<svg viewBox="0 0 100 60"><rect x="4" y="8" width="92" height="44" rx="22" fill="#A8611A"/><text x="50" y="40" text-anchor="middle" font-family="Dancing Script, cursive" font-weight="600" font-size="27" fill="#fff">merci</text></svg>` },
  { id: 'mot-reve', nom: 'rêve', svg: `<svg viewBox="0 0 100 60"><rect x="4" y="8" width="92" height="44" rx="22" fill="#7A4A8C"/><text x="50" y="40" text-anchor="middle" font-family="Dancing Script, cursive" font-weight="600" font-size="28" fill="#fff">rêve</text></svg>` },
  { id: 'mot-bravo', nom: 'bravo', svg: `<svg viewBox="0 0 100 60"><rect x="4" y="8" width="92" height="44" rx="22" fill="#1F7A6B"/><text x="50" y="40" text-anchor="middle" font-family="Dancing Script, cursive" font-weight="600" font-size="27" fill="#fff">bravo</text></svg>` }
];
