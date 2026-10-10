// =====================================================================
//  LES PORTES ET LES FENÊTRES DE L'ÉCOLE IRIS
// =====================================================================
// Toutes les menuiseries du rez-de-chaussée, d'après les photos de Haythem :
//   - les portes GRISES (photos 01, 04, 06, 20) : vantail stratifié gris clair de 0,93 x 2,04 m, huisserie métallique
//     blanc cassé, oculus vertical étroit cerclé de noyer, béquille ou tirant inox, ferme-porte en applique ; simples ou
//     doubles (les portes coupe-feu de l'escalier, avec leur rail de ferme-porte sur toute la largeur et l'étiquette
//     rouge) ; les portes de la GAINE technique (photo 01) : affleurantes, sans oculus ;
//   - les portes VITRÉES du passage (photos 07, 19) : cadres d'aluminium laqué blanc, longs tirants blancs, les
//     autocollants « iris » sur deux rangs ; et celle du bureau B (photo 03) ;
//   - la PORTE D'ENTRÉE n° 6 (photos 03, 16) : double porte vitrée en aluminium gris, imposte, fixe à gauche, les
//     vitrophanies de l'école (arcs, nuage, visage) — vues à l'envers depuis le hall ;
//   - la porte BLEUE du fond du couloir C05 (photos 05, 23) : celle de la salle David Clark (Si 0.2), verre dépoli bleu
//     qui s'allume du jour de ses fenêtres (ce n'était pas une issue de secours, 09/10) ;
//   - les FENÊTRES de la façade (barreaux noirs, menuiserie brun-noir, imposte) et les jours de souffrance dépolis.
//
// TROIS ÉTATS d'une porte :
//   'fermee'  : un vantail fermé, et un MUR pour le joueur et la caméra (les pièces qu'on n'a jamais vues : bureaux, WC,
//               salle A, gaine, sous-sol…). Cousue avec le décor.
//   'ouverte' : un vantail ouvert à demeure (le vantail gauche de l'escalier, photo 20). Cousue avec le décor.
//   'auto'    : la porte S'OUVRE TOUTE SEULE devant Haythem (entrée, passage, escalier) et se referme derrière lui : ses
//               vantaux tournent sur leurs gonds (0,35 s), toujours du côté opposé à celui d'où il arrive ; fermée, elle
//               est un mur (une forme MOBILE du monde solide, js/collisions.js : `off` quand elle s'ouvre).
// Le repère d'une porte : x le long du mur (l'ouverture va de -l/2 à +l/2), z la normale du mur (`cote` +1 ou -1 : la
// face où se pose le vantail fermé), y vers le haut. `rot` : la rotation du mur (comme poserMur, js/carte_ecole.js).
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { nePasFusionner, canvasTex } from './kit_decor.js';
import { texAutocollantIris, texAffiche } from './ecole_matieres.js';

// Une boîte dont les UV sont en MÈTRES (u le long de la face, v vers le haut)
export function boiteM(w, h, d) {
  const g = new THREE.BoxGeometry(w, h, d);
  const p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i));
    if (ax > 0.5) uv.setXY(i, z, y); else if (ay > 0.5) uv.setXY(i, x, z); else uv.setXY(i, x, y);
  }
  return g;
}
export function maille(geo, mat, x, y, z, rotY = 0, parent = null, { ombre = true, recoit = true } = {}) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z); m.rotation.y = rotY;
  m.castShadow = ombre; m.receiveShadow = recoit;
  if (parent) parent.add(m);
  return m;
}
// Un plan (affiche, panneau) : `face` +1 regarde vers +z du repère, -1 vers -z
function plan(parent, mat, w, h, x, y, z, face = 1) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  m.position.set(x, y, z); if (face < 0) m.rotation.y = Math.PI;
  m.castShadow = false; m.receiveShadow = true;
  parent.add(m);
  return m;
}

// LA FUSION LOCALE : les maillages opaques d'un groupe (un vantail) cousus en UN maillage par matériau, dans le repère
// du groupe — un vantail qui tourne ne coûte plus que quelques appels de dessin. Les transparents restent à part.
const _inv = new THREE.Matrix4(), _m = new THREE.Matrix4();
export function fusionnerLocal(g) {
  g.updateMatrixWorld(true);
  _inv.copy(g.matrixWorld).invert();
  const parMat = new Map(), aRetirer = [];
  g.traverse((o) => {
    if (!o.isMesh || o === g || o.material.transparent || o.material.alphaTest > 0) return;
    const cle = o.material.uuid + '#' + o.castShadow + Object.keys(o.geometry.attributes).sort().join(',') + !!o.geometry.index;
    if (!parMat.has(cle)) parMat.set(cle, []);
    parMat.get(cle).push(o);
  });
  for (const [, lot] of parMat) {
    if (lot.length < 2) continue;
    const geos = lot.map((o) => { _m.multiplyMatrices(_inv, o.matrixWorld); const q = o.geometry.clone(); q.applyMatrix4(_m); return q; });
    const melange = mergeGeometries(geos, false);
    for (const q of geos) q.dispose();
    if (!melange) continue;
    const bloc = new THREE.Mesh(melange, lot[0].material);
    bloc.castShadow = lot[0].castShadow; bloc.receiveShadow = true;
    g.add(bloc);
    for (const o of lot) aRetirer.push(o);
  }
  for (const o of aRetirer) { o.parent.remove(o); o.geometry.dispose(); }
  return g;
}

// =====================================================================
//  LES VITROPHANIES DE LA PORTE 6 (photo 16 de 2026 ; VO 5,1 s côté rue, 93-95 s côté hall ; 10/10)
// =====================================================================
// La face RUE (photo 16, recadrée et cotée contre la largeur de la porte) : sur le fixe ouest, en bas, un quart de
// cible « low poly » — quatre bandes épaisses, orange saumon, rouge, magenta, autour d'un centre au pied du montant
// ouest — qui déborde sur le vantail ouest ; sur les deux vantaux, le NUAGE « low poly » bleu (x 14,48-15,87, h 1,31-1,94)
// et, posé sur son coin haut gauche, le TRAIT JAUNE en équerre (le coin du logo) ; sous le nuage, le petit pavé noir
// « iris » au premier i jaune, et sa phrase « Connectez / -vous » en orange, « aux métiers / de demain » en blanc ;
// l'étiquette blanche à liseré et flèche orange (vantail ouest, 1,6-1,8 m) ; l'interdiction de fumer (vantail est,
// 1,6-1,9 m) ; l'origami violet sous le nuage ; en bas du vantail est, le GRAND VISAGE d'un jeune homme qui lève les
// yeux, coupé par le montant (un œil seulement), en couleurs de photo ; deux feuilles A4 et une pastille bleue sur le
// fixe. Une texture pour toute la largeur vitrée (x 13,45 à 16,35, 2,25 m de haut) ; transparente hors des adhésifs.
// La face HALL (VO 93-95 s, photos 03, 24) : la même découpe vue à l'envers — le nuage et l'équerre en gris violacé (le
// dos de l'adhésif), le pavé noir et son « iris » en miroir, mais LE VISAGE, LES ARCS ET L'ORIGAMI EN COULEUR (imprimés
// recto verso), plus sombres ; la pastille jaune côté hall seulement.
function texVitrophanie(dos = false) {
  const W = 1024, H = 800;   // 2,9 m x 2,25 m
  return canvasTex(W, H, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    const mx = w / 2.9, my = h / 2.25, X = (x) => (x - 13.45) * mx, Y = (y) => h - y * my;
    let sx = 3;
    const alea = () => { sx = (sx * 16807) % 2147483647; return sx / 2147483647; };
    // deux teintes #rrggbb mêlées (t de 0 à 1) ; une teinte éclaircie (d > 0) ou assombrie (d < 0)
    const melange = (a, b, t) => {
      const A = parseInt(a.slice(1), 16), Bc = parseInt(b.slice(1), 16), l = (s) => Math.round(((A >> s) & 255) * (1 - t) + ((Bc >> s) & 255) * t);
      return '#' + [l(16), l(8), l(0)].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
    };
    const nuance = (c, d) => melange(c, d > 0 ? '#ffffff' : '#000000', Math.abs(d));
    // le dos d'une impression, vu du hall : la teinte assombrie (`k`) et un peu grisée (`gris`)
    const dosCouleur = (c, k = 0.6, gris = 0.25) => {
      const v = parseInt(c.slice(1), 16), r = v >> 16, gg = (v >> 8) & 255, b = v & 255, m = (r + gg + b) / 3;
      const f = (u) => Math.round(((1 - gris) * u + gris * m) * k);
      return `rgb(${f(r)},${f(gg)},${f(b)})`;
    };
    // une facette (polygone du plan de la porte : x, h), bordée de sa propre teinte (pas de jour entre deux facettes)
    const facette = (pts, c) => {
      g.fillStyle = c; g.strokeStyle = c; g.lineWidth = 1;
      g.beginPath(); g.moveTo(X(pts[0][0]), Y(pts[0][1])); for (const [x, y] of pts.slice(1)) g.lineTo(X(x), Y(y)); g.closePath(); g.fill(); g.stroke();
    };

    // ---- LE QUART DE CIBLE (fixe ouest, en bas) : quatre bandes de facettes ; la teinte glisse le long de l'arc, du haut
    // (orange saumon) vers la droite (magenta) ; la bande intérieure est un quart de disque plein ----
    const cx = 13.42, cy = 0.0;
    const bandes = [[1.02, 0.84, ['#f3a06a', '#e8463f', '#d2347f']], [0.72, 0.55, ['#ef6c3c', '#d93a57', '#c3308a']],
      [0.45, 0.29, ['#e0507a', '#d0368c', '#c02f92']], [0.16, 0.0, ['#c8318c', '#c02f92', '#b52c90']]];
    for (const [R0, R1, cols] of bandes) {
      const n = Math.max(3, Math.round(R0 * 11));
      for (let i = 0; i < n; i++) {
        const a0 = i / n * Math.PI / 2, a1 = (i + 1) / n * Math.PI / 2, t = (i + 0.5) / n;
        const base = t < 0.5 ? melange(cols[0], cols[1], t * 2) : melange(cols[1], cols[2], t * 2 - 1);
        const P = (r, a) => [cx + r * Math.sin(a), cy + r * Math.cos(a)];
        const am = (a0 + a1) / 2, rm = (R0 + R1) / 2 + (alea() - 0.5) * (R0 - R1) * 0.4;
        const morceaux = R1 > 0 ? [[P(R1, a0), P(R0, a0), P(rm, am)], [P(R0, a0), P(R0, a1), P(rm, am)], [P(R0, a1), P(R1, a1), P(rm, am)], [P(R1, a1), P(R1, a0), P(rm, am)]]
          : [[[cx, cy], P(R0, a0), P(R0, a1)]];
        for (const q of morceaux) { const c = nuance(base, (alea() - 0.45) * 0.22); facette(q, dos ? dosCouleur(c, 0.62) : c); }
      }
    }
    // ---- LE NUAGE « LOW POLY » : cinq lobes, le dessous plat ; une grille de points tremblés, triangulée ; chaque facette
    // prend un bleu selon sa place (sombre en bas à gauche, clair en haut à droite) ----
    const lobes = [[14.66, 1.46, 0.17], [14.96, 1.55, 0.34], [15.23, 1.52, 0.24], [15.5, 1.65, 0.33], [15.7, 1.49, 0.17]];
    const dedans = (x, y) => y > 1.31 && lobes.some(([lx, ly, r]) => (x - lx) ** 2 + (y - ly) ** 2 < r * r);
    const pas = 0.085, gr0 = [];
    for (let j = 0; j <= 9; j++) { gr0.push([]); for (let i = 0; i <= 18; i++) gr0[j].push([14.44 + i * pas + (alea() - 0.5) * pas * 0.7, 1.24 + j * pas + (alea() - 0.5) * pas * 0.7]); }
    // (relecture 10/10 : un peu moins saturés — photo 16, VO 5,1 s : du bleu ciel grisé au bleu marine)
    const bleus = ['#30407e', '#43609f', '#6182bb', '#88a7d2', '#b2c9e6'], gris = ['#625e78', '#6e6a84', '#7a7690', '#86839b', '#9390a6'];
    for (let j = 0; j < 9; j++) for (let i = 0; i < 18; i++) {
      const p00 = gr0[j][i], p10 = gr0[j][i + 1], p01 = gr0[j + 1][i], p11 = gr0[j + 1][i + 1];
      for (const t of [[p00, p10, p11], [p00, p11, p01]]) {
        const tx = (t[0][0] + t[1][0] + t[2][0]) / 3, ty = (t[0][1] + t[1][1] + t[2][1]) / 3;
        if (!dedans(tx, ty)) continue;
        // (le dessous coupé net : les sommets sous la ligne remontent sur elle)
        const q = t.map(([x, y]) => [x, Math.max(1.31, y)]);
        const k = Math.max(0, Math.min(4, Math.round(1.5 + (ty - 1.6) * 5 + (tx - 15.15) * 1.3 + (alea() - 0.5) * 2.2)));
        facette(q, (dos ? gris : bleus)[k]);
      }
    }
    // (relecture 10/10 : côté rue, le réseau de fins traits blancs et de points qui court sur le nuage — photo 16 et VO
    // 5,1 s, une « constellation » clairsemée ; une arête sur six, les sommets touchés pointés)
    if (!dos) {
      const ok = ([x, y]) => dedans(x, Math.max(1.315, y)), pts = [];
      g.strokeStyle = 'rgba(255,255,255,0.42)'; g.lineWidth = 0.9;
      for (let j = 0; j < 9; j++) for (let i = 0; i < 18; i++) {
        const a = gr0[j][i];
        for (const b of [gr0[j][i + 1], gr0[j + 1][i], gr0[j + 1][i + 1]]) {
          if (alea() > 0.17 || !ok(a) || !ok(b)) continue;
          const A = [a[0], Math.max(1.315, a[1])], Bp = [b[0], Math.max(1.315, b[1])];
          g.beginPath(); g.moveTo(X(A[0]), Y(A[1])); g.lineTo(X(Bp[0]), Y(Bp[1])); g.stroke(); pts.push(A, Bp);
        }
      }
      g.fillStyle = 'rgba(255,255,255,0.75)';
      for (const [x, y] of pts) { g.beginPath(); g.arc(X(x), Y(y), 1.4, 0, 7); g.fill(); }
    }
    // ---- LE TRAIT JAUNE EN ÉQUERRE (le coin du logo) : il borde le haut gauche du nuage, juste au-dessus du lobe gauche
    // (photo 16 : la branche verticale en x 14,82 de 1,66 à 1,93 m, la branche horizontale jusqu'en x 15,08) ----
    g.fillStyle = dos ? 'rgb(96,94,110)' : '#f1b40c';
    g.fillRect(X(14.82), Y(1.93), 0.03 * mx, 0.27 * my); g.fillRect(X(14.82), Y(1.93), 0.26 * mx, 0.03 * my);
    // ---- L'ORIGAMI VIOLET sous le lobe droit (x 15,46-15,81, h 0,95-1,31) ----
    const oA = [15.47, 1.3], oB = [15.63, 1.29], oC = [15.81, 1.19], oD = [15.66, 0.96], oE = [15.56, 1.11];
    for (const [q, c] of [[[oA, oB, oE], '#bba7df'], [[oB, oC, oE], '#9c83c9'], [[oE, oC, oD], '#7a5fae'], [[oA, oE, oD], '#8d74bf']]) facette(q, dos ? dosCouleur(c, 0.72, 0.15) : c);
    // ---- LE PAVÉ NOIR « iris » (x 14,52-14,90, h 1,06-1,22) : vu du hall, le même dessin en miroir ----
    g.fillStyle = '#111111'; g.fillRect(X(14.52), Y(1.22), 0.38 * mx, 0.16 * my);
    g.font = `600 ${Math.round(0.12 * my)}px "Century Gothic", "Avenir", "Segoe UI", sans-serif`; g.textBaseline = 'alphabetic';
    const xi = X(14.57), yi = Y(1.09);
    g.fillStyle = dos ? '#dcdcdc' : '#f1b40c'; g.fillText('i', xi, yi);
    g.fillStyle = dos ? '#dcdcdc' : '#ffffff'; g.fillText('ris', xi + g.measureText('i').width, yi);
    if (!dos) {
      // la phrase, sur le verre nu
      g.font = `600 ${Math.round(0.038 * my)}px "Segoe UI", sans-serif`;
      [['Connectez', '#f08a24'], ['-vous', '#f08a24'], ['aux métiers', '#ffffff'], ['de demain', '#ffffff']].forEach(([t, c], i) => { g.fillStyle = c; g.fillText(t, X(14.53), Y(1.0 - i * 0.046)); });
    }
    // ---- L'ÉTIQUETTE BLANCHE à liseré et flèche orange (vantail ouest, x 14,36-14,68, h 1,58-1,80 ; vue des deux côtés) ----
    g.fillStyle = '#f7f6f2'; g.fillRect(X(14.36), Y(1.8), 0.32 * mx, 0.22 * my);
    g.fillStyle = '#ef7d22'; g.fillRect(X(14.36), Y(1.61), 0.32 * mx, 0.03 * my);
    if (!dos) {
      g.fillStyle = '#1b1b1d'; g.fillRect(X(14.39), Y(1.77), 0.07 * mx, 0.035 * my);
      g.fillStyle = '#7b7b80'; g.fillRect(X(14.48), Y(1.765), 0.16 * mx, 0.012 * my); g.fillRect(X(14.48), Y(1.74), 0.12 * mx, 0.012 * my);
      g.strokeStyle = '#ef7d22'; g.lineWidth = 0.014 * mx; g.lineCap = 'round';
      g.beginPath(); g.moveTo(X(14.62), Y(1.685)); g.lineTo(X(14.42), Y(1.685)); g.moveTo(X(14.47), Y(1.71)); g.lineTo(X(14.42), Y(1.685)); g.lineTo(X(14.47), Y(1.66)); g.stroke();
    }
    // ---- L'INTERDICTION DE FUMER (vantail est, x 15,74-15,96, h 1,62-1,90 — relecture 10/10 : photo 16, 0,48 à 0,70 m du
    // montant central ; les trois bandes bleues sont à sa droite) ----
    const xf = 15.74;
    g.fillStyle = dos ? 'rgba(236,236,232,0.95)' : '#f7f6f2'; g.fillRect(X(xf), Y(1.9), 0.22 * mx, 0.28 * my);
    if (!dos) {
      g.strokeStyle = '#d0262d'; g.lineWidth = 0.012 * mx; g.beginPath(); g.arc(X(xf + 0.11), Y(1.81), 0.055 * mx, 0, 7);
      g.moveTo(X(xf + 0.07), Y(1.85)); g.lineTo(X(xf + 0.15), Y(1.77)); g.stroke();
      g.fillStyle = '#1b1b1d'; g.fillRect(X(xf + 0.07), Y(1.825), 0.07 * mx, 0.016 * my);
      g.fillStyle = '#5a5a5e'; for (let k = 0; k < 3; k++) g.fillRect(X(xf + 0.03), Y(1.72 - k * 0.03), 0.16 * mx, 0.01 * my);
    }
    // ---- LES TROIS BANDES contre le montant est (relecture 10/10 : photo 16, bleu clair côté rue, à droite de
    // l'interdiction de fumer ; VO 93,6 et 95,4 s et photo 03, trois traits sombres vus du hall, x 15,97-16,13, 1,45-1,85 m) ----
    g.fillStyle = dos ? '#3a3b40' : '#86b7da';
    for (const hb of [1.8, 1.65, 1.5]) g.fillRect(X(15.97), Y(hb + 0.035), 0.16 * mx, 0.07 * my);
    // ---- DEUX FEUILLES A4 et la pastille bleue sur le fixe ouest ----
    g.fillStyle = dos ? 'rgba(245,245,240,0.95)' : 'rgba(250,250,246,0.95)';
    g.fillRect(X(13.48), Y(1.88), 0.23 * mx, 0.28 * my); g.fillRect(X(13.72), Y(1.88), 0.21 * mx, 0.36 * my);
    if (!dos) { g.fillStyle = '#9aa0a6'; for (let k = 0; k < 6; k++) { g.fillRect(X(13.51), Y(1.83 - k * 0.035), 0.16 * mx, 0.008 * my); g.fillRect(X(13.75), Y(1.83 - k * 0.045), 0.15 * mx, 0.008 * my); } }
    g.fillStyle = dos ? '#c9c9c6' : '#2f6fb0'; g.fillRect(X(13.97), Y(1.46), 0.15 * mx, 0.1 * my);
    if (!dos) { g.fillStyle = '#ffffff'; g.fillRect(X(14.0), Y(1.42), 0.09 * mx, 0.02 * my); }
    // ---- LA PASTILLE JAUNE à pictogramme noir (côté hall, VO 93,6 s : vantail est, ≈ 1,25 m) ----
    if (dos) {
      g.fillStyle = '#f2c21a'; g.fillRect(X(16.0), Y(1.31), 0.11 * mx, 0.11 * my);
      g.strokeStyle = '#1b1b1d'; g.lineWidth = 0.008 * mx; g.beginPath(); g.arc(X(16.055), Y(1.255), 0.035 * mx, 0, 7); g.stroke();
      g.fillStyle = '#1b1b1d'; g.beginPath(); g.arc(X(16.055), Y(1.255), 0.012 * mx, 0, 7); g.fill();
    }
    // ---- LE VISAGE (en bas du vantail est, coupé par le montant à x 16,18 ; photo 16 : la peau dès x 15,63, l'œil gauche
    // en x 15,89 à 0,29 m, les sourcils levés, les cheveux bruns courts ; le bas du visage passe sous la vitre) ----
    {
      const fx = X(16.05), fy = Y(0.3), rx = 0.4 * mx, ry = 0.56 * my;
      g.save();
      g.beginPath(); g.rect(X(15.55), Y(0.95), 0.63 * mx, 0.95 * my); g.clip();
      // la tête (le bas sous la vitre) ; la peau, éclairée de la gauche
      const peau = g.createRadialGradient(fx - rx * 0.35, fy - ry * 0.35, rx * 0.1, fx, fy, rx * 1.05);
      peau.addColorStop(0, '#f6d8c2'); peau.addColorStop(0.55, '#e6b99c'); peau.addColorStop(1, '#bc8a72');
      g.fillStyle = peau; g.beginPath(); g.ellipse(fx, fy + ry * 0.12, rx * 0.95, ry, 0, 0, Math.PI * 2); g.fill();
      // l'oreille gauche
      g.fillStyle = '#c48a6e'; g.beginPath(); g.ellipse(fx - rx * 0.97, fy + ry * 0.05, rx * 0.1, ry * 0.2, 0.1, 0, Math.PI * 2); g.fill();
      // les cheveux : la calotte sombre, la ligne du front, les tempes, quelques mèches
      g.fillStyle = '#2a1c16'; g.beginPath();
      g.moveTo(fx - rx * 1.02, fy - ry * 0.15);
      g.quadraticCurveTo(fx - rx * 1.05, fy - ry * 1.05, fx, fy - ry * 1.02);
      g.quadraticCurveTo(fx + rx * 1.05, fy - ry * 1.05, fx + rx * 1.02, fy - ry * 0.15);
      g.lineTo(fx + rx * 0.8, fy - ry * 0.35);
      g.quadraticCurveTo(fx + rx * 0.5, fy - ry * 0.66, fx, fy - ry * 0.62);
      g.quadraticCurveTo(fx - rx * 0.55, fy - ry * 0.66, fx - rx * 0.82, fy - ry * 0.32);
      g.closePath(); g.fill();
      g.fillStyle = 'rgba(90,60,44,0.35)'; for (let k = 0; k < 40; k++) { const a = alea() * Math.PI, r = rx * (0.7 + alea() * 0.3); g.fillRect(fx - Math.cos(a) * r, fy - ry * 0.75 - Math.sin(a) * ry * 0.25, 2, 6); }
      // les sourcils levés
      for (const s2 of [-1, 1]) { g.fillStyle = '#2b1a12'; g.beginPath(); g.ellipse(fx + s2 * rx * 0.4, fy - ry * 0.2, rx * 0.25, ry * 0.035, s2 * 0.08, 0, Math.PI * 2); g.fill(); }
      // les yeux levés : le pli de la paupière, l'amande, le blanc, l'iris brun sous la paupière du haut, le reflet
      for (const s2 of [-1, 1]) {
        const ex = fx + s2 * rx * 0.4, ey = fy;
        g.fillStyle = '#b97e64'; g.beginPath(); g.ellipse(ex, ey - ry * 0.035, rx * 0.2, ry * 0.07, 0, Math.PI, Math.PI * 2); g.fill();
        g.save(); g.beginPath(); g.ellipse(ex, ey, rx * 0.16, ry * 0.05, 0, 0, Math.PI * 2); g.clip();
        g.fillStyle = '#f3ede8'; g.fillRect(ex - rx * 0.2, ey - ry * 0.08, rx * 0.4, ry * 0.16);
        g.fillStyle = '#4a2c1a'; g.beginPath(); g.arc(ex + s2 * rx * 0.01, ey - ry * 0.04, rx * 0.075, 0, 7); g.fill();
        g.fillStyle = '#120a06'; g.beginPath(); g.arc(ex + s2 * rx * 0.01, ey - ry * 0.045, rx * 0.035, 0, 7); g.fill();
        g.fillStyle = 'rgba(255,255,255,0.85)'; g.beginPath(); g.arc(ex - rx * 0.02, ey - ry * 0.055, rx * 0.012, 0, 7); g.fill();
        g.restore();
        g.strokeStyle = '#3a2216'; g.lineWidth = 2.2; g.beginPath(); g.ellipse(ex, ey, rx * 0.16, ry * 0.05, 0, Math.PI * 1.02, Math.PI * 1.98); g.stroke();
      }
      // le nez (l'arête dans l'ombre, la pointe sous la vitre)
      const nz = g.createLinearGradient(fx - rx * 0.12, 0, fx + rx * 0.12, 0);
      nz.addColorStop(0, 'rgba(150,96,74,0)'); nz.addColorStop(0.6, 'rgba(150,96,74,0.45)'); nz.addColorStop(1, 'rgba(150,96,74,0)');
      g.fillStyle = nz; g.fillRect(fx - rx * 0.12, fy - ry * 0.05, rx * 0.24, ry * 0.6);
      g.restore();
      // (vu du hall, l'impression est un rien plus terne)
      if (dos) { g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(60,52,60,0.12)'; g.fillRect(X(15.55), Y(0.95), 0.63 * mx, 0.95 * my); g.globalCompositeOperation = 'source-over'; }
    }
  }, null, true, 8);
}

// =====================================================================
//  LES PORTES
// =====================================================================
const ANGLE_AUTO = 1.45;        // rad : l'ouverture d'une porte automatique (83°)
const RAYON_AUTO = 2.1;         // m : à cette distance de son centre, la porte s'ouvre
const DUREE = 0.38;             // s : le temps d'ouvrir (de refermer : 1,6 fois plus)

export class Portes {
  constructor(C, M, decor) {
    this.C = C; this.M = M; this.decor = decor;
    this.auto = [];               // les portes qui s'ouvrent toutes seules (maj)
    this._autocollant = null; this._notices = null;
  }

  // Les matériaux d'affichettes, partagés
  _matNotice() {
    if (!this._notices) {
      this._notices = ['#2f6fb0', '#e07b2a', '#3e9b6b', '#7b2a6e'].map((c, i) => new THREE.MeshStandardMaterial({ map: texAffiche(c, '#fbfbf8', i + 11), roughness: 0.75 }));
    }
    return this._notices;
  }
  _matAutocollant() {
    return this._autocollant || (this._autocollant = new THREE.MeshStandardMaterial({ map: texAutocollantIris(), roughness: 0.5 }));
  }

  // ---------------------------------------------------------------- les vantaux
  // UN VANTAIL GRIS (photos 04, 06, 20) : `w` de large, `h` de haut, `s` = +1 (gonds à gauche, le vantail part vers +x)
  // ou -1. `feu` : étiquette rouge « porte coupe-feu » ; `oculus` : la fente vitrée cerclée de noyer (true ; 'long' :
  // la fente de 10 x 125 cm des portes de l'escalier est, photos 23, 24 ; ou ses cotes { bas, haut, l, bord, cadre } :
  // la fente haute des toilettes du C05, photo 23 — `bord` : de l'axe de la fente au chant libre, `cadre` : la largeur
  // du noyer) ; `poignee` : 'bequille' | 'tirant' | null ; `notices` : affichettes A4 (face +z).
  _vantailGris(w, h, s, { feu = false, oculus = true, poignee = 'bequille', notices = 0, mat = null } = {}) {
    const M = this.M, g = new THREE.Group(), e = 0.04;
    const cx = s * w / 2;
    maille(boiteM(w - 0.012, h - 0.012, e), mat || M.porte, cx, h / 2, 0, 0, g);
    if (oculus) {
      // la fente : 0,12 x 0,85 à partir de 1 m, côté poignée ; cadre de noyer de 3 cm ('long' : 0,10 x 1,25 dès 0,6 m)
      const D = { bas: 1.0, haut: 1.85, l: 0.12, bord: 0.24, cadre: 0.03 };
      const O = oculus === true ? D : oculus === 'long' ? { ...D, bas: 0.6, l: 0.1 } : { ...D, ...oculus };
      const ox = s * (w - O.bord), oy = (O.bas + O.haut) / 2, oh = O.haut - O.bas, ol = O.l, c = O.cadre;
      for (const z of [e / 2 + 0.004, -e / 2 - 0.004]) {
        maille(boiteM(ol + 2 * c, c, 0.01), M.noyer, ox, oy + oh / 2 + c / 2, z, 0, g, { ombre: false });
        maille(boiteM(ol + 2 * c, c, 0.01), M.noyer, ox, oy - oh / 2 - c / 2, z, 0, g, { ombre: false });
        maille(boiteM(c, oh + 2 * c, 0.01), M.noyer, ox - ol / 2 - c / 2, oy, z, 0, g, { ombre: false });
        maille(boiteM(c, oh + 2 * c, 0.01), M.noyer, ox + ol / 2 + c / 2, oy, z, 0, g, { ombre: false });
      }
      maille(boiteM(ol, oh, e + 0.004), M.vitreFente, ox, oy, 0, 0, g, { ombre: false });
    }
    if (poignee === 'bequille') {
      for (const z of [1, -1]) {
        maille(boiteM(0.05, 0.16, 0.012), M.inox, s * (w - 0.07), 1.02, z * (e / 2 + 0.006), 0, g, { ombre: false });
        maille(boiteM(0.13, 0.02, 0.02), M.inox, s * (w - 0.12), 1.06, z * (e / 2 + 0.05), 0, g, { ombre: false });
        maille(boiteM(0.02, 0.02, 0.05), M.inox, s * (w - 0.07), 1.06, z * (e / 2 + 0.025), 0, g, { ombre: false });
      }
    } else if (poignee === 'tirant') {
      for (const z of [1, -1]) {
        maille(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 10), M.inox, s * (w - 0.08), 1.05, z * (e / 2 + 0.045), 0, g, { ombre: false });
        for (const dy of [-0.12, 0.12]) maille(boiteM(0.018, 0.018, 0.045), M.inox, s * (w - 0.08), 1.05 + dy, z * (e / 2 + 0.022), 0, g, { ombre: false });
      }
    }
    if (feu) maille(boiteM(0.12, 0.04, 0.004), M.rougeEtiquette, s * (w - 0.18), h - 0.12, e / 2 + 0.003, 0, g, { ombre: false });
    const N = this._matNotice();
    for (let i = 0; i < notices; i++) plan(g, N[i % N.length], 0.21, 0.297, s * (w * 0.5 + (i - (notices - 1) / 2) * 0.24), 1.62, e / 2 + 0.003);
    return g;
  }
  // UN VANTAIL VITRÉ À CADRE D'ALUMINIUM (photos 07, 19, 03) : `blanc` (passage, bureau B) ou gris (entrée)
  _vantailVitre(w, h, s, { blanc = true, tirant = 'long', autocollants = false } = {}) {
    const M = this.M, g = new THREE.Group(), c = blanc ? 0.07 : 0.06, e = 0.05, mat = blanc ? M.alu : M.aluGris;
    const cx = s * w / 2;
    maille(boiteM(w - 0.01, c, e), mat, cx, c / 2, 0, 0, g);
    maille(boiteM(w - 0.01, c * (blanc ? 1.4 : 1), e), mat, cx, h - c * 0.7, 0, 0, g);
    maille(boiteM(c, h, e), mat, s * c / 2, h / 2, 0, 0, g);
    maille(boiteM(c, h, e), mat, s * (w - c / 2 - 0.005), h / 2, 0, 0, g);
    maille(new THREE.PlaneGeometry(w - 2 * c, h - 2 * c), M.verre, cx, h / 2, 0, 0, g, { ombre: false });
    // les tirants : long tube blanc de 1,2 m (passage) ou barre verticale grise centrale (entrée), des deux côtés
    const tx = s * (w - c - 0.06);
    for (const z of [1, -1]) {
      if (tirant === 'long') {
        maille(new THREE.CylinderGeometry(0.016, 0.016, 1.2, 10), blanc ? M.alu : M.inox, tx, 1.05, z * 0.075, 0, g, { ombre: false });
        for (const dy of [-0.5, 0.5]) maille(boiteM(0.02, 0.02, 0.05), blanc ? M.alu : M.inox, tx, 1.05 + dy, z * 0.045, 0, g, { ombre: false });
      } else if (tirant === 'court') {
        maille(new THREE.CylinderGeometry(0.012, 0.012, 0.35, 10), M.inox, tx, 1.05, z * 0.06, 0, g, { ombre: false });
      }
    }
    if (autocollants) {
      // `true` : deux rangées de quatre (h 1,0 et 1,55) ; sinon la liste des rangées [[hauteur, nombre], …] (un seul
      // autocollant : au milieu du vantail). Lisibles côté +z (le passage), le dos noir de l'autre côté.
      const A = this._matAutocollant();
      const rangs = autocollants === true ? [[1.0, 4], [1.55, 4]] : autocollants;
      for (const [y, nb] of rangs) for (let i = 0; i < nb; i++) {
        const x = nb === 1 ? s * w / 2 : s * (c + 0.06 + i * (w - 2 * c - 0.12) / 3.2);
        const p = plan(g, A, 0.11, 0.04, x, y, 0.004, 1);
        const q = plan(g, M.noirMat, 0.11, 0.04, x, y, -0.004, -1);
        p.userData.vitre = q.userData.vitre = true;
      }
    }
    return g;
  }
  // LE VANTAIL BLEU de la salle David Clark, au fond du C05 (photos 05, 23) : cadre d'aluminium laqué blanc, verre
  // dépoli bleu (le jour des fenêtres de la salle le traverse), béquille inox et cylindre côté serrure, la pastille
  // rouge en haut du montant de serrure (09/10)
  _vantailBleu(w, h, s) {
    const M = this.M, g = new THREE.Group(), c = 0.06, e = 0.045, cb = 0.1;
    const cx = s * w / 2;
    maille(boiteM(w - 0.01, cb, e), M.alu, cx, cb / 2, 0, 0, g);
    maille(boiteM(w - 0.01, c, e), M.alu, cx, h - c / 2, 0, 0, g);
    maille(boiteM(c, h, e), M.alu, s * c / 2, h / 2, 0, 0, g);
    maille(boiteM(c, h, e), M.alu, s * (w - c / 2 - 0.005), h / 2, 0, 0, g);
    maille(boiteM(w - 2 * c, h - c - cb, 0.012), M.depoliBleu, cx, cb + (h - c - cb) / 2, 0, 0, g, { ombre: false });
    const xs = s * (w - 0.035);
    for (const z of [1, -1]) {
      maille(boiteM(0.04, 0.15, 0.012), M.inox, xs, 1.02, z * (e / 2 + 0.006), 0, g, { ombre: false });
      maille(boiteM(0.13, 0.02, 0.02), M.inox, xs - s * 0.05, 1.06, z * (e / 2 + 0.05), 0, g, { ombre: false });
      maille(boiteM(0.02, 0.02, 0.05), M.inox, xs, 1.06, z * (e / 2 + 0.025), 0, g, { ombre: false });
      maille(new THREE.CylinderGeometry(0.012, 0.012, 0.01, 12), M.inox, xs, 0.94, z * (e / 2 + 0.005), 0, g, { ombre: false }).rotation.x = Math.PI / 2;
      maille(boiteM(0.045, 0.07, 0.003), M.rougeEtiquette, s * (w - 0.032), h - 0.13, z * (e / 2 + 0.002), 0, g, { ombre: false });
    }
    return g;
  }
  // UN VANTAIL AFFLEURANT de gaine technique (photo 01) : gris, sans oculus, petite serrure
  _vantailGaine(w, h, s) {
    const M = this.M, g = new THREE.Group();
    maille(boiteM(w - 0.01, h - 0.01, 0.035), M.porteGaine, s * w / 2, h / 2, 0, 0, g);
    maille(new THREE.CylinderGeometry(0.012, 0.012, 0.01, 10), M.inox, s * (w - 0.06), 1.1, 0.02, Math.PI / 2, g, { ombre: false }).rotation.x = Math.PI / 2;
    return g;
  }

  // ---------------------------------------------------------------- une porte
  // o = { cx, cz, rot, ep, l, h, modele, etat, cote, charniere, angle, feu, notices, nom }
  //  modele : 'grise' | 'grise2' (double) | 'gaine2' | 'vitree' | 'vitree2' | 'blanche' | 'bleue' (fond du C05)
  //  etat   : 'fermee' | 'ouverte' | 'auto' ; `angle` : l'ouverture d'un vantail 'ouverte' (rad)
  //  cote   : la face du mur (repère de la porte : +1 = +z) où se pose le vantail fermé
  //  ouverts : pour une double porte 'ouverte', lesquels des deux vantaux le sont ([true, false] : le gauche)
  ajouter(o) {
    const M = this.M, C = this.C;
    const g = new THREE.Group(); g.name = 'porte ' + (o.nom || o.modele);
    const base = o.base || 0;             // (une porte d'étage : posée sur le palier)
    g.position.set(o.cx, base, o.cz); g.rotation.y = o.rot;
    const l = o.l, h = o.h ?? 2.04, ep = o.ep ?? 0.15, cote = o.cote ?? 1;
    const double = /2$/.test(o.modele);
    // L'HUISSERIE : un cadre métallique autour de l'ouverture, qui déborde de 1 cm sur les deux faces du mur
    if (o.huisserie !== false) {
      const mh = o.modele.startsWith('vitree') ? M.alu : M.huisserie;
      for (const sx of [-1, 1]) maille(boiteM(0.05, h + 0.05, ep + 0.02), mh, sx * (l / 2 + 0.02), (h + 0.05) / 2, 0, 0, g);
      maille(boiteM(l + 0.09, 0.05, ep + 0.02), mh, 0, h + 0.025, 0, 0, g);
    }
    const zf = cote * (ep / 2 - 0.03);                     // le plan du vantail fermé, dans l'épaisseur du mur
    const vantaux = [];
    const faire = (w, s) => {
      // (`matVantail` : un autre stratifié — le gris taupe des portes de l'escalier est ; `poignee: null` : un semi-fixe)
      if (o.modele.startsWith('grise')) return this._vantailGris(w, h, s, { feu: o.feu, oculus: o.oculus ?? true, notices: s > 0 ? (o.notices || 0) : (o.noticesD ?? o.notices ?? 0), poignee: o.poignee !== undefined ? o.poignee : (double ? 'tirant' : 'bequille'), mat: o.matVantail || null });
      if (o.modele.startsWith('gaine')) return this._vantailGaine(w, h, s);
      if (o.modele === 'bleue') return this._vantailBleu(w, h, s);
      if (o.modele === 'blanche') return this._vantailGris(w, h, s, { oculus: false, mat: M.alu, poignee: 'bequille' });
      if (o.modele === 'noire') return this._vantailGris(w, h, s, { oculus: false, mat: M.acierNoir, poignee: null });
      // (`autocollants` : une fonction du vantail, s => rangées, quand les deux vantaux n'en portent pas autant)
      return this._vantailVitre(w, h, s, { blanc: o.blanc !== false, tirant: o.tirant || 'long', autocollants: typeof o.autocollants === 'function' ? o.autocollants(s) : !!o.autocollants });
    };
    if (double) {
      const w = l / 2;
      for (const s of [1, -1]) {
        const v = faire(w, s); v.position.set(-s * l / 2, 0, zf); g.add(v);
        vantaux.push({ g: v, s });
      }
    } else {
      const s = o.charniere === 'd' ? -1 : 1;
      const v = faire(l, s); v.position.set(-s * l / 2, 0, zf); g.add(v);
      vantaux.push({ g: v, s });
    }
    // le ferme-porte (portes grises) : un boîtier en applique en haut du vantail, côté poussée (-cote)
    if (o.modele.startsWith('grise') && o.fermePorte !== false) {
      if (double) maille(boiteM(l, 0.05, 0.05), M.ferme, 0, h + 0.075, -cote * (ep / 2 + 0.03), 0, g);
      // (dans le repère du vantail : le gond en x = 0, le vantail vers s ; le boîtier près du gond, côté poussée)
      for (const v of vantaux) maille(boiteM(0.3, 0.06, 0.05), M.ferme, v.s * 0.25, h - 0.06, -cote * 0.045, 0, v.g, { ombre: false });
    }
    for (const v of vantaux) fusionnerLocal(v.g);

    // LA FORME SOLIDE de l'ouverture fermée : la porte fermée est un mur
    const etat = o.etat || 'fermee';
    const forme = etat === 'ouverte' ? null : this._formePorte(o.cx, o.cz, o.rot, l, ep, h, base, etat === 'auto');
    if (etat === 'ouverte') {
      const A = o.angle ?? 1.65, ouverts = o.ouverts || vantaux.map(() => true);
      vantaux.forEach((v, i) => { if (ouverts[i]) v.g.rotation.y = -v.s * cote * A; });
      // (le vantail resté fermé d'une double porte : il ferme sa moitié de l'ouverture)
      vantaux.forEach((v, i) => { if (!ouverts[i]) this._formeVantail(o, v, l / 2, ep, h); });
      // (relecture du 09/10 : le vantail OUVERT n'avait pas de forme — Haythem le traversait, la caméra aussi, et contre
      // l'avancée du hall ouest il restait planté dedans ; une boîte mince le suit maintenant, de son gond à son bord)
      g.updateMatrixWorld(true);
      vantaux.forEach((v, i) => {
        if (!ouverts[i]) return;
        const w = double ? l / 2 : l, a = v.g.localToWorld(new THREE.Vector3(0, 0, 0)), b = v.g.localToWorld(new THREE.Vector3(v.s * w, 0, 0));
        C.ajouterBoiteOrientee((a.x + b.x) / 2, (a.z + b.z) / 2, w / 2, 0.035, Math.atan2(b.z - a.z, b.x - a.x), { y0: base, y1: base + h });
      });
    }
    if (etat === 'auto') {
      nePasFusionner(g);
      // (un vantail qui tourne ne projette pas d'ombre : la carte d'ombre du décor est gardée en cache, js/ombre_cache.js,
      // et sous une lumière presque d'aplomb l'ombre d'une porte n'est qu'un trait)
      for (const v of vantaux) v.g.traverse((x) => { if (x.isMesh) x.castShadow = false; });
      this.auto.push({ g, vantaux, forme, cx: o.cx, cz: o.cz, rot: o.rot, cote, k: 0, sens: cote, nx: Math.sin(o.rot), nz: Math.cos(o.rot), libre: o.libre || null, base, h, l });
    }
    this.decor.add(g);
    return { g, vantaux };
  }
  // (`mobile` : la forme d'une porte automatique — la lumière cuite au sol passe au travers, js/ecole_lumieres.js)
  _formePorte(cx, cz, rot, l, ep, h, base = 0, mobile = false) {
    const ux = Math.cos(rot), uz = -Math.sin(rot);
    const ex = Math.abs(ux) * l / 2 + Math.abs(uz) * ep / 2, ez = Math.abs(uz) * l / 2 + Math.abs(ux) * ep / 2;
    const o = { y0: base, y1: base + h, mobile };
    if (Math.abs(ux) > 0.999 || Math.abs(uz) > 0.999) return this.C.ajouterBoite(cx - ex, cz - ez, cx + ex, cz + ez, o);
    return this.C.ajouterBoiteOrientee(cx, cz, l / 2, ep / 2, Math.atan2(uz, ux), o);
  }
  // la forme solide d'UN vantail fermé (la moitié d'une double porte dont l'autre vantail est ouvert à demeure)
  _formeVantail(o, v, w, ep, h) {
    const ux = Math.cos(o.rot), uz = -Math.sin(o.rot), lx = v.g.position.x + v.s * w / 2;
    this._formePorte(o.cx + ux * lx, o.cz + uz * lx, o.rot, w, ep, h, o.base || 0);
  }

  // ---------------------------------------------------------------- l'ouverture automatique
  // À chaque image (js/carte_ecole.js maj) : la porte s'ouvre quand Haythem est à moins de RAYON_AUTO de son centre (ou
  // quand la caméra traverse son ouverture), du côté opposé au sien ; elle se referme quand il s'en va.
  // (09/10, le sous-sol : À SON NIVEAU seulement — ses pieds entre 1,2 m sous le seuil et 2,2 m au-dessus, la caméra dans
  // la hauteur de l'ouverture ; sinon les portes du -1 s'ouvraient sous les pas du joueur du rez-de-chaussée, et
  // inversement. `y`, `camY` : les pieds de Haythem et la caméra ; par défaut, le rez-de-chaussée)
  maj(dt, x, z, camX, camZ, y = 0, camY = 1.5) {
    for (const P of this.auto) {
      const dx = x - P.cx, dz = z - P.cz, d = Math.hypot(dx, dz);
      const dc = Math.hypot(camX - P.cx, camZ - P.cz);
      const ici = y > P.base - 1.2 && y < P.base + 2.2, camIci = camY > P.base - 0.3 && camY < P.base + P.h + 0.6;
      // (intégration du 10/10 : et tant que la caméra regarde Haythem AU TRAVERS de l'ouverture — de l'autre côté, la
      // ligne de la caméra à lui passe dans la baie ; au départ, la caméra est dans la rue : la porte 6 se refermait
      // devant elle quand il s'éloignait, puis se rouvrait quand elle arrivait)
      const sp = dx * P.nx + dz * P.nz, sc = (camX - P.cx) * P.nx + (camZ - P.cz) * P.nz;
      let travers = false;
      if (sp * sc < 0 && d < 5 && ici && camIci) {
        const t = sp / (sp - sc), qx = dx + t * (camX - x), qz = dz + t * (camZ - z);
        travers = Math.abs(qx * P.nz - qz * P.nx) < (P.l || 0.9) / 2 + 0.1;
      }
      const veut = (d < RAYON_AUTO && ici) || (dc < 0.8 && camIci) || travers;
      if (veut && P.k <= 0.001) {
        // le côté d'où il arrive : la porte s'ouvre de l'autre
        const cote = dx * P.nx + dz * P.nz;
        P.sens = cote > 0 ? -1 : 1;
        if (P.libre) P.sens = P.libre;
      }
      const k0 = P.k;
      P.k = Math.max(0, Math.min(1, P.k + (veut ? dt / DUREE : -dt / (DUREE * 1.6))));
      if (P.k === k0 && dt > 0) continue;
      const e = P.k * P.k * (3 - 2 * P.k);
      for (const v of P.vantaux) v.g.rotation.y = -v.s * P.sens * ANGLE_AUTO * e;
      if (P.forme) P.forme.off = P.k > 0.02;
    }
  }
}

// =====================================================================
//  LES FENÊTRES
// =====================================================================
// UNE FENÊTRE DE LA FAÇADE (photos 10, 13, 16, 17) dans le repère du mur de façade (x le long de la façade, +z vers
// l'INTÉRIEUR, le nu extérieur en z = -ep/2) : menuiserie brun-noir posée en retrait de 25 cm du nu, imposte au tiers du
// haut, vitrage qui laisse voir le jour, barreaux noirs en applique dehors (11 plats verticaux, 2 traverses), appui de
// pierre dehors, tablette blanche dedans. `stores` : des lames verticales blanches côté intérieur (l'accueil, photo 03).
export function fenetreFacade(parent, M, { x, l = 1.2, bas = 0.95, haut = 2.5, ep = 0.4, barreaux = true, stores = false, imposte = true }) {
  const g = new THREE.Group(); g.position.x = x; parent.add(g);
  const h = haut - bas, ym = (bas + haut) / 2, zc = -ep / 2 + 0.25, c = 0.06;
  maille(boiteM(l, c, 0.07), M.menuiserie, 0, bas + c / 2, zc, 0, g);
  maille(boiteM(l, c, 0.07), M.menuiserie, 0, haut - c / 2, zc, 0, g);
  maille(boiteM(c, h, 0.07), M.menuiserie, -l / 2 + c / 2, ym, zc, 0, g);
  maille(boiteM(c, h, 0.07), M.menuiserie, l / 2 - c / 2, ym, zc, 0, g);
  if (imposte) maille(boiteM(l, 0.05, 0.07), M.menuiserie, 0, haut - h / 3, zc, 0, g);
  maille(boiteM(0.05, imposte ? h * 2 / 3 : h, 0.07), M.menuiserie, 0, imposte ? bas + h / 3 : ym, zc, 0, g);
  const v = new THREE.Mesh(new THREE.PlaneGeometry(l - 2 * c, h - 2 * c), M.vitreJour);
  v.position.set(0, ym, zc); g.add(v);
  // l'appui (pierre) dehors, la tablette (blanche) dedans
  maille(boiteM(l + 0.06, 0.05, 0.22), M.pierreAppui || M.pierre, 0, bas - 0.025, -ep / 2 + 0.09, 0, g);
  maille(boiteM(l, 0.025, ep / 2 - 0.02), M.blanc, 0, bas - 0.012, ep / 4 + 0.03, 0, g, { ombre: false });
  if (barreaux) {
    const zb = -ep / 2 - 0.035;
    for (let i = 0; i < 11; i++) maille(boiteM(0.012, h + 0.08, 0.04), M.barreaux, -l / 2 + 0.05 + i * (l - 0.1) / 10, ym, zb, 0, g);
    for (const y of [bas + 0.12, haut - 0.12]) maille(boiteM(l + 0.06, 0.04, 0.012), M.barreaux, 0, y, zb - 0.022, 0, g);
    for (const sx of [-1, 1]) maille(boiteM(0.03, h + 0.12, 0.05), M.barreaux, sx * (l / 2 + 0.03), ym, zb + 0.01, 0, g);
  }
  if (stores) {
    for (let i = 0; i < 12; i++) {
      const lame = maille(boiteM(0.085, h - 0.12, 0.004), M.store || M.blanc, -l / 2 + 0.06 + i * (l - 0.1) / 11.5, ym - 0.04, ep / 2 - 0.04, 0, g, { ombre: false });
      lame.rotation.y = 0.9;
    }
    maille(boiteM(l, 0.06, 0.06), M.alu, 0, haut - 0.04, ep / 2 - 0.04, 0, g, { ombre: false });
  }
  return g;
}

// UN JOUR DE SOUFFRANCE DÉPOLI (photos 02, 21 : salle d'attente ; photo 01 : bureau B) dans un mur intérieur d'épaisseur
// `ep` : cadre blanc de 6 cm des deux côtés, verre dépoli menthe au milieu de l'épaisseur. `bandeClaire` : une bande de
// verre clair en haut (bureau B).
export function fenetreDepolie(parent, M, { x, l, bas, haut, ep, bandeClaire = 0 }) {
  const g = new THREE.Group(); g.position.x = x; parent.add(g);
  const h = haut - bas, ym = (bas + haut) / 2, c = 0.06;
  for (const z of [1, -1]) {
    const zz = z * (ep / 2 + 0.006);
    maille(boiteM(l + 2 * c, c, 0.02), M.alu, 0, haut + c / 2, zz, 0, g, { ombre: false });
    maille(boiteM(l + 2 * c, c, 0.02), M.alu, 0, bas - c / 2, zz, 0, g, { ombre: false });
    maille(boiteM(c, h, 0.02), M.alu, -l / 2 - c / 2, ym, zz, 0, g, { ombre: false });
    maille(boiteM(c, h, 0.02), M.alu, l / 2 + c / 2, ym, zz, 0, g, { ombre: false });
  }
  maille(boiteM(l, 0.02, ep), M.alu, 0, bas + 0.01, 0, 0, g, { ombre: false });
  const hd = h - bandeClaire;
  const d = new THREE.Mesh(boiteM(l, hd, 0.012), M.depoli); d.position.set(0, bas + hd / 2, 0); d.castShadow = false; g.add(d);
  if (bandeClaire > 0) {
    maille(boiteM(l, 0.03, 0.04), M.alu, 0, bas + hd, 0, 0, g, { ombre: false });
    const v = new THREE.Mesh(new THREE.PlaneGeometry(l, bandeClaire - 0.02), M.verre); v.position.set(0, haut - bandeClaire / 2, 0); g.add(v);
  }
  return g;
}

// LES PORTES DE LA RUE ET L'ENTRÉE 6 : posées par la carte avec ces vantaux (exportés pour js/carte_ecole.js)
export function vitrophanies() {
  return { rue: texVitrophanie(false), hall: texVitrophanie(true) };
}
