// =====================================================================
//  L'ACCROUPI POSÉ (lot L-C, 23/10 ; spec §§ 3.1, 4.5.10 — squelette du socle S0 ; banc/accroupi.js recopié et taillé)
// =====================================================================
// Le corps accroupi de `k` (0..1, simulé par js/jeu/mouvement.js : 0,16 s pour descendre, 0,18 s pour se relever), par-
// dessus N'IMPORTE QUEL clip (attente, marche, pas chassés : la marche accroupie) — la recette des mains sur les genoux
// de js/couches.js : les pieds restent EXACTEMENT où le clip les met, le bassin descend de `bas` (0,42 m, À LA VERTICALE :
// le roulis du groupe n'y entre pas) et recule de 6 cm, le dos se penche (Spine 0,20, Spine1 0,10 rad), le cou et la tête
// se relèvent (le regard reste devant), et la cinématique inverse replie les jambes sur ces pieds, les genoux devant et un
// peu dehors. Mesuré au banc : hanches 0,49-0,55 m, tête 1,07-1,16 m, orteils au sol. Affichage seulement, une fois par
// image (Player.apresPose, entre deux relevés de la pose : js/player.js _apresDebut — `ajouter` est relatif).
import * as THREE from 'three';

export const ACCROUPI = { recul: 0.06, dos: [0.20, 0.10], cou: -0.18, tete: -0.12, genoux: { devant: 0.9, dehors: 0.25 } };
const _ch = { Left: new THREE.Vector3(), Right: new THREE.Vector3() }, _or = { Left: new THREE.Vector3(), Right: new THREE.Vector3() };
const _w = new THREE.Vector3(), _pole = new THREE.Vector3(), _C = new THREE.Quaternion(), _Ci = new THREE.Quaternion();
const _av = new THREE.Vector3(), _ga = new THREE.Vector3();

// k : 0 debout → 1 accroupi ; bas : la descente du bassin (m) à k = 1
export function accroupir(player, k, bas = 0.42) {
  const p = player, A = p && p.avatar;
  if (!A || !A.ok || !(k > 1e-4) || !A.aJambe('Left') || !A.aJambe('Right')) return;
  // (k suit la courbe de la simulation, celle de l'œil et des boîtes de touche : pas de lissage de plus ici)
  const e = Math.min(1, k);
  p.mesh.getWorldQuaternion(_C); _Ci.copy(_C).invert(); A.repere(_C, _Ci);
  // l'avant et la gauche du corps, à plat
  _av.set(0, 0, 1).applyQuaternion(_C); _av.y = 0; if (_av.lengthSq() < 1e-8) _av.set(0, 0, 1); _av.normalize();
  _ga.set(_av.z, 0, -_av.x);
  for (const c of ['Left', 'Right']) { A.bone(c + 'Foot').getWorldPosition(_ch[c]); A.bone(c + 'ToeBase').getWorldPosition(_or[c]); }
  const h = A.bone('Hips');
  h.getWorldPosition(_w);
  _w.y -= bas * e; _w.addScaledVector(_av, -ACCROUPI.recul * e);
  h.parent.updateWorldMatrix(true, false);
  h.position.copy(h.parent.worldToLocal(_w));
  A.ajouter('Spine', ACCROUPI.dos[0] * e); A.ajouter('Spine1', ACCROUPI.dos[1] * e);
  A.ajouter('Neck', ACCROUPI.cou * e); A.ajouter('Head', ACCROUPI.tete * e);
  h.updateMatrixWorld(true);
  for (const c of ['Left', 'Right']) {
    const sg = c === 'Left' ? 1 : -1;
    A.bone(c + 'UpLeg').getWorldPosition(_pole);
    _pole.addScaledVector(_av, ACCROUPI.genoux.devant).addScaledVector(_ga, sg * ACCROUPI.genoux.dehors);
    A.ikJambe(c, _ch[c], _or[c], _pole, 1);
  }
}
