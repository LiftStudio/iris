// =====================================================================
//  LA LUMIÈRE DE L'ÉCOLE IRIS
// =====================================================================
// Un intérieur éclairé par des plafonniers, avec le pipeline de LA CAGE (une lumière principale qui porte les ombres
// douces, un ciel hémisphérique, une carte d'environnement prise sur place, des ombres de contact) et trois ajouts :
//
// 1. LES SPOTS QUI SUIVENT HAYTHEM. Une école, ce sont des dizaines de plafonniers ; une lumière réelle par plafonnier
//    coûterait trop (chaque lumière se paie à chaque pixel). On garde donc un PETIT NOMBRE de vraies lampes (4 sur PC,
//    2 au téléphone : jamais plus, jamais moins — le nombre de lumières fait partie de la clé des programmes, le changer
//    recompilerait tout), qu'on pose sous les plafonniers LES PLUS PROCHES de Haythem, DANS SA PIÈCE et les pièces qui
//    s'y ouvrent (jamais derrière un mur : pas de fuite de lumière). Ce sont des spots tournés vers le sol (le plafond
//    n'est pas éclairé par en dessous, comme sur les photos) ; quand il change de pièce, ceux qui ne servent plus
//    s'éteignent en fondu et se rallument ailleurs. Ils font le modelé de Haythem et les reflets sur le carrelage satiné.
//
// 2. LA LUMIÈRE CUITE AU SOL. Tous les plafonniers ET le jour qui entre (porte 6, grille du passage, fenêtres, porte
//    dépolie du fond) sont peints une fois, au chargement, dans une carte de lumière (lightMap) du carrelage : sous chaque
//    plafonnier, sa flaque (éclairement d'un émetteur lambertien à h mètres : h² / (h² + r²)²), et pour le jour, une
//    nappe froide qui entre par l'ouverture. Chaque source est DÉCOUPÉE par les murs (polygone de visibilité tiré des
//    formes du monde solide, js/collisions.js) : la lumière d'une pièce ne passe pas sous le mur dans la pièce voisine,
//    elle ne sort que par les portes. Coût : nul pendant le jeu (une texture de plus sur le sol).
//
// 3. LA CARTE D'ENVIRONNEMENT REPRISE DANS CHAQUE PIÈCE. La carte prise sur place (js/kit_decor.js carteLocale) ne voit
//    l'école que d'un point : les reflets du couloir C01 y montreraient la salle d'attente. Chaque zone a son point de
//    prise de vue ; quand Haythem s'y installe (une demi-seconde), la carte et sa sonde sont reprises de là (six faces sur
//    six images, puis un filtrage : invisible).
import * as THREE from 'three';
import { TELEPHONE } from './appareil.js';

const N_SPOTS = TELEPHONE ? 2 : 4;
const FONDU = 3.2;                 // /s : vitesse d'allumage et d'extinction d'un spot qui change de place
// (09/10 : CHAUD #FFE4BE -> #FFE9CC — côte à côte avec les photos 02 et 21, les murs blancs sortaient crème, le sol brun ;
// la lumière des plafonniers est chaude, mais l'œil la ramène vers le blanc)
const CHAUD = new THREE.Color(0xffe9cc), JOUR = new THREE.Color(0xdde8f4);

export class LumieresEcole {
  // lampes : [{ x, z, h, zone, type ('spot' | 'opale' | 'tube' | 'jour'), force, cx, cz (visée du jour) }] en monde
  // zones  : [{ id, rects: [[x0, z0, x1, z1]], voisines: [id], env: { x, y, z } }]
  constructor(scene, { lampes, zones }) {
    this.scene = scene; this.lampes = lampes; this.zones = zones;
    this.parId = new Map(zones.map((z) => [z.id, z]));
    this.slots = [];
    for (let i = 0; i < N_SPOTS; i++) {
      const l = new THREE.SpotLight(0xffe2c0, 0, 7.5, 1.12, 0.85, 2);
      l.castShadow = false; l.position.set(0, -50, 0); l.target.position.set(0, -60, 0);
      scene.add(l); scene.add(l.target);
      this.slots.push({ l, lampe: null, k: 0 });
    }
    this.zone = null; this._zoneT = 0; this._envZone = null; this._choixT = 0; this._px = 1e9; this._pz = 1e9;
    this.force = 1;                // réglage global (calé sur les photos)
  }

  // la zone sous (x, z) pour des pieds à `y` (un rectangle peut demander une hauteur minimale : le palier de l'étage)
  zoneEn(x, z, y = 0) {
    for (const Z of this.zones) for (const r of Z.rects) if (x >= r[0] && x <= r[2] && z >= r[1] && z <= r[3] && !(r[4] > 0 && y < r[4])) return Z;
    return null;
  }

  // À chaque image : la zone de Haythem, le choix des spots, leurs fondus, la carte d'environnement de la zone
  maj(dt, px, pz, renderer, py = 0) {
    const Z = this.zoneEn(px, pz, py);
    if (Z && Z !== this.zone) { this.zone = Z; this._zoneT = 0; this._choixT = 0; }
    this._zoneT += dt;
    // LE CHOIX des lampes (5 fois par seconde, ou dès qu'il a bougé de 40 cm)
    this._choixT -= dt;
    if (this.zone && (this._choixT <= 0 || Math.hypot(px - this._px, pz - this._pz) > 0.4)) {
      this._choixT = 0.2; this._px = px; this._pz = pz;
      // les lampes de SA pièce, et celles des pièces qui s'y ouvrent — sauf, chez les voisines, celles qui sont plus haut
      // qu'un plafond ordinaire (la cage d'escalier) : sans ombre, leur cône traverserait les dalles et les murs
      const vois = new Set(this.zone.voisines || []), ici = this.zone.id;
      const cand = this.lampes.filter((L) => L.type !== 'aucune' && (L.zone === ici || (vois.has(L.zone) && L.h <= 2.8)));
      cand.sort((a, b) => ((a.x - px) ** 2 + (a.z - pz) ** 2) / (a.poids || 1) - ((b.x - px) ** 2 + (b.z - pz) ** 2) / (b.poids || 1));
      this._cible = new Set(cand.slice(0, N_SPOTS));
    }
    const cible = this._cible || new Set();
    for (const S of this.slots) if (S.lampe && !cible.has(S.lampe)) S.sortir = true; else S.sortir = false;
    for (const L of cible) {
      if (this.slots.some((S) => S.lampe === L)) continue;
      const S = this.slots.find((s) => !s.lampe);
      if (!S) break;
      S.lampe = L; S.k = 0; S.sortir = false;
      const l = S.l;
      if (L.type === 'jour') {
        l.position.set(L.x, L.h, L.z); l.target.position.set(L.cx, 0, L.cz);
        l.color.copy(JOUR); l.angle = 1.0; l.penumbra = 1; l.distance = 9;
      } else {
        l.position.set(L.x, L.h - 0.04, L.z); l.target.position.set(L.x, 0, L.z);
        l.color.copy(CHAUD); l.angle = L.type === 'tube' ? 1.3 : 1.12; l.penumbra = 0.85; l.distance = 7.5;
      }
      l.target.updateMatrixWorld();
    }
    for (const S of this.slots) {
      if (!S.lampe) { S.l.intensity = 0; continue; }
      S.k = Math.max(0, Math.min(1, S.k + (S.sortir ? -dt : dt) * FONDU));
      if (S.sortir && S.k <= 0) { S.lampe = null; S.l.intensity = 0; continue; }
      const e = S.k * S.k * (3 - 2 * S.k);
      S.l.intensity = (S.lampe.force ?? 1) * this.force * (S.lampe.type === 'jour' ? 9 : 5.5) * e;
    }
    // LA CARTE D'ENVIRONNEMENT de la zone, une demi-seconde après qu'il y est entré
    const env = this.scene.userData.envTerrain;
    if (this.zone && this._zoneT > 0.5 && this._envZone !== this.zone && this.zone.env && env && renderer) {
      this._envZone = this.zone;
      const P = this.zone.env, Q = this.scene.userData.pointEnv;
      if (!Q || Math.hypot(P.x - Q.x, P.y - Q.y, P.z - Q.z) > 0.5) {
        this.scene.userData.pointEnv = { ...P };
        env.capturer(renderer);
      }
    }
  }
}

// =====================================================================
//  LA LUMIÈRE CUITE AU SOL
// =====================================================================
// Les murs du monde solide, en segments (vus de dessus) : toute forme pleine pour le joueur qui monte au-dessus de 2 m
// depuis le sol (les vantaux des portes automatiques et les vitrages exceptés : la lumière y passe).
function segmentsMurs(C) {
  const seg = [];
  for (const s of C.formes) {
    if (!s.joueur || s.mobile || s.vitre || s.y0 > 0.3 || s.y1 < 2.0) continue;
    let pts;
    if (s.t === 'b') pts = [[s.x0, s.z0], [s.x1, s.z0], [s.x1, s.z1], [s.x0, s.z1]];
    else if (s.t === 'o') {
      pts = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => [s.cx + a * s.hx * s.c - b * s.hz * s.s, s.cz + a * s.hx * s.s + b * s.hz * s.c]);
    } else pts = [[s.x - s.r, s.z - s.r], [s.x + s.r, s.z - s.r], [s.x + s.r, s.z + s.r], [s.x - s.r, s.z + s.r]];
    for (let i = 0; i < 4; i++) { const a = pts[i], b = pts[(i + 1) % 4]; seg.push([a[0], a[1], b[0], b[1]]); }
  }
  return seg;
}
// le polygone de visibilité d'une source (x, z), de portée R : N rayons, chacun arrêté au premier mur
function visibilite(seg, x, z, R, N = 360) {
  const proches = seg.filter((s) => Math.min(s[0], s[2]) < x + R && Math.max(s[0], s[2]) > x - R && Math.min(s[1], s[3]) < z + R && Math.max(s[1], s[3]) > z - R);
  const pts = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2, dx = Math.cos(a), dz = Math.sin(a);
    let t = R;
    for (const s of proches) {
      const ex = s[2] - s[0], ez = s[3] - s[1], den = dx * ez - dz * ex;
      if (Math.abs(den) < 1e-9) continue;
      const wx = s[0] - x, wz = s[1] - z;
      const tt = (wx * ez - wz * ex) / den, u = (wx * dz - wz * dx) / den;
      if (tt > 0 && u >= 0 && u <= 1 && tt < t) t = tt;
    }
    pts.push([x + dx * t, z + dz * t]);
  }
  return pts;
}
// rect = { x0, z0, W, L } : le rectangle du sol (le même que l'ombre cuite : uv1 de 0 à 1, v = 1 au nord, z le plus petit)
export function cuireLumiereSol(C, lampes, rect, { tpm = 16, flou = 1.2 } = {}) {
  const w = Math.round(rect.W * tpm), h = Math.round(rect.L * tpm);
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const g = cv.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = 'lighter';
  const seg = segmentsMurs(C);
  const X = (x) => (x - rect.x0) * tpm, Y = (z) => (z - rect.z0) * tpm;
  const t0 = performance.now();
  for (const L of lampes) {
    if (L.cuire === false) continue;
    const jour = L.type === 'jour';
    // la source de la tache : sous le plafonnier, ou (le jour) au pied de l'ouverture, un peu dedans
    const sx = jour ? L.sx : L.x, sz = jour ? L.sz : L.z;
    const hh = jour ? 1.4 : L.h, R = jour ? 7 : Math.min(7, L.h * 2.6);
    const pts = visibilite(seg, jour ? L.ox : sx, jour ? L.oz : sz, R + 0.5);
    g.save();
    g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(X(p[0]), Y(p[1])) : g.moveTo(X(p[0]), Y(p[1])))); g.closePath(); g.clip();
    const gr = g.createRadialGradient(X(sx), Y(sz), 0, X(sx), Y(sz), R * tpm);
    const c = jour ? JOUR : CHAUD, pic = (L.cuireForce ?? 1) * (jour ? 0.62 : 0.5);
    for (let k = 0; k <= 10; k++) {
      const r = (k / 10) * R, e = Math.pow((hh * hh) / (hh * hh + r * r), 2) * (1 - k / 10);
      const v = (q) => Math.round(255 * Math.min(1, q * pic * e));
      gr.addColorStop(k / 10, `rgb(${v(c.r)},${v(c.g)},${v(c.b)})`);
    }
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.restore();
  }
  g.globalCompositeOperation = 'source-over';
  // un léger flou fond le bord des découpes (pénombre des montants de portes) ; un tramage casse les paliers de 8 bits
  const sortie = document.createElement('canvas'); sortie.width = w; sortie.height = h;
  const s = sortie.getContext('2d'); s.filter = `blur(${flou}px)`; s.drawImage(cv, 0, 0); s.filter = 'none';
  const img = s.getImageData(0, 0, w, h), d = img.data;
  for (let i = 0; i < d.length; i += 4) { const n = Math.random() - 0.5; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  s.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(sortie);
  tex.colorSpace = THREE.NoColorSpace; tex.channel = 1;
  tex.minFilter = THREE.LinearFilter; tex.magFilter = THREE.LinearFilter; tex.generateMipmaps = false;
  console.info('[lumière] sol cuit : %d sources, %d murs, %dx%d texels, %d ms', lampes.length, seg.length, w, h, Math.round(performance.now() - t0));
  return tex;
}
