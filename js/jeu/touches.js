// =====================================================================
//  LES BOÎTES DE TOUCHE — où une balle touche un acteur (lot L-A, 23/10 ; spec § 4.5.6, arbitrage 10)
// =====================================================================
// Calculées depuis l'ÉTAT SIMULÉ (position, saut, accroupi, glissade, cap, vitesse), jamais depuis les os affichés : justes
// pour un bot posé à 4 Hz ou caché, rejouables par l'hôte (la compensation de latence de demain refait les capsules à
// l'instant vu par l'invité). Pour une taille de 1,73 m (× h / 1,73) : tête sphère r 0,115 centrée à 1,635 · cou 1,42 →
// 1,55 r 0,06 · torse 1,12 → 1,42 r 0,165 · ventre 0,90 → 1,12 r 0,155 · jambes 0,10 → 0,90 r 0,13 ; l'accroupi k abaisse
// ce qui est au-dessus des hanches de 0,54 k (la glissade de 0,77), le saut ajoute jumpY ; la TÊTE AVANCE de
// 0,04 + 0,02·v selon le cap (le corps se penche dans sa course : c'est l'écart que l'œil voit entre la capsule droite et
// l'os `Head` d'un coureur — contrôle du test 15 : ≤ 6 cm en moyenne, ≤ 10 cm au 95e centile). Un prop : sa boîte orientée
// (T.boite, au cap du déguisement) ; une cible du stand : un panneau (deux boîtes minces, buste et tête).
// Les volumes sont des objets RÉUTILISÉS (aucune allocation par balle : un plomb du FP-12 en lit 8 acteurs).

export const ZONES = ['tete', 'cou', 'torse', 'ventre', 'jambes'];
const HUMAIN = [
  { zone: 'tete', a: 1.635, b: 1.635, r: 0.115 },
  { zone: 'cou', a: 1.42, b: 1.55, r: 0.06 },
  { zone: 'torse', a: 1.12, b: 1.42, r: 0.165 },
  { zone: 'ventre', a: 0.90, b: 1.12, r: 0.155 },
  { zone: 'jambes', a: 0.10, b: 0.90, r: 0.13 },
];
const HANCHES = 0.90;
export const AVANCE_TETE = { base: 0.04, parMs: 0.02 };   // m, et m par m/s (× h / 1,73)

const vol = (out, n) => out[n] || (out[n] = { zone: null, t: 'c', ax: 0, ay: 0, az: 0, bx: 0, by: 0, bz: 0, r: 0, cx: 0, cy: 0, cz: 0, hx: 0, hy: 0, hz: 0, c: 1, s: 0 });
const boite = (v, zone, cx, cy, cz, hx, hy, hz, c, s) => { v.zone = zone; v.t = 'o'; v.cx = cx; v.cy = cy; v.cz = cz; v.hx = hx; v.hy = hy; v.hz = hz; v.c = c; v.s = s; };

// l'avant d'un corps (le cap simulé) : `facing` d'un Player, sinon l'angle `ang` (atan2(x, z) de l'avant)
function avant(c, out) {
  if (c.facing && (c.facing.x || c.facing.z)) { const n = Math.hypot(c.facing.x, c.facing.z); out.x = c.facing.x / n; out.z = c.facing.z / n; }
  else { const a = c.ang || 0; out.x = Math.sin(a); out.z = Math.cos(a); }
  return out;
}
const _f = { x: 0, z: 0 };

// le centre de la tête SIMULÉE (la capsule de la tête) : { x, y, z } — `affiche` : à la position affichée (interpolée)
export function teteSimulee(acteur, out, affiche = false) {
  out = out || { x: 0, y: 0, z: 0 };
  const c = acteur.corps; if (!c) return out;
  const p = affiche && c.posAff ? c.posAff : c.pos, e = acteur.h / 1.73;
  const pieds = (affiche && Number.isFinite(c.solAff) ? c.solAff : p.y) + (c.jumpY || 0);
  const bas = abaissement(acteur), v = c.vel ? Math.hypot(c.vel.x, c.vel.z) : 0, av = (AVANCE_TETE.base + AVANCE_TETE.parMs * v) * e;
  avant(c, _f);
  out.x = p.x + _f.x * av; out.y = pieds + (HUMAIN[0].a - bas) * e; out.z = p.z + _f.z * av;
  return out;
}
// ce que l'accroupi et la glissade retirent à tout ce qui est au-dessus des hanches (m, pour 1,73)
function abaissement(acteur) {
  const k = acteur.accroupi || 0, g = acteur.glisse || 0;
  return 0.54 * k + 0.77 * g * (1 - k);
}

// les volumes de touche d'un acteur : [{ zone, t: 'c', ax, ay, az, bx, by, bz, r }] (capsules) ou
// [{ zone, t: 'o', cx, cy, cz, hx, hy, hz, c, s }] (boîtes orientées, cap autour de Y)
export function capsules(acteur, out) {
  out = out || [];
  const c = acteur.corps;
  if (!c) { out.length = 0; return out; }
  const x = c.pos.x, y = c.pos.y + (c.jumpY || 0), z = c.pos.z;
  if (acteur.prop && acteur.prop.T) {
    const T = acteur.prop.T, b = T.boite, cap = acteur.prop.cap || 0;
    const hy = (b.max.y - b.min.y) / 2, ox = (b.max.x + b.min.x) / 2, oz = (b.max.z + b.min.z) / 2;
    const co = Math.cos(cap), si = Math.sin(cap);
    // (la boîte locale décentrée tourne avec le meuble : son centre au monde, puis ses demi-tailles dans son repère)
    boite(vol(out, 0), 'torse', x + ox * co + oz * si, y + b.min.y + hy, z - ox * si + oz * co, (b.max.x - b.min.x) / 2, hy, (b.max.z - b.min.z) / 2, co, si);
    out.length = 1;
    return out;
  }
  const e = acteur.h / 1.73;
  if (acteur.role === 'cible') {
    const cap = c.ang || 0, co = Math.cos(cap), si = Math.sin(cap);
    boite(vol(out, 0), 'torse', x, y + 0.75 * e, z, 0.25 * e, 0.65 * e, 0.03, co, si);
    boite(vol(out, 1), 'tete', x, y + 1.6 * e, z, 0.12 * e, 0.14 * e, 0.03, co, si);
    out.length = 2;
    return out;
  }
  const bas = abaissement(acteur), v = c.vel ? Math.hypot(c.vel.x, c.vel.z) : 0;
  const av = (AVANCE_TETE.base + AVANCE_TETE.parMs * v) * e;
  avant(c, _f);
  for (let n = 0; n < HUMAIN.length; n++) {
    const H = HUMAIN[n], V = vol(out, n);
    const ka = H.a > HANCHES - 1e-6 ? bas : 0, kb = H.b > HANCHES - 1e-6 ? bas : 0;
    let ya = (H.a - ka) * e, yb = (H.b - kb) * e;
    if (H.zone === 'jambes') yb = Math.max(ya + 0.15, (H.b - bas) * e);
    const dx = H.zone === 'tete' ? _f.x * av : 0, dz = H.zone === 'tete' ? _f.z * av : 0;
    V.zone = H.zone; V.t = 'c'; V.ax = x + dx; V.ay = y + ya; V.az = z + dz; V.bx = x + dx; V.by = y + yb; V.bz = z + dz; V.r = H.r * e;
  }
  out.length = HUMAIN.length;
  return out;
}

// le rayon (O + t·D, D unitaire) contre une capsule : t d'entrée ou Infinity
function rayonCapsule(ox, oy, oz, dx, dy, dz, k) {
  const abx = k.bx - k.ax, aby = k.by - k.ay, abz = k.bz - k.az;
  const aox = ox - k.ax, aoy = oy - k.ay, aoz = oz - k.az;
  const ab2 = abx * abx + aby * aby + abz * abz, r = k.r;
  let best = Infinity;
  if (ab2 > 1e-12) {
    const abd = abx * dx + aby * dy + abz * dz, abo = abx * aox + aby * aoy + abz * aoz;
    const a = ab2 - abd * abd, b = ab2 * (aox * dx + aoy * dy + aoz * dz) - abo * abd;
    const c = ab2 * (aox * aox + aoy * aoy + aoz * aoz) - abo * abo - r * r * ab2;
    if (a > 1e-12) {
      const disc = b * b - a * c;
      if (disc >= 0) {
        const t = (-b - Math.sqrt(disc)) / a, s = abo + t * abd;
        if (t >= 0 && s >= 0 && s <= ab2) best = t;
      }
    }
  }
  // les deux bouts (sphères)
  for (let e = 0; e < 2; e++) {
    const px = e ? k.bx : k.ax, py = e ? k.by : k.ay, pz = e ? k.bz : k.az;
    const mx = ox - px, my = oy - py, mz = oz - pz, b = mx * dx + my * dy + mz * dz, c = mx * mx + my * my + mz * mz - r * r;
    if (c > 0 && b > 0) continue;
    const disc = b * b - c;
    if (disc < 0) continue;
    const t = Math.max(0, -b - Math.sqrt(disc));
    if (t < best) best = t;
  }
  return best;
}
// le rayon contre une boîte orientée (cap autour de Y)
function rayonBoite(ox, oy, oz, dx, dy, dz, k) {
  const px = ox - k.cx, pz = oz - k.cz;
  const lx = px * k.c - pz * k.s, lz = px * k.s + pz * k.c, ly = oy - k.cy;
  const ex = dx * k.c - dz * k.s, ez = dx * k.s + dz * k.c, ey = dy;
  let t0 = 0, t1 = Infinity;
  for (let a = 0; a < 3; a++) {
    const o = a === 0 ? lx : a === 1 ? ly : lz, d = a === 0 ? ex : a === 1 ? ey : ez, h = a === 0 ? k.hx : a === 1 ? k.hy : k.hz;
    if (Math.abs(d) < 1e-12) { if (o < -h || o > h) return Infinity; continue; }
    let u = (-h - o) / d, w = (h - o) / d;
    if (u > w) { const q = u; u = w; w = q; }
    if (u > t0) t0 = u; if (w < t1) t1 = w;
    if (t0 > t1) return Infinity;
  }
  return t0;
}
// un volume, quel qu'il soit
export function rayonVolume(ox, oy, oz, dx, dy, dz, k) { return k.t === 'o' ? rayonBoite(ox, oy, oz, dx, dy, dz, k) : rayonCapsule(ox, oy, oz, dx, dy, dz, k); }

// LE PREMIER ACTEUR touché par le rayon O + t·D (D unitaire) avant `tMax`, sauf `sauf` : { acteur, zone, t } ou null.
// Pré-filtre : le rayon passe à moins de 1,1 m de l'axe vertical de l'acteur (un cylindre) et pas derrière l'origine.
const _vols = [];
export function rayonActeurs(acteurs, ox, oy, oz, dx, dy, dz, tMax, sauf, out) {
  let best = tMax, trouve = null, zone = null;
  const dh2 = dx * dx + dz * dz;
  for (let i = 0; i < acteurs.length; i++) {
    const a = acteurs[i];
    if (a === sauf || !a.vivant || !a.corps) continue;
    const p = a.corps.pos;
    const qx = p.x - ox, qz = p.z - oz;
    if (dh2 > 1e-12) {
      const tp = (qx * dx + qz * dz) / dh2;
      const cx = ox + dx * tp - p.x, cz = oz + dz * tp - p.z;
      if (cx * cx + cz * cz > 1.21) continue;
      if (tp * Math.sqrt(dh2) < -1.2) continue;
    } else if (qx * qx + qz * qz > 1.21) continue;
    capsules(a, _vols);
    for (let j = 0; j < _vols.length; j++) {
      const k = _vols[j];
      const t = k.t === 'o' ? rayonBoite(ox, oy, oz, dx, dy, dz, k) : rayonCapsule(ox, oy, oz, dx, dy, dz, k);
      if (t < best) { best = t; trouve = a; zone = k.zone; }
    }
  }
  if (!trouve) return null;
  out = out || { acteur: null, zone: null, t: 0 };
  out.acteur = trouve; out.zone = zone; out.t = best;
  return out;
}
