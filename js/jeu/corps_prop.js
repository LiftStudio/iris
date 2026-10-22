// =====================================================================
//  LE CORPS D'UN PROP — squelette du socle S0 (22/10), rempli par le lot L-K
// =====================================================================
// Tous les props, Haythem compris (spec arbitrage 19 : son Player est garé, caché, non simulé), ont ce corps-là : un
// disque au rayon du meuble, une bande de hauteur à lui (la poubelle passe sous la table), un cap à lui, une endurance de
// sprint, un petit saut (spec §§ 3.9, 4.5.13). Il a ce qu'a tout corps (pos, vel, posPrec, posAff, solAff, jumpY,
// airborne, rayon, memoriser, presenter) : la partie le traite comme un autre. Le squelette : le déplacement par
// `C.deplacer` au rayon, sans bande ; `deplacerProp` sans aimantation, avec le frottement tous les 0,4 m au-dessus de
// 1,2 m/s. L-K : la bande, le plaqué mural, le verrou aimanté < 20°, la marche silencieuse, le sprint à endurance.
import * as THREE from 'three';

const G = 9.81;
const angle = (a) => Math.atan2(Math.sin(a), Math.cos(a));

export class CorpsProp {
  // `o` = { rayon, haut, bas, bounds }
  constructor(collisions, o) {
    const { rayon = 0.3, haut = 1.0, bas = 0.1, bounds = null } = o || {};
    this.C = collisions;
    this.pos = new THREE.Vector3(); this.vel = new THREE.Vector3(); this.posPrec = new THREE.Vector3(); this.posAff = new THREE.Vector3();
    this.solAff = 0; this.jumpY = 0; this.jumpVel = 0; this.airborne = false;
    this.ang = 0; this.angPrec = 0; this.angAff = 0; this.speedNow = 0; this.endurance = 100;
    this.bounds = bounds; this.rayon = rayon; this.haut = haut; this.bas = bas;
  }
  memoriser() { this.posPrec.copy(this.pos); this.angPrec = this.ang; }
  presenter(a) {
    if (this.posPrec.distanceToSquared(this.pos) > 1.0) { this.posPrec.copy(this.pos); this.angPrec = this.ang; }
    this.posAff.lerpVectors(this.posPrec, this.pos, a);
    this.solAff = this.posPrec.y + (this.pos.y - this.posPrec.y) * a;
    this.posAff.y = this.solAff + this.jumpY;
    this.angAff = this.angPrec + angle(this.ang - this.angPrec) * a;
  }
  // se déplacer selon `dir` (unitaire ou nul) à `vitesse` : les mètres réellement parcourus
  bouger(dir, vitesse, dt) {
    const C = this.C, x0 = this.pos.x, z0 = this.pos.z;
    const k = 1 - Math.exp(-dt / 0.1);
    this.vel.x += (dir.x * vitesse - this.vel.x) * k; this.vel.z += (dir.z * vitesse - this.vel.z) * k;
    if (C) { C.deplacer(this.pos, this.vel.x * dt, this.vel.z * dt, this.rayon, this.vel, this.pos.y + this.jumpY); this.pos.y = C.solEn(this.pos.x, this.pos.z, this.pos.y); }
    else { this.pos.x += this.vel.x * dt; this.pos.z += this.vel.z * dt; }
    const B = this.bounds;
    if (B) { this.pos.x = Math.max(B.xMin, Math.min(B.xMax, this.pos.x)); this.pos.z = Math.max(B.zMin, Math.min(B.zMax, this.pos.z)); }
    if (this.airborne) {
      this.jumpVel -= G * dt; this.jumpY += this.jumpVel * dt;
      if (this.jumpY <= 0) { this.jumpY = 0; this.jumpVel = 0; this.airborne = false; }
    }
    const d = Math.hypot(this.pos.x - x0, this.pos.z - z0);
    this.speedNow = d / Math.max(1e-6, dt);
    return d;
  }
  sauter(v) { if (this.airborne) return 0; this.airborne = true; this.jumpVel = v; return v; }
  plaquer(collisions) { return false; }            // (le meuble mural plaqué contre le mur : L-K)
  dispose() { }
}

// LE DÉPLACEMENT D'UN PROP (étape 3 de Partie.pas) : figé → rien ; sinon l'axe de la commande (relatif au lacet), le cap
// qui tourne vers le lacet à 6 rad/s, le « frottement » (un indice sonore) tous les 0,4 m au-dessus de 1,2 m/s
const _dir = new THREE.Vector3();
export function deplacerProp(acteur, cmd, dt, partie) {
  const c = acteur.corps, P = acteur.prop;
  if (!c || (P && P.fige)) { if (c) { c.vel.set(0, 0, 0); c.speedNow = 0; } return; }
  const l = cmd.lacet, ax = cmd.ax || 0, ay = cmd.ay || 0;
  _dir.set(0, 0, 0);
  if (ax || ay) { _dir.set(-Math.sin(l) * ay + Math.cos(l) * ax, 0, -Math.cos(l) * ay - Math.sin(l) * ax); const n = _dir.length(); if (n > 1e-6) _dir.multiplyScalar(1 / n); }
  const v = (P && P.T && P.T.vitesse) || 4.6;
  const vit = cmd.marche ? 1.4 : cmd.sprint ? v * 1.2 : v;
  if (cmd.saut && !c.airborne) c.sauter(1.8);
  const d = c.bouger(_dir, vit, dt);
  // le cap : vers le lacet, à 6 rad/s au plus (verrouillé : il ne tourne pas)
  if (!(P && P.verrou)) { const e = angle(l + Math.PI - c.ang), m = 6 * dt; c.ang = angle(c.ang + Math.max(-m, Math.min(m, e))); }
  if (P) P.cap = c.ang;
  if (c.speedNow > 1.2 && !cmd.marche) {
    acteur._frotD = (acteur._frotD || 0) + d;
    if (acteur._frotD >= 0.4) { acteur._frotD -= 0.4; partie.evt('frottement', { a: acteur.id, x: c.pos.x, y: c.pos.y, z: c.pos.z }); }
  }
}
