// =====================================================================
//  LA BALISTIQUE — les balles, la vue des bots et le vol des grenades sur le MONDE SOLIDE (lot L-A, 23/10)
// =====================================================================
// Spec §§ 3.3, 3.7, 4.5.6. Jamais le lanceur de rayons de three sur la scène (19 ms le rayon, 650 000 triangles) : les
// questions se posent aux FORMES de js/collisions.js (1 466 prismes verticaux rangés dans une grille de cases de 2 m), aux
// 53 SOLS (41 dalles, 12 rampes d'escalier) et au plan y = 0 là où aucun sol ne le remplace — la règle de `solEn`.
//
// LE PARCOURS (DDA de la grille, carte_monde § 6, étendu) : les cases que le segment traverse, DANS L'ORDRE (Amanatides et
// Woo sur la projection au sol), chaque forme testée une fois (marque `C._tour`, incrémentée ICI, jamais dans le rappel
// d'une autre question — `_parcourir` n'est pas réentrant, collisions.js l. 191) ; on garde le PLUS PROCHE impact et l'on
// s'arrête dès qu'il précède la sortie de la case courante (une forme rangée dans plusieurs cases est vue une fois, son
// entrée calculée en entier). Les sols passent AVANT la grille : leur meilleur t borne le parcours (un tir vers le bas
// s'arrête à la dalle sans lire une case de plus). Une forme qui CONTIENT déjà l'origine est ignorée, comme pour
// `rayonLibre` (piège 10 : l'origine est l'ŒIL, au centre du corps, à 0,3 m des murs ; jamais le bout du canon).
// La normale est celle de la face d'entrée (la tranche qui a donné l'entrée ; un cylindre : radiale, ou son couvercle) ;
// une rampe : la normale de son plan incliné, tournée vers le tireur.
//
// TROIS MANIÈRES de traverser le monde (`MODE`) :
//   - `balle` : toutes les formes, `joueur` ET `camera` (les ≈ 75 formes « joueur seul » — jardinières, bacs, vélos de la
//     rue, le « jour » de l'escalier — arrêtent les balles : piège 8), sauf `off` et `balle === false` ; une VITRE (claire
//     ou dépolie) ne l'arrête pas : elle est TRAVERSÉE (× 0,8 sur les dégâts, une fêlure), on la note et l'on continue ;
//   - `vue` : les formes `camera` seulement (`camera: false`, `off`, `balle === false` ignorés), les vitres CLAIRES ignorées
//     (on voit au travers), une vitre `depoli` ARRÊTE la vue (§ 3.3 : jours dépolis, cloisons de verre opaque ; drapeau
//     posé par js/jeu/monde_partie.js, L-M) — précédée du PRÉ-FILTRE des zones (ci-dessous) ;
//   - `objet` : tout ce qui est solide pour un projectile (les grenades rebondissent sur les vitres ; les murs protègent
//     d'une explosion) — comme `balle`, mais une vitre arrête.
//
// LE PRÉ-FILTRE de `vue` (§ 3.7, 2 µs au lieu de 8) : js/ecole_visibilite.js dit, pour la caméra posée en A, les zones
// de l'école qu'on ne peut PAS voir de là (`zonesCachees`, tirées d'un relevé de 14 966 positions) ; si la zone de B
// (`zoneDe`) en est, B est caché sans parcours. Il n'a le droit de dire « caché » que là où il a été VALIDÉ : une paire de
// zones où il a menti (une ligne de vue que le parcours brut dit libre) va dans EXCEPTIONS_PREFILTRE, où l'on passe
// directement au parcours (test « pré-filtre » de js/jeu/tests/test_armes.js, et F2 sur les nœuds du vrai graphe).
import { zoneDe, zonesCachees, ZONE, DEHORS } from '../ecole_visibilite.js';
import { MEUBLES } from '../registre_meubles.js';
import { rayonActeurs } from './touches.js';

const CASE = 2;                                   // m : les cases de la grille du monde solide (collisions.js l. 57)
const cleCase = (i, k) => (i + 32768) * 65536 + (k + 32768);
const EPS = 1e-12, EPS_T = 1e-6;
export const MODE = { balle: 0, vue: 1, objet: 2 };

// LES PAIRES DE ZONES où le pré-filtre a menti ('zoneDeA|zoneDeB', noms de js/ecole_visibilite.js ZONES) : on y passe
// directement au parcours. Relevées le 23/10 (test 19 de js/jeu/tests/test_armes.js) sur 10 000 paires de points libres que
// le parcours brut dit visibles, portes automatiques ouvertes — le combat les tient ouvertes, le prop hunt les ouvre pour
// tous : les PIÈCES FERMÉES du rez-de-chaussée (`FERMEES` du rendu : r0wc les toilettes, r0lt le local et le PMR, r0si la
// salle David Clark et son entrée, r0sv la Si 0.1) se voient alors de plus de 8 m de leur porte, la distance des règles du
// rendu. Trouvées : r0|r0si (29 sur 10 000), rue|r0si (4), r0|r0sv (4) ; gardées pour les quatre pièces, vues de toutes les
// zones d'où l'on voit le rez-de-chaussée (le relevé suivant, sur les nœuds du vrai graphe, est à F2)
const FERMEES_R0 = ['r0wc', 'r0lt', 'r0si', 'r0sv'], VOIENT_R0 = ['r0', 'rue', 'r0e', 'cageO0', 'cageE0', 'tremie0'];
export const EXCEPTIONS_PREFILTRE = new Set(VOIENT_R0.flatMap((a) => FERMEES_R0.map((b) => a + '|' + b)));

// le nom d'une zone de rendu (un bit de ecole_visibilite.js ZONE), pour les clés des exceptions
const NOMS = new Map(Object.entries(ZONE).map(([n, b]) => [b, n]));
NOMS.set(DEHORS, 'dehors');
export const nomZone = (bit) => NOMS.get(bit) || String(bit);

// la normale de la dernière entrée calculée (une seule à la fois : les questions ne s'imbriquent pas)
const N = { x: 0, y: 0, z: 0 };

// L'ENTRÉE du rayon O + t·D (D unitaire) dans la forme `s`, avant tMax : t, ou Infinity ; N = la normale de la face
// d'entrée. Une forme qui contient déjà O est ignorée.
function entree(s, ox, oy, oz, dx, dy, dz, tMax) {
  let t0 = -Infinity, t1 = Infinity, axe = -1, dedans = true;
  // la tranche verticale (hauteurs absolues)
  if (dy > EPS || dy < -EPS) {
    let a = (s.y0 - oy) / dy, b = (s.y1 - oy) / dy;
    if (a > b) { const q = a; a = b; b = q; }
    if (a > 0) dedans = false;
    t0 = a; t1 = b; axe = 1;
    if (t1 < 0 || t0 >= tMax) return Infinity;              // (une forme d'un autre niveau : rejetée tout de suite)
  } else if (oy < s.y0 || oy > s.y1) return Infinity;
  if (s.t === 'c') {
    // le cylindre vertical : |(O + tD) − C|² = r² dans le plan
    const px = ox - s.x, pz = oz - s.z, A = dx * dx + dz * dz, c = px * px + pz * pz - s.r * s.r;
    let e = -Infinity, f = Infinity;
    if (A > EPS) {
      const B = px * dx + pz * dz, disc = B * B - A * c;
      if (disc < 0) return Infinity;
      const q = Math.sqrt(disc);
      e = (-B - q) / A; f = (-B + q) / A;
      if (e > 0) dedans = false;
    } else if (c > 0) return Infinity;
    if (dedans && c <= 0) return Infinity;                    // (l'origine dans le cylindre)
    let entre = t0, sorti = t1, ax = axe;
    if (e > entre) { entre = e; ax = 3; }
    if (f < sorti) sorti = f;
    if (entre > sorti || sorti < 0 || entre >= tMax) return Infinity;
    if (ax === 3) {
      const hx = px + dx * entre, hz = pz + dz * entre, n = Math.hypot(hx, hz) || 1;
      N.x = hx / n; N.y = 0; N.z = hz / n;
    } else { N.x = 0; N.y = dy > 0 ? -1 : 1; N.z = 0; }
    return entre < 0 ? 0 : entre;
  }
  // une boîte : dans son repère (alignée : le monde recentré ; orientée : tournée de −a autour de son centre)
  let lx, lz, ldx, ldz, hx, hz;
  if (s.t === 'b') {
    hx = (s.x1 - s.x0) / 2; hz = (s.z1 - s.z0) / 2;
    lx = ox - (s.x0 + hx); lz = oz - (s.z0 + hz); ldx = dx; ldz = dz;
  } else {
    hx = s.hx; hz = s.hz;
    const px = ox - s.cx, pz = oz - s.cz;
    lx = px * s.c + pz * s.s; lz = -px * s.s + pz * s.c;
    ldx = dx * s.c + dz * s.s; ldz = -dx * s.s + dz * s.c;
  }
  if (ldx > EPS || ldx < -EPS) {
    let a = (-hx - lx) / ldx, b = (hx - lx) / ldx;
    if (a > b) { const q = a; a = b; b = q; }
    if (a > 0) dedans = false;
    if (a > t0) { t0 = a; axe = 0; }
    if (b < t1) t1 = b;
  } else if (lx < -hx || lx > hx) return Infinity;
  if (ldz > EPS || ldz < -EPS) {
    let a = (-hz - lz) / ldz, b = (hz - lz) / ldz;
    if (a > b) { const q = a; a = b; b = q; }
    if (a > 0) dedans = false;
    if (a > t0) { t0 = a; axe = 2; }
    if (b < t1) t1 = b;
  } else if (lz < -hz || lz > hz) return Infinity;
  if (dedans) return Infinity;
  if (t0 > t1 || t1 < 0 || t0 >= tMax) return Infinity;
  if (axe === 1) { N.x = 0; N.y = dy > 0 ? -1 : 1; N.z = 0; }
  else {
    const nlx = axe === 0 ? (ldx > 0 ? -1 : 1) : 0, nlz = axe === 2 ? (ldz > 0 ? -1 : 1) : 0;
    if (s.t === 'b') { N.x = nlx; N.z = nlz; } else { N.x = nlx * s.c - nlz * s.s; N.z = nlx * s.s + nlz * s.c; }
    N.y = 0;
  }
  return t0 < 0 ? 0 : t0;
}

// le plan y = 0 du rez-de-chaussée, là où `solEn` le rend faute d'un sol plus pertinent (un objet pour `h.sol`)
const PLAN_0 = { plan0: true };

export class Balistique {
  constructor(collisions) {
    this.C = collisions;
    this.prefiltre = true;           // (les tests le coupent pour la référence brute)
    // les vitres traversées par le dernier parcours en mode `balle` : [{ t, forme, nx, ny, nz }] (les `nv` premières)
    this._vt = []; this.nv = 0;
    this._h = { t: 0, forme: null, sol: null, nx: 0, ny: 0, nz: 0 };
    this._m = {}; this._cibles = []; this._hA = { acteur: null, zone: null, t: 0 };
    this.stats = { rayons: 0, formes: 0, vues: 0, prefiltrees: 0 };
  }

  // ------------------------------------------------------------------ le parcours
  // Le premier obstacle du rayon O + t·D (D unitaire) avant `portee`, selon `mode` : rend t (`portee` si rien) et
  // remplit `h` = { t, forme, sol, nx, ny, nz } (forme : la forme touchée ; sol : la dalle ou la rampe, ou PLAN_0)
  rayon(ox, oy, oz, dx, dy, dz, portee, mode, h) {
    const C = this.C;
    h = h || this._h;
    h.forme = null; h.sol = null; h.nx = -dx; h.ny = -dy; h.nz = -dz;
    this.nv = 0; this.stats.rayons++;
    let best = this._sols(ox, oy, oz, dx, dy, dz, portee, h);
    // LA GRILLE, case après case
    const tour = ++C._tour;
    let i = Math.floor(ox / CASE), k = Math.floor(oz / CASE);
    const si = dx > 0 ? 1 : -1, sk = dz > 0 ? 1 : -1;
    const tdx = dx > EPS || dx < -EPS ? CASE / Math.abs(dx) : Infinity, tdz = dz > EPS || dz < -EPS ? CASE / Math.abs(dz) : Infinity;
    let tmx = tdx < Infinity ? ((si > 0 ? (i + 1) * CASE : i * CASE) - ox) / dx : Infinity;
    let tmz = tdz < Infinity ? ((sk > 0 ? (k + 1) * CASE : k * CASE) - oz) / dz : Infinity;
    const G = C.grille;
    for (let n = 0; n < 4096; n++) {
      const l = G.get(cleCase(i, k));
      if (l) {
        for (let j = 0; j < l.length; j++) {
          const s = l[j];
          if (s.tour === tour) continue;
          s.tour = tour;
          if (s.off || s.balle === false) continue;
          let traverse = false;
          if (mode === 1) { if (!s.camera || (s.vitre && !s.depoli)) continue; }
          else if (mode === 0 && s.vitre) traverse = true;
          this.stats.formes++;
          const t = entree(s, ox, oy, oz, dx, dy, dz, best);
          if (t >= best) continue;
          if (traverse) {
            const v = this._vt[this.nv] || (this._vt[this.nv] = { t: 0, forme: null, nx: 0, ny: 0, nz: 0 });
            v.t = t; v.forme = s; v.nx = N.x; v.ny = N.y; v.nz = N.z; this.nv++;
            continue;
          }
          best = t; h.forme = s; h.sol = null; h.nx = N.x; h.ny = N.y; h.nz = N.z;
        }
      }
      const sortie = tmx < tmz ? tmx : tmz;
      if (best <= sortie || sortie >= portee) break;
      if (tmx < tmz) { tmx += tdx; i += si; } else { tmz += tdz; k += sk; }
    }
    // (les vitres notées au-delà de l'impact retenu ne comptent pas ; les autres, rangées par distance)
    if (this.nv) {
      let m = 0;
      for (let j = 0; j < this.nv; j++) if (this._vt[j].t < best) { const q = this._vt[m]; this._vt[m] = this._vt[j]; this._vt[j] = q; m++; }
      this.nv = m;
      for (let a = 1; a < m; a++) for (let b = a; b > 0 && this._vt[b].t < this._vt[b - 1].t; b--) { const q = this._vt[b]; this._vt[b] = this._vt[b - 1]; this._vt[b - 1] = q; }
    }
    h.t = best;
    return best;
  }

  // LES SOLS : les dalles (plans horizontaux bornés), les rampes (une volée : la hauteur va de h0 en a0 à h1 en a1 le long
  // de son axe, bornée — un plan incliné entre deux paliers plats), puis le plan y = 0 là où `solEn(x, z, 0,1)` le rend (là
  // où aucun sol ne couvre le point — dans la rue, au rez-de-chaussée sans −1 dessous —, carte_monde § 6). Un sol arrête
  // des deux côtés (dessous : un plafond). Rend le meilleur t (≤ tMax).
  _sols(ox, oy, oz, dx, dy, dz, tMax, h) {
    const S = this.C.sols;
    let best = tMax;
    for (let j = 0; j < S.length; j++) {
      const r = S[j];
      let ta = 0, tb = best;
      if (dx > EPS || dx < -EPS) {
        let a = (r.x0 - ox) / dx, b = (r.x1 - ox) / dx;
        if (a > b) { const q = a; a = b; b = q; }
        if (a > ta) ta = a; if (b < tb) tb = b;
      } else if (ox < r.x0 || ox > r.x1) continue;
      if (dz > EPS || dz < -EPS) {
        let a = (r.z0 - oz) / dz, b = (r.z1 - oz) / dz;
        if (a > b) { const q = a; a = b; b = q; }
        if (a > ta) ta = a; if (b < tb) tb = b;
      } else if (oz < r.z0 || oz > r.z1) continue;
      if (ta > tb) continue;
      if (!r.axe) {
        if (dy < EPS && dy > -EPS) continue;
        const t = (r.h - oy) / dy;
        if (t > EPS_T && t >= ta && t <= tb && t < best) { best = t; h.sol = r; h.forme = null; h.nx = 0; h.ny = dy > 0 ? -1 : 1; h.nz = 0; }
        continue;
      }
      // une rampe : f(t) = y(t) − H(t), linéaire par morceaux (coupée où u = 0 et u = 1)
      const L = r.a1 - r.a0;
      if (Math.abs(L) < 1e-9) continue;
      const A0 = r.axe === 'x' ? ox : oz, dA = r.axe === 'x' ? dx : dz;
      const u0 = (A0 - r.a0) / L, du = dA / L, dh = r.h1 - r.h0;
      let p0 = ta, p1 = tb, p2 = tb, p3 = tb;
      if (du > EPS || du < -EPS) {
        let c0 = -u0 / du, c1 = (1 - u0) / du;
        if (c0 > c1) { const q = c0; c0 = c1; c1 = q; }
        p1 = c0 > ta && c0 < tb ? c0 : ta; p2 = c1 > ta && c1 < tb ? c1 : p1;
        if (p2 < p1) p2 = p1;
      }
      for (let m = 0; m < 3; m++) {
        const p = m === 0 ? p0 : m === 1 ? p1 : p2, q = m === 0 ? p1 : m === 1 ? p2 : p3;
        if (q - p < 1e-12) continue;
        const um = u0 + du * (p + q) / 2;
        let c0, c1, k = 0;
        if (um <= 0) { c0 = oy - r.h0; c1 = dy; }
        else if (um >= 1) { c0 = oy - r.h1; c1 = dy; }
        else { c0 = oy - r.h0 - dh * u0; c1 = dy - dh * du; k = dh / L; }
        const fp = c0 + c1 * p, fq = c0 + c1 * q;
        let t = Infinity;
        if (fp === 0 && p > EPS_T) t = p;
        else if ((fp < 0 && fq > 0) || (fp > 0 && fq < 0)) t = p + fp / (fp - fq) * (q - p);
        else if (fq === 0) t = q;
        if (t > EPS_T && t < best) {
          best = t; h.sol = r; h.forme = null;
          let nx = r.axe === 'x' ? -k : 0, nz = r.axe === 'z' ? -k : 0, ny = 1;
          const n = Math.hypot(nx, ny, nz); nx /= n; ny /= n; nz /= n;
          if (nx * dx + ny * dy + nz * dz > 0) { nx = -nx; ny = -ny; nz = -nz; }
          h.nx = nx; h.ny = ny; h.nz = nz;
          break;
        }
      }
    }
    // le plan y = 0
    if (dy > EPS || dy < -EPS) {
      const t = -oy / dy;
      if (t > EPS_T && t < best) {
        const x = ox + dx * t, z = oz + dz * t;
        if (this.C.solEn(x, z, 0.1) === 0) { best = t; h.sol = PLAN_0; h.forme = null; h.nx = 0; h.ny = dy > 0 ? -1 : 1; h.nz = 0; }
      }
    }
    return best;
  }

  // la matière d'un impact (pour les effets et les sons) : 'sol' | 'plafond' | 'vitre' | 'meuble' | 'mur'
  matiere(h) {
    if (h.sol) return h.ny < -0.5 ? 'plafond' : 'sol';
    const s = h.forme;
    if (!s) return 'rien';
    if (s.vitre) return 'vitre';
    if (!s.joueur && h.ny < -0.5) return 'plafond';
    if (MEUBLES.parForme.has(s) || s.meuble) return 'meuble';
    return 'mur';
  }

  // ------------------------------------------------------------------ les trois questions du contrat
  // LA LIGNE DE VUE A → B : le pré-filtre des zones (sauf pour une paire d'EXCEPTIONS_PREFILTRE), puis le parcours en mode
  // `vue`. Vrai = rien entre les deux.
  vue(ax, ay, az, bx, by, bz) {
    const dx = bx - ax, dy = by - ay, dz = bz - az, L = Math.sqrt(dx * dx + dy * dy + dz * dz);
    this.stats.vues++;
    if (L < 1e-6) return true;
    if (this.prefiltre && this.cacheParZones(ax, ay, az, bx, by, bz)) { this.stats.prefiltrees++; return false; }
    return this.rayon(ax, ay, az, dx / L, dy / L, dz / L, L, 1, this._h) >= L - 1e-6;
  }
  // le pré-filtre seul : vrai si la zone de B est cachée de A selon les règles du rendu (et que la paire n'est pas une exception)
  cacheParZones(ax, ay, az, bx, by, bz) {
    const zb = zoneDe(bx, -bz, by);
    if (zb === DEHORS) return false;
    if (!(zonesCachees(ax, ay, az) & zb)) return false;
    return !(EXCEPTIONS_PREFILTRE.size && EXCEPTIONS_PREFILTRE.has(nomZone(zoneDe(ax, -az, ay)) + '|' + nomZone(zb)));
  }
  // UNE BALLE dans le monde : { t, x, y, z, nx, ny, nz, mat, forme, vitre } — mat 'rien' : rien avant `portee` ; `vitre` :
  // la première vitre traversée (ou null), `vitres` leur nombre (elles sont dans this._vt jusqu'au parcours suivant)
  balle(ax, ay, az, dx, dy, dz, portee, out) {
    out = out || {};
    const h = this._h, t = this.rayon(ax, ay, az, dx, dy, dz, portee, 0, h);
    out.t = t; out.x = ax + dx * t; out.y = ay + dy * t; out.z = az + dz * t;
    out.nx = h.nx; out.ny = h.ny; out.nz = h.nz;
    out.mat = h.forme || h.sol ? this.matiere(h) : 'rien';
    out.forme = h.forme; out.sol = h.sol;
    out.vitre = this.nv ? this._vt[0].forme : null; out.vitres = this.nv;
    return out;
  }
  // LA LIGNE LIBRE pour un objet (grenade, souffle d'une explosion) : vrai si rien de solide entre A et B (vitres comprises)
  libre(ax, ay, az, bx, by, bz) {
    const dx = bx - ax, dy = by - ay, dz = bz - az, L = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (L < 1e-6) return true;
    return this.rayon(ax, ay, az, dx / L, dy / L, dz / L, L, 2, this._h) >= L - 1e-6;
  }
  // UN TIR : le monde, puis les acteurs avant l'impact (rayonActeurs : préfiltre cylindre 1,1 m, puis les capsules
  // SIMULÉES), le plus proche gagne ; `out` = { acteur, zone, t, x, y, z, nx, ny, nz, mat, forme, traverse }. Les balles
  // TRAVERSENT les alliés (§ 3.5 : seuls les ennemis du tireur sont des cibles, partie.ennemis) et les vitres : `traverse`
  // vrai si une vitre (claire ou dépolie) précède le point d'arrivée — Partie.resoudreTir applique alors × 0,8 —, et une
  // FÊLURE est posée sur chacune (événement 'impact', mat 'vitre', `traverse: true` : les effets y mettent l'étoile et le
  // verre, les sons le tintement ; l'impact de la balle elle-même suit, par resoudreTir)
  tirer(partie, tireur, ox, oy, oz, dx, dy, dz, portee, out) {
    out = out || {};
    const m = this.balle(ox, oy, oz, dx, dy, dz, portee, this._m);
    const cibles = this._cibles;
    cibles.length = 0;
    for (const b of partie.acteurs) if (b !== tireur && b.vivant && b.corps && partie.ennemis(tireur, b)) cibles.push(b);
    const h = cibles.length ? rayonActeurs(cibles, ox, oy, oz, dx, dy, dz, m.t, tireur, this._hA) : null;
    const tFin = h ? h.t : m.t;
    let traverse = false;
    for (let j = 0; j < this.nv; j++) {
      const v = this._vt[j];
      if (v.t >= tFin) break;
      traverse = true;
      partie.evt('impact', { x: ox + dx * v.t, y: oy + dy * v.t, z: oz + dz * v.t, nx: v.nx, ny: v.ny, nz: v.nz, mat: 'vitre', forme: v.forme.id ?? null,
        plomb: 0, traverse: true });
    }
    if (h) {
      out.acteur = h.acteur; out.zone = h.zone; out.t = h.t;
      out.x = ox + dx * h.t; out.y = oy + dy * h.t; out.z = oz + dz * h.t;
      out.nx = -dx; out.ny = -dy; out.nz = -dz; out.mat = 'corps'; out.forme = null;
    } else {
      out.acteur = null; out.zone = null; out.t = m.t; out.x = m.x; out.y = m.y; out.z = m.z;
      out.nx = m.nx; out.ny = m.ny; out.nz = m.nz; out.mat = m.mat; out.forme = m.forme;
    }
    out.traverse = traverse;
    return out;
  }
}
