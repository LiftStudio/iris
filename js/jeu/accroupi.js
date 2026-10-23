// =====================================================================
//  L'ACCROUPI POSÉ (lot L-C, 23/10 ; spec §§ 3.1, 4.5.10 — squelette du socle S0 ; banc/accroupi.js recopié et taillé)
// =====================================================================
// Le corps accroupi de `k` (0..1, simulé par js/jeu/mouvement.js : 0,16 s pour descendre, 0,18 s pour se relever), par-
// dessus N'IMPORTE QUEL clip (attente, marche, pas chassés : la marche accroupie) — la recette des mains sur les genoux
// de js/couches.js : les pieds restent EXACTEMENT où le clip les met, le bassin descend de `bas` (0,42 m, À LA VERTICALE :
// le roulis du groupe n'y entre pas) et recule de 16 cm, le dos se penche (Spine 0,32, Spine1 0,18 rad : la garde basse
// d'un tireur ; relecture du 23/10, au lieu de 6 cm et 0,20 / 0,10, qui laissaient la tête 9 cm au-dessus de la tête
// simulée), le cou et la tête se relèvent (le regard reste devant), et la cinématique inverse replie les jambes sur ces
// pieds, les genoux devant et un peu dehors. Mesuré au banc : hanches 0,49-0,55 m, tête 1,07-1,16 m, orteils au sol. La
// tête est ensuite amenée où la simulation la compte (centrerTete, plus bas, appelée par js/jeu/pose_arme.js). Affichage
// seulement, une fois par image (Player.apresPose, entre deux relevés de la pose : js/player.js _apresDebut — `ajouter` est
// relatif).
import * as THREE from 'three';

export const ACCROUPI = { recul: 0.16, dos: [0.32, 0.18], cou: -0.25, tete: -0.15, genoux: { devant: 0.9, dehors: 0.25 } };
const _ch = { Left: new THREE.Vector3(), Right: new THREE.Vector3() }, _or = { Left: new THREE.Vector3(), Right: new THREE.Vector3() };
const _w = new THREE.Vector3(), _pole = new THREE.Vector3(), _C = new THREE.Quaternion(), _Ci = new THREE.Quaternion();
const _av = new THREE.Vector3(), _ga = new THREE.Vector3(), _t = new THREE.Vector3(), _y = new THREE.Vector3();

// k : 0 debout → 1 accroupi ; bas : la descente du bassin (m) à k = 1
export function accroupir(player, k, bas = 0.42) {
  const p = player, A = p && p.avatar;
  if (!A || !A.ok || !(k > 1e-4) || !A.aJambe('Left') || !A.aJambe('Right')) return;
  // (k suit la courbe de la simulation, celle de l'œil et des boîtes de touche : pas de lissage de plus ici)
  const e = Math.min(1, k);
  reperePieds(p, A);
  const h = A.bone('Hips');
  h.getWorldPosition(_w);
  _w.y -= bas * e; _w.addScaledVector(_av, -ACCROUPI.recul * e);
  h.parent.updateWorldMatrix(true, false);
  h.position.copy(h.parent.worldToLocal(_w));
  A.ajouter('Spine', ACCROUPI.dos[0] * e); A.ajouter('Spine1', ACCROUPI.dos[1] * e);
  A.ajouter('Neck', ACCROUPI.cou * e); A.ajouter('Head', ACCROUPI.tete * e);
  h.updateMatrixWorld(true);
  replanter(A);
}
// les pieds et les orteils relevés en monde (là où le clip les a mis), l'avant et la gauche du corps à plat
function reperePieds(p, A) {
  p.mesh.getWorldQuaternion(_C); _Ci.copy(_C).invert(); A.repere(_C, _Ci);
  _av.set(0, 0, 1).applyQuaternion(_C); _av.y = 0; if (_av.lengthSq() < 1e-8) _av.set(0, 0, 1); _av.normalize();
  _ga.set(_av.z, 0, -_av.x);
  for (const c of ['Left', 'Right']) { A.bone(c + 'Foot').getWorldPosition(_ch[c]); A.bone(c + 'ToeBase').getWorldPosition(_or[c]); }
}
// les jambes repliées sur ces pieds (le bassin vient de bouger), genoux devant et un peu dehors
function replanter(A) {
  for (const c of ['Left', 'Right']) {
    const sg = c === 'Left' ? 1 : -1;
    A.bone(c + 'UpLeg').getWorldPosition(_pole);
    _pole.addScaledVector(_av, ACCROUPI.genoux.devant).addScaledVector(_ga, sg * ACCROUPI.genoux.dehors);
    A.ikJambe(c, _ch[c], _or[c], _pole, 1);
  }
}

// LA TÊTE OÙ LA SIMULATION LA COMPTE (relecture, 23/10). Les balles touchent un acteur là où la SIMULATION compte sa tête :
// au-dessus du centre de ses pieds, à (1,635 − 0,54·k) × h/1,73 du sol (js/jeu/touches.js). Accroupi, le dos penché PUIS
// tourné de trois quarts par l'arme (js/jeu/pose_arme.js : un dos penché qu'on tourne emporte la tête de côté) mettait la
// tête affichée à 13,7 cm de la tête simulée — 9 cm plus haut, 7 devant, 8 de côté, mesuré le 23/10 : une balle visée au
// milieu de la tête VUE passait à côté de la sphère de 11,5 cm. Appelée par poserArme, le buste tourné et avant l'arme :
//   1. LA HAUTEUR : le dos penché un peu plus (ou un peu moins) jusqu'à la hauteur simulée — l'angle qui y mène, mesuré
//      des hanches à la tête, en deux passes (les pivots des os ne sont pas aux hanches) ; le cou et la tête rendent cet
//      angle (le regard reste devant). Les proportions des six amis diffèrent : une table seule laissait 1 à 6 cm ;
//   2. L'APLOMB : le bassin glisse à l'HORIZONTALE de l'écart (× k), les pieds gardés (les jambes repliées dessus), le haut
//      du corps le suit.
export function centrerTete(player, k) {
  const p = player, A = p && p.avatar;
  if (!A || !A.ok || !(k > 1e-3) || !A.aJambe('Left') || !A.aJambe('Right')) return;
  const T = A.bone('Head'), h = A.bone('Hips'), e = Math.min(1, k);
  const sol = Number.isFinite(p.solAff) ? p.solAff : p.pos.y, cy = sol + (p.jumpY || 0) + (1.635 - 0.54 * e) * p.h / 1.73;
  reperePieds(p, A);
  for (let it = 0; it < 2; it++) {
    tete(p, T, _w); h.getWorldPosition(_t);
    const vf = (_w.x - _t.x) * _av.x + (_w.z - _t.z) * _av.z, vy = _w.y - _t.y, dy = _w.y - cy, L = Math.hypot(vf, vy);
    if (!(Math.abs(dy) > 0.004) || !(L > 0.2)) break;          // (à sa hauteur, ou une mesure NaN : on n'écrit rien)
    const a0 = Math.atan2(vf, vy), a1 = Math.acos(Math.max(-1, Math.min(1, (vy - dy) / L))) * (a0 < 0 ? -1 : 1);
    const d = Math.max(-0.25, Math.min(0.35, a1 - a0));
    A.ajouter('Spine', d * 0.6); A.ajouter('Spine1', d * 0.4); A.ajouter('Neck', -d * 0.5); A.ajouter('Head', -d * 0.5);
    h.updateMatrixWorld(true);
  }
  tete(p, T, _w);
  const O = p.mesh.position, dx = (O.x - _w.x) * e, dz = (O.z - _w.z) * e;
  if (!(dx * dx + dz * dz > 1e-6)) return;                   // (d'aplomb, ou une mesure NaN : on n'écrit rien)
  h.getWorldPosition(_w); _w.x += dx; _w.z += dz;
  h.parent.updateWorldMatrix(true, false);
  h.position.copy(h.parent.worldToLocal(_w));
  h.updateMatrixWorld(true);
  replanter(A);
}
// le milieu de la tête affichée : l'os Head + 8,5 cm × h/1,8 sur son axe (la mesure des boîtes de touche, banc/touches.js)
function tete(p, T, out) {
  T.getWorldPosition(out); _y.setFromMatrixColumn(T.matrixWorld, 1).normalize();
  return out.addScaledVector(_y, 0.085 * p.h / 1.8);
}
