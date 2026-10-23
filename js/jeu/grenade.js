// =====================================================================
//  LES GRENADES — frag et flash en SIMULATION (lot L-A, 23/10 ; spec §§ 3.3, 4.3.2 étape 7, 4.5.6)
// =====================================================================
// Lancées par l'arsenal (js/jeu/armes.js : la frag tenue cuit dans la main, la flash part d'un appui), elles volent dans
// `Partie.pas` (étape 7) : la pesanteur, puis le segment du pas lancé dans le monde solide par la balistique en mode
// `objet` (les formes, les vitres — une grenade n'en traverse pas —, les 53 sols et le plan y = 0) ; à l'impact, le
// REBOND : la vitesse normale renvoyée × 0,35 (restitution), la tangentielle × 0,6 (frottement) ; au sol, elle roule
// (freinée à 6 m/s²) et s'arrête sous 0,4 m/s. Une grenade est une petite sphère (4 cm) : posée à son rayon des surfaces.
// À la fin de sa mèche, elle EXPLOSE (dégâts appliqués tout de suite, par `partie.infliger` — la seule porte des dégâts) :
//   - la frag : 160 à ≤ 2,0 m, puis linéaire jusqu'à 25 à 6,5 m, la distance prise au CORPS (le segment vertical des pieds
//     au sommet de la tête : un acteur debout à 4,25 m d'une grenade au sol prend 92,5) ; il faut une LIGNE LIBRE du centre
//     relevé de 0,3 m vers son buste ou sa tête (un mur protège) ; dégâts à soi comptés (le suicide : règles, L-E) ;
//   - la flash : à ≤ 14 m et en ligne de VUE (la lumière passe une vitre claire), l'aveuglement dure
//     0,8 + 3,2 × face × (1 − d/14) s, 4 s au plus (face : 0 dos tourné, 1 en plein regard) — événement 'flash', que lisent
//     le HUD (le calque blanc #voile-flash, par Partie.majHud), la vue, les sons et les cerveaux.
// Une mèche à 0 (la frag cuite jusqu'au bout) : la grenade naît dans la main, immobile, et explose au pas même.
// Événements : 'grenade' (le lancer), 'rebond' (a, arme, x, y, z, v : le « tink » des sons), 'explosion', 'flash'.
// (ATTENTION, défaut du contrat — rapport L-A : le champ `type` de 'grenade' et d'explosion' du § 4.6 ÉCRASERAIT le type
// de l'événement dans Partie.evt, `{ t, type, ...data }` : un abonné à 'explosion' recevrait e.type === 'frag'. Le type de
// grenade voyage donc sous `arme` ('frag' | 'flash'), comme pour 'tir' ; à F2 de trancher.)
// L'identifiant d'une grenade : le pas de son lancer × 64 + l'id du lanceur (une grenade au plus par acteur et par pas) —
// rien à garder dans l'état, le même après etat() → appliquer() (un compteur repartait de zéro dans une partie neuve).
// La flash épargne les ALLIÉS du lanceur (§ 3.5, tir allié désactivé, comme la frag par Partie.infliger), pas lui-même.
import * as THREE from 'three';
import { ARMES } from './armes.js';
import { MODE } from './balistique.js';
import { NIVEAUX, BORNES_JEU } from './constantes.js';

const G = 9.81;
const RAYON = 0.04;                // m : la grenade
const FOND = NIVEAUX[0].bas;          // m : sous le −1, plus rien
const ROULEMENT = 6.0;             // m/s² : le freinage au sol (elle roule 1 à 2 m après ses rebonds)
const _o = new THREE.Vector3(), _d = new THREE.Vector3();
const _h = { t: 0, forme: null, sol: null, nx: 0, ny: 0, nz: 0 };

// la distance d'un point au segment vertical (x, y0) → (x, y1) en (x, z)
function distSegment(px, py, pz, x, y0, y1, z) {
  const y = py < y0 ? y0 : py > y1 ? y1 : py;
  return Math.hypot(px - x, py - y, pz - z);
}

// (F2, raccord : la grenade DANS une forme pleine — ni éteinte, ni `balle: false`, que les grenades traversent comme les balles :
// le jour d'un escalier — ; sa sphère de 4 cm, à 1 cm près. Sur la base fusionnée, 3 lancers sur 50 du test 14 de L-A finissaient
// dans un meuble ou une table : posée à son rayon le long de la normale d'une face, au coin de deux boîtes, elle entrait dans
// l'autre, et le rayon du pas suivant, parti du dedans, ne la voyait plus.)
export function dansUneForme(C, x, y, z, r = RAYON - 0.01) {
  let dans = false;
  if (!C || !C._parcourir) return false;
  C._parcourir(x - r, z - r, x + r, z + r, (s) => {
    if (dans || s.off || s.balle === false || y + r <= s.y0 || y - r >= s.y1) return;
    if (s.t === 'b') dans = x > s.x0 - r && x < s.x1 + r && z > s.z0 - r && z < s.z1 + r;
    else if (s.t === 'c') dans = Math.hypot(x - s.x, z - s.z) < s.r + r;
    else { const lx = (x - s.cx) * s.c + (z - s.cz) * s.s, lz = -(x - s.cx) * s.s + (z - s.cz) * s.c; dans = Math.abs(lx) < s.hx + r && Math.abs(lz) < s.hz + r; }
  });
  return dans;
}

export class Grenades {
  constructor(partie) { this.partie = partie; this._liste = []; }
  get liste() { return this._liste; }

  // `mecheRestante` : le temps qu'il reste à la mèche (une grenade cuite en main part avec moins ; 0 : elle explose en main)
  lancer(acteur, type, mecheRestante) {
    const f = ARMES[type]; if (!f) return null;
    const P = this.partie, B = P.balistique;
    acteur.oeil(_o); acteur.regard(_d);
    const meche = mecheRestante ?? f.meche;
    // la main : 0,35 m devant l'œil (0,25 en main), jamais derrière un mur qu'on touche du nez
    const devant = meche <= 0 ? 0.25 : 0.35;
    let dd = devant;
    if (B) { const t = B.rayon(_o.x, _o.y, _o.z, _d.x, _d.y, _d.z, devant + RAYON, MODE.objet, _h); if (t < devant + RAYON) dd = Math.max(0, t - RAYON - 0.01); }
    const c = acteur.corps, vx0 = c && c.vel ? c.vel.x : 0, vz0 = c && c.vel ? c.vel.z : 0;
    const g = { id: P.tick * 64 + (acteur.id & 63), a: acteur.id, type, x: _o.x + _d.x * dd, y: _o.y + _d.y * dd - (meche <= 0 ? 0.2 : 0), z: _o.z + _d.z * dd,
      vx: 0, vy: 0, vz: 0, t: meche, posee: false, rb: 0 };
    if (meche > 0) {
      // l'axe du regard à 15 m/s, + 2,5 m/s vers le haut, + l'élan du lanceur
      g.vx = _d.x * f.lancer + vx0; g.vy = _d.y * f.lancer + f.haut; g.vz = _d.z * f.lancer + vz0;
    } else g.posee = true;
    this._liste.push(g);
    P.evt('grenade', { a: acteur.id, arme: type, x: g.x, y: g.y, z: g.z, vx: g.vx, vy: g.vy, vz: g.vz, meche, id: g.id });
    return g;
  }

  pas(dt) {
    for (let i = this._liste.length - 1; i >= 0; i--) {
      const g = this._liste[i];
      if (!g.posee) this._voler(g, dt);
      g.t -= dt;
      if (g.t <= 1e-9) { this._liste.splice(i, 1); this._exploser(g); }
    }
  }
  // LE VOL d'un pas : la pesanteur, puis le segment lancé dans le monde (4 rebonds au plus dans un pas) ; enfin la SONDE
  // du sol (un rayon vers le bas de son rayon + 2 cm) : posée sur lui, elle roule, freinée, et s'arrête sous 0,4 m/s
  _voler(g, dt) {
    const P = this.partie, B = P.balistique, f = ARMES[g.type];
    const x0 = g.x, y0 = g.y, z0 = g.z, dedans0 = B ? dansUneForme(B.C, x0, y0, z0) : true;
    g.vy -= G * dt;
    let reste = dt;
    for (let k = 0; k < 4 && reste > 1e-9; k++) {
      const sx = g.vx * reste, sy = g.vy * reste, sz = g.vz * reste, L = Math.hypot(sx, sy, sz);
      if (L < 1e-9) break;
      const ux = sx / L, uy = sy / L, uz = sz / L;
      const t = B ? B.rayon(g.x, g.y, g.z, ux, uy, uz, L + RAYON, MODE.objet, _h) : L + RAYON;
      if (t >= L + RAYON - 1e-9) { g.x += sx; g.y += sy; g.z += sz; break; }
      // (le point touché ; la grenade posée à son rayon de la face, le long de sa normale)
      const nx = _h.nx, ny = _h.ny, nz = _h.nz, hx = g.x + ux * t, hy = g.y + uy * t, hz = g.z + uz * t;
      const av = Math.max(0, t - RAYON);
      reste *= 1 - Math.min(1, av / L);
      g.x = hx + nx * RAYON; g.y = hy + ny * RAYON; g.z = hz + nz * RAYON;
      // LE REBOND sur la normale de la face touchée : la normale renvoyée × restitution, la tangente × frottement
      const vn = g.vx * nx + g.vy * ny + g.vz * nz;
      if (vn < 0) {
        const tx = g.vx - vn * nx, ty = g.vy - vn * ny, tz = g.vz - vn * nz;
        const fort = -vn > 1.0, kt = fort ? f.frottement : 1, kn = fort ? f.restitution : 0;
        g.vx = tx * kt - vn * kn * nx; g.vy = ty * kt - vn * kn * ny; g.vz = tz * kt - vn * kn * nz;
        if (fort) { g.rb++; P.evt('rebond', { a: g.a, arme: g.type, x: g.x, y: g.y, z: g.z, v: -vn, id: g.id }); }
      }
    }
    if (!B) return;
    // (le pas qui la ferait ENTRER dans une forme pleine est rendu : elle reste où elle était, l'élan horizontal perdu, et tombe)
    if (!dedans0 && dansUneForme(B.C, g.x, g.y, g.z)) { g.x = x0; g.y = y0; g.z = z0; g.vx = 0; g.vz = 0; if (g.vy > 0) g.vy = 0; }
    // (le filet : sous le sol du −1, ou à 2 m hors des bornes du jeu — un trou du monde solide —, elle s'arrête là)
    if (g.y < FOND || g.x < BORNES_JEU.xMin - 2 || g.x > BORNES_JEU.xMax + 2 || g.z < BORNES_JEU.zMin - 2 || g.z > BORNES_JEU.zMax + 2) {
      g.vx = 0; g.vy = 0; g.vz = 0; g.posee = true; return;
    }
    const t = B.rayon(g.x, g.y, g.z, 0, -1, 0, RAYON + 0.02, MODE.objet, _h);
    if (g.vy > -1 && t < RAYON + 0.02 && _h.ny > 0.7) {
      g.y += RAYON - t;
      if (g.vy < 0) g.vy = 0;
      const vh = Math.hypot(g.vx, g.vz), dv = ROULEMENT * dt;
      if (vh > dv) { g.vx *= 1 - dv / vh; g.vz *= 1 - dv / vh; } else { g.vx = 0; g.vz = 0; }
      if (Math.hypot(g.vx, g.vy, g.vz) < f.arret) { g.vx = 0; g.vy = 0; g.vz = 0; g.posee = true; }
    }
  }

  // L'EXPLOSION : 'explosion', puis les dégâts (frag) ou l'aveuglement (flash) de chaque acteur vivant
  _exploser(g) {
    const P = this.partie, f = ARMES[g.type], B = P.balistique;
    P.evt('explosion', { x: g.x, y: g.y, z: g.z, r: g.type === 'flash' ? f.rayon : f.rMax, arme: g.type, a: g.a, id: g.id });
    const ox = g.x, oy = g.y + 0.3, oz = g.z, lanceur = P.acteurParId(g.a);
    for (const a of P.acteurs) {
      if (!a.vivant || !a.corps || a.role === 'cible') continue;
      const p = a.corps.pos, e = a.h / 1.73, pieds = p.y + (a.corps.jumpY || 0);
      if (g.type === 'flash') {
        a.oeil(_o);
        const dx = g.x - _o.x, dy = g.y - _o.y, dz = g.z - _o.z, d = Math.hypot(dx, dy, dz);
        if (d > f.rayon || a.prop || (lanceur && a !== lanceur && !P.ennemis(lanceur, a))) continue;
        if (B && !B.vue(g.x, g.y + 0.15, g.z, _o.x, _o.y, _o.z)) continue;
        a.regard(_d);
        const face = d > 1e-6 ? Math.max(0, Math.min(1, (dx * _d.x + dy * _d.y + dz * _d.z) / d)) : 1;
        const duree = Math.min(f.max, f.base + f.face * face * (1 - d / f.rayon));
        P.evt('flash', { cible: a.id, duree, par: g.a, d });
        continue;
      }
      // la frag : la distance au corps, la ligne libre vers le buste ou la tête
      let haut = 1.75 * e, buste = 1.27 * e, tete = 1.635 * e;
      if (a.prop && a.prop.T) { const T = a.prop.T, h = T.haut || (T.boite ? T.boite.max.y - T.boite.min.y : 0.5); haut = h; buste = h * 0.5; tete = h * 0.9; }
      const d = distSegment(g.x, g.y, g.z, p.x, pieds, pieds + haut, p.z);
      if (d > f.rMax) continue;
      if (B && !B.libre(ox, oy, oz, p.x, pieds + buste, p.z) && !B.libre(ox, oy, oz, p.x, pieds + tete, p.z)) continue;
      const deg = d <= f.rPlein ? f.degatsMax : f.degatsMax + (f.degatsMin - f.degatsMax) * (d - f.rPlein) / (f.rMax - f.rPlein);
      const ix = p.x - g.x, iy = pieds + buste - g.y, iz = p.z - g.z, n = Math.hypot(ix, iy, iz) || 1;
      P.infliger(a, deg, { par: g.a, arme: g.type, zone: 'torse', x: p.x, y: pieds + buste, z: p.z, dx: ix / n, dy: iy / n, dz: iz / n, plomb: 0 });
    }
  }

  etat() { return this._liste.map((g) => ({ id: g.id, a: g.a, type: g.type, x: g.x, y: g.y, z: g.z, vx: g.vx, vy: g.vy, vz: g.vz, t: g.t, posee: g.posee, rb: g.rb })); }
  appliquer(e) {
    this._liste = (e || []).map((g) => ({ rb: 0, ...g }));
  }
}
