// =====================================================================
//  LE HUD DU COMBAT (lot L-G, 23/10 ; spec §§ 2.3-2.9, 3.3, 3.6, 4.5.15, 5.5.10 ; CoD § 9.1) — vague 3 : L-P
// =====================================================================
// Ce que Haythem voit de la partie, façon Call of Duty : le réticule à quatre traits qui DIT LA VÉRITÉ (son écart est la
// dispersion de l'arme projetée sur l'écran : 4 px + tan(s) / tan(champV/2) × H/2), bleu sur un allié, rouge sur un ennemi,
// caché en visée ; les marqueurs de touche (X blanc 0,12 s, plus grand à la tête, rouge × 1,15 pendant 0,22 s à
// l'élimination) ; les « +100 » empilés à droite du réticule ; la plaque du nom visé à ≤ 30 m ; le score et le chrono en
// haut à gauche (rouge sous 30 s) ; la domination en haut au centre (et les anneaux A, B, C dans le monde) ; le fil des
// éliminations en haut à droite, silhouettes d'armes en SVG ; la vie au-dessus de la mini-carte, qui ne se montre
// qu'abîmée ; les munitions en bas à droite (« R RECHARGER » sous 30 %) ; les arcs rouges vers qui vous touche ; la
// vignette qui bat sous 30 PV ; la lunette du TP-50 ; la caméra de mort et sa carte (« TOUCHÉ PAR … — arme · zone ·
// distance · PV du tueur »), l'image désaturée 3 s ; les annonces dans un élément À ELLES (#hud-annonce, jamais
// hud.feedback, qui force une mise en page et fait vibrer la manette) ; les CHEVRONS BLEUS des alliés (≤ 4, à travers les
// murs, 14 → 8 px avec la distance, le nom dessous à ≤ 15 m) ; la grenade qui roule à vos pieds ; et le calque blanc de la
// flash, #voile-flash, au-dessus du HUD et sous la pause, qui marche à toutes les qualités (Basse comprise).
//
// LES RÈGLES DU DOM (celle de HUD.stamina, js/ui.js) : tout est créé par JS une fois (à la préparation), sous #hud, marqué
// `data-jeu` (l'empreinte du HUD de la balade ne le compte pas) ; un texte, une classe, un `hidden` ne sont écrits que si la
// valeur AFFICHÉE change. Tout ce qui BOUGE à chaque image — réticule, marqueurs, « +100 », fil, arcs, chevrons, anneaux,
// vignette, vie, annonce — passe par des variables CSS de la racine, écrites en UNE affectation de `style.cssText` par
// image (et seulement si l'une a changé) : une seule écriture DOM, des transformations et des opacités (pas de mise en
// page), et jamais une lecture de mise en page dans `maj` (ni getBoundingClientRect, ni offset*, ni getComputedStyle : la
// taille de l'écran est gardée au `resize`). Les animations suivent l'HORLOGE DU HUD (la somme des dt que reçoit `maj`) :
// la pause les gèle, et un test les rejoue au pas près sans requestAnimationFrame.
//
// Il lit `partie.hud` (§ 4.5.15, rempli par les règles : il se nourrit aussi bien d'un état FABRIQUÉ par un test) et les
// ÉVÉNEMENTS (§ 4.6 : touche, elim, score, annonce, phase, fin, capture, apparition, soin), notés dans les rappels et
// montrés par `maj`, dans la même image. Il ne commande jamais une règle. Habillage Airsoft par défaut (« TOUCHÉ » au lieu
// d'« ÉLIMINÉ » : arbitrage 35) ; tous les textes en français.
import * as THREE from 'three';
import { ARMES } from './armes.js';
import { EQUIPES } from './constantes.js';
import { rayonActeurs } from './touches.js';
import { actionKey } from '../settings.js';

// LES VALEURS (§ 3.6 ; CoD §§ 7.4, 9.1) — px CSS, secondes du HUD
export const REGLAGES_HUD = {
  reticule: { base: 4, trait: 9, epaisseur: 2, viseeCache: 0.5, allie: '#3d8bff', ennemi: '#ff3b30', portee: 60 },
  marqueur: { duree: 0.12, dureeElim: 0.22, echelleElim: 1.15, echelleTete: 1.35, trait: 10, ecart: 6, rouge: '#ff3b30' },
  xp: { duree: 1.5, lignes: 5, pas: 21 },
  fil: { lignes: 5, duree: 5, fondu: 0.45, pas: 26 },
  degats: { arc: 30, rayon: 120, duree: 1.6, slots: 4 },
  vignette: { seuil: 60, max: 0.85, battement: 30 },
  plaque: 30,
  chevron: { grand: 14, petit: 8, dPres: 2, dLoin: 40, nom: 15, max: 4 },
  grenade: { rayon: 7, cercle: 92, slots: 2 },
  munitionsBas: 0.30, chronoRouge: 30,
  flash: { fondu: 0.6 }, mort: { desat: 3, entree: 0.5 }, lunette: 0.85,
  annonce: { duree: 1.9, min: 0.55, file: 3 },
  objectif: { hauteur: 2.2, marge: 34 },
};
// L'HABILLAGE (arbitrage 35 ; § 3.6) : les mots seuls changent
export const TEXTES = {
  airsoft: { elim: 'TOUCHÉ', par: 'TOUCHÉ PAR', soi: 'TU T’ES TOUCHÉ TOI-MÊME' },
  militaire: { elim: 'ÉLIMINATION', par: 'ÉLIMINÉ PAR', soi: 'TU T’ES ÉLIMINÉ TOI-MÊME' },
};
const ZONES_FR = { tete: 'tête', cou: 'cou', torse: 'torse', ventre: 'ventre', jambes: 'jambes' };
// les raisons d'un événement `score` (§ 3.8, § 3.9) : le libellé de son « + »
const RAISONS = { assist: 'ASSISTANCE', assistance: 'ASSISTANCE', tete: 'TIR À LA TÊTE', couteau: 'AU COUTEAU', distance: 'LONGUE DISTANCE',
  capture: 'CAPTURE', neutralisation: 'NEUTRALISATION', defense: 'DÉFENSE', survie: 'SURVIE', provocation: 'PROVOCATION',
  manche: 'MANCHE SURVÉCUE', dernierProp: 'DERNIER PROP', aide: 'AIDE', equipe: 'MANCHE GAGNÉE', propElimine: 'PROP TROUVÉ', vraiMeuble: 'VRAI MEUBLE' };
// LES TITRES de la présentation (§§ 2.3-2.8)
const TITRES = { equipes: 'MATCH À MORT PAR ÉQUIPES', melee: 'CHACUN POUR SOI', domination: 'DOMINATION', stand: 'STAND DE TIR', essai: 'ESSAI', prophunt: 'PROP HUNT' };

// LES SILHOUETTES DES ARMES (fil des éliminations), dessinées à la main : viewBox 0 0 48 14, la bouche à droite
export const SILHOUETTES = {
  fa24: 'M1 5h9l2-1h19l1 1h9v1.3h5v1.3h-5V8h-8l-1 1h-2.4l-.5 4.3h-3.4l.6-4.3h-4.2l-.8 2.6h-2.7l.7-2.6H13L3 10.6H1z M20 2.6h6v1.4h-6z',
  pm9: 'M4 5.6h3.4l1-1.1h17l1 1.1h5.4v1.3h3.6v1.3h-3.6v1.1h-5.6l-.6.8h-2.2l-.5 4h-3.1l.5-4h-2.6l-.6 2.3h-2.5l.5-2.3H8.6L4 9.6z',
  fp12: 'M1 5.6h8l2-1.1h27v1.2h8.6v1.6H38v1.3h-4.4v1.5H23.4V8.6H16l-1.1 3h-2.7l.8-3H9.4L2 10.4H1z',
  tp50: 'M1 6.2h7l2-1h8V3.4h2v-1h9.4v1h1.2v1.8h17.2v1.4H29.6V8.4H17.8l-.8 3.4h-2.6l.8-3.4H10L2 10.8H1z M21 2.4h8v.8h-8z',
  p17: 'M14 3.8h21v3.4H23.2l-1.6 6.6h-4.4l1.5-6.6H14z',
  couteau: 'M5 7.6l9-2.5h4v4.8h-4z M18 5.3h21l5 2.3-5 2.3H18z',
  frag: 'M24 3.4a4.8 4.8 0 1 0 .01 0z M25.6 1.6h4.4v2.2h-4.4z',
  flash: 'M19.5 3.2h9v9.6h-9z M20.5 1.8h7v1.4h-7z',
  rien: 'M18 4l12 6M30 4L18 10',
};
const SVG_TETE = '<svg viewBox="0 0 14 14" aria-hidden="true"><circle cx="7" cy="5" r="3.1"/><path d="M2.4 13.2c.6-3.1 2.4-4.5 4.6-4.5s4 1.4 4.6 4.5z"/></svg>';
const SVG_CHEVRON = '<svg viewBox="0 0 14 10" aria-hidden="true"><path d="M0 0L7 5.6 14 0v4.2L7 10 0 4.2z"/></svg>';
const SVG_ARC = '<svg viewBox="-130 -130 260 260" aria-hidden="true"><path d="M-31.06-115.91A120 120 0 0 1 31.06-115.91" /></svg>';
const SVG_GRENADE = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="9.5" r="5.2"/><path d="M8.6 2.2h3.6v2.6H8.6z"/></svg>';

const DEG = Math.PI / 180;
const _v = new THREE.Vector3(), _d = new THREE.Vector3(), _o = new THREE.Vector3();
const _vise = { acteur: null, zone: null, t: 0 };
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const r1 = (x) => Math.round(x * 10) / 10, r2 = (x) => Math.round(x * 100) / 100;
const mmss = (s) => { s = Math.max(0, Math.ceil(s - 1e-6)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const nomCourt = (id) => { const f = ARMES[id]; return f ? (id === 'frag' ? 'Grenade' : id === 'flash' ? 'Flash' : f.nom.split(' ')[0]) : (id || ''); };

// ---- les petits outils du DOM : n'écrire que ce qui change ----
export function elt(tag, cls, parent, txt) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (txt !== undefined) e.textContent = txt;
  if (parent) parent.appendChild(e);
  return e;
}
// (un nœud texte gardé : une écriture = un enregistrement `characterData`)
export function texte(e, s) {
  s = String(s ?? '');
  if (e.__t === s) return;
  e.__t = s;
  const n = e.firstChild;
  if (n && n.nodeType === 3 && !n.nextSibling) n.data = s; else e.textContent = s;
}
export function classe(e, c, on) {
  on = !!on; const k = '__c' + c;
  if (e[k] === on) return;
  e[k] = on; e.classList.toggle(c, on);
}
export function cacher(e, on) { on = !!on; if (e.__h === on) return; e.__h = on; e.hidden = on; }
export function contenu(e, h) { if (e.__html === h) return; e.__html = h; e.innerHTML = h; }
// LA TAILLE DE L'ÉCRAN, gardée au `resize` (jamais lue dans maj : innerWidth n'est pas une mise en page, mais on n'en a pas
// besoin à chaque image)
export const ECRAN = { w: typeof window !== 'undefined' ? window.innerWidth : 1280, h: typeof window !== 'undefined' ? window.innerHeight : 720 };
if (typeof window !== 'undefined') window.addEventListener('resize', () => { ECRAN.w = window.innerWidth; ECRAN.h = window.innerHeight; });
// L'ÉCRITURE DE L'IMAGE : les variables CSS d'une racine, en UNE affectation, seulement si l'une a changé
export class Cadre {
  constructor(el) { this.el = el; this.s = ''; this.css = null; }
  debut() { this.s = ''; }
  v(nom, val) { this.s += '--' + nom + ':' + val + ';'; }
  ecrire() { if (this.s === this.css) return false; this.css = this.s; this.el.style.cssText = this.s; return true; }
  oublier() { this.css = null; }
}
// la projection d'un point du monde à l'écran (px CSS) : { x, y, devant, d } — `devant` faux derrière la caméra
const _p = { x: 0, y: 0, devant: false, d: 0 };
export function projeter(cam, x, y, z, out = _p) {
  _v.set(x, y, z).applyMatrix4(cam.matrixWorldInverse);
  out.devant = _v.z < -0.05; out.d = Math.hypot(x - cam.position.x, y - cam.position.y, z - cam.position.z);
  _v.applyMatrix4(cam.projectionMatrix);
  out.x = (_v.x + 1) / 2 * ECRAN.w; out.y = (1 - _v.y) / 2 * ECRAN.h;
  return out;
}
// l'angle À L'ÉCRAN (degrés, 0 = devant/en haut, sens horaire) d'une direction du monde (dx, dz), vu du lacet `lacet`
export function angleEcran(lacet, dx, dz) {
  const fx = -Math.sin(lacet), fz = -Math.cos(lacet), rx = Math.cos(lacet), rz = -Math.sin(lacet);
  return Math.atan2(dx * rx + dz * rz, dx * fx + dz * fz) / DEG;
}
// LA TAILLE DE LA MINI-CARTE (px CSS) : 200, et 160 au doigt — réduite sur une petite fenêtre (≤ 36 % de sa hauteur au PC,
// 43 % au doigt : 160 px sur un téléphone de 375 px tenu en paysage ; ≤ 30 % de la largeur ; jamais sous 96 px)
export function tailleCarte(w = ECRAN.w, h = ECRAN.h, tactile = false) {
  return Math.round(Math.max(96, Math.min(tactile ? 160 : 200, h * (tactile ? 0.43 : 0.36), w * 0.3)));
}
// l'échelle des arcs de dégâts (et de la grenade proche) : 1 dès que l'écran fait 320 px de haut et de large
export function echelleArcs(w = ECRAN.w, h = ECRAN.h) { return Math.min(1, Math.min(w, h) / 320); }
export function habillage(game) { const s = game && game.settings, j = s && s.data && s.data.jeu; return j && j.habillage === 'militaire' ? 'militaire' : 'airsoft'; }

export class HudJeu {
  constructor(game) {
    this.game = game; this.partie = null; this.el = null; this.t = 0; this._des = [];
    this._raz();
  }
  _raz() {
    this.t = 0;
    this._marque = null;                     // { t0, tete, elim, rouge, gris }
    this._xp = [];                           // [{ t0, texte, cls, slot }]
    this._fil = [];                          // [{ t0, slot, ... }]
    this._arcs = [];                         // [{ t0, dx, dz, k }]
    this._annonces = []; this._annonce = null;
    this._phaseVue = null; this._chiffre = null; this._fin = null;
    this._infoMort = null; this._zoneTouche = null; this._soins = null;
    this._captures = new Map();
    this._stand = null;
    this.ecartPx = 0; this.vise = null; this._vieT = undefined; this._alerte = null; this._presT = undefined; this._chiffreT = undefined;
  }
  // (facultative, § 4.5.5 : appelée sous l'écran PRÉPARATION — le DOM est prêt avant la première image)
  preparer() { this._creer(); }

  // ---------------------------------------------------------------- LE DOM (une fois par session)
  _creer() {
    if (this.el) return;
    const hud = document.getElementById('hud'); if (!hud) return;
    const R = this.el = elt('div', 'hj', null); R.id = 'hud-jeu'; R.dataset.jeu = '1'; cacher(R, true);
    this.cadre = new Cadre(R);
    const N = (cls, p = R, t) => elt('div', cls, p, t);
    // (dans l'ordre de l'empilement : le plein écran d'abord, les textes ensuite)
    this.eDesat = N('hj-desat'); this.eDesat.hidden = true;
    this.eLunette = N('hj-lunette'); this.eLunette.innerHTML = '<i class="hj-lu-h"></i><i class="hj-lu-v"></i><i class="hj-lu-p"></i>'; this.eLunette.hidden = true;
    this.eVignette = N('hj-vignette'); N('hj-vignette-bat', this.eVignette);
    const D = N('hj-degats'); this.eArcs = [];
    for (let i = 0; i < REGLAGES_HUD.degats.slots; i++) { const a = N('hj-arc s' + i, D); a.innerHTML = SVG_ARC; this.eArcs.push(a); }
    const G = N('hj-grenades'); this.eGren = [];
    for (let i = 0; i < REGLAGES_HUD.grenade.slots; i++) { const g = N('hj-gren s' + i, G); g.innerHTML = SVG_GRENADE + '<b></b>'; this.eGren.push(g); }
    const O = N('hj-objectifs'); this.eObj = [];
    for (let i = 0; i < 3; i++) { const o = N('hj-obj s' + i, O); o.innerHTML = '<span class="hj-obj-l">A</span><span class="hj-obj-d">0 m</span>'; this.eObj.push(o); }
    const C = N('hj-chevrons'); this.eChev = [];
    for (let i = 0; i < REGLAGES_HUD.chevron.max; i++) { const c = N('hj-chev s' + i, C); c.innerHTML = SVG_CHEVRON + '<b></b>'; this.eChev.push(c); }
    // le réticule (4 traits et un point), le marqueur de touche (4 traits en X)
    this.eViseur = N('hj-viseur'); this.eViseur.innerHTML = '<i class="h"></i><i class="b"></i><i class="g"></i><i class="d"></i><i class="p"></i>';
    this.eMarque = N('hj-marque'); this.eMarque.innerHTML = '<i class="a"></i><i class="b"></i><i class="c"></i><i class="d"></i>';
    const X = N('hj-xp'); this.eXp = [];
    for (let i = 0; i < REGLAGES_HUD.xp.lignes; i++) { const x = N('hj-xp-l s' + i, X); elt('b', null, x, ''); elt('span', null, x, ''); this.eXp.push(x); }
    this.ePlaque = N('hj-plaque', R, '');
    this.eAnnonce = N('hj-annonce', R, ''); this.eAnnonce.id = 'hud-annonce';
    this.eAlerte = N('hj-alerte', R, '');
    this.eAstuce = N('hj-astuce', R, '');
    // la présentation et le décompte
    this.ePhase = N('hj-phase'); this.ePhaseT = elt('div', 'hj-phase-t', this.ePhase, ''); this.ePhaseS = elt('div', 'hj-phase-s', this.ePhase, ''); this.ePhase.hidden = true;
    this.eChiffre = N('hj-chiffre', R, '');
    // le score et le chrono (haut gauche)
    const S = this.eScore = N('hj-score');
    this.eEq = []; for (let i = 0; i < 2; i++) { const e = N('hj-eq', S); e.innerHTML = '<span class="hj-eq-n"></span><span class="hj-eq-barre"><i></i></span><b class="hj-eq-v"></b>'; this.eEq.push(e); }
    this.eScoreTxt = N('hj-score-txt', S, '');
    this.eClock = N('hj-clock clock', S, '');
    this.eManche = N('hj-manche', S, '');
    // la domination (haut centre)
    const DM = this.eDom = N('hj-dom'); this.eDomP = [];
    for (let i = 0; i < 3; i++) { const p = N('hj-dom-p s' + i, DM); p.innerHTML = '<i></i><b>A</b>'; this.eDomP.push(p); }
    this.eDomTxt = N('hj-dom-txt', DM, '');
    this.eCapture = N('hj-capture'); this.eCapture.innerHTML = '<span></span><i><b></b></i>'; this.eCapture.hidden = true;
    // le fil des éliminations (haut droite)
    const F = N('hj-fil'); this.eFil = [];
    for (let i = 0; i < REGLAGES_HUD.fil.lignes; i++) { const l = N('hj-fil-l s' + i, F); this.eFil.push(l); }
    // la vie (au-dessus de la mini-carte), les munitions (bas droite)
    this.eVie = N('hj-vie'); this.eVie.innerHTML = '<i class="hj-vie-f"></i><b></b>';
    const M = this.eMun = N('hj-mun');
    this.eMunCh = elt('b', 'hj-mun-ch', M, ''); this.eMunRes = elt('span', 'hj-mun-res', M, '');
    this.eMunNom = elt('div', 'hj-mun-nom', M, ''); this.eMunGr = elt('div', 'hj-mun-gr', M, ''); this.eMunAide = elt('div', 'hj-mun-aide', M, '');
    // la carte de mort
    const K = this.eMort = N('hj-mort'); K.hidden = true;
    this.eMortT = elt('div', 'hj-mort-t', K, ''); this.eMortD = elt('div', 'hj-mort-d', K, ''); this.eMortR = elt('div', 'hj-mort-r', K, '');
    // le stand (la dernière balle)
    this.eStand = N('hj-stand', R, ''); this.eStand.hidden = true;
    hud.appendChild(R);
    // LE CALQUE BLANC DE LA FLASH : hors de #hud (au-dessus de lui, sous la pause : z-index 14 entre 10 et 30)
    this.eFlash = document.getElementById('voile-flash') || elt('div', null, document.body);
    this.eFlash.id = 'voile-flash'; this.eFlash.dataset.jeu = '1'; this.eFlash.hidden = true; this._flashO = -1;
  }

  // ---------------------------------------------------------------- BRANCHER (à chaque partie) : les événements notés
  brancher(partie) {
    this._creer(); if (!this.el) return;
    this.debrancher(true);
    this.partie = partie; this._raz();
    const S = (type, fn) => this._des.push(partie.sur(type, fn));
    S('touche', (e) => this._touche(e));
    S('elim', (e) => this._elim(e));
    S('score', (e) => this._score(e));
    S('annonce', (e) => this._pousserAnnonce(e.texte, e.cls));
    S('fin', (e) => this._finPartie(e));
    S('capture', (e) => this._captures.set(e.point, { t0: this.t, equipe: e.equipe, etat: e.etat }));
    S('apparition', (e) => { const L = partie.local; if (L && e.a === L.id) { this._infoMort = null; this._arcs.length = 0; } });
    S('soin', (e) => { const L = partie.local; if (L && e.a === L.id && e.pv >= 1) this._soins = { t0: this.t, pv: (this._soins && this.t - this._soins.t0 < 1 ? this._soins.pv : 0) + e.pv }; });
    // (l'annonce posée avant le branchement — par `peupler` — : celle d'une partie sans présentation ; sinon la présentation
    // la dit, voir _majAnnonce)
    if (partie.hud && partie.hud.annonce && partie.phase !== 'presentation') this._pousserAnnonce(partie.hud.annonce.texte, partie.hud.annonce.cls);
    this.cadre.oublier();
    cacher(this.el, false);
  }
  debrancher(garder = false) {
    for (const d of this._des) d(); this._des = [];
    // (la mini-carte et le tableau n'ont pas de `debrancher` au contrat : la sortie de la partie les cache ici)
    if (!garder && this.partie && this.partie.aff) { this.partie.aff.minicarte?.cacher?.(); this.partie.aff.tableau?.cacher?.(); }
    if (!garder) this.partie = null;
    if (!this.el) return;
    cacher(this.el, true);
    cacher(this.eFlash, true); this._flashO = -1; this.eFlash.style.opacity = '';
    cacher(this.eDesat, true); cacher(this.eLunette, true); cacher(this.eMort, true);
  }

  // ---------------------------------------------------------------- LES ÉVÉNEMENTS (pendant le pas : on note, maj montre)
  _local() { return this.partie ? this.partie.local : null; }
  _touche(e) {
    const L = this._local(), P = this.partie; if (!L) return;
    if (e.par === L.id && e.cible !== L.id) {
      const c = P.acteurParId(e.cible), prop = !!(c && (c.prop || c.role === 'prop'));
      // (au prop hunt, le chasseur qui touche un prop : marqueur ROUGE, § 2.8)
      if (!this._marque || this._marque.t0 !== this.t || !this._marque.elim) this._marque = { t0: this.t, tete: !!e.tete, elim: false, rouge: prop };
      if (P.id === 'stand' && c && c.role === 'cible') this._stand = { t0: this.t, zone: e.zone, degats: e.degats, d: Math.hypot(c.pos.x - L.pos.x, c.pos.z - L.pos.z) };
    }
    if (e.cible === L.id) {
      this._zoneTouche = e.zone;
      // la direction D'OÙ vient le coup : à rebours de la balle (dx, dz), sinon vers le tireur
      let sx = -(e.dx || 0), sz = -(e.dz || 0);
      if (Math.hypot(sx, sz) < 1e-6) { const k = P.acteurParId(e.par); if (k) { sx = k.pos.x - L.pos.x; sz = k.pos.z - L.pos.z; } }
      if (Math.hypot(sx, sz) < 1e-6) return;
      const A = this._arcs;
      if (A.length >= REGLAGES_HUD.degats.slots) A.shift();
      A.push({ t0: this.t, dx: sx, dz: sz, k: clamp((e.degats || 0) / 40, 0.4, 1) });
    }
  }
  _elim(e) {
    const P = this.partie, L = this._local();
    const k = P.acteurParId(e.par), v = P.acteurParId(e.cible);
    // le fil
    const ligne = { t0: this.t, tueur: k ? k.nom : null, tueurEq: k ? this._relation(k) : 'aucun', victime: v ? v.nom : '?', victimeEq: v ? this._relation(v) : 'ennemi',
      arme: e.arme, tete: !!e.tete, soi: !k || e.par === e.cible, forme: v && v.prop && v.prop.T ? v.prop.T.nom : null, moi: !!(L && (e.par === L.id || e.cible === L.id)) };
    if (this._fil.length >= REGLAGES_HUD.fil.lignes) this._fil.shift();
    this._fil.push(ligne); ligne.neuf = true;
    if (!L) return;
    const TX = TEXTES[habillage(this.game)];
    if (e.par === L.id && e.cible !== L.id) {
      this._marque = { t0: this.t, tete: !!e.tete, elim: true, rouge: true };
      const prop = !!(v && (v.prop || v.role === 'prop'));
      // (les règles s'abonnent à 'elim' AVANT le HUD : leurs `score` de cette élimination sont déjà arrivés — leurs points,
      // sinon les 100 du barème ; le « +25 » de la tête s'il n'est pas venu d'elles)
      const pts = this._ptsElim && this._ptsElim.t === this.t ? this._ptsElim.points : 100;
      this._pousserXp('+' + pts, prop ? 'PROP TROUVÉ' : TX.elim, 'elim');
      if (e.tete && !prop && this._teteT !== this.t) this._pousserXp('+25', 'TIR À LA TÊTE', 'bonus');
    } else if (Array.isArray(e.assists) && e.assists.includes(L.id)) this._pousserXp('+50', 'ASSISTANCE', 'bonus');
    if (e.cible === L.id) {
      const dist = k && k !== L ? Math.hypot(k.pos.x - L.pos.x, k.pos.y - L.pos.y, k.pos.z - L.pos.z) : null;
      this._infoMort = { tueur: k && k !== L ? k.nom : null, arme: e.arme, zone: e.tete ? 'tete' : this._zoneTouche, distance: dist, vieTueur: k && k !== L ? k.vie : null,
        t0: this.t, soi: !k || k === L, trouve: L.role === 'prop' || !!L.prop };
      this._arcs.length = 0;
    }
  }
  _score(e) {
    const L = this._local(); if (!L || e.id !== L.id || !e.points) return;
    if (e.raison === 'elim') { this._ptsElim = { t: this.t, points: e.points }; return; }
    if (e.raison === 'tete') this._teteT = this.t;
    const lib = RAISONS[e.raison] || String(e.raison || '').toUpperCase();
    this._pousserXp((e.points > 0 ? '+' : '−') + Math.abs(e.points), lib, e.points > 0 ? 'bonus' : 'malus');
  }
  _pousserXp(n, lib, cls) {
    const X = this._xp;
    if (X.length >= REGLAGES_HUD.xp.lignes) X.shift();
    X.push({ t0: this.t, n, lib, cls, neuf: true });
  }
  _pousserAnnonce(t, cls) {
    if (!t) return;
    // (les messages de la qualité automatique — `game._dire`, cls warn / bad — vont à la petite ligne d'alerte)
    if (cls === 'warn' || cls === 'bad') { this._alerte = { t0: this.t, texte: t, cls }; return; }
    const F = this._annonces;
    if (F.length >= REGLAGES_HUD.annonce.file) F.shift();
    F.push({ texte: t, cls: cls || 'info' });
  }
  _finPartie(e) {
    const P = this.partie, L = this._local(), g = e.gagnant;
    let mot = 'FIN DE LA PARTIE';
    if (g === null || g === undefined) mot = 'ÉGALITÉ';
    else if (L) mot = (typeof g === 'string' ? (g === L.equipe) : (g === L.id)) ? 'VICTOIRE' : 'DÉFAITE';
    this._fin = { t0: this.t, mot, cls: mot === 'VICTOIRE' ? 'victoire' : mot === 'DÉFAITE' ? 'defaite' : 'egalite' };
    if (P) this._annonces.length = 0;
  }
  // la relation d'un acteur à Haythem : 'moi' | 'allie' | 'ennemi'
  _relation(a) { const P = this.partie, L = this._local(); if (!L) return 'ennemi'; if (a === L) return 'moi'; return P.ennemis(L, a) ? 'ennemi' : 'allie'; }

  // ---------------------------------------------------------------- L'IMAGE
  maj(dt, hud) {
    if (!this.el || this.el.__h) return;
    const H = hud || {}, P = this.partie, g = this.game, cam = g && g.camera;
    this.t += dt || 0;
    const L = P ? P.local : null;
    const prop = !!(L && (L.role === 'prop' || L.prop));
    const vivant = L ? L.vivant !== false : true;
    const C = this.cadre; C.debut();
    const fps = !!(L && !prop && vivant && L.humain);
    const phase = H.phase || (P && P.phase) || '';
    const cachette = !!(H.prop && H.prop.cachette);
    this._majScore(H, P, L);
    this._majDomination(H, P, L, cam, C);
    this._majMunitions(H, fps && !cachette && phase !== 'presentation');
    this._majVie(H, L, C, vivant);
    this._majViseur(H, P, L, cam, C, fps && !cachette && phase !== 'presentation');
    this._majMarques(C, fps);
    this._majFil(C);
    this._majArcs(C, g ? g.camYaw : 0, vivant);
    this._majChevrons(H, P, cam, C);
    this._majGrenades(P, L, cam, C, vivant);
    this._majAnnonce(C, phase, P, H);
    this._majMort(H, P, L, C, vivant);
    this._majVignette(H, C, vivant);
    this._majLunette(H, fps, C);
    this._majStand(P);
    this._majFlash(H);
    C.ecrire();
  }

  // ---- le score, le chrono, la manche (haut gauche) ----
  _majScore(H, P, L) {
    const id = P ? P.id : null, sc = H.scores;
    const eqs = !!(sc && typeof sc.A === 'number');
    const limite = (P && (P.scoreCible ?? P.limite)) || (id === 'domination' ? 150 : 40);
    // deux équipes : celle de Haythem d'abord
    const ordre = L && L.equipe === 'B' ? ['B', 'A'] : ['A', 'B'];
    for (let i = 0; i < 2; i++) {
      const e = this.eEq[i], k = ordre[i];
      cacher(e, !eqs);
      if (!eqs) continue;
      texte(e.children[0], (EQUIPES[k] || {}).nom || k);
      texte(e.children[2], sc[k]);
      classe(e, 'eqA', k === 'A'); classe(e, 'eqB', k === 'B'); classe(e, 'moi', !!L && L.equipe === k);
      const f = clamp(sc[k] / limite, 0, 1);
      if (e.__f !== f) { e.__f = f; e.children[1].firstChild.style.transform = `scaleX(${r2(f)})`; }
    }
    // chacun pour soi : le rang de Haythem et le meneur ; prop hunt : les vivants de chaque camp
    let txt = '';
    const Pr = H.prop;
    if (Pr) txt = `PROPS ${Pr.propsRestants ?? 0} · CHASSEURS ${Pr.chasseursRestants ?? 0}`;
    else if (!eqs && id === 'melee' && Array.isArray(H.classement) && H.classement.length && L) {
      const cl = H.classement, i = cl.findIndex((c) => c.id === L.id), moi = cl[i];
      if (moi) {
        const tete = cl[0] === moi ? cl[1] : cl[0];
        txt = `${i + 1}${i ? 'e' : 'er'} · ${moi.elims ?? 0}` + (tete ? `   ${tete === cl[0] ? 'MENEUR' : '2e'} ${String(tete.nom || '').toUpperCase()} ${tete.elims ?? 0}` : '');
      }
    } else if (id === 'stand') txt = 'STAND DE TIR';
    texte(this.eScoreTxt, txt); cacher(this.eScoreTxt, !txt);
    // le chrono : en manche, en cachette, en traque (rouge sous 30 s)
    const ph = H.phase || '', ch = H.chrono;
    const montre = typeof ch === 'number' && (ch > 0 || ph === 'manche' || ph === 'traque') && id !== 'essai' && ph !== 'presentation' && ph !== 'fin';
    cacher(this.eClock, !montre);
    if (montre) { texte(this.eClock, mmss(ch)); classe(this.eClock, 'low', ch < REGLAGES_HUD.chronoRouge && (ph === 'manche' || ph === 'traque' || ph === 'cachette')); }
    const nM = H.nManches || 0;
    const man = nM > 1 ? `MANCHE ${H.manche || 1} / ${nM}` : '';
    texte(this.eManche, man); cacher(this.eManche, !man);
  }

  // ---- la domination : A, B, C en haut, l'anneau où l'on est, les marqueurs dans le monde ----
  _majDomination(H, P, L, cam, C) {
    const pts = Array.isArray(H.points) ? H.points : [];
    cacher(this.eDom, !pts.length);
    let dedans = null;
    for (let i = 0; i < 3; i++) {
      const p = pts[i], e = this.eDomP[i], o = this.eObj[i];
      if (!p) { cacher(e, true); C.v('p' + i + 'k', 0); C.v('o' + i + 'x', 0); C.v('o' + i + 'y', 0); C.v('o' + i + 'o', 0); continue; }
      cacher(e, false);
      texte(e.children[1], p.id ?? 'ABC'[i]);
      const pos = p.possesseur, cap = p.capture || {};
      classe(e, 'eqA', pos === 'A'); classe(e, 'eqB', pos === 'B');
      classe(e, 'capA', cap.equipe === 'A'); classe(e, 'capB', cap.equipe === 'B');
      const cp = this._captures.get(p.id);
      classe(e, 'pulse', !!cp && this.t - cp.t0 < 0.8);
      C.v('p' + i + 'k', r2(clamp(cap.k || 0, 0, 1)));
      // Haythem dans l'anneau (même niveau)
      if (L && L.vivant !== false && L.pos && Math.hypot(L.pos.x - p.x, L.pos.z - p.z) <= (p.r || 2.5) && Math.abs(L.pos.y - (p.y || 0)) < 1.5) dedans = p;
      // le marqueur dans le monde, ramené au bord de l'écran
      if (cam && typeof p.x === 'number') {
        const q = projeter(cam, p.x, (p.y || 0) + REGLAGES_HUD.objectif.hauteur, p.z);
        const m = REGLAGES_HUD.objectif.marge, W = ECRAN.w, Hh = ECRAN.h;
        let x = q.x, y = q.y;
        if (!q.devant) { x = W - x; y = Hh - m; }
        x = clamp(x, m, W - m); y = clamp(y, m + 40, Hh - m);
        C.v('o' + i + 'x', r1(x)); C.v('o' + i + 'y', r1(y)); C.v('o' + i + 'o', q.devant ? 1 : 0.7);
        texte(o.children[0], p.id ?? 'ABC'[i]); texte(o.children[1], Math.round(q.d) + ' m');
        classe(o, 'eqA', pos === 'A'); classe(o, 'eqB', pos === 'B');
      } else { C.v('o' + i + 'x', 0); C.v('o' + i + 'y', 0); C.v('o' + i + 'o', 0); }
    }
    // la barre de capture de l'anneau où il est
    cacher(this.eCapture, !dedans);
    if (dedans) {
      const cap = dedans.capture || {}, moi = L && L.equipe;
      const t = cap.k > 0 && cap.k < 1 ? (cap.equipe === moi ? 'PRISE DE ' : 'PERTE DE ') + (dedans.id ?? '') : dedans.possesseur === moi ? (dedans.id ?? '') + ' TENU' : 'CAPTURE ' + (dedans.id ?? '');
      texte(this.eCapture.firstChild, t);
      classe(this.eCapture, 'adverse', !!cap.equipe && cap.equipe !== moi);
      C.v('capk', r2(clamp(cap.k || 0, 0, 1)));
    } else C.v('capk', 0);
    let dernier = null; for (const c of this._captures.values()) if (!dernier || c.t0 > dernier.t0) dernier = c;
    texte(this.eDomTxt, dernier && this.t - dernier.t0 < 2 ? (dernier.etat === 'prise' ? 'POINT PRIS' : dernier.etat === 'neutralise' ? 'POINT NEUTRALISÉ' : '') : '');
  }

  // ---- les munitions (bas droite) ----
  _majMunitions(H, montre) {
    const A = H.arme;
    cacher(this.eMun, !(montre && A));
    if (!(montre && A)) return;
    const f = ARMES[A.id] || null, cap = f && f.chargeur ? f.chargeur : 0, ch = A.chargeur ?? 0, res = A.reserve ?? 0;
    texte(this.eMunCh, ch); texte(this.eMunRes, res); texte(this.eMunNom, nomCourt(A.id));
    const bas = cap > 0 && ch < cap * REGLAGES_HUD.munitionsBas, vide = ch <= 0 && res <= 0;
    classe(this.eMun, 'bas', bas); classe(this.eMun, 'vide', vide);
    const recharge = A.etat === 'recharge';
    texte(this.eMunAide, recharge ? 'RECHARGEMENT' : vide ? 'PLUS DE MUNITIONS' : bas && res > 0 ? `${actionKey('recharger')} RECHARGER` : '');
    classe(this.eMunAide, 'recharge', recharge);
    const gr = '◆'.repeat(clamp(H.letales | 0, 0, 3)) + (H.tactiques ? ' ' + '✸'.repeat(clamp(H.tactiques | 0, 0, 3)) : '');
    texte(this.eMunGr, gr);
  }

  // ---- la vie (au-dessus de la mini-carte) : seulement abîmée ----
  _majVie(H, L, C, vivant) {
    const vm = H.vieMax || 100, v = clamp(H.vie ?? vm, 0, vm), k = v / vm;
    const abimee = vivant && k < 0.999;
    if (abimee) this._vieT = this.t;
    const o = abimee ? 1 : this._vieT !== undefined ? clamp(1 - (this.t - this._vieT - 1.2) / 0.5, 0, 1) : 0;
    C.v('pvk', r2(k)); C.v('pvo', r2(o));
    C.v('cartT', tailleCarte(ECRAN.w, ECRAN.h, document.body.classList.contains('touch')));
    texte(this.eVie.lastChild, this._soins && this.t - this._soins.t0 < 1.2 ? `+${Math.round(this._soins.pv)}` : '');
    classe(this.eVie, 'basse', k < 0.3);
  }

  // ---- le réticule et ce qu'il vise ----
  _majViseur(H, P, L, cam, C, montre) {
    const Rg = REGLAGES_HUD.reticule;
    const visee = clamp(H.visee || 0, 0, 1);
    let o = montre ? clamp(1 - visee / Rg.viseeCache, 0, 1) : 0;
    // L'ÉCART QUI DIT LA VÉRITÉ : 4 px + tan(s) / tan(champV/2) × H/2
    const s = Number.isFinite(H.dispersion) ? clamp(H.dispersion, 0, 1.2) : 0;
    const champV = (P && P.vue && P.vue.champV) || (cam && cam.fov) || 58.7;
    this.ecartPx = Rg.base + Math.tan(s) / Math.tan(champV / 2 * DEG) * ECRAN.h / 2;
    C.v('ve', r1(Math.min(this.ecartPx, ECRAN.h * 0.45)));
    // CE QUE VISE LE CENTRE DE L'ÉCRAN (caméra de cette image) : un acteur à ≤ 60 m que rien ne cache — allié en bleu,
    // ennemi en rouge (et son nom à ≤ 30 m) ; au prop hunt, un prop ne colore JAMAIS le réticule (il se trahirait)
    let rel = null, nom = '';
    this.vise = null;
    if (montre && P && cam && L && o > 0) {
      cam.getWorldDirection(_d); _o.copy(cam.position);
      const r = rayonActeurs(P.acteurs, _o.x, _o.y, _o.z, _d.x, _d.y, _d.z, Rg.portee, L, _vise);
      const a = r && r.acteur;
      if (a && a.role !== 'prop' && !a.prop && a.role !== 'cible') {
        const tv = Math.max(0, r.t - 0.08);
        const libre = !P.balistique || P.balistique.vue(_o.x, _o.y, _o.z, _o.x + _d.x * tv, _o.y + _d.y * tv, _o.z + _d.z * tv);
        if (libre) { rel = P.ennemis(L, a) ? 'ennemi' : 'allie'; this.vise = { id: a.id, rel, t: r.t }; if (r.t <= REGLAGES_HUD.plaque) nom = a.nom || ''; }
      }
    }
    C.v('vo', r2(o));
    const fpsR = this.game.settings && this.game.settings.data && this.game.settings.data.controls && this.game.settings.data.controls.fps;
    C.v('vc', rel === 'allie' ? Rg.allie : rel === 'ennemi' ? Rg.ennemi : (fpsR && fpsR.reticule) || '#ffffff');
    texte(this.ePlaque, nom.toUpperCase());
    classe(this.ePlaque, 'allie', rel === 'allie');
    C.v('plo', nom ? 1 : 0);
  }

  // ---- le marqueur de touche, les « +100 » ----
  _majMarques(C, fps) {
    const M = this._marque, R = REGLAGES_HUD.marqueur;
    let o = 0, k = 1, rouge = false;
    if (M) {
      const age = this.t - M.t0, dur = M.elim ? R.dureeElim : R.duree;
      if (age <= dur + 1e-9) {
        o = age < dur * 0.6 ? 1 : clamp(1 - (age - dur * 0.6) / (dur * 0.4), 0, 1);
        k = (M.elim ? R.echelleElim : 1) * (M.tete ? R.echelleTete : 1) * (1 + 0.25 * Math.max(0, 1 - age / 0.05));
        rouge = M.rouge || M.elim;
      } else this._marque = null;
    }
    C.v('mo', r2(o)); C.v('mk', r2(k)); C.v('mc', rouge ? R.rouge : '#ffffff');
    // les « + » : la plus neuve en bas, les autres montent ; 1,5 s chacune
    const X = this._xp, Rx = REGLAGES_HUD.xp;
    for (let i = X.length - 1; i >= 0; i--) if (this.t - X[i].t0 > Rx.duree) X.splice(i, 1);
    const libres = [0, 1, 2, 3, 4].filter((s) => !X.some((x) => x.slot === s));
    for (const x of X) if (x.slot === undefined) x.slot = libres.shift();
    for (let s = 0; s < Rx.lignes; s++) {
      const i = X.findIndex((x) => x.slot === s), x = X[i], e = this.eXp[s];
      if (!x) { C.v('x' + s + 'o', 0); C.v('x' + s + 'y', 0); C.v('x' + s + 'k', 1); continue; }
      if (x.neuf) { x.neuf = false; texte(e.children[0], x.n); texte(e.children[1], x.lib); classe(e, 'elim', x.cls === 'elim'); classe(e, 'malus', x.cls === 'malus'); }
      const age = this.t - x.t0, rang = X.length - 1 - i;
      C.v('x' + s + 'o', r2(age < Rx.duree - 0.3 ? 1 : clamp((Rx.duree - age) / 0.3, 0, 1)));
      C.v('x' + s + 'y', -rang * Rx.pas);
      C.v('x' + s + 'k', r2(1 + 0.18 * Math.max(0, 1 - age / 0.14)));
    }
  }

  // ---- le fil des éliminations : 5 lignes, 5 s ----
  _majFil(C) {
    const F = this._fil, R = REGLAGES_HUD.fil;
    for (let i = F.length - 1; i >= 0; i--) if (this.t - F[i].t0 > R.duree) F.splice(i, 1);
    const libres = [0, 1, 2, 3, 4].filter((s) => !F.some((x) => x.slot === s));
    for (const x of F) if (x.slot === undefined) x.slot = libres.shift();
    for (let s = 0; s < R.lignes; s++) {
      const i = F.findIndex((x) => x.slot === s), x = F[i], e = this.eFil[s];
      if (!x) { C.v('f' + s + 'o', 0); C.v('f' + s + 'y', 0); continue; }
      if (x.neuf) {
        x.neuf = false;
        const n = (t) => String(t || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
        const arme = `<svg class="hj-arme" viewBox="0 0 48 14" aria-label="${n(nomCourt(x.arme))}"><path d="${SILHOUETTES[x.arme] || SILHOUETTES.rien}"/></svg>`;
        const v = `<span class="${x.victimeEq}">${n(x.victime)}${x.forme ? ` <small>(${n(x.forme)})</small>` : ''}</span>`;
        contenu(e, (x.soi ? '' : `<span class="${x.tueurEq}">${n(x.tueur)}</span>`) + arme + (x.tete ? `<i class="hj-tete">${SVG_TETE}</i>` : '') + v);
        classe(e, 'moi', x.moi);
      }
      const age = this.t - x.t0, rang = F.length - 1 - i;
      C.v('f' + s + 'o', r2(age < R.duree - R.fondu ? 1 : clamp((R.duree - age) / R.fondu, 0, 1)));
      C.v('f' + s + 'y', rang * R.pas);
    }
  }

  // ---- les arcs rouges vers le tireur : 30°, à 120 px du centre, 1,6 s ----
  _majArcs(C, lacet, vivant) {
    const A = this._arcs, R = REGLAGES_HUD.degats;
    for (let i = A.length - 1; i >= 0; i--) if (this.t - A[i].t0 > R.duree) A.splice(i, 1);
    // (120 px du centre ; sur un tout petit écran, ramené pour rester dedans)
    C.v('dk', r2(echelleArcs()));
    for (let s = 0; s < R.slots; s++) {
      const a = vivant ? A[s] : null;
      if (!a) { C.v('d' + s + 'o', 0); C.v('d' + s + 'r', 0); continue; }
      const age = this.t - a.t0;
      C.v('d' + s + 'r', r1(angleEcran(lacet, a.dx, a.dz)));
      C.v('d' + s + 'o', r2(a.k * (age < 0.25 ? 1 : clamp(1 - (age - 0.25) / (R.duree - 0.25), 0, 1))));
    }
  }

  // ---- les CHEVRONS BLEUS des alliés (arbitrage 46) : à travers les murs, 14 → 8 px, le nom à ≤ 15 m ----
  _majChevrons(H, P, cam, C) {
    const R = REGLAGES_HUD.chevron, L = Array.isArray(H.allies) && P && P.id !== 'prophunt' ? H.allies : [];
    this.chevrons = 0;
    for (let s = 0; s < R.max; s++) {
      const a = L[s], e = this.eChev[s];
      if (!a || !cam) { C.v('c' + s + 'o', 0); C.v('c' + s + 'x', 0); C.v('c' + s + 'y', 0); C.v('c' + s + 'k', 1); C.v('c' + s + 'n', 0); continue; }
      const q = projeter(cam, +a.x || 0, +a.y || 0, +a.z || 0);
      const dedans = Number.isFinite(q.x) && Number.isFinite(q.y) && q.devant && q.x > -20 && q.x < ECRAN.w + 20 && q.y > -20 && q.y < ECRAN.h + 20;
      const taille = R.grand + (R.petit - R.grand) * clamp((q.d - R.dPres) / (R.dLoin - R.dPres), 0, 1);
      C.v('c' + s + 'x', r1(q.x)); C.v('c' + s + 'y', r1(q.y)); C.v('c' + s + 'k', r2(taille / R.grand));
      C.v('c' + s + 'o', dedans ? 1 : 0); C.v('c' + s + 'n', dedans && q.d <= R.nom ? 1 : 0);
      if (dedans) this.chevrons++;
      texte(e.lastChild, String(a.nom || '').toUpperCase());
    }
  }

  // ---- la grenade qui roule près de Haythem (≤ 7 m) : une icône au bord du cercle, vers elle ----
  _majGrenades(P, L, cam, C, vivant) {
    const R = REGLAGES_HUD.grenade, G = P && P.grenades && Array.isArray(P.grenades.liste) ? P.grenades.liste : [];
    let n = 0;
    if (L && vivant && L.pos && cam) {
      for (const g of G) {
        if (n >= R.slots || g.type !== 'frag') continue;
        const dx = g.x - L.pos.x, dz = g.z - L.pos.z, d = Math.hypot(dx, dz, g.y - L.pos.y);
        if (d > R.rayon) continue;
        const a = angleEcran(this.game.camYaw, dx, dz) * DEG;
        C.v('g' + n + 'x', r1(Math.sin(a) * R.cercle)); C.v('g' + n + 'y', r1(-Math.cos(a) * R.cercle)); C.v('g' + n + 'o', 1); C.v('g' + n + 'r', r1(a / DEG));
        texte(this.eGren[n].lastChild, Math.round(d) + ' m');
        n++;
      }
    }
    for (; n < R.slots; n++) { C.v('g' + n + 'x', 0); C.v('g' + n + 'y', 0); C.v('g' + n + 'o', 0); C.v('g' + n + 'r', 0); }
  }

  // ---- les annonces, la présentation, le décompte, la fin ----
  _majAnnonce(C, phase, P, H) {
    const R = REGLAGES_HUD.annonce;
    // la PRÉSENTATION : le titre du mode et ce qu'il faut savoir (les annonces de la présentation sont son titre : ignorées)
    if (phase !== this._phaseVue) {
      this._phaseVue = phase;
      if (phase === 'presentation') { this._presT = this.t; this._annonces.length = 0; this._annonce = null; }
      if (phase === 'mi_temps') this._pousserAnnonce('MI-TEMPS — LES CAMPS S’ÉCHANGENT', 'info');
    }
    const pres = phase === 'presentation' && P;
    cacher(this.ePhase, !pres);
    if (pres) {
      const [t, s] = this._presentation(P, H);
      texte(this.ePhaseT, t); texte(this.ePhaseS, s);
      const age = this.t - (this._presT ?? this.t);
      C.v('pho', r2(clamp(age / 0.25, 0, 1) * clamp((Math.max(0.6, H.phaseDuree || 3) - (H.phaseT || 0)) / 0.35, 0, 1)));
      C.v('phk', r2(1 + 0.12 * Math.max(0, 1 - age / 0.3)));
      this._annonces.length = 0;
    } else { C.v('pho', 0); C.v('phk', 1); }
    // LE DÉCOMPTE : 3, 2, 1 (chacun relancé)
    let ch = '';
    if (phase === 'decompte') ch = String(Math.max(1, Math.ceil((H.phaseDuree || 0) - (H.phaseT || 0) - 1e-6)));
    if (this._fin && this.t - this._fin.t0 < 2.5) ch = this._fin.mot;
    if (ch !== this._chiffre) { this._chiffre = ch; this._chiffreT = this.t; texte(this.eChiffre, ch); classe(this.eChiffre, 'mot', ch.length > 2); for (const c of ['victoire', 'defaite', 'egalite']) classe(this.eChiffre, c, !!this._fin && ch === this._fin.mot && this._fin.cls === c); }
    const ac = this.t - (this._chiffreT ?? 0);
    C.v('cho', ch ? r2(ch.length > 2 ? clamp(ac / 0.2, 0, 1) * clamp((2.5 - ac) / 0.4, 0, 1) : clamp(1 - (ac - 0.55) / 0.4, 0, 1)) : 0);
    C.v('chk', r2(ch ? (ch.length > 2 ? 1 + 0.15 * Math.max(0, 1 - ac / 0.25) : 1.45 - 0.45 * clamp(ac / 0.18, 0, 1)) : 1));
    // LES ANNONCES : une file courte (une annonce reste au moins 0,55 s), chacune RELANCÉE
    const A = this._annonce;
    if (this._annonces.length && (!A || this.t - A.t0 >= R.min)) {
      const n = this._annonces.shift();
      this._annonce = { t0: this.t, texte: n.texte, cls: n.cls };
      texte(this.eAnnonce, n.texte);
      for (const c of ['go', 'info', 'prop', 'alerte']) classe(this.eAnnonce, c, n.cls === c);
      this.annonces = (this.annonces || 0) + 1;
    }
    const B = this._annonce;
    if (B) {
      const age = this.t - B.t0;
      if (age > R.duree) this._annonce = null;
      C.v('ano', r2(age < 0.08 ? age / 0.08 : age < R.duree - 0.4 ? 1 : clamp((R.duree - age) / 0.4, 0, 1)));
      C.v('ank', r2(age < 0.12 ? 0.7 + 0.38 * age / 0.12 : age < 0.2 ? 1.08 - 0.08 * (age - 0.12) / 0.08 : 1));
      C.v('any', r1(age > R.duree - 0.4 ? -20 * (age - (R.duree - 0.4)) / 0.4 : 0));
    } else { C.v('ano', 0); C.v('ank', 1); C.v('any', 0); }
    // l'astuce des règles (`hud.astuce`), tant qu'elles la donnent
    const ast = typeof H.astuce === 'string' ? H.astuce : H.astuce && H.astuce.texte ? H.astuce.texte : '';
    texte(this.eAstuce, ast); cacher(this.eAstuce, !ast);
    // la petite ligne d'alerte (qualité automatique)
    const Al = this._alerte, alv = !!Al && this.t - Al.t0 < 3;
    texte(this.eAlerte, alv ? Al.texte : ''); classe(this.eAlerte, 'bad', alv && Al.cls === 'bad');
    C.v('alo', alv ? r2(clamp((3 - (this.t - Al.t0)) / 0.5, 0, 1)) : 0);
  }
  _presentation(P, H) {
    const id = P.id, L = P.local;
    const lim = P.scoreCible ?? (id === 'domination' ? 150 : id === 'melee' ? 20 : 40), dur = P.duree ? mmss(P.duree) : '';
    if (id === 'prophunt') {
      const pr = L && (L.role === 'prop' || L.prop);
      const m = H.nManches > 1 ? `MANCHE ${H.manche || 1} / ${H.nManches}` : '';
      return pr ? ['TU ES PROP — CACHE-TOI !', [m, 'deviens un meuble de l’école'].filter(Boolean).join(' · ')]
        : ['TU ES CHASSEUR', [m, 'trouve les faux meubles'].filter(Boolean).join(' · ')];
    }
    if (id === 'equipes') return [TITRES.equipes, `${EQUIPES.A.nom} CONTRE ${EQUIPES.B.nom} · ${lim} ÉLIMINATIONS${dur ? ' · ' + dur : ''}`];
    if (id === 'domination') return [TITRES.domination, `${EQUIPES.A.nom} CONTRE ${EQUIPES.B.nom} · ${lim} POINTS${dur ? ' · ' + dur : ''}`];
    if (id === 'melee') return [TITRES.melee, `${lim} ÉLIMINATIONS${dur ? ' · ' + dur : ''}`];
    return [TITRES[id] || 'PARTIE', ''];
  }

  // ---- la caméra de mort : la carte, l'image désaturée 3 s ----
  _majMort(H, P, L, C, vivant) {
    const mort = !!L && !vivant;
    const I = H.mort || this._infoMort;
    cacher(this.eMort, !mort);
    // (l'âge de la mort : celle que le HUD a vue, sinon celle des règles — `hud.mort.t`, en temps de partie)
    const age = !mort ? 0 : this._infoMort ? this.t - this._infoMort.t0 : H.mort && P && typeof H.mort.t === 'number' ? P.t - H.mort.t : 0;
    cacher(this.eDesat, !mort || age > REGLAGES_HUD.mort.desat + 0.6);
    C.v('dso', mort ? r2(clamp(age / 0.4, 0, 1) * clamp((REGLAGES_HUD.mort.desat + 0.6 - age) / 0.6, 0, 1)) : 0);
    if (!mort) { C.v('mto', 0); return; }
    const TX = TEXTES[habillage(this.game)];
    const prop = P && P.id === 'prophunt';
    let nom = I && I.tueur !== undefined && I.tueur !== null ? I.tueur : null;
    if (typeof nom === 'number' && P) { const k = P.acteurParId(nom); nom = k ? k.nom : null; }
    const soi = !!(I && I.soi) || (I && !nom);
    texte(this.eMortT, soi ? TX.soi : `${prop && I && I.trouve ? 'TROUVÉ PAR' : TX.par} ${String(nom).toUpperCase()}`);
    const d = [];
    if (I) {
      if (I.arme) d.push(nomCourt(I.arme));
      if (I.zone) d.push(ZONES_FR[I.zone] || I.zone);
      if (typeof I.distance === 'number') d.push(Math.round(I.distance) + ' m');
      if (typeof I.vieTueur === 'number' && !soi) d.push(`il lui reste ${Math.max(0, Math.round(I.vieTueur))} PV`);
    }
    texte(this.eMortD, d.join(' · '));
    const rt = H.reapparitionT || 0;
    const spect = prop || (P && P.id !== 'essai' && rt <= 0 && (H.phase === 'traque' || H.phase === 'cachette'));
    texte(this.eMortR, spect ? 'SPECTATEUR JUSQU’À LA FIN DE LA MANCHE' : rt > 0 ? `RÉAPPARITION DANS ${rt.toFixed(1).replace('.', ',')} s · ${actionKey('jump')} : passer` : '');
    C.v('mto', r2(clamp((age - 0.15) / 0.3, 0, 1)));
  }

  // ---- la vignette rouge : (1 − vie/60) × 0,85 sous 60 PV, qui bat à 1,2 Hz sous 30 ----
  _majVignette(H, C, vivant) {
    const R = REGLAGES_HUD.vignette, v = H.vie ?? 100;
    const o = vivant && v < R.seuil ? (1 - v / R.seuil) * R.max : 0;
    this.vignette = o;
    C.v('vgo', r2(o));
    classe(this.eVignette, 'bat', vivant && v < R.battement && v > 0);
  }

  // ---- la lunette du TP-50 : à 85 % de la visée, le masque (l'arme de vue se cache, L-V) ----
  _majLunette(H, fps, C) {
    const A = H.arme, f = A && ARMES[A.id];
    const on = !!(fps && f && f.zoom >= 3 && (H.visee || 0) >= REGLAGES_HUD.lunette);
    cacher(this.eLunette, !on);
    classe(this.el, 'lunette', on);
  }

  // ---- le stand : la dernière balle (zone, dégâts, distance) ----
  _majStand(P) {
    const S = this._stand, on = !!(P && P.id === 'stand' && S && this.t - S.t0 < 4);
    cacher(this.eStand, !on);
    if (on) texte(this.eStand, `${(ZONES_FR[S.zone] || S.zone || '').toUpperCase()} · ${Math.round(S.degats || 0)} DÉGÂTS · ${Math.round(S.d)} m`);
  }

  // ---- LE CALQUE BLANC DE LA FLASH (§ 3.3) : opacité 1 tant que t < durée − 0,6, puis (durée − t) / 0,6 ----
  _majFlash(H) {
    const a = H.aveugle;
    let o = 0;
    if (a && typeof a.t === 'number' && a.duree > 0) o = a.t < a.duree - REGLAGES_HUD.flash.fondu ? 1 : clamp((a.duree - a.t) / REGLAGES_HUD.flash.fondu, 0, 1);
    o = r2(o);
    if (o === this._flashO) return;
    this._flashO = o;
    cacher(this.eFlash, o <= 0);
    this.eFlash.style.opacity = String(o);
  }
}
