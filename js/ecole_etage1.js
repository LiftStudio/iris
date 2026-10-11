// =====================================================================
//  LE 1er ÉTAGE DE L'ÉCOLE IRIS (crochet de js/carte_ecole.js)
// =====================================================================
// Ce qui est SÛR vient des photos — la double porte coupe-feu du palier (photos 06 et 20), le palier est (27 à 29), la
// FAÇADE (11, 12, 16 à 18 : douze travées de 1,65 m, une fenêtre d'un vantail par travée à menuiserie brun-noir, les
// fenêtres hautes des encadrements rouges aux deux bouts, travées 1 et 12, et leurs pastilles des pompiers ; lot façade) —
// et, depuis le 10/10, de la VIDÉO OFFICIELLE DE VISITE (2021), qui parcourt l'étage de 41 à 68 s : l'espace pause
// orange derrière la porte du palier est, la salle de cours S 1.3 sur les travées 2 à 8, la porte de la salle Robert
// Kahn (js/ecole_etage1_pause.js). Le reste (le bureau 103, la salle 104, le couloir sombre, le palier d'étage ouest)
// est la distribution courante d'un étage d'école, dans les matières et la lumière du rez-de-chaussée — imaginé.
//
// LE PLAN DE L'ÉTAGE (repère du plan de js/carte_ecole.js : x le long de la façade, y vers le fond ; plancher à 3,50 m,
// dessous de la dalle du 2e à 6,40 m) — refait le 10/10 d'après la vidéo officielle de visite (2021), qui le parcourt
// (VO 41-68 s) ; ce qu'elle ne montre pas reste imaginé :
// (PLAN V2 du 11/10, plan_v2.md § 2.4 — retour de Haythem du 10/10 : « les salles sont trop compressées ». Le mur des
// jours descend de 2 m, y 6,975 → 4,95 : l'espace pause en prend 2 de plus, la S 1.3 en perd 2, le couloir sombre et le
// palier d'étage ouest descendent avec lui ; la salle Robert Kahn rentre dans le bâtiment ; le palier est rétrécit au nord)
//   le bureau de la travée 1             x 0-1,59    y 0-4,89    la fenêtre haute au cadre rouge (photo 12 : un bureau allumé)
//   la salle de cours S 1.3              x 1,71-13,14 y 0-4,89   travées 2 à 8, sept fenêtres (VO q_0198-0213)
//   bureau 103 (pédagogie)               x 13,61-16,44 y 0-6,9   travées 9 et 10 (au-dessus de la porte 6 ; au sud de
//                                        y 3,39, il commence en x 13,26, derrière la cloison de la S 1.3)
//   salle 104 (Gordon Earle Moore, Si 1.5) x 16,56-19,8 y 0-6,9  travées 11 et 12 (la fenêtre rouge des pompiers)
//   l'espace pause                       x 4,75-13,49 y 5,0-12,9 derrière la porte du palier est (VO q_0180-0219) ; au
//                                        nord, la porte de la salle Robert Kahn, Si 1.4 (js/ecole_kahn.js) ; au sud-est,
//                                        le recoin et la seconde porte de la salle ; en L autour du local fermé du coin
//                                        nord-ouest (relecture V2 : x 4,75-5,21 y 7,41-12,84), la niche des distributeurs
//                                        sur sa face est ; les poteaux en x 6,15 / 7,4 / 8,65, la porte de la Si 1.4 en
//                                        x 10,05-11,0 (js/ecole_etage1_pause.js)
//   le couloir sombre                    x 0-4,6     y 5,01-6,79 derrière la porte du fond de l'espace pause
//   le palier d'étage ouest              x 1,75-4,6  y 6,79-7,775 devant la double porte de l'escalier principal (ligne
//                                        7,85, js/carte_ecole.js), ouverte
//   le palier est et l'escalier est      x 13,61-19,8 y 7,0-12,45 (photos 27 à 29 : js/ecole_est.js poserPalierEst) ; le
//                                        103 et la 104 n'ont pas de porte sur lui (VO q_0274-0281)
//   fermés : le local au fond du renfoncement nord du palier est, le local ménage et les toilettes (x 0-1,6 y 6,91-13,9),
//   l'issue de secours, le 103 et la 104
// LES VRAIS NOMS (10/10) : le panneau d'étage du palier est (VO 43 s, photo 28) — « Salle de cours S 1.3, Salle Robert
// Kahn Si 1.4, Salle Gordon Earle Moore Si 1.5, Espace pause, Salle de cours S 1.6 » (S : salle de cours, Si : salle
// informatique) ; les plaques de portes sont celles de la photo 23 : noires, « Salle / nom / Si 1.x ».
// L'ESCALIER PRINCIPAL S'ARRÊTE ICI (plan V2 § 1.3, 11/10 : sa partie haute, deux volées vers un palier du 2e, était
// imaginée ; la vidéo officielle met la salle 1 du 2e au-dessus de la cage, son mur ouest en x 3,6). Sa cage, décalée
// de DY_S avec tout le bloc ouest (x 1,75-4,6 × y 7,925-13,925 au 1er), monte d'un jet jusqu'au dessous de la dalle du 2e.
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
import { jourDehors, texAffiche, texConsignes, texPictoExtincteur, CADRE, cadreEn, FENETRE_ETAGE, TEINTE_PIERRE } from './ecole_matieres.js';
import { cuireLumiereSol } from './ecole_lumieres.js';
import { TELEPHONE } from './appareil.js';
import { poserPalierEst } from './ecole_est.js';
import { poserPause1, Y_MUR_ORANGE, SI14 } from './ecole_etage1_pause.js';
import { poserKahn, zonesKahn } from './ecole_kahn.js';
import { poserEtage2 } from './ecole_etage2.js';

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
// ---- la cage de l'escalier principal (les cotes de ESC, js/carte_ecole.js ; plan V2, scratchpad iris_audit/plan_v2.md
// § 2.1 : elle recule de DY_S avec le bloc ouest du rez-de-chaussée) ----
const DY_S = -4.675;
// (x : les nus ouest et est de la cage ; y0 : le bord du palier du 1er, 9,525 — au nord, les volées ; yFond : son nu
// nord, 13,925)
const E = { xO0: 1.75, xE1: 4.45, y0: 14.2 + DY_S, yFond: 18.6 + DY_S };   // (intégration : xE1 au nu du mur est, ligne 4,525)
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
    pierre: jourDehors(std({ map: texPierreEtage(), roughness: 0.75, color: TEINTE_PIERRE }), 0.1),    // (la teinte froide : lot façade)
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
  // travées 2 à 11 comme les étages du dessus (la tuile de js/ecole_matieres.js texEtage, FENETRE_ETAGE), celles des
  // travées 1 et 12 au jour de leurs encadrements rouges (CADRE). Menuiserie brun-noir en retrait de 25 cm, tablette
  // blanche, et pour les deux fenêtres des pompiers, la pastille rouge collée sur la vitre (photos 10, 12, 16).
  // (Lot façade du 11/10 — photo 12 redressée sur les quatre rangées, photos 10, 16, 17 de face : iris_vues/X4_*. Les dix
  // fenêtres courantes sont celles du 2e et des étages du dessus, 1,20 x 1,35, allège à 0,85 (la photo 12 donne 1,24 x
  // 1,36, appui à 4,34), d'UN SEUL vantail : ni meneau ni imposte. Les deux encadrements rouges, travées 1 et 12, sont
  // plus hauts que larges et descendent sous le plancher (js/ecole_matieres.js CADRE) : leur fenêtre est haute, de 6 cm
  // au-dessus du plancher à 2,17 — par la vitre basse de la travée 1, la photo 10 montre une chaise du bureau —, un
  // grand carreau et, côté mitoyen, un ouvrant étroit et sombre ; les pastilles des pompiers à un mètre, sur le bord du
  // grand carreau opposé (photo 16 : x 18,51, 4,52 ; photo 10 recalée : x 1,18, 4,39). Le jeu y posait une baie de 1,9 x 1,55 et
  // une fenêtre étroite de 1,1 x 1,49, à 0,8 du plancher.)
  function construireFacade1() {
    const F = [], J = CADRE.jour;
    for (let k = 1; k <= 12; k++) {
      const cd = cadreEn(k, 1);
      if (cd) F.push({ c: centreTravee(k), l: J.l, bas: N1 + J.bas, haut: N1 + J.haut, cadre: cd, pompiers: k === 1 ? [1.18, 0.89] : [18.51, 1.02] });
      else F.push({ c: centreTravee(k), l: FENETRE_ETAGE.l, bas: N1 + FENETRE_ETAGE.bas, haut: N1 + FENETRE_ETAGE.haut });
    }
    mur({ de: [-0.3, -0.2], a: [20.1, -0.2], ep: 0.4, h: N2, mats: { N: M.blanc, S: X.pierre },
      ouvertures: F.map((f) => ({ c: f.c, l: f.l, bas: f.bas, h: f.haut })) });
    // (repère de js/ecole_portes.js fenetreFacade : +z vers l'intérieur, donc tourné de PI ; x local = -x du plan)
    const fac = new THREE.Group(); fac.position.set(0, 0, 0.2); fac.rotation.y = Math.PI; groupe.add(fac);
    const pastille = new THREE.MeshStandardMaterial({ color: 0xd8262c, roughness: 0.4 });
    // LE REFLET DE LA RUE : dehors, en plein jour, une vitre se voit d'abord par ce qu'elle reflète (photos 12, 17 : les
    // immeubles d'en face, le ciel) ; une seconde face, sombre et brillante, tournée vers la rue seulement — vue de la
    // salle, elle n'existe pas (face arrière), la vitre reste claire
    // (lot façade du 11/10 : sur les photos 11, 12, 16 à 18, les vitres du 1er renvoient la rue et le ciel et ne laissent
    // presque rien voir des bureaux — plus couvrante, moins miroir : 0,55 -> 0,80, métal 0,6 -> 0,4)
    const vitreRue = new THREE.MeshStandardMaterial({ color: 0x5f6a74, roughness: 0.06, metalness: 0.4, transparent: true, opacity: 0.8, depthWrite: false, envMapIntensity: 1.2 });
    vitreRue.name = 'vitre de l\'étage vue de la rue';
    for (const f of F) {
      // (les bureaux ont des stores à lames verticales, comme l'accueil du rez-de-chaussée, photo 03)
      if (f.cadre) fenetreSimple(f);
      else fenetreFacade(fac, M, { x: -f.c, l: f.l, bas: f.bas, haut: f.haut, ep: 0.4, barreaux: false, imposte: false, vantail: true, stores: f.c > 13.2 });
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
      const L = { type: 'jour', x: f.c, z: 0.9, h: N1 + 2.4, sx: f.c, sz: -0.45, ox: f.c, oz: 0.5, zone: zoneDe(f.c), reel: false, cuire: false, base: N1, cuireForce: f.cadre ? 1.0 : 0.8 };
      ch.lampes.push(L); lampes.push(L);
    }
    for (const x of [1.6, 4.9, 8.3, 11.5, 14.85, 18.15]) ch.lampes.push({ type: 'jour', x, z: 1.2, h: N1 + 2.6, cx: x, cz: -3.4, zone: zoneDe(x), base: N1, cuire: false, poids: 1.6 });
  }
  // LA FENÊTRE HAUTE D'UN ENCADREMENT ROUGE (travées 1 et 12) : la menuiserie brun-noir dans le plan des autres (25 cm en
  // retrait du nu), le grand carreau, et du côté `o` de l'encadrement (le mitoyen) l'ouvrant étroit, plein et sombre
  // (photos 10, 16, 17) ; l'appui blanc au fond du tableau (celui de devant, sur la traverse rouge : js/carte_ecole.js)
  function fenetreSimple(f) {
    const x0 = f.c - f.l / 2, x1 = f.c + f.l / 2, c = 0.06, ya = -0.185, yb = -0.115, o = f.cadre.o, e = CADRE.etroit;
    B(x0, ya, x1, yb, f.bas, f.bas + c, M.menuiserie); B(x0, ya, x1, yb, f.haut - c, f.haut, M.menuiserie);
    B(x0, ya, x0 + c, yb, f.bas, f.haut, M.menuiserie); B(x1 - c, ya, x1, yb, f.bas, f.haut, M.menuiserie);
    let g0 = x0, g1 = x1;
    if (o) {
      const xm = o < 0 ? x0 + e : x1 - e, n0 = o < 0 ? x0 + c : xm + 0.03, n1 = o < 0 ? xm - 0.03 : x1 - c;
      B(xm - 0.03, ya, xm + 0.03, yb, f.bas, f.haut, M.menuiserie);
      B(n0, ya + 0.02, n1, yb - 0.02, f.bas + c, f.haut - c, M.menuiserie);
      B((n0 + n1) / 2 - 0.01, ya - 0.004, (n0 + n1) / 2 + 0.01, ya, f.bas + c, f.haut - c, X.anthracite, { ombre: false });
      if (o < 0) g0 = xm; else g1 = xm;
    }
    const v = new THREE.Mesh(new THREE.PlaneGeometry(g1 - g0 - 2 * c, f.haut - f.bas - 2 * c), M.vitreJour);
    v.position.set((g0 + g1) / 2, (f.bas + f.haut) / 2, 0.15); groupe.add(v);
    B(x0, -0.4, x1, ya, f.bas - 0.02, f.bas, M.blanc, { ombre: false });
  }

  // =====================================================================
  //  LES CLOISONS ET LES PORTES
  // =====================================================================
  // LE COULOIR SOMBRE ET LE PALIER D'ÉTAGE OUEST (V2, 11/10, plan_v2.md § 2.4 — IMAGINÉS : la VO 47,5-49 s n'y montre que
  // du noir) : le couloir descend de 2 m avec le mur des jours (js/ecole_etage1_pause.js, Y_S 4,95), qui est son mur sud ;
  // le palier, devant la double porte de l'escalier principal posée sur la ligne 7,85 (js/carte_ecole.js, lot B : la cage
  // décalée de DY_S = −4,675), n'a plus que la profondeur d'un palier. Y_COUR (8,925) ne sert plus ici que pour le dessous
  // du plancher (construireSols, lot B)
  const Y_C0 = 4.95;                  // l'axe du mur sud du couloir sombre (le mur des jours, Y_S)
  const Y_C1 = 6.85;                  // l'axe de son mur nord (le local ménage), et la limite couloir / palier
  const Y_PO = 7.85;                  // l'axe du mur de la double porte de l'escalier principal (lot B)
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
    // IMAGINÉ) : du mitoyen au palier d'étage. Au nord de son bout ouest, le local ménage (porte de gaine fermée ; derrière,
    // le local et les toilettes, fermés, x 0-1,6 y 6,91-13,9)
    mur({ de: [-0.3, Y_C1], a: [1.675, Y_C1], mats: B0, plinthes: ['S'], ouvertures: [{ c: 0.8, l: 0.95 }] });
    porte('x', Y_C1, 0.8, { modele: 'gaine', etat: 'fermee', cote: 'S', ep: 0.12, nom: 'local ménage' });
    // LE PALIER D'ÉTAGE OUEST : à l'ouest, le mur safran (comme celui de la salle d'attente, photos 02, 21), jusqu'au mur de
    // la double porte ; à l'est, le dos du mur du fond de l'espace pause (js/ecole_etage1_pause.js)
    mur({ de: [1.675, Y_C1 - EP / 2], a: [1.675, Y_PO], ep: 0.15, mats: { E: M.orange, W: B0 }, plinthes: ['E'] });
  }

  // =====================================================================
  //  LES SOLS (le carrelage de l'étage et le monde solide)
  // =====================================================================
  function construireSols() {
    // le carrelage : le bureau 103 et la salle 104 (grand côté est-ouest), le couloir sombre (est-ouest), le palier
    // d'étage (nord-sud) — la salle S 1.3 a sa moquette, l'espace pause son lino (js/ecole_etage1_pause.js) ; V2 : le 103
    // derrière le recoin descendu (y 3,39), le couloir et le palier descendus, le palier jusqu'au mur de la double porte
    const rects = [
      [13.2, 0, 19.95, 3.39, 'ew'], [13.55, 3.39, 19.95, Y_SALLES, 'ew'], [-0.3, Y_C0, 4.675, Y_C1, 'ew'],
      [1.6, Y_C1, 4.675, Y_PO, 'ns'],
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
    // (plan V2, 11/10 : ni plancher ni dessous de plancher au-dessus des volées de l'escalier principal, x 1,6-4,75 au
    // nord du bord de son palier du 1er, E.y0 = 9,525 — la cage monte d'un jet jusqu'à la dalle du 2e ; le palier a sa
    // dalle, js/carte_ecole.js construireEscalier)
    C.sol(-0.3, 0, 19.95, -9.075, N1);
    C.sol(-0.3, -9.075, 1.6, -12.6, N1); C.sol(4.75, -9.075, 16.05, -12.6, N1);
    C.ajouterBoite(-0.3, 0, 19.95, -Y_COUR - 0.1, { y0: N1 - 0.32, y1: N1 - 0.02, joueur: false });
    C.ajouterBoite(4.75, -Y_COUR, 13.55, -12.45, { y0: N1 - 0.32, y1: N1 - 0.02, joueur: false });
    C.ajouterBoite(1.6, -Y_COUR, 4.75, -E.y0, { y0: N1 - 0.32, y1: N1 - 0.02, joueur: false });
  }

  // =====================================================================
  //  LES FAUX PLAFONDS ET LES LUMINAIRES
  // =====================================================================
  function construirePlafondsEtLumieres() {
    // le bureau 103 et la salle 104 : plateaux perforés (comme la salle d'attente, photos 02, 21), luminaires à grille
    // (la salle S 1.3 et le bureau de la travée 1 : dalles 60 x 60, js/ecole_etage1_pause.js)
    // (V2 : le 103 derrière le recoin descendu — son mur ouest en x 13,61 au nord de y 3,39)
    ch.plafond(13.26, 0, 16.5, 3.39, H_SALLE, 'plateaux');
    ch.plafond(13.61, 3.39, 16.5, Y_SALLES, H_SALLE, 'plateaux');
    ch.plafond(16.5, 0, 19.8, Y_SALLES, H_SALLE, 'plateaux');
    for (const y of [1.8, 4.8]) { dalle(14.85, y, 'e103'); dalle(18.15, y, 'e104'); }
    // le couloir sombre et le palier d'étage : plâtre et hublots opales (comme les couloirs C01 et C05, photos 01, 05) ;
    // le hublot du couloir éteint (VO 48 s : derrière la porte du fond de l'espace pause, le noir) ; V2 : descendus, le
    // palier jusqu'au nu du mur de la double porte, une seule opale
    ch.plafond(0, Y_C0, 4.6, Y_C1, H_COUL, 'platre');
    ch.plafond(1.75, Y_C1, 4.6, Y_PO - 0.075, H_COUL, 'platre');
    maille(new THREE.CylinderGeometry(0.17, 0.156, 0.07, 36), new THREE.MeshStandardMaterial({ color: 0xd9d7d1, roughness: 0.5 }), 1.2, H_COUL - 0.035, -(Y_C0 + Y_C1) / 2, 0, groupe, { ombre: false });
    opale(3.2, (Y_C1 + Y_PO) / 2 - 0.05, H_COUL, 'e1hall');
  }

  // =====================================================================
  //  LA CAGE DE L'ESCALIER PRINCIPAL AU 1er (le haut)
  // =====================================================================
  // (plan V2 § 1.3, 11/10 : l'escalier s'arrête au 1er — les volées 3 et 4, le palier du 2e et sa double porte « 2e
  // étage », imaginés, sont retirés : la vidéo officielle met la salle 1 du 2e au-dessus, son mur ouest en x 3,6.) Au-dessus
  // des volées, la cage monte jusqu'au dessous de la dalle du 2e, 6,40 : un plafond de plâtre, son plafonnier au milieu
  // (le palier du 1er, son plafond et son plafonnier, le garde-corps au-dessus de la volée 1 : js/carte_ecole.js).
  function construireCage() {
    ch.plafond(E.xO0, E.y0, E.xE1, E.yFond, DALLE2, 'platre', { retombees: false });
    opale(3.4, 11.7, DALLE2, 'palier1', { r: 0.18 });
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
    // (V2, 11/10 : le recoin de l'espace pause est descendu en y 3,51-5,01 — la seconde armoire passe sur le mur est du
    // recoin, x 13,61, qui est le mur ouest du bureau au nord de y 3,39)
    armoire(13.26, 2.85, 'E', 1.0); armoire(13.61, 3.95, 'E', 1.0);
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
    // (V2, 11/10 : le palier n'a plus qu'un mètre de profondeur — le plan d'évacuation sur le mur safran, l'extincteur
    // sur le dos du mur du fond de l'espace pause, les deux affiches et le banc dans le couloir, sur le mur de la salle)
    panneau(new THREE.MeshStandardMaterial({ map: texConsignes(), roughness: 0.5 }), 0.45, 0.62, 1.757, (Y_C1 + Y_PO) / 2 - 0.05, N1 + 1.6, 'E');
    affiche('#2f6fb0', '#fbfbf8', 73, 0.6, 0.85, 3.85, Y_C0 + 0.063, 1.55, 'N');
    affiche('#f2b705', '#1d1d1d', 70, 0.5, 0.7, 1.95, Y_C0 + 0.063, 1.55, 'N');
    extincteur(4.6, 7.35, 'W');
    // le bloc de sortie au-dessus de la porte de l'escalier, côté étage
    ch.sortie(3.5, Y_PO - 0.08, N1 + 2.32, 'S');
    // les plaques des portes de la salle S 1.3, de la Si 1.4 et de l'espace pause : js/ecole_etage1_pause.js (10/10 :
    // celles du 103 et de la 104 sont parties avec leurs portes, VO q_0274-0281 ; V2 : la porte du fond du renfoncement
    // nord du palier est n'est plus que celle d'un local, sans plaque — js/ecole_est.js)
    // le banc (lattes de chêne sur deux piètements), où l'on attend le cours, contre le mur de la S 1.3 (assis, on regarde
    // le palier)
    const xb0 = 2.35, xb1 = 3.35, yb0 = Y_C0 + 0.06, yb1 = yb0 + 0.48;
    for (let k = 0; k < 4; k++) B(xb0, yb0 + 0.02 + k * 0.115, xb1, yb0 + 0.11 + k * 0.115, N1 + 0.42, N1 + 0.45, X.chene);
    for (const x of [xb0 + 0.12, xb1 - 0.12]) B(x - 0.02, yb0 + 0.03, x + 0.02, yb1 - 0.03, N1, N1 + 0.42, X.anthracite);
    C.ajouterBoite(xb0, -yb0, xb1, -yb1, { y0: N1, y1: N1 + 0.47 });
    for (const x of [2.6, 3.1]) sieges.push({ x, z: -(yb0 + yb1) / 2, y: 0.45, fx: 0, fz: -1, sx: x, sz: -(yb1 + 0.5), nom: 'le banc', sol: N1 });
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
    construireCage();
    meublerBureau103();
    meublerSalle104();
    garnirCouloir();
    // L'ESPACE PAUSE, LA SALLE S 1.3, LE RECOIN, LE BUREAU DE LA TRAVÉE 1 (10/10, la vidéo officielle) : avec nos outils
    pause = poserPause1(ch, { groupe, lampes, sieges, R1, B, panneau, porte, spot, dalle, radiateur, projecteur, fauteuil, ordinateur, texPlaqueSalle });
    // LE PALIER EST ET LA CAGE DE L'ESCALIER EST (photos 27 à 29) : dans le groupe de l'étage, ses lampes cuites avec les
    // nôtres, son vinyle sur notre lumière et notre ombre cuites (js/ecole_est.js)
    poserPalierEst(ch, { groupe, lampes, matSol, R1 });
    // LA SALLE ROBERT KAHN, Si 1.4 (10/10, la vidéo de visite : derrière le mur orange de l'espace pause ; js/ecole_kahn.js)
    // (intégration du 10/10 : son mur sud est le mur orange de l'espace pause — le nu nord Y_MUR_ORANGE, 12,96 —, sa porte
    // celle de SI14 ; ce qui fermait la porte en attendant la salle (une forme, un fond sombre) s'efface — AVANT elle : sa
    // moquette cuit la lumière des spots de l'espace pause qui passe la porte)
    for (const o of SI14.provisoires) { if (o.isObject3D) o.removeFromParent(); else o.off = true; }
    poserKahn(ch, { groupe, lampes, renderer, ySud: Y_MUR_ORANGE, xPorte: (SI14.x0 + SI14.x1) / 2 });
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
    ...zonesKahn(),   // (en tête, la salle Robert Kahn — js/ecole_kahn.js)
    ...(pause ? pause.zones : []),
    // (V2 : le palier d'étage ouest jusqu'au mur de la double porte — au-delà, la cage, `palier1` du lot B —, le couloir
    // sombre descendu ; le 103 derrière le recoin)
    { id: 'e1hall', rects: [zr(1.6, Y_C1, 4.75, Y_PO)], voisines: ['palier1', 'e1couloir'], env: env(3.9, (Y_C1 + Y_PO) / 2) },
    { id: 'e1couloir', rects: [zr(-0.3, Y_C0, 4.75, Y_C1)], voisines: ['e1hall', 'e1pause', 'e1bureau'], env: env(2.6, (Y_C0 + Y_C1) / 2) },
    { id: 'e103', rects: [zr(13.2, -0.2, 16.5, 3.39), zr(13.55, 3.39, 16.5, Y_SALLES)], voisines: ['e1est'], env: env(14.85, 3.6) },
    { id: 'e104', rects: [zr(16.5, -0.2, 20.0, Y_SALLES)], voisines: ['e1est'], env: env(18.15, 3.6) },
  ];

  // LE 2e ÉTAGE ET LA CAGE EST AU-DESSUS (10/10, la vidéo officielle : js/ecole_etage2.js) — ses zones passent devant
  // les nôtres (leurs rectangles couvrent les nôtres, plus haut), sa mise à jour est la nôtre
  const etage2 = poserEtage2(ch, renderer);

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
    // (10/10, le 2e : au-dessus de ses plafonds, hors des deux cages et du sas, le 1er n'est plus vu — il n'est plus
    // dessiné ; de la cage est, on voit la volée 4 et le palier du 1er ; dans la cage ouest, son palier du 2e est le nôtre)
    // (vérification du 10/10 : la cage est, elle aussi, à partir du rez-de-chaussée — sur le palier du -1 et la volée B,
    // sous la paillasse de la volée 1 et le palier intermédiaire, l'étage entier était dessiné pour rien : 352 objets)
    // (plan V2 : la cage de l'escalier principal, décalée de DY_S, de y 7,5 à 14,3 — la caméra devant ses portes et au-dessus
    // des volées, jusqu'au palier du 1er ; intégration du 11/10 : sous le plafond de la cage, 6,40 — au-dessus, c'est la
    // salle 1 du 2e, et le 1er restait affiché sous elle)
    const cage = (cam.x > 1.4 && cam.x < 5.0 && cam.z < -7.5 && cam.z > -14.3 && cam.y > -0.3 && cam.y < 6.4) || (cam.x > 14.4 && cam.x < 20.0 && cam.z < -10.6 && cam.z > -12.7 && cam.y > -0.3);
    const au2e = cam.y > 7.0 && u.y > 6.0 && cam.z < -0.05 && !cage && !(cam.x > 13.4 && cam.z < -6.45 && cam.z > -12.75);
    const vis = (cage || cam.y > 2.7 || cam.z > -0.05 || u.y > 2.0) && !au2e;
    if (vis !== groupe.visible) groupe.visible = vis;
    // SON OMBRE quand Haythem y est (au-delà de la moitié de la volée 2 ; il redescend sous 2 m ; au 2e, elle ne tomberait
    // que sous ses pieds, au travers des dalles) — reposée à chaque image : le cache de l'ombre du décor
    // (js/ombre_cache.js) rallume ce qu'il a éteint le temps d'un rendu
    if (u.y > 2.5 && u.y < 5.3) haut = true; else if (u.y < 2.0 || u.y > 5.8) haut = false;
    for (const o of ombrants) o.castShadow = haut;
    // LES SIÈGES de son étage seulement (la liste est celle du jeu, js/game.js : on la remplit sur place) — quatre
    // niveaux depuis le 2e (10/10, js/ecole_etage2.js : -1, 0, 1, 2 ; 09/10, js/ecole_soussol.js)
    if (!tous) tous = ch.sieges.slice();
    const lv = (h) => (h < -1.5 ? -1 : h > 5 ? 2 : h > 2 ? 1 : 0);
    const n = u.y < -1.5 ? -1 : u.y > 5.0 ? 2 : u.y > 2.0 ? 1 : 0;
    if (n !== niveau) {
      niveau = n;
      ch.sieges.length = 0;
      for (const s of tous) if (lv(s.sol || 0) === n) ch.sieges.push(s);
    }
    etage2.maj(dt, jeu);
  };
  console.info('[étage] 1er étage : %d sièges, %d lampes, %d ombrants', sieges.length, lampes.length, ombrants.length);
  return { zones: [...etage2.zones, ...zones], maj, groupe };
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
