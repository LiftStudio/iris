// =====================================================================
//  LES GRENADES — squelette du socle S0 (22/10), rempli par le lot L-A
// =====================================================================
// Frag et flash (spec § 3.3) en SIMULATION : lancées par l'arsenal (L-A), elles volent dans `Partie.pas` (étape 7) et
// explosent à la fin de leur mèche ; les dégâts d'une explosion sont appliqués tout de suite (par `partie.infliger`).
// Le squelette : chute balistique, arrêt au sol (`solEn`), explosion à la mèche, dégâts SANS ligne de vue (frag : 160 à
// ≤ 2 m, puis linéaire jusqu'à 25 à 6,5 m ; flash : 0,8 + 3,2 × face × (1 − d/14) s, 4 s au plus). L-A : rebonds
// (restitution 0,35, frottement 0,6, arrêt sous 0,4 m/s), murs, ligne de vue centre + 0,3 m → buste ou tête.
import * as THREE from 'three';
import { ARMES } from './armes.js';

const G = 9.81;
const _o = new THREE.Vector3(), _d = new THREE.Vector3();

export class Grenades {
  constructor(partie) { this.partie = partie; this._liste = []; this._id = 0; }
  get liste() { return this._liste; }
  // `mecheRestante` : le temps qu'il reste à la mèche (une grenade cuite en main part avec moins)
  lancer(acteur, type, mecheRestante) {
    const f = ARMES[type]; if (!f) return null;
    acteur.oeil(_o); acteur.regard(_d);
    const g = { id: ++this._id, a: acteur.id, type, x: _o.x + _d.x * 0.3, y: _o.y + _d.y * 0.3, z: _o.z + _d.z * 0.3,
      vx: _d.x * f.lancer, vy: _d.y * f.lancer + f.haut, vz: _d.z * f.lancer, t: mecheRestante ?? f.meche, posee: false };
    this._liste.push(g);
    this.partie.evt('grenade', { a: acteur.id, type, x: g.x, y: g.y, z: g.z, vx: g.vx, vy: g.vy, vz: g.vz });
    return g;
  }
  pas(dt) {
    const P = this.partie, C = P.game.collisions;
    for (let i = this._liste.length - 1; i >= 0; i--) {
      const g = this._liste[i];
      if (!g.posee) {
        g.vy -= G * dt;
        g.x += g.vx * dt; g.y += g.vy * dt; g.z += g.vz * dt;
        const sol = C ? C.solEn(g.x, g.z, g.y + 0.3) : 0;
        if (g.y <= sol + 0.05) { g.y = sol + 0.05; g.vx = 0; g.vy = 0; g.vz = 0; g.posee = true; }
      }
      g.t -= dt;
      if (g.t <= 0) { this._liste.splice(i, 1); this._exploser(g); }
    }
  }
  _exploser(g) {
    const P = this.partie, f = ARMES[g.type];
    P.evt('explosion', { x: g.x, y: g.y, z: g.z, r: g.type === 'flash' ? f.rayon : f.rMax, type: g.type });
    const tireur = P.acteurs.find((a) => a.id === g.a) || null;
    for (const a of P.acteurs) {
      if (!a.vivant || !a.corps || a.role === 'cible') continue;
      a.oeil(_o);
      const d = Math.hypot(_o.x - g.x, _o.y - g.y, _o.z - g.z);
      if (g.type === 'flash') {
        if (d > f.rayon) continue;
        a.regard(_d);
        const face = Math.max(0, Math.min(1, ((g.x - _o.x) * _d.x + (g.y - _o.y) * _d.y + (g.z - _o.z) * _d.z) / Math.max(1e-6, d)));
        const duree = Math.min(f.max, f.base + f.face * face * (1 - d / f.rayon));
        P.evt('flash', { cible: a.id, duree });
      } else {
        if (d > f.rMax) continue;
        const deg = d <= f.rPlein ? f.degatsMax : f.degatsMax + (f.degatsMin - f.degatsMax) * (d - f.rPlein) / (f.rMax - f.rPlein);
        P.infliger(a, deg, { par: tireur ? tireur.id : -1, arme: g.type, zone: 'torse', x: g.x, y: g.y, z: g.z, dx: _o.x - g.x, dy: _o.y - g.y, dz: _o.z - g.z, plomb: 0 });
      }
    }
  }
  etat() { return this._liste.map((g) => ({ id: g.id, a: g.a, type: g.type, x: g.x, y: g.y, z: g.z, vx: g.vx, vy: g.vy, vz: g.vz, t: g.t, posee: g.posee })); }
  appliquer(e) {
    this._liste = (e || []).map((g) => ({ ...g }));
    this._id = this._liste.reduce((m, g) => Math.max(m, g.id), this._id);
  }
}
