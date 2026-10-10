// =====================================================================
//  LE 2e ÉTAGE DE L'ÉCOLE IRIS (crochet de js/ecole_etage1.js)
// =====================================================================
// D'APRÈS LA VIDÉO OFFICIELLE DE VISITE (2021, references/ecole/visite_officielle, 68 à 90 s : q_0277 à q_0361 ; relevé
// iris_visite/etage2.md et plan_global.md § 3.4, § 4.8, lot 8 ; 10/10). Aucune photo de Haythem ne montre le 2e : c'est
// l'état de 2021. La caméra monte la volée 4 de l'escalier est (échiffre ROUGE), arrive sur le PALIER DU 2e — la copie de
// celui du 1er (photo 28) : le mur du panneau « 2 », sa réglette, son poussoir, sa prise, sans les affichettes ; une
// fenêtre dans ce mur, au nord ; l'extincteur dans le recoin sud-ouest —, le quitte par le sud par une PORTE COUPE-FEU (bâton inox,
// huisserie de bois brun, oculus étroit), traverse un SAS (dôme de caméra, plan d'évacuation) et tourne dans un COULOIR
// est-ouest dont le mur nord est ROUGE VERMILLON (lino taupe, plafond lisse, six spots, trois chaises noires, une photo
// turquoise, deux affiches). Elle entre dans la SALLE 1, côté cour (six fenêtres à stores, moquette marine en damier,
// cinq rangées de tables nord-sud, chaises de hêtre à dossier plein, tableau blanc au mur ouest), puis dans la SALLE 2,
// côté rue (cinq fenêtres, moquette anthracite, deux colonnes de tables pour deux, chaises de hêtre à six trous,
// tableau triptyque au mur est), revient vers l'est le long du mur rouge et redescend par la volée 4.
// CE QUI N'EST PAS VU (fermé ou sobre, IMAGINÉ) : la salle Bjarne Stroustrup Si 2.6 et le Bureau des Conseillers B 2.3
// (derrière des portes fermées : à l'ouest côté rue, au bout est du couloir), le dégagement ouest (derrière la porte grise
// du fond, sous son bloc de sortie), le vestibule de l'ascenseur (sa porte palière, la même qu'au 1er : js/ecole_ascenseur.js,
// branchée à l'intégration du 10/10 — la cabine monte jusqu'ici), le dehors des fenêtres côté cour (le « jour » : surexposé sur la vidéo).
// Laquelle des deux salles est S 2.7 ou S 2.8 : inconnu (plaques illisibles) — S 2.7 pour la salle 1, la première vue.
//
// LE PLAN (repère de js/carte_ecole.js : x le long de la façade, y vers le fond ; plancher à 6,60 m) :
//   le palier du 2e         x 13,78-16,05  y 7,96-12,3   mur du panneau (face est x 14,225, y 8,6-12,3), recoin de
//                                                       l'extincteur x 13,78-14,225 y 7,96-8,59 ; au nord, la fenêtre DANS
//                                                       le mur du panneau (y 11,1-11,8 : elle donne sur une courette)
//   le vestibule (ascenseur) x 16,05-17,9  y 6,94-9,0   ouvert sur le palier au sud de la cage
//   la porte coupe-feu      x 14,275-15,225 dans le mur y 7,9 (gonds à l'est, ouverte à demeure, rabattue côté palier)
//   le sas                  x 13,72-15,5   y 6,5-7,84   (relecture : 0,55 m de mur à l'ouest de la porte, sa plaque)
//   le couloir              x 3,3-15,9     y 4,65-6,5   mur nord rouge de x 4,84 à 12,0 ; porte du fond (x 3,3) fermée
//   la salle 1 (cour)       x 3,6-12,95    y 6,62-11,55 porte x 12,0-12,9 (gonds à l'est, s'ouvre vers la salle)
//   la salle 2 (rue)        x 9,96-18,15   y 0-4,53     travées 7 à 11 ; porte D1 x 10,05-11,0 (gonds à l'ouest)
//   fermés                  Si 2.6 (x 0-9,9 côté rue, porte x 4,35), B 2.3 (bout est, x 15,96), le dégagement ouest
//                           (x 0-3,48 y 4,65-12,3, derrière la porte du fond)
//   la façade arrière       y 11,70 derrière la salle 1 (nu 11,55), y 12,45 ailleurs (ép. 0,30), un ressaut en x 13,0 ;
//                           au-dessus, la cage est monte (js/ecole_est.js poserCageHaute)
//   (plan V2 du 11/10, iris_audit/plan_v2.md § 1.3 et § 2.5 : l'escalier principal s'arrête au 1er — le plafond de sa cage
//   est à 6,40, le dessous de notre dalle ; au-dessus de x 1,6-4,75 y 7,775-14,075, la salle 1 et le dégagement fermé)
// (Cotes de la vidéo à ± 0,4 m en y, ± 0,7 m en x. Recalages sur le relevé, images en grand à l'appui : la cloison ouest
// de la salle 2 passe au trumeau entre les travées 6 et 7, x 9,9 — une cloison ne bute pas sur une fenêtre — et la porte
// D1 la suit, 0,45 m plus à l'est ; les fenêtres de la salle 1 sont réparties sur son mur, pas de 1,30 m ; la fenêtre du
// palier n'est pas dans le mur nord mais dans le mur du panneau (q_0285-0287, vue de face) ; l'extincteur du recoin est
// contre son mur ouest, au pied de l'angle sud-ouest (relecture : 71,6-72,6 s à 25 i/s).)
// LA RELECTURE DU 10/10 (chaque vue de la vidéo refaite au même point de vue, côte à côte, en « haute ») : le rouge du
// couloir et de l'échiffre relevé sur la vidéo (js/ecole_est.js ROUGE_2E : le #d0502c du relevé sortait orange vif) ; la
// carte d'environnement du couloir prise loin du mur rouge (tous les blancs viraient au saumon) ; les fenêtres 7 et 11 à la
// taille du jour de leur encadrement rouge (on voyait le rouge déborder dedans) ; la porte coupe-feu sans bois ni étiquette
// ni bâton côté sas, sans scintillement dans ses tableaux ; le sas élargi à l'ouest et sa caméra ; la photo turquoise sans
// la « silhouette » (un reflet) ; le verre des portes des salles gris vert ; l'extincteur du recoin sur son mur ouest ;
// l'allée de la porte de la salle 1 assez large pour passer le poteau ; le lino un peu plus clair.
// LE PLAN V2 DU 11/10 (retour de Haythem du 10/10, « les salles sont trop compressées » ; iris_audit/plan_v2.md § 2.5 et
// etage2.md, planches VO/jeu au même point de vue) : les plafonds à 2,40 (salles) et 2,45 (couloir, sas) au lieu de 2,70
// et 2,58 ; la salle 1 de 9,35 x 4,93 au lieu de 8,05 x 5,68 — mur ouest en x 3,6, façade en y 11,70 —, ses fenêtres de
// 0,88 x 1,10 au pas de 1,35, ses rangées au pas de 1,45 avec 2,0 m devant le tableau, le coin du professeur dans l'angle
// nord-ouest, le second poteau en x 9,0 ; les chaises du couloir contre D1 ; les trumeaux de la salle 2 saillants de
// 0,28 ; le recoin de l'extincteur en x 13,78 ; la porte coupe-feu rabattue, son bois côté gonds seulement ; la fenêtre
// 11 sans cadre rouge (il est au 3e) ; plus de cage de l'escalier principal au 2e.
//
// LES PIÈGES D'UN NIVEAU DE PLUS (ceux du 1er, js/ecole_etage1.js, et du sous-sol, js/ecole_soussol.js) :
//   1. des SOLS (C.sol à 6,60) sous tout ce qu'on foule, la cage exceptée : sinon solEn rendrait le plancher du 1er ;
//      la caméra arrêtée sous le plancher (boîtes « caméra seule ») ;
//   2. murs, plinthes, portes posés sur le plancher du 2e (portes automatiques : js/ecole_portes.js regarde la hauteur) ;
//   3. lampes { base: 6,6, cuire: false } ; lumière cuite et ombre douce cuites propres au 2e, sur ses sols (R2) ;
//   4. ZONES à hauteur minimale 5,7, devant celles du 1er (et celles de la cage du 1er, js/ecole_est.js, ont reçu une
//      hauteur maximale) ;
//   5. le groupe n'est dessiné que si la caméra peut le voir (au 2e, dans la cage est, dehors) ; ses ombres ne portent
//      que si Haythem y est (la lumière presque d'aplomb traverserait les dalles) ;
//   6. sièges avec `sol: 6.6` (js/ecole_etage1.js ne propose que ceux du niveau de Haythem : quatre niveaux).
//
//   poserEtage2(ch, renderer) -> { zones, maj(dt, jeu), groupe }
import * as THREE from 'three';
import { maille, boiteM, fusionnerLocal, fenetreFacade } from './ecole_portes.js';
import { canvasTex, nePasFusionner, detailPhoto } from './kit_decor.js';
import { jourDehors, texPeinture, texPictoExtincteur, texConsignes } from './ecole_matieres.js';
import { cuireLumiereSol } from './ecole_lumieres.js';
import { TELEPHONE } from './appareil.js';
import { EST, ROUGE_2E, poserCageHaute } from './ecole_est.js';
import { cuireOcclusionNiveau } from './ecole_soussol.js';
import { ASC, poserAscenseur } from './ecole_ascenseur.js';

// ---- les hauteurs ----
const N2 = 6.6;                     // le plancher du 2e
const N3 = N2 + 3.1;                // celui du 3e (un étage courant, la tuile de la façade)
const DALLE3 = N3 - 0.2;            // le dessous de la dalle du 3e : les cloisons y montent
// (plan V2 du 11/10, retour de Haythem du 10/10 « les salles sont trop compressées » : les plafonds du jeu étaient trop
// hauts — 2,70 et 2,58 —, une pièce trop haute paraît étroite et courte. VO calée sur les travées de façade (1,65 m) :
// salle 2 à 2,26-2,49 (q_0322, q_0330), salle 1 à 2,38-2,46 (haut des trumeaux, q_0304), le haut des fenêtres à
// ≈ 0,15 m du plafond dans les deux salles ; couloir 2,39-2,58 (q_0300, q_0302), sas ≈ 2,45 au droit de la porte, q_0354)
const H_SALLE = N2 + 2.40;          // les dalles 60 x 60 des deux salles (VO : ≈ 2,40 m)
const H_COUL = N2 + 2.45;           // le plâtre lisse du couloir (VO : 2,39 à 2,58)
const H_PAL = N2 + 2.5;             // le plafond du palier (comme au 1er, photo 27 ; VO : > 2,42, hors cadre)
const H_SAS = N2 + 2.45, H_RET = N2 + 2.25;      // le sas et sa retombée côté porte
const EP = 0.12;                    // les cloisons
// ---- le plan ----
const Y_RUE = 4.59;                 // la cloison sud du couloir (nu côté couloir 4,65 ; côté salle 2 : 4,53)
const Y_COUR = 6.56;                // la cloison nord du couloir (nu côté couloir 6,50 ; côté salle 1 : 6,62)
const X_FOND = 3.24, X_BOUT = 15.96;            // les deux bouts du couloir (nus 3,30 et 15,90)
// (plan V2 : la salle 1 prend sa longueur de la VO — 9,35 m au lieu de 8,05. Calcul en faisceau sur q_0304, q_0309 et
// q_0313 — fenêtres, angle nord-ouest, pied et haut du mur ouest, 5,4 px — : mur ouest en x 3,6 ± 0,4, 1,45 m de mur
// aveugle avant la 1re fenêtre ; mur nord en y 11,55 avec un plafond à 2,40. L'escalier principal, jamais vu au-dessus
// du 1er, ne monte plus jusqu'ici : la salle 1 et le dégagement ouest couvrent son ancienne cage, plan_v2 § 1.3)
const X_S1 = 3.54, X_S1E = 13.01;               // la salle 1 (nus 3,60 et 12,95)
const Y_S1N = 11.70;                            // la façade arrière de la salle 1 (nu intérieur 11,55), x 3,5-13,0
const Y_ARR = 12.45, EP_ARR = 0.3;              // la façade arrière ailleurs : dégagement, palier (nu intérieur 12,30)
const X_S2 = 9.9, X_S2E = 18.21;                // la salle 2 (nus 9,96 et 18,15)
const Y_PAL = 7.9;                  // le mur sud du palier (nu côté palier 7,96)
const X_REC = 13.78;                // le nu du mur ouest du recoin de l'extincteur, au sud-ouest du palier (VO q_0285)
const X_SAS0 = 13.66, X_SAS1 = 15.56;           // les murs du sas (nus 13,72 et 15,50 ; relecture du 10/10, 88,0-88,7 s :
                                                // le mur ouest est à 0,55 m de la porte, la plaque noire carrée entre eux)
const X_ASC = 17.96, Y_VEST = 6.94;             // le vestibule de l'ascenseur : son mur du fond (nu 17,90), son mur sud
const X_PAN = 14.15;                // le mur du panneau (face est 14,225, comme au 1er)
const Y_FEN = 11.45;                // le milieu de la fenêtre du palier, dans le mur du panneau (VO q_0285-0287)
// ---- la façade sur rue : une fenêtre par travée (js/carte_ecole.js, js/ecole_matieres.js texEtage) ----
const TRAVEE = 1.65;
const centreTravee = (k) => 0.825 + (k - 1) * TRAVEE;
// les fenêtres de la salle 1 (façade arrière) : six de 0,88 x 1,10 m, allège 1,10, au pas de 1,35 depuis le mur est —
// trumeaux de 0,47 ; 1,47 m de mur aveugle à l'ouest de la première (faisceau q_0304-0313, e2x/bundle2.py)
const FEN_S1 = [5.51, 6.86, 8.21, 9.56, 10.91, 12.26], L_FEN_S1 = 0.88;
// le rectangle du plancher (lumière et ombre cuites, uv1 de 0 à 1, v = 1 au nord)
const R2 = { x0: -0.3, x1: 20.1, y0: -0.2, y1: 12.8 };

// =====================================================================
//  LES TEXTURES (dessinées : le 2e n'ajoute aucun fichier à charger)
// =====================================================================
const rgb = (r, g, b, a = 1) => `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a})`;
function graine(s) {
  let x = s >>> 0 || 1;
  return () => { x ^= x << 13; x >>>= 0; x ^= x >> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; };
}
const T = (n) => (TELEPHONE ? Math.max(64, n / 2) : n);
// UN SOL MOUCHETÉ (le lino taupe du couloir, VO q_0298-0303 ; le vinyle du palier, comme au 1er) : un fond à peine
// nuageux, des milliers de mouchetures de 2 à 4 mm (le dessin de js/ecole_est.js). Tuile : `tuile` m.
function texMouchete({ fond, taches, n, tuile = 1, graineN = 7, nuee = 7 }) {
  const w = T(512);
  return canvasTex(w, w, (g, W, H) => {
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
    const px = W / tuile / 1000;
    for (let k = 0; k < n; k++) {
      const [c, a] = taches[Math.floor(r2() * taches.length)], s = Math.max(1, (1.5 + r2() * 2.5) * px);
      g.fillStyle = rgb(c[0], c[1], c[2], a); g.fillRect(r2() * W, r2() * H, s, s * (0.6 + r2() * 0.8));
    }
  }, [1 / tuile, 1 / tuile], false, 8);
}
// LA MOQUETTE EN DALLES DE 50 x 50 posées en damier (VO q_0304-0313 : marine et anthracite ; q_0325-0337 : anthracite et
// gris foncé) : chaque dalle a son fil (des traits serrés dans un sens, croisés d'une dalle à l'autre), un joint à peine
// marqué. Tuile : 1 m (deux dalles sur deux).
function texMoquette(a, b, graineN) {
  const w = T(256);
  return canvasTex(w, w, (g, W, H) => {
    const r2 = graine(graineN), d = W / 2;
    for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
      const c = (i + j) % 2 ? b : a, x0 = i * d, y0 = j * d;
      g.fillStyle = rgb(c[0], c[1], c[2]); g.fillRect(x0, y0, d, d);
      for (let k = 0; k < 900; k++) {
        const v = (r2() - 0.5) * 26, x = x0 + r2() * d, y = y0 + r2() * d, L = 2 + r2() * 4;
        g.fillStyle = rgb(c[0] + v, c[1] + v, c[2] + v, 0.55);
        if ((i + j) % 2) g.fillRect(x, y, 1, L); else g.fillRect(x, y, L, 1);
      }
      g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(x0, y0, d, 1); g.fillRect(x0, y0, 1, d);
    }
  }, [1, 1], false, 8);
}
// LA PIERRE DES ÉTAGES (photos 11, 12) sans fenêtre : celle de js/ecole_etage1.js (le fond de la tuile texEtage), posée
// en coordonnées du monde, un panneau par demi-étage et par travée
function texPierreEtage() {
  const W = T(512), H = Math.round(W * 3.1 / TRAVEE);
  const t = canvasTex(W, H, (g, w, h) => {
    const r2 = graine(42);
    g.fillStyle = rgb(217, 218, 213); g.fillRect(0, 0, w, h);
    for (let j = 0; j < 2; j++) { const t0 = (r2() - 0.5) * 6; g.fillStyle = rgb(217 + t0, 218 + t0, 213 + t0, 0.6); g.fillRect(0, j * h / 2, w, h / 2); }
    for (let k = 0; k < 700; k++) { const v = 205 + (r2() - 0.5) * 36; g.fillStyle = rgb(v, v, v - 3, 0.25); g.fillRect(r2() * w, r2() * h, 1.3, 1.3); }
    for (let k = 0; k < 5; k++) {
      const x = r2() * w, y0 = (r2() < 0.5 ? 0 : h / 2), L = h * (0.1 + r2() * 0.25), gr = g.createLinearGradient(0, y0, 0, y0 + L);
      gr.addColorStop(0, 'rgba(160,158,150,0.22)'); gr.addColorStop(1, 'rgba(160,158,150,0)');
      g.fillStyle = gr; g.fillRect(x, y0, 2 + r2() * 4, L);
    }
    g.fillStyle = '#bdbdb8'; g.fillRect(0, h * 0.5 - 1, w, 2); g.fillRect(0, 0, w, 2); g.fillRect(w - 2, 0, 2, h);
  }, [1 / TRAVEE, 1 / 3.1], false, 8);
  t.offset.set(0, -N2 / 3.1);              // (la tuile part du plancher)
  return t;
}
// LE STRATIFIÉ HÊTRE des plateaux (VO : #d1b194 brut, à modéliser #d2ab86) : un fil fin et clair. Tuile : 1,2 m.
function texHetre() {
  return canvasTex(T(512), T(256), (g, w, h) => {
    const r2 = graine(907);
    g.fillStyle = '#d2ab86'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 220; k++) {
      const y = r2() * h, a = 0.04 + r2() * 0.1, c = r2() < 0.5 ? [170, 128, 88] : [232, 206, 170];
      g.strokeStyle = rgb(c[0], c[1], c[2], a); g.lineWidth = 0.6 + r2() * 1.4;
      g.beginPath(); g.moveTo(0, y);
      for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * 0.012 + k) * 1.5 + (r2() - 0.5));
      g.stroke();
    }
  }, [1 / 1.2, 1 / 0.6], false, 8);
}
// LE TABLEAU BLANC (VO c1_tableau, c2_tableau) : blanc émaillé, les traces grises d'un effacement
function texTableauBlanc() {
  return canvasTex(T(512), T(128), (g, w, h) => {
    const r2 = graine(613);
    g.fillStyle = '#eceee9'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 14; k++) {
      const x = r2() * w, y = r2() * h, R = 20 + r2() * 60, gr = g.createRadialGradient(x, y, 0, x, y, R);
      gr.addColorStop(0, 'rgba(160,166,172,0.10)'); gr.addColorStop(1, 'rgba(160,166,172,0)');
      g.fillStyle = gr; g.fillRect(x - R, y - R, 2 * R, 2 * R);
    }
  }, null, false, 4);
}
// LE JOUR DES FENÊTRES CÔTÉ COUR (VO q_0304-0309, crops/fenetres_c1 et fen_c1_225 ; q_0283-0287 la fenêtre du palier) :
// surexposé — un ciel blanc, et dans le bas, à peine, les toits et les façades d'en face, un garde-corps de terrasse
function texCielCour() {
  return canvasTex(T(256), T(256), (g, w, h) => {
    const d = g.createLinearGradient(0, 0, 0, h);
    d.addColorStop(0, '#f6f8fa'); d.addColorStop(0.6, '#eef2f5'); d.addColorStop(1, '#e2e7eb');
    g.fillStyle = d; g.fillRect(0, 0, w, h);
    const r2 = graine(311);
    for (let k = 0; k < 7; k++) {
      const x = r2() * w, bw = w * (0.12 + r2() * 0.25), top = h * (0.58 + r2() * 0.18);
      g.fillStyle = rgb(200 + r2() * 16, 206 + r2() * 14, 212 + r2() * 12, 0.75); g.fillRect(x - bw / 2, top, bw, h - top);
      g.fillStyle = 'rgba(150,160,170,0.35)';
      for (let y = top + 8; y < h - 6; y += 16) for (let xx = x - bw / 2 + 5; xx < x + bw / 2 - 8; xx += 13) g.fillRect(xx, y, 6, 7);
    }
    g.fillStyle = 'rgba(95,102,110,0.55)';
    for (let x = 6; x < w; x += 23) g.fillRect(x, h * 0.8, 2, h * 0.2);
    g.fillRect(0, h * 0.8, w, 2);
  }, null, false, 4);
}
// LE STORE BAISSÉ (les fenêtres des pièces fermées, vues de la rue) : lames verticales blanc cassé de 9 cm, leurs ombres
function texStoreFerme() {
  return canvasTex(64, 64, (g, w, h) => {
    const d = g.createLinearGradient(0, 0, w, 0);
    d.addColorStop(0, '#d9d7d0'); d.addColorStop(0.45, '#efeee9'); d.addColorStop(0.9, '#e2e0da'); d.addColorStop(1, '#b9b7b0');
    g.fillStyle = d; g.fillRect(0, 0, w, h);
  }, [1 / 0.09, 1], false, 4);
}
// LES STORES OUVERTS de la salle 1 (VO crops/fenetres_c1) : des lames verticales de 9 cm vues presque par la tranche —
// une bande claire de 2 cm et son ombre, tous les 9 cm, le jour entre elles (transparent : découpé). Tuile : 9 cm.
function texStoresOuverts() {
  const t = canvasTex(64, 16, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = '#e6e4de'; g.fillRect(4, 0, 12, h);
    g.fillStyle = '#a9a7a1'; g.fillRect(16, 0, 4, h);
    g.fillStyle = '#b8b8b4'; g.fillRect(0, 0, w, 1);
  }, [1 / 0.09, 1], true, 4);
  t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
}
// LE LUMINAIRE À GRILLE 60 x 60 (VO : grille argentée, quatre tubes ; celui du 1er, js/ecole_etage1.js texGrille)
function texGrille() {
  const W = T(256);
  return canvasTex(W, W, (g, w, h) => {
    const bord = w * 0.045, i0 = bord, L = w - 2 * bord;
    g.fillStyle = '#e9e8e4'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#5c5d60'; g.fillRect(i0, i0, L, L);
    for (let k = 0; k < 4; k++) {
      const cx = i0 + L * (k + 0.5) / 4, lg = L / 4, gr = g.createLinearGradient(cx - lg / 2, 0, cx + lg / 2, 0);
      gr.addColorStop(0, 'rgba(150,148,144,1)'); gr.addColorStop(0.5, 'rgba(255,253,246,1)'); gr.addColorStop(1, 'rgba(150,148,144,1)');
      g.fillStyle = gr; g.fillRect(cx - lg / 2, i0, lg, L);
      g.fillStyle = '#ffffff'; g.fillRect(cx - w * 0.022, i0, w * 0.044, L);
    }
    for (let k = 0; k <= 8; k++) { const y = i0 + L * k / 8; g.fillStyle = '#8c8d8f'; g.fillRect(i0, y - w * 0.012, L, w * 0.024); }
  }, null, false, 4);
}
// LE PANNEAU D'ÉTAGE « 2 » (VO 70-72 s, crops/panneau2_sharp) : noir mat, 65 x 21 cm, le bandeau vertical rouge
// vermillon de 6 cm et son « 2 » blanc dans la case du haut, trois lignes blanches séparées de filets, les numéros
// alignés à droite
function texPanneau2() {
  return canvasTex(1024, 331, (g, w, h) => {
    const b = Math.round(w * 6 / 65), police = (p, t) => `${p} ${t}px "Segoe UI", Arial, sans-serif`;
    g.fillStyle = '#2b2a28'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#b8461f'; g.fillRect(0, 0, b, h);
    g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(0, h / 3 - 1, b, 3); g.fillRect(0, 2 * h / 3 - 1, b, 3);
    g.fillStyle = '#f2efe9'; g.textBaseline = 'middle'; g.textAlign = 'center';
    g.font = police(500, 96); g.fillText('2', b / 2, h / 6 + 4);
    const lignes = [['Salles de cours', 'S 2.7 - S 2.8'], ['Salle Bjarne Stroustrup', 'Si 2.6'], ['Bureau des Conseillers', 'B 2.3']];
    lignes.forEach(([t, n], i) => {
      const y = h * (i + 0.5) / 3;
      g.font = police(500, 58); g.textAlign = 'left'; g.fillText(t, b + w * 0.03, y + 2);
      g.font = police(600, 58); g.textAlign = 'right'; g.fillText(n, w * 0.972, y + 2);
      if (i) { g.fillStyle = 'rgba(242,239,233,0.28)'; g.fillRect(b + w * 0.02, h * i / 3 - 1, w - b - w * 0.04, 2); g.fillStyle = '#f2efe9'; }
    });
  }, null, false, 8);
}
// UNE PLAQUE DE PORTE DU 2e (VO crops/plaque_c1, plaque_c2 : noire, 20 x 11 cm, deux lignes — la longue, puis le numéro)
function texPlaque2(l1, l2) {
  return canvasTex(320, 176, (g, w, h) => {
    g.fillStyle = '#2a2826'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#f2f1ee'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    const ligne = (t, y, poids, taille) => {
      let s = taille;
      do { g.font = `${poids} ${s}px "Segoe UI", Arial, sans-serif`; s -= 1; } while (g.measureText(t).width > w * 0.86 && s > 12);
      g.fillText(t, w / 2, y);
    };
    ligne(l1, h * 0.43, 500, 40); ligne(l2, h * 0.8, 600, 48);
  }, null, false, 4);
}
// LA PHOTO ENCADRÉE TURQUOISE du mur sud du couloir, face au sas (VO q_0292-0295) : cadre blanc mince, une photo bleu-vert,
// un cartouche blanc en bas à gauche, un petit logo en bas à droite
// (relecture du 10/10, 73,1-73,6 s à 25 i/s : la « silhouette au bonnet rose » est le reflet du cadreur dans le verre — elle
// bouge avec lui, à côté du reflet d'un spot ; la photo elle-même : un haut turquoise, une bande gris lavande en bas, sous
// une ligne d'horizon, quelques formes floues)
function texPhotoTurquoise() {
  return canvasTex(256, 352, (g, w, h) => {
    g.fillStyle = '#f4f4f2'; g.fillRect(0, 0, w, h);
    const m = 12, d = g.createLinearGradient(0, m, 0, h - m);
    d.addColorStop(0, '#78c4c1'); d.addColorStop(0.5, '#7fb9b6'); d.addColorStop(0.58, '#9fb4b9'); d.addColorStop(0.62, '#8e93ad'); d.addColorStop(1, '#868aa6');
    g.fillStyle = d; g.fillRect(m, m, w - 2 * m, h - 2 * m);
    const r2 = graine(77);
    for (let k = 0; k < 18; k++) { g.fillStyle = `rgba(255,255,255,${0.04 + r2() * 0.06})`; g.beginPath(); g.arc(m + r2() * (w - 2 * m), m + r2() * (h - 2 * m) * 0.55, 6 + r2() * 26, 0, 7); g.fill(); }
    // le bas : des formes sombres floues (des façades, une silhouette lointaine), un liseré clair sur l'horizon
    g.fillStyle = 'rgba(225,235,238,0.55)'; g.fillRect(m, h * 0.6 - 1, w - 2 * m, 2);
    g.filter = 'blur(3px)';
    for (const [x, y, lw, lh] of [[0.18, 0.66, 0.1, 0.05], [0.33, 0.68, 0.06, 0.08], [0.62, 0.64, 0.05, 0.16], [0.75, 0.7, 0.12, 0.04]]) {
      g.fillStyle = 'rgba(60,66,88,0.3)'; g.fillRect(w * x, h * y, w * lw, h * lh);
    }
    g.filter = 'none';
    g.fillStyle = '#ffffff'; g.fillRect(m + 8, h - m - 40, w * 0.42, 30);
    g.fillStyle = '#9aa0a6'; g.fillRect(m + 14, h - m - 32, w * 0.3, 5); g.fillRect(m + 14, h - m - 22, w * 0.22, 5);
    g.fillStyle = '#ffffff'; g.font = '600 15px "Century Gothic", "Segoe UI", sans-serif'; g.fillText('iris', w - m - 34, h - m - 12);
  }, null, false, 4);
}
// L'AFFICHE A2 À BANDEAU ROUGE ORANGÉ du mur sud du couloir (VO q_0297-0303) : un titre blanc sur le bandeau, du texte
function texAfficheRouge() {
  return canvasTex(256, 362, (g, w, h) => {
    g.fillStyle = '#faf8f3'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#d9512c'; g.fillRect(0, 0, w, 88);
    g.fillStyle = '#ffffff'; g.font = '800 26px "Segoe UI", Arial, sans-serif'; g.fillText('RÈGLEMENT', 18, 40); g.fillText('INTÉRIEUR', 18, 70);
    const r2 = graine(19);
    g.fillStyle = '#4a4a4f';
    for (let y = 112; y < h - 24; y += 13) g.fillRect(18, y, (0.55 + r2() * 0.35) * (w - 36), 5);
  }, null, false, 4);
}
// L'AFFICHE A3 JAUNE PÂLE du mur rouge, face à la porte de la salle 2 (VO q_0338-0345) : des pictogrammes colorés (violet,
// bleu, jaune) et du texte en colonnes — une affiche d'information iris
function texAfficheA3() {
  return canvasTex(256, 362, (g, w, h) => {
    g.fillStyle = '#fff5d6'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#3b2a6b'; g.font = '800 22px "Segoe UI", Arial, sans-serif'; g.fillText('BIEN VIVRE', 18, 34); g.fillText('À L’ÉCOLE', 18, 58);
    const cols = ['#6b3fa0', '#2f6fb0', '#e8b21e', '#d0502c', '#3e9b6b', '#6b3fa0'];
    cols.forEach((c, i) => {
      const x = 22 + (i % 2) * 118, y = 86 + Math.floor(i / 2) * 86;
      g.fillStyle = c; g.beginPath(); g.arc(x + 18, y + 18, 17, 0, 7); g.fill();
      g.fillStyle = '#ffffff'; g.fillRect(x + 10, y + 15, 16, 6);
      g.fillStyle = '#6d6a64'; for (let k = 0; k < 4; k++) g.fillRect(x + 42, y + 6 + k * 10, 60 - (k % 2) * 16, 4);
    });
    g.fillStyle = '#111'; g.fillRect(w - 70, h - 34, 56, 22);
    g.fillStyle = '#fff'; g.font = '600 15px "Century Gothic", "Segoe UI", sans-serif'; g.fillText('iris', w - 56, h - 17);
  }, null, false, 4);
}
// LA PLAQUE VERTE du mur sud du palier, à l'est de la porte (VO 72,6 s : verticale, 20 x 35 cm — une consigne)
function texPlaqueVerte() {
  return canvasTex(128, 224, (g, w, h) => {
    g.fillStyle = '#16955a'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#ffffff'; g.lineWidth = 4; g.strokeRect(6, 6, w - 12, h - 12);
    g.fillStyle = '#ffffff';
    g.beginPath(); g.arc(w / 2, 46, 13, 0, 7); g.fill(); g.fillRect(w / 2 - 9, 62, 18, 46);
    g.fillRect(w / 2 - 30, 70, 60, 8);
    for (let k = 0; k < 5; k++) g.fillRect(18, 132 + k * 16, w - 36 - (k % 2) * 20, 6);
  }, null, false, 2);
}
// LE PETIT PICTOGRAMME ROUGE ET BLEU (le déclencheur d'alarme, VO 71,7 s)
function texPictoAlarme() {
  return canvasTex(64, 64, (g, w, h) => {
    g.fillStyle = '#d0262d'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffffff'; g.fillRect(10, 10, w - 20, h - 20);
    g.fillStyle = '#2b4c9b'; g.beginPath(); g.arc(w / 2, h / 2, 12, 0, 7); g.fill();
    g.fillStyle = '#d0262d'; g.fillRect(w / 2 - 3, h / 2 - 8, 6, 16);
  }, null, false, 2);
}
// LE PLAN D'ÉVACUATION sous verre du sas (VO sheets/z_500_9 : un grand cadre noir, verre clair — on n'y voit qu'un fond
// pâle et des traits) : le plan de l'étage au trait gris, le « vous êtes ici » rouge, les issues vertes
function texPlanEvacuation() {
  return canvasTex(256, 448, (g, w, h) => {
    g.fillStyle = '#f3f2ee'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#2f6b45'; g.fillRect(14, 14, w - 28, 26);
    g.fillStyle = '#fff'; g.font = '700 15px "Segoe UI", Arial, sans-serif'; g.fillText('PLAN D’ÉVACUATION · 2e', 22, 32);
    g.strokeStyle = '#8a8d90'; g.lineWidth = 3; g.strokeRect(26, 70, w - 52, 230);
    g.lineWidth = 2; g.beginPath(); g.moveTo(26, 170); g.lineTo(w - 26, 170); g.moveTo(26, 205); g.lineTo(w - 26, 205);
    g.moveTo(120, 70); g.lineTo(120, 170); g.moveTo(150, 205); g.lineTo(150, 300); g.moveTo(190, 70); g.lineTo(190, 170); g.stroke();
    g.fillStyle = '#21a35a'; g.fillRect(30, 178, 14, 20); g.fillRect(w - 44, 120, 14, 22);
    g.fillStyle = '#d0262d'; g.beginPath(); g.arc(205, 188, 7, 0, 7); g.fill();
    g.fillStyle = '#9aa0a6'; for (let k = 0; k < 7; k++) g.fillRect(26, 330 + k * 14, 120 + (k % 3) * 30, 6);
  }, null, false, 4);
}
// LE RANGE-DOCUMENTS MURAL de la salle 2 (VO q_0328-0336) : noir, six cases, des étiquettes claires
function texRangeDocs() {
  return canvasTex(64, 224, (g, w, h) => {
    g.fillStyle = '#18181a'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 6; k++) {
      const y = 6 + k * (h - 12) / 6;
      g.fillStyle = '#2b2b2e'; g.fillRect(4, y + 4, w - 8, (h - 12) / 6 - 8);
      g.fillStyle = '#d8d4c8'; g.fillRect(16, y + 10, w - 32, 7);
      if (k % 2) { g.fillStyle = '#f2f2ee'; g.fillRect(8, y + 22, w - 16, 6); }
    }
  }, null, false, 2);
}

// =====================================================================
//  LES OUTILS (coordonnées du PLAN, hauteurs absolues)
// =====================================================================
// une boîte dont les UV sont celles du monde (les peintures, la pierre : leur motif ne saute pas d'un morceau à l'autre)
function geoMonde(x0, y0, x1, y1, h0, h1) {
  const w = Math.abs(x1 - x0), d = Math.abs(y1 - y0), h = h1 - h0;
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate((x0 + x1) / 2, (h0 + h1) / 2, -(y0 + y1) / 2);
  const p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), nx = n.getX(i), ny = n.getY(i), nz = n.getZ(i);
    if (Math.abs(nx) > 0.5) uv.setXY(i, -z * Math.sign(nx), y);
    else if (Math.abs(ny) > 0.5) uv.setXY(i, x, -z);
    else uv.setXY(i, x * Math.sign(nz), y);
  }
  return g;
}
// un plan rectangulaire arrondi, extrudé (assises, dossiers, plateaux) ; `trous` : des perçages ronds [[x, y, r]]
function geoPlaque(w, d, e, r, trous = []) {
  const s = new THREE.Shape(), x = -w / 2, y = -d / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + d - r);
  s.quadraticCurveTo(x + w, y + d, x + w - r, y + d); s.lineTo(x + r, y + d); s.quadraticCurveTo(x, y + d, x, y + d - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  for (const [tx, ty, tr] of trous) { const p = new THREE.Path(); p.absarc(tx, ty, tr, 0, Math.PI * 2, true); s.holes.push(p); }
  const g = new THREE.ExtrudeGeometry(s, { depth: e, bevelEnabled: true, bevelThickness: Math.min(0.004, e / 3), bevelSize: Math.min(0.004, e / 3), bevelSegments: 1, curveSegments: 6 });
  g.translate(0, 0, -e / 2);
  g.rotateX(-Math.PI / 2);
  return g;
}
// le sol d'un niveau : des rectangles du plan à la hauteur `h`, UV en mètres, uv1 sur le rectangle `R` (v = 1 au nord)
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
const DIR = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };      // la direction (monde) d'une face du plan
const ROT = { S: 0, N: Math.PI, E: Math.PI / 2, W: -Math.PI / 2 };   // la rotation d'un groupe dont le +z local y regarde

export function poserEtage2(ch, renderer = null) {
  const { C, M } = ch, E = EST, t0 = performance.now();
  const groupe = new THREE.Group(); groupe.name = '2e étage';
  ch.scene.add(groupe);
  // le décor fixe (cousu à la fin) à part des portes automatiques (leurs vantaux tournent)
  const fixe = new THREE.Group(); fixe.name = '2e étage (fixe)'; groupe.add(fixe);
  const decor0 = ch.decor, portes0 = ch.portes.decor;
  ch.decor = fixe; ch.portes.decor = groupe;

  // ---- les matières du 2e ----
  const std = (o, nom) => { const m = new THREE.MeshStandardMaterial(o); if (nom) m.name = nom; return m; };
  const X = {
    // (le rouge vermillon du couloir : VO brut #c24e35-#e5654c, rééquilibré sur le blanc voisin, etage2.md § 4 ; relecture
    // du 10/10 : son albédo relevé côte à côte avec q_0340, js/ecole_est.js ROUGE_2E)
    rouge: std({ map: texPeinture(ROUGE_2E, 4), roughness: 0.6 }, 'peinture rouge vermillon (couloir du 2e)'),
    // (les sols : une rugosité à eux — l'optimisation du décor ne doit pas les confondre, ils ont leur lumière cuite)
    // (10/10, côte à côte avec q_0299 : #9a8a7a sortait rose pâle sous les spots chauds — un taupe plus sombre et plus gris)
    // (relecture du 10/10 : la carte d'environnement du couloir ne vire plus au saumon — le lino sortait alors #8d755a, plus
    // sombre et plus jaune que la vidéo, q_0299 #ae8d7e : un peu plus clair, un peu plus froid)
    lino: std({ map: texMouchete({ fond: [142, 128, 120], taches: [[[174, 163, 155], 0.7], [[98, 88, 82], 0.75], [[124, 112, 105], 0.6]], n: 8000, graineN: 23 }), roughness: 0.401 }, 'lino taupe du 2e'),
    // (10/10, relecture côte à côte avec q_0283 : le vinyle sortait beige ; il est gris-brun, plus sombre que le lino)
    vinyle: std({ map: texMouchete({ fond: [102, 97, 92], taches: [[[134, 128, 120], 0.6], [[70, 66, 62], 0.7], [[150, 145, 138], 0.3]], n: 8000, graineN: 29 }), roughness: 0.551 }, 'vinyle du palier du 2e'),
    tapis: std({ color: 0x3b3b3d, roughness: 0.92 }, 'tapis anthracite (palier du 2e)'),
    // (10/10, q_0305 et q_0331 : la marine est éteinte, presque grise ; le damier de la salle 2 à peine marqué)
    moquette1: std({ map: texMoquette([40, 43, 60], [54, 55, 61], 5), roughness: 0.971 }, 'moquette marine (salle 1 du 2e)'),
    moquette2: std({ map: texMoquette([50, 49, 51], [63, 60, 60], 6), roughness: 0.962 }, 'moquette anthracite (salle 2 du 2e)'),
    pierre: jourDehors(std({ map: texPierreEtage(), roughness: 0.75 }, 'pierre de la façade (2e)'), 0.1),
    enduit: jourDehors(std({ color: 0xd8d6cf, roughness: 0.92 }, 'enduit de la façade arrière'), 0.12),
    plinthe: std({ color: 0x6e6358, roughness: 0.5 }, 'plinthe taupe foncé (couloir du 2e)'),
    plinthePal: std({ color: 0x5b544d, roughness: 0.5 }, 'plinthe gris foncé (palier du 2e)'),
    plintheSalle: std({ color: 0x3e3d3c, roughness: 0.5 }, 'plinthe des salles du 2e'),
    taupe: std({ color: 0xa39d94, roughness: 0.45 }, 'vantail gris taupe (2e)'),
    // (relecture du 10/10 : le vantail de la porte coupe-feu, gris clair à peine chaud sur la vidéo, 88,3 s : #b9b3ac)
    grisCF: std({ color: 0xaaa9a6, roughness: 0.45 }, 'vantail gris clair (coupe-feu du 2e)'),
    boisBrun: std({ color: 0x6e4a2c, roughness: 0.5 }, 'huisserie de bois brun'),
    hetre: std({ map: texHetre(), roughness: 0.42 }, 'stratifié hêtre (tables du 2e)'),
    coque1: std({ color: 0xc89a5c, roughness: 0.5 }, 'coque de hêtre (salle 1)'),
    coque2: std({ color: 0xc49464, roughness: 0.5 }, 'coque de hêtre (salle 2)'),
    marine: std({ color: 0x1f2638, roughness: 0.5, metalness: 0.3 }, 'pieds bleu marine'),
    chrome: std({ color: 0xc9cbcd, roughness: 0.22, metalness: 0.9 }, 'tube chromé'),
    noir: std({ color: 0x1b1b1c, roughness: 0.5, metalness: 0.3 }, 'tube noir'),
    similiNoir: std({ color: 0x1d1d1f, roughness: 0.75 }, 'simili noir'),
    anthracite: std({ color: 0x4a4650, roughness: 0.45, metalness: 0.2 }, 'menuiserie anthracite (palier du 2e)'),
    tableau: std({ map: texTableauBlanc(), roughness: 0.16 }, 'tableau blanc (2e)'),
    blancMeuble: std({ color: 0xeeeeea, roughness: 0.4 }, 'plastique blanc'),
    ecran: std({ color: 0x0d0e10, roughness: 0.25, metalness: 0.3 }, 'écran noir'),
    extincteur: std({ color: 0xc81e24, roughness: 0.35, metalness: 0.2 }, 'extincteur'),
    laiton: std({ color: 0xb08d4a, roughness: 0.35, metalness: 0.8 }, 'paumelle laiton'),
    beton: std({ color: 0xe6e4df, roughness: 0.85 }, 'béton peint (dalle du 2e)'),
  };
  detailPhoto(X.rouge, 'beton', 1, 1, { relief: 0.035, grain: 0, rugo: false });
  // le jour des fenêtres côté cour (non éclairé : il éclaire) et la vitre vue de dehors
  const ciel = new THREE.MeshBasicMaterial({ map: texCielCour(), color: new THREE.Color(1.12, 1.14, 1.17) }); ciel.name = 'le jour côté cour';
  const vitreDehors = new THREE.MeshStandardMaterial({ color: 0x4d5862, roughness: 0.05, metalness: 0.6, transparent: true, opacity: 0.55, depthWrite: false, envMapIntensity: 1.5 });
  vitreDehors.name = 'vitre du 2e vue de dehors';
  const storeFerme = new THREE.MeshStandardMaterial({ map: texStoreFerme(), roughness: 0.7 }); storeFerme.name = 'store baissé';
  const storesOuverts = new THREE.MeshStandardMaterial({ map: texStoresOuverts(), roughness: 0.7, alphaTest: 0.5, side: THREE.DoubleSide }); storesOuverts.name = 'stores à lamelles ouverts';
  const matDalle = new THREE.MeshBasicMaterial({ map: texGrille(), color: new THREE.Color(0xfff1dc).multiplyScalar(1.75) }); matDalle.name = 'luminaire à grille allumé (2e)';
  const matPan = (tex, rugo = 0.45) => new THREE.MeshStandardMaterial({ map: tex, roughness: rugo });
  // le verre dépoli des portes des salles et de l'imposte (celui des jours de souffrance du rez-de-chaussée, vu des deux côtés)
  const depoli = M.depoli.clone(); depoli.side = THREE.DoubleSide; depoli.name = 'verre dépoli (portes du 2e)';
  // (relecture du 10/10, q_0315-0318 : le verre de la porte D1 est gris vert, plus sombre que l'enduit — #819391 — ; le
  // menthe clair du rez-de-chaussée en faisait une porte blanche pleine)
  depoli.color.setHex(0xa4b8b0); depoli.emissive.setHex(0x86998f); depoli.emissiveIntensity = 0.12;
  // la tuile des étages de la façade sur rue, posée sur la façade arrière en UV du monde : recalée sur les planchers
  const etageArr = M.etage.clone(), tEt = M.etage.map.clone(); tEt.offset.set(0, -3.5 / 3.1); tEt.needsUpdate = true;
  etageArr.map = tEt; etageArr.emissiveMap = tEt; etageArr.name = 'étages de la façade arrière';

  const lampes = [];                                    // les lampes du 2e (cuites sur ses sols)
  const sieges = [];
  const sols = [];                                      // ses sols (lumière et ombre cuites)

  // UNE BOÎTE (plan, hauteurs absolues), UV du monde
  const B = (x0, y0, x1, y1, h0, h1, mat, { ombre = true, collision = false, camera = true, parent = fixe } = {}) => {
    const m = new THREE.Mesh(geoMonde(Math.min(x0, x1), Math.min(y0, y1), Math.max(x0, x1), Math.max(y0, y1), h0, h1), mat);
    m.castShadow = ombre; m.receiveShadow = true; parent.add(m);
    if (collision) C.ajouterBoite(x0, -y0, x1, -y1, { y0: h0, y1: h1, camera });
    return m;
  };
  const panneau = (mat, w, h, x, y, hc, face) => ch.panneau(mat, w, h, x, y, hc, face, fixe);
  // UN MUR DU 2e de (x0, y0) à (x1, y1), parallèle à un axe : comme celui de l'étage (js/ecole_etage1.js), ses plinthes
  // sur le plancher du 2e, chacune de sa matière : `plinthes` [[face, matière]]
  const mur = ({ de, a, ep = EP, base = N2, h = DALLE3, mats, plinthes = [], ouvertures = [], camera = true }) => {
    const [x0, y0] = de, [x1, y1] = a;
    const axeX = Math.abs(x1 - x0) >= Math.abs(y1 - y0);
    const debut = axeX ? Math.min(x0, x1) : Math.min(y0, y1), fin = axeX ? Math.max(x0, x1) : Math.max(y0, y1);
    const ligne = axeX ? y0 : x0;
    const ouv = ouvertures.map((o) => ({ a0: Math.max(debut, o.c - o.l / 2), a1: Math.min(fin, o.c + o.l / 2), bas: o.bas ?? base, haut: Math.min(h, o.h ?? base + 2.04) }))
      .sort((p, q) => p.a0 - q.a0);
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
      if (!deux) B(bx0, by0, bx1, by1, p.y0, p.y1, mat(cotes[0]), { ombre: false });
      else {
        const [ax0, ay0, ax1, ay1] = R(0, ep / 2), [cx0, cy0, cx1, cy1] = R(-ep / 2, 0);
        B(ax0, ay0, ax1, ay1, p.y0, p.y1, mat(cotes[0]), { ombre: false });
        B(cx0, cy0, cx1, cy1, p.y0, p.y1, mat(cotes[1]), { ombre: false });
      }
      if (p.y0 <= base + 0.001) {
        for (const [c, pm] of plinthes) {
          const s = c === cotes[0] ? 1 : -1, v = s * (ep / 2 + 0.0075);
          const [px0, py0, px1, py1] = R(v - 0.0075, v + 0.0075);
          B(px0, py0, px1, py1, base, base + 0.08, pm, { ombre: false });
        }
      }
    }
  };
  // une plinthe seule (le long d'un mur posé par un autre, ou d'une partie de mur) : de (x0, y0) à (x1, y1), au sol
  const plinthe = (x0, y0, x1, y1, mat) => B(x0, y0, x1, y1, N2, N2 + 0.08, mat, { ombre: false });

  // UNE LAMPE du 2e : `base` son plancher (visée des spots, tri des voisines), cuite sur les sols du 2e seulement
  const opts = (o = {}) => ({ base: N2, cuire: false, ...o });
  const noter = () => lampes.push(ch.lampes[ch.lampes.length - 1]);
  const spot = (x, y, h, zone, o = {}) => { ch.spot(x, y, h, zone, opts(o)); noter(); };
  const opale = (x, y, h, zone, o = {}) => { ch.opale(x, y, h, zone, opts(o)); noter(); };
  const lampe = (L) => { const l = opts(L); ch.lampes.push(l); lampes.push(l); return l; };
  // LE LUMINAIRE À GRILLE 60 x 60 des salles (VO q_0304-0337 : grille argentée, deux lignes)
  const dalle = (x, y, zone) => {
    B(x - 0.31, y - 0.31, x + 0.31, y + 0.31, H_SALLE - 0.012, H_SALLE + 0.02, M.boitier, { ombre: false });
    const d = maille(new THREE.PlaneGeometry(0.58, 0.58), matDalle, x, H_SALLE - 0.0125, -y, 0, fixe, { ombre: false, recoit: false });
    d.rotation.x = Math.PI / 2;
    lampe({ x, z: -y, h: H_SALLE, zone, type: 'dalle', force: 1.05 });
  };
  // LE DIFFUSEUR LINÉAIRE À FENTES (VO : deux par salle, entre les luminaires) : une bande sombre de 1,2 m
  const fente = (x0, x1, y) => {
    B(x0, y - 0.06, x1, y + 0.06, H_SALLE - 0.004, H_SALLE + 0.01, M.ossature, { ombre: false });
    for (const dy of [-0.025, 0.025]) B(x0 + 0.03, y + dy - 0.008, x1 - 0.03, y + dy + 0.008, H_SALLE - 0.006, H_SALLE, M.noirMat, { ombre: false });
  };
  // LA RÉGLETTE FLUORESCENTE MURALE (comme au 1er, photo 28) contre un mur nord-sud qui regarde `face`
  const _diffuseur = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffe4b8).multiplyScalar(2.4) });
  const _embout = std({ color: 0xe8701e, roughness: 0.5, emissive: 0xe8701e, emissiveIntensity: 0.5 });
  const reglette = (x, y0, y1, h, face) => {
    const s = face === 'E' ? 1 : -1;
    B(x, y0, x + s * 0.085, y1, h - 0.03, h + 0.04, X.blancMeuble, { ombre: false });
    B(x + s * 0.012, y0 + 0.03, x + s * 0.092, y1 - 0.03, h - 0.045, h - 0.03, _diffuseur, { ombre: false });
    B(x + s * 0.085, y0 + 0.03, x + s * 0.092, y1 - 0.03, h - 0.03, h + 0.03, _diffuseur, { ombre: false });
    for (const [a, b] of [[y0, y0 + 0.03], [y1 - 0.03, y1]]) B(x, a, x + s * 0.095, b, h - 0.05, h + 0.045, _embout, { ombre: false });
  };
  // L'EXTINCTEUR (6 kg, rouge) posé bas contre un mur, ses pictogrammes au-dessus
  const extincteur = (x, y, face, h0 = 0.1) => {
    const g = new THREE.Group(); g.position.set(x, N2 + h0, -y); g.rotation.y = ROT[face]; fixe.add(g);
    maille(new THREE.CylinderGeometry(0.08, 0.08, 0.5, 16), X.extincteur, 0, 0.25, 0.1, 0, g);
    maille(new THREE.CylinderGeometry(0.03, 0.05, 0.08, 12), M.noirMat, 0, 0.54, 0.1, 0, g, { ombre: false });
    maille(boiteM(0.12, 0.03, 0.03), M.noirMat, 0.03, 0.6, 0.1, 0, g, { ombre: false });
    const t = maille(new THREE.CylinderGeometry(0.008, 0.008, 0.42, 6), M.noirMat, -0.09, 0.32, 0.12, 0, g, { ombre: false }); t.rotation.z = 0.15;
    maille(boiteM(0.06, 0.12, 0.02), M.noirMat, 0, 0.42, 0.01, 0, g, { ombre: false });      // le support mural
  };

  // =====================================================================
  //  LA CAGE AU-DESSUS DU 2e (js/ecole_est.js) : murs, volées 5 à 7, échiffre rouge, mains courantes, portillon
  // =====================================================================
  function construireCage() {
    poserCageHaute(ch, { groupe: fixe });
  }

  // =====================================================================
  //  LE PALIER DU 2e (VO 70-72 s, q_0281-0291 ; crops/panneau2_*, fenetre_palier2, g140, g152)
  // =====================================================================
  function construirePalier() {
    const B0 = M.blanc, P = X.plinthePal;
    // LA DALLE (de 6,40 au plancher) : son chant est vu du palier du 1er, au-dessus de son plafond
    B(13.55, Y_PAL, E.x0, Y_ARR, N2 - 0.2, N2 - 0.005, X.beton, { ombre: false });
    B(E.x0, Y_VEST, X_ASC, 9.0, N2 - 0.2, N2 - 0.005, X.beton, { ombre: false });
    // LE MUR DU PANNEAU (face est x 14,225, de y 8,6 à la façade arrière), son retour au sud (y 8,65) et le recoin de
    // l'extincteur (mur ouest, nu X_REC) ; le mur sud du palier (y 7,9), percé de la porte coupe-feu
    mur({ de: [X_PAN, 8.59], a: [X_PAN, Y_ARR - EP_ARR / 2], ep: 0.15, mats: B0, plinthes: [['E', P]], ouvertures: [{ c: Y_FEN, l: 0.75, bas: N2 + 1.0, h: N2 + 2.25 }] });
    mur({ de: [X_REC, 8.65], a: [14.075, 8.65], mats: B0, plinthes: [['S', P]] });
    mur({ de: [X_REC - EP / 2, Y_PAL - 0.06], a: [X_REC - EP / 2, 8.71], mats: B0, plinthes: [['E', P]] });
    // (l'ouverture de la porte coupe-feu à 2,05 m : côté sas, le vantail affleure sous l'enduit, sans jour au-dessus)
    mur({ de: [13.49, Y_PAL], a: [E.x0 + 0.06, Y_PAL], mats: B0, plinthes: [['N', P], ['S', X.plinthe]], ouvertures: [{ c: 14.75, l: 0.95, h: N2 + 2.05 }] });
    // LE VESTIBULE DE L'ASCENSEUR (x 16,05-17,9, y 6,94-9,0 : la bande sud du 1er, au-dessus — non vu) : son mur ouest, son
    // mur sud, et au fond, en x 17,9, la PORTE PALIÈRE (intégration du 10/10, js/ecole_ascenseur.js) : la gaine est la même
    // qu'au 1er — la façade de y 7,43 à 9,0, le passage en 8,0-8,81 —, un retour de mur la borde au sud (au 1er, le
    // doublage), la platine d'appel est sur le mur de la cage ; le 2e est desservi (la cabine va du rez-de-chaussée au 2e)
    mur({ de: [E.x0 + 0.06, Y_VEST - 0.06], a: [E.x0 + 0.06, Y_PAL - 0.06], mats: B0, plinthes: [['E', P]] });
    mur({ de: [E.x0, Y_VEST], a: [X_ASC + 0.06, Y_VEST], mats: B0, plinthes: [['N', P]] });
    mur({ de: [X_ASC, Y_VEST - 0.06], a: [X_ASC, ASC.yS1], mats: B0, plinthes: [['W', P]] });
    poserAscenseur(ch, { base: N2, groupe, ouvert: true, hMur: H_PAL, zone: 'e2palier', bouton: 'N' });
    // LE SOL : le vinyle du palier (le même qu'au 1er, photo 28), du recoin au vestibule ; le tapis devant le mur du panneau
    const vin = new THREE.Mesh(geoDalles([[X_REC - EP / 2, Y_PAL, X_PAN, 8.65], [X_PAN, Y_PAL, E.x0, Y_ARR], [E.x0, Y_VEST, X_ASC, 9.0]], N2, R2), X.vinyle);
    vin.receiveShadow = true; vin.name = 'vinyle du palier du 2e'; vin.userData.solE2 = true; fixe.add(vin); sols.push(X.vinyle);
    B(14.8, 9.05, 15.4, 10.65, N2, N2 + 0.008, X.tapis, { ombre: false });
    // LE PANNEAU « 2 » (centre y 9,3 à 1,70 m), la réglette au-dessus (de son milieu à 1,26 m au-delà, 2,12 m), le poussoir
    // et la prise à l'aplomb (y 9,92) — les cotes du 1er, sans l'affichette WIFI ni POINT ÉCOUTE (VO q_0283-0287)
    const xf = X_PAN + 0.075;
    panneau(matPan(texPanneau2(), 0.5), 0.65, 0.21, xf + 0.006, 9.3, N2 + 1.7, 'E');
    B(xf, 8.97, xf + 0.005, 9.63, N2 + 1.59, N2 + 1.81, M.noirMat, { ombre: false });
    reglette(xf, 9.27, 10.53, N2 + 2.12, 'E');
    lampe({ x: xf + 0.25, z: -9.9, h: N2 + 2.12, zone: 'e2palier', type: 'tube', force: 1.1 });
    B(xf, 9.88, xf + 0.012, 9.96, N2 + 1.11, N2 + 1.19, M.boitier, { ombre: false });
    B(xf + 0.012, 9.892, xf + 0.04, 9.948, N2 + 1.122, N2 + 1.178, M.boitier, { ombre: false });
    B(xf + 0.04, 9.9, xf + 0.043, 9.94, N2 + 1.128, N2 + 1.164, M.noirMat, { ombre: false });
    B(xf, 9.88, xf + 0.018, 9.96, N2 + 0.21, N2 + 0.29, M.boitier, { ombre: false });
    B(xf + 0.018, 9.905, xf + 0.021, 9.935, N2 + 0.235, N2 + 0.265, M.noirMat, { ombre: false });
    // LE RECOIN SUD-OUEST : l'extincteur au sol, ses deux pictogrammes au-dessus (rouge à 1,9 m, rouge et bleu à 1,35 m)
    // (relecture du 10/10, 71,6-72,6 s à 25 i/s, contraste poussé : en tournant vers la porte, on voit de gauche à droite
    // l'ouverture du sas, un pan blanc frontal de 0,7 m (le mur sud, à l'ouest de la porte), un angle rentrant, puis le mur
    // de l'extincteur, de face quand on regarde l'ouest (q_0285) et fuyant quand on regarde le sud (q_0290) : le mur OUEST
    // du recoin, comme le relevé — l'extincteur est au pied de ce mur, contre l'angle sud-ouest)
    // (plan V2 : ce mur est en x 13,78 — q_0285, son pied ; 72,1 s, le pan blanc entre la porte et l'angle fait ≈ 0,5 m et
    // non 0,725 : le recoin est un peu plus petit, l'extincteur et ses pictogrammes suivent)
    extincteur(X_REC + 0.02, 8.12, 'E');
    panneau(matPan(texPictoExtincteur(), 0.5), 0.15, 0.15, X_REC + 0.003, 8.12, N2 + 1.9, 'E');
    panneau(matPan(texPictoAlarme(), 0.5), 0.1, 0.1, X_REC + 0.003, 8.12, N2 + 1.35, 'E');
    // LA PORTE COUPE-FEU (VO q_0288-0292, g140, g152 ; 88,3 s vue du couloir) : un vantail de 0,95 m, gonds à l'est, qui
    // s'ouvre vers le palier (on la tire du palier, on la pousse du couloir) — bâton inox, oculus étroit cerclé de bois côté
    // serrure (ouest), étiquette rouge, ferme-porte côté sas, une feuille A4 côté couloir ; l'huisserie de bois brun
    // moulurée ; le bloc de sortie au-dessus, des deux côtés
    // (relecture du 10/10, 88,0-88,7 s à 25 i/s, contraste poussé : CÔTÉ SAS, ni huisserie de bois ni étiquette rouge ni
    // bâton — le vantail gris clair affleure dans l'enduit blanc, une béquille inox sous l'oculus ; le bâton, l'étiquette
    // et le bois sont côté palier seulement. Le gris taupe sortait brun sous les spots chauds : un gris plus froid)
    // (plan V2 du 11/10, etage2.md § 5 : automatique, le vantail s'ouvrait à 83° vers le palier et restait dressé en
    // x 15,2, de y 7,96 à 8,9 — il barrait la vue et le passage direct de la porte au vestibule de l'ascenseur. Ouvert à
    // demeure, rabattu contre le mur sud du palier à 165°, comme celui du palier est du 1er : la plaque verte est derrière)
    const CF = ch.porte('x', Y_PAL, 14.75, { l: 0.95, h: 2.04, base: N2, ep: EP, modele: 'grise', etat: 'ouverte', angle: 2.88, cote: 'N', charniere: 'd',
      oculus: { bas: 0.85, haut: 1.85, l: 0.12, bord: 0.2 }, poignee: null, feu: false, notices: 1, huisserie: false, matVantail: X.grisCF, nom: 'coupe-feu du 2e' });
    // (dans le repère du vantail : les gonds en x = 0, le vantail vers s ; +z côté sas, -z côté palier)
    for (const v of CF.vantaux) {
      const sv = v.s, w = 0.95, e = 0.04, o = { ombre: false };
      maille(boiteM(0.05, 0.16, 0.012), M.inox, sv * (w - 0.07), 1.02, e / 2 + 0.006, 0, v.g, o);
      maille(boiteM(0.13, 0.02, 0.02), M.inox, sv * (w - 0.12), 1.06, e / 2 + 0.05, 0, v.g, o);
      maille(boiteM(0.02, 0.02, 0.05), M.inox, sv * (w - 0.07), 1.06, e / 2 + 0.025, 0, v.g, o);
      maille(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 10), M.inox, sv * (w - 0.08), 1.05, -(e / 2 + 0.045), 0, v.g, o);
      for (const dy of [-0.12, 0.12]) maille(boiteM(0.018, 0.018, 0.045), M.inox, sv * (w - 0.08), 1.05 + dy, -(e / 2 + 0.022), 0, v.g, o);
      maille(boiteM(0.12, 0.04, 0.004), M.rougeEtiquette, sv * (w - 0.18), 2.04 - 0.12, -(e / 2 + 0.003), 0, v.g, o);
    }
    // l'huisserie de bois côté palier, CÔTÉ GONDS SEULEMENT (plan V2, etage2.md § 5 : à 72,2-72,9 s, on ne voit de bois que
    // le chant miel du vantail et l'huisserie sombre à l'est ; le jambage ouest et le linteau sont blancs, sous le rail du
    // ferme-porte) : le montant est de 8 cm ; les tableaux de l'ouverture blancs, sauf la moitié côté palier du tableau est
    // (à 3 mm dans le jour : ils ne se battent plus avec les tranches du mur)
    const ya = Y_PAL + EP / 2, yb = ya + 0.02;
    B(15.225, ya, 15.225 + 0.08, yb, N2, N2 + 2.12, X.boisBrun, { ombre: false });
    B(15.222, Y_PAL, 15.265, Y_PAL + EP / 2, N2, N2 + 2.06, X.boisBrun, { ombre: false });
    B(15.222, Y_PAL - EP / 2, 15.265, Y_PAL, N2, N2 + 2.06, M.blanc, { ombre: false });
    B(14.235, Y_PAL - EP / 2, 14.278, Y_PAL + EP / 2, N2, N2 + 2.06, M.blanc, { ombre: false });
    // les blocs de sortie : au-dessus de la porte côté palier ; côté couloir, sur le linteau de l'entrée du sas (VO 88,0 s :
    // haut, au ras du plafond, au-dessus de l'ouverture — rien au-dessus de la porte côté sas ; plan V2 : sous le plafond
    // du couloir à 2,45, sur le linteau du sas à 2,25)
    ch.sortie(14.75, Y_PAL + EP / 2 + 0.035, N2 + 2.3, 'N');
    ch.sortie((X_SAS0 + X_SAS1) / 2, Y_COUR - EP / 2 - 0.035, N2 + 2.32, 'S');
    // la plaque verte à l'est de la porte, côté palier (VO 72,6 s) ; la plaque noire carrée à l'ouest, côté sas (88,3 s)
    panneau(matPan(texPlaqueVerte(), 0.5), 0.2, 0.35, 15.55, Y_PAL + EP / 2 + 0.003, N2 + 1.5, 'N');
    B(14.07, Y_PAL - EP / 2 - 0.006, 14.19, Y_PAL - EP / 2, N2 + 1.5, N2 + 1.62, M.noirMat, { ombre: false });
    // LA FENÊTRE DU PALIER (VO q_0283-0287 en grand, crops/fenetre_palier2) : elle n'est pas dans le mur nord mais DANS LE
    // MUR DU PANNEAU, au-delà de la réglette (vue de face, sa plinthe court dessous ; ≈ 2 m au nord du panneau) — elle
    // regarde l'ouest, sur une courette entre la salle 1 et la cage (au-dessus du renfoncement du 1er) : ouvrant à la
    // française, menuiserie anthracite, poignée à gauche, tableau blanc de 15 cm, allège à 1,0 m ; dehors, le jour
    fenetrePanneau();
    // LE PLAFOND (plâtre à 2,50 m), le spot devant la porte, la galette du vestibule ; le chant du plafond sur la cage
    ch.plafond(X_REC, Y_PAL + EP / 2, E.x0, Y_ARR - EP_ARR / 2, H_PAL, 'platre');
    ch.plafond(E.x0, Y_VEST + EP / 2, X_ASC - EP / 2, 9.0, H_PAL, 'platre');
    B(E.x0 - 0.02, E.yS, E.x0, Y_ARR - EP_ARR / 2, H_PAL, N3 - 0.25, M.blanc, { ombre: false });
    spot(14.75, 8.45, H_PAL, 'e2palier');
    opale(17.0, 8.0, H_PAL, 'e2palier', { r: 0.17 });
    // un détecteur au plafond
    maille(new THREE.CylinderGeometry(0.055, 0.06, 0.035, 20), M.boitier, 15.3, H_PAL - 0.018, -11.2, 0, fixe, { ombre: false });
  }

  // =====================================================================
  //  LE SAS (VO q_0289-0293, 88,0-88,7 s ; g140, g152, sheets/z_500_9)
  // =====================================================================
  function construireSas() {
    const B0 = M.blanc, P = X.plinthe;
    mur({ de: [X_SAS0, Y_COUR], a: [X_SAS0, Y_PAL - EP / 2], mats: B0, plinthes: [['E', P]] });
    mur({ de: [X_SAS1, Y_COUR], a: [X_SAS1, Y_PAL - EP / 2], mats: B0, plinthes: [['W', P]] });
    // (entre le sas et le vestibule, un massif plein : une gaine)
    B(X_SAS1 + EP / 2, Y_COUR, E.x0, Y_PAL - EP / 2, N2, DALLE3, B0, { ombre: false });
    const xs0 = X_SAS0 + EP / 2, xs1 = X_SAS1 - EP / 2;
    ch.plafond(xs0, Y_COUR - EP / 2, xs1, Y_PAL - EP / 2, H_SAS, 'platre');
    // la retombée côté porte (2,25 m)
    B(xs0, Y_PAL - EP / 2 - 0.22, xs1, Y_PAL - EP / 2, H_RET, H_SAS, B0, { ombre: false });
    spot(14.75, 7.15, H_SAS, 'e2sas');
    // le grand cadre noir du mur est (plan d'évacuation sous verre, 0,6 x 1,1 m, de 1,0 à 2,1 m) ; le disque blanc au
    // plafond (détecteur)
    B(15.5 - 0.025, 6.75, 15.5, 7.4, N2 + 1.0, N2 + 2.1, M.noirMat, { ombre: false });
    panneau(matPan(texPlanEvacuation(), 0.12), 0.55, 1.0, 15.5 - 0.027, 7.075, N2 + 1.55, 'W');
    maille(new THREE.CylinderGeometry(0.07, 0.07, 0.03, 20), M.boitier, 14.45, H_SAS - 0.015, -7.05, 0, fixe, { ombre: false });
    // LA CAMÉRA DE SURVEILLANCE (relecture du 10/10, 88,0-88,7 s ; q_0290 par la porte) : en haut du mur est, au-dessus du
    // bout nord du cadre — un fût gris clair sur sa console, l'objectif noir vers le couloir (elle était au bout du couloir)
    {
      const cam = new THREE.Group(); cam.position.set(15.5, H_SAS - 0.14, -7.45); cam.rotation.y = 2.36; fixe.add(cam);
      maille(boiteM(0.07, 0.06, 0.06), M.boitier, 0, 0.06, -0.03, 0, cam, { ombre: false });
      maille(new THREE.CylinderGeometry(0.05, 0.05, 0.17, 16), X.blancMeuble, 0, 0, -0.13, 0, cam, { ombre: false }).rotation.x = Math.PI / 2;
      maille(new THREE.CylinderGeometry(0.028, 0.028, 0.012, 14), M.noirMat, 0, 0, -0.22, 0, cam, { ombre: false }).rotation.x = Math.PI / 2;
    }
    const sol = new THREE.Mesh(geoDalles([[X_SAS0, Y_COUR, X_SAS1, Y_PAL]], N2, R2), X.lino);
    sol.receiveShadow = true; sol.name = 'lino du sas du 2e'; sol.userData.solE2 = true; fixe.add(sol);
  }

  // =====================================================================
  //  LE COULOIR (VO q_0293-0303, q_0338-0355 ; g178, g190, g198, z_289, z_436, z_500_9)
  // =====================================================================
  function construireCouloir() {
    const B0 = M.blanc, P = X.plinthe, PS = X.plintheSalle;
    // LE MUR NORD : blanc au fond ouest, ROUGE VERMILLON côté couloir de x 4,84 à 12,0 (le mur de la salle 1), puis la
    // porte de la salle 1, un pan blanc, l'ouverture du sas, un pan blanc
    // (plan V2 : la salle 1 commence en x 3,6 ; sur la VO, le rouge s'arrête en x ≈ 4,9 — q_0300, calée à 4,93 — : il ne
    // bouge pas, le mur est blanc des deux côtés jusqu'à 4,84, la salle 1 derrière dès 3,6)
    mur({ de: [X_FOND, Y_COUR], a: [X_S1, Y_COUR], mats: B0, plinthes: [['S', P]] });
    mur({ de: [X_S1, Y_COUR], a: [4.84, Y_COUR], mats: B0, plinthes: [['S', P], ['N', PS]] });
    mur({ de: [4.84, Y_COUR], a: [12.0, Y_COUR], mats: { N: B0, S: X.rouge }, plinthes: [['S', P], ['N', PS]] });
    mur({ de: [12.0, Y_COUR], a: [X_BOUT, Y_COUR], mats: B0, plinthes: [['S', P]], ouvertures: [{ c: 12.45, l: 0.9, h: N2 + 2.04 }, { c: (X_SAS0 + X_SAS1) / 2, l: X_SAS1 - X_SAS0 - EP, h: N2 + 2.25 }] });
    plinthe(12.9, Y_COUR + EP / 2, X_S1E - EP / 2, Y_COUR + EP / 2 + 0.015, PS);
    // LE MUR SUD : la porte (fermée) de la salle Bjarne Stroustrup, la porte D1 de la salle 2 et son imposte
    mur({ de: [X_FOND, Y_RUE], a: [X_S2, Y_RUE], mats: B0, plinthes: [['N', P]], ouvertures: [{ c: 4.35, l: 0.93, h: N2 + 2.04 }] });
    mur({ de: [X_S2, Y_RUE], a: [X_S2E, Y_RUE], mats: B0, ouvertures: [{ c: 10.52, l: 0.95, h: N2 + 2.4 }] });
    plinthe(X_S2, Y_RUE + EP / 2, 10.0, Y_RUE + EP / 2 + 0.015, P); plinthe(11.0, Y_RUE + EP / 2, X_BOUT - EP / 2, Y_RUE + EP / 2 + 0.015, P);
    plinthe(X_S2 + EP / 2, Y_RUE - EP / 2 - 0.015, 10.0, Y_RUE - EP / 2, PS); plinthe(11.0, Y_RUE - EP / 2 - 0.015, X_S2E - EP / 2, Y_RUE - EP / 2, PS);
    // LES DEUX BOUTS : au fond ouest, la porte grise à oculus (fermée) sous son bloc de sortie, plus près du mur sud ; au
    // bout est (non vu), la porte du Bureau des Conseillers
    mur({ de: [X_FOND, Y_RUE - EP / 2], a: [X_FOND, Y_COUR + EP / 2], mats: B0, plinthes: [['E', P]], ouvertures: [{ c: 5.25, l: 0.93 }] });
    mur({ de: [X_BOUT, Y_RUE - EP / 2], a: [X_BOUT, Y_COUR + EP / 2], mats: B0, plinthes: [['W', P]], ouvertures: [{ c: 5.575, l: 0.93 }] });
    ch.porte('y', X_FOND, 5.25, { l: 0.93, h: 2.04, base: N2, ep: EP, modele: 'grise', etat: 'fermee', cote: 'E', oculus: { bas: 0.85, haut: 1.85, l: 0.12, bord: 0.2 }, feu: true, matVantail: X.taupe, nom: '2e étage (dégagement ouest)' });
    ch.sortie(X_FOND + EP / 2 + 0.035, 5.25, N2 + 2.3, 'E');
    B(X_FOND + EP / 2, 4.72, X_FOND + EP / 2 + 0.07, 4.84, H_COUL - 0.16, H_COUL - 0.02, M.noirMat, { ombre: false });
    ch.porte('y', X_BOUT, 5.575, { l: 0.93, h: 2.04, base: N2, ep: EP, modele: 'grise', etat: 'fermee', cote: 'W', oculus: false, matVantail: X.taupe, nom: 'bureau des conseillers B 2.3' });
    panneau(matPan(texPlaque2('Bureau des Conseillers', 'B 2.3'), 0.4), 0.2, 0.11, X_BOUT - EP / 2 - 0.004, 6.25, N2 + 1.62, 'W');
    ch.porte('x', Y_RUE, 4.35, { l: 0.93, h: 2.04, base: N2, ep: EP, modele: 'blanche', etat: 'fermee', cote: 'S', nom: 'salle Bjarne Stroustrup Si 2.6' });
    panneau(matPan(texPlaque2('Salle Bjarne Stroustrup', 'Si 2.6'), 0.4), 0.2, 0.11, 5.05, Y_RUE + EP / 2 + 0.004, N2 + 1.62, 'N');
    // LE SOL (lino taupe satiné), LE PLAFOND (plâtre lisse à 2,45 m) et ses six spots sur l'axe, tous les 2,15 m ; la
    // bouche de ventilation près du fond
    const sol = new THREE.Mesh(geoDalles([[X_FOND, Y_RUE, X_BOUT, Y_COUR]], N2, R2), X.lino);
    sol.receiveShadow = true; sol.name = 'lino du couloir du 2e'; sol.userData.solE2 = true; fixe.add(sol); sols.push(X.lino);
    ch.plafond(X_FOND + EP / 2, Y_RUE + EP / 2, X_BOUT - EP / 2, Y_COUR - EP / 2, H_COUL, 'platre');
    for (const x of [14.75, 12.6, 10.45, 8.3, 6.15, 4.0]) spot(x, 5.575, H_COUL, 'e2couloir');
    B(4.55, 5.0, 4.85, 5.3, H_COUL - 0.01, H_COUL, M.grille, { ombre: false });
    // (au-dessus de l'ouverture du sas, le mur du couloir descend jusqu'à 2,25 m : le linteau du sas)
    // ---- LE MUR SUD, d'est en ouest : la photo turquoise face au sas, la plaque de la salle 2, la porte D1, l'affiche à
    // bandeau rouge, les trois chaises noires ----
    B(14.75 - 0.33, Y_RUE + EP / 2, 14.75 + 0.33, Y_RUE + EP / 2 + 0.02, N2 + 1.05, N2 + 1.95, M.alu, { ombre: false });
    // (sous verre : elle renvoie le couloir — VO q_0293, le reflet d'un spot et du cadreur)
    panneau(matPan(texPhotoTurquoise(), 0.3), 0.62, 0.85, 14.75, Y_RUE + EP / 2 + 0.022, N2 + 1.5, 'N');
    panneau(matPan(texPlaque2('Salle de cours', 'S 2.8'), 0.4), 0.2, 0.11, 11.2, Y_RUE + EP / 2 + 0.004, N2 + 1.65, 'N');
    panneau(matPan(texAfficheRouge(), 0.6), 0.42, 0.6, 9.35, Y_RUE + EP / 2 + 0.003, N2 + 1.7, 'N');
    // (plan V2, etage2.md § 4 : sur la VO, juste à l'ouest de D1, sous l'affiche à bandeau rouge — q_0300 : assises en
    // x ≈ 7,5-9,5 ; q_0316 : la 1re chaise touche presque le chambranle ouest de D1. Elles étaient 1,2 m trop à l'ouest)
    for (const x of [8.3, 8.85, 9.4]) chaiseVisiteur(x, Y_RUE + EP / 2 + 0.27, 'N');
    // ---- LE MUR ROUGE : la plaque de la salle 1 près de sa porte, l'affiche A3 jaune pâle face à la porte D1 ----
    panneau(matPan(texPlaque2('Salle de cours', 'S 2.7'), 0.4), 0.2, 0.11, 11.6, Y_COUR - EP / 2 - 0.004, N2 + 1.65, 'S');
    panneau(matPan(texAfficheA3(), 0.55), 0.32, 0.45, 10.0, Y_COUR - EP / 2 - 0.003, N2 + 1.68, 'S');
    // (la caméra de surveillance est dans le sas, en haut de son mur est : construireSas — relecture du 10/10)
  }
  // LA CHAISE « VISITEUR » NOIRE du couloir (VO q_0297-0303) : tube d'acier noir, quatre pieds, assise et dossier
  // rembourrés noirs ; dos au mur
  function chaiseVisiteur(x, y, dir) {
    const [fx, fz] = DIR[dir];
    const g = new THREE.Group(); g.position.set(x, N2, -y); g.rotation.y = Math.atan2(fx, fz); fixe.add(g);
    maille(boiteM(0.46, 0.06, 0.44), X.similiNoir, 0, 0.45, 0.02, 0, g);
    const d = maille(boiteM(0.44, 0.34, 0.05), X.similiNoir, 0, 0.7, -0.22, 0, g); d.rotation.x = -0.1;
    for (const [px, pz] of [[-0.2, 0.2], [0.2, 0.2], [-0.2, -0.18], [0.2, -0.18]]) maille(boiteM(0.02, 0.43, 0.02), X.noir, px, 0.215, pz, 0, g);
    for (const px of [-0.2, 0.2]) maille(boiteM(0.02, 0.32, 0.02), X.noir, px, 0.6, -0.2, 0, g);
    C.ajouterCercle(g.position.x, g.position.z, 0.24, { y0: N2, y1: N2 + 0.9 });
    sieges.push({ x: g.position.x + fx * 0.04, z: g.position.z + fz * 0.04, y: 0.47, fx, fz, sx: x + fx * 0.6, sz: -y + fz * 0.6, nom: 'la chaise du couloir', sol: N2 });
  }

  // =====================================================================
  //  LE MOBILIER DES SALLES
  // =====================================================================
  // LA CHAISE DE HÊTRE À PIÈTEMENT LUGE (VO q_0304-0337) : coque de contreplaqué cintré, dossier plein (salle 1) ou percé
  // de six trous ronds, deux rangs de trois (salle 2) ; le piètement en tube (noir ou chromé). `dir` : où regarde qui
  // s'y assied ; `sortie` : où il se relève (dans l'allée).
  const _assise = geoPlaque(0.42, 0.4, 0.012, 0.06);
  const _dossierPlein = geoPlaque(0.41, 0.25, 0.012, 0.05);
  const _dossierTrous = geoPlaque(0.41, 0.25, 0.012, 0.05, [-0.1, 0, 0.1].flatMap((x) => [[x, 0.045, 0.021], [x, -0.04, 0.021]]));
  const _tube = (L) => new THREE.CylinderGeometry(0.011, 0.011, L, 6);
  const _patin = _tube(0.44), _montant = _tube(0.44), _barre = _tube(0.4), _dos = _tube(0.34);
  // (`rc`, `dc` : le rayon de sa forme solide et son avance sous l'assise — la salle 1, où l'on passe derrière les dossiers)
  const chaiseLuge = (x, y, dir, { trous = false, coque = X.coque1, pied = X.noir, sortie = null, nom = 'la chaise', rc = 0.2, dc = 0 } = {}) => {
    const [fx, fz] = DIR[dir];
    const g = new THREE.Group(); g.position.set(x, N2, -y); g.rotation.y = Math.atan2(fx, fz); fixe.add(g);
    maille(_assise, coque, 0, 0.455, 0.02, 0, g);
    const d = maille(trous ? _dossierTrous : _dossierPlein, coque, 0, 0.75, -0.205, 0, g); d.rotation.x = Math.PI / 2 - 0.17;
    for (const sx of [-0.19, 0.19]) {
      const p = maille(_patin, pied, sx, 0.012, 0.0, 0, g); p.rotation.x = Math.PI / 2;
      maille(_montant, pied, sx, 0.23, 0.21, 0, g);
      const s = maille(_barre, pied, sx, 0.445, 0.01, 0, g); s.rotation.x = Math.PI / 2;
      const r = maille(_dos, pied, sx, 0.6, -0.2, 0, g); r.rotation.x = -0.17;
      maille(_montant, pied, sx, 0.23, -0.21, 0, g);
    }
    const b = maille(_barre, pied, 0, 0.43, 0.19, 0, g); b.rotation.z = Math.PI / 2;
    C.ajouterCercle(g.position.x + fx * dc, g.position.z + fz * dc, rc, { y0: N2, y1: N2 + 0.9 });
    const s = sortie || [x - fx * 0.6, y + fz * 0.6];
    sieges.push({ x: g.position.x + fx * 0.04, z: g.position.z + fz * 0.04, y: 0.46, fx, fz, sx: s[0], sz: -s[1], nom, sol: N2 });
    return g;
  };
  // UNE TABLE : plateau de hêtre (chant hêtre), quatre pieds de tube carré (marine ou chromé), `lx` x `ly` en plan ;
  // `passe` : les passe-câbles noirs, du côté `passe` ('W', 'E'…)
  const table = (x, y, lx, ly, { pied = X.marine, h = 0.74, passe = null, multi = false } = {}) => {
    const x0 = x - lx / 2, x1 = x + lx / 2, y0 = y - ly / 2, y1 = y + ly / 2;
    B(x0, y0, x1, y1, N2 + h - 0.025, N2 + h, X.hetre);
    for (const [px, py] of [[x0 + 0.04, y0 + 0.04], [x1 - 0.04, y0 + 0.04], [x0 + 0.04, y1 - 0.04], [x1 - 0.04, y1 - 0.04]]) B(px - 0.015, py - 0.015, px + 0.015, py + 0.015, N2, N2 + h - 0.025, pied);
    if (lx < ly) for (const px of [x0 + 0.04, x1 - 0.04]) B(px - 0.008, y0 + 0.06, px + 0.008, y1 - 0.06, N2 + h - 0.08, N2 + h - 0.025, pied, { ombre: false });
    else for (const py of [y0 + 0.04, y1 - 0.04]) B(x0 + 0.06, py - 0.008, x1 - 0.06, py + 0.008, N2 + h - 0.08, N2 + h - 0.025, pied, { ombre: false });
    if (passe) {
      const [dx, dy] = { W: [-1, 0], E: [1, 0], N: [0, 1], S: [0, -1] }[passe];
      for (const t of [-0.25, 0.25]) {
        const cx = dx ? x + dx * (lx / 2 - 0.08) : x + t * lx, cy = dy ? y + dy * (ly / 2 - 0.08) : y + t * ly;
        maille(new THREE.CylinderGeometry(0.03, 0.03, 0.004, 16), M.noirMat, cx, N2 + h + 0.001, -cy, 0, fixe, { ombre: false });
      }
    }
    if (multi) B(x - 0.03, y - 0.15, x + 0.03, y + 0.15, N2 + h, N2 + h + 0.04, X.blancMeuble, { ombre: false });
    C.ajouterBoite(x0, -y0, x1, -y1, { y0: N2, y1: N2 + h + 0.02 });
  };
  // LE POSTE DE L'ENSEIGNANT : l'écran noir sur son pied, le clavier, l'unité centrale noire au sol ; tourné vers `dir`
  const poste = (x, y, dir) => {
    const g = new THREE.Group(); g.position.set(x, N2 + 0.74, -y); g.rotation.y = ROT[dir]; fixe.add(g);
    maille(boiteM(0.2, 0.012, 0.16), X.ecran, 0, 0.006, -0.1, 0, g);
    maille(boiteM(0.04, 0.2, 0.025), X.ecran, 0, 0.11, -0.12, 0, g);
    maille(boiteM(0.55, 0.33, 0.025), X.ecran, 0, 0.33, -0.1, 0, g);
    maille(boiteM(0.42, 0.016, 0.13), M.noirMat, 0, 0.008, 0.14, 0, g, { ombre: false });
    maille(boiteM(0.2, 0.42, 0.45), M.noirMat, 0.45, -0.53, -0.05, 0, g);
  };
  // LE VIDÉOPROJECTEUR blanc au plafond, sur sa canne
  const projecteur = (x, y, face) => {
    const g = new THREE.Group(); g.position.set(x, H_SALLE, -y); g.rotation.y = ROT[face]; fixe.add(g);
    maille(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8), X.blancMeuble, 0, -0.15, 0, 0, g, { ombre: false });
    maille(boiteM(0.34, 0.11, 0.28), X.blancMeuble, 0, -0.35, 0, 0, g, { ombre: false });
    const o = maille(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 16), M.noirMat, 0.08, -0.35, 0.14, 0, g, { ombre: false }); o.rotation.x = Math.PI / 2;
  };
  // LE TABLEAU BLANC (panneaux côte à côte, cadres alu, auget) contre un mur qui regarde `face`, centré en `c`
  const tableau = (x, y, face, panneaux, bas, haut) => {
    const g = new THREE.Group(); g.position.set(x, N2, -y); g.rotation.y = ROT[face]; fixe.add(g);
    const L = panneaux.reduce((s, p) => s + p, 0), hh = haut - bas;
    let u = -L / 2;
    for (const w of panneaux) {
      maille(boiteM(w, hh + 0.03, 0.02), M.alu, u + w / 2, bas + hh / 2, 0.01, 0, g);
      const t = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.03, hh - 0.03), X.tableau); t.position.set(u + w / 2, bas + hh / 2, 0.021); t.receiveShadow = true; g.add(t);
      u += w;
    }
    maille(boiteM(L * 0.9, 0.02, 0.07), M.alu, 0, bas - 0.02, 0.045, 0, g);
    return g;
  };
  // LE HAUT-PARLEUR blanc, en haut d'un angle
  const hautParleur = (x, y, face) => {
    const g = new THREE.Group(); g.position.set(x, H_SALLE - 0.3, -y); g.rotation.y = ROT[face]; fixe.add(g);
    maille(boiteM(0.18, 0.26, 0.15), X.blancMeuble, 0, 0, 0.075, 0, g, { ombre: false });
    maille(boiteM(0.15, 0.22, 0.004), M.grille, 0, 0, 0.152, 0, g, { ombre: false });
  };

  // =====================================================================
  //  LA SALLE 1, CÔTÉ COUR (VO 75,8-78,4 s, q_0304-0314 ; g304, g311, c1_tableau, fenetres_c1)
  // =====================================================================
  function construireSalle1() {
    const B0 = M.blanc, PS = X.plintheSalle, yi = Y_S1N - EP_ARR / 2;
    // les murs ouest (contre le dégagement) et est (contre une gaine) ; la façade arrière : construireFacades
    mur({ de: [X_S1, Y_COUR + EP / 2], a: [X_S1, yi], mats: B0, plinthes: [['E', PS]] });
    mur({ de: [X_S1E, Y_COUR + EP / 2], a: [X_S1E, yi], mats: B0, plinthes: [['W', PS]] });
    // LA PORTE (VO q_0303, q_0349-0352) : vantail vitré dépoli dans un cadre blanc, gonds à l'est, ouvert vers la salle
    porteVitree('x', Y_COUR, 12.45, { l: 0.9, cote: 'N', charniere: 'd', libre: -1, nom: 'salle 1 du 2e (S 2.7)' });
    ch.sortie(12.45, Y_COUR + EP / 2 + 0.03, N2 + 2.3, 'N');
    // LE SOL (moquette en dalles, damier marine et anthracite), LE PLAFOND (dalles 60 x 60 à 2,40 m), dix luminaires à
    // grille sur deux lignes est-ouest (plan V2 : en y 8,4 et 10,4, la salle n'a plus que 4,93 m de profondeur), deux
    // diffuseurs à fentes entre elles
    const sol = new THREE.Mesh(geoDalles([[X_S1, Y_COUR, X_S1E, yi]], N2, R2), X.moquette1);
    sol.receiveShadow = true; sol.name = 'moquette de la salle 1 du 2e'; sol.userData.solE2 = true; fixe.add(sol); sols.push(X.moquette1);
    ch.plafond(X_S1 + EP / 2, Y_COUR + EP / 2, X_S1E - EP / 2, yi, H_SALLE, 'dalles');
    for (const x of [4.5, 6.4, 8.3, 10.2, 12.1]) for (const y of [8.4, 10.4]) dalle(x, y, 'e2s1');
    fente(6.75, 7.95, 9.4); fente(10.55, 11.75, 9.4);
    // LE MUR OUEST, du sud au nord (VO q_0313 projetée sur le mur, faisceau e2x/bundle2.py) : le poteau de l'angle
    // sud-ouest, l'extincteur et ses deux pictogrammes (rouge à 1,8 m, rouge et bleu à 1,35 m) et le haut-parleur au-dessus,
    // puis le tableau blanc en trois panneaux (VO : 1,0 + 2,07 + 1,1 m, de y 7,23 à 11,4 ; de 0,95 à 1,95 m), presque
    // contre l'angle nord-ouest ; le vidéoprojecteur à 1,5 m du mur
    // (plan V2 : tableau centré en y ≈ 9,1 sur le mur raccourci — ici 9,25, de 7,20 à 11,30 : q_0313 projetée sur le mur le
    // met de 7,23 à 11,4, l'extincteur à son sud, entre le poteau et le tableau, et son bout nord à 0,05 m de l'angle)
    tableau(X_S1 + EP / 2, 9.25, 'E', [1.0, 2.05, 1.05], 0.95, 1.95);
    projecteur(X_S1 + 1.55, 9.25, 'W');
    hautParleur(X_S1 + EP / 2, 7.06, 'E');
    B(X_S1 + EP / 2, Y_COUR + EP / 2, X_S1 + 0.36, 6.95, N2, H_SALLE, B0, { ombre: false, collision: true });
    plinthe(X_S1 + 0.36, Y_COUR + EP / 2 + 0.015, X_S1 + 0.375, 6.95, PS); plinthe(X_S1 + EP / 2, 6.95, X_S1 + 0.375, 6.965, PS);
    // (10/10, q_0310-0313 : un second poteau, plein, contre le mur du couloir — au premier plan quand on entre et qu'on
    // regarde le tableau ; plan V2, etage2.md § 2 : au sud-ouest de la caméra de q_0313, en x ≈ 9,0-9,35 et non 10,6-10,95)
    // (entre ce poteau et le bout des rangées, 0,88 m : l'allée de la porte, VO ≈ 1,25 hors poteau)
    B(9.0, Y_COUR + EP / 2, 9.35, 6.92, N2, H_SALLE, B0, { ombre: false, collision: true });
    plinthe(8.985, Y_COUR + EP / 2, 9.0, 6.935, PS); plinthe(9.35, Y_COUR + EP / 2, 9.365, 6.935, PS); plinthe(9.0, 6.92, 9.35, 6.935, PS);
    extincteur(X_S1 + EP / 2 + 0.02, 7.04, 'E');
    panneau(matPan(texPictoExtincteur(), 0.5), 0.15, 0.15, X_S1 + EP / 2 + 0.003, 7.04, N2 + 1.8, 'E');
    panneau(matPan(texPictoAlarme(), 0.5), 0.1, 0.1, X_S1 + EP / 2 + 0.003, 7.04, N2 + 1.35, 'E');
    // LE COIN DU PROFESSEUR, dans l'angle nord-ouest (VO q_0304, q_0309, q_0313 ; plan V2) : le mur aveugle de 1,47 m entre
    // l'angle et la 1re fenêtre, au nu des trumeaux (q_0304 : rien ne le sépare du trumeau de la 1re fenêtre) ; contre lui,
    // le meuble noir (x 4,35-4,95) et un caisson gris, l'affiche A4 bleue et blanche au-dessus (x 4,5) ; devant le
    // tableau, le bureau en x 4,5 (l'écran en y ≈ 10,5 sur q_0313), son poste tourné vers le professeur, sa chaise
    B(X_S1 + EP / 2, yi - 0.2, FEN_S1[0] - L_FEN_S1 / 2, yi, N2, H_SALLE, B0, { ombre: false, collision: true });
    plinthe(X_S1 + EP / 2, yi - 0.215, FEN_S1[0] - L_FEN_S1 / 2 + 0.015, yi - 0.2, PS);
    B(4.35, yi - 0.5, 4.95, yi - 0.2, N2, N2 + 1.0, M.noirMat, { collision: true });
    B(4.0, yi - 0.45, 4.33, yi - 0.2, N2, N2 + 0.72, X.grisCF, { collision: true });
    panneau(matPan(texConsignes(), 0.5), 0.21, 0.297, 4.5, yi - 0.2 - 0.003, N2 + 1.7, 'S');
    table(4.5, 10.3, 0.7, 1.4, { pied: X.marine });
    poste(4.55, 10.45, 'W');
    chaiseLuge(4.0, 10.3, 'E', { sortie: [4.0, 9.25], nom: 'la chaise du professeur' });
    // LES TABLES DES ÉLÈVES : cinq rangées nord-sud (les élèves regardent l'ouest), trois tables de 1,15 m bout à bout de
    // y 7,80 à 11,25 (l'allée de la porte au sud), deux chaises par table ; passe-câbles au bord ouest, quelques multiprises
    // (plan V2, etage2.md § 2 : rangées au pas de 1,45 — VO 1,39-1,45, q_0309 —, 2,0 m entre le tableau et la 1re ; les
    // chaises rentrées à 0,40 m de l'axe des tables et leur forme resserrée sous l'assise : 0,65 m libres derrière les
    // dossiers, Haythem passe entre deux rangées et s'assied aux 30 places)
    let n = 0;
    for (const xr of [5.95, 7.40, 8.85, 10.30, 11.75]) {
      for (const yc of [8.375, 9.525, 10.675]) {
        table(xr, yc, 0.6, 1.15, { pied: X.marine, passe: 'W', multi: (n % 5) === 2 });
        for (const s of [-1, 1]) chaiseLuge(xr + 0.4, yc + s * 0.29, 'W', { coque: X.coque1, pied: X.noir, sortie: [xr + 0.825, yc + s * 0.29], rc: 0.15, dc: 0.05 });
        n++;
      }
    }
  }

  // =====================================================================
  //  LA SALLE 2, CÔTÉ RUE (VO 78,4-84,2 s, q_0315-0337 ; g329, g333, c2_tableau, z_420)
  // =====================================================================
  function construireSalle2() {
    const B0 = M.blanc, PS = X.plintheSalle;
    mur({ de: [X_S2, 0], a: [X_S2, Y_RUE - EP / 2], mats: B0, plinthes: [['E', PS]] });
    mur({ de: [X_S2E, 0], a: [X_S2E, Y_RUE - EP / 2], mats: B0, plinthes: [['W', PS]] });
    // LA PORTE D1 (VO q_0315-0318) : vantail tout verre dépoli, cadre blanc, trois paumelles laiton à l'ouest, béquille
    // à l'est ; elle s'ouvre vers la salle et se rabat contre le mur ouest ; l'imposte dépolie au-dessus
    porteVitree('x', Y_RUE, 10.52, { l: 0.95, cote: 'S', libre: 1, nom: 'salle 2 du 2e (S 2.8)' });
    for (const h of [0.25, 1.0, 1.8]) B(10.035, Y_RUE - EP / 2 - 0.015, 10.05, Y_RUE - EP / 2, N2 + h, N2 + h + 0.1, X.laiton, { ombre: false });
    B(10.03, Y_RUE - EP / 2 - 0.006, 11.01, Y_RUE + EP / 2 + 0.006, N2 + 2.06, N2 + 2.1, M.alu, { ombre: false });
    for (const s of [1, -1]) {
      const yy = Y_RUE + s * (EP / 2 + 0.003);
      for (const [x0, x1, h0, h1] of [[10.03, 11.01, N2 + 2.1, N2 + 2.14], [10.03, 11.01, N2 + 2.36, N2 + 2.4], [10.03, 10.07, N2 + 2.1, N2 + 2.4], [10.97, 11.01, N2 + 2.1, N2 + 2.4]]) B(x0, yy - 0.005, x1, yy + 0.005, h0, h1, M.alu, { ombre: false });
    }
    // (plan V2 : l'imposte sous le plafond de la salle, à 2,40 — son verre de 0,22 m entre la traverse et le haut du cadre)
    const imp = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.22), depoli); imp.position.set(10.52, N2 + 2.25, -Y_RUE); fixe.add(imp);
    C.ajouterBoite(10.03, -(Y_RUE - EP / 2), 11.01, -(Y_RUE + EP / 2), { y0: N2 + 2.06, y1: N2 + 2.4 });
    // la prise double, dedans, à côté de la porte (1,1 m)
    B(11.3, Y_RUE - EP / 2 - 0.02, 11.44, Y_RUE - EP / 2, N2 + 1.06, N2 + 1.14, X.blancMeuble, { ombre: false });
    // LE SOL (moquette en dalles, damier anthracite et gris foncé), LE PLAFOND (dalles 60 x 60), six luminaires à grille
    // sur deux lignes, deux diffuseurs à fentes
    const sol = new THREE.Mesh(geoDalles([[X_S2, 0, X_S2E, Y_RUE]], N2, R2), X.moquette2);
    sol.receiveShadow = true; sol.name = 'moquette de la salle 2 du 2e'; sol.userData.solE2 = true; fixe.add(sol); sols.push(X.moquette2);
    ch.plafond(X_S2 + EP / 2, 0, X_S2E - EP / 2, Y_RUE - EP / 2, H_SALLE, 'dalles');
    for (const x of [11.6, 14.05, 16.5]) for (const y of [1.2, 3.35]) dalle(x, y, 'e2s2');
    fente(12.25, 13.45, 2.27); fente(14.7, 15.9, 2.27);
    // LE MUR EST : le tableau triptyque (le panneau central de 1,7 m et ses deux volets de 0,85, ouverts à plat ; de 0,9
    // à 2,05 m), le vidéoprojecteur à 1,3 m du mur, le haut-parleur dans l'angle nord-est
    tableau(X_S2E - EP / 2, 2.27, 'W', [0.85, 1.7, 0.85], 0.9, 2.05);
    projecteur(X_S2E - 1.35, 2.27, 'E');
    hautParleur(X_S2E - 0.15, 4.35, 'W');
    // LE MUR NORD : le range-documents noir à six cases près de l'angle nord-est (de 1,0 à 1,9 m)
    B(17.45, Y_RUE - EP / 2 - 0.12, 17.7, Y_RUE - EP / 2, N2 + 1.0, N2 + 1.9, M.noirMat, { ombre: false });
    panneau(matPan(texRangeDocs(), 0.5), 0.25, 0.9, 17.575, Y_RUE - EP / 2 - 0.122, N2 + 1.45, 'S');
    // LES TRUMEAUX blancs saillants entre les fenêtres, les colonnes de prises à leur pied, sur l'allège
    // (la fenêtre 7, dans son encadrement rouge, a 1,20 m : construireFacades)
    // (plan V2, etage2.md § 3 : sur la VO, de gros piliers blancs très lisibles à contre-jour — faces de ≈ 0,4 m, 0,25 à
    // 0,30 de saillie, q_0320-0326 — ; à 0,20, on ne les voyait presque pas : 0,28)
    const demi = (k) => (k === 7 ? 0.6 : 0.65);
    for (let k = 7; k < 11; k++) {
      const xa = centreTravee(k) + demi(k), xb = centreTravee(k + 1) - demi(k + 1);
      B(xa, 0, xb, 0.28, N2, H_SALLE, B0, { ombre: false, collision: true });
      plinthe(xa - 0.01, 0.28, xb + 0.01, 0.295, PS);
      B(xa - 0.1, 0, xa - 0.02, 0.025, N2 + 0.35, N2 + 0.75, X.blancMeuble, { ombre: false });
    }
    // LE BUREAU DU PROFESSEUR, dans l'angle sud-est devant la dernière fenêtre : la table, le poste, la gourde blanche
    table(17.35, 0.85, 1.2, 0.6, { pied: X.chrome });
    poste(17.35, 0.85, 'W');
    maille(new THREE.CylinderGeometry(0.035, 0.035, 0.22, 12), X.blancMeuble, 17.75, N2 + 0.85, -0.75, 0, fixe, { ombre: false });
    chaiseLuge(17.85, 0.95, 'W', { trous: true, coque: X.coque2, pied: X.chrome, sortie: [17.8, 1.7], nom: 'la chaise du professeur' });
    // LES TABLES DES ÉLÈVES : deux colonnes de cinq tables pour deux (1,3 x 0,5), l'une le long du mur nord, l'autre le
    // long des fenêtres, l'allée au milieu ; les élèves regardent l'est
    // (10/10, en jouant : rangs au pas de 1,15 m — au pas de 1,25 le dernier rang venait contre le vantail ouvert de la
    // porte D1, on n'entrait plus dans la salle ; le long du mur ouest, un passage de 0,7 m)
    for (const xr of [16.2, 15.05, 13.9, 12.75, 11.6]) {
      for (const [yc, allee] of [[3.58, 2.55], [1.05, 2.15]]) {
        table(xr, yc, 0.5, 1.3, { pied: X.chrome });
        for (const s of [-1, 1]) chaiseLuge(xr - 0.55, yc + s * 0.33, 'E', { trous: true, coque: X.coque2, pied: X.chrome, sortie: [xr - 0.62, allee] });
      }
    }
  }
  // UNE PORTE VITRÉE DÉPOLIE (les deux salles : VO q_0315, q_0349-0352) : le modèle « vitree » (cadre d'aluminium laqué
  // blanc) dont le verre devient dépoli, une béquille inox côté serrure ; automatique, au niveau du 2e
  function porteVitree(axe, ligne, c, { l, cote, charniere, libre, nom }) {
    const P = ch.porte(axe, ligne, c, { l, h: 2.04, base: N2, ep: EP, modele: 'vitree', etat: 'auto', cote, charniere, libre, blanc: true, tirant: 'aucun', nom });
    for (const v of P.vantaux) {
      v.g.traverse((o) => { if (o.isMesh && o.material === M.verre) o.material = depoli; });
      for (const z of [1, -1]) {
        maille(boiteM(0.04, 0.14, 0.012), M.inox, v.s * (l - 0.11), 1.02, z * 0.031, 0, v.g, { ombre: false });
        maille(boiteM(0.13, 0.02, 0.02), M.inox, v.s * (l - 0.16), 1.06, z * 0.065, 0, v.g, { ombre: false });
      }
    }
    return P;
  }

  // =====================================================================
  //  LES FAÇADES : sur rue au 2e (vraies fenêtres, travées 1 à 12), arrière (y 12,45 : la salle 1, le palier)
  // =====================================================================
  function construireFacades() {
    // ---- SUR RUE : le mur (40 cm, pierre dehors, blanc dedans) percé de ses douze fenêtres (1,30 x 1,25 m, allège 0,95 :
    // la tuile texEtage) ; la salle 2 derrière les travées 7 à 11 (VO q_0318-0327 : sans store) ; derrière les autres, des
    // pièces fermées : leurs stores sont baissés ----
    // (relecture du 10/10, VO q_0319-0331 : la travée 7 a un ENCADREMENT ROUGE en saillie, js/carte_ecole.js
    // construireFacade, dont le jour ne fait que 1,20 x 1,15 m — par une fenêtre de 1,30 x 1,25, on voyait de la salle 2 le
    // rouge déborder de 5 cm tout autour de la vitre ; cette fenêtre prend la taille du jour de son encadrement)
    // (plan V2 du 11/10 : les photos 11 et 12 de Haythem — recadrées, iris_audit/e2x/p12z.jpg — ne montrent au 2e qu'UN
    // cadre rouge, travée 7, suivi de cinq fenêtres simples jusqu'au mitoyen est ; celui de droite est un étage plus haut,
    // au bout de la rangée du 3e, au-dessus de la fenêtre 12 du 2e : la fenêtre 11 retrouve 1,30 x 1,25)
    const F = [];
    for (let k = 1; k <= 12; k++) {
      const cadre = k === 7;
      F.push({ c: centreTravee(k), l: cadre ? 1.2 : 1.3, bas: N2 + (cadre ? 1.0 : 0.95), haut: N2 + (cadre ? 2.15 : 2.2), ferme: k < 7 || k > 11 });
    }
    mur({ de: [-0.3, -0.2], a: [20.1, -0.2], ep: 0.4, h: N3, mats: { N: M.blanc, S: X.pierre }, ouvertures: F.map((f) => ({ c: f.c, l: f.l, bas: f.bas, h: f.haut })) });
    const fac = new THREE.Group(); fac.position.set(0, 0, 0.2); fac.rotation.y = Math.PI; fixe.add(fac);
    for (const f of F) {
      fenetreFacade(fac, M, { x: -f.c, l: f.l, bas: f.bas, haut: f.haut, ep: 0.4, barreaux: false, imposte: true });
      const r = new THREE.Mesh(new THREE.PlaneGeometry(f.l - 0.1, f.haut - f.bas - 0.1), vitreDehors);
      r.position.set(f.c, (f.bas + f.haut) / 2, 0.158); r.castShadow = false; fixe.add(r);
      C.ajouterBoite(f.c - f.l / 2, 0.4, f.c + f.l / 2, 0, { y0: f.bas, y1: f.haut, vitre: true });
      if (f.ferme) {
        const s = new THREE.Mesh(new THREE.PlaneGeometry(f.l - 0.08, f.haut - f.bas - 0.06), storeFerme);
        s.position.set(f.c, (f.bas + f.haut) / 2 + 0.01, -0.03); fixe.add(s);
      } else {
        // le jour de la salle 2 : une nappe froide cuite au pied de chaque fenêtre
        lampe({ type: 'jour', x: f.c, z: 0.9, h: N2 + 2.4, sx: f.c, sz: -0.45, ox: f.c, oz: 0.5, zone: 'e2s2', reel: false, cuireForce: 0.8 });
      }
    }
    for (const x of [11.5, 14.85, 17.2]) ch.lampes.push({ type: 'jour', x, z: 1.2, h: N2 + 2.6, cx: x, cz: -3.0, zone: 'e2s2', base: N2, cuire: false, poids: 1.6 });
    // ---- ARRIÈRE : derrière la salle 1, la façade en y 11,70 (nu 11,55), percée de ses six fenêtres (0,88 x 1,10 m,
    // allège 1,10, haut 2,20 : le linteau à 0,2 m du plafond ; faisceau q_0304-0313, e2x/bundle2.py) ; ailleurs en
    // y 12,45 — le dégagement fermé à l'ouest, la courette et le palier à l'est —, un ressaut de 0,75 m à chaque bout de
    // la salle (plan V2 § 2.5). L'escalier principal ne monte plus au 2e : la façade est pleine au-dessus de son ancienne
    // cage (plan V2 § 1.3). Dehors, le jour (surexposé sur la vidéo) ----
    const FA = FEN_S1.map((c, k) => ({ c, l: L_FEN_S1, bas: N2 + 1.1, haut: N2 + 2.2, store: k < 5 }));
    const yi = Y_S1N - EP_ARR / 2, FAC = { ep: EP_ARR, h: N3, mats: { S: M.blanc, N: X.enduit } };
    mur({ de: [-0.3, Y_ARR], a: [X_S1 + EP / 2, Y_ARR], ...FAC });
    mur({ de: [X_S1 - EP / 2, Y_S1N], a: [X_S1E + EP / 2, Y_S1N], ...FAC, ouvertures: FA.map((f) => ({ c: f.c, l: f.l, bas: f.bas, h: f.haut })) });
    mur({ de: [X_S1E - EP / 2, Y_ARR], a: [E.x0, Y_ARR], ...FAC });
    mur({ de: [X_S1, Y_S1N + EP_ARR / 2], a: [X_S1, Y_ARR - EP_ARR / 2], h: N3, mats: { W: M.blanc, E: X.enduit } });
    mur({ de: [X_S1E, Y_S1N + EP_ARR / 2], a: [X_S1E, Y_ARR - EP_ARR / 2], h: N3, mats: X.enduit });
    plinthe(FEN_S1[0] - L_FEN_S1 / 2, yi - 0.015, FEN_S1[5] + L_FEN_S1 / 2, yi, X.plintheSalle);
    plinthe(X_PAN + 0.075, Y_ARR - EP_ARR / 2 - 0.015, E.x0, Y_ARR - EP_ARR / 2, X.plinthePal);
    for (const f of FA) fenetreCour(f);
    // les trumeaux saillants de la salle 1 (VO : blancs, 0,47 m, 0,2 de saillie ; q_0304, q_0309 : le dernier, à l'est de
    // la 6e fenêtre, fait l'angle — le mur aveugle de l'ouest, au même nu, est posé avec le coin du professeur), la
    // goulotte à 0,8 m sous l'allège, les convecteurs sous trois fenêtres
    const piles = FEN_S1.slice(0, -1).map((c, k) => [c + L_FEN_S1 / 2, FEN_S1[k + 1] - L_FEN_S1 / 2]);
    piles.push([FEN_S1[5] + L_FEN_S1 / 2, X_S1E - EP / 2]);
    for (const [xa, xb] of piles) {
      B(xa, yi - 0.2, xb, yi, N2, H_SALLE, M.blanc, { ombre: false, collision: true });
      plinthe(xa - 0.015, yi - 0.215, Math.min(xb + 0.015, X_S1E - EP / 2), yi - 0.2, X.plintheSalle);
    }
    for (const c of FEN_S1) B(c - L_FEN_S1 / 2, yi - 0.04, c + L_FEN_S1 / 2, yi, N2 + 0.76, N2 + 0.84, X.blancMeuble, { ombre: false });
    for (const k of [1, 3, 5]) {
      const c = FEN_S1[k];
      B(c - 0.4, yi - 0.1, c + 0.4, yi, N2 + 0.15, N2 + 0.6, M.radiateur, { collision: true });
      for (let h = N2 + 0.2; h < N2 + 0.58; h += 0.04) B(c - 0.38, yi - 0.104, c + 0.38, yi - 0.1, h, h + 0.012, M.grille, { ombre: false });
    }
    // le jour des fenêtres côté cour : cuit au pied de chacune, et trois lampes de jour pour les spots
    for (const f of FA) lampe({ type: 'jour', x: f.c, z: -(Y_S1N + 1.0), h: N2 + 2.4, sx: f.c, sz: -(yi - 0.45), ox: f.c, oz: -(Y_S1N + 0.6), zone: 'e2s1', reel: false, cuireForce: 0.6 });
    for (const x of [5.5, 8.55, 11.6]) ch.lampes.push({ type: 'jour', x, z: -(Y_S1N + 1.2), h: N2 + 2.6, cx: x, cz: -(Y_S1N - 3.0), zone: 'e2s1', base: N2, cuire: false, poids: 1.6 });
    // ---- AU-DESSUS : les étages 3 et 4 côté cour (la tuile de la façade sur rue), jusqu'à la corniche ; le ressaut de la
    // salle 1 monte avec eux ----
    const hT = 3.5 + 4 * 3.1;
    for (const [x0, x1, y] of [[-0.3, X_S1, Y_ARR], [X_S1, X_S1E, Y_S1N], [X_S1E, 20.1, Y_ARR]]) {
      const m = new THREE.Mesh(geoMonde(x0, y + EP_ARR / 2, x1, y + EP_ARR / 2 + 0.15, N3, hT), etageArr);
      m.castShadow = false; m.receiveShadow = false; fixe.add(m);
    }
    for (const x of [X_S1, X_S1E]) B(x - 0.075, Y_S1N + EP_ARR / 2, x + 0.075, Y_ARR + EP_ARR / 2, N3, hT, X.enduit, { ombre: false });
  }
  // LA FENÊTRE DU PALIER, dans le mur du panneau (x 14,15, ép. 0,15) : menuiserie anthracite au milieu de l'épaisseur, un
  // ouvrant à la française (son cadre en retrait côté palier) et sa poignée à gauche (au sud), la tablette blanche, le
  // jour derrière, la vitre vue de dehors ; le jour cuit au pied de la fenêtre et une lampe de jour pour les spots
  function fenetrePanneau() {
    const l = 0.75, bas = N2 + 1.0, haut = N2 + 2.25, y0 = Y_FEN - l / 2, y1 = Y_FEN + l / 2, xm = X_PAN, e = 0.03, c0 = 0.06, mat = X.anthracite;
    B(xm - e, y0, xm + e, y1, bas, bas + c0, mat, { ombre: false }); B(xm - e, y0, xm + e, y1, haut - c0, haut, mat, { ombre: false });
    B(xm - e, y0, xm + e, y0 + c0, bas, haut, mat, { ombre: false }); B(xm - e, y1 - c0, xm + e, y1, bas, haut, mat, { ombre: false });
    const xo = xm + e, xo1 = xo + 0.012;
    B(xo, y0 + c0, xo1, y1 - c0, bas + c0, bas + c0 + 0.05, mat, { ombre: false }); B(xo, y0 + c0, xo1, y1 - c0, haut - c0 - 0.05, haut - c0, mat, { ombre: false });
    B(xo, y0 + c0, xo1, y0 + c0 + 0.05, bas + c0, haut - c0, mat, { ombre: false }); B(xo, y1 - c0 - 0.05, xo1, y1 - c0, bas + c0, haut - c0, mat, { ombre: false });
    B(xo1, y0 + c0 + 0.012, xo1 + 0.035, y0 + c0 + 0.03, (bas + haut) / 2 - 0.07, (bas + haut) / 2 + 0.04, M.alu, { ombre: false });
    const v = new THREE.Mesh(new THREE.PlaneGeometry(l - 2 * c0, haut - bas - 2 * c0), ciel);
    v.position.set(xm + 0.005, (bas + haut) / 2, -Y_FEN); v.rotation.y = Math.PI / 2; fixe.add(v);
    const d = new THREE.Mesh(new THREE.PlaneGeometry(l - 2 * c0, haut - bas - 2 * c0), vitreDehors);
    d.position.set(xm - 0.01, (bas + haut) / 2, -Y_FEN); d.rotation.y = -Math.PI / 2; d.castShadow = false; fixe.add(d);
    B(xo, y0, X_PAN + 0.095, y1, bas - 0.025, bas, M.blanc, { ombre: false });
    C.ajouterBoite(X_PAN - 0.075, -y0, X_PAN + 0.075, -y1, { y0: bas, y1: haut, vitre: true });
    lampe({ type: 'jour', x: X_PAN - 1.0, z: -Y_FEN, h: N2 + 2.4, sx: X_PAN + 0.45, sz: -Y_FEN, ox: X_PAN - 0.6, oz: -Y_FEN, zone: 'e2palier', reel: false, cuireForce: 0.5 });
    ch.lampes.push({ type: 'jour', x: X_PAN - 1.2, z: -Y_FEN, h: N2 + 2.6, cx: X_PAN + 2.5, cz: -Y_FEN, zone: 'e2palier', base: N2, cuire: false, poids: 1.2 });
  }
  // UNE FENÊTRE CÔTÉ COUR de la salle 1, dans la façade arrière (VO crops/fenetres_c1) : la menuiserie brun-noir au
  // milieu de l'épaisseur et sa traverse aux deux cinquièmes, les stores à lamelles verticales au-dessus, la tablette
  // blanche, le jour derrière, la vitre vue de dehors. `store` : false, le store est relevé (plan V2 : la 6e fenêtre, à
  // l'est, en plein jour sur q_0304 ; les cinq autres ont leurs lamelles)
  function fenetreCour({ c, l, bas, haut, store = true }) {
    const ym = Y_S1N, c0 = 0.075, x0 = c - l / 2, x1 = c + l / 2, mat = M.menuiserie, e = 0.035, yi = Y_S1N - EP_ARR / 2;
    B(x0, ym - e, x1, ym + e, bas, bas + c0, mat, { ombre: false }); B(x0, ym - e, x1, ym + e, haut - c0, haut, mat, { ombre: false });
    B(x0, ym - e, x0 + c0, ym + e, bas, haut, mat, { ombre: false }); B(x1 - c0, ym - e, x1, ym + e, bas, haut, mat, { ombre: false });
    const ht = bas + (haut - bas) * 0.4;
    B(x0, ym - e, x1, ym + e, ht - 0.035, ht + 0.035, mat, { ombre: false });
    const v = new THREE.Mesh(new THREE.PlaneGeometry(l - 2 * c0, haut - bas - 2 * c0), ciel);
    v.position.set(c, (bas + haut) / 2, -(ym + 0.005)); fixe.add(v);
    const d = new THREE.Mesh(new THREE.PlaneGeometry(l - 2 * c0, haut - bas - 2 * c0), vitreDehors);
    d.position.set(c, (bas + haut) / 2, -(ym + 0.02)); d.rotation.y = Math.PI; d.castShadow = false; fixe.add(d);
    B(x0, yi - 0.02, x1, ym - e, bas - 0.025, bas, M.blanc, { ombre: false });
    C.ajouterBoite(x0, -yi, x1, -(Y_S1N + EP_ARR / 2), { y0: bas, y1: haut, vitre: true });
    // les stores à lamelles verticales claires (9 cm), ouvertes — vues de la salle, des traits clairs sur le jour (VO
    // crops/fenetres_c1, fen_c1_225), sur les trois cinquièmes du haut : un plan découpé (les lames vues par la tranche)
    if (store) {
      const hl = haut - ht - 0.08, st = new THREE.Mesh(new THREE.PlaneGeometry(l - 0.1, hl), storesOuverts);
      st.position.set(c, ht + 0.03 + hl / 2, -(yi - 0.05)); fixe.add(st);
    }
    B(x0 + 0.03, yi - 0.1, x1 - 0.03, yi - 0.03, haut - 0.05, haut + 0.01, M.alu, { ombre: false });
  }

  // =====================================================================
  //  LE MONDE SOLIDE : le plancher du 2e (sauf la cage), la caméra arrêtée dessous
  // =====================================================================
  function construireSols() {
    for (const [x0, y0, x1, y1] of [[3.2, -0.2, X_S2E, 9.0], [3.2, 9.0, E.x0, Y_ARR]]) {
      C.sol(x0, -y0, x1, -y1, N2);
      C.ajouterBoite(x0, -y0, x1, -y1, { y0: N2 - 0.32, y1: N2 - 0.02, joueur: false });
    }
  }

  try {
    construireCage();
    construirePalier();
    construireSas();
    construireCouloir();
    construireSalle1();
    construireSalle2();
    construireFacades();
    construireSols();
  } finally {
    ch.decor = decor0; ch.portes.decor = portes0;
  }

  // (10/10, q_0305, q_0331 : les dalles des salles sont presque aussi claires que les murs — la lumière du jour et des
  // grilles y remonte ; celles du rez-de-chaussée, sous des spots, restent plus sombres : un rebond plus fort, ici seulement)
  const dallesE2 = M.dalles.clone(); dallesE2.emissiveIntensity = 0.3; dallesE2.name = 'plafond en dalles 60x60 (2e)';
  groupe.traverse((o) => { if (o.isMesh && o.material === M.dalles) o.material = dallesE2; });

  // =====================================================================
  //  LA LUMIÈRE CUITE ET L'OMBRE DOUCE DES SOLS DU 2e
  // =====================================================================
  // Le calcul du 1er (js/ecole_lumieres.js cuireLumiereSol) sur les murs du 2e ramenés au sol et ses lampes (h - 6,6)
  const W = R2.x1 - R2.x0, L = R2.y1 - R2.y0;
  const proxy = { formes: C.formes.filter((f) => f.y0 > N2 - 0.35 && f.y0 < N2 + 0.3).map((f) => ({ ...f, y0: f.y0 - N2, y1: f.y1 - N2 })) };
  const aCuire = lampes.filter((Lp) => Lp.base === N2).map((Lp) => ({ ...Lp, h: Lp.h - N2, cuire: true }));
  const lm = cuireLumiereSol(proxy, aCuire, { x0: R2.x0, z0: -R2.y1, W, L }, { tpm: 16 });
  for (const m of sols) { m.lightMap = lm; m.lightMapIntensity = m === X.lino ? 1.1 : m === X.vinyle ? 0.85 : 0.75; m.needsUpdate = true; }
  groupe.traverse((o) => { o.userData.horsAOSol = true; });
  if (renderer) {
    try { cuireOcclusionNiveau(renderer, groupe, sols, N2, R2, 'solE2'); } catch (e) { console.warn('[2e étage] ombre du sol non cuite :', e); }
  }
  // LA FUSION : le décor fixe cousu en un maillage par matériau ; le groupe hors de l'optimisation du décor (sa
  // visibilité et ses ombres changent avec le niveau de Haythem)
  fusionnerLocal(fixe);
  nePasFusionner(groupe);
  const ombrants = [];
  groupe.traverse((o) => { o.userData.horsAOSol = true; if (o.isMesh && o.castShadow) ombrants.push(o); });
  for (const o of ombrants) o.castShadow = false;
  ch.sieges.push(...sieges);

  // =====================================================================
  //  LES ZONES (pièces) du 2e, pour js/ecole_lumieres.js
  // =====================================================================
  // (des pieds à 5,70 m au moins : le joueur du 1er, dessous, n'y est pas ; la cage haute à partir de 6,20 — en dessous,
  // la volée 4 est celle du palier à 5,05, js/ecole_est.js escEst2)
  const zr = (x0, y0, x1, y1, h = N2 - 0.9) => [x0, -y1, x1, -y0, h];
  const env = (x, y, h = 1.6) => ({ x, y: N2 + h, z: -y });
  const zones = [
    { id: 'escEst3', rects: [zr(E.x0, E.bS[0], E.xM, E.bN[1], N2 - 0.4)], voisines: ['e2palier', 'escEst2'], env: { x: 19.05, y: N2 + 0.6, z: -11.6 } },
    // (la carte du palier prise au nord, d'où l'on ne voit pas la face rouge de l'échiffre : devant elle, les murs
    // blancs viraient au saumon — la leçon du 1er, js/ecole_est.js)
    { id: 'e2palier', rects: [zr(13.5, Y_PAL, E.x0, Y_ARR), zr(E.x0, Y_VEST, E.xM, 9.05)], voisines: ['escEst3', 'e2sas'], env: env(15.1, 11.7, 1.5) },
    { id: 'e2sas', rects: [zr(X_SAS0, Y_COUR, X_SAS1, Y_PAL)], voisines: ['e2palier', 'e2couloir'], env: env(14.75, 7.2) },
    // (relecture du 10/10 : prise à 0,9 m du mur rouge, la carte — et la sonde qui en sort, en basse et au téléphone — virait
    // tous les blancs du couloir au saumon, #c5987f à côté de la photo turquoise, et la photo au brun ; prise au bout est,
    // contre le mur sud, le mur rouge n'y est plus qu'une bande : #b8aa94, la photo #789a8b — VO q_0293 #e5d4bf, #7aa29d)
    { id: 'e2couloir', rects: [zr(X_FOND, Y_RUE, X_BOUT, Y_COUR)], voisines: ['e2sas', 'e2s1', 'e2s2'], env: env(13.6, 4.95) },
    { id: 'e2s1', rects: [zr(X_S1, Y_COUR, X_S1E, Y_S1N)], voisines: ['e2couloir'], env: env(8.3, 9.1) },
    { id: 'e2s2', rects: [zr(X_S2, -0.2, X_S2E, Y_RUE)], voisines: ['e2couloir'], env: env(14.0, 2.3) },
  ];

  // =====================================================================
  //  LE 2e VIVANT (js/ecole_etage1.js maj, à chaque image)
  // =====================================================================
  // VISIBLE quand la caméra peut le voir : au 2e (au-dessus des plafonds du 1er), dans la cage de l'escalier est dès le
  // palier du 1er (on y voit la volée 4 monter, l'échiffre rouge, la sous-face de la volée 6), dehors (la façade sur rue) ;
  // SON OMBRE quand Haythem y est (reposée à chaque image : le cache de l'ombre du décor rallume ce qu'il a éteint)
  let haut = false;
  const maj = (dt, jeu) => {
    const u = jeu.user.pos, cam = jeu.camera.position;
    const cageE = cam.x > 13.4 && cam.x < 20.2 && cam.z < -6.45 && cam.z > -12.75;
    const vis = cam.y > 6.3 || u.y > 5.0 || cam.z > -0.05 || (cageE && cam.y > 3.3);
    if (vis !== groupe.visible) groupe.visible = vis;
    if (u.y > 5.8) haut = true; else if (u.y < 5.3) haut = false;
    for (const o of ombrants) o.castShadow = haut;
  };
  console.info('[2e étage] %d sièges, %d lampes, %d ombrants, construit en %d ms', sieges.length, lampes.length, ombrants.length, Math.round(performance.now() - t0));
  return { zones, maj, groupe };
}
