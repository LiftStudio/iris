// =====================================================================
//  LE 1er ÉTAGE DE L'ÉCOLE IRIS (crochet de js/carte_ecole.js)
// =====================================================================
// L'ÉTAGE EST IMAGINÉ, en attendant des photos de Haythem. Ce qui est SÛR vient des photos : la double porte coupe-feu
// du palier (photos 06 et 20 : la même que celle du rez-de-chaussée), et surtout la FAÇADE (photos 11, 12, 16 à 18) —
// douze travées de 1,65 m, une fenêtre par travée à menuiserie brun-noir, la grande baie dans son encadrement rouge à
// l'ouest (travée 1 : par la vitre, la photo 12 montre des plafonniers et quelqu'un assis à une table — une salle de
// cours), la fenêtre étroite dans son encadrement rouge à l'est (travée 12), les pastilles rouges des accès pompiers sur
// ces deux-là. Les salles sont donc posées DERRIÈRE ces fenêtres, leurs cloisons tombant entre deux travées. Le reste
// (couloir, toilettes, bureaux, salles côté cour) est la distribution courante d'un étage d'école, dans les matières et
// la lumière du rez-de-chaussée. À reprendre quand les photos viendront.
//
// LE PLAN DE L'ÉTAGE (repère du plan de js/carte_ecole.js : x le long de la façade, y vers le fond ; plancher à 3,50 m,
// dessous de la dalle du 2e à 6,40 m) :
//   salle 101 « Salle de cours » B 1.1   x 0-6,6     y 0-6,9     travées 1 à 4 (la grande baie rouge)
//   salle 102 « Robert Kahn » B 1.4      x 6,6-13,2  y 0-6,9     travées 5 à 8 (informatique)
//   bureau 103 (pédagogie)               x 13,2-16,5 y 0-6,9     travées 9 et 10 (au-dessus de la porte 6)
//   salle 104 (enseignants)              x 16,5-19,8 y 0-6,9     travées 11 et 12 (la fenêtre rouge des pompiers)
//   le couloir                           x 1,75-19,8 y 7,0-8,9
//   le palier d'étage                    x 1,75-4,6  y 8,9-12,45  devant la double porte de l'escalier, ouverte
//   les toilettes                        x 4,75-8,45 y 9,0-12,6
//   l'espace pause (la porte 105)        x 8,55-12,45 y 9,0-12,6  côté cour : deux fenêtres sur la cour (imaginé)
//   fermés : 106, 107 (côté cour), le local ménage, l'issue de secours au bout du couloir, le 2e étage
// LES VRAIS NOMS (09/10) : le panneau d'étage de la photo 28 (au palier de l'escalier est) annonce au 1er « Salle de
// cours B 1.?, Salle Robert Kahn B 1.4, Salle Gordon Earle Moore B 1.5, Espace pause, Salle de cours B 1.? » ; la 101
// devient la salle de cours B 1.1, la 102 la salle Robert Kahn (B 1.4), la 105 l'espace pause. Les plaques de leurs
// portes sont celles de la photo 23 : noires, trois lignes « Salle / nom / B 1.x ».
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

// ---- les hauteurs ----
const N1 = 3.5;                     // le plancher du 1er étage (H_RDC de js/carte_ecole.js)
const N2 = 6.6;                     // le plancher du 2e (un étage courant : 3,10 m, la tuile de la façade)
const DALLE2 = 6.4;                 // le dessous de la dalle du 2e (H_CAGE de js/carte_ecole.js) : les cloisons y montent
const H_SALLE = N1 + 2.7;           // le faux plafond des salles et des bureaux
const H_COUL = N1 + 2.5;            // celui du couloir, du palier d'étage et des toilettes (les gaines passent au-dessus)
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
// le rectangle du plancher (lumière et ombre cuites, uv1 de 0 à 1, v = 1 au nord)
const R1 = { x0: -0.3, x1: 20.1, y0: -0.2, y1: 12.8 };

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
// LA FAÏENCE DES TOILETTES : carreaux blancs de 20 x 20, joints gris clair. Tuile : 1 m (cinq carreaux).
function texFaience() {
  return canvasTex(256, 256, (g, w, h) => {
    const r2 = graine(77), c = w / 5;
    for (let j = 0; j < 5; j++) for (let i = 0; i < 5; i++) {
      const t = (r2() - 0.5) * 6;
      const gr = g.createLinearGradient(i * c, j * c, (i + 1) * c, (j + 1) * c);
      gr.addColorStop(0, rgb(246 + t, 246 + t, 243 + t)); gr.addColorStop(1, rgb(236 + t, 237 + t, 234 + t));
      g.fillStyle = gr; g.fillRect(i * c, j * c, c, c);
    }
    g.fillStyle = '#c9c9c4';
    for (let i = 0; i <= 5; i++) { g.fillRect(i * c - 1, 0, 2, h); g.fillRect(0, i * c - 1, w, 2); }
  }, [1, 1], false, 8);
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
// la plaque des toilettes (homme, femme, fauteuil)
function texPlaqueWC() {
  return canvasTex(128, 160, (g, w, h) => {
    g.fillStyle = '#26272a'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#f2f2f2';
    g.beginPath(); g.arc(38, 36, 9, 0, 7); g.fill(); g.fillRect(30, 50, 16, 40);
    g.beginPath(); g.arc(90, 36, 9, 0, 7); g.fill(); g.beginPath(); g.moveTo(90, 50); g.lineTo(104, 90); g.lineTo(76, 90); g.fill();
    g.strokeStyle = '#f2f2f2'; g.lineWidth = 5; g.beginPath(); g.arc(64, 118, 13, 0, 7); g.stroke();
    g.font = '600 17px "Segoe UI", sans-serif'; g.textAlign = 'center'; g.fillText('Toilettes', 64, 152);
  }, null, false, 2);
}
// LE PANNEAU DE L'ÉTAGE (09/10, photo 28 : celui du palier de l'escalier est, recopié sur le mur safran) : noir mat,
// 65 x 34 cm, le bandeau cuivré de 6 cm à gauche et son « 1 » blanc, cinq lignes blanches, les numéros alignés à droite
// (les deux « B 1.? » flous de la photo : B 1.1 pour la 101, B 1.6 pour la dernière)
function texPanneauEtage() {
  return canvasTex(1024, 536, (g, w, h) => {
    const b = Math.round(w * 6 / 65), police = (p, t) => `${p} ${t}px "Segoe UI", Arial, sans-serif`;
    g.fillStyle = '#2b2a28'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#b5703f'; g.fillRect(0, 0, b, h);
    g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(0, 0, b, 3);
    g.fillStyle = '#f2efe9'; g.textBaseline = 'alphabetic'; g.textAlign = 'center';
    g.font = police(300, 150); g.fillText('1', b / 2, h * 0.31);
    const lignes = [['Salle de cours', 'B 1.1'], ['Salle Robert Kahn', 'B 1.4'], ['Salle Gordon Earle Moore', 'B 1.5'], ['Espace pause', ''], ['Salle de cours', 'B 1.6']];
    g.font = police(500, 54);
    lignes.forEach(([t, n], i) => {
      const y = h * (0.19 + i * 0.18);
      g.textAlign = 'left'; g.fillText(t, b + w * 0.032, y);
      g.textAlign = 'right'; g.fillText(n, w * 0.972, y);
    });
  }, null, false, 8);
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
// UN QR CODE (dessiné : des modules au hasard et les trois repères des coins), `s` de côté, sur sa marge blanche
function dessinerQR(g, x, y, s, n) {
  const r2 = graine(n), m = 21, c = s / m;
  g.fillStyle = '#ffffff'; g.fillRect(x - c, y - c, s + 2 * c, s + 2 * c);
  g.fillStyle = '#141414';
  for (let j = 0; j < m; j++) for (let i = 0; i < m; i++) {
    const coin = (i < 8 && j < 8) || (i > m - 9 && j < 8) || (i < 8 && j > m - 9);
    if (!coin && r2() < 0.48) g.fillRect(x + i * c, y + j * c, c + 0.4, c + 0.4);
  }
  for (const [a, b] of [[0, 0], [m - 7, 0], [0, m - 7]]) {
    g.fillStyle = '#141414'; g.fillRect(x + a * c, y + b * c, 7 * c, 7 * c);
    g.fillStyle = '#ffffff'; g.fillRect(x + (a + 1) * c, y + (b + 1) * c, 5 * c, 5 * c);
    g.fillStyle = '#141414'; g.fillRect(x + (a + 2) * c, y + (b + 2) * c, 3 * c, 3 * c);
  }
}
// L'AFFICHETTE « WIFI IRIS » (photo 28, à côté du panneau) : noire dans un cadre blanc, le titre, deux lignes, la carte
// blanche et son QR code
function texWifi() {
  return canvasTex(352, 256, (g, w, h) => {
    g.fillStyle = '#f0eee9'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#28282b'; g.fillRect(12, 12, w - 24, h - 24);
    g.fillStyle = '#f2f1ee'; g.textAlign = 'center'; g.font = '700 27px "Segoe UI", Arial, sans-serif'; g.fillText('WIFI IRIS', 112, 66);
    g.textAlign = 'left'; g.font = '500 14px "Segoe UI", Arial, sans-serif';
    g.fillText('Réseau : IRIS-Etudiants', 30, 116); g.fillText('Scannez le code pour', 30, 138); g.fillText('vous connecter', 30, 158);
    g.fillStyle = '#f2f1ee'; g.fillRect(222, 34, 104, 186);
    g.fillStyle = '#9a9894'; g.fillRect(232, 44, 84, 44);
    g.fillStyle = '#f2f1ee'; g.font = '700 15px "Segoe UI", Arial, sans-serif'; g.textAlign = 'center'; g.fillText('WIFI', 274, 72);
    dessinerQR(g, 236, 112, 76, 314);
  }, null, false, 4);
}
// L'AFFICHE « POINT ÉCOUTE » (photos 24, 28 : A4 violette, bandeaux orange, les QR codes en bas)
function texPointEcoute() {
  return canvasTex(256, 362, (g, w, h) => {
    const r2 = graine(5150);
    g.fillStyle = '#5b2a76'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#e8613a'; g.fillRect(0, 0, w, 10);
    g.fillStyle = '#1e1430'; g.fillRect(28, 26, w - 56, 50);
    g.fillStyle = '#ffffff'; g.font = '800 29px "Segoe UI", Arial, sans-serif'; g.textAlign = 'center'; g.fillText('POINT ÉCOUTE', w / 2, 62);
    g.fillStyle = 'rgba(255,255,255,0.75)'; g.fillRect(36, 88, w - 72, 9);
    for (const [y, l] of [[118, 0.84], [176, 0.7], [236, 0.78]]) {
      g.fillStyle = '#ef7a3c'; g.fillRect(18, y, w * l, 26);
      g.fillStyle = 'rgba(255,255,255,0.85)'; for (let k = 0; k < 2; k++) g.fillRect(30, y + 36 + k * 13, (0.4 + r2() * 0.4) * w, 6);
    }
    for (let k = 0; k < 3; k++) dessinerQR(g, 22 + k * 78, 300, 46, 77 + k);
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
// L'IMAGE PROJETÉE (la diapositive du cours) : `sujet` 'marketing' (101) ou 'web' (102)
function texDiapo(sujet) {
  return canvasTex(1024, 640, (g, w, h) => {
    if (sujet === 'web') {
      g.fillStyle = '#1e1f26'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#2b2d36'; g.fillRect(0, 0, w, 64);
      g.fillStyle = '#f2f2f2'; g.font = '600 34px "Segoe UI", sans-serif'; g.fillText('TP 3 — Mise en page Flexbox', 32, 44);
      const code = [
        ['#7f848e', '<!-- index.html -->'], ['#e06c75', '<section class="hero">'], ['#e06c75', '  <h1>', '#d7dae0', 'Bienvenue chez IRIS', '#e06c75', '</h1>'],
        ['#e06c75', '  <nav class="menu">'], ['#e06c75', '    <a ', '#d19a66', 'href', '#d7dae0', '="#formations">Formations</a>'],
        ['#e06c75', '  </nav>'], ['#e06c75', '</section>'], ['#7f848e', ''], ['#7f848e', '/* style.css */'],
        ['#61afef', '.hero', '#d7dae0', ' {'], ['#56b6c2', '  display', '#d7dae0', ': flex;'], ['#56b6c2', '  justify-content', '#d7dae0', ': space-between;'],
        ['#56b6c2', '  gap', '#d7dae0', ': ', '#d19a66', '2rem', '#d7dae0', ';'], ['#d7dae0', '}'],
      ];
      g.font = '26px Consolas, "Courier New", monospace';
      code.forEach((l, i) => {
        g.fillStyle = '#5c6370'; g.fillText(String(i + 1).padStart(2, ' '), 26, 110 + i * 36);
        let x = 80;
        for (let k = 0; k < l.length; k += 2) { g.fillStyle = l[k]; g.fillText(l[k + 1] || '', x, 110 + i * 36); x += g.measureText(l[k + 1] || '').width; }
      });
      g.fillStyle = '#f08a24'; g.fillRect(w - 180, h - 60, 150, 6);
      g.fillStyle = '#f2f2f2'; g.font = '600 28px "Century Gothic", "Segoe UI", sans-serif'; g.fillText('iris', w - 120, h - 22);
      return;
    }
    g.fillStyle = '#fbfaf6'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#111111'; g.fillRect(0, 0, w, 96);
    g.fillStyle = '#ffffff'; g.font = '600 52px "Century Gothic", "Avenir", "Segoe UI", sans-serif'; g.fillText('iris', 34, 66);
    g.fillStyle = '#f08a24'; g.fillRect(36, 22, 12, 8);
    g.fillStyle = '#f4f4f2'; g.font = '600 34px "Segoe UI", sans-serif'; g.fillText('Marketing digital — le parcours client', 170, 60);
    const etages = [['Notoriété', '#7b2a6e'], ['Considération', '#b23a7a'], ['Conversion', '#e0663a'], ['Fidélisation', '#f2a33a']];
    etages.forEach(([t, c], i) => {
      const y = 140 + i * 110, l = 520 - i * 90;
      g.fillStyle = c; g.beginPath(); g.moveTo(330 - l / 2, y); g.lineTo(330 + l / 2, y); g.lineTo(330 + l / 2 - 45, y + 96); g.lineTo(330 - l / 2 + 45, y + 96); g.closePath(); g.fill();
      g.fillStyle = '#ffffff'; g.font = '600 28px "Segoe UI", sans-serif'; g.textAlign = 'center'; g.fillText(t, 330, y + 58); g.textAlign = 'left';
    });
    g.fillStyle = '#2a2a2a'; g.font = '500 28px "Segoe UI", sans-serif';
    ['Attirer : SEO, réseaux sociaux', 'Convaincre : avis, contenus', 'Convertir : tunnel d\'achat', 'Fidéliser : CRM, newsletter'].forEach((t, i) => {
      g.fillStyle = '#f08a24'; g.fillRect(640, 178 + i * 110, 14, 14); g.fillStyle = '#2a2a2a'; g.fillText(t, 668, 192 + i * 110);
    });
    g.fillStyle = '#8a8a8a'; g.font = '22px "Segoe UI", sans-serif'; g.fillText('BTS NDRC · séance 4', 34, h - 22);
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
// LE TABLEAU DE LIÈGE du couloir (les annonces, les stages, les emplois du temps)
function texLiege() {
  return canvasTex(512, 256, (g, w, h) => {
    const r2 = graine(909);
    g.fillStyle = '#b88a55'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 5000; k++) { g.fillStyle = r2() < 0.5 ? 'rgba(120,80,40,0.3)' : 'rgba(225,185,135,0.28)'; g.fillRect(r2() * w, r2() * h, 1.5, 1.5); }
    const cols = ['#ffffff', '#f2b705', '#ffffff', '#e04e3a', '#2f6fb0', '#ffffff', '#3e9b6b', '#f7f7f2', '#f08a24', '#ffffff'];
    for (let i = 0; i < 10; i++) {
      const x = 14 + (i % 5) * 98 + r2() * 10, y = 12 + Math.floor(i / 5) * 122 + r2() * 10;
      g.save(); g.translate(x + 40, y + 50); g.rotate((r2() - 0.5) * 0.14);
      g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(-38, -46, 80, 102);
      g.fillStyle = cols[i]; g.fillRect(-40, -48, 80, 102);
      g.fillStyle = 'rgba(60,60,60,0.55)'; for (let l = 0; l < 6; l++) g.fillRect(-32, -30 + l * 13, 30 + r2() * 30, 4);
      if (i % 3 === 0) { g.fillStyle = 'rgba(40,40,40,0.75)'; g.fillRect(-32, -42, 50, 8); }
      g.fillStyle = '#d0262d'; g.beginPath(); g.arc(0, -42, 4, 0, 7); g.fill();
      g.restore();
    }
  }, null, false, 4);
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

// ---- l'espace pause (09/10, imaginé dans le style de l'espace pause du sous-sol, filmé : la vidéo, 18,9 à 22,4 s) ----
// LE GRÈS CÉRAME : grands carreaux carrés de 60 x 60, beige grège, un nuage de ciment dans chaque carreau, joints fins
// plus sombres. Tuile : 1,2 m (quatre carreaux).
function texGresPause() {
  const W = TELEPHONE ? 256 : 512;
  return canvasTex(W, W, (g, w, h) => {
    const r2 = graine(1959), c = w / 2;
    for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
      const t = (r2() - 0.5) * 7;
      g.fillStyle = rgb(186 + t, 181 + t, 158 + t); g.fillRect(i * c, j * c, c, c);
      g.save(); g.beginPath(); g.rect(i * c, j * c, c, c); g.clip();
      for (let k = 0; k < 36; k++) {
        const x = i * c + r2() * c, y = j * c + r2() * c, r = c * (0.06 + r2() * 0.2), v = r2() < 0.5 ? [178, 170, 148] : [216, 209, 189];
        const gr = g.createRadialGradient(x, y, 0, x, y, r);
        gr.addColorStop(0, rgb(v[0], v[1], v[2], 0.2)); gr.addColorStop(1, rgb(v[0], v[1], v[2], 0));
        g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
      }
      for (let k = 0; k < 900; k++) { const v = 165 + r2() * 70; g.fillStyle = rgb(v, v - 6, v - 22, 0.16); g.fillRect(i * c + r2() * c, j * c + r2() * c, 1.3, 1.3); }
      g.restore();
    }
    g.fillStyle = '#aaa28a';
    for (let i = 0; i <= 2; i++) { g.fillRect(i * c - 1, 0, 2, h); g.fillRect(0, i * c - 1, w, 2); }
  }, [1 / 1.2, 1 / 1.2], false, 8);
}
// LE VERRE IMPRIMÉ DES FENÊTRES SUR COUR : on ne voit pas la cour, seulement son jour — plus clair en haut (le ciel), la
// masse floue d'un arbre et du mur d'en face en bas, le grain du verre
function texVoileCour() {
  return canvasTex(256, 256, (g, w, h) => {
    const r2 = graine(404), gr = g.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#f4f7f9'); gr.addColorStop(0.5, '#e6edee'); gr.addColorStop(1, '#ccd4cf');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 16; k++) {
      const x = r2() * w, y = h * (0.5 + r2() * 0.5), r = w * (0.12 + r2() * 0.2), q = g.createRadialGradient(x, y, 0, x, y, r);
      q.addColorStop(0, k % 3 ? 'rgba(118,138,112,0.16)' : 'rgba(160,150,140,0.16)'); q.addColorStop(1, 'rgba(118,138,112,0)');
      g.fillStyle = q; g.fillRect(x - r, y - r, 2 * r, 2 * r);
    }
    for (let k = 0; k < 1600; k++) { const v = 200 + r2() * 55; g.fillStyle = rgb(v, v, v, 0.09); g.fillRect(r2() * w, r2() * h, 2, 2); }
  }, null, false, 4);
}
// LE DISTRIBUTEUR DE FRIANDISES (la vidéo : vitré, ses spirales éclairées, la caisse noire, le monnayeur à droite) — la
// façade, 0,85 x 1,80 m
function texFriandises() {
  return canvasTex(512, 1024, (g, w, h) => {
    const r2 = graine(8086);
    g.fillStyle = '#1d1d1c'; g.fillRect(0, 0, w, h);
    const v0 = 24, v1 = 352, t0 = 40, t1 = 720, rang = (t1 - t0) / 6;
    const fond = g.createLinearGradient(0, t0, 0, t1); fond.addColorStop(0, '#f6f4ec'); fond.addColorStop(1, '#d6d3c8');
    g.fillStyle = fond; g.fillRect(v0, t0, v1 - v0, t1 - t0);
    const coul = ['#d0262d', '#f2b705', '#2f6fb0', '#3e9b6b', '#7b2a6e', '#e07b2a', '#3a2418', '#c9c9c4'];
    for (let r = 0; r < 6; r++) {
      const yb = t0 + (r + 1) * rang, n = 5, lc = (v1 - v0) / n, ph = rang - 34;
      for (let i = 0; i < n; i++) {
        const cx = v0 + (i + 0.5) * lc, c = coul[Math.floor(r2() * coul.length)];
        g.fillStyle = c; g.fillRect(cx - lc * 0.32, yb - 10 - ph, lc * 0.64, ph);
        g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(cx - lc * 0.32, yb - 10 - ph, lc * 0.1, ph);
        g.fillStyle = 'rgba(255,255,255,0.85)'; g.fillRect(cx - lc * 0.22, yb - 10 - ph * 0.62, lc * 0.44, 9);
        g.strokeStyle = 'rgba(150,150,146,0.9)'; g.lineWidth = 2;
        g.beginPath(); g.ellipse(cx, yb - 10 - ph * 0.5, lc * 0.38, ph * 0.46, 0, 0, Math.PI * 2); g.stroke();
        g.fillStyle = '#f4f4f2'; g.fillRect(cx - 14, yb - 8, 28, 7);
      }
      g.fillStyle = '#8f8f8b'; g.fillRect(v0, yb - 10, v1 - v0, 3);
    }
    // le reflet de la vitre, en biais
    g.fillStyle = 'rgba(255,255,255,0.13)';
    g.beginPath(); g.moveTo(v0 + 40, t0); g.lineTo(v0 + 120, t0); g.lineTo(v0 + 20, t1); g.lineTo(v0, t1); g.lineTo(v0, t0 + 160); g.closePath(); g.fill();
    // le monnayeur : l'afficheur, le clavier, la fente, le lecteur de carte
    g.fillStyle = '#3a3a38'; g.fillRect(372, 40, 118, 680);
    g.fillStyle = '#0d1a0f'; g.fillRect(386, 70, 90, 40); g.fillStyle = '#7dff8e'; g.font = '600 22px Consolas, monospace'; g.fillText('0,00', 400, 98);
    for (let j = 0; j < 4; j++) for (let i = 0; i < 3; i++) { g.fillStyle = '#c9c9c4'; g.fillRect(392 + i * 28, 140 + j * 30, 22, 22); }
    g.fillStyle = '#111'; g.fillRect(420, 290, 8, 40); g.fillStyle = '#c9c9c4'; g.fillRect(396, 360, 70, 44);
    g.fillStyle = '#2f6fb0'; g.fillRect(404, 372, 54, 20);
    g.fillStyle = '#f2b705'; g.fillRect(386, 440, 90, 120); g.fillStyle = '#1d1d1c'; g.font = '700 20px "Segoe UI", sans-serif'; g.fillText('SNACKS', 392, 506);
    // la trappe de distribution
    g.fillStyle = '#2c2c2b'; g.fillRect(v0, 770, v1 - v0, 130); g.fillStyle = '#4a4a48'; g.fillRect(v0 + 20, 790, v1 - v0 - 40, 10);
    g.fillStyle = '#111'; g.fillRect(400, 800, 50, 70);
  }, null, false, 4);
}
// LE DISTRIBUTEUR DE BOISSONS CHAUDES (la vidéo : noir, un écran vidéo en façade, la niche du gobelet) — la façade
function texCafe() {
  return canvasTex(512, 1024, (g, w, h) => {
    g.fillStyle = '#1a1a1a'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#2a2624'; g.fillRect(0, 0, w, 56); g.fillStyle = '#d9b48a'; g.font = '600 30px "Segoe UI", sans-serif'; g.fillText('café', 30, 40);
    // l'écran (une publicité : la tasse et sa vapeur)
    const s0 = 56, s1 = 456, e0 = 90, e1 = 520;
    const fond = g.createLinearGradient(0, e0, 0, e1); fond.addColorStop(0, '#6b3d22'); fond.addColorStop(1, '#e8c79a');
    g.fillStyle = fond; g.fillRect(s0, e0, s1 - s0, e1 - e0);
    g.fillStyle = '#fbf6ee'; g.beginPath(); g.ellipse(256, 420, 120, 28, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#f4efe6'; g.beginPath(); g.moveTo(186, 330); g.lineTo(326, 330); g.lineTo(312, 410); g.quadraticCurveTo(256, 432, 200, 410); g.closePath(); g.fill();
    g.fillStyle = '#4a2a17'; g.beginPath(); g.ellipse(256, 332, 70, 13, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#f4efe6'; g.lineWidth = 10; g.beginPath(); g.arc(334, 362, 22, -1.3, 1.5); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = 6;
    for (const dx of [-24, 0, 24]) { g.beginPath(); g.moveTo(256 + dx, 310); g.bezierCurveTo(236 + dx, 280, 276 + dx, 250, 256 + dx, 216); g.stroke(); }
    g.fillStyle = '#ffffff'; g.font = '700 34px "Segoe UI", sans-serif'; g.textAlign = 'center'; g.fillText('Café · Thé · Chocolat', 256, 150);
    g.font = '500 22px "Segoe UI", sans-serif'; g.fillText('dès 0,80 €', 256, 186); g.textAlign = 'left';
    // les touches, la niche du gobelet, le monnayeur
    for (let j = 0; j < 2; j++) for (let i = 0; i < 6; i++) { g.fillStyle = '#3d3d3b'; g.fillRect(64 + i * 66, 556 + j * 46, 54, 34); g.fillStyle = '#d9b48a'; g.fillRect(70 + i * 66, 566 + j * 46, 20, 4); }
    g.fillStyle = '#0c0c0c'; g.fillRect(150, 680, 212, 190); g.fillStyle = '#3a3a38'; g.fillRect(160, 846, 192, 14);
    g.fillStyle = '#9a9a96'; g.fillRect(410, 690, 50, 120); g.fillStyle = '#111'; g.fillRect(430, 704, 8, 34);
  }, null, false, 4);
}
// LES AFFICHES ENCADRÉES du mur vert (la vidéo : cadre noir mince, fond blanc, du texte) : le mode d'emploi de l'espace
// pause, une phrase
function texCadre(n) {
  return canvasTex(256, 336, (g, w, h) => {
    g.fillStyle = '#fbfaf6'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#1d1d1f'; g.textAlign = 'center';
    if (n === 1) {
      g.font = '700 24px "Segoe UI", sans-serif'; g.fillText('L\'espace pause', w / 2, 58);
      g.font = '500 17px "Segoe UI", sans-serif'; g.fillText('mode d\'emploi', w / 2, 84);
      g.fillStyle = '#a4d455'; g.fillRect(w / 2 - 30, 98, 60, 4);   // (le vert du mur)
      g.fillStyle = '#2a2a2a'; g.textAlign = 'left'; g.font = '500 16px "Segoe UI", sans-serif';
      ['Je trie mes déchets', 'Je range mon tabouret', 'Je laisse la table propre', 'Je parle doucement'].forEach((t, i) => {
        g.fillStyle = '#a4d455'; g.fillRect(34, 140 + i * 36 - 9, 8, 8); g.fillStyle = '#2a2a2a'; g.fillText(t, 52, 140 + i * 36);
      });
      g.textAlign = 'center'; g.font = '600 18px "Segoe UI", sans-serif'; g.fillText('Bonne pause !', w / 2, 300);
    } else {
      g.font = 'italic 500 30px Georgia, "Times New Roman", serif';
      g.fillText('« Une pause,', w / 2, 140); g.fillText('et ça repart. »', w / 2, 182);
      g.fillStyle = '#f08a24'; g.fillRect(w / 2 - 6, 228, 12, 8);
      g.fillStyle = '#1d1d1f'; g.font = '600 34px "Century Gothic", "Segoe UI", sans-serif'; g.fillText('iris', w / 2, 270);
    }
  }, null, false, 4);
}
// L'AFFICHE JAUNE ET NOIRE « 100 % » (la vidéo, à droite de la porte de l'espace pause)
function texCent() {
  return canvasTex(256, 362, (g, w, h) => {
    g.fillStyle = '#f2b705'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#2b2b2d'; g.fillRect(16, 18, w - 32, 150); g.fillRect(16, 180, w - 32, 70);
    g.fillStyle = '#ffffff'; g.font = '800 72px "Segoe UI", sans-serif'; g.textAlign = 'center'; g.fillText('100 %', w / 2, 112);
    g.font = '600 22px "Segoe UI", sans-serif'; g.fillText('alternance', w / 2, 148);
    g.font = '500 17px "Segoe UI", sans-serif'; g.fillText('Bachelor · BTS · Mastère', w / 2, 222);
    g.fillStyle = '#2b2b2d'; g.font = '700 30px "Century Gothic", "Segoe UI", sans-serif'; g.fillText('iris', w / 2, 320);
  }, null, false, 4);
}
// L'AFFICHE BORDEAUX ET SON QR CODE (la vidéo : à côté de la porte vitrée du mur vert)
function texAfficheQR() {
  return canvasTex(256, 362, (g, w, h) => {
    g.fillStyle = '#f6f3ee'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#7a2032'; g.fillRect(0, 0, w, 130);
    g.fillStyle = '#ffffff'; g.font = '700 26px "Segoe UI", sans-serif'; g.textAlign = 'center'; g.fillText('Donne ton avis !', w / 2, 62);
    g.font = '500 16px "Segoe UI", sans-serif'; g.fillText('Enquête de satisfaction', w / 2, 96);
    dessinerQR(g, w / 2 - 60, 160, 120, 2026);
    g.fillStyle = '#7a2032'; g.fillRect(40, 312, w - 80, 6);
  }, null, false, 4);
}
// LE TROMBINOSCOPE (la vidéo : un cadre d'aluminium, des médaillons ovales sur fond pêche) — des silhouettes
function texTrombi() {
  return canvasTex(256, 352, (g, w, h) => {
    const r2 = graine(31);
    g.fillStyle = '#e3c493'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#3a3532'; g.font = '700 19px "Segoe UI", sans-serif'; g.textAlign = 'center'; g.fillText('L\'équipe IRIS', w / 2, 30);
    for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) {
      const cx = 35 + i * 62, cy = 82 + j * 70, t = r2();
      g.save(); g.beginPath(); g.ellipse(cx, cy, 23, 28, 0, 0, Math.PI * 2); g.clip();
      g.fillStyle = '#f5ead8'; g.fillRect(cx - 30, cy - 30, 60, 60);
      g.fillStyle = t < 0.33 ? '#6b5444' : t < 0.66 ? '#8d7564' : '#4a3a30';
      g.beginPath(); g.arc(cx, cy - 6, 10, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(cx, cy + 26, 20, 16, 0, 0, Math.PI * 2); g.fill();
      g.restore();
      g.fillStyle = 'rgba(58,53,50,0.7)'; g.fillRect(cx - 18, cy + 32, 36, 4);
    }
  }, null, false, 4);
}
// LE CADRE DE LA SALLE ROBERT KAHN (imaginé : les salles d'IRIS portent les noms des pionniers d'Internet — Tim
// Berners-Lee et David Clark au rez-de-chaussée, photos 22 et 24 ; Robert Kahn et Gordon Earle Moore au 1er, photo 28)
function texKahn() {
  return canvasTex(768, 512, (g, w, h) => {
    g.fillStyle = '#fbfaf7'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#111111'; g.fillRect(0, 0, w, 84);
    g.fillStyle = '#ffffff'; g.font = '600 46px "Century Gothic", "Avenir", "Segoe UI", sans-serif'; g.fillText('iris', 28, 58);
    g.fillStyle = '#f08a24'; g.fillRect(30, 18, 11, 7);
    g.fillStyle = '#f4f4f2'; g.font = '600 28px "Segoe UI", sans-serif'; g.fillText('Salle Robert Kahn — B 1.4', 140, 54);
    g.fillStyle = '#1d1d1f'; g.font = '700 52px "Segoe UI", sans-serif'; g.fillText('Robert E. Kahn', 34, 160);
    g.fillStyle = '#4a4a4a'; g.font = '500 24px "Segoe UI", sans-serif';
    g.fillText('co-inventeur de TCP/IP', 34, 204); g.fillText('avec Vinton Cerf, en 1974', 34, 236);
    g.fillStyle = '#f08a24'; g.fillRect(34, 262, 70, 6);
    g.fillStyle = '#2a2a2a'; g.font = 'italic 500 23px Georgia, "Times New Roman", serif';
    g.fillText('Internet, le réseau des réseaux', 34, 318);
    g.fillStyle = '#6a6a6a'; g.font = '500 18px "Segoe UI", sans-serif'; g.fillText('BTS SIO · option SISR', 34, 462);
    // la pile des couches du modèle TCP/IP
    const couches = [['Application', 'HTTP · DNS · SSH', '#7b2a6e'], ['Transport', 'TCP · UDP', '#b23a7a'], ['Internet', 'IP', '#e0663a'], ['Accès réseau', 'Ethernet · Wi-Fi', '#f2a33a']];
    couches.forEach(([t, s, c], i) => {
      const y = 116 + i * 92;
      g.fillStyle = c; g.fillRect(420, y, 310, 78);
      g.fillStyle = '#ffffff'; g.font = '700 26px "Segoe UI", sans-serif'; g.fillText(t, 438, y + 34);
      g.font = '500 19px "Segoe UI", sans-serif'; g.fillText(s, 438, y + 62);
    });
  }, null, false, 8);
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
    faience: std({ map: texFaience(), roughness: 0.18, metalness: 0 }),
    chene: std({ map: texChene(), roughness: 0.48 }),
    blancTable: std({ color: 0xeeece6, roughness: 0.42 }),
    anthracite: std({ color: 0x34363b, roughness: 0.45, metalness: 0.55 }),
    coque: std({ color: 0x2c2e33, roughness: 0.5 }),
    coqueJaune: std({ color: 0xe8b21e, roughness: 0.5 }),
    tissu: std({ color: 0x2a2c31, roughness: 0.92 }),
    ceramique: std({ color: 0xf6f6f3, roughness: 0.1 }),
    hpl: std({ color: 0x4b4f56, roughness: 0.4 }),
    miroir: std({ color: 0xe6ecee, roughness: 0.02, metalness: 1.0 }),
    toile: std({ color: 0xf6f6f2, roughness: 0.9 }),
    ecranNoir: std({ color: 0x0d0e10, roughness: 0.25, metalness: 0.3 }),
    armoire: std({ color: 0xd9d6cf, roughness: 0.5 }),
    gris: std({ color: 0x9aa1a8, roughness: 0.45, metalness: 0.4 }),
    feuille: std({ color: 0x3d6b3a, roughness: 0.6, side: THREE.DoubleSide }),
    pot: std({ color: 0x2d2d2d, roughness: 0.7 }),
    eau: std({ color: 0x9fc7e0, roughness: 0.05, transparent: true, opacity: 0.55 }),
    liege: std({ map: texLiege(), roughness: 0.9 }),
    // (l'espace pause, 09/10 : les teintes relevées sur la vidéo du sous-sol, corrigées de son éclairage)
    // (09/10, relecture : #a8c34a sortait olive sous la lumière chaude du jeu — vert 168,179,54 contre 160,178,85 sur la
    // vidéo, image 64 ; un vert anis plus vert, plus clair : 156,178,66 rendu)
    anis: std({ color: 0xa4d455, roughness: 0.88 }),
    // (09/10, relecture : le grès sortait crème, presque aussi clair que les murs — 191,183,163 contre 206,194,175 ; la
    // vidéo le montre grège, nettement plus sombre que les murs : sa teinte assombrie, 174,163,134 rendu)
    gresPause: std({ map: texGresPause(), color: 0xd6d6d6, roughness: 0.32 }),
    plintheGrise: std({ color: 0x6e6f6a, roughness: 0.5 }),
    plateauNoir: std({ color: 0x1f1f1d, roughness: 0.38 }),
    noirMat: std({ color: 0x1c1c1a, roughness: 0.62, metalness: 0.2 }),
    tolixVert: std({ color: 0x3f7f3a, roughness: 0.32, metalness: 0.45 }),
    stratifieGris: std({ color: 0xbdbab2, roughness: 0.45 }),
    acierGris: std({ color: 0x8f9192, roughness: 0.4, metalness: 0.6 }),
    caisse: std({ color: 0x262625, roughness: 0.35, metalness: 0.3 }),
    bleuMarine: std({ color: 0x23306e, roughness: 0.5 }),
  };
  X.gresPause.name = 'grès de l\'espace pause';
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
    const zoneDe = (x) => (x < 6.6 ? 'e101' : x < 13.2 ? 'e102' : x < 16.5 ? 'e103' : 'e104');
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
    // les mitoyens (l'ouest de la salle 101, l'est de la salle 104 et le bout du couloir)
    mur({ de: [-0.15, 0], a: [-0.15, 7.05], ep: 0.3, mats: B0, plinthes: ['E'] });
    mur({ de: [19.95, 0], a: [19.95, 8.99], ep: 0.3, mats: B0, plinthes: ['W'], ouvertures: [{ c: 7.95, l: 0.93 }] });
    // les cloisons entre les salles, sur les limites de travées (entre deux fenêtres)
    for (const x of [6.6, 13.2, 16.5]) mur({ de: [x, 0], a: [x, Y_SALLES - EP / 2], mats: B0, plinthes: ['E', 'W'] });
    // LA CLOISON NORD DES SALLES (le mur sud du couloir) et ses quatre portes
    const PORTES_SALLES = [5.75, 12.35, 13.95, 17.15];
    mur({ de: [-0.3, Y_SALLES], a: [19.8, Y_SALLES], mats: B0, plinthes: ['N', 'S'], ouvertures: PORTES_SALLES.map((c) => ({ c, l: 0.95 })) });
    // (ouvertes dans la salle, contre la cloison : le gond côté cloison ; celle de la 101, rabattue à plat contre le mur
    // — l'allée du fond de la salle passe là)
    porte('x', Y_SALLES, 5.75, { etat: 'ouverte', angle: 2.95, cote: 'S', nom: 'salle 101' });
    porte('x', Y_SALLES, 12.35, { etat: 'ouverte', angle: 1.5, cote: 'S', charniere: 'd', nom: 'salle 102' });
    porte('x', Y_SALLES, 13.95, { etat: 'ouverte', angle: 1.5, cote: 'S', nom: 'bureau 103', notices: 1 });
    porte('x', Y_SALLES, 17.15, { etat: 'ouverte', angle: 1.5, cote: 'S', nom: 'salle 104' });
    // les blocs de sortie au-dessus des portes des deux salles de cours, côté salle
    for (const x of [5.75, 12.35]) ch.sortie(x, Y_SALLES - EP / 2 - 0.03, N1 + 2.3, 'S');
    // LA CLOISON NORD DU COULOIR : les toilettes (ouvertes), les salles côté cour (fermées)
    mur({ de: [4.6, Y_COUR], a: [19.8, Y_COUR], mats: B0, plinthes: ['S'], ouvertures: [5.4, 9.6, 13.4, 17.6].map((c) => ({ c, l: 0.95 })) });
    // (côté toilettes, la faïence double le mur, de part et d'autre de la porte)
    for (const [a, b] of [[4.75, 4.9], [5.9, 8.44]]) B(a, Y_COUR + EP / 2, b, Y_COUR + EP / 2 + 0.006, N1, H_COUL, X.faience, { ombre: false });
    porte('x', Y_COUR, 5.4, { etat: 'ouverte', angle: 1.45, cote: 'N', charniere: 'd', oculus: false, nom: 'toilettes' });
    // (09/10 : la 105 est l'espace pause, ouverte — son vantail rabattu contre le mur, côté est, dans la pièce)
    porte('x', Y_COUR, 9.6, { etat: 'ouverte', angle: 2.95, cote: 'N', charniere: 'd', notices: 2, nom: 'espace pause' });
    porte('x', Y_COUR, 13.4, { etat: 'fermee', cote: 'N', notices: 1, nom: 'salle 106' });
    porte('x', Y_COUR, 17.6, { etat: 'fermee', cote: 'N', charniere: 'd', nom: 'salle 107' });
    // l'issue de secours au bout du couloir (fermée) et son bloc vert
    porte('y', 19.95, 7.95, { etat: 'fermee', cote: 'E', ep: 0.3, notices: 1, nom: 'issue de secours (étage)' });
    ch.sortie(19.78, 7.95, N1 + 2.3, 'W');
    // LE PALIER D'ÉTAGE : à l'ouest, le mur du local ménage (porte de gaine fermée) — peint en SAFRAN, comme le mur de
    // la salle d'attente (photos 02, 21), avec le panneau de l'étage ; à l'est, les toilettes
    mur({ de: [1.675, Y_SALLES + EP / 2], a: [1.675, 12.45], ep: 0.15, mats: { E: M.orange, W: B0 }, plinthes: ['E'], ouvertures: [{ c: 7.95, l: 0.95 }] });
    porte('y', 1.675, 7.95, { modele: 'gaine', etat: 'fermee', cote: 'E', ep: 0.15, nom: 'local ménage' });
    mur({ de: [4.675, Y_COUR + EP / 2], a: [4.675, 12.45], ep: 0.15, mats: { W: B0, E: X.faience }, plinthes: ['W'] });
    // les toilettes : l'est (de l'autre côté, le mur vert anis de l'espace pause) et le nord
    mur({ de: [8.5, Y_COUR + EP / 2], a: [8.5, 12.75], mats: { W: X.faience, E: X.anis } });
    mur({ de: [4.6, 12.69], a: [8.56, 12.69], mats: { S: X.faience, N: B0 } });
  }

  // =====================================================================
  //  LES SOLS (le carrelage de l'étage et le monde solide)
  // =====================================================================
  function construireSols() {
    // le carrelage : les salles (grand côté est-ouest), le couloir (est-ouest), le palier et les toilettes (nord-sud)
    const rects = [
      [-0.3, 0, 19.95, Y_SALLES, 'ew'], [1.6, Y_SALLES, 19.95, Y_COUR, 'ew'],
      [1.6, Y_COUR, 4.675, 12.6, 'ns'], [4.675, Y_COUR, 8.56, 12.75, 'ns'],
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
    C.sol(-0.3, 0, 19.95, -12.6, N1);                      // (x -0,3-19,95, y 0-12,6 : salles, couloir, palier d'étage)
    C.sol(4.6, -8.8, 8.6, -12.8, N1);                       // les toilettes, jusqu'à leur mur nord
    C.ajouterBoite(-0.3, 0, 19.95, -Y_COUR - 0.1, { y0: N1 - 0.32, y1: N1 - 0.02, joueur: false });
    C.ajouterBoite(1.6, -Y_COUR, 8.6, -12.45, { y0: N1 - 0.32, y1: N1 - 0.02, joueur: false });
    C.ajouterBoite(4.6, -12.45, 8.6, -12.8, { y0: N1 - 0.32, y1: N1 - 0.02, joueur: false });
  }

  // =====================================================================
  //  LES FAUX PLAFONDS ET LES LUMINAIRES
  // =====================================================================
  function construirePlafondsEtLumieres() {
    // les salles et les bureaux : plateaux perforés (comme la salle d'attente, photos 02, 21), luminaires à grille
    ch.plafond(0, 0, 6.6, Y_SALLES, H_SALLE, 'plateaux');
    ch.plafond(6.6, 0, 13.2, Y_SALLES, H_SALLE, 'plateaux');
    ch.plafond(13.2, 0, 16.5, Y_SALLES, H_SALLE, 'plateaux');
    ch.plafond(16.5, 0, 19.8, Y_SALLES, H_SALLE, 'plateaux');
    for (const x of [1.5, 3.3, 5.1]) for (const y of [1.8, 4.8]) dalle(x, y, 'e101');
    for (const x of [8.1, 9.9, 11.7]) for (const y of [1.8, 4.8]) dalle(x, y, 'e102');
    for (const y of [1.8, 4.8]) { dalle(14.85, y, 'e103'); dalle(18.15, y, 'e104'); }
    // le couloir, le palier d'étage, les toilettes : plâtre et hublots opales (comme les couloirs C01 et C05, photos 01, 05)
    ch.plafond(1.75, Y_SALLES, 19.8, Y_COUR, H_COUL, 'platre');
    ch.plafond(1.75, Y_COUR, 4.6, 12.45, H_COUL, 'platre');
    ch.plafond(4.75, Y_COUR, 8.44, 12.63, H_COUL, 'platre');
    for (const x of [3.2, 5.6, 8.0, 10.4, 12.8, 15.2, 17.6]) opale(x, 7.95, H_COUL, 'e1couloir');
    opale(19.3, 7.95, H_COUL, 'e1couloir', { r: 0.15 });
    for (const y of [10.0, 11.7]) opale(3.2, y, H_COUL, 'e1hall');
    for (const [x, y] of [[5.7, 9.9], [7.4, 9.9], [7.0, 11.8]]) spot(x, y, H_COUL, 'e1wc');
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
  // L'ÉCRAN DE PROJECTION déroulé (carter blanc, toile, barre de lestage) et l'IMAGE du vidéoprojecteur
  const ecranProjection = (x, y, face, w, h, sujet) => {
    const g = new THREE.Group(); g.position.set(x, N1, -y); g.rotation.y = ROT[face]; groupe.add(g);
    const haut = H_SALLE - N1 - 0.12;
    const carter = maille(new THREE.CylinderGeometry(0.045, 0.045, w + 0.16, 14), M.boitier, 0, haut, 0.07, 0, g); carter.rotation.z = Math.PI / 2;
    maille(boiteM(w + 0.02, h + 0.08, 0.004), X.toile, 0, haut - 0.06 - (h + 0.08) / 2, 0.07, 0, g, { ombre: false });
    maille(boiteM(w + 0.03, 0.02, 0.02), M.noirMat, 0, haut - 0.14 - h, 0.07, 0, g);
    // (l'image : un peu plus lumineuse que la toile, elle reste lisible sous les dalles allumées)
    const img = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.92, h * 0.92 * 0.95), new THREE.MeshBasicMaterial({ map: texDiapo(sujet), color: new THREE.Color(0.92, 0.92, 0.92) }));
    img.position.set(0, haut - 0.06 - (h + 0.08) / 2, 0.074); g.add(img);
    for (const s of [-1, 1]) maille(boiteM(0.02, 0.06, 0.05), M.boitier, s * (w / 2 + 0.05), haut, 0.03, 0, g, { ombre: false });
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
  // UNE PLAQUE DE PORTE à côté d'une porte, côté couloir
  const plaque = (num, libelle, x, y, face) => panneau(new THREE.MeshStandardMaterial({ map: texPlaque(num, libelle), roughness: 0.4 }), 0.26, 0.13, x, y, N1 + 1.6, face);
  // UNE PLAQUE DE SALLE (09/10, photo 23 : 15 x 9 cm, à 1,65 m — un peu plus grande ici, pour qu'on la lise)
  const plaqueSalle = (l1, l2, l3, x, y, face, picto = null) => panneau(new THREE.MeshStandardMaterial({ map: texPlaqueSalle(l1, l2, l3, picto), roughness: 0.35 }), 0.18, 0.108, x, y, N1 + 1.65, face);

  // =====================================================================
  //  LA SALLE 101 : la « Salle de cours » B 1.1 (travées 1 à 4, la grande baie rouge)
  // =====================================================================
  // Le tableau au mur ouest (le mitoyen) : la lumière des fenêtres arrive par la gauche des élèves, comme il se doit.
  // Trois rangs de trois tables pour deux (18 places), deux allées de 70 cm entre les tables : chaque chaise se
  // rejoint par une allée (le siège se propose à moins de 1,10 m). Le bureau de l'enseignant près des fenêtres, le
  // vidéoprojecteur au plafond, l'écran déroulé à côté du tableau blanc.
  function meublerSalle101() {
    tableauBlanc(0.0, 2.3, 'E', 2.4, 'swot');
    ecranProjection(0.04, 4.75, 'E', 1.9, 1.2, 'marketing');
    // (le vidéoprojecteur entre deux luminaires, à 4,20 m de l'écran — pas pendu au milieu d'un luminaire)
    projecteur(4.2, 4.75, 'W');
    horloge(0.0, 2.3, N1 + 2.45, 'E');
    // le bureau de l'enseignant (tourné vers la classe), son fauteuil, son portable — devant l'écran, le tableau libre
    // (70 cm de passage entre le bureau et le premier rang : on va de l'avant de la classe au fond par là)
    table(1.05, 5.45, 0.7, 1.4, { mat: X.blancTable });
    fauteuil(0.43, 5.45, 'E', { sortie: [0.6, 4.35], nom: 'le fauteuil du professeur' });
    const pc = new THREE.Group(); pc.position.set(1.02, N1 + 0.745, -5.5); pc.rotation.y = -Math.PI / 2; groupe.add(pc);
    maille(boiteM(0.34, 0.015, 0.24), M.aluGris, 0, 0.008, 0, 0, pc);
    const ec = maille(boiteM(0.34, 0.23, 0.008), X.ecranNoir, 0, 0.12, -0.13, 0, pc); ec.rotation.x = -0.25;
    // LES TABLES DES ÉLÈVES : trois rangs (x 2,45 / 3,75 / 5,05), trois tables pour deux par rang ; les allées de 70 cm
    // courent d'est en ouest entre les tables (y 1,98-2,68 et 3,88-4,58), et le long des fenêtres
    const rangs = [2.45, 3.75, 5.05], cols = [1.38, 3.28, 5.18];
    let n = 0;
    for (const xr of rangs) for (const yc of cols) {
      table(xr, yc, 0.6, 1.2);
      for (const s of [-1, 1]) {
        const yy = yc + s * 0.3, allee = yc + s * 0.95;
        chaise(xr + 0.52, yy, 'W', { sortie: [xr + 0.55, allee], mat: (n++ % 7 === 3) ? X.coqueJaune : X.coque });
      }
    }
    // les radiateurs sous les fenêtres, la plante, les affiches
    for (const k of [2, 3, 4]) radiateur(centreTravee(k), 0.0, 'N', 1.0);
    plante(0.35, 0.4);
    affiche('#2f6fb0', '#fbfbf8', 61, 0.6, 0.85, 3.4, Y_SALLES - EP / 2, 1.55, 'S');
    affiche('#f08a24', '#fbfbf8', 62, 0.6, 0.85, 4.3, Y_SALLES - EP / 2, 1.55, 'S');
    // au fond de la classe (mur est), le tableau de liège des annonces (celui du couloir, retourné)
    B(6.52, 2.5, 6.54, 4.3, N1 + 0.98, N1 + 1.92, M.aluGris, { ombre: false });
    const liege2 = X.liege.clone(); liege2.map = X.liege.map.clone();
    liege2.map.wrapS = THREE.RepeatWrapping; liege2.map.repeat.set(-1, 1); liege2.map.needsUpdate = true;
    panneau(liege2, 1.76, 0.9, 6.518, 3.4, N1 + 1.45, 'W');
    // les patères et la poubelle
    for (let k = 0; k < 5; k++) B(2.0 + k * 0.25, Y_SALLES - EP / 2 - 0.06, 2.03 + k * 0.25, Y_SALLES - EP / 2, N1 + 1.62, N1 + 1.65, M.inox, { ombre: false });
    B(1.9, Y_SALLES - EP / 2 - 0.02, 3.25, Y_SALLES - EP / 2, N1 + 1.6, N1 + 1.7, X.armoire, { ombre: false });
    maille(new THREE.CylinderGeometry(0.15, 0.13, 0.4, 16), X.anthracite, 0.35, N1 + 0.2, -6.55, 0, groupe);
    C.ajouterCercle(0.35, -6.55, 0.16, { y0: N1, y1: N1 + 0.4 });
  }

  // =====================================================================
  //  LA SALLE 102 : la « Salle Robert Kahn » B 1.4, salle informatique (travées 5 à 8)
  // =====================================================================
  // Une école du numérique : des postes tout autour (sous les fenêtres et contre la cloison du couloir, tournés vers le
  // mur), un îlot de quatre postes au milieu, le tableau blanc et l'écran au mur ouest, le poste de l'enseignant devant.
  function meublerSalle102() {
    tableauBlanc(6.66, 2.6, 'E', 2.0, 'reseau');
    ecranProjection(6.7, 4.85, 'E', 1.8, 1.15, 'web');
    projecteur(10.8, 4.85, 'W');           // (entre deux luminaires)
    horloge(6.66, 2.6, N1 + 2.42, 'E');
    table(7.55, 1.6, 0.7, 1.4, { mat: X.blancTable });
    fauteuil(7.0, 1.6, 'E', { sortie: [7.1, 2.75], nom: 'le fauteuil du professeur' });
    ordinateur(7.45, 1.6, 'W', 3);
    let n = 0;
    // sous les fenêtres (tournés vers le sud, la fenêtre devant)
    for (const xc of [8.75, 10.15, 11.55]) {
      table(xc, 0.62, 1.4, 0.62, { mat: X.blancTable });
      for (const s of [-1, 1]) { ordinateur(xc + s * 0.35, 0.55, 'N', n); chaise(xc + s * 0.35, 1.32, 'S', { sortie: [xc + s * 0.35, 1.95] }); n++; }
    }
    // contre la cloison du couloir (tournés vers le nord)
    for (const xc of [8.15, 9.55, 10.95]) {
      table(xc, 6.48, 1.4, 0.62, { mat: X.blancTable });
      for (const s of [-1, 1]) { ordinateur(xc + s * 0.35, 6.55, 'S', n); chaise(xc + s * 0.35, 5.78, 'N', { sortie: [xc + s * 0.35, 5.1] }); n++; }
    }
    // l'îlot central : deux rangées dos à dos (au sud, les élèves regardent le nord ; au nord, le sud)
    for (const xc of [9.2, 10.6]) {
      for (const [yc, d, yChaise, ySortie] of [[3.18, 'N', 2.45, 1.92], [3.82, 'S', 4.55, 5.15]]) {
        table(xc, yc, 1.4, 0.64, { mat: X.blancTable });
        for (const s of [-1, 1]) {
          ordinateur(xc + s * 0.35, yc + (d === 'N' ? 0.05 : -0.05), d === 'N' ? 'S' : 'N', n++);
          chaise(xc + s * 0.35, yChaise, d, { sortie: [xc + s * 0.35, ySortie] });
        }
      }
    }
    // la baie de brassage dans l'angle nord-ouest (une armoire réseau noire, ses voyants)
    armoire(6.66, 6.45, 'E', 0.6, 1.6, 0.6, M.noirMat);
    const voyants = [0xf2b705, 0x3ccf6e].map((c) => new THREE.MeshBasicMaterial({ color: c }));
    for (let k = 0; k < 6; k++) B(7.26, 6.25 + k * 0.07, 7.27, 6.28 + k * 0.07, N1 + 1.1, N1 + 1.12, voyants[k % 2], { ombre: false });
    for (const k of [5, 6, 7, 8]) radiateur(centreTravee(k), 0.0, 'N', 1.0, 0.12, 0.5);
    // (09/10) LE CADRE DE LA SALLE ROBERT KAHN au-dessus des postes du mur nord, en face des fenêtres : son nom, TCP/IP
    B(8.995, Y_SALLES - EP / 2 - 0.022, 10.205, Y_SALLES - EP / 2, N1 + 1.41, N1 + 2.23, M.noirMat, { ombre: false });
    panneau(new THREE.MeshStandardMaterial({ map: texKahn(), roughness: 0.3 }), 1.17, 0.78, 9.6, Y_SALLES - EP / 2 - 0.023, N1 + 1.82, 'S');
    // (09/10 : collées au mur — en x 12,9, elles flottaient à 24 cm devant la cloison x 13,2)
    affiche('#3e9b6b', '#fbfbf8', 63, 0.6, 0.85, 13.137, 3.2, 1.55, 'W');
    affiche('#7b2a6e', '#fbfbf8', 64, 0.6, 0.85, 13.137, 4.2, 1.55, 'W');
  }

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
    // la table ronde et ses deux chaises
    maille(new THREE.CylinderGeometry(0.45, 0.45, 0.025, 32), X.blancTable, 15.0, N1 + 0.73, -5.3, 0, groupe);
    maille(new THREE.CylinderGeometry(0.03, 0.03, 0.72, 10), X.anthracite, 15.0, N1 + 0.36, -5.3, 0, groupe);
    maille(new THREE.CylinderGeometry(0.25, 0.25, 0.015, 24), X.anthracite, 15.0, N1 + 0.008, -5.3, 0, groupe);
    C.ajouterCercle(15.0, -5.3, 0.46, { y0: N1, y1: N1 + 0.75 });
    chaise(15.0, 4.55, 'N', { sortie: [14.4, 4.3] });
    chaise(15.75, 5.3, 'W', { sortie: [15.9, 4.4] });
    plante(16.05, 6.5, { h: 1.1 });
    for (const k of [9, 10]) radiateur(centreTravee(k), 0.0, 'N', 1.0);
    affiche('#2b4c9b', '#fbfbf8', 65, 0.42, 0.6, 16.43, 1.8, 1.5, 'W');
  }

  // =====================================================================
  //  LA SALLE 104 : la salle des enseignants (travées 11 et 12, la fenêtre des pompiers)
  // =====================================================================
  function meublerSalle104() {
    // la grande table de réunion et six chaises, les casiers des enseignants, le coin café
    // (des allées de 65 à 70 cm de part et d'autre)
    table(18.2, 3.3, 1.0, 2.2, { mat: X.chene });
    for (const yy of [2.6, 3.3, 4.0]) {
      chaise(17.45, yy, 'E', { sortie: [16.95, yy] });
      chaise(18.95, yy, 'W', { sortie: [19.45, yy] });
    }
    // les casiers (douze portes grises) contre la cloison du couloir
    const g = new THREE.Group(); g.position.set(18.4, N1, -(Y_SALLES - EP / 2)); g.rotation.y = 0; groupe.add(g);
    maille(boiteM(1.6, 1.8, 0.45), X.gris, 0, 0.9, 0.225, 0, g);
    const matCasier = new THREE.MeshStandardMaterial({ color: 0xb4bbc2, roughness: 0.4, metalness: 0.4 });
    for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) {
      maille(boiteM(0.38, 0.56, 0.01), matCasier, -0.6 + i * 0.4, 0.31 + j * 0.59, 0.455, 0, g, { ombre: false });
      maille(boiteM(0.04, 0.02, 0.02), M.noirMat, -0.5 + i * 0.4, 0.5 + j * 0.59, 0.465, 0, g, { ombre: false });
    }
    C.ajouterBoite(17.6, -(Y_SALLES - EP / 2), 19.2, -(Y_SALLES - EP / 2 - 0.47), { y0: N1, y1: N1 + 1.8 });
    // le coin café : un meuble bas, la machine, la bouilloire
    B(19.2, 5.2, 19.8, 6.9, N1, N1 + 0.88, X.armoire, { collision: true });
    B(19.18, 5.18, 19.8, 6.9, N1 + 0.88, N1 + 0.91, X.chene);
    B(19.4, 5.5, 19.72, 5.8, N1 + 0.91, N1 + 1.3, M.noirMat);
    B(19.45, 5.52, 19.6, 5.6, N1 + 1.0, N1 + 1.08, M.inox, { ombre: false });
    maille(new THREE.CylinderGeometry(0.07, 0.08, 0.22, 16), M.inox, 19.55, N1 + 1.02, -6.3, 0, groupe);
    for (const k of [11]) radiateur(centreTravee(k), 0.0, 'N', 1.0);
    plante(16.95, 0.5);
    affiche('#e07b2a', '#fbfbf8', 66, 0.42, 0.6, 19.795, 2.2, 1.5, 'W');
    horloge(19.8, 3.3, N1 + 2.2, 'W');
  }

  // =====================================================================
  //  LES TOILETTES
  // =====================================================================
  // Faïence blanche jusqu'au plafond, trois cabines en stratifié anthracite (la première entrouverte), deux lavabos sur
  // un plan, le grand miroir, le sèche-mains.
  function construireToilettes() {
    const x0 = 4.75, x1 = 8.44, yc = 11.05, ym = 12.63;
    // les cabines : cloisons et façade à 15 cm du sol, 2,00 m de haut
    const larg = (x1 - 5.65) / 3;
    for (let k = 0; k <= 3; k++) {
      const x = 5.65 + k * larg;
      if (k > 0 && k < 3) B(x - 0.012, yc, x + 0.012, ym, N1 + 0.15, N1 + 2.0, X.hpl, { collision: true });
    }
    B(5.638, yc, 5.662, ym, N1 + 0.15, N1 + 2.0, X.hpl, { collision: true });
    for (let k = 0; k < 3; k++) {
      const a = 5.65 + k * larg, b = a + larg;
      // la façade de la cabine : deux bouts fixes et la porte (60 cm)
      B(a, yc - 0.012, a + 0.1, yc + 0.012, N1 + 0.15, N1 + 2.0, X.hpl, { collision: true });
      B(b - 0.17, yc - 0.012, b, yc + 0.012, N1 + 0.15, N1 + 2.0, X.hpl, { collision: true });
      const pg = new THREE.Group(); pg.position.set(a + 0.1, N1 + 0.15, -yc); groupe.add(pg);
      maille(boiteM(larg - 0.27, 1.85, 0.024), X.hpl, (larg - 0.27) / 2, 0.925, 0, 0, pg);
      maille(boiteM(0.03, 0.12, 0.04), M.inox, larg - 0.33, 0.95, 0, 0, pg, { ombre: false });
      const angle = k === 0 ? 1.55 : 0;
      pg.rotation.y = angle;                         // (la première ouverte : on peut y entrer)
      pg.updateMatrixWorld(true);
      const bb = new THREE.Box3().setFromObject(pg);
      if (angle) C.ajouterBoiteOrientee((bb.min.x + bb.max.x) / 2, (bb.min.z + bb.max.z) / 2, (larg - 0.27) / 2, 0.02, -angle, { y0: N1 + 0.15, y1: N1 + 2.0 });
      else C.ajouterBoite(a + 0.1, -yc + 0.02, b - 0.17, -yc - 0.02, { y0: N1 + 0.15, y1: N1 + 2.0 });
      // la cuvette suspendue et son bâti, le dérouleur
      const w = new THREE.Group(); w.position.set((a + b) / 2, N1, -(ym - 0.02)); groupe.add(w);
      maille(boiteM(larg - 0.06, 1.1, 0.2), X.faience, 0, 0.55, 0.1, 0, w);
      const cuv = maille(new THREE.CylinderGeometry(0.19, 0.15, 0.32, 20), X.ceramique, 0, 0.32, 0.4, 0, w); cuv.scale.z = 1.45;
      maille(new THREE.TorusGeometry(0.165, 0.025, 8, 24), X.ceramique, 0, 0.49, 0.42, 0, w).rotation.x = Math.PI / 2;
      maille(boiteM(0.18, 0.11, 0.01), M.inox, 0, 0.98, 0.205, 0, w, { ombre: false });
      maille(new THREE.CylinderGeometry(0.055, 0.055, 0.1, 14), M.inox, larg / 2 - 0.12, 0.75, 0.3, 0, w).rotation.z = Math.PI / 2;
      C.ajouterBoite((a + b) / 2 - 0.2, -(ym - 0.22), (a + b) / 2 + 0.2, -(ym - 0.72), { y0: N1, y1: N1 + 0.5 });
    }
    // les lavabos : un plan de stratifié contre le mur est, deux vasques, deux mitigeurs, le miroir (à l'ouest, le
    // passage depuis la porte reste libre)
    B(x1 - 0.5, 9.4, x1, 10.8, N1 + 0.82, N1 + 0.86, X.blancTable, { collision: true });
    B(x1 - 0.5, 9.4, x1, 10.8, N1 + 0.66, N1 + 0.82, X.hpl);
    C.ajouterBoite(x1 - 0.52, -9.4, x1, -10.8, { y0: N1 + 0.5, y1: N1 + 0.9 });
    for (const y of [9.75, 10.45]) {
      const v = maille(new THREE.CylinderGeometry(0.17, 0.12, 0.08, 24), X.ceramique, x1 - 0.27, N1 + 0.87, -y, 0, groupe); v.scale.z = 0.8;
      maille(new THREE.CylinderGeometry(0.012, 0.012, 0.18, 10), M.inox, x1 - 0.07, N1 + 0.95, -y, 0, groupe);
      const bec = maille(new THREE.CylinderGeometry(0.01, 0.01, 0.13, 8), M.inox, x1 - 0.13, N1 + 1.035, -y, 0, groupe); bec.rotation.z = Math.PI / 2;
    }
    const miroir = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.9), X.miroir); miroir.position.set(x1 - 0.005, N1 + 1.55, -10.1); miroir.rotation.y = -Math.PI / 2; groupe.add(miroir);
    // le sèche-mains et le distributeur de savon, la poubelle (mur ouest)
    B(x0, 9.9, x0 + 0.1, 10.2, N1 + 1.05, N1 + 1.45, M.boitier);
    B(x1 - 0.08, 9.32, x1 - 0.005, 9.44, N1 + 1.0, N1 + 1.2, M.boitier, { ombre: false });
    maille(new THREE.CylinderGeometry(0.15, 0.13, 0.45, 16), M.inox, x0 + 0.2, N1 + 0.225, -10.7, 0, groupe);
    C.ajouterCercle(x0 + 0.2, -10.7, 0.16, { y0: N1, y1: N1 + 0.45 });
  }

  // =====================================================================
  //  L'ESPACE PAUSE (la porte 105, côté cour) — IMAGINÉ (09/10)
  // =====================================================================
  // Le panneau d'étage de la photo 28 annonce un « Espace pause » au 1er : le voici derrière la porte 105, ouverte. Rien
  // n'en est photographié ; il est fait dans le style de l'espace pause du sous-sol, filmé (la vidéo, 18,9 à 22,4 s) : le
  // grand grès beige, un mur VERT ANIS (à l'ouest, le dos des toilettes) et sa retombée blanche à 2,30 m, les mange-debout
  // noirs (colonne et embase de fonte contre le mur vert, un trépied au milieu), les tabourets Tolix verts et les
  // tabourets noirs à coque — on s'y assoit —, deux distributeurs (friandises, boissons chaudes) contre le mur est, la
  // poubelle bleue et le trombinoscope, la tablette haute, les affiches encadrées, l'affiche « 100 % », l'affiche
  // bordeaux au QR code ; plafond de dalles 60 x 60 à 2,55 m et plafonniers LED ronds. En plus de la vidéo (c'est un
  // sous-sol) : deux fenêtres sur la cour, en verre imprimé (on ne voit que le jour), au-dessus de la tablette.
  // La pièce : x 8,56-12,44, y 8,985-12,63 (le mur est en x 12,5, le mur nord dans le prolongement de celui des
  // toilettes).
  function amenagerEspacePause() {
    const x0 = 8.56, x1 = 12.44, y0 = Y_COUR + EP / 2, y1 = 12.63, HP = N1 + 2.55, Z = 'e1pause';
    const FEN = [9.75, 11.25], LF = 1.2, BAS = N1 + 1.15, HAUT = N1 + 2.3;
    // ---- les murs : le nord (les fenêtres sur cour), l'est ; plinthes grises (la vidéo) ----
    mur({ de: [x0, 12.69], a: [12.56, 12.69], mats: M.blanc, ouvertures: FEN.map((c) => ({ c, l: LF, bas: BAS, h: HAUT })) });
    mur({ de: [12.5, y0], a: [12.5, 12.75], mats: M.blanc });
    const plinthe = (xa, ya, xb, yb) => B(xa, ya, xb, yb, N1, N1 + 0.08, X.plintheGrise, { ombre: false });
    plinthe(x0, y0, x0 + 0.012, y1); plinthe(x1 - 0.012, y0, x1, y1); plinthe(x0, y1 - 0.012, x1, y1);
    plinthe(x0, y0, 9.08, y0 + 0.012); plinthe(10.12, y0, x1, y0 + 0.012);
    // ---- le sol : le grès, avec la lumière et l'ombre cuites du carrelage de l'étage (uv1 sur R1) ; le seuil inox ----
    {
      const xa = 8.5, ya = Y_COUR, xb = 12.5, yb = 12.69, W = R1.x1 - R1.x0, L = R1.y1 - R1.y0;
      const pos = [], nor = [], uv = [], uv1 = [];
      for (const [x, y] of [[xa, ya], [xb, ya], [xb, yb], [xa, yb]]) {
        pos.push(x, N1, -y); nor.push(0, 1, 0); uv.push(x - x0, y - y0); uv1.push((x - R1.x0) / W, (y - R1.y0) / L);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      g.setAttribute('uv1', new THREE.Float32BufferAttribute(uv1, 2));
      g.setIndex([0, 1, 2, 0, 2, 3]);
      const s = new THREE.Mesh(g, X.gresPause); s.receiveShadow = true; s.castShadow = false; s.name = 'grès de l\'espace pause';
      s.userData.solEtage = true; groupe.add(s);
    }
    B(9.1, Y_COUR - 0.03, 10.1, Y_COUR + 0.05, N1, N1 + 0.005, M.inox, { ombre: false });
    // (pour la caméra seule, le dessous du plancher)
    C.ajouterBoite(8.5, -Y_COUR, 12.56, -12.75, { y0: N1 - 0.32, y1: N1 - 0.02, joueur: false });
    // ---- le plafond de dalles, la retombée blanche le long du mur vert, les plafonniers LED ronds ----
    ch.plafond(x0, y0, x1, y1, HP, 'dalles');
    B(x0, y0, x0 + 0.3, y1, N1 + 2.3, HP, M.platre, { ombre: false });
    C.plafond(x0, -y1, x0 + 0.3, -y0, N1 + 2.3);
    const led = (x, y) => {
      maille(new THREE.CylinderGeometry(0.168, 0.168, 0.012, 36), M.couronne, x, HP - 0.006, -y, 0, groupe, { ombre: false, recoit: false });
      const d = maille(new THREE.CircleGeometry(0.15, 36), M.spot, x, HP - 0.0125, -y, 0, groupe, { ombre: false, recoit: false });
      d.rotation.x = Math.PI / 2;
      ch.halo(x, y, HP, 1.3);
      const L = { x, z: -y, h: HP, zone: Z, type: 'spot', base: N1, cuire: false };
      ch.lampes.push(L); lampes.push(L);
    };
    for (const x of [9.6, 11.4]) for (const y of [9.95, 11.65]) led(x, y);
    // ---- LES FENÊTRES SUR COUR : menuiserie blanche à deux vantaux dans l'épaisseur du mur, verre imprimé allumé du
    // jour, la tablette, la poignée ; le jour cuit au sol (une nappe par fenêtre) et un spot de jour dehors ----
    const matVoile = new THREE.MeshBasicMaterial({ map: texVoileCour(), color: new THREE.Color(1.12, 1.12, 1.12) });
    matVoile.name = 'verre imprimé sur la cour';
    for (const c of FEN) {
      const xa = c - LF / 2, xb = c + LF / 2, k = 0.055, ya = 12.665, yb = 12.725;
      B(xa, ya, xb, yb, BAS, BAS + k, M.alu); B(xa, ya, xb, yb, HAUT - k, HAUT, M.alu);
      B(xa, ya, xa + k, yb, BAS, HAUT, M.alu); B(xb - k, ya, xb, yb, BAS, HAUT, M.alu);
      B(c - 0.035, ya, c + 0.035, yb, BAS, HAUT, M.alu);
      const v = new THREE.Mesh(new THREE.PlaneGeometry(LF - 2 * k, HAUT - BAS - 2 * k), matVoile);
      v.position.set(c, (BAS + HAUT) / 2, -12.695); v.castShadow = false; groupe.add(v);
      B(c + 0.035, 12.645, c + 0.05, 12.665, BAS + 0.48, BAS + 0.64, M.inox, { ombre: false });
      B(xa - 0.04, 12.6, xb + 0.04, 12.665, BAS - 0.025, BAS, M.blanc, { ombre: false });
      C.ajouterBoite(xa, -12.63, xb, -12.75, { y0: BAS, y1: HAUT, vitre: true });
      const J = { type: 'jour', x: c, z: -13.65, h: N1 + 2.4, sx: c, sz: -12.18, ox: c, oz: -12.85, zone: Z, reel: false, cuire: false, base: N1, cuireForce: 0.7 };
      ch.lampes.push(J); lampes.push(J);
    }
    ch.lampes.push({ type: 'jour', x: 10.5, z: -13.9, h: N1 + 2.6, cx: 10.5, cz: -10.8, zone: Z, base: N1, cuire: false, poids: 1.4 });

    // ---- LE MOBILIER ----
    // une tige d'acier d'un point à un autre (dans le repère d'un groupe) : pieds évasés, entretoises
    const _y = new THREE.Vector3(0, 1, 0), _d = new THREE.Vector3();
    const tige = (g, mat, a, b, r) => {
      _d.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
      const t = maille(new THREE.CylinderGeometry(r, r, _d.length(), 8), mat, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2, 0, g);
      t.quaternion.setFromUnitVectors(_y, _d.normalize());
      return t;
    };
    // LE MANGE-DEBOUT (1,05 m) : plateau rond noir, colonne et embase de fonte, ou trois pieds écartés
    const mangeDebout = (x, y, { d = 0.6, trepied = false } = {}) => {
      const g = new THREE.Group(); g.position.set(x, N1, -y); groupe.add(g);
      maille(new THREE.CylinderGeometry(d / 2, d / 2, 0.025, 40), X.plateauNoir, 0, 1.038, 0, 0, g);
      maille(new THREE.CylinderGeometry(0.09, 0.09, 0.02, 16), X.noirMat, 0, 1.016, 0, 0, g, { ombre: false });
      if (trepied) {
        maille(new THREE.CylinderGeometry(0.022, 0.022, 0.5, 10), X.noirMat, 0, 0.77, 0, 0, g);
        for (let k = 0; k < 3; k++) {
          const a = k * Math.PI * 2 / 3 + 0.4;
          tige(g, X.noirMat, [0, 0.54, 0], [Math.cos(a) * 0.3, 0.01, Math.sin(a) * 0.3], 0.014);
        }
      } else {
        maille(new THREE.CylinderGeometry(0.03, 0.03, 1.0, 12), X.noirMat, 0, 0.52, 0, 0, g);
        maille(new THREE.CylinderGeometry(0.2, 0.22, 0.035, 32), X.noirMat, 0, 0.0175, 0, 0, g);
      }
      C.ajouterCercle(x, -y, d / 2, { y0: N1, y1: N1 + 1.06 });
    };
    // LE TABOURET TOLIX (acier laqué, quatre pieds évasés, l'assise carrée percée d'un rond, les entretoises qui font
    // repose-pieds) : assise à 76 cm. `dir` : où regarde qui s'y assied ; `sortie` : où il se relève (en plan)
    const siegeHaut = (g, x, y, dir, h, sortie, nom) => {
      const [fx, fz] = DIR[dir];
      C.ajouterCercle(g.position.x, g.position.z, 0.21, { y0: N1, y1: N1 + h + 0.03 });
      const s = sortie || [x - fx * 0.62, y + fz * 0.62];
      sieges.push({ x: g.position.x + fx * 0.04, z: g.position.z + fz * 0.04, y: h + 0.01, fx, fz, sx: s[0], sz: -s[1], nom, sol: N1 });
    };
    const tolix = (x, y, dir, { mat = X.tolixVert, sortie = null } = {}) => {
      const [fx, fz] = DIR[dir], h = 0.76, a = 0.165, b = 0.225;
      const g = new THREE.Group(); g.position.set(x, N1, -y); g.rotation.y = Math.atan2(fx, fz); groupe.add(g);
      maille(boiteM(0.35, 0.018, 0.35), mat, 0, h - 0.009, 0, 0, g);
      for (const [sx, sz, w, p] of [[0, a, 0.33, 0.01], [0, -a, 0.33, 0.01], [a, 0, 0.01, 0.33], [-a, 0, 0.01, 0.33]]) maille(boiteM(w, 0.045, p), mat, sx, h - 0.04, sz, 0, g);
      const trou = maille(new THREE.CircleGeometry(0.035, 16), X.noirMat, 0, h + 0.0005, 0, 0, g, { ombre: false }); trou.rotation.x = -Math.PI / 2;
      for (const [px, pz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) tige(g, mat, [px * a, h - 0.03, pz * a], [px * b, 0, pz * b], 0.013);
      const hb = 0.3, e = a + (b - a) * (1 - hb / (h - 0.03));
      for (const [ax, az, bx, bz] of [[-e, e, e, e], [-e, -e, e, -e], [e, -e, e, e], [-e, -e, -e, e]]) tige(g, mat, [ax, hb, az], [bx, hb, bz], 0.007);
      siegeHaut(g, x, y, dir, h, sortie, 'le tabouret');
    };
    // LE TABOURET NOIR (la vidéo : une coque d'un seul tenant, l'assise relevée à l'arrière, quatre pieds obliques, la
    // barre repose-pieds) : assise à 78 cm
    const tabouretNoir = (x, y, dir, { sortie = null } = {}) => {
      const [fx, fz] = DIR[dir], h = 0.78;
      const g = new THREE.Group(); g.position.set(x, N1, -y); g.rotation.y = Math.atan2(fx, fz); groupe.add(g);
      maille(geoPlaque(0.42, 0.33, 0.03, 0.09), X.noirMat, 0, h - 0.015, 0.01, 0, g);
      const dos = maille(geoPlaque(0.4, 0.1, 0.025, 0.04), X.noirMat, 0, h + 0.035, -0.16, 0, g); dos.rotation.x = 1.2;
      for (const [px, pz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) tige(g, X.noirMat, [px * 0.13, h - 0.03, pz * 0.11], [px * 0.2, 0, pz * 0.19], 0.016);
      tige(g, X.noirMat, [-0.165, 0.3, 0.147], [0.165, 0.3, 0.147], 0.01);
      for (const s of [-1, 1]) tige(g, X.noirMat, [s * 0.165, 0.3, 0.147], [s * 0.165, 0.3, -0.147], 0.01);
      siegeHaut(g, x, y, dir, h, sortie, 'le tabouret');
    };
    // contre le mur vert : deux mange-debout à colonne, les tabourets rangés entre eux, dos au mur
    mangeDebout(9.0, 10.05); mangeDebout(9.0, 11.25);
    tabouretNoir(8.84, 9.45, 'E', { sortie: [9.5, 9.4] });
    tolix(8.84, 10.65, 'E', { sortie: [9.5, 10.65] });
    // au milieu, le trépied et son tabouret (65 cm au moins de chaque côté : le passage vers les distributeurs et vers
    // la tablette ; plus étroit, Haythem s'y coincerait). (09/10, relecture : le tabouret de côté, tourné vers les
    // fenêtres — face au trépied, à 51 cm, les pieds de qui s'y assied tombaient dans le moyeu, au travers des pieds)
    mangeDebout(10.69, 10.5, { trepied: true });
    tolix(10.18, 10.5, 'N');
    // LA TABLETTE HAUTE (la vidéo : stratifié gris clair sur pieds d'acier gris, 1,05 m) sous les fenêtres, trois
    // tabourets tournés vers la cour
    const ty0 = 12.23;
    B(8.95, ty0, 12.0, y1, N1 + 1.02, N1 + 1.05, X.stratifieGris);
    // (09/10, relecture : deux pieds, aux bouts ; entre les tabourets, deux consoles vissées au mur et leurs jambes de
    // force — un pied en x 10,475 passait au travers des tibias de qui s'assied sur le tabouret du milieu, et une console
    // au même endroit lui passait entre les genoux)
    for (const x of [9.0, 11.95]) B(x - 0.02, ty0 + 0.04, x + 0.02, ty0 + 0.08, N1, N1 + 1.02, X.acierGris);
    for (const x of [9.9, 11.0]) tige(groupe, X.acierGris, [x, N1 + 0.62, -(y1 - 0.005)], [x, N1 + 0.97, -(ty0 + 0.1)], 0.012);
    for (const x of [9.0, 9.9, 11.0, 11.95]) B(x - 0.02, ty0 + 0.04, x + 0.02, y1, N1 + 0.97, N1 + 1.02, X.acierGris, { ombre: false });
    C.ajouterBoite(8.95, -ty0, 12.0, -y1, { y0: N1, y1: N1 + 1.06 });
    tabouretNoir(9.35, 11.88, 'N', { sortie: [9.65, 11.2] }); tolix(10.45, 11.88, 'N'); tabouretNoir(11.55, 11.88, 'N');
    // LES DISTRIBUTEURS contre le mur est (0,85 x 0,80 x 1,83) : friandises, boissons chaudes ; leur façade éclaire
    const faceLumineuse = (tex, k) => new THREE.MeshStandardMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: k, roughness: 0.22, metalness: 0.1 });
    for (const [y, tex, k] of [[9.65, texFriandises(), 0.55], [10.55, texCafe(), 0.4]]) {
      const xa = x1 - 0.8;
      B(xa, y - 0.42, x1 - 0.02, y + 0.42, N1 + 0.03, N1 + 1.83, X.caisse, { collision: true });
      for (const s of [-1, 1]) {
        B(xa + 0.05, y + s * 0.36 - 0.03, xa + 0.12, y + s * 0.36 + 0.03, N1, N1 + 0.03, M.noirMat, { ombre: false });
        B(xa - 0.004, y + s * 0.415 - 0.01, xa + 0.06, y + s * 0.415 + 0.01, N1 + 0.03, N1 + 1.835, X.acierGris, { ombre: false });   // (les montants gris)
      }
      panneau(faceLumineuse(tex, k), 0.84, 1.78, xa - 0.003, y, N1 + 0.93, 'W');
    }
    // la poubelle bleue, le trombinoscope au-dessus
    B(12.02, 11.25, 12.42, 11.65, N1, N1 + 0.6, X.bleuMarine, { collision: true });
    B(12.0, 11.23, 12.43, 11.67, N1 + 0.6, N1 + 0.64, X.bleuMarine);
    B(12.1, 11.35, 12.33, 11.55, N1 + 0.64, N1 + 0.642, M.noirMat, { ombre: false });
    // (09/10, relecture : à la taille de la vidéo, 0,66 x 0,88 cadre compris, plus haut et plus au nord — plus petit et
    // plus bas, depuis la porte, seul son bandeau dépassait du distributeur, comme une étiquette posée dessus)
    B(x1 - 0.015, 11.29, x1, 11.95, N1 + 1.33, N1 + 2.21, M.aluGris, { ombre: false });
    panneau(new THREE.MeshStandardMaterial({ map: texTrombi(), roughness: 0.5 }), 0.6, 0.825, x1 - 0.016, 11.62, N1 + 1.77, 'W');
    // les affiches encadrées du mur vert, au-dessus des mange-debout
    for (const [y, n] of [[10.05, 1], [11.25, 2]]) {
      B(x0, y - 0.2, x0 + 0.015, y + 0.2, N1 + 1.45, N1 + 1.98, M.noirMat, { ombre: false });
      panneau(new THREE.MeshStandardMaterial({ map: texCadre(n), roughness: 0.3 }), 0.37, 0.49, x0 + 0.016, y, N1 + 1.715, 'E');
    }
    // le mur de la porte : l'affiche bordeaux et son QR à l'ouest, l'affiche « 100 % » à l'est (après le vantail)
    panneau(new THREE.MeshStandardMaterial({ map: texAfficheQR(), roughness: 0.6 }), 0.26, 0.37, 8.83, y0 + 0.003, N1 + 1.5, 'N');
    panneau(new THREE.MeshStandardMaterial({ map: texCent(), roughness: 0.6 }), 0.3, 0.42, 11.33, y0 + 0.003, N1 + 1.45, 'N');
  }

  // =====================================================================
  //  LE COULOIR ET LE PALIER D'ÉTAGE
  // =====================================================================
  function garnirCouloir() {
    // le panneau de l'étage sur le mur safran, en face de l'escalier (09/10 : celui de la photo 28, 65 x 34 cm, centré à
    // 1,60 m, et à sa droite, comme là-bas, l'affichette « WIFI IRIS » et l'affiche « POINT ÉCOUTE ») ; le plan
    // d'évacuation, l'extincteur
    B(1.75, 10.27, 1.765, 10.93, N1 + 1.425, N1 + 1.775, M.noirMat, { ombre: false });
    panneau(new THREE.MeshStandardMaterial({ map: texPanneauEtage(), roughness: 0.55 }), 0.65, 0.34, 1.766, 10.6, N1 + 1.6, 'E');
    panneau(new THREE.MeshStandardMaterial({ map: texWifi(), roughness: 0.5 }), 0.27, 0.2, 1.756, 11.2, N1 + 1.585, 'E');
    panneau(new THREE.MeshStandardMaterial({ map: texPointEcoute(), roughness: 0.7 }), 0.21, 0.297, 1.756, 11.46, N1 + 1.615, 'E');
    panneau(new THREE.MeshStandardMaterial({ map: texConsignes(), roughness: 0.5 }), 0.45, 0.62, 1.757, 9.45, N1 + 1.6, 'E');
    extincteur(4.6, 11.2, 'W');
    // le bloc de sortie au-dessus de la porte de l'escalier, côté étage
    ch.sortie(3.5, 12.4, N1 + 2.32, 'S');
    // les plaques des portes (09/10 : celles des salles nommées au format de la photo 23, côté serrure)
    plaqueSalle('Salle', 'de cours', 'B 1.1', 6.45, Y_SALLES + EP / 2 + 0.003, 'N');
    plaqueSalle('Salle', 'Robert Kahn', 'B 1.4', 11.6, Y_SALLES + EP / 2 + 0.003, 'N');
    plaque('103', 'Pédagogie', 14.62, Y_SALLES + EP / 2 + 0.003, 'N');
    plaque('104', 'Enseignants', 17.82, Y_SALLES + EP / 2 + 0.003, 'N');
    plaqueSalle('Espace', 'pause', null, 8.84, Y_COUR - EP / 2 - 0.003, 'S', 'tasse');
    plaque('106', 'Salle de cours', 14.07, Y_COUR - EP / 2 - 0.003, 'S');
    plaque('107', 'Archives', 16.9, Y_COUR - EP / 2 - 0.003, 'S');
    panneau(new THREE.MeshStandardMaterial({ map: texPlaqueWC(), roughness: 0.4 }), 0.16, 0.2, 6.05, Y_COUR - EP / 2 - 0.003, N1 + 1.6, 'S');
    // le tableau de liège (cadre d'aluminium) et les affiches entre les portes côté cour
    B(11.0, Y_COUR - EP / 2 - 0.02, 12.82, Y_COUR - EP / 2, N1 + 0.98, N1 + 1.92, M.aluGris);
    panneau(X.liege, 1.78, 0.9, 11.91, Y_COUR - EP / 2 - 0.021, N1 + 1.45, 'S');
    affiche('#f2b705', '#1d1d1d', 70, 0.5, 0.7, 7.4, Y_COUR - EP / 2 - 0.003, 1.55, 'S');
    affiche('#2f6fb0', '#fbfbf8', 71, 0.5, 0.7, 15.6, Y_COUR - EP / 2 - 0.003, 1.55, 'S');
    affiche('#d6542b', '#fbfbf8', 72, 0.42, 0.6, 8.9, Y_SALLES + EP / 2 + 0.003, 1.55, 'N');
    // la fontaine à eau près des toilettes (colonne blanche, bonbonne bleue)
    B(7.9, Y_COUR - EP / 2 - 0.34, 8.22, Y_COUR - EP / 2 - 0.02, N1, N1 + 1.0, M.boitier, { collision: true });
    const bon = maille(new THREE.CylinderGeometry(0.13, 0.13, 0.42, 20), X.eau, 8.06, N1 + 1.22, -(Y_COUR - EP / 2 - 0.18), 0, groupe); bon.castShadow = false;
    B(7.98, Y_COUR - EP / 2 - 0.36, 8.14, Y_COUR - EP / 2 - 0.34, N1 + 0.78, N1 + 0.86, M.inox, { ombre: false });
    // le banc du palier d'étage (lattes de chêne sur deux piètements), où l'on attend le cours
    const xb0 = 4.07, xb1 = 4.55, yb0 = 9.25, yb1 = 10.75;
    for (let k = 0; k < 4; k++) B(xb0 + 0.02 + k * 0.115, yb0, xb0 + 0.11 + k * 0.115, yb1, N1 + 0.42, N1 + 0.45, X.chene);
    for (const y of [yb0 + 0.12, yb1 - 0.12]) B(xb0 + 0.03, y - 0.02, xb1 - 0.03, y + 0.02, N1, N1 + 0.42, X.anthracite);
    C.ajouterBoite(xb0, -yb0, xb1, -yb1, { y0: N1, y1: N1 + 0.47 });
    for (const y of [9.6, 10.4]) sieges.push({ x: (xb0 + xb1) / 2, z: -y, y: 0.45, fx: -1, fz: 0, sx: xb0 - 0.5, sz: -y, nom: 'le banc', sol: N1 });
    // les radiateurs du couloir, l'horloge
    radiateur(19.0, Y_SALLES + EP / 2, 'N', 0.8);
    horloge(10.2, Y_SALLES + EP / 2, N1 + 2.2, 'N');
  }

  // =====================================================================
  //  LA CONSTRUCTION (les outils du chantier posent dans le groupe de l'étage le temps du crochet)
  // =====================================================================
  try {
    construireFacade1();
    construireMurs();
    construireSols();
    construirePlafondsEtLumieres();
    construireEscalier2();
    meublerSalle101();
    meublerSalle102();
    meublerBureau103();
    meublerSalle104();
    construireToilettes();
    amenagerEspacePause();
    garnirCouloir();
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
  // (le grès de l'espace pause reçoit la même lumière et la même ombre cuites que le carrelage : uv1 sur R1)
  X.gresPause.lightMap = lm; X.gresPause.lightMapIntensity = 0.95;
  if (matSol.aoMap) { X.gresPause.aoMap = matSol.aoMap; X.gresPause.aoMapIntensity = matSol.aoMapIntensity; }
  X.gresPause.needsUpdate = true;
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
  const zones = [
    { id: 'e1hall', rects: [zr(1.6, Y_COUR, 4.75, 12.6)], voisines: ['palier1', 'e1couloir'], env: env(3.9, 8.3) },
    { id: 'e1couloir', rects: [zr(1.6, Y_SALLES, 20.0, Y_COUR)], voisines: ['e1hall', 'e101', 'e102', 'e103', 'e104', 'e1wc', 'e1pause'], env: env(10.6, 7.95) },
    { id: 'e101', rects: [zr(-0.3, -0.2, 6.6, Y_SALLES)], voisines: ['e1couloir'], env: env(3.3, 3.6) },
    { id: 'e102', rects: [zr(6.6, -0.2, 13.2, Y_SALLES)], voisines: ['e1couloir'], env: env(9.9, 3.6) },
    { id: 'e103', rects: [zr(13.2, -0.2, 16.5, Y_SALLES)], voisines: ['e1couloir'], env: env(14.85, 3.6) },
    { id: 'e104', rects: [zr(16.5, -0.2, 20.0, Y_SALLES)], voisines: ['e1couloir'], env: env(18.15, 3.6) },
    { id: 'e1wc', rects: [zr(4.75, Y_COUR, 8.6, 12.8)], voisines: ['e1couloir'], env: env(6.6, 10.2) },
    { id: 'e1pause', rects: [zr(8.6, Y_COUR, 12.5, 12.75)], voisines: ['e1couloir'], env: env(10.5, 10.9) },
  ];

  // =====================================================================
  //  L'ÉTAGE VIVANT (js/carte_ecole.js maj, à chaque image)
  // =====================================================================
  let tous = null, niveau = -1, haut = false;
  const maj = (dt, jeu) => {
    const u = jeu.user.pos, cam = jeu.camera.position;
    // VISIBLE quand la caméra peut le voir : dans la cage, au-dessus des plafonds du rez-de-chaussée, ou dehors
    const cage = cam.x > 1.4 && cam.x < 5.0 && cam.z < -12.2 && cam.z > -19.0;
    const vis = cage || cam.y > 2.7 || cam.z > -0.05 || u.y > 2.0;
    if (vis !== groupe.visible) groupe.visible = vis;
    // SON OMBRE quand Haythem y est (au-delà de la moitié de la volée 2 ; il redescend sous 2 m) — reposée à chaque
    // image : le cache de l'ombre du décor (js/ombre_cache.js) rallume ce qu'il a éteint le temps d'un rendu
    if (u.y > 2.5) haut = true; else if (u.y < 2.0) haut = false;
    for (const o of ombrants) o.castShadow = haut;
    // LES SIÈGES de son étage seulement (la liste est celle du jeu, js/game.js : on la remplit sur place)
    if (!tous) tous = ch.sieges.slice();
    const n = u.y > 2.0 ? 1 : 0;
    if (n !== niveau) {
      niveau = n;
      ch.sieges.length = 0;
      for (const s of tous) if (((s.sol || 0) > 2) === (n === 1)) ch.sieges.push(s);
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
