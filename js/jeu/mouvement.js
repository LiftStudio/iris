// =====================================================================
//  LE MOUVEMENT DES ACTEURS — squelette du socle S0 (22/10), rempli par le lot L-B
// =====================================================================
// La commande appliquée au corps (spec §§ 3.1, 4.5.7) : le cap posé par le lacet (setFacing, `capFixe` : Player ne se tourne
// plus vers sa course), l'axe tourné du lacet, les allures ramenées aux mêmes vitesses pour TOUTES les fiches (5,00 m/s de
// course, 6,60 de sprint : `speedMul` et `sprintMul` du Player), l'endurance tenue à 100 (pas de « mains sur les genoux »),
// le saut, puis `joueur.simuler(dt)` (saut, minuteries — jamais la pose). Le squelette : course, sprint, marche, saut fixe
// (3,15 m/s), accroupi linéaire, événement `pas` tous les 0,7 m ; L-B y met le sprint tactique, la glissade, le saut borné
// en vol, le franchissement scripté, la réception, les escaliers lissés. `separer` (les contacts entre corps) passe déjà
// par le monde solide, et `franchissable` est ÉCRITE EN ENTIER ici (L-B et L-D l'appellent ; personne ne la change sans F2).
import * as THREE from 'three';
import { OEIL } from './constantes.js';

export const ALLURES = { marche: 2.15, course: 5.0, sprint: 6.6, sprintTact: 7.8, visee: 2.4, accroupi: 2.3, accroupiVisee: 1.5 };
const SAUT = 3.15;                 // m/s (apogée 0,505 m, 0,64 s en l'air)
const PAS_COURSE = 0.7, PAS_MARCHE = 0.45;
const _dir = new THREE.Vector3();

// la vitesse de base d'une fiche (js/player.js move : 3,1 + spd/100 × 2,4 ; Haythem 5,476)
const vBase = (p) => 3.1 + ((p.def && p.def.spd) || 99) / 100 * 2.4;

export function appliquerCommande(acteur, cmd, dt, partie) {
  const p = acteur.joueur;
  if (!p || acteur.corps !== p) return;
  // le cap : celui de la visée
  p.setFacing(-Math.sin(cmd.lacet), -Math.cos(cmd.lacet));
  // l'axe, relatif au lacet (x à droite, y en avant)
  const l = cmd.lacet, ax = cmd.ax || 0, ay = cmd.ay || 0;
  _dir.set(0, 0, 0);
  if (ax || ay) {
    _dir.set(-Math.sin(l) * ay + Math.cos(l) * ax, 0, -Math.cos(l) * ay - Math.sin(l) * ax);
    const n = _dir.length(); if (n > 1e-6) _dir.multiplyScalar(1 / n);
  }
  const bouge = _dir.lengthSq() > 0.001;
  // l'accroupi (squelette : linéaire, 0,16 s pour descendre, 0,18 s pour se relever)
  acteur.accroupi = Math.max(0, Math.min(1, acteur.accroupi + (cmd.accroupi ? dt / 0.16 : -dt / 0.18)));
  // LES ALLURES : la course de toutes les fiches ramenée à 5,00 m/s, le sprint × 1,32 = 6,60 (illimité au combat)
  const marche = !!cmd.marche && !cmd.sprint;
  let v = ALLURES.course;
  if (acteur.accroupi > 0.5) v = ALLURES.accroupi;
  if (cmd.visee) v = acteur.accroupi > 0.5 ? ALLURES.accroupiVisee : ALLURES.visee;
  p.speedMul = v / vBase(p);
  p.sprintMul = ALLURES.sprint / ALLURES.course;
  p.marche = marche;
  p.stamina = 100; p.staminaMul = 0;
  const sprint = !!cmd.sprint && bouge && !cmd.visee && acteur.accroupi < 0.5;
  const x0 = p.pos.x, z0 = p.pos.z;
  p.move(_dir, sprint, dt);
  if (cmd.saut && !p.airborne && !acteur.gele) { const vs = vitesseSaut(acteur); if (vs > 0) { p.jump(vs); partie.evt('saut', { a: acteur.id, f: 1 }); } }
  const enAir = p.airborne;
  p.simuler(dt);
  if (enAir && !p.airborne) partie.evt('reception', { a: acteur.id, f: Math.min(1, Math.abs(p.jumpVelSol || 0) / 6) });
  // LES PAS (événement : les sons et l'ouïe des bots le lisent, même d'un bot caché ou posé à 4 Hz)
  const d = Math.hypot(p.pos.x - x0, p.pos.z - z0), vit = d / dt;
  if (!p.airborne && vit > (acteur.accroupi > 0.5 ? 1.3 : 0.3)) {
    acteur._pasD = (acteur._pasD || 0) + d;
    const pas = marche ? PAS_MARCHE : PAS_COURSE;
    if (acteur._pasD >= pas) {
      acteur._pasD -= pas;
      const allure = sprint ? 'sprint' : marche ? 'marche' : acteur.accroupi > 0.5 ? 'accroupi' : 'course';
      partie.evt('pas', { a: acteur.id, x: p.pos.x, y: p.pos.y, z: p.pos.z, f: Math.min(1, vit / ALLURES.sprint), allure });
    }
  }
}

// la hauteur de l'œil au-dessus des pieds, sans le saut (× h / 1,73)
export function hauteurOeil(acteur) {
  const h = (acteur.joueur && acteur.joueur.h) || (acteur.fiche && acteur.fiche.height) || OEIL.taille;
  const k = acteur.accroupi || 0, g = acteur.glisse || 0;
  const o = OEIL.debout + (OEIL.accroupi - OEIL.debout) * k + (OEIL.glisse - OEIL.debout) * g * (1 - k);
  return o * h / OEIL.taille;
}

// la vitesse de saut possible (0 = pas de saut) — squelette : 3,15 m/s au sol
export function vitesseSaut(acteur) {
  const c = acteur.corps;
  return c && !c.airborne ? SAUT : 0;
}

// LES CONTACTS ENTRE CORPS (§ 3.1) : deux corps de rayons ra et rb ne se recouvrent pas (séparation à ra + rb), poussée
// partagée à moitié, PAR LE MONDE SOLIDE (C.deplacer : une poussée directe traverserait une cloison de 15 cm) et 0,05 m
// au plus par pas ; deux centres confondus s'écartent selon un angle déterministe tiré de leurs ids.
const _p = { x: 0, z: 0 };
export function separer(acteurs, collisions) {
  const C = collisions, n = acteurs.length;
  for (let i = 0; i < n; i++) {
    const a = acteurs[i], A = a.corps; if (!A) continue;
    for (let j = i + 1; j < n; j++) {
      const b = acteurs[j], B = b.corps; if (!B) continue;
      if (Math.abs(A.pos.y - B.pos.y) > 1.2) continue;
      const ra = A.rayon ?? 0.3, rb = B.rayon ?? 0.3, R = ra + rb;
      let dx = B.pos.x - A.pos.x, dz = B.pos.z - A.pos.z;
      const d2 = dx * dx + dz * dz;
      if (d2 >= R * R) continue;
      let d = Math.sqrt(d2);
      if (d < 1e-6) {
        const ang = 2 * Math.PI * ((0.618 * (a.id + 7 * b.id)) % 1);
        dx = Math.cos(ang); dz = Math.sin(ang); d = 0;
      } else { dx /= d; dz /= d; }
      const pousse = Math.min(0.05, (R - d) / 2);
      for (const [X, s] of [[A, -1], [B, 1]]) {
        if (X.fixe) continue;
        _p.x = X.pos.x; _p.z = X.pos.z;
        // (la bande du corps, celle de son propre déplacement : hautCorps / basCorps d'un Player, haut / bas d'un CorpsProp)
        if (C) C.deplacer(_p, dx * pousse * s, dz * pousse * s, X.rayon ?? 0.3, null, X.pos.y + (X.jumpY || 0), X.hautCorps ?? X.haut, X.basCorps ?? X.bas);
        else { _p.x += dx * pousse * s; _p.z += dz * pousse * s; }
        X.pos.x = _p.x; X.pos.z = _p.z;
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
//      la sonde, cherchée par dichotomie au centimètre ; h doit être entre 0,45 et 1,15 m (plus bas, on marche dessus ;
//      plus haut, c'est un mur ou un meuble à contourner) ;
//   3. l'arrivée : à 0,9, 1,0… 1,3 m AU-DELÀ de la face de l'obstacle, le premier point libre (C.libre au rayon 0,3) dont
//      le sol est à moins de 0,3 m des pieds ; les rangs serrés (arrivée jamais libre) sont refusés d'eux-mêmes ;
//   4. le passage au-dessus : la ligne des pieds à l'arrivée, à h + 0,25 au-dessus des pieds, libre (rayonLibre, sphère de
//      0,15 m) sur toute sa longueur, 1,4 m au moins.
// Rend { x, y, z, h } : l'arrivée (y = son sol) et la hauteur de l'obstacle au-dessus des pieds.
const _s = { x: 0, z: 0 };
export function franchissable(collisions, x, y, z, dx, dz) {
  const C = collisions, L = Math.hypot(dx, dz);
  if (!C || L < 1e-6) return null;
  const ux = dx / L, uz = dz / L, R = 0.3;
  const sonde = (bas) => { _s.x = x; _s.z = z; C.deplacer(_s, ux * 0.5, uz * 0.5, R, null, y, 1.6, bas); return (_s.x - x) * ux + (_s.z - z) * uz; };
  const a0 = sonde(0.25);
  if (a0 >= 0.48) return null;                                  // rien devant
  if (sonde(1.16) < 0.48) return null;                          // trop haut : un mur
  let lo = 0.25, hi = 1.16;
  while (hi - lo > 0.01) { const m = (lo + hi) / 2; if (sonde(m) >= 0.48) hi = m; else lo = m; }
  const h = hi;
  if (h < 0.45 || h > 1.15) return null;
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
