// =====================================================================
//  LE HALL D'ENTRÉE DE L'ÉCOLE IRIS : L'ACCUEIL, L'OPEN-SPACE, L'ANGLE NORD-EST, LE PLAFOND (crochet de js/carte_ecole.js)
// =====================================================================
// D'après LA PHOTO DE L'ACCUEIL DE HAYTHEM (retour r04 du 12/10/2026 : references/ecole/retours_haythem/
// r04_photo_accueil.jpg, objectif normal, prise du bord ouest du hall face au comptoir), qui l'emporte sur tout, puis les
// photos 03, 16 et 24 (2026) et la VIDÉO OFFICIELLE DE VISITE (VO, 26/04/2021 : 6,4-7,4 s en entrant par la porte 6,
// 92,5-95,8 s en revenant du couloir est). Le mobilier « Covid » de 2021 (plexiglas, colonne de gel) n'est PAS repris.
//
// LA POSE DE r04 (résolue le 12/10 sur ses points de fuite et ses hauteurs : le comptoir et le mur ardoise fuient au même
// point, x -2 040 ; la retombée du plafond et le retour blanc, perpendiculaires, vers x 590 — d'où f ≈ 640 px, 62° de champ ;
// la tablette du comptoir, 1,10 m, est sur l'horizon) : l'appareil en (13,6 ; 2,35), à 1,12 m, cap 75°, contre le mur du
// bureau B. De là, le mur ardoise tombe sur le mitoyen (x 19,9) et les spots sur ceux que la VO avait relevés, (17,25 ;
// 3,2), (18,75 ; 3,2), (18,75 ; 1,5), à 0,1 m près : la pose est sûre. Elle redonne au comptoir sa longueur de la première
// lecture de la VO (y 1,0-4,2, puis un pupitre jusqu'à 5,0) que la relecture du 10/10 avait raccourcie à 3,55.
//
// LE PLAN (repère de js/carte_ecole.js : x le long de la façade, y vers le fond ; dans le jeu X = x, Z = -y) :
//   le comptoir haut        x 16,83-17,53 y 1,1-3,6    NORD-SUD, face à l'ouest : stratifié gris clair, rainure à 0,71,
//                                                     socle de chêne clair en retrait, tablette grise en saillie à 1,10
//   le décroché PMR         x 16,88-17,6  y 3,6-4,58   son caisson bas en retrait (x 17,08), sa tablette à 0,76 et son
//                                                     pied gris ; la bouilloire, les bacs à courrier noirs, les papiers
//   le caisson haut         x 17,0-17,85  y 4,39-4,58  posé sur le bout du décroché, sa tablette haute (1,10) qui déborde
//                                                     de 0,3 m vers le nord
//   le mitoyen est          x 19,8        y 1,82-4,43  peint GRIS ARDOISE, ses deux affiches (y 2,2-2,9 et 3,4-4,0)
//   le bureau d'angle       x - y = 17,98              la cloison BIAISE vitrée du coin sud-est (r04 et VO q_0383)
//   le local technique      x 18,8-19,8   y 4,43-7,5   portes de stratifié clair, étiquette rouge et triangle jaune ;
//                                                     sa face sud blanche, le bouton rouge et le boîtier blanc
//   le pilier de bois clair x 18,14-18,8  y 5,71-6,24  devant le local, sous l'écran suspendu ; le panneau des formations
//                                                     sur le local, à sa droite
//   le portant des goodies  (17,3 ; 5,55)              noir, sur roulettes : sweats « iris », affichette, brochures
//   l'open-space            x 17,53-19,8  y 0,3-4,43   le plan de travail derrière le comptoir, le bureau du mitoyen, le
//                                                     copieur contre la cloison biaise, trois fauteuils
//   l'angle nord-est        x 16,3-18,8   y 6,8-7,5    le photocopieur contre le cannelé, le caisson et ses corbeilles
//                                                     (photo 24 : toujours là en 2026), le meuble noir (r04), les
//                                                     étiquettes ocre « INFORMATIQUE »
//   le plafond              plateaux perforés de 0,6 x 1,2 (r04, photo 03) ; la retombée est-ouest y 5,28-5,53, de la pile
//                                                     au local ; les huit lignes lumineuses dans l'axe de la porte 6
//                                                     (VO, photo 24)
// (Le cannelé et le mur nord : js/ecole_est.js ; la pile, sa plaque et son annuaire : js/ecole_rdc_centre.js.)
//
//   poserHall(ch)       (appelé par construireAccueil, js/carte_ecole.js)
import * as THREE from 'three';
import { maille, boiteM } from './ecole_portes.js';
import { canvasTex, detailPhoto } from './kit_decor.js';
import { texPeinture } from './ecole_matieres.js';

// ---- les cotes (plan) ----
const H_PLAF = 2.6;                                 // le plafond du hall
const CPT = { x0: 16.83, x1: 17.53, y0: 1.1, y1: 3.6, h: 1.10, rainure: 0.71, socle: 0.11 };   // le comptoir haut (r04)
const PMR = { xF: 17.08, x0: 16.88, y0: 3.6, y1: 4.58, h: 0.76 };                 // le décroché PMR
const RET = { x0: 17.0, x1: 17.85, y0: 4.39, y1: 4.58, h: 1.10 };                 // le caisson haut du décroché
const X_PERS = 18.05;                               // le dos du plan de travail du personnel
const LOC = { x0: 18.8, y0: 4.43 };                 // le local technique (sa face ouest, sa face sud)
const PIL = { x0: 18.14, x1: 18.8, y0: 5.71, y1: 6.24 };                          // le pilier de bois clair
const Y_MUR = 7.5;                                  // la face hall du mur nord (y 7,5-7,65)
const X_MIT = 19.8;                                 // la face du mitoyen est
const Y_ARD = 1.82;                                 // le bout sud du mur ardoise : la cloison biaise y part
const BIAIS = X_MIT - Y_ARD;                        // la cloison biaise : la ligne x - y = 17,98, de (19,8 ; 1,82) à la façade
const H_VITRE = 2.07;                               // le haut de ses vitres (r04 : le bord haut à x 622, rétroprojeté)

// =====================================================================
//  LES TEXTURES (dessinées : aucun fichier de plus à charger)
// =====================================================================
function graine(s) {
  let x = s >>> 0 || 1;
  return () => { x ^= x << 13; x >>>= 0; x ^= x >> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; };
}
const POLICE = '"Segoe UI", Arial, sans-serif', GOTHIC = '"Century Gothic", "Avenir", "Segoe UI", sans-serif';
// le pavé « iris » (noir, le i jaune) : en (x, y), large de w
function paveIris(g, x, y, w, fond = '#151517', texte = '#ffffff') {
  const h = w * 0.42;
  g.fillStyle = fond; g.fillRect(x, y, w, h);
  g.fillStyle = texte; g.font = `600 ${Math.round(h * 0.78)}px ${GOTHIC}`; g.textBaseline = 'alphabetic'; g.textAlign = 'left';
  g.fillText('iris', x + w * 0.16, y + h * 0.8);
  g.fillStyle = '#f1b40c'; g.fillRect(x + w * 0.16, y + h * 0.14, Math.max(1, w * 0.06), Math.max(1, h * 0.1));
}
// LE STRATIFIÉ BOIS CLAIR du local technique et du pilier (r04 : beige, un chêne très pâle, au fil vertical à peine
// marqué ; à l'ombre, il tire sur le brun clair — face ouest du pilier #A28058 à l'appareil, face sud au jour #A2958F)
function texBoisClair() {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#cbb8a1'; g.fillRect(0, 0, w, h);
    const r2 = graine(311);
    for (let k = 0; k < 220; k++) {
      const x = r2() * w, l = 0.6 + r2() * 2.2, a = 0.015 + r2() * 0.035;
      g.fillStyle = r2() < 0.5 ? `rgba(150,118,80,${a})` : `rgba(232,216,190,${a})`; g.fillRect(x, 0, l, h);
    }
  }, [1, 1], false, 4);
}
// UNE ÉTIQUETTE MURALE OCRE (VO q_0027-0028, recadrage hall_work/c_72_info) : aplat jaune moutarde, un mot en capitales
// blanches, grasses, serrées. La grande dit « INFORMATIQUE » ; le mot de la petite est illisible à 640 px.
function texEtiquette(mot, w, h) {
  const W = 512, H = Math.round(W * h / w);
  return canvasTex(W, H, (g) => {
    g.fillStyle = '#d9ad3e'; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(0, 0, W, H * 0.45);
    g.fillStyle = '#fbf7ee'; g.textAlign = 'center'; g.textBaseline = 'middle';
    let s = Math.round(H * 0.42);
    do { g.font = `800 ${s}px ${POLICE}`; s -= 2; } while (g.measureText(mot).width > W * 0.84 && s > 10);
    g.fillText(mot, W / 2, H * 0.53);
  }, null, false, 4);
}
// L'AFFICHE AU CADRE MAGENTA (r04 agrandie, la gauche des deux) : une marge gris clair, un filet magenta tout autour ; en
// haut, un aplat brun noir et quatre lignes d'un texte orange ; au milieu, la façade BLANCHE d'un immeuble vue DE FACE —
// une rangée de baies magenta sous la corniche, quatre rangées de dix fenêtres sombres aux reflets roses, les vitrines du
// rez-de-chaussée — ; en bas, du gris clair et le pavé « iris » à droite
function texAfficheMagenta() {
  return canvasTex(256, 356, (g, w, h) => {
    g.fillStyle = '#e4e2de'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#c4307e'; g.lineWidth = 4; g.strokeRect(10, 10, w - 20, h - 20);
    const x0 = 14, x1 = w - 14;
    g.fillStyle = '#2a2420'; g.fillRect(x0, 14, x1 - x0, 104);
    g.fillStyle = '#e59a3a'; g.font = `600 11px ${POLICE}`; g.textBaseline = 'alphabetic'; g.textAlign = 'left';
    ['Créer', 'l\'informatique', 'pour les métiers', 'de demain'].forEach((t, i) => g.fillText(t, 28, 38 + i * 13));
    // la façade
    g.fillStyle = '#f4f3f0'; g.fillRect(x0, 118, x1 - x0, 176);
    g.fillStyle = '#d8d6d2'; g.fillRect(x0, 118, x1 - x0, 6);
    for (let i = 0; i < 10; i++) {
      const x = x0 + 8 + i * 22.6;
      g.fillStyle = '#c23a83'; g.fillRect(x, 130, 15, 9);
      for (let j = 0; j < 4; j++) {
        g.fillStyle = (i * 3 + j) % 5 === 0 ? '#7a3a62' : '#2a2630'; g.fillRect(x, 148 + j * 24, 15, 13);
        g.fillStyle = 'rgba(214,90,150,0.35)'; g.fillRect(x, 148 + j * 24, 15, 4);
      }
    }
    for (const [a, b] of [[8, 46], [62, 78], [84, 100], [108, 124], [150, 168], [186, 228]]) { g.fillStyle = '#26232a'; g.fillRect(x0 + a, 252, b - a, 22); }
    g.fillStyle = '#d6d4d0'; g.fillRect(x0, 294, x1 - x0, h - 14 - 294);
    paveIris(g, w - 74, h - 50, 46);
  }, null, false, 4);
}
// L'AFFICHE AUX LIGNES DE COULEUR (r04 agrandie, la droite des deux ; c'est la « photo encadrée de la tour » de la VO) :
// fond gris moyen ; quatre câbles de couleur — bleu ciel, jaune, rouge, vert pâle — partent du bord gauche, descendent
// en coudes et entrent dans les fenêtres d'une façade BLANCHE vue d'en bas, de biais, sur la moitié droite ; en bas à
// gauche, trois lignes de texte blanc et le pavé « iris »
function texAfficheLignes() {
  return canvasTex(256, 356, (g, w, h) => {
    g.fillStyle = '#8f908f'; g.fillRect(0, 0, w, h);
    // la façade : un quadrilatère dont le haut monte vers la droite, ses rangées de fenêtres suivent
    const TL = [138, 34], TR = [w, 4], BR = [w, h], BL = [126, h];
    const P = (u, v) => [0, 1].map((k) => (1 - v) * (TL[k] + (TR[k] - TL[k]) * u) + v * (BL[k] + (BR[k] - BL[k]) * u));
    const quad = (u0, v0, u1, v1, c) => {
      g.fillStyle = c; g.beginPath(); g.moveTo(...P(u0, v0)); g.lineTo(...P(u1, v0)); g.lineTo(...P(u1, v1)); g.lineTo(...P(u0, v1)); g.closePath(); g.fill();
    };
    quad(0, 0, 1, 1, '#f3f3f1');
    for (let j = 0; j < 11; j++) for (let i = 0; i < 4; i++) quad(0.08 + i * 0.23, 0.05 + j * 0.087, 0.2 + i * 0.23, 0.1 + j * 0.087, j > 8 ? '#b9bcc0' : '#a2a6ab');
    quad(0, 0, 0.05, 1, '#dcdcda');
    // les câbles : du bord gauche, des coudes à angle droit, vers les fenêtres
    const cable = (c, pts) => {
      g.strokeStyle = c; g.lineWidth = 7; g.lineJoin = 'round'; g.lineCap = 'butt'; g.beginPath();
      g.moveTo(...pts[0]); for (const p of pts.slice(1)) g.lineTo(...p); g.stroke();
    };
    cable('#9fd2ec', [[0, 36], [62, 36], [62, 196], [150, 196]]);
    cable('#b8d0c2', [[0, 50], [44, 50], [44, 170], [150, 170]]);
    cable('#e1503c', [[0, 64], [28, 64], [28, 150], [146, 150]]);
    cable('#f0c548', [[18, 0], [18, 22], [108, 22], [108, 108], [148, 108]]);
    g.fillStyle = '#ffffff'; g.font = `600 10px ${POLICE}`; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
    ['Connectez-vous', 'aux métiers', 'de demain'].forEach((t, i) => g.fillText(t, 16, 262 + i * 12));
    paveIris(g, 16, 300, 42);
  }, null, false, 4);
}
// LE PANNEAU DES FORMATIONS (r04 : à droite du pilier, sur le local) : un cadre sombre, trois bandeaux orange du plus
// jaune au plus rouge, leurs titres blancs et les formations en puces
function texFormations() {
  return canvasTex(128, 384, (g, w, h) => {
    g.fillStyle = '#2b2725'; g.fillRect(0, 0, w, h);
    const bandes = [
      ['#e2a12f', 'BAC PRO', ['• BAC pro SEN']],
      ['#ec961f', 'BTS', ['• BTS SIO', '• BTS SN']],
      ['#ef7a22', 'BAC+3', ['• DEESIRS', '• DEESINF', '• DEESWEB']],
    ];
    bandes.forEach(([c, t, l], i) => {
      const y = 6 + i * 104;
      g.fillStyle = c; g.fillRect(6, y, w - 12, 98);
      g.fillStyle = '#ffffff'; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
      g.font = `800 19px ${POLICE}`; g.fillText(t, 12, y + 26);
      g.font = `600 11px ${POLICE}`; l.forEach((s, k) => g.fillText(s, 12, y + 46 + k * 15));
    });
  }, null, false, 4);
}
// L'ÉTIQUETTE ROUGE en haut de la porte du local (r04 : bandeau rouge, texte blanc illisible — le mot est IMAGINÉ)
function texEtiquetteRouge() {
  return canvasTex(256, 48, (g, w, h) => {
    g.fillStyle = '#c4202b'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffffff'; g.font = `700 22px ${POLICE}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('LOCAL TECHNIQUE', w / 2, h / 2 + 1);
  }, null, false, 2);
}
// LE TRIANGLE JAUNE « danger électrique » (r04 : deux, sur les portes du local)
function texTriangle() {
  return canvasTex(64, 64, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = '#151515'; g.beginPath(); g.moveTo(w / 2, 2); g.lineTo(w - 2, h - 6); g.lineTo(2, h - 6); g.closePath(); g.fill();
    g.fillStyle = '#f4c51c'; g.beginPath(); g.moveTo(w / 2, 10); g.lineTo(w - 9, h - 10); g.lineTo(9, h - 10); g.closePath(); g.fill();
    g.fillStyle = '#151515'; g.beginPath(); g.moveTo(35, 20); g.lineTo(25, 38); g.lineTo(32, 38); g.lineTo(28, 50); g.lineTo(40, 32); g.lineTo(33, 32); g.closePath(); g.fill();
  }, null, true, 2);
}
// L'ÉCRAN SUSPENDU (r04) : « Commander votre sweat à l'accueil pour 25€ », noir sur fond clair bleuté, le pavé « iris »
// en haut à droite
function texEcranTV() {
  return canvasTex(256, 144, (g, w, h) => {
    const f = g.createLinearGradient(0, 0, w, h); f.addColorStop(0, '#eef2f8'); f.addColorStop(1, '#cfd9ea');
    g.fillStyle = f; g.fillRect(0, 0, w, h);
    g.fillStyle = '#1b1d22'; g.font = `600 19px ${POLICE}`; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    ['Commander votre', 'sweat à l\'accueil', 'pour 25€'].forEach((t, i) => g.fillText(t, w / 2 - 8, 54 + i * 24));
    paveIris(g, w - 52, 10, 40);
  }, null, false, 4);
}
// LE SWEAT PLIÉ « iris » du haut du portant (r04 : blanc, le pavé noir et une ligne de texte) et celui à l'impression
// colorée (bleu, violet, vert) en dessous
function texSweat(imprime) {
  return canvasTex(128, 96, (g, w, h) => {
    g.fillStyle = '#ecebe8'; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(0,0,0,0.08)'; for (let y = 8; y < h; y += 16) g.fillRect(0, y, w, 2);
    if (imprime) {
      const c = ['#6d5bd0', '#3aa6d8', '#9a62c8', '#59c08a'];
      for (let k = 0; k < 14; k++) { g.fillStyle = c[k % 4]; g.globalAlpha = 0.75; g.beginPath(); g.ellipse(24 + (k * 37) % 84, 40 + (k * 23) % 34, 12, 6, k, 0, 7); g.fill(); }
      g.globalAlpha = 1;
    } else {
      paveIris(g, 30, 16, 66);
      g.fillStyle = '#4a4a4a'; g.fillRect(34, 56, 58, 4); g.fillRect(40, 64, 46, 4);
    }
  }, null, false, 2);
}
// L'AFFICHETTE DU PORTANT (r04) : carton blanc, deux photos de sweats gris à gauche et à droite, le texte au milieu
function texAffichette() {
  return canvasTex(192, 112, (g, w, h) => {
    g.fillStyle = '#f6f5f2'; g.fillRect(0, 0, w, h);
    for (const x of [8, w - 64]) {
      g.fillStyle = '#d9d8d4'; g.fillRect(x, 10, 56, 92);
      g.fillStyle = '#9a9b9e'; g.beginPath(); g.moveTo(x + 10, 98); g.lineTo(x + 12, 40); g.lineTo(x + 28, 28); g.lineTo(x + 44, 40); g.lineTo(x + 46, 98); g.closePath(); g.fill();
      g.fillStyle = '#2a2a2c'; g.fillRect(x + 22, 52, 12, 5);
    }
    g.fillStyle = '#222'; g.font = `600 10px ${POLICE}`; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    ['Affichez', 'vos', 'couleurs', 'iris !'].forEach((t, i) => g.fillText(t, w / 2, 36 + i * 13));
  }, null, false, 2);
}
// LES BROCHURES « iris » des tablettes du portant (r04) : couvertures blanches, une grande image bleue et violette, le
// pavé noir
function texBrochures() {
  return canvasTex(256, 96, (g, w, h) => {
    g.fillStyle = '#1d1d1f'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 3; i++) {
      const x = 6 + i * 84;
      g.fillStyle = '#f6f5f1'; g.fillRect(x, 4, 76, h - 6);
      const d = g.createLinearGradient(x, 30, x + 76, 80); d.addColorStop(0, '#3f6fd6'); d.addColorStop(1, '#8a4fc8');
      g.fillStyle = d; g.beginPath(); g.ellipse(x + 44, 54, 30, 18, -0.3, 0, 7); g.fill();
      g.fillStyle = '#e6b08c'; g.beginPath(); g.arc(x + 22, 72, 10, 0, 7); g.fill();
      paveIris(g, x + 8, 10, 30);
    }
  }, null, false, 4);
}
// LA VITRE DE LA CLOISON BIAISE (r04 agrandie : verre clair, très lumineux — le jour de la fenêtre de façade derrière —,
// trois bandes sombres de vitrophanie entre 1,50 et 1,82 m). La texture couvre le verre de 0,10 m à `hv`.
function texVitreBandes(hv) {
  return canvasTex(64, 256, (g, w, h) => {
    const f = g.createLinearGradient(0, 0, 0, h); f.addColorStop(0, '#f4f8fb'); f.addColorStop(1, '#dfe7ec');
    g.fillStyle = f; g.fillRect(0, 0, w, h);
    const y = (m) => (hv - m) / (hv - 0.1) * h;
    g.fillStyle = 'rgba(52,58,66,0.82)';
    for (const [a, b] of [[1.74, 1.82], [1.63, 1.70], [1.50, 1.57]]) g.fillRect(0, y(b), w, y(a) - y(b));
  }, null, false, 2);
}
// LE COUSSIN RAYÉ noir et blanc d'un fauteuil du personnel (VO q_0373)
function texZebre() {
  return canvasTex(64, 64, (g, w, h) => {
    g.fillStyle = '#e9e7e2'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#16161a';
    for (let k = -4; k < 8; k++) { g.beginPath(); g.moveTo(k * 12, 0); g.lineTo(k * 12 + 6, 0); g.lineTo(k * 12 + 6 + 20, h); g.lineTo(k * 12 + 20, h); g.closePath(); g.fill(); }
  }, null, false, 2);
}
// LE CYLINDRE BLANC marqué « iris » (VO q_0380)
function texPotIris() {
  return canvasTex(128, 64, (g, w, h) => {
    g.fillStyle = '#f2f1ec'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#151517'; g.font = `600 26px ${GOTHIC}`; g.fillText('iris', 12, 40);
    g.fillStyle = '#f1b40c'; g.fillRect(12, 16, 5, 3);
  }, null, false, 2);
}
// LE LOGO « DELL » au dos de l'écran de l'hôtesse (r04 : la seule chose qui dépasse du comptoir, une bande noire et le
// mot blanc)
function texDell() {
  return canvasTex(128, 32, (g, w, h) => {
    g.fillStyle = '#121214'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#e8e8e8'; g.font = `700 20px ${POLICE}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('DELL', w / 2, h / 2 + 1);
  }, null, false, 2);
}

// =====================================================================
//  LES MATIÈRES DU HALL
// =====================================================================
function matieresHall() {
  const std = (o, nom) => { const m = new THREE.MeshStandardMaterial(o); m.name = nom; return m; };
  const H = {
    // le mitoyen GRIS ARDOISE (r04 : un gris foncé presque neutre, à peine chaud — #494340 en haut, à l'appareil, sous le
    // plafond #ADAEB0 ; la VO de 2021, étalonnée froid, le rendait bleuté)
    // (relecture du 12/10, r04 rejouée : à 0,5 de la luminance du comptoir sur la photo, le jeu la rendait à 0,29 — presque
    // noire : un ton plus clair)
    ardoise: std({ map: texPeinture(0x6e6d70, 4), roughness: 0.82 }, 'peinture gris ardoise (mitoyen de l\'accueil)'),
    // le comptoir : un stratifié GRIS CLAIR (r04 : nettement plus sombre que le plafond et les murs blancs), la tablette
    // grise, la rainure
    comptoir: std({ color: 0xcdcac6, roughness: 0.45 }, 'stratifié gris clair (comptoir)'),
    tablette: std({ color: 0xb3b0ac, roughness: 0.35 }, 'tablette grise (comptoir)'),
    rainure: std({ color: 0x6f6b67, roughness: 0.5 }, 'rainure du comptoir'),
    // le socle de CHÊNE CLAIR des meubles de l'accueil (r04 : #8B6E59 à l'appareil, plus clair que les plinthes vernies)
    chene: std({ color: 0xb98d62, roughness: 0.5 }, 'socle de chêne clair (accueil)'),
    boisClair: std({ map: texBoisClair(), roughness: 0.55 }, 'stratifié bois clair (local, pilier)'),
    joint: std({ color: 0x4a3f36, roughness: 0.6 }, 'joint des portes du local'),
    bureau: std({ color: 0x3d4150, roughness: 0.48 }, 'bureau bleu-gris foncé'),
    plan: std({ color: 0xdedcd8, roughness: 0.4 }, 'plan de travail blanc gris'),
    pied: std({ color: 0x2c2f37, roughness: 0.4, metalness: 0.4 }, 'piètement des bureaux'),
    copieur: std({ color: 0xdcdcd8, roughness: 0.45 }, 'photocopieur (corps)'),
    copieur2: std({ color: 0xaeaeab, roughness: 0.5 }, 'photocopieur (scanner, tiroirs)'),
    caisson: std({ color: 0xc8c8c5, roughness: 0.55 }, 'caisson gris clair'),
    corbeille: std({ color: 0x55585e, roughness: 0.5 }, 'corbeille à courrier grise'),
    corbeilleO: std({ color: 0xe8862a, roughness: 0.5 }, 'corbeille à courrier orange'),
    meubleNoir: std({ color: 0x1d1a18, roughness: 0.45 }, 'meuble bas noir'),
    tableB: std({ color: 0xf1f0ec, roughness: 0.4 }, 'table blanche'),
    alu: std({ color: 0xeeeeec, roughness: 0.35, metalness: 0.25 }, 'aluminium laqué blanc (cloison)'),
    cadreSombre: std({ color: 0x3b4452, roughness: 0.4, metalness: 0.3 }, 'menuiserie gris bleu (cloison)'),
    argent: std({ color: 0xb8bbbe, roughness: 0.3, metalness: 0.8 }, 'cadre argent'),
    rouge: std({ color: 0xc8202a, roughness: 0.45 }, 'déclencheur rouge'),
    ecran: std({ color: 0x1e2836, roughness: 0.2, emissive: 0x4a6280, emissiveIntensity: 0.22 }, 'écran allumé'),
  };
  // (les murs peints : le léger relief d'enduit des autres peintures)
  detailPhoto(H.ardoise, 'beton', 1, 1, { relief: 0.035, grain: 0, rugo: false });
  // LES LIGNES LUMINEUSES du plafond : des rubans de LED qui éblouissent (MeshBasic au-dessus de 1 : le bloom les fait
  // briller, comme les spots — js/ecole_matieres.js M.spot)
  H.ligne = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff3e2).multiplyScalar(3.6) }); H.ligne.name = 'ligne lumineuse du plafond';
  H.profil = std({ color: 0xd9d9d6, roughness: 0.4, metalness: 0.5 }, 'profil des lignes lumineuses');
  // les vitres éclairées par-derrière (le jour de la fenêtre de façade, dans le bureau d'angle)
  const tv = texVitreBandes(H_VITRE);
  H.vitre = std({ map: tv, emissive: 0xffffff, emissiveMap: tv, emissiveIntensity: 0.55, roughness: 0.15, side: THREE.DoubleSide }, 'vitre de la cloison biaise');
  H.vitreClaire = std({ color: 0xe8eff3, emissive: 0xf2f6f8, emissiveIntensity: 0.6, roughness: 0.15, side: THREE.DoubleSide }, 'vitre du bureau d\'angle');
  // le blanc de la cloison biaise et de sa retombée, dans le jour des fenêtres de façade (r04 : le coin sud-est est le plus
  // clair de la photo, 248 sur 255 ; les spots seuls le rendaient gris beige, 141)
  H.blancJour = std({ map: texPeinture(0xefede8), roughness: 0.86, emissive: 0xf4f6f8, emissiveIntensity: 0.32 }, 'peinture blanche au jour (bureau d\'angle)');
  return H;
}

// =====================================================================
//  LES OUTILS
// =====================================================================
let H = null;                       // les matières du hall (créées par poserHall)
const ROT = { S: 0, N: Math.PI, E: Math.PI / 2, W: -Math.PI / 2 };
const DIR = { S: [0, 1], N: [0, -1], E: [1, 0], W: [-1, 0] };      // (en monde : x, z)
// un groupe posé au point (x, y) du plan, son « avant » (+z local) tourné vers `face` — ou vers le cap `face` en degrés
// (depuis le nord, + vers l'est)
function groupe(ch, x, y, face) {
  const g = new THREE.Group(); g.position.set(x, 0, -y);
  g.rotation.y = typeof face === 'number' ? Math.PI - face * Math.PI / 180 : ROT[face]; ch.decor.add(g);
  return g;
}
// une boîte en coordonnées LOCALES d'un groupe : centre (x, y, z), tailles (w, h, d)
const BL = (g, mat, w, h, d, x, y, z, o) => maille(boiteM(w, h, d), mat, x, y, z, 0, g, o);
const CL = (g, mat, r, h, x, y, z, seg = 10, o) => maille(new THREE.CylinderGeometry(r, r, h, seg), mat, x, y, z, 0, g, o);
// un plan texturé en coordonnées locales, tourné vers +z
const PL = (g, mat, w, h, x, y, z) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); p.position.set(x, y, z); p.receiveShadow = true; g.add(p); return p; };
// UN SIÈGE pour le jeu (js/game.js : on s'assoit à moins de 1,1 m) : regard vers `face`, relevé en (sx, sy) du plan
function siege(ch, x, y, h, face, sx, sy, nom) {
  const [fx, fz] = DIR[face];
  ch.sieges.push({ x: x + fx * 0.03, z: -y + fz * 0.03, y: h, fx, fz, sx, sz: -sy, nom, sol: 0 });
}

// LE FAUTEUIL DE BUREAU NOIR (VO q_0373-0380) : piètement étoile à roulettes, vérin, assise rembourrée, dossier résille,
// accoudoirs. `zebre` : le coussin rayé noir et blanc ; `place` : false pour celui du bureau d'angle, qu'on n'atteint pas
function fauteuil(ch, x, y, face, { zebre = false, sx, sy, nom = 'le fauteuil', place = true } = {}) {
  const M = ch.M, g = groupe(ch, x, y, face);
  for (let k = 0; k < 5; k++) {
    const a = k / 5 * Math.PI * 2, b = BL(g, M.noir, 0.05, 0.03, 0.3, Math.sin(a) * 0.15, 0.075, Math.cos(a) * 0.15, { ombre: false });
    b.rotation.y = a;
    maille(new THREE.SphereGeometry(0.025, 8, 6), M.noir, Math.sin(a) * 0.29, 0.025, Math.cos(a) * 0.29, 0, g, { ombre: false });
  }
  CL(g, M.inox, 0.022, 0.32, 0, 0.25, 0);
  BL(g, M.noir, 0.5, 0.08, 0.48, 0, 0.45, 0.02);
  const dos = BL(g, M.noir, 0.46, 0.5, 0.05, 0, 0.79, -0.22); dos.rotation.x = -0.12;
  for (const s of [-1, 1]) { BL(g, M.noir, 0.04, 0.2, 0.04, s * 0.25, 0.58, 0.0, { ombre: false }); BL(g, M.noir, 0.06, 0.025, 0.26, s * 0.25, 0.69, 0.02, { ombre: false }); }
  if (zebre) {
    const z = new THREE.MeshStandardMaterial({ map: texZebre(), roughness: 0.85 });
    BL(g, z, 0.44, 0.05, 0.42, 0, 0.515, 0.02, { ombre: false });
  }
  if (place) {
    ch.C.ajouterCercle(x, -y, 0.24, { y1: 1.1 });
    siege(ch, x, y, 0.5, face, sx ?? x, sy ?? y, nom);
  }
  return g;
}
// UN ÉCRAN DE BUREAU (pied, dalle noire ; `allume` : l'écran vu de face ; `haut` : le centre de la dalle)
function ecran(ch, x, y, h, face, allume = false, haut = 0.33) {
  const { M } = ch, g = groupe(ch, x, y, face); g.position.y = h;
  BL(g, M.noir, 0.2, 0.012, 0.16, 0, 0.006, 0, { ombre: false });
  BL(g, M.noir, 0.05, haut - 0.17, 0.03, 0, (haut - 0.17) / 2 + 0.006, -0.03, { ombre: false });
  BL(g, M.noir, 0.56, 0.34, 0.03, 0, haut, 0.0);
  if (allume) { const e = new THREE.Mesh(new THREE.PlaneGeometry(0.53, 0.3), H.ecran); e.position.set(0, haut, 0.016); g.add(e); }
  return g;
}
// LE PHOTOCOPIEUR MULTIFONCTION (VO 6,4-7,4 s ; r04, celui de l'open-space) : socle à tiroirs, corps, sortie, scanner et
// chargeur ; `haut` : le dessus du chargeur (celui de l'open-space est plus grand : il dépasse du comptoir, r04)
function copieur(ch, x, y, face, haut = 1.15) {
  const g = groupe(ch, x, y, face), k = haut / 1.15, { M } = ch;
  BL(g, H.copieur, 0.64, 0.56 * k, 0.66, 0, 0.3 * k, 0);
  for (const h of [0.14, 0.27, 0.4, 0.53]) BL(g, H.copieur2, 0.6, 0.01, 0.005, 0, h * k, 0.332, { ombre: false });
  BL(g, M.noir, 0.64, 0.06, 0.66, 0, 0.03, 0, { ombre: false });
  BL(g, H.copieur, 0.64, 0.34 * k, 0.62, 0, 0.75 * k, -0.02);
  BL(g, H.copieur2, 0.5, 0.04, 0.5, 0.02, 0.94 * k, 0.0, { ombre: false });
  BL(g, H.copieur, 0.66, 0.1, 0.62, 0, haut - 0.14, -0.02);
  BL(g, H.copieur2, 0.6, 0.06, 0.5, 0, haut - 0.06, -0.04);
  BL(g, M.noir, 0.16, 0.05, 0.08, 0.2, haut - 0.13, 0.3, { ombre: false });             // (le pupitre de commande)
  BL(g, H.copieur2, 0.06, 0.3, 0.4, -0.35, 0.72 * k, 0.0);                          // (le bac manuel)
  return g;
}

// =====================================================================
//  LE HALL (crochet de js/carte_ecole.js : construireAccueil)
// =====================================================================
export function poserHall(ch) {
  const { M, C } = ch;
  H = matieresHall();
  const B = (x0, y0, x1, y1, h0, h1, mat, o) => ch.boite(Math.min(x0, x1), Math.min(y0, y1), Math.max(x0, x1), Math.max(y0, y1), h0, h1, mat, o);

  // =====================================================================
  //  LE MITOYEN EST : GRIS ARDOISE de la cloison biaise au local technique (r04)
  // =====================================================================
  // (r04 : le gris s'arrête net au sud, en y 1,82, contre le montant de la cloison biaise ; au nord, contre la face sud
  // du local, y 4,43. Plinthe de bois, comme tout le hall.)
  ch.mur({ de: [19.95, -0.4], a: [19.95, Y_ARD], ep: 0.3, mats: M.blanc, plinthes: ['W'] });
  ch.mur({ de: [19.95, Y_ARD], a: [19.95, 7.65], ep: 0.3, mats: { W: H.ardoise, E: M.blanc }, plinthes: ['W'] });
  // LES DEUX AFFICHES (r04, rétroprojetées sur le mitoyen : 0,67 x 0,94 chacune, de 1,44 à 2,38 m ; celle au cadre
  // magenta au nord, y 3,37-4,04, celle aux lignes de couleur au sud, y 2,22-2,89 — l'ordre de la VO q_0377-0383, où
  // elles étaient lues plus au sud), sous un mince cadre d'aluminium
  const xa = X_MIT - 0.012;
  for (const [y, tex] of [[3.705, texAfficheMagenta()], [2.555, texAfficheLignes()]]) {
    ch.panneau(new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 }), 0.66, 0.93, xa - 0.004, y, 1.91, 'W');
    for (const [y0, y1, h0, h1] of [[-0.335, 0.335, 2.365, 2.38], [-0.335, 0.335, 1.44, 1.455], [-0.335, -0.32, 1.44, 2.38], [0.32, 0.335, 1.44, 2.38]]) B(xa - 0.016, y + y0, X_MIT, y + y1, h0, h1, H.argent, { ombre: false });
  }
  // LES DEUX CAMÉRAS DÔMES au plafond (r04 : l'une près du mitoyen, au-dessus de l'affiche aux lignes ; l'autre au fond à
  // gauche, au nord-ouest du pilier)
  for (const [x, y] of [[19.62, 2.4], [18.1, 6.4]]) {
    const d = maille(new THREE.SphereGeometry(0.06, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M.boitier, x, H_PLAF, -y, 0, ch.decor, { ombre: false });
    const c = maille(new THREE.CylinderGeometry(0.075, 0.075, 0.02, 20), M.boitier, x, H_PLAF - 0.01, -y, 0, ch.decor, { ombre: false });
    d.userData.horsAOSol = c.userData.horsAOSol = true;
  }

  // =====================================================================
  //  LE BUREAU D'ANGLE : LA CLOISON BIAISE DU COIN SUD-EST (r04 ; VO q_0383)
  // =====================================================================
  // (r04 : au bout du mur ardoise, une vitre claire à trois bandes sombres, que l'appareil voit presque DE FACE, puis un
  // plein blanc, puis une étroite baie à menuiserie gris bleu ; au-dessus, une retombée blanche dont l'arête MONTE vers la
  // droite — rétroprojetée, de (19,86 ; 1,77) à (18,98 ; 1,0) : une cloison à 45°, qui ferme le coin sud-est. La VO de
  // 2021 voit, du nord, la même suite au même endroit : la « troisième fenêtre » au-delà du mitoyen de hall.md. Elle part
  // du mitoyen en y 1,82 et finit sur la façade en x 17,98, au bord du trumeau : la fenêtre c 18,98 est dans le bureau.
  // Rejouée à la pose de r04 : la vitre de 0,07 à 0,54 m du mitoyen le long de la cloison, le montant gris jusqu'à 0,64,
  // le plein blanc jusqu'à 1,04, la baie étroite jusqu'à 1,16 ; le haut des vitres à 2,07. La porte vitrée et le reste,
  // hors du cadre de r04 : IMAGINÉS. Le blanc y est celui du jour — H.blancJour.)
  {
    const L = Y_ARD * Math.SQRT2, ep = 0.1, hv = H_VITRE;
    const g = new THREE.Group(); g.position.set(X_MIT, 0, -(X_MIT - BIAIS)); g.rotation.y = -3 * Math.PI / 4; ch.decor.add(g);
    // le long de la cloison (x local de 0 à L, vers la façade) : [début, fin, sorte]
    const morceaux = [[0, 0.07, 'montant'], [0.07, 0.54, 'vitre'], [0.54, 0.64, 'poteau'], [0.64, 1.04, 'plein'], [1.04, 1.07, 'cadre'], [1.07, 1.13, 'baie'], [1.13, 1.16, 'cadre'], [1.16, 1.42, 'plein'], [1.42, 2.32, 'porte'], [2.32, L, 'plein']];
    for (const [a, b, s] of morceaux) {
      const w = b - a, cx = (a + b) / 2;
      if (s === 'plein') BL(g, H.blancJour, w, hv, ep, cx, hv / 2, 0);
      else if (s === 'montant') BL(g, H.alu, w, hv, ep, cx, hv / 2, 0);
      else if (s === 'poteau') BL(g, H.copieur2, w, hv, ep * 1.2, cx, hv / 2, 0);
      else if (s === 'cadre') BL(g, H.cadreSombre, w, hv - 0.1, ep * 0.8, cx, (hv - 0.1) / 2 + 0.1, 0);
      else {
        // une vitre (la grande, la porte : les bandes de vitrophanie ; la baie étroite : claire), son rail bas, son profil haut
        const v = new THREE.Mesh(new THREE.PlaneGeometry(w, hv - 0.1), s === 'baie' ? H.vitreClaire : H.vitre); v.position.set(cx, 0.1 + (hv - 0.1) / 2, 0); v.userData.vitre = true; v.castShadow = false; g.add(v);
        BL(g, s === 'baie' ? H.cadreSombre : H.alu, w, 0.1, ep, cx, 0.05, 0);
        BL(g, s === 'baie' ? H.cadreSombre : H.alu, w, 0.04, ep, cx, hv - 0.02, 0);
        if (s === 'porte') {
          for (const x of [a + 0.03, b - 0.03]) BL(g, H.alu, 0.06, hv - 0.1, ep, x, (hv - 0.1) / 2 + 0.1, 0);
          BL(g, H.alu, w, 0.05, ep, cx, 2.05, 0);
          for (const z of [-1, 1]) BL(g, M.inox, 0.02, 0.32, 0.02, a + 0.12, 1.05, z * 0.065, { ombre: false });
        }
      }
    }
    // la retombée blanche au-dessus, jusqu'au plafond (r04)
    BL(g, H.blancJour, L, H_PLAF - hv, ep, L / 2, (hv + H_PLAF) / 2, 0);
    g.traverse((m) => { if (m.isMesh) m.receiveShadow = true; });
    // le monde solide : la cloison entière (la lumière cuite passe par la vitre)
    C.ajouterBoiteOrientee(X_MIT - Y_ARD / 2, -Y_ARD / 2, L / 2, ep / 2, 3 * Math.PI / 4, { y1: H_PLAF });
  }
  // DANS LE BUREAU D'ANGLE (IMAGINÉ : r04 n'y voit que la lumière de la fenêtre) : un bureau blanc sous la fenêtre de
  // façade, son écran, son fauteuil
  B(18.85, 0.05, 19.76, 0.7, 0.72, 0.75, H.tableB);
  for (const [x, y] of [[18.88, 0.66], [19.73, 0.66]]) B(x - 0.02, y - 0.02, x + 0.02, y + 0.02, 0, 0.72, M.alu, { ombre: false });
  B(18.85, 0.06, 19.76, 0.08, 0.3, 0.72, H.tableB, { ombre: false });
  ecran(ch, 19.3, 0.3, 0.75, 'N', true);
  fauteuil(ch, 19.45, 1.0, 'S', { place: false });
  C.ajouterBoite(18.85, -0.7, 19.8, 0, { y1: 0.75 });

  // =====================================================================
  //  LE COMPTOIR D'ACCUEIL, LE DÉCROCHÉ PMR, LE RETOUR NORD (r04 ; photo 03 ; VO q_0373-0384)
  // =====================================================================
  // (r04 : la face du comptoir est à 3,25 m de l'appareil, le mur ardoise à 6,5 m ; les deux fuient au même point : le
  // comptoir est NORD-SUD et parallèle au mitoyen, à 3,0 m de lui. Son bout nord en y 3,6 ; il passe le bord droit de la
  // photo en y 1,4 — son bout sud reste celui de la VO, à 0,5 m du poteau est de la porte 6. Les hauteurs, prises entre
  // le pied du socle et le chant de la tablette sur une même verticale : la rainure à 0,71 m — la VO la mettait à 0,55 —,
  // le socle de 11 cm.)
  // le comptoir haut : le socle de chêne clair en retrait de 4 cm, le caisson de stratifié gris clair, la rainure sur la
  // face avant (ouest) et sur le bout sud, la tablette grise qui déborde de 7 cm côté visiteurs
  B(CPT.x0 + 0.04, CPT.y0 + 0.04, CPT.x1, CPT.y1, 0, CPT.socle, H.chene);
  B(CPT.x0, CPT.y0, CPT.x1, CPT.y1, CPT.socle, CPT.h - 0.035, H.comptoir);
  B(CPT.x0 - 0.004, CPT.y0, CPT.x0, CPT.y1, CPT.rainure - 0.008, CPT.rainure + 0.008, H.rainure, { ombre: false });
  B(CPT.x0, CPT.y0 - 0.004, CPT.x1, CPT.y0, CPT.rainure - 0.008, CPT.rainure + 0.008, H.rainure, { ombre: false });
  B(CPT.x0 - 0.07, CPT.y0 - 0.03, CPT.x1, CPT.y1, CPT.h - 0.035, CPT.h, H.tablette);
  // LE DÉCROCHÉ PMR (r04, à gauche) : le caisson bas EN RETRAIT de 25 cm (sa plinthe de chêne passe derrière le pied), la
  // tablette grise à 0,76 qui avance jusqu'à 16,88 et file, côté personnel, jusqu'au plan de travail ; à son angle
  // nord-ouest, le pied gris carré sur son socle de chêne
  B(PMR.xF + 0.03, PMR.y0, X_PERS, PMR.y1 - 0.03, 0, 0.1, H.chene);
  B(PMR.xF, PMR.y0, X_PERS, PMR.y1, 0.1, PMR.h - 0.03, H.comptoir);
  B(PMR.x0, PMR.y0, X_PERS, PMR.y1, PMR.h - 0.03, PMR.h, H.tablette);
  B(16.915, 4.355, 17.055, 4.495, 0, 0.08, H.chene);
  B(16.93, 4.37, 17.04, 4.48, 0.08, PMR.h - 0.03, H.comptoir);
  // LE CAISSON HAUT DU DÉCROCHÉ : posé sur le bout nord de la tablette basse, au-dessus du pied, du même stratifié, et sa
  // tablette haute qui déborde de 0,3 m au nord (r04 : sa face ouest de x 178 à 200, sa face sud de 200 à 262, de 0,76 à
  // 1,10 m, les bacs noirs devant ; la tablette de x 128 à 265 — sous son débord, on voit le pilier : rien ne la porte)
  B(RET.x0, RET.y0, RET.x1, RET.y1, PMR.h, RET.h - 0.03, H.comptoir);
  B(RET.x0 - 0.05, RET.y0 - 0.07, RET.x1 + 0.05, RET.y1 + 0.3, RET.h - 0.03, RET.h, H.tablette);
  // derrière (est) : le plan de travail du personnel à 0,75 m, le long du comptoir haut, sur trois pieds
  B(CPT.x1, CPT.y0 + 0.05, X_PERS, CPT.y1, 0.72, 0.75, H.plan);
  for (const y of [CPT.y0 + 0.1, 2.35, CPT.y1 - 0.08]) B(X_PERS - 0.06, y - 0.025, X_PERS - 0.02, y + 0.025, 0, 0.72, H.pied, { ombre: false });
  // le monde solide : le comptoir et son plan de travail, le décroché, le débord de la tablette haute
  C.ajouterBoite(CPT.x0 - 0.07, -CPT.y1, X_PERS, -(CPT.y0 - 0.03), { y1: CPT.h });
  C.ajouterBoite(PMR.x0, -PMR.y1, X_PERS, -PMR.y0, { y1: PMR.h });
  C.ajouterBoite(RET.x0 - 0.05, -(RET.y1 + 0.3), RET.x1 + 0.05, -PMR.y1, { y0: RET.h - 0.03, y1: RET.h });
  // SUR LE DÉCROCHÉ (r04) : les bacs à courrier noirs empilés et leurs papiers rouges et blancs, contre le caisson haut ;
  // la bouilloire inox ; une chemise rouge et des feuilles à plat au bord
  for (let k = 0; k < 3; k++) {
    const h = PMR.h + k * 0.055;
    B(17.03, 4.05, 17.4, 4.38, h, h + 0.008, M.noir, { ombre: false });
    B(17.03, 4.05, 17.4, 4.065, h, h + 0.045, M.noir, { ombre: false });
    for (const x of [17.03, 17.39]) B(x, 4.05, x + 0.01, 4.38, h, h + 0.045, M.noir, { ombre: false });
    B(17.05, 4.08, 17.38, 4.36, h + 0.008, h + 0.016 + k * 0.004, k === 1 ? H.rouge : M.store, { ombre: false });
  }
  {
    const g = groupe(ch, 17.3, 3.99, 'W'); g.position.y = PMR.h;
    CL(g, M.inox, 0.075, 0.2, 0, 0.1, 0, 20);
    CL(g, M.noir, 0.06, 0.02, 0, 0.21, 0, 16, { ombre: false });
    BL(g, M.noir, 0.03, 0.15, 0.03, 0, 0.11, -0.095, { ombre: false });
    CL(g, M.noir, 0.085, 0.015, 0, 0.0075, 0, 20, { ombre: false });
  }
  B(16.98, 3.64, 17.24, 3.9, PMR.h, PMR.h + 0.01, H.rouge, { ombre: false });
  B(16.92, 3.93, 17.12, 4.2, PMR.h, PMR.h + 0.006, M.store, { ombre: false });
  // SUR LES TABLETTES HAUTES (r04) : des feuilles et des dépliants à plat le long du bord, une petite pile blanche vers le
  // bout nord ; sur le caisson haut, des papiers
  B(16.86, 3.08, 17.1, 3.36, CPT.h, CPT.h + 0.03, M.store, { ombre: false });
  for (const [y, l] of [[1.45, 0.3], [1.8, 0.26], [2.12, 0.3]]) B(16.82, y, 17.03, y + l, CPT.h, CPT.h + 0.006, M.store, { ombre: false });
  B(17.3, 4.42, 17.7, 4.66, RET.h, RET.h + 0.012, M.store, { ombre: false });
  // L'ÉCRAN DE L'HÔTESSE (r04 : son dos noir dépasse à peine du comptoir, une bande noire marquée « DELL », vers y 2,9)
  // et, sur le bureau du mitoyen, un portable ouvert (un second écran dépasserait du comptoir : r04 n'en montre pas)
  {
    const e = ecran(ch, 17.78, 2.92, 0.75, 'E', true, 0.3);
    const l = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 0.032), new THREE.MeshStandardMaterial({ map: texDell(), roughness: 0.4 }));
    l.position.set(0, 0.42, -0.016); l.rotation.y = Math.PI; e.add(l);
  }
  {
    const g = groupe(ch, 19.47, 3.3, 'W'); g.position.y = 0.75;
    BL(g, M.noir, 0.34, 0.015, 0.24, 0, 0.0075, 0.02, { ombre: false });
    const v = BL(g, M.noir, 0.34, 0.22, 0.012, 0, 0.11, -0.1, { ombre: false }); v.rotation.x = -0.25;
  }

  // =====================================================================
  //  L'OPEN-SPACE DU PERSONNEL (r04 ; VO q_0373-0384 ; photo 03)
  // =====================================================================
  // (r04 : derrière le comptoir, rien ne dépasse entre le local et la cloison biaise que l'écran « DELL » et, au fond à
  // droite, contre la cloison, le grand copieur blanc. Le reste est sous la ligne du comptoir : le bureau bleu-gris du
  // mitoyen (VO), le plan de travail, les fauteuils. Le passage du personnel : par le nord, entre le décroché et le local
  // (0,75 m), puis le long du plan de travail.)
  B(19.2, 1.98, 19.78, LOC.y0, 0.72, 0.75, H.bureau);
  B(19.74, 1.98, 19.77, LOC.y0, 0.3, 0.72, H.bureau, { ombre: false });
  B(19.21, LOC.y0 - 0.06, 19.27, LOC.y0, 0, 0.72, H.pied, { ombre: false });
  B(19.2, 2.62, 19.74, 3.04, 0, 0.6, H.bureau);
  for (const h of [0.2, 0.4]) B(19.2, 2.62, 19.204, 3.04, h - 0.006, h + 0.006, H.pied, { ombre: false });
  C.ajouterBoite(19.2, -LOC.y0, 19.8, -1.98, { y1: 0.75 });
  // sur le bureau : le pot blanc « iris », la corbeille à courrier noire, des classeurs couchés
  maille(new THREE.CylinderGeometry(0.09, 0.085, 0.26, 20), new THREE.MeshStandardMaterial({ map: texPotIris(), roughness: 0.4 }), 19.6, 0.88, -2.3, 0, ch.decor);
  B(19.42, 2.62, 19.74, 2.92, 0.75, 0.81, M.noir);
  ['#1d1d20', '#2f5f9a', '#f0efea'].forEach((c, i) => B(19.4, 3.9, 19.72, 4.2, 0.75 + i * 0.05, 0.8 + i * 0.05, new THREE.MeshStandardMaterial({ color: c, roughness: 0.5 }), { ombre: false }));
  // LE GRAND COPIEUR contre la cloison biaise, tourné vers le nord-ouest (r04 : son chargeur blanc et ses bacs
  // dépassent du comptoir au bord droit, de x 620 à 730, jusqu'à 1,4 m)
  copieur(ch, 18.93, 1.46, 315, 1.42);
  C.ajouterBoiteOrientee(18.93, -1.46, 0.33, 0.34, 3 * Math.PI / 4, { y1: 1.42 });
  // LES FAUTEUILS NOIRS face au comptoir, le long du plan de travail : celui du bout sud porte le manteau moutarde (photo
  // 03 : il dépasse du comptoir vers (18,0 ; 1,7)), celui de l'hôtesse est devant l'écran « DELL », le troisième au
  // décroché, au coussin rayé (VO). Chacun laisse 0,66 m de passage à l'est ; on se relève au nord de sa place.
  const f1 = fauteuil(ch, 18.3, 1.95, 'W', { sx: 18.68, sy: 2.45, nom: 'le fauteuil' });
  fauteuil(ch, 18.3, 2.95, 'W', { sx: 18.68, sy: 3.45, nom: 'le fauteuil de l\'accueil' });
  fauteuil(ch, 18.3, 3.95, 'W', { zebre: true, sx: 18.75, sy: 3.5, nom: 'le fauteuil' });
  BL(f1, new THREE.MeshStandardMaterial({ color: 0xc9a227, roughness: 0.9 }), 0.48, 0.46, 0.07, 0, 0.8, -0.27);

  // =====================================================================
  //  LE LOCAL TECHNIQUE, LE PILIER DE BOIS CLAIR, L'ÉCRAN, LE PANNEAU DES FORMATIONS (r04)
  // =====================================================================
  // (r04 : au fond du comptoir, à gauche du mur ardoise, un bloc de 1 m qui avance du mitoyen — sa face sud blanche (le
  // « retour » au bouton rouge, x 305-345 sur la photo), sa face ouest de stratifié clair : la double porte à étiquette
  // rouge et triangle jaune, jusqu'à 2,10, un panneau fixe au-dessus jusqu'au plafond ; puis le panneau des formations ;
  // puis le pilier, plus avancé, sous l'écran ; au-delà, d'autres portes de stratifié jusqu'au mur nord, un second
  // triangle. Rétroprojetés à la pose de r04 : l'angle du mur ardoise en y 4,43, l'angle sud-ouest du local en x 18,8 ; la
  // porte y 4,5-5,21 ; le panneau y 5,24-5,70 ; le pilier x 18,14-18,8 × y 5,71-6,24.)
  B(LOC.x0 + 0.02, LOC.y0, X_MIT, Y_MUR, 0, H_PLAF, M.blanc);
  B(LOC.x0, LOC.y0, LOC.x0 + 0.02, Y_MUR, 0, H_PLAF, H.boisClair);
  B(LOC.x0 - 0.004, LOC.y0 - 0.004, LOC.x0 + 0.024, LOC.y0, 0, H_PLAF, H.boisClair, { ombre: false });
  B(LOC.x0 + 0.02, LOC.y0 - 0.015, X_MIT, LOC.y0, 0, 0.08, M.bois, { ombre: false });
  C.ajouterBoite(LOC.x0, -Y_MUR, X_MIT, -LOC.y0, { y1: H_PLAF });
  // les portes du local : deux doubles portes (y 4,5-5,21 et 6,45-7,35), leurs joints sombres, la traverse à 2,10
  const xj = LOC.x0 - 0.003, PORTES = [[4.5, 5.21], [6.45, 7.35]];
  for (const [y0, y1] of PORTES) {
    for (const y of [y0, (y0 + y1) / 2, y1]) B(xj, y - 0.004, LOC.x0, y + 0.004, 0.01, 2.1, H.joint, { ombre: false });
    B(xj, y0, LOC.x0, y1, 2.096, 2.104, H.joint, { ombre: false });
    // les poignées (deux barrettes inox, de part et d'autre du joint central)
    for (const s of [-1, 1]) B(xj - 0.025, (y0 + y1) / 2 + s * 0.05 - 0.008, xj, (y0 + y1) / 2 + s * 0.05 + 0.008, 1.0, 1.18, M.inox, { ombre: false });
  }
  for (const [y0, y1] of PORTES) B(xj, y0, LOC.x0, y1, 0.0, 0.01, H.joint, { ombre: false });
  // l'ÉTIQUETTE ROUGE en travers du haut du vantail nord, et le TRIANGLE JAUNE au coin du vantail sud (r04 : de 2,0 à
  // 2,08 m) ; le second triangle sur la porte du fond (r04, au bord gauche : vers y 7,1, à 2,0 m)
  ch.panneau(new THREE.MeshStandardMaterial({ map: texEtiquetteRouge(), roughness: 0.5 }), 0.3, 0.07, xj - 0.002, 5.03, 2.04, 'W');
  const tri = new THREE.MeshStandardMaterial({ map: texTriangle(), transparent: true, alphaTest: 0.4, roughness: 0.5 });
  ch.panneau(tri, 0.08, 0.08, xj - 0.002, 4.83, 2.04, 'W');
  ch.panneau(tri, 0.1, 0.1, xj - 0.002, 7.12, 2.0, 'W');
  // SUR LA FACE SUD, BLANCHE (r04) : le déclencheur rouge, un petit boîtier gris, le boîtier blanc et son cordon noir
  {
    const ys = LOC.y0 - 0.002;
    B(19.33, ys - 0.045, 19.45, ys, 1.38, 1.5, H.rouge, { ombre: false });
    B(19.36, ys - 0.05, 19.42, ys - 0.045, 1.41, 1.47, M.store, { ombre: false });
    B(19.5, ys - 0.03, 19.56, ys, 1.4, 1.5, M.boitier, { ombre: false });
    B(19.6, ys - 0.06, 19.73, ys, 1.36, 1.6, M.store);
    B(19.71, ys - 0.075, 19.725, ys - 0.06, 1.12, 1.4, M.noir, { ombre: false });
  }
  // LE PILIER habillé de stratifié bois clair, sa plinthe de chêne ; son monde solide
  B(PIL.x0, PIL.y0, PIL.x1, PIL.y1, 0, H_PLAF, H.boisClair);
  B(PIL.x0 - 0.012, PIL.y0 - 0.012, PIL.x1, PIL.y1 + 0.012, 0, 0.08, H.chene, { ombre: false });
  C.ajouterBoite(PIL.x0, -PIL.y1, PIL.x1, -PIL.y0, { y1: H_PLAF });
  // LE PANNEAU DES FORMATIONS, entre la porte du local et le pilier (r04 : 0,42 m, de ≈ 0,95 à 2,08), son cadre sombre
  ch.panneau(new THREE.MeshStandardMaterial({ map: texFormations(), roughness: 0.55 }), 0.42, 1.13, xj - 0.012, 5.47, 1.515, 'W');
  B(xj - 0.01, 5.245, xj, 5.695, 0.94, 2.09, H.joint, { ombre: false });
  // L'ÉCRAN SUSPENDU sous la retombée, devant le pilier (r04 : son bord haut suit l'arête de la retombée, son tube de
  // fixation y monte ; son plan fuit vers le cap 112 — il regarde au sud-sud-ouest, penché vers le hall ; de 1,95 à 2,48 ;
  // un cadre noir épais autour d'une dalle claire ; son bout est touche presque le local ; « Commander votre sweat à
  // l'accueil pour 25€ »)
  {
    const g = groupe(ch, 18.37, 5.46, 202); g.position.y = 2.235;
    const t = new THREE.Group(); t.rotation.x = 0.15; g.add(t);
    BL(t, M.noir, 0.88, 0.5, 0.06, 0, 0, 0);
    const tex = texEcranTV();
    const e = PL(t, new THREE.MeshStandardMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.5, roughness: 0.3 }), 0.72, 0.39, 0.02, 0.01, 0.031);
    e.castShadow = false;
    BL(g, M.noir, 0.04, 2.5 - 2.235 - 0.21, 0.04, -0.28, (2.5 - 2.235 + 0.21) / 2, -0.05, { ombre: false });
    g.traverse((m) => { m.userData.horsAOSol = true; });
  }

  // =====================================================================
  //  LE PORTANT DES GOODIES (r04 : devant le pilier, noir, sur roulettes)
  // =====================================================================
  // (r04, de haut en bas : le sweat plié « iris », 1,45-1,67 ; le sweat à l'impression colorée, 1,15-1,45 ; l'affichette
  // aux deux photos de sweats, 0,9-1,15 ; deux tablettes inclinées de brochures, 0,6-0,78 et 0,2-0,4 ; deux montants noirs
  // et quatre roulettes. Tourné vers le hall, au sud-ouest.)
  {
    const g = groupe(ch, 17.3, 5.55, 225), N = M.noir;
    for (const s of [-1, 1]) {
      BL(g, N, 0.025, 1.66, 0.025, s * 0.25, 0.86, -0.12);
      BL(g, N, 0.025, 0.9, 0.025, s * 0.25, 0.48, 0.1);
      BL(g, N, 0.025, 0.025, 0.25, s * 0.25, 0.08, -0.01, { ombre: false });
      for (const z of [-0.12, 0.1]) maille(new THREE.SphereGeometry(0.03, 8, 6), N, s * 0.25, 0.035, z, 0, g, { ombre: false });
    }
    const br = new THREE.MeshStandardMaterial({ map: texBrochures(), roughness: 0.6 });
    for (const h of [0.14, 0.5]) {
      const t = BL(g, N, 0.5, 0.012, 0.24, 0, h, 0.0); t.rotation.x = 0.35;
      BL(g, N, 0.5, 0.04, 0.012, 0, h - 0.03, 0.11, { ombre: false });
      const b = PL(g, br, 0.46, 0.22, 0, h + 0.11, 0.01); b.rotation.x = -0.35;
    }
    for (const h of [0.84, 1.14, 1.43]) BL(g, N, 0.5, 0.012, 0.3, 0, h, -0.02);
    const sw = (imprime, h) => {
      const m = [new THREE.MeshStandardMaterial({ color: 0xecebe8, roughness: 0.9 }), new THREE.MeshStandardMaterial({ map: texSweat(imprime), roughness: 0.9 })];
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.28, 0.3), [m[0], m[0], m[0], m[0], m[1], m[0]]); b.position.set(0, h + 0.14, -0.01); b.castShadow = true; g.add(b);
    };
    sw(false, 1.436); sw(true, 1.146);
    const a = PL(g, new THREE.MeshStandardMaterial({ map: texAffichette(), roughness: 0.6 }), 0.56, 0.3, 0, 0.99, 0.15);
    a.rotation.x = -0.05;
    C.ajouterCercle(17.3, -5.55, 0.32, { y1: 1.7 });
  }

  // =====================================================================
  //  L'ANGLE NORD-EST (VO 6,4-7,4 s ; photo 24 ; r04 au bord gauche)
  // =====================================================================
  // LE PHOTOCOPIEUR multifonction contre le pan cannelé, côté hall (photo 24 : on le voit encore derrière le cannelé)
  copieur(ch, 16.68, 7.12, 'S');
  C.ajouterBoite(16.33, -7.45, 17.02, -6.77, { y1: 1.15 });
  // LE CAISSON gris clair et sa pile de cinq corbeilles à courrier (celle du haut orange)
  B(17.04, 6.9, 17.46, 7.46, 0, 1.0, H.caisson);
  for (let k = 0; k < 5; k++) {
    const h = 1.0 + k * 0.065, m = k === 4 ? H.corbeilleO : H.corbeille;
    B(17.06, 6.95, 17.42, 7.4, h, h + 0.008, m, { ombre: false });
    B(17.06, 6.95, 17.42, 6.965, h, h + 0.05, m, { ombre: false });
    for (const x of [17.06, 17.41]) B(x, 6.95, x + 0.01, 7.4, h, h + 0.05, m, { ombre: false });
    B(17.09, 6.98, 17.39, 7.37, h + 0.008, h + 0.02, M.store, { ombre: false });
  }
  C.ajouterBoite(17.04, -7.46, 17.46, -6.9, { y1: 1.35 });
  // LE MEUBLE BAS NOIR contre le mur nord, jusqu'au local (r04, au bord gauche : 1,0 m de haut, une petite étiquette
  // blanche) — à la place de la table blanche et de la chaise de hêtre de 2021, sous les étiquettes ocre
  B(17.55, 6.98, LOC.x0, 7.48, 0, 1.0, H.meubleNoir);
  B(18.42, 6.976, 18.54, 6.98, 0.82, 0.86, M.store, { ombre: false });
  C.ajouterBoite(17.55, -7.48, LOC.x0, -6.98, { y1: 1.0 });
  // LES ÉTIQUETTES OCRE sur le mur blanc (VO q_0027-0028, mesurées contre le semi-fixe de la porte nord : la grande de x
  // 17,54 à 18,38, de 1,98 à 2,36 m ; la petite de 17,76 à 18,16, de 1,50 à 1,88 m)
  ch.panneau(new THREE.MeshStandardMaterial({ map: texEtiquette('INFORMATIQUE', 0.84, 0.38), roughness: 0.6 }), 0.84, 0.38, 17.96, Y_MUR - 0.004, 2.17, 'S');
  // (le mot de la petite ne se lit pas : sept lettres environ — IMAGINÉ)
  ch.panneau(new THREE.MeshStandardMaterial({ map: texEtiquette('SERVICE', 0.4, 0.38), roughness: 0.6 }), 0.4, 0.38, 17.96, Y_MUR - 0.004, 1.69, 'S');

  // =====================================================================
  //  LE PLAFOND : LA RETOMBÉE EST-OUEST ET LES HUIT LIGNES LUMINEUSES (r04 ; VO 92,6-93,6 s ; photo 24)
  // =====================================================================
  // LA RETOMBÉE (r04 : de l'angle haut gauche de la photo jusqu'au local, l'écran pendu dessous ; sa face sud ne fait
  // qu'une dizaine de centimètres — l'arête, rétroprojetée à 2,50 m, tombe en y 5,28) : de la face est de la pile au
  // local, 10 cm sous les plateaux
  {
    const r = B(14.675, 5.28, LOC.x0, 5.53, 2.5, H_PLAF, M.platre, { ombre: false, collision: true });
    r.userData.horsAOSol = true;
  }
  // dans l'axe de la porte 6, au pas de 0,30 m, de la porte jusqu'à y ≈ 4,1 (les spots ronds autour : js/carte_ecole.js) ;
  // un ruban de 2 cm dans un profil d'aluminium de 4 cm, à fleur des plateaux
  for (let k = 0; k < 8; k++) {
    const x = 14.35 + k * 0.3;
    const p = B(x - 0.02, 0.5, x + 0.02, 4.1, H_PLAF - 0.006, H_PLAF - 0.001, H.profil, { ombre: false });
    const l = B(x - 0.01, 0.52, x + 0.01, 4.08, H_PLAF - 0.008, H_PLAF - 0.006, H.ligne, { ombre: false });
    p.userData.horsAOSol = l.userData.horsAOSol = true; l.receiveShadow = false;
  }
}
