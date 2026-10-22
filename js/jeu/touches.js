// =====================================================================
//  LES BOÎTES DE TOUCHE — squelette du socle S0 (22/10), rempli par le lot L-A
// =====================================================================
// Où une balle touche un acteur, calculé depuis l'ÉTAT SIMULÉ (spec § 4.5.6, arbitrage 10) : jamais les os affichés —
// juste pour un bot posé à 4 Hz ou caché, et rejouable par l'hôte (la compensation de latence de demain). Pour une taille
// de 1,73 m (× h / 1,73) : tête sphère r 0,115 centrée à 1,635 · cou 1,42 → 1,55 r 0,06 · torse 1,12 → 1,42 r 0,165 ·
// ventre 0,90 → 1,12 r 0,155 · jambes 0,10 → 0,90 r 0,13 ; l'accroupi k abaisse ce qui est au-dessus des hanches de
// 0,54 k (la glissade de 0,77), le saut ajoute jumpY. (La tête avancée selon le cap et la vitesse : L-A.) Un prop : sa
// boîte orientée ; une cible du stand : un panneau (deux boîtes, buste et tête).

export const ZONES = ['tete', 'cou', 'torse', 'ventre', 'jambes'];
const HUMAIN = [
  { zone: 'tete', a: 1.635, b: 1.635, r: 0.115 },
  { zone: 'cou', a: 1.42, b: 1.55, r: 0.06 },
  { zone: 'torse', a: 1.12, b: 1.42, r: 0.165 },
  { zone: 'ventre', a: 0.90, b: 1.12, r: 0.155 },
  { zone: 'jambes', a: 0.10, b: 0.90, r: 0.13 },
];
const HANCHES = 0.90;

// les volumes de touche d'un acteur : [{ zone, t: 'c', ax, ay, az, bx, by, bz, r }] (capsules verticales) ou
// [{ zone, t: 'o', cx, cy, cz, hx, hy, hz, c, s }] (boîtes orientées, cap autour de Y)
export function capsules(acteur, out) {
  out = out || [];
  out.length = 0;
  const c = acteur.corps; if (!c) return out;
  const x = c.pos.x, y = c.pos.y + (c.jumpY || 0), z = c.pos.z;
  if (acteur.prop && acteur.prop.T) {
    const T = acteur.prop.T, b = T.boite, cap = acteur.prop.cap || 0;
    const hy = (b.max.y - b.min.y) / 2;
    out.push({ zone: 'torse', t: 'o', cx: x, cy: y + b.min.y + hy, cz: z, hx: (b.max.x - b.min.x) / 2, hy, hz: (b.max.z - b.min.z) / 2,
      c: Math.cos(cap), s: Math.sin(cap) });
    return out;
  }
  const e = acteur.h / 1.73;
  if (acteur.role === 'cible') {
    const cap = c.ang || 0, co = Math.cos(cap), si = Math.sin(cap);
    out.push({ zone: 'torse', t: 'o', cx: x, cy: y + 0.75 * e, cz: z, hx: 0.25 * e, hy: 0.65 * e, hz: 0.03, c: co, s: si });
    out.push({ zone: 'tete', t: 'o', cx: x, cy: y + 1.6 * e, cz: z, hx: 0.12 * e, hy: 0.14 * e, hz: 0.03, c: co, s: si });
    return out;
  }
  const bas = 0.54 * (acteur.accroupi || 0) + 0.77 * (acteur.glisse || 0) * (1 - (acteur.accroupi || 0));
  for (const H of HUMAIN) {
    const ka = H.a > HANCHES - 1e-6 ? bas : 0, kb = H.b > HANCHES - 1e-6 ? bas : 0;
    let ya = (H.a - ka) * e, yb = (H.b - kb) * e;
    if (H.zone === 'jambes') { yb = Math.max(ya + 0.15, (H.b - bas) * e); }
    out.push({ zone: H.zone, t: 'c', ax: x, ay: y + ya, az: z, bx: x, by: y + yb, bz: z, r: H.r * e });
  }
  return out;
}

// le rayon (O + t·D, D unitaire) contre une capsule : t d'entrée ou Infinity
function rayonCapsule(ox, oy, oz, dx, dy, dz, k) {
  // segment A-B, rayon r ; on cherche le plus petit t ≥ 0 tel que dist(P(t), [AB]) = r
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
  for (const [px, py, pz] of [[k.ax, k.ay, k.az], [k.bx, k.by, k.bz]]) {
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
  for (const [o, d, h] of [[lx, ex, k.hx], [ly, ey, k.hy], [lz, ez, k.hz]]) {
    if (Math.abs(d) < 1e-12) { if (o < -h || o > h) return Infinity; continue; }
    let a = (-h - o) / d, b = (h - o) / d;
    if (a > b) { const q = a; a = b; b = q; }
    if (a > t0) t0 = a; if (b < t1) t1 = b;
    if (t0 > t1) return Infinity;
  }
  return t0;
}

// LE PREMIER ACTEUR touché par le rayon O + t·D (D unitaire) avant `tMax`, sauf `sauf` : { acteur, zone, t } ou null.
// Pré-filtre : le rayon passe à moins de 1,1 m de l'axe vertical de l'acteur (un cylindre).
const _vols = [];
export function rayonActeurs(acteurs, ox, oy, oz, dx, dy, dz, tMax, sauf, out) {
  let best = tMax, trouve = null, zone = null;
  const dh = Math.hypot(dx, dz);
  for (const a of acteurs) {
    if (a === sauf || !a.vivant || !a.corps) continue;
    const p = a.corps.pos;
    // distance horizontale du rayon à l'axe de l'acteur
    const qx = p.x - ox, qz = p.z - oz;
    if (dh > 1e-9) {
      const tp = (qx * dx + qz * dz) / (dh * dh);
      const cx = ox + dx * tp - p.x, cz = oz + dz * tp - p.z;
      if (cx * cx + cz * cz > 1.21) continue;
      if (tp * Math.hypot(dx, dy, dz) < -1.2) continue;
    } else if (qx * qx + qz * qz > 1.21) continue;
    capsules(a, _vols);
    for (const k of _vols) {
      const t = k.t === 'o' ? rayonBoite(ox, oy, oz, dx, dy, dz, k) : rayonCapsule(ox, oy, oz, dx, dy, dz, k);
      if (t < best) { best = t; trouve = a; zone = k.zone; }
    }
  }
  if (!trouve) return null;
  out = out || { acteur: null, zone: null, t: 0 };
  out.acteur = trouve; out.zone = zone; out.t = best;
  return out;
}
