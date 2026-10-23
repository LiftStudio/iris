// =====================================================================
//  L'AIDE À LA VISÉE — lot L-I (23/10/2026 ; spec §§ 3.2, 4.5.18, 5.5.13)
// =====================================================================
// À la MANETTE et au DOIGT, JAMAIS à la souris (entree.manette, ou le doigt pour dernière entrée — js/touch.js auDoigt) :
// un stick et un pouce ne visent pas au pixel, une souris si. Quatre aides, toutes sur le BUSTE simulé des ennemis
// (js/jeu/touches.js capsules : jamais les os affichés, jamais un meuble — un prop déguisé n'est PAS une cible, l'aide le
// trahirait) et seulement pour un ennemi VU (balistique.vue, l'œil → le buste) :
//   - le RALENTISSEMENT : la vitesse du stick (et du doigt qui vise) × 0,55 en visée, × 0,7 à la hanche, quand le centre de
//     l'écran est à moins de atan(0,45 / d) + 1° du buste d'un ennemi à ≤ 40 m — `facteurStick`, lu une fois par image par
//     js/manette.js et js/touch.js ;
//   - le SUIVI : quand le regard bouge (stick droit ou doigt), + 45 % de la vitesse angulaire de cette même cible (elle
//     file à 6 m/s en travers : le réticule l'accompagne un peu, sans la coller) ;
//   - l'AIMANT D'ADS : au front de la visée, une cible à < 7° et < 30 m → la visée tourne de 70 % de l'écart pendant le temps
//     d'ADS de l'arme (courbe 1 − (1 − u)³, celle de la visée) ; une cible qui bouge est suivie pendant ce temps ;
//   - le TIR AUTO (au doigt seulement, réglage controls.fps.tirAuto, vrai au téléphone) : le réticule SUR un ennemi à ≤ 30 m
//     pendant 0,12 s → cmd.tir ; il tient tant que le réticule y reste (0,05 s de grâce : le recul l'en sort une image).
// `corriger(cmd, game, dt)` est appelée par lireCommande (js/jeu/entrees_jeu.js, étape 2 du pas) : elle réécrit
// game.camYaw / camPitch ET cmd.lacet / tangage (sinon la commande suivante, relue sur game, annulerait l'aimant). Elle ne lit
// ni l'horloge ni le hasard, et pas Input (le seul lecteur en est lireCommande) : « le regard bouge » est un drapeau que la
// manette et le doigt posent eux-mêmes (`regardBouge`). Son état (la cible suivie, l'aimant en cours, le chrono du tir
// auto) est rangé PAR PARTIE : une partie neuve repart de rien. Les valeurs : AIDE, en tête.
import * as THREE from 'three';
import { capsules } from './touches.js';
import { settings as reglages, entree } from '../settings.js';

const DEG = Math.PI / 180;
export const AIDE = {
  ralenti: { visee: 0.55, hanche: 0.7, demiBuste: 0.45, margeDeg: 1, portee: 40 },
  suivi: { part: 0.45 },
  aimant: { angleDeg: 7, portee: 30, part: 0.7, adsDefaut: 0.25 },
  tirAuto: { delai: 0.12, portee: 30, demiLargeur: 0.28, grace: 0.05 },
};

const _o = new THREE.Vector3(), _L = [];
const _etats = new WeakMap();
const etat = (p) => {
  let S = _etats.get(p);
  if (!S) { S = { viseeAvant: false, aimant: null, suivi: null, tirSur: -1, tirT: 0, perduT: 0, tirAuto: false, cible: null }; _etats.set(p, S); }
  return S;
};
const R = () => (reglages.controls && reglages.controls.fps) || {};
const borne = (v, a, b) => Math.max(a, Math.min(b, v));
const enrouler = (a) => a - 2 * Math.PI * Math.round(a / (2 * Math.PI));

// le doigt pour dernière entrée (js/touch.js auDoigt ; `entree.tactile` n'existe que là où il y a des commandes tactiles)
export function auDoigt() { return !!(entree.tactile && typeof window !== 'undefined' && window.__touch && window.__touch.auDoigt); }
// l'aide est-elle permise ? la manette ou le doigt — jamais la souris
export function aideActive() { return !!entree.manette || auDoigt(); }
// le regard bouge-t-il en ce moment (stick droit poussé, doigt qui glisse) ? — drapeaux posés par js/manette.js et js/touch.js
function regardBouge(game) {
  const M = game.input && game.input.manette;
  if (entree.manette && M && M.regardBouge) return true;
  return auDoigt() && !!window.__touch.regardBouge;
}

// LE BUSTE SIMULÉ d'un acteur (le milieu de la capsule du torse ; le panneau d'une cible du stand) et la hauteur de sa
// silhouette (le tir auto) : { x, y, z, bas, haut, r }
function buste(b, out) {
  const K = capsules(b, _L);
  let t = null, bas = Infinity, haut = -Infinity, r = 0.25;
  for (const k of K) {
    if (k.t === 'c') { bas = Math.min(bas, k.ay - k.r); haut = Math.max(haut, k.by + k.r); if (k.zone === 'torse') t = k; }
    else { bas = Math.min(bas, k.cy - k.hy); haut = Math.max(haut, k.cy + k.hy); if (k.zone === 'torse') t = k; }
  }
  if (!t) return null;
  if (t.t === 'c') { out.x = (t.ax + t.bx) / 2; out.y = (t.ay + t.by) / 2; out.z = (t.az + t.bz) / 2; out.r = AIDE.tirAuto.demiLargeur * b.h / 1.73; }
  else { out.x = t.cx; out.y = t.cy; out.z = t.cz; out.r = Math.max(t.hx, t.hz); }
  out.bas = bas; out.haut = haut;
  return out;
}

// LES CIBLES D'AIDE vues de l'œil de `a` selon le regard (lacet, tangage) : pour chaque ennemi vivant, humain (jamais un
// prop déguisé) et à ≤ `portee`, l'écart angulaire entre le centre de l'écran et son buste, et les angles du buste.
// `affiche` : la position AFFICHÉE (une fois par image : le stick, le doigt) ; sinon l'état simulé (dans le pas). La ligne
// de vue n'est demandée qu'à ceux que le filtre angulaire garde (`garde(c) → bool`).
function chercher(p, a, lacet, tangage, portee, affiche, garde) {
  const o = a.oeil(_o, affiche);
  const ct = Math.cos(tangage), fx = -Math.sin(lacet) * ct, fy = -Math.sin(tangage), fz = -Math.cos(lacet) * ct;
  let mieux = null;
  for (const b of p.acteurs) {
    if (b === a || !b.vivant || !b.corps || b.prop || !p.ennemis(a, b)) continue;
    const B = buste(b, {}); if (!B) continue;
    if (affiche && b.corps.posAff) { B.x += b.corps.posAff.x - b.corps.pos.x; B.z += b.corps.posAff.z - b.corps.pos.z; }
    const vx = B.x - o.x, vy = B.y - o.y, vz = B.z - o.z, d = Math.hypot(vx, vy, vz);
    if (d < 0.3 || d > portee) continue;
    const ecart = Math.acos(borne((vx * fx + vy * fy + vz * fz) / d, -1, 1));
    const c = { acteur: b, id: b.id, d, ecart, l: Math.atan2(-vx, -vz), t: Math.atan2(-vy, Math.hypot(vx, vz)), B, o: { x: o.x, y: o.y, z: o.z }, f: { x: fx, y: fy, z: fz } };
    if (!garde(c)) continue;
    if (mieux && c.note >= mieux.note) continue;
    if (!p.balistique || !p.balistique.vue(o.x, o.y, o.z, B.x, B.y, B.z)) continue;
    mieux = c;
  }
  return mieux;
}
// le cône du ralentissement : atan(0,45 / d) + 1°, noté en part de lui (la cible la mieux centrée l'emporte)
function gardeRalenti(c) { const s = Math.atan(AIDE.ralenti.demiBuste / c.d) + AIDE.ralenti.margeDeg * DEG; c.seuil = s; c.note = c.ecart / s; return c.ecart < s; }
function gardeAimant(c) { c.note = c.ecart; return c.ecart < AIDE.aimant.angleDeg * DEG && c.d < AIDE.aimant.portee; }
// le réticule SUR la silhouette : la distance du rayon de visée à l'axe du corps (du bas au haut de la silhouette) ≤ son
// demi-tour de taille (0,28 m pour 1,73 m) ; au-delà de 30 m, jamais
function gardeTir(c) {
  const B = c.B, o = c.o, f = c.f;
  if (c.d > AIDE.tirAuto.portee) return false;
  // le point du rayon le plus proche de l'axe vertical (x, z) du buste, puis la hauteur bornée à la silhouette
  const h = Math.hypot(f.x, f.z), tH = h > 1e-6 ? ((B.x - o.x) * f.x + (B.z - o.z) * f.z) / (h * h) : 0;
  if (tH <= 0) return false;
  const px = o.x + f.x * tH, py = o.y + f.y * tH, pz = o.z + f.z * tH;
  const ecH = Math.hypot(px - B.x, pz - B.z), ecV = py < B.bas ? B.bas - py : py > B.haut ? py - B.haut : 0;
  c.note = ecH + ecV;
  return ecH <= B.r && ecV <= 0.05;
}

// LE RALENTISSEMENT (× 0,55 en visée, × 0,7 à la hanche, entre les deux selon la visée) — une fois par image, sur la
// position affichée et le regard de l'écran. 1 à la souris, hors partie, sans cible, aide coupée (controls.fps.aideVisee).
export function facteurStick(game) {
  const p = game && game.partie; if (!p || !aideActive() || R().aideVisee === false) return 1;
  const a = p.local; if (!a || !a.vivant || a.prop || !a.arsenal || !a.joueur || a.corps !== a.joueur) return 1;
  const c = chercher(p, a, game.camYaw, game.camPitch, AIDE.ralenti.portee, true, gardeRalenti);
  if (!c) return 1;
  const v = borne(a.arsenal.visee || 0, 0, 1);
  return AIDE.ralenti.hanche + (AIDE.ralenti.visee - AIDE.ralenti.hanche) * v;
}

// L'ÉTAT DE L'AIDE dans une partie (le tir auto en cours, pour js/touch.js qui éclaire TIR ; les tests)
export function etatAide(partie) { return partie ? etat(partie) : null; }

// LA CORRECTION de la commande de Haythem, au pas (lireCommande) : aimant d'ADS, suivi, tir auto
export function corriger(cmd, game, dt) {
  const p = game && game.partie; if (!p) return cmd;
  const S = etat(p);
  const a = p.local;
  const actif = aideActive() && a && a.local && a.vivant && !a.prop && a.arsenal && a.corps === a.joueur && p.profil === 'combat';
  const visee = !!cmd.visee;
  if (!actif) { S.viseeAvant = visee; S.aimant = null; S.suivi = null; S.tirSur = -1; S.tirT = 0; S.tirAuto = false; return cmd; }
  const aide = R().aideVisee !== false;
  let l = game.camYaw, t = game.camPitch;
  // 1. L'AIMANT D'ADS : au front de la visée, la cible à < 7° et < 30 m ; 70 % de l'écart rattrapés pendant le temps d'ADS
  if (aide && visee && !S.viseeAvant) {
    const c = chercher(p, a, l, t, AIDE.aimant.portee, false, gardeAimant);
    S.aimant = c ? { id: c.id, u: 0, f: 0, T: (a.arsenal.arme && a.arsenal.arme.ads) || AIDE.aimant.adsDefaut } : null;
  }
  if (S.aimant && (!visee || !aide)) S.aimant = null;
  if (S.aimant) {
    const M = S.aimant, b = p.acteurParId(M.id);
    const c = b && b.vivant ? chercher(p, a, l, t, AIDE.aimant.portee * 1.2, false, (k) => { k.note = 0; return k.id === M.id; }) : null;
    if (!c) S.aimant = null;
    else {
      M.u = Math.min(1, M.u + dt / M.T);
      const f = AIDE.aimant.part * (1 - Math.pow(1 - M.u, 3)), k = (f - M.f) / (1 - M.f);
      l += enrouler(c.l - l) * k; t += (c.t - t) * k; M.f = f;
      if (M.u >= 1) S.aimant = null;
    }
  }
  S.viseeAvant = visee;
  // 2. LE SUIVI : le regard bouge et une cible est dans le cône du ralentissement → + 45 % de sa vitesse angulaire
  const c = aide ? chercher(p, a, l, t, AIDE.ralenti.portee, false, gardeRalenti) : null;
  S.cible = c ? c.id : null;
  if (c && S.suivi && S.suivi.id === c.id && regardBouge(game)) {
    l += AIDE.suivi.part * enrouler(c.l - S.suivi.l);
    t += AIDE.suivi.part * (c.t - S.suivi.t);
  }
  S.suivi = c ? { id: c.id, l: c.l, t: c.t } : null;
  // 3. LE TIR AUTO (au doigt) : 0,12 s le réticule sur un ennemi à ≤ 30 m → tir, tant qu'il y reste (0,05 s de grâce)
  if (auDoigt() && R().tirAuto && p.peutTirer(a)) {
    const s = chercher(p, a, l, t, AIDE.tirAuto.portee, false, gardeTir);
    if (s) { if (s.id !== S.tirSur) { S.tirSur = s.id; S.tirT = 0; } else S.tirT += dt; S.perduT = 0; }
    else if (S.tirSur >= 0) { S.perduT += dt; if (S.perduT > AIDE.tirAuto.grace) { S.tirSur = -1; S.tirT = 0; } }
    S.tirAuto = S.tirSur >= 0 && S.tirT >= AIDE.tirAuto.delai - 1e-9;
    if (S.tirAuto) cmd.tir = true;
  } else { S.tirSur = -1; S.tirT = 0; S.tirAuto = false; }
  // le regard réécrit : la caméra ET la commande (bornes du tangage de la partie)
  if (l !== game.camYaw || t !== game.camPitch) {
    const [lo, hi] = game.bornesTangage ? game.bornesTangage() : [-1.48, 1.48];
    game.camYaw = l; game.camPitch = borne(t, lo, hi);
    cmd.lacet = game.camYaw; cmd.tangage = game.camPitch;
  }
  return cmd;
}
