// =====================================================================
//  L'ESCALIER EST DE L'ÉCOLE IRIS (crochets de js/carte_ecole.js et de js/ecole_etage1.js)
// =====================================================================
// D'après les photos 24 à 29 de Haythem et leur relevé (09/10 ; cotes tirées de l'ultra grand-angle : ± 0,3 m, ce qui
// est sûr, c'est ce qui mène à quoi). Derrière le mur nord du hall d'entrée, en face de la porte 6, une porte à 1,5
// vantail (le semi-fixe porte l'affiche violette « POINT ÉCOUTE ») ouvre sur le COULOIR EST : lino moucheté clair, mur
// ouest JAUNE et sa plaque directionnelle, plinthes gris foncé, plafond de plâtre à 2,55 m et ses hublots ; à l'est, le
// dégagement devant la cloison vitrée cannelée (le photocopieur derrière), le poteau gris, la niche sous la volée 2. Au
// fond, la porte du vestibule (1,5 vantail aussi) et L'ESCALIER EN U contre le mitoyen est : volée 1 de 9 contremarches
// de 19,4 cm vers l'est, palier intermédiaire à 1,75 m, volée 2 de 9 contremarches vers l'ouest jusqu'au 1er (3,50 m) ;
// marches sombres à nez d'aluminium, plinthe rampante noire, mains courantes NOIRES rondes sur consoles des deux côtés,
// aucun garde-corps à barreaux, murs blancs, la réglette et le bloc de sortie du palier (photos 25, 26). Au 1er, le
// PALIER EST (photos 27 à 29) : le mur du panneau d'étage, le mur d'échiffre ORANGE et son chant gris, la porte du
// couloir du 1er, le renfoncement nord.
//
// LE PLAN (repère de js/carte_ecole.js : x le long de la façade, y vers le fond ; RDC à 0, 1er à 3,50) :
//   la porte du hall                 x 14,70-16,10   y 7,575    vantail 0,92 (auto) + semi-fixe 0,48 « POINT ÉCOUTE »
//   le bureau du photocopieur        x 16,25-19,8    y 5,85-7,5 dans l'angle nord-est du hall, fermé : sa cloison nord
//                                                               est le vitrage cannelé (photo 24), ses murs côté hall
//                                                               sont blancs (les photos 03 et 16 ne voient pas ce coin)
//   le couloir est                   x 14,6-16,2     y 7,575-10,8   mur jaune à l'ouest, plaque directionnelle
//   le dégagement                    x 16,2-19,8     y 7,65-9,0     devant le vitrage ; le poteau gris x 16,2-16,35
//   la niche sous la volée 2         x 16,2-18,3     y 9,15-10,65   tapis noir, interrupteur, la boucle noire
//   la porte du vestibule            x 14,70-16,05   y 10,725   vantail 0,85 (auto) + vantail de 0,50 entrebâillé
//   le vestibule                     x 14,6-16,05    y 10,8-12,45
//   la volée 1 (vers l'est)          x 16,05-18,29   y 10,8-12,45   9 x 19,4 cm, girons de 28 cm, pleine
//   le palier intermédiaire          x 18,29-19,8    y 9,15-12,45   à 1,75 m
//   la volée 2 (vers l'ouest)        x 18,29-16,05   y 9,15-10,65   paillasse ; elle arrive au 1er en x 16,05
//   le mur d'échiffre                y 10,725 (10,65-10,8)          de x 16,05 à 18,29, jusqu'au plafond de la cage
//   au 1er : le palier est           x 13,55-16,05   y 7,0-12,45    le mur du panneau (face est x 14,225) de y 8,6 à
//                                                                  11,1, la porte du couloir en x 13,55 (y 7,12-8,55),
//                                                                  le renfoncement nord x 13,2-14,2 y 11,1-12,45, au
//                                                                  fond la porte de la 106 (B 1.6, fermée) en x 15,2
//            et la bande sud         x 16,05-19,8    y 7,0-9,0      jusqu'à la salle 104 et l'issue de secours
//   au-dessus (IMAGINÉ, rien n'est photographié) : la volée 3 au-dessus de la volée 1 (17,2 cm, palier à 5,05 m), la
//   volée 4 au-dessus de la volée 2, le palier du 2e (6,60 m, x 14,2-16,05 y 9,15-10,65) et sa porte fermée.
//
// LE MONDE SOLIDE comme l'escalier principal (js/carte_ecole.js construireEscalier) : une RAMPE par volée (la pente passe
// par le milieu des marches), une dalle par palier, des boîtes « caméra seule » sous chaque marche ; les murs de la cage
// coupés à 3,50 m (le bas au rez-de-chaussée, le haut dans le groupe de l'étage : chaque étage cuit sa lumière avec ses
// propres murs) ; la dalle de l'étage est percée au-dessus des volées (js/ecole_etage1.js).
//
//   poserEst(ch, { RECT }) -> { zones, zonesHaut, sols, maj }       (le rez-de-chaussée, appelé par la carte)
//   poserPalierEst(ch, { groupe, lampes, matSol, R1 })              (le 1er et au-dessus, appelé par le 1er étage)
import * as THREE from 'three';
import { maille, boiteM } from './ecole_portes.js';
import { canvasTex, detailPhoto } from './kit_decor.js';
import { texPeinture, texAffiche } from './ecole_matieres.js';

// ---- les niveaux ----
const N1 = 3.5;                     // le plancher du 1er étage
const N2 = 6.6;                     // celui du 2e
const H_DALLE = 3.25;               // le dessous de la dalle du 1er (les cloisons du rez-de-chaussée y montent)
const DALLE2 = 6.4;                 // le dessous de la dalle du 2e
const H_CAGE = 9.45;                // le plafond de la cage, au-dessus du palier du 2e
const HC = 2.55;                    // le plafond de plâtre du couloir est et du vestibule (photo 24)
const H1 = N1 + 2.5;                // le plafond du palier est du 1er (photo 27 : ≈ 2,45 à 2,6 m)
// ---- le plan ----
export const EST = {
  xJ: 14.6,                         // l'axe du mur jaune (face est en 14,675)
  yH: 7.575,                        // le mur nord du hall (y 7,5-7,65)
  yS: 9.075,                        // le mur sud de la cage (y 9,0-9,15) ; à son bout ouest, le poteau gris
  yE: 10.725,                       // le mur d'échiffre et la porte du vestibule (y 10,65-10,8)
  yN: 12.525,                       // le mur nord de la cage (y 12,45-12,6)
  xM: 19.8,                         // le nu du mitoyen est
  x0: 16.05,                        // la 1re contremarche de la volée 1, l'arrivée de la volée 2 au 1er
  g: 0.28, n: 9,                    // le giron ; les contremarches d'une volée
};
EST.r1 = N1 / (2 * EST.n);                          // 19,4 cm (photo 25 : 2h + g ≈ 0,67)
EST.r2 = (N2 - N1) / (2 * EST.n);                   // 17,2 cm au-dessus (un étage courant de 3,10 m)
EST.xP = EST.x0 + (EST.n - 1) * EST.g;              // 18,29 : le bord des paliers intermédiaires
EST.hP1 = N1 / 2;                                   // 1,75
EST.hP2 = N1 + (N2 - N1) / 2;                       // 5,05
EST.bN = [EST.yE + 0.075, EST.yN - 0.075];          // la bande nord (volées 1 et 3) : y 10,8-12,45
EST.bS = [EST.yS + 0.075, EST.yE - 0.075];          // la bande sud (volées 2 et 4) : y 9,15-10,65

// les matières du module (créées par poserEst, reprises par poserPalierEst)
let X = null;
let _matSolEtage = null;            // le carrelage du 1er (js/ecole_etage1.js) : le vinyle du palier prend ses cartes

// =====================================================================
//  LES TEXTURES (dessinées : aucun fichier de plus à charger)
// =====================================================================
const rgb = (r, g, b, a = 1) => `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a})`;
function graine(s) {
  let x = s >>> 0 || 1;
  return () => { x ^= x << 13; x >>>= 0; x ^= x >> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; };
}
// UN SOL MOUCHETÉ (le lino clair du rez-de-chaussée, photos 24, 26 ; le vinyle foncé du 1er, photos 27, 28 ; les girons
// des marches, photo 25) : un fond à peine nuageux et des milliers de mouchetures de 2 à 4 mm. Tuile : `tuile` m.
function texMouchete({ fond, taches, n, tuile = 1, w = 512, graineN = 7, nuee = 7 }) {
  const t = canvasTex(w, w, (g, W, H) => {
    const r2 = graine(graineN), [r, gg, b] = fond;
    g.fillStyle = rgb(r, gg, b); g.fillRect(0, 0, W, H);
    for (let k = 0; k < 60; k++) {
      const R = W * (0.05 + r2() * 0.18), x = r2() * W, y = r2() * H, d = (r2() - 0.5) * 2 * nuee;
      for (const [ox, oy] of [[0, 0], [W, 0], [-W, 0], [0, H], [0, -H]]) {
        const gr = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, R);
        gr.addColorStop(0, rgb(r + d, gg + d, b + d, 0.35)); gr.addColorStop(1, rgb(r, gg, b, 0));
        g.fillStyle = gr; g.fillRect(x + ox - R, y + oy - R, 2 * R, 2 * R);
      }
    }
    const px = W / tuile / 1000;                     // pixels par millimètre
    for (let k = 0; k < n; k++) {
      const [c, a] = taches[Math.floor(r2() * taches.length)], s = Math.max(1, (1.5 + r2() * 2.5) * px);
      g.fillStyle = rgb(c[0], c[1], c[2], a); g.fillRect(r2() * W, r2() * H, s, s * (0.6 + r2() * 0.8));
    }
  }, [1 / tuile, 1 / tuile], false, 8);
  return t;
}
// LE TAPIS DE CAOUTCHOUC (la niche, photo 24 ; le palier du 1er, photos 27, 28) : à pastilles en « tôle larmée » —
// des grains oblongs tous les 3 cm, couchés à ±45° en alternance, leur arête claire. Tuile : 0,25 m.
function texTapis(clair = false) {
  return canvasTex(128, 128, (g, w, h) => {
    const b = clair ? 60 : 50, p = 16;
    g.fillStyle = rgb(b, b, b + 2); g.fillRect(0, 0, w, h);
    for (let j = 0; j < h / p; j++) for (let i = 0; i < w / p; i++) {
      const a = ((i + j) % 2 ? 1 : -1) * Math.PI / 4;
      g.save(); g.translate(i * p + p / 2, j * p + p / 2); g.rotate(a);
      g.fillStyle = rgb(b - 16, b - 16, b - 14); g.fillRect(-5, 0.5, 10, 2.5);
      g.fillStyle = rgb(b + 22, b + 22, b + 24); g.fillRect(-5, -2.5, 10, 2.5);
      g.restore();
    }
  }, [4, 4], false, 4);
}
// UN QR CODE FIGURÉ (les affichettes WIFI et POINT ÉCOUTE) : trois repères, des modules au hasard
function qr(g, x, y, s, n) {
  const r2 = graine(n * 31 + 3), m = s / 21;
  g.fillStyle = '#ffffff'; g.fillRect(x - m, y - m, s + 2 * m, s + 2 * m);
  g.fillStyle = '#111111';
  for (let j = 0; j < 21; j++) for (let i = 0; i < 21; i++) if (r2() < 0.45) g.fillRect(x + i * m, y + j * m, m, m);
  for (const [a, b] of [[0, 0], [14, 0], [0, 14]]) {
    g.fillStyle = '#111111'; g.fillRect(x + a * m, y + b * m, 7 * m, 7 * m);
    g.fillStyle = '#ffffff'; g.fillRect(x + (a + 1) * m, y + (b + 1) * m, 5 * m, 5 * m);
    g.fillStyle = '#111111'; g.fillRect(x + (a + 2) * m, y + (b + 2) * m, 3 * m, 3 * m);
  }
}
// LA PLAQUE DIRECTIONNELLE du couloir est (photo 24, sur le mur jaune) : cinq lames bleu ardoise, texte et flèches
// blancs, toutes vers le hall. Lue sur la photo, recoupée avec l'annuaire de la photo 22.
function texDirection() {
  return canvasTex(512, 512, (g, w, h) => {
    const lames = [['Accueil – Réception', ''], ['Salle Tim Berners-Lee', 'B 0.1'], ['Salle David Clark', 'B 0.2'], ['Pause extérieure', ''], ['Direction des Études', '']];
    const lh = h / 5;
    lames.forEach(([t, num], i) => {
      const y = i * lh, gr = g.createLinearGradient(0, y, 0, y + lh);
      gr.addColorStop(0, '#3a5c84'); gr.addColorStop(0.5, '#2c4a6e'); gr.addColorStop(1, '#223b58');
      g.fillStyle = gr; g.fillRect(0, y, w, lh);
      g.fillStyle = '#13202f'; g.fillRect(0, y, w, 4);
      g.fillStyle = '#f3f5f7'; g.font = '600 31px "Segoe UI", Arial, sans-serif'; g.textBaseline = 'middle';
      g.fillText(t, i === 0 ? 70 : 34, y + lh / 2 + 2);
      if (num) { g.font = '700 30px "Segoe UI", Arial, sans-serif'; g.textAlign = 'right'; g.fillText(num, w - 78, y + lh / 2 + 2); g.textAlign = 'left'; }
      // la flèche vers la gauche (le hall)
      g.strokeStyle = '#f3f5f7'; g.lineWidth = 6; g.lineCap = 'round';
      g.beginPath(); g.moveTo(w - 22, y + lh / 2); g.lineTo(w - 58, y + lh / 2); g.moveTo(w - 44, y + lh / 2 - 13); g.lineTo(w - 58, y + lh / 2); g.lineTo(w - 44, y + lh / 2 + 13); g.stroke();
      if (i === 0) { g.fillStyle = '#f3f5f7'; g.beginPath(); g.arc(36, y + lh / 2, 20, 0, 7); g.fill(); g.fillStyle = '#2c4a6e'; g.font = '700 24px "Segoe UI", sans-serif'; g.textAlign = 'center'; g.fillText('i', 36, y + lh / 2 + 2); g.textAlign = 'left'; }
    });
  }, null, false, 4);
}
// LE PANNEAU D'ÉTAGE du palier est (photo 28) : noir mat, bandeau vertical orange cuivré et son « 1 », cinq lignes
export function texPanneauEtageEst() {
  return canvasTex(768, 402, (g, w, h) => {
    g.fillStyle = '#2b2a28'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#b5703f'; g.fillRect(0, 0, 70, h);
    g.fillStyle = '#ffffff'; g.font = '700 74px "Segoe UI", Arial, sans-serif'; g.textBaseline = 'alphabetic'; g.fillText('1', 14, 82);
    const lignes = [['Salle de cours', 'B 1.1'], ['Salle Robert Kahn', 'B 1.4'], ['Salle Gordon Earle Moore', 'B 1.5'], ['Espace pause', ''], ['Salle de cours', 'B 1.6']];
    g.font = '500 40px "Segoe UI", Arial, sans-serif'; g.fillStyle = '#f4f4f2';
    lignes.forEach(([t, num], i) => {
      const y = 70 + i * 74;
      g.textAlign = 'left'; g.fillText(t, 100, y);
      if (num) { g.textAlign = 'right'; g.font = '600 40px "Segoe UI", Arial, sans-serif'; g.fillText(num, w - 34, y); g.font = '500 40px "Segoe UI", Arial, sans-serif'; }
    });
    g.textAlign = 'left';
  }, null, false, 4);
}
// L'AFFICHETTE « WIFI IRIS » (photo 28) : noire, le titre, deux lignes, la carte blanche au QR code
function texWifiIris() {
  return canvasTex(256, 186, (g, w, h) => {
    g.fillStyle = '#1c1c1e'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffffff'; g.font = '700 22px "Segoe UI", Arial, sans-serif'; g.fillText('WIFI IRIS', 14, 34);
    g.fillStyle = '#c9c9cc'; g.font = '13px "Segoe UI", Arial, sans-serif';
    g.fillText('Scanne le code pour', 14, 70); g.fillText('te connecter au réseau', 14, 88); g.fillText('des étudiants', 14, 106);
    g.fillStyle = '#ffffff'; g.fillRect(150, 26, 92, 138);
    qr(g, 160, 54, 72, 5);
    g.fillStyle = '#f08a24'; g.fillRect(14, 150, 40, 6);
  }, null, false, 2);
}
// L'AFFICHE A4 VIOLETTE « POINT ÉCOUTE » (photos 24, 26 sur le semi-fixe du hall, 28 au palier) : bandeaux orange,
// le titre, le texte, deux QR codes en bas
function texPointEcoute() {
  return canvasTex(256, 362, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#5a2b8c'); gr.addColorStop(1, '#3d1d66');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = '#f08a24'; g.fillRect(0, 18, w, 54);
    g.fillStyle = '#ffffff'; g.font = '800 34px "Segoe UI", Arial, sans-serif'; g.textAlign = 'center'; g.fillText('POINT ÉCOUTE', w / 2, 58);
    g.font = '600 17px "Segoe UI", Arial, sans-serif'; g.fillText('Besoin de parler ?', w / 2, 104);
    g.fillStyle = '#e3d6f2'; g.font = '13px "Segoe UI", Arial, sans-serif';
    ['Une psychologue t’écoute,', 'gratuitement et en toute', 'confidentialité, chaque semaine.'].forEach((t, i) => g.fillText(t, w / 2, 128 + i * 18));
    g.fillStyle = '#f08a24'; g.fillRect(28, 196, w - 56, 26);
    g.fillStyle = '#3d1d66'; g.font = '700 15px "Segoe UI", Arial, sans-serif'; g.fillText('PRENDS RENDEZ-VOUS', w / 2, 214);
    g.textAlign = 'left';
    qr(g, 36, 246, 78, 11); qr(g, 142, 246, 78, 12);
    g.fillStyle = '#ffffff'; g.font = '600 18px "Century Gothic", "Segoe UI", sans-serif'; g.fillText('iris', w - 46, h - 10);
  }, null, false, 4);
}
// L'AFFICHE A4 ORANGE ET BLANCHE du semi-fixe de la porte du couloir du 1er (photo 28) : bandeau orange, cartouche noir,
// trois photos, le petit logo orange
function texAfficheOrange() {
  return canvasTex(256, 362, (g, w, h) => {
    g.fillStyle = '#fbfaf6'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ef7d22'; g.fillRect(0, 0, w, 96);
    g.fillStyle = '#ffffff'; g.font = '800 30px "Segoe UI", Arial, sans-serif'; g.fillText('JOURNÉE', 18, 44); g.fillText('ENTREPRISES', 18, 80);
    g.fillStyle = '#1b1b1d'; g.fillRect(18, 112, w - 36, 52);
    g.fillStyle = '#ffffff'; g.font = '600 16px "Segoe UI", Arial, sans-serif'; g.fillText('Stages · alternance · emplois', 30, 144);
    const cols = [['#6c8fb3', '#2f4a66'], ['#c9a27a', '#6d4f36'], ['#8fa88a', '#3f5640']];
    cols.forEach(([a, b], i) => { const d = g.createLinearGradient(0, 180, 0, 260); d.addColorStop(0, a); d.addColorStop(1, b); g.fillStyle = d; g.fillRect(18 + i * 76, 180, 68, 80); g.fillStyle = 'rgba(30,24,20,0.7)'; g.beginPath(); g.arc(52 + i * 76, 262, 20, Math.PI, 0); g.fill(); });
    g.fillStyle = '#7b7b80'; for (let k = 0; k < 4; k++) g.fillRect(18, 282 + k * 14, 150 + (k % 2) * 40, 6);
    g.fillStyle = '#ef7d22'; g.fillRect(w - 58, h - 40, 40, 22);
  }, null, false, 4);
}
// L'AFFICHE VERTICALE DU PALIER INTERMÉDIAIRE (photo 25) : fond blanc, une bande sombre à gauche et son texte vertical,
// des pictogrammes (nuage, oreille, Wi-Fi, mortier, horloge, marche/arrêt), des colonnes de texte, le logo iris en bas
function texAfficheIris() {
  return canvasTex(256, 460, (g, w, h) => {
    g.fillStyle = '#fbfbf8'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#26262b'; g.fillRect(0, 0, 44, h);
    g.save(); g.translate(30, h - 30); g.rotate(-Math.PI / 2); g.fillStyle = '#ffffff'; g.font = '700 22px "Segoe UI", Arial, sans-serif'; g.fillText('LA VIE À L’ÉCOLE', 0, 0); g.restore();
    const pictos = [['#3e7fd0', 'nuage'], ['#e07b2a', 'oreille'], ['#3e9b6b', 'wifi'], ['#26262b', 'mortier'], ['#7b2a6e', 'horloge'], ['#d0262d', 'marche']];
    pictos.forEach(([c, q], i) => {
      const cx = 92 + (i % 2) * 100, cy = 50 + Math.floor(i / 2) * 104;
      g.fillStyle = c; g.strokeStyle = c; g.lineWidth = 5; g.lineCap = 'round';
      if (q === 'nuage') { for (const [dx, dy, r] of [[-14, 4, 13], [0, -6, 17], [15, 4, 12]]) { g.beginPath(); g.arc(cx + dx, cy + dy, r, 0, 7); g.fill(); } }
      else if (q === 'oreille') { g.beginPath(); g.arc(cx, cy - 4, 16, Math.PI * 1.05, Math.PI * 0.35); g.stroke(); }
      else if (q === 'wifi') { for (const r of [8, 18, 28]) { g.beginPath(); g.arc(cx, cy + 14, r, Math.PI * 1.25, Math.PI * 1.75); g.stroke(); } }
      else if (q === 'mortier') { g.beginPath(); g.moveTo(cx - 24, cy - 4); g.lineTo(cx, cy - 16); g.lineTo(cx + 24, cy - 4); g.lineTo(cx, cy + 8); g.closePath(); g.fill(); g.fillRect(cx - 12, cy, 24, 14); }
      else if (q === 'horloge') { g.beginPath(); g.arc(cx, cy, 20, 0, 7); g.stroke(); g.beginPath(); g.moveTo(cx, cy - 12); g.lineTo(cx, cy); g.lineTo(cx + 9, cy + 5); g.stroke(); }
      else { g.beginPath(); g.arc(cx, cy + 2, 18, Math.PI * 1.7, Math.PI * 1.3); g.stroke(); g.beginPath(); g.moveTo(cx, cy - 20); g.lineTo(cx, cy); g.stroke(); }
      g.fillStyle = '#9aa0a6'; g.fillRect(cx - 34, cy + 34, 68, 5); g.fillRect(cx - 26, cy + 44, 52, 5);
    });
    g.fillStyle = '#9aa0a6'; for (let k = 0; k < 6; k++) { g.fillRect(58, 330 + k * 12, 84, 5); g.fillRect(156, 330 + k * 12, 84, 5); }
    g.fillStyle = '#111111'; g.fillRect(150, h - 46, 86, 34);
    g.fillStyle = '#ffffff'; g.font = '600 24px "Century Gothic", "Segoe UI", sans-serif'; g.fillText('iris', 168, h - 20);
    g.fillStyle = '#f08a24'; g.fillRect(169, h - 42, 6, 4);
  }, null, false, 4);
}
// UNE PLAQUE DE SALLE (photo 23 : noire, trois lignes blanches « Salle / nom / B 0.x ») — exportée pour le 1er étage
export function texPlaqueSalle(l1, l2, l3) {
  return canvasTex(256, 154, (g, w, h) => {
    g.fillStyle = '#2a2826'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#f08a24'; g.fillRect(14, 16, 5, h - 32);
    g.fillStyle = '#f4f4f2'; g.font = '500 24px "Segoe UI", Arial, sans-serif'; g.fillText(l1, 32, 44);
    let t = 30; g.font = `600 ${t}px "Segoe UI", Arial, sans-serif`;
    while (g.measureText(l2).width > w - 46 && t > 16) { t--; g.font = `600 ${t}px "Segoe UI", Arial, sans-serif`; }
    g.fillText(l2, 32, 88);
    g.font = '700 30px "Segoe UI", Arial, sans-serif'; g.fillStyle = '#ffffff'; g.fillText(l3, 32, 132);
  }, null, false, 4);
}
// LE VERRE CANNELÉ de la cloison du bureau (photos 24, 26) : des côtes verticales, la lumière du bureau derrière (plus
// claire en haut), et, flous, le photocopieur blanc et gris contre la vitre (pan ouest seulement)
function texCannele(copieur) {
  return canvasTex(256, 576, (g, w, h) => {
    const m = h / 2.35;                              // pixels par mètre (le pan fait 2,35 m de haut)
    const fond = g.createLinearGradient(0, 0, 0, h);
    fond.addColorStop(0, '#cbd6df'); fond.addColorStop(0.45, '#aebbc6'); fond.addColorStop(1, '#8e99a2');
    g.fillStyle = fond; g.fillRect(0, 0, w, h);
    if (copieur) {
      // (vu du couloir, le photocopieur est contre le jambage de la porte du hall : à droite du pan)
      g.filter = 'blur(7px)';
      const y = (z) => h - z * m;                    // z : hauteur au-dessus du bas du pan
      g.fillStyle = 'rgba(70,74,80,0.5)'; g.fillRect(6, y(1.6), 60, 1.6 * m);     // une armoire au fond
      g.fillStyle = '#e8e8e4'; g.fillRect(96, y(1.0), 150, 1.0 * m);           // le corps
      g.fillStyle = '#8d9196'; g.fillRect(96, y(1.12), 150, 0.12 * m);         // le scanner
      g.fillStyle = '#5d6166'; g.fillRect(108, y(0.78), 126, 0.05 * m);       // les bacs
      g.fillStyle = '#6a6e73'; g.fillRect(108, y(0.52), 126, 0.04 * m);
      g.fillStyle = '#3b3e42'; g.fillRect(96, y(0.1), 150, 0.1 * m);
      g.filter = 'none';
    }
    // les côtes : une bande claire et une sombre tous les 1,6 cm
    const pas = w / (1.08 / 0.016);
    for (let x = 0; x < w; x += pas) { g.fillStyle = 'rgba(255,255,255,0.16)'; g.fillRect(x, 0, pas * 0.35, h); g.fillStyle = 'rgba(40,50,60,0.10)'; g.fillRect(x + pas * 0.55, 0, pas * 0.3, h); }
  }, null, false, 4);
}
// LA PETITE PHOTO ENCADRÉE du palier du 1er (photo 28) : sombre et brillante — une ville la nuit
function texPhotoNuit() {
  return canvasTex(128, 154, (g, w, h) => {
    g.fillStyle = '#121214'; g.fillRect(0, 0, w, h);
    const d = g.createLinearGradient(0, 10, 0, h - 10); d.addColorStop(0, '#1f2b45'); d.addColorStop(1, '#0c0f18');
    g.fillStyle = d; g.fillRect(10, 10, w - 20, h - 20);
    const r2 = graine(404);
    for (let k = 0; k < 9; k++) { const x = 14 + k * 11, hh = 30 + r2() * 70; g.fillStyle = '#0a0c12'; g.fillRect(x, h - 10 - hh, 10, hh); for (let j = 0; j < 6; j++) if (r2() < 0.5) { g.fillStyle = 'rgba(255,214,140,0.9)'; g.fillRect(x + 2 + (j % 2) * 4, h - 16 - hh * r2(), 2, 2); } }
  }, null, false, 2);
}

// =====================================================================
//  LES MATIÈRES
// =====================================================================
function matieresEst() {
  const std = (o, nom) => { const m = new THREE.MeshStandardMaterial(o); m.name = nom; return m; };
  const P = {
    // le mur jaune du couloir est (photo 24 : à peine plus orangé que le safran de la salle d'attente) ; l'orange du
    // mur d'échiffre au 1er (photo 28 : plus soutenu)
    jaune: std({ map: texPeinture(0xe9a03a, 4), roughness: 0.62 }, 'peinture jaune (couloir est)'),
    orange: std({ map: texPeinture(0xd9782a, 4), roughness: 0.62, side: THREE.DoubleSide }, 'peinture orange (échiffre)'),
    plinthe: std({ color: 0x5a534b, roughness: 0.5 }, 'plinthe gris foncé'),
    poteau: std({ color: 0x8a8580, roughness: 0.62 }, 'poteau gris'),
    lino: std({ map: texMouchete({ fond: [158, 152, 143], taches: [[[214, 210, 202], 0.9], [[80, 76, 70], 0.85], [[128, 122, 113], 0.7]], n: 9000, graineN: 11 }), roughness: 0.38 }, 'lino moucheté clair'),
    vinyle: std({ map: texMouchete({ fond: [86, 79, 70], taches: [[[132, 124, 110], 0.85], [[52, 47, 41], 0.85], [[160, 153, 140], 0.5]], n: 8000, graineN: 13 }), roughness: 0.55 }, 'vinyle moucheté du 1er'),
    giron: std({ map: texMouchete({ fond: [64, 63, 61], taches: [[[112, 110, 106], 0.75], [[40, 39, 37], 0.8]], n: 5000, tuile: 0.5, w: 256, graineN: 17, nuee: 4 }), roughness: 0.66 }, 'giron moucheté'),
    // (le béton peint des volées et des paliers : vu d'en dessous, il ne reçoit que le rebond — sur la photo 25, la
    // sous-face au-dessus de la volée 1 est presque aussi claire que les murs : un léger émissif, comme les plafonds)
    beton: std({ color: 0xe9e6e0, roughness: 0.88, emissive: 0xd8d4cc, emissiveIntensity: 0.22 }, 'béton peint (escalier est)'),
    contremarche: std({ color: 0x151311, roughness: 0.7 }, 'contremarche noire'),
    nez: std({ color: 0x9a9894, roughness: 0.32, metalness: 0.75 }, 'nez de marche aluminium'),
    bande: std({ color: 0x454443, roughness: 0.92 }, 'bande antidérapante'),
    limon: std({ color: 0x1b1918, roughness: 0.55, side: THREE.DoubleSide }, 'plinthe rampante noire'),
    rail: std({ color: 0x1e1c1a, roughness: 0.36, metalness: 0.35 }, 'main courante noire'),
    taupe: std({ color: 0x9d978f, roughness: 0.45 }, 'vantail gris taupe'),
    bois: std({ color: 0xe4dccb, roughness: 0.5 }, 'huisserie de bois crème'),
    cadre: std({ color: 0xeeece6, roughness: 0.4 }, 'cadre de la cloison vitrée'),
    tapis: std({ map: texTapis(), roughness: 0.85 }, 'tapis strié noir'),
    tapis1: std({ map: texTapis(true), roughness: 0.9 }, 'tapis strié du 1er'),
    reglette: std({ color: 0xf2f1ed, roughness: 0.4 }, 'réglette'),
    diffuseur: new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffe4b8).multiplyScalar(2.4) }),
    embout: std({ color: 0xe8701e, roughness: 0.5, emissive: 0xe8701e, emissiveIntensity: 0.5 }, 'embout de réglette'),
  };
  P.diffuseur.name = 'diffuseur de réglette allumé';
  P.voyant = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x3bd16f).multiplyScalar(1.6) }); P.voyant.name = 'voyant vert';
  // (les vitres cannelées : opaques ici, éclairées par derrière — le bureau est allumé)
  for (const k of [1, 2]) {
    const t = texCannele(k === 1);
    P['cannele' + k] = std({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.16, roughness: 0.25, metalness: 0.05 }, 'verre cannelé ' + k);
  }
  for (const m of [P.jaune, P.orange]) detailPhoto(m, 'beton', 1, 1, { relief: 0.035, grain: 0, rugo: false });
  // (le lino clair : sa lumière cuite est celle du carrelage du rez-de-chaussée, moins forte — il renvoie plus)
  P.lino.lightMapIntensity = 0.6;
  // (relecture du 09/10 : mesuré sur la photo 24, le lino rend 0,62 du mur blanc voisin, et 1,0 dans le jeu — il
  // sortait presque blanc : un voile plus sombre sur sa texture)
  P.lino.color.setScalar(0.76);
  P.vinyle.lightMapIntensity = 0.8;
  return P;
}
const matPanneau = (tex, rugo = 0.45) => new THREE.MeshStandardMaterial({ map: tex, roughness: rugo });

// =====================================================================
//  LES OUTILS (coordonnées du PLAN, hauteurs absolues, posés dans `parent`)
// =====================================================================
const B = (ch, parent, x0, y0, x1, y1, h0, h1, mat, o = {}) => ch.boite(Math.min(x0, x1), Math.min(y0, y1), Math.max(x0, x1), Math.max(y0, y1), h0, h1, mat, { ...o, parent });

// UN MUR de (x0, y0) à (x1, y1), parallèle à un axe, de `base` à `h` : comme ch.mur (js/carte_ecole.js), mais posé
// dans `parent` et avec des plinthes GRIS FONCÉ (photos 24, 28 : pas de bois dans cette partie) posées sur `base`.
// `plinthes` : les faces ('N', 'S', 'E', 'W'), ou [face, matière]. Le monde solide reçoit les mêmes morceaux pleins.
function mur(ch, parent, { de, a, ep = 0.15, base = 0, h = H_DALLE, mats, plinthes = [], ouvertures = [], camera = true }) {
  const { C, M } = ch, [x0, y0] = de, [x1, y1] = a;
  const axeX = Math.abs(x1 - x0) >= Math.abs(y1 - y0);
  const debut = axeX ? Math.min(x0, x1) : Math.min(y0, y1), fin = axeX ? Math.max(x0, x1) : Math.max(y0, y1);
  const ligne = axeX ? y0 : x0;
  const ouv = ouvertures.map((o) => ({ a0: Math.max(debut, o.c - o.l / 2), a1: Math.min(fin, o.c + o.l / 2), bas: o.bas ?? base, haut: Math.min(h, o.h ?? base + 2.1) })).sort((p, q) => p.a0 - q.a0);
  const pleins = [];
  let a0 = debut;
  for (const o of ouv) {
    if (o.a0 > a0 + 1e-3) pleins.push({ a0, a1: o.a0, y0: base, y1: h });
    if (o.haut < h - 1e-3) pleins.push({ a0: o.a0, a1: o.a1, y0: o.haut, y1: h });
    if (o.bas > base + 1e-3) pleins.push({ a0: o.a0, a1: o.a1, y0: base, y1: o.bas });
    a0 = Math.max(a0, o.a1);
  }
  if (fin > a0 + 1e-3) pleins.push({ a0, a1: fin, y0: base, y1: h });
  const cotes = axeX ? ['N', 'S'] : ['E', 'W'];
  const mat = (c) => (mats && mats.isMaterial ? mats : (mats && mats[c]) || M.blanc);
  const deux = mat(cotes[0]) !== mat(cotes[1]);
  for (const p of pleins) {
    const R = (v0, v1) => (axeX ? [p.a0, ligne + v0, p.a1, ligne + v1] : [ligne + v0, p.a0, ligne + v1, p.a1]);
    const [bx0, by0, bx1, by1] = R(-ep / 2, ep / 2);
    C.ajouterBoite(bx0, -by0, bx1, -by1, { y0: p.y0, y1: p.y1, camera });
    if (!deux) B(ch, parent, bx0, by0, bx1, by1, p.y0, p.y1, mat(cotes[0]), { ombre: false });
    else {
      const [ax0, ay0, ax1, ay1] = R(0, ep / 2), [cx0, cy0, cx1, cy1] = R(-ep / 2, 0);
      B(ch, parent, ax0, ay0, ax1, ay1, p.y0, p.y1, mat(cotes[0]), { ombre: false });
      B(ch, parent, cx0, cy0, cx1, cy1, p.y0, p.y1, mat(cotes[1]), { ombre: false });
    }
    if (p.y0 <= base + 0.001) {
      for (const pl of plinthes) {
        const [c, m] = Array.isArray(pl) ? pl : [pl, X.plinthe];
        const s = c === cotes[0] ? 1 : -1, v = s * (ep / 2 + 0.0075);
        const [px0, py0, px1, py1] = R(v - 0.0075, v + 0.0075);
        B(ch, parent, px0, py0, px1, py1, base, base + 0.08, m, { ombre: false });
      }
    }
  }
}

// L'HUISSERIE DE BOIS CRÈME et son CHAMBRANLE MOULURÉ (photos 24, 26) autour d'une ouverture de a0 à a1 (le long du mur
// `axe` 'x' : est-ouest en y = ligne ; 'y' : nord-sud en x = ligne), de `base` à `base + hL`. `faces` : pour chaque face
// (+1 / -1 : côté +y ou -y du plan pour un mur 'x', +x ou -x pour un mur 'y'), les jambages à poser [gauche, droite]
// (un mur ou une marche en retour prend parfois la place d'un jambage).
function chambranle(ch, parent, axe, ligne, a0, a1, base, hL, ep, faces = { 1: [true, true], [-1]: [true, true] }) {
  const m = X.bois, e2 = ep / 2 + 0.008;
  const bx = (u0, u1, v0, v1, h0, h1) => (axe === 'x' ? B(ch, parent, u0, ligne + v0, u1, ligne + v1, h0, h1, m) : B(ch, parent, ligne + v0, u0, ligne + v1, u1, h0, h1, m));
  bx(a0 - 0.04, a0, -e2, e2, base, base + hL + 0.04);
  bx(a1, a1 + 0.04, -e2, e2, base, base + hL + 0.04);
  bx(a0 - 0.04, a1 + 0.04, -e2, e2, base + hL, base + hL + 0.04);
  for (const s of [1, -1]) {
    const [g, d] = faces[s] || [false, false], v0 = s * e2, v1 = s * (e2 + 0.016);
    const [va, vb] = [Math.min(v0, v1), Math.max(v0, v1)];
    if (g) bx(a0 - 0.11, a0 - 0.04, va, vb, base, base + hL + 0.11);
    if (d) bx(a1 + 0.04, a1 + 0.11, va, vb, base, base + hL + 0.11);
    bx(a0 - (g ? 0.11 : 0.04), a1 + (d ? 0.11 : 0.04), va, vb, base + hL + 0.04, base + hL + 0.11);
    // la moulure : un jonc de 1 cm au bord intérieur du chambranle
    const v2 = s * (e2 + 0.024), [vc, vd] = [Math.min(v1, v2), Math.max(v1, v2)];
    if (g) bx(a0 - 0.065, a0 - 0.05, vc, vd, base, base + hL + 0.065);
    if (d) bx(a1 + 0.05, a1 + 0.065, vc, vd, base, base + hL + 0.065);
    bx(a0 - (g ? 0.065 : 0.04), a1 + (d ? 0.065 : 0.04), vc, vd, base + hL + 0.05, base + hL + 0.065);
  }
}

// LA RÉGLETTE FLUORESCENTE MURALE (photos 25, 28) : un tube T8 sous un diffuseur blanc, embouts orange, posée à plat
// contre un mur nord-sud (`face` 'E' ou 'W' : le côté où elle regarde), de y0 à y1, à la hauteur h
function reglette(ch, parent, x, y0, y1, h, face) {
  const s = face === 'E' ? 1 : -1, xa = x, xb = x + s * 0.085;
  B(ch, parent, xa, y0, xb, y1, h - 0.03, h + 0.04, X.reglette, { ombre: false });
  B(ch, parent, x + s * 0.012, y0 + 0.03, x + s * 0.092, y1 - 0.03, h - 0.045, h - 0.03, X.diffuseur, { ombre: false });
  B(ch, parent, x + s * 0.085, y0 + 0.03, x + s * 0.092, y1 - 0.03, h - 0.03, h + 0.03, X.diffuseur, { ombre: false });
  for (const [a, b] of [[y0, y0 + 0.03], [y1 - 0.03, y1]]) B(ch, parent, xa, a, x + s * 0.095, b, h - 0.05, h + 0.045, X.embout, { ombre: false });
  parent.children.slice(-5).forEach((o) => { o.userData.horsAOSol = true; });
}

// UNE MAIN COURANTE NOIRE (photos 25, 26, 28) : un tube rond de 38 mm qui suit `pts` ([x, y, h] du plan), ses angles
// arrondis ; posée sur des consoles noires en crosse à platine ronde (`consoles` : [[x, y, h, face du mur]], le mur à
// `ecart` du centre du tube).
function mainCourante(ch, parent, pts, consoles, ecart = 0.079) {
  const V = pts.map(([x, y, h]) => new THREE.Vector3(x, h, -y));
  const chemin = new THREE.CurvePath();
  let prec = V[0].clone();
  for (let i = 1; i < V.length; i++) {
    const P = V[i];
    if (i === V.length - 1) { chemin.add(new THREE.LineCurve3(prec, P.clone())); break; }
    const u = P.clone().sub(V[i - 1]), w = V[i + 1].clone().sub(P), d = Math.min(0.09, u.length() / 2, w.length() / 2);
    const A = P.clone().addScaledVector(u.normalize(), -d), Bp = P.clone().addScaledVector(w.normalize(), d);
    if (A.distanceTo(prec) > 1e-4) chemin.add(new THREE.LineCurve3(prec, A));
    chemin.add(new THREE.QuadraticBezierCurve3(A, P.clone(), Bp));
    prec = Bp;
  }
  const L = chemin.getLength();
  const tube = maille(new THREE.TubeGeometry(chemin, Math.max(8, Math.ceil(L * 14)), 0.019, 10, false), X.rail, 0, 0, 0, 0, parent);
  tube.castShadow = true;
  // les deux bouts fermés
  for (const p of [V[0], V[V.length - 1]]) maille(new THREE.SphereGeometry(0.019, 10, 6), X.rail, p.x, p.y, p.z, 0, parent, { ombre: false });
  for (const [x, y, h, face] of consoles) {
    const [dx, dy] = { N: [0, 1], S: [0, -1], E: [1, 0], W: [-1, 0] }[face];
    // la crosse : une tige qui descend sous le tube puis file au mur ; la platine ronde au mur
    B(ch, parent, x - 0.006, y - 0.006, x + 0.006, y + 0.006, h - 0.065, h - 0.01, X.rail, { ombre: false });
    const xa = x, ya = y, xb = x + dx * ecart, yb = y + dy * ecart;
    B(ch, parent, Math.min(xa, xb) - 0.006, Math.min(ya, yb) - 0.006, Math.max(xa, xb) + 0.006, Math.max(ya, yb) + 0.006, h - 0.072, h - 0.06, X.rail, { ombre: false });
    const pl = maille(new THREE.CylinderGeometry(0.03, 0.03, 0.008, 16), X.rail, xb - dx * 0.004, h - 0.066, -(yb - dy * 0.004), 0, parent, { ombre: false });
    if (dx) pl.rotation.z = Math.PI / 2; else pl.rotation.x = Math.PI / 2;
  }
}

// LA PLINTHE RAMPANTE NOIRE (photos 25, 26) : au pied du mur, une bande de 13 cm qui suit la ligne des nez et descend
// en dents de scie sur les marches. Sur le mur de face `y` (plan), une volée de `x0` dans le sens `sens`.
function limon(ch, parent, { x0, sens, y, b, n, r, g, cote }) {
  const xs = (s) => x0 + sens * s, hn = (s) => b + r + s * r / g + 0.13;
  const sh = new THREE.Shape(), fin = (n - 1) * g;
  sh.moveTo(xs(-0.05), b);
  sh.lineTo(xs(0), b);
  for (let i = 0; i < n - 1; i++) { sh.lineTo(xs(i * g), b + (i + 1) * r); sh.lineTo(xs((i + 1) * g), b + (i + 1) * r); }
  sh.lineTo(xs(fin), b + n * r); sh.lineTo(xs(fin + 0.05), b + n * r);
  sh.lineTo(xs(fin + 0.05), hn(fin + 0.05)); sh.lineTo(xs(-0.05), hn(-0.05));
  const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), X.limon);
  m.position.z = -y + cote * 0.004; m.castShadow = false; m.receiveShadow = true;
  parent.add(m);
}

// UN NEZ DE MARCHE : la cornière d'aluminium (son aile sur la contremarche) et la bande antidérapante noire, à l'arête
// `a` (plan) d'une marche dont le dessus est à `h`, la volée montant vers `sens`
function nez(ch, parent, a, sens, y0, y1, h) {
  B(ch, parent, a, y0, a + sens * 0.02, y1, h, h + 0.003, X.nez, { ombre: false });
  B(ch, parent, a + sens * 0.02, y0, a + sens * 0.056, y1, h, h + 0.002, X.bande, { ombre: false });
  B(ch, parent, a - sens * 0.009, y0, a - sens * 0.006, y1, h - 0.032, h + 0.003, X.nez, { ombre: false });
}

// UNE VOLÉE DROITE est-ouest (photos 25, 26) : `n` contremarches de `r`, girons de `g`, la première contremarche en `x0`,
// montant vers l'est (sens +1) ou l'ouest (-1), entre y0 et y1 (plan), à partir du niveau `b`. `pleine` : maçonnée
// jusqu'au sol ; sinon une paillasse de béton dont on voit la sous-face. `sous` : le sol sous une paillasse (le joueur
// ne se glisse pas là où elle descend sous 1,95 m). Rend la hauteur de sa sous-face (s le long de la volée).
function volee(ch, parent, { x0, sens, y0, y1, b, n, r, g, pleine = false, sous = null }) {
  const { C, M } = ch, L = y1 - y0, xs = (s) => x0 + sens * s;
  let p;
  if (pleine) {
    p = [[0, 0], [0, b + r]];
    for (let i = 1; i < n - 1; i++) p.push([i * g, b + i * r], [i * g, b + (i + 1) * r]);
    p.push([(n - 1) * g, b + (n - 1) * r], [(n - 1) * g, 0]);
  } else {
    p = [[0, b]];
    for (let i = 0; i < n - 1; i++) p.push([i * g, b + (i + 1) * r], [(i + 1) * g, b + (i + 1) * r]);
    p.push([(n - 1) * g, b + (n - 1) * r - 0.3], [0, b - 0.25]);
  }
  const sh = new THREE.Shape(); p.forEach(([s, h], i) => (i ? sh.lineTo(s, h) : sh.moveTo(s, h)));
  maille(new THREE.ExtrudeGeometry(sh, { depth: L, bevelEnabled: false }), X.beton, x0, 0, sens > 0 ? -y1 : -y0, sens > 0 ? 0 : Math.PI, parent);
  const sof = (s) => b - 0.25 + s * ((b + (n - 1) * r - 0.3) - (b - 0.25)) / ((n - 1) * g);
  // les marches : le giron moucheté, le nez ; les contremarches noires (un parement de 6 mm devant le béton)
  for (let i = 0; i < n - 1; i++) {
    const h = b + (i + 1) * r;
    B(ch, parent, xs(i * g), y0, xs((i + 1) * g), y1, h, h + 0.012, X.giron);
    nez(ch, parent, xs(i * g), sens, y0, y1, h + 0.012);
  }
  nez(ch, parent, xs((n - 1) * g), sens, y0, y1, b + n * r);
  for (let i = 0; i < n; i++) B(ch, parent, xs(i * g) - sens * 0.006, y0, xs(i * g), y1, b + i * r, b + (i + 1) * r - 0.002, X.contremarche, { ombre: false });
  // LE MONDE SOLIDE : la rampe (de la mi-marche du bas à celle du haut), la caméra arrêtée sous chaque marche
  const a0 = x0 - sens * g / 2, a1 = x0 + sens * ((n - 1) * g + g / 2);
  C.rampe(Math.min(a0, a1), -y1, Math.max(a0, a1), -y0, 'x', a0, b, a1, b + n * r);
  for (let i = 0; i < n - 1; i++) {
    const xa = xs(i * g), xb = xs((i + 1) * g);
    C.ajouterBoite(Math.min(xa, xb), -y0, Math.max(xa, xb), -y1, { y0: pleine ? 0 : sof((i + 0.5) * g), y1: b + (i + 1) * r, joueur: false });
  }
  if (!pleine && sous !== null) {
    const sB = Math.min((n - 1) * g, (sous + 1.95 - (b - 0.25)) / ((sof(1) - sof(0))));
    if (sB > 0) C.ajouterBoite(Math.min(xs(0), xs(sB)), -y0, Math.max(xs(0), xs(sB)), -y1, { y0: sous, y1: sous + 1.95 });
  }
  return sof;
}

// LE SOL D'UN NIVEAU : des rectangles du plan à la hauteur `h`, UV en mètres, uv1 sur le rectangle `R` de la lumière
// cuite (v = 1 au nord) — comme geoSol de js/carte_ecole.js
function geoDalles(rects, h, R) {
  const pos = [], nor = [], uv = [], uv1 = [], idx = [], W = R.x1 - R.x0, L = R.y1 - R.y0;
  for (const [x0, y0, x1, y1] of rects) {
    const b = pos.length / 3;
    for (const [x, y] of [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]) { pos.push(x, h, -y); nor.push(0, 1, 0); uv.push(x, y); uv1.push((x - R.x0) / W, (y - R.y0) / L); }
    idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute('uv1', new THREE.Float32BufferAttribute(uv1, 2));
  g.setIndex(idx);
  return g;
}
// (zone de lumière en monde : [x0, z0, x1, z1, hauteur mini])
const zr = (x0, y0, x1, y1, hmin = -1) => [x0, -y1, x1, -y0, hmin];

// =====================================================================
//  LE REZ-DE-CHAUSSÉE (crochet de js/carte_ecole.js)
// =====================================================================
export function poserEst(ch, { RECT }) {
  const { C, M } = ch, D = ch.decor;
  X = matieresEst();
  const E = EST, B0 = M.blanc;

  // ---- LE SOL : le lino moucheté clair, du seuil de la porte du hall au fond de la cage (photos 24, 26) ----
  // (le carrelage du rez-de-chaussée s'arrête au mur du hall et au mur jaune : js/carte_ecole.js RN)
  const lino = new THREE.Mesh(geoDalles([[E.xJ, E.yH, E.xM + 0.3, 12.45]], 0, RECT), X.lino);
  lino.receiveShadow = true; lino.name = 'lino du couloir est'; lino.userData.nofuse = true;
  ch.scene.add(lino);

  // =====================================================================
  //  LE HALL : LA PORTE À 1,5 VANTAIL, LA CLOISON VITRÉE, LE BUREAU (photos 24, 26)
  // =====================================================================
  // (le mur nord du hall, percé de x 14,70 à 16,10 : js/carte_ecole.js) — l'huisserie de bois crème ; le vantail de
  // 0,92 m à l'ouest (gonds à l'ouest, oculus cerclé de bois) s'ouvre tout seul ; le semi-fixe de 0,48 m à l'est, fermé,
  // porte l'affiche violette « POINT ÉCOUTE » côté couloir. (Au jambage ouest, côté couloir, le mur jaune prend la place
  // du chambranle.)
  chambranle(ch, D, 'x', E.yH, 14.70, 16.10, 0, 2.06, 0.15, { 1: [false, true], [-1]: [true, true] });
  ch.porte('x', E.yH, 15.16, { l: 0.92, h: 2.06, modele: 'grise', etat: 'auto', cote: 'S', huisserie: false, oculus: 'long', matVantail: X.taupe, nom: 'couloir est (hall)' });
  ch.porte('x', E.yH, 15.86, { l: 0.48, h: 2.06, modele: 'grise', etat: 'fermee', cote: 'N', huisserie: false, oculus: false, poignee: null, fermePorte: false, matVantail: X.taupe, nom: 'couloir est (semi-fixe)' });
  ch.panneau(matPanneau(texPointEcoute(), 0.6), 0.21, 0.297, 15.85, E.yH + 0.068, 1.6, 'N');
  ch.sortie(15.4, E.yH + 0.1, 2.33, 'N');
  // LA CLOISON VITRÉE CANNELÉE (photos 24, 26) : du jambage est de la porte jusqu'au mitoyen, dans le plan du mur du hall —
  // cadre blanc, deux pans de verre cannelé jusqu'à 2,45 m (le bureau allumé derrière, le photocopieur contre la vitre),
  // la porte du bureau (fermée) au bout du dégagement, la cloison pleine au-dessus
  const yv = E.yH;
  for (const x of [16.25, 17.4, 18.55]) B(ch, D, x, yv - 0.035, x + 0.05, yv + 0.035, 0, 2.46, X.cadre, { ombre: false });
  B(ch, D, 16.25, yv - 0.035, 18.6, yv + 0.035, 0, 0.05, X.cadre, { ombre: false });
  B(ch, D, 16.25, yv - 0.035, 18.6, yv + 0.035, 2.4, 2.46, X.cadre, { ombre: false });
  for (const [xc, mat] of [[16.85, X.cannele1], [18.0, X.cannele2]]) for (const f of ['N', 'S']) ch.panneau(mat, 1.1, 2.35, xc, yv + (f === 'N' ? 0.006 : -0.006), 1.225, f);
  B(ch, D, 16.25, yv - 0.075, 18.6, yv + 0.075, 2.46, H_DALLE, B0, { ombre: false });
  C.ajouterBoite(16.25, -(yv - 0.075), 18.6, -(yv + 0.075), { y1: H_DALLE });
  // (la feuille A4 scotchée côté couloir, photo 24)
  ch.panneau(matPanneau(texAffiche('#e8e6df', '#f4f3ee', 90), 0.8), 0.21, 0.297, 16.62, yv + 0.006, 1.55, 'N');
  mur(ch, D, { de: [18.6, yv], a: [E.xM, yv], mats: B0, plinthes: ['N'], ouvertures: [{ c: 19.08, l: 0.93, h: 2.04 }] });
  ch.porte('x', yv, 19.08, { l: 0.93, h: 2.04, modele: 'grise', etat: 'fermee', cote: 'N', oculus: false, matVantail: X.taupe, nom: 'bureau du photocopieur' });
  // LE BUREAU, côté hall : ses deux murs blancs (plinthes de bois, comme tout le hall) dans l'angle nord-est — le hall
  // garde le comptoir, ses spots et tout ce que montrent les photos 03 et 16
  mur(ch, D, { de: [16.325, 5.85], a: [16.325, 7.5], mats: B0, plinthes: [['W', M.bois]] });
  mur(ch, D, { de: [16.25, 5.85], a: [E.xM, 5.85], ep: 0.12, mats: B0, plinthes: [['S', M.bois]] });
  // deux affiches encadrées côté hall (le planning des formations, les entreprises partenaires)
  ch.panneau(matPanneau(texAffiche('#2b4c9b', '#fbfbf8', 91), 0.5), 0.6, 0.85, 17.3, 5.781, 1.55, 'S');
  ch.panneau(matPanneau(texAffiche('#e07b2a', '#fbfbf8', 92), 0.5), 0.6, 0.85, 18.6, 5.781, 1.55, 'S');
  for (const x of [17.3, 18.6]) B(ch, D, x - 0.32, 5.783, x + 0.32, 5.79, 1.105, 1.995, M.aluGris, { ombre: false });

  // =====================================================================
  //  LE COULOIR EST (photo 24)
  // =====================================================================
  // LE MUR JAUNE à l'ouest (de la porte du hall à celle du vestibule), plinthe gris foncé ; puis le mur du vestibule
  mur(ch, D, { de: [E.xJ, 7.65], a: [E.xJ, 10.65], mats: { E: X.jaune, W: B0 }, plinthes: ['E'] });
  mur(ch, D, { de: [E.xJ, 10.8], a: [E.xJ, 12.45], mats: B0, plinthes: ['E'] });
  // LA PLAQUE DIRECTIONNELLE bleu ardoise (40 x 40 cm, centre à 1,55 m, vers y 8,65)
  B(ch, D, 14.675, 8.44, 14.69, 8.86, 1.34, 1.76, M.noirMat, { ombre: false });
  ch.panneau(matPanneau(texDirection(), 0.35), 0.4, 0.4, 14.692, 8.65, 1.55, 'E');
  // le bloc de sortie en drapeau sur le mur jaune, près de la porte du vestibule (photo 24, en haut à droite)
  ch.sortie(14.9, 10.5, 2.41, 'S');
  // LE POTEAU GRIS (x 16,2-16,35, y 9,0-9,15) : l'angle du bloc de l'escalier, peint, éraflé ; son butoir noir
  B(ch, D, 16.2, 9.0, 16.35, 9.15, 0, N1, X.poteau, { collision: true });
  B(ch, D, E.x0, 9.0, 16.2, 9.15, HC, N1, B0, { ombre: false });       // (au-dessus du plafond, vu de la volée 2)
  B(ch, D, 16.19, 8.99, 16.36, 9.16, 0, 0.08, X.plinthe, { ombre: false });
  const butoir = maille(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 12), M.noirMat, 16.31, 0.8, -(9.15 + 0.015), 0, D, { ombre: false });
  butoir.rotation.x = Math.PI / 2;
  // LE MUR SUD DE LA CAGE (y 9,0-9,15) : côté dégagement, côté niche ; jusqu'au plancher du 1er
  mur(ch, D, { de: [16.35, E.yS], a: [E.xM, E.yS], h: N1, mats: B0, plinthes: ['S'] });
  B(ch, D, 16.35, 9.15, E.xP, 9.165, 0, 0.08, X.plinthe, { ombre: false });
  // LA NICHE sous la volée 2 : le tapis de caoutchouc strié, l'interrupteur, le cadre de fer plat noir (27 x 40 cm, de
  // 0,5 à 0,95 m) qui pivote sur un gond rond à son bord est, à quelques centimètres du mur — son ombre s'y colle
  B(ch, D, 16.3, 9.17, 17.6, 10.63, 0, 0.008, X.tapis, { ombre: false });
  B(ch, D, 16.4, 9.15, 16.48, 9.162, 1.03, 1.11, M.boitier, { ombre: false });
  B(ch, D, 16.425, 9.162, 16.455, 9.17, 1.05, 1.09, M.boitier, { ombre: false });
  for (const [xa, xb, ha, hb] of [[16.6, 16.87, 0.93, 0.95], [16.6, 16.87, 0.5, 0.52], [16.6, 16.62, 0.5, 0.95], [16.85, 16.87, 0.5, 0.95]]) B(ch, D, xa, 9.205, xb, 9.212, ha, hb, M.acierNoir);
  maille(new THREE.CylinderGeometry(0.026, 0.026, 0.07, 14), M.acierNoir, 16.89, 0.92, -9.2, 0, D);
  B(ch, D, 16.88, 9.15, 16.9, 9.2, 0.6, 0.95, M.acierNoir);
  C.ajouterBoite(16.58, -9.15, 16.93, -9.24, { y1: 0.96 });
  // LES PLAFONDS de plâtre à 2,55 m : le couloir, le dégagement, le bord de la niche (la sous-face de la volée 2 descend
  // ensuite vers l'est) ; le détecteur de fumée ; les deux hublots ronds (comme ceux du C05, photo 05)
  ch.plafond(14.675, 7.65, 16.2, 10.65, HC, 'platre');
  ch.plafond(16.2, 7.65, E.xM, 9.0, HC, 'platre');
  ch.plafond(16.2, 9.15, 16.73, 10.65, HC, 'platre', { retombees: false });
  const det = maille(new THREE.CylinderGeometry(0.055, 0.06, 0.035, 20), M.boitier, 15.9, HC - 0.018, -9.0, 0, D, { ombre: false });
  det.userData.horsAOSol = true;
  ch.opale(15.4, 8.3, HC, 'couloirEst', { r: 0.19 });
  ch.opale(15.4, 9.75, HC, 'couloirEst', { r: 0.19 });
  ch.opale(18.0, 8.3, HC, 'couloirEst', { r: 0.19 });             // (le dégagement : non vu, mais il n'est pas noir)

  // =====================================================================
  //  LA PORTE DU VESTIBULE ET LE VESTIBULE (photos 24 à 26)
  // =====================================================================
  // 1,5 vantail dans la ligne du mur d'échiffre : le vantail ouest (0,85 m, oculus cerclé de bois, bâton de tirage inox,
  // étiquette rouge) s'ouvre tout seul ; le vantail est (0,50 m, lisse) reste entrebâillé vers l'escalier (photo 26)
  mur(ch, D, { de: [14.525, E.yE], a: [E.x0, E.yE], mats: B0, ouvertures: [{ c: 15.375, l: 1.35, h: 2.1 }] });
  // (côté vestibule, le jambage est descend jusqu'au sol : le bout de la 1re marche bute dessus, photo 26)
  chambranle(ch, D, 'x', E.yE, 14.70, E.x0, 0, 2.06, 0.15, { 1: [false, true], [-1]: [false, true] });
  ch.porte('x', E.yE, 15.125, { l: 0.85, h: 2.06, modele: 'grise', etat: 'auto', cote: 'S', huisserie: false, oculus: 'long', poignee: 'tirant', feu: true, matVantail: X.taupe, nom: 'vestibule est' });
  // (relecture du 09/10, photo 26 : le petit vantail n'est qu'ENTREBÂILLÉ — une quinzaine de degrés ; ouvert à 70°, il
  // cachait le couloir et la cloison vitrée qu'on voit par la porte. Sa face côté vestibule est lisse : pas de ferme-porte)
  ch.porte('x', E.yE, 15.8, { l: 0.5, h: 2.06, modele: 'grise', etat: 'ouverte', angle: 0.28, cote: 'N', charniere: 'd', huisserie: false, oculus: false, poignee: null, fermePorte: false, matVantail: X.taupe, nom: 'vestibule est (petit vantail)' });
  ch.sortie(15.85, E.yE + 0.12, 2.33, 'N');
  // le mur nord du vestibule (et de la cage) : une porte fermée vers le reste du quart nord-est, jamais vu
  mur(ch, D, { de: [13.65, E.yN], a: [E.xM, E.yN], h: N1, mats: B0, plinthes: ['S'], ouvertures: [{ c: 15.36, l: 0.93, h: 2.04 }] });
  ch.porte('x', E.yN, 15.36, { l: 0.93, h: 2.04, modele: 'grise', etat: 'fermee', cote: 'S', oculus: false, matVantail: X.taupe, nom: 'local (vestibule est)' });
  ch.plafond(14.675, 10.8, E.x0, 12.45, HC, 'platre');
  ch.opale(15.36, 11.62, HC, 'escEst', { r: 0.19 });
  // (le chant de la dalle du 1er au-dessus du vestibule, vu de la volée 1)
  B(ch, D, E.x0 - 0.1, 9.15, E.x0, 12.45, H_DALLE, N1 - 0.012, X.beton, { ombre: false });

  // =====================================================================
  //  L'ESCALIER, DU REZ-DE-CHAUSSÉE AU 1er (photos 25, 26)
  // =====================================================================
  // le mitoyen est, prolongé au nord du hall ; le mur d'échiffre entre les deux volées
  mur(ch, D, { de: [19.95, 7.65], a: [19.95, 12.6], ep: 0.3, h: N1, mats: B0, plinthes: ['W'] });
  mur(ch, D, { de: [E.x0, E.yE], a: [E.xP, E.yE], h: N1, mats: B0 });
  // LE PALIER INTERMÉDIAIRE (1,75 m) contre le mitoyen, plein ; ses plinthes ; le monde solide
  B(ch, D, E.xP, E.bS[0], E.xM, E.bN[1], 0, E.hP1 - 0.02, X.beton);
  B(ch, D, E.xP, E.bS[0], E.xM, E.bN[1], E.hP1 - 0.02, E.hP1, X.giron);
  B(ch, D, E.xM - 0.015, E.bS[0], E.xM, E.bN[1], E.hP1, E.hP1 + 0.08, X.plinthe, { ombre: false });
  B(ch, D, E.xP + 0.05, E.bS[0], E.xM, E.bS[0] + 0.015, E.hP1, E.hP1 + 0.08, X.plinthe, { ombre: false });
  B(ch, D, E.xP + 0.05, E.bN[1] - 0.015, E.xM, E.bN[1], E.hP1, E.hP1 + 0.08, X.plinthe, { ombre: false });
  C.sol(E.xP, -E.bS[0], E.xM, -E.bN[1], E.hP1);
  C.ajouterBoite(E.xP, -E.bS[0], E.xM, -E.bN[1], { y0: 0, y1: E.hP1, joueur: false });
  // LA VOLÉE 1 (vers l'est, pleine) et LA VOLÉE 2 (vers l'ouest, sur paillasse : la niche est dessous)
  const v1 = { x0: E.x0, sens: 1, y0: E.bN[0], y1: E.bN[1], b: 0, n: E.n, r: E.r1, g: E.g };
  const v2 = { x0: E.xP, sens: -1, y0: E.bS[0], y1: E.bS[1], b: E.hP1, n: E.n, r: E.r1, g: E.g };
  volee(ch, D, { ...v1, pleine: true });
  volee(ch, D, { ...v2, sous: 0 });
  // les plinthes rampantes, des deux côtés de chaque volée
  limon(ch, D, { ...v1, y: E.bN[1], cote: 1 }); limon(ch, D, { ...v1, y: E.bN[0], cote: -1 });
  limon(ch, D, { ...v2, y: E.bS[0], cote: -1 }); limon(ch, D, { ...v2, y: E.bS[1], cote: 1 });
  // LES MAINS COURANTES (0,90 m au-dessus des nez, 6 cm du mur). Volée 1 : en bas, une crosse vers le bas (photo 26) ;
  // en haut, celle de gauche tourne et court à l'horizontale le long du mur du fond, celle de droite revient au mur au
  // bout de l'échiffre (photo 25). Volée 2 : elles montent jusqu'au 1er ; celle de l'échiffre finit en épingle contre
  // son chant (photo 28).
  const rail = (v, s) => v.b + v.r + s * v.r / v.g + 0.9, xv = (v, s) => v.x0 + v.sens * s, fin = (E.n - 1) * E.g;
  const yN1 = E.bN[1] - 0.079, yS1 = E.bN[0] + 0.079, yS2 = E.bS[0] + 0.079, yN2 = E.bS[1] - 0.079;
  const crosse = (v, y) => [[xv(v, -0.02), y, rail(v, -0.02) - 0.15], [xv(v, 0.07), y, rail(v, 0.07)]];
  mainCourante(ch, D, [...crosse(v1, yN1), [xv(v1, fin), yN1, rail(v1, fin)], [18.7, yN1, E.hP1 + 1.0], [E.xM - 0.079, yN1, E.hP1 + 1.0], [E.xM - 0.079, 11.2, E.hP1 + 1.0], [E.xM, 11.2, E.hP1 + 1.0]],
    [[xv(v1, 0.5), yN1, rail(v1, 0.5), 'N'], [xv(v1, 1.6), yN1, rail(v1, 1.6), 'N'], [19.1, yN1, E.hP1 + 1.0, 'N'], [E.xM - 0.079, 11.9, E.hP1 + 1.0, 'E'], [E.xM - 0.079, 11.4, E.hP1 + 1.0, 'E']]);
  mainCourante(ch, D, [...crosse(v1, yS1), [xv(v1, fin), yS1, rail(v1, fin)], [E.xP + 0.06, yS1, rail(v1, fin)], [E.xP + 0.06, E.bN[0], rail(v1, fin)]],
    [[xv(v1, 0.5), yS1, rail(v1, 0.5), 'S'], [xv(v1, 1.6), yS1, rail(v1, 1.6), 'S']]);
  mainCourante(ch, D, [...crosse(v2, yS2), [xv(v2, fin), yS2, rail(v2, fin)], [E.x0 - 0.04, yS2, rail(v2, fin)], [E.x0 - 0.04, E.bS[0], rail(v2, fin)]],
    [[xv(v2, 0.5), yS2, rail(v2, 0.5), 'S'], [xv(v2, 1.6), yS2, rail(v2, 1.6), 'S']]);
  // (relecture du 09/10 : en haut, elle ne plonge pas — l'épingle de la photo 28 fait le tour du chant gris et repart
  // sur l'autre face de l'échiffre, en main courante de la volée 3 : js/ecole_est.js poserPalierEst)
  mainCourante(ch, D, [...crosse(v2, yN2), [xv(v2, fin), yN2, rail(v2, fin)]],
    [[xv(v2, 0.5), yN2, rail(v2, 0.5), 'N'], [xv(v2, 1.6), yN2, rail(v2, 1.6), 'N']]);
  // LE MUR D'ÉCHIFFRE PEINT EN ORANGE côté volée 2, au-dessus de la plinthe rampante et jusqu'à la sous-face de la volée
  // 4 (photo 28 ; le dessous, côté niche, reste blanc)
  {
    const r2 = E.r2, sofHaut = (x) => E.hP2 - 0.25 + (E.xP - x) * ((E.hP2 + (E.n - 1) * r2 - 0.3) - (E.hP2 - 0.25)) / fin;
    const sh = new THREE.Shape();
    const xa = E.x0 + 0.1;                       // (derrière le retour du chant gris)
    sh.moveTo(xa, rail(v2, fin) - 0.9 + 0.13); sh.lineTo(E.xP, rail(v2, 0) - 0.9 + 0.13);
    sh.lineTo(E.xP, sofHaut(E.xP)); sh.lineTo(xa, sofHaut(xa));
    const o = new THREE.Mesh(new THREE.ShapeGeometry(sh), X.orange);
    o.position.z = -(E.bS[1] - 0.003); o.receiveShadow = true; o.userData.horsAOSol = true; D.add(o);
  }
  // LE PALIER INTERMÉDIAIRE : la réglette (≈ 2,5 m au-dessus de lui, vers le sud du mur), le bloc de sortie juste sous
  // le plafond, l'affiche verticale iris (photo 25)
  reglette(ch, D, E.xM, 10.0, 11.4, E.hP1 + 2.5, 'W');
  // (sa `base` est le palier, 1,75 : à 4,25 m du sol, comptée depuis 0, js/ecole_lumieres.js l'écartait des voisines
  // — sur la moitié haute de la volée 2, zone escEst2, la volée n'avait plus sa lumière — relecture du 09/10)
  ch.lampes.push({ x: E.xM - 0.25, z: -10.7, h: E.hP1 + 2.5, zone: 'escEst', type: 'tube', force: 1.1, base: E.hP1, cuire: false });
  ch.sortie(E.xM - 0.03, 11.0, E.hP1 + 2.85, 'W');
  ch.panneau(matPanneau(texAfficheIris(), 0.55), 0.45, 0.82, E.xM - 0.004, 10.62, E.hP1 + 1.85, 'W');
  // (pour la caméra : le dessous du palier de la volée 3, au-dessus du palier intermédiaire)
  C.plafond(E.xP, -E.bS[0], E.xM, -E.bN[1], E.hP2 - 0.25);

  // =====================================================================
  //  LES ZONES (pièces) pour js/ecole_lumieres.js
  // =====================================================================
  // (escEst : le vestibule et la volée 1, puis, au-dessus du sol, le palier intermédiaire et le bas de la volée 2 — sous
  // celle-ci, la niche reste au couloir ; au-dessus de 2,60 m, c'est la cage du 1er, zonesHaut)
  const zones = [
    { id: 'escEst', rects: [zr(E.xJ, E.yE, E.xM, E.bN[1]), zr(E.x0, E.bS[0], E.xM, E.bN[1], 0.3)], voisines: ['couloirEst', 'escEst2'], env: { x: 15.6, y: 1.6, z: -11.6 } },
    // (la carte du couloir est prise dans le dégagement, pas contre le mur jaune : à 0,7 m de lui, elle teintait de pêche
    // le mur blanc de la niche et le vitrage)
    { id: 'couloirEst', rects: [zr(E.xJ, E.yH, 16.2, E.yE), zr(16.2, E.yH, E.xM, E.yS), zr(16.2, E.yS, E.xP, E.yE)], voisines: ['hall', 'escEst'], env: { x: 16.3, y: 1.6, z: -8.3 } },
  ];
  // (09/10 : les cartes de la cage et du palier prises là où l'on ne voit pas la face orange de l'échiffre — au-dessus
  // de la moitié nord du palier intermédiaire, au nord du palier du 1er ; prises devant elle, elles teintaient de saumon
  // les murs blancs qui regardent le nord)
  const zonesHaut = [
    { id: 'escEst2', rects: [zr(14.2, E.bS[0], E.x0, E.bS[1], N2 - 0.6), zr(E.x0, E.bS[0], E.xM, E.bN[1], 2.6)], voisines: ['escEst', 'e1est'], env: { x: 19.05, y: 3.3, z: -11.6 } },
    { id: 'e1est', rects: [zr(13.55, 6.975, E.x0, 11.1, 2.6), zr(13.2, 11.1, E.x0, E.bN[1], 2.6), zr(E.x0, 6.975, E.xM, E.bS[0], 2.6)], voisines: ['escEst2', 'e1couloir', 'e103', 'e104'], env: { x: 15.0, y: N1 + 1.5, z: -11.3 } },
  ];

  // LA MISE À JOUR (js/carte_ecole.js maj) : l'ombre douce cuite du rez-de-chaussée et la lumière et l'ombre cuites du
  // 1er, reprises sur le lino et le vinyle quand elles arrivent
  let ao = null;
  const maj = () => {
    if (M.sol.aoMap && M.sol.aoMap !== ao) { ao = M.sol.aoMap; X.lino.aoMap = ao; X.lino.aoMapIntensity = M.sol.aoMapIntensity; X.lino.needsUpdate = true; }
    const S = _matSolEtage;
    if (S && (X.vinyle.lightMap !== S.lightMap || X.vinyle.aoMap !== S.aoMap)) {
      X.vinyle.lightMap = S.lightMap; X.vinyle.aoMap = S.aoMap; X.vinyle.aoMapIntensity = S.aoMapIntensity; X.vinyle.needsUpdate = true;
    }
  };
  return { zones, zonesHaut, sols: [X.lino], maj };
}

// =====================================================================
//  LE 1er ÉTAGE ET LA CAGE AU-DESSUS (crochet de js/ecole_etage1.js : tout se pose dans le groupe de l'étage)
// =====================================================================
export function poserPalierEst(ch, { groupe, lampes, matSol, R1 }) {
  const { C, M } = ch, G = groupe, E = EST, B0 = M.blanc;
  if (!X) X = matieresEst();
  _matSolEtage = matSol;
  const lampe = (L) => { const l = { base: N1, cuire: false, ...L }; ch.lampes.push(l); if (l.base === N1 && l.cuireEtage !== false) lampes.push(l); };
  const opale = (x, y, zone) => { ch.opale(x, y, H1, zone, { r: 0.19, base: N1, cuire: false }); lampes.push(ch.lampes[ch.lampes.length - 1]); };

  // ---- LE SOL : le vinyle moucheté foncé (photos 27, 28), sur la lumière et l'ombre cuites du 1er ----
  // (relecture du 09/10 : depuis l'axe de la cloison des salles, 6,975, et non sa face, 7,035 — sur les seuils du 103 et
  // de la 104, entre leur carrelage et le vinyle, une fente de 6 cm laissait voir le rez-de-chaussée)
  const sol = new THREE.Mesh(geoDalles([[13.55, 6.975, E.x0, 8.6], [14.2, 8.6, E.x0, 11.1], [13.2, 11.1, E.x0, E.bN[1]], [E.x0, 6.975, E.xM, 9.0]], N1, R1), X.vinyle);
  sol.receiveShadow = true; sol.castShadow = false; sol.name = 'vinyle du palier est'; sol.userData.solEtage = true;
  G.add(sol);

  // =====================================================================
  //  LES MURS DU PALIER (photos 27 à 29)
  // =====================================================================
  // LE BOUT DU COULOIR DU 1er (x 13,55) et sa porte à 1,5 vantail : le semi-fixe de 0,48 m au sud (fermé, l'affiche
  // orange côté palier), le vantail de 0,95 m au nord, ouvert vers le couloir (gonds au nord, ferme-porte côté palier)
  mur(ch, G, { de: [13.55, 7.035], a: [13.55, 8.925], ep: 0.12, base: N1, h: DALLE2, mats: B0, plinthes: [['W', M.bois], 'E'], ouvertures: [{ c: 7.835, l: 1.43, h: N1 + 2.1 }] });
  // (relecture du 09/10 : le même stratifié gris taupe que les portes du rez-de-chaussée — photo 28, le semi-fixe est
  // nettement plus sombre que le mur, comme sur la photo 24)
  ch.porte('y', 13.55, 7.36, { l: 0.48, h: 2.06, base: N1, ep: 0.12, modele: 'grise', etat: 'fermee', cote: 'E', oculus: false, poignee: null, fermePorte: false, huisserie: false, matVantail: X.taupe, nom: 'palier est (semi-fixe)' });
  ch.porte('y', 13.55, 8.075, { l: 0.95, h: 2.06, base: N1, ep: 0.12, modele: 'grise', etat: 'ouverte', angle: 1.75, cote: 'W', charniere: 'd', huisserie: false, matVantail: X.taupe, nom: 'palier est (couloir du 1er)' });
  ch.panneau(matPanneau(texAfficheOrange(), 0.6), 0.21, 0.297, 13.603, 7.36, N1 + 1.4, 'E');
  // l'huisserie (métal blanc) autour des deux vantaux ; en tête, côté palier, au-dessus du semi-fixe, le boîtier du
  // ferme-porte (photo 28)
  for (const [y0, y1] of [[7.08, 7.12], [8.55, 8.59]]) B(ch, G, 13.48, y0, 13.62, y1, N1, N1 + 2.1, M.huisserie, { ombre: false });
  B(ch, G, 13.48, 7.08, 13.62, 8.59, N1 + 2.06, N1 + 2.1, M.huisserie, { ombre: false });
  B(ch, G, 13.62, 7.16, 13.675, 7.48, N1 + 2.1, N1 + 2.16, M.ferme, { ombre: false });
  // le retour du mur du panneau (y 8,65) et LE MUR DU PANNEAU (face est en x 14,225, de y 8,6 à 11,1)
  mur(ch, G, { de: [13.61, 8.65], a: [14.075, 8.65], ep: 0.12, base: N1, h: DALLE2, mats: B0, plinthes: ['S'] });
  mur(ch, G, { de: [14.15, 8.59], a: [14.15, 11.175], base: N1, h: DALLE2, mats: B0, plinthes: ['E'] });
  // le renfoncement nord (x 13,2-14,2, y 11,1-12,45) sous sa retombée, son pilastre
  mur(ch, G, { de: [13.275, 11.1], a: [14.075, 11.1], base: N1, h: DALLE2, mats: B0, plinthes: ['N'] });
  mur(ch, G, { de: [13.2, 11.025], a: [13.2, 12.6], base: N1, h: DALLE2, mats: B0, plinthes: ['E'] });
  B(ch, G, 14.06, 12.3, 14.22, 12.45, N1, H1, B0, { collision: true, ombre: false });
  B(ch, G, 14.05, 12.29, 14.23, 12.3, N1, N1 + 0.08, X.plinthe, { ombre: false });
  // le mur nord (au-dessus des volées 1 et 3, il monte jusqu'au plafond de la cage) et, au fond du palier, la porte de
  // la salle 106 (« Salle de cours B 1.6 » du panneau, fermée ; non vue : derrière le chant gris sur la photo 28, au-dessus
  // de la porte du local du vestibule) ; le mur sud de la cage, côté bande
  mur(ch, G, { de: [13.125, E.yN], a: [E.x0, E.yN], base: N1, h: H_CAGE, mats: B0, plinthes: ['S'], ouvertures: [{ c: 15.2, l: 0.95, h: N1 + 2.04 }] });
  ch.porte('x', E.yN, 15.2, { l: 0.95, h: 2.04, base: N1, modele: 'grise', etat: 'fermee', cote: 'N', notices: 1, nom: 'salle 106' });
  ch.panneau(matPanneau(texPlaqueSalle('Salle', 'de cours', 'B 1.6'), 0.4), 0.15, 0.09, 15.86, E.yN - 0.078, N1 + 1.6, 'S', G);
  mur(ch, G, { de: [E.x0, E.yN], a: [E.xM, E.yN], base: N1, h: H_CAGE, mats: B0 });
  mur(ch, G, { de: [E.x0, E.yS], a: [E.xM, E.yS], base: N1, h: H_CAGE, mats: B0, plinthes: ['S'] });
  // le mitoyen au nord de l'issue de secours (js/ecole_etage1.js le monte jusqu'à y 8,99) ; le mur d'échiffre
  mur(ch, G, { de: [19.95, 8.99], a: [19.95, 12.6], ep: 0.3, base: N1, h: H_CAGE, mats: B0 });
  mur(ch, G, { de: [E.x0, E.yE], a: [E.xP, E.yE], base: N1, h: H_CAGE, mats: B0 });
  // (les plinthes du palier sont gris foncé, photo 28 : sur la cloison des salles et le mitoyen de js/ecole_etage1.js, qui
  // portent les plinthes de bois du couloir, une plinthe grise par-dessus)
  for (const [a, b] of [[13.61, 14.87], [15.83, 16.67], [17.63, E.xM]]) B(ch, G, a, 7.034, b, 7.052, N1, N1 + 0.082, X.plinthe, { ombre: false });
  B(ch, G, E.xM - 0.017, 7.035, E.xM, 7.47, N1, N1 + 0.082, X.plinthe, { ombre: false });
  B(ch, G, E.xM - 0.017, 8.43, E.xM, 9.0, N1, N1 + 0.082, X.plinthe, { ombre: false });
  // LE CHANT GRIS du mur d'échiffre (photo 28 : ≈ 10 cm, comme le poteau du rez-de-chaussée) : il retourne sur la face
  // sud — vu du haut de la volée 2, c'est une bande grise de 11 cm avant l'orange
  B(ch, G, E.x0 - 0.006, E.yE - 0.081, E.x0 + 0.11, E.yE + 0.081, N1, 6.1, X.poteau, { ombre: false });
  // LES PLAFONDS : le palier (plâtre, 2,50 m), la retombée du renfoncement nord, la bande sud
  ch.plafond(13.55, 7.035, E.x0, 11.1, H1, 'platre');
  ch.plafond(14.2, 11.1, E.x0, E.bN[1], H1, 'platre');
  ch.plafond(13.275, 11.175, 14.2, E.bN[1], H1 - 0.22, 'platre');
  ch.panneau(B0, 1.275, 0.22, 14.2, 11.81, H1 - 0.11, 'E');
  ch.plafond(E.x0, 7.035, E.xM, 9.0, H1, 'platre');
  // au-dessus du palier, la cage se ferme : le mur de 6,0 m à 9,45 m au droit des volées 1 et 3
  mur(ch, G, { de: [E.x0 - 0.05, E.yE], a: [E.x0 - 0.05, E.yN], ep: 0.1, base: H1, h: H_CAGE, mats: B0 });
  // (la dalle du 1er au-dessus de la volée 1 est posée par js/ecole_etage1.js : C.sol, la caméra)
  C.ajouterBoite(13.2, -9.025, E.x0, -E.bN[1], { y0: N1 - 0.32, y1: N1 - 0.02, joueur: false });

  // =====================================================================
  //  LE MUR DU PANNEAU (photo 28)
  // =====================================================================
  const xf = 14.225;
  ch.panneau(matPanneau(texPanneauEtageEst(), 0.5), 0.65, 0.34, xf + 0.006, 9.3, N1 + 1.6, 'E', G);
  B(ch, G, xf, 8.97, xf + 0.005, 9.63, N1 + 1.425, N1 + 1.775, M.noirMat, { ombre: false });
  ch.panneau(matPanneau(texWifiIris(), 0.4), 0.22, 0.16, xf + 0.004, 9.95, N1 + 1.6, 'E', G);
  ch.panneau(matPanneau(texPointEcoute(), 0.6), 0.21, 0.297, xf + 0.003, 10.25, N1 + 1.65, 'E', G);
  // la réglette au-dessus des affichettes (≈ 2,1 m ; photo 28 : de la moitié du panneau à 30 cm au-delà de l'affiche
  // violette), son bouton de minuterie et la prise à l'aplomb de l'affichette WIFI ; le tapis gris anthracite
  reglette(ch, G, xf, 9.22, 10.62, N1 + 2.1, 'E');
  lampe({ x: xf + 0.25, z: -9.92, h: N1 + 2.1, zone: 'e1est', type: 'tube', force: 1.1 });
  // (relecture du 09/10, photo 28 en grand : la platine blanche, un boîtier qui avance de 3 cm, sa façade sombre et son
  // voyant vert — un poussoir de minuterie ; blanc sur blanc, l'ancien n'était qu'un point noir)
  B(ch, G, xf, 9.91, xf + 0.012, 9.99, N1 + 1.06, N1 + 1.14, M.boitier, { ombre: false });
  B(ch, G, xf + 0.012, 9.922, xf + 0.04, 9.978, N1 + 1.072, N1 + 1.128, M.boitier, { ombre: false });
  B(ch, G, xf + 0.04, 9.93, xf + 0.043, 9.97, N1 + 1.078, N1 + 1.114, M.noirMat, { ombre: false });
  B(ch, G, xf + 0.043, 9.934, xf + 0.045, 9.94, N1 + 1.082, N1 + 1.1, X.voyant, { ombre: false });
  B(ch, G, xf, 9.91, xf + 0.018, 9.99, N1 + 0.21, N1 + 0.29, M.boitier, { ombre: false });
  B(ch, G, xf + 0.018, 9.935, xf + 0.021, 9.965, N1 + 0.235, N1 + 0.265, M.noirMat, { ombre: false });
  // (le tapis à ≈ 0,6 m du mur : photo 27, une bande de sol entre la plinthe et lui ; photo 28, au bas de l'image)
  B(ch, G, 14.8, 9.05, 15.4, 10.65, N1, N1 + 0.008, X.tapis1, { ombre: false });
  // (sur le mur sud du palier, près du renfoncement, la petite photo encadrée sombre et brillante, à 1,7-1,9 m)
  B(ch, G, 14.17, 7.035, 14.45, 7.045, N1 + 1.64, N1 + 1.96, M.noirMat, { ombre: false });
  ch.panneau(new THREE.MeshStandardMaterial({ map: texPhotoNuit(), roughness: 0.08, metalness: 0.1 }), 0.25, 0.29, 14.31, 7.047, N1 + 1.8, 'N', G);
  // (les plaques du bureau 103 et de la salle 104, sur la bande sud : js/ecole_etage1.js garnirCouloir)
  // LES LUMIÈRES du palier : la réglette (plus haut), un hublot au nord (non vu), deux dans la bande qui file à l'est
  opale(15.1, 11.75, 'e1est');
  opale(17.3, 8.0, 'e1est');
  opale(18.9, 8.0, 'e1est');

  // =====================================================================
  //  LA CAGE AU-DESSUS DU 1er (IMAGINÉE) : volée 3, palier à 5,05 m, volée 4, palier du 2e (fermé)
  // =====================================================================
  const v3 = { x0: E.x0, sens: 1, y0: E.bN[0], y1: E.bN[1], b: N1, n: E.n, r: E.r2, g: E.g };
  const v4 = { x0: E.xP, sens: -1, y0: E.bS[0], y1: E.bS[1], b: E.hP2, n: E.n, r: E.r2, g: E.g };
  volee(ch, G, v3);
  volee(ch, G, v4);
  limon(ch, G, { ...v3, y: E.bN[1], cote: 1 }); limon(ch, G, { ...v3, y: E.bN[0], cote: -1 });
  limon(ch, G, { ...v4, y: E.bS[0], cote: -1 }); limon(ch, G, { ...v4, y: E.bS[1], cote: 1 });
  // le palier à 5,05 m (dalle), ses plinthes ; le palier du 2e (dalle de 6,40 à 6,60), son chant
  B(ch, G, E.xP, E.bS[0], E.xM, E.bN[1], E.hP2 - 0.25, E.hP2 - 0.02, X.beton);
  B(ch, G, E.xP, E.bS[0], E.xM, E.bN[1], E.hP2 - 0.02, E.hP2, X.giron);
  B(ch, G, E.xM - 0.015, E.bS[0], E.xM, E.bN[1], E.hP2, E.hP2 + 0.08, X.plinthe, { ombre: false });
  C.sol(E.xP, -E.bS[0], E.xM, -E.bN[1], E.hP2);
  C.ajouterBoite(E.xP, -E.bS[0], E.xM, -E.bN[1], { y0: E.hP2 - 0.25, y1: E.hP2, joueur: false });
  B(ch, G, 14.2, E.bS[0], E.x0, E.bS[1], DALLE2, N2 - 0.02, X.beton);
  B(ch, G, 14.2, E.bS[0], E.x0, E.bS[1], N2 - 0.02, N2, X.vinyle);
  B(ch, G, E.x0 - 0.1, E.bS[0], E.x0, E.bS[1], H1, DALLE2, X.beton, { ombre: false });
  C.sol(14.2, -E.bS[0], E.x0, -E.bS[1], N2);
  C.ajouterBoite(14.2, -E.bS[0], E.x0, -E.bS[1], { y0: DALLE2, y1: N2, joueur: false });
  // le palier du 2e : ses murs, sa porte grise (fermée) et sa plaque
  mur(ch, G, { de: [14.15, E.yS], a: [E.x0, E.yS], base: N2, h: H_CAGE, mats: B0, plinthes: ['N'] });
  mur(ch, G, { de: [14.15, E.yE], a: [E.x0 - 0.1, E.yE], base: N2, h: H_CAGE, mats: B0, plinthes: ['S'] });
  mur(ch, G, { de: [14.15, E.yS], a: [14.15, E.yE], base: N2, h: H_CAGE, mats: B0, plinthes: ['E'], ouvertures: [{ c: 9.9, l: 0.93, h: N2 + 2.04 }] });
  ch.porte('y', 14.15, 9.9, { l: 0.93, h: 2.04, base: N2, modele: 'grise', etat: 'fermee', cote: 'E', matVantail: X.taupe, notices: 1, nom: '2e étage (escalier est)' });
  ch.panneau(matPanneau(texPlaqueSalle('Escalier est', '2e étage', 'fermé'), 0.4), 0.15, 0.09, 14.229, 10.5, N2 + 1.6, 'E', G);
  // le plafond de la cage
  ch.plafond(14.2, E.bS[0], E.xM, E.bN[1], H_CAGE, 'platre', { retombees: false });
  // les mains courantes des volées 3 et 4 (comme en bas)
  const rail = (v, s) => v.b + v.r + s * v.r / v.g + 0.9, xv = (v, s) => v.x0 + v.sens * s, fin = (E.n - 1) * E.g;
  const yN1 = E.bN[1] - 0.079, yS1 = E.bN[0] + 0.079, yS2 = E.bS[0] + 0.079, yN2 = E.bS[1] - 0.079;
  const crosse = (v, y) => [[xv(v, -0.02), y, rail(v, -0.02) - 0.15], [xv(v, 0.07), y, rail(v, 0.07)]];
  mainCourante(ch, G, [...crosse(v3, yN1), [xv(v3, fin), yN1, rail(v3, fin)], [E.xP + 0.06, yN1, rail(v3, fin)], [E.xP + 0.06, E.bN[1], rail(v3, fin)]],
    [[xv(v3, 0.5), yN1, rail(v3, 0.5), 'N'], [xv(v3, 1.6), yN1, rail(v3, 1.6), 'N']]);
  // (celle de l'échiffre, côté volée 3, est la suite de celle de la volée 2 : au palier du 1er, la main courante fait
  // une ÉPINGLE autour du chant gris — photo 28 : elle passe le bout du mur, revient derrière lui — et remonte)
  const h2 = rail({ b: E.hP1, r: E.r1, g: E.g }, fin), h3 = rail(v3, 0);
  mainCourante(ch, G, [[E.x0, yN2, h2], [E.x0 - 0.12, yN2, h2 + 0.02], [E.x0 - 0.18, E.yE, (h2 + h3) / 2], [E.x0 - 0.12, yS1, h3 - 0.02], [E.x0, yS1, h3],
    [xv(v3, fin), yS1, rail(v3, fin)], [E.xP + 0.06, yS1, rail(v3, fin)], [E.xP + 0.06, E.bN[0], rail(v3, fin)]],
    [[xv(v3, 0.5), yS1, rail(v3, 0.5), 'S'], [xv(v3, 1.6), yS1, rail(v3, 1.6), 'S']]);
  for (const y of [yS2, yN2]) {
    const f = y < E.yE - 0.5 ? 'S' : 'N';
    mainCourante(ch, G, [...crosse(v4, y), [xv(v4, fin), y, rail(v4, fin)], [E.x0 - 0.04, y, rail(v4, fin)], [E.x0 - 0.04, f === 'S' ? E.bS[0] : E.bS[1], rail(v4, fin)]],
      [[xv(v4, 0.5), y, rail(v4, 0.5), f], [xv(v4, 1.6), y, rail(v4, 1.6), f]]);
  }
  // la réglette et le bloc de sortie du palier à 5,05 m, comme au palier du dessous (lampe de la cage du haut : elle ne
  // se cuit pas sur le sol du 1er, et vue du palier du 1er elle est « trop haut » pour un spot voisin)
  reglette(ch, G, E.xM, 10.0, 11.4, E.hP2 + 2.5, 'W');
  lampe({ x: E.xM - 0.25, z: -10.7, h: E.hP2 + 2.5, zone: 'escEst2', type: 'tube', force: 1.1, cuireEtage: false });
  ch.sortie(E.xM - 0.03, 11.0, E.hP2 + 2.85, 'W');
  // (l'orange de l'échiffre est posé par poserEst, du rez-de-chaussée à la sous-face de la volée 4 ; la main courante de
  // la volée 2 aussi : elle monte jusqu'au 1er)
  console.info('[escalier est] palier du 1er et cage au-dessus posés');
}
