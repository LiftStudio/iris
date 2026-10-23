// =====================================================================
//  LES TEINTES D'ÉQUIPE (lot L-C, 23/10 ; spec §§ 3.6, 4.5.10, arbitrage 46 — squelette du socle S0)
// =====================================================================
// Par défaut huit clones de Haythem se battent dans l'école : au-delà de 15 m dans un couloir sombre, on ne sait plus qui
// est qui. Trois signes, dont deux ici (le chevron bleu au-dessus des alliés est au HUD, L-G) :
//   - LA TENUE teintée à 60 % de la couleur de l'équipe (SISR bleu #3d8bff, SLAM orange #ff8a1f, constantes.js EQUIPES) :
//     le haut à la couleur pleine, le bas à 42 % (un « uniforme » : haut vif, pantalon sombre de la même teinte), par le
//     shader des tenues (js/fit.js appliquerFit, celui de LA CAGE) qui garde le CONTRASTE du tissu (plis, coutures) et
//     n'en change que le niveau — des uniformes seulement, sur les matériaux CLONÉS du corps (js/player.js _loadAvatar) :
//     ni programme nouveau, ni matériau du décor ou de Haythem touché ;
//   - DEUX BRASSARDS LARGES (8 cm) de la couleur pleine, enfants des os des bras (LeftArm, RightArm : l'os qui part de
//     l'épaule), à 11 cm sous l'articulation, ajustés à la manche de CET avatar (le rayon mesuré sur la pose de liaison
//     des sommets portés par l'os, + 6 mm), un rien émissifs (0,22 : lisibles au −1). Géométrie par avatar et matériau par
//     équipe PARTAGÉS : un corps libéré les détache avant Player.dispose (js/jeu/avatars.js libererCorps).
// Une équipe nulle (chacun pour soi, mannequins sans camp) : la tenue d'origine, sans brassard.
import * as THREE from 'three';
import { EQUIPES } from './constantes.js';
import { appliquerFit } from '../fit.js';

export const TEINTE = {
  force: 0.6,                 // part de la teinte dans la tenue (spec § 3.6 : 60 %)
  bas: 0.42,                  // le pantalon : la couleur de l'équipe × 0,42
  coupe: 1.10,                // la coupure haut / bas, en hauteur de squelette (1 = la hanche : js/fit.js)
  brassard: { hauteur: 0.08, depuisEpaule: 0.11, marge: 0.006, segments: 18, emissif: 0.22 },
};
const MATS = new Map();       // équipe → MeshStandardMaterial (partagé)
const GEOS = new Map();       // avatar + côté → { geo, cx, cz } (partagé)
const OS_BRAS = { Left: 'LeftArm', Right: 'RightArm' };
const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _s = new THREE.Vector3();

const couleur = (equipe) => (equipe && EQUIPES[equipe] ? EQUIPES[equipe].couleur : null);
// le matériau d'un brassard (un par équipe ; le même programme que tout MeshStandardMaterial sans texture)
export function matBrassard(equipe) {
  const c = couleur(equipe); if (!c) return null;
  let m = MATS.get(equipe);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color: c, roughness: 0.55, metalness: 0, emissive: c, emissiveIntensity: TEINTE.brassard.emissif });
    m.name = 'brassard_' + equipe;
    MATS.set(equipe, m);
  }
  return m;
}

// LA MANCHE d'un avatar à hauteur du brassard, dans le repère de l'os du bras (pose de liaison) : le centre et le rayon
// des sommets que l'os porte à plus de 50 %, entre `y0 − h/2` et `y0 + h/2` le long de l'os (unités du modèle)
function manche(model, os, y0, h) {
  let n = 0, sx = 0, sz = 0;
  const pts = [];
  model.traverse((o) => {
    if (!o.isSkinnedMesh || !o.skeleton) return;
    const sk = o.skeleton, i = sk.bones.findIndex((b) => b.name.replace(/^mixamorig:?/, '') === os);
    if (i < 0) return;
    const g = o.geometry, P = g.attributes.position, I = g.attributes.skinIndex, W = g.attributes.skinWeight;
    if (!P || !I || !W) return;
    _m.multiplyMatrices(sk.boneInverses[i], o.bindMatrix);
    for (let v = 0; v < P.count; v++) {
      let w = 0;
      for (let k = 0; k < 4; k++) if (I.getComponent(v, k) === i) w += W.getComponent(v, k);
      if (w < 0.5) continue;
      _p.fromBufferAttribute(P, v).applyMatrix4(_m);
      if (Math.abs(_p.y - y0) > h / 2) continue;
      pts.push(_p.x, _p.z); sx += _p.x; sz += _p.z; n++;
    }
  });
  if (n < 6) return null;
  const cx = sx / n, cz = sz / n;
  let r = 0;
  for (let k = 0; k < pts.length; k += 2) r = Math.max(r, Math.hypot(pts[k] - cx, pts[k + 1] - cz));
  return { cx, cz, r };
}
// la géométrie du brassard d'un côté pour CET avatar (cylindre fermé : ses disques sont dans le bras, l'épaisseur visible
// est la marge), en unités de l'os
function geoBrassard(player, cote) {
  const M = player.avatarModel, os = player.avatar && player.avatar.bone(OS_BRAS[cote]);
  if (!M || !os) return null;
  const cle = (player.avatarUrl || '?') + '|' + cote + '|' + player.h.toFixed(3);
  let G = GEOS.get(cle);
  if (G === undefined) {
    os.getWorldScale(_s);
    const k = _s.y > 1e-6 ? 1 / _s.y : 1;                       // mètres → unités de l'os
    const B = TEINTE.brassard, y0 = B.depuisEpaule * k, h = B.hauteur * k;
    const m = manche(M, OS_BRAS[cote], y0, h);
    if (!m) G = null;
    else {
      const geo = new THREE.CylinderGeometry(m.r + B.marge * k, m.r + B.marge * k, h, B.segments, 1, false);
      geo.translate(m.cx, y0, m.cz);
      G = { geo, r: (m.r + B.marge * k) / k };
    }
    GEOS.set(cle, G);
  }
  return G;
}

// LA TEINTE d'un corps : tenue et brassards de l'équipe (null : la tenue d'origine, sans brassard). Le corps pas encore
// chargé la recevra à l'arrivée de son avatar (js/player.js surAvatar, avant sa première image).
export function teinteEquipe(player, equipe) {
  if (!player) return;
  player.equipe = equipe || null;
  player.surAvatar = equipe ? (q) => teinteEquipe(q, q.equipe) : null;
  retirerTeinte(player);
  const M = player.avatarModel; if (!M) return;
  const c = couleur(equipe), rep = player.fitRep;
  const f = c && rep ? { haut: c, bas: '#' + new THREE.Color(c).multiplyScalar(TEINTE.bas).getHexString(), force: TEINTE.force, coupe: TEINTE.coupe } : null;
  M.traverse((o) => { if (o.isSkinnedMesh && o.material && o.material.__cage && /look/i.test(o.material.name || '')) appliquerFit(o.material, f, rep); });
  if (!c) return;
  const mat = matBrassard(equipe), L = [];
  for (const cote of ['Left', 'Right']) {
    const G = geoBrassard(player, cote), os = player.avatar.bone(OS_BRAS[cote]);
    if (!G || !os) continue;
    const b = new THREE.Mesh(G.geo, mat);
    b.name = 'brassard'; b.castShadow = false; b.receiveShadow = true; b.frustumCulled = false;
    b.userData.brassard = true; b.userData.dynamique = true;
    os.add(b); L.push(b);
  }
  player.brassards = L;
}
// les brassards détachés (leur géométrie et leur matériau restent : partagés) et la tenue rendue à l'origine
export function retirerTeinte(player) {
  if (!player || !player.brassards) return;
  for (const b of player.brassards) if (b.parent) b.parent.remove(b);
  player.brassards = null;
}

// À LA PRÉPARATION (js/jeu/avatars.js preparerAvatars) : les matériaux des brassards de toutes les équipes, compilés
// (un programme partagé : aucune compilation au premier corps teint)
let _teintesPretes = null;
export function preparerTeintes(game) { return _teintesPretes || (_teintesPretes = compilerTeintes(game)); }
async function compilerTeintes(game) {
  const g = new THREE.Group();
  for (const eq of Object.keys(EQUIPES)) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.08, 6), matBrassard(eq));
    m.receiveShadow = true; m.castShadow = false;               // (comme les vrais : receiveShadow entre dans le programme)
    g.add(m);
  }
  try { if (game && game._compilerAsync) await Promise.race([game._compilerAsync(g), new Promise((r) => setTimeout(r, 4000))]); }
  finally { for (const m of g.children) m.geometry.dispose(); }
}
