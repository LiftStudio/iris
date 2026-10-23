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
// LES TAILLES DE RÉFÉRENCE (l × h × p, m ; carte_props § 2 et conception_prophunt § 4, mesurées par extraction) : un type
// dont la boîte sort de ± 10 % n'est pas déguisable (`horsTolerance`, la raison au rapport) — un meuble mal copié
// (la plinthe ramassée, une pièce perdue) trahirait le prop
export const TAILLES_REFERENCE = {
  'chaise-coque': [0.63, 0.80, 0.60], 'tabouret-miura:1': [0.53, 0.85, 0.52], 'chaise-hetre': [0.44, 0.86, 0.55],
  'chaise-kahn': [0.49, 0.85, 0.55], 'chaise-ecusson': [0.42, 0.82, 0.48], 'chaise-bureau': [0.68, 1.05, 0.66],
  presentoir: [0.36, 1.73, 0.80],
};
const LONG_MAX = 1.0, LONG_SUR_PLACE = 1.6;

const _vus = new WeakSet();          // chaque étiqueté n'est vu qu'une fois
const _maillesVues = new WeakSet();  // chaque maillage non étiqueté aussi
const _references = [];              // les meubles cousus SEULS (racine de leur couture) : copiés plus tard, déjà cousus
const _libres = [];                  // les signatures des maillages non étiquetés : { cle, x, y, z, nomMat }
const _instances = [];               // { objet, P } : les poses dont la racine reste dans la scène (recalées au rattrapage)
const _sigs = new Map();             // type (+ variante) → [{ sig, cle }] : les variantes déjà vues
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
// la boîte d'une géométrie au mm (calculée une fois)
function sigBoite(g) {
  if (!g.boundingBox) g.computeBoundingBox();
  const b = g.boundingBox;
  return [b.min.x, b.min.y, b.min.z, b.max.x, b.max.y, b.max.z].map(r3).join(',');
}
// la signature d'UN maillage (la même pour un maillage de prototype et pour un maillage oublié du décor)
const cleMaillage = (o) => nSommets(o.geometry) + '|' + nIndices(o.geometry) + '|' + sigMat(Array.isArray(o.material) ? o.material[0] : o.material) + '|' + sigBoite(o.geometry);

// LE REPÈRE DE POSE d'un objet : sa position monde et son seul cap (l'angle autour de Y de son axe +z local)
function capDe(M) {
  M.decompose(_p, _q, _s);
  _v.set(0, 0, 1).applyQuaternion(_q);
  return Math.hypot(_v.x, _v.z) > 1e-6 ? Math.atan2(_v.x, _v.z) : _e.setFromQuaternion(_q, 'YXZ').y;
}
// la boîte (exacte, au sommet près) des maillages OPAQUES d'un sous-arbre, dans le repère `inv` (matrice monde → repère)
function boiteExacte(maillages, inv, out) {
  out.makeEmpty();
  for (const o of maillages) {
    if (!o.isMesh || !o.geometry || (o.material && o.material.transparent)) continue;
    const pos = o.geometry.attributes.position; if (!pos) continue;
    _m.multiplyMatrices(inv, o.matrixWorld);
    for (let i = 0; i < pos.count; i++) out.expandByPoint(_v.fromBufferAttribute(pos, i).applyMatrix4(_m));
    MEUBLES.stats.sommets += pos.count;
  }
  if (out.isEmpty()) for (const o of maillages) {         // (tout transparent : on prend quand même sa forme)
    if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) continue;
    const pos = o.geometry.attributes.position; _m.multiplyMatrices(inv, o.matrixWorld);
    for (let i = 0; i < pos.count; i++) out.expandByPoint(_v.fromBufferAttribute(pos, i).applyMatrix4(_m));
  }
  return out;
}
const maillagesDe = (o) => { const L = []; o.traverse((m) => { if (m.isMesh) L.push(m); }); return L; };

// LA SIGNATURE D'UN MEUBLE : chaque maillage (sommets, indices, matériau, place relative à la racine au mm — le produit
// des matrices LOCALES du chemin, les mêmes nombres pour deux meubles faits du même code, où qu'ils soient : une matrice
// monde, elle, garde le bruit du cap à 1e-15 près, et une cote qui tombe sur le demi-millimètre basculerait), et ce qui,
// de la pose de la racine, n'est pas son cap (inclinaison, échelle)
function signatureMeuble(racine, maillages) {
  const parts = [[racine.rotation.x, racine.rotation.z, racine.scale.x, racine.scale.y, racine.scale.z].map(r3).join(',')];
  for (const o of maillages) {
    _m.identity();
    for (let n = o; n && n !== racine; n = n.parent) _m.premultiply(n.matrix);
    parts.push(nSommets(o.geometry) + '/' + nIndices(o.geometry) + '/' + sigMat(Array.isArray(o.material) ? o.material[0] : o.material) + '/' +
      _m.elements.map(r3).join(','));
  }
  return parts.join(';');
}
// (un meuble posé à plat, fait de pièces dans le repère du niveau : leurs matrices monde, rapportées à son repère)
function signaturePieces(maillages, Mpose) {
  _inv.copy(Mpose).invert();
  return maillages.map((o) => { _m.multiplyMatrices(_inv, o.matrixWorld); return nSommets(o.geometry) + '/' + sigMat(o.material) + '/' + _m.elements.map(r3).join(','); }).join(';');
}

// UN TYPE NEUF : le prototype (la racine clonée SANS son étiquette — userData passe par JSON.stringify, et les `formes` du
// lot R sont des formes du monde solide), posé dans son repère, sa boîte exacte, et ce qui s'en déduit (§ 3.9)
function creerType(cle, E, variante, racines, Mbase, sig) {
  const type = E.type, maillages = racines.flatMap((r) => (r.isMesh ? [r] : maillagesDe(r)));
  // la boîte dans le repère de la racine tourné de son cap : son bas donne l'origine du prototype
  _inv.copy(Mbase).invert();
  const b0 = boiteExacte(maillages, _inv, new THREE.Box3());
  const dy = b0.isEmpty() ? 0 : b0.min.y;
  const Mp = new THREE.Matrix4().multiplyMatrices(Mbase, new THREE.Matrix4().makeTranslation(0, dy, 0));
  const invP = new THREE.Matrix4().copy(Mp).invert();
  const proto = new THREE.Group(); proto.name = 'prototype ' + cle;
  for (const r of racines) {
    const ud = r.userData; r.userData = {};
    let c;
    try { c = r.clone(true); } finally { r.userData = ud; }
    _m.multiplyMatrices(invP, r.matrixWorld); _m.decompose(c.position, c.quaternion, c.scale);
    c.matrixAutoUpdate = true;
    proto.add(c);
    MEUBLES.stats.clones++;
  }
  proto.updateMatrixWorld(true);
  const boite = boiteExacte(maillagesDe(proto), new THREE.Matrix4(), new THREE.Box3());
  if (boite.isEmpty()) boite.set(new THREE.Vector3(-0.2, 0, -0.2), new THREE.Vector3(0.2, 0.4, 0.2));
  const taille = boite.getSize(new THREE.Vector3());
  const l = taille.x, h = taille.y, p = taille.z, volume = Math.max(1e-4, l * h * p), k3 = Math.cbrt(volume);
  const surPlace = E.surPlace ?? propriete(type, 'surPlace') ?? false;
  const longMax = surPlace ? LONG_SUR_PLACE : LONG_MAX;
  let deguisable = E.deguisable ?? (DEGUISABLE_PAR_TYPE[type] !== false), raison = deguisable ? null : 'type';
  if (deguisable && Math.max(l, p) > longMax) { deguisable = false; raison = 'trop long (' + Math.max(l, p).toFixed(2) + ' m)'; }
  // (la plus grosse pièce du meuble : sa signature reconnaît un exemplaire oublié du décor)
  let grosse = null;
  for (const o of maillagesDe(proto)) if (!o.material || !o.material.transparent) if (!grosse || nSommets(o.geometry) > nSommets(grosse.geometry)) grosse = o;
  const T = {
    cle, type, variante, nom: E.nom || type, famille: familleDe(type), proto, boite, taille, volume,
    rayon: Math.min(0.5, Math.max(0.15, Math.max(l, p) / 2 * 0.9)), haut: h,
    bande: { bas: Math.min(0.25, 0.4 * h), haut: Math.max(h, 0.5) },
    pv: Math.round(Math.min(145, Math.max(60, 40 + 90 * k3))),
    vitesse: 4.6 * Math.min(1.05, Math.max(0.72, 1.15 - 0.35 * k3)),
    mural: !!(E.mural ?? propriete(type, 'mural')), surPlace: !!surPlace, voile: E.voile !== false,
    deguisable, raison, deguisableBase: deguisable, raisonBase: raison, symetrie: propriete(type, 'symetrie') ?? null,
    accroche: 0, dos: Math.max(0.02, -boite.min.z), dy, signature: sig,
    cleMaillage: grosse && nSommets(grosse.geometry) >= 8 ? cleMaillage(grosse) : null,
    source: null,
  };
  MEUBLES.types.set(cle, T);
  return T;
}

// LA CLÉ D'UN EXEMPLAIRE : son type, sa variante (donnée, ou dérivée de la signature)
function cleDe(E, sig) {
  const base = E.type + (E.variante ? ':' + E.variante : '');
  let L = _sigs.get(base);
  if (!L) _sigs.set(base, L = []);
  for (const e of L) if (e.sig === sig) return { cle: e.cle, variante: e.variante, neuf: false };
  const n = L.length + 1;
  const variante = n === 1 ? (E.variante || null) : (E.variante ? E.variante + '-' + n : String(n));
  const cle = E.type + (variante ? ':' + variante : '');
  L.push({ sig, cle, variante });
  return { cle, variante, neuf: true };
}

// LA POSE d'un exemplaire (repère monde Mbase de sa racine ; le type donne le bas et la boîte)
function poserExemplaire(T, Mbase, objet) {
  Mbase.decompose(_p, _q, _s);
  const cap = capDe(Mbase), x = _p.x, z = _p.z, y0 = _p.y + T.dy;
  const P = { i: MEUBLES.poses.length, cle: T.cle, x, y: y0, z, cap, zone: null, cx: 0, cz: 0, hx: T.taille.x / 2, hz: T.taille.z / 2,
    y0, y1: y0 + T.taille.y, c: Math.cos(-cap), s: Math.sin(-cap), pas: 0 };
  centrer(P, T);
  MEUBLES.poses.push(P);
  if (objet && !objet.isMesh) _instances.push({ objet, P });
  return P;
}
// le centre au sol de la boîte orientée : le centre de la boîte du prototype, tourné de cap
function centrer(P, T) {
  const b = T.boite, lx = (b.min.x + b.max.x) / 2, lz = (b.min.z + b.max.z) / 2, c = Math.cos(P.cap), s = Math.sin(P.cap);
  P.cx = P.x + lx * c + lz * s; P.cz = P.z - lx * s + lz * c;
}

// NOTER UN MEUBLE (une racine, ou les pièces d'un meuble posé à plat)
function noter(racines, E, aJour = false) {
  const R0 = racines[0];
  if (!aJour) for (const r of racines) r.updateWorldMatrix(true, true);
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
  const sig = racines.length === 1 && !E.partie ? signatureMeuble(R0, maillages) : 'pieces#' + signaturePieces(maillages, Mbase);
  const k = cleDe(E, sig);
  let T = MEUBLES.types.get(k.cle);
  if (!T) T = creerType(k.cle, E, k.variante, racines, Mbase, sig);
  const P = poserExemplaire(T, Mbase, racines.length === 1 ? R0 : null);
  if (!T.source) {
    // (l'original, pour le test L-K 4 : sa boîte monde exacte, au sommet près)
    const bm = boiteExacte(maillages, new THREE.Matrix4(), new THREE.Box3());
    T.source = { i: P.i, min: bm.min.toArray(), max: bm.max.toArray() };
  }
  for (const f of E.formes || []) if (f && !MEUBLES.parForme.has(f)) MEUBLES.parForme.set(f, P.i);
  MEUBLES.stats.etiquetes++;
  return P;
}

// LE PARCOURS d'un sous-arbre avant sa couture : les étiquetés, et la signature de chaque maillage non étiqueté
function parcourir(o, racine, parties) {
  const E = etiquette(o);
  if (E && !_vus.has(o)) {
    _vus.add(o);
    if (E.partie) { let L = parties.get(E.partie); if (!L) parties.set(E.partie, L = { E, racines: [] }); L.racines.push(o); return; }
    if (o === racine) { _references.push(o); MEUBLES.stats.references++; return; }
    noter([o], E, true);
    return;
  }
  if (E) return;
  if (o.isMesh && !_maillesVues.has(o) && o.geometry && !(o.userData && (o.userData.dynamique || o.userData.suite))) {
    _maillesVues.add(o);
    const n = nSommets(o.geometry);
    if (n >= 8 && n <= 40000) {
      const mat = Array.isArray(o.material) ? o.material[0] : o.material;
      if (!o.geometry.boundingBox) MEUBLES.stats.sommets += n;
      const cle = cleMaillage(o);
      _p.setFromMatrixPosition(o.matrixWorld);
      _libres.push({ cle, x: _p.x, y: _p.y, z: _p.z, nomMat: (mat && mat.name) || '' });
      MEUBLES.stats.libres++;
    }
  }
  for (const c of o.children) parcourir(c, racine, parties);
}

// AVANT CHAQUE COUTURE (racine comprise) : fusionnerLocal et optimiserDecor l'appellent en première ligne
export function fermerRegistre(racine) {
  if (!racine || !racine.traverse) return;
  MEUBLES.stats.coutures++;
  racine.updateWorldMatrix(true, true);
  const parties = new Map();
  parcourir(racine, racine, parties);
  for (const [, L] of parties) { noter(L.racines, L.E); MEUBLES.stats.parties++; }
}

// À LA PRÉPARATION d'une partie : les références gardées (meubles cousus seuls), les étiquetés qu'aucune couture n'a vus
// (groupes `nofuse`) ; les poses recalées si leur racine a bougé depuis (un groupe de niveau décalé après sa couture) ; les
// maillages oubliés comparés aux prototypes
export function rattraperRegistre(scene) {
  for (const o of _references.splice(0)) { const E = etiquette(o); if (E) { noter([o], E); MEUBLES.stats.rattrapes++; } }
  if (scene && scene.traverse) {
    const L = [];
    scene.traverse((o) => { if (o.userData && o.userData.meuble && !_vus.has(o) && !o.userData.dynamique) L.push(o); });
    for (const o of L) { _vus.add(o); const E = etiquette(o); if (E && !E.partie) { noter([o], E); MEUBLES.stats.rattrapes++; } }
  }
  // (les racines restées dans la scène : leur pose relue sur la matrice d'aujourd'hui)
  for (const { objet, P } of _instances) {
    if (!objet.parent) continue;
    objet.updateWorldMatrix(true, false);
    const T = MEUBLES.types.get(P.cle), M = objet.matrixWorld, cap = capDe(M);
    M.decompose(_p, _q, _s);
    if (Math.abs(_p.x - P.x) > 1e-3 || Math.abs(_p.z - P.z) > 1e-3 || Math.abs(_p.y + T.dy - P.y0) > 1e-3 || Math.abs(ang(cap - P.cap)) > 1e-3) {
      P.x = _p.x; P.z = _p.z; P.y0 = _p.y + T.dy; P.y1 = P.y0 + T.taille.y; P.cap = cap; P.c = Math.cos(-cap); P.s = Math.sin(-cap);
      centrer(P, T); MEUBLES.stats.recales++;
    }
  }
  // LES OUBLIÉS : un maillage non étiqueté qui a la signature de la plus grosse pièce d'un prototype ; ou, pour les
  // extincteurs, un matériau qui le dit (ils n'ont pas tous la même géométrie : celui de l'ascenseur, de L-M)
  const parCle = new Map();
  for (const [, T] of MEUBLES.types) if (T.cleMaillage) parCle.set(T.cleMaillage, T);
  for (const L of _libres) {
    const T = parCle.get(L.cle);
    let type = T ? T.type : null;
    if (!type && /extincteur/i.test(L.nomMat)) type = 'extincteur';
    if (!type) continue;
    // (un même meuble oublié a plusieurs pièces : une entrée par meuble, à 0,6 m près)
    if (MEUBLES.nonEtiquetes.some((e) => e.type === type && Math.hypot(e.x - L.x, e.z - L.z) < 0.6 && Math.abs(e.y - L.y) < 1)) continue;
    MEUBLES.nonEtiquetes.push({ type, cle: T ? T.cle : null, zone: null, x: L.x, y: L.y, z: L.z, materiau: L.nomMat });
  }
  // LES TAILLES hors tolérance (± 10 % de la table de référence) : le type n'est plus déguisable
  MEUBLES.horsTolerance.length = 0;
  for (const [cle, T] of MEUBLES.types) {
    T.deguisable = T.deguisableBase; T.raison = T.raisonBase;
    const ref = TAILLES_REFERENCE[cle] || TAILLES_REFERENCE[T.type];
    if (!ref) continue;
    const t = [T.taille.x, T.taille.y, T.taille.z];
    if (t.some((v, k) => Math.abs(v - ref[k]) > 0.1 * ref[k])) {
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
