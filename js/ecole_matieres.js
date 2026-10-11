// =====================================================================
//  LES MATIÈRES DE L'ÉCOLE IRIS (rez-de-chaussée et façade)
// =====================================================================
// Toutes les textures sont DESSINÉES en code (canevas), à l'échelle réelle, d'après les photos de Haythem
// (references/ecole/, hors du dépôt) et le relevé des couleurs : la valeur « use » de chaque matière, c'est-à-dire la
// couleur mesurée sur les photos puis rééquilibrée sur le blanc des murs (les photos ont une forte dominante chaude,
// éclairage à 3000 K). Les UV des surfaces sont en MÈTRES : une texture dit combien de mètres elle couvre (`m`), et
// `repeat` vaut 1 / m.
//
// LE CARRELAGE (photos 01 à 05, 21) : grès cérame anthracite en GRANDES DALLES de 60 x 120 posées à joints décalés d'une
// demi-dalle, le grand côté dans l'axe de chaque pièce. La dalle imite un béton strié : un fond gris anthracite, de
// longues stries plus claires dans le sens de la longueur, quelques nuages plus sombres, un grain fin. Fini satiné : les
// plafonniers s'y reflètent en traînées molles (photo 02). Trois cartes : la couleur, le relief (le joint de 2 mm en
// creux, le léger bombé de la dalle), la rugosité (dalle satinée, stries un peu plus mates, joint mat).
// LE PASSAGE DES ÉTUDIANTS (photos 07, 19) : grès gris clair 30 x 60 en pose droite.
// LE PLAFOND (photos 02, 21, 03) : plateaux métalliques à clipser, blanc cassé, 60 x 120, micro-perforés (fentes
// serrées), une bordure lisse de 3 cm et un joint creux de 5 mm entre les plateaux.
// LA FAÇADE (photos 10 à 18) : panneaux de pierre calcaire claire de 80 x 60, joints fins, coulures sous les appuis.
import * as THREE from 'three';
import { canvasTex, normalesDepuisGrille, avecRelief, detailPhoto, rnd } from './kit_decor.js';
import { TELEPHONE } from './appareil.js';

// les octets sRGB d'une couleur hexadécimale, pour dessiner (jamais THREE.Color : il rendrait du linéaire, que la
// texture sRGB convertirait une seconde fois — un jaune sortait rouge orangé)
const octets = (hex) => [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];
const rgb = (r, g, b, a = 1) => `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a})`;
const borne = (v) => Math.max(0, Math.min(255, v));
// un générateur pseudo-aléatoire À GRAINE : le même carrelage à chaque chargement (et sur toutes les machines)
function graine(s) {
  let x = s >>> 0 || 1;
  return () => { x ^= x << 13; x >>>= 0; x ^= x >> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; };
}

// Une carte de RUGOSITÉ dessinée (three lit le canal vert) : `draw(g, w, h)` peint en niveaux de gris (255 = mat)
function texRugosite(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  let src = c;
  if (TELEPHONE && Math.max(w, h) > 256) {
    const d = document.createElement('canvas'); d.width = w / 2; d.height = h / 2;
    d.getContext('2d').drawImage(c, 0, 0, d.width, d.height); src = d;
  }
  const t = new THREE.CanvasTexture(src);
  t.colorSpace = THREE.NoColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
  return t;
}

// =====================================================================
//  LE CARRELAGE ANTHRACITE : 60 x 120, joints décalés d'une demi-dalle
// =====================================================================
// Une tuile de dessin = 2,4 m x 2,4 m : quatre rangées de 60 cm, deux dalles de 120 cm par rangée, décalées de 60 cm
// d'une rangée à l'autre — huit dalles toutes différentes. u = le grand côté des dalles.
export const CARRELAGE = { m: 2.4, dalleL: 1.2, dalleH: 0.6 };
function dallesCarrelage(f) {
  // f(x0, y0, w, h, i) pour chaque dalle (en fractions de la tuile), y compris les morceaux qui débordent (répétition)
  const nR = 4, L = 0.5, H = 0.25;
  for (let r = 0; r < nR; r++) {
    const dec = (r % 2) * 0.25;
    for (let k = -1; k < 2; k++) f(dec + k * L, r * H, L, H, r * 3 + k + 1);
  }
}
// Poser un calque FLOUTÉ (rayon `r` px) sur un canevas. Le filtre de canevas (`filter = 'blur()'`) manque aux Safari
// d'avant la version 18 : là, un flou approché — le calque réduit puis réagrandi avec lissage —, sinon les mèches du
// carrelage sortiraient en traits nets, deux fois plus marqués.
const FILTRE_CANEVAS = (() => { try { return typeof document.createElement('canvas').getContext('2d').filter === 'string'; } catch (e) { return false; } })();
function poserFlou(g, src, x, y, r, alpha) {
  g.save(); g.globalAlpha = alpha;
  if (FILTRE_CANEVAS) { g.filter = `blur(${r.toFixed(2)}px)`; g.drawImage(src, x, y); }
  else {
    const k = Math.max(1, r * 1.5), t = document.createElement('canvas');
    t.width = Math.max(1, Math.round(src.width / k)); t.height = Math.max(1, Math.round(src.height / k));
    const q = t.getContext('2d'); q.imageSmoothingQuality = 'high'; q.drawImage(src, 0, 0, t.width, t.height);
    g.imageSmoothingQuality = 'high'; g.drawImage(t, x, y, src.width, src.height);
  }
  g.restore();
}

// (09/10/2026, relevé côte à côte avec les photos 01, 02, 21) La dalle est un grès « effet pierre » GRIS ANTHRACITE
// NEUTRE, bien plus sombre que les murs (rapport de luminance sol / mur blanc ≈ 0,45 à 0,6 sur les photos) : un fond
// #545352, des VOILES plus clairs étirés dans la longueur (des nappes floues, pas des traits), des MÈCHES blanchâtres
// fines et floues groupées en amas (certaines dalles en sont couvertes, d'autres presque nues), quelques taches plus
// sombres et un grain fin. Le premier dessin (traits nets réguliers sur fond gris-beige) donnait de loin un « métal
// brossé » beige : les traits nets sont devenus des mèches floutées, et la densité change d'une dalle à l'autre.
// (Relecture du 09/10 : les mèches en amas faisaient de grosses traînées de craie ; ce sont maintenant des STRIES fines
// groupées en bandes, sur le même fond sombre — voir 2. plus bas.)
function texCarrelageCouleur() {
  const px = TELEPHONE ? 1024 : 2048;
  // (relecture du 09/10 : #545352 -> #504F4E, les stries fines éclaircissent la dalle ; rapport sol / mur blanc du C01
  // ramené de 0,55 vers les 0,45 de la photo 01)
  const [br, bg, bb] = octets(0x504f4e);
  // un calque de travail, réutilisé d'une dalle à l'autre (mèches dessinées nettes puis floutées)
  const calque = document.createElement('canvas');
  return canvasTex(px, px, (g, w, h) => {
    g.fillStyle = rgb(br, bg, bb); g.fillRect(0, 0, w, h);
    const flou = w / 2048;                                   // (le flou suit la résolution : même aspect au téléphone)
    const dalle = (fx, fy, fw, fh) => {
      const x0 = fx * w, y0 = fy * h, dw = fw * w, dh = fh * h;
      // (la graine suit la place de la dalle dans la tuile, RAMENÉE dans [0, 1[ : la dalle à cheval sur le bord de la
      // répétition est dessinée deux fois, à gauche et à droite, et doit l'être à l'identique — avec deux graines, elle
      // changeait de ton et de veinage en son milieu, un faux joint ; relecture du 09/10)
      const r2 = graine(911 + (Math.round((((fx % 1) + 1) % 1) * 8) + Math.round(fy * 4) * 8) * 37);
      g.save(); g.beginPath(); g.rect(x0, y0, dw, dh); g.clip();
      // le ton de la dalle (lot de fabrication) et sa « charge » de mèches (0,25 : presque nue ; 1 : très veinée)
      const t = (r2() - 0.5) * 12, charge = 0.25 + 0.75 * Math.pow(r2(), 0.8);
      g.fillStyle = rgb(br + t, bg + t, bb + t * 0.95); g.fillRect(x0, y0, dw, dh);
      // 1. LES VOILES : de grandes nappes floues, étirées dans la longueur, un peu plus claires (et quelques-unes sombres)
      for (let k = 0; k < 16; k++) {
        const cx = x0 + r2() * dw, cy = y0 + r2() * dh, rx = dw * (0.18 + r2() * 0.45), ry = dh * (0.06 + r2() * 0.22);
        const sombre = r2() < 0.35, v = sombre ? [64, 63, 62] : [112, 110, 107];
        // (relecture du 09/10 : les nappes claires un peu plus franches — sur la photo 01 de près, la dalle a de grandes
        // plages plus claires et d'autres plus sombres ; à côté, celles du jeu sortaient d'un gris uni)
        const a = sombre ? 0.12 + r2() * 0.2 : (0.07 + r2() * 0.2) * (0.6 + charge * 0.6);
        const gr = g.createRadialGradient(0, 0, 0, 0, 0, 1);
        gr.addColorStop(0, rgb(v[0], v[1], v[2], a)); gr.addColorStop(0.6, rgb(v[0], v[1], v[2], a * 0.5)); gr.addColorStop(1, rgb(v[0], v[1], v[2], 0));
        g.save(); g.translate(cx, cy); g.scale(rx, ry); g.fillStyle = gr; g.fillRect(-1, -1, 2, 2); g.restore();
      }
      // 2. LES STRIES (relecture du 09/10, la photo 01 de près à côté du jeu : les « mèches » en amas flous faisaient de
      // grosses traînées de craie posées sur une dalle lisse ; le grès des photos est STRIÉ partout, finement) : des
      // centaines de fils clairs très fins, courts ou moyens, couchés dans la longueur de la dalle et groupés en BANDES
      // — des bandes chargées, d'autres presque nues —, et des points blancs le long des fils. Tracés sur un calque, posés
      // avec un flou d'un pixel (un fil net scintillerait de loin), puis une seconde fois très flous et légers : vue de
      // loin, une bande chargée devient la nuée un peu plus claire des photos 02 et 21.
      calque.width = Math.ceil(dw); calque.height = Math.ceil(dh);
      const q = calque.getContext('2d');
      q.clearRect(0, 0, calque.width, calque.height);
      const nB = 3 + Math.round(charge * 4), bandes = [];
      for (let b = 0; b < nB; b++) bandes.push({ y: r2() * dh, e: dh * (0.03 + r2() * 0.13), d: 0.35 + r2() * 0.65 });
      const nS = Math.round(dw * dh / 300 * (0.35 + charge * 0.65));
      for (let k = 0; k < nS; k++) {
        const b = bandes[Math.floor(r2() * nB)], gy = (r2() + r2() + r2() - 1.5) / 1.5;   // (une gaussienne grossière)
        const y = b.y + gy * b.e, x = -dw * 0.05 + r2() * dw * 1.1, L = dw * (0.012 + Math.pow(r2(), 2.5) * 0.22);
        const v = 126 + r2() * 44, al = (0.05 + r2() * 0.15) * b.d, ep = (0.55 + r2() * 1.3) * flou;
        const gr = q.createLinearGradient(x, 0, x + L, 0);
        gr.addColorStop(0, rgb(v, v - 1, v - 4, 0)); gr.addColorStop(0.25, rgb(v, v - 1, v - 4, al));
        gr.addColorStop(0.7, rgb(v, v - 1, v - 4, al * 0.8)); gr.addColorStop(1, rgb(v, v - 1, v - 4, 0));
        q.fillStyle = gr; q.fillRect(x, y, L, ep);
      }
      for (let k = 0; k < 110 * charge * (w / 2048); k++) {                // les paillettes blanches, menues
        const b = bandes[Math.floor(r2() * nB)], y = b.y + (r2() - 0.5) * 2 * b.e, R = (0.5 + r2() * 0.8) * flou;
        q.fillStyle = rgb(180 + r2() * 30, 178 + r2() * 30, 173 + r2() * 30, 0.12 + r2() * 0.22);
        q.beginPath(); q.ellipse(r2() * dw, y, R * (2 + r2() * 4), R, 0, 0, 7); q.fill();
      }
      poserFlou(g, calque, x0, y0, 0.6 * flou, 1); poserFlou(g, calque, x0, y0, 7 * flou, 0.55);
      // 3. de petites taches sombres (les inclusions de la « pierre »), discrètes
      for (let k = 0; k < 25; k++) {
        const cx = x0 + r2() * dw, cy = y0 + r2() * dh, R = (2 + r2() * 6) * flou;
        g.fillStyle = rgb(60, 59, 58, 0.06 + r2() * 0.1); g.beginPath(); g.ellipse(cx, cy, R * 1.8, R, 0, 0, 7); g.fill();
      }
      // 4. le grain
      for (let k = 0; k < dw * dh / 36; k++) {
        const v = 84 + (r2() - 0.5) * 60;
        g.fillStyle = rgb(v, v, v - 1, 0.16 + r2() * 0.2); g.fillRect(x0 + r2() * dw, y0 + r2() * dh, 1.3 * flou, 1.3 * flou);
      }
      g.restore();
    };
    dallesCarrelage(dalle);
    // les JOINTS (2 mm, #2E2D2C), bordés d'un filet un peu sombre : sur les photos 01, 02 et 21, le joint est un trait
    // fin plus FONCÉ que la dalle (relecture du 09/10 : le chanfrein éclairé qui le bordait le faisait sortir en filet
    // clair, argenté)
    const jx = Math.max(2, w / CARRELAGE.m * 0.0022), [jr, jg, jb] = octets(0x2e2d2c);
    dallesCarrelage((fx, fy, fw, fh) => {
      const x0 = fx * w, y0 = fy * h, dw = fw * w, dh = fh * h;
      g.fillStyle = rgb(jr, jg, jb); g.fillRect(x0 - jx / 2, y0, jx, dh); g.fillRect(x0, y0 - jx / 2, dw, jx);
      g.fillStyle = 'rgba(46,45,44,0.3)'; g.fillRect(x0 + jx / 2, y0 + jx / 2, dw - jx, 1.2); g.fillRect(x0 + jx / 2, y0 + jx / 2, 1.2, dh - jx);
    });
  }, [1 / CARRELAGE.m, 1 / CARRELAGE.m], false, 16);
}
// (la RUGOSITÉ : un satiné franc, ~0,3 — les plafonniers s'y reflètent en traînées molles, photos 02, 19, 21 —, des
// plages un peu plus mates, le joint mat)
function texCarrelageRugosite() {
  const px = TELEPHONE ? 512 : 1024;
  return texRugosite(px, px, (g, w, h) => {
    g.fillStyle = 'rgb(80,80,80)'; g.fillRect(0, 0, w, h);
    const r2 = graine(77);
    for (let k = 0; k < 240; k++) {                                     // des plages plus mates, d'autres plus lisses
      const v = 80 + (r2() - 0.45) * 60, R = w * (0.02 + r2() * 0.08);
      const cx = r2() * w, cy = r2() * h, gr = g.createRadialGradient(0, 0, 0, 0, 0, 1);
      gr.addColorStop(0, rgb(v, v, v, 0.4)); gr.addColorStop(1, rgb(v, v, v, 0));
      g.save(); g.translate(cx, cy); g.scale(R * 3, R); g.fillStyle = gr; g.fillRect(-1, -1, 2, 2); g.restore();
    }
    // (le joint MAT déborde sur l'arête adoucie des dalles — 8 mm : satinée, elle renvoyait le plafond éclairé, et le
    // joint sortait en filet argenté ; relecture du 09/10)
    const jx = Math.max(3, w / CARRELAGE.m * 0.008);
    dallesCarrelage((fx, fy, fw, fh) => {
      g.fillStyle = 'rgb(235,235,235)'; g.fillRect(fx * w - jx / 2, fy * h, jx, fh * h); g.fillRect(fx * w, fy * h - jx / 2, fw * w, jx);
    });
  });
}
let _normCarr = null;
function normalesCarrelage() {
  return _normCarr || (_normCarr = normalesDepuisGrille(TELEPHONE ? 512 : 1024, TELEPHONE ? 512 : 1024, (g, w, h) => {
    const j = Math.max(1.5, w / CARRELAGE.m * 0.003);
    dallesCarrelage((fx, fy, fw, fh) => g.fillRect(fx * w + j, fy * h + j, fw * w - 2 * j, fh * h - 2 * j));
  }, 1.6, 1.1));
}

// LE CARRELAGE DU PASSAGE : gris moyen, 30 x 60 en pose droite (u = le petit côté). Tuile de dessin : 1,2 x 1,2 m.
// (09/10 : #9A9893 -> #6A6865 ; sous le jour de la grille et la lumière cuite, il sortait presque blanc — photo 07 : gris
// moyen sous le jour, photo 19 : gris sombre au pied des portes. Relecture du même jour : #6A6865 -> #5E5C59, et le
// joint, resté #6E6C69, était devenu PLUS CLAIR que la dalle — une grille de traits blancs ; il passe à #3E3C3A, plus
// foncé, comme sur les photos.)
function texPassage() {
  const px = TELEPHONE ? 512 : 1024, nU = 4, nV = 2, [br, bg, bb] = octets(0x5e5c59);
  return canvasTex(px, px, (g, w, h) => {
    const r2 = graine(303), cw = w / nU, ch = h / nV;
    for (let j = 0; j < nV; j++) for (let i = 0; i < nU; i++) {
      const t = (r2() - 0.5) * 8, x0 = i * cw, y0 = j * ch;
      g.fillStyle = rgb(br + t, bg + t, bb + t); g.fillRect(x0, y0, cw, ch);
      for (let k = 0; k < 10; k++) {
        const R = rnd(cw * 0.2, cw * 0.6), cx = x0 + r2() * cw, cy = y0 + r2() * ch, v = 112 + (r2() - 0.5) * 30;
        const gr = g.createRadialGradient(cx, cy, 0, cx, cy, R);
        gr.addColorStop(0, rgb(v, v - 1, v - 4, 0.12)); gr.addColorStop(1, rgb(v, v, v, 0));
        g.save(); g.beginPath(); g.rect(x0, y0, cw, ch); g.clip(); g.fillStyle = gr; g.fillRect(cx - R, cy - R, 2 * R, 2 * R); g.restore();
      }
      for (let k = 0; k < 900; k++) { const v = 110 + (r2() - 0.5) * 60; g.fillStyle = rgb(v, v - 1, v - 3, 0.25); g.fillRect(x0 + r2() * cw, y0 + r2() * ch, 1.2, 1.2); }
    }
    const [jr, jg, jb] = octets(0x3e3c3a);
    g.fillStyle = rgb(jr, jg, jb);
    for (let i = 0; i <= nU; i++) g.fillRect(i * cw - 1.5, 0, 3, h);
    for (let j = 0; j <= nV; j++) g.fillRect(0, j * ch - 1.5, w, 3);
  }, [1 / 1.2, 1 / 1.2], false, 16);
}
let _normPassage = null;
function normalesPassage() {
  return _normPassage || (_normPassage = normalesDepuisGrille(512, 512, (g, w, h) => {
    const cw = w / 4, ch = h / 2;
    for (let j = 0; j < 2; j++) for (let i = 0; i < 4; i++) g.fillRect(i * cw + 1.5, j * ch + 1.5, cw - 3, ch - 3);
  }, 1.4, 1.1));
}

// =====================================================================
//  LES PLAFONDS
// =====================================================================
// Les plateaux métalliques : 60 cm (u, est-ouest) x 120 cm (v, nord-sud), blanc cassé #E6E3DC, une bordure lisse de
// 3 cm, le champ micro-perforé (des fentes serrées, plus sombres #B7B2A8 : vues de loin elles grisent le plateau) et le
// joint creux de 5 mm, sombre. Tuile de dessin : 1,2 x 1,2 m (deux plateaux côte à côte).
export const PLATEAU = { u: 0.6, v: 1.2 };
// (09/10/2026, photos 02, 03, 21 agrandies) Les perforations se LISENT jusqu'au fond de la salle : des trous ronds de
// ~4 mm au pas de 12 mm en quinconce, sombres (le voile acoustique noir derrière) — le champ perforé paraît nettement
// plus gris que la bordure lisse de 3 cm qui encadre chaque plateau. Les premières fentes, très serrées et pâles, se
// fondaient en un aplat uni : un plafond de plâtre. Le joint creux est souligné d'un filet clair (l'arête du plateau
// voisin, éclairée) et d'un filet d'ombre.
// (Relecture du 09/10, la photo 02 agrandie trois fois au-dessus du photographe : les trous sont CARRÉS, ~6 mm, alignés
// en files serrées dans le sens est-ouest (pas de 11 mm) et séparées par des nervures pleines plus larges (pas de 17 mm
// en travers) — de près, des lignes de tirets ; et la bordure lisse est LARGE aux deux bouts du plateau (5,5 cm : entre
// deux rangées de plateaux, une bande claire de 12 cm), plus étroite le long des grands côtés (3 cm).)
function texPlateaux() {
  const W = TELEPHONE ? 512 : 1024, H = W;
  return canvasTex(W, H, (g, w, h) => {
    const mm = w / 1200, pu = w / 2, pv = h, bord = 30 * mm, bu = 55 * mm, joint = Math.max(2, 5 * mm);
    g.fillStyle = '#ebe8e1'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2; i++) {
      const x0 = i * pu;
      // le champ perforé, un rien plus gris que la bordure (la tôle est emboutie autour des trous)
      g.fillStyle = 'rgba(205,200,190,0.35)'; g.fillRect(x0 + bu, bord, pu - 2 * bu, pv - 2 * bord);
      // les trous : carrés de 6 mm, au pas de 11 mm dans la file (u), de 17 mm d'une file à l'autre (v)
      g.fillStyle = 'rgba(58,54,50,0.8)';
      const pu1 = 11 * mm, pv1 = 17 * mm, c = Math.max(1, 6 * mm);
      for (let y = bord + pv1 / 2; y < pv - bord - c / 2; y += pv1) {
        for (let x = x0 + bu + pu1 / 2; x < x0 + pu - bu - c / 2; x += pu1) g.fillRect(x - c / 2, y - c / 2, c, c);
      }
      // la bordure lisse, plus claire (elle est bombée vers le bas : elle prend la lumière)
      g.fillStyle = 'rgba(255,254,250,0.45)';
      g.fillRect(x0 + joint, 0, bu * 0.6, pv); g.fillRect(x0 + pu - bu * 0.6, 0, bu * 0.6 - joint / 2, pv);
      g.fillRect(x0, joint, pu, bord * 0.6); g.fillRect(x0, pv - bord * 0.6, pu, bord * 0.6 - joint / 2);
    }
    // les joints creux (5 mm), un filet d'ombre d'un côté et un filet clair de l'autre
    g.fillStyle = '#7c776e';
    for (let i = 0; i <= 2; i++) g.fillRect(i * pu - joint / 2, 0, joint, h);
    g.fillRect(0, -joint / 2, w, joint); g.fillRect(0, h - joint / 2, w, joint);
    g.fillStyle = 'rgba(120,114,104,0.5)';
    for (let i = 0; i <= 2; i++) g.fillRect(i * pu + joint / 2, 0, Math.max(1, 2 * mm), h);
    g.fillRect(0, joint / 2, w, Math.max(1, 2 * mm));
    g.fillStyle = 'rgba(255,255,255,0.6)';
    for (let i = 0; i <= 2; i++) g.fillRect(i * pu - joint / 2 - Math.max(1, 2 * mm), 0, Math.max(1, 2 * mm), h);
    g.fillRect(0, h - joint / 2 - Math.max(1, 2 * mm), w, Math.max(1, 2 * mm));
  }, [1 / 1.2, 1 / 1.2], false, 8);
}
// LES DALLES POSÉES (photos 04, 05 : au-dessus de l'entrée du couloir C05, entre la salle d'attente et le hall ouest) :
// des dalles minérales lisses de 60 x 60, blanc cassé à peine moucheté, posées sur une ossature en T de 24 mm dont on ne
// voit que le filet sombre de la feuillure. Tuile de dessin : 1,2 x 1,2 m (quatre dalles).
function texDalles() {
  const W = TELEPHONE ? 256 : 512;
  return canvasTex(W, W, (g, w, h) => {
    const mm = w / 1200, r2 = graine(4242);
    g.fillStyle = '#e7e4dd'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < w * h / 24; k++) { const v = 222 + (r2() - 0.5) * 30; g.fillStyle = rgb(v, v - 2, v - 6, 0.35); g.fillRect(r2() * w, r2() * h, 1.2, 1.2); }
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
      const t = (r2() - 0.5) * 6; g.fillStyle = rgb(128 + t, 128 + t, 128 + t, 0.05); g.fillRect(i * w / 2, j * h / 2, w / 2, h / 2);
    }
    const T = Math.max(2, 14 * mm), f = Math.max(1, 4 * mm);
    g.fillStyle = '#efede7';                                     // l'ossature laquée blanche
    for (let i = 0; i <= 2; i++) { g.fillRect(i * w / 2 - T / 2, 0, T, h); g.fillRect(0, i * h / 2 - T / 2, w, T); }
    g.fillStyle = 'rgba(96,90,82,0.75)';                          // la feuillure dans l'ombre, des deux côtés du T
    for (let i = 0; i <= 2; i++) {
      for (const d of [-T / 2 - f, T / 2]) { g.fillRect(i * w / 2 + d, 0, f, h); g.fillRect(0, i * h / 2 + d, w, f); }
    }
  }, [1 / 1.2, 1 / 1.2], false, 8);
}
let _normPlateaux = null;
function normalesPlateaux() {
  return _normPlateaux || (_normPlateaux = normalesDepuisGrille(512, 512, (g, w, h) => {
    const j = 3; for (let i = 0; i < 2; i++) g.fillRect(i * w / 2 + j, j, w / 2 - 2 * j, h - 2 * j);
  }, 2.2, 1.0));
}

// =====================================================================
//  LES PEINTURES (murs) et la PIERRE DE LA FAÇADE
// =====================================================================
// Un enduit peint : presque uni, une très légère nuée de rouleau. Tuile de dessin : 2 m.
export function texPeinture(hex, nuee = 5) {
  const [r, gg, b] = octets(hex);
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = rgb(r, gg, b); g.fillRect(0, 0, w, h);
    const r2 = graine(hex & 0xffff);
    for (let k = 0; k < 70; k++) {
      const R = 20 + r2() * 60, x = r2() * w, y = r2() * h, d = (r2() - 0.5) * 2 * nuee;
      const gr = g.createRadialGradient(x, y, 0, x, y, R);
      gr.addColorStop(0, rgb(borne(r + d), borne(gg + d), borne(b + d), 0.35)); gr.addColorStop(1, rgb(r, gg, b, 0));
      g.fillStyle = gr; g.fillRect(x - R, y - R, 2 * R, 2 * R);
    }
  }, [0.5, 0.5], false, 8);
}
// LA PIERRE DE LA FAÇADE : panneaux de 80 x 60, joints fins #BDBDB8, nuances d'un panneau à l'autre, coulures
// (#A9A79F) plus fortes en bas. Tuile de dessin : 3,2 x 2,4 m.
export const PIERRE = { u: 3.2, v: 2.4 };
function texPierre() {
  const W = TELEPHONE ? 512 : 1024, H = Math.round(W * 0.75), [br, bg, bb] = octets(0xd0d0ca);
  return canvasTex(W, H, (g, w, h) => {
    const r2 = graine(1821), pu = w / 4, pv = h / 4;
    for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) {
      const t = (r2() - 0.5) * 10, x0 = i * pu, y0 = j * pv;
      g.fillStyle = rgb(br + t, bg + t, bb + t - 1); g.fillRect(x0, y0, pu, pv);
      for (let k = 0; k < 6; k++) {
        const R = pu * (0.2 + r2() * 0.5), cx = x0 + r2() * pu, cy = y0 + r2() * pv, v = 200 + (r2() - 0.5) * 30;
        const gr = g.createRadialGradient(cx, cy, 0, cx, cy, R);
        gr.addColorStop(0, rgb(v, v, v - 4, 0.12)); gr.addColorStop(1, rgb(v, v, v, 0));
        g.save(); g.beginPath(); g.rect(x0, y0, pu, pv); g.clip(); g.fillStyle = gr; g.fillRect(cx - R, cy - R, 2 * R, 2 * R); g.restore();
      }
      for (let k = 0; k < 400; k++) { const v = 205 + (r2() - 0.5) * 40; g.fillStyle = rgb(v, v, v - 3, 0.25); g.fillRect(x0 + r2() * pu, y0 + r2() * pv, 1.2, 1.2); }
      // les coulures, à partir du haut du panneau
      for (let k = 0; k < 3; k++) {
        const x = x0 + r2() * pu, L = pv * (0.3 + r2() * 0.7), gr = g.createLinearGradient(0, y0, 0, y0 + L);
        gr.addColorStop(0, 'rgba(169,167,159,0.25)'); gr.addColorStop(1, 'rgba(169,167,159,0)');
        g.fillStyle = gr; g.fillRect(x, y0, 2 + r2() * 5, L);
      }
    }
    g.fillStyle = '#bdbdb8';
    for (let i = 0; i <= 4; i++) g.fillRect(i * pu - 1, 0, 2, h);
    for (let j = 0; j <= 4; j++) g.fillRect(0, j * pv - 1, w, 2);
  }, [1 / PIERRE.u, 1 / PIERRE.v], false, 8);
}

// LES ÉTAGES DE LA FAÇADE (vus de la rue) : une travée de 1,65 m sur un étage de 3,1 m — la pierre, la fenêtre d'un seul
// vantail (menuiserie brun-noir #2B282A), le vitrage qui reflète le ciel. Tuile de dessin : une travée.
// (Lot façade du 11/10 : la photo 12 redressée sur les quatre rangées — iris_vues/X4_p12_redressee.jpg — donne la MÊME
// fenêtre à tous les étages, du 1er au 4e : 1,22 x 1,36 m, allège à 0,84-0,86 du plancher, linteau à 2,20-2,24 — et la VO
// le confirme au 2e, 1,18 x 1,33, allège 0,84 ; un seul vantail, sans meneau ni imposte, un dormant épais. Le jeu dessinait
// 1,30 x 1,25 à 0,95, deux vantaux et une imposte, un store une fois sur deux.)
export const TRAVEE = { u: 1.65, v: 3.1 };
export const FENETRE_ETAGE = { l: 1.2, bas: 0.85, haut: 2.2 };
export const TEINTE_PIERRE = 0xebf6ff;                     // (la teinte froide de la pierre de la façade : materiauxEcole)
// LES ENCADREMENTS ROUGES (photos 10, 11, 12, 16, 17, 18 ; lot façade du 11/10) : plus HAUTS que larges, 1,47 x 2,53 m —
// de 0,18 sous le plancher à 2,35 au-dessus, le haut un peu au-dessus des linteaux voisins, le bas un mètre sous leurs
// appuis —, en saillie de 15 cm ; montants de 16 cm, traverse haute de 18, basse de 21 et, sur elle, l'appui blanc de la
// fenêtre. Dedans, une fenêtre haute (1,15 x 2,11) : un grand carreau à la pastille rouge des pompiers et, côté mitoyen
// (photos 10, 16, 17), un ouvrant étroit et sombre de 0,28. Leur place, relevée sur la photo 12 redressée (les quatre
// rangées et le haut de la cinquième) : travées 1 et 12 au 1er et au 3e, 7 au 2e, 6 au 4e, 12 au 5e (sous la toiture) ;
// `o` : le côté de l'ouvrant étroit (-1 ouest, 1 est, 0 aucun)
// (relecture du lot façade, 11/10 — photos 11 et 12 de près, iris_vues/XR4_z_t7.jpg : celui de la travée 7 du 2e a aussi
// son grand carreau à la pastille et, à l'est, l'ouvrant sombre : o = 1)
export const CADRE = { l: 1.47, bas: -0.18, haut: 2.35, montant: 0.16, linteau: 0.18, traverse: 0.21, saillie: 0.15, etroit: 0.28 };
CADRE.jour = { l: CADRE.l - 2 * CADRE.montant, bas: CADRE.bas + CADRE.traverse + 0.05, haut: CADRE.haut - CADRE.linteau };
export const CADRES = [{ t: 1, e: 1, o: -1 }, { t: 12, e: 1, o: 1 }, { t: 7, e: 2, o: 1 }, { t: 1, e: 3, o: -1 }, { t: 12, e: 3, o: 1 },
  { t: 6, e: 4, o: 1 }, { t: 12, e: 5, o: 1 }];
export const cadreEn = (travee, etage) => CADRES.find((c) => c.t === travee && c.e === etage) || null;
function texEtage() {
  const W = TELEPHONE ? 256 : 512, H = Math.round(W * TRAVEE.v / TRAVEE.u), [br, bg, bb] = octets(0xd9dad5);
  return canvasTex(W, H, (g, w, h) => {
    const r2 = graine(42), mx = w / TRAVEE.u, my = h / TRAVEE.v, F = FENETRE_ETAGE;
    g.fillStyle = rgb(br, bg, bb); g.fillRect(0, 0, w, h);
    for (let k = 0; k < 500; k++) { const v = 205 + (r2() - 0.5) * 36; g.fillStyle = rgb(v, v, v - 3, 0.25); g.fillRect(r2() * w, r2() * h, 1.3, 1.3); }
    g.fillStyle = '#bdbdb8'; g.fillRect(0, h * 0.5, w, 2); g.fillRect(w - 1, 0, 1, h);
    // la fenêtre : 1,20 x 1,35 m, appui à 0,85 m au-dessus du plancher (le haut de la tuile est le plafond de l'étage)
    const fw = F.l * mx, fh = (F.haut - F.bas) * my, fx = (w - fw) / 2, fy = h - F.haut * my;
    // le tableau : vu d'en bas, le dessous du linteau dans l'ombre et un tableau d'un côté (photo 12)
    // (relecture du lot façade, 11/10 : habillé de brun-noir comme au 1er et au 2e — photos 11, 12 de près — et non gris)
    g.fillStyle = '#2b282a'; g.fillRect(fx, fy, fw, fh);
    g.fillStyle = '#16161a'; g.fillRect(fx, fy, fw, 0.1 * my);
    g.fillStyle = '#211f21'; g.fillRect(fx + fw - 0.07 * mx, fy + 0.1 * my, 0.07 * mx, fh - 0.1 * my);
    // le vitrage : le ciel couvert en haut, les immeubles d'en face qui s'y reflètent en bas
    const cad = Math.max(4, 0.075 * mx), ouv = Math.max(3, 0.045 * mx);
    const verre = g.createLinearGradient(0, fy, 0, fy + fh);
    // (vus d'en bas, ces carreaux renvoient le ciel couvert : presque aussi clairs que lui — photo 12)
    verre.addColorStop(0, '#eef3f8'); verre.addColorStop(0.55, '#d8e1ea'); verre.addColorStop(1, '#aab5bf');
    g.fillStyle = verre; g.fillRect(fx + cad + ouv, fy + 0.1 * my + ouv, fw - 2 * cad - 2 * ouv - 0.07 * mx, fh - 0.1 * my - cad - 2 * ouv);
    if (r2() < 0.5) { g.fillStyle = 'rgba(90,96,104,0.25)'; g.fillRect(fx + cad + ouv, fy + fh * 0.66, fw - 2 * cad - 2 * ouv - 0.07 * mx, fh * 0.26); }
    // l'ouvrant : son cadre, plus mince, la poignée
    g.strokeStyle = '#2b282a'; g.lineWidth = ouv; g.strokeRect(fx + cad + ouv / 2, fy + 0.1 * my + ouv / 2, fw - 2 * cad - ouv - 0.07 * mx, fh - 0.1 * my - cad - ouv);
    g.fillStyle = '#9a9c9e'; g.fillRect(fx + fw - cad - 0.07 * mx - ouv - 4, fy + fh * 0.5, 3, 0.1 * my);
    g.fillStyle = 'rgba(255,255,255,0.12)';
    g.beginPath(); g.moveTo(fx + fw * 0.25, fy + 0.1 * my); g.lineTo(fx + fw * 0.5, fy + 0.1 * my); g.lineTo(fx + fw * 0.25, fy + fh); g.lineTo(fx + fw * 0.02, fy + fh); g.fill();
    // la bavette sombre (relecture du lot façade : comme aux fenêtres du 1er et du 2e, photos 11, 17), et sa coulure
    g.fillStyle = '#2e2b2c'; g.fillRect(fx - 3, fy + fh, fw + 6, 0.04 * my);
    const cg = g.createLinearGradient(0, fy + fh, 0, fy + fh + 0.6 * my);
    cg.addColorStop(0, 'rgba(160,158,150,0.35)'); cg.addColorStop(1, 'rgba(160,158,150,0)');
    g.fillStyle = cg; g.fillRect(fx, fy + fh + 0.05 * my, fw, 0.6 * my);
  }, [1 / TRAVEE.u, 1 / TRAVEE.v], false, 8);
}
// LA FENÊTRE HAUTE D'UN ENCADREMENT ROUGE, dessinée (les étages dessinés, 3e à 5e) : le jour de l'encadrement, 1,15 x
// 2,11 m — l'appui blanc, le grand carreau au ciel et sa pastille rouge, l'ouvrant étroit et sombre du côté `o`
export function texFenetreCadre(o = 1) {
  const J = CADRE.jour, W = 256, H = Math.round(W * (J.haut - J.bas) / J.l);
  return canvasTex(W, H, (g, w, h) => {
    const m = w / J.l, cad = 0.06 * m;
    g.fillStyle = '#2b282a'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#efeee9'; g.fillRect(0, h - 0.05 * m, w, 0.05 * m);
    const e = o ? CADRE.etroit * m : 0, xe = o > 0 ? w - e : 0, xg = o < 0 ? e : 0;
    const verre = g.createLinearGradient(0, 0, 0, h);
    verre.addColorStop(0, '#eaf0f5'); verre.addColorStop(0.55, '#cdd7e0'); verre.addColorStop(1, '#8f9aa5');
    g.fillStyle = verre; g.fillRect(xg + cad, cad, w - e - 2 * cad, h - 0.05 * m - 2 * cad);
    if (o) { g.fillStyle = '#34363a'; g.fillRect(xe + cad * 0.8, cad, e - 1.6 * cad, h - 0.05 * m - 2 * cad); g.fillStyle = '#4a4d52'; g.fillRect(xe + e / 2 - 1, cad, 2, h - 0.05 * m - 2 * cad); }
    g.fillStyle = 'rgba(255,255,255,0.13)';
    g.beginPath(); g.moveTo(xg + (w - e) * 0.3, cad); g.lineTo(xg + (w - e) * 0.55, cad); g.lineTo(xg + (w - e) * 0.3, h * 0.9); g.lineTo(xg + (w - e) * 0.08, h * 0.9); g.fill();
    // la pastille des pompiers, à un mètre du plancher, près du bord du grand carreau opposé à l'ouvrant (photos 10, 16)
    g.fillStyle = '#d8262c'; g.beginPath(); g.arc(o > 0 ? xg + (w - e) * 0.15 : o < 0 ? xg + (w - e) * 0.85 : w * 0.55, h - (1.0 - J.bas) * m, 0.075 * m, 0, 7); g.fill();
  }, null, false, 4);
}
// LE REFLET DE LA RUE dans les vitres des étages, vu de dehors (relecture du lot façade, 11/10 — photos 11, 12, 17, 18 de
// près : les carreaux renvoient le ciel couvert et l'immeuble d'en face, un mur clair, des menuiseries de bois brun et des
// garde-corps blancs ; des bureaux, on ne voit presque rien — le jeu y montrait les plafonniers et les affichettes
// allumés). Une tuile répétée en largeur (chaque vitre la décale) ; `ciel` : la part du haut où se reflète le ciel (vu
// d'en bas, plus la vitre est haute, plus il y en a)
export function texRefletRue(ciel = 0.25, s = 7) {
  return canvasTex(256, 128, (g, w, h) => {
    const r = graine(s), hc = h * ciel;
    const gc = g.createLinearGradient(0, 0, 0, hc + 2); gc.addColorStop(0, '#dfe5eb'); gc.addColorStop(1, '#b9c2ca');
    g.fillStyle = gc; g.fillRect(0, 0, w, hc + 2);
    // l'immeuble d'en face : le mur, puis ses fenêtres (bois brun, verre sombre) et leurs garde-corps blancs, par étages
    g.fillStyle = '#9c9890'; g.fillRect(0, hc, w, h - hc);
    g.fillStyle = '#86837c'; g.fillRect(0, hc, w, 3);
    for (let y = hc + 8; y < h; y += 46) {
      for (let x = (r() * 30) | 0; x < w; x += 58 + ((r() * 14) | 0)) {
        g.fillStyle = '#5f4c3d'; g.fillRect(x, y, 40, 34);
        g.fillStyle = '#4a5157'; g.fillRect(x + 4, y + 4, 15, 26); g.fillRect(x + 21, y + 4, 15, 26);
        g.fillStyle = 'rgba(214,216,212,0.85)'; g.fillRect(x - 3, y + 20, 46, 2); g.fillRect(x - 3, y + 27, 46, 2);
      }
    }
    // le voile du verre : un dégradé de bas en haut, une bande de lumière en biais
    const gv = g.createLinearGradient(0, 0, 0, h); gv.addColorStop(0, 'rgba(255,255,255,0.05)'); gv.addColorStop(1, 'rgba(40,46,52,0.25)');
    g.fillStyle = gv; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,0.08)';
    g.beginPath(); g.moveTo(w * 0.3, 0); g.lineTo(w * 0.45, 0); g.lineTo(w * 0.3, h); g.lineTo(w * 0.15, h); g.fill();
  }, [1, 1], false, 4);
}
// (une vitre du reflet : sa géométrie prend un morceau décalé de la tuile, d'une largeur à peu près à l'échelle)
export function geoReflet(l, h, decalage) {
  const geo = new THREE.PlaneGeometry(l, h), uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setX(i, decalage + uv.getX(i) * l * 0.4);
  return geo;
}

// =====================================================================
//  LES PANNEAUX DESSINÉS (signalétique, affiches) : des cartes à poser telles quelles
// =====================================================================
// LE PANNEAU DAE (photos 04, 05) : vert #1E7B4E, cœur et éclair blancs, « DAE »
export function texDAE() {
  return canvasTex(256, 64, (g, w, h) => {
    g.fillStyle = '#1e7b4e'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#ffffff'; g.lineWidth = 3; g.strokeRect(3, 3, w - 6, h - 6);
    g.fillStyle = '#ffffff'; g.beginPath();
    const cx = 36, cy = 34;
    g.moveTo(cx, cy - 8); g.bezierCurveTo(cx, cy - 20, cx - 22, cy - 20, cx - 22, cy - 4); g.bezierCurveTo(cx - 22, cy + 8, cx, cy + 18, cx, cy + 24);
    g.bezierCurveTo(cx, cy + 18, cx + 22, cy + 8, cx + 22, cy - 4); g.bezierCurveTo(cx + 22, cy - 20, cx, cy - 20, cx, cy - 8); g.fill();
    g.fillStyle = '#1e7b4e'; g.beginPath(); g.moveTo(cx + 3, cy - 14); g.lineTo(cx - 7, cy + 2); g.lineTo(cx + 1, cy + 2); g.lineTo(cx - 4, cy + 16); g.lineTo(cx + 9, cy - 3); g.lineTo(cx + 1, cy - 3); g.closePath(); g.fill();
    g.fillStyle = '#ffffff'; g.fillRect(58, 10, 3, 12); g.fillRect(54, 14, 11, 3);
    g.font = '700 38px "Segoe UI", Arial, sans-serif'; g.textBaseline = 'middle'; g.fillText('DAE', 76, 35);
  }, null, false, 4);
}
// LE PANNEAU DE SORTIE (vert, bonhomme qui court vers la porte et la flèche) : il ÉCLAIRE (bloc autonome)
export function texSortie() {
  return canvasTex(256, 96, (g, w, h) => {
    g.fillStyle = '#12a150'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#f4fff6';
    // la porte
    g.fillRect(150, 18, 40, 62); g.fillStyle = '#12a150'; g.fillRect(156, 24, 28, 56);
    g.fillStyle = '#f4fff6';
    // le bonhomme
    g.beginPath(); g.arc(118, 26, 8, 0, 7); g.fill();
    g.lineWidth = 9; g.lineCap = 'round'; g.strokeStyle = '#f4fff6';
    g.beginPath(); g.moveTo(112, 38); g.lineTo(104, 58); g.lineTo(90, 76); g.stroke();
    g.beginPath(); g.moveTo(104, 58); g.lineTo(120, 64); g.lineTo(124, 80); g.stroke();
    g.beginPath(); g.moveTo(110, 42); g.lineTo(96, 48); g.moveTo(112, 42); g.lineTo(130, 46); g.stroke();
    // la flèche
    g.lineWidth = 8; g.beginPath(); g.moveTo(26, 48); g.lineTo(70, 48); g.stroke();
    g.beginPath(); g.moveTo(54, 32); g.lineTo(72, 48); g.lineTo(54, 64); g.stroke();
  }, null, false, 4);
}
// LE PICTOGRAMME DE L'EXTINCTEUR (photo 06) : rouge, l'extincteur et sa flamme en blanc
export function texPictoExtincteur() {
  return canvasTex(64, 64, (g, w, h) => {
    g.fillStyle = '#d0262d'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffffff';
    g.fillRect(14, 22, 12, 32); g.beginPath(); g.arc(20, 22, 6, Math.PI, 0); g.fill();
    g.fillRect(18, 10, 4, 8); g.fillRect(20, 10, 14, 3); g.fillRect(31, 10, 3, 14);
    g.beginPath(); g.moveTo(44, 54); g.quadraticCurveTo(36, 44, 44, 32); g.quadraticCurveTo(46, 40, 50, 36); g.quadraticCurveTo(56, 46, 50, 54); g.closePath(); g.fill();
  }, null, false, 2);
}
// L'AUTOCOLLANT « iris » des portes vitrées du passage (photo 19) : pavé noir, « iris » blanc, la coche orange sur le i
export function texAutocollantIris() {
  return canvasTex(128, 48, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = '#111111'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffffff'; g.font = '600 36px "Century Gothic", "Avenir", "Futura", "Segoe UI", sans-serif'; g.textBaseline = 'middle';
    g.fillText('iris', 22, 26);
    g.fillStyle = '#f08a24'; g.fillRect(22, 6, 8, 5);
  }, null, false, 4);
}
// UNE AFFICHE : un bloc de couleur, un titre, des lignes figurées
export function texAffiche(teinte, fond = '#f7f6f1', graineN = 1) {
  return canvasTex(256, 362, (g, w, h) => {
    const r2 = graine(graineN * 97 + 5);
    g.fillStyle = fond; g.fillRect(0, 0, w, h);
    g.fillStyle = teinte; g.fillRect(0, 0, w, h * (0.25 + r2() * 0.2));
    g.fillStyle = 'rgba(255,255,255,0.88)'; g.fillRect(18, 34, w * 0.55, 16); g.fillRect(18, 60, w * 0.4, 10);
    g.fillStyle = '#9aa0a6';
    for (let y = h * 0.48; y < h - 30; y += 15) g.fillRect(18, y, (0.4 + r2() * 0.5) * w, 6);
  }, null, false, 4);
}
// LE PLAN D'ÉVACUATION « Consignes de sécurité » (photo 06) : blanc, cadre bleu, un plan au trait
export function texConsignes() {
  return canvasTex(256, 352, (g, w, h) => {
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#2b4c9b'; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10);
    g.fillStyle = '#2b4c9b'; g.fillRect(10, 10, w - 20, 34);
    g.fillStyle = '#fff'; g.font = '700 18px "Segoe UI", Arial, sans-serif'; g.fillText('Consignes de sécurité', 18, 33);
    g.strokeStyle = '#4b5a7a'; g.lineWidth = 2;
    g.strokeRect(24, 60, w - 48, 150); g.beginPath(); g.moveTo(24, 130); g.lineTo(w - 24, 130); g.moveTo(110, 60); g.lineTo(110, 210); g.stroke();
    g.fillStyle = '#21a35a'; g.fillRect(150, 140, 40, 20);
    for (let k = 0; k < 6; k++) { g.fillStyle = ['#d0262d', '#21a35a', '#2b4c9b'][k % 3]; g.fillRect(24 + (k % 3) * 70, 230 + Math.floor(k / 3) * 50, 60, 36); }
  }, null, false, 4);
}
// L'AFFICHE JAUNE DU TRI (photo 06) : fond #F2B705, une silhouette violette qui jette un gobelet blanc
export function texTri() {
  return canvasTex(256, 362, (g, w, h) => {
    g.fillStyle = '#f2b705'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#6b2c7a';
    g.beginPath(); g.moveTo(150, 40); g.lineTo(210, 70); g.lineTo(190, 200); g.lineTo(140, 190); g.closePath(); g.fill();
    g.beginPath(); g.arc(175, 40, 18, 0, 7); g.fill();
    g.fillStyle = '#ffffff'; g.fillRect(60, 170, 70, 110); g.fillStyle = '#e8e8e8'; g.fillRect(56, 160, 78, 14);
    g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(98, 100); g.lineTo(122, 100); g.lineTo(118, 136); g.lineTo(102, 136); g.fill();
    g.fillStyle = '#4a3a10'; g.font = '500 14px "Segoe UI", sans-serif'; g.fillText('Trions nos déchets', 40, 320);
  }, null, false, 4);
}
// L'ÉCRAN DE LA SALLE D'ATTENTE (photo 02) : bleu, le logo de l'école, le message du jour
export function texEcran() {
  return canvasTex(512, 288, (g, w, h) => {
    const d = g.createLinearGradient(0, 0, w, h); d.addColorStop(0, '#2a6db0'); d.addColorStop(1, '#13385e');
    g.fillStyle = d; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,0.07)';
    const r2 = graine(5);
    for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(r2() * w, r2() * h, 20 + r2() * 70, 0, 7); g.fill(); }
    g.fillStyle = '#ffffff'; g.font = '600 96px "Century Gothic", "Avenir", "Futura", "Segoe UI", sans-serif';
    g.textBaseline = 'middle'; g.fillText('iris', 36, 112);
    g.fillStyle = '#f08a24'; g.fillRect(40, 62, 18, 10);
    g.font = '500 26px "Segoe UI", sans-serif'; g.fillStyle = '#d6e6f5';
    g.fillText('Bienvenue', 40, 196); g.fillText('Connectez-vous aux métiers de demain', 40, 232);
  }, null, false, 4);
}

// L'AURÉOLE d'un plafonnier : noire au centre (le disque lumineux est un autre maillage), un anneau clair juste autour,
// puis une décroissance rapide (exponentielle) jusqu'au bord. Lue en mélange additif : le noir n'ajoute rien.
// (Relecture du 09/10 : l'anneau clair commençait à 13,5 cm du centre, la couronne du spot s'arrête à 10,5 cm — entre les
// deux, une bande de plafond NON éclairée faisait un cerne sombre autour de chaque spot, puis l'anneau un second cercle
// lumineux. L'auréole part maintenant du bord de la couronne (t = 0,21 pour le spot ; sous le corps des hublots opales,
// plus larges, rien ne change) et s'éteint en douceur, sans anneau.)
function texHalo() {
  return canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    gr.addColorStop(0, 'rgb(0,0,0)'); gr.addColorStop(0.195, 'rgb(0,0,0)'); gr.addColorStop(0.215, 'rgb(220,220,220)');
    for (let k = 1; k <= 8; k++) { const t = 0.215 + k * 0.785 / 8, v = Math.round(220 * Math.exp(-k * 0.6) * (1 - k / 8.4)); gr.addColorStop(Math.min(1, t), `rgb(${v},${v},${v})`); }
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  }, null, false, 1);
}

// LE JOUR DEHORS. La lumière de la carte est celle d'un intérieur (les plafonniers, la carte d'environnement prise
// dans le hall) : dehors, sous le ciel couvert de Paris (photos 08 à 18), les façades et le bitume sont bien plus clairs,
// et leur lumière vient de tout le ciel — de face comme d'en haut. Les matières du DEHORS reçoivent donc ce ciel en
// émissif (leur propre couleur, légèrement bleutée) : vues par la porte 6 ou le passage, elles sortent claires comme sur
// la photo 07 ; dehors, l'adaptation de l'œil (js/fx.js) fait le reste.
export function jourDehors(m, k = 0.55) {
  m.emissive = new THREE.Color(0.94 * k, 0.98 * k, 1.06 * k);
  if (m.map) m.emissiveMap = m.map;
  else m.emissive.multiply(m.color);                 // (sans image : le ciel teinté de la couleur de la matière)
  return m;
}

// =====================================================================
//  LE JEU DE MATIÈRES
// =====================================================================
export function materiauxEcole() {
  const M = {};
  const std = (o) => new THREE.MeshStandardMaterial(o);

  // ---- les sols ----
  const carr = texCarrelageCouleur();
  M.sol = std({ map: carr, roughnessMap: texCarrelageRugosite(), roughness: 0.95, metalness: 0 });
  M.sol.roughnessMap.repeat.copy(carr.repeat);
  // (relief des joints 0,55 -> 0,3 : à 0,55, l'arête des dalles accrochait les plafonniers ; relecture du 09/10)
  avecRelief(M.sol, normalesCarrelage(), 0.3);
  M.sol.name = 'carrelage anthracite 60x120';
  const pas = texPassage();
  M.solPassage = std({ map: pas, roughness: 0.5 });
  avecRelief(M.solPassage, normalesPassage(), 0.5);
  M.solPassage.name = 'carrelage du passage 30x60';

  // ---- les murs ----
  // (09/10 : le blanc tirait sur le crème une fois éclairé par les plafonniers chauds — #ECE8DF -> #EFEDE8, et l'enduit
  // « béton » en relief faisait une peau d'orange que les photos n'ont pas : une peinture lisse, un relief à peine là)
  M.blanc = std({ map: texPeinture(0xefede8), roughness: 0.86 }); M.blanc.name = 'peinture blanche';
  M.creme = std({ map: texPeinture(0xede5d4), roughness: 0.88 }); M.creme.name = 'peinture crème (passage)';
  // le jaune safran (#E9A01C, RAL 1028) : l'étalonnage « photo » le pousse un peu vers l'orange ; la peinture est donc
  // tirée d'un rien vers le jaune pour sortir à la teinte des photos (vérifié côte à côte avec la photo 02)
  M.orange = std({ map: texPeinture(0xeba624, 4), roughness: 0.62 }); M.orange.name = 'peinture safran';
  for (const m of [M.blanc, M.creme, M.orange]) detailPhoto(m, 'beton', 1, 1, { relief: 0.035, grain: 0, rugo: false });
  M.bois = std({ color: 0xa87235, roughness: 0.42 }); M.bois.name = 'plinthe en bois verni';
  M.lissePVC = std({ color: 0xe7e6e1, roughness: 0.35 });
  M.lisseGrise = std({ color: 0xd6d6d3, roughness: 0.4 });
  M.pilier = std({ map: texPeinture(0xc8c8cb, 3), roughness: 0.8 }); M.pilier.name = 'pilier gris clair';

  // ---- les plafonds ----
  const pl = texPlateaux();
  M.plateaux = std({ map: pl, roughness: 0.55, metalness: 0.15 });
  avecRelief(M.plateaux, normalesPlateaux(), 0.6);
  M.plateaux.name = 'plafond en plateaux perforés';
  M.platre = std({ color: 0xedebe6, roughness: 0.92 }); M.platre.name = 'plafond en plâtre';
  M.dalles = std({ map: texDalles(), roughness: 0.95 }); M.dalles.name = 'plafond en dalles 60x60';
  // LE REBOND VERS LES PLAFONDS. Rien n'éclaire un plafond par en dessous dans ce moteur, sauf l'hémisphère et la carte
  // d'environnement — qui voient surtout le carrelage sombre : les plafonds sortaient gris-brun. Sur les photos, ils sont
  // presque aussi clairs que les murs (la lumière des spots revient des murs blancs, et les luminaires en éclairent un
  // peu le pourtour). Un léger émissif, de leur propre couleur, tient lieu de ce rebond.
  // (09/10 : 0,32 -> 0,12 — sur les photos 02, 03, 04, 05, 21, le plafond au-dessus du photographe est NETTEMENT plus
  // sombre que les murs, gris-brun : il ne voit que le rebond ; à 0,32 il sortait aussi clair qu'eux, image plate)
  for (const m of [M.plateaux, M.platre, M.dalles]) { m.emissive = new THREE.Color(0xd8d4cc); m.emissiveIntensity = 0.12; if (m.map) m.emissiveMap = m.map; }
  M.ossature = std({ color: 0xf1efe9, roughness: 0.6 });

  // ---- les portes et menuiseries ----
  M.porte = std({ color: 0xa9a8a6, roughness: 0.45 }); M.porte.name = 'vantail gris stratifié';
  M.porteGaine = std({ color: 0x9d9c9a, roughness: 0.5 });     // (photo 01 : gris moyen, pas grège ; 09/10)
  M.huisserie = std({ color: 0xe3ded2, roughness: 0.5, metalness: 0.1 });
  M.noyer = std({ color: 0x4a2e1c, roughness: 0.5 });
  M.inox = std({ color: 0xb9bcbe, roughness: 0.28, metalness: 0.9 });
  M.ferme = std({ color: 0x9ea2a5, roughness: 0.4, metalness: 0.6 });
  M.alu = std({ color: 0xf0f0ee, roughness: 0.38, metalness: 0.2 }); M.alu.name = 'aluminium laqué blanc';
  M.aluGris = std({ color: 0x8e9192, roughness: 0.35, metalness: 0.7 });
  M.noirMat = std({ color: 0x151515, roughness: 0.7 });
  M.acierNoir = std({ color: 0x282529, roughness: 0.5, metalness: 0.4 });
  M.menuiserie = std({ color: 0x2b282a, roughness: 0.45, metalness: 0.2 });
  M.barreaux = std({ color: 0x31332f, roughness: 0.5, metalness: 0.5 });
  M.rougeEtiquette = std({ color: 0xc8262c, roughness: 0.5 });
  M.rougeCadre = std({ color: 0xc83c45, roughness: 0.6 }); M.rougeCadre.name = 'cadre rouge de la façade';
  M.radiateur = std({ color: 0xedede8, roughness: 0.35 });
  M.creme2 = std({ color: 0xddd6c8, roughness: 0.6 });
  M.grille = std({ color: 0x9c9c9a, roughness: 0.5, metalness: 0.4 });

  // ---- les vitrages (transparents : jamais cousus, chacun le sien) ----
  // verre clair, un rien vert, presque invisible : ce sont les REFLETS (carte d'environnement) qui le font voir
  M.verre = std({ color: 0xcfe3da, roughness: 0.04, metalness: 0.1, transparent: true, opacity: 0.16, depthWrite: false, envMapIntensity: 1.6, side: THREE.DoubleSide });
  M.verre.name = 'verre clair';
  // verre dépoli menthe des jours de souffrance (salle d'attente, bureau B) : la lumière de la pièce derrière le traverse
  M.depoli = std({ color: 0xd3e6dd, roughness: 0.55, transparent: true, opacity: 0.86, emissive: 0xc8dcd2, emissiveIntensity: 0.18, depthWrite: true });
  M.depoli.name = 'verre dépoli menthe';
  // la porte de secours du fond (photo 05) : verre dépoli bleu, éclairé par le jour derrière (relecture du 09/10 : un
  // gris-bleu éteint — mesuré sur la photo, rapporté au mur blanc voisin, R 0,40 V 0,50 B 0,70 ; il sortait d'un bleu
  // franc, 0,40 / 0,57 / 0,83 : #4F6D96 -> #546479)
  M.depoliBleu = std({ color: 0x546479, roughness: 0.5, emissive: 0x848ea0, emissiveIntensity: 0.13 });
  // les vitres de la façade vues de l'intérieur : le jour couvert derrière, un voile clair
  M.vitreJour = std({ color: 0xdeeaf6, roughness: 0.1, transparent: true, opacity: 0.22, depthWrite: false, envMapIntensity: 1.2, side: THREE.DoubleSide });
  // la fente vitrée des portes grises : un verre sombre (on ne voit qu'un reflet)
  M.vitreFente = std({ color: 0x3a4246, roughness: 0.08, metalness: 0.4 });
  M.store = std({ color: 0xeeeeea, roughness: 0.7 });

  // ---- l'escalier ----
  // (09/10, photos 06 et 20 : les marches et les contremarches sont gris anthracite, du ton du carrelage — seuls les
  // limons et la sous-face sont peints en blanc ; le garde-corps est d'un gris moyen, pas d'un gris de fer)
  M.marche = std({ color: 0x575654, roughness: 0.55 }); M.marche.name = 'marche anthracite';
  M.contremarche = std({ color: 0x4d4c4a, roughness: 0.7 }); M.contremarche.name = 'contremarche anthracite';
  M.nez = std({ color: 0x2c2c2c, roughness: 0.8 });
  M.beton = std({ color: 0xe6e4df, roughness: 0.85 }); M.beton.name = 'béton peint (escalier)';
  M.garde = std({ color: 0x8a8d90, roughness: 0.4, metalness: 0.5 }); M.garde.name = 'garde-corps acier gris';

  // ---- l'accueil ----
  M.comptoir = std({ color: 0xc6c8cb, roughness: 0.4 }); M.comptoir.name = 'stratifié gris clair';
  M.comptoirDessus = std({ color: 0xd8dadc, roughness: 0.3 });
  M.socle = std({ color: 0x3a3a3a, roughness: 0.6 });
  M.tapis = std({ color: 0x3e4656, roughness: 0.98 }); M.tapis.name = 'tapis d\'entrée';
  M.noir = std({ color: 0x151517, roughness: 0.35 });

  // ---- la façade ----
  // (lot façade du 11/10 : mesurée sur les photos 12, 16, 17, 18 au même point de vue que le jeu, la pierre de l'école est
  // d'un gris neutre — R/B 1,01-1,03 —, le jeu la rendait crème — R/B 1,13-1,15 — : une teinte froide la ramène)
  M.pierre = std({ map: texPierre(), roughness: 0.82, color: TEINTE_PIERRE }); M.pierre.name = 'pierre calcaire de la façade';
  M.etage = std({ map: texEtage(), roughness: 0.7, color: TEINTE_PIERRE }); M.etage.name = 'étages de la façade';
  for (const m of [M.pierre, M.etage]) jourDehors(m, 0.1);

  // ---- ce qui ÉCLAIRE (couleurs au-dessus de 1 : le bloom les fait briller) ----
  const chaud = new THREE.Color(0xffe4be);
  // (09/10 : sur les photos 02, 03, 21, le disque du spot est saturé et bave d'un halo — 3,2 -> 5,5 ; la galette
  // opale des couloirs aussi, un peu moins — 2,2 -> 3,4)
  M.spot = new THREE.MeshBasicMaterial({ color: chaud.clone().multiplyScalar(5.5) }); M.spot.name = 'spot allumé';
  M.opale = new THREE.MeshBasicMaterial({ color: chaud.clone().multiplyScalar(3.4) }); M.opale.name = 'hublot opale allumé';
  M.tube = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff0d2).multiplyScalar(3.0) }); M.tube.name = 'tube fluorescent';
  // LE HALO d'un plafonnier sur le plafond (photos 02, 21, 01, 05 : autour de chaque spot, le plafond s'éclaire d'une
  // auréole chaude — la lumière qui fuit du diffuseur, et l'objectif qui bave) : un disque additif, sans profondeur écrite
  M.halo = new THREE.MeshBasicMaterial({ map: texHalo(), color: chaud.clone().multiplyScalar(1.2), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  M.halo.name = 'halo de plafonnier';
  M.embout = std({ color: 0xe8701e, roughness: 0.5, emissive: 0xe8701e, emissiveIntensity: 0.6 });
  // la couronne des spots : de la tôle laquée blanche (métallique, elle sortait grise sous le plafond sombre de la carte)
  M.couronne = std({ color: 0xf6f5f1, roughness: 0.35, metalness: 0, emissive: 0xfff0dc, emissiveIntensity: 0.35 });
  M.sortie = new THREE.MeshBasicMaterial({ map: texSortie(), color: new THREE.Color(1.6, 1.6, 1.6) }); M.sortie.name = 'bloc de sortie';
  M.boitier = std({ color: 0xf2f2ef, roughness: 0.4 });
  M.ciel = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xdeeaf6).multiplyScalar(1.35) });
  return M;
}
