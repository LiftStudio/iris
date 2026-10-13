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
// la tablette du comptoir est sur l'horizon) : l'appareil en (13,6 ; 2,35), à 1,155 m, cap 75°, contre le mur du
// bureau B. De là, le mur ardoise tombe sur le mitoyen (x 19,9) et les spots sur ceux que la VO avait relevés, (17,25 ;
// 3,2), (18,75 ; 3,2), (18,75 ; 1,5), à 0,1 m près : la pose est sûre. Elle redonne au comptoir sa longueur de la première
// lecture de la VO (y 1,0-4,2, puis un pupitre jusqu'à 5,0) que la relecture du 10/10 avait raccourcie à 3,55.
// (RELECTURE DU 12/10, r04 rejouée et superposée arête sur arête : à 1,12 m, tout ce qui touche le sol près de l'appareil
// — le socle du comptoir, le pied du décroché — tombait 4 à 10 px trop haut, et tout ce qui touche le plafond — le haut du
// mur ardoise, celui du local — 6 à 12 px trop haut : l'appareil est trop BAS. À 1,155 m, les deux se recalent à 2-4 px
// près, et la tablette, toujours sur l'horizon, est à 1,15 m — la rainure, à la même proportion, à 0,745.)
//
// RETOUR r05 DU 13/10 (Haythem, sa photo renvoyée : « attention, j'espère que tu as bien corrigé l'accueil » ; puis
// « d'ailleurs, fais attention : à droite, c'est un MIROIR, regarde bien », et r05_photo_miroir.png). À droite du mur
// ardoise, ce n'est pas la cloison vitrée d'un bureau d'angle mais une GLACE collée sur le mitoyen, qui renvoie le hall,
// la porte 6 et les fenêtres de la façade (miroirAccueil, plus bas : où elle est, comment elle se dessine sans coûter).
// r04 rejouée à sa pose, pavé par pavé, Haythem là où se tenait l'appareil (les spots suivent Haythem) : le comptoir d'un
// gris neutre, sombre et chaud au nord, clair et froid au sud dans le jour de la porte 6 ; sa tablette épaisse, à 1,18 ;
// plus d'ombre dure ni d'ombre cuite à son pied ; le chêne miel ; le caisson haut du décroché et ses deux faces ; deux bacs,
// la chemise rouge, la bouilloire au fond ; la face sud du pilier au jour ; le panneau haut du local, la seconde porte au
// fond ; l'écran et son image lavande ; le portant plus haut et plus étroit, son affichette ; la retombée, le dôme, deux
// spots ; le plafond au jour près de la glace.
//
// LE PLAN (repère de js/carte_ecole.js : x le long de la façade, y vers le fond ; dans le jeu X = x, Z = -y) :
//   le comptoir haut        x 16,83-17,53 y 1,1-3,6    NORD-SUD, face à l'ouest : stratifié gris clair, rainure à 0,745,
//                                                     socle de chêne clair en retrait, tablette grise en saillie à 1,18
//   le décroché PMR         x 16,88-17,6  y 3,6-4,58   son caisson bas en retrait (x 17,08), sa tablette à 0,76 et son
//                                                     pied gris ; la bouilloire, les bacs à courrier noirs, les papiers
//   le caisson haut         x 17,0-17,85  y 4,39-4,58  posé sur le bout du décroché, sa tablette haute (1,15) qui déborde
//                                                     de 0,22 m vers le nord
//   le mitoyen est          x 19,8        y 0,40-4,43  peint GRIS ARDOISE, ses deux affiches (y 2,2-2,9 et 3,4-4,0) ;
//                                                     de l'angle de la façade à y 0,40, blanc, une affichette étroite
//   le MIROIR               x 19,8        y 0,40-1,82  collé sur le mitoyen, sans cadre, de 0,95 à 2,57 m : un vrai miroir
//                                                     (retour r05 du 13/10 — ce que la v1.9 prenait pour la cloison vitrée
//                                                     d'un « bureau d'angle » est le REFLET du hall) ; devant lui, le grand
//                                                     copieur blanc
//   le local technique      x 18,8-19,8   y 4,43-7,5   portes de stratifié clair, étiquette rouge et triangle jaune ;
//                                                     sa face sud gris clair, le bouton rouge et le boîtier blanc
//   le pilier de bois clair x 18,14-18,8  y 5,71-6,24  devant le local, sous l'écran suspendu ; le panneau des formations
//                                                     sur le local, à sa droite
//   le portant des goodies  (17,48 ; 5,685)            noir, sur roulettes : sweats « iris », affichette, brochures
//   l'open-space            x 17,53-19,8  y 0-4,43     le plan de travail derrière le comptoir, le bureau du mitoyen, le
//                                                     copieur devant le miroir, trois fauteuils ; la fenêtre c 18,98
//   l'angle nord-est        x 16,3-18,8   y 6,8-7,5    le photocopieur contre le cannelé, le caisson et ses corbeilles
//                                                     (photo 24 : toujours là en 2026), le meuble noir (r04), les
//                                                     étiquettes ocre « INFORMATIQUE »
//   le plafond              plateaux perforés de 0,6 x 1,2 (r04, photo 03) ; la retombée est-ouest y 5,28-5,53, de la pile
//                                                     au local ; les huit lignes lumineuses dans l'axe de la porte 6
//                                                     (VO, photo 24)
// (Le cannelé et le mur nord : js/ecole_est.js ; la pile, sa plaque et son annuaire : js/ecole_rdc_centre.js.)
//
//   poserHall(ch)       (appelé par construireAccueil, js/carte_ecole.js) -> { maj(dt, jeu) } : le miroir, à chaque image
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { maille, boiteM } from './ecole_portes.js';
import { canvasTex, detailPhoto, nePasFusionner } from './kit_decor.js';
import { texPeinture } from './ecole_matieres.js';
import { TELEPHONE } from './appareil.js';

// ---- les cotes (plan) ----
const H_PLAF = 2.6;                                 // le plafond du hall
// (13/10, r04 rejouée, profils verticaux en x 380 et 560 : la tablette est ÉPAISSE — son chant fait 12 px à 3,05 m, 5,7 cm,
// de 1,125 à 1,18 —, l'écran « DELL » dépasse de 1,19 à 1,25 ; le jeu la faisait de 3,5 cm, son dessus à 1,15)
const CPT = { x0: 16.83, x1: 17.53, y0: 1.1, y1: 3.6, h: 1.18, ep: 0.055, rainure: 0.745, socle: 0.115 }; // le comptoir haut (r04)
const PMR = { xF: 17.08, x0: 16.88, y0: 3.6, y1: 4.58, h: 0.76 };                 // le décroché PMR
const RET = { x0: 17.0, x1: 17.85, y0: 4.39, y1: 4.58, h: 1.15 };                 // le caisson haut du décroché
const X_PERS = 18.05;                               // le dos du plan de travail du personnel
const LOC = { x0: 18.8, y0: 4.43 };                 // le local technique (sa face ouest, sa face sud)
const PIL = { x0: 18.14, x1: 18.8, y0: 5.71, y1: 6.24 };                          // le pilier de bois clair
const Y_MUR = 7.5;                                  // la face hall du mur nord (y 7,5-7,65)
const X_MIT = 19.8;                                 // la face du mitoyen est
const Y_ARD = 1.82;                                 // le bout nord du miroir, où le mur ardoise se montre (r04 : x 616)

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
  // (relecture du 12/10 : la face sud du pilier, au jour, est d'un beige gris — 154, 139, 129 sur r04 ; le jeu la
  // jaunissait, 170, 146, 113 : le fond moins saturé)
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#bdae9f'; g.fillRect(0, 0, w, h);
    const r2 = graine(311);
    for (let k = 0; k < 160; k++) {
      const x = r2() * w, l = 0.6 + r2() * 1.6, a = 0.008 + r2() * 0.018;
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
// L'AFFICHE AU CADRE MAGENTA (r04 agrandie, la gauche des deux) : un filet magenta tout autour ; en haut, un aplat brun
// noir et quatre lignes d'un texte orange ; au milieu, la façade BLANCHE d'un immeuble — une rangée de baies magenta sous
// la corniche, quatre rangées de fenêtres sombres aux reflets roses, les vitrines du rez-de-chaussée — ; en bas, du gris
// clair et le pavé « iris » à droite
// (relecture du 12/10, r04 agrandie cinq fois : l'immeuble ne prend pas toute la largeur — le brun continue à sa gauche,
// sur un huitième —, et son socle blanc file en biais jusqu'au bord gauche ; onze fenêtres par rangée ; pas de marge)
function texAfficheMagenta() {
  return canvasTex(256, 356, (g, w, h) => {
    const X = (u) => u * w, Y = (v) => v * h;
    g.fillStyle = '#2d2622'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#e59a3a'; g.font = `600 10px ${POLICE}`; g.textBaseline = 'alphabetic'; g.textAlign = 'left';
    ['Créer', 'l\'informatique', 'pour les métiers', 'de demain'].forEach((t, i) => g.fillText(t, X(0.15), Y(0.085) + i * 11));
    // le bas, gris clair, et le socle blanc de l'immeuble qui file en biais vers la gauche
    g.fillStyle = '#e2e0dc'; g.fillRect(0, Y(0.8), w, h - Y(0.8));
    g.fillStyle = '#efeeea'; g.beginPath(); g.moveTo(X(0.13), Y(0.755)); g.lineTo(w, Y(0.755)); g.lineTo(w, Y(0.83)); g.lineTo(0, Y(0.83)); g.lineTo(0, Y(0.86)); g.closePath(); g.fill();
    // la façade
    g.fillStyle = '#f4f3f0'; g.fillRect(X(0.13), Y(0.33), w - X(0.13), Y(0.43));
    g.fillStyle = '#d4d2ce'; g.fillRect(X(0.13), Y(0.33), w - X(0.13), Y(0.03));
    const n = 11, pas = (0.98 - 0.16) / n;
    for (let i = 0; i < n; i++) {
      const x = X(0.16 + i * pas);
      g.fillStyle = '#c4307e'; g.fillRect(x, Y(0.38), X(pas * 0.62), Y(0.03));
      for (let j = 0; j < 4; j++) {
        g.fillStyle = (i * 3 + j) % 5 === 0 ? '#7a3a62' : '#2a2630'; g.fillRect(x, Y(0.445 + j * 0.07), X(pas * 0.62), Y(0.035));
        g.fillStyle = 'rgba(214,90,150,0.35)'; g.fillRect(x, Y(0.445 + j * 0.07), X(pas * 0.62), Y(0.01));
      }
    }
    for (const [a, b] of [[0.18, 0.33], [0.39, 0.42], [0.44, 0.47], [0.5, 0.53], [0.82, 0.97]]) { g.fillStyle = '#26232a'; g.fillRect(X(a), Y(0.765), X(b - a), Y(0.045)); }
    g.fillStyle = '#6b6870'; g.font = `600 6px ${POLICE}`; g.fillText('2026  2027', X(0.6), Y(0.795));
    paveIris(g, X(0.76), Y(0.885), X(0.18));
    g.strokeStyle = '#c4307e'; g.lineWidth = 5; g.strokeRect(2.5, 2.5, w - 5, h - 5);
  }, null, false, 4);
}
// L'AFFICHE AUX LIGNES DE COULEUR (r04 agrandie, la droite des deux ; c'est la « photo encadrée de la tour » de la VO) :
// fond gris moyen ; quatre câbles de couleur — bleu ciel, jaune, rouge, vert pâle — partent du bord gauche, descendent
// en coudes arrondis et entrent, d'une flèche, dans les fenêtres d'une façade BLANCHE vue d'EN BAS : son arête gauche
// penche (des 0,55 de la largeur en haut aux 0,40 en bas), ses étages grandissent vers le bas ; en bas à gauche, trois
// lignes de texte blanc et le pavé « iris »
// (relecture du 12/10, r04 agrandie sept fois : le jeu montrait une façade de face, une grille régulière, des câbles à
// angles vifs qui s'arrêtaient au bord de l'immeuble, un pavé deux fois trop petit)
function texAfficheLignes() {
  return canvasTex(256, 356, (g, w, h) => {
    const X = (u) => u * w, Y = (v) => v * h;
    g.fillStyle = '#8c8d8f'; g.fillRect(0, 0, w, h);
    // la façade vue d'en bas : l'arête gauche penche, les étages grandissent vers le bas
    const gauche = (v) => 0.55 - 0.15 * v;
    g.fillStyle = '#efefed'; g.beginPath(); g.moveTo(X(gauche(0)), 0); g.lineTo(w, 0); g.lineTo(w, h); g.lineTo(X(gauche(1)), h); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); g.moveTo(X(gauche(0) + 0.03), 0); g.lineTo(X(gauche(0) + 0.06), 0); g.lineTo(X(gauche(1) + 0.03), h); g.lineTo(X(gauche(1)), h); g.closePath(); g.fill();
    let v = 0.02;
    for (let k = 0; k < 9; k++) {
      const hv = 0.035 + k * 0.011, x0 = gauche(v + hv / 2) + 0.06, cols = 4, lw = (1 - x0) / cols;
      for (let i = 0; i < cols; i++) {
        const u0 = x0 + i * lw + lw * 0.12, u1 = u0 + lw * 0.62, pente = 0.02 * (1 - v);
        g.fillStyle = k > 6 ? '#b4b7bb' : '#a0a4a9';
        g.beginPath(); g.moveTo(X(u0), Y(v + pente)); g.lineTo(X(u1), Y(v)); g.lineTo(X(u1), Y(v + hv)); g.lineTo(X(u0), Y(v + hv + pente)); g.closePath(); g.fill();
      }
      v += hv + 0.035 + k * 0.006;
    }
    // les câbles : coudes arrondis, une flèche au bout, dans une fenêtre
    const cable = (c, pts, bout) => {
      g.strokeStyle = c; g.fillStyle = c; g.lineWidth = 6; g.lineJoin = 'round'; g.lineCap = 'round'; g.beginPath();
      g.moveTo(X(pts[0][0]), Y(pts[0][1]));
      for (let i = 1; i < pts.length - 1; i++) g.arcTo(X(pts[i][0]), Y(pts[i][1]), X(pts[i + 1][0]), Y(pts[i + 1][1]), 9);
      g.lineTo(X(pts[pts.length - 1][0]), Y(pts[pts.length - 1][1])); g.stroke();
      const [bx, by] = pts[pts.length - 1];
      g.beginPath(); g.moveTo(X(bx) + 7, Y(by)); g.lineTo(X(bx) - 3, Y(by) - 6); g.lineTo(X(bx) - 3, Y(by) + 6); g.closePath(); g.fill();
    };
    cable('#f0c54a', [[0, 0.114], [0.38, 0.114], [0.4, 0.27], [0.5, 0.275]]);
    cable('#a9d6ec', [[0.02, 0.064], [0.175, 0.064], [0.175, 0.565], [0.5, 0.565]]);
    cable('#bcd8b4', [[0, 0.236], [0.265, 0.236], [0.275, 0.428], [0.43, 0.428]]);
    cable('#e2553e', [[0.097, 0.1], [0.097, 0.486], [0.46, 0.486]]);
    g.fillStyle = '#ffffff'; g.font = `600 8px ${POLICE}`; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
    ['Connectez-vous', 'aux métiers', 'de demain'].forEach((t, i) => g.fillText(t, X(0.07), Y(0.765) + i * 10));
    paveIris(g, X(0.08), Y(0.875), X(0.19));
    g.strokeStyle = '#c9cacc'; g.lineWidth = 2; g.strokeRect(1, 1, w - 2, h - 2);
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
// (13/10, r04 agrandie cinq fois : l'image ne remplit pas l'écran — un rectangle clair, d'un blanc LAVANDE (150, 166, 220
// au milieu), décalé vers le bas et la droite, au milieu d'une dalle noire et brillante où passent les reflets des
// plafonniers ; le pavé « iris » est bleu, une petite image violette en bas à droite ; le jeu remplissait l'écran de blanc)
function texEcranTV() {
  return canvasTex(256, 144, (g, w, h) => {
    g.fillStyle = '#16181d'; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(120,124,132,0.22)'; for (const y of [10, 24, 36]) g.fillRect(0, y, w, 4);
    const x0 = w * 0.1, y0 = h * 0.22, x1 = w * 0.78, y1 = h * 0.85;
    const f = g.createLinearGradient(x0, y0, x1, y1); f.addColorStop(0, '#c4cdf6'); f.addColorStop(1, '#a9b5ee');
    g.fillStyle = f; g.fillRect(x0, y0, x1 - x0, y1 - y0);
    g.fillStyle = '#20243c'; g.font = `500 13px ${POLICE}`; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    ['Commander votre', 'sweat à l\'accueil', 'pour 25€'].forEach((t, i) => g.fillText(t, (x0 + x1) / 2 - 12, y0 + 34 + i * 16));
    g.fillStyle = '#3a5db8'; g.fillRect(x1 - 36, y0 + 8, 30, 15);
    g.fillStyle = '#ffffff'; g.font = `700 11px ${GOTHIC}`; g.textAlign = 'left'; g.fillText('iris', x1 - 31, y0 + 20);
    const d = g.createLinearGradient(x1 - 26, y1 - 30, x1 - 4, y1 - 4); d.addColorStop(0, '#7b5fc8'); d.addColorStop(1, '#4a7ad8');
    g.fillStyle = d; g.fillRect(x1 - 26, y1 - 30, 22, 26);
  }, null, false, 4);
}
// LE SWEAT PLIÉ « iris » du haut du portant (r04 : blanc, le pavé noir et une ligne de texte) et celui à l'impression
// colorée (bleu, violet, vert) en dessous
// (relecture du 12/10 : des plis mous — l'ombre des replis en bas, le bombé éclairé en haut —, plus de rayures, qui en
// faisaient des valises ; le sweat imprimé est gris perle, son motif en vagues bleues, violettes et vertes en bas)
// (13/10, r04 agrandie cinq fois : le premier est un sweat BLANC, son grand pavé noir « iris » au i jaune en haut et
// deux lignes de texte sombre ; le second, un sweat à capuche gris clair plié, la capuche en haut, une impression en
// facettes bleues, violettes et cyan, et des lettres roses dessous)
// (le devant du pli fait 0,34 x 0,17 m : un dessin de 2 sur 1, tracé dans l'ancien repère de 128 x 96 puis écrasé, sauf
// le pavé, à ses vraies proportions)
function texSweat(imprime) {
  return canvasTex(128, 64, (g, W, Hc) => {
    g.save(); g.scale(1, Hc / 96);
    const w = 128, h = 96;
    g.fillStyle = imprime ? '#d6d7dc' : '#f1f0ed'; g.fillRect(0, 0, w, h);
    const d = g.createLinearGradient(0, 0, 0, h); d.addColorStop(0, 'rgba(255,255,255,0.25)'); d.addColorStop(0.55, 'rgba(0,0,0,0)'); d.addColorStop(1, 'rgba(60,55,50,0.22)');
    g.fillStyle = d; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(70,64,58,0.18)'; g.lineWidth = 2;
    for (const [x0, y0, x1, y1] of [[6, 70, 60, 78], [70, 80, 122, 72], [20, 88, 108, 90], [4, 30, 10, 84], [124, 26, 118, 86]]) { g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + 4, x1, y1); g.stroke(); }
    if (imprime) {
      // la capuche, plus sombre, en haut ; l'impression en facettes ; les lettres roses
      g.fillStyle = 'rgba(120,120,128,0.35)'; g.beginPath(); g.ellipse(64, 14, 46, 16, 0, 0, Math.PI * 2); g.fill();
      const fac = [['#5a4fc4', [[16, 50], [44, 38], [52, 62]]], ['#38a6dc', [[44, 38], [78, 44], [52, 62]]], ['#9a5fcc', [[52, 62], [78, 44], [96, 66]]],
        ['#46c6c8', [[78, 44], [112, 40], [96, 66]]], ['#7068d8', [[24, 66], [52, 62], [40, 76]]], ['#a7d6ec', [[96, 66], [112, 40], [118, 62]]]];
      for (const [c, p] of fac) { g.fillStyle = c; g.beginPath(); g.moveTo(...p[0]); g.lineTo(...p[1]); g.lineTo(...p[2]); g.closePath(); g.fill(); }
      g.fillStyle = '#d8589c'; for (let k = 0; k < 5; k++) g.fillRect(44 + k * 10, 80, 6, 9);
      g.restore();
    } else {
      g.restore();
      paveIris(g, 20, 5, 88);
      g.fillStyle = '#3a3a3a'; g.fillRect(26, 46, 70, 3); g.fillRect(26, 52, 50, 3);
    }
  }, null, false, 2);
}
// L'AFFICHETTE DU PORTANT (r04) : carton blanc, deux photos de sweats gris à gauche et à droite, le texte au milieu
// (13/10, r04 agrandie cinq fois : deux photos en NOIR ET BLANC sur fond gris foncé — à gauche un sweat à capuche gris
// clair de face, le pavé noir sur la poitrine ; à droite le même, de dos, la capuche — et entre elles « Affichez fièrement
// les couleurs de votre école ! » ; le jeu dessinait deux silhouettes grises sur du blanc)
function texAffichette() {
  return canvasTex(192, 112, (g, w, h) => {
    g.fillStyle = '#f6f5f2'; g.fillRect(0, 0, w, h);
    const sweat = (x, dos) => {
      g.fillStyle = '#4b4c50'; g.fillRect(x, 8, 58, 94);
      g.fillStyle = '#c9cacc';
      g.beginPath(); g.moveTo(x + 6, 100); g.lineTo(x + 8, 46); g.quadraticCurveTo(x + 12, 34, x + 22, 32); g.lineTo(x + 36, 32); g.quadraticCurveTo(x + 46, 34, x + 50, 46); g.lineTo(x + 52, 100); g.closePath(); g.fill();
      g.fillStyle = dos ? '#b8b9bc' : '#d6d7d9'; g.beginPath(); g.ellipse(x + 29, 28, 13, 15, 0, 0, Math.PI * 2); g.fill();
      if (!dos) { g.fillStyle = '#5a5b5f'; g.beginPath(); g.ellipse(x + 29, 30, 7, 9, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = '#1c1c1f'; g.fillRect(x + 20, 54, 18, 8); }
      g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(x + 8, 80, 44, 3);
    };
    sweat(6, false); sweat(w - 64, true);
    g.fillStyle = '#222'; g.font = `600 9px ${POLICE}`; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    ['Affichez', 'fièrement', 'les', 'couleurs', 'de votre', 'école !'].forEach((t, i) => g.fillText(t, w / 2, 30 + i * 11));
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
    // noire : deux tons plus clair)
    ardoise: std({ map: texPeinture(0x807f84, 4), roughness: 0.82 }, 'peinture gris ardoise (mitoyen de l\'accueil)'),
    // le comptoir : un stratifié GRIS CLAIR (r04 : nettement plus sombre que le plafond et les murs blancs), la tablette
    // grise, la rainure
    // (relecture du 12/10, r04 rejouée, zone par zone : la face du comptoir 151 sur la photo, d'un gris froid à peine rosé,
    // contre 163 et crème au jeu ; la tablette 119 contre 134 — un gris moyen, nettement plus sombre que la face)
    comptoir: std({ color: 0xbfbcbd, roughness: 0.45 }, 'stratifié gris clair (comptoir)'),
    // (13/10, r04 rejouée, trois pavés le long de la face : la photo est plus sombre et chaude au nord, sous les spots —
    // 145, 128, 117 —, claire et FROIDE au sud, dans le jour de la porte 6 et des fenêtres — 167, 163, 167 — ; le jeu
    // faisait l'inverse, 174, 160, 147 au nord et 147, 134, 124 au sud. La face du comptoir haut, rien qu'elle : un gris
    // neutre plus bas, et le jour peint en lueur froide qui monte vers le bout sud — comptoirFace, plus bas)
    // (la tablette : son chant 120, 109, 102 sur la photo, 73, 67, 66 au jeu — mince, 3,5 cm, il ne prenait pas la lumière ;
    // épaissi à 5,5 cm, CPT.ep, il la prend : le gris d'avant, à peine plus clair)
    tablette: std({ color: 0x9c9893, roughness: 0.35 }, 'tablette grise (comptoir)'),
    // le caisson bas du décroché et son pied, sous la tablette PMR : dans son ombre (r04 : 100 et 113, contre 151 pour la
    // face du comptoir ; le jeu les éclairait à 167 et 161, plus clairs que le comptoir)
    // (relecture du 13/10 : le caisson bas, 121, 103, 89 sur la photo, 140, 123, 107 au jeu ; la face ouest du caisson haut,
    // 144, 119, 98 pour 153, 135, 117 — un ton plus bas, plus chaud)
    comptoirOmbre: std({ color: 0x8b827c, roughness: 0.5 }, 'stratifié gris clair à l\'ombre (décroché PMR)'),
    // la tablette PMR : un gris moyen, son dessus 140 et son chant 99 sur r04 — sous le spot du bout des lignes
    // lumineuses, la tablette du comptoir montait à 173-225 et 130
    tablettePMR: std({ color: 0x6f6b68, roughness: 0.4 }, 'tablette grise (décroché PMR)'),
    rainure: std({ color: 0x6f6b67, roughness: 0.5 }, 'rainure du comptoir'),
    // le socle de CHÊNE CLAIR des meubles de l'accueil (r04 : #8B6E59 à l'appareil, plus clair que les plinthes vernies)
    // (13/10 : un chêne MIEL, moins orangé — la plinthe du comptoir, au jour, 139-155, 99-109, 64-73 sur la photo, 121-134,
    // 78-89, 42-47 au jeu)
    chene: std({ color: 0xcfaa88, roughness: 0.5 }, 'socle de chêne clair (accueil)'),
    boisClair: std({ map: texBoisClair(), roughness: 0.55 }, 'stratifié bois clair (pilier)'),
    // les portes du local, plus loin dans l'ombre de la retombée et d'un chêne plus grisé que le pilier (relecture du
    // 12/10, r04 : 124, 97, 76 à mi-hauteur, 98, 84, 75 sous le plafond, quand le jeu les rendait à 175 et 147)
    boisLocal: std({ map: texBoisClair(), color: 0xd0cbca, roughness: 0.6 }, 'stratifié chêne grisé (portes du local)'),
    // (13/10 : 151, 139, 132 sur la photo, 154, 139, 124 au jeu — un rien plus froid)
    retour: std({ map: texPeinture(0xaba7a7), roughness: 0.85 }, 'peinture gris clair (face sud du local)'),
    joint: std({ color: 0x4a3f36, roughness: 0.6 }, 'joint des portes du local'),
    bureau: std({ color: 0x3d4150, roughness: 0.48 }, 'bureau bleu-gris foncé'),
    plan: std({ color: 0xdedcd8, roughness: 0.4 }, 'plan de travail blanc gris'),
    pied: std({ color: 0x2c2f37, roughness: 0.4, metalness: 0.4 }, 'piètement des bureaux'),
    copieur: std({ color: 0xdcdcd8, roughness: 0.45 }, 'photocopieur (corps)'),
    copieur2: std({ color: 0xaeaeab, roughness: 0.5 }, 'photocopieur (scanner, tiroirs)'),
    // (13/10 : devant le miroir, dans le jour de la fenêtre c 18,98 — 182, 188, 196 sur la photo, 162, 159, 155 au jeu)
    copieurJour: std({ color: 0xeceef0, roughness: 0.5, emissive: 0xe8eef6, emissiveIntensity: 0.5 }, 'photocopieur au jour (corps)'),
    copieurJour2: std({ color: 0xc8cbcf, roughness: 0.5, emissive: 0xe8eef6, emissiveIntensity: 0.32 }, 'photocopieur au jour (scanner)'),
    caisson: std({ color: 0xc8c8c5, roughness: 0.55 }, 'caisson gris clair'),
    corbeille: std({ color: 0x55585e, roughness: 0.5 }, 'corbeille à courrier grise'),
    corbeilleO: std({ color: 0xe8862a, roughness: 0.5 }, 'corbeille à courrier orange'),
    meubleNoir: std({ color: 0x1d1a18, roughness: 0.45 }, 'meuble bas noir'),
    argent: std({ color: 0xb8bbbe, roughness: 0.3, metalness: 0.8 }, 'cadre argent'),
    rouge: std({ color: 0xc8202a, roughness: 0.45 }, 'déclencheur rouge'),
    ecran: std({ color: 0x1e2836, roughness: 0.2, emissive: 0x4a6280, emissiveIntensity: 0.22 }, 'écran allumé'),
  };
  // (les murs peints : le léger relief d'enduit des autres peintures)
  detailPhoto(H.ardoise, 'beton', 1, 1, { relief: 0.035, grain: 0, rugo: false });
  // LA FACE DU COMPTOIR HAUT (13/10) : un gris neutre plus bas que celui du caisson (le nord sous les spots tombe à la
  // photo), et une lueur froide peinte, nulle au nord, pleine au bout sud — le jour de la porte 6 et des fenêtres, que les
  // spots ne donnent pas (le nombre de lumières est figé dans les programmes, comme pour le jour du mur ardoise). Les
  // coordonnées de texture de la boîte sont en mètres (js/ecole_portes.js boiteM : sur ses faces est et ouest, u = z local) :
  // la lueur court sur les 2,5 m du comptoir.
  // (relecture du 13/10, r04 rejouée, Haythem là où se tenait l'appareil : au nord 174, 161, 154 au jeu pour 145, 128,
  // 117 ; au milieu 162, 153, 148 pour 152, 141, 138 ; au sud 157, 151, 151 pour 167, 163, 167 — l'albédo descend et se
  // réchauffe vers le nord, la lueur froide monte vers le sud)
  {
    const degrade = (stops) => {
      const t = canvasTex(256, 4, (g, w, h) => {
        const d = g.createLinearGradient(0, 0, w, 0);
        for (const [u, c] of stops) d.addColorStop(u, c);
        g.fillStyle = d; g.fillRect(0, 0, w, h);
      }, null, false, 1);
      // (des valeurs linéaires : des facteurs, pas des couleurs à décoder)
      t.colorSpace = THREE.NoColorSpace; t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
      t.repeat.set(1 / (CPT.y1 - CPT.y0), 1); t.offset.set(0.5, 0); t.needsUpdate = true;
      return t;
    };
    const albedo = degrade([[0, '#a3958a'], [0.1, '#a99b91'], [0.4, '#ded5d9'], [0.62, '#ffffff'], [1, '#ffffff']]);
    const jour = degrade([[0, '#000000'], [0.4, '#0d0d0d'], [0.7, '#8c8c8c'], [1, '#ffffff']]);
    H.comptoirFace = std({ color: 0xbcbbc2, map: albedo, roughness: 0.45, emissive: 0xd4dcec, emissiveMap: jour, emissiveIntensity: 0.3 }, 'stratifié gris clair (face du comptoir haut)');
  }
  // LE CAISSON HAUT DU DÉCROCHÉ (13/10, r04 : sa face ouest, étroite, à l'ombre — 144, 119, 98 —, sa face sud claire —
  // 172, 159, 154 — ; le jeu faisait l'inverse, 171, 157, 144 et 151, 142, 133)
  H.caissonSud = std({ color: 0xcfc9c7, roughness: 0.45 }, 'stratifié gris clair au jour (caisson haut)');
  // (le pied carré du décroché, au jour du hall : 139, 118, 102 sur la photo, 128, 114, 101 au jeu)
  H.comptoirPied = std({ color: 0xa69c95, roughness: 0.5 }, 'stratifié gris clair (pied du décroché)');
  // LA FACE SUD DU PILIER DE BOIS (13/10 : au jour, d'un beige gris — 162, 149, 142 sur la photo —, le jeu la jaunissait,
  // 159, 139, 115 : le même stratifié, refroidi)
  // (relecture du 13/10 : 129, 114, 102 au jeu, toujours à l'ombre des spots — le jour de la porte 6 l'éclaire, une lueur)
  { const t = texBoisClair(); H.boisJour = std({ map: t, color: 0xd2d8e6, emissive: 0xc6d0e4, emissiveMap: t, emissiveIntensity: 0.28, roughness: 0.55 }, 'stratifié bois clair au jour (face sud du pilier)'); }
  // LE PANNEAU HAUT DU LOCAL, au-dessus des portes (13/10, r04 : 103, 87, 77 — plus sombre et plus gris que les portes)
  // (relecture du 13/10 : 95, 71, 54 au jeu)
  H.boisHaut = std({ map: texBoisClair(), color: 0xbab8c2, roughness: 0.6 }, 'stratifié chêne grisé (panneau haut du local)');
  // LA RETOMBÉE DE L'ACCUEIL (13/10, r04 : dans la lumière chaude des spots, 169, 148, 131, quand le plâtre du jeu la
  // rendait à 140, 134, 126 : le sien, rien qu'à elle)
  H.retombee = std({ color: 0xf2ebe2, roughness: 0.9, emissive: 0xffe6cc, emissiveIntensity: 0.1 }, 'plâtre de la retombée de l\'accueil');
  // LES LIGNES LUMINEUSES du plafond : des rubans de LED qui éblouissent (MeshBasic au-dessus de 1 : le bloom les fait
  // briller, comme les spots — js/ecole_matieres.js M.spot)
  H.ligne = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff3e2).multiplyScalar(2.6) }); H.ligne.name = 'ligne lumineuse du plafond';
  H.profil = std({ color: 0xd9d9d6, roughness: 0.4, metalness: 0.5 }, 'profil des lignes lumineuses');
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
// UN ÉCRAN DE BUREAU (pied, dalle noire ; `allume` : l'écran vu de face ; `haut` : le centre de la dalle ; `l` : sa largeur)
function ecran(ch, x, y, h, face, allume = false, haut = 0.33, l = 0.56) {
  const { M } = ch, g = groupe(ch, x, y, face); g.position.y = h;
  BL(g, M.noir, 0.2, 0.012, 0.16, 0, 0.006, 0, { ombre: false });
  BL(g, M.noir, 0.05, Math.max(0.02, haut - 0.17), 0.03, 0, Math.max(0.02, haut - 0.17) / 2 + 0.006, -0.03, { ombre: false });
  BL(g, M.noir, l, 0.34, 0.03, 0, haut, 0.0);
  if (allume) { const e = new THREE.Mesh(new THREE.PlaneGeometry(l - 0.03, 0.3), H.ecran); e.position.set(0, haut, 0.016); g.add(e); }
  return g;
}
// LE PHOTOCOPIEUR MULTIFONCTION (VO 6,4-7,4 s ; r04, celui de l'open-space) : socle à tiroirs, corps, sortie, scanner et
// chargeur ; `haut` : le dessus du chargeur (celui de l'open-space est plus grand : il dépasse du comptoir, r04)
// (`jour` : celui du bureau d'angle, dans le jour de la fenêtre — r04 : blanc, 220 et plus ; le corps plein jusque sous
// le chargeur, le jeu n'en montrait que des plaques empilées)
function copieur(ch, x, y, face, haut = 1.15, jour = false) {
  const g = groupe(ch, x, y, face), k = haut / 1.15, { M } = ch;
  const c1 = jour ? H.copieurJour : H.copieur, c2 = jour ? H.copieurJour2 : H.copieur2;
  BL(g, c1, 0.64, 0.56 * k, 0.66, 0, 0.3 * k, 0);
  for (const h of [0.14, 0.27, 0.4, 0.53]) BL(g, c2, 0.6, 0.01, 0.005, 0, h * k, 0.332, { ombre: false });
  BL(g, M.noir, 0.64, 0.06, 0.66, 0, 0.03, 0, { ombre: false });
  BL(g, c1, 0.64, 0.34 * k, 0.62, 0, 0.75 * k, -0.02);
  if (jour) {
    // (le corps plein de 0,92 k jusque sous le chargeur, et la sortie du chargeur qui monte au bout, r04 de x 700 à 725)
    BL(g, c1, 0.64, haut - 0.19 - 0.92 * k, 0.6, 0, (haut - 0.19 + 0.92 * k) / 2, -0.03);
    BL(g, c2, 0.3, 0.04, 0.2, -0.12, haut + 0.01, -0.12, { ombre: false });
  } else BL(g, c2, 0.5, 0.04, 0.5, 0.02, 0.94 * k, 0.0, { ombre: false });
  BL(g, c1, 0.66, 0.1, 0.62, 0, haut - 0.14, -0.02);
  BL(g, c2, 0.6, 0.06, 0.5, 0, haut - 0.06, -0.04);
  BL(g, jour ? c2 : M.noir, 0.16, 0.05, 0.08, 0.2, haut - 0.13, 0.3, { ombre: false });  // (le pupitre de commande)
  BL(g, c2, 0.06, 0.3, 0.4, -0.35, 0.72 * k, 0.0);                                   // (le bac manuel)
  return g;
}

// =====================================================================
//  LE MIROIR DE L'ACCUEIL (retour r05 de Haythem, 13/10 : « d'ailleurs, fais attention : à droite, c'est un MIROIR,
//  regarde bien »)
// =====================================================================
// OÙ IL EST. Un miroir se vérifie par ce qu'il reflète. Collé sur le mitoyen est (x 19,8), il montre la façade
// SYMÉTRIQUE au-delà de l'angle : la rangée des fenêtres de l'accueil semble continuer derrière le comptoir.
//   - photo 03 (la pose de la v1.9 : (11,0 ; 6,1) à 1,49, cap 130, f 600 pour 739) : derrière le comptoir, QUATRE
//     fenêtres à barreaux avant la porte 6, quand la façade n'en a que deux à l'est de la porte. Les deux vraies, c 17,33
//     et c 18,98, tombent en x 384-441 et 321-365 (vues : 393-410 derrière le passant, 323-363) ; leurs reflets — les
//     fenêtres c 22,27 et c 20,62 de la façade symétrique — en 233-261 et 273-307 (vus : 227-250 et 272-295). La
//     troisième s'arrête 12 px trop tôt et le trumeau blanc qui la sépare de la vraie est deux fois trop large : la
//     glace s'arrête au sud en y 0,40 du mitoyen (le rayon de x 295).
//   - VO q_0381 (2021 ; pose résolue sur la façade et le bout du mur ardoise : (13,3 ; 6,8), cap 137,6, 7 px d'écart) :
//     le trumeau blanc entre le reflet et la vraie fenêtre c 18,98 va de x 580 à 630 (sur 1 280) ; une glace jusqu'à
//     l'angle le mettrait de 595 à 632, une glace arrêtée en y 0,40 de 580 à 632.
//   - r04 : le bord nord de la glace est le bout du mur ardoise (y 1,82 : x 616 de la photo, à 1 px) ; son haut est au
//     ras du plafond (en x 616, 97 pour la glace, 99 pour le haut du mur) ; son bas est caché par le comptoir (sous
//     1,24 m), et, de la photo 03, les appuis des fenêtres reflétées se voient : il est sous 1,12 m.
// D'où la glace de y 0,40 à 1,82 (1,42 m), de 0,95 à 2,57 m, à 6 mm du mur, sans cadre. Ce que la v1.9 lisait comme la
// cloison vitrée à 45° d'un « bureau d'angle » (la retombée qui monte vers la droite, les vitres, la baie à menuiserie
// gris bleu, le jour) est le REFLET : le plafond contre la façade, les fenêtres et le jour de la façade, vus dans la glace.
// Aucune autre image ne montre ce bureau : sa cloison, son verre, son bureau, son écran et son fauteuil sont retirés ; le
// coin sud-est est l'open-space, ouvert jusqu'à la fenêtre c 18,98.
//
// COMMENT. Un Reflector de three (r170, vendor/) : la scène est redessinée depuis la caméra symétrique par rapport à la
// glace, dans une texture que la glace reprend — Haythem s'y voit. Le hall est la pièce la plus chargée, d'où :
//   - il ne se dessine que quand on peut le voir : la caméra du jeu au rez-de-chaussée, devant la glace, la glace dans son
//     champ, et un de ses cinq points sans mur entre elle et lui (le monde solide ; les vitres et les portes automatiques
//     ne cachent rien : de la rue, on le voit par la porte 6). Sinon (et en qualité basse), une glace peinte ;
//   - son champ est RECADRÉ sur la glace : la projection de la caméra symétrique ne couvre que le rectangle que la glace
//     occupe à l'écran ; le tri hors champ de three ne garde que ce qu'on peut voir dans la glace ;
//   - sa texture fait la moitié de l'écran en largeur et en hauteur sur PC, 0,35 au téléphone ; elle ne se dessine qu'une
//     fois par image (et jamais pour une autre caméra que celle du jeu, ni pour la passe des normales).
// Le reste comme le miroir des toilettes (js/ecole_pieces.js) : à la racine de la scène, `dynamique` (caché pendant les
// prises de la carte d'environnement), sans recalcul des ombres ni des matrices pendant son dessin. Le tri de
// js/ecole_visibilite.js est celui de la vraie caméra (un rendu imbriqué le garde) : du hall comme de la rue, le
// rez-de-chaussée et la rue y sont, tout ce que la glace peut renvoyer. Le HUD est en HTML : il ne s'y reflète pas.
// La glace : une glace argentée rend ≈ 90 % de la lumière, un rien verte ; un voile léger (le verre, la poussière).
// LE SHADER DE LA GLACE (13/10). Deux images, chacune avec sa caméra symétrique, sa projection recadrée sur la glace et sa
// profondeur : le DÉCOR sans Haythem, refait de loin en loin, et HAYTHEM seul sur fond transparent, à chaque image où il
// se voit. Le décor n'est pas relu tel quel : son image a été prise d'une place un peu différente de celle de la caméra.
// Pour chaque point M de la glace, on suit le rayon réfléchi d'AUJOURD'HUI (déplié derrière la glace, depuis la caméra
// symétrique) et on cherche, en trois pas, le point de cette image dont la profondeur tombe sur ce rayon : la parallaxe
// est rattrapée, il ne reste que les bords des objets, un peu étirés quand la caméra s'est beaucoup déplacée. Haythem, lui,
// est relu tout droit, et passe devant le décor là où il est plus près sur le même rayon.
const MiroirShader = {
  name: 'GlaceAccueil',
  uniforms: {
    color: { value: null }, tDiffuse: { value: null }, textureMatrix: { value: null }, voile: { value: new THREE.Color(0, 0, 0) },
    tProf: { value: null }, uVPd: { value: new THREE.Matrix4() }, uVPdInv: { value: new THREE.Matrix4() },
    tLui: { value: null }, tProfLui: { value: null }, uVPl: { value: new THREE.Matrix4() }, uVPlInv: { value: new THREE.Matrix4() }, uLui: { value: 0 },
    uCam: { value: new THREE.Vector3() }, uMir: { value: new THREE.Vector4(-1, 0, 0, 0) },
  },
  vertexShader: /* glsl */`
    varying vec3 vMonde;
    #include <common>
    #include <logdepthbuf_pars_vertex>
    void main() {
      vec4 w = modelMatrix * vec4( position, 1.0 );
      vMonde = w.xyz;
      gl_Position = projectionMatrix * viewMatrix * w;
      #include <logdepthbuf_vertex>
    }`,
  fragmentShader: /* glsl */`
    uniform vec3 color;
    uniform vec3 voile;
    uniform sampler2D tDiffuse, tProf, tLui, tProfLui;
    uniform mat4 uVPd, uVPdInv, uVPl, uVPlInv;
    uniform float uLui;
    uniform vec3 uCam;
    uniform vec4 uMir;
    varying vec3 vMonde;
    #include <logdepthbuf_pars_fragment>
    vec2 proj( mat4 M, vec3 p ) { vec4 c = M * vec4( p, 1.0 ); return clamp( c.xy / c.w * 0.5 + 0.5, 0.001, 0.999 ); }
    vec3 deproj( mat4 Mi, vec2 uv, float z ) { vec4 p = Mi * vec4( uv * 2.0 - 1.0, z * 2.0 - 1.0, 1.0 ); return p.xyz / p.w; }
    void main() {
      #include <logdepthbuf_fragment>
      vec3 cv = uCam - 2.0 * ( dot( uMir.xyz, uCam ) + uMir.w ) * uMir.xyz;
      vec3 dir = normalize( vMonde - cv );
      vec2 uv = proj( uVPd, vMonde );
      float t = 0.0;
      for ( int i = 0; i < 3; i ++ ) {
        t = max( 0.0, dot( deproj( uVPdInv, uv, texture2D( tProf, uv ).r ) - vMonde, dir ) );
        uv = proj( uVPd, vMonde + dir * t );
      }
      vec3 c = texture2D( tDiffuse, uv ).rgb;
      if ( uLui > 0.5 ) {
        vec2 ul = proj( uVPl, vMonde );
        vec4 l = texture2D( tLui, ul );
        if ( l.a > 0.004 ) {
          float tl = dot( deproj( uVPlInv, ul, texture2D( tProfLui, ul ).r ) - vMonde, dir );
          if ( tl <= t + 0.03 ) c = mix( c, l.rgb / max( l.a, 0.004 ), clamp( l.a, 0.0, 1.0 ) );
        }
      }
      gl_FragColor = vec4( c * color + voile, 1.0 );
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`,
};
const COUCHE_REFLET = 12;     // la couche de Haythem dans son reflet (6, 7, 29, 30 servent déjà ailleurs)
// LA GLACE PEINTE (qualité basse, et ce que voit la carte d'environnement) : le reflet du hall vu de l'accueil, flou —
// le plafond clair en haut, le jour des fenêtres de la façade et leurs cadres sombres, les murs blancs, le carrelage
function texGlacePeinte() {
  return canvasTex(256, 192, (g, w, h) => {
    const d = g.createLinearGradient(0, 0, 0, h);
    d.addColorStop(0, '#eceeee'); d.addColorStop(0.22, '#e2e4e3'); d.addColorStop(0.25, '#cfd2d2'); d.addColorStop(0.75, '#d6d8d7'); d.addColorStop(1, '#a9aaa8');
    g.fillStyle = d; g.fillRect(0, 0, w, h);
    g.filter = 'blur(3px)';
    // (u croît vers le sud du plan : la glace regarde l'ouest)
    for (const [x0, x1] of [[0.08, 0.3], [0.62, 0.7], [0.86, 1.0]]) {
      g.fillStyle = '#4c5560'; g.fillRect(x0 * w - 3, 0.27 * h, (x1 - x0) * w + 6, 0.5 * h);
      g.fillStyle = '#f4f6f7'; g.fillRect(x0 * w, 0.29 * h, (x1 - x0) * w, 0.46 * h);
    }
    g.fillStyle = '#5f646a'; for (const v of [0.55, 0.6, 0.65]) g.fillRect(0.1 * w, v * h, 0.18 * w, 0.03 * h);
    g.filter = 'none';
    g.fillStyle = 'rgba(255,255,255,0.18)';
    for (const [x0, l] of [[40, 30], [150, 12]]) { g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 + l, 0); g.lineTo(x0 + l - 60, h); g.lineTo(x0 - 60, h); g.closePath(); g.fill(); }
  }, null, false, 2);
}
// L'AFFICHETTE ÉTROITE de l'angle (photo 03 : claire en haut, bleu nuit, prune, gris clair en bas — IMAGINÉE au-delà)
function texAffichetteAngle() {
  return canvasTex(64, 330, (g, w, h) => {
    g.fillStyle = '#d9dde4'; g.fillRect(0, 0, w, h);
    const d = g.createLinearGradient(0, h * 0.2, 0, h * 0.62); d.addColorStop(0, '#26315e'); d.addColorStop(0.55, '#3a2f5c'); d.addColorStop(1, '#5a2f4e');
    g.fillStyle = d; g.fillRect(0, h * 0.2, w, h * 0.42);
    g.fillStyle = '#3c4a7a'; g.fillRect(0, h * 0.62, w, h * 0.16);
    g.fillStyle = '#1d1d22'; g.font = `600 7px ${POLICE}`; g.textAlign = 'center';
    ['BTS SIO', 'portes', 'ouvertes'].forEach((t, i) => g.fillText(t, w / 2, h * 0.07 + i * 9));
    g.fillStyle = '#e9e7ef'; ['Samedi', '10 h - 17 h'].forEach((t, i) => g.fillText(t, w / 2, h * 0.45 + i * 9));
    paveIris(g, w * 0.3, h * 0.88, w * 0.4);
  }, null, false, 2);
}
const MIR = { x: X_MIT - 0.006, y0: 0.40, y1: 1.82, h0: 0.95, h1: 2.57 };
const _v4 = new THREE.Vector4(), _n = new THREE.Vector3(), _pm = new THREE.Vector3(), _pc = new THREE.Vector3(), _vue = new THREE.Vector3();
const _cible = new THREE.Vector3(), _regard = new THREE.Vector3(), _rot = new THREE.Matrix4(), _S = new THREE.Matrix4(), _pv = new THREE.Matrix4();
const _plan = new THREE.Plane(), _clip = new THREE.Vector4(), _q = new THREE.Vector4(), _fr = new THREE.Frustum(), _taille = new THREE.Vector2();
function miroirAccueil(ch) {
  const L = MIR.y1 - MIR.y0, Hm = MIR.h1 - MIR.h0, yc = (MIR.y0 + MIR.y1) / 2, hc = (MIR.h0 + MIR.h1) / 2;
  const K = TELEPHONE ? 0.35 : 0.5;
  // la glace peinte : posée dans le décor, montrée quand le vrai miroir ne se dessine pas
  const t = texGlacePeinte();
  const repli = new THREE.Mesh(new THREE.PlaneGeometry(L, Hm), new THREE.MeshStandardMaterial({ map: t, roughness: 0.12, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.3 }));
  repli.material.name = 'glace peinte (miroir de l\'accueil)';
  repli.position.set(MIR.x, hc, -yc); repli.rotation.y = -Math.PI / 2; repli.castShadow = false; repli.userData.horsAOSol = true;
  nePasFusionner(repli); ch.decor.add(repli);
  // le vrai miroir, à la racine de la scène
  const m = new Reflector(new THREE.PlaneGeometry(L, Hm), { textureWidth: 256, textureHeight: 256, clipBias: 0.003, multisample: 0, shader: MiroirShader, color: 0xffffff });
  const U = m.material.uniforms;
  U.color.value.setRGB(0.95, 0.97, 0.97); U.voile.value.setRGB(0.04, 0.045, 0.05);
  m.position.set(MIR.x - 0.001, hc, -yc); m.rotation.y = -Math.PI / 2;
  m.userData.dynamique = true; m.userData.horsAOSol = true; m.name = 'miroir de l\'accueil';
  m.visible = false; ch.scene.add(m); m.updateMatrixWorld(true);
  const rt = m.getRenderTarget(), vc = m.camera;
  rt.depthTexture = new THREE.DepthTexture(256, 256);
  const rtLui = new THREE.WebGLRenderTarget(256, 256, { type: THREE.HalfFloatType, depthTexture: new THREE.DepthTexture(256, 256) });
  U.tProf.value = rt.depthTexture; U.tLui.value = rtLui.texture; U.tProfLui.value = rtLui.depthTexture;
  { const n = new THREE.Vector3(0, 0, 1).transformDirection(m.matrixWorld); U.uMir.value.set(n.x, n.y, n.z, -n.dot(m.position)); }
  // ses quatre coins (monde), ses cinq points de visée, sa boîte (grossie : la caméra de l'image d'avant)
  const coins = [[-L / 2, -Hm / 2], [L / 2, -Hm / 2], [-L / 2, Hm / 2], [L / 2, Hm / 2]].map(([a, b]) => m.localToWorld(new THREE.Vector3(a, b, 0)));
  const points = [[yc, hc], [MIR.y0 + 0.12, 1.25], [MIR.y1 - 0.12, 1.25], [MIR.y0 + 0.12, 2.45], [MIR.y1 - 0.12, 2.45]];
  const boite = new THREE.Box3(new THREE.Vector3(MIR.x - 0.3, MIR.h0 - 0.3, -MIR.y1 - 0.3), new THREE.Vector3(MIR.x + 0.05, MIR.h1 + 0.3, -MIR.y0 + 0.3));
  const C = ch.C;
  // un des points de la glace se voit-il de (cx, cy, cz) ? (les murs et les meubles du monde solide ; ni les vitres, ni
  // les portes automatiques, ni les formes éteintes)
  const vu = (cx, cy, cz) => {
    for (const [y, h] of points) {
      const bx = MIR.x - 0.05, bz = -y, dx = bx - cx, dy = h - cy, dz = bz - cz;
      let libre = true;
      C._parcourir(Math.min(cx, bx), Math.min(cz, bz), Math.max(cx, bx), Math.max(cz, bz), (s) => {
        if (libre && s.camera && !s.off && !s.vitre && !s.mobile && C._segment(s, cx, cy, cz, dx, dy, dz, 0) < 1) libre = false;
      });
      if (libre) return true;
    }
    return false;
  };
  let camJeu = null, joueur = null, aFaire = false, luiVu = false, fait = false, image = 0, avant = false, dernier = -99, force = false, lumieres = false;
  const etat = { actif: false, rendus: 0, rendusLui: 0, ms: 0, K, pas: 2, seuil: 0.25, coupe: false, portails: true, caches: 0 };
  const _clair = new THREE.Color();
  // la racine de Haythem dans la scène (celle qu'on cache pour le décor, et qu'on met sur la couche du reflet)
  const racineLui = (u) => {
    const o = u && (u.avatarModel || u.body);
    let r = o; while (r && r.parent && !r.parent.isScene) r = r.parent;
    return r && r.parent ? r : null;
  };
  const _der = new THREE.Vector3(1e9, 0, 0);
  // LES PORTAILS (13/10). Dans la glace, la caméra symétrique voit tout le champ recadré — vers l'ouest, la Si 0.1, le
  // bureau, le passage, l'escalier ; au sud, la rue — quand le hall n'en laisse voir que ce qui passe par ses ouvertures.
  // Mesuré en vue de jeu, glace à l'écran : 242 objets dessinés pour le reflet, dont 121 hors du hall. Ce qui n'est pas
  // dans la boîte du hall n'est dessiné que si sa sphère passe par une de ses ouvertures, vue de la caméra symétrique : la
  // porte 6, les deux fenêtres de l'accueil, le passage de la pile, le mur nord (sa porte, le cannelé).
  const BOITE_HALL = new THREE.Box3(new THREE.Vector3(13.3, -0.1, -7.66), new THREE.Vector3(19.86, 2.75, 0.05));
  const PORTAILS = [
    [[13.35, -0.05, 0], [16.5, -0.05, 0], [16.5, -0.05, 2.6], [13.35, -0.05, 2.6]],
    [[16.73, -0.05, 1.1], [17.93, -0.05, 1.1], [17.93, -0.05, 2.6], [16.73, -0.05, 2.6]],
    [[18.38, -0.05, 1.1], [19.58, -0.05, 1.1], [19.58, -0.05, 2.6], [18.38, -0.05, 2.6]],
    [[13.3, 2.5, 0], [13.3, 4.75, 0], [13.3, 4.75, 2.6], [13.3, 2.5, 2.6]],
    [[14.6, 7.66, 0], [19.8, 7.66, 0], [19.8, 7.66, 2.6], [14.6, 7.66, 2.6]],
  ].map((P) => P.map(([x, y, h]) => new THREE.Vector3(x, h, -y)));
  // (et, de la rue, par la porte 6 à plus de 10 m dans une glace : ni les voitures, ni les feuillages, ni le mobilier, ni
  // les taches d'ombre — une vingtaine d'appels de dessin ; restent le sol, les façades d'en face, le ciel)
  const DETAILS_RUE = /^(feuillage de la rue|rue : pièces|zinc patiné|taches d'ombre|carrosserie|vitres des voitures|Wheel|Wheek|Optics|ombres de contact)/;
  const _pl = [new THREE.Plane(), new THREE.Plane(), new THREE.Plane(), new THREE.Plane(), new THREE.Plane()], _cp = new THREE.Vector3();
  let candidats = null, rendusListe = 0;
  const lister = (scene) => {
    candidats = [];
    const exclu = (o) => { for (let q = o; q; q = q.parent) if (q.userData && q.userData.dynamique) return true; return false; };
    scene.traverse((o) => {
      if (!(o.isMesh || o.isInstancedMesh) || o === m || o.isSkinnedMesh || o.frustumCulled === false || exclu(o)) return;
      const g = o.geometry; if (!g.boundingSphere) g.computeBoundingSphere();
      const sp = g.boundingSphere.clone().applyMatrix4(o.matrixWorld);
      if (!BOITE_HALL.intersectsSphere(sp)) candidats.push([o, sp, DETAILS_RUE.test((o.material && o.material.name) || '') || DETAILS_RUE.test(o.name || '')]);
    });
  };
  // la sphère sp se voit-elle, de V, par un des portails ?
  const parUnPortail = (V, sp) => {
    for (const P of PORTAILS) {
      const cx = (P[0].x + P[2].x) / 2, cy = (P[0].y + P[2].y) / 2, cz = (P[0].z + P[2].z) / 2;
      _cp.set(cx, cy, cz);
      let dedans = true;
      for (let i = 0; i < 4 && dedans; i++) {
        _pl[i].setFromCoplanarPoints(V, P[i], P[(i + 1) % 4]);
        if (_pl[i].distanceToPoint(_cp) < 0) _pl[i].negate();
        if (_pl[i].distanceToPoint(sp.center) < -sp.radius) dedans = false;
      }
      if (!dedans) continue;
      // et au-delà du portail
      _pl[4].setFromCoplanarPoints(P[0], P[1], P[2]);
      if (_pl[4].distanceToPoint(V) > 0) _pl[4].negate();
      if (_pl[4].distanceToPoint(sp.center) > -sp.radius) return true;
    }
    return false;
  };
  // Haythem se voit-il dans la glace ? (ses pieds et sa tête, reflétés, vus de la caméra : à travers la glace, grossie)
  const lui = (u, p) => {
    if (!u) return false;
    for (const h of [0.4, 1.0, 1.7]) {
      const xv = 2 * MIR.x - u.x, t = (MIR.x - p.x) / (xv - p.x);
      if (!(t > 0 && t < 1)) continue;
      const hy = p.y + t * (h - p.y), y = -(p.z + t * (u.z - p.z));
      if (y > MIR.y0 - 0.5 && y < MIR.y1 + 0.5 && hy > MIR.h0 - 0.5 && hy < MIR.h1 + 0.5) return true;
    }
    return false;
  };
  // LA CAMÉRA SYMÉTRIQUE d'une caméra du jeu (le code du Reflector), sa projection RECADRÉE sur la glace (élargie de
  // `marge`) et son plan proche oblique posé sur la glace — dans `cible` ; faux si la glace est vue de dos ou de chant
  const poserSymetrique = (camera, cible, marge) => {
    _pm.setFromMatrixPosition(m.matrixWorld); _pc.setFromMatrixPosition(camera.matrixWorld);
    _rot.extractRotation(m.matrixWorld); _n.set(0, 0, 1).applyMatrix4(_rot);
    _vue.subVectors(_pm, _pc);
    if (_vue.dot(_n) > 0) return false;
    _vue.reflect(_n).negate().add(_pm);
    _rot.extractRotation(camera.matrixWorld);
    _regard.set(0, 0, -1).applyMatrix4(_rot).add(_pc);
    _cible.subVectors(_pm, _regard).reflect(_n).negate().add(_pm);
    cible.position.copy(_vue); cible.up.set(0, 1, 0).applyMatrix4(_rot).reflect(_n); cible.lookAt(_cible);
    cible.far = camera.far; cible.updateMatrixWorld();
    // le rectangle de la glace dans l'image de la caméra symétrique (c'est celui de l'écran retourné de gauche à droite),
    // élargi ; toute l'image si un coin est derrière la caméra
    let ax = 1, ay = 1, bx = -1, by = -1;
    for (const c of coins) {
      _v4.set(c.x, c.y, c.z, 1).applyMatrix4(cible.matrixWorldInverse).applyMatrix4(camera.projectionMatrix);
      if (_v4.w < 0.05) { ax = ay = -1; bx = by = 1; break; }
      const x = _v4.x / _v4.w, y = _v4.y / _v4.w;
      ax = Math.min(ax, x); bx = Math.max(bx, x); ay = Math.min(ay, y); by = Math.max(by, y);
    }
    ax = Math.max(-1, ax - marge); ay = Math.max(-1, ay - marge); bx = Math.min(1, bx + marge); by = Math.min(1, by + marge);
    if (bx - ax < 0.002 || by - ay < 0.002) return false;
    // la projection recadrée : ce rectangle remplit toute la texture
    const sx = (bx - ax) / 2, sy = (by - ay) / 2, mx = (ax + bx) / 2, my = (ay + by) / 2;
    _S.set(1 / sx, 0, 0, -mx / sx, 0, 1 / sy, 0, -my / sy, 0, 0, 1, 0, 0, 0, 0, 1);
    cible.projectionMatrix.multiplyMatrices(_S, camera.projectionMatrix);
    // le plan proche oblique, sur la glace (Lengyel, comme le Reflector)
    _plan.setFromNormalAndCoplanarPoint(_n, _pm).applyMatrix4(cible.matrixWorldInverse);
    _clip.set(_plan.normal.x, _plan.normal.y, _plan.normal.z, _plan.constant);
    const e = cible.projectionMatrix.elements;
    _q.set((Math.sign(_clip.x) + e[8]) / e[0], (Math.sign(_clip.y) + e[9]) / e[5], -1, (1 + e[10]) / e[14]);
    _clip.multiplyScalar(2 / _clip.dot(_q));
    e[2] = _clip.x; e[6] = _clip.y; e[10] = _clip.z + 1 - 0.003; e[14] = _clip.w;
    cible.projectionMatrixInverse.copy(cible.projectionMatrix).invert();
    return true;
  };
  // un rendu imbriqué dans celui de l'image : ni les ombres ni les matrices du monde ne sont refaites (le rendu principal
  // vient de le faire), la glace ne se dessine pas elle-même
  const imbrique = (renderer, scene, camera, cible, cam, dessin) => {
    m.visible = false;
    const avant = renderer.getRenderTarget(), xr = renderer.xr.enabled, ombres = renderer.shadowMap.autoUpdate, mat = scene.matrixWorldAutoUpdate;
    renderer.xr.enabled = false; renderer.shadowMap.autoUpdate = false; scene.matrixWorldAutoUpdate = false;
    try {
      renderer.setRenderTarget(cible);
      renderer.state.buffers.depth.setMask(true);
      dessin();
    } finally {
      renderer.xr.enabled = xr; renderer.shadowMap.autoUpdate = ombres; scene.matrixWorldAutoUpdate = mat;
      renderer.setRenderTarget(avant);
      if (camera.viewport !== undefined) renderer.state.viewport(camera.viewport);
      m.visible = true;
    }
  };
  // LE DESSIN DU REFLET (à la place de celui du Reflector), une fois par image, pour la seule caméra du jeu
  m.onBeforeRender = (renderer, scene, camera) => {
    if (camera !== camJeu || scene.overrideMaterial) return;
    U.uCam.value.setFromMatrixPosition(camera.matrixWorld);
    if (fait || (!aFaire && !(luiVu && (image & 1 || !U.uLui.value)))) return;
    fait = true;
    const t0 = performance.now();
    const racine = racineLui(joueur);
    if (aFaire && poserSymetrique(camera, vc, 0.08)) dessinerDecor(renderer, scene, camera, racine);
    // (Haythem : une image sur deux — 25 à 30 fois par seconde dans la glace)
    if (luiVu && racine && dernier > -99 && (image & 1 || !U.uLui.value) && poserSymetrique(camera, vl, 0.02)) { dessinerLui(renderer, scene, camera, racine); U.uLui.value = 1; }
    etat.ms += performance.now() - t0;
  };
  // LE DÉCOR, SANS HAYTHEM — refait quand la caméra s'est déplacée de 25 cm (voir maj), relu en suivant la parallaxe
  const dessinerDecor = (renderer, scene, camera, racine) => {
    // les portails : ce qui n'est pas dans le hall et ne passe par aucune de ses ouvertures n'est pas dessiné
    const caches = [];
    if (etat.portails) {
      if (!candidats || ++rendusListe > 300) { lister(scene); rendusListe = 0; }
      for (const [o, sp, detail] of candidats) if (o.visible && (detail || !parUnPortail(_vue, sp))) { o.visible = false; caches.push(o); }
      etat.caches = caches.length;
    }
    const vuLui = racine ? racine.visible : false;
    if (racine) racine.visible = false;
    try {
      imbrique(renderer, scene, camera, rt, vc, () => { if (renderer.autoClear === false) renderer.clear(); renderer.render(scene, vc); });
    } finally {
      if (racine) racine.visible = vuLui;
      for (const o of caches) o.visible = true;
    }
    U.uVPd.value.multiplyMatrices(vc.projectionMatrix, vc.matrixWorldInverse); U.uVPdInv.value.copy(U.uVPd.value).invert();
    _der.copy(_pc); dernier = image; force = false;
    etat.rendus++;
  };
  // HAYTHEM SEUL, à chaque image où il se voit dans la glace, depuis la caméra symétrique de l'image : sa couche à lui, les
  // lumières aussi, un fond transparent. Une dizaine d'appels de dessin, quand le décor en demande 150 : il bouge à la
  // cadence du jeu dans la glace.
  const vl = new THREE.PerspectiveCamera();
  // (et, pour que three ne parcoure pas toute l'école à chaque image, les branches de la scène qui ne portent ni Haythem
  // ni une lumière sont cachées le temps de ce dessin)
  let porteLumieres = null;
  const dessinerLui = (renderer, scene, camera, racine) => {
    if (!lumieres) {
      porteLumieres = new Set();
      scene.traverse((o) => { if (o.isLight) { o.layers.enable(COUCHE_REFLET); let r = o; while (r.parent && !r.parent.isScene) r = r.parent; porteLumieres.add(r); } });
      lumieres = true;
    }
    racine.traverse((o) => o.layers.enable(COUCHE_REFLET));
    const fond = scene.background, alpha = renderer.getClearAlpha(); renderer.getClearColor(_clair);
    vl.layers.set(COUCHE_REFLET);
    scene.background = null;
    const branches = [];
    for (const o of scene.children) if (o.visible && o !== racine && !porteLumieres.has(o)) { o.visible = false; branches.push(o); }
    // (à la première personne, js/game.js cache Haythem tout entier — il se voit pourtant dans la glace, tête comprise)
    const vuLui = racine.visible; racine.visible = true;
    try {
      imbrique(renderer, scene, camera, rtLui, vl, () => { renderer.setClearColor(0x000000, 0); renderer.clear(true, true, true); renderer.render(scene, vl); });
    } finally {
      scene.background = fond; renderer.setClearColor(_clair, alpha);
      racine.visible = vuLui;
      for (const o of branches) o.visible = true;
    }
    U.uVPl.value.multiplyMatrices(vl.projectionMatrix, vl.matrixWorldInverse); U.uVPlInv.value.copy(U.uVPl.value).invert();
    etat.rendusLui++;
  };
  // (débogage : tourner la glace autour de son axe vertical, en degrés — la recherche de sa pose, 13/10)
  const tourner = (deg) => {
    for (const o of [m, repli]) { o.rotation.y = -Math.PI / 2 + deg * Math.PI / 180; o.updateMatrixWorld(true); }
    [[-L / 2, -Hm / 2], [L / 2, -Hm / 2], [-L / 2, Hm / 2], [L / 2, Hm / 2]].forEach(([a, b], i) => m.localToWorld(coins[i].set(a, b, 0)));
  };
  if (typeof window !== 'undefined') window.__miroirAccueil = { etat, m, repli, tourner };
  return {
    // à chaque image, avant le rendu : le vrai miroir ou la glace peinte
    maj(dt, jeu) {
      camJeu = jeu.camera; joueur = jeu.user; fait = false;
      const p = camJeu.position;
      let ok = !etat.coupe && !!(jeu.fx && jeu.fx.quality !== 'low') && p.y > -0.2 && p.y < 3.3 && p.x < MIR.x - 0.05;
      if (ok) { camJeu.updateMatrixWorld(); _fr.setFromProjectionMatrix(_pv.multiplyMatrices(camJeu.projectionMatrix, camJeu.matrixWorldInverse)); ok = _fr.intersectsBox(boite); }
      if (ok) ok = vu(p.x, p.y, p.z);
      etat.actif = ok; m.visible = ok; repli.visible = !ok;
      image++;
      if (!ok) { aFaire = luiVu = false; avant = false; return; }
      if (!avant) force = true;
      avant = true;
      jeu.renderer.getDrawingBufferSize(_taille);
      const w = Math.max(64, Math.round(_taille.x * etat.K)), h = Math.max(64, Math.round(_taille.y * etat.K));
      if (rt.width !== w || rt.height !== h) { rt.setSize(w, h); rtLui.setSize(w, h); force = true; }
      // QUAND REDESSINER LE DÉCOR (13/10, mesuré en vue de jeu, la glace à l'écran, en marchant : 22 ms l'image sans elle,
      // 31,6 en la redessinant à chaque image — ≈ 150 appels de dessin, 8 à 9 ms ici quelle que soit la taille de la
      // texture : c'est le nombre d'appels qui coûte, pas les pixels). La glace garde le décor d'avant, sa caméra et sa
      // profondeur : le shader suit la parallaxe (MiroirShader). On le refait : au premier jour, à la taille changée ;
      // quand la caméra s'est déplacée de plus de `seuil` (25 cm ; 15 en ultra et extrême) — au plus une image sur deux ;
      // et au moins toutes les 30 images (une porte, un passant). Haythem, lui, est redessiné à chaque image où il se voit.
      const q = jeu.fx && jeu.fx.quality;
      etat.seuil = q === 'ultra' || q === 'extreme' ? 0.15 : 0.25;
      const bouge = p.distanceToSquared(_der) > etat.seuil * etat.seuil;
      aFaire = force || image - dernier >= 30 || (bouge && image - dernier >= etat.pas);
      luiVu = lui(jeu.user && jeu.user.posAff, p);
      if (!luiVu) U.uLui.value = 0;
    },
  };
}

// =====================================================================
//  LE HALL (crochet de js/carte_ecole.js : construireAccueil)
// =====================================================================
export function poserHall(ch) {
  const { M, C } = ch;
  H = matieresHall();
  const B = (x0, y0, x1, y1, h0, h1, mat, o) => ch.boite(Math.min(x0, x1), Math.min(y0, y1), Math.max(x0, x1), Math.max(y0, y1), h0, h1, mat, o);

  // =====================================================================
  //  LE MITOYEN EST : GRIS ARDOISE du miroir au local technique (r04), BLANC de l'angle de la façade au miroir (photo 03)
  // =====================================================================
  // (r04 : le gris s'arrête au nord contre la face sud du local, y 4,43. Au sud, il porte le MIROIR, y 0,40-1,82 — plus
  // bas — et s'arrête au bord sud de la glace : de là à l'angle de la façade, le mur est blanc comme elle — photo 03 : 144,
  // 145, 156 sur la bande de l'angle, 143, 143, 154 sur le trumeau de la façade —, une affichette étroite contre l'angle.
  // Plinthe de bois, comme tout le hall.) (13/10 : le blanc « au jour » du bureau d'angle de la v1.9 n'a plus lieu d'être.)
  ch.mur({ de: [19.95, -0.4], a: [19.95, MIR.y0], ep: 0.3, mats: { W: M.blanc, E: M.blanc }, plinthes: ['W'] });
  ch.mur({ de: [19.95, MIR.y0], a: [19.95, 7.65], ep: 0.3, mats: { W: H.ardoise, E: M.blanc }, plinthes: ['W'] });
  // L'AFFICHETTE ÉTROITE de l'angle (photo 03 agrandie six fois : une bande haute et étroite, claire en haut, bleu nuit puis
  // prune, gris clair en bas — 67, 74, 111 en moyenne —, entre la fenêtre c 18,98 et son reflet ; rétroprojetée sur le
  // mitoyen, y 0,04-0,24, de 1,19 à 2,22 m. La VO de 2021 n'y montre rien : elle est de 2026. Son dessin est IMAGINÉ. C'est
  // elle que js/ecole_mobilier.js posait sur le trumeau, entre les deux vraies fenêtres.)
  ch.panneau(new THREE.MeshStandardMaterial({ map: texAffichetteAngle(), roughness: 0.5 }), 0.2, 1.03, X_MIT - 0.004, 0.14, 1.705, 'W');
  // LES DEUX AFFICHES (r04, rétroprojetées sur le mitoyen : 0,67 x 0,94 chacune, de 1,44 à 2,38 m ; celle au cadre
  // magenta au nord, y 3,37-4,04, celle aux lignes de couleur au sud, y 2,22-2,89 — l'ordre de la VO q_0377-0383, où
  // elles étaient lues plus au sud), sous un mince cadre d'aluminium (relecture du 12/10 : l'appareil à 1,155 m, et non
  // 1,12, les remonte de 3,5 cm — de 1,475 à 2,415)
  const xa = X_MIT - 0.012, A0 = 1.475, A1 = 2.415;
  for (const [y, tex] of [[3.705, texAfficheMagenta()], [2.555, texAfficheLignes()]]) {
    ch.panneau(new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 }), 0.66, 0.93, xa - 0.004, y, (A0 + A1) / 2, 'W');
    // (relecture du 12/10 : le cadre ne se voit presque pas sur r04 — 6 mm, et non 15)
    for (const [y0, y1, h0, h1] of [[-0.335, 0.335, A1 - 0.006, A1], [-0.335, 0.335, A0, A0 + 0.006], [-0.335, -0.329, A0, A1], [0.329, 0.335, A0, A1]]) B(xa - 0.016, y + y0, X_MIT, y + y1, h0, h1, H.argent, { ombre: false });
  }
  // LE JOUR DE LA FENÊTRE c 18,98 sur le bout sud du mur ardoise (relecture du 12/10, r04 : le gris s'éclaircit et bleuit
  // vers le miroir — 92 entre les affiches, 118 et bleuté au bout sud — : la fenêtre, à 1,4 m, l'éclaire en rasant ; le
  // nombre de lumières est figé dans les programmes : un voile additif, du bleu pâle au rien, sur 1,6 m, de la glace vers
  // le nord — il s'arrête au bord de la glace, qui a son propre jour : le reflet)
  {
    const tex = canvasTex(128, 8, (g, w, h) => {
      const d = g.createLinearGradient(0, 0, w, 0); d.addColorStop(0, 'rgba(255,255,255,0)'); d.addColorStop(0.65, 'rgba(255,255,255,0.45)'); d.addColorStop(1, 'rgba(255,255,255,1)');
      g.clearRect(0, 0, w, h); g.fillStyle = d; g.fillRect(0, 0, w, h);
    }, null, true, 1);
    // (le plan regarde l'ouest : son u court du nord au sud — le jour est au bout de u)
    // (relecture du 13/10 : au bout sud, 119, 119, 126 sur la photo, 103, 96, 102 au jeu — plus fort, plus froid)
    const m = new THREE.MeshBasicMaterial({ map: tex, color: new THREE.Color(0x4a5462), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: true });
    m.name = 'jour de la fenêtre c 18,98 sur le mur ardoise';
    const v = ch.panneau(m, 1.6, 2.4, X_MIT - 0.03, Y_ARD + 0.8, 1.3, 'W');
    v.castShadow = false; v.receiveShadow = false; v.userData.nofuse = true; v.userData.horsAOSol = true; v.renderOrder = 2;
  }
  // LES DEUX CAMÉRAS DÔMES au plafond (r04 : l'une près du mitoyen, au-dessus de l'affiche aux lignes ; l'autre au fond à
  // gauche, au nord-ouest du pilier)
  // (13/10 : celui du fond, rétroprojeté à 2,54 m, en (17,85 ; 6,15) — en (18,1 ; 6,4), il tombait 7 px trop bas)
  for (const [x, y] of [[19.62, 2.4], [17.85, 6.15]]) {
    const d = maille(new THREE.SphereGeometry(0.06, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M.boitier, x, H_PLAF, -y, 0, ch.decor, { ombre: false });
    const c = maille(new THREE.CylinderGeometry(0.075, 0.075, 0.02, 20), M.boitier, x, H_PLAF - 0.01, -y, 0, ch.decor, { ombre: false });
    d.userData.horsAOSol = c.userData.horsAOSol = true;
  }
  // LE MIROIR (retour r05 du 13/10 : plus haut, miroirAccueil)
  const miroir = miroirAccueil(ch);

  // =====================================================================
  //  LE COMPTOIR D'ACCUEIL, LE DÉCROCHÉ PMR ET SON CAISSON HAUT (r04 ; photo 03 ; VO q_0373-0384)
  // =====================================================================
  // (r04 : la face du comptoir est à 3,25 m de l'appareil, le mur ardoise à 6,5 m ; les deux fuient au même point : le
  // comptoir est NORD-SUD et parallèle au mitoyen, à 3,0 m de lui. Son bout nord en y 3,6 ; il passe le bord droit de la
  // photo en y 1,4 — son bout sud reste celui de la VO, à 0,5 m du poteau est de la porte 6. Les hauteurs, prises entre
  // le pied du socle et le chant de la tablette sur une même verticale : la rainure aux 0,65 de la hauteur — la VO la
  // mettait plus bas —, le socle au dixième. Relecture du 12/10 : la tablette à 1,15 (l'appareil à 1,155), la rainure à
  // 0,745, le socle de 11,5 cm.)
  // le comptoir haut : le socle de chêne clair en retrait de 4 cm, le caisson de stratifié gris clair, la rainure sur la
  // face avant (ouest) et sur le bout sud, la tablette grise qui déborde de 7 cm côté visiteurs
  // (13/10 : ni le comptoir ni sa tablette ne portent d'ombre au « soleil » des plafonniers — elle tombait en bande noire de
  // 0,2 m sur le carrelage, à son pied, x 449-500 de r04 : 14 à 35 au jeu, 75 à 88 sur la photo ; ni d'ombre douce cuite au
  // sol, dont le rayon de 1,6 m assombrissait encore tout le pied — 47 à 66 au jeu, 77 à 89 sur la photo, où le carrelage
  // reste clair jusqu'à la plinthe : l'occlusion de l'écran suffit au contact)
  const sansOmbre = { ombre: false, horsAO: true };
  B(CPT.x0 + 0.04, CPT.y0 + 0.04, CPT.x1, CPT.y1, 0, CPT.socle, H.chene, sansOmbre);
  B(CPT.x0, CPT.y0, CPT.x1, CPT.y1, CPT.socle, CPT.h - CPT.ep, H.comptoirFace, sansOmbre);
  B(CPT.x0 - 0.004, CPT.y0, CPT.x0, CPT.y1, CPT.rainure - 0.008, CPT.rainure + 0.008, H.rainure, { ombre: false });
  B(CPT.x0, CPT.y0 - 0.004, CPT.x1, CPT.y0, CPT.rainure - 0.008, CPT.rainure + 0.008, H.rainure, { ombre: false });
  B(CPT.x0 - 0.07, CPT.y0 - 0.03, CPT.x1, CPT.y1, CPT.h - CPT.ep, CPT.h, H.tablette, { ombre: false });
  // LE DÉCROCHÉ PMR (r04, à gauche) : le caisson bas EN RETRAIT de 25 cm (sa plinthe de chêne passe derrière le pied), la
  // tablette grise à 0,76 qui avance jusqu'à 16,88 et file, côté personnel, jusqu'au plan de travail ; à son angle
  // nord-ouest, le pied gris carré sur son socle de chêne
  B(PMR.xF + 0.03, PMR.y0, X_PERS, PMR.y1 - 0.03, 0, CPT.socle, H.chene, sansOmbre);
  B(PMR.xF, PMR.y0, X_PERS, PMR.y1, CPT.socle, PMR.h - 0.03, H.comptoirOmbre, sansOmbre);
  B(PMR.x0, PMR.y0, X_PERS, PMR.y1, PMR.h - 0.035, PMR.h, H.tablettePMR);
  B(16.915, 4.355, 17.055, 4.495, 0, 0.08, H.chene);
  B(16.93, 4.37, 17.04, 4.48, 0.08, PMR.h - 0.03, H.comptoirPied);
  // LE CAISSON HAUT DU DÉCROCHÉ : posé sur le bout nord de la tablette basse, au-dessus du pied, du même stratifié, et sa
  // tablette haute qui déborde au nord (r04 : sa face ouest de x 178 à 200, sa face sud de 200 à 262, de 0,76 à 1,15 m,
  // les bacs noirs devant ; la tablette de x 128 à 265 — sous son débord, on voit le pilier : rien ne la porte ; 0,22 m
  // de débord : entre elle et le portant, le personnel passe)
  B(RET.x0, RET.y0, RET.x1, RET.y1, PMR.h, RET.h - 0.03, H.comptoirOmbre);
  B(RET.x0 + 0.004, RET.y0 - 0.003, RET.x1, RET.y0, PMR.h + 0.003, RET.h - 0.033, H.caissonSud, { ombre: false });
  B(RET.x0 - 0.05, RET.y0 - 0.07, RET.x1 + 0.05, RET.y1 + 0.22, RET.h - 0.03, RET.h, H.tablette);
  // derrière (est) : le plan de travail du personnel à 0,75 m, le long du comptoir haut, sur trois pieds
  B(CPT.x1, CPT.y0 + 0.05, X_PERS, CPT.y1, 0.72, 0.75, H.plan);
  for (const y of [CPT.y0 + 0.1, 2.35, CPT.y1 - 0.08]) B(X_PERS - 0.06, y - 0.025, X_PERS - 0.02, y + 0.025, 0, 0.72, H.pied, { ombre: false });
  // le monde solide : le comptoir et son plan de travail, le décroché, le débord de la tablette haute
  C.ajouterBoite(CPT.x0 - 0.07, -CPT.y1, X_PERS, -(CPT.y0 - 0.03), { y1: CPT.h });
  C.ajouterBoite(PMR.x0, -PMR.y1, X_PERS, -PMR.y0, { y1: PMR.h });
  C.ajouterBoite(RET.x0 - 0.05, -(RET.y1 + 0.22), RET.x1 + 0.05, -PMR.y1, { y0: RET.h - 0.03, y1: RET.h });
  // SUR LE DÉCROCHÉ (r04) : les bacs à courrier noirs empilés et leurs papiers rouges et blancs, contre le caisson haut ;
  // la bouilloire inox ; une chemise rouge et des feuilles à plat au bord
  // (13/10, r04 agrandie : DEUX bacs, bas — 22 px de haut, x 205-262 —, une liasse rouge et blanche entre eux et sur le
  // dessus, qui dépasse vers l'avant ; le jeu en empilait trois, 29 px)
  for (let k = 0; k < 2; k++) {
    const h = PMR.h + k * 0.058;
    B(17.03, 4.05, 17.4, 4.38, h, h + 0.008, M.noir, { ombre: false });
    B(17.03, 4.05, 17.4, 4.065, h, h + 0.048, M.noir, { ombre: false });
    for (const x of [17.03, 17.39]) B(x, 4.05, x + 0.01, 4.38, h, h + 0.048, M.noir, { ombre: false });
    B(17.0, 4.08, 17.38, 4.36, h + 0.008, h + 0.02, k === 0 ? H.rouge : M.store, { ombre: false });
  }
  B(16.99, 4.1, 17.36, 4.34, PMR.h + 0.116, PMR.h + 0.13, M.store, { ombre: false });
  B(17.02, 4.14, 17.3, 4.3, PMR.h + 0.13, PMR.h + 0.136, H.rouge, { ombre: false });
  // LA BOUILLOIRE INOX (13/10, r04 rejouée : elle n'est pas devant les bacs mais AU FOND du décroché, contre le plan du
  // personnel — x 270-292 de la photo, son pied en 306 et son couvercle en 274 : rétroprojetée, (18,0 ; 4,3), 0,25 m de
  // haut ; le jeu la posait en (17,3 ; 3,99), 15 px trop bas) : le corps inox un peu conique, le couvercle et la poignée
  // noirs, le bec, le socle noir
  {
    const g = groupe(ch, 18.0, 4.3, 'N'); g.position.y = PMR.h;
    CL(g, M.noir, 0.085, 0.018, 0, 0.009, 0, 20, { ombre: false });
    maille(new THREE.CylinderGeometry(0.068, 0.078, 0.2, 24), M.inox, 0, 0.118, 0, 0, g);
    CL(g, M.noir, 0.06, 0.03, 0, 0.233, 0, 18, { ombre: false });
    BL(g, M.noir, 0.025, 0.012, 0.025, 0, 0.252, 0, { ombre: false });
    BL(g, M.noir, 0.022, 0.17, 0.035, 0, 0.13, -0.098, { ombre: false });
    for (const h of [0.05, 0.21]) BL(g, M.noir, 0.022, 0.022, 0.03, 0, h, -0.08, { ombre: false });
    const bec = BL(g, M.inox, 0.03, 0.05, 0.04, 0, 0.19, 0.08, { ombre: false }); bec.rotation.x = 0.5;
  }
  // LA CHEMISE ROUGE (r04 : x 280-316, à plat au bord, devant les bacs — (17,41 ; 3,94) rétroprojetée) et des feuilles
  // blanches au bord de la tablette
  B(17.28, 3.78, 17.54, 4.04, PMR.h, PMR.h + 0.01, H.rouge, { ombre: false });
  B(16.92, 3.93, 17.16, 4.22, PMR.h, PMR.h + 0.006, M.store, { ombre: false });
  // SUR LES TABLETTES HAUTES (r04) : des feuilles et des dépliants à plat le long du bord, une petite pile blanche vers le
  // bout nord ; sur le caisson haut, des papiers
  // (relecture du 12/10 : la pile de feuilles de r04 est petite et haute — 26 px sur 9, 0,15 m sur 6 cm — avec une
  // seconde, plus basse, à sa droite ; le jeu en faisait une plaque de 0,28 m)
  B(16.9, 3.13, 17.14, 3.28, CPT.h, CPT.h + 0.06, M.store, { ombre: false });
  B(16.92, 2.95, 17.12, 3.1, CPT.h, CPT.h + 0.025, M.store, { ombre: false });
  for (const [y, l] of [[1.45, 0.3], [1.8, 0.26], [2.12, 0.3]]) B(16.82, y, 17.03, y + l, CPT.h, CPT.h + 0.006, M.store, { ombre: false });
  B(17.3, 4.42, 17.7, 4.66, RET.h, RET.h + 0.012, M.store, { ombre: false });
  // L'ÉCRAN DE L'HÔTESSE (r04 : son dos noir dépasse à peine du comptoir, une bande noire marquée « DELL », vers y 2,9)
  // et, sur le bureau du mitoyen, un portable ouvert (un second écran dépasserait du comptoir : r04 n'en montre pas)
  // (relecture du 12/10, r04 agrandie : la bande noire ne dépasse que de 7 cm — de 1,16 à 1,23 m, 10 px — sur 0,48 m —
  // 78 px — et le mot « DELL », argent, est juste au-dessus de la tablette ; le jeu en montrait 12 cm, 18 px : l'écran plus
  // étroit, le logo au bas de la bande visible)
  {
    const e = ecran(ch, 17.78, 2.92, 0.75, 'E', true, 0.33, 0.49);
    const l = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.03), new THREE.MeshStandardMaterial({ map: texDell(), roughness: 0.4 }));
    l.position.set(0, 0.435, -0.016); l.rotation.y = Math.PI; e.add(l);
  }
  {
    const g = groupe(ch, 19.47, 3.3, 'W'); g.position.y = 0.75;
    BL(g, M.noir, 0.34, 0.015, 0.24, 0, 0.0075, 0.02, { ombre: false });
    const v = BL(g, M.noir, 0.34, 0.22, 0.012, 0, 0.11, -0.1, { ombre: false }); v.rotation.x = -0.25;
  }

  // =====================================================================
  //  L'OPEN-SPACE DU PERSONNEL (r04 ; VO q_0373-0384 ; photo 03)
  // =====================================================================
  // (r04 : derrière le comptoir, rien ne dépasse entre le local et le miroir que l'écran « DELL » et, au fond à droite,
  // devant la glace, le grand copieur blanc. Le reste est sous la ligne du comptoir : le bureau bleu-gris du mitoyen
  // (VO), le plan de travail, les fauteuils. Le passage du personnel : par le nord, entre le décroché et le local
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
  // LE GRAND COPIEUR devant le miroir, le dos à la glace, tourné vers l'ouest (r04 : au bout du comptoir, son chargeur
  // blanc et ses bacs dépassent de la tablette de x 627 à 730 — les rayons qui passent, contre la glace, en y 1,76 et
  // 0,97 ; son dos se voit dans la glace, juste derrière lui, gris clair de x 656 à 690 ; jusqu'à 1,42 m, le chargeur
  // 1,50 ; dans le jour de la fenêtre c 18,98, à 1 m)
  copieur(ch, 19.43, 1.36, 'W', 1.42, true);
  C.ajouterBoite(19.1, -1.74, 19.78, -1.04, { y1: 1.42 });
  // LES FAUTEUILS NOIRS face au comptoir, le long du plan de travail : celui du bout sud porte le manteau moutarde (photo
  // 03 : il dépasse du comptoir vers (18,0 ; 1,7)), celui de l'hôtesse est devant l'écran « DELL », le troisième au
  // décroché, au coussin rayé (VO). Chacun laisse 0,66 m de passage à l'est ; on se relève au nord-est de sa place. (Le
  // troisième en y 3,7 : plus au nord, avec l'angle du local, il fermait le passage — vérifié en marchant, 12/10.)
  const f1 = fauteuil(ch, 18.3, 1.95, 'W', { sx: 18.68, sy: 2.45, nom: 'le fauteuil' });
  fauteuil(ch, 18.3, 2.95, 'W', { sx: 18.75, sy: 3.25, nom: 'le fauteuil de l\'accueil' });
  fauteuil(ch, 18.3, 3.7, 'W', { zebre: true, sx: 18.72, sy: 4.08, nom: 'le fauteuil' });
  BL(f1, new THREE.MeshStandardMaterial({ color: 0xc9a227, roughness: 0.9 }), 0.48, 0.46, 0.07, 0, 0.8, -0.27);

  // =====================================================================
  //  LE LOCAL TECHNIQUE, LE PILIER DE BOIS CLAIR, L'ÉCRAN, LE PANNEAU DES FORMATIONS (r04)
  // =====================================================================
  // (r04 : au fond du comptoir, à gauche du mur ardoise, un bloc de 1 m qui avance du mitoyen — sa face sud blanche (le
  // « retour » au bouton rouge, x 305-345 sur la photo), sa face ouest de stratifié clair : la double porte à étiquette
  // rouge et triangle jaune, toute hauteur, comme un placard ; puis le panneau des formations ;
  // puis le pilier, plus avancé, sous l'écran ; au-delà, d'autres portes de stratifié jusqu'au mur nord, un second
  // triangle. Rétroprojetés à la pose de r04 : l'angle du mur ardoise en y 4,43, l'angle sud-ouest du local en x 18,8 ; la
  // porte y 4,5-5,21 ; le panneau y 5,24-5,70 ; le pilier x 18,14-18,8 × y 5,71-6,24.)
  // (relecture du 12/10 : sa face sud, le « retour » au bouton rouge, est d'un gris clair un peu beige sur r04 — 134, à
  // peine plus sombre que la face du comptoir — ; en blanc des murs, le jeu la rendait à 192, la surface la plus claire)
  B(LOC.x0 + 0.02, LOC.y0, X_MIT, Y_MUR, 0, H_PLAF, H.retour);
  B(LOC.x0, LOC.y0, LOC.x0 + 0.02, Y_MUR, 0, H_PLAF, H.boisLocal);
  B(LOC.x0 - 0.004, LOC.y0 - 0.004, LOC.x0 + 0.024, LOC.y0, 0, H_PLAF, H.boisLocal, { ombre: false });
  B(LOC.x0 + 0.02, LOC.y0 - 0.015, X_MIT, LOC.y0, 0, 0.08, M.bois, { ombre: false });
  C.ajouterBoite(LOC.x0, -Y_MUR, X_MIT, -LOC.y0, { y1: H_PLAF });
  // les portes du local : deux doubles portes de placard toute hauteur (y 4,5-5,21 et 6,45-7,35 ; r04 : le joint entre
  // les vantaux monte jusqu'au plafond), leurs joints sombres
  // (13/10, r04 agrandie : les portes s'arrêtent à 2,07 m — un joint horizontal, à 153 px au-dessus du bouton rouge —
  // sous un PANNEAU HAUT fixe, plus sombre et plus gris ; la seconde porte est au fond, de 6,9 à 7,5, son joint en 7,2 — à
  // x 40 de la photo, le triangle juste à sa droite, x 44 —, et non de 6,45 à 7,35)
  const xj = LOC.x0 - 0.003, PORTES = [[4.5, 5.21], [6.9, 7.5]], H_P = 2.07;
  B(xj - 0.002, LOC.y0, LOC.x0, Y_MUR, H_P + 0.006, H_PLAF, H.boisHaut, { ombre: false });
  B(xj - 0.004, LOC.y0, xj - 0.002, Y_MUR, H_P - 0.004, H_P + 0.004, H.joint, { ombre: false });
  for (const [y0, y1] of PORTES) {
    for (const y of [y0, (y0 + y1) / 2, y1]) B(xj, y - 0.004, LOC.x0, y + 0.004, 0.01, H_P, H.joint, { ombre: false });
    // les poignées (deux barrettes inox, de part et d'autre du joint central)
    for (const s of [-1, 1]) B(xj - 0.025, (y0 + y1) / 2 + s * 0.05 - 0.008, xj, (y0 + y1) / 2 + s * 0.05 + 0.008, 1.0, 1.18, M.inox, { ombre: false });
  }
  for (const [y0, y1] of PORTES) B(xj, y0, LOC.x0, y1, 0.0, 0.01, H.joint, { ombre: false });
  // l'ÉTIQUETTE ROUGE en travers du haut du vantail nord, et le TRIANGLE JAUNE au coin du vantail sud (r04 : de 2,0 à
  // 2,08 m) ; le second triangle sur la porte du fond (r04, au bord gauche : vers y 7,1, à 2,0 m)
  ch.panneau(new THREE.MeshStandardMaterial({ map: texEtiquetteRouge(), roughness: 0.5 }), 0.3, 0.07, xj - 0.002, 5.03, 2.04, 'W');
  const tri = new THREE.MeshStandardMaterial({ map: texTriangle(), transparent: true, alphaTest: 0.4, roughness: 0.5 });
  ch.panneau(tri, 0.08, 0.08, xj - 0.002, 4.83, 2.04, 'W');
  ch.panneau(tri, 0.09, 0.09, xj - 0.002, 7.15, 2.0, 'W');
  // SUR LA FACE SUD (r04) : le déclencheur rouge, un petit boîtier bleu, le boîtier blanc à fenêtre verte et son cordon
  // noir (relecture du 12/10, r04 agrandie cinq fois : ils sont au milieu de la face — de x 316 à 345 sur la photo, à 0,25
  // m plus à l'ouest qu'au jeu — et le boîtier blanc avance plus : vu de biais, son flanc fait la moitié de sa largeur)
  {
    const ys = LOC.y0 - 0.002;
    B(19.04, ys - 0.06, 19.17, ys, 1.37, 1.5, H.rouge, { ombre: false });
    B(19.07, ys - 0.065, 19.14, ys - 0.06, 1.41, 1.46, M.store, { ombre: false });
    B(19.22, ys - 0.05, 19.29, ys, 1.38, 1.52, new THREE.MeshStandardMaterial({ color: 0x3466a8, roughness: 0.5 }), { ombre: false });
    B(19.34, ys - 0.1, 19.47, ys, 1.36, 1.62, M.store);
    B(19.37, ys - 0.102, 19.44, ys - 0.1, 1.45, 1.55, new THREE.MeshStandardMaterial({ color: 0x2f9a6a, roughness: 0.4 }), { ombre: false });
    B(19.47, ys - 0.09, 19.485, ys - 0.075, 1.12, 1.42, M.noir, { ombre: false });
  }
  // LE PILIER habillé de stratifié bois clair, sa plinthe de chêne ; son monde solide
  B(PIL.x0, PIL.y0, PIL.x1, PIL.y1, 0, H_PLAF, H.boisClair);
  B(PIL.x0, PIL.y0 - 0.003, PIL.x1, PIL.y0, 0.08, H_PLAF, H.boisJour, { ombre: false });
  B(PIL.x0 - 0.012, PIL.y0 - 0.012, PIL.x1, PIL.y1 + 0.012, 0, 0.08, H.chene, { ombre: false });
  C.ajouterBoite(PIL.x0, -PIL.y1, PIL.x1, -PIL.y0, { y1: H_PLAF });
  // LE PANNEAU DES FORMATIONS, entre la porte du local et le pilier (r04 : 0,42 m, de ≈ 0,95 à 2,08), son cadre sombre
  ch.panneau(new THREE.MeshStandardMaterial({ map: texFormations(), roughness: 0.55 }), 0.42, 1.13, xj - 0.012, 5.47, 1.515, 'W');
  B(xj - 0.01, 5.245, xj, 5.695, 0.94, 2.09, H.joint, { ombre: false });
  // L'ÉCRAN SUSPENDU sous la retombée, devant le pilier (r04 : son bord haut suit l'arête de la retombée, son tube de
  // fixation y monte ; son plan fuit vers le cap 112 — il regarde au sud-sud-ouest, penché vers le hall ; de 1,95 à 2,48 ;
  // un cadre noir épais autour d'une dalle claire ; son bout est touche presque le local ; « Commander votre sweat à
  // l'accueil pour 25€ »)
  // (relecture du 12/10, r04 agrandie : l'écran tombe 10 px trop à gauche et 6 px trop court — un téléviseur de 40 pouces,
  // 0,9 x 0,5 avec son cadre, et non 0,84 x 0,46 ; 8 cm plus au sud-est, toujours sous la retombée)
  {
    // (relecture du 13/10, r04 agrandie trois fois, ses quatre coins relevés — (142 ; 83), (228 ; 103), (133 ; 145),
    // (220 ; 160) — : 0,88 x 0,50, son haut à 2,50 contre la retombée ; il tombait 7 px trop bas ; l'image claire décalée
    // vers la gauche au milieu de la dalle noire, texEcranTV)
    const T = { x: 18.4, y: 5.33 };
    // (et il regarde plus au sud, cap 194 : de l'appareil, son bout est fuit plus — 86 px de large pour 97 au cap 202)
    const g = groupe(ch, T.x, T.y, 194); g.position.y = 2.25;
    const t = new THREE.Group(); t.rotation.x = 0.15; g.add(t);
    BL(t, M.noir, 0.88, 0.5, 0.06, 0, 0, 0);
    const tex = texEcranTV();
    const e = PL(t, new THREE.MeshStandardMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.55, roughness: 0.18 }), 0.84, 0.46, 0, 0, 0.031);
    e.castShadow = false;
    // (r04 : un câble noir monte du haut de l'écran, côté ouest, jusqu'au plafond)
    BL(g, M.noir, 0.016, H_PLAF - 2.25 - 0.24, 0.016, -0.35, (H_PLAF - 2.25 + 0.24) / 2, -0.04, { ombre: false });
    g.traverse((m) => { m.userData.horsAOSol = true; });
    // (la caméra seule : derrière Haythem, au personnel, elle venait se loger dans l'écran — vu en jouant, 12/10)
    C.ajouterBoiteOrientee(T.x, -T.y, 0.5, 0.08, 14 * Math.PI / 180, { y0: 1.9, y1: 2.5, joueur: false });
  }

  // =====================================================================
  //  LE PORTANT DES GOODIES (r04 : devant le pilier, noir, sur roulettes)
  // =====================================================================
  // (r04, de haut en bas : le sweat plié « iris », 1,45-1,67 ; le sweat à l'impression colorée, 1,15-1,45 ; l'affichette
  // aux deux photos de sweats, 0,9-1,15 ; deux tablettes inclinées de brochures, 0,6-0,78 et 0,2-0,4 ; deux montants noirs
  // et quatre roulettes. Tourné vers le hall, au sud-ouest. Rétroprojeté sur ses roulettes : (17,35 ; 5,57), à ± 0,2 le
  // long du rayon de l'appareil ; posé plus loin sur ce rayon, il laisse le passage du personnel vers l'arrière du
  // comptoir, entre lui et la tablette haute.)
  // (Relecture du 12/10, r04 rejouée et agrandie : le portant est ÉTROIT — ses montants à 0,33 m l'un de l'autre, 53 px à
  // 4,2 m ; le jeu les mettait à 0,44 et l'image à 74 px —, ses sweats sont des vêtements pliés, mous, qui débordent un peu
  // des montants, le premier de 1,40 à 1,63, le second de 1,15 à 1,40 ; l'affichette, 0,47 x 0,31, plus large que lui, de
  // 0,82 à 1,13 ; les brochures de 0,48 à 0,70 et de 0,12 à 0,35. Il revient de 0,1 m vers sa place de r04, (17,48 ;
  // 5,685) : 0,64 m de passage restent devant la tablette haute — RAYON_JOUEUR 0,3.)
  {
    // (13/10, r04 agrandie cinq fois, rétroprojetée à 4,6 m — il regarde l'appareil — : son cadre monte à 1,74 m, x 51-104,
    // le sweat blanc de 1,49 à 1,71, le sweat à capuche de 1,17 à 1,47, l'affichette de 0,84 à 1,16 sur 0,50 m ; le jeu
    // l'arrêtait à 1,63, ses sweats de 0,39 m, plus larges que lui)
    const P = { x: 17.48, y: 5.685 }, g = groupe(ch, P.x, P.y, 225), N = M.noir, l = 0.33;
    for (const s of [-1, 1]) {
      BL(g, N, 0.022, 1.72, 0.022, s * l / 2, 0.89, -0.1);
      BL(g, N, 0.022, 0.78, 0.022, s * l / 2, 0.42, 0.09);
      BL(g, N, 0.022, 0.022, 0.22, s * l / 2, 0.07, -0.005, { ombre: false });
      for (const z of [-0.1, 0.09]) maille(new THREE.SphereGeometry(0.028, 8, 6), N, s * l / 2, 0.03, z, 0, g, { ombre: false });
    }
    const br = new THREE.MeshStandardMaterial({ map: texBrochures(), roughness: 0.6 });
    for (const h of [0.12, 0.48]) {
      const t = BL(g, N, l, 0.012, 0.22, 0, h, 0.0); t.rotation.x = 0.35;
      BL(g, N, l, 0.04, 0.012, 0, h - 0.03, 0.1, { ombre: false });
      const b = PL(g, br, l - 0.03, 0.22, 0, h + 0.115, 0.01); b.rotation.x = -0.35;
    }
    for (const h of [0.84, 1.165, 1.48]) BL(g, N, l, 0.012, 0.26, 0, h, -0.02);
    // les sweats pliés : un pavé arrondi, mou (RoundedBox), le devant imprimé, et le pli du dessus, plus étroit, qui
    // retombe un peu de travers — sans lui, deux valises blanches
    const sw = (imprime, h0, h1) => {
      const m = [new THREE.MeshStandardMaterial({ color: imprime ? 0xe4e4e6 : 0xeeedea, roughness: 0.95 }), new THREE.MeshStandardMaterial({ map: texSweat(imprime), roughness: 0.95 })];
      const hb = (h1 - h0) * 0.78, b = new THREE.Mesh(new RoundedBoxGeometry(0.34, hb, 0.27, 3, 0.06), [m[0], m[0], m[0], m[0], m[1], m[0]]);
      b.position.set(0, h0 + hb / 2, -0.015); b.rotation.z = imprime ? 0.012 : -0.02; b.castShadow = true; g.add(b);
      const p = new THREE.Mesh(new RoundedBoxGeometry(0.29, (h1 - h0) * 0.3, 0.24, 3, 0.03), m[0]);
      p.position.set(imprime ? -0.015 : 0.02, h1 - (h1 - h0) * 0.15, -0.025); p.rotation.set(0.04, imprime ? -0.06 : 0.08, imprime ? -0.03 : 0.04); p.castShadow = true; g.add(p);
    };
    sw(false, 1.485, 1.71); sw(true, 1.17, 1.475);
    const a = PL(g, new THREE.MeshStandardMaterial({ map: texAffichette(), roughness: 0.6 }), 0.5, 0.32, 0, 1.0, 0.115);
    a.rotation.x = -0.05;
    C.ajouterBoiteOrientee(P.x, -P.y, 0.21, 0.14, 3 * Math.PI / 4, { y1: 1.74 });
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
    const r = B(14.675, 5.28, LOC.x0, 5.53, 2.5, H_PLAF, H.retombee, { ombre: false, collision: true });
    r.userData.horsAOSol = true;
  }
  // dans l'axe de la porte 6, au pas de 0,30 m, de la porte jusqu'à y ≈ 4,1 (les spots ronds autour : js/carte_ecole.js) ;
  // un ruban de 2 cm dans un profil d'aluminium de 4 cm, à fleur des plateaux (relecture du 12/10, la photo 03 rejouée : de
  // loin, le ruban de 2 cm se défaisait en pointillés — un chapelet de diodes que ni la photo 03 ni la photo 24 ne montrent,
  // des traits continus : un ruban de 3,5 cm dans un profil de 6, un peu moins éblouissant)
  for (let k = 0; k < 8; k++) {
    const x = 14.35 + k * 0.3;
    const p = B(x - 0.03, 0.5, x + 0.03, 4.1, H_PLAF - 0.006, H_PLAF - 0.001, H.profil, { ombre: false });
    const l = B(x - 0.0175, 0.52, x + 0.0175, 4.08, H_PLAF - 0.008, H_PLAF - 0.006, H.ligne, { ombre: false });
    p.userData.horsAOSol = l.userData.horsAOSol = true; l.receiveShadow = false;
  }
  return { maj: miroir.maj };
}
