// =====================================================================
//  LA RUE DEVANT L'ÉCOLE IRIS (crochet de js/carte_ecole.js) — photos 07 à 18
// =====================================================================
// Une petite rue de Paris en impasse. À l'ouest l'IMPASSE (~10 m après le mitoyen), fermée par un muret taché surmonté
// d'une grille noire, une rangée de pots devant, une masse de verdure derrière (photo 09) ; à l'est la rue file 20 m
// après l'école jusqu'à un CARREFOUR en T (x 40), fermé à 7,8 m par un immeuble crème de quatre étages et l'immeuble de
// pierre du café (photos 08, 15 ; le gabarit de l'IGN — lot rue du 13/10, voir RUE plus bas).
// Côté école : le trottoir de 2,55 m (enrobé gris, bordure de granit), pavé devant le n° 8 et le n° 10 (photo 09), que
// leurs façades en saillie de 1,25 m réduisent à 1,3 m, comme celle du n° 4 ; la chaussée de 6,4 m, gris neutre, ses
// reprises d'enrobé, ses tirets, le rond d'interdiction peint, la pièce de pavés, les plaques ; au sud, devant le 5/7,
// la BAIE de stationnement de 2 m et son trottoir de 1,25 m ; devant le jardin, le trottoir d'en face de 1,6 m.
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
  // (lot rue du 13/10, LE GABARIT : le cadastre et le bâti de l'IGN ramenés au plan — iris_audit, 5 cm d'écart sur l'école —
  // recoupés par les photos 08, 15 et 16 à leur pose. 1. Le coin de la rue est en x 40 et les façades d'en face du
  // carrefour en 47,8 : le jeu les mettait en 45 et 58,5, la rue filait 11 m trop loin. 2. Les voisins sont EN SAILLIE
  // de 1,25 m sur l'école (leur nu en y -1,65) : sur la photo 16, le retour d'enduit du n° 4 entre la bande noire et son
  // portail ; sur la photo 10, le retour de pierre lisse du n° 8. 3. Devant le 5/7, le stationnement est une BAIE au sud
  // de la chaussée (photo 08 : les tirets sur la ligne y -9,3, les roues de la Kia en -9,3, la bordure en -11,3, la
  // façade en -12,7) : le jeu garait SUR la chaussée et collait le 5/7 à 10,7 m de l'école, pour 12,3 m. Devant le
  // jardin, à l'est de x 14,8, la bordure reste en -9,35 et la grille en -11,7 (photo 15).)
  X0: -10.5, X1: 40,                        // de l'impasse (nu du muret) au carrefour
  // (lot rue du 13/10 : le joint du trottoir et de sa bordure mesuré sur neuf photos ajustées ensemble, 36 points : y -2,95,
  // un trottoir de 2,55 m ; il en faisait 2,4)
  Y_TROTTOIR: -2.95,                        // le nu de la bordure côté école (trottoir de 2,55 m)
  Y_CHAUSSEE: -9.35,                        // le nu de la bordure d'en face (chaussée de 6,4 m)
  Y_FACE: -11.1,                            // le trottoir d'en face devant le jardin (1,6 m, puis la banquette de la grille)
  X_BAIE: 14.8, Y_BAIE: -11.3,              // la baie de stationnement devant le 5/7 : son bout est, le nu de sa bordure
  Y_FACE57: -12.7,                          // la façade du 5/7 (trottoir de 1,25 m)
  Y_VOISINS: -1.65,                         // le nu des voisins (n° 8, n° 10, n° 4...), en saillie de 1,25 m sur l'école
  H_CHAUSSEE: -0.12,
  X_JARDIN: [15, 40],                       // le jardin d'en face, derrière sa grille, jusqu'au coin
  CARREFOUR: [1.3, 6.3, 7.8],               // la rue transversale depuis x1 : son trottoir, sa chaussée de 5 m, les façades d'en face
};
const { X0, X1, Y_TROTTOIR, Y_CHAUSSEE, Y_FACE, H_CHAUSSEE, X_BAIE, Y_BAIE, Y_FACE57, Y_VOISINS: YV } = RUE;
// (relecture rue du 14/10 : les pignons du 5/7, sur le nu y -12,7 — à l'ouest, photo 09 enfin posée : x -6,5 ; à l'est,
// photo 08 à sa pose : x 12,1, l'arête de l'enduit blanc au pixel 1205)
const X57O = -6.5, X57E = 12.1;

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
let _betonMuret = null, _vm = null;
// (relecture rue du 14/10 : le VIEUX MUR du fond de l'impasse, photo 09 — le même béton, moitié plus sombre et verdi)
const _vieuxMur = () => { if (!_vm) { _vm = betonMuret().clone(); _vm.color.setRGB(0.5, 0.51, 0.47); _vm.emissive.multiplyScalar(0.5); _vm.name = 'vieux mur du fond de l\'impasse'; } return _vm; };
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
  persiennes = null, joints = false, encadrement = null, bois = null, rideaux = false, fleurs = false, balconBlanc = false, brique = null, appui = 0.9, graine = 3 }) {
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
    const x = (w - fl * mx) / 2, y = h - (appui + fh) * my;
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

// LES ÉTAGES DU 5/7 dessinés d'un seul tenant (relecture rue du 14/10 — photos 08 et 09 rejouées à leur pose, chaque
// arête rétroprojetée sur le nu y -12,7) : un enduit blanc lisse, et à chaque étage des CAISSONS de mélèze clair de
// 2,5 m tous les 2,95 m — une allège de planches de 0,58 m, un vitrage de 1,15 m à trois vantaux, une lisse de bois devant
// — ; l'allège du 1er commence à 4,47 m, les étages font 2,85 m ; aux étages pairs les caissons sont plus étroits
// (1,86 m : celui du 2e relevé de x 9,77 à 11,63). Le jeu répétait une tuile de 3 m par étage de 3 m : des baies plus
// grandes, en d'autres places, d'un bois orangé. `xEst` : le x du plan du bord gauche de l'image (la façade regarde le nord).
const BOIS57 = '#dab286';
function texEtages57(L, H0, H1, xEst) {
  const r = alea(57), W = Math.min(1024, Math.round(L * 55)), k = W / L, Hp = Math.round((H1 - H0) * k);
  return canvasTex(W, Hp, (g, w, h) => {
    const X = (x) => (xEst - x) * k, Y = (z) => (H1 - z) * k;
    g.fillStyle = '#f1eee6'; g.fillRect(0, 0, w, h);
    for (let n = 0; n < w * h / 300; n++) { g.fillStyle = `rgba(${r() < 0.5 ? '0,0,0' : '255,255,255'},0.03)`; g.fillRect(r() * w, r() * h, 2, 2); }
    const caisson = (a, b, z) => {
      const x0 = X(b), ww = (b - a) * k, etroit = b - a < 2.2;
      g.fillStyle = 'rgba(0,0,0,0.16)'; g.fillRect(x0 - 1, Y(z) , ww + 2, 3);                      // (son ombre sur l'enduit)
      g.fillStyle = BOIS57; g.fillRect(x0, Y(z + 1.82), ww, 1.82 * k);
      g.fillStyle = 'rgba(90,60,25,0.16)'; for (let p = 0.145; p < 0.58; p += 0.145) g.fillRect(x0, Y(z + p), ww, 1);
      g.fillStyle = 'rgba(255,240,210,0.22)'; g.fillRect(x0, Y(z + 1.82), ww, 2);
      const gx = x0 + 0.08 * k, gw = ww - 0.16 * k, gy = Y(z + 1.74), gh = 1.13 * k;
      const gr = g.createLinearGradient(0, gy, 0, gy + gh); gr.addColorStop(0, '#c3ccd0'); gr.addColorStop(0.55, '#8f9a9f'); gr.addColorStop(1, '#5f696e');
      g.fillStyle = gr; g.fillRect(gx, gy, gw, gh);
      // les voilages derrière les vitres, les montants des vantaux, la lisse de bois devant
      const nv = etroit ? 2 : 3;
      for (let i = 0; i < nv; i++) if (r() < 0.75) { g.fillStyle = `rgba(238,235,226,${0.35 + r() * 0.4})`; g.fillRect(gx + (i + r() * 0.3) * gw / nv, gy + 1, gw / nv * (0.35 + r() * 0.35), gh - 2); }
      g.fillStyle = BOIS57; for (let i = 1; i < nv; i++) g.fillRect(gx + i * gw / nv - 0.035 * k, gy, 0.07 * k, gh);
      g.fillRect(x0, Y(z + 0.98), ww, 0.06 * k);
      g.fillStyle = 'rgba(60,40,15,0.3)'; g.fillRect(x0, Y(z + 0.98) + 0.06 * k, ww, 1);
    };
    for (let n = 0; n < 5; n++) {
      const z = 4.47 + n * 2.85;
      for (const [a, b] of [[-5.84, -3.15], [-2.76, -0.26], [0.2, 2.7], [3.15, 5.65], [6.1, 8.58], [9.06, 11.57]]) {
        if (n % 2) caisson(a + 0.7, b + 0.05, z); else caisson(a, b, z);
      }
    }
  }, null, false, 8);
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
          // (lot rue du 13/10 : une porte à ferronnerie — le n° 8, photo 10 — : le vitrage sombre derrière ses volutes de fer)
          if (e.grille) {
            const d = top + (bas - top) * 0.6;
            g.fillStyle = '#2b211a'; g.fillRect(a, top + m, b - a, d - top - m);
            g.strokeStyle = '#0e0c0b'; g.lineWidth = 2;
            for (let k = 1; k < 4; k++) { const x = a + (b - a) * k / 4; g.beginPath(); g.moveTo(x, top + m); g.lineTo(x, d); g.stroke(); }
            for (let k = 0; k < 5; k++) { g.beginPath(); g.arc((a + b) / 2, top + m + (d - top - m) * (k + 0.5) / 5, (b - a) * 0.3, 0, 7); g.stroke(); }
          }
          // (relecture du 14/10 : `chaud` 2 — la porte du 5/7, photo 08 — n'éclaire fort que l'IMPOSTE ; les vantaux restent du
          // verre, à peine dorés : à 0,6 partout, ils passaient pour deux panneaux de bois ; `sombre` : un hall éteint)
          if (e.chaud === 2) { const yi = top + (bas - top) * (typeof e.imposte === 'number' ? e.imposte : 0.18); g.fillStyle = 'rgba(255,196,120,0.62)'; g.fillRect(a, top + m, b - a, yi - top - m); g.fillStyle = 'rgba(255,205,140,0.3)'; g.fillRect(a, yi, b - a, bas - yi - 2 * m); }
          else if (e.chaud) { g.fillStyle = 'rgba(255,214,150,0.25)'; g.fillRect(a, top + m, b - a, bas - top - 2 * m); }
          if (e.sombre) { g.fillStyle = 'rgba(20,22,24,0.5)'; g.fillRect(a, top + m, b - a, bas - top - 2 * m); }
        }
        if (e.imposte) { g.fillStyle = e.cadre || bois; g.fillRect(x0, top + (bas - top) * (e.imposte === true ? 0.18 : e.imposte), ww, 4); }
        // (le bandeau dépoli d'une baie de bureau, à hauteur d'œil — le 5/7, photo 08)
        if (e.depoli) { g.fillStyle = 'rgba(222,230,228,0.5)'; g.fillRect(x0 + m, top + (bas - top) * 0.6, ww - 2 * m, (bas - top) * 0.17); }
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
  // (lot rue du 13/10 : le jeu rejoué à la pose de la photo 16, l'œil au repos, puis mesuré aux mêmes endroits qu'elle —
  // le trottoir sortait à 116-107-102 pour 144-140-139 sur la photo, la chaussée à 115-108-98 pour 152-150-150 : un
  // quart trop sombres et roux, sous des plafonniers d'intérieur. Les enrobés sont éclaircis et refroidis d'autant ; la
  // bordure de granit est CLAIRE, 198 sur la photo — le jeu la rendait à 71, plus sombre que la chaussée — ; le caniveau
  // n'est pas une bande de béton clair, c'est l'enrobé de la chaussée, à peine plus sombre)
  const trottoir = std({ map: texEnrobe(0x747377, 7), roughness: 0.9 }, 0.05);
  // (relecture du 09/10/2026 : mesurés sur les photos 08, 09, 13 et 15, l'enrobé de la chaussée est presque aussi clair
  // que le trottoir — un gris moyen, ~0,66 de la façade de l'école ; il en faisait 0,45 et paraissait mouillé)
  // (lot rue du 13/10 : mesurée sur les photos 08, 13 et 15 à côté du jeu rejoué à leur pose, la chaussée est un gris
  // NEUTRE aussi sombre que le trottoir — 120 à 142 —, le jeu la rendait à 163-176, lilas, plus claire que le trottoir)
  const chaussee = std({ map: texEnrobe(0x757679, 11), roughness: 0.94 }, 0.04);
  for (const m of [trottoir, chaussee]) detailPhoto(m, 'beton', 4, 4, { relief: 0.5, grain: 0.15, rugo: true });
  const paves = std({ map: texPaves(5), roughness: 0.85 }, 0.05);
  const granit = std({ color: 0xb2b6ba, roughness: 0.72 }, 0.06);
  // (relecture rue du 14/10, photos 15 à 17 : au pied de la bordure, la chaussée est SOMBRE — l'aplat à 0x6f7074 sortait
  // plus clair qu'elle, une bande grise qui doublait la bordure)
  const caniveau = std({ color: 0x57585b, roughness: 0.94 }, 0.04);
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
  // (lot rue du 13/10 : la baie de stationnement devant le 5/7, de la ligne de tirets à sa bordure ; son trottoir ; à
  // l'est de la baie, le trottoir du jardin revient au bord de la chaussée, la bordure fait un retour)
  plan(X0, Y_BAIE, X_BAIE, Y_CHAUSSEE, H_CHAUSSEE, chaussee);
  plan(X0, Y_FACE57, 15, Y_BAIE - 0.15, 0, trottoir);
  plan(X_BAIE + 0.15, Y_FACE, X1, Y_CHAUSSEE - 0.15, 0, trottoir);
  plan(X_BAIE + 0.15, Y_BAIE - 0.15, 15, Y_FACE, 0, trottoir);
  ch.boite(X0, Y_TROTTOIR - 0.15, X1, Y_TROTTOIR, H_CHAUSSEE, 0, granit, { ombre: false });
  ch.boite(X0, Y_BAIE - 0.15, X_BAIE + 0.15, Y_BAIE, H_CHAUSSEE, 0, granit, { ombre: false });
  ch.boite(X_BAIE, Y_BAIE, X_BAIE + 0.15, Y_CHAUSSEE - 0.15, H_CHAUSSEE, 0, granit, { ombre: false });
  ch.boite(X_BAIE, Y_CHAUSSEE - 0.15, X1, Y_CHAUSSEE, H_CHAUSSEE, 0, granit, { ombre: false });
  // (relecture rue du 14/10, photos 13 à 17 : de la chaussée, on ne voit de la bordure qu'un filet clair, son dessus — son
  // chant, noirci par le ruisseau, se confond avec l'enrobé ; le jeu le montrait aussi clair, une bande blanche deux fois
  // trop large)
  const chant = std({ color: 0x77797c, roughness: 0.9 }, 0.04);
  ch.boite(X0, Y_TROTTOIR - 0.156, X1, Y_TROTTOIR - 0.15, H_CHAUSSEE, -0.014, chant, { ombre: false });
  ch.boite(X0, Y_BAIE, X_BAIE, Y_BAIE + 0.006, H_CHAUSSEE, -0.014, chant, { ombre: false });
  ch.boite(X_BAIE, Y_CHAUSSEE, X1, Y_CHAUSSEE + 0.006, H_CHAUSSEE, -0.014, chant, { ombre: false });
  // les caniveaux : une bande de béton plus clair, 30 cm, au pied de chaque bordure
  ch.boite(X0, Y_TROTTOIR - 0.45, X1, Y_TROTTOIR - 0.15, H_CHAUSSEE, H_CHAUSSEE + 0.003, caniveau, { ombre: false });
  ch.boite(X0, Y_BAIE, X_BAIE, Y_BAIE + 0.28, H_CHAUSSEE, H_CHAUSSEE + 0.003, caniveau, { ombre: false });
  ch.boite(X_BAIE, Y_CHAUSSEE, X1, Y_CHAUSSEE + 0.28, H_CHAUSSEE, H_CHAUSSEE + 0.003, caniveau, { ombre: false });
  // la chaussée, 12 cm sous le trottoir : une dalle pour le joueur ; les bordures se franchissent (une marche)
  C.sol(X0, -(Y_TROTTOIR - 0.15), X1, -(Y_CHAUSSEE), H_CHAUSSEE);
  C.sol(X0, -(Y_CHAUSSEE), X_BAIE, -(Y_BAIE), H_CHAUSSEE);
  // (photo 15 : devant le portail vert du jardin, le trottoir d'en face est une dalle de béton CLAIR, 189-182-168, de la
  // bordure à la grille, x 15,1 à 17,5)
  plan(15.1, Y_FACE, 17.5, Y_CHAUSSEE - 0.15, 0.004, std({ color: 0xa59f92, roughness: 0.9 }, 0.06));

  // ---- LES DÉTAILS DE LA CHAUSSÉE (photos 08, 09, 13, 15) ----
  // les REPRISES d'enrobé : des rectangles plus sombres et plus lisses, surtout côté école
  const reprise = std({ map: texEnrobe(0x66676b, 29), roughness: 0.88 }, 0.04);
  const r = alea(77);
  for (const [x0, y0, x1, y1] of [[5.6, -3.4, 8.4, -4.4], [7.2, -5.0, 10.6, -6.6], [11.2, -4.0, 13.4, -5.1], [9.8, -3.25, 11.4, -3.75], [14.6, -3.5, 16.0, -4.6],
    [18.2, -6.0, 20.4, -7.2], [25.5, -4.6, 28.0, -6.0], [2.0, -5.8, 3.4, -6.7], [-8.5, -5.0, -6.2, -6.6]])
    ch.boite(x0, y1, x1, y0, H_CHAUSSEE, H_CHAUSSEE + 0.0025 + r() * 0.001, reprise, { ombre: false });
  // LES LIGNES BLANCHES effacées : la limite de la file de stationnement, les tirets des places, deux lignes en travers
  const peinture = std({ color: 0xdcdcda, roughness: 0.75, transparent: true, opacity: 0.55, depthWrite: false }, 0.15);
  // (une peinture transparente n'est pas cousue avec le décor : tous les traits en UN maillage)
  const traits = [];
  const trait = (x0, y0, x1, y1) => { const g = new THREE.PlaneGeometry(x1 - x0, y1 - y0).rotateX(-Math.PI / 2); g.translate((x0 + x1) / 2, H_CHAUSSEE + 0.0045, -(y0 + y1) / 2); traits.push(g); };
  // (lot rue du 13/10, photo 08 à sa pose : la limite de la baie est une ligne de TIRETS de 1,3 m tous les 2,6 m, sur
  // y -9,3 — relevés en x 6,3-7,2, 8,3-9,4 et 11,0-12,5 — ; en travers de la chaussée, les tirets sont 0,85 m à l'est du rond, en x 12,75 — juste à
  // son est, de y -3,3 à -4,4 et de -5,6 à -6,6 — et non en 17,6, où la photo 15 ne montre aucune ligne)
  const yFile = Y_CHAUSSEE;
  for (let x = -9.6; x < X_BAIE - 1.5; x += 2.6) trait(x, yFile - 0.06, x + 1.3, yFile + 0.06);
  // (en travers : au droit du passage — photo 09 — et devant le rond — photo 08)
  // (relecture rue du 14/10, photo 09 enfin posée — (3,31 ; -4,62), h 1,74, cap -100,7, roulis -5,2 — : la ligne en travers
  // est en x -0,5, d'un trottoir à l'autre — rétroprojetée en quatre points, -0,39 à -0,60 —, et non en 1,15 ; autour,
  // des plaques de peinture blanche usée)
  for (const [xl, yb] of [[-0.5, yFile + 0.3], [12.75, yFile + 0.3]]) for (let y = Y_TROTTOIR - 0.35; y > yb; y -= 2.3) trait(xl - 0.07, y - 1.1, xl + 0.07, y);
  {
    const plaques = [];
    for (const [x0, y0, x1, y1] of [[-1.75, -5.15, -0.55, -4.05], [-1.3, -5.6, -0.6, -4.9], [-1.7, -7.2, -0.9, -6.5], [-0.45, -7.3, 0.3, -6.7], [-0.4, -4.9, 0.3, -4.3], [-1.9, -10.9, -1.1, -10.35], [-1.6, -8.6, -0.9, -8.0]]) {
      const g = new THREE.PlaneGeometry(x1 - x0, y1 - y0).rotateX(-Math.PI / 2); g.translate((x0 + x1) / 2, H_CHAUSSEE + 0.005, -(y0 + y1) / 2); plaques.push(g);
    }
    const usee = new THREE.Mesh(mergeGeometries(plaques, false), std({ map: texPeintureUsee(), color: 0xc9c9c4, transparent: true, opacity: 0.72, depthWrite: false, roughness: 0.8 }, 0.1));
    usee.userData.horsAOSol = true; usee.renderOrder = 1; ch.decor.add(usee);
  }
  const lignes = new THREE.Mesh(mergeGeometries(traits, false), peinture); lignes.userData.horsAOSol = true; ch.decor.add(lignes);
  // LE ROND D'INTERDICTION peint (bleu cerclé de rouge, barré) en face du passage (photos 08, 13, 14)
  const rond = new THREE.Mesh(new THREE.CircleGeometry(0.52, 40), std({ map: texRondInterdit(), transparent: true, depthWrite: false, roughness: 0.7 }, 0.2));
  // (lot rue du 13/10 : son centre en (12,4 ; -5,0) au sol de la photo 08, en (10,9 ; -4,5) à celui de la photo 13, qui
  // ne le voit qu'au bord — retenu entre les deux, plus près de la 08 : (11,9 ; -4,85), entre deux tirets de la ligne en
  // travers)
  rond.rotation.x = -Math.PI / 2; rond.position.set(11.9, H_CHAUSSEE + 0.006, 4.85); ch.decor.add(rond);
  // LES PLAQUES : regards ronds en fonte, un regard carré au milieu de la rue près des vélos (photo 15)
  const fonte = std({ map: texFonte(), roughness: 0.55, metalness: 0.6 }, 0.05);
  for (const [x, y] of [[4.2, -6.2], [14.2, -3.6], [-6.5, -5.5], [30.0, -6.0], [38.0, -4.2]]) {
    const p = new THREE.Mesh(new THREE.CircleGeometry(0.33, 28), fonte); p.rotation.x = -Math.PI / 2; p.position.set(x, H_CHAUSSEE + 0.005, -y); ch.decor.add(p);
  }
  const carre = ch.boite(22.4, -5.9, 23.1, -5.4, H_CHAUSSEE, H_CHAUSSEE + 0.006, fonte, { ombre: false }); void carre;
  ch.boite(1.2, -2.95, 1.75, -3.25, H_CHAUSSEE, H_CHAUSSEE + 0.005, fonte, { ombre: false });               // la grille d'avaloir
  // (lot rue du 13/10, photo 13 à sa pose, au sol : devant le seuil du passage, d'un jambage à l'autre et au-delà vers
  // l'ouest, un caniveau à GRILLE de fonte de 0,4 m barre le trottoir, de y -0,6 à -1,0 ; entre lui et le carrelage, une
  // bande de béton clair)
  ch.boite(1.9, -1.02, 4.55, -0.62, 0, 0.007, std({ map: texGrille(), roughness: 0.6, metalness: 0.4 }, 0.04), { ombre: false });
  ch.boite(1.9, -0.62, 4.55, -0.45, 0, 0.006, std({ color: 0xa9a59c, roughness: 0.9 }, 0.06), { ombre: false });
  // LA PIÈCE DE PAVÉS au milieu de la chaussée (photos 08, 15) : un rapiéçage de vieux pavés, un rien bombé
  // (lot rue du 13/10 : au sol des photos 08 et 15 à leur pose, elle est en x 14,8-15,9 × y -5,5 à -6,2 — 1,35 m plus à
  // l'ouest : sur la photo 15, elle est aux pieds de l'appareil)
  const piece = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.03, 0.75), std({ map: texPaves(41), roughness: 0.8 }, 0.1));
  piece.geometry.attributes.uv.array.forEach((v, i, a) => { a[i] = v * (i % 2 ? 0.75 : 1.1); });
  piece.position.set(15.35, H_CHAUSSEE + 0.004, 5.85); ch.decor.add(piece);
  // L'ARCEAU DE PARKING rabattu (photo 09), rayé orange et blanc, couché sur la chaussée EN TRAVERS de la rue : la barre
  // du côté du passage (est), les deux bras vers l'impasse, jusqu'à la charnière (relecture du 09/10/2026 : il était
  // couché dans le sens de la rue)
  // (relecture rue du 14/10, photo 09 à sa pose : il est sur la ligne en travers, en (-0,55 ; -5,26) — le jeu le couchait
  // en (1,45 ; -5,95), sous les pieds de l'appareil : la photo, prise de x 3,3, le montre à 3,9 m)
  const arceauP = new THREE.Group(); arceauP.position.set(-0.55, H_CHAUSSEE + 0.03, 5.26); arceauP.rotation.y = Math.PI / 2 + 0.1; ch.decor.add(arceauP);
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
  const pierre4 = std({ map: texFacade({ fond: '#cfc3ad', cadre: '#efece6', verre: '#505c68', travee: 2.0, etage: 3.1, fh: 1.8, appui: 1.25, joints: true, encadrement: '#c9bba3', rideaux: true, graine: 4 }), roughness: 0.85 }, 0.07);
  const blanc = std({ map: texFacade({ fond: '#efefe8', cadre: '#ffffff', verre: '#56626e', travee: 1.9, etage: 2.9, persiennes: '#dfe3d8', fleurs: true, graine: 5 }), roughness: 0.85 });
  // (intégration du 11/10, plan V2 : arrêté en y 12,45, au sud de l'aile A — il descendait jusqu'en y 14 et entrait de 1,25 m
  // dans la courette ouest, js/ecole_pieces.js courette : par les fenêtres de la Si 0.2, son fond crème bouchait la cour)
  facade(X0 - 6, YV, -7.5, 12.45, 19, creme);
  // (relecture du lot façade, 11/10 : la brique s'arrête à 1,4 m de l'école — photo 10 recalée, x -1,7 ; photos 09 et
  // 12 : contre la bande noire, de toute la hauteur, un trumeau de pierre lisse, sans fenêtre ni brique)
  // (lot rue du 13/10 : ce « trumeau de pierre lisse » est le RETOUR du n° 8, en saillie de 1,25 m sur l'école — vu de la
  // photo 10, il va du pixel 250 au 404, là où tombe un mur de x -0,3 allant de y -1,65 à -0,4 ; la brique file jusqu'au coin)
  facade(-7.5, YV, -0.3, 12.45, 19, brique8);
  facade(-0.33, YV + 0.005, -0.295, -0.4, 19, std({ color: 0xe6e0d4, roughness: 0.88 }), { collision: false });
  // (lot façade du 11/10 : la photo 10, recalée — 5 px —, met la porte cochère du n° 8, bois verni à carreaux et imposte,
  // dans son encadrement de pierre claire, à 1,9 m de la bande noire de l'école : x -3,7 à -2,2 ; entre les deux, un mur
  // crème et un pilastre plus clair (x -1,7 à -0,3 à la relecture), sans fenêtre — le jeu y posait deux fenêtres à barreaux. La porte
  // cintrée suit à l'ouest, après un trumeau (photo 09).)
  // (lot rue du 13/10, photo 10 à sa pose, sur le nu en saillie : la pierre du rez-de-chaussée monte à 4,2 m — la brique ne
  // commence qu'au-dessus —, la porte de bois sombre verni, haute de 2,85 m dans son encadrement, va jusqu'à 0,95 m du coin)
  rdc(-7.5, -0.3, YV, 4.2, { fond: '#e6e1d6', socle: '#c9c2b5', joints: true, graine: 10, elements: [
    { t: 'porte', x0: -5.6, x1: -4.5, h: 2.9, bois: '#5a3620', arc: true, imposte: true, vantaux: 2, pierre: '#ece6da' },
    { t: 'porte', x0: -2.35, x1: -0.95, h: 2.85, bois: '#55301a', imposte: true, vantaux: 2, plein: true, grille: true, encadrement: '#efeadf' },
  ] });
  // (relecture rue du 14/10, photo 10 : la caméra blanche et son petit panneau solaire, sur le trumeau à l'est de la porte,
  // à 3,1 m)
  ch.boite(-1.0, YV - 0.2, -0.9, YV, 3.07, 3.15, std({ color: 0xf2f2ee, roughness: 0.5 }, 0.2), { ombre: false }).userData.horsAOSol = true;
  ch.boite(-0.86, YV - 0.17, -0.7, YV - 0.05, 3.15, 3.17, std({ color: 0x23262b, roughness: 0.3 }, 0.05), { ombre: false }).userData.horsAOSol = true;
  rdc(X0, -7.5, YV, 3.4, { fond: '#d9d0bf', socle: '#b6ad9e', joints: true, graine: 11, elements: [
    { t: 'porte', x0: -9.9, x1: -8.9, h: 2.8, bois: '#5d3a22', vantaux: 2 },
    { t: 'plaque', x0: -8.55, x1: -8.33, bas: 2.55, h: 2.75, texte: '10' },
    { t: 'fenetre', x0: -8.1, x1: -7.6, bas: 1.0, h: 2.6 },
  ] });
  toit(X0 - 6, -0.3, YV, 4.5, 19);
  // LA MARQUISE du n° 10 (photo 09) : un auvent de verre cannelé ambré sur une armature noire, au-dessus de la porte,
  // qui penche vers la rue (relecture du 09/10/2026 : ce n'était qu'un trapèze jaune peint sur la façade)
  {
    const g = new THREE.Group(); g.position.set(-9.4, 3.3, -YV); ch.decor.add(g);
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
  // (lot rue du 13/10 — le bâti de l'IGN : le n° 4 va de l'école à x 26,9, haut de 16,6 m ; puis un immeuble blanc de
  // 13,8 m jusqu'en 35, et un immeuble bas de 9,9 m jusqu'au coin. Le n° 4 est en saillie : son RETOUR d'enduit crème, de
  // y -0,4 à -1,65, se voit sur la photo 16 entre la bande noire de l'école et la descente d'eau du coin.)
  // (relecture rue du 14/10, photos 15 et 16 à leur pose : chaque fenêtre des étages a son BALCONNET de fonte noire en
  // saillie de 0,3 m sur une dalle de pierre — celui du 1er au-dessus du portail va de x 20,2 à 21,2, sa dalle à 3,5 m — ;
  // le portail est en relief, deux pilastres et une corniche : vu de biais, le pilastre cache la moitié de la porte, comme
  // sur la photo 16. Le jeu dessinait tout cela à plat. La boîte monte à 16,9 m pour que ses fenêtres — des tuiles de
  // 3,1 m centrées sur elle — tombent sur les dalles : 3,5 m et tous les 3,1 m.)
  facade(20.1, YV, 26.9, 14, 16.9, pierre4);
  facade(20.085, YV + 0.005, 20.12, -0.4, 16.9, std({ color: 0xe4dfd2, roughness: 0.9 }), { collision: false });
  {
    const fer = std({ map: texFerronnerie(), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.6 }, 0.03), dalle = std({ color: 0xc4b9a3, roughness: 0.9 }, 0.06), gs = [];
    const pan = (L, x, y, z, rot) => { const g = new THREE.PlaneGeometry(L, 0.8); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * L); g.rotateY(rot); g.translate(x, z, -y); gs.push(g); };
    for (let n = 0; n < 4; n++) for (const xc of [20.5, 22.5, 24.5, 26.5]) {
      const z = 3.6 + n * 3.1, a = Math.max(20.14, xc - 0.66), b = Math.min(26.86, xc + 0.66);
      ch.boite(a, YV - 0.32, b, YV, z - 0.08, z, dalle, { ombre: false }).userData.horsAOSol = true;
      pan(b - a, (a + b) / 2, YV - 0.3, z + 0.4, 0); pan(0.3, a + 0.01, YV - 0.15, z + 0.4, Math.PI / 2); pan(0.3, b - 0.01, YV - 0.15, z + 0.4, Math.PI / 2);
    }
    const m = new THREE.Mesh(mergeGeometries(gs, false), fer); m.name = 'balconnets du n° 4'; m.userData.horsAOSol = true; m.matrixAutoUpdate = false; ch.decor.add(m);
    const pierreP = std({ color: 0xe3ddcf, roughness: 0.9 }, 0.1);
    for (const [a, b] of [[20.31, 20.56], [21.63, 21.88]]) ch.boite(a, YV - 0.2, b, YV, 0, 2.86, pierreP, { ombre: false }).userData.horsAOSol = true;
    ch.boite(20.27, YV - 0.26, 21.92, YV, 2.86, 3.08, pierreP, { ombre: false }).userData.horsAOSol = true;
  }
  // (lot rue du 13/10, photo 16 rejouée à sa pose : la porte du n° 4 est 1,3 m plus à l'est, x 22,2-23,4 — de chêne
  // clair, sous son arc de pierre, la plaque bleue au-dessus, en x 22,8 ; la descente d'eau crème en x 21,4, entre l'école
  // et elle ; la première fenêtre à barreaux blancs ne commence qu'en x 25,0. La pierre du n° 4 est claire, 200 sur la
  // photo — le jeu la rendait à 148-132-112, un beige roux.)
  // (photo 16 à sa pose, sur le nu en saillie : la descente d'eau crème à l'angle ; le portail de pierre de x 20,4 à
  // 21,8, sa porte de chêne clair de 0,95 m sous un arc à 2,45 m ; la plaque bleue « 4 » au-dessus, centrée en 21,14 à
  // 2,70 m ; la première fenêtre à barreaux blancs commence en 22,8)
  rdc(20.1, 26.9, YV, 3.6, { fond: '#cfc3ad', socle: '#b9ae98', joints: true, graine: 12, elements: [
    { t: 'bande', x0: 20.14, x1: 20.28, couleur: '#ece7dc', h: 3.6 },
    { t: 'porte', x0: 20.62, x1: 21.57, h: 2.45, bois: '#a48a66', arc: true, vantaux: 1, plein: true, pierre: '#e9e3d7', encadrement: '#e8e2d5' },
    { t: 'plaque', x0: 21.02, x1: 21.26, bas: 2.58, h: 2.83, texte: '4' },
    { t: 'fenetre', x0: 22.8, x1: 23.9, bas: 0.9, h: 2.5 }, { t: 'fenetre', x0: 25.2, x1: 26.3, bas: 0.9, h: 2.5 },
  ] });
  toit(20.1, 26.9, YV, 4.5, 16.9);
  facade(26.9, YV, 35, 14, 13.8, blanc);
  rdc(26.9, 35, YV, 3.2, { fond: '#ecebe4', socle: '#c9c6bd', graine: 18, elements: [
    { t: 'porte', x0: 27.7, x1: 28.9, h: 2.7, bois: '#e9e9e4', vantaux: 2 },
    { t: 'fenetre', x0: 30.1, x1: 31.3, bas: 0.9, h: 2.5 }, { t: 'fenetre', x0: 32.6, x1: 33.8, bas: 0.9, h: 2.5 },
  ] });
  facade(35, YV, X1 + 0.5, 14, 9.9, creme);
  toit(35, X1 + 0.5, YV, 4.5, 9.9);
  // LES LANTERNES murales de Paris (photos 13, 14 : sur l'immeuble blanc ; une autre sur le 5/7)
  // (relecture rue du 14/10, photo 15 à sa pose : c'est un lampadaire de rue sur une grande console, scellée à 8 m — et
  // non une applique à 4,6 m)
  lanterne(ch, 28.8, YV, 7.7, 1, 1.8);
  lanterne(ch, 2.0, Y_FACE57, 4.6, -1);

  // EN FACE, À L'OUEST : LE 5/7 (enduit blanc, caissons de mélèze, rez-de-chaussée vitré : photos 07, 08, 09). Au rez-de-
  // chaussée, d'ouest en est : la porte de garage en lames de bois, le pilier « 5/7 », la porte vitrée blanche, des
  // baies cadrées de bois ou de gris, la porte vitrée de bois (photo 08)
  // (lot rue du 13/10, photo 08 à sa pose, sur le nu y -12,7 : le coin est du 5/7 est en x 12,5 — 13,2 au cadastre —, son
  // portail de mélèze va de x 9,05 à 11,65, la porte vitrée d'aluminium à deux vantaux de 9,25 à 10,8, éclairée de
  // l'intérieur ; à son ouest, la grande baie au bandeau dépoli commence en 8,5)
  // (relecture rue du 14/10 — photos 08 et 09 de près, rejouées à leur pose : le 5/7 va de x -6,5 à 12,1 ; ses étages
  // sont dessinés d'un seul tenant, texEtages57 ; son rez-de-chaussée monte à 3,4 m. D'ouest en est : le PORCHE DU
  // GARAGE cadré de mélèze, x -5,91 à -3,14 — en haut une grille grise, dessous la porte de bois et ses deux affichettes — ;
  // le pilier de bois « 5/7 », x -2,76 à -2,0, et son chant sombre ; la porte vitrée d'aluminium du hall, sombre ; puis
  // les baies du milieu (non revues : aucune photo ne les montre de face) ; la grande baie au bandeau dépoli jusqu'à 8,5,
  // son tableau de bois ; un trumeau blanc ; le PORCHE DE L'ENTRÉE, x 9,08 à 11,65 : la porte d'aluminium à deux vantaux
  // de 9,18 à 10,84, haute de 2,42 sous une imposte éclairée, et un panneau de mélèze à son est. Le jeu posait le garage
  // en -4,1 à -1,7 et le pilier en -1,6 : 1,6 m trop à l'est, et tout d'un bois orangé.)
  facade(X57O, Y_FACE57 - 14, X57E, Y_FACE57, 18, std({ color: 0xf0ede6, roughness: 0.85 }, 0.12));
  {
    const L = X57E - X57O, H0 = 3.6, H1 = 18;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(L, H1 - H0), std({ map: texEtages57(L, H0, H1, X57E), roughness: 0.8 }, 0.12));
    m.position.set((X57O + X57E) / 2, (H0 + H1) / 2, -(Y_FACE57 + 0.02)); m.rotation.y = Math.PI; m.userData.horsAOSol = true; ch.decor.add(m);
  }
  rdc(X57O, X57E, Y_FACE57, 3.6, { fond: '#f1eee6', ppm: 70, graine: 13, elements: [
    { t: 'bande', x0: -5.91, x1: -3.14, h: 3.4, couleur: BOIS57 },
    { t: 'bande', x0: -5.7, x1: -3.6, bas: 2.42, h: 3.22, couleur: '#7b7973' },
    { t: 'garage', x0: -5.7, x1: -3.6, h: 2.42, bois: '#9a8873' },
    { t: 'bande', x0: -3.0, x1: -2.76, h: 3.3, couleur: '#a9865c' },
    { t: 'pilier', x0: -2.76, x1: -2.0, h: 3.3, bois: BOIS57, texte: '5/7' },
    { t: 'porte', x0: -2.0, x1: 0.7, h: 3.3, cadre: '#d6d8d4', vantaux: 3, imposte: 0.27, sombre: true },
    { t: 'vitrine', x0: 1.2, x1: 3.4, h: 2.75, cadre: '#9c7448', vantaux: 2, chaud: true },
    { t: 'pilier', x0: 3.4, x1: 4.2, h: 2.75, bois: BOIS57 },
    { t: 'vitrine', x0: 4.2, x1: 6.0, h: 2.75, cadre: '#4a4f55', vantaux: 2 },
    { t: 'vitrine', x0: 6.3, x1: 8.5, h: 3.38, cadre: '#c6c9c6', vantaux: 2, depoli: true },
    { t: 'bande', x0: 8.5, x1: 8.66, h: 3.38, couleur: '#a9865c' },
    { t: 'bande', x0: 9.08, x1: 11.65, h: 3.4, couleur: BOIS57 },
    { t: 'porte', x0: 9.18, x1: 10.84, h: 3.26, cadre: '#b4b8bc', vantaux: 2, chaud: 2, imposte: 0.26 },
  ] }, 'N');
  // (du coin du 5/7 au mur de la baie, la grille du jardin en retrait, sur le nu du 5/7)
  jardin(ch, X57E, 15.0, Y_FACE57);
  // au fond de l'impasse, côté sud (photo 09) : la vieille maison basse en retrait, derrière son muret et sa grille
  const enduit = std({ map: texFacade({ fond: '#dcd8cf', cadre: '#f0eee8', verre: '#56606a', travee: 2.2, etage: 2.9, fl: 1.1, fh: 1.4, graine: 14 }), roughness: 0.9 });
  // (relecture rue du 14/10, photo 09 à sa pose : le pignon ouest du 5/7 est en x -6,5 — -7,6 au cadastre —, et non -4,5 ;
  // de là au fond, le même mur haut sous sa grille)
  facade(X0, Y_FACE57 - 9, X57O, Y_FACE57 - 3, 5.2, enduit, { collision: false });
  muretGrille(ch, X0, X57O, Y_FACE57, 'x', { hMuret: 2.42, hGrille: 1.6, sol: 0, mat: _vieuxMur() });
  C.ajouterBoite(X0, -(Y_FACE57 - 0.3), X57O, -(Y_FACE57), { y1: 3.9 });
  // (entre le coin du 5/7 et la grille du jardin, un mètre de mur : la baie s'arrête, le trottoir du jardin avance)
  ch.boite(15, Y_FACE57, 15.3, Y_FACE - 0.6, 0, 1.78, betonMuret(), { ombre: false, collision: true });
  // LE JARDIN (photo 15) : muret de béton taché, grille noire de 1,9 m doublée de brande, poteaux, lisse ; l'immeuble des
  // années 60 au fond
  const [xj0, xj1] = RUE.X_JARDIN;
  jardin(ch, xj0, xj1, Y_FACE - 0.6);
  plan(xj0, Y_FACE - 0.6, xj1, Y_FACE, 0, trottoir);
  // l'immeuble des années 60 au fond du jardin (photo 08 : sept étages, des balcons filants à garde-corps blancs, des
  // jardinières aux balcons), à 6 m derrière la grille
  // (au cadastre, il va de x 13,2 à 26,9)
  // (relecture rue du 14/10, photo 08 de près, à sa pose : ses BALCONS FILANTS sont en relief — une dalle blanche en saillie
  // tous les 2,8 m, la première à 1,9 m, un garde-corps blanc à barreaux serrés, la façade sombre en retrait derrière — ; à
  // 83 px d'un balcon à l'autre, leur nez est à 20 m de l'appareil, en y -17,7 : la façade en -19,0, et non -17,1 ; son
  // arête est, au relèvement 126°, tombe en x 24,5. Le jeu en faisait un mur plat à fenêtres, sans balcon.)
  {
    const yB = -19.0, xB0 = 13.2, xB1 = 24.5, sB = 1.3;
    const fond = std({ map: texFacade({ fond: '#dcd9d0', cadre: '#35383b', verre: '#414b53', travee: 2.8, etage: 2.8, fl: 2.3, fh: 2.15, appui: 0.02, rideaux: true, graine: 19 }), roughness: 0.85 });
    // (la boîte est calée pour que ses tuiles d'étage — centrées sur elle — tombent sur les dalles : 1,9 + 2,8 n)
    facade(xB0, yB - 12, xB1, yB, 20.6, fond, { collision: false });
    const dalle = std({ color: 0xecebe6, roughness: 0.8 }, 0.14), gc = std({ map: texGardeCorps(), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.7 }, 0.2);
    const gs = [];
    const pan = (L, x, y, z, rot) => { const g = new THREE.PlaneGeometry(L, 1.0); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * L); g.rotateY(rot); g.translate(x, z, -y); gs.push(g); };
    for (let z = 1.9; z < 20; z += 2.8) {
      ch.boite(xB0, yB, xB1, yB + sB, z - 0.16, z, dalle, { ombre: false }).userData.horsAOSol = true;
      pan(xB1 - xB0, (xB0 + xB1) / 2, yB + sB - 0.03, z + 0.5, Math.PI); pan(sB, xB1 - 0.03, yB + sB / 2, z + 0.5, Math.PI / 2);
    }
    const m = new THREE.Mesh(mergeGeometries(gs, false), gc); m.userData.horsAOSol = true; m.matrixAutoUpdate = false; ch.decor.add(m);
    // (photo 08 : des jardinières au premier balcon, vert et rouge)
    const fl = std({ color: 0x5f7f48, roughness: 0.9 }, 0.12), ro = std({ color: 0xb83a40, roughness: 0.9 }, 0.12);
    for (const [x, c] of [[19.2, fl], [20.1, ro], [21.0, fl], [22.6, fl], [23.3, ro]]) ch.boite(x, yB + sB - 0.02, x + 0.7, yB + sB + 0.16, 4.7 + 0.85, 4.7 + 1.18, c, { ombre: false }).userData.horsAOSol = true;
    toit(xB0, xB1, yB, 3, 20.6, 'N', 1.2);
  }
  // (lot rue du 13/10 : au cadastre, la parcelle du jardin va jusqu'au coin — aucun immeuble à l'angle ; la grille tourne
  // le long de la rue transversale)

  // L'IMPASSE (ouest, photo 09) : un muret de béton taché de 1 m, une grille noire de 1,5 m à pointes ; derrière, une maison
  // basse, de grands arbres et l'immeuble à l'escalier en colimaçon (js/ecole_rue_mobilier.js pose la verdure et les pots)
  // (relecture rue du 14/10, photo 09 à sa pose : c'est un MUR de 2,4 m — son arête à 2,6-2,8 m sur le plan x -10,2,
  // au-dessus de l'œil de l'appareil, la poubelle verte de 1,08 m à son pied — sous une grille de 1,6 m ; le jeu en
  // faisait un muret de 1,05 m)
  // (mesuré au même endroit : 73-75-68 sur la photo, un vieux mur gris moussu — le béton clair des murets sortait à 151)
  muretGrille(ch, Y_FACE57, YV, X0, 'y', { hMuret: 2.3, hGrille: 1.6, sol: H_CHAUSSEE, mat: _vieuxMur() });
  C.ajouterBoite(X0 - 0.3, -(-0.4), X0, -Y_FACE57, { y1: 3.9 });
  // (relecture rue du 14/10, photo 09 à sa pose : derrière la grille du fond, à 9 m, un immeuble CRÈME à balconnets — du
  // relèvement 250° au 262° —, et à son sud, vu par-dessus le coin du 5/7, un immeuble aux balcons de bois brun devant
  // lequel monte un ESCALIER EN COLIMAÇON blanc de 2,8 m de large — en (-18 ; -20), il sort du cadre à plus de 13 m.
  // Le jeu n'y montrait qu'un mur à fenêtres et à géraniums.)
  facade(X0 - 16, -16.5, X0 - 9, 12, 22, std({ map: texFacade({ fond: '#e8e1cb', cadre: '#f6f3ea', verre: '#5a6570', travee: 2.5, etage: 2.9, fl: 1.2, fh: 1.75, appui: 0.55, balcon: true, rideaux: true, graine: 31 }), roughness: 0.85 }, 0.2), { collision: false });
  facade(X0 - 16, -32, X0 - 9.6, -16.5, 22, std({ map: texFacade({ fond: '#d9d3c5', cadre: '#3a3d40', verre: '#48525a', travee: 3.0, etage: 2.9, fl: 2.4, fh: 2.0, appui: 0.36, bandeau: '#8f6238', graine: 33 }), roughness: 0.85 }, 0.16), { collision: false });
  {
    const xc = -18.0, yc = -20.1, Rc = 1.4, pas = 2.9, n = 24, gs = [];
    const blanc = std({ color: 0xf0efea, roughness: 0.7 }, 0.2);
    for (let i = 0; i < Math.round((21 - 2.4) / pas * n); i++) {
      const a = i / n * Math.PI * 2, z = 2.4 + i * pas / n;
      // le limon plein, en dehors (un panneau d'un mètre, tangent), et la marche
      const p = new THREE.BoxGeometry(0.4, 1.0, 0.05); p.translate(0, 0.5, Rc); p.rotateY(a); p.translate(xc, z, -yc); gs.push(p);
      const m = new THREE.BoxGeometry(0.42, 0.05, Rc - 0.2); m.translate(0, 0, Rc / 2 + 0.1); m.rotateY(a); m.translate(xc, z, -yc); gs.push(m);
    }
    const fut = new THREE.CylinderGeometry(0.22, 0.22, 21, 10); fut.translate(xc, 10.5, -yc); gs.push(fut);
    const esc = new THREE.Mesh(mergeGeometries(gs.map((g) => g.toNonIndexed()), false), blanc); esc.name = 'escalier en colimaçon (photo 09)'; esc.userData.horsAOSol = true; esc.castShadow = false; esc.matrixAutoUpdate = false; ch.decor.add(esc);
  }
  facade(X0 - 5, -3, X0 - 2, 4, 8, enduit, { collision: false });
  // LE CARREFOUR (est, photos 08, 15) : la rue transversale (chaussée de x1 + 2 à x1 + 11, trottoirs de part et d'autre),
  // l'immeuble crème d'en face, six étages, une brasserie au rez-de-chaussée sous son store sombre ; on s'arrête au bord
  const [TC0, TC1, TCF] = RUE.CARREFOUR, XT = X1 + TCF;
  // (relecture du 09/10/2026 : la rue transversale va plus loin — de y = -34 à 22 —, pour qu'aucun bord du sol ne se
  // voie en biais depuis le bout de la rue ; ses trottoirs ont leurs bordures, et celles de la rue tournent au coin)
  const YS = -34, YN = 22;
  plan(X1, Y_CHAUSSEE, X1 + TC1, Y_TROTTOIR - 0.15, H_CHAUSSEE, chaussee);
  plan(X1 + TC0, YS, X1 + TC1, Y_CHAUSSEE, H_CHAUSSEE, chaussee);
  plan(X1 + TC0, Y_TROTTOIR - 0.15, X1 + TC1, YN, H_CHAUSSEE, chaussee);
  plan(X1, Y_TROTTOIR, X1 + TC0, YN, 0, trottoir);
  plan(X1, YS, X1 + TC0, Y_CHAUSSEE - 0.15, 0, trottoir);
  plan(X1 + TC1, YS, XT, YN, 0, trottoir);
  ch.boite(X1 + TC1 - 0.15, YS, X1 + TC1, YN, H_CHAUSSEE, 0, granit, { ombre: false });
  for (const y of [Y_TROTTOIR, Y_CHAUSSEE]) ch.boite(X1, y - 0.15, X1 + TC0 + 0.15, y, H_CHAUSSEE, 0, granit, { ombre: false });
  ch.boite(X1 + TC0, Y_TROTTOIR - 0.15, X1 + TC0 + 0.15, YN, H_CHAUSSEE, 0, granit, { ombre: false });
  ch.boite(X1 + TC0, YS, X1 + TC0 + 0.15, Y_CHAUSSEE, H_CHAUSSEE, 0, granit, { ombre: false });
  // (la grille du jardin tourne au coin, le long du trottoir de la rue transversale)
  muretGrille(ch, -19, Y_FACE - 0.6, X1, 'y', { hMuret: 0.35, hGrille: 1.37, sol: 0 });
  // EN FACE, TROIS IMMEUBLES (photos 08, 15) : au milieu l'immeuble crème de six étages et sa brasserie ; au sud un
  // immeuble de pierre plus haut ; au nord un immeuble blanc aux persiennes grises. Chacun a son rez-de-chaussée dessiné :
  // aucune fenêtre d'étage ne descend jusqu'au trottoir (un seul mur de 50 m, avant la relecture).
  // (lot rue du 13/10, photos 08 et 15 à leur pose sur le plan x 47,8 : l'immeuble crème a QUATRE étages sur son
  // rez-de-chaussée — 17 m, son toit en terrasse —, des travées de 3,45 m, des étages de 3,4 m, des portes-fenêtres hautes
  // de 2 m à garde-corps noirs dont l'appui est au plancher ; il va jusqu'en y -16,8, où commence l'immeuble de pierre à
  // balcons, au café sous son store sombre. Le jeu en faisait six étages de 2,85 m, à 58,5 m.)
  // (mesuré sur les photos 08 et 15 à côté du jeu rejoué à leur pose : l'immeuble crème est le plus CLAIR de la rue, 226
  // quand la pierre du n° 4, dans l'ombre de la rue, est à 143 — le jeu rendait l'inverse, 150 et 172 : il reçoit plus de
  // jour du ciel, le n° 4 moins)
  const fondRue = std({ map: texFacade({ fond: '#f7f3df', cadre: '#fbf9f0', verre: '#5a6672', travee: 3.45, etage: 3.4, fl: 1.15, fh: 2.0, appui: 0.15, balcon: true, rideaux: true, graine: 16 }), roughness: 0.85 }, 0.3);
  const fondSud = std({ map: texFacade({ fond: '#e6dfcf', cadre: '#efe9de', verre: '#56626e', travee: 2.9, etage: 3.3, fl: 1.15, fh: 2.1, appui: 0.15, balcon: true, joints: true, encadrement: '#ece4d4', rideaux: true, graine: 21 }), roughness: 0.85 }, 0.24);
  const fondNord = std({ map: texFacade({ fond: '#efede6', cadre: '#ffffff', verre: '#56626e', travee: 1.8, etage: 2.9, persiennes: '#c3c8c2', graine: 22 }), roughness: 0.85 });
  facade(XT, -16.8, XT + 10, 4, 17, fondRue, { collision: false });
  facade(XT, YS, XT + 10, -16.8, 16.5, fondSud, { collision: false });
  // (son comble de zinc, en retrait)
  ch.boite(XT + 0.7, YS, XT + 10, -16.8, 16.5, 19.3, zinc, { ombre: false }).userData.horsAOSol = true;
  facade(XT, 4, XT + 10, YN + 2, 17, fondNord, { collision: false });
  // un rez-de-chaussée tourné vers la rue (vers l'ouest), de yN (au nord : à gauche vu de la rue) à yS
  const rdcO = (yN, yS, H, o) => {
    const L = yN - yS, m = new THREE.Mesh(new THREE.PlaneGeometry(L, H), std({ map: texRezDeChaussee(L, H, o), roughness: 0.8 }, 0.12));
    m.position.set(XT - 0.02, H / 2, -(yN + yS) / 2); m.rotation.y = -Math.PI / 2; m.userData.horsAOSol = true; ch.decor.add(m);
  };
  // (photo 15 : au rez-de-chaussée de l'immeuble crème, des fenêtres à barreaux clairs, la plaque bleue de la rue à
  // 2,4 m en y -6,7, la porte grise de y -7,25 à -8,4 ; le café est celui de l'immeuble de pierre, au sud)
  rdcO(4, -16.8, 3.6, { fond: '#f5f0dc', socle: '#ddd7c4', graine: 17, elements: [
    { t: 'fenetre', x0: 1.6, x1: 2.9, bas: 0.9, h: 2.6, barreaux: '#d9d9d2' }, { t: 'fenetre', x0: 5.0, x1: 6.3, bas: 0.9, h: 2.6, barreaux: '#d9d9d2' },
    { t: 'fenetre', x0: 8.4, x1: 9.7, bas: 0.9, h: 2.6, barreaux: '#d9d9d2' },
    { t: 'plaque', x0: 10.4, x1: 11.0, bas: 2.28, h: 2.55, texte: 'RUE' },
    { t: 'porte', x0: 11.3, x1: 12.4, h: 2.4, bois: '#c9cac6', vantaux: 2 },
    { t: 'fenetre', x0: 13.6, x1: 14.9, bas: 0.9, h: 2.6, barreaux: '#d9d9d2' }, { t: 'fenetre', x0: 17.0, x1: 18.3, bas: 0.9, h: 2.6, barreaux: '#d9d9d2' },
  ] });
  rdcO(-16.8, YS, 3.9, { fond: '#ddd4c2', socle: '#a99e8c', joints: true, graine: 23, elements: [
    { t: 'vitrine', x0: 0.6, x1: 6.4, h: 2.9, cadre: '#231f1d', vantaux: 4, chaud: true },
    { t: 'auvent', x0: 0.4, x1: 6.6, h: 3.5, couleur: '#26282a', texte: 'CAFÉ' },
    { t: 'porte', x0: 8.2, x1: 9.6, h: 3.1, bois: '#4a3322', vantaux: 2, arc: true, pierre: '#e3d9c8' },
    { t: 'fenetre', x0: 11.5, x1: 12.7, bas: 1.0, h: 2.8 }, { t: 'fenetre', x0: 14.0, x1: 15.2, bas: 1.0, h: 2.8 }, { t: 'fenetre', x0: 16.5, x1: 17.7, bas: 1.0, h: 2.8 },
  ] });
  rdcO(YN + 2, 4, 3.3, { fond: '#ecebe4', socle: '#c9c6bd', graine: 24, elements: [
    { t: 'fenetre', x0: 1.5, x1: 2.7, bas: 0.9, h: 2.5 }, { t: 'fenetre', x0: 4.0, x1: 5.2, bas: 0.9, h: 2.5 },
    { t: 'porte', x0: 7.0, x1: 8.3, h: 2.7, bois: '#e9e9e4', vantaux: 2 },
    { t: 'garage', x0: 10.5, x1: 13.0, h: 2.5, bois: '#6d6f70' },
    { t: 'fenetre', x0: 15.0, x1: 16.2, bas: 0.9, h: 2.5 },
  ] });
  C.ajouterBoite(X1 - 0.5, -(-0.4), X1, -(Y_FACE - 0.6), { y1: 3 });
  // (les façades d'en face et des voisins sont solides : la rue est fermée de partout)

  // ---- LE MOBILIER, LES PLANTES, LES DEUX-ROUES, LES VOITURES ----
  poserMobilierRue(ch, RUE);
  poserVoitures(ch, RUE, taches);
  // les taches d'ombre douces sous ce qui est posé dehors (la carte d'ombre du soleil ne couvre que le trottoir de l'école,
  // et l'ombre cuite ne couvre que l'intérieur)
  // (lot rue du 13/10 : elles suivent les bancs, le bambou, le palmier, la moto et les vélos à leur nouvelle place)
  for (const [x, y, sx, sy, f] of [[6.88, -1.82, 0.72, 0.32, 0.5], [11.85, -1.48, 0.64, 0.3, 0.5], [8.55, -0.8, 2.75, 0.5, 0.45], [12.98, -2.29, 0.4, 0.4, 0.5],
    [16.87, -1.26, 0.4, 0.4, 0.5], [0.85, -1.2, 0.85, 0.7, 0.5], [5.5, -1.22, 0.16, 0.45, 0.45], [12.05, -0.8, 0.16, 0.45, 0.45]])
    taches.ajouter(x, y, sx, sy, 0, f, 0);
  taches.ajouter(19.55, -1.4, 1.0, 0.42, 1.91, 0.45, 0);
  for (const [x, y, sx, sy, f] of [[17.8, -4.55, 1.8, 0.5, 0.45], [21.7, Y_CHAUSSEE + 1.0, 2.4, 1.1, 0.5], [19.7, Y_CHAUSSEE + 0.38, 0.8, 0.36, 0.5]])
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
function muretGrille(ch, a, b, l, axe, { hMuret = 1.0, hGrille = 1.5, sol = 0, mat = null }) {
  const M = ch.M, beton = mat || betonMuret();
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
  // (lot rue du 13/10, photos 08 et 15 à leur pose, sur le plan de la grille : le muret s'arrête à 0,35 m, la lisse basse
  // est à 0,45, le haut des barreaux à 1,65-1,9 m — 1,72 retenu. Le jeu montait à 2,55 m : de la chaussée, la grille
  // fermait le ciel au lieu de laisser voir le jardin par-dessus.)
  const HM = 0.35, HG = 1.72;
  ch.boite(x0, yF, x1, yF + 0.32, 0, HM, beton, { ombre: false });
  ch.boite(x0, yF + 0.32, x1, yF + 0.62, 0, 0.12, beton, { ombre: false });        // la banquette au pied (photo 15)
  // la brande : un plan à 18 cm derrière les barreaux, UV en mètres
  const L = x1 - x0, hb = HG - HM, g = new THREE.PlaneGeometry(L, hb);
  const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * L, uv.getY(i) * hb);
  const p = new THREE.Mesh(g, brande); p.position.set((x0 + x1) / 2, HM + hb / 2, -(yF + 0.08)); p.userData.horsAOSol = true; ch.decor.add(p);
  for (let x = x0 + 0.06; x < x1; x += 0.12) ch.boite(x, yF + 0.2, x + 0.02, yF + 0.22, HM, HG, M.barreaux, { ombre: false });
  for (const h of [HM + 0.1, HG - 0.06]) ch.boite(x0, yF + 0.19, x1, yF + 0.23, h, h + 0.04, M.barreaux, { ombre: false });
  for (let x = x0; x <= x1 + 0.01; x += 2.6) ch.boite(x - 0.04, yF + 0.17, x + 0.04, yF + 0.25, HM, HG + 0.06, M.barreaux, { ombre: false });
  // (photo 15, au bord droit : le poteau VERT sombre du portail du jardin, en x 16,4, au bout de la dalle de béton clair)
  if (x0 < 16.3 && x1 > 16.5) ch.boite(16.34, yF + 0.14, 16.46, yF + 0.28, 0, 1.95, jourDehors(new THREE.MeshStandardMaterial({ color: 0x23402f, roughness: 0.6 }), 0.08), { ombre: false });
  C.ajouterBoite(x0, -(yF + 0.62), x1, -yF, { y1: 0.12 });
  C.sol(x0, -(yF + 0.62), x1, -(yF + 0.32), 0.12);          // (on monte sur la banquette au lieu d'y enfoncer les pieds)
  C.ajouterBoite(x0, -(yF + 0.32), x1, -yF, { y1: 2.6 });
}

// LA LANTERNE DE PARIS en applique (photos 13, 14) : une console noire qui sort du mur, sa crosse en dessous, la lanterne
// hexagonale pendue au bout, allumée doucement. `s` : +1 si la rue est au sud du mur (côté école), -1 en face.
let _vitreLanterne = null;
function lanterne(ch, x, yF, h, s, e = 1) {
  const noir = ch.M.acierNoir;
  _vitreLanterne = _vitreLanterne || new THREE.MeshStandardMaterial({ color: 0x3a372f, roughness: 0.25, metalness: 0.4, emissive: 0xffdca0, emissiveIntensity: 0.45 });
  const g = new THREE.Group(); g.position.set(x, h, -yF); g.scale.setScalar(e); ch.decor.add(g);
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
// LA PEINTURE BLANCHE USÉE de la chaussée (photo 09 : autour de l'arceau, des plaques rongées) : des éclats irréguliers
function texPeintureUsee() {
  return canvasTex(128, 128, (g, w) => {
    const r = alea(31); g.clearRect(0, 0, w, w);
    for (let k = 0; k < 46; k++) {
      const a = r() * 6.3, d = Math.pow(r(), 0.7) * 44;
      g.fillStyle = `rgba(226,226,221,${0.3 + r() * 0.5})`; g.beginPath(); g.ellipse(64 + Math.cos(a) * d, 64 + Math.sin(a) * d * 0.8, 5 + r() * 15, 3 + r() * 9, r() * 3, 0, 7); g.fill();
    }
    g.globalCompositeOperation = 'destination-out';
    for (let k = 0; k < 420; k++) { g.fillStyle = `rgba(0,0,0,${0.3 + r() * 0.7})`; g.fillRect(r() * w, r() * w, 1 + r() * 5, 1 + r() * 3); }
    g.globalCompositeOperation = 'source-over';
  }, null, true, 4);
}
// LE GARDE-CORPS BLANC à barreaudage serré des balcons de l'immeuble d'en face (photo 08) : une tuile = 0,55 m x 1 m
function texGardeCorps() {
  return canvasTex(64, 128, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.fillStyle = '#eeeeea';
    g.fillRect(0, 0, w, 9); g.fillRect(0, h - 7, w, 7);
    for (let x = 2; x < w; x += 13) g.fillRect(x, 0, 7, h);
  }, [1 / 0.55, 1], true, 4);
}
// LA FERRONNERIE des balconnets du n° 4 (photos 15, 16) : barreaux de fonte noire, une frise de volutes sous la main
// courante — une tuile = 0,5 m x 0,95 m
function texFerronnerie() {
  return canvasTex(64, 128, (g, w, h) => {
    g.clearRect(0, 0, w, h); g.fillStyle = '#1a1a1c'; g.strokeStyle = '#1a1a1c';
    g.fillRect(0, 0, w, 7); g.fillRect(0, 26, w, 3); g.fillRect(0, h - 7, w, 7);
    for (let x = 3; x < w; x += 16) g.fillRect(x, 0, 2.2, h);
    g.lineWidth = 2; for (let x = 12; x < w; x += 16) { g.beginPath(); g.arc(x, 16, 5, 0, 7); g.stroke(); }
  }, [1 / 0.5, 1], true, 4);
}
// LE VERRE CANNELÉ DE LA MARQUISE (n° 10, photo 09) : des bandes ambrées, claires et foncées, dans le sens de la pente
function texMarquise() {
  return canvasTex(128, 64, (g, w, h) => {
    g.fillStyle = '#c8a24e'; g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 8) { g.fillStyle = 'rgba(255,236,170,0.55)'; g.fillRect(x, 0, 3, h); g.fillStyle = 'rgba(90,64,20,0.25)'; g.fillRect(x + 5, 0, 2, h); }
  }, null, false, 4);
}
// LA GRILLE DU CANIVEAU (photos 10, 13) : des fentes sombres en travers, serrées — une tuile = 1 m de long
function texGrille() {
  return canvasTex(256, 128, (g, w, h) => {
    g.fillStyle = '#3a3835'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#0f0e0d'; for (let x = 6; x < w; x += 16) g.fillRect(x, 0, 9, h);
  }, [1, 1 / 0.4], false, 4);
}
// LA FONTE DES REGARDS : un quadrillage en relief, sombre
function texFonte() {
  return canvasTex(128, 128, (g, w) => {
    g.fillStyle = '#2e2d2b'; g.fillRect(0, 0, w, w);
    g.fillStyle = '#45433f'; for (let y = 4; y < w; y += 12) for (let x = 4; x < w; x += 12) g.fillRect(x, y, 8, 8);
    g.strokeStyle = '#5a5651'; g.lineWidth = 3; g.beginPath(); g.arc(w / 2, w / 2, w / 2 - 3, 0, 7); g.stroke();
  }, null, false, 4);
}
