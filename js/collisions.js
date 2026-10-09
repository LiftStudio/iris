// =====================================================================
//  LES MURS : collisions du joueur et de la caméra (IRIS)
// =====================================================================
// LA CAGE était un terrain ouvert : un rectangle de jeu, quelques troncs et un gradin, que Player.move repoussait à la
// main. Une école, c'est l'inverse — des couloirs, des portes, des piliers, des murs partout. Ce module est le MONDE
// SOLIDE de la carte : les constructeurs de carte (js/carte_ecole.js) y déclarent leurs murs, et le joueur comme la
// caméra lui posent leurs questions.
//
// LES FORMES (toutes verticales, entre deux hauteurs y0 et y1 au-dessus du sol) :
//   boîte alignée sur les axes   { t: 'b', x0, z0, x1, z1 }            un mur droit, un comptoir, un plafond
//   boîte orientée              { t: 'o', cx, cz, hx, hz, a }          un mur en biais, un meuble tourné (a en radians,
//                                                                      de l'axe x+ vers l'axe z+, comme Object3D.rotation.y
//                                                                      au signe près : voir ajouterBoiteOrientee)
//   cercle                      { t: 'c', x, z, r }                    un pilier rond, un pied de table
// Options de chaque forme : `y0`, `y1` (hauteurs, par défaut 0 et l'infini), `joueur` (false : seule la caméra la
// voit — un plafond), `camera` (false : la caméra passe au travers — une vitre qu'on veut garder en vue, un grillage).
//
// LE JOUEUR est un disque de rayon r autour de ses pieds, qui occupe la hauteur [pieds + 0,25 ; pieds + 1,6] : un
// linteau de porte à 2,1 m ne l'arrête pas, même en sautant ; une marche de moins de 25 cm non plus (les escaliers
// viendront avec leur propre sol). Il est REPOUSSÉ hors de chaque forme qu'il touche, et sa vitesse perd seulement la
// composante qui rentrait dedans : il GLISSE le long des murs au lieu de s'y coller, comme dans LA CAGE contre les
// troncs et le gradin. Plusieurs passes par pas (un coin rentrant met deux murs en jeu à la fois).
// PAS DE TUNNEL : le déplacement d'un pas est découpé en sous-pas d'au plus la moitié du rayon. Le centre du disque ne
// peut donc jamais passer au-delà du milieu d'un mur, même fin (15 cm), même au sprint ou après une téléportation : la
// poussée le renvoie toujours du bon côté. (Au sprint, 7,2 m/s à 120 pas par seconde font 6 cm par pas : un seul
// sous-pas ; le découpage ne coûte que dans les cas extrêmes.)
// LES PORTES sont des OUVERTURES : `mur()` découpe le mur autour d'elles (deux jambages pleins, un linteau en haut).
// Rien n'est à « ouvrir » : on passe.
//
// LA CAMÉRA demande quelle part d'un segment (de la tête du joueur à la place voulue de la caméra) est libre, pour
// une petite sphère de rayon r (rayonLibre). Elle voit aussi les PLAFONDS (formes `joueur: false`), et plafondEn(x, z)
// lui donne la hauteur du plafond au-dessus d'un point.
//
// UNE GRILLE de cases de 2 m range les formes : une question ne regarde que les formes des cases qu'elle touche
// (quelques-unes), même quand la carte en compte des centaines — toute une école.
//
// LES FORMES MOBILES (les vantaux des portes qui s'ouvrent toutes seules, js/ecole_portes.js) : une forme dont `off`
// vaut vrai n'existe plus, ni pour le joueur ni pour la caméra. La porte la rallume quand elle se referme. Les hauteurs
// des formes sont ABSOLUES (au-dessus du sol du rez-de-chaussée, y = 0) : le joueur les compare à ses pieds réels, palier
// et marches compris.
//
// LES SOLS (l'escalier) : par défaut, le sol est à y = 0 partout. Une carte peut déclarer des DALLES (un palier à 1,75 m)
// et des RAMPES (une volée de marches, dont la pente passe par le milieu des marches : les pieds ne s'enfoncent ni ne
// flottent de plus d'une demi-contremarche). solEn(x, z, y) rend le sol le plus HAUT sous le point qui ne dépasse pas
// les pieds actuels de plus d'une marche (45 cm) : sous un palier, on reste au rez-de-chaussée ; sur une volée, on la suit.
// Les plafonds se lisent de même à une hauteur donnée (plafondEn(x, z, y)) : sur le palier du 1er étage, le plafond du
// hall en dessous ne compte plus.
// DEUX NIVEAUX (le 1er étage, js/ecole_etage1.js) : tout se superpose dans la même grille, chaque forme à ses hauteurs
// absolues. L'étage est une dalle à 3,50 m qui couvre tout ce qu'on y foule (un trou dans les dalles ferait retomber au
// rez-de-chaussée) ; ses murs partent de 3,50 m (le joueur d'en bas passe dessous) ; le dessous de son plancher est une
// forme pour la caméra seule (à l'étage, elle ne passe pas au travers du sol).
//
// DÉBOGAGE : ?debug=murs dans l'adresse dessine toutes les formes en fil de fer (js/game.js, afficherDebug).

import * as THREE from 'three';

const CASE = 2;                    // m : côté des cases de la grille
const PASSES = 4;                  // passes de résolution par sous-pas (coins rentrants)
const BAS_CORPS = 0.25, HAUT_CORPS = 1.6;   // la hauteur du corps qui heurte, au-dessus des pieds

const cle = (i, k) => (i + 32768) * 65536 + (k + 32768);

export class Collisions {
  constructor() {
    this.formes = [];
    this.grille = new Map();
    this.plafonds = [];            // { x0, z0, x1, z1, y } : le dessous de chaque plafond déclaré
    this.sols = [];                // { x0, z0, x1, z1, h } ou une rampe { ..., axe, a0, h0, a1, h1 } (voir solEn)
    this._tour = 0;
    this.stats = { requetes: 0 };
  }

  // ------------------------------------------------------------------ déclarer
  _ranger(f) {
    f.id = this.formes.length;
    f.y0 = f.y0 ?? 0; f.y1 = f.y1 ?? Infinity;
    f.joueur = f.joueur !== false; f.camera = f.camera !== false;
    f.tour = 0;
    this.formes.push(f);
    // la boîte englobante au sol
    let x0, z0, x1, z1;
    if (f.t === 'b') { x0 = f.x0; z0 = f.z0; x1 = f.x1; z1 = f.z1; }
    else if (f.t === 'c') { x0 = f.x - f.r; x1 = f.x + f.r; z0 = f.z - f.r; z1 = f.z + f.r; }
    else {
      const ex = Math.abs(f.c) * f.hx + Math.abs(f.s) * f.hz, ez = Math.abs(f.s) * f.hx + Math.abs(f.c) * f.hz;
      x0 = f.cx - ex; x1 = f.cx + ex; z0 = f.cz - ez; z1 = f.cz + ez;
    }
    f.bx0 = x0; f.bz0 = z0; f.bx1 = x1; f.bz1 = z1;
    for (let i = Math.floor(x0 / CASE); i <= Math.floor(x1 / CASE); i++) {
      for (let k = Math.floor(z0 / CASE); k <= Math.floor(z1 / CASE); k++) {
        const c = cle(i, k);
        let l = this.grille.get(c);
        if (!l) this.grille.set(c, l = []);
        l.push(f);
      }
    }
    return f;
  }
  // une boîte alignée sur les axes, de (x0, z0) à (x1, z1), dans n'importe quel ordre
  ajouterBoite(x0, z0, x1, z1, o = {}) {
    return this._ranger({ t: 'b', x0: Math.min(x0, x1), z0: Math.min(z0, z1), x1: Math.max(x0, x1), z1: Math.max(z0, z1), ...o });
  }
  // une boîte tournée : centre, demi-tailles, angle `a` de son axe local x vers l'axe z du monde (un objet three tourné
  // de rotation.y = θ a a = -θ)
  ajouterBoiteOrientee(cx, cz, hx, hz, a, o = {}) {
    return this._ranger({ t: 'o', cx, cz, hx, hz, a, c: Math.cos(a), s: Math.sin(a), ...o });
  }
  ajouterCercle(x, z, r, o = {}) { return this._ranger({ t: 'c', x, z, r, ...o }); }

  // UN MUR de (x0, z0) à (x1, z1), d'épaisseur `ep` centrée sur le trait, haut de `h`, percé d'`ouvertures` :
  //   [{ a: distance du début du mur au CENTRE de l'ouverture, l: largeur, h: hauteur (2,1 par défaut), bas: 0 }]
  // (`bas` > 0 : une fenêtre, avec son allège en dessous). Rend les morceaux PLEINS, pour que la carte y pose sa
  // géométrie exactement là où sont les collisions : [{ a0, a1, y0, y1 }] en distance le long du mur, plus `dir`
  // (unitaire), `long`, `ep`, et l'origine.
  mur(x0, z0, x1, z1, ep, { h = 2.7, ouvertures = [], camera = true } = {}) {
    const dx = x1 - x0, dz = z1 - z0, L = Math.hypot(dx, dz);
    const ux = dx / L, uz = dz / L;
    const ouv = ouvertures.map((o) => ({ a0: Math.max(0, o.a - o.l / 2), a1: Math.min(L, o.a + o.l / 2), bas: o.bas || 0, haut: Math.min(h, o.h ?? 2.1) }))
      .sort((p, q) => p.a0 - q.a0);
    const pleins = [];
    let a = 0;
    for (const o of ouv) {
      if (o.a0 > a + 1e-3) pleins.push({ a0: a, a1: o.a0, y0: 0, y1: h });
      if (o.haut < h - 1e-3) pleins.push({ a0: o.a0, a1: o.a1, y0: o.haut, y1: h });     // linteau
      if (o.bas > 1e-3) pleins.push({ a0: o.a0, a1: o.a1, y0: 0, y1: o.bas });          // allège
      a = Math.max(a, o.a1);
    }
    if (L > a + 1e-3) pleins.push({ a0: a, a1: L, y0: 0, y1: h });
    const axe = Math.abs(ux) < 1e-6 || Math.abs(uz) < 1e-6;
    for (const p of pleins) {
      const ax = x0 + ux * p.a0, az = z0 + uz * p.a0, bx = x0 + ux * p.a1, bz = z0 + uz * p.a1;
      const opt = { y0: p.y0, y1: p.y1, camera };
      if (axe) {
        // (mur aligné : boîte alignée, épaisseur de part et d'autre du trait)
        const nx = -uz * ep / 2, nz = ux * ep / 2;
        this.ajouterBoite(Math.min(ax, bx) - Math.abs(nx), Math.min(az, bz) - Math.abs(nz), Math.max(ax, bx) + Math.abs(nx), Math.max(az, bz) + Math.abs(nz), opt);
      } else {
        this.ajouterBoiteOrientee((ax + bx) / 2, (az + bz) / 2, (p.a1 - p.a0) / 2, ep / 2, Math.atan2(uz, ux), opt);
      }
    }
    return { x0, z0, ux, uz, long: L, ep, h, pleins, ouvertures: ouv };
  }

  // UN PLAFOND : son dessous à `y`, sur le rectangle donné. La caméra s'y arrête ; le joueur, jamais (il ne l'atteint pas).
  plafond(x0, z0, x1, z1, y, ep = 0.3) {
    const r = { x0: Math.min(x0, x1), z0: Math.min(z0, z1), x1: Math.max(x0, x1), z1: Math.max(z0, z1), y };
    this.plafonds.push(r);
    this.ajouterBoite(r.x0, r.z0, r.x1, r.z1, { y0: y, y1: y + ep, joueur: false });
    return r;
  }
  // la hauteur du plafond au-dessus de (x, z) — le plus bas de ceux qui le couvrent et qui sont plus haut que `yMin`
  // (les pieds du joueur : sur un palier, le plafond de l'étage du dessous ne compte pas) —, ou l'infini (dehors)
  plafondEn(x, z, yMin = -Infinity) {
    let y = Infinity;
    for (const p of this.plafonds) if (x >= p.x0 && x <= p.x1 && z >= p.z0 && z <= p.z1 && p.y < y && p.y > yMin) y = p.y;
    return y;
  }

  // ------------------------------------------------------------------ les sols
  // une DALLE à la hauteur h sur le rectangle
  sol(x0, z0, x1, z1, h) {
    const r = { x0: Math.min(x0, x1), z0: Math.min(z0, z1), x1: Math.max(x0, x1), z1: Math.max(z0, z1), h, axe: null };
    this.sols.push(r);
    return r;
  }
  // une RAMPE sur le rectangle : la hauteur va de h0 (à la coordonnée a0 le long de `axe`, 'x' ou 'z') à h1 (en a1),
  // bornée entre les deux
  rampe(x0, z0, x1, z1, axe, a0, h0, a1, h1) {
    const r = { x0: Math.min(x0, x1), z0: Math.min(z0, z1), x1: Math.max(x0, x1), z1: Math.max(z0, z1), axe, a0, h0, a1, h1 };
    this.sols.push(r);
    return r;
  }
  _hSol(r, x, z) {
    if (!r.axe) return r.h;
    const a = r.axe === 'x' ? x : z, t = Math.max(0, Math.min(1, (a - r.a0) / (r.a1 - r.a0)));
    return r.h0 + (r.h1 - r.h0) * t;
  }
  // le sol sous (x, z) pour des pieds à `y` : le plus haut de ceux qui le couvrent sans dépasser y + `marche` ; là où
  // aucun ne le couvre, le rez-de-chaussée (0). (Une dalle peut être plus basse que 0 : la chaussée, sous le trottoir.)
  solEn(x, z, y = 0, marche = 0.45) {
    let h = null;
    for (const r of this.sols) {
      if (x < r.x0 || x > r.x1 || z < r.z0 || z > r.z1) continue;
      const v = this._hSol(r, x, z);
      if (v <= y + marche && (h === null || v > h)) h = v;
    }
    return h ?? 0;
  }

  // les formes des cases qui touchent le rectangle (x0, z0)-(x1, z1), chacune une fois (rappel f(forme))
  _parcourir(x0, z0, x1, z1, f) {
    const tour = ++this._tour;
    const i0 = Math.floor(x0 / CASE), i1 = Math.floor(x1 / CASE), k0 = Math.floor(z0 / CASE), k1 = Math.floor(z1 / CASE);
    for (let i = i0; i <= i1; i++) {
      for (let k = k0; k <= k1; k++) {
        const l = this.grille.get(cle(i, k));
        if (!l) continue;
        for (let j = 0; j < l.length; j++) {
          const s = l[j];
          if (s.tour === tour) continue;
          s.tour = tour;
          if (s.bx1 < x0 || s.bx0 > x1 || s.bz1 < z0 || s.bz0 > z1) continue;
          f(s);
        }
      }
    }
  }

  // ------------------------------------------------------------------ le joueur
  // Le disque (pos.x, pos.z, r) sorti de toutes les formes qui le touchent. `vel` (facultatif) perd ce qui rentre dans
  // les murs. `pieds` : la hauteur ABSOLUE des pieds (le sol sous le joueur — une marche, un palier — plus le saut).
  // Rend vrai s'il y a eu contact.
  resoudre(pos, r, vel = null, pieds = 0) {
    const yb = pieds + BAS_CORPS, yh = pieds + HAUT_CORPS;
    let touche = false;
    for (let passe = 0; passe < PASSES; passe++) {
      let bouge = false;
      this._parcourir(pos.x - r, pos.z - r, pos.x + r, pos.z + r, (s) => {
        if (s.off || !s.joueur || s.y0 >= yh || s.y1 <= yb) return;
        const n = this._sortir(s, pos, r);
        if (!n) return;
        bouge = true; touche = true;
        if (vel) {
          const vn = vel.x * n.x + vel.z * n.z;
          if (vn < 0) { vel.x -= vn * n.x; vel.z -= vn * n.z; }
        }
      });
      if (!bouge) break;
    }
    this.stats.requetes++;
    return touche;
  }

  // Déplace le disque de (dx, dz) sans traverser : sous-pas d'au plus r/2, résolus un à un.
  deplacer(pos, dx, dz, r, vel = null, pieds = 0) {
    const L = Math.hypot(dx, dz), n = Math.max(1, Math.ceil(L / (r * 0.5)));
    let touche = false;
    for (let i = 0; i < n; i++) {
      pos.x += dx / n; pos.z += dz / n;
      if (this.resoudre(pos, r, vel, pieds)) touche = true;
    }
    return touche;
  }

  // Sort le disque de la forme `s` s'il la touche ; rend la normale de sortie (unitaire, au sol) ou null.
  _sortir(s, pos, r) {
    const N = this._n || (this._n = { x: 0, z: 0 });
    if (s.t === 'c') {
      const dx = pos.x - s.x, dz = pos.z - s.z, d = Math.hypot(dx, dz), R = s.r + r;
      if (!(d < R)) return null;                     // (écrit ainsi pour qu'un NaN éventuel sorte aussi)
      N.x = d > 1e-5 ? dx / d : 1; N.z = d > 1e-5 ? dz / d : 0;
      pos.x = s.x + N.x * R; pos.z = s.z + N.z * R;
      return N;
    }
    // boîte : dans son repère (alignée : le monde ; orientée : tourné de -a autour de son centre)
    let lx, lz, hx, hz;
    if (s.t === 'b') { hx = (s.x1 - s.x0) / 2; hz = (s.z1 - s.z0) / 2; lx = pos.x - (s.x0 + hx); lz = pos.z - (s.z0 + hz); }
    else { hx = s.hx; hz = s.hz; const dx = pos.x - s.cx, dz = pos.z - s.cz; lx = dx * s.c + dz * s.s; lz = -dx * s.s + dz * s.c; }
    // le point de la boîte le plus proche du centre du disque
    const qx = Math.max(-hx, Math.min(hx, lx)), qz = Math.max(-hz, Math.min(hz, lz));
    let ex = lx - qx, ez = lz - qz, d = Math.hypot(ex, ez), nlx, nlz, pen;
    if (d > 1e-6) {
      if (d >= r) return null;
      nlx = ex / d; nlz = ez / d; pen = r - d;
    } else {
      // le centre est DANS la boîte (ne devrait pas arriver avec les sous-pas) : on sort par la face la plus proche.
      // Jamais Math.sign : sur l'axe médian il rendrait 0, et le disque resterait planté dedans.
      const px = hx - Math.abs(lx), pz = hz - Math.abs(lz);
      if (px < pz) { nlx = lx >= 0 ? 1 : -1; nlz = 0; pen = px + r; } else { nlx = 0; nlz = lz >= 0 ? 1 : -1; pen = pz + r; }
    }
    if (s.t === 'b') { N.x = nlx; N.z = nlz; }
    else { N.x = nlx * s.c - nlz * s.s; N.z = nlx * s.s + nlz * s.c; }
    pos.x += N.x * pen; pos.z += N.z * pen;
    return N;
  }

  // Le disque est-il libre ici (sans le bouger) ? Pour poser le joueur au départ, ou vérifier une sortie de siège.
  libre(x, z, r, pieds = 0) {
    const p = { x, z };
    const avant = { x, z };
    this.resoudre(p, r, null, pieds);
    return Math.hypot(p.x - avant.x, p.z - avant.z) < 1e-4;
  }

  // ------------------------------------------------------------------ la caméra
  // La part libre du segment A -> B pour une sphère de rayon r : 1 = rien sur le chemin, 0 = bloquée dès A. Les formes
  // dans lesquelles A se trouve déjà sont ignorées (on ne colle jamais la caméra dans la tête du joueur).
  rayonLibre(ax, ay, az, bx, by, bz, r = 0.2) {
    let tMin = 1;
    const dx = bx - ax, dy = by - ay, dz = bz - az;
    this._parcourir(Math.min(ax, bx) - r, Math.min(az, bz) - r, Math.max(ax, bx) + r, Math.max(az, bz) + r, (s) => {
      if (!s.camera || s.off) return;
      const t = this._segment(s, ax, ay, az, dx, dy, dz, r);
      if (t < tMin) tMin = t;
    });
    return Math.max(0, tMin);
  }

  // entrée du segment A + t·D (t de 0 à 1) dans la forme grossie de r ; 1 si pas d'entrée (ou A déjà dedans)
  _segment(s, ax, ay, az, dx, dy, dz, r) {
    let t0 = 0, t1 = 1;
    // la tranche verticale
    const slab = (o, d, lo, hi) => {
      if (Math.abs(d) < 1e-9) return o >= lo && o <= hi;
      let a = (lo - o) / d, b = (hi - o) / d;
      if (a > b) { const c = a; a = b; b = c; }
      if (a > t0) t0 = a;
      if (b < t1) t1 = b;
      return t0 <= t1;
    };
    const y0 = s.y0 - r, y1 = s.y1 + r;
    if (s.t === 'c') {
      if (!slab(ay, dy, y0, y1)) return 1;
      // cylindre vertical : |(A + tD) - C|² = R² dans le plan
      const R = s.r + r, ox = ax - s.x, oz = az - s.z;
      const a = dx * dx + dz * dz, b = 2 * (ox * dx + oz * dz), c = ox * ox + oz * oz - R * R;
      if (c <= 0) return 1;                         // A dedans : ignorée
      if (a < 1e-12) return 1;
      const disc = b * b - 4 * a * c;
      if (disc < 0) return 1;
      const q = Math.sqrt(disc), e = (-b - q) / (2 * a), f = (-b + q) / (2 * a);
      const lo = Math.max(t0, e), hi = Math.min(t1, f);
      if (lo > hi || lo > 1 || hi < 0) return 1;
      return Math.max(0, lo);
    }
    let lx, lz, ldx, ldz, hx, hz;
    if (s.t === 'b') {
      hx = (s.x1 - s.x0) / 2; hz = (s.z1 - s.z0) / 2;
      lx = ax - (s.x0 + hx); lz = az - (s.z0 + hz); ldx = dx; ldz = dz;
    } else {
      hx = s.hx; hz = s.hz;
      const ox = ax - s.cx, oz = az - s.cz;
      lx = ox * s.c + oz * s.s; lz = -ox * s.s + oz * s.c;
      ldx = dx * s.c + dz * s.s; ldz = -dx * s.s + dz * s.c;
    }
    // A déjà dans la forme grossie : ignorée
    if (Math.abs(lx) <= hx + r && Math.abs(lz) <= hz + r && ay >= y0 && ay <= y1) return 1;
    if (!slab(lx, ldx, -hx - r, hx + r)) return 1;
    if (!slab(lz, ldz, -hz - r, hz + r)) return 1;
    if (!slab(ay, dy, y0, y1)) return 1;
    return t0 <= 1 ? Math.max(0, t0) : 1;
  }

  // ------------------------------------------------------------------ débogage
  // Toutes les formes en fil de fer (vert : murs du joueur ; bleu : caméra seule — plafonds ; magenta : les sols, dalles
  // et rampes). Une forme sans hauteur (y1 infini) est coupée à `hMax` au-dessus de son pied : celles de l'étage se
  // dessinent à leur étage.
  afficherDebug(scene, hMax = 3.2) {
    const g = new THREE.Group(); g.name = 'collisions (débogage)';
    const mJ = new THREE.LineBasicMaterial({ color: 0x33ff66, depthTest: false, transparent: true, opacity: 0.8 });
    const mC = new THREE.LineBasicMaterial({ color: 0x3399ff, depthTest: false, transparent: true, opacity: 0.6 });
    const mS = new THREE.LineBasicMaterial({ color: 0xff44cc, depthTest: false, transparent: true, opacity: 0.7 });
    for (const r of this.sols) {
      // (une dalle : son rectangle à sa hauteur ; une rampe : le rectangle incliné, du bas au haut de la volée)
      const h = (x, z) => this._hSol(r, x, z), p = [[r.x0, r.z0], [r.x1, r.z0], [r.x1, r.z1], [r.x0, r.z1], [r.x0, r.z0]];
      const geo = new THREE.BufferGeometry().setFromPoints(p.map(([x, z]) => new THREE.Vector3(x, h(x, z) + 0.01, z)));
      const l = new THREE.Line(geo, mS); l.renderOrder = 999; g.add(l);
    }
    for (const s of this.formes) {
      const y0 = Math.max(-0.05, s.y0), y1 = Math.min(Math.max(hMax, y0 + hMax), s.y1), h = Math.max(0.02, y1 - y0);
      let geo, m;
      if (s.t === 'c') { geo = new THREE.CylinderGeometry(s.r, s.r, h, 16, 1, true); m = new THREE.Object3D(); m.position.set(s.x, y0 + h / 2, s.z); }
      else if (s.t === 'b') { geo = new THREE.BoxGeometry(s.x1 - s.x0, h, s.z1 - s.z0); m = new THREE.Object3D(); m.position.set((s.x0 + s.x1) / 2, y0 + h / 2, (s.z0 + s.z1) / 2); }
      else { geo = new THREE.BoxGeometry(2 * s.hx, h, 2 * s.hz); m = new THREE.Object3D(); m.position.set(s.cx, y0 + h / 2, s.cz); m.rotation.y = -s.a; }
      const l = new THREE.LineSegments(new THREE.EdgesGeometry(geo), s.joueur ? mJ : mC);
      l.position.copy(m.position); l.rotation.copy(m.rotation); l.renderOrder = 999;
      geo.dispose();
      g.add(l);
    }
    g.userData.dynamique = true;           // hors des photos du décor (carte d'environnement, ombres cuites)
    scene.add(g);
    return g;
  }
}
