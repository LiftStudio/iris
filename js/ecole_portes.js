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
//   - la porte de SECOURS du fond du couloir C05 (photo 05) : verre dépoli bleu qui s'allume du jour de la cour ;
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
//  LES VITROPHANIES DE LA PORTE 6 (photos 16, 31)
// =====================================================================
// La face RUE : les arcs concentriques orange / magenta / violet sur le fixe de gauche, le nuage « low poly » bleu qui
// court sur les deux vantaux, le pavé « iris » et sa phrase sur le vantail gauche, la forme d'origami violette et, en
// bas du vantail droit, le visage d'un jeune homme qui lève les yeux. Une texture pour toute la largeur vitrée
// (x 13,45 à 16,35, 2,25 m de haut) ; transparente là où il n'y a pas d'adhésif. La face HALL : la même découpe en gris
// sombre (le dos de l'adhésif), vue à l'envers.
function texVitrophanie(dos = false) {
  const W = 1024, H = 800;   // 2,9 m x 2,25 m
  return canvasTex(W, H, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    const mx = w / 2.9, my = h / 2.25, X = (x) => (x - 13.45) * mx, Y = (y) => h - y * my;
    const peindre = (f, coul) => { g.fillStyle = dos ? 'rgba(52,54,60,0.92)' : coul; f(); };
    // les arcs sur le fixe de gauche (x 13,45-14,3), bas
    const cx = X(13.5), cy = Y(0.05);
    const arcs = [['#7b2a6e', 0.92], ['#d6337a', 0.78], ['#f08a3c', 0.64], ['#d6337a', 0.5], ['#7b2a6e', 0.38]];
    for (const [c, r] of arcs) {
      peindre(() => { g.beginPath(); g.arc(cx, cy, r * mx, -Math.PI / 2, 0); g.lineTo(cx, cy); g.closePath(); g.fill(); }, c);
      g.globalCompositeOperation = 'destination-out';
      g.beginPath(); g.arc(cx, cy, (r - 0.07) * mx, -Math.PI / 2 - 0.1, 0.1); g.lineTo(cx, cy); g.closePath(); g.fill();
      g.globalCompositeOperation = 'source-over';
    }
    // LE NUAGE « LOW POLY » (les deux vantaux, en haut) : une silhouette de nuage (union de disques) remplie d'une
    // grille de points tremblés, triangulée ; chaque facette prend un bleu selon son orientation (claire en haut à gauche)
    const disques = [[14.75, 1.85, 0.3], [15.15, 2.0, 0.36], [15.6, 1.92, 0.3], [15.95, 1.8, 0.22], [14.5, 1.72, 0.18], [15.3, 1.72, 0.3]];
    const dedans = (x, y) => disques.some(([cx, cy, r]) => (x - cx) ** 2 + (y - cy) ** 2 < r * r) && y > 1.6;
    const pas = 0.11, gr0 = [];
    let sx = 3;
    const alea = () => { sx = (sx * 16807) % 2147483647; return sx / 2147483647; };
    for (let j = 0; j <= 7; j++) { gr0.push([]); for (let i = 0; i <= 18; i++) gr0[j].push([14.25 + i * pas + (alea() - 0.5) * pas * 0.7, 1.55 + j * pas + (alea() - 0.5) * pas * 0.7]); }
    const bleus = ['#3d5a9e', '#4c6db3', '#6c8fd0', '#8aa9e0', '#a9c2ec'];
    for (let j = 0; j < 7; j++) for (let i = 0; i < 18; i++) {
      const p00 = gr0[j][i], p10 = gr0[j][i + 1], p01 = gr0[j + 1][i], p11 = gr0[j + 1][i + 1];
      for (const t of [[p00, p10, p11], [p00, p11, p01]]) {
        const cx = (t[0][0] + t[1][0] + t[2][0]) / 3, cy = (t[0][1] + t[1][1] + t[2][1]) / 3;
        if (!dedans(cx, cy)) continue;
        const k = Math.max(0, Math.min(4, Math.round(1.6 + (cy - 1.8) * 6 - (cx - 15.2) * 1.5 + (alea() - 0.5) * 2)));
        peindre(() => { g.beginPath(); g.moveTo(X(t[0][0]), Y(t[0][1])); g.lineTo(X(t[1][0]), Y(t[1][1])); g.lineTo(X(t[2][0]), Y(t[2][1])); g.closePath(); g.fill(); g.strokeStyle = g.fillStyle; g.lineWidth = 1; g.stroke(); }, bleus[k]);
      }
    }
    // l'origami violet (vantail droit, sous le nuage)
    peindre(() => { g.beginPath(); g.moveTo(X(15.5), Y(1.55)); g.lineTo(X(15.95), Y(1.4)); g.lineTo(X(15.7), Y(1.1)); g.lineTo(X(15.35), Y(1.25)); g.closePath(); g.fill(); }, '#8a6fb5');
    // le pavé « iris » et sa phrase (vantail gauche)
    peindre(() => g.fillRect(X(14.42), Y(1.42), 0.62 * mx, 0.5 * my), '#111111');
    if (!dos) {
      g.fillStyle = '#ffffff'; g.font = `600 ${Math.round(0.16 * my)}px "Century Gothic", "Avenir", "Segoe UI", sans-serif`;
      g.textBaseline = 'alphabetic'; g.fillText('iris', X(14.5), Y(1.2));
      g.fillStyle = '#f08a24'; g.fillRect(X(14.51), Y(1.36), 0.035 * mx, 0.02 * my);
      g.fillStyle = '#ffffff'; g.font = `500 ${Math.round(0.042 * my)}px "Segoe UI", sans-serif`;
      g.fillText('Connectez-vous', X(14.5), Y(1.07)); g.fillText('aux métiers', X(14.5), Y(1.02)); g.fillText('de demain', X(14.5), Y(0.97));
    }
    // LE VISAGE (vantail droit, en bas : un jeune homme qui lève les yeux vers le nuage). Une photo sur la vraie porte ;
    // ici une impression en bichromie violet / rose, comme un visuel d'affiche, plutôt qu'un dessin naïf.
    // (grand et coupé par le bas de la vitre, comme sur la porte : on voit le haut du visage, les yeux levés)
    const fx = X(15.7), fy = Y(0.2), rx = 0.36 * mx, ry = 0.45 * my;
    if (dos) { peindre(() => { g.beginPath(); g.ellipse(fx, fy - ry * 0.1, rx * 1.12, ry * 1.2, 0, 0, Math.PI * 2); g.fill(); }, ''); }
    else {
      g.save();
      g.beginPath(); g.ellipse(fx, fy - ry * 0.1, rx * 1.12, ry * 1.2, 0, 0, Math.PI * 2); g.clip();
      const fond = g.createLinearGradient(fx - rx, 0, fx + rx, 0); fond.addColorStop(0, '#3b1840'); fond.addColorStop(1, '#5a2350');
      g.fillStyle = fond; g.fillRect(fx - rx * 1.2, fy - ry * 1.4, rx * 2.4, ry * 2.6);
      const peau = g.createRadialGradient(fx - rx * 0.25, fy - ry * 0.15, rx * 0.1, fx, fy, rx * 1.05);
      peau.addColorStop(0, '#f4c6d2'); peau.addColorStop(0.55, '#c76a98'); peau.addColorStop(1, '#5e2558');
      g.fillStyle = peau; g.beginPath(); g.ellipse(fx, fy + ry * 0.05, rx * 0.9, ry, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#2a0f2e'; g.beginPath(); g.ellipse(fx, fy - ry * 0.78, rx * 0.95, ry * 0.42, 0, Math.PI, Math.PI * 2); g.fill();
      // les sourcils, les yeux levés (le blanc en bas, l'iris tout en haut), l'ombre du nez, la bouche
      for (const s2 of [-1, 1]) {
        g.fillStyle = '#3a1438'; g.beginPath(); g.ellipse(fx + s2 * rx * 0.36, fy - ry * 0.36, rx * 0.22, ry * 0.045, s2 * -0.15, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#fbe9ef'; g.beginPath(); g.ellipse(fx + s2 * rx * 0.36, fy - ry * 0.18, rx * 0.16, ry * 0.07, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#2a0f2e'; g.beginPath(); g.arc(fx + s2 * rx * 0.36, fy - ry * 0.235, rx * 0.075, 0, 7); g.fill();
      }
      g.fillStyle = 'rgba(70,20,70,0.45)'; g.beginPath(); g.moveTo(fx - rx * 0.02, fy - ry * 0.12); g.lineTo(fx + rx * 0.14, fy + ry * 0.22); g.lineTo(fx - rx * 0.1, fy + ry * 0.24); g.closePath(); g.fill();
      g.fillStyle = '#8c2f63'; g.beginPath(); g.ellipse(fx, fy + ry * 0.48, rx * 0.26, ry * 0.07, 0, 0, Math.PI * 2); g.fill();
      g.restore();
    }
    // l'interdiction de fumer (haut à droite) et deux feuilles A4 sur le fixe
    peindre(() => { g.beginPath(); g.arc(X(16.05), Y(2.05), 0.06 * mx, 0, 7); g.fill(); }, '#ffffff');
    if (!dos) { g.strokeStyle = '#d0262d'; g.lineWidth = 5; g.beginPath(); g.arc(X(16.05), Y(2.05), 0.05 * mx, 0, 7); g.moveTo(X(16.01), Y(2.09)); g.lineTo(X(16.09), Y(2.01)); g.stroke(); }
    g.fillStyle = dos ? 'rgba(245,245,240,0.95)' : 'rgba(250,250,246,0.95)';
    g.fillRect(X(13.55), Y(1.95), 0.21 * mx, 0.297 * my); g.fillRect(X(13.82), Y(1.9), 0.21 * mx, 0.297 * my);
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
  // ou -1. `feu` : étiquette rouge « porte coupe-feu » ; `oculus` : la fente vitrée cerclée de noyer ; `poignee` :
  // 'bequille' | 'tirant' | null ; `notices` : affichettes A4 (face +z).
  _vantailGris(w, h, s, { feu = false, oculus = true, poignee = 'bequille', notices = 0, mat = null } = {}) {
    const M = this.M, g = new THREE.Group(), e = 0.04;
    const cx = s * w / 2;
    maille(boiteM(w - 0.012, h - 0.012, e), mat || M.porte, cx, h / 2, 0, 0, g);
    if (oculus) {
      // la fente : 0,12 x 0,85 à partir de 1 m, côté poignée ; cadre de noyer de 3 cm
      const ox = s * (w - 0.24), oy = 1.0 + 0.425;
      for (const z of [e / 2 + 0.004, -e / 2 - 0.004]) {
        maille(boiteM(0.18, 0.03, 0.01), M.noyer, ox, oy + 0.44, z, 0, g, { ombre: false });
        maille(boiteM(0.18, 0.03, 0.01), M.noyer, ox, oy - 0.44, z, 0, g, { ombre: false });
        maille(boiteM(0.03, 0.91, 0.01), M.noyer, ox - 0.075, oy, z, 0, g, { ombre: false });
        maille(boiteM(0.03, 0.91, 0.01), M.noyer, ox + 0.075, oy, z, 0, g, { ombre: false });
      }
      maille(boiteM(0.12, 0.85, e + 0.004), M.vitreFente, ox, oy, 0, 0, g, { ombre: false });
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
      // deux rangées de quatre (h 1,0 et 1,55), lisibles côté passage (+z)
      const A = this._matAutocollant();
      for (const y of [1.0, 1.55]) for (let i = 0; i < 4; i++) {
        const x = s * (c + 0.06 + i * (w - 2 * c - 0.12) / 3.2);
        const p = plan(g, A, 0.11, 0.04, x, y, 0.004, 1);
        const q = plan(g, M.noirMat, 0.11, 0.04, x, y, -0.004, -1);
        p.userData.vitre = q.userData.vitre = true;
      }
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
  //  modele : 'grise' | 'grise2' (double) | 'gaine2' | 'vitree' | 'vitree2' | 'blanche'
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
      if (o.modele.startsWith('grise')) return this._vantailGris(w, h, s, { feu: o.feu, oculus: o.oculus !== false, notices: s > 0 ? (o.notices || 0) : (o.noticesD ?? o.notices ?? 0), poignee: o.poignee ?? (double ? 'tirant' : 'bequille') });
      if (o.modele.startsWith('gaine')) return this._vantailGaine(w, h, s);
      if (o.modele === 'blanche') return this._vantailGris(w, h, s, { oculus: false, mat: M.alu, poignee: 'bequille' });
      if (o.modele === 'noire') return this._vantailGris(w, h, s, { oculus: false, mat: M.acierNoir, poignee: null });
      return this._vantailVitre(w, h, s, { blanc: o.blanc !== false, tirant: o.tirant || 'long', autocollants: !!o.autocollants });
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
    }
    if (etat === 'auto') {
      nePasFusionner(g);
      // (un vantail qui tourne ne projette pas d'ombre : la carte d'ombre du décor est gardée en cache, js/ombre_cache.js,
      // et sous une lumière presque d'aplomb l'ombre d'une porte n'est qu'un trait)
      for (const v of vantaux) v.g.traverse((x) => { if (x.isMesh) x.castShadow = false; });
      this.auto.push({ g, vantaux, forme, cx: o.cx, cz: o.cz, rot: o.rot, cote, k: 0, sens: cote, nx: Math.sin(o.rot), nz: Math.cos(o.rot), libre: o.libre || null });
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
  maj(dt, x, z, camX, camZ) {
    for (const P of this.auto) {
      const dx = x - P.cx, dz = z - P.cz, d = Math.hypot(dx, dz);
      const dc = Math.hypot(camX - P.cx, camZ - P.cz);
      const veut = d < RAYON_AUTO || dc < 0.8;
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
