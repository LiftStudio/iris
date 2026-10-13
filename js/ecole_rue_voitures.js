// =====================================================================
//  LES VOITURES GARÉES (crochet de js/ecole_rue.js) — photos 07, 08, 09, 15
// =====================================================================
// Les voitures de la rue, d'ouest en est, comme sur les photos de Haythem :
//   - la Peugeot 207 BLANCHE au fond, vers l'impasse, le nez vers l'impasse (photo 09) ;
//   - la Fiat 500 VERT D'EAU en face du passage, le nez vers l'est (photos 07, 09) ;
//   - la ROUGE nez à nez avec elle (photos 07, 08) ;
//   - la Kia Niro GRIS ANTHRACITE (« la berline noire » de la photo 08 : la carrosserie berline), le nez vers l'ouest ;
//   - plus loin, après le bac de béton et les motos : la BLANCHE du bout de la rue (photo 15), un SUV NOIR, une bleu
//     nuit ; côté école, passé le n° 4, la GRISE derrière les vélos (photos 08, 15).
// Toutes sur la file de stationnement (sud), sauf la grise (côté nord, à l'est de l'école, où la rue s'élargit).
//
// LE MODÈLE : assets/voitures.glb, un extrait du pack « Generic passenger car pack » de Comrade1280 (Sketchfab, CC BY 4.0,
// voir CREDITS.md) : quatre carrosseries — citadine, compacte, berline, SUV — chacune avec sa caisse texturée, ses
// vitres, ses optiques et ses quatre roues (~29 000 triangles en tout). Téléphones : assets/tel/voitures.glb (textures
// de 256, tools/voitures_glb.py). La TEINTE de chaque voiture est repeinte dans sa texture : les pixels de la peinture
// d'origine (cyan, jaune, olive, noir selon la carrosserie : repérés par leur teinte) prennent la couleur voulue, le
// modelé dessiné dans la texture (reflets, creux) est gardé.
//
// LE BUDGET : une caisse par voiture (sa texture est la sienne), mais toutes les vitres en UN maillage, toutes les
// optiques en un, les roues en un par carrosserie : ~14 appels de dessin pour huit voitures. Le monde solide (une boîte
// par voiture) et les ombres au sol (une tache douce sous chaque caisse : la carte d'ombre du soleil ne couvre que le
// trottoir de l'école) sont posés tout de suite ; les carrosseries arrivent quand le fichier est chargé.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { TELEPHONE } from './appareil.js';
import { jourDehors } from './ecole_matieres.js';

// les carrosseries du fichier (nœuds kit_*) : longueur, largeur, hauteur (m, avant mise à l'échelle) et LA PEINTURE
// d'origine à repérer dans la texture (teinte en degrés, écart toléré, saturation mini, valeur de référence du modelé)
const KITS = {
  citadine: { L: 3.26, l: 1.68, h: 1.31, peinture: { teinte: 188, ecart: 34, sMin: 0.3, vRef: 0.8 } },
  compacte: { L: 3.96, l: 1.8, h: 1.36, peinture: { teinte: 52, ecart: 24, sMin: 0.35, vRef: 1.0 } },
  berline: { L: 4.37, l: 1.96, h: 1.34, peinture: { teinte: 50, ecart: 24, sMin: 0.2, vRef: 0.62 } },
  suv: { L: 4.62, l: 2.08, h: 1.73, peinture: { gris: true, vMin: 0.035, vMax: 0.36, vRef: 0.2 } },
};
// LES VOITURES : x (centre, plan), file ('sud' ou 'nord'), sens (+1 : le nez vers l'est), teinte, échelle
// (relecture du 09/10/2026 : la Fiat est le vert d'eau pâle mesuré sur la photo 09, presque aussi bleu que vert)
export const VOITURES = [
  // (relecture rue du 14/10, photo 09 enfin posée, les roues rétroprojetées au sol : la Peugeot est devant la porte de
  // garage du 5/7, ses roues droites en x -3,5 et -6,4, le nez vers le fond, un peu tourné vers l'école — le jeu la garait
  // 2,75 m plus à l'est, elle paraissait moitié plus grosse que sur la photo ; la roue arrière de la Fiat est en x -0,3 :
  // son milieu en 1,0, là où elle était avant de reculer — la rouge commence à 4,2, elles ne se gênent pas)
  // (sa roue arrière droite au sol en (-2,8 ; -9,7) — son diamètre, 56 px, la met à 6,4 m de l'appareil — : le milieu de la
  // caisse en (-4,0 ; -10,55), serrée contre le trottoir du garage ; la Fiat : sa roue arrière en (0,0 ; -9,4), son milieu en 1,15)
  { nom: 'Peugeot 207 blanche', kit: 'compacte', x: -4.0, y: -10.55, file: 'sud', sens: -1, teinte: 0xe6e7e4, e: 1.08, cap: 0.05 },
  // (lot rue du 13/10, photo 08 à sa pose, les roues rétroprojetées au sol : la ROUGE a le nez vers l'est, sa roue avant
  // en x 7,7 ; la Kia Niro, un crossover gris-bleu sombre, le nez vers l'ouest, ses roues en 9,9 et 12,7 — le jeu la
  // garait 1,3 m plus à l'est, elle entrait dans le champ de la photo 15, qui ne la voit pas. Toutes deux dans la BAIE,
  // au sud de la ligne de tirets. Photo 15 : la grise, un petit coupé, contre la bordure nord de x 22,6 à 26,2 ; le SUV
  // blanc au bout, côté jardin, de x 27 à 31, le nez vers l'école ; la Fiat recule de 1,2 m pour laisser sa place à la rouge.)
  { nom: 'Fiat 500 vert d\'eau', kit: 'citadine', x: 1.15, file: 'sud', sens: 1, teinte: 0xbfe8dc, e: 1.12, haut: 1.08 },
  // (relecture rue du 14/10, photo 08 de près : la rouge est une BERLINE à coffre, bordeaux ; la Kia Niro est une compacte
  // haute aux formes rondes, 4,36 x 1,55 m, gris-bleu sombre — 45-47-54 —, et non le gros 4x4 carré à calandre chromée)
  // (la roue avant de la rouge : 90 px de diamètre au pixel 1493 de la photo 08 — à 4,5 m de l'appareil, en (6,7 ; -9,1) :
  // son milieu en (5,4 ; -9,95), 1 m plus à l'ouest ; le capot de la Kia, tourné vers l'appareil, est plus long : `long`)
  { nom: 'la rouge', kit: 'berline', x: 5.4, y: -9.95, file: 'sud', sens: 1, teinte: 0x8a1c2c, e: 1.0 },
  { nom: 'Kia Niro gris anthracite', kit: 'compacte', x: 11.2, file: 'sud', sens: -1, teinte: 0x2d313b, e: 1.1, haut: 1.12, long: 1.1 },
  { nom: 'la grise', kit: 'citadine', x: 24.4, file: 'nord', sens: 1, teinte: 0xb4b7ba, e: 1.1 },
  { nom: 'la blanche du bout', kit: 'suv', x: 29.1, file: 'sud', sens: -1, teinte: 0xeeeeec, e: 0.96 },
  { nom: 'le SUV noir', kit: 'suv', x: 34.6, file: 'sud', sens: -1, teinte: 0x16171a, e: 0.92 },
];

// LA TACHE D'OMBRE sous une caisse : un rectangle aux bords très doux, plus sombre au milieu (le ciel y est caché)
let _texTache = null;
export function texTache() {
  if (_texTache) return _texTache;
  const c = document.createElement('canvas'); c.width = 64; c.height = 128;
  const g = c.getContext('2d'), img = g.createImageData(64, 128), d = img.data;
  for (let y = 0; y < 128; y++) for (let x = 0; x < 64; x++) {
    const u = Math.abs((x + 0.5) / 32 - 1), v = Math.abs((y + 0.5) / 64 - 1);
    // distance à un rectangle arrondi (super-ellipse), puis une pente douce
    const q = Math.pow(Math.pow(u, 4) + Math.pow(v, 4), 0.25);
    const a = Math.max(0, Math.min(1, (1 - q) / 0.45));
    const k = (y * 64 + x) * 4;
    d[k] = d[k + 1] = d[k + 2] = 0; d[k + 3] = Math.round(255 * a * a * (3 - 2 * a));
  }
  g.putImageData(img, 0, 0);
  _texTache = new THREE.CanvasTexture(c);
  return _texTache;
}
// Les taches de toute la rue (voitures, motos, bancs, jardinières...) : un seul maillage transparent posé sur le sol.
export class Taches {
  constructor() { this.p = []; this.u = []; this.a = []; this.i = []; }
  // centre (x, y) du plan, demi-tailles sx (le long de x) et sy, cap a, opacité au cœur, hauteur du sol h
  ajouter(x, y, sx, sy, a, force, h) {
    const k = this.p.length / 3, c = Math.cos(a), s = Math.sin(a);
    for (const [u, v] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      const px = x + u * sx * c - v * sy * s, py = y + u * sx * s + v * sy * c;
      this.p.push(px, h + 0.006, -py); this.u.push((u + 1) / 2, (v + 1) / 2); this.a.push(force);
    }
    this.i.push(k, k + 2, k + 1, k, k + 3, k + 2);
  }
  poser(parent) {
    if (!this.i.length) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.u, 2));
    // (la FORCE de chaque tache voyage dans la couleur des sommets ; le matériau en fait de l'opacité, voir plus bas)
    const col = []; for (const f of this.a) col.push(f, f, f);
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.setIndex(this.i);
    const m = new THREE.Mesh(g, materiauTache());
    m.renderOrder = 1; m.matrixAutoUpdate = false; m.userData.horsAOSol = true;
    parent.add(m);
    return m;
  }
}
// le matériau des taches : noir, son alpha = la carte x la force (rouge des sommets)
let _matTache = null;
function materiauTache() {
  if (_matTache) return _matTache;
  const m = new THREE.MeshBasicMaterial({ color: 0x000000, map: texTache(), transparent: true, depthWrite: false, vertexColors: true,
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  m.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace('#include <color_fragment>', '').replace('#include <map_fragment>',
      '#include <map_fragment>\n#ifdef USE_COLOR\n  diffuseColor.a *= vColor.r;\n#endif\n  diffuseColor.rgb = vec3(0.0);');
  };
  m.customProgramCacheKey = () => 'iris-rue-taches-1';
  m.name = 'taches d\'ombre de la rue';
  return (_matTache = m);
}

// =====================================================================
//  LA PEINTURE : repeindre la caisse dans sa texture
// =====================================================================
function repeindre(image, kit, teinte) {
  const W = image.width, H = image.height;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(image, 0, 0);
  const img = g.getImageData(0, 0, W, H), d = img.data, P = KITS[kit].peinture;
  // la teinte voulue, en sRGB comme la texture (relecture du 09/10/2026 : `new THREE.Color(hex)` la convertissait en
  // LINÉAIRE ; écrite telle quelle dans l'image sRGB, chaque voiture sortait plus sombre et plus saturée que sa teinte —
  // la Fiat vert d'eau était vert menthe, la Kia gris anthracite presque noire)
  const tr = ((teinte >> 16) & 255) / 255, tg = ((teinte >> 8) & 255) / 255, tb = (teinte & 255) / 255;
  const lisse = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i] / 255, gg = d[i + 1] / 255, b = d[i + 2] / 255;
    const mx = Math.max(r, gg, b), mn = Math.min(r, gg, b), v = mx, s = mx > 0 ? (mx - mn) / mx : 0;
    let w;
    if (P.gris) w = lisse(P.vMin * 0.6, P.vMin, v) * (1 - lisse(P.vMax, P.vMax * 1.3, v)) * (1 - lisse(0.2, 0.35, s));
    else {
      let h = 0;
      if (mx > mn) {
        if (mx === r) h = 60 * (((gg - b) / (mx - mn)) % 6); else if (mx === gg) h = 60 * ((b - r) / (mx - mn) + 2); else h = 60 * ((r - gg) / (mx - mn) + 4);
        if (h < 0) h += 360;
      }
      const dh = Math.min(Math.abs(h - P.teinte), 360 - Math.abs(h - P.teinte));
      w = (1 - lisse(P.ecart * 0.6, P.ecart, dh)) * lisse(P.sMin * 0.6, P.sMin, s) * lisse(0.04, 0.1, v);
    }
    if (w <= 0) continue;
    const k = Math.min(1.15, v / P.vRef);
    d[i] = Math.round(255 * Math.min(1, r * (1 - w) + tr * k * w));
    d[i + 1] = Math.round(255 * Math.min(1, gg * (1 - w) + tg * k * w));
    d[i + 2] = Math.round(255 * Math.min(1, b * (1 - w) + tb * k * w));
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.flipY = false;          // (comme les textures du glTF)
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4;
  return t;
}

// =====================================================================
//  POSER LES VOITURES
// =====================================================================
// R : les cotes de la rue (js/ecole_rue.js). Le monde solide et les taches tout de suite ; les carrosseries au chargement.
export function poserVoitures(ch, R, taches) {
  // (lot rue du 13/10 : devant le 5/7, à l'ouest de x R.X_BAIE, la file du sud est une baie au-delà de la chaussée)
  const yFile = (v) => v.y ?? (v.file === 'nord' ? R.Y_TROTTOIR - 0.15 - 1.02 : v.x < R.X_BAIE ? R.Y_BAIE + 1.02 : R.Y_CHAUSSEE + 1.05);
  for (const v of VOITURES) {
    const K = KITS[v.kit], L = K.L * v.e * (v.long || 1), l = K.l * v.e, y = yFile(v);
    ch.C.ajouterBoite(v.x - L / 2 + 0.08, -(y + l / 2 - 0.08), v.x + L / 2 - 0.08, -(y - l / 2 + 0.08), { y0: R.H_CHAUSSEE, y1: R.H_CHAUSSEE + K.h * v.e * 0.92 });
    taches.ajouter(v.x, y, L / 2 + 0.25, l / 2 + 0.22, 0, 0.88, R.H_CHAUSSEE);
    taches.ajouter(v.x, y, L / 2 - 0.2, l / 2 - 0.15, 0, 0.55, R.H_CHAUSSEE + 0.001);
  }
  const groupe = new THREE.Group(); groupe.name = 'voitures'; ch.decor.add(groupe);
  const url = TELEPHONE ? 'assets/tel/voitures.glb' : 'assets/voitures.glb';
  const charger = (u, secours) => new GLTFLoader().load(u, (gltf) => {
    try { monter(gltf, groupe, R, yFile); } catch (e) { console.warn('[rue] voitures non montées :', e); }
  }, undefined, () => { if (secours) charger(secours, null); else console.warn('[rue] assets/voitures.glb introuvable'); });
  charger(url, TELEPHONE ? 'assets/voitures.glb' : null);
  return groupe;
}

// Les carrosseries du fichier, ramenées chacune à son repère : le nez vers +x, centrée, les roues au sol (y = 0)
function gabarits(scene) {
  scene.updateMatrixWorld(true);
  const out = {};
  scene.traverse((kit) => {
    if (!kit.name || !kit.name.startsWith('kit_')) return;
    const body = kit.children.find((c) => /Body/.test(c.name));
    if (!body) return;
    const R = new THREE.Matrix4().extractRotation(body.matrixWorld);
    const arriere = new THREE.Vector3(0, 1, 0).applyMatrix4(R);          // (le +y de la caisse regarde l'arrière)
    const P = new THREE.Vector3().setFromMatrixPosition(body.matrixWorld);
    const teta = Math.atan2(-arriere.z, -arriere.x);
    const M = new THREE.Matrix4().makeRotationY(teta).multiply(new THREE.Matrix4().makeTranslation(-P.x, 0, -P.z));
    const parties = { caisse: [], vitres: [], optiques: [], roues: [] };
    kit.traverse((o) => {
      if (!o.isMesh) return;
      const g = o.geometry.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(M, o.matrixWorld));
      for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
      const n = o.material.name || '';
      const q = /Glass/.test(n) ? 'vitres' : /Optic/.test(n) ? 'optiques' : /Whee/.test(n) ? 'roues' : 'caisse';
      parties[q].push({ g, mat: o.material });
    });
    // recentrer sur la caisse
    const bb = new THREE.Box3();
    for (const { g } of parties.caisse) { g.computeBoundingBox(); bb.union(g.boundingBox); }
    const cx = (bb.min.x + bb.max.x) / 2, cz = (bb.min.z + bb.max.z) / 2;
    for (const q of Object.values(parties)) for (const { g } of q) g.translate(-cx, 0, -cz);
    out[kit.name.slice(4)] = parties;
  });
  return out;
}

function monter(gltf, groupe, R, yFile) {
  const G = gabarits(gltf.scene);
  const lots = { vitres: [], optiques: [], roues: new Map() };
  let matOptiques = null, matVitres = null;
  const caisseMats = new Map();
  for (const v of VOITURES) {
    const P = G[v.kit];
    if (!P) continue;
    // (`cap` : garée de biais, en radians ; `haut` : une caisse plus haute que son gabarit)
    const m = new THREE.Matrix4().compose(new THREE.Vector3(v.x, R.H_CHAUSSEE, -yFile(v)),
      new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), (v.sens > 0 ? 0 : Math.PI) + (v.cap || 0)), new THREE.Vector3(v.e * (v.long || 1), v.e * (v.haut || 1), v.e));
    // LA CAISSE : sa texture repeinte (une par voiture), la rugosité et le métal d'origine ; ses morceaux (les enjoliveurs
    // du SUV sont dans la matière de la caisse) cousus en un seul maillage
    const cle = v.kit + v.teinte, mat0 = P.caisse[0].mat;
    if (!caisseMats.has(cle)) {
      const nm = mat0.clone();
      if (mat0.map && mat0.map.image) nm.map = repeindre(mat0.map.image, v.kit, v.teinte);
      nm.envMapIntensity = 1.0; nm.name = 'carrosserie (' + v.nom + ')';
      // (un peu du jour couvert dans la peinture, comme les façades : sans carte d'environnement — la moyenne, les
      // téléphones —, une voiture sombre ne serait plus qu'une tache noire)
      jourDehors(nm, 0.07);
      caisseMats.set(cle, nm);
    }
    const caisse = mergeGeometries(P.caisse.map(({ g }) => g.clone().applyMatrix4(m)), false);
    const mesh = new THREE.Mesh(caisse, caisseMats.get(cle));
    mesh.castShadow = true; mesh.receiveShadow = true; mesh.matrixAutoUpdate = false; mesh.name = v.nom;
    groupe.add(mesh);
    for (const { g, mat } of P.vitres) { lots.vitres.push(g.clone().applyMatrix4(m)); matVitres = matVitres || mat; }
    for (const { g, mat } of P.optiques) { lots.optiques.push(g.clone().applyMatrix4(m)); matOptiques = matOptiques || mat; }
    for (const { g, mat } of P.roues) {
      if (!lots.roues.has(mat)) lots.roues.set(mat, []);
      lots.roues.get(mat).push(g.clone().applyMatrix4(m));
    }
  }
  const poser = (geos, mat, ombre) => {
    if (!geos.length || !mat) return;
    const g = mergeGeometries(geos, false);
    if (!g) return;
    const mesh = new THREE.Mesh(g, mat);
    mesh.castShadow = ombre; mesh.receiveShadow = true; mesh.matrixAutoUpdate = false;
    groupe.add(mesh);
  };
  // LES VITRES : un verre sombre, presque noir, qui reflète la rue (la carte d'environnement prise sur place)
  const verre = new THREE.MeshStandardMaterial({ color: 0x0b0d10, roughness: 0.04, metalness: 0.0, transparent: true, opacity: 0.78,
    depthWrite: false, envMapIntensity: 1.6, side: THREE.DoubleSide });
  verre.name = 'vitres des voitures';
  void matVitres;
  poser(lots.vitres, verre, false);
  poser(lots.optiques, matOptiques, false);
  for (const [mat, geos] of lots.roues) poser(geos, mat, true);
}
