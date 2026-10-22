// PROTOTYPE JETABLE : l'ACCROUPI procédural, par-dessus n'importe quel clip (attente, marche, pas chassés).
// Même recette que les mains sur les genoux de js/couches.js (_mainsSurGenoux) : les pieds restent EXACTEMENT où le clip
// les met, le bassin descend et recule, le dos se penche, et la cinématique inverse replie les jambes sur ces pieds.
import * as THREE from 'three';
const _ch = { Left: new THREE.Vector3(), Right: new THREE.Vector3() }, _or = { Left: new THREE.Vector3(), Right: new THREE.Vector3() };
const _w = new THREE.Vector3(), _pole = new THREE.Vector3(), _C = new THREE.Quaternion(), _Ci = new THREE.Quaternion();
const _av = new THREE.Vector3(), _ha = new THREE.Vector3(), _ga = new THREE.Vector3();

// k : 0 debout -> 1 accroupi ; bas : descente du bassin (m) à k = 1
export function accroupir(p, k, bas = 0.42) {
  const A = p.avatar; if (!A || !(k > 0)) return;
  p.mesh.getWorldQuaternion(_C); _Ci.copy(_C).invert(); A.repere(_C, _Ci);
  _av.set(0, 0, 1).applyQuaternion(_C); _ha.set(0, 1, 0).applyQuaternion(_C); _ga.set(1, 0, 0).applyQuaternion(_C);
  for (const c of ['Left', 'Right']) { A.bone(c + 'Foot').getWorldPosition(_ch[c]); A.bone(c + 'ToeBase').getWorldPosition(_or[c]); }
  const h = A.bone('Hips');
  h.getWorldPosition(_w);
  _w.addScaledVector(_ha, -bas * k).addScaledVector(_av, -0.10 * k);
  h.parent.updateWorldMatrix(true, false);
  h.position.copy(h.parent.worldToLocal(_w));
  A.ajouter('Spine', 0.22 * k); A.ajouter('Spine1', 0.12 * k); A.ajouter('Neck', -0.2 * k); A.ajouter('Head', -0.14 * k);
  p.mesh.updateMatrixWorld(true);
  for (const c of ['Left', 'Right']) {
    const sg = c === 'Left' ? 1 : -1;
    A.bone(c + 'UpLeg').getWorldPosition(_pole);
    _pole.addScaledVector(_av, 0.9).addScaledVector(_ga, sg * 0.25);
    A.ikJambe(c, _ch[c], _or[c], _pole, 1);
  }
}
