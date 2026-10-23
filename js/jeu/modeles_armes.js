// =====================================================================
//  LES MODÈLES D'ARMES — squelette du socle S0 (22/10), rempli par le lot L-W
// =====================================================================
// Huit armes faites main en primitives, aucun fichier, aucune marque (spec § 4.5.8) : en deux versions, `pourVue` (des
// SkinnedMesh rigides cousus par matériau, ≤ 6 appels, os chargeur / culasse / glissière / pompe / détente / goupille) et
// 3e personne (une géométrie par matériau, sans os). Les REPÈRES (origine = prise de la main droite sur l'axe, −Z vers la
// bouche) sont posés en Object3D sous `userData.reperes`. Le squelette : une BOÎTE par arme à son encombrement (§ 3.3),
// repères posés ; matériaux partagés (créés une fois).
import * as THREE from 'three';

let _mats = null;
// acier, polymère, teinte par arme, verre émissif du point rouge (toneMapped: false) — créés au premier appel
export const MATERIAUX_ARMES = {
  get acier() { return mats().acier; }, get polymere() { return mats().polymere; }, get verre() { return mats().verre; },
  teinte(id) { return mats().teintes[id] || mats().polymere; },
};
function mats() {
  if (_mats) return _mats;
  const std = (color, metalness, roughness) => new THREE.MeshStandardMaterial({ color, metalness, roughness });
  _mats = {
    acier: std(0x24272b, 0.85, 0.38), polymere: std(0x2b2d30, 0, 0.72),
    verre: new THREE.MeshBasicMaterial({ color: 0xff2a1a, toneMapped: false }),
    teintes: { fa24: std(0x9a8665, 0, 0.7), pm9: std(0x1d1e20, 0, 0.7), fp12: std(0x5b5f45, 0, 0.7), tp50: std(0xb8a27a, 0, 0.7), p17: std(0x1d1e20, 0, 0.7),
      couteau: std(0x24272b, 0.85, 0.38), frag: std(0x4a5236, 0.2, 0.6), flash: std(0x3a3d40, 0.4, 0.5) },
  };
  return _mats;
}

const V = (x, y, z) => [x, y, z];
export const REPERES = {
  fa24: { mainG: V(0, -0.025, -0.34), bouche: V(0, 0.035, -0.64), visee: V(0, 0.088, -0.08), ejection: V(0.03, 0.05, -0.06), crosse: V(0, 0.03, 0.20) },
  pm9: { mainG: V(0, -0.03, -0.24), bouche: V(0, 0.03, -0.40), visee: V(0, 0.075, -0.05), ejection: V(0.03, 0.045, -0.05), crosse: V(0, 0.03, 0.18) },
  fp12: { mainG: V(0, -0.03, -0.42), bouche: V(0, 0.03, -0.78), visee: V(0, 0.06, -0.70), ejection: V(0.03, 0.04, -0.08), crosse: V(0, 0.02, 0.22), courseMainG: 0.09 },
  tp50: { mainG: V(0, -0.03, -0.36), bouche: V(0, 0.03, -0.85), visee: V(0, 0.075, -0.02), ejection: V(0.03, 0.05, -0.05), crosse: V(0, 0.03, 0.24) },
  p17: { mainG: V(-0.02, -0.04, 0.01), bouche: V(0, 0.035, -0.13), visee: V(0, 0.058, 0.04), ejection: V(0.015, 0.04, -0.03) },
  couteau: { mainD: V(0, 0, 0) }, frag: { mainD: V(0, 0, 0), goupille: V(0.02, 0.05, 0) }, flash: { mainD: V(0, 0, 0), goupille: V(0.02, 0.06, 0) },
};
// la boîte du squelette : longueur (encombrement, § 3.3), largeur, hauteur, et où elle commence derrière la prise
const BOITES = { fa24: [0.84, 0.05, 0.12, 0.20], pm9: [0.62, 0.05, 0.11, 0.18], fp12: [0.95, 0.05, 0.10, 0.22], tp50: [1.10, 0.05, 0.11, 0.24],
  p17: [0.19, 0.03, 0.12, 0.04], couteau: [0.25, 0.02, 0.03, 0.10], frag: [0.07, 0.07, 0.09, 0.035], flash: [0.06, 0.06, 0.11, 0.03] };
const _geos = {};

export function creerArme(id, { pourVue = false } = {}) {
  const B = BOITES[id] || BOITES.fa24;
  const g = new THREE.Group(); g.name = 'arme ' + id;
  const geo = _geos[id] || (_geos[id] = new THREE.BoxGeometry(B[1], B[2], B[0]).translate(0, 0, B[3] - B[0] / 2));
  const m = new THREE.Mesh(geo, MATERIAUX_ARMES.teinte(id));
  m.castShadow = !pourVue;
  g.add(m);
  const reperes = {};
  for (const [nom, p] of Object.entries(REPERES[id] || {})) {
    if (!Array.isArray(p)) continue;
    const r = new THREE.Object3D(); r.name = nom; r.position.set(p[0], p[1], p[2]); g.add(r); reperes[nom] = r;
  }
  g.userData.reperes = reperes;
  g.userData.os = pourVue ? { chargeur: null, culasse: null, glissiere: null, pompe: null, detente: null, goupille: null } : null;
  g.userData.arme = id;
  return g;
}
