// =====================================================================
//  LE 1er ÉTAGE D'APRÈS LA VISITE OFFICIELLE (2021) : L'ESPACE PAUSE ORANGE, LA SALLE DE COURS S 1.3, LE RECOIN
//  SUD-EST, LE BUREAU DE LA TRAVÉE 1 (crochet de js/ecole_etage1.js, 10/10)
// =====================================================================
// Derrière la porte à 1,5 vantail du palier est (VO q_0180), pas de couloir : l'ESPACE PAUSE. Murs crème, mur du fond
// orange (l'alcôve et la porte de la salle Robert Kahn), trois poteaux blancs et leurs murets lilas à tablette blanche au
// nord, lino taupe satiné, plafond de dalles 60 x 60 à 2,55 m et spots ronds, deux banquettes courbes (jaune, rouge
// orangé) et leur table basse noire, des mange-debout noirs, des tabourets « Miura » noirs, des chaises coque hautes
// (orange, menthe, lime), les deux distributeurs dans leur habillage gris au fond (VO q_0180-0197, q_0214-0219, f_49,2 s,
// 53,2-54,8 s, 66,6-68,1 s). Au sud, trois jours dépolis et la porte de la SALLE DE COURS S 1.3 : sept fenêtres sur la
// rue, moquette en dalles bleu-gris de deux tons, tables doubles de hêtre clair, chaises de hêtre percé, tableau
// triptyque au mur ouest (VO q_0198-0213). À l'est de sa porte, le RECOIN : un renfoncement de 2 m qui file au sud
// jusqu'à une porte taupe (VO q_0268-0272). Au fond, la porte de la Si 1.4 (Robert Kahn, js/ecole_kahn.js du lot 6).
//
// LECTURE A OU B (plan_global § 2.8) — TRANCHÉ PAR RECALAGE (10/10) : NI L'UNE NI L'AUTRE, mais la salle de A et
// l'espace pause de B.
//   - LES FENÊTRES DE LA SALLE (49,2-53,2 s, f 455) : sept fenêtres pareilles, la plus à l'ouest suivie d'un pilastre
//     entier puis du mur du tableau (f_070, f_080 à 25 i/s : appui, linteau et largeur dans la suite des autres, la
//     perspective seule les rapetisse). La grande baie rouge de la travée 1 (photo 12 : bien plus haute et plus large,
//     appui plus bas) n'est PAS dans la salle : la salle couvre les travées 2 à 8, son mur ouest est sur le trumeau 1-2
//     (x 1,65), la travée 1 est une pièce à part (photo 12 : un bureau allumé, quelqu'un assis).
//   - LA VUE DE 67 s (f_012, vers le sud ; échelles tirées des HAUTEURS — porte taupe 2,04 m, imposte 2,07 m, plaque
//     à 1,60 m — donc indépendantes de la focale) : entre le mur de la porte du palier (x 13,55) et le jambage est de la
//     porte de la salle, un RECOIN de 1,98 m de large qui file au sud jusqu'à une porte taupe de 0,95 m (à 0,8 m de son
//     angle est) ; la porte de la salle fait 0,93 m ; les jours dépolis 0,92 x 1,44 m (appui 0,90, linteau 2,35) au pas
//     de 1,45 m (sous-estimé au bord de l'image, où l'objectif grand-angle tasse : on retient le pas des travées, 1,65).
//     La porte de la salle est donc dans la travée 7 (x 10,44-11,37), pas dans la 8 : la lecture A (porte x 11,6-12,5,
//     recoin de 0,9 m) ne loge ni le recoin ni sa porte.
//   - LE MUR DU FOND (49,2 s, f_001, vers l'ouest le long du mur sud ; birapport, sans focale) : jambage ouest de la
//     porte, plaque, trois jours, puis l'angle du fond à 3,51 pas des jours (0,68 pas de large) : 5,8 m au pas de 1,65,
//     soit le fond en x 4,75 — le mur du palier d'étage ouest du jeu prolongé. L'espace pause fait donc 8,8 m de long
//     (lecture B), et ses jours tombent sur les travées 4, 5 et 6.
//   Seule la vue de 53,5 s (f_108, si on lui donne la focale de la salle) mettait le fond vers x 8,2 : avec la focale
//   grand-angle des plans de l'espace pause (f ≈ 230-300, celle qui met la caméra de 67 s dans la pièce), elle le met
//   entre 4,3 et 6,7. La travée 8 reste à la salle (elle passe au sud du recoin), la porte taupe du bout du recoin est la
//   seconde porte de la salle (plus de 50 places : deux dégagements).
//
// LE PLAN (repère de js/carte_ecole.js : x le long de la façade, y vers le fond ; plancher du 1er à 3,50 m) :
//   l'espace pause            x 4,75-13,49  y 7,035-12,0  (+ l'alcôve jusqu'au mur orange, y 12,84)
//     le mur du fond          x 4,675 (face est 4,75) : porte à 1,5 vantail y 7,18-8,63 vers le couloir sombre, la
//                             niche des distributeurs y 9,5-11,6 (saillie 0,30)
//     les poteaux             x 6,6 / 8,8 / 11,0 sur y 12,0 (38 x 38 cm), murets lilas entre le fond et le 3e
//     le mur orange           y 12,9 (nu sud 12,84, nu NORD 12,96 : Y_MUR_ORANGE, lu par le lot 6), crème à l'ouest du
//                             1er poteau ; la porte de la Si 1.4 x 11,9-12,85, gonds à l'est, ouverte vers le sud
//     le mur est              x 13,55 (face ouest 13,49), sa retombée de 45 cm ; la porte du palier (js/ecole_est.js)
//   le recoin sud-est         x 11,49-13,49 y 5,51-7,035 ; porte taupe x 11,72-12,67 (fermée) au bout
//   la salle S 1.3            x 1,71-13,14 y 0-6,915, moins le recoin (x > 11,37, y > 5,39) ; porte x 10,44-11,37
//   le bureau de la travée 1  x 0-1,59 y 0-6,915 (la grande baie rouge), porte fermée sur le couloir sombre
//
//   poserPause1(ch, ctx) -> { zones, sols }        ctx : les outils et listes de l'étage (js/ecole_etage1.js)
import * as THREE from 'three';
import { maille, boiteM } from './ecole_portes.js';
import { canvasTex } from './kit_decor.js';
import { texPeinture, texConsignes, texAffiche } from './ecole_matieres.js';
import { TELEPHONE } from './appareil.js';

// ---- les hauteurs ----
const N1 = 3.5;                     // le plancher du 1er
const HP = N1 + 2.55;               // le plafond de dalles de l'espace pause (VO : 2,5-2,6)
const HS = N1 + 2.7;                // celui de la salle (H_SALLE de js/ecole_etage1.js)
const DALLE2 = 6.4;                 // le dessous de la dalle du 2e : les cloisons y montent
// ---- le plan ----
const Y_S = 6.975;                  // la cloison nord des salles sur rue (Y_SALLES), ep 0,12
const XF = 4.675;                   // l'axe du mur du fond de l'espace pause (ep 0,15 : face est 4,75)
const XE = 13.55;                   // l'axe du mur est (celui de la porte du palier, ep 0,12 : face ouest 13,49)
const YP = 12.0;                    // la ligne des poteaux et des murets
const YO = 12.9;                    // l'axe du mur orange (ep 0,12)
const XR = 11.43, YR = 5.45;        // le recoin : l'axe de son mur ouest, de son mur sud
const POTEAUX = [5.7, 8.05, 10.4];             // (VO f_108, 53,5 s : le 1er près du fond, au bout d'un muret court)
const JOURS = [9.075, 7.425, 5.775];             // les trois jours dépolis (travées 6, 5, 4)
const PORTE_S13 = { c: 10.905, l: 0.93 };        // la porte de la salle (travée 7)
const TRAVEE = 1.65;
const centreTravee = (k) => 0.825 + (k - 1) * TRAVEE;
// LA Si 1.4 (pour le lot 6, js/ecole_kahn.js) : le NU NORD du mur orange (la face blanche, côté salle), l'ouverture de
// sa porte, et ce qui la ferme en attendant la salle (une forme du monde solide et un fond sombre : `off = true` et
// `visible = false` quand la salle est posée)
export const Y_MUR_ORANGE = YO + 0.06;
export const SI14 = { x0: 11.9, x1: 12.85, y: YO, provisoires: [] };

// =====================================================================
//  LES TEXTURES (dessinées : aucun fichier de plus à charger)
// =====================================================================
const rgb = (r, g, b, a = 1) => `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a})`;
function graine(s) {
  let x = s >>> 0 || 1;
  return () => { x ^= x << 13; x >>>= 0; x ^= x >> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; };
}
// LA MOQUETTE EN DALLES de la salle (VO q_0200-0212 : dalles de 50 cm en damier irrégulier, anthracite bleuté et gris-
// bleu ardoise, les fibres en sens alterné d'une dalle à l'autre). Tuile : 4 m (8 x 8 dalles).
function texMoquette() {
  const W = TELEPHONE ? 256 : 512;
  return canvasTex(W, W, (g, w, h) => {
    const r2 = graine(1303), n = 8, c = w / n;
    const tons = [[62, 67, 82], [100, 107, 121]];
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      // (un damier, dérangé d'une dalle sur quatre : la pose « irrégulière » de la vidéo)
      const k = ((i + j) % 2) ^ (r2() < 0.27 ? 1 : 0), [r, gg, b] = tons[k], t = (r2() - 0.5) * 8;
      g.fillStyle = rgb(r + t, gg + t, b + t); g.fillRect(i * c, j * c, c, c);
      // les fibres, en travers d'une dalle sur deux
      g.save(); g.beginPath(); g.rect(i * c, j * c, c, c); g.clip();
      for (let f = 0; f < 70; f++) {
        const v = (r2() - 0.5) * 34, a = 0.14;
        g.fillStyle = rgb(r + v, gg + v, b + v + 4, a);
        if ((i + j) % 2) g.fillRect(i * c + r2() * c, j * c, 1, c); else g.fillRect(i * c, j * c + r2() * c, c, 1);
      }
      g.restore();
    }
    for (let k = 0; k < (TELEPHONE ? 3000 : 9000); k++) { const v = 60 + r2() * 90; g.fillStyle = rgb(v, v + 4, v + 14, 0.18); g.fillRect(r2() * w, r2() * h, 1.2, 1.2); }
    g.fillStyle = 'rgba(30,32,40,0.35)';
    for (let i = 0; i <= n; i++) { g.fillRect(i * c - 0.5, 0, 1, h); g.fillRect(0, i * c - 0.5, w, 1); }
  }, [1 / 4, 1 / 4], false, 8);
}
// LE LINO TAUPE de l'espace pause (VO : un PVC uni brun taupe, satiné, où se reflètent les tables) : un fond à peine
// nuageux, des mouchetures fines. Tuile : 2 m.
function texLino() {
  return canvasTex(256, 256, (g, w, h) => {
    const r2 = graine(7655);
    g.fillStyle = rgb(122, 100, 85); g.fillRect(0, 0, w, h);
    for (let k = 0; k < 40; k++) {
      const x = r2() * w, y = r2() * h, R = 18 + r2() * 50, d = (r2() - 0.5) * 12, gr = g.createRadialGradient(x, y, 0, x, y, R);
      gr.addColorStop(0, rgb(122 + d, 100 + d, 85 + d, 0.4)); gr.addColorStop(1, rgb(122, 100, 85, 0));
      g.fillStyle = gr; g.fillRect(x - R, y - R, 2 * R, 2 * R);
    }
    for (let k = 0; k < 2600; k++) { const v = (r2() - 0.5) * 40; g.fillStyle = rgb(122 + v, 100 + v, 85 + v, 0.3); g.fillRect(r2() * w, r2() * h, 1, 1); }
  }, [1 / 2, 1 / 2], false, 8);
}
// LE DOSSIER DES CHAISES DE LA SALLE (VO q_0204-0212) : contreplaqué de hêtre moulé, ses trous ronds en « visage » —
// deux en haut, un arc de cinq dessous (les trous sont transparents : alphaTest)
function texDossierHetre() {
  return canvasTex(128, 96, (g, w, h) => {
    const r2 = graine(911), gr = g.createLinearGradient(0, 0, w, 0);
    gr.addColorStop(0, '#b98552'); gr.addColorStop(0.5, '#cf9d68'); gr.addColorStop(1, '#b98552');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 40; k++) { g.fillStyle = `rgba(120,78,40,${0.05 + r2() * 0.08})`; g.fillRect(0, r2() * h, w, 1); }
    g.globalCompositeOperation = 'destination-out';
    const trou = (x, y, r) => { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); };
    trou(w * 0.36, h * 0.3, 6.5); trou(w * 0.64, h * 0.3, 6.5);
    for (let i = 0; i < 5; i++) { const a = -0.55 + i * 0.275; trou(w / 2 + Math.sin(a) * w * 0.3, h * 0.48 + Math.cos(a) * h * 0.2, 5.5); }
    g.globalCompositeOperation = 'source-over';
  }, null, true, 4);
}
// LE DISTRIBUTEUR DE BOISSONS CHAUDES (VO q_0186 : façade noire, le grand visuel de tasse en haut, la colonne de touches
// à droite, le monnayeur, la niche du gobelet en bas à cadre blanc) — 0,65 x 1,83 m
function texCafe() {
  return canvasTex(256, 720, (g, w, h) => {
    g.fillStyle = '#141414'; g.fillRect(0, 0, w, h);
    // le visuel (une tasse fumante, fond brun chaud), cadre argent
    g.fillStyle = '#8d8f91'; g.fillRect(18, 34, 156, 260);
    const f = g.createLinearGradient(0, 40, 0, 290); f.addColorStop(0, '#3a2418'); f.addColorStop(1, '#a5774e');
    g.fillStyle = f; g.fillRect(22, 38, 148, 252);
    g.fillStyle = '#f5efe6'; g.beginPath(); g.moveTo(52, 170); g.lineTo(140, 170); g.lineTo(132, 232); g.quadraticCurveTo(96, 250, 60, 232); g.closePath(); g.fill();
    g.fillStyle = '#4a2a17'; g.beginPath(); g.ellipse(96, 171, 44, 8, 0, 0, 7); g.fill();
    g.strokeStyle = '#f5efe6'; g.lineWidth = 7; g.beginPath(); g.arc(142, 192, 14, -1.3, 1.5); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = 4;
    for (const dx of [-14, 2, 18]) { g.beginPath(); g.moveTo(94 + dx, 158); g.bezierCurveTo(82 + dx, 136, 106 + dx, 116, 94 + dx, 92); g.stroke(); }
    // la colonne de touches et l'afficheur
    g.fillStyle = '#0b1e10'; g.fillRect(190, 40, 50, 24); g.fillStyle = '#7dff8e'; g.font = '600 15px Consolas, monospace'; g.fillText('0,80', 196, 58);
    for (let i = 0; i < 9; i++) { g.fillStyle = '#2f2f2e'; g.fillRect(192, 80 + i * 26, 46, 20); g.fillStyle = '#d9b48a'; g.fillRect(198, 87 + i * 26, 14, 4); }
    g.fillStyle = '#c9c9c4'; g.fillRect(196, 330, 40, 26); g.fillStyle = '#2f6fb0'; g.fillRect(201, 336, 30, 12);
    g.fillStyle = '#f2b705'; g.fillRect(196, 372, 40, 40);
    // la niche du gobelet, son cadre blanc ; la trappe du bas
    g.fillStyle = '#e8e6e0'; g.fillRect(56, 470, 110, 120); g.fillStyle = '#0a0a0a'; g.fillRect(64, 478, 94, 104);
    g.fillStyle = '#3a3a38'; g.fillRect(64, 566, 94, 10);
    g.fillStyle = '#262626'; g.fillRect(18, 640, 220, 60);
  }, null, false, 4);
}
// LE DISTRIBUTEUR DE SNACKS ET DE BOISSONS FRAÎCHES (VO : porte vitrée, éclairage bleu froid, rayons à spirales, le
// monnayeur et son pavé vert-jaune à droite) — 0,90 x 1,83 m
function texSnack() {
  return canvasTex(384, 768, (g, w, h) => {
    const r2 = graine(8086);
    g.fillStyle = '#161616'; g.fillRect(0, 0, w, h);
    const v0 = 16, v1 = 290, t0 = 30, t1 = 600, rang = (t1 - t0) / 6;
    const fond = g.createLinearGradient(0, t0, 0, t1); fond.addColorStop(0, '#6fb6ff'); fond.addColorStop(0.5, '#3d7fd6'); fond.addColorStop(1, '#2a5fae');
    g.fillStyle = fond; g.fillRect(v0, t0, v1 - v0, t1 - t0);
    const coul = ['#d0262d', '#f2b705', '#e8e6e0', '#3e9b6b', '#7b2a6e', '#e07b2a', '#3a2418', '#1d1d1d'];
    for (let r = 0; r < 6; r++) {
      const yb = t0 + (r + 1) * rang, n = 5, lc = (v1 - v0) / n, ph = rang - 30;
      for (let i = 0; i < n; i++) {
        const cx = v0 + (i + 0.5) * lc;
        g.fillStyle = coul[Math.floor(r2() * coul.length)]; g.fillRect(cx - lc * 0.3, yb - 10 - ph, lc * 0.6, ph);
        g.strokeStyle = 'rgba(220,235,255,0.7)'; g.lineWidth = 2;
        g.beginPath(); g.ellipse(cx, yb - 10 - ph * 0.45, lc * 0.36, ph * 0.42, 0, 0, 7); g.stroke();
      }
      g.fillStyle = '#c9d6e6'; g.fillRect(v0, yb - 10, v1 - v0, 3);
    }
    // les deux tubes de l'éclairage, le reflet de la vitre
    g.fillStyle = 'rgba(235,245,255,0.95)'; g.fillRect(v1 - 18, t0, 8, t1 - t0); g.fillRect(v0 + 4, t0, 6, t1 - t0);
    g.fillStyle = 'rgba(255,255,255,0.12)'; g.beginPath(); g.moveTo(v0 + 40, t0); g.lineTo(v0 + 110, t0); g.lineTo(v0 + 20, t1); g.lineTo(v0, t1); g.closePath(); g.fill();
    // le monnayeur : afficheur, clavier, le pavé vert-jaune
    g.fillStyle = '#c0c2c3'; g.fillRect(304, 30, 70, 570);
    g.fillStyle = '#0d1a0f'; g.fillRect(312, 50, 54, 26); g.fillStyle = '#7dff8e'; g.font = '600 15px Consolas, monospace'; g.fillText('1,20', 318, 69);
    for (let j = 0; j < 4; j++) for (let i = 0; i < 3; i++) { g.fillStyle = '#ececea'; g.fillRect(314 + i * 17, 96 + j * 20, 13, 14); }
    g.fillStyle = '#c6d817'; g.fillRect(312, 200, 54, 86); g.fillStyle = '#1d1d1d'; g.fillRect(330, 300, 18, 30);
    // la trappe
    g.fillStyle = '#2a2a29'; g.fillRect(v0, 630, v1 - v0, 100); g.fillStyle = '#4a4a48'; g.fillRect(v0 + 16, 646, v1 - v0 - 32, 8);
  }, null, false, 4);
}
// LA GRANDE AFFICHE ENCADRÉE du mur est (VO 67 s, `reseau.md` § 4.2 : 0,95 x 1,35 m, une photo sombre bleue et grise,
// le texte blanc « ESC… », le reste coupé ou illisible ; marie-louise blanche)
function texAfficheESC() {
  return canvasTex(256, 364, (g, w, h) => {
    const r2 = graine(4410);
    g.fillStyle = '#f4f3ef'; g.fillRect(0, 0, w, h);
    const m = 18, f = g.createLinearGradient(0, m, 0, h - m); f.addColorStop(0, '#2c3a4e'); f.addColorStop(1, '#141b26');
    g.fillStyle = f; g.fillRect(m, m, w - 2 * m, h - 2 * m);
    for (let k = 0; k < 14; k++) { g.fillStyle = `rgba(150,170,200,${0.05 + r2() * 0.1})`; g.fillRect(m + r2() * (w - 2 * m - 40), m + 120 + r2() * 180, 20 + r2() * 60, 6 + r2() * 30); }
    g.fillStyle = '#ffffff'; g.font = '800 46px "Segoe UI", Arial, sans-serif'; g.fillText('ESC', 34, 92);
    g.filter = 'blur(2px)'; g.font = '700 30px "Segoe UI", Arial, sans-serif'; g.fillText('…', 128, 92); g.filter = 'none';
    g.fillStyle = 'rgba(255,255,255,0.6)'; for (let k = 0; k < 3; k++) g.fillRect(34, 112 + k * 14, 140 - k * 30, 5);
  }, null, false, 4);
}
// L'AFFICHE A2 « SKETCHNOTE » du 3e poteau (VO q_0186-0190 : blanche, des dessins et des cadres bleus)
function texSketchnote() {
  return canvasTex(256, 362, (g, w, h) => {
    const r2 = graine(2717);
    g.fillStyle = '#fbfbf8'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#2f62b5'; g.fillStyle = '#2f62b5'; g.lineWidth = 3; g.lineCap = 'round';
    g.font = '700 22px "Segoe Print", "Comic Sans MS", sans-serif'; g.fillText('Le réseau', 52, 34);
    for (let k = 0; k < 9; k++) {
      const x = 20 + (k % 3) * 78, y = 60 + Math.floor(k / 3) * 96;
      if (r2() < 0.5) { g.strokeRect(x, y, 58, 40); } else { g.beginPath(); g.arc(x + 29, y + 22, 22, 0, 7); g.stroke(); }
      g.lineWidth = 2; for (let l = 0; l < 3; l++) { g.beginPath(); g.moveTo(x, y + 52 + l * 10); g.lineTo(x + 30 + r2() * 30, y + 52 + l * 10); g.stroke(); }
      g.lineWidth = 3;
      if (k % 3 < 2) { g.beginPath(); g.moveTo(x + 62, y + 20); g.lineTo(x + 74, y + 20); g.stroke(); }
    }
    g.fillStyle = '#9ec3f0'; g.fillRect(14, h - 46, w - 28, 30);
  }, null, false, 4);
}
// LE TABLEAU BLANC TRIPTYQUE (VO q_0206-0212) : blanc, presque effacé
function texTriptyque(n) {
  return canvasTex(512, 300, (g, w, h) => {
    const r2 = graine(60 + n);
    g.fillStyle = '#f7f8f8'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 10; k++) {
      const x = r2() * w, y = r2() * h, r = 40 + r2() * 110, gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, 'rgba(150,160,175,0.07)'); gr.addColorStop(1, 'rgba(150,160,175,0)');
      g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
    }
  }, null, false, 8);
}
// LES VITROPHANIES des fenêtres de la salle (VO q_0200-0212) : la FLÈCHE de curseur (4e fenêtre en partant de l'est) et
// le symbole WIFI (6e), blancs à liseré lilas
function texVitroFleche() {
  return canvasTex(128, 160, (g) => {
    g.beginPath(); g.moveTo(30, 10); g.lineTo(108, 92); g.lineTo(72, 96); g.lineTo(92, 144); g.lineTo(74, 152); g.lineTo(54, 104); g.lineTo(28, 128); g.closePath();
    g.fillStyle = 'rgba(250,250,255,0.92)'; g.fill(); g.strokeStyle = 'rgba(176,160,220,0.95)'; g.lineWidth = 6; g.stroke();
  }, null, true, 4);
}
function texVitroWifi() {
  return canvasTex(128, 128, (g) => {
    g.strokeStyle = 'rgba(250,250,255,0.92)'; g.lineCap = 'round';
    for (const [r, l] of [[22, 12], [44, 12], [66, 12]]) { g.lineWidth = l; g.beginPath(); g.arc(64, 110, r, Math.PI * 1.22, Math.PI * 1.78); g.stroke(); }
    g.fillStyle = 'rgba(176,160,220,0.95)'; g.beginPath(); g.arc(64, 110, 9, 0, 7); g.fill();
  }, null, true, 4);
}
// LA FICHE A4 BLEUE (face est du 3e poteau) et la petite affichette blanche du recoin
function texFiche(fond, encre) {
  return canvasTex(128, 180, (g, w, h) => {
    g.fillStyle = fond; g.fillRect(0, 0, w, h);
    g.fillStyle = encre; g.fillRect(12, 14, w * 0.6, 10);
    for (let y = 40; y < h - 14; y += 12) g.fillRect(12, y, (0.45 + ((y * 37) % 40) / 100) * w, 4);
  }, null, false, 2);
}
// LA GRILLE DE VENTILATION de l'habillage des distributeurs (VO q_0186 : quatre fentes horizontales)
function texGrilleVent() {
  return canvasTex(128, 48, (g, w, h) => {
    g.fillStyle = '#6b6862'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#2a2826'; for (let i = 0; i < 4; i++) g.fillRect(8, 6 + i * 10, w - 16, 5);
  }, null, false, 2);
}
// LE DIFFUSEUR D'AIR carré du plafond de la salle (VO : quatre ou cinq, à ailettes, plus sombres que les dalles)
function texDiffuseur() {
  return canvasTex(128, 128, (g, w) => {
    g.fillStyle = '#d9dbdc'; g.fillRect(0, 0, w, w);
    g.strokeStyle = '#8c8f92'; g.lineWidth = 4;
    for (let i = 1; i <= 4; i++) { const m = i * 12; g.strokeRect(m, m, w - 2 * m, w - 2 * m); }
    g.fillStyle = '#5d6064'; g.fillRect(56, 56, 16, 16);
  }, null, false, 2);
}

// =====================================================================
//  LE CROCHET
// =====================================================================
const DIR = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };
const ROT = { S: 0, N: Math.PI, E: Math.PI / 2, W: -Math.PI / 2 };

export function poserPause1(ch, ctx) {
  const { C, M } = ch;
  const { groupe, sieges, B, panneau, porte, spot, dalle, radiateur, projecteur, fauteuil, ordinateur, texPlaqueSalle } = ctx;
  const std = (o, nom) => { const m = new THREE.MeshStandardMaterial(o); if (nom) m.name = nom; return m; };
  const P = {
    // (les teintes « à modéliser » de etage1.md § 4.6 ; l'orange un rien plus clair que l'échiffre du palier, photo 28)
    orange: std({ map: texPeinture(0xe47e2c, 4), roughness: 0.7 }, 'peinture orange (espace pause du 1er)'),
    creme: std({ map: texPeinture(0xeee6d2, 4), roughness: 0.86 }, 'peinture crème (espace pause du 1er)'),
    lilas: std({ map: texPeinture(0xa8a4b5, 3), roughness: 0.8 }, 'muret lilas'),
    tablette: std({ color: 0xf0ede6, roughness: 0.42 }, 'tablette blanche des murets'),
    plinthe: std({ color: 0x6e5038, roughness: 0.5 }, 'plinthe brune'),
    habillage: std({ map: texPeinture(0x6b6862, 3), roughness: 0.6 }, 'habillage gris des distributeurs'),
    // (la vidéo : brun taupe, satiné — les tables s'y reflètent ; sous les spots chauds du jeu, la teinte du relevé sortait
    // trop claire : un voile)
    lino: std({ map: texLino(), color: 0xb8b0a8, roughness: 0.3 }, 'lino taupe (espace pause du 1er)'),
    moquette: std({ map: texMoquette(), color: 0xa9adb6, roughness: 0.97 }, 'moquette en dalles (salle S 1.3)'),
    plateau: std({ color: 0xd8cab2, roughness: 0.48 }, 'stratifié hêtre clair (tables de la salle)'),
    chant: std({ color: 0xa48a68, roughness: 0.5 }),
    pietement: std({ color: 0x2b2d33, roughness: 0.45, metalness: 0.5 }, 'piétement anthracite'),
    chrome: std({ color: 0xa8a9ad, roughness: 0.3, metalness: 0.85 }, 'tube chromé'),
    hetre: std({ color: 0xc4925a, roughness: 0.55 }, 'contreplaqué de hêtre'),
    dossier: std({ map: texDossierHetre(), roughness: 0.55, alphaTest: 0.5, side: THREE.DoubleSide }, 'dossier de hêtre percé'),
    laque: std({ color: 0x121212, roughness: 0.12, metalness: 0.1 }, 'laqué noir brillant'),
    noir: std({ color: 0x1d1d1c, roughness: 0.5, metalness: 0.15 }, 'acier noir des mange-debout'),
    miura: std({ color: 0x2a2826, roughness: 0.55 }, 'polypropylène noir (tabourets)'),
    jaune: std({ color: 0xe0a01c, roughness: 0.34 }, 'simili jaune moutarde'),
    rouge: std({ color: 0xcf3f17, roughness: 0.34 }, 'simili rouge orangé'),
    // (les coques sont des surfaces : vues des deux côtés)
    coqueOrange: std({ color: 0xe2471c, roughness: 0.38, side: THREE.DoubleSide }, 'coque orange'),
    coqueMenthe: std({ color: 0x8db3a0, roughness: 0.38, side: THREE.DoubleSide }, 'coque menthe'),
    coqueLime: std({ color: 0xb9c41e, roughness: 0.38, side: THREE.DoubleSide }, 'coque lime'),
    cadreBlanc: std({ color: 0xf2f1ec, roughness: 0.4 }, 'cadre blanc des jours'),
    taupe: std({ color: 0x9d978f, roughness: 0.45 }, 'vantail gris taupe'),
    // (les jours dépolis, verre sablé blanc laiteux : vus de l'espace pause, le jour de la salle les allume ; vus de la
    // salle, plus ternes)
    jourPause: std({ color: 0xf3f3f1, roughness: 0.5, emissive: 0xeef0f4, emissiveIntensity: 0.62 }, 'jour dépoli (côté pause)'),
    jourSalle: std({ color: 0xe6e8ea, roughness: 0.5, emissive: 0xdde0e6, emissiveIntensity: 0.18 }, 'jour dépoli (côté salle)'),
    // (la salle : un blanc plus froid que celui du reste de l'école — VO q_0198-0212, sous ses tubes à 4 000 K et le jour)
    blancSalle: std({ map: texPeinture(0xf2f3f3, 3), roughness: 0.86 }, 'peinture blanche (salle S 1.3)'),
    lilasBleu: std({ color: 0xc4c4ec, roughness: 0.4, emissive: 0xb4b6ea, emissiveIntensity: 0.55 }, 'vitrage lilas-bleu de l\'alcôve'),
  };
  const sols = [P.moquette, P.lino];
  const lum = (tex, k) => new THREE.MeshStandardMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: k, roughness: 0.22, metalness: 0.1 });

  // UN MUR (plan, parallèle à un axe), de `base` à `h`, posé dans le groupe de l'étage : comme le mur() de l'étage, mais
  // chaque face peut avoir SA plinthe (`plinthes` : [face, matière] — brune côté pause, bois côté salle)
  const mur = ({ de, a, ep = 0.12, base = N1, h = DALLE2, mats, plinthes = [], ouvertures = [], camera = true }) => {
    const [x0, y0] = de, [x1, y1] = a;
    const axeX = Math.abs(x1 - x0) >= Math.abs(y1 - y0);
    const debut = axeX ? Math.min(x0, x1) : Math.min(y0, y1), fin = axeX ? Math.max(x0, x1) : Math.max(y0, y1);
    const ligne = axeX ? y0 : x0;
    const ouv = ouvertures.map((o) => ({ a0: Math.max(debut, o.c - o.l / 2), a1: Math.min(fin, o.c + o.l / 2), bas: o.bas ?? base, haut: Math.min(h, o.h ?? base + 2.04) })).sort((p, q) => p.a0 - q.a0);
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
        for (const [c, m] of plinthes) {
          const s = c === cotes[0] ? 1 : -1, v = s * (ep / 2 + 0.0075);
          const [px0, py0, px1, py1] = R(v - 0.0075, v + 0.0075);
          B(px0, py0, px1, py1, base, base + 0.08, m, { ombre: false });
        }
      }
    }
  };
  // une plaque de salle (photo 23 : noire, lignes blanches centrées ; 18 x 11 cm, à 1,60-1,65 m)
  const plaque = (l1, l2, l3, x, y, face, hc = 1.62, picto = null) => panneau(new THREE.MeshStandardMaterial({ map: texPlaqueSalle(l1, l2, l3, picto), roughness: 0.35 }), 0.18, 0.108, x, y, N1 + hc, face);
  // un cadre noir mince et son affiche, contre une face
  const cadre = (tex, w, h, x, y, hc, face, ep = 0.015) => {
    const [fx, fz] = DIR[face], dx = fx * ep, dy = -fz * ep;
    const p = panneau(new THREE.MeshStandardMaterial({ map: tex, roughness: 0.3 }), w - 0.04, h - 0.04, x + dx * 1.07, y + dy * 1.07, N1 + hc, face);
    if (fx) B(x, y - w / 2, x + dx, y + w / 2, N1 + hc - h / 2, N1 + hc + h / 2, M.noirMat, { ombre: false });
    else B(x - w / 2, y, x + w / 2, y + dy, N1 + hc - h / 2, N1 + hc + h / 2, M.noirMat, { ombre: false });
    return p;
  };
  // LE DÉCLENCHEUR MANUEL rouge (12 x 13 cm, son étiquette blanche) contre une face
  const declencheur = (x, y, hc, face) => {
    const [fx, fz] = DIR[face], e = 0.045;
    const ax = x + fx * e, ay = y - fz * e;
    B(Math.min(x, ax) - (fx ? 0 : 0.06), Math.min(y, ay) - (fx ? 0.06 : 0), Math.max(x, ax) + (fx ? 0 : 0.06), Math.max(y, ay) + (fx ? 0.06 : 0), N1 + hc - 0.065, N1 + hc + 0.065, M.rougeEtiquette, { ombre: false });
    panneau(M.boitier, 0.07, 0.04, x + fx * (e + 0.001), y - fz * (e + 0.001), N1 + hc + 0.02, face);
  };

  // =====================================================================
  //  LES MURS
  // =====================================================================
  // LA CLOISON NORD DES SALLES, de la travée 1 au recoin : le bureau (porte fermée sur le couloir), puis la salle — ses
  // trois jours dépolis (appui 0,90, linteau 2,35 : VO 67 s) et sa porte à imposte vitrée ; crème côté espace pause
  mur({ de: [-0.3, Y_S], a: [XF, Y_S], mats: { N: M.blanc, S: P.blancSalle }, plinthes: [['N', M.bois], ['S', M.bois]], ouvertures: [{ c: 0.85, l: 0.95 }] });
  mur({ de: [XF, Y_S], a: [XR - 0.06, Y_S], mats: { N: P.creme, S: P.blancSalle }, plinthes: [['N', P.plinthe], ['S', M.bois]],
    ouvertures: [...JOURS.map((c) => ({ c, l: 0.95, bas: N1 + 0.9, h: N1 + 2.35 })), { c: PORTE_S13.c, l: PORTE_S13.l, h: N1 + 2.35 }] });
  // (au-dessus de la bouche du recoin, entre les deux plafonds : le linteau jusqu'à la dalle)
  B(XR - 0.06, Y_S - 0.06, XE + 0.06, Y_S + 0.06, HP, DALLE2, M.blanc, { ombre: false });
  // LE MUR DU FOND (ouest) : crème côté pause, blanc côté couloir sombre ; la porte à 1,5 vantail (y 7,18-8,63)
  mur({ de: [XF, Y_S - 0.06], a: [XF, YO + 0.06], ep: 0.15, mats: { E: P.creme, W: M.blanc }, plinthes: [['E', P.plinthe], ['W', M.bois]], ouvertures: [{ c: 7.9, l: 1.45, h: N1 + 2.06 }] });
  // LE MUR EST, du bout du mur du palier (y 8,925, js/ecole_est.js) au renfoncement nord (y 11,1) — derrière lui, le dos
  // du mur du panneau d'étage
  mur({ de: [XE, 8.925], a: [XE, 11.1], mats: { W: P.creme, E: M.blanc }, plinthes: [['W', P.plinthe]] });
  // LE RECOIN SUD-EST (VO q_0268-0272) : son mur ouest (le jambage est de la porte de la salle), son mur est (dans le
  // prolongement du mur du palier), son fond et la porte taupe — la seconde porte de la salle, fermée
  mur({ de: [XR, YR - 0.06], a: [XR, Y_S + 0.06], mats: { E: P.creme, W: P.blancSalle }, plinthes: [['E', P.plinthe], ['W', M.bois]] });
  mur({ de: [XE, YR - 0.06], a: [XE, Y_S + 0.06], mats: { W: P.creme, E: M.blanc }, plinthes: [['W', P.plinthe], ['E', M.bois]] });
  mur({ de: [XR - 0.06, YR], a: [XE + 0.06, YR], mats: { N: P.creme, S: P.blancSalle }, plinthes: [['N', P.plinthe], ['S', M.bois]], ouvertures: [{ c: 12.195, l: 0.95 }] });
  porte('x', YR, 12.195, { l: 0.95, etat: 'fermee', cote: 'N', oculus: false, matVantail: P.taupe, nom: 'salle S 1.3 (recoin)' });
  // (la petite affichette blanche à gauche de la porte taupe, à 1,6 m)
  panneau(new THREE.MeshStandardMaterial({ map: texFiche('#f4f3ef', '#5d6066'), roughness: 0.6 }), 0.16, 0.22, 12.93, YR + 0.063, N1 + 1.62, 'N');
  // LE MUR EST DE LA SALLE (la cloison du bureau 103), au sud du recoin
  mur({ de: [13.2, 0], a: [13.2, YR - 0.06], mats: { W: P.blancSalle, E: M.blanc }, plinthes: [['E', M.bois], ['W', M.bois]] });
  // LE MUR OUEST DE LA SALLE, sur le trumeau des travées 1 et 2 : à l'ouest, le bureau de la grande baie rouge
  mur({ de: [1.65, 0], a: [1.65, Y_S - 0.06], mats: { E: P.blancSalle, W: M.blanc }, plinthes: [['E', M.bois], ['W', M.bois]] });
  // LE MUR ORANGE (le fond de l'alcôve, la façade sud de la Si 1.4) : crème du fond au 1er poteau (la « bande lilas-bleu »
  // y luit), orange au-delà ; blanc côté Si 1.4. La porte de la Si 1.4 et son imposte vitrée (VO 54,8 s : 2,45 m)
  mur({ de: [XF - 0.075, YO], a: [POTEAUX[0] - 0.19, YO], mats: { S: P.creme, N: M.blanc }, plinthes: [['S', P.plinthe]], ouvertures: [{ c: 5.18, l: 0.22, bas: N1 + 0.95, h: N1 + 2.35 }] });
  B(5.07, YO - 0.03, 5.29, YO + 0.03, N1 + 0.95, N1 + 2.35, P.lilasBleu, { ombre: false });
  C.ajouterBoite(5.07, -(YO - 0.06), 5.29, -(YO + 0.06), { y0: N1 + 0.95, y1: N1 + 2.35 });
  mur({ de: [POTEAUX[0] - 0.19, YO], a: [13.26, YO], mats: { S: P.orange, N: M.blanc }, plinthes: [['S', P.plinthe]], ouvertures: [{ c: (SI14.x0 + SI14.x1) / 2, l: SI14.x1 - SI14.x0, h: N1 + 2.45 }] });
  // (l'angle nord-est : du bout du mur du renfoncement nord du palier, y 12,6, au mur orange)
  mur({ de: [13.2, 12.6], a: [13.2, YO + 0.06], mats: { W: P.creme, E: M.blanc } });

  // LA PORTE DE LA Si 1.4 : vantail blanc à grande vitre, gonds à l'est, ouvert vers l'espace pause ; l'imposte vitrée
  const cK = (SI14.x0 + SI14.x1) / 2, lK = SI14.x1 - SI14.x0;
  porte('x', YO, cK, { l: lK, ep: 0.12, modele: 'vitree', blanc: true, tirant: 'court', etat: 'ouverte', angle: 1.25, cote: 'S', charniere: 'd', nom: 'salle Robert Kahn Si 1.4' });
  B(SI14.x0, YO - 0.03, SI14.x1, YO + 0.03, N1 + 2.09, N1 + 2.13, M.alu, { ombre: false });
  B(SI14.x0, YO - 0.03, SI14.x1, YO + 0.03, N1 + 2.41, N1 + 2.45, M.alu, { ombre: false });
  const imposteK = new THREE.Mesh(new THREE.PlaneGeometry(lK - 0.04, 0.28), M.verre); imposteK.position.set(cK, N1 + 2.27, -YO); groupe.add(imposteK);
  C.ajouterBoite(SI14.x0, -(YO - 0.06), SI14.x1, -(YO + 0.06), { y0: N1 + 2.09, y1: N1 + 2.45 });
  plaque('Salle', 'Robert Kahn', 'Si 1.4', SI14.x0 - 0.21, YO - 0.063, 'S', 1.65);
  // (en attendant la salle — lot 6 — : une forme qui ferme l'ouverture, un fond sombre derrière)
  {
    const f = C.ajouterBoite(SI14.x0, -(YO - 0.06), SI14.x1, -(YO + 0.06), { y0: N1, y1: N1 + 2.1 });
    const fond = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.6), new THREE.MeshStandardMaterial({ color: 0xc9ced8, roughness: 0.9, emissive: 0xd8dde8, emissiveIntensity: 0.35 }));
    fond.position.set(cK, N1 + 1.3, -(YO + 0.9)); groupe.add(fond);
    SI14.provisoires.push(f, fond);
  }

  // =====================================================================
  //  L'ESPACE PAUSE
  // =====================================================================
  // LE SOL : le lino taupe, sur la lumière et l'ombre cuites du 1er (uv1 sur R1) ; le recoin compris
  const solEtage = (rects, mat, nom) => {
    const R1 = ctx.R1, W = R1.x1 - R1.x0, L = R1.y1 - R1.y0, pos = [], nor = [], uv = [], uv1 = [], idx = [];
    for (const [x0, y0, x1, y1] of rects) {
      const b = pos.length / 3;
      for (const [x, y] of [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]) { pos.push(x, N1, -y); nor.push(0, 1, 0); uv.push(x, y); uv1.push((x - R1.x0) / W, (y - R1.y0) / L); }
      idx.push(b, b + 1, b + 2, b, b + 2, b + 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setAttribute('uv1', new THREE.Float32BufferAttribute(uv1, 2));
    g.setIndex(idx);
    const s = new THREE.Mesh(g, mat); s.receiveShadow = true; s.castShadow = false; s.name = nom; s.userData.solEtage = true;
    groupe.add(s);
  };
  solEtage([[XF, Y_S, XE, 11.1], [XF, 11.1, 13.2, YO], [XR, YR, XE, Y_S]], P.lino, 'lino de l\'espace pause du 1er');
  // LE PLAFOND de dalles 60 x 60 (2,55 m), la retombée du mur est (VO 67 s : 45 cm de large, 30 cm plus bas), les spots
  // ronds en quinconce, un dans le recoin, un devant la porte de la Si 1.4 ; le détecteur de fumée
  ch.plafond(4.75, 7.035, 13.49, 11.1, HP, 'dalles');
  ch.plafond(4.75, 11.1, 13.14, 12.84, HP, 'dalles');
  ch.plafond(11.49, 5.51, 13.49, 7.035, HP, 'dalles');
  B(13.04, 7.035, 13.49, 11.1, HP - 0.3, HP, M.platre, { ombre: false });
  C.plafond(13.04, -11.1, 13.49, -7.035, HP - 0.3);
  for (const [x, y] of [[5.9, 8.45], [7.7, 8.45], [9.5, 8.45], [11.3, 8.45], [6.8, 10.55], [8.6, 10.55], [10.4, 10.55], [12.2, 10.0], [12.45, 6.2], [12.5, 12.35]]) spot(x, y, HP, 'e1pause');
  maille(new THREE.CylinderGeometry(0.055, 0.06, 0.04, 20), M.boitier, 11.9, HP - 0.02, -12.4, 0, groupe, { ombre: false });

  // LE MUR DU FOND : la porte à 1,5 vantail — le semi-fixe gris clair au nord et ses deux affichettes, le vantail de
  // 0,95 ouvert vers l'ouest sur le couloir sombre —, le bloc de sortie au-dessus, la notice A3 et le déclencheur ; la
  // NICHE DES DISTRIBUTEURS (habillage gris, deux grilles de ventilation en haut)
  porte('y', XF, 8.38, { l: 0.48, ep: 0.15, etat: 'fermee', cote: 'E', oculus: false, poignee: null, fermePorte: false, notices: 2, matVantail: M.porte, nom: 'espace pause (semi-fixe du fond)' });
  porte('y', XF, 7.665, { l: 0.95, ep: 0.15, etat: 'ouverte', angle: 1.55, cote: 'W', nom: 'espace pause (porte du fond)' });
  ch.sortie(4.79, 7.9, N1 + 2.3, 'E');
  panneau(new THREE.MeshStandardMaterial({ map: texConsignes(), roughness: 0.5 }), 0.3, 0.42, 4.753, 9.15, N1 + 1.55, 'E');
  declencheur(4.75, 9.15, 1.18, 'E');
  {
    const y0 = 9.5, y1 = 11.6, xa = 4.75, xb = 5.05, hh = N1 + 2.4, hm = N1 + 1.86;
    B(xa, y0, xb, y1, hm, hh, P.habillage, { collision: true });
    for (const [a, b] of [[y0, y0 + 0.1], [10.29, 10.39], [11.33, y1]]) B(xa, a, xb, b, N1, hm, P.habillage, { collision: true });
    const grille = new THREE.MeshStandardMaterial({ map: texGrilleVent(), roughness: 0.6 });
    for (const yc of [9.95, 10.86]) panneau(grille, 0.5, 0.19, xb + 0.002, yc, N1 + 2.13, 'E');
    // les deux machines (façades lumineuses), leur caisse dans la niche
    B(xa, 9.6, xb - 0.03, 10.29, N1, hm, M.noirMat, { collision: true });
    B(xa, 10.39, xb - 0.03, 11.33, N1, hm, M.noirMat, { collision: true });
    panneau(lum(texCafe(), 0.32), 0.65, 1.83, xb - 0.028, 9.945, N1 + 0.95, 'E');
    panneau(lum(texSnack(), 0.6), 0.92, 1.83, xb - 0.028, 10.86, N1 + 0.95, 'E');
  }
  // LE MUR EST : la grande affiche encadrée « ESC… », le bloc de sortie au-dessus de la porte du palier ; dans le recoin,
  // le déclencheur et le cadre de consignes (VO 67 s)
  cadre(texAfficheESC(), 0.95, 1.35, 13.49, 9.75, 1.58, 'W');
  ch.sortie(13.46, 7.84, N1 + 2.25, 'W');
  declencheur(13.49, 6.86, 1.25, 'W');
  cadre(texConsignes(), 0.32, 0.5, 13.49, 6.5, 1.47, 'W', 0.01);

  // LE CÔTÉ NORD : les trois poteaux blancs, les murets lilas à tablette blanche (on s'y accoude), l'alcôve derrière
  for (const x of POTEAUX) {
    B(x - 0.19, YP - 0.19, x + 0.19, YP + 0.19, N1, HP, M.blanc, { collision: true, ombre: false });
    for (const [a, b, c, d] of [[x - 0.2, YP - 0.2, x + 0.2, YP - 0.19], [x - 0.2, YP - 0.19, x - 0.19, YP + 0.19], [x + 0.19, YP - 0.19, x + 0.2, YP + 0.19]]) B(a, b, c, d, N1, N1 + 0.08, P.plinthe, { ombre: false });
  }
  const murets = [[4.75, POTEAUX[0] - 0.19], [POTEAUX[0] + 0.19, POTEAUX[1] - 0.19], [POTEAUX[1] + 0.19, POTEAUX[2] - 0.19]];
  for (const [a, b] of murets) {
    B(a, YP - 0.075, b, YP + 0.075, N1, N1 + 0.97, P.lilas, { collision: true });
    B(a, YP - 0.125, b, YP + 0.125, N1 + 0.97, N1 + 1.0, P.tablette);
    B(a, YP - 0.09, b, YP - 0.075, N1, N1 + 0.08, P.plinthe, { ombre: false });
    C.ajouterBoite(a, -(YP - 0.125), b, -(YP + 0.125), { y0: N1, y1: N1 + 1.0 });
  }
  // les plaques et les affiches : « Espace pause » (la tasse) sur l'orange entre les poteaux 1 et 2, la sketchnote A2 sur
  // le 3e poteau et la fiche bleue sur sa face est
  plaque('Espace', 'pause', null, POTEAUX[0] + 0.45, YO - 0.063, 'S', 1.65, 'tasse');
  panneau(new THREE.MeshStandardMaterial({ map: texSketchnote(), roughness: 0.6 }), 0.36, 0.51, POTEAUX[2], YP - 0.192, N1 + 1.9, 'S');
  panneau(new THREE.MeshStandardMaterial({ map: texFiche('#2f62b5', '#e8eef8'), roughness: 0.6 }), 0.21, 0.297, POTEAUX[2] + 0.192, YP, N1 + 1.6, 'E');

  // =====================================================================
  //  LE MOBILIER DE L'ESPACE PAUSE (on s'y assoit)
  // =====================================================================
  const _y = new THREE.Vector3(0, 1, 0), _d = new THREE.Vector3();
  const tige = (g, mat, a, b, r) => {
    _d.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    const t = maille(new THREE.CylinderGeometry(r, r, _d.length(), 8), mat, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2, 0, g);
    t.quaternion.setFromUnitVectors(_y, _d.normalize());
    return t;
  };
  const siege = (x, y, fx, fz, h, sx, sy, nom) => sieges.push({ x, z: -y, y: h, fx, fz, sx, sz: -sy, nom, sol: N1 });
  // LE MANGE-DEBOUT (VO : plateau rond noir de 65 cm à 1,10 m, colonne noire, piétement en croix)
  const mangeDebout = (x, y) => {
    const g = new THREE.Group(); g.position.set(x, N1, -y); g.rotation.y = (x * 7 + y * 3) % 1.5; groupe.add(g);
    maille(new THREE.CylinderGeometry(0.325, 0.325, 0.025, 40), P.laque, 0, 1.087, 0, 0, g);
    maille(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 16), P.noir, 0, 1.066, 0, 0, g, { ombre: false });
    maille(new THREE.CylinderGeometry(0.025, 0.025, 1.0, 12), P.noir, 0, 0.56, 0, 0, g);
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; tige(g, P.noir, [0, 0.12, 0], [Math.cos(a) * 0.3, 0.012, Math.sin(a) * 0.3], 0.013); }
    C.ajouterCercle(x, -y, 0.33, { y0: N1, y1: N1 + 1.1 });
  };
  // LE TABOURET HAUT « MIURA » (VO : monobloc de polypropylène noir, assise à 80 cm, deux jambes en A devant et sa barre
  // repose-pieds, une jambe large derrière)
  const miura = (x, y, dir, sortie = null) => {
    const [fx, fz] = DIR[dir], h = 0.8;
    const g = new THREE.Group(); g.position.set(x, N1, -y); g.rotation.y = Math.atan2(fx, fz); groupe.add(g);
    const s = new THREE.Shape(); s.moveTo(-0.17, -0.1); s.quadraticCurveTo(-0.2, 0.12, 0, 0.16); s.quadraticCurveTo(0.2, 0.12, 0.17, -0.1); s.quadraticCurveTo(0, -0.17, -0.17, -0.1);
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.035, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 1, curveSegments: 6 });
    geo.rotateX(-Math.PI / 2);
    maille(geo, P.miura, 0, h - 0.035, 0, 0, g);
    for (const sx of [-1, 1]) { const j = maille(boiteM(0.035, 0.84, 0.07), P.miura, sx * 0.16, 0.39, 0.09, 0, g); j.rotation.z = sx * 0.22; j.rotation.x = -0.18; }
    const dos = maille(boiteM(0.16, 0.86, 0.035), P.miura, 0, 0.4, -0.13, 0, g); dos.rotation.x = 0.26;
    maille(boiteM(0.36, 0.03, 0.03), P.miura, 0, 0.3, 0.16, 0, g, { ombre: false });
    C.ajouterCercle(x, -y, 0.21, { y0: N1, y1: N1 + h });
    const so = sortie || [x - fx * 0.6, y + fz * 0.6];
    siege(g.position.x + fx * 0.03, y - fz * 0.03, fx, fz, h + 0.01, so[0], so[1], 'le tabouret');
  };
  // LA CHAISE COQUE HAUTE (VO : coque moulée type « Eames » sur piétement haut à repose-pieds — orange, menthe, lime)
  const coque = (x, y, dir, mat, sortie = null) => {
    const [fx, fz] = DIR[dir], h = 0.7;
    const g = new THREE.Group(); g.position.set(x, N1, -y); g.rotation.y = Math.atan2(fx, fz); groupe.add(g);
    const assise = maille(new THREE.SphereGeometry(0.25, 20, 6, 0, Math.PI * 2, Math.PI * 0.62, Math.PI * 0.38), mat, 0, h + 0.12, 0, 0, g);
    assise.scale.set(1, 0.5, 0.92);
    // (le dossier : une bande de cylindre centrée sur l'arrière, -z local — theta = π)
    const dos = maille(new THREE.CylinderGeometry(0.235, 0.22, 0.26, 20, 1, true, Math.PI * 0.62, Math.PI * 0.76), mat, 0, h + 0.2, 0.0, 0, g);
    dos.rotation.x = -0.12;
    for (const [px, pz] of [[0.17, 0.15], [-0.17, 0.15], [0.17, -0.15], [-0.17, -0.15]]) tige(g, P.noir, [px * 0.55, h + 0.02, pz * 0.55], [px, 0, pz], 0.009);
    const anneau = maille(new THREE.TorusGeometry(0.19, 0.009, 6, 24), P.noir, 0, 0.3, 0, 0, g, { ombre: false }); anneau.rotation.x = Math.PI / 2;
    C.ajouterCercle(x, -y, 0.24, { y0: N1, y1: N1 + h + 0.3 });
    const so = sortie || [x - fx * 0.62, y + fz * 0.62];
    siege(g.position.x + fx * 0.02, y - fz * 0.02, fx, fz, h + 0.03, so[0], so[1], 'la chaise haute');
  };
  // LA BANQUETTE COURBE (VO : monobloc de mousse gainée de simili, 50 cm de large, assise à 45 cm) le long d'une ligne
  // médiane `pts` (plan) ; on s'y assoit des deux côtés, tous les 60 cm
  const banquette = (pts, mat, nom) => {
    const courbe = new THREE.CatmullRomCurve3(pts.map(([x, y]) => new THREE.Vector3(x, y, 0)), false, 'centripetal');
    const n = 40, ga = [], dr = [], L = courbe.getLength();
    for (let i = 0; i <= n; i++) {
      const p = courbe.getPointAt(i / n), t = courbe.getTangentAt(i / n), nx = -t.y, ny = t.x;
      ga.push([p.x + nx * 0.25, p.y + ny * 0.25]); dr.push([p.x - nx * 0.25, p.y - ny * 0.25]);
    }
    const s = new THREE.Shape();
    // (la forme dans le plan (x, y du plan), extrudée vers +z puis couchée : rotateX(-π/2) envoie z en hauteur et y en
    // -z, le repère du monde)
    [...ga, ...dr.reverse()].forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
    s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.39, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3, curveSegments: 4, steps: 1 });
    geo.rotateX(-Math.PI / 2);
    const m = maille(geo, mat, 0, N1 + 0.03, 0, 0, groupe); m.name = nom;
    for (let d = 0.15; d < L - 0.1; d += 0.3) {
      const p = courbe.getPointAt(d / L);
      C.ajouterCercle(p.x, -p.y, 0.26, { y0: N1, y1: N1 + 0.45 });
    }
    for (let d = 0.3; d < L - 0.2; d += 0.6) {
      const p = courbe.getPointAt(d / L), t = courbe.getTangentAt(d / L), nx = -t.y, ny = t.x;
      for (const sg of [1, -1]) siege(p.x + sg * nx * 0.06, p.y + sg * ny * 0.06, sg * nx, -sg * ny, 0.46, p.x + sg * nx * 0.62, p.y + sg * ny * 0.62, 'la banquette');
    }
  };
  // (VO q_0182-0196, f_015 à 45,4 s, 53,2-54 s : la jaune en S, nord-sud, en avant des distributeurs ; la rouge en
  // haricot au nord-est, devant les murets, ouverte au sud-ouest ; la table basse entre les deux)
  banquette([[8.0, 8.35], [7.5, 8.95], [7.65, 9.75], [7.2, 10.45]], P.jaune, 'banquette jaune');
  banquette([[7.75, 11.0], [8.45, 11.4], [9.3, 11.42], [9.9, 11.05], [10.05, 10.5]], P.rouge, 'banquette rouge');
  {
    const g = new THREE.Group(); g.position.set(8.5, N1, -10.2); g.rotation.y = 2.04; groupe.add(g);
    const s = new THREE.Shape(), w = 0.7, d = 0.275;
    s.moveTo(-w + d, -d); s.lineTo(w - d, -d); s.absarc(w - d, 0, d, -Math.PI / 2, Math.PI / 2, false); s.lineTo(-w + d, d); s.absarc(-w + d, 0, d, Math.PI / 2, Math.PI * 1.5, false);
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.04, bevelEnabled: false, curveSegments: 10 }); geo.rotateX(-Math.PI / 2);
    maille(geo, P.laque, 0, 0.36, 0, 0, g);
    const pied = maille(geo.clone().scale(0.8, 1, 0.7), P.noir, 0, 0.0, 0, 0, g, { ombre: false }); pied.scale.y = 9;
    C.ajouterBoiteOrientee(8.5, -10.2, 0.7, 0.275, -2.04, { y0: N1, y1: N1 + 0.4 });
  }
  // les mange-debout et leurs tabourets, les chaises coque (VO : près de la porte du palier, devant les jours, devant la
  // jaune, devant la rouge, et celui du coin nord-est, vu à 67 s). On y circule : le long des jours, de la porte du palier
  // à celle du fond et à celle de la salle (y 7,0-8,1) ; du palier à la porte de la Si 1.4 (x 11,5-12,1)
  for (const [x, y] of [[12.45, 9.1], [9.3, 8.55], [9.75, 9.95], [10.85, 10.45], [12.4, 10.95]]) mangeDebout(x, y);
  miura(12.9, 8.75, 'W', [13.0, 8.15]); miura(12.0, 9.5, 'E', [11.7, 8.6]); miura(8.85, 8.9, 'E', [8.6, 7.65]);
  miura(10.25, 10.2, 'W', [10.4, 9.4]); miura(11.3, 10.75, 'W', [11.75, 10.0]); miura(12.85, 11.3, 'W', [12.6, 12.1]);
  coque(10.35, 8.7, 'W', P.coqueOrange, [10.6, 8.05]); coque(10.0, 9.2, 'W', P.coqueMenthe, [10.6, 9.45]);
  coque(5.2, 11.5, 'S', P.coqueLime, [5.25, 10.9]);

  // =====================================================================
  //  LA SALLE DE COURS S 1.3 (travées 2 à 8 ; VO q_0198-0213)
  // =====================================================================
  // LE SOL : la moquette en dalles (et celle du bureau de la travée 1), sur la lumière et l'ombre cuites du 1er
  solEtage([[-0.3, 0, 13.2, YR - 0.06], [-0.3, YR - 0.06, XR, Y_S]], P.moquette, 'moquette de la salle S 1.3');
  // LE PLAFOND de dalles (2,70 m), les luminaires 60 x 60 à grille en trois rangs, les diffuseurs d'air
  ch.plafond(1.71, 0, 13.14, YR - 0.06, HS, 'dalles');
  ch.plafond(1.71, YR - 0.06, XR - 0.06, 6.915, HS, 'dalles');
  // (VO : la salle est d'un blanc froid, le jour et les tubes à 4 000 K — pas la lumière chaude des spots de l'espace pause)
  const froid = new THREE.Color(0xeef2fb);
  for (const y of [1.5, 3.45, 5.0]) for (const x of [3.4, 6.0, 8.6, 11.2]) { dalle(x, y, 'e1salle'); Object.assign(ch.lampes[ch.lampes.length - 1], { couleur: froid, force: 1.2 }); }
  const diff = new THREE.MeshStandardMaterial({ map: texDiffuseur(), roughness: 0.6, emissive: 0xd8d4cc, emissiveIntensity: 0.12 });
  for (const [x, y] of [[4.7, 2.45], [7.3, 4.3], [9.9, 2.45], [12.25, 3.6]]) { const d = maille(new THREE.PlaneGeometry(0.58, 0.58), diff, x, HS - 0.006, -y, 0, groupe, { ombre: false }); d.rotation.x = Math.PI / 2; }
  // LES PILASTRES (VO : 35 cm, 20 cm de saillie, entre toutes les fenêtres ; les mêmes en face, au mur nord)
  const pilastre = (x, ya, yb) => B(x - 0.175, ya, x + 0.175, yb, N1, HS, P.blancSalle, { collision: true, ombre: false });
  for (let k = 2; k <= 7; k++) pilastre(k * TRAVEE, 0, 0.2);
  B(1.71, 0, 1.885, 0.2, N1, HS, P.blancSalle, { collision: true, ombre: false });
  B(12.965, 0, 13.14, 0.2, N1, HS, P.blancSalle, { collision: true, ombre: false });
  for (const x of [3.3, 4.95, 6.6, 8.25, 9.9]) pilastre(x, 6.715, 6.915);
  B(1.71, 6.715, 1.885, 6.915, N1, HS, P.blancSalle, { collision: true, ombre: false });
  // LES JOURS DÉPOLIS (verre sablé, cadre blanc, des deux côtés) ; L'IMPOSTE VITRÉE de la porte
  for (const c of JOURS) {
    const a = c - 0.475, b = c + 0.475, h0 = N1 + 0.9, h1 = N1 + 2.35, k = 0.05;
    for (const [s, m, yy] of [[1, P.jourPause, Y_S + 0.004], [-1, P.jourSalle, Y_S - 0.004]]) {
      const v = new THREE.Mesh(new THREE.PlaneGeometry(b - a - 2 * k, h1 - h0 - 2 * k), m);
      v.position.set(c, (h0 + h1) / 2, -yy); v.rotation.y = s > 0 ? Math.PI : 0; groupe.add(v);
    }
    for (const [ya, yb] of [[Y_S + 0.02, Y_S + 0.06], [Y_S - 0.06, Y_S - 0.02]]) {
      B(a, ya, b, yb, h0, h0 + k, P.cadreBlanc, { ombre: false }); B(a, ya, b, yb, h1 - k, h1, P.cadreBlanc, { ombre: false });
      B(a, ya, a + k, yb, h0, h1, P.cadreBlanc, { ombre: false }); B(b - k, ya, b, yb, h0, h1, P.cadreBlanc, { ombre: false });
    }
    B(a - 0.03, Y_S + 0.06, b + 0.03, Y_S + 0.09, h0 - 0.025, h0, P.cadreBlanc, { ombre: false });
    C.ajouterBoite(a, -(Y_S - 0.06), b, -(Y_S + 0.06), { y0: h0, y1: h1, vitre: true });
  }
  {
    const a = PORTE_S13.c - PORTE_S13.l / 2, b = PORTE_S13.c + PORTE_S13.l / 2, h0 = N1 + 2.09, h1 = N1 + 2.35;
    for (const [s, m, yy] of [[1, P.jourPause, Y_S + 0.004], [-1, P.jourSalle, Y_S - 0.004]]) {
      const v = new THREE.Mesh(new THREE.PlaneGeometry(b - a, h1 - h0), m); v.position.set(PORTE_S13.c, (h0 + h1) / 2, -yy); v.rotation.y = s > 0 ? Math.PI : 0; groupe.add(v);
    }
    B(a, Y_S - 0.07, b, Y_S + 0.07, h1 - 0.03, h1, M.huisserie, { ombre: false });
    C.ajouterBoite(a, -(Y_S - 0.06), b, -(Y_S + 0.06), { y0: h0, y1: h1 });
  }
  // LA PORTE DE LA SALLE (vantail non vu : ouvert dans la salle, rabattu contre le mur du recoin) et sa plaque, à
  // l'ouest, côté espace pause (VO f_001, 49,2 s ; 67 s)
  porte('x', Y_S, PORTE_S13.c, { l: PORTE_S13.l, etat: 'ouverte', angle: 1.57, cote: 'S', charniere: 'd', nom: 'salle S 1.3' });
  plaque('Salle de cours', 'S 1.3', null, PORTE_S13.c - PORTE_S13.l / 2 - 0.24, Y_S + 0.063, 'N', 1.6);
  // LES CONVECTEURS sous les sept fenêtres
  for (let k = 2; k <= 8; k++) radiateur(centreTravee(k), 0.0, 'N', 1.0, 0.1, 0.7);
  // LES VITROPHANIES : la flèche sur la 4e fenêtre en partant de l'est (travée 5), le wifi sur la 6e (travée 3)
  {
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.42), new THREE.MeshStandardMaterial({ map: texVitroFleche(), transparent: true, roughness: 0.4, side: THREE.DoubleSide, depthWrite: false }));
    fl.position.set(centreTravee(5) - 0.28, N1 + 1.55, 0.135); fl.rotation.y = Math.PI; groupe.add(fl);
    const wi = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.3), new THREE.MeshStandardMaterial({ map: texVitroWifi(), transparent: true, roughness: 0.4, side: THREE.DoubleSide, depthWrite: false }));
    wi.position.set(centreTravee(3) - 0.3, N1 + 1.62, 0.135); wi.rotation.y = Math.PI; groupe.add(wi);
  }
  // LE TABLEAU TRIPTYQUE au mur ouest (panneau central 2,0 x 1,2 et ses deux volets ouverts, bas à 0,90 m), le haut-
  // parleur au-dessus, le vidéoprojecteur à 2 m du mur
  {
    const yc = 3.45, xw = 1.71;
    for (const [y, w, n] of [[yc, 2.0, 0], [yc - 1.5, 0.98, 1], [yc + 1.5, 0.98, 2]]) {
      B(xw, y - w / 2 - 0.02, xw + 0.025, y + w / 2 + 0.02, N1 + 0.88, N1 + 2.12, M.alu, { ombre: false });
      panneau(new THREE.MeshStandardMaterial({ map: texTriptyque(n), roughness: 0.16 }), w, 1.2, xw + 0.026, y, N1 + 1.5, 'E');
    }
    B(xw, yc - 0.6, xw + 0.07, yc + 0.6, N1 + 0.86, N1 + 0.88, M.alu, { ombre: false });
    B(xw, yc - 0.13, xw + 0.12, yc + 0.13, N1 + 2.32, N1 + 2.5, M.boitier);
    projecteur(3.75, yc, 'W');
  }
  // LE BUREAU DE L'ENSEIGNANT, à l'avant, côté fenêtres : son unité centrale et son écran noirs, son fauteuil
  {
    B(2.3, 0.75, 3.0, 2.15, N1 + 0.72, N1 + 0.745, P.plateau);
    B(2.32, 0.77, 2.98, 0.8, N1, N1 + 0.72, P.pietement); B(2.32, 2.1, 2.98, 2.13, N1, N1 + 0.72, P.pietement);
    C.ajouterBoite(2.3, -0.75, 3.0, -2.15, { y0: N1, y1: N1 + 0.76 });
    ordinateur(2.75, 1.45, 'E', 3);
    B(2.4, 1.9, 2.6, 2.1, N1 + 0.745, N1 + 1.17, M.noirMat);
    fauteuil(2.0, 1.45, 'E', { sortie: [2.0, 2.6], nom: 'le fauteuil du professeur' });
  }
  // LES TABLES DOUBLES (1,20 x 0,50, hêtre clair, piétement anthracite à patin) et leurs chaises de hêtre percé, face à
  // l'ouest : deux blocs de deux tables par rang, l'allée centrale de 80 cm ; cinq rangs entiers, puis les tables du bloc
  // sud seulement (au nord, le passage de la porte) — 24 tables, 48 places
  const tableDouble = (xc, yc) => {
    const x0 = xc - 0.25, x1 = xc + 0.25, y0 = yc - 0.6, y1 = yc + 0.6;
    B(x0, y0, x1, y1, N1 + 0.728, N1 + 0.75, P.plateau);
    B(x0, y0, x1, y1, N1 + 0.722, N1 + 0.728, P.chant, { ombre: false });
    for (const y of [y0 + 0.04, y1 - 0.04]) {
      B(xc - 0.215, y - 0.016, xc - 0.185, y + 0.016, N1, N1 + 0.722, P.pietement);
      B(xc + 0.185, y - 0.016, xc + 0.215, y + 0.016, N1, N1 + 0.722, P.pietement);
      B(xc - 0.24, y - 0.018, xc + 0.24, y + 0.018, N1, N1 + 0.03, P.pietement, { ombre: false });
      B(xc - 0.22, y - 0.012, xc + 0.22, y + 0.012, N1 + 0.69, N1 + 0.722, P.pietement, { ombre: false });
    }
    B(xc - 0.012, y0 + 0.05, xc + 0.012, y1 - 0.05, N1 + 0.66, N1 + 0.69, P.pietement, { ombre: false });
    C.ajouterBoite(x0, -y0, x1, -y1, { y0: N1, y1: N1 + 0.77 });
  };
  const _geoAssise = (() => { const g = new THREE.BoxGeometry(0.42, 0.016, 0.4, 4, 1, 1); return g; })();
  const _geoDos = (() => {
    const g = new THREE.PlaneGeometry(0.4, 0.3, 8, 1), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i); p.setZ(i, x * x * 0.9); }
    g.computeVertexNormals();
    return g;
  })();
  const _geoTube = new THREE.CylinderGeometry(0.009, 0.009, 1, 6);
  const chaiseHetre = (x, y, dir, sortie) => {
    const [fx, fz] = DIR[dir];
    const g = new THREE.Group(); g.position.set(x, N1, -y); g.rotation.y = Math.atan2(fx, fz); groupe.add(g);
    maille(_geoAssise, P.hetre, 0, 0.455, 0.02, 0, g);
    const d = maille(_geoDos, P.dossier, 0, 0.67, -0.19, 0, g); d.rotation.x = -0.12;
    for (const [px, pz] of [[-0.18, 0.17], [0.18, 0.17], [-0.18, -0.15], [0.18, -0.15]]) { const t = maille(_geoTube, P.chrome, px, 0.225, pz, 0, g); t.scale.y = 0.45; }
    for (const px of [-0.17, 0.17]) { const t = maille(_geoTube, P.chrome, px, 0.6, -0.175, 0, g); t.scale.y = 0.3; t.rotation.x = -0.12; }
    C.ajouterCercle(g.position.x, g.position.z, 0.2, { y0: N1, y1: N1 + 0.9 });
    sieges.push({ x: g.position.x + fx * 0.04, z: g.position.z + fz * 0.04, y: 0.47, fx, fz, sx: sortie[0], sz: -sortie[1], nom: 'la chaise', sol: N1 });
  };
  const ALLEE = 3.45;                                    // l'axe de l'allée centrale
  const rangs = [4.3, 5.55, 6.8, 8.05, 9.3, 10.55, 11.8];
  rangs.forEach((xr, i) => {
    const blocs = i < 5 ? [1.25, 2.45, 4.45, 5.65] : [1.25, 2.45];
    for (const yc of blocs) {
      tableDouble(xr, yc);
      for (const s of [-1, 1]) chaiseHetre(xr + 0.45, yc + s * 0.3, 'W', [xr + 0.45, ALLEE]);
    }
  });

  // =====================================================================
  //  LE BUREAU DE LA TRAVÉE 1 (la grande baie rouge ; photo 12 : un bureau allumé, quelqu'un à sa table — IMAGINÉ)
  // =====================================================================
  ch.plafond(0, 0, 1.59, 6.915, HS, 'dalles');
  dalle(0.8, 1.8, 'e1bureau'); dalle(0.8, 4.6, 'e1bureau');
  porte('x', Y_S, 0.85, { l: 0.93, etat: 'fermee', cote: 'S', nom: 'bureau (travée 1)' });
  plaque('Bureau', '', null, 1.5, Y_S + 0.063, 'N', 1.6);
  B(0.05, 0.9, 0.75, 2.3, N1 + 0.72, N1 + 0.745, P.plateau);
  B(0.07, 0.92, 0.73, 0.95, N1, N1 + 0.72, P.pietement); B(0.07, 2.25, 0.73, 2.28, N1, N1 + 0.72, P.pietement);
  C.ajouterBoite(0.05, -0.9, 0.75, -2.3, { y0: N1, y1: N1 + 0.76 });
  ordinateur(0.35, 1.6, 'E', 1);
  fauteuil(1.1, 1.6, 'W', { sortie: [1.1, 2.7], nom: 'le fauteuil du bureau' });
  B(0.0, 4.0, 0.45, 5.6, N1, N1 + 1.95, M.creme2 || M.blanc, { collision: true });
  radiateur(0.825, 0.0, 'N', 1.4, 0.1, 0.6);

  // =====================================================================
  //  LE MONDE SOLIDE : le plancher devant la porte de la Si 1.4 et sous l'alcôve, le dessous pour la caméra
  // =====================================================================
  C.sol(XF - 0.075, -12.6, 13.26, -(YO + 0.06), N1);
  C.ajouterBoite(XF - 0.075, -12.45, 13.26, -(YO + 0.06), { y0: N1 - 0.32, y1: N1 - 0.02, joueur: false });

  // =====================================================================
  //  LES ZONES (pièces) pour js/ecole_lumieres.js (en tête : le recoin passe avant la salle)
  // =====================================================================
  const zr = (x0, y0, x1, y1) => [x0, -y1, x1, -y0, 2.6];
  const env = (x, y) => ({ x, y: N1 + 1.6, z: -y });
  // (la carte de l'espace pause prise au milieu, loin de l'orange : près du mur du fond, elle teintait tout de pêche)
  const zones = [
    { id: 'e1pause', rects: [zr(XF, Y_S, XE, YO), zr(XR, YR, XE, Y_S)], voisines: ['e1salle', 'e1couloir', 'e1est', 'e1kahn'], env: env(9.6, 8.9) },
    { id: 'e1salle', rects: [zr(1.65, -0.2, 13.2, Y_S)], voisines: ['e1pause'], env: env(7.4, 3.45) },
    { id: 'e1bureau', rects: [zr(-0.3, -0.2, 1.65, Y_S)], voisines: ['e1couloir'], env: env(0.8, 3.4) },
  ];
  return { zones, sols };
}
