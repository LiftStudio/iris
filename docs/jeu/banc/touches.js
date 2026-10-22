// PROTOTYPE JETABLE : boîtes de touche (capsules) qui suivent les os d'un Player d'IRIS.
// Rayons en MÈTRES pour un modèle de 1,80 m (multipliés par p.h / 1,8). Mesures prises sur les 17 avatars (pose de liaison) :
// crâne de Head - 0,05 à Head + 0,21 (unités du modèle), ± 0,12 en profondeur, ± 0,095 en largeur.
import * as THREE from 'three';

// zone, os de départ, os d'arrivée (ou null : sphère), rayon, décalage de la sphère le long du Y de l'os (m)
export const ZONES = [
  { z: 'tete',   a: 'Head',         b: null,          r: 0.115, dy: 0.085 },
  { z: 'cou',    a: 'Neck',         b: 'Head',        r: 0.06 },
  { z: 'torse',  a: 'Spine1',       b: 'Neck',        r: 0.165 },
  { z: 'ventre', a: 'Hips',         b: 'Spine1',      r: 0.155 },
  { z: 'bras',   a: 'LeftArm',      b: 'LeftForeArm', r: 0.055 },
  { z: 'bras',   a: 'RightArm',     b: 'RightForeArm', r: 0.055 },
  { z: 'bras',   a: 'LeftForeArm',  b: 'LeftHand',    r: 0.045 },
  { z: 'bras',   a: 'RightForeArm', b: 'RightHand',   r: 0.045 },
  { z: 'jambe',  a: 'LeftUpLeg',    b: 'LeftLeg',     r: 0.085 },
  { z: 'jambe',  a: 'RightUpLeg',   b: 'RightLeg',    r: 0.085 },
  { z: 'jambe',  a: 'LeftLeg',      b: 'LeftFoot',    r: 0.06 },
  { z: 'jambe',  a: 'RightLeg',     b: 'RightFoot',   r: 0.06 },
];
export const DEGATS = { tete: 2.5, cou: 1.6, torse: 1.0, ventre: 1.0, bras: 0.75, jambe: 0.7 };

const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _y = new THREE.Vector3();
// le point le plus proche entre le rayon (o, d, [0, L]) et le segment [a, b] : distance², t le long du rayon
function rayonSegment(o, d, L, a, b) {
  const ux = b.x - a.x, uy = b.y - a.y, uz = b.z - a.z;
  const wx = o.x - a.x, wy = o.y - a.y, wz = o.z - a.z;
  const A = d.x * d.x + d.y * d.y + d.z * d.z, Bq = d.x * ux + d.y * uy + d.z * uz, C = ux * ux + uy * uy + uz * uz;
  const D = d.x * wx + d.y * wy + d.z * wz, E = ux * wx + uy * wy + uz * wz;
  const den = A * C - Bq * Bq;
  let s = den > 1e-9 ? (Bq * E - C * D) / den : 0, t;
  s = Math.max(0, Math.min(L, s));
  t = C > 1e-9 ? Math.max(0, Math.min(1, (E + s * Bq) / C)) : 0;
  s = Math.max(0, Math.min(L, (t * Bq - D) / A));
  const px = o.x + d.x * s - (a.x + ux * t), py = o.y + d.y * s - (a.y + uy * t), pz = o.z + d.z * s - (a.z + uz * t);
  return { d2: px * px + py * py + pz * pz, s };
}

// Lance un rayon (o, d normalisé, portée L) sur un joueur : la PREMIÈRE zone touchée, ou null.
// Préfiltre : un cylindre de 1,1 m de rayon autour du joueur (0,03 ms de gagné par joueur raté).
export function toucher(p, o, d, L = 200) {
  const B = p.avatar && p.avatar.bones; if (!B) return null;
  const k = p.h / 1.8;
  // préfiltre grossier : distance du rayon à l'axe vertical du joueur
  const c = p.mesh.position;
  _a.set(c.x, c.y + 0.9 * k, c.z);
  const sc = Math.max(0, Math.min(L, (_a.x - o.x) * d.x + (_a.y - o.y) * d.y + (_a.z - o.z) * d.z));
  const qx = o.x + d.x * sc - _a.x, qy = o.y + d.y * sc - _a.y, qz = o.z + d.z * sc - _a.z;
  if (qx * qx + qy * qy + qz * qz > 1.21 * k * k) return null;
  let best = null;
  for (const Z of ZONES) {
    const ba = B[Z.a]; if (!ba) continue;
    _a.setFromMatrixPosition(ba.matrixWorld);
    if (Z.b) _b.setFromMatrixPosition(B[Z.b].matrixWorld);
    else { _y.setFromMatrixColumn(ba.matrixWorld, 1).normalize(); _a.addScaledVector(_y, Z.dy * k); _b.copy(_a); }
    const r = Z.r * k, m = rayonSegment(o, d, L, _a, _b);
    if (m.d2 > r * r) continue;
    const s = m.s - Math.sqrt(Math.max(0, r * r - m.d2));         // entrée approchée dans la capsule
    if (!best || s < best.t) best = { zone: Z.z, t: s, mult: DEGATS[Z.z] };
  }
  return best;
}

// Dessin de contrôle (fil de fer) : rendu de chaque capsule, à mettre à jour après presenter()
export function dessiner(p, scene, groupe) {
  const B = p.avatar.bones, k = p.h / 1.8;
  if (!groupe) {
    groupe = new THREE.Group(); scene.add(groupe);
    const mat = new THREE.MeshBasicMaterial({ color: 0x00ff88, wireframe: true });
    for (const Z of ZONES) {
      const L0 = Z.b ? B[Z.a].getWorldPosition(new THREE.Vector3()).distanceTo(B[Z.b].getWorldPosition(new THREE.Vector3())) : 0;
      const m = new THREE.Mesh(new THREE.CapsuleGeometry(Z.r * k, L0, 4, 8), mat); m.userData.Z = Z; groupe.add(m);
    }
  }
  for (const m of groupe.children) {
    const Z = m.userData.Z, ba = B[Z.a];
    _a.setFromMatrixPosition(ba.matrixWorld);
    if (Z.b) _b.setFromMatrixPosition(B[Z.b].matrixWorld);
    else { _y.setFromMatrixColumn(ba.matrixWorld, 1).normalize(); _a.addScaledVector(_y, Z.dy * k); _b.copy(_a); }
    const L = _a.distanceTo(_b);
    m.position.addVectors(_a, _b).multiplyScalar(0.5);
    if (L > 1e-4) m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), _b.clone().sub(_a).normalize());
  }
  return groupe;
}
