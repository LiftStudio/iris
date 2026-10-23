// =====================================================================
//  LES DÉGUISEMENTS — lot L-K (23/10), sur le squelette du socle S0 (22/10) ; vague 3 : L-O
// =====================================================================
// Devenir un vrai meuble de l'école (spec §§ 3.9, 4.5.13). Le CATALOGUE : les types du registre (js/registre_meubles.js,
// copiés avant la couture du décor) plus le carton de SECOURS (registre vide : un prop doit pouvoir se cacher quand même).
//   - viserMeuble : le meuble visé depuis le PIVOT du prop (pas la caméra : la caméra orbitale regarde ce pivot, le rayon de
//     visée de l'écran passe donc par lui — et l'hôte de demain le refait sans caméra), par la grille de 2 m du registre et
//     ses boîtes orientées ; retenu à moins de 3 m du prop, ligne libre, déguisable DANS LA ZONE ; un coéquipier déguisé se
//     copie aussi ;
//   - deguiser : refusé sans la place (le disque ET la bande du type, et les coins d'un meuble long : « Pas la place ») ; les
//     PV gardés en proportion ; l'événement 'deguise'. La SIMULATION ne touche jamais la scène : la racine affichée naît à
//     la première image (majProps) ;
//   - majProps (affichage, une fois par image) : la racine à la position et au cap AFFICHÉS, jamais penchée (roulis et
//     tangage 0 : piège 13 du cœur) ; cachée par zones comme le décor (ce qu'on ajoute à la scène n'est jamais caché par le
//     tri de js/ecole_visibilite.js) ; l'ombre au niveau de la caméra ; le VOILE au sol — l'ombre cuite qui manque sous un
//     faux meuble, 0,35 (0,2 au RDC, où les ombres de contact s'ajoutent), aucun pour un type `voile: false` (la chaise coque
//     porte le sien) — ; la surbrillance du meuble visé ; le tressaillement et le flash rouge d'une touche (matériaux
//     CLONÉS du prop : un uniforme, aucun programme neuf) ; le rétrécissement d'un prop mort (0,4 s) ;
//   - credibilite : à quel point un meuble posé là « est à sa place » (0 = absurde, 1 = parfait) — LA MÊME pour les bots
//     chasseurs et la jauge DISCRÉTION de Haythem (la jauge apprend à se cacher) ;
//   - cachettes : les poses LIBRES (au rayon et dans la bande du type), ATTEIGNABLES (graphe des props, rayon 0,2), notées —
//     bouts de rangée, autour d'une table, le long d'un mur ; jamais « dans » une collision groupée ;
//   - candidatsMeubles : vraies poses ET props vivants, MÊLÉS et SANS MARQUE — la seule porte par laquelle un cerveau de
//     chasseur voit des meubles ;
//   - toucherPoses : la vraie pose qu'une balle touche (≤ 6 µs ; exacte par la forme du monde solide quand elle est connue).
// Attention (spec § 5.5.8) : la conception écrit credibilite(cle, x, z, y, …) ; le contrat est credibilite(cle, x, y, z, …).
// Tout ce qu'appelle la simulation (viserMeuble, deguiser, credibilite, cachettes, candidatsMeubles, toucherPoses) est pur :
// ni hasard, ni horloge, ni entrée, ni caméra ; majProps est l'affichage (Partie.image, étape 4).
import * as THREE from 'three';
import { MEUBLES, rattraperRegistre, zonerRegistre, copieMeuble, cleCase, CASE_GRILLE, familleDe } from '../registre_meubles.js';
import { piecesDe, POINTS_APPARITION } from './apparitions.js';
import { CorpsProp, coinsLibres, A_LA_SORTIE } from './corps_prop.js';
import { niveauDe } from './constantes.js';
import { melanger } from './rng.js';
import { Balistique } from './balistique.js';
import { zoneDe as zoneVue, zonesCachees, DEHORS } from '../ecole_visibilite.js';
import { avecProfondeur, sceneOmbre } from '../ombre_cache.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const angle = (a) => Math.atan2(Math.sin(a), Math.cos(a));
// LES RÉGLAGES du lot (spec §§ 3.9, 4.5.13 ; conception_prophunt §§ 6, 9.4, 10.1)
export const REGLAGES_DEGUISEMENT = {
  viser: { portee: 6, distProp: 3, marge: 0.09 },
  voile: { opacite: 0.35, opaciteRdc: 0.2, empreinte: 1.3 },
  surbrillance: { opacite: 0.22, echelle: 1.015 },
  touche: { tressaille: 0.15, roulis: 3 * Math.PI / 180, flash: 0.08 }, mort: 0.4,
  cred: { memeZone: 0.35, memeNiveau: 0.15, voisins: 0.2, rayonVoisins: 2, capBon: 0.15, capMoyen: 0.05, capFaux: -0.35, pas: 0.1,
    murBon: 0.2, murSans: -0.5, passageLoin: 0.1, passagePres: -0.2, couloir: -0.2, sol: 0.1 },
  // (cachettes.budget : les requêtes au monde solide d'un lot — 110 en faisait des lots de 3,2 à 5,9 ms la machine chargée, relecture
  // L-K du 23/10 : 75, pour garder les 5 ms de la spec avec de la marge)
  cachettes: { budget: 75, poidsVue: 8, rang: 0.9, mur: [0.6, -0.6, 1.2, -1.2], table: [0.7, -0.7, 1.4, -1.4], doublon: 0.35, passage: 0.9, atteinte: 0.6 },
};

// ---------------------------------------------------------------- LE CATALOGUE
// LE CARTON de secours (0,45 × 0,35 × 0,45) : un matériau standard sans carte
export const CARTON = 'carton';
let _carton = null;
function typeCarton() {
  if (_carton) return _carton;
  const geo = new THREE.BoxGeometry(0.45, 0.35, 0.45).translate(0, 0.175, 0);
  const mat = new THREE.MeshStandardMaterial({ color: 0xa8865a, roughness: 0.9, metalness: 0 }); mat.name = 'carton de secours (prop hunt)';
  const proto = new THREE.Group(); const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; proto.add(m);
  const boite = new THREE.Box3(new THREE.Vector3(-0.225, 0, -0.225), new THREE.Vector3(0.225, 0.35, 0.225));
  const volume = 0.45 * 0.35 * 0.45, k3 = Math.cbrt(volume);
  _carton = { cle: CARTON, type: CARTON, variante: null, nom: 'le carton', famille: CARTON, proto, boite, taille: new THREE.Vector3(0.45, 0.35, 0.45), volume,
    rayon: Math.max(0.15, 0.45 / 2 * 0.9), haut: 0.35, bande: { bas: Math.min(0.25, 0.4 * 0.35), haut: 0.5 },
    pv: Math.round(clamp(40 + 90 * k3, 60, 145)), vitesse: 4.6 * clamp(1.15 - 0.35 * k3, 0.72, 1.05), mural: false, surPlace: false,
    deguisable: true, raison: null, voile: true, symetrie: Math.PI / 2, accroche: 0, dos: 0.225, secours: true };
  return _carton;
}
export const CATALOGUE = new Map();
export function typeDe(cle) { return CATALOGUE.get(cle) || MEUBLES.types.get(cle) || (cle === CARTON ? typeCarton() : null); }

// LES PASSAGES d'une pièce à l'autre (carte_monde § 7 : centre en PLAN x, y et hauteur) et les portes automatiques de la
// carte : on ne se cache pas dans une porte
const P_PLAN = [['attente|bureauB', 12.88, 2.5, 0], ['attente|c01', 12.47, 7.78, 0], ['attente|hall', 13.25, 3.63, 0], ['attente|hallO', 5.75, 6.62, 0],
  ['attente|si01', 10, 3.52, 0], ['c01|local', 11.5, 9, 0], ['c01|pmr', 11.49, 11.21, 0], ['c05|dc', 5.14, 12.74, 0], ['c05|hallO', 5.25, 9, 0], ['c05|wcH', 6, 11, 0],
  ['couloirEst|descenteEst', 17, 9.88, -0.12], ['couloirEst|hall', 15.22, 7.49, 0], ['couloirEst|vestEst', 15.19, 10.75, 0], ['couloirSS|hallSS', 2, 10, -3.06],
  ['descenteEst|escEstSS', 18.75, 9.88, -1.45], ['e1couloir|e1pause', 4.75, 5.69, 3.5], ['e1couloir|palier1', 1.38, 6.75, 3.05], ['e1est|e1pause', 13.5, 8.03, 3.5],
  ['e1est|escEst2', 16.03, 10.51, 3.49], ['e1kahn|e1pause', 10.44, 13, 3.5], ['e1pause|e1salle', 10.83, 5.01, 3.5], ['e2couloir|e2s1', 12.45, 6.49, 6.6],
  ['e2couloir|e2s2', 10.54, 4.49, 6.6], ['e2couloir|e2sas', 14.62, 6.49, 6.6], ['e2palier|e2sas', 14.75, 8, 6.6], ['e2palier|escEst3', 16, 9.88, 6.6],
  ['escEst|escEst2', 17.5, 9.88, 2.46], ['escEst|vestEst', 16, 11.63, 0], ['escEst2|escEst3', 17, 9.88, 6.02], ['escEstSS|palierSSE', 17, 11.63, -2.93],
  ['escalier|hallO', 2.96, 9.01, 0], ['escalier|palier1', 1.36, 9, 1.98], ['escalierSS|hallSS', 0.81, 10, -2.91], ['escalierSS|palierSS', 0.83, 5.98, -0.09],
  ['hall|porche', 15.13, 0.75, 0], ['hallO|palierSS', 1.5, 5.49, 0], ['hallO|passage', 3.55, 4, 0], ['hallO|wcF', 6, 8.5, 0], ['hallSS|pauseSS', 2.51, 10.79, -3.06],
  ['palierSSE|sasSS', 15.38, 10.75, -3.06], ['passage|rue', 3.26, -0.5, 0], ['passage|service', 1.5, 1.3, 0], ['passageSS|pauseSS', 13.01, 8.74, -3.06],
  ['passageSS|sasSS', 13.99, 9.74, -3.06], ['pauseSS|salleSS', 9.76, 14.5, -3.06], ['porche|rue', 14.83, -0.5, 0]];
export const PASSAGES_PIECES = P_PLAN.map(([k, x, y, h]) => { const [a, b] = k.split('|'); return { a, b, x, y: h, z: -y }; });
let _portes = [];                    // [{ x, y, z }] : les portes automatiques de la carte (preparerCatalogue)
// les pièces de CIRCULATION : une chaise plantée au milieu, à plus de 0,8 m de tout, y est absurde
const COULOIRS = new Set(['couloirEst', 'couloirSS', 'passage', 'passageSS', 'e1couloir', 'e2couloir', 'hallO', 'hallSS', 'hall', 'palier1', 'e2palier',
  'palierSS', 'palierSSE', 'sasSS', 'e2sas', 'descenteEst', 'vestEst', 'c05', 'c01', 'e1est', 'escalier', 'escalierSS', 'escEst', 'escEst2', 'escEst3', 'escEstSS', 'porche']);

// LES OUBLIÉS par zone de jeu : un type qui y garde un exemplaire non étiqueté n'y est pas déguisable
const _exclus = new Map();
let _nExclus = -1;
function exclusDe(zoneJeu) {
  if (_nExclus !== MEUBLES.nonEtiquetes.length) { _exclus.clear(); _nExclus = MEUBLES.nonEtiquetes.length; }
  let S = _exclus.get(zoneJeu);
  if (!S) {
    const P = piecesDe(zoneJeu || 'ecole_int'); S = new Set();
    for (const e of MEUBLES.nonEtiquetes) if (e.zone === null || P.has(e.zone)) S.add(e.type);
    _exclus.set(zoneJeu, S);
  }
  return S;
}
// ce type se prend-il dans cette zone de jeu ?
export function deguisableDans(T, zoneJeu) {
  if (!T) return false;
  if (T.secours) return true;
  return !!T.deguisable && !exclusDe(zoneJeu).has(T.type);
}

// LE CATALOGUE (écran PRÉPARATION) : les meubles cousus seuls rattrapés, les poses rangées par pièce, les formes du monde
// solide rattachées à leur meuble, les prototypes achevés (au rattrapage) et leurs textures envoyées à la carte (une fois par session)
const _prepares = new WeakSet();
export async function preparerCatalogue(game, progres) {
  const pr = progres || (() => {});
  pr('Meubles', 0);
  const C = game.collisions;
  MEUBLES.collisions = C;
  rattraperRegistre(game.scene);
  zonerRegistre(game.carte && game.carte.lumieres, C);
  associerFormes(C);
  _portes = ((game.carte && game.carte.portes && game.carte.portes.auto) || []).map((P) => ({ x: P.cx, y: P.base || 0, z: P.cz }));
  CATALOGUE.clear();
  for (const [cle, T] of MEUBLES.types) CATALOGUE.set(cle, T);
  CATALOGUE.set(CARTON, typeCarton());
  _nExclus = -1;
  pr('Meubles', 0.3);
  // LES PROGRAMMES : aucun de COULEUR — les matériaux des prototypes sont les jumeaux de ceux du décor (même signature, même
  // programme, mêmes textures, déjà sur la carte). (Mesuré le 23/10 : Player.preparerRendu en compilait onze — les variantes
  // du cran de repli —, les passes annexes de game._compilerTout sept, pour une cible qui n'est pas celle du rendu.) Restent
  // les PASSES ANNEXES d'un objet mobile non animé — l'ombre portée (js/ombre_cache.js avecProfondeur) et l'ombre de contact
  // (js/ombres_contact.js avecContact) : une ou deux variantes de profondeur que le décor, cuit, n'a pas — compilées ici en
  // parallèle, comme celles d'un avatar (Game._compilerTout), et non à la première image d'un prop (relecture L-K du 23/10 :
  // 10 à 15 ms d'image figée au premier meuble vu, spec § 4.1 règle 6). Les textures sont envoyées à la carte (déjà là :
  // celles du décor). Une fois par session.
  const prets = [];
  for (const T of CATALOGUE.values()) {
    if (_prepares.has(T.proto)) continue;
    _prepares.add(T.proto);
    for (const t of texturesDe(T.proto)) try { game.renderer && game.renderer.initTexture(t); } catch (e) { /* */ }
    const p = compilerAnnexes(game, T.proto); if (p) prets.push(p);
  }
  // (une compilation qui ne répond pas ne bloque pas la partie : 3 s au plus)
  if (prets.length) await Promise.race([Promise.all(prets), new Promise((r) => setTimeout(r, 3000))]);
  pr('Meubles', 1);
  return CATALOGUE;
}
// les programmes des passes annexes d'un objet mobile (ceux de Game._compilerTout sans la couleur), pour la cible où elles
// sont dessinées : la carte d'ombre (la doublure de scène de js/ombre_cache.js) et la carte des ombres de contact
function compilerAnnexes(game, o) {
  const comp = game && game._compilerAsync ? (x, s, e, cam) => game._compilerAsync(x, s, e, cam) : null;
  if (!comp) return null;
  const so = game._sceneOmbre || (game._sceneOmbre = sceneOmbre(game.scene));
  const p = [avecProfondeur(o, (x) => comp(x === game.scene ? so : x, so, false))];
  if (game.ombres && game.ombres.avecContact) p.push(game.ombres.avecContact(o, (x, cam) => comp(x, game.scene, false, cam)));
  const L = p.filter(Boolean);
  return L.length ? Promise.all(L) : null;
}
// les textures des matériaux d'un objet (envoyées à la carte sous la préparation : elles y sont déjà, ce sont celles du décor)
function texturesDe(o) {
  const L = new Set();
  o.traverse((m) => { if (!m.isMesh || !m.material) return; for (const k of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap', 'alphaMap']) if (m.material[k]) L.add(m.material[k]); });
  return L;
}
// les formes du monde solide qui sont CELLES d'un meuble (leur centre dans sa boîte, leur taille à la sienne : la boîte
// d'une rangée de cinq chaises ne l'est d'aucune) : MEUBLES.parForme — une balle sur elles touche ce meuble-là, sans boîte
function associerFormes(C) {
  if (!C || !C.grille) return;
  for (const P of MEUBLES.poses) {
    const ex = Math.abs(P.c) * P.hx + Math.abs(P.s) * P.hz + 0.05, ez = Math.abs(P.s) * P.hx + Math.abs(P.c) * P.hz + 0.05;
    for (let i = Math.floor((P.cx - ex) / 2); i <= Math.floor((P.cx + ex) / 2); i++)
      for (let k = Math.floor((P.cz - ez) / 2); k <= Math.floor((P.cz + ez) / 2); k++) {
        const L = C.grille.get((i + 32768) * 65536 + (k + 32768)); if (!L) continue;
        for (const f of L) {
          if (MEUBLES.parForme.has(f) || f.off || !f.joueur || f.y1 < P.y0 + 0.05 || f.y0 > P.y1 - 0.05 || !Number.isFinite(f.y1)) continue;
          const fx = f.t === 'c' ? f.x : f.t === 'b' ? (f.x0 + f.x1) / 2 : f.cx, fz = f.t === 'c' ? f.z : f.t === 'b' ? (f.z0 + f.z1) / 2 : f.cz;
          const fr = f.t === 'c' ? f.r : f.t === 'b' ? Math.max(f.x1 - f.x0, f.z1 - f.z0) / 2 : Math.max(f.hx, f.hz);
          const lx = (fx - P.cx) * P.c + (fz - P.cz) * P.s, lz = -(fx - P.cx) * P.s + (fz - P.cz) * P.c;
          if (Math.abs(lx) <= P.hx + 0.03 && Math.abs(lz) <= P.hz + 0.03 && fr <= Math.max(P.hx, P.hz) + 0.06) MEUBLES.parForme.set(f, P.i);
        }
      }
  }
}

// les clés déguisables d'une zone de jeu (toutes ses variantes : la chaise coque canard comme la blanche), présentes dans la
// zone et sans exemplaire oublié — le carton de secours ne compte pas
export function typesDeguisables(zoneJeu) {
  const P = piecesDe(zoneJeu), L = new Set();
  for (const p of MEUBLES.poses) if (P.has(p.zone) && !L.has(p.cle) && deguisableDans(MEUBLES.types.get(p.cle), zoneJeu)) L.add(p.cle);
  return [...L].sort();
}
// les TYPES distincts qu'on y prend (la règle du menu : une zone de moins de 6 types est grisée, § 3.9 — six variantes de
// chaise coque ne font qu'un type)
export function typesDistincts(zoneJeu) { return [...new Set(typesDeguisables(zoneJeu).map((c) => MEUBLES.types.get(c).type))].sort(); }

// ---------------------------------------------------------------- LES RAYONS (viser, toucher)
// le rayon O + t·D contre une boîte orientée au sol (convention de js/collisions.js : c = cos −cap, s = sin −cap), de y0 à
// y1 : le t d'entrée (0 si O est dedans), ou Infinity
function rayonBoite(ox, oy, oz, dx, dy, dz, cx, cz, hx, hz, c, s, y0, y1, tMax) {
  const lx = (ox - cx) * c + (oz - cz) * s, lz = -(ox - cx) * s + (oz - cz) * c;
  const ldx = dx * c + dz * s, ldz = -dx * s + dz * c;
  let t0 = 0, t1 = tMax;
  if (Math.abs(ldx) < 1e-12) { if (lx < -hx || lx > hx) return Infinity; } else {
    let a = (-hx - lx) / ldx, b = (hx - lx) / ldx; if (a > b) { const q = a; a = b; b = q; }
    if (a > t0) t0 = a; if (b < t1) t1 = b; if (t0 > t1) return Infinity;
  }
  if (Math.abs(ldz) < 1e-12) { if (lz < -hz || lz > hz) return Infinity; } else {
    let a = (-hz - lz) / ldz, b = (hz - lz) / ldz; if (a > b) { const q = a; a = b; b = q; }
    if (a > t0) t0 = a; if (b < t1) t1 = b; if (t0 > t1) return Infinity;
  }
  if (Math.abs(dy) < 1e-12) { if (oy < y0 || oy > y1) return Infinity; } else {
    let a = (y0 - oy) / dy, b = (y1 - oy) / dy; if (a > b) { const q = a; a = b; b = q; }
    if (a > t0) t0 = a; if (b < t1) t1 = b; if (t0 > t1) return Infinity;
  }
  return t0;
}
const rayonPose = (P, ox, oy, oz, dx, dy, dz, tMax) => rayonBoite(ox, oy, oz, dx, dy, dz, P.cx, P.cz, P.hx, P.hz, P.c, P.s, P.y0, P.y1, tMax);
// la boîte orientée d'un prop vivant (sa forme du moment, à sa position simulée)
function boiteProp(b, out) {
  const T = b.prop.T, c = b.corps, cap = b.prop.cap ?? c.ang ?? 0, B = T.boite, co = Math.cos(cap), si = Math.sin(cap);
  const lx = (B.min.x + B.max.x) / 2, lz = (B.min.z + B.max.z) / 2;
  out.cx = c.pos.x + lx * co + lz * si; out.cz = c.pos.z - lx * si + lz * co;
  out.hx = T.taille.x / 2; out.hz = T.taille.z / 2; out.c = Math.cos(-cap); out.s = Math.sin(-cap);
  out.y0 = c.pos.y + (c.jumpY || 0); out.y1 = out.y0 + T.haut;
  return out;
}
const _bp = { cx: 0, cz: 0, hx: 0, hz: 0, c: 1, s: 0, y0: 0, y1: 0 };
// LE PARCOURS DE LA GRILLE de 2 m du registre le long d'un rayon (D unitaire) : la pose la plus proche, ou null
let _tour = 0;
function rayonGrille(ox, oy, oz, dx, dy, dz, tMax, filtre, out) {
  const tour = ++_tour, G = MEUBLES.grille, K = CASE_GRILLE;
  let i = Math.floor(ox / K), k = Math.floor(oz / K);
  const si = dx > 0 ? 1 : -1, sk = dz > 0 ? 1 : -1, adx = Math.abs(dx), adz = Math.abs(dz);
  const tdx = adx > 1e-12 ? K / adx : Infinity, tdz = adz > 1e-12 ? K / adz : Infinity;
  let tx = adx > 1e-12 ? (dx > 0 ? (i + 1) * K - ox : ox - i * K) / adx : Infinity;
  let tz = adz > 1e-12 ? (dz > 0 ? (k + 1) * K - oz : oz - k * K) / adz : Infinity;
  let best = null, bt = tMax;
  for (let n = 0; n < 256; n++) {
    const L = G.get(cleCase(i, k));
    if (L) for (let j = 0; j < L.length; j++) {
      const P = L[j];
      if (P._tour === tour) continue;
      P._tour = tour;
      if (filtre && !filtre(P)) continue;
      const t = rayonPose(P, ox, oy, oz, dx, dy, dz, bt);
      if (t < bt) { bt = t; best = P; }
    }
    const tn = Math.min(tx, tz);
    if (tn >= bt || tn > tMax) break;
    if (tx < tz) { i += si; tx += tdx; } else { k += sk; tz += tdz; }
  }
  out.pose = best; out.t = bt;
  return out;
}

// LA VRAIE POSE qu'une balle touche avant tMax : { pose, t } | null (≤ 6 µs) — si la forme du monde solide que la balle a
// touchée (`forme`, balistique.balle().forme) est celle d'un meuble (MEUBLES.parForme), c'est ce meuble, exactement
export function toucherPoses(ox, oy, oz, dx, dy, dz, tMax, forme = null) {
  if (forme && MEUBLES.parForme.has(forme)) {
    const P = MEUBLES.poses[MEUBLES.parForme.get(forme)];
    if (P) { const t = rayonPose(P, ox, oy, oz, dx, dy, dz, tMax + 0.5); return { pose: P, t: Number.isFinite(t) ? Math.min(t, tMax) : tMax }; }
  }
  const r = rayonGrille(ox, oy, oz, dx, dy, dz, tMax, null, _rg);
  return r.pose ? { pose: r.pose, t: r.t } : null;
}
const _rg = { pose: null, t: 0 };

// LE PIVOT d'un acteur : là d'où il vise un meuble — celui de sa caméra orbitale, posAff + (0 ; max(0,5 ; 0,75 h) ; 0)
// (h : la hauteur de sa forme ; un humain, 1,73), mais sur sa position SIMULÉE
export function pivotDe(acteur, out) {
  const c = acteur.corps, P = acteur.prop, h = P && P.T ? P.T.haut : 1.73;
  out = out || { x: 0, y: 0, z: 0 };
  out.x = c.pos.x; out.y = c.pos.y + (c.jumpY || 0) + Math.max(0.5, 0.75 * h); out.z = c.pos.z;
  return out;
}
const _piv = { x: 0, y: 0, z: 0 };
// LE MEUBLE VISÉ depuis le pivot du prop, dans la direction (lacet, tangage) : { cle, pose } | { cle, acteur } | null
export function viserMeuble(partie, acteur, lacet, tangage) {
  if (!acteur || !acteur.corps) return null;
  const R = REGLAGES_DEGUISEMENT.viser, p = pivotDe(acteur, _piv), ct = Math.cos(tangage);
  const dx = -Math.sin(lacet) * ct, dy = -Math.sin(tangage), dz = -Math.cos(lacet) * ct;
  const zone = partie.zone, q = acteur.corps.pos;
  const proche = (cx, cz) => Math.hypot(cx - q.x, cz - q.z) < R.distProp;
  const r = rayonGrille(p.x, p.y, p.z, dx, dy, dz, R.portee, (P) => proche(P.cx, P.cz) && deguisableDans(MEUBLES.types.get(P.cle), zone), _rv);
  let best = r.pose ? { cle: r.pose.cle, pose: r.pose } : null, bt = r.t;
  for (const b of partie.acteurs) {
    if (b === acteur || !b.vivant || !b.prop || !b.prop.T || !b.corps) continue;
    boiteProp(b, _bp);
    if (!proche(_bp.cx, _bp.cz)) continue;
    const t = rayonBoite(p.x, p.y, p.z, dx, dy, dz, _bp.cx, _bp.cz, _bp.hx, _bp.hz, _bp.c, _bp.s, _bp.y0, _bp.y1, bt);
    if (t < bt) { bt = t; best = { cle: b.prop.cle, acteur: b }; }
  }
  if (!best) return null;
  // la ligne libre jusqu'au meuble (s'arrêter juste avant lui : sa propre forme, ou la boîte de sa rangée, l'enveloppe à
  // quelques centimètres)
  const C = partie.game && partie.game.collisions, L = Math.max(0, bt - R.marge);
  if (C && L > 0.02 && C.rayonLibre(p.x, p.y, p.z, p.x + dx * L, p.y + dy * L, p.z + dz * L, 0) < 1 - 1e-6) return null;
  return best;
}
const _rv = { pose: null, t: 0 };

// ---------------------------------------------------------------- SE DÉGUISER
// SE DÉGUISER en `cle` : refusé sans la place (C.libre au rayon et dans la bande du type, les coins d'un meuble long) ou pour
// un type qui ne se prend pas dans la zone — l'événement 'refus' { a, cle, raison } le dit (« Pas la place ») ; les PV
// gardés en proportion ; l'événement 'deguise'. Un humain (son Player) prend un CorpsProp ; le Player reste garé.
export function deguiser(partie, acteur, cle) {
  const T = typeDe(cle); if (!T || !acteur || !acteur.corps) return false;
  if (!deguisableDans(T, partie.zone)) { partie.evt('refus', { a: acteur.id, cle, raison: 'type' }); return false; }
  const C = partie.game && partie.game.collisions, c = acteur.corps, avant = acteur.prop;
  const cap = avant ? avant.cap : (Number.isFinite(c.ang) ? c.ang : 0), pieds = c.pos.y;
  if (C && (!C.libre(c.pos.x, c.pos.z, T.rayon, pieds, T.bande.haut, T.bande.bas) || !coinsLibres(C, T, c.pos.x, pieds, c.pos.z, cap))) {
    partie.evt('refus', { a: acteur.id, cle, raison: 'place' });
    return false;
  }
  if (!(c instanceof CorpsProp)) {
    const n = new CorpsProp(C, { rayon: T.rayon, haut: T.bande.haut, bas: T.bande.bas, bounds: (partie.monde && partie.monde.bornes) || c.bounds || null });
    acteur.changerCorps(n);
    n.ang = n.angPrec = n.angAff = cap;
  }
  const corps = acteur.corps;
  corps.porter(T); corps.vel.set(0, 0, 0);
  // (la proportion se lit sur la VIE de l'acteur, que Partie.infliger entame — `prop.pv` n'est que sa copie au
  // déguisement : relecture L-K du 23/10, un Miura touché à 50 / 90 redevenait un carton à 77 / 77 en changeant de forme)
  const k = acteur.vie / Math.max(1, acteur.vieMax);
  const pv = Math.max(1, Math.round(T.pv * clamp(k, 0, 1)));
  const anciennes = avant ? [avant.racine, ...(avant._anciennes || [])].filter(Boolean) : [];
  acteur.prop = { cle, T, racine: null, cap, fige: false, verrou: false, pv, changements: avant ? (avant.changements || 0) + 1 : 0,
    provocT: avant ? avant.provocT || 0 : 0, vitesseAff: 0, rotAff: 0, _anciennes: anciennes };
  acteur.vieMax = T.pv; acteur.vie = pv;
  partie.evt('deguise', { a: acteur.id, cle, x: corps.pos.x, y: corps.pos.y, z: corps.pos.z });
  return true;
}
// redevenir soi (ou quitter la partie : Partie.sortir l'appelle pour chaque prop) : le déguisement oublié, sa racine — et la
// surbrillance — retirées de la scène (la balade retrouve exactement ses enfants)
export function retirerProp(partie, acteur) {
  oublierAffichage();
  const P = acteur && acteur.prop; if (!P) return;
  for (const r of [P.racine, ...(P._anciennes || [])]) detruireRacine(r);
  acteur.prop = null;
  if (acteur.corps instanceof CorpsProp) acteur.corps.porter({ rayon: 0.3, bande: { haut: 1.6, bas: 0.25 }, boite: null, mural: false });
}

// ---------------------------------------------------------------- L'AFFICHAGE DES PROPS
let _geoVoile = null, _texVoile = null;
const _matsVoile = [null, null];
function geoVoile() { return _geoVoile || (_geoVoile = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2)); }
// le voile : celui des chaises coque (js/ecole_mobilier.js, son programme existe), à défaut un dégradé radial à lui
function matVoile(rdc) {
  const i = rdc ? 1 : 0;
  if (_matsVoile[i]) return _matsVoile[i];
  const R = REGLAGES_DEGUISEMENT.voile;
  let base = null;
  for (const [, T] of MEUBLES.types) if (!base && T.voile === false) T.proto.traverse((m) => { if (!base && m.isMesh && m.material && m.material.transparent && m.material.map) base = m.material; });
  let m;
  if (base) { m = base.clone(); m.onBeforeCompile = base.onBeforeCompile; m.customProgramCacheKey = base.customProgramCacheKey; }
  else {
    if (!_texVoile) {
      const cv = document.createElement('canvas'); cv.width = cv.height = 128;
      const g = cv.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      gr.addColorStop(0, 'rgba(0,0,0,0.42)'); gr.addColorStop(0.45, 'rgba(0,0,0,0.3)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
      _texVoile = new THREE.CanvasTexture(cv); _texVoile.colorSpace = THREE.SRGBColorSpace;
    }
    m = new THREE.MeshBasicMaterial({ map: _texVoile, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  }
  // (le dégradé culmine à 0,42 : l'opacité du matériau le ramène à 0,35, ou 0,2 au RDC)
  m.opacity = (rdc ? R.opaciteRdc : R.opacite) / 0.42; m.name = 'voile de prop' + (rdc ? ' (RDC)' : '');
  return (_matsVoile[i] = m);
}
let _matSurb = null;
function matSurbrillance() {
  return _matSurb || (_matSurb = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: REGLAGES_DEGUISEMENT.surbrillance.opacite,
    depthWrite: false, blending: THREE.AdditiveBlending, name: 'surbrillance du meuble visé' }));
}
// un matériau du prop CLONÉ (le flash rouge ne doit pas rougir tous les meubles de l'école) — même programme : on recopie
// ce que Material.copy oublie (onBeforeCompile, la clé de programme des matériaux à shader maison)
function clonerMat(m) {
  if (!m) return m;
  const c = m.clone();
  if (m.onBeforeCompile !== THREE.Material.prototype.onBeforeCompile) c.onBeforeCompile = m.onBeforeCompile;
  if (m.customProgramCacheKey !== THREE.Material.prototype.customProgramCacheKey) c.customProgramCacheKey = m.customProgramCacheKey;
  c.userData = { ...c.userData, _e: c.emissive ? c.emissive.clone() : null, _ei: c.emissiveIntensity, _col: c.isMeshBasicMaterial && c.color ? c.color.clone() : null };
  return c;
}
// LA RACINE d'un prop : enfant DIRECT de la scène, `dynamique` ; dedans la copie (matériaux clonés) et le voile
function construireRacine(scene, T) {
  const R = new THREE.Group(); R.name = 'prop ' + T.cle; R.userData.dynamique = true;
  const copie = T.secours ? T.proto.clone(true) : copieMeuble(T.cle) || T.proto.clone(true);
  const mats = [];
  copie.traverse((m) => {
    if (!m.isMesh) return;
    m.userData._ombre = m.castShadow;
    if (Array.isArray(m.material)) m.material = m.material.map((x) => { const c = clonerMat(x); mats.push(c); return c; });
    else { m.material = clonerMat(m.material); mats.push(m.material); }
  });
  R.add(copie);
  let voile = null;
  if (T.voile !== false) {
    const b = T.boite, E = REGLAGES_DEGUISEMENT.voile.empreinte;
    voile = new THREE.Mesh(geoVoile(), matVoile(false));
    voile.scale.set(Math.max(0.2, (b.max.x - b.min.x) * E), 1, Math.max(0.2, (b.max.z - b.min.z) * E));
    voile.position.set((b.min.x + b.max.x) / 2, 0.004, (b.min.z + b.max.z) / 2);
    voile.renderOrder = 1; voile.castShadow = false; voile.receiveShadow = false; voile.userData.horsAOSol = true;
    R.add(voile);
  }
  R.userData.copie = copie; R.userData.mats = mats; R.userData.voile = voile; R.userData.ombre = null;
  scene.add(R);
  return R;
}
function detruireRacine(R) {
  if (!R) return;
  if (R.parent) R.parent.remove(R);
  for (const m of R.userData.mats || []) m.dispose();
  R.userData.mats = [];
}
// la surbrillance d'un type : la copie, un seul matériau additif, un rien plus grande (1,015)
const _surb = new Map();
function surbrillanceDe(scene, T) {
  let S = _surb.get(T.cle);
  if (!S) {
    S = new THREE.Group(); S.name = 'surbrillance ' + T.cle; S.userData.dynamique = true;
    const copie = T.secours ? T.proto.clone(true) : copieMeuble(T.cle) || T.proto.clone(true);
    copie.traverse((m) => { if (m.isMesh) { m.material = matSurbrillance(); m.castShadow = false; m.receiveShadow = false; m.renderOrder = 3; } });
    const b = T.boite, e = REGLAGES_DEGUISEMENT.surbrillance.echelle, cx = (b.min.x + b.max.x) / 2, cy = (b.min.y + b.max.y) / 2, cz = (b.min.z + b.max.z) / 2;
    copie.scale.setScalar(e); copie.position.set(-cx * (e - 1), -cy * (e - 1), -cz * (e - 1));
    S.add(copie); _surb.set(T.cle, S);
  }
  if (S.parent !== scene) scene.add(S);
  return S;
}
// les touches reçues par un prop : il tressaille, ses matériaux virent au rouge (abonné une fois par partie)
const _abonnees = new WeakSet();
function abonner(partie) {
  if (_abonnees.has(partie)) return;
  _abonnees.add(partie);
  partie.sur('touche', (e) => {
    const a = partie.acteurParId ? partie.acteurParId(e.cible) : null;
    if (a && a.prop) { a.prop._tressaille = REGLAGES_DEGUISEMENT.touche.tressaille; a.prop._flash = REGLAGES_DEGUISEMENT.touche.flash; }
  });
}
const ROUGE = new THREE.Color(1, 0.16, 0.1);
function flash(R, k) {
  for (const m of R.userData.mats || []) {
    const u = m.userData;
    if (m.emissive && u._e) { if (k > 0) { m.emissive.copy(u._e).lerp(ROUGE, k); m.emissiveIntensity = Math.max(u._ei ?? 1, 1); } else { m.emissive.copy(u._e); m.emissiveIntensity = u._ei ?? 1; } }
    else if (u._col) { if (k > 0) m.color.copy(u._col).lerp(ROUGE, k * 0.8); else m.color.copy(u._col); }
  }
}
// L'AFFICHAGE (Partie.image, étape 4) : chaque prop à sa place affichée, la surbrillance du meuble que vise Haythem prop
export function majProps(partie, dt) {
  const g = partie.game, cam = g && g.camera, scene = g && g.scene;
  if (!scene || !cam) return;
  abonner(partie);
  const cp = cam.position, H = zonesCachees(cp.x, cp.y, cp.z), nCam = niveauDe(cp.y - 1), RT = REGLAGES_DEGUISEMENT.touche;
  for (const a of partie.acteurs) {
    const P = a.prop;
    if (P && P._anciennes && P._anciennes.length) { for (const r of P._anciennes) detruireRacine(r); P._anciennes.length = 0; }
    if (!P || !P.T || !a.corps) continue;
    if (!P.racine) P.racine = construireRacine(scene, P.T);
    const R = P.racine, c = a.corps, T = P.T;
    // (accroché au mur, un meuble qui pend est déjà à sa hauteur : son `jumpY`, js/jeu/corps_prop.js plaquer)
    const plaque = !!c.plaque, dec = plaque && c.decal ? c.decal : null;
    R.position.set(c.posAff.x + (dec ? dec.x : 0), c.posAff.y, c.posAff.z + (dec ? dec.z : 0));
    R.rotation.set(0, P.fige || plaque ? c.ang : (c.angAff ?? c.ang ?? 0), 0);
    // (mort : il rétrécit en 0,4 s, puis disparaît)
    const k = a.vivant ? 1 : clamp(1 - (partie.t - (a.mortT || 0)) / REGLAGES_DEGUISEMENT.mort, 0, 1);
    R.scale.setScalar(Math.max(1e-3, k));
    const z = zoneVue(c.posAff.x, -c.posAff.z, c.posAff.y + 0.5);
    R.visible = k > 0.001 && (z === DEHORS || !(H & z));
    if (!R.visible) continue;
    // l'ombre au niveau de la caméra (une ombre portée à travers une dalle trahirait le prop d'en dessous)
    const ombre = niveauDe(c.pos.y + 0.5) === nCam;
    if (R.userData.ombre !== ombre) { R.userData.ombre = ombre; R.userData.copie.traverse((m) => { if (m.isMesh) m.castShadow = ombre && m.userData._ombre; }); }
    // le voile reste AU SOL (en plein saut, il ne monte pas avec le meuble) ; aucun sous un meuble qui pend au mur (le vrai
    // extincteur n'assombrit pas le sol cuit : relecture L-K du 23/10, le voile flottait à 0,65 m)
    const vo = R.userData.voile;
    if (vo) {
      const rdc = niveauDe(c.pos.y + 0.5) === 0, mv = matVoile(rdc), h = Math.max(0, c.posAff.y - c.solAff);
      if (vo.material !== mv) vo.material = mv;
      vo.position.y = 0.004 - h; vo.visible = h < 0.3;
    }
    // la touche : il tressaille (la copie, pas la racine), il rougit
    const cp2 = R.userData.copie;
    if (P._tressaille > 0) {
      P._tressaille = Math.max(0, P._tressaille - dt);
      const w = P._tressaille / RT.tressaille;
      cp2.rotation.z = RT.roulis * w * Math.sin(P._tressaille * 140); cp2.position.x = 0.012 * w * Math.sin(P._tressaille * 170);
    } else if (cp2.rotation.z !== 0 || cp2.position.x !== 0) { cp2.rotation.z = 0; cp2.position.x = 0; }
    if (P._flash > 0) { P._flash = Math.max(0, P._flash - dt); flash(R, P._flash > 0 ? 1 : 0); }
  }
  // LA SURBRILLANCE du meuble visé (Haythem prop, vivant, pendant qu'on peut se déguiser) ; `partie.viseMeuble` le dit au HUD
  const L = partie.local;
  let vise = null;
  if (L && L.vivant && L.role === 'prop' && L.corps && !(L.prop && L.prop.fige) && (partie.phase === 'presentation' || partie.phase === 'cachette' || partie.phase === 'traque' || partie.id === 'essai')) {
    vise = viserMeuble(partie, L, L.cmd ? L.cmd.lacet : g.camYaw, L.cmd ? L.cmd.tangage : g.camPitch);
  }
  for (const [, S] of _surb) S.visible = false;
  partie.viseMeuble = null;
  if (vise) {
    const T = typeDe(vise.cle);
    if (T) {
      const S = surbrillanceDe(scene, T);
      if (vise.pose) { const P = vise.pose; S.position.set(P.x, P.y0, P.z); S.rotation.set(0, P.cap, 0); }
      else { const R = vise.acteur.prop.racine; if (R) { S.position.copy(R.position); S.rotation.set(0, R.rotation.y, 0); } }
      S.visible = true;
      partie.viseMeuble = { cle: vise.cle, nom: T.nom, pose: vise.pose ? vise.pose.i : null, acteur: vise.acteur ? vise.acteur.id : null };
    }
  }
}
// la surbrillance retirée de la scène (retirerProp ; elle revient d'elle-même à la prochaine image qui vise un meuble)
export function oublierAffichage() { for (const [, S] of _surb) if (S.parent) S.parent.remove(S); }
A_LA_SORTIE.add(oublierAffichage);

// ---------------------------------------------------------------- LA CRÉDIBILITÉ
// le pas de la rangée d'une vraie pose (médiane de la distance à la plus proche semblable de la pièce), 0 si elle est seule
export function pasRangee(pose) { return (pose && pose.pas) || 0; }
// la distance au plus proche passage d'une pièce à l'autre ou à la plus proche porte automatique, au même niveau
export function distPassage(x, y, z) {
  let d = Infinity;
  for (const P of PASSAGES_PIECES) if (Math.abs(P.y - y) < 1.5) d = Math.min(d, Math.hypot(P.x - x, P.z - z));
  for (const P of _portes) if (Math.abs(P.y - y) < 1.5) d = Math.min(d, Math.hypot(P.x - x, P.z - z));
  return d;
}
// le dos d'un meuble posé là est-il contre un mur ? (moins de 12 cm derrière lui — ou, quand son disque est plus large que
// sa profondeur, aussi près que le disque le laisse aller : un distributeur de 0,48 m de fond a un disque de 0,36 m)
export function contreMurEn(T, x, y, z, cap) {
  const C = MEUBLES.collisions; if (!C || !T) return false;
  const dos = T.dos ?? Math.max(0.02, -T.boite.min.z), ym = y + Math.min(1.2, T.haut / 2 + 0.05), L = Math.max(dos + 0.12, (T.rayon || 0) + 0.08);
  const dx = -Math.sin(cap), dz = -Math.cos(cap);
  return C.rayonLibre(x, ym, z, x + dx * L, ym, z + dz * L, 0) < 1 - 1e-6;
}
// planté au milieu d'une pièce de circulation, à plus de 55 cm de tout (un couloir de 1,5 m : le milieu ; pas contre un mur) ?
export function enPleinCouloir(x, y, z, zone) {
  const C = MEUBLES.collisions;
  return !!C && COULOIRS.has(zone) && C.libre(x, z, 0.55, y, 1.6, 0.05);
}
// l'écart de cap qui SE VOIT (à la symétrie du type près : un tabouret rond tourné n'a pas bougé)
function ecartCap(T, a, b) {
  let e = Math.abs(angle(a - b));
  const per = T.symetrie;
  if (per === 0) return 0;
  if (per && per < 2 * Math.PI - 1e-6) { e = e % per; e = Math.min(e, per - e); }
  return e;
}
// À QUEL POINT un meuble de type `cle` posé en (x, y, z) au cap `cap`, dans la pièce `zone`, est à sa place (0..1)
// (conception_prophunt § 9.4, recalée sur les six situations du test L-K 7) : des semblables dans la pièce (0,35), sinon au
// niveau (0,15) ; des semblables à moins de 2 m (0,2 pour trois) ; tourné comme le plus proche (0,15 ; de travers −0,35) ;
// à son pas de rangée (0,1) ; un meuble mural le dos au mur (0,2), loin d'un mur (−0,5) ; hors d'un passage (0,1 ; dedans
// −0,2) ; planté en plein couloir (−0,2) ; posé au sol (0,1). `opts.contreMur` : forcé ; absent, le monde solide le dit.
export function credibilite(cle, x, y, z, cap, zone, opts = {}) {
  const T = typeDe(cle); if (!T) return 0;
  const K = REGLAGES_DEGUISEMENT.cred, f = T.famille || familleDe(T.type);
  const memes = (MEUBLES.parZone.get(zone) || []).filter((p) => { const U = MEUBLES.types.get(p.cle); return U && U.famille === f; });
  let k;
  if (memes.length) k = K.memeZone;
  else { const n = niveauDe(y + 0.5); k = MEUBLES.poses.some((p) => { const U = MEUBLES.types.get(p.cle); return U && U.famille === f && niveauDe(p.y + 0.5) === n; }) ? K.memeNiveau : 0; }
  const pres = [];
  for (const p of memes) { const d = Math.hypot(p.x - x, p.z - z); if (d > 0.05 && d < K.rayonVoisins && Math.abs(p.y - y) < 0.5) pres.push([p, d]); }
  pres.sort((a, b) => a[1] - b[1]);
  k += Math.min(pres.length, 3) / 3 * K.voisins;
  if (pres.length) {
    const [v, d] = pres[0], e = ecartCap(T, cap, v.cap);
    k += e < 0.21 ? K.capBon : e < 0.44 ? K.capMoyen : K.capFaux;
    if (v.pas > 0 && Math.abs(d - v.pas) < 0.12) k += K.pas;
  }
  if (T.mural) {
    const mur = opts.contreMur ?? contreMurEn(T, x, y, z, cap);
    k += mur ? (pres.length ? 0 : K.murBon) : K.murSans;
  }
  k += distPassage(x, y, z) > 0.9 ? K.passageLoin : K.passagePres;
  if (enPleinCouloir(x, y, z, zone)) k += K.couloir;
  return clamp(k + K.sol, 0, 1);
}

// LA CRÉDIBILITÉ D'UN PROP là où il est, tel qu'il est tourné (la jauge DISCRÉTION de Haythem : ★ = ceil(5 · cred), 4 fois
// par seconde, par PartieProp.majHud ; le soupçon des chasseurs, L-O) — sa pièce lue par la carte vivante
export function credibiliteActeur(partie, acteur) {
  if (!acteur || !acteur.prop || !acteur.corps) return 0;
  const c = acteur.corps, Lu = partie && partie.game && partie.game.carte && partie.game.carte.lumieres;
  const Z = Lu && Lu.zoneEn ? Lu.zoneEn(c.pos.x, c.pos.z, c.pos.y + 0.1) : null;
  return credibilite(acteur.prop.cle, c.pos.x, c.pos.y, c.pos.z, acteur.prop.cap ?? c.ang ?? 0, Z ? Z.id : null, c.plaque ? { contreMur: true } : {});
}

// ---------------------------------------------------------------- LES CACHETTES
let _bal = null;
const balistique = () => (_bal && _bal.C === MEUBLES.collisions ? _bal : (_bal = new Balistique(MEUBLES.collisions)));
// les points d'observation d'une pièce : ses passages et ses lieux d'apparition (les nœuds dégagés), l'œil à 1,6 m
function observatoires(zone) {
  const L = [];
  for (const P of PASSAGES_PIECES) if (P.a === zone || P.b === zone) L.push({ x: P.x, y: P.y + 1.6, z: P.z });
  for (const P of POINTS_APPARITION) if (P.zone === zone) L.push({ x: P.x, y: P.y + 1.6, z: P.z });
  return L;
}
// LA COUVERTURE d'une cachette (0..1) : la part des points d'observation de la pièce qui la VOIENT (le haut du meuble)
export function couvertureDe(T, x, y, z, zone) {
  const O = observatoires(zone); if (!O.length) return 0.5;
  const B = balistique(), ty = y + T.haut + 0.05;
  let n = 0;
  for (const o of O) if (B.vue(o.x, o.y, o.z, x, ty, z)) n++;
  return n / O.length;
}
// la distance (au sol) d'un point à la boîte orientée d'une pose
function distPose(P, x, z) {
  const lx = (x - P.cx) * P.c + (z - P.cz) * P.s, lz = -(x - P.cx) * P.s + (z - P.cz) * P.c;
  return Math.hypot(Math.max(0, Math.abs(lx) - P.hx), Math.max(0, Math.abs(lz) - P.hz));
}
// les places essayées autour d'une vraie pose : au pas de sa rangée (bouts), devant et derrière elle (le rang voisin), le
// long du mur (muraux), autour de la table voisine (tabourets, chaises)
function placesAutour(P, T, C) {
  const R = REGLAGES_DEGUISEMENT.cachettes, f = T.famille, L = [];
  // l'axe de la rangée : vers la plus proche semblable de la pièce, sinon l'axe x du meuble
  let ux = Math.cos(P.cap), uz = -Math.sin(P.cap), dm = 2.5;
  for (const Q of MEUBLES.parZone.get(P.zone) || []) {
    if (Q === P) continue;
    const U = MEUBLES.types.get(Q.cle); if (!U || U.famille !== f) continue;
    const d = Math.hypot(Q.x - P.x, Q.z - P.z); if (d > 0.05 && d < dm) { dm = d; ux = (Q.x - P.x) / d; uz = (Q.z - P.z) / d; }
  }
  const pas = P.pas > 0 ? P.pas : Math.max(T.taille.x, T.taille.z) + 0.12, vx = -uz, vz = ux;
  for (const m of [1, -1, 2, -2]) L.push([P.x + ux * pas * m, P.z + uz * pas * m, P.cap]);
  for (const s of [R.rang, -R.rang]) L.push([P.x + vx * s, P.z + vz * s, P.cap]);
  if (T.mural) { const ax = Math.cos(P.cap), az = -Math.sin(P.cap); for (const s of R.mur) L.push([P.x + ax * s, P.z + az * s, P.cap]); }
  // (une table voisine — une forme dont le dessus est entre 0,65 et 1,15 m au-dessus du sol : le meuble tourné vers elle,
  // à la même distance, de part et d'autre)
  if (C && C.grille) {
    const i0 = Math.floor((P.x - 1.2) / 2), i1 = Math.floor((P.x + 1.2) / 2), k0 = Math.floor((P.z - 1.2) / 2), k1 = Math.floor((P.z + 1.2) / 2), vus = new Set();
    for (let i = i0; i <= i1; i++) for (let k = k0; k <= k1; k++) for (const s of C.grille.get((i + 32768) * 65536 + (k + 32768)) || []) {
      if (vus.has(s) || s.off || !s.joueur || MEUBLES.parForme.has(s)) continue;
      vus.add(s);
      const h = s.y1 - P.y; if (!(h > 0.65 && h < 1.15) || s.y0 > P.y + 0.3) continue;
      const sx = s.t === 'c' ? s.x : s.t === 'b' ? (s.x0 + s.x1) / 2 : s.cx, sz = s.t === 'c' ? s.z : s.t === 'b' ? (s.z0 + s.z1) / 2 : s.cz;
      const ext = s.t === 'c' ? s.r : s.t === 'b' ? Math.max(s.x1 - s.x0, s.z1 - s.z0) / 2 : Math.max(s.hx, s.hz);
      const d = Math.hypot(P.x - sx, P.z - sz); if (d < 0.2 || d > 1.2 || ext > 1.0) continue;
      const a0 = Math.atan2(P.x - sx, P.z - sz);
      for (const da of R.table) { const a = a0 + da; const x = sx + Math.sin(a) * d, z = sz + Math.cos(a) * d; L.push([x, z, Math.atan2(sx - x, sz - z)]); }
    }
  }
  return L;
}
// LES CACHETTES d'une zone de jeu, par LOTS (le générateur rend un lot à chaque `next()` — chacun ≤ 5 ms, un budget de
// requêtes au monde solide —, puis la liste complète) : [{ cle, x, y, z, cap, zone, cred, couverture }]. Seulement des
// poses LIBRES (C.libre au rayon du type, dans sa bande, les coins des meubles longs), sur le même sol, hors des vraies
// poses et des passages, ATTEIGNABLES (un nœud du graphe des PROPS à ≤ 0,6 m ; le squelette du graphe, vide, n'en dit rien)
export function* cachettes(zoneJeu, navProps) {
  const C = MEUBLES.collisions, R = REGLAGES_DEGUISEMENT.cachettes, out = [];
  if (!C) { yield []; return out; }
  const pieces = piecesDe(zoneJeu), lot = [];
  const atteindre = navProps && navProps.nb > 0 && navProps.noeudPres ? (x, y, z) => navProps.noeudPres(x, y, z, R.atteinte) >= 0 : () => true;
  let travail = 0;
  for (const P of MEUBLES.poses) {
    if (!pieces.has(P.zone)) continue;
    const T = MEUBLES.types.get(P.cle);
    if (!deguisableDans(T, zoneJeu)) continue;
    for (const [x, z, cap] of placesAutour(P, T, C)) {
      travail++;
      if (travail >= R.budget) { yield lot.splice(0); travail = 0; }
      if (Math.abs(C.solEn(x, z, P.y + 0.3) - P.y) > 0.05) continue;
      if (!C.libre(x, z, T.rayon, P.y, T.bande.haut, T.bande.bas) || !coinsLibres(C, T, x, P.y, z, cap)) continue;
      travail += 1;
      let sur = false;
      for (const Q of MEUBLES.poses) if (Math.abs(Q.y - P.y) < 0.5 && Math.abs(Q.x - x) < 2 && Math.abs(Q.z - z) < 2 && distPose(Q, x, z) < T.rayon * 0.8) { sur = true; break; }
      if (sur || distPassage(x, P.y, z) < R.passage) continue;
      if (out.some((k) => typeDe(k.cle).famille === T.famille && Math.hypot(k.x - x, k.z - z) < R.doublon)) continue;
      if (!atteindre(x, P.y, z)) continue;
      const cred = credibilite(P.cle, x, P.y, z, cap, P.zone), couverture = couvertureDe(T, x, P.y, z, P.zone);
      travail += R.poidsVue;
      const k = { cle: P.cle, x, y: P.y, z, cap, zone: P.zone, cred, couverture };
      out.push(k); lot.push(k);
    }
  }
  yield lot.splice(0);
  return out;
}

// ---------------------------------------------------------------- CE QUE VOIT UN CHASSEUR
// LES CANDIDATS d'un chasseur : vraies poses (d'un type déguisable dans la zone) ET props vivants à ≤ rayon, MÊLÉS et SANS
// MARQUE — les mêmes champs, une `ref` opaque (un entier tiré de la graine de la partie, stable pour une même chose) ; triés
// par position (ni les poses d'abord, ni les props)
const _refs = new Map();             // (pour les TESTS seulement : ref → 'p' | 'a')
function refDe(partie, genre, id) {
  const r = melanger(partie.graine || 1, genre === 'a' ? 0x61 : 0x70, id) >>> 0;
  if (!_refs.has(r)) { if (_refs.size > 50000) _refs.clear(); _refs.set(r, genre); }
  return r;
}
export function candidatsMeubles(partie, x, y, z, rayon, out) {
  out = out || [];
  out.length = 0;
  const r2 = rayon * rayon, zone = partie.zone;
  for (let i = 0; i < MEUBLES.poses.length; i++) {
    const P = MEUBLES.poses[i], dx = P.x - x, dz = P.z - z;
    if (dx * dx + dz * dz > r2 || Math.abs(P.y - y) > 2) continue;
    if (!deguisableDans(typeDe(P.cle), zone)) continue;
    out.push({ x: P.x, y: P.y, z: P.z, cap: P.cap, cle: P.cle, ref: refDe(partie, 'p', P.i) });
  }
  for (const b of partie.acteurs) {
    if (!b.vivant || !b.prop || !b.corps) continue;
    const p = b.corps.pos, dx = p.x - x, dz = p.z - z;
    if (dx * dx + dz * dz > r2 || Math.abs(p.y - y) > 2) continue;
    out.push({ x: p.x, y: p.y, z: p.z, cap: b.prop.cap, cle: b.prop.cle, ref: refDe(partie, 'a', b.id) });
  }
  out.sort((a, b) => a.x - b.x || a.z - b.z);
  return out;
}
// (pour les TESTS seulement : à quoi correspond une `ref` — jamais lu par un cerveau)
export function _refEstActeur(ref) { return _refs.get(ref) === 'a'; }
