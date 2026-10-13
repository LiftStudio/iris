// =====================================================================
//  L'ESCALIER EST DE L'ÉCOLE IRIS (crochets de js/carte_ecole.js et de js/ecole_etage1.js)
// =====================================================================
// D'après les photos 24 à 29 de Haythem et leur relevé (09/10 ; cotes tirées de l'ultra grand-angle : ± 0,3 m, ce qui
// est sûr, c'est ce qui mène à quoi). Derrière le mur nord du hall d'entrée, en face de la porte 6, une porte à 1,5
// vantail (le semi-fixe porte l'affiche violette « POINT ÉCOUTE ») ouvre sur le COULOIR EST : lino gris-taupe, mur
// ouest JAUNE et sa plaque directionnelle, plinthes gris foncé, plafond de plâtre à 2,55 m et ses hublots ; à l'est, le
// dégagement devant la cloison vitrée cannelée (le photocopieur derrière), le poteau gris, la niche sous la volée 2. Au
// fond, la porte du vestibule (1,5 vantail aussi) et L'ESCALIER EN U contre le mitoyen est : volée 1 de 9 contremarches
// de 19,4 cm vers l'est, palier intermédiaire à 1,75 m, volée 2 de 9 contremarches vers l'ouest jusqu'au 1er (3,50 m) ;
// marches sombres à nez d'aluminium, plinthe rampante gris foncé, mains courantes NOIRES rondes sur consoles des deux côtés,
// aucun garde-corps à barreaux, murs blancs, la réglette et le bloc de sortie du palier (photos 25, 26). Au 1er, le
// PALIER EST (photos 27 à 29) : le mur du panneau d'étage, le mur d'échiffre ORANGE et son chant gris, la porte du
// couloir du 1er, le renfoncement nord.
//
// LE PLAN (repère de js/carte_ecole.js : x le long de la façade, y vers le fond ; RDC à 0, 1er à 3,50) :
//   la porte du hall                 x 14,70-16,10   y 7,575    vantail 0,92 (auto) + semi-fixe 0,48 « POINT ÉCOUTE »
//   la cloison du hall               x 16,25-19,8    y 7,575    le pan cannelé jusqu'à x 17,1 (photo 24), puis un mur
//                                                               blanc plein ; l'angle nord-est du hall est ouvert, le
//                                                               photocopieur contre le cannelé côté hall (VO q_0026-0031,
//                                                               js/ecole_hall.js)
//   le couloir est                   x 14,6-16,2     y 7,575-10,8   mur jaune à l'ouest, plaque directionnelle
//   le dégagement                    x 16,2-17,9     y 7,65-9,0     devant le vitrage ; le poteau gris x 16,21-16,315 ; au
//                                                                  bout, la porte de l'ASCENSEUR (js/ecole_ascenseur.js)
//   la niche sous la volée 2         x 16,2-18,3     y 9,15-10,65   tapis noir, interrupteur, la boucle noire
//   la porte du vestibule            x 14,70-16,05   y 10,725   vantail 0,85 (ouvert) + vantail de 0,50 presque fermé
//   le vestibule                     x 14,6-16,05    y 10,8-12,45   son mur nord est nu (VO q_0156-0161)
//   le local de 0,9 m (plan V2)      x 13,65-19,8    y 12,6-13,5    fermé, vide, sans accès vu ; son toit à 6,68 m
//   le mur du fond (plan V2)         x 13,3-20,1     y 13,5-13,8    la fin de la partie est (IGN), du -1 au toit
//   la volée 1 (vers l'est)          x 16,28-18,29   y 10,8-12,45   9 x 19,4 cm, girons de 25,1 cm ; elle part 23 cm passé
//                                                                  le jambage (13/10)
//   le palier intermédiaire          x 18,29-19,8    y 9,15-12,45   à 1,75 m
//   la volée 2 (vers l'ouest)        x 18,29-16,28   y 9,15-10,65   paillasse ; elle arrive au 1er en x 16,28
//   le mur d'échiffre                y 10,725 (10,65-10,8)          de x 16,05 à 18,29, jusqu'au plafond de la cage
//   au 1er : le palier est           x 13,85-16,28   y 7,0-12,05    (13 et 14/10, photos 27 à 29 rejouées) le mur du panneau
//                                                                  (face est x 14,815) de y 8,6 à 10,9, la porte de
//                                                                  l'espace pause en x 13,85 (y 7,07-8,48) au fond de son
//                                                                  alcôve, le renfoncement nord x 13,82-14,8 y 10,9-12,05 ;
//                                                                  le mur nord (y 12,05) s'arrête en x 15,13 : au-delà,
//                                                                  le palier va jusqu'au mur de la cage (y 12,45) ;
//                                                                  derrière le mur nord, une gaine fermée
//            et la bande sud         x 16,05-17,9    y 7,0-9,0      sans porte, jusqu'à l'ascenseur (VO q_0274-0281)
//   au-dessus (la vidéo officielle, 68-71 s et 88,8-90 s ; 10/10) : la volée 3 au-dessus de la volée 1 (17,2 cm, palier
//   à 5,05 m), la volée 4 au-dessus de la volée 2 (échiffre ROUGE de ce côté) jusqu'au palier du 2e (js/ecole_etage2.js),
//   et la cage qui monte au 3e (poserCageHaute).
//
// LE MONDE SOLIDE comme l'escalier principal (js/carte_ecole.js construireEscalier) : une RAMPE par volée (la pente passe
// par le milieu des marches), une dalle par palier, des boîtes « caméra seule » sous chaque marche ; les murs de la cage
// coupés à 3,50 m (le bas au rez-de-chaussée, le haut dans le groupe de l'étage : chaque étage cuit sa lumière avec ses
// propres murs) ; la dalle de l'étage est percée au-dessus des volées (js/ecole_etage1.js).
//
//   poserEst(ch, { RECT }) -> { zones, zonesHaut, sols, maj }       (le rez-de-chaussée, appelé par la carte)
//   poserPalierEst(ch, { groupe, lampes, matSol, R1 })              (le 1er et au-dessus, appelé par le 1er étage)
//   poserCageHaute(ch, { groupe })                                  (au-dessus du 2e, appelé par le 2e étage)
import * as THREE from 'three';
import { maille, boiteM } from './ecole_portes.js';
import { canvasTex, detailPhoto } from './kit_decor.js';
import { texPeinture, texAffiche } from './ecole_matieres.js';
import { ASC, poserAscenseur, poserBandeSud, majAscenseur } from './ecole_ascenseur.js';
import { Y_SS } from './ecole_soussol.js';

// ---- les niveaux ----
const N1 = 3.5;                     // le plancher du 1er étage
const N2 = 6.6;                     // celui du 2e
const H_DALLE = 3.25;               // le dessous de la dalle du 1er (les cloisons du rez-de-chaussée y montent)
const DALLE2 = 6.4;                 // le dessous de la dalle du 2e
const H_CAGE = N2;                  // le haut des murs de la cage posés avec le 1er (10/10 : la cage monte au 3e — au-dessus du 2e, poserCageHaute)
const HC = 2.55;                    // le plafond de plâtre du couloir est et du vestibule (photo 24)
const H1 = N1 + 2.5;                // le plafond du palier est du 1er (photo 27 : ≈ 2,45 à 2,6 m)
// LE ROUGE VERMILLON du 2e (l'échiffre côté volée 4 ici, le mur nord du couloir dans js/ecole_etage2.js) : le #d0502c du
// relevé sortait #d93d18, orange vif, sous la lumière chaude du jeu (relecture du 10/10, côte à côte avec q_0340, même
// point de vue : VO #cf4c31 ; q_0299 #bd543d, q_0343 #d6563e) — l'albédo #c46050 rend #d04f31
export const ROUGE_2E = 0xc46050;
// LE SAFRAN OCRÉ du mur jaune du couloir est et de la face est de la pile (js/ecole_rdc_centre.js : la même valeur ;
// plan V2, lot H, 11/10 : réglé côte à côte avec la photo 24 rejouée au même point de vue — l'ancien #e9a03a sortait
// jaune d'or vif, presque sans bleu) ; le gris neutre du poteau du couloir et du chant de l'échiffre du 1er
export const JAUNE_EST = 0xd99553;
const POTEAU_EST = 0x8a8377;
// la lumière du tube fluo du palier intermédiaire : blanc neutre (≈ 4 000 K), plus froid que les plafonniers
const REGLETTE_EST = new THREE.Color(0xf6f4ef);
// ---- le plan ----
export const EST = {
  xJ: 14.6,                         // la ligne du mur jaune (13/10 : son nu est en 14,63, XN — le sol et les zones partent d'ici)
  yH: 7.575,                        // le mur nord du hall (y 7,5-7,65)
  yS: 9.075,                        // le mur sud de la cage (y 9,0-9,15) ; à son bout ouest, le poteau gris
  yE: 10.725,                       // le mur d'échiffre et la porte du vestibule (y 10,65-10,8)
  yN: 12.525,                       // le mur nord de la cage (y 12,45-12,6)
  xM: 19.8,                         // le nu du mitoyen est
  x0: 16.05,                        // le jambage est de la porte du vestibule, le bout ouest de l'échiffre, le bord des paliers d'étage
  xD: 16.28,                        // LE DÉPART DES VOLÉES : la 1re contremarche des volées 1, 3, 5, l'arrivée des volées 2 et 4
  xP: 18.29,                        // le bord des paliers intermédiaires
  n: 9,                             // les contremarches d'une volée
};
// LE DÉPART DES VOLÉES (13/10, photos 25 et 26 rejouées à leur pose refaite). La volée 1 ne part PAS du jambage de la porte
// du vestibule : sur la photo 26 — pose sur le mur du fond du couloir et le jambage, (15,20 ; 11,61) à 1,41 m, 8 px —, le
// bout du 1er nez de marche est 190 px à gauche du pied du jambage ; renvoyé sur le mur d'échiffre, il tombe en x 16,33
// (16,32-16,37 quelle que soit la focale, de 1 350 à 1 550 px), le mur blanc descend jusqu'au sol entre le chambranle et
// lui, et au droit du jambage une BANDE NOIRE À DEUX FILETS D'ALUMINIUM court au sol (et remonte de 20 cm au pied du
// jambage) : 25 à 30 cm de sol devant la 1re contremarche. La photo 25, prise du même endroit (y 11,62 pour 11,61), met
// l'appareil à 1,03-1,08 m du 1er nez : x 16,23-16,28. Ses rapports, qui ne dépendent pas de la focale : le mur du palier
// 1,50 fois plus loin de l'appareil que le dernier nez, le palier 0,71 fois long comme la volée — avec le mitoyen en 19,8,
// huit girons de 0,25 et un palier de 1,5 m. Le bord du palier ne bouge donc pas (18,29) : la volée part de 16,28 et ses
// girons passent de 0,28 à 0,251 (2h + g = 0,64 au lieu de 0,67). Les volées du dessus suivent ; le jambage, le bout de
// l'échiffre et le bord des paliers d'étage restent en x0 = 16,05 — une bande de 23 cm devant chaque départ et arrivée.
EST.g = (EST.xP - EST.xD) / (EST.n - 1);            // 25,1 cm : le giron
EST.r1 = N1 / (2 * EST.n);                          // 19,4 cm
EST.r2 = (N2 - N1) / (2 * EST.n);                   // 17,2 cm au-dessus (un étage courant de 3,10 m)
EST.hP1 = N1 / 2;                                   // 1,75
EST.hP2 = N1 + (N2 - N1) / 2;                       // 5,05
EST.bN = [EST.yE + 0.075, EST.yN - 0.075];          // la bande nord (volées 1 et 3) : y 10,8-12,45
EST.bS = [EST.yS + 0.075, EST.yE - 0.075];          // la bande sud (volées 2 et 4) : y 9,15-10,65
// LE NU DU MUR JAUNE (13/10, photo 24 rejouée — pose refaite sur la porte du hall (1,40 x 2,06), le plafond à 2,55 et le
// poteau gris pris du sol au plafond : l'appareil en (15,195 ; 11,235) à 1,50 m, cap 171, piqué −9,2°, roulis 1,6°, 7 px ;
// la pose du lot H, à 1,19 m et −4,8°, ne tenait que le mur du fond). Entre la baie de la porte du hall et le jaune, un
// CHAMBRANLE CRÈME de 8 cm (35 px pour 37 de l'autre côté) : le jaune ne part pas au ras du jambage, son angle et sa
// plinthe tombent en x 14,62-14,66. Le mur s'amincit de ce côté : son dos (14,525) ne bouge pas.
const XN = 14.63;

// les matières du module (créées par poserEst, reprises par poserPalierEst)
let X = null;
let _matSolEtage = null;            // le carrelage du 1er (js/ecole_etage1.js) : le vinyle du palier prend ses cartes
let _R1 = null;                     // le rectangle de la lumière cuite du 1er (les bandes du 2e, poserCageHaute)

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
// (13/10, relecture de la photo 24 agrandie : de près, celui de la niche est un caoutchouc anthracite presque UNI, à grain
// fin — les pastilles du jeu, claires sur fond gris, y dessinaient une tôle larmée ; `relief` les efface aux trois quarts)
function texTapis(clair = false, relief = 1) {
  return canvasTex(128, 128, (g, w, h) => {
    const b = clair ? 60 : 50, p = 16;
    g.fillStyle = rgb(b, b, b + 2); g.fillRect(0, 0, w, h);
    for (let j = 0; j < h / p; j++) for (let i = 0; i < w / p; i++) {
      const a = ((i + j) % 2 ? 1 : -1) * Math.PI / 4;
      g.save(); g.translate(i * p + p / 2, j * p + p / 2); g.rotate(a);
      g.fillStyle = rgb(b - 16 * relief, b - 16 * relief, b - 14 * relief); g.fillRect(-5, 0.5, 10, 2.5);
      g.fillStyle = rgb(b + 22 * relief, b + 22 * relief, b + 24 * relief); g.fillRect(-5, -2.5, 10, 2.5);
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
// blancs, toutes vers le hall. Lue sur la photo, recoupée avec l'annuaire de la photo 22. (10/10 : les codes sont « Si »,
// salles informatiques — l'annuaire de la pile, VO 7,9-8,1 s, « Si 0.1 » et « Si 0.2 » ; le « B » ne sert qu'aux bureaux)
// (relecture du lot H, 11/10, photo 24 rejouée au même point de vue, sa plaque agrandie : elle est EN LARGEUR — ses
// deux chants, 118 et 95 px de haut à 48 px l'un de l'autre, donnent une largeur double de la hauteur, ≈ 0,58 x 0,29 m —
// et ses lames sont d'un BLEU MOYEN brillant, des reflets clairs en haut de chacune : 0,6 de la luminance du mur blanc,
// R/V/B au mur 0,55/0,83/1,27 ; à #192d44 elle sortait presque noire, 0,2. Le « bleu nuit presque noir » est celui de la
// VO de 2021, q_0050-0053 : la photo de 2026 prime)
function texDirection() {
  return canvasTex(1024, 512, (g, w, h) => {
    const lames = [['Accueil – Réception', ''], ['Salle Tim Berners-Lee', 'Si 0.1'], ['Salle David Clark', 'Si 0.2'], ['Pause extérieure', ''], ['Direction des Études', '']];
    const lh = h / 5;
    lames.forEach(([t, num], i) => {
      const y = i * lh, gr = g.createLinearGradient(0, y, 0, y + lh);
      gr.addColorStop(0, '#4d86d2'); gr.addColorStop(0.35, '#3a6eb6'); gr.addColorStop(1, '#2a5796');
      g.fillStyle = gr; g.fillRect(0, y, w, lh);
      // le reflet d'une lame laquée : une bande claire en biais vers la gauche
      const rf = g.createLinearGradient(0, y, w * 0.6, y + lh);
      rf.addColorStop(0, 'rgba(190,220,255,0.24)'); rf.addColorStop(0.5, 'rgba(190,220,255,0.06)'); rf.addColorStop(1, 'rgba(190,220,255,0)');
      g.fillStyle = rf; g.fillRect(0, y, w, lh * 0.55);
      g.fillStyle = '#16263a'; g.fillRect(0, y, w, 5);
      g.fillStyle = '#f3f5f7'; g.font = '600 44px "Segoe UI", Arial, sans-serif'; g.textBaseline = 'middle';
      g.fillText(t, i === 0 ? 104 : 46, y + lh / 2 + 3);
      if (num) { g.font = '700 42px "Segoe UI", Arial, sans-serif'; g.textAlign = 'right'; g.fillText(num, w - 112, y + lh / 2 + 3); g.textAlign = 'left'; }
      // la flèche vers la gauche (le hall)
      g.strokeStyle = '#f3f5f7'; g.lineWidth = 8; g.lineCap = 'round';
      g.beginPath(); g.moveTo(w - 28, y + lh / 2); g.lineTo(w - 82, y + lh / 2); g.moveTo(w - 62, y + lh / 2 - 18); g.lineTo(w - 82, y + lh / 2); g.lineTo(w - 62, y + lh / 2 + 18); g.stroke();
      if (i === 0) { g.fillStyle = '#f3f5f7'; g.beginPath(); g.arc(50, y + lh / 2, 28, 0, 7); g.fill(); g.fillStyle = '#30507c'; g.font = '700 34px "Segoe UI", sans-serif'; g.textAlign = 'center'; g.fillText('i', 50, y + lh / 2 + 3); g.textAlign = 'left'; }
    });
  }, null, false, 4);
}
// LE PANNEAU D'ÉTAGE du palier est (photo 28) : noir mat, bandeau vertical orange cuivré et son « 1 », cinq lignes
export function texPanneauEtageEst() {
  return canvasTex(768, 402, (g, w, h) => {
    g.fillStyle = '#2b2a28'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#b5703f'; g.fillRect(0, 0, 70, h);
    // (10/10, VO 43,3 s : le bandeau est fait de cinq cases, une par ligne, des filets fins séparent les lignes)
    for (let i = 1; i < 5; i++) { const y = i * h / 5; g.fillStyle = '#2b2a28'; g.fillRect(0, y - 2, 70, 4); g.fillStyle = 'rgba(244,244,242,0.28)'; g.fillRect(84, y - 1, w - 104, 2); }
    g.fillStyle = '#ffffff'; g.font = '700 74px "Segoe UI", Arial, sans-serif'; g.textBaseline = 'alphabetic'; g.fillText('1', 14, 70);
    // (10/10, VO 42,8-43,8 s à 25 i/s : « S 1.3 / Si 1.4 / Si 1.5 / — / S 1.6 » — S salle de cours, Si salle informatique)
    const lignes = [['Salle de cours', 'S 1.3'], ['Salle Robert Kahn', 'Si 1.4'], ['Salle Gordon Earle Moore', 'Si 1.5'], ['Espace pause', ''], ['Salle de cours', 'S 1.6']];
    g.font = '500 40px "Segoe UI", Arial, sans-serif'; g.fillStyle = '#f4f4f2';
    lignes.forEach(([t, num], i) => {
      const y = h * (i + 0.5) / 5 + 14;
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
// UNE PLAQUE DE SALLE (photo 23 : noire, trois lignes blanches CENTRÉES « Salle / nom / B 0.x », sans liseré — celle
// de la salle David Clark ; intégration du 10/10 : le même dessin que les plaques du couloir du 1er, js/ecole_etage1.js)
export function texPlaqueSalle(l1, l2, l3) {
  return canvasTex(256, 154, (g, w, h) => {
    g.fillStyle = '#2a2826'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#f2f1ee'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    const ligne = (t, y, poids, taille) => {
      let s = taille;
      do { g.font = `${poids} ${s}px "Segoe UI", Arial, sans-serif`; s -= 1; } while (g.measureText(t).width > w * 0.86 && s > 12);
      g.fillText(t, w / 2, y);
    };
    ligne(l1, h * 0.34, 400, 32); ligne(l2, h * 0.6, 600, 34); if (l3) ligne(l3, h * 0.86, 400, 32);
  }, null, false, 4);
}
// LE VERRE CANNELÉ de la cloison du bureau (photos 24, 26) : des côtes verticales, la lumière du bureau derrière (plus
// claire en haut), et, flous, le photocopieur blanc et gris contre la vitre (pan ouest seulement)
function texCannele(copieur) {
  return canvasTex(256, 576, (g, w, h) => {
    const m = h / 2.35;                              // pixels par mètre (le pan fait 2,35 m de haut)
    // (lot H, 11/10, photo 24 rejouée : le verre est GRIS-VERT SOMBRE, ≈ 0,55-0,6 du mur blanc voisin — le bureau
    // derrière est moins éclairé que le couloir — et le photocopieur s'y lit nettement, clair, sur toute la largeur du
    // pan jusqu'à 1,15 m ; au-dessus, une tache bleu-vert floue et le jour d'une fenêtre)
    // (relecture du lot H, 11/10, photo 24 agrandie au même point de vue : le verre est plus BLEU que vert — en haut,
    // R/V/B au mur 0,62/0,75/0,89 —, la tache bleue est franche, à 1,3-1,7 m sur les deux tiers est du pan, le jour d'une
    // fenêtre juste à côté vers l'ouest ; et le photocopieur, derrière le cannelé, n'est qu'une forme grise et floue —
    // seul son dessus, vers 0,7-0,95 m, accroche la lumière ; dessous, il est sombre, 0,27 du mur. Le bloc blanc à bacs
    // noirs du jeu, jusqu'au sol, sautait aux yeux)
    const fond = g.createLinearGradient(0, 0, 0, h);
    fond.addColorStop(0, '#8296aa'); fond.addColorStop(0.45, '#768a9c'); fond.addColorStop(1, '#68798a');
    g.fillStyle = fond; g.fillRect(0, 0, w, h);
    if (copieur) {
      // (vu du couloir, le photocopieur est contre le jambage de la porte du hall : à droite du pan)
      const y = (z) => h - z * m;                    // z : hauteur au-dessus du bas du pan
      g.filter = 'blur(12px)';
      g.fillStyle = 'rgba(48,112,214,0.92)'; g.fillRect(12, y(1.65), 150, 0.38 * m);   // la tache bleue
      g.fillStyle = 'rgba(232,238,236,0.75)'; g.fillRect(168, y(1.82), 46, 0.22 * m);  // le jour d'une fenêtre
      g.filter = 'blur(6px)';
      g.fillStyle = 'rgba(52,56,60,0.5)'; g.fillRect(4, y(1.6), 26, 1.6 * m);      // une armoire au fond
      g.fillStyle = 'rgba(70,74,76,0.85)'; g.fillRect(14, y(0.7), 190, 0.7 * m);  // le corps, dans l'ombre
      g.fillStyle = 'rgba(112,116,114,0.9)'; g.fillRect(14, y(0.9), 190, 0.22 * m); // le dessus, qui prend la lumière
      g.fillStyle = 'rgba(138,140,136,0.85)'; g.fillRect(40, y(0.96), 120, 0.07 * m); // le pupitre
      g.fillStyle = 'rgba(40,42,44,0.6)'; g.fillRect(14, y(0.1), 190, 0.1 * m);
      g.filter = 'none';
    }
    // les côtes : une bande claire et une sombre tous les 1,6 cm
    const pas = w / (1.08 / 0.016);
    for (let x = 0; x < w; x += pas) { g.fillStyle = 'rgba(255,255,255,0.16)'; g.fillRect(x, 0, pas * 0.35, h); g.fillStyle = 'rgba(40,50,60,0.10)'; g.fillRect(x + pas * 0.55, 0, pas * 0.3, h); }
  }, null, false, 4);
}
// LE VERRE DE LA CLOISON VU DU COULOIR (13/10, photos 24 et 26 rejouées à leur pose refaite) : ce n'est pas un cannelé
// mais un verre imprimé à PETITS CARREAUX (≈ 1,2 cm), du sol au plafond (0,10-2,50 m) ; ce qu'on voit au travers,
// relevé bande par bande sur la photo 24 (rapporté au mur blanc de la niche) : gris sombre en tête (0,55), bleu-gris clair
// de 2,0 à 1,3 m (0,8 ; une tache bleue franche vers 1,7 m, le jour d'une fenêtre vers 1,9 m), puis le photocopieur DANS
// L'OMBRE, olive sombre (0,35-0,45 : son plateau vers 0,5-0,7 m un peu plus clair, sa fente noire vers 0,9 m), presque
// noir au pied. La carte fait 0,75 x 2,40 m.
function texVerreCouloir() {
  return canvasTex(256, 820, (g, w, h) => {
    const y = (z) => h - (z - 0.1) / 2.4 * h;        // z : hauteur au-dessus du sol
    const fond = g.createLinearGradient(0, 0, 0, h), arret = (z, c) => fond.addColorStop(Math.min(1, Math.max(0, y(z) / h)), c);
    arret(2.5, 'rgb(124,135,143)'); arret(2.15, 'rgb(117,132,150)'); arret(1.95, 'rgb(134,153,170)'); arret(1.6, 'rgb(142,166,192)');
    arret(1.3, 'rgb(126,146,162)'); arret(1.12, 'rgb(104,122,122)'); arret(0.98, 'rgb(84,95,86)'); arret(0.85, 'rgb(66,74,64)');
    arret(0.7, 'rgb(84,95,86)'); arret(0.4, 'rgb(82,92,82)'); arret(0.28, 'rgb(84,90,80)'); arret(0.1, 'rgb(78,84,74)');
    g.fillStyle = fond; g.fillRect(0, 0, w, h);
    g.filter = 'blur(10px)';
    g.fillStyle = 'rgba(96,148,222,0.7)'; g.fillRect(52, y(1.82), 150, 0.3 / 2.4 * h);              // la tache bleue
    g.fillStyle = 'rgba(214,222,206,0.85)'; g.fillRect(186, y(1.93), 50, 0.14 / 2.4 * h);           // le jour d'une fenêtre
    g.filter = 'blur(5px)';
    g.fillStyle = 'rgba(150,158,150,0.55)'; g.fillRect(40, y(1.16), 200, 0.07 / 2.4 * h);           // le dessus du copieur
    g.fillStyle = 'rgba(34,38,32,0.7)'; g.fillRect(30, y(0.93), 150, 0.07 / 2.4 * h);               // la fente du bac
    g.fillStyle = 'rgba(112,120,104,0.45)'; g.fillRect(20, y(0.68), 220, 0.2 / 2.4 * h);            // le plateau, un peu plus clair
    g.filter = 'none';
    // les petits carreaux du verre imprimé : un filet clair et un filet sombre tous les 1,2 cm
    const pas = w / (0.75 / 0.012);
    for (let x = 0; x < w; x += pas) { g.fillStyle = 'rgba(255,255,255,0.07)'; g.fillRect(x, 0, pas * 0.3, h); g.fillStyle = 'rgba(20,28,34,0.06)'; g.fillRect(x + pas * 0.55, 0, pas * 0.25, h); }
    for (let v = 0; v < h; v += pas) { g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(0, v, w, pas * 0.3); g.fillStyle = 'rgba(20,28,34,0.05)'; g.fillRect(0, v + pas * 0.55, w, pas * 0.25); }
  }, null, false, 4);
}
// L'ÉTIQUETTE ROUGE du grand vantail du vestibule (photo 24, en haut, au-dessus de l'oculus) : rouge, deux lignes blanches
function texEtiquetteFeu() {
  return canvasTex(256, 80, (g, w, h) => {
    g.fillStyle = '#c8262c'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffffff'; g.font = '700 22px "Segoe UI", Arial, sans-serif'; g.textAlign = 'center';
    g.fillText('PORTE COUPE-FEU', w / 2, 33); g.font = '600 17px "Segoe UI", Arial, sans-serif'; g.fillText('À MAINTENIR FERMÉE', w / 2, 62);
  }, null, false, 2);
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
// L'AFFICHE À LA POMME du vestibule (VO q_0154-0160, q_0361-0365 ; 10/10) : sous verre, fond vert lime, une grande
// pomme verte mordue par une pomme blanche, un globe rayé au milieu de la morsure, une marge blanche et une ligne de
// petit texte en bas
function texAffichePomme() {
  return canvasTex(256, 362, (g, w, h) => {
    g.fillStyle = '#f2f3ea'; g.fillRect(0, 0, w, h);
    const m = 12;
    g.fillStyle = '#b8c656'; g.fillRect(m, m, w - 2 * m, h - 2 * m - 26);
    const pomme = (cx, cy, r, c) => {
      g.fillStyle = c; g.beginPath();
      g.arc(cx - r * 0.42, cy, r * 0.62, Math.PI * 0.55, Math.PI * 1.75); g.arc(cx + r * 0.42, cy, r * 0.62, Math.PI * 1.25, Math.PI * 0.45); g.closePath(); g.fill();
      g.beginPath(); g.ellipse(cx + r * 0.12, cy - r * 0.86, r * 0.1, r * 0.24, 0.6, 0, 7); g.fill();     // la feuille
    };
    pomme(w * 0.4, h * 0.42, 118, '#6f9c78');
    g.save(); g.beginPath(); g.rect(m, m, w - 2 * m, h - 2 * m - 26); g.clip();
    pomme(w * 0.86, h * 0.52, 92, '#f2f3ea');
    g.restore();
    // le globe dans la morsure
    const gx = w * 0.62, gy = h * 0.46, gr = 30;
    g.fillStyle = '#7fae86'; g.beginPath(); g.arc(gx, gy, gr, 0, 7); g.fill();
    g.strokeStyle = '#f2f3ea'; g.lineWidth = 2.5;
    g.beginPath(); g.arc(gx, gy, gr, 0, 7); g.stroke();
    for (const k of [-0.5, 0, 0.5]) { g.beginPath(); g.moveTo(gx - gr * Math.sqrt(1 - k * k), gy + k * gr); g.lineTo(gx + gr * Math.sqrt(1 - k * k), gy + k * gr); g.stroke(); }
    g.beginPath(); g.ellipse(gx, gy, gr * 0.45, gr, 0, 0, 7); g.stroke();
    g.fillStyle = '#4f6f55'; g.fillRect(m + 8, h - m - 18, 120, 5); g.fillRect(w - m - 54, h - m - 18, 46, 5);
  }, null, false, 4);
}

// =====================================================================
//  LES MATIÈRES
// =====================================================================
function matieresEst() {
  const std = (o, nom) => { const m = new THREE.MeshStandardMaterial(o); m.name = nom; return m; };
  const P = {
    // le mur jaune du couloir est (photo 24 : à peine plus orangé que le safran de la salle d'attente) ; l'orange du
    // mur d'échiffre au 1er (photo 28 : plus soutenu)
    // (plan V2, lot H, 11/10 : la photo 24 rejouée au même point de vue — le jaune du jeu, presque sans bleu (B/blanc
    // 0,17-0,19), sortait jaune d'or vif ; celui de la photo est un safran ocré (B/blanc 0,31-0,44, V/R 0,72) : JAUNE_EST,
    // la même peinture sur la face est de la pile, js/ecole_rdc_centre.js)
    // (13/10, photo 24 à sa pose refaite : V/R 0,73-0,75 sur le mur, 0,67-0,69 dans le jeu — un rien plus jaune ici ; la
    // face est de la pile garde JAUNE_EST)
    jaune: std({ map: texPeinture(0xdba058, 4), roughness: 0.62 }, 'peinture jaune (couloir est)'),
    orange: std({ map: texPeinture(0xd9782a, 4), roughness: 0.62, side: THREE.DoubleSide }, 'peinture orange (échiffre)'),
    plinthe: std({ color: 0x5a534b, roughness: 0.5 }, 'plinthe gris foncé'),
    // (lot H, 11/10 : gris NEUTRE — photo 24, 0,58 du mur et pas plus chaud que lui ; le #8a8580 sortait brun-gris à
    // 0,67 sous la lumière chaude. Photo 28 : le chant de l'échiffre du 1er est du même gris)
    poteau: std({ color: POTEAU_EST, roughness: 0.62 }, 'poteau gris'),
    poteauN: std({ color: 0x5f5f60, roughness: 0.62 }, 'poteau gris (face nord, à contre-jour)'),
    // (lot H, 11/10 : les mouchetures à 0,4 — sur la photo 24, le lino est un gris-taupe presque uni, sans le « granito »)
    lino: std({ map: texMouchete({ fond: [158, 152, 143], taches: [[[214, 210, 202], 0.4], [[80, 76, 70], 0.4], [[128, 122, 113], 0.5]], n: 9000, graineN: 11 }), roughness: 0.38 }, 'lino moucheté clair'),
    // (relecture du 09/10 : mouchetures adoucies — sur les photos 27 et 28, de près, le vinyle paraît presque uni)
    vinyle: std({ map: texMouchete({ fond: [86, 79, 70], taches: [[[118, 111, 99], 0.7], [[58, 53, 46], 0.7], [[138, 131, 119], 0.35]], n: 8000, graineN: 13 }), roughness: 0.55 }, 'vinyle moucheté du 1er'),
    // (lot H, 11/10 : la photo 25 rejouée au même point de vue — girons gris-noir #2e261b à peine mouchetés, 0,28 du
    // mur nord ; ceux du jeu sortaient bruns, 0,41, et poivre et sel : le fond plus sombre et neutre, les mouchetures
    // fines et basses)
    // (14/10, photos 25 et 26 rejouées à leur pose : les girons rendent 0,20 à 0,26 du mur voisin (0,37 pour le premier, sous le
    // hublot du vestibule) — le jeu 0,09 à 0,17, presque noirs : le fond une fois et demie plus clair)
    giron: std({ map: texMouchete({ fond: [45, 42, 37], taches: [[[62, 59, 54], 0.5], [[31, 29, 27], 0.6]], n: 5000, tuile: 0.5, w: 256, graineN: 17, nuee: 4 }), roughness: 0.66 }, 'giron moucheté'),
    // (le béton peint des volées et des paliers : vu d'en dessous, il ne reçoit que le rebond — sur la photo 25, la
    // sous-face au-dessus de la volée 1 est presque aussi claire que les murs : un léger émissif, comme les plafonds)
    // (relecture du lot H, 11/10, photo 25 rejouée : la sous-face de la volée 3 et du palier à 5,05 m, juste au-dessus
    // du tube nu du palier, est même PLUS claire que les murs — 1,34 du mur nord ; à 0,22 d'émissif, elle sortait en
    // trapèze gris, 0,68 : le spot du tube ne regarde que vers le bas)
    // (13/10, photo 25 à sa pose refaite (roulis −1,7°) : 1,07 du mur nord, comme dans le jeu, mais sans bleu — R/V/B
    // 1,06/1,08/1,08, le jeu 1,04/1,08/1,12 : un rien plus chaud)
    beton: std({ color: 0xece6da, roughness: 0.88, emissive: 0xdcd4c4, emissiveIntensity: 0.55 }, 'béton peint (escalier est)'),
    // (lot H, 11/10, photo 25 : les contremarches sont gris très foncé, ≈ 0,35 des girons — à #151311 elles sortaient
    // d'un noir d'encre, 0,02 du mur)
    contremarche: std({ color: 0x1f1f20, roughness: 0.7 }, 'contremarche noire'),
    // (relecture du lot H, 11/10, photo 25 agrandie : le nez est une BANDE NOIRE luisante de 4 à 5 cm au bord de la
    // marche, l'aluminium n'en est que l'arête et la lèvre, gris mat ; dans le jeu, l'aluminium poli prenait l'orangé de
    // la carte d'environnement — un listel doré de 2 cm devant une bande grise : voir nez())
    nez: std({ color: 0x7c7a74, roughness: 0.5, metalness: 0.35 }, 'nez de marche aluminium'),
    bande: std({ color: 0x1b1b1b, roughness: 0.42 }, 'bande antidérapante'),
    // (lot H, 11/10, photo 25 : la plinthe rampante est GRIS FONCÉ, du ton des contremarches dans l'ombre — noire, elle
    // dessinait de larges coins noirs le long des volées)
    limon: std({ color: 0x2a2826, roughness: 0.55, side: THREE.DoubleSide }, 'plinthe rampante gris foncé'),
    rail: std({ color: 0x1e1c1a, roughness: 0.36, metalness: 0.35 }, 'main courante noire'),
    // (13/10, photo 24 à sa pose refaite : le semi-fixe du hall rend 0,61 du mur blanc de la niche, le grand vantail du
    // vestibule 0,44 dans l'ombre — à #9d978f ils sortaient à 0,85 et 0,57, beige clair)
    taupe: std({ color: 0x847f78, roughness: 0.45 }, 'vantail gris taupe'),
    // (13/10, photos 24 et 26 : les chants des vantaux sont de BOIS brun — celui du vantail du hall, face à l'appareil, et
    // celui du petit vantail du vestibule, au bord gauche de la 24 et à droite sur la 26)
    // (14/10, photo 26 : au chant libre du petit vantail, la bande est rosée, claire — #5c3d26 la faisait acajou)
    chant: std({ color: 0x7a5840, roughness: 0.55 }, 'chant de bois des vantaux'),
    // (lot H, 11/10 : le petit vantail du vestibule, gris moyen — photo 26, 0,56 du mur ; repeint depuis la VO, où il
    // était crème) ; le tirant en U inox BROSSÉ du grand vantail (photo 24 : clair, il prend la lumière ; l'inox poli
    // de js/ecole_portes.js sortait noir dans la carte d'environnement) ; le verre clair de son oculus
    grisVantail: std({ color: 0x777571, roughness: 0.5 }, 'vantail gris moyen (petit vantail du vestibule)'),
    inox: std({ color: 0xc4c6c7, roughness: 0.32, metalness: 0.45 }, 'tirant inox brossé'),
    // (13/10 : le cercle chromé des hublots — clair sous sa propre lampe, la carte d'environnement le rendait gris sombre)
    chrome: std({ color: 0xd6d6d3, roughness: 0.3, metalness: 0.1, emissive: 0x9a9894, emissiveIntensity: 0.6 }, 'cercle chromé des hublots'),
    creme: std({ color: 0xe9dcc8, roughness: 0.45 }, 'vantail crème'),
    // (lot H, 11/10 : le fond de la partie est — l'enduit du mur sur cour, comme la façade arrière du 2e, et le toit
    // de son local, un gravier gris comme celui de l'aile de la Robert Kahn)
    enduit: std({ color: 0xd8d6cf, roughness: 0.92 }, 'enduit du mur du fond (partie est)'),
    toit: std({ color: 0x8e8b85, roughness: 0.95 }, 'toit du local de la partie est'),
    // (13/10, photo 24 : le chambranle rend 0,99 du mur blanc, et chaud — R/V/B 1,07/0,98/0,82 ; à #e4dccb il sortait
    // 1,16, presque blanc ; à #cfba96, 0,90 et trop jaune)
    bois: std({ color: 0xe0cdb7, roughness: 0.5 }, 'huisserie de bois crème'),
    cadre: std({ color: 0xeeece6, roughness: 0.4 }, 'cadre de la cloison vitrée'),
    tapis: std({ map: texTapis(false, 0.3), roughness: 0.85 }, 'tapis strié noir'),
    tapis1: std({ map: texTapis(true), roughness: 0.9, color: 0x8a8a8a }, 'tapis strié du 1er'),
    reglette: std({ color: 0xf2f1ed, roughness: 0.4 }, 'réglette'),
    diffuseur: new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffe4b8).multiplyScalar(2.4) }),
    embout: std({ color: 0xe8701e, roughness: 0.5, emissive: 0xe8701e, emissiveIntensity: 0.5 }, 'embout de réglette'),
  };
  P.diffuseur.name = 'diffuseur de réglette allumé';
  P.verreOculus = new THREE.MeshStandardMaterial({ color: 0xe2eaec, roughness: 0.05, metalness: 0, transparent: true, opacity: 0.14, depthWrite: false });
  P.verreOculus.name = 'verre clair (oculus du vestibule)';
  P.etiquette = matPanneau(texEtiquetteFeu(), 0.5); P.etiquette.name = 'étiquette rouge « porte coupe-feu »';
  P.voyant = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x3bd16f).multiplyScalar(1.6) }); P.voyant.name = 'voyant vert';
  // (les vitres cannelées : opaques ici, éclairées par derrière — le bureau est allumé)
  // (lot H, 11/10 : la photo 24 rejouée au même point de vue — côté couloir, le verre est gris-vert sombre, #60696b, 0,55
  // du mur, le photocopieur bien lisible au travers ; à 0,16 d'émissif sur un fond blanc bleuté, il sortait presque
  // blanc, #a8a49b, 1,1 du mur : le fond gris-vert de texCannele, l'émissif à 0,04)
  // (13/10 : côté couloir, le verre imprimé à petits carreaux relevé sur les photos 24 et 26 — texVerreCouloir ; côté
  // hall, le cannelé du lot H ne change pas)
  for (const k of [1, 2]) {
    const t = k === 1 ? texVerreCouloir() : texCannele(false);
    P['cannele' + k] = std({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.04, roughness: 0.25, metalness: 0.05 }, k === 1 ? 'verre imprimé (cloison, côté couloir)' : 'verre cannelé ' + k);
  }
  for (const m of [P.jaune, P.orange]) detailPhoto(m, 'beton', 1, 1, { relief: 0.035, grain: 0, rugo: false });
  // (le lino clair : sa lumière cuite est celle du carrelage du rez-de-chaussée, moins forte — il renvoie plus)
  P.lino.lightMapIntensity = 0.6;
  // (relecture du 09/10 : mesuré sur la photo 24, le lino rend 0,62 du mur blanc voisin, et 1,0 dans le jeu — il
  // sortait presque blanc : un voile plus sombre sur sa texture)
  // (plan V2, lot H, 11/10 : à 0,76 il rendait encore 0,90-0,99 du mur au point de vue de la photo 24 ; celle-ci donne
  // #675740, 0,61 du mur blanc voisin, et un ton plus chaud que lui — R/V/B au mur 0,70/0,65/0,56)
  // (relecture du lot H : un rien moins chaud — le bleu au mur, 0,51 pour 0,56 sur la photo)
  // (13/10, photo 24 à sa pose refaite : il rend 0,59-0,62 du mur blanc de la niche, R/V/B 0,65/0,59/0,48 ; le jeu 0,71-0,76,
  // 0,79/0,72/0,63 — encore un cran trop clair et pas assez chaud)
  P.lino.color.setRGB(0.253, 0.244, 0.215);
  // (13/10, photo 24 : le tapis de la niche est anthracite, 0,22 du mur — le jeu 0,42, gris moyen à pastilles voyantes)
  // (13/10, relecture : 0,23 du mur blanc sur la photo, 0,27 dans le jeu à 0,5 — un cran de moins)
  P.tapis.color.setScalar(0.43);
  P.vinyle.lightMapIntensity = 0.8;
  // (13/10, photos 27 et 28 rejouées à leur pose : le vinyle du palier du 1er est brun sombre, 0,37 du mur du panneau
  // (R/V/B 0,40/0,35/0,28) — le jeu 0,6, taupe clair ; le vinyle des bandes du 2e, posé contre celui de
  // js/ecole_etage2.js, garde sa teinte)
  P.vinyle2 = P.vinyle.clone(); P.vinyle2.name = 'vinyle moucheté (bandes du 2e)';
  // (13/10, relecture : loin du tube, 0,33 du mur — le jeu 0,28 à (0,36 ; 0,32 ; 0,26))
  P.vinyle.color.setRGB(0.41, 0.37, 0.3);
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

// LE GRAND VANTAIL DU VESTIBULE (photo 24 rejouée au même point de vue ; lot H, 11/10) : posé par ch.porte sans oculus ni
// poignée, il est refait ici dans son repère (gonds en x 0, chant libre en x w ; « y » du plan = −z du vantail) : le
// panneau percé de l'oculus, le cadre de bois brun qui déborde de 4 mm sur les deux faces et fait l'ébrasement, le
// verre clair, le tirant en U inox sur les deux faces, l'étiquette rouge au-dessus de l'oculus sur la face −z (celle qu'on
// voit du couloir, le vantail rabattu contre le mur jaune)
// (relevés sur la photo 24 rejouée, rayons du point de vue jusqu'au plan du vantail : la fente de 0,52 à 1,70 m — et non
// 0,60-1,85 —, le tirant de 0,78 à 1,04 m, l'étiquette au-dessus de la fente, centrée à 0,26 m du chant libre et à 1,80 m)
function vantailVestibule(ch, v, w, h) {
  for (const o of v.children.filter((o) => o.isMesh && o.material === X.taupe)) { v.remove(o); o.geometry.dispose(); }
  // (relecture du lot H, 11/10 : la fente de 0,12 et un cadre qui ne déborde que de 4 mm — vu du vestibule, presque dans
  // le plan du vantail, l'ébrasement de 6,4 cm cachait tout le verre, et le jaune qu'on voit au travers sur la photo 24)
  // (13/10, photo 24 à sa pose refaite — l'appareil à 1,50 m et non 1,19 : les rayons renvoyés sur le plan du vantail
  // mettent le cadre de bois à 8,5 cm du chant libre (15,5 dans le jeu), de 0,55 à 1,85 m ; la VO q_0152 voit la fente de
  // 0,75 à 1,87 : 0,65-1,83 entre les deux, 10 cm de large. Le tirant, 0,23 m, de 0,92 à 1,15 m (VO q_0051 : 0,92-1,12),
  // entre le cadre et le chant ; l'étiquette rouge TOUT EN HAUT du vantail, à 11 cm du chant libre — et non à 1,80 m)
  const e = 0.02, c = 0.035, ox0 = w - 0.22, ox1 = w - 0.12, oh0 = 0.65, oh1 = 1.83;   // (la fente : 0,10 x 1,18)
  const P = (x0, x1, h0, h1, ep, m) => B(ch, v, x0, -ep, x1, ep, h0, h1, m);
  chantsBois(ch, v, w, h);
  // le panneau autour de la fente
  P(0.006, ox0 - c, 0.006, h - 0.006, e, X.taupe);
  P(ox1 + c, w - 0.006, 0.006, h - 0.006, e, X.taupe);
  P(ox0 - c, ox1 + c, 0.006, oh0 - c, e, X.taupe);
  P(ox0 - c, ox1 + c, oh1 + c, h - 0.006, e, X.taupe);
  // le cadre de bois brun (photo 24 : profond, il fait tout l'ébrasement de la fente)
  const n = ch.M.noyer, eb = e + 0.004;
  P(ox0 - c, ox0, oh0 - c, oh1 + c, eb, n); P(ox1, ox1 + c, oh0 - c, oh1 + c, eb, n);
  P(ox0, ox1, oh0 - c, oh0, eb, n); P(ox0, ox1, oh1, oh1 + c, eb, n);
  const vitre = P(ox0, ox1, oh0, oh1, 0.003, X.verreOculus); vitre.castShadow = false;
  // le tirant en U (Ø 22 mm, 0,26 m, à 0,055 m du panneau) sur les deux faces, à 7 cm du chant libre
  const xt = w - 0.045;
  for (const s of [1, -1]) {
    const y0 = s * e, y1 = s * (e + 0.066);
    B(ch, v, xt - 0.011, Math.min(y1, y1 - s * 0.022), xt + 0.011, Math.max(y1, y1 - s * 0.022), 0.92, 1.15, X.inox, { ombre: false });
    for (const hb of [0.95, 1.12]) B(ch, v, xt - 0.008, Math.min(y0, y1), xt + 0.008, Math.max(y0, y1), hb - 0.008, hb + 0.008, X.inox, { ombre: false });
  }
  // l'étiquette rouge (0,20 x 0,065), tout en haut du vantail, sur la face −z (« y » du plan +e)
  ch.panneau(X.etiquette, 0.2, 0.065, w - 0.21, e + 0.0015, h - 0.045, 'N', v);
}
// LES CHANTS DE BOIS d'un vantail (photos 24, 26 ; 13/10) : 6 mm de bois brun au chant des gonds et au chant libre, dans
// le repère du vantail (gonds en x 0, le vantail vers s)
function chantsBois(ch, v, w, h, s = 1) {
  for (const [a, b] of [[0, 0.006], [w - 0.006, w]]) B(ch, v, s * a, -0.0205, s * b, 0.0205, 0.006, h - 0.006, X.chant, { ombre: false });
}
// UN BLOC DE SORTIE de cette partie de l'école (13/10, photos 24 à 26 : 0,26 x 0,125 m, plus court que les blocs du hall —
// celui de ch.sortie, 0,36 m, ramené à sa largeur)
function sortieEst(ch, x, y, h, face) {
  ch.sortie(x, y, h, face);
  const g = ch.decor.children[ch.decor.children.length - 1];
  g.scale.set(0.74, 1, 1);
  return g;
}

// LA RÉGLETTE FLUORESCENTE MURALE (photos 25, 28) : un tube T8 sous un diffuseur blanc, embouts orange, posée à plat
// contre un mur nord-sud (`face` 'E' ou 'W' : le côté où elle regarde), de y0 à y1, à la hauteur h
function reglette(ch, parent, x, y0, y1, h, face) {
  const s = face === 'E' ? 1 : -1, xa = x, xb = x + s * 0.085;
  B(ch, parent, xa, y0, xb, y1, h - 0.03, h + 0.04, X.reglette, { ombre: false });
  // (14/10, relecture, photo 28 agrandie : le diffuseur allumé va d'un bout à l'autre, arrondi ; l'embout orange n'est
  // qu'un liseré de 1 cm derrière lui, à peine vu au bout sud — ceux du jeu, des coins orange de 3 cm plus gros que le
  // corps, se voyaient du palier comme deux taquets)
  B(ch, parent, x + s * 0.012, y0 + 0.01, x + s * 0.092, y1 - 0.01, h - 0.045, h - 0.03, X.diffuseur, { ombre: false });
  B(ch, parent, x + s * 0.085, y0 + 0.01, x + s * 0.092, y1 - 0.01, h - 0.03, h + 0.03, X.diffuseur, { ombre: false });
  for (const [a, b] of [[y0, y0 + 0.01], [y1 - 0.01, y1]]) B(ch, parent, xa, a, x + s * 0.086, b, h - 0.04, h + 0.04, X.embout, { ombre: false });
  parent.children.slice(-5).forEach((o) => { o.userData.horsAOSol = true; });
  // (13/10, photos 25, 27 et 28 : le tube allumé baigne le mur autour de lui — une lueur additive sur le nu du mur, comme
  // les auréoles des plafonniers ; la réglette du jeu n'était qu'un trait blanc sur un mur égal)
  if (!X.lueurTube) {
    const t = canvasTex(128, 64, (g, w, hh) => {
      g.fillStyle = '#000'; g.fillRect(0, 0, w, hh);
      g.save(); g.translate(w / 2, hh / 2); g.scale(1, hh / w);
      const gr = g.createRadialGradient(0, 0, 0, 0, 0, w / 2);
      gr.addColorStop(0, 'rgb(170,170,170)'); gr.addColorStop(0.35, 'rgb(90,90,90)'); gr.addColorStop(0.7, 'rgb(28,28,28)'); gr.addColorStop(1, 'rgb(0,0,0)');
      g.fillStyle = gr; g.fillRect(-w / 2, -w / 2, w, w); g.restore();
    }, null, false, 1);
    X.lueurTube = new THREE.MeshBasicMaterial({ map: t, color: new THREE.Color(0xfff0d2).multiplyScalar(1.5), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
    X.lueurTube.name = 'lueur des réglettes';
  }
  const lu = new THREE.Mesh(new THREE.PlaneGeometry(Math.abs(y1 - y0) + 0.9, 0.9), X.lueurTube);
  lu.position.set(x + s * 0.004, h, -(y0 + y1) / 2); lu.rotation.y = s * Math.PI / 2; lu.renderOrder = 2; lu.userData.horsAOSol = true; parent.add(lu);
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
  // (14/10, photos 26 et 28 agrandies : le tube fait 42 à 45 mm — 60 à 70 px à 1 m)
  const tube = maille(new THREE.TubeGeometry(chemin, Math.max(8, Math.ceil(L * 14)), 0.021, 10, false), X.rail, 0, 0, 0, 0, parent);
  tube.castShadow = true;
  // les deux bouts fermés
  for (const p of [V[0], V[V.length - 1]]) maille(new THREE.SphereGeometry(0.021, 10, 6), X.rail, p.x, p.y, p.z, 0, parent, { ombre: false });
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
// (relecture du lot H, 11/10, photo 25 agrandie : l'aluminium n'est que l'ARÊTE, un filet clair de 6 mm sur le dessus et
// sur la lèvre ; la bande noire luisante fait les 4,5 cm suivants du dessus, et le bas de la lèvre est sombre — dans le
// jeu, la lèvre d'aluminium de 3,2 cm, face à l'appareil, faisait un listel clair sous chaque marche)
function nez(ch, parent, a, sens, y0, y1, h) {
  B(ch, parent, a, y0, a + sens * 0.006, y1, h, h + 0.003, X.nez, { ombre: false });
  B(ch, parent, a + sens * 0.006, y0, a + sens * 0.05, y1, h, h + 0.0025, X.bande, { ombre: false });
  B(ch, parent, a - sens * 0.009, y0, a - sens * 0.006, y1, h - 0.006, h + 0.003, X.nez, { ombre: false });
  B(ch, parent, a - sens * 0.009, y0, a - sens * 0.006, y1, h - 0.032, h - 0.006, X.bande, { ombre: false });
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
// (10/10 : les mêmes outils et les mêmes matières pour la descente au -1 et le sas technique, js/ecole_soussol_est.js)
export const outilsEst = { mur, chambranle, reglette, mainCourante, limon, volee, geoDalles, texMouchete, texAfficheIris, matieres: () => X };

// =====================================================================
//  LE REZ-DE-CHAUSSÉE (crochet de js/carte_ecole.js)
// =====================================================================
export function poserEst(ch, { RECT }) {
  const { C, M } = ch, D = ch.decor;
  X = matieresEst();
  const E = EST, B0 = M.blanc;

  // ---- LE SOL : le lino moucheté clair, du seuil de la porte du hall au fond de la cage (photos 24, 26) ----
  // (le carrelage du rez-de-chaussée s'arrête au mur du hall et au mur jaune : js/carte_ecole.js RN)
  // (10/10 : coupé au droit de la descente au -1 — la volée A sous la volée 2, x 16,95-18,70 — et sous la volée 1 et le
  // palier intermédiaire, qui ne sont plus pleins : d'en bas on y voyait flotter le lino ; js/ecole_soussol_est.js)
  const lino = new THREE.Mesh(geoDalles([[E.xJ, E.yH, 16.2, 12.45], [16.2, E.yH, E.xM + 0.3, 9.15], [16.2, 9.15, 16.95, 10.65]], 0, RECT), X.lino);
  lino.receiveShadow = true; lino.name = 'lino du couloir est'; lino.userData.nofuse = true;
  ch.scene.add(lino);
  // LE JOINT DE LÉ est-ouest (photo 24 : un trait fin et sombre en travers du couloir ; rejoué au même point de vue, il
  // tombe en y 9,59-9,62, du mur jaune au pied du poteau) : un filet de 5 mm, une ombre légère posée sur le lino
  {
    const m = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
    m.name = 'joint de lé du lino';
    // (13/10 : en y 9,46 — les photos 24 et 26, chacune à sa pose refaite, le renvoient au sol en y 9,46-9,47 et 9,43-9,49 ;
    // il file du mur jaune au bord du tapis de la niche)
    const j = new THREE.Mesh(new THREE.PlaneGeometry(16.22 - XN, 0.005), m);
    j.rotation.x = -Math.PI / 2; j.position.set((XN + 16.22) / 2, 0.0012, -9.46); j.name = 'joint de lé';
    j.userData.horsAOSol = true; j.userData.nofuse = true; D.add(j);
  }

  // =====================================================================
  //  LE HALL : LA PORTE À 1,5 VANTAIL, LA CLOISON VITRÉE, LE BUREAU (photos 24, 26)
  // =====================================================================
  // (le mur nord du hall, percé de x 14,70 à 16,10 : js/carte_ecole.js) — l'huisserie de bois crème ; le vantail de
  // 0,92 m à l'ouest (gonds à l'ouest, oculus cerclé de bois) s'ouvre tout seul ; le semi-fixe de 0,48 m à l'est, fermé,
  // porte l'affiche violette « POINT ÉCOUTE » côté couloir. (Au jambage ouest, côté couloir, le mur jaune prend la place
  // du chambranle.)
  // (13/10 : côté couloir, le jambage ouest a son chambranle lui aussi — photo 24, 8 cm de crème entre la baie et le
  // jaune, dont le nu recule en 14,63, XN)
  chambranle(ch, D, 'x', E.yH, 14.70, 16.10, 0, 2.06, 0.15, { 1: [true, true], [-1]: [true, true] });
  // (10/10 : le vantail ouest est OUVERT À DEMEURE, rabattu côté hall contre la face jaune de la pile — VO q_0027-0031 :
  // son chant contre l'angle de la pile, le couloir vu au travers ; photo 24 (2026) : toujours ouvert)
  // (13/10, photo 24 à sa pose refaite : le semi-fixe fait 0,51 m (210 px pour 581 de baie) — 0,50 + 0,90 ; l'oculus du
  // vantail comme celui du vestibule, près du chant libre ; son chant des gonds, de bois brun, face au couloir)
  {
    const P = ch.porte('x', E.yH, 15.15, { l: 0.9, h: 2.06, modele: 'grise', etat: 'ouverte', angle: 1.5, cote: 'S', huisserie: false, oculus: { bas: 0.65, haut: 1.83, l: 0.1, bord: 0.17, cadre: 0.035 }, matVantail: X.taupe, nom: 'couloir est (hall)' });
    chantsBois(ch, P.vantaux[0].g, 0.9, 2.06, P.vantaux[0].s);
  }
  ch.porte('x', E.yH, 15.85, { l: 0.5, h: 2.06, modele: 'grise', etat: 'fermee', cote: 'N', huisserie: false, oculus: false, poignee: null, fermePorte: false, matVantail: X.taupe, nom: 'couloir est (semi-fixe)' });
  // (13/10 : l'affiche de 15,74 à 15,95, de 1,49 à 1,78 m ; le bloc de sortie, 0,26 x 0,125, centré en 15,40 à 2,235 m —
  // il était à 2,33, plus large d'un tiers)
  ch.panneau(matPanneau(texPointEcoute(), 0.6), 0.21, 0.297, 15.845, E.yH + 0.068, 1.632, 'N');
  sortieEst(ch, 15.4, E.yH + 0.1, 2.235, 'N');
  // LA LUEUR DU HUBLOT sur le mur du fond du couloir (relecture du lot H, 11/10 : photo 24 rejouée, le mur au-dessus de la
  // porte du hall, à 0,65 m du hublot de y 8,3, est le plus clair du couloir — 1,47 du mur blanc voisin, 0,95 dans le jeu,
  // et la photo 26 le voit clair par la porte du vestibule : les spots ne regardent que vers le sol. Une lueur additive
  // posée sur le mur, du plafond vers le bas, comme les auréoles des plafonniers)
  {
    const t = canvasTex(128, 64, (g, w, h) => {
      g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
      const gr = g.createRadialGradient(w / 2, 0, 0, w / 2, 0, w / 2);
      gr.addColorStop(0, 'rgb(150,150,150)'); gr.addColorStop(0.45, 'rgb(70,70,70)'); gr.addColorStop(1, 'rgb(0,0,0)');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
    }, null, false, 1);
    const m = new THREE.MeshBasicMaterial({ map: t, color: new THREE.Color(0xffe9cc).multiplyScalar(2.4), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
    m.name = 'lueur du hublot (mur du fond du couloir est)';
    const p = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.75), m);
    p.position.set(15.4, HC - 0.375, -(E.yH + 0.078)); p.rotation.y = Math.PI; p.renderOrder = 2;
    p.userData.horsAOSol = true; D.add(p);
  }
  // LA CLOISON VITRÉE CANNELÉE (photos 24, 26 ; VO q_0027-0028, 10/10) : du jambage est de la porte à x 17,1, UN SEUL pan
  // de verre cannelé jusqu'à 2,45 m dans son cadre blanc (la photo 24 ne le voit que jusqu'à x ≥ 17,0 ; à 7,0 s, mesuré
  // contre le semi-fixe, il finit en x 17,02), la cloison pleine au-dessus ; le photocopieur est contre lui CÔTÉ HALL
  // (js/ecole_hall.js). Puis, jusqu'au mitoyen, un MUR BLANC PLEIN : côté hall les étiquettes ocre « INFORMATIQUE »
  // (js/ecole_hall.js), derrière le dégagement et la gaine de l'ascenseur. (Plus de « bureau du photocopieur » : la vidéo
  // ne montre ni ses deux murs ni sa porte, l'angle est ouvert sur le hall, et la porte x 19,08 tomberait dans la gaine.)
  const yv = E.yH, xC = 17.1;
  for (const x of [16.25, xC - 0.05]) B(ch, D, x, yv - 0.035, x + 0.05, yv + 0.035, 0, 2.46, X.cadre, { ombre: false });
  B(ch, D, 16.25, yv - 0.035, xC, yv + 0.035, 0, 0.05, X.cadre, { ombre: false });
  // (13/10, photos 24 et 26 à leur pose refaite : CÔTÉ COULOIR, le verre monte jusqu'au plafond — son haut à 2,52-2,55 m,
  // 53 px au-dessus du linteau de la porte, un cadre de 5 cm sous le plâtre — et repose sur une allège blanche de 10 cm ;
  // le jeu l'arrêtait à 2,40 sous 15 cm de mur. Côté hall, rien ne change : la traverse à 2,40 et le mur au-dessus)
  B(ch, D, 16.25, yv - 0.035, xC, yv, 2.4, 2.46, X.cadre, { ombre: false });
  for (const x of [16.25, xC - 0.05]) B(ch, D, x, yv, x + 0.05, yv + 0.035, 2.46, HC, X.cadre, { ombre: false });
  B(ch, D, 16.25, yv, xC, yv + 0.035, 2.5, HC, X.cadre, { ombre: false });
  B(ch, D, 16.25, yv, xC, yv + 0.035, 0.05, 0.1, X.cadre, { ombre: false });
  // (côté hall, le dégagement derrière est plus sombre que le hall : le verre y sort gris vert, à peine éclairé — VO 7,0 s)
  // (lot H, 11/10, VO q_0027-0031 : gris-vert sombre, ≈ 0,6 du mur « INFORMATIQUE » voisin — il sortait à 0,8-0,9 ;
  // le photocopieur est devant lui, côté hall : le verre sans sa silhouette)
  // (relecture du lot H, 11/10 : VO q_0031 agrandie, il est gris-taupe, sans bleu — R/V/B au mur « INFORMATIQUE »
  // 0,66/0,63/0,58 ; il sortait bleu ardoise : le fond plus bleu du côté couloir, ramené au neutre ici)
  const canHall = X.cannele2.clone(); canHall.emissiveIntensity = 0.02; canHall.color.setRGB(1.0, 0.85, 0.72);
  ch.panneau(canHall, xC - 16.35, 2.35, (16.3 + xC - 0.05) / 2, yv - 0.006, 1.225, 'S');
  ch.panneau(X.cannele1, xC - 16.35, 2.4, (16.3 + xC - 0.05) / 2, yv + 0.006, 1.3, 'N');
  B(ch, D, 16.25, yv - 0.075, xC, yv, 2.46, H_DALLE, B0, { ombre: false });
  B(ch, D, 16.25, yv, xC, yv + 0.075, HC, H_DALLE, B0, { ombre: false });
  C.ajouterBoite(16.25, -(yv - 0.075), xC, -(yv + 0.075), { y1: H_DALLE });
  // (la feuille A4 scotchée sur le verre, photo 24) (relecture du lot H, 11/10 : elle est scotchée CÔTÉ HALL — la VO
  // q_0031 la montre imprimée, nette sur le verre ; du couloir, la photo 24 n'en voit que le dos, uni et gris clair, et
  // son milieu à 1,40 m, non 1,55 (30 px plus bas au même point de vue). Et elle était dans le plan même du verre,
  // yv + 0,006 : les deux se disputaient la profondeur, en hachures noires. Posée 3 mm devant, de chaque côté)
  {
    // (13/10, relecture : au travers du verre, son dos rend 0,78 du mur blanc de la niche — 1,05 dans le jeu, une feuille
    // blanche et nette)
    const dos = new THREE.MeshStandardMaterial({ color: 0x9c9d98, roughness: 0.85 }); dos.name = 'feuille A4 (dos)';
    // (13/10 : à la pose refaite de la photo 24, elle va de x 16,39 à 16,61 et de 1,38 à 1,67 m — et non de 16,51 à 16,73
    // autour de 1,40 ; la photo 26 la revoit au même endroit)
    ch.panneau(dos, 0.21, 0.297, 16.5, yv + 0.009, 1.525, 'N');
    ch.panneau(matPanneau(texAffiche('#e8e6df', '#f4f3ee', 90), 0.8), 0.21, 0.297, 16.5, yv - 0.009, 1.525, 'S');
  }
  // le mur plein : plinthe de bois côté hall, gris foncé côté dégagement
  mur(ch, D, { de: [xC, yv], a: [E.xM, yv], mats: B0, plinthes: ['N', ['S', M.bois]] });

  // =====================================================================
  //  LE COULOIR EST (photo 24)
  // =====================================================================
  // LE MUR JAUNE à l'ouest (de la porte du hall à celle du vestibule), plinthe gris foncé ; puis le mur du vestibule
  // (13/10 : son nu en 14,63, XN — son dos, 14,525, ne bouge pas)
  const xAxeJ = (14.525 + XN) / 2, epJ = XN - 14.525;
  mur(ch, D, { de: [xAxeJ, 7.65], a: [xAxeJ, 10.65], ep: epJ, mats: { E: X.jaune, W: B0 }, plinthes: ['E'] });
  // (10/10 : le mur ouest du VESTIBULE est jaune lui aussi — VO q_0154-0160 et q_0361-0365, la même peinture ; aucune
  // photo de 2026 ne le montre — et porte l'affiche à la pomme, sous verre, à baguette noire (0,60 x 0,85, centre à
  // 1,55 m). Au mur nord, collé à l'angle, le déclencheur manuel rouge à 1,35 m)
  mur(ch, D, { de: [xAxeJ, 10.8], a: [xAxeJ, 12.45], ep: epJ, mats: { E: X.jaune, W: B0 }, plinthes: ['E'] });
  B(ch, D, XN, 11.29, XN + 0.015, 11.91, 1.115, 1.985, M.noirMat, { ombre: false });
  ch.panneau(matPanneau(texAffichePomme(), 0.18), 0.6, 0.85, XN + 0.017, 11.6, 1.55, 'E');
  B(ch, D, XN + 0.025, 12.41, XN + 0.115, 12.45, 1.27, 1.43, M.rougeEtiquette, { ombre: false });
  B(ch, D, XN + 0.037, 12.405, XN + 0.103, 12.41, 1.285, 1.335, M.boitier, { ombre: false });
  // LA PLAQUE DIRECTIONNELLE à lames bleues
  // (relecture du lot H, 11/10 : 0,58 x 0,29 m, centrée en y 9,05 à 1,45 m — et non 0,40 x 0,40 en y 8,65 à 1,55 m.
  // Photo 24 rejouée, ses deux chants renvoyés sur le nu du mur jaune : y 8,76-9,34, de 1,22 à 1,50 m ; mais à cette
  // pose, tout ce qui est près de l'appareil à droite tombe 30 à 65 px plus bas que dans le jeu — le tirant du vantail
  // du vestibule, que la VO q_0051 met à 0,92-1,12 m —, et la VO q_0050-0051 la voit vers 1,5-1,6 m : 1,45 m entre les
  // deux. Vue de jeu, elle tombait carrée et 30 px trop loin vers le hall)
  // (13/10, photo 24 à sa pose refaite — l'appareil à 1,50 m, piqué −9,2° : ses quatre coins renvoyés sur sa face tombent
  // en y 8,42-9,06 et de 1,41 à 1,73 m — 0,57 x 0,32 m, centrée en y 8,75 à 1,57 m, là où la VO la voyait ; c'est un
  // caisson de 2,5 cm. Ses lames, mesurées sur la photo, sont d'un bleu ardoise : #556b85, 0,63 du mur blanc)
  B(ch, D, XN, 8.465, XN + 0.025, 9.035, 1.41, 1.73, M.noirMat, { ombre: false });
  ch.panneau(matPanneau(texDirection(), 0.42), 0.57, 0.32, XN + 0.027, 8.75, 1.57, 'E');
  // le bloc de sortie en drapeau sur le mur jaune, près de la porte du vestibule (photo 24, en haut à droite)
  sortieEst(ch, XN + 0.16, 10.5, 2.41, 'S');
  // LE POTEAU GRIS (x 16,2-16,35, y 9,0-9,15) : l'angle du bloc de l'escalier, peint, éraflé ; son butoir noir
  // (13/10, relecture de la photo 24 agrandie, ses arêtes renvoyées au plafond et au sol : il fait 10,5 cm de face — x
  // 16,21-16,315, et non 15 cm — et AVANCE de 4,5 cm devant le mur blanc de la niche, sa face nord en y 9,195 ; un peu
  // plus sombre aussi : sa face nord rend 0,51 du mur, 0,37 au pied — 0,62 partout dans le jeu)
  // (14/10 : le poteau, le bloc au-dessus du plafond et le bout ouest du mur sud de la cage s'arrêtent 2 cm sous le plancher
  // du 1er — leurs dessus, dans le plan même du vinyle du palier, y dessinaient un triangle blanc au pied de l'arrivée de
  // la volée 2, photo 27 rejouée)
  B(ch, D, 16.21, 9.0, 16.315, 9.195, 0, N1 - 0.02, X.poteau, { collision: true });
  // (sa face nord, à contre-jour du hall : 0,3 à 0,5 du mur blanc sur la photo, sa face ouest 0,45 à 0,75 et plus chaude)
  B(ch, D, 16.21, 9.195, 16.315, 9.1965, 0.08, HC, X.poteauN, { ombre: false });
  // (13/10 : son dessous était dans le plan même des plafonds — un rectangle blanc au plafond, à droite de la tête du poteau)
  B(ch, D, E.x0, 9.0, 16.21, 9.15, HC + 0.012, N1 - 0.02, B0, { ombre: false });       // (au-dessus du plafond, vu de la volée 2)
  B(ch, D, 16.2, 8.99, 16.325, 9.205, 0, 0.08, X.plinthe, { ombre: false });
  // (13/10, photo 24 à sa pose refaite : le butoir en x 16,27 à 0,88 m)
  const butoir = maille(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 12), M.noirMat, 16.27, 0.88, -(9.195 + 0.015), 0, D, { ombre: false });
  butoir.rotation.x = Math.PI / 2;
  // LE MUR SUD DE LA CAGE (y 9,0-9,15) : côté dégagement, côté niche ; jusqu'au plancher du 1er
  mur(ch, D, { de: [16.315, E.yS], a: [E.xD + 0.27, E.yS], h: N1 - 0.02, mats: B0, plinthes: ['S'] });
  mur(ch, D, { de: [E.xD + 0.27, E.yS], a: [E.xM, E.yS], h: N1, mats: B0, plinthes: ['S'] });
  B(ch, D, 16.315, 9.15, 16.95, 9.165, 0, 0.08, X.plinthe, { ombre: false });
  // LA NICHE sous la volée 2 = LA TÊTE DE LA DESCENTE AU -1 (VO q_0050-0063, q_0143-0153 ; photo 24 ; 10/10) : le tapis
  // de caoutchouc strié couvre le palier de tête (x 16,3-16,95), puis la volée A descend vers l'est sous la volée 2
  // (js/ecole_soussol_est.js). À chaque bord, LE POTEAU : la main courante qui monte de la descente fait en tête un
  // retour horizontal et plonge jusqu'au sol (Ø 38 mm, crosse vers 0,92 m : VO q_0149, la main courante y arrive dans sa
  // pente) ; sur lui, le PORTILLON anti-chute — cadre de fer plat noir 0,27 x 0,40 (de 0,45 à 0,85 m) sur deux paumelles laiton, replié à plat contre son mur, ouvert (celui du
  // sud est la « boucle noire » de la photo 24). L'interrupteur reste au mur sud.
  // (13/10, photo 24 à sa pose refaite : le bord ouest du tapis part du pied du poteau, x 16,19-16,24 — et non 16,30 ;
  // l'interrupteur en x 16,37 à 1,12 m ; le portillon du sud est NOIR sur ses quatre côtés, sans traverse de bois)
  B(ch, D, 16.22, 9.17, 16.95, 10.63, 0, 0.008, X.tapis, { ombre: false });
  B(ch, D, 16.34, 9.15, 16.42, 9.162, 1.08, 1.16, M.boitier, { ombre: false });
  B(ch, D, 16.365, 9.162, 16.395, 9.17, 1.1, 1.14, M.boitier, { ombre: false });
  {
    const laiton = new THREE.MeshStandardMaterial({ color: 0xc9a046, roughness: 0.35, metalness: 0.8 }); laiton.name = 'paumelle laiton';
    for (const [yp, s] of [[9.229, 1], [10.571, -1]]) {
      // (s : +1 au sud, le mur en y 9,15 ; -1 au nord, l'échiffre en y 10,65) ; le portillon entre le poteau et son mur
      mainCourante(ch, D, [[16.92, yp, 0.004], [16.92, yp, 0.919], [17.03, yp, 0.919], [17.32, yp, 0.697]], []);
      const yg = yp - s * 0.034, ya = yg - 0.004, yb = yg + 0.004;
      for (const [xa, xb, ha, hb, m] of [[16.65, 16.9, 0.83, 0.86, M.acierNoir], [16.65, 16.9, 0.42, 0.45, M.acierNoir], [16.65, 16.68, 0.42, 0.86, M.acierNoir], [16.87, 16.9, 0.42, 0.86, M.acierNoir]]) B(ch, D, xa, ya, xb, yb, ha, hb, m);
      // (13/10, photo 24 agrandie : le cadre de x 16,66 à 16,92, de 0,42 à 0,86 m — 4 cm plus près de son poteau)
      for (const h of [0.54, 0.76]) B(ch, D, 16.893, yg - 0.006, 16.915, yg + 0.006, h - 0.04, h + 0.04, laiton, { ombre: false });
      C.ajouterCercle(16.92, -yp, 0.03, { y1: 0.95 });
      C.ajouterBoite(16.65, -(s > 0 ? 9.15 : 10.65), 16.9, -(yg + s * 0.006), { y0: 0.4, y1: 0.86 });
    }
  }
  // LES PLAFONDS de plâtre à 2,55 m : le couloir, le dégagement, le bord de la niche (la sous-face de la volée 2 descend
  // ensuite vers l'est) ; le détecteur de fumée ; les deux hublots ronds (comme ceux du C05, photo 05)
  // (plan V2, lot H, 11/10 : la photo 24 rejouée au même point de vue — le plafond du couloir est nettement plus sombre
  // que les murs et chaud, 0,61 du mur, R/V/B au mur 0,91/0,76/0,63 : il ne reçoit que le rebond, et celui du mur jaune ;
  // le plâtre commun sortait à 0,96, gris-beige. Un plâtre à lui, teinté de ce rebond, pour le couloir et le dégagement)
  // (relecture du lot H, 11/10 : teinté d'un bout à l'autre, il sortait orange-brun partout, 0,46 à 0,62 du mur — or la
  // photo 24 ne le voit chaud qu'au milieu, du côté du mur jaune (0,61 ; 0,91/0,76/0,63, et 1,05/0,86/0,66 contre lui),
  // neutre et clair ailleurs : 0,84 près du hublot du vestibule (0,95/0,91/0,99), 0,83 au bout du hall (0,97/0,90/0,86) ;
  // et la photo 26, par la porte du vestibule, le voit crème clair, plus clair que les murs du vestibule. Le rebond du
  // jaune s'efface donc à un mètre du mur : une carte en dégradé, de x 14,675 vers l'est, couleur et émissif)
  const platreJaune = M.platre.clone(); platreJaune.name = 'plafond en plâtre (couloir est, rebond du jaune)';
  platreJaune.map = canvasTex(256, 8, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, 0);          // (u : de 0 à 1,57 m, du mur jaune au dégagement)
    // (13/10, photo 24 à sa pose refaite, rapportée au mur blanc de la niche : contre le jaune, le plafond est plus clair
    // et orangé, 0,69 (R/V/B 0,88/0,66/0,44) — le jeu 0,56 ; au milieu 0,64, juste)
    gr.addColorStop(0, '#ffd9a6'); gr.addColorStop(0.22, '#f2ca9e'); gr.addColorStop(0.48, '#d6bea1'); gr.addColorStop(0.7, '#d7c8b4'); gr.addColorStop(1, '#d9cbb8');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  }, [1 / (16.2 - XN), 1], false, 1);
  platreJaune.color.set(0xffffff);
  // (14/10, relecture : du côté du vestibule, à 0,7 m du hublot, il rend 0,70 du mur blanc de la niche — 0,57 à 0,11 d'émissif)
  platreJaune.emissive.set(0xffffff); platreJaune.emissiveMap = platreJaune.map; platreJaune.emissiveIntensity = 0.17;
  // (le dessous seulement : ses retombées restent blanches — celle du vestibule, au-dessus de la volée 1, se voit de la cage)
  const plafondJaune = (...a) => { const m = ch.plafond(...a); m.material = platreJaune; };
  plafondJaune(XN, 7.65, 16.2, 10.65, HC, 'platre');
  // (10/10 : le dégagement finit sur la porte de l'ascenseur, x 17,9 — derrière, sa gaine : js/ecole_ascenseur.js)
  // (13/10, photo 24 à sa pose refaite : le plafond du dégagement et celui de la niche ne sont PAS plus clairs que celui
  // du couloir — 0,63 du mur blanc (0,73/0,61/0,49) derrière le poteau, 0,74 (0,80/0,73/0,68) au-dessus de la niche ; le
  // plâtre commun y sortait 0,72 et 0,84, presque blanc : deux triangles clairs de part et d'autre du poteau. Un plâtre
  // teinté pour chacun, sans dégradé)
  {
    const teinte = (c, nom) => { const m = M.platre.clone(); m.name = nom; m.color.set(c); return m; };
    ch.plafond(16.2, 7.65, ASC.xF, 9.0, HC, 'platre').material = teinte(0xebc8a6, 'plafond en plâtre (dégagement est)');
    // (13/10 : la sous-face de la volée 2, qui part maintenant de xD, ne passe sous 2,55 m qu'en x 16,89)
    ch.plafond(16.2, 9.15, 16.89, 10.65, HC, 'platre', { retombees: false }).material = teinte(0xf3e3d2, 'plafond en plâtre (niche est)');
  }
  // (13/10 : le détecteur en (16,12 ; 8,03) — les photos 24 et 26, chacune à sa pose, le renvoient au plafond en
  // (16,14 ; 8,03) et (16,13 ; 7,99) ; il était en (15,9 ; 9,0))
  const det = maille(new THREE.CylinderGeometry(0.055, 0.06, 0.035, 20), M.boitier, 16.12, HC - 0.018, -8.03, 0, D, { ombre: false });
  det.userData.horsAOSol = true;
  // (lot H, 11/10 : Ø 0,30 mesuré sur la photo 24 rejouée, à 1,5 m — r 0,19 les faisait trop grands)
  // (13/10, photo 24 à sa pose refaite : la vasque et son cercle chromé font 0,22-0,25 m hors tout, en (15,38 ; 8,43) et
  // (15,43 ; 9,95) — et non 0,30 en y 8,3 et 9,75 : celui du vestibule tombait 40 px trop bas sur la photo. Une vasque de
  // verre dans un CERCLE CHROMÉ à trois pattes : hublot())
  const hublot = (x, y, zone, o = {}) => {
    ch.opale(x, y, HC, zone, { r: 0.105, ...o });
    const g = D.children[D.children.length - 2];          // (le dernier enfant est son auréole)
    // (13/10, relecture de la photo 24 agrandie : la vasque est PLATE — un verre à peine bombé de 19 cm, 2 à 3 cm sous le
    // plafond, détaché de son cercle chromé de 23 cm, trois pattes ; la galette de 7 cm de ch.opale, vue d'en dessous et de
    // biais, pendait comme un seau)
    const corps = g.children[0];
    // (14/10 : à 1,3 cm du plafond — à 2,5 cm, l'occlusion ambiante creusait un anneau sombre, en dents de scie, entre le
    // verre et son cercle)
    corps.scale.set(0.9, 0.18, 0.9); corps.position.y = -0.0063;
    g.children[1].visible = false;                        // (sa couronne blanche : un large anneau gris entre le verre et le cercle)
    const cercle = maille(new THREE.TorusGeometry(0.117, 0.006, 8, 40), X.chrome, 0, -0.005, 0, 0, g, { ombre: false, recoit: false });
    cercle.rotation.x = Math.PI / 2; cercle.userData.horsAOSol = true;
    for (let k = 0; k < 3; k++) {
      const a = k * 2.094 + 0.5, p = maille(boiteM(0.008, 0.006, 0.022), X.chrome, Math.cos(a) * 0.104, -0.015, Math.sin(a) * 0.104, -a + Math.PI / 2, g, { ombre: false, recoit: false });
      p.userData.horsAOSol = true;
    }
    // (son auréole au plafond, large : photo 24, un halo clair de près d'un mètre autour de chaque hublot)
    // (13/10 : 1,5 m — à 0,7 m du hublot du nord, le plafond rend encore 0,70 du mur blanc de la niche ; 0,60 dans le jeu)
    ch.halo(x, y, HC, 1.5);
  };
  hublot(15.4, 8.44, 'couloirEst');
  hublot(15.43, 9.95, 'couloirEst');
  // LA LUEUR DES HUBLOTS SUR LE HAUT DU MUR JAUNE (13/10, photo 24 à sa pose refaite : sous le plafond, à hauteur des
  // hublots, le jaune est le plus clair du couloir — 0,97 du mur blanc de la niche, 0,70 dans le jeu, dont les spots ne
  // regardent que le sol ; au loin et en bas, il est juste). Comme celle du mur du fond : additive, du plafond vers le bas
  {
    const t = canvasTex(128, 64, (g, w, h) => {
      g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
      const gr = g.createRadialGradient(w / 2, 0, 0, w / 2, 0, w / 2);
      gr.addColorStop(0, 'rgb(150,150,150)'); gr.addColorStop(0.5, 'rgb(64,64,64)'); gr.addColorStop(1, 'rgb(0,0,0)');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
    }, null, false, 1);
    const m = new THREE.MeshBasicMaterial({ map: t, color: new THREE.Color(0xffb050).multiplyScalar(2.6), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
    m.name = 'lueur des hublots (mur jaune du couloir est)';
    for (const y of [8.44, 9.95]) {
      const p = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.9), m);
      p.position.set(XN + 0.004, HC - 0.45, -y); p.rotation.y = Math.PI / 2; p.renderOrder = 2; p.userData.horsAOSol = true; D.add(p);
    }
  }
  // (le dégagement : non vu, mais il n'est pas noir) (relecture du lot H, 11/10 : sa lumière cuite à moitié — pleine, elle
  // jetait sur le lino du couloir l'ombre du poteau gris, une bande sombre du poteau vers le vestibule, en travers de la
  // photo 24, dont le sol est uni)
  hublot(17.05, 8.3, 'couloirEst', { cuireForce: 0.45 });
  // L'ASCENSEUR (déduit : la même façade palière qu'au 1er, VO q_0274-0281), au bout du dégagement, desservi ; la
  // platine d'appel sur le mur de la cage (le mur du hall, au sud, est le cannelé et le mur « INFORMATIQUE »)
  poserAscenseur(ch, { base: 0, ouvert: true, y0: E.yH + 0.005, hMur: H_DALLE, zone: 'couloirEst', bouton: 'N' });

  // =====================================================================
  //  LA PORTE DU VESTIBULE ET LE VESTIBULE (photos 24 à 26)
  // =====================================================================
  // 1,5 vantail dans la ligne du mur d'échiffre : le vantail ouest (0,85 m, oculus cerclé de bois, bâton de tirage inox,
  // étiquette rouge) s'ouvre tout seul ; le vantail est (0,50 m, lisse) reste entrebâillé vers l'escalier (photo 26)
  mur(ch, D, { de: [14.525, E.yE], a: [E.x0, E.yE], mats: B0, ouvertures: [{ c: 15.375, l: 1.35, h: 2.1 }] });
  // (côté vestibule, le jambage est descend jusqu'au sol : le bout de la 1re marche bute dessus, photo 26)
  // (13/10 : le jambage ouest a son chambranle des deux côtés — VO q_0361-0365, une huisserie claire entre le vantail et
  // le jaune du vestibule ; le nu du mur jaune recule en 14,63, XN)
  chambranle(ch, D, 'x', E.yE, 14.70, E.x0, 0, 2.06, 0.15, { 1: [true, true], [-1]: [true, true] });
  // (10/10 : OUVERT À DEMEURE, rabattu côté couloir devant le mur jaune — VO q_0051-0055 et q_0151 : on voit sa face, son
  // oculus et son bâton contre le mur jaune ; photo 24 (2026) : ouvert aussi)
  // (plan V2, lot H, 11/10, photo 24 rejouée au même point de vue : sur sa face visible, un TIRANT EN U INOX brossé
  // près du chant libre — et non une barre noire —, l'OCULUS VITRÉ CLAIR dans son cadre de bois brun profond (on voit le
  // jaune au travers ; il sortait vert-noir, opaque), l'ÉTIQUETTE ROUGE en haut, au-dessus de l'oculus (sur la face
  // contre le mur jaune, on ne la voyait pas) : vantailVestibule)
  {
    const P = ch.porte('x', E.yE, 15.125, { l: 0.85, h: 2.06, modele: 'grise', etat: 'ouverte', angle: 1.45, cote: 'S', huisserie: false, oculus: false, poignee: null, fermePorte: false, matVantail: X.taupe, nom: 'vestibule est' });
    vantailVestibule(ch, P.vantaux[0].g, 0.85, 2.06);
  }
  // (relecture du 09/10, photo 26 : le petit vantail n'est qu'ENTREBÂILLÉ — une quinzaine de degrés ; ouvert à 70°, il
  // cachait le couloir et la cloison vitrée qu'on voit par la porte. Sa face côté vestibule est lisse : pas de ferme-porte)
  // (plan V2, lot H, 11/10 : RECALÉ au point de la photo 26 — pose résolue sur des repères lointains et sûrs : la feuille
  // A4 et le cadre du cannelé, l'affiche POINT ÉCOUTE, le chambranle et le gond (rms 13 px, appareil en (15,22 ; 11,61),
  // h 1,48, cap 140°, piqué −8,5°, roulis 2,7°) : son chant libre tombe à 0,49-0,50 m du gond, PRESQUE FERMÉ (0 à 5°) ;
  // à 0,55 m il sortirait 50 px trop à droite, à 0,60 m 120 px. La VO le confirme : q_0051-0057, il prend 34-36 % de la
  // baie de 1,35 m, soit 0,48-0,50. On garde donc 0,50 + 0,85 ; il est GRIS MOYEN (photo 26 : 0,56 du mur ; le taupe
  // sortait beige clair, 0,93). Côté couloir, la VO montre sa béquille noire en J et le ferme-porte en tête, à droite :
  // c'est LUI, alors crème, la « porte crème » des q_0050-0057 — son pied passe devant la plinthe du mur du fond, son
  // haut touche le linteau de la baie)
  {
    const P = ch.porte('x', E.yE, 15.8, { l: 0.5, h: 2.06, modele: 'grise', etat: 'ouverte', angle: 0.06, cote: 'N', charniere: 'd', huisserie: false, oculus: false, poignee: null, matVantail: X.grisVantail, nom: 'vestibule est (petit vantail)' });
    // (la béquille en J sur la face côté couloir — +z du vantail —, au chant libre, x −0,5)
    const v = P.vantaux[0].g, z = 0.02;
    // (13/10 : son chant libre, de bois — la bande brune du bord gauche de la photo 24, la bande rosée à droite du
    // vantail sur la photo 26 ; à la pose refaite de la 26, il reste presque fermé, son chant libre en (15,56 ; 10,72))
    chantsBois(ch, v, 0.5, 2.06, P.vantaux[0].s);
    B(ch, v, -0.475, -z - 0.012, -0.425, -z, 0.94, 1.1, M.noirMat, { ombre: false });
    B(ch, v, -0.455, -z - 0.06, -0.445, -z - 0.012, 1.03, 1.05, M.noirMat, { ombre: false });
    B(ch, v, -0.455, -z - 0.07, -0.33, -z - 0.05, 1.03, 1.05, M.noirMat, { ombre: false });
    B(ch, v, -0.34, -z - 0.07, -0.33, -z - 0.05, 0.99, 1.05, M.noirMat, { ombre: false });
  }
  // (lot H, 11/10 : le bloc de sortie côté vestibule est au-dessus du milieu de la baie, x ≈ 15,45 — photo 26 à la pose
  // résolue, en haut à droite ; en x 15,85, au-dessus du petit vantail, il sortait au milieu de l'image)
  // (13/10, photo 26 à sa pose refaite — (15,20 ; 11,61) à 1,41 m, cap 139,7, piqué −6,8°, roulis 2,1°, 8 px : son bout
  // est tombe en x 15,46 et son dessous à 2,12 m — centré en 15,33 à 2,19 m, 0,26 m de large)
  sortieEst(ch, 15.33, E.yE + 0.12, 2.19, 'N');
  // le mur nord du vestibule (et de la cage) : derrière lui, le local de 0,9 m (plan V2 : x 13,65-19,8 × y 12,6-13,5,
  // fermé, laissé vide), puis le mur du fond de la partie est (y 13,5-13,8 : fondPartieEst)
  // (10/10 : sa plinthe s'arrête au vestibule — sous la volée 1, qui n'est plus pleine, elle flottait au-dessus de la
  // volée B du -1)
  // (plan V2, lot H, 11/10 : PLUS DE PORTE à ce mur — la VO le montre nu d'un bout à l'autre, q_0156-0161 : le jaune, le
  // déclencheur au ras de l'angle, le mur blanc, puis la crosse de la main courante de la volée 1 ; la « porte crème » des
  // q_0050-0057 était le petit vantail du vestibule, voir plus haut. Le local n'a pas d'accès vu)
  // (13/10 : jusqu'à la 1re contremarche, xD — 23 cm de sol devant elle)
  mur(ch, D, { de: [13.65, E.yN], a: [E.xD, E.yN], h: N1, mats: B0, plinthes: ['S'] });
  mur(ch, D, { de: [E.xD, E.yN], a: [E.xM, E.yN], h: N1, mats: B0 });
  // (le plafond du vestibule reste le plâtre commun : photo 25, au-dessus de la volée 1 il est clair, pas teinté)
  // (relecture du lot H, 11/10 : clair, presque comme les murs — photo 25, son bord au-dessus de la 1re marche rend
  // 0,95 du mur nord ; à l'émissif commun de 0,12, il sortait à 0,41 : dans ce réduit blanc, il ne vit que du rebond)
  {
    // (13/10, photo 25 à sa pose refaite : le plafond bas n'entre pas dans son cadre — il finit donc avant x 16,23 : au
    // jambage, x0. La ligne claire du haut de la photo est le raccord de la sous-face de la volée 3 et du dessous du
    // palier à 5,05 m, en x 18,29 à 4,75 m ; au-dessus du sol devant la 1re marche, le dessous de la dalle du 1er)
    const m = ch.plafond(XN, 10.8, E.x0, 12.45, HC, 'platre');
    // (13/10 : 1,00 du mur nord et aussi chaud que lui sur la photo 25 — le jeu 0,95, R/V/B 0,93/0,95/0,99)
    m.material = M.platre.clone(); m.material.name = 'plafond en plâtre (vestibule est)'; m.material.emissiveIntensity = 0.46;
    m.material.color.set(0xf5eedf); m.material.emissive.set(0xe2d8c4);
  }
  // (lot H, 11/10 : les hublots de Ø 0,30 de la photo 24 — r 0,15 ; un peu moins forte, l'opale du vestibule ne fait plus
  // sortir le petit vantail beige clair)
  hublot(15.36, 11.62, 'vestEst', { force: 0.85 });
  // (le chant de la dalle du 1er au-dessus du vestibule, vu de la volée 1)
  // (13/10 : la dalle du 1er file jusqu'au départ des volées, xD)
  B(ch, D, E.x0 - 0.1, 9.15, E.xD, 12.45, H_DALLE, N1 - 0.012, X.beton, { ombre: false });
  // LE SOL DEVANT LA VOLÉE 1 (13/10, photo 26 : du jambage à la 1re contremarche, le revêtement sombre des marches ;
  // à son bord, au droit du jambage, la bande noire à deux filets d'aluminium — et son retour de 20 cm au pied du
  // chambranle ; dessous, la dalle que la volée, partie 23 cm plus loin, ne couvre plus)
  B(ch, D, E.x0, E.bN[0], E.xD, E.bN[1], -0.25, 0, X.beton, { ombre: false });
  B(ch, D, E.x0, E.bN[0], E.xD, E.bN[1], 0, 0.004, X.giron, { ombre: false });
  nez(ch, D, E.x0, 1, E.bN[0], E.bN[1], 0.004);
  B(ch, D, E.x0, E.bN[0], E.x0 + 0.09, E.bN[0] + 0.006, 0, 0.2, X.bande, { ombre: false });
  for (const x of [E.x0, E.x0 + 0.084]) B(ch, D, x, E.bN[0], x + 0.006, E.bN[0] + 0.008, 0, 0.2, X.nez, { ombre: false });

  // =====================================================================
  //  L'ESCALIER, DU REZ-DE-CHAUSSÉE AU 1er (photos 25, 26)
  // =====================================================================
  // le mitoyen est, prolongé au nord du hall ; le mur d'échiffre entre les deux volées
  // (10/10 : sa plinthe s'arrête au dégagement — au nord, la cage descend au -1, js/ecole_soussol_est.js)
  mur(ch, D, { de: [19.95, 7.65], a: [19.95, 9.075], ep: 0.3, h: N1, mats: B0, plinthes: ['W'] });
  mur(ch, D, { de: [19.95, 9.075], a: [19.95, 12.6], ep: 0.3, h: N1, mats: B0 });
  mur(ch, D, { de: [E.x0, E.yE], a: [E.xP, E.yE], h: N1, mats: B0 });
  // LE PALIER INTERMÉDIAIRE (1,75 m) contre le mitoyen ; ses plinthes ; le monde solide. (10/10 : une DALLE de 25 cm et
  // non plus un plein — dessous, le palier bas de la descente au -1, à -1,53 m)
  B(ch, D, E.xP, E.bS[0], E.xM, E.bN[1], E.hP1 - 0.25, E.hP1 - 0.02, X.beton);
  B(ch, D, E.xP, E.bS[0], E.xM, E.bN[1], E.hP1 - 0.02, E.hP1, X.giron);
  B(ch, D, E.xM - 0.015, E.bS[0], E.xM, E.bN[1], E.hP1, E.hP1 + 0.08, X.plinthe, { ombre: false });
  B(ch, D, E.xP + 0.05, E.bS[0], E.xM, E.bS[0] + 0.015, E.hP1, E.hP1 + 0.08, X.plinthe, { ombre: false });
  B(ch, D, E.xP + 0.05, E.bN[1] - 0.015, E.xM, E.bN[1], E.hP1, E.hP1 + 0.08, X.plinthe, { ombre: false });
  C.sol(E.xP, -E.bS[0], E.xM, -E.bN[1], E.hP1);
  C.ajouterBoite(E.xP, -E.bS[0], E.xM, -E.bN[1], { y0: E.hP1 - 0.25, y1: E.hP1, joueur: false });
  // LA VOLÉE 1 (vers l'est) et LA VOLÉE 2 (vers l'ouest) sur paillasse (10/10 : la volée 1 n'est plus pleine — la volée
  // B passe dessous ; et sous la volée 2, la volée A descend : plus de boîte au sol de la niche)
  const v1 = { x0: E.xD, sens: 1, y0: E.bN[0], y1: E.bN[1], b: 0, n: E.n, r: E.r1, g: E.g };
  const v2 = { x0: E.xP, sens: -1, y0: E.bS[0], y1: E.bS[1], b: E.hP1, n: E.n, r: E.r1, g: E.g };
  volee(ch, D, v1);
  volee(ch, D, v2);
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
  // (relecture du lot H, 11/10, photo 25 rejouée — sa pose tient les neuf nez à 2 px : les deux mains courantes de la
  // VOLÉE 1, renvoyées sur leur plan, sont à 1,00 m au-dessus des nez et non à 0,90 (de 9 à 15 cm plus haut, de la 2e à
  // la 6e marche) ; l'horizontale du palier, 14 px plus haut au fond, à 1,08 m. Et leur crosse ne part pas devant la 1re
  // contremarche : photo 26, elle plonge au-dessus de la 1re marche, en x ≈ 16,27 ; photo 25, au bord gauche, en x ≈ 16,2.
  // La volée 2 garde 0,90 : en haut, elle se raccorde à l'épingle du palier du 1er, js/ecole_est.js poserPalierEst)
  // (13/10, photos 25 et 26 à leur pose refaite — la 25 avec son roulis de −1,7° : renvoyées sur leur plan, les deux mains
  // courantes de la volée 1 sont à 0,85-1,05 m des nez, 0,93 en moyenne — et non 1,00. Celle de l'échiffre finit en crosse
  // au droit de la 1re contremarche (photo 26 : son bout en x 16,28 à 1,15 m) ; celle du mur nord descend 30 cm plus loin,
  // au-dessus du sol du vestibule (photo 25 : elle sort du cadre à gauche sans finir ; VO q_0160 : sa crosse à ≈ 1,3 m de
  // l'angle du mur jaune))
  const rail1 = (v, s) => rail(v, s) + 0.03;
  const crosse1 = (v, y, s0 = 0) => [[xv(v, s0), y, rail1(v, s0 + 0.09) - 0.13], [xv(v, s0 + 0.09), y, rail1(v, s0 + 0.09)]];
  // (plan V2, lot H, 11/10 : la photo 25 rejouée au même point de vue — la main courante horizontale du mur du fond ne
  // s'arrête pas en y 11,2 : elle file jusqu'au bout de l'échiffre, qui la cache au-delà de y ≈ 10,45, sur des consoles
  // en y ≈ 12,07 et 10,70 (et celle du mur nord en x ≈ 18,97). Comme au palier à 5,05 m (VO q_0356-0360, poserPalierEst),
  // elle est d'un seul tenant : le mur nord, le mitoyen, le mur sud, puis elle monte avec la volée 2 — sa crosse basse
  // disparaît ; une 3e console sur le mitoyen, une au mur sud)
  // (14/10, relecture : la VO de 2021 la montre à la hauteur de celle de l'échiffre — q_0278 au 1er, q_0281-0284 au 2e.
  // Le tube noir flou du bord gauche des photos 28 et 29, à hauteur d'œil, large de 55 px, n'est pas elle : à 0,4 m de
  // l'appareil, elle en ferait 160. Et la photo 28 ne la voit nulle part, pas même en bas à gauche, où son bout sortirait
  // s'il dépassait le mur comme en 2021 : elle court comme l'autre, à 0,95 m des nez, et revient au mur 10 cm avant son
  // bout — hors du cadre de la photo)
  // (14/10, RELECTURE : ce tube n'est ni elle ni un doigt — c'est le bout de la main courante du mur sud du PALIER, à 2 m
  // de l'appareil : poserPalierEst. Celle-ci court à 0,90 m des nez, comme celle de l'échiffre mesurée sur la photo 28 à
  // sa pose refaite, et finit en CROSSE devant le chant gris du bout du mur — VO q_0278, q_0280 : le tube plonge au bout,
  // sans revenir au mur ; son bout en x 16,71, hors du cadre des photos 28 et 29, qui coupent son plan en 16,65)
  const hH = E.hP1 + 1.08, xm = E.xM - 0.079, railS2 = (s) => rail(v2, s);
  // (13/10, photo 28 : celle du mur sud de la volée 2 finit au bout du mur, 30 cm avant l'arrivée, à 0,88 m du palier du
  // 1er — 1,10 m au-dessus des nez : elle court 20 cm plus haut que les autres — 14/10 : relevé abandonné, voir plus haut)
  mainCourante(ch, D, [...crosse1(v1, yN1, -0.33), [xv(v1, fin), yN1, rail1(v1, fin)], [18.7, yN1, hH], [xm, yN1, hH], [xm, yS2, hH], [18.62, yS2, hH],
    [xv(v2, 0.07), yS2, railS2(0.07)], [E.xD + 0.52, yS2, railS2(fin - 0.52)], [E.xD + 0.43, yS2, railS2(fin - 0.52) - 0.14]],
    [[xv(v1, 0.5), yN1, rail1(v1, 0.5), 'N'], [xv(v1, 1.6), yN1, rail1(v1, 1.6), 'N'], [19.0, yN1, hH, 'N'], [xm, 12.05, hH, 'E'], [xm, 10.7, hH, 'E'], [xm, 9.6, hH, 'E'],
      [19.1, yS2, hH, 'S'], [xv(v2, 0.5), yS2, railS2(0.5), 'S'], [xv(v2, 1.45), yS2, railS2(1.45), 'S']]);
  mainCourante(ch, D, [...crosse1(v1, yS1), [xv(v1, fin), yS1, rail1(v1, fin)], [E.xP + 0.06, yS1, rail1(v1, fin)], [E.xP + 0.06, E.bN[0], rail1(v1, fin)]],
    [[xv(v1, 0.5), yS1, rail1(v1, 0.5), 'S'], [xv(v1, 1.6), yS1, rail1(v1, 1.6), 'S']]);
  // (relecture du 09/10 : en haut, elle ne plonge pas — l'épingle de la photo 28 fait le tour du chant gris et repart
  // sur l'autre face de l'échiffre, en main courante de la volée 3 : js/ecole_est.js poserPalierEst)
  // (13/10, relecture de la photo 28 : à 0,95 m des nez — 5 cm de plus —, jusqu'à l'épingle du palier du 1er)
  // (14/10, RELECTURE : 0,90 m — les 5 cm de plus venaient de l'œil de la photo 28 pris 10 cm trop haut, voir poserPalierEst)
  mainCourante(ch, D, [[xv(v2, -0.02), yN2, rail(v2, -0.02) - 0.15], [xv(v2, 0.07), yN2, rail(v2, 0.07)], [xv(v2, fin), yN2, rail(v2, fin)]],
    [[xv(v2, 0.5), yN2, rail(v2, 0.5), 'N'], [xv(v2, 1.6), yN2, rail(v2, 1.6), 'N']]);
  // LE MUR D'ÉCHIFFRE PEINT EN ORANGE côté volée 2, au-dessus de la plinthe rampante et jusqu'à la sous-face de la volée
  // 4 (photo 28 ; le dessous, côté niche, reste blanc)
  {
    const r2 = E.r2, sofHaut = (x) => E.hP2 - 0.25 + (E.xP - x) * ((E.hP2 + (E.n - 1) * r2 - 0.3) - (E.hP2 - 0.25)) / fin;
    const sh = new THREE.Shape();
    const xa = E.x0 + 0.1;                       // (derrière le retour du chant gris)
    // (13/10 : de l'arrivée de la volée, xD, au chant gris, sa plinthe est à plat sur le palier du 1er)
    sh.moveTo(xa, N1 + 0.13); sh.lineTo(E.xD, N1 + 0.13); sh.lineTo(E.xP, rail(v2, 0) - 0.9 + 0.13);
    sh.lineTo(E.xP, sofHaut(E.xP)); sh.lineTo(E.xD, sofHaut(E.xD)); sh.lineTo(xa, sofHaut(E.xD));
    const o = new THREE.Mesh(new THREE.ShapeGeometry(sh), X.orange);
    o.position.z = -(E.bS[1] - 0.003); o.receiveShadow = true; o.userData.horsAOSol = true; D.add(o);
  }
  // LE PALIER INTERMÉDIAIRE : la réglette (≈ 2,5 m au-dessus de lui, vers le sud du mur), le bloc de sortie juste sous
  // le plafond, l'affiche verticale iris (photo 25)
  // (13/10, photo 25 à sa pose refaite (roulis −1,7°), rayons sur le mitoyen : la réglette de 2,59 à 2,70 m au-dessus du
  // palier — 2,65 et non 2,50 —, son bout nord en y 11,38 ; le bloc de sortie, 0,26 x 0,16, centré en y 10,72 à 3,04 m —
  // il était en y 11,0 à 2,85, au-dessus du milieu de la réglette ; l'affiche, 0,50 x 0,70, son bord nord en y 10,73, de
  // 1,73 à 2,43 m — et non 0,45 x 0,82 de 1,44 à 2,26)
  reglette(ch, D, E.xM, 10.0, 11.4, E.hP1 + 2.65, 'W');
  // (sa `base` est le palier, 1,75 : à 4,25 m du sol, comptée depuis 0, js/ecole_lumieres.js l'écartait des voisines
  // — sur la moitié haute de la volée 2, zone escEst2, la volée n'avait plus sa lumière — relecture du 09/10)
  // (plan V2, lot H, 11/10 : un tube fluo BLANC NEUTRE, ≈ 4 000 K — la photo 25 rejouée au même point de vue donne le
  // mur du palier blanc neutre, #b6af9b, aussi clair que le mur nord ; sous la lumière chaude des plafonniers, il sortait
  // pêche, #dbc2a3)
  ch.lampes.push({ x: E.xM - 0.25, z: -10.7, h: E.hP1 + 2.65, zone: 'escEst', type: 'tube', force: 0.85, base: E.hP1, cuire: false, couleur: REGLETTE_EST });
  sortieEst(ch, E.xM - 0.03, 10.72, E.hP1 + 3.04, 'W');
  ch.panneau(matPanneau(texAfficheIris(), 0.55), 0.5, 0.7, E.xM - 0.004, 10.48, E.hP1 + 2.08, 'W');
  // (pour la caméra : le dessous du palier de la volée 3, au-dessus du palier intermédiaire)
  C.plafond(E.xP, -E.bS[0], E.xM, -E.bN[1], E.hP2 - 0.25);

  // =====================================================================
  //  LE FOND DE LA PARTIE EST (plan V2, lot H, 11/10 ; rdc_est.md § 8, gabarit_reel.md)
  // =====================================================================
  // Le vrai bâtiment (IGN BD TOPO) s'arrête en y 13,80-13,88 pour x 13,3-20,1 : au-delà, la cour ou le voisin — le jeu y
  // avait un « quart nord-est » ouvert sur le ciel, carrelé jusqu'en y 20,75. Le MUR DU FOND, y 13,5-13,8 (enduit côté
  // cour, blanc dedans), du sous-sol au toit de l'aile basse, et le mitoyen qui le rejoint ; entre lui et le mur nord de
  // la cage, LE LOCAL DE 0,9 m (x 13,65-19,8 × y 12,6-13,5), fermé, laissé vide : aucune image ne le montre, aucune porte
  // n'y mène (VO q_0156-0161 : le mur nord du vestibule est nu). Son toit, au niveau de celui de l'aile de la Robert
  // Kahn (js/ecole_kahn.js, 6,70 m), sous les fenêtres arrière du 2e ; 2 cm plus bas, pour ne pas se confondre avec lui
  // là où les deux se touchent.
  // (relecture du lot H, 11/10 : le mur partait de x 13,3 à tous les niveaux — au rez-de-chaussée, il entrait de 0,2 m
  // dans le C01 (son nu est en x 13,5 : un pilier blanc sans plinthe en y 13,5-13,8) ; au 1er, il traversait la rangée
  // de postes est de la Robert Kahn ; et après les lots E et F, son bout ouest en x 13,3 aurait été dans le plan du nu
  // est de la grande salle du -1 et de la Kahn (x 13,3) : des faces confondues qui scintillent. Sous le 1er, il part du
  // nu est du mur du C01 (x 13,65, ligne 13,575) ; au-dessus, du nu extérieur du mur est de la Kahn du plan V2 (x 13,45,
  // lot F) — tant que le lot F n'est pas fusionné, la Kahn de master (x ≤ 14,525) le contient encore sur 1,1 m)
  {
    const H_TOIT = N2 + 0.08, H_ACRO = H_TOIT + 0.25;
    mur(ch, D, { de: [13.65, 13.65], a: [20.1, 13.65], ep: 0.3, base: Y_SS, h: N1, mats: { N: X.enduit, S: B0 } });
    mur(ch, D, { de: [13.45, 13.65], a: [20.1, 13.65], ep: 0.3, base: N1, h: H_ACRO, mats: { N: X.enduit, S: B0 } });
    mur(ch, D, { de: [19.95, 12.6], a: [19.95, 13.5], ep: 0.3, base: Y_SS, h: H_ACRO, mats: { E: X.enduit, W: B0 } });
    B(ch, D, 13.45, 12.6, 19.8, 13.5, H_TOIT - 0.25, H_TOIT, X.toit, { ombre: false });
  }

  // =====================================================================
  //  LES ZONES (pièces) pour js/ecole_lumieres.js
  // =====================================================================
  // (escEst : le vestibule et la volée 1, puis, au-dessus du sol, le palier intermédiaire et le bas de la volée 2 — sous
  // celle-ci, la niche reste au couloir ; au-dessus de 2,60 m, c'est la cage du 1er, zonesHaut)
  const zones = [
    // (plan V2, lot H, 11/10 : LE VESTIBULE a sa zone — ses lampes voisines sont celles du couloir et de la cage ; celles
    // du couloir n'éclairent plus la cage au travers des murs — ; les deux prennent leur carte au-dessus de la moitié
    // nord du palier intermédiaire, comme escEst2 : prise dans le vestibule, elle voyait de près ses murs jaunes et
    // teintait de pêche le mur du palier, les murs de la cage et les nez d'aluminium, dorés ; prise dans le dégagement,
    // celle du couloir le teinte encore — la photo 25, prise du vestibule, le veut blanc neutre)
    { id: 'vestEst', rects: [zr(E.xJ, E.yE, E.x0, E.bN[1])], voisines: ['couloirEst', 'escEst'], env: { x: 19.0, y: 2.4, z: -11.9 } },
    { id: 'escEst', rects: [zr(E.x0, E.yE, E.xM, E.bN[1]), zr(E.x0, E.bS[0], E.xM, E.bN[1], 0.3)], voisines: ['vestEst', 'escEst2'], env: { x: 19.0, y: 2.4, z: -11.9 } },
    // (la carte du couloir est prise dans le dégagement, pas contre le mur jaune : à 0,7 m de lui, elle teintait de pêche
    // le mur blanc de la niche et le vitrage)
    { id: 'couloirEst', rects: [zr(E.xJ, E.yH, 16.2, E.yE), zr(16.2, E.yH, E.xM, E.yS), zr(16.2, E.yS, E.xP, E.yE)], voisines: ['hall', 'vestEst'], env: { x: 16.3, y: 1.6, z: -8.3 } },
  ];
  // (09/10 : les cartes de la cage et du palier prises là où l'on ne voit pas la face orange de l'échiffre — au-dessus
  // de la moitié nord du palier intermédiaire, au nord du palier du 1er ; prises devant elle, elles teintaient de saumon
  // les murs blancs qui regardent le nord)
  // (relecture du 10/10 : le 103 et la 104 ne s'ouvrent plus sur la bande sud — leurs dalles, voisines, éclairaient la
  // bande et la gaine au travers de la cloison : un spot sur quatre venait de la 104)
  const zonesHaut = [
    // (10/10 : une hauteur MAXIMALE — au-dessus, le palier du 2e et la cage haute, js/ecole_etage2.js ; derrière la porte
    // du palier, l'espace pause — js/ecole_etage1_pause.js — et non plus le couloir)
    { id: 'escEst2', rects: [[...zr(E.x0, E.bS[0], E.xM, E.bN[1], 2.6), N2 - 0.4]], voisines: ['escEst', 'e1est', 'escEst3'], env: { x: 19.05, y: 3.3, z: -11.6 } },
    { id: 'e1est', rects: [zr(13.55, 6.975, E.x0, 11.1, 2.6), zr(13.2, 11.1, E.x0, E.bN[1], 2.6), zr(E.x0, 6.975, E.xM, E.bS[0], 2.6)].map((r) => [...r, N2 - 0.9]), voisines: ['escEst2', 'e1pause'], env: { x: 15.0, y: N1 + 1.5, z: -11.3 } },
  ];

  // LA MISE À JOUR (js/carte_ecole.js maj) : l'ombre douce cuite du rez-de-chaussée et la lumière et l'ombre cuites du
  // 1er, reprises sur le lino et le vinyle quand elles arrivent
  let ao = null;
  const maj = (dt, jeu) => {
    majAscenseur(ch, dt, jeu);                    // (la cabine, ses portes, ses afficheurs : js/ecole_ascenseur.js)
    if (M.sol.aoMap && M.sol.aoMap !== ao) { ao = M.sol.aoMap; X.lino.aoMap = ao; X.lino.aoMapIntensity = M.sol.aoMapIntensity; X.lino.needsUpdate = true; }
    const S = _matSolEtage;
    if (S && (X.vinyle.lightMap !== S.lightMap || X.vinyle.aoMap !== S.aoMap)) {
      for (const v of [X.vinyle, X.vinyle2]) { v.lightMap = S.lightMap; v.aoMap = S.aoMap; v.aoMapIntensity = S.aoMapIntensity; v.needsUpdate = true; }
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
  // LE RENFONCEMENT NORD (PLAN V2, 11/10 — photo 28, etage1.md § 1, e1b/overlay_p28_droite.jpg : les plinthes projetées
  // depuis la pose de la photo suivent la vraie à y 10,90, x 13,40 et y 11,65 ; celles du jeu, y 11,1, x 13,2 et y 12,45,
  // passaient 80 à 100 px trop haut) : un recoin de 0,8 x 0,75 m sous sa retombée, au bout du mur du panneau. Ses nus :
  // le fond x 13,40 (l'axe XK 13,34, ep 0,12 : le mur est de l'espace pause au nord, js/ecole_etage1_pause.js), le mur sud
  // y 10,90 (l'arête du mur du panneau ; axe YK 10,825, ep 0,15), le mur nord y 11,65 (axe YRN 11,725, ep 0,15), qu'il
  // prolonge jusqu'à la volée 3 ; au-delà, jusqu'au mur nord de la cage (y 12,45), une gaine fermée
  // (14/10, relecture de la photo 28 — pose refaite sur le pied des plinthes : l'appareil en (17,00 ; 9,67), l'œil à 1,02 m
  // du palier, cap 272, piqué −2,2° ; les plinthes du mur du panneau ET du mur sud y tombent toutes deux sur le sol. Les
  // têtes de plinthe du renfoncement, renvoyées à 9 cm du sol : son FOND en x 13,82 (13,99 dans le jeu) et le MUR NORD du
  // palier en y 12,04-12,07, du fond jusqu'au chant gris (11,65 dans le jeu : 40 cm trop au sud — à l'image, sa plinthe
  // passait 80 px trop bas ; le rapport des deux têtes de plinthe, 630 px pour 613, ne dépend pas de la hauteur de l'œil).
  // Le palier gagne 40 cm vers le nord ; la gaine derrière, 33 cm au lieu de 73.)
  // (14/10, RELECTURE — la pose de la photo 28 refaite avec ses VERTICALES : les arêtes du mur du panneau, de la porte et du
  // renfoncement penchent toutes de −0,012 à −0,017, d'un bord à l'autre de l'image — l'appareil ne pique pas de 2,2° comme
  // le voulait la pose ci-dessus (il aurait fallu −0,05 à droite, +0,016 à gauche), il est à l'horizontale (+0,15°, roulis
  // 0,75°) ; sur un seul mur de face, le tangage et la hauteur se compensaient. L'appareil reste en (17,00 ; 9,65), cap
  // 273,2, mais L'ŒIL EST À 0,92 m du palier et non 1,02 (10 px de résidu au lieu de 18 ; photo 29, de même : −0,75°, l'œil
  // à 0,80 m). Rien ne change sur le mur du panneau — ses hauteurs se lisent au-dessus du pied de la plinthe —, mais tout ce
  // qui est plus près ou plus loin que lui avait été réglé de 10 cm trop haut ou trop bas : l'arête nord du mur du panneau
  // en y 10,98 (10,977 et 11,005 sur les photos 28 et 29 ; 10,90 dans le jeu), le FOND du renfoncement en x 13,66 (les
  // deux bouts de sa tête de plinthe : 13,661 et 13,662 — 13,82 dans le jeu), le MUR NORD en y 12,12 (12,11 à 12,15), son
  // ressaut en x 14,43)
  const XK = 13.34, YK = 10.905, YRN = 12.195, XJ = 15.13;
  // LE CÔTÉ OUEST DU PALIER 0,59 m PLUS PRÈS DE L'ESCALIER (13/10). Photo 28 : l'affiche A4 du mur du panneau met
  // l'appareil à 2,1-2,25 m de lui (2,17 ; l'œil à 0,84 m du palier) ; de là, le chant gris de l'échiffre est à 0,94 m de
  // l'appareil — 1,23 m du mur. Photo 27, recalée sur six repères du mur (réglette, panneau, poussoir, prise, pied : 5 px,
  // l'œil à 0,70 m, piqué −5,75°, le mur à 2,10 m) : le nez de la dernière marche à 1,48 m du mur. L'audit du 1er l'avait
  // relevé (« le palier fait 1,3-1,45 m, et non 1,83 »). Dans le jeu, 1,83 m du mur au bout de l'échiffre, 2,06 m au
  // dernier nez depuis que la volée part de xD : le mur du panneau, son retour, la porte de l'espace pause (0,675 m
  // derrière lui, relevé de la photo 28 gardé) et le renfoncement nord avancent ENSEMBLE de DXP — la face du mur en
  // x 14,815, à 1,235 m du bout de l'échiffre et 1,465 m du dernier nez. Derrière, rien ne bouge chez l'espace pause
  // (js/ecole_etage1_pause.js) : sa porte est maintenant au fond d'une alcôve de 0,59 m, large comme la baie.
  // (14/10 : la porte de l'espace pause n'avance que de 0,30 m — son semi-fixe, renvoyé sur son plan : 0,46 m de large,
  // le pied au sol et la tête à 2,13 m en x 13,85 ; en 14,14 il sortait 7 % trop grand et 35 px trop à gauche. Le fond du
  // renfoncement en 13,82.)
  const DXP = 0.59, XD1 = 13.85, XK2 = 13.60;
  // (14/10, relecture : LE MUR SUD DE LA CAGE finit en XS — le bord gauche des photos 28 et 29 coupe son nu en x 16,58 et
  // 16,54 sans le montrer : il s'arrête donc au-delà ; en 16,55, il entrait de 130 px dans le cadre, une bande blanche du
  // sol au plafond)
  const XS = E.xD + 0.32;
  // (14/10, photo 28 mesurée zone par zone : le mur du panneau, sous son tube chaud, est crème — R/V/B 1/0,83/0,59 —, les
  // autres murs du palier plus sombres que lui (mur sud 0,72, renfoncement 0,67-0,79), le plafond 0,47 à 0,8, le semi-fixe
  // 0,36 ; dans le jeu, blancs et égaux — 0,87, 0,97, 0,71, 0,58. La balance des blancs de l'appareil y est pour beaucoup :
  // une teinte à mi-chemin, pour que le palier reste raccord avec la cage et la bande sud, blanches)
  const BP = M.blanc.clone(); BP.name = 'peinture blanche (palier est, sous le tube chaud)'; BP.color.setRGB(0.83, 0.76, 0.64);
  // (14/10, relecture, photo 28 mesurée à sa pose refaite : le renfoncement, le mur nord et le mur sud du palier, que le
  // tube n'éclaire pas de face, rendent 0,67 à 0,79 du mur du panneau — le jeu 0,91 à 1,00, aussi clairs que lui : la même
  // peinture, dans l'ombre)
  const BPo = BP.clone(); BPo.name = 'peinture blanche (palier est, dans l\'ombre)'; BPo.color.multiplyScalar(0.78);
  const platreP = M.platre.clone(); platreP.name = 'plafond en plâtre (palier est)'; platreP.color.setRGB(0.74, 0.68, 0.58); platreP.emissiveIntensity *= 0.6;
  const taupe1 = X.taupe.clone(); taupe1.name = 'vantail gris taupe (palier est, dans l\'ombre)'; taupe1.color.multiplyScalar(0.68);

  // ---- LE SOL : le vinyle moucheté foncé (photos 27, 28), sur la lumière et l'ombre cuites du 1er ----
  // (relecture du 09/10 : depuis l'axe de la cloison des salles, 6,975, et non sa face, 7,035 — sur les seuils du 103 et
  // de la 104, entre leur carrelage et le vinyle, une fente de 6 cm laissait voir le rez-de-chaussée)
  // (13/10 : et les deux bandes de 23 cm entre le bord du palier, x0, et le départ des volées, xD — l'arrivée de la volée 2,
  // le pied de la volée 3)
  _R1 = R1;
  const sol = new THREE.Mesh(geoDalles([[13.55, 6.975, E.x0, 8.6], [14.2 + DXP, 8.6, E.x0, YK + 0.075], [XK2, YK + 0.075, E.x0, YRN], [E.x0, 6.975, E.xM, 9.0],
    [E.x0, 9.0, E.xD, E.bS[1]], [E.x0, E.bN[0], E.xD, YRN], [E.xD, 9.0, XS, E.bS[0]], [XJ, YRN, E.xD, E.bN[1]]], N1, R1), X.vinyle);
  sol.receiveShadow = true; sol.castShadow = false; sol.name = 'vinyle du palier est'; sol.userData.solEtage = true;
  G.add(sol);

  // =====================================================================
  //  LES MURS DU PALIER (photos 27 à 29)
  // =====================================================================
  // LE BOUT DU COULOIR DU 1er (x 13,55) et sa porte à 1,5 vantail : le semi-fixe de 0,48 m au sud (fermé, l'affiche
  // orange côté palier), le vantail de 0,95 m au nord, ouvert vers le couloir (gonds au nord, ferme-porte côté palier)
  // (13/10 : la porte avance de DXP ; à son ancienne place, x 13,55, il ne reste que le linteau de la baie de l'alcôve —
  // le mur est de l'espace pause et son bloc de sortie, js/ecole_etage1_pause.js, s'y appuient)
  mur(ch, G, { de: [13.55, 7.035], a: [13.55, 8.925], ep: 0.12, base: N1, h: DALLE2, mats: B0, plinthes: [['W', M.bois], 'E'], ouvertures: [{ c: 7.8125, l: 1.555, h: N1 + 2.17 }] });
  mur(ch, G, { de: [XD1, 7.035], a: [XD1, 8.59], ep: 0.12, base: N1, h: DALLE2, mats: { E: BP, W: B0 }, plinthes: [['W', M.bois], 'E'], ouvertures: [{ c: 7.775, l: 1.41, h: N1 + 2.17 }] });
  // (relecture du 09/10 : le même stratifié gris taupe que les portes du rez-de-chaussée — photo 28, le semi-fixe est
  // nettement plus sombre que le mur, comme sur la photo 24)
  ch.porte('y', XD1, 7.3, { l: 0.46, h: 2.13, base: N1, ep: 0.12, modele: 'grise', etat: 'fermee', cote: 'E', oculus: false, poignee: null, fermePorte: false, huisserie: false, matVantail: taupe1, nom: 'palier est (semi-fixe)' });
  // (vérification du 10/10 : rabattu À PLAT contre le mur est de l'espace pause, au nord de la baie — VO f_66,6-67,8 s et
  // q_0269 : depuis l'espace pause, on n'en voit que la face, à plat sur le mur, entre l'affiche « ESC » et la baie ;
  // photo 28 : depuis le palier, son seul chant au jambage nord. À 100°, il barrait l'espace pause)
  // (13/10 : au fond de son alcôve, il s'ouvre à l'équerre, contre le mur nord de l'alcôve — de la photo 28, toujours son
  // seul chant au jambage nord)
  // (14/10, relecture de la photo 28 : entre la baie claire et l'arête du mur du panneau, une bande SOMBRE du sol au
  // plafond, large de 23 px, son pied en (14,65 ; 8,45) — 17 cm derrière le nu du mur : le chant du grand vantail, ouvert
  // à l'équerre CÔTÉ PALIER, le long du mur nord de l'alcôve, et non vers l'espace pause)
  ch.porte('y', XD1, 8.005, { l: 0.95, h: 2.13, base: N1, ep: 0.12, modele: 'grise', etat: 'ouverte', angle: 1.64, cote: 'E', charniere: 'd', huisserie: false, matVantail: taupe1, nom: 'palier est (couloir du 1er)' });
  // (14/10 : l'affiche orange est un A3 — renvoyée sur le vantail, 0,29 x 0,43, de 1,24 à 1,67 m)
  ch.panneau(matPanneau(texAfficheOrange(), 0.6), 0.297, 0.42, XD1 + 0.053, 7.27, N1 + 1.455, 'E');
  // l'huisserie (métal blanc) autour des deux vantaux ; en tête, côté palier, au-dessus du semi-fixe, le boîtier du
  // ferme-porte (photo 28)
  for (const [y0, y1] of [[7.03, 7.07], [8.48, 8.52]]) B(ch, G, XD1 - 0.07, y0, XD1 + 0.07, y1, N1, N1 + 2.17, M.huisserie, { ombre: false });
  B(ch, G, XD1 - 0.07, 7.03, XD1 + 0.07, 8.52, N1 + 2.13, N1 + 2.17, M.huisserie, { ombre: false });
  // (14/10 : le boîtier du ferme-porte est SUR le vantail, en tête — à 2,08 m —, et non au-dessus de l'huisserie)
  B(ch, G, XD1 + 0.06, 7.12, XD1 + 0.115, 7.46, N1 + 2.045, N1 + 2.11, M.ferme, { ombre: false });
  // le retour du mur du panneau (y 8,65) et LE MUR DU PANNEAU (face est en x 14,225, de y 8,6 à 10,9 — V2 : photo 28, son
  // arête nord en y 10,90 au pixel près ; elle était en 11,175)
  // (13/10 : le retour, allongé de DXP, est le mur nord de l'alcôve)
  mur(ch, G, { de: [13.61, 8.65], a: [14.075 + DXP, 8.65], ep: 0.12, base: N1, h: DALLE2, mats: { S: BP, N: B0 }, plinthes: ['S'] });
  mur(ch, G, { de: [14.15 + DXP, 8.59], a: [14.15 + DXP, YK + 0.075], base: N1, h: DALLE2, mats: { E: BP, W: B0 }, plinthes: ['E'] });
  // le renfoncement nord (V2 : x 13,40-14,2, y 10,90-11,65) sous sa retombée, son pilastre ; son mur sud part du nu ouest
  // du fond (côté espace pause, le bout de mur crème entre le fond et le mur est : js/ecole_etage1_pause.js)
  // (13/10 : son fond avance de DXP — nu 14,025 ; l'ancien, sur l'axe XK, reste le mur est de l'espace pause, et le vide
  // entre les deux est clos par les murs sud et nord du renfoncement)
  mur(ch, G, { de: [XK - 0.06, YK], a: [14.075 + DXP, YK], base: N1, h: DALLE2, mats: { N: BPo, S: B0 }, plinthes: ['N'] });
  // (14/10 : il s'arrête en y 11,80 comme avant — au-delà, le mur de l'angle nord-est de l'espace pause, js/ecole_etage1_pause.js,
  // sur le même axe : les deux se seraient disputé la face ouest)
  mur(ch, G, { de: [XK, YK - 0.075], a: [XK, 11.8], ep: 0.12, base: N1, h: DALLE2, mats: B0 });
  mur(ch, G, { de: [XK2, YK + 0.075], a: [XK2, YRN - 0.075], ep: 0.12, base: N1, h: DALLE2, mats: { E: BPo, W: B0 }, plinthes: ['E'] });
  // (14/10, relecture de la photo 28 : pas de pilastre de 15 cm au bout du renfoncement — le mur nord file droit, et à
  // 0,3 m du nu du mur du panneau, en x 14,5, il AVANCE de 4 cm jusqu'au chant gris : une arête verticale et sa plinthe)
  B(ch, G, 14.43, YRN - 0.115, XJ, YRN - 0.075, N1, H1, BPo, { ombre: false });
  B(ch, G, 14.42, YRN - 0.125, XJ + 0.01, YRN - 0.115, N1, N1 + 0.08, X.plinthe, { ombre: false });
  C.ajouterBoite(14.43, -(YRN - 0.115), XJ, -(YRN - 0.075), { y0: N1, y1: H1 });
  // LE MUR NORD DU RENFONCEMENT ET DU PALIER, jusqu'à la volée 3, et la porte de son LOCAL (V2 : derrière, la gaine
  // fermée jusqu'au mur nord de la cage, y 12,45 — et au-delà, 1,4 m de bâtiment, le fond IGN en y 13,8 : la « salle de
  // cours S 1.6 » du panneau d'étage ne peut pas y être ; la porte, celle d'un local, perd sa plaque — plan_v2.md § 1.4,
  // rdc_est.md § 8. Non vue : derrière le chant gris sur la photo 28) ; la joue de la gaine au droit de la volée 3
  // (13/10, relecture de la photo 28 : depuis que le côté ouest du palier a avancé, la porte — en x 14,73-15,68 — sortait
  // de derrière le chant gris, son huisserie et son ferme-porte à gauche de lui ; la photo n'y montre que le mur nu et sa
  // plinthe, jusqu'au chant)
  // (14/10 : le mur nord, relevé en y 12,05, n'est vu que jusqu'en x 15,03 — derrière le chant gris, rien. La volée 3, elle,
  // fait 1,65 m jusqu'au mur nord de la cage (y 12,45, photo 25 pour la volée 1) : le mur nord du palier s'arrête en XJ, à
  // 1,15 m du pied de la volée, et le palier s'élargit jusqu'au mur de la cage — la volée débouche de toute sa largeur.
  // Avec la joue de gaine au ras de la 1re marche, Haythem, descendant le long du mur nord, butait dedans. La porte du
  // local, imaginée et jamais vue, n'a plus de mur où se poser : la gaine, close, n'est plus que derrière le mur)
  mur(ch, G, { de: [XK - 0.06, YRN], a: [XJ, YRN], base: N1, h: DALLE2, mats: { S: BPo, N: B0 }, plinthes: ['S'] });
  mur(ch, G, { de: [XJ - 0.05, YRN + 0.075], a: [XJ - 0.05, E.yN - 0.075], ep: 0.1, base: N1, h: H1, mats: { E: BPo, W: B0 }, plinthes: ['E'] });
  B(ch, G, XJ, E.bN[1] - 0.015, E.xD, E.bN[1], N1, N1 + 0.08, X.plinthe, { ombre: false });
  // le mur nord de la cage (au-dessus des volées 1 et 3, il monte jusqu'au plafond de la cage ; à l'ouest, le fond de la
  // gaine) ; le mur sud de la cage, côté bande
  mur(ch, G, { de: [XK, E.yN], a: [E.x0, E.yN], base: N1, h: H_CAGE, mats: B0 });
  mur(ch, G, { de: [E.x0, E.yN], a: [E.xM, E.yN], base: N1, h: H_CAGE, mats: B0 });
  // (13/10, photo 28 : le mur sud de la cage finit 0,45 m DEVANT l'appareil, lui-même 0,69 m avant le dernier nez — son
  // bout, où finit la main courante, est donc 27 cm À L'EST de l'arrivée : au-delà, on voit le mur sud du palier et son
  // cadre, la porte de l'espace pause. Il partait du bord du palier, et cachait toute la gauche de la photo. Entre son
  // bout et l'arrivée, le palier s'ouvre sur le côté de la dernière marche)
  // (14/10, relecture : en XS, 32 cm à l'est de l'arrivée — voir plus haut ; et son bout est un CHANT GRIS, comme celui de
  // l'échiffre : VO q_0278 et q_0280, vu du palier, un montant gris du sol au plafond entre la volée 2 et la bande de
  // l'ascenseur, la crosse de la main courante devant lui)
  mur(ch, G, { de: [XS, E.yS], a: [E.xM, E.yS], base: N1, h: H_CAGE, mats: B0, plinthes: ['S'] });
  B(ch, G, XS - 0.006, E.yS - 0.081, XS + 0.085, E.yS + 0.081, N1, 6.1, X.poteau, { ombre: false });
  B(ch, G, E.xD, 9.0, XS, E.bS[0], N1 - 0.25, N1 - 0.012, X.beton, { ombre: false });
  C.sol(E.xD, -9.0, XS, -E.bS[0], N1);
  // le mitoyen au nord de la gaine de l'ascenseur (js/ecole_etage1.js le monte, plein, jusqu'à y 8,99) ; le mur d'échiffre
  mur(ch, G, { de: [19.95, 8.99], a: [19.95, 12.6], ep: 0.3, base: N1, h: H_CAGE, mats: B0 });
  mur(ch, G, { de: [E.x0, E.yE], a: [E.xP, E.yE], base: N1, h: H_CAGE, mats: B0 });
  // (les plinthes du palier sont gris foncé, photo 28 : sur la cloison des salles et le mitoyen de js/ecole_etage1.js, qui
  // portent les plinthes de bois du couloir, une plinthe grise par-dessus)
  // (10/10 : plus de portes 103 et 104 sur la bande, ni d'issue de secours au bout — le doublage et l'ascenseur, et
  // leurs plinthes : js/ecole_ascenseur.js poserBandeSud)
  B(ch, G, XD1 + 0.06, 7.034, ASC.xD - 0.015, 7.052, N1, N1 + 0.082, X.plinthe, { ombre: false });
  // LE CHANT GRIS du mur d'échiffre (photo 28 : ≈ 10 cm, comme le poteau du rez-de-chaussée) : il retourne sur la face
  // sud — vu du haut de la volée 2, c'est une bande grise de 11 cm avant l'orange
  // (13/10, relecture de la photo 28 : son retour sur la face sud fait 6 à 9 cm — de x 16,07 à 16,14 — et non 11)
  B(ch, G, E.x0 - 0.006, E.yE - 0.081, E.x0 + 0.085, E.yE + 0.081, N1, 6.1, X.poteau, { ombre: false });
  // LES PLAFONDS : le palier (plâtre, 2,50 m), la retombée du renfoncement nord, la bande sud
  // (V2 : le palier jusqu'à l'arête du mur du panneau, y 10,90, puis jusqu'au mur nord, y 11,65 ; la retombée sur le
  // seul renfoncement)
  // (14/10 : le plâtre du palier, sombre et chaud — platreP ; la retombée du renfoncement de 6 cm seulement : son fond,
  // renvoyé sur x 13,82, monte à 2,44-2,48 m)
  ch.plafond(13.61, 7.035, XD1, 8.59, H1, 'platre').material = platreP;           // (13/10 : l'alcôve de la porte)
  ch.plafond(XD1, 7.035, E.x0, 8.59, H1, 'platre').material = platreP;
  ch.plafond(14.2 + DXP, 8.59, E.x0, YK + 0.075, H1, 'platre').material = platreP;
  ch.plafond(14.2 + DXP, YK + 0.075, E.x0, YRN - 0.075, H1, 'platre').material = platreP;
  ch.plafond(XJ, YRN - 0.075, E.xD, E.bN[1], H1, 'platre').material = platreP;      // (14/10 : la bande nord, jusqu'au mur de la cage)
  ch.plafond(XK2 + 0.06, YK + 0.075, 14.2 + DXP, YRN - 0.075, H1 - 0.06, 'platre').material = platreP;
  ch.panneau(BP, YRN - YK - 0.15, 0.06, 14.2 + DXP, (YK + YRN) / 2, H1 - 0.03, 'E');
  ch.plafond(E.x0, 7.035, E.xM, 9.0, H1, 'platre');
  // (13/10 : et au-dessus des deux bandes de 23 cm, jusqu'au départ des volées)
  ch.plafond(E.x0, 9.0, E.xD, E.bS[1], H1, 'platre');
  ch.plafond(E.x0, E.bN[0], E.xD, YRN - 0.075, H1, 'platre').material = platreP;
  // au-dessus du palier, la cage se ferme : le mur de 6,0 m au plancher du 2e (H_CAGE) au droit des volées 1 et 3
  mur(ch, G, { de: [E.xD - 0.05, E.yE], a: [E.xD - 0.05, E.yN], ep: 0.1, base: H1, h: H_CAGE, mats: B0 });
  // (la dalle du 1er au-dessus de la volée 1 est posée par js/ecole_etage1.js : C.sol, la caméra)
  // (13/10 : la sienne s'arrête au bord du palier, x0 = 16,05 — le plancher des deux bandes jusqu'au départ des volées)
  C.ajouterBoite(13.2, -9.025, E.xD, -E.bN[1], { y0: N1 - 0.32, y1: N1 - 0.02, joueur: false });
  C.sol(E.x0 - 0.02, -9.0, E.xD, -E.bN[1], N1);

  // =====================================================================
  //  LE MUR DU PANNEAU (photo 28)
  // =====================================================================
  // (V2, 11/10 : le mur ne fait plus que 2,3 m, y 8,6-10,9 — photo 28 ; tout ce qu'il porte se recentre : le panneau
  // centré en y 9,2, l'affichette « WIFI » en 9,8, l'affiche « POINT ÉCOUTE » en 10,05, et avec eux la réglette, le
  // poussoir et la prise — à 0,1-0,2 m près, ce sont ceux de la photo)
  const xf = 14.225 + DXP, dP = -0.1, dW = -0.15, dE = -0.2;
  // (13/10, photo 28, l'appareil à 2,17 m du mur, l'œil à 0,84 m : le panneau de 1,365 à 1,71 m — centre 1,54 et non 1,60 ;
  // l'affichette « WIFI », 0,24 x 0,21, centre 1,53 ; l'affiche violette centre 1,56 ; la réglette à 1,99 m et non 2,10 ;
  // le poussoir à 1,04, la prise à 0,21. Leurs places le long du mur étaient justes à 2-4 cm)
  // (13/10, relecture — photos 27 et 28 agrandies : sous le mur clair, une bande gris foncé de 60 à 70 px, puis le sol brun,
  // plus clair qu'elle ; la même bande court au pied du mur sud. C'est LA PLINTHE, 9 cm : le sol est à son pied, et non à sa
  // tête comme le voulait le relevé ci-dessus — tout ce que porte le mur remonte de 8,5 cm. La pose refaite sur le pied de
  // la plinthe (l'œil à 1,02 m du palier, piqué −2,2°) : le panneau de 1,45 à 1,78 m, l'affichette « WIFI », 0,28 x 0,20,
  // centre 1,62, l'affiche violette centre 1,66, la réglette à 2,10 m (de y 9,17 à 10,45), le poussoir à 1,13, la prise à
  // 0,30 — des hauteurs de pose courantes)
  const dH = 0.085;
  ch.panneau(matPanneau(texPanneauEtageEst(), 0.5), 0.65, 0.33, xf + 0.006, 9.3 + dP, N1 + 1.53 + dH, 'E', G);
  B(ch, G, xf, 8.97 + dP, xf + 0.005, 9.63 + dP, N1 + 1.365 + dH, N1 + 1.70 + dH, M.noirMat, { ombre: false });
  ch.panneau(matPanneau(texWifiIris(), 0.4), 0.27, 0.2, xf + 0.004, 9.95 + dW - 0.015, N1 + 1.53 + dH, 'E', G);
  ch.panneau(matPanneau(texPointEcoute(), 0.6), 0.21, 0.297, xf + 0.003, 10.25 + dE, N1 + 1.57 + dH, 'E', G);
  // la réglette au-dessus des affichettes (≈ 2,1 m ; photo 28 : de la moitié du panneau à 30 cm au-delà de l'affiche
  // violette), son bouton de minuterie et la prise à l'aplomb de l'affichette WIFI ; le tapis gris anthracite
  reglette(ch, G, xf, 9.26 + dP, 10.65 + dE, N1 + 2.1, 'E');
  // (13/10, photos 27 à 29 : le palier n'a que ce tube, chaud — murs crème, sol brun sombre ; il sortait blanc et clair)
  // (14/10 : à 0,9, son cône, qui ne regarde que vers le bas, brûlait le mur sous lui — le haut du mur, autour du tube, restait
  // le plus sombre, à l'inverse de la photo 28 ; à 0,55, et les lueurs du mur et du sol)
  lampe({ x: xf + 0.25, z: -(9.92 + dW), h: N1 + 2.1, zone: 'e1est', type: 'tube', force: 0.55, couleur: new THREE.Color(0xffe2b4) });
  // LA LUMIÈRE DU TUBE (13/10, photo 28 mesurée zone par zone, rapportée au milieu du mur) : le mur autour du tube 1,7, son
  // haut 1,13, sous le panneau 1,16, son pied 0,9 — le jeu 0,99, 0,83, 1,02, 0,89 : égal ; et le SOL devant le mur 0,60, le
  // sol loin de lui 0,33 — le jeu 0,21 et 0,28 : le vinyle sombre n'avait pas sa nappe. Deux lueurs additives, larges, comme
  // celles des plafonniers : une sur le nu du mur, une au sol
  {
    const lm = X.lueurTube.clone(); lm.color = new THREE.Color(0xffdfa6).multiplyScalar(1.0); lm.name = 'lueur du tube (mur du panneau)';
    const pm = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.3), lm);
    pm.position.set(xf + 0.0045, N1 + 1.95, -9.77); pm.rotation.y = Math.PI / 2; pm.renderOrder = 2; pm.userData.horsAOSol = true; pm.userData.nofuse = true; G.add(pm);
    const ls = X.lueurTube.clone(); ls.color = new THREE.Color(0xffd9a0).multiplyScalar(0.62); ls.name = 'lueur du tube (sol du palier)';
    ls.polygonOffset = true; ls.polygonOffsetFactor = -2; ls.polygonOffsetUnits = -2;
    const ps = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 3.4), ls);
    ps.rotation.x = -Math.PI / 2; ps.position.set(xf + 0.62, N1 + 0.011, -9.77); ps.renderOrder = 2; ps.userData.horsAOSol = true; ps.userData.nofuse = true; G.add(ps);
  }
  // (relecture du 09/10, photo 28 en grand : la platine blanche, un boîtier qui avance de 3 cm, sa façade sombre et son
  // voyant vert — un poussoir de minuterie ; blanc sur blanc, l'ancien n'était qu'un point noir)
  const yW = 9.95 + dW, hQ = N1 + dH;
  B(ch, G, xf, yW - 0.04, xf + 0.012, yW + 0.04, hQ + 1.0, hQ + 1.08, M.boitier, { ombre: false });
  B(ch, G, xf + 0.012, yW - 0.028, xf + 0.04, yW + 0.028, hQ + 1.012, hQ + 1.068, M.boitier, { ombre: false });
  // (14/10, relecture, photo 28 agrandie : sur le boîtier blanc, un gros BOUTON ROND de métal, pas de façade noire)
  { const bt = maille(new THREE.CylinderGeometry(0.019, 0.021, 0.014, 18), X.inox, xf + 0.047, hQ + 1.036, -yW, 0, G, { ombre: false }); bt.rotation.z = Math.PI / 2; }
  B(ch, G, xf, yW - 0.04, xf + 0.018, yW + 0.04, hQ + 0.17, hQ + 0.25, M.boitier, { ombre: false });
  B(ch, G, xf + 0.018, yW - 0.015, xf + 0.021, yW + 0.015, hQ + 0.195, hQ + 0.225, M.noirMat, { ombre: false });
  // (le tapis à ≈ 0,6 m du mur : photo 27, une bande de sol entre la plinthe et lui ; photo 28, au bas de l'image)
  // (13/10, photos 27 et 28 : ce n'est pas un tapis mais la BANDE D'ÉVEIL du haut de la volée 2 — 0,32 m de caoutchouc à
  // pastilles, son bord ouest à 0,74 m du mur du panneau (0,73 sur la photo 28), son bord est à 1,06 m, 0,4 m avant le
  // dernier nez : entre elle et le nez, la photo 27 montre du vinyle ; large comme la volée)
  // (13/10, relecture, le sol au pied de la plinthe : la bande de 0,56 à 0,87 m du mur sur la photo 27, son bord ouest à
  // 0,54 m sur la photo 28 — 50 cm avant le dernier nez, la règle des bandes d'éveil)
  // (14/10, photo 27 à sa pose refaite sur le pied de la plinthe — l'œil à 0,70 m, piqué −3,7° : de 0,65 à 0,97 m, le dernier
  // nez à 1,42 m du mur (1,465 dans le jeu) ; entre les deux photos, 0,60-0,92)
  // (son bout sud 12 cm passé le nu du mur sud de la cage — photo 27 : 120 px plus à gauche que dans le jeu)
  // (14/10, relecture — photo 27 à sa pose refaite avec la verticale de l'arête du mur (l'œil à 0,77 m, piqué −5,1°) : de
  // 0,58 à 0,95 m du mur ; photo 28, son bord ouest au bas de l'image : 0,58)
  B(ch, G, xf + 0.58, E.bS[0] - 0.12, xf + 0.95, E.bS[1], N1, N1 + 0.008, X.tapis1, { ombre: false });
  // (sur le mur sud du palier, près du renfoncement, la petite photo encadrée sombre et brillante, à 1,7-1,9 m)
  // (13/10, photo 28 : son cadre de 2,33 à 2,51 m de l'appareil — 0,17 à 0,35 m DERRIÈRE le nu du mur du panneau, entre lui
  // et la porte ; il était devant)
  // (14/10, relecture, ses quatre coins renvoyés sur le mur sud : 0,20 x 0,31, de x 14,34 à 14,54 et de 1,51 à 1,82 m —
  // il était 16 cm trop à l'est, 13 cm trop haut, et large de 0,28)
  B(ch, G, xf - 0.475, 7.035, xf - 0.275, 7.045, N1 + 1.51, N1 + 1.82, M.noirMat, { ombre: false });
  ch.panneau(new THREE.MeshStandardMaterial({ map: texPhotoNuit(), roughness: 0.08, metalness: 0.1 }), 0.175, 0.285, xf - 0.375, 7.047, N1 + 1.665, 'N', G);
  // LA MAIN COURANTE DU MUR SUD DU PALIER (14/10, relecture). Au bord gauche des photos 28 et 29, un tube noir luisant, son
  // bout coupé net sous un flasque clair : pris le 13/10 pour le bout de la main courante du mur sud de la CAGE, puis, le
  // 14/10, pour un doigt devant l'objectif (« trois fois trop fin pour une main courante à 0,4 m »). Il est fin parce qu'il
  // est LOIN : 36 px d'épaisseur pour un tube de 42 mm, c'est 1,7 à 2,2 m de l'appareil ; les deux photos, prises à 18 cm
  // l'une de l'autre, croisent leurs rayons à 4 cm près, et sur le mur sud du palier (y 7,035) elles le mettent toutes
  // deux au même endroit — son bout en x 14,69 et 14,77, son axe à 1,07 et 1,09 m, 5 cm d'épaisseur. La VO de 2021 la
  // montre : q_0276, un trait noir sous le tableau, le long du mur, jusqu'à l'arête du doublage. Une main courante
  // droite, à l'horizontale, à 1,06 m, de 10 cm passé le nu du mur du panneau à l'arête du doublage de l'ascenseur
  {
    const yT = 7.035 + 0.079, hT = N1 + 1.06;
    mainCourante(ch, G, [[xf - 0.1, yT, hT], [ASC.xD - 0.07, yT, hT]], [[14.95, yT, hT, 'S'], [15.56, yT, hT, 'S'], [16.08, yT, hT, 'S']]);
    const fl = maille(new THREE.CylinderGeometry(0.0215, 0.0215, 0.004, 16), M.boitier, xf - 0.1225, hT, -yT, 0, G, { ombre: false }); fl.rotation.z = Math.PI / 2;
  }
  // (14/10, relecture : LE MUR SUD du palier — celui de js/ecole_etage1.js, blanc — rend 0,72 du mur du panneau sur la photo
  // 28, 0,89 dans le jeu : la peinture du palier, dans l'ombre, sur un doublage de 4 mm, de l'alcôve de la porte à l'arête
  // du doublage de l'ascenseur)
  B(ch, G, XD1 + 0.06, 7.035, ASC.xD - 0.015, 7.039, N1 + 0.082, H1, BPo, { ombre: false });
  // LES LUMIÈRES du palier : la réglette (plus haut), un hublot au nord (non vu) ; la bande sud n'a pas de plafonnier
  // (VO q_0274-0281 : sa réglette murale l'éclaire)
  opale(15.5, (YK + YRN) / 2, 'e1est');   // (V2 : devant le mur nord, descendu)
  // (14/10, photo 28 : le renfoncement et le mur nord sont dans l'ombre — 0,67 à 0,79 du mur du panneau, 0,91 à 0,97 dans
  // le jeu : ce hublot, que nulle image ne montre, à mi-force)
  ch.lampes[ch.lampes.length - 1].force = 0.45;
  // LA BANDE SUD ET L'ASCENSEUR (VO 68,2-70 s) : le tableau, le doublage, le boîtier vert, la réglette, l'extincteur, la
  // façade palière et la cabine
  poserBandeSud(ch, { groupe: G, lampes });

  // =====================================================================
  //  LA CAGE AU-DESSUS DU 1er : volée 3, palier à 5,05 m, volée 4 (au-dessus du 2e : poserCageHaute)
  // =====================================================================
  // (10/10, la vidéo officielle, 70 à 71 s et 88,8 à 90 s : la volée 4 arrive au palier du 2e, ouvert à l'ouest — son
  // mur du panneau « 2 », sa porte coupe-feu au sud, js/ecole_etage2.js. Le « palier du 2e » imaginé, sa porte grise
  // fermée en x 14,15 et le plafond de la cage à 9,45 sont partis : l'escalier continue vers le 3e)
  const v3 = { x0: E.xD, sens: 1, y0: E.bN[0], y1: E.bN[1], b: N1, n: E.n, r: E.r2, g: E.g };
  const v4 = { x0: E.xP, sens: -1, y0: E.bS[0], y1: E.bS[1], b: E.hP2, n: E.n, r: E.r2, g: E.g };
  volee(ch, G, v3);
  volee(ch, G, v4);
  limon(ch, G, { ...v3, y: E.bN[1], cote: 1 }); limon(ch, G, { ...v3, y: E.bN[0], cote: -1 });
  limon(ch, G, { ...v4, y: E.bS[0], cote: -1 }); limon(ch, G, { ...v4, y: E.bS[1], cote: 1 });
  // le palier à 5,05 m (dalle), ses plinthes ; le chant de la dalle du 2e au-dessus du palier du 1er, au droit de la
  // volée 4 (de son plafond, 6,00, au dessous de la dalle ; la dalle elle-même est celle du 2e, js/ecole_etage2.js)
  B(ch, G, E.xP, E.bS[0], E.xM, E.bN[1], E.hP2 - 0.25, E.hP2 - 0.02, X.beton);
  B(ch, G, E.xP, E.bS[0], E.xM, E.bN[1], E.hP2 - 0.02, E.hP2, X.giron);
  B(ch, G, E.xM - 0.015, E.bS[0], E.xM, E.bN[1], E.hP2, E.hP2 + 0.08, X.plinthe, { ombre: false });
  for (const [ya, yb] of [[E.bS[0], E.bS[0] + 0.015], [E.bN[1] - 0.015, E.bN[1]]]) B(ch, G, E.xP + 0.05, ya, E.xM, yb, E.hP2, E.hP2 + 0.08, X.plinthe, { ombre: false });
  C.sol(E.xP, -E.bS[0], E.xM, -E.bN[1], E.hP2);
  C.ajouterBoite(E.xP, -E.bS[0], E.xM, -E.bN[1], { y0: E.hP2 - 0.25, y1: E.hP2, joueur: false });
  B(ch, G, E.x0 - 0.1, E.bS[0], E.xD, E.bS[1], H1, DALLE2, X.beton, { ombre: false });
  // les mains courantes des volées 3 et 4 (comme en bas)
  const rail = (v, s) => v.b + v.r + s * v.r / v.g + 0.9, xv = (v, s) => v.x0 + v.sens * s, fin = (E.n - 1) * E.g;
  const yN1 = E.bN[1] - 0.079, yS1 = E.bN[0] + 0.079, yS2 = E.bS[0] + 0.079, yN2 = E.bS[1] - 0.079;
  const crosse = (v, y) => [[xv(v, -0.02), y, rail(v, -0.02) - 0.15], [xv(v, 0.07), y, rail(v, 0.07)]];
  // (10/10, VO q_0356-0360 : au palier à 5,05 m, la main courante du mur ne s'arrête pas — elle court à 0,95 m le long du
  // mur nord, du mitoyen et du mur sud, tourne dans les angles et redescend avec la volée 4 : d'un seul tenant, de la
  // crosse basse de la volée 3 au haut de la volée 4, où elle revient au mur au bout du pilastre)
  const hH = E.hP2 + 0.95, xm = E.xM - 0.079;
  mainCourante(ch, G, [...crosse(v3, yN1), [xv(v3, fin), yN1, rail(v3, fin)], [18.62, yN1, hH], [xm, yN1, hH], [xm, yS2, hH], [18.62, yS2, hH],
    [xv(v4, 0.07), yS2, rail(v4, 0.07)], [xv(v4, fin), yS2, rail(v4, fin)], [E.xD - 0.04, yS2, rail(v4, fin)], [E.xD - 0.04, E.bS[0], rail(v4, fin)]],
    [[xv(v3, 0.5), yN1, rail(v3, 0.5), 'N'], [xv(v3, 1.6), yN1, rail(v3, 1.6), 'N'], [19.25, yN1, hH, 'N'], [xm, 11.5, hH, 'E'], [xm, 10.1, hH, 'E'],
      [19.25, yS2, hH, 'S'], [xv(v4, 0.5), yS2, rail(v4, 0.5), 'S'], [xv(v4, 1.6), yS2, rail(v4, 1.6), 'S']]);
  // (celle de l'échiffre, côté volée 3, est la suite de celle de la volée 2 : au palier du 1er, la main courante fait
  // une ÉPINGLE autour du chant gris — photo 28 : elle passe le bout du mur, revient derrière lui — et remonte)
  // (13/10 : de l'arrivée de la volée 2, xD, elle file à plat jusqu'au bout de l'échiffre, x0, en fait le tour, et revient
  // à plat au pied de la volée 3)
  // (13/10, relecture de la photo 28 agrandie, rayons sur le plan de la main courante : elle ne file PAS à plat — elle
  // garde la pente de la volée jusqu'au bout de l'échiffre (0,87 m du palier en x 16,38, 0,96 en 16,27, 1,05 en 16,17),
  // 5 cm plus haut que le jeu, et fait autour du chant une épingle SERRÉE, en demi-cercle, presque à plat (1,11 à 1,17 m),
  // son bout à 12 cm du chant — celle du jeu, pointue, partait à plat 20 cm plus bas et dépassait de 18 cm. De l'autre
  // côté, elle rejoint à plat le pied de la volée 3, dont la main courante prend les mêmes 5 cm)
  // (14/10, RELECTURE, photo 28 à sa pose refaite (l'œil à 0,92 m) : sur son plan, l'axe du tube passe à 0,944 m du palier
  // en x 16,23, 0,877 en 16,31, 0,835 en 16,37 — 0,90 m AU-DESSUS DE LA LIGNE DES NEZ, la pente de la volée gardée jusqu'à
  // l'épingle ; celle-ci, son bout tangent en (15,95 ; 10,58) à 1,05 m, passe à 1,12 m là où le chant la cache. Les 5 cm
  // ajoutés le 13/10 venaient de l'œil pris 10 cm trop haut : la main courante sortait 130 px au-dessus de la vraie)
  const dR = 0, xU = E.x0 + 0.03, rU = (yS1 - yN2) / 2;
  const h2 = rail({ b: E.hP1, r: E.r1, g: E.g }, fin) + dR, hA = h2 + (E.xD - xU) * E.r1 / E.g, h3 = rail(v3, 0) + dR;
  const arc = [];
  for (let k = 1; k < 6; k++) { const a = k * Math.PI / 6; arc.push([xU - rU * Math.sin(a), E.yE - rU * Math.cos(a), hA + (h3 - hA) * k / 6]); }
  // (14/10 : à l'image, sa branche nord repart PLUS HAUT que celle du sud — 1,17 m là où le chant la cache : l'épingle
  // monte encore, de 1,14 à 1,20 m, puis file à plat jusqu'à la pente de la volée 3)
  const hB = N1 + 1.15;
  arc.forEach((p, k) => { p[2] = hA + (hB - hA) * (k + 1) / 6; });
  mainCourante(ch, G, [[E.xD, yN2, h2], [xU, yN2, hA], ...arc, [xU, yS1, hB], [E.xD + (hB - h3) * E.g / E.r2, yS1, hB],
    [xv(v3, fin), yS1, rail(v3, fin) + dR], [E.xP + 0.06, yS1, rail(v3, fin) + dR], [E.xP + 0.06, E.bN[0], rail(v3, fin) + dR]],
    [[xv(v3, 0.5), yS1, rail(v3, 0.5) + dR, 'S'], [xv(v3, 1.6), yS1, rail(v3, 1.6) + dR, 'S']]);
  // (celle de l'échiffre, côté volée 4, fait au 2e l'épingle autour du chant clair et devient celle de la volée 5 :
  // poserCageHaute)
  // la réglette et le bloc de sortie du palier à 5,05 m, comme au palier du dessous (lampe de la cage du haut : elle ne
  // se cuit pas sur le sol du 1er, et vue du palier du 1er elle est « trop haut » pour un spot voisin) ; 10/10 : un peu
  // plus bas — le palier à 8,15 m passe au-dessus (dessous à 7,90), le bloc de sortie juste sous lui (VO q_0356-0360) ;
  // l'affiche iris verticale au milieu du mitoyen, sous la réglette (VO q_0358)
  reglette(ch, G, E.xM, 10.0, 11.4, E.hP2 + 2.35, 'W');
  lampe({ x: E.xM - 0.25, z: -10.7, h: E.hP2 + 2.35, zone: 'escEst2', type: 'tube', force: 1.1, cuireEtage: false });
  ch.sortie(E.xM - 0.03, 11.0, E.hP2 + 2.72, 'W');
  ch.panneau(matPanneau(texAfficheIris(), 0.55), 0.42, 0.75, E.xM - 0.004, 10.72, E.hP2 + 1.75, 'W', G);
  // (l'orange de l'échiffre est posé par poserEst, du rez-de-chaussée à la sous-face de la volée 4 ; la main courante de
  // la volée 2 aussi : elle monte jusqu'au 1er)
  console.info('[escalier est] palier du 1er et cage au-dessus posés');
}

// =====================================================================
//  LA CAGE AU-DESSUS DU 2e (crochet de js/ecole_etage2.js : tout se pose dans le groupe du 2e étage)
// =====================================================================
// La vidéo officielle (70-71 s, 88,8-90 s ; plan_global § 2.3, synth/volee_cmp.jpg) : au-dessus du 1er, l'échiffre est
// ROUGE VERMILLON côté volée 4 (ROUGE_2E, la peinture du mur nord du couloir du 2e), son chant ouest clair ; la cage MONTE —
// la sous-face de la volée 6 passe en biais au-dessus de la volée 4 (le haut de l'échiffre rouge la suit), le palier à
// 8,15 m couvre celui à 5,05 m, la volée 5 part du palier du 2e vers l'est dans la bande nord, sa main courante noire à
// crosse basse sur le mur nord, et celle de l'échiffre fait l'épingle autour du chant (VO q_0356, sheets/z_545).
// Au-delà, RIEN n'est vu : un portillon fermé au pied de la volée 5 (IMAGINÉ : le jeu s'arrête au 2e), la volée 7 et le
// palier du 3e réduits à ce qu'on en voit d'en bas.
//   poserCageHaute(ch, { groupe })      (la lampe du palier à 8,15 m ne se cuit sur aucun sol)
export function poserCageHaute(ch, { groupe }) {
  const { C, M } = ch, G = groupe, E = EST, B0 = M.blanc;
  if (!X) X = matieresEst();
  const N3 = N2 + (N2 - N1), hP3 = N2 + (N2 - N1) / 2, hP4 = N3 + (N2 - N1) / 2;   // 9,70 ; 8,15 ; 11,25
  const H_HAUT = hP4 + 0.05;                          // le haut des murs posés ici
  const fin = (E.n - 1) * E.g, r = E.r2;
  // ---- LES MURS DE LA CAGE au-dessus du 2e (le bas, jusqu'au plancher du 2e, est posé avec le 1er) ----
  // le mur nord (la façade arrière, js/ecole_etage2.js, le prolonge à l'ouest), le mur sud (sa face sud : le vestibule
  // de l'ascenseur du 2e), le mitoyen, le mur d'échiffre
  mur(ch, G, { de: [E.x0, E.yN], a: [E.xM, E.yN], base: N2, h: H_HAUT, mats: B0 });
  mur(ch, G, { de: [E.x0, E.yS], a: [E.xM, E.yS], base: N2, h: H_HAUT, mats: B0, plinthes: ['S'] });
  mur(ch, G, { de: [19.95, 8.99], a: [19.95, 12.6], ep: 0.3, base: N2, h: H_HAUT, mats: B0 });
  mur(ch, G, { de: [E.x0, E.yE], a: [E.xP, E.yE], base: N2, h: H_HAUT, mats: B0 });
  // LE ROUGE VERMILLON de l'échiffre côté volée 4 : de la plinthe rampante de la volée 4 à la sous-face de la volée 6
  // (comme l'orange côté volée 2, poserEst), derrière le chant clair
  const sof6 = (x) => hP3 - 0.25 + (E.xP - x) * ((hP3 + (E.n - 1) * r - 0.3) - (hP3 - 0.25)) / fin;
  const pl4 = (x) => E.hP2 + r + (E.xP - x) * r / E.g + 0.13;
  {
    const rouge = new THREE.MeshStandardMaterial({ map: texPeinture(ROUGE_2E, 4), roughness: 0.6, side: THREE.DoubleSide });
    rouge.name = 'peinture rouge vermillon (échiffre du 2e)';
    detailPhoto(rouge, 'beton', 1, 1, { relief: 0.035, grain: 0, rugo: false });
    const xa = E.x0 + 0.11, sh = new THREE.Shape();
    sh.moveTo(xa, pl4(E.xD)); sh.lineTo(E.xD, pl4(E.xD)); sh.lineTo(E.xP, pl4(E.xP)); sh.lineTo(E.xP, sof6(E.xP)); sh.lineTo(E.xD, sof6(E.xD)); sh.lineTo(xa, sof6(E.xD));
    const o = new THREE.Mesh(new THREE.ShapeGeometry(sh), rouge);
    o.position.z = -(E.bS[1] - 0.003); o.receiveShadow = true; o.userData.horsAOSol = true; G.add(o);
  }
  // LE CHANT CLAIR (VO q_0281-0287 : une bande blanc cassé de 11 cm au bout du mur rouge ; le chant gris du 1er s'arrête
  // à 6,10 m)
  const chant = new THREE.MeshStandardMaterial({ color: 0xdedbd3, roughness: 0.6 }); chant.name = 'chant clair de l\'échiffre';
  B(ch, G, E.x0 - 0.006, E.yE - 0.081, E.x0 + 0.11, E.yE + 0.081, 6.1, N3 - 0.25, chant, { ombre: false });
  // ---- LES VOLÉES 5, 6 et 7, LES PALIERS À 8,15 ET 11,25 m, LE PALIER DU 3e (ce qu'on en voit d'en bas) ----
  const v4 = { x0: E.xP, sens: -1, b: E.hP2, r, g: E.g };
  const v5 = { x0: E.xD, sens: 1, y0: E.bN[0], y1: E.bN[1], b: N2, n: E.n, r, g: E.g };
  const v6 = { x0: E.xP, sens: -1, y0: E.bS[0], y1: E.bS[1], b: hP3, n: E.n, r, g: E.g };
  const v7 = { x0: E.xD, sens: 1, y0: E.bN[0], y1: E.bN[1], b: N3, n: E.n, r, g: E.g };
  volee(ch, G, v5); volee(ch, G, v6); volee(ch, G, v7);
  limon(ch, G, { ...v5, y: E.bN[1], cote: 1 }); limon(ch, G, { ...v5, y: E.bN[0], cote: -1 });
  limon(ch, G, { ...v6, y: E.bS[0], cote: -1 }); limon(ch, G, { ...v6, y: E.bS[1], cote: 1 });
  for (const [h, sous] of [[hP3, true], [hP4, false]]) {
    B(ch, G, E.xP, E.bS[0], E.xM, E.bN[1], h - 0.25, h - 0.02, X.beton);
    B(ch, G, E.xP, E.bS[0], E.xM, E.bN[1], h - 0.02, h, X.giron);
    if (!sous) continue;
    B(ch, G, E.xM - 0.015, E.bS[0], E.xM, E.bN[1], h, h + 0.08, X.plinthe, { ombre: false });
    C.sol(E.xP, -E.bS[0], E.xM, -E.bN[1], h);
    C.ajouterBoite(E.xP, -E.bS[0], E.xM, -E.bN[1], { y0: h - 0.25, y1: h, joueur: false });
  }
  // (pour la caméra : le dessous du palier à 8,15 m, au-dessus de celui à 5,05 m)
  C.plafond(E.xP, -E.bS[0], E.xM, -E.bN[1], hP3 - 0.25);
  // le palier du 3e (sa dalle : vue de la volée 4, son chant ferme le haut de la cage à l'ouest)
  B(ch, G, 13.55, 7.9, E.xD, E.yN, N3 - 0.25, N3, X.beton, { ombre: false });
  // LES DEUX BANDES DE 23 cm DU PALIER DU 2e (13/10) : entre son bord (x0 = 16,05, js/ecole_etage2.js) et le départ des
  // volées (xD) — l'arrivée de la volée 4, le pied de la volée 5 ; la dalle, le vinyle, le plancher
  B(ch, G, E.x0 - 0.01, E.bS[0], E.xD, E.bN[1], N2 - 0.2, N2 - 0.005, X.beton, { ombre: false });
  if (_R1) {
    const vin = new THREE.Mesh(geoDalles([[E.x0 - 0.01, E.bS[0], E.xD, E.bS[1]], [E.x0 - 0.01, E.bN[0], E.xD, E.bN[1]]], N2, _R1), X.vinyle2);
    vin.receiveShadow = true; vin.castShadow = false; vin.name = 'vinyle du palier du 2e (bandes des volées)'; G.add(vin);
  }
  C.sol(E.x0 - 0.02, -E.bS[0], E.xD, -E.bN[1], N2);
  C.ajouterBoite(E.x0 - 0.02, -E.bS[0], E.xD, -E.bN[1], { y0: N2 - 0.3, y1: N2 - 0.02, joueur: false });
  // ---- LES MAINS COURANTES : celle de l'échiffre, de la volée 4 à la volée 5 par l'épingle autour du chant ; celle du
  // mur nord de la volée 5, sa crosse basse (VO q_0356, sheets/z_545) ----
  const rail = (v, s) => v.b + v.r + s * v.r / v.g + 0.9, xv = (v, s) => v.x0 + v.sens * s;
  const yN1 = E.bN[1] - 0.079, yS1 = E.bN[0] + 0.079, yN2 = E.bS[1] - 0.079;
  const crosse = (v, y) => [[xv(v, -0.02), y, rail(v, -0.02) - 0.15], [xv(v, 0.07), y, rail(v, 0.07)]];
  const h4 = rail(v4, fin), h5 = rail(v5, 0);
  mainCourante(ch, G, [...crosse(v4, yN2), [xv(v4, fin), yN2, h4], [E.x0, yN2, h4], [E.x0 - 0.12, yN2, h4 + 0.02], [E.x0 - 0.18, E.yE, (h4 + h5) / 2],
    [E.x0 - 0.12, yS1, h5 - 0.02], [E.x0, yS1, h5], [E.xD, yS1, h5], [xv(v5, fin), yS1, rail(v5, fin)], [E.xP + 0.06, yS1, rail(v5, fin)], [E.xP + 0.06, E.bN[0], rail(v5, fin)]],
    [[xv(v4, 0.5), yN2, rail(v4, 0.5), 'N'], [xv(v4, 1.6), yN2, rail(v4, 1.6), 'N'], [xv(v5, 0.5), yS1, rail(v5, 0.5), 'S'], [xv(v5, 1.6), yS1, rail(v5, 1.6), 'S']]);
  mainCourante(ch, G, [...crosse(v5, yN1), [xv(v5, fin), yN1, rail(v5, fin)], [E.xP + 0.06, yN1, rail(v5, fin)], [E.xP + 0.06, E.bN[1], rail(v5, fin)]],
    [[xv(v5, 0.5), yN1, rail(v5, 0.5), 'N'], [xv(v5, 1.6), yN1, rail(v5, 1.6), 'N']]);
  // ---- LE PALIER À 8,15 m : sa réglette, son bloc de sortie, son affiche (comme aux paliers du dessous ; non vus) ----
  reglette(ch, G, E.xM, 10.0, 11.4, hP3 + 2.35, 'W');
  ch.lampes.push({ x: E.xM - 0.25, z: -10.7, h: hP3 + 2.35, zone: 'escEst3', type: 'tube', force: 1.0, base: hP3, cuire: false });
  ch.sortie(E.xM - 0.03, 11.0, hP3 + 2.72, 'W');
  ch.panneau(matPanneau(texAfficheIris(), 0.55), 0.42, 0.75, E.xM - 0.004, 10.72, hP3 + 1.75, 'W', G);
  // ---- LE PORTILLON (IMAGINÉ) au pied de la volée 5 : fer plat noir, fermé à clé, son affichette ; on ne monte pas
  // au 3e (la caméra, elle, regarde par-dessus) ----
  const xp = E.xD - 0.06, y0 = E.bN[0] + 0.02, y1 = E.bN[1] - 0.02, hp = N2 + 1.0;
  for (const y of [y0, y1 - 0.04]) B(ch, G, xp - 0.02, y, xp + 0.02, y + 0.04, N2, hp + 0.05, M.acierNoir);
  for (const h of [N2 + 0.12, hp - 0.03]) B(ch, G, xp - 0.01, y0 + 0.04, xp + 0.01, y1 - 0.04, h, h + 0.04, M.acierNoir);
  for (let y = y0 + 0.16; y < y1 - 0.1; y += 0.12) B(ch, G, xp - 0.006, y - 0.006, xp + 0.006, y + 0.006, N2 + 0.16, hp - 0.03, M.acierNoir, { ombre: false });
  B(ch, G, xp - 0.035, y1 - 0.2, xp - 0.01, y1 - 0.12, N2 + 0.55, N2 + 0.65, M.inox, { ombre: false });
  ch.panneau(matPanneau(texAccesReserve(), 0.6), 0.21, 0.148, xp - 0.013, (y0 + y1) / 2, N2 + 0.72, 'W', G);
  C.ajouterBoite(xp - 0.04, -y1, xp + 0.04, -y0, { y0: N2, y1: N2 + 2.6, camera: false });
  console.info('[escalier est] cage au-dessus du 2e posée');
}
// L'AFFICHETTE DU PORTILLON (imaginée) : blanche, bandeau rouge, « Accès réservé »
function texAccesReserve() {
  return canvasTex(256, 180, (g, w, h) => {
    g.fillStyle = '#fbfbf8'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#c8262c'; g.fillRect(0, 0, w, 46);
    g.fillStyle = '#ffffff'; g.font = '800 26px "Segoe UI", Arial, sans-serif'; g.textAlign = 'center'; g.fillText('ACCÈS RÉSERVÉ', w / 2, 33);
    g.fillStyle = '#222'; g.font = '600 20px "Segoe UI", Arial, sans-serif'; g.fillText('Étages 3 à 5', w / 2, 92);
    g.font = '15px "Segoe UI", Arial, sans-serif'; g.fillStyle = '#555'; g.fillText('Merci d’utiliser l’ascenseur', w / 2, 128); g.fillText('ou de vous adresser à l’accueil', w / 2, 150);
    g.textAlign = 'left';
  }, null, false, 2);
}
