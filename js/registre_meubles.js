// =====================================================================
//  LE REGISTRE DES MEUBLES (prop hunt) — squelette du socle S0 (22/10), rempli par le lot L-K
// =====================================================================
// Les déguisements du prop hunt sont les VRAIS meubles de l'école (spec § 4.5.13, arbitrages 21 et 36). La carte les
// étiquette (`objet.userData.meuble = 'type' | { type, nom, formes?, variante?, mural?, surPlace?, deguisable?, voile? }` :
// L-K hors du -1, le lot R au -1) ; ce registre les COPIE avant que la couture du décor ne les fonde dans des blocs
// (js/kit_decor.js optimiserDecor, js/ecole_portes.js fusionnerLocal : ses deux appelants, prises du socle). Il ne touche à
// rien d'autre : sur a8b22dd aucun meuble n'est étiqueté, il ne fait donc rien (et ne coûte qu'un parcours du sous-arbre).
//   T (un type) = { cle, type, variante, nom, proto, boite, taille, rayon, haut, volume, pv, vitesse, mural, surPlace, deguisable }
//   P (une pose) = { i, cle, x, y, z, cap, zone, cx, cz, hx, hz, y0, y1, c, s }   (boîte orientée MONDE)
// (Le squelette pose ce qu'il faut pour que le reste tourne ; L-K y met les variantes par signature, DEGUISABLE_PAR_TYPE,
// les maillages non étiquetés, `parForme`, la grille.)
import * as THREE from 'three';

// (`nonEtiquetes` : les maillages à la géométrie d'un prototype qu'aucune étiquette ne couvre, [{ type, zone, x, y, z }] ;
// `horsTolerance` : les types dont la taille sort de la table de carte_props § 2 — L-K les remplit, js/jeu/harnais.js
// verifierMeubles les rend)
export const MEUBLES = { types: new Map(), poses: [], parZone: new Map(), grille: new Map(), parForme: new Map(), nonEtiquetes: [], horsTolerance: [] };
// les types non déguisables d'office (comptoir, table longue… : L-K remplit) ; et tout disque de plus de 0,5 m
export const DEGUISABLE_PAR_TYPE = {};

const _vus = new WeakSet();          // chaque étiqueté n'est vu qu'une fois
const _references = [];              // les meubles cousus SEULS (racine de leur couture) : copiés plus tard, déjà cousus
const _b = new THREE.Box3(), _v = new THREE.Vector3(), _q = new THREE.Quaternion(), _e = new THREE.Euler();

const etiquette = (o) => {
  const m = o && o.userData && o.userData.meuble;
  if (!m) return null;
  return typeof m === 'string' ? { type: m } : m;
};

// LA COPIE d'un meuble : un type (prototype partagé, cloné au premier exemplaire de son type — avant la couture quand
// fermerRegistre l'appelle) et une pose (où il est, sa boîte orientée en monde)
function noter(o) {
  const E = etiquette(o); if (!E) return null;
  o.updateMatrixWorld(true);
  const cle = E.type + (E.variante ? ':' + E.variante : '');
  let T = MEUBLES.types.get(cle);
  if (!T) {
    const proto = o.clone(true);
    proto.position.set(0, 0, 0); proto.rotation.set(0, 0, 0); proto.scale.copy(o.getWorldScale(_v));
    proto.updateMatrixWorld(true);
    const boite = new THREE.Box3().setFromObject(proto, true);
    const taille = boite.getSize(new THREE.Vector3());
    const volume = Math.max(1e-4, taille.x * taille.y * taille.z);
    T = { cle, type: E.type, variante: E.variante || null, nom: E.nom || E.type, proto, boite, taille,
      rayon: Math.min(0.5, Math.max(0.15, Math.max(taille.x, taille.z) / 2 * 0.9)), haut: taille.y, volume,
      pv: Math.round(Math.min(145, Math.max(60, 40 + 90 * Math.cbrt(volume)))),
      vitesse: 4.6 * Math.min(1.05, Math.max(0.72, 1.15 - 0.35 * Math.cbrt(volume))),
      mural: !!E.mural, surPlace: !!E.surPlace, voile: E.voile !== false,
      deguisable: E.deguisable !== undefined ? !!E.deguisable : DEGUISABLE_PAR_TYPE[E.type] !== false && Math.max(taille.x, taille.z) <= 1.0 };
    MEUBLES.types.set(cle, T);
  }
  // la pose : boîte orientée MONDE (lue sur matrixWorld)
  _b.setFromObject(o, true);
  o.matrixWorld.decompose(_v, _q, new THREE.Vector3());
  _e.setFromQuaternion(_q, 'YXZ');
  const cap = _e.y, c = Math.cos(-cap), s = Math.sin(-cap);
  const P = { i: MEUBLES.poses.length, cle, x: _v.x, y: _b.min.y, z: _v.z, cap, zone: null,
    cx: (_b.min.x + _b.max.x) / 2, cz: (_b.min.z + _b.max.z) / 2, hx: T.taille.x / 2, hz: T.taille.z / 2, y0: _b.min.y, y1: _b.max.y, c, s };
  MEUBLES.poses.push(P);
  for (const f of E.formes || []) MEUBLES.parForme.set(f, P.i);
  return P;
}

// AVANT CHAQUE COUTURE (racine comprise) : un étiqueté pris dans un bloc est copié TOUT DE SUITE ; un étiqueté qui est la
// racine même de la couture (cousu seul dans son repère, cas du lot R) garde un objet à lui : on garde la RÉFÉRENCE.
export function fermerRegistre(racine) {
  if (!racine || !racine.traverse) return;
  racine.traverse((o) => {
    if (!o.userData || !o.userData.meuble || _vus.has(o)) return;
    _vus.add(o);
    if (o === racine) _references.push(o);
    else noter(o);
  });
}

// À LA PRÉPARATION d'une partie : les références gardées, et les étiquetés qu'aucune couture n'a vus (groupes `nofuse`)
export function rattraperRegistre(scene) {
  for (const o of _references.splice(0)) noter(o);
  if (scene && scene.traverse) scene.traverse((o) => { if (o.userData && o.userData.meuble && !_vus.has(o)) { _vus.add(o); noter(o); } });
  return MEUBLES;
}

// LES ZONES : chaque pose dans sa pièce (lumieres.zoneEn), rangée par zone et dans une grille de 2 m
export function zonerRegistre(lumieres) {
  MEUBLES.parZone.clear(); MEUBLES.grille.clear();
  for (const P of MEUBLES.poses) {
    const Z = lumieres && lumieres.zoneEn ? lumieres.zoneEn(P.x, P.z, P.y + 0.1) : null;
    P.zone = Z ? Z.id : null;
    if (!MEUBLES.parZone.has(P.zone)) MEUBLES.parZone.set(P.zone, []);
    MEUBLES.parZone.get(P.zone).push(P);
    const k = Math.floor(P.x / 2) + ':' + Math.floor(P.z / 2);
    if (!MEUBLES.grille.has(k)) MEUBLES.grille.set(k, []);
    MEUBLES.grille.get(k).push(P);
  }
  return MEUBLES;
}

// UNE COPIE d'un type, prête à poser (racine de scène, dynamique : hors des photos du décor)
export function copieMeuble(cle) {
  const T = MEUBLES.types.get(cle);
  if (!T) return null;
  const g = T.proto.clone(true);
  g.userData = { ...g.userData, meuble: cle, dynamique: true };
  return g;
}
