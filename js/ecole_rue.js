// =====================================================================
//  LA RUE DEVANT L'ÉCOLE IRIS (crochet de js/carte_ecole.js) — photos 07 à 18
// =====================================================================
// Une petite rue de Paris en impasse. À l'ouest l'IMPASSE (~10 m après le mitoyen), fermée par un muret taché surmonté
// d'une grille noire, une rangée de pots devant, une masse de verdure derrière (photo 09) ; à l'est la rue file ~25 m
// après l'école jusqu'à un CARREFOUR en T, fermé par un immeuble crème de six étages (photos 08, 15).
// Côté école : le trottoir de 2,4 m (enrobé gris clair, bordure de granit), pavé devant le n° 8 et le n° 10 (photo 09) ;
// la chaussée de 6,4 m (photos 08, 15 : on y gare d'un côté, on y roule, et à l'est de l'école on y gare aussi des deux
// côtés) avec sa file de stationnement côté sud, ses reprises d'enrobé, ses lignes effacées, le rond d'interdiction
// peint, la pièce de pavés au milieu, les plaques ; le trottoir d'en face de 1,6 m.
// En face : l'immeuble moderne 5/7 (enduit blanc, bandeaux de mélèze, rez-de-chaussée vitré et porte de garage en bois),
// puis le JARDIN derrière sa grille noire doublée de brande, sur un muret (photo 15), et ses grands arbres ; l'immeuble
// des années 60 au fond du jardin. Côté école : le n° 8 et le n° 10 (pierre, haussmanniens) à l'ouest ; le n° 4 en
// pierre, l'immeuble blanc aux géraniums et les immeubles crème à l'est.
// LE MOBILIER, LES PLANTES ET LES DEUX-ROUES : js/ecole_rue_mobilier.js. LES VOITURES : js/ecole_rue_voitures.js.
//
// Coordonnées du PLAN (voir js/carte_ecole.js) : y < 0 = dehors ; le trottoir est au niveau du hall, la chaussée 12 cm
// plus bas (une dalle du monde solide ; la bordure se franchit comme une marche).
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { canvasTex, detailPhoto } from './kit_decor.js';
import { jourDehors } from './ecole_matieres.js';
import { poserMobilierRue, alea } from './ecole_rue_mobilier.js';
import { poserVoitures, Taches } from './ecole_rue_voitures.js';

// LES COTES DE LA RUE (en plan)
export const RUE = {
  X0: -10.5, X1: 45,                        // de l'impasse (nu du muret) au carrefour
  Y_TROTTOIR: -2.8,                         // le nu de la bordure côté école (trottoir de 2,4 m)
  Y_CHAUSSEE: -9.35,                        // le nu de la bordure d'en face (chaussée de 6,4 m)
  Y_FACE: -11.1,                            // les façades d'en face (trottoir de 1,6 m)
  H_CHAUSSEE: -0.12,
  X_JARDIN: [15, 42],                       // le jardin d'en face, derrière sa grille
};
const { X0, X1, Y_TROTTOIR, Y_CHAUSSEE, Y_FACE, H_CHAUSSEE } = RUE;

// =====================================================================
//  LES TEXTURES DE LA RUE
// =====================================================================
// L'ENROBÉ : un gris uni, des reprises plus sombres, un grain fin (le détail photographique du béton par-dessus)
function texEnrobe(hex, graine) {
  const r = (hex >> 16) & 255, g0 = (hex >> 8) & 255, b = hex & 255;
  let x = graine; const rnd = () => { x = (x * 16807) % 2147483647; return x / 2147483647; };
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = `rgb(${r},${g0},${b})`; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 14; k++) {
      const d = -14 + rnd() * 10;
      g.fillStyle = `rgba(${r + d},${g0 + d},${b + d},0.35)`; g.fillRect(rnd() * w, rnd() * h, 40 + rnd() * 160, 30 + rnd() * 120);
    }
    for (let k = 0; k < 9000; k++) { const v = r - 30 + rnd() * 60; g.fillStyle = `rgba(${v},${v},${v + 2},0.35)`; g.fillRect(rnd() * w, rnd() * h, 1.5, 1.5); }
    // quelques taches sombres (huile, chewing-gums écrasés) et des gravillons clairs
    for (let k = 0; k < 40; k++) { g.fillStyle = `rgba(30,30,32,${0.08 + rnd() * 0.12})`; g.beginPath(); g.ellipse(rnd() * w, rnd() * h, 2 + rnd() * 14, 2 + rnd() * 9, rnd() * 3, 0, 7); g.fill(); }
    for (let k = 0; k < 600; k++) { const v = 150 + rnd() * 60; g.fillStyle = `rgba(${v},${v},${v},0.5)`; g.fillRect(rnd() * w, rnd() * h, 1, 1); }
  }, [1 / 4, 1 / 4], false, 8);
}
// LES PAVÉS (trottoir du n° 8 et du n° 10, photo 09 ; la pièce de pavés de la chaussée, photos 08, 15) : granit gris et
// beige en rangées décalées, joints sombres. Une tuile = 1 m.
function texPaves(graine = 5) {
  const r = alea(graine);
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#3d3a36'; g.fillRect(0, 0, w, h);
    const lh = 256 / 7;
    for (let l = 0; l < 7; l++) {
      let x = (l % 2) * -14 - r() * 10;
      while (x < w) {
        const pw = 30 + r() * 14, c = 120 + r() * 50, t = r();
        const col = t < 0.3 ? `rgb(${c + 12},${c + 4},${c - 10})` : t < 0.6 ? `rgb(${c},${c},${c + 2})` : `rgb(${c - 8},${c - 10},${c - 12})`;
        g.fillStyle = col;
        const y = l * lh + 2 + r() * 2, hh = lh - 5 - r() * 2;
        g.beginPath(); g.roundRect(x + 2, y, pw - 4, hh, 4); g.fill();
        g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(x + 4, y + 2, pw - 10, 3);
        g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(x + 3, y + hh - 4, pw - 6, 3);
        for (let k = 0; k < 14; k++) { g.fillStyle = `rgba(${r() < 0.5 ? '0,0,0' : '255,255,255'},0.1)`; g.fillRect(x + 3 + r() * (pw - 6), y + r() * hh, 2, 2); }
        x += pw;
      }
    }
    // la mousse et la terre dans quelques joints
    for (let k = 0; k < 60; k++) { g.fillStyle = `rgba(${70 + r() * 20},${80 + r() * 20},50,0.35)`; g.fillRect(r() * w, r() * h, 3 + r() * 6, 2); }
  }, [1, 1], false, 8);
}
// LA BRANDE (la haie de bruyère tressée qui double la grille du jardin, photo 15) : des brins verticaux serrés,
// brun-gris, quelques jours. Une tuile = 1 m de large x 1,9 m de haut.
function texBrande() {
  const r = alea(19);
  return canvasTex(256, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = 'rgba(52,44,36,1)'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 1400; k++) {
      const x = r() * w, y = r() * h, l = 20 + r() * 90, c = 60 + r() * 70;
      g.strokeStyle = `rgba(${c + 15},${c + 4},${c - 10},${0.5 + r() * 0.5})`; g.lineWidth = 0.6 + r() * 1.2;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 6, y + l); g.stroke();
    }
    // les jours (on devine le jardin derrière) : de petites fentes transparentes
    g.globalCompositeOperation = 'destination-out';
    for (let k = 0; k < 90; k++) { g.fillStyle = `rgba(0,0,0,${0.6 + r() * 0.4})`; g.fillRect(r() * w, r() * h, 1 + r() * 2, 4 + r() * 16); }
    g.globalCompositeOperation = 'source-over';
    // les ligatures horizontales (fil de fer) tous les ~45 cm
    for (const y of [0.18, 0.43, 0.68, 0.93]) { g.fillStyle = 'rgba(40,36,30,0.9)'; g.fillRect(0, y * h, w, 2); }
  }, [1, 1 / 1.9], true, 4);
}
// LE BÉTON DES MURETS, taché de coulures (photos 09, 15) — une seule matière pour tous les murets
let _betonMuret = null;
const betonMuret = () => (_betonMuret = _betonMuret || jourDehors(new THREE.MeshStandardMaterial({ map: texMuret(), roughness: 0.92 }), 0.1));
function texMuret() {
  const r = alea(23);
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#b9b5ab'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 50; k++) { const c = 150 + r() * 50; g.fillStyle = `rgba(${c},${c - 4},${c - 12},0.25)`; g.beginPath(); g.ellipse(r() * w, r() * h, 10 + r() * 50, 6 + r() * 30, r() * 3, 0, 7); g.fill(); }
    // les coulures (sous la grille, l'eau qui ruisselle) : peu nombreuses, larges, fondues ; la mousse au pied
    g.filter = 'blur(2px)';
    for (let k = 0; k < 18; k++) {
      const x = r() * w, l = 40 + r() * 170, gr = g.createLinearGradient(0, h * 0.5, 0, h * 0.5 + l);
      gr.addColorStop(0, 'rgba(78,80,68,0.28)'); gr.addColorStop(1, 'rgba(78,80,68,0)');
      g.fillStyle = gr; g.fillRect(x, h * 0.5, 5 + r() * 16, l);
    }
    g.filter = 'none';
    const mousse = g.createLinearGradient(0, h - 30, 0, h); mousse.addColorStop(0, 'rgba(86,96,62,0)'); mousse.addColorStop(1, 'rgba(86,96,62,0.35)');
    g.fillStyle = mousse; g.fillRect(0, h - 30, w, 30);
    for (let k = 0; k < 4000; k++) { const v = 120 + r() * 90; g.fillStyle = `rgba(${v},${v},${v - 6},0.25)`; g.fillRect(r() * w, r() * h, 1, 1); }
  }, [1 / 2, 1 / 2], false, 4);
}
// UNE FAÇADE D'IMMEUBLE dessinée (une travée x un étage par tuile) : fond, joints de pierre, fenêtre et son encadrement,
// appui, garde-corps, persiennes, bandeaux de bois (le 5/7)
function texFacade({ fond, cadre = '#2b282a', verre = '#4d5a66', travee = 1.8, etage = 3.0, fl = 1.2, fh = 1.6, balcon = false, bandeau = null,
  persiennes = null, joints = false, encadrement = null, bois = null, rideaux = false, fleurs = false, balconBlanc = false, brique = null, graine = 3 }) {
  const W = 256, H = Math.round(W * etage / travee), r = alea(graine);
  return canvasTex(W, H, (g, w, h) => {
    const mx = w / travee, my = h / etage;
    g.fillStyle = fond; g.fillRect(0, 0, w, h);
    // (lot façade : la brique chamois du n° 8 et ses rangs de brique rouge — photos 09, 10 : assises de 7,5 cm, joints clairs)
    if (brique) {
      const [rb, vb, bb] = brique, ha = 0.075 * my, la = 0.22 * mx;
      for (let y = 0, l = 0; y < h; y += ha, l++) {
        const rouge = l % 14 === 3 || l % 14 === 4;
        for (let x = (l % 2) * la / 2 - la; x < w; x += la) {
          const t = (r() - 0.5) * 22;
          g.fillStyle = rouge ? `rgb(${150 + t},${78 + t * 0.6},${58 + t * 0.5})` : `rgb(${rb + t},${vb + t},${bb + t * 0.8})`;
          g.fillRect(x + 1, y + 1, la - 1.5, ha - 1.2);
        }
      }
    }
    for (let k = 0; k < 600; k++) { g.fillStyle = `rgba(${r() < 0.5 ? '0,0,0' : '255,255,255'},0.04)`; g.fillRect(r() * w, r() * h, 2, 2); }
    if (joints) {
      g.fillStyle = 'rgba(0,0,0,0.07)';
      for (let y = 0; y < h; y += 0.45 * my) g.fillRect(0, y, w, 1.5);
      for (let y = 0, l = 0; y < h; y += 0.45 * my, l++) for (let x = (l % 2) * 0.5 * mx; x < w; x += 1.0 * mx) g.fillRect(x, y, 1.2, 0.45 * my);
    }
    if (bandeau) { g.fillStyle = bandeau; g.fillRect(0, h - 0.35 * my, w, 0.35 * my); g.fillRect(0, 0, w, 0.12 * my); }
    const x = (w - fl * mx) / 2, y = h - (0.9 + fh) * my;
    if (encadrement) { g.fillStyle = encadrement; g.fillRect(x - 0.14 * mx, y - 0.16 * my, fl * mx + 0.28 * mx, fh * my + 0.26 * my); }
    if (bois) {
      // le 5/7 : un caisson de mélèze autour de la baie, plus haut sous l'appui
      g.fillStyle = bois; g.fillRect(x - 0.1 * mx, y - 0.1 * my, fl * mx + 0.2 * mx, fh * my + 0.62 * my);
      g.fillStyle = 'rgba(0,0,0,0.12)'; for (let k = 0; k < 5; k++) g.fillRect(x - 0.1 * mx, y + fh * my + 0.12 * my + k * 0.1 * my, fl * mx + 0.2 * mx, 1);
    }
    g.fillStyle = cadre; g.fillRect(x - 3, y - 3, fl * mx + 6, fh * my + 6);
    const gr = g.createLinearGradient(0, y, 0, y + fh * my); gr.addColorStop(0, '#a9b8c6'); gr.addColorStop(0.5, verre); gr.addColorStop(1, '#2c333b');
    g.fillStyle = gr; g.fillRect(x, y, fl * mx, fh * my);
    if (rideaux) { g.fillStyle = 'rgba(236,228,214,0.55)'; g.fillRect(x + 2, y + 2, fl * mx * 0.22, fh * my - 4); g.fillRect(x + fl * mx * 0.78 - 2, y + 2, fl * mx * 0.22, fh * my - 4); }
    g.fillStyle = cadre; g.fillRect(x + fl * mx / 2 - 2, y, 4, fh * my);
    g.fillRect(x, y + fh * my * 0.25, fl * mx, 2);
    if (persiennes) { g.fillStyle = persiennes; g.fillRect(x - 0.35 * mx, y, 0.3 * mx, fh * my); g.fillRect(x + fl * mx + 0.05 * mx, y, 0.3 * mx, fh * my);
      g.fillStyle = 'rgba(0,0,0,0.15)'; for (let k = 0; k < fh * my; k += 5) { g.fillRect(x - 0.35 * mx, y + k, 0.3 * mx, 1); g.fillRect(x + fl * mx + 0.05 * mx, y + k, 0.3 * mx, 1); } }
    if (balcon) { g.fillStyle = '#1f1f1f'; for (let i = 0; i < 14; i++) g.fillRect(x - 6 + i * (fl * mx + 12) / 13, y + fh * my * 0.55, 2, fh * my * 0.45); g.fillRect(x - 8, y + fh * my * 0.55, fl * mx + 16, 3); }
    if (balconBlanc) {
      // un balcon filant : la dalle en saillie (une bande claire et son ombre), le garde-corps à barreaudage blanc
      g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, h - 0.05 * my, w, 0.05 * my);
      g.fillStyle = '#f4f3ee'; g.fillRect(0, h - 0.95 * my, w, 0.06 * my); g.fillRect(0, h - 0.12 * my, w, 0.1 * my);
      g.fillStyle = 'rgba(245,244,240,0.9)'; for (let xx = 0; xx < w; xx += 0.11 * mx) g.fillRect(xx, h - 0.92 * my, 2, 0.8 * my);
    }
    if (fleurs) { for (let k = 0; k < 18; k++) { g.fillStyle = r() < 0.6 ? '#c8283a' : '#4f7a32'; g.beginPath(); g.arc(x + r() * fl * mx, y + fh * my - 2 - r() * 10, 3 + r() * 3, 0, 7); g.fill(); } }
    g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(x - 6, y + fh * my + 3, fl * mx + 12, 4);
    g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(x - 8, y + fh * my, fl * mx + 16, 3);
  }, [1 / travee, 1 / etage], false, 4);
}

// LES REZ-DE-CHAUSSÉE dessinés d'un seul tenant (non répétés) : `elements` = [{ t, x0, x1, ... }] en mètres depuis le
// bord gauche (vu de la rue), sur une bande de `L` x `H` m. Types : porte (bois vitré), garage (lames de bois), vitrine,
// fenetre (à barreaux blancs ou noirs), pilier (bois, avec le numéro), auvent.
function texRezDeChaussee(L, H, { fond, socle = null, joints = false, elements = [], ppm = 60, graine = 9 }) {
  const r = alea(graine);
  const W = Math.min(2048, Math.round(L * ppm)), k = W / L, Hp = Math.round(H * k);
  return canvasTex(W, Hp, (g, w, h) => {
    const X = (m) => m * k, Y = (m) => h - m * k;            // (y en mètres depuis le sol)
    g.fillStyle = fond; g.fillRect(0, 0, w, h);
    for (let n = 0; n < w * h / 300; n++) { g.fillStyle = `rgba(${r() < 0.5 ? '0,0,0' : '255,255,255'},0.035)`; g.fillRect(r() * w, r() * h, 2, 2); }
    if (joints) {
      g.fillStyle = 'rgba(0,0,0,0.09)';
      for (let y = 0.0, l = 0; y < H; y += 0.42, l++) { g.fillRect(0, Y(y), w, 1.5); for (let x = (l % 2) * 0.45; x < L; x += 0.9) g.fillRect(X(x), Y(y + 0.42), 1.5, 0.42 * k); }
    }
    if (socle) { g.fillStyle = socle; g.fillRect(0, Y(0.45), w, 0.45 * k); g.fillStyle = 'rgba(0,0,0,0.15)'; g.fillRect(0, Y(0.45), w, 2); }
    for (const e of elements) {
      const x0 = X(e.x0), x1 = X(e.x1), ww = x1 - x0, ht = e.h ?? 2.3, top = Y(ht), bas = Y(e.bas ?? 0);
      if (e.t === 'bande') {
        // (lot façade : un pilastre ou un panneau d'une autre teinte, de toute la hauteur — le n° 8, photo 10)
        g.fillStyle = e.couleur; g.fillRect(x0, top, ww, bas - top);
        g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(x0, top, 2, bas - top); g.fillRect(x1 - 2, top, 2, bas - top);
        continue;
      }
      if (e.t === 'porte' || e.t === 'vitrine') {
        const bois = e.bois || '#8a5a32';
        // (lot façade : l'encadrement de pierre et la corniche d'une porte cochère — le n° 8, photos 09 et 10)
        if (e.encadrement) {
          g.fillStyle = e.encadrement; g.fillRect(x0 - 0.22 * k, top - 0.3 * k, ww + 0.44 * k, bas - top + 0.3 * k);
          g.fillRect(x0 - 0.4 * k, top - 0.42 * k, ww + 0.8 * k, 0.14 * k);
          g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(x0 - 0.4 * k, top - 0.28 * k, ww + 0.8 * k, 3);
        }
        g.fillStyle = e.cadre || bois; g.fillRect(x0, top, ww, bas - top);
        const vit = (a, b, c, d) => { const gr = g.createLinearGradient(0, b, 0, d); gr.addColorStop(0, '#9fb0bd'); gr.addColorStop(0.6, '#4a5560'); gr.addColorStop(1, '#2a3036'); g.fillStyle = gr; g.fillRect(a, b, c - a, d - b); };
        const m = 0.07 * k, n = e.vantaux || (e.t === 'porte' ? 2 : 3);
        for (let i = 0; i < n; i++) {
          const a = x0 + m + i * (ww - m) / n, b = x0 + (i + 1) * (ww - m) / n;
          vit(a, top + m, b, e.t === 'porte' && e.plein ? top + (bas - top) * 0.6 : bas - (e.t === 'porte' ? m * 1.4 : m));
          if (e.chaud) { g.fillStyle = 'rgba(255,214,150,0.25)'; g.fillRect(a, top + m, b - a, bas - top - 2 * m); }
        }
        if (e.imposte) { g.fillStyle = e.cadre || bois; g.fillRect(x0, top + (bas - top) * 0.18, ww, 4); }
        if (e.arc) { g.fillStyle = e.pierre || fond; g.beginPath(); g.moveTo(x0 - 4, top - 2); g.lineTo(x1 + 4, top - 2); g.lineTo(x1 + 4, top + ww * 0.18); g.quadraticCurveTo((x0 + x1) / 2, top - ww * 0.12, x0 - 4, top + ww * 0.18); g.fill(); }
        g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(x0, bas - 3, ww, 3);
      } else if (e.t === 'garage') {
        g.fillStyle = e.bois || '#a77b4e'; g.fillRect(x0, top, ww, bas - top);
        for (let y = top; y < bas; y += 0.11 * k) { g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(x0, y, ww, 1.5); g.fillStyle = 'rgba(255,240,210,0.08)'; g.fillRect(x0, y + 2, ww, 2); }
        for (const [ax, ay] of [[0.2, 0.55], [0.6, 0.6]]) { g.fillStyle = '#f2f2ee'; g.fillRect(x0 + ww * ax, top + (bas - top) * ay, 0.21 * k, 0.29 * k); }
      } else if (e.t === 'fenetre') {
        g.fillStyle = e.encadrement || 'rgba(255,255,255,0.25)'; g.fillRect(x0 - 0.1 * k, top - 0.12 * k, ww + 0.2 * k, bas - top + 0.22 * k);
        const gr = g.createLinearGradient(0, top, 0, bas); gr.addColorStop(0, '#8c9aa6'); gr.addColorStop(1, '#2d343a');
        g.fillStyle = gr; g.fillRect(x0, top, ww, bas - top);
        g.fillStyle = e.barreaux || '#f2f2ee';
        for (let x = x0 + 0.06 * k; x < x1; x += 0.11 * k) g.fillRect(x, top, 0.025 * k, bas - top);
        g.fillRect(x0, top + (bas - top) * 0.5, ww, 0.025 * k);
      } else if (e.t === 'pilier') {
        g.fillStyle = e.bois || '#b98a52'; g.fillRect(x0, top, ww, bas - top);
        for (let x = x0; x < x1; x += 0.07 * k) { g.fillStyle = 'rgba(0,0,0,0.1)'; g.fillRect(x, top, 1, bas - top); }
        if (e.texte) { g.fillStyle = '#f4f2ec'; g.font = `600 ${Math.round(0.2 * k)}px "Segoe UI", Arial, sans-serif`; g.textAlign = 'center'; g.fillText(e.texte, (x0 + x1) / 2, top + 0.45 * k); }
      } else if (e.t === 'auvent') {
        g.fillStyle = e.couleur || '#2d3134'; g.beginPath(); g.moveTo(x0, top); g.lineTo(x1, top); g.lineTo(x1 + 0.1 * k, top + 0.5 * k); g.lineTo(x0 - 0.1 * k, top + 0.5 * k); g.fill();
        if (e.texte) { g.fillStyle = '#e8e2d0'; g.font = `600 ${Math.round(0.22 * k)}px Georgia, serif`; g.textAlign = 'center'; g.fillText(e.texte, (x0 + x1) / 2, top + 0.36 * k); }
      } else if (e.t === 'plaque') {
        g.fillStyle = '#1d3f7a'; g.fillRect(x0, top, ww, bas - top); g.strokeStyle = '#e8e8e8'; g.lineWidth = 2; g.strokeRect(x0 + 2, top + 2, ww - 4, bas - top - 4);
        g.fillStyle = '#ffffff'; g.font = `700 ${Math.round((bas - top) * 0.62)}px Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(e.texte || '', (x0 + x1) / 2, (top + bas) / 2 + 1); g.textBaseline = 'alphabetic';
      }
    }
  }, null, false, 8);
}

// =====================================================================
//  LA RUE
// =====================================================================
export function poserRue(ch) {
  const { M, C } = ch;
  // (toutes les matières de la rue reçoivent le jour du ciel couvert : js/ecole_matieres.js jourDehors)
  const std = (o, k = 0.12) => jourDehors(new THREE.MeshStandardMaterial(o), k);
  const taches = new Taches();
  // ---- le sol : trottoirs, bordures, caniveaux, chaussée ----
  const trottoir = std({ map: texEnrobe(0x625f5f, 7), roughness: 0.9 }, 0.05);
  // (relecture du 09/10/2026 : mesurés sur les photos 08, 09, 13 et 15, l'enrobé de la chaussée est presque aussi clair
  // que le trottoir — un gris moyen, ~0,66 de la façade de l'école ; il en faisait 0,45 et paraissait mouillé)
  const chaussee = std({ map: texEnrobe(0x5e5d61, 11), roughness: 0.92 }, 0.04);
  for (const m of [trottoir, chaussee]) detailPhoto(m, 'beton', 4, 4, { relief: 0.5, grain: 0.15, rugo: true });
  const paves = std({ map: texPaves(5), roughness: 0.85 }, 0.05);
  const granit = std({ color: 0x7b7b77, roughness: 0.72 }, 0.06);      // (photo 08 : la bordure n'est qu'un quart plus claire que le trottoir)
  const caniveau = std({ color: 0x6c6a66, roughness: 0.85 }, 0.05);
  // (les sols : des rectangles aux UV en mètres du plan, rangés par matière puis cousus en un maillage par matière — à la
  // fin de poserRue ; leurs matières ont le grain photographique, la couture du décor ne les toucherait pas)
  const sols = new Map();
  const plan = (x0, y0, x1, y1, h, mat) => {
    const g = new THREE.PlaneGeometry(x1 - x0, y1 - y0); g.rotateX(-Math.PI / 2);
    const uv = g.attributes.uv, p = g.attributes.position;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, p.getX(i) + (x0 + x1) / 2, -p.getZ(i) + (y0 + y1) / 2);
    g.translate((x0 + x1) / 2, h, -(y0 + y1) / 2);
    if (!sols.has(mat)) sols.set(mat, []);
    sols.get(mat).push(g);
  };
  plan(-0.3, Y_TROTTOIR, X1, -0.4, 0, trottoir);
  plan(X0, Y_TROTTOIR, -0.3, -0.4, 0, paves);                                  // le trottoir pavé du n° 8 et du n° 10
  plan(X0, Y_CHAUSSEE, X1, Y_TROTTOIR - 0.15, H_CHAUSSEE, chaussee);
  plan(X0, Y_FACE, X1, Y_CHAUSSEE - 0.15, 0, trottoir);
  for (const y of [Y_TROTTOIR, Y_CHAUSSEE]) ch.boite(X0, y - 0.15, X1, y, H_CHAUSSEE, 0, granit, { ombre: false });
  // les caniveaux : une bande de béton plus clair, 30 cm, au pied de chaque bordure
  ch.boite(X0, Y_TROTTOIR - 0.45, X1, Y_TROTTOIR - 0.15, H_CHAUSSEE, H_CHAUSSEE + 0.003, caniveau, { ombre: false });
  ch.boite(X0, Y_CHAUSSEE, X1, Y_CHAUSSEE + 0.28, H_CHAUSSEE, H_CHAUSSEE + 0.003, caniveau, { ombre: false });
  // la chaussée, 12 cm sous le trottoir : une dalle pour le joueur ; les bordures se franchissent (une marche)
  C.sol(X0, -(Y_TROTTOIR - 0.15), X1, -(Y_CHAUSSEE), H_CHAUSSEE);

  // ---- LES DÉTAILS DE LA CHAUSSÉE (photos 08, 09, 13, 15) ----
  // les REPRISES d'enrobé : des rectangles plus sombres et plus lisses, surtout côté école
  const reprise = std({ map: texEnrobe(0x4f4e52, 29), roughness: 0.78 }, 0.04);
  const r = alea(77);
  for (const [x0, y0, x1, y1] of [[5.6, -3.4, 8.4, -4.4], [7.2, -5.0, 10.6, -6.6], [11.2, -4.0, 13.4, -5.1], [9.8, -3.25, 11.4, -3.75], [14.6, -3.5, 16.0, -4.6],
    [-2.5, -4.2, 0.6, -5.6], [18.2, -6.0, 20.4, -7.2], [25.5, -4.6, 28.0, -6.0], [2.0, -5.8, 3.4, -6.7], [-8.5, -5.0, -6.2, -6.6]])
    ch.boite(x0, y1, x1, y0, H_CHAUSSEE, H_CHAUSSEE + 0.0025 + r() * 0.001, reprise, { ombre: false });
  // LES LIGNES BLANCHES effacées : la limite de la file de stationnement, les tirets des places, deux lignes en travers
  const peinture = std({ color: 0xdcdcda, roughness: 0.75, transparent: true, opacity: 0.55, depthWrite: false }, 0.15);
  // (une peinture transparente n'est pas cousue avec le décor : tous les traits en UN maillage)
  const traits = [];
  const trait = (x0, y0, x1, y1) => { const g = new THREE.PlaneGeometry(x1 - x0, y1 - y0).rotateX(-Math.PI / 2); g.translate((x0 + x1) / 2, H_CHAUSSEE + 0.0045, -(y0 + y1) / 2); traits.push(g); };
  const yFile = Y_CHAUSSEE + 2.15;
  for (let x = -10; x < 17; x += 3.2) trait(x, yFile - 0.06, x + 2.2, yFile + 0.06);
  for (const x of [-5.6, 0.9, 5.5, 10.15, 15.1]) trait(x - 0.06, yFile - 0.05, x + 0.06, yFile + 0.75);
  // (en travers : au droit du passage, jusqu'à la file de stationnement — photo 09 — et avant les vélos, d'un bord à l'autre — photo 08)
  for (const [xl, yb] of [[1.15, yFile + 0.3], [17.6, Y_CHAUSSEE + 0.4]]) for (let y = Y_TROTTOIR - 0.6; y > yb; y -= 1.4) trait(xl - 0.08, y - 0.8, xl + 0.08, y);
  const lignes = new THREE.Mesh(mergeGeometries(traits, false), peinture); lignes.userData.horsAOSol = true; ch.decor.add(lignes);
  // LE ROND D'INTERDICTION peint (bleu cerclé de rouge, barré) en face du passage (photos 08, 13, 14)
  const rond = new THREE.Mesh(new THREE.CircleGeometry(0.52, 40), std({ map: texRondInterdit(), transparent: true, depthWrite: false, roughness: 0.7 }, 0.2));
  rond.rotation.x = -Math.PI / 2; rond.position.set(13.6, H_CHAUSSEE + 0.006, 4.3); ch.decor.add(rond);
  // LES PLAQUES : regards ronds en fonte, un regard carré au milieu de la rue près des vélos (photo 15)
  const fonte = std({ map: texFonte(), roughness: 0.55, metalness: 0.6 }, 0.05);
  for (const [x, y] of [[4.2, -6.2], [14.2, -3.6], [-6.5, -5.5], [30.0, -6.0], [38.0, -4.2]]) {
    const p = new THREE.Mesh(new THREE.CircleGeometry(0.33, 28), fonte); p.rotation.x = -Math.PI / 2; p.position.set(x, H_CHAUSSEE + 0.005, -y); ch.decor.add(p);
  }
  const carre = ch.boite(22.4, -5.9, 23.1, -5.4, H_CHAUSSEE, H_CHAUSSEE + 0.006, fonte, { ombre: false }); void carre;
  ch.boite(1.2, -2.95, 1.75, -3.25, H_CHAUSSEE, H_CHAUSSEE + 0.005, fonte, { ombre: false });               // la grille d'avaloir
  // LA PIÈCE DE PAVÉS au milieu de la chaussée (photos 08, 15) : un rapiéçage de vieux pavés, un rien bombé
  const piece = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.03, 0.72), std({ map: texPaves(41), roughness: 0.8 }, 0.1));
  piece.geometry.attributes.uv.array.forEach((v, i, a) => { a[i] = v * (i % 2 ? 0.72 : 0.95); });
  piece.position.set(16.7, H_CHAUSSEE + 0.004, 5.9); ch.decor.add(piece);
  // L'ARCEAU DE PARKING rabattu (photo 09), rayé orange et blanc, couché sur la chaussée EN TRAVERS de la rue : la barre
  // du côté du passage (est), les deux bras vers l'impasse, jusqu'à la charnière (relecture du 09/10/2026 : il était
  // couché dans le sens de la rue)
  const arceauP = new THREE.Group(); arceauP.position.set(1.45, H_CHAUSSEE + 0.03, 5.95); arceauP.rotation.y = Math.PI / 2 + 0.1; ch.decor.add(arceauP);
  const orangeP = std({ color: 0xdf6a1c, roughness: 0.5 }, 0.12), blancP = std({ color: 0xe9e7e2, roughness: 0.5 }, 0.15);
  for (let i = 0; i < 6; i++) {
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.13, 8), i % 2 ? blancP : orangeP); t.rotation.z = Math.PI / 2; t.position.set(-0.36 + i * 0.14, 0, 0.22); arceauP.add(t);
  }
  for (const s of [-1, 1]) { const t = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.24, 8), orangeP); t.rotation.x = Math.PI / 2; t.position.set(s * 0.43, 0, 0.1); arceauP.add(t); }
  const pied = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.12), std({ color: 0x8c8f91, roughness: 0.5, metalness: 0.6 }, 0.05)); pied.position.set(0, -0.005, 0); arceauP.add(pied);

  // ---- LES FAÇADES ----
  const facade = (x0, y0, x1, y1, h, mat, { collision = true } = {}) => {
    const m = ch.boite(x0, y0, x1, y1, 0, h, mat, { ombre: false, collision });
    m.userData.horsAOSol = true;
    return m;
  };
  // un REZ-DE-CHAUSSÉE dessiné, posé 2 cm devant la façade y = yF, de x0 à x1 ; `face` 'S' (côté école : il regarde la
  // rue au sud) ou 'N' (en face). Les éléments sont donnés en x du PLAN : on les ramène au bord gauche vu de la rue
  // (l'ouest pour le côté école, l'est pour le côté d'en face).
  const rdc = (x0, x1, yF, H, o, face = 'S') => {
    const nord = face === 'N', L = x1 - x0;
    const elements = o.elements.map((e) => ({ ...e, x0: nord ? x1 - e.x1 : e.x0 - x0, x1: nord ? x1 - e.x0 : e.x1 - x0 }));
    const m = new THREE.Mesh(new THREE.PlaneGeometry(L, H), std({ map: texRezDeChaussee(L, H, { ...o, elements }), roughness: 0.8 }, 0.12));
    m.position.set((x0 + x1) / 2, H / 2, -(yF + (nord ? 0.02 : -0.02)));
    if (nord) m.rotation.y = Math.PI;
    m.userData.horsAOSol = true; ch.decor.add(m);
    return m;
  };
  // LES TOITS en mansarde de zinc gris bleuté et leurs lucarnes : un prisme le long d'une façade y = yF (de x0 à x1)
  const zinc = std({ color: 0x5f6870, roughness: 0.55, metalness: 0.4 }, 0.12);
  const lucarne = std({ color: 0xe9e3d6, roughness: 0.85 }, 0.12);
  const toit = (x0, x1, yF, prof, h, face = 'S', haut = 2.6) => {
    const s = face === 'N' ? -1 : 1, sh = new THREE.Shape();
    // le profil (u : vers l'intérieur de l'îlot, v : vers le haut) : le brisis raide, puis le terrasson presque plat
    sh.moveTo(0, 0); sh.lineTo(0.9, haut); sh.lineTo(prof, haut + 0.4); sh.lineTo(prof, 0); sh.closePath();
    const g = new THREE.ExtrudeGeometry(sh, { depth: x1 - x0, bevelEnabled: false });
    // (extrudé le long de z local ; on le tourne pour qu'il file le long de x, le profil vers l'intérieur de l'îlot :
    // côté école, (u, v, z) -> (z, v, -u), l'îlot au nord (-z) depuis x0 ; en face, (u, v, z) -> (-z, v, u) depuis x1.
    // Jamais d'échelle négative : la couture du décor ne retournerait pas les faces.)
    g.rotateY(s > 0 ? Math.PI / 2 : -Math.PI / 2);
    const m = new THREE.Mesh(g, zinc);
    m.position.set(s > 0 ? x0 : x1, h, -yF);
    m.userData.horsAOSol = true; ch.decor.add(m);
    for (let x = x0 + 1.2; x < x1 - 1.2; x += 2.4) {
      const l = ch.boite(x, yF + s * 0.25, x + 0.9, yF + s * 1.15, h + 0.3, h + 1.9, lucarne, { ombre: false });
      l.userData.horsAOSol = true;
      ch.boite(x - 0.05, yF + s * 0.2, x + 0.95, yF + s * 1.2, h + 1.9, h + 2.05, zinc, { ombre: false }).userData.horsAOSol = true;
    }
  };

  // CÔTÉ ÉCOLE, À L'OUEST : le n° 8 (pierre crème, haussmannien) puis le n° 10 à l'angle de l'impasse (photos 09, 10)
  const creme = std({ map: texFacade({ fond: '#e3dccf', cadre: '#f2efe8', verre: '#56626e', travee: 1.9, etage: 3.0, balcon: true, joints: true, encadrement: '#ece6da', rideaux: true }), roughness: 0.85 });
  // (lot façade du 11/10 : au-dessus de son rez-de-chaussée de pierre, le n° 8 est de brique chamois à rangs de brique
  // rouge, fenêtres à encadrement de pierre blanche et balcons de fer noir — photos 09 et 10 ; le jeu le faisait de pierre crème)
  const brique8 = std({ map: texFacade({ fond: '#d8cdb8', cadre: '#f2efe8', verre: '#56626e', travee: 1.9, etage: 3.0, balcon: true, encadrement: '#efebe2', rideaux: true, brique: [196, 172, 128], graine: 8 }), roughness: 0.9 });
  const pierre4 = std({ map: texFacade({ fond: '#cdc3b6', cadre: '#efece6', verre: '#505c68', travee: 2.0, etage: 3.1, balcon: true, joints: true, encadrement: '#ddd4c6', rideaux: true, graine: 4 }), roughness: 0.85 });
  const blanc = std({ map: texFacade({ fond: '#efefe8', cadre: '#ffffff', verre: '#56626e', travee: 1.9, etage: 2.9, persiennes: '#dfe3d8', fleurs: true, graine: 5 }), roughness: 0.85 });
  // (photos 08, 15 : l'immeuble du coin est en pierre claire, à balcons et toit mansardé ; les volets verts du premier jet
  // n'y sont pas)
  const cremeFond = std({ map: texFacade({ fond: '#e4dccb', cadre: '#f3efe6', verre: '#5a6672', travee: 2.1, etage: 2.9, balcon: true, joints: true, encadrement: '#ece5d6', rideaux: true, graine: 6 }), roughness: 0.85 });
  // (intégration du 11/10, plan V2 : arrêté en y 12,45, au sud de l'aile A — il descendait jusqu'en y 14 et entrait de 1,25 m
  // dans la courette ouest, js/ecole_pieces.js courette : par les fenêtres de la Si 0.2, son fond crème bouchait la cour)
  facade(X0 - 6, -0.4, -7.5, 12.45, 19, creme);
  facade(-7.5, -0.4, -0.3, 12.45, 19, brique8);
  // (lot façade du 11/10 : la photo 10, recalée — 5 px —, met la porte cochère du n° 8, bois verni à carreaux et imposte,
  // dans son encadrement de pierre claire, à 1,9 m de la bande noire de l'école : x -3,7 à -2,2 ; entre les deux, un mur
  // crème et un pilastre plus clair (x -1,25 à -0,3), sans fenêtre — le jeu y posait deux fenêtres à barreaux. La porte
  // cintrée suit à l'ouest, après un trumeau (photo 09).)
  rdc(-7.5, -0.3, -0.4, 3.4, { fond: '#ddd5c6', socle: '#b9b1a3', joints: true, graine: 10, elements: [
    { t: 'porte', x0: -5.5, x1: -4.4, h: 2.9, bois: '#6b4226', arc: true, imposte: true, vantaux: 2, pierre: '#e6dfd1' },
    { t: 'porte', x0: -3.7, x1: -2.2, h: 2.95, bois: '#7a4a28', imposte: true, vantaux: 2, chaud: true, plein: true, encadrement: '#ece6da' },
    { t: 'bande', x0: -1.25, x1: -0.3, couleur: '#e9e4d9', h: 3.4 },
  ] });
  rdc(X0, -7.5, -0.4, 3.4, { fond: '#d9d0bf', socle: '#b6ad9e', joints: true, graine: 11, elements: [
    { t: 'porte', x0: -9.9, x1: -8.9, h: 2.8, bois: '#5d3a22', vantaux: 2 },
    { t: 'plaque', x0: -8.55, x1: -8.33, bas: 2.55, h: 2.75, texte: '10' },
    { t: 'fenetre', x0: -8.1, x1: -7.6, bas: 1.0, h: 2.6 },
  ] });
  toit(X0 - 6, -0.3, -0.4, 4.5, 19);
  // LA MARQUISE du n° 10 (photo 09) : un auvent de verre cannelé ambré sur une armature noire, au-dessus de la porte,
  // qui penche vers la rue (relecture du 09/10/2026 : ce n'était qu'un trapèze jaune peint sur la façade)
  {
    const g = new THREE.Group(); g.position.set(-9.4, 3.3, 0.4); ch.decor.add(g);
    const verre = std({ map: texMarquise(), roughness: 0.3, metalness: 0.1 }, 0.35);
    const v = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.025, 0.85), verre); v.position.set(0, -0.12, 0.42); v.rotation.x = 0.28; g.add(v);
    const noir = ch.M.acierNoir;
    for (const x of [-0.78, 0.78]) {
      const c = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.9), noir); c.position.set(x, -0.1, 0.42); c.rotation.x = 0.28; g.add(c);
      // (le tirant : du mur, 20 cm plus haut, au bord de la marquise)
      const t = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.018, 0.94), noir); t.position.set(x, -0.02, 0.415); t.rotation.x = 0.49; g.add(t);
    }
    const f = new THREE.Mesh(new THREE.BoxGeometry(1.62, 0.04, 0.03), noir); f.position.set(0, -0.24, 0.83); g.add(f);
    g.traverse((o) => { o.userData.horsAOSol = true; });
  }
  // CÔTÉ ÉCOLE, À L'EST : le n° 4 (pierre, sa porte au numéro bleu : photo 16), l'immeuble blanc aux géraniums, les
  // immeubles crème jusqu'au carrefour
  facade(20.1, -0.4, 30, 14, 20, pierre4);
  rdc(20.1, 30, -0.4, 3.6, { fond: '#d2c8ba', socle: '#b3a999', joints: true, graine: 12, elements: [
    { t: 'porte', x0: 20.9, x1: 22.0, h: 2.75, bois: '#a38a62', arc: true, vantaux: 1, plein: true, pierre: '#ded5c7' },
    { t: 'plaque', x0: 21.33, x1: 21.57, bas: 3.0, h: 3.25, texte: '4' },
    { t: 'fenetre', x0: 23.1, x1: 24.3, bas: 0.9, h: 2.5 }, { t: 'fenetre', x0: 25.1, x1: 26.3, bas: 0.9, h: 2.5 },
    { t: 'fenetre', x0: 27.1, x1: 28.3, bas: 0.9, h: 2.5 },
  ] });
  toit(20.1, 30, -0.4, 4.5, 20);
  facade(30, -0.4, 38, 14, 17, blanc);
  rdc(30, 38, -0.4, 3.2, { fond: '#ecebe4', socle: '#c9c6bd', graine: 18, elements: [
    { t: 'porte', x0: 31.0, x1: 32.2, h: 2.7, bois: '#e9e9e4', vantaux: 2 },
    { t: 'fenetre', x0: 33.4, x1: 34.6, bas: 0.9, h: 2.5 }, { t: 'fenetre', x0: 35.8, x1: 37.0, bas: 0.9, h: 2.5 },
  ] });
  facade(38, -0.4, X1 + 0.5, 14, 19, creme);
  toit(38, X1 + 0.5, -0.4, 4.5, 19);
  // LES LANTERNES murales de Paris (photos 13, 14 : sur l'immeuble blanc ; une autre sur le 5/7)
  lanterne(ch, 30.6, -0.4, 4.6, 1);
  lanterne(ch, 2.0, Y_FACE, 4.6, -1);
  lanterne(ch, 36.5, Y_FACE, 4.6, -1);

  // EN FACE, À L'OUEST : LE 5/7 (enduit blanc, caissons de mélèze, rez-de-chaussée vitré : photos 07, 08, 09). Au rez-de-
  // chaussée, d'ouest en est : la porte de garage en lames de bois, le pilier « 5/7 », la porte vitrée blanche, des
  // baies cadrées de bois ou de gris, la porte vitrée de bois (photo 08)
  const moderne = std({ map: texFacade({ fond: '#efece4', cadre: '#9c7448', verre: '#5b6874', travee: 3.0, etage: 3.0, fl: 2.2, fh: 1.5, bois: '#b98a52', rideaux: true, graine: 7 }), roughness: 0.8 });
  facade(-4.5, Y_FACE - 14, 15, Y_FACE, 18, moderne);
  rdc(-4.5, 15, Y_FACE, 3.3, { fond: '#f1eee6', ppm: 70, graine: 13, elements: [
    { t: 'garage', x0: -4.1, x1: -1.7, h: 2.6, bois: '#a87c50' },
    { t: 'pilier', x0: -1.6, x1: -1.0, h: 3.1, texte: '5/7' },
    { t: 'porte', x0: -0.9, x1: 0.7, h: 2.75, cadre: '#f4f4f0', vantaux: 2, chaud: true },
    { t: 'vitrine', x0: 1.2, x1: 3.4, h: 2.75, cadre: '#9c7448', vantaux: 2, chaud: true },
    { t: 'pilier', x0: 3.4, x1: 4.2, h: 2.75, bois: '#c39a68' },
    { t: 'vitrine', x0: 4.2, x1: 6.0, h: 2.75, cadre: '#4a4f55', vantaux: 2 },
    { t: 'porte', x0: 6.6, x1: 8.0, h: 2.75, cadre: '#f4f4f0', vantaux: 2 },
    { t: 'vitrine', x0: 8.8, x1: 10.6, h: 2.75, cadre: '#9c7448', vantaux: 2, chaud: true },
    { t: 'porte', x0: 11.2, x1: 12.9, h: 2.8, bois: '#b98a52', vantaux: 2, chaud: true },
    { t: 'vitrine', x0: 13.1, x1: 14.8, h: 2.8, cadre: '#f2f2ee', vantaux: 2 },
  ] }, 'N');
  // au fond de l'impasse, côté sud (photo 09) : la vieille maison basse en retrait, derrière son muret et sa grille
  const enduit = std({ map: texFacade({ fond: '#dcd8cf', cadre: '#f0eee8', verre: '#56606a', travee: 2.2, etage: 2.9, fl: 1.1, fh: 1.4, graine: 14 }), roughness: 0.9 });
  facade(X0, Y_FACE - 9, -4.5, Y_FACE - 3, 6.5, enduit, { collision: false });
  muretGrille(ch, X0, -4.5, Y_FACE, 'x', { hMuret: 1.0, hGrille: 1.5, sol: 0 });
  C.ajouterBoite(X0, -(Y_FACE - 0.3), -4.5, -(Y_FACE), { y1: 2.6 });
  // LE JARDIN (photo 15) : muret de béton taché, grille noire de 1,9 m doublée de brande, poteaux, lisse ; l'immeuble des
  // années 60 au fond
  const [xj0, xj1] = RUE.X_JARDIN;
  jardin(ch, xj0, xj1, Y_FACE - 0.6);
  plan(xj0, Y_FACE - 0.6, xj1, Y_FACE, 0, trottoir);
  // l'immeuble des années 60 au fond du jardin (photo 08 : sept étages, des balcons filants à garde-corps blancs, des
  // jardinières aux balcons), à 6 m derrière la grille
  const balcons = std({ map: texFacade({ fond: '#e7e4dc', cadre: '#f4f4f0', verre: '#4f5b66', travee: 2.6, etage: 2.8, fl: 2.1, fh: 1.5, balconBlanc: true, fleurs: true, rideaux: true, graine: 19 }), roughness: 0.85 });
  facade(xj0, Y_FACE - 18, 28, Y_FACE - 6, 21, balcons, { collision: false });
  toit(xj0, 28, Y_FACE - 6, 3, 21, 'N', 1.2);
  // EN FACE, À L'EST, au coin du carrefour : un petit immeuble crème aux volets verts
  facade(xj1, Y_FACE - 14, X1 + 0.5, Y_FACE, 19, cremeFond);
  rdc(xj1, X1 + 0.5, Y_FACE, 3.3, { fond: '#e2dccb', socle: '#bdb5a5', joints: true, graine: 15, elements: [
    { t: 'porte', x0: 42.6, x1: 43.8, h: 2.8, bois: '#3f4a3a', vantaux: 2, arc: true, pierre: '#e8e1d0' },
    { t: 'fenetre', x0: 44.3, x1: 45.3, bas: 1.0, h: 2.6 },
  ] }, 'N');
  toit(xj1, X1 + 0.5, Y_FACE, 4.5, 19, 'N');

  // L'IMPASSE (ouest, photo 09) : un muret de béton taché de 1 m, une grille noire de 1,5 m à pointes ; derrière, une maison
  // basse, de grands arbres et l'immeuble à l'escalier en colimaçon (js/ecole_rue_mobilier.js pose la verdure et les pots)
  muretGrille(ch, Y_FACE, -0.4, X0, 'y', { hMuret: 1.05, hGrille: 1.5, sol: H_CHAUSSEE });
  C.ajouterBoite(X0 - 0.3, -(-0.4), X0, -Y_FACE, { y1: 2.7 });
  facade(X0 - 16, Y_FACE - 6, X0 - 9, 12, 16, balcons, { collision: false });
  facade(X0 - 5, -3, X0 - 2, 4, 8, enduit, { collision: false });
  // LE CARREFOUR (est, photos 08, 15) : la rue transversale (chaussée de x1 + 2 à x1 + 11, trottoirs de part et d'autre),
  // l'immeuble crème d'en face, six étages, une brasserie au rez-de-chaussée sous son store sombre ; on s'arrête au bord
  const XT = X1 + 13.5;
  // (relecture du 09/10/2026 : la rue transversale va plus loin — de y = -34 à 22 —, pour qu'aucun bord du sol ne se
  // voie en biais depuis le bout de la rue ; ses trottoirs ont leurs bordures, et celles de la rue tournent au coin)
  const YS = -34, YN = 22;
  plan(X1, Y_CHAUSSEE, X1 + 11, Y_TROTTOIR - 0.15, H_CHAUSSEE, chaussee);
  plan(X1 + 2, YS, X1 + 11, Y_CHAUSSEE, H_CHAUSSEE, chaussee);
  plan(X1 + 2, Y_TROTTOIR - 0.15, X1 + 11, YN, H_CHAUSSEE, chaussee);
  plan(X1, Y_TROTTOIR, X1 + 2, YN, 0, trottoir);
  plan(X1, YS, X1 + 2, Y_CHAUSSEE - 0.15, 0, trottoir);
  plan(X1 + 11, YS, XT, YN, 0, trottoir);
  ch.boite(X1 + 10.85, YS, X1 + 11, YN, H_CHAUSSEE, 0, granit, { ombre: false });
  for (const y of [Y_TROTTOIR, Y_CHAUSSEE]) ch.boite(X1, y - 0.15, X1 + 2.15, y, H_CHAUSSEE, 0, granit, { ombre: false });
  ch.boite(X1 + 2, Y_TROTTOIR - 0.15, X1 + 2.15, YN, H_CHAUSSEE, 0, granit, { ombre: false });
  ch.boite(X1 + 2, YS, X1 + 2.15, Y_CHAUSSEE, H_CHAUSSEE, 0, granit, { ombre: false });
  // EN FACE, TROIS IMMEUBLES (photos 08, 15) : au milieu l'immeuble crème de six étages et sa brasserie ; au sud un
  // immeuble de pierre plus haut ; au nord un immeuble blanc aux persiennes grises. Chacun a son rez-de-chaussée dessiné :
  // aucune fenêtre d'étage ne descend jusqu'au trottoir (un seul mur de 50 m, avant la relecture).
  const fondRue = std({ map: texFacade({ fond: '#eee6cf', cadre: '#f6f2e6', verre: '#5a6672', travee: 1.9, etage: 2.85, balcon: true, rideaux: true, graine: 16 }), roughness: 0.85 });
  const fondSud = std({ map: texFacade({ fond: '#ddd3c2', cadre: '#efe9de', verre: '#56626e', travee: 2.0, etage: 3.0, balcon: true, joints: true, encadrement: '#e6ddcc', rideaux: true, graine: 21 }), roughness: 0.85 });
  const fondNord = std({ map: texFacade({ fond: '#efede6', cadre: '#ffffff', verre: '#56626e', travee: 1.8, etage: 2.9, persiennes: '#c3c8c2', graine: 22 }), roughness: 0.85 });
  facade(XT, -14, XT + 10, 4, 19.5, fondRue, { collision: false });
  facade(XT, YS, XT + 10, -14, 22.5, fondSud, { collision: false });
  facade(XT, 4, XT + 10, YN + 2, 17, fondNord, { collision: false });
  // un rez-de-chaussée tourné vers la rue (vers l'ouest), de yN (au nord : à gauche vu de la rue) à yS
  const rdcO = (yN, yS, H, o) => {
    const L = yN - yS, m = new THREE.Mesh(new THREE.PlaneGeometry(L, H), std({ map: texRezDeChaussee(L, H, o), roughness: 0.8 }, 0.12));
    m.position.set(XT - 0.02, H / 2, -(yN + yS) / 2); m.rotation.y = -Math.PI / 2; m.userData.horsAOSol = true; ch.decor.add(m);
  };
  rdcO(4, -14, 3.6, { fond: '#e6dcc4', socle: '#3b3430', graine: 17, elements: [
    { t: 'fenetre', x0: 1.0, x1: 2.2, bas: 1.0, h: 2.6 }, { t: 'fenetre', x0: 3.3, x1: 4.5, bas: 1.0, h: 2.6 },
    { t: 'plaque', x0: 5.6, x1: 6.4, bas: 2.9, h: 3.15, texte: 'RUE' },
    { t: 'porte', x0: 7.3, x1: 8.5, h: 2.8, bois: '#3a2a20', vantaux: 2 },
    { t: 'vitrine', x0: 9.5, x1: 15.0, h: 2.8, cadre: '#2b2422', vantaux: 4, chaud: true },
    { t: 'auvent', x0: 9.3, x1: 15.2, h: 3.4, couleur: '#2a2e2b', texte: 'CAFÉ · BRASSERIE' },
    { t: 'fenetre', x0: 16.2, x1: 17.4, bas: 1.0, h: 2.6 },
  ] });
  rdcO(-14, YS, 3.9, { fond: '#d8cdbb', socle: '#a99e8c', joints: true, graine: 23, elements: [
    { t: 'vitrine', x0: 1.5, x1: 6.5, h: 3.0, cadre: '#1f3a2e', vantaux: 3, chaud: true },
    { t: 'auvent', x0: 1.3, x1: 6.7, h: 3.6, couleur: '#1f3a2e' },
    { t: 'porte', x0: 8.2, x1: 9.6, h: 3.1, bois: '#4a3322', vantaux: 2, arc: true, pierre: '#e3d9c8' },
    { t: 'fenetre', x0: 11.5, x1: 12.7, bas: 1.0, h: 2.8 }, { t: 'fenetre', x0: 14.0, x1: 15.2, bas: 1.0, h: 2.8 }, { t: 'fenetre', x0: 16.5, x1: 17.7, bas: 1.0, h: 2.8 },
  ] });
  rdcO(YN + 2, 4, 3.3, { fond: '#ecebe4', socle: '#c9c6bd', graine: 24, elements: [
    { t: 'fenetre', x0: 1.5, x1: 2.7, bas: 0.9, h: 2.5 }, { t: 'fenetre', x0: 4.0, x1: 5.2, bas: 0.9, h: 2.5 },
    { t: 'porte', x0: 7.0, x1: 8.3, h: 2.7, bois: '#e9e9e4', vantaux: 2 },
    { t: 'garage', x0: 10.5, x1: 13.0, h: 2.5, bois: '#6d6f70' },
    { t: 'fenetre', x0: 15.0, x1: 16.2, bas: 0.9, h: 2.5 },
  ] });
  C.ajouterBoite(X1 - 0.5, -(-0.4), X1, -Y_FACE, { y1: 3 });
  // (les façades d'en face et des voisins sont solides : la rue est fermée de partout)

  // ---- LE MOBILIER, LES PLANTES, LES DEUX-ROUES, LES VOITURES ----
  poserMobilierRue(ch, RUE);
  poserVoitures(ch, RUE, taches);
  // les taches d'ombre douces sous ce qui est posé dehors (la carte d'ombre du soleil ne couvre que le trottoir de l'école,
  // et l'ombre cuite ne couvre que l'intérieur)
  for (const [x, y, sx, sy, f] of [[7.05, -1.62, 0.7, 0.32, 0.5], [10.75, -1.25, 0.6, 0.3, 0.5], [7.6, -0.72, 1.8, 0.42, 0.45], [12.62, -1.55, 0.4, 0.4, 0.5],
    [17.3, -1.45, 0.4, 0.4, 0.5], [0.85, -1.2, 0.85, 0.7, 0.5], [20.7, -1.35, 1.0, 0.45, 0.45], [5.5, -1.22, 0.16, 0.45, 0.45], [12.05, -0.8, 0.16, 0.45, 0.45]])
    taches.ajouter(x, y, sx, sy, 0, f, 0);
  for (const [x, y, sx, sy, f] of [[22.2, -3.4, 1.8, 0.5, 0.45], [21.7, Y_CHAUSSEE + 1.0, 2.4, 1.1, 0.5], [19.7, Y_CHAUSSEE + 0.38, 0.8, 0.36, 0.5]])
    taches.ajouter(x, y, sx, sy, 0, f, H_CHAUSSEE);
  taches.ajouter(X0 + 0.35, -5.9, 0.45, 2.8, 0, 0.5, H_CHAUSSEE);
  taches.poser(ch.decor);
  for (const [mat, geos] of sols) {
    const m = new THREE.Mesh(mergeGeometries(geos, false), mat);
    m.receiveShadow = true; m.matrixAutoUpdate = false; m.userData.nofuse = true; m.name = 'sol de la rue';
    ch.scene.add(m);
  }
}

// LA GRILLE SUR SON MURET (l'impasse, la vieille maison) : de `a` à `b` le long de x (à y = `l`) ou de y (à x = `l`)
function muretGrille(ch, a, b, l, axe, { hMuret = 1.0, hGrille = 1.5, sol = 0 }) {
  const M = ch.M, beton = betonMuret();
  const lo = Math.min(a, b), hi = Math.max(a, b);
  const B = (u0, v0, u1, v1, h0, h1, mat) => (axe === 'x' ? ch.boite(u0, l + v0, u1, l + v1, h0, h1, mat, { ombre: false }) : ch.boite(l + v0, u0, l + v1, u1, h0, h1, mat, { ombre: false }));
  // (au fond de l'impasse, le muret part de la chaussée : `sol`)
  B(lo, -0.3, hi, 0, sol, hMuret, beton);
  B(lo, -0.33, hi, 0.02, hMuret, hMuret + 0.06, beton);
  for (let u = lo + 0.06; u < hi; u += 0.13) {
    B(u, -0.17, u + 0.022, -0.148, hMuret + 0.06, hMuret + hGrille, M.barreaux);
    // la pointe de lance : un petit losange
    const p = new THREE.Mesh(new THREE.OctahedronGeometry(0.025, 0), M.barreaux);
    p.scale.set(0.7, 1.6, 0.7);
    if (axe === 'x') p.position.set(u + 0.011, hMuret + hGrille + 0.03, -(l - 0.16)); else p.position.set(l - 0.16, hMuret + hGrille + 0.03, -(u + 0.011));
    ch.decor.add(p);
  }
  for (const h of [hMuret + 0.18, hMuret + hGrille - 0.12]) B(lo, -0.18, hi, -0.14, h, h + 0.03, M.barreaux);
}

// LE JARDIN D'EN FACE (photo 15) : un muret de béton de 0,55 m et sa banquette, la grille noire (barreaux de 2 cm tous les
// 12 cm, lisses, poteaux) doublée de brande, de x0 à x1, le long de la façade y = yF
function jardin(ch, x0, x1, yF) {
  const M = ch.M, C = ch.C;
  const beton = betonMuret();
  const brande = jourDehors(new THREE.MeshStandardMaterial({ map: texBrande(), roughness: 1, alphaTest: 0.5, side: THREE.DoubleSide }), 0.1);
  brande.name = 'brande';
  ch.boite(x0, yF, x1, yF + 0.32, 0, 0.55, beton, { ombre: false });
  ch.boite(x0, yF + 0.32, x1, yF + 0.62, 0, 0.12, beton, { ombre: false });        // la banquette au pied (photo 15)
  // la brande : un plan à 18 cm derrière les barreaux, UV en mètres
  const L = x1 - x0, g = new THREE.PlaneGeometry(L, 1.9);
  const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * L, uv.getY(i) * 1.9);
  const p = new THREE.Mesh(g, brande); p.position.set((x0 + x1) / 2, 0.55 + 0.95, -(yF + 0.08)); p.userData.horsAOSol = true; ch.decor.add(p);
  for (let x = x0 + 0.06; x < x1; x += 0.12) ch.boite(x, yF + 0.2, x + 0.02, yF + 0.22, 0.55, 2.48, M.barreaux, { ombre: false });
  for (const h of [0.68, 2.42]) ch.boite(x0, yF + 0.19, x1, yF + 0.23, h, h + 0.04, M.barreaux, { ombre: false });
  for (let x = x0; x <= x1 + 0.01; x += 2.6) ch.boite(x - 0.04, yF + 0.17, x + 0.04, yF + 0.25, 0.55, 2.55, M.barreaux, { ombre: false });
  C.ajouterBoite(x0, -(yF + 0.62), x1, -yF, { y1: 0.12 });
  C.sol(x0, -(yF + 0.62), x1, -(yF + 0.32), 0.12);          // (on monte sur la banquette au lieu d'y enfoncer les pieds)
  C.ajouterBoite(x0, -(yF + 0.32), x1, -yF, { y1: 2.6 });
}

// LA LANTERNE DE PARIS en applique (photos 13, 14) : une console noire qui sort du mur, sa crosse en dessous, la lanterne
// hexagonale pendue au bout, allumée doucement. `s` : +1 si la rue est au sud du mur (côté école), -1 en face.
let _vitreLanterne = null;
function lanterne(ch, x, yF, h, s) {
  const noir = ch.M.acierNoir;
  _vitreLanterne = _vitreLanterne || new THREE.MeshStandardMaterial({ color: 0x3a372f, roughness: 0.25, metalness: 0.4, emissive: 0xffdca0, emissiveIntensity: 0.45 });
  const g = new THREE.Group(); g.position.set(x, h, -yF); ch.decor.add(g);
  const bras = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.78, 6), noir); bras.rotation.x = Math.PI / 2; bras.position.set(0, 0.35, s * 0.39); g.add(bras);
  const courbe = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, -0.12, 0), new THREE.Vector3(0, 0.3, s * 0.03), new THREE.Vector3(0, 0.34, s * 0.42));
  g.add(new THREE.Mesh(new THREE.TubeGeometry(courbe, 12, 0.015, 5), noir));
  const cage = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.1, 0.4, 6), _vitreLanterne); cage.position.set(0, 0.06, s * 0.74); g.add(cage);
  const chapeau = new THREE.Mesh(new THREE.ConeGeometry(0.19, 0.15, 6), noir); chapeau.position.set(0, 0.33, s * 0.74); g.add(chapeau);
  const pied = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.08, 6), noir); pied.position.set(0, -0.18, s * 0.74); g.add(pied);
  g.traverse((o) => { o.userData.horsAOSol = true; });
}

// LE ROND D'INTERDICTION PEINT (bleu, cerclé de rouge, barré de rouge), un peu usé
function texRondInterdit() {
  return canvasTex(128, 128, (g, w) => {
    const c = w / 2; g.clearRect(0, 0, w, w);
    g.fillStyle = '#c63a3a'; g.beginPath(); g.arc(c, c, 62, 0, 7); g.fill();
    g.fillStyle = '#3f74b6'; g.beginPath(); g.arc(c, c, 48, 0, 7); g.fill();
    g.strokeStyle = '#c63a3a'; g.lineWidth = 13; g.beginPath(); g.moveTo(c - 34, c - 34); g.lineTo(c + 34, c + 34); g.stroke();
    const r = alea(3); g.globalCompositeOperation = 'destination-out';
    for (let k = 0; k < 260; k++) { g.fillStyle = `rgba(0,0,0,${0.3 + r() * 0.6})`; g.fillRect(r() * w, r() * w, 2 + r() * 4, 1 + r() * 3); }
    g.globalCompositeOperation = 'source-over';
  }, null, true, 4);
}
// LE VERRE CANNELÉ DE LA MARQUISE (n° 10, photo 09) : des bandes ambrées, claires et foncées, dans le sens de la pente
function texMarquise() {
  return canvasTex(128, 64, (g, w, h) => {
    g.fillStyle = '#c8a24e'; g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 8) { g.fillStyle = 'rgba(255,236,170,0.55)'; g.fillRect(x, 0, 3, h); g.fillStyle = 'rgba(90,64,20,0.25)'; g.fillRect(x + 5, 0, 2, h); }
  }, null, false, 4);
}
// LA FONTE DES REGARDS : un quadrillage en relief, sombre
function texFonte() {
  return canvasTex(128, 128, (g, w) => {
    g.fillStyle = '#2e2d2b'; g.fillRect(0, 0, w, w);
    g.fillStyle = '#45433f'; for (let y = 4; y < w; y += 12) for (let x = 4; x < w; x += 12) g.fillRect(x, y, 8, 8);
    g.strokeStyle = '#5a5651'; g.lineWidth = 3; g.beginPath(); g.arc(w / 2, w / 2, w / 2 - 3, 0, 7); g.stroke();
  }, null, false, 4);
}
