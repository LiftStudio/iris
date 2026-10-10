// =====================================================================
//  LE 1er ÉTAGE DE L'ÉCOLE IRIS (crochet de js/carte_ecole.js)
// =====================================================================
// Ce qui est SÛR vient des photos — la double porte coupe-feu du palier (photos 06 et 20), le palier est (27 à 29), la
// FAÇADE (11, 12, 16 à 18 : douze travées de 1,65 m, une fenêtre par travée à menuiserie brun-noir, la grande baie dans
// son encadrement rouge à l'ouest, travée 1, la fenêtre étroite rouge à l'est, travée 12, les pastilles des pompiers) —
// et, depuis le 10/10, de la VIDÉO OFFICIELLE DE VISITE (2021), qui parcourt l'étage de 41 à 68 s : l'espace pause
// orange derrière la porte du palier est, la salle de cours S 1.3 sur les travées 2 à 8, la porte de la salle Robert
// Kahn (js/ecole_etage1_pause.js). Le reste (le bureau 103, la salle 104, le couloir sombre, le palier d'étage ouest)
// est la distribution courante d'un étage d'école, dans les matières et la lumière du rez-de-chaussée — imaginé.
//
// LE PLAN DE L'ÉTAGE (repère du plan de js/carte_ecole.js : x le long de la façade, y vers le fond ; plancher à 3,50 m,
// dessous de la dalle du 2e à 6,40 m) — refait le 10/10 d'après la vidéo officielle de visite (2021), qui le parcourt
// (VO 41-68 s) ; ce qu'elle ne montre pas reste imaginé :
//   le bureau de la travée 1             x 0-1,59    y 0-6,9     la grande baie rouge (photo 12 : un bureau allumé)
//   la salle de cours S 1.3              x 1,65-13,2 y 0-6,9     travées 2 à 8, sept fenêtres (VO q_0198-0213)
//   bureau 103 (pédagogie)               x 13,2-16,5 y 0-6,9     travées 9 et 10 (au-dessus de la porte 6)
//   salle 104 (Gordon Earle Moore, Si 1.5) x 16,5-19,8 y 0-6,9   travées 11 et 12 (la fenêtre rouge des pompiers)
//   l'espace pause                       x 4,75-13,5 y 7,0-12,9  derrière la porte du palier est (VO q_0180-0219) ; au
//                                        nord, la porte de la salle Robert Kahn, Si 1.4 (js/ecole_kahn.js) ; au sud-est,
//                                        le recoin et la seconde porte de la salle ; en L autour du local fermé du coin
//                                        nord-ouest (x 4,75-7,06 y 9,4-12,96), la niche des distributeurs sur sa face est
//                                        (relecture 10/10, js/ecole_etage1_pause.js)
//   le couloir sombre                    x 0-4,6     y 7,0-8,9   derrière la porte du fond de l'espace pause
//   le palier d'étage                    x 1,75-4,6  y 8,9-12,45  devant la double porte de l'escalier, ouverte
//   le palier est et l'escalier est      x 13,55-19,8 y 7,0-12,45 (photos 27 à 29 : js/ecole_est.js poserPalierEst) ; les
//                                        portes du 103 et de la 104 s'ouvrent sur lui, l'issue de secours est au bout
//   fermés : S 1.6 au fond du palier est, le local ménage, l'issue de secours, le 2e étage
// LES VRAIS NOMS (10/10) : le panneau d'étage du palier est (VO 43 s, photo 28) — « Salle de cours S 1.3, Salle Robert
// Kahn Si 1.4, Salle Gordon Earle Moore Si 1.5, Espace pause, Salle de cours S 1.6 » (S : salle de cours, Si : salle
// informatique) ; les plaques de portes sont celles de la photo 23 : noires, « Salle / nom / Si 1.x ».
// L'ESCALIER CONTINUE : deux volées de 10 marches de 15,5 cm (3,10 m d'étage, comme la façade), le palier intermédiaire
// à 5,05 m, le palier du 2e (6,60 m) devant sa double porte, fermée.
//
// DEUX NIVEAUX DANS LE MONDE SOLIDE (js/collisions.js) : l'étage déclare ses SOLS (dalles à 3,50 m, rampes de
// l'escalier : solEn ne les prend que pour des pieds qui y sont déjà, à une marche près), ses murs à leurs hauteurs
// absolues (le joueur du rez-de-chaussée passe dessous sans les toucher), ses PLAFONDS (plafondEn les ignore pour qui
// est en dessous) et, pour la caméra seule, le dessous de son plancher : à l'étage, elle ne descend pas au travers.
//
// CE QUE L'ON VOIT, CE QUI FAIT OMBRE (maj, à chaque image) : l'étage n'est dessiné que quand la caméra peut le voir
// (dans la cage d'escalier, au-dessus des plafonds du rez-de-chaussée, ou dehors, par les fenêtres) ; il ne porte
// d'ombre (la lumière principale, presque d'aplomb, qui figure les plafonniers) que quand Haythem y est monté — sinon
// ses tables feraient de l'ombre au rez-de-chaussée, au travers des faux plafonds. Les SIÈGES proposés sont ceux de
// l'étage où il se trouve.
//
// LA LUMIÈRE, comme au rez-de-chaussée (js/ecole_lumieres.js) : chaque plafonnier est une lampe de sa pièce (`base` :
// le plancher de l'étage, pour la visée des spots et le tri des pièces voisines), le jour entre par les douze fenêtres ;
// le carrelage de l'étage a sa propre lumière cuite et sa propre ombre douce cuite (le même calcul qu'en bas, sur le
// plancher de l'étage).
//
//   poserEtage1(ch, renderer) -> { zones, maj(dt, jeu) }      (ch : le chantier de js/carte_ecole.js)
import * as THREE from 'three';
import { maille, boiteM, fenetreFacade, fusionnerLocal } from './ecole_portes.js';
import { canvasTex, nePasFusionner } from './kit_decor.js';
import { jourDehors, texAffiche, texConsignes, texPictoExtincteur } from './ecole_matieres.js';
import { cuireLumiereSol } from './ecole_lumieres.js';
import { TELEPHONE } from './appareil.js';
import { poserPalierEst } from './ecole_est.js';
import { poserPause1 } from './ecole_etage1_pause.js';

// ---- les hauteurs ----
const N1 = 3.5;                     // le plancher du 1er étage (H_RDC de js/carte_ecole.js)
const N2 = 6.6;                     // le plancher du 2e (un étage courant : 3,10 m, la tuile de la façade)
const DALLE2 = 6.4;                 // le dessous de la dalle du 2e (H_CAGE de js/carte_ecole.js) : les cloisons y montent
const H_SALLE = N1 + 2.7;           // le faux plafond des salles et des bureaux
const H_COUL = N1 + 2.5;            // celui du couloir sombre et du palier d'étage (les gaines passent au-dessus)
const EP = 0.12;                    // les cloisons de l'étage (plaques de plâtre sur rails)
// ---- les murs du couloir ----
const Y_SALLES = 6.975;             // la cloison nord des salles sur rue
const Y_COUR = 8.925;               // la cloison nord du couloir
// ---- l'escalier (les cotes de ESC, js/carte_ecole.js) ----
const E = { xE0: 3.02, xE1: 4.6, xO0: 1.75, xO1: 2.9, y0: 14.2, G: 0.28, N: 10 };
E.yPalier = E.y0 + (E.N - 1) * E.G;         // 16,72
const R2 = (N2 - N1) / (2 * E.N);           // 15,5 cm : la contremarche des étages (deux volées de dix)
const P2 = N1 + (N2 - N1) / 2;              // 5,05 : le palier intermédiaire
const H_CAGE2 = N2 + 2.85;                  // 9,45 : le plafond de la cage, au-dessus du palier du 2e
// ---- la façade (js/carte_ecole.js construireFacade) : une fenêtre par travée de 1,65 m ----
const TRAVEE = 1.65;
const centreTravee = (k) => 0.825 + (k - 1) * TRAVEE;
// le rectangle du plancher (lumière et ombre cuites, uv1 de 0 à 1, v = 1 au nord ; 10/10 : jusqu'au mur orange de
// l'espace pause, y 12,96)
const R1 = { x0: -0.3, x1: 20.1, y0: -0.2, y1: 13.0 };

// =====================================================================
//  LES TEXTURES DE L'ÉTAGE (dessinées, comme celles du rez-de-chaussée)
// =====================================================================
const rgb = (r, g, b, a = 1) => `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a})`;
function graine(s) {
  let x = s >>> 0 || 1;
  return () => { x ^= x << 13; x >>>= 0; x ^= x >> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; };
}
// LA PIERRE DES ÉTAGES (photos 11, 12) sans fenêtre : le fond de la tuile de js/ecole_matieres.js (texEtage), un
// panneau par demi-étage et par travée ; posée en coordonnées du monde (la tuile tombe sur les travées)
function texPierreEtage() {
  const W = TELEPHONE ? 256 : 512, H = Math.round(W * 3.1 / TRAVEE);
  const t = canvasTex(W, H, (g, w, h) => {
    const r2 = graine(42);
    g.fillStyle = rgb(217, 218, 213); g.fillRect(0, 0, w, h);
    for (let j = 0; j < 2; j++) {
      const t0 = (r2() - 0.5) * 6;
      g.fillStyle = rgb(217 + t0, 218 + t0, 213 + t0, 0.6); g.fillRect(0, j * h / 2, w, h / 2);
    }
    for (let k = 0; k < 700; k++) { const v = 205 + (r2() - 0.5) * 36; g.fillStyle = rgb(v, v, v - 3, 0.25); g.fillRect(r2() * w, r2() * h, 1.3, 1.3); }
    // les coulures, sous chaque joint horizontal
    for (let k = 0; k < 5; k++) {
      const x = r2() * w, y0 = (r2() < 0.5 ? 0 : h / 2), L = h * (0.1 + r2() * 0.25), gr = g.createLinearGradient(0, y0, 0, y0 + L);
      gr.addColorStop(0, 'rgba(160,158,150,0.22)'); gr.addColorStop(1, 'rgba(160,158,150,0)');
      g.fillStyle = gr; g.fillRect(x, y0, 2 + r2() * 4, L);
    }
    g.fillStyle = '#bdbdb8'; g.fillRect(0, h * 0.5 - 1, w, 2); g.fillRect(0, 0, w, 2); g.fillRect(w - 2, 0, 2, h);
  }, [1 / TRAVEE, 1 / 3.1], false, 8);
  t.offset.set(0, -N1 / 3.1);              // (la tuile part du plancher de l'étage)
  return t;
}
// LE STRATIFIÉ CHÊNE CLAIR des plateaux de table : un fil de bois serré dans la longueur. Tuile : 1,2 m.
function texChene() {
  return canvasTex(512, 256, (g, w, h) => {
    const r2 = graine(311);
    g.fillStyle = '#cfae84'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 260; k++) {
      const y = r2() * h, a = 0.05 + r2() * 0.12, c = r2() < 0.5 ? [150, 110, 70] : [226, 198, 160];
      g.strokeStyle = rgb(c[0], c[1], c[2], a); g.lineWidth = 0.6 + r2() * 1.6;
      g.beginPath(); g.moveTo(0, y);
      for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * 0.01 + k) * 2 + (r2() - 0.5) * 1.5);
      g.stroke();
    }
  }, [1 / 1.2, 1 / 0.6], false, 8);
}
// UNE PLAQUE DE PORTE (comme la plaque « Toilettes » du C01, photo 01) : gris anthracite, le numéro, la fonction
function texPlaque(num, libelle) {
  return canvasTex(256, 128, (g, w, h) => {
    g.fillStyle = '#26272a'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#f08a24'; g.fillRect(16, 18, 6, h - 36);
    g.fillStyle = '#f4f4f2'; g.font = '700 54px "Segoe UI", Arial, sans-serif'; g.textBaseline = 'alphabetic';
    g.fillText(num, 36, 70);
    g.font = '500 20px "Segoe UI", Arial, sans-serif'; g.fillStyle = '#c9cbcf';
    g.fillText(libelle, 38, 104);
  }, null, false, 4);
}
// LA PLAQUE DE SALLE (09/10, photo 23 : celle de la salle au fond du C05) : noire, 15 x 9 cm, trois lignes blanches
// centrées — « Salle », le nom, le numéro. `picto` 'tasse' : une tasse sur sa soucoupe à la place du numéro.
function texPlaqueSalle(l1, l2, l3, picto = null) {
  return canvasTex(320, 192, (g, w, h) => {
    g.fillStyle = '#2a2826'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#f2f1ee'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    const ligne = (t, y, poids, taille) => {
      let s = taille;
      do { g.font = `${poids} ${s}px "Segoe UI", Arial, sans-serif`; s -= 1; } while (g.measureText(t).width > w * 0.86 && s > 12);
      g.fillText(t, w / 2, y);
    };
    ligne(l1, h * 0.34, 400, 40); ligne(l2, h * 0.6, 600, 42);
    if (l3) ligne(l3, h * 0.86, 400, 40);
    if (picto === 'tasse') {
      const cx = w / 2 - 6, cy = h * 0.79;
      g.beginPath(); g.moveTo(cx - 20, cy - 16); g.lineTo(cx + 20, cy - 16); g.lineTo(cx + 15, cy + 6); g.quadraticCurveTo(cx, cy + 12, cx - 15, cy + 6); g.closePath(); g.fill();
      g.strokeStyle = '#f2f1ee'; g.lineWidth = 4; g.beginPath(); g.arc(cx + 21, cy - 7, 7, -1.4, 1.6); g.stroke();
      g.fillRect(cx - 28, cy + 12, 56, 4);
    }
  }, null, false, 4);
}
// LE TABLEAU BLANC, écrit au feutre (les cours de la journée)
function texTableau(sujet) {
  return canvasTex(1024, 512, (g, w, h) => {
    g.fillStyle = '#f7f8f8'; g.fillRect(0, 0, w, h);
    // le voile des anciens effacements
    for (let k = 0; k < 18; k++) {
      const x = Math.random() * w, y = Math.random() * h, r = 60 + Math.random() * 160, gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, 'rgba(150,160,175,0.06)'); gr.addColorStop(1, 'rgba(150,160,175,0)');
      g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
    }
    const feutre = (c, l = 4) => { g.strokeStyle = c; g.fillStyle = c; g.lineWidth = l; g.lineCap = 'round'; g.lineJoin = 'round'; };
    const ecrire = (txt, x, y, taille, c) => { feutre(c); g.font = `italic 500 ${taille}px "Segoe Print", "Comic Sans MS", "Segoe UI", sans-serif`; g.fillText(txt, x, y); };
    if (sujet === 'swot') {
      ecrire('Mardi 7 octobre', 40, 52, 30, '#1f3e8a');
      ecrire('Analyse SWOT — étude de cas', 300, 60, 40, '#1f3e8a');
      feutre('#1f3e8a', 5); g.beginPath(); g.moveTo(300, 74); g.lineTo(820, 70); g.stroke();
      feutre('#2a2a2a', 5);
      g.strokeRect(120, 110, 780, 360); g.beginPath(); g.moveTo(510, 110); g.lineTo(510, 470); g.moveTo(120, 290); g.lineTo(900, 290); g.stroke();
      ecrire('Forces', 140, 150, 30, '#1b7a3c'); ecrire('Faiblesses', 530, 150, 30, '#c22a2a');
      ecrire('Opportunités', 140, 330, 30, '#1b7a3c'); ecrire('Menaces', 530, 330, 30, '#c22a2a');
      const lignes = [[150, 190, 'image de marque'], [150, 225, 'réseau d\'entreprises'], [560, 190, 'coûts fixes'], [560, 225, 'peu de digital'],
        [150, 370, 'marché en hausse'], [150, 405, 'alternance'], [560, 370, 'concurrence'], [560, 405, 'prix bas en ligne']];
      for (const [x, y, t] of lignes) ecrire('– ' + t, x, y, 24, '#2a2a2a');
    } else if (sujet === 'moore') {
      // (la salle Gordon Earle Moore, 104 : sa loi, au feutre — le nombre de transistors d'une puce, échelle logarithmique)
      ecrire('BTS SIO — Archi.', 30, 50, 26, '#1f3e8a');
      ecrire('La loi de Moore : × 2 tous les 2 ans', 360, 60, 36, '#1f3e8a');
      feutre('#1f3e8a', 5); g.beginPath(); g.moveTo(360, 74); g.lineTo(960, 70); g.stroke();
      feutre('#2a2a2a', 4);
      g.beginPath(); g.moveTo(110, 110); g.lineTo(110, 460); g.lineTo(960, 460); g.stroke();
      ecrire('transistors', 30, 100, 22, '#2a2a2a'); ecrire('années', 870, 446, 22, '#2a2a2a');
      const pts = [[1971, 2300, '4004 : 2 300'], [1989, 1.2e6, '486 : 1,2 M'], [2006, 2.91e8, 'Core 2 : 291 M'], [2022, 1.14e11, 'M1 Ultra : 114 Md']];
      const px = (a) => 130 + (a - 1970) * 15.5, py = (n) => 450 - (Math.log10(n) - 3) * 42;
      feutre('#c22a2a', 4); g.beginPath(); g.moveTo(px(1970), py(1500)); g.lineTo(px(2024), py(1500 * 2 ** 27)); g.stroke();
      for (const [a, n, t] of pts) {
        feutre('#1b7a3c', 4); g.beginPath(); g.arc(px(a), py(n), 9, 0, 7); g.fill();
        ecrire(t, px(a) + (a > 2010 ? -250 : 16), py(n) + (a > 2010 ? 40 : 8), 22, '#2a2a2a');
        ecrire(String(a), px(a) - 24, 486, 20, '#2a2a2a');
      }
    } else {
      ecrire('BTS SIO — Réseaux', 40, 56, 38, '#1f3e8a');
      ecrire('VLAN 10 : 192.168.10.0/24', 560, 56, 26, '#2a2a2a');
      feutre('#2a2a2a', 4);
      const boite = (x, y, bw, bh, t, c = '#2a2a2a') => { feutre(c, 4); g.strokeRect(x, y, bw, bh); ecrire(t, x + 14, y + bh / 2 + 10, 26, c); };
      boite(420, 110, 170, 70, 'Routeur', '#c22a2a');
      boite(420, 250, 170, 70, 'Switch', '#1f3e8a');
      feutre('#2a2a2a', 4);
      g.beginPath(); g.moveTo(505, 180); g.lineTo(505, 250); g.stroke();
      for (const [x, t] of [[140, 'PC 1'], [340, 'PC 2'], [560, 'Srv AD'], [780, 'Impr.']]) {
        g.beginPath(); g.moveTo(505, 320); g.lineTo(x + 60, 400); g.stroke();
        boite(x, 400, 130, 60, t);
      }
      ecrire('Internet', 700, 140, 26, '#1b7a3c');
      g.beginPath(); g.moveTo(590, 145); g.lineTo(690, 135); g.stroke();
    }
  }, null, false, 8);
}
// L'ÉCRAN D'UN POSTE : bureau bleu et sa barre (ou l'éditeur sombre)
function texPoste(n) {
  return canvasTex(256, 160, (g, w, h) => {
    if (n % 3 === 1) {
      g.fillStyle = '#1e1f26'; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 12; i++) { g.fillStyle = ['#e06c75', '#61afef', '#98c379', '#d7dae0'][(i + n) % 4]; g.fillRect(16 + (i % 3) * 8, 12 + i * 11, 40 + ((i * 37 + n * 13) % 120), 5); }
      return;
    }
    const d = g.createLinearGradient(0, 0, w, h); d.addColorStop(0, '#1b4f8a'); d.addColorStop(1, '#0b2747');
    g.fillStyle = d; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,0.12)'; g.beginPath(); g.arc(w * 0.7, h * 0.4, 50, 0, 7); g.fill();
    g.fillStyle = '#ffffff'; g.font = '600 30px "Century Gothic", "Segoe UI", sans-serif'; g.fillText('iris', 18, 46);
    g.fillStyle = 'rgba(20,24,30,0.85)'; g.fillRect(0, h - 16, w, 16);
    for (let i = 0; i < 6; i++) { g.fillStyle = ['#4c9be8', '#f2b705', '#e04e3a', '#3e9b6b', '#cccccc', '#7b2a6e'][i]; g.fillRect(90 + i * 14, h - 12, 9, 9); }
  }, null, false, 2);
}
// L'HORLOGE (10 h 10, comme dans les catalogues)
function texHorloge() {
  return canvasTex(256, 256, (g, w) => {
    const c = w / 2;
    g.clearRect(0, 0, w, w);
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(c, c, c - 4, 0, 7); g.fill();
    g.lineWidth = 10; g.strokeStyle = '#1a1a1a'; g.stroke();
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * Math.PI * 2;
      g.lineWidth = i % 3 ? 4 : 8; g.beginPath(); g.moveTo(c + Math.sin(a) * (c - 20), c - Math.cos(a) * (c - 20)); g.lineTo(c + Math.sin(a) * (c - 40), c - Math.cos(a) * (c - 40)); g.stroke();
    }
    const aiguille = (a, l, e) => { g.lineWidth = e; g.lineCap = 'round'; g.beginPath(); g.moveTo(c, c); g.lineTo(c + Math.sin(a) * l, c - Math.cos(a) * l); g.stroke(); };
    aiguille((10 + 10 / 60) / 12 * Math.PI * 2, c * 0.5, 9); aiguille(10 / 60 * Math.PI * 2, c * 0.75, 6);
    g.strokeStyle = '#d0262d'; aiguille(0.6, c * 0.8, 2);
  }, null, true, 4);
}
// LE LUMINAIRE À GRILLE DE DÉFILEMENT, vu de dessous, allumé (photos 11 et 12 : par la grande baie, des barres jaunes
// de tubes au plafond ; par la 2e fenêtre, une grille argentée à alvéoles). Quatre tubes dans la longueur, les
// réflecteurs en V entre eux, huit lames en travers ; chaque alvéole s'éclaire au droit de son tube. Les teintes
// tiennent compte du matériau (sans éclairage, sa couleur multipliée par 1,75) : seuls les tubes passent le seuil du
// halo, la grille reste d'un gris d'aluminium.
function texGrille() {
  const W = TELEPHONE ? 256 : 512;
  return canvasTex(W, W, (g, w, h) => {
    const bord = w * 0.045, i0 = bord, i1 = w - bord, L = i1 - i0;
    g.fillStyle = '#e9e8e4'; g.fillRect(0, 0, w, h);                      // le cadre blanc
    g.fillStyle = '#5c5d60'; g.fillRect(i0, i0, L, L);                     // le fond du caisson
    // les tubes et leur lueur sur le réflecteur (dégradé de part et d'autre)
    for (let k = 0; k < 4; k++) {
      const cx = i0 + L * (k + 0.5) / 4, lg = L / 4;
      const gr = g.createLinearGradient(cx - lg / 2, 0, cx + lg / 2, 0);
      gr.addColorStop(0, 'rgba(150,148,144,1)'); gr.addColorStop(0.32, 'rgba(214,210,200,1)');
      gr.addColorStop(0.5, 'rgba(255,253,246,1)'); gr.addColorStop(0.68, 'rgba(214,210,200,1)'); gr.addColorStop(1, 'rgba(150,148,144,1)');
      g.fillStyle = gr; g.fillRect(cx - lg / 2, i0, lg, L);
      g.fillStyle = '#ffffff'; g.fillRect(cx - w * 0.022, i0, w * 0.044, L);
    }
    // les réflecteurs longitudinaux (arêtes des V, vues par la tranche)
    for (let k = 1; k < 4; k++) { const x = i0 + L * k / 4; g.fillStyle = '#b9b9b6'; g.fillRect(x - w * 0.009, i0, w * 0.018, L); g.fillStyle = '#7d7e80'; g.fillRect(x - w * 0.002, i0, w * 0.004, L); }
    // les lames transversales (la grille) : dessus mat, une arête claire
    for (let k = 0; k <= 8; k++) {
      const y = i0 + L * k / 8;
      g.fillStyle = '#8c8d8f'; g.fillRect(i0, y - w * 0.012, L, w * 0.024);
      g.fillStyle = '#c4c4c1'; g.fillRect(i0, y - w * 0.003, L, w * 0.006);
    }
    g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = w * 0.006; g.strokeRect(i0, i0, L, L);
  }, null, false, 8);
}
// LES CLASSEURS d'une étagère (dos de couleur, étiquettes)
function texClasseurs() {
  return canvasTex(512, 128, (g, w, h) => {
    const r2 = graine(5150);
    g.fillStyle = '#2a2a2a'; g.fillRect(0, 0, w, h);
    let x = 2;
    while (x < w - 4) {
      const l = 22 + r2() * 22, c = ['#2f6fb0', '#c8262c', '#3e9b6b', '#f2b705', '#7b2a6e', '#e8e6e0', '#2b2b2b', '#f08a24'][Math.floor(r2() * 8)];
      g.fillStyle = c; g.fillRect(x, 6 + r2() * 8, l - 2, h - 10);
      g.fillStyle = 'rgba(255,255,255,0.85)'; g.fillRect(x + 4, h * 0.25, l - 10, 18);
      g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.arc(x + l / 2 - 1, h * 0.72, 5, 0, 7); g.fill();
      x += l;
    }
  }, null, false, 4);
}

// =====================================================================
//  LES OUTILS DE L'ÉTAGE
// =====================================================================
// UNE BOÎTE EN COORDONNÉES DU MONDE, UV comprises : u le long de chaque face (de gauche à droite pour qui la regarde),
// v vers le haut, en mètres du monde — les joints de la pierre et de la faïence tombent juste d'un morceau à l'autre.
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
// un plan rectangulaire arrondi, extrudé (assises, dossiers, plateaux)
function geoPlaque(w, d, e, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -d / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + d - r);
  s.quadraticCurveTo(x + w, y + d, x + w - r, y + d); s.lineTo(x + r, y + d); s.quadraticCurveTo(x, y + d, x, y + d - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  const g = new THREE.ExtrudeGeometry(s, { depth: e, bevelEnabled: true, bevelThickness: Math.min(0.006, e / 3), bevelSize: Math.min(0.006, e / 3), bevelSegments: 2, curveSegments: 4 });
  g.translate(0, 0, -e / 2);
  g.rotateX(-Math.PI / 2);            // à plat : w le long de x, d le long de z, épaisseur en y
  return g;
}
// la direction (monde) d'une face du plan, et la rotation d'un groupe dont le +z local y regarde
const DIR = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };
const ROT = { S: 0, N: Math.PI, E: Math.PI / 2, W: -Math.PI / 2 };

export function poserEtage1(ch, renderer = null) {
  const { C, M } = ch;
  const groupe = new THREE.Group(); groupe.name = '1er étage';
  ch.scene.add(groupe);
  // les outils du chantier posent dans le groupe de l'étage le temps du crochet (plafonds, luminaires, portes)
  const decor0 = ch.decor, portes0 = ch.portes.decor;
  ch.decor = groupe; ch.portes.decor = groupe;

  // ---- les matières propres à l'étage ----
  const std = (o) => new THREE.MeshStandardMaterial(o);
  const X = {
    pierre: jourDehors(std({ map: texPierreEtage(), roughness: 0.75 }), 0.1),
    chene: std({ map: texChene(), roughness: 0.48 }),
    blancTable: std({ color: 0xeeece6, roughness: 0.42 }),
    anthracite: std({ color: 0x34363b, roughness: 0.45, metalness: 0.55 }),
    coque: std({ color: 0x2c2e33, roughness: 0.5 }),
    tissu: std({ color: 0x2a2c31, roughness: 0.92 }),
    ecranNoir: std({ color: 0x0d0e10, roughness: 0.25, metalness: 0.3 }),
    armoire: std({ color: 0xd9d6cf, roughness: 0.5 }),
    feuille: std({ color: 0x3d6b3a, roughness: 0.6, side: THREE.DoubleSide }),
    pot: std({ color: 0x2d2d2d, roughness: 0.7 }),
  };
  // (10/10 : l'espace pause vert anis de la 105, copié du sous-sol, et les toilettes de l'étage ne sont plus : la vidéo
  // officielle met là l'espace pause orange, js/ecole_etage1_pause.js)
  // (le carrelage de l'étage : une copie du carrelage du rez-de-chaussée, qui recevra sa propre lumière et sa propre
  // ombre cuites ; une rugosité à peine différente : l'optimisation du décor ne doit pas la confondre avec l'autre)
  const matSol = M.sol.clone(); matSol.roughness = 0.949; matSol.name = 'carrelage du 1er étage';
  const lampes = [];                                    // les lampes de l'étage (cuites sur son carrelage)
  const ombrants = [];                                  // ce qui porte ombre quand Haythem est à l'étage
  const sieges = [];

  // UNE BOÎTE de l'étage (plan, hauteurs absolues), UV du monde
  const B = (x0, y0, x1, y1, h0, h1, mat, { ombre = true, collision = false, camera = true, parent = groupe } = {}) => {
    const m = new THREE.Mesh(geoMonde(Math.min(x0, x1), Math.min(y0, y1), Math.max(x0, x1), Math.max(y0, y1), h0, h1), mat);
    m.castShadow = ombre; m.receiveShadow = true; parent.add(m);
    if (collision) C.ajouterBoite(x0, -y0, x1, -y1, { y0: h0, y1: h1, camera });
    return m;
  };
  // UN PANNEAU collé contre une face (`face` : la direction où il regarde)
  const panneau = (mat, w, h, x, y, hc, face) => {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    p.position.set(x, hc, -y); p.rotation.y = ROT[face]; p.receiveShadow = true; groupe.add(p);
    return p;
  };

  // UN MUR DE L'ÉTAGE de (x0, y0) à (x1, y1), parallèle à un axe, de `base` à `h` : comme ch.mur (js/carte_ecole.js),
  // mais ses plinthes se posent sur le plancher de l'étage et ses UV sont celles du monde
  const mur = ({ de, a, ep = EP, base = N1, h = DALLE2, mats, plinthes = [], ouvertures = [], camera = true }) => {
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
        for (const c of plinthes) {
          const s = c === cotes[0] ? 1 : -1, v = s * (ep / 2 + 0.0075);
          const [px0, py0, px1, py1] = R(v - 0.0075, v + 0.0075);
          B(px0, py0, px1, py1, base, base + 0.08, M.bois, { ombre: false });
        }
      }
    }
  };

  // UNE PORTE de l'étage (ch.porte, posée sur le plancher). Une porte OUVERTE à demeure n'a pas de forme dans le monde
  // solide (js/ecole_portes.js) : ses vantaux en reçoivent une ici, leur boîte au sol — on ne les traverse pas.
  const porte = (axe, ligne, c, o) => {
    const P = ch.porte(axe, ligne, c, { l: 0.93, h: 2.04, base: N1, modele: 'grise', ...o });
    if (o.etat === 'ouverte') bloquerVantaux(P.g, o.base ?? N1, o.h ?? 2.04);
    return P;
  };
  const bloquerVantaux = (g, base, h) => {
    g.updateMatrixWorld(true);
    const bb = new THREE.Box3();
    for (const v of g.children) {
      if (!v.isGroup) continue;
      bb.setFromObject(v);
      C.ajouterBoite(bb.min.x, bb.min.z, bb.max.x, bb.max.z, { y0: base, y1: base + h });
    }
  };

  // UNE LAMPE de l'étage : posée par les outils du chantier (son disque, sa galette), elle est cuite sur le carrelage
  // de l'étage seulement (`cuire: false` : pas sur celui du rez-de-chaussée), et ses spots visent le plancher (`base`)
  const opts = (o = {}) => ({ base: N1, cuire: false, ...o });
  const noter = () => lampes.push(ch.lampes[ch.lampes.length - 1]);
  const opale = (x, y, h, zone, o = {}) => { ch.opale(x, y, h, zone, opts(o)); noter(); };
  const spot = (x, y, h, zone, o = {}) => { ch.spot(x, y, h, zone, opts(o)); noter(); };
  // LE LUMINAIRE À GRILLE de 60 x 60 encastré dans le faux plafond des salles : quatre tubes sous une grille de
  // défilement d'aluminium (photo 12 : par la grande baie, des barres de tubes allumés, jaunâtres ; photo 11 : une grille
  // argentée à alvéoles au plafond, derrière la 2e fenêtre)
  const matDalle = new THREE.MeshBasicMaterial({ map: texGrille(), color: new THREE.Color(0xfff1dc).multiplyScalar(1.75) }); matDalle.name = 'luminaire à grille allumé';
  const dalle = (x, y, zone) => {
    B(x - 0.31, y - 0.31, x + 0.31, y + 0.31, H_SALLE - 0.012, H_SALLE + 0.02, M.boitier, { ombre: false });
    const d = maille(new THREE.PlaneGeometry(0.58, 0.58), matDalle, x, H_SALLE - 0.0125, -y, 0, groupe, { ombre: false, recoit: false });
    d.rotation.x = Math.PI / 2;
    const L = { x, z: -y, h: H_SALLE, zone, type: 'dalle', base: N1, cuire: false, force: 1.05 };
    ch.lampes.push(L); lampes.push(L);
  };

  // =====================================================================
  //  LA FAÇADE DU 1er ÉTAGE (photos 11, 12, 16 à 18)
  // =====================================================================
  // Le mur de façade de l'étage (40 cm, pierre dehors, enduit blanc dedans), percé de ses douze fenêtres : celles des
  // travées 2 à 11 comme les étages du dessus (1,30 x 1,25 m, allège à 0,95 m : la tuile de js/ecole_matieres.js
  // texEtage), la grande baie de la travée 1 et la fenêtre étroite de la travée 12 aux mesures de leurs encadrements
  // rouges (js/carte_ecole.js cadre). Menuiserie brun-noir en retrait de 25 cm, tablette blanche, et pour la baie et la
  // fenêtre des pompiers, la pastille rouge collée sur la vitre (photos 12, 16).
  function construireFacade1() {
    const F = [];
    // (la baie et la fenêtre des pompiers : des châssis fixes, deux vantaux pour la baie, un seul pour l'étroite)
    F.push({ c: 0.825, l: 1.9, bas: N1 + 0.8, haut: N1 + 2.35, simple: 2, pompiers: [1.11, 1.45] });
    for (let k = 2; k <= 11; k++) F.push({ c: centreTravee(k), l: 1.3, bas: N1 + 0.95, haut: N1 + 2.2 });
    F.push({ c: centreTravee(12), l: 1.1, bas: N1 + 0.83, haut: N1 + 2.32, simple: 1, pompiers: [18.53, 1.95] });
    mur({ de: [-0.3, -0.2], a: [20.1, -0.2], ep: 0.4, h: N2, mats: { N: M.blanc, S: X.pierre },
      ouvertures: F.map((f) => ({ c: f.c, l: f.l, bas: f.bas, h: f.haut })) });
    // (repère de js/ecole_portes.js fenetreFacade : +z vers l'intérieur, donc tourné de PI ; x local = -x du plan)
    const fac = new THREE.Group(); fac.position.set(0, 0, 0.2); fac.rotation.y = Math.PI; groupe.add(fac);
    const pastille = new THREE.MeshStandardMaterial({ color: 0xd8262c, roughness: 0.4 });
    // LE REFLET DE LA RUE : dehors, en plein jour, une vitre se voit d'abord par ce qu'elle reflète (photos 12, 17 : les
    // immeubles d'en face, le ciel) ; une seconde face, sombre et brillante, tournée vers la rue seulement — vue de la
    // salle, elle n'existe pas (face arrière), la vitre reste claire
    const vitreRue = new THREE.MeshStandardMaterial({ color: 0x4d5862, roughness: 0.05, metalness: 0.6, transparent: true, opacity: 0.55, depthWrite: false, envMapIntensity: 1.5 });
    vitreRue.name = 'vitre de l\'étage vue de la rue';
    for (const f of F) {
      // (les bureaux ont des stores à lames verticales, comme l'accueil du rez-de-chaussée, photo 03)
      if (f.simple) fenetreSimple(f);
      else fenetreFacade(fac, M, { x: -f.c, l: f.l, bas: f.bas, haut: f.haut, ep: 0.4, barreaux: false, imposte: true, stores: f.c > 13.2 });
      const r = new THREE.Mesh(new THREE.PlaneGeometry(f.l - 0.1, f.haut - f.bas - 0.1), vitreRue);
      r.position.set(f.c, (f.bas + f.haut) / 2, 0.158); r.castShadow = false; groupe.add(r);
      // (les vitres arrêtent la caméra ; le jour, lui, passe : `vitre`)
      C.ajouterBoite(f.c - f.l / 2, 0.4, f.c + f.l / 2, 0, { y0: f.bas, y1: f.haut, vitre: true });
      if (f.pompiers) {
        // la pastille rouge des accès pompiers, des deux côtés de la vitre (le vitrage est à 25 cm du nu extérieur :
        // en z = 0,15 dans le monde)
        const [px, ph] = f.pompiers;
        for (const s of [1, -1]) {
          const d = new THREE.Mesh(new THREE.CircleGeometry(0.075, 24), pastille);
          d.position.set(px, N1 + ph, s > 0 ? 0.156 : 0.144); d.rotation.y = s > 0 ? 0 : Math.PI; groupe.add(d);
        }
      }
    }
    // LE JOUR qui entre par chaque fenêtre : une nappe froide cuite sur le carrelage de l'étage (source au pied de la
    // fenêtre, découpée depuis dehors), et pour les spots, une lampe froide dehors par salle, qui vise l'intérieur
    const zoneDe = (x) => (x < 1.65 ? 'e1bureau' : x < 13.2 ? 'e1salle' : x < 16.5 ? 'e103' : 'e104');
    for (const f of F) {
      const L = { type: 'jour', x: f.c, z: 0.9, h: N1 + 2.4, sx: f.c, sz: -0.45, ox: f.c, oz: 0.5, zone: zoneDe(f.c), reel: false, cuire: false, base: N1, cuireForce: f.l > 1.5 ? 1.0 : 0.8 };
      ch.lampes.push(L); lampes.push(L);
    }
    for (const x of [1.6, 4.9, 8.3, 11.5, 14.85, 18.15]) ch.lampes.push({ type: 'jour', x, z: 1.2, h: N1 + 2.6, cx: x, cz: -3.4, zone: zoneDe(x), base: N1, cuire: false, poids: 1.6 });
  }
  // UN CHÂSSIS FIXE de la façade (la baie rouge, la fenêtre des pompiers) : la menuiserie brun-noir dans le plan des
  // autres (25 cm en retrait du nu), `simple` vantaux, l'appui de pierre dehors, la tablette blanche dedans
  function fenetreSimple(f) {
    const x0 = f.c - f.l / 2, x1 = f.c + f.l / 2, c = 0.06, ya = -0.185, yb = -0.115;
    B(x0, ya, x1, yb, f.bas, f.bas + c, M.menuiserie); B(x0, ya, x1, yb, f.haut - c, f.haut, M.menuiserie);
    B(x0, ya, x0 + c, yb, f.bas, f.haut, M.menuiserie); B(x1 - c, ya, x1, yb, f.bas, f.haut, M.menuiserie);
    for (let k = 1; k < f.simple; k++) { const x = x0 + k * f.l / f.simple; B(x - 0.03, ya, x + 0.03, yb, f.bas, f.haut, M.menuiserie); }
    const v = new THREE.Mesh(new THREE.PlaneGeometry(f.l - 2 * c, f.haut - f.bas - 2 * c), M.vitreJour);
    v.position.set(f.c, (f.bas + f.haut) / 2, 0.15); groupe.add(v);
    B(x0 - 0.03, -0.42, x1 + 0.03, ya, f.bas - 0.05, f.bas, M.pierreAppui || M.pierre);
    B(x0, yb, x1, 0.02, f.bas - 0.025, f.bas, M.blanc, { ombre: false });
  }

  // =====================================================================
  //  LES CLOISONS ET LES PORTES
  // =====================================================================
  function construireMurs() {
    const B0 = M.blanc;
    // les mitoyens (l'ouest du bureau de la travée 1 et du couloir sombre, l'est de la salle 104 et le bout du couloir)
    mur({ de: [-0.15, 0], a: [-0.15, 8.99], ep: 0.3, mats: B0, plinthes: ['E'] });
    // (10/10 : plein — l'issue de secours du bout de la bande tombait dans la gaine de l'ascenseur, VO q_0274-0281)
    mur({ de: [19.95, 0], a: [19.95, 8.99], ep: 0.3, mats: B0, plinthes: ['W'] });
    // la cloison entre le bureau 103 et la salle 104 (la salle S 1.3, le bureau de la travée 1, le recoin : leurs murs
    // sont dans js/ecole_etage1_pause.js)
    for (const x of [16.5]) mur({ de: [x, 0], a: [x, Y_SALLES - EP / 2], mats: B0, plinthes: ['E', 'W'] });
    // LA CLOISON NORD DES SALLES, le long de la bande sud du palier est (x 13,61-19,8) ; à l'ouest du palier,
    // js/ecole_etage1_pause.js (la porte de la salle S 1.3, les jours dépolis, la bouche du recoin)
    // (09/10 : le mur sud du palier est, entre la porte du couloir et x 14,5, n'a pas de porte ; 10/10 : la bande sud non
    // plus, jusqu'à l'ascenseur — VO q_0274-0281 : les portes du 103 et de la 104 n'y sont pas, et le recoin n'en montre
    // pas non plus (VO q_0270) ; leur accès n'est pas vu : ils restent fermés, IMAGINÉS — js/ecole_ascenseur.js)
    mur({ de: [13.61, Y_SALLES], a: [19.8, Y_SALLES], mats: B0, plinthes: ['N', 'S'] });
    // LE COULOIR SOMBRE (VO 47,5-49 s : derrière la porte du fond de l'espace pause, « on n'y voit que du noir » —
    // IMAGINÉ) : du mitoyen au palier d'étage. Au nord de son bout ouest, le local ménage (porte de gaine fermée)
    mur({ de: [-0.3, Y_COUR], a: [1.6, Y_COUR], mats: B0, plinthes: ['S'], ouvertures: [{ c: 0.8, l: 0.95 }] });
    porte('x', Y_COUR, 0.8, { modele: 'gaine', etat: 'fermee', cote: 'S', ep: 0.12, nom: 'local ménage' });
    // LE PALIER D'ÉTAGE : à l'ouest, le mur safran (comme celui de la salle d'attente, photos 02, 21) ; à l'est, le dos du
    // mur du fond de l'espace pause (js/ecole_etage1_pause.js)
    mur({ de: [1.675, Y_COUR - EP / 2], a: [1.675, 12.45], ep: 0.15, mats: { E: M.orange, W: B0 }, plinthes: ['E'] });
  }

  // =====================================================================
  //  LES SOLS (le carrelage de l'étage et le monde solide)
  // =====================================================================
  function construireSols() {
    // le carrelage : le bureau 103 et la salle 104 (grand côté est-ouest), le couloir sombre (est-ouest), le palier
    // d'étage (nord-sud) — la salle S 1.3 a sa moquette, l'espace pause son lino (js/ecole_etage1_pause.js)
    const rects = [
      [13.2, 0, 19.95, 5.45, 'ew'], [13.55, 5.45, 19.95, Y_SALLES, 'ew'], [-0.3, Y_SALLES, 4.675, Y_COUR, 'ew'],
      [1.6, Y_COUR, 4.675, 12.6, 'ns'],
    ];
    const pos = [], nor = [], uv = [], uv1 = [], idx = [];
    const W = R1.x1 - R1.x0, L = R1.y1 - R1.y0;
    for (const [x0, y0, x1, y1, sens] of rects) {
      const b = pos.length / 3;
      for (const [x, y] of [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]) {
        pos.push(x, N1, -y); nor.push(0, 1, 0);
        if (sens === 'ns') uv.push(y, -(x - 1.75)); else uv.push(x - 1.75, y);
        uv1.push((x - R1.x0) / W, (y - R1.y0) / L);
      }
      idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setAttribute('uv1', new THREE.Float32BufferAttribute(uv1, 2));
    g.setIndex(idx);
    const sol = new THREE.Mesh(g, matSol); sol.receiveShadow = true; sol.castShadow = false; sol.name = 'carrelage du 1er étage';
    sol.userData.solEtage = true;
    groupe.add(sol);
    // LE MONDE SOLIDE : le plancher de l'étage (une dalle à 3,50 m qui couvre tout ce qu'on peut y fouler, seuils des
    // portes compris : là où aucune dalle ne couvre, solEn rendrait le rez-de-chaussée), et pour la caméra seule, le
    // dessous du plancher (hors de la cage d'escalier)
    // (x -0,3-19,95, y 0-12,6 : salles, couloir, palier d'étage — sauf au-dessus des volées de l'escalier est, x 16,05-19,95
    // y 9,075-12,6 : on y retomberait sur un plancher invisible)
    // (au nord de y 12,6, l'alcôve de l'espace pause et le seuil de la Si 1.4 : js/ecole_etage1_pause.js)
    C.sol(-0.3, 0, 19.95, -9.075, N1);
    C.sol(-0.3, -9.075, 16.05, -12.6, N1);
    C.ajouterBoite(-0.3, 0, 19.95, -Y_COUR - 0.1, { y0: N1 - 0.32, y1: N1 - 0.02, joueur: false });
    C.ajouterBoite(1.6, -Y_COUR, 13.55, -12.45, { y0: N1 - 0.32, y1: N1 - 0.02, joueur: false });
  }

  // =====================================================================
  //  LES FAUX PLAFONDS ET LES LUMINAIRES
  // =====================================================================
  function construirePlafondsEtLumieres() {
    // le bureau 103 et la salle 104 : plateaux perforés (comme la salle d'attente, photos 02, 21), luminaires à grille
    // (la salle S 1.3 et le bureau de la travée 1 : dalles 60 x 60, js/ecole_etage1_pause.js)
    ch.plafond(13.2, 0, 16.5, Y_SALLES, H_SALLE, 'plateaux');
    ch.plafond(16.5, 0, 19.8, Y_SALLES, H_SALLE, 'plateaux');
    for (const y of [1.8, 4.8]) { dalle(14.85, y, 'e103'); dalle(18.15, y, 'e104'); }
    // le couloir sombre et le palier d'étage : plâtre et hublots opales (comme les couloirs C01 et C05, photos 01, 05) ;
    // le hublot du couloir éteint (VO 48 s : derrière la porte du fond de l'espace pause, le noir)
    ch.plafond(0, Y_SALLES, 4.6, Y_COUR, H_COUL, 'platre');
    ch.plafond(1.75, Y_COUR, 4.6, 12.45, H_COUL, 'platre');
    maille(new THREE.CylinderGeometry(0.17, 0.156, 0.07, 36), new THREE.MeshStandardMaterial({ color: 0xd9d7d1, roughness: 0.5 }), 1.2, H_COUL - 0.035, -7.95, 0, groupe, { ombre: false });
    for (const y of [10.0, 11.7]) opale(3.2, y, H_COUL, 'e1hall');
  }

  // =====================================================================
  //  L'ESCALIER VERS LE 2e (fermé)
  // =====================================================================
  // La même cage, les mêmes marches que l'escalier du rez-de-chaussée (photos 06, 20, 04), en deux volées de dix
  // contremarches de 15,5 cm : la volée 3 monte au nord dans la moitié est (au-dessus de la volée 1), le palier
  // intermédiaire à 5,05 m, la volée 4 revient au sud dans la moitié ouest jusqu'au palier du 2e (6,60 m), fermé par
  // une double porte coupe-feu. Les volées sont des dalles à paillasse (on voit leur sous-face depuis le bas).
  function construireEscalier2() {
    const G = E.G, N = E.N;
    const extru = (pts, prof, mat, x, z, rotY) => {
      const sh = new THREE.Shape(); pts.forEach(([s, h], i) => (i ? sh.lineTo(s, h) : sh.moveTo(s, h)));
      const m = maille(new THREE.ExtrudeGeometry(sh, { depth: prof, bevelEnabled: false }), mat, x, 0, z, rotY, groupe);
      return m;
    };
    const volee = (b) => {
      const p = [[0, b]];
      for (let i = 0; i < N - 1; i++) p.push([i * G, b + (i + 1) * R2], [(i + 1) * G, b + (i + 1) * R2]);
      p.push([(N - 1) * G, b + (N - 1) * R2 - 0.3], [0, b - 0.25]);
      return p;
    };
    extru(volee(N1), E.xE1 - E.xE0, M.beton, E.xE0, -E.y0, Math.PI / 2);          // la volée 3 (est, vers le nord)
    extru(volee(P2), E.xO1 - E.xO0, M.beton, E.xO1, -E.yPalier, -Math.PI / 2);    // la volée 4 (ouest, vers le sud)
    // le palier intermédiaire (dalle) et le palier du 2e
    B(E.xO0, E.yPalier, E.xE1, 18.6, P2 - 0.25, P2 - 0.02, M.beton);
    B(E.xO0, E.yPalier, E.xE1, 18.6, P2 - 0.02, P2, M.solEtage);
    B(1.6, 12.45, 4.75, E.y0, DALLE2, N2 - 0.02, M.beton);
    B(E.xO0, 12.6, E.xE1, E.y0, N2 - 0.02, N2, M.solEtage);
    B(E.xO1, E.y0 - 0.04, E.xE1, E.y0, N2, N2 + 0.004, M.nez, { ombre: false });
    // les marches (dessus gris, nez sombre)
    for (let i = 0; i < N - 1; i++) {
      const h = N1 + (i + 1) * R2, ya = E.y0 + i * G;
      B(E.xE0, ya, E.xE1, ya + G, h, h + 0.012, M.marche);
      B(E.xE0, ya, E.xE1, ya + 0.04, h + 0.012, h + 0.016, M.nez, { ombre: false });
      const h2 = P2 + (i + 1) * R2, yb = E.yPalier - (i + 1) * G;
      B(E.xO0, yb, E.xO1, yb + G, h2, h2 + 0.012, M.marche);
      B(E.xO0, yb + G - 0.04, E.xO1, yb + G, h2 + 0.012, h2 + 0.016, M.nez, { ombre: false });
    }
    B(E.xE0, E.yPalier, E.xE1, E.yPalier + 0.04, P2, P2 + 0.004, M.nez, { ombre: false });
    // ---- LES GARDE-CORPS (acier gris, barreaux tous les 11 cm, lisse plate) ----
    const barre = (x, y, h0, h1) => B(x - 0.007, y - 0.007, x + 0.007, y + 0.007, h0, h1, M.garde);
    const poteau = (x, y, h0, h1) => B(x - 0.025, y - 0.025, x + 0.025, y + 0.025, h0, h1, M.garde);
    const lisse = (x, ya, ha, yb, hb) => {
      const L = Math.hypot(yb - ya, hb - ha), m = maille(boiteM(0.05, 0.012, L), M.garde, x, (ha + hb) / 2, -(ya + yb) / 2, 0, groupe);
      m.rotation.x = Math.atan2(hb - ha, yb - ya);
    };
    const xi1 = E.xE0 + 0.03, xi2 = E.xO1 - 0.03;
    for (let s = 0.12; s < (N - 1) * G - 0.05; s += 0.11) {
      const i = Math.floor(s / G);
      barre(xi1, E.y0 + s, N1 + (i + 1) * R2 + 0.012, N1 + R2 + s * R2 / G + 0.9);
      barre(xi2, E.yPalier - s, P2 + (i + 1) * R2 + 0.012, P2 + R2 + s * R2 / G + 0.9);
    }
    lisse(xi1, E.y0, N1 + R2 + 0.92, E.yPalier, P2 + 0.92);
    lisse(xi2, E.yPalier, P2 + R2 + 0.92, E.y0, N2 + 0.92);
    poteau(xi1, E.y0 + 0.03, N1 + R2, N1 + R2 + 0.98); poteau(xi1, E.yPalier - 0.03, P2, P2 + 0.98);
    poteau(xi2, E.yPalier - 0.03, P2, P2 + 0.98); poteau(xi2, E.y0 + 0.03, N2 - R2, N2 + 0.98);
    B(xi2, E.yPalier - 0.05, xi1, E.yPalier - 0.01, P2 + 0.92, P2 + 0.97, M.garde);
    // le garde-corps du palier du 2e, au-dessus du vide de la volée 3
    for (let x = E.xO1 + 0.1; x < E.xE1 - 0.05; x += 0.11) barre(x, E.y0 - 0.03, N2, N2 + 0.95);
    B(E.xO1, E.y0 - 0.055, E.xE1, E.y0 - 0.005, N2 + 0.95, N2 + 0.99, M.garde);
    poteau(E.xE1 - 0.03, E.y0 - 0.03, N2, N2 + 0.99);
    // les mains courantes rondes, au mur (supports tous les 80 cm)
    const mainCourante = (x, ya, ha, yb, hb) => {
      const L = Math.hypot(yb - ya, hb - ha), t = maille(new THREE.CylinderGeometry(0.02, 0.02, L, 10), M.garde, x, (ha + hb) / 2, -(ya + yb) / 2, 0, groupe);
      t.rotation.x = -Math.atan2(yb - ya, hb - ha);
      for (let k = 0.2; k < 1; k += 0.3) B(x - 0.01, ya + (yb - ya) * k - 0.01, x + (x > 3 ? 0.06 : -0.06), ya + (yb - ya) * k + 0.01, ha + (hb - ha) * k - 0.08, ha + (hb - ha) * k - 0.02, M.garde, { ombre: false });
    };
    mainCourante(E.xE1 - 0.06, E.y0, N1 + R2 + 0.85, E.yPalier, P2 + 0.85);
    mainCourante(E.xO0 + 0.06, E.yPalier, P2 + R2 + 0.85, E.y0, N2 + 0.85);
    // ---- LA CAGE au-dessus de l'étage : les murs jusqu'au plafond de la cage, le palier du 2e et sa porte ----
    mur({ de: [1.675, 12.45], a: [1.675, 18.75], ep: 0.15, base: DALLE2, h: H_CAGE2, mats: M.blanc });
    mur({ de: [4.675, 12.45], a: [4.675, 18.75], ep: 0.15, base: DALLE2, h: H_CAGE2, mats: M.blanc });
    mur({ de: [1.6, 18.675], a: [4.75, 18.675], ep: 0.15, base: DALLE2, h: H_CAGE2, mats: M.blanc });
    mur({ de: [1.6, 12.525], a: [4.75, 12.525], ep: 0.15, base: DALLE2, h: H_CAGE2, mats: M.blanc, ouvertures: [{ c: 3.5, l: 1.8, bas: N2, h: N2 + 2.1 }] });
    // (les plinthes du palier du 2e et du palier intermédiaire)
    for (const [x0, y0, x1, y1, h] of [[1.75, 12.6, 1.765, 14.2, N2], [4.585, 12.6, 4.6, 14.2, N2], [1.75, 12.585, 2.6, 12.6, N2], [4.4, 12.585, 4.6, 12.6, N2],
      [1.75, 18.585, 4.6, 18.6, P2], [1.75, E.yPalier, 1.765, 18.6, P2], [4.585, E.yPalier, 4.6, 18.6, P2]]) B(x0, y0, x1, y1, h, h + 0.08, M.bois, { ombre: false });
    porte('x', 12.525, 3.5, { l: 1.8, h: 2.1, base: N2, modele: 'grise2', feu: true, etat: 'fermee', cote: 'N', notices: 1, noticesD: 1, nom: '2e étage' });
    panneau(new THREE.MeshStandardMaterial({ map: texPlaque('2e', 'étage — fermé'), roughness: 0.4 }), 0.3, 0.15, 2.1, 12.605, N2 + 1.6, 'N');
    ch.plafond(E.xO0, 12.6, E.xE1, 18.6, H_CAGE2, 'platre', { retombees: false });
    // les lumières de la cage : la galette du palier intermédiaire, au mur ; celles du plafond de la cage
    // (celle du palier intermédiaire compte depuis le rez-de-chaussée — base 0 : vue de la volée 1, voisine, elle est
    // « trop haut » et n'est jamais prise pour un spot qui éclairerait au travers du palier)
    opale(3.2, 18.6, P2 + 2.0, 'palier1', { mur: 'S', r: 0.15, base: 0 });
    opale(3.2, 13.4, H_CAGE2, 'palier1', { r: 0.18, base: N2 });
    opale(3.9, 16.4, H_CAGE2, 'palier1', { r: 0.18, base: N2 });
    // ---- LE MONDE SOLIDE ----
    C.rampe(E.xE0, -(E.yPalier + G / 2), E.xE1, -(E.y0 - G / 2), 'z', -(E.y0 - G / 2), N1, -(E.yPalier + G / 2), P2);
    C.sol(E.xO0, -18.6, E.xE1, -E.yPalier, P2);
    C.rampe(E.xO0, -(E.yPalier + G / 2), E.xO1, -(E.y0 - G / 2), 'z', -(E.yPalier + G / 2), P2, -(E.y0 - G / 2), N2);
    C.sol(E.xO0, -E.y0, E.xE1, -12.55, N2);
    // entre les volées : le mur pour le joueur continue au-dessus de celui du rez-de-chaussée (5,20 m)
    C.ajouterBoite(E.xO1, -E.yPalier, E.xE0, -E.y0, { y0: 5.2, y1: N2 + 1.2 });
    // le garde-corps du palier du 2e
    C.ajouterBoite(E.xO1, -(E.y0 - 0.06), E.xE1, -E.y0, { y0: N2, y1: N2 + 1.1 });
    // la caméra ne passe pas au travers des volées, des paliers ni de la dalle du 2e
    const sof = (b) => (s) => b - 0.25 + s * ((b + (N - 1) * R2 - 0.3 - (b - 0.25)) / ((N - 1) * G));
    const sof3 = sof(N1), sof4 = sof(P2);
    for (let i = 0; i < N - 1; i++) {
      const ya = E.y0 + i * G;
      C.ajouterBoite(E.xE0, -ya, E.xE1, -(ya + G), { y0: sof3((i + 0.5) * G), y1: N1 + (i + 1) * R2, joueur: false });
      const yb = E.yPalier - (i + 1) * G;
      C.ajouterBoite(E.xO0, -yb, E.xO1, -(yb + G), { y0: sof4((i + 0.5) * G), y1: P2 + (i + 1) * R2, joueur: false });
    }
    C.ajouterBoite(E.xO0, -E.yPalier, E.xE1, -18.6, { y0: P2 - 0.25, y1: P2, joueur: false });
    C.ajouterBoite(1.6, -12.45, 4.75, -E.y0, { y0: DALLE2, y1: N2, joueur: false });
  }

  // =====================================================================
  //  LE MOBILIER
  // =====================================================================
  // UNE CHAISE DE CLASSE (coque de polypropylène anthracite, quatre pieds d'acier) : `dir` = où regarde qui s'y assied.
  // Le siège (js/game.js) : l'assise à 46 cm, et le point d'où l'on se relève (`sortie`, en plan : dans l'allée).
  const _geoAssise = geoPlaque(0.43, 0.41, 0.022, 0.06), _geoDossier = geoPlaque(0.42, 0.27, 0.02, 0.05);
  const _geoPied = new THREE.CylinderGeometry(0.011, 0.011, 1, 8);
  const chaise = (x, y, dir, { mat = X.coque, sortie = null, nom = 'la chaise', recul = 0 } = {}) => {
    const [fx, fz] = DIR[dir];
    const g = new THREE.Group(); g.position.set(x, N1, -y); g.rotation.y = Math.atan2(fx, fz); groupe.add(g);
    g.position.x -= fx * recul; g.position.z -= fz * recul;
    maille(_geoAssise, mat, 0, 0.455, 0.01, 0, g);
    const d = maille(_geoDossier, mat, 0, 0.72, -0.2, 0, g); d.rotation.x = Math.PI / 2 - 0.16;
    const pied = (px, pz, h0, h1, inc = 0) => { const p = maille(_geoPied, X.anthracite, px, (h0 + h1) / 2, pz, 0, g); p.scale.y = h1 - h0; p.rotation.x = inc; return p; };
    for (const [px, pz] of [[-0.18, 0.17], [0.18, 0.17], [-0.18, -0.17], [0.18, -0.17]]) pied(px, pz, 0, 0.445, pz > 0 ? -0.06 : 0.06);
    for (const px of [-0.17, 0.17]) pied(px, -0.2, 0.45, 0.66, 0.16);
    for (const pz of [-0.17, 0.17]) maille(boiteM(0.38, 0.012, 0.012), X.anthracite, 0, 0.43, pz, 0, g);
    C.ajouterCercle(g.position.x, g.position.z, 0.2, { y0: N1, y1: N1 + 0.9 });
    const s = sortie || [x - fx * 0.6, y + fz * 0.6];
    sieges.push({ x: g.position.x + fx * 0.04, z: g.position.z + fz * 0.04, y: 0.46, fx, fz, sx: s[0], sz: -s[1], nom, sol: N1 });
    return g;
  };
  // LE FAUTEUIL DE BUREAU (piétement cinq branches, assise rembourrée, dossier résille)
  const fauteuil = (x, y, dir, { sortie = null, nom = 'le fauteuil' } = {}) => {
    const [fx, fz] = DIR[dir];
    const g = new THREE.Group(); g.position.set(x, N1, -y); g.rotation.y = Math.atan2(fx, fz); groupe.add(g);
    for (let k = 0; k < 5; k++) {
      const a = k / 5 * Math.PI * 2;
      maille(boiteM(0.3, 0.025, 0.04), X.anthracite, Math.cos(a) * 0.15, 0.06, Math.sin(a) * 0.15, -a, g);
      maille(new THREE.SphereGeometry(0.025, 8, 6), M.noirMat, Math.cos(a) * 0.3, 0.025, Math.sin(a) * 0.3, 0, g, { ombre: false });
    }
    maille(new THREE.CylinderGeometry(0.022, 0.03, 0.36, 10), X.anthracite, 0, 0.25, 0, 0, g);
    maille(geoPlaque(0.5, 0.47, 0.07, 0.08), X.tissu, 0, 0.47, 0.02, 0, g);
    const d = maille(geoPlaque(0.46, 0.5, 0.04, 0.1), X.tissu, 0, 0.84, -0.23, 0, g); d.rotation.x = Math.PI / 2 - 0.12;
    maille(boiteM(0.04, 0.32, 0.03), X.anthracite, 0, 0.62, -0.24, 0, g);
    for (const sx of [-0.27, 0.27]) { maille(boiteM(0.05, 0.03, 0.26), M.noirMat, sx, 0.66, 0.02, 0, g); maille(boiteM(0.025, 0.16, 0.025), X.anthracite, sx, 0.58, -0.02, 0, g); }
    C.ajouterCercle(g.position.x, g.position.z, 0.26, { y0: N1, y1: N1 + 1.0 });
    const s = sortie || [x - fx * 0.65, y + fz * 0.65];
    sieges.push({ x: g.position.x + fx * 0.03, z: g.position.z + fz * 0.03, y: 0.5, fx, fz, sx: s[0], sz: -s[1], nom, sol: N1 });
    return g;
  };
  // UNE TABLE : plateau (chêne clair ou blanc) sur quatre pieds carrés anthracite et deux ceintures ; `lx`, `ly` en plan
  const table = (x, y, lx, ly, { mat = X.chene, h = 0.745, collision = true } = {}) => {
    const x0 = x - lx / 2, x1 = x + lx / 2, y0 = y - ly / 2, y1 = y + ly / 2;
    B(x0, y0, x1, y1, N1 + h - 0.025, N1 + h, mat);
    B(x0, y0, x1, y1, N1 + h - 0.027, N1 + h - 0.025, M.noirMat, { ombre: false });
    for (const [px, py] of [[x0 + 0.05, y0 + 0.05], [x1 - 0.05, y0 + 0.05], [x0 + 0.05, y1 - 0.05], [x1 - 0.05, y1 - 0.05]]) B(px - 0.018, py - 0.018, px + 0.018, py + 0.018, N1, N1 + h - 0.025, X.anthracite);
    if (lx >= ly) for (const py of [y0 + 0.05, y1 - 0.05]) B(x0 + 0.07, py - 0.01, x1 - 0.07, py + 0.01, N1 + h - 0.09, N1 + h - 0.027, X.anthracite, { ombre: false });
    else for (const px of [x0 + 0.05, x1 - 0.05]) B(px - 0.01, y0 + 0.07, px + 0.01, y1 - 0.07, N1 + h - 0.09, N1 + h - 0.027, X.anthracite, { ombre: false });
    if (collision) C.ajouterBoite(x0, -y0, x1, -y1, { y0: N1, y1: N1 + h + 0.02 });
  };
  // UN ÉCRAN D'ORDINATEUR posé sur une table, tourné vers `dir` (vers qui le regarde) ; clavier et souris devant
  const _ecrans = [0, 1, 2, 3].map((n) => new THREE.MeshBasicMaterial({ map: texPoste(n), color: new THREE.Color(0.95, 0.95, 0.95) }));
  const ordinateur = (x, y, dir, n = 0) => {
    const [fx, fz] = DIR[dir];
    const g = new THREE.Group(); g.position.set(x, N1 + 0.745, -y); g.rotation.y = Math.atan2(fx, fz); groupe.add(g);
    maille(boiteM(0.2, 0.012, 0.16), X.ecranNoir, 0, 0.006, -0.12, 0, g);
    maille(boiteM(0.04, 0.2, 0.025), X.ecranNoir, 0, 0.11, -0.14, 0, g);
    maille(boiteM(0.55, 0.33, 0.022), X.ecranNoir, 0, 0.33, -0.12, 0, g);
    const e = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.3), _ecrans[n % 4]); e.position.set(0, 0.335, -0.108); g.add(e);
    maille(boiteM(0.42, 0.016, 0.13), M.noirMat, 0, 0.008, 0.12, 0, g, { ombre: false });
    maille(boiteM(0.06, 0.02, 0.1), M.noirMat, 0.3, 0.01, 0.13, 0, g, { ombre: false });
    return g;
  };
  // LE RADIATEUR sous une fenêtre (photos 03, 06, 21) : panneau blanc, grille dessus
  const radiateur = (x, y, face, l, h0 = 0.15, h1 = 0.75) => {
    const e = 0.08;
    const [ax0, ay0, ax1, ay1] = face === 'N' ? [x - l / 2, y, x + l / 2, y + e] : face === 'S' ? [x - l / 2, y - e, x + l / 2, y] : face === 'E' ? [x, y - l / 2, x + e, y + l / 2] : [x - e, y - l / 2, x, y + l / 2];
    B(ax0, ay0, ax1, ay1, N1 + h0, N1 + h1, M.radiateur, { collision: true });
    B(ax0 + 0.01, ay0 + 0.01, ax1 - 0.01, ay1 - 0.01, N1 + h1, N1 + h1 + 0.005, M.grille, { ombre: false });
  };
  // LE TABLEAU BLANC (cadre d'aluminium, auget pour les feutres) contre un mur, tourné vers `face`
  const tableauBlanc = (x, y, face, w, sujet) => {
    const g = new THREE.Group(); g.position.set(x, N1, -y); g.rotation.y = ROT[face]; groupe.add(g);
    maille(boiteM(w + 0.04, 1.24, 0.025), M.alu, 0, 1.5, 0.0125, 0, g);
    const t = new THREE.Mesh(new THREE.PlaneGeometry(w, 1.2), new THREE.MeshStandardMaterial({ map: texTableau(sujet), roughness: 0.16 }));
    t.position.set(0, 1.5, 0.026); t.receiveShadow = true; g.add(t);
    maille(boiteM(w * 0.6, 0.02, 0.07), M.alu, 0, 0.885, 0.05, 0, g);
    for (const [k, c] of [[0, 0x1f3e8a], [1, 0xc22a2a], [2, 0x1b7a3c], [3, 0x111111]]) {
      const f = maille(new THREE.CylinderGeometry(0.009, 0.009, 0.13, 8), new THREE.MeshStandardMaterial({ color: c, roughness: 0.5 }), -0.3 + k * 0.08, 0.905, 0.055, 0, g, { ombre: false });
      f.rotation.z = Math.PI / 2;
    }
    maille(boiteM(0.12, 0.05, 0.05), M.noirMat, 0.25, 0.92, 0.055, 0, g, { ombre: false });
    return g;
  };
  // LE VIDÉOPROJECTEUR au plafond (boîtier blanc sur sa canne), tourné vers l'écran (`dir`)
  const projecteur = (x, y, dir) => {
    const g = new THREE.Group(); g.position.set(x, H_SALLE, -y); g.rotation.y = ROT[dir]; groupe.add(g);
    maille(new THREE.CylinderGeometry(0.02, 0.02, 0.32, 8), M.boitier, 0, -0.16, 0, 0, g);
    maille(boiteM(0.14, 0.01, 0.14), M.boitier, 0, -0.005, 0, 0, g, { ombre: false });
    maille(geoPlaque(0.34, 0.28, 0.11, 0.03), M.boitier, 0, -0.38, 0, 0, g);
    const l = maille(new THREE.CylinderGeometry(0.035, 0.04, 0.03, 16), M.noirMat, 0.08, -0.38, 0.14, 0, g); l.rotation.x = Math.PI / 2;
    maille(new THREE.CircleGeometry(0.028, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.6, 1.7) }), 0.08, -0.38, 0.156, 0, g, { ombre: false, recoit: false });
  };
  // L'HORLOGE murale
  const matHorloge = new THREE.MeshStandardMaterial({ map: texHorloge(), transparent: true, roughness: 0.3 });
  const horloge = (x, y, h, face) => {
    const p = panneau(matHorloge, 0.32, 0.32, x, y, h, face);
    p.position.x += DIR[face][0] * 0.03; p.position.z += DIR[face][1] * 0.03;
  };
  // L'EXTINCTEUR sur sa console et son pictogramme (photo 06)
  const matPicto = new THREE.MeshStandardMaterial({ map: texPictoExtincteur(), roughness: 0.6 });
  const extincteur = (x, y, face) => {
    const [fx, fz] = DIR[face];
    const g = new THREE.Group(); g.position.set(x + fx * 0.09, N1, -y + fz * 0.09); groupe.add(g);
    maille(new THREE.CylinderGeometry(0.075, 0.075, 0.48, 16), M.rougeEtiquette, 0, 1.2, 0, 0, g);
    maille(new THREE.CylinderGeometry(0.03, 0.045, 0.08, 10), M.noirMat, 0, 1.48, 0, 0, g);
    maille(boiteM(0.06, 0.06, 0.06), M.noirMat, -fx * 0.07, 1.35, -fz * 0.07, 0, g);
    C.ajouterCercle(g.position.x, g.position.z, 0.09, { y0: N1 + 0.9, y1: N1 + 1.6 });
    panneau(matPicto, 0.16, 0.16, x + fx * 0.006, y - fz * 0.006, N1 + 1.9, face);
  };
  // UNE PLANTE (sansevière : des feuilles en lames dressées dans un pot noir)
  const plante = (x, y, { h = 0.9 } = {}) => {
    const g = new THREE.Group(); g.position.set(x, N1, -y); groupe.add(g);
    maille(new THREE.CylinderGeometry(0.17, 0.14, 0.36, 18), X.pot, 0, 0.18, 0, 0, g);
    maille(new THREE.CylinderGeometry(0.155, 0.155, 0.01, 18), new THREE.MeshStandardMaterial({ color: 0x3b2c20, roughness: 1 }), 0, 0.34, 0, 0, g, { ombre: false });
    const r2 = graine(Math.round(x * 100 + y * 7));
    const geo = new THREE.PlaneGeometry(0.07, 1, 1, 4);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const v = p.getY(i) + 0.5; p.setX(i, p.getX(i) * (1 - v * 0.85)); }
    geo.translate(0, 0.5, 0); geo.computeVertexNormals();
    for (let k = 0; k < 14; k++) {
      const a = r2() * Math.PI * 2, r = r2() * 0.08, f = maille(geo, X.feuille, Math.cos(a) * r, 0.33, Math.sin(a) * r, a, g);
      f.scale.y = h * (0.55 + r2() * 0.5); f.rotation.x = (r2() - 0.5) * 0.35; f.rotation.z = (r2() - 0.5) * 0.35;
    }
    C.ajouterCercle(x, -y, 0.19, { y0: N1, y1: N1 + 0.8 });
  };
  // UNE ARMOIRE HAUTE (deux portes, poignées) contre un mur, tournée vers `face`
  const armoire = (x, y, face, l, h = 1.95, p = 0.45, mat = X.armoire) => {
    const g = new THREE.Group(); g.position.set(x, N1, -y); g.rotation.y = ROT[face]; groupe.add(g);
    maille(boiteM(l, h, p), mat, 0, h / 2, p / 2, 0, g);
    maille(boiteM(0.004, h - 0.06, 0.002), M.noirMat, 0, h / 2, p + 0.001, 0, g, { ombre: false });
    for (const s of [-1, 1]) maille(boiteM(0.012, 0.16, 0.02), M.inox, s * 0.04, h * 0.55, p + 0.01, 0, g, { ombre: false });
    // (sa boîte au sol, en monde : le meuble part du mur et avance de `p` vers `face`)
    const [fx, fz] = DIR[face], cx = g.position.x + fx * p / 2, cz = g.position.z + fz * p / 2;
    const hx = Math.abs(fz) * l / 2 + Math.abs(fx) * p / 2, hz = Math.abs(fx) * l / 2 + Math.abs(fz) * p / 2;
    C.ajouterBoite(cx - hx, cz - hz, cx + hx, cz + hz, { y0: N1, y1: N1 + h });
    return g;
  };
  // UNE ÉTAGÈRE de classeurs (montants, quatre tablettes)
  const matClasseurs = new THREE.MeshStandardMaterial({ map: texClasseurs(), roughness: 0.7 });
  const etagere = (x, y, face, l, h = 1.8) => {
    const g = new THREE.Group(); g.position.set(x, N1, -y); g.rotation.y = ROT[face]; groupe.add(g);
    const p = 0.32;
    for (const s of [-1, 1]) maille(boiteM(0.02, h, p), X.armoire, s * (l / 2 - 0.01), h / 2, p / 2, 0, g);
    maille(boiteM(l, h, 0.01), X.armoire, 0, h / 2, 0.005, 0, g);
    for (let k = 0; k < 5; k++) maille(boiteM(l - 0.04, 0.02, p), X.armoire, 0, 0.05 + k * (h - 0.1) / 4, p / 2, 0, g);
    for (let k = 0; k < 4; k++) {
      const c = new THREE.Mesh(new THREE.PlaneGeometry(l - 0.06, (h - 0.1) / 4 - 0.06), matClasseurs);
      c.position.set(0, 0.06 + k * (h - 0.1) / 4 + ((h - 0.1) / 4 - 0.06) / 2 + 0.01, p - 0.04); g.add(c);
      maille(boiteM(l - 0.06, (h - 0.1) / 4 - 0.07, 0.24), new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.8 }), 0, 0.06 + k * (h - 0.1) / 4 + ((h - 0.1) / 4 - 0.07) / 2 + 0.01, p - 0.165, 0, g, { ombre: false });
    }
    const [fx, fz] = DIR[face], cx = g.position.x + fx * p / 2, cz = g.position.z + fz * p / 2;
    const hx = Math.abs(fz) * l / 2 + Math.abs(fx) * p / 2, hz = Math.abs(fx) * l / 2 + Math.abs(fz) * p / 2;
    C.ajouterBoite(cx - hx, cz - hz, cx + hx, cz + hz, { y0: N1, y1: N1 + h });
    return g;
  };
  // UNE AFFICHE (texture de js/ecole_matieres.js) collée au mur
  const affiche = (teinte, fond, n, w, h, x, y, hc, face) => panneau(new THREE.MeshStandardMaterial({ map: texAffiche(teinte, fond, n), roughness: 0.7 }), w, h, x, y, N1 + hc, face);
  // UNE PLAQUE DE SALLE (09/10, photo 23 : 15 x 9 cm, à 1,65 m — un peu plus grande ici, pour qu'on la lise)
  const plaqueSalle = (l1, l2, l3, x, y, face, picto = null) => panneau(new THREE.MeshStandardMaterial({ map: texPlaqueSalle(l1, l2, l3, picto), roughness: 0.35 }), 0.18, 0.108, x, y, N1 + 1.65, face);

  // =====================================================================
  //  LE BUREAU 103 : la pédagogie (travées 9 et 10, au-dessus de la porte 6)
  // =====================================================================
  function meublerBureau103() {
    // deux postes face à face près des fenêtres, une petite table ronde pour les rendez-vous, armoires et classeurs
    table(14.25, 1.3, 1.4, 0.75, { mat: X.blancTable }); table(15.55, 1.3, 1.0, 0.75, { mat: X.blancTable });
    ordinateur(14.25, 1.15, 'N', 0); ordinateur(15.55, 1.45, 'S', 1);
    fauteuil(14.25, 1.95, 'S', { sortie: [14.25, 2.6] });
    fauteuil(15.55, 0.6, 'N', { sortie: [16.05, 2.2] });
    armoire(13.26, 3.2, 'E', 1.0); armoire(13.26, 4.2, 'E', 1.0);
    etagere(16.44, 3.6, 'W', 1.6);
    // la table ronde et ses deux chaises — (relecture du 09/10 : la porte est passée en x 15,35 ; la table, restée devant
    // elle avec sa chaise, fermait le bureau : Haythem butait sur le seuil. Elle va dans l'angle nord-ouest, à côté du
    // vantail ouvert)
    maille(new THREE.CylinderGeometry(0.45, 0.45, 0.025, 32), X.blancTable, 14.25, N1 + 0.73, -5.55, 0, groupe);
    maille(new THREE.CylinderGeometry(0.03, 0.03, 0.72, 10), X.anthracite, 14.25, N1 + 0.36, -5.55, 0, groupe);
    maille(new THREE.CylinderGeometry(0.25, 0.25, 0.015, 24), X.anthracite, 14.25, N1 + 0.008, -5.55, 0, groupe);
    C.ajouterCercle(14.25, -5.55, 0.46, { y0: N1, y1: N1 + 0.75 });
    chaise(14.25, 4.8, 'N', { sortie: [14.85, 4.5] });
    chaise(15.05, 5.55, 'W', { sortie: [15.55, 5.0] });
    plante(16.05, 6.5, { h: 1.1 });
    for (const k of [9, 10]) radiateur(centreTravee(k), 0.0, 'N', 1.0);
    affiche('#2b4c9b', '#fbfbf8', 65, 0.42, 0.6, 16.43, 1.8, 1.5, 'W');
  }

  // =====================================================================
  //  LA SALLE 104 : « Salle Gordon Earle Moore », Si 1.5 (travées 11 et 12, la fenêtre des pompiers ; non vue)
  // =====================================================================
  // (09/10 : le panneau d'étage du palier est, photo 28, la range parmi les salles de cours — ce n'est plus la salle des
  // enseignants. Étroite, 3,30 m : une salle de TD en deux îlots de six, le tableau blanc au mur nord, à côté de la porte
  // ; des allées de 65 à 70 cm tout autour des îlots)
  function meublerSalle104() {
    for (const yc of [1.85, 4.55]) {
      table(18.2, yc, 1.0, 2.0, { mat: X.chene });
      for (const d of [-0.6, 0, 0.6]) {
        chaise(17.45, yc + d, 'E', { sortie: [16.95, yc + d] });
        chaise(18.95, yc + d, 'W', { sortie: [19.45, yc + d] });
      }
    }
    tableauBlanc(18.75, Y_SALLES - EP / 2, 'S', 1.6, 'moore');
    for (const k of [11]) radiateur(centreTravee(k), 0.0, 'N', 1.0);
    plante(16.95, 0.5);
    affiche('#e07b2a', '#fbfbf8', 66, 0.42, 0.6, 19.795, 2.2, 1.5, 'W');
    horloge(19.8, 3.3, N1 + 2.2, 'W');
  }

  // =====================================================================
  //  LE COULOIR SOMBRE ET LE PALIER D'ÉTAGE
  // =====================================================================
  function garnirCouloir() {
    // (10/10 : le panneau de l'étage n'est qu'au palier est — VO 43 s, photo 28 ; sa copie du mur safran, et celles de
    // l'affichette « WIFI IRIS » et de l'affiche « POINT ÉCOUTE », n'ont pas lieu d'être ici) ; le plan d'évacuation,
    // l'extincteur, un tableau d'affichage
    panneau(new THREE.MeshStandardMaterial({ map: texConsignes(), roughness: 0.5 }), 0.45, 0.62, 1.757, 9.45, N1 + 1.6, 'E');
    affiche('#2f6fb0', '#fbfbf8', 73, 0.6, 0.85, 1.757, 10.75, 1.55, 'E');
    affiche('#f2b705', '#1d1d1d', 70, 0.5, 0.7, 1.757, 11.6, 1.55, 'E');
    extincteur(4.6, 11.2, 'W');
    // le bloc de sortie au-dessus de la porte de l'escalier, côté étage
    ch.sortie(3.5, 12.4, N1 + 2.32, 'S');
    // les plaques des portes de la salle S 1.3, de la Si 1.4 et de l'espace pause : js/ecole_etage1_pause.js ; la S 1.6
    // est au fond du palier : js/ecole_est.js (10/10 : celles du 103 et de la 104 sont parties avec leurs portes, VO
    // q_0274-0281)
    // le banc du palier d'étage (lattes de chêne sur deux piètements), où l'on attend le cours
    const xb0 = 4.07, xb1 = 4.55, yb0 = 9.25, yb1 = 10.75;
    for (let k = 0; k < 4; k++) B(xb0 + 0.02 + k * 0.115, yb0, xb0 + 0.11 + k * 0.115, yb1, N1 + 0.42, N1 + 0.45, X.chene);
    for (const y of [yb0 + 0.12, yb1 - 0.12]) B(xb0 + 0.03, y - 0.02, xb1 - 0.03, y + 0.02, N1, N1 + 0.42, X.anthracite);
    C.ajouterBoite(xb0, -yb0, xb1, -yb1, { y0: N1, y1: N1 + 0.47 });
    for (const y of [9.6, 10.4]) sieges.push({ x: (xb0 + xb1) / 2, z: -y, y: 0.45, fx: -1, fz: 0, sx: xb0 - 0.5, sz: -y, nom: 'le banc', sol: N1 });
    // (10/10 : le radiateur de la bande sud, x 19,0, tombait derrière le doublage de l'ascenseur — js/ecole_ascenseur.js)
  }

  // =====================================================================
  //  LA CONSTRUCTION (les outils du chantier posent dans le groupe de l'étage le temps du crochet)
  // =====================================================================
  let pause = null;
  try {
    construireFacade1();
    construireMurs();
    construireSols();
    construirePlafondsEtLumieres();
    construireEscalier2();
    meublerBureau103();
    meublerSalle104();
    garnirCouloir();
    // L'ESPACE PAUSE, LA SALLE S 1.3, LE RECOIN, LE BUREAU DE LA TRAVÉE 1 (10/10, la vidéo officielle) : avec nos outils
    pause = poserPause1(ch, { groupe, lampes, sieges, R1, B, panneau, porte, spot, dalle, radiateur, projecteur, fauteuil, ordinateur, texPlaqueSalle });
    // LE PALIER EST ET LA CAGE DE L'ESCALIER EST (photos 27 à 29) : dans le groupe de l'étage, ses lampes cuites avec les
    // nôtres, son vinyle sur notre lumière et notre ombre cuites (js/ecole_est.js)
    poserPalierEst(ch, { groupe, lampes, matSol, R1 });
  } finally {
    ch.decor = decor0; ch.portes.decor = portes0;
  }
  // la double porte de l'escalier (js/carte_ecole.js), ouverte à demeure côté étage : ses vantaux sont solides
  const porteEscalier = decor0.getObjectByName('porte 1er étage');
  if (porteEscalier) bloquerVantaux(porteEscalier, N1, 2.1);

  // =====================================================================
  //  LA LUMIÈRE CUITE ET L'OMBRE DOUCE DU CARRELAGE DE L'ÉTAGE
  // =====================================================================
  // Le même calcul qu'au rez-de-chaussée (js/ecole_lumieres.js cuireLumiereSol) sur les murs de l'étage, ramenés au sol
  // (le calcul ne regarde que les formes qui partent du sol), et les lampes de l'étage, ramenées de même (celles de la
  // cage d'escalier, au-dessus d'autres paliers, n'y vont pas).
  const W1 = R1.x1 - R1.x0, L1 = R1.y1 - R1.y0;
  const proxy = { formes: C.formes.filter((f) => f.y0 > N1 - 0.35 && f.y0 < N1 + 0.3).map((f) => ({ ...f, y0: f.y0 - N1, y1: f.y1 - N1 })) };
  const aCuire = lampes.filter((L) => L.base === N1).map((L) => ({ ...L, h: L.h - N1, cuire: true }));
  const lm = cuireLumiereSol(proxy, aCuire, { x0: R1.x0, z0: -R1.y1, W: W1, L: L1 }, { tpm: 16 });
  matSol.lightMap = lm; matSol.lightMapIntensity = 1.4;
  // les objets de l'étage hors de l'ombre cuite du rez-de-chaussée (vus de dessus, ils recouvriraient tout)
  groupe.traverse((o) => { o.userData.horsAOSol = true; });
  if (renderer) {
    try { cuireOcclusionEtage(renderer, groupe, matSol); } catch (e) { console.warn('[étage] ombre du sol non cuite :', e); }
  }
  // (la moquette de la salle S 1.3 et le lino de l'espace pause reçoivent la même lumière et la même ombre cuites que le
  // carrelage : uv1 sur R1 ; la moquette, sombre et mate, un peu plus de lumière cuite)
  if (pause) {
    for (const m of pause.sols) {
      m.lightMap = lm; m.lightMapIntensity = m.roughness > 0.9 ? 1.25 : 1.0;
      if (matSol.aoMap) { m.aoMap = matSol.aoMap; m.aoMapIntensity = matSol.aoMapIntensity; }
      m.needsUpdate = true;
    }
  }
  // LA FUSION : les maillages opaques de l'étage cousus en un maillage par matériau (quelques dizaines d'appels de
  // dessin pour tout l'étage) ; l'optimisation du décor (js/kit_decor.js) ne touche plus au groupe — son ombre et sa
  // visibilité changent avec l'étage de Haythem.
  fusionnerLocal(groupe);
  nePasFusionner(groupe);
  groupe.traverse((o) => { o.userData.horsAOSol = true; if (o.isMesh && o.castShadow) ombrants.push(o); });
  ch.sieges.push(...sieges);

  // =====================================================================
  //  LES ZONES (pièces) de l'étage, pour js/ecole_lumieres.js
  // =====================================================================
  // (un rectangle qui demande des pieds à 2,60 m au moins : le joueur du rez-de-chaussée, dessous, n'y est pas)
  const zr = (x0, y0, x1, y1) => [x0, -y1, x1, -y0, 2.6];
  const env = (x, y) => ({ x, y: N1 + 1.6, z: -y });
  // (la carte du palier d'étage est prise à son débouché sur le couloir, pas au milieu : à 1,50 m du mur safran, il
  // emplissait la moitié de la carte, et le mur blanc d'en face, éclairé par lui, virait au saumon — mesuré : rouge
  // moins bleu de 92 contre 35 à 45 pour les autres murs blancs ; d'ici, 62, comme un reflet de couleur)
  // (10/10 : en tête, l'espace pause et son recoin, la salle S 1.3, le bureau de la travée 1 — js/ecole_etage1_pause.js)
  const zones = [
    ...(pause ? pause.zones : []),
    { id: 'e1hall', rects: [zr(1.6, Y_COUR, 4.75, 12.6)], voisines: ['palier1', 'e1couloir'], env: env(3.9, 8.3) },
    { id: 'e1couloir', rects: [zr(-0.3, Y_SALLES, 4.75, Y_COUR)], voisines: ['e1hall', 'e1pause', 'e1bureau'], env: env(2.6, 7.95) },
    { id: 'e103', rects: [zr(13.2, -0.2, 16.5, Y_SALLES)], voisines: ['e1est'], env: env(14.85, 3.6) },
    { id: 'e104', rects: [zr(16.5, -0.2, 20.0, Y_SALLES)], voisines: ['e1est'], env: env(18.15, 3.6) },
  ];

  // =====================================================================
  //  L'ÉTAGE VIVANT (js/carte_ecole.js maj, à chaque image)
  // =====================================================================
  let tous = null, niveau = null, haut = false;
  const maj = (dt, jeu) => {
    const u = jeu.user.pos, cam = jeu.camera.position;
    // VISIBLE quand la caméra peut le voir : dans la cage, au-dessus des plafonds du rez-de-chaussée, ou dehors
    // (et la cage de l'escalier est, depuis le vestibule : on y voit monter la volée 1 jusqu'au 1er. Pas depuis le
    // couloir est : par la porte du vestibule, le regard ne passe pas 2,3 m — relecture du 09/10, tout l'étage n'y est
    // plus dessiné pour rien ; ni depuis le hall du -1, sous la cage principale — intégration du 10/10)
    const cage = (cam.x > 1.4 && cam.x < 5.0 && cam.z < -12.2 && cam.z > -19.0 && cam.y > -0.3) || (cam.x > 14.4 && cam.x < 20.0 && cam.z < -10.6 && cam.z > -12.7);
    const vis = cage || cam.y > 2.7 || cam.z > -0.05 || u.y > 2.0;
    if (vis !== groupe.visible) groupe.visible = vis;
    // SON OMBRE quand Haythem y est (au-delà de la moitié de la volée 2 ; il redescend sous 2 m) — reposée à chaque
    // image : le cache de l'ombre du décor (js/ombre_cache.js) rallume ce qu'il a éteint le temps d'un rendu
    if (u.y > 2.5) haut = true; else if (u.y < 2.0) haut = false;
    for (const o of ombrants) o.castShadow = haut;
    // LES SIÈGES de son étage seulement (la liste est celle du jeu, js/game.js : on la remplit sur place) — trois niveaux
    // depuis le sous-sol (09/10, js/ecole_soussol.js : -1, 0, 1)
    if (!tous) tous = ch.sieges.slice();
    const lv = (h) => (h < -1.5 ? -1 : h > 2 ? 1 : 0);
    const n = u.y < -1.5 ? -1 : u.y > 2.0 ? 1 : 0;
    if (n !== niveau) {
      niveau = n;
      ch.sieges.length = 0;
      for (const s of tous) if (lv(s.sol || 0) === n) ch.sieges.push(s);
    }
  };
  console.info('[étage] 1er étage : %d sièges, %d lampes, %d ombrants', sieges.length, lampes.length, ombrants.length);
  return { zones, maj, groupe };
}

// =====================================================================
//  L'OMBRE DOUCE CUITE AU SOL DE L'ÉTAGE
// =====================================================================
// Le calcul de js/kit_decor.js (cuireOcclusionSol) refait pour un plancher en hauteur : une carte des hauteurs de
// l'étage vue de dessus (seulement ce qui part du plancher : murs, pieds de tables et de chaises, meubles — pas un
// plateau, ni un plafond), puis pour chaque texel du carrelage l'horizon dans 16 directions ; le ciel masqué vaut sin²
// de l'élévation de l'horizon. Le résultat est l'aoMap du carrelage de l'étage (sur uv1) : il n'assombrit que la
// lumière indirecte.
function cuireOcclusionEtage(renderer, groupe, matSol) {
  const rayon = 1.6, marge = 1.8, tpm = TELEPHONE ? 16 : 32;
  const W = R1.x1 - R1.x0, L = R1.y1 - R1.y0, WH = W + 2 * marge, LH = L + 2 * marge;
  const cx = (R1.x0 + R1.x1) / 2, cz = -(R1.y0 + R1.y1) / 2;
  const hw = Math.round(WH * tpm), hh = Math.round(LH * tpm), aw = Math.round(W * tpm), ah = Math.round(L * tpm);
  const cibleH = new THREE.WebGLRenderTarget(hw, hh, { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: true });
  const hauteur = new THREE.ShaderMaterial({
    uniforms: { uBase: { value: N1 } },
    vertexShader: 'varying float vH; void main() { vec4 wp = modelMatrix * vec4(position, 1.0); vH = wp.y; gl_Position = projectionMatrix * viewMatrix * wp; }',
    fragmentShader: 'uniform float uBase; varying float vH; void main() { gl_FragColor = vec4(vH - uBase, 0.0, 0.0, 1.0); }',
    side: THREE.DoubleSide,
  });
  const cam = new THREE.OrthographicCamera(-WH / 2, WH / 2, LH / 2, -LH / 2, 0.1, 100);
  cam.position.set(cx, N1 + 40, cz); cam.up.set(0, 0, -1); cam.lookAt(cx, N1, cz); cam.updateMatrixWorld();
  // la scène de la cuisson : le groupe de l'étage, le temps d'un rendu, sans ce qui n'est pas un obstacle
  const parent = groupe.parent, sc = new THREE.Scene();
  sc.add(groupe); sc.overrideMaterial = hauteur;
  const vu = new Map(), bb = new THREE.Box3();
  groupe.updateMatrixWorld(true);
  groupe.traverse((o) => {
    vu.set(o, o.visible);
    if (!o.isMesh) return;
    const m = o.material;
    if (!m || m.transparent || o.userData.solEtage) { o.visible = false; return; }
    bb.setFromObject(o);
    if (bb.min.y > N1 + 0.3 || bb.max.y < N1 + 0.05 || bb.min.y < N1 - 0.4) o.visible = false;
  });
  const couleur = renderer.getClearColor(new THREE.Color()), alpha = renderer.getClearAlpha(), avant = renderer.getRenderTarget();
  renderer.setRenderTarget(cibleH); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(sc, cam);
  groupe.traverse((o) => { if (vu.has(o)) o.visible = vu.get(o); });
  sc.remove(groupe); if (parent) parent.add(groupe);
  // l'horizon, puis un flou léger
  const cibleBrute = new THREE.WebGLRenderTarget(aw, ah, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
  const cibleAO = new THREE.WebGLRenderTarget(aw, ah, { minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter, generateMipmaps: true });
  const vs = 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';
  const calcul = new THREE.ShaderMaterial({
    uniforms: { tH: { value: cibleH.texture }, uTaille: { value: new THREE.Vector2(WH, LH) }, uZone: { value: new THREE.Vector2(W, L) }, uR: { value: rayon } },
    vertexShader: vs,
    fragmentShader: `uniform sampler2D tH; uniform vec2 uTaille, uZone; uniform float uR; varying vec2 vUv;
      float h(vec2 p) { return texture2D(tH, p / uTaille + 0.5).r; }
      float bruit(vec2 c) { return fract(52.9829189 * fract(dot(c, vec2(0.06711056, 0.00583715)))); }
      void main() {
        vec2 p = (vUv - 0.5) * uZone;
        float h0 = h(p), masque = 0.0, rot = bruit(gl_FragCoord.xy) * 0.3926991, dec = bruit(gl_FragCoord.yx + 7.0);
        for (int d = 0; d < 16; d++) {
          float a = (float(d) + 0.5) * 0.3926991 + rot;
          vec2 dir = vec2(cos(a), sin(a));
          float pente = 0.0;
          for (int s = 0; s < 12; s++) {
            float t = uR * pow((float(s) + dec) / 12.0, 1.6) + 0.02;
            pente = max(pente, (h(p + dir * t) - h0) / t);
          }
          masque += pente * pente / (1.0 + pente * pente);
        }
        gl_FragColor = vec4(vec3(1.0 - masque / 16.0), 1.0);
      }`,
    depthTest: false, depthWrite: false,
  });
  const flou = new THREE.ShaderMaterial({
    uniforms: { tAO: { value: cibleBrute.texture }, uPas: { value: new THREE.Vector2(1 / aw, 1 / ah) } },
    vertexShader: vs,
    fragmentShader: `uniform sampler2D tAO; uniform vec2 uPas; varying vec2 vUv;
      void main() {
        float s = 0.0, n = 0.0;
        for (int y = -2; y <= 2; y++) for (int x = -2; x <= 2; x++) {
          float w = 1.0 / (1.0 + float(x * x + y * y));
          s += texture2D(tAO, vUv + vec2(float(x), float(y)) * uPas * 1.5).r * w; n += w;
        }
        gl_FragColor = vec4(vec3(s / n), 1.0);
      }`,
    depthTest: false, depthWrite: false,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), calcul), sceneAO = new THREE.Scene(); sceneAO.add(quad);
  renderer.setRenderTarget(cibleBrute); renderer.render(sceneAO, cam);
  quad.material = flou; renderer.setRenderTarget(cibleAO); renderer.render(sceneAO, cam);
  renderer.setRenderTarget(avant); renderer.setClearColor(couleur, alpha);
  calcul.dispose(); flou.dispose(); hauteur.dispose(); quad.geometry.dispose(); cibleH.dispose(); cibleBrute.dispose();
  cibleAO.texture.channel = 1;
  matSol.aoMap = cibleAO.texture; matSol.aoMapIntensity = 1.0; matSol.needsUpdate = true;
}
