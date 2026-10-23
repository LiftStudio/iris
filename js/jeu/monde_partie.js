// =====================================================================
//  LE MONDE EN PARTIE (lot L-M, 23/10 ; spec §§ 3.10, 4.5.19, 5.3, 5.5.14 — squelette du socle S0, 22/10)
// =====================================================================
// L'école mise en état de partie, puis rendue EXACTEMENT telle qu'en balade. Ce que la partie change au monde :
//   - LES PORTES, par une TABLE par mode (TABLE_PORTES_FPS, TABLE_PORTES_PROP : chacune des 43 portes de la carte sous son
//     nom stable, js/ecole_portes.js liste). Au combat, figées : ouvertes sur les chemins — avec une boîte mince SOLIDE le
//     long du vantail ouvert (on ne traverse plus un vantail, ni une balle) —, fermées sur les culs-de-sac (toilettes,
//     locaux : des pièces à camper). Au prop hunt, les portes de pièce « automatiques pour tous les acteurs » — n'importe
//     quel acteur vivant à moins de 2,1 m, à son niveau, l'ouvre : « la porte qui s'ouvre seule » est un indice —, animées
//     dans Partie.pas (étape 5 : déterministes, sérialisables, { k, sens }). Une porte qu'aucune table ne connaît (le lot R
//     en ajoute au −1) suit `regleParDefaut` et va dans `inconnues`. Les portes de la FRONTIÈRE de la zone de jeu sont
//     fermées, quel que soit le mode. `Portes.pilotees` : la carte vivante ne les touche plus.
//   - LES BARRIÈRES de la zone : une boîte mince par passage frontière, tirée des 46 passages d'une pièce à l'autre
//     (carte_monde § 7) — posée SUR la limite des deux pièces (lumieres.zoneEn), d'un bout libre à l'autre du passage —,
//     qui arrête les corps (Haythem, bots, props) mais ni la caméra ni les balles (`camera: false, balle: false`,
//     `limite: 'a|b'`) ; et sa RUBALISE (deux rubans rouge et blanc, un InstancedMesh, un appel de dessin).
//   - L'ASCENSEUR coupé (portes palières fermées, des murs), la RUE bornée (`joueur.bounds = BORNES_JEU`), la GLACE de
//     l'accueil peinte (son rendu redessinait le décor tous les 25 cm de caméra : 8-9 ms sur la 660M, une image sur deux),
//     les VITRES DÉPOLIES marquées `depoli` (TABLE_DEPOLIS : la balle les traverse, la vue non), les pièces fermées du RDC
//     montrées quand une porte pilotée est ouverte (js/ecole_visibilite.js `forcees`).
// HORS PARTIE, le monde solide est celui de la balade AU BIT PRÈS : les formes de partie (barrières, vantaux) ne sont dans
// `C.formes` et sa grille que pendant une partie — rangées à l'entrée, retirées à la sortie (le monde solide n'a pas de
// quoi retirer une forme : on l'éteint ; mais une forme éteinte de plus compterait dans `instantane().formesOff`, comparé à
// la référence de a8b22dd, et dans l'empreinte du graphe). `avecVantaux(fn)` les range le temps d'une génération du graphe.
// Simulation (Partie.pas) : majPortes, verrouiller, noeudsAutorises, etat / appliquer — ni hasard, ni horloge, ni entrées.
// L'affichage : image (les vantaux posés d'après `k`, la rubalise au vent).
import * as THREE from 'three';
import { BORNES_JEU, ZONES_JEU, PIECES } from './constantes.js';
import { ANGLE_AUTO, RAYON_AUTO, DUREE } from '../ecole_portes.js';
import { instantane as instantaneAscenseur, restaurer as restaurerAscenseur, couper as couperAscenseur } from '../ecole_ascenseur.js';

// ---------------------------------------------------------------- LES TABLES
// LE COMBAT : 'ouverte' | 'fermee' (nom stable → règle). Les portes automatiques de la balade sont les seules qui
// changent ; les autres gardent l'état de leur construction (une porte cousue avec le décor ne s'ouvre pas), écrit ici
// pour que la table les dise TOUTES (relevé du 23/10 sur socle-ok : 16 automatiques, 27 fixes).
export const TABLE_PORTES_FPS = {
  // les automatiques (16) : ouvertes sur les chemins (la coupe-feu du 2e est son SEUL accès), fermées sur les culs-de-sac
  'entrée n° 6': 'ouverte', 'passage': 'ouverte', 'coupe-feu du 2e': 'ouverte', 'salle 1 du 2e (S 2.7)': 'ouverte',
  'salle 2 du 2e (S 2.8)': 'ouverte', 'salle David Clark': 'ouverte', 'hall -1 → pause': 'ouverte', 'grande salle S -1.14': 'ouverte',
  'Si 0.1': 'ouverte', 'bureau B': 'ouverte', 'service (hall)': 'ouverte',
  'toilettes femmes': 'fermee', 'toilettes hommes': 'fermee', 'toilettes PMR': 'fermee', 'local (C01)': 'fermee', 'service (passage)': 'fermee',
  // les fixes (27), comme la carte les a construites
  'escalier': 'ouverte', 'couloir est (hall)': 'ouverte', 'vestibule est': 'ouverte', 'vestibule est (petit vantail)': 'ouverte',
  'palier est (couloir du 1er)': 'ouverte', '1er étage': 'ouverte', 'salle Robert Kahn Si 1.4': 'ouverte', 'espace pause (porte du fond)': 'ouverte',
  'salle S 1.3': 'ouverte', 'palier -1 (escalier est)': 'ouverte', 'palier -1 (petit vantail)': 'ouverte',
  'porte noire': 'fermee', 'gaine technique': 'fermee', 'fond du C01': 'fermee', 'couloir est (semi-fixe)': 'fermee', 'palier est (semi-fixe)': 'fermee',
  'local ménage': 'fermee', 'salle S 1.3 (recoin)': 'fermee', 'espace pause (semi-fixe du fond)': 'fermee', 'bureau (travée 1)': 'fermee',
  'Si 1.4 (porte du mur ouest)': 'fermee', '2e étage (dégagement ouest)': 'fermee', 'bureau des conseillers B 2.3': 'fermee',
  'salle Bjarne Stroustrup Si 2.6': 'fermee', 'local électrique (-1)': 'fermee', 'réservé au personnel (sas, sud)': 'fermee',
  'réservé au personnel (sas, ouest)': 'fermee',
};
// LE PROP HUNT : 'auto' | 'fermee' | 'ouverte'. Les portes de pièce s'ouvrent pour tous ; la porte 6 est fermée (la rue est
// hors du prop hunt) ; les culs-de-sac aussi ; une porte de la frontière de la zone l'est à l'entrée (la grise du hall ouest :
// « auto » dans toute l'école, fermée au −1 et au RDC)
export const TABLE_PORTES_PROP = {
  ...TABLE_PORTES_FPS,
  'entrée n° 6': 'fermee', 'passage': 'auto', 'coupe-feu du 2e': 'auto', 'salle 1 du 2e (S 2.7)': 'auto', 'salle 2 du 2e (S 2.8)': 'auto',
  'salle David Clark': 'auto', 'hall -1 → pause': 'auto', 'grande salle S -1.14': 'auto', 'Si 0.1': 'auto', 'bureau B': 'auto', 'service (hall)': 'auto',
};
// LES VITRES DÉPOLIES parmi les 51 formes `vitre` (carte_monde § 9.7) et les portes vitrées dépolies — relevées une à une le
// 23/10 (centre de la forme, ± 5 cm) : la balle les traverse (× 0,8), la vue s'y arrête (Balistique.vue, L-A)
export const TABLE_DEPOLIS = [];

// ---------------------------------------------------------------- LES 46 PASSAGES
// d'une pièce à l'autre (carte_monde § 7 : les liens du graphe dont les deux bouts sont dans deux pièces ; centre en PLAN x,
// y, hauteur ; nombre de liens ≈ largeur) — d'où les barrières de chaque zone et le graphe des pièces de noeudsAutorises
const P_PLAN = [['attente|bureauB', 12.88, 2.5, 0, 2], ['attente|c01', 12.47, 7.78, 0, 34], ['attente|hall', 13.25, 3.63, 0, 38],
  ['attente|hallO', 5.75, 6.62, 0, 50], ['attente|si01', 10, 3.52, 0, 8], ['c01|local', 11.5, 9, 0, 8], ['c01|pmr', 11.49, 11.21, 0, 10],
  ['c05|dc', 5.14, 12.74, 0, 14], ['c05|hallO', 5.25, 9, 0, 20], ['c05|wcH', 6, 11, 0, 8], ['couloirEst|descenteEst', 17, 9.88, -0.12, 18],
  ['couloirEst|hall', 15.22, 7.49, 0, 8], ['couloirEst|vestEst', 15.19, 10.75, 0, 10], ['couloirSS|hallSS', 2, 10, -3.06, 8],
  ['descenteEst|escEstSS', 18.75, 9.88, -1.45, 26], ['e1couloir|e1pause', 4.75, 5.69, 3.5, 10], ['e1couloir|palier1', 1.38, 6.75, 3.05, 14],
  ['e1est|e1pause', 13.5, 8.03, 3.5, 18], ['e1est|escEst2', 16.03, 10.51, 3.49, 62], ['e1kahn|e1pause', 10.44, 13, 3.5, 4],
  ['e1pause|e1salle', 10.83, 5.01, 3.5, 10], ['e2couloir|e2s1', 12.45, 6.49, 6.6, 10], ['e2couloir|e2s2', 10.54, 4.49, 6.6, 10],
  ['e2couloir|e2sas', 14.62, 6.49, 6.6, 30], ['e2palier|e2sas', 14.75, 8, 6.6, 8], ['e2palier|escEst3', 16, 9.88, 6.6, 26],
  ['escEst|escEst2', 17.5, 9.88, 2.46, 26], ['escEst|vestEst', 16, 11.63, 0, 26], ['escEst2|escEst3', 17, 9.88, 6.02, 26],
  ['escEstSS|palierSSE', 17, 11.63, -2.93, 26], ['escalier|hallO', 2.96, 9.01, 0, 10], ['escalier|palier1', 1.36, 9, 1.98, 14],
  ['escalierSS|hallSS', 0.81, 10, -2.91, 8], ['escalierSS|palierSS', 0.83, 5.98, -0.09, 4], ['hall|porche', 15.13, 0.75, 0, 38],
  ['hallO|palierSS', 1.5, 5.49, 0, 8], ['hallO|passage', 3.55, 4, 0, 42], ['hallO|wcF', 6, 8.5, 0, 8], ['hallSS|pauseSS', 2.51, 10.79, -3.06, 10],
  ['palierSSE|sasSS', 15.38, 10.75, -3.06, 18], ['passage|rue', 3.26, -0.5, 0, 44], ['passage|service', 1.5, 1.3, 0, 10],
  ['passageSS|pauseSS', 13.01, 8.74, -3.06, 20], ['passageSS|sasSS', 13.99, 9.74, -3.06, 20], ['pauseSS|salleSS', 9.76, 14.5, -3.06, 8],
  ['porche|rue', 14.83, -0.5, 0, 60]];
export const PASSAGES_PIECES = P_PLAN.map(([cle, x, y, h, liens]) => { const [a, b] = cle.split('|'); return { cle, a, b, x, y: h, z: -y, liens }; });

// ---------------------------------------------------------------- LES RÈGLES
const modeDe = (m) => (m === 'prop' || m === 'prophunt' ? 'prop' : 'combat');
const _pieces = new Map();
// les pièces d'une zone de jeu : un Set, ou null (« toutes », '*'), ou undefined (zone inconnue : rien de restreint)
function piecesDe(zoneJeu) {
  const Z = ZONES_JEU[zoneJeu];
  if (!Z) return undefined;
  if (!_pieces.has(zoneJeu)) _pieces.set(zoneJeu, Z.pieces === '*' ? null : new Set(Z.pieces));
  return _pieces.get(zoneJeu);
}
// (une pièce nulle — hors de toute pièce — n'est « dans » la zone que pour une zone de toute l'école)
const dansZone = (pieces, id) => (pieces === null ? true : !!(pieces && id && pieces.has(id)));
// les lumières de la carte (leur zoneEn), posées par MondePartie : regleParDefaut s'en sert pour les côtés d'une porte
let _lum = null;
// LES DEUX CÔTÉS d'une porte : la pièce à 0,6 m de part et d'autre de son centre, le long de sa normale (0,9 puis 1,2 m si
// le premier point tombe hors de toute pièce : dans un mur épais) ; gardés sur la porte (`cotes`)
export function cotesPorte(porte, lumieres = _lum) {
  if (porte.cotes) return porte.cotes;
  const L = lumieres; if (!L || !L.zoneEn) return [null, null];
  const y = (porte.base || 0) + 0.1, c = [];
  for (const s of [-1, 1]) {
    let id = null;
    for (const d of [0.6, 0.9, 1.2]) { const Z = L.zoneEn(porte.cx + s * d * porte.nx, porte.cz + s * d * porte.nz, y); if (Z) { id = Z.id; break; } }
    c.push(id);
  }
  return (porte.cotes = c);
}
// une porte ABSENTE des tables (le lot R en ajoute ou en déplace au −1) : au combat ouverte si ses deux côtés sont dans la
// zone, fermée sinon ; au prop hunt, automatique (MondePartie la note dans `inconnues`)
export function regleParDefaut(porte, zoneJeu, mode) {
  if (modeDe(mode) === 'prop') return 'auto';
  const P = piecesDe(zoneJeu), [a, b] = cotesPorte(porte);
  return P === undefined || (dansZone(P, a) && dansZone(P, b)) ? 'ouverte' : 'fermee';
}

// ---------------------------------------------------------------- LE MONDE SOLIDE DE PARTIE
// (rangées : Collisions._ranger — id, boîte englobante, cases de la grille ; les clés de cases neuves gardées pour être
// retirées à la sortie, la grille rendue telle qu'avant)
function ranger(C, formes) {
  const avant = new Set(C.grille.keys());
  for (const f of formes) C._ranger(f);
  const neuves = [];
  for (const k of C.grille.keys()) if (!avant.has(k)) neuves.push(k);
  return neuves;
}
function retirer(C, formes, neuves = []) {
  if (!formes.length) return;
  const S = new Set(formes);
  let j = 0;
  for (const f of C.formes) if (!S.has(f)) C.formes[j++] = f;
  C.formes.length = j;
  for (const L of C.grille.values()) {
    let n = 0, vu = false;
    for (const f of L) { if (S.has(f)) vu = true; else L[n++] = f; }
    if (vu) L.length = n;
  }
  for (const k of neuves) { const L = C.grille.get(k); if (L && !L.length) C.grille.delete(k); }
}
// une forme faite par le monde solide (ses champs, sa boîte) puis tout de suite retirée : elle attend la partie
function horsMonde(C, faire) {
  const avant = new Set(C.grille.keys()), f = faire();
  const neuves = []; for (const k of C.grille.keys()) if (!avant.has(k)) neuves.push(k);
  retirer(C, [f], neuves);
  return f;
}

// ---------------------------------------------------------------- LA RUBALISE (affichage)
const RUBAN = { h: 0.05, ep: 0.004, seg: 0.5, hauts: [0.92, 1.18], max: 1024 };
function texRubalise() {
  const cv = document.createElement('canvas'); cv.width = 128; cv.height = 16;
  const g = cv.getContext('2d');
  g.fillStyle = '#f4f1ea'; g.fillRect(0, 0, 128, 16);
  g.fillStyle = '#d3242b';
  for (let x = -16; x < 144; x += 32) { g.beginPath(); g.moveTo(x, 16); g.lineTo(x + 16, 16); g.lineTo(x + 32, 0); g.lineTo(x + 16, 0); g.closePath(); g.fill(); }
  // (le liseré et le grain du plastique)
  g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(0, 0, 128, 1); g.fillRect(0, 15, 128, 1);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; t.anisotropy = 4;
  return t;
}

const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _e = new THREE.Euler();
const _a = new THREE.Vector3(), _b = new THREE.Vector3();

export class MondePartie {
  constructor(game) {
    this.game = game; this.pret = false;
    this.zone = null; this.mode = null; this.table = null; this.bornes = null;
    this.inconnues = [];             // les portes que la table de la partie ne connaissait pas (noms), règle par défaut
    this.ecarts = [];                // une règle de table qu'une porte fixe ne peut pas suivre : { nom, table, regle }
    this.regles = new Map();         // nom → règle de la partie en cours
    this.passages = [];              // les 46 passages et leur barrière (forme hors du monde), leur porte
    this.vantaux = new Map();        // porte automatique → [formes des vantaux ouverts] (hors du monde)
    this.depolis = []; this.depolisAbsents = [];
    this.pilotees = [];              // les portes 'auto' de la partie (majPortes), dans l'ordre de la carte
    this.frontieres = [];            // les passages frontières de la zone en cours
    this.verrous = new Map();        // nom → règle d'avant le verrou (verrouiller)
    this.rubalise = null; this.rubans = [];
    this._dansMonde = []; this._neuves = []; this._balade = null; this._dedans = false; this._t = 0;
    // (la génération du graphe des bots — L-D, F2 — en a besoin pendant la préparation, quand game.partie est encore nul)
    if (game) game.mondePartie = this;
  }
  get carte() { return (this.game && this.game.carte) || {}; }
  get portes() { const P = this.carte.portes; return (P && P.auto) || []; }
  get toutes() { const P = this.carte.portes; return P && P.liste ? P.liste() : []; }

  // ================================================================ UNE FOIS PAR SESSION
  preparerSession() {
    if (this.pret) return;
    this.pret = true;
    const g = this.game, C = g.collisions, Lu = this.carte.lumieres;
    _lum = Lu;
    for (const P of this.toutes) cotesPorte(P, Lu);
    // LES PASSAGES : leur limite, leur barrière, leur porte
    this.passages = PASSAGES_PIECES.map((Q) => ({ ...Q, ...this._limite(Q) }));
    for (const Q of this.passages) {
      Q.porte = this._porteDu(Q);
      if (Q.ok) Q.forme = horsMonde(C, () => C.ajouterBoiteOrientee(Q.cx, Q.cz, Q.hl + 0.1, 0.05, Math.atan2(Q.tz, Q.tx),
        { y0: Q.sol - 0.35, y1: Q.sol + 1.95, camera: false, balle: false, limite: Q.cle, partie: true }));
    }
    // LES VANTAUX SOLIDES : chaque porte automatique, ses vantaux ouverts à ANGLE_AUTO du côté canonique (ecole_portes.js
    // l. 546-548 : une boîte de 7 cm du gond au bord)
    for (const P of this.portes) {
      const sens = this._sens(P), w = P.double ? P.l / 2 : P.l, rot = P.vantaux.map((v) => v.g.rotation.y), F = [];
      for (const v of P.vantaux) v.g.rotation.y = -v.s * sens * ANGLE_AUTO;
      P.g.updateMatrixWorld(true);
      for (const v of P.vantaux) {
        const a = v.g.localToWorld(_a.set(0, 0, 0)), b = v.g.localToWorld(_b.set(v.s * w, 0, 0));
        F.push(horsMonde(C, () => C.ajouterBoiteOrientee((a.x + b.x) / 2, (a.z + b.z) / 2, w / 2, 0.035, Math.atan2(b.z - a.z, b.x - a.x),
          { y0: P.base, y1: P.base + P.h, vantail: true, porte: P.nom, partie: true })));
      }
      P.vantaux.forEach((v, i) => { v.g.rotation.y = rot[i]; });
      P.g.updateMatrixWorld(true);
      this.vantaux.set(P, F);
    }
    // LES DÉPOLIS : la forme `vitre` de chaque entrée de la table (centre à ± 5 cm)
    const vitres = C.formes.filter((f) => f.vitre);
    for (const D of TABLE_DEPOLIS) {
      const f = vitres.find((v) => Math.abs(centre(v, 'x') - D.x) <= 0.05 && Math.abs((v.y0 + v.y1) / 2 - D.y) <= 0.05 && Math.abs(centre(v, 'z') - D.z) <= 0.05);
      if (f) this.depolis.push(f); else this.depolisAbsents.push(D);
    }
    // LA RUBALISE : un InstancedMesh, compilé ici (sous l'écran de préparation)
    const geo = new THREE.BoxGeometry(RUBAN.seg, RUBAN.h, RUBAN.ep);
    const mat = new THREE.MeshStandardMaterial({ map: texRubalise(), roughness: 0.5, metalness: 0 });
    mat.name = 'rubalise (jeu)';
    const R = new THREE.InstancedMesh(geo, mat, RUBAN.max);
    R.name = 'rubalise (zone de jeu)'; R.count = 0; R.castShadow = false; R.receiveShadow = true;
    R.userData.dynamique = true; R.frustumCulled = false;
    this.rubalise = R;
    g._compilerAsync?.(R);
  }
  // LA LIMITE d'un passage : la normale (de la pièce `a` vers `b`), le point de la limite le long d'elle, et le passage
  // libre de part et d'autre le long de la limite tant qu'elle sépare bien `a` de `b`
  _limite(Q) {
    const C = this.game.collisions, Lu = this.carte.lumieres, h = Q.y;
    if (!Lu || !Lu.zoneEn) return { ok: false };
    const zone = (x, z) => { const Z = Lu.zoneEn(x, z, h + 0.1); return Z ? Z.id : null; };
    let best = null;
    for (let i = 0; i < 36; i++) {
      const t = i * Math.PI / 36, nx = Math.cos(t), nz = Math.sin(t);
      let s = 0;
      for (const d of [0.3, 0.6, 0.9, 1.2]) {
        const za = zone(Q.x - nx * d, Q.z - nz * d), zb = zone(Q.x + nx * d, Q.z + nz * d);
        if (za === Q.a && zb === Q.b) s++; else if (za === Q.b && zb === Q.a) s--;
      }
      if (!best || Math.abs(s) > Math.abs(best.s)) best = { s, nx, nz };
    }
    if (!best || best.s === 0) return { ok: false };
    const nx = best.s > 0 ? best.nx : -best.nx, nz = best.s > 0 ? best.nz : -best.nz, tx = -nz, tz = nx;
    // le point de la limite : la dernière pièce `a` et la première `b` le long de la normale, au cm près
    let ua = -1.5, ub = 1.5;
    for (let u = -1.5; u <= 1.5; u += 0.05) { const z0 = zone(Q.x + nx * u, Q.z + nz * u); if (z0 === Q.a) ua = u; else if (z0 === Q.b && u > ua) { ub = u; break; } }
    for (let k = 0; k < 8; k++) { const u = (ua + ub) / 2; if (zone(Q.x + nx * u, Q.z + nz * u) === Q.a) ua = u; else ub = u; }
    const u0 = (ua + ub) / 2, bx = Q.x + nx * u0, bz = Q.z + nz * u0;
    const sol = C.solEn(bx, bz, h + 0.2);
    // le passage libre le long de la limite (pas de 3 cm, 8 m au plus de chaque côté), tant que la limite sépare `a` de `b`
    const libre = (x, z) => C.libre(x, z, 0.04, sol);
    const limite = (x, z) => zone(x - nx * 0.45, z - nz * 0.45) === Q.a && zone(x + nx * 0.45, z + nz * 0.45) === Q.b;
    let s0 = 0, s1 = 0;
    for (const sg of [-1, 1]) {
      let dernier = null;
      for (let s = 0; s <= 8; s += 0.03) {
        const x = bx + tx * s * sg, z = bz + tz * s * sg;
        if (s > 0.3 && !limite(x, z)) break;
        if (libre(x, z)) dernier = s;
      }
      if (sg < 0) s0 = -(dernier ?? 0); else s1 = dernier ?? 0;
    }
    const m = (s0 + s1) / 2;
    return { ok: s1 - s0 > 0.2, nx, nz, tx, tz, bx, bz, sol, s0, s1, cx: bx + tx * m, cz: bz + tz * m, hl: (s1 - s0) / 2 };
  }
  // LA PORTE d'un passage : celle dont les deux côtés sont ses deux pièces, à moins de 1,5 m de lui, à son niveau
  _porteDu(Q) {
    let best = null, bd = 1.5;
    for (const P of this.toutes) {
      const [a, b] = P.cotes || [];
      if (!((a === Q.a && b === Q.b) || (a === Q.b && b === Q.a)) || Math.abs((P.base || 0) - Q.y) > 1.3) continue;
      const d = Math.hypot(P.cx - (Q.bx ?? Q.x), P.cz - (Q.bz ?? Q.z));
      if (d < bd) { bd = d; best = P; }
    }
    return best;
  }
  // le côté où s'ouvre une porte forcée ou au départ d'une partie : son côté libre, sinon celui de sa face
  _sens(P) { return P.libre || P.cote || 1; }

  // ================================================================ LA RÈGLE D'UNE PORTE
  // la table, à défaut la règle par défaut ; une porte fixe garde l'état de sa construction ; une porte de la frontière de
  // la zone est fermée
  regleDe(P, zoneJeu, mode, table = null) {
    let r = table ? table[P.nom] : undefined;
    if (r === undefined) r = regleParDefaut(P, zoneJeu, mode);
    if (P.etat !== 'auto') return P.etat === 'ouverte' ? 'ouverte' : 'fermee';
    if (r !== 'fermee') {
      const Pz = piecesDe(zoneJeu), [a, b] = cotesPorte(P);
      if (Pz !== undefined && !(dansZone(Pz, a) && dansZone(Pz, b))) r = 'fermee';
    }
    if (modeDe(mode) === 'combat' && r === 'auto') r = 'ouverte';
    return r;
  }
  // les passages frontières d'une zone (une pièce dedans, l'autre dehors ; et ceux que la zone nomme)
  frontieresDe(zoneJeu) {
    const Pz = piecesDe(zoneJeu), Z = ZONES_JEU[zoneJeu], nommes = new Set((Z && Z.frontieres) || []);
    if (Pz === undefined) return [];
    return this.passages.filter((Q) => nommes.has(Q.cle) || (Pz !== null && dansZone(Pz, Q.a) !== dansZone(Pz, Q.b)));
  }
  // LES PIÈCES ATTEIGNABLES d'une zone, ses portes réglées : depuis les pièces de ses départs, par les passages dont les deux
  // pièces sont dans la zone et dont la porte n'est pas fermée ; null : une zone inconnue (rien de restreint)
  piecesPermises(zoneJeu, mode, table = null) {
    const Pz = piecesDe(zoneJeu), Z = ZONES_JEU[zoneJeu], Lu = this.carte.lumieres;
    if (Pz === undefined || !Lu) return null;
    if (!this.passages.length) this.preparerSession();
    const tb = table || (modeDe(mode) === 'prop' ? TABLE_PORTES_PROP : TABLE_PORTES_FPS);
    const voisins = new Map();
    for (const Q of this.passages) {
      if (!dansZone(Pz, Q.a) || !dansZone(Pz, Q.b)) continue;
      if (Q.porte && this.regleDe(Q.porte, zoneJeu, mode, tb) === 'fermee') continue;
      for (const [u, v] of [[Q.a, Q.b], [Q.b, Q.a]]) { if (!voisins.has(u)) voisins.set(u, []); voisins.get(u).push(v); }
    }
    const vues = new Set(), file = [];
    for (const L of Object.values(Z.departs || {})) for (const [x, y, z] of L) { const R = Lu.zoneEn(x, z, y + 0.1); if (R && dansZone(Pz, R.id) && !vues.has(R.id)) { vues.add(R.id); file.push(R.id); } }
    for (let i = 0; i < file.length; i++) for (const v of voisins.get(file[i]) || []) if (!vues.has(v)) { vues.add(v); file.push(v); }
    return vues;
  }

  // ================================================================ L'ENTRÉE
  // `table` : TABLE_PORTES_FPS (combat), TABLE_PORTES_PROP (prop hunt) ou null (les portes automatiques pour tous) ; `mode`
  // ('combat' | 'prop' | l'id de la partie), à défaut lu sur la table
  entrer(zoneJeu, table, mode = null) {
    if (this._dedans) this.sortir();
    if (!this.pret) this.preparerSession();
    const g = this.game, C = g.collisions, carte = this.carte, Po = carte.portes, u = g.user, Z = ZONES_JEU[zoneJeu] || ZONES_JEU.ecole;
    const m = modeDe(mode || (table === TABLE_PORTES_PROP || !table ? 'prop' : 'combat'));
    this.zone = zoneJeu; this.mode = m; this.table = table || null;
    // L'ÉCOLE TELLE QU'EN BALADE, gardée
    const Mi = carte.miroirAccueil, vis = carte.visibilite;
    this._balade = { portes: Po && Po.instantane ? Po.instantane() : null, ascenseur: instantaneAscenseur(carte.chantier),
      miroir: Mi ? Mi.coupe : null, bornes: u.bounds, forcees: vis ? vis.forcees : null };
    // LES PORTES
    this.inconnues = []; this.ecarts = []; this.regles.clear(); this.pilotees = []; this.verrous.clear();
    const F = [];
    for (const P of this.toutes) {
      if (table && table[P.nom] === undefined) this.inconnues.push(P.nom);
      const r = table ? this.regleDe(P, zoneJeu, m, table) : (P.etat === 'auto' ? 'auto' : P.etat);
      if (table && P.etat !== 'auto' && table[P.nom] !== undefined && table[P.nom] !== r) this.ecarts.push({ nom: P.nom, table: table[P.nom], regle: r });
      this.regles.set(P.nom, r);
      if (P.etat !== 'auto') continue;
      P.sens = this._sens(P);
      Po.forcer(P, r === 'ouverte' ? 1 : 0);
      P._kVu = P.k; P._sensVu = P.sens;
      if (r === 'ouverte') F.push(...(this.vantaux.get(P) || []));
      if (r === 'auto') this.pilotees.push(P);
    }
    if (Po) Po.pilotees = true;
    // LES BARRIÈRES de la zone, et la rubalise des passages ouverts (ceux qu'une porte fermée ne clôt pas déjà)
    this.frontieres = this.frontieresDe(zoneJeu);
    this.rubans = [];
    for (const Q of this.frontieres) {
      if (!Q.forme) continue;
      F.push(Q.forme);
      if (!Q.porte || this.regles.get(Q.porte.nom) !== 'fermee') this.rubans.push(Q);
    }
    this._dansMonde = F; this._neuves = ranger(C, F);
    // L'ASCENSEUR coupé
    couperAscenseur(carte.chantier);
    // LES PIÈCES FERMÉES du RDC montrées quand une porte pilotée est ouverte
    if (vis) vis.forcees = new Set(this.portes);
    // LA RUE BORNÉE
    this.bornes = Z.rue ? BORNES_JEU : null;
    if (this.bornes) u.bounds = this.bornes;
    // LA GLACE peinte
    if (Mi) Mi.coupe = true;
    // LES DÉPOLIS
    for (const f of this.depolis) f.depoli = true;
    // LA RUBALISE
    this._poserRubans(0);
    if (this.rubalise && this.rubalise.count > 0) g.scene.add(this.rubalise);
    this._dedans = true;
  }

  // ================================================================ LA SORTIE : l'état EXACT de la balade
  sortir() {
    const g = this.game, carte = this.carte, Po = carte.portes, B = this._balade;
    if (!this._dedans) { if (B && B.bornes) g.user.bounds = B.bornes; return; }
    this._dedans = false;
    retirer(g.collisions, this._dansMonde, this._neuves);
    this._dansMonde = []; this._neuves = [];
    for (const f of this.depolis) delete f.depoli;
    if (Po && Po.restaurer) Po.restaurer(B.portes);
    for (const P of this.toutes) { delete P._kVu; delete P._sensVu; }
    restaurerAscenseur(carte.chantier, B.ascenseur);
    if (carte.visibilite) carte.visibilite.forcees = B.forcees;
    if (carte.miroirAccueil) carte.miroirAccueil.coupe = B.miroir;
    g.user.bounds = B.bornes;
    if (this.rubalise && this.rubalise.parent) this.rubalise.parent.remove(this.rubalise);
    this.pilotees = []; this.frontieres = []; this.rubans = []; this.regles.clear(); this.verrous.clear();
    this.bornes = null; this.zone = null; this.mode = null; this.table = null; this._balade = null;
  }

  // ================================================================ LES PORTES DU PAS (Partie.pas, étape 5)
  // une porte 'auto' s'ouvre quand un acteur VIVANT est à moins de 2,1 m de son centre, à son niveau (ses pieds entre 1,2 m
  // sous le seuil et 2,2 m au-dessus : la règle de Portes.maj), du côté opposé au sien ; elle se referme 1,6 fois plus
  // lentement quand il n'y a plus personne. Le premier acteur trouvé, dans l'ordre de la partie, dit le côté.
  majPortes(dt, acteurs) {
    for (const P of this.pilotees) {
      let qui = null;
      for (const a of acteurs) {
        if (!a.vivant || !a.corps) continue;
        const p = a.corps.pos;
        if (p.y > P.base - 1.2 && p.y < P.base + 2.2 && Math.hypot(p.x - P.cx, p.z - P.cz) < RAYON_AUTO) { qui = p; break; }
      }
      if (qui && P.k <= 0.001) { const cote = (qui.x - P.cx) * P.nx + (qui.z - P.cz) * P.nz; P.sens = P.libre || (cote > 0 ? -1 : 1); }
      const k = Math.max(0, Math.min(1, P.k + (qui ? dt / DUREE : -dt / (DUREE * 1.6))));
      if (k === P.k) continue;
      P.k = k;
      if (P.forme) P.forme.off = k > 0.02;
    }
  }
  // UN VERROU posé (ou levé) par les règles : la porte fermée, ou rendue à sa règle de la partie
  verrouiller(nom, ferme) {
    const P = this.toutes.find((q) => q.nom === nom);
    if (!P || P.etat !== 'auto' || !this._dedans) return false;
    const Po = this.carte.portes, avant = this.regles.get(nom);
    if (ferme) {
      if (avant === 'fermee') return true;
      this.verrous.set(nom, avant);
      this._regle(P, 'fermee');
    } else {
      if (!this.verrous.has(nom)) return true;
      const r = this.verrous.get(nom); this.verrous.delete(nom);
      this._regle(P, r);
    }
    P._kVu = -1;
    return true;
  }
  _regle(P, r) {
    const C = this.game.collisions, Po = this.carte.portes, avant = this.regles.get(P.nom), V = this.vantaux.get(P) || [];
    if (avant === 'ouverte' && r !== 'ouverte') { retirer(C, V); this._dansMonde = this._dansMonde.filter((f) => !V.includes(f)); }
    if (r === 'ouverte' && avant !== 'ouverte') { this._neuves.push(...ranger(C, V)); this._dansMonde.push(...V); }
    const i = this.pilotees.indexOf(P);
    if (r === 'auto' && i < 0) this.pilotees.push(P);
    if (r !== 'auto' && i >= 0) this.pilotees.splice(i, 1);
    this.regles.set(P.nom, r);
    if (r === 'ouverte') { P.sens = this._sens(P); Po.forcer(P, 1); } else if (r === 'fermee') Po.forcer(P, 0);
  }

  // ================================================================ LES NŒUDS PERMIS d'un graphe
  // les nœuds des pièces atteignables de la zone (portes réglées : moins les pièces fermées par la table, rien hors des
  // pièces de la zone) ; un nœud hors de toute pièce (un seuil, une embrasure) suit ses voisins. Zone inconnue : tout.
  noeudsAutorises(nav, zoneJeu, mode) {
    const n = (nav && nav.nb) | 0, out = new Uint8Array(n);
    if (!n) return out;
    const permis = this.piecesPermises(zoneJeu, mode), Lu = this.carte.lumieres;
    if (!permis) return out.fill(1);
    const Zs = (Lu && Lu.zones) || [], sans = [];
    for (let i = 0; i < n; i++) {
      const zi = nav.zone ? nav.zone[i] : 255;
      let id = zi !== 255 && zi < Zs.length ? Zs[zi].id : zi !== 255 ? PIECES[zi] : null;
      if (!id && Lu && nav.px) { const R = Lu.zoneEn(nav.px[i], nav.pz[i], (nav.ph ? nav.ph[i] : 0) + 0.1); id = R ? R.id : null; }
      if (id) out[i] = permis.has(id) ? 1 : 0; else sans.push(i);
    }
    if (nav.debut && nav.liens) for (const i of sans) for (let j = nav.debut[i]; j < nav.debut[i + 1]; j++) if (out[nav.liens[j]]) { out[i] = 1; break; }
    return out;
  }

  // ================================================================ L'AFFICHAGE (une fois par image)
  image(dt) {
    if (!this._dedans) return;
    // les vantaux des portes pilotées, posés d'après leur ouverture (la simulation ne touche que `k`, `sens` et la forme)
    for (const P of this.portes) {
      if (P._kVu === P.k && P._sensVu === P.sens) continue;
      const e = P.k * P.k * (3 - 2 * P.k);
      for (const v of P.vantaux) v.g.rotation.y = -v.s * P.sens * ANGLE_AUTO * e;
      P._kVu = P.k; P._sensVu = P.sens;
    }
    // (les vantaux d'un palier de l'ascenseur suivent la visibilité de leur étage — majAscenseur ne le fait plus en partie)
    const S = this.carte.chantier && this.carte.chantier._ascenseur;
    if (S) for (const P of S.paliers) if (P.groupe !== this.carte.chantier.decor && P.mob.visible !== P.groupe.visible) P.mob.visible = P.groupe.visible;
    // la rubalise au vent
    if (dt > 0 && this.rubalise && this.rubalise.count) { this._t += dt; this._poserRubans(this._t); }
  }
  // LES RUBANS : deux par passage ouvert de la frontière (à 0,92 et 1,18 m), en segments de 50 cm d'un bout libre à l'autre ;
  // une flèche de 3 cm au milieu, un vrillage lent de ± 0,18 rad (chaque ruban sa phase)
  _poserRubans(t) {
    const R = this.rubalise; if (!R) return;
    let n = 0;
    for (let q = 0; q < this.rubans.length; q++) {
      const Q = this.rubans[q], L = Q.s1 - Q.s0, ns = Math.max(1, Math.ceil(L / RUBAN.seg)), lseg = L / ns, ang = Math.atan2(Q.tz, Q.tx);
      for (let r = 0; r < RUBAN.hauts.length; r++) {
        const ph = q * 1.7 + r * 2.3, vr = 0.18 * Math.sin(t * 1.3 + ph) + 0.06 * Math.sin(t * 3.1 + ph * 2), fl = Math.min(0.03, 0.012 * L);
        for (let i = 0; i < ns && n < RUBAN.max; i++) {
          const s = Q.s0 + (i + 0.5) * lseg, w = (s - Q.s0) / L * 2 - 1;
          const y = Q.sol + RUBAN.hauts[r] - fl * (1 - w * w) + 0.01 * Math.sin(t * 2 + ph + w);
          _p.set(Q.bx + Q.tx * s, y, Q.bz + Q.tz * s);
          _e.set(vr, -ang, Math.atan(fl * 4 * w / Math.max(0.5, L)), 'YXZ');
          _q.setFromEuler(_e); _s.set(lseg / RUBAN.seg + 0.002, 1, 1);
          R.setMatrixAt(n++, _m4.compose(_p, _q, _s));
        }
      }
    }
    R.count = n;
    R.instanceMatrix.needsUpdate = true;
  }

  // ================================================================ L'ÉTAT (§ 4.7) : { i, k, sens } des portes automatiques
  etat() {
    return this.portes.map((P, i) => { const e = { i, k: P.k, sens: P.sens || 1 }; if (this.verrous.has(P.nom)) e.v = 1; return e; });
  }
  appliquer(e) {
    const L = this.portes;
    for (const s of e || []) {
      const P = L[s.i]; if (!P) continue;
      if (s.v && !this.verrous.has(P.nom)) this.verrouiller(P.nom, true);
      P.sens = s.sens; P.k = s.k;
      if (P.forme) P.forme.off = s.k > 0.02;
      P._kVu = -1;
    }
    this.image(0);
  }

  // ================================================================ POUR LA GÉNÉRATION DU GRAPHE (L-D, F2)
  // les boîtes des vantaux ouverts du combat rangées dans le monde solide le temps de `fn` (le graphe les contourne : il sert
  // à tous les modes ; au prop hunt elles sont éteintes, ce qui ne fait que l'élargir) — `fn` peut rendre une promesse
  avecVantaux(fn) {
    const C = this.game.collisions;
    if (!this.pret) this.preparerSession();
    const F = [...this.vantaux.values()].flat().filter((f) => !this._dansMonde.includes(f));
    const neuves = ranger(C, F);
    let r;
    try { r = fn(); } catch (e) { retirer(C, F, neuves); throw e; }
    if (r && typeof r.then === 'function') return r.finally(() => retirer(C, F, neuves));
    retirer(C, F, neuves);
    return r;
  }
}

// le centre d'une forme du monde solide, en x ou en z (boîte englobante de Collisions._ranger)
function centre(f, ax) { return ax === 'x' ? (f.bx0 + f.bx1) / 2 : (f.bz0 + f.bz1) / 2; }
