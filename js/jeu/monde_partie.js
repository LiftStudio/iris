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
// 23/10 (centre de la forme, ± 5 cm ; des 58 formes `vitre` du socle, 51 fixes et 7 portes vitrées) : la balle les traverse
// (× 0,8), la vue s'y arrête (Balistique.vue, L-A). Restent CLAIRES : les fenêtres des façades (rue, salles du 1er et du 2e,
// la fenêtre du palier du 2e, celles de la salle 1 du 2e, stores ouverts), les fixes et l'imposte de la porte 6, les portes
// 6, du passage et du bureau B. (Le jour du bureau B a une bande claire de 0,5 m en haut, au-dessus de 2 m : dépoli, l'œil
// est à 1,62.)
export const TABLE_DEPOLIS = [
  // RDC : les trois jours de la Si 0.1 (vert pâle, js/ecole_portes.js fenetreDepolie), celui du bureau B, la porte bleue de la
  // David Clark et son imposte
  { x: 5.825, y: 1.76, z: -4.6, nom: 'jour de la Si 0.1 (ouest)' }, { x: 7.145, y: 1.76, z: -4.6, nom: 'jour de la Si 0.1 (milieu)' },
  { x: 8.465, y: 1.76, z: -4.6, nom: 'jour de la Si 0.1 (est)' }, { x: 11.33, y: 1.775, z: -2.925, nom: 'jour du bureau B' },
  { x: 5.156, y: 1.025, z: -12.785, nom: 'porte de la salle David Clark' }, { x: 5.156, y: 2.225, z: -12.785, nom: 'imposte de la salle David Clark' },
  // 1er : les trois jours de la S 1.3 sur l'espace pause
  { x: 9.075, y: 5.21, z: -4.95, nom: 'jour de la S 1.3 (travée 6)' }, { x: 7.425, y: 5.21, z: -4.95, nom: 'jour de la S 1.3 (travée 5)' },
  { x: 5.775, y: 5.21, z: -4.95, nom: 'jour de la S 1.3 (travée 4)' },
  // 2e : les portes des salles 1 et 2 (verre dépoli)
  { x: 12.45, y: 7.62, z: -6.56, nom: 'porte de la salle 1 du 2e' }, { x: 10.52, y: 7.62, z: -4.59, nom: 'porte de la salle 2 du 2e' },
  // −1 (js/ecole_amphi.js, lot R : à relever de nouveau après sa fusion) : le fixe, l'imposte et la porte de la S −1.14
  { x: 9.1, y: -2.03, z: -14.485, nom: 'fixe de la S −1.14', lotR: true }, { x: 9.55, y: -0.88, z: -14.485, nom: 'imposte de la S −1.14', lotR: true },
  { x: 9.8, y: -2.035, z: -14.485, nom: 'porte de la S −1.14', lotR: true },
];

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
// le premier point tombe hors de toute pièce : dans un mur épais) ; gardés sur la porte (`cotes`), avec son centre MONDE
// (`wx`, `wz` : celui de son groupe — une porte fixe posée dans un repère décalé, js/ecole_soussol.js decaler, garde un
// `cz` de son repère ; les automatiques y sont reprises, pas les autres)
const _w = new THREE.Vector3();
export function cotesPorte(porte, lumieres = _lum) {
  if (porte.cotes) return porte.cotes;
  const L = lumieres; if (!L || !L.zoneEn) return [null, null];
  porte.wx = porte.cx; porte.wz = porte.cz;
  if (porte.g && porte.g.parent) { porte.g.updateWorldMatrix(true, false); porte.g.getWorldPosition(_w); porte.wx = _w.x; porte.wz = _w.z; }
  const y = (porte.base || 0) + 0.1, c = [];
  for (const s of [-1, 1]) {
    let id = null;
    for (const d of [0.6, 0.9, 1.2]) { const Z = L.zoneEn(porte.wx + s * d * porte.nx, porte.wz + s * d * porte.nz, y); if (Z) { id = Z.id; break; } }
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

// (un poteau : la même boîte, couchée sur son long côté — 1,25 m de haut, 5 cm de côté —, sur un socle gris de 28 cm)
const POTEAU = { h: 1.25, c: 0.05, socle: 0.28, ep: 0.035 };
const BLANC = new THREE.Color(1, 1, 1), GRIS = new THREE.Color(0.16, 0.16, 0.17);
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
    this.rue = []; this.poteaux = []; this._poteauxVus = [];   // la rue bornée tracée : ses rubans, ses poteaux (_lignesRue)
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
    // LES PASSAGES : leur limite (les portes automatiques ouvertes le temps du calcul), leur barrière, leur porte
    const ouvertes = this.portes.map((P) => (P.forme ? P.forme.off : null));
    for (const P of this.portes) if (P.forme) P.forme.off = true;
    try { this.passages = PASSAGES_PIECES.map((Q) => ({ ...Q, ...this._limite(Q) })); }
    finally { this.portes.forEach((P, i) => { if (P.forme) P.forme.off = ouvertes[i]; }); }
    for (const Q of this.passages) {
      Q.porte = this._porteDu(Q);
      if (Q.porte) this._parLaPorte(Q, Q.porte);
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
    // LA RUE BORNÉE, tracée (relecture)
    this._lignesRue();
    // LA RUBALISE : un InstancedMesh, compilé ici (sous l'écran de préparation) — ses couleurs d'instance posées AVANT la
    // compilation (le programme les compte : blanc, la rubalise et ses poteaux ; gris, le socle d'un poteau)
    const geo = new THREE.BoxGeometry(RUBAN.seg, RUBAN.h, RUBAN.ep);
    const mat = new THREE.MeshStandardMaterial({ map: texRubalise(), roughness: 0.5, metalness: 0 });
    mat.name = 'rubalise (jeu)';
    const R = new THREE.InstancedMesh(geo, mat, RUBAN.max);
    R.name = 'rubalise (zone de jeu)'; R.count = 0; R.castShadow = false; R.receiveShadow = true;
    R.userData.dynamique = true; R.frustumCulled = false;
    for (let i = 0; i < RUBAN.max; i++) R.setColorAt(i, BLANC);
    this.rubalise = R;
    this._compilerRubalise();
  }
  // LA RUE BORNÉE (relecture du 23/10) : la limite de BORNES_JEU tracée dans la rue — sans elle, un mur invisible au milieu de
  // la chaussée (z 6) et en travers des trottoirs (x −3 et 23). Une rubalise sur poteaux à 35 cm au-delà de la borne (le
  // corps, de rayon 0,3, s'arrête contre elle), du nu des façades à l'angle ; coupée où le sol change (la bordure du
  // trottoir, 12 cm) ; un poteau à chaque bout et tous les 3,5 m au plus (`this.rue`, `this.poteaux` ; montrés dans les zones
  // avec rue seulement)
  _lignesRue() {
    const C = this.game.collisions, B = BORNES_JEU, m = 0.35, zB = B.zMax + m, xO = B.xMin - m, xE = B.xMax + m;
    const sol = (x, z) => C.solEn(x, z, 0.3);
    // le nu de la façade sur la ligne x : le dernier point libre en remontant de la borne vers l'école, avant 2,5 m de plein
    // (relecture : la voiture garée à l'est, 1,7 m de large, à cheval sur la borne x 23, l'arrêtait — la ligne s'arrêtait là)
    const nu = (x) => {
      let z = zB, plein = 0;
      for (let s = zB; s > -3; s -= 0.03) { if (C.libre(x, s, 0.04, sol(x, s))) { z = s; plein = 0; } else if ((plein += 0.03) > 2.5) break; }
      return z;
    };
    const L = [], P = [];
    const poteau = (x, z, h, ang) => { if (!P.some((q) => Math.hypot(q.x - x, q.z - z) < 0.1)) P.push({ x, z, sol: h, ang }); };
    // une ligne de (x0, z0) à (x1, z1), en tronçons LIBRES de même sol : coupée où le sol change, et de part et d'autre d'un
    // obstacle (la voiture : c'est elle qui borne, le ruban ne la traverse pas)
    const ligne = (x0, z0, x1, z1) => {
      const lg = Math.hypot(x1 - x0, z1 - z0); if (lg < 0.3) return;
      const tx = (x1 - x0) / lg, tz = (z1 - z0) / lg, n = Math.ceil(lg / 0.05), ang = Math.atan2(tz, tx);
      const pt = (s) => { const x = x0 + tx * s, z = z0 + tz * s, h = sol(x, z); return { h, libre: C.libre(x, z, 0.04, h) }; };
      let s0 = 0, a = pt(0), h0 = a.h;
      for (let i = 1; i <= n; i++) {
        const s = Math.min(lg, i * 0.05), b = pt(s), obst = b.libre !== a.libre, coupe = obst || (b.libre && Math.abs(b.h - h0) > 0.05);
        if (!coupe && i < n) continue;
        // (contre un obstacle, le bout reculé de 15 cm : le socle du poteau, 28 cm le long de la ligne, n'y mord pas)
        const s1 = !coupe ? lg : obst ? (a.libre ? s - 0.2 : s) : s - 0.025;
        if (a.libre && s1 - s0 > 0.2) {
          // (une travée par paire de poteaux : chacune sa flèche et sa vrille — un seul ruban de 26 m tournait d'un bloc)
          const k = Math.ceil((s1 - s0) / 3.5);
          for (let j = 0; j <= k; j++) {
            const u = s0 + (s1 - s0) * j / k; poteau(x0 + tx * u, z0 + tz * u, h0, ang);
            if (j < k) L.push({ cle: 'rue', bx: x0, bz: z0, tx, tz, s0: u, s1: s0 + (s1 - s0) * (j + 1) / k, sol: h0 });
          }
        }
        s0 = obst && !a.libre ? s + 0.15 : s1; a = b; h0 = b.h;
      }
    };
    // (de la façade — 16 cm devant son nu, pour le socle — à l'angle, le long de la chaussée, puis de l'angle à l'autre façade)
    ligne(xO, nu(xO) + 0.16, xO, zB); ligne(xO, zB, xE, zB); ligne(xE, zB, xE, nu(xE) + 0.16);
    this.rue = L; this.poteaux = P;
  }
  // LA LIMITE d'un passage. Les pièces sont des rectangles alignés sur les axes (carte_ecole.js l. 2345-2385) : leur limite
  // aussi. Le long de chaque axe, de part et d'autre du centre du passage (1,5 m), la suite des pièces — lues au SOL de chaque
  // point (une volée change de pièce par sa hauteur, comme l'escalier est) — : la bascule de `a` à `b` la plus proche du
  // centre (45 cm au plus hors de toute pièce entre les deux : l'épaisseur d'un mur) donne la normale (de `a` vers `b`) et le
  // point de la limite ; puis le passage libre le long de la limite (disque de 4 cm au sol, pas de 3 cm, 8 m au plus de
  // chaque côté), tant qu'elle sépare bien `a` de `b`. (Les portes automatiques sont ouvertes le temps du calcul.)
  _limite(Q) {
    const C = this.game.collisions, Lu = this.carte.lumieres;
    if (!Lu || !Lu.zoneEn) return { ok: false };
    const solDe = (x, z) => C.solEn(x, z, Q.y + 0.35);
    const zone = (x, z) => { const Z = Lu.zoneEn(x, z, solDe(x, z) + 0.1); return Z ? Z.id : null; };
    let best = null;
    for (const [ux, uz] of [[1, 0], [0, 1]]) {
      const L = [];
      for (let k = -30; k <= 30; k++) L.push({ u: k * 0.05, z: zone(Q.x + ux * k * 0.05, Q.z + uz * k * 0.05) });
      for (let i = 0; i < L.length; i++) {
        if (L[i].z !== Q.a && L[i].z !== Q.b) continue;
        let j = i + 1;
        while (j < L.length && L[j].z === null && L[j].u - L[i].u <= 0.45) j++;
        if (j >= L.length || L[j].z === L[i].z || (L[j].z !== Q.a && L[j].z !== Q.b)) continue;
        const u = (L[i].u + L[j].u) / 2, sg = L[i].z === Q.a ? 1 : -1;
        if (!best || Math.abs(u) < Math.abs(best.u)) best = { u, nx: ux * sg, nz: uz * sg, ux, uz, ua: L[i].u, ub: L[j].u };
      }
    }
    if (!best) return { ok: false };
    const { nx, nz } = best, tx = -nz, tz = nx;
    // la bascule au cm près (dichotomie entre les deux échantillons)
    let ua = best.ua, ub = best.ub;
    const zA = (u) => zone(Q.x + best.ux * u, Q.z + best.uz * u);
    const cA = zA(ua);
    for (let k = 0; k < 6; k++) { const u = (ua + ub) / 2; if (zA(u) === cA) ua = u; else ub = u; }
    const u0 = (ua + ub) / 2, bx = Q.x + best.ux * u0, bz = Q.z + best.uz * u0;
    const sol = solDe(bx, bz);
    const libre = (x, z) => C.libre(x, z, 0.04, solDe(x, z));
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
      const d = Math.hypot((P.wx ?? P.cx) - (Q.bx ?? Q.x), (P.wz ?? P.cz) - (Q.bz ?? Q.z));
      if (d < bd) { bd = d; best = P; }
    }
    return best;
  }
  // UN PASSAGE PAR UNE PORTE : la barrière dans la baie même (son centre, sa largeur, sa normale de `a` vers `b`) — la limite
  // des rectangles de pièces, au ras d'un mur, déborde parfois d'une baie sur la pièce voisine (celle de l'escalier principal
  // mordait de 30 cm sur l'entrée du C05)
  _parLaPorte(Q, P) {
    const C = this.game.collisions, [, cb] = cotesPorte(P), sg = cb === Q.b ? 1 : -1;
    const nx = P.nx * sg, nz = P.nz * sg, bx = P.wx ?? P.cx, bz = P.wz ?? P.cz, l = P.l || 0.9, sol = C.solEn(bx, bz, (P.base || 0) + 0.3);
    // (relecture : la rubalise sur la partie LIBRE de la baie — le vantail resté fermé d'une double porte fixe, celle de
    // l'escalier principal, en tient la moitié : le ruban s'y enfonçait — ; la barrière, elle, garde toute la baie. La porte
    // automatique ouverte le temps du calcul ; rien de libre, une porte fixe fermée : toute la baie)
    const off = P.forme ? P.forme.off : null; if (P.forme) P.forme.off = true;
    let lib = null, run = null;
    try {
      for (let u = -l / 2; u <= l / 2 + 1e-6; u += 0.02) {
        if (!C.libre(bx - nz * u, bz + nx * u, 0.04, sol)) { run = null; continue; }
        if (run) run[1] = u; else run = [u, u];
        if (!lib || run[1] - run[0] > lib[1] - lib[0]) lib = [run[0], run[1]];
      }
    } finally { if (P.forme) P.forme.off = off; }
    const [s0, s1] = lib && lib[1] - lib[0] > 0.2 ? lib : [-l / 2, l / 2];
    Object.assign(Q, { ok: true, nx, nz, tx: -nz, tz: nx, bx, bz, sol, s0, s1, cx: bx, cz: bz, hl: l / 2, parPorte: true });
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
    // (dedans dès que la balade est gardée : une exception plus bas laisse à sortir() de quoi tout rendre)
    this._dedans = true;
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
    // LA RUE BORNÉE, et sa rubalise sur poteaux
    this.bornes = Z.rue ? BORNES_JEU : null;
    if (this.bornes) u.bounds = this.bornes;
    if (this.bornes) this.rubans.push(...this.rue);
    this._poteauxVus = this.bornes ? this.poteaux : [];
    // LA GLACE peinte
    if (Mi) Mi.coupe = true;
    // LES DÉPOLIS
    for (const f of this.depolis) f.depoli = true;
    // LA RUBALISE
    this._poserRubans(0, true);
    if (this.rubalise && this.rubalise.count > 0) g.scene.add(this.rubalise);
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
    this.pilotees = []; this.frontieres = []; this.rubans = []; this._poteauxVus = []; this.regles.clear(); this.verrous.clear();
    this.bornes = null; this.zone = null; this.mode = null; this.table = null; this._balade = null;
  }

  // ================================================================ LES PORTES DU PAS (Partie.pas, étape 5)
  // une porte 'auto' s'ouvre quand un acteur VIVANT est à moins de 2,1 m de son centre, à son niveau (ses pieds entre 1,2 m
  // sous le seuil et 2,2 m au-dessus : la règle de Portes.maj), du côté opposé au sien ; elle se referme 1,6 fois plus
  // lentement quand il n'y a plus personne. Le premier acteur trouvé, dans l'ordre de la partie, dit le côté. Un événement
  // 'porte' { nom, x, y, z, ouvre, a } quand elle commence à s'ouvrir (`a` : l'acteur) et quand elle finit de se refermer :
  // « la porte qui s'ouvre seule » s'entend (les sons, l'ouïe des chasseurs — AJOUT au § 4.6)
  majPortes(dt, acteurs) {
    const partie = this.game.partie;
    for (const P of this.pilotees) {
      let qui = null, ida = -1;
      for (const a of acteurs) {
        if (!a.vivant || !a.corps) continue;
        const p = a.corps.pos;
        if (p.y > P.base - 1.2 && p.y < P.base + 2.2 && Math.hypot(p.x - P.cx, p.z - P.cz) < RAYON_AUTO) { qui = p; ida = a.id; break; }
      }
      if (qui && P.k <= 0.001) {
        const cote = (qui.x - P.cx) * P.nx + (qui.z - P.cz) * P.nz; P.sens = P.libre || (cote > 0 ? -1 : 1);
        if (partie) partie.evt('porte', { nom: P.nom, x: P.cx, y: P.base, z: P.cz, ouvre: true, a: ida });
      }
      const k = Math.max(0, Math.min(1, P.k + (qui ? dt / DUREE : -dt / (DUREE * 1.6))));
      if (k === P.k) continue;
      P.k = k;
      if (P.forme) P.forme.off = k > 0.02;
      if (k === 0 && partie) partie.evt('porte', { nom: P.nom, x: P.cx, y: P.base, z: P.cz, ouvre: false, a: -1 });
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
    this.regles.set(P.nom, r);
    // (les portes pilotées toujours dans l'ordre de la carte : un verrou levé ne met pas la porte en queue — l'ordre des
    // événements 'porte' d'un pas reste celui d'une partie rejouée depuis son état)
    this.pilotees = this.portes.filter((q) => this.regles.get(q.nom) === 'auto');
    if (r === 'ouverte') { P.sens = this._sens(P); Po.forcer(P, 1); } else if (r === 'fermee') Po.forcer(P, 0);
  }

  // ================================================================ LES NŒUDS PERMIS d'un graphe
  // les nœuds des pièces atteignables de la zone (portes réglées : moins les pièces fermées par la table, rien hors des
  // pièces de la zone) ; un nœud hors de toute pièce (un seuil, une embrasure) suit ses voisins. Zone inconnue : tout.
  noeudsAutorises(nav, zoneJeu, mode) {
    this._compilerRubalise();
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

  // (LA RUBALISE COMPILÉE pour le préréglage du moment : elle n'est pas dans la scène que Partie.preparer compile, et un
  // préréglage changé — la qualité automatique, un réglage — change ses programmes. noeudsAutorises est la seule méthode du
  // monde que Partie.preparer appelle à CHAQUE préparation, avant la compilation de la scène : c'est là ; trois fois rien
  // quand le programme existe déjà. Affichage, hors du pas.)
  _compilerRubalise() {
    const g = this.game, R = this.rubalise, fx = g && g.fx;
    if (!R || !g || !g._compilerAsync) return;
    g._compilerAsync(R);
    // (relecture : et sa variante du cran de REPLI de la qualité automatique — sans carte d'environnement —, comme un avatar
    // qui arrive, js/game.js Player.preparerRendu : posée dans la scène à l'entrée, la rubalise n'avait que la variante du
    // moment, et la première baisse automatique en pleine partie la compilait d'un coup — un programme de plus, S0 point 8)
    if (fx && fx.auto && fx.avecRepli && fx._etatRepli && fx._etatRepli()) fx.avecRepli(R, (x) => g._compilerAsync(x));
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
  // une flèche de 3 cm au milieu, un vrillage lent de ± 0,18 rad (chaque ruban sa phase) ; puis les poteaux de la rue bornée
  // (fixes ; leurs couleurs posées à l'entrée, `couleurs`)
  _poserRubans(t, couleurs = false) {
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
    const nr = n;
    for (const T of this._poteauxVus) {
      if (n + 2 > RUBAN.max) break;
      _p.set(T.x, T.sol + POTEAU.h / 2, T.z); _q.setFromEuler(_e.set(0, -T.ang, Math.PI / 2, 'YXZ'));
      R.setMatrixAt(n++, _m4.compose(_p, _q, _s.set(POTEAU.h / RUBAN.seg, POTEAU.c / RUBAN.h, POTEAU.c / RUBAN.ep)));
      _p.set(T.x, T.sol + POTEAU.ep / 2, T.z); _q.setFromEuler(_e.set(0, -T.ang, 0, 'YXZ'));
      R.setMatrixAt(n++, _m4.compose(_p, _q, _s.set(POTEAU.socle / RUBAN.seg, POTEAU.ep / RUBAN.h, POTEAU.socle / RUBAN.ep)));
    }
    if (couleurs && R.instanceColor) {
      for (let i = 0; i < n; i++) R.setColorAt(i, i >= nr && (i - nr) % 2 ? GRIS : BLANC);
      R.instanceColor.needsUpdate = true;
    }
    R.count = n;
    // (n'envoyer que les segments posés : les 1 024 matrices font 64 Ko à chaque image)
    const A = R.instanceMatrix;
    A.clearUpdateRanges(); A.addUpdateRange(0, n * 16); A.needsUpdate = true;
  }

  // ================================================================ L'ÉTAT (§ 4.7) : { i, k, sens } des portes automatiques
  etat() {
    return this.portes.map((P, i) => { const e = { i, k: P.k, sens: P.sens || 1 }; if (this.verrous.has(P.nom)) e.v = 1; return e; });
  }
  appliquer(e) {
    const L = this.portes;
    for (const s of e || []) {
      const P = L[s.i]; if (!P) continue;
      // (le verrou dans les deux sens : un état sans verrou lève celui d'aujourd'hui — sinon appliquer un état d'avant le
      // verrou laissait la porte fermée, et etat() ne rendait plus l'état appliqué)
      if (!!s.v !== this.verrous.has(P.nom)) this.verrouiller(P.nom, !!s.v);
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
