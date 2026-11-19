/* =========================================================
   STICKERS-AQUARELLE.JS — la grande planche « aquarelle rose »
   ---------------------------------------------------------
   Ces stickers sont dessinés par du code (SVG) : chaque fonction
   ci-dessous fabrique un type de sticker, et la liste en bas
   choisit les couleurs. Pour une nouvelle variante, copie une ligne
   de la liste et change les couleurs (#RRVVBB).
   ========================================================= */
(function () {
  // Effet « bords d'aquarelle » : déforme légèrement les contours
  const aqua = (id, force) => `<filter id="${id}-w" x="-15%" y="-15%" width="130%" height="130%"><feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="${(id.length * 7) % 50}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="${force || 2.6}" xChannelSelector="R" yChannelSelector="G"/></filter>`;
  const lin = (id, a, b, c, x2, y2) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2 ?? 1}" y2="${y2 ?? 1}"><stop offset="0" stop-color="${a}"/><stop offset=".55" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient>`;
  const rad = (id, a, b, c, cx, cy, r) => `<radialGradient id="${id}" cx="${cx ?? 50}" cy="${cy ?? 50}" r="${r ?? 50}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${a}"/><stop offset=".6" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></radialGradient>`;
  const svg = (inner, vb) => `<svg viewBox="${vb || '0 0 100 100'}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
  const hl = (d, o) => `<path d="${d}" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity="${o ?? .55}"/>`;

  /* ---------- Nœud en satin ---------- */
  function noeud(id, clair, moyen, fonce) {
    return svg(`<defs>${aqua(id)}${lin(id + 'a', clair, moyen, fonce)}${lin(id + 'b', clair, moyen, fonce, 0, 1)}</defs>
      <g filter="url(#${id}-w)" stroke="${fonce}" stroke-opacity=".35" stroke-width="1.1">
        <path d="M46 50C41 64 33 79 24 92l10-3 4 8c7-14 11-29 14-43z" fill="url(#${id}b)"/>
        <path d="M54 50c5 14 13 29 22 42l-10-3-4 8c-7-14-11-29-14-43z" fill="url(#${id}a)"/>
        <path d="M48 46C38 29 21 16 11 23 2 30 7 47 16 53c10 7 24 3 32-3z" fill="url(#${id}a)"/>
        <path d="M52 46c10-17 27-30 37-23 9 7 4 24-5 30-10 7-24 3-32-3z" fill="url(#${id}b)"/>
        <path d="M46 47c-9-6-21-10-28-6 7 4 17 8 28 9z" fill="${fonce}" opacity=".35" stroke="none"/>
        <path d="M54 47c9-6 21-10 28-6-7 4-17 8-28 9z" fill="${fonce}" opacity=".35" stroke="none"/>
        <ellipse cx="50" cy="49" rx="7.5" ry="9" fill="url(#${id}a)"/>
      </g>
      ${hl('M14 30c6-5 14-3 21 4')}${hl('M66 33c6-6 13-8 19-4', .45)}${hl('M47 44c1-2 3-3 5-2', .7)}`);
  }

  /* ---------- Fleurs ---------- */
  const formes = {
    pointu: (L, w) => `M0 0C${-w} ${-L * .3} ${-w * .7} ${-L * .8} 0 ${-L}C${w * .7} ${-L * .8} ${w} ${-L * .3} 0 0z`,
    rond: (L, w) => `M0 0C${-w} ${-L * .2} ${-w * 1.15} ${-L * .95} 0 ${-L}C${w * 1.15} ${-L * .95} ${w} ${-L * .2} 0 0z`,
    encoche: (L, w) => `M0 0C${-w} ${-L * .3} ${-w} ${-L * .9} ${-w * .4} ${-L}L0 ${-L * .86}L${w * .4} ${-L}C${w} ${-L * .9} ${w} ${-L * .3} 0 0z`,
    fin: (L, w) => `M0 0C${-w} ${-L * .4} ${-w} ${-L * .9} 0 ${-L}C${w} ${-L * .9} ${w} ${-L * .4} 0 0z`
  };
  function petales(id, n, L, w, forme, decal, veine) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const a = decal + i * 360 / n;
      s += `<g transform="translate(50 50) rotate(${a.toFixed(1)})"><path d="${formes[forme](L, w)}" fill="url(#${id}p)"/>${veine ? `<path d="M0 -5L0 ${-L * .78}" stroke="${veine}" stroke-width="1" opacity=".45" fill="none"/>` : ''}</g>`;
    }
    return s;
  }
  function fleur(id, o) {
    const coeur = o.coeur === 'lys'
      ? [0, 50, 105, 160, 215, 270, 320].map((a) => `<g transform="translate(50 50) rotate(${a})"><path d="M0 0L0 -14" stroke="#9CC56B" stroke-width="1.2"/><ellipse cx="0" cy="-15" rx="1.6" ry="2.8" fill="#B5522B"/></g>`).join('')
      : o.coeur === 'hibiscus'
        ? `<path d="M50 50L60 26" stroke="${o.fonce}" stroke-width="2.4" stroke-linecap="round"/>${[[58, 25], [62, 27], [60, 22], [56, 23]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8" fill="#FFC857"/>`).join('')}<circle cx="50" cy="50" r="5" fill="${o.fonce}" opacity=".6"/>`
        : o.coeur === 'marguerite'
          ? `<circle cx="50" cy="50" r="12" fill="url(#${id}c)"/>${Array.from({ length: 14 }, (_, i) => `<circle cx="${50 + Math.cos(i * 2.4) * (i * .7)}" cy="${50 + Math.sin(i * 2.4) * (i * .7)}" r=".9" fill="#E0A100" opacity=".7"/>`).join('')}`
          : o.coeur === 'rose'
            ? `<path d="M50 50c-4-4 2-9 6-5 4 4-2 11-8 8-6-3-3-12 4-13" fill="none" stroke="${o.fonce}" stroke-width="1.6" opacity=".7"/>`
            : `<circle cx="50" cy="50" r="5" fill="${o.fonce}" opacity=".7"/>${[0, 72, 144, 216, 288].map((a) => `<g transform="translate(50 50) rotate(${a})"><path d="M0 0L0 -11" stroke="${o.fonce}" stroke-width="1"/><circle cx="0" cy="-12" r="1.5" fill="#F7C04A"/></g>`).join('')}`;
    const couches = (o.couches || [[o.n, o.L, o.w, o.forme, o.decal || 0]]).map(([n, L, w, f, d]) => petales(id, n, L, w, f, d, o.veine)).join('');
    return svg(`<defs>${aqua(id, o.force)}${rad(id + 'p', o.centre, o.milieu, o.bout, 50, 50, o.L || 44)}${rad(id + 'c', '#FFE58A', '#FFD54F', '#F2B705', 50, 50, 12)}</defs>
      <g filter="url(#${id}-w)" stroke="${o.fonce}" stroke-opacity=".28" stroke-width=".9">${couches}</g>${coeur}`);
  }

  /* ---------- Cœur brillant ---------- */
  function coeur(id, clair, moyen, fonce) {
    return svg(`<defs>${aqua(id, 1.6)}${rad(id + 'g', clair, moyen, fonce, 38, 32, 62)}</defs>
      <path filter="url(#${id}-w)" d="M50 88C20 67 7 49 7 32 7 18 18 8 31 8c9 0 15 5 19 12 4-7 10-12 19-12 13 0 24 10 24 24 0 17-13 35-43 56z" fill="url(#${id}g)" stroke="${fonce}" stroke-opacity=".35" stroke-width="1.2"/>
      <ellipse cx="28" cy="27" rx="9" ry="5" fill="#fff" opacity=".6" transform="rotate(-35 28 27)"/><circle cx="40" cy="20" r="2" fill="#fff" opacity=".7"/>`);
  }
  function troisCoeurs(id, a, b, c) {
    const h = (x, y, s, col) => `<path transform="translate(${x} ${y}) scale(${s})" d="M50 88C20 67 7 49 7 32 7 18 18 8 31 8c9 0 15 5 19 12 4-7 10-12 19-12 13 0 24 10 24 24 0 17-13 35-43 56z" fill="${col}" stroke="#C2185B" stroke-opacity=".3" stroke-width="2"/>`;
    return svg(`<defs>${aqua(id, 1.5)}</defs><g filter="url(#${id}-w)">${h(14, 0, .36, a)}${h(36, 30, .36, b)}${h(18, 60, .36, c)}</g>${hl('M24 10c3-2 6-2 8 1', .6)}${hl('M46 40c3-2 6-2 8 1', .6)}${hl('M28 70c3-2 6-2 8 1', .6)}`);
  }

  /* ---------- Étoile douce ---------- */
  function etoile(id, clair, fonce) {
    return svg(`<defs>${aqua(id, 2)}${rad(id + 'g', '#fff', clair, fonce, 45, 40, 55)}</defs>
      <path filter="url(#${id}-w)" d="M50 8l11.2 28.6 30.6 1.8-23.7 19.5 7.8 29.7L50 71 24.1 87.6l7.8-29.7L8.2 38.4l30.6-1.8z" fill="url(#${id}g)" stroke="${fonce}" stroke-opacity=".3" stroke-width="5" stroke-linejoin="round"/>`);
  }

  /* ---------- Papillon ---------- */
  function papillon(id, clair, moyen, fonce) {
    return svg(`<defs>${aqua(id, 2.2)}${rad(id + 'g', clair, moyen, fonce, 50, 50, 46)}</defs>
      <g filter="url(#${id}-w)" fill="url(#${id}g)" stroke="${fonce}" stroke-opacity=".4" stroke-width="1">
        <path d="M48 46C40 26 24 8 10 14 0 20 6 42 18 50c10 6 22 4 30-4z"/>
        <path d="M52 46c8-20 24-38 38-32 10 6 4 28-8 36-10 6-22 4-30-4z"/>
        <path d="M48 52c-12 0-28 6-30 20-2 12 10 18 20 12 8-5 10-20 10-32z"/>
        <path d="M52 52c12 0 28 6 30 20 2 12-10 18-20 12-8-5-10-20-10-32z"/>
      </g>
      <g fill="none" stroke="${fonce}" stroke-width=".9" opacity=".5"><path d="M48 46C38 36 26 26 16 22M48 48C36 44 24 42 14 40M48 54C40 60 32 66 26 76M52 46c10-10 22-20 32-24M52 48c12-4 24-6 34-8M52 54c8 6 16 12 22 22"/></g>
      <g fill="#fff" opacity=".7"><circle cx="16" cy="24" r="2"/><circle cx="84" cy="24" r="2"/><circle cx="24" cy="74" r="1.6"/><circle cx="76" cy="74" r="1.6"/></g>
      <rect x="47.5" y="36" width="5" height="34" rx="2.5" fill="#7A3B57"/><path d="M49 37q-5-12-10-15M51 37q5-12 10-15" fill="none" stroke="#7A3B57" stroke-width="1.4" stroke-linecap="round"/>`);
  }

  /* ---------- Objets ---------- */
  const objets = {
    cerises: (id) => svg(`<defs>${aqua(id, 1.8)}${rad(id + 'c', '#FFD6E0', '#F48FB1', '#D45A86', 30, 62, 22)}${rad(id + 'd', '#FFD6E0', '#F48FB1', '#D45A86', 64, 66, 22)}${lin(id + 'n', '#FFE3EC', '#F8A5C2', '#E07AA0')}</defs>
      <path d="M33 56Q40 34 56 22M66 60Q62 38 56 22" fill="none" stroke="#7B9E5B" stroke-width="2.6" stroke-linecap="round"/>
      <g filter="url(#${id}-w)" stroke="#C2185B" stroke-opacity=".3"><circle cx="33" cy="68" r="17" fill="url(#${id}c)"/><circle cx="66" cy="72" r="17" fill="url(#${id}d)"/>
      <path d="M55 22c-8-8-18-12-20-6s10 8 20 6zM57 22c8-8 18-12 20-6s-10 8-20 6z" fill="url(#${id}n)"/><path d="M55 23l-5 12 4-1 2 4 2-14z" fill="url(#${id}n)"/><circle cx="56" cy="22" r="3" fill="#F48FB1"/></g>
      <ellipse cx="26" cy="62" rx="5" ry="3" fill="#fff" opacity=".6" transform="rotate(-30 26 62)"/><ellipse cx="59" cy="66" rx="5" ry="3" fill="#fff" opacity=".6" transform="rotate(-30 59 66)"/>`),

    bisou: (id) => svg(`<defs>${aqua(id, 3.5)}${lin(id + 'g', '#F9C6D3', '#EE8FAB', '#D9668A', 0, 1)}</defs>
      <g filter="url(#${id}-w)" opacity=".92"><path d="M8 50c10-14 24-20 32-14 4 3 6 3 10 0 4 3 6 3 10 0 8-6 22 0 32 14-12 4-22 6-42 6S20 54 8 50z" fill="url(#${id}g)"/><path d="M8 52c16 2 28 4 42 4s26-2 42-4c-8 16-24 26-42 26S16 68 8 52z" fill="url(#${id}g)"/></g>
      <path d="M10 52c14 4 28 5 40 5s26-1 40-5" fill="none" stroke="#C9567A" stroke-width="1.6" opacity=".6"/>
      <g stroke="#fff" stroke-width="1" opacity=".45"><path d="M30 64v6M38 66v7M46 66v8M54 66v8M62 66v7M70 64v6M30 44v-4M40 42v-5M60 42v-5M70 44v-4"/></g>`),

    photo: (id) => svg(`<defs>${lin(id + 'g', '#F8D7E0', '#EDB6C6', '#D795AA', 0, 1)}${rad(id + 'l', '#6B5560', '#2E2228', '#120D10', 46, 54, 16)}</defs>
      <rect x="12" y="24" width="76" height="62" rx="12" fill="url(#${id}g)" stroke="#B9788E" stroke-opacity=".4"/>
      <rect x="12" y="66" width="76" height="20" rx="0" fill="#E7A9BC" opacity=".6"/><rect x="58" y="14" width="22" height="12" rx="4" fill="#E7A9BC"/>
      <circle cx="50" cy="56" r="19" fill="#F3C9D5" stroke="#B9788E" stroke-opacity=".4"/><circle cx="50" cy="56" r="14" fill="url(#${id}l)"/><circle cx="45" cy="51" r="4" fill="#fff" opacity=".5"/>
      <rect x="18" y="31" width="16" height="10" rx="3" fill="#3B2C33" opacity=".75"/><circle cx="76" cy="36" r="4" fill="#FFF3B0"/><rect x="22" y="72" width="22" height="4" rx="2" fill="#fff" opacity=".6"/>`),

    livres: (id) => svg(`<defs>${lin(id + 'n', '#FFE3EC', '#F8A5C2', '#E07AA0')}</defs>
      <rect x="14" y="70" width="72" height="16" rx="3" fill="#F2B8C8" stroke="#C97A93" stroke-opacity=".5"/><rect x="18" y="73" width="64" height="2" fill="#fff" opacity=".7"/>
      <rect x="20" y="54" width="62" height="16" rx="3" fill="#FAD7E1" stroke="#C97A93" stroke-opacity=".5"/><rect x="24" y="60" width="54" height="5" rx="2" fill="#F4A8BE"/>
      <rect x="16" y="38" width="66" height="16" rx="3" fill="#E9A4B8" stroke="#C97A93" stroke-opacity=".5"/><g fill="#fff" opacity=".55"><circle cx="24" cy="46" r="1.4"/><circle cx="32" cy="46" r="1.4"/><circle cx="40" cy="46" r="1.4"/><circle cx="48" cy="46" r="1.4"/><circle cx="56" cy="46" r="1.4"/><circle cx="64" cy="46" r="1.4"/><circle cx="72" cy="46" r="1.4"/></g>
      <path d="M50 38V86" stroke="#F06292" stroke-width="3" opacity=".75"/>
      <g stroke="#C2185B" stroke-opacity=".3"><path d="M49 36c-8-8-18-12-20-6s10 8 20 6zM51 36c8-8 18-12 20-6s-10 8-20 6z" fill="url(#${id}n)"/><circle cx="50" cy="36" r="3.5" fill="#F48FB1"/></g>`),

    lettre: (id) => svg(`<defs>${lin(id + 'g', '#FFF1F5', '#FAD3DE', '#F1B3C5')}${rad(id + 'c', '#F26B8E', '#D63C67', '#A8234A', 48, 52, 12)}</defs>
      <g transform="rotate(-10 50 50)"><rect x="12" y="24" width="76" height="52" rx="6" fill="url(#${id}g)" stroke="#D88AA0" stroke-opacity=".5"/><path d="M13 27l37 27 37-27" fill="none" stroke="#E59AB0" stroke-width="2"/>
      <path d="M50 64c-7-4-11-8-11-12 0-4 3-6 6-6 2 0 4 1 5 3 1-2 3-3 5-3 3 0 6 2 6 6 0 4-4 8-11 12z" fill="url(#${id}c)"/></g>`),

    coquillage: (id) => svg(`<defs>${aqua(id, 1.6)}${rad(id + 'g', '#FFFFFF', '#FBE3EA', '#E8B9C7', 50, 80, 60)}${rad(id + 'p', '#FFFFFF', '#F6EEF2', '#D9C6CF', 47, 72, 8)}</defs>
      <path filter="url(#${id}-w)" d="M50 84C28 84 10 70 10 50 10 30 28 14 50 14s40 16 40 36c0 20-18 34-40 34z" fill="url(#${id}g)" stroke="#D59BAE" stroke-opacity=".5"/>
      <g fill="none" stroke="#E5A9BB" stroke-width="1.6" opacity=".8"><path d="M50 84L20 30M50 84L32 20M50 84V16M50 84L68 20M50 84L80 30M50 84L13 44M50 84l37-40"/></g>
      <path d="M38 84h24l-4 8H42z" fill="#EBC1CF"/><circle cx="50" cy="74" r="7" fill="url(#${id}p)"/>`),

    lune: (id) => svg(`<defs>${rad(id + 'g', '#FBE1E8', '#EDB2C3', '#C9839B', 40, 38, 52)}<filter id="${id}-t"><feTurbulence type="fractalNoise" baseFrequency=".06" numOctaves="3" seed="4"/><feColorMatrix values="0 0 0 0 .75  0 0 0 0 .4  0 0 0 0 .5  0 0 0 .55 -.15"/><feComposite in2="SourceGraphic" operator="in"/></filter></defs>
      <circle cx="50" cy="50" r="42" fill="url(#${id}g)"/><circle cx="50" cy="50" r="42" fill="#000" filter="url(#${id}-t)"/>
      <g fill="#C27A92" opacity=".35"><circle cx="34" cy="38" r="7"/><circle cx="62" cy="62" r="9"/><circle cx="64" cy="30" r="4"/><circle cx="36" cy="66" r="4"/></g>`),

    bouquet: (id) => svg(`<defs>${aqua(id, 2)}${lin(id + 'k', '#FFF8EE', '#F4E6D2', '#DCC6A8', 1, 0)}${lin(id + 't', '#FBD0DC', '#F09AB5', '#D6668C', 0, 1)}</defs>
      <g stroke="#7FA65A" stroke-width="2.2" fill="none"><path d="M50 60L40 26M50 60L50 20M50 60L60 26M50 60L32 34M50 60L68 34"/></g>
      <g filter="url(#${id}-w)" fill="url(#${id}t)" stroke="#C2185B" stroke-opacity=".3">${[[40, 24, -15], [50, 16, 0], [60, 24, 15], [31, 32, -28], [69, 32, 28]].map(([x, y, r]) => `<path transform="translate(${x} ${y}) rotate(${r})" d="M-7 4c0-9 3-13 7-13s7 4 7 13c0 5-3 8-7 8s-7-3-7-8z"/><path transform="translate(${x} ${y}) rotate(${r})" d="M0-9l-3 6 3-2 3 2z" fill="#E77FA2" stroke="none"/>`).join('')}</g>
      <path d="M50 46c-4 6-6 10-2 12M44 48c-6 4-10 6-8 10" stroke="#8FBF6A" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M26 44l24 50 24-50c-8 4-16 6-24 6s-16-2-24-6z" fill="url(#${id}k)" stroke="#BFA27E" stroke-opacity=".6"/>
      <path d="M30 46l20 44M70 46L50 90" stroke="#E6D3B8" stroke-width="1.2"/><circle cx="50" cy="66" r="5" fill="#fff" stroke="#BFA27E" stroke-opacity=".6"/>`),

    tulipes: (id) => svg(`<defs>${aqua(id, 2)}${lin(id + 't', '#FDE3EA', '#F6B2C6', '#E28AA8', 0, 1)}</defs>
      <g stroke="#7FA65A" stroke-width="2" fill="none"><path d="M48 92c-2-20-6-40-12-60M50 92c0-24 2-46 6-66M52 92c4-20 10-36 18-52M50 92c-4-16-12-30-22-42"/></g>
      <path d="M46 80c-12-6-18-18-18-30 10 6 16 16 18 30zM54 78c10-8 16-20 16-30-10 8-16 18-16 30z" fill="#9CC77A" opacity=".9"/>
      <g filter="url(#${id}-w)" fill="url(#${id}t)" stroke="#C2185B" stroke-opacity=".25">${[[36, 28, -12], [56, 20, 6], [70, 38, 22], [28, 48, -28]].map(([x, y, r]) => `<path transform="translate(${x} ${y}) rotate(${r})" d="M-8 3c0-10 3-14 8-14s8 4 8 14c0 6-3 9-8 9s-8-3-8-9z"/>`).join('')}</g>
      <path d="M44 80q6 4 12 0" stroke="#C9A27A" stroke-width="3" fill="none"/>`),

    macaron: (id, a, b) => svg(`<defs>${lin(id + 'g', '#fff', a, b, 0, 1)}</defs>
      <ellipse cx="50" cy="40" rx="34" ry="14" fill="url(#${id}g)" stroke="${b}" stroke-opacity=".5"/><path d="M18 42c4 6 6 6 8 4 2 4 4 4 6 2 2 4 6 4 8 2 2 4 6 4 8 2 2 4 6 4 8 2 2 4 6 4 8 0 2 2 4 2 8-4" fill="${a}" opacity=".7"/>
      <rect x="18" y="46" width="64" height="10" rx="5" fill="#FFF4E8"/>
      <path d="M18 58c4-4 6-4 8-2 2-4 4-4 6-2 2-4 6-4 8-2 2-4 6-4 8-2 2-4 6-4 8-2 2-4 6-4 8 0 2-2 4-2 8 4" fill="${a}" opacity=".7"/><ellipse cx="50" cy="62" rx="34" ry="13" fill="url(#${id}g)" stroke="${b}" stroke-opacity=".5"/>
      <ellipse cx="38" cy="34" rx="10" ry="3" fill="#fff" opacity=".55"/>`),

    parfum: (id) => svg(`<defs>${lin(id + 'v', '#FFFFFF', '#F7CEDB', '#E596AE', 1, 1)}${lin(id + 'n', '#FFE3EC', '#F8A5C2', '#E07AA0')}</defs>
      <rect x="40" y="10" width="20" height="16" rx="4" fill="#F2C94C" stroke="#C99A2E" stroke-opacity=".5"/><rect x="44" y="24" width="12" height="8" fill="#E9B840"/>
      <rect x="20" y="32" width="60" height="56" rx="16" fill="url(#${id}v)" stroke="#D17D99" stroke-opacity=".5" opacity=".95"/><rect x="28" y="40" width="10" height="36" rx="5" fill="#fff" opacity=".5"/>
      <rect x="34" y="56" width="32" height="14" rx="3" fill="#fff" opacity=".75"/><text x="50" y="66" text-anchor="middle" font-family="Playfair Display, serif" font-style="italic" font-size="8" fill="#C2185B">rose</text>
      <g stroke="#C2185B" stroke-opacity=".3"><path d="M49 32c-6-6-14-9-16-5s8 6 16 5zM51 32c6-6 14-9 16-5s-8 6-16 5z" fill="url(#${id}n)"/></g>`),

    the: (id) => svg(`<defs>${lin(id + 'g', '#FFFFFF', '#FBE3EA', '#EFC1CF', 0, 1)}</defs>
      <ellipse cx="50" cy="82" rx="38" ry="8" fill="#F5CFDA" stroke="#D8A0B2" stroke-opacity=".5"/>
      <path d="M70 46c14-2 18 8 14 14-3 5-10 6-16 4" fill="none" stroke="#F0BCCB" stroke-width="5"/>
      <path d="M20 40h56c0 22-10 38-28 38S20 62 20 40z" fill="url(#${id}g)" stroke="#D8A0B2" stroke-opacity=".6"/><ellipse cx="48" cy="40" rx="28" ry="6" fill="#D9A07A" opacity=".85"/>
      ${[[34, 58], [48, 64], [60, 56]].map(([x, y]) => `<g transform="translate(${x} ${y})"><circle r="3" fill="#F48FB1"/><circle cx="3" cy="-3" r="2.4" fill="#F8BBD0"/><circle cx="-3" cy="-3" r="2.4" fill="#F8BBD0"/></g>`).join('')}
      <path d="M40 30q-4-6 0-12M52 30q-4-6 0-12" fill="none" stroke="#E7B8C7" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>`),

    cupcake: (id) => svg(`<defs>${lin(id + 'c', '#FFF0F5', '#F9C3D3', '#EE96B1', 0, 1)}</defs>
      <path d="M22 54h56l-8 34H30z" fill="#F7D9C4" stroke="#C99E80" stroke-opacity=".6"/><g stroke="#E3BC9F" stroke-width="1.6"><path d="M34 56l2 30M44 56l1 30M56 56l-1 30M66 56l-2 30"/></g>
      <path d="M18 56c-4-10 4-18 12-16 0-12 14-20 24-12 10-6 22 2 20 12 10 0 14 10 8 16z" fill="url(#${id}c)" stroke="#D97A9A" stroke-opacity=".4"/>
      <circle cx="54" cy="20" r="7" fill="#E04F6F"/><path d="M54 13q2-6 8-8" stroke="#6E8F4E" stroke-width="2" fill="none"/><circle cx="51" cy="18" r="2" fill="#fff" opacity=".6"/>
      <g fill="#fff" opacity=".8"><rect x="30" y="40" width="5" height="2" rx="1" transform="rotate(30 32 41)"/><rect x="60" y="44" width="5" height="2" rx="1" transform="rotate(-20 62 45)"/><rect x="44" y="34" width="5" height="2" rx="1"/></g>`),

    fraise: (id) => svg(`<defs>${aqua(id, 1.6)}${rad(id + 'g', '#FFB3C1', '#F1607A', '#C8304F', 42, 46, 48)}</defs>
      <path filter="url(#${id}-w)" d="M50 92C22 74 16 54 20 42c3-9 14-13 30-13s27 4 30 13c4 12-2 32-30 50z" fill="url(#${id}g)" stroke="#A8233F" stroke-opacity=".3"/>
      <path d="M28 34l9-12 6 9 7-14 7 14 6-9 9 12c-14 7-30 7-44 0z" fill="#8DBA68"/><g fill="#FFF3B0">${[[34, 48], [48, 44], [62, 48], [40, 60], [56, 60], [48, 74], [30, 58], [68, 58]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="1.6" ry="2.6"/>`).join('')}</g>
      <ellipse cx="34" cy="42" rx="6" ry="3" fill="#fff" opacity=".45" transform="rotate(-30 34 42)"/>`),

    perles: (id) => svg(`<defs>${rad(id + 'p', '#FFFFFF', '#F7EDF1', '#D8C4CC', 45, 45, 8)}</defs>
      ${Array.from({ length: 13 }, (_, i) => { const a = Math.PI * (0.1 + i * 0.8 / 12); const x = 50 - Math.cos(a) * 38, y = 26 + Math.sin(a) * 50; return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})"><circle r="6" fill="url(#${id}p)" stroke="#CDB6BF" stroke-opacity=".6" transform="translate(-50 -50)" cx="50" cy="50"/><circle cx="-2" cy="-2" r="1.6" fill="#fff"/></g>`; }).join('')}
      <path d="M44 74c-6-6-10-10-10-14 0-4 3-6 6-6 3 0 5 2 6 4 1-2 3-4 6-4 3 0 6 2 6 6 0 4-4 8-10 14z" fill="#F48FB1" stroke="#C2185B" stroke-opacity=".3" transform="translate(4 6)"/>`)
  };

  /* ---------- Étiquettes (mots) en aquarelle ---------- */
  function etiquette(id, mot, fond, bord) {
    const taille = Math.min(24, 120 / mot.length);
    return svg(`<rect x="5" y="10" width="90" height="40" rx="20" fill="${fond}" stroke="${bord}" stroke-opacity=".45" stroke-width="1.4"/><rect x="9" y="14" width="82" height="32" rx="16" fill="none" stroke="${bord}" stroke-opacity=".25" stroke-dasharray="2 3"/>
      <text x="50" y="${30 + taille * .35}" text-anchor="middle" font-family="Dancing Script, cursive" font-weight="600" font-size="${taille.toFixed(1)}" textLength="${mot.length > 7 ? 72 : ''}" lengthAdjust="spacingAndGlyphs" fill="${bord}">${mot}</text>`.replace(' textLength=""', ''), '0 0 100 60');
  }

  /* ---------- La liste : modifie les couleurs ou ajoute des variantes ici ---------- */
  const A = [
    ['aq-noeud-rose', 'Nœud rose', noeud('aqn1', '#FFE3EC', '#F4A6BF', '#D9708F')],
    ['aq-noeud-poudre', 'Nœud poudré', noeud('aqn2', '#FFF4F7', '#F7CAD7', '#E39BB0')],
    ['aq-noeud-framboise', 'Nœud framboise', noeud('aqn3', '#FBC6D6', '#E9799B', '#B9466C')],
    ['aq-noeud-lilas', 'Nœud lilas', noeud('aqn4', '#F3E6FB', '#D7B6EE', '#A982C9')],
    ['aq-noeud-peche', 'Nœud pêche', noeud('aqn5', '#FFEDE3', '#F9C2A6', '#E28F6C')],
    ['aq-tulipes', 'Bouquet de tulipes', objets.bouquet('aqb1')],
    ['aq-tulipes2', 'Tulipes', objets.tulipes('aqb2')],
    ['aq-lys', 'Lys rose', fleur('aqf1', { n: 6, L: 44, w: 16, forme: 'pointu', centre: '#E1567F', milieu: '#F4A6BF', bout: '#FDE3EA', fonce: '#C2406A', veine: '#C2406A', coeur: 'lys' })],
    ['aq-lys-blanc', 'Lys poudré', fleur('aqf2', { n: 6, L: 44, w: 16, forme: 'pointu', centre: '#F08BAA', milieu: '#FBD3DF', bout: '#FFFFFF', fonce: '#D1708F', veine: '#D1708F', coeur: 'lys', decal: 30 })],
    ['aq-hibiscus', 'Fleur d’hibiscus', fleur('aqf3', { n: 5, L: 42, w: 22, forme: 'rond', centre: '#D74D78', milieu: '#EE93AF', bout: '#F9C9D7', fonce: '#B23A62', veine: '#B23A62', coeur: 'hibiscus', force: 4 })],
    ['aq-hibiscus2', 'Fleur rose pâle', fleur('aqf4', { n: 5, L: 42, w: 22, forme: 'rond', centre: '#EB8FAD', milieu: '#F7C1D1', bout: '#FFE9F0', fonce: '#C9688A', veine: '#C9688A', coeur: 'hibiscus', force: 4, decal: 36 })],
    ['aq-marguerite', 'Marguerite rose', fleur('aqf5', { n: 20, L: 42, w: 5.5, forme: 'fin', centre: '#F29BB6', milieu: '#F7C0D0', bout: '#FFE6EE', fonce: '#D27494', coeur: 'marguerite', force: 1.6 })],
    ['aq-marguerite2', 'Marguerite blanche', fleur('aqf6', { n: 18, L: 42, w: 6, forme: 'fin', centre: '#F7DCE4', milieu: '#FFF5F8', bout: '#FFFFFF', fonce: '#D8A3B4', coeur: 'marguerite', force: 1.6 })],
    ['aq-sakura', 'Fleur de cerisier', fleur('aqf7', { n: 5, L: 38, w: 18, forme: 'encoche', centre: '#F07FA2', milieu: '#F9C5D4', bout: '#FFF0F4', fonce: '#D1668A', coeur: 'sakura' })],
    ['aq-rose', 'Rose', fleur('aqf8', { couches: [[5, 42, 24, 'rond', 0], [5, 32, 19, 'rond', 36], [5, 22, 14, 'rond', 10], [4, 13, 9, 'rond', 50]], L: 42, centre: '#C93F69', milieu: '#EC8CAB', bout: '#F9D0DC', fonce: '#A82E55', coeur: 'rose', force: 3 })],
    ['aq-rose-pale', 'Rose pâle', fleur('aqf9', { couches: [[5, 42, 24, 'rond', 0], [5, 32, 19, 'rond', 36], [5, 22, 14, 'rond', 10], [4, 13, 9, 'rond', 50]], L: 42, centre: '#E58AA7', milieu: '#F8C8D6', bout: '#FFF0F4', fonce: '#C46B8A', coeur: 'rose', force: 3 })],
    ['aq-papillon', 'Papillon rose', papillon('aqp1', '#FFE3EC', '#F4A6BF', '#D16A8C')],
    ['aq-papillon2', 'Papillon lilas', papillon('aqp2', '#FBEFFF', '#DDBDF2', '#A47BC4')],
    ['aq-cerises', 'Cerises au nœud', objets.cerises('aqo1')],
    ['aq-bisou', 'Bisou', objets.bisou('aqo2')],
    ['aq-photo', 'Appareil photo', objets.photo('aqo3')],
    ['aq-livres', 'Pile de livres', objets.livres('aqo4')],
    ['aq-lettre', 'Lettre d’amour', objets.lettre('aqo5')],
    ['aq-coquillage', 'Coquillage', objets.coquillage('aqo6')],
    ['aq-lune', 'Lune rose', objets.lune('aqo7')],
    ['aq-macaron', 'Macaron rose', objets.macaron('aqo8', '#F6B3C7', '#D97C9A')],
    ['aq-macaron2', 'Macaron lilas', objets.macaron('aqo9', '#DCC2F0', '#A77FC8')],
    ['aq-parfum', 'Parfum', objets.parfum('aqo10')],
    ['aq-the', 'Tasse de thé', objets.the('aqo11')],
    ['aq-cupcake', 'Cupcake', objets.cupcake('aqo12')],
    ['aq-fraise', 'Fraise', objets.fraise('aqo13')],
    ['aq-perles', 'Collier de perles', objets.perles('aqo14')],
    ['aq-coeur', 'Cœur rose', coeur('aqc1', '#FFE3EC', '#F48FB1', '#D45A86')],
    ['aq-coeur-rouge', 'Cœur rouge', coeur('aqc2', '#FFB3C1', '#E8506F', '#B02648')],
    ['aq-coeur-lilas', 'Cœur lilas', coeur('aqc3', '#F6ECFF', '#D3B2EE', '#9D74C2')],
    ['aq-3coeurs', 'Trois cœurs', troisCoeurs('aqc4', '#F7B6C9', '#F48FB1', '#FAD0DC')],
    ['aq-etoile', 'Étoile rose', etoile('aqe1', '#F8B4C8', '#E4789B')],
    ['aq-etoile2', 'Étoile poudrée', etoile('aqe2', '#FCD9E3', '#EFA3BA')],
    ['aq-etoile3', 'Étoile dorée', etoile('aqe3', '#FFE8A3', '#E6B84A')],
    ['aq-mot-love', 'love', etiquette('aqm1', 'love', '#FDE3EA', '#C2406A')],
    ['aq-mot-moi', 'moi', etiquette('aqm2', 'self love', '#FBEFFF', '#8E5BB5')],
    ['aq-mot-today', 'today', etiquette('aqm3', 'aujourd’hui', '#FFF1E8', '#C2410C')],
    ['aq-mot-souvenir', 'souvenir', etiquette('aqm4', 'souvenir', '#FDE3EA', '#B23A62')],
    ['aq-mot-bisous', 'bisous', etiquette('aqm5', 'bisous', '#FFE3EC', '#D45A86')],
    ['aq-mot-girl', 'girl power', etiquette('aqm6', 'girl power', '#FCE4EC', '#AD1457')]
  ];

  (window.STICKERS || []).forEach((s) => { if (!s.cat) s.cat = 'Mignons'; });
  window.STICKERS = A.map(([id, nom, svg]) => ({ id, nom, svg, cat: 'Aquarelle' })).concat(window.STICKERS || []);
})();
