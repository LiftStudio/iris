// =====================================================================
//  CE QUE LA CAMÉRA PEUT VOIR : L'ÉCOLE DESSINÉE PAR ZONES (lot 5 « rendu-perf », 11/10/2026)
// =====================================================================
// Ce qui coûte dans une image, c'est le nombre d'APPELS DE DESSIN (js/kit_decor.js optimiserDecor) : sur la Radeon
// intégrée, ANGLE en passe chacun à Direct3D pour 20 à 35 µs de processeur. Les niveaux avaient déjà leurs règles (un
// groupe par étage, montré quand la caméra peut le voir : js/ecole_etage1.js, ecole_etage2.js, ecole_soussol.js,
// ecole_soussol_est.js), mais le rez-de-chaussée et la rue étaient dessinés PARTOUT : au 2e, au -1, dans la salle Robert
// Kahn ; et depuis la rue, le 1er et le 2e en entier — l'espace pause, la Kahn, le palier —, pour ce qu'on en voit par
// les fenêtres. Mesuré (1 600 × 900, haute) : 2 150 appels dans la rue, 1 480 sur le palier est du 1er, 1 280 sur celui
// du 2e, 1 190 dans le sas du -1.
//
// LA MÉTHODE.
//   1. L'école est partagée en ZONES : des boîtes du plan (x, y) et de hauteur (`ZONES`) — la rue ; les deux cages et la
//      trémie, coupées par niveau ; à chaque niveau, l'est autour de la cage est ; au rez-de-chaussée, les pièces fermées
//      par une porte automatique ; au 1er et au 2e, les pièces sur rue (et leur dedans sous l'appui des fenêtres) et le
//      reste. Ce qui n'est dans aucune boîte (les mitoyens, le toit, la courette, l'arrière) est « dehors » : toujours
//      dessiné.
//   2. Chaque TRIANGLE du décor cousu (js/kit_decor.js optimiserDecor, js/ecole_portes.js fusionnerLocal) est rangé dans
//      les zones que touche sa boîte grossie de 6 cm (une face de mur, dans la pièce qu'elle regarde : le mur a 12 cm au
//      moins ; une vitre ou une cloison mince, dans les deux), et dans la FAMILLE de la zone qu'il regarde. Le bloc garde
//      ses sommets et son matériau ; ses triangles sont seulement rangés par famille (`couper`). Quand tout s'en voit, il
//      est dessiné entier, comme avant (pas un appel de dessin de plus) ; sinon, seules ses suites de familles visibles.
//      Une porte est rangée en entier dans les zones de ses deux côtés ; un maillage qu'on ne coupe pas (un sol à carte de
//      lumière, un miroir), dans toutes les zones que touche sa boîte.
//   3. À chaque rendu par la caméra du jeu (et par la caméra de la carte d'environnement, à son point de prise), les zones
//      CACHÉES sont tirées de la position de la caméra (`zonesCachees`) : le niveau, les cages, la trémie, la façade, la
//      distance aux portes des pièces fermées. Rien n'est caché hors de ces rendus : la carte d'ombre et son cache, l'ombre
//      cuite au sol, les ombres de contact, la précompilation des programmes voient tout, comme avant.
//   4. Les règles sont tirées d'un RELEVÉ : depuis 14 966 positions de la caméra (Haythem posé partout où l'on marche, sur
//      les quatre niveaux, les volées et la rue ; la caméra du jeu derrière lui dans quatre directions et cinq tangages, et
//      son œil), une image des zones vues dans les six directions, portes automatiques ouvertes ou fermées comme en jeu,
//      vitres comptées comme ouvertes. Ce que les règles cachent n'y est vu que par des fentes du décor (voir LES RÈGLES).
//      Puis, sur 660 vues de jeu tirées au hasard, l'image rendue avec et sans le tri, comparée pixel à pixel : identique,
//      hors ces fentes.
// Mesuré (1 600 × 900, haute, Radeon intégrée, appels de dessin par image) : dans la rue 2 150 -> 1 432 ; au départ
// 839 -> 693 ; hall ouest 796 -> 522 ; pause du -1 1 166 -> 605 ; sas du -1 1 191 -> 780 ; pause du 1er 1 006 -> 567 ;
// palier est du 1er 1 482 -> 809 ; couloir du 2e 702 -> 389 ; palier du 2e 1 282 -> 804. Seule la Si 0.2 y perd : 241 -> 255
// (des blocs dessinés en plusieurs suites au lieu d'un seul : ce qu'on y cache rapporte moins que les appels ajoutés).
// (Débogage : __visibilite.actif = false montre tout ; __visibilite.regles = (x, h, z) => masque remplace les règles.)
// Rien n'est construit ni déplacé ici : la géométrie, la caméra et la lumière sont celles des autres modules.
import * as THREE from 'three';

// LES ZONES : [nom, boîtes [x0, y0, x1, y1, h0, h1] du PLAN (y = -z du monde), hauteurs absolues]. La première qui
// contient un point le prend (l'ordre compte : les cages d'abord). Les bandes de hauteur : le -1 sous -0,22 ; le
// rez-de-chaussée jusqu'à 3,30 (la dalle du 1er, 3,25-3,50, est aux deux) ; le 1er jusqu'à 6,45 ; le 2e jusqu'à 9,70.
const SS = [-3.5, -0.22], R0 = [-0.22, 3.3], E1 = [3.3, 6.45], E2 = [6.45, 9.7];
const b = (x0, y0, x1, y1, [h0, h1]) => [x0, y0, x1, y1, h0, h1];
// (la façade : son nu extérieur est en y -0,40 — elle est au bâtiment ; la rue commence 10 cm devant, avec ce qui en
// dépasse : marquise, drapeaux, grilles, jardinières)
const YF = -0.5, YT = 24.5, XO = -0.32, XE = 20.12;
const TREMIE = [XO, 4.85, 1.62, 10.35], CAGE_O = [1.62, 7.45, 4.75, 14.35], CAGE_E = [16.0, 9.0, XE, 12.6];
export const ZONES = [
  // les trois passages d'un niveau à l'autre, coupés par niveau : la trémie de la volée de tôle (le palier « 0 » et la
  // volée), la cage de l'escalier principal (plan V2 : du devant de ses portes au mur nord ; le palier du 1er), la cage
  // de l'escalier est (les volées, du palier du -1 au 2e ; ses paliers d'étage, x < 16, sont ceux de leur niveau)
  ['tremieS', [b(...TREMIE, SS)]], ['tremie0', [b(...TREMIE, R0)]],
  ['cageO0', [b(...CAGE_O, R0)]], ['cageO1', [b(...CAGE_O, E1)]],
  ['cageES', [b(...CAGE_E, SS)]], ['cageE0', [b(...CAGE_E, R0)]], ['cageE1', [b(...CAGE_E, E1)]], ['cageE2', [b(...CAGE_E, E2)]],
  // l'EST, autour de la cage de l'escalier est, à chaque niveau (de ses paliers, on ne voit des autres niveaux que ce coin-là) :
  // au -1 le passage sombre, le sas et le palier ; au rez-de-chaussée le couloir est et le vestibule ; au 1er le palier
  // est et la bande sud ; au 2e le sas et le palier
  ['sse', [b(12.95, 4.9, XE, 13.0, SS)]], ['r0e', [b(13.4, 7.5, XE, 13.0, R0)]],
  ['e1e', [b(13.55, 6.95, XE, 13.0, E1)]], ['e2e', [b(13.72, 6.5, XE, 13.0, E2)]],
  // les PIÈCES FERMÉES du rez-de-chaussée, derrière une porte automatique (on n'y voit que porte ouverte, donc près d'elle) :
  // les toilettes femmes et hommes ; le local et les toilettes PMR ; la salle David Clark et son entrée ; le couloir de
  // service. (Pas la Si 0.1 ni le bureau de direction : leurs fenêtres donnent sur la rue.)
  ['r0wc', [b(6.05, 7.9, 8.95, 14.0, R0)]], ['r0lt', [b(8.95, 7.9, 11.6, 14.45, R0)]],
  ['r0si', [b(4.75, 12.65, 6.05, 14.2, R0), b(XO, 14.2, 8.95, 21.3, R0)]], ['r0sv', [b(XO, 0, 1.62, 4.85, R0)]],
  // le -1 (ce qui n'est pas dans les deux groupes du sous-sol : la dalle-boîte, la cage est)
  ['ss', [b(XO, YF, XE, YT, SS)]],
  // le rez-de-chaussée, sa façade comprise
  ['r0', [b(XO, YF, XE, YT, R0)]],
  // le 1er : les pièces sur rue (la S 1.3, le bureau de la travée 1, le 103 et la Si 1.5) — le dedans sous l'appui de leurs
  // fenêtres (4,45 m : les tables, les chaises, le bas des murs), puis la façade et le haut —, le reste
  ['e1avb', [b(XO, 0, 13.55, 4.95, [E1[0], 4.45]), b(13.55, 0, XE, 6.95, [E1[0], 4.45])]],
  ['e1av', [b(XO, YF, 13.55, 4.95, E1), b(13.55, YF, XE, 6.95, E1)]],
  ['e1', [b(XO, 4.95, 13.55, YT, E1), b(13.55, 6.95, XE, YT, E1)]],
  // le 2e : la salle 2 et les pièces fermées sur rue (sous l'appui, 7,60 m, et au-dessus), le reste
  ['e2avb', [b(XO, 0, XE, 4.6, [E2[0], 7.6])]],
  ['e2av', [b(XO, YF, XE, 4.6, E2)]],
  ['e2', [b(XO, 4.6, XE, YT, E2)]],
  // la rue, devant la façade, jusqu'au haut des immeubles d'en face
  ['rue', [b(-60, -40, 80, YF, [-0.22, 40])]],
];
export const ZONE = Object.fromEntries(ZONES.map(([n], i) => [n, 1 << i]));
export const DEHORS = 1 << 30;                    // hors de toute zone : jamais caché
// LES MORCEAUX : un bloc n'est coupé qu'entre ces familles (chaque morceau de plus est un appel de dessin de plus quand
// tout se voit) — la rue ; le rez-de-chaussée ; le bas de ses cages (de petits morceaux, qu'on voit d'en haut) ; le -1 ;
// les pièces sur rue du 1er, le reste du 1er et le haut de ses cages ; de même au 2e ; et à chaque niveau, l'est autour de
// la cage est. Un triangle va dans la famille de la zone qu'il regarde (le point à 3 cm devant son centre) ; le morceau
// garde toutes les zones de ses triangles.
const FAMILLE = { rue: 0, r0: 1, tremie0: 2, cageO0: 2, cageE0: 2, ss: 3, tremieS: 3, cageES: 3, e1av: 4, e1: 5, cageO1: 5, cageE1: 5,
  e2av: 6, e2: 7, cageE2: 7, sse: 9, r0e: 10, e1e: 11, e2e: 12, r0wc: 13, r0lt: 13, r0si: 13, r0sv: 13, e1avb: 14, e2avb: 15 };
const FAM = new Map(ZONES.map(([n], i) => [1 << i, FAMILLE[n]]));
const F_DEHORS = 8, N_FAM = 16;
const BOITES = [];
ZONES.forEach(([, bs], i) => { for (const B of bs) BOITES.push([...B, 1 << i]); });

// la zone d'un point du plan (x, y, h) : la première boîte qui le contient, sinon DEHORS
export function zoneDe(x, y, h) {
  for (const B of BOITES) if (x >= B[0] && x < B[2] && y >= B[1] && y < B[3] && h >= B[4] && h < B[5]) return B[6];
  return DEHORS;
}
// LES CELLULES : les bords de toutes les boîtes découpent l'espace en pavés (une vingtaine de tranches par axe), chacun
// tout entier dans une zone ou dehors — sa zone, celle de son centre, se lit une fois pour toutes. Les zones que touche
// une boîte du plan sont celles des pavés qu'elle coupe (exact, et une dizaine de lectures pour un triangle ordinaire) ;
// DEHORS dès qu'un pavé est dehors (un morceau dehors est toujours dessiné).
const tranches = (k0, k1) => [...new Set(BOITES.flatMap((B) => [B[k0], B[k1]]))].sort((p, q) => p - q);
const XS = tranches(0, 2), YS = tranches(1, 3), HS = tranches(4, 5);
const NX = XS.length - 1, NY = YS.length - 1, NH = HS.length - 1;
const CELLULES = new Uint32Array(NX * NY * NH);
for (let i = 0; i < NX; i++) for (let j = 0; j < NY; j++) for (let k = 0; k < NH; k++) {
  CELLULES[(i * NY + j) * NH + k] = zoneDe((XS[i] + XS[i + 1]) / 2, (YS[j] + YS[j + 1]) / 2, (HS[k] + HS[k + 1]) / 2);
}
// la tranche qui contient v (les bords triés : la dernière dont le début est ≤ v)
function tranche(T, v) {
  let a = 0, z = T.length - 2;
  while (a < z) { const m = (a + z + 1) >> 1; if (T[m] <= v) a = m; else z = m - 1; }
  return a;
}
// la zone d'un point, lue dans son pavé
function zoneCellule(x, y, h) {
  if (x < XS[0] || x >= XS[NX] || y < YS[0] || y >= YS[NY] || h < HS[0] || h >= HS[NH]) return DEHORS;
  return CELLULES[(tranche(XS, x) * NY + tranche(YS, y)) * NH + tranche(HS, h)];
}
function masqueBoite(x0, y0, h0, x1, y1, h1) {
  if (x0 < XS[0] || x1 > XS[NX] || y0 < YS[0] || y1 > YS[NY] || h0 < HS[0] || h1 > HS[NH]) return DEHORS;
  const i0 = tranche(XS, x0), i1 = tranche(XS, x1), j0 = tranche(YS, y0), j1 = tranche(YS, y1), k0 = tranche(HS, h0), k1 = tranche(HS, h1);
  let m = 0;
  for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
    const c = (i * NY + j) * NH;
    for (let k = k0; k <= k1; k++) m |= CELLULES[c + k];
  }
  return m & DEHORS ? DEHORS : m;
}
const GROSSI = 0.06;
const _v = new THREE.Vector3(), _bb = new THREE.Box3();
// les zones d'une boîte du MONDE (grossie de `g`)
function masqueMonde(bb, g = GROSSI) {
  return masqueBoite(bb.min.x - g, -bb.max.z - g, bb.min.y - g, bb.max.x + g, -bb.min.z + g, bb.max.y + g);
}

// Ce qu'on ne range pas (jamais caché) : ce qui bouge (Haythem, sa cabine d'ascenseur, ses vantaux), les miroirs (ils
// redessinent la scène), les points, lignes, sprites, et le repère invisible du sol
function exclu(o) {
  for (let p = o; p; p = p.parent) {
    if (p.userData.dynamique || p.isReflector) return true;
    if (p.name && p.name.startsWith('ascenseur')) return true;
  }
  return !!(o.isPoints || o.isLine || o.isSprite || o.isSkinnedMesh);
}
const porteDe = (o) => { for (let p = o.parent; p; p = p.parent) if (p.name && p.name.startsWith('porte ')) return p; return null; };
const ONBR = THREE.Object3D.prototype.onBeforeRender;

// =====================================================================
//  LA COUPE D'UN BLOC PAR FAMILLES
// =====================================================================
// Un bloc cousu n'est pas remplacé par ses morceaux : ses triangles sont seulement RANGÉS par famille, dans l'ordre de
// `ORDRE` (un nouveau tableau d'indices, les mêmes sommets), et le bloc garde tout son intervalle — c'est lui qui est
// dessiné quand toutes ses familles se voient (au rez-de-chaussée, le plus souvent : pas un appel de plus qu'avant). Quand
// une partie seulement se voit, il cède la place à un maillage par suite de familles voisines visibles (un intervalle
// d'indices chacun, fait à la première demande) ; quand rien ne s'en voit, à rien. L'ordre range ensemble ce qui se voit
// ensemble : le -1, le rez-de-chaussée et le bas des cages, le dehors, la rue, l'avant et le fond du 1er, ceux du 2e.
// Ne coupe que du fixe : un maillage d'un seul matériau, sans morphes ni instances ni rendu à soi (onBeforeRender), et
// rien sous une porte ou un vantail (ils tournent).
// (-1, -1 est, bas des cages, rez-de-chaussée est, rez-de-chaussée, dehors, rue, bas puis haut du 1er avant, 1er, 1er est,
// bas puis haut du 2e avant, 2e, 2e est, et pour finir les pièces fermées du rez-de-chaussée : cachées presque partout,
// elles ne font qu'écourter la suite)
const ORDRE = [3, 9, 2, 10, 1, 8, 0, 14, 4, 5, 11, 15, 6, 7, 12, 13];
const COUPE = { ms: 0, blocs: 0 };
export function couperParZones(o) {
  const t0 = performance.now();
  const r = couper(o);
  COUPE.ms += performance.now() - t0;
  if (r) COUPE.blocs++;
  return r;
}
function couper(o) {
  if (!o.isMesh || o.isInstancedMesh || o.isSkinnedMesh || Array.isArray(o.material) || exclu(o) || porteDe(o)) return false;
  if (o.onBeforeRender !== ONBR) return false;
  const g = o.geometry, pos = g && g.attributes.position;
  if (!pos || (g.morphAttributes && Object.keys(g.morphAttributes).length) || g.groups.length > 1) return false;
  if (g.drawRange.start !== 0 || g.drawRange.count !== Infinity) return false;
  o.updateWorldMatrix(true, false);
  const mw = o.matrixWorld;
  _bb.setFromBufferAttribute(pos).applyMatrix4(mw);
  const tout = masqueMonde(_bb);
  // (un bloc qui ne touche qu'une zone : rien à couper)
  if (!(tout & DEHORS) && (tout & (tout - 1)) === 0) { o.userData.zones = tout; return false; }
  const idx = g.index, n = Math.floor((idx ? idx.count : pos.count) / 3);
  if (n < 2) { o.userData.zones = tout; return false; }
  const e = mw.elements, P = pos.isInterleavedBufferAttribute ? pos.data.array : pos.array;
  const st = pos.isInterleavedBufferAttribute ? pos.data.stride : pos.itemSize, off = pos.isInterleavedBufferAttribute ? pos.offset : 0;
  const fam = new Uint8Array(n), masqueF = new Uint32Array(N_FAM), nF = new Uint32Array(N_FAM), I = idx ? idx.array : null;
  const deuxFaces = o.material.side === THREE.DoubleSide;
  const w = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (let t = 0; t < n; t++) {
    for (let s = 0; s < 3; s++) {
      const i = I ? I[t * 3 + s] : t * 3 + s, j = i * st + off;
      const x = P[j], y = P[j + 1], z = P[j + 2];
      w[s * 3] = e[0] * x + e[4] * y + e[8] * z + e[12];
      w[s * 3 + 1] = e[1] * x + e[5] * y + e[9] * z + e[13];
      w[s * 3 + 2] = e[2] * x + e[6] * y + e[10] * z + e[14];
    }
    const x0 = Math.min(w[0], w[3], w[6]), x1 = Math.max(w[0], w[3], w[6]);
    const h0 = Math.min(w[1], w[4], w[7]), h1 = Math.max(w[1], w[4], w[7]);
    const z0 = Math.min(w[2], w[5], w[8]), z1 = Math.max(w[2], w[5], w[8]);
    const m = masqueBoite(x0 - GROSSI, -z1 - GROSSI, h0 - GROSSI, x1 + GROSSI, -z0 + GROSSI, h1 + GROSSI);
    let f = F_DEHORS;
    if (!(m & DEHORS)) {
      // (la zone que le triangle regarde : 3 cm devant son centre, le long de sa normale ; une face double, son centre)
      const ax = w[3] - w[0], ay = w[4] - w[1], az = w[5] - w[2], bx = w[6] - w[0], by = w[7] - w[1], bz = w[8] - w[2];
      let nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx;
      const l = Math.hypot(nx, ny, nz), k = deuxFaces || l < 1e-12 ? 0 : 0.03 / l;
      nx *= k; ny *= k; nz *= k;
      const zc = zoneCellule((w[0] + w[3] + w[6]) / 3 + nx, -((w[2] + w[5] + w[8]) / 3 + nz), (w[1] + w[4] + w[7]) / 3 + ny);
      f = FAM.get(zc) ?? FAM.get(m & -m);
    }
    fam[t] = f; masqueF[f] |= m; nF[f]++;
  }
  const fams = ORDRE.filter((f) => nF[f] > 0);
  let toutes = 0; for (const f of fams) toutes |= masqueF[f];
  o.userData.zones = toutes & DEHORS ? DEHORS : toutes;
  if (fams.length < 2) return false;
  // les triangles rangés par famille : un nouveau tableau d'indices (les sommets restent ceux du bloc)
  const debut = new Uint32Array(N_FAM);
  let c = 0;
  for (const f of fams) { debut[f] = c; c += nF[f]; }
  const Tab = pos.count > 65535 ? Uint32Array : Uint16Array, ordre = new Tab(n * 3), cur = debut.slice();
  for (let t = 0; t < n; t++) {
    const d = cur[fam[t]]++;
    for (let s = 0; s < 3; s++) ordre[d * 3 + s] = I ? I[t * 3 + s] : t * 3 + s;
  }
  const q = new THREE.BufferGeometry();
  for (const a in g.attributes) q.setAttribute(a, g.attributes[a]);
  q.setIndex(new THREE.BufferAttribute(ordre, 1));
  if (!g.boundingSphere) g.computeBoundingSphere();
  if (!g.boundingBox) g.computeBoundingBox();
  q.boundingSphere = g.boundingSphere; q.boundingBox = g.boundingBox;
  o.geometry = q;
  o.userData.coupe = {
    f: fams.map((f) => ({ m: masqueF[f] & DEHORS ? DEHORS : masqueF[f], d: debut[f] * 3, n: nF[f] * 3 })),
    suites: new Map(), st, off, P,
  };
  return true;
}
// le maillage d'une suite de familles [i, j] d'un bloc coupé : son intervalle d'indices, sa sphère ; sans ombre portée
// (l'ombre du décor fixe vient du cache, js/ombre_cache.js, cuit sur le bloc entier) ; invisible hors des rendus triés
function suite(o, i, j) {
  const C = o.userData.coupe, cle = i * 16 + j;
  let m = C.suites.get(cle);
  if (m) return m;
  const g = o.geometry, d = C.f[i].d, n = C.f[j].d + C.f[j].n - d;
  const q = new THREE.BufferGeometry();
  for (const a in g.attributes) q.setAttribute(a, g.attributes[a]);
  q.setIndex(g.index);
  q.setDrawRange(d, n);
  const I = g.index.array, bb = new THREE.Box3();
  for (let r = d; r < d + n; r++) { const v = I[r] * C.st + C.off; _v.set(C.P[v], C.P[v + 1], C.P[v + 2]); bb.expandByPoint(_v); }
  q.boundingBox = bb; q.boundingSphere = bb.getBoundingSphere(new THREE.Sphere());
  m = new THREE.Mesh(q, o.material);
  m.name = o.name; m.castShadow = false; m.receiveShadow = o.receiveShadow; m.renderOrder = o.renderOrder;
  m.frustumCulled = o.frustumCulled; m.layers.mask = o.layers.mask; m.matrixAutoUpdate = false;
  m.matrix.copy(o.matrix); m.matrix.decompose(m.position, m.quaternion, m.scale);
  m.userData = { ...o.userData, suite: true }; delete m.userData.coupe;
  m.visible = false;
  o.parent.add(m); m.updateMatrixWorld(true);
  C.suites.set(cle, m);
  return m;
}

// =====================================================================
//  LES RÈGLES : les zones cachées vues d'un point (monde)
// =====================================================================
// Tirées du relevé (voir l'en-tête), niveau par niveau de la CAMÉRA (pas de Haythem) : ce qu'on voit de partout, et ce
// qu'on voit en plus d'une région — près des cages, de la trémie, du pied des escaliers (des rectangles du plan
// [x0, y0, x1, y1]). Tout le reste est caché. Les rares pixels qu'on y voyait encore ne passaient que par des fentes
// du décor (au -1, au-dessus de la porte G de l'aile ; au 1er, au ras du sol de la S 1.3 et de la Kahn) ou par
// l'oculus de la porte du dégagement ouest du 2e — des vues que les règles de chaque étage cachaient déjà.
const Z = ZONE;
const T = (...n) => n.reduce((m, k) => m | Z[k], 0);
const TOUTES = (1 << ZONES.length) - 1;
const dans = (x, y, R) => x > R[0] && x < R[2] && y > R[1] && y < R[3];
const VERS_CAGE_O = [1.4, 6.5, 6.1, 14.5];       // rez-de-chaussée : devant les portes de l'escalier principal, la cage,
                                                 // l'entrée du C05
const VERS_CAGE_O1 = [-0.4, 4.9, 5.0, 14.5];     // 1er : le couloir sombre et le palier ouest, d'où l'on voit la volée
const CAGE_O1 = [1.3, 7.0, 5.1, 14.6];           // 1er : dans la cage même (on y voit le rez-de-chaussée en bas)
const VERS_CAGE_E = [13.4, 6.45, 20.2, 12.75];   // la cage est et ses paliers (la règle de js/ecole_etage2.js)
const VERS_CAGE_E1 = [6.0, 5.0, 20.2, 12.75];    // 1er : et l'espace pause, par la porte du palier est
const VERS_CAGE_E2 = [12.0, 4.5, 20.2, 12.75];   // 2e : et le bout est du couloir rouge
const VERS_TREMIE_R = [-0.4, 4.0, 4.5, 10.4];    // rez-de-chaussée : le hall ouest devant la porte grise, le palier « 0 »
const VERS_TREMIE_S = [-0.4, 4.8, 1.9, 10.6];    // -1 : sur la volée de tôle
const PIED_TREMIE_S = [-0.4, 4.8, 5.0, 14.5];    // -1 : et à son pied, le hall et le couloir du -1
// (les zones du rez-de-chaussée et des étages qu'on voit d'un niveau)
const VU_RUE = T('tremie0', 'cageO0', 'cageE0', 'r0e', 'r0', 'e1av', 'e2av', 'rue');
const VU_S = T('tremieS', 'cageES', 'sse', 'ss');
const VU_R = T('tremie0', 'cageO0', 'cageE0', 'r0e', 'r0', 'e1avb', 'e1av', 'rue');
const VU_E1 = T('cageO1', 'cageE1', 'e1e', 'e1avb', 'e1av', 'e1', 'rue');
const VU_E2 = T('cageE2', 'e2e', 'e2avb', 'e2av', 'e2', 'rue');
// LES PIÈCES FERMÉES (posées par poserVisibilite, d'après les portes automatiques de chacune) : on les voit de dedans, ou à
// moins de 8 m d'une de leurs portes — Haythem l'ouvre à 2,10 m (js/ecole_portes.js), la caméra le suit à 2,60 m au plus,
// et la porte met 0,38 s à se refermer derrière lui ; plus loin, elle est fermée
let FERMEES = [];
const PRES_PORTE = 8.0;
function fermeesVues(x, y) {
  let vu = 0;
  for (const F of FERMEES) {
    if (F.toujours || F.boites.some((B) => x > B[0] - 0.3 && x < B[2] + 0.3 && y > B[1] - 0.3 && y < B[3] + 0.3) || F.portes.some(([px, py]) => Math.hypot(x - px, y - py) < PRES_PORTE)) vu |= F.bit;
  }
  return vu;
}
export function zonesCachees(x, h, z) {
  const y = -z;
  let vu;
  if (y < -0.3) {
    // DANS LA RUE : ni le -1, ni le fond du 1er ni le dedans de ses pièces sur rue sous l'appui des fenêtres tant que la
    // caméra est sous 2,40 m (au-dessus, par les fenêtres de la S 1.3 et sa porte ouverte, on voit l'espace pause et
    // jusqu'à la Kahn) ; ni le fond du 2e sous 3,00 m, ni le dedans de la salle 2 sous son appui, sous 4,00 m
    vu = VU_RUE | fermeesVues(x, y);
    if (h >= 2.4) vu |= T('e1avb', 'e1', 'e1e', 'cageE1');
    if (h >= 3.0) vu |= T('e2');
    if (h >= 4.0) vu |= T('e2avb');
  } else if (h < -0.15) {
    // AU -1 : rien des étages ; ni la rue ni le rez-de-chaussée, sauf du pied des deux escaliers
    vu = VU_S;
    if (dans(x, y, VERS_CAGE_E)) vu |= T('cageE0', 'r0e', 'rue');
    if (dans(x, y, VERS_TREMIE_S)) vu |= T('tremie0', 'r0');
    if (dans(x, y, PIED_TREMIE_S)) vu |= T('tremie0');
  } else if (h <= 3.3) {
    // AU REZ-DE-CHAUSSÉE : le 2e jamais ; le 1er par les cages ; le -1 par la trémie et la cage est
    vu = VU_R | fermeesVues(x, y);
    if (dans(x, y, VERS_CAGE_O)) vu |= T('cageO1', 'e1');
    if (dans(x, y, VERS_CAGE_E)) vu |= T('cageES', 'sse', 'cageE1', 'e1e', 'e1');
    if (dans(x, y, VERS_TREMIE_R)) vu |= T('tremieS', 'ss');
  } else if (h <= 6.45) {
    // AU 1er : ni le -1, ni le rez-de-chaussée (sauf par les cages), ni le 2e (sauf par la cage est)
    vu = VU_E1;
    if (dans(x, y, VERS_CAGE_O1)) vu |= T('cageO0');
    if (dans(x, y, VERS_CAGE_E1)) vu |= T('cageE0');
    if (dans(x, y, CAGE_O1)) vu |= T('r0');
    if (dans(x, y, VERS_CAGE_E)) vu |= T('cageE0', 'cageE2', 'r0e', 'e2e') | (h > 5.8 ? T('e2') : 0);
  } else {
    // AU 2e : rien du -1 ni du rez-de-chaussée ; le 1er par la cage est
    vu = VU_E2;
    if (dans(x, y, VERS_CAGE_E2)) vu |= T('cageE1');
    if (dans(x, y, VERS_CAGE_E)) vu |= T('e1e', 'e1', 'r0e');
  }
  return TOUTES & ~vu;
}

// =====================================================================
//  LA POSE (js/carte_ecole.js, le décor fini)
// =====================================================================
// Range ce qui ne l'a pas été à la couture (le décor du rez-de-chaussée et la rue, cousus par js/kit_decor.js), puis
// chaque maillage et chaque porte, et branche le tri sur les rendus de la scène. `maj(dt, jeu)` donne la caméra du jeu.
export function poserVisibilite(scene, portesAuto = []) {
  const t0 = performance.now();
  // 0. les pièces fermées et leurs portes automatiques (celles du rez-de-chaussée posées sur le bord d'une de leurs boîtes)
  FERMEES = ['r0wc', 'r0lt', 'r0si', 'r0sv'].map((n) => {
    const boites = ZONES.find((Zn) => Zn[0] === n)[1];
    const portes = portesAuto.filter((P) => Math.abs(P.base || 0) < 0.5 && boites.some((B) => P.cx > B[0] - 0.25 && P.cx < B[2] + 0.25 && -P.cz > B[1] - 0.25 && -P.cz < B[3] + 0.25)).map((P) => [P.cx, -P.cz]);
    return { bit: Z[n], boites, portes };
  });
  // (une pièce sans porte retrouvée — le plan a bougé — reste toujours dessinée)
  for (const F of FERMEES) F.toujours = !F.portes.length;
  // 1. la coupe : tout le fixe hors des groupes protégés (les niveaux ont été coupés à leur couture)
  const aCouper = [];
  const protege = (o) => { for (let p = o; p; p = p.parent) if (p.userData && p.userData.nofuse) return true; return false; };
  scene.traverse((o) => { if (o.isMesh && o.userData.zones === undefined && !protege(o)) aCouper.push(o); });
  for (const o of aCouper) couperParZones(o);
  // 2. le rangement : les blocs coupés à part ; chaque autre maillage (ou chaque porte, en entier) et ses zones
  const blocs = [], parMasque = new Map(), vus = new Set();
  const ranger = (o, m) => {
    if (vus.has(o)) return; vus.add(o);
    if (!m || (m & DEHORS)) return;
    if (!parMasque.has(m)) parMasque.set(m, []);
    parMasque.get(m).push(o);
  };
  scene.traverse((o) => {
    if (!(o.isMesh || o.isInstancedMesh) || exclu(o) || o.userData.suite) return;
    const p = porteDe(o);
    if (p) {
      // (une porte : les zones de ses deux côtés et de son débattement, 1 m autour d'elle)
      if (!vus.has(p)) { _bb.setFromObject(p); ranger(p, masqueMonde(_bb, 1.0)); }
      return;
    }
    if (o.userData.coupe) { blocs.push(o); return; }
    if (o.userData.zones !== undefined) { ranger(o, o.userData.zones); return; }
    _bb.setFromObject(o);
    ranger(o, masqueMonde(_bb));
  });
  const lots = [...parMasque.entries()];
  let n = 0; for (const [, L] of lots) n += L.length;

  // 3. le tri, à chaque rendu de la scène par la caméra du jeu ou par celle de la carte d'environnement (une
  // CubeCamera) : rien ailleurs (la carte d'ombre et son cache, les cuissons, un miroir voient tout, comme avant). Les
  // rendus imbriqués (le miroir des toilettes, le reflet du sol mouillé) gardent le tri de celui qui les contient.
  let camJeu = null, prof = 0, H = 0, cle = NaN, fond = null;
  const caches = [], montres = [];
  // (au -1, pas une fenêtre : le ciel ne s'y voit jamais, mais par les fentes du décor — au-dessus de la porte G de l'aile —
  // on voyait le dessous de la rue, sombre, que le tri ne dessine plus ; le fond y est donc sombre lui aussi. Sauf au pied
  // de l'escalier est : en levant les yeux dans la cage, on voit le fond tout en haut, au-dessus du palier du 2e)
  const FOND_SS = new THREE.Color(0x101010);
  const V = { actif: true, regles: null, cachees: 0, maillages: n, blocs: blocs.length, lots: lots.length, ms: 0, msCoupe: 0 };
  const avant = scene.onBeforeRender, apres = scene.onAfterRender;
  const cacher = (o) => { if (o.visible) { o.visible = false; caches.push(o); } };
  scene.onBeforeRender = function (r, sc, cam, cible) {
    avant.call(this, r, sc, cam, cible);
    if (prof++ !== 0 || !V.actif) return;
    if (cam !== camJeu && !(cam.parent && cam.parent.isCubeCamera)) return;
    const p = cam.getWorldPosition(_v);
    const k = Math.round(p.x * 50) * 1e8 + Math.round(p.y * 50) * 1e4 + Math.round(p.z * 50);
    if (k !== cle || V.regles) { cle = k; H = (V.regles || zonesCachees)(p.x, p.y, p.z); V.cachees = H; }
    if (p.y < -0.15 && p.z < 0.3 && !dans(p.x, -p.z, VERS_CAGE_E) && sc.background && sc.background.isColor) { fond = sc.background; sc.background = FOND_SS; }
    if (!H) return;
    for (const [m, L] of lots) if ((m & ~H) === 0) for (const o of L) cacher(o);
    // les blocs coupés : entiers si tout s'en voit, rien si rien, sinon une suite par série de familles visibles
    for (const o of blocs) {
      if (!o.visible) continue;
      const F = o.userData.coupe.f;
      let tous = true, aucun = true;
      for (const x of F) { if ((x.m & ~H) !== 0) aucun = false; else tous = false; }
      if (tous) continue;
      cacher(o);
      if (aucun) continue;
      for (let i = 0; i < F.length; i++) {
        if ((F[i].m & ~H) === 0) continue;
        let j = i; while (j + 1 < F.length && (F[j + 1].m & ~H) !== 0) j++;
        const s = suite(o, i, j); s.visible = true; montres.push(s);
        i = j;
      }
    }
  };
  scene.onAfterRender = function (r, sc, cam) {
    apres.call(this, r, sc, cam);
    if (--prof !== 0) return;
    for (const o of caches) o.visible = true;
    for (const o of montres) o.visible = false;
    caches.length = 0; montres.length = 0;
    if (fond) { sc.background = fond; fond = null; }
  };
  V.ms = Math.round(performance.now() - t0); V.msCoupe = Math.round(COUPE.ms);
  console.info('[visibilité] %d zones · %d blocs rangés par famille (%d ms de coupe en tout) · %d maillages en %d jeux de zones · pose %d ms', ZONES.length, blocs.length, V.msCoupe, n, lots.length, V.ms);
  if (typeof window !== 'undefined') window.__visibilite = V;
  return {
    V,
    // (à chaque image : la caméra du jeu ; et la sûreté : un rendu interrompu par une exception laisserait des morceaux
    // cachés et le compteur d'imbrication décalé)
    maj(dt, jeu) {
      camJeu = jeu.camera;
      if (prof !== 0) {
        prof = 0;
        for (const o of caches) o.visible = true;
        for (const o of montres) o.visible = false;
        caches.length = 0; montres.length = 0;
        if (fond) { scene.background = fond; fond = null; }
      }
    },
  };
}
