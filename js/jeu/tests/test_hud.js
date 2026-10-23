// =====================================================================
//  LES TESTS DU LOT L-G — LE HUD (23/10 ; spec § 5.5.10, critères 1 à 16, et le critère « À F2 »)
// =====================================================================
// Importés à la demande sous ?test=1 (`&rapport=1&lot=L-G`). Le HUD se nourrit d'un `partie.hud` FABRIQUÉ autant que des
// parties d'essai : la plupart des tests lancent une partie (essai, équipes, prop hunt), COUPENT son image (Partie.image
// remplacée le temps du test : plus rien n'écrit le HUD que le test) et appellent eux-mêmes `maj(dt, état)`, puis lisent le
// DOM dans la même tâche (getComputedStyle, permis ici : c'est le test qui lit, pas le HUD). Le critère 1 fait au contraire
// tourner de VRAIES images (game.frame à la main, 7 bots qui se battent) sous un MutationObserver et des espions de
// lecture de mise en page.
import { REGLAGES_HUD, TEXTES, tailleCarte, echelleArcs, angleEcran } from '../hud_jeu.js';
import { CARTE } from '../minicarte.js';
import { PROVOCATIONS } from '../sons_prop.js';
import { NIVEAUX } from '../constantes.js';

const r2 = (x) => Math.round(x * 100) / 100;
const egalA = (a, b, e) => Math.abs(a - b) <= e;
// la translation d'une transformation calculée (« matrix(a, b, c, d, tx, ty) ») et son échelle
function matrice(el) {
  const t = getComputedStyle(el).transform;
  if (!t || t === 'none') return { a: 1, tx: 0, ty: 0 };
  const m = t.match(/matrix\(([^)]+)\)/); if (!m) return { a: 1, tx: 0, ty: 0 };
  const v = m[1].split(',').map(Number);
  return { a: Math.hypot(v[0], v[1]), tx: v[4], ty: v[5] };
}
const varDe = (el, n) => parseFloat(el.style.getPropertyValue('--' + n));
const opacite = (el) => parseFloat(getComputedStyle(el).opacity);
const visible = (el) => !!el && !el.hidden && getComputedStyle(el).display !== 'none';
// le compte rendu d'un test : [libellé, vrai/faux]…
const bilan = (res, attendu) => {
  const ko = res.filter((x) => !x[1]).map((x) => x[0]);
  return { ok: ko.length === 0, attendu, obtenu: ko.length ? 'faux : ' + ko.join(' | ') : res.map((x) => x[0]).join(' · ') };
};

export default function (jeu) {
  const game = window.__game;
  const T = (nom, fn, opts) => jeu.ajouterTest('L-G', nom, fn, opts);
  // une partie lancée, son image coupée : le test seul écrit le HUD (rendu à la fin par `rendre`)
  const lancer = async (mode, opts) => {
    await jeu.lancer(mode, opts);
    const p = game.partie, img = p.image;
    p.image = () => {};
    game.paused = true;
    return { p, A: p.aff, rendre: () => { p.image = img; game.paused = false; } };
  };
  // l'état du HUD d'une partie, pris à l'instant (cloné) et retouché
  const etat = (p, retouche = {}) => { p.majHud(); return { ...p.hud, ...retouche }; };

  // 1. ≤ 2 ÉCRITURES DOM PAR IMAGE EN MOYENNE (300 images de manche, 7 bots), 0 LECTURE DE MISE EN PAGE DANS maj
  T('01 écritures DOM par image, lectures de mise en page', async (t) => {
    await jeu.lancer('equipes', { zone: 'ss', allies: 3, ennemis: 4, graine: 11 });
    const p = game.partie, A = p.aff;
    jeu.avancer(6.2);                                           // présentation et décompte passés : la manche
    game.paused = false;
    for (let i = 0; i < 20; i++) game.frame(1 / 60);
    // les espions : lectures de mise en page pendant les maj du HUD
    let dans = false, lectures = 0; const rendre = [];
    const esper = (o, nom, getter) => {
      const d = Object.getOwnPropertyDescriptor(o, nom); if (!d) return;
      if (getter) Object.defineProperty(o, nom, { ...d, get() { if (dans) lectures++; return d.get.call(this); } });
      else Object.defineProperty(o, nom, { ...d, value: function (...a) { if (dans) lectures++; return d.value.apply(this, a); } });
      rendre.push(() => Object.defineProperty(o, nom, d));
    };
    esper(Element.prototype, 'getBoundingClientRect'); esper(Element.prototype, 'getClientRects');
    for (const k of ['offsetWidth', 'offsetHeight', 'offsetTop', 'offsetLeft', 'offsetParent']) esper(HTMLElement.prototype, k, true);
    for (const k of ['clientWidth', 'clientHeight', 'scrollWidth', 'scrollHeight']) esper(Element.prototype, k, true);
    const gcs = window.getComputedStyle; window.getComputedStyle = function (...a) { if (dans) lectures++; return gcs.apply(this, a); };
    rendre.push(() => { window.getComputedStyle = gcs; });
    for (const m of [A.hud, A.hudProp, A.tableau, A.minicarte]) {
      const f = m.maj; m.maj = function (...a) { dans = true; try { return f.apply(this, a); } finally { dans = false; } };
      rendre.push(() => { delete m.maj; });
    }
    const mo = new MutationObserver(() => {});
    mo.observe(document.getElementById('hud'), { subtree: true, attributes: true, childList: true, characterData: true });
    const tirs0 = jeu.compteurs().tirs;
    let records = 0, msHud = 0;
    // (le temps des quatre maj, noté : le HUD dans le budget du gameplay, § 3.10)
    const chrono = [];
    for (const m of [A.hud, A.hudProp, A.tableau, A.minicarte]) {
      const f = m.maj; m.maj = function (...a) { const t1 = performance.now(); try { return f.apply(this, a); } finally { msHud += performance.now() - t1; } };
      chrono.push(() => { m.maj = f; });
    }
    try {
      // 300 images : Haythem tourne la tête (la mini-carte tourne, les chevrons glissent) et tire une seconde
      jeu.commande(0, { tir: true }, 1.0);
      for (let i = 0; i < 300; i++) { game.camYaw += 0.012; game.frame(1 / 60); records += mo.takeRecords().length; }
    } finally { mo.disconnect(); for (const r of chrono) r(); for (const r of rendre) r(); }
    t.note('L-G maj du HUD par image (ms)', r2(msHud / 300));
    const parImage = records / 300, tirs = jeu.compteurs().tirs - tirs0;
    t.note('L-G écritures par image', r2(parImage));
    const res = [[`${r2(parImage)} écriture(s) DOM par image (≤ 2)`, parImage <= 2], [`HUD ${r2(msHud / 300)} ms par image`, true], [`${lectures} lecture(s) de mise en page dans maj (0)`, lectures === 0],
      [`${tirs} tirs pendant la mesure (une manche qui se bat)`, tirs >= 10], [`phase ${p.phase}`, p.phase === 'manche']];
    return bilan(res, '≤ 2 écritures DOM par image en moyenne sur 300 images de manche à 7 bots ; 0 lecture de mise en page dans maj');
  }, { delai: 120 });

  // 2. LE RÉTICULE : écart = 4 px + tan(s) / tan(champV/2) × H/2 (± 1 px), caché en visée, bleu sur un allié, rouge sur un ennemi
  T('02 réticule : écart vrai, visée, allié, ennemi', async () => {
    const { p, A, rendre } = await lancer('essai', { graine: 42, mannequins: 1, bots: 1 });
    const res = [];
    try {
      const V = A.hud.eViseur, d = V.querySelector('.d'), h = V.querySelector('.h');
      const champV = p.vue.champV, H = innerHeight;
      for (const s of [0, 0.01, 0.025, 0.05, 0.1]) {
        A.hud.maj(0, etat(p, { dispersion: s, visee: 0 }));
        const attendu = REGLAGES_HUD.reticule.base + Math.tan(s) / Math.tan(champV / 2 * Math.PI / 180) * H / 2;
        const ecart = matrice(d).tx, ecartH = -matrice(h).ty - REGLAGES_HUD.reticule.trait;
        res.push([`s ${s} : ${r2(ecart)} px pour ${r2(attendu)}`, egalA(ecart, attendu, 1) && egalA(ecartH, attendu, 1)]);
      }
      A.hud.maj(0, etat(p, { visee: 1 }));
      res.push(['caché en visée', opacite(V) === 0]);
      // un ennemi (le mannequin, à sa place dans la salle d'attente, devant le départ), puis un allié (le bot de l'équipe A)
      // posé à la même place, le mannequin écarté
      const L = p.local, e = p.acteurParId(1), al = p.acteurs.find((a) => a.equipe === 'A' && !a.local);
      al.cerveau = null;
      const place = { x: e.pos.x, y: e.pos.y, z: e.pos.z };
      const loin = (a) => jeu.teleporter(a.id, L.pos.x + 40, L.pos.y, L.pos.z + 40);
      for (const [cible, autre, nom, coul] of [[e, al, 'ennemi', 'rgb(255, 59, 48)'], [al, e, 'allié', 'rgb(61, 139, 255)']]) {
        loin(autre); jeu.teleporter(cible.id, place.x, place.y, place.z); jeu.viser(0, cible.id);
        p.camera(0, true); game.camera.updateMatrixWorld();
        A.hud.maj(0, etat(p, { visee: 0, dispersion: 0 }));
        const c = getComputedStyle(V).color;
        res.push([`${nom} visé : ${c}, plaque « ${A.hud.ePlaque.textContent} »`, c === coul && A.hud.ePlaque.textContent === String(cible.nom).toUpperCase() && varDe(A.hud.el, 'plo') === 1]);
      }
    } finally { rendre(); }
    return bilan(res, 'écart à ± 1 px pour 5 dispersions ; caché en visée ; rouge sur un ennemi, bleu sur un allié (et son nom)');
  });

  // 3. LES MARQUEURS : touche dans la même image, 0,12 s ; tête plus grand ; élimination X rouge 0,22 s × 1,15, « +100 » 1,5 s empilés
  T('03 marqueurs de touche, de tête, d’élimination ; « +100 » empilés', async () => {
    const { p, A, rendre } = await lancer('essai', { graine: 42, mannequins: 3 });
    const res = [], R = A.hud.el, H = etat(p);
    const touche = (tete) => p.evt('touche', { par: 0, cible: 1, zone: tete ? 'tete' : 'torse', degats: 30, x: 0, y: 0, z: 0, tete, dx: 0, dz: -1 });
    const elim = (id) => p.evt('elim', { par: 0, cible: id, arme: 'fa24', tete: false, x: 0, y: 0, z: 0, ix: 0, iy: 0, iz: -1, assists: [] });
    try {
      A.hud.maj(0.5, H);
      touche(false); A.hud.maj(0, H);
      const k0 = varDe(R, 'mk');
      res.push(['touche → marqueur dans la même image', varDe(R, 'mo') === 1 && R.style.getPropertyValue('--mc').trim() === '#ffffff']);
      A.hud.maj(0.06, H); const o6 = varDe(R, 'mo');
      A.hud.maj(0.065, H);
      res.push([`0,12 s : encore ${o6} à 0,06 s, ${varDe(R, 'mo')} à 0,125 s`, o6 > 0 && varDe(R, 'mo') === 0]);
      touche(true); A.hud.maj(0, H);
      res.push([`tête : × ${r2(varDe(R, 'mk') / k0)}`, varDe(R, 'mk') > k0 * 1.2]);
      // (les plombs d'un même coup, l'un à la tête : un marqueur de tête)
      A.hud.maj(0.5, H); touche(true); touche(false); A.hud.maj(0, H);
      res.push([`plombs du même coup, l’un à la tête : × ${r2(varDe(R, 'mk') / k0)}`, varDe(R, 'mk') > k0 * 1.2]);
      A.hud.maj(0.5, H);
      elim(1); A.hud.maj(0, H);
      res.push([`élimination : rouge, × ${varDe(R, 'mk')}`, R.style.getPropertyValue('--mc').trim() === REGLAGES_HUD.marqueur.rouge && varDe(R, 'mk') >= 1.15]);
      A.hud.maj(0.2, H); const oe = varDe(R, 'mo'); A.hud.maj(0.03, H);
      res.push([`0,22 s : ${oe} à 0,2 s, ${varDe(R, 'mo')} à 0,23 s`, oe > 0 && varDe(R, 'mo') === 0]);
      const ligne = () => A.hud.eXp.map((e, s) => ({ e, s, t: e.textContent, o: varDe(R, 'x' + s + 'o'), y: varDe(R, 'x' + s + 'y') })).filter((x) => x.o > 0);
      const L1 = ligne();
      res.push([`« ${L1.map((x) => x.t).join(' / ')} »`, L1.length === 1 && /^\+100/.test(L1[0].t)]);
      A.hud.maj(0.1, H); elim(2); A.hud.maj(0.1, H); elim(3); A.hud.maj(0, H);
      const L3 = ligne(), ys = L3.map((x) => x.y).sort((a, b) => a - b);
      res.push([`3 « +100 » empilés (y ${ys.join(', ')})`, L3.length === 3 && new Set(ys).size === 3 && ys[2] === 0]);
      A.hud.maj(1.5 - 0.43 - 0.02, H);
      const reste = ligne().length;
      A.hud.maj(0.05, H);
      res.push([`1,5 s : le 1er encore là à 1,48 s, parti à 1,53 s (${reste} → ${ligne().length})`, reste === 3 && ligne().length === 2]);
    } finally { rendre(); }
    return bilan(res, 'marqueur dans la même image, 0,12 s ; tête plus grand ; X rouge 0,22 s × 1,15 ; « +100 » 1,5 s, empilés');
  });

  // 4. LE FIL (5 lignes, 5 s), LES ARCS (30° à 120 px vers le tireur, ± 5°, 8 directions, 1,6 s), LA VIGNETTE
  T('04 fil, arcs vers le tireur, vignette', async () => {
    const { p, A, rendre } = await lancer('essai', { graine: 42, mannequins: 3 });
    const res = [], R = A.hud.el, H = etat(p);
    try {
      for (let i = 0; i < 7; i++) { p.evt('elim', { par: 1 + (i % 3), cible: 1 + ((i + 1) % 3), arme: 'pm9', tete: i % 2 === 0, x: 0, y: 0, z: 0, ix: 0, iy: 0, iz: 1, assists: [] }); A.hud.maj(0.05, H); }
      const lignes = () => A.hud.eFil.filter((e, s) => varDe(R, 'f' + s + 'o') > 0).length;
      res.push([`fil : ${lignes()} lignes après 7 éliminations`, lignes() === REGLAGES_HUD.fil.lignes]);
      res.push(['silhouette SVG de l’arme', !!A.hud.eFil.some((e) => e.querySelector('svg.hj-arme path'))]);
      A.hud.maj(5.05, H);
      res.push([`fil : 5 s → ${lignes()} ligne`, lignes() === 0]);
      // 8 directions : le tir vient de l'angle θ (à l'écran, sens horaire depuis devant) ; la balle va donc vers −source
      const l = game.camYaw, f = [-Math.sin(l), -Math.cos(l)], d = [Math.cos(l), -Math.sin(l)];
      let ok = 0; const vus = [];
      for (let k = 0; k < 8; k++) {
        const th = k * 45 * Math.PI / 180, sx = f[0] * Math.cos(th) + d[0] * Math.sin(th), sz = f[1] * Math.cos(th) + d[1] * Math.sin(th);
        A.hud._arcs.length = 0;
        p.evt('touche', { par: 1, cible: 0, zone: 'torse', degats: 30, x: 0, y: 0, z: 0, tete: false, dx: -sx, dz: -sz });
        A.hud.maj(0, H);
        const r = varDe(R, 'd0r'), e = Math.abs(((r - k * 45) % 360 + 540) % 360 - 180);
        vus.push(Math.round(r)); if (e <= 5) ok++;
      }
      res.push([`arcs vers le tireur : ${ok}/8 à ± 5° (${vus.join(', ')})`, ok === 8]);
      const arc = A.hud.eArcs[0], path = arc.querySelector('path').getAttribute('d');
      res.push([`arc de 30° à 120 px (échelle ${echelleArcs()})`, /A120 120/.test(path) && REGLAGES_HUD.degats.arc === 30 && REGLAGES_HUD.degats.rayon === 120
        && egalA(Math.hypot(31.06, 115.91), 120, 0.05) && egalA(2 * Math.asin(31.06 / 120) * 180 / Math.PI, 30, 0.1)]);
      A.hud.maj(1.55, H); const o155 = varDe(R, 'd0o'); A.hud.maj(0.06, H);
      res.push([`1,6 s : ${o155} à 1,55 s, ${varDe(R, 'd0o')} à 1,61 s`, o155 > 0 && varDe(R, 'd0o') === 0]);
      // la vignette
      for (const v of [100, 59, 45, 30, 10]) {
        A.hud.maj(0, etat(p, { vie: v, vieMax: 100 }));
        const att = v < 60 ? (1 - v / 60) * 0.85 : 0, o = varDe(R, 'vgo'), bat = A.hud.eVignette.classList.contains('bat');
        res.push([`vie ${v} : vignette ${o} (${r2(att)})${bat ? ', bat' : ''}`, egalA(o, att, 0.01) && bat === (v < 30)]);
      }
      const dur = getComputedStyle(A.hud.eVignette.firstChild).animationDuration;
      res.push([`battement ${dur} (1,2 Hz)`, egalA(parseFloat(dur), 1 / 1.2, 0.001)]);
    } finally { rendre(); }
    return bilan(res, '5 lignes, 5 s ; arcs à ± 5° sur 8 directions, 30° à 120 px, 1,6 s ; vignette (1 − vie/60) × 0,85 ± 0,01, battement 1,2 Hz sous 30');
  });

  // 5. MUNITIONS (bas droite, « R RECHARGER » sous 30 %), VIE seulement abîmée, CHRONO rouge sous 30 s
  T('05 munitions, vie, chrono', async () => {
    const { p, A, rendre } = await lancer('essai', { graine: 42, mannequins: 1 });
    const res = [], R = A.hud.el;
    try {
      const arme = (ch, res_ = 90, etatA = 'pret') => ({ id: 'fa24', nom: 'FA-24 « Faucon »', chargeur: ch, reserve: res_, etat: etatA, k: 0 });
      A.hud.maj(0, etat(p, { arme: arme(30) }));
      // (au doigt, à gauche de la grappe de tir : --tc-droite, posée par js/touch.js)
      const M = A.hud.eMun, b = M.getBoundingClientRect(), doigt = document.body.classList.contains('touch');
      const droite = doigt ? innerWidth - (parseFloat(document.body.style.getPropertyValue('--tc-droite')) || 0) - 8 : innerWidth;
      res.push([`munitions en bas à droite${doigt ? ', à gauche de la grappe de tir' : ''} (${Math.round(b.right)}, ${Math.round(b.bottom)} / ${innerWidth} × ${innerHeight})`,
        visible(M) && b.bottom > innerHeight * 0.7 && (doigt ? egalA(b.right, droite, 26) : b.right > innerWidth * 0.75)]);
      res.push([`« ${A.hud.eMunCh.textContent} / ${A.hud.eMunRes.textContent} »`, A.hud.eMunCh.textContent === '30' && A.hud.eMunRes.textContent === '90']);
      A.hud.maj(0, etat(p, { arme: arme(9) })); const a9 = A.hud.eMunAide.textContent;
      A.hud.maj(0, etat(p, { arme: arme(8) })); const a8 = A.hud.eMunAide.textContent;
      res.push([`30 % de 30 : à 9 « ${a9} », à 8 « ${a8} »`, a9 === '' && /RECHARGER$/.test(a8)]);
      A.hud.maj(0, etat(p, { arme: arme(0, 0) }));
      res.push([`à sec : « ${A.hud.eMunAide.textContent} »`, A.hud.eMunAide.textContent === 'PLUS DE MUNITIONS']);
      A.hud.maj(0, etat(p, { vie: 100, vieMax: 100 })); A.hud.maj(3, etat(p, { vie: 100, vieMax: 100 }));
      const pleine = varDe(R, 'pvo');
      A.hud.maj(0, etat(p, { vie: 70, vieMax: 100 }));
      res.push([`vie pleine cachée (${pleine}), abîmée montrée (${varDe(R, 'pvo')}, ${varDe(R, 'pvk')})`, pleine === 0 && varDe(R, 'pvo') === 1 && varDe(R, 'pvk') === 0.7]);
      A.hud.maj(0, etat(p, { vie: 100, vieMax: 100, armure: 50 }));
      res.push([`armure 50 : la barre montrée (${varDe(R, 'pvo')}), le liseré à ${varDe(R, 'pak')}`, varDe(R, 'pvo') === 1 && varDe(R, 'pak') === 0.5]);
      A.hud.maj(0, etat(p, { vie: 100, vieMax: 100, armure: 0 }));
      // (l'essai n'a pas de chrono : le test se fait passer pour un match)
      p.id = 'equipes';
      A.hud.maj(0, etat(p, { phase: 'manche', chrono: 31 })); const c31 = A.hud.eClock.classList.contains('low'), v31 = visible(A.hud.eClock);
      A.hud.maj(0, etat(p, { phase: 'manche', chrono: 29 })); const c29 = A.hud.eClock.classList.contains('low');
      const rouge = getComputedStyle(A.hud.eClock).color;
      p.id = 'essai';
      res.push([`chrono « ${A.hud.eClock.textContent} » rouge sous 30 s (31 : ${c31}, 29 : ${c29}, ${rouge})`, v31 && !c31 && c29 && (rouge === 'rgb(255, 59, 48)' || rouge === 'rgb(255, 77, 77)')]);
    } finally { rendre(); }
    return bilan(res, 'munitions bas droite, « R RECHARGER » sous 30 % du chargeur ; vie montrée seulement abîmée ; chrono rouge sous 30 s');
  });

  // 6. LA MINI-CARTE : 200 px (160 au doigt), 24 m de large ; ennemi montré 2 s après un tir ; chevrons d'un autre niveau ;
  //    preparer ≤ 50 ms, maj ≤ 0,1 ms
  T('06 mini-carte : taille, échelle, ennemis, autres niveaux, temps', async (t) => {
    const { p, A, rendre } = await lancer('essai', { graine: 42, mannequins: 2, bots: 1 });
    const res = [], M = A.minicarte, L = p.local;
    try {
      res.push([`200 px au PC (1280 × 720), 160 au doigt (812 × 375)`, tailleCarte(1280, 720, false) === 200 && tailleCarte(812, 375, true) === 160]);
      M.maj(0, p);
      const cv = M.cv, T0 = tailleCarte(innerWidth, innerHeight, document.body.classList.contains('touch'));
      res.push([`canevas de ${cv.style.width} (${T0} px pour cet écran)`, parseFloat(cv.style.width) === T0 && visible(M.el)]);
      // un allié à 6 m sur la droite de Haythem : à 6 × T / 24 px du centre, vers la droite (la carte tourne avec lui)
      const al = p.acteurs.find((a) => a.equipe === 'A' && !a.local); al.cerveau = null;
      const l = game.camYaw, rx = Math.cos(l), rz = -Math.sin(l);
      jeu.teleporter(al.id, L.pos.x + rx * 6, L.pos.y, L.pos.z + rz * 6);
      M.maj(0, p);
      const da = M.dessines.find((x) => x.id === al.id), m = M.taille / 2;
      res.push([`allié à 6 m à droite : (${da ? r2(da.sx - m) : '?'}, ${da ? r2(da.sy - m) : '?'}) px, attendu (${r2(6 * M.taille / CARTE.largeurM)}, 0)`,
        !!da && da.type === 'allie' && egalA(da.sx - m, 6 * M.taille / 24, 1) && egalA(da.sy - m, 0, 1) && CARTE.largeurM === 24]);
      // un autre niveau : ▲
      jeu.teleporter(al.id, L.pos.x + rx * 6, L.pos.y + 3.5, L.pos.z + rz * 6);
      M.maj(0, p);
      const dn = M.dessines.find((x) => x.id === al.id);
      res.push([`allié à l’étage du dessus : ${dn ? dn.type + (dn.haut ? ' ▲' : ' ▼') : 'rien'}`, !!dn && dn.type === 'autreNiveau' && dn.haut === true]);
      // l'ennemi : montré 2 s après un tir, puis plus
      const e = p.acteurParId(1);
      M.maj(0, p);
      const avant = M.dessines.some((x) => x.id === e.id);
      p.evt('tir', { a: e.id, arme: 'fa24', ox: e.pos.x, oy: e.pos.y + 1.6, oz: e.pos.z, dx: 0, dy: 0, dz: -1, n: 1, seq: 1 });
      M.maj(0.1, p); const pendant = M.dessines.some((x) => x.id === e.id && x.type === 'ennemi');
      M.maj(1.85, p); const a195 = M.dessines.some((x) => x.id === e.id);
      M.maj(0.1, p); const apres = M.dessines.some((x) => x.id === e.id);
      res.push([`ennemi : avant ${avant}, après le tir ${pendant}, à 1,95 s ${a195}, à 2,05 s ${apres}`, !avant && pendant && a195 && !apres]);
      // les temps
      const nav = p.nav, t0 = performance.now();
      if (nav && nav.nb > 0) M._depuisNoeuds(nav); else M._depuisPieces();
      const prep = performance.now() - t0;
      // (maj : la moyenne de 300 appels — une seule mesure serait sous la résolution de l'horloge)
      const t1 = performance.now(); for (let i = 0; i < 300; i++) M.maj(1 / 60, p);
      const mj = (performance.now() - t1) / 300;
      res.push([`preparer ${r2(prep)} ms (${M.source}), maj ${Math.round(mj * 1000)} µs`, t.temps('L-G minicarte preparer', prep, 50) && t.temps('L-G minicarte maj', mj, 0.1)]);
    } finally { rendre(); }
    return bilan(res, '200 px (160 au doigt), 24 m ; allié à sa place, ▲ à l’étage ; ennemi 2 s après un tir ; preparer ≤ 50 ms, maj ≤ 0,1 ms');
  });

  // 7. LE TABLEAU : montré tant que `scores` est tenu ; colonnes du combat (deux équipes) et du prop hunt
  T('07 tableau des scores : combat, prop hunt', async () => {
    const res = [];
    let { p, A, rendre } = await lancer('equipes', { zone: 'ss', allies: 3, ennemis: 4, graine: 5 });
    try {
      p.majHud();
      A.tableau.maj(p, false); const cache0 = !visible(A.tableau.el);
      A.tableau.maj(p, true); const montre = visible(A.tableau.el);
      const ent = [...A.tableau.el.querySelectorAll('.ts-col:not([hidden]) .ts-entete')].map((e) => e.textContent);
      const deux = A.tableau.eCorps.classList.contains('deux') && ent.length === 2;
      const cols = ['SCORE', 'É', 'M', 'A', 'RATIO', 'SÉRIE'].every((c) => ent[0] && ent[0].includes(c));
      const lignes = A.tableau.el.querySelectorAll('.ts-ligne').length;
      const ph = A.tableau.el.querySelector('.ts-portrait'), lp = ph ? parseFloat(getComputedStyle(ph).width) : 0;
      // (relecture 23/10) l'en-tête aligné sur les lignes : chaque titre au-dessus de sa colonne, le nom de l'équipe au-dessus des noms
      const c0 = A.tableau.el.querySelector('.ts-col:not([hidden])'), hT = [...c0.querySelectorAll('.ts-entete .ts-c')], l0 = c0.querySelector('.ts-ligne');
      const vT = l0 ? [...l0.querySelectorAll('.ts-v')] : [], mil = (e) => { const b = e.getBoundingClientRect(); return (b.left + b.right) / 2; };
      const aligne = hT.length === 6 && vT.length === 6 && hT.every((h, k) => egalA(mil(h), mil(vT[k]), 1))
        && egalA(c0.querySelector('.ts-entete .ts-nom').getBoundingClientRect().left, l0.querySelector('.ts-nom').getBoundingClientRect().left, 1);
      const attendu = matchMedia('(max-width: 760px)').matches ? 24 : matchMedia('(max-width: 900px), (max-height: 520px)').matches ? 28 : 32;
      A.tableau.maj(p, false); const cache1 = !visible(A.tableau.el);
      res.push([`caché, tenu → montré, relâché → caché`, cache0 && montre && cache1]);
      res.push([`deux colonnes d’équipe (${ent.map((e) => e.split('SCORE')[0]).join(' | ')})`, deux]);
      res.push(['colonnes rang, portrait, nom, score, É, M, A, ratio, série', cols && !!A.tableau.el.querySelector('.ts-ligne .ts-rg') && !!A.tableau.el.querySelector('.ts-ligne .ts-nom')]);
      res.push([`en-tête aligné sur les colonnes : ${aligne}`, aligne]);
      res.push([`${lignes} lignes pour ${p.hud.classement.length} acteurs ; portrait ${lp} px (${attendu} sur cet écran, 32 au PC)`, lignes === p.hud.classement.length && egalA(lp, attendu, 0.5)]);
      // (relecture 23/10) depuis la pause (« Tableau des scores ») : au-dessus de l'écran de pause, refermé par un clic, et
      // refermé quand la pause se ferme
      const el = A.tableau.el, zOv = parseInt(getComputedStyle(document.getElementById('overlay')).zIndex, 10) || 30;
      A.tableau.basculer(p);
      const zP = parseInt(getComputedStyle(el).zIndex, 10), dessus = visible(el) && el.parentNode === document.body && zP > zOv;
      el.click(); const clic = !visible(el) && el.parentNode === document.getElementById('hud');
      A.tableau.basculer(p); game.paused = false; A.tableau.maj(p, false);
      const repris = !visible(el) && el.parentNode === document.getElementById('hud');
      game.paused = true;
      res.push([`pause : au-dessus de la pause (z ${zP} > ${zOv}) ${dessus}, fermé d’un clic ${clic}, fermé à la reprise ${repris}`, dessus && clic && repris]);
      rendre();
      ({ p, A, rendre } = await lancer('prophunt', { zone: 'e1', graine: 3 }));
      p.majHud(); A.tableau.maj(p, true);
      const entP = [...A.tableau.el.querySelectorAll('.ts-col:not([hidden]) .ts-entete')].map((e) => e.textContent);
      res.push([`prop hunt : ${entP[0] || '?'}`, entP.length === 1 && ['RÔLE', 'POINTS', 'TROUVÉS', 'SURVIE', 'PROVOC', 'VRAIS MEUBLES'].every((c) => entP[0].includes(c))]);
      A.tableau.maj(p, false);
    } finally { rendre(); }
    return bilan(res, 'montré tant que Tab est tenu ; combat : deux équipes, rang · portrait 32 px · nom · score · É · M · A · ratio · série ; prop hunt : rôle, points, trouvés, survie, provocations, vrais meubles ; depuis la pause : au-dessus d’elle, fermé par un clic et à la reprise');
  });

  // 8. LE HUD DU PROP HUNT : forme, ●●○, 🔒 / ❄, étoiles, « REPÉRÉ ! », ≤ 4 étiquettes, panneau de cachette noir, roue
  T('08 HUD prop : forme, jauges, étiquettes, panneau de cachette, roue', async () => {
    const { p, A, rendre } = await lancer('prophunt', { zone: 'e1', premierRole: 'prop', graine: 3 });
    const res = [], P = A.hudProp, wheel0 = game.wheel.isOpen;
    try {
      const base = { forme: 'tolix', nomForme: 'le tabouret vert', changements: 1, verrou: true, fige: false, provocT: 12, provocMax: 40, discretion: 0.5, oeil: 0,
        scanner: { charges: 3, t: 0 }, propsRestants: 3, chasseursRestants: 2, role: 'prop', roue: { ouverte: false, choix: -1 }, cachette: null };
      const H = (prop, plus = {}) => etat(p, { phase: 'traque', ...plus, prop: { ...base, ...prop } });
      P.maj(0, H({}));
      res.push([`forme « ${P.eNom.textContent} », ${P.eChg.textContent}`, P.eNom.textContent === 'LE TABOURET VERT' && P.eChg.textContent === '●●○']);
      res.push(['🔒 allumé, ❄ éteint', P.eVerrou.classList.contains('on') && !P.eFige.classList.contains('on')]);
      P.maj(0, H({ verrou: false, fige: true }));
      res.push(['🔒 éteint, ❄ allumé', !P.eVerrou.classList.contains('on') && P.eFige.classList.contains('on')]);
      let etoiles = true; const vus = [];
      for (const d of [0, 0.19, 0.2, 0.21, 0.5, 0.81, 1]) { P.maj(0, H({ discretion: d })); const n = (P.eDisc.lastChild.textContent.match(/★/g) || []).length; vus.push(n); if (n !== Math.ceil(d * 5)) etoiles = false; }
      res.push([`étoiles = ⌈discrétion × 5⌉ (${vus.join(' ')})`, etoiles]);
      P.maj(0, H({ oeil: 0.69 })); const o69 = P.eOeil.classList.contains('repere');
      P.maj(0, H({ oeil: 0.71 })); const o71 = P.eOeil.classList.contains('repere');
      res.push([`« REPÉRÉ ! » au-delà de 70 % (0,69 : ${o69}, 0,71 : ${o71})`, !o69 && o71]);
      // ≤ 4 étiquettes d'alliés (6 donnés, tous devant)
      const L = p.local, l = game.camYaw, cam = game.camera;
      p.camera(0, true); cam.updateMatrixWorld();
      const allies = [0, 1, 2, 3, 4, 5].map((k) => ({ id: 90 + k, nom: 'Allié ' + k, x: L.pos.x - Math.sin(l) * (4 + k) + Math.cos(l) * (k - 2.5) * 0.6, y: L.pos.y + 1.5, z: L.pos.z - Math.cos(l) * (4 + k) - Math.sin(l) * (k - 2.5) * 0.6 }));
      P.maj(0, H({}, { allies }));
      res.push([`${P.etiquettes} étiquettes pour 6 alliés`, P.etiquettes > 0 && P.etiquettes <= 4]);
      // le panneau de cachette (Haythem chasseur) : noir, au-dessus du HUD, pas fx.flash
      const flash0 = game.fx.flash;
      const roles = p.acteurs.map((a) => ({ id: a.id, nom: a.nom, role: a.role, vivant: a.vivant }));
      P.maj(0, H({ role: 'chasseur', cachette: { chrono: 24.2, roles, astuces: ['Astuce un.', 'Astuce deux.', 'Astuce trois.'] } }, { phase: 'cachette', phaseDuree: 35 }));
      const V = document.getElementById('voile-cachette'), cs = getComputedStyle(V);
      res.push([`#voile-cachette : ${cs.backgroundColor}, z-index ${cs.zIndex}, « ${P.eVcChrono.textContent} »`, visible(V) && cs.backgroundColor === 'rgb(0, 0, 0)' && cs.zIndex === '12'
        && P.eVcChrono.textContent === '0:25' && game.fx.flash === flash0]);
      res.push([`rôles (${P.eVcRoles.querySelectorAll('p').length}), astuces « ${P.eVcA.map((e) => e.textContent).join(' / ')} »`,
        P.eVcRoles.querySelectorAll('p').length === roles.length && P.eVcA.every((e) => e.textContent)]);
      res.push([`mini-carte de la zone : ${JSON.stringify(P.zoneDessin)}`, !!P.zoneDessin && P.zoneDessin.acteurs === 0 && P.zoneDessin.pieces >= 5]);
      P.maj(0, H({ cachette: null }));
      res.push(['panneau retiré quand la cachette finit', !visible(V)]);
      // la roue : 8 secteurs, le choix en surbrillance dans la MÊME image, cachée fermée
      const Ro = P.roue; let bon = 0;
      for (let k = 0; k < 8; k++) { P.maj(0, H({ roue: { ouverte: true, choix: k } })); const on = Ro.secteurs.findIndex((s) => s.classList.contains('on')); if (on === k && visible(Ro.el)) bon++; }
      res.push([`roue : ${Ro.secteurs.length} secteurs, ${bon}/8 choix en surbrillance dans la même image`, Ro.secteurs.length === 8 && bon === 8 && Ro.secteurs[5].textContent.includes(PROVOCATIONS[5].label)]);
      P.maj(0, H({ roue: { ouverte: false, choix: 3 } }));
      res.push(['roue fermée → cachée ; game.wheel jamais ouverte', !visible(Ro.el) && !game.wheel.isOpen && !wheel0]);
      // (relecture 23/10) le scanner : un arc devant, sa bande écrite dessus (« 4-8 m », § 2.8)
      p.evt('scanner', { a: L.id, resultats: [{ dir: game.camYaw, bande: 1 }] });
      P.maj(0, H({ role: 'chasseur', scanner: { charges: 2, t: 8 } }));
      const sc = P.eScans[0];
      res.push([`scanner : arc à ${varDe(P.el, 's0r')}°, « ${sc.lastChild.textContent} »`, varDe(P.el, 's0o') > 0 && varDe(P.el, 's0r') === 0 && sc.lastChild.textContent === '4-8 m' && sc.classList.contains('b1')]);
    } finally { rendre(); }
    return bilan(res, 'nom de forme, ●●○, 🔒 / ❄, ⌈d × 5⌉ étoiles, REPÉRÉ > 70 %, ≤ 4 étiquettes ; panneau noir z 12 (chrono, rôles, carte sans acteur, astuces) ; roue : 8 secteurs, choix dans la même image');
  });

  // 9. LA DOMINATION : A, B, C en haut au centre, couleur du possesseur, progression de capture
  T('09 domination : A, B, C, possesseur, capture', async () => {
    const { p, A, rendre } = await lancer('essai', { graine: 42, mannequins: 1 });
    const res = [], R = A.hud.el;
    try {
      const L = p.local;
      const points = [{ id: 'A', x: L.pos.x + 30, y: 0, z: L.pos.z, r: 2.5, possesseur: 'A', capture: { equipe: null, k: 0 } },
        { id: 'B', x: L.pos.x - 30, y: -3.06, z: L.pos.z, r: 3, possesseur: 'B', capture: { equipe: null, k: 0 } },
        { id: 'C', x: L.pos.x, y: 3.5, z: L.pos.z - 30, r: 3, possesseur: null, capture: { equipe: 'A', k: 0.4 } }];
      A.hud.maj(0, etat(p, { points }));
      const D = A.hud.eDom, b = D.getBoundingClientRect(), P = A.hud.eDomP;
      res.push([`en haut au centre (${Math.round((b.left + b.right) / 2)} / ${innerWidth / 2}, haut ${Math.round(b.top)})`, visible(D) && egalA((b.left + b.right) / 2, innerWidth / 2, 4) && b.top < innerHeight * 0.3]);
      res.push([`lettres ${P.map((e) => e.textContent).join('')}`, P.map((e) => e.textContent).join('') === 'ABC']);
      const cB = getComputedStyle(P[1].querySelector('b')).color, cA = getComputedStyle(P[0].querySelector('b')).color;
      res.push([`couleurs : A ${cA}, B ${cB}`, cA === 'rgb(61, 139, 255)' && cB === 'rgb(255, 138, 31)']);
      res.push([`capture de C : ${varDe(R, 'p2k')} par les SISR`, varDe(R, 'p2k') === 0.4 && P[2].classList.contains('capA')]);
      A.hud.maj(0, etat(p, { points: points.map((q, i) => (i === 2 ? { ...q, capture: { equipe: 'A', k: 0.75 } } : q)) }));
      res.push([`la capture avance : ${varDe(R, 'p2k')}`, varDe(R, 'p2k') === 0.75]);
      A.hud.maj(0, etat(p, { points: [] }));
      res.push(['sans points : caché', !visible(D)]);
    } finally { rendre(); }
    return bilan(res, 'A, B, C en haut au centre, à la couleur du possesseur, avec leur capture en cours');
  });

  // 10. LA LUNETTE : le masque à visée ≥ 0,85 (TP-50), le réticule caché
  T('10 lunette du TP-50', async () => {
    const { p, A, rendre } = await lancer('essai', { graine: 42, mannequins: 1, classe: 'tireur' });
    const res = [];
    try {
      const arme = { id: 'tp50', nom: 'TP-50 « Héron »', chargeur: 5, reserve: 20, etat: 'pret', k: 0 };
      A.hud.maj(0, etat(p, { arme, visee: 0.84 })); const a84 = visible(A.hud.eLunette);
      A.hud.maj(0, etat(p, { arme, visee: 0.85 })); const a85 = visible(A.hud.eLunette), vo = opacite(A.hud.eViseur);
      A.hud.maj(0, etat(p, { arme: { ...arme, id: 'fa24' }, visee: 1 })); const fa = visible(A.hud.eLunette);
      res.push([`TP-50 : 0,84 → ${a84}, 0,85 → ${a85} (réticule ${vo}) ; FA-24 visée → ${fa}`, !a84 && a85 && vo === 0 && !fa]);
    } finally { rendre(); }
    return bilan(res, 'masque à ≥ 0,85 de visée (lunette seulement), réticule caché');
  });

  // 11. body.combat cache l'endurance, les touches, le badge, l'aide, la ligne des emotes ; en balade, le HUD = la référence
  T('11 body.combat ; HUD de la balade = référence', async () => {
    const res = [];
    await jeu.lancer('essai', { graine: 42, mannequins: 1 });
    for (let i = 0; i < 3; i++) game.frame(1 / 60);
    const sel = ['.stamina', '#hud-keys', '#phone-badge', '#hud-hint', '#hud-streak'];
    const caches = sel.filter((s) => { const e = document.querySelector(s); return e && getComputedStyle(e).display === 'none'; });
    res.push([`en partie, cachés : ${caches.join(' ')}`, caches.length === sel.length && document.body.classList.contains('combat')]);
    jeu.quitter('balade');
    for (let i = 0; i < 3; i++) game.frame(1 / 60);
    await jeu.chargerReference();
    const ref = jeu.reference[window.__chargement && window.__chargement.telephone ? 'tel' : 'pc'];
    const TC = window.__touch, doigt = TC ? TC.auDoigt : null, rendus = [];
    if (TC) { TC.auDoigt = true; for (const k in TC.el) { const e = TC.el[k]; if (e && e.hidden === false) { e.hidden = true; rendus.push(e); } } game.hud.setLobby(); }
    const emp = window.__rejeuBalade.empreinteHud();
    if (TC) { for (const e of rendus) e.hidden = false; TC.auDoigt = doigt; game.hud.setLobby(); }
    const st = document.querySelector('.stamina');
    res.push([`empreinte du HUD de la balade ${emp} (référence ${ref.hud})`, emp === ref.hud]);
    res.push(['en balade : sans body.combat, l’endurance visible, le HUD du jeu caché', !document.body.classList.contains('combat') && getComputedStyle(st).display !== 'none'
      && !visible(document.getElementById('hud-jeu')) && !visible(document.getElementById('hud-carte')) && !visible(document.getElementById('voile-flash'))]);
    return bilan(res, 'body.combat cache .stamina, #hud-keys, #phone-badge, #hud-hint, #hud-streak ; en balade, empreinte de #hud = référence');
  });

  // 12. 300 IMAGES AVEC UN ÉTAT VIDE OU TROUÉ : 0 exception
  T('12 état vide ou troué : 0 exception', async () => {
    const res = [];
    for (const mode of ['essai', 'prophunt']) {
      const { p, A, rendre } = await lancer(mode, mode === 'prophunt' ? { zone: 'e1', graine: 3 } : { graine: 42, mannequins: 2 });
      let erreurs = 0, premiere = '';
      const etats = [{}, { arme: null }, { arme: {} }, { prop: {} }, { prop: { roue: {}, cachette: {} } }, { points: [{}] }, { allies: [{}] }, { classement: [{}] },
        { mort: {} }, { aveugle: {} }, { scores: {} }, { vie: NaN }, { dispersion: Infinity }, { annonce: {} }, { prop: { cachette: { roles: [{}], astuces: [null] } } }];
      const hudAvant = p.hud;
      for (let i = 0; i < 300; i++) {
        const H = etats[i % etats.length];
        try { p.hud = H; A.hud.maj(1 / 60, H); A.hudProp.maj(1 / 60, H); A.tableau.maj(p, i % 7 === 0); A.minicarte.maj(1 / 60, p); }
        catch (e) { erreurs++; if (!premiere) premiere = String(e && e.stack || e).slice(0, 300); }
      }
      p.hud = hudAvant;
      rendre();
      res.push([`${mode} : ${erreurs} exception(s)${premiere ? ' — ' + premiere : ''}`, erreurs === 0]);
      jeu.quitter('balade');
    }
    return bilan(res, '300 images avec partie.hud = {} ou des champs manquants : 0 exception (HudJeu, HudProp, tableau, mini-carte)');
  });

  // 13. L'HABILLAGE : Airsoft (défaut) « TOUCHÉ », Militaire « ÉLIMINÉ » ; tous les textes en français
  T('13 habillage Airsoft / Militaire ; textes en français', async () => {
    const res = [];
    const s = game.settings.data;
    res.push([`défaut : ${s.jeu.habillage}`, s.jeu.habillage === 'airsoft']);
    const textes = [];
    for (const hab of ['airsoft', 'militaire']) {
      s.jeu.habillage = hab;
      const { p, A, rendre } = await lancer('essai', { graine: 42, mannequins: 3 });
      try {
        const H = etat(p);
        p.evt('elim', { par: 0, cible: 1, arme: 'fa24', tete: true, x: 0, y: 0, z: 0, ix: 0, iy: 0, iz: -1, assists: [] });
        A.hud.maj(0, H);
        const xp = A.hud.eXp.map((e) => e.textContent).join(' ');
        const L = p.local; L.vivant = false; L.vie = 0;
        p.evt('elim', { par: 2, cible: 0, arme: 'pm9', tete: false, x: 0, y: 0, z: 0, ix: 0, iy: 0, iz: 1, assists: [] });
        A.hud.maj(0.5, etat(p));
        const carte = A.hud.eMortT.textContent;
        const mot = TEXTES[hab];
        res.push([`${hab} : « ${xp.trim()} » ; « ${carte} »`, xp.includes('+100' + mot.elim) && carte.startsWith(mot.par)]);
        if (hab === 'airsoft') res.push(['Airsoft : jamais « ÉLIMIN »', !/ÉLIMIN/.test(xp + carte)]);
        else res.push(['Militaire : « ÉLIMINÉ PAR »', carte.startsWith('ÉLIMINÉ PAR')]);
        textes.push(document.getElementById('hud').innerText);
        L.vivant = true; L.vie = 100;
      } finally { rendre(); jeu.quitter('balade'); }
    }
    // la liste noire (aucun mot anglais du genre)
    const { p, A, rendre } = await lancer('prophunt', { zone: 'e1', graine: 3, premierRole: 'prop' });
    try {
      A.tableau.maj(p, true);
      A.hudProp.maj(0, etat(p, { phase: 'traque', prop: { ...(p.hud.prop || {}), roue: { ouverte: true, choix: 1 }, cachette: { chrono: 5, roles: [{ id: 0, nom: 'Haythem', role: 'prop', vivant: true }], astuces: ['x'] } } }));
      textes.push(document.getElementById('hud').innerText, document.getElementById('voile-cachette').innerText);
      A.tableau.maj(p, false);
    } finally { rendre(); }
    const noire = /\b(KILLS?|HEADSHOT|RELOAD(ING)?|AMMO|WINNER|VICTORY|DEFEAT|ROUND|HEALTH|PLAYERS?|SPECTATING|ELIMINATED|RESPAWN(ING)?|SCOREBOARD|DEATHS?|ASSISTS?|LOADING)\b/i;
    const fautes = textes.join('\n').match(noire);
    res.push([`liste noire : ${fautes ? fautes[0] : 'rien'}`, !fautes]);
    return bilan(res, 'Airsoft (défaut) : « TOUCHÉ », « TOUCHÉ PAR » ; Militaire : « ÉLIMINATION », « ÉLIMINÉ PAR » ; aucun texte anglais');
  });

  // 14. #voile-flash : t = 0 ; 2,3 ; 2,4 ; 2,7 ; 3,0 pour 3 s → 1 ; 1 ; 1 ; 0,5 ; 0 (± 0,02), en Basse aussi ; au-dessus du HUD, sous la pause
  T('14 #voile-flash : opacités, qualité Basse, z-index', async () => {
    const { p, A, rendre } = await lancer('essai', { graine: 42, mannequins: 1 });
    const res = [], V = document.getElementById('voile-flash'), fx = game.fx, en = fx.enabled;
    try {
      for (const basse of [false, true]) {
        fx.enabled = !basse;
        const vus = [];
        let ok = true;
        for (const [t, att] of [[0, 1], [2.3, 1], [2.4, 1], [2.7, 0.5], [3.0, 0]]) {
          A.hud.maj(0, etat(p, { aveugle: { t, duree: 3 } }));
          const o = visible(V) ? opacite(V) : 0; vus.push(r2(o));
          if (!egalA(o, att, 0.02)) ok = false;
        }
        res.push([`${basse ? 'Basse (fx.enabled faux)' : 'qualité courante'} : ${vus.join(' ; ')}`, ok]);
      }
      A.hud.maj(0, etat(p, { aveugle: null }));
      const z = (s) => parseInt(getComputedStyle(document.querySelector(s)).zIndex, 10);
      res.push([`z-index : HUD ${z('#hud')} < voile ${z('#voile-flash')} < pause ${z('#overlay')}`, z('#hud') < z('#voile-flash') && z('#voile-flash') < z('#overlay') && !visible(V)]);
    } finally { fx.enabled = en; rendre(); }
    return bilan(res, 'opacités 1 ; 1 ; 1 ; 0,5 ; 0 (± 0,02) aux deux qualités ; au-dessus du HUD, sous la pause');
  });

  // 15. LES CHEVRONS : 3 alliés (un derrière un mur, un derrière la caméra) → 2 montrés, à ± 2 px de leur projection ;
  //     14 px à 2 m, 8 px à 40 m ; aucun en chacun pour soi
  T('15 chevrons des alliés', async () => {
    const res = [];
    let { p, A, rendre } = await lancer('equipes', { zone: 'ecole', allies: 3, ennemis: 1, graine: 7 });
    try {
      p.camera(0, true); const cam = game.camera; cam.updateMatrixWorld();
      const o = cam.position, f = new (cam.position.constructor)(); cam.getWorldDirection(f);
      const pt = (d, lat = 0, dy = 0) => ({ x: o.x + f.x * d + f.z * lat, y: o.y + f.y * d + dy, z: o.z + f.z * d - f.x * lat });
      // (relecture 23/10 : le 2e allié est CHERCHÉ derrière un mur — un point de l'écran que la balistique ne voit pas —, au
      // lieu d'un point fixe qui pouvait être à vue)
      let p2 = null;
      for (const d of [25, 18, 30, 12, 35, 8]) { for (const lat of [-1.5, 1.5, -4, 4, 0, -7, 7]) { const q = pt(d, lat); if (!p.balistique.vue(o.x, o.y, o.z, q.x, q.y, q.z)) { p2 = q; break; } } if (p2) break; }
      const a1 = { id: 1, nom: 'Gabriel', ...pt(10, 1) }, a2 = { id: 2, nom: 'Imad', ...(p2 || pt(25, -1.5)) }, a3 = { id: 3, nom: 'Koji', ...pt(-8) };
      const libre = p.balistique.vue(o.x, o.y, o.z, a2.x, a2.y, a2.z);
      A.hud.maj(0, etat(p, { allies: [a1, a2, a3] }));
      res.push([`${A.hud.chevrons} chevrons montrés sur 3 (le 2e ${libre ? 'à vue' : 'derrière un mur'}, le 3e derrière la caméra)`, !libre && A.hud.chevrons === 2 && varDe(A.hud.el, 'c1o') === 1 && varDe(A.hud.el, 'c2o') === 0]);
      let place = true; const ec = [];
      for (const [s, a] of [[0, a1], [1, a2]]) {
        const v = new (cam.position.constructor)(a.x, a.y, a.z).project(cam), x = (v.x + 1) / 2 * innerWidth, y = (1 - v.y) / 2 * innerHeight;
        const m = matrice(A.hud.eChev[s]); ec.push(r2(Math.hypot(m.tx - x, m.ty - y)));
        if (Math.hypot(m.tx - x, m.ty - y) > 2) place = false;
      }
      res.push([`à ± 2 px de la projection (${ec.join(', ')} px)`, place]);
      A.hud.maj(0, etat(p, { allies: [{ id: 1, nom: 'Gabriel', ...pt(2) }, { id: 2, nom: 'Imad', ...pt(40) }] }));
      const k0 = matrice(A.hud.eChev[0]).a * 14, k1 = matrice(A.hud.eChev[1]).a * 14;
      res.push([`taille ${r2(k0)} px à 2 m, ${r2(k1)} px à 40 m`, egalA(k0, 14, 0.3) && egalA(k1, 8, 0.3)]);
      res.push([`nom à ≤ 15 m (2 m : ${varDe(A.hud.el, 'c0n')}, 40 m : ${varDe(A.hud.el, 'c1n')})`, varDe(A.hud.el, 'c0n') === 1 && varDe(A.hud.el, 'c1n') === 0]);
      rendre();
      ({ p, A, rendre } = await lancer('melee', { zone: 'ss', ennemis: 3, graine: 7 }));
      A.hud.maj(0, etat(p));
      res.push([`chacun pour soi : hud.allies ${p.hud.allies.length}, ${A.hud.chevrons} chevron`, p.hud.allies.length === 0 && A.hud.chevrons === 0]);
    } finally { rendre(); }
    return bilan(res, '2 chevrons sur 3 (derrière la caméra : caché ; derrière un mur : montré), ± 2 px ; 14 px à 2 m, 8 px à 40 m ; aucun en chacun pour soi');
  });

  // 16. LES ANNONCES : 20 de suite → 0 hud.feedback, 0 hoops-feedback, 0 lecture de mise en page ; chacune relancée
  T('16 annonces : à elles, relancées, sans feedback', async () => {
    const { p, A, rendre } = await lancer('essai', { graine: 42, mannequins: 1 });
    const res = [];
    let fb = 0, hoops = 0, lectures = 0, relancees = 0;
    const f0 = game.hud.feedback; game.hud.feedback = function (...a) { fb++; return f0.apply(this, a); };
    const ecoute = () => { hoops++; }; document.addEventListener('hoops-feedback', ecoute);
    const g0 = Element.prototype.getBoundingClientRect, gcs = window.getComputedStyle, ow = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
    Element.prototype.getBoundingClientRect = function () { lectures++; return g0.call(this); };
    window.getComputedStyle = function (...a) { lectures++; return gcs.apply(this, a); };
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { ...ow, get() { lectures++; return ow.get.call(this); } });
    try {
      for (let i = 0; i < 20; i++) {
        p.annonce('ANNONCE ' + i, i % 2 ? 'go' : 'info');
        A.hud.maj(0.6, etat(p));
        if (A.hud.eAnnonce.textContent === 'ANNONCE ' + i && A.hud._annonce && A.hud._annonce.t0 === A.hud.t) relancees++;
      }
    } finally {
      game.hud.feedback = f0; document.removeEventListener('hoops-feedback', ecoute);
      Element.prototype.getBoundingClientRect = g0; window.getComputedStyle = gcs; Object.defineProperty(HTMLElement.prototype, 'offsetWidth', ow);
    }
    const ank = varDe(A.hud.el, 'ank');
    rendre();
    res.push([`${relancees}/20 annonces relancées (échelle de départ ${ank})`, relancees === 20 && ank < 1]);
    res.push([`${fb} hud.feedback, ${hoops} hoops-feedback, ${lectures} lecture(s) de mise en page`, fb === 0 && hoops === 0 && lectures === 0]);
    res.push(['#hud-annonce à elles (sous #hud, marqué data-jeu)', A.hud.eAnnonce.id === 'hud-annonce' && !!A.hud.eAnnonce.closest('[data-jeu]')]);
    return bilan(res, '20 annonces : chacune relancée dans #hud-annonce ; 0 hud.feedback, 0 hoops-feedback, 0 lecture de mise en page');
  });

  // À F2 : avec les vrais événements de L-A / L-E / L-F, une manche de 2 min de chaque mode : seuils 1 et 12 tenus
  T('F2 manches réelles de 2 min : écritures et exceptions', async () => {
    const res = [];
    for (const [mode, o] of [['equipes', { zone: 'ecole', allies: 3, ennemis: 4, graine: 21 }], ['domination', { zone: 'ecole', allies: 3, ennemis: 4, graine: 22 }],
      ['prophunt', { zone: 'e1', graine: 23 }]]) {
      await jeu.lancer(mode, o);
      const p = game.partie;
      let erreurs = 0, records = 0, n = 0;
      const err = (e) => { erreurs++; }; window.addEventListener('error', err);
      const mo = new MutationObserver(() => {});
      mo.observe(document.getElementById('hud'), { subtree: true, attributes: true, childList: true, characterData: true });
      try { for (let i = 0; i < 120 * 60 && game.partie === p; i++) { try { game.frame(1 / 60); } catch (e) { erreurs++; } records += mo.takeRecords().length; n++; if (i % 600 === 599) await t0(); } }
      finally { mo.disconnect(); window.removeEventListener('error', err); }
      res.push([`${mode} : ${r2(records / Math.max(1, n))} écriture(s) par image sur ${n}, ${erreurs} exception(s)`, records / Math.max(1, n) <= 2 && erreurs === 0]);
      jeu.quitter('balade');
    }
    return bilan(res, 'une manche de 2 min par mode avec les vrais lots : ≤ 2 écritures par image, 0 exception');
  }, { delai: 600, apresFusion: true });
  const t0 = () => new Promise((r) => setTimeout(r, 0));
}
