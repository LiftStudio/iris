// =====================================================================
//  LA CAMÉRA EN ORBITE — squelette du socle S0 (22/10), rempli par le lot L-B
// =====================================================================
// Une seule caméra orbitale pour le prop, le mort et le spectateur (spec §§ 4.3.4, 4.5.7, arbitrage 20) : autour d'un
// pivot (un corps ou un point), au lacet / tangage de la souris (game.camYaw / camPitch), gardée hors des murs par
// `C.rayonLibre` (sphère de 0,15 m) et sous le plafond. Le squelette : distance fixe, sans lissage. L-B : les chiffres du
// prop (pivot à max(0,5 ; 0,75 h), recul clamp(1,4 + 1,6·max(l, h, p), 2,0, 3,6)), sous plafondEn − 0,15, damp(14).
import * as THREE from 'three';

const _p = new THREE.Vector3();

export class CameraOrbite {
  constructor(game) { this.game = game; this.cible = null; this.distance = 2.4; this.hauteur = 1.2; this.tangage = [-0.7, 1.25]; }
  // `cible` : un corps (posAff) ou un point { x, y, z }
  viser(cible, o) {
    const { distance = 2.4, hauteur = 1.2, tangage = null } = o || {};
    this.cible = cible; this.distance = distance; this.hauteur = hauteur;
    if (tangage) this.tangage = tangage;
  }
  poser(dt, poser = false) {
    const g = this.game, c = this.cible, cam = g.camera;
    if (!c) return false;
    const p = c.posAff || c.pos || c;
    _p.set(p.x, p.y + this.hauteur, p.z);
    const [lo, hi] = this.tangage;
    const l = g.camYaw, t = Math.max(lo, Math.min(hi, g.camPitch));
    const dx = Math.sin(l) * Math.cos(t), dy = Math.sin(t), dz = Math.cos(l) * Math.cos(t);
    let d = this.distance;
    const C = g.collisions;
    if (C) d *= Math.max(0.1, C.rayonLibre(_p.x, _p.y, _p.z, _p.x + dx * d, _p.y + dy * d, _p.z + dz * d, 0.15));
    let y = _p.y + dy * d;
    if (C) y = Math.min(y, C.plafondEn(_p.x + dx * d, _p.z + dz * d, p.y + 0.1) - 0.15);
    cam.position.set(_p.x + dx * d, y, _p.z + dz * d);
    cam.lookAt(_p);
    cam.updateMatrixWorld();
    return true;
  }
}
