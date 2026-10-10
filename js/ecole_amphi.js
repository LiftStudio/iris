// =====================================================================
//  LA GRANDE SALLE DE COURS DU -1, « S -1.14 » (crochet de js/ecole_soussol.js)
// =====================================================================
// RELEVÉ D'APRÈS LA VIDÉO OFFICIELLE DE VISITE (2021 : references/ecole/visite_officielle/visite.mp4, de 26,7 à 33,9 s,
// VO q_0108 à q_0136 ; les 275 images à 25 i/s de 23,5 à 34,5 s ; relevé scratchpad iris_visite/amphi.md ; 10/10).
// On entre par la porte nord-est du mur vert de l'espace pause (VO q_0103-q_0107 : fixe dépoli à l'ouest, vantail dépoli
// à l'est, ouvert à 90° contre le mur du vestibule) ; la caméra remonte l'allée vers le tableau, fait un tour de 200° vers
// la gauche (tableau, mur ouest, porte verte, mur du fond) et ressort par la même porte. Le panneau du palier du -1
// (VO q_0066) la nomme : « Salle de cours S -1.14 ».
//   PAS DE GRADINS : une grande salle à SOL PLAT, de longues tables filantes de hêtre (tronçons de trois places, voile
// de fond côté tableau, pieds d'acier noir), des fauteuils coque de bois moulé JAUNE MOUTARDE à assise rabattable
// (relevée), fixés derrière chaque table ; 8 rangs à l'ouest, 6 à l'est, une allée de 1,30 m dans l'axe de la porte
// (VO f_0082, f_0101 : les comptes des rangs et de l'allée sont sûrs, les places par rang à ± 1). Au nord, le mur du
// tableau : meuble multimédia et chaise seule, un 2e portrait, le TABLEAU TRIPTYQUE sous le carter de l'écran et ses deux
// enceintes, le PORTRAIT D'EINSTEIN, deux interrupteurs, un convecteur, la goulotte noire au pied (VO f_0082 à f_0170).
// À l'ouest, un mur nu, son bandeau de deux grilles de ventilation et un convecteur (f_0170-f_0188) ; le POTEAU carré
// et la RETOMBÉE de poutre qui file vers l'est (f_0188-f_0200). Au sud, l'envers du mur vert : la PORTE VERTE (issue de
// secours, bloc de sortie au-dessus, une A4 scotchée), le dernier rang adossé, deux interrupteurs (f_0200-f_0230). Un
// faux plafond de dalles 60 x 60 à 2,70 m, une vingtaine de luminaires à grille en lumière CHAUDE (des tubes fluo : la
// vidéo est orangée ici, blanche dans l'espace pause), aucune fenêtre (on est sous la cour).
//   Le mur du vestibule (x 10,3) borde l'ENCOCHE sud-est (le bloc des toilettes, derrière le sas de 2026) : fermée, son
// dedans n'est pas modélisé. Le mur est n'est jamais vu en entier : nu, sous un bandeau, et le mur du tableau y fait un
// retour (une arête passé le convecteur). L'état de 2026 de la salle n'est pas connu (aucune photo de Haythem) : tout
// vient de 2021.
//   PLAN V2 (11/10, scratchpad iris_audit/plan_v2.md § 1.2, § 2.1, § 2.3 ; retour de Haythem du 10/10 : « la porte n'est
// pas aussi loin ») : la porte grise du hall ouest recule de 4,09 m, et avec elle tout l'ouest du -1 — la salle, derrière
// le mur vert de l'espace pause, recule de DY_SS, sans rien changer à son dedans. Elle RENTRE ainsi DANS LA PARCELLE (le
// gabarit IGN, mesure/gabarit_reel.md : le fond du bâtiment est en y 23,7, et à l'est, x 13,3 pour y < 16,4) : son mur du
// tableau passe de y 25,5 à 21,41 ; son mur est, ramené de x 15,2 à x 13,3, coupe le bloc est, dont les rangs s'arrêtent
// en x 13,1 — cinq places au lieu de sept. 97 fauteuils et la chaise seule : 98 places.
//   RELECTURE DU 10/10 (captures du jeu aux points de vue de f_0060, f_0082, f_0143, f_0160, f_0185, f_0200, f_0228,
// f_0250, côte à côte) : les fauteuils vus de face (écu, assise relevée à fente noire, lisse murale du dernier rang), leur
// ocre ramené à la vidéo, les blancs du -1 au lieu d'un blanc teinté, le 2e portrait en gris doux, le poteau lisible, la
// porte d'entrée à vrais vitrages dépolis (on devine la salle de la pause, la pause de la salle), et la salle sans
// voisine (les spots, sans ombre, éclairaient la pause au travers du mur vert, et inversement).
//
// LE PLAN (repère de js/carte_ecole.js : x le long de la façade, y vers le fond ; X = x, Z = -y ; sol à Y_SS = -3,06) :
//   la salle            x 2,55-13,3   y 11,86-21,41  moins l'encoche x 10,3-13,3 y 11,86-13,785 ; plafond à 2,70 m
//   la porte d'entrée   x 8,85-10,25 (mur vert y 11,785) : fixe x 8,85-9,35, vantail x 9,35-10,25 (gonds à l'est)
//   la porte verte      x 3,93-5,47 : vantail (gonds à l'ouest) x 3,93-4,85, fixe x 4,85-5,47 — fermée
//   les rangs           chant avant (nord) des tables en y 19,46 - 0,95 (k - 1), k = 1 … 8 ; plateau de 0,42, sièges au sud
//   bloc ouest          x 3,3-9,0 (rangs 1-6 : 9 places ; 7 : 8 places, au-delà du poteau ; 8 : x 5,6-9,0, 5 places)
//   bloc est            x 10,3-13,1 (rangs 1-6 : 5 places) ; allée x 9,0-10,3
//   le poteau           x 3,25-3,60 y 13,41-13,76 ; la retombée y 13,46-13,76 sous 2,40, du mur ouest au vestibule
//
//   poserAmphi(ch, K) -> { sols, zone, maj(dt, jeu) }
//     K : les outils du sous-sol (js/ecole_soussol.js : B, mur, plinthe, panneau, siege, solNiveau, lampes, X, Y_SS,
//         DALLE, H_RET) ; appelé pendant la construction du -1 (ch.decor = son décor fixe, ch.portes.decor = son groupe)
import * as THREE from 'three';
import { maille, boiteM } from './ecole_portes.js';
import { canvasTex, normalesDepuisGrille, avecRelief } from './kit_decor.js';
import { texAffiche } from './ecole_matieres.js';
import { TELEPHONE } from './appareil.js';

// ---- le décalage du plan V2 ----
// DY_SS : le recul de TOUT L'OUEST DU -1 (scratchpad iris_audit/plan_v2.md § 1.2 et § 2.1 : la porte grise du hall
// ouest passe de c 9,575 à c 5,485 ; la volée, le hall du -1, le couloir, l'espace pause et cette salle la suivent).
// Nommé ici, le module évalué le premier (js/ecole_soussol.js l'importe).
export const DY_SS = -4.09;
// ---- la salle ----
// (plan V2 : y 15,95-25,5 -> 11,86-21,41, et le mur est de x 15,2 à x 13,3 — dans le gabarit IGN)
export const AMPHI = { x0: 2.55, x1: 13.3, y0: 15.95 + DY_SS, y1: 25.5 + DY_SS, xE: 10.3, yE: 17.875 + DY_SS, h: 2.70 };
// L'EMPRISE (murs compris) : la dalle du -1 dessous, et au-dessus les dalles à 0 (le joueur du rez-de-chaussée — salle
// David Clark, C01, locaux du fond — ne doit pas tomber dedans), la boîte de la caméra sous la dalle, la dalle-boîte
// d'ombre
export const EMPRISE_AMPHI = [2.4, 11.7, 13.45, 21.6];
const RANG1 = 23.55 + DY_SS, PAS_RANG = 0.95, PROF_TABLE = 0.42;     // le chant avant du rang 1 (19,46), le pas, le plateau
const ya = (k) => RANG1 - (k - 1) * PAS_RANG;                 // le chant avant (nord) de la table du rang k
const X_ALLEE = 9.65;                                         // l'axe de l'allée (et de la porte)
// la lumière des luminaires à grille : des tubes fluorescents d'un blanc chaud (la vidéo est orangée dans la salle,
// d'un blanc neutre dans l'espace pause et ses LED) ; les blancs de la salle (murs, dalles) sont ceux du -1 (relecture
// du 10/10 : teintés « tièdes » en plus, ils sortaient plus orangés que la vidéo — mesuré sur f_0143, f_0228 : bleu sur
// rouge 0,81 au mur contre 0,88 ; c'est la lumière qui chauffe, pas la peinture)
const CHAUD_AMPHI = new THREE.Color(0xffe2bc);

// =====================================================================
//  LES TEXTURES (dessinées : la salle n'ajoute aucun fichier à charger)
// =====================================================================
const rgb = (r, g, b, a = 1) => `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a})`;
function graine(s) {
  let x = s >>> 0 || 1;
  return () => { x ^= x << 13; x >>>= 0; x ^= x >> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; };
}
// LE SOL : des dalles de 50 cm gris moyen MOUCHETÉES (moquette en dalles ou vinyle, f_0082, f_0143 : plus foncé et plus
// froid que le carrelage beige de l'espace pause), joints presque invisibles. Tuile de dessin : 1 m, quatre dalles.
function texSolSalle() {
  const W = TELEPHONE ? 256 : 512;
  return canvasTex(W, W, (g, w, h) => {
    const r2 = graine(1140), c = w / 2;
    // (relecture du 10/10 : un gris un rien bleuté — sous la lumière chaude, l'ancien gris neutre sortait plus brun que
    // la vidéo, f_0143 : bleu sur rouge 0,82 contre 0,87)
    for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) {
      const t = (r2() - 0.5) * 7;
      g.fillStyle = rgb(117 + t, 118 + t, 124 + t); g.fillRect(a * c, b * c, c, c);
    }
    // le moucheté : des grains sombres et clairs, serrés
    for (let k = 0; k < w * h / 9; k++) {
      const v = r2() < 0.5 ? 86 + r2() * 22 : 138 + r2() * 22;
      g.fillStyle = rgb(v, v + 2, v + 6, 0.55); g.fillRect(r2() * w, r2() * h, 1 + r2() * 1.4, 1 + r2() * 1.4);
    }
    // les joints : un filet à peine plus sombre
    g.fillStyle = 'rgba(70,70,74,0.18)';
    for (let i = 0; i <= 2; i++) { g.fillRect(i * c - 0.6, 0, 1.2, h); g.fillRect(0, i * c - 0.6, w, 1.2); }
  }, [1, 1], false, 8);
}
let _normSol = null;
function normalesSol() {
  return _normSol || (_normSol = normalesDepuisGrille(128, 128, (g, w, h) => {
    const c = w / 2;
    for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) g.fillRect(a * c + 0.6, b * c + 0.6, c - 1.2, c - 1.2);
  }, 0.6, 0.8));
}
// LE STRATIFIÉ HÊTRE des tables (f_0082 : un hêtre clair, presque jaune sous la lumière chaude) : un fil long et fin.
// Tuile : 2 m x 0,5 m (u le long de la table)
function texHetre() {
  return canvasTex(512, 128, (g, w, h) => {
    const r2 = graine(2021);
    g.fillStyle = '#d8b67c'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 70; k++) {
      const y = r2() * h, a = 0.05 + r2() * 0.08, c = r2() < 0.5 ? [176, 140, 86] : [236, 214, 170];
      g.strokeStyle = rgb(c[0], c[1], c[2], a); g.lineWidth = 0.6 + r2() * 1.6;
      g.beginPath(); g.moveTo(0, y);
      for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * 0.01 + k) * 2.5);
      g.stroke();
    }
  }, [1 / 2, 1 / 0.5], false, 8);
}
// LE LUMINAIRE À GRILLE DE DÉFILEMENT de 60 x 60, vu de dessous, allumé (f_0175, f_0200 : quatre tubes, les lames en
// travers) ; les teintes tiennent compte du matériau sans éclairage (sa couleur multipliée par 1,75 : seuls les tubes
// passent le seuil du halo, la grille reste d'un gris d'aluminium)
function texLuminaire() {
  const W = TELEPHONE ? 128 : 256;
  return canvasTex(W, W, (g, w, h) => {
    const bord = w * 0.045, i0 = bord, L = w - 2 * bord;
    g.fillStyle = '#e9e8e4'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#5c5d60'; g.fillRect(i0, i0, L, L);
    for (let k = 0; k < 4; k++) {
      const cx = i0 + L * (k + 0.5) / 4, lg = L / 4;
      const gr = g.createLinearGradient(cx - lg / 2, 0, cx + lg / 2, 0);
      gr.addColorStop(0, 'rgba(150,146,138,1)'); gr.addColorStop(0.32, 'rgba(214,206,190,1)');
      gr.addColorStop(0.5, 'rgba(255,250,236,1)'); gr.addColorStop(0.68, 'rgba(214,206,190,1)'); gr.addColorStop(1, 'rgba(150,146,138,1)');
      g.fillStyle = gr; g.fillRect(cx - lg / 2, i0, lg, L);
      g.fillStyle = '#ffffff'; g.fillRect(cx - w * 0.022, i0, w * 0.044, L);
    }
    for (let k = 0; k <= 8; k++) {
      const y = i0 + L * k / 8;
      g.fillStyle = '#8c8d8f'; g.fillRect(i0, y - w * 0.012, L, w * 0.024);
      g.fillStyle = '#c4c4c1'; g.fillRect(i0, y - w * 0.003, L, w * 0.006);
    }
    g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = w * 0.006; g.strokeRect(i0, i0, L, L);
  }, null, false, 4);
}
// LE DIFFUSEUR D'AIR carré à fentes concentriques (≈ 0,4 x 0,4, amphi.md § 3.3 : un vers (11,5 ; 24,5))
function texDiffuseur() {
  return canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = '#e6e5e1'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 5; k++) {
      const m = 10 + k * 11;
      g.strokeStyle = '#7d7e80'; g.lineWidth = 3; g.strokeRect(m, m, w - 2 * m, h - 2 * m);
    }
    g.fillStyle = '#cfcecb'; g.fillRect(w / 2 - 8, h / 2 - 8, 16, 16);
  }, null, false, 2);
}
// LA GRILLE DE VENTILATION sombre du bandeau ouest (f_0175, f_0200 : 0,45 x 0,12, des lames horizontales)
function texGrilleVentil() {
  return canvasTex(128, 36, (g, w, h) => {
    g.fillStyle = '#4a4a4c'; g.fillRect(0, 0, w, h);
    for (let y = 5; y < h - 3; y += 5) { g.fillStyle = '#2a2a2b'; g.fillRect(4, y, w - 8, 2.5); g.fillStyle = '#6a6a6c'; g.fillRect(4, y + 2.5, w - 8, 0.8); }
    g.strokeStyle = '#5d5d5f'; g.lineWidth = 3; g.strokeRect(1.5, 1.5, w - 3, h - 3);
  }, null, false, 2);
}
// LE CONVECTEUR gris clair à lamelles verticales (f_0082 : à droite d'Einstein)
function texConvecteur() {
  return canvasTex(64, 128, (g, w, h) => {
    g.fillStyle = '#9d9d99'; g.fillRect(0, 0, w, h);
    for (let x = 6; x < w - 4; x += 5) { g.fillStyle = '#7b7b78'; g.fillRect(x, 10, 2, h - 20); g.fillStyle = '#b3b3af'; g.fillRect(x + 2, 10, 1, h - 20); }
    g.strokeStyle = '#8a8a86'; g.lineWidth = 3; g.strokeRect(1.5, 1.5, w - 3, h - 3);
  }, null, false, 2);
}
// LE PORTRAIT D'EINSTEIN (f_0082 à f_0143 : le portrait photographique noir et blanc, cheveux blancs en bataille, regard
// face à l'objectif, cadre noir mince) — redessiné ici en niveaux de gris, à la main : la silhouette du célèbre portrait,
// pas la photographie
function texEinstein() {
  return canvasTex(256, 384, (g, w, h) => {
    const r2 = graine(1879), cx = w / 2, cy = h * 0.42;
    const fond = g.createRadialGradient(cx, h * 0.38, 10, cx, h * 0.45, h * 0.75);
    fond.addColorStop(0, '#6e6e6e'); fond.addColorStop(1, '#262626');
    g.fillStyle = fond; g.fillRect(0, 0, w, h);
    // le veston sombre, le col de chemise
    g.fillStyle = '#1b1b1b'; g.beginPath(); g.moveTo(0, h); g.quadraticCurveTo(18, h * 0.74, cx, h * 0.7); g.quadraticCurveTo(w - 18, h * 0.74, w, h); g.fill();
    g.fillStyle = '#9a9a9a'; g.beginPath(); g.moveTo(cx - 30, h * 0.705); g.lineTo(cx - 4, h * 0.79); g.lineTo(cx + 4, h * 0.79); g.lineTo(cx + 30, h * 0.705); g.lineTo(cx + 14, h * 0.69); g.lineTo(cx - 14, h * 0.69); g.fill();
    // la chevelure blanche en bataille : un nuage flou, puis des mèches
    g.save(); g.filter = 'blur(6px)';
    const nuage = g.createRadialGradient(cx, cy - 34, 20, cx, cy - 20, 105);
    nuage.addColorStop(0, 'rgba(225,225,225,0.95)'); nuage.addColorStop(0.65, 'rgba(200,200,200,0.55)'); nuage.addColorStop(1, 'rgba(160,160,160,0)');
    g.fillStyle = nuage; g.beginPath(); g.ellipse(cx, cy - 22, 100, 92, 0, 0, Math.PI * 2); g.fill();
    g.restore();
    g.save(); g.filter = 'blur(0.8px)';
    for (let k = 0; k < 340; k++) {
      const a = Math.PI * (0.85 + r2() * 1.3), r0 = 48 + r2() * 18, r1 = r0 + 18 + r2() * 52, v = 205 + r2() * 50;
      g.strokeStyle = rgb(v, v, v, 0.35 + r2() * 0.3); g.lineWidth = 0.6 + r2() * 1.2;
      g.beginPath(); g.moveTo(cx + Math.cos(a) * r0, cy - 18 + Math.sin(a) * r0);
      const a2 = a + (r2() - 0.5) * 0.9;
      g.quadraticCurveTo(cx + Math.cos(a) * (r0 + r1) * 0.55, cy - 24 + Math.sin(a) * (r0 + r1) * 0.55, cx + Math.cos(a2) * r1, cy - 18 + Math.sin(a2) * r1);
      g.stroke();
    }
    g.restore();
    // le visage, modelé ; les orbites, l'ombre du nez, les plis des joues
    g.save(); g.filter = 'blur(2px)';
    const vis = g.createRadialGradient(cx - 10, cy - 6, 8, cx, cy + 4, 72);
    vis.addColorStop(0, '#d2d2d2'); vis.addColorStop(0.55, '#aaaaaa'); vis.addColorStop(1, '#5e5e5e');
    g.fillStyle = vis; g.beginPath(); g.ellipse(cx, cy + 8, 48, 64, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(40,40,40,0.55)';
    for (const sx of [-1, 1]) { g.beginPath(); g.ellipse(cx + sx * 19, cy + 4, 14, 9, 0, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = 'rgba(50,50,50,0.4)'; g.beginPath(); g.ellipse(cx + 5, cy + 26, 6, 16, 0.15, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(60,60,60,0.5)'; g.lineWidth = 3;
    for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(cx + sx * 14, cy + 34); g.quadraticCurveTo(cx + sx * 30, cy + 48, cx + sx * 26, cy + 64); g.stroke(); }
    g.restore();
    // le front ridé
    g.strokeStyle = 'rgba(70,70,70,0.45)'; g.lineWidth = 1.2;
    for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(cx - 28, cy - 30 + k * 6); g.quadraticCurveTo(cx, cy - 34 + k * 6, cx + 28, cy - 30 + k * 6); g.stroke(); }
    // les sourcils broussailleux, les yeux
    for (const sx of [-1, 1]) {
      const ex = cx + sx * 19, ey = cy + 4;
      g.save(); g.filter = 'blur(1px)'; g.fillStyle = 'rgba(215,215,215,0.9)'; g.beginPath(); g.ellipse(ex + sx * 2, ey - 12, 15, 4.5, sx * -0.2, 0, Math.PI * 2); g.fill(); g.restore();
      g.fillStyle = '#d9d9d9'; g.beginPath(); g.ellipse(ex, ey, 7.5, 4, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#202020'; g.beginPath(); g.arc(ex, ey, 3.6, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.9)'; g.fillRect(ex - 1.8, ey - 1.8, 1.4, 1.4);
    }
    // la grosse moustache, la lèvre
    g.save(); g.filter = 'blur(1.2px)';
    g.fillStyle = '#d4d4d4'; g.beginPath(); g.moveTo(cx - 27, cy + 50); g.quadraticCurveTo(cx - 14, cy + 34, cx, cy + 38); g.quadraticCurveTo(cx + 14, cy + 34, cx + 27, cy + 50); g.quadraticCurveTo(cx, cy + 46, cx - 27, cy + 50); g.fill();
    g.fillStyle = 'rgba(35,35,35,0.6)'; g.fillRect(cx - 13, cy + 52, 26, 2.5);
    g.restore();
    // un grain photographique
    for (let k = 0; k < 5000; k++) { const v = r2() * 255; g.fillStyle = rgb(v, v, v, 0.05); g.fillRect(r2() * w, r2() * h, 1, 1); }
  }, null, false, 4);
}
// LE 2e PORTRAIT (f_0150-f_0168, à gauche du tableau) : une photo noir et blanc aux gris doux — une figure claire,
// floue, dressée au milieu, sur un fond sombre, une bande plus sombre en bas ; on ne sait pas qui (relecture du 10/10 :
// la silhouette blanche nette sur fond noir se lisait comme le pictogramme des toilettes)
function texPortrait2() {
  return canvasTex(160, 256, (g, w, h) => {
    const r2 = graine(1956), cx = w / 2;
    const f = g.createLinearGradient(0, 0, 0, h); f.addColorStop(0, '#3a3a3a'); f.addColorStop(0.7, '#2a2a2a'); f.addColorStop(1, '#1c1c1c');
    g.fillStyle = f; g.fillRect(0, 0, w, h);
    g.save(); g.filter = 'blur(7px)';
    // la lueur du fond derrière la figure, la bande sombre du bas
    const lu = g.createRadialGradient(cx, h * 0.38, 6, cx, h * 0.4, w * 0.62);
    lu.addColorStop(0, 'rgba(120,120,120,0.85)'); lu.addColorStop(1, 'rgba(60,60,60,0)');
    g.fillStyle = lu; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(22,22,22,0.85)'; g.fillRect(0, h * 0.78, w, h * 0.22);
    // la figure : une masse claire irrégulière, la tête, les épaules, le buste qui s'efface vers le bas
    const fig = g.createLinearGradient(0, h * 0.12, 0, h * 0.8);
    fig.addColorStop(0, 'rgba(205,205,205,0.95)'); fig.addColorStop(0.55, 'rgba(175,175,175,0.9)'); fig.addColorStop(1, 'rgba(110,110,110,0.2)');
    g.fillStyle = fig;
    g.beginPath(); g.ellipse(cx + 2, h * 0.2, 17, 21, 0.08, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.moveTo(cx - 36, h * 0.36); g.quadraticCurveTo(cx, h * 0.27, cx + 38, h * 0.35);
    g.lineTo(cx + 30, h * 0.8); g.lineTo(cx - 28, h * 0.8); g.closePath(); g.fill();
    g.restore();
    // des taches et des traits de gris (le modelé flou d'une vieille photo)
    g.save(); g.filter = 'blur(2px)';
    for (let k = 0; k < 60; k++) {
      const v = 70 + r2() * 150, x = cx + (r2() - 0.5) * w * 0.7, y = h * (0.12 + r2() * 0.7);
      g.fillStyle = rgb(v, v, v, 0.18); g.fillRect(x, y, 2 + r2() * 10, 2 + r2() * 14);
    }
    g.restore();
    for (let k = 0; k < 2500; k++) { const v = r2() * 255; g.fillStyle = rgb(v, v, v, 0.06); g.fillRect(r2() * w, r2() * h, 1, 1); }
  }, null, false, 2);
}
// LA PLAQUE NOIRE de la porte, côté espace pause (VO q_0103 : 0,20 x 0,10, deux lignes blanches — illisibles ; on y met
// le nom du panneau du palier : « Salle de cours / S -1.14 »)
function texPlaqueSalle() {
  return canvasTex(256, 128, (g, w, h) => {
    g.fillStyle = '#161616'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#f2f2f2'; g.textAlign = 'left';
    g.font = '500 30px "Segoe UI", Arial, sans-serif'; g.fillText('Salle de cours', 20, 52);
    g.font = '700 34px "Segoe UI", Arial, sans-serif'; g.fillText('S -1.14', 20, 100);
  }, null, false, 4);
}
// UNE FEUILLE A4 blanche à texte (porte verte : illisible)
function texA4(graineN) {
  return canvasTex(96, 136, (g, w, h) => {
    const r2 = graine(graineN);
    g.fillStyle = '#fbfbf8'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#3a3a3a'; g.fillRect(10, 12, 60, 6);
    g.fillStyle = '#8a8a8a';
    for (let y = 30; y < h - 12; y += 7) g.fillRect(10, y, 40 + r2() * 36, 2.5);
  }, null, false, 2);
}

// =====================================================================
//  LA SALLE
// =====================================================================
export function poserAmphi(ch, K) {
  const { C, M } = ch;
  const { Y_SS, DALLE, B, mur, plinthe, panneau, siege, solNiveau, lampes, X, H_RET } = K;
  const A = AMPHI, H = Y_SS + A.h;
  // (des hauteurs comptées depuis le sol du -1)
  const b = (x0, y0, x1, y1, h0, h1, mat, o) => B(x0, y0, x1, y1, Y_SS + h0, Y_SS + h1, mat, o);
  const pan = (mat, w, h, x, y, hc, face, ecart) => panneau(mat, w, h, x, y, Y_SS + hc, face, ecart);
  const std = (o) => new THREE.MeshStandardMaterial(o);
  const P = X.plintheSalle;

  // ---- les matières (couleurs relevées puis corrigées sur un blanc de mur, amphi.md § 3.7) ----
  const Z = {
    hetre: std({ map: texHetre(), roughness: 0.46 }),
    voile: std({ map: texHetre(), color: 0xe8d8bc, roughness: 0.55 }),
    // (relecture du 10/10 : #cfa23e sortait orange vif sous la lumière chaude — au mur voisin, vert 0,70 et bleu 0,10
    // contre 0,74-0,88 et 0,31-0,34 sur la vidéo, f_0082 et f_0228 ; un ocre moins saturé, qui sort jaune moutarde)
    coque: std({ color: 0xd8ae58, roughness: 0.4, side: THREE.DoubleSide }),
    acier: std({ color: 0x1e1e1f, roughness: 0.5, metalness: 0.35 }),
    tableau: std({ color: 0xf6f6f2, roughness: 0.2 }),
    cadreAlu: std({ color: 0xbfc1c0, roughness: 0.35, metalness: 0.6 }),
    carter: std({ color: 0xa7a9a8, roughness: 0.4, metalness: 0.45 }),
    convecteur: std({ map: texConvecteur(), roughness: 0.45 }),
    goulotte: std({ color: 0x2a2a2c, roughness: 0.6 }),
    cadreNoir: std({ color: 0x1b1b1b, roughness: 0.4 }),
    bati: std({ color: 0xecebe6, roughness: 0.45 }),
    meuble: std({ color: 0x2a2a2a, roughness: 0.45, metalness: 0.2 }),
    feutre: std({ color: 0x3e9b3a, roughness: 0.5 }),
  };
  Z.hetre.name = 'stratifié hêtre (S -1.14)'; Z.coque.name = 'coque jaune moutarde (S -1.14)';
  // les blancs : ceux du -1 (js/ecole_soussol.js plafondsSS les passe à son blanc neutre et au rebond de ses plafonds)
  Z.mur = M.blanc; Z.dalles = M.dalles; Z.platre = M.platre;
  // LE POTEAU : ses faces nord et sud un ton plus bas (f_0185, f_0200 : la lumière des luminaires vient de la salle, à
  // l'est ; la face est sort blanche, les côtés gris — d'un seul blanc partout, il disparaissait sur le mur du fond)
  Z.ombre = M.blanc.clone(); Z.ombre.color.setRGB(0.96 * 0.84, 0.99 * 0.84, 1.03 * 0.84); Z.ombre.name = 'peinture blanche (côté du poteau, S -1.14)';
  // LE SOL de la salle : à lui (une rugosité unique : l'optimisation du décor ne doit le confondre avec rien) ; la lumière
  // et l'ombre douce cuites du -1 (js/ecole_soussol.js) y sont posées par uv1, comme sur les autres sols du niveau
  const matSol = std({ map: texSolSalle(), roughness: 0.613 });
  matSol.name = 'dalles grises mouchetées (S -1.14)';
  avecRelief(matSol, normalesSol(), 0.25);
  matSol.userData.lmi = 0.52;            // (son intensité de lumière cuite : js/ecole_soussol.js)

  // =====================================================================
  //  LES MURS, LE SOL, LE PLAFOND
  // =====================================================================
  // le sol (et le seuil de la porte, dans l'épaisseur du mur vert) ; la barre de seuil inox
  solNiveau([[A.x0, A.y0, A.xE, A.y1], [A.xE, A.yE, A.x1, A.y1], [9.35, 11.71, 10.25, A.y0]], matSol, 'sol de la salle S -1.14');
  b(9.35, 11.71, 10.25, 11.86, 0, 0.006, M.inox, { ombre: false });
  // LE MUR OUEST, dans le prolongement du mur du couloir et du hall (x 2,42-2,55) ; au-delà, l'inconnu reste plein
  mur({ de: [2.485, 13.36], a: [2.485, A.y1 + 0.15], ep: 0.13, mats: { E: Z.mur, W: M.blanc }, plinthes: ['E'], plinthe: P });
  plinthe('y', A.x0, A.y0, 13.36, 1, Y_SS, P);
  // LE MUR DU TABLEAU (nord) ; LE MUR EST ; L'ENCOCHE (mur nord des toilettes, mur du vestibule)
  mur({ de: [2.42, A.y1 + 0.075], a: [A.x1 + 0.15, A.y1 + 0.075], mats: Z.mur });
  mur({ de: [A.x1 + 0.075, A.yE - 0.15], a: [A.x1 + 0.075, A.y1 + 0.15], mats: Z.mur, plinthes: ['W'], plinthe: P });
  mur({ de: [A.xE, A.yE - 0.075], a: [A.x1 + 0.15, A.yE - 0.075], mats: Z.mur, plinthes: ['N'], plinthe: P });
  mur({ de: [A.xE + 0.075, A.y0 - 0.15], a: [A.xE + 0.075, A.yE], mats: Z.mur, plinthes: ['W'], plinthe: P });
  // (les faces de la salle des murs du -1 qui la bordent — le mur vert, le mur du hall — sont du même blanc : relecture
  // du 10/10, l'enduit « tiède » qui les doublait n'a plus lieu d'être)
  // LE RETOUR du mur du tableau (f_0082 à f_0105 : une arête verticale passé le convecteur — un doublage, « faible
  // changement de plan », amphi.md § 3.2) et le BANDEAU du mur est, pendant de celui de l'ouest (un plafond plus bas
  // au-dessus de l'arête : f_0086, f_0095). (Plan V2 : avec le mur est ramené en x 13,3, l'arête passe de x 13,9 à 12,95,
  // juste après le convecteur, x 12,5-12,92 ; le bandeau garde ses 35 cm)
  const X_ARETE = A.x1 - 0.35;
  b(X_ARETE, A.y1 - 0.12, A.x1, A.y1, 0, A.h + 0.01, Z.mur, { ombre: false, collision: true });
  // (au pied du mur vert, côté salle : la plinthe grise, la porte verte exceptée)
  for (const [a0, a1] of [[A.x0, 3.88], [5.52, 8.82]]) plinthe('x', A.y0, a0, a1, 1, Y_SS, P);
  // LA GOULOTTE NOIRE au pied du mur du tableau (≈ 10 cm, f_0082) et ses deux boîtiers de prises blancs
  b(A.x0, A.y1 - 0.03, X_ARETE, A.y1, 0, 0.1, Z.goulotte, { ombre: false });
  b(X_ARETE, A.y1 - 0.15, A.x1, A.y1 - 0.12, 0, 0.1, Z.goulotte, { ombre: false });
  for (const x of [9.2, 11.5]) b(x - 0.045, A.y1 - 0.045, x + 0.045, A.y1 - 0.03, 0.015, 0.085, X.blancMat, { ombre: false });
  // LE POTEAU carré (f_0188-f_0200) et le pilier au bout du vestibule (VO q_0105 : le radiateur « s'arrête à un pilier »)
  b(3.25, 13.41, 3.6, 13.76, 0, A.h + 0.01, Z.mur, { ombre: false, collision: true });
  for (const [y0, y1] of [[13.405, 13.41], [13.76, 13.765]]) b(3.25, y0, 3.6, y1, 0, A.h, Z.ombre, { ombre: false });
  plinthe('x', 13.41, 3.25, 3.6, -1, Y_SS, P); plinthe('x', 13.76, 3.25, 3.6, 1, Y_SS, P);
  plinthe('y', 3.25, 13.41, 13.76, -1, Y_SS, P); plinthe('y', 3.6, 13.41, 13.76, 1, Y_SS, P);
  b(10.18, 13.53, A.xE, A.yE, 0, A.h + 0.01, Z.mur, { ombre: false, collision: true });
  plinthe('y', 10.18, 13.53, A.yE, -1, Y_SS, P); plinthe('x', 13.53, 10.18, A.xE, -1, Y_SS, P);
  // LE FAUX PLAFOND : dalles minérales de 60 x 60 à 2,70 m (la salle est plus haute que l'espace pause, 2,55) ; la
  // RETOMBÉE de la poutre (sous 2,40, du mur ouest au pilier, par le poteau) ; le BANDEAU du mur ouest (sous 2,35)
  ch.plafond(A.x0, A.y0, A.x1, A.y1, H, 'dalles', { retombees: false }).material = Z.dalles;
  const retombee = (x0, y0, x1, y1, hb) => {
    b(x0, y0, x1, y1, hb, A.h + 0.01, Z.platre, { ombre: false });
    C.plafond(x0, -y1, x1, -y0, Y_SS + hb, A.h - hb + 0.3);
  };
  retombee(2.9, 13.46, A.xE, 13.76, 2.4);
  retombee(A.x0, A.y0, 2.9, A.y1, 2.35);
  retombee(X_ARETE, A.yE, A.x1, A.y1 - 0.12, 2.35);
  // la caméra ne se glisse pas au-dessus du plafond de l'encoche (fermée)
  C.ajouterBoite(A.xE, -A.yE, A.x1, -A.y0, { y0: Y_SS, y1: DALLE, joueur: false });

  // =====================================================================
  //  LA LUMIÈRE : une vingtaine de luminaires à grille, en lumière chaude
  // =====================================================================
  // amphi.md § 3.3 : une trame d'environ 2,4 x 2,4 m sur toute la salle (5 colonnes x 4 rangées), moins l'encoche ; ici
  // calée sur le calepinage des dalles (partant de l'angle sud-ouest : x 2,55, y 11,86). (Plan V2 : la colonne de
  // x 13,65 tombe au-delà du mur est, ramené en x 13,3 — quatre colonnes)
  const matLum = new THREE.MeshBasicMaterial({ map: texLuminaire(), color: CHAUD_AMPHI.clone().multiplyScalar(1.75) });
  matLum.name = 'luminaire à grille allumé (S -1.14)';
  const _geoLum = new THREE.PlaneGeometry(0.58, 0.58).rotateX(Math.PI / 2);
  for (const x of [4.05, 6.45, 8.85, 11.25]) for (const y of [12.76, 15.16, 17.56, 19.96]) {
    if (x > A.xE && y < A.yE + 0.4) continue;
    b(x - 0.31, y - 0.31, x + 0.31, y + 0.31, A.h - 0.012, A.h + 0.02, M.boitier, { ombre: false });
    maille(_geoLum, matLum, x, H - 0.0125, -y, 0, ch.decor, { ombre: false, recoit: false });
    ch.halo(x, y, H, 1.5);
    const L = { x, z: -y, h: H, zone: 'salleSS', type: 'dalle', base: Y_SS, cuire: false, force: 1.0, couleur: CHAUD_AMPHI };
    ch.lampes.push(L); lampes.push(L);
  }
  // les diffuseurs d'air carrés à fentes
  const matDiff = std({ map: texDiffuseur(), roughness: 0.5 });
  for (const [x, y] of [[11.55, 20.56], [7.65, 20.56], [5.25, 16.36], [12.45, 16.36], [8.85, 13.96]]) {
    const d = maille(new THREE.PlaneGeometry(0.4, 0.4).rotateX(Math.PI / 2), matDiff, x, H - 0.004, -y, 0, ch.decor, { ombre: false, recoit: false });
    void d;
  }

  // =====================================================================
  //  LES PORTES
  // =====================================================================
  // LA PORTE D'ENTRÉE (VO q_0103-q_0107, f_0230-f_0261) : la cloison d'aluminium laqué du mur vert — crème côté espace
  // pause, blanche côté salle —, un FIXE dépoli de 0,5 m à l'ouest, un VANTAIL tout vitré dépoli de 0,9 m à l'est (gonds à
  // l'est, béquille inox et cylindre), une imposte dépolie ; elle s'ouvre en poussant depuis la pause, VERS LA SALLE, et
  // se rabat contre le mur du vestibule. La petite pastille rouge sur l'huisserie ; la plaque noire à l'ouest, côté pause.
  {
    const yS = 11.71, yM = 11.785, yN = 11.86, hT = Y_SS + 2.06;
    // (le verre dépoli du -1, son dégradé calé sur la hauteur : une boîte a ses UV centrés, le bas reprenait le haut)
    const dep = X.depoli.clone(); dep.map = X.depoli.map.clone(); dep.map.offset.set(0, 0.5); dep.map.needsUpdate = true;
    dep.color.setRGB(0.76, 0.79, 0.84);                                    // (f_0245 : de dedans, un gris bleuté, pas un blanc)
    // (relecture du 10/10 : un dépoli, pas un panneau — VO f_0060, f_0078, q_0104 : au travers du fixe, de la pause, on
    // devine le beige des tables et le jaune des fauteuils du dernier rang ; de dedans, f_0238, les mange-debout)
    dep.transparent = true; dep.opacity = 0.93; dep.depthWrite = false; dep.emissiveIntensity = 0.14; dep.name = 'verre dépoli (S -1.14, translucide)';
    const bati = (x0, x1, h0, h1) => {
      B(x0, yS - 0.015, x1, yM, h0, h1, X.creme, { ombre: false });
      B(x0, yM, x1, yN + 0.012, h0, h1, Z.bati, { ombre: false });
    };
    for (const x of [8.85, 9.35, 10.25]) bati(x - 0.03, x + 0.03, Y_SS, H_RET);
    bati(8.82, 10.28, hT, hT + 0.05);                        // la traverse
    bati(8.82, 10.28, H_RET - 0.06, H_RET);                 // le haut
    bati(8.88, 9.32, Y_SS, Y_SS + 0.05);                    // le bas du fixe
    B(8.88, yS - 0.006, 9.32, yN + 0.006, Y_SS + 0.05, hT, dep, { ombre: false });
    B(8.88, yS - 0.006, 10.22, yN + 0.006, hT + 0.05, H_RET - 0.06, dep, { ombre: false });
    // (le fixe et l'imposte au monde solide, comme des vitres : la lumière cuite les traverse, Haythem et la caméra non)
    C.ajouterBoite(8.85, -yS, 9.35, -yN, { y0: Y_SS, y1: hT, vitre: true });
    C.ajouterBoite(8.85, -yS, 10.25, -yN, { y0: hT, y1: H_RET, joueur: false, vitre: true });
    const Pt = ch.porte('x', yM, 9.8, { l: 0.86, h: 2.05, ep: 0.15, base: Y_SS, modele: 'vitree', blanc: true, tirant: 'aucun', huisserie: false,
      etat: 'auto', cote: 'N', charniere: 'd', libre: -1, nom: 'grande salle S -1.14' });
    const v = Pt.vantaux[0], s = v.s, w = 0.86, hv = 2.05;
    maille(boiteM(w - 0.14, hv - 0.168, 0.014), dep, s * w / 2, 0.07 + (hv - 0.168) / 2, 0, 0, v.g, { ombre: false });
    for (const z of [1, -1]) {
      maille(boiteM(0.045, 0.15, 0.012), M.inox, s * (w - 0.04), 1.02, z * 0.031, 0, v.g, { ombre: false });
      maille(boiteM(0.13, 0.02, 0.02), M.inox, s * (w - 0.09), 1.06, z * 0.075, 0, v.g, { ombre: false });
      maille(boiteM(0.02, 0.02, 0.05), M.inox, s * (w - 0.04), 1.06, z * 0.05, 0, v.g, { ombre: false });
    }
    // (l'affichette bleue de 2026, v_063 : sur le vantail, côté pause — elle tourne avec lui)
    const af = new THREE.Mesh(new THREE.PlaneGeometry(0.21, 0.297), std({ map: texAffiche('#2f6fb0', '#f7f8fb', 9), roughness: 0.6 }));
    af.position.set(s * 0.5, 1.55, 0.027); af.castShadow = false; v.g.add(af);
    B(10.215, yN + 0.012, 10.235, yN + 0.016, Y_SS + 1.86, Y_SS + 1.9, M.rougeEtiquette, { ombre: false });
    pan(std({ map: texPlaqueSalle(), roughness: 0.4 }), 0.2, 0.1, 8.6, yS, 1.6, 'S', 0.006);
  }
  // LA PORTE VERTE (cloison nord-ouest, x 3,93-5,47), vue de la salle (f_0195-f_0208) : panneaux PLEINS vert anis — le
  // vantail à l'ouest, le fixe étroit à l'est, l'imposte —, bâti blanc, une feuille A4 scotchée sur le vantail, la béquille ;
  // le BLOC DE SORTIE au-dessus, au ras du plafond. C'est l'issue de secours de la salle : fermée (le mur la porte). Côté
  // pause, la cloison dépolie de 2026 (js/ecole_soussol.js) ne change pas.
  {
    const y = A.y0, e = 0.02;
    for (const x of [3.93, 4.85, 5.47]) b(x - 0.03, y, x + 0.03, y + e + 0.01, 0, 2.52, Z.bati, { ombre: false });
    b(3.9, y, 5.5, y + e + 0.01, 2.06, 2.11, Z.bati, { ombre: false });
    b(3.9, y, 5.5, y + e + 0.01, 2.47, 2.52, Z.bati, { ombre: false });
    b(3.96, y, 4.82, y + e, 0, 2.06, X.vert, { ombre: false });
    b(4.88, y, 5.44, y + e, 0, 2.06, X.vert, { ombre: false });
    b(3.96, y, 5.44, y + e, 2.11, 2.47, X.vert, { ombre: false });
    pan(std({ map: texA4(7), roughness: 0.7 }), 0.21, 0.297, 4.42, y + e, 1.5, 'N', 0.002);
    b(4.73, y + e, 4.78, y + e + 0.012, 0.95, 1.1, M.inox, { ombre: false });
    b(4.63, y + e + 0.03, 4.78, y + e + 0.05, 1.05, 1.07, M.inox, { ombre: false });
    ch.sortie(4.7, y + 0.03, Y_SS + 2.6, 'N');
  }

  // =====================================================================
  //  LE MUR DU TABLEAU (nord)
  // =====================================================================
  {
    const y = A.y1;
    // UN TABLEAU BLANC émaillé à cadre d'aluminium, son rebord porte-feutres
    const tableau = (x0, x1, h0, h1, prof) => {
      b(x0, y - prof, x1, y, h0, h1, Z.cadreAlu);
      b(x0 + 0.02, y - prof - 0.004, x1 - 0.02, y - prof, h0 + 0.02, h1 - 0.02, Z.tableau, { ombre: false });
      b(x0, y - prof - 0.05, x1, y - prof, h0 - 0.025, h0, Z.cadreAlu, { ombre: false });
    };
    // le TRIPTYQUE (f_0143 : le panneau central plus haut, les deux ailes repliables posées devant)
    tableau(6.4, 8.4, 0.8, 2.0, 0.025);
    tableau(5.4, 6.4, 0.87, 1.92, 0.05);
    tableau(8.4, 9.4, 0.87, 1.92, 0.05);
    b(9.05, y - 0.09, 9.07, y - 0.05, 1.45, 1.58, Z.feutre, { ombre: false });      // le feutre vert sur l'aile droite
    // le CARTER de l'écran de projection enroulé, ses pattes, et les deux ENCEINTES blanches à ses bouts
    b(5.3, y - 0.17, 9.5, y - 0.05, 2.39, 2.51, Z.carter);
    for (const x of [5.6, 9.2]) b(x - 0.03, y - 0.06, x + 0.03, y, 2.42, 2.5, Z.carter, { ombre: false });
    for (const x of [5.12, 9.68]) b(x - 0.1, y - 0.15, x + 0.1, y, 2.13, 2.38, X.blancMat);
    // les deux PORTRAITS encadrés de noir
    const portrait = (tex, xc, l, h0, h1) => {
      b(xc - l / 2, y - 0.025, xc + l / 2, y, h0, h1, Z.cadreNoir);
      pan(std({ map: tex, roughness: 0.35 }), l - 0.05, h1 - h0 - 0.05, xc, y - 0.025, (h0 + h1) / 2, 'S', 0.002);
    };
    portrait(texEinstein(), 10.5, 0.7, 1.35, 2.4);
    portrait(texPortrait2(), 4.5, 0.6, 1.35, 2.3);
    // les deux interrupteurs (sous Einstein, un peu à gauche) ; le CONVECTEUR vertical
    b(9.51, y - 0.012, 9.59, y, 1.04, 1.12, X.blancMat, { ombre: false });
    b(10.33, y - 0.012, 10.48, y, 1.04, 1.12, X.blancMat, { ombre: false });
    b(12.5, y - 0.08, 12.92, y, 0.45, 1.33, Z.convecteur);
    // LE MEUBLE MULTIMÉDIA (pupitre roulant : caisson noir, cadre de tube chromé, tablette en débord) et LA CHAISE SEULE
    b(2.95, 20.53, 3.95, 21.09, 0.12, 0.92, Z.meuble, { collision: true });
    b(2.9, 20.46, 4.0, 21.11, 0.92, 0.95, Z.meuble);
    b(3.15, 20.66, 3.55, 20.96, 0.95, 1.2, X.acierGris);
    for (const [px, py] of [[2.93, 20.51], [3.97, 20.51], [2.93, 21.08], [3.97, 21.08]]) {
      b(px - 0.012, py - 0.012, px + 0.012, py + 0.012, 0.04, 0.98, X.chrome, { ombre: false });
      maille(new THREE.CylinderGeometry(0.03, 0.03, 0.035, 10), X.noir, px, Y_SS + 0.03, -py, 0, ch.decor, { ombre: false });
    }
    b(2.93, 20.51, 3.97, 20.53, 0.6, 0.62, X.chrome, { ombre: false });
  }

  // =====================================================================
  //  LE MUR OUEST, LE MUR DU FOND, LE VESTIBULE
  // =====================================================================
  {
    const grille = std({ map: texGrilleVentil(), roughness: 0.6 });
    for (const y of [12.41, 16.41, 18.91]) pan(grille, 0.45, 0.12, 2.9, y, 2.52, 'E', 0.003);
    b(A.x0, 20.58, A.x0 + 0.08, 20.83, 0.4, 1.0, Z.convecteur);            // le convecteur près de l'angle avant
    // le mur du fond (l'envers du mur vert) : petit convecteur et grille au ras du sol à l'ouest de la porte verte ; deux
    // interrupteurs doubles (x 5,7 et 8,6, à 1,1 m)
    b(3.18, A.y0, 3.43, A.y0 + 0.08, 0.4, 1.0, Z.convecteur);
    b(3.47, A.y0, 3.77, A.y0 + 0.012, 0.02, 0.1, X.noir, { ombre: false });
    for (const x of [5.7, 8.6]) b(x - 0.075, A.y0, x + 0.075, A.y0 + 0.012, 1.06, 1.14, X.blancMat, { ombre: false });
    // le RADIATEUR blanc à panneau du mur du vestibule (VO q_0105 ; un rien plus au nord que relevé : le vantail ouvert
    // vient s'y rabattre)
    b(A.xE - 0.08, 12.86, A.xE, 13.46, 0.15, 1.05, M.radiateur, { collision: true });
  }

  // =====================================================================
  //  LES RANGS : tables filantes de hêtre, fauteuils coque jaune moutarde
  // =====================================================================
  // UN FAUTEUIL (f_0082, f_0215, f_0225, f_0228) : coque de bois moulé ; vu de face, le DOSSIER en écu, galbé, au bord
  // supérieur creusé, et sous lui l'ASSISE relevée, plus étroite, percée d'une fente de préhension noire (relecture du
  // 10/10 : l'assise remontait devant le dossier, deux rectangles d'une même largeur) ; la console noire qui la porte sur
  // la poutre du rang
  const geoDos = (() => {
    // (f_0225 : le haut du dossier dépasse nettement la table du rang ; un galbe de 6 cm, le bord creusé de 5 cm, le bas
    // resserré d'un cinquième)
    const R = 0.45, larg = 0.48, th = larg / R, haut = 0.42;
    const g = new THREE.CylinderGeometry(R, R, haut, 12, 1, true, -th / 2, th);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const u = p.getX(i) / (larg / 2);
      if (p.getY(i) > 0) p.setY(i, p.getY(i) - 0.05 * (1 - u * u));
      else p.setX(i, p.getX(i) * 0.8);
    }
    g.computeVertexNormals();
    g.translate(0, 0.53 + haut / 2, -R);
    return g;
  })();
  const geoAssise = (() => {
    const g = boiteM(0.4, 0.3, 0.022), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) if (p.getY(i) < 0) p.setX(i, p.getX(i) * 0.84);
    return g;
  })();
  const geoFente = boiteM(0.12, 0.028, 0.004), geoPivot = boiteM(0.4, 0.035, 0.04), geoConsole = boiteM(0.04, 0.12, 0.035);
  const fauteuil = (x, yb) => {
    maille(geoDos, Z.coque, x, Y_SS, -yb, 0, ch.decor);
    maille(geoAssise, Z.coque, x, Y_SS + 0.43, -(yb + 0.075), 0, ch.decor);
    maille(geoFente, X.noir, x, Y_SS + 0.47, -(yb + 0.088), 0, ch.decor, { ombre: false });
    maille(geoPivot, Z.acier, x, Y_SS + 0.3, -(yb + 0.04), 0, ch.decor, { ombre: false });
    maille(geoConsole, Z.acier, x, Y_SS + 0.33, -(yb + 0.01), 0, ch.decor, { ombre: false });
  };
  let nSieges = 0;
  // UN RANG (le rang k, de xa à xb, n places) : la table au nord (plateau en tronçons de trois places, voile de fond,
  // pieds d'acier noir à platine) ; les fauteuils au sud, sur leur poutre ; `voies` : les x des passages libres à ses
  // deux bouts (on s'y relève). Pour le joueur, un rang est un bloc.
  const rang = (k, xa, xb, n, voies) => {
    const yN = ya(k), yS = yN - PROF_TABLE, yb = yN - 0.9, p = (xb - xa) / n;
    for (let i = 0; i < n; i += 3) {
      const i1 = Math.min(n, i + 3);
      b(xa + i * p + (i ? 0.002 : 0), yS, xa + i1 * p - (i1 < n ? 0.002 : 0), yN, 0.72, 0.75, Z.hetre);
    }
    b(xa + 0.02, yN - 0.045, xb - 0.02, yN - 0.025, 0.4, 0.72, Z.voile);
    const m = Math.ceil(n / 2), xs = [];
    for (let j = 0; j <= m; j++) xs.push(xa + 0.12 + j * (xb - xa - 0.24) / m);
    for (const x of xs) {
      // (le pied de la table, sa platine, la traverse sous le plateau ; le pied de la poutre des sièges)
      b(x - 0.025, yN - 0.26, x + 0.025, yN - 0.21, 0, 0.72, Z.acier);
      b(x - 0.06, yN - 0.33, x + 0.06, yN - 0.14, 0, 0.01, Z.acier, { ombre: false });
      b(x - 0.018, yN - 0.4, x + 0.018, yN - 0.05, 0.685, 0.72, Z.acier, { ombre: false });
      b(x - 0.02, yb + 0.005, x + 0.02, yb + 0.045, 0, 0.24, Z.acier);
      b(x - 0.05, yb - 0.025, x + 0.05, yb + 0.075, 0, 0.01, Z.acier, { ombre: false });
    }
    b(xa, yb + 0.005, xb, yb + 0.045, 0.24, 0.28, Z.acier);
    for (let i = 0; i < n; i++) {
      const x = xa + (i + 0.5) * p;
      fauteuil(x, yb);
      const v = Math.abs(x - voies[0]) < Math.abs(x - voies[1]) ? voies[0] : voies[1];
      siege(x, yb + 0.3, 0.47, 0, -1, v, yb + 0.3, 'le fauteuil');
      nSieges++;
    }
    C.ajouterBoite(xa - 0.03, -yN, xb + 0.03, -(yb - 0.02), { y0: Y_SS, y1: Y_SS + 0.86 });
  };
  // le bloc ouest (8 rangs ; le 7e s'arrête au poteau, le 8e à la porte verte) et le bloc est (6 rangs, le 6e contre
  // l'encoche) ; l'allée de 1,30 m entre eux, dans l'axe de la porte
  for (let k = 1; k <= 6; k++) rang(k, 3.3, 9.0, 9, [2.9, X_ALLEE]);
  rang(7, 3.72, 9.0, 8, [2.95, X_ALLEE]);
  rang(8, 5.6, 9.0, 5, [5.2, X_ALLEE]);
  // (plan V2 : le mur est en x 13,3 — les rangs du bloc est s'arrêtent en x 13,1, cinq places de 0,56 au lieu de sept
  // de 0,60 ; plus de passage le long du mur est, on se relève dans l'allée)
  for (let k = 1; k <= 6; k++) rang(k, A.xE, 13.1, 5, [X_ALLEE, X_ALLEE]);
  // LA LISSE MURALE derrière le dernier rang (f_0215, f_0228 : une barre claire sur le mur du fond, à mi-hauteur des
  // dossiers, qui déborde le rang à ses deux bouts ; relecture du 10/10)
  b(5.35, A.y0, 8.78, A.y0 + 0.04, 0.7, 0.76, Z.voile);
  // LA CHAISE SEULE près du meuble multimédia (f_0165-f_0175) : la même coque, sur quatre pieds noirs, l'assise baissée
  {
    const x = 4.32, y = 20.93, g = new THREE.Group(); g.position.set(x, Y_SS, -y); g.rotation.y = Math.PI + 0.35; ch.decor.add(g);
    maille(geoDos, Z.coque, 0, 0, 0.21, 0, g);
    maille(boiteM(0.44, 0.02, 0.4), Z.coque, 0, 0.45, 0.02, 0, g);
    for (const [px, pz] of [[-0.19, -0.16], [0.19, -0.16], [-0.19, 0.17], [0.19, 0.17]]) maille(boiteM(0.022, 0.44, 0.022), Z.acier, px, 0.22, pz, 0, g);
    C.ajouterCercle(x, -y, 0.26, { y0: Y_SS, y1: Y_SS + 0.86 });
    siege(x, y, 0.47, -Math.sin(g.rotation.y), -Math.cos(g.rotation.y), x + 0.1, y - 0.62, 'la chaise');
    nSieges++;
  }

  // =====================================================================
  //  LA ZONE (pièce) de la salle, pour js/ecole_lumieres.js
  // =====================================================================
  // [x0, z0, x1, z1, hauteur mini, hauteur MAXI] : comme les autres pièces du -1, des pieds sous -1,5 m seulement ; elle
  // s'ouvre sur l'espace pause par sa porte
  const zr = (x0, y0, x1, y1) => [x0, -y1, x1, -y0, -10, -1.5];
  // (relecture du 10/10 : PAS de voisine — les spots ne portent pas d'ombre ; voisine de l'espace pause, la salle prêtait
  // ses luminaires au vestibule et aux mange-debout au travers du mur vert, et la pause les siens au dernier rang. Les
  // deux pièces ne s'ouvrent que par une porte, comme la pause et le hall du -1)
  const zone = { id: 'salleSS', rects: [zr(A.x0 - 0.05, 11.81, A.xE, A.y1 + 0.05), zr(A.xE, A.yE, A.x1 + 0.05, A.y1 + 0.05)], voisines: [],
    env: { x: X_ALLEE, y: Y_SS + 1.6, z: -16.51 } };

  // LE FILET DE SÉCURITÉ du joueur (js/player.js bounds) : la carte le borne à z -25 (le fond de la salle David Clark) ;
  // si le mur du tableau passait au-delà, on reculerait la borne une fois, à la première image (plan V2 : il est en
  // y 21,41, en deçà — la borne ne bouge plus)
  let borne = false;
  const maj = (dt, jeu) => {
    if (borne) return;
    const Bo = jeu.user && jeu.user.bounds;
    if (!Bo) return;
    if (Bo.zMin > -(A.y1 + 0.5)) Bo.zMin = -(A.y1 + 0.5);
    borne = true;
  };
  console.info('[sous-sol] salle S -1.14 : %d places', nSieges);
  return { sols: [matSol], zone, maj };
}
