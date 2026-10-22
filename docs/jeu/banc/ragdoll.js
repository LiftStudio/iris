// PROTOTYPE JETABLE : une « poupée de chiffon » simple (Verlet) posée sur le squelette Mixamo d'un Player d'IRIS.
// Des points aux articulations, des distances fixes entre eux (os), un buste RIGIDE (tous ses points liés deux à
// deux), le sol (et les murs, si l'on donne un monde solide), puis on ramène les os vers les points
// (AvatarRig.viserPoint). Aucune bibliothèque de physique.
import * as THREE from 'three';

const POINTS = ['Hips', 'Spine2', 'Head', 'LeftArm', 'LeftForeArm', 'LeftHand', 'RightArm', 'RightForeArm', 'RightHand',
  'LeftUpLeg', 'LeftLeg', 'LeftFoot', 'RightUpLeg', 'RightLeg', 'RightFoot', 'LeftToeBase', 'RightToeBase'];
const BUSTE = ['Hips', 'Spine2', 'LeftArm', 'RightArm', 'LeftUpLeg', 'RightUpLeg'];
const LIENS = [['Spine2', 'Head'], ['LeftArm', 'LeftForeArm'], ['LeftForeArm', 'LeftHand'], ['RightArm', 'RightForeArm'], ['RightForeArm', 'RightHand'],
  ['LeftUpLeg', 'LeftLeg'], ['LeftLeg', 'LeftFoot'], ['RightUpLeg', 'RightLeg'], ['RightLeg', 'RightFoot'], ['LeftFoot', 'LeftToeBase'], ['RightFoot', 'RightToeBase'],
  // raideurs : la tête ne traverse pas les épaules, le pied garde son angle, le genou et le coude ne se replient pas à plat
  ['LeftArm', 'Head'], ['RightArm', 'Head'], ['LeftLeg', 'LeftToeBase'], ['RightLeg', 'RightToeBase']];
// distances MINIMALES (part de la distance de départ) : le genou et le coude ne se replient pas à plat, et la HANCHE ne
// plie pas à 180° (sans les liens genou-poitrine et pied-poitrine, les jambes se rabattaient sur le buste : mesuré, pieds à
// 14 cm de la tête après une chute en arrière)
const PLIS = [['LeftUpLeg', 'LeftFoot', 0.55], ['RightUpLeg', 'RightFoot', 0.55], ['LeftArm', 'LeftHand', 0.35], ['RightArm', 'RightHand', 0.35],
  ['LeftLeg', 'Spine2', 0.85], ['RightLeg', 'Spine2', 0.85], ['LeftFoot', 'Spine2', 0.75], ['RightFoot', 'Spine2', 0.75],
  ['LeftLeg', 'RightLeg', 0.6], ['LeftFoot', 'RightFoot', 0.5]];
const RAYON = 0.06;

const _v = new THREE.Vector3(), _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3();
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion();

function repereBuste(P, out) {
  // x = droite -> gauche des hanches, y = bassin -> poitrine, z = devant
  _a.subVectors(P.LeftUpLeg.p, P.RightUpLeg.p).normalize();
  _b.subVectors(P.Spine2.p, P.Hips.p).normalize();
  _c.crossVectors(_a, _b).normalize();
  _a.crossVectors(_b, _c).normalize();
  return out.makeBasis(_a, _b, _c);
}

export class Poupee {
  // impulsion : vitesse donnée au point touché (m/s), point : nom du point touché
  constructor(p, impulsion = null, point = 'Spine2', solEn = null) {
    this.p = p; this.A = p.avatar; this.solEn = solEn; this.t = 0;
    const A = this.A, P = this.P = {};
    p.mesh.updateMatrixWorld(true);
    for (const n of POINTS) { const b = A.bone(n); if (!b) continue; const q = b.getWorldPosition(new THREE.Vector3()); P[n] = { p: q.clone(), o: q.clone() }; }
    // l'élan du personnage (sa vitesse au sol) : la position « d'avant » en est reculée
    const v = p.vel || _v.set(0, 0, 0);
    for (const n in P) P[n].o.addScaledVector(v, -1 / 60);
    if (impulsion && P[point]) {
      P[point].o.addScaledVector(impulsion, -1 / 60);
      for (const n of BUSTE) if (n !== point && P[n]) P[n].o.addScaledVector(impulsion, -0.5 / 60);   // le buste suit à moitié
    }
    // contraintes : distances de départ
    this.C = [];
    const lier = (a, b, min = 0) => { if (P[a] && P[b]) this.C.push([P[a], P[b], P[a].p.distanceTo(P[b].p), min]); };
    for (let i = 0; i < BUSTE.length; i++) for (let j = i + 1; j < BUSTE.length; j++) lier(BUSTE[i], BUSTE[j]);
    for (const [a, b] of LIENS) lier(a, b);
    this.plis = PLIS.filter(([a, b]) => P[a] && P[b]).map(([a, b, k]) => [P[a], P[b], P[a].p.distanceTo(P[b].p) * k]);
    // la pose de départ de l'os des hanches, et le repère du buste à cet instant
    this.qHanches0 = A.bone('Hips').getWorldQuaternion(new THREE.Quaternion());
    this.M0inv = repereBuste(P, new THREE.Matrix4()).invert();
  }

  // un pas de simulation (dt fixe conseillé : 1/60 ou 1/120)
  pas(dt) {
    this.t += dt;
    const P = this.P, g = -9.81 * dt * dt, amort = 0.985;
    for (const n in P) {
      const q = P[n], x = q.p.x, y = q.p.y, z = q.p.z;
      q.p.x += (x - q.o.x) * amort; q.p.y += (y - q.o.y) * amort + g; q.p.z += (z - q.o.z) * amort;
      q.o.set(x, y, z);
    }
    for (let it = 0; it < 8; it++) {
      for (const [a, b, L] of this.C) {
        _v.subVectors(b.p, a.p); const d = _v.length() || 1e-6, k = (d - L) / d * 0.5;
        a.p.addScaledVector(_v, k); b.p.addScaledVector(_v, -k);
      }
      for (const [a, b, Lmin] of this.plis) {          // pas de repli complet du genou ou du coude
        _v.subVectors(b.p, a.p); const d = _v.length() || 1e-6;
        if (d < Lmin) { const k = (d - Lmin) / d * 0.5; a.p.addScaledVector(_v, k); b.p.addScaledVector(_v, -k); }
      }
      // le sol (et son frottement : un point posé perd sa vitesse horizontale)
      for (const n in P) {
        const q = P[n], s = (this.solEn ? this.solEn(q.p.x, q.p.z, q.p.y) : 0) + RAYON;
        if (q.p.y < s) { q.p.y = s; q.o.x += (q.p.x - q.o.x) * 0.35; q.o.z += (q.p.z - q.o.z) * 0.35; if (q.o.y < s) q.o.y = q.p.y + (q.p.y - q.o.y) * 0.2; }
      }
    }
  }

  // ramène le squelette sur les points (une fois par image)
  poser() {
    const A = this.A, P = this.P, h = A.bone('Hips');
    // 1) les hanches : position et orientation (rotation du repère du buste depuis la mort)
    h.parent.updateWorldMatrix(true, false);
    h.position.copy(h.parent.worldToLocal(_v.copy(P.Hips.p)));
    repereBuste(P, _m).multiply(this.M0inv);
    _q.setFromRotationMatrix(_m).multiply(this.qHanches0);
    h.parent.getWorldQuaternion(_q2).invert();
    h.quaternion.copy(_q2.multiply(_q));
    h.updateMatrixWorld(true);
    // 2) le cou vers la tête, puis les membres, os par os de la racine vers les extrémités
    A.viserPoint('Neck', 'Head', P.Head.p);
    for (const c of ['Left', 'Right']) {
      A.viserPoint(c + 'Arm', c + 'ForeArm', P[c + 'ForeArm'].p);
      A.viserPoint(c + 'ForeArm', c + 'Hand', P[c + 'Hand'].p);
      A.viserPoint(c + 'UpLeg', c + 'Leg', P[c + 'Leg'].p);
      A.viserPoint(c + 'Leg', c + 'Foot', P[c + 'Foot'].p);
      if (P[c + 'ToeBase']) A.viserPoint(c + 'Foot', c + 'ToeBase', P[c + 'ToeBase'].p);
    }
  }
  get auRepos() {
    let v = 0; for (const n in this.P) v = Math.max(v, this.P[n].p.distanceToSquared(this.P[n].o));
    return v < 1e-7;
  }
}
