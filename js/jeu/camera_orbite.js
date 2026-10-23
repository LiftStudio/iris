// =====================================================================
//  LA CAMÉRA EN ORBITE — lot L-B (23/10), sur le squelette du socle S0 (22/10)
// =====================================================================
// Une seule caméra orbitale pour le prop, le mort et le spectateur (spec §§ 4.3.4, 4.5.7, arbitrage 20) : autour d'un
// pivot (un corps ou un point), au lacet / tangage de la souris (game.camYaw / camPitch ; la même convention que la vue à
// la 1re personne : la caméra est DERRIÈRE le pivot, sur l'axe opposé au regard), bornée en tangage, gardée hors des murs
// par `C.rayonLibre` (une sphère de 0,15 m le long du bras), hors des formes du joueur, sous le plafond (plafondEn − 0,15).
// Le bras se RACCOURCIT tout de suite (jamais un mur entre la caméra et le prop) et se rallonge en douceur (damp(14)).
// Les CHIFFRES DU PROP (§ 4.5.7) quand le pivot est le corps d'un prop déguisé — pris sur la taille de son meuble, quoi que
// demande l'appelant : pivot à max(0,5 ; 0,75 h) au-dessus des pieds, bras de clamp(1,4 + 1,6·max(l, h, p), 2,0, 3,6) m (un
// tabouret : 2,5 m ; un distributeur : 3,6). Sinon (un humain suivi, un mort, le prop encore humain) : les chiffres
// donnés à `viser`.
import * as THREE from 'three';

export const ORBITE = { rayon: 0.15, plafond: 0.15, damp: 14, pivotMin: 0.5, pivotK: 0.75, bras: { base: 1.4, k: 1.6, min: 2.0, max: 3.6 },
  marge: 0.05, brasMin: 0.1, point: 0.1 };
const _p = new THREE.Vector3();
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

export class CameraOrbite {
  constructor(game) { this.game = game; this.cible = null; this.distance = 2.4; this.hauteur = 1.2; this.tangage = [-0.7, 1.25]; this._d = NaN; this._cible = null; }
  // `cible` : un corps (posAff) ou un point { x, y, z }
  viser(cible, o) {
    const { distance = 2.4, hauteur = 1.2, tangage = null } = o || {};
    if (cible !== this._cible) { this._d = NaN; this._cible = cible; }
    this.cible = cible; this.distance = distance; this.hauteur = hauteur;
    if (tangage) this.tangage = tangage;
  }
  // le champ vertical de la partie (`controls.fps.champ`, horizontal 16:9, plafonné à 108° d'horizontal)
  champ() {
    const s = this.game.settings, F = (s && s.controls && s.controls.fps) || {}, D = Math.PI / 180, asp = this.game.camera.aspect || 16 / 9;
    let v = 2 * Math.atan(Math.tan((F.champ || 90) / 2 * D) / (16 / 9));
    if (2 * Math.atan(Math.tan(v / 2) * asp) > 108 * D) v = 2 * Math.atan(Math.tan(54 * D) / asp);
    return v / D;
  }
  // les chiffres du prop, si `c` est le corps d'un prop déguisé de la partie en cours : { hauteur, distance } ou null
  chiffresProp(c) {
    const P = this.game.partie; if (!P || !c) return null;
    for (const a of P.acteurs) {
      if (a.corps !== c || !a.prop || !a.prop.T) continue;
      const T = a.prop.T, t = T.taille || (T.boite && T.boite.getSize ? T.boite.getSize(new THREE.Vector3()) : null);
      const l = t ? t.x : 2 * (T.rayon || 0.3), h = t ? t.y : T.haut || 1, p = t ? t.z : 2 * (T.rayon || 0.3), B = ORBITE.bras;
      return { hauteur: Math.max(ORBITE.pivotMin, ORBITE.pivotK * h), distance: clamp(B.base + B.k * Math.max(l, h, p), B.min, B.max) };
    }
    return null;
  }
  poser(dt, poser = false) {
    const g = this.game, c = this.cible, cam = g.camera, C = g.collisions;
    if (!c) return false;
    const p = c.posAff || c.pos || c;
    const pr = c.posAff || c.pos ? this.chiffresProp(c) : null;
    const hauteur = pr ? pr.hauteur : this.hauteur, distance = pr ? pr.distance : this.distance;
    // (les pieds : le sol affiché, et le saut)
    const pieds = c.posAff ? (Number.isFinite(c.solAff) ? c.solAff + (c.jumpY || 0) : p.y) : p.y;
    _p.set(p.x, pieds + hauteur, p.z);
    const [lo, hi] = this.tangage;
    const l = g.camYaw, t = clamp(g.camPitch, lo, hi);
    const dx = Math.sin(l) * Math.cos(t), dy = Math.sin(t), dz = Math.cos(l) * Math.cos(t);
    // le bras libre : la sphère de 0,15 m le long du segment, moins une marge quand il touche
    let voulu = distance;
    if (C) {
      const k = C.rayonLibre(_p.x, _p.y, _p.z, _p.x + dx * distance, _p.y + dy * distance, _p.z + dz * distance, ORBITE.rayon);
      voulu = k < 1 ? Math.max(ORBITE.brasMin, distance * k - ORBITE.marge) : distance;
    }
    // raccourci tout de suite, rallongé en douceur
    if (poser || !Number.isFinite(this._d) || voulu < this._d) this._d = voulu;
    else this._d += (voulu - this._d) * (1 - Math.exp(-ORBITE.damp * Math.max(0, dt)));
    let d = this._d, x = _p.x + dx * d, y = _p.y + dy * d, z = _p.z + dz * d;
    if (C) {
      // jamais DANS une forme du joueur (celle où le pivot est déjà — que rayonLibre ignore — comprise) : le bras raccourci
      const dedans = (X, Y, Z) => !C.libre(X, Z, ORBITE.point, Y - ORBITE.point, ORBITE.point * 2, 0);
      for (let n = 0; n < 12 && d > ORBITE.brasMin && dedans(x, y, z); n++) {
        d = Math.max(ORBITE.brasMin, d * 0.8); x = _p.x + dx * d; y = _p.y + dy * d; z = _p.z + dz * d;
      }
      if (d < this._d) this._d = d;
      // sous le plafond
      const plaf = C.plafondEn(x, z, pieds + 0.1);
      if (y > plaf - ORBITE.plafond) y = plaf - ORBITE.plafond;
    }
    cam.position.set(x, y, z);
    cam.lookAt(_p);
    // (le champ de la partie, celui de la hanche : la vue à la 1re personne a pu le laisser zoomé)
    const f = this.champ();
    if (Math.abs(f - cam.fov) > 1e-6) { cam.fov = f; cam.updateProjectionMatrix(); }
    cam.updateMatrixWorld();
    return true;
  }
}
