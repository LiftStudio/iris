// =====================================================================
//  LE MOBILIER DE LA RUE ET SES PLANTES (crochet de js/ecole_rue.js) — photos 08 à 18
// =====================================================================
// Tout ce qui est posé sur le trottoir et la chaussée devant l'école IRIS, d'après les photos de Haythem :
//   - les deux TOTEMS « iris » (photos 08, 10, 13, 18) : panneau de 0,62 x 2,60 m perpendiculaire à la façade, montants
//     d'aluminium ; face ouest : le logo, « INSTITUT SUPÉRIEUR DE RESSOURCES INFORMATIQUES » et la carte du monde en
//     trame grise sur fond noir ; face est (celui du passage) : « Entrée des étudiants » en jaune sur une grille de points ;
//   - les GRANDES JARDINIÈRES de zinc (photos 08, 13, 17) : un olivier, un arbuste en fleurs rouges, un cyprès, des
//     arbustes ; les POTS ronds anthracite du BAMBOU et du PALMIER de part et d'autre de la porte 6 (photos 16 à 18) ;
//   - les BANCS noirs à lattes (photos 08, 13, 14) — on s'y assoit ; la corbeille noire à sac et le cendrier (photo 13) ;
//   - les BACS ROULANTS gris devant la porte de secours (photo 10), le bac vert de l'impasse (photo 09) ;
//   - les DEUX-ROUES : la trottinette contre la grille du passage (photo 13), la moto noire à top-case devant le n° 4
//     (photos 15, 16), les vélos contre la station de réparation orange et ses arceaux blancs (photos 15, 16), les motos
//     et scooters garés devant le jardin, contre le bac de béton (photos 08, 15) ;
//   - les plantes de l'IMPASSE et du n° 8 (photos 09, 10) : pots alignés devant le muret, jardinières de terre cuite.
//
// LE BUDGET. Une rue, ce sont des centaines de petites pièces. Toutes les pièces opaques sont rangées dans un ATELIER qui
// les coud en un seul maillage par matériau (et par « porte une ombre ou non ») ; TOUTES les feuilles de la rue (bambous,
// palmier, olivier, cyprès, arbustes, arbres du jardin et de l'impasse) sont des cartes découpées dans UNE seule
// texture (un atlas de huit planches dessinées) : un seul appel de dessin pour tout le feuillage, balancé par le vent
// (js/kit_decor.js windify). Les feuilles prennent la normale du VOLUME de la plante (une sphère), des deux côtés de la
// carte : un buisson s'éclaire comme une boule de feuilles, pas comme un jeu de cartes.
//
// Coordonnées du PLAN (js/carte_ecole.js) : x le long de la façade, y < 0 dehors ; un cap `a` (radians) dans le plan
// tourne de +x vers +y — c'est aussi la rotation.y du monde (X = x, Z = -y).
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { canvasTex, windify } from './kit_decor.js';
import { jourDehors } from './ecole_matieres.js';
import { TELEPHONE } from './appareil.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const HAUT = V(0, 1, 0);
// un hasard REPRODUCTIBLE (la rue est la même à chaque partie)
export function alea(graine) { let x = graine >>> 0 || 1; return () => (x = (x * 16807) % 2147483647) / 2147483647; }

// =====================================================================
//  L'ATELIER : les pièces opaques cousues
// =====================================================================
// `ajouter(geo, mat, m, ombre)` : la géométrie (repère local) passée par la matrice `m` (repère du monde), rangée avec
// celles du même matériau. `poser(parent)` coud chaque lot en UN maillage. (Les lots séparent les géométries indexées des
// autres : mergeGeometries ne mélange pas les deux.)
// LES TEINTES. La plupart des pièces de la rue n'ont pas d'image : un vélo bleu, une selle noire, un pot anthracite, la
// station orange... Une matière par couleur, c'étaient une trentaine d'appels de dessin (et autant dans la carte d'ombre).
// Ces matières-là ne sont donc que des TEINTES ({ teinte, classe }) : la couleur est écrite sur les sommets de la pièce,
// et toutes les pièces d'une même CLASSE de surface (mat, satiné, laqué, métal) sont cousues ensemble dans un seul
// maillage, sous un seul matériau à couleurs de sommets. Le jour couvert (jourDehors) y suit la couleur de chaque pièce.
const CLASSES = {
  mat: { roughness: 0.85, metalness: 0 },
  satin: { roughness: 0.52, metalness: 0.06 },
  laque: { roughness: 0.28, metalness: 0.3 },
  metal: { roughness: 0.28, metalness: 0.85 },
};
const _classes = new Map();
function materiauClasse(classe) {
  if (!_classes.has(classe)) {
    const m = new THREE.MeshStandardMaterial({ ...CLASSES[classe], vertexColors: true });
    m.emissive = new THREE.Color(0.94 * 0.07, 0.98 * 0.07, 1.06 * 0.07);
    // (l'émissif du jour couvert prend la couleur de chaque pièce, comme jourDehors sur une matière sans image)
    m.onBeforeCompile = (sh) => {
      sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>',
        '#include <emissivemap_fragment>\n#ifdef USE_COLOR\n  totalEmissiveRadiance *= vColor.rgb;\n#endif');
    };
    m.customProgramCacheKey = () => 'iris-rue-teinte-1';
    m.name = 'rue : pièces ' + classe;
    _classes.set(classe, m);
  }
  return _classes.get(classe);
}
export const teinte = (hex, classe = 'mat') => ({ teinte: new THREE.Color(hex), classe, isTeinte: true });
export class Atelier {
  constructor() { this.lots = new Map(); }
  ajouter(geo, mat, m, ombre = true) {
    const g = geo.clone(); g.applyMatrix4(m);
    for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
    let cle, vrai = mat;
    if (mat.isTeinte) {
      const n = g.attributes.position.count, c = new Float32Array(n * 3), t = mat.teinte;
      for (let i = 0; i < n; i++) { c[i * 3] = t.r; c[i * 3 + 1] = t.g; c[i * 3 + 2] = t.b; }
      g.setAttribute('color', new THREE.BufferAttribute(c, 3));
      vrai = materiauClasse(mat.classe); cle = 'classe-' + mat.classe;
    } else cle = mat.uuid;
    cle += (ombre ? '+o' : '-o') + (g.index ? 'i' : 'n');
    if (!this.lots.has(cle)) this.lots.set(cle, { mat: vrai, ombre, geos: [] });
    this.lots.get(cle).geos.push(g);
  }
  poser(parent) {
    for (const [, l] of this.lots) {
      const g = l.geos.length > 1 ? mergeGeometries(l.geos, false) : l.geos[0];
      if (!g) continue;
      const m = new THREE.Mesh(g, l.mat);
      m.castShadow = l.ombre; m.receiveShadow = true; m.matrixAutoUpdate = false;
      parent.add(m);
      if (l.geos.length > 1) for (const q of l.geos) q.dispose();
    }
    this.lots.clear();
  }
}
// la matrice d'un objet posé au point (x, y) du plan, à la hauteur h, au cap a ; puis des pièces dans SON repère
// (le monde solide compte ses angles dans l'autre sens : une boîte orientée au cap a se déclare avec -a, js/collisions.js)
export const pose = (x, y, h = 0, a = 0) => new THREE.Matrix4().compose(V(x, h, -y), new THREE.Quaternion().setFromAxisAngle(HAUT, a), V(1, 1, 1));
const dans = (base, x, y, z, rx = 0, ry = 0, rz = 0, s = null) => base.clone().multiply(
  new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), s || V(1, 1, 1)));
// un tube (cylindre) de A à B, rayons r0 (en A) et r1 (en B), dans le repère local
const _Y = V(0, 1, 0);
function tube(A, B, r0, r1 = r0, seg = 6) {
  const d = B.clone().sub(A), L = d.length();
  const g = new THREE.CylinderGeometry(r1, r0, L, seg, 1);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(_Y, d.normalize()));
  g.translate((A.x + B.x) / 2, (A.y + B.y) / 2, (A.z + B.z) / 2);
  return g;
}
// une boîte dont la face du dessous est réduite de `k` (un bac roulant, un pot carré évasé)
function boiteEvasee(w, h, d, k) {
  const g = new THREE.BoxGeometry(w, h, d), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) if (p.getY(i) < 0) { p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k); }
  g.computeVertexNormals();
  return g;
}

// =====================================================================
//  LES MATIÈRES DE LA RUE
// =====================================================================
// Toutes reçoivent un peu du jour couvert (js/ecole_matieres.js jourDehors) comme les façades : vues du hall, elles
// sortent claires ; dehors, l'adaptation de l'œil fait le reste.
let _M = null;
export function matieresRue() {
  if (_M) return _M;
  const std = (o, k = 0.08) => jourDehors(new THREE.MeshStandardMaterial(o), k);
  const M = {};
  M.zinc = std({ map: texZinc(), roughness: 0.5, metalness: 0.35 }, 0.1); M.zinc.name = 'zinc patiné (jardinières)';
  M.terre = teinte(0x2e241c, 'mat');
  M.anthracite = teinte(0x34373a, 'satin');
  M.treillis = std({ map: texTreillis(), roughness: 0.6, metalness: 0.3 }, 0.04);
  M.terreCuite = teinte(0xa4674a, 'mat');
  M.potGris = teinte(0x8e8f8c, 'mat');
  M.potTurquoise = teinte(0x2f6f74, 'laque');
  M.noirBanc = teinte(0x1e1f21, 'laque');
  M.sac = teinte(0x101012, 'laque');
  M.bacGris = teinte(0x4e5357, 'satin');
  M.bacCouvercle = teinte(0x3b3f42, 'satin');
  M.bacVert = teinte(0x2f8a3a, 'satin');
  M.caoutchouc = teinte(0x141414, 'mat');
  M.alu = teinte(0xb4b7b9, 'metal');
  M.chrome = teinte(0xd8dbde, 'metal');
  M.noirMat = teinte(0x18181a, 'mat');
  M.noirBrillant = teinte(0x111214, 'laque');
  M.grisMoteur = teinte(0x55585c, 'metal');
  M.rougeMoto = teinte(0x8e1418, 'laque');
  M.orange = teinte(0xe08a1c, 'satin');
  M.blancTube = teinte(0xeceae4, 'satin');
  M.cadreBlanc = teinte(0xe8e8e4, 'laque');
  M.cadreBleu = teinte(0x24427e, 'laque');
  M.cadreNoir = teinte(0x1b1c1e, 'laque');
  M.cadreGris = teinte(0x6d7276, 'laque');
  M.selle = teinte(0x1a1a1a, 'satin');
  M.vitreFumee = teinte(0x23282c, 'laque');
  M.tige = teinte(0x7c8a46, 'satin');
  M.ecorce = teinte(0x5f5448, 'mat');
  M.ecorceClaire = teinte(0x8a8476, 'mat');
  M.stipe = teinte(0x4a3a2c, 'mat');
  M.petiole = teinte(0x5d6b33, 'satin');
  // LES RAYONS DES ROUES : un disque découpé (un dessin de 32 rayons)
  M.rayons = new THREE.MeshStandardMaterial({ map: texRayons(), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.3, metalness: 0.8 });
  M.rayons.name = 'rayons de vélo';
  // LE FEUILLAGE : l'atlas des huit planches, découpé, deux faces, balancé par le vent
  M.feuilles = feuillageMat();
  _M = M;
  return M;
}

// ---------------------------------------------------------------- textures dessinées
function texZinc() {
  // le zinc des jardinières : gris bleuté, marbré de patine, des coulures verticales plus sombres et des arêtes claires
  return canvasTex(256, 256, (g, w, h) => {
    const r = alea(31);
    g.fillStyle = '#939ca0'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 90; k++) {
      const c = 120 + r() * 60;
      g.fillStyle = `rgba(${c - 6},${c + 2},${c + 8},0.22)`;
      g.beginPath(); g.ellipse(r() * w, r() * h, 8 + r() * 40, 6 + r() * 24, r() * 3, 0, 7); g.fill();
    }
    for (let k = 0; k < 40; k++) {
      const x = r() * w, l = 30 + r() * 120;
      const gr = g.createLinearGradient(0, 0, 0, l); gr.addColorStop(0, 'rgba(70,78,84,0.25)'); gr.addColorStop(1, 'rgba(70,78,84,0)');
      g.fillStyle = gr; g.fillRect(x, r() * h * 0.5, 1 + r() * 3, l);
    }
    for (let k = 0; k < 2500; k++) { const v = 110 + r() * 80; g.fillStyle = `rgba(${v},${v + 4},${v + 8},0.25)`; g.fillRect(r() * w, r() * h, 1, 1); }
  }, [1 / 0.6, 1 / 0.6], false, 4);
}
function texTreillis() {
  // la jardinière noire en treillis à côté du bambou (photos 16, 17)
  return canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = '#121214'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#3a3c40';
    for (let y = 0; y < h; y += 16) for (let x = 0; x < w; x += 16) g.fillRect(x + 3, y + 3, 10, 10);
    g.fillStyle = '#060607';
    for (let y = 0; y < h; y += 16) for (let x = 0; x < w; x += 16) g.fillRect(x + 5, y + 5, 6, 6);
  }, [1 / 0.25, 1 / 0.25], false, 4);
}
function texRayons() {
  return canvasTex(128, 128, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.strokeStyle = '#c9ccce'; g.lineWidth = 1.4;
    const c = w / 2;
    for (let i = 0; i < 32; i++) {
      const a = i / 32 * Math.PI * 2, b = a + (i % 2 ? 0.35 : -0.35);
      g.beginPath(); g.moveTo(c + Math.cos(b) * 7, c + Math.sin(b) * 7); g.lineTo(c + Math.cos(a) * 62, c + Math.sin(a) * 62); g.stroke();
    }
    g.fillStyle = '#9da1a4'; g.beginPath(); g.arc(c, c, 8, 0, 7); g.fill();
  }, null, true, 4);
}

// =====================================================================
//  LE FEUILLAGE : un atlas de huit planches dessinées
// =====================================================================
// 1024 x 512, huit cases de 256 : bambou, palme, olivier, arbuste, thuya, fleurs, choisya, couronne d'arbre. Chaque
// planche dessine un rameau dont l'ATTACHE est en haut, au milieu : une carte se pose par son attache, sa pointe part
// dans la direction voulue. (Au téléphone l'atlas est réduit de moitié, js/kit_decor.js canvasTex.)
export const PLANCHE = { bambou: 0, palme: 1, olivier: 2, arbuste: 3, thuya: 4, fleurs: 5, choisya: 6, arbre: 7 };
const uvPlanche = (i) => { const c = i % 4, l = Math.floor(i / 4); return [c / 4, 1 - (l + 1) / 2, (c + 1) / 4, 1 - l / 2]; };
function feuille(g, x, y, ang, L, W, c1, c2, nervure = 0.3) {
  const dx = Math.sin(ang), dy = Math.cos(ang), px = -dy, py = dx;
  const tx = x + dx * L, ty = y + dy * L;
  const gr = g.createLinearGradient(x, y, tx, ty); gr.addColorStop(0, c1); gr.addColorStop(1, c2);
  g.fillStyle = gr;
  g.beginPath(); g.moveTo(x, y);
  g.quadraticCurveTo(x + dx * L * 0.35 + px * W, y + dy * L * 0.35 + py * W, tx, ty);
  g.quadraticCurveTo(x + dx * L * 0.35 - px * W, y + dy * L * 0.35 - py * W, x, y);
  g.fill();
  if (nervure > 0) {
    g.strokeStyle = `rgba(225,235,190,${nervure})`; g.lineWidth = 0.8;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + dx * L * 0.85, y + dy * L * 0.85); g.stroke();
  }
}
const hsl = (h, s, l) => `hsl(${h},${s}%,${l}%)`;
function dessinerAtlas(g) {
  const r = alea(7);
  const S = 256;
  const tige = (pts, w, c) => { g.strokeStyle = c; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); };
  const caseDe = (i, f) => { g.save(); g.translate((i % 4) * S, Math.floor(i / 4) * S); g.beginPath(); g.rect(4, 2, S - 8, S - 6); g.clip(); f(); g.restore(); };
  // 0 — LE BAMBOU (Phyllostachys, photos 16 à 18) : un rameau fin, des feuilles lancéolées qui retombent en éventail
  caseDe(0, () => {
    for (const [ox, n] of [[128, 9], [96, 5], [162, 5]]) {
      const pts = []; for (let t = 0; t <= 1; t += 0.1) pts.push([ox + Math.sin(t * 2.2) * 10 * (ox === 128 ? 1 : (ox < 128 ? -1.5 : 1.5)), 6 + t * 200]);
      tige(pts, 1.6, '#6f7c38');
      for (let k = 0; k < n; k++) {
        const t = 0.12 + k / n * 0.85, [x, y] = pts[Math.min(10, Math.round(t * 10))];
        const cote = k % 2 ? 1 : -1, ang = cote * (0.35 + r() * 0.65);
        const l = 22 + r() * 14;
        feuille(g, x, y, ang, 70 + r() * 45, 7 + r() * 3.5, hsl(78 + r() * 14, 42 + r() * 12, 24 + r() * 8), hsl(74 + r() * 12, 45, l), 0.25);
      }
    }
  });
  // 1 — LA PALME du palmier de Chine (Trachycarpus, photos 16, 17) : un éventail de 36 segments étroits
  caseDe(1, () => {
    const cx = 128, cy = 10;
    for (let i = 0; i < 36; i++) {
      const a = -1.6 + i / 35 * 3.2 + (r() - 0.5) * 0.05;
      const l = 205 + r() * 32 - Math.abs(a) * 25;
      const lum = 24 + r() * 8;
      feuille(g, cx + Math.sin(a) * 12, cy + Math.cos(a) * 12, a + (r() - 0.5) * 0.06, l, 5.5 + r() * 1.5, hsl(92, 38, lum - 4), hsl(88 + r() * 8, 40, lum + 4), 0.22);
    }
    g.fillStyle = '#3f4a22'; g.beginPath(); g.ellipse(cx, cy + 10, 12, 9, 0, 0, 7); g.fill();
  });
  // 2 — L'OLIVIER (photos 08, 13) : un rameau ligneux, de petites feuilles étroites vert-gris, revers argenté
  caseDe(2, () => {
    tige([[128, 4], [124, 70], [130, 140], [126, 220]], 2.2, '#6b5f50');
    for (const [x0, y0, x1, y1] of [[126, 60, 70, 150], [128, 100, 190, 180], [126, 150, 80, 230], [128, 180, 175, 245]]) tige([[x0, y0], [x1, y1]], 1.4, '#6b5f50');
    for (let k = 0; k < 70; k++) {
      const t = r(), br = Math.floor(r() * 5);
      const [x, y] = br === 0 ? [127, 6 + t * 215] : [[126, 60, 70, 150], [128, 100, 190, 180], [126, 150, 80, 230], [128, 180, 175, 245]][br - 1].reduce((acc, v, i, A) => (i === 0 ? [A[0] + (A[2] - A[0]) * t, A[1] + (A[3] - A[1]) * t] : acc), null);
      const arg = r() < 0.35;
      feuille(g, x, y, (r() - 0.5) * 2.6, 26 + r() * 14, 3 + r() * 1.5, arg ? '#a7b096' : hsl(80, 14 + r() * 8, 38 + r() * 8), arg ? '#c0c8b0' : hsl(78, 16, 44 + r() * 6), 0);
    }
  });
  // 3 — L'ARBUSTE persistant (osmanthe, laurier : jardinières, pots de l'impasse) : feuilles ovales luisantes, serrées
  caseDe(3, () => {
    for (let b = 0; b < 6; b++) {
      const a = -0.9 + b * 0.36 + (r() - 0.5) * 0.2, L = 150 + r() * 70;
      const pts = [[128, 6], [128 + Math.sin(a) * L * 0.5, 6 + Math.cos(a) * L * 0.5], [128 + Math.sin(a) * L, 6 + Math.cos(a) * L]];
      tige(pts, 1.5, '#4c4a30');
      for (let k = 0; k < 16; k++) {
        const t = 0.1 + r() * 0.9, x = 128 + Math.sin(a) * L * t, y = 6 + Math.cos(a) * L * t;
        feuille(g, x, y, a + (r() - 0.5) * 2.2, 24 + r() * 16, 7 + r() * 4, hsl(100 + r() * 12, 34 + r() * 14, 17 + r() * 9), hsl(96 + r() * 10, 38, 26 + r() * 10), 0.2);
      }
    }
  });
  // 4 — LE THUYA / CYPRÈS (photo 13) : des rameaux plats en écailles, vert sombre, pointes plus claires
  caseDe(4, () => {
    const branche = (x, y, a, L, prof) => {
      const n = Math.floor(L / 6);
      for (let i = 0; i < n; i++) {
        const t = i / n, px = x + Math.sin(a) * L * t, py = y + Math.cos(a) * L * t;
        g.fillStyle = hsl(105, 38, 16 + t * 12 + r() * 5);
        g.beginPath(); g.ellipse(px, py, 4.2 - t * 1.5, 5.5, a, 0, 7); g.fill();
        if (prof > 0 && i % 3 === 1) for (const s of [-1, 1]) branche(px, py, a + s * (0.8 + r() * 0.3), L * (0.42 - t * 0.25), prof - 1);
      }
    };
    branche(128, 6, 0, 235, 2);
  });
  // 5 — L'ARBUSTE EN FLEURS ROUGES (jardinière de la photo 13) : petites feuilles, grappes de fleurs rouges
  caseDe(5, () => {
    for (let b = 0; b < 5; b++) {
      const a = -0.8 + b * 0.4, L = 140 + r() * 80;
      tige([[128, 6], [128 + Math.sin(a) * L, 6 + Math.cos(a) * L]], 1.3, '#4f4a2e');
      for (let k = 0; k < 14; k++) {
        const t = 0.15 + r() * 0.85, x = 128 + Math.sin(a) * L * t, y = 6 + Math.cos(a) * L * t;
        feuille(g, x, y, a + (r() - 0.5) * 2.4, 18 + r() * 10, 5 + r() * 2.5, hsl(105, 32, 20 + r() * 8), hsl(100, 34, 30), 0.15);
      }
      for (let k = 0; k < 4; k++) {
        const t = 0.4 + r() * 0.6, x = 128 + Math.sin(a) * L * t + (r() - 0.5) * 20, y = 6 + Math.cos(a) * L * t + (r() - 0.5) * 20;
        for (let f = 0; f < 6; f++) { g.fillStyle = r() < 0.8 ? hsl(355, 70 + r() * 15, 38 + r() * 10) : '#f2e6e6'; g.beginPath(); g.arc(x + (r() - 0.5) * 12, y + (r() - 0.5) * 12, 2.6 + r() * 1.6, 0, 7); g.fill(); }
      }
    }
  });
  // 6 — LE CHOISYA (oranger du Mexique) des jardinières de terre cuite du n° 8 (photos 09, 10) : feuilles par trois, vert vif
  caseDe(6, () => {
    for (let b = 0; b < 6; b++) {
      const a = -1.0 + b * 0.4 + (r() - 0.5) * 0.2, L = 150 + r() * 70;
      tige([[128, 6], [128 + Math.sin(a) * L, 6 + Math.cos(a) * L]], 1.4, '#55562e');
      for (let k = 0; k < 6; k++) {
        const t = 0.2 + k / 6 * 0.8, x = 128 + Math.sin(a) * L * t, y = 6 + Math.cos(a) * L * t;
        for (const s of [-0.7, 0, 0.7]) feuille(g, x, y, a + s + (r() - 0.5) * 0.3, 30 + r() * 12, 6 + r() * 2, hsl(88 + r() * 8, 45 + r() * 10, 26 + r() * 8), hsl(84, 50, 36 + r() * 8), 0.25);
      }
    }
  });
  // 7 — LA COURONNE D'ARBRE (le jardin d'en face, l'impasse) : une touffe dense, plus sombre au cœur
  caseDe(7, () => {
    for (let k = 0; k < 520; k++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 112, x = 128 + Math.cos(a) * d, y = 132 + Math.sin(a) * d * 0.92;
      const coeur = 1 - d / 112;
      feuille(g, x, y, r() * 6.3, 13 + r() * 9, 4.5 + r() * 3, hsl(95 + r() * 18, 30 + r() * 15, 14 + (1 - coeur) * 12 + r() * 8), hsl(92 + r() * 14, 36, 22 + (1 - coeur) * 14 + r() * 8), 0);
    }
  });
}
let _atlas = null;
function texFeuillage() {
  if (!_atlas) {
    _atlas = canvasTex(1024, 512, (g) => dessinerAtlas(g), null, true, 4);
    _atlas.premultiplyAlpha = false;
  }
  return _atlas;
}
// LE MATÉRIAU DU FEUILLAGE : découpe, deux faces, couleur par carte (attribut `color`), vent ; la normale n'est PAS
// retournée sur la face arrière (c'est celle du volume de la plante)
function feuillageMat() {
  const m = new THREE.MeshStandardMaterial({ map: texFeuillage(), alphaTest: 0.42, side: THREE.DoubleSide, roughness: 0.78, vertexColors: true });
  jourDehors(m, 0.07);
  m.name = 'feuillage de la rue';
  windify(m, (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace('#include <normal_fragment_begin>',
      THREE.ShaderChunk.normal_fragment_begin.replace('normal *= faceDirection;', '/* feuillage : la normale du volume, des deux côtés */'));
  }, 0.6, 3.2);
  const cle = m.customProgramCacheKey();
  m.customProgramCacheKey = () => cle + '-rue-feuillage';
  return m;
}

// =====================================================================
//  LES CARTES DE FEUILLES
// =====================================================================
// Une carte = un rameau : trois rangées de sommets (attache, milieu, pointe), la pointe peut retomber (`pli`). Les
// normales sont celles du volume (du centre `c` de la plante vers le sommet, un peu vers le haut).
export class Feuillage {
  constructor() { this.p = []; this.n = []; this.u = []; this.c = []; this.i = []; }
  carte(b, d, s, L, W, c, planche, { pli = 0.25, teinte = 1, tc = null } = {}) {
    const [u0, v0, u1, v1] = uvPlanche(planche), k = this.p.length / 3;
    const m = b.clone().addScaledVector(d, L * 0.5);
    const d2 = d.clone().addScaledVector(HAUT, -pli).normalize();
    const t = m.clone().addScaledVector(d2, L * 0.5);
    const col = tc || [teinte, teinte, teinte];
    const rangs = [[b, v1], [m, (v0 + v1) / 2], [t, v0]];
    for (const [p, v] of rangs) for (const sg of [-1, 1]) {
      const q = p.clone().addScaledVector(s, sg * W / 2);
      this.p.push(q.x, q.y, q.z);
      const n = q.clone().sub(c); n.y = n.y * 0.7 + 0.35 * n.length(); n.normalize();
      this.n.push(n.x, n.y, n.z);
      this.u.push(sg < 0 ? u0 : u1, v);
      this.c.push(col[0], col[1], col[2]);
    }
    this.i.push(k, k + 1, k + 3, k, k + 3, k + 2, k + 2, k + 3, k + 5, k + 2, k + 5, k + 4);
  }
  // une carte orientée au hasard autour d'un point, la pointe vers `dir` (vecteur unitaire)
  carteVers(b, dir, L, W, c, planche, r, o = {}) {
    let s = new THREE.Vector3().crossVectors(dir, HAUT);
    if (s.lengthSq() < 1e-4) s.set(1, 0, 0);
    s.normalize().applyAxisAngle(dir, (r() - 0.5) * 1.6);
    this.carte(b, dir, s, L, W, c, planche, o);
  }
  poser(parent, mat, ombre = true) {
    if (!this.i.length) return null;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.u, 2));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3));
    g.setIndex(this.i);
    g.computeBoundingSphere();
    const m = new THREE.Mesh(g, mat);
    m.castShadow = ombre; m.receiveShadow = true; m.matrixAutoUpdate = false;
    m.userData.horsAOSol = true;                  // (pas un obstacle pour l'ombre cuite du hall)
    parent.add(m);
    return m;
  }
}

// =====================================================================
//  LES PLANTES (en coordonnées du plan ; h0 : la hauteur de la terre du pot)
// =====================================================================
const vMonde = (x, h, y) => V(x, h, -y);
const dirAz = (az, elev) => V(Math.cos(az) * Math.cos(elev), Math.sin(elev), -Math.sin(az) * Math.cos(elev));

// LE BAMBOU en pot (photos 16 à 18) : une touffe de chaumes fins qui s'évasent, des rameaux de feuilles sur les deux
// tiers du haut
export function bambou(F, A, M, x, y, h0, H, r, n = 12) {
  const c = vMonde(x, h0 + H * 0.62, y);
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2, d0 = Math.sqrt(r()) * 0.16;
    const base = vMonde(x + Math.cos(a) * d0, h0, y + Math.sin(a) * d0);
    const pench = 0.15 + r() * 0.35, h = H * (0.72 + r() * 0.28);
    const sommet = base.clone().add(V(Math.cos(a) * pench * h * 0.45, h, -Math.sin(a) * pench * h * 0.45));
    const mil = base.clone().lerp(sommet, 0.5).add(V(Math.cos(a) * 0.04, 0, -Math.sin(a) * 0.04));
    const rr = 0.006 + r() * 0.004;
    A.ajouter(tube(base, mil, rr, rr * 0.9, 5), M.tige, new THREE.Matrix4());
    A.ajouter(tube(mil, sommet, rr * 0.9, rr * 0.5, 5), M.tige, new THREE.Matrix4());
    const nk = 11 + Math.floor(r() * 5);
    for (let k = 0; k < nk; k++) {
      const t = 0.18 + (k / nk) * 0.84;
      const p = t < 0.5 ? base.clone().lerp(mil, t * 2) : mil.clone().lerp(sommet, (t - 0.5) * 2);
      const az = a + (r() - 0.5) * 2.6;
      const dir = dirAz(az, -0.2 - r() * 0.7 + (t > 0.9 ? 0.5 : 0));
      const L = 0.3 + r() * 0.14;
      F.carteVers(p, dir, L, L * 0.95, c, PLANCHE.bambou, r, { pli: 0.3 + r() * 0.25, teinte: 0.9 + r() * 0.35 });
    }
  }
}
// LE PALMIER DE CHINE en pot (photos 16, 17) : un stipe court et fibreux, des palmes en éventail sur de longs pétioles,
// les plus basses qui retombent (et quelques-unes sèches)
export function palmier(F, A, M, x, y, h0, r) {
  const pied = vMonde(x, h0, y), tete = vMonde(x + 0.02, h0 + 0.42, y);
  A.ajouter(tube(pied, tete, 0.1, 0.08, 8), M.stipe, new THREE.Matrix4());
  const c = vMonde(x, h0 + 0.7, y);
  const n = 22;
  for (let i = 0; i < n; i++) {
    const az = i / n * Math.PI * 2 * 1.618 + r() * 0.3;
    const basse = i < 8, elev = basse ? 0.0 + r() * 0.25 : 0.4 + r() * 0.65;
    const d = dirAz(az, elev), L = 0.5 + r() * 0.4;
    const b = tete.clone().add(V(0, -0.05 + r() * 0.08, 0));
    const e = b.clone().addScaledVector(d, L);
    A.ajouter(tube(b, e, 0.012, 0.007, 4), M.petiole, new THREE.Matrix4());
    // la palme continue le pétiole et retombe ; elle est large (0,8 m) et presque à plat
    const dp = d.clone().add(V(0, -0.25 - (basse ? 0.4 : 0), 0)).normalize();
    let s = new THREE.Vector3().crossVectors(dp, HAUT).normalize();
    s.applyAxisAngle(dp, (r() - 0.5) * 0.5);
    const seche = basse && r() < 0.35;
    F.carte(e, dp, s, 0.7 + r() * 0.18, 0.95, c, PLANCHE.palme, { pli: 0.35 + (basse ? 0.3 : 0), tc: seche ? [1.25, 0.95, 0.55] : [0.9 + r() * 0.2, 0.95 + r() * 0.15, 0.9] });
  }
  // les petites plantes au pied (photo 16 : une touffe de feuillage au bord du pot)
  for (let k = 0; k < 10; k++) {
    const az = r() * Math.PI * 2, b = vMonde(x + Math.cos(az) * 0.2, h0 + 0.02, y + Math.sin(az) * 0.2);
    F.carteVers(b, dirAz(az, 0.2 + r() * 0.5), 0.25, 0.25, vMonde(x, h0, y), PLANCHE.arbuste, r, { pli: 0.4 });
  }
}
// L'OLIVIER en jardinière (photos 08, 13) : un tronc mince et sinueux, quelques branches, un feuillage clairsemé
export function olivier(F, A, M, x, y, h0, H, r) {
  let p = vMonde(x, h0, y);
  const pts = [p];
  for (let k = 1; k <= 4; k++) { p = p.clone().add(V((r() - 0.5) * 0.08, H * 0.13, (r() - 0.5) * 0.08)); pts.push(p); }
  for (let k = 0; k < pts.length - 1; k++) A.ajouter(tube(pts[k], pts[k + 1], 0.035 - k * 0.005, 0.03 - k * 0.005, 6), M.ecorceClaire, new THREE.Matrix4());
  const c = vMonde(x, h0 + H * 0.72, y);
  for (let b = 0; b < 6; b++) {
    const az = r() * Math.PI * 2, base = pts[2 + Math.floor(r() * 3)];
    const fin = base.clone().add(dirAz(az, 0.9 + r() * 0.4).multiplyScalar(H * (0.3 + r() * 0.25)));
    A.ajouter(tube(base, fin, 0.014, 0.006, 4), M.ecorceClaire, new THREE.Matrix4());
    for (let k = 0; k < 6; k++) {
      const q = base.clone().lerp(fin, 0.35 + r() * 0.65);
      F.carteVers(q, dirAz(az + (r() - 0.5) * 2, -0.3 + r() * 0.9), 0.32 + r() * 0.1, 0.3, c, PLANCHE.olivier, r, { pli: 0.2, teinte: 0.9 + r() * 0.2 });
    }
  }
}
// LE CYPRÈS (photo 13) : un fuseau étroit et dense de rameaux en écailles
export function cypres(F, A, M, x, y, h0, H, R, r) {
  A.ajouter(tube(vMonde(x, h0, y), vMonde(x, h0 + H * 0.9, y), 0.03, 0.01, 5), M.ecorce, new THREE.Matrix4());
  const c = vMonde(x, h0 + H * 0.5, y);
  // un fuseau : le rayon gonfle au premier tiers et s'effile en pointe ; des rameaux courts, serrés, qui montent un peu
  const n = TELEPHONE ? 90 : 130;
  for (let k = 0; k < n; k++) {
    const t = Math.pow(r(), 0.85), h = h0 + 0.04 + t * H;
    const rad = R * Math.sin(Math.PI * Math.min(1, 0.12 + t * 0.92)) * (0.55 + 0.45 * (1 - t)) + 0.03;
    const az = r() * Math.PI * 2, b = vMonde(x + Math.cos(az) * rad * 0.35, h, y + Math.sin(az) * rad * 0.35);
    const L = 0.16 + rad * 0.55 + r() * 0.06;
    F.carteVers(b, dirAz(az, 0.35 + r() * 0.6), L, L * 0.85, c, PLANCHE.thuya, r, { pli: -0.05, teinte: 0.8 + r() * 0.3 });
  }
}
// UN ARBUSTE en boule (rayon R, haut de H au-dessus de h0) dans la planche voulue
export function arbuste(F, A, M, x, y, h0, R, H, planche, r, n = 40) {
  const c = vMonde(x, h0 + H * 0.5, y);
  for (let k = 0; k < 4; k++) {
    const az = r() * 6.3;
    A.ajouter(tube(vMonde(x, h0, y), vMonde(x + Math.cos(az) * R * 0.5, h0 + H * 0.6, y + Math.sin(az) * R * 0.5), 0.012, 0.006, 4), M.ecorce, new THREE.Matrix4(), false);
  }
  for (let k = 0; k < n; k++) {
    const az = r() * Math.PI * 2, el = Math.acos(1 - r() * 1.6) * 0.9;
    const rad = R * (0.35 + r() * 0.4);
    const b = vMonde(x + Math.cos(az) * Math.sin(el) * rad * 0.6, h0 + H * 0.25 + Math.cos(el) * H * 0.6 * (0.4 + r() * 0.6), y + Math.sin(az) * Math.sin(el) * rad * 0.6);
    F.carteVers(b, dirAz(az, 0.5 - r() * 1.1), R * (0.75 + r() * 0.4), R * (0.7 + r() * 0.3), c, planche, r, { pli: 0.3, teinte: 0.8 + r() * 0.35 });
  }
}
// UN ARBRE (le jardin d'en face, derrière l'impasse) : tronc, charpentières, une couronne de touffes. `ombre` : porte une
// ombre (seulement près de l'école, là où la carte d'ombre couvre)
export function arbre(F, A, M, x, y, H, R, r, { tronc = 0.22, n = 160, hFut = 0.38, planche = PLANCHE.arbre, applati = 0.85 } = {}) {
  const pied = vMonde(x, 0, y), fut = vMonde(x + (r() - 0.5) * 0.3, H * hFut, y + (r() - 0.5) * 0.3);
  A.ajouter(tube(pied, fut, tronc, tronc * 0.8, 8), M.ecorce, new THREE.Matrix4(), false);
  const c = vMonde(x, H - R * applati, y);
  for (let b = 0; b < 5; b++) {
    const az = b / 5 * Math.PI * 2 + r() * 0.6, fin = c.clone().add(dirAz(az, 0.5 + r() * 0.5).multiplyScalar(R * 0.6));
    A.ajouter(tube(fut, fin, tronc * 0.55, tronc * 0.2, 5), M.ecorce, new THREE.Matrix4(), false);
  }
  for (let k = 0; k < n; k++) {
    const az = r() * Math.PI * 2, el = Math.acos(1 - r() * 1.85);
    const d = Math.pow(r(), 0.35);
    const b = c.clone().add(V(Math.cos(az) * Math.sin(el) * R * d, Math.cos(el) * R * applati * d, -Math.sin(az) * Math.sin(el) * R * d));
    const dir = b.clone().sub(c).normalize().add(V((r() - 0.5) * 0.8, -0.2, (r() - 0.5) * 0.8)).normalize();
    const L = 1.1 + r() * 0.8;
    F.carteVers(b.addScaledVector(dir, -L * 0.45), dir, L, L, c, planche, r, { pli: 0.1, teinte: 0.75 + r() * 0.4 });
  }
}

// =====================================================================
//  LES CONTENANTS
// =====================================================================
// LA GRANDE JARDINIÈRE DE ZINC (photos 08, 13, 17) : caisson à bord replié, terre 6 cm sous le bord
export function jardiniere(ch, A, M, x, y, lx, ly, h) {
  const b = pose(x, y);
  A.ajouter(new THREE.BoxGeometry(lx, h - 0.05, ly), M.zinc, dans(b, 0, (h - 0.05) / 2, 0));
  for (const [w, d, ox, oz] of [[lx + 0.012, 0.03, 0, ly / 2 - 0.009], [lx + 0.012, 0.03, 0, -ly / 2 + 0.009], [0.03, ly, lx / 2 - 0.009, 0], [0.03, ly, -lx / 2 + 0.009, 0]])
    A.ajouter(new THREE.BoxGeometry(w, 0.05, d), M.zinc, dans(b, ox, h - 0.025, oz));
  A.ajouter(new THREE.BoxGeometry(lx - 0.05, 0.01, ly - 0.05), M.terre, dans(b, 0, h - 0.06, 0), false);
  ch.C.ajouterBoite(x - lx / 2, -(y + ly / 2), x + lx / 2, -(y - ly / 2), { y1: h, camera: false });
  return h - 0.055;
}
// LE POT ROND (anthracite, terre cuite, gris) : un profil tourné, lèvre en haut, terre 5 cm sous le bord
// (`sol` : la hauteur où il est posé — la chaussée est 12 cm sous le trottoir ; rend la hauteur de la terre)
export function potRond(ch, A, M, x, y, rH, rB, h, mat, { collision = true, sol = 0 } = {}) {
  const pts = [V(0, 0, 0), V(rB, 0, 0), V(rB + 0.004, 0.02, 0), V(rH, h - 0.04, 0), V(rH + 0.018, h - 0.035, 0), V(rH + 0.018, h, 0), V(rH - 0.012, h, 0), V(rH - 0.02, h - 0.05, 0), V(0, h - 0.05, 0)]
    .map((p) => new THREE.Vector2(p.x, p.y));
  A.ajouter(new THREE.LatheGeometry(pts, 20), mat, pose(x, y, sol));
  A.ajouter(new THREE.CircleGeometry(rH - 0.02, 16).rotateX(-Math.PI / 2), M.terre, pose(x, y, sol + h - 0.045), false);
  if (collision) ch.C.ajouterCercle(x, -y, rH + 0.02, { y0: sol, y1: sol + h, camera: false });
  return sol + h - 0.045;
}
// LE POT CARRÉ évasé (gris clair, anthracite : l'impasse, photo 09)
export function potCarre(ch, A, M, x, y, c, h, mat, { a = 0, sol = 0 } = {}) {
  const b = pose(x, y, sol, a);
  A.ajouter(boiteEvasee(c, h, c, 0.8), mat, dans(b, 0, h / 2, 0));
  A.ajouter(new THREE.BoxGeometry(c - 0.04, 0.01, c - 0.04), M.terre, dans(b, 0, h - 0.04, 0), false);
  ch.C.ajouterBoite(x - c / 2, -(y + c / 2), x + c / 2, -(y - c / 2), { y0: sol, y1: sol + h, camera: false });
  return sol + h - 0.04;
}
// LA LONGUE JARDINIÈRE DE TERRE CUITE (n° 8, photos 09, 10)
export function jardiniereTerre(ch, A, M, x, y, lx, ly, h) {
  const b = pose(x, y);
  A.ajouter(boiteEvasee(lx, h, ly, 0.86), M.terreCuite, dans(b, 0, h / 2, 0));
  A.ajouter(new THREE.BoxGeometry(lx + 0.03, 0.035, ly + 0.03), M.terreCuite, dans(b, 0, h - 0.018, 0));
  A.ajouter(new THREE.BoxGeometry(lx - 0.05, 0.01, ly - 0.05), M.terre, dans(b, 0, h + 0.001, 0), false);
  ch.C.ajouterBoite(x - lx / 2, -(y + ly / 2), x + lx / 2, -(y - ly / 2), { y1: h, camera: false });
  return h;
}

// =====================================================================
//  LES TOTEMS « iris » (photos 08, 10, 13, 18)
// =====================================================================
const TOTEM = { l: 0.7, h: 2.6, ep: 0.09 };
const POLICE_LOGO = '"Century Gothic", "Futura", "Avenir Next", "Questrial", "Trebuchet MS", sans-serif';
// les continents (longitude, latitude), assez pour la carte stylisée de la photo 08 (Europe, Afrique, Proche-Orient)
const CONTINENTS = [
  [[-17, 21], [-16, 12], [-8, 4.5], [5, 4], [9, 4], [10, -1], [13, -6], [12, -17], [15, -27], [20, -35], [26, -34], [33, -27], [36, -18], [40, -10], [40, -2], [44, 2], [51, 11], [43, 12], [37, 20], [33, 31], [25, 32], [20, 31], [10, 37], [0, 36], [-6, 35], [-10, 30], [-13, 27]],
  [[-9, 37], [-9, 43], [-2, 43.5], [-4, 48], [-1, 49.5], [2, 51], [5, 53], [8, 54], [8, 57], [11, 57.5], [12, 56], [14, 55], [19, 55], [21, 57], [24, 59.5], [29, 60], [30, 64], [34, 69], [44, 68], [60, 70], [60, 45], [48, 42], [41, 41], [36, 36], [28, 36], [26, 40], [23, 40], [23, 37], [21, 38], [19, 40], [18, 42], [13, 45], [12, 44], [16, 41], [18, 40], [16, 38], [12, 38], [14, 42], [10, 44], [8, 44], [4, 43], [3, 42], [-1, 37], [-5, 36]],
  [[5, 58], [5, 62], [10, 64], [14, 68], [18, 70], [25, 71], [28, 70], [29, 69], [24, 66], [22, 65.5], [18, 63], [19, 60], [17, 58], [12, 56], [10, 58], [7, 58]],
  [[-5, 50], [-3, 51], [1, 51], [1.7, 52.7], [0, 53.5], [-2, 55.5], [-3, 58.5], [-5, 58.5], [-6, 56.5], [-5, 55], [-3, 54], [-4.5, 53], [-4.3, 51.7]],
  [[36, 36], [36, 32], [34, 28], [39, 22], [43, 13], [45, 13], [52, 16], [56, 18], [59, 22], [56, 25], [51, 24], [48, 30], [44, 37]],
  [[43, -12], [50, -15], [49, -25], [44, -24]],
];
function texTotem(face) {
  const W = 512, H = Math.round(W * TOTEM.h / TOTEM.l);
  return canvasTex(W, H, (g) => {
    const haut = Math.round(H * 0.33);
    // le panneau haut, gris clair, et la partie noire
    g.fillStyle = '#d6d7d4'; g.fillRect(0, 0, W, haut);
    g.fillStyle = '#0f1011'; g.fillRect(0, haut, W, H - haut);
    const logo = (x, y, w, h, taille, jaune) => {
      g.fillStyle = '#3d3e40'; g.fillRect(x, y, w, h);
      if (jaune) { g.fillStyle = '#f2b705'; g.fillRect(x - w * 0.02, y - h * 0.05, w * 0.07, h * 0.16); }
      g.fillStyle = '#ffffff'; g.font = `700 ${taille}px ${POLICE_LOGO}`; g.textBaseline = 'middle'; g.textAlign = 'center';
      g.fillText('iris', x + w / 2, y + h * 0.53);
    };
    if (face === 'ouest') {
      logo(30, 60, W - 60, 200, 210, false);
      g.fillStyle = '#121212'; g.font = '700 38px "Arial Narrow", "Roboto Condensed", Arial, sans-serif'; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
      ['INSTITUT SUPÉRIEUR', 'DE RESSOURCES', 'INFORMATIQUES'].forEach((t, i) => g.fillText(t, 32, 330 + i * 52));
      // LA CARTE DU MONDE : un globe vu au-dessus de l'Afrique, en trame grise ; les traces du circuit imprimé
      const R = W * 0.95, cx = W * 0.62, cy = H * 0.86, l0 = 18 * Math.PI / 180, p0 = 18 * Math.PI / 180;
      const proj = ([lo, la]) => {
        const a = lo * Math.PI / 180 - l0, b = la * Math.PI / 180;
        return [cx + R * Math.cos(b) * Math.sin(a), cy - R * (Math.cos(p0) * Math.sin(b) - Math.sin(p0) * Math.cos(b) * Math.cos(a))];
      };
      g.save(); g.beginPath(); g.rect(0, haut + 4, W, H - haut); g.clip();
      g.strokeStyle = 'rgba(150,152,156,0.35)'; g.lineWidth = 2;
      for (let la = -60; la <= 75; la += 15) { g.beginPath(); for (let lo = -60; lo <= 100; lo += 4) { const [x, y] = proj([lo, la]); lo === -60 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); }
      for (const poly of CONTINENTS) {
        g.beginPath(); poly.forEach((p, i) => { const [x, y] = proj(p); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath();
        g.fillStyle = '#7d8084'; g.fill();
        g.save(); g.clip();
        g.fillStyle = 'rgba(30,31,33,0.55)';
        for (let y = haut; y < H; y += 9) for (let x = (y / 9) % 2 ? 0 : 4.5; x < W; x += 9) { g.beginPath(); g.arc(x, y, 1.7, 0, 7); g.fill(); }
        g.restore();
        g.strokeStyle = '#b9bcbf'; g.lineWidth = 2.2; g.stroke();
      }
      // les traces : des lignes horizontales venues du bord droit, un coude à 45°, une pastille au bout
      const r = alea(12);
      g.strokeStyle = '#c4c7ca'; g.fillStyle = '#0f1011'; g.lineWidth = 2.4;
      for (let k = 0; k < 22; k++) {
        const y = haut + 260 + r() * (H - haut - 320), x1 = W * (0.15 + r() * 0.55), cou = 20 + r() * 50, s = r() < 0.5 ? -1 : 1;
        g.beginPath(); g.moveTo(W + 5, y); g.lineTo(x1 + cou, y); g.lineTo(x1, y + s * cou); g.stroke();
        g.beginPath(); g.arc(x1, y + s * cou, 6, 0, 7); g.fill(); g.stroke();
      }
      g.restore();
    } else {
      // la face EST du totem du passage (photo 18) : petit logo centré à coin jaune, « Entrée des étudiants », trame de points
      logo(90, 70, W - 180, 150, 150, true);
      g.fillStyle = '#2a2a2a'; g.font = '700 22px Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
      ['INSTITUT SUPÉRIEUR', 'DE RESSOURCES', 'INFORMATIQUES'].forEach((t, i) => g.fillText(t, W / 2, 262 + i * 28));
      g.fillStyle = '#6f7174';
      for (let y = haut + 180; y < H - 40; y += 34) for (let x = 22; x < W - 20; x += 34) g.fillRect(x, y, 19, 19);
      g.fillStyle = '#e8b51c'; g.font = '700 64px "Century Gothic", Arial, sans-serif'; g.textAlign = 'left';
      g.fillText('Entrée', 40, haut + 90); g.fillText('des étudiants', 40, haut + 160);
    }
  }, null, false, 8);
}
let _totemMats = null;
// `a` : le cap du totem (0 : ses faces regardent l'ouest et l'est). Celui du passage est tourné de 20° vers la rue : sa face
// « INSTITUT » se lit en arrivant de l'ouest (photo 08) comme du trottoir d'en face (photo 10), et sa face « Entrée des
// étudiants » depuis la porte 6 (photo 18).
export function totem(ch, A, M, x, y, faceEst = 'ouest', a = 0) {
  if (!_totemMats) {
    const mk = (f) => jourDehors(new THREE.MeshStandardMaterial({ map: texTotem(f), roughness: 0.45 }), 0.1);
    _totemMats = { ouest: mk('ouest'), est: mk('est') };
  }
  const { l, h, ep } = TOTEM, b = pose(x, y, 0, a);
  A.ajouter(new THREE.BoxGeometry(ep, h, l), M.noirMat, dans(b, 0, h / 2 + 0.02, 0));
  // les deux faces imprimées (l'ouest regarde -x, l'est +x ; aucune n'est vue en miroir)
  A.ajouter(new THREE.PlaneGeometry(l - 0.02, h - 0.04), _totemMats.ouest, dans(b, -ep / 2 - 0.002, h / 2 + 0.02, 0, 0, -Math.PI / 2));
  A.ajouter(new THREE.PlaneGeometry(l - 0.02, h - 0.04), _totemMats[faceEst], dans(b, ep / 2 + 0.002, h / 2 + 0.02, 0, 0, Math.PI / 2));
  // les montants d'aluminium, le socle
  for (const s of [-1, 1]) A.ajouter(new THREE.BoxGeometry(ep + 0.02, h + 0.04, 0.03), M.alu, dans(b, 0, h / 2 + 0.02, s * (l / 2 + 0.012)));
  A.ajouter(new THREE.BoxGeometry(ep + 0.08, 0.02, l + 0.12), M.alu, dans(b, 0, 0.01, 0));
  ch.C.ajouterBoiteOrientee(x, -y, 0.07, l / 2 + 0.03, -a, { y1: h });
}

// =====================================================================
//  LES BANCS NOIRS À LATTES (photos 08, 13, 14) — on s'y assoit
// =====================================================================
// Repère du banc : x le long du banc, l'assis regarde +z (le dossier est en -z). `a` : le cap du banc dans le plan, de
// sorte que +z local regarde la rue (sud du plan) quand a = 0.
export function banc(ch, A, M, x, y, L = 1.25, a = 0, { lattesDos = 4, nom = 'le banc' } = {}) {
  const b = pose(x, y, 0, a), m = M.noirBanc;
  for (const s of [-1, 1]) {
    const ex = s * (L / 2 - 0.05);
    A.ajouter(new THREE.BoxGeometry(0.035, 0.44, 0.03), m, dans(b, ex, 0.22, 0.2));                       // pied avant
    A.ajouter(new THREE.BoxGeometry(0.035, 0.86, 0.03), m, dans(b, ex, 0.43, -0.2, -0.12, 0, 0));         // pied arrière -> dossier
    A.ajouter(new THREE.BoxGeometry(0.035, 0.03, 0.48), m, dans(b, ex, 0.43, 0.0));                        // traverse d'assise
    A.ajouter(new THREE.BoxGeometry(0.04, 0.025, 0.46), m, dans(b, s * (L / 2 - 0.03), 0.66, 0.02, 0.08, 0, 0));   // accoudoir
    A.ajouter(new THREE.BoxGeometry(0.03, 0.24, 0.03), m, dans(b, s * (L / 2 - 0.03), 0.55, 0.22));        // montant d'accoudoir
  }
  A.ajouter(new THREE.BoxGeometry(L - 0.1, 0.02, 0.02), m, dans(b, 0, 0.12, 0));
  // les lattes de l'assise (6) et du dossier, un peu renversé
  for (let k = 0; k < 6; k++) A.ajouter(new THREE.BoxGeometry(L - 0.06, 0.018, 0.048), m, dans(b, 0, 0.45 - (k === 5 ? 0.012 : 0), -0.17 + k * 0.067));
  for (let k = 0; k < lattesDos; k++) {
    const hk = 0.56 + k * (0.27 / (lattesDos - 1));
    A.ajouter(new THREE.BoxGeometry(L - 0.06, 0.05, 0.016), m, dans(b, 0, hk, -0.215 - (hk - 0.45) * 0.12, -0.12, 0, 0));
  }
  // le monde solide (le joueur s'y arrête ; la caméra passe), et les DEUX PLACES
  ch.C.ajouterBoiteOrientee(x, -y, L / 2 + 0.02, 0.27, -a, { y1: 0.86, camera: false });
  const fx = -Math.sin(a), fz = Math.cos(a), ux = Math.cos(a), uz = -Math.sin(a);       // +z local et +x local, en monde
  for (const s of [-1, 1]) {
    const px = x + ux * s * L * 0.24, pz = -y + uz * s * L * 0.24;
    ch.sieges.push({ x: px + fx * 0.03, z: pz + fz * 0.03, y: 0.46, fx, fz, sx: px + fx * 0.72, sz: pz + fz * 0.72, nom });
  }
}

// =====================================================================
//  LES CORBEILLES ET LES BACS
// =====================================================================
// LA CORBEILLE NOIRE À SAC (photos 08, 13, 17) et LE CENDRIER sur pied
export function corbeille(ch, A, M, x, y) {
  const b = pose(x, y);
  A.ajouter(new THREE.CylinderGeometry(0.205, 0.19, 0.6, 20), M.noirBanc, dans(b, 0, 0.3, 0));
  A.ajouter(new THREE.CylinderGeometry(0.222, 0.214, 0.13, 20, 1, true), M.sac, dans(b, 0, 0.56, 0));
  A.ajouter(new THREE.TorusGeometry(0.214, 0.018, 6, 24).rotateX(Math.PI / 2), M.sac, dans(b, 0, 0.615, 0));
  A.ajouter(new THREE.CircleGeometry(0.2, 16).rotateX(-Math.PI / 2), M.sac, dans(b, 0, 0.602, 0));
  ch.C.ajouterCercle(x, -y, 0.24, { y1: 0.65, camera: false });
}
export function cendrier(ch, A, M, x, y) {
  const b = pose(x, y);
  A.ajouter(new THREE.CylinderGeometry(0.1, 0.1, 0.84, 18), M.noirBanc, dans(b, 0, 0.42, 0));
  A.ajouter(new THREE.SphereGeometry(0.1, 18, 6, 0, Math.PI * 2, 0, Math.PI / 2), M.noirBanc, dans(b, 0, 0.84, 0));
  A.ajouter(new THREE.BoxGeometry(0.09, 0.025, 0.01), M.sac, dans(b, 0, 0.78, 0.097));
  A.ajouter(new THREE.CylinderGeometry(0.13, 0.13, 0.015, 18), M.noirBanc, dans(b, 0, 0.008, 0));
  ch.C.ajouterCercle(x, -y, 0.12, { y1: 0.95, camera: false });
}
// LE BAC ROULANT (photo 10 : gris, couvercle sombre ; photo 09 : le vert de l'impasse). Repère : l'avant regarde +z,
// les roues et la poignée sont derrière.
export function bacRoulant(ch, A, M, x, y, a, corps, couvercle, { l = 0.6, p = 0.74, h = 0.98, sol = 0 } = {}) {
  const b = pose(x, y, sol, a);
  A.ajouter(boiteEvasee(l, h - 0.08, p, 0.86), corps, dans(b, 0, (h - 0.08) / 2 + 0.06, 0));
  A.ajouter(new THREE.BoxGeometry(l + 0.04, 0.045, p + 0.06), couvercle, dans(b, 0, h, 0.01));
  A.ajouter(new THREE.BoxGeometry(l + 0.02, 0.05, 0.04), corps, dans(b, 0, h - 0.05, p / 2 + 0.02));
  A.ajouter(tube(V(-l / 2, h - 0.06, -p / 2 - 0.05), V(l / 2, h - 0.06, -p / 2 - 0.05), 0.016, 0.016, 6), couvercle, b);
  for (const s of [-1, 1]) {
    A.ajouter(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 14).rotateZ(Math.PI / 2), M.caoutchouc, dans(b, s * (l / 2 - 0.02), 0.1, -p / 2 + 0.02));
    A.ajouter(new THREE.BoxGeometry(0.03, h * 0.55, 0.03), corps, dans(b, s * (l / 2 - 0.07), h * 0.45, p / 2 * 0.9 + 0.01));
  }
  ch.C.ajouterBoiteOrientee(x, -y, l / 2 + 0.03, p / 2 + 0.08, -a, { y0: sol, y1: sol + h + 0.03, camera: false });
}

// =====================================================================
//  LES DEUX-ROUES
// =====================================================================
// LE VÉLO (photos 15, 16) : roue de 0,68 m, cadre en tubes, rayons découpés. Repère : l'avant en +x, l'axe des roues en
// z. `penche` : l'inclinaison quand il s'appuie (radians, autour de x). `style` : 'route' (cintre) ou 'ville'.
export function velo(A, M, x, y, a, cadre, { penche = 0, style = 'ville', h = 0 } = {}) {
  const b = pose(x, y, h, a).multiply(new THREE.Matrix4().makeRotationX(penche));
  const R = V(-0.51, 0.34, 0), Fr = V(0.51, 0.34, 0), BB = V(-0.06, 0.29, 0), ST = V(-0.2, 0.84, 0), HB = V(0.37, 0.62, 0), HT = V(0.34, 0.8, 0);
  for (const [p, q, r] of [[BB, HB, 0.018], [ST, HT, 0.015], [BB, ST, 0.016], [HB, HT, 0.02]]) A.ajouter(tube(p, q, r, r, 6), cadre, b, false);
  for (const z of [-0.055, 0.055]) {
    A.ajouter(tube(BB, V(R.x, R.y, z), 0.01, 0.009, 5), cadre, b, false);
    A.ajouter(tube(ST, V(R.x, R.y, z), 0.009, 0.008, 5), cadre, b, false);
    A.ajouter(tube(HB, V(Fr.x, Fr.y, z), 0.012, 0.009, 5), cadre, b, false);
  }
  for (const c of [R, Fr]) {
    A.ajouter(new THREE.TorusGeometry(0.325, 0.017, 6, 30), M.caoutchouc, dans(b, c.x, c.y, 0), false);
    A.ajouter(new THREE.TorusGeometry(0.302, 0.008, 4, 30), M.alu, dans(b, c.x, c.y, 0), false);
    A.ajouter(new THREE.CircleGeometry(0.3, 20), M.rayons, dans(b, c.x, c.y, 0), false);
    A.ajouter(new THREE.CylinderGeometry(0.02, 0.02, 0.1, 8).rotateX(Math.PI / 2), M.alu, dans(b, c.x, c.y, 0), false);
  }
  // selle, tige de selle, potence, guidon, pédalier
  A.ajouter(tube(ST, V(-0.23, 0.95, 0), 0.012, 0.012, 6), M.alu, b, false);
  A.ajouter(new RoundedBoxGeometry(0.26, 0.05, 0.13, 2, 0.02), M.selle, dans(b, -0.22, 0.975, 0), false);
  A.ajouter(tube(HT, V(0.4, 0.93, 0), 0.013, 0.013, 6), M.alu, b, false);
  if (style === 'route') {
    A.ajouter(tube(V(0.42, 0.93, -0.21), V(0.42, 0.93, 0.21), 0.012, 0.012, 6), M.noirMat, b, false);
    for (const z of [-0.2, 0.2]) A.ajouter(tube(V(0.42, 0.93, z), V(0.52, 0.84, z), 0.012, 0.012, 5), M.noirMat, b, false);
  } else {
    A.ajouter(tube(V(0.38, 0.95, -0.3), V(0.38, 0.95, 0.3), 0.012, 0.012, 6), M.noirMat, b, false);
    A.ajouter(new THREE.TorusGeometry(0.35, 0.012, 4, 14, Math.PI * 0.6).rotateZ(Math.PI * 0.2), cadre, dans(b, R.x, R.y, 0), false);   // garde-boue
  }
  A.ajouter(new THREE.CylinderGeometry(0.1, 0.1, 0.008, 18).rotateX(Math.PI / 2), M.grisMoteur, dans(b, BB.x, BB.y, 0.07), false);
  for (const s of [-1, 1]) A.ajouter(new THREE.BoxGeometry(0.03, 0.17, 0.015), M.grisMoteur, dans(b, BB.x + s * 0.03, BB.y - s * 0.07, s * 0.08, 0, 0, s * 0.4), false);
}
// LA TROTTINETTE ÉLECTRIQUE (photos 13, 15) : plateau, colonne, guidon, petites roues pleines
export function trottinette(A, M, x, y, a, { penche = 0, couchee = false, sol = 0 } = {}) {
  let b = pose(x, y, sol, a);
  if (couchee) b = b.multiply(dans(new THREE.Matrix4(), 0, 0.03, 0, Math.PI / 2 - 0.08, 0, 0));
  else b = b.multiply(new THREE.Matrix4().makeRotationX(penche));
  A.ajouter(new THREE.BoxGeometry(0.56, 0.05, 0.15), M.noirMat, dans(b, 0, 0.11, 0), false);
  A.ajouter(new THREE.BoxGeometry(0.2, 0.02, 0.13), M.grisMoteur, dans(b, -0.32, 0.17, 0, 0, 0, 0.3), false);
  A.ajouter(tube(V(0.3, 0.12, 0), V(0.38, 1.08, 0), 0.02, 0.018, 6), M.noirMat, b, false);
  A.ajouter(tube(V(0.38, 1.08, -0.24), V(0.38, 1.08, 0.24), 0.014, 0.014, 6), M.noirMat, b, false);
  for (const z of [-0.26, 0.26]) A.ajouter(tube(V(0.38, 1.08, z * 0.85), V(0.38, 1.08, z), 0.02, 0.02, 6), M.caoutchouc, b, false);
  for (const xr of [-0.33, 0.32]) {
    A.ajouter(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 16).rotateX(Math.PI / 2), M.caoutchouc, dans(b, xr, 0.1, 0), false);
    A.ajouter(new THREE.CylinderGeometry(0.05, 0.05, 0.055, 10).rotateX(Math.PI / 2), M.alu, dans(b, xr, 0.1, 0), false);
  }
}
// LA MOTO (photos 15, 16) : 'routiere' (la noire du n° 4 : demi-carénage, bulle, top-case), 'roadster' (la rouge,
// phare rond, échappements chromés), 'scooter' (le gros scooter noir : roues de 14 pouces, tablier, selle haute).
// Des volumes LISSES (sphères et boîtes arrondies étirées), des pneus de vraie section. Repère : l'avant en +x, la
// moto penche sur sa béquille, à gauche (-z).
const _boule = new THREE.SphereGeometry(1, 16, 10);
export function moto(ch, A, M, x, y, a, type, corps, { penche = -0.1, sol = 0 } = {}) {
  const b = pose(x, y, sol, a).multiply(new THREE.Matrix4().makeRotationX(penche));
  const sc = type === 'scooter';
  const R = sc ? 0.2 : 0.255, r0 = sc ? 0.062 : 0.058, h = R + r0, af = sc ? 0.74 : 0.72, ar = sc ? -0.8 : -0.73;
  const boule = (mat, px, py, pz, sx, sy, sz, rz = 0, ombre = false) => A.ajouter(_boule, mat, dans(b, px, py, pz, 0, 0, rz, V(sx, sy, sz)), ombre);
  // les roues : pneu (tore élargi), jante, moyeu ; le disque de frein devant
  for (const ax of [af, ar]) {
    A.ajouter(new THREE.TorusGeometry(R, r0, 10, 30).scale(1, 1, 1.3), M.caoutchouc, dans(b, ax, h, 0), false);
    A.ajouter(new THREE.CylinderGeometry(R - 0.03, R - 0.03, 0.04, 22).rotateX(Math.PI / 2), M.noirBrillant, dans(b, ax, h, 0), false);
    A.ajouter(new THREE.CylinderGeometry(0.045, 0.045, 0.1, 10).rotateX(Math.PI / 2), M.grisMoteur, dans(b, ax, h, 0), false);
  }
  A.ajouter(new THREE.CylinderGeometry(R * 0.62, R * 0.62, 0.006, 20).rotateX(Math.PI / 2), M.chrome, dans(b, af, h, -0.07), false);
  if (!sc) {
    // la fourche, le cadre, le moteur, le bras oscillant, l'échappement
    for (const z of [-0.08, 0.08]) A.ajouter(tube(V(af, h, z), V(af - 0.24, h + 0.66, z), 0.024, 0.028, 8), type === 'roadster' ? M.chrome : M.noirMat, b, false);
    for (const z of [-0.11, 0.11]) {
      A.ajouter(tube(V(0.48, 0.98, z * 0.6), V(-0.18, 0.74, z), 0.022, 0.022, 6), M.grisMoteur, b, false);
      A.ajouter(tube(V(-0.12, 0.42, z), V(ar, h, z * 0.9), 0.03, 0.022, 6), M.grisMoteur, b, false);
    }
    A.ajouter(new RoundedBoxGeometry(0.44, 0.34, 0.27, 2, 0.05), M.grisMoteur, dans(b, 0.06, 0.45, 0), false);
    A.ajouter(new RoundedBoxGeometry(0.2, 0.16, 0.34, 2, 0.04), M.grisMoteur, dans(b, 0.2, 0.66, 0, 0, 0, -0.35), false);
    A.ajouter(tube(V(0.12, 0.3, 0.13), V(-0.42, 0.42, 0.17), 0.035, 0.035, 8), type === 'roadster' ? M.chrome : M.noirMat, b, false);
    A.ajouter(tube(V(-0.42, 0.42, 0.17), V(-0.78, 0.6, 0.18), 0.06, 0.05, 10), type === 'roadster' ? M.chrome : M.noirMat, b, false);
    // le réservoir, les écopes, la selle, la coque arrière, le garde-boue
    boule(corps, 0.2, 0.9, 0, 0.3, 0.15, 0.19, -0.12);
    for (const z of [-0.13, 0.13]) boule(corps, 0.34, 0.74, z, 0.2, 0.15, 0.05, -0.3);
    A.ajouter(new RoundedBoxGeometry(0.62, 0.08, 0.28, 2, 0.035), M.selle, dans(b, -0.3, 0.88, 0, 0, 0, 0.07), false);
    boule(corps, -0.66, 0.92, 0, 0.32, 0.075, 0.12, 0.16);
    A.ajouter(new THREE.BoxGeometry(0.22, 0.012, 0.16), M.noirMat, dans(b, -0.86, 0.78, 0, 0, 0, -0.7), false);
    // le guidon, les rétroviseurs, le phare
    A.ajouter(tube(V(0.47, 1.07, -0.36), V(0.47, 1.07, 0.36), 0.012, 0.012, 6), M.noirMat, b, false);
    for (const z of [-0.3, 0.3]) { A.ajouter(tube(V(0.47, 1.07, z * 0.8), V(0.45, 1.27, z), 0.006, 0.006, 4), M.noirMat, b, false); boule(M.noirBrillant, 0.45, 1.29, z * 1.05, 0.03, 0.05, 0.075); }
    if (type === 'routiere') {
      // le demi-carénage autour du phare, la bulle fumée, le top-case
      boule(corps, 0.6, 1.0, 0, 0.26, 0.22, 0.25, -0.35);
      A.ajouter(new THREE.BoxGeometry(0.02, 0.34, 0.34), M.vitreFumee, dans(b, 0.55, 1.26, 0, 0, 0, -0.55), false);
      A.ajouter(new RoundedBoxGeometry(0.42, 0.3, 0.38, 3, 0.08), M.noirBrillant, dans(b, -0.84, 1.1, 0), false);
      A.ajouter(new THREE.BoxGeometry(0.42, 0.03, 0.26), M.noirMat, dans(b, -0.8, 0.95, 0, 0, 0, 0.12), false);
      boule(corps, -0.55, 0.9, 0, 0.36, 0.09, 0.14, 0.14);
    } else {
      A.ajouter(new THREE.CylinderGeometry(0.085, 0.07, 0.09, 16).rotateZ(Math.PI / 2), M.chrome, dans(b, 0.58, 0.98, 0), false);
    }
  } else {
    // le scooter : la fourche courte, le tablier, le nez, le tunnel, la coque arrière, la selle, la bulle
    for (const z of [-0.07, 0.07]) A.ajouter(tube(V(af, h, z), V(af - 0.2, h + 0.45, z), 0.022, 0.026, 6), M.noirMat, b, false);
    boule(corps, 0.48, 0.74, 0, 0.11, 0.36, 0.19, -0.35);
    boule(corps, 0.6, 0.98, 0, 0.2, 0.13, 0.18, -0.25);
    A.ajouter(new THREE.BoxGeometry(0.5, 0.05, 0.36), M.noirMat, dans(b, 0.1, 0.4, 0), false);
    boule(corps, 0.06, 0.5, 0, 0.28, 0.1, 0.09);
    boule(corps, -0.42, 0.62, 0, 0.5, 0.2, 0.17, 0.08);
    boule(corps, -0.78, 0.74, 0, 0.2, 0.09, 0.13, 0.3);
    A.ajouter(new RoundedBoxGeometry(0.7, 0.08, 0.28, 2, 0.035), M.selle, dans(b, -0.36, 0.84, 0, 0, 0, 0.06), false);
    A.ajouter(new THREE.BoxGeometry(0.015, 0.26, 0.32), M.vitreFumee, dans(b, 0.58, 1.18, 0, 0, 0, -0.45), false);
    A.ajouter(tube(V(0.44, 1.06, -0.34), V(0.44, 1.06, 0.34), 0.013, 0.013, 6), M.noirMat, b, false);
    A.ajouter(tube(V(-0.35, 0.32, 0.16), V(-0.9, 0.4, 0.17), 0.05, 0.045, 10), M.grisMoteur, b, false);
  }
  ch.C.ajouterBoiteOrientee(x, -y, 1.05, 0.33, -a, { y0: sol, y1: sol + 1.2, camera: false });
}
// LA STATION DE RÉPARATION orange (photos 15, 16) et SES ARCEAUX BLANCS
export function stationVelo(ch, A, M, x, y, a, h0 = 0) {
  const b = pose(x, y, h0, a);
  A.ajouter(new RoundedBoxGeometry(0.42, 1.06, 0.3, 2, 0.03), M.orange, dans(b, 0, 0.53, 0));
  A.ajouter(new THREE.BoxGeometry(0.3, 0.12, 0.31), M.noirMat, dans(b, 0, 0.92, 0.0));
  A.ajouter(new THREE.BoxGeometry(0.16, 0.1, 0.06), M.alu, dans(b, 0.08, 1.11, 0.0, 0, 0, -0.25));
  A.ajouter(tube(V(0.22, 0.85, 0), V(0.36, 0.95, 0), 0.008, 0.008, 5), M.alu, b);
  A.ajouter(new THREE.TorusGeometry(0.1, 0.008, 4, 12, Math.PI * 1.4), M.noirMat, dans(b, -0.21, 0.6, 0.0, 0, Math.PI / 2, 0));
  ch.C.ajouterBoiteOrientee(x, -y, 0.24, 0.17, -a, { y0: h0, y1: h0 + 1.1, camera: false });
}
export function arceau(ch, A, M, x, y, a, h0 = 0) {
  const b = pose(x, y, h0, a);
  const ch2 = new THREE.CatmullRomCurve3([V(-0.4, 0, 0), V(-0.4, 0.62, 0), V(-0.34, 0.74, 0), V(0, 0.76, 0), V(0.34, 0.74, 0), V(0.4, 0.62, 0), V(0.4, 0, 0)], false, 'catmullrom', 0.2);
  A.ajouter(new THREE.TubeGeometry(ch2, 24, 0.025, 8), M.blancTube, b);
  A.ajouter(tube(V(-0.4, 0.42, 0), V(0.4, 0.42, 0), 0.02, 0.02, 6), M.blancTube, b);
  ch.C.ajouterBoiteOrientee(x, -y, 0.43, 0.05, -a, { y0: h0, y1: h0 + 0.8, camera: false });
}

// =====================================================================
//  POSER LE MOBILIER DE LA RUE
// =====================================================================
// R : les cotes de la rue (js/ecole_rue.js) — { Y_TROTTOIR, Y_CHAUSSEE, Y_FACE, H_CHAUSSEE, X0, X1 }
export function poserMobilierRue(ch, R) {
  const M = matieresRue();
  const A = new Atelier(), F = new Feuillage(), Floin = new Feuillage(), r = alea(2026);
  const hC = R.H_CHAUSSEE;

  // ---------------------------------------------------------------- devant l'école, du passage à la porte 6
  // (photos 08, 10, 13, 14, 17, 18) — la trottinette contre le bout du vantail de la grille, le totem du passage
  trottinette(A, M, 5.05, -1.62, Math.PI / 2 + 0.12, { penche: 0.14 });
  ch.C.ajouterBoiteOrientee(5.05, 1.62, 0.36, 0.12, -(Math.PI / 2 + 0.12), { y1: 1.1, camera: false });
  totem(ch, A, M, 6.0, -1.25, 'est', 20 * Math.PI / 180);
  // les jardinières de zinc sous les fenêtres de la salle A, et ce qu'elles portent (photos 08, 13, 14)
  let h = jardiniere(ch, A, M, 6.55, -0.72, 0.5, 0.5, 0.88); olivier(F, A, M, 6.55, -0.72, h, 1.9, r);
  h = jardiniere(ch, A, M, 7.25, -0.74, 0.72, 0.56, 0.76); arbuste(F, A, M, 7.25, -0.74, h, 0.36, 0.5, PLANCHE.fleurs, r, 34);
  h = jardiniere(ch, A, M, 8.12, -0.72, 0.56, 0.56, 0.9); cypres(F, A, M, 8.12, -0.72, h, 1.5, 0.27, r);
  h = jardiniere(ch, A, M, 8.82, -0.72, 0.62, 0.6, 0.86); arbuste(F, A, M, 8.82, -0.72, h, 0.38, 0.75, PLANCHE.arbuste, r, 38);
  h = jardiniere(ch, A, M, 9.54, -0.72, 0.6, 0.6, 0.86); olivier(F, A, M, 9.54, -0.72, h, 1.1, r); arbuste(F, A, M, 9.54, -0.72, h, 0.3, 0.45, PLANCHE.arbuste, r, 18);
  banc(ch, A, M, 7.4, -1.62, 1.25, 0);
  corbeille(ch, A, M, 9.25, -1.62);
  cendrier(ch, A, M, 9.95, -1.98);
  // le second banc, plus court, au droit du bureau B ; le totem de l'entrée n° 6 ; le bambou ; la jardinière en treillis
  banc(ch, A, M, 10.95, -1.25, 1.05, 0, { lattesDos: 6 });
  totem(ch, A, M, 12.05, -0.8, 'ouest');
  h = potRond(ch, A, M, 12.62, -1.55, 0.31, 0.23, 0.78, M.anthracite); bambou(F, A, M, 12.62, -1.55, h, 2.1, r, 26);
  const tb = pose(13.08, -1.3);
  A.ajouter(new THREE.BoxGeometry(0.44, 0.58, 0.44), M.treillis, dans(tb, 0, 0.29, 0));
  A.ajouter(new THREE.BoxGeometry(0.4, 0.01, 0.4), M.terre, dans(tb, 0, 0.55, 0), false);
  ch.C.ajouterBoite(12.86, 1.08, 13.3, 1.52, { y1: 0.6, camera: false });
  arbuste(F, A, M, 13.08, -1.3, 0.55, 0.28, 0.45, PLANCHE.choisya, r, 16);
  h = potRond(ch, A, M, 13.18, -0.7, 0.2, 0.15, 0.48, M.anthracite); arbuste(F, A, M, 13.18, -0.7, h, 0.22, 0.35, PLANCHE.arbuste, r, 12);
  // le palmier à droite de la porte 6, devant la fenêtre de l'accueil
  h = potRond(ch, A, M, 17.3, -1.45, 0.31, 0.22, 0.58, M.anthracite); palmier(F, A, M, 17.3, -1.45, h, r);

  // ---------------------------------------------------------------- à l'ouest du passage : les bacs, le n° 8
  // (photo 10) trois bacs roulants gris devant la porte de secours ; (photos 09, 10) les jardinières de terre cuite du
  // n° 8 et leurs choisyas, un grand pot carré gris
  const grandBac = { l: 0.68, p: 0.8, h: 1.08 };
  bacRoulant(ch, A, M, 0.52, -0.86, 0.04, M.bacGris, M.bacCouvercle, grandBac);
  bacRoulant(ch, A, M, 1.24, -0.9, -0.06, M.bacGris, M.bacCouvercle, grandBac);
  bacRoulant(ch, A, M, 0.86, -1.78, 0.1, M.bacGris, M.bacCouvercle, grandBac);
  h = jardiniereTerre(ch, A, M, -2.15, -0.75, 1.05, 0.4, 0.38); arbuste(F, A, M, -2.15, -0.75, h, 0.9, 1.6, PLANCHE.choisya, r, 85);
  h = jardiniereTerre(ch, A, M, -3.45, -1.0, 1.1, 0.4, 0.38); arbuste(F, A, M, -3.45, -1.0, h, 0.85, 1.5, PLANCHE.choisya, r, 80);
  h = potCarre(ch, A, M, -4.6, -0.72, 0.46, 0.6, M.anthracite); arbuste(F, A, M, -4.6, -0.72, h, 0.42, 1.05, PLANCHE.arbuste, r, 30);
  h = potRond(ch, A, M, -7.1, -0.72, 0.24, 0.17, 0.62, M.potGris); cypres(F, A, M, -7.1, -0.72, h, 1.35, 0.24, r);

  // ---------------------------------------------------------------- l'IMPASSE (photo 09) : les pots devant le muret
  const xi = R.X0 + 0.32;
  const potsImpasse = [
    [-3.5, 'vert'], [-4.2, 'anth', 0.4, 0.6, PLANCHE.fleurs], [-4.75, 'anth', 0.36, 0.55, PLANCHE.bambou], [-5.3, 'gris', 0.36, 0.5, PLANCHE.arbuste],
    [-5.85, 'terre', 0.24, 0.26, PLANCHE.arbuste], [-6.35, 'gris', 0.36, 0.5, PLANCHE.choisya], [-6.9, 'gris', 0.36, 0.5, PLANCHE.bambou],
    [-7.5, 'turq', 0.3, 0.34, PLANCHE.arbuste], [-8.2, 'anth', 0.42, 0.65, PLANCHE.bambou],
  ];
  // (ils sont posés sur la chaussée, 12 cm sous le trottoir)
  for (const [y, t, c, hp, pl] of potsImpasse) {
    if (t === 'vert') { bacRoulant(ch, A, M, xi + 0.1, y, -Math.PI / 2, M.bacVert, M.bacVert, { l: 0.52, p: 0.62, h: 0.95, sol: hC }); continue; }
    let hh;
    if (t === 'terre') hh = potRond(ch, A, M, xi, y, c / 2 + 0.05, c / 2, hp, M.terreCuite, { sol: hC });
    else if (t === 'turq') hh = potRond(ch, A, M, xi, y, c / 2 + 0.02, c / 2 - 0.02, hp, M.potTurquoise, { sol: hC });
    else hh = potCarre(ch, A, M, xi, y, c, hp, t === 'gris' ? M.potGris : M.anthracite, { sol: hC });
    if (pl === PLANCHE.bambou) bambou(F, A, M, xi, y, hh, 1.9 + r() * 0.7, r, 12);
    else arbuste(F, A, M, xi, y, hh, 0.5 + r() * 0.2, 1.1 + r() * 0.7, pl, r, 40);
  }
  // sur le trottoir pavé du n° 10 : la terre cuite et le grand pot rond gris au thuya
  h = potRond(ch, A, M, R.X0 + 0.8, -1.9, 0.27, 0.2, 0.42, M.terreCuite); arbuste(F, A, M, R.X0 + 0.8, -1.9, h, 0.35, 0.9, PLANCHE.choisya, r, 22);
  h = potRond(ch, A, M, R.X0 + 1.9, -1.15, 0.27, 0.19, 0.72, M.potGris); cypres(F, A, M, R.X0 + 1.9, -1.15, h, 1.6, 0.26, r);

  // ---------------------------------------------------------------- les deux-roues
  // devant le n° 4 (photos 15, 16) : la moto routière noire sur le trottoir, le nez vers la façade
  moto(ch, A, M, 20.7, -1.35, 2.2, 'routiere', M.noirBrillant, { penche: -0.1 });
  // la station de réparation et ses arceaux, sur la chaussée contre la bordure (photos 08, 13, 15, 16), les vélos
  stationVelo(ch, A, M, 21.35, -3.28, 0, hC);
  arceau(ch, A, M, 22.25, -3.28, 0, hC); arceau(ch, A, M, 23.25, -3.28, 0, hC);
  velo(A, M, 21.0, -3.62, Math.PI + 0.06, M.cadreBlanc, { penche: 0.2, style: 'route', h: hC });
  velo(A, M, 22.3, -3.6, -0.05, M.cadreBleu, { penche: -0.18, h: hC });
  velo(A, M, 23.15, -3.05, 0.04, M.cadreNoir, { penche: 0.18, h: hC });
  velo(A, M, 21.7, -3.85, 0.15, M.cadreGris, { penche: -0.22, style: 'route', h: hC });
  trottinette(A, M, 22.4, -4.25, 0.5, { couchee: true, sol: hC });
  ch.C.ajouterBoite(20.6, 3.0, 23.8, 4.4, { y0: hC, y1: hC + 1.1, camera: false });        // (les vélos, en bloc)
  // devant le jardin, contre le bac de béton (photos 08, 15) : la rouge, deux scooters noirs
  // (le bac de béton gris, 1,4 x 0,55 x 0,55, contre la bordure ; ses bords chanfreinés, l'étiquette)
  const bb = pose(19.7, R.Y_CHAUSSEE + 0.38, hC);
  A.ajouter(new RoundedBoxGeometry(1.4, 0.55, 0.55, 2, 0.03), M.potGris, dans(bb, 0, 0.275, 0));
  A.ajouter(new THREE.BoxGeometry(1.3, 0.01, 0.45), M.terre, dans(bb, 0, 0.552, 0), false);
  A.ajouter(new THREE.BoxGeometry(0.18, 0.06, 0.005), M.noirMat, dans(bb, 0.35, 0.38, -0.278), false);
  ch.C.ajouterBoite(19.0, -(R.Y_CHAUSSEE + 0.66), 20.4, -(R.Y_CHAUSSEE + 0.1), { y0: hC, y1: hC + 0.56, camera: false });
  arbuste(F, A, M, 19.4, R.Y_CHAUSSEE + 0.38, hC + 0.55, 0.25, 0.3, PLANCHE.arbuste, r, 8);
  const ys = R.Y_CHAUSSEE + 1.0;
  moto(ch, A, M, 20.95, ys, Math.PI / 2 - 0.08, 'scooter', M.noirBrillant, { penche: -0.1, sol: hC });
  moto(ch, A, M, 22.05, ys, Math.PI / 2 + 0.15, 'roadster', M.rougeMoto, { penche: -0.1, sol: hC });
  moto(ch, A, M, 23.35, ys, Math.PI / 2 + 0.05, 'scooter', M.noirBrillant, { penche: -0.1, sol: hC });
  // les plantes un peu plus loin, contre la façade du n° 4 et de l'immeuble blanc (photo 15 : palmier, arbustes)
  h = potRond(ch, A, M, 27.6, -0.75, 0.3, 0.22, 0.55, M.anthracite); palmier(F, A, M, 27.6, -0.75, h, r);
  h = potRond(ch, A, M, 28.6, -0.7, 0.26, 0.2, 0.5, M.terreCuite); arbuste(F, A, M, 28.6, -0.7, h, 0.45, 0.9, PLANCHE.choisya, r, 26);

  // ---------------------------------------------------------------- les arbres du jardin et de l'impasse
  // (photos 08, 09, 15 : de grands arbres débordent de la grille du jardin ; derrière le muret de l'impasse, une masse
  // de verdure). Loin de l'école : sans ombre portée (la carte d'ombre ne couvre pas le fond de la rue).
  for (const [x, y, H, Rr, n] of [[17.0, R.Y_FACE - 3.0, 12.5, 3.5, 210], [22.5, R.Y_FACE - 2.8, 10, 3.0, 170], [28.0, R.Y_FACE - 3.2, 11, 3.3, 180], [37.5, R.Y_FACE - 3.0, 10.5, 3.2, 170]])
    arbre(Floin, A, M, x, y, H, Rr, r, { n: TELEPHONE ? Math.round(n * 0.6) : n });
  // le peuplier élancé du fond (photo 08, au-dessus du jardin)
  arbre(Floin, A, M, 32.5, R.Y_FACE - 6, 17, 2.4, r, { n: TELEPHONE ? 110 : 170, hFut: 0.3, applati: 2.4 });
  for (const [y, H, Rr] of [[-2.0, 7, 2.8], [-5.5, 8.5, 3.4], [-9.0, 7.5, 3.0]]) arbre(Floin, A, M, R.X0 - 2.8, y, H, Rr, r, { n: TELEPHONE ? 110 : 200, applati: 1.1 });
  for (let k = 0; k < 6; k++) bambou(Floin, A, M, R.X0 - 0.9, -3.6 - k * 1.1, 0, 2.6 + r() * 0.8, r, 8);

  // ---------------------------------------------------------------- la couture
  A.poser(ch.decor);
  F.poser(ch.decor, M.feuilles, true);
  Floin.poser(ch.decor, M.feuilles, false);
}
