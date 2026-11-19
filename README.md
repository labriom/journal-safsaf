# 💗 Mon Journal

Un journal intime avec un calendrier, rose et personnalisable, qui marche sur téléphone et sur ordinateur.
Version 1 : tes pages sont enregistrées **dans le navigateur de l'appareil** que tu utilises.

## Ce qu'il y a dedans

| Fichier | À quoi il sert | Tu peux le modifier ? |
|---|---|---|
| `index.html` | La structure des pages | Pour ajouter une police Google |
| `css/theme.css` | **Couleurs, polices, arrondis, ambiances** | ✅ Oui, c'est fait pour |
| `js/config.js` | **Listes de choix** : humeurs, catégories, couleurs, ambiances | ✅ Oui, c'est fait pour |
| `js/stickers.js` | Les stickers « mignons » (dessins SVG) | ✅ Oui, pour ajouter tes stickers |
| `js/stickers-aquarelle.js` | La grande planche « aquarelle rose » (couleurs modifiables) | ✅ Oui |
| `css/style.css` | La mise en page | Si tu es à l'aise |
| `js/app.js` | Le fonctionnement | Plutôt non |
| `js/storage.js` | L'enregistrement des données | Sera remplacé à l'étape 2 (synchronisation) |

## Mettre le site en ligne avec GitHub Pages (gratuit)

1. Crée un compte sur [github.com](https://github.com) si tu n'en as pas.
2. Clique sur **New repository**, donne-lui un nom (par ex. `mon-journal`), laisse-le en **Public**, puis **Create repository**.
3. Sur la page du dépôt, clique sur **uploading an existing file**, puis glisse **tout le contenu** du dossier `mon-journal` (les fichiers et les dossiers `css` et `js`). Clique sur **Commit changes**.
4. Va dans **Settings → Pages**. Dans *Branch*, choisis `main` et `/ (root)`, puis **Save**.
5. Attends 1 à 2 minutes : ton site est en ligne à l'adresse
   `https://journal-safsaf.netlify.app/`

> 🔒 Le code est public, mais **tes notes ne le sont pas** : elles restent dans ton navigateur et ne sont jamais envoyées sur GitHub.

### Sur ton téléphone
Ouvre l'adresse dans ton navigateur, puis :
- **iPhone (Safari)** : bouton Partager → *Sur l'écran d'accueil*
- **Android (Chrome)** : menu ⋮ → *Ajouter à l'écran d'accueil*

## Personnaliser

- **Sans toucher au code** : onglet *Personnaliser* dans le journal (nom, prénom, pensée du jour, ambiance, couleur, police, taille, papier).
- **Changer les couleurs d'une ambiance** : ouvre `css/theme.css`, modifie les codes couleur, enregistre.
- **Créer une nouvelle ambiance** : copie un bloc `[data-ambiance="..."]` dans `theme.css`, renomme-le (par ex. `"menthe"`), change les couleurs, puis ajoute `{ id: 'menthe', nom: 'Menthe', apercu: '#EEF7F2' }` dans la liste `AMBIANCES` de `js/config.js`.
- **Changer les humeurs ou les catégories du calendrier** : `js/config.js`.
- **Ajouter des stickers** : directement dans le journal (bouton ⭐ Stickers → *Ajouter une image*, ou *Découper une planche* pour séparer automatiquement une image qui contient plusieurs stickers), ou pour toujours dans `js/stickers.js`.
- **Ajouter une police** : choisis-la sur [fonts.google.com](https://fonts.google.com), ajoute-la dans le lien `<link href="https://fonts.googleapis.com/...">` de `index.html`, puis ajoute-la dans `POLICES` de `config.js` (ou dans `theme.css`).

Pour modifier un fichier directement sur GitHub : ouvre-le, clique sur le crayon ✏️, modifie, puis **Commit changes**. Le site se met à jour en 1 à 2 minutes.

## Sauvegarde

Comme tout est enregistré dans le navigateur, **vider les données du navigateur efface tes notes**.
Dans *Personnaliser → Sauvegarde*, télécharge régulièrement un fichier de sauvegarde. Tu peux le restaurer au même endroit, ou sur un autre appareil.

## Étape 2 (plus tard) : synchroniser téléphone et ordinateur

Il suffira de remplacer `js/storage.js` par une version reliée à un service en ligne gratuit (Supabase ou Firebase), avec une connexion par email. Le reste du site ne changera pas.
