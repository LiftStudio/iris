// =====================================================================
//  LE CORPS D'UN PROP — lot L-K (23/10), sur le squelette du socle S0 (22/10)
// =====================================================================
// Tous les props, Haythem compris (spec arbitrage 19 : son Player est garé, caché, non simulé), ont ce corps-là — jamais
// un avatar, jamais une couche qui penche (piège 13 du cœur, risque R27) : un DISQUE au rayon du meuble
// (`clamp(max(l, p)/2 × 0,9 ; 0,15 ; 0,5)`), une BANDE de hauteur à lui (`[pieds + min(0,25 ; 0,4 h), pieds + max(h ; 0,5)]` :
// la poubelle passe sous la table, le tabouret non), un cap à lui, une endurance de sprint, un petit saut (spec §§ 3.9,
// 4.5.13). Il a ce qu'a tout corps (pos, vel, posPrec, posAff, solAff, jumpY, airborne, rayon, memoriser, presenter) : la
// partie le traite comme un autre — les contacts entre corps (mouvement.js separer) lisent son rayon et sa bande.
//   - le pas : l'inertie de Player.move (0,13 s pour lancer, 0,085 s pour s'arrêter), C.deplacer au rayon et dans la bande
//     (le monde solide garantit l'absence de tunnel par sous-pas de r/2), le sol par C.solEn (les volées, les paliers), les
//     bornes de la partie ;
//   - les allures (§ 3.9) : la vitesse du TYPE (`4,6 × clamp(1,15 − 0,35·∛V, 0,72, 1,05)`), la marche à 1,4 m/s
//     SILENCIEUSE (touche de marche, ou manche à peine poussé), le sprint ×1,2 à endurance (100, −33/s, +15/s ; vidée, plus
//     de sprint avant 20) ; le saut à 1,8 m/s (0,165 m d'apogée) ;
//   - le cap (deplacerProp) : LIBRE, il suit le lacet de la caméra à 6 rad/s au plus (la caméra regarde le dos du meuble,
//     comme un personnage à la 3e personne : tourner la caméra fait tourner le meuble, et les bots le voient) ; VERROUILLÉ,
//     il ne bouge plus — et s'AIMANTE, s'il en est à moins de 20°, au cap d'une vraie pose du même type de la pièce puis aux
//     quatre axes du monde (les murs de l'école sont d'équerre), à 4 rad/s ; un meuble MURAL verrouillé se PLAQUE au mur le
//     plus proche (quatre sondes de 0,45 m : le dos à 1,5 cm du mur, le cap à sa normale) et reste accroché tant qu'il est
//     verrouillé ; FIGÉ, rien ne bouge (on vise, on provoque, on regarde le chrono) ;
//   - les indices (événements) : 'frottement' tous les 0,4 m au-dessus de 1,2 m/s hors de la marche, 'saut' (le « toc »).
// L'endurance d'un prop est celle de l'ACTEUR (`acteur.endurance`, dans l'état § 4.7), recopiée sur le corps pour
// l'affichage. Simulation pure : ni hasard, ni horloge, ni entrée (la commande seule).
import * as THREE from 'three';
import { MEUBLES } from '../registre_meubles.js';

const G = 9.81;
const angle = (a) => Math.atan2(Math.sin(a), Math.cos(a));
// LES ALLURES D'UN PROP (spec § 3.9 ; REGLAGES_PROP de partie_prop.js les redit pour les règles)
export const ALLURES_PROP = {
  vitesse: 4.6, marche: 1.4, sprint: 1.2, endurance: { perte: 33, regain: 15, seuil: 20 }, saut: 1.8,
  tauDepart: 0.13, tauArret: 0.085, capLibre: 6, capAimant: 4, aimant: 20 * Math.PI / 180,
  frottement: { vitesse: 1.2, pas: 0.4 }, plaquage: { sonde: 0.45, ecart: 0.015 }, ampMarche: 0.58,
};

export class CorpsProp {
  // `o` = { rayon, haut, bas, bounds }
  constructor(collisions, o) {
    const { rayon = 0.3, haut = 1.0, bas = 0.1, bounds = null } = o || {};
    this.C = collisions;
    this.pos = new THREE.Vector3(); this.vel = new THREE.Vector3(); this.posPrec = new THREE.Vector3(); this.posAff = new THREE.Vector3();
    this.solAff = 0; this.jumpY = 0; this.jumpVel = 0; this.airborne = false;
    this.ang = 0; this.angPrec = 0; this.angAff = 0; this.speedNow = 0; this.endurance = 100;
    this.bounds = bounds; this.rayon = rayon; this.haut = haut; this.bas = bas;
    this.h = 1.73;                   // (la taille d'un humain : l'œil d'un prop resté humain, mouvement.js hauteurOeil)
    // (le meuble porté, posé par deguiser : sa boîte locale — le dos, la face, les flancs — pour le plaquage et les coins)
    this.boite = null; this.mural = false;
    this.plaque = false; this.decal = new THREE.Vector3();   // accroché au mur ; le décalage AFFICHÉ (le dos à 1,5 cm du mur)
  }
  // les dimensions d'un type du registre (deguiser)
  porter(T) {
    this.rayon = T.rayon; this.haut = T.bande.haut; this.bas = T.bande.bas; this.boite = T.boite; this.mural = !!T.mural;
    this.plaque = false; this.decal.set(0, 0, 0);
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
    const C = this.C, x0 = this.pos.x, z0 = this.pos.z, A = ALLURES_PROP;
    const bouge = dir.x * dir.x + dir.z * dir.z > 1e-6 && vitesse > 0;
    const k = 1 - Math.exp(-dt / (bouge ? A.tauDepart : A.tauArret));
    this.vel.x += (dir.x * vitesse - this.vel.x) * k; this.vel.z += (dir.z * vitesse - this.vel.z) * k; this.vel.y = 0;
    if (this.vel.x * this.vel.x + this.vel.z * this.vel.z < 1e-6) this.vel.set(0, 0, 0);
    if (C) {
      C.deplacer(this.pos, this.vel.x * dt, this.vel.z * dt, this.rayon, this.vel, this.pos.y + this.jumpY, this.haut, this.bas);
      this.pos.y = C.solEn(this.pos.x, this.pos.z, this.pos.y);
    } else { this.pos.x += this.vel.x * dt; this.pos.z += this.vel.z * dt; }
    const B = this.bounds;
    if (B) {
      this.pos.x = Math.max(B.xMin, Math.min(B.xMax, this.pos.x)); this.pos.z = Math.max(B.zMin, Math.min(B.zMax, this.pos.z));
      if ((this.pos.x >= B.xMax && this.vel.x > 0) || (this.pos.x <= B.xMin && this.vel.x < 0)) this.vel.x = 0;
      if ((this.pos.z >= B.zMax && this.vel.z > 0) || (this.pos.z <= B.zMin && this.vel.z < 0)) this.vel.z = 0;
    }
    if (this.airborne) {
      this.jumpVel -= G * dt; this.jumpY += this.jumpVel * dt;
      // (sous un plateau bas : la tête du meuble ne traverse pas — la bande heurte, le saut s'arrête)
      if (C && this.jumpVel > 0 && !C.libre(this.pos.x, this.pos.z, this.rayon, this.pos.y + this.jumpY, this.haut, this.bas)) { this.jumpY -= this.jumpVel * dt; this.jumpVel = 0; }
      if (this.jumpY <= 0) { this.jumpY = 0; this.jumpVel = 0; this.airborne = false; }
    }
    const d = Math.hypot(this.pos.x - x0, this.pos.z - z0);
    this.speedNow = d / Math.max(1e-6, dt);
    return d;
  }
  sauter(v) { if (this.airborne) return 0; this.airborne = true; this.jumpVel = v; return v; }
  // LE PLAQUAGE MURAL (au verrou d'un meuble `mural`) : quatre sondes de 0,45 m au-delà de la boîte (le dos, la face, les deux
  // flancs), à mi-hauteur ; le mur le plus proche → le cap à sa normale (le dos contre lui), le corps avancé contre lui
  // autant que son disque le permet (jamais DANS le mur : le reste, jusqu'à 1,5 cm, est un décalage d'affichage)
  plaquer(collisions) {
    const C = collisions || this.C, b = this.boite;
    if (!C || !b) return false;
    const A = ALLURES_PROP.plaquage, y = this.pos.y + (this.bas + this.haut) / 2, s = Math.sin(this.ang), c = Math.cos(this.ang);
    // (les directions du repère du meuble, en monde : +z local = (sin, cos), +x local = (cos, −sin))
    const dirs = [[-s, -c, -b.min.z], [s, c, b.max.z], [c, -s, b.max.x], [-c, s, -b.min.x]];
    let best = null;
    for (const [dx, dz, ext] of dirs) {
      const L = Math.max(0.05, ext) + A.sonde;
      const f = C.rayonLibre(this.pos.x, y, this.pos.z, this.pos.x + dx * L, y, this.pos.z + dz * L, 0);
      if (f >= 1) continue;
      const ecart = f * L - Math.max(0.05, ext);
      if (!best || ecart < best.ecart) best = { dx, dz, ecart, mur: f * L };
    }
    if (!best) return false;
    // le dos (−z local) vers le mur : (−sin a, −cos a) = (dx, dz)
    this.ang = Math.atan2(-best.dx, -best.dz);
    const dos = Math.max(0.02, -b.min.z), voulu = dos + A.ecart, tenu = Math.max(voulu, this.rayon + 0.005);
    const av = best.mur - tenu;                                   // (de combien avancer le centre vers le mur)
    if (av > 0 && C) {
      const p = { x: this.pos.x, z: this.pos.z };
      C.deplacer(p, best.dx * av, best.dz * av, this.rayon, null, this.pos.y, this.haut, this.bas);
      this.pos.x = p.x; this.pos.z = p.z;
    }
    const reste = Math.max(0, (best.mur - Math.max(0, av)) - voulu);
    this.decal.set(best.dx * reste, 0, best.dz * reste);
    this.vel.set(0, 0, 0); this.plaque = true;
    return true;
  }
  // (la fin d'une partie : Partie.sortir libère chaque corps de prop — l'affichage des props s'y range, js/jeu/deguisements.js)
  dispose() { this.C = null; for (const f of A_LA_SORTIE) { try { f(this); } catch (e) { /* (un rangement qui échoue n'empêche pas la sortie) */ } } }
}
// les rangements à faire quand un corps de prop est libéré (deguisements.js y met le retrait de la surbrillance)
export const A_LA_SORTIE = new Set();

// LES COINS d'un meuble posé (sa boîte orientée au sol) : tous libres ? (un baby-foot de 1,48 m dans une porte de 0,8 m :
// « Pas la place » — le disque de 0,5 m ne suffit pas à le dire)
export function coinsLibres(C, T, x, y, z, cap) {
  if (!C || !T || Math.max(T.taille.x, T.taille.z) <= 2 * T.rayon + 0.02) return true;
  const b = T.boite, s = Math.sin(cap), c = Math.cos(cap), m = 0.04;
  for (const [lx, lz] of [[b.min.x + m, b.min.z + m], [b.max.x - m, b.min.z + m], [b.min.x + m, b.max.z - m], [b.max.x - m, b.max.z - m],
    [(b.min.x + b.max.x) / 2, b.min.z + m], [(b.min.x + b.max.x) / 2, b.max.z - m], [b.min.x + m, (b.min.z + b.max.z) / 2], [b.max.x - m, (b.min.z + b.max.z) / 2]]) {
    if (!C.libre(x + lx * c + lz * s, z - lx * s + lz * c, 0.05, y, T.bande.haut, T.bande.bas)) return false;
  }
  return true;
}

// L'AIMANT DU VERROU : le cap d'équerre le plus proche à moins de 20° — d'abord ceux des vraies poses de la famille dans
// la pièce (les chaises d'une rangée ; à la symétrie du type près), puis les quatre axes du monde ; null s'il n'y en a pas
function capAimante(T, x, y, z, cap, zone) {
  const A = ALLURES_PROP.aimant, per = T.symetrie === 0 ? null : T.symetrie || 2 * Math.PI;
  const ecart = (c) => { let e = angle(c - cap); if (per && per < 2 * Math.PI - 1e-6) { e = ((e % per) + per) % per; if (e > per / 2) e -= per; } return e; };
  let best = null, be = A;
  const L = zone != null ? MEUBLES.parZone.get(zone) || [] : [];
  for (const P of L) {
    const U = MEUBLES.types.get(P.cle);
    if (!U || U.famille !== T.famille || Math.hypot(P.x - x, P.z - z) > 8) continue;
    const e = ecart(P.cap); if (Math.abs(e) < be) { be = Math.abs(e); best = cap + e; }
  }
  if (best !== null) return best;
  for (const c of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) { const e = ecart(c); if (Math.abs(e) < be) { be = Math.abs(e); best = cap + e; } }
  return best;
}

// LE DÉPLACEMENT D'UN PROP (étape 3 de Partie.pas) : figé → rien ; accroché → rien tant qu'il reste verrouillé ; sinon
// l'axe de la commande (relatif au lacet), l'allure, le saut, le cap (libre ou aimanté), le plaquage, le frottement
const _dir = new THREE.Vector3();
export function deplacerProp(acteur, cmd, dt, partie) {
  const c = acteur.corps, P = acteur.prop, A = ALLURES_PROP, T = P && P.T;
  if (!c) return;
  // l'endurance (celle de l'acteur, dans l'état) : le sprint la vide, le reste la rend ; vidée, plus de sprint avant 20
  const en = Number.isFinite(acteur.endurance) ? acteur.endurance : 100;
  if (P && P.fige) { c.vel.set(0, 0, 0); c.speedNow = 0; acteur.endurance = Math.min(100, en + A.endurance.regain * dt); c.endurance = acteur.endurance; P.vitesseAff = 0; P.rotAff = 0; return; }
  if (c.plaque && !(P && P.verrou)) { c.plaque = false; c.decal.set(0, 0, 0); P && (P._aimant = undefined); }
  const l = cmd.lacet, ax = cmd.ax || 0, ay = cmd.ay || 0;
  _dir.set(0, 0, 0);
  if (!c.plaque && (ax || ay)) {
    _dir.set(-Math.sin(l) * ay + Math.cos(l) * ax, 0, -Math.cos(l) * ay - Math.sin(l) * ax);
    const n = _dir.length(); if (n > 1e-6) _dir.multiplyScalar(1 / n);
  }
  const bouge = _dir.lengthSq() > 0;
  const base = (T && T.vitesse) || A.vitesse;
  const marche = !!cmd.marche || (bouge && cmd.amp > 0 && cmd.amp < A.ampMarche);
  if (acteur._sprintVide && en >= A.endurance.seuil) acteur._sprintVide = false;
  const sprint = !!cmd.sprint && bouge && !marche && !acteur._sprintVide && en > 0;
  let e = en;
  if (sprint) { e = Math.max(0, en - A.endurance.perte * dt); if (e <= 0) acteur._sprintVide = true; }
  else e = Math.min(100, en + A.endurance.regain * dt);
  acteur.endurance = e; c.endurance = e;
  const vit = marche ? A.marche : sprint ? base * A.sprint : base;
  if (cmd.saut && !c.airborne && !c.plaque) { c.sauter(A.saut); partie.evt('saut', { a: acteur.id, f: 0.3 }); }
  const d = c.plaque ? 0 : c.bouger(_dir, bouge ? vit : 0, dt);
  if (c.plaque) { c.vel.set(0, 0, 0); c.speedNow = 0; }
  // LE CAP
  const ang0 = c.ang;
  if (!(P && P.verrou)) {
    if (P) P._aimant = undefined;
    const cible = angle(l + Math.PI - c.ang), m = A.capLibre * dt;
    c.ang = angle(c.ang + Math.max(-m, Math.min(m, cible)));
  } else if (T && !c.plaque) {
    // (au verrou : l'aimant, calculé une fois ; puis le plaquage d'un meuble mural)
    if (P._aimant === undefined) {
      const cap = capAimante(T, c.pos.x, c.pos.y, c.pos.z, c.ang, P.zone ?? zoneDe(partie, c));
      P._aimant = cap !== null && coinsLibres(partie.game.collisions, T, c.pos.x, c.pos.y, c.pos.z, cap) ? cap : null;
    }
    if (P._aimant !== null) {
      const e2 = angle(P._aimant - c.ang), m = A.capAimant * dt;
      c.ang = angle(c.ang + Math.max(-m, Math.min(m, e2)));
      if (Math.abs(e2) <= m) { c.ang = angle(P._aimant); P._aimant = null; }
    }
    if (P._aimant === null && T.mural && !P._plaqueEssaye) { P._plaqueEssaye = true; c.plaquer(partie.game.collisions); }
  }
  if (P) {
    if (!P.verrou) P._plaqueEssaye = false;
    P.cap = c.ang; P.vitesseAff = c.speedNow; P.rotAff = Math.abs(angle(c.ang - ang0)) / Math.max(1e-6, dt);
  }
  // LE FROTTEMENT (un indice : 7 m) — jamais en marchant
  if (c.speedNow > A.frottement.vitesse && !marche) {
    acteur._frotD = (acteur._frotD || 0) + d;
    if (acteur._frotD >= A.frottement.pas) { acteur._frotD -= A.frottement.pas; partie.evt('frottement', { a: acteur.id, x: c.pos.x, y: c.pos.y, z: c.pos.z }); }
  }
}
// la pièce d'un corps (pour l'aimant) : la carte vivante sait la dire
function zoneDe(partie, c) {
  const Lu = partie.game && partie.game.carte && partie.game.carte.lumieres;
  const Z = Lu && Lu.zoneEn ? Lu.zoneEn(c.pos.x, c.pos.z, c.pos.y + 0.1) : null;
  return Z ? Z.id : null;
}
