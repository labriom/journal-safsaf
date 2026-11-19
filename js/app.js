/* =========================================================
   APP.JS — le fonctionnement du journal
   (pas besoin d'y toucher pour personnaliser : voir theme.css et config.js)
   ========================================================= */
(function () {
'use strict';
const C = window.CONFIG;
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const lireDate = (s) => { const [a, b, c] = String(s).split('-').map(Number); return new Date(a, (b || 1) - 1, c || 1); };
const plusJours = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const hm = (m) => pad(Math.floor(m / 60)) + ':' + pad(m % 60);
const hFr = (m) => Math.floor(m / 60) + 'h' + (m % 60 ? pad(m % 60) : '');
const enMin = (s) => { const [a, b] = String(s).split(':').map(Number); return (a || 0) * 60 + (b || 0); };
const borne = (v, a, b) => Math.max(a, Math.min(b, v));
const quart = (m) => Math.round(m / 15) * 15;
const nouvelId = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const couleurOk = (c) => /^#[0-9a-fA-F]{3,8}$/.test(c || '') ? c : '';
const sansHtml = (h) => String(h || '').replace(/<(br|\/p|\/div|\/li|\/h\d)[^>]*>/gi, ' ').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
const JOURS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
const dateLongue = (d) => d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
const dateCourte = (s) => s ? lireDate(s).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '';
const majuscule = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function message(txt) { const m = $('#message'); m.textContent = txt; m.classList.add('on'); clearTimeout(message.t); message.t = setTimeout(() => m.classList.remove('on'), 2600); }
function demander(titre, texte) {
  return new Promise((ok) => {
    $('#confTitre').textContent = titre; $('#confTexte').textContent = texte || '';
    $('#fenConfirm').classList.add('ouverte');
    const fin = (v) => { $('#fenConfirm').classList.remove('ouverte'); $('#confOui').onclick = $('#confNon').onclick = null; ok(v); };
    $('#confOui').onclick = () => fin(true); $('#confNon').onclick = () => fin(false);
  });
}

/* ================= Réglages ================= */
const DEFAUT = { id: 'reglages', type: 'reglages', nom: C.nomParDefaut, prenom: '', citation: C.citationParDefaut, ambiance: C.AMBIANCES[0].id, couleur: C.COULEURS[0].code, police: 0, taille: C.POLICES[0].taille, papier: C.PAPIERS[0].id };
const R = () => Object.assign({}, DEFAUT, Stockage.get('reglages') || {});
function sauverReglages(modif) { Stockage.enregistrer(Object.assign(R(), modif, { id: 'reglages', type: 'reglages' })); appliquer(); }
const accent = () => couleurOk(R().couleur) || C.COULEURS[0].code;
const couleurCat = (id) => { const c = C.CATEGORIES.find((x) => x.id === id) || C.CATEGORIES[0]; return c.couleur === 'accent' ? accent() : c.couleur; };

function appliquer() {
  const r = R(), root = document.documentElement;
  root.dataset.ambiance = r.ambiance;
  root.style.setProperty('--accent', accent());
  const pol = C.POLICES[r.police] || C.POLICES[0];
  root.style.setProperty('--police-ecriture', pol.css);
  root.style.setProperty('--taille', r.taille + 'px');
  $('#noteTexte').className = 'papier p-' + r.papier;
  $$('[data-nom]').forEach((el) => el.textContent = r.nom || C.nomParDefaut);
  $$('[data-sous-titre]').forEach((el) => el.textContent = C.sousTitre);
  $$('[data-citation]').forEach((el) => el.textContent = r.citation);
  const h = new Date().getHours();
  $('#bonjour').textContent = (h < 5 || h >= 18 ? 'Bonsoir' : 'Bonjour') + (r.prenom ? ' ' + r.prenom : '');
  document.title = r.nom || C.nomParDefaut;
  const meta = document.querySelector('meta[name=theme-color]');
  if (meta) meta.content = getComputedStyle(root).getPropertyValue('--fond').trim() || '#FFF5F8';
}

/* ================= Navigation ================= */
const VUES = ['journal', 'calendrier', 'perso'];
let vue = 'journal';
function aller(v) {
  if (!VUES.includes(v)) v = 'journal';
  vue = v;
  $$('.vue').forEach((el) => el.classList.toggle('active', el.id === 'vue-' + v));
  $$('[data-vue]').forEach((b) => b.classList.toggle('actif', b.dataset.vue === v));
  if (location.hash !== '#' + v) history.replaceState(null, '', '#' + v);
  if (v === 'calendrier') dessinerCal(true);
  if (v === 'perso') dessinerPerso();
}
$$('[data-vue]').forEach((b) => b.addEventListener('click', () => { validerNote(); aller(b.dataset.vue); }));
window.addEventListener('hashchange', () => { const v = location.hash.slice(1); if (v && v !== vue) aller(v); });

function toutRedessiner() { appliquer(); dessinerNotes(); if (vue === 'calendrier') dessinerCal(); if (vue === 'perso') dessinerPerso(); }

/* ================= JOURNAL ================= */
let noteSel = null, recherche = '', enCours = null, minuteur = null;
const notes = () => Stockage.tout().filter((x) => x && x.type === 'note');

function dessinerListe() {
  const q = recherche.toLowerCase();
  const liste = notes()
    .filter((n) => !q || (n.titre || '').toLowerCase().includes(q) || sansHtml(n.html).toLowerCase().includes(q))
    .sort((a, b) => ((b.epingle ? 1 : 0) - (a.epingle ? 1 : 0)) || (b.date || '').localeCompare(a.date || '') || ((b.modifie || 0) - (a.modifie || 0)));
  const el = $('#listeNotes');
  if (!liste.length) {
    el.innerHTML = '<div class="vide-liste">' + (q ? 'Aucune page trouvée.' : 'Ton journal est encore vide.<br>Écris ta première page !') + '</div>';
    return;
  }
  el.innerHTML = liste.map((n) => `<button class="note ${n.id === noteSel ? 'active' : ''}" data-id="${esc(n.id)}">
      <span class="note-haut"><span class="note-t">${n.epingle ? '📌 ' : ''}${esc(n.titre || 'Sans titre')}</span></span>
      <span class="note-p">${esc(sansHtml(n.html).slice(0, 140)) || '<i>Page vide</i>'}</span>
      <span class="note-d">${esc(dateCourte(n.date))}${n.humeur ? `<span class="tag">${esc(n.humeur)}</span>` : ''}</span>
    </button>`).join('');
}
function dessinerNotes() { dessinerListe(); dessinerEditeur(); }
function dessinerEditeur(forcer) {
  const n = noteSel && Stockage.get(noteSel);
  $('#journal').classList.toggle('ouvert', !!n);
  $('#editeur').classList.toggle('vide', !n);
  if (!n) { noteSel = null; return; }
  const texte = $('#noteTexte'), titre = $('#noteTitre');
  const meme = texte.dataset.id === n.id;
  if (!meme || forcer) { texte.innerHTML = n.html || ''; titre.value = n.titre || ''; texte.dataset.id = n.id; }
  else if (enCours !== n.id) {
    if (document.activeElement !== texte && texte.innerHTML !== (n.html || '')) texte.innerHTML = n.html || '';
    if (document.activeElement !== titre) titre.value = n.titre || '';
  }
  $('#noteDate').value = n.date || '';
  $('#epingler').classList.toggle('on', !!n.epingle);
  if (!meme || forcer) stSel = null;
  dessinerStickers();
  $('#humeurs').innerHTML = '<span class="lbl">Humeur</span>' + C.HUMEURS.map((h) => `<button data-h="${esc(h)}" class="${n.humeur === h ? 'on' : ''}">${esc(h)}</button>`).join('');
}
function choisirNote(id) { validerNote(); noteSel = id; dessinerNotes(); dessinerEditeur(true); $('#enregistre').textContent = ''; }
function creerNote(extra) {
  validerNote();
  const t = Date.now();
  const n = Object.assign({ id: nouvelId('n'), type: 'note', titre: '', html: '', date: ymd(new Date()), cree: t, modifie: t, humeur: '', epingle: false }, extra || {});
  Stockage.enregistrer(n); noteSel = n.id; dessinerNotes(); dessinerEditeur(true);
  setTimeout(() => (n.titre ? $('#noteTexte') : $('#noteTitre')).focus(), 30);
}
function noteModifiee() { if (!noteSel) return; enCours = noteSel; $('#enregistre').textContent = '…'; clearTimeout(minuteur); minuteur = setTimeout(validerNote, 600); }
function validerNote() {
  clearTimeout(minuteur);
  if (!enCours) return;
  const id = enCours; enCours = null;
  const n = Stockage.get(id), texte = $('#noteTexte');
  if (!n || texte.dataset.id !== id) return;
  const html = texte.innerHTML, titre = $('#noteTitre').value;
  if (html !== n.html || titre !== n.titre) Stockage.enregistrer(Object.assign({}, n, { html, titre, modifie: Date.now() }));
  $('#enregistre').textContent = 'Enregistré ✓';
  dessinerListe();
}
function modifierNote(p) { validerNote(); const n = Stockage.get(noteSel); if (!n) return; Stockage.enregistrer(Object.assign({}, n, p, { modifie: Date.now() })); dessinerNotes(); }

$('#nouvelleNote').onclick = () => creerNote();
$('#pageDuJour').onclick = () => {
  const auj = ymd(new Date());
  const ex = notes().find((n) => n.duJour && n.date === auj);
  if (ex) return choisirNote(ex.id);
  creerNote({ titre: majuscule(dateLongue(new Date())), duJour: true });
};
$('#recherche').oninput = (e) => { recherche = e.target.value; dessinerListe(); };
$('#listeNotes').onclick = (e) => { const b = e.target.closest('.note'); if (b) choisirNote(b.dataset.id); };
$('#retour').onclick = () => { validerNote(); noteSel = null; dessinerNotes(); };
$('#noteTitre').oninput = noteModifiee;
$('#noteTitre').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); $('#noteTexte').focus(); } });
$('#noteTexte').addEventListener('input', noteModifiee);
$('#noteTexte').addEventListener('blur', validerNote);
$('#noteDate').onchange = (e) => modifierNote({ date: e.target.value });
$('#epingler').onclick = () => { const n = Stockage.get(noteSel); if (n) modifierNote({ epingle: !n.epingle }); };
$('#humeurs').onclick = (e) => { const b = e.target.closest('[data-h]'); if (!b) return; const n = Stockage.get(noteSel); modifierNote({ humeur: n.humeur === b.dataset.h ? '' : b.dataset.h }); };
$('#supprimerNote').onclick = async () => {
  const n = Stockage.get(noteSel); if (!n) return;
  if (await demander('Supprimer cette page ?', '« ' + (n.titre || 'Sans titre') + ' » sera supprimée définitivement.')) {
    enCours = null; clearTimeout(minuteur); Stockage.supprimer(n.id); noteSel = null; dessinerNotes(); message('Page supprimée');
  }
};
// Barre d'outils
$('#outils').addEventListener('mousedown', (e) => { if (e.target.closest('button')) e.preventDefault(); });
$('#outils').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.id === 'stickers') { ouvrirStickers(); return; }
  const t = $('#noteTexte'); if (document.activeElement !== t) t.focus();
  if (b.dataset.cmd) document.execCommand(b.dataset.cmd, false, null);
  else if (b.dataset.bloc) { const cur = (document.queryCommandValue('formatBlock') || '').toLowerCase(); document.execCommand('formatBlock', false, cur === b.dataset.bloc ? 'div' : b.dataset.bloc); }
  else if (b.dataset.surligne) { if (!document.execCommand('hiliteColor', false, b.dataset.surligne)) document.execCommand('backColor', false, b.dataset.surligne); }
  else if (b.id === 'taches') document.execCommand('insertHTML', false, '<ul class="taches"><li>&#8203;</li></ul>');
  else if (b.id === 'mot-script') {
    const sel = window.getSelection();
    if (sel.rangeCount && !sel.isCollapsed) { const txt = esc(sel.toString()); document.execCommand('insertHTML', false, '<span class="manuscrit">' + txt + '</span>&#8203;'); }
    else message('Sélectionne d\'abord quelques mots');
  }
  noteModifiee();
});
$('#noteTexte').addEventListener('click', (e) => {
  const li = e.target.closest('ul.taches > li'); if (!li) return;
  if (e.clientX - li.getBoundingClientRect().left < 28) { li.classList.toggle('fait'); noteModifiee(); }
});

/* ================= STICKERS ================= */
let stSel = null, stTirage = false;
const bibli = () => (Stockage.get('mes-stickers') || { id: 'mes-stickers', type: 'stickers', liste: [] });
function contenuSticker(ref) {
  if (typeof ref !== 'string') return '';
  if (ref.startsWith('u:')) {
    const im = bibli().liste.find((x) => x.id === ref.slice(2));
    return im && /^data:image\//.test(im.data) ? `<img src="${esc(im.data)}" alt="">` : '';
  }
  const st = (window.STICKERS || []).find((x) => x.id === ref);
  return st ? st.svg : '';
}
function dessinerStickers() {
  if (stTirage) return;
  const n = noteSel && Stockage.get(noteSel), cal = $('#calque');
  if (!n) { cal.innerHTML = ''; return; }
  cal.innerHTML = (n.stickers || []).map((st) => {
    const c = contenuSticker(st.s); if (!c) return '';
    return `<div class="sticker ${st.id === stSel ? 'sel' : ''}" data-id="${esc(st.id)}" style="left:${+st.x}%;top:${+st.y}px;width:${+st.w}%;--r:${+st.r || 0}deg">${c}<button class="st-btn st-suppr" aria-label="Retirer le sticker">×</button><span class="st-btn st-tourner" title="Agrandir ou tourner">↻</span></div>`;
  }).join('');
}
function sauverStickers(liste) {
  const n = Stockage.get(noteSel); if (!n) return;
  validerNote();
  Stockage.enregistrer(Object.assign({}, Stockage.get(noteSel) || n, { stickers: liste, modifie: Date.now() }));
  dessinerListe(); dessinerStickers();
}
function ajouterSticker(ref) {
  const n = Stockage.get(noteSel); if (!n) return;
  const zone = $('#papierZone'), feuille = $('#feuille');
  const zr = zone.getBoundingClientRect(), fr = feuille.getBoundingClientRect();
  const y = Math.max(40, zr.top + Math.min(zone.clientHeight, innerHeight - zr.top) / 2 - fr.top);
  const st = { id: nouvelId('s'), s: ref, x: 50 + (Math.random() * 30 - 15), y: Math.round(y), w: innerWidth < 820 ? 24 : 14, r: Math.round(Math.random() * 24 - 12) };
  stSel = st.id;
  sauverStickers([...(n.stickers || []), st]);
}
function retirerSticker(id) {
  const n = Stockage.get(noteSel); if (!n) return;
  if (stSel === id) stSel = null;
  sauverStickers((n.stickers || []).filter((s) => s.id !== id));
}
const calque = $('#calque');
calque.addEventListener('click', (e) => { const b = e.target.closest('.st-suppr'); if (b) retirerSticker(b.closest('.sticker').dataset.id); });
calque.addEventListener('pointerdown', (e) => {
  const el = e.target.closest('.sticker'); if (!el || e.target.closest('.st-suppr')) return;
  e.preventDefault(); e.stopPropagation();
  const n = Stockage.get(noteSel); const st = n && (n.stickers || []).find((s) => s.id === el.dataset.id); if (!st) return;
  stSel = st.id; $$('#calque .sticker').forEach((x) => x.classList.toggle('sel', x === el));
  const mode = e.target.closest('.st-tourner') ? 'tourner' : 'bouger';
  const cr = calque.getBoundingClientRect(), r = el.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2, sx = e.clientX, sy = e.clientY;
  const d0 = Math.hypot(sx - cx, sy - cy) || 1, a0 = Math.atan2(sy - cy, sx - cx);
  const cur = Object.assign({}, st); let bouge = false;
  try { el.setPointerCapture(e.pointerId); } catch (_) {}
  const mv = (m) => {
    if (!bouge && Math.hypot(m.clientX - sx, m.clientY - sy) < 3) return;
    if (!bouge) { bouge = true; stTirage = true; el.classList.add('tire'); }
    if (mode === 'bouger') {
      cur.x = borne(st.x + (m.clientX - sx) / cr.width * 100, 0, 100);
      cur.y = Math.round(borne(st.y + (m.clientY - sy), 0, cr.height));
      el.style.left = cur.x + '%'; el.style.top = cur.y + 'px';
    } else {
      const d = Math.hypot(m.clientX - cx, m.clientY - cy), a = Math.atan2(m.clientY - cy, m.clientX - cx);
      cur.w = borne(st.w * d / d0, 5, 90);
      cur.r = Math.round(((st.r || 0) + (a - a0) * 180 / Math.PI) % 360);
      el.style.width = cur.w + '%'; el.style.setProperty('--r', cur.r + 'deg');
    }
  };
  const fin = () => {
    el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', fin); el.removeEventListener('pointercancel', fin);
    el.classList.remove('tire'); stTirage = false;
    if (bouge) { const autres = (Stockage.get(noteSel).stickers || []).filter((s) => s.id !== cur.id); sauverStickers([...autres, cur]); }
  };
  el.addEventListener('pointermove', mv); el.addEventListener('pointerup', fin); el.addEventListener('pointercancel', fin);
});
document.addEventListener('pointerdown', (e) => {
  if (stSel && !e.target.closest('.sticker') && !e.target.closest('#fenStickers')) { stSel = null; $$('#calque .sticker.sel').forEach((x) => x.classList.remove('sel')); }
});
document.addEventListener('keydown', (e) => {
  if (!stSel || (e.key !== 'Delete' && e.key !== 'Backspace')) return;
  const a = document.activeElement;
  if (a && (a.isContentEditable || /INPUT|TEXTAREA|SELECT/.test(a.tagName))) return;
  e.preventDefault(); retirerSticker(stSel);
});

// La planche de stickers
function ouvrirStickers() {
  const cats = [];
  (window.STICKERS || []).forEach((s) => { const c = s.cat || 'Stickers'; if (!cats.includes(c)) cats.push(c); });
  $('#planches').innerHTML = cats.map((c) => `<h4 class="st-sous">${esc(c)}</h4><div class="planche">${(window.STICKERS || []).filter((s) => (s.cat || 'Stickers') === c).map((s) => `<button class="tuile" data-ref="${esc(s.id)}" aria-label="${esc(s.nom)}" title="${esc(s.nom)}">${s.svg}</button>`).join('')}</div>`).join('');
  $('#planchePerso').innerHTML = `<label class="tuile ajout"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>Ajouter une image<input type="file" id="stImage" accept="image/*" hidden></label>
    <label class="tuile ajout"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3v12a3 3 0 1 0 3 3M18 3v12a3 3 0 1 1-3 3M6 15l12-6M18 15 6 9"/></svg>Découper une planche<input type="file" id="stPlanche" accept="image/*" hidden></label>`
    + bibli().liste.map((im) => /^data:image\//.test(im.data) ? `<div style="position:relative"><button class="tuile" data-ref="u:${esc(im.id)}" aria-label="Mon image"><img src="${esc(im.data)}" alt=""></button><button class="retirer" data-retirer="${esc(im.id)}" aria-label="Supprimer cette image">×</button></div>` : '').join('');
  $('#stChoix').hidden = false; $('#stDecoupe').hidden = true;
  $('#fenStickers').classList.add('ouverte');
}

/* ----- Découpe automatique d'une planche de stickers -----
   Repère chaque dessin posé sur un fond clair (ou transparent),
   le découpe et rend son contour transparent. */
const estFond = (r, g, b, a, seuil) => a < 40 || (Math.min(r, g, b) > seuil && Math.max(r, g, b) - Math.min(r, g, b) < 26);
async function chargerImage(file) {
  const url = URL.createObjectURL(file);
  try { const img = new Image(); await new Promise((ok, ko) => { img.onload = ok; img.onerror = ko; img.src = url; }); return img; }
  finally { setTimeout(() => URL.revokeObjectURL(url), 1000); }
}
async function decouperPlanche(file) {
  const img = await chargerImage(file);
  // 1) image pleine taille (max 1800 px)
  const k = Math.min(1, 1800 / Math.max(img.width, img.height));
  const W = Math.round(img.width * k), Hh = Math.round(img.height * k);
  const C = document.createElement('canvas'); C.width = W; C.height = Hh;
  const cx = C.getContext('2d', { willReadFrequently: true }); cx.drawImage(img, 0, 0, W, Hh);
  const D = cx.getImageData(0, 0, W, Hh).data;
  // 2) petite version pour repérer les dessins
  const ks = Math.min(1, 480 / Math.max(W, Hh)), w = Math.max(1, Math.round(W * ks)), h = Math.max(1, Math.round(Hh * ks));
  const S = document.createElement('canvas'); S.width = w; S.height = h;
  const sx = S.getContext('2d', { willReadFrequently: true }); sx.drawImage(C, 0, 0, w, h);
  const d = sx.getImageData(0, 0, w, h).data;
  let m = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) m[i] = estFond(d[i * 4], d[i * 4 + 1], d[i * 4 + 2], d[i * 4 + 3], 204) ? 0 : 1;
  // épaissir un peu pour réunir les morceaux d'un même dessin
  for (let pass = 0; pass < 1; pass++) {
    const n2 = new Uint8Array(m);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x; if (m[i]) continue;
      if ((x > 0 && m[i - 1]) || (x < w - 1 && m[i + 1]) || (y > 0 && m[i - w]) || (y < h - 1 && m[i + w])) n2[i] = 1;
    }
    m = n2;
  }
  // 3) repérer les zones séparées
  const lab = new Int32Array(w * h); let nb = 0; const zones = [];
  for (let i = 0; i < w * h; i++) {
    if (!m[i] || lab[i]) continue;
    nb++; let x0 = w, y0 = h, x1 = 0, y1 = 0, aire = 0; const pile = [i]; lab[i] = nb;
    while (pile.length) {
      const j = pile.pop(), x = j % w, y = (j - x) / w; aire++;
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      const v = [x > 0 ? j - 1 : -1, x < w - 1 ? j + 1 : -1, y > 0 ? j - w : -1, y < h - 1 ? j + w : -1];
      for (const q of v) if (q >= 0 && m[q] && !lab[q]) { lab[q] = nb; pile.push(q); }
    }
    zones.push({ labels: [nb], x0, y0, x1, y1, aire });
  }
  let gardes = zones.filter((z) => z.aire > w * h * 0.0012 && (z.x1 - z.x0) > 6 && (z.y1 - z.y0) > 6);
  // réunir les zones qui se chevauchent beaucoup (morceaux d'un même dessin)
  let change = true;
  while (change) {
    change = false;
    for (let a = 0; a < gardes.length && !change; a++) for (let b = a + 1; b < gardes.length && !change; b++) {
      const A = gardes[a], B = gardes[b];
      const ix = Math.max(0, Math.min(A.x1, B.x1) - Math.max(A.x0, B.x0)), iy = Math.max(0, Math.min(A.y1, B.y1) - Math.max(A.y0, B.y0));
      const petit = Math.min((A.x1 - A.x0) * (A.y1 - A.y0), (B.x1 - B.x0) * (B.y1 - B.y0));
      if (ix * iy > petit * 0.5) {
        gardes[a] = { labels: A.labels.concat(B.labels), x0: Math.min(A.x0, B.x0), y0: Math.min(A.y0, B.y0), x1: Math.max(A.x1, B.x1), y1: Math.max(A.y1, B.y1), aire: A.aire + B.aire };
        gardes.splice(b, 1); change = true;
      }
    }
  }
  gardes.sort((A, B) => (Math.abs(A.y0 - B.y0) > h * 0.05 ? A.y0 - B.y0 : A.x0 - B.x0));
  // 4) découper chaque dessin en pleine taille et rendre le fond transparent
  const res = [];
  for (const z of gardes.slice(0, 80)) {
    const set = new Set(z.labels);
    const X0 = Math.max(0, Math.floor(z.x0 / ks) - 2), Y0 = Math.max(0, Math.floor(z.y0 / ks) - 2);
    const X1 = Math.min(W - 1, Math.ceil((z.x1 + 1) / ks) + 2), Y1 = Math.min(Hh - 1, Math.ceil((z.y1 + 1) / ks) + 2);
    const cw = X1 - X0 + 1, ch = Y1 - Y0 + 1;
    const K = document.createElement('canvas'); K.width = cw; K.height = ch;
    const kx = K.getContext('2d'); const out = kx.createImageData(cw, ch); const o = out.data;
    for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
      const si = ((Y0 + y) * W + (X0 + x)) * 4, di = (y * cw + x) * 4;
      const lx = Math.min(w - 1, Math.floor((X0 + x) * ks)), ly = Math.min(h - 1, Math.floor((Y0 + y) * ks));
      const l = lab[ly * w + lx];
      o[di] = D[si]; o[di + 1] = D[si + 1]; o[di + 2] = D[si + 2];
      o[di + 3] = (l && !set.has(l)) ? 0 : D[si + 3];
    }
    // effacer le fond clair relié au bord (l'intérieur blanc du dessin est gardé)
    const vu = new Uint8Array(cw * ch), pile = [];
    const tente = (x, y) => { const i = y * cw + x; if (vu[i]) return; const p = i * 4; if (o[p + 3] < 40 || estFond(o[p], o[p + 1], o[p + 2], o[p + 3], 205)) { vu[i] = 1; pile.push(i); } };
    for (let x = 0; x < cw; x++) { tente(x, 0); tente(x, ch - 1); }
    for (let y = 0; y < ch; y++) { tente(0, y); tente(cw - 1, y); }
    while (pile.length) {
      const i = pile.pop(), x = i % cw, y = (i - x) / cw; o[i * 4 + 3] = 0;
      if (x > 0) tente(x - 1, y); if (x < cw - 1) tente(x + 1, y); if (y > 0) tente(x, y - 1); if (y < ch - 1) tente(x, y + 1);
    }
    kx.putImageData(out, 0, 0);
    // réduire à 380 px max
    const r = Math.min(1, 380 / Math.max(cw, ch));
    const F = document.createElement('canvas'); F.width = Math.max(1, Math.round(cw * r)); F.height = Math.max(1, Math.round(ch * r));
    F.getContext('2d').drawImage(K, 0, 0, F.width, F.height);
    let data = F.toDataURL('image/webp', 0.85);
    if (!data.startsWith('data:image/webp')) data = F.toDataURL('image/png');
    res.push(data);
  }
  return res;
}
let decoupes = [];
function afficherDecoupe() {
  const nbOk = decoupes.filter((x) => x.ok).length;
  $('#stDecoupeInfo').textContent = decoupes.length
    ? `J'ai trouvé ${decoupes.length} sticker${decoupes.length > 1 ? 's' : ''}. Touche ceux que tu ne veux pas garder, puis ajoute-les.`
    : "Je n'ai trouvé aucun sticker. Essaie avec une image sur fond blanc ou transparent.";
  $('#stDecoupeGrille').innerHTML = decoupes.map((x, i) => `<button class="tuile ${x.ok ? '' : 'off'}" data-dec="${i}" aria-pressed="${x.ok}"><img src="${x.data}" alt=""></button>`).join('');
  $('#stDecoupeOk').textContent = nbOk ? `Ajouter ${nbOk} sticker${nbOk > 1 ? 's' : ''}` : 'Aucun sticker choisi';
  $('#stDecoupeOk').disabled = !nbOk;
}
$('#stDecoupeGrille').addEventListener('click', (e) => { const b = e.target.closest('[data-dec]'); if (!b) return; const x = decoupes[+b.dataset.dec]; x.ok = !x.ok; afficherDecoupe(); });
$('#stDecoupeAnnuler').onclick = () => { decoupes = []; ouvrirStickers(); };
$('#stDecoupeOk').onclick = () => {
  const choisis = decoupes.filter((x) => x.ok); if (!choisis.length) return;
  const b = bibli();
  const avant = JSON.stringify(Stockage.get('mes-stickers') || null);
  Stockage.enregistrer(Object.assign({}, b, { liste: b.liste.concat(choisis.map((x) => ({ id: nouvelId('i'), data: x.data }))) }));
  if (JSON.stringify(Stockage.get('mes-stickers') || null) === avant) return;
  decoupes = []; ouvrirStickers();
  message(choisis.length + ' stickers ajoutés à « Mes images » !');
  setTimeout(() => { const el = $('#planchePerso'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 50);
};
const fermerStickers = () => $('#fenStickers').classList.remove('ouverte');
$('#stFermer').onclick = fermerStickers;
$('#fenStickers').addEventListener('pointerdown', (e) => { if (e.target.id === 'fenStickers') fermerStickers(); });
$('#fenStickers').addEventListener('click', async (e) => {
  const del = e.target.closest('[data-retirer]');
  if (del) {
    e.stopPropagation();
    if (await demander('Supprimer cette image ?', 'Elle disparaîtra aussi des pages où tu l\'as collée.')) {
      const b = bibli(); Stockage.enregistrer(Object.assign({}, b, { liste: b.liste.filter((x) => x.id !== del.dataset.retirer) }));
      ouvrirStickers(); dessinerStickers();
    } else ouvrirStickers();
    return;
  }
  const t = e.target.closest('[data-ref]'); if (!t) return;
  fermerStickers(); ajouterSticker(t.dataset.ref);
});
async function reduireImage(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise((ok, ko) => { img.onload = ok; img.onerror = ko; img.src = url; });
    const k = Math.min(1, 360 / Math.max(img.width, img.height));
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(img.width * k)); c.height = Math.max(1, Math.round(img.height * k));
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    let d = c.toDataURL('image/webp', 0.85);
    if (!d.startsWith('data:image/webp')) d = c.toDataURL('image/png');
    return d;
  } finally { URL.revokeObjectURL(url); }
}
$('#fenStickers').addEventListener('change', async (e) => {
  if (e.target.id === 'stPlanche') {
    const f = e.target.files[0]; if (!f) return;
    $('#stChoix').hidden = true; $('#stDecoupe').hidden = false;
    $('#stDecoupeInfo').textContent = 'Je cherche les stickers dans ton image…'; $('#stDecoupeGrille').innerHTML = ''; $('#stDecoupeOk').disabled = true;
    try { decoupes = (await decouperPlanche(f)).map((data) => ({ data, ok: true })); }
    catch (_) { decoupes = []; }
    afficherDecoupe();
    return;
  }
  if (e.target.id !== 'stImage') return;
  const f = e.target.files[0]; if (!f) return;
  try {
    const data = await reduireImage(f);
    const b = bibli(), im = { id: nouvelId('i'), data };
    Stockage.enregistrer(Object.assign({}, b, { liste: [...b.liste, im] }));
    fermerStickers(); ajouterSticker('u:' + im.id);
    message('Ton image est devenue un sticker !');
  } catch (_) { message('Impossible de lire cette image'); }
});

/* ================= CALENDRIER ================= */
let calVue = innerWidth < 820 ? 'jour' : 'semaine';
let calDate = new Date();
let tirage = false, premierScroll = true;
const H = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--H')) || 56;
const plannings = () => Stockage.tout().filter((x) => x && x.type === 'planning');

function debutSemaine(d) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const j = x.getDay(); return plusJours(x, -(C.semaineCommenceLundi ? (j + 6) % 7 : j));
}
function decaler(dir) {
  if (calVue === 'mois') calDate = new Date(calDate.getFullYear(), calDate.getMonth() + dir, 1);
  else calDate = plusJours(calDate, dir * (calVue === 'semaine' ? 7 : 1));
  dessinerCal();
}
$('#calPrec').onclick = () => decaler(-1);
$('#calSuiv').onclick = () => decaler(1);
$('#calAuj').onclick = () => { calDate = new Date(); premierScroll = true; dessinerCal(); };
$('#calVues').onclick = (e) => { const b = e.target.closest('button'); if (b) { calVue = b.dataset.v; premierScroll = true; dessinerCal(); } };
$('#nouveauPlanning').onclick = () => {
  const d = calVue === 'mois' ? new Date() : calDate;
  const now = new Date(); let s = Math.ceil((now.getHours() * 60 + now.getMinutes()) / 30) * 30; if (s > 1380) s = 540;
  ouvrirPlanning(null, { date: ymd(d), debut: s, fin: Math.min(s + 60, 1440) });
};

function placer(evs) {
  evs = evs.slice().sort((a, b) => a.debut - b.debut || b.fin - a.fin);
  const res = []; let groupe = [], finG = -1;
  const fermer = () => { const voies = []; const it = []; groupe.forEach((e) => { let i = voies.findIndex((f) => f <= e.debut); if (i < 0) { i = voies.length; voies.push(0); } voies[i] = e.fin; it.push({ e, voie: i }); }); it.forEach((o) => { o.n = voies.length; res.push(o); }); groupe = []; finG = -1; };
  evs.forEach((e) => { if (groupe.length && e.debut >= finG) fermer(); groupe.push(e); finG = Math.max(finG, e.fin); });
  if (groupe.length) fermer();
  return res;
}
function htmlEv(o) {
  const e = o.e, h = H(), haut = Math.max(22, (e.fin - e.debut) / 60 * h - 4);
  return `<div class="ev" data-id="${esc(e.id)}" style="--c:${couleurCat(e.cat)};top:${e.debut / 60 * h + 2}px;height:${haut}px;left:calc(${o.voie / o.n * 100}% + 4px);width:calc(${100 / o.n}% - 8px)">
    <span class="ev-t">${esc(e.titre || 'Sans titre')}</span><span class="ev-h">${hFr(e.debut)} – ${hFr(e.fin)}</span>
    ${haut > 80 && e.notes ? `<span class="ev-n">${esc(e.notes)}</span>` : ''}<span class="ev-taille"></span></div>`;
}
function dessinerCal(resetScroll) {
  if (tirage) return;
  $$('#calVues button').forEach((b) => b.classList.toggle('on', b.dataset.v === calVue));
  $('#legende').innerHTML = C.CATEGORIES.map((c) => `<span><i style="background:${couleurCat(c.id)}"></i>${esc(c.nom)}</span>`).join('');
  if (calVue === 'mois') dessinerMois(); else dessinerGrille(calVue === 'semaine' ? 7 : 1, resetScroll);
}
function dessinerGrille(n, resetScroll) {
  const h = H();
  const debut = n === 7 ? debutSemaine(calDate) : new Date(calDate.getFullYear(), calDate.getMonth(), calDate.getDate());
  const jours = [...Array(n)].map((_, i) => plusJours(debut, i));
  const auj = ymd(new Date());
  if (n === 7) {
    const a = jours[0], b = jours[6];
    $('#calPetit').textContent = 'ma semaine';
    $('#calTitre').textContent = a.getDate() + (a.getMonth() !== b.getMonth() ? ' ' + a.toLocaleDateString('fr-FR', { month: 'short' }) : '') + ' – ' + b.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  } else { $('#calPetit').textContent = 'ma journée'; $('#calTitre').textContent = dateLongue(jours[0]); }
  const evs = plannings();
  const ancien = $('#grilleScroll'); const top = ancien ? ancien.scrollTop : null, left = ancien ? ancien.scrollLeft : 0;
  const maintenant = new Date().getHours() * 60 + new Date().getMinutes();
  let html = `<div class="grille-scroll" id="grilleScroll"><div class="grille" style="grid-template-columns:60px repeat(${n},minmax(${n === 7 ? '104px' : '0'},1fr))"><div class="g-coin"></div>`;
  jours.forEach((d) => { const k = ymd(d); html += `<div class="g-jour ${k === auj ? 'auj' : ''}" data-aller="${k}"><span>${JOURS[d.getDay()]}</span><b>${d.getDate()}</b></div>`; });
  html += `<div class="g-heures">${[...Array(24)].map((_, i) => i ? `<div style="top:${i * h}px">${i}:00</div>` : '').join('')}</div>`;
  jours.forEach((d) => { const k = ymd(d); html += `<div class="g-col ${k === auj ? 'auj' : ''}" data-date="${k}">${placer(evs.filter((e) => e.date === k)).map(htmlEv).join('')}${k === auj ? `<div class="maintenant" style="top:${maintenant / 60 * h}px"></div>` : ''}</div>`; });
  html += '</div></div>';
  $('#calCorps').innerHTML = html;
  const sc = $('#grilleScroll');
  if (top !== null && !resetScroll && !premierScroll) { sc.scrollTop = top; sc.scrollLeft = left; }
  else { sc.scrollTop = Math.max(0, C.heureDebutAffichee * h - 8); premierScroll = false; }
}
function dessinerMois() {
  const a = calDate.getFullYear(), m = calDate.getMonth();
  $('#calPetit').textContent = 'mon mois';
  $('#calTitre').textContent = new Date(a, m, 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const debut = debutSemaine(new Date(a, m, 1)), auj = ymd(new Date());
  const parJour = {}; plannings().sort((x, y) => x.debut - y.debut).forEach((e) => (parJour[e.date] = parJour[e.date] || []).push(e));
  const semaines = plusJours(debut, 35).getMonth() === m ? 6 : 5;
  const max = innerWidth < 820 ? 2 : 3;
  let cases = '';
  for (let i = 0; i < semaines * 7; i++) {
    const d = plusJours(debut, i), k = ymd(d), l = parJour[k] || [];
    cases += `<div class="case ${d.getMonth() !== m ? 'hors' : ''} ${k === auj ? 'auj' : ''}" data-date="${k}"><button class="num" data-aller="${k}">${d.getDate()}</button>
      ${l.slice(0, max).map((e) => `<div class="puce" data-id="${esc(e.id)}" style="--c:${couleurCat(e.cat)}"><b>${hFr(e.debut)}</b>${esc(e.titre || 'Sans titre')}</div>`).join('')}
      ${l.length > max ? `<button class="plus" data-aller="${k}">+${l.length - max}</button>` : ''}</div>`;
  }
  const tetes = [...Array(7)].map((_, i) => `<div>${JOURS[plusJours(debut, i).getDay()]}</div>`).join('');
  $('#calCorps').innerHTML = `<div class="mois"><div class="mois-entete">${tetes}</div><div class="mois-grille">${cases}</div></div>`;
}

// Clics et glisser-déposer
const corps = $('#calCorps');
corps.addEventListener('click', (e) => {
  const g = e.target.closest('[data-aller]');
  if (g) { calDate = lireDate(g.dataset.aller); calVue = 'jour'; premierScroll = true; dessinerCal(); return; }
  if (e.target.closest('.puce')) return;
  const c = e.target.closest('.case'); if (c) ouvrirPlanning(null, { date: c.dataset.date, debut: 540, fin: 600 });
});
corps.addEventListener('pointerdown', (e) => {
  if (e.button > 0) return;
  const ev = e.target.closest('.ev'); if (ev) return tirerEv(e, ev, e.target.classList.contains('ev-taille') ? 'taille' : 'deplacer');
  const p = e.target.closest('.puce'); if (p) return tirerPuce(e, p);
  const col = e.target.closest('.g-col'); if (col) return creerParGlisser(e, col);
});
function defiler(y) { const sc = $('#grilleScroll'); if (!sc) return; const r = sc.getBoundingClientRect(); if (y < r.top + 70) sc.scrollTop -= 12; else if (y > r.bottom - 40) sc.scrollTop += 12; }
function suivre(el, bouge, fin) {
  const up = (u) => { el.removeEventListener('pointermove', bouge); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); fin(u); };
  el.addEventListener('pointermove', bouge); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
}
function tirerEv(e, el, mode) {
  const ev = Stockage.get(el.dataset.id); if (!ev) return;
  e.preventDefault();
  const h = H(), duree = ev.fin - ev.debut;
  const cols = $$('.g-col').map((c) => ({ c, d: c.dataset.date }));
  const c0 = cols.find((x) => x.d === ev.date); if (!c0) return;
  const prise = (e.clientY - c0.c.getBoundingClientRect().top) / h * 60 - ev.debut;
  const sx = e.clientX, sy = e.clientY; let bouge = false, cur = { date: ev.date, debut: ev.debut, fin: ev.fin };
  try { el.setPointerCapture(e.pointerId); } catch (_) {}
  suivre(el, (m) => {
    if (!bouge && Math.hypot(m.clientX - sx, m.clientY - sy) < 6) return;
    if (!bouge) { bouge = true; tirage = true; el.classList.add('tire'); }
    if (mode === 'deplacer') {
      const cible = cols.find((x) => { const r = x.c.getBoundingClientRect(); return m.clientX >= r.left && m.clientX < r.right; }) || cols.find((x) => x.d === cur.date);
      const r = cible.c.getBoundingClientRect();
      const s = borne(quart((m.clientY - r.top) / h * 60 - prise), 0, 1440 - duree);
      cur = { date: cible.d, debut: s, fin: s + duree };
      if (el.parentNode !== cible.c) cible.c.appendChild(el);
      el.style.top = s / 60 * h + 2 + 'px'; el.style.left = '4px'; el.style.width = 'calc(100% - 8px)';
    } else {
      const r = cols.find((x) => x.d === cur.date).c.getBoundingClientRect();
      cur.fin = borne(quart((m.clientY - r.top) / h * 60), cur.debut + 15, 1440);
      el.style.height = ((cur.fin - cur.debut) / 60 * h - 4) + 'px';
    }
    el.querySelector('.ev-h').textContent = hFr(cur.debut) + ' – ' + hFr(cur.fin);
    defiler(m.clientY);
  }, (u) => {
    tirage = false;
    if (bouge) { if (u.type === 'pointerup' && (cur.date !== ev.date || cur.debut !== ev.debut || cur.fin !== ev.fin)) Stockage.enregistrer(Object.assign({}, ev, cur)); dessinerCal(); }
    else if (u.type === 'pointerup') ouvrirPlanning(ev.id);
  });
}
function creerParGlisser(e, col) {
  const h = H(), r0 = col.getBoundingClientRect();
  const s0 = borne(Math.floor((e.clientY - r0.top) / h * 60 / 15) * 15, 0, 1425);
  const tactile = e.pointerType === 'touch';
  let bouge = false, fant = null, fin = Math.min(s0 + 60, 1440);
  if (!tactile) { try { col.setPointerCapture(e.pointerId); } catch (_) {} }
  suivre(col, (m) => {
    if (tactile) return;
    const cm = (m.clientY - col.getBoundingClientRect().top) / h * 60;
    if (!bouge && Math.abs(cm - s0) < 8) return;
    if (!bouge) { bouge = true; tirage = true; fant = document.createElement('div'); fant.className = 'fantome'; col.appendChild(fant); }
    fin = borne(Math.ceil(cm / 15) * 15, s0 + 15, 1440);
    fant.style.top = s0 / 60 * h + 'px'; fant.style.height = (fin - s0) / 60 * h + 'px'; fant.textContent = hFr(s0) + ' – ' + hFr(fin);
    defiler(m.clientY);
  }, (u) => {
    if (fant) fant.remove(); tirage = false;
    if (u.type === 'pointerup') ouvrirPlanning(null, { date: col.dataset.date, debut: s0, fin: bouge ? fin : Math.min(s0 + 60, 1440) });
  });
}
function tirerPuce(e, p) {
  const ev = Stockage.get(p.dataset.id); if (!ev) return;
  e.preventDefault();
  const sx = e.clientX, sy = e.clientY; let bouge = false, vol = null, sur = null;
  try { p.setPointerCapture(e.pointerId); } catch (_) {}
  const caseSous = (x, y) => { const t = document.elementFromPoint(x, y); return t && t.closest('.case'); };
  suivre(p, (m) => {
    if (!bouge && Math.hypot(m.clientX - sx, m.clientY - sy) < 6) return;
    if (!bouge) { bouge = true; tirage = true; vol = p.cloneNode(true); vol.classList.add('vole'); vol.style.width = p.offsetWidth + 'px'; document.body.appendChild(vol); p.style.opacity = .3; }
    vol.style.left = (m.clientX - 20) + 'px'; vol.style.top = (m.clientY - 12) + 'px';
    const c = caseSous(m.clientX, m.clientY);
    if (c !== sur) { if (sur) sur.classList.remove('cible'); sur = c; if (sur) sur.classList.add('cible'); }
  }, (u) => {
    if (vol) vol.remove(); if (sur) sur.classList.remove('cible'); tirage = false;
    if (bouge) { if (u.type === 'pointerup' && sur && sur.dataset.date !== ev.date) Stockage.enregistrer(Object.assign({}, ev, { date: sur.dataset.date })); dessinerCal(); }
    else if (u.type === 'pointerup') ouvrirPlanning(ev.id);
  });
}
setInterval(() => { if (vue === 'calendrier' && calVue !== 'mois' && !tirage && !$('#fenPlanning').classList.contains('ouverte')) dessinerCal(); }, 60000);

/* ---------- Fenêtre planning ---------- */
let planEdit = null, planCat = C.CATEGORIES[0].id;
function ouvrirPlanning(id, preset) {
  planEdit = id ? Stockage.get(id) : null;
  const p = planEdit || Object.assign({ titre: '', notes: '', cat: planCat }, preset);
  $('#planTitreFen').textContent = planEdit ? 'Modifier le planning' : 'Nouveau planning';
  $('#planTitre').value = p.titre || ''; $('#planDate').value = p.date;
  $('#planDebut').value = hm(p.debut); $('#planFin').value = p.fin >= 1440 ? '23:59' : hm(p.fin);
  $('#planNotes').value = p.notes || ''; planCat = p.cat || C.CATEGORIES[0].id;
  dessinerCats(); $('#planErreur').textContent = '';
  $('#planSuppr').style.display = planEdit ? '' : 'none';
  $('#fenPlanning').classList.add('ouverte');
  if (!planEdit) setTimeout(() => $('#planTitre').focus(), 40);
}
function dessinerCats() { $('#planCats').innerHTML = C.CATEGORIES.map((c) => `<button type="button" data-c="${c.id}" class="${c.id === planCat ? 'on' : ''}" style="background:${couleurCat(c.id)}">${esc(c.nom)}</button>`).join(''); }
$('#planCats').onclick = (e) => { const b = e.target.closest('[data-c]'); if (b) { planCat = b.dataset.c; dessinerCats(); } };
const fermerPlanning = () => { $('#fenPlanning').classList.remove('ouverte'); planEdit = null; };
$('#planAnnuler').onclick = fermerPlanning;
$('#fenPlanning').addEventListener('pointerdown', (e) => { if (e.target.id === 'fenPlanning') fermerPlanning(); });
$('#formPlanning').onsubmit = (e) => {
  e.preventDefault();
  const date = $('#planDate').value, debut = enMin($('#planDebut').value); let fin = enMin($('#planFin').value);
  if (fin === 1439) fin = 1440;
  if (!date) return ($('#planErreur').textContent = 'Choisis une date.');
  if (fin <= debut) return ($('#planErreur').textContent = "L'heure de fin doit être après le début.");
  const base = planEdit || { id: nouvelId('p'), type: 'planning', cree: Date.now() };
  Stockage.enregistrer(Object.assign({}, base, { titre: $('#planTitre').value.trim() || 'Sans titre', date, debut, fin, cat: planCat, notes: $('#planNotes').value }));
  fermerPlanning();
  if (calVue !== 'mois') { const d = lireDate(date), vs = calVue === 'semaine' ? debutSemaine(calDate) : lireDate(ymd(calDate)), ve = plusJours(vs, calVue === 'semaine' ? 6 : 0); if (d < vs || d > ve) calDate = d; }
  dessinerCal();
};
$('#planSuppr').onclick = async () => {
  if (!planEdit) return; const p = planEdit; fermerPlanning();
  if (await demander('Supprimer ce planning ?', '« ' + (p.titre || 'Sans titre') + ' » sera supprimé.')) { Stockage.supprimer(p.id); dessinerCal(); message('Planning supprimé'); }
};
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if ($('#fenStickers').classList.contains('ouverte')) fermerStickers(); else if ($('#fenPlanning').classList.contains('ouverte')) fermerPlanning(); else if ($('#fenConfirm').classList.contains('ouverte')) $('#confNon').click(); } });

/* ================= PERSONNALISER ================= */
let tNom = null;
function dessinerPerso() {
  const r = R();
  [['#pNom', r.nom], ['#pPrenom', r.prenom], ['#pCitation', r.citation]].forEach(([s, v]) => { if (document.activeElement !== $(s)) $(s).value = v || ''; });
  $('#pAmbiances').innerHTML = C.AMBIANCES.map((a) => `<button data-a="${a.id}" class="${r.ambiance === a.id ? 'on' : ''}"><span class="rond" style="background:${a.apercu}"></span>${esc(a.nom)}</button>`).join('');
  $('#pCouleurs').innerHTML = C.COULEURS.map((c) => `<button data-c="${c.code}" aria-label="${esc(c.nom)}" title="${esc(c.nom)}" class="${r.couleur === c.code ? 'on' : ''}" style="background:${c.code}"></button>`).join('') + `<input type="color" id="pCouleurLibre" value="${accent()}" aria-label="Couleur personnalisée" title="Couleur personnalisée">`;
  $('#pPolices').innerHTML = C.POLICES.map((p, i) => `<button data-p="${i}" class="${+r.police === i ? 'on' : ''}" style="font-family:${p.css}">${esc(p.nom)}</button>`).join('');
  $('#pTaille').value = r.taille; $('#pTailleV').textContent = r.taille + ' px';
  $('#pPapiers').innerHTML = C.PAPIERS.map((p) => `<button data-pa="${p.id}" class="${r.papier === p.id ? 'on' : ''}">${esc(p.nom)}</button>`).join('');
}
const texteLibre = (champ, cle, defaut) => $(champ).addEventListener('input', (e) => { clearTimeout(tNom); const v = e.target.value; tNom = setTimeout(() => sauverReglages({ [cle]: v.trim() || defaut }), 400); });
texteLibre('#pNom', 'nom', C.nomParDefaut); texteLibre('#pPrenom', 'prenom', ''); texteLibre('#pCitation', 'citation', C.citationParDefaut);
$('#pAmbiances').onclick = (e) => { const b = e.target.closest('[data-a]'); if (b) { sauverReglages({ ambiance: b.dataset.a }); dessinerPerso(); } };
$('#pCouleurs').onclick = (e) => { const b = e.target.closest('[data-c]'); if (b) { sauverReglages({ couleur: b.dataset.c }); dessinerPerso(); } };
$('#pCouleurs').addEventListener('input', (e) => { if (e.target.id === 'pCouleurLibre') document.documentElement.style.setProperty('--accent', e.target.value); });
$('#pCouleurs').addEventListener('change', (e) => { if (e.target.id === 'pCouleurLibre') { sauverReglages({ couleur: e.target.value }); dessinerPerso(); } });
$('#pPolices').onclick = (e) => { const b = e.target.closest('[data-p]'); if (!b) return; const i = +b.dataset.p; sauverReglages({ police: i, taille: C.POLICES[i].taille }); dessinerPerso(); };
$('#pTaille').oninput = (e) => { $('#pTailleV').textContent = e.target.value + ' px'; document.documentElement.style.setProperty('--taille', e.target.value + 'px'); };
$('#pTaille').onchange = (e) => sauverReglages({ taille: +e.target.value });
$('#pPapiers').onclick = (e) => { const b = e.target.closest('[data-pa]'); if (b) { sauverReglages({ papier: b.dataset.pa }); dessinerPerso(); } };

$('#exporter').onclick = () => {
  const data = JSON.stringify({ app: 'mon-journal', version: 1, date: new Date().toISOString(), elements: Stockage.tout() }, null, 2);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
  a.download = 'sauvegarde-journal-' + ymd(new Date()) + '.json';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  message('Sauvegarde téléchargée');
};
$('#importer').onchange = async (e) => {
  const f = e.target.files[0]; e.target.value = ''; if (!f) return;
  try {
    const d = JSON.parse(await f.text());
    const el = Array.isArray(d.elements) ? d.elements : [];
    if (!(await demander('Restaurer cette sauvegarde ?', el.length + ' élément(s) seront ajoutés ou mis à jour.'))) return;
    let n = 0;
    el.forEach((x) => { if (x && typeof x.id === 'string' && ['note', 'planning', 'reglages', 'stickers'].includes(x.type)) { Stockage.enregistrer(x); n++; } });
    toutRedessiner(); message(n + ' élément(s) restauré(s)');
  } catch (_) { message('Ce fichier n\'est pas une sauvegarde valide'); }
};

/* ================= Démarrage ================= */
Stockage.init(toutRedessiner);
appliquer();
dessinerNotes();
aller(location.hash.slice(1) || 'journal');
window.addEventListener('beforeunload', validerNote);
document.addEventListener('visibilitychange', () => { if (document.hidden) validerNote(); });
})();
