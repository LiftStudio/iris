import * as THREE from 'three';

export const ZERO = new THREE.Vector3(0, 0, 0);

export function hdist(a, b) {
  const dx = a.x - b.x, dz = a.z - b.z;
  return Math.hypot(dx, dz);
}

export function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
export function lerp(a, b, t) { return a + (b - a) * t; }
// facteur de lissage indépendant du framerate
export function damp(rate, dt) { return 1 - Math.exp(-rate * dt); }
