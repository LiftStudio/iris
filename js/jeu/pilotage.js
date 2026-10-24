// =====================================================================
//  LE PILOTAGE DES BOTS (lot L-D, 23/10 ; spec §§ 3.7, 4.5.11 ; LA CAGE js/ai.js l. 88-107 ; vague 3 : L-J)
// =====================================================================
// Le PILOTE mène un acteur vers un point par le graphe (js/jeu/nav.js). Il NE VISE PAS : le cerveau tient le lacet, le
// pilote donne l'AXE relatif à ce lacet (un bot qui vise court en pas chassés) — la commande, rien d'autre (ni position
// écrite, sauf le secours ci-dessous). Ce qu'il fait, dans l'ordre d'un pas :
//   - ARRIVÉE avec hystérésis (LA CAGE moveTo) : arrivé à `arret`, il ne repart qu'au-delà de `arret + marge` — sans cela
//     un bot posté oscille autour de son point, et l'animation avec lui ;
//   - le CHEMIN demandé à la file de la partie (`nav.demander` : il arrive à l'étape 9 du pas, une tranche de 1 500 nœuds)
//     quand la cible a sauté de plus d'un mètre ou glissé de plus de 1,5 m depuis la demande ; en attendant, l'ancien ;
//   - LA FICELLE TIRÉE par BALAYAGE `C.deplacer` (la même physique que le corps) jusqu'à 12 nœuds plus loin, toutes les
//     0,25 s, par dichotomie (4 balayages au plus), en suivant le sol tronçon par tronçon : un raccourci qui saute un bord
//     de palier (une descente de plus de 0,35 m) est refusé, un franchissement jamais sauté. (Avec des `libre()`
//     échantillonnés au lieu du balayage : 6 trajets sur 60 bloqués, carte_monde § 7.) Trajets 5 % plus courts ;
//   - l'ÉVITEMENT des autres corps à 0,6 m devant (un pas de côté, jamais vers un vide) ;
//   - le FACE-À-FACE dans un passage étroit (deux pilotes à moins de 1 m qui avancent l'un vers l'autre, sur des nœuds de
//     dégagement < 0,6 m — la volée de tôle fait 0,85 m) : celui de plus petit `id` recule jusqu'au nœud le plus proche de
//     dégagement ≥ 0,75 m qui ne le rapproche pas de l'autre, attend que l'autre soit passé (≥ 1,2 m, et qui s'éloigne),
//     puis reprend ;
//   - les liens « FRANCHIR » : aligné sur le lien (< 15°), le front `saut` à ≤ 0,6 m de l'obstacle (le franchissement
//     scripté est celui de js/jeu/mouvement.js) ; raté → le lien pénalisé, un autre chemin ;
//   - COINCÉ (moins de 0,6 m en 3 s alors qu'il veut avancer) : nouveau chemin, le lien où il bute pénalisé × 10 pendant
//     10 s ; au 2e coincement d'affilée, TÉLÉPORTÉ au dernier nœud sûr (à 1,5 m au moins en arrière) — SEULEMENT hors de la
//     vue du joueur local (le harnais compte les téléportations) ; sinon `coince` : le cerveau change d'idée.
// L'ERRANT est le cerveau d'essai (et la patrouille du cerveau minimal) : de PIÈCE en pièce — la moins visitée de la partie,
// tirée par la graine —, ou vers `vers(acteur)` (le point chaud), puis une ronde autour ; le regard dans la marche, lissé,
// et des coups d'œil quand il s'arrête. Fichier de SIMULATION : hasard semé, temps de la partie, aucune entrée.
import { Rng, melanger } from './rng.js';
import { pointsDe, piecesDe, POINTS_APPARITION } from './apparitions.js';
import { PIECES } from './constantes.js';
import { viderFronts } from './commande.js';

const FICELLE_T = 0.25, FICELLE_N = 12, MARGE_FICELLE = 0.08;
const PROCHE = 0.35;                       // un nœud est passé à 0,35 m
const COINCE_T = 3, COINCE_D = 0.6;        // § 4.5.11
const PENAL_T = 10;
const SECOURS_RECUL = 1.5;                 // le nœud sûr : à 1,5 m au moins en arrière
const EVITE = 0.6;
const FACE_D = 1.0, FACE_DEG = 0.6, REFUGE_DEG = 0.75, PASSE_D = 1.2, ATTENTE_MAX = 3;
const SAUT_FACE = 0.6, FRANCHIR_MAX = 1.6;
const SANS_FRANCHIR = { franchir: false };
const angle = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const _Q = { x: 0, z: 0 };

export class Pilote {
  constructor(acteur, nav, balistique) {
    this.acteur = acteur; this.nav = nav; this.balistique = balistique;
    this.partie = acteur.partie || null;
    this.cible = null; this.sprint = false; this.arret = 0.3; this.marge = 0.3;
    this._arrive = false; this._coince = false;
    this.chemin = []; this.k = 0; this.vise = 0;            // les nœuds ; le prochain à passer ; celui que vise la ficelle
    this._plan = null; this._attente = false; this._tPlan = -1; this._replan = false; this._direct = false;
    this._tFicelle = -1; this._ref = null; this._tRef = 0; this.coincements = 0; this.secours = 0;
    this._cheminVu = null; this._kMax = 0; this._tK = 0;
    this._surs = [];                                         // les derniers nœuds sûrs passés (le secours)
    this.mode = 'route'; this._refuge = null; this._autre = null; this._tAttente = 0;
    this._franchi = null;                                    // { de, a, t } : le franchissement en cours
    this._finBouchee = false;                                // la cible au-delà du dernier nœud est hors d'atteinte : le but est ce nœud
    this.dir = null;                                          // la direction voulue (monde, unitaire) : l'errant y met son regard
    this.cle = 'pilote:' + acteur.id;
    this.franchir = true;                                    // (faux : par la marche seule — l'errant)
  }
  // `o` = { sprint, arret = 0,3, marge = 0,3 } — appelé à chaque pas par le cerveau : la même cible ne replanifie rien
  allerA(x, y, z, o) {
    const { sprint = false, arret = 0.3, marge = 0.3 } = o || {};
    this.sprint = !!sprint; this.arret = arret; this.marge = marge;
    const c = this.cible;
    const saute = !c || Math.hypot(c.x - x, c.z - z) > 1.0 || Math.abs(c.y - y) > 1.2;
    if (!c) this.cible = { x, y, z }; else { c.x = x; c.y = y; c.z = z; }
    // (une cible qui SAUTE : l'ancien chemin est oublié — le suivre, c'était courir un pas vers l'ancien but puis faire
    // demi-tour quand le nouveau chemin arrive, à l'étape 9 du même pas)
    if (saute) {
      this._arrive = false; this._coince = false; this._finBouchee = false; this.coincements = 0; this._replan = true; this._tPlan = -1;
      this.chemin = []; this.k = 0; this.vise = 0; this._franchi = null;
      if (this._attente) { this._attente = false; if (this.nav && this.nav.annuler) this.nav.annuler(this.cle); }   // (la demande d'avant : caduque)
      if (this.mode !== 'route') this._finFace();
    }
    else if (this._plan && (Math.hypot(this._plan.x - x, this._plan.z - z) > 1.5 || Math.abs(this._plan.y - y) > 1.2)) this._replan = true;
  }
  stop() {
    this.cible = null; this._arrive = false; this._coince = false; this.chemin = []; this.k = 0; this.vise = 0; this._plan = null;
    this._attente = false; this._replan = false; this._direct = false; this._ref = null; this.dir = null; this._finBouchee = false; this._finFace();
    if (this.nav && this.nav.annuler) this.nav.annuler(this.cle);
  }
  get arrive() { return this._arrive; }
  get coince() { return this._coince; }
  get pos() { return this.acteur.corps && this.acteur.corps.pos; }
  get _C() { return (this.nav && this.nav.C) || (this.balistique && this.balistique.C) || null; }
  get _r() { return (this.nav && this.nav.rayon) || 0.3; }

  // ---------------------------------------------------------------- le pas
  pas(dt, cmd) {
    const a = this.acteur, P = this.partie, N = this.nav, c = this.cible, p = this.pos;
    cmd.ax = 0; cmd.ay = 0; cmd.amp = 0; cmd.sprint = false;
    this.dir = null;
    if (!c || !p) return;
    const t = P ? P.t : 0;
    if (N) N.t = t;
    // (DÉPLACÉ par quelqu'un d'autre — une réapparition, une téléportation du harnais — : plus d'un mètre depuis le dernier
    // pas, le chemin, les nœuds sûrs et la surveillance repartent de là ; sinon le secours le renverrait d'où il venait)
    const D = this._vu;
    if (D && Math.hypot(p.x - D.x, p.z - D.z) > 1 + Math.abs(p.y - D.y)) {
      this.chemin = []; this.k = 0; this.vise = 0; this._surs.length = 0; this._ref = null; this.coincements = 0; this._franchi = null;
      this._replan = true; this._tPlan = -1; this._arrive = false; this._finBouchee = false; if (this.mode !== 'route') this._finFace(false);
    }
    if (!D) this._vu = { x: p.x, y: p.y, z: p.z }; else { D.x = p.x; D.y = p.y; D.z = p.z; }
    // L'ARRIVÉE (hystérésis, sur le même sol) — à la cible, ou au dernier nœud quand la cible est BOUCHÉE (ci-dessous)
    const L0 = this.chemin, fin = this._finBouchee && L0.length ? L0[L0.length - 1] : -1;
    const bx = fin >= 0 ? N.px[fin] : c.x, by = fin >= 0 ? N.ph[fin] : c.y, bz = fin >= 0 ? N.pz[fin] : c.z;
    const memeSol = Math.abs(by - p.y) < 1.2, d = Math.hypot(bx - p.x, bz - p.z);
    if (this.mode === 'route') {
      if (this._arrive) { if (!(memeSol && d < this.arret + this.marge)) this._arrive = false; }
      else if (memeSol && d < this.arret) this._arrive = true;
      // (F2 : arrivé pendant un franchissement — la cible juste derrière la table — : il est RÉUSSI ; sinon seuls les ratés
      // étaient comptés, et à trois ratés tous les liens « franchir » de la partie coûtaient × 10 : test F2 de L-D)
      if (this._arrive && this._franchi && !this.acteur.franchit && !this.acteur.corps.airborne) { N.noterFranchir?.(true); this._franchi = null; }
      if (this._arrive) { this._ref = null; return; }
    }
    // LE CHEMIN
    if (this.mode === 'route' && this._replan && !this._attente && t >= this._tPlan) this._planifier(t);
    // (GELÉ — la présentation et le décompte, 6 s — ou mort : le chemin demandé, mais ni commande ni surveillance ; sinon il
    // se croyait coincé deux fois pendant le décompte, pénalisait ses liens et pouvait être téléporté au « GO ! »)
    if (a.gele || !a.vivant) { this._ref = null; this._tK = 0; return; }
    // LE FACE-À-FACE (le recul, l'attente)
    if (this.mode === 'attente') { this._attendre(dt, t); if (this.mode === 'attente') return; }
    if (this.mode === 'route') this._faceAFace(t);
    // LE POINT VISÉ
    let tx, tz;
    const L = this.chemin, nb = N && N.nb;
    if (this._direct || !nb || (!L.length && !this._attente)) { tx = c.x; tz = c.z; }
    else if (!L.length) return;                               // (le premier chemin arrive au pas prochain)
    else {
      // les nœuds passés
      while (this.k < L.length && this._passe(L[this.k], p)) { this._noterSur(L[this.k], p); this.k++; }
      // (un franchissement en cours dont l'arrivée est passée : réussi)
      if (this._franchi && this.k > this._franchi.iv) { N.noterFranchir?.(true); this._franchi = null; }
      // (poussé plus loin sur le chemin sans être passé à 0,35 m d'un nœud — par un autre corps, un mur qui fait glisser :
      // il reprend au nœud qu'il touche, jusqu'à 12 devant ; sinon la ficelle le ramènerait en arrière)
      for (let j = Math.min(L.length - 1, this.k + FICELLE_N); j > this.k; j--) if (this._passe(L[j], p)) { this.k = j + 1; break; }
      if (this.k >= L.length) {
        if (this.mode === 'recul') { this.mode = 'attente'; this._tAttente = 0; return; }
        // (après le dernier nœud : la cible elle-même, si un balayage y mène — revu toutes les 0,25 s ; sinon, une cible
        // dans un meuble ou derrière un mur, le dernier nœud est le plus près qu'on en soit : c'est lui le but, au lieu de
        // pousser le meuble 3 s, d'être pris pour coincé, puis téléporté)
        if (t >= this._tFicelle) { this._tFicelle = t + FICELLE_T; this._finBouchee = !this._balayerVers(p.x, p.y, p.z, c.x, c.y, c.z, 0, 0.6); }
        const w = L[L.length - 1];
        if (this._finBouchee) { tx = N.px[w]; tz = N.pz[w]; } else { tx = c.x; tz = c.z; }
      } else {
        if (t >= this._tFicelle || this.vise < this.k) { this._tFicelle = t + FICELLE_T; this.vise = this._ficelle(p); }
        if (this.vise < this.k) this.vise = this.k;
        const v = L[this.vise];
        tx = N.px[v]; tz = N.pz[v];
      }
    }
    let dx = tx - p.x, dz = tz - p.z, l = Math.hypot(dx, dz);
    if (l < 1e-6) return;
    dx /= l; dz /= l;
    // LE FRANCHISSEMENT : sur un lien « franchir », aligné, le saut à ≤ 0,6 m de l'obstacle
    if (L.length && this.k > 0 && this.k < L.length && N.typeLien) {
      const u = L[this.k - 1], v = L[this.k], j = N.lien(u, v);
      if (j >= 0 && N.typeLien[j] === 1) this._franchir(cmd, u, v, p, dx, dz, t);
    }
    // L'ÉVITEMENT des autres corps (un pas de côté, jamais vers un vide)
    [dx, dz] = this._eviter(p, dx, dz);
    this.dir = { x: dx, z: dz };
    const lac = cmd.lacet, fx = -Math.sin(lac), fz = -Math.cos(lac), rx = Math.cos(lac), rz = -Math.sin(lac);
    cmd.ay = dx * fx + dz * fz; cmd.ax = dx * rx + dz * rz; cmd.amp = 1;
    cmd.sprint = this.sprint && cmd.ay > 0.7 && !this._franchi;
    // COINCÉ ?
    this._surveiller(dt, t, p);
  }

  // ---------------------------------------------------------------- le chemin
  _planifier(t) {
    const N = this.nav, p = this.pos, c = this.cible;
    this._replan = false; this._tPlan = t + 0.5; this._plan = { x: c.x, y: c.y, z: c.z };
    if (!N || !N.nb) { this._direct = true; return; }
    let de = N.noeudPres(p.x, p.y, p.z, 1.5); if (de < 0) de = N.noeudPres(p.x, p.y, p.z, 3);
    let a = N.noeudPres(c.x, c.y, c.z, 1.5); if (a < 0) a = N.noeudPres(c.x, c.y, c.z, 3);
    if (de < 0 || a < 0) { this._direct = true; this.chemin = []; return; }
    this._direct = false; this._attente = true;
    N.demander(this.cle, de, a, (liste) => this._recu(liste), this.franchir ? null : SANS_FRANCHIR);
  }
  _recu(liste) {
    this._attente = false;
    if (!liste || !liste.length) { this.chemin = []; this._coince = true; return; }
    this.chemin = liste; this.k = 0; this.vise = 0; this._tFicelle = -1; this._franchi = null; this._finBouchee = false;
  }
  // un nœud passé : à 0,35 m, sur son sol
  _passe(v, p) { const N = this.nav; return Math.hypot(N.px[v] - p.x, N.pz[v] - p.z) < PROCHE && Math.abs(N.ph[v] - p.y) < 0.6; }
  _noterSur(v, p) {
    const S = this._surs, N = this.nav;
    if (N.degage[v] < this._r + 0.1 && S.length) return;
    const der = S[S.length - 1];
    if (der === undefined || Math.hypot(N.px[der] - N.px[v], N.pz[der] - N.pz[v]) > 0.75) { S.push(v); if (S.length > 6) S.shift(); }
  }
  // LA FICELLE : le nœud le plus loin (≤ 12 devant, jamais au-delà d'un franchissement) qu'un balayage atteint — d'abord
  // avec 8 cm de marge (la ligne tirée passe à une main des chambranles et des coins au lieu de les frôler : un bot ne racle
  // pas les murs), sinon au rayon du corps (un passage trop étroit pour la marge : il suit les nœuds, qui sont au milieu)
  _ficelle(p) {
    const N = this.nav, L = this.chemin, k = this.k;
    let hi = Math.min(L.length - 1, k + FICELLE_N);
    for (let j = k + 1; j <= hi; j++) { const q = N.lien(L[j - 1], L[j]); if (q >= 0 && N.typeLien[q] === 1) { hi = j - 1; break; } }
    if (hi <= k) return k;
    for (const marge of [MARGE_FICELLE, 0]) {
      // (l'ancienne visée tient tant qu'un balayage l'atteint : la ficelle ne recule jamais pour rien)
      let lo = k, h = hi;
      if (this.vise > k && this.vise < h && this._balayer(p.x, p.y, p.z, L[this.vise], marge)) lo = this.vise;
      if (this._balayer(p.x, p.y, p.z, L[h], marge)) return h;
      while (h - lo > 1) { const m = (lo + h) >> 1; if (this._balayer(p.x, p.y, p.z, L[m], marge)) lo = m; else h = m; }
      if (lo > k || marge === 0) return lo;
    }
    return k;
  }
  // le corps irait-il tout droit de (x, y, z) au nœud v ? (tronçons de 0,35 m, le sol suivi, pas de descente > 0,35 m.)
  // Avec une marge : le disque balayé a `marge` de plus que le corps ; il part du corps poussé hors des murs à ce rayon (s'il
  // en est à moins de la marge : sinon, refusé) et peut finir à `marge` du nœud (un nœud le long d'un mur est à 0,3 m de lui)
  _balayer(x, y, z, v, marge = 0) { const N = this.nav; return this._balayerVers(x, y, z, N.px[v], N.ph[v], N.pz[v], marge, 0.35); }
  // (vers un point quelconque ; `dyFin` : l'écart de sol permis à l'arrivée)
  _balayerVers(x, y, z, bx, by, bz, marge, dyFin) {
    const C = this._C, r = this._r + marge;
    _Q.x = x; _Q.z = z;
    if (marge > 0) { C.resoudre(_Q, r, null, y); if (Math.hypot(_Q.x - x, _Q.z - z) > marge + 0.02) return false; x = _Q.x; z = _Q.z; }
    const L = Math.hypot(bx - x, bz - z);
    if (L < 1e-6) return Math.abs(by - y) < 0.45;
    const n = Math.max(1, Math.ceil(L / 0.35)), sx = (bx - x) / n, sz = (bz - z) / n;
    let h = y;
    for (let i = 1; i <= n; i++) {
      const ex = x + sx * i, ez = z + sz * i;
      C.deplacer(_Q, ex - _Q.x, ez - _Q.z, r, null, h);
      if (Math.hypot(_Q.x - ex, _Q.z - ez) > (i === n && marge > 0 ? marge + 0.03 : 0.03)) return false;
      const h2 = C.solEn(_Q.x, _Q.z, h);
      if (h2 < h - 0.35 || h2 > h + 0.45) return false;
      h = h2;
    }
    return Math.abs(h - by) < dyFin;
  }

  // ---------------------------------------------------------------- le franchissement
  _franchir(cmd, u, v, p, dx, dz, t) {
    const N = this.nav, C = this._C;
    const lx = N.px[v] - N.px[u], lz = N.pz[v] - N.pz[u], ll = Math.hypot(lx, lz) || 1, ux = lx / ll, uz = lz / ll;
    if (!this._franchi || this._franchi.v !== v) this._franchi = { u, v, t, saute: false, iv: this.k };
    const F = this._franchi;
    // (raté : 1,6 s sur le lien sans être passé → pénalisé, un autre chemin)
    if (t - F.t > FRANCHIR_MAX) { this._penaliserFranchir(u, t + PENAL_T); N.noterFranchir?.(false); this._franchi = null; this._replan = true; this._tPlan = -1; this.chemin = []; return; }
    if (F.saute || this.acteur.corps.airborne) return;
    // aligné (< 15°) et la face à ≤ 0,6 m : le saut (la face : un disque poussé de 0,8 m bute)
    if (dx * ux + dz * uz < Math.cos(15 * Math.PI / 180)) return;
    _Q.x = p.x; _Q.z = p.z;
    C.deplacer(_Q, ux * 0.8, uz * 0.8, this._r, null, p.y);
    const avance = (_Q.x - p.x) * ux + (_Q.z - p.z) * uz;
    // (la face, du centre du corps : avance + rayon ≤ 0,6 m)
    if (avance + this._r <= SAUT_FACE) { cmd.saut = true; F.saute = true; }
  }

  // un franchissement raté : tous les liens « franchir » qui partent à moins de 1,5 m de là (le même obstacle — ils sont
  // tous les 0,75 m le long d'une table), pour que le nouveau chemin fasse le tour
  _penaliserFranchir(u, jusqua) {
    const N = this.nav, L = N.dans(N.px[u], N.ph[u], N.pz[u], 1.5, this._tmpF || (this._tmpF = []), 0.5);
    for (const w of L) for (let j = N.debut[w]; j < N.debut[w + 1]; j++) if (N.typeLien[j] === 1) N.penaliser(w, N.liens[j], jusqua);
  }

  // ---------------------------------------------------------------- l'évitement
  _eviter(p, dx, dz) {
    const P = this.partie, a = this.acteur;
    if (!P) return [dx, dz];
    let ox = 0, oz = 0;
    const px = -dz, pz = dx;
    for (const b of P.acteurs) {
      if (b === a || !b.vivant || !b.corps || b.role === 'cible') continue;
      const q = b.corps.pos;
      if (Math.abs(q.y - p.y) > 1.2) continue;
      const rx = q.x - p.x, rz = q.z - p.z, d = Math.hypot(rx, rz);
      if (d > 1.2 || d < 1e-6) continue;
      const devant = rx * dx + rz * dz, lat = rx * px + rz * pz, R = (b.corps.rayon ?? 0.3) + this._r;
      if (devant <= 0 || devant > EVITE + R || Math.abs(lat) > R + 0.05) continue;
      // (un corps qui s'en va dans notre sens, et qu'on ne rattrape pas — on le suit dans un couloir —, n'est pas à éviter :
      // sinon le suiveur zigzague dans son dos ; relecture)
      const vb = b.corps.vel, va = a.corps.vel;
      if (vb && va) { const sb = vb.x * dx + vb.z * dz, sa = va.x * dx + va.z * dz; if (sb > 1.5 && sa - sb < 1.0) continue; }
      const cote = Math.abs(lat) > 0.04 ? -Math.sign(lat) : a.id < b.id ? 1 : -1, w = 0.9 * (1 - d / 1.2);
      ox += px * cote * w; oz += pz * cote * w;
    }
    if (!ox && !oz) return [dx, dz];
    let nx = dx + ox, nz = dz + oz;
    const n = Math.hypot(nx, nz); if (n < 1e-6) return [dx, dz];
    nx /= n; nz /= n;
    // (jamais vers un vide : le sol à 0,4 m dans la nouvelle direction reste celui-ci)
    const C = this._C;
    if (C) { const h = C.solEn(p.x + nx * 0.4, p.z + nz * 0.4, p.y); if (h < p.y - 0.3 || h > p.y + 0.45) return [dx, dz]; }
    return [nx, nz];
  }

  // ---------------------------------------------------------------- le face-à-face
  _faceAFace(t) {
    const N = this.nav, P = this.partie, a = this.acteur, p = this.pos;
    if (!N || !N.nb || !P || !this.chemin.length || !this._dirPrec) return;
    for (const b of P.acteurs) {
      if (b === a || b.id < a.id || !b.vivant || !b.corps) continue;      // (le plus petit id recule : c'est lui qui regarde)
      const Q = b.cerveau && b.cerveau.pilote;
      if (!Q || Q.mode !== 'route' || !Q._dirPrec || Q._arrive) continue;
      const q = b.corps.pos;
      if (Math.abs(q.y - p.y) > 1.2 || Math.hypot(q.x - p.x, q.z - p.z) > FACE_D) continue;
      const d1 = this._dirPrec, d2 = Q._dirPrec;
      if (d1.x * d2.x + d1.z * d2.z > -0.5) continue;
      // (l'un vers l'autre : chacun a l'autre devant lui)
      if ((q.x - p.x) * d1.x + (q.z - p.z) * d1.z <= 0) continue;
      // (ÉTROIT : aucun nœud à 0,45 m de l'un ni de l'autre n'a 0,6 m de dégagement — le long d'un mur d'un hall, les nœuds
      // ont peu de dégagement mais on se croise très bien)
      const na = N.noeudPres(p.x, p.y, p.z, 1), nbb = N.noeudPres(q.x, q.y, q.z, 1);
      if (na < 0 || nbb < 0 || !this._etroit(p) || !this._etroit(q)) continue;
      // (sans refuge de son côté — un cul-de-sac dans son dos —, c'est l'autre qui recule)
      const R = this._refugeDe(na, q);
      if (R) { this._reculer(R, b); return; }
      const R2 = Q._refugeDe(nbb, p);
      if (R2) { Q._reculer(R2, a); return; }
    }
  }
  _reculer(R, b) {
    this.mode = 'recul'; this._autre = b; this._refuge = R;
    this.chemin = R; this.k = 0; this.vise = 0; this._tFicelle = -1; this._ref = null; this._arrive = false;
  }
  _etroit(q) {
    const N = this.nav, L = N.dans(q.x, q.y, q.z, 0.45, this._tmpE || (this._tmpE = []), 0.6);
    for (const v of L) if (N.degage[v] >= FACE_DEG) return false;
    return L.length > 0;
  }
  // le chemin (par la marche) jusqu'au nœud le plus proche de dégagement ≥ 0,75 m, en ne faisant que S'ÉLOIGNER de l'autre
  // (chaque pas du chemin à au moins la distance du précédent, à 5 cm près, en comptant la hauteur : dans la volée de tôle,
  // le refuge est en haut ou en bas, du côté d'où l'on vient — jamais derrière l'autre)
  _refugeDe(de, q) {
    const N = this.nav, pere = new Map([[de, -1]]), file = [de];
    const dist = (v) => Math.hypot(N.px[v] - q.x, N.pz[v] - q.z, (N.ph[v] - q.y) * 0.8);
    for (let i = 0; i < file.length && i < 800; i++) {
      const u = file[i];
      if (u !== de && N.degage[u] >= REFUGE_DEG) {
        const L = []; for (let w = u; w >= 0; w = pere.get(w)) L.push(w);
        return L.reverse();
      }
      const du = dist(u);
      for (let j = N.debut[u]; j < N.debut[u + 1]; j++) {
        const v = N.liens[j];
        if (N.typeLien[j] || pere.has(v) || !N.permis(v) || dist(v) < du - 0.05) continue;
        pere.set(v, u); file.push(v);
      }
    }
    return null;
  }
  _attendre(dt, t) {
    const b = this._autre, p = this.pos;
    this._tAttente += dt;
    const Q = b && b.cerveau && b.cerveau.pilote;
    // (passé : à 1,2 m et qui s'éloigne — ou arrivé, ou qui a changé de route : le passage est libre)
    let passe = !b || !b.vivant || !b.corps || !Q || Q._arrive || Q.mode !== 'route' || !Q.cible;
    if (!passe) {
      const q = b.corps.pos, d = Math.hypot(q.x - p.x, q.z - p.z), D = Q._dirPrec;
      passe = d >= PASSE_D && (!D || (q.x - p.x) * D.x + (q.z - p.z) * D.z > 0);
    }
    if (passe || this._tAttente > ATTENTE_MAX) this._finFace(true);
  }
  _finFace(reprendre = false) {
    if (this.mode === 'route') return;
    this.mode = 'route'; this._autre = null; this._refuge = null;
    if (reprendre) { this.chemin = []; this._replan = true; this._tPlan = -1; this._ref = null; }
  }

  // ---------------------------------------------------------------- coincé, le secours
  _surveiller(dt, t, p) {
    this._dirPrec = this.dir;
    // (le progrès sur le chemin : un bot qui va et vient sans passer de nœud pendant 4 s est coincé aussi)
    // (le temps compté est celui des pas où il veut avancer : un cerveau qui s'arrête pour tirer ne le fait pas courir)
    if (this.chemin !== this._cheminVu || this.k > this._kMax) { this._cheminVu = this.chemin; this._kMax = this.k; this._tK = 0; }
    else this._tK += dt;
    const sansProgres = this.chemin.length > 0 && this._tK > COINCE_T + 1;
    if (!this._ref) { this._ref = { x: p.x, z: p.z }; this._tRef = 0; return; }
    this._tRef += dt;
    if (!sansProgres && Math.hypot(p.x - this._ref.x, p.z - this._ref.z) > COINCE_D) { this._ref.x = p.x; this._ref.z = p.z; this._tRef = 0; this.coincements = 0; return; }
    if (this._tRef < COINCE_T && !sansProgres) return;
    this._tK = 0;
    this._ref.x = p.x; this._ref.z = p.z; this._tRef = 0;
    this.coincements++;
    const N = this.nav, L = this.chemin;
    if (N && N.nb && L.length && this.k < L.length) {
      const u = this.k > 0 ? L[this.k - 1] : N.noeudPres(p.x, p.y, p.z, 1.5), v = L[Math.min(L.length - 1, Math.max(this.k, this.vise))];
      if (u >= 0) { N.penaliser(u, L[this.k], t + PENAL_T); if (v !== L[this.k]) N.penaliser(L[Math.max(0, this.vise - 1)], v, t + PENAL_T); }
    }
    if (this.coincements >= 2 && this._secours()) this.coincements = 0;
    else if (this.coincements >= 3) this._coince = true;
    if (this.mode !== 'route') this._finFace(false);
    this.chemin = []; this._replan = true; this._tPlan = -1; this._direct = false;
  }
  // la téléportation au dernier nœud sûr, à 1,5 m au moins en arrière, si le joueur local ne voit ni le bot ni le nœud
  _secours() {
    const N = this.nav, P = this.partie, a = this.acteur, p = this.pos, B = this.balistique;
    if (!N || !N.nb || !P) return false;
    // (jamais plus bas que lui de plus de 0,5 m : une téléportation n'est pas une chute)
    let v = -1;
    for (let i = this._surs.length - 1; i >= 0; i--) { const s = this._surs[i]; if (Math.hypot(N.px[s] - p.x, N.pz[s] - p.z) >= SECOURS_RECUL && N.ph[s] > p.y - 0.5 && N.permis(s)) { v = s; break; } }
    if (v < 0) return false;
    const L = P.local;
    if (L && L !== a && L.vivant && L.corps && B) {
      const o = L.oeil(this._o || (this._o = { x: 0, y: 0, z: 0, set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; } }));
      if (B.vue(o.x, o.y, o.z, p.x, p.y + 1.6, p.z) || B.vue(o.x, o.y, o.z, N.px[v], N.ph[v] + 1.6, N.pz[v])) return false;
    }
    const c = a.corps;
    c.pos.set(N.px[v], N.ph[v], N.pz[v]); c.vel.set(0, 0, 0);
    if (c.posPrec) c.posPrec.copy(c.pos);
    c.solAff = N.ph[v]; c.jumpY = 0; c.jumpVel = 0; c.airborne = false;
    this.secours++;
    this._surs.length = 0; this._ref = null;
    return true;
  }
}

// ======================================================================================================== L'ERRANT
// les visites des pièces par partie (les errants d'une même partie se répartissent l'école)
const _visites = new WeakMap();
export class Errant {
  constructor(acteur, partie, { vers } = {}) {
    this.acteur = acteur; this.partie = partie; this.vers = vers || null;
    this.pilote = new Pilote(acteur, partie.nav, partie.balistique);
    // (l'errant MARCHE : ni table ni banc franchi en patrouille — le franchissement est l'affaire d'une poursuite, L-J ; et
    // le harnais compte un saut par-dessus un banc comme « dans un mur » : il lit les pieds sans le saut)
    this.pilote.franchir = false;
    this.rng = new Rng(melanger(partie.graine || 1, acteur.id, 0x4572));
    this.dest = null; this.mode = null; this.versPt = null; this.rondeT = 0; this.zoneDest = -1;
    this.regard = acteur.cmd.lacet || 0; this.coupDOeilT = 0; this.coupDOeil = 0;
  }
  get etat() { return this.mode || 'errance'; }
  _nav() { const N = this.partie.nav; return N && N.nb ? N : null; }
  // la prochaine pièce : la moins visitée de la partie (hors celle où il est), un nœud dégagé au hasard dedans
  _choisirPiece() {
    const N = this._nav(), a = this.acteur;
    if (!N) { this._choisirPoint(); return; }
    let V = _visites.get(this.partie); if (!V) _visites.set(this.partie, V = new Map());
    // (les pièces de la ZONE DE JEU — le masque du graphe la dit déjà quand le monde de la partie la pose ; sans lui, la liste
    // de ZONES_JEU : un chasseur du prop hunt au 1er n'erre pas au −1)
    const ici = N.noeudPres(a.pos.x, a.pos.y, a.pos.z, 2), zi = ici >= 0 ? N.zone[ici] : 255, permises = piecesDe(this.partie.zone || 'ecole');
    const Z = N.piecesPermises().filter((z) => z !== zi && permises.has(PIECES[z]));
    if (!Z.length) { this._choisirPoint(); return; }
    let min = Infinity; for (const z of Z) min = Math.min(min, V.get(z) || 0);
    const pool = Z.filter((z) => (V.get(z) || 0) === min), z = pool[this.rng.int(pool.length)];
    const n = (V.get(z) || 0) + 1;
    V.set(z, n);
    // (la 1re visite d'une pièce, et une sur deux ensuite : son lieu d'apparition — le cœur de la pièce, carte_monde § 8 —
    // s'il en a un ; sinon le plus dégagé de cinq nœuds tirés dans la pièce)
    let best = -1, bd = -1;
    const lieu = n % 2 === 1 ? POINTS_APPARITION.find((q) => q.zone === PIECES[z]) : null;
    if (lieu) { const v = N.noeudPres(lieu.x, lieu.y, lieu.z, 1.5); if (v >= 0 && N.zone[v] === z) best = v; }
    if (best < 0) for (let k = 0; k < 5; k++) { const v = N.aleatoireDans(z, this.rng); if (v >= 0 && N.degage[v] > bd) { bd = N.degage[v]; best = v; } }
    if (best < 0) { this._choisirPoint(); return; }
    this.zoneDest = z; this.mode = 'piece';
    this.dest = { x: N.px[best], y: N.ph[best], z: N.pz[best] };
  }
  // (sans graphe : de lieu d'apparition en lieu d'apparition, comme le squelette)
  _choisirPoint() {
    const L0 = pointsDe(this.partie.zone || 'ecole'), L = L0.length ? L0 : POINTS_APPARITION, p = this.acteur.pos;
    const pool = L.filter((q) => Math.hypot(q.x - p.x, q.z - p.z) > 2 || Math.abs(q.y - p.y) > 1.5);
    const q = (pool.length ? pool : L)[this.rng.int((pool.length ? pool : L).length)];
    this.mode = 'piece'; this.dest = { x: q.x, y: q.y, z: q.z };
  }
  // la ronde autour du point chaud : un nœud à 2-6 m de lui (on fouille le coin d'où venait le bruit, on ne s'en va pas)
  _choisirRonde() {
    const N = this._nav(), c = this.versPt;
    if (!N || !c) { this._choisirPiece(); return; }
    // (à 2-6,5 m À PIED du point : à vol d'oiseau, la ronde passait le mur et menait au bout de l'école par le couloir)
    // (F2 relecture : un point à TENIR — l'anneau de la domination, js/jeu/cerveau.js objectif — : la ronde reste dedans,
    // à `tenir` m au plus de son centre)
    const T = c.tenir > 0 ? c.tenir : 0, rMax = T || 6.5, rMin = T ? 0 : 2;
    const F = N.champMulti([c], rMax, this._champ && this._champ.length === N.nb ? this._champ : (this._champ = new Float64Array(N.nb)));
    const L = N.dans(c.x, c.y, c.z, T || 6, this._tmp || (this._tmp = []), 1.2).filter((v) => Math.hypot(N.px[v] - c.x, N.pz[v] - c.z) >= rMin && F[v] <= rMax && N.degage[v] >= 0.5);
    if (!L.length) {
      // (un point à tenir sans nœud dégagé autour : il reste au centre, aux aguets)
      if (T) { this.mode = 'guet'; this.rondeT = this.partie.t + 2 + this.rng.next() * 2; this.dest = { x: c.x, y: c.y, z: c.z }; return; }
      this._choisirPiece(); return;
    }
    const v = L[this.rng.int(L.length)];
    this.mode = 'ronde'; this.rondeT = this.partie.t + 4 + this.rng.next() * 5;
    this.dest = { x: N.px[v], y: N.ph[v], z: N.pz[v] };
  }
  commande(dt, cmd) {
    const a = this.acteur, P = this.pilote, t = this.partie.t;
    viderFronts(cmd);                              // (les fronts ne vivent qu'un pas : un `saut` resté vrai faisait sautiller)
    // (le lacet a été tenu par un autre depuis le dernier pas — le cerveau en combat, une réapparition — : le regard repart
    // de là ; sinon, le combat fini, la tête et le corps sautaient d'un coup vers le regard d'avant le combat)
    if (this._lacetPose !== undefined && Math.abs(angle(cmd.lacet - this._lacetPose)) > 1e-9) { this.regard = cmd.lacet; this.coupDOeil = cmd.lacet; }
    // LA DESTINATION
    const v = this.vers ? this.vers(a) : null, avant = this.dest;
    if (v) {
      if (!this.versPt || Math.hypot(v.x - this.versPt.x, v.z - this.versPt.z) > 3 || Math.abs(v.y - this.versPt.y) > 1.5) {
        this.versPt = { x: v.x, y: v.y, z: v.z, tenir: v.tenir || 0 }; this.mode = 'vers'; this.dest = { ...this.versPt };
      }
    } else if (this.mode === 'vers' || this.mode === 'guet' || this.mode === 'ronde') { this.versPt = null; this.dest = null; }
    if (!this.dest) this._choisirPiece();
    // (`arrive` et `coince` sont ceux de la destination d'AVANT : une destination neuve n'est ni atteinte ni bouchée — sinon
    // le point chaud entendu pendant une pause passait en « guet » sans qu'il y soit allé)
    const neuve = this.dest !== avant;
    if (!neuve && P.coince) { P.stop(); if (this.mode === 'vers' || this.mode === 'guet') this._choisirRonde(); else this._choisirPiece(); }
    else if (!neuve && P.arrive) {
      // (arrivé au point chaud : il GUETTE 2 à 4 s, le regard qui balaie, puis fait sa ronde autour)
      if (this.mode === 'vers') { this.mode = 'guet'; this.rondeT = t + 2 + this.rng.next() * 2; }
      else if (this.mode === 'guet' || this.mode === 'ronde') { if (t >= this.rondeT) this._choisirRonde(); }
      else if (t >= (this._repos || 0)) { if (this._repos) { this._repos = 0; this._choisirPiece(); } else this._repos = t + 0.6 + this.rng.next() * 1.4; }
    }
    const d = this.dest, p = a.pos, loin = Math.hypot(d.x - p.x, d.z - p.z);
    P.allerA(d.x, d.y, d.z, { sprint: this.mode === 'vers' && loin > 15, arret: this.mode === 'vers' ? 1.0 : 0.5, marge: 0.4 });
    P.pas(dt, cmd);
    // LE REGARD : dans la marche (lissé, 9 rad/s au plus) ; à l'arrêt, des coups d'œil
    let voulu = this.regard;
    if (P.dir) voulu = Math.atan2(-P.dir.x, -P.dir.z);
    else {
      if (t >= this.coupDOeilT) { this.coupDOeilT = t + 1.2 + this.rng.next() * 2.2; this.coupDOeil = angle(this.regard + (this.rng.next() - 0.5) * 2.4); }
      voulu = this.coupDOeil;
    }
    const e = angle(voulu - this.regard), pasMax = 9 * dt, k = 1 - Math.exp(-dt / (P.dir ? 0.09 : 0.25));
    this.regard = angle(this.regard + Math.max(-pasMax, Math.min(pasMax, e * k)));
    // (la commande d'axe a été posée pour l'ancien lacet : elle est retournée vers le nouveau, la direction voulue reste la même)
    if (P.dir) {
      const l = this.regard, fx = -Math.sin(l), fz = -Math.cos(l), rx = Math.cos(l), rz = -Math.sin(l);
      cmd.ay = P.dir.x * fx + P.dir.z * fz; cmd.ax = P.dir.x * rx + P.dir.z * rz;
      cmd.sprint = P.sprint && cmd.ay > 0.7 && !P._franchi;
    }
    cmd.lacet = this.regard; cmd.tangage = 0; this._lacetPose = cmd.lacet;
    cmd.marche = false; cmd.tir = false; cmd.visee = false; cmd.accroupi = false;
  }
}
