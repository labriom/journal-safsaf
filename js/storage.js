/* =========================================================
   STORAGE.JS — où sont enregistrées tes données
   ---------------------------------------------------------
   Version 1 : tout est enregistré dans le navigateur de CET appareil
   (localStorage). Rien ne part sur internet.

   ⚠️ Si tu vides les données de ton navigateur, tu perds tes notes :
   pense à faire « Copier la sauvegarde » dans Personnaliser de temps en temps.

   Plus tard (étape 2 : synchronisation), il suffira de remplacer
   ce fichier par une version qui parle à un service en ligne
   (Supabase ou Firebase). Le reste du site ne changera pas, tant que
   ces 4 fonctions existent :
     Stockage.init(onChange)  -> démarre, puis appelle onChange() si les données changent ailleurs
     Stockage.tout()          -> liste de tous les éléments
     Stockage.enregistrer(obj)-> ajoute ou met à jour un élément (obj.id obligatoire)
     Stockage.supprimer(id)   -> supprime un élément
   ========================================================= */
(function () {
  const CLE = 'mon-journal-v1';
  let items = {};

  function lire() {
    try { items = JSON.parse(localStorage.getItem(CLE)) || {}; }
    catch (e) { items = {}; }
  }
  function ecrire() {
    try { localStorage.setItem(CLE, JSON.stringify(items)); }
    catch (e) { alert("Impossible d'enregistrer : la mémoire du navigateur est peut-être pleine."); }
  }

  window.Stockage = {
    mode: 'local',
    init(onChange) {
      lire();
      // Si le journal est ouvert dans deux onglets, on garde les deux à jour
      window.addEventListener('storage', (e) => { if (e.key === CLE) { lire(); onChange && onChange(); } });
    },
    tout() { return Object.values(items); },
    get(id) { return items[id]; },
    enregistrer(obj) { items[obj.id] = obj; ecrire(); },
    supprimer(id) { delete items[id]; ecrire(); }
  };
})();
