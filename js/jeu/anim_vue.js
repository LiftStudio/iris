// =====================================================================
//  LES POSES ET LES PISTES DE L'ARME DE VUE — lot L-V (23/10/2026 ; squelette du socle S0 du 22/10 ; vague 3 : L-Q)
// =====================================================================
// Les poses de l'arme dans le repère de la caméra de l'arme (m, rad ; spec § 4.5.9, CoD § 6.4) et les CHRONOLOGIES des
// gestes : recharges (chargeur, cartouche par cartouche, arrêtoir), culasse du TP-50, pompe du FP-12, glissière du P-17,
// changement d'arme, couteau, grenade, inspection. Une piste est une suite de CLÉS sur des VOIES nommées (la voie qui
// n'est pas donnée garde sa valeur de la clé d'avant : on écrit les clés comme on anime), lue par `evaluer` en Hermite
// cubique MONOTONE (Fritsch-Carlson : aucun dépassement entre deux clés — une main posée sur le chargeur y reste, elle ne
// rebondit pas à travers l'arme ; les tangentes sont calculées une fois, à la construction). Le « 0 » de chaque voie est
// le repos : une piste coupée en route (recharge annulée par le sprint) s'éteint donc en multipliant ses voies par un
// poids qui tombe à 0 (js/jeu/viewmodel.js), sans saut.
// LES TEMPS VIENNENT DES FICHES (js/jeu/armes.js) : la recharge de la FA-24 est écrite en secondes (CoD § 6.4 : 0,55 le
// chargeur part, 1,35 « clac », les balles entrent), puis RECALÉE sur chaque arme par des ancres (début, départ du
// chargeur, balles entrées = `recharge.ajout`, fin = `recharge.tact` ou `vide`) : la clé des balles entrées tombe
// exactement à l'heure où l'Arsenal les fait entrer. L'animation lit l'état de l'arsenal, jamais l'inverse.
// Rien ici ne touche à three : des nombres (le module est lu par les tests sans scène).
import { ARMES } from './armes.js';

// { p: [x, y, z], r: [x, y, z] } (rotation YXZ, autour de la prise de la main droite : rx > 0 lève le canon, ry > 0 le
// porte à gauche, rz > 0 roule l'arme dans le sens inverse des aiguilles d'une montre vu de l'œil) ; la visée : le
// repère `visee` de l'arme sur l'axe, à 0,24 m (`repere`, le viewmodel calcule la position arme par arme) ;
// `bal` : le facteur du balancement en huit dans cette pose (sprint × 2,5, visée × 0,1 — § 4.5.9)
export const POSES_VUE = {
  // (27/10 : l'arme 1,5 cm plus haut et 5 cm plus loin, tournée vers l'axe et un peu roulée — à (0,135 ; −0,125 ; −0,32), la
  // main droite tombait sous le bord bas de l'image et la crosse remplissait la moitié droite de l'écran)
  hanche: { p: [0.12, -0.11, -0.37], r: [0, 0.06, -0.05], bal: 1 },
  visee: { p: [0, 0, -0.24], r: [0, 0, 0], repere: 'visee', bal: 0.1 },
  // (F2, demande de L-V : la pose du § 4.5.9, (0,06 ; −0,19 ; −0,25) rot (−0,55 ; 0,65 ; 0,35), sortait l'arme du champ — 0 à
  // 7 % de ses sommets dans le cône de vue avec les vraies armes de L-W ; celle-ci en garde 67 à 79 %, l'arme baissée et
  // tournée vers la gauche, comme dans Call of Duty)
  sprint: { p: [0.10, -0.14, -0.30], r: [-0.30, 0.65, 0.35], bal: 2.5 },
  sprintTact: { p: [0.10, -0.10, -0.30], r: [0.9, 0.2, -0.4], bal: 2.5 },
  glisse: { p: [0.115, -0.155, -0.32], r: [0, 0.035, -0.25], bal: 0.3 },
  franchit: { p: [0.12, -0.22, -0.22], r: [-0.3, 0.4, 0.45], bal: 0.5 },
};
// LES POSES PROPRES À UNE ARME (un ajout au § 4.5.9, réglé sur les photos) : le pistolet se tient plus haut, plus près de
// l'axe et plus loin de l'œil qu'un fusil (à la pose du fusil, la main droite et la glissière ne se voyaient plus)
export const POSES_ARMES = {
  p17: { hanche: { p: [0.095, -0.075, -0.40], r: [0.04, 0.07, 0], bal: 1 } },
};

// ---------------------------------------------------------------- les pistes
// LES VOIES d'une piste d'ARME (recharges, changement, culasse, pompe, inspection) — 0 partout = l'arme à sa pose :
//   x y z rx ry rz : décalage de l'arme (repère caméra, m) et rotation ajoutée (rad, YXZ, autour de la prise) ;
//   gm : main gauche de sa prise (garde-main, pompe) vers la prise du CHARGEUR (ou la fenêtre d'éjection du FP-12) ;
//   ga : … vers l'ARRÊTOIR (le bouton de culasse, le levier) ; gox goy goz : décalage de cette prise, dans l'arme ;
//   gl : main gauche LIBRE (0 : sur l'arme ; 1 : sur gfx gfy gfz, repère caméra — hors champ, à la ceinture) ;
//   ck : le chargeur suit la main gauche (0 : en place dans l'arme) ;
//   cul : levier de culasse levé (0..1 → 60°, TP-50) ; culT : course de la pièce mobile (0..1 : culasse 8 cm, pompe
//   9 cm, glissière 3 cm, levier d'armement) ; dl : main droite sur le levier de culasse (TP-50).
export const VOIES = ['x', 'y', 'z', 'rx', 'ry', 'rz', 'gm', 'ga', 'gox', 'goy', 'goz', 'gl', 'gfx', 'gfy', 'gfz', 'ck', 'cul', 'culT', 'dl'];
// LES VOIES d'une piste de MAIN (couteau, grenade) : l'arme (décalage, rotation, `vis` : montrée), la main droite LIBRE
// (`dk` : 0 sur la poignée, 1 sur dx dy dz — repère caméra — tournée de drx dry drz, YXZ, depuis le repère de base :
// doigts vers l'avant, paume vers la gauche), l'objet tenu (`ov` : montré), la main gauche libre (gl, gf*), la goupille
// (`pin` : 0 en place, 1 arrachée)
export const VOIES_MAIN = ['x', 'y', 'z', 'rx', 'ry', 'rz', 'vis', 'dk', 'dx', 'dy', 'dz', 'drx', 'dry', 'drz', 'ov', 'gl', 'gfx', 'gfy', 'gfz', 'pin'];

// une PISTE : `cles` = [{ t, voie: valeur, … }] (une voie absente garde la valeur de la clé d'avant ; 0 au départ) ;
// `ancres` : [[de…], [vers…]] recale le temps des clés (morceaux linéaires) — la recharge de la FA-24 écrite une fois,
// posée sur les temps d'une autre fiche
export function piste(duree, cles, voies = VOIES, ancres = null) {
  const n = voies.length, ix = Object.fromEntries(voies.map((v, i) => [v, i]));
  const K = [];
  let prec = new Float64Array(n);
  for (const c of [...cles].sort((a, b) => a.t - b.t)) {
    const v = Float64Array.from(prec);
    for (const k in c) if (k !== 't') { if (!(k in ix)) throw new Error('[anim_vue] voie inconnue : ' + k); v[ix[k]] = c[k]; }
    K.push({ t: ancres ? recaler(c.t, ancres[0], ancres[1]) : c.t, v });
    prec = v;
  }
  const P = { duree, voies, i: ix, cles: K, m: null };
  tangentes(P);
  return P;
}
// le temps t de la piste d'origine (ancres A) porté sur les ancres B (morceaux linéaires, au-delà : prolongés)
export function recaler(t, A, B) {
  let k = 1;
  while (k < A.length - 1 && t > A[k]) k++;
  const u = (t - A[k - 1]) / Math.max(1e-9, A[k] - A[k - 1]);
  return B[k - 1] + u * (B[k] - B[k - 1]);
}
// les tangentes de Fritsch-Carlson, par voie (monotone : jamais au-delà des deux clés qui l'encadrent)
function tangentes(P) {
  const K = P.cles, N = K.length, n = P.voies.length;
  const m = P.m = K.map(() => new Float64Array(n));
  if (N < 2) return;
  for (let c = 0; c < n; c++) {
    const d = [];
    for (let j = 0; j < N - 1; j++) { const h = Math.max(1e-9, K[j + 1].t - K[j].t); d.push((K[j + 1].v[c] - K[j].v[c]) / h); }
    m[0][c] = 0; m[N - 1][c] = 0;            // (départ et arrivée posés : l'arme part du repos et y revient sans à-coup)
    for (let j = 1; j < N - 1; j++) m[j][c] = d[j - 1] * d[j] <= 0 ? 0 : (d[j - 1] + d[j]) / 2;
    for (let j = 0; j < N - 1; j++) {
      if (d[j] === 0) { m[j][c] = 0; m[j + 1][c] = 0; continue; }
      const a = m[j][c] / d[j], b = m[j + 1][c] / d[j], s = a * a + b * b;
      if (s > 9) { const k = 3 / Math.sqrt(s); m[j][c] = k * a * d[j]; m[j + 1][c] = k * b * d[j]; }
    }
  }
}
// LA VALEUR d'une piste à l'instant t : `out` (un tableau de nombres, une case par voie) — Hermite cubique entre deux
// clés { t, v: [] }, tangentes monotones ; avant la 1re clé, sa valeur ; après la dernière, la sienne
export function evaluer(piste, t, out) {
  const K = (piste && piste.cles) || [];
  if (!K.length) return out;
  const n = K[0].v.length;
  if (!(t > K[0].t)) { for (let i = 0; i < n; i++) out[i] = K[0].v[i]; return out; }
  const z = K[K.length - 1];
  if (t >= z.t) { for (let i = 0; i < n; i++) out[i] = z.v[i]; return out; }
  let j = 1;
  while (t > K[j].t) j++;
  const a = K[j - 1], b = K[j], h = Math.max(1e-9, b.t - a.t), u = (t - a.t) / h, u2 = u * u, u3 = u2 * u;
  const h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
  const M = piste.m;
  if (!M) { for (let i = 0; i < n; i++) out[i] = a.v[i] + (b.v[i] - a.v[i]) * u; return out; }     // (une piste sans tangentes : linéaire)
  const ma = M[j - 1], mb = M[j];
  for (let i = 0; i < n; i++) out[i] = h00 * a.v[i] + h10 * h * ma[i] + h01 * b.v[i] + h11 * h * mb[i];
  return out;
}

// ---------------------------------------------------------------- les chronologies
const DEG = Math.PI / 180;
// LA RECHARGE AU CHARGEUR, écrite sur la FA-24 (CoD § 6.4, tactique 1,90 s) : 0-0,25 arme roulée de 25° et cabrée de 15° ·
// 0,25-0,50 main gauche au chargeur · 0,50 « clic » · 0,55 le chargeur part avec la main · 0,55-0,95 main gauche hors champ
// en bas à gauche (la ceinture) · 0,95-1,25 chargeur neuf qui remonte · 1,35 « clac », les balles entrent (le chargeur est
// EN PLACE : ck et le décalage de la main tombent à 0 ensemble) · 1,35-1,60 tape sous le chargeur, main au garde-main ·
// 1,60-1,90 retour à la hanche. `R` : le geste de l'arme (roulis, cabré, décalage) ; `vide` : la suite de l'arrêtoir.
function clesChargeur(R, vide) {
  const g = { rx: R.rx, ry: R.ry, rz: R.rz, x: R.x, y: R.y, z: R.z };
  const K = [
    { t: 0 },
    { t: 0.25, ...g },
    { t: 0.50, gm: 1 },
    { t: 0.55, ck: 1, x: R.x * 1.1, y: R.y + 0.004 },
    { t: 0.63, goy: -0.07, gox: -0.01 },
    { t: 0.80, gl: 1, gfx: -0.16, gfy: -0.46, gfz: -0.34 },
    { t: 0.95, gl: 1, gfx: -0.14, gfy: -0.48, gfz: -0.36, goy: -0.07, gox: -0.01 },
    { t: 1.25, gl: 0, goy: -0.05, gox: 0, x: R.x, y: R.y },
    { t: 1.35, goy: 0, ck: 0, y: R.y + 0.006 },
    { t: 1.42, goy: 0.014, y: R.y + 0.012 },
    { t: 1.50, goy: 0, y: R.y },
  ];
  if (!vide) K.push({ t: 1.60, gm: 0 }, { t: 1.90, x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 });
  else {
    // À VIDE (2,45 s) : la même, puis 1,90-2,25 main gauche sur l'arrêtoir de culasse (« tchak » à 2,05 : la culasse revient,
    // l'arme sursaute), retour
    K.push({ t: 1.60, gm: 0, ga: 0, rz: R.rz * 0.6 }, { t: 1.78, ga: 1, culT: 1 }, { t: 1.98, ga: 1, culT: 1, goy: 0 },
      { t: 2.05, goy: -0.012, culT: 0, y: R.y + 0.01, rx: R.rx + 2 * DEG }, { t: 2.12, goy: 0, y: R.y, rx: R.rx },
      { t: 2.25, ga: 0 }, { t: 2.45, x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 });
  }
  return K;
}
// le geste de l'arme pendant sa recharge, par arme (le pistolet se cabre plus, roule moins ; la lunette, moins)
const GESTES = {
  fa24: { rx: 15 * DEG, ry: 10 * DEG, rz: -25 * DEG, x: -0.04, y: 0.035, z: -0.03 },          // (CoD § 6.4 : roulée de 25°, cabrée de 15°)
  pm9: { rx: 14 * DEG, ry: 10 * DEG, rz: -28 * DEG, x: -0.04, y: 0.035, z: -0.02 },
  tp50: { rx: 10 * DEG, ry: 8 * DEG, rz: -22 * DEG, x: -0.035, y: 0.03, z: -0.03 },
  p17: { rx: 22 * DEG, ry: 14 * DEG, rz: -22 * DEG, x: -0.05, y: 0.04, z: 0.0 },
};
// les ancres de la FA-24 écrite (début, chargeur parti, balles entrées, fin [, fin de la vide]) portées sur la fiche `f`
function rechargeArme(id) {
  const f = ARMES[id], r = f.recharge, k = r.ajout / 1.35;
  const tact = piste(r.tact, clesChargeur(GESTES[id], false), VOIES, [[0, 0.55, 1.35, 1.90], [0, 0.55 * k, r.ajout, r.tact]]);
  const vide = piste(r.vide, clesChargeur(GESTES[id], true), VOIES, [[0, 0.55, 1.35, 2.45], [0, 0.55 * k, r.ajout, r.vide]]);
  return { tact, vide };
}
// LE CHANGEMENT D'ARME : le rangement descend de 0,25 m et tourne de 0,6 rad (temps de la fiche) ; la sortie, l'inverse,
// avec un petit dépassement : la réponse d'un ressort ω 20, ζ 0,6 lâché d'en bas, échantillonnée en clés (qu'Hermite
// suit), le temps resserré pour que l'arme passe sa pose aux trois quarts de la sortie de la fiche
const BAS = { y: -0.25, rx: -0.6, rz: 0.25, x: 0.03 };
function rangement(duree) { return piste(duree, [{ t: 0 }, { t: duree, ...BAS }]); }
function reponseRessort(t, w, z) {          // 1 → 0 : la position d'un ressort amorti lâché à 1 sans vitesse
  const wd = w * Math.sqrt(1 - z * z);
  return Math.exp(-z * w * t) * (Math.cos(wd * t) + (z * w / wd) * Math.sin(wd * t));
}
function sortie(duree) {
  const w = 20, z = 0.6, wd = w * Math.sqrt(1 - z * z), t0 = (Math.PI - Math.atan(wd / (z * w))) / wd;   // 1er passage à 0 : 0,138 s
  const e = t0 / (0.75 * duree), K = [];
  for (let i = 0; i <= 16; i++) {
    const t = duree * 1.6 * i / 16, s = reponseRessort(t * e, w, z);
    K.push({ t, y: BAS.y * s, rx: BAS.rx * s, rz: BAS.rz * s, x: BAS.x * s });
  }
  K.push({ t: duree * 1.6 + 0.05, y: 0, rx: 0, rz: 0, x: 0 });
  return piste(duree * 1.6 + 0.05, K);
}
// LE FP-12, CARTOUCHE PAR CARTOUCHE (0,35 + 0,42 par cartouche + 0,30, + 0,45 de pompe à vide) : l'arme roulée, la main
// gauche quitte la pompe pour la fenêtre d'éjection (gm), puis chaque cartouche : la main descend la chercher hors champ,
// remonte, la pousse (le son à 0,30), et la fin rend la main à la pompe ; la pompe à vide tire la pompe de 9 cm
const FP = { rx: 10 * DEG, ry: 6 * DEG, rz: -22 * DEG, x: -0.03, y: 0.02, z: 0.02 };
function fp12() {
  const f = ARMES.fp12.recharge;
  const debut = piste(f.debut, [{ t: 0 }, { t: 0.2, ...FP }, { t: f.debut, gm: 1 }]);
  const cartouche = piste(f.parCartouche, [{ t: 0, ...FP, gm: 1 }, { t: 0.10, gl: 1, gfx: -0.06, gfy: -0.42, gfz: -0.34 },
    { t: 0.14, gl: 1 }, { t: 0.25, gl: 0, goy: -0.035, goz: 0.01 }, { t: 0.30, goy: 0, goz: -0.015, y: FP.y - 0.004 },
    { t: 0.36, goz: 0, y: FP.y }, { t: f.parCartouche }]);
  const fin = piste(f.fin, [{ t: 0, ...FP, gm: 1 }, { t: 0.12, gm: 0 }, { t: f.fin, x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 }]);
  const pompe = piste(f.pompe, [{ t: 0 }, { t: 0.08, rx: 3 * DEG }, { t: 0.2, culT: 1, rx: 4 * DEG, y: -0.006 }, { t: 0.34, culT: 0, rx: 1 * DEG, y: 0 },
    { t: f.pompe, rx: 0 }]);
  // la pompe après chaque coup (857 ms entre deux) : en arrière 0,12-0,30, en avant 0,30-0,46
  const apresTir = piste(0.62, [{ t: 0 }, { t: 0.12 }, { t: 0.30, culT: 1, rx: 2 * DEG, x: -0.006 }, { t: 0.46, culT: 0, rx: 0, x: 0 }, { t: 0.62 }]);
  // (le contrat du § 4.5.9 : `rechargeTact` et `rechargeVide` sont des pistes — ici la recharge d'UNE cartouche, et celle
  // du tube vide, 7 cartouches et la pompe, mises bout à bout ; l'arme de vue, elle, joue les morceaux, au compte de
  // cartouches de la recharge en cours)
  const P = ARMES.fp12.chargeur;
  const rechargeTact = enchainer([debut, cartouche, fin]);
  // (F2 : début, cartouches, pompe, fin — l'ordre de l'arsenal, demande de L-V)
  const rechargeVide = enchainer([debut, ...Array(P).fill(cartouche), pompe, fin]);
  return { debut, cartouche, fin, pompe, apresTir, rechargeTact, rechargeVide };
}
// des pistes jouées BOUT À BOUT (les clés décalées ; à une jointure, la 1re clé de la suivante remplace la dernière de la
// précédente — elles valent la même chose, les morceaux s'enchaînent sans saut)
function enchainer(L) {
  const K = [];
  let t0 = 0;
  for (const P of L) {
    for (const k of P.cles) {
      const t = t0 + k.t;
      if (K.length && Math.abs(K[K.length - 1].t - t) < 1e-9) K.pop();
      K.push({ t, v: Float64Array.from(k.v) });
    }
    t0 += P.duree;
  }
  const P = { duree: t0, voies: L[0].voies, i: L[0].i, cles: K, m: null };
  tangentes(P);
  return P;
}
// LE TP-50, LA CULASSE 0,25 s APRÈS LE COUP : la main droite quitte la poignée pour le levier (dl), le lève de 60° en
// 0,15 s, recule la culasse de 8 cm en 0,12 s (l'étui part), la ramène, rabat le levier, revient à la poignée — dans les
// 1,33 s du verrou
function tp50() {
  const apresTir = piste(1.05, [{ t: 0 }, { t: 0.15, rz: -4 * DEG }, { t: 0.25, dl: 1, rz: -8 * DEG, rx: 2 * DEG }, { t: 0.40, cul: 1 },
    { t: 0.52, culT: 1, z: 0.006 }, { t: 0.64, culT: 0, z: 0 }, { t: 0.79, cul: 0 }, { t: 0.95, dl: 0, rz: 0, rx: 0 }, { t: 1.05 }]);
  return apresTir;
}
// L'INSPECTION (2,5 s de mouvement dans 3 s) : l'arme tournée pour montrer son flanc, puis son dessous, retour
const INSPECTION = piste(3.0, [{ t: 0 }, { t: 0.5, ry: 0.85, rz: 0.35, x: -0.06, y: 0.03, z: 0.03 }, { t: 1.3, ry: 0.9, rz: 0.4 },
  { t: 1.8, ry: -0.2, rz: -0.9, rx: 0.2, x: -0.04 }, { t: 2.5, ry: -0.15, rz: -0.85 }, { t: 3.0, ry: 0, rz: 0, rx: 0, x: 0, y: 0, z: 0 }]);

const chronosArme = (id) => {
  const f = ARMES[id], C = { sortie: sortie(f.sortie), rangement: rangement(f.rangement) };
  if (id === 'fp12') return { ...C, ...fp12() };
  const R = rechargeArme(id);
  C.rechargeTact = R.tact; C.rechargeVide = R.vide;
  if (id === 'tp50') C.apresTir = tp50();
  return C;
};
// LE COUTEAU (0,60 s par coup, la touche à 0,12) : l'arme part en bas à droite en 0,06 s et se cache ; le couteau, dans
// la main droite, fauche de droite à gauche — au milieu de l'écran à 0,12 s —, puis la main repart et l'arme remonte
// (0,28-0,60, le retour de 0,32 s)
const COUTEAU = piste(0.60, [
  { t: 0, vis: 1, dx: 0.20, dy: -0.30, dz: -0.30, drx: -0.3, dry: -0.6, drz: 1.2 },
  { t: 0.03, x: 0.06, y: -0.12, rx: -0.5, rz: 0.3, dk: 1, ov: 1, dx: 0.26, dy: -0.14, dz: -0.34, drx: 0.1, dry: -0.9, drz: 1.4 },
  { t: 0.06, x: 0.10, y: -0.30, rx: -0.9, rz: 0.5, vis: 0, gl: 1, gfx: -0.10, gfy: -0.46, gfz: -0.34 },
  { t: 0.12, dx: 0.02, dy: -0.10, dz: -0.46, drx: 0.05, dry: -0.35, drz: 1.45 },
  { t: 0.21, dx: -0.22, dy: -0.18, dz: -0.36, drx: -0.1, dry: 0.3, drz: 1.6 },
  { t: 0.28, dx: -0.20, dy: -0.30, dz: -0.30, drx: -0.3, dry: 0.8, drz: 1.4 },
  { t: 0.38, dx: 0.10, dy: -0.40, dz: -0.24, drx: -0.5, dry: 0, drz: 0.8, ov: 0, vis: 0 },
  { t: 0.42, vis: 1, dk: 1 },
  { t: 0.52, dk: 0, gl: 0, x: 0.02, y: -0.04, rx: -0.12, rz: 0.06 },
  { t: 0.60, x: 0, y: 0, rx: 0, rz: 0, dx: 0, dy: 0, dz: 0, drx: 0, dry: 0, drz: 0 },
], VOIES_MAIN);
// LA GRENADE : en 0,15 s (la goupille de l'arsenal : une flash peut partir dès 0,15 s — relecture du 23/10, c'était
// 0,30 et la main lançait 0,15 s après la grenade) l'arme baisse et se cache, la grenade vient dans la main droite, la
// main gauche arrache l'anneau ; tenue en arrière tant qu'on cuisine (`tenue`, la même pose) ; le lancer en 0,35 s (la
// grenade lâchée à 0,12) ; l'arme remonte en 0,25 s
const MAIN_TENUE = { dk: 1, dx: 0.14, dy: -0.16, dz: -0.30, drx: 0.4, dry: -0.2, drz: 0.5, ov: 1 };
const GRENADE = {
  goupille: piste(0.15, [{ t: 0, vis: 1 }, { t: 0.05, x: 0.06, y: -0.26, rx: -0.8, rz: 0.4, ...MAIN_TENUE, dy: -0.22 },
    { t: 0.06, vis: 0 }, { t: 0.09, gl: 1, gfx: 0.08, gfy: -0.15, gfz: -0.32, dy: -0.16 }, { t: 0.12, gl: 1, gfx: 0.10, gfy: -0.15, gfz: -0.30, pin: 0 },
    { t: 0.15, gl: 1, gfx: -0.12, gfy: -0.36, gfz: -0.30, pin: 1, dx: 0.18, dy: -0.12, dz: -0.24 }], VOIES_MAIN),
  tenue: piste(0.5, [{ t: 0, x: 0.06, y: -0.26, rx: -0.8, rz: 0.4, vis: 0, ...MAIN_TENUE, dx: 0.18, dy: -0.12, dz: -0.24, gl: 1, gfx: -0.12, gfy: -0.36, gfz: -0.30, pin: 1 },
    { t: 0.5, dy: -0.115 }], VOIES_MAIN),
  lancer: piste(0.35, [{ t: 0, x: 0.06, y: -0.26, rx: -0.8, rz: 0.4, vis: 0, ...MAIN_TENUE, dx: 0.18, dy: -0.12, dz: -0.24, gl: 1, gfx: -0.12, gfy: -0.36, gfz: -0.30, pin: 1 },
    { t: 0.06, dx: 0.20, dy: -0.06, dz: -0.18, drx: 0.7 }, { t: 0.12, dx: 0.10, dy: 0.0, dz: -0.50, drx: -0.3, ov: 1 },
    { t: 0.13, ov: 0 }, { t: 0.24, dx: 0.02, dy: -0.22, dz: -0.46, drx: -0.8 }, { t: 0.35, dx: 0.12, dy: -0.40, dz: -0.28, dk: 1 }], VOIES_MAIN),
  remontee: piste(0.25, [{ t: 0, x: 0.06, y: -0.26, rx: -0.8, rz: 0.4, vis: 1, dk: 1, dx: 0.12, dy: -0.40, dz: -0.28, drx: -0.8, dry: -0.2, drz: 0.5, gl: 1, gfx: -0.12, gfy: -0.36, gfz: -0.30 },
    { t: 0.14, dk: 0, gl: 0, x: 0.01, y: -0.03, rx: -0.08, rz: 0.04 }, { t: 0.25, x: 0, y: 0, rx: 0, rz: 0, dx: 0, dy: 0, dz: 0, drx: 0, dry: 0, drz: 0 }], VOIES_MAIN),
};

// les pistes, par arme — chacune : { duree, voies, i (voie → indice), cles: [{ t, v }], m (tangentes) }
export const CHRONOS = {
  fa24: chronosArme('fa24'), pm9: chronosArme('pm9'), fp12: chronosArme('fp12'), tp50: chronosArme('tp50'), p17: chronosArme('p17'),
  couteau: { coup: COUTEAU },
  grenade: GRENADE,
  inspection: INSPECTION,
};
