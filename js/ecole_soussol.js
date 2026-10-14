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
// (PLAN V2 du 11/10, scratchpad iris_audit/plan_v2.md § 1.2, § 2.3, lot E ; retour de Haythem du 10/10 : « la porte n'est
// pas aussi loin ». La porte grise du hall ouest passe de c 9,575 à c 5,485 — la photo 06 rejouée mot pour mot, lot B —
// et la volée, le hall du -1, le couloir et l'entrée de l'espace pause forment avec elle une chaîne rigide : TOUT L'OUEST
// DU -1 RECULE DE DY_SS = -4,09 (le palier, la volée, le hall, le couloir, la pause et son aile, le sas des toilettes, et
// la grande salle derrière le mur vert, js/ecole_amphi.js). Les coordonnées ci-dessous sont celles d'après le décalage.
// Avec lui : le REBORD du mitoyen reprend son profil (de niveau, puis plongeant), l'EXTINCTEUR du hall descend et
// recule, l'espace pause se DÉGAGE (baby-foot nord-sud, îlot de trois tables, l'aile sans meubles imaginés), et la
// grande salle RENTRE DANS LA PARCELLE. Rejoué au jeu aux points de vue des images, trois cotes du plan ont été reprises :
// l'extincteur du hall (v_010), l'objet jaune du rebord (v_010) et la cloison vitrée du mur vert (v_064 et 20,98 s) —
// chacune avec sa preuve, là où elle est posée. RELECTURE DU 11/10 : la focale de la vidéo vaut ≈ 1 000 px et non 1 200
// (la pose de v_010 refaite, la porte de v_042) ; le couloir garde donc ses 7,8 m, que le plan allongeait de 1,1 m, le
// rampant de la volée remonte à 2,95 m des nez, et l'espace pause redevient traversable jusqu'à la grande salle.)
//
// LE PLAN (repère de js/carte_ecole.js : x le long de la façade, y vers le fond ; dans le jeu X = x, Z = -y) :
//   le palier (niveau 0)       x 0-1,6      y 5,0-6,01    derrière la porte grise du hall ouest (x 1,675, c 5,485) ; son
//                                                         mur sud (ligne 4,95) ferme le couloir de service du RDC
//   la volée                   x 0,40-1,25  y 6,01-10,09  nez du rang k en y 6,01 + 0,255 k, à -0,18 k (k = 0 … 16)
//   le rebord du mitoyen       x 0,20-0,45  de niveau (-0,03) jusqu'en y 7,91, puis jusqu'à -0,30 en y 9,51
//   le hall du -1              x 0,40-2,42  y 10,09-13,21 plafond à 2,36 m ; « -1 », extincteur, consignes
//   le couloir                 x 1,50-2,42  y 2,31-10,09  0,92 m de large, plafond à 2,50 m, caisson et grille au fond ;
//                                                         il passe sous le couloir de service et le passage du RDC
//   l'espace pause             x 2,55-12,9  y 7,51-11,71  et son aile x 5,0-12,9 y 2,41-7,51 ; dalles à 2,55 m
//   le sas des toilettes       x 10,55-12,9 y 9,56-10,86  deux portes crème à plaque rouge (fermées)
//   la porte sombre            mur est, y 5,11-6,01       le passage sombre vers le sas technique (js/ecole_soussol_est.js)
//   la grande salle S -1.14    x 2,55-13,3  y 11,86-21,41 derrière le mur vert (js/ecole_amphi.js : la vidéo officielle
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
// (DY_SS, le recul de tout l'ouest du -1 du plan V2 — scratchpad iris_audit/plan_v2.md § 2.1 —, est nommé dans
// js/ecole_amphi.js, évalué le premier)
import { poserAmphi, EMPRISE_AMPHI, DY_SS } from './ecole_amphi.js';

// ---- les hauteurs ----
export const Y_SS = -3.06;               // le sol du sous-sol (17 contremarches de 18 cm sous le palier)
const DALLE = -0.3;                      // le dessous de la dalle du rez-de-chaussée : les murs du -1 y montent
const H_HALL = Y_SS + 2.36;              // le plafond du hall du -1 (plâtre)
const H_COUL = Y_SS + 2.50;              // celui du couloir (plan V2 : la ligne d'angle de v_050, ≈ 2,50 m)
const H_PAUSE = Y_SS + 2.55;             // les dalles de l'espace pause
const H_RET = Y_SS + 2.30;               // le dessous de ses retombées (la peinture verte s'arrête là)
const H_SAS = Y_SS + 2.42;
const H_PALIER = 2.5;                    // le plafond du palier
// ---- la volée (17 contremarches, 16 marches de tôle larmée) ----
// (plan V2 : la chaîne porte grise - palier - volée - hall - couloir recule de DY_SS, 10,10 -> 6,01)
const ESC = { x0: 0.40, x1: 1.25, y0: 10.10 + DY_SS, G: 0.255, R: 0.18, n: 17 };
ESC.yPied = ESC.y0 + (ESC.n - 1) * ESC.G;                   // 10,09 : le pied de l'escalier
const nez = (k) => ESC.y0 + k * ESC.G;                       // le nez du rang k (k = 0 : le bord du palier)
const Y_PAL = 5.0;                                           // le nu du mur sud du palier (ligne 4,95)
// le REBORD du mitoyen (v_006, v_010 : une tablette large, de niveau avec le palier sur ses deux premiers mètres, qui ne
// plonge qu'ensuite vers la retombée — soussol.md § 2.1) : sa face est en x 0,45, son dessus à -0,03 jusqu'en y 7,91,
// puis il descend jusqu'à -0,30 en y 9,51
const X_REB = 0.45, Y_REB1 = 7.91, Y_REB2 = 9.51;
// le RAMPANT au-dessus de la volée : parallèle, 2,95 m au-dessus des nez (relecture du 11/10 : v_010 rejouée à la pose
// recalée — celle de l'audit, f 1 200, et celle qu'on refait sur les 12 nez, les 4 montants et l'ouverture du hall,
// f ≈ 1 025, à 4 px près —, les arêtes du plafond avec les deux murs et son bout tombent sur une droite à 2,90-3,0 m
// des nez, et non à 2,20 : à 2,20, le plafond venait boucher le haut de l'ouverture et la volée paraissait un boyau). Il
// part du plafond du palier (2,50) en y 6,65 et descend droit jusqu'à la RETOMBÉE du pied (y 9,99-10,26, dessous à
// -0,78), qu'il rejoint vers +0,14 : vue du palier, la face blanche au-dessus de l'ouverture du hall fait un grand
// bandeau de 0,9 m (v_010 : rangs 760-965 ; v_015 à v_034, il grandit à mesure qu'on descend)
const Y_RET = 14.08 + DY_SS, ECH = 2.95;
const rampant = (y) => ECH - (y - ESC.y0) * ESC.R / ESC.G;
const Y_RAMP0 = ESC.y0 + (ECH - H_PALIER) * ESC.G / ESC.R;   // 6,65 : le rampant quitte le plafond du palier
const Y_RAMP1 = Y_RET;                                        // 9,99 : ... et bute sur la face de la retombée
// LA VOLÉE 2 DE L'ESCALIER PRINCIPAL passe au-dessus de la trémie (13/10, à sa vraie pente — photo 06, js/carte_ecole.js
// construireEscalier : 16 contremarches de 0,175 sur des girons de 0,366, du palier à 0,70, pied en y 11,49, au 1er en
// y 6,0, entre x 0,75 et 1,975) : la sous-face de son limon, 0,44 sous les nez — 3,06 en y 6,0, 2,75 au départ du
// rampant, 1,03 au bout nord de la trémie ; partout 0,25 m au moins au-dessus du rampant
const SOUS_V2 = (y) => 0.44 + (11.49 - y) * 0.175 / 0.366;
// ---- le plan ----
const X_MUR = 2.485, EP_MUR = 0.13;       // le mur entre couloir (et hall) et espace pause
const PORTE_PAUSE = 12.15 + DY_SS, PORTE_HALL = 14.85 + DY_SS, L_PORTE = 1.0;      // 8,06 et 10,76
const Y_FOND = 17.3 + DY_SS;              // le nu du mur du fond du hall du -1 (13,21)
// le nu du mur du fond (sud) du couloir : 6,4 avant le décalage, comme avant le plan V2 — le couloir fait 7,8 m.
// (Relecture du 11/10 : le plan le portait à 5,3 — soussol.md § 2.3, la plinthe du fond de 133 à 155 px sur v_047 à
// v_051, soit 7,1 à 8,3 m de la caméra, pour une focale de 1 200 px. Mais la focale de la vidéo est plus courte : la pose
// de v_010 refaite sur 12 nez, 4 montants et l'ouverture du hall donne f ≈ 1 025 à 4 px près — à 1 200, 13 px —, et le
// vantail de la porte du hall, v_042, f ≈ 950. À f ≈ 1 000, le fond est à 5,9 m de la caméra placée par l'audit : la
// largeur du fond, 157 px sur v_050, est celle du couloir de 7,8 m (159 px) ; celui de 8,9 m la donnait à 133 px)
const Y_COUL0 = 6.4 + DY_SS;              // 2,31
// l'extincteur du hall (mur ouest), plus bas et plus trapu qu'avant (garnirHall). Sa place : le plan V2 le met en
// y 12,21 (16,3 avant le décalage), d'après sa taille sur v_035, lue pour un corps de 0,45 m ; mais ce corps est plus
// court, et la planche de contrôle v_010 — la pose recalée sur les 16 nez — le montre au même rang d'image que le pied
// du mur du fond, sous la retombée : en y 12,21, il passait DERRIÈRE elle. Sur v_010, son corps (rangs 1 065-1 110,
// colonnes 365-390) tombe en y 11,0 ; sur v_035, pour un corps de 0,30 à 0,36, en y 11,3-11,7 (vérifié au jeu, 11/10)
const Y_EXT = 11.0;
// le rectangle du sol cuit du -1 (lumière et ombre cuites, uv1 de 0 à 1, v = 1 au nord) ; du fond du couloir au fond de
// la grande salle S -1.14 (y 21,41) et à l'est jusqu'au passage sombre (plan V2)
const R_SS = { x0: 0, x1: 15.5, y0: 0.9, y1: 22.0 };
// la dalle du rez-de-chaussée au-dessus du -1 (la trémie et le palier exceptés : x -0,3-1,6, y 4,95-10,2) : pour le
// joueur d'en haut, pour la caméra et pour l'ombre ; la 4e, au-dessus du passage sombre (sous la pile et la bande morte
// du couloir est, plan V2 § 2.6)
const DALLES_RDC = [[-0.3, 0.9, 13.2, 4.95], [1.6, 4.95, 13.2, 10.2], [-0.3, 10.2, 13.2, 21.6], [13.0, 4.9, 14.6, 10.4], EMPRISE_AMPHI];
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
    // (relecture du 11/10 : v_003, v_004 — le sol fait 0,47 du mur, d'un taupe olive (89, 82, 60) ; sous les plafonniers
    // chauds du rez-de-chaussée, l'ancien #5e5a50 sortait brun-rouge et trop sombre, (73, 60, 42))
    g.fillStyle = '#76786f'; g.fillRect(0, 0, w, h);
    nuees(g, w, h, r2, 60, [118, 120, 111], 12, 0.4, 10, 60);
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
// LE GRÈS GRIS FONCÉ du couloir (plan V2, soussol.md § 2.3 ; v_047 à v_051) : de grands carreaux de 1,2 m, #56544e, SANS
// JOINT LONGITUDINAL — un carreau couvre toute la largeur du couloir —, des joints transversaux à peine visibles. Tuile
// de dessin : 1,2 x 2,4 m, deux carreaux l'un derrière l'autre, chacun son ton (v le long du couloir)
function texGres(base, joint, graineN, nuee = 6) {
  const W = TELEPHONE ? 128 : 256;
  return canvasTex(W, 2 * W, (g, w, h) => {
    const r2 = graine(graineN), c = h / 2, j = Math.max(1, w * 0.004);
    for (let b = 0; b < 2; b++) {
      const t = (r2() - 0.5) * nuee;
      g.fillStyle = rgb(base[0] + t, base[1] + t, base[2] + t); g.fillRect(0, b * c, w, c);
      g.save(); g.beginPath(); g.rect(0, b * c, w, c); g.clip();
      nuees(g, w, h, r2, 30, [base[0] + t, base[1] + t, base[2] + t], nuee * 0.8, 0.45, 8, w * 0.3);
      g.restore();
    }
    for (let k = 0; k < w * h / 60; k++) { const v = (r2() - 0.5) * 16; g.fillStyle = rgb(base[0] + v, base[1] + v, base[2] + v, 0.22); g.fillRect(r2() * w, r2() * h, 1.2, 1.2); }
    g.fillStyle = joint;
    for (let i = 0; i <= 2; i++) g.fillRect(0, i * c - j / 2, w, j);
  }, [1 / 1.2, 1 / 2.4], false, 8);
}
let _normGres = null;
function normalesGres() {
  return _normGres || (_normGres = normalesDepuisGrille(64, 128, (g, w, h) => {
    for (let b = 0; b < 2; b++) g.fillRect(0, b * h / 2 + 0.8, w, h / 2 - 1.6);
  }, 0.8, 0.8));
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
    // (relecture du 11/10 : à peine plus sombre que la résine — v_038 : plinthe ≈ 0,9 du sol, ≈ 0,55 du mur ; à 0x3d3c38,
    // elle dessinait un trait noir au pied de chaque mur, soussol.md § 2.3)
    plintheGrise: nommer(std({ color: 0x5a5853, roughness: 0.6 }), 'plinthe peinte gris foncé'),
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
    couloir: nommer(std({ map: texGres([86, 84, 79], '#4a4843', 909, 6), roughness: 0.47 }), 'grès gris foncé du couloir'),
    // (relecture du 09/10 : #c6bfa6 sortait presque blanc sous les plafonniers ; mesuré sur v_063, le carrelage est d'un
    // tiers plus sombre que les murs)
    pause: nommer(std({ map: texCarreaux([150, 145, 127], '#827d72', 512, 14), roughness: 0.33 }), 'carrelage beige 60x60'),
  };
  avecRelief(SOL.pause, normalesCarreaux(), 0.35);
  avecRelief(SOL.couloir, normalesGres(), 0.3);
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
  // relève (en plan) ; `sol` : le -1. Rend le siège (la grande salle y pose son rang : js/ecole_amphi.js)
  const siege = (x, y, h, fx, fz, sx, sy, nom) => { const s = { x, z: -y, y: h, fx, fz, sx, sz: -sy, nom, sol: Y_SS }; sieges.push(s); return s; };

  // =====================================================================
  //  LE PALIER (au niveau 0, dans le décor du rez-de-chaussée : on le voit du hall ouest, porte ouverte)
  // =====================================================================
  // v_003 à v_014 et la photo 06 (par l'oculus : le hublot en haut, le panneau jaune à droite). Le palier fait 1,6 x 1,0 m
  // entre le mur sud (au ras du jambage de la porte) et le bord de la volée ; au fond, le mitoyen. Au nord de y = 6,01, le
  // mur ouest AVANCE de 20 cm (l'arête verticale de v_004 à v_006, l'interrupteur juste après) et la volée descend le
  // long de lui ; plus bas encore, le mur du sous-sol, plus épais, fait le rebord. Le panneau « 0 » est en haut du mur du
  // fond, près de cette arête (v_004, v_005, photo 06) ; le hublot opale est sur le mur qui avance, au-dessus de
  // l'interrupteur (v_014), sous le départ du rampant.
  // (Doute : le relevé de la vidéo — et le plan V2 après lui — met le « 0 » sur le mur sud, à 1,9 m ; v_004, v_005 — le
  // « 0 » sur le mur qui fait face, contre l'arête —, v_012, v_014 et l'oculus de la photo 06 s'accordent mieux avec cette
  // disposition-ci. On suit les images.)
  // (Plan V2 : le palier recule de DY_SS avec la porte grise ; C'EST ICI QU'EST POSÉ SON MUR SUD, sur la ligne 4,95 — le
  // couloir de service du rez-de-chaussée, js/ecole_pieces.js, s'arrête contre lui, en y 4,925 —, et la trémie, x -0,3-1,6
  // y 4,95-10,175 (le carrelage RN de js/carte_ecole.js y est coupé), est close au nord par le dos de la réserve ouest.)
  function construirePalier() {
    // LE MUR SUD du palier (ligne 4,95 : nu sud 4,925, celui du couloir de service ; nu nord 5,0) : plinthe de bois côté
    // couloir de service, peinte côté palier
    ch.mur({ de: [-0.3, 4.9625], a: [1.675, 4.9625], ep: 0.075, mats: M.blanc, plinthes: ['S'] });
    // le mitoyen et le mur ouest de la volée (doublé de 20 cm au nord du palier) ; pleins pour le joueur et la caméra
    B(-0.3, Y_PAL, 0.0, ESC.y0, 0, 3.25, M.blanc, { ombre: false, collision: true });
    B(-0.3, ESC.y0, 0.2, 10.25, -0.35, 3.25, M.blanc, { ombre: false, collision: true });
    // le mur est de la trémie (entre la volée et le hall ouest : au rez-de-chaussée, le dos du mur du hall ; il descend
    // jusqu'à la dalle, la cloison du sous-sol prend le relais en dessous) ; au nord, le dos de la réserve ouest (fermée)
    // (finitions du 11/10 : au nord de y 8,3, l'un et l'autre s'arrêtent à 1,55 — au-dessus du rampant, sous la volée 2 de
    // l'escalier principal, qui passe au-dessus de la trémie : js/carte_ecole.js construireEscalier)
    // (13/10, la volée 2 à sa vraie pente — SOUS_V2, en tête : elle couvre la trémie de y 6,0, où elle arrive au 1er, à
    // son bout nord ; le mur est monte par pans de 50 cm jusque sous son limon, au-dessus du rampant, et le dos de la
    // réserve s'arrête à 1,0)
    for (let ya = ESC.y0; ya < 10.25 - 1e-6; ya += 0.5) {
      const yb = Math.min(10.25, ya + 0.5);
      B(1.35, ya, 1.6, yb, DALLE, Math.min(3.25, SOUS_V2(yb) - 0.04), M.blanc, { ombre: false, collision: true });
    }
    B(0.2, 10.175, 1.35, 10.25, DALLE, SOUS_V2(10.25) - 0.04, M.blanc, { ombre: false, collision: true });
    // le SOL du palier : béton peint taupe (lumière et ombre cuites du rez-de-chaussée : uv1 sur RECT)
    const sol = new THREE.Mesh(geoSolNiveau([[0.0, Y_PAL, 1.6, ESC.y0]], 0, RECT), matPalier);
    sol.receiveShadow = true; sol.name = 'sol du palier'; nePasFusionner(sol); decor0.add(sol);
    // la barre de seuil de la porte (y 5,02-5,95) et la cornière du bord du palier
    B(1.6, 5.03, 1.75, 5.94, 0, 0.006, M.inox, { ombre: false });
    B(X_REB, ESC.y0 - 0.045, ESC.x1, ESC.y0, -0.045, 0.004, M.inox, { ombre: false });
    // les plinthes peintes (gris foncé, 10 cm : v_003, v_004)
    plinthe('x', Y_PAL, 0.0, 1.6, 1, 0); plinthe('y', 0.0, Y_PAL, ESC.y0, 1, 0); plinthe('x', ESC.y0, 0.0, 0.2, -1, 0);
    // le plafond (plâtre, 2,50 m) ; il continue au-dessus des premières marches jusqu'au départ du rampant (y 6,65 :
    // relecture du 11/10, le rampant est à 2,95 m des nez)
    ch.plafond(0.0, Y_PAL, 1.6, ESC.y0, H_PALIER, 'platre', { retombees: false });
    ch.plafond(0.2, ESC.y0, 1.35, Y_RAMP0, H_PALIER, 'platre', { retombees: false });
    // LE PANNEAU « 0 » au mur du fond ; LE HUBLOT et, dessous, L'INTERRUPTEUR À VOYANT vert (minuterie) sur le mur qui
    // avance, juste après l'arête (v_014 : le hublot en haut à gauche de l'interrupteur, l'arête à gauche ; v_012 : le
    // « 0 » à gauche du hublot)
    const y0 = ESC.y0;
    panneau(new THREE.MeshStandardMaterial({ map: texPanneauNiveau('0'), roughness: 0.45 }), 0.2, 0.2, 0.0, y0 - 0.28, 1.8, 'E', 0.003);
    ch.opale(0.2, y0 + 0.17, 1.9, 'palierSS', { mur: 'E', r: 0.135, cuireForce: 0.7 });
    ch.lampes[ch.lampes.length - 1].x = 0.32;          // (la source de sa lumière cuite, un rien devant le mur)
    B(0.2, y0 + 0.28, 0.21, y0 + 0.36, 1.16, 1.24, X.blancMat, { ombre: false });
    const v = maille(new THREE.CircleGeometry(0.006, 10), L_.voyant, 0.2145, 1.215, -(y0 + 0.32), Math.PI / 2, decor0, { ombre: false, recoit: false }); void v;
    B(0.21, y0 + 0.3, 0.216, y0 + 0.34, 1.17, 1.215, X.blancMat, { ombre: false });
    // L'OCULUS de la porte du hall ouest est un verre clair (photo 06 : on y voit le hublot et le panneau jaune ; v_001 :
    // « le vitrage, lui, est clair ») — celui des autres portes grises reste sombre, leurs pièces derrière aussi
    const porteHall = decor0.getObjectByName('porte service (hall)');
    if (porteHall) porteHall.traverse((o) => { if (o.isMesh && o.material === M.vitreFente) o.material = M.verre; });
  }

  // =====================================================================
  //  LA VOLÉE (v_008 à v_037)
  // =====================================================================
  // Droite, sans palier intermédiaire : 16 marches de tôle larmée (0,85 x 0,255) entre deux limons d'acier, des
  // contremarches de tôle (on ne les voit pas en descendant). À gauche, le RESSAUT du mitoyen : un rebord blanc large de
  // 25 cm, de niveau avec le palier sur ses deux premiers mètres, qui plonge ensuite jusqu'à -0,30 et passe sous le
  // rampant (le mur du sous-sol, plus épais que celui du rez-de-chaussée). À droite, le GARDE-CORPS inox : main courante de 42 mm à 0,95 m des nez, quatre lisses de
  // 18 mm, des montants plats tous les quatre girons (nez 3, 7, 11, 15) plus le départ et l'arrivée ; derrière, la
  // cloison blanche du couloir. Au-dessus, le RAMPANT blanc parallèle à la volée (2,95 m au-dessus des nez), arrêté au pied par
  // une retombée.
  function construireEscalier() {
    const { x0, x1, G, R } = ESC;
    // les marches (dessus de tôle, UV du monde) et les contremarches
    // (côté mur, les marches vont jusqu'au nu du ressaut, x 0,45 : on n'y voit pas de limon, v_008 à v_021)
    for (let k = 1; k <= 16; k++) {
      const ya = nez(k - 1), yb = nez(k), h = -R * k;
      B(X_REB, ya - 0.012, x1 - 0.03, yb, h - 0.035, h, X.tole, { monde: true });
      B(X_REB, ya - 0.012, x1 - 0.03, ya - 0.006, h - 0.035, h + R - 0.035, X.tole, { ombre: false, monde: true });
      // la caméra ne passe pas sous la volée
      C.ajouterBoite(x0, -ya, x1, -yb, { y0: Y_SS, y1: h - 0.02, joueur: false });
    }
    // la dernière contremarche, sur le sol du -1
    B(X_REB, ESC.yPied - 0.006, x1 - 0.03, ESC.yPied, Y_SS, Y_SS + R, X.tole, { ombre: false, monde: true });
    // le limon côté vide (fer en U, gris) : un plat incliné qui dépasse de 5 cm la ligne des nez
    const pente = Math.atan2(R, G), Lv = Math.hypot(ESC.yPied - ESC.y0, 16 * R);
    // (raccourci de 15 cm en haut : son bout ne dépasse pas du palier)
    const dl = 0.075, limon = maille(boiteM(0.03, 0.24, Lv - 2 * dl), X.limon, x1 - 0.015, -R * 8 + 0.05 - 0.12 / Math.cos(pente) - dl * Math.sin(pente),
      -((ESC.y0 + ESC.yPied) / 2 + dl * Math.cos(pente)), 0, ch.decor);
    limon.rotation.x = -pente;
    // LE RESSAUT du mitoyen (x 0,2-0,45) : le mur du sous-sol, du sol du -1 à son rebord, extrudé. Son PROFIL (plan V2,
    // soussol.md § 2.1) : sur v_006 et v_010, une tablette de 25 cm presque DE NIVEAU avec le palier (-0,03) sur les deux
    // premiers mètres — vue du palier, un large bandeau blanc à gauche —, qui ne plonge qu'ensuite, jusqu'à -0,30 en
    // y 9,51 (la pente unique, de 20 cm, n'en montrait qu'un filet)
    const sh = new THREE.Shape(), s = (y) => y - ESC.y0, yR = 14.3 + DY_SS;
    sh.moveTo(0, Y_SS); sh.lineTo(0, -0.03); sh.lineTo(s(Y_REB1), -0.03); sh.lineTo(s(Y_REB2), -0.3); sh.lineTo(s(yR), -0.3); sh.lineTo(s(yR), Y_SS); sh.closePath();
    const ressaut = maille(new THREE.ExtrudeGeometry(sh, { depth: X_REB - 0.2, bevelEnabled: false }), M.blanc, 0.2, 0, -ESC.y0, Math.PI / 2, ch.decor, { ombre: false });
    void ressaut;
    // (le petit objet jaune posé sur le rebord : v_008 à v_017 — sur son dessus, et non plus 2,5 cm dessous ; v_010, la
    // pose recalée, le met au bout de la partie de niveau, en y ≈ 7,8 — rang 1 140, colonne 125 —, et non vers la 3e
    // marche, y 6,81 : posé là, il sortait au pied de l'image ; relecture du 11/10, à la pose refaite sur les nez et les
    // montants — rang 1 148, colonne 128 —, en y 7,6, au milieu du rebord)
    B(0.30, 7.57, 0.37, 7.63, -0.03, -0.005, std({ color: 0xe0b32a, roughness: 0.6 }), { ombre: false });
    // LA CLOISON entre la volée et le couloir (x 1,35-1,50), du sol du -1 à la dalle, jusqu'au pilier du pied
    // (elle borde aussi le couloir au sud du palier) ; LE MUR OUEST du hall
    mur({ de: [1.425, Y_COUL0 - 0.15], a: [1.425, ESC.yPied], mats: M.blanc, plinthes: ['E'] });
    plinthe('x', ESC.yPied, 1.35, 1.5, 1);
    // le monde solide : le garde-corps et la cloison à l'est, le ressaut et le mur à l'ouest (du sol du -1 au plafond
    // du rez-de-chaussée : au palier, le joueur d'en haut ne passe pas)
    // (finitions du 11/10 : au nord de y 8,3, jusqu'à 1,55 seulement — au-dessus passe la volée 2 de l'escalier principal,
    // js/carte_ecole.js construireEscalier)
    // (13/10 : sous le limon de la volée 2 à sa vraie pente, par pans de 50 cm — SOUS_V2)
    for (let ya = ESC.y0; ya < ESC.yPied - 1e-6; ya += 0.5) {
      const yb = Math.min(ESC.yPied, ya + 0.5);
      C.ajouterBoite(x1, -ya, 1.5, -yb, { y0: Y_SS, y1: Math.min(3.25, SOUS_V2(yb) - 0.04) });
    }
    C.ajouterBoite(0.0, -ESC.y0, X_REB, -(14.3 + DY_SS), { y0: Y_SS, y1: 3.25 });
    // (la volée n'a que 85 cm : deux guides en biais, invisibles, au bord du palier — qui arrive de travers glisse
    // dans la volée au lieu de buter contre le ressaut ou le mur est)
    const biais = (xa, ya, xb, yb) => C.ajouterBoiteOrientee((xa + xb) / 2, -(ya + yb) / 2, Math.hypot(xb - xa, yb - ya) / 2, 0.02, Math.atan2(-(yb - ya), xb - xa), { y0: 0, y1: 1.9, camera: false });
    biais(0.0, ESC.y0 - 0.36, X_REB + 0.03, ESC.y0 + 0.03);
    biais(1.22, ESC.y0 + 0.03, 1.62, ESC.y0 - 0.1);
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
    // LE RAMPANT (plâtre blanc, tourné vers le bas) de y 6,65 à 9,99, de x 0,2 à 1,35, du plafond du palier (2,50) à la
    // face de la retombée du pied (+0,14)
    const Lr = Math.hypot(Y_RAMP1 - Y_RAMP0, rampant(Y_RAMP0) - rampant(Y_RAMP1));
    const rp = maille(new THREE.PlaneGeometry(1.15, Lr), M.platre, 0.775, (rampant(Y_RAMP0) + rampant(Y_RAMP1)) / 2, -(Y_RAMP0 + Y_RAMP1) / 2, 0, ch.decor, { ombre: false });
    rp.rotation.order = 'YXZ'; rp.rotation.x = Math.PI / 2 - pente; rp.userData.horsAOSol = true;
    // (la retombée du pied : sous-face à -0,78, sur toute la largeur du hall, la poutre de v_035 ; sa face sud monte
    // jusqu'à la dalle, et au-dessus de la volée jusqu'au rampant : le grand bandeau blanc au-dessus de l'ouverture, vu de
    // la volée — v_010, v_015 à v_034)
    B(0.4, Y_RET, 2.42, Y_RET + 0.27, H_HALL - 0.08, DALLE, M.platre, { ombre: false });
    B(0.2, Y_RET, 1.35, 10.175, DALLE - 0.01, rampant(Y_RET) + 0.02, M.platre, { ombre: false }).userData.horsAOSol = true;
    // LA CAMÉRA : le rampant en marches (son point le plus bas de chaque giron, jusqu'au plafond du rez-de-chaussée), et
    // sous le palier, le plein
    for (let k = 0; k < 16; k++) {
      const ya = Math.max(nez(k), Y_RAMP0), yb = Math.min(nez(k + 1), Y_RAMP1);
      if (yb <= ya) continue;
      // (13/10 : jusque sous le limon de la volée 2 de l'escalier principal, qui passe au-dessus — SOUS_V2)
      C.plafond(0.2, -yb, 1.35, -ya, rampant(yb), Math.max(0.1, Math.min(3.25, SOUS_V2(yb) - 0.3) - rampant(yb)));
    }
    C.ajouterBoite(0.0, -Y_PAL, 1.6, -ESC.y0, { y0: Y_SS, y1: -0.02, joueur: false });
    // le panneau « -1 » au mur ouest du pied de l'escalier, le bloc de sortie au-dessus, son fourreau, deux étiquettes
    panneau(new THREE.MeshStandardMaterial({ map: texPanneauNiveau('-1'), roughness: 0.45 }), 0.2, 0.2, 0.4, 10.53, Y_SS + 1.6, 'E');
    ch.sortie(0.43, 10.53, Y_SS + 2.18, 'E');
    B(0.4, 10.53, 0.42, 10.55, Y_SS + 2.25, DALLE, X.blancMat, { ombre: false });
    for (const [y, h] of [[10.96, 1.45], [11.03, 1.45]]) B(0.4, y, 0.403, y + 0.05, Y_SS + h, Y_SS + h + 0.035, std({ color: 0xd9637a, roughness: 0.5 }), { ombre: false });
  }

  // =====================================================================
  //  LES MURS DU -1
  // =====================================================================
  function construireMurs() {
    const B0 = M.blanc;
    // le mur ouest du hall (le mitoyen, x 0,2-0,4) et son mur du fond
    mur({ de: [0.3, 14.3 + DY_SS], a: [0.3, Y_FOND + 0.15], ep: 0.2, mats: B0, plinthes: ['E'] });
    mur({ de: [0.2, Y_FOND + 0.075], a: [2.55, Y_FOND + 0.075], mats: B0, plinthes: ['S'] });
    // LE MUR entre le couloir (et le hall) et l'espace pause, et ses deux portes grises (v_038 à v_058)
    mur({ de: [X_MUR, Y_COUL0 - 0.15], a: [X_MUR, Y_FOND + 0.15], ep: EP_MUR, mats: B0, plinthes: ['W'],
      ouvertures: [{ c: PORTE_PAUSE, l: L_PORTE + 0.02 }, { c: PORTE_HALL, l: L_PORTE + 0.02 }] });
    // (côté espace pause, ses plinthes grises à elle)
    for (const [a0, a1] of [[7.51, PORTE_PAUSE - 0.52], [PORTE_PAUSE + 0.52, PORTE_HALL - 0.52], [PORTE_HALL + 0.52, 11.71]]) plinthe('y', X_MUR + EP_MUR / 2, a0, a1, 1, Y_SS, X.plintheSalle);
    // le fond du couloir (au sud) et son caisson
    mur({ de: [1.35, Y_COUL0 - 0.075], a: [2.55, Y_COUL0 - 0.075], mats: B0, plinthes: ['N'] });
    // LE HALL : un ressaut au mur est, après la porte (v_037). (Relecture du 11/10 : un DÉCROCHEMENT, pas un pilier — sur
    // v_036 à v_038, du coin du fond, le pied du mur est vient droit jusqu'à l'arête, puis la plinthe tourne vers l'EST
    // avant de filer à la porte : au nord de l'arête, le mur est 15 cm plus épais jusqu'au fond, le hall y a 1,87 m)
    B(2.27, 11.46, 2.42, Y_FOND, Y_SS, DALLE, B0, { ombre: false, collision: true });
    plinthe('x', 11.46, 2.27, 2.42, -1); plinthe('y', 2.27, 11.46, Y_FOND, -1);
    // ---- L'ESPACE PAUSE ----
    const P = X.plintheSalle;
    // le retour sud, à droite de l'entrée (l'affiche « 100 % »), l'aile des distributeurs (ouest et sud)
    mur({ de: [2.42, 7.435], a: [5.0, 7.435], mats: B0, plinthes: ['N'], plinthe: P });
    mur({ de: [4.925, 2.26], a: [4.925, 7.51], mats: B0, plinthes: ['E'], plinthe: P });
    // (10/10, la vidéo officielle de 2021, q_0088-q_0097, q_0137-q_0142 : le mur ouest de l'aile est VERT ANIS jusqu'à
    // 2,30 m, comme le mur nord ; le mur sud porte une PORTE GRISE, x 9,7-10,6, fermée)
    B(5.0, 2.41, 5.005, 7.51, Y_SS + 0.1, H_RET, X.vert, { ombre: false });
    mur({ de: [4.85, 2.335], a: [13.05, 2.335], mats: B0, plinthes: ['N'], plinthe: P, ouvertures: [{ c: 10.15, l: 0.95 }] });
    // le mur est : la PORTE SOMBRE (ouverte, v_065 ; y 5,11-6,01 — derrière, le passage sombre vers le sas technique,
    // js/ecole_soussol_est.js) ; le sas des toilettes au nord
    mur({ de: [12.975, 2.26], a: [12.975, 11.86], mats: B0, plinthes: ['W'], plinthe: P, ouvertures: [{ c: 5.56, l: 0.9 }] });
    mur({ de: [10.45, 9.51], a: [12.9, 9.51], ep: 0.1, mats: B0, plinthes: ['S', 'N'], plinthe: P });
    mur({ de: [10.45, 10.91], a: [12.9, 10.91], ep: 0.1, mats: B0, plinthes: ['S'], plinthe: P });
    mur({ de: [10.5, 10.86], a: [10.5, 11.86], ep: 0.1, mats: B0, plinthes: ['W'], plinthe: P });
    // LE MUR NORD, VERT ANIS (v_060 à v_064) : peint de vert jusqu'à 2,30 m, la retombée blanche au-dessus
    // (10/10 : percé de la porte de la grande salle S -1.14, js/ecole_amphi.js — le fixe dépoli x 8,85-9,35, le vantail
    // x 9,35-10,25, l'imposte jusqu'à la retombée ; le fixe et l'imposte, translucides, ont leur vitre au monde solide)
    // (la cloison vitrée en x 3,6-5,17 : voir meublerPause ; le vert de part et d'autre, jusqu'à 8,82)
    mur({ de: [2.42, 11.785], a: [13.05, 11.785], mats: B0, plinthes: ['S'], plinthe: P, ouvertures: [{ c: 9.55, l: 1.4, h: H_RET }] });
    for (const [a, b] of [[2.55, 3.6], [5.17, 8.82]]) B(a, 11.705, b, 11.71, Y_SS + 0.1, H_RET, X.vert, { ombre: false });
  }

  // =====================================================================
  //  LES SOLS (et le monde solide des deux niveaux)
  // =====================================================================
  function construireSols() {
    const sol = (rects, mat, nom) => {
      const m = new THREE.Mesh(geoSolNiveau(rects, Y_SS, R_SS), mat);
      m.receiveShadow = true; m.castShadow = false; m.name = nom; m.userData.solSS = true; groupe.add(m);
    };
    sol([[0.4, ESC.yPied, 2.42, Y_FOND], [0.4, Y_REB2, 1.35, ESC.yPied]], SOL.hall, 'sol du hall du -1');
    sol([[1.5, Y_COUL0, 2.42, ESC.yPied]], SOL.couloir, 'sol du couloir du -1');
    sol([[2.42, 7.51, 12.9, 9.46], [2.55, 9.46, 10.45, 11.71], [5.0, 2.41, 12.9, 7.51], [10.45, 9.56, 12.9, 10.86], [2.42, 10.21, 2.55, 11.31]], SOL.pause, 'sol de l\'espace pause');
    // les barres de seuil inox des deux portes
    for (const c of [PORTE_PAUSE, PORTE_HALL]) B(X_MUR - 0.07, c - 0.5, X_MUR + 0.07, c + 0.5, Y_SS, Y_SS + 0.006, M.inox, { ombre: false });
    // LE MONDE SOLIDE. Au rez-de-chaussée, des dalles à 0 au-dessus de tout le sous-sol SAUF la trémie (x -0,3-1,6,
    // y 4,95-10,2) : le palier y est une dalle à lui (DALLES_RDC : avec la grande salle S -1.14 — au-dessus, la salle
    // David Clark, le C01, les locaux du fond — et le passage sombre, sous la pile). En bas, une dalle à Y_SS sous tout.
    // La volée : une rampe par le milieu des marches.
    for (const [a, b, c, d] of DALLES_RDC) C.sol(a, -b, c, -d, 0);
    C.sol(0.0, -Y_PAL, 1.6, -ESC.y0, 0);                                      // le palier
    C.rampe(ESC.x0, -(ESC.y0 + (ESC.n - 0.5) * ESC.G), ESC.x1, -(ESC.y0 - ESC.G / 2), 'z', -(ESC.y0 - ESC.G / 2), 0, -(ESC.y0 + (ESC.n - 0.5) * ESC.G), Y_SS);
    C.sol(0.4, -1.0, 13.05, -16.66, Y_SS);
    const [ea, eb, ec, ed] = EMPRISE_AMPHI;
    C.sol(ea, -eb, ec, -ed, Y_SS);
    // pour la caméra seule : la dalle du rez-de-chaussée (au-dessus des plafonds du -1)
    for (const [a, b, c, d] of DALLES_RDC) C.ajouterBoite(a, -b, c, -d, { y0: DALLE, y1: -0.01, joueur: false });
  }

  // =====================================================================
  //  LES PLAFONDS ET LES LUMIÈRES
  // =====================================================================
  function construirePlafonds() {
    // le hall (plâtre, 2,36 m), deux spots ; le couloir (2,50 m), cinq spots, le caisson et la grille noire du fond
    // (v_036 à v_038 : un spot près de la volée, une poutre en travers, le second spot au fond, sous le bloc lumineux)
    ch.plafond(0.4, ESC.yPied, 2.42, Y_FOND, H_HALL, 'platre', { retombees: false });
    for (const y of [10.86, 12.66]) spot(1.41, y, H_HALL, 'hallSS');
    B(0.4, 11.86, 2.42, 12.06, H_HALL - 0.12, H_HALL + 0.01, M.platre, { ombre: false });
    C.plafond(0.4, -12.06, 2.42, -11.86, H_HALL - 0.12, 0.13);
    ch.plafond(1.5, Y_COUL0, 2.42, ESC.yPied, H_COUL, 'platre', { retombees: false });
    // (quatre spots au pas de 1,8, le premier à 1,18 m du hall et le dernier à 0,4 m du caisson ; v_050 en montre deux
    // avant le caisson, le troisième s'y cache)
    for (const y of [8.91, 7.11, 5.31, 3.51]) spot(1.96, y, H_COUL, 'couloirSS');
    B(1.5, Y_COUL0, 2.42, Y_COUL0 + 0.8, Y_SS + 2.1, H_COUL, M.platre, { ombre: false });
    B(1.6, Y_COUL0 + 0.795, 2.32, Y_COUL0 + 0.8, Y_SS + 2.18, Y_SS + 2.26, std({ color: 0x141414, roughness: 0.6 }), { ombre: false });
    C.plafond(1.5, -(Y_COUL0 + 0.8), 2.42, -Y_COUL0, Y_SS + 2.1, H_COUL - Y_SS - 2.1);
    // LE PLAFOND DE L'ESPACE PAUSE (v_061 à v_067) : dalles blanches de 60 x 60 sur ossature, à 2,55 m, coupées de
    // retombées de plâtre à 2,30 m (une bande parallèle au mur vert, à 1,3 m de lui ; une entre la salle et l'aile ; une
    // en travers ; le caisson au-dessus de la tablette) : des caissons, chacun ses plafonniers ronds
    ch.plafond(2.55, 7.51, 12.9, 9.46, H_PAUSE, 'dalles', { retombees: false });
    ch.plafond(2.55, 9.46, 10.45, 11.71, H_PAUSE, 'dalles', { retombees: false });
    ch.plafond(5.0, 2.41, 12.9, 7.51, H_PAUSE, 'dalles', { retombees: false });
    ch.plafond(10.55, 9.56, 12.9, 10.86, H_SAS, 'platre', { retombees: false });
    B(10.45, 9.51, 10.55, 10.91, H_SAS, H_PAUSE + 0.01, M.platre, { ombre: false });       // (le linteau du sas)
    const ret = (x0, y0, x1, y1) => {
      B(x0, y0, x1, y1, H_RET, H_PAUSE + 0.01, M.platre, { ombre: false });
      C.plafond(x0, -y1, x1, -y0, H_RET, H_PAUSE - H_RET + 0.3);
    };
    ret(2.55, 10.26, 10.45, 10.56);
    ret(5.0, 7.36, 12.9, 7.66);
    ret(7.7, 2.41, 8.0, 7.36); ret(7.7, 7.66, 8.0, 10.26);
    ret(12.4, 5.81, 12.9, 9.46);
    // la dalle qui manque au-dessus du baby-foot (le noir du plénum) et le détecteur rond près du sas
    B(9.75, 7.66, 10.35, 8.26, H_PAUSE - 0.003, H_PAUSE + 0.2, std({ color: 0x0d0d0c, roughness: 1 }), { ombre: false });
    maille(new THREE.CylinderGeometry(0.06, 0.07, 0.04, 18), X.blancMat, 10.0, H_PAUSE - 0.02, -9.11, 0, ch.decor, { ombre: false });
    // les plafonniers ronds (une douzaine)
    for (const [x, y] of [[3.8, 11.11], [6.2, 11.11], [9.3, 11.11], [3.8, 8.91], [6.2, 8.91], [9.3, 8.91], [11.3, 8.51],
      [6.4, 5.51], [9.4, 5.51], [11.3, 5.51], [6.4, 3.51], [9.4, 3.51], [11.3, 3.51]]) plafonnier(x, y, H_PAUSE, 'pauseSS');
    for (const x of [11.2, 12.3]) spot(x, 10.21, H_SAS, 'pauseSS', { force: 0.8 });
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
      papiers(P, c === PORTE_HALL ? 2 : 1);
      // (par l'oculus, l'espace pause : v_043, v_055 — un verre clair)
      P.g.traverse((o) => { if (o.isMesh && o.material === M.vitreFente) o.material = M.verre; });
      // le ferme-porte à glissière, côté couloir : le rail et le boîtier, en haut de l'huisserie
      B(X_MUR - EP_MUR / 2 - 0.04, c - 0.45, X_MUR - EP_MUR / 2 - 0.01, c + 0.1, Y_SS + 2.09, Y_SS + 2.12, M.ferme, { ombre: false });
    }
    // LA PORTE GRISE G du mur sud de l'aile (vidéo officielle, q_0135, q_0137-q_0139 : à droite du trombinoscope de
    // 2021, oculus étroit cerclé de bois, ferme-porte côté salle) : fermée — ce qu'il y a derrière n'est pas vu
    ch.porte('x', 2.335, 10.15, { l: 0.93, h: 2.04, ep: 0.15, base: Y_SS, modele: 'grise', etat: 'fermee', cote: 'S', nom: 'G (aile du -1)' });
  }

  // =====================================================================
  //  LE HALL DU -1 ET LE COULOIR : l'extincteur, la consigne, l'interrupteur
  // =====================================================================
  function garnirHall() {
    // L'EXTINCTEUR (v_027 à v_037), son pictogramme au-dessus
    // (plan V2, soussol.md § 2.2 : plus bas — le corps à partir de 0,9 m, le pictogramme à 1,65 ; à 1,13 et 1,85, au
    // ras de la volée, il emplissait le premier plan. Et TRAPU : sur v_010 et v_035, rejoués au jeu, un corps de 0,46 m
    // sortait deux fois trop grand à la place où l'image le met ; sur v_035, net, son diamètre fait la moitié de sa
    // hauteur — celui du hall ouest, sur la photo r01, a la même allure : un corps de 0,36 sur une porte de 2,04, Ø 0,16)
    // (Relecture du 11/10 : plus petit encore — sur v_033 à v_035, le corps rouge ne fait que 1,7 à 1,8 fois son
    // diamètre, et sur v_010, à la pose refaite, l'extincteur entier, flexible compris, tient de 0,82 à 1,26 m : un corps
    // de 0,30 (0,85-1,15), Ø 0,17. Le flexible noir fait une BOUCLE au-dessus de la tête — v_033, v_034 —, et une
    // étiquette verte pend dessous)
    const ex = new THREE.Group(); ex.position.set(0.5, Y_SS, -Y_EXT); ch.decor.add(ex);
    maille(new THREE.CylinderGeometry(0.085, 0.085, 0.30, 18), X.rouge, 0, 1.00, 0, 0, ex);
    maille(new THREE.SphereGeometry(0.085, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2), X.rouge, 0, 1.15, 0, 0, ex);
    maille(new THREE.CylinderGeometry(0.026, 0.026, 0.05, 10), X.noir, 0, 1.25, 0, 0, ex);
    B(0.55, Y_EXT - 0.026, 0.6, Y_EXT + 0.026, Y_SS + 1.23, Y_SS + 1.28, X.noir);
    tube(ch.decor, X.noir, P3(0.5, Y_SS + 1.27, Y_EXT + 0.02), P3(0.52, Y_SS + 1.32, Y_EXT + 0.06), 0.01, 8);
    tube(ch.decor, X.noir, P3(0.52, Y_SS + 1.32, Y_EXT + 0.06), P3(0.58, Y_SS + 1.12, Y_EXT + 0.07), 0.01, 8);
    panneau(new THREE.MeshStandardMaterial({ color: 0xf6f6f2, roughness: 0.6 }), 0.09, 0.12, 0.5 + 0.086, Y_EXT, Y_SS + 0.98, 'E', 0.001);
    B(0.495, Y_EXT - 0.012, 0.505, Y_EXT + 0.012, Y_SS + 0.79, Y_SS + 0.85, std({ color: 0x3f8f4a, roughness: 0.6 }), { ombre: false });
    C.ajouterCercle(0.51, -Y_EXT, 0.095, { y0: Y_SS + 0.7, y1: Y_SS + 1.36 });
    panneau(new THREE.MeshStandardMaterial({ map: texPictoExtincteur(), roughness: 0.6 }), 0.15, 0.15, 0.4, Y_EXT, Y_SS + 1.65, 'E');
    // LA CONSIGNE vert pâle sous son protège-document, l'interrupteur dessous (mur est, v_037 à v_039 ; sur le nu du
    // décrochement, x 2,27)
    panneau(new THREE.MeshStandardMaterial({ map: texConsigneVerte(), roughness: 0.3 }), 0.15, 0.35, 2.27, Y_FOND - 0.45, Y_SS + 1.85, 'W', 0.006);
    B(2.26, Y_FOND - 0.49, 2.27, Y_FOND - 0.41, Y_SS + 1.46, Y_SS + 1.54, X.blancMat, { ombre: false });
    // (deux affichettes A4 au mur du couloir, près de la porte de l'espace pause)
    panneau(new THREE.MeshStandardMaterial({ map: texAffiche('#2f6fb0', '#fbfbf8', 41), roughness: 0.7 }), 0.21, 0.297, 1.5, PORTE_PAUSE + 0.75, Y_SS + 1.55, 'E');
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
  // poignées noires, les joueurs rouges et bleus, le feutre vert. DANS LA LONGUEUR NORD-SUD (plan V2, soussol.md § 2.4 :
  // sur v_060 et v_067, vers l'est, on voit son grand côté de bois avec un pare-chocs orange à CHAQUE bout, à gauche et à
  // droite — posé est-ouest, il était tourné de 90°)
  const babyFoot = (x, y) => {
    const g = new THREE.Group(); g.position.set(x, Y_SS, -y); g.rotation.y = Math.PI / 2; ch.decor.add(g);
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
    // (tourné : ± 0,475 en x — la caisse et les poignées —, ± 0,725 en y)
    C.ajouterBoite(x - Lz / 2 - 0.1, -(y - Lx / 2), x + Lz / 2 + 0.1, -(y + Lx / 2), { y0: Y_SS, y1: Y_SS + 0.95 });
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
      mangeDebout(x, 11.26, 'colonne');
      tabouret(x + (i % 2 ? 0.05 : -0.05), 10.78, 0, -1, i === 1 || i === 3 ? 'tolix' : 'miura');
    });
    // ---- l'îlot central : des mange-debout trépieds, deux Tolix verts, des tabourets noirs. (Relecture du 09/10 :
    // v_059 et v_060, de la porte, montrent TROIS MÈTRES DE CARRELAGE NU devant soi — le premier tabouret à plus de
    // 3 m, la grande table en X à ≈ 4,5 m droit devant, le baby-foot derrière elle, la table grise à droite au bord de
    // l'aile ; l'îlot posé à 1 m de la porte barrait l'entrée. Plan V2, soussol.md § 2.4 : de trois tables, décalé de
    // 0,7 m vers l'est — la quatrième et ses deux tabourets en moins ; l'entrée reste libre sur 3,5 à 4 m.
    // RELECTURE DU 11/10, en jouant : ainsi posés, l'îlot, le baby-foot tourné et le mur du sas des toilettes FERMAIENT
    // le nord de l'espace pause — on n'atteignait plus ni la porte de la grande salle ni le sas (remplissage au pas de
    // 5 cm depuis le hall du -1). Or la vidéo montre, de l'entrée vers le nord, le carrelage nu devant les cinq
    // mange-debout du mur vert jusqu'à la porte de la grande salle et au sas — 5 im/s de 18,4 à 22,5 s. D'où : l'îlot
    // reculé de 0,25 à 0,35 m vers le sud, ses tabourets tournés hors du passage — un couloir de 0,9 m devant les
    // tabourets du mur vert —, et le baby-foot 0,26 m plus au sud, sous la dalle qui manque au plafond (x 9,75-10,35 ×
    // y 7,66-8,26) : 0,85 m entre son bout nord et l'angle du sas) ----
    mangeDebout(6.8, 9.35, 'trepied'); autour(6.8, 9.35, 0.5, [200, 300], ['miura', 'tolix']);
    mangeDebout(8.0, 9.4, 'trepied'); autour(8.0, 9.4, 0.5, [200, 340], ['tolix', 'miura']);
    mangeDebout(9.1, 9.01, 'trepied'); autour(9.1, 9.01, 0.5, [120, 220]);
    // ---- le baby-foot (nord-sud), la grande table en X devant lui, l'autre devant les distributeurs ----
    babyFoot(9.9, 7.9);
    grandeTable(7.2, 8.01); autour(7.2, 8.01, 0.62, [60, 180, 300]);
    grandeTable(11.0, 4.21); autour(11.0, 4.21, 0.62, [90, 200, 320]);
    // (relecture du 11/10 : plus de TABLE GRISE au milieu, x 8,0-9,2 y 6,46-7,04, ni ses deux tabourets. Le plateau gris
    // au bord droit de v_059 et v_060 est plus bas dans l'image que la table en X, donc plus PRÈS : à ≈ 2,9 m de la porte,
    // à 23° sur la droite — le bout nord de la tablette aux micro-ondes de l'aile, x 5,0-5,35 ; et sur v_066 et v_067,
    // qui balaient ce coin-là, il n'y a que du carrelage. Il reste 21 tabourets, ceux qu'on compte sur la vidéo)
    // ---- LA TABLETTE HAUTE murale (mur est, y 6,01-8,81) : stratifié gris clair, pieds d'acier, trois tabourets dessous ----
    B(12.48, 6.01, 12.9, 8.81, Y_SS + 1.02, Y_SS + 1.05, X.tablette, { collision: true });
    for (const y of [6.11, 7.41, 8.71]) B(12.5, y - 0.02, 12.54, y + 0.02, Y_SS, Y_SS + 1.02, X.acierGris);
    for (const y of [6.51, 7.41, 8.31]) tabouret(12.25, y, 1, 0);
    // les trois petits cadres au-dessus, le trombinoscope et sa plaque noire au bout sud
    [7.31, 7.76, 8.26].forEach((y, i) => {
      B(12.885, y - 0.11, 12.9, y + 0.11, Y_SS + 1.55, Y_SS + 1.72, X.noir, { ombre: false });
      panneau(new THREE.MeshStandardMaterial({ map: texCadre(i), roughness: 0.5 }), 0.19, 0.14, 12.885, y, Y_SS + 1.635, 'W', 0.001);
    });
    B(12.88, 5.99, 12.9, 6.73, Y_SS + 1.24, Y_SS + 2.26, X.montant, { ombre: false });
    panneau(new THREE.MeshStandardMaterial({ map: texTrombi(), roughness: 0.55 }), 0.7, 0.98, 12.88, 6.36, Y_SS + 1.75, 'W', 0.002);
    B(12.885, 6.81, 12.9, 7.01, Y_SS + 1.7, Y_SS + 1.84, X.noir, { ombre: false });
    // ---- LA PORTE SOMBRE (ouverte, vantail sombre rabattu dedans) ----
    // (10/10, la visite officielle : derrière la porte, un passage vers le sas technique et l'escalier est, éteint quand
    // Haythem a filmé. Plan V2 : la pause a reculé de 4,09 m, le passage P de 2021 — tenu par l'escalier est — non ; un
    // PASSAGE SOMBRE en baïonnette les relie, js/ecole_soussol_est.js. La porte, posée depuis 2021, reste : huisserie
    // blanche, vantail sombre, gond au sud, ouvert presque à plat contre le mur sud du passage)
    const yl0 = 5.11, yl1 = 6.01;
    for (const y of [yl0 - 0.025, yl1 + 0.025]) B(12.88, y - 0.025, 13.07, y + 0.025, Y_SS, Y_SS + 2.07, X.blancMat, { ombre: false });
    B(12.88, yl0 - 0.05, 13.07, yl1 + 0.05, Y_SS + 2.04, Y_SS + 2.09, X.blancMat, { ombre: false });
    const vl = new THREE.Group(); vl.position.set(13.07, Y_SS, -(yl0 + 0.03)); vl.rotation.y = 0.1; ch.decor.add(vl);
    maille(boiteM(0.88, 2.02, 0.04), X.sombre, 0.44, 1.01, 0, 0, vl);
    C.ajouterBoiteOrientee(13.07 + 0.44 * Math.cos(0.1), -(yl0 + 0.03) - 0.44 * Math.sin(0.1), 0.44, 0.03, -0.1, { y0: Y_SS, y1: Y_SS + 2.04 });
    // ---- LES TROIS DISTRIBUTEURS (du nord au sud : friandises, boissons chaudes, froid) ----
    distributeur(4.58, L_.friandises);
    distributeur(3.73, L_.cafe, { vitre: false, montant: false });
    distributeur(2.88, L_.frais);
    // ---- LE COIN NORD-EST : poubelle bleue, deux A4 bleues, la grille à persiennes ----
    const poubelle = (x, y, mat, c = 0.36) => {
      B(x - c / 2, y - c / 2, x + c / 2, y + c / 2, Y_SS, Y_SS + 0.62, mat, { collision: true });
      B(x - c / 2 + 0.03, y - c / 2 + 0.03, x + c / 2 - 0.03, y + c / 2 - 0.03, Y_SS + 0.62, Y_SS + 0.625, X.noir, { ombre: false });
    };
    // (10/10 : collée au mur du sas — la porte de la grande salle, élargie à 1,40 m d'après la vidéo de 2021, passe à
    // 18 cm d'elle ; on entre entre le fixe et la poubelle)
    poubelle(10.26, 11.46, X.bleuPoubelle);
    // (les graines des deux A4 : celles d'avant le décalage — les mêmes feuilles)
    for (const [y, h] of [[11.11, 1.45], [11.46, 1.5]]) panneau(new THREE.MeshStandardMaterial({ map: texAffiche('#2f6fb0', '#fbfbf8', Math.round((y - DY_SS) * 10)), roughness: 0.7 }), 0.21, 0.297, 10.45, y, Y_SS + h, 'W');
    panneau(new THREE.MeshStandardMaterial({ map: texPersiennes(), roughness: 0.55 }), 0.6, 0.38, 10.45, 11.36, Y_SS + 2.08, 'W', 0.01);
    // ---- LE SAS DES TOILETTES : deux portes crème à plaque rouge (fermées), les casiers blancs dans la niche ----
    const porteWC = (x, y, face) => {
      const g = new THREE.Group(); g.position.set(x, Y_SS, -y); g.rotation.y = ROT[face]; ch.decor.add(g);
      maille(boiteM(0.9, 2.08, 0.03), X.creme, 0, 1.04, 0.006, 0, g, { ombre: false });
      maille(boiteM(0.8, 2.0, 0.035), X.porteCreme, 0, 1.0, 0.02, 0, g, { ombre: false });
      maille(boiteM(0.12, 0.12, 0.006), X.rougePlaque, 0, 1.72, 0.04, 0, g, { ombre: false });
      maille(boiteM(0.12, 0.02, 0.02), M.inox, 0.3, 1.02, 0.05, 0, g, { ombre: false });
    };
    porteWC(12.9, 10.21, 'W'); porteWC(11.7, 10.86, 'S');
    // (intégration du 10/10 : solide — la caméra, tournée vers l'est depuis l'îlot, entrait dans le meuble)
    B(12.62, 8.86, 12.9, 9.46, Y_SS + 1.0, Y_SS + 1.9, X.blancMat, { collision: true });
    panneau(new THREE.MeshStandardMaterial({ map: texCasiers(), roughness: 0.6 }), 0.56, 0.88, 12.62, 9.16, Y_SS + 1.45, 'W', 0.001);
    poubelle(12.72, 9.16, X.grisPoubelle, 0.3);
    // ---- LE MUR VERT : la cloison vitrée dépolie et sa porte (x 3,6-5,17), les deux affiches encadrées, l'affiche
    // bordeaux au QR ; la porte vitrée de l'est (x 8,85-10,25) est celle de la grande salle S -1.14 : js/ecole_amphi.js.
    // (Plan V2 — soussol.md § 2.4, confiance moyenne — : la cloison en x 2,6-4,2, « au bout ouest du mur, juste après
    // l'angle » (20,85-20,98 s). REJOUÉ AU JEU (11/10) : posée là, elle sort à gauche du cadre de v_064. Deux poses
    // ajustées sur les deux cadres et le bord de la porte de la grande salle — v_064 et l'image de 20,98 s, à 11 px
    // près, de f 900 à f 1 400 — mettent le bord est de la cloison en x 5,1-5,2, le jambage ouest de son vantail vers
    // 4,45, sa poignée sur ce jambage (les gonds à l'est : pas de fixe entre le vantail et le vert) et l'affiche
    // bordeaux juste après, vers 5,3 ; à 20,98 s, le bord gauche de l'image est vers x 4,4 — ce n'est pas l'angle. Le
    // fixe, s'il y en a un, est à l'ouest du vantail ; le vert, de part et d'autre)
    const yC = 11.71;
    const cloison = (a, b, montants) => {
      const y = yC - 0.035;
      B(a, y, b, yC, Y_SS, Y_SS + 0.05, X.creme, { ombre: false });
      B(a, y, b, yC, H_RET - 0.06, H_RET, X.creme, { ombre: false });
      B(a, y, b, yC, Y_SS + 2.08, Y_SS + 2.13, X.creme, { ombre: false });
      for (const x of montants) B(x - 0.03, y - 0.005, x + 0.03, yC, Y_SS, H_RET, X.creme, { ombre: false });
      for (let i = 0; i < montants.length - 1; i++) {
        const xa = montants[i] + 0.03, xb = montants[i + 1] - 0.03;
        B(xa, y + 0.01, xb, y + 0.02, Y_SS + 0.05, Y_SS + 2.08, X.depoli, { ombre: false });
        B(xa, y + 0.01, xb, y + 0.02, Y_SS + 2.13, H_RET - 0.06, X.depoli, { ombre: false });
      }
    };
    cloison(3.6, 5.17, [3.63, 4.22, 5.14]);
    B(4.28, yC - 0.08, 4.4, yC - 0.06, Y_SS + 1.02, Y_SS + 1.05, M.inox, { ombre: false });
    maille(new THREE.CylinderGeometry(0.013, 0.013, 0.02, 10), M.inox, 4.31, Y_SS + 0.95, -(yC - 0.07), 0, ch.decor, { ombre: false }).rotation.x = Math.PI / 2;
    for (const x of [6.45, 7.95]) {
      B(x - 0.235, yC - 0.02, x + 0.235, yC, Y_SS + 1.48, Y_SS + 2.12, X.noir, { ombre: false });
      panneau(new THREE.MeshStandardMaterial({ map: texAffiche('#3a3a3a', '#ffffff', Math.round(x * 3)), roughness: 0.6 }), 0.44, 0.61, x, yC - 0.02, Y_SS + 1.8, 'S', 0.001);
    }
    panneau(new THREE.MeshStandardMaterial({ map: texBordeaux(), roughness: 0.6 }), 0.3, 0.42, 5.36, yC, Y_SS + 1.5, 'S', 0.01);
    // ---- L'AFFICHE « 100 % » sur le retour, à droite de l'entrée ----
    panneau(new THREE.MeshStandardMaterial({ map: texAffiche100(), roughness: 0.6 }), 0.42, 0.594, 3.35, 7.51, Y_SS + 1.5, 'N');
    // ---- L'AILE (Haythem ne l'a pas filmée en 2026 : la vidéo officielle de 2021, q_0088-q_0097, q_0137-q_0142, es/z_M,
    // z_D) : contre son mur ouest vert, la TABLETTE HAUTE de stratifié gris (dessus à 1,05, 35 cm de profondeur, trois
    // pieds d'acier fins), le micro-ondes NOIR à porte miroir puis le BLANC à porte noire, trois A4 au-dessus du bout sud
    // (une mosaïque de photos, deux textes), une chaise filaire noire et un tabouret dessous. (Plan V2 : plus rien
    // d'imaginé — les deux mange-debout et leurs quatre tabourets, le radiateur et l'affiche violette, ni vus en 2026 ni
    // en 2021, sont retirés : « ne pas meubler l'imaginé ».) ----
    B(5.0, 2.81, 5.35, 6.71, Y_SS + 1.02, Y_SS + 1.05, X.tablette, { collision: true });
    B(5.0, 2.81, 5.35, 6.71, Y_SS + 1.015, Y_SS + 1.02, X.acierGris, { ombre: false });
    for (const y of [2.91, 4.76, 6.61]) B(5.27, y - 0.015, 5.3, y + 0.015, Y_SS, Y_SS + 1.015, X.acierGris);
    for (const [y, mat, porte] of [[5.16, X.caisse, X.chrome], [6.26, X.microOndes, X.vitreNoire]]) {
      B(5.02, y - 0.24, 5.34, y + 0.24, Y_SS + 1.05, Y_SS + 1.33, mat);
      B(5.34, y - 0.22, 5.343, y + 0.1, Y_SS + 1.08, Y_SS + 1.3, porte, { ombre: false });
      B(5.34, y + 0.13, 5.342, y + 0.21, Y_SS + 1.12, Y_SS + 1.28, X.vitreNoire, { ombre: false });
    }
    panneau(new THREE.MeshStandardMaterial({ map: texCadre(2), roughness: 0.6 }), 0.21, 0.297, 5.005, 3.26, Y_SS + 1.75, 'E');
    panneau(new THREE.MeshStandardMaterial({ map: texAffiche('#3a3a3a', '#fbfbf8', 78), roughness: 0.7 }), 0.21, 0.297, 5.005, 3.61, Y_SS + 1.72, 'E');
    panneau(new THREE.MeshStandardMaterial({ map: texAffiche('#3a3a3a', '#fbfbf8', 79), roughness: 0.7 }), 0.21, 0.297, 5.005, 3.91, Y_SS + 1.72, 'E');
    tabouret(5.62, 4.91, -1, 0);
    {
      // (la chaise filaire noire : assise et dossier de fil, quatre pieds)
      const g = new THREE.Group(); g.position.set(5.65, Y_SS, -3.46); g.rotation.y = -Math.PI / 2 + 0.2; ch.decor.add(g);
      maille(boiteM(0.42, 0.012, 0.4), X.noir, 0, 0.46, 0, 0, g);
      maille(boiteM(0.42, 0.34, 0.012), X.noir, 0, 0.66, 0.2, 0, g).rotation.x = -0.12;
      for (const [px, pz] of [[-0.19, -0.18], [0.19, -0.18], [-0.19, 0.18], [0.19, 0.18]]) tube(g, X.noir, new THREE.Vector3(px, 0.46, pz), new THREE.Vector3(px * 1.1, 0, pz * 1.1), 0.008, 6);
      C.ajouterCercle(5.65, -3.46, 0.24, { y0: Y_SS, y1: Y_SS + 0.85 });
    }
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
    // LES SORTIES DES SIÈGES (11/10, l'essai des sièges du plan V2) : le point où l'on se relève, derrière le tabouret,
    // tombait pour sept d'entre eux sur un tabouret voisin ou une table ; on prend alors, autour du siège, le plus proche
    // qui soit libre — et du même côté des murs (le segment, à hauteur d'épaule, ne traverse rien)
    for (const s of sieges) {
      if (C.libre(s.sx, s.sz, 0.3, Y_SS)) continue;
      const a0 = Math.atan2(s.sz - s.z, s.sx - s.x);
      let mieux = null;
      for (const r of [0.55, 0.65, 0.75, 0.9]) {
        for (let k = 0; k < 24 && !mieux; k++) {
          const a = a0 + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * Math.PI / 12, x = s.x + Math.cos(a) * r, z = s.z + Math.sin(a) * r;
          if (C.libre(x, z, 0.3, Y_SS) && C.rayonLibre(s.x, Y_SS + 1.5, s.z, x, Y_SS + 1.5, z, 0.05) > 0.999) mieux = [x, z];
        }
        if (mieux) break;
      }
      if (mieux) { s.sx = mieux[0]; s.sz = mieux[1]; }
    }
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
  // que les murs ; sur la vidéo, le sol est nettement plus sombre qu'eux. Plan V2 : le couloir aussi, à 1,0 — à 1,4, son
  // grès sortait gris clair, v_050 le montre gris foncé)
  for (const m of solsSS) { m.lightMap = lm; m.lightMapIntensity = m.userData.lmi ?? (m === SOL.couloir ? 1.0 : m === SOL.hall ? 0.75 : 0.55); }
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
    // (relecture du 11/10 : et le hall du -1 — du palier, v_010 à v_020, l'ouverture du pied de la volée est d'un blanc
    // éclatant ; sans ses spots, on y voyait un hall gris)
    { id: 'palierSS', rects: [[0.0, -ESC.y0, 1.6, -Y_PAL, -10]], voisines: ['escalierSS', 'hallO', 'hallSS'], env: { x: 0.9, y: 1.5, z: -(Y_PAL + 0.5) } },
    // (finitions du 11/10 : pieds sous 0,6 m — au-dessus, c'est la volée 2 de l'escalier principal et son arrivée au 1er)
    { id: 'escalierSS', rects: [[0.2, -ESC.yPied, 1.5, -ESC.y0, -10, 0.6]], voisines: ['palierSS', 'hallSS'], env: { x: 0.85, y: -1.1, z: -7.91 } },
    { id: 'hallSS', rects: [zr(0.4, ESC.yPied, 2.48, Y_FOND)], voisines: ['escalierSS', 'couloirSS'], env: env(1.45, 11.61) },
    { id: 'couloirSS', rects: [zr(1.45, Y_COUL0, 2.48, ESC.yPied)], voisines: ['hallSS'], env: env(1.96, 6.21, 1.5) },
    // (intégration du 10/10 : jusqu'à y 11,81, le bord de la zone de la grande salle — entre les deux, sur le seuil de sa
    // porte, la zone du rez-de-chaussée, au-dessus, prenait la main le temps d'un pas ; à l'est, jusqu'à x 12,95 : le
    // seuil de la porte sombre, au-delà, est au passage sombre, js/ecole_soussol_est.js)
    { id: 'pauseSS', rects: [zr(2.48, 7.51, 12.95, 11.81), zr(4.95, 2.36, 12.95, 7.51)], voisines: [], env: env(7.4, 8.11) },
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
  // (10/10 : jusqu'au fond et au mur est de la grande salle S -1.14 — sous la salle David Clark, le C01 et les locaux du
  // fond, piège n° 12 ; plan V2 : du fond du couloir, sous le passage du rez-de-chaussée, au mur du tableau en y 21,41)
  const colonne = new THREE.Box3(new THREE.Vector3(-1.5, -4, -22.5), new THREE.Vector3(16.6, 12, -0.4));
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
    const cage = cam.x < 1.62 && cam.z < -Y_PAL && cam.z > -(ESC.yPied + 0.22) && cam.y < 2.6;
    if (u.y < -0.6 || cage) bas = true; else if (u.y > -0.35) bas = false;
    // VISIBLE quand la caméra peut le voir : en bas, ou dans le hall ouest et sur le palier (la trémie, la porte ouverte ;
    // plan V2 : le hall ouest va de la paroi vitrée, y 4,05, au mur de l'escalier, y 9,0 — et du passage, la caméra qui
    // suit Haythem voit déjà la porte grise s'ouvrir)
    const pres = cam.x < 6.2 && cam.z < -2.5 && cam.z > -10.7 && cam.y < 3.4;
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
// (intégration du 10/10 : la seule de son espèce — le -1 est, la salle Robert Kahn et le 2e en avaient chacun une copie ;
// `drapeau` : la marque, dans userData, des sols du niveau, qui ne comptent pas comme des obstacles)
export function cuireOcclusionNiveau(renderer, groupe, mats, base, R, drapeau = 'solSS') {
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
    if (!m || m.transparent || o.userData[drapeau]) { o.visible = false; return; }
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
