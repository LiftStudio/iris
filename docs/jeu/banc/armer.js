// PROTOTYPE JETABLE (banc de mesure) : la pose d'arme procédurale sur un Player d'IRIS, sans clip d'arme.
// À appeler APRÈS presenter() (comme _placerTel) : tout est absolu (IK vers des points du monde), rien ne s'empile.
import * as THREE from 'three';

const _C = new THREE.Quaternion(), _Ci = new THREE.Quaternion(), _d = new THREE.Vector3(), _c = new THREE.Vector3();
const _f = new THREE.Vector3(), _u = new THREE.Vector3(), _r = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0);
const _ep = new THREE.Vector3(), _crosse = new THREE.Vector3(), _poig = new THREE.Vector3(), _garde = new THREE.Vector3();
const _fd = new THREE.Vector3(), _nd = new THREE.Vector3(), _pole = new THREE.Vector3(), _m = new THREE.Matrix4();

// Un fusil en boîtes (unités : mètres), origine = la crosse contre l'épaule, +Z = le canon, +Y = le dessus.
export function fusil() {
  const g = new THREE.Group(), noir = new THREE.MeshStandardMaterial({ color: 0x1d1f22, roughness: 0.55, metalness: 0.4 });
  const boite = (w, h, l, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), noir); m.position.set(x, y, z); m.castShadow = true; g.add(m); return m; };
  boite(0.045, 0.11, 0.24, 0, -0.01, 0.12);      // crosse
  boite(0.05, 0.075, 0.36, 0, 0.0, 0.42);        // carcasse
  boite(0.03, 0.03, 0.30, 0, 0.015, 0.75);       // canon
  boite(0.035, 0.11, 0.045, 0, -0.085, 0.30);    // poignée pistolet
  boite(0.035, 0.13, 0.06, 0, -0.10, 0.42);      // chargeur
  boite(0.045, 0.05, 0.18, 0, -0.04, 0.58);      // garde-main
  boite(0.025, 0.035, 0.08, 0, 0.055, 0.40);     // viseur
  const bouche = new THREE.Object3D(); bouche.position.set(0, 0.015, 0.92); g.add(bouche);
  g.userData.bouche = bouche;
  // les prises, dans le repère de l'arme
  g.userData.poignee = new THREE.Vector3(0, -0.06, 0.30);
  g.userData.garde = new THREE.Vector3(0, -0.06, 0.58);
  return g;
}

// k : poids de la pose (0..1). epaule : la crosse part de l'épaule DROITE (os RightArm), un peu vers le milieu.
// Rend l'angle de visée réellement atteint (rad) entre l'axe du canon et la cible.
export function viser(p, arme, cible, k = 1, opt = {}) {
  const A = p.avatar; if (!A || !A.ok) return null;
  const hs = p.h / 1.8;
  // 1) LE BUSTE SUIT LA CIBLE : lacet et tangage répartis sur Spine/Spine1/Spine2 (comme le regard de couches.js)
  p.mesh.getWorldQuaternion(_C); _Ci.copy(_C).invert(); A.repere(_C, _Ci);
  A.bone('Spine2').getWorldPosition(_c);
  _d.subVectors(cible, _c).applyQuaternion(_Ci);
  const lacet = Math.max(-1.1, Math.min(1.1, Math.atan2(_d.x, _d.z)));
  const tangage = Math.max(-1.0, Math.min(1.0, Math.atan2(_d.y, Math.hypot(_d.x, _d.z))));
  const rep = opt.rep || [0.2, 0.35, 0.45];
  ['Spine', 'Spine1', 'Spine2'].forEach((n, i) => A.ajouter(n, -tangage * rep[i] * k, lacet * rep[i] * k, 0));
  A.ajouter('Neck', 0, 0, 0); A.ajouter('Head', 0.05 * k, 0, 0);       // (la tête suit le buste : le regard est dans l'axe)
  p.mesh.updateMatrixWorld(true);
  // 2) LE REPÈRE DE L'ARME : de l'épaule droite vers la cible
  A.bone('RightArm').getWorldPosition(_ep);
  A.bone('Spine2').getWorldPosition(_c);
  _crosse.copy(_ep).lerp(_c, 0.28);                                   // le creux de l'épaule
  _f.subVectors(cible, _crosse).normalize();
  _r.crossVectors(_f, _up).normalize();                               // la droite du tireur
  _u.crossVectors(_r, _f).normalize();
  _crosse.addScaledVector(_u, -0.02 * hs);
  _m.makeBasis(_r.clone().negate(), _u, _f);                           // x = gauche, y = dessus, z = canon
  arme.position.copy(_crosse); arme.quaternion.setFromRotationMatrix(_m); arme.scale.setScalar(hs);
  arme.updateMatrixWorld(true);
  // 3) LES MAINS SUR L'ARME (cinématique inverse à deux os)
  _poig.copy(arme.userData.poignee).applyMatrix4(arme.matrixWorld);
  _garde.copy(arme.userData.garde).applyMatrix4(arme.matrixWorld);
  // main droite : doigts vers l'avant et le bas, paume contre la poignée (vers la gauche du tireur)
  _fd.copy(_f).multiplyScalar(0.55).addScaledVector(_u, -0.75).addScaledVector(_r, -0.25).normalize();
  _nd.copy(_r).negate();
  _pole.copy(_ep).addScaledVector(_r, 0.35).addScaledVector(_u, -0.55).addScaledVector(_f, -0.1);
  A.ikBras('Right', _poig, _fd, _nd, _pole, k);
  A.plierDoigts('Right', [0.9, 1.1, 0.8], k);
  // main gauche : sous le garde-main, paume vers le haut, doigts qui l'entourent
  _fd.copy(_f).multiplyScalar(0.6).addScaledVector(_r, 0.75).normalize();
  _nd.copy(_u);
  A.bone('LeftArm').getWorldPosition(_c);
  _pole.copy(_c).addScaledVector(_r, -0.25).addScaledVector(_u, -0.6);
  A.ikBras('Left', _garde, _fd, _nd, _pole, k);
  A.plierDoigts('Left', [0.8, 1.0, 0.7], k);
  // écart d'axe : canon -> cible
  arme.userData.bouche.getWorldPosition(_c);
  return _d.subVectors(cible, _c).normalize().angleTo(_f);
}
