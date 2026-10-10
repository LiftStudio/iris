// =====================================================================
//  LA DESCENTE DE L'ESCALIER EST AU -1, SON PALIER ET LE SAS TECHNIQUE (crochet de js/carte_ecole.js)
// =====================================================================
// D'après la VISITE OFFICIELLE de 2021 (VO : references/ecole/visite_officielle, 12,4-24 s et 35,5-41 s ; relevés
// iris_visite/est_soussol.md et plan_global.md § 3.0-3.1 ; 10/10). La « niche sous la volée 2 » de la photo 24 est la
// tête d'un escalier qui descend au -1 : la VOLÉE A part vers l'est sous la volée 2, entre le mur sud de la cage et
// l'échiffre (q_0058-0063 : l'échiffre et sa main courante à gauche, la sous-face en pente au-dessus) ; le PALIER BAS,
// contre le mitoyen, à mi-hauteur (-1,53), porte la même réglette, le même bloc de sortie et la même affiche iris que le
// palier intermédiaire du haut, et une main courante horizontale qui fait le tour ; la VOLÉE B revient vers l'ouest sous
// la volée 1 jusqu'au PALIER DU -1, sous le vestibule (q_0064-0069) : en face, le panneau noir à bandeau cuivré « -1 »
// (« Salle de cours S -1.14 / Espace pause ») ; à gauche, la porte à deux vantaux gris (oculus cerclé de bois, bâtons
// inox) qui s'ouvre vers le palier. Derrière, sous le couloir est, LE SAS TECHNIQUE (q_0074-0083) : au mur sud, la porte
// grise « RÉSERVÉ AU PERSONNEL », la plaque noire du trumeau, la porte double grise au triangle jaune ⚡ (le local
// électrique) ; au mur ouest, la porte crème « RÉSERVÉ AU PERSONNEL », ⚡ elle aussi, un boîtier noir, puis LE PASSAGE
// (1,1 m, retours de plâtre profonds, q_0084-0088) qui débouche dans l'espace pause : c'est la « porte du local sombre »
// de 2026 (js/ecole_soussol.js) — le local n'existe pas, c'est le passage, éteint quand Haythem a filmé.
// Les murs de la cage sont BLANCS (le jaune de la vidéo est la lumière des réglettes : est_soussol.md § 0.6) ; la coupe
// de 15,64 s cache le palier bas et le nombre de marches : 2 x 8 contremarches de 19,1 cm, girons de 25 cm (proposition).
// IMAGINÉ : ce qu'il y a derrière les portes ⚡ et « réservé au personnel » (fermées), le plafond du sas (2,40 m, deux
// galettes LED comme l'espace pause) et celui du passage, le hublot du palier du -1, le bloc de sortie du sas, le texte
// de la plaque du trumeau (illisible : trois lignes, la dernière un numéro).
//
// LE PLAN (repère de js/carte_ecole.js : x le long de la façade, y vers le fond ; X = x, Z = -y) :
//   la tête (niche, RDC)        x 16,3-16,95   y 9,15-10,65   tapis, poteaux, portillons : js/ecole_est.js
//   la volée A (vers l'est)     x 16,95-18,70  y 9,15-10,65   de 0 à -1,53, sous la volée 2
//   le palier bas               x 18,70-19,80  y 9,15-12,45   à -1,53, sous le palier intermédiaire (dalle à 1,50)
//   la volée B (vers l'ouest)   x 18,70-16,95  y 10,80-12,45  de -1,53 à -3,06, sous la volée 1
//   l'échiffre                  y 10,725       x 16,8-18,70   du -1 à la dalle du RDC (à 1,50 sous le palier)
//   le palier du -1             x 14,6-16,95   y 10,8-12,45   plafond : le dessous de la dalle du vestibule (-0,30)
//   la porte à deux vantaux     y 10,725       x 14,70-16,05  0,85 + 0,50, automatique, vers le palier
//   le sas technique            x 14,6-17,6    y 7,8-9,0, et x 14,6-16,8 y 9,0-10,65 ; plafond à 2,40 m
//   le passage                  x 12,9-14,6    y 9,2-10,3     plafond à 2,20 m ; à l'ouest, la porte de 2026
//
// LES PIÈGES (ceux du sous-sol, js/ecole_soussol.js) : des dalles à 0 au-dessus de tout, sauf la volée A ; un sol au -1
// sous tout ce qu'on foule ; des zones à hauteur maximale, en tête de liste ; des lampes { base, cuire: false } ; une
// lumière et une ombre douce cuites à soi (R_SSE) ; un groupe dessiné seulement quand on peut le voir (au -1, dans le
// couloir est, la niche et le nord du hall) ; une dalle-boîte qui porte l'ombre du « soleil » tant que Haythem est en haut.
//
//   poserSousSolEst(ch, renderer, { RECT }) -> { zones, maj(dt, jeu), groupe }
import * as THREE from 'three';
import { maille, boiteM, fusionnerLocal } from './ecole_portes.js';
import { canvasTex, nePasFusionner } from './kit_decor.js';
import { cuireLumiereSol } from './ecole_lumieres.js';
import { TELEPHONE } from './appareil.js';
import { EST, outilsEst, texPlaqueSalle } from './ecole_est.js';
import { Y_SS } from './ecole_soussol.js';

// ---- les hauteurs ----
const DALLE = -0.3;                       // le dessous de la dalle du rez-de-chaussée
const HB = Y_SS / 2;                      // le palier bas : -1,53
const H_SAS = Y_SS + 2.4;                 // le plafond du sas (non vu)
const H_PASS = Y_SS + 2.2;                // celui du passage
// ---- les deux volées : 8 contremarches de 19,1 cm, girons de 25 cm, entre x 16,95 (la tête, le pied) et 18,70 ----
const NM = 8, R = -Y_SS / 16, G = 0.25;
const XA = 16.95, XB = XA + (NM - 1) * G;                    // 18,70 : le bord du palier bas
const PENTE = R / G;                                         // 0,765
const nezA = (x) => -PENTE * (x - XA);                       // la ligne des nez de la volée A (0 en tête)
const nezB = (x) => Y_SS + R + PENTE * (x - XA);             // celle de la volée B
const MC = 0.95, MCA = 0.98;                                 // la main courante au-dessus des nez (volée B, volée A)
// le rectangle du sol cuit d'ici (lumière et ombre douce, uv1 de 0 à 1, v = 1 au nord)
const R_SSE = { x0: 12.9, x1: 20.1, y0: 6.5, y1: 13.0 };
const LED = new THREE.Color(0xf3f6f8);                      // les LED du -1 (le blanc neutre de js/ecole_soussol.js)

// =====================================================================
//  LES TEXTURES (dessinées : rien de plus à charger)
// =====================================================================
const rgb = (r, g, b, a = 1) => `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a})`;
function graine(s) {
  let x = s >>> 0 || 1;
  return () => { x ^= x << 13; x >>>= 0; x ^= x >> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; };
}
// LE PANNEAU D'ÉTAGE DU -1 (VO q_0064-0072, es/z_sign2.jpg) : la maquette du panneau du 1er (photo 28), sur deux lignes —
// noir mat, bandeau vertical cuivré et son « -1 », « Salle de cours … S -1.14 », « Espace pause », un filet entre elles
function texPanneauMoins1() {
  return canvasTex(768, 172, (g, w, h) => {
    g.fillStyle = '#2b2a28'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#b5703f'; g.fillRect(0, 0, 70, h);
    g.fillStyle = '#ffffff'; g.font = '700 46px "Segoe UI", Arial, sans-serif'; g.textBaseline = 'alphabetic'; g.fillText('-1', 9, 58);
    g.fillStyle = '#4a4845'; g.fillRect(96, h / 2 - 1, w - 126, 2);
    g.font = '500 40px "Segoe UI", Arial, sans-serif'; g.fillStyle = '#f4f4f2';
    g.fillText('Salle de cours', 100, 64); g.fillText('Espace pause', 100, 146);
    g.textAlign = 'right'; g.font = '600 40px "Segoe UI", Arial, sans-serif'; g.fillText('S -1.14', w - 34, 64); g.textAlign = 'left';
  }, null, false, 4);
}
// LE CARRELAGE GRIS FONCÉ du sas et du passage (VO q_0078-0088 : celui du couloir du -1, `#56544e`) : 60 x 60, quatre
// tons par tuile de dessin de 1,2 m, joints sombres
function texCarreauxSas() {
  const W = TELEPHONE ? 256 : 512;
  return canvasTex(W, W, (g, w, h) => {
    const r2 = graine(1414), c = w / 2, j = Math.max(1.2, w * 0.0035), base = [86, 84, 79];
    for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) {
      const t = (r2() - 0.5) * 7;
      g.fillStyle = rgb(base[0] + t, base[1] + t, base[2] + t); g.fillRect(a * c, b * c, c, c);
      for (let k = 0; k < 18; k++) {
        const R0 = 8 + r2() * c * 0.3, x = a * c + r2() * c, y = b * c + r2() * c, d = (r2() - 0.5) * 10;
        const gr = g.createRadialGradient(x, y, 0, x, y, R0);
        gr.addColorStop(0, rgb(base[0] + t + d, base[1] + t + d, base[2] + t + d, 0.4)); gr.addColorStop(1, rgb(base[0], base[1], base[2], 0));
        g.fillStyle = gr; g.fillRect(x - R0, y - R0, 2 * R0, 2 * R0);
      }
    }
    for (let k = 0; k < w * h / 70; k++) { const v = (r2() - 0.5) * 22; g.fillStyle = rgb(base[0] + v, base[1] + v, base[2] + v, 0.25); g.fillRect(r2() * w, r2() * h, 1.3, 1.3); }
    g.fillStyle = '#383734';
    for (let i = 0; i <= 2; i++) { g.fillRect(i * c - j / 2, 0, j, h); g.fillRect(0, i * c - j / 2, w, j); }
  }, [1 / 1.2, 1 / 1.2], false, 8);
}
// LE BANDEAU ROUGE « RÉSERVÉ AU PERSONNEL » des deux portes du sas (q_0074-0083, es/z_rap.jpg, z_creme.jpg)
function texBandeauRAP() {
  return canvasTex(512, 44, (g, w, h) => {
    g.fillStyle = '#c62828'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffffff'; g.font = '700 25px "Segoe UI", Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('RÉSERVÉ AU PERSONNEL', w / 2, h / 2 + 1);
  }, null, false, 4);
}
// la petite étiquette rouge à deux lignes du coin haut (porte coupe-feu) ; l'étiquette rouge et blanche à pictogrammes
function texEtiquetteFeu() {
  return canvasTex(128, 40, (g, w, h) => {
    g.fillStyle = '#c62828'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffffff'; g.font = '700 13px "Segoe UI", Arial, sans-serif'; g.textAlign = 'center';
    g.fillText('PORTE COUPE-FEU', w / 2 - 8, 17); g.font = '600 11px "Segoe UI", Arial, sans-serif'; g.fillText('à maintenir fermée', w / 2 - 8, 32);
    g.fillRect(w - 16, 8, 10, 24);
  }, null, false, 2);
}
function texPictos() {
  return canvasTex(64, 96, (g, w, h) => {
    g.fillStyle = '#f4f3ef'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#c62828'; g.fillRect(3, 3, w - 6, 64);
    g.fillStyle = '#ffffff';
    for (const [x, y] of [[8, 9], [34, 9], [8, 37], [34, 37]]) g.fillRect(x, y, 22, 24);
    g.fillStyle = '#c62828'; g.fillRect(14, 14, 10, 14); g.fillRect(40, 18, 12, 6); g.fillRect(12, 44, 14, 10); g.fillRect(44, 42, 4, 16);
    g.fillStyle = '#1b1b1b'; g.fillRect(8, 74, 48, 4); g.fillRect(8, 82, 34, 4);
  }, null, false, 2);
}
// LE TRIANGLE JAUNE « DANGER ÉLECTRIQUE » (les portes ⚡) : liseré noir, l'éclair noir
function texDangerElec() {
  return canvasTex(128, 112, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    const tri = (m) => { g.beginPath(); g.moveTo(w / 2, m); g.lineTo(w - m, h - m * 0.6); g.lineTo(m, h - m * 0.6); g.closePath(); };
    g.fillStyle = '#1a1a1a'; tri(2); g.fill();
    g.fillStyle = '#f2c500'; tri(13); g.fill();
    g.fillStyle = '#1a1a1a'; g.beginPath();
    g.moveTo(70, 34); g.lineTo(50, 70); g.lineTo(64, 70); g.lineTo(54, 98); g.lineTo(80, 58); g.lineTo(66, 58); g.lineTo(76, 34); g.closePath(); g.fill();
  }, null, true, 4);
}
// la petite étiquette blanche sous le triangle de la porte crème
function texEtiquetteBlanche() {
  return canvasTex(96, 40, (g, w, h) => {
    g.fillStyle = '#f6f6f2'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#3a3a3a'; g.fillRect(10, 10, 76, 5); g.fillRect(18, 22, 60, 4); g.fillRect(24, 31, 48, 3);
  }, null, false, 2);
}

// =====================================================================
//  LE SOUS-SOL EST
// =====================================================================
export function poserSousSolEst(ch, renderer = null, { RECT = { x0: -0.6, x1: 20.4, y0: -0.6, y1: 25.0 } } = {}) {
  const { C, M } = ch, t0 = performance.now();
  const { mur, chambranle, reglette, mainCourante, limon, volee, geoDalles, texMouchete, texAfficheIris } = outilsEst;
  const X = outilsEst.matieres();
  const groupe = new THREE.Group(); groupe.name = 'sous-sol est';
  ch.scene.add(groupe);
  // (le décor fixe dans un sous-groupe, cousu à la fin ; les portes à côté — les automatiques tournent)
  const F = new THREE.Group(); F.name = 'sous-sol est (fixe)'; groupe.add(F);
  const decor0 = ch.decor, portes0 = ch.portes.decor;

  // ---- les matières d'ici ----
  const std = (o, nom) => { const m = new THREE.MeshStandardMaterial(o); m.name = nom; return m; };
  // (le sas et le passage sont sous des LED, d'un blanc neutre : les murs et les plafonds y tirent un rien vers le froid,
  // comme ceux de l'espace pause, js/ecole_soussol.js ; la cage garde le blanc chaud de ses réglettes)
  const FROID = new THREE.Color(0.96, 0.99, 1.03);
  const froid = (m, k = null) => { const c = m.clone(); if (k !== null) c.emissiveIntensity = k; c.color.multiply(FROID); c.name = m.name + ' (sas du -1)'; return c; };
  const P = {
    blancSas: froid(M.blanc), platreSas: froid(M.platre, 0.3),
    // (les rugosités, uniques : l'optimisation du décor ne doit confondre ces sols avec aucun autre — leur lumière cuite
    // est à eux)
    sas: std({ map: texCarreauxSas(), roughness: 0.471 }, 'carreaux gris foncé du sas (-1)'),
    // (le palier du -1 : sombre et chaud, q_0064-0069 — un vinyle taupe foncé, moucheté comme celui du 1er)
    vinyle: std({ map: texMouchete({ fond: [104, 93, 79], taches: [[[136, 124, 108], 0.6], [[74, 66, 57], 0.7], [[156, 146, 130], 0.3]], n: 8000, graineN: 29 }), roughness: 0.573 }, 'vinyle taupe du palier du -1'),
    // (a_150 : sous les LED du sas, les deux portes du mur sud sont d'un gris presque neutre — les teintes rééquilibrées
    // du relevé, #958b78 et #a2998b, sortaient beiges)
    elec: std({ color: 0x8e8a83, roughness: 0.45 }, 'vantail gris (local électrique)'),
    rap: std({ color: 0x9a9893, roughness: 0.45 }, 'vantail gris (réservé au personnel)'),
    huisserieGrise: std({ color: 0xb3b1ab, roughness: 0.45, metalness: 0.2 }, 'huisserie grise (local électrique)'),
  };
  const L_ = {
    plafonnier: new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff4e4).multiplyScalar(4.2) }),
    voyant: new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 0.25, 0.15) }),
  };
  L_.plafonnier.name = 'plafonnier rond allumé'; L_.voyant.name = 'voyant rouge';
  const matTex = (t, rugo = 0.5, o = {}) => new THREE.MeshStandardMaterial({ map: t, roughness: rugo, ...o });
  const tBandeau = matTex(texBandeauRAP()), tFeu = matTex(texEtiquetteFeu()), tPictos = matTex(texPictos());
  const tDanger = matTex(texDangerElec(), 0.45, { transparent: true, alphaTest: 0.5 });

  const lampes = [];                          // celles du -1 (cuites sur son sol)
  let ombrants = [];
  const B = (x0, y0, x1, y1, h0, h1, mat, o = {}) => ch.boite(Math.min(x0, x1), Math.min(y0, y1), Math.max(x0, x1), Math.max(y0, y1), h0, h1, mat, { ...o, parent: o.parent || F });
  const panneau = (mat, w, h, x, y, hc, face) => { const p = ch.panneau(mat, w, h, x, y, hc, face, F); p.castShadow = false; return p; };
  // LA GALETTE LED (celle de l'espace pause, js/ecole_soussol.js) : un disque de 36 cm à fleur du plafond, son anneau
  const _geoDisque = new THREE.CircleGeometry(0.18, 36), _geoAnneau = new THREE.CylinderGeometry(0.2, 0.2, 0.01, 36);
  const galette = (x, y, h, zone, force = 1.0) => {
    maille(_geoAnneau, M.couronne, x, h - 0.005, -y, 0, F, { ombre: false, recoit: false });
    maille(_geoDisque, L_.plafonnier, x, h - 0.011, -y, 0, F, { ombre: false, recoit: false }).rotation.x = Math.PI / 2;
    ch.halo(x, y, h, 1.5);
    const L = { x, z: -y, h, zone, type: 'spot', base: Y_SS, cuire: false, force, couleur: LED };
    ch.lampes.push(L); lampes.push(L);
  };

  // =====================================================================
  //  LES MURS
  // =====================================================================
  // (sous un mur du rez-de-chaussée, ils montent jusqu'à 0 et s'y raccordent ; ailleurs, à 1 cm sous le sol d'en haut)
  function construireMurs() {
    const B0 = M.blanc, W = P.blancSas, base = Y_SS;
    // LE MUR OUEST (x 14,6, sous le mur jaune du couloir est et celui du vestibule) : la porte crème « réservé au
    // personnel » (y 7,95-8,85), le boîtier noir, le passage (y 9,2-10,3, 2,20 m) ; au nord, le mur du panneau du palier
    mur(ch, F, { de: [14.6, 7.65], a: [14.6, 10.65], base, h: 0, mats: W, plinthes: ['E'], ouvertures: [{ c: 8.4, l: 0.9, h: Y_SS + 2.04 }, { c: 9.75, l: 1.1, h: H_PASS }] });
    mur(ch, F, { de: [14.6, 10.65], a: [14.6, 12.6], base, h: 0, mats: B0, plinthes: ['E'] });
    // LE MUR SUD DU SAS (y 7,725) : la porte double ⚡ (x 15,0-16,0), le trumeau et sa plaque, la porte grise (16,44-17,37)
    mur(ch, F, { de: [14.525, 7.725], a: [17.75, 7.725], base, h: -0.01, mats: W, plinthes: ['N'], ouvertures: [{ c: 15.5, l: 1.0, h: Y_SS + 2.04 }, { c: 16.9, l: 0.93, h: Y_SS + 2.04 }] });
    // ses retours à l'est : le bout du sas au sud (x 17,675), puis, au nord de y 9,0, le mur sous la tête de la volée A
    mur(ch, F, { de: [17.675, 7.65], a: [17.675, 9.0], base, h: -0.01, mats: W, plinthes: ['W'] });
    mur(ch, F, { de: [16.8, 9.075], a: [17.6, 9.075], base, h: 0, mats: { N: B0, S: W }, plinthes: ['S'] });
    // (arrêté sous la dalle, à -0,30 : plus haut, il accrochait le corps de qui remonte la volée A — sa tête de marche le
    // couvre)
    mur(ch, F, { de: [16.875, 9.0], a: [16.875, 10.65], base, h: DALLE, mats: { W, E: B0 }, plinthes: ['W'] });
    // LE MUR SUD DE LA CAGE au -1 (sous celui du rez-de-chaussée) : la volée A, le palier bas ; le mitoyen
    mur(ch, F, { de: [17.6, 9.075], a: [19.95, 9.075], base, h: 0, mats: B0 });
    mur(ch, F, { de: [19.95, 9.0], a: [19.95, 12.6], ep: 0.3, base, h: 0, mats: B0 });
    // L'ÉCHIFFRE au -1 : entre le sas et le palier, la porte à deux vantaux (x 14,70-16,05) ; puis entre les volées A et
    // B, jusqu'à la dalle — et jusque sous le palier intermédiaire (1,50) au droit du palier bas
    mur(ch, F, { de: [14.525, 10.725], a: [16.05, 10.725], base, h: -0.01, mats: { N: B0, S: W }, plinthes: ['N', 'S'], ouvertures: [{ c: 15.375, l: 1.35, h: Y_SS + 2.1 }] });
    mur(ch, F, { de: [16.05, 10.725], a: [XA, 10.725], base, h: 0, mats: { N: B0, S: W }, plinthes: ['N', 'S'] });
    mur(ch, F, { de: [XA, 10.725], a: [EST.xP, 10.725], base, h: 0, mats: B0 });
    mur(ch, F, { de: [EST.xP, 10.725], a: [XB, 10.725], base, h: EST.hP1 - 0.25, mats: B0 });
    // LE MUR NORD (sous celui du vestibule) : plinthe au palier seulement (la volée B a sa plinthe rampante)
    mur(ch, F, { de: [14.525, 12.525], a: [XA, 12.525], base, h: 0, mats: B0, plinthes: ['S'] });
    mur(ch, F, { de: [XA, 12.525], a: [19.95, 12.525], base, h: 0, mats: B0 });
    // LE PASSAGE (x 13,05-14,525) : ses deux retours de plâtre blanc, profonds de 1,5 m
    mur(ch, F, { de: [13.05, 9.125], a: [14.525, 9.125], base, h: -0.01, mats: W, plinthes: ['N'] });
    mur(ch, F, { de: [13.05, 10.375], a: [14.525, 10.375], base, h: -0.01, mats: W, plinthes: ['S'] });
  }

  // =====================================================================
  //  LES VOLÉES ET LE PALIER BAS (VO q_0058-0069, q_0143-0150 ; es/z_desc.jpg)
  // =====================================================================
  function construireEscalier() {
    // LE PALIER BAS (x 18,70-19,80 à -1,53) : plein, le vinyle des girons ; ses plinthes ; le monde solide
    B(XB, 9.15, EST.xM, 12.45, Y_SS, HB - 0.02, X.beton);
    B(XB, 9.15, EST.xM, 12.45, HB - 0.02, HB, X.giron);
    B(EST.xM - 0.015, 9.15, EST.xM, 12.45, HB, HB + 0.08, X.plinthe, { ombre: false });
    B(XB + 0.05, 9.15, EST.xM, 9.165, HB, HB + 0.08, X.plinthe, { ombre: false });
    B(XB + 0.05, 12.435, EST.xM, 12.45, HB, HB + 0.08, X.plinthe, { ombre: false });
    C.sol(XB, -9.15, EST.xM, -12.45, HB);
    // LES VOLÉES (paillasses : leurs dessous sont clos de murs) et leurs plinthes rampantes, des deux côtés
    const vA = { x0: XB, sens: -1, y0: 9.15, y1: 10.65, b: HB, n: NM, r: R, g: G };
    const vB = { x0: XA, sens: 1, y0: 10.8, y1: 12.45, b: Y_SS, n: NM, r: R, g: G };
    volee(ch, F, vA); volee(ch, F, vB);
    limon(ch, F, { ...vA, y: 9.15, cote: -1 }); limon(ch, F, { ...vA, y: 10.65, cote: 1 });
    limon(ch, F, { ...vB, y: 10.8, cote: -1 }); limon(ch, F, { ...vB, y: 12.45, cote: 1 });
    // LES MAINS COURANTES (rondes, noires, à 0,98 m des nez de la volée A — elles y arrivent dans leur pente à la crosse
    // du poteau, VO q_0149 — et 0,95 de ceux de la volée B, 7,9 cm des murs). Celles de la volée A partent des poteaux
    // de la tête (js/ecole_est.js : ils s'arrêtent en x 17,32) ; celle du mur sud tourne dans l'angle sud-est et court à
    // l'horizontale (1,0 m) le long du mitoyen (es/z_desc.jpg), puis le long du mur nord, et redescend la volée B ; celle
    // de l'échiffre finit contre son bout ; la volée B a la sienne contre l'échiffre ; en bas, des crosses (q_0064)
    const rA = (x) => nezA(x) + MCA, rB = (x) => nezB(x) + MC, hH = HB + 1.0;
    const yS = 9.15 + 0.079, yEs = 10.65 - 0.079, yEn = 10.8 + 0.079, yN = 12.45 - 0.079, xE = EST.xM - 0.079;
    const xjA = XB + (rA(XB) - hH) / PENTE, xjB = XB + (hH - rB(XB)) / PENTE;
    mainCourante(ch, F, [[17.32, yS, rA(17.32)], [XB, yS, rA(XB)], [xjA, yS, hH], [xE, yS, hH], [xE, yN, hH], [xjB, yN, hH], [XA + 0.07, yN, rB(XA + 0.07)], [XA - 0.03, yN, rB(XA - 0.03) - 0.16]],
      [[17.8, yS, rA(17.8), 'S'], [18.6, yS, rA(18.6), 'S'], [19.3, yS, hH, 'S'], [xE, 9.9, hH, 'E'], [xE, 11.7, hH, 'E'], [19.2, yN, hH, 'N'], [18.2, yN, rB(18.2), 'N'], [17.3, yN, rB(17.3), 'N']]);
    mainCourante(ch, F, [[17.32, yEs, rA(17.32)], [18.62, yEs, rA(18.62)], [18.62, 10.65, rA(18.62)]],
      [[17.8, yEs, rA(17.8), 'N'], [18.4, yEs, rA(18.4), 'N']]);
    mainCourante(ch, F, [[18.62, 10.8, rB(18.62)], [18.62, yEn, rB(18.62)], [XA + 0.07, yEn, rB(XA + 0.07)], [XA - 0.03, yEn, rB(XA - 0.03) - 0.16]],
      [[18.1, yEn, rB(18.1), 'S'], [17.3, yEn, rB(17.3), 'S']]);
    // LE PALIER BAS, au mitoyen (es/z_desc.jpg) : la réglette (≈ 1,3 m, à 2,5 m au-dessus du palier) et son voyant rouge
    // au bout sud, le bloc de sortie juste sous la dalle (flèche vers le sud, la volée A), l'affiche iris sous la réglette
    reglette(ch, F, EST.xM, 9.5, 10.8, HB + 2.5, 'W');
    B(EST.xM - 0.1, 9.505, EST.xM - 0.085, 9.525, HB + 2.47, HB + 2.49, L_.voyant, { ombre: false });
    ch.lampes.push({ x: EST.xM - 0.25, z: -10.15, h: HB + 2.5, zone: 'escEstSS', type: 'tube', force: 1.1, base: HB, cuire: false });
    ch.sortie(EST.xM - 0.03, 10.2, HB + 2.84, 'W');
    panneau(new THREE.MeshStandardMaterial({ map: texAfficheIris(), roughness: 0.55 }), 0.4, 0.72, EST.xM - 0.004, 10.35, HB + 1.75, 'W');
    // LE MONDE SOLIDE DE LA CAMÉRA : sous la volée 2 (au-dessus de la volée A), sous la volée 1 (au-dessus de la volée B),
    // sous le palier intermédiaire : des plafonds en marches, au plus bas de chaque giron (js/ecole_est.js : leurs
    // paillasses montent de 1,50 en x 18,29 à 3,0 en x 16,05, et de -0,25 en x 16,05 à 1,26 en x 18,29)
    const sof2 = (x) => (x >= EST.xP ? EST.hP1 - 0.25 : EST.hP1 - 0.25 + (EST.xP - x) * 1.5056 / 2.24);
    const sof1 = (x) => (x >= EST.xP ? EST.hP1 - 0.25 : -0.25 + (x - EST.x0) * 1.5056 / 2.24);
    for (let i = 0; i < NM - 1; i++) {
      const xa = XA + i * G, xb = xa + G;
      C.plafond(xa, -10.65, xb, -9.15, sof2(xb));
      C.plafond(xa, -12.45, xb, -10.8, Math.min(sof1(xa), EST.hP1 - 0.25));
    }
    C.plafond(XB, -12.45, EST.xM, -9.15, EST.hP1 - 0.25);
  }

  // =====================================================================
  //  LE PALIER DU -1 (VO q_0063-0073)
  // =====================================================================
  function construirePalier() {
    // le panneau « -1 » au mur ouest, face à qui arrive de la volée B (0,65 x 0,145, centre vers 1,75 m, y ≈ 11,9)
    panneau(new THREE.MeshStandardMaterial({ map: texPanneauMoins1(), roughness: 0.5 }), 0.65, 0.145, 14.681, 11.9, Y_SS + 1.75, 'E');
    B(14.675, 11.57, 14.68, 12.23, Y_SS + 1.672, Y_SS + 1.828, M.noirMat, { ombre: false });
    // LA PORTE À DEUX VANTAUX (y 10,725, x 14,70-16,05 : sous celle du vestibule, aux mêmes cotes) : le vantail ouest de
    // 0,85 (oculus étroit cerclé de bois, bâton inox), le vantail est de 0,50 (bâton) ; huisserie de bois crème ; elles
    // s'ouvrent vers le palier, d'où l'on remonte (q_0066-0073 : ouvertes vers la caméra)
    chambranle(ch, F, 'x', 10.725, 14.70, 16.05, Y_SS, 2.06, 0.15, { 1: [false, true], [-1]: [false, true] });
    ch.porte('x', 10.725, 15.125, { l: 0.85, h: 2.06, base: Y_SS, modele: 'grise', etat: 'auto', libre: -1, cote: 'N', huisserie: false, oculus: 'long', poignee: 'tirant', matVantail: X.taupe, nom: 'palier -1 (escalier est)' });
    ch.porte('x', 10.725, 15.8, { l: 0.5, h: 2.06, base: Y_SS, modele: 'grise', etat: 'auto', libre: -1, cote: 'N', charniere: 'd', huisserie: false, oculus: false, poignee: 'tirant', matVantail: X.taupe, nom: 'palier -1 (petit vantail)' });
    B(14.71, 10.69, 16.04, 10.76, Y_SS, Y_SS + 0.006, M.inox, { ombre: false });
    // le sol (vinyle taupe foncé), le plafond (le dessous de la dalle du vestibule ; au-delà de x 16,05, la paillasse de
    // la volée 1), son hublot ; le chant de la dalle au départ de la volée 1
    ch.plafond(14.675, 10.8, 16.06, 12.45, DALLE, 'platre', { retombees: false });
    B(16.0, 10.8, 16.06, 12.45, DALLE, -0.24, X.beton, { ombre: false });
    C.plafond(16.05, -12.45, XA, -10.8, -0.25);
    ch.opale(15.5, 11.65, DALLE, 'palierSSE', { r: 0.17, base: Y_SS, cuire: false });
    lampes.push(ch.lampes[ch.lampes.length - 1]);
  }

  // =====================================================================
  //  LE SAS TECHNIQUE ET LE PASSAGE (VO q_0074-0088 ; es/z_rap.jpg, z_creme.jpg, z_d1.jpg, m_P.jpg)
  // =====================================================================
  function construireSas() {
    // LA PORTE DOUBLE ⚡ (mur sud, x 15,0-16,0 : deux vantaux gris beige sans poignée, huisserie grise), fermée ; le
    // triangle jaune en haut du vantail ouest, contre le battement (a_150 : la porte est dans l'axe de celle du palier)
    const elec = ch.porte('x', 7.725, 15.5, { l: 1.0, h: 2.04, base: Y_SS, modele: 'grise2', etat: 'fermee', cote: 'N', oculus: false, poignee: null, fermePorte: false, matVantail: P.elec, nom: 'local électrique (-1)' });
    elec.g.traverse((o) => { if (o.isMesh && o.material === M.huisserie) o.material = P.huisserieGrise; });
    panneau(tDanger, 0.12, 0.105, 15.4, 7.794, Y_SS + 1.955, 'N');
    // LA PLAQUE NOIRE DU TRUMEAU (x 16,0-16,44) : trois lignes blanches, illisibles (q_0074-0076 ; texte imaginé)
    panneau(new THREE.MeshStandardMaterial({ map: texPlaqueSalle('Local', 'maintenance', '-1.15'), roughness: 0.4 }), 0.15, 0.075, 16.22, 7.804, Y_SS + 1.6, 'N');
    // LA PORTE GRISE « RÉSERVÉ AU PERSONNEL » (x 16,44-17,37) : gonds à l'est, béquille inox à l'ouest ; le bandeau rouge
    // en tête, l'étiquette coupe-feu au-dessus côté serrure, l'étiquette à pictogrammes dessous
    ch.porte('x', 7.725, 16.9, { l: 0.93, h: 2.04, base: Y_SS, modele: 'grise', etat: 'fermee', cote: 'N', charniere: 'd', oculus: false, fermePorte: false, matVantail: P.rap, nom: 'réservé au personnel (sas, sud)' });
    panneau(tBandeau, 0.91, 0.078, 16.9, 7.795, Y_SS + 1.89, 'N');
    panneau(tFeu, 0.15, 0.047, 16.56, 7.795, Y_SS + 1.97, 'N');
    panneau(tPictos, 0.064, 0.096, 16.49, 7.795, Y_SS + 1.785, 'N');
    // LA PORTE CRÈME « RÉSERVÉ AU PERSONNEL » (mur ouest, y 7,95-8,85) : gonds au sud, béquille au nord ; le même bandeau
    // et les mêmes étiquettes ; le triangle ⚡ et son étiquette blanche au milieu, vers 1,6 m
    ch.porte('y', 14.6, 8.4, { l: 0.9, h: 2.04, base: Y_SS, modele: 'grise', etat: 'fermee', cote: 'E', oculus: false, fermePorte: false, matVantail: X.creme, nom: 'réservé au personnel (sas, ouest)' });
    panneau(tBandeau, 0.88, 0.078, 14.67, 8.4, Y_SS + 1.89, 'E');
    panneau(tFeu, 0.15, 0.047, 14.67, 8.72, Y_SS + 1.97, 'E');
    panneau(tPictos, 0.064, 0.096, 14.67, 8.79, Y_SS + 1.785, 'E');
    panneau(tDanger, 0.12, 0.105, 14.67, 8.4, Y_SS + 1.66, 'E');
    panneau(matTex(texEtiquetteBlanche()), 0.1, 0.042, 14.67, 8.4, Y_SS + 1.56, 'E');
    // LE BOÎTIER NOIR (8 x 8 cm, à 1,65 m) entre la porte crème et le passage
    B(14.675, 9.01, 14.69, 9.09, Y_SS + 1.61, Y_SS + 1.69, M.noirMat, { ombre: false });
    // LES SOLS (carreaux gris foncé, jusqu'à l'axe de la porte à deux vantaux ; le vinyle du palier ensuite) ; LES
    // PLAFONDS de plâtre ; les galettes LED (deux dans le sas, une dans le passage) ; le bloc de sortie au-dessus de la
    // porte de l'escalier (l'issue : on remonte)
    for (const m of [ch.plafond(14.675, 7.8, 17.6, 9.0, H_SAS, 'platre', { retombees: false }), ch.plafond(14.675, 9.0, 16.8, 10.65, H_SAS, 'platre', { retombees: false }),
      ch.plafond(13.05, 9.2, 14.525, 10.3, H_PASS, 'platre', { retombees: false })]) m.material = P.platreSas;
    galette(15.65, 8.4, H_SAS, 'sasSS');
    galette(15.75, 9.95, H_SAS, 'sasSS');
    galette(13.8, 9.75, H_PASS, 'sasSS', 0.85);
    ch.sortie(15.375, 10.62, Y_SS + 2.3, 'S');
    // la barre de seuil à l'entrée du passage, côté espace pause (sous la porte de 2026)
    B(12.9, 9.2, 13.05, 10.1, Y_SS, Y_SS + 0.006, M.inox, { ombre: false });
  }

  // =====================================================================
  //  LES SOLS ET LE MONDE SOLIDE DES DEUX NIVEAUX
  // =====================================================================
  function construireSols() {
    const sol = (rects, mat, nom) => {
      const m = new THREE.Mesh(geoDalles(rects, Y_SS, R_SSE), mat);
      m.receiveShadow = true; m.castShadow = false; m.name = nom; m.userData.solSS = true; groupe.add(m);
    };
    sol([[14.675, 7.8, 17.6, 9.0], [14.675, 9.0, 16.8, 10.725], [12.9, 9.2, 14.675, 10.3]], P.sas, 'sol du sas technique du -1');
    sol([[14.675, 10.725, XA, 12.45]], P.vinyle, 'sol du palier du -1 (escalier est)');
    // AU -1 : le sas, le passage, le palier (la volée B a sa rampe, le palier bas sa dalle)
    C.sol(12.9, -7.65, 17.6, -9.0, Y_SS);
    C.sol(12.9, -9.0, 16.8, -10.725, Y_SS);
    C.sol(14.6, -10.725, XA, -12.5, Y_SS);
    // AU REZ-DE-CHAUSSÉE : des dalles à 0 au-dessus de tout, SAUF la volée A (la tête de la descente) — sans elles, le
    // joueur du couloir est tomberait au -1 ; et pour la caméra seule, la dalle sous le couloir et le vestibule
    C.sol(12.9, -7.5, 20.1, -9.15, 0);
    C.sol(12.9, -9.15, XA, -10.65, 0);
    C.sol(XB, -9.15, 20.1, -10.65, 0);
    C.sol(12.9, -10.65, 20.1, -12.6, 0);
    for (const [a, b, c, d] of [[12.9, 7.5, 20.1, 9.15], [12.9, 9.15, 16.8, 10.65], [12.9, 10.65, 16.05, 12.6]]) C.ajouterBoite(a, -b, c, -d, { y0: DALLE, y1: -0.01, joueur: false });
  }

  // =====================================================================
  //  LA CONSTRUCTION
  // =====================================================================
  ch.decor = F; ch.portes.decor = groupe;
  try {
    construireMurs();
    construireEscalier();
    construirePalier();
    construireSas();
    construireSols();
  } finally {
    ch.decor = decor0; ch.portes.decor = portes0;
  }
  // LA DALLE-BOÎTE (dans le décor du rez-de-chaussée) : sous le sol d'en haut, elle porte l'ombre du « soleil » sur tout
  // l'est du -1 tant que Haythem n'y est pas — sauf la cage (les volées et les paliers d'en haut y portent la leur) ;
  // invisible d'en haut comme d'en bas
  const dalleOmbre = new THREE.Group(); dalleOmbre.name = 'dalle du rez-de-chaussée, est (ombre)';
  for (const [a, b, c, d] of [[13.2, 7.5, 20.1, 9.0], [13.2, 9.0, 16.8, 12.6]]) {
    const m = maille(boiteM(c - a, 0.26, d - b), M.beton, (a + c) / 2, -0.16, -(b + d) / 2, 0, dalleOmbre, { ombre: true, recoit: false });
    m.userData.horsAOSol = true;
  }
  dalleOmbre.userData.horsAOSol = true; nePasFusionner(dalleOmbre);
  decor0.add(dalleOmbre);

  // =====================================================================
  //  LA LUMIÈRE CUITE ET L'OMBRE DOUCE DU SOL (le sas, le passage, le palier)
  // =====================================================================
  const solsSS = [P.sas, P.vinyle];
  const W = R_SSE.x1 - R_SSE.x0, Lg = R_SSE.y1 - R_SSE.y0;
  const proxy = { formes: C.formes.filter((f) => f.y0 > Y_SS - 0.35 && f.y0 < Y_SS + 0.3).map((f) => ({ ...f, y0: f.y0 - Y_SS, y1: f.y1 - Y_SS })) };
  const aCuire = lampes.filter((L) => L.base === Y_SS).map((L) => ({ ...L, h: L.h - Y_SS, cuire: true }));
  const lm = cuireLumiereSol(proxy, aCuire, { x0: R_SSE.x0, z0: -R_SSE.y1, W, L: Lg }, { tpm: 16 });
  P.sas.lightMap = lm; P.sas.lightMapIntensity = 0.9;
  P.vinyle.lightMap = lm; P.vinyle.lightMapIntensity = 0.75;
  groupe.traverse((o) => { o.userData.horsAOSol = true; });
  if (renderer) {
    try { cuireOcclusion(renderer, groupe, solsSS, Y_SS, R_SSE); } catch (e) { console.warn('[sous-sol est] ombre du sol non cuite :', e); }
  }
  fusionnerLocal(F);
  nePasFusionner(groupe);
  groupe.traverse((o) => { o.userData.horsAOSol = true; if (o.isMesh && o.castShadow) ombrants.push(o); });
  for (const o of ombrants) o.castShadow = false;

  // =====================================================================
  //  LES ZONES (js/ecole_lumieres.js) : en tête de liste, à hauteur MAXIMALE
  // =====================================================================
  // (la volée A à part : elle voit la niche et le couloir est ; le palier bas et la volée B n'ont pour voisin que le
  // palier du -1 — sans quoi les hublots du couloir est, sans ombre, éclaireraient le palier du -1 au travers de la dalle)
  const zr = (x0, y0, x1, y1, hmax = -1.5) => [x0, -y1, x1, -y0, -10, hmax];
  const zones = [
    { id: 'descenteEst', rects: [zr(XA, 9.1, XB, 10.7, -0.05)], voisines: ['couloirEst', 'escEstSS'], env: { x: 17.7, y: 0.3, z: -9.9 } },
    { id: 'escEstSS', rects: [zr(XB, 9.1, 19.85, 12.5, -0.9), zr(XA, 10.7, XB, 12.5, -0.9)], voisines: ['descenteEst', 'palierSSE'], env: { x: 19.25, y: HB + 1.5, z: -11.4 } },
    { id: 'palierSSE', rects: [zr(14.55, 10.725, XA, 12.55)], voisines: ['escEstSS', 'sasSS'], env: { x: 15.9, y: Y_SS + 1.6, z: -11.7 } },
    { id: 'sasSS', rects: [zr(14.55, 7.7, 17.65, 9.05), zr(14.55, 9.05, 16.85, 10.725), zr(12.95, 9.15, 14.55, 10.35)], voisines: ['palierSSE', 'pauseSS'], env: { x: 15.6, y: Y_SS + 1.6, z: -9.0 } },
  ];

  // =====================================================================
  //  LA MISE À JOUR (js/carte_ecole.js maj, à chaque image)
  // =====================================================================
  // EN BAS (pieds sous -0,6 m, ou la caméra sous la dalle de ce côté-ci) : la dalle-boîte s'éteint, le décor du
  // rez-de-chaussée au-dessus ne porte plus d'ombre (elle tomberait au travers du sol), et ce qui est d'ici porte la
  // sienne — la règle de js/ecole_soussol.js. VISIBLE quand la caméra peut le voir : en bas, ou au rez-de-chaussée dans le
  // couloir est, la niche, le vestibule et le nord du hall (par la porte du couloir, on voit la tête de la descente).
  let bas = false, rdc = null;
  const colonne = new THREE.Box3(new THREE.Vector3(12.85, -4, -12.7), new THREE.Vector3(20.2, 12, -7.45));
  const releverRDC = (jeu) => {
    const L = [], bb = new THREE.Box3(), sauter = new Set([groupe, dalleOmbre, ch.scene.getObjectByName('1er étage'), ch.scene.getObjectByName('sous-sol'), jeu.user && jeu.user.mesh].filter(Boolean));
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
    const dessous = cam.y < -0.1 && cam.x > 12.85 && cam.z < -7.45 && cam.z > -12.7;
    if (u.y < -0.6 || dessous) bas = true; else if (u.y > -0.35) bas = false;
    const pres = cam.x > 12.8 && cam.z < -4.5 && cam.z > -12.7 && cam.y < 3.45;
    const vis = bas || cam.y < -0.1 || pres;
    if (vis !== groupe.visible) groupe.visible = vis;
    if (!rdc) rdc = releverRDC(jeu);
    for (const o of rdc) o.castShadow = !bas;
    for (const o of dalleOmbre.children) o.castShadow = !bas;
    for (const o of ombrants) o.castShadow = bas;
  };
  console.info('[sous-sol est] %d lampes, %d ombrants, construit en %d ms', lampes.length, ombrants.length, Math.round(performance.now() - t0));
  return { zones, maj, groupe };
}

// =====================================================================
//  L'OMBRE DOUCE CUITE AU SOL D'UN NIVEAU
// =====================================================================
// (la même que celle de js/ecole_soussol.js, cuireOcclusionNiveau, qui n'est pas exportée — à mettre en commun) : une
// carte des hauteurs vue de dessus (ce qui part du sol du niveau), l'horizon dans 16 directions, l'aoMap (uv1) des sols.
function cuireOcclusion(renderer, groupe, mats, base, R) {
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
