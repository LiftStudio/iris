// =====================================================================
//  LE REGISTRE DES MEUBLES (prop hunt) — lot L-K (23/10), sur le squelette du socle S0 (22/10)
// =====================================================================
// Les déguisements du prop hunt sont les VRAIS meubles de l'école (spec § 4.5.13, arbitrages 21 et 36). Après le
// chargement, aucun meuble n'existe plus comme objet : optimiserDecor (js/kit_decor.js) coud 4 198 maillages en 232 blocs
// et fusionnerLocal (js/ecole_portes.js) coud chaque niveau (carte_props § 1.2). La carte ÉTIQUETTE donc ses meubles
// (`objet.userData.meuble = 'type' | { type, nom, formes?, variante?, mural?, surPlace?, deguisable?, voile?, partie?, cap? }` :
// L-K hors du −1, le lot R au −1) et ce registre les COPIE juste avant chaque couture — ses deux appelants, prises du
// socle, en première ligne. Il ne touche à RIEN de la scène : la ligne [optim] et les appels de dessin ne bougent pas.
//   - un étiqueté pris dans un bloc qu'on va coudre (≠ racine) : copié TOUT DE SUITE — un prototype par (type, variante),
//     cloné au premier exemplaire, géométries et matériaux PARTAGÉS (les coutures clonent avant de transformer et ne font
//     que dispose() l'original : les tableaux restent, three les renvoie au premier dessin) ;
//   - un étiqueté qui est la racine même de la couture (cousu SEUL dans son repère, le lot R) : on garde la RÉFÉRENCE et on
//     le copie à la préparation (rattraperRegistre), déjà cousu — 2 ou 3 appels par copie au lieu de 15 à 40 ;
//   - un meuble fait de maillages posés à plat (les distributeurs de la niche du 1er, des boîtes dans le repère du
//     niveau) : chaque maillage porte la même étiquette et un `partie` commun, `cap` dit où regarde sa façade ;
//   - les maillages NON étiquetés croisés en chemin laissent leur signature (sommets, indices, matériau, boîte au mm) et leur
//     place : à la préparation, ceux qui ont la géométrie d'un maillage de prototype sont des meubles oubliés
//     (`nonEtiquetes`) — leur type n'est plus déguisable dans leur zone (un « tir gratuit » pour le chasseur sinon).
// LA VARIANTE : deux meubles d'un même type qui n'ont pas le même sous-arbre (nombre de maillages, sommets, matériaux à leur
// contenu, place de chaque maillage au mm, inclinaison de la racine) ne partagent JAMAIS un prototype : le second devient
// `type:2` (ou `type:variante-2`) — la chaise de bureau à accoudoirs n'est pas celle sans.
// LE REPÈRE d'un prototype : l'origine de la racine posée AU BAS du meuble (le plus bas de ses sommets opaques), tournée de
// son seul cap ; ce qui reste de la pose (l'inclinaison d'un extincteur sur son crochet, l'échelle) est DANS le prototype.
// Une copie posée à (x, y0, z) et tournée de `cap` retombe exactement sur l'original (test L-K 4).
//   T (un type) = { cle, type, variante, nom, famille, proto, boite, taille, rayon, haut, bande, volume, pv, vitesse, mural,
//                   surPlace, deguisable, voile, symetrie, accroche, dos, signature, cleMaillage, source, raison }
//   P (une pose) = { i, cle, x, y, z, cap, zone, cx, cz, hx, hz, y0, y1, c, s, pas, objet? }
//     x, z : l'origine du repère (la racine) ; y : le SOL sous le meuble ; y0, y1 : bas et haut du meuble (monde) ;
//     cx, cz, hx, hz, c, s : la boîte orientée au sol, à la convention de js/collisions.js (c = cos −cap, s = sin −cap :
//     local x = dx·c + dz·s, local z = −dx·s + dz·c) ; pas : le pas de sa rangée (médiane, pasRangee)
// Rien ici n'est appelé par Partie.pas : le registre se construit au chargement et se range à la préparation.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { NIVEAUX } from './jeu/constantes.js';

export const MEUBLES = {
  types: new Map(), poses: [], parZone: new Map(), grille: new Map(), parForme: new Map(), nonEtiquetes: [], horsTolerance: [],
  // (ce que la construction a lu : le test L-K 1 en rejoue autant pour en mesurer le coût)
  stats: { coutures: 0, etiquetes: 0, clones: 0, references: 0, parties: 0, libres: 0, sommets: 0, rattrapes: 0, recales: 0 },
  collisions: null,                 // le monde solide (posé par preparerCatalogue, js/jeu/deguisements.js) : sols, formes
};
// LES TYPES QU'ON NE PREND PAS (le lot R n'écrit pas `deguisable`) : trop grands pour un disque de 0,5 m, plats, accrochés
// en hauteur, ou un plan de travail ; et, par la taille, tout meuble de plus de 1,0 m de long (1,6 m s'il est `surPlace` :
// le baby-foot, on ne le prend que là où l'on s'arrête)
export const DEGUISABLE_PAR_TYPE = {
  comptoir: false, 'tablette-bar': false, tablette: false, etagere: false, table: false, 'table-longue': false, 'table-double': false,
  bureau: false, banquette: false, armoire: false, radiateur: false, ecran: false, tableau: false, 'fauteuil-amphi': false,
};
// LES PROPRIÉTÉS PAR TYPE (exact, ou préfixe terminé par '*') : mural (se plaque contre un mur au verrou, crédible le dos à
// un mur), surPlace (trop long pour voyager), famille (pour la crédibilité : un distributeur de café à côté d'une vitrine de
// friandises est à sa place), symétrie (la période de son cap qui ne se voit pas : 0 = rond, π/2 = carré, π = recto-verso
// pareil ; absente = tout se voit)
export const PROPRIETES_PAR_TYPE = {
  'distributeur*': { mural: true, surPlace: true, famille: 'distributeur' },
  'poubelle*': { mural: true, famille: 'poubelle', symetrie: Math.PI / 2 },
  'mange-debout*': { famille: 'mange-debout', symetrie: 0 },
  'table-haute*': { famille: 'mange-debout', symetrie: Math.PI },
  'tabouret*': { famille: 'tabouret', symetrie: 0 },
  'baby-foot': { surPlace: true, symetrie: Math.PI },
  'micro-ondes': { mural: true },
  extincteur: { mural: true, symetrie: 0 },
  presentoir: { mural: true }, kakemono: { mural: true }, borne: { mural: true },
  copieur: { mural: true, surPlace: true }, affranchisseuse: { mural: true },
  corbeille: { symetrie: 0 }, plante: { symetrie: 0 }, carton: { symetrie: Math.PI / 2 },
};
// LES TAILLES DE RÉFÉRENCE (l × h × p, m ; l'emprise au sol comparée sans son sens : min et max de l et p) — relevées sur la
// copie exacte le 23/10 (banc du lot L-K : la carte construite telle quelle) ; un type dont la boîte en sort de ± 10 %
// n'est plus déguisable (`horsTolerance`, la raison au rapport) : un meuble mal copié — une pièce perdue, une plinthe
// ramassée — trahirait le prop. (Les tailles de carte_props § 2, mesurées par des boîtes d'extraction de ± 0,28 à 0,36 m
// autour d'un siège, ramassaient la table voisine : le test L-K 2 les compare à part, écarts justifiés.)
export const TAILLES_REFERENCE = {
  'chaise-coque': [0.63, 0.80, 0.597], 'chaise-coque-noire': [0.63, 0.792, 0.597], 'chaise-hetre': [0.42, 0.82, 0.458], 'chaise-kahn': [0.42, 0.845, 0.489],
  'chaise-ecusson': [0.438, 0.819, 0.457], 'chaise-dc': [0.44, 0.879, 0.553], 'chaise-marine': [0.452, 0.826, 0.486], 'chaise-visiteur': [0.468, 0.91, 0.53],
  'mange-debout-croix': [0.65, 1.10, 0.65], presentoir: [0.802, 1.73, 0.36], 'distributeur-cafe': [0.80, 1.90, 0.727],
};
const empriseEgale = (t, ref, tol) => Math.abs(t[1] - ref[1]) <= tol * ref[1]
  && Math.abs(Math.min(t[0], t[2]) - Math.min(ref[0], ref[2])) <= tol * Math.min(ref[0], ref[2]) && Math.abs(Math.max(t[0], t[2]) - Math.max(ref[0], ref[2])) <= tol * Math.max(ref[0], ref[2]);
export { empriseEgale };
const LONG_MAX = 1.0, LONG_SUR_PLACE = 1.6, MATERIAUX_MAX = 4;

// L'ÉTAT DU REGISTRE (un objet : le test L-K 1 rejoue la construction dans un bac à sable, sans toucher au vrai)
let _nEtats = 0;
const nouvelEtat = () => ({
  id: ++_nEtats,
  vus: new WeakSet(),                // chaque étiqueté n'est vu qu'une fois
  references: [],                    // les meubles cousus SEULS (racine de leur couture) : copiés plus tard, déjà cousus
  libres: [],                        // les signatures des maillages non étiquetés : { cle, x, y, z, nomMat }
  instances: [],                     // { objet, P } : les poses dont la racine reste dans la scène (recalées au rattrapage)
  sigs: new Map(),                   // type (+ variante) → [{ sig, cle }] : les variantes déjà vues
  cousus: new Map(),                 // signature géométrique → { plat, b0 } : les variantes de couleur partagent leur géométrie cousue
});
let _E = nouvelEtat();
const _sigMat = new WeakMap();       // matériau → signature (à son CONTENU : les jumeaux dédupliqués plus tard ont la même)
const _m = new THREE.Matrix4(), _inv = new THREE.Matrix4(), _pose = new THREE.Matrix4(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(),
  _s = new THREE.Vector3(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _y = new THREE.Vector3(0, 1, 0);
const r3 = (v) => Math.round(v * 1000);                  // (au mm, au millième de radian)
const ang = (a) => Math.atan2(Math.sin(a), Math.cos(a));

const etiquette = (o) => {
  const m = o && o.userData && o.userData.meuble;
  if (!m) return null;
  return typeof m === 'string' ? { type: m } : m;
};
// la propriété d'un type (exact, puis le plus long préfixe en '*')
function propriete(type, nom) {
  const P = PROPRIETES_PAR_TYPE;
  if (P[type] && P[type][nom] !== undefined) return P[type][nom];
  let best = undefined, bl = -1;
  for (const k in P) if (k.endsWith('*') && type.startsWith(k.slice(0, -1)) && k.length > bl && P[k][nom] !== undefined) { best = P[k][nom]; bl = k.length; }
  return best;
}
export function familleDe(type) { return propriete(type, 'famille') || type; }

// LA SIGNATURE D'UN MATÉRIAU à son contenu (celle de js/kit_decor.js signatureMateriau, recopiée : deux jumeaux qu'elle
// dédupliquera sont un même matériau ici)
function sigMat(m) {
  if (!m) return '-';
  let s = _sigMat.get(m);
  if (s) return s;
  const t = (x) => (x ? x.uuid : '-');
  s = [m.type, m.color && m.color.getHexString(), m.roughness, m.metalness, m.emissive && m.emissive.getHexString(), m.emissiveIntensity,
    m.opacity, m.transparent, m.side, m.alphaTest, m.depthWrite, m.polygonOffset, m.toneMapped, t(m.map), t(m.normalMap), t(m.roughnessMap),
    t(m.emissiveMap), t(m.alphaMap), t(m.aoMap), m.onBeforeCompile === THREE.Material.prototype.onBeforeCompile ? '' : 'maison'].join('|');
  _sigMat.set(m, s);
  return s;
}
const nSommets = (g) => (g && g.attributes && g.attributes.position ? g.attributes.position.count : 0);
const nIndices = (g) => (g && g.index ? g.index.count : 0);
// LES EMPREINTES NUMÉRIQUES (deux FNV-1a de 32 bits mêlés d'entiers : une signature sans chaîne à bâtir — la construction lit
// 238 meubles de 20 à 40 maillages et 8 700 maillages du décor : les chaînes coûtaient plus que tout le reste)
const _idMat = new Map();            // signature d'un matériau → petit entier (les jumeaux ont le même)
const idMat = (m) => { const s2 = sigMat(m); let k = _idMat.get(s2); if (k === undefined) _idMat.set(s2, k = _idMat.size + 1); return k; };
class Hache {
  constructor() { this.a = 0x811c9dc5; this.b = 0x01000193 ^ 0x5bd1e995; }
  n(v) { v |= 0; this.a = Math.imul(this.a ^ v, 16777619); this.b = Math.imul(this.b ^ (v >>> 3 | v << 29), 0x5bd1e995) ^ (this.b >>> 15); return this; }
  get valeur() { return (this.a >>> 0).toString(16).padStart(8, '0') + (this.b >>> 0).toString(16).padStart(8, '0'); }
}
// LE REPÈRE DE POSE d'un objet : sa position monde et son seul cap (l'angle autour de Y de son axe +z local)
function capDe(M) {
  M.decompose(_p, _q, _s);
  _v.set(0, 0, 1).applyQuaternion(_q);
  return Math.hypot(_v.x, _v.z) > 1e-6 ? Math.atan2(_v.x, _v.z) : _e.setFromQuaternion(_q, 'YXZ').y;
}
// la boîte (exacte, au sommet près) des maillages OPAQUES d'un sous-arbre, dans le repère `inv` (matrice monde → repère)
function etendre(out, o, inv) {
  const pos = o.geometry.attributes.position; if (!pos) return;
  _m.multiplyMatrices(inv, o.matrixWorld);
  const e = _m.elements, A = pos.array, st = pos.isInterleavedBufferAttribute ? pos.data.stride : pos.itemSize, d0 = pos.isInterleavedBufferAttribute ? pos.offset : 0;
  let x0 = out.min.x, y0 = out.min.y, z0 = out.min.z, x1 = out.max.x, y1 = out.max.y, z1 = out.max.z;
  for (let i = 0, k = d0; i < pos.count; i++, k += st) {
    const x = A[k], y = A[k + 1], z = A[k + 2];
    const X = e[0] * x + e[4] * y + e[8] * z + e[12], Y = e[1] * x + e[5] * y + e[9] * z + e[13], Z = e[2] * x + e[6] * y + e[10] * z + e[14];
    if (X < x0) x0 = X; if (X > x1) x1 = X; if (Y < y0) y0 = Y; if (Y > y1) y1 = Y; if (Z < z0) z0 = Z; if (Z > z1) z1 = Z;
  }
  out.min.set(x0, y0, z0); out.max.set(x1, y1, z1);
  MEUBLES.stats.sommets += pos.count;
}
function boiteExacte(maillages, inv, out) {
  out.makeEmpty();
  for (const o of maillages) if (o.isMesh && o.geometry && !(o.material && o.material.transparent)) etendre(out, o, inv);
  if (out.isEmpty()) for (const o of maillages) if (o.isMesh && o.geometry) etendre(out, o, inv);   // (tout transparent : sa forme quand même)
  return out;
}
const maillagesDe = (o) => { const L = []; o.traverse((m) => { if (m.isMesh) L.push(m); }); return L; };

// LA SIGNATURE D'UN MEUBLE : chaque maillage (sommets, indices, matériau, place relative à la racine au mm — le produit
// des matrices LOCALES du chemin, les mêmes nombres pour deux meubles faits du même code, où qu'ils soient : une matrice
// monde, elle, garde le bruit du cap à 1e-15 près, et une cote qui tombe sur le demi-millimètre basculerait), et ce qui,
// de la pose de la racine, n'est pas son cap (inclinaison, échelle). Rend { sig, geo } : `geo` sans les couleurs (seulement
// la structure des matériaux : quelles pièces partagent le même) — deux variantes de couleur d'une chaise partagent sa
// géométrie cousue
function signatureMeuble(racine, maillages) {
  const H = new Hache(), G = new Hache(), ordre = new Map();
  for (const v of [racine.rotation.x, racine.rotation.z, racine.scale.x, racine.scale.y, racine.scale.z]) { H.n(r3(v)); G.n(r3(v)); }
  for (const o of maillages) {
    _m.identity();
    for (let n = o; n && n !== racine; n = n.parent) _m.premultiply(n.matrix);
    const m = Array.isArray(o.material) ? o.material[0] : o.material;
    let f = ordre.get(m); if (f === undefined) ordre.set(m, f = ordre.size);
    H.n(nSommets(o.geometry)).n(nIndices(o.geometry)).n(idMat(m)); G.n(nSommets(o.geometry)).n(nIndices(o.geometry)).n(f).n(structureMat(m));
    for (const v of _m.elements) { const k = r3(v); H.n(k); G.n(k); }
  }
  return { sig: H.valeur, geo: G.valeur };
}
// la structure d'un matériau (ce qui décide des attributs gardés et de l'ordre de rendu, pas sa couleur)
const structureMat = (m) => (m ? (m.transparent ? 1 : 0) + (m.map ? 2 : 0) + (m.normalMap ? 4 : 0) + (m.aoMap || m.lightMap ? 8 : 0) + (m.vertexColors ? 16 : 0) + (m.alphaTest > 0 ? 32 : 0) : 0);
// (un meuble posé à plat, fait de pièces dans le repère du niveau : leurs matrices monde, rapportées à son repère)
function signaturePieces(maillages, Mpose) {
  _inv.copy(Mpose).invert();
  const H = new Hache().n(0x9ce5);
  for (const o of maillages) { _m.multiplyMatrices(_inv, o.matrixWorld); H.n(nSommets(o.geometry)).n(idMat(o.material)); for (const v of _m.elements) H.n(r3(v)); }
  return { sig: H.valeur, geo: null };
}

// (les attributs dont le matériau se sert : une boîte sans carte n'a que faire de ses UV — les garder séparerait sa famille
// de celle d'un cylindre du même matériau)
const CARTES_UV = ['map', 'normalMap', 'bumpMap', 'roughnessMap', 'metalnessMap', 'alphaMap', 'emissiveMap', 'aoMap', 'lightMap', 'specularMap', 'displacementMap'];
function geometriePropre(g, m, M) {
  const q = new THREE.BufferGeometry();
  for (const k of Object.keys(g.attributes)) {
    const garde = k === 'position' || k === 'normal' || (k === 'uv' && CARTES_UV.some((c) => m[c])) || (k === 'uv1' && (m.aoMap || m.lightMap))
      || (k === 'color' && m.vertexColors) || (k === 'tangent' && m.normalMap);
    if (garde) q.setAttribute(k, g.attributes[k].clone());
  }
  if (g.index) q.setIndex(g.index.clone());
  if (!q.attributes.normal) q.computeVertexNormals();
  q.applyMatrix4(M);
  return q;
}
// les matériaux d'un meuble, dans l'ordre où ses maillages les montrent (le rang d'une famille)
const materiauxDe = (src) => { const L = []; for (const e of src) if (!Array.isArray(e.mat) && !L.includes(e.mat)) L.push(e.mat); return L; };
// LA MÊME GÉOMÉTRIE COUSUE sous d'autres matériaux (une variante de couleur) : les maillages du modèle, chacun avec le
// matériau de la famille de même rang dans le nouveau meuble (même structure : la signature géométrique le garantit)
function recolorer(modele, src) {
  const mats = materiauxDe(src), plat = new THREE.Group();
  for (const c of modele.children) {
    const m = c.clone(false);
    const k = c.userData._rangMat;
    if (k !== undefined && mats[k]) m.material = mats[k];
    plat.add(m);
  }
  plat.updateMatrixWorld(true);
  return plat;
}
// LE PROTOTYPE COUSU, fait directement des maillages de l'original (rien n'est cloné que leurs attributs utiles) : chacun
// ramené dans le repère du prototype (`invP` × sa matrice monde), regroupé par matériau, ordre de rendu et attributs
function aplatir(src, invP) {
  const familles = new Map(), aPart = [], rangs = materiauxDe(src), M = new THREE.Matrix4();
  for (const e of src) {
    const g = e.g, m = e.mat;
    M.multiplyMatrices(invP, e.Mw);
    if (e.o || !g || !g.attributes.position || (g.morphAttributes && Object.keys(g.morphAttributes).length)) { aPart.push({ e, M: M.clone() }); continue; }
    // (l'ombre portée n'entre pas dans la clé : une roulette sans ombre cousue avec le reste du piètement en porte une, à 2 cm
    // près — un maillage de plus coûterait 3 à 4 appels à chaque copie ; `horsAOSol` ne vaut que pour l'ombre cuite du décor)
    const q = geometriePropre(g, m, M);
    const cle = [m.uuid, e.ordre, e.ud.sansNormales, Object.keys(q.attributes).sort().join(',')].join('#');
    if (!familles.has(cle)) familles.set(cle, []);
    familles.get(cle).push({ e, q });
  }
  const plat = new THREE.Group();
  for (const [, L] of familles) {
    // (une famille qui mêle des géométries indexées et d'autres non : toutes à plat — mergeGeometries veut l'un ou l'autre)
    if (L.some((x) => x.q.index) && L.some((x) => !x.q.index)) for (const x of L) if (x.q.index) { const n = x.q.toNonIndexed(); x.q.dispose(); x.q = n; }
    let g = null;
    try { g = L.length > 1 ? mergeGeometries(L.map((x) => x.q), false) : L[0].q; } catch (err) { g = null; }
    if (L.length > 1) for (const x of L) if (x.q !== g) x.q.dispose();
    if (!g) { for (const x of L) { M.multiplyMatrices(invP, x.e.Mw); aPart.push({ e: x.e, M: M.clone() }); } continue; }
    const O = L[0].e, mesh = new THREE.Mesh(g, O.mat);
    mesh.castShadow = L.some((x) => x.e.ombre); mesh.receiveShadow = L.some((x) => x.e.recoit); mesh.renderOrder = O.ordre;
    mesh.userData = { ...O.ud, _rangMat: rangs.indexOf(O.mat) }; mesh.name = O.nom || '';
    plat.add(mesh);
  }
  for (const { e, M: Mo } of aPart) {
    let c;
    if (e.o) { const ud = e.o.userData; e.o.userData = {}; try { c = e.o.clone(false); } finally { e.o.userData = ud; } }
    else { c = new THREE.Mesh(e.g, e.mat); c.castShadow = e.ombre; c.receiveShadow = e.recoit; c.renderOrder = e.ordre; c.userData = { ...e.ud }; }
    Mo.decompose(c.position, c.quaternion, c.scale); plat.add(c);
    MEUBLES.stats.clones++;
  }
  plat.updateMatrixWorld(true);
  return plat;
}

// UN TYPE NEUF : le prototype — les maillages de l'original cousus dans son repère (aucune étiquette n'y passe : un
// clone porterait userData par JSON.stringify, et les `formes` du lot R sont des formes du monde solide) —, sa boîte
// exacte, et ce qui s'en déduit (§ 3.9)
function creerType(cle, E, variante, racines, Mbase, sig, geo = null) {
  // À LA COUTURE, rien que ce qui disparaîtrait : les géométries et matériaux de l'original (références : la couture ne fait
  // que dispose() les géométries — leurs tableaux restent), la matrice monde de chaque pièce. Le prototype, sa boîte et ce
  // qui s'en déduit se font à la préparation (achever) : la construction de l'école n'en paie rien.
  const maillages = racines.flatMap((r) => (r.isMesh ? [r] : maillagesDe(r)));
  const T = {
    cle, type: E.type, variante, nom: E.nom || E.type, famille: familleDe(E.type), E, geo, Mbase: Mbase.clone(), signature: sig, empreinte: sig,
    sources: maillages.map((o) => ({ g: o.geometry, mat: o.material, Mw: o.matrixWorld.clone(), ombre: o.castShadow, recoit: o.receiveShadow, ordre: o.renderOrder,
      ud: { horsAOSol: !!o.userData.horsAOSol, sansNormales: !!o.userData.sansNormales }, o: o.isSkinnedMesh || o.isInstancedMesh || Array.isArray(o.material) ? o : null, nom: o.name })),
    aAchever: true, proto: null, boite: null, taille: null, dy: 0, accroche: 0, source: null,
  };
  MEUBLES.types.set(cle, T);
  return T;
}
// ACHEVER UN TYPE (à la préparation) : sa boîte exacte dans le repère de sa racine (son bas : l'origine du prototype), le
// prototype cousu par matériau (ou la géométrie d'une variante de couleur déjà cousue), la boîte monde de l'original, ce
// qui se déduit de la taille (§ 3.9), et les poses de ses exemplaires
function achever(T) {
  if (!T.aAchever) return;
  T.aAchever = false;
  const E = T.E, type = T.type, src = T.sources;
  _inv.copy(T.Mbase).invert();
  const deja = T.geo ? _E.cousus.get(T.geo) : null;
  const b0 = deja ? deja.b0.clone() : boiteSources(src, _inv, new THREE.Box3());
  const dy = b0.isEmpty() ? 0 : b0.min.y;
  const Mp = new THREE.Matrix4().multiplyMatrices(T.Mbase, new THREE.Matrix4().makeTranslation(0, dy, 0));
  const invP = new THREE.Matrix4().copy(Mp).invert();
  // (la plus grosse pièce de l'ORIGINAL : sa signature reconnaît un exemplaire oublié du décor)
  let grosse = null;
  for (const e of src) if (!e.mat || !e.mat.transparent) if (!grosse || nSommets(e.g) > nSommets(grosse.g)) grosse = e;
  const cleM = grosse && nSommets(grosse.g) >= 8 ? (() => {
    const A = grosse.g.attributes.position, n = A.count, m = Array.isArray(grosse.mat) ? grosse.mat[0] : grosse.mat;
    return { ni: n + ':' + nIndices(grosse.g), mat: sigMat(m), a: [A.getX(0), A.getY(0), A.getZ(0), A.getX(n >> 1), A.getY(n >> 1), A.getZ(n >> 1)] };
  })() : null;
  // LE PROTOTYPE COUSU par matériau (comme fusionnerLocal) : une copie coûte un appel de dessin par matériau et par passe
  // (une chaise de 22 maillages en coûterait 88 en haute), et ses pièces restent exactement à leur place
  const plat = deja ? recolorer(deja.plat, src) : aplatir(src, invP);
  plat.name = 'prototype ' + T.cle;
  if (T.geo && !deja) _E.cousus.set(T.geo, { plat, b0: b0.clone() });
  // (la boîte du prototype : celle de l'original dans le repère de sa racine, ramenée à son bas — les mêmes sommets)
  const boite = b0.isEmpty() ? new THREE.Box3() : b0.clone().translate(_v.set(0, -dy, 0));
  if (boite.isEmpty()) boite.set(new THREE.Vector3(-0.2, 0, -0.2), new THREE.Vector3(0.2, 0.4, 0.2));
  const taille = boite.getSize(new THREE.Vector3());
  const l = taille.x, h = taille.y, p = taille.z, volume = Math.max(1e-4, l * h * p), k3 = Math.cbrt(volume);
  const surPlace = E.surPlace ?? propriete(type, 'surPlace') ?? false;
  const longMax = surPlace ? LONG_SUR_PLACE : LONG_MAX;
  let deguisable = E.deguisable ?? (DEGUISABLE_PAR_TYPE[type] !== false), raison = deguisable ? null : 'type';
  if (deguisable && Math.max(l, p) > longMax) { deguisable = false; raison = 'trop long (' + Math.max(l, p).toFixed(2) + ' m)'; }
  // (une copie coûte un appel par maillage opaque et par passe — principale, normales de l'occlusion, ombre, contact au RDC :
  // au-delà de 4 matériaux opaques elle dépasserait 12 appels en haute, le budget d'un prop, spec § 5.5.8 point 3)
  const opaques = plat.children.filter((m) => m.isMesh && !(m.material && m.material.transparent)).length;
  if (deguisable && opaques > MATERIAUX_MAX) { deguisable = false; raison = 'trop de matériaux (' + opaques + ' : plus de 12 appels par copie)'; }
  Object.assign(T, {
    proto: plat, boite, taille, volume,
    rayon: Math.min(0.5, Math.max(0.15, Math.max(l, p) / 2 * 0.9)), haut: h,
    bande: { bas: Math.min(0.25, 0.4 * h), haut: Math.max(h, 0.5) },
    pv: Math.round(Math.min(145, Math.max(60, 40 + 90 * k3))),
    vitesse: 4.6 * Math.min(1.05, Math.max(0.72, 1.15 - 0.35 * k3)),
    mural: !!(E.mural ?? propriete(type, 'mural')), surPlace: !!surPlace, voile: E.voile !== false,
    deguisable, raison, deguisableBase: deguisable, raisonBase: raison, symetrie: propriete(type, 'symetrie') ?? null,
    dos: Math.max(0.02, -boite.min.z), dy, maillages: plat.children.length, cleMaillage: cleM,
  });
  // (l'original, pour le test L-K 4 : sa boîte monde exacte, au sommet près)
  const bm = boiteSources(src, new THREE.Matrix4(), new THREE.Box3());
  T.source = { i: T.premiere, min: bm.min.toArray(), max: bm.max.toArray() };
  T.sources = null; T.E = { type: E.type, nom: E.nom, variante: E.variante, mural: E.mural, surPlace: E.surPlace, voile: E.voile };
  for (const P of MEUBLES.poses) if (P.cle === T.cle) poserAcheve(P, T);
}
// la boîte exacte des pièces gardées (opaques d'abord), dans le repère `inv`
function boiteSources(src, inv, out) {
  out.makeEmpty();
  const F = { isMesh: true, geometry: null, matrixWorld: null, material: null };
  for (const passe of [0, 1]) {
    for (const e of src) { if (passe === 0 && e.mat && e.mat.transparent) continue; F.geometry = e.g; F.matrixWorld = e.Mw; etendre(out, F, inv); }
    if (!out.isEmpty()) break;
  }
  return out;
}

// LA CLÉ D'UN EXEMPLAIRE : son type, sa variante (donnée, ou dérivée de la signature)
function cleDe(E, sig) {
  const base = E.type + (E.variante ? ':' + E.variante : '');
  let L = _E.sigs.get(base);
  if (!L) _E.sigs.set(base, L = []);
  for (const e of L) if (e.sig === sig) return { cle: e.cle, variante: e.variante, neuf: false };
  const n = L.length + 1;
  const variante = n === 1 ? (E.variante || null) : (E.variante ? E.variante + '-' + n : String(n));
  const cle = E.type + (variante ? ':' + variante : '');
  L.push({ sig, cle, variante });
  return { cle, variante, neuf: true };
}

// LA POSE d'un exemplaire : sa matrice gardée (repère monde Mbase de sa racine), ses mesures quand son type est achevé
function poserExemplaire(T, Mbase, objet) {
  const P = { i: MEUBLES.poses.length, cle: T.cle, x: 0, y: 0, z: 0, cap: 0, zone: null, cx: 0, cz: 0, hx: 0, hz: 0, y0: 0, y1: 0, c: 1, s: 0, pas: 0, Mbase: Mbase.clone() };
  MEUBLES.poses.push(P);
  if (T.premiere === undefined) T.premiere = P.i;
  if (objet && !objet.isMesh) _E.instances.push({ objet, P });
  if (!T.aAchever) poserAcheve(P, T);
  return P;
}
function poserAcheve(P, T) {
  P.Mbase.decompose(_p, _q, _s);
  const cap = capDe(P.Mbase), y0 = _p.y + T.dy;
  Object.assign(P, { x: _p.x, y: y0, z: _p.z, cap, hx: T.taille.x / 2, hz: T.taille.z / 2, y0, y1: y0 + T.taille.y, c: Math.cos(-cap), s: Math.sin(-cap) });
  centrer(P, T);
}
// le centre au sol de la boîte orientée : le centre de la boîte du prototype, tourné de cap
function centrer(P, T) {
  const b = T.boite, lx = (b.min.x + b.max.x) / 2, lz = (b.min.z + b.max.z) / 2, c = Math.cos(P.cap), s = Math.sin(P.cap);
  P.cx = P.x + lx * c + lz * s; P.cz = P.z - lx * s + lz * c;
}

// NOTER UN MEUBLE (une racine, ou les pièces d'un meuble posé à plat)
function noter(racines, E) {
  const R0 = racines[0];
  for (const r of racines) r.updateWorldMatrix(true, true);
  let Mbase;
  if (racines.length === 1 && !E.partie) {
    // le repère : l'origine de la racine, tournée de son seul cap
    const M = R0.matrixWorld, cap = capDe(M);
    M.decompose(_p, _q, _s);
    Mbase = new THREE.Matrix4().makeRotationY(cap).setPosition(_p.x, _p.y, _p.z);
  } else {
    // (un meuble à plat : le milieu au sol de ses pièces, tourné du cap donné par l'étiquette)
    const B = new THREE.Box3(), b = new THREE.Box3();
    for (const o of racines.flatMap((r) => (r.isMesh ? [r] : maillagesDe(r)))) {
      if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
      B.union(b.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld));
    }
    Mbase = new THREE.Matrix4().makeRotationY(E.cap || 0).setPosition((B.min.x + B.max.x) / 2, B.min.y, (B.min.z + B.max.z) / 2);
  }
  const maillages = racines.flatMap((r) => (r.isMesh ? [r] : maillagesDe(r)));
  const S = racines.length === 1 && !E.partie ? signatureMeuble(R0, maillages) : signaturePieces(maillages, Mbase), sig = S.sig;
  const k = cleDe(E, sig);
  let T = MEUBLES.types.get(k.cle);
  if (!T) T = creerType(k.cle, E, k.variante, racines, Mbase, sig, S.geo);
  const P = poserExemplaire(T, Mbase, racines.length === 1 ? R0 : null);
  P.empreinte = sig;
  for (const f of E.formes || []) if (f && !MEUBLES.parForme.has(f)) MEUBLES.parForme.set(f, P.i);
  MEUBLES.stats.etiquetes++;
  return P;
}

// LE PARCOURS d'un sous-arbre avant sa couture : les étiquetés, et la signature de chaque maillage non étiqueté
// (`libres` : noter les maillages non étiquetés — pas sous un groupe `nofuse` vu depuis la scène : un niveau déjà cousu, dont
// les originaux ont été notés à sa propre couture, et dont les blocs ne sont pas des meubles)
function parcourir(racine, parties) {
  // (une pile plutôt qu'une récursion : 13 000 objets à la construction de l'école, la plupart des maillages du décor)
  const pile = [racine], libresPile = [true], L = _E.libres;
  while (pile.length) {
    const o = pile.pop();
    let libres = libresPile.pop();
    const u = o.userData, m = u.meuble;
    if (m) {
      if (_E.vus.has(o)) continue;
      _E.vus.add(o);
      const E = typeof m === 'string' ? { type: m } : m;
      if (E.partie) { let P = parties.get(E.partie); if (!P) parties.set(E.partie, P = { E, racines: [] }); P.racines.push(o); continue; }
      if (o === racine) { _E.references.push(o); MEUBLES.stats.references++; continue; }
      noter([o], E);
      continue;
    }
    if (libres && o !== racine && u.nofuse) libres = false;
    // (un maillage non étiqueté : rien de calculé ici — ses comptes de sommets et d'indices, son matériau, deux sommets lus
    // tels quels, sa position LOCALE et son parent ; la signature n'est bâtie, à la préparation, que pour les rares qui ont
    // les comptes de la grosse pièce d'un prototype, et le monde ne se lit que pour eux ; la couture recalcule toutes les
    // matrices juste après. Un maillage vu deux fois — un vantail cousu seul puis revu depuis la scène — n'est qu'en double.)
    if (libres && o.isMesh && !u.dynamique && !u.suite) {
      const g = o.geometry, A = g && g.attributes.position;
      const n = A ? A.count : 0;
      if (n >= 8 && n <= 40000) {
        const T = A.array, inter = A.isInterleavedBufferAttribute, k = inter ? A.offset : 0, km = k + (n >> 1) * (inter ? A.data.stride : 3);
        L.push({ n, idx: g.index ? g.index.count : 0, mat: Array.isArray(o.material) ? o.material[0] : o.material, a0: T[k], a1: T[k + 1], a2: T[k + 2], a3: T[km], a4: T[km + 1], a5: T[km + 2],
          parent: o.parent, lx: o.position.x, ly: o.position.y, lz: o.position.z });
      }
    }
    const C = o.children;
    for (let k = C.length - 1; k >= 0; k--) { pile.push(C[k]); libresPile.push(libres); }
  }
  MEUBLES.stats.libres = L.length;
}

// AVANT CHAQUE COUTURE (racine comprise) : fusionnerLocal et optimiserDecor l'appellent en première ligne
export function fermerRegistre(racine) {
  if (!racine || !racine.traverse) return;
  MEUBLES.stats.coutures++;
  const parties = new Map();
  parcourir(racine, parties);
  for (const [, L] of parties) { noter(L.racines, L.E); MEUBLES.stats.parties++; }
}

// À LA PRÉPARATION d'une partie : les références gardées (meubles cousus seuls), les étiquetés qu'aucune couture n'a vus
// (groupes `nofuse`) ; les poses recalées si leur racine a bougé depuis (un groupe de niveau décalé après sa couture) ; les
// maillages oubliés comparés aux prototypes
export function rattraperRegistre(scene) {
  for (const o of _E.references.splice(0)) { const E = etiquette(o); if (E) { noter([o], E); MEUBLES.stats.rattrapes++; } }
  if (scene && scene.traverse) {
    const L = [];
    scene.traverse((o) => { if (o.userData && o.userData.meuble && !_E.vus.has(o) && !o.userData.dynamique) L.push(o); });
    for (const o of L) { _E.vus.add(o); const E = etiquette(o); if (E && !E.partie) { noter([o], E); MEUBLES.stats.rattrapes++; } }
  }
  // (les types notés à la couture, achevés ici : prototypes, boîtes, poses)
  for (const [, T] of MEUBLES.types) achever(T);
  // (les racines restées dans la scène : leur pose relue sur la matrice d'aujourd'hui)
  for (const { objet, P } of _E.instances) {
    if (!objet.parent) continue;
    objet.updateWorldMatrix(true, false);
    const T = MEUBLES.types.get(P.cle), M = objet.matrixWorld, cap = capDe(M);
    M.decompose(_p, _q, _s);
    if (Math.abs(_p.x - P.x) > 1e-3 || Math.abs(_p.z - P.z) > 1e-3 || Math.abs(_p.y + T.dy - P.y0) > 1e-3 || Math.abs(ang(cap - P.cap)) > 1e-3) {
      P.Mbase.makeRotationY(cap).setPosition(_p.x, _p.y, _p.z); poserAcheve(P, T); MEUBLES.stats.recales++;
    }
  }
  // LES OUBLIÉS : un maillage non étiqueté qui a la signature de la plus grosse pièce d'un prototype ; ou, pour les
  // extincteurs, un matériau qui le dit (ils n'ont pas tous la même géométrie : celui de l'ascenseur, de L-M)
  const parCle = new Map();
  for (const [, T] of MEUBLES.types) if (T.cleMaillage) { const k = T.cleMaillage; if (!parCle.has(k.ni)) parCle.set(k.ni, []); parCle.get(k.ni).push(T); }
  for (const L of _E.libres) {
    const nomMat = (L.mat && L.mat.name) || '';
    const a = [L.a0, L.a1, L.a2, L.a3, L.a4, L.a5];
    const T = (parCle.get(L.n + ':' + L.idx) || []).find((U) => U.cleMaillage.mat === sigMat(L.mat) && U.cleMaillage.a.every((v, i) => Math.abs(v - a[i]) < 5e-4)) || null;
    let type = T ? T.type : null;
    if (!type && /extincteur/i.test(nomMat)) type = 'extincteur';
    if (!type) continue;
    // (un même meuble oublié a plusieurs pièces : une entrée par meuble, à 0,6 m près)
    if (L.x === undefined) { if (L.parent) { L.parent.updateWorldMatrix(true, false); _v.set(L.lx, L.ly, L.lz).applyMatrix4(L.parent.matrixWorld); } else _v.set(L.lx, L.ly, L.lz); L.x = _v.x; L.y = _v.y; L.z = _v.z; L.parent = null; }
    if (MEUBLES.nonEtiquetes.some((e) => e.type === type && Math.hypot(e.x - L.x, e.z - L.z) < 0.6 && Math.abs(e.y - L.y) < 1)) continue;
    MEUBLES.nonEtiquetes.push({ type, cle: T ? T.cle : null, zone: null, x: L.x, y: L.y, z: L.z, materiau: nomMat });
  }
  // LES TAILLES hors tolérance (± 10 % de la table de référence) : le type n'est plus déguisable
  MEUBLES.horsTolerance.length = 0;
  for (const [cle, T] of MEUBLES.types) {
    T.deguisable = T.deguisableBase; T.raison = T.raisonBase;
    const ref = TAILLES_REFERENCE[cle] || TAILLES_REFERENCE[T.type];
    if (!ref) continue;
    const t = [T.taille.x, T.taille.y, T.taille.z];
    if (!empriseEgale(t, ref, 0.1)) {
      MEUBLES.horsTolerance.push({ cle, type: T.type, taille: t.map((v) => +v.toFixed(3)), reference: ref });
      T.deguisable = false; T.raison = 'taille hors tolérance';
    }
  }
  return MEUBLES;
}

// LE SOL sous une pose : le monde solide s'il est connu (le palier d'un escalier, la chaussée), sinon le sol du niveau
function solDe(P, C) {
  if (C) {
    const s = C.solEn(P.x, P.z, P.y0 + 0.3);
    if (s <= P.y0 + 0.05) return s;
  }
  let s = NIVEAUX[0].sol;
  for (const N of NIVEAUX) if (N.sol <= P.y0 + 0.05) s = N.sol;
  return P.y0 - s < 0.3 ? P.y0 : s;
}
const cleCase = (i, k) => (i + 32768) * 65536 + (k + 32768);
export const CASE_GRILLE = 2;
export { cleCase };
// LES ZONES : chaque pose dans sa pièce (lumieres.zoneEn au-dessus de son sol), rangée par zone et dans une grille de 2 m
// (chaque case que touche sa boîte orientée) ; son sol ; le pas de sa rangée ; l'accroche des muraux ; la zone des oubliés
export function zonerRegistre(lumieres, collisions = MEUBLES.collisions) {
  const C = collisions || null;
  if (C) MEUBLES.collisions = C;
  MEUBLES.parZone.clear(); MEUBLES.grille.clear();
  const zoneEn = (x, z, y) => { const Z = lumieres && lumieres.zoneEn ? lumieres.zoneEn(x, z, y) : null; return Z ? Z.id : null; };
  for (const P of MEUBLES.poses) {
    P.y = solDe(P, C);
    P.zone = zoneEn(P.cx, P.cz, P.y + 0.1) ?? zoneEn(P.x, P.z, P.y + 0.1);
    if (!MEUBLES.parZone.has(P.zone)) MEUBLES.parZone.set(P.zone, []);
    MEUBLES.parZone.get(P.zone).push(P);
    const ex = Math.abs(P.c) * P.hx + Math.abs(P.s) * P.hz, ez = Math.abs(P.s) * P.hx + Math.abs(P.c) * P.hz;
    for (let i = Math.floor((P.cx - ex) / CASE_GRILLE); i <= Math.floor((P.cx + ex) / CASE_GRILLE); i++)
      for (let k = Math.floor((P.cz - ez) / CASE_GRILLE); k <= Math.floor((P.cz + ez) / CASE_GRILLE); k++) {
        const q = cleCase(i, k); let L = MEUBLES.grille.get(q);
        if (!L) MEUBLES.grille.set(q, L = []);
        L.push(P);
      }
  }
  // le pas de rangée : la médiane, sur les poses d'une même famille dans une même pièce, de la distance à la plus proche
  // semblable (0,7 m dans la salle d'attente) ; 0 pour une pose seule
  for (const [, L] of MEUBLES.parZone) {
    const parF = new Map();
    for (const P of L) { const f = MEUBLES.types.get(P.cle).famille; if (!parF.has(f)) parF.set(f, []); parF.get(f).push(P); }
    for (const [, G] of parF) {
      if (G.length < 2) { for (const P of G) P.pas = 0; continue; }
      const d = G.map((P) => { let m = Infinity; for (const Q of G) if (Q !== P) m = Math.min(m, Math.hypot(Q.x - P.x, Q.z - P.z)); return m; }).sort((a, b) => a - b);
      const med = d[d.length >> 1];
      for (const P of G) P.pas = med;
    }
  }
  // l'accroche d'un type (un extincteur pendu à 0,83 m) : la médiane de la hauteur de ses exemplaires au-dessus du sol
  const acc = new Map();
  for (const P of MEUBLES.poses) { if (!acc.has(P.cle)) acc.set(P.cle, []); acc.get(P.cle).push(P.y0 - P.y); }
  for (const [cle, L] of acc) { const T = MEUBLES.types.get(cle); L.sort((a, b) => a - b); T.accroche = Math.max(0, L[L.length >> 1]); }
  // (un meuble posé sur un autre — une machine sur un bureau — n'est pas déguisable : au sol, il serait absurde)
  for (const [, T] of MEUBLES.types) {
    if (T.raison === 'posé sur un meuble') { T.deguisable = T.deguisableBase; T.raison = T.raisonBase; }
    if (T.deguisable && !T.mural && T.accroche > 0.3) { T.deguisable = false; T.raison = 'posé sur un meuble'; }
  }
  for (const N of MEUBLES.nonEtiquetes) N.zone = zoneEn(N.x, N.z, N.y) ?? zoneEn(N.x, N.z, N.y - 0.6);
  return MEUBLES;
}

// UNE COPIE d'un type, prête à poser (racine de scène, dynamique : hors des photos du décor, du cache d'ombre fixe)
export function copieMeuble(cle) {
  const T = MEUBLES.types.get(cle);
  if (!T) return null;
  const g = T.proto.clone(true);
  g.name = 'copie ' + cle;
  g.userData = { ...g.userData, meuble: cle, dynamique: true };
  return g;
}

// LE BAC À SABLE (pour les TESTS : le test L-K 1 mesure le coût du registre en rejouant la construction sur une réplique,
// le vrai registre mis de côté puis rendu tel quel)
export function _bacASable(fn) {
  const E0 = _E, M0 = { types: MEUBLES.types, poses: MEUBLES.poses, parZone: MEUBLES.parZone, grille: MEUBLES.grille, parForme: MEUBLES.parForme,
    nonEtiquetes: MEUBLES.nonEtiquetes, horsTolerance: MEUBLES.horsTolerance, stats: MEUBLES.stats };
  _E = nouvelEtat();
  Object.assign(MEUBLES, { types: new Map(), poses: [], parZone: new Map(), grille: new Map(), parForme: new Map(), nonEtiquetes: [], horsTolerance: [],
    stats: { coutures: 0, etiquetes: 0, clones: 0, references: 0, parties: 0, libres: 0, sommets: 0, rattrapes: 0, recales: 0 } });
  try { return fn(MEUBLES); } finally { _E = E0; Object.assign(MEUBLES, M0); }
}
