// =====================================================================
//  LES DÉGUISEMENTS — squelette du socle S0 (22/10), rempli par le lot L-K (vague 3 : L-O)
// =====================================================================
// Devenir un vrai meuble de l'école (spec §§ 3.9, 4.5.13) : le catalogue (les types du registre, js/registre_meubles.js,
// plus un type de SECOURS, le carton), viser un meuble, s'en déguiser (refusé sans la place), le poser à l'affichage, sa
// crédibilité (la même formule pour les bots chasseurs et la jauge DISCRÉTION de Haythem), les cachettes, et les
// CANDIDATS que voit un chasseur — vraies poses ET props vivants, MÊLÉS et SANS MARQUE : la seule porte par laquelle un
// cerveau de chasseur voit des meubles (il ne lit jamais `role` ni `prop` d'un acteur). Le squelette : crédibilité 0,5,
// aucune cachette, `toucherPoses` → null, la racine posée sans rien d'autre (pas de voile, pas de surbrillance).
import * as THREE from 'three';
import { MEUBLES, rattraperRegistre, zonerRegistre, copieMeuble } from '../registre_meubles.js';
import { piecesDe } from './apparitions.js';

// LE CARTON de secours (0,45 × 0,35 × 0,45) : un matériau standard sans carte (le programme existe déjà dans l'école)
const CARTON = 'carton';
let _carton = null;
function typeCarton() {
  if (_carton) return _carton;
  const geo = new THREE.BoxGeometry(0.45, 0.35, 0.45).translate(0, 0.175, 0);
  const mat = new THREE.MeshStandardMaterial({ color: 0xa8865a, roughness: 0.9, metalness: 0 });
  const proto = new THREE.Group(); const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; proto.add(m);
  const boite = new THREE.Box3(new THREE.Vector3(-0.225, 0, -0.225), new THREE.Vector3(0.225, 0.35, 0.225));
  const volume = 0.45 * 0.35 * 0.45;
  _carton = { cle: CARTON, type: CARTON, variante: null, nom: 'le carton', proto, boite, taille: new THREE.Vector3(0.45, 0.35, 0.45),
    rayon: Math.max(0.15, 0.45 / 2 * 0.9), haut: 0.35, volume, pv: Math.round(Math.min(145, Math.max(60, 40 + 90 * Math.cbrt(volume)))),
    vitesse: 4.6 * Math.min(1.05, Math.max(0.72, 1.15 - 0.35 * Math.cbrt(volume))), mural: false, surPlace: false, deguisable: true, voile: true };
  return _carton;
}
export const CATALOGUE = new Map();
export function typeDe(cle) { return CATALOGUE.get(cle) || MEUBLES.types.get(cle) || (cle === CARTON ? typeCarton() : null); }

// LE CATALOGUE (écran PRÉPARATION) : les meubles cousus seuls rattrapés, les poses rangées par pièce, les prototypes
// compilés ; le carton de secours toujours là
export async function preparerCatalogue(game, progres) {
  if (progres) progres('Meubles', 0);
  rattraperRegistre(game.scene);
  zonerRegistre(game.carte && game.carte.lumieres);
  CATALOGUE.clear();
  for (const [cle, T] of MEUBLES.types) CATALOGUE.set(cle, T);
  CATALOGUE.set(CARTON, typeCarton());
  if (progres) progres('Meubles', 1);
  return CATALOGUE;
}
// les types déguisables d'une zone de jeu (au registre seulement : le carton de secours ne compte pas pour griser une zone)
export function typesDeguisables(zoneJeu) {
  const P = piecesDe(zoneJeu), vus = new Set();
  for (const p of MEUBLES.poses) { const T = MEUBLES.types.get(p.cle); if (T && T.deguisable && P.has(p.zone)) vus.add(p.cle); }
  return [...vus];
}
// le meuble visé depuis le PIVOT du prop (pas la caméra) : le plus proche à moins de 3 m devant (squelette)
export function viserMeuble(partie, acteur, lacet, tangage) {
  const p = acteur.corps.pos, fx = -Math.sin(lacet), fz = -Math.cos(lacet);
  let best = null, bd = 3;
  for (const P of MEUBLES.poses) {
    const dx = P.x - p.x, dz = P.z - p.z, d = Math.hypot(dx, dz);
    if (d < bd && Math.abs(P.y - p.y) < 1.5 && (dx * fx + dz * fz) > 0.3 * d) { bd = d; best = { cle: P.cle, pose: P }; }
  }
  for (const b of partie.acteurs) {
    if (b === acteur || !b.vivant || !b.prop) continue;
    const dx = b.pos.x - p.x, dz = b.pos.z - p.z, d = Math.hypot(dx, dz);
    if (d < bd && (dx * fx + dz * fz) > 0.3 * d) { bd = d; best = { cle: b.prop.cle, acteur: b }; }
  }
  return best;
}
// SE DÉGUISER en `cle` : refusé sans la place (C.libre au rayon du type) ; PV gardés en proportion ; événement 'deguise'
export function deguiser(partie, acteur, cle) {
  const T = typeDe(cle); if (!T) return false;
  const c = acteur.corps, C = partie.game.collisions;
  if (C && !C.libre(c.pos.x, c.pos.z, T.rayon, c.pos.y)) return false;
  const avant = acteur.prop, k = avant ? avant.pv / Math.max(1, avant.T.pv) : acteur.vie / Math.max(1, acteur.vieMax);
  if (avant && avant.racine && avant.racine.parent) avant.racine.parent.remove(avant.racine);
  const racine = cle === CARTON ? T.proto.clone(true) : copieMeuble(cle) || T.proto.clone(true);
  racine.userData.dynamique = true; racine.userData.meuble = cle;
  partie.game.scene.add(racine);
  acteur.prop = { cle, T, racine, cap: c.ang || 0, fige: false, verrou: false, pv: Math.max(1, Math.round(T.pv * k)),
    changements: avant ? (avant.changements || 0) + 1 : 0, provocT: avant ? avant.provocT : 0, vitesseAff: 0, rotAff: 0 };
  acteur.vieMax = T.pv; acteur.vie = acteur.prop.pv;
  c.rayon = T.rayon;
  partie.evt('deguise', { a: acteur.id, cle, x: c.pos.x, y: c.pos.y, z: c.pos.z });
  return true;
}
export function retirerProp(partie, acteur) {
  const P = acteur.prop; if (!P) return;
  if (P.racine && P.racine.parent) P.racine.parent.remove(P.racine);
  acteur.prop = null;
}
// L'AFFICHAGE des props (une fois par image) : la racine à la position et au cap AFFICHÉS, jamais penchée
export function majProps(partie, dt) {
  for (const a of partie.acteurs) {
    const P = a.prop; if (!P || !P.racine || !a.corps) continue;
    const c = a.corps;
    P.racine.visible = a.vivant;
    P.racine.position.set(c.posAff.x, c.posAff.y, c.posAff.z);
    P.racine.rotation.set(0, c.angAff ?? c.ang ?? 0, 0);
  }
}
// la crédibilité d'un meuble posé là (0..1) — squelette : 0,5 partout
export function credibilite(cle, x, y, z, cap, zone, { contreMur = false } = {}) { return 0.5; }
export function pasRangee(pose) { return 0; }
export function distPassage(x, y, z) { return Infinity; }
// les cachettes d'une zone, par lots (≤ 5 ms chacun) — squelette : aucune
export function* cachettes(zoneJeu, navProps) { yield []; return []; }

// LES CANDIDATS d'un chasseur : vraies poses ET props vivants à ≤ rayon, MÊLÉS et SANS MARQUE (`ref` opaque)
const _refs = new Map();
let _nRef = 0;
const refDe = (cle) => { let r = _refs.get(cle); if (r === undefined) { r = ++_nRef; _refs.set(cle, r); } return r; };
export function candidatsMeubles(partie, x, y, z, rayon, out) {
  out = out || [];
  out.length = 0;
  for (const P of MEUBLES.poses) {
    if (Math.hypot(P.x - x, P.z - z) > rayon || Math.abs(P.y - y) > 2) continue;
    out.push({ x: P.x, y: P.y, z: P.z, cap: P.cap, cle: P.cle, ref: refDe('p' + P.i) });
  }
  for (const b of partie.acteurs) {
    if (!b.vivant || !b.prop || !b.corps) continue;
    const p = b.corps.pos;
    if (Math.hypot(p.x - x, p.z - z) > rayon || Math.abs(p.y - y) > 2) continue;
    out.push({ x: p.x, y: p.y, z: p.z, cap: b.prop.cap, cle: b.prop.cle, ref: refDe('a' + b.id) });
  }
  // mêlés : triés par position (ni les poses d'abord, ni les props)
  out.sort((a, b) => a.x - b.x || a.z - b.z);
  return out;
}
// (pour les TESTS seulement : à quoi correspond une `ref` — jamais lu par un cerveau)
export function _refEstActeur(ref) { for (const [k, v] of _refs) if (v === ref) return k[0] === 'a'; return false; }
// la vraie pose touchée par un rayon avant tMax : { pose, t } — squelette : aucune
export function toucherPoses(ox, oy, oz, dx, dy, dz, tMax) { return null; }
