// =====================================================================
//  LES MODÈLES D'ARMES — lot L-W (23/10/2026), sur le squelette du socle S0 (22/10)
// =====================================================================
// Huit armes faites main en primitives three.js, AUCUN fichier, aucune texture, aucune marque, aucun texte (spec § 4.5.8,
// CoD § 6.2) : FA-24 « Faucon », PM-9 « Guêpe », FP-12 « Bélier », TP-50 « Héron », P-17 « Moineau », couteau, frag, flash.
// Pourquoi à la main : une arme sur le disque, c'est un .glb de plus au démarrage et une marque à effacer ; ici chaque pièce
// est une boîte chanfreinée, un cylindre, un tour (LatheGeometry) ou un profil extrudé biseauté — l'arête biseautée accroche
// la lumière du studio de l'arme de vue (une boîte nue y paraît en carton).
//
// DEUX VERSIONS, une seule recette (les plans, plus bas) :
// - `pourVue` (l'arme de vue, L-V) : chaque pièce rattachée à UN os (poids 1, rigide), toutes les pièces d'un même matériau
//   COUSUES en un SkinnedMesh — un appel de dessin par matériau, 3 à 5 par arme (≤ 6 visé) ; os `chargeur`, `culasse`,
//   `glissiere`, `pompe`, `detente`, `goupille` selon l'arme (OS_ARMES : pivots ; COURSES_OS : leurs gestes) ; détails
//   (dents des rails, ouïes, goupilles, molettes, points de visée) en plus.
// - 3e personne (les bots, L-C `armeTroisieme`) : une géométrie par matériau, sans os, ≤ 3 appels (le poli, la lentille
//   passent à l'acier ; le point rouge et les points blancs disparaissent), segments divisés par deux, ≤ 1 500 triangles.
// Les géométries cousues sont faites UNE fois par arme et par version (cache) puis PARTAGÉES par tous les exemplaires, comme
// les matériaux (MATERIAUX_ARMES) : 20 exemplaires de plus = 0 matériau et 0 programme de plus. On ne les libère JAMAIS
// (`libererArme` ne rend que la texture d'os du squelette ; un matériau libéré se recompile : image figée).
//
// REPÈRE de chaque arme : origine = la PRISE DE LA MAIN DROITE (le creux entre pouce et index, en haut de la poignée), sur
// le plan médian ; −Z vers la bouche, +Y en haut, +X à droite du tireur. En vue FPS la caméra voit le DESSUS et le flanc
// GAUCHE (l'arme est à droite de l'œil) : les détails sont mis là d'abord. Les REPÈRES (table du § 4.5.8, au mm près) sont
// des Object3D sous `userData.reperes`, TOUS enfants directs du groupe, `position` = la table (le contrat tel que le socle
// l'a posé, et que L-V compare) ; en vue, ceux qui suivent une pièce mobile ont en plus un JUMEAU enfant de son os, sous
// `userData.reperesMobiles` (la main gauche du FP-12 sur la pompe, les saisies du chargeur, du levier, de la glissière,
// l'anneau des grenades).
//
// Ce que la spec ne pouvait pas tenir à la fois (rapport L-W, écarts) : le FP-12 mesure 0,95 m mais ses repères crosse
// (+0,22) et bouche (−0,78) sont à 1,00 m l'un de l'autre — la couche finit à +0,215 et la couronne du canon à −0,745
// (0,96 m) : la bouche est 3,5 cm devant le canon ; le PM-9 mesure 0,62 m pour 0,58 m entre ses repères — le compensateur
// dépasse la bouche de 2,5 cm et la couche la crosse de 1,5 cm ; sa crosse « en fil repliée » est montrée DÉPLIÉE (la
// crosse en +0,18 l'exige), sa charnière à gauche dit qu'elle se replie.
import * as THREE from 'three';

const DEG = Math.PI / 180;
const _m4 = new THREE.Matrix4(), _m4b = new THREE.Matrix4();
const UN = new THREE.Vector3(1, 1, 1);
export const IDS_ARMES = ['fa24', 'pm9', 'fp12', 'tp50', 'p17', 'couteau', 'frag', 'flash'];
// l'encombrement (longueur selon −Z, § 3.3) : les modèles le tiennent à ± 3 % (test 3 de L-W)
export const ENCOMBREMENTS = { fa24: 0.84, pm9: 0.62, fp12: 0.95, tp50: 1.10, p17: 0.19 };

// ---------------------------------------------------------------------
//  LES MATÉRIAUX (partagés, créés au premier appel)
// ---------------------------------------------------------------------
// acier 0x24272b (métal 0,85, rugosité 0,38) · polymère 0x2b2d30 (0 / 0,72) · une TEINTE par arme (c'est elle que les
// camouflages de la vague 3 remplaceront) · verre émissif du point rouge (0xff2a1a, toneMapped: false : le bloom le fait
// briller) — et, ajoutés par L-W : la LENTILLE (verre traité, miroir sombre qui reflète le studio : opaque, la lunette est
// cachée en visée), le BLANC des points de visée (un rien émissif : lisible dans un couloir sombre), le POLI (tranchant du
// couteau, culasse du TP-50, culots des cartouches, anneaux des grenades).
let _mats = null;
export const MATERIAUX_ARMES = {
  get acier() { return mats().acier; }, get polymere() { return mats().polymere; }, get verre() { return mats().verre; },
  get lentille() { return mats().lentille; }, get blanc() { return mats().blanc; }, get poli() { return mats().poli; },
  teinte(id) { return mats().teintes[id] || mats().polymere; },
  // tous les matériaux des armes (tests, compilation)
  get tous() { const m = mats(); return [m.acier, m.polymere, m.verre, m.lentille, m.blanc, m.poli, ...Object.values(m.teintes)]; },
};
function mats() {
  if (_mats) return _mats;
  const std = (nom, color, metalness, roughness, o = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, metalness, roughness, ...o });
    m.name = 'arme ' + nom; m.userData.partage = true;
    return m;
  };
  const verre = new THREE.MeshBasicMaterial({ color: 0xff2a1a, toneMapped: false });
  verre.name = 'arme verre'; verre.userData.partage = true;
  _mats = {
    acier: std('acier', 0x24272b, 0.85, 0.38), polymere: std('polymère', 0x2b2d30, 0, 0.72), verre,
    lentille: std('lentille', 0x0a1822, 1, 0.07), blanc: std('blanc', 0xf2efe6, 0, 0.45, { emissive: 0x3a3a36 }),
    poli: std('poli', 0x8e949b, 1, 0.24),
    teintes: { fa24: std('teinte fa24', 0x9a8665, 0, 0.62), pm9: std('teinte pm9', 0x1d1e20, 0, 0.6), fp12: std('teinte fp12', 0x5b5f45, 0, 0.65),
      tp50: std('teinte tp50', 0xb8a27a, 0, 0.62), p17: std('teinte p17', 0x1d1e20, 0, 0.55), couteau: std('teinte couteau', 0x34362f, 0, 0.7),
      frag: std('teinte frag', 0x4a5236, 0.1, 0.55), flash: std('teinte flash', 0x3a3d40, 0.3, 0.5) },
  };
  return _mats;
}
const matDe = (nom, id) => (nom === 'teinte' ? MATERIAUX_ARMES.teinte(id) : mats()[nom]);
// en 3e personne : ≤ 3 matériaux (le poli et la lentille passent à l'acier ; le point rouge et les points blancs disparaissent)
const MAT_3E = { poli: 'acier', lentille: 'acier', verre: null, blanc: null };

// ---------------------------------------------------------------------
//  LES REPÈRES (m, repère de l'arme) — § 4.5.8 tels quels, plus les ajouts de L-W
// ---------------------------------------------------------------------
// Ajouts (règle 3 : on ajoute, on ne change rien) : `mainD` (0, 0, 0) des armes à feu ; `saisieChargeur` (là où la main
// gauche prend le chargeur : son flanc gauche, au tiers bas) ; `saisieLevier` (le levier d'armement, le levier de culasse) ;
// `saisieGlissiere` (les stries arrière du P-17). `courseMainG` (FP-12) : la course de la pompe, que la main gauche suit.
// `oeilleton` (FP-12, relecture) : le centre de l'anneau arrière, sur la ligne de mire de la perle (même hauteur 0,06) — viser
// la PERLE à 0,24 m de l'œil (§ 4.5.9) mettrait la crosse 0,68 m derrière la caméra ; viser par l'œilleton la met à 1,5 cm
// derrière l'œil, comme la FA-24 (4 cm) : à trancher par L-V et F2 (écart 4 du rapport).
const V = (x, y, z) => [x, y, z];
export const REPERES = {
  fa24: { mainD: V(0, 0, 0), mainG: V(0, -0.025, -0.34), bouche: V(0, 0.035, -0.64), visee: V(0, 0.088, -0.08), ejection: V(0.03, 0.05, -0.06), crosse: V(0, 0.03, 0.20),
    saisieChargeur: V(-0.015, -0.152, -0.133), saisieLevier: V(-0.028, 0.053, 0.064) },
  pm9: { mainD: V(0, 0, 0), mainG: V(0, -0.03, -0.24), bouche: V(0, 0.03, -0.40), visee: V(0, 0.075, -0.05), ejection: V(0.03, 0.045, -0.05), crosse: V(0, 0.03, 0.18),
    saisieChargeur: V(-0.013, -0.150, -0.093), saisieLevier: V(-0.040, 0.034, -0.130) },
  fp12: { mainD: V(0, 0, 0), mainG: V(0, -0.03, -0.42), bouche: V(0, 0.03, -0.78), visee: V(0, 0.06, -0.70), ejection: V(0.03, 0.04, -0.08), crosse: V(0, 0.02, 0.22), courseMainG: 0.09,
    oeilleton: V(0, 0.060, -0.035) },
  tp50: { mainD: V(0, 0, 0), mainG: V(0, -0.03, -0.36), bouche: V(0, 0.03, -0.85), visee: V(0, 0.075, -0.02), ejection: V(0.03, 0.05, -0.05), crosse: V(0, 0.03, 0.24),
    saisieChargeur: V(-0.014, -0.062, -0.100), saisieLevier: V(0.042, 0.010, 0.057) },
  p17: { mainD: V(0, 0, 0), mainG: V(-0.02, -0.04, 0.01), bouche: V(0, 0.035, -0.13), visee: V(0, 0.058, 0.04), ejection: V(0.015, 0.04, -0.03),
    saisieChargeur: V(-0.012, -0.100, 0.029), saisieGlissiere: V(-0.0145, 0.040, 0.030) },
  couteau: { mainD: V(0, 0, 0) }, frag: { mainD: V(0, 0, 0), goupille: V(0.02, 0.05, 0) }, flash: { mainD: V(0, 0, 0), goupille: V(0.02, 0.06, 0) },
};
// en vue, les repères portés par une pièce mobile : leurs jumeaux de `userData.reperesMobiles`, enfants de son os (ils la suivent)
const PORTES = { fa24: { saisieChargeur: 'chargeur', saisieLevier: 'culasse' }, pm9: { saisieChargeur: 'chargeur', saisieLevier: 'culasse' },
  fp12: { mainG: 'pompe' }, tp50: { saisieChargeur: 'chargeur', saisieLevier: 'culasse' }, p17: { saisieChargeur: 'chargeur', saisieGlissiere: 'glissiere' },
  frag: { goupille: 'goupille' }, flash: { goupille: 'goupille' } };

// ---------------------------------------------------------------------
//  LES OS (version `pourVue`) : pivots, et ce que chacun fait
// ---------------------------------------------------------------------
// Chaque os est un enfant de l'os `racine` (à l'origine), posé à son PIVOT, sans rotation : le bouger de (dx, dy, dz) bouge
// ses pièces d'autant ; le tourner les tourne autour du pivot. COURSES_OS dit le geste (pour L-V) : `x`, `y`, `z` en mètres
// dans le repère de l'arme (+z = vers l'arrière), `rx`, `rz` en radians. La détente se tire par rx < 0 (le bas vers
// l'arrière) ; la culasse du TP-50 se lève de 60° (rz > 0 : le levier, à droite, monte) PUIS recule de 8 cm ; la pompe du
// FP-12 recule de 9 cm (la main gauche, enfant de l'os, suit) ; la glissière du P-17 recule de 3 cm au tir.
export const OS_ARMES = {
  fa24: { chargeur: V(0, -0.02, -0.105), culasse: V(0, 0.053, 0.064), detente: V(0, -0.012, -0.040) },
  pm9: { chargeur: V(0, -0.015, -0.085), culasse: V(-0.022, 0.034, -0.130), detente: V(0, -0.016, -0.036) },
  fp12: { pompe: V(0, 0.0015, -0.42), detente: V(0, -0.016, -0.050) },
  tp50: { culasse: V(0, 0.03, 0.05), chargeur: V(0, -0.025, -0.10), detente: V(0, -0.028, -0.038) },
  p17: { glissiere: V(0, 0.0375, -0.04), chargeur: V(0, 0.004, 0.0), detente: V(0, 0.004, -0.028) },
  couteau: {}, frag: { goupille: V(0.02, 0.05, 0) }, flash: { goupille: V(0.02, 0.06, 0) },
};
export const COURSES_OS = {
  fa24: { chargeur: { y: -0.30 }, culasse: { z: 0.075 }, detente: { rx: -0.32 } },
  pm9: { chargeur: { y: -0.26 }, culasse: { z: 0.060 }, detente: { rx: -0.32 } },
  fp12: { pompe: { z: 0.09 }, detente: { rx: -0.30 } },
  tp50: { culasse: { rz: 60 * DEG, z: 0.08 }, chargeur: { y: -0.12 }, detente: { rx: -0.28 } },
  // (le chargeur du P-17 sort dans l'axe de la poignée, 15° vers l'arrière : tiré tout droit, il traverserait le devant de la
  // poignée dès 2,6 cm — relecture)
  p17: { glissiere: { z: 0.03 }, chargeur: { y: -0.16 * Math.cos(15 * DEG), z: 0.16 * Math.sin(15 * DEG) }, detente: { rx: -0.30 } },
  couteau: {}, frag: { goupille: { x: 0.06 } }, flash: { goupille: { x: 0.06 } },
};
const NOMS_OS = ['chargeur', 'culasse', 'glissiere', 'pompe', 'detente', 'goupille'];

// ---------------------------------------------------------------------
//  LES PRIMITIVES (géométries non indexées : position + normale ; les uv n'ont rien à porter)
// ---------------------------------------------------------------------
// LA BOÎTE CHANFREINÉE (l × h × p, chanfrein c) : 6 faces, 12 arêtes biseautées, 8 coins — 44 triangles à normales de face.
const _chanfreins = new Map();
function chanfrein(l, h, p, c) {
  const k = l + ',' + h + ',' + p + ',' + c;
  let C = _chanfreins.get(k);
  if (!C) { const g0 = chanfrein0(l, h, p, c); C = { P: g0.attributes.position.array, N: g0.attributes.normal.array, I: g0.index }; _chanfreins.set(k, C); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(C.P.slice(), 3)); g.setAttribute('normal', new THREE.BufferAttribute(C.N.slice(), 3));
  if (C.I) g.setIndex(C.I.clone());
  return g;
}
function chanfrein0(l, h, p, c) {
  const E = [l / 2, h / 2, p / 2];
  c = Math.max(0, Math.min(c, E[0] * 0.9, E[1] * 0.9, E[2] * 0.9));
  if (c < 1e-6) return new THREE.BoxGeometry(l, h, p);
  const I = [E[0] - c, E[1] - c, E[2] - c];
  const pos = [], nor = [];
  const pt = (k, s) => [0, 1, 2].map((i) => s[i] * (i === k ? E[i] : I[i]));
  const tri = (A, B, C, o) => {
    const ux = B[0] - A[0], uy = B[1] - A[1], uz = B[2] - A[2], vx = C[0] - A[0], vy = C[1] - A[1], vz = C[2] - A[2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    if (nx * o[0] + ny * o[1] + nz * o[2] < 0) { const t = B; B = C; C = t; nx = -nx; ny = -ny; nz = -nz; }
    const L = Math.hypot(nx, ny, nz) || 1;
    for (const P of [A, B, C]) { pos.push(P[0], P[1], P[2]); nor.push(nx / L, ny / L, nz / L); }
  };
  const quad = (A, B, C, D, o) => { tri(A, B, C, o); tri(A, C, D, o); };
  for (let k = 0; k < 3; k++) {
    const i = (k + 1) % 3, j = (k + 2) % 3;
    for (const sk of [-1, 1]) {
      const s = (si, sj) => { const r = [0, 0, 0]; r[k] = sk; r[i] = si; r[j] = sj; return r; };
      const o = [0, 0, 0]; o[k] = sk;
      quad(pt(k, s(-1, -1)), pt(k, s(1, -1)), pt(k, s(1, 1)), pt(k, s(-1, 1)), o);           // la face
      // l'arête entre la face k et la face i (signe si), puis le coin
      for (const si of [-1, 1]) {
        const a1 = s(si, -1), a2 = s(si, 1);
        const oo = [0, 0, 0]; oo[k] = sk; oo[i] = si;
        quad(pt(k, a1), pt(k, a2), pt(i, a2), pt(i, a1), oo);
        for (const sj of [-1, 1]) {
          if (k !== 0) continue;                                                           // (chaque coin une fois)
          const sc = s(si, sj), oc = [sc[0], sc[1], sc[2]];
          tri(pt(0, sc), pt(1, sc), pt(2, sc), oc);
        }
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  return g;
}
// un cylindre le long de Z (le rayon `rArriere` côté +Z, `rAvant` côté −Z)
const X90 = new THREE.Matrix4().makeRotationX(Math.PI / 2), YM90 = new THREE.Matrix4().makeRotationY(-Math.PI / 2);
function cylindreZ(rArriere, rAvant, long, seg, ouvert = false) {
  const g = new THREE.CylinderGeometry(rArriere, rAvant, long, seg, 1, ouvert);
  transformer(g, X90);
  return g;
}
// un TOUR le long de Z : le profil [[r, z]…] tourné autour de l'axe (un solide fermé : il part de l'axe et y revient, ou
// boucle sur lui-même) ; l'orientation des faces est remise par le volume signé
function tour(profil, seg) {
  const g = new THREE.LatheGeometry(profil.map(([r, z]) => new THREE.Vector2(Math.max(0, r), z)), seg);
  transformer(g, X90);
  return g;
}
// un PROFIL DE CÔTÉ [[z, y]…] extrudé selon X (épaisseur `ep`, centré) ; biseau arrondi sans dépasser le contour ; trous ;
// `cis` = [k, y0] : cisaillement z += (y0 − y)·k (la pente d'une poignée)
function profilCote(points, ep, { biseau = 0, segBiseau = 2, trous = [], cis = null } = {}) {
  const P = (L) => L.map(([z, y]) => new THREE.Vector2(cis ? z + (cis[1] - y) * cis[0] : z, y));
  const S = new THREE.Shape(P(points));
  for (const T of trous) S.holes.push(new THREE.Path(P(T)));
  const bt = Math.min(biseau, ep * 0.45);
  const g = new THREE.ExtrudeGeometry(S, { depth: Math.max(1e-4, ep - 2 * bt), bevelEnabled: bt > 0, bevelThickness: bt, bevelSize: bt,
    bevelOffset: -bt, bevelSegments: segBiseau, curveSegments: 4 });
  transformer(g, _m4b.makeTranslation(0, 0, -(ep - 2 * bt) / 2).premultiply(YM90));   // (forme x → arme z, forme y → y, profondeur → x)
  return g;
}
// un PROFIL DE FACE [[x, y]…] extrudé selon Z (épaisseur `ep`, centré)
function profilFace(points, ep, { biseau = 0, segBiseau = 2, trous = [] } = {}) {
  const S = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
  for (const T of trous) S.holes.push(new THREE.Path(T.map(([x, y]) => new THREE.Vector2(x, y))));
  const bt = Math.min(biseau, ep * 0.45);
  const g = new THREE.ExtrudeGeometry(S, { depth: Math.max(1e-4, ep - 2 * bt), bevelEnabled: bt > 0, bevelThickness: bt, bevelSize: bt,
    bevelOffset: -bt, bevelSegments: segBiseau, curveSegments: 4 });
  transformer(g, _m4b.makeTranslation(0, 0, -(ep - 2 * bt) / 2));
  return g;
}
// le corps de la frag : une sphère « quadrillée » (8 colonnes, 6 rangs d'ananas : les sillons enfoncés de 6 %)
function quadrillee(R, ky, vue) {
  const W = vue ? 32 : 12, H = vue ? 20 : 8;
  const g = new THREE.SphereGeometry(R, W, H);
  if (vue) {
    const P = g.attributes.position;
    for (let iy = 0; iy <= H; iy++) for (let ix = 0; ix <= W; ix++) {
      const sillon = (iy >= 3 && iy <= H - 3 && ix % 4 === 0) || [4, 7, 10, 13, 16].includes(iy);
      if (!sillon || iy === 0 || iy === H) continue;
      const i = iy * (W + 1) + ix;
      P.setXYZ(i, P.getX(i) * 0.94, P.getY(i) * 0.94, P.getZ(i) * 0.94);
    }
  }
  g.scale(1, ky, 1);
  return g;
}
// un rectangle arrondi (w × h, rayon r) centré, et une ellipse : des contours pour les profils
function rectArrondi(w, h, r, n = 3) {
  const P = [], a = w / 2 - r, b = h / 2 - r;
  for (const [cx, cy, a0] of [[a, b, 0], [-a, b, 90], [-a, -b, 180], [a, -b, 270]]) for (let i = 0; i <= n; i++) { const t = (a0 + 90 * i / n) * DEG; P.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]); }
  return P;
}
function ellipse(cx, cy, rx, ry, n = 14) { const P = []; for (let i = 0; i < n; i++) { const t = 2 * Math.PI * i / n; P.push([cx + rx * Math.cos(t), cy + ry * Math.sin(t)]); } return P; }
// le contour d'un chargeur COURBE (arc de rayon R, longueur L le long de l'arc, demi-épaisseur avant/arrière w0 → w1) : son
// axe part de (z0, y0) vers le bas et s'incurve vers l'avant ; aussi le point et l'angle à l'abscisse s
function arcChargeur(z0, y0, R, s) { const f = s / R; return { z: z0 - R * (1 - Math.cos(f)), y: y0 - R * Math.sin(f), f }; }
function chargeurCourbe(z0, y0, R, L, w0, w1, n) {
  const dos = [], face = [];
  for (let i = 0; i <= n; i++) {
    const s = L * i / n, c = arcChargeur(z0, y0, R, s), w = w0 + (w1 - w0) * i / n, nz = Math.cos(c.f), ny = -Math.sin(c.f);
    dos.push([c.z + w * nz, c.y + w * ny]); face.push([c.z - w * nz, c.y - w * ny]);
  }
  return dos.concat(face.reverse());
}

// LES SOMMETS CONFONDUS : positions quantifiées à 10 µm, rangées dans une table de hachage ouverte ; `suiv` chaîne les
// sommets d'un même point derrière le premier venu (`tete`)
function confondus(P, n) {
  let cap = 16; while (cap < 2 * n) cap <<= 1;
  const T = new Int32Array(cap).fill(-1), Q = new Int32Array(3 * n), tete = new Int32Array(n), suiv = new Int32Array(n).fill(-1);
  for (let v = 0; v < n; v++) {
    const x = Math.round(P[3 * v] * 1e5), y = Math.round(P[3 * v + 1] * 1e5), z = Math.round(P[3 * v + 2] * 1e5);
    Q[3 * v] = x; Q[3 * v + 1] = y; Q[3 * v + 2] = z;
    let h = (Math.imul(x, 73856093) ^ Math.imul(y, 19349663) ^ Math.imul(z, 83492791)) & (cap - 1), r;
    while ((r = T[h]) !== -1 && !(Q[3 * r] === x && Q[3 * r + 1] === y && Q[3 * r + 2] === z)) h = (h + 1) & (cap - 1);
    if (r === -1) { T[h] = v; tete[v] = v; } else { tete[v] = r; suiv[v] = suiv[r]; suiv[r] = v; }
  }
  return { tete, suiv };
}
// LISSER : normales recalculées par position, lissées entre faces à moins de `angle` degrés l'une de l'autre (pondérées par
// l'aire) — les courbes paraissent rondes, les arêtes restent vives. (toCreasedNormals de three hache les positions au
// centimètre : sur une arme, c'est fusionner des pièces entières.)
function lisser(g, angle) {
  const P = g.attributes.position.array, n = P.length / 3, nt = n / 3;
  const F = new Float32Array(nt * 3), A = new Float32Array(nt * 3);
  for (let t = 0; t < nt; t++) {
    const a = 9 * t, ux = P[a + 3] - P[a], uy = P[a + 4] - P[a + 1], uz = P[a + 5] - P[a + 2], vx = P[a + 6] - P[a], vy = P[a + 7] - P[a + 1], vz = P[a + 8] - P[a + 2];
    const x = uy * vz - uz * vy, y = uz * vx - ux * vz, z = ux * vy - uy * vx, L = Math.sqrt(x * x + y * y + z * z);
    A[3 * t] = x; A[3 * t + 1] = y; A[3 * t + 2] = z;
    if (L > 0) { F[3 * t] = x / L; F[3 * t + 1] = y / L; F[3 * t + 2] = z / L; }
  }
  const { tete, suiv } = confondus(P, n), N = new Float32Array(3 * n), cs = Math.cos(angle * DEG);
  for (let v = 0; v < n; v++) {
    const t = 3 * ((v / 3) | 0), fx = F[t], fy = F[t + 1], fz = F[t + 2];
    let x = 0, y = 0, z = 0;
    for (let w = tete[v]; w !== -1; w = suiv[w]) {
      const u = 3 * ((w / 3) | 0);
      if (fx * F[u] + fy * F[u + 1] + fz * F[u + 2] >= cs) { x += A[u]; y += A[u + 1]; z += A[u + 2]; }
    }
    const l = Math.sqrt(x * x + y * y + z * z) || 1;
    N[3 * v] = x / l; N[3 * v + 1] = y / l; N[3 * v + 2] = z / l;
  }
  g.setAttribute('normal', new THREE.BufferAttribute(N, 3));
}
// les triangles d'aire nulle (pôles des tours) retirés ; l'orientation d'un solide fermé remise à l'endroit (volume signé)
function nettoyer(g) {
  const P = g.attributes.position.array, N = g.attributes.normal ? g.attributes.normal.array : null, nt = P.length / 9;
  let vol = 0, garde = 0;
  const P2 = new Float32Array(P.length), N2 = N ? new Float32Array(N.length) : null;
  for (let t = 0; t < nt; t++) {
    const a = 9 * t, ux = P[a + 3] - P[a], uy = P[a + 4] - P[a + 1], uz = P[a + 5] - P[a + 2], vx = P[a + 6] - P[a], vy = P[a + 7] - P[a + 1], vz = P[a + 8] - P[a + 2];
    const x = uy * vz - uz * vy, y = uz * vx - ux * vz, z = ux * vy - uy * vx;
    if (x * x + y * y + z * z < 1e-24) continue;
    vol += P[a] * (P[a + 4] * P[a + 8] - P[a + 5] * P[a + 7]) - P[a + 1] * (P[a + 3] * P[a + 8] - P[a + 5] * P[a + 6]) + P[a + 2] * (P[a + 3] * P[a + 7] - P[a + 4] * P[a + 6]);
    P2.set(P.subarray(a, a + 9), 9 * garde); if (N) N2.set(N.subarray(a, a + 9), 9 * garde);
    garde++;
  }
  if (vol < 0) for (let t = 0; t < garde; t++) for (let k = 0; k < 3; k++) {
    const b = 9 * t + 3 + k, c = 9 * t + 6 + k;
    let s = P2[b]; P2[b] = P2[c]; P2[c] = s;
    if (N2) { s = N2[b]; N2[b] = N2[c]; N2[c] = s; }
  }
  g.setAttribute('position', new THREE.BufferAttribute(P2.slice(0, 9 * garde), 3));
  if (N2) g.setAttribute('normal', new THREE.BufferAttribute(N2.slice(0, 9 * garde), 3));
}
// une géométrie indexée mise à plat (position et normale seulement : les uv n'ont rien à porter)
function desindexer(g) {
  const I = g.index.array, n = I.length, P = g.attributes.position.array, N = g.attributes.normal.array;
  const P2 = new Float32Array(3 * n), N2 = new Float32Array(3 * n);
  for (let i = 0; i < n; i++) { const a = 3 * I[i], b = 3 * i; P2[b] = P[a]; P2[b + 1] = P[a + 1]; P2[b + 2] = P[a + 2]; N2[b] = N[a]; N2[b + 1] = N[a + 1]; N2[b + 2] = N[a + 2]; }
  const h = new THREE.BufferGeometry();
  h.setAttribute('position', new THREE.BufferAttribute(P2, 3)); h.setAttribute('normal', new THREE.BufferAttribute(N2, 3));
  return h;
}
// poser une pièce : rotation puis translation, à même les tableaux (pas de mise à l'échelle : les normales tournent seulement)
function transformer(g, M) {
  const e = M.elements, P = g.attributes.position.array, N = g.attributes.normal.array;
  for (let i = 0; i < P.length; i += 3) {
    const x = P[i], y = P[i + 1], z = P[i + 2], a = N[i], b = N[i + 1], c = N[i + 2];
    P[i] = e[0] * x + e[4] * y + e[8] * z + e[12]; P[i + 1] = e[1] * x + e[5] * y + e[9] * z + e[13]; P[i + 2] = e[2] * x + e[6] * y + e[10] * z + e[14];
    N[i] = e[0] * a + e[4] * b + e[8] * c; N[i + 1] = e[1] * a + e[5] * b + e[9] * c; N[i + 2] = e[2] * a + e[6] * b + e[10] * c;
  }
}

// ---------------------------------------------------------------------
//  L'ATELIER : les pièces d'une arme (géométrie, matériau, os), posées dans le repère de l'arme
// ---------------------------------------------------------------------
// Options d'une pièce : `p` position, `r` rotation [rx, ry, rz] (XYZ), `q` quaternion, `os` l'os qui la porte (vue),
// `vue` = la pièce n'existe que dans la version de vue (détail), `trois` = que dans la 3e personne (remplaçante simplifiée),
// `lisse` = l'angle (°) du lissage des normales, `seg` = segments (divisés par deux en 3e personne).
const _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3();
class Atelier {
  constructor(vue) { this.vue = vue; this.pieces = []; }
  s(n, min = 6) { return this.vue ? n : Math.max(min, Math.round(n / 2)); }
  _poser(geo, mat, o, solide = false) {
    if ((o.vue && !this.vue) || (o.trois && this.vue)) return null;
    const g = geo.index ? desindexer(geo) : geo;
    for (const a of Object.keys(g.attributes)) if (a !== 'position' && a !== 'normal') g.deleteAttribute(a);
    g.clearGroups();
    if (solide) nettoyer(g);
    if (o.lisse) lisser(g, o.lisse);
    if (o.p || o.r || o.q) {
      if (o.q) _q.copy(o.q); else _q.setFromEuler(_e.set(...(o.r || [0, 0, 0]), 'XYZ'));
      transformer(g, _m4.compose(_v.set(...(o.p || [0, 0, 0])), _q, UN));
    }
    this.pieces.push({ geo: g, mat, os: (this.vue && o.os) || null });
    return g;
  }
  // (en 3e personne la boîte est nue : à 10 m un chanfrein de 4 mm ne se voit pas, et il coûte 32 triangles — sauf `c3`, le
  // chanfrein gardé des pièces qui font la silhouette : garde-mains octogonaux, pompe)
  boite(mat, p, [l, h, pr], o = {}) { if ((o.vue && !this.vue) || (o.trois && this.vue)) return null; return this._poser(chanfrein(l, h, pr, this.vue ? o.c || 0 : o.c3 || 0), mat, { ...o, p }); }
  cyl(mat, p, r, long, o = {}) { if ((o.vue && !this.vue) || (o.trois && this.vue)) return null; return this._poser(cylindreZ(r, o.r2 ?? r, long, this.s(o.seg || 16), !!o.ouvert), mat, { ...o, p }); }
  // un cylindre d'un point à un autre (tiges, leviers)
  barre(mat, a, b, r, o = {}) {
    if ((o.vue && !this.vue) || (o.trois && this.vue)) return null;
    const d = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]), L = d.length();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), d.divideScalar(L));
    return this._poser(cylindreZ(r, r, L, this.s(o.seg || 10)), mat, { ...o, p: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2], q });
  }
  // (`profil3` : un profil simplifié pour la 3e personne)
  tour(mat, p, profil, o = {}) { if ((o.vue && !this.vue) || (o.trois && this.vue)) return null; return this._poser(tour(!this.vue && o.profil3 ? o.profil3 : profil, this.s(o.seg || 16)), mat, { lisse: 40, ...o, p }, true); }
  cote(mat, p, points, ep, o = {}) { if ((o.vue && !this.vue) || (o.trois && this.vue)) return null; return this._poser(profilCote(points, ep, { ...o, segBiseau: this.vue ? (o.segBiseau ?? 2) : 1 }), mat, { lisse: 50, ...o, p }); }
  face(mat, p, points, ep, o = {}) { if ((o.vue && !this.vue) || (o.trois && this.vue)) return null; return this._poser(profilFace(points, ep, { ...o, segBiseau: this.vue ? (o.segBiseau ?? 2) : 1 }), mat, { lisse: 50, ...o, p }); }
  sphere(mat, p, r, o = {}) {
    if ((o.vue && !this.vue) || (o.trois && this.vue)) return null;
    const g = new THREE.SphereGeometry(r, this.s(o.w || 12), this.s(o.h || 8, 4)); if (o.ky) g.scale(1, o.ky, 1);
    return this._poser(g, mat, { ...o, p });
  }
  disque(mat, p, r, o = {}) { if ((o.vue && !this.vue) || (o.trois && this.vue)) return null; return this._poser(new THREE.CircleGeometry(r, this.s(o.seg || 12)), mat, { ...o, p }); }
  anneau(mat, p, R, r, o = {}) { if ((o.vue && !this.vue) || (o.trois && this.vue)) return null; return this._poser(new THREE.TorusGeometry(R, r, this.s(o.segT || 6, 4), this.s(o.segR || 18)), mat, { ...o, p }); }
  quadrillee(mat, p, R, ky, o = {}) { return this._poser(quadrillee(R, ky, this.vue), mat, { lisse: 35, ...o, p }, true); }
  // le RAIL (picatinny) : la semelle, et en vue ses dents d'1 cm de pas (en 3e personne, un bloc plein)
  rail(y, z0, z1, l, o = {}) {
    const L = z0 - z1, zc = (z0 + z1) / 2;
    this.boite('acier', [0, y + 0.00225, zc], [l, 0.0045, L], { c: 0.001, ...o });
    this.boite('acier', [0, y + 0.0065, zc], [l * 0.8, 0.004, L], { trois: true, ...o });
    const n = Math.floor(L / 0.01);
    for (let i = 0; i < n; i++) this.boite('acier', [0, y + 0.0065, z0 - 0.005 - i * (L / n)], [l + 0.002, 0.004, 0.0055], { vue: true, ...o });   // (dents nues : 12 triangles)
  }
  // une POIGNÉE PISTOLET (profil de côté, pente `pente` degrés vers l'arrière en descendant depuis `haut`)
  poignee(mat, haut, pente, ep, avant, arriere, bas, o = {}) {
    const ft = (y) => avant + ((y - haut) / (bas - haut) > 0.15 && (y - haut) / (bas - haut) < 0.8 ? 0.003 * Math.max(0, Math.sin(((y - haut) / (bas - haut) - 0.15) / 0.65 * Math.PI * 3)) : 0);
    const P = [];
    for (let i = 0; i <= 9; i++) { const y = haut + (bas - haut) * i / 9; P.push([ft(y), y]); }    // l'avant, à creux de doigts
    P.push([avant - 0.002, bas - 0.002], [arriere + 0.003, bas - 0.002], [arriere + 0.003, bas + 0.010]);
    P.push([arriere - 0.002, (bas + haut) / 2], [arriere, haut - 0.010], [arriere + 0.008, haut - 0.004], [arriere + 0.006, haut]);   // le dos, le bec
    return this.cote(mat, [0, 0, 0], P, ep, { biseau: 0.003, cis: [Math.tan(pente * DEG), haut], ...o });
  }
  // la DÉTENTE (lame courbe sous son pivot, os `detente`)
  detente(pz, py, long, o = {}) {
    return this.cote('acier', [0, 0, 0], [[pz - 0.003, py], [pz + 0.003, py], [pz + 0.004, py - long * 0.45], [pz + 0.002, py - long * 0.8], [pz - 0.003, py - long],
      [pz - 0.006, py - long * 0.9], [pz - 0.004, py - long * 0.45]], 0.006, { biseau: 0.001, segBiseau: 1, os: 'detente', ...o });
  }
  // L'ASSEMBLAGE : les pièces cousues par matériau ; en vue, chaque sommet porté par UN os (poids 1)
  assembler(id) {
    const osNoms = Object.keys(OS_ARMES[id] || {}), lots = new Map(), sommets = {};
    for (const nom of osNoms) sommets[nom] = 0;
    for (const P of this.pieces) {
      let mat = P.mat;
      if (!this.vue) { if (mat in MAT_3E) mat = MAT_3E[mat]; if (!mat) continue; }
      const k = P.os ? osNoms.indexOf(P.os) + 1 : 0;
      if (P.os && k === 0) throw new Error(`modeles_armes : l'os ${P.os} n'est pas dans OS_ARMES.${id}`);
      if (P.os) sommets[P.os] += P.geo.attributes.position.count;
      if (!lots.has(mat)) lots.set(mat, []);
      lots.get(mat).push([P.geo, k]);
    }
    let triangles = 0;
    const L = [...lots].map(([mat, pieces]) => {
      const geo = coudre(pieces, this.vue);
      geo.name = `arme ${id} ${this.vue ? 'vue' : '3e'} ${mat}`; geo.userData.partage = true;
      triangles += geo.attributes.position.count / 3;
      return { mat, geo };
    });
    return { lots: L, osNoms, sommets, triangles };
  }
}

// LA COUTURE d'un lot : positions et normales bout à bout ; en vue, chaque plage de sommets portée par l'os de sa pièce
// (skinIndex = k, skinWeight = 1 : rigide) ; boîte et sphère englobantes (au repos)
function coudre(pieces, vue) {
  let n = 0; for (const [g] of pieces) n += g.attributes.position.count;
  const P = new Float32Array(3 * n), N = new Float32Array(3 * n), SI = vue ? new Uint16Array(4 * n) : null, SW = vue ? new Float32Array(4 * n) : null;
  let o = 0;
  for (const [g, k] of pieces) {
    const c = g.attributes.position.count;
    P.set(g.attributes.position.array, 3 * o); N.set(g.attributes.normal.array, 3 * o);
    if (vue) for (let i = o; i < o + c; i++) { SI[4 * i] = k; SW[4 * i] = 1; }
    o += c;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(P, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(N, 3));
  if (vue) { geo.setAttribute('skinIndex', new THREE.BufferAttribute(SI, 4)); geo.setAttribute('skinWeight', new THREE.BufferAttribute(SW, 4)); }
  let x0 = Infinity, y0 = Infinity, z0 = Infinity, x1 = -Infinity, y1 = -Infinity, z1 = -Infinity;
  for (let i = 0; i < P.length; i += 3) {
    const x = P[i], y = P[i + 1], z = P[i + 2];
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; if (z < z0) z0 = z; if (z > z1) z1 = z;
  }
  geo.boundingBox = new THREE.Box3(new THREE.Vector3(x0, y0, z0), new THREE.Vector3(x1, y1, z1));
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, cz = (z0 + z1) / 2;
  let r2 = 0; for (let i = 0; i < P.length; i += 3) { const a = P[i] - cx, b = P[i + 1] - cy, c = P[i + 2] - cz, d = a * a + b * b + c * c; if (d > r2) r2 = d; }
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(cx, cy, cz), Math.sqrt(r2));
  return geo;
}

// ---------------------------------------------------------------------
//  LES PLANS (mètres, repère de l'arme ; l'axe du canon à la hauteur de la bouche)
// ---------------------------------------------------------------------
const PLANS = {
  // FA-24 « FAUCON » — fusil d'assaut, terre (0x9a8665) : boîtier 0,05 × 0,075 × 0,28, garde-main à rails 0,056 × 0,06 × 0,26,
  // canon r 0,011 + cache-flamme à fentes, crosse extrudée de 0,24 (tube compris), poignée inclinée de 18°, chargeur courbe de
  // 0,20 le long de l'arc (R 0,40), point rouge. De +0,20 (plaque de couche) à −0,64 (cache-flamme) : 0,84 m.
  fa24(A) {
    const Y = 0.035;
    A.boite('teinte', [0, 0.037, -0.070], [0.050, 0.040, 0.250], { c: 0.004 });          // supérieur : y 0,017-0,057, z +0,055-−0,195
    A.boite('teinte', [0, 0.000, -0.060], [0.046, 0.034, 0.210], { c: 0.003 });          // inférieur : y −0,017-0,017
    A.boite('teinte', [0, -0.013, -0.105], [0.051, 0.026, 0.066], { c: 0.005 });         // le puits du chargeur, évasé
    A.rail(0.057, 0.050, -0.190, 0.022);
    // le levier d'armement (os culasse) : la barre en T sous l'arrière du rail, son loquet à gauche
    A.boite('acier', [0, 0.053, 0.064], [0.046, 0.007, 0.012], { c: 0.002, os: 'culasse' });
    A.boite('acier', [-0.026, 0.053, 0.066], [0.009, 0.010, 0.016], { c: 0.002, os: 'culasse' });
    // (en vue, sa tige dans le boîtier : tiré de 7,5 cm, le T reste relié au boîtier au lieu de flotter sur le tube — relecture)
    A.boite('acier', [0, 0.055, 0.020], [0.008, 0.003, 0.080], { os: 'culasse', vue: true });
    // flanc droit (la fenêtre d'éjection, l'assistance de fermeture), flanc gauche (sélecteur, arrêtoir, goupilles)
    A.boite('acier', [0.0253, 0.040, -0.060], [0.0016, 0.017, 0.052], { vue: true });
    A.cyl('acier', [0.027, 0.047, 0.030], 0.0055, 0.024, { seg: 10, vue: true });
    A.boite('acier', [0.0245, 0.000, -0.070], [0.003, 0.008, 0.009], { c: 0.0008, vue: true });
    A.cyl('acier', [-0.0235, 0.006, 0.010], 0.0055, 0.003, { r: [0, Math.PI / 2, 0], seg: 12, vue: true });
    A.boite('acier', [-0.0262, 0.006, 0.003], [0.003, 0.0045, 0.017], { c: 0.0008, r: [0.35, 0, 0], vue: true });
    A.boite('acier', [-0.0245, 0.000, -0.066], [0.003, 0.016, 0.007], { c: 0.0008, vue: true });
    A.cyl('acier', [0, 0.006, 0.035], 0.0028, 0.0475, { r: [0, Math.PI / 2, 0], seg: 10, vue: true });
    A.cyl('acier', [0, 0.006, -0.150], 0.0028, 0.0475, { r: [0, Math.PI / 2, 0], seg: 10, vue: true });
    // le tube de crosse, son écrou, la crosse (ajourée) et la plaque de couche
    A.cyl('acier', [0, Y, 0.120], 0.0145, 0.150, { seg: 16 });
    A.cyl('acier', [0, Y, 0.059], 0.0175, 0.008, { seg: 12, vue: true });
    A.cote('teinte', [0, 0, 0], [[0.078, 0.052], [0.120, 0.058], [0.193, 0.064], [0.193, -0.050], [0.176, -0.052], [0.120, -0.012], [0.095, 0.010], [0.078, 0.014]], 0.040,
      { biseau: 0.004, trous: [[[0.135, -0.004], [0.172, -0.034], [0.183, -0.034], [0.183, 0.008]]] });
    A.boite('polymere', [0, 0.007, 0.1965], [0.042, 0.116, 0.007], { c: 0.002 });
    // la poignée (18°), le pontet, la détente (os)
    A.poignee('polymere', -0.008, 18, 0.030, -0.021, 0.019, -0.112);
    A.boite('teinte', [0, -0.036, -0.041], [0.012, 0.004, 0.066], { c: 0.0012 });          // (jusque dans la poignée)
    A.boite('teinte', [0, -0.026, -0.072], [0.012, 0.024, 0.005], { c: 0.0012 });
    A.detente(-0.040, -0.012, 0.021);
    // le chargeur courbe (os) : son corps, ses nervures du bas (vue), sa semelle
    const R = 0.40, L = 0.205, fin = arcChargeur(-0.105, -0.005, R, L);
    A.cote('polymere', [0, 0, 0], chargeurCourbe(-0.105, -0.005, R, L, 0.029, 0.027, A.s(10)), 0.024, { biseau: 0.0025, os: 'chargeur' });
    for (const s of [0.150, 0.163, 0.176]) { const c = arcChargeur(-0.105, -0.005, R, s); A.boite('polymere', [0, c.y, c.z], [0.0256, 0.0025, 0.0575], { c: 0.0007, r: [c.f, 0, 0], os: 'chargeur', vue: true }); }
    A.boite('polymere', [0, fin.y - 0.003 * Math.cos(fin.f), fin.z - 0.003 * Math.sin(fin.f)], [0.028, 0.010, 0.064], { c: 0.003, r: [fin.f, 0, 0], os: 'chargeur' });
    // le garde-main à rails (octogonal : gros chanfrein), ses ouïes (vue), son rail du dessus, le rail du dessous et l'arrêt de main
    A.boite('teinte', [0, 0.027, -0.325], [0.056, 0.060, 0.262], { c: 0.012, c3: 0.012 });         // y −0,003-0,057, z −0,194-−0,456
    A.rail(0.057, -0.196, -0.452, 0.022);
    for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) A.boite('polymere', [sx * 0.0284, 0.030, -0.245 - i * 0.045], [0.0012, 0.011, 0.032], { vue: true });
    A.boite('acier', [0, -0.0055, -0.400], [0.020, 0.005, 0.080], { c: 0.001 });
    A.cote('polymere', [0, 0, 0], [[-0.382, -0.007], [-0.420, -0.007], [-0.416, -0.026], [-0.405, -0.028]], 0.018, { biseau: 0.003 });
    // le canon, le bloc d'emprunt de gaz, le cache-flamme (tour creux) et ses trois fentes
    A.cyl('acier', [0, Y, -0.515], 0.0105, 0.142, { seg: 16 });
    A.boite('acier', [0, 0.030, -0.468], [0.020, 0.024, 0.018], { c: 0.002, vue: true });
    A.tour('acier', [0, Y, 0], [[0, -0.598], [0.0062, -0.598], [0.0062, -0.6392], [0.0102, -0.640], [0.0128, -0.6372], [0.0128, -0.592], [0.0114, -0.5865], [0.0105, -0.584], [0, -0.584]], { seg: 16 });
    for (const a of [0, 120, 240]) A.boite('polymere', [Math.sin(a * DEG) * 0.0128, Y + Math.cos(a * DEG) * 0.0128, -0.618], [0.0026, 0.0018, 0.030], { r: [0, 0, -a * DEG], vue: true });
    // le point rouge : embase, boîtier (tour creux), molette, le point (verre émissif) au repère de visée
    A.boite('acier', [0, 0.0695, -0.080], [0.026, 0.008, 0.036], { c: 0.002 });
    A.tour('acier', [0, 0.088, -0.080], [[0.0160, -0.018], [0.0186, -0.018], [0.0196, -0.0165], [0.0196, 0.0165], [0.0186, 0.018], [0.0160, 0.018], [0.0160, -0.018]], { seg: 24 });
    A.cyl('acier', [0.0215, 0.088, -0.078], 0.0065, 0.008, { r: [0, Math.PI / 2, 0], seg: 14, vue: true });
    A.sphere('verre', [0, 0.088, -0.080], 0.0009, { w: 10, h: 6, vue: true });
    // les organes de visée de secours, repliés (vue)
    A.boite('acier', [0, 0.0695, -0.030], [0.020, 0.008, 0.012], { c: 0.002, vue: true });
    A.boite('acier', [0, 0.0695, -0.440], [0.018, 0.008, 0.014], { c: 0.002, vue: true });
  },

  // PM-9 « GUÊPE » — pistolet-mitrailleur, noir : boîtier compact, garde-main court de 0,16, viseur à fenêtre (point rouge),
  // chargeur droit de 0,17 (incliné de 4°), crosse en fil (charnière à gauche), compensateur. De +0,195 à −0,425 : 0,62 m.
  pm9(A) {
    const Y = 0.030;
    A.boite('teinte', [0, 0.028, -0.050], [0.044, 0.044, 0.240], { c: 0.004 });          // y 0,006-0,050, z +0,07-−0,17
    A.boite('polymere', [0, -0.007, -0.035], [0.040, 0.026, 0.170], { c: 0.003 });       // y −0,020-0,006
    A.boite('polymere', [0, -0.026, -0.085], [0.036, 0.022, 0.050], { c: 0.004 });       // le puits
    A.rail(0.050, 0.055, -0.150, 0.020);
    // le viseur à fenêtre : embase, cadre (profil de face ajouré), le point
    A.boite('acier', [0, 0.0615, -0.050], [0.026, 0.006, 0.036], { c: 0.002 });
    A.face('acier', [0, 0.075, -0.050], rectArrondi(0.034, 0.028, 0.006), 0.010, { trous: [rectArrondi(0.025, 0.018, 0.003)], biseau: 0.0015 });
    A.sphere('verre', [0, 0.075, -0.050], 0.0008, { w: 10, h: 6, vue: true });
    // le levier d'armement à gauche (os culasse), dans sa fente ; l'éjection à droite
    A.boite('polymere', [-0.0222, 0.034, -0.105], [0.0012, 0.006, 0.072], { vue: true });
    A.boite('acier', [-0.030, 0.034, -0.130], [0.016, 0.008, 0.010], { c: 0.002, os: 'culasse' });
    A.cyl('acier', [-0.040, 0.034, -0.130], 0.0055, 0.010, { r: [0, Math.PI / 2, 0], seg: 12, os: 'culasse' });
    A.boite('polymere', [0.0222, 0.040, -0.050], [0.0012, 0.014, 0.040], { vue: true });
    A.cyl('acier', [0, -0.006, 0.030], 0.0026, 0.0415, { r: [0, Math.PI / 2, 0], seg: 10, vue: true });
    A.cyl('acier', [0, -0.006, -0.105], 0.0026, 0.0415, { r: [0, Math.PI / 2, 0], seg: 10, vue: true });
    A.boite('acier', [-0.0212, -0.006, 0.000], [0.003, 0.005, 0.016], { c: 0.0008, r: [0.3, 0, 0], vue: true });
    // le garde-main court et ses nervures
    A.boite('polymere', [0, 0.027, -0.250], [0.044, 0.042, 0.160], { c: 0.010, c3: 0.010 });       // y 0,006-0,048, z −0,17-−0,33
    for (const sx of [-1, 1]) for (const y of [0.020, 0.034]) A.boite('teinte', [sx * 0.0222, y, -0.255], [0.0012, 0.0035, 0.115], { vue: true });
    // le canon, le compensateur et ses évents
    A.cyl('acier', [0, Y, -0.357], 0.0085, 0.056, { seg: 14 });
    A.tour('acier', [0, Y, 0], [[0, -0.395], [0.0052, -0.395], [0.0052, -0.4245], [0.0092, -0.425], [0.0118, -0.4225], [0.0118, -0.388], [0.0100, -0.383], [0, -0.383]], { seg: 16 });
    for (let i = 0; i < 3; i++) A.boite('polymere', [0, Y + 0.0117, -0.398 - i * 0.0085], [0.007, 0.0015, 0.0045], { vue: true });
    // la poignée (15°), le pontet, la détente
    A.poignee('polymere', -0.014, 15, 0.029, -0.020, 0.019, -0.112);
    A.boite('polymere', [0, -0.040, -0.0355], [0.011, 0.004, 0.059], { c: 0.0012 });
    A.boite('polymere', [0, -0.030, -0.0645], [0.011, 0.022, 0.005], { c: 0.0012 });
    A.detente(-0.036, -0.016, 0.021);
    // le chargeur droit (os), ses trous témoins à gauche (vue), sa semelle
    A.cote('acier', [0, 0, 0], [[-0.068, -0.012], [-0.102, -0.012], [-0.114, -0.185], [-0.080, -0.185]], 0.020, { biseau: 0.002, os: 'chargeur' });
    for (const y of [-0.060, -0.090, -0.120]) A.disque('polymere', [-0.0101, y, -0.085 - (-0.012 - y) * 0.0694], 0.0022, { r: [0, -Math.PI / 2, 0], seg: 8, os: 'chargeur', vue: true });
    A.boite('polymere', [0, -0.189, -0.097], [0.024, 0.009, 0.040], { c: 0.002, r: [0.07, 0, 0], os: 'chargeur' });
    // la crosse en fil : charnière à gauche, deux boucles, la plaque de couche
    A.cyl('acier', [-0.019, 0.020, 0.074], 0.006, 0.044, { r: [Math.PI / 2, 0, 0], seg: 12 });
    for (const sx of [-1, 1]) {
      A.barre('acier', [sx * 0.016, 0.044, 0.070], [sx * 0.016, 0.046, 0.182], 0.0042);
      A.barre('acier', [sx * 0.016, 0.000, 0.070], [sx * 0.016, -0.030, 0.182], 0.0042);
    }
    A.boite('polymere', [0, 0.008, 0.1865], [0.040, 0.095, 0.017], { c: 0.004 });
  },

  // FP-12 « BÉLIER » — fusil à pompe, vert (0x5b5f45) : boîtier d'acier, canon et tube magasin dessous, pompe de 0,18 (course
  // de 9 cm, os), crosse à poignée intégrée et trou de pouce, guidon perle (au repère de visée) et œilleton, porte-cartouches
  // à gauche. De +0,215 (plaque) à −0,745 (couronne) : 0,96 m (la bouche, repère, à −0,78 : écart noté au rapport).
  fp12(A) {
    const Y = 0.030;
    A.boite('acier', [0, 0.017, -0.130], [0.040, 0.064, 0.220], { c: 0.004 });           // y −0,015-0,049, z −0,02-−0,24
    A.rail(0.049, -0.060, -0.180, 0.016);
    A.boite('polymere', [0.0205, 0.034, -0.080], [0.002, 0.020, 0.052], { vue: true });   // la fenêtre d'éjection
    A.boite('polymere', [0, -0.0155, -0.150], [0.026, 0.002, 0.090], { vue: true });       // la fenêtre de chargement
    A.anneau('acier', [0, 0.060, -0.035], 0.0058, 0.0016, { segR: 16 });                    // l'œilleton (la ligne de mire y passe)
    A.boite('acier', [0, 0.0525, -0.035], [0.004, 0.009, 0.006], { c: 0.0008 });
    // le canon, son rail ventilé, la couronne creuse, le guidon et sa perle (au repère `visee`)
    A.cyl('acier', [0, Y, -0.480], 0.0115, 0.480, { seg: 18 });
    A.tour('acier', [0, Y, 0], [[0, -0.722], [0.0092, -0.722], [0.0092, -0.7445], [0.0108, -0.745], [0.0118, -0.742], [0.0118, -0.718], [0, -0.718]], { seg: 18 });
    A.boite('acier', [0, 0.0465, -0.480], [0.007, 0.0035, 0.480], { vue: true });
    for (let i = 0; i < 8; i++) A.boite('acier', [0, 0.0428, -0.27 - i * 0.058], [0.004, 0.0045, 0.006], { vue: true });
    A.boite('acier', [0, 0.0525, -0.700], [0.004, 0.010, 0.010], { c: 0.001 });
    A.sphere('blanc', [0, 0.060, -0.700], 0.0035, { w: 12, h: 8 });
    // le tube magasin, son bouchon, le collier
    A.cyl('acier', [0, 0.0065, -0.450], 0.0105, 0.420, { seg: 16 });
    A.tour('acier', [0, 0.0065, 0], [[0, -0.678], [0.0085, -0.678], [0.0115, -0.674], [0.0115, -0.660], [0, -0.660]], { seg: 16 });
    A.boite('acier', [0, 0.017, -0.635], [0.024, 0.038, 0.014], { c: 0.004 });
    // la pompe (os) et ses stries, ses barres d'action (dans le boîtier au repos)
    A.boite('teinte', [0, 0.0015, -0.420], [0.046, 0.032, 0.180], { c: 0.009, c3: 0.009, os: 'pompe' });       // y −0,0145-0,0175 (sous le canon), z −0,33-−0,51
    for (let i = 0; i < 7; i++) A.boite('polymere', [0, 0.0015, -0.360 - i * 0.020], [0.0482, 0.0342, 0.0055], { c: 0.008, os: 'pompe', vue: true });
    for (const sx of [-1, 1]) A.boite('acier', [sx * 0.0125, 0.012, -0.280], [0.002, 0.005, 0.100], { os: 'pompe', vue: true });
    // la crosse à poignée intégrée (15°), trou de pouce ; la plaque de couche
    const k = Math.tan(15 * DEG), gz = (z, y) => [z + (-0.015 - y) * k, y];
    A.cote('teinte', [0, 0, 0], [[-0.025, 0.046], [0.030, 0.045], [0.075, 0.030], [0.120, 0.034], [0.190, 0.040], [0.200, 0.039], [0.200, -0.104], [0.188, -0.108], [0.120, -0.080], [0.075, -0.068],
      [0.044, -0.066], gz(0.020, -0.090), gz(0.022, -0.110), gz(0.020, -0.114), gz(-0.020, -0.114), gz(-0.022, -0.100), gz(-0.018, -0.080), gz(-0.022, -0.062),
      gz(-0.018, -0.045), gz(-0.020, -0.030), [-0.014, -0.018], [-0.025, -0.018]], 0.040, { biseau: 0.005, trous: [ellipse(0.090, -0.034, 0.036, 0.019, A.s(16, 10))] });
    A.boite('polymere', [0, -0.0325, 0.2075], [0.042, 0.145, 0.015], { c: 0.004 });
    // le bloc de détente, le pontet, la sûreté transversale, la détente
    A.boite('polymere', [0, -0.021, -0.060], [0.030, 0.020, 0.075], { c: 0.003 });
    A.boite('polymere', [0, -0.046, -0.0365], [0.010, 0.004, 0.057], { c: 0.0012 });
    A.boite('polymere', [0, -0.039, -0.064], [0.010, 0.019, 0.004], { c: 0.0012 });
    A.cyl('acier', [0, -0.016, -0.022], 0.004, 0.034, { r: [0, Math.PI / 2, 0], seg: 10, vue: true });
    A.detente(-0.050, -0.016, 0.024);
    // le porte-cartouches à gauche (vue) : quatre cartouches debout, culot poli en haut
    A.boite('polymere', [-0.0215, 0.020, -0.130], [0.004, 0.040, 0.110], { c: 0.0015, vue: true });
    for (let i = 0; i < 4; i++) {
      A.cyl('polymere', [-0.034, 0.016, -0.094 - i * 0.024], 0.0105, 0.048, { r: [Math.PI / 2, 0, 0], seg: 12, vue: true });
      A.cyl('poli', [-0.034, 0.044, -0.094 - i * 0.024], 0.0109, 0.010, { r: [Math.PI / 2, 0, 0], seg: 12, vue: true });
    }
  },

  // TP-50 « HÉRON » — précision à verrou, sable (0xb8a27a) : canon long conique, frein de bouche, lunette r 0,022 × 0,32
  // (lentilles à reflet, tourelles), culasse à levier (os : se lève de 60° puis recule de 8 cm), bipied replié, crosse à
  // trou de pouce et appui-joue, chargeur de 5 (os). De +0,247 (plaque) à −0,855 (frein) : 1,10 m.
  tp50(A) {
    const Y = 0.030;
    A.cyl('acier', [0, Y, -0.070], 0.0165, 0.210, { seg: 18 });                           // le boîtier, z +0,035-−0,175
    A.rail(0.0465, 0.030, -0.185, 0.020);
    A.boite('polymere', [0.0166, 0.036, -0.050], [0.002, 0.012, 0.050], { vue: true });   // la fenêtre d'éjection
    // la culasse (os) : corps poli, chapeau, levier et sa boule
    A.cyl('poli', [0, Y, 0.049], 0.0115, 0.038, { seg: 16, os: 'culasse' });
    // (en vue, le corps se prolonge dans le boîtier jusqu'à −0,05 : reculée de 8 cm, la culasse sort du boîtier au lieu de
    // flotter 7,5 cm derrière lui — relecture)
    A.cyl('poli', [0, Y, -0.010], 0.0112, 0.080, { seg: 16, os: 'culasse', vue: true });
    A.cyl('acier', [0, Y, 0.066], 0.0125, 0.008, { seg: 16, os: 'culasse' });
    A.barre('acier', [0.008, 0.028, 0.050], [0.037, 0.012, 0.056], 0.0045, { os: 'culasse' });
    A.sphere('acier', [0.042, 0.010, 0.057], 0.0095, { w: 14, h: 10, os: 'culasse' });
    // le canon conique, le frein de bouche et ses évents, la bouche (vue)
    A.cyl('acier', [0, Y, -0.4875], 0.0125, 0.625, { r2: 0.0098, seg: 18 });
    A.boite('acier', [0, Y, -0.826], [0.030, 0.026, 0.058], { c: 0.006 });
    for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) A.boite('polymere', [sx * 0.0151, Y, -0.810 - i * 0.015], [0.002, 0.014, 0.008], { vue: true });
    A.disque('polymere', [0, Y, -0.8552], 0.0055, { r: [0, Math.PI, 0], seg: 12, vue: true });
    // la lunette (tour : oculaire, tube, objectif), ses lentilles, ses tourelles, ses colliers
    A.tour('acier', [0, 0.075, 0], [[0, -0.296], [0.0205, -0.296], [0.0205, -0.305], [0.0222, -0.305], [0.0225, -0.300], [0.0225, -0.250], [0.0160, -0.215],
      [0.0160, -0.090], [0.0185, -0.075], [0.0200, -0.060], [0.0200, 0.005], [0.0192, 0.010], [0.0170, 0.010], [0.0170, 0.004], [0, 0.004]],
      { seg: 24, profil3: [[0, -0.305], [0.0225, -0.305], [0.0225, -0.250], [0.0160, -0.215], [0.0160, -0.090], [0.0200, -0.060], [0.0200, 0.010], [0, 0.010]] });
    A.disque('lentille', [0, 0.075, 0.0045], 0.0170, { seg: 20 });
    A.disque('lentille', [0, 0.075, -0.2955], 0.0205, { r: [0, Math.PI, 0], seg: 20 });
    A.boite('acier', [0, 0.075, -0.150], [0.034, 0.034, 0.030], { c: 0.006 });
    A.cyl('acier', [0, 0.099, -0.150], 0.0105, 0.016, { r: [Math.PI / 2, 0, 0], seg: 16 });
    A.cyl('acier', [0.024, 0.075, -0.150], 0.0105, 0.016, { r: [0, Math.PI / 2, 0], seg: 16 });
    A.cyl('acier', [-0.023, 0.075, -0.150], 0.0095, 0.014, { r: [0, Math.PI / 2, 0], seg: 16, vue: true });
    for (const z of [-0.105, -0.195]) {
      A.tour('acier', [0, 0.075, z], [[0.0158, -0.006], [0.0185, -0.006], [0.0188, -0.004], [0.0188, 0.004], [0.0185, 0.006], [0.0158, 0.006], [0.0158, -0.006]], { seg: 18, vue: true });
      A.cyl('acier', [0, 0.075, z], 0.0188, 0.012, { seg: 16, ouvert: true, trois: true });
      A.boite('acier', [0, 0.0575, z], [0.022, 0.010, 0.012], { c: 0.0015 });
    }
    // la crosse à trou de pouce : fût, logement du boîtier, poignée (10°), appui-joue, couche
    const k = Math.tan(10 * DEG), gz = (z, y) => [z + (-0.030 - y) * k, y];
    A.cote('teinte', [0, 0, 0], [[-0.505, 0.022], [-0.512, 0.016], [-0.514, 0.006], [-0.510, -0.002], [-0.500, -0.006], [-0.200, -0.008], [-0.170, -0.020], [-0.150, -0.030],
      [-0.012, -0.030], gz(-0.014, -0.045), gz(-0.010, -0.060), gz(-0.014, -0.075), gz(-0.008, -0.090), gz(-0.006, -0.112), gz(0.030, -0.116), [0.080, -0.100], [0.150, -0.100],
      [0.220, -0.112], [0.235, -0.110], [0.235, 0.050], [0.228, 0.056], [0.160, 0.056], [0.155, 0.040], [0.150, 0.018], [0.040, 0.018], [0.035, 0.024], [-0.175, 0.024], [-0.180, 0.022]],
      0.045, { biseau: 0.005, trous: [ellipse(0.090, -0.060, 0.042, 0.019, A.s(16, 10))] });
    A.boite('polymere', [0, -0.030, 0.241], [0.046, 0.164, 0.012], { c: 0.004 });
    for (const sx of [-1, 1]) A.cyl('acier', [sx * 0.0235, 0.034, 0.190], 0.005, 0.004, { r: [0, Math.PI / 2, 0], seg: 12, vue: true });
    // le chargeur (os) et sa semelle ; le pontet ; la détente
    A.boite('acier', [0, -0.045, -0.100], [0.024, 0.050, 0.075], { c: 0.003, os: 'chargeur' });
    A.boite('polymere', [0, -0.073, -0.100], [0.028, 0.008, 0.080], { c: 0.002, os: 'chargeur' });
    A.boite('acier', [0, -0.050, -0.035], [0.012, 0.004, 0.060], { c: 0.0012 });
    A.boite('acier', [0, -0.040, -0.064], [0.012, 0.025, 0.004], { c: 0.0012 });
    A.detente(-0.038, -0.028, 0.018);
    // le bipied replié : embase, charnière, deux jambes vers l'avant (rallonges en vue), patins
    A.boite('acier', [0, -0.012, -0.455], [0.030, 0.012, 0.030], { c: 0.003 });
    A.cyl('acier', [0, -0.016, -0.462], 0.005, 0.036, { r: [0, Math.PI / 2, 0], seg: 12 });
    for (const sx of [-1, 1]) {
      A.cyl('acier', [sx * 0.011, -0.012, -0.540], 0.0060, 0.150, { seg: 10 });
      A.cyl('poli', [sx * 0.011, -0.012, -0.600], 0.0042, 0.060, { seg: 8, vue: true });
      A.boite('polymere', [sx * 0.011, -0.012, -0.632], [0.013, 0.013, 0.016], { c: 0.003 });
    }
  },

  // P-17 « MOINEAU » — pistolet, noir : glissière d'acier 0,028 × 0,035 × 0,19 (os : recule de 3 cm), carcasse noire et
  // poignée de 15°, cran et guidon à points blancs, stries, rail sous le canon, chargeur dans la poignée (os). 0,19 m.
  p17(A) {
    const Y = 0.035;
    A.boite('acier', [0, 0.0375, -0.040], [0.028, 0.035, 0.190], { c: 0.003, os: 'glissiere' });        // y 0,020-0,055, z +0,055-−0,135
    for (let i = 0; i < 6; i++) A.boite('polymere', [0, 0.037, 0.042 - i * 0.004], [0.0292, 0.022, 0.0016], { os: 'glissiere', vue: true });
    for (let i = 0; i < 5; i++) A.boite('polymere', [0, 0.037, -0.098 - i * 0.004], [0.0292, 0.020, 0.0016], { os: 'glissiere', vue: true });
    A.boite('polymere', [0.004, 0.0552, -0.035], [0.012, 0.0008, 0.030], { os: 'glissiere', vue: true });     // la fenêtre d'éjection
    A.boite('poli', [0.004, 0.0548, -0.035], [0.010, 0.002, 0.026], { vue: true });                        // le canon dedans (fixe)
    // le canon et le guide du ressort, FIXES, dans la glissière au repos : ils paraissent quand elle recule (3 cm au tir, en
    // arrière tant que L-V la tient à vide) — sans eux la couronne flottait 2,5 cm devant la glissière reculée (relecture)
    A.cyl('poli', [0, Y, -0.1005], 0.0058, 0.060, { seg: 14, vue: true });                               // z −0,1305-−0,0705
    A.cyl('acier', [0, 0.026, -0.1145], 0.0032, 0.040, { seg: 10, vue: true });                           // z −0,1345-−0,0945
    // le cran (deux oreilles, deux points) et le guidon (un point), sur la glissière
    A.boite('acier', [0, 0.0565, 0.044], [0.022, 0.003, 0.010], { c: 0.0006, os: 'glissiere' });
    for (const sx of [-1, 1]) {
      A.boite('acier', [sx * 0.007, 0.060, 0.044], [0.008, 0.004, 0.010], { c: 0.0006, os: 'glissiere' });
      A.disque('blanc', [sx * 0.007, 0.0600, 0.0491], 0.0011, { seg: 10, os: 'glissiere', vue: true });
    }
    A.boite('acier', [0, 0.058, -0.124], [0.0035, 0.006, 0.006], { c: 0.0005, os: 'glissiere' });
    A.disque('blanc', [0, 0.0595, -0.1209], 0.0011, { seg: 10, os: 'glissiere', vue: true });
    // la bouche : couronne polie, âme, guide du ressort
    A.tour('poli', [0, Y, 0], [[0, -0.1352], [0.0045, -0.1352], [0.0060, -0.1350], [0.0060, -0.1300], [0, -0.1300]], { seg: 14, vue: true });
    A.disque('polymere', [0, Y, -0.1353], 0.0040, { r: [0, Math.PI, 0], seg: 10, vue: true });
    A.disque('acier', [0, 0.026, -0.1352], 0.0035, { r: [0, Math.PI, 0], seg: 10, vue: true });
    // la carcasse : rails, cache-poussière et son rail, bec de poignée
    A.boite('teinte', [0, 0.0125, -0.0425], [0.026, 0.016, 0.175], { c: 0.003 });           // y 0,0045-0,0205, z +0,045-−0,13
    A.boite('teinte', [0, 0.000, -0.102], [0.022, 0.010, 0.056], { c: 0.002 });
    for (let i = 0; i < 2; i++) A.boite('polymere', [0, -0.0052, -0.092 - i * 0.018], [0.0225, 0.0012, 0.006], { vue: true });
    A.boite('teinte', [0, 0.008, 0.045], [0.024, 0.010, 0.020], { c: 0.003 });
    // la poignée (15°) et ses plaquettes, le pontet carré, la détente, l'arrêtoir et le levier de démontage (à gauche)
    A.poignee('teinte', 0.006, 15, 0.030, -0.021, 0.023, -0.098);
    for (const sx of [-1, 1]) A.boite('polymere', [sx * 0.0156, -0.048, 0.015], [0.0012, 0.064, 0.032], { r: [-15 * DEG, 0, 0], vue: true });
    A.boite('teinte', [0, -0.026, -0.0355], [0.010, 0.0045, 0.059], { c: 0.0012 });
    A.boite('teinte', [0, -0.0105, -0.0625], [0.010, 0.032, 0.005], { c: 0.0012 });
    A.detente(-0.028, 0.004, 0.024);
    A.boite('acier', [-0.0145, 0.016, -0.035], [0.003, 0.005, 0.016], { c: 0.0008, vue: true });
    A.boite('acier', [-0.0140, 0.012, -0.060], [0.003, 0.004, 0.006], { c: 0.0008, vue: true });
    // le chargeur (os) : le corps, caché dans la poignée au repos, la semelle dessous
    A.boite('acier', [0, -0.046, 0.0149], [0.019, 0.104, 0.030], { c: 0.002, r: [-15 * DEG, 0, 0], os: 'chargeur' });
    A.boite('polymere', [0, -0.102, 0.029], [0.028, 0.008, 0.046], { c: 0.002, r: [-15 * DEG, 0, 0], os: 'chargeur' });
  },

  // LE COUTEAU — lame extrudée biseautée (tranchant poli, gouttière), garde, manche à creux de doigts, pommeau : 0,29 m,
  // la main droite au milieu du manche (origine), tranchant vers le bas.
  couteau(A) {
    A.cote('teinte', [0, 0, 0], [[-0.045, 0.012], [0.000, 0.014], [0.050, 0.012], [0.056, 0.008], [0.056, -0.012], [0.050, -0.016], [0.035, -0.017], [0.027, -0.013],
      [0.019, -0.017], [0.011, -0.013], [0.003, -0.017], [-0.005, -0.013], [-0.013, -0.017], [-0.030, -0.016], [-0.045, -0.014]], 0.022, { biseau: 0.004 });
    A.boite('acier', [0, -0.004, -0.0485], [0.012, 0.050, 0.007], { c: 0.0015 });
    A.boite('acier', [0, -0.002, 0.060], [0.020, 0.024, 0.010], { c: 0.003 });
    const E = [[-0.058, -0.012], [-0.070, -0.0165], [-0.120, -0.0165], [-0.175, -0.015], [-0.205, -0.010], [-0.225, -0.002]];
    A.cote('acier', [0, 0, 0], [[-0.052, 0.010], [-0.165, 0.010], [-0.195, 0.006], ...E.slice().reverse(), [-0.052, -0.012]], 0.0042, { biseau: 0.0008, segBiseau: 1 });
    A.cote('poli', [0, 0, 0], [...E, ...E.slice(0, -1).reverse().map(([z, y]) => [z, y + 0.004])], 0.0048, { biseau: 0.0006, segBiseau: 1 });
    A.boite('polymere', [0, 0.004, -0.110], [0.0046, 0.003, 0.080], { vue: true });
  },

  // LA FRAG — corps quadrillé (Ø 0,07, un peu ovale), fusée, cuillère le long du flanc GAUCHE, anneau et goupille (os) à droite
  frag(A) {
    A.quadrillee('teinte', [0, 0, 0], 0.035, 1.08);
    A.cyl('acier', [0, 0.044, 0], 0.0095, 0.020, { r: [Math.PI / 2, 0, 0], seg: 14 });
    A.cyl('acier', [0, 0.056, 0], 0.0075, 0.004, { r: [Math.PI / 2, 0, 0], seg: 14 });
    A.face('acier', [0, 0, 0], [[-0.004, 0.0585], [-0.018, 0.0575], [-0.030, 0.050], [-0.038, 0.036], [-0.0405, 0.018], [-0.0405, 0.000], [-0.038, -0.008],
      [-0.0355, -0.008], [-0.038, 0.000], [-0.038, 0.018], [-0.0355, 0.0355], [-0.028, 0.048], [-0.017, 0.055], [-0.004, 0.056]], 0.012, { biseau: 0.0008, segBiseau: 1 });
    A.anneau('poli', [0.02, 0.05, 0], 0.0095, 0.0016, { os: 'goupille' });
    A.barre('poli', [0.006, 0.05, 0], [0.0115, 0.05, 0], 0.0013, { os: 'goupille', vue: true });
  },

  // LA FLASH — cylindre Ø 0,04 × 0,12 à trous (vue), cerclages, fusée, cuillère à gauche, anneau et goupille (os) à droite
  flash(A) {
    A.cyl('teinte', [0, -0.005, 0], 0.020, 0.100, { r: [Math.PI / 2, 0, 0], seg: 18 });
    for (const y of [-0.052, 0.042]) A.cyl('acier', [0, y, 0], 0.0206, 0.006, { r: [Math.PI / 2, 0, 0], seg: 18 });
    for (let r = 0; r < 3; r++) for (let i = 0; i < 6; i++) {
      const a = (i * 60 + r * 30) * DEG;
      A.disque('polymere', [Math.sin(a) * 0.0202, -0.030 + r * 0.025, Math.cos(a) * 0.0202], 0.0042, { r: [0, a, 0], seg: 8, vue: true });
    }
    A.cyl('acier', [0, 0.053, 0], 0.009, 0.016, { r: [Math.PI / 2, 0, 0], seg: 14 });
    A.cyl('acier', [0, 0.063, 0], 0.0065, 0.004, { r: [Math.PI / 2, 0, 0], seg: 14 });
    A.face('acier', [0, 0, 0], [[-0.004, 0.0645], [-0.014, 0.0635], [-0.021, 0.058], [-0.0235, 0.045], [-0.0235, -0.020], [-0.021, -0.020], [-0.021, 0.045], [-0.019, 0.056],
      [-0.013, 0.061], [-0.004, 0.062]], 0.010, { biseau: 0.0008, segBiseau: 1 });
    A.anneau('poli', [0.02, 0.06, 0], 0.009, 0.0016, { os: 'goupille' });
    A.barre('poli', [0.007, 0.06, 0], [0.0115, 0.06, 0], 0.0013, { os: 'goupille', vue: true });
  },
};

// ---------------------------------------------------------------------
//  LE CACHE ET LA CRÉATION
// ---------------------------------------------------------------------
const _cache = new Map();
function modele(id, vue) {
  const k = id + (vue ? '|vue' : '|3e');
  let M = _cache.get(k);
  if (!M) { const A = new Atelier(vue); PLANS[id](A); M = A.assembler(id); _cache.set(k, M); }
  return M;
}
// (tests : le coût d'une création À FROID — les géométries déjà données à des armes restent valides, simplement plus partagées)
export function viderCacheArmes() { _cache.clear(); }
const IDENTITE = new THREE.Matrix4();

export function creerArme(id, { pourVue = false } = {}) {
  const cle = PLANS[id] ? id : 'fa24';
  const M = modele(cle, pourVue);
  const g = new THREE.Group(); g.name = 'arme ' + id;
  let os = null, squelette = null;
  if (pourVue) {
    // le squelette : la racine à l'origine, un os par pièce mobile à son pivot ; inverses prises à la création (groupe à
    // l'identité) ; tous les maillages de l'arme le partagent (three ne le met à jour qu'une fois par image)
    const racine = new THREE.Bone(); racine.name = 'racine'; g.add(racine);
    const L = [racine];
    os = {}; for (const n of NOMS_OS) os[n] = null;
    for (const n of M.osNoms) { const b = new THREE.Bone(); b.name = n; b.position.fromArray(OS_ARMES[cle][n]); racine.add(b); L.push(b); os[n] = b; }
    g.updateMatrixWorld(true);
    squelette = new THREE.Skeleton(L);
  }
  for (const lot of M.lots) {
    const mat = matDe(lot.mat, cle);
    let m;
    if (pourVue) {
      m = new THREE.SkinnedMesh(lot.geo, mat);
      m.bind(squelette, IDENTITE);
      m.frustumCulled = false;                       // (la boîte de l'arme de vue ne suit pas ses os ; elle est toujours devant l'œil)
      // (celles du repos, le tri seulement ; COPIÉES : SkinnedMesh.computeBoundingBox() les réécrit sur place, os compris — sur
      // l'objet de la géométrie partagée, il fausserait la boîte de toutes les autres armes — relecture)
      m.boundingBox = lot.geo.boundingBox.clone(); m.boundingSphere = lot.geo.boundingSphere.clone();
    } else {
      m = new THREE.Mesh(lot.geo, mat);
      m.castShadow = true; m.receiveShadow = true;
    }
    m.name = g.name + ' ' + lot.mat;
    g.add(m);
  }
  // les repères : tous enfants directs du groupe, `position` = la table ; en vue, ceux d'une pièce mobile ont un jumeau enfant
  // de son os (`reperesMobiles`). (Le constructeur les avait mis SOUS l'os à la place : leur `position` devenait relative au
  // pivot — la main gauche du FP-12 à 42 cm de la table pour qui lit `position`, comme le test F2 de L-V — relecture.)
  const reperes = {}, mobiles = pourVue ? {} : null;
  for (const [nom, p] of Object.entries(REPERES[cle] || {})) {
    if (!Array.isArray(p)) continue;
    const r = new THREE.Object3D(); r.name = nom; r.position.set(p[0], p[1], p[2]); g.add(r); reperes[nom] = r;
    const porteur = pourVue && PORTES[cle] ? PORTES[cle][nom] : null;
    if (porteur && os[porteur]) {
      const q = OS_ARMES[cle][porteur], j = new THREE.Object3D(); j.name = nom + ' (suit ' + porteur + ')';
      j.position.set(p[0] - q[0], p[1] - q[1], p[2] - q[2]); os[porteur].add(j); mobiles[nom] = j;
    }
  }
  g.userData.reperes = reperes;
  g.userData.reperesMobiles = mobiles;
  g.userData.os = os;
  g.userData.arme = id;
  g.userData.squelette = squelette;
  g.userData.appels = M.lots.length;
  g.userData.triangles = M.triangles;
  if (pourVue) g.userData.sommetsParOs = { ...M.sommets };
  else g.userData.dynamique = true;                  // (racine de scène à la 3e personne : § 4.1 règle 6)
  g.updateMatrixWorld(true);
  return g;
}
// rendre une arme : la retirer de son parent et libérer la TEXTURE D'OS de son squelette (vue) — jamais ses géométries ni
// ses matériaux, partagés par toutes les autres
export function libererArme(g) {
  if (!g) return;
  if (g.parent) g.parent.remove(g);
  if (g.userData.squelette) { g.userData.squelette.dispose(); g.userData.squelette = null; }
}
