// =====================================================================
//  LA BALISTIQUE — squelette du socle S0 (22/10), rempli par le lot L-A
// =====================================================================
// Les balles et la vue des bots sur le MONDE SOLIDE (js/collisions.js), jamais un Raycaster sur la scène (19 ms le rayon)
// — spec § 4.5.6. Le squelette pose les trois questions avec `C.rayonLibre` (rayon 0), approximatives : ni les sols (les
// dessous de plancher, déclarés en plafonds, arrêtent pourtant un tir vertical), ni les vitres (une vitre `camera: false`
// laisse passer), pas de normale juste ni de forme touchée. Le segment est découpé en tronçons de 2 m : la grille du monde
// n'est parcourue que sur leur emprise (un tir de 60 m en diagonale ne lit pas 900 cases d'un coup). L-A y met le DDA :
// plus proche impact, formes `camera` ET `joueur`, 53 sols et le plan y = 0, normales, vitres claires et dépolies,
// `balle === false`, le pré-filtre `zonesCachees & zoneDe` de `vue`.
import { rayonActeurs } from './touches.js';

// les paires de zones où le pré-filtre de `vue` a menti (spec § 3.7) : on y passe directement au DDA (L-A, F2)
export const EXCEPTIONS_PREFILTRE = new Set();
const TRONCON = 2;

export class Balistique {
  constructor(collisions) { this.C = collisions; }

  // la ligne de vue A → B est-elle libre ?
  vue(ax, ay, az, bx, by, bz) {
    const L = Math.hypot(bx - ax, by - ay, bz - az);
    if (L < 1e-6) return true;
    return this._libre(ax, ay, az, (bx - ax) / L, (by - ay) / L, (bz - az) / L, L) >= L - 1e-6;
  }
  // la distance libre le long du rayon O + t·D (D unitaire), jusqu'à `portee`
  _libre(ax, ay, az, dx, dy, dz, portee) {
    const C = this.C;
    for (let s0 = 0; s0 < portee; s0 += TRONCON) {
      const s1 = Math.min(portee, s0 + TRONCON);
      const f = C.rayonLibre(ax + dx * s0, ay + dy * s0, az + dz * s0, ax + dx * s1, ay + dy * s1, az + dz * s1, 0);
      if (f < 1) return s0 + f * (s1 - s0);
    }
    return portee;
  }
  // une balle dans le monde : { t, x, y, z, nx, ny, nz, mat, forme, vitre } (mat 'rien' : rien touché avant `portee`)
  balle(ax, ay, az, dx, dy, dz, portee, out) {
    out = out || {};
    const t = this._libre(ax, ay, az, dx, dy, dz, portee);
    out.t = t; out.x = ax + dx * t; out.y = ay + dy * t; out.z = az + dz * t;
    out.nx = -dx; out.ny = -dy; out.nz = -dz;                // (squelette : la normale est le rayon retourné)
    out.mat = t < portee ? 'mur' : 'rien'; out.forme = null; out.vitre = false;
    return out;
  }
  // UN TIR : le monde puis les acteurs (le plus proche) ; `out` = { acteur, zone, t, x, y, z, nx, ny, nz, mat, forme, traverse }
  tirer(partie, tireur, ox, oy, oz, dx, dy, dz, portee, out) {
    out = out || {};
    const m = this.balle(ox, oy, oz, dx, dy, dz, portee, this._m || (this._m = {}));
    const h = rayonActeurs(partie.acteurs, ox, oy, oz, dx, dy, dz, m.t, tireur, this._h || (this._h = { acteur: null, zone: null, t: 0 }));
    if (h) {
      out.acteur = h.acteur; out.zone = h.zone; out.t = h.t;
      out.x = ox + dx * h.t; out.y = oy + dy * h.t; out.z = oz + dz * h.t;
      out.nx = -dx; out.ny = -dy; out.nz = -dz; out.mat = 'corps'; out.forme = null; out.traverse = false;
    } else {
      out.acteur = null; out.zone = null; out.t = m.t; out.x = m.x; out.y = m.y; out.z = m.z;
      out.nx = m.nx; out.ny = m.ny; out.nz = m.nz; out.mat = m.mat; out.forme = m.forme; out.traverse = false;
    }
    return out;
  }
}
