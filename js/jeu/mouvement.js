// =====================================================================
//  LE MOUVEMENT DES ACTEURS — lot L-B (23/10), sur le squelette du socle S0 (22/10)
// =====================================================================
// La commande appliquée au corps, à 120 Hz, dans le pas de la partie (spec §§ 3.1, 4.5.7, étape 3 de § 4.3.2) : le cap posé
// par le lacet (setFacing, `capFixe` : Player ne se tourne plus vers sa course), l'axe tourné du lacet, les ALLURES ramenées
// aux mêmes vitesses pour TOUTES les fiches (5,00 m/s de course, 6,60 de sprint, 7,80 de sprint tactique : `speedMul` et
// `sprintMul` du Player, × la mobilité de l'arme en main), l'endurance tenue à 100 (pas de « mains sur les genoux » ; celle des
// chasseurs du prop hunt est un compteur à elle, `acteur.endurance`), puis `joueur.simuler(dt)` (saut, minuteries — jamais la
// pose). Les gestes du ressenti Call of Duty, tous sans un seul nouveau code de collision (C.deplacer, C.libre) :
//   - le SPRINT TACTIQUE (double Maj, SOURIS 5, L3 double : la commande porte le front `sprintTact`), sa jauge (3 s, 4,5 s au
//     PM-9 et au P-17 ; pleine en 4 s, utilisable dès 1,2 s) ;
//   - la GLISSADE (accroupi pressé après 0,25 s de sprint à 6 m/s ou plus) : `v(t) = v0 (1 − t/0,75)^0,6`, direction figée, la
//     vitesse POSÉE à chaque pas (l'inertie de Player ne la retarde pas : 3,47 m depuis 6,6 m/s, au centimètre) ;
//   - le SAUT borné au décollage (la tête à 8 cm du plafond) ET EN VOL : le plafond, puis la TRANCHE DE TÊTE (1,35-1,78 m) contre
//     les linteaux et les boîtes hautes, le corps qui ne heurte qu'à 1,35 m en l'air (`hautCorps` : pas de mur invisible
//     devant une porte) ; la gravité intégrée EXACTEMENT (la parabole, pas le schéma d'Euler de Player.simuler, qui perdait
//     1,3 cm d'apogée) ; l'élan gardé en l'air (`elanAir`, τ 0,45 s) ; le corps qui redescend sur un meuble bas qu'il a
//     survolé s'y POSE et en glisse (il en était sorti d'un bond, parfois à travers un mur) ; la RÉCEPTION d'une chute de plus
//     de 0,3 m ;
//   - le FRANCHISSEMENT scripté (Espace face à un obstacle bas, ou sprint contre lui 0,15 s) par `franchissable`, la fonction du
//     socle telle quelle — la même que la génération des liens « franchir » du graphe (L-D) : un bot ne planifie jamais un
//     franchissement que le mouvement refuserait ;
//   - l'ACCROUPI (courbe douce, 0,16 s pour descendre, 0,18 pour se relever ; relever refusé sous un plafond à moins de 1,85 m) ;
//   - les PAS (événements de la simulation : les sons et l'ouïe des bots les lisent, même d'un bot caché ou posé à 4 Hz) ;
//   - l'ŒIL LISSÉ de l'acteur local (escaliers, bordures) : la moyenne du sol sous une FENÊTRE carrée de 2 m autour des
//     pieds — une volée ne fait plus de cassure à son pied ni à son palier (la dérivée seconde de l'œil reste sous 1 cm par
//     image à 60 im/s, critère 8), et au milieu d'une volée l'œil suit la pente exacte ; c'est l'œil de la caméra ET celui d'où
//     partent les balles (hauteurOeil le porte : acteur.oeil()).
// `separer` (les contacts entre corps) passe par le monde solide ; `franchissable` est ÉCRITE EN ENTIER par le socle (L-B et
// L-D l'appellent ; personne ne la change sans F2). PURETÉ (spec § 4.1 règle 4) : ni hasard, ni horloge du navigateur, ni
// entrées — le temps est `partie.t`, les entrées la commande.
// CE QUE CE MODULE ÉCRIT SUR L'ACTEUR (lu par l'arsenal, l'arme de vue, la vue) : `accroupi`, `glisse`, `jaugeTact`,
// `endurance` (état, § 4.7) ; `allure` ('arret' | 'marche' | 'course' | 'sprint' | 'tact' | 'accroupi' | 'glisse' | 'air' |
// 'franchit'), `franchit` (le franchissement en cours ou null) et `sprintTactique` (lus par l'arsenal, L-A), et `mvt` (son état de mouvement : `sprintFinT` — l'heure de la fin du dernier sprint, pour le délai sprint → tir
// de l'arsenal —, `franchit` — le franchissement en cours, `k` de 0 à 1 —, `viseeBloquee`, l'œil lissé `yOeil` / `yOeilPrec` et son écart aux pieds `decalOeil`).
import * as THREE from 'three';
import { OEIL } from './constantes.js';
import { G } from '../config.js';

// ---- LES VALEURS (spec § 3.1, telles quelles) ----
export const ALLURES = { marche: 2.15, course: 5.0, sprint: 6.6, sprintTact: 7.8, visee: 2.4, accroupi: 2.3, accroupiVisee: 1.5 };
// la vitesse EN VISÉE de chaque arme (§ 3.1 : « Visée 2,40 · PM-9 2,90 · P-17 3,10 · FP-12 2,50 · TP-50 1,60 ») ; les autres
// allures sont × la mobilité de l'arme en main (P-17 1,08 · PM-9 1,06 · FA-24 1,00 · FP-12 1,00 · TP-50 0,92 · couteau 1,10)
export const VISEE_PAR_ARME = { fa24: 2.4, pm9: 2.9, p17: 3.1, fp12: 2.5, tp50: 1.6 };
export const MOBILITE_COUTEAU = 1.1;
export const SPRINT_TACT = { duree: 3.0, dureeLongue: 4.5, longues: ['pm9', 'p17'], plein: 4.0, utilisable: 1.2, armement: 0.25 };
export const ENDURANCE = { max: 100, perte: 25, gain: 15, reprise: 20 };          // le sprint limité des chasseurs (§ 3.9)
export const SURSAUT = { facteur: 0.7, duree: 0.3 };                                // la touche reçue (§ 3.6 ; F2)
export const GLISSADE = { sprintMin: 0.25, vMin: 6.0, gain: 1.12, plancher: 6.6, plafond: 8.8, duree: 0.75, expo: 0.6, recharge: 0.9,
  viseeApres: 0.35, penteMax: 0.4, saut: 0.85, descente: 0.12, remontee: 0.2 };
export const ACCROUPI = { descente: 0.16, remontee: 0.18, plafond: 1.85 };
export const SAUT = { v: 3.15, vMin: 1.2, marge: 0.08, teteVol: 0.05, tete: 1.73, hautTete: 1.78, basTete: 1.35, pasTete: 0.02, viseeApres: 0.1, hautCorpsAir: 1.35,
  glisseMeuble: 3.0, dichotomie: 0.001 };                                        // (le corps posé sur un meuble : étape 9, (3))
export const RECEPTION = { chute: 0.3, facteur: 0.85, duree: 0.12 };
export const FRANCHIR = { duree: 0.45, dureeBas: 0.38, bas: 0.7, arc: 0.35, sortie: 0.7, contre: 0.15, essai: 0.1 };
export const PAS_ACTEUR = { course: 0.7, marche: 0.45, accroupiMin: 1.3 };
export const CONTACTS = { pousseeMax: 0.05, ecartVertical: 1.2 };
// l'œil lissé : la fenêtre (m) — une moyenne glissante de 1,6 m passée dans une de 0,4 m (un trapèze : 2 m en tout, plein sur
// 1,2 m), échantillonnée tous les 4 cm —, la pente au plus d'une volée (elles font 0,48 à 0,77), le saut de sol admis
// d'un échantillon au suivant (une bordure fait 0,12 ; un bord de palier sur une volée, ≈ 0,1), l'écart au sol au-delà duquel on
// le lâche
export const OEIL_LISSE = { longueur: 1.6, rampe: 0.4, pas: 0.04, pente: 0.8, saut: 0.13, ecartMax: 0.6 };

const _dir = new THREE.Vector3();
// la vitesse de base d'une fiche (js/player.js move : 3,1 + spd/100 × 2,4 ; Haythem 5,476)
const vBase = (p) => 3.1 + ((p.def && p.def.spd) ?? 99) / 100 * 2.4;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lisse = (x) => x * x * (3 - 2 * x);
// l'inverse de la courbe douce (3x² − 2x³) : la PHASE d'une transition dont on ne garde que la valeur (l'état n'a qu'elle)
const phaseDe = (k) => (k <= 0 ? 0 : k >= 1 ? 1 : 0.5 - Math.sin(Math.asin(1 - 2 * k) / 3));
// une transition douce de 0 à 1 (ou de 1 à 0) : sa phase avance linéairement, sa valeur suit la courbe douce
function versDoux(k, monte, tMonte, tDescend, dt) {
  const ph = clamp(phaseDe(k) + (monte ? dt / tMonte : -dt / tDescend), 0, 1);
  return lisse(ph);
}

// l'état de mouvement d'un acteur (ce que l'état sérialisable ne porte pas : rien qui décide d'une règle — le sprint tactique
// en cours, l'épuisement, la glissade, le franchissement, les minuteries de visée et de réception, l'œil lissé)
// (exportée — F2 : Acteur.appliquer y rend le sprint tactique en cours et l'épuisement, champs `tA` et `ep` de l'état § 4.7)
export function etatMvt(a) {
  let M = a.mvt;
  if (!M) {
    M = a.mvt = { tact: false, tactArme: -Infinity, epuise: false, sprintT: 0, sprintFinT: -Infinity, sprinte: false, glisse: null, glisseFin: -Infinity,
      accAvant: false, viseeBloquee: false, viseeLibreT: -Infinity, receptionFin: -Infinity, hautVol: 0, sprintAir: false,
      franchit: null, contreT: 0, essaiT: -Infinity, pasD: 0, yOeil: NaN, yOeilPrec: NaN, tickOeil: -1, decalOeil: 0,
      mortT: a.mortT, px: a.corps ? a.corps.pos.x : 0, pz: a.corps ? a.corps.pos.z : 0 };
  }
  return M;
}

// la pente du sol sous (x, z) à la hauteur y : 0 sur une dalle, |Δh / Δa| sur une rampe (le sol que solEn y choisirait)
export function penteEn(C, x, z, y) {
  if (!C || !C.sols) return 0;
  let h = null, p = 0;
  for (const r of C.sols) {
    if (x < r.x0 || x > r.x1 || z < r.z0 || z > r.z1) continue;
    const v = C._hSol(r, x, z);
    if (v <= y + 0.45 && (h === null || v > h)) { h = v; p = r.axe ? Math.abs((r.h1 - r.h0) / (r.a1 - r.a0)) : 0; }
  }
  return p;
}
// la mobilité de l'arme en main (§ 3.1) : 1 sans arsenal
export function mobilite(acteur) {
  const A = acteur.arsenal, f = A && A.arme;
  if (!f) return 1;
  if (f.id === 'couteau') return MOBILITE_COUTEAU;
  return f.mobilite || 1;
}
// la durée d'une jauge pleine de sprint tactique pour l'arme en main
const dureeTact = (acteur) => { const f = acteur.arsenal && acteur.arsenal.arme; return f && SPRINT_TACT.longues.includes(f.id) ? SPRINT_TACT.dureeLongue : SPRINT_TACT.duree; };

// =====================================================================
//  appliquerCommande — l'étape 3 du pas, pour un acteur humain (un Player : Haythem ou un bot)
// =====================================================================
export function appliquerCommande(acteur, cmd, dt, partie) {
  const p = acteur.joueur;
  if (!p || acteur.corps !== p) return;
  const M = etatMvt(acteur), t = partie.t, C = partie.game && partie.game.collisions;
  const s = (p.h || OEIL.taille) / OEIL.taille;
  const x0 = p.pos.x, y0 = p.pos.y, z0 = p.pos.z;
  // (une mort, une réapparition, une téléportation : la glissade, le franchissement, le sprint tactique et l'œil repartent ; on
  // réapparaît la jauge du sprint tactique et l'endurance pleines, comme dans Call of Duty)
  if (M.mortT !== acteur.mortT || Math.hypot(x0 - M.px, z0 - M.pz) > 1) {
    if (M.mortT !== acteur.mortT) { acteur.jaugeTact = 1; acteur.endurance = ENDURANCE.max; M.epuise = false; }
    M.mortT = acteur.mortT; M.glisse = null; M.franchit = null; M.tact = false; M.sprintT = 0; M.sprinte = false; M.contreT = 0;
    M.receptionFin = -Infinity; M.viseeLibreT = -Infinity; M.hautVol = 0; M.tickOeil = -1;
  }
  // le cap : celui de la visée (les bots courent en pas chassés quand ils visent ailleurs)
  p.setFacing(-Math.sin(cmd.lacet), -Math.cos(cmd.lacet));
  p.stamina = 100; p.staminaMul = 0;
  // ---- 1. UN FRANCHISSEMENT EN COURS : le corps suit son arc, rien d'autre ----
  if (M.franchit) {
    franchir(acteur, p, M, cmd, t, dt, partie);
    p.simuler(dt);
    finPas(acteur, p, M, C, t, x0, z0, dt, partie, false);
    return;
  }
  // ---- 2. L'AXE, relatif au lacet (x à droite, y en avant) ----
  const l = cmd.lacet, ax = cmd.ax || 0, ay = cmd.ay || 0, na = Math.hypot(ax, ay);
  _dir.set(0, 0, 0);
  if (na > 1e-6) {
    _dir.set(-Math.sin(l) * ay + Math.cos(l) * ax, 0, -Math.cos(l) * ay - Math.sin(l) * ax);
    const n = _dir.length(); if (n > 1e-6) _dir.multiplyScalar(1 / n);
  }
  const bouge = na > 0.02, avant = bouge && ay / na > 0.5;            // (vers l'avant : à moins de 60° du regard)
  const vit = Math.hypot(p.vel.x, p.vel.z), enAir = p.airborne;
  // (la part de visée de l'arsenal ; une arme sans temps d'ADS — le couteau — n'en a pas)
  const A = acteur.arsenal, vA = A ? A.visee : cmd.visee ? 1 : 0, vk = Number.isFinite(vA) ? clamp(vA, 0, 1) : 0;
  // ---- 3. L'ACCROUPI, ses refus, et la GLISSADE ----
  const accFront = !!cmd.accroupi && !M.accAvant;
  M.accAvant = !!cmd.accroupi;
  const plafond = C ? C.plafondEn(p.pos.x, p.pos.z, p.pos.y) : Infinity;
  const peutSeLever = plafond >= p.pos.y + ACCROUPI.plafond * s;
  if (M.glisse) {
    // (annulée en se relevant — l'accroupi lâché en mode maintenu, ou rebasculé —, ou par une pente raide)
    const u = (t - M.glisse.t0) / GLISSADE.duree;
    if (u >= 1 || (!cmd.accroupi && peutSeLever) || (C && penteEn(C, p.pos.x, p.pos.z, p.pos.y) > GLISSADE.penteMax) || enAir) finirGlissade(acteur, M, t, partie);
  } else if (accFront && !enAir && M.sprinte && M.sprintT >= GLISSADE.sprintMin && vit >= GLISSADE.vMin && t - M.glisseFin >= GLISSADE.recharge
    && !(C && penteEn(C, p.pos.x, p.pos.z, p.pos.y) > GLISSADE.penteMax)) {
    const v0 = Math.min(GLISSADE.plafond, Math.max(vit, GLISSADE.plancher) * GLISSADE.gain);
    M.glisse = { t0: t, v0, dx: p.vel.x / vit, dz: p.vel.z / vit, d: 0 };
    M.viseeLibreT = Math.max(M.viseeLibreT, t + GLISSADE.viseeApres);
    M.tact = false;
    partie.evt('glissade', { a: acteur.id, debut: true, v: v0 });
  }
  acteur.glisse = versDoux(acteur.glisse || 0, !!M.glisse, GLISSADE.descente, GLISSADE.remontee, dt);
  const veutAcc = !!cmd.accroupi;
  if (veutAcc || (acteur.accroupi > 0 && !peutSeLever)) {
    if (veutAcc) acteur.accroupi = versDoux(acteur.accroupi || 0, true, ACCROUPI.descente, ACCROUPI.remontee, dt);
  } else acteur.accroupi = versDoux(acteur.accroupi || 0, false, ACCROUPI.descente, ACCROUPI.remontee, dt);
  const k = acteur.accroupi;
  // ---- 4. LE SPRINT : celui de la commande, s'il est possible (debout, vers l'avant, ni visée ni tir) ----
  // (F2, demande de L-A (e) : le front `recharger` coupe le sprint du corps quand une recharge peut partir — l'arme baissée du
  // sprint la perdait — ; coupé tant que la recharge dure, sprint tenu ou verrouillé ; relâcher puis reprendre le sprint
  // l'annule, comme dans Call of Duty)
  if (cmd.recharger && A && A.peutRecharger && A.peutRecharger()) M.sprintCoupe = true;
  if (M.sprintCoupe && (!cmd.sprint || !(cmd.recharger || (A && A.et === 'recharge')))) M.sprintCoupe = false;
  let sprint = !!cmd.sprint && avant && !cmd.visee && !cmd.tir && k < 0.3 && !M.glisse && !M.sprintCoupe;
  if (acteur.sprintLimite) {
    // (les chasseurs du prop hunt : sprint à ENDURANCE, −25/s, +15/s ; à 0, plus de sprint avant 20 ; jamais tactique)
    if (acteur.endurance <= 0) M.epuise = true;
    if (M.epuise && acteur.endurance >= ENDURANCE.reprise) M.epuise = false;
    if (M.epuise) sprint = false;
    M.tact = false;
  }
  if (enAir) sprint = sprint && M.sprintAir;                           // (on ne se met pas à sprinter en l'air)
  // le sprint tactique : armé par le front (0,25 s), lancé dès que le sprint court, tant que la jauge tient
  if (cmd.sprintTact && !acteur.sprintLimite) M.tactArme = t;
  if (!M.tact && sprint && !acteur.sprintLimite && t - M.tactArme <= SPRINT_TACT.armement && acteur.jaugeTact >= SPRINT_TACT.utilisable / SPRINT_TACT.plein - 1e-9) {
    M.tact = true; M.tactArme = -Infinity;
  }
  if (M.tact && (!sprint || acteur.jaugeTact <= 0)) M.tact = false;
  if (M.tact) acteur.jaugeTact = Math.max(0, acteur.jaugeTact - dt / dureeTact(acteur));
  else acteur.jaugeTact = Math.min(1, acteur.jaugeTact + dt / SPRINT_TACT.plein);
  if (acteur.sprintLimite) acteur.endurance = clamp(acteur.endurance + (sprint && bouge ? -ENDURANCE.perte : ENDURANCE.gain) * dt, 0, ENDURANCE.max);
  if (sprint) M.sprintT += dt; else { if (M.sprinte) M.sprintFinT = t; M.sprintT = 0; }
  M.sprinte = sprint;
  // ---- 5. LES ALLURES (toutes les fiches ramenées aux mêmes vitesses) ----
  const mob = mobilite(acteur), f = A && A.arme;
  const vVisee = f && VISEE_PAR_ARME[f.id] !== undefined ? VISEE_PAR_ARME[f.id] : ALLURES.visee * mob;
  const vDebout = ALLURES.course * mob + (vVisee - ALLURES.course * mob) * vk;
  const vAcc = (ALLURES.accroupi + (ALLURES.accroupiVisee - ALLURES.accroupi) * vk) * mob;
  let v = vDebout + (vAcc - vDebout) * k;
  if (t < M.receptionFin) v *= RECEPTION.facteur;
  // (F2, demande de L-C — § 3.6, le sursaut d'une touche reçue : la vitesse × 0,7 pendant 0,3 s ; L-C n'en fait que l'affichage)
  const dT = acteur.derniereTouche; if (dT && t - dT.t >= 0 && t - dT.t < SURSAUT.duree) v *= SURSAUT.facteur;
  const vb = vBase(p);
  p.marche = !!cmd.marche && !sprint;
  p.sprintMul = (M.tact ? ALLURES.sprintTact : ALLURES.sprint) / ALLURES.course;
  p.speedMul = v / vb;
  // ---- 6. LE DÉPLACEMENT (la glissade : sa vitesse posée, sa direction figée) ----
  p.hautCorps = enAir ? SAUT.hautCorpsAir * s : undefined;
  if (M.glisse) {
    const G0 = M.glisse, um = Math.min(1, (t - G0.t0 + dt / 2) / GLISSADE.duree);
    const vg = G0.v0 * Math.pow(Math.max(0, 1 - um), GLISSADE.expo);
    p.vel.set(G0.dx * vg, 0, G0.dz * vg);
    // (sans le drapeau de sprint de Player : on tire en glissade, l'arsenal lit `sprinting`)
    p.speedMul = vg / vb; p.marche = false;
    _dir.set(G0.dx, 0, G0.dz);
    p.move(_dir, false, dt);
  } else p.move(_dir, sprint, dt);
  // (contre un obstacle, en sprint vers l'avant : le franchissement d'office après 0,15 s)
  const d = Math.hypot(p.pos.x - x0, p.pos.z - z0);
  if (!enAir && !M.glisse && sprint && avant && d < 0.5 * Math.max(vit, 1) * dt) M.contreT += dt; else { M.contreT = 0; M.vLibre = Math.hypot(p.vel.x, p.vel.z); }
  // ---- 7. LE SAUT, ou le FRANCHISSEMENT (Espace face à un obstacle bas ; sprint contre lui) ----
  const veutSaut = !!cmd.saut && !enAir && !acteur.gele;
  if ((veutSaut || M.contreT >= FRANCHIR.contre) && C && t - M.essaiT >= (veutSaut ? 0 : FRANCHIR.essai)) {
    M.essaiT = t;
    const fx = bouge ? _dir.x : -Math.sin(l), fz = bouge ? _dir.z : -Math.cos(l);
    const r = franchissable(C, p.pos.x, p.pos.y, p.pos.z, fx, fz);
    if (r) { commencerFranchir(acteur, p, M, r, fx, fz, t, partie); p.simuler(dt); finPas(acteur, p, M, C, t, x0, z0, dt, partie, false); return; }
  }
  if (veutSaut && (k < 0.5 || M.glisse)) {
    // (sauter d'une glissade : 85 % de sa vitesse gardés, dans l'élan de l'air)
    if (M.glisse) { p.vel.x *= GLISSADE.saut; p.vel.z *= GLISSADE.saut; finirGlissade(acteur, M, t, partie); }
    const vs = vitesseSaut(acteur);
    if (vs > 0) {
      p.jump(vs);
      M.sprintAir = sprint; M.hautVol = 0;
      M.viseeLibreT = Math.max(M.viseeLibreT, t + SAUT.viseeApres);
      partie.evt('saut', { a: acteur.id, f: vs / SAUT.v });
    }
  }
  // ---- 8. LA GRAVITÉ, EXACTE : Player.simuler intègre `jumpVel −= g·dt ; jumpY += jumpVel·dt` ; la parabole veut
  //         `jumpY += jumpVel·dt − g·dt²/2` — on lui rend g·dt²/2 d'avance (apogée 0,5057 m, et non 0,4926) ----
  const enAirAvant = p.airborne, jy0 = p.jumpY;
  if (enAirAvant) p.jumpY += 0.5 * G * dt * dt;
  p.simuler(dt);
  // ---- 9. LE SAUT BORNÉ EN VOL : le plafond, puis la tranche de tête contre les linteaux, puis le corps sur un meuble ----
  if (C && (p.airborne || enAirAvant)) {
    const pieds = p.pos.y, h = SAUT.tete * s, r = p.rayon ?? 0.3;
    if (p.airborne) {
      const plaf = C.plafondEn(p.pos.x, p.pos.z, pieds);
      if (pieds + p.jumpY + h + SAUT.teteVol > plaf) { p.jumpY = Math.max(0, plaf - pieds - h - SAUT.teteVol); p.jumpVel = Math.min(0, p.jumpVel); }
      let n = 0, cogne = false;
      while (p.jumpY > 0 && n++ < 80 && !C.libre(p.pos.x, p.pos.z, r, pieds + p.jumpY, SAUT.hautTete * s, SAUT.basTete * s)) { p.jumpY = Math.max(0, p.jumpY - SAUT.pasTete); cogne = true; }
      if (cogne) p.jumpVel = Math.min(0, p.jumpVel);
    }
    // (3) le corps qui redescend sur une forme BASSE qu'il survolait (une chaise, un banc, une table : leur dessus n'est pas
    //     un sol, solEn ne le connaît pas) s'y POSE au lieu d'y entrer — sinon C.deplacer, au pas suivant, l'en sortait d'un
    //     coup par la face la plus proche : jusqu'à 1 m en un pas, et DE L'AUTRE CÔTÉ du mur contre lequel le meuble est posé
    //     (23/10, relecture : 60 « bonds » sur 1 461 sauts au sprint, 7 à travers un mur)
    if (chevauche(C, p.pos.x, p.pos.z, r, pieds + p.jumpY, SAUT.hautCorpsAir * s)) surMeuble(p, C, s, r, jy0, x0, y0, z0, dt);
    M.hautVol = Math.max(M.hautVol, p.jumpY);
  }
  // ---- 10. LA RÉCEPTION ----
  if (enAirAvant && !p.airborne) {
    p.hautCorps = undefined;
    const chute = M.hautVol;
    if (chute > RECEPTION.chute) { M.receptionFin = t + RECEPTION.duree; p.vel.x *= RECEPTION.facteur; p.vel.z *= RECEPTION.facteur; }
    partie.evt('reception', { a: acteur.id, f: Math.min(1, Math.abs(p.jumpVelSol || 0) / 6), chute });
    M.hautVol = 0;
  }
  finPas(acteur, p, M, C, t, x0, z0, dt, partie, sprint);
}

// LE CORPS POSÉ SUR UN MEUBLE (étape 9, (3)) : la plus basse hauteur de saut où le corps en l'air est libre, entre celle où la
// gravité l'amenait et celle du déplacement de ce pas (dichotomie, 1 mm), sans vitesse verticale — le corps tient sur le dessus
// du meuble, en l'air pour Player (le saut et la glissade attendent qu'il en descende) ; et il en GLISSE, à 3 m/s au plus, vers
// la sortie la plus proche (une des 8 directions : le premier point à 1,25 m au plus où le corps redescend libre, et qu'on
// atteint par C.deplacer à la hauteur tenue — jamais à travers un mur, jamais vers le mur contre lequel le meuble est posé).
// Coincé entre le meuble et un linteau (aucune hauteur libre pour la tête) : le pas est annulé, comme contre un mur (si le
// départ du pas est libre).
const _q = { x: 0, z: 0 }, SORTIES = [0.15, 0.3, 0.45, 0.6, 0.8, 1.0, 1.25];
function surMeuble(p, C, s, r, jy0, x0, y0, z0, dt) {
  const pieds = p.pos.y, hc = SAUT.hautCorpsAir * s, bas = p.jumpY;
  const libre = (j) => !chevauche(C, p.pos.x, p.pos.z, r, pieds + j, hc);
  const tete = (j) => pieds + j + SAUT.tete * s + SAUT.teteVol <= C.plafondEn(p.pos.x, p.pos.z, pieds)
    && C.libre(p.pos.x, p.pos.z, r, pieds + j, SAUT.hautTete * s, SAUT.basTete * s);
  if (jy0 > bas && libre(jy0) && tete(jy0)) {
    let lo = bas, hi = jy0;
    while (hi - lo > SAUT.dichotomie) { const m = (lo + hi) / 2; if (libre(m)) hi = m; else lo = m; }
    p.jumpY = hi; p.jumpVel = 0; p.airborne = true;
    // la sortie la plus proche (les 8 directions, de l'est dans le sens trigonométrique : déterministe)
    let bd = Infinity, bx = 0, bz = 0;
    for (let k = 0; k < 8; k++) {
      const ux = Math.cos(k * Math.PI / 4), uz = Math.sin(k * Math.PI / 4);
      for (const d of SORTIES) {
        if (d >= bd) break;
        if (chevauche(C, p.pos.x + ux * d, p.pos.z + uz * d, r, pieds + bas, hc)) continue;
        _q.x = p.pos.x; _q.z = p.pos.z; C.deplacer(_q, ux * d, uz * d, r, null, pieds + hi, hc);
        if ((_q.x - p.pos.x) * ux + (_q.z - p.pos.z) * uz >= d - 0.02) { bd = d; bx = ux; bz = uz; }
        break;
      }
    }
    if (bd < Infinity) {
      const L = Math.min(bd, SAUT.glisseMeuble * dt);
      C.deplacer(p.pos, bx * L, bz * L, r, null, pieds + hi, hc);
      p.pos.y = C.solEn(p.pos.x, p.pos.z, p.pos.y);
    }
  } else if (!chevauche(C, x0, z0, r, y0 + jy0, hc)) {
    p.pos.set(x0, y0, z0); p.vel.x = 0; p.vel.z = 0;
    p.jumpY = jy0; p.jumpVel = 0; p.airborne = jy0 > 0;
  }
  // (sinon — une forme haute qui l'a rejoint, un vantail qui se referme — rien ici : C.deplacer l'en sort comme au sol)
}
// le disque (x, z, r) chevauche-t-il une forme du joueur dans la bande [pieds + bas, pieds + haut] ? Lu forme par forme
// (Collisions._parcourir / _sortir sur une copie), et non par C.libre, qu'un meuble collé à un mur trompe : le disque dont le
// centre est entré dans la table est poussé par sa face la plus proche DANS le mur, puis ressorti du mur au même point — il
// paraît libre, au milieu de la table (demande à F2 / INT pour js/collisions.js). (1 mm de marge : un corps posé contre un mur
// le touche à r près.) Aucune autre requête au monde solide dans le rappel (§ 4.1 règle 8).
const _t = { x: 0, z: 0 }, BAS_CORPS = 0.25;                                     // (js/collisions.js BAS_CORPS)
function chevauche(C, x, z, r, pieds, haut, bas = BAS_CORPS) {
  const yb = pieds + bas, yh = pieds + haut, rr = r - 1e-3;
  let oui = false;
  C._parcourir(x - r, z - r, x + r, z + r, (f) => {
    if (oui || f.off || !f.joueur || f.y0 >= yh || f.y1 <= yb) return;
    _t.x = x; _t.z = z;
    if (C._sortir(f, _t, rr)) oui = true;
  });
  return oui;
}

// la fin de chaque pas : la visée bloquée (glissade, décollage, franchissement), l'allure, les pas, l'œil lissé
function finPas(acteur, p, M, C, t, x0, z0, dt, partie, sprint) {
  const cmd = acteur.cmd;
  M.px = p.pos.x; M.pz = p.pos.z;
  M.viseeBloquee = t < M.viseeLibreT || !!M.franchit;
  // (la commande est l'intention : la visée et le tir qu'elle ne peut pas avoir à ce pas sont retirés pour l'arsenal, qui
  // vient après — étape 6 ; un cerveau ou lireCommande la réécrivent au pas suivant)
  if (M.viseeBloquee) cmd.visee = false;
  if (M.franchit) cmd.tir = false;
  const d = Math.hypot(p.pos.x - x0, p.pos.z - z0), vit = d / dt;
  acteur.allure = M.franchit ? 'franchit' : M.glisse ? 'glisse' : p.airborne ? 'air' : vit < 0.3 ? 'arret' : sprint ? (M.tact ? 'tact' : 'sprint')
    : acteur.accroupi > 0.5 ? 'accroupi' : p.marche || vit < 2.3 ? 'marche' : 'course';
  // (les deux drapeaux que lit l'arsenal de L-A : le franchissement en cours — rien en main —, le sprint tactique — sa sortie
  // coûte `sprintTactTir`)
  acteur.franchit = M.franchit || null;
  acteur.sprintTactique = !!(sprint && M.tact);
  // LES PAS (tous les 0,7 m en course, 0,45 m en marche ; rien accroupi sous 1,3 m/s, rien en glissade, en l'air, en franchissant)
  const marcheA = acteur.allure === 'marche', accA = acteur.allure === 'accroupi';
  if (!p.airborne && !M.glisse && !M.franchit && vit > (accA ? PAS_ACTEUR.accroupiMin : 0.3)) {
    M.pasD += d;
    const pas = marcheA ? PAS_ACTEUR.marche : PAS_ACTEUR.course;
    if (M.pasD >= pas) {
      M.pasD -= pas;
      const allure = sprint ? 'sprint' : marcheA ? 'marche' : accA ? 'accroupi' : 'course';
      // (le pied posé là où la distance est atteinte, dans le pas : à 6,6 m/s un pas de simulation fait 5,5 cm, 8 % de 0,7)
      const k = d > 1e-9 ? Math.min(1, M.pasD / d) : 0;
      partie.evt('pas', { a: acteur.id, x: p.pos.x - (p.pos.x - x0) * k, y: p.pos.y, z: p.pos.z - (p.pos.z - z0) * k, f: Math.min(1, vit / ALLURES.sprint), allure, tact: !!M.tact });
    }
  } else if (vit < 0.3) M.pasD = PAS_ACTEUR.course / 2;                  // (le premier pas vient vite au départ)
  // L'ŒIL LISSÉ (l'acteur local : sa caméra ET l'origine de ses tirs) — l'écart du sol lissé aux pieds, `decalOeil`, entre dans
  // hauteurOeil, donc dans acteur.oeil(), d'où partent ses balles : la caméra et le canon voient du même point (23/10, relecture :
  // l'œil lissé de la caméra seule était jusqu'à 15 cm sous l'œil du tir en haut d'une volée — la tête visée au réticule, la
  // balle 15 cm au-dessus) ; la valeur d'avant gardée pour l'interpolation de l'image
  if (acteur.local && C) {
    // (en franchissant, les pieds sont soulevés : le sol lissé est celui d'en dessous, soulevé d'autant)
    const lev = M.franchit ? M.franchit.leve : 0;
    const sol = solLisse(C, p.pos.x, p.pos.y - lev, p.pos.z) + lev;
    M.decalOeil = Math.abs(sol - p.pos.y) > OEIL_LISSE.ecartMax ? 0 : sol - p.pos.y;
    const prec = M.tickOeil === partie.tick - 1 && Number.isFinite(M.yOeil) ? M.yOeil : NaN;
    M.tickOeil = partie.tick;
    const y = p.pos.y + hauteurOeil(acteur) + (p.jumpY || 0);
    M.yOeilPrec = Number.isFinite(prec) ? prec : y;
    M.yOeil = y;
  }
}

// le sol MOYEN sous une fenêtre CARRÉE centrée sur les pieds, alignée sur les axes du monde (les volées, les dalles et les bordures
// de l'école le sont toutes), en TRAPÈZE : pleine sur 1,2 m, adoucie sur 0,4 m de chaque bord (2 m en tout — une moyenne glissante
// de 1,6 m passée dans une de 0,4 m). La moyenne d'un sol qui ne varie que le long de x (de z) se lit sur une ligne d'échantillons
// le long de x (de z) ; x-moyenne + z-moyenne − centre est la moyenne du carré pour tout sol g(x) + h(z). Un plan incliné reste
// lui-même (la moyenne d'une droite est la droite) : au milieu d'une volée, l'œil suit la pente exacte ; une cassure devient un
// arrondi (au sprint, 0,85 cm de dérivée seconde par image au plus, mesuré sur les 9 volées), un bord de palier ou une bordure une
// pente douce. La fenêtre ne dépend ni de la vitesse ni de la direction : rien ne saute au départ, à l'arrêt ou en tournant (en
// contrepartie, arrêté au bord d'une volée, l'œil est jusqu'à ≈ 15 cm sous sa hauteur : l'arrondi de la cassure). Près d'une
// volée, seule la ligne de son axe compte (sur une volée étroite, la ligne en travers sortirait par ses côtés). Le long d'une
// ligne, en partant des pieds, un échantillon n'est gardé que s'il CONTINUE le sol du précédent (0,8 m par mètre, plus un saut
// de 0,13 m) : au-delà d'un mur ou au bord d'une dalle, `solEn` rendrait le sol d'à côté, d'en dessous ou d'au-dessus — la ligne
// garde le dernier sol vu.
export function solLisse(C, x, y, z, longueur = OEIL_LISSE.longueur) {
  const L = longueur, R = OEIL_LISSE.rampe;
  if (!(L > 0.02)) return y;
  const H = (L + R) / 2, P = (L - R) / 2, pas = OEIL_LISSE.pas, n = Math.ceil(H / pas - 1e-9), k = OEIL_LISSE.pente * pas, sj = OEIL_LISSE.saut;
  // le poids d'un échantillon à la distance d (la fenêtre en trapèze : boîte de L ⊗ boîte de R)
  const poids = (d) => (d <= P ? 1 : d >= H ? 0 : (H - d) / R);
  // les lignes utiles : celles des axes des volées que la fenêtre touche, à la hauteur des pieds (sur une volée étroite, la
  // ligne en travers sortirait par ses côtés — la rampe, elle, ne varie pas en travers) ; loin de toute volée, les deux
  let lx = false, lz = false;
  for (const r of C.sols) {
    if (!r.axe || r.x1 < x - H || r.x0 > x + H || r.z1 < z - H || r.z0 > z + H) continue;
    if (Math.abs(C._hSol(r, Math.max(r.x0, Math.min(r.x1, x)), Math.max(r.z0, Math.min(r.z1, z))) - y) > 1) continue;
    if (r.axe === 'x') lx = true; else lz = true;
  }
  if (!lx && !lz) { lx = true; lz = true; }
  // chaque ligne : le centre et, de part et d'autre, les échantillons pondérés (un échantillon qui ne CONTINUE pas le sol du
  // précédent — mur, bord de dalle, volée empilée — arrête la ligne de ce côté : on y garde le dernier sol vu)
  let total = 0;
  for (const [actif, ux, uz] of [[lx, 1, 0], [lz, 0, 1]]) {
    if (!actif) continue;
    let somme = y, poidsTotal = 1;
    for (const sg of [1, -1]) {
      let vu = y, arret = false;
      for (let i = 1; i <= n; i++) {
        const d = i * pas, w = poids(d);
        if (w <= 0) break;
        if (!arret) {
          const f = C.solEn(x + ux * d * sg, z + uz * d * sg, vu + k, sj);
          // (`solEn` rend le sol 0 là où aucun sol ne couvre le point, même au-dessus de la borne : refusé aussi)
          if (f >= vu - k - sj && f <= vu + k + sj) vu = f; else arret = true;
        }
        somme += w * vu; poidsTotal += w;
      }
    }
    total += somme / poidsTotal - y;
  }
  // (x-moyenne + z-moyenne − centre : la moyenne du carré pour tout sol g(x) + h(z))
  return y + total;
}

// ---- la glissade finie : l'accroupi reprend la main ----
function finirGlissade(acteur, M, t, partie) {
  if (!M.glisse) return;
  M.glisse = null; M.glisseFin = t;
  partie.evt('glissade', { a: acteur.id, debut: false });
}

// ---- LE FRANCHISSEMENT : 0,45 s (0,38 sous 0,7 m), le corps soulevé au-dessus de l'obstacle, l'œil en arc de +0,35 m,
//      sortie à 70 % de la vitesse d'entrée ----
function commencerFranchir(acteur, p, M, r, fx, fz, t, partie) {
  // (la vitesse d'entrée : celle du corps, ou, contre l'obstacle — le franchissement d'office —, celle d'avant le contact)
  const v0 = Math.max(Math.hypot(p.vel.x, p.vel.z), M.contreT > 0 ? M.vLibre || 0 : 0), n = Math.hypot(fx, fz) || 1;
  if (M.glisse) finirGlissade(acteur, M, t, partie);
  M.franchit = { t0: t, duree: r.h < FRANCHIR.bas ? FRANCHIR.dureeBas : FRANCHIR.duree, x0: p.pos.x, y0: p.pos.y, z0: p.pos.z, x1: r.x, y1: r.y, z1: r.z,
    h: r.h, dx: fx / n, dz: fz / n, vSortie: FRANCHIR.sortie * v0, k: 0, leve: 0 };
  M.tact = false; M.contreT = 0;
  p.jumpY = 0; p.jumpVel = 0; p.airborne = false;
  acteur.accroupi = 0;
  partie.evt('saut', { a: acteur.id, f: 0.6, franchit: true, h: r.h });
}
// la levée du corps (au-dessus de l'obstacle pendant le milieu du geste) et l'arc de l'œil, à la phase u
const leveeDe = (F, u) => (F.h + 0.06) * lisse(clamp(u / 0.3, 0, 1)) * lisse(clamp((1 - u) / 0.28, 0, 1));
function franchir(acteur, p, M, cmd, t, dt, partie) {
  const F = M.franchit, u = Math.min(1, (t - F.t0) / F.duree);
  const e = 0.5 * u + 0.5 * lisse(u);                                   // (un départ franc, une arrivée posée)
  const xa = p.pos.x, za = p.pos.z;
  const leve = u >= 1 ? 0 : leveeDe(F, u);
  p.pos.set(F.x0 + (F.x1 - F.x0) * e, F.y0 + (F.y1 - F.y0) * e + leve, F.z0 + (F.z1 - F.z0) * e);
  F.k = u; F.leve = leve;
  p.vel.set((p.pos.x - xa) / dt, 0, (p.pos.z - za) / dt);
  p.speedNow = Math.hypot(p.vel.x, p.vel.z);
  p.jumpY = 0; p.jumpVel = 0; p.airborne = false;
  if (u >= 1) {
    p.pos.set(F.x1, F.y1, F.z1);
    p.vel.set(F.dx * F.vSortie, 0, F.dz * F.vSortie);
    M.franchit = null;
    partie.evt('reception', { a: acteur.id, f: 0.3, chute: 0, franchit: true });
  }
}

// la hauteur de l'œil au-dessus des pieds, sans le saut (× h / 1,73) : debout 1,62, accroupi 1,08, en glissade 0,85 (la glissade
// prend le pas sur l'accroupi) ; en franchissant, les pieds sont soulevés au-dessus de l'obstacle et l'œil ne fait qu'un arc
// de +0,35 m au-dessus de sa hauteur debout ; l'acteur local y ajoute l'écart de son sol lissé (finPas : volées, bordures),
// tant qu'il est frais (calculé à ce pas ou au précédent — un mort, une téléportation le perdent)
export function hauteurOeil(acteur) {
  const h = (acteur.joueur && acteur.joueur.h) || (acteur.fiche && acteur.fiche.height) || OEIL.taille;
  const k = acteur.accroupi || 0, g = acteur.glisse || 0;
  let o = OEIL.debout + (OEIL.accroupi - OEIL.debout) * k;
  o += (OEIL.glisse - o) * g;
  o *= h / OEIL.taille;
  const M = acteur.mvt, F = M && M.franchit;
  if (F) o += FRANCHIR.arc * Math.sin(Math.PI * F.k) - F.leve;
  if (M && M.decalOeil && acteur.partie && M.tickOeil >= acteur.partie.tick - 1) o += M.decalOeil;
  return o;
}

// la vitesse de saut possible (0 = pas de saut) : 3,15 m/s, réduite pour garder la tête à 8 cm sous le plafond, refusée
// sous 1,2 m/s ; jamais en l'air, en glissade lancée depuis moins d'un pas, en franchissant
export function vitesseSaut(acteur) {
  const c = acteur.corps;
  if (!c || c.airborne || (acteur.mvt && acteur.mvt.franchit)) return 0;
  const C = acteur.partie && acteur.partie.game && acteur.partie.game.collisions;
  const h = SAUT.tete * ((c.h || OEIL.taille) / OEIL.taille);
  let v = SAUT.v;
  if (C) {
    const marge = C.plafondEn(c.pos.x, c.pos.z, c.pos.y) - c.pos.y - h - SAUT.marge;
    if (Number.isFinite(marge)) v = marge > 0 ? Math.min(v, Math.sqrt(2 * G * marge)) : 0;
  }
  return v < SAUT.vMin ? 0 : v;
}

// LES CONTACTS ENTRE CORPS (§ 3.1) : deux corps de rayons ra et rb ne se recouvrent pas (séparation à ra + rb), poussée
// PAR LE MONDE SOLIDE (C.deplacer, la bande de chaque corps : une poussée directe traverserait une cloison de 15 cm), 0,05 m
// au plus par pas ; deux centres confondus s'écartent selon un angle déterministe tiré de leurs ids. Le partage : moitié
// moitié entre deux humains ou deux props ; entre un PROP et un humain, celui qui entre dans l'autre (on se cogne à un prop
// comme au vrai meuble : un chasseur qui bousculerait un meuble saurait ; et un prop ne bouscule pas un chasseur) ; une cible
// du stand ne se pousse pas ; et le corps poussé perd la vitesse qui rentrait dans l'autre (comme contre un mur : on s'arrête
// au contact au lieu de s'y enfoncer d'un pas de sprint à chaque pas).
const _p = { x: 0, z: 0 };
const genre = (a) => (a.corps.fixe ? 0 : a.corps !== a.joueur ? 1 : 2);   // 0 cible / corps fixe · 1 prop · 2 humain
export function separer(acteurs, collisions) {
  const C = collisions, n = acteurs.length;
  for (let i = 0; i < n; i++) {
    const a = acteurs[i], A = a.corps; if (!A) continue;
    for (let j = i + 1; j < n; j++) {
      const b = acteurs[j], B = b.corps; if (!B) continue;
      if (Math.abs(A.pos.y - B.pos.y) > CONTACTS.ecartVertical) continue;
      // (l'un par-dessus l'autre : un saut au-dessus d'une poubelle-prop ne la touche pas)
      const fa = A.pos.y + (A.jumpY || 0), fb = B.pos.y + (B.jumpY || 0);
      const ta = fa + (genre(a) === 1 ? Math.max(0.5, A.haut || 0.5) : 1.7), tb = fb + (genre(b) === 1 ? Math.max(0.5, B.haut || 0.5) : 1.7);
      if (fa > tb - 0.05 || fb > ta - 0.05) continue;
      const ra = A.rayon ?? 0.3, rb = B.rayon ?? 0.3, R = ra + rb;
      let dx = B.pos.x - A.pos.x, dz = B.pos.z - A.pos.z;
      const d2 = dx * dx + dz * dz;
      if (d2 >= R * R) continue;
      let d = Math.sqrt(d2);
      if (d < 1e-6) {
        const ang = 2 * Math.PI * ((0.618 * (a.id + 7 * b.id)) % 1);
        dx = Math.cos(ang); dz = Math.sin(ang); d = 0;
      } else { dx /= d; dz /= d; }
      const ga = genre(a), gb = genre(b);
      let wa = ga === 0 ? 0 : 1, wb = gb === 0 ? 0 : 1;
      if (wa && wb && ga !== gb) {
        // un prop contre un humain : celui qui ENTRE dans l'autre prend la correction, au prorata de sa vitesse entrante — un
        // humain s'arrête sur un prop comme sur le vrai meuble, un prop qui fonce sur un humain s'y arrête comme contre un mur
        // (23/10, relecture : le prop jamais poussé poussait l'humain à sa propre vitesse, jusqu'à 6 m/s) ; immobiles tous deux :
        // l'humain s'écarte
        const ea = A.vel ? Math.max(0, A.vel.x * dx + A.vel.z * dz) : 0, eb = B.vel ? Math.max(0, -(B.vel.x * dx + B.vel.z * dz)) : 0;
        if (ea + eb > 1e-6) { wa = ea; wb = eb; } else if (ga === 1) wa = 0; else wb = 0;
      }
      if (wa + wb === 0) continue;
      const pen = R - d;
      for (const [X, sgn, w] of [[A, -1, wa], [B, 1, wb]]) {
        if (!w) continue;
        const pousse = Math.min(CONTACTS.pousseeMax, pen * w / (wa + wb));
        _p.x = X.pos.x; _p.z = X.pos.z;
        // (la bande du corps, celle de son propre déplacement : hautCorps / basCorps d'un Player, haut / bas d'un CorpsProp)
        if (C) C.deplacer(_p, dx * pousse * sgn, dz * pousse * sgn, X.rayon ?? 0.3, null, X.pos.y + (X.jumpY || 0), X.hautCorps ?? X.haut, X.basCorps ?? X.bas);
        else { _p.x += dx * pousse * sgn; _p.z += dz * pousse * sgn; }
        X.pos.x = _p.x; X.pos.z = _p.z;
        // la vitesse qui rentrait dans l'autre corps
        if (X.vel) { const vn = (X.vel.x * dx + X.vel.z * dz) * sgn; if (vn < 0) { X.vel.x -= vn * dx * sgn; X.vel.z -= vn * dz * sgn; } }
      }
    }
  }
}

// LE FRANCHISSEMENT (§ 3.1) — une fonction PURE du monde solide : depuis les pieds (x, y, z), vers (dx, dz), l'obstacle
// bas qu'on enjambe et l'arrivée de l'autre côté, ou null. Lecture du texte de la spec (« sonde C.deplacer de 0,5 m
// bloquée à < 0,8 m, ligne rayonLibre à y1 + 0,25 libre sur 1,4 m, arrivée à 0,9-1,3 m au-delà avec C.libre et
// |solEn − pieds| < 0,3 ») :
//   1. la sonde : le disque du joueur (0,3 m) poussé de 0,5 m vers l'avant ; bloqué = il avance de moins de 0,48 m (la face
//      de l'obstacle est donc à moins de 0,8 m des pieds) ;
//   2. la hauteur de l'obstacle h : la plus petite base `bas` de la bande du corps (au-dessus des pieds) qui laisse passer
//      la sonde, cherchée par dichotomie au centimètre ; h doit être entre 0,45 et 1,20 m (plus bas, on marche dessus ;
//      plus haut, c'est un mur ou un meuble à contourner — F2, demande de L-D : 1,20 et non 1,15, le comptoir de l'accueil,
//      que le § 3.1 nomme et que L-J franchit au § 5.7.1 point 13, fait 1,18 m) ;
//   3. l'arrivée : à 0,9, 1,0… 1,3 m AU-DELÀ de la face de l'obstacle, le premier point libre (C.libre au rayon 0,3) dont
//      le sol est à moins de 0,3 m des pieds ; les rangs serrés (arrivée jamais libre) sont refusés d'eux-mêmes ;
//   4. le passage au-dessus : la ligne des pieds à l'arrivée, à h + 0,25 au-dessus des pieds, libre (rayonLibre, sphère de
//      0,15 m) sur toute sa longueur, 1,4 m au moins.
// Rend { x, y, z, h } : l'arrivée (y = son sol) et la hauteur de l'obstacle au-dessus des pieds.
// (Écrite en entier par le socle S0, inchangée : L-D génère ses liens « franchir » avec elle.)
const _s = { x: 0, z: 0 };
export function franchissable(collisions, x, y, z, dx, dz) {
  const C = collisions, L = Math.hypot(dx, dz);
  if (!C || L < 1e-6) return null;
  const ux = dx / L, uz = dz / L, R = 0.3;
  const sonde = (bas) => { _s.x = x; _s.z = z; C.deplacer(_s, ux * 0.5, uz * 0.5, R, null, y, 1.6, bas); return (_s.x - x) * ux + (_s.z - z) * uz; };
  const a0 = sonde(0.25);
  if (a0 >= 0.48) return null;                                  // rien devant
  if (sonde(1.21) < 0.48) return null;                          // trop haut : un mur
  let lo = 0.25, hi = 1.21;
  while (hi - lo > 0.01) { const m = (lo + hi) / 2; if (sonde(m) >= 0.48) hi = m; else lo = m; }
  const h = hi;
  if (h < 0.45 || h > 1.20) return null;
  const face = Math.max(0, a0) + R;
  for (let s = 0.9; s <= 1.3001; s += 0.1) {
    const ax = x + ux * (face + s), az = z + uz * (face + s);
    const sol = C.solEn(ax, az, y);
    if (Math.abs(sol - y) >= 0.3 || !C.libre(ax, az, R, sol)) continue;
    const yl = y + h + 0.25, long = Math.max(1.4, face + s);
    if (C.rayonLibre(x, yl, z, x + ux * long, yl, z + uz * long, 0.15) < 0.999) return null;
    return { x: ax, y: sol, z: az, h };
  }
  return null;
}
