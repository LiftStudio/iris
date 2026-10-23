// =====================================================================
//  LA MINI-CARTE (lot L-G, 23/10 ; spec §§ 3.6, 4.5.15, 5.5.10 ; CoD § 9.1)
// =====================================================================
// En bas à gauche (en haut à gauche au doigt, sous la rangée des boutons) : 200 px de côté (160 au tactile), 24 m de large,
// qui TOURNE avec Haythem (le haut, c'est devant lui). Le fond est la SILHOUETTE DU NIVEAU où il est, rastérisée une fois
// à la préparation depuis les nœuds du graphe des humains (une case de 0,25 m = 2 px : 8 px par mètre ; un canevas par
// niveau, 208 × 244 px pour les bornes du jeu) — et, tant que la navigation est « à vol d'oiseau » (le squelette de L-D,
// sans nœuds), depuis les PIÈCES de la carte vivante (les rectangles des 47 zones de js/ecole_lumieres.js, chacune à son
// niveau) et ses murs hauts (les formes de plus de 1,8 m du monde solide) : un plan d'architecte. Dessus : Haythem (la
// flèche blanche au centre), ses alliés (flèches bleues, orientées), les ennemis pendant 2 s après chaque tir non
// silencieux (points rouges, là où ils ont tiré), les signalés (`hud.signalesMiniCarte`, le drone de la vague 3), les
// anneaux de la domination (A, B, C, ramenés au bord quand ils sortent du cadre) et, pour qui est à un autre niveau, un
// chevron ▲ / ▼ au lieu d'une flèche ; sous la carte, le niveau et la pièce (« −1 · ESPACE PAUSE »).
// Un canevas 2D, redessiné à chaque image (≈ 10 appels de dessin : aucune écriture DOM ; le nom de la pièce n'est écrit
// que s'il change). La variante « ZONE ENTIÈRE, SANS ACTEURS » (`dessinerZone`) sert au panneau de cachette du prop hunt
// (js/jeu/hud_prop.js) : la silhouette des niveaux de la zone, ses pièces, ses portes, aucun acteur.
import { BORNES_JEU, NIVEAUX, niveauDe, ZONES_JEU, PIECES } from './constantes.js';
import { texte, cacher, classe, elt, tailleCarte, ECRAN } from './hud_jeu.js';

export const CARTE = { taille: 200, tailleTactile: 160, largeurM: 24, pxParM: 8, pingDuree: 2, murHaut: 1.8 };
// les noms à l'écran (niveaux, pièces)
export const NOMS_NIVEAUX = { '-1': '−1', 0: 'RDC', 1: '1ER', 2: '2E' };
export const NOMS_PIECES = {
  pauseSS: 'ESPACE PAUSE', salleSS: 'S −1.14', hallSS: 'HALL DU −1', couloirSS: 'COULOIR', passageSS: 'PASSAGE', sasSS: 'SAS EST',
  palierSSE: 'PALIER EST', escalierSS: 'VOLÉE DE TÔLE', escEstSS: 'ESCALIER EST', descenteEst: 'DESCENTE EST',
  hall: 'HALL', attente: 'SALLE D’ATTENTE', hallO: 'HALL OUEST', passage: 'PASSAGE', c05: 'C05', c01: 'C01', dc: 'DAVID CLARK',
  si01: 'SI 0.1', bureauB: 'BUREAU B', couloirEst: 'COULOIR EST', vestEst: 'VESTIBULE EST', escalier: 'ESCALIER', porche: 'PORCHE',
  rue: 'RUE', escEst: 'ESCALIER EST', escEst2: 'ESCALIER EST', escEst3: 'ESCALIER EST', palier1: 'ESCALIER',
  e1pause: 'ESPACE PAUSE', e1salle: 'S 1.3', e1kahn: 'SALLE KAHN', e1couloir: 'COULOIR', e1bureau: 'BUREAU', e103: 'SALLE 103',
  e104: 'SALLE 104', e1est: 'PALIER EST', e2couloir: 'COULOIR ROUGE', e2s1: 'SALLE 1', e2s2: 'SALLE 2', e2palier: 'PALIER', e2sas: 'SAS',
};
const B = BORNES_JEU, PX = CARTE.pxParM, W = Math.round((B.xMax - B.xMin) * PX), HH = Math.round((B.zMax - B.zMin) * PX);
const COUL = { sol: 'rgba(196,208,228,0.22)', bord: 'rgba(235,242,255,0.6)', piece: 'rgba(206,216,232,0.20)', mur: 'rgba(8,11,18,0.85)',
  zone: 'rgba(240,164,23,0.22)', zoneBord: 'rgba(250,190,70,0.75)', porte: '#ffc845', moi: '#ffffff', allie: '#3d8bff', ennemi: '#ff3b30',
  A: '#3d8bff', B: '#ff8a1f', neutre: '#d8dde6' };
// le niveau d'une zone de la carte vivante : celui de son point de prise de vue (env.y, à ≈ 1,5 m au-dessus de son sol)
const niveauZone = (Z) => (Z && Z.env ? niveauDe(Z.env.y - 1.0) : 0);
const canevas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
// (les rastres d'une session : par graphe — son empreinte — et celui des pièces, qui ne change pas)
const _rastres = new Map();

export class MiniCarte {
  constructor(game) {
    this.game = game; this.nav = null; this.niveaux = null; this.el = null; this.partie = null; this._des = [];
    this.pings = new Map(); this.t = 0; this.dessines = []; this.niveau = 0; this.source = null; this.largeurM = CARTE.largeurM;
  }
  _creer() {
    if (this.el) return;
    const hud = document.getElementById('hud'); if (!hud) return;
    this.el = elt('div', 'hud-carte', null); this.el.id = 'hud-carte'; this.el.dataset.jeu = '1'; cacher(this.el, true);
    this.cv = elt('canvas', 'hud-carte-cv', this.el);
    this.eNom = elt('div', 'hud-carte-nom', this.el, '');
    hud.appendChild(this.el);
  }
  // LA SILHOUETTE DES NIVEAUX, une fois par graphe (≤ 50 ms) : les nœuds s'il y en a, sinon les pièces et les murs hauts
  preparer(nav) {
    this._creer();
    this.nav = nav || null;
    const avecNoeuds = !!(nav && nav.nb > 0 && nav.px && nav.pz && nav.niveau);
    const cle = avecNoeuds ? 'nav:' + (nav.empreinte || nav.nb) : 'pieces';
    let R = _rastres.get(cle);
    if (!R) { R = avecNoeuds ? this._depuisNoeuds(nav) : this._depuisPieces(); _rastres.set(cle, R); }
    this.niveaux = R; this.source = avecNoeuds ? 'noeuds' : 'pieces';
    return R;
  }
  // (les nœuds : une case de 0,25 m = 1 px d'un masque à 4 px/m, agrandi ×2 et lissé ; un liseré clair autour)
  _depuisNoeuds(nav) {
    const R = {};
    const masques = {};
    for (const n of [-1, 0, 1, 2]) { const m = canevas(Math.ceil(W / 2), Math.ceil(HH / 2)); masques[n] = { c: m, x: m.getContext('2d') }; masques[n].x.fillStyle = '#fff'; }
    for (let i = 0; i < nav.nb; i++) {
      let n = nav.niveau[i]; if (n === 3) n = 0;
      const M = masques[n]; if (!M) continue;
      M.x.fillRect(Math.floor((nav.px[i] - B.xMin) * 4), Math.floor((nav.pz[i] - B.zMin) * 4), 1, 1);
    }
    for (const n of [-1, 0, 1, 2]) R[n] = this._teindre(masques[n].c, null);
    return R;
  }
  // (repli : les rectangles des pièces de chaque niveau, et les murs hauts du monde solide par-dessus)
  _depuisPieces() {
    const g = this.game, Lu = g.carte && g.carte.lumieres, C = g.collisions, R = {};
    for (const N of NIVEAUX) {
      const n = N.n, m = canevas(W, HH), x = m.getContext('2d');
      x.fillStyle = '#fff';
      for (const Z of (Lu && Lu.zones) || []) {
        if (niveauZone(Z) !== n) continue;
        for (const r of Z.rects) {
          const x0 = Math.max(B.xMin, r[0]), x1 = Math.min(B.xMax, r[2]), z0 = Math.max(B.zMin, r[1]), z1 = Math.min(B.zMax, r[3]);
          if (x1 > x0 && z1 > z0) x.fillRect((x0 - B.xMin) * PX, (z0 - B.zMin) * PX, (x1 - x0) * PX, (z1 - z0) * PX);
        }
      }
      // les murs : les formes hautes qui coupent la hauteur de marche de ce niveau
      x.globalCompositeOperation = 'destination-out';
      const h0 = N.sol + 0.6, h1 = N.sol + 1.4;
      for (const f of (C && C.formes) || []) {
        if (f.off || f.joueur === false || f.limite || f.mobile || f.vantail || f.y1 - f.y0 < CARTE.murHaut || f.y0 > h0 || f.y1 < h1) continue;
        x.beginPath(); this._forme(x, f, (X, Zz) => [(X - B.xMin) * PX, (Zz - B.zMin) * PX]); x.fill();
      }
      x.globalCompositeOperation = 'source-over';
      R[n] = this._teindre(m, 1);
    }
    return R;
  }
  _forme(x, f, P) {
    if (f.t === 'b') { const [a, b] = P(f.x0, f.z0), [c, d] = P(f.x1, f.z1); x.rect(a, b, Math.max(1, c - a), Math.max(1, d - b)); }
    else if (f.t === 'c') { const [a, b] = P(f.x, f.z); x.moveTo(a + f.r * PX, b); x.arc(a, b, Math.max(0.6, f.r * PX), 0, Math.PI * 2); }
    else {
      const c = f.c, s = f.s;
      for (let k = 0; k < 4; k++) {
        const u = k === 0 || k === 3 ? -f.hx : f.hx, v = k < 2 ? -f.hz : f.hz;
        const [a, b] = P(f.cx + u * c - v * s, f.cz + u * s + v * c);
        if (k) x.lineTo(a, b); else x.moveTo(a, b);
      }
      x.closePath();
    }
  }
  // un masque blanc → la silhouette : le sol teinté, un liseré clair de 1 px tout autour (le masque décalé dessous)
  _teindre(masque, echelle) {
    const c = canevas(W, HH), x = c.getContext('2d');
    x.imageSmoothingEnabled = !echelle;
    const teinte = (coul) => { const t = canevas(W, HH), y = t.getContext('2d'); y.imageSmoothingEnabled = !echelle; y.drawImage(masque, 0, 0, W, HH); y.globalCompositeOperation = 'source-in'; y.fillStyle = coul; y.fillRect(0, 0, W, HH); return t; };
    const bord = teinte(COUL.bord), sol = teinte(COUL.sol);
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) x.drawImage(bord, dx, dy);
    x.globalCompositeOperation = 'destination-out'; x.drawImage(teinte('#000'), 0, 0);
    x.globalCompositeOperation = 'source-over'; x.drawImage(sol, 0, 0);
    return c;
  }

  // ---------------------------------------------------------------- À CHAQUE IMAGE
  maj(dt, partie) {
    this._creer(); if (!this.el) return;
    const P = partie || null;
    if (P !== this.partie) this._brancher(P);
    const L = P ? P.local : null, S = P && P.suivi && P.suivi.corps ? P.suivi : L;
    const montre = !!(P && S && S.corps && P.id !== 'stand' && !(P.hud && P.hud.prop && P.hud.prop.cachette));
    cacher(this.el, !montre);
    this.dessines.length = 0;
    if (!montre) return;
    this.t += dt || 0;
    if (!this.niveaux) this.preparer(P.nav);
    const tactile = document.body.classList.contains('touch');
    const T = tailleCarte(ECRAN.w, ECRAN.h, tactile);
    const dpr = Math.min(2, window.devicePixelRatio || 1), cv = this.cv;
    if (cv.__T !== T || cv.__dpr !== dpr) { cv.__T = T; cv.__dpr = dpr; cv.width = Math.round(T * dpr); cv.height = Math.round(T * dpr); cv.style.width = cv.style.height = T + 'px'; }
    this.taille = T;
    const x = this._ctx || (this._ctx = cv.getContext('2d'));
    const c = S.corps, pa = c.posAff || c.pos, px = pa.x, pz = pa.z, py = Number.isFinite(c.solAff) ? c.solAff : pa.y;
    const n = niveauDe(py + 0.5); this.niveau = n;
    const lacet = S === L ? this.game.camYaw : S.cmd ? S.cmd.lacet : 0;
    const k = T / CARTE.largeurM, cs = Math.cos(lacet), sn = Math.sin(lacet), m = T / 2;
    // monde → carte (px CSS) : tourné du lacet (devant = en haut)
    const ver = (X, Z, o) => { const dx = X - px, dz = Z - pz; o[0] = m + k * (dx * cs - dz * sn); o[1] = m + k * (dx * sn + dz * cs); return o; };
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    x.clearRect(0, 0, T, T);
    const fond = this.niveaux && this.niveaux[n];
    if (fond) {
      x.save(); x.translate(m, m); x.rotate(lacet); x.scale(k / PX, k / PX);
      x.drawImage(fond, -(px - B.xMin) * PX, -(pz - B.zMin) * PX);
      x.restore();
    }
    const q = [0, 0], H = P.hud || {};
    // les anneaux de la domination (au bord s'ils sortent du cadre)
    for (const p of Array.isArray(H.points) ? H.points : []) {
      if (typeof p.x !== 'number') continue;
      ver(p.x, p.z, q);
      const r = m - 9, ddx = q[0] - m, ddy = q[1] - m, dd = Math.hypot(ddx, ddy);
      if (dd > r) { q[0] = m + ddx / dd * r; q[1] = m + ddy / dd * r; }
      x.beginPath(); x.arc(q[0], q[1], 7, 0, Math.PI * 2);
      x.fillStyle = 'rgba(5,7,11,0.8)'; x.fill(); x.lineWidth = 2; x.strokeStyle = COUL[p.possesseur] || COUL.neutre; x.stroke();
      x.fillStyle = COUL[p.possesseur] || COUL.neutre; x.font = '600 9px Oswald, system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText(String(p.id ?? ''), q[0], q[1] + 0.5);
      this.dessines.push({ type: 'point', id: p.id, sx: q[0], sy: q[1] });
    }
    // les alliés (flèches orientées ; ▲ / ▼ à un autre niveau)
    if (L) for (const a of P.acteurs) {
      if (a === S || !a.vivant || !a.corps || a.role === 'cible' || P.ennemis(L, a) || a === L) continue;
      const b = a.corps.posAff || a.corps.pos;
      ver(b.x, b.z, q);
      const na = niveauDe((Number.isFinite(a.corps.solAff) ? a.corps.solAff : b.y) + 0.5);
      if (na !== n) { this._chevron(x, q[0], q[1], na > n, COUL.allie); this.dessines.push({ type: 'autreNiveau', id: a.id, haut: na > n, sx: q[0], sy: q[1] }); continue; }
      const l = a.cmd ? a.cmd.lacet : 0;
      this._fleche(x, q[0], q[1], lacet - l, COUL.allie, 5);
      this.dessines.push({ type: 'allie', id: a.id, sx: q[0], sy: q[1] });
    }
    // les ennemis : 2 s après chaque tir non silencieux, là où ils ont tiré (et les signalés)
    for (const [id, e] of this.pings) {
      const age = this.t - e.t;
      if (age > CARTE.pingDuree) { this.pings.delete(id); continue; }
      const a = P.acteurParId(id);
      if (!a || !a.vivant) { this.pings.delete(id); continue; }
      ver(e.x, e.z, q);
      if (Math.hypot(q[0] - m, q[1] - m) > m - 3) continue;
      const ne = niveauDe(e.y - 1.0);
      x.globalAlpha = Math.max(0, 1 - age / CARTE.pingDuree) * 0.85 + 0.15;
      if (ne !== n) this._chevron(x, q[0], q[1], ne > n, COUL.ennemi);
      else { x.beginPath(); x.arc(q[0], q[1], 4, 0, Math.PI * 2); x.fillStyle = COUL.ennemi; x.fill(); x.lineWidth = 1; x.strokeStyle = 'rgba(0,0,0,0.7)'; x.stroke(); }
      x.globalAlpha = 1;
      this.dessines.push({ type: ne !== n ? 'autreNiveau' : 'ennemi', id, haut: ne > n, sx: q[0], sy: q[1] });
    }
    for (const s of Array.isArray(H.signalesMiniCarte) ? H.signalesMiniCarte : []) {
      ver(s.x, s.z, q);
      if (Math.hypot(q[0] - m, q[1] - m) > m - 3) continue;
      x.beginPath(); x.arc(q[0], q[1], 3.5, 0, Math.PI * 2); x.fillStyle = COUL.ennemi; x.fill();
      this.dessines.push({ type: 'signale', id: s.id, sx: q[0], sy: q[1] });
    }
    // Haythem (ou l'acteur suivi) : la flèche blanche au centre, vers le haut ; son cône de vue
    const grad = x.createRadialGradient(m, m, 0, m, m, m * 0.55);
    grad.addColorStop(0, 'rgba(255,255,255,0.16)'); grad.addColorStop(1, 'rgba(255,255,255,0)');
    x.beginPath(); x.moveTo(m, m); x.arc(m, m, m * 0.55, -Math.PI / 2 - 0.62, -Math.PI / 2 + 0.62); x.closePath(); x.fillStyle = grad; x.fill();
    this._fleche(x, m, m, 0, COUL.moi, 6.5);
    // le niveau et la pièce
    const Lu = this.game.carte && this.game.carte.lumieres, Z = Lu && Lu.zoneEn ? Lu.zoneEn(px, pz, py + 0.1) : null;
    texte(this.eNom, (NOMS_NIVEAUX[n] || String(n)) + (Z ? ' · ' + (NOMS_PIECES[Z.id] || String(Z.id).toUpperCase()) : ''));
    classe(this.el, 'tactile', tactile);
  }
  // la sortie de la partie (HudJeu.debrancher) : la carte cachée, la partie oubliée
  cacher() { if (this.el) cacher(this.el, true); this._brancher(null); }
  _fleche(x, cx, cy, ang, coul, r) {
    x.save(); x.translate(cx, cy); x.rotate(ang);
    x.beginPath(); x.moveTo(0, -r); x.lineTo(r * 0.78, r * 0.82); x.lineTo(0, r * 0.36); x.lineTo(-r * 0.78, r * 0.82); x.closePath();
    x.fillStyle = coul; x.fill(); x.lineWidth = 1.2; x.strokeStyle = 'rgba(0,0,0,0.75)'; x.stroke();
    x.restore();
  }
  _chevron(x, cx, cy, haut, coul) {
    x.beginPath();
    if (haut) { x.moveTo(cx - 4.5, cy + 2.5); x.lineTo(cx, cy - 3); x.lineTo(cx + 4.5, cy + 2.5); }
    else { x.moveTo(cx - 4.5, cy - 2.5); x.lineTo(cx, cy + 3); x.lineTo(cx + 4.5, cy - 2.5); }
    x.lineWidth = 2.4; x.strokeStyle = coul; x.lineJoin = 'round'; x.stroke();
  }
  // une partie neuve : les tirs écoutés (les ennemis montrés 2 s), l'ancienne oubliée
  _brancher(P) {
    for (const d of this._des) d(); this._des = [];
    this.partie = P; this.pings.clear(); this.t = 0;
    if (!P) return;
    this._des.push(P.sur('tir', (e) => {
      const L = P.local, a = P.acteurParId(e.a);
      if (!L || !a || a === L || !P.ennemis(L, a) || a.role === 'cible') return;
      const f = P.ficheArme ? P.ficheArme(e.arme) : null;
      if (f && f.silencieux) return;
      this.pings.set(a.id, { x: e.ox, y: e.oy, z: e.oz, t: this.t });
    }));
    if (P.nav && P.nav !== this.nav) this.preparer(P.nav);
  }

  // ---------------------------------------------------------------- LA ZONE ENTIÈRE, SANS ACTEURS (panneau de cachette)
  // `cv` : le canevas cible (sa taille en px) ; rend { niveaux, pieces, portes, acteurs: 0 }
  dessinerZone(cv, zoneJeu) {
    const g = this.game, Lu = g.carte && g.carte.lumieres, Zj = ZONES_JEU[zoneJeu] || ZONES_JEU.e1;
    if (!this.niveaux) this.preparer(this.nav);
    const ids = new Set(Zj.pieces === '*' ? PIECES.filter((p) => p !== 'rue' && p !== 'porche') : Zj.pieces);
    const zones = ((Lu && Lu.zones) || []).filter((Z) => ids.has(Z.id));
    const parNiv = new Map();
    for (const Z of zones) { const n = niveauZone(Z); if (!parNiv.has(n)) parNiv.set(n, []); parNiv.get(n).push(Z); }
    const niveaux = [...parNiv.keys()].sort((a, b) => a - b);
    const x = cv.getContext('2d'), Wc = cv.width, Hc = cv.height;
    x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, Wc, Hc);
    const res = { niveaux: niveaux.length, pieces: 0, portes: 0, acteurs: 0 };
    if (!niveaux.length) return res;
    // l'emprise de chaque niveau (ses pièces), côte à côte
    const larg = Wc / niveaux.length;
    // (TOUTES les portes : `Portes.liste()` de L-M, § 4.5.19 ; le squelette n'a que les automatiques — au 1er, aucune)
    const Pt = g.carte && g.carte.portes, portes = (Pt && (typeof Pt.liste === 'function' ? Pt.liste() : Pt.auto)) || [];
    niveaux.forEach((n, i) => {
      const Zs = parNiv.get(n);
      let x0 = Infinity, z0 = Infinity, x1 = -Infinity, z1 = -Infinity;
      for (const Z of Zs) for (const r of Z.rects) { x0 = Math.min(x0, Math.max(B.xMin, r[0])); z0 = Math.min(z0, Math.max(B.zMin, r[1])); x1 = Math.max(x1, Math.min(B.xMax, r[2])); z1 = Math.max(z1, Math.min(B.zMax, r[3])); }
      x0 -= 1; z0 -= 1; x1 += 1; z1 += 1;
      const e = Math.min((larg - 16) / (x1 - x0), (Hc - 34) / (z1 - z0));
      const ox = i * larg + (larg - (x1 - x0) * e) / 2, oz = 8 + (Hc - 26 - (z1 - z0) * e) / 2;
      const P = (X, Z) => [ox + (X - x0) * e, oz + (Z - z0) * e];
      // la silhouette du niveau, dans l'emprise
      const fond = this.niveaux && this.niveaux[n];
      if (fond) { x.save(); x.beginPath(); x.rect(ox - 2, oz - 2, (x1 - x0) * e + 4, (z1 - z0) * e + 4); x.clip(); x.globalAlpha = 0.55; x.drawImage(fond, ox - (x0 - B.xMin) * e, oz - (z0 - B.zMin) * e, W * e / PX, HH * e / PX); x.restore(); }
      // les pièces de la zone
      for (const Z of Zs) {
        x.beginPath();
        for (const r of Z.rects) { const [a, b] = P(Math.max(B.xMin, r[0]), Math.max(B.zMin, r[1])), [c, d] = P(Math.min(B.xMax, r[2]), Math.min(B.zMax, r[3])); if (c > a && d > b) x.rect(a, b, c - a, d - b); }
        x.fillStyle = COUL.zone; x.fill(); x.lineWidth = 1; x.strokeStyle = COUL.zoneBord; x.stroke();
        res.pieces++;
      }
      // les portes (celles du niveau, dans une pièce de la zone)
      const sol = (NIVEAUX.find((N) => N.n === n) || NIVEAUX[1]).sol;
      for (const Q of portes) {
        // (une porte de la liste : { cx, cz, base, nx, nz } comme les automatiques, sinon son groupe et sa rotation)
        const G = Q && Q.g && Q.g.position, cx = Q && typeof Q.cx === 'number' ? Q.cx : G ? G.x : NaN, cz = Q && typeof Q.cz === 'number' ? Q.cz : G ? G.z : NaN;
        const base = Q && typeof Q.base === 'number' ? Q.base : G ? G.y : 0, rot = Q && typeof Q.rot === 'number' ? Q.rot : Q && Q.g ? Q.g.rotation.y : 0;
        if (!Number.isFinite(cx) || !Number.isFinite(cz) || Math.abs(base - sol) > 1.2) continue;
        // (de part et d'autre du seuil : une porte qui ouvre sur une pièce de la zone en est)
        const nx = Q.nx ?? Math.sin(rot), nz = Q.nz ?? Math.cos(rot), y = base + 0.1;
        const Za = Lu.zoneEn(cx + nx * 0.4, cz + nz * 0.4, y), Zb = Lu.zoneEn(cx - nx * 0.4, cz - nz * 0.4, y);
        if (!(Za && ids.has(Za.id)) && !(Zb && ids.has(Zb.id))) continue;
        const [a, b] = P(cx, cz);
        x.beginPath(); x.arc(a, b, 3, 0, Math.PI * 2); x.fillStyle = COUL.porte; x.fill();
        res.portes++;
      }
      // les noms des pièces (les grandes) et du niveau
      x.font = '500 10px Oswald, system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = 'rgba(255,255,255,0.85)';
      for (const Z of Zs) {
        const r = Z.rects[0], [a, b] = P(Math.max(B.xMin, r[0]), Math.max(B.zMin, r[1])), [c, d] = P(Math.min(B.xMax, r[2]), Math.min(B.zMax, r[3]));
        if ((c - a) > 42 && (d - b) > 14 && NOMS_PIECES[Z.id]) x.fillText(NOMS_PIECES[Z.id], (a + c) / 2, (b + d) / 2);
      }
      x.font = '400 16px "Bebas Neue", Oswald, sans-serif'; x.fillStyle = '#ffc845';
      x.fillText(NOMS_NIVEAUX[n] || String(n), i * larg + larg / 2, Hc - 10);
    });
    return res;
  }
}
