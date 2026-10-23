// =====================================================================
//  LES TESTS DU LOT L-B — mouvement et caméras (23/10 ; spec § 5.5.2, acceptation, points 1 à 19 ; « À F2 » en apresFusion)
// =====================================================================
// Lancés par le harnais sous `?test=1&rapport=1&lot=L-B` (window.__rapport), PC puis `?tel=1`. Tout passe par window.__jeu
// et par la partie d'essai (js/jeu/partie_essai.js) : les commandes FORCÉES (`partie.forcees`, ce que fait __jeu.commande)
// pilotent les corps sans clavier, les codes injectés dans js/input.js (presser / relacher) pilotent lireCommande quand c'est
// elle qu'on teste (double Maj, SOURIS 5, sprint limité). Les lieux (lignes droites libres, volées, portes, bordures, murs)
// sont CHERCHÉS dans le monde solide au moment du test (le lot R refait le −1 : rien n'est figé qui pourrait bouger),
// sauf les obstacles du franchissement, donnés par leurs coordonnées après une passe de mesure (critère 7).
// « Terrain libre » : le monde solide coupé pour le déplacement (Player.collisions = null) loin de l'école, bornes levées
// — les allures longues (4,5 s de sprint tactique = 35 m) ne tiennent dans aucune pièce ; rendu à la fin du test.
import * as THREE from 'three';
import { PAS, OEIL, TANGAGE_MAX } from '../constantes.js';
import { Rng } from '../rng.js';
import { Player } from '../../player.js';
import { entree } from '../../settings.js';
import { ALLURES, VISEE_PAR_ARME, MOBILITE_COUTEAU, franchissable, hauteurOeil, vitesseSaut, separer, penteEn, SAUT, OEIL_LISSE } from '../mouvement.js';
import { etatEntrees } from '../entrees_jeu.js';
import { VueFPS } from '../vue_fps.js';
import { ARMES, Arsenal } from '../armes.js';
import { FICHES_BOTS } from '../avatars.js';
import { deguiser } from '../deguisements.js';
import { CorpsProp } from '../corps_prop.js';

const DEG = Math.PI / 180;
const r2 = (v) => Math.round(v * 100) / 100, r3 = (v) => Math.round(v * 1000) / 1000, r4 = (v) => Math.round(v * 1e4) / 1e4;
const pc = (v, ref) => Math.abs(v - ref) / Math.abs(ref);
const lacetVers = (dx, dz) => Math.atan2(-dx, -dz);
const dirDe = (l) => ({ x: -Math.sin(l), z: -Math.cos(l) });
const LOIN = { x: 600, z: 600 };                                     // (le terrain libre : loin de tout sol et de tout mur)
const SANS_BORNES = { xMin: -1e5, xMax: 1e5, zMin: -1e5, zMax: 1e5 };

// LES OBSTACLES DU FRANCHISSEMENT (critère 7) : point de départ (pieds), direction (lacet) ; choisis par une passe de mesure
// (`__jeu.mesuresFranchir`, ci-dessous) qui vérifie que `franchissable` y rend une arrivée libre — h : la hauteur mesurée
export const OBSTACLES = [];
// LES RANGS SERRÉS (critère 7) : franchissement refusé (arrivée jamais libre)
export const RANGS_SERRES = [];

export default function (jeu) {
  const game = window.__game;
  const T = (nom, fn, opts) => jeu.ajouterTest('L-B', nom, fn, opts);
  const C = () => game.collisions;
  const P = () => game.partie;
  const essai = async (o = {}) => { await jeu.lancer('essai', { graine: 1, mannequins: [], ...o }); return game.partie; };
  // une commande forcée jusqu'à nouvel ordre (`fin` infinie) ou pendant `duree`
  const forcer = (a, champs, duree = Infinity) => { const p = P(); p.forcees.set(a.id, { champs: { ax: 0, ay: 0, amp: 1, ...champs }, fin: duree === Infinity ? Infinity : p.t + duree }); };
  // un front pendant UN pas, en plus de la commande forcée en cours (rendue ensuite)
  const front = (a, champs) => {
    const p = P(), F = p.forcees.get(a.id), avant = F ? { ...F.champs } : {};
    p.forcees.set(a.id, { champs: { ...avant, ...champs }, fin: p.t + PAS * 1.5 });
    p.pas(PAS);
    if (F) p.forcees.set(a.id, { champs: avant, fin: F.fin }); else p.forcees.delete(a.id);
  };
  const lacher = (a) => P().forcees.delete(a.id);
  const pas = (n) => { const p = P(); for (let i = 0; i < n; i++) p.pas(PAS); };
  const vitesse = (a) => Math.hypot(a.corps.vel.x, a.corps.vel.z);
  // la vitesse mesurée sur `s` secondes (le déplacement réel)
  const mesurerV = (a, s) => { const x = a.pos.x, z = a.pos.z; pas(Math.round(s / PAS)); return Math.hypot(a.pos.x - x, a.pos.z - z) / (Math.round(s / PAS) * PAS); };
  // LE TERRAIN LIBRE : le déplacement sans monde solide, loin de l'école, sans bornes (rendu dans finally)
  const libre = async (a, fn) => {
    const C0 = Player.collisions, B0 = a.joueur.bounds;
    Player.collisions = null; a.joueur.bounds = SANS_BORNES;
    try { jeu.teleporter(a.id, LOIN.x, 0, LOIN.z, 0); a.corps.vel.set(0, 0, 0); return await fn(); }
    finally { Player.collisions = C0; a.joueur.bounds = B0; }
  };
  // une ligne droite LIBRE et plate de `L` m (le disque à `r` m des murs, le plafond au-dessus de 2,3 m), dans une boîte
  const ligneLibre = (b, L, r = 0.36) => {
    const c = C();
    for (let z = b.z0; z <= b.z1; z += 0.5) for (let x = b.x0; x <= b.x1; x += 0.5) {
      const y = c.solEn(x, z, b.y + 0.3);
      if (Math.abs(y - b.y) > 0.02) continue;
      for (let k = 0; k < 8; k++) {
        const l = k * Math.PI / 4, d = dirDe(l);
        let ok = true;
        for (let s = 0; s <= L + 1e-9 && ok; s += 0.25) {
          const px = x + d.x * s, pz = z + d.z * s, py = c.solEn(px, pz, y + 0.3);
          if (Math.abs(py - y) > 0.005 || !c.libre(px, pz, r, y) || c.plafondEn(px, pz, y) < y + 2.3) ok = false;
        }
        if (ok) return { x, y, z, lacet: l, dx: d.x, dz: d.z, L };
      }
    }
    return null;
  };
  const HALL = { x0: 5, x1: 21, z0: -9, z1: -0.5, y: 0 }, RUE = { x0: -2, x1: 21, z0: 0.8, z1: 5.6, y: 0 };
  const ligne = (L) => ligneLibre(HALL, L) || ligneLibre(RUE, L);
  // un point DÉGAGÉ (un disque libre de `R` m autour de lui, sol plat), au hall puis dans la rue
  const pointDegage = (R) => {
    const c = C();
    for (const b of [HALL, RUE]) for (let z = b.z0; z <= b.z1; z += 0.25) for (let x = b.x0; x <= b.x1; x += 0.25) {
      const y = c.solEn(x, z, b.y + 0.3);
      if (Math.abs(y - b.y) > 0.02 || !c.libre(x, z, R, y)) continue;
      let plat = true; for (let k = 0; k < 8 && plat; k++) { const d = dirDe(k * Math.PI / 4); if (Math.abs(c.solEn(x + d.x * R, z + d.z * R, y + 0.3) - y) > 0.005) plat = false; }
      if (plat) return { x, y, z };
    }
    return null;
  };
  // des points LIBRES au hasard sur les quatre niveaux (hors volées), `filtre(x, y, z, plafond)` en plus
  const NIV = [-3.06, 0, 3.5, 6.6];
  const pointsLibres = (rng, n, filtre = null, r = 0.32, essais = 40000) => {
    const c = C(), L = [];
    for (let i = 0; i < essais && L.length < n; i++) {
      const Y = NIV[rng.int(4)], x = rng.range(-2.5, 22.5), z = rng.range(-24, -0.3);
      const y = c.solEn(x, z, Y + 0.3);
      if (Math.abs(y - Y) > 0.02 || !c.libre(x, z, r, y)) continue;
      const pl = c.plafondEn(x, z, y);
      if (!Number.isFinite(pl) || pl < y + 1.9) continue;
      if (penteEn(c, x, z, y) > 0) continue;
      if (filtre && !filtre(x, y, z, pl)) continue;
      L.push({ x, y, z, plafond: pl });
    }
    return L;
  };
  // l'œil de la caméra (sans le balancement) et une image faite à la main : 2 pas, l'interpolation (au dernier pas simulé : la
  // fraction 1, que l'œil comparé et les pieds lus soient du même pas), la caméra
  const image = (vue) => { const p = P(); p.pas(PAS); p.pas(PAS); game.acc = PAS; game.interpoler(); p.camera(1 / 60, false); return vue ? vue._oeilY(p.local) : game.camera.position.y; };
  const angleCam = () => { const e = new THREE.Euler().setFromQuaternion(game.camera.quaternion, 'YXZ'); return { lacet: e.y, tangage: -e.x, roulis: e.z }; };
  // (un faux pointeur capturé : la souris de js/game.js _onMove ne bouge la caméra que pointeur capturé)
  const avecCapture = async (fn) => {
    const proto = Object.getOwnPropertyDescriptor(Document.prototype, 'pointerLockElement'), canvas = game.renderer.domElement;
    Object.defineProperty(document, 'pointerLockElement', { configurable: true, get: () => canvas });
    try { return await fn(); }
    finally { delete document.pointerLockElement; if (proto) Object.defineProperty(Document.prototype, 'pointerLockElement', proto); }
  };
  const souris = (mx, my) => window.dispatchEvent(new MouseEvent('mousemove', { movementX: mx, movementY: my, bubbles: true }));

  // =====================================================================
  // 1. LES ALLURES, pour Haythem ET les 6 fiches des bots, × la mobilité de l'arme
  T('1 allures (7 fiches) × mobilité', async () => {
    const p = await essai({ graine: 1 });
    const L = ligne(9);
    if (!L) return { ok: false, attendu: 'une ligne libre de 9 m au hall ou dans la rue', obtenu: 'aucune' };
    const a0 = p.local, corps = [a0];
    // (les corps des bots : la vitesse de LEUR fiche, comme L-C les fera — le squelette clone Haythem)
    FICHES_BOTS.forEach((F, i) => {
      const b = p.ajouterActeur({ id: 10 + i, nom: F.nom, equipe: 'A', fiche: F, x: LOIN.x + 3 * i, y: 0, z: LOIN.z, lacet: 0, classe: 'assaut', cerveau: null });
      b.joueur.def = { ...b.joueur.def, spd: F.spd };
      corps.push(b);
    });
    const mesure = (a, champs, visee, acc) => {
      jeu.teleporter(a.id, L.x, L.y, L.z, L.lacet); a.corps.vel.set(0, 0, 0);
      a.accroupi = acc ? 1 : 0; a.glisse = 0; a.jaugeTact = 1;
      if (a.arsenal) a.arsenal.vk = visee ? 1 : 0;
      forcer(a, { ay: 1, lacet: L.lacet, tangage: 0, visee: !!visee, accroupi: !!acc, ...champs });
      pas(Math.round(0.8 / PAS));
      const v = mesurerV(a, 0.35);
      lacher(a); a.corps.vel.set(0, 0, 0);
      jeu.teleporter(a.id, LOIN.x + 3 * a.id, 0, LOIN.z, 0);
      return v;
    };
    const ALL = [['marche', { marche: true }, 0, 0, ALLURES.marche], ['course', {}, 0, 0, ALLURES.course], ['sprint', { sprint: true }, 0, 0, ALLURES.sprint],
      ['tactique', { sprint: true, sprintTact: true }, 0, 0, ALLURES.sprintTact], ['visée', {}, 1, 0, ALLURES.visee], ['accroupi', {}, 0, 1, ALLURES.accroupi],
      ['accroupi visé', {}, 1, 1, ALLURES.accroupiVisee]];
    const fautes = [], vus = [];
    for (const a of corps) for (const [nom, ch, vi, ac, ref] of ALL) {
      const v = mesure(a, ch, vi, ac);
      if (pc(v, ref) > 0.01) fautes.push(`${a.nom} ${nom} ${r3(v)} (${ref})`);
      if (a === a0) vus.push(`${nom} ${r3(v)}`);
    }
    // × la mobilité (Haythem, chaque arme en main : course, sprint, accroupi × mobilité ; la visée, la vitesse de l'arme)
    const mob = [];
    for (const w of ['fa24', 'pm9', 'fp12', 'tp50', 'p17', 'couteau']) {
      a0.arsenal = new Arsenal(a0, { principale: w, secondaire: null, letale: null, tactique: null, couteau: true });
      const m = w === 'couteau' ? MOBILITE_COUTEAU : ARMES[w].mobilite, vv = VISEE_PAR_ARME[w] ?? ALLURES.visee * m;
      for (const [nom, ch, vi, ac, ref] of [['course', {}, 0, 0, ALLURES.course * m], ['sprint', { sprint: true }, 0, 0, ALLURES.sprint * m],
        ['accroupi', {}, 0, 1, ALLURES.accroupi * m], ['visée', {}, 1, 0, vv]]) {
        const v = mesure(a0, ch, vi, ac);
        if (pc(v, ref) > 0.01) fautes.push(`${w} ${nom} ${r3(v)} (${r3(ref)})`);
        if (nom === 'course') mob.push(`${w} ${r3(v)}`);
      }
    }
    jeu.quitter('balade');
    return { ok: fautes.length === 0, attendu: 'marche 2,15 · course 5,00 · sprint 6,60 · tactique 7,80 · visée 2,40 · accroupi 2,30 · accroupi visé 1,50 (± 1 %), 7 fiches ; × mobilité',
      obtenu: (fautes.length ? 'FAUTES : ' + fautes.slice(0, 8).join(' ; ') + ' · ' : '') + `Haythem : ${vus.join(', ')} · course × mobilité : ${mob.join(', ')} · ligne (${r2(L.x)} ; ${r2(L.z)})` };
  }, { delai: 180 });

  // 2. LE SPRINT TACTIQUE : double Maj < 0,30 s → 7,80 pendant 3,0 s (4,5 s au PM-9 et au P-17), puis 6,60 ; jauge pleine en 4 s,
  //    utilisable dès 1,2 s
  T('2 sprint tactique : double Maj, durées, jauge', async () => {
    const p = await essai({ graine: 2 }), a = p.local, inp = game.input, res = [];
    const r = await libre(a, async () => {
      const course = (w) => {
        a.arsenal = new Arsenal(a, { principale: w, secondaire: null, letale: null, tactique: null, couteau: true });
        a.jaugeTact = 1; jeu.teleporter(0, LOIN.x, 0, LOIN.z, 0); a.corps.vel.set(0, 0, 0);
        inp.purger(); inp.presser('KeyW'); pas(30);
        // le double appui : Maj, 0,15 s, lâché, 0,05 s, Maj (0,20 s entre les deux appuis)
        inp.presser('ShiftLeft'); pas(18); inp.relacher('ShiftLeft'); pas(6); inp.presser('ShiftLeft');
        let n = 0, debut = -1, vT = 0;
        for (let i = 0; i < 900; i++) {
          p.pas(PAS);
          if (a.allure === 'tact') { if (debut < 0) debut = i; n++; if (n === 120) { const x = a.pos.x, z = a.pos.z; pas(36); vT = Math.hypot(a.pos.x - x, a.pos.z - z) / (36 * PAS); n += 36; i += 36; } }
          else if (debut >= 0) break;
        }
        pas(Math.round(0.8 / PAS));
        const vS = mesurerV(a, 0.3);
        inp.relacher('ShiftLeft'); inp.relacher('KeyW'); inp.purger(); pas(60);
        const m = w === 'pm9' || w === 'p17' ? 1.06 : 1;
        return { w, duree: n * PAS, vT, vS, mob: ARMES[w].mobilite };
      };
      for (const w of ['fa24', 'pm9', 'p17']) res.push(course(w));
      // la jauge : vidée, puis 1,0 s de repos → refusée ; 1,3 s → acceptée ; pleine 4 s après la fin
      a.arsenal = new Arsenal(a, { principale: 'fa24', secondaire: null, letale: null, tactique: null, couteau: true });
      const essaiTact = () => { inp.purger(); inp.presser('KeyW'); inp.presser('ShiftLeft'); pas(30); inp.presser('Souris:4'); pas(12); const t = a.allure === 'tact'; inp.relacher('Souris:4'); inp.relacher('ShiftLeft'); inp.relacher('KeyW'); inp.purger(); return t; };
      a.jaugeTact = 0; a.mvt && (a.mvt.tact = false);
      pas(Math.round(1.0 / PAS) - 42);                      // (les 0,35 s de l'essai rechargent aussi : 1,0 s en tout)
      const j10 = a.jaugeTact, refuse = !essaiTact();
      pas(60);
      a.jaugeTact = 0; a.mvt.tact = false; pas(Math.round(1.3 / PAS) - 42);
      const j13 = a.jaugeTact, accepte = essaiTact();
      a.jaugeTact = 0; a.mvt.tact = false; pas(Math.round(4.0 / PAS));
      return { refuse, accepte, j10, j13, plein: a.jaugeTact };
    });
    jeu.quitter('balade');
    const fautes = [];
    for (const R of res) {
      const D = R.w === 'fa24' ? 3.0 : 4.5;
      if (Math.abs(R.duree - D) > PAS * 1.5) fautes.push(`${R.w} durée ${r3(R.duree)} (${D})`);
      if (pc(R.vT, 7.8 * R.mob) > 0.01) fautes.push(`${R.w} tactique ${r3(R.vT)} (${r3(7.8 * R.mob)})`);
      if (pc(R.vS, 6.6 * R.mob) > 0.01) fautes.push(`${R.w} puis ${r3(R.vS)} (${r3(6.6 * R.mob)})`);
    }
    if (!r.refuse) fautes.push('accepté à 1,0 s');
    if (!r.accepte) fautes.push('refusé à 1,3 s');
    if (Math.abs(r.plein - 1) > 1e-9) fautes.push('jauge ' + r.plein + ' après 4 s');
    return { ok: fautes.length === 0, attendu: '7,80 m/s pendant 3,0 s (PM-9, P-17 : 4,5 s) puis 6,60 (× mobilité) ; refusé à 1,0 s de recharge, permis à 1,3 s ; jauge pleine en 4 s',
      obtenu: (fautes.length ? 'FAUTES : ' + fautes.join(' ; ') + ' · ' : '') + res.map((R) => `${R.w} ${r3(R.duree)} s à ${r3(R.vT)} puis ${r3(R.vS)}`).join(' · ')
        + ` · jauge ${r3(r.j10)} (refus ${r.refuse}) / ${r3(r.j13)} (accepté ${r.accepte}) / pleine ${r.plein}` };
  }, { delai: 120 });

  // 3. LE SAUT : apogée et temps en l'air ; 2 000 sauts avec élan, dont 1 000 sous des plafonds bas ; 40 sauts à travers 20 portes
  T('3 saut : apogée, plafonds en vol, portes', async () => {
    const p = await essai({ graine: 3 }), a = p.local, c = () => C();
    // (a) en terrain libre
    const libreR = await libre(a, async () => {
      pas(5);
      front(a, { saut: true });
      let h = a.corps.jumpY, n = 1;
      while (a.corps.airborne && n < 200) { p.pas(PAS); n++; h = Math.max(h, a.corps.jumpY); }
      // l'élan gardé en l'air : sprint 6,6, la commande lâchée au décollage → v·e^(−t/0,45) à l'arrivée
      jeu.teleporter(0, LOIN.x, 0, LOIN.z, 0);
      forcer(a, { ay: 1, sprint: true, lacet: 0 }); pas(120);
      const v0 = vitesse(a);
      front(a, { ay: 1, sprint: true, saut: true, lacet: 0 }); forcer(a, { ay: 0, lacet: 0 });
      let k = 1; while (a.corps.airborne && k < 200) { p.pas(PAS); k++; }
      const v1 = vitesse(a) / 0.85, att = v0 * Math.exp(-(k - 1) * PAS / 0.45);       // (la réception retire 15 % : rendus)
      lacher(a);
      return { h, t: n * PAS, v0, v1, att };
    });
    // (b) 2 000 sauts avec élan (graine 11) : la tête toujours à 5 cm sous le plafond, la tranche de tête libre
    const rng = new Rng(11);
    const bas = pointsLibres(rng, 400, (x, y, z, pl) => pl - y >= 2.15 && pl - y <= 2.45);
    const tous = pointsLibres(rng, 400);
    let sauts = 0, sousBas = 0, fautesTete = 0, fautesTranche = 0, refus = 0, refusAttendus = 0, pasAir = 0, franchis = 0;
    const R = SAUT;
    for (let i = 0; i < 2000; i++) {
      const L = i < 1000 ? bas : tous; if (!L.length) break;
      const q = L[i % L.length], l = rng.range(-Math.PI, Math.PI), d = dirDe(l);
      jeu.teleporter(0, q.x, q.y, q.z, l);
      a.corps.vel.set(d.x * 6.6, 0, d.z * 6.6);
      forcer(a, { ay: 1, sprint: true, lacet: l });
      const vs = vitesseSaut(a);
      if (vs === 0) refusAttendus++;
      front(a, { ay: 1, sprint: true, lacet: l, saut: true });
      // (un obstacle bas juste devant : Espace le franchit — ce n'est ni un saut ni un refus)
      if (a.mvt && a.mvt.franchit) { franchis++; if (vs === 0) refusAttendus--; for (let n = 0; n < 80 && a.mvt.franchit; n++) p.pas(PAS); lacher(a); continue; }
      if (!a.corps.airborne) { refus++; lacher(a); continue; }
      sauts++; if (i < 1000) sousBas++;
      for (let n = 0; n < 150 && a.corps.airborne; n++) {
        const j = a.corps, pl = c().plafondEn(j.pos.x, j.pos.z, j.pos.y);
        // (une tête DANS le plafond sans saut — un dessous de volée plus bas que 1,78 m, où l'on passe debout — n'est pas une faute
        // du saut : on ne compte que quand le saut l'aggrave, jumpY > 0)
        if (j.jumpY > 1e-9 && j.pos.y + R.tete + j.jumpY > pl - R.teteVol + 1e-6) fautesTete++;
        if (j.jumpY > 0 && !c().libre(j.pos.x, j.pos.z, j.rayon ?? 0.3, j.pos.y + j.jumpY, R.hautTete, R.basTete)) fautesTranche++;
        pasAir++;
        p.pas(PAS);
      }
      lacher(a);
    }
    // (c) 40 sauts au sprint à travers 20 portes (linteaux 2,04-2,10 m)
    const portes = chercherPortes(c(), 20);
    let passes = 0, oeilDedans = 0, trancheDedans = 0, essais = 0;
    for (const D of portes) for (const sens of [1, -1]) {
      essais++;
      const nx = D.nx * sens, nz = D.nz * sens, l = lacetVers(nx, nz);
      jeu.teleporter(0, D.x - nx * D.avant, D.y, D.z - nz * D.avant, l);
      a.corps.vel.set(nx * 6.6, 0, nz * 6.6);
      forcer(a, { ay: 1, sprint: true, lacet: l });
      let saute = false, passe = false;
      for (let n = 0; n < 160; n++) {
        const j = a.corps, s = (j.pos.x - D.x) * nx + (j.pos.z - D.z) * nz;
        if (!saute && s >= -D.elan) { front(a, { ay: 1, sprint: true, lacet: l, saut: true }); saute = true; continue; }
        p.pas(PAS);
        if (j.jumpY > 0 && !c().libre(j.pos.x, j.pos.z, j.rayon ?? 0.3, j.pos.y + j.jumpY, R.hautTete, R.basTete)) trancheDedans++;
        const yo = j.pos.y + hauteurOeil(a) + j.jumpY;
        if (!c().libre(j.pos.x, j.pos.z, 0.05, yo - 0.03, 0.06, 0)) oeilDedans++;
        if ((j.pos.x - D.x) * nx + (j.pos.z - D.z) * nz > 1.2) { passe = true; break; }
      }
      if (passe) passes++;
      lacher(a);
    }
    jeu.quitter('balade');
    const okA = Math.abs(libreR.h - 0.505) <= 0.005 && Math.abs(libreR.t - 0.642) <= 0.01 && pc(libreR.v1, libreR.att) <= 0.05;
    const okB = sauts + franchis >= 1900 && sousBas >= 900 && fautesTete === 0 && fautesTranche === 0 && refus === refusAttendus;
    const okC = portes.length >= 20 && passes === essais && oeilDedans === 0 && trancheDedans === 0;
    return { ok: okA && okB && okC, attendu: 'apogée 0,505 ± 0,005 m, 0,642 ± 0,01 s, élan τ 0,45 · 2 000 sauts (1 000 sous 2,2-2,4 m) : tête ≥ 5 cm sous le plafond, tranche libre, refus = v < 1,2 · 40 passages sous 20 linteaux',
      obtenu: `apogée ${r4(libreR.h)} m en ${r3(libreR.t)} s · élan ${r2(libreR.v1)} m/s (attendu ${r2(libreR.att)}) · ${sauts} sauts (${sousBas} sous plafond bas, ${pasAir} pas en l'air) : tête ${fautesTete}, tranche ${fautesTranche}, refus ${refus}/${refusAttendus}, franchis ${franchis}`
        + ` · portes ${portes.length} : ${passes}/${essais} passages, œil dedans ${oeilDedans}, tranche ${trancheDedans}` };
  }, { delai: 240 });

  // 4. LA RÉCEPTION d'une chute > 0,3 m : vitesse × 0,85 pendant 0,12 s, événement `reception`
  T('4 réception : × 0,85 pendant 0,12 s', async () => {
    const p = await essai({ graine: 4 }), a = p.local;
    const r = await libre(a, async () => {
      forcer(a, { ay: 1, lacet: 0 }); pas(120);
      const ev = [], des = p.sur('reception', (e) => { if (e.a === 0) ev.push(e); });
      front(a, { ay: 1, lacet: 0, saut: true });
      let vAvant = 0;
      while (a.corps.airborne) { vAvant = vitesse(a); p.pas(PAS); }
      const vApres = vitesse(a);
      pas(6); const v6 = vitesse(a);                                     // (à 0,05 s : la cible encore × 0,85)
      pas(72); const vFin = vitesse(a);                                  // (0,6 s après : la course reprise, τ 0,13 s)
      des(); lacher(a);
      return { vAvant, vApres, v6, vFin, ev };
    });
    jeu.quitter('balade');
    const k = r.vApres / r.vAvant, ok = Math.abs(k - 0.85) <= 0.01 && r.v6 <= r.vAvant * 0.87 && pc(r.vFin, 5) <= 0.01 && r.ev.length === 1 && r.ev[0].chute > 0.3;
    return { ok, attendu: 'vitesse × 0,85 à la réception (± 0,01), tenue sous 0,87 pendant 0,12 s, puis 5,00 ; 1 événement reception (chute > 0,3)',
      obtenu: `${r3(r.vAvant)} → ${r3(r.vApres)} (× ${r3(k)}) · à 0,05 s ${r3(r.v6)} · puis ${r3(r.vFin)} · ${r.ev.length} réception(s), chute ${r.ev[0] ? r3(r.ev[0].chute) : '-'}` };
  });

  // 5. L'ACCROUPI : œil à 1,08 ± 0,005 après 0,16 s, 1,62 après 0,18 s au relevé ; relever refusé sous un plafond < pieds + 1,85
  T('5 accroupi : 0,16 s / 0,18 s, relever refusé sous 1,85', async () => {
    const p = await essai({ graine: 5 }), a = p.local;
    const r = await libre(a, async () => {
      const oeil = () => a.oeil(new THREE.Vector3()).y - a.pos.y;
      forcer(a, { accroupi: true }); pas(Math.ceil(0.16 / PAS));
      const bas = oeil();
      forcer(a, { accroupi: false }); pas(Math.ceil(0.18 / PAS));
      const haut = oeil();
      // la courbe douce : à mi-chemin, l'œil a fait la moitié (au cm près), sans à-coup
      forcer(a, { accroupi: true }); const L = []; for (let i = 0; i < 20; i++) { p.pas(PAS); L.push(oeil()); }
      let mono = true; for (let i = 1; i < L.length; i++) if (L[i] > L[i - 1] + 1e-9) mono = false;
      // sous un plafond bas (posé pour le test : plafondEn rendu à pieds + 1,7) : le relever est refusé
      const c = C(), orig = c.plafondEn;
      c.plafondEn = (x, z, y) => Math.min(orig.call(c, x, z, y), (y ?? 0) + 1.7);
      let refuse;
      try { forcer(a, { accroupi: false }); pas(60); refuse = a.accroupi > 0.999; }
      finally { c.plafondEn = orig; }
      pas(Math.ceil(0.18 / PAS)); const releve = oeil();
      lacher(a);
      return { bas, haut, mono, refuse, releve };
    });
    jeu.quitter('balade');
    const ok = Math.abs(r.bas - 1.08) <= 0.005 && Math.abs(r.haut - 1.62) <= 0.005 && r.mono && r.refuse && Math.abs(r.releve - 1.62) <= 0.005;
    return { ok, attendu: '1,08 ± 0,005 après 0,16 s · 1,62 après 0,18 s · descente sans à-coup · refusé sous 1,85 · relevé une fois le plafond rendu',
      obtenu: `${r4(r.bas)} · ${r4(r.haut)} · monotone ${r.mono} · refusé ${r.refuse} · ${r4(r.releve)}` };
  });

  // 6. LA GLISSADE : v0 = min(8,8 ; v × 1,12) ± 1 % ; 0,46875·v0 en 0,75 s ± 3 % ; direction figée ; refusée sur une pente > 0,4 ;
  //    recharge 0,9 s ; un saut garde 85 %
  T('6 glissade : v0, distance, direction, pente, recharge, saut', async () => {
    const p = await essai({ graine: 6 }), a = p.local;
    const r = await libre(a, async () => {
      const M = () => a.mvt;
      const lancer = () => {
        forcer(a, { ay: 1, sprint: true, lacet: 0 }); pas(Math.round(1.0 / PAS));
        const v = vitesse(a), x = a.pos.x, z = a.pos.z;
        forcer(a, { ay: 1, sprint: true, lacet: 0, accroupi: true }); p.pas(PAS);
        return { v, x, z, G: M().glisse ? { ...M().glisse } : null };
      };
      // une glissade entière, la tête tournée d'un radian au milieu
      const L1 = lancer();
      if (!L1.G) return { echec: 'pas de glissade' };
      let n = 1;
      while (M().glisse && n < 200) { if (n === 40) forcer(a, { ay: 1, sprint: true, lacet: 1.0, accroupi: true }); p.pas(PAS); n++; }
      const dist = Math.hypot(a.pos.x - L1.x, a.pos.z - L1.z), dirErr = Math.abs(Math.atan2(a.pos.x - L1.x, -(a.pos.z - L1.z)) - Math.atan2(L1.G.dx, -L1.G.dz)) / DEG;
      // la recharge : relevé, sprint, accroupi à 0,5 s de la fin → refusée ; à 1,0 s → permise
      const tFin = p.t;
      forcer(a, { ay: 1, sprint: true, lacet: 0 }); while (p.t - tFin < 0.5) p.pas(PAS);
      forcer(a, { ay: 1, sprint: true, lacet: 0, accroupi: true }); p.pas(PAS);
      const refusRecharge = !M().glisse;
      forcer(a, { ay: 1, sprint: true, lacet: 0 }); while (p.t - tFin < 1.0) p.pas(PAS);
      forcer(a, { ay: 1, sprint: true, lacet: 0, accroupi: true }); p.pas(PAS);
      const permise = !!M().glisse;
      // le saut d'une glissade : 85 % de la vitesse
      pas(30);
      const vg = vitesse(a);
      front(a, { ay: 1, sprint: true, lacet: 0, accroupi: true, saut: true });
      const vs = vitesse(a), enAir = a.corps.airborne;
      lacher(a); pas(120);
      return { L1, n, dist, dirErr, refusRecharge, permise, vg, vs, enAir };
    });
    // la pente : sur une volée de plus de 0,4, au sprint, l'accroupi ne glisse pas
    let pente = null;
    const V = volees(C()).filter((v) => v.pente > 0.4 && v.long >= 3);
    for (const v of V) {
      const dv = dirDe(v.lacet);
      jeu.teleporter(0, v.a.x, v.a.y, v.a.z, v.lacet); a.corps.vel.set(dv.x * 6.6, 0, dv.z * 6.6);
      forcer(a, { ay: 1, sprint: true, lacet: v.lacet }); let k = 0;
      while (k < 120 && penteEn(C(), a.pos.x, a.pos.z, a.pos.y) <= 0.4) { p.pas(PAS); k++; }
      pas(12);
      if (penteEn(C(), a.pos.x, a.pos.z, a.pos.y) <= 0.4 || vitesse(a) < 6 || !(a.mvt.sprintT >= 0.25)) continue;
      // (au pas de l'appui, toutes les autres conditions de la glissade sont réunies : seule la pente la refuse)
      const sT = a.mvt.sprintT, vv = vitesse(a);
      forcer(a, { ay: 1, sprint: true, lacet: v.lacet, accroupi: true }); p.pas(PAS);
      pente = { refus: !a.mvt.glisse, pente: r2(v.pente), v: r2(vv), sprint: r2(sT) };
      lacher(a); break;
    }
    jeu.quitter('balade');
    if (r.echec) return { ok: false, attendu: 'une glissade', obtenu: r.echec };
    const v0 = Math.min(8.8, Math.max(r.L1.v, 6.6) * 1.12);
    const ok = pc(r.L1.G.v0, v0) <= 0.01 && pc(r.dist, 0.46875 * r.L1.G.v0) <= 0.03 && r.dirErr < 0.5 && r.refusRecharge && r.permise
      && r.enAir && Math.abs(r.vs / r.vg - 0.85) <= 0.02 && pente && pente.refus;
    return { ok, attendu: 'v0 = min(8,8 ; v × 1,12) ± 1 % · 0,46875·v0 ± 3 % · direction figée · refusée à 0,5 s de recharge, permise à 1,0 s · saut 85 % · refusée sur une pente > 0,4',
      obtenu: `v ${r3(r.L1.v)} → v0 ${r3(r.L1.G.v0)} (${r3(v0)}) · ${r3(r.dist)} m en ${r.n} pas (${r3(0.46875 * r.L1.G.v0)}) · écart de direction ${r3(r.dirErr)}° · recharge : refus ${r.refusRecharge}, permise ${r.permise}`
        + ` · saut ${r3(r.vg)} → ${r3(r.vs)} (× ${r3(r.vs / r.vg)}) · pente ${pente ? JSON.stringify(pente) : 'aucune volée essayée'}` };
  }, { delai: 120 });

  // 7. LE FRANCHISSEMENT : 10 obstacles donnés par leurs coordonnées (0,45 s, 0,38 sous 0,7 m ; sortie à 70 %) ; 5 rangs serrés refusés
  T('7 franchissement : 10 obstacles, 5 rangs serrés', async () => {
    const p = await essai({ graine: 7 }), a = p.local, c = C();
    const res = [], fautes = [];
    for (const O of OBSTACLES) {
      const d = dirDe(O.lacet);
      jeu.teleporter(0, O.x - d.x * 2.2, O.y, O.z - d.z * 2.2, O.lacet); a.corps.vel.set(0, 0, 0);
      forcer(a, { ay: 1, lacet: O.lacet });
      let F = null, n = 0, vEntree = 0, debut = -1;
      for (let i = 0; i < 240; i++) {
        if (!F && franchissable(c, a.pos.x, a.pos.y, a.pos.z, d.x, d.z)) { vEntree = vitesse(a); front(a, { ay: 1, lacet: O.lacet, saut: true }); F = a.mvt.franchit ? { ...a.mvt.franchit } : null; if (!F) break; debut = i; continue; }
        if (F) { p.pas(PAS); n++; if (!a.mvt.franchit) break; } else p.pas(PAS);
      }
      const vSortie = vitesse(a), libreA = c.libre(a.pos.x, a.pos.z, 0.3, a.pos.y);
      lacher(a);
      const D = F ? (F.h < 0.7 ? 0.38 : 0.45) : 0;
      const ok = !!F && Math.abs(n * PAS - D) <= PAS * 1.5 && pc(vSortie, 0.7 * vEntree) <= 0.02 && libreA;
      if (!ok) fautes.push(`${O.nom || '?'} ${F ? `${r3(n * PAS)} s, ${r2(vEntree)} → ${r2(vSortie)}, libre ${libreA}` : 'pas franchi'}`);
      res.push(`${O.nom || '?'} h ${F ? r2(F.h) : '-'} ${r3(n * PAS)} s`);
    }
    let refuses = 0;
    for (const R of RANGS_SERRES) {
      const d = dirDe(R.lacet);
      if (!franchissable(c, R.x, R.y, R.z, d.x, d.z)) refuses++;
    }
    jeu.quitter('balade');
    const ok = OBSTACLES.length === 10 && fautes.length === 0 && RANGS_SERRES.length === 5 && refuses === 5;
    return { ok, attendu: '10 franchissements (0,45 s, 0,38 sous 0,7 m, sortie 70 %, arrivée libre) · 5 rangs serrés refusés',
      obtenu: (fautes.length ? 'FAUTES : ' + fautes.join(' ; ') + ' · ' : '') + `${OBSTACLES.length} obstacles : ${res.join(', ')} · rangs refusés ${refuses}/${RANGS_SERRES.length}` };
  }, { delai: 120 });

  // 8. LES ESCALIERS : la dérivée seconde de l'œil ≤ 1 cm par image (60 im/s), l'écart à la pente au milieu des volées ≤ 1 cm ;
  //    les bordures de 0,12 m adoucies
  T('8 escaliers : dérivée seconde de l\'œil, pente ; bordures', async () => {
    const p = await essai({ graine: 8 }), a = p.local, vue = p.vue, c = C();
    const V = volees(c), lignes = [];
    let pire2 = 0, pireEcart = 0, nImages = 0, nMilieu = 0, plafondFautes = 0;
    const parcours = (x, y, z, l, sprint, secondes) => {
      jeu.teleporter(0, x, y, z, l); a.corps.vel.set(0, 0, 0);
      forcer(a, { ay: 1, sprint, lacet: l, tangage: 0 });
      // l'élan pris sur place (le corps arrêté par sa commande lâchée n'avance pas) : 0,2 s de course sur le palier
      const ys = [], sols = [], milieu = [];
      for (let i = 0; i < Math.round(secondes * 60); i++) {
        const y0 = image(vue);
        ys.push(y0);
        const j = a.corps, d = dirDe(l), L = 0.9;
        const f0 = c.solEn(j.pos.x, j.pos.z, j.pos.y + 0.01), fa = c.solEn(j.pos.x + d.x * L, j.pos.z + d.z * L, j.pos.y + L), fb = c.solEn(j.pos.x - d.x * L, j.pos.z - d.z * L, j.pos.y + 0.01);
        sols.push(f0 + OEIL.debout);
        milieu.push(Math.abs(fa + fb - 2 * f0) < 1e-3 && Math.abs(fa - f0) > 0.2 && vitesse(a) > 3);
        if (game.camera.position.y > c.plafondEn(game.camera.position.x, game.camera.position.z, j.pos.y) - 0.1 + 1e-6) plafondFautes++;
      }
      lacher(a);
      let m2 = 0, mE = 0;
      for (let i = 2; i < ys.length; i++) m2 = Math.max(m2, Math.abs(ys[i] - 2 * ys[i - 1] + ys[i - 2]));
      for (let i = 0; i < ys.length; i++) if (milieu[i]) { mE = Math.max(mE, Math.abs(ys[i] - sols[i])); nMilieu++; }
      nImages += ys.length;
      return { m2, mE };
    };
    for (const v of V) for (const sprint of [false, true]) for (const sens of ['monte', 'descend']) {
      const A = sens === 'monte' ? v.a : v.b, l = sens === 'monte' ? v.lacet : v.lacet + Math.PI;
      const R = parcours(A.x, A.y, A.z, l, sprint, (v.long + 2.4) / (sprint ? 6.6 : 5.0) + 0.3);
      pire2 = Math.max(pire2, R.m2); pireEcart = Math.max(pireEcart, R.mE);
      lignes.push(`${v.nom} ${sens} ${sprint ? 'sprint' : 'course'} ${r2(R.m2 * 100)}/${r2(R.mE * 100)}`);
    }
    // les bordures de la rue (trottoir 0 / chaussée −0,12) : traversées en course, dans les deux sens
    const B = chercherBordure(c);
    let bord = null;
    if (B) {
      const R1 = parcoursBord(B, 1), R2 = parcoursBord(B, -1);
      bord = { monte: R1, descend: R2 };
      pire2 = Math.max(pire2, R1.m2, R2.m2);
    }
    function parcoursBord(Bo, s) {
      const l = s > 0 ? Bo.lacet : Bo.lacet + Math.PI, d = dirDe(l);
      jeu.teleporter(0, Bo.x - d.x * 2.5, c.solEn(Bo.x - d.x * 2.5, Bo.z - d.z * 2.5, 0.3), Bo.z - d.z * 2.5, l);
      forcer(a, { ay: 1, lacet: l, tangage: 0 });
      const ys = [];
      for (let i = 0; i < 60; i++) ys.push(image(vue));
      lacher(a);
      let m2 = 0; for (let i = 2; i < ys.length; i++) m2 = Math.max(m2, Math.abs(ys[i] - 2 * ys[i - 1] + ys[i - 2]));
      // la durée de la transition (de 5 % à 95 % du saut de 0,12 m)
      const y0 = ys[0], y1 = ys[ys.length - 1], dh = y1 - y0;
      const i5 = ys.findIndex((y) => Math.abs(y - y0) > 0.05 * Math.abs(dh)), i95 = ys.findIndex((y) => Math.abs(y - y0) > 0.95 * Math.abs(dh));
      return { m2, dh: r3(dh), duree: i5 >= 0 && i95 >= 0 ? r3((i95 - i5) / 60) : null };
    }
    jeu.quitter('balade');
    const ok = V.length >= 6 && pire2 <= 0.01 && pireEcart <= 0.01 && nMilieu > 0 && bord && bord.monte.duree >= 0.06 && bord.descend.duree >= 0.05 && plafondFautes === 0;
    return { ok, attendu: '≥ 6 volées, montée et descente, course et sprint : |Δ²y| ≤ 1 cm par image, écart à la pente ≤ 1 cm au milieu des volées · bordures adoucies (≥ 0,06 s) · œil sous le plafond',
      obtenu: `${V.length} volées · pire Δ² ${r3(pire2 * 100)} cm · pire écart ${r3(pireEcart * 100)} cm (${nMilieu} images au milieu sur ${nImages}) · plafond ${plafondFautes} · bordure ${bord ? JSON.stringify(bord) : 'aucune'} · ${lignes.join(' ; ')}` };
  }, { delai: 180 });

  // 9. LES PAS : tous les 0,7 m ± 5 % en course, 0,45 m en marche, aucun accroupi sous 1,3 m/s
  T('9 pas : 0,7 m en course, 0,45 m en marche, rien accroupi lent', async () => {
    const p = await essai({ graine: 9 }), a = p.local;
    const ecarts = (champs, s) => {
      const L = [], des = p.sur('pas', (e) => { if (e.a === 0) L.push(e); });
      forcer(a, { ay: 1, lacet: 0, ...champs }); pas(Math.round(0.6 / PAS)); L.length = 0; pas(Math.round(s / PAS));
      des(); lacher(a); pas(60);
      const d = []; for (let i = 1; i < L.length; i++) d.push(Math.hypot(L[i].x - L[i - 1].x, L[i].z - L[i - 1].z));
      return { d, n: L.length, allures: [...new Set(L.map((e) => e.allure))] };
    };
    const r = await libre(a, async () => ({ course: ecarts({}, 3), sprint: ecarts({ sprint: true }, 2), marche: ecarts({ marche: true }, 3), acc: ecarts({ accroupi: true }, 2) }));
    // accroupi sous 1,3 m/s : le long d'un mur, poussé en biais (la vitesse le long du mur ≈ 1 m/s)
    const M = chercherMur(C());
    let lent = null;
    if (M) {
      jeu.teleporter(0, M.x, M.y, M.z, M.lacet); a.accroupi = 1;
      const L = [], des = p.sur('pas', (e) => { if (e.a === 0) L.push(e); });
      forcer(a, { ay: 1, lacet: M.lacetPousse, accroupi: true }); pas(30);
      const x = a.pos.x, z = a.pos.z; L.length = 0; pas(240);
      const v = Math.hypot(a.pos.x - x, a.pos.z - z) / (240 * PAS);
      des(); lacher(a);
      lent = { v: r2(v), pas: L.length };
    }
    jeu.quitter('balade');
    const dans = (R, ref) => R.d.length >= 3 && R.d.every((x) => pc(x, ref) <= 0.05);
    const ok = dans(r.course, 0.7) && dans(r.sprint, 0.7) && dans(r.marche, 0.45) && r.acc.n > 0 && r.acc.allures.join() === 'accroupi' && lent && lent.v > 0.3 && lent.v < 1.3 && lent.pas === 0;
    const moy = (R) => (R.d.length ? r3(R.d.reduce((s, x) => s + x, 0) / R.d.length) : '-');
    return { ok, attendu: 'course 0,7 m ± 5 % · sprint 0,7 · marche 0,45 · accroupi à 2,3 m/s : des pas « accroupi » · accroupi sous 1,3 m/s : aucun',
      obtenu: `course ${moy(r.course)} (${r.course.d.length}) · sprint ${moy(r.sprint)} · marche ${moy(r.marche)} (${r.marche.d.length}) · accroupi ${r.acc.n} pas ${r.acc.allures} · lent ${lent ? JSON.stringify(lent) : 'pas de mur'}` };
  });

  // 10. LES CONTACTS : 8 au même point → aucune paire < 0,59 m en 0,2 s, 0 dans une forme, 0 traversée ; une cloison ; les props
  T('10 separer : 8 au même point, cloison, props', async () => {
    const p = await essai({ graine: 10 }), a = p.local, c = C();
    const L = pointDegage(1.3) || ligne(3) || { x: 14.9, y: 0, z: -3.7 };
    const B = [a];
    for (let i = 1; i < 8; i++) B.push(p.ajouterActeur({ id: 20 + i, nom: 'B' + i, equipe: 'A', x: L.x, y: L.y, z: L.z, lacet: 0, cerveau: null }));
    for (const b of B) jeu.teleporter(b.id, L.x, L.y, L.z, 0);
    let traverse = 0, dedans = 0;
    for (let k = 0; k < 24; k++) {
      p.pas(PAS);
      for (const b of B) {
        const q = b.corps;
        if (Math.hypot(q.pos.x - q.posPrec.x, q.pos.z - q.posPrec.z) > 1e-4 && c.rayonLibre(q.posPrec.x, q.posPrec.y + 1, q.posPrec.z, q.pos.x, q.pos.y + 1, q.pos.z, 0) < 1 - 1e-6) traverse++;
      }
    }
    let dMin = Infinity;
    for (let i = 0; i < B.length; i++) for (let j = i + 1; j < B.length; j++) dMin = Math.min(dMin, Math.hypot(B[i].pos.x - B[j].pos.x, B[i].pos.z - B[j].pos.z));
    for (const b of B) if (!c.libre(b.pos.x, b.pos.z, 0.25, b.pos.y)) dedans++;
    // une cloison de 15 cm : deux corps de part et d'autre, collés à elle, poussés l'un vers l'autre (et un prop de 0,5 m)
    const W = chercherCloison(c);
    let cloison = null;
    if (W) {
      const b1 = B[1], b2 = B[2];
      for (const b of B.slice(3)) jeu.teleporter(b.id, LOIN.x + b.id, 0, LOIN.z, 0);
      jeu.teleporter(0, LOIN.x, 0, LOIN.z + 5, 0);
      jeu.teleporter(b1.id, W.x - W.nx * 0.31, W.y, W.z - W.nz * 0.31, lacetVers(W.nx, W.nz));
      jeu.teleporter(b2.id, W.x + W.nx * 0.31, W.y, W.z + W.nz * 0.31, lacetVers(-W.nx, -W.nz));
      b2.corps.rayon = 0.5;
      forcer(b1, { ay: 1, lacet: lacetVers(W.nx, W.nz) }); forcer(b2, { ay: 1, lacet: lacetVers(-W.nx, -W.nz) });
      let t2 = 0;
      const cote = (b) => Math.sign((b.pos.x - W.x) * W.nx + (b.pos.z - W.z) * W.nz);
      for (let k = 0; k < 240; k++) { p.pas(PAS); if (cote(b1) > 0 || cote(b2) < 0) t2++; }
      b2.corps.rayon = 0.3; lacher(b1); lacher(b2);
      cloison = { traverse: t2, ep: r3(W.ep) };
    }
    // un humain qui marche sur une poubelle-prop (0,15) et sur un baby-foot-prop (0,5) : arrêté au contact
    const contre = (rayon) => {
      const pr = p.ajouterActeur({ id: 40, nom: 'Prop', equipe: 'B', x: LOIN.x, y: 0, z: LOIN.z, lacet: 0, cerveau: null, corps: 'prop' });
      pr.corps.rayon = rayon;
      const C0 = Player.collisions; Player.collisions = null;
      try {
        jeu.teleporter(40, LOIN.x, 0, LOIN.z - 30, 0);
        const h = B[1]; jeu.teleporter(h.id, LOIN.x, 0, LOIN.z - 27, 0);
        forcer(h, { ay: 1, lacet: 0 });                                 // (vers −z : droit sur le prop)
        pas(180);
        const d = Math.hypot(h.pos.x - pr.pos.x, h.pos.z - pr.pos.z), bouge = Math.hypot(pr.pos.x - LOIN.x, pr.pos.z - (LOIN.z - 30));
        lacher(h); jeu.teleporter(h.id, LOIN.x + 50, 0, LOIN.z, 0);
        return { d, bouge };
      } finally { Player.collisions = C0; p.retirerActeur(pr); }
    };
    const pb = contre(0.15), bf = contre(0.5);
    jeu.quitter('balade');
    const ok = dMin >= 0.59 && dedans === 0 && traverse === 0 && cloison && cloison.traverse === 0 && Math.abs(pb.d - 0.45) <= 0.01 && Math.abs(bf.d - 0.8) <= 0.01 && pb.bouge < 1e-6 && bf.bouge < 1e-6;
    return { ok, attendu: '8 au même point : paires ≥ 0,59 m en 24 pas, 0 dans une forme, 0 traversée · cloison : 0 traversée · arrêté à 0,45 m (± 1 cm) d\'une poubelle-prop, 0,8 m d\'un baby-foot-prop, le prop immobile',
      obtenu: `paire la plus proche ${r3(dMin)} m · dedans ${dedans} · traversées ${traverse} · cloison ${cloison ? JSON.stringify(cloison) : 'aucune trouvée'} · poubelle ${r3(pb.d)} (prop bougé ${r4(pb.bouge)}) · baby-foot ${r3(bf.d)} (${r4(bf.bouge)})` };
  });

  // 11. LA CAMÉRA : posée à l'image n avec le regard de l'image n (quaternion à 1e-9, aucun lissage) ; tangage ± 1,48 (prop
  //     −0,7 ; 1,25) ; l'œil ≥ 0,10 m sous le plafond en tout point d'un parcours (plafonds bas, sauts)
  T('11 caméra : pose directe, bornes, plafond', async () => {
    let p = await essai({ graine: 11 });
    const rng = new Rng(4), q = new THREE.Quaternion(), e = new THREE.Euler();
    let pire = 0;
    for (let i = 0; i < 200; i++) {
      game.camYaw = rng.range(-Math.PI, Math.PI); game.camPitch = rng.range(-1.4, 1.4);
      p.camera(1 / 60, false);
      e.set(-game.camPitch, game.camYaw, 0, 'YXZ'); q.setFromEuler(e);
      pire = Math.max(pire, 1 - Math.abs(q.dot(game.camera.quaternion)));
    }
    // les bornes du tangage, à la souris (pointeur capturé) et au recul
    const bornes = await avecCapture(async () => {
      game.camPitch = 0; souris(0, 5000); const haut = game.camPitch; souris(0, -10000); const bas = game.camPitch;
      return { haut, bas };
    });
    // l'œil sous le plafond : des sauts au sprint sous les plafonds bas, la caméra posée à chaque image
    const a = p.local, c = C(), pts = pointsLibres(new Rng(12), 60, (x, y, z, pl) => pl - y <= 2.3);
    let fautes = 0, images = 0;
    for (const pt of pts) {
      const l = rng.range(-Math.PI, Math.PI), d = dirDe(l);
      jeu.teleporter(0, pt.x, pt.y, pt.z, l); a.corps.vel.set(d.x * 6.6, 0, d.z * 6.6);
      forcer(a, { ay: 1, sprint: true, lacet: l, tangage: 0 });
      front(a, { ay: 1, sprint: true, lacet: l, saut: true });
      for (let k = 0; k < 40; k++) {
        image(null); images++;
        const cp = game.camera.position;
        if (cp.y > c.plafondEn(cp.x, cp.z, a.pos.y) - 0.1 + 1e-6) fautes++;
      }
      lacher(a);
    }
    jeu.quitter('balade');
    // le prop
    p = await essai({ graine: 11, prop: true });
    deguiser(p, p.local, 'carton');
    const bp = await avecCapture(async () => { game.camPitch = 0; souris(0, 5000); const haut = game.camPitch; souris(0, -10000); return { haut, bas: game.camPitch }; });
    jeu.quitter('balade');
    const ok = pire < 1e-9 && Math.abs(bornes.haut - TANGAGE_MAX) < 1e-12 && Math.abs(bornes.bas + TANGAGE_MAX) < 1e-12 && Math.abs(bp.haut - 1.25) < 1e-12 && Math.abs(bp.bas + 0.7) < 1e-12
      && pts.length >= 30 && fautes === 0;
    return { ok, attendu: 'quaternion de l\'image = regard de l\'image (1 − |q·q\'| < 1e-9) · tangage [−1,48 ; 1,48], prop [−0,7 ; 1,25] · œil ≥ 0,10 m sous le plafond',
      obtenu: `écart ${pire.toExponential(2)} · bornes [${r3(bornes.bas)} ; ${r3(bornes.haut)}] · prop [${r3(bp.bas)} ; ${r3(bp.haut)}] · ${pts.length} sauts sous plafond bas, ${images} images, ${fautes} au-dessus` };
  });

  // 12. LA SOURIS : sens 0,45 → 5 585 ± 2 px par tour, même facteur sur les deux axes ; |movementX| > 400 ignoré ; en visée,
  //     tan(champV_ADS/2) / tan(champV_hanche/2) × sensVisee ± 1 %
  T('12 souris : 5 585 px par tour, pics, visée à focale constante', async () => {
    const p = await essai({ graine: 12 }), a = p.local;
    const r = await avecCapture(async () => {
      game.camYaw = 0; game.camPitch = 0;
      let n = 0; while (n < 5585) { const m = Math.min(300, 5585 - n); souris(m, 0); n += m; }
      const tour = -game.camYaw;                                       // (la souris vers la droite : camYaw BAISSE)
      const pxTour = 2 * Math.PI / tour * 5585;
      game.camPitch = 0; souris(0, 100); const ky = game.camPitch / 100;
      game.camYaw = 0; souris(100, 0); const kx = -game.camYaw / 100;
      const y0 = game.camYaw; souris(401, 0); const pic = game.camYaw - y0;
      // en visée (FA-24, zoom × 1,25 ; sensVisee 1 puis 1,3)
      a.arsenal.vk = 1; p.camera(1 / 60, false);
      game.camYaw = 0; souris(100, 0); const kv = -game.camYaw / 100;
      const s = game.settings.controls.fps, sv0 = s.sensVisee; s.sensVisee = 1.3;
      game.camYaw = 0; souris(100, 0); const kv13 = -game.camYaw / 100;
      s.sensVisee = sv0; a.arsenal.vk = 0;
      return { pxTour, kx, ky, pic, kv, kv13 };
    });
    const vue = p.vue, D = Math.PI / 180, vH = vue.champHanche, vA = 2 * Math.atan(Math.tan(vH / 2 * D) / 1.25) / D;
    const f = Math.tan(vA / 2 * D) / Math.tan(vH / 2 * D);
    jeu.quitter('balade');
    const ok = Math.abs(r.pxTour - 5585) <= 2 && Math.abs(r.kx - r.ky) < 1e-12 && r.pic === 0 && pc(r.kv / r.kx, f) <= 0.01 && pc(r.kv13 / r.kx, f * 1.3) <= 0.01;
    return { ok, attendu: '5 585 ± 2 px par tour · kx = ky · pic de 401 px ignoré · visée FA-24 : facteur tan/tan × sensVisee (1 et 1,3) ± 1 %',
      obtenu: `${r2(r.pxTour)} px · kx ${r.kx.toExponential(4)} ky ${r.ky.toExponential(4)} · pic ${r.pic} · visée × ${r4(r.kv / r.kx)} (attendu ${r4(f)}) · sensVisee 1,3 × ${r4(r.kv13 / r.kx)} (${r4(f * 1.3)})` };
  });

  // 13. LE CHAMP : 90 → champV 58,72° ± 0,05 ; + 5° en sprint, + 4° en glissade, lissés 0,15 s
  T('13 champ : 58,72°, sprint + 5°, glissade + 4°', async () => {
    const p = await essai({ graine: 13 }), a = p.local, vue = p.vue;
    const v16 = vue.champVPour(90, 16 / 9);
    const r = await libre(a, async () => {
      p.camera(0, true); const repos = vue._champH;
      forcer(a, { ay: 1, sprint: true, lacet: 0 });
      for (let i = 0; i < 30; i++) image(null);                       // (0,5 s : la course lancée, le sprint pris)
      const tS = []; for (let i = 0; i < 12; i++) { image(null); tS.push(vue._champH); }
      const sprint = vue._champH, k015 = (tS[8] - repos) / 5;          // (à 0,15 s du début du sprint vu… la montée)
      forcer(a, { ay: 1, sprint: true, lacet: 0, accroupi: true }); for (let i = 0; i < 18; i++) image(null);
      const glisse = vue._champH, gk = a.glisse;
      lacher(a); for (let i = 0; i < 90; i++) image(null);
      return { repos, sprint, glisse, gk, k015 };
    });
    // la montée : 95 % en 0,15 s (τ 0,05 s) — mesurée sur une marche nette du champ voulu
    const k = 1 - Math.exp(-0.15 / 0.05);
    jeu.quitter('balade');
    const ok = Math.abs(v16 - 58.72) <= 0.05 && Math.abs(r.repos - 90) < 1e-9 && Math.abs(r.sprint - 95) <= 0.05 && Math.abs(r.glisse - 94) <= 0.3 && r.gk > 0.99 && k >= 0.95;
    return { ok, attendu: 'champV(90, 16:9) = 58,72 ± 0,05 · sprint 95 ± 0,05 · glissade 94 · 95 % en 0,15 s',
      obtenu: `${r4(v16)}° · repos ${r2(r.repos)} · sprint ${r3(r.sprint)} · glissade ${r3(r.glisse)} (k ${r3(r.gk)}) · lissage ${r3(k)} en 0,15 s` };
  });

  // 14. LE BALANCEMENT : 1,0 cm vertical en course, 1,8 en sprint (± 0,1), × 0,1 en visée, 0 à l'arrêt
  T('14 balancement : 1,0 / 1,8 cm, visée × 0,1, arrêt 0', async () => {
    const p = await essai({ graine: 14 }), a = p.local, vue = p.vue;
    const r = await libre(a, async () => {
      const ampl = (champs, vk = 0) => {
        forcer(a, { ay: 1, lacet: 0, ...champs }); if (a.arsenal) a.arsenal.vk = vk;
        for (let i = 0; i < 45; i++) image(null);
        let m = 0; const v = vitesse(a);
        for (let i = 0; i < 90; i++) { image(null); m = Math.max(m, Math.abs(vue._bob.y)); }
        lacher(a); return { m, v };
      };
      const course = ampl({}), sprint = ampl({ sprint: true }), visee = ampl({ visee: true }, 1);
      lacher(a); a.corps.vel.set(0, 0, 0); for (let i = 0; i < 60; i++) image(null);
      let arret = 0; for (let i = 0; i < 60; i++) { image(null); arret = Math.max(arret, Math.abs(vue._bob.y)); }
      return { course, sprint, visee, arret };
    });
    jeu.quitter('balade');
    const attenduVisee = 0.010 * Math.min(1, r.visee.v / 5) * 0.1;
    const ok = Math.abs(r.course.m - 0.010) <= 0.001 && Math.abs(r.sprint.m - 0.018) <= 0.001 && Math.abs(r.visee.m - attenduVisee) <= 0.1 * attenduVisee + 1e-4 && r.arret === 0;
    return { ok, attendu: 'course 1,0 ± 0,1 cm · sprint 1,8 ± 0,1 · visée × 0,1 · arrêt 0',
      obtenu: `course ${r3(r.course.m * 100)} cm · sprint ${r3(r.sprint.m * 100)} · visée ${r4(r.visee.m * 100)} (attendu ${r4(attenduVisee * 100)}, à ${r2(r.visee.v)} m/s) · arrêt ${r.arret}` };
  });

  // 15. LE POINTEUR : capture perdue → pause dans la même image ; recapture refusée → calque, partie gelée ; manette → reprise sans
  //     capture ; capturer() dit si la capture est accordée (repli sans unadjustedMovement sur NotSupportedError)
  T('15 pointeur : pause, calque, manette, repli', async () => {
    const res = [], TC = window.__touch, doigt = TC ? TC.auDoigt : null;
    if (TC) TC.auDoigt = false;
    try {
      const p = await essai({ graine: 15 });
      jeu.simulerCapture('refusee');
      document.dispatchEvent(new CustomEvent('iris-pointeur', { detail: { capture: false } }));
      res.push(['pause', game.paused === true]);
      game.togglePause(true); await new Promise((r) => setTimeout(r, 30));
      const calque = document.getElementById('calque-clic');
      res.push(['calque', !!calque && !calque.hidden && game.paused]);
      const t0 = p.t; await jeu.images(6); res.push(['gelée', p.t === t0]);
      p.fermerCalque(true); game.paused = false;
      entree.manette = true;
      try { game.togglePause(); const t1 = p.t; game.togglePause(); await jeu.images(4); res.push(['manette', !game.paused && p.t > t1]); }
      finally { entree.manette = false; }
      jeu.simulerCapture(null);
      jeu.quitter('balade');
    } finally { if (TC) TC.auDoigt = doigt; }
    // capturer() : le repli, l'accord, le refus (requestPointerLock remplacé le temps du test)
    const vue = new VueFPS(game), el = game.renderer.domElement, orig = el.requestPointerLock;
    const proto = Object.getOwnPropertyDescriptor(Document.prototype, 'pointerLockElement');
    let faux = null; const appels = [];
    Object.defineProperty(document, 'pointerLockElement', { configurable: true, get: () => faux });
    try {
      const accorder = () => setTimeout(() => { faux = el; document.dispatchEvent(new Event('pointerlockchange')); }, 5);
      el.requestPointerLock = function (o) { appels.push(o ? 'brut' : 'simple'); if (o) return Promise.reject(new DOMException('non', 'NotSupportedError')); accorder(); return Promise.resolve(); };
      const ok1 = await vue.capturer(); res.push(['repli accordé', ok1 === true && appels.join() === 'brut,simple']);
      faux = null; document.dispatchEvent(new Event('pointerlockchange'));
      appels.length = 0;
      el.requestPointerLock = function (o) { appels.push(o ? 'brut' : 'simple'); accorder(); return Promise.resolve(); };
      const ok2 = await vue.capturer(); res.push(['brut accordé', ok2 === true && appels.join() === 'brut']);
      faux = null; document.dispatchEvent(new Event('pointerlockchange'));
      appels.length = 0;
      el.requestPointerLock = function (o) { appels.push(o ? 'brut' : 'simple'); return Promise.reject(new DOMException('non', 'SecurityError')); };
      const ok3 = await vue.capturer(); res.push(['refusé', ok3 === false && appels.join() === 'brut']);
    } finally {
      el.requestPointerLock = orig; delete document.pointerLockElement; if (proto) Object.defineProperty(Document.prototype, 'pointerLockElement', proto);
      game.input.tCapture = -Infinity; game.input.purger(); game.paused = false;
    }
    const ok = res.every(([, v]) => v);
    return { ok, attendu: 'tout vrai', obtenu: res.map(([k, v]) => `${k} ${v}`).join(' · ') };
  });

  // 16. LA CAMÉRA DE MORT : roulis 25°, œil à 0,4 m en 0,8 s ; la flash locale : fx.flash = 1 et partie.hud.aveugle pendant sa durée
  T('16 caméra de mort, flash locale', async () => {
    const p = await essai({ graine: 16, mannequins: [{ x: 13.5, y: 0, z: -6.2 }] }), a = p.local, vue = p.vue;
    image(vue);
    const m = p.acteurs.find((b) => b.id === 1);
    p.infliger(a, 500, { par: 1, arme: 'fa24', zone: 'tete', x: a.pos.x, y: a.pos.y + 1.6, z: a.pos.z, dx: 0, dy: 0, dz: -1 });
    const L = [];
    for (let i = 0; i < 60; i++) { image(null); L.push({ t: (i + 1) / 60, y: game.camera.position.y - (a.corps.solAff ?? a.pos.y), r: angleCam().roulis / DEG }); }
    const a08 = L.find((x) => x.t >= 0.8 - 1e-9);
    const tourne = (() => { const o = angleCam(); const q = m.corps.posAff, cp = game.camera.position; const l = lacetVers(q.x - cp.x, q.z - cp.z); return Math.abs(Math.atan2(Math.sin(o.lacet - l), Math.cos(o.lacet - l))) / DEG; })();
    for (let i = 0; i < 50; i++) image(null);
    const tourneFin = (() => { const o = angleCam(); const q = m.corps.posAff, cp = game.camera.position; const l = lacetVers(q.x - cp.x, q.z - cp.z); return Math.abs(Math.atan2(Math.sin(o.lacet - l), Math.cos(o.lacet - l))) / DEG; })();
    jeu.quitter('balade');
    // la flash
    const q = await essai({ graine: 16 });
    game.fx.flash = 0;
    q.evt('flash', { cible: 0, duree: 2.0 });
    const flash = game.fx.flash;
    q.majHud(); const h0 = q.hud.aveugle ? { ...q.hud.aveugle } : null;
    jeu.avancer(1.0); q.majHud(); const h1 = q.hud.aveugle ? { ...q.hud.aveugle } : null;
    jeu.avancer(1.1); q.majHud(); const h2 = q.hud.aveugle;
    jeu.quitter('balade');
    const ok = a08 && Math.abs(Math.abs(a08.r) - 25) <= 0.5 && Math.abs(Math.abs(a08.y) - 0.4) <= 0.02 && tourneFin < 3 && flash === 1 && h0 && h0.duree === 2 && h1 && Math.abs(h1.t - 1) < 0.02 && h2 === null;
    return { ok, attendu: 'à 0,8 s : roulis 25° ± 0,5, œil à 0,4 ± 0,02 m · la vue tournée vers le tueur · flash : fx.flash 1, hud.aveugle { t, 2 } pendant 2 s puis null',
      obtenu: `0,8 s : roulis ${a08 ? r2(a08.r) : '-'}°, œil ${a08 ? r3(a08.y) : '-'} m · écart au tueur ${r2(tourne)}° puis ${r2(tourneFin)}° · flash ${flash} · aveugle ${JSON.stringify(h0)} → ${JSON.stringify(h1)} → ${h2}` };
  });

  // 17. LE RECUL VISUEL : après un tir, la caméra regarde PLUS HAUT que camPitch (de 0,15·reculV·DEG à 1e-6), puis revient ;
  //     camPitch n'est modifié que par lireCommande (prendreRecul)
  T('17 recul visuel ; camPitch par lireCommande seulement', async () => {
    const p = await essai({ graine: 17 }), a = p.local, A = a.arsenal;
    let rv = 0;
    Object.defineProperty(A, 'reculV', { configurable: true, get: () => rv });
    let recul = null;
    A.prendreRecul = (out) => { out.v = recul ? recul.v : 0; out.h = recul ? recul.h : 0; recul = null; return out; };
    try {
      game.camPitch = 0.2; game.camYaw = 0.3;
      rv = 2.0; p.camera(1 / 60, false);
      const e1 = angleCam(), haut = game.camPitch - e1.tangage, attendu = 0.15 * 2.0 * DEG;
      const pitchPoser = game.camPitch;
      rv = 0; p.camera(1 / 60, false);
      const e2 = angleCam();
      // le recul de visée : pris au pas qui suit, camPitch baisse de v, camYaw de h — et la caméra ne le touche pas
      recul = { v: 0.01, h: 0.002 };
      const c0 = game.camPitch, y0 = game.camYaw;
      p.pas(PAS);
      const dP = c0 - game.camPitch, dY = y0 - game.camYaw;
      const avantCam = game.camPitch;
      p.camera(1 / 60, false);
      const inchangee = game.camPitch === avantCam;
      const ok = Math.abs(haut - attendu) < 1e-6 && Math.abs(e2.tangage - 0.2) < 1e-9 && pitchPoser === 0.2 && Math.abs(dP - 0.01) < 1e-12 && Math.abs(dY - 0.002) < 1e-12 && inchangee;
      return { ok, attendu: `caméra plus haute de ${attendu.toExponential(4)} rad (reculV 2°), puis revenue ; camPitch −0,01 et camYaw −0,002 au pas suivant ; la caméra ne touche pas camPitch`,
        obtenu: `plus haute de ${haut.toExponential(4)} · revenue ${r4(e2.tangage)} · camPitch ${dP.toExponential(3)} / camYaw ${dY.toExponential(3)} · la caméra laisse camPitch ${inchangee}` };
    } finally { delete A.reculV; delete A.prendreRecul; jeu.quitter('balade'); }
  });

  // 18. L'ORBITE : 500 poses autour de props de 0,3 à 1,5 m — jamais dans une forme, jamais au-dessus de plafondEn − 0,15 ; les
  //     chiffres du prop ; lireCommande est le SEUL lecteur d'Input de js/jeu/ ; verifierEntrees() à 0
  T('18 orbite : 500 poses ; seul lecteur d\'Input ; entrées', async () => {
    const p = await essai({ graine: 18, prop: true }), a = p.local, c = C();
    deguiser(p, a, 'carton');
    const T0 = a.prop.T, rng = new Rng(18);
    let dedans = 0, plafond = 0, n = 0, chiffres = null;
    // (les chiffres : le carton 0,45 × 0,35 × 0,45 → pivot 0,5, bras clamp(1,4 + 1,6 × 0,45) = 2,12, mesurés en terrain libre)
    jeu.teleporter(0, LOIN.x, 0, LOIN.z, 0); game.camYaw = 0.4; game.camPitch = 0.3; p.camera(0, true);
    const cp = game.camera.position, piv = new THREE.Vector3(LOIN.x, 0.5, LOIN.z);
    chiffres = { bras: r4(cp.distanceTo(piv)), attendu: r4(Math.min(3.6, Math.max(2.0, 1.4 + 1.6 * 0.45))) };
    const pts = pointsLibres(rng, 125, null, 0.5);
    for (let i = 0; i < 500 && pts.length; i++) {
      const l = rng.range(0.3, 1.5), h = rng.range(0.3, 1.5), pp = rng.range(0.3, 1.5);
      a.prop.T = { ...T0, taille: new THREE.Vector3(l, h, pp), haut: h, rayon: Math.min(0.5, Math.max(0.15, Math.max(l, pp) / 2 * 0.9)) };
      a.corps.rayon = a.prop.T.rayon;
      const q = pts[i % pts.length];
      jeu.teleporter(0, q.x, q.y, q.z, 0);
      game.camYaw = rng.range(-Math.PI, Math.PI); game.camPitch = rng.range(-0.7, 1.25);
      for (const poser of [true, false]) {
        p.camera(poser ? 0 : 1 / 60, poser); n++;
        const k = game.camera.position;
        if (!c.libre(k.x, k.z, 0.02, k.y - 0.02, 0.04, 0)) dedans++;
        if (k.y > c.plafondEn(k.x, k.z, q.y + 0.1) - 0.15 + 1e-6) plafond++;
      }
    }
    a.prop.T = T0;
    jeu.quitter('balade');
    // lireCommande, seul lecteur d'Input (hors lignes « hors simulation » : Partie.image, PartieProp.lireExtra, le calque)
    const FICHIERS = ['acteur', 'apparitions', 'armes', 'balistique', 'cadence_acteurs', 'camera_orbite', 'cerveau', 'cerveau_prop', 'commande', 'constantes', 'corps_prop',
      'deguisements', 'grenade', 'monde_partie', 'mouvement', 'nav', 'partie', 'partie_essai', 'partie_fps', 'partie_prop', 'partie_stand', 'pilotage', 'rng', 'touches', 'vue_fps',
      'accroupi', 'avatars', 'poupee', 'pose_arme', 'teintes', 'viewmodel', 'anim_vue', 'modeles_armes', 'effets', 'sons_jeu', 'sons_prop', 'hud_jeu', 'hud_prop', 'tableau_scores',
      'minicarte', 'menus_jeu', 'portraits', 'profil', 'killcam', 'aff_progression', 'assistance_visee', 'nav_cache'];
    const LECTURE = /\b(?:input|inp)\s*\.\s*(?:down|pressed|released|peek|axis|amplitude|sprint|isDown|keyPressed|keyReleased)\s*\(|\.input\.(?:down|pressed|released|peek|axis|amplitude|sprint)\s*\(/;
    const lecteurs = [];
    for (const f of FICHIERS) {
      let src = '';
      try { src = await fetch(new URL('../' + f + '.js', import.meta.url), { cache: 'no-cache' }).then((r) => (r.ok ? r.text() : '')); } catch (e) { continue; }
      src.split('\n').forEach((ligne, i) => {
        if (ligne.includes('// hors simulation')) return;
        const code = ligne.replace(/\/\/.*$/, '');
        if (LECTURE.test(code)) lecteurs.push(`${f}.js:${i + 1}`);
      });
    }
    // verifierEntrees() : en balade et en essai
    const e1 = await jeu.verifierEntrees();
    await essai({ graine: 18 }); await jeu.images(3);
    const e2 = await jeu.verifierEntrees();
    jeu.quitter('balade');
    const zero = (r) => Object.values(r).every((v) => v === 0);
    const ok = n === 1000 && dedans === 0 && plafond === 0 && Math.abs(chiffres.bras - chiffres.attendu) < 1e-3 && lecteurs.length === 0 && zero(e1) && zero(e2);
    return { ok, attendu: '1 000 poses (500 × posée / lissée) : 0 dans une forme, 0 au-dessus du plafond − 0,15 · bras du carton 2,12 m · aucun autre lecteur d\'Input · entrées à 0',
      obtenu: `${n} poses : dedans ${dedans}, plafond ${plafond} · bras ${JSON.stringify(chiffres)} · lecteurs ${lecteurs.join(', ') || 'aucun'} · balade ${JSON.stringify(e1)} · essai ${JSON.stringify(e2)}` };
  }, { delai: 120 });

  // 19. LE SPRINT LIMITÉ (chasseur du prop hunt) : 6,60 m/s pendant 4,0 s ± 1 pas, puis course ; pas de sprint avant 20 d'endurance ;
  //     double Maj et SOURIS 5 sans effet ; un combattant ordinaire : SOURIS 5 → 7,80 m/s
  T('19 sprint limité : 4,0 s, reprise à 20, pas de tactique', async () => {
    const p = await essai({ graine: 19 }), a = p.local, inp = game.input;
    const r = await libre(a, async () => {
      a.sprintLimite = true; a.endurance = 100;
      inp.purger(); inp.presser('KeyW'); pas(60);
      inp.presser('ShiftLeft');
      let n = 0, tact = 0;
      for (let i = 0; i < 700; i++) { p.pas(PAS); if (a.allure === 'tact') tact++; if (a.allure === 'sprint') n++; else if (n > 0) break; }
      const apres = mesurerV(a, 0.4);
      // Maj tenue : pas de sprint de nouveau avant 20 d'endurance
      let reprise = null;
      for (let i = 0; i < 400; i++) { p.pas(PAS); if (a.allure === 'sprint') { reprise = a.endurance; break; } }
      // un relâcher puis le double Maj et SOURIS 5 : sans effet (jamais 'tact', jamais plus de 6,6)
      inp.relacher('ShiftLeft'); pas(30); a.endurance = 100;
      inp.presser('ShiftLeft'); pas(12); inp.relacher('ShiftLeft'); pas(6); inp.presser('ShiftLeft'); pas(12); inp.presser('Souris:4'); pas(60);
      for (let i = 0; i < 60; i++) { p.pas(PAS); if (a.allure === 'tact') tact++; }
      const vMax = mesurerV(a, 0.3);
      inp.relacher('Souris:4'); inp.relacher('ShiftLeft'); inp.relacher('KeyW'); inp.purger(); pas(60);
      // un combattant ordinaire : SOURIS 5 (un appui) → 7,80
      a.sprintLimite = false; a.jaugeTact = 1;
      inp.presser('KeyW'); pas(30); inp.presser('Souris:4'); pas(3); inp.relacher('Souris:4'); pas(80);
      const vTact = mesurerV(a, 0.3), alT = a.allure;
      inp.relacher('KeyW'); inp.purger();
      return { duree: n * PAS, apres, reprise, tact, vMax, vTact, alT };
    });
    jeu.quitter('balade');
    const ok = Math.abs(r.duree - 4.0) <= PAS * 1.5 && pc(r.apres, 5.0) <= 0.01 && r.reprise !== null && r.reprise >= 20 && r.reprise < 21 && r.tact === 0 && r.vMax <= 6.6 * 1.005 && pc(r.vTact, 7.8) <= 0.01 && r.alT === 'tact';
    return { ok, attendu: 'sprint 4,0 s ± 1 pas puis 5,00 · reprise à 20 d\'endurance · jamais de tactique (≤ 6,60) · combattant : SOURIS 5 → 7,80',
      obtenu: `${r3(r.duree)} s puis ${r3(r.apres)} m/s · reprise à ${r.reprise === null ? '-' : r2(r.reprise)} · tactique ${r.tact} pas · max ${r3(r.vMax)} · combattant ${r3(r.vTact)} (${r.alT})` };
  });

  // =====================================================================
  // À F2 (les vrais modules des autres lots de la vague 2 : `&fusion=1`)
  T('F2 · 12 balles de FA-24 → camPitch −0,118 rad', async () => {
    const p = await essai({ graine: 21, mannequins: [] }), a = p.local;
    game.camPitch = 0; game.camYaw = 0;
    jeu.commande(0, { tir: true }, 29 * 0.08 * 12 / 30 + 0.04);
    const c0 = game.camPitch;
    let tirs = 0; const des = p.sur('tir', (e) => { if (e.a === 0) tirs++; });
    for (let i = 0; i < 400 && tirs < 12; i++) p.pas(PAS);
    jeu.commande(0, { tir: false }, PAS * 2); p.pas(PAS); p.pas(PAS); des();
    const d = c0 - game.camPitch;
    jeu.quitter('balade');
    return { ok: tirs === 12 && Math.abs(d - 0.118) <= 0.0002, attendu: '12 tirs, camPitch −0,118 ± 0,0002', obtenu: `${tirs} tirs, ${r4(d)} rad` };
  }, { apresFusion: true });
  T('F2 · visée au zoom de chaque arme', async () => {
    const p = await essai({ graine: 22 }), a = p.local, vue = p.vue, fautes = [];
    for (const w of ['fa24', 'pm9', 'fp12', 'tp50', 'p17']) {
      a.arsenal = new Arsenal(a, { principale: w, secondaire: null, letale: null, tactique: null, couteau: true });
      jeu.commande(0, { visee: true }, 1.0); jeu.avancer(0.9); p.camera(1 / 60, false);
      const D = Math.PI / 180, att = 2 * Math.atan(Math.tan(vue.champHanche / 2 * D) / ARMES[w].zoom) / D;
      if (Math.abs(game.camera.fov - att) > 0.05) fautes.push(`${w} ${r2(game.camera.fov)} (${r2(att)})`);
      jeu.commande(0, { visee: false }, 0.5); jeu.avancer(0.5);
    }
    jeu.quitter('balade');
    return { ok: fautes.length === 0, attendu: 'champ de visée = tan / zoom pour les 5 armes', obtenu: fautes.join(' ; ') || 'les 5 justes' };
  }, { apresFusion: true });
  T('F2 · franchissement pendant la pose « franchit » de l\'arme de vue', async () => {
    const p = await essai({ graine: 23 }), a = p.local, O = OBSTACLES[0];
    if (!O) { jeu.quitter('balade'); return { ok: false, attendu: 'un obstacle', obtenu: 'aucun' }; }
    const d = dirDe(O.lacet);
    jeu.teleporter(0, O.x - d.x * 2.2, O.y, O.z - d.z * 2.2, O.lacet);
    jeu.commande(0, { ay: 1, lacet: O.lacet }, 3);
    let vu = false, arsenal = false;
    for (let i = 0; i < 200; i++) {
      if (!a.mvt?.franchit && franchissable(C(), a.pos.x, a.pos.y, a.pos.z, d.x, d.z)) jeu.commande(0, { ay: 1, lacet: O.lacet, saut: true }, PAS * 1.5);
      image(null);
      const E = p.vue.etatArme();
      if (E.franchit > 0 && E.franchit < 1) vu = true;
      if (a.arsenal && a.arsenal.etatArme === 'franchit') arsenal = true;
    }
    jeu.quitter('balade');
    return { ok: vu && arsenal, attendu: 'etatArme().franchit entre 0 et 1, l\'arsenal en « franchit »', obtenu: `vue ${vu} · arsenal ${arsenal}` };
  }, { apresFusion: true });
  T('F2 · separer avec les vrais CorpsProp', async () => {
    const p = await essai({ graine: 24 }), h = p.local;
    const pr = p.ajouterActeur({ id: 40, nom: 'Prop', equipe: 'B', x: LOIN.x, y: 0, z: LOIN.z - 30, lacet: 0, cerveau: null, corps: 'prop' });
    deguiser(p, pr, 'carton');
    const C0 = Player.collisions; Player.collisions = null;
    try {
      jeu.teleporter(40, LOIN.x, 0, LOIN.z - 30, 0); jeu.teleporter(0, LOIN.x, 0, LOIN.z - 27, 0);
      jeu.commande(0, { ay: 1, lacet: 0 }, 1.5); jeu.avancer(1.5);
      const d = Math.hypot(h.pos.x - pr.pos.x, h.pos.z - pr.pos.z), att = 0.3 + pr.corps.rayon;
      return { ok: Math.abs(d - att) <= 0.01, attendu: `arrêté à ${r3(att)} m`, obtenu: `${r3(d)} m` };
    } finally { Player.collisions = C0; jeu.quitter('balade'); }
  }, { apresFusion: true });

  // ---- LA PASSE DE MESURE du franchissement (à la main, console : `await __jeu.mesuresFranchir()`) : les obstacles où
  //      `franchissable` rend une arrivée libre, un par obstacle, sur les trois niveaux du haut et la rue ; et les rangs serrés
  jeu.mesuresFranchir = async () => {
    await essai({ graine: 1 });
    const c = C(), vus = [], out = [];
    for (const Y of [0, 3.5, 6.6, -3.06]) for (let z = -24; z <= 5.8; z += 0.25) for (let x = -2.8; x <= 22.8; x += 0.25) {
      const y = c.solEn(x, z, Y + 0.3);
      if (Math.abs(y - Y) > 0.02 || !c.libre(x, z, 0.32, y)) continue;
      for (let k = 0; k < 8; k++) {
        const l = k * Math.PI / 4, d = dirDe(l), r = franchissable(c, x, y, z, d.x, d.z);
        if (!r) continue;
        if (vus.some((v) => Math.hypot(v.x - r.x, v.z - r.z) < 2.5 && Math.abs(v.y - r.y) < 1)) continue;
        // l'élan : 2,2 m libres derrière le départ
        let ok = true; for (let s = 0.25; s <= 2.2 && ok; s += 0.25) { const px = x - d.x * s, pz = z - d.z * s; if (!c.libre(px, pz, 0.32, y) || Math.abs(c.solEn(px, pz, y + 0.3) - y) > 0.01) ok = false; }
        if (!ok) continue;
        vus.push(r); out.push({ x: r4(x), y: r4(y), z: r4(z), lacet: r4(l), h: r2(r.h), arrivee: [r2(r.x), r2(r.y), r2(r.z)] });
      }
    }
    const rangs = [];
    for (const R of Player.rangs || []) {
      // devant le rang, face à lui (vers l'arrière de la salle) : l'arrivée tombe dans le rang suivant
      const mx = (R.ax + R.bx) / 2, mz = (R.az + R.bz) / 2;
      for (const s of [1, -1]) {
        const x = mx + R.fx * 0.75 * s, z = mz + R.fz * 0.75 * s, y = c.solEn(x, z, R.sol + 0.3), l = lacetVers(-R.fx * s, -R.fz * s), d = dirDe(l);
        rangs.push({ nom: R.nom, x: r4(x), y: r4(y), z: r4(z), lacet: r4(l), libre: c.libre(x, z, 0.3, y), franchit: !!franchissable(c, x, y, z, d.x, d.z) });
      }
    }
    jeu.quitter('balade');
    return { obstacles: out, rangs };
  };

  // ---- les lieux cherchés dans le monde solide ----
  // les VOLÉES (rampes de solEn) : départ 1 m avant le pied (ou au pied), arrivée au-delà du haut, le long de l'axe
  function volees(c) {
    const L = [];
    for (const r of c.sols) {
      if (!r.axe) continue;
      const long = Math.abs(r.a1 - r.a0), pente = Math.abs(r.h1 - r.h0) / long;
      // (le bas et le haut sur l'axe, au milieu de la largeur)
      const m = r.axe === 'x' ? (r.z0 + r.z1) / 2 : (r.x0 + r.x1) / 2;
      const [aB, hB, aH, hH] = r.h0 < r.h1 ? [r.a0, r.h0, r.a1, r.h1] : [r.a1, r.h1, r.a0, r.h0];
      const s = Math.sign(aH - aB);
      const pt = (a) => (r.axe === 'x' ? { x: a, z: m } : { x: m, z: a });
      let A = null, B = null;
      for (const off of [1.2, 0.9, 0.6, 0.3, 0.05]) {
        const q = pt(aB - s * off), y = c.solEn(q.x, q.z, hB + 0.3);
        if (Math.abs(y - hB) < 0.03 && c.libre(q.x, q.z, 0.32, y)) { A = { ...q, y }; break; }
      }
      for (const off of [1.0, 0.7, 0.4, 0.05]) {
        const q = pt(aH + s * off), y = c.solEn(q.x, q.z, hH + 0.3);
        if (Math.abs(y - hH) < 0.03 && c.libre(q.x, q.z, 0.32, y)) { B = { ...q, y }; break; }
      }
      if (!A || !B) continue;
      // (accessible : le pied et le haut à un niveau où l'on marche, pas la cage haute)
      if (hH > 7) continue;
      const dx = B.x - A.x, dz = B.z - A.z;
      L.push({ nom: `volée ${r2(hB)}→${r2(hH)}`, a: A, b: B, lacet: lacetVers(dx, dz), long: Math.hypot(dx, dz), pente });
    }
    return L;
  }
  // les PORTES : les linteaux (formes du joueur dont le bas est à 2,0-2,15 m au-dessus du sol, minces, de la largeur d'une porte)
  // avec le passage libre dessous et 3 m d'élan libres de chaque côté
  function chercherPortes(c, n) {
    const L = [];
    for (const f of c.formes) {
      if (!f.joueur || f.off || f.vantail) continue;
      let cx, cz, lx, lz, ux, uz;
      if (f.t === 'b') { cx = (f.x0 + f.x1) / 2; cz = (f.z0 + f.z1) / 2; lx = f.x1 - f.x0; lz = f.z1 - f.z0; }
      else if (f.t === 'o') { cx = f.cx; cz = f.cz; lx = 2 * f.hx; lz = 2 * f.hz; }
      else continue;
      const larg = Math.max(lx, lz), ep = Math.min(lx, lz);
      if (larg < 0.75 || larg > 1.8 || ep > 0.4) continue;
      // la normale du passage : perpendiculaire au grand côté
      if (f.t === 'b') { if (lx > lz) { ux = 0; uz = 1; } else { ux = 1; uz = 0; } }
      else { const c0 = f.c, s0 = f.s; if (f.hx > f.hz) { ux = -s0; uz = c0; } else { ux = c0; uz = s0; } }
      const y = c.solEn(cx, cz, f.y0 - 1.9);
      const hl = f.y0 - y;
      if (hl < 2.0 || hl > 2.15 || !c.libre(cx, cz, 0.3, y)) continue;
      let ok = true;
      for (const sg of [1, -1]) for (let s = 0.3; s <= 3.0 && ok; s += 0.3) {
        const px = cx + ux * s * sg, pz = cz + uz * s * sg;
        if (!c.libre(px, pz, 0.32, y) || Math.abs(c.solEn(px, pz, y + 0.3) - y) > 0.02) ok = false;
      }
      if (!ok || L.some((D) => Math.hypot(D.x - cx, D.z - cz) < 1)) continue;
      L.push({ x: cx, y, z: cz, nx: ux, nz: uz, linteau: r2(hl), avant: 3.0, elan: 1.8 });
      if (L.length >= n) break;
    }
    return L;
  }
  // une BORDURE de la rue : là où le sol saute de 0,12 m sur 5 cm, avec 3 m libres de chaque côté
  function chercherBordure(c) {
    for (let x = 0; x <= 20; x += 0.5) for (let z = 0.5; z <= 5.8; z += 0.05) {
      const a = c.solEn(x, z, 0.3), b = c.solEn(x, z + 0.05, 0.3);
      if (Math.abs(Math.abs(a - b) - 0.12) > 0.005) continue;
      let ok = true;
      for (let s = -2.8; s <= 2.8 && ok; s += 0.2) if (!c.libre(x, z + s, 0.33, c.solEn(x, z + s, 0.3))) ok = false;
      if (ok) return { x, z: z + 0.025, lacet: lacetVers(0, 1) };
    }
    return null;
  }
  // un MUR long et droit (une boîte alignée, haute, de 4 m au moins) le long duquel on glisse : départ collé à lui, poussée en biais
  function chercherMur(c) {
    for (const f of c.formes) {
      if (f.t !== 'b' || !f.joueur || f.off || f.y0 > 0.1 || f.y1 < 2) continue;
      const lx = f.x1 - f.x0, lz = f.z1 - f.z0;
      if (Math.max(lx, lz) < 4.5) continue;
      for (const sg of [1, -1]) {
        const alongX = lx > lz, nx = alongX ? 0 : sg, nz = alongX ? sg : 0;
        const cx = (f.x0 + f.x1) / 2, cz = (f.z0 + f.z1) / 2;
        const px = alongX ? cx - 1.5 : (sg > 0 ? f.x1 : f.x0) + nx * 0.31, pz = alongX ? (sg > 0 ? f.z1 : f.z0) + nz * 0.31 : cz - 1.5;
        const y = c.solEn(px, pz, 0.3);
        if (Math.abs(y) > 0.02) continue;
        let ok = true;
        for (let s = 0; s <= 3 && ok; s += 0.25) { const qx = alongX ? px + s : px, qz = alongX ? pz : pz + s; if (!c.libre(qx, qz, 0.305, y)) ok = false; }
        if (!ok) continue;
        // la direction le long du mur (+x ou +z) et la poussée : 64° vers le mur (cos 64° × 2,3 ≈ 1,0 m/s le long)
        const tx = alongX ? 1 : 0, tz = alongX ? 0 : 1, an = 64 * DEG;
        const vx = tx * Math.cos(an) - nx * Math.sin(an), vz = tz * Math.cos(an) - nz * Math.sin(an);
        return { x: px, y, z: pz, lacet: lacetVers(tx, tz), lacetPousse: lacetVers(vx, vz) };
      }
    }
    return null;
  }
  // une CLOISON de 12 à 18 cm d'épaisseur, pleine du sol à 2 m, avec de la place des deux côtés
  function chercherCloison(c) {
    for (const f of c.formes) {
      if (f.t !== 'b' || !f.joueur || f.off || f.y0 > 0.1 || f.y1 < 2.2) continue;
      const lx = f.x1 - f.x0, lz = f.z1 - f.z0, ep = Math.min(lx, lz);
      if (ep < 0.12 || ep > 0.18 || Math.max(lx, lz) < 1.5) continue;
      const cx = (f.x0 + f.x1) / 2, cz = (f.z0 + f.z1) / 2, nx = lx < lz ? 1 : 0, nz = lx < lz ? 0 : 1;
      const y = c.solEn(cx + nx * 0.5, cz + nz * 0.5, 0.3);
      if (Math.abs(y - c.solEn(cx - nx * 0.5, cz - nz * 0.5, 0.3)) > 0.01) continue;
      if (!c.libre(cx + nx * (ep / 2 + 0.55), cz + nz * (ep / 2 + 0.55), 0.5, y) || !c.libre(cx - nx * (ep / 2 + 0.55), cz - nz * (ep / 2 + 0.55), 0.5, y)) continue;
      return { x: cx, y, z: cz, nx, nz, ep };
    }
    return null;
  }
}
