// =====================================================================
//  LA POUPÉE DE CHIFFON (lot L-C, 23/10 ; spec §§ 3.6, 4.5.10, 5.5.5 — squelette du socle S0 ; banc/ragdoll.js recopié,
//  avec les murs)
// =====================================================================
// Un bot éliminé tombe : une poupée de chiffon VERLET posée sur son squelette Mixamo — 17 points aux articulations
// (hanches, poitrine, tête, épaules, coudes, poignets, hanches, genoux, chevilles, orteils), un BUSTE RIGIDE (ses six
// points liés deux à deux), les os comme distances fixes, des raideurs (la tête ne traverse pas les épaules, le pied garde
// son angle) et des distances MINIMALES (genou, coude, et la hanche : sans elles les jambes se rabattaient sur le buste,
// pieds à 14 cm de la tête au banc) ; le SOL (`solEn`, frottement 0,35) et LES MURS : les hanches, la poitrine et la tête
// sont sorties des formes du monde solide à leur hauteur (C.resoudre, une bande de ± leur rayon) — un corps ne finit jamais
// dans un mur ni sous une table. Lancée par l'élimination (Partie._elimVue, abonnée à `elim`) : la vitesse du corps, plus
// 2,5 m/s dans l'axe du coup au point touché (le buste suit à moitié ; à la tête, un coup sec). Simulée à PAS FIXES de
// 1/120 s (l'image donne son dt, la poupée le découpe : le même mouvement à 30 ou 144 images par seconde), arrêtée une fois
// au repos. Pas de sang, aucun corps qui reste :
//   - MILITAIRE : 4 s au sol, s'enfonce de 0,5 m en 0,4 s, disparaît (caché à 4,4 s) ;
//   - AIRSOFT (le défaut, réglage jeu.habillage) : 1,5 s au sol, puis s'efface en 0,6 s (caché à 2,1 s) — la variante
//     transparente de ses matériaux est compilée à la préparation (js/jeu/avatars.js), et ses brassards sont rangés.
// Affichage seulement. La réapparition rend le corps au mélangeur (relever : anim.couper() PUIS animKey = null — piège 2 de
// la carte des personnages : sans cela le squelette restait dans la pose de la poupée).
import * as THREE from 'three';
import { settings } from '../settings.js';

export const POUPEE = {
  impulsion: 2.5, buste: 0.5, tete: { coup: 1.4, buste: 0.3 },
  pesanteur: 1.35,                                             // (× g : une chute de jeu, plus franche qu'en vrai)
  militaire: { sol: 4.0, enfonce: 0.5, enfonceT: 0.4 }, airsoft: { sol: 1.5, efface: 0.6 },
  pas: 1 / 120, iterations: 8, rayon: 0.06, amorti: 0.985 /* par 1/60 s, celui du banc */, frottement: 0.2, murs: { Hips: 0.13, Spine2: 0.14, Head: 0.11 },
  // L'EFFONDREMENT : un corps sans tonus tombe d'abord sur lui-même — le bassin part vers le bas, les genoux vers l'avant
  // (m/s ajoutés au départ) — avant de basculer ; sans cela il tombait raide comme une planche, en plus d'une seconde
  effondre: { bassin: -3.0, genoux: 2.0 },
  // les distances MINIMALES (part de la distance de départ) : genou, coude, hanche (jambes contre le buste), entre jambes
  plis: { genou: 0.35, coude: 0.35, genouBuste: 0.8, piedBuste: 0.7, genoux: 0.6, pieds: 0.5 },
  // L'AFFAISSEMENT : un corps qui tient encore (adossé à un mur, accroché à un meuble) au-delà de `apres` s est tiré vers
  // le sol (`g` × la pesanteur en plus, pour le buste au-dessus de `haut` m) : il glisse le long du mur au lieu d'y rester
  // debout ; puis il se pose (amorti renforcé après `pose` s) et s'arrête au plus tard à `fin` s
  affaisse: { apres: 0.3, g: 4.0, haut: 0.3 }, pose: { apres: 1.0, amorti: 0.94 }, fin: 3.0,
  // LA BASCULE : un buste encore droit au-dessus du bassin (tombé à genoux) est poussé du côté où il penche (`a` m/s²)
  bascule: { apres: 0.25, haut: 0.35, a: 12 },
  repos: { vitesse: 0.03, duree: 0.3 }, pasMax: 12,          // au repos : aucun point à plus de 3 cm/s pendant 0,3 s
};
const POINTS = ['Hips', 'Spine2', 'Head', 'LeftArm', 'LeftForeArm', 'LeftHand', 'RightArm', 'RightForeArm', 'RightHand',
  'LeftUpLeg', 'LeftLeg', 'LeftFoot', 'RightUpLeg', 'RightLeg', 'RightFoot', 'LeftToeBase', 'RightToeBase'];
const BUSTE = ['Hips', 'Spine2', 'LeftArm', 'RightArm', 'LeftUpLeg', 'RightUpLeg'];
const LIENS = [['Spine2', 'Head'], ['LeftArm', 'LeftForeArm'], ['LeftForeArm', 'LeftHand'], ['RightArm', 'RightForeArm'], ['RightForeArm', 'RightHand'],
  ['LeftUpLeg', 'LeftLeg'], ['LeftLeg', 'LeftFoot'], ['RightUpLeg', 'RightLeg'], ['RightLeg', 'RightFoot'], ['LeftFoot', 'LeftToeBase'], ['RightFoot', 'RightToeBase'],
  ['LeftArm', 'Head'], ['RightArm', 'Head'], ['LeftLeg', 'LeftToeBase'], ['RightLeg', 'RightToeBase']];
const PLIS = [['LeftUpLeg', 'LeftFoot', 'genou'], ['RightUpLeg', 'RightFoot', 'genou'], ['LeftArm', 'LeftHand', 'coude'], ['RightArm', 'RightHand', 'coude'],
  ['LeftLeg', 'Spine2', 'genouBuste'], ['RightLeg', 'Spine2', 'genouBuste'], ['LeftFoot', 'Spine2', 'piedBuste'], ['RightFoot', 'Spine2', 'piedBuste'],
  ['LeftLeg', 'RightLeg', 'genoux'], ['LeftFoot', 'RightFoot', 'pieds']];

const _v = new THREE.Vector3(), _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3();
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _d2 = { x: 0, z: 0 };

function repereBuste(P, out) {
  // x = droite → gauche des hanches, y = bassin → poitrine, z = devant
  _a.subVectors(P.LeftUpLeg.p, P.RightUpLeg.p).normalize();
  _b.subVectors(P.Spine2.p, P.Hips.p).normalize();
  _c.crossVectors(_a, _b).normalize();
  _a.crossVectors(_b, _c).normalize();
  return out.makeBasis(_a, _b, _c);
}

// L'OPACITÉ d'un corps (1 = opaque) : ses matériaux CLONÉS passent transparents le temps de l'effacement (la variante est
// compilée à la préparation) ; les brassards (matériaux partagés de l'équipe) sont rangés pendant ce temps
export function opaciteCorps(player, k) {
  const M = player && player.avatarModel; if (!M) return;
  k = Math.max(0, Math.min(1, k));
  if (player._opaciteK === k) return;
  player._opaciteK = k;
  M.traverse((o) => {
    if (!o.isMesh || !o.material || o.userData.brassard) { if (o.userData && o.userData.brassard) o.visible = k >= 1; return; }
    for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
      const O = m.userData.opaque || (m.userData.opaque = { o: m.opacity, t: m.transparent, dw: m.depthWrite });
      const t = O.t || k < 1;
      if (m.transparent !== t) { m.transparent = t; m.needsUpdate = true; }
      m.opacity = O.o * k;
    }
  });
}
const habillage = () => { try { return settings.get('jeu.habillage') === 'militaire' ? 'militaire' : 'airsoft'; } catch (e) { return 'airsoft'; } };

export class Poupee {
  // `impulsion` : vitesse donnée au point touché (m/s, Vector3) ; `point` : { x, y, z, tete } (le point du coup fatal) ou le
  // nom d'un des 17 points ; `collisions` : le monde solide (sol et murs)
  constructor(player, impulsion, point, collisions) {
    this.player = player; this.collisions = collisions || null; this.t = 0; this.acc = 0; this.reposT = 0; this.repos = false; this.nan = 0; this.vitesse = 0;
    this.murX = 0; this.murZ = 0; this.murT = -Infinity;
    this.habillage = habillage();
    const H = this.habillage === 'militaire' ? POUPEE.militaire : POUPEE.airsoft;
    this.duree = this.habillage === 'militaire' ? H.sol + H.enfonceT : H.sol + H.efface;
    this.P = null;
    const A = player && player.avatar;
    if (player) { if (player._poupee && player._poupee !== this) player._poupee.liberer(false); player._poupee = this; }
    if (!A || !A.ok || !player.mesh) return;
    this.A = A;
    const P = this.P = {};
    player.mesh.updateMatrixWorld(true);
    for (const n of POINTS) { const b = A.bone(n); if (!b) continue; const q = b.getWorldPosition(new THREE.Vector3()); P[n] = { p: q.clone(), o: q.clone(), n, buste: n === 'Hips' || n === 'Spine2' || n === 'Head' }; }
    if (!P.Hips || !P.Spine2 || !P.Head || !P.LeftUpLeg || !P.RightUpLeg) { this.P = null; return; }
    // l'élan du corps (sa vitesse au sol) : la position « d'avant » en est reculée d'un pas
    const h = POUPEE.pas, v = player.vel || _v.set(0, 0, 0);
    for (const n in P) P[n].o.addScaledVector(v, -h);
    // le coup : au point le plus proche du point touché (à la tête, un coup sec), le buste suit
    if (impulsion && impulsion.lengthSq() > 1e-8) {
      let cible = typeof point === 'string' ? point : 'Spine2', tete = false;
      if (point && typeof point === 'object') {
        tete = !!point.tete;
        if (tete) cible = 'Head';
        else if (Number.isFinite(point.x + point.y + point.z) && (point.x || point.y || point.z)) {
          let bd = Infinity;
          for (const n in P) { const d = P[n].p.distanceToSquared(_a.set(point.x, point.y, point.z)); if (d < bd) { bd = d; cible = n; } }
        }
      }
      const kP = tete ? POUPEE.tete.coup : 1, kB = tete ? POUPEE.tete.buste : POUPEE.buste;
      if (P[cible]) P[cible].o.addScaledVector(impulsion, -h * kP);
      for (const n of BUSTE) if (n !== cible && P[n]) P[n].o.addScaledVector(impulsion, -h * kB);
    }
    // l'effondrement : le bassin et le buste vers le bas, les genoux vers l'avant (le cap du corps)
    const E = POUPEE.effondre, fx = Math.sin(player.ang || 0), fz = Math.cos(player.ang || 0);
    // (le côté de la bascule par défaut : celui du coup, sinon vers l'arrière)
    const ih = impulsion ? Math.hypot(impulsion.x, impulsion.z) : 0;
    this.dirX = ih > 0.1 ? impulsion.x / ih : -fx; this.dirZ = ih > 0.1 ? impulsion.z / ih : -fz;
    for (const n of BUSTE) if (P[n]) P[n].o.y -= E.bassin * h;
    for (const n of ['LeftLeg', 'RightLeg']) if (P[n]) { P[n].o.x -= fx * E.genoux * h; P[n].o.z -= fz * E.genoux * h; }
    // les contraintes : distances de départ
    this.C = [];
    const lier = (a, b) => { if (P[a] && P[b]) this.C.push([P[a], P[b], P[a].p.distanceTo(P[b].p)]); };
    for (let i = 0; i < BUSTE.length; i++) for (let j = i + 1; j < BUSTE.length; j++) lier(BUSTE[i], BUSTE[j]);
    for (const [a, b] of LIENS) lier(a, b);
    this.plis = PLIS.filter(([a, b]) => P[a] && P[b]).map(([a, b, k]) => [P[a], P[b], P[a].p.distanceTo(P[b].p) * POUPEE.plis[k]]);
    this.murs = Object.entries(POUPEE.murs).filter(([n]) => P[n]).map(([n, r]) => [P[n], r]);
    // la pose de départ de l'os des hanches, et le repère du buste à cet instant
    this.qHanches0 = A.bone('Hips').getWorldQuaternion(new THREE.Quaternion());
    this.M0inv = repereBuste(P, new THREE.Matrix4()).invert();
  }

  // le temps de l'image : découpé en pas fixes de 1/120 s (12 au plus : un onglet revenu après une pause ne rattrape pas)
  pas(dt) {
    if (!(dt > 0)) return;
    this.t += dt;
    if (!this.P || this.repos) return;
    this.acc = Math.min(this.acc + dt, POUPEE.pas * POUPEE.pasMax);
    while (this.acc >= POUPEE.pas - 1e-9) { this.acc -= POUPEE.pas; this._pas(POUPEE.pas); if (this.repos) { this.acc = 0; break; } }
  }
  _pas(h) {
    const P = this.P, g = -9.81 * POUPEE.pesanteur * h * h, C = this.collisions, R = POUPEE.rayon, A = POUPEE.affaisse, Po = POUPEE.pose;
    const am = Math.pow(POUPEE.amorti, h * 60) * (this.t > Po.apres ? Math.pow(Po.amorti, h * 60) : 1);
    const tire = this.t > A.apres;
    let vMax = 0;
    // (la bascule : la tête au-dessus du bassin de plus de `haut` m, poussée à plat du côté où elle penche)
    const Bq = POUPEE.bascule;
    if (this.t > Bq.apres && P.Head.p.y - P.Hips.p.y > Bq.haut) {
      let dx = P.Head.p.x - P.Hips.p.x, dz = P.Head.p.z - P.Hips.p.z, n = Math.hypot(dx, dz);
      // (adossé à un mur depuis moins de 0,2 s : il bascule en s'en écartant, sinon il resterait plaqué contre lui)
      if (this.t - this.murT < 0.2) { dx = this.murX; dz = this.murZ; n = Math.hypot(dx, dz) || 1; }
      else if (n < 0.04) { dx = this.dirX; dz = this.dirZ; n = 1; }
      const k = Bq.a * h * h / n;
      for (const q of [P.Head, P.Spine2]) { q.p.x += dx * k; q.p.z += dz * k; }
    }
    for (const n in P) {
      const q = P[n], x = q.p.x, y = q.p.y, z = q.p.z;
      let gy = g;
      if (tire && q.buste && C && y - C.solEn(x, z, y + 0.3) > A.haut) gy *= 1 + A.g;
      q.p.x += (x - q.o.x) * am; q.p.y += (y - q.o.y) * am + gy; q.p.z += (z - q.o.z) * am;
      q.o.set(x, y, z);
    }
    for (let it = 0; it < POUPEE.iterations; it++) {
      for (const [a, b, L] of this.C) {
        _v.subVectors(b.p, a.p); const d = _v.length() || 1e-6, k = (d - L) / d * 0.5;
        a.p.addScaledVector(_v, k); b.p.addScaledVector(_v, -k);
      }
      for (const [a, b, Lmin] of this.plis) {
        _v.subVectors(b.p, a.p); const d = _v.length() || 1e-6;
        if (d < Lmin) { const k = (d - Lmin) / d * 0.5; a.p.addScaledVector(_v, k); b.p.addScaledVector(_v, -k); }
      }
      // le sol, et son frottement (un point posé perd sa vitesse horizontale)
      for (const n in P) {
        const q = P[n], s = (C ? C.solEn(q.p.x, q.p.z, q.p.y + 0.3) : 0) + R;
        if (q.p.y < s) {
          q.p.y = s; q.o.x += (q.p.x - q.o.x) * POUPEE.frottement; q.o.z += (q.p.z - q.o.z) * POUPEE.frottement;
          if (q.o.y < s) q.o.y = q.p.y + (q.p.y - q.o.y) * 0.2;
        }
      }
      // les murs (les deux dernières passes : hanches, poitrine, tête sorties des formes à leur hauteur)
      if (C && it >= POUPEE.iterations - 2) {
        for (const [q, r] of this.murs) {
          _d2.x = q.p.x; _d2.z = q.p.z;
          if (C.resoudre(_d2, r, null, q.p.y, r, -r)) {
            // (la poussée du mur, gardée : le côté où le corps doit basculer)
            const mx = _d2.x - q.p.x, mz = _d2.z - q.p.z, m = Math.hypot(mx, mz);
            if (m > 1e-5) { this.murX = mx / m; this.murZ = mz / m; this.murT = this.t; }
            q.p.x = _d2.x; q.p.z = _d2.z;
          }
        }
      }
    }
    // (un NaN — une contrainte dégénérée — ne doit jamais atteindre un os : le point repart d'où il était)
    for (const n in P) {
      const q = P[n];
      if (!Number.isFinite(q.p.x + q.p.y + q.p.z)) { q.p.copy(q.o); this.nan++; if (!Number.isFinite(q.p.x + q.p.y + q.p.z)) { q.p.set(P.Hips.o.x, P.Hips.o.y, P.Hips.o.z); q.o.copy(q.p); } }
      vMax = Math.max(vMax, q.p.distanceToSquared(q.o));
    }
    this.vitesse = Math.sqrt(vMax) / h;                       // (m/s : le point le plus rapide de ce pas)
    // au repos : plus de pas (les os restent où la dernière pose les a mis)
    if (vMax < (POUPEE.repos.vitesse * h) ** 2) { this.reposT += h; if (this.reposT >= POUPEE.repos.duree) this.repos = true; }
    else this.reposT = 0;
    if (this.t >= POUPEE.fin) this.repos = true;
  }

  // CACHÉE : son temps est fini (le corps a disparu)
  get cachee() { return this.t >= this.duree; }
  // le temps fini : rien à montrer de plus (le contrat du socle)
  get calme() { return this.t >= this.duree; }
  get auRepos() { return this.repos; }

  // le squelette ramené sur les points (une fois par image) ; l'enfoncement et l'effacement ; caché à la fin
  poser() {
    const p = this.player; if (!p || !p.mesh) return;
    if (this.cachee) { p.mesh.visible = false; return; }
    if (!this.P || !this.A || p.avatar !== this.A) return;
    let dy = 0;
    if (this.habillage === 'militaire') {
      const H = POUPEE.militaire;
      if (this.t > H.sol) dy = -H.enfonce * Math.min(1, (this.t - H.sol) / H.enfonceT);
    } else {
      const H = POUPEE.airsoft;
      opaciteCorps(p, this.t > H.sol ? 1 - Math.min(1, (this.t - H.sol) / H.efface) : 1);
    }
    // (caché par la cadence — un autre étage, hors du cadre — : rien à poser ; au repos, rien ne bouge : on ne repose que
    // si l'enfoncement change ou si la pose n'a jamais été faite)
    if (!p.mesh.visible) return;
    if (this.repos && this._dyPose === dy) return;
    this._dyPose = dy;
    const A = this.A, P = this.P, h = A.bone('Hips');
    // 1) les hanches : position et orientation (rotation du repère du buste depuis la mort)
    h.parent.updateWorldMatrix(true, false);
    h.position.copy(h.parent.worldToLocal(_v.copy(P.Hips.p).setY(P.Hips.p.y + dy)));
    repereBuste(P, _m).multiply(this.M0inv);
    _q.setFromRotationMatrix(_m).multiply(this.qHanches0);
    h.parent.getWorldQuaternion(_q2).invert();
    h.quaternion.copy(_q2.multiply(_q));
    h.updateMatrixWorld(true);
    // 2) le cou vers la tête, puis les membres, os par os de la racine vers les extrémités (enfoncés de `dy` comme les hanches)
    const vise = (os, fils, n) => { if (P[n]) A.viserPoint(os, fils, _c.copy(P[n].p).setY(P[n].p.y + dy)); };
    vise('Neck', 'Head', 'Head');
    for (const c of ['Left', 'Right']) {
      vise(c + 'Arm', c + 'ForeArm', c + 'ForeArm');
      vise(c + 'ForeArm', c + 'Hand', c + 'Hand');
      vise(c + 'UpLeg', c + 'Leg', c + 'Leg');
      vise(c + 'Leg', c + 'Foot', c + 'Foot');
      vise(c + 'Foot', c + 'ToeBase', c + 'ToeBase');
    }
  }

  // la poupée quittée (la réapparition, une autre poupée) : le corps rendu opaque et au mélangeur
  liberer(relever = true) {
    const p = this.player; if (!p) return;
    if (p._poupee === this) p._poupee = null;
    opaciteCorps(p, 1);
    if (relever) releverCorps(p);
    this.player = null;
  }
}

// LE MÊME Player remis debout (réapparition) : le mélangeur coupé — les os reprennent leur pose d'origine (three la rend
// quand plus aucune action ne les tient) — PUIS animKey effacée (sinon _driveAnim ne relance pas l'attente : la clé n'a
// pas changé), pas de fondu depuis la pose d'avant la mort, les ajouts d'après-pose oubliés
export function releverCorps(p) {
  if (!p) return;
  if (p.anim) p.anim.couper();
  p.animKey = null; p._clipAvant = undefined; p.locoEtat = null;
  if (p.avatar) p.avatar._postOk = false;
  if (p.oublierApres) p.oublierApres();
  opaciteCorps(p, 1);
}
