// =====================================================================
//  LE SOUS-SOL DE L'ÉCOLE IRIS (crochet de js/carte_ecole.js)
// =====================================================================
// RELEVÉ D'APRÈS LA VIDÉO DE HAYTHEM (references/ecole/video_sous_sol : 1000052359.mp4, 22 s tournées en portrait, et
// ses 67 images v_001 à v_067, une par tiers de seconde ; relevé du 09/10). Elle part du hall ouest : la main tire la
// barre inox de la porte grise « service (hall) » de la photo 06 (mêmes gonds au sud, même oculus cerclé de bois, même
// prise au ras de la plinthe de bois). Derrière, PAS de couloir : un palier au niveau 0 (le panneau jaune « 0 », un
// hublot opale, l'interrupteur à voyant vert), puis UNE LONGUE VOLÉE DROITE qui descend vers le nord le long du mitoyen —
// 17 contremarches de 18 cm, 16 marches de tôle larmée de 25,5 cm (comptées deux fois : les nez sur les images, les pas
// au son), garde-corps inox à quatre lisses côté vide, rampant blanc au-dessus. En bas, le hall du -1 continue vers le
// nord ; on passe à côté de sa porte grise (fermée dans la vidéo) pour prendre le long couloir étroit qui revient vers le
// sud, et sa première porte, à gauche, ouvre sur L'ESPACE PAUSE : grand carrelage beige, mur vert anis, mange-debout
// noirs, tabourets verts et noirs, baby-foot, trois distributeurs.
// Les longueurs « en profondeur » viennent d'une focale estimée (± 15 %) ; les largeurs (palier 1,40 ; volée 0,85 ;
// hall 2,15 ; couloir 0,92) et les 17 marches sont sûres. CE QUI N'EST PAS VU (le sud et l'ouest de l'espace pause,
// l'aile des distributeurs, le dedans du sas des toilettes et du local sombre, le fond du hall et du couloir) est
// IMAGINÉ, sobrement, dans le même style.
// (Relecture du 09/10 : la focale de la vidéo, recalée sur les 16 nez de la volée et sa largeur (v_010), vaut ≈ 1 200 px
// et non 1 475 — l'objectif ordinaire d'un téléphone, 49° de large. Les profondeurs relevées en sont plus courtes : le
// HALL DU -1 est presque carré (mur du fond à y 17,3 : vu du palier, v_010, on en voit le bas par l'ouverture ; v_026 à
// v_038 le montrent proche, la porte grise et le ressaut à leur place), le COULOIR s'arrête vers y 6,4 (v_048 : le
// caisson et la grille du fond à ≈ 7 m), et l'entrée de l'espace pause est dégagée sur trois mètres (v_059, v_060).)
//
// LE PLAN (repère de js/carte_ecole.js : x le long de la façade, y vers le fond ; dans le jeu X = x, Z = -y) :
//   le palier (niveau 0)       x 0-1,6      y 9,1-10,1    derrière la porte grise du hall ouest (x 1,675, y 9,575)
//   la volée                   x 0,40-1,25  y 10,1-14,18  nez du rang k en y 10,10 + 0,255 k, à -0,18 k (k = 0 … 16)
//   le hall du -1              x 0,40-2,42  y 14,18-17,3  plafond à 2,36 m ; « -1 », extincteur, consignes
//   le couloir                 x 1,50-2,42  y 6,4-14,18   0,92 m de large, plafond à 2,45 m, caisson et grille au fond
//   l'espace pause             x 2,55-12,9  y 11,6-15,8   et son aile x 5,0-12,9 y 6,5-11,6 ; dalles à 2,55 m
//   le sas des toilettes       x 10,55-12,9 y 13,65-14,95 deux portes crème à plaque rouge (fermées)
//   la grande salle S -1.14    x 2,55-15,2  y 15,95-25,5  derrière le mur vert (js/ecole_amphi.js : la vidéo officielle
//                                                         de visite, 2021 — comme l'aile et ses murs sud et ouest, 10/10)
// Le sol du sous-sol est à Y_SS = -3,06 (17 x 0,18).
//
// LES PIÈGES D'UN NIVEAU SOUS LE SOL (js/collisions.js : solEn rend le sol le plus haut qui ne dépasse pas les pieds de
// plus d'une marche, et 0 là où AUCUN sol ne couvre) :
//   1. des DALLES à 0 au-dessus de tout le sous-sol, sauf la trémie : sans elles, le joueur du rez-de-chaussée tomberait
//      sur la dalle du -1 (la plus haute sous ses pieds) ; et une dalle à Y_SS sous TOUT ce qu'on foule en bas ;
//   2. le carrelage du rez-de-chaussée coupé au droit du palier et de la trémie (js/carte_ecole.js RN), la trémie close
//      de murs pleins pour le joueur du rez-de-chaussée ;
//   3. les murs d'ici ont leurs plinthes (peintes, grises) au sol du -1 : `mur()` local, pas ch.mur ;
//   4. plafonds sans retombées jusqu'à la dalle du 1er ; sous la dalle du rez-de-chaussée, une boîte pour la caméra seule ;
//   5. lampes { base: Y_SS, cuire: false } (lumière cuite sur le sol du -1, pas sur le carrelage d'en haut) ;
//   6. les ZONES ont une hauteur MAXIMALE (r[5], js/ecole_lumieres.js zoneEn) et passent en tête de liste ;
//   7. 8. lumière cuite et ombre douce cuites propres au -1 (sur un rectangle à lui, R_SS) ;
//   9. le groupe n'est dessiné que si la caméra peut le voir (au -1, dans le hall ouest ou sur le palier) ;
//  10. sièges avec `sol: Y_SS` (js/ecole_etage1.js ne propose que ceux du niveau de Haythem) ;
//  11. portes automatiques qui regardent la hauteur de Haythem (js/ecole_portes.js maj) ;
//  12. LE « SOLEIL » (la lumière presque d'aplomb qui figure les plafonniers) traverserait le sol : une DALLE-BOÎTE sous le
//      carrelage du rez-de-chaussée porte ombre sur tout le -1 tant que Haythem est en haut ; quand il descend, elle
//      s'éteint, et avec elle les ombres du rez-de-chaussée (qui tomberaient au travers du sol), et le mobilier du -1
//      porte les siennes : en bas, la même lumière qu'en haut ;
//  13. pas d'ombres de contact au -1 (comme à l'étage) ; 14. l'étage reste caché en bas (rien à faire).
//
//   poserSousSol(ch, renderer, { RECT }) -> { zones, maj(dt, jeu), groupe, solsRDC }
//     (RECT : le rectangle cuit du rez-de-chaussée — le sol du palier, au niveau 0, en reçoit la lumière et l'ombre)
import * as THREE from 'three';
import { maille, boiteM, fusionnerLocal } from './ecole_portes.js';
import { canvasTex, nePasFusionner, normalesDepuisGrille, avecRelief } from './kit_decor.js';
import { texAffiche, texPictoExtincteur } from './ecole_matieres.js';
import { cuireLumiereSol } from './ecole_lumieres.js';
import { TELEPHONE } from './appareil.js';
import { poserAmphi, EMPRISE_AMPHI } from './ecole_amphi.js';

// ---- les hauteurs ----
export const Y_SS = -3.06;               // le sol du sous-sol (17 contremarches de 18 cm sous le palier)
const DALLE = -0.3;                      // le dessous de la dalle du rez-de-chaussée : les murs du -1 y montent
const H_HALL = Y_SS + 2.36;              // le plafond du hall du -1 (plâtre)
const H_COUL = Y_SS + 2.45;              // celui du couloir
const H_PAUSE = Y_SS + 2.55;             // les dalles de l'espace pause
const H_RET = Y_SS + 2.30;               // le dessous de ses retombées (la peinture verte s'arrête là)
const H_SAS = Y_SS + 2.42;
const H_PALIER = 2.5;                    // le plafond du palier
// ---- la volée (17 contremarches, 16 marches de tôle larmée) ----
const ESC = { x0: 0.40, x1: 1.25, y0: 10.10, G: 0.255, R: 0.18, n: 17 };
ESC.yPied = ESC.y0 + (ESC.n - 1) * ESC.G;                   // 14,18 : le pied de l'escalier
const nez = (k) => ESC.y0 + k * ESC.G;                       // le nez du rang k (k = 0 : le bord du palier)
// le RAMPANT au-dessus de la volée : parallèle, 2,20 m au-dessus des nez ; il bute sous la dalle du rez-de-chaussée
// (-0,30) en y 13,64, un plafond plat la suit jusqu'à la RETOMBÉE du pied (y 14,08-14,35, dessous à -0,78) — vue du
// palier, sa face blanche fait un bandeau d'un demi-mètre au-dessus de l'ouverture du hall (v_010, v_020)
const Y_RAMP1 = 13.64, Y_RET = 14.08;
const rampant = (y) => 2.2 - (y - ESC.y0) * ESC.R / ESC.G;
// ---- le plan ----
const X_MUR = 2.485, EP_MUR = 0.13;       // le mur entre couloir (et hall) et espace pause
const PORTE_PAUSE = 12.15, PORTE_HALL = 14.85, L_PORTE = 1.0;
const Y_FOND = 17.3;                      // le nu du mur du fond du hall du -1
const Y_COUL0 = 6.4;                      // le nu du mur du fond (sud) du couloir
const Y_EXT = 15.6;                       // l'extincteur du hall (mur ouest), entre le « -1 » et le fond
// le rectangle du sol cuit du -1 (lumière et ombre cuites, uv1 de 0 à 1, v = 1 au nord) ; jusqu'au fond de la grande
// salle S -1.14 (y 25,5) et à son mur est (x 15,2) — 10/10
const R_SS = { x0: 0, x1: 15.5, y0: 2.8, y1: 26.0 };
// la dalle du rez-de-chaussée au-dessus du -1 (la trémie et le palier exceptés) : pour la caméra et pour l'ombre
const DALLES_RDC = [[-0.3, 2.8, 13.2, 9.1], [1.6, 9.1, 13.2, 14.3], [-0.3, 14.3, 13.2, 20.75], EMPRISE_AMPHI];
const LED = new THREE.Color(0xf3f6f8);       // la lumière des LED du -1 (blanc neutre)

// =====================================================================
//  LES TEXTURES (dessinées : le sous-sol n'ajoute aucun fichier à charger)
// =====================================================================
const rgb = (r, g, b, a = 1) => `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a})`;
function graine(s) {
  let x = s >>> 0 || 1;
  return () => { x ^= x << 13; x >>>= 0; x ^= x >> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; };
}
const nuees = (g, w, h, r2, n, base, ecart, a = 0.3, rmin = 10, rmax = 60) => {
  for (let k = 0; k < n; k++) {
    const R = rmin + r2() * (rmax - rmin), x = r2() * w, y = r2() * h, d = (r2() - 0.5) * 2 * ecart;
    const gr = g.createRadialGradient(x, y, 0, x, y, R);
    gr.addColorStop(0, rgb(base[0] + d, base[1] + d, base[2] + d, a)); gr.addColorStop(1, rgb(base[0], base[1], base[2], 0));
    g.fillStyle = gr; g.fillRect(x - R, y - R, 2 * R, 2 * R);
  }
};
// LA TÔLE LARMÉE des marches (v_008 à v_030) : acier galvanisé gris moyen, terni, des taches noires (des chewing-gums)
// sur une marche sur deux ou trois. Une seule image pour toute la volée (0,85 x 3,4 m, UV du monde) : chaque marche en
// prend sa bande, les taches ne se répètent pas.
function texTole() {
  return canvasTex(256, 1024, (g, w, h) => {
    const r2 = graine(1717);
    // (relecture du 09/10 : #8b8a84 sortait moitié trop clair à côté de v_020 — la tôle est d'un gris moyen terne)
    g.fillStyle = '#6e6d68'; g.fillRect(0, 0, w, h);
    nuees(g, w, h, r2, 90, [110, 109, 104], 18, 0.35, 12, 70);
    // l'usure au milieu de la marche (plus claire) et la crasse sur les bords
    const gr = g.createLinearGradient(0, 0, w, 0);
    gr.addColorStop(0, 'rgba(60,58,52,0.35)'); gr.addColorStop(0.18, 'rgba(60,58,52,0)'); gr.addColorStop(0.5, 'rgba(190,188,180,0.12)');
    gr.addColorStop(0.82, 'rgba(60,58,52,0)'); gr.addColorStop(1, 'rgba(60,58,52,0.35)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    // les taches noires
    for (let k = 0; k < 15; k++) {
      const x = w * (0.2 + r2() * 0.6), y = r2() * h, r = 1.5 + r2() * 2.5;
      g.fillStyle = rgb(34, 33, 30, 0.85); g.beginPath(); g.ellipse(x, y, r * (1 + r2()), r, r2() * 3, 0, 7); g.fill();
    }
  }, [1 / 0.85, 1 / 3.4], false, 8);
}
// le relief de la tôle : des « grains de riz » en quinconce, orientés en croix (tuile de 10 cm)
function texGrains() {
  const t = canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    const p = w / 4;
    for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) {
      const x = (i + 0.5) * p, y = (j + 0.5) * p, a = (i + j) % 2 ? Math.PI / 4 : -Math.PI / 4;
      const gr = g.createRadialGradient(x, y, 0, x, y, p * 0.36);
      gr.addColorStop(0, '#fff'); gr.addColorStop(1, '#000');
      g.save(); g.translate(x, y); g.rotate(a); g.scale(1, 0.28); g.translate(-x, -y);
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, p * 0.36, 0, 7); g.fill(); g.restore();
    }
  }, [10, 10], false, 8);
  t.colorSpace = THREE.NoColorSpace;
  return t;
}
// LE BÉTON PEINT du palier (v_003, v_004) : gris taupe satiné, des traces de pas et des rayures. Tuile : 1 m.
function texBetonTaupe() {
  return canvasTex(256, 256, (g, w, h) => {
    const r2 = graine(2023);
    g.fillStyle = '#5e5a50'; g.fillRect(0, 0, w, h);
    nuees(g, w, h, r2, 60, [94, 90, 80], 12, 0.4, 10, 60);
    for (let k = 0; k < 40; k++) { g.strokeStyle = rgb(120, 116, 104, 0.25); g.lineWidth = 0.6; g.beginPath(); const x = r2() * w, y = r2() * h; g.moveTo(x, y); g.lineTo(x + (r2() - 0.5) * 40, y + (r2() - 0.5) * 12); g.stroke(); }
    for (let k = 0; k < 8; k++) { g.fillStyle = rgb(40, 38, 34, 0.5); g.beginPath(); g.arc(r2() * w, r2() * h, 1 + r2() * 2, 0, 7); g.fill(); }
  }, [1, 1], false, 8);
}
// LA RÉSINE GRISE du hall du -1 (v_030 à v_041) : gris moyen uni, satiné, à peine nuagé ; un joint de reprise. Tuile 2 m.
function texResine() {
  return canvasTex(512, 512, (g, w, h) => {
    const r2 = graine(3131);
    g.fillStyle = '#767a7b'; g.fillRect(0, 0, w, h);
    nuees(g, w, h, r2, 120, [118, 122, 123], 10, 0.35, 20, 110);
    for (let k = 0; k < 2500; k++) { const v = 120 + (r2() - 0.5) * 30; g.fillStyle = rgb(v, v, v - 2, 0.18); g.fillRect(r2() * w, r2() * h, 1.5, 1.5); }
  }, [0.5, 0.5], false, 8);
}
// UN CARRELAGE CARRÉ de 60 x 60 (tuile de dessin 1,2 m : quatre carreaux, chacun son ton) : `base` sa teinte, `joint`
function texCarreaux(base, joint, graineN, nuee = 8) {
  const W = TELEPHONE ? 256 : 512;
  return canvasTex(W, W, (g, w, h) => {
    const r2 = graine(graineN), c = w / 2, j = Math.max(1.2, w * 0.0035);
    for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) {
      const t = (r2() - 0.5) * nuee;
      g.fillStyle = rgb(base[0] + t, base[1] + t, base[2] + t); g.fillRect(a * c, b * c, c, c);
      g.save(); g.beginPath(); g.rect(a * c, b * c, c, c); g.clip();
      nuees(g, w, h, r2, 26, [base[0] + t, base[1] + t, base[2] + t], nuee * 0.8, 0.45, 8, c * 0.35);
      g.restore();
    }
    for (let k = 0; k < w * h / 60; k++) { const v = (r2() - 0.5) * 18; g.fillStyle = rgb(base[0] + v, base[1] + v, base[2] + v, 0.25); g.fillRect(r2() * w, r2() * h, 1.3, 1.3); }
    g.fillStyle = joint;
    for (let i = 0; i <= 2; i++) { g.fillRect(i * c - j / 2, 0, j, h); g.fillRect(0, i * c - j / 2, w, j); }
  }, [1 / 1.2, 1 / 1.2], false, 8);
}
let _normCarreaux = null;
function normalesCarreaux() {
  return _normCarreaux || (_normCarreaux = normalesDepuisGrille(256, 256, (g, w, h) => {
    const c = w / 2;
    for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) g.fillRect(a * c + 1.2, b * c + 1.2, c - 2.4, c - 2.4);
  }, 1.2, 1.0));
}
// UN PANNEAU D'ÉTAGE (v_004, v_012, v_013 ; « -1 » sur l'image 4K à 11 s) : carré jaune, le chiffre blanc arrondi
function texPanneauNiveau(txt) {
  return canvasTex(128, 128, (g, w, h) => {
    // (un léger dégradé, pas la demi-bande claire à bord franc qui coupait le panneau en deux)
    const dg = g.createLinearGradient(0, 0, 0, h); dg.addColorStop(0, '#e0b232'); dg.addColorStop(1, '#d6a826');
    g.fillStyle = dg; g.fillRect(0, 0, w, h);
    // (le chiffre de v_013 : un ovale haut et étroit, les deux tiers de la hauteur du panneau, un trait d'un huitième)
    g.fillStyle = '#ffffff'; g.font = '500 92px "Segoe UI", Arial, sans-serif';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.save(); g.translate(w / 2 + (txt.length > 1 ? -4 : 0), h / 2 + 6); g.scale(txt.length > 1 ? 0.78 : 0.86, 1.18); g.fillText(txt, 0, 0); g.restore();
  }, null, false, 4);
}
// LE TROMBINOSCOPE (v_065 à v_067) : seize médaillons ovales sur fond pêche, le titre en haut
function texTrombi() {
  return canvasTex(256, 342, (g, w, h) => {
    const r2 = graine(16);
    g.fillStyle = '#e3c493'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#7a4a22'; g.font = '700 18px "Segoe UI", sans-serif'; g.textAlign = 'center'; g.fillText('L\'ÉQUIPE IRIS', w / 2, 26);
    const peaux = ['#f1c9a5', '#d9a47c', '#a86f4a', '#7a4b31', '#e8b893'], cheveux = ['#2b1d14', '#5a3a22', '#141414', '#9a6a3a', '#3b2a20'];
    for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) {
      const x = 34 + i * 63, y = 72 + j * 70;
      g.fillStyle = '#f7ead2'; g.beginPath(); g.ellipse(x, y, 25, 30, 0, 0, 7); g.fill();
      g.strokeStyle = '#a0784a'; g.lineWidth = 2; g.stroke();
      g.save(); g.beginPath(); g.ellipse(x, y, 23, 28, 0, 0, 7); g.clip();
      g.fillStyle = ['#3d5a9e', '#6b6b6b', '#2f2f2f', '#8a3b3b', '#2e6b4a'][Math.floor(r2() * 5)]; g.fillRect(x - 25, y + 10, 50, 22);
      g.fillStyle = peaux[Math.floor(r2() * 5)]; g.beginPath(); g.ellipse(x, y - 2, 10, 13, 0, 0, 7); g.fill();
      g.fillStyle = cheveux[Math.floor(r2() * 5)]; g.beginPath(); g.ellipse(x, y - 10, 11, 7 + r2() * 4, 0, Math.PI, Math.PI * 2); g.fill();
      g.restore();
      g.fillStyle = '#7a4a22'; g.fillRect(x - 16, y + 34, 32, 3);
    }
  }, null, false, 4);
}
// LES TROIS DISTRIBUTEURS (v_065 à v_067). ① friandises : vitrine éclairée, six rangées de spirales et leurs paquets
function texFriandises() {
  return canvasTex(256, 512, (g, w, h) => {
    const r2 = graine(77);
    g.fillStyle = '#f3f5f6'; g.fillRect(0, 0, w, h);
    const couleurs = ['#d62c2c', '#f2b705', '#2a62b0', '#3e9b6b', '#7b2a6e', '#f08a24', '#5a3a22', '#e8e6e0'];
    for (let r = 0; r < 6; r++) {
      const y = 14 + r * 82;
      g.fillStyle = '#c9cdd0'; g.fillRect(0, y + 64, w, 8);                         // l'étagère
      for (let c = 0; c < 5; c++) {
        const x = 8 + c * 49, col = couleurs[Math.floor(r2() * couleurs.length)];
        g.fillStyle = col; g.fillRect(x, y + 6, 40, 56);
        g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(x + 4, y + 10, 32, 8);
        g.strokeStyle = 'rgba(80,80,80,0.6)'; g.lineWidth = 1.5;                   // la spirale devant
        for (let s = 0; s < 4; s++) { g.beginPath(); g.ellipse(x + 20, y + 30 + s * 9, 21, 4, 0, 0, Math.PI); g.stroke(); }
        g.fillStyle = '#ffffff'; g.fillRect(x + 10, y + 66, 20, 5);
      }
    }
  }, null, false, 4);
}
// ② boissons chaudes : caisse noire, grand écran (une tasse et le logo), la niche à gobelet
function texCafe() {
  return canvasTex(256, 512, (g, w, h) => {
    g.fillStyle = '#1b1c1d'; g.fillRect(0, 0, w, h);
    const e = g.createLinearGradient(0, 40, 0, 290); e.addColorStop(0, '#5a3a22'); e.addColorStop(1, '#1e120b');
    g.fillStyle = e; g.fillRect(24, 40, w - 48, 250);
    g.fillStyle = '#f4efe6'; g.beginPath(); g.ellipse(w / 2, 200, 48, 14, 0, 0, 7); g.fill();
    g.fillRect(w / 2 - 44, 150, 88, 52); g.fillStyle = '#6b3e1f'; g.beginPath(); g.ellipse(w / 2, 150, 44, 12, 0, 0, 7); g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = 3;
    for (const dx of [-16, 0, 16]) { g.beginPath(); g.moveTo(w / 2 + dx, 130); g.bezierCurveTo(w / 2 + dx - 10, 115, w / 2 + dx + 10, 100, w / 2 + dx, 85); g.stroke(); }
    g.fillStyle = '#ffffff'; g.font = '600 24px "Segoe UI", sans-serif'; g.textAlign = 'center'; g.fillText('Café · Thé · Chocolat', w / 2, 270);
    g.fillStyle = '#2b2c2e'; g.fillRect(24, 310, w - 48, 60);
    for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#3a3c3f' : '#45484c'; g.fillRect(32 + (i % 4) * 50, 318 + Math.floor(i / 4) * 26, 42, 20); }
    g.fillStyle = '#0c0c0c'; g.fillRect(70, 395, 116, 90);                              // la niche
    g.fillStyle = '#8a8d90'; g.fillRect(70, 478, 116, 7);
  }, null, false, 4);
}
// ③ boissons fraîches : vitrine éclairée de vert, les bouteilles et les canettes sur leurs rails
function texFrais() {
  return canvasTex(256, 512, (g, w, h) => {
    const r2 = graine(303);
    const f = g.createLinearGradient(0, 0, w, 0); f.addColorStop(0, '#7fd08a'); f.addColorStop(0.5, '#b6f0b8'); f.addColorStop(1, '#7fd08a');
    g.fillStyle = f; g.fillRect(0, 0, w, h);
    const cols = ['#d62c2c', '#2a62b0', '#f2b705', '#e8e6e0', '#1a1a1a', '#3e9b6b', '#f08a24'];
    for (let r = 0; r < 6; r++) {
      const y = 20 + r * 80;
      g.fillStyle = 'rgba(40,60,40,0.45)'; g.fillRect(0, y + 66, w, 6);
      for (let c = 0; c < 7; c++) {
        const x = 12 + c * 34, col = cols[Math.floor(r2() * cols.length)], haute = r2() < 0.5;
        g.fillStyle = col; g.fillRect(x, y + (haute ? 8 : 26), 22, haute ? 58 : 40);
        if (haute) g.fillRect(x + 7, y, 8, 10);
        g.fillStyle = 'rgba(255,255,255,0.4)'; g.fillRect(x + 3, y + (haute ? 12 : 30), 4, haute ? 46 : 30);
      }
    }
  }, null, false, 4);
}
// L'AFFICHE JAUNE ET NOIRE « 100 % … » du retour, à droite de l'entrée (v_058, v_059)
function texAffiche100() {
  return canvasTex(256, 362, (g, w, h) => {
    g.fillStyle = '#f2c500'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#111111'; g.fillRect(0, h * 0.62, w, h * 0.38);
    g.font = '900 78px "Segoe UI", Arial, sans-serif'; g.textAlign = 'center'; g.fillText('100 %', w / 2, 120);
    g.font = '800 26px "Segoe UI", sans-serif'; g.fillText('ALTERNANCE', w / 2, 168); g.fillText('& EMPLOI', w / 2, 198);
    g.fillStyle = '#f2c500'; g.font = '600 18px "Segoe UI", sans-serif';
    g.fillText('Nos étudiants en entreprise', w / 2, h * 0.72); g.fillText('dès la rentrée', w / 2, h * 0.79);
    g.font = '600 30px "Century Gothic", "Segoe UI", sans-serif'; g.fillStyle = '#ffffff'; g.fillText('iris', w / 2, h * 0.93);
  }, null, false, 4);
}
// L'AFFICHETTE QR (A5 blanche) et la FICHE BLEUE (A4, trois pavés bleu foncé) des portes grises (v_041, v_043, v_053)
function texQR(graineN = 1) {
  return canvasTex(128, 180, (g, w, h) => {
    const r2 = graine(graineN * 31);
    g.fillStyle = '#fbfbf8'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#333'; g.fillRect(14, 14, 100, 6); g.fillRect(24, 26, 80, 4);
    const x0 = 29, y0 = 52, c = 5;
    for (let j = 0; j < 14; j++) for (let i = 0; i < 14; i++) if (r2() < 0.5) g.fillRect(x0 + i * c, y0 + j * c, c, c);
    for (const [a, b] of [[0, 0], [9, 0], [0, 9]]) { g.fillRect(x0 + a * c, y0 + b * c, 5 * c, 5 * c); g.fillStyle = '#fbfbf8'; g.fillRect(x0 + a * c + c, y0 + b * c + c, 3 * c, 3 * c); g.fillStyle = '#333'; g.fillRect(x0 + a * c + 2 * c, y0 + b * c + 2 * c, c, c); }
    g.fillRect(20, 140, 88, 4); g.fillRect(30, 150, 68, 4);
  }, null, false, 2);
}
function texFicheBleue() {
  return canvasTex(256, 362, (g, w, h) => {
    g.fillStyle = '#f7f8fb'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#2b4c9b'; g.fillRect(16, 16, 120, 14); g.fillStyle = '#9aa7c0'; g.fillRect(16, 38, 200, 6); g.fillRect(16, 50, 170, 6);
    for (let i = 0; i < 3; i++) { g.fillStyle = '#1f3a7a'; g.fillRect(16 + i * 78, 100, 66, 50); g.fillStyle = '#ffffff'; g.fillRect(24 + i * 78, 112, 50, 5); g.fillRect(24 + i * 78, 124, 40, 5); }
    g.fillStyle = '#9aa0a6'; for (let y = 180; y < h - 40; y += 14) g.fillRect(16, y, 120 + (y * 7) % 90, 5);
    g.fillStyle = '#2b4c9b'; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(40 + i * 56, h - 22, 8, 0, 7); g.fill(); }
  }, null, false, 4);
}
// LES CASIERS BLANCS de la niche (v_066) : deux colonnes de trois cubes, une ouverture ronde chacun
function texCasiers() {
  return canvasTex(128, 192, (g, w, h) => {
    g.fillStyle = '#f2f1ec'; g.fillRect(0, 0, w, h);
    for (let j = 0; j < 3; j++) for (let i = 0; i < 2; i++) {
      const x = i * w / 2, y = j * h / 3;
      g.strokeStyle = '#c8c7c1'; g.lineWidth = 2; g.strokeRect(x + 2, y + 2, w / 2 - 4, h / 3 - 4);
      const gr = g.createRadialGradient(x + w / 4, y + h / 6, 2, x + w / 4, y + h / 6, 20);
      gr.addColorStop(0, '#5d5c58'); gr.addColorStop(1, '#8e8d88');
      g.fillStyle = gr; g.beginPath(); g.arc(x + w / 4, y + h / 6, 18, 0, 7); g.fill();
    }
  }, null, false, 2);
}
// LE TERRAIN DU BABY-FOOT : feutre vert, lignes blanches
function texBabyTerrain() {
  return canvasTex(256, 128, (g, w, h) => {
    g.fillStyle = '#2f7d3b'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'; g.fillRect(i * w / 8, 0, w / 8, h); }
    g.strokeStyle = 'rgba(255,255,255,0.85)'; g.lineWidth = 2;
    g.strokeRect(4, 4, w - 8, h - 8); g.beginPath(); g.moveTo(w / 2, 4); g.lineTo(w / 2, h - 4); g.stroke();
    g.beginPath(); g.arc(w / 2, h / 2, 16, 0, 7); g.stroke();
    g.strokeRect(4, h / 2 - 22, 22, 44); g.strokeRect(w - 26, h / 2 - 22, 22, 44);
  }, null, false, 4);
}
// LA GRILLE DE VENTILATION à persiennes du coin nord-est (v_064, v_065) : gris-vert
function texPersiennes() {
  return canvasTex(128, 80, (g, w, h) => {
    g.fillStyle = '#9da397'; g.fillRect(0, 0, w, h);
    for (let y = 8; y < h - 6; y += 6) { g.fillStyle = '#5f6559'; g.fillRect(6, y, w - 12, 2.5); g.fillStyle = '#c4c9bd'; g.fillRect(6, y + 2.5, w - 12, 1); }
    g.strokeStyle = '#7d8377'; g.lineWidth = 4; g.strokeRect(2, 2, w - 4, h - 4);
  }, null, false, 2);
}
// LES PETITS CADRES au-dessus de la tablette (v_065) : la plaque noire, l'écusson, la photo de promo
function texCadre(sorte) {
  return canvasTex(128, 96, (g, w, h) => {
    if (sorte === 0) { g.fillStyle = '#151515'; g.fillRect(0, 0, w, h); g.fillStyle = '#d8c48a'; g.font = '600 13px "Segoe UI", sans-serif'; g.textAlign = 'center'; g.fillText('PROMOTION', w / 2, 40); g.fillText('2025', w / 2, 60); return; }
    if (sorte === 1) { g.fillStyle = '#f4f2ec'; g.fillRect(0, 0, w, h); g.fillStyle = '#1f3e8a'; g.beginPath(); g.moveTo(44, 14); g.lineTo(84, 14); g.lineTo(84, 52); g.quadraticCurveTo(84, 76, 64, 84); g.quadraticCurveTo(44, 76, 44, 52); g.closePath(); g.fill(); g.fillStyle = '#f2b705'; g.fillRect(58, 26, 12, 40); return; }
    const d = g.createLinearGradient(0, 0, 0, h); d.addColorStop(0, '#8db3d9'); d.addColorStop(1, '#d9cbb0'); g.fillStyle = d; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 9; i++) { g.fillStyle = ['#2b2b2b', '#5a3a22', '#7a4b31'][i % 3]; g.beginPath(); g.arc(14 + i * 12.5, 52, 6, 0, 7); g.fill(); g.fillRect(8 + i * 12.5, 58, 12, 30); }
  }, null, false, 2);
}
// L'AFFICHE BORDEAUX AU QR à côté de la cloison vitrée (v_063)
function texBordeaux() {
  return canvasTex(128, 180, (g, w, h) => {
    g.fillStyle = '#f3ece8'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#7a1f2e'; g.fillRect(0, 0, w, 74);
    g.fillStyle = '#ffffff'; g.font = '700 14px "Segoe UI", sans-serif'; g.textAlign = 'center'; g.fillText('JOURNÉE', w / 2, 30); g.fillText('PORTES OUVERTES', w / 2, 50);
    g.fillStyle = '#7a1f2e'; g.fillRect(40, 92, 48, 48); g.fillStyle = '#f3ece8';
    for (let i = 0; i < 16; i++) g.fillRect(44 + (i % 4) * 11, 96 + Math.floor(i / 4) * 11, (i * 7) % 3 ? 6 : 0, 6);
    g.fillStyle = '#7a1f2e'; g.fillRect(24, 154, 80, 5);
  }, null, false, 2);
}
// LE VERRE DÉPOLI des cloisons du mur vert (v_062 à v_064) : gris bleuté, plus clair en haut (la lumière d'à côté),
// quelques taches plus claires — un aplat blanc et lumineux le faisait passer pour un panneau peint
function texDepoli() {
  return canvasTex(64, 256, (g, w, h) => {
    const r2 = graine(4242);
    const gr = g.createLinearGradient(0, h, 0, 0);
    gr.addColorStop(0, '#b9c3c4'); gr.addColorStop(0.55, '#d3dad9'); gr.addColorStop(1, '#e4e9e7');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    nuees(g, w, h, r2, 14, [226, 232, 230], 8, 0.35, 8, 30);
    for (let k = 0; k < 600; k++) { const v = 200 + (r2() - 0.5) * 30; g.fillStyle = rgb(v, v + 4, v + 4, 0.12); g.fillRect(r2() * w, r2() * h, 1, 1); }
  }, [1, 1 / 2.1], false, 4);
}
// LA CONSIGNE DU HALL (v_037 à v_039) : un protège-document, une fiche vert pâle
function texConsigneVerte() {
  return canvasTex(64, 150, (g, w, h) => {
    g.fillStyle = '#c9d8c4'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#4b6b46'; g.fillRect(6, 8, w - 12, 10);
    g.fillStyle = '#7d9178'; for (let y = 28; y < h - 10; y += 9) g.fillRect(6, y, w - 18 - (y % 3) * 4, 3);
  }, null, false, 2);
}

// =====================================================================
//  LES OUTILS DU SOUS-SOL
// =====================================================================
const ROT = { S: 0, N: Math.PI, E: Math.PI / 2, W: -Math.PI / 2 };
const DIR = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };     // (en monde)
// UNE BOÎTE EN COORDONNÉES DU MONDE, UV en mètres du monde (comme js/ecole_etage1.js) : les marches de tôle prennent
// chacune leur bande de la même image
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
// UN SOL PLAT à la hauteur h : des rectangles du plan, UV en mètres (u = x, v = y), uv1 de 0 à 1 sur le rectangle R
function geoSolNiveau(rects, h, R) {
  const pos = [], nor = [], uv = [], uv1 = [], idx = [];
  const W = R.x1 - R.x0, L = R.y1 - R.y0;
  for (const [x0, y0, x1, y1] of rects) {
    const b = pos.length / 3;
    for (const [x, y] of [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]) {
      pos.push(x, h, -y); nor.push(0, 1, 0); uv.push(x, y); uv1.push((x - R.x0) / W, (y - R.y0) / L);
    }
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
// UN TUBE droit de A à B (points du MONDE), rayon r
const _haut = new THREE.Vector3(0, 1, 0);
function tube(parent, mat, a, b, r, seg = 10, ombre = true) {
  const d = new THREE.Vector3().subVectors(b, a), L = d.length();
  const m = maille(new THREE.CylinderGeometry(r, r, L, seg), mat, (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2, 0, parent, { ombre });
  m.quaternion.setFromUnitVectors(_haut, d.normalize());
  return m;
}
const P3 = (x, h, y) => new THREE.Vector3(x, h, -y);     // un point du plan (x, y) à la hauteur h, en monde

export function poserSousSol(ch, renderer = null, { RECT = { x0: -0.6, x1: 20.4, y0: -0.6, y1: 21.0 } } = {}) {
  const { C, M } = ch, t0 = performance.now();
  const groupe = new THREE.Group(); groupe.name = 'sous-sol';
  ch.scene.add(groupe);
  // (le décor fixe du -1 dans un sous-groupe, cousu à la fin ; les portes automatiques à côté, qui tournent)
  const fixe = new THREE.Group(); fixe.name = 'sous-sol (fixe)'; groupe.add(fixe);
  const decor0 = ch.decor, portes0 = ch.portes.decor;

  // ---- les matières du sous-sol ----
  const std = (o) => new THREE.MeshStandardMaterial(o);
  const nommer = (m, n) => { m.name = n; return m; };
  const X = {
    tole: nommer(std({ map: texTole(), roughness: 0.56, metalness: 0.45 }), 'tôle larmée'),
    // (le garde-corps est d'un gris d'acier satiné, terni — v_009 à v_036 ; plus clair, il sortait crème)
    inox: nommer(std({ color: 0xa19f98, roughness: 0.34, metalness: 0.55 }), 'garde-corps inox terni'),
    limon: std({ color: 0x77766f, roughness: 0.5, metalness: 0.5 }),
    plintheGrise: nommer(std({ color: 0x3d3c38, roughness: 0.6 }), 'plinthe peinte gris foncé'),
    plintheSalle: std({ color: 0x6e6f6a, roughness: 0.55 }),
    vert: nommer(std({ color: 0xa8c34a, roughness: 0.82 }), 'peinture vert anis'),
    noir: nommer(std({ color: 0x1c1c1a, roughness: 0.62 }), 'mobilier noir mat'),
    plateauNoir: std({ color: 0x1e1e1c, roughness: 0.38 }),
    tolix: nommer(std({ color: 0x3f7f3a, roughness: 0.3, metalness: 0.45 }), 'tabouret Tolix vert'),
    tablette: std({ color: 0xb1aea6, roughness: 0.42 }),
    acierGris: std({ color: 0x8e8f8c, roughness: 0.45, metalness: 0.5 }),
    bois: std({ color: 0xc9b08a, roughness: 0.5 }),
    pareChoc: std({ color: 0xd0502a, roughness: 0.45 }),
    chrome: std({ color: 0xd4d7da, roughness: 0.16, metalness: 0.78 }),
    bleuPoubelle: std({ color: 0x23306e, roughness: 0.5 }),
    grisPoubelle: std({ color: 0x8c8d8a, roughness: 0.5 }),
    creme: std({ color: 0xe9e6d6, roughness: 0.5 }),
    porteCreme: std({ color: 0xe6dfcc, roughness: 0.45 }),
    // le verre DÉPOLI des cloisons du mur vert : on n'y voit rien, il luit à peine de la lumière d'à côté
    depoli: nommer(std({ map: texDepoli(), roughness: 0.2, metalness: 0.1, emissive: 0xdde7e2, emissiveIntensity: 0.12, envMapIntensity: 1.2 }), 'verre dépoli (opaque)'),
    sombre: std({ color: 0x2b2a26, roughness: 0.85 }),
    caisse: std({ color: 0x1d1d1c, roughness: 0.4, metalness: 0.3 }),
    montant: std({ color: 0x9a9a96, roughness: 0.4, metalness: 0.5 }),
    rouge: std({ color: 0xb8322c, roughness: 0.45 }),
    rougePlaque: std({ color: 0xc0282c, roughness: 0.45 }),
    blancMat: std({ color: 0xf2f1ec, roughness: 0.55 }),
    feutre: std({ map: texBabyTerrain(), roughness: 0.9 }),
    bleuJoueur: std({ color: 0x2a62b0, roughness: 0.4 }),
    rougeJoueur: std({ color: 0xc8262c, roughness: 0.4 }),
    microOndes: std({ color: 0xe9e9e6, roughness: 0.35 }),
    vitreNoire: std({ color: 0x151719, roughness: 0.1, metalness: 0.4 }),
  };
  // (ce qui ÉCLAIRE : au-delà de 1, le bloom les fait briller)
  const L_ = {
    plafonnier: nommer(new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff4e4).multiplyScalar(4.2) }), 'plafonnier rond allumé'),
    voyant: new THREE.MeshBasicMaterial({ color: new THREE.Color(0.2, 2.2, 0.5) }),
    bloc: new THREE.MeshBasicMaterial({ color: new THREE.Color(0xf4f8fa).multiplyScalar(2.4) }),
    friandises: new THREE.MeshBasicMaterial({ map: texFriandises(), color: new THREE.Color(1.15, 1.15, 1.15) }),
    cafe: new THREE.MeshBasicMaterial({ map: texCafe(), color: new THREE.Color(1.05, 1.05, 1.05) }),
    frais: new THREE.MeshBasicMaterial({ map: texFrais(), color: new THREE.Color(1.1, 1.1, 1.1) }),
  };
  // LES SOLS du -1 : chacun sa matière, une même lumière cuite et une même ombre douce (uv1 sur R_SS) ; des rugosités
  // à elles (l'optimisation du décor ne doit les confondre avec rien)
  const SOL = {
    hall: nommer(std({ map: texResine(), roughness: 0.43 }), 'résine grise du hall du -1'),
    couloir: nommer(std({ map: texCarreaux([88, 89, 88], '#3f4040', 909, 6), roughness: 0.47 }), 'carreaux gris foncé du couloir'),
    // (relecture du 09/10 : #c6bfa6 sortait presque blanc sous les plafonniers ; mesuré sur v_063, le carrelage est d'un
    // tiers plus sombre que les murs)
    pause: nommer(std({ map: texCarreaux([150, 145, 127], '#827d72', 512, 14), roughness: 0.33 }), 'carrelage beige 60x60'),
  };
  for (const m of [SOL.couloir, SOL.pause]) avecRelief(m, normalesCarreaux(), 0.35);
  const solsSS = Object.values(SOL);
  // le sol du PALIER (niveau 0) : béton peint taupe, avec la lumière et l'ombre cuites du rez-de-chaussée (js/carte_ecole.js)
  const matPalier = nommer(std({ map: texBetonTaupe(), roughness: 0.51 }), 'béton peint du palier');
  X.tole.bumpMap = texGrains(); X.tole.bumpScale = 2.0;
  for (const m of [X.tole, X.inox, X.chrome]) m.envMapIntensity = 1.0;
  // LES PLAFONDS DU -1 sont blancs sous les LED (v_027 à v_067 : bien plus clairs que ceux du rez-de-chaussée, qui ne
  // voient que le rebond des plafonniers chauds) : les mêmes matières, d'un rebond plus fort. Plafonds et murs y
  // tirent un rien vers le froid (relecture du 09/10 : sous le « soleil » et l'hémisphère du rez-de-chaussée, légèrement
  // chauds, le blanc du -1 sortait beige ; la vidéo le montre d'un blanc neutre)
  const FROID = new THREE.Color(0.96, 0.99, 1.03);
  const plafondsSS = new Map();
  for (const [m, k] of [[M.platre, 0.3], [M.dalles, 0.3], [M.blanc, null], [M.porte, null]]) {
    const c = m.clone(); if (k !== null) c.emissiveIntensity = k; c.color.multiply(FROID); c.name = m.name + ' (sous-sol)'; plafondsSS.set(m, c);
  }
  // (les huisseries des portes du -1 sont peintes en blanc, v_041 à v_055 — celles du rez-de-chaussée, crème)
  { const c = M.huisserie.clone(); c.color.set(0xe2e5e5); c.name = 'huisserie blanche (sous-sol)'; plafondsSS.set(M.huisserie, c); }

  const lampes = [];                 // les lampes du -1 (cuites sur son sol)
  const sieges = [];
  let ombrants = [];                 // ce qui porte ombre quand Haythem est en bas

  // UNE BOÎTE (plan, hauteurs absolues) dans le groupe courant ; `monde` : UV du monde (tôle)
  const B = (x0, y0, x1, y1, h0, h1, mat, { ombre = true, collision = false, camera = true, parent = null, monde = false } = {}) => {
    const par = parent || ch.decor;
    let m;
    if (monde) {
      m = new THREE.Mesh(geoMonde(Math.min(x0, x1), Math.min(y0, y1), Math.max(x0, x1), Math.max(y0, y1), h0, h1), mat);
      m.castShadow = ombre; m.receiveShadow = true; par.add(m);
      if (collision) C.ajouterBoite(x0, -y0, x1, -y1, { y0: h0, y1: h1, camera });
    } else m = ch.boite(x0, y0, x1, y1, h0, h1, mat, { ombre, collision, camera, parent: par });
    return m;
  };
  // UN PANNEAU collé contre une face (`face` : la direction où il regarde) ; `ecart` le décolle du mur
  const panneau = (mat, w, h, x, y, hc, face, ecart = 0.004) => {
    const [dx, dz] = DIR[face];
    const p = ch.panneau(mat, w, h, x + dx * ecart, y - dz * ecart, hc, face, ch.decor);
    p.castShadow = false;
    return p;
  };
  // UN MUR DU SOUS-SOL de (x0, y0) à (x1, y1), parallèle à un axe, de `base` à `h` (hauteurs absolues), percé
  // d'ouvertures ; ses plinthes PEINTES (10 cm, `plinthe` : la matière) au pied des faces nommées
  const mur = ({ de, a, ep = 0.15, base = Y_SS, h = DALLE, mats = M.blanc, plinthes = [], plinthe = X.plintheGrise, ouvertures = [], camera = true }) => {
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
          const s = c === cotes[0] ? 1 : -1, v = s * (ep / 2 + 0.006);
          const [px0, py0, px1, py1] = R(v - 0.006, v + 0.006);
          B(px0, py0, px1, py1, base, base + 0.1, plinthe, { ombre: false });
        }
      }
    }
  };
  // UNE PLINTHE peinte seule (10 cm) au pied d'une face : axe 'x' = face est-ouest à y = ligne, 'y' = nord-sud à x = ligne
  const plinthe = (axe, ligne, a0, a1, s, base = Y_SS, mat = X.plintheGrise) => {
    const v0 = ligne, v1 = ligne + s * 0.012;
    if (axe === 'x') B(a0, Math.min(v0, v1), a1, Math.max(v0, v1), base, base + 0.1, mat, { ombre: false });
    else B(Math.min(v0, v1), a0, Math.max(v0, v1), a1, base, base + 0.1, mat, { ombre: false });
  };
  // LES LAMPES du -1 : cuites sur son sol (pas sur le carrelage d'en haut), leurs spots visent son sol ; des LED d'un
  // blanc neutre (relecture du 09/10 : sur toute la vidéo, murs blancs et sols gris — la lumière chaude des plafonniers
  // du rez-de-chaussée les sortait crème et brun)
  const opts = (o = {}) => ({ base: Y_SS, cuire: false, couleur: LED, ...o });
  const noter = () => lampes.push(ch.lampes[ch.lampes.length - 1]);
  const spot = (x, y, h, zone, o = {}) => { ch.spot(x, y, h, zone, opts(o)); noter(); };
  // LE PLAFONNIER ROND de l'espace pause (v_061 à v_067) : une galette LED de 36 cm, à fleur des dalles, son anneau blanc
  const _geoDisque = new THREE.CircleGeometry(0.18, 36), _geoAnneau = new THREE.CylinderGeometry(0.2, 0.2, 0.01, 36);
  const plafonnier = (x, y, h, zone) => {
    const a = maille(_geoAnneau, M.couronne, x, h - 0.005, -y, 0, ch.decor, { ombre: false, recoit: false });
    const d = maille(_geoDisque, L_.plafonnier, x, h - 0.011, -y, 0, ch.decor, { ombre: false, recoit: false });
    d.rotation.x = Math.PI / 2; void a;
    ch.halo(x, y, h, 1.5);
    const L = { x, z: -y, h, zone, type: 'spot', base: Y_SS, cuire: false, force: 1.05, couleur: LED };
    ch.lampes.push(L); lampes.push(L);
  };
  // UN SIÈGE (js/game.js) : le point d'assise, sa hauteur au-dessus du sol, la direction regardée, le point où l'on se
  // relève (en plan) ; `sol` : le -1
  const siege = (x, y, h, fx, fz, sx, sy, nom) => sieges.push({ x, z: -y, y: h, fx, fz, sx, sz: -sy, nom, sol: Y_SS });

  // =====================================================================
  //  LE PALIER (au niveau 0, dans le décor du rez-de-chaussée : on le voit du hall ouest, porte ouverte)
  // =====================================================================
  // v_003 à v_014 et la photo 06 (par l'oculus : le hublot en haut, le panneau jaune à droite). Le palier fait 1,6 x 1,0 m
  // entre le mur sud (au ras du jambage de la porte, js/ecole_pieces.js) et le bord de la volée ; au fond, le mitoyen. Au
  // nord de y = 10,1, le mur ouest AVANCE de 20 cm (l'arête verticale de v_004 à v_006, l'interrupteur juste après) et la
  // volée descend le long de lui ; plus bas encore, le mur du sous-sol, plus épais, fait le ressaut. Le panneau « 0 » est
  // en haut du mur du fond, près de cette arête (v_004, photo 06) ; le hublot opale est sur le mur qui avance, au-dessus
  // de l'interrupteur (v_014), sous le départ du rampant.
  // (Doute : le relevé de la vidéo met le « 0 » sur le mur sud et le hublot sur le mur ouest ; v_004, v_012, v_014 et
  // l'oculus de la photo 06 s'accordent mieux avec cette disposition-ci. On suit les images.)
  function construirePalier() {
    // le mitoyen et le mur ouest de la volée (doublé de 20 cm au nord du palier) ; pleins pour le joueur et la caméra
    B(-0.3, 9.1, 0.0, 10.1, 0, 3.25, M.blanc, { ombre: false, collision: true });
    B(-0.3, 10.1, 0.2, 13.6, -0.35, 3.25, M.blanc, { ombre: false, collision: true });
    // le mur est de la trémie (entre la volée et le hall ouest : au rez-de-chaussée, le dos du mur du hall ; il descend
    // jusqu'à la dalle, la cloison du sous-sol prend le relais en dessous)
    B(1.35, 10.1, 1.6, 13.6, DALLE, 3.25, M.blanc, { ombre: false, collision: true });
    // le SOL du palier : béton peint taupe (lumière et ombre cuites du rez-de-chaussée : uv1 sur RECT)
    const sol = new THREE.Mesh(geoSolNiveau([[0.0, 9.1, 1.6, 10.1]], 0, RECT), matPalier);
    sol.receiveShadow = true; sol.name = 'sol du palier'; nePasFusionner(sol); decor0.add(sol);
    // la barre de seuil de la porte et la cornière du bord du palier
    B(1.6, 9.12, 1.75, 10.03, 0, 0.006, M.inox, { ombre: false });
    B(ESC.x0, ESC.y0 - 0.045, ESC.x1, ESC.y0, -0.045, 0.004, M.inox, { ombre: false });
    // les plinthes peintes (gris foncé, 10 cm : v_003, v_004)
    plinthe('x', 9.1, 0.0, 1.6, 1, 0); plinthe('y', 0.0, 9.1, 10.1, 1, 0); plinthe('x', 10.1, 0.0, 0.2, -1, 0);
    // le plafond (plâtre, 2,50 m), et la petite retombée au-dessus du bord : le rampant part de 2,20 m
    ch.plafond(0.0, 9.1, 1.6, 10.1, H_PALIER, 'platre', { retombees: false });
    B(0.2, 10.1, 1.35, 10.14, rampant(ESC.y0), H_PALIER, M.platre, { ombre: false }).userData.horsAOSol = true;
    // LE PANNEAU « 0 » au mur du fond ; LE HUBLOT et, dessous, L'INTERRUPTEUR À VOYANT vert (minuterie) sur le mur qui
    // avance, juste après l'arête (v_014 : le hublot en haut à gauche de l'interrupteur, l'arête à gauche ; v_012 : le
    // « 0 » à gauche du hublot)
    panneau(new THREE.MeshStandardMaterial({ map: texPanneauNiveau('0'), roughness: 0.45 }), 0.2, 0.2, 0.0, 9.82, 1.8, 'E', 0.003);
    ch.opale(0.2, 10.27, 1.9, 'palierSS', { mur: 'E', r: 0.135, cuireForce: 0.7 });
    ch.lampes[ch.lampes.length - 1].x = 0.32;          // (la source de sa lumière cuite, un rien devant le mur)
    B(0.2, 10.38, 0.21, 10.46, 1.16, 1.24, X.blancMat, { ombre: false });
    const v = maille(new THREE.CircleGeometry(0.006, 10), L_.voyant, 0.2145, 1.215, -10.42, Math.PI / 2, decor0, { ombre: false, recoit: false }); void v;
    B(0.21, 10.4, 0.216, 10.44, 1.17, 1.215, X.blancMat, { ombre: false });
    // L'OCULUS de la porte du hall ouest est un verre clair (photo 06 : on y voit le hublot et le panneau jaune ; v_001 :
    // « le vitrage, lui, est clair ») — celui des autres portes grises reste sombre, leurs pièces derrière aussi
    const porteHall = decor0.getObjectByName('porte service (hall)');
    if (porteHall) porteHall.traverse((o) => { if (o.isMesh && o.material === M.vitreFente) o.material = M.verre; });
  }

  // =====================================================================
  //  LA VOLÉE (v_008 à v_037)
  // =====================================================================
  // Droite, sans palier intermédiaire : 16 marches de tôle larmée (0,85 x 0,255) entre deux limons d'acier, des
  // contremarches de tôle (on ne les voit pas en descendant). À gauche, le RESSAUT du mitoyen : un rebord blanc presque
  // horizontal, au ras du palier, qui descend jusqu'à -0,30 et passe sous le rampant (le mur du sous-sol, plus épais que
  // celui du rez-de-chaussée). À droite, le GARDE-CORPS inox : main courante de 42 mm à 0,95 m des nez, quatre lisses de
  // 18 mm, des montants plats tous les quatre girons (nez 3, 7, 11, 15) plus le départ et l'arrivée ; derrière, la
  // cloison blanche du couloir. Au-dessus, le RAMPANT blanc parallèle à la volée (2,20 m d'échappée), arrêté au pied par
  // une retombée.
  function construireEscalier() {
    const { x0, x1, G, R } = ESC;
    // les marches (dessus de tôle, UV du monde) et les contremarches
    // (côté mur, les marches vont jusqu'au nu du ressaut : on n'y voit pas de limon, v_008 à v_021)
    for (let k = 1; k <= 16; k++) {
      const ya = nez(k - 1), yb = nez(k), h = -R * k;
      B(x0, ya - 0.012, x1 - 0.03, yb, h - 0.035, h, X.tole, { monde: true });
      B(x0, ya - 0.012, x1 - 0.03, ya - 0.006, h - 0.035, h + R - 0.035, X.tole, { ombre: false, monde: true });
      // la caméra ne passe pas sous la volée
      C.ajouterBoite(x0, -ya, x1, -yb, { y0: Y_SS, y1: h - 0.02, joueur: false });
    }
    // la dernière contremarche, sur le sol du -1
    B(x0, ESC.yPied - 0.006, x1 - 0.03, ESC.yPied, Y_SS, Y_SS + R, X.tole, { ombre: false, monde: true });
    // le limon côté vide (fer en U, gris) : un plat incliné qui dépasse de 5 cm la ligne des nez
    const pente = Math.atan2(R, G), Lv = Math.hypot(ESC.yPied - ESC.y0, 16 * R);
    // (raccourci de 15 cm en haut : son bout ne dépasse pas du palier)
    const dl = 0.075, limon = maille(boiteM(0.03, 0.24, Lv - 2 * dl), X.limon, x1 - 0.015, -R * 8 + 0.05 - 0.12 / Math.cos(pente) - dl * Math.sin(pente),
      -((ESC.y0 + ESC.yPied) / 2 + dl * Math.cos(pente)), 0, ch.decor);
    limon.rotation.x = -pente;
    // LE RESSAUT du mitoyen (x 0,2-0,4) : le mur du sous-sol, du sol du -1 à son rebord (de 0 à -0,30), extrudé
    const sh = new THREE.Shape();
    sh.moveTo(0, Y_SS); sh.lineTo(0, 0); sh.lineTo(13.6 - ESC.y0, -0.3); sh.lineTo(14.3 - ESC.y0, -0.3); sh.lineTo(14.3 - ESC.y0, Y_SS); sh.closePath();
    const ressaut = maille(new THREE.ExtrudeGeometry(sh, { depth: 0.2, bevelEnabled: false }), M.blanc, 0.2, 0, -ESC.y0, Math.PI / 2, ch.decor, { ombre: false });
    void ressaut;
    // (le petit objet jaune posé sur le rebord, vers la 3e marche : v_008 à v_017)
    B(0.27, 10.86, 0.34, 10.92, -0.06, -0.035, std({ color: 0xe0b32a, roughness: 0.6 }), { ombre: false });
    // LA CLOISON entre la volée et le couloir (x 1,35-1,50), du sol du -1 à la dalle, jusqu'au pilier du pied
    // (elle borde aussi le couloir au sud du palier) ; LE MUR OUEST du hall
    mur({ de: [1.425, Y_COUL0 - 0.15], a: [1.425, ESC.yPied], mats: M.blanc, plinthes: ['E'] });
    plinthe('x', ESC.yPied, 1.35, 1.5, 1);
    // le monde solide : le garde-corps et la cloison à l'est, le ressaut et le mur à l'ouest (du sol du -1 au plafond
    // du rez-de-chaussée : au palier, le joueur d'en haut ne passe pas)
    C.ajouterBoite(x1, -ESC.y0, 1.5, -ESC.yPied, { y0: Y_SS, y1: 3.25 });
    C.ajouterBoite(0.0, -ESC.y0, x0, -14.3, { y0: Y_SS, y1: 3.25 });
    // (la volée n'a que 85 cm : deux guides en biais, invisibles, au bord du palier — qui arrive de travers glisse
    // dans la volée au lieu de buter contre le ressaut ou le mur est)
    const biais = (xa, ya, xb, yb) => C.ajouterBoiteOrientee((xa + xb) / 2, -(ya + yb) / 2, Math.hypot(xb - xa, yb - ya) / 2, 0.02, Math.atan2(-(yb - ya), xb - xa), { y0: 0, y1: 1.9, camera: false });
    biais(0.0, 9.74, 0.43, 10.13);
    biais(1.22, 10.13, 1.62, 10.0);
    // LE GARDE-CORPS (x 1,28) : départ au nez 0, arrivée au nez 16, montants aux nez 3, 7, 11, 15
    const xg = x1 + 0.03, hn = (y) => -R * (y - ESC.y0) / G;     // la ligne des nez
    const yA = ESC.y0 - 0.05, yB = ESC.yPied + 0.05;
    tube(ch.decor, X.inox, P3(xg, hn(yA) + 0.95, yA), P3(xg, hn(yB) + 0.95, yB), 0.021, 12);
    for (const k of [1, 2, 3, 4]) tube(ch.decor, X.inox, P3(xg, hn(yA) + 0.95 - k * 0.19, yA), P3(xg, hn(yB) + 0.95 - k * 0.19, yB), 0.009, 8);
    for (const k of [0, 3, 7, 11, 15, 16]) {
      const y = nez(k) - (k === 16 ? 0.03 : 0), h0 = -R * k - 0.25;
      B(xg - 0.005, y - 0.02, xg + 0.005, y + 0.02, h0, hn(y) + 0.95, X.inox);
    }
    // les pattes du garde-corps sur le limon
    for (const k of [0, 3, 7, 11, 15, 16]) B(x1 - 0.03, nez(k) - 0.03, xg, nez(k) + 0.01, -R * k - 0.2, -R * k - 0.12, X.limon, { ombre: false });
    // LE RAMPANT (plâtre blanc, tourné vers le bas) de y 10,1 à 13,64, de x 0,2 à 1,35 ; le plafond plat sous la dalle
    // jusqu'à la retombée du pied
    const Lr = Math.hypot(Y_RAMP1 - ESC.y0, rampant(ESC.y0) - rampant(Y_RAMP1));
    const rp = maille(new THREE.PlaneGeometry(1.15, Lr), M.platre, 0.775, (rampant(ESC.y0) + rampant(Y_RAMP1)) / 2, -(ESC.y0 + Y_RAMP1) / 2, 0, ch.decor, { ombre: false });
    rp.rotation.order = 'YXZ'; rp.rotation.x = Math.PI / 2 - pente; rp.userData.horsAOSol = true;
    B(0.2, Y_RAMP1 - 0.02, 1.35, Y_RET, DALLE, DALLE + 0.02, M.platre, { ombre: false });
    // (la retombée du pied : sous-face à -0,78, sur toute la largeur du hall, la poutre de v_035 ; sa face sud monte
    // jusqu'à la dalle : le bandeau blanc au-dessus de l'ouverture, vu de la volée)
    B(0.4, Y_RET, 2.42, 14.35, H_HALL - 0.08, DALLE, M.platre, { ombre: false });
    // LA CAMÉRA : le rampant en marches (son point le plus bas de chaque giron, jusqu'au plafond du rez-de-chaussée), le
    // plafond plat, et sous le palier, le plein
    for (let k = 0; k < 16; k++) {
      const ya = nez(k), yb = Math.min(nez(k + 1), Y_RAMP1);
      if (yb <= ya) break;
      C.plafond(0.2, -yb, 1.35, -ya, rampant(yb), 3.25 - rampant(yb));
    }
    C.plafond(0.2, -Y_RET, 1.35, -Y_RAMP1, DALLE, 3.25 - DALLE);
    C.ajouterBoite(0.0, -9.1, 1.6, -ESC.y0, { y0: Y_SS, y1: -0.02, joueur: false });
    // le panneau « -1 » au mur ouest du pied de l'escalier, le bloc de sortie au-dessus, son fourreau, deux étiquettes
    panneau(new THREE.MeshStandardMaterial({ map: texPanneauNiveau('-1'), roughness: 0.45 }), 0.2, 0.2, 0.4, 14.62, Y_SS + 1.6, 'E');
    ch.sortie(0.43, 14.62, Y_SS + 2.18, 'E');
    B(0.4, 14.62, 0.42, 14.64, Y_SS + 2.25, DALLE, X.blancMat, { ombre: false });
    for (const [y, h] of [[15.05, 1.45], [15.12, 1.45]]) B(0.4, y, 0.403, y + 0.05, Y_SS + h, Y_SS + h + 0.035, std({ color: 0xd9637a, roughness: 0.5 }), { ombre: false });
  }

  // =====================================================================
  //  LES MURS DU -1
  // =====================================================================
  function construireMurs() {
    const B0 = M.blanc;
    // le mur ouest du hall (le mitoyen, x 0,2-0,4) et son mur du fond
    mur({ de: [0.3, 14.3], a: [0.3, Y_FOND + 0.15], ep: 0.2, mats: B0, plinthes: ['E'] });
    mur({ de: [0.2, Y_FOND + 0.075], a: [2.55, Y_FOND + 0.075], mats: B0, plinthes: ['S'] });
    // LE MUR entre le couloir (et le hall) et l'espace pause, et ses deux portes grises (v_038 à v_058)
    mur({ de: [X_MUR, Y_COUL0 - 0.15], a: [X_MUR, Y_FOND + 0.15], ep: EP_MUR, mats: B0, plinthes: ['W'],
      ouvertures: [{ c: PORTE_PAUSE, l: L_PORTE + 0.02 }, { c: PORTE_HALL, l: L_PORTE + 0.02 }] });
    // (côté espace pause, ses plinthes grises à elle)
    for (const [a0, a1] of [[11.6, PORTE_PAUSE - 0.52], [PORTE_PAUSE + 0.52, PORTE_HALL - 0.52], [PORTE_HALL + 0.52, 15.8]]) plinthe('y', X_MUR + EP_MUR / 2, a0, a1, 1, Y_SS, X.plintheSalle);
    // le fond du couloir (au sud) et son caisson
    mur({ de: [1.35, Y_COUL0 - 0.075], a: [2.55, Y_COUL0 - 0.075], mats: B0, plinthes: ['N'] });
    // LE HALL : un petit ressaut au mur est, après la porte (v_037)
    B(2.27, 15.55, 2.42, 15.95, Y_SS, DALLE, B0, { ombre: false, collision: true });
    plinthe('x', 15.55, 2.27, 2.42, -1); plinthe('x', 15.95, 2.27, 2.42, 1); plinthe('y', 2.27, 15.55, 15.95, -1);
    // ---- L'ESPACE PAUSE ----
    const P = X.plintheSalle;
    // le retour sud, à droite de l'entrée (l'affiche « 100 % »), l'aile des distributeurs (ouest et sud)
    mur({ de: [2.42, 11.525], a: [5.0, 11.525], mats: B0, plinthes: ['N'], plinthe: P });
    mur({ de: [4.925, 6.35], a: [4.925, 11.6], mats: B0, plinthes: ['E'], plinthe: P });
    // (10/10, la vidéo officielle de 2021, q_0088-q_0097, q_0137-q_0142 : le mur ouest de l'aile est VERT ANIS jusqu'à
    // 2,30 m, comme le mur nord ; le mur sud porte une PORTE GRISE, x 9,7-10,6, fermée)
    B(5.0, 6.5, 5.005, 11.6, Y_SS + 0.1, H_RET, X.vert, { ombre: false });
    mur({ de: [4.85, 6.425], a: [13.05, 6.425], mats: B0, plinthes: ['N'], plinthe: P, ouvertures: [{ c: 10.15, l: 0.95 }] });
    // le mur est : la porte du local sombre (ouverte, v_065) ; le sas des toilettes au nord
    mur({ de: [12.975, 6.35], a: [12.975, 15.95], mats: B0, plinthes: ['W'], plinthe: P, ouvertures: [{ c: 9.65, l: 0.9 }] });
    mur({ de: [10.45, 13.6], a: [12.9, 13.6], ep: 0.1, mats: B0, plinthes: ['S', 'N'], plinthe: P });
    mur({ de: [10.45, 15.0], a: [12.9, 15.0], ep: 0.1, mats: B0, plinthes: ['S'], plinthe: P });
    mur({ de: [10.5, 14.95], a: [10.5, 15.95], ep: 0.1, mats: B0, plinthes: ['W'], plinthe: P });
    // LE MUR NORD, VERT ANIS (v_060 à v_064) : peint de vert jusqu'à 2,30 m, la retombée blanche au-dessus
    // (10/10 : percé de la porte de la grande salle S -1.14, js/ecole_amphi.js — son vantail x 9,35-10,25 ; le fixe
    // dépoli, x 8,85-9,35, est posé devant le mur)
    mur({ de: [2.42, 15.875], a: [13.05, 15.875], mats: B0, plinthes: ['S'], plinthe: P, ouvertures: [{ c: 9.8, l: 0.9, h: Y_SS + 2.06 }] });
    for (const [a, b] of [[2.55, 3.9], [5.5, 8.82]]) B(a, 15.795, b, 15.8, Y_SS + 0.1, H_RET, X.vert, { ombre: false });
  }

  // =====================================================================
  //  LES SOLS (et le monde solide des deux niveaux)
  // =====================================================================
  function construireSols() {
    const sol = (rects, mat, nom) => {
      const m = new THREE.Mesh(geoSolNiveau(rects, Y_SS, R_SS), mat);
      m.receiveShadow = true; m.castShadow = false; m.name = nom; m.userData.solSS = true; groupe.add(m);
    };
    sol([[0.4, 14.18, 2.42, Y_FOND], [0.4, 13.6, 1.35, 14.18]], SOL.hall, 'sol du hall du -1');
    sol([[1.5, Y_COUL0, 2.42, 14.18]], SOL.couloir, 'sol du couloir du -1');
    sol([[2.42, 11.6, 12.9, 13.55], [2.55, 13.55, 10.45, 15.8], [5.0, 6.5, 12.9, 11.6], [10.45, 13.65, 12.9, 14.95], [2.42, 14.3, 2.55, 15.4]], SOL.pause, 'sol de l\'espace pause');
    // les barres de seuil inox des deux portes
    for (const c of [PORTE_PAUSE, PORTE_HALL]) B(X_MUR - 0.07, c - 0.5, X_MUR + 0.07, c + 0.5, Y_SS, Y_SS + 0.006, M.inox, { ombre: false });
    // LE MONDE SOLIDE. Au rez-de-chaussée, des dalles à 0 au-dessus de tout le sous-sol SAUF la trémie (x 0-1,6, y 9,1-14,3) :
    // le palier y est une dalle à lui. En bas, une dalle à Y_SS sous tout. La volée : une rampe par le milieu des marches.
    C.sol(-0.3, -2.8, 13.2, -9.1, 0);
    C.sol(1.6, -9.1, 13.2, -14.3, 0);
    C.sol(-0.3, -14.3, 13.2, -20.75, 0);
    C.sol(0.0, -9.1, 1.6, -ESC.y0, 0);                                        // le palier
    C.rampe(ESC.x0, -(ESC.y0 + (ESC.n - 0.5) * ESC.G), ESC.x1, -(ESC.y0 - ESC.G / 2), 'z', -(ESC.y0 - ESC.G / 2), 0, -(ESC.y0 + (ESC.n - 0.5) * ESC.G), Y_SS);
    C.sol(0.4, -3.05, 13.05, -20.75, Y_SS);
    // (10/10 : la grande salle S -1.14, jusqu'à y 25,5 et x 15,2 — au-dessus, la salle David Clark, la cour, le C01 : le
    // joueur du rez-de-chaussée y marche à 0)
    const [ea, eb, ec, ed] = EMPRISE_AMPHI;
    C.sol(ea, -eb, ec, -ed, 0);
    C.sol(ea, -eb, ec, -ed, Y_SS);
    // pour la caméra seule : la dalle du rez-de-chaussée (au-dessus des plafonds du -1)
    for (const [a, b, c, d] of DALLES_RDC) C.ajouterBoite(a, -b, c, -d, { y0: DALLE, y1: -0.01, joueur: false });
  }

  // =====================================================================
  //  LES PLAFONDS ET LES LUMIÈRES
  // =====================================================================
  function construirePlafonds() {
    // le hall (plâtre, 2,36 m), deux spots ; le couloir (2,45 m), quatre spots, le caisson et la grille noire du fond
    // (v_036 à v_038 : un spot près de la volée, une poutre en travers, le second spot au fond, sous le bloc lumineux)
    ch.plafond(0.4, 14.18, 2.42, Y_FOND, H_HALL, 'platre', { retombees: false });
    for (const y of [14.95, 16.75]) spot(1.41, y, H_HALL, 'hallSS');
    B(0.4, 15.95, 2.42, 16.15, H_HALL - 0.12, H_HALL + 0.01, M.platre, { ombre: false });
    C.plafond(0.4, -16.15, 2.42, -15.95, H_HALL - 0.12, 0.13);
    ch.plafond(1.5, Y_COUL0, 2.42, 14.18, H_COUL, 'platre', { retombees: false });
    for (const y of [13.0, 11.2, 9.4, 7.6]) spot(1.96, y, H_COUL, 'couloirSS');
    B(1.5, Y_COUL0, 2.42, Y_COUL0 + 0.8, Y_SS + 2.1, H_COUL, M.platre, { ombre: false });
    B(1.6, Y_COUL0 + 0.795, 2.32, Y_COUL0 + 0.8, Y_SS + 2.18, Y_SS + 2.26, std({ color: 0x141414, roughness: 0.6 }), { ombre: false });
    C.plafond(1.5, -(Y_COUL0 + 0.8), 2.42, -Y_COUL0, Y_SS + 2.1, H_COUL - Y_SS - 2.1);
    // LE PLAFOND DE L'ESPACE PAUSE (v_061 à v_067) : dalles blanches de 60 x 60 sur ossature, à 2,55 m, coupées de
    // retombées de plâtre à 2,30 m (une bande parallèle au mur vert, à 1,3 m de lui ; une entre la salle et l'aile ; une
    // en travers ; le caisson au-dessus de la tablette) : des caissons, chacun ses plafonniers ronds
    ch.plafond(2.55, 11.6, 12.9, 13.55, H_PAUSE, 'dalles', { retombees: false });
    ch.plafond(2.55, 13.55, 10.45, 15.8, H_PAUSE, 'dalles', { retombees: false });
    ch.plafond(5.0, 6.5, 12.9, 11.6, H_PAUSE, 'dalles', { retombees: false });
    ch.plafond(10.55, 13.65, 12.9, 14.95, H_SAS, 'platre', { retombees: false });
    B(10.45, 13.6, 10.55, 15.0, H_SAS, H_PAUSE + 0.01, M.platre, { ombre: false });       // (le linteau du sas)
    const ret = (x0, y0, x1, y1) => {
      B(x0, y0, x1, y1, H_RET, H_PAUSE + 0.01, M.platre, { ombre: false });
      C.plafond(x0, -y1, x1, -y0, H_RET, H_PAUSE - H_RET + 0.3);
    };
    ret(2.55, 14.35, 10.45, 14.65);
    ret(5.0, 11.45, 12.9, 11.75);
    ret(7.7, 6.5, 8.0, 11.45); ret(7.7, 11.75, 8.0, 14.35);
    ret(12.4, 9.9, 12.9, 13.55);
    // la dalle qui manque au-dessus du baby-foot (le noir du plénum) et le détecteur rond près du sas
    B(9.75, 11.75, 10.35, 12.35, H_PAUSE - 0.003, H_PAUSE + 0.2, std({ color: 0x0d0d0c, roughness: 1 }), { ombre: false });
    maille(new THREE.CylinderGeometry(0.06, 0.07, 0.04, 18), X.blancMat, 10.0, H_PAUSE - 0.02, -13.2, 0, ch.decor, { ombre: false });
    // les plafonniers ronds (une douzaine)
    for (const [x, y] of [[3.8, 15.2], [6.2, 15.2], [9.3, 15.2], [3.8, 13.0], [6.2, 13.0], [9.3, 13.0], [11.3, 12.6],
      [6.4, 9.6], [9.4, 9.6], [11.3, 9.6], [6.4, 7.6], [9.4, 7.6], [11.3, 7.6]]) plafonnier(x, y, H_PAUSE, 'pauseSS');
    for (const x of [11.2, 12.3]) spot(x, 14.3, H_SAS, 'pauseSS', { force: 0.8 });
    // le bloc de sortie au-dessus de la porte de l'espace pause, côté salle ; au fond du hall, le bloc lumineux
    ch.sortie(X_MUR + 0.09, PORTE_PAUSE, Y_SS + 2.2, 'E');
    // (relecture du 09/10 : ce bloc-là est BLANC, une barre allumée sous le plafond — c_hall_full, v_036 —, pas le
    // pictogramme vert d'un bloc de sortie)
    B(1.25, Y_FOND - 0.06, 1.57, Y_FOND, Y_SS + 2.1, Y_SS + 2.2, X.blancMat, { ombre: false });
    B(1.27, Y_FOND - 0.064, 1.55, Y_FOND - 0.06, Y_SS + 2.125, Y_SS + 2.175, L_.bloc, { ombre: false });
  }

  // =====================================================================
  //  LES PORTES DU -1
  // =====================================================================
  // Les deux portes grises du mur de l'espace pause (v_038 à v_058) : le modèle de celle du hall ouest — stratifié gris
  // rainuré, oculus cerclé de bois, barre inox verticale, gonds au sud, ferme-porte à glissière côté hall (et couloir).
  // Elles s'ouvrent toutes seules ; celle du couloir, toujours vers la salle (dans le couloir de 0,92 m, son vantail le
  // barrerait — sur la vidéo, on la tire).
  function construirePortes() {
    const papiers = (P, cote) => {
      // l'affichette QR et la fiche bleue, côté couloir et hall (la face -z du vantail : l'ouest)
      const v = P.vantaux[0];
      // (entre l'oculus et les gonds : v_041, v_043)
      for (const [mat, w, h, x, y] of [[new THREE.MeshStandardMaterial({ map: texQR(cote), roughness: 0.6 }), 0.148, 0.21, 0.36, 1.72],
        [new THREE.MeshStandardMaterial({ map: texFicheBleue(), roughness: 0.6 }), 0.21, 0.297, 0.36, 1.33]]) {
        const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
        p.position.set(v.s * x, y, -0.024); p.rotation.y = Math.PI; p.castShadow = false; v.g.add(p);
      }
    };
    for (const [c, nom, libre] of [[PORTE_PAUSE, 'espace pause', 1], [PORTE_HALL, 'hall -1 → pause', 0]]) {
      const P = ch.porte('y', X_MUR, c, { l: L_PORTE, h: 2.04, ep: EP_MUR, base: Y_SS, modele: 'grise', poignee: 'tirant', etat: 'auto', cote: 'E', libre: libre || null, nom });
      papiers(P, c > 13 ? 2 : 1);
      // (par l'oculus, l'espace pause : v_043, v_055 — un verre clair)
      P.g.traverse((o) => { if (o.isMesh && o.material === M.vitreFente) o.material = M.verre; });
      // le ferme-porte à glissière, côté couloir : le rail et le boîtier, en haut de l'huisserie
      B(X_MUR - EP_MUR / 2 - 0.04, c - 0.45, X_MUR - EP_MUR / 2 - 0.01, c + 0.1, Y_SS + 2.09, Y_SS + 2.12, M.ferme, { ombre: false });
    }
    // LA PORTE GRISE G du mur sud de l'aile (vidéo officielle, q_0135, q_0137-q_0139 : à droite du trombinoscope de
    // 2021, oculus étroit cerclé de bois, ferme-porte côté salle) : fermée — ce qu'il y a derrière n'est pas vu
    ch.porte('x', 6.425, 10.15, { l: 0.93, h: 2.04, ep: 0.15, base: Y_SS, modele: 'grise', etat: 'fermee', cote: 'S', nom: 'G (aile du -1)' });
  }

  // =====================================================================
  //  LE HALL DU -1 ET LE COULOIR : l'extincteur, la consigne, l'interrupteur
  // =====================================================================
  function garnirHall() {
    // L'EXTINCTEUR à eau de 6 L (v_027 à v_037), son pictogramme au-dessus
    const ex = new THREE.Group(); ex.position.set(0.5, Y_SS, -Y_EXT); ch.decor.add(ex);
    maille(new THREE.CylinderGeometry(0.085, 0.085, 0.46, 18), X.rouge, 0, 1.13, 0, 0, ex);
    maille(new THREE.SphereGeometry(0.085, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2), X.rouge, 0, 1.36, 0, 0, ex);
    maille(new THREE.CylinderGeometry(0.03, 0.03, 0.08, 10), X.noir, 0, 1.47, 0, 0, ex);
    B(0.55, Y_EXT - 0.03, 0.6, Y_EXT + 0.03, Y_SS + 1.42, Y_SS + 1.5, X.noir);
    tube(ch.decor, X.noir, P3(0.6, Y_SS + 1.47, Y_EXT), P3(0.6, Y_SS + 0.98, Y_EXT + 0.05), 0.012, 8);
    panneau(new THREE.MeshStandardMaterial({ color: 0xf6f6f2, roughness: 0.6 }), 0.1, 0.16, 0.5 + 0.086, Y_EXT, Y_SS + 1.1, 'E', 0.001);
    C.ajouterCercle(0.52, -Y_EXT, 0.1, { y0: Y_SS + 0.8, y1: Y_SS + 1.55 });
    panneau(new THREE.MeshStandardMaterial({ map: texPictoExtincteur(), roughness: 0.6 }), 0.15, 0.15, 0.4, Y_EXT, Y_SS + 1.85, 'E');
    // LA CONSIGNE vert pâle sous son protège-document, l'interrupteur dessous (mur est, v_037 à v_039)
    panneau(new THREE.MeshStandardMaterial({ map: texConsigneVerte(), roughness: 0.3 }), 0.15, 0.35, X_MUR - EP_MUR / 2, Y_FOND - 0.45, Y_SS + 1.85, 'W', 0.006);
    B(X_MUR - EP_MUR / 2 - 0.01, Y_FOND - 0.49, X_MUR - EP_MUR / 2, Y_FOND - 0.41, Y_SS + 1.46, Y_SS + 1.54, X.blancMat, { ombre: false });
    // (deux affichettes A4 au mur du couloir, près de la porte de l'espace pause)
    panneau(new THREE.MeshStandardMaterial({ map: texAffiche('#2f6fb0', '#fbfbf8', 41), roughness: 0.7 }), 0.21, 0.297, 1.5, 12.9, Y_SS + 1.55, 'E');
  }

  // =====================================================================
  //  LE MOBILIER DE L'ESPACE PAUSE (v_055 à v_067)
  // =====================================================================
  const _geoPlateau = (r) => new THREE.CylinderGeometry(r, r, 0.025, 36);
  // LE MANGE-DEBOUT : plateau rond noir à 1,05 m ; `type` 'colonne' (colonne et embase de fonte : le long du mur vert) ou
  // 'trepied' (trois pieds d'acier écartés : l'îlot)
  const mangeDebout = (x, y, type = 'colonne', r = 0.3) => {
    const g = new THREE.Group(); g.position.set(x, Y_SS, -y); g.rotation.y = (x * 3.7 + y) % 6.28; ch.decor.add(g);
    maille(_geoPlateau(r), X.plateauNoir, 0, 1.04, 0, 0, g);
    if (type === 'colonne') {
      maille(new THREE.CylinderGeometry(0.03, 0.03, 1.01, 12), X.noir, 0, 0.525, 0, 0, g);
      maille(new THREE.CylinderGeometry(0.21, 0.23, 0.025, 28), X.noir, 0, 0.012, 0, 0, g);
      maille(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 14), X.noir, 0, 1.0, 0, 0, g);
      C.ajouterCercle(x, -y, 0.24, { y0: Y_SS, y1: Y_SS + 0.1 });
    } else {
      maille(new THREE.CylinderGeometry(0.025, 0.025, 0.55, 10), X.noir, 0, 0.75, 0, 0, g);
      for (let k = 0; k < 3; k++) {
        const a = k * Math.PI * 2 / 3, p = new THREE.Vector3(Math.cos(a) * 0.32, 0, Math.sin(a) * 0.32);
        tube(g, X.noir, new THREE.Vector3(0, 0.5, 0), p, 0.012, 8);
      }
    }
    C.ajouterCercle(x, -y, r, { y0: Y_SS + 0.95, y1: Y_SS + 1.07 });
    C.ajouterCercle(x, -y, 0.12, { y0: Y_SS, y1: Y_SS + 1.07 });
  };
  // LA GRANDE TABLE HAUTE RONDE (Ø 0,80) à piètement en X pliant et anneau repose-pieds (v_066, v_067)
  const grandeTable = (x, y) => {
    const g = new THREE.Group(); g.position.set(x, Y_SS, -y); g.rotation.y = 0.4 + x; ch.decor.add(g);
    maille(_geoPlateau(0.4), X.plateauNoir, 0, 1.04, 0, 0, g);
    for (const s of [-1, 1]) {
      tube(g, X.noir, new THREE.Vector3(-0.3, 0, s * 0.22), new THREE.Vector3(0.3, 1.02, s * 0.22), 0.013, 8);
      tube(g, X.noir, new THREE.Vector3(0.3, 0, s * 0.22), new THREE.Vector3(-0.3, 1.02, s * 0.22), 0.013, 8);
    }
    const anneau = maille(new THREE.TorusGeometry(0.2, 0.008, 6, 28), X.noir, 0, 0.32, 0, 0, g); anneau.rotation.x = Math.PI / 2;
    C.ajouterCercle(x, -y, 0.4, { y0: Y_SS + 0.95, y1: Y_SS + 1.07 });
    C.ajouterCercle(x, -y, 0.3, { y0: Y_SS, y1: Y_SS + 1.07 });
  };
  // LE TABOURET NOIR façon « Miura » (coque mate, assise à rebord arrière relevé, quatre pieds obliques, barre
  // repose-pieds) : tourné vers (fx, fz) — on s'y assoit
  const _assiseMiura = (() => {
    const s = new THREE.Shape();
    s.moveTo(-0.19, -0.16); s.lineTo(0.19, -0.16); s.quadraticCurveTo(0.21, 0.08, 0.16, 0.19); s.lineTo(-0.16, 0.19); s.quadraticCurveTo(-0.21, 0.08, -0.19, -0.16);
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 2, curveSegments: 6 });
    g.rotateX(Math.PI / 2); g.translate(0, 0.015, 0);
    return g;
  })();
  const tabouret = (x, y, fx, fz, sorte = 'miura') => {
    const g = new THREE.Group(); g.position.set(x, Y_SS, -y); g.rotation.y = Math.atan2(fx, fz); ch.decor.add(g);
    if (sorte === 'miura') {
      const a = maille(_assiseMiura, X.noir, 0, 0.77, 0.0, 0, g); a.rotation.x = -0.08;
      maille(boiteM(0.34, 0.07, 0.025), X.noir, 0, 0.82, -0.18, 0, g).rotation.x = 0.3;     // le rebord arrière
      for (const [px, pz] of [[-0.15, 0.13], [0.15, 0.13], [-0.15, -0.13], [0.15, -0.13]]) tube(g, X.noir, new THREE.Vector3(px * 0.55, 0.75, pz * 0.55), new THREE.Vector3(px * 1.45, 0, pz * 1.45), 0.014, 6);
      maille(boiteM(0.36, 0.02, 0.02), X.noir, 0, 0.3, 0.17, 0, g);
    } else {
      // LE TOLIX (v_055 à v_066) : assise carrée percée, quatre pieds évasés, entretoises, vert laqué
      maille(boiteM(0.36, 0.02, 0.36), X.tolix, 0, 0.75, 0, 0, g);
      maille(new THREE.CylinderGeometry(0.03, 0.03, 0.022, 14), X.noir, 0, 0.751, 0, 0, g);
      for (const [px, pz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
        const m = tube(g, X.tolix, new THREE.Vector3(px * 0.17, 0.745, pz * 0.17), new THREE.Vector3(px * 0.23, 0, pz * 0.23), 0.016, 6);
        m.scale.set(1.4, 1, 0.6);
      }
      for (const h of [0.28, 0.5]) for (const [ax, az, bx, bz] of [[-1, 1, 1, 1], [-1, -1, 1, -1], [-1, -1, -1, 1], [1, -1, 1, 1]]) {
        const k = (0.745 - h) / 0.745, e = 0.17 + 0.06 * k;
        tube(g, X.tolix, new THREE.Vector3(ax * e, h, az * e), new THREE.Vector3(bx * e, h, bz * e), 0.007, 6);
      }
    }
    C.ajouterCercle(x, -y, 0.2, { y0: Y_SS, y1: Y_SS + 0.82 });
    siege(x + fx * 0.02, y - fz * 0.02, sorte === 'miura' ? 0.79 : 0.76, fx, fz, x - fx * 0.55, y + fz * 0.55, sorte === 'miura' ? 'le tabouret' : 'le tabouret vert');
  };
  // des tabourets autour d'une table ronde (x, y), à `r` de son centre, aux angles donnés (en degrés, 0 = l'est du plan)
  const autour = (x, y, r, angles, sortes = []) => angles.forEach((a, i) => {
    const t = a * Math.PI / 180, px = x + Math.cos(t) * r, py = y + Math.sin(t) * r;
    const fx = (x - px) / r, fz = -(y - py) / r;            // (en monde : vers la table)
    tabouret(px, py, fx, fz, sortes[i] || 'miura');
  });
  // LE BABY-FOOT (v_064 à v_066) : caisse de bois clair, pare-chocs d'angle orange-rouge, huit barres chromées aux
  // poignées noires, les joueurs rouges et bleus, le feutre vert ; dans la longueur est-ouest (orientation à confirmer)
  const babyFoot = (x, y) => {
    const g = new THREE.Group(); g.position.set(x, Y_SS, -y); ch.decor.add(g);
    const Lx = 1.45, Lz = 0.75;
    maille(boiteM(Lx, 0.26, 0.04), X.bois, 0, 0.79, Lz / 2 - 0.02, 0, g); maille(boiteM(Lx, 0.26, 0.04), X.bois, 0, 0.79, -Lz / 2 + 0.02, 0, g);
    maille(boiteM(0.05, 0.26, Lz), X.bois, Lx / 2 - 0.025, 0.79, 0, 0, g); maille(boiteM(0.05, 0.26, Lz), X.bois, -Lx / 2 + 0.025, 0.79, 0, 0, g);
    const f = maille(new THREE.PlaneGeometry(Lx - 0.1, Lz - 0.08), X.feutre, 0, 0.7, 0, 0, g); f.rotation.x = -Math.PI / 2;
    maille(boiteM(Lx - 0.1, 0.02, Lz - 0.08), X.bois, 0, 0.685, 0, 0, g);
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      maille(boiteM(0.07, 0.28, 0.07), X.pareChoc, sx * (Lx / 2 - 0.02), 0.79, sz * (Lz / 2 - 0.02), 0, g);
      maille(boiteM(0.06, 0.66, 0.06), X.noir, sx * (Lx / 2 - 0.12), 0.33, sz * (Lz / 2 - 0.1), 0, g);
    }
    // les barres (en travers, le long de z), leurs poignées, les joueurs
    for (let i = 0; i < 8; i++) {
      const bx = -Lx / 2 + 0.16 + i * (Lx - 0.32) / 7, b = maille(new THREE.CylinderGeometry(0.008, 0.008, Lz + 0.3, 8), X.chrome, bx, 0.86, 0, 0, g, { ombre: false });
      b.rotation.x = Math.PI / 2;
      const cote = i % 2 ? 1 : -1, mp = maille(new THREE.CylinderGeometry(0.02, 0.02, 0.12, 10), X.noir, bx, 0.86, cote * (Lz / 2 + 0.2), 0, g);
      mp.rotation.x = Math.PI / 2;
      const n = [1, 2, 5, 3, 3, 5, 2, 1][i], mat = i % 2 ? X.bleuJoueur : X.rougeJoueur;
      for (let j = 0; j < n; j++) maille(boiteM(0.022, 0.11, 0.035), mat, bx, 0.8, -Lz / 2 + 0.06 + (j + 0.5) * (Lz - 0.12) / n, 0, g, { ombre: false });
    }
    C.ajouterBoite(x - Lx / 2, -(y - Lz / 2 - 0.1), x + Lx / 2, -(y + Lz / 2 + 0.1), { y0: Y_SS, y1: Y_SS + 0.95 });
  };
  // UN DISTRIBUTEUR (0,85 x 0,80 x 1,83, dos au mur est) : `face` le matériau de sa façade, `montant` le monnayeur à droite
  const distributeur = (y, mat, { vitre = true, montant = true } = {}) => {
    const x1 = 12.9, x0 = x1 - 0.8, l = 0.85, y0 = y - l / 2, y1 = y + l / 2, h = Y_SS + 1.83;
    B(x0 + 0.04, y0, x1, y1, Y_SS + 0.06, h, X.caisse, { collision: true });
    B(x0 + 0.06, y0 + 0.02, x1 - 0.02, y1 - 0.02, Y_SS, Y_SS + 0.06, X.noir, { ombre: false });
    // (le monnayeur à droite pour qui fait face à la machine : au sud)
    const lf = montant ? l - 0.24 : l - 0.08, ya = montant ? y0 + 0.2 : y0 + 0.04;
    const p = new THREE.Mesh(new THREE.PlaneGeometry(lf, vitre ? 1.5 : 1.6), mat);
    p.position.set(x0 + 0.035, Y_SS + (vitre ? 0.95 : 1.0), -(ya + lf / 2)); p.rotation.y = -Math.PI / 2; p.castShadow = false; ch.decor.add(p);
    if (montant) {
      B(x0 + 0.03, y0 + 0.04, x0 + 0.04, y0 + 0.2, Y_SS + 0.25, Y_SS + 1.7, X.montant, { ombre: false });
      B(x0 + 0.025, y0 + 0.07, x0 + 0.03, y0 + 0.17, Y_SS + 1.1, Y_SS + 1.35, X.vitreNoire, { ombre: false });
      B(x0 + 0.025, y0 + 0.09, x0 + 0.03, y0 + 0.15, Y_SS + 0.95, Y_SS + 1.0, M.inox, { ombre: false });
    }
    B(x0 + 0.03, ya, x0 + 0.04, ya + lf, Y_SS + 0.08, Y_SS + 0.18, X.vitreNoire, { ombre: false });
  };

  function meublerPause() {
    // ---- le long du mur vert : cinq mange-debout à colonne, deux tabourets verts et trois noirs devant ----
    [5.7, 6.45, 7.2, 7.95, 8.7].forEach((x, i) => {
      mangeDebout(x, 15.35, 'colonne');
      tabouret(x + (i % 2 ? 0.05 : -0.05), 14.87, 0, -1, i === 1 || i === 3 ? 'tolix' : 'miura');
    });
    // ---- l'îlot central : des mange-debout trépieds, trois Tolix verts, des tabourets noirs. (Relecture du 09/10 :
    // v_059 et v_060, de la porte, montrent TROIS MÈTRES DE CARRELAGE NU devant soi — le premier tabouret à plus de
    // 3 m, la grande table en X à ≈ 4,5 m droit devant, le baby-foot derrière elle, la table grise à droite au bord de
    // l'aile ; l'îlot posé à 1 m de la porte barrait l'entrée) ----
    mangeDebout(6.1, 13.7, 'trepied'); autour(6.1, 13.7, 0.5, [200, 300], ['miura', 'tolix']);
    mangeDebout(7.3, 13.85, 'trepied'); autour(7.3, 13.85, 0.5, [160, 340], ['tolix', 'miura']);
    mangeDebout(8.4, 13.1, 'trepied'); autour(8.4, 13.1, 0.5, [60, 220]);
    mangeDebout(9.25, 13.9, 'trepied'); autour(9.25, 13.9, 0.5, [30, 150], ['tolix', 'miura']);
    // ---- le baby-foot, la grande table en X devant lui, l'autre devant les distributeurs ----
    babyFoot(9.9, 12.25);
    grandeTable(7.2, 12.1); autour(7.2, 12.1, 0.62, [60, 180, 300]);
    grandeTable(11.0, 8.3); autour(11.0, 8.3, 0.62, [90, 200, 320]);
    // ---- la table grise, au bord de l'aile (v_060 : à droite de la table en X, un peu plus loin) ----
    B(8.0, 10.55, 9.2, 11.13, Y_SS + 0.92, Y_SS + 0.95, X.tablette, { collision: true });
    B(8.0, 10.55, 9.2, 11.13, Y_SS + 0.915, Y_SS + 0.92, X.acierGris, { ombre: false });
    for (const x of [8.05, 9.15]) for (const y of [10.6, 11.08]) B(x - 0.02, y - 0.02, x + 0.02, y + 0.02, Y_SS, Y_SS + 0.915, X.noir);
    tabouret(8.3, 10.12, 0, -1); tabouret(8.9, 10.12, 0, -1);
    // ---- LA TABLETTE HAUTE murale (mur est, y 10,1-12,9) : stratifié gris clair, pieds d'acier, trois tabourets dessous ----
    B(12.48, 10.1, 12.9, 12.9, Y_SS + 1.02, Y_SS + 1.05, X.tablette, { collision: true });
    for (const y of [10.2, 11.5, 12.8]) B(12.5, y - 0.02, 12.54, y + 0.02, Y_SS, Y_SS + 1.02, X.acierGris);
    for (const y of [10.6, 11.5, 12.4]) tabouret(12.25, y, 1, 0);
    // les trois petits cadres au-dessus, le trombinoscope et sa plaque noire au bout sud
    [11.4, 11.85, 12.35].forEach((y, i) => {
      B(12.885, y - 0.11, 12.9, y + 0.11, Y_SS + 1.55, Y_SS + 1.72, X.noir, { ombre: false });
      panneau(new THREE.MeshStandardMaterial({ map: texCadre(i), roughness: 0.5 }), 0.19, 0.14, 12.885, y, Y_SS + 1.635, 'W', 0.001);
    });
    B(12.88, 10.08, 12.9, 10.82, Y_SS + 1.24, Y_SS + 2.26, X.montant, { ombre: false });
    panneau(new THREE.MeshStandardMaterial({ map: texTrombi(), roughness: 0.55 }), 0.7, 0.98, 12.88, 10.45, Y_SS + 1.75, 'W', 0.002);
    B(12.885, 10.9, 12.9, 11.1, Y_SS + 1.7, Y_SS + 1.84, X.noir, { ombre: false });
    // ---- LA PORTE DU LOCAL SOMBRE (ouverte, vantail sombre rabattu dedans) et son noir ----
    const yl0 = 9.2, yl1 = 10.1;
    B(13.05, 8.6, 14.4, 10.7, Y_SS - 0.01, Y_SS, X.sombre, { ombre: false });
    B(14.3, 8.6, 14.4, 10.7, Y_SS, DALLE, X.sombre, { ombre: false });
    B(13.05, 8.6, 14.4, 8.7, Y_SS, DALLE, X.sombre, { ombre: false }); B(13.05, 10.6, 14.4, 10.7, Y_SS, DALLE, X.sombre, { ombre: false });
    B(13.05, 8.6, 14.4, 10.7, Y_SS + 2.1, Y_SS + 2.12, X.sombre, { ombre: false });
    for (const y of [yl0 - 0.025, yl1 + 0.025]) B(12.88, y - 0.025, 13.07, y + 0.025, Y_SS, Y_SS + 2.07, X.blancMat, { ombre: false });
    B(12.88, yl0 - 0.05, 13.07, yl1 + 0.05, Y_SS + 2.04, Y_SS + 2.09, X.blancMat, { ombre: false });
    // (le gond au sud, le vantail ouvert de 70° vers le nord-est, dans le local)
    const vl = new THREE.Group(); vl.position.set(13.07, Y_SS, -yl0); vl.rotation.y = 0.35; ch.decor.add(vl);
    maille(boiteM(0.88, 2.02, 0.04), X.sombre, 0.44, 1.01, 0, 0, vl);
    // (on n'y entre pas : le local n'a pas été vu)
    C.ajouterBoite(12.9, -yl0, 13.3, -yl1, { y0: Y_SS, y1: Y_SS + 2.1 });
    // ---- LES TROIS DISTRIBUTEURS (du nord au sud : friandises, boissons chaudes, froid) ----
    distributeur(8.67, L_.friandises);
    distributeur(7.82, L_.cafe, { vitre: false, montant: false });
    distributeur(6.97, L_.frais);
    // ---- LE COIN NORD-EST : poubelle bleue, deux A4 bleues, la grille à persiennes ----
    const poubelle = (x, y, mat, c = 0.36) => {
      B(x - c / 2, y - c / 2, x + c / 2, y + c / 2, Y_SS, Y_SS + 0.62, mat, { collision: true });
      B(x - c / 2 + 0.03, y - c / 2 + 0.03, x + c / 2 - 0.03, y + c / 2 - 0.03, Y_SS + 0.62, Y_SS + 0.625, X.noir, { ombre: false });
    };
    // (10/10 : collée au mur du sas — la porte de la grande salle, élargie à 1,40 m d'après la vidéo de 2021, passe à
    // 18 cm d'elle ; on entre entre le fixe et la poubelle)
    poubelle(10.26, 15.55, X.bleuPoubelle);
    for (const [y, h] of [[15.2, 1.45], [15.55, 1.5]]) panneau(new THREE.MeshStandardMaterial({ map: texAffiche('#2f6fb0', '#fbfbf8', Math.round(y * 10)), roughness: 0.7 }), 0.21, 0.297, 10.45, y, Y_SS + h, 'W');
    panneau(new THREE.MeshStandardMaterial({ map: texPersiennes(), roughness: 0.55 }), 0.6, 0.38, 10.45, 15.45, Y_SS + 2.08, 'W', 0.01);
    // ---- LE SAS DES TOILETTES : deux portes crème à plaque rouge (fermées), les casiers blancs dans la niche ----
    const porteWC = (x, y, face) => {
      const g = new THREE.Group(); g.position.set(x, Y_SS, -y); g.rotation.y = ROT[face]; ch.decor.add(g);
      maille(boiteM(0.9, 2.08, 0.03), X.creme, 0, 1.04, 0.006, 0, g, { ombre: false });
      maille(boiteM(0.8, 2.0, 0.035), X.porteCreme, 0, 1.0, 0.02, 0, g, { ombre: false });
      maille(boiteM(0.12, 0.12, 0.006), X.rougePlaque, 0, 1.72, 0.04, 0, g, { ombre: false });
      maille(boiteM(0.12, 0.02, 0.02), M.inox, 0.3, 1.02, 0.05, 0, g, { ombre: false });
    };
    porteWC(12.9, 14.3, 'W'); porteWC(11.7, 14.95, 'S');
    // (intégration du 10/10 : solide — la caméra, tournée vers l'est depuis l'îlot, entrait dans le meuble)
    B(12.62, 12.95, 12.9, 13.55, Y_SS + 1.0, Y_SS + 1.9, X.blancMat, { collision: true });
    panneau(new THREE.MeshStandardMaterial({ map: texCasiers(), roughness: 0.6 }), 0.56, 0.88, 12.62, 13.25, Y_SS + 1.45, 'W', 0.001);
    poubelle(12.72, 13.25, X.grisPoubelle, 0.3);
    // ---- LE MUR VERT : la cloison vitrée dépolie et sa porte (x 3,9-5,5), les deux affiches encadrées, l'affiche
    // bordeaux au QR ; la porte vitrée de l'est (x 8,85-10,25) est celle de la grande salle S -1.14 : js/ecole_amphi.js ----
    const cloison = (a, b, montants) => {
      const y = 15.8 - 0.035;
      B(a, y, b, 15.8, Y_SS, Y_SS + 0.05, X.creme, { ombre: false });
      B(a, y, b, 15.8, H_RET - 0.06, H_RET, X.creme, { ombre: false });
      B(a, y, b, 15.8, Y_SS + 2.08, Y_SS + 2.13, X.creme, { ombre: false });
      for (const x of montants) B(x - 0.03, y - 0.005, x + 0.03, 15.8, Y_SS, H_RET, X.creme, { ombre: false });
      for (let i = 0; i < montants.length - 1; i++) {
        const xa = montants[i] + 0.03, xb = montants[i + 1] - 0.03;
        B(xa, y + 0.01, xb, y + 0.02, Y_SS + 0.05, Y_SS + 2.08, X.depoli, { ombre: false });
        B(xa, y + 0.01, xb, y + 0.02, Y_SS + 2.13, H_RET - 0.06, X.depoli, { ombre: false });
      }
    };
    cloison(3.9, 5.5, [3.93, 4.85, 5.47]);
    B(4.7, 15.72, 4.82, 15.74, Y_SS + 1.02, Y_SS + 1.05, M.inox, { ombre: false });
    maille(new THREE.CylinderGeometry(0.013, 0.013, 0.02, 10), M.inox, 4.76, Y_SS + 0.95, -15.73, 0, ch.decor, { ombre: false }).rotation.x = Math.PI / 2;
    for (const x of [6.45, 7.95]) {
      B(x - 0.235, 15.78, x + 0.235, 15.8, Y_SS + 1.48, Y_SS + 2.12, X.noir, { ombre: false });
      panneau(new THREE.MeshStandardMaterial({ map: texAffiche('#3a3a3a', '#ffffff', Math.round(x * 3)), roughness: 0.6 }), 0.44, 0.61, x, 15.78, Y_SS + 1.8, 'S', 0.001);
    }
    panneau(new THREE.MeshStandardMaterial({ map: texBordeaux(), roughness: 0.6 }), 0.3, 0.42, 5.78, 15.8, Y_SS + 1.5, 'S', 0.01);
    // ---- L'AFFICHE « 100 % » sur le retour, à droite de l'entrée ----
    panneau(new THREE.MeshStandardMaterial({ map: texAffiche100(), roughness: 0.6 }), 0.42, 0.594, 3.35, 11.6, Y_SS + 1.5, 'N');
    // ---- L'AILE (Haythem ne l'a pas filmée en 2026 : la vidéo officielle de 2021, q_0088-q_0097, q_0137-q_0142, es/z_M,
    // z_D) : contre son mur ouest vert, la TABLETTE HAUTE de stratifié gris (dessus à 1,05, 35 cm de profondeur, trois
    // pieds d'acier fins), le micro-ondes NOIR à porte miroir puis le BLANC à porte noire, trois A4 au-dessus du bout sud
    // (une mosaïque de photos, deux textes), une chaise filaire noire et un tabouret dessous ; deux mange-debout imaginés ----
    B(5.0, 6.9, 5.35, 10.8, Y_SS + 1.02, Y_SS + 1.05, X.tablette, { collision: true });
    B(5.0, 6.9, 5.35, 10.8, Y_SS + 1.015, Y_SS + 1.02, X.acierGris, { ombre: false });
    for (const y of [7.0, 8.85, 10.7]) B(5.27, y - 0.015, 5.3, y + 0.015, Y_SS, Y_SS + 1.015, X.acierGris);
    for (const [y, mat, porte] of [[9.25, X.caisse, X.chrome], [10.35, X.microOndes, X.vitreNoire]]) {
      B(5.02, y - 0.24, 5.34, y + 0.24, Y_SS + 1.05, Y_SS + 1.33, mat);
      B(5.34, y - 0.22, 5.343, y + 0.1, Y_SS + 1.08, Y_SS + 1.3, porte, { ombre: false });
      B(5.34, y + 0.13, 5.342, y + 0.21, Y_SS + 1.12, Y_SS + 1.28, X.vitreNoire, { ombre: false });
    }
    panneau(new THREE.MeshStandardMaterial({ map: texCadre(2), roughness: 0.6 }), 0.21, 0.297, 5.005, 7.35, Y_SS + 1.75, 'E');
    panneau(new THREE.MeshStandardMaterial({ map: texAffiche('#3a3a3a', '#fbfbf8', 78), roughness: 0.7 }), 0.21, 0.297, 5.005, 7.7, Y_SS + 1.72, 'E');
    panneau(new THREE.MeshStandardMaterial({ map: texAffiche('#3a3a3a', '#fbfbf8', 79), roughness: 0.7 }), 0.21, 0.297, 5.005, 8.0, Y_SS + 1.72, 'E');
    tabouret(5.62, 9.0, -1, 0);
    {
      // (la chaise filaire noire : assise et dossier de fil, quatre pieds)
      const g = new THREE.Group(); g.position.set(5.65, Y_SS, -7.55); g.rotation.y = -Math.PI / 2 + 0.2; ch.decor.add(g);
      maille(boiteM(0.42, 0.012, 0.4), X.noir, 0, 0.46, 0, 0, g);
      maille(boiteM(0.42, 0.34, 0.012), X.noir, 0, 0.66, 0.2, 0, g).rotation.x = -0.12;
      for (const [px, pz] of [[-0.19, -0.18], [0.19, -0.18], [-0.19, 0.18], [0.19, 0.18]]) tube(g, X.noir, new THREE.Vector3(px, 0.46, pz), new THREE.Vector3(px * 1.1, 0, pz * 1.1), 0.008, 6);
      C.ajouterCercle(5.65, -7.55, 0.24, { y0: Y_SS, y1: Y_SS + 0.85 });
    }
    mangeDebout(6.6, 8.2, 'trepied'); autour(6.6, 8.2, 0.5, [0, 180]);
    mangeDebout(9.3, 7.4, 'trepied'); autour(9.3, 7.4, 0.5, [90, 270]);
    panneau(new THREE.MeshStandardMaterial({ map: texAffiche('#7b2a6e', '#fbfbf8', 5), roughness: 0.7 }), 0.42, 0.594, 8.2, 6.5, Y_SS + 1.55, 'N');
    // (un radiateur sous l'affiche, comme ceux du rez-de-chaussée)
    B(7.6, 6.5, 8.8, 6.58, Y_SS + 0.15, Y_SS + 0.75, M.radiateur, { collision: true });
    B(7.61, 6.51, 8.79, 6.57, Y_SS + 0.75, Y_SS + 0.755, M.grille, { ombre: false });
  }

  // =====================================================================
  //  LA CONSTRUCTION
  // =====================================================================
  construirePalier();                                        // (au niveau 0 : le décor du rez-de-chaussée)
  ch.decor = fixe; ch.portes.decor = groupe;
  let amphi = null;
  try {
    construireEscalier();
    construireMurs();
    construireSols();
    construirePlafonds();
    construirePortes();
    garnirHall();
    meublerPause();
    // LA GRANDE SALLE S -1.14, derrière le mur vert (js/ecole_amphi.js, d'après la vidéo officielle de 2021 ; 10/10)
    const solNiveau = (rects, mat, nom) => {
      const m = new THREE.Mesh(geoSolNiveau(rects, Y_SS, R_SS), mat);
      m.receiveShadow = true; m.castShadow = false; m.name = nom; m.userData.solSS = true; groupe.add(m);
      return m;
    };
    amphi = poserAmphi(ch, { Y_SS, DALLE, H_RET, B, mur, plinthe, panneau, siege, solNiveau, lampes, X });
    solsSS.push(...amphi.sols);
  } finally {
    ch.decor = decor0; ch.portes.decor = portes0;
  }
  // LA DALLE-BOÎTE (dans le décor du rez-de-chaussée) : sous le carrelage d'en haut, elle porte l'ombre du « soleil » sur
  // tout le -1 tant que Haythem n'y est pas (la trémie et le palier exceptés) ; invisible d'en haut comme d'en bas
  const dalleOmbre = new THREE.Group(); dalleOmbre.name = 'dalle du rez-de-chaussée (ombre)';
  for (const [a, b, c, d] of DALLES_RDC) {
    const m = maille(boiteM(c - a, 0.26, d - b), M.beton, (a + c) / 2, -0.16, -(b + d) / 2, 0, dalleOmbre, { ombre: true, recoit: false });
    m.userData.horsAOSol = true;
  }
  dalleOmbre.userData.horsAOSol = true; nePasFusionner(dalleOmbre);
  decor0.add(dalleOmbre);
  const dalles = dalleOmbre.children;

  // =====================================================================
  //  LA LUMIÈRE CUITE ET L'OMBRE DOUCE DU SOL DU -1
  // =====================================================================
  // Le calcul du rez-de-chaussée (js/ecole_lumieres.js cuireLumiereSol) sur les murs du -1 ramenés au sol (ce qui part du
  // sol du -1, décalé de -Y_SS) et ses lampes (h - Y_SS) ; l'ombre douce, celle de l'étage refaite pour ce niveau.
  const W = R_SS.x1 - R_SS.x0, Lg = R_SS.y1 - R_SS.y0;
  const proxy = { formes: C.formes.filter((f) => f.y0 > Y_SS - 0.35 && f.y0 < Y_SS + 0.3).map((f) => ({ ...f, y0: f.y0 - Y_SS, y1: f.y1 - Y_SS })) };
  const aCuire = lampes.filter((L) => L.base === Y_SS).map((L) => ({ ...L, h: L.h - Y_SS, cuire: true }));
  const lm = cuireLumiereSol(proxy, aCuire, { x0: R_SS.x0, z0: -R_SS.y1, W, L: Lg }, { tpm: 16 });
  // (relecture du 09/10 : à 1,4 partout, la résine du hall et le carrelage beige sortaient presque blancs, aussi clairs
  // que les murs ; sur la vidéo, le sol est nettement plus sombre qu'eux — le couloir, lui, est bien gris foncé)
  for (const m of solsSS) { m.lightMap = lm; m.lightMapIntensity = m.userData.lmi ?? (m === SOL.couloir ? 1.4 : m === SOL.hall ? 0.75 : 0.55); }
  groupe.traverse((o) => { o.userData.horsAOSol = true; });
  if (renderer) {
    try { cuireOcclusionNiveau(renderer, groupe, solsSS, Y_SS, R_SS); } catch (e) { console.warn('[sous-sol] ombre du sol non cuite :', e); }
  }
  // LA FUSION : le décor fixe cousu en un maillage par matériau ; le groupe hors de l'optimisation du décor (sa
  // visibilité et ses ombres changent avec le niveau de Haythem)
  groupe.traverse((o) => { if (o.isMesh && plafondsSS.has(o.material)) o.material = plafondsSS.get(o.material); });
  fusionnerLocal(fixe);
  nePasFusionner(groupe);
  groupe.traverse((o) => { o.userData.horsAOSol = true; if (o.isMesh && o.castShadow) ombrants.push(o); });
  for (const o of ombrants) o.castShadow = false;
  ch.sieges.push(...sieges);

  // =====================================================================
  //  LES ZONES (pièces) du -1, pour js/ecole_lumieres.js
  // =====================================================================
  // [x0, z0, x1, z1, hauteur mini, hauteur MAXI] : les rectangles du -1 ne prennent que des pieds sous -1,5 m (le joueur
  // du rez-de-chaussée, au-dessus, n'y est pas) ; le palier et la volée n'ont rien au-dessus ni au-dessous
  const zr = (x0, y0, x1, y1, hmax = -1.5) => [x0, -y1, x1, -y0, -10, hmax];
  const env = (x, y, h = 1.6) => ({ x, y: Y_SS + h, z: -y });
  const zones = [
    // (le palier s'ouvre sur le hall ouest : ses plafonniers restent allumés quand Haythem passe la porte — sans eux, le
    // hall s'éteignait derrière lui d'un coup, relecture du 09/10)
    { id: 'palierSS', rects: [[0.0, -ESC.y0, 1.6, -9.1, -10]], voisines: ['escalierSS', 'hallO'], env: { x: 0.9, y: 1.5, z: -9.6 } },
    { id: 'escalierSS', rects: [[0.2, -ESC.yPied, 1.5, -ESC.y0, -10]], voisines: ['palierSS', 'hallSS'], env: { x: 0.85, y: -1.1, z: -12.0 } },
    { id: 'hallSS', rects: [zr(0.4, ESC.yPied, 2.48, Y_FOND)], voisines: ['escalierSS', 'couloirSS'], env: env(1.45, 15.7) },
    { id: 'couloirSS', rects: [zr(1.45, Y_COUL0, 2.48, ESC.yPied)], voisines: ['hallSS'], env: env(1.96, 10.3, 1.5) },
    { id: 'pauseSS', rects: [zr(2.48, 11.6, 12.95, 15.85), zr(4.95, 6.45, 12.95, 11.6)], voisines: [], env: env(7.4, 12.2) },
    amphi.zone,
  ];

  // =====================================================================
  //  LE SOUS-SOL VIVANT (js/carte_ecole.js maj, à chaque image)
  // =====================================================================
  // EN BAS (pieds sous -0,6 m ; on remonte au-dessus de -0,35), ou la caméra dans la cage de l'escalier (du palier, on
  // voit le hall du -1 au bout de la volée, éclairé comme sur v_009) : la dalle-boîte s'éteint, le décor du
  // rez-de-chaussée ne porte plus d'ombre (elle tomberait au travers du sol : l'escalier principal sur le hall du -1),
  // le mobilier du -1 porte la sienne. Reposé à chaque image : le cache de l'ombre du décor (js/ombre_cache.js) rallume
  // ce qu'il a éteint le temps d'un rendu.
  let bas = false, rdc = null;
  // (10/10 : jusqu'au fond et au mur est de la grande salle S -1.14 — sous la salle David Clark et la cour, piège n° 12)
  const colonne = new THREE.Box3(new THREE.Vector3(-1.5, -4, -27.0), new THREE.Vector3(16.6, 12, -1.5));
  const releverRDC = (jeu) => {
    const L = [], bb = new THREE.Box3(), etage = ch.scene.getObjectByName('1er étage');
    const sauter = new Set([groupe, etage, dalleOmbre, jeu.user && jeu.user.mesh].filter(Boolean));
    const visiter = (o) => {
      if (sauter.has(o) || o.isLight || o.userData.dynamique) return;
      if ((o.isMesh || o.isInstancedMesh) && o.castShadow) { bb.setFromObject(o); if (bb.intersectsBox(colonne)) L.push(o); }
      for (const c of o.children) visiter(c);
    };
    visiter(ch.scene);
    return L;
  };
  const maj = (dt, jeu) => {
    const u = jeu.user.pos, cam = jeu.camera.position;
    const cage = cam.x < 1.62 && cam.z < -9.1 && cam.z > -14.4 && cam.y < 2.6;
    if (u.y < -0.6 || cage) bas = true; else if (u.y > -0.35) bas = false;
    // VISIBLE quand la caméra peut le voir : en bas, ou dans le hall ouest et sur le palier (la trémie, la porte ouverte)
    const pres = cam.x < 6.2 && cam.z < -4.8 && cam.z > -14.8 && cam.y < 3.4;
    const vis = bas || cam.y < -0.1 || pres;
    if (vis !== groupe.visible) groupe.visible = vis;
    if (!rdc) rdc = releverRDC(jeu);
    for (const o of rdc) o.castShadow = !bas;
    for (const o of dalles) o.castShadow = !bas;
    for (const o of ombrants) o.castShadow = bas;
    amphi.maj(dt, jeu);
  };
  console.info('[sous-sol] %d sièges, %d lampes, %d ombrants, construit en %d ms', sieges.length, lampes.length, ombrants.length, Math.round(performance.now() - t0));
  return { zones, maj, groupe, solsRDC: [matPalier] };
}

// =====================================================================
//  L'OMBRE DOUCE CUITE AU SOL D'UN NIVEAU (celle de l'étage, js/ecole_etage1.js, pour un plancher à `base`)
// =====================================================================
// Une carte des hauteurs du niveau vue de dessus (seulement ce qui part de son sol : murs, pieds, meubles — pas un
// plateau, ni un plafond), puis pour chaque texel l'horizon dans 16 directions ; le ciel masqué vaut sin² de l'élévation
// de l'horizon. Le résultat est l'aoMap (uv1) de ses sols : il n'assombrit que la lumière indirecte.
function cuireOcclusionNiveau(renderer, groupe, mats, base, R) {
  const rayon = 1.6, marge = 1.8, tpm = TELEPHONE ? 16 : 32;
  const W = R.x1 - R.x0, L = R.y1 - R.y0, WH = W + 2 * marge, LH = L + 2 * marge;
  const cx = (R.x0 + R.x1) / 2, cz = -(R.y0 + R.y1) / 2;
  const hw = Math.round(WH * tpm), hh = Math.round(LH * tpm), aw = Math.round(W * tpm), ah = Math.round(L * tpm);
  const cibleH = new THREE.WebGLRenderTarget(hw, hh, { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: true });
  const hauteur = new THREE.ShaderMaterial({
    uniforms: { uBase: { value: base } },
    vertexShader: 'varying float vH; void main() { vec4 wp = modelMatrix * vec4(position, 1.0); vH = wp.y; gl_Position = projectionMatrix * viewMatrix * wp; }',
    fragmentShader: 'uniform float uBase; varying float vH; void main() { gl_FragColor = vec4(vH - uBase, 0.0, 0.0, 1.0); }',
    side: THREE.DoubleSide,
  });
  const cam = new THREE.OrthographicCamera(-WH / 2, WH / 2, LH / 2, -LH / 2, 0.1, 100);
  cam.position.set(cx, base + 40, cz); cam.up.set(0, 0, -1); cam.lookAt(cx, base, cz); cam.updateMatrixWorld();
  const parent = groupe.parent, sc = new THREE.Scene();
  sc.add(groupe); sc.overrideMaterial = hauteur;
  const vu = new Map(), bb = new THREE.Box3();
  groupe.updateMatrixWorld(true);
  groupe.traverse((o) => {
    vu.set(o, o.visible);
    if (!o.isMesh) return;
    const m = o.material;
    if (!m || m.transparent || o.userData.solSS) { o.visible = false; return; }
    bb.setFromObject(o);
    if (bb.min.y > base + 0.3 || bb.max.y < base + 0.05 || bb.min.y < base - 0.4) o.visible = false;
  });
  const couleur = renderer.getClearColor(new THREE.Color()), alpha = renderer.getClearAlpha(), avant = renderer.getRenderTarget();
  renderer.setRenderTarget(cibleH); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(sc, cam);
  groupe.traverse((o) => { if (vu.has(o)) o.visible = vu.get(o); });
  sc.remove(groupe); if (parent) parent.add(groupe);
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
  for (const m of mats) { m.aoMap = cibleAO.texture; m.aoMapIntensity = 1.0; m.needsUpdate = true; }
}
