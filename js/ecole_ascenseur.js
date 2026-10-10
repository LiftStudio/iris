// =====================================================================
//  L'ASCENSEUR DE L'ÉCOLE IRIS (crochets de js/ecole_est.js : le rez-de-chaussée et le 1er ; le 2e : js/ecole_etage2.js)
// =====================================================================
// D'après la VIDÉO OFFICIELLE DE VISITE (2021, VO 68,2-70 s, q_0274-0281 ; à 25 i/s e2/f25/f_0031-0055 ; recadrages
// e2/crops/g038, g056, g074) : au 1er, au bout de la bande sud du palier est, une FAÇADE PALIÈRE tout en inox brossé qui
// regarde l'ouest (x 17,9) — le montant de 21 cm au nord, les deux vantaux coulissants (0,88 m de passage, 2,0 m de
// haut), le grand panneau fixe au sud derrière lequel ils s'effacent (porte télescopique à deux vitesses : le joint des
// vantaux n'est pas au milieu de la façade), le linteau de 25 cm sur toute la largeur et, au droit du passage, son
// afficheur à cristaux liquides bleus ; contre la façade, sur le mur sud, la platine du bouton d'appel et l'extincteur ;
// au-dessus, la réglette murale. Aucune photo de 2026 ne couvre ce coin (x 16-19,8, y 7-9) : on garde la vidéo.
// Au rez-de-chaussée, la porte n'est pas vue (la photo 24 ne voit le dégagement derrière le cannelé que jusqu'à x 17) :
// la même façade y est DÉDUITE, au bout du dégagement. Au -1 : rien (la gaine reste close tant que sa porte n'est pas
// vue). La cabine est IMAGINÉE (inox, sol de granit, main courante, boîte à boutons, quatre LED).
//
// LE PLAN (repère de js/carte_ecole.js : x le long de la façade, y vers le fond ; hauteurs absolues) :
//   la gaine                     x 17,9-19,8   de la face nord du mur du hall (RDC) ou du doublage (1er) au mur sud de la
//                                              cage (y 9,0) ; à l'est, le mitoyen
//   la façade palière (ouest)    x 17,885-18,0 le fixe y0-7,91, le passage 7,91-8,79, le montant 8,79-9,0 ; le linteau
//                                              de 2,0 à 2,25 m ; au-dessus, le mur blanc jusqu'au plafond
//   la cabine (imaginée)         x 17,99-19,7  y 7,74-9,01 (dedans ≈ 1,6 × 1,15 m ; plafond à 2,24 m)
//   au 1er, le DOUBLAGE du mur sud de la bande  x 16,05-17,9  y 7,035-7,355 (relecture du 10/10 : la façade mesure
//                                              ≈ 1,6 m sur 2,25, rapport tiré de q_0274-0277 et f_0041 sans dépendre de
//                                              la focale, et non les 1,97 m de la bande ; l'arête verticale vue juste à
//                                              l'ouest du boîtier vert, f_0031, est l'angle de ce doublage, sa face ouest
//                                              — un disque de laiton en haut — court jusqu'au bord du tableau)
//
// L'ASCENSEUR MARCHE (10/10, imaginé) : Haythem devant la porte l'appelle (le bouton s'allume), la cabine vient, les
// portes s'ouvrent ; dedans, au bout de deux secondes, elles se referment et la cabine le porte au palier suivant
// (va-et-vient du bas vers le haut) ; il revient sur ses pas dans l'embrasure : elles se rouvrent. Seuls les paliers
// `ouvert` sont desservis ; un palier fermé n'est qu'un décor (la porte est un mur).
//
//   poserAscenseur(ch, { base, groupe, ouvert, y0, y1, hMur, zone, bouton }) -> le palier
//   poserBandeSud(ch, { groupe, lampes })    le 1er : la bande sud du palier est, son décor, le palier de l'ascenseur
//   majAscenseur(ch, dt, jeu)                à chaque image (js/ecole_est.js, la mise à jour du rez-de-chaussée)
// Le 2e (js/ecole_etage2.js) : poserAscenseur(ch, { base: 6.6, groupe }) pose un palier FERMÉ (y0 par défaut 7,355,
// comme au 1er ; son vestibule plus étroit : y0 jusqu'à 7,9) ; avec `ouvert: true` et la `zone` de son vestibule, la
// cabine y monte aussi (il faut alors que le vestibule soit un sol où marcher et que le groupe de l'étage se montre
// quand Haythem est à 6,6 : le transport le rend visible pour la première image).
import * as THREE from 'three';
import { maille, boiteM } from './ecole_portes.js';
import { canvasTex, nePasFusionner } from './kit_decor.js';

const N1 = 3.5;                     // le plancher du 1er
// ---- le plan ----
export const ASC = {
  xF: 17.9,                         // le nu de la façade palière (face ouest), à tous les niveaux
  xM: 19.8,                         // le fond de la gaine (le mitoyen est)
  yN: 9.0,                          // le nu sud du mur de la cage (le côté nord de la gaine)
  // (la façade presque de face — f_0041, 68,6 s : montant 27 px, vantaux 41 + 49, fixe 53, hauteur 247 dont 215 pour
  // les vantaux ; q_0277, 69 s : 18, 47 + 48, 62 — en moyenne, sur 1,645 m : montant 0,21, passage 0,88, fixe 0,55 ;
  // portes de 2,0 m, linteau de 0,25)
  yP0: 7.91, yP1: 8.79,             // le passage (0,88 m) : le même à chaque niveau, c'est la porte de la cabine
  hP: 2.0,                          // la hauteur du passage
  hF: 2.25,                         // le haut de l'habillage inox (le dessus du linteau)
  cab: { x0: 17.99, x1: 19.7, y0: 7.74, y1: 9.01, h: 2.24 },   // la cabine (imaginée), murs compris
};
const XA = 17.885, XB = 18.0;       // l'épaisseur de la façade (l'inox à 1,5 cm devant le nu du mur de la gaine)
const yJ = (ASC.yP0 + ASC.yP1) / 2 + 0.015;  // le joint des deux vantaux fermés (le rapide au nord)

// =====================================================================
//  LES TEXTURES (dessinées : aucun fichier de plus à charger)
// =====================================================================
function graine(s) { let x = s >>> 0 || 1; return () => { x = (x * 16807) % 2147483647; return x / 2147483647; }; }
// L'INOX BROSSÉ : des milliers de fils verticaux fins, à peine plus clairs ou plus sombres (tuile 0,5 m ; relecture du
// 10/10 : plus contrastés, avec de lents nuages, ils faisaient un bois veiné)
function texBrosse() {
  return canvasTex(256, 256, (g, w, h) => {
    const r = graine(717);
    g.fillStyle = '#d9d7d2'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 4000; k++) {
      const x = r() * w, y = r() * h, L = 6 + r() * 60, v = r() < 0.5 ? 245 : 185;
      g.fillStyle = `rgba(${v},${v},${v - 3},${0.025 + r() * 0.05})`; g.fillRect(x, y, 1, L);
      if (y + L > h) g.fillRect(x, y - h, 1, L);
    }
  }, [2, 2], false, 8);
}
// LE REFLET DE L'INOX : une petite carte d'environnement à soi, neutre — un plafond clair, des murs blancs barrés d'une
// réglette, un sol sombre (VO q_0274-0279 : les vantaux sont clairs en haut, une bande de lumière sous le linteau, plus
// sombres vers le sol). Celle de la zone, prise loin de la façade et pleine de sols bruns, en faisait un panneau brun.
function envInox() {
  const face = (haut, bas, bande) => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 64);
    gr.addColorStop(0, haut); gr.addColorStop(0.5, '#cfccc6'); gr.addColorStop(0.56, '#8d8a85'); gr.addColorStop(1, bas);
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    if (bande) { g.fillStyle = '#ffffff'; g.fillRect(8, 14, 48, 5); }
    return c;
  };
  const ciel = document.createElement('canvas'); ciel.width = ciel.height = 64;
  let g = ciel.getContext('2d'); g.fillStyle = '#efede8'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#ffffff'; g.fillRect(24, 0, 16, 64);
  const sol = document.createElement('canvas'); sol.width = sol.height = 64;
  g = sol.getContext('2d'); g.fillStyle = '#4a4744'; g.fillRect(0, 0, 64, 64);
  const t = new THREE.CubeTexture([face('#eeece7', '#3e3b38', true), face('#eeece7', '#3e3b38', false), ciel, sol, face('#eeece7', '#3e3b38', true), face('#eeece7', '#3e3b38', false)]);
  t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true;
  return t;
}
// LE SOL DE LA CABINE : un granit gris anthracite poli, mouchetures claires et noires (tuile 0,6 m)
function texGranit() {
  return canvasTex(256, 256, (g, w, h) => {
    const r = graine(4242);
    g.fillStyle = '#4a4946'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 5200; k++) {
      const v = r() < 0.55 ? 30 + r() * 30 : 120 + r() * 110, s = 1 + r() * 2.2;
      g.fillStyle = `rgba(${v},${v},${v - 2},${0.35 + r() * 0.5})`; g.fillRect(r() * w, r() * h, s, s);
    }
  }, [1 / 0.6, 1 / 0.6], false, 8);
}
// LE TABLEAU ABSTRAIT de la bande sud du 1er (VO q_0274-0277, g038) : sur un fond crème, quatre champs gris-bleu
// séparés par une croix claire décentrée (le bras vertical à droite du milieu, l'horizontal au-dessus), des repentirs
// plus clairs ; crème #E6DFCF, gris-bleu #8FA3B5 (relevé corrigé de etage2.md § 3.1)
function texTableau() {
  return canvasTex(192, 288, (g, w, h) => {
    const r = graine(5150);
    g.fillStyle = '#e6dfcf'; g.fillRect(0, 0, w, h);
    const champ = (x, y, l, H, c) => {
      g.fillStyle = c; g.fillRect(x, y, l, H);
      for (let k = 0; k < 40; k++) { g.fillStyle = `rgba(255,255,255,${0.04 + r() * 0.07})`; g.fillRect(x + r() * l, y + r() * H, 4 + r() * 22, 2 + r() * 10); }
    };
    const xc = w * 0.56, yc = h * 0.43, e = 15;
    champ(w * 0.07, h * 0.06, xc - e - w * 0.07, yc - e - h * 0.06, '#aebcc7');
    champ(xc + e, h * 0.04, w * 0.9 - xc - e, yc - e - h * 0.04, '#8fa0b1');
    champ(w * 0.1, yc + e, xc - e - w * 0.1, h * 0.94 - yc - e, '#9eaebc');
    champ(xc + e, yc + e, w * 0.93 - xc - e, h * 0.9 - yc - e, '#899bac');
    // une bande plus pâle qui court le long du bord gauche, des reprises crème sur les champs
    g.fillStyle = 'rgba(214,226,232,0.55)'; g.fillRect(w * 0.07, h * 0.06, 14, h * 0.88);
    for (let k = 0; k < 6; k++) { g.fillStyle = 'rgba(230,223,207,0.5)'; g.fillRect(r() * w, r() * h, 10 + r() * 30, 6 + r() * 16); }
  }, null, false, 4);
}
// L'AFFICHEUR À CRISTAUX LIQUIDES (VO g038 : ≈ 12 × 5 cm, bleu rétroéclairé) : le niveau de la cabine, la flèche quand
// elle roule. Un canevas à soi, redessiné quand l'affichage change.
function afficheur() {
  const c = document.createElement('canvas'); c.width = 96; c.height = 40;
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const dessiner = (txt, fleche) => {
    const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 0, 40); gr.addColorStop(0, '#4f8bff'); gr.addColorStop(1, '#2459e6');
    g.fillStyle = gr; g.fillRect(0, 0, 96, 40);
    g.fillStyle = 'rgba(255,255,255,0.06)'; for (let x = 0; x < 96; x += 3) g.fillRect(x, 0, 1, 40);
    g.fillStyle = '#eaf4ff'; g.font = '700 30px "Consolas", "Courier New", monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(txt, 58, 22);
    if (fleche) {
      g.beginPath();
      if (fleche > 0) { g.moveTo(22, 7); g.lineTo(33, 21); g.lineTo(11, 21); } else { g.moveTo(22, 33); g.lineTo(33, 19); g.lineTo(11, 19); }
      g.fill();
    }
    t.needsUpdate = true;
  };
  return { t, dessiner };
}
// LA BOÎTE À BOUTONS DE LA CABINE (imaginée) : une bande d'inox, l'afficheur, les boutons des niveaux (celui où l'on va
// cerclé d'orange), l'alarme jaune
function boiteBoutons() {
  const c = document.createElement('canvas'); c.width = 64; c.height = 224;
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const dessiner = (niveaux, txt, cible) => {
    const g = c.getContext('2d');
    const gr = g.createLinearGradient(0, 0, 64, 0); gr.addColorStop(0, '#9c9a95'); gr.addColorStop(0.5, '#c9c7c1'); gr.addColorStop(1, '#a3a19c');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 224);
    g.fillStyle = 'rgba(255,255,255,0.08)'; for (let y = 0; y < 224; y += 2) g.fillRect(0, y, 64, 1);
    g.fillStyle = '#0d0f14'; g.fillRect(12, 12, 40, 22);
    g.fillStyle = '#3f7cff'; g.fillRect(14, 14, 36, 18);
    g.fillStyle = '#eaf4ff'; g.font = '700 15px "Consolas", monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 32, 24);
    niveaux.forEach((n, k) => {
      const y = 62 + k * 34;
      g.beginPath(); g.arc(32, y, 12, 0, 7); g.fillStyle = n === cible ? '#ff7a1a' : '#3a3936'; g.fill();
      g.beginPath(); g.arc(32, y, 9, 0, 7); g.fillStyle = '#d8d6d0'; g.fill();
      g.fillStyle = '#222'; g.font = '700 12px "Segoe UI", Arial, sans-serif'; g.fillText(n, 32, y + 1);
      g.fillStyle = '#555'; for (const [dx, dy] of [[-18, -3], [-18, 1], [-14, -3]]) g.fillRect(32 + dx, y + dy, 2, 2);   // (le braille)
    });
    g.beginPath(); g.arc(32, 200, 11, 0, 7); g.fillStyle = '#f2c230'; g.fill();
    g.fillStyle = '#222'; g.beginPath(); g.arc(32, 198, 5, Math.PI, 0); g.lineTo(37, 203); g.lineTo(27, 203); g.fill();
    t.needsUpdate = true;
  };
  return { t, dessiner };
}

// =====================================================================
//  LES MATIÈRES (une fois par chantier)
// =====================================================================
function matieres(ch) {
  if (ch._ascX) return ch._ascX;
  const std = (o, nom) => { const m = new THREE.MeshStandardMaterial(o); m.name = nom; return m; };
  const brosse = texBrosse(), env = envInox();
  const X = {
    // (etage2.md § 4 : inox brossé #A7A6A2, rugosité 0,35 — sous la lumière jaune de 2021, il sort doré. Relecture du
    // 10/10 : avec la carte d'environnement de la zone, faite de sols bruns, il sortait brun foncé ; avec la sienne,
    // neutre, il sort gris acier, clair en haut et sombre en bas comme sur la vidéo)
    inox: std({ map: brosse, color: 0xc9ccd0, metalness: 0.7, roughness: 0.33, envMap: env, envMapIntensity: 0.9 }, 'inox brossé (ascenseur)'),
    inoxCab: std({ map: brosse, color: 0xcdd0d4, metalness: 0.7, roughness: 0.3, envMap: env, envMapIntensity: 0.8 }, 'inox brossé (cabine)'),
    joint: std({ color: 0x2a2826, roughness: 0.6, metalness: 0.3 }, 'joint sombre (ascenseur)'),
    alu: std({ color: 0xb7b8b6, roughness: 0.38, metalness: 0.75 }, 'seuil aluminium (ascenseur)'),
    granit: std({ map: texGranit(), roughness: 0.32 }, 'granit de la cabine'),
    plafond: std({ color: 0xf1f0ec, roughness: 0.5, emissive: 0xe8e4dc, emissiveIntensity: 0.18 }, 'plafond de la cabine'),
    led: new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff2dc).multiplyScalar(4.5) }),
    noir: std({ color: 0x1b1b1a, roughness: 0.55 }, 'plinthe de la cabine'),
    lunette: std({ color: 0x0d0f14, roughness: 0.3 }, 'cadre de l\'afficheur'),
    plinthe: std({ color: 0x5a534b, roughness: 0.5 }, 'plinthe gris foncé'),
    cadre: std({ color: 0x2c2420, roughness: 0.45 }, 'cadre de bois foncé'),
    tableau: std({ map: texTableau(), roughness: 0.75 }, 'tableau abstrait (bande sud du 1er)'),
    laiton: std({ color: 0xc9a24a, roughness: 0.3, metalness: 0.85 }, 'laiton'),
    vert: std({ color: 0x2f9a55, roughness: 0.35, emissive: 0x3bd16f, emissiveIntensity: 0.55 }, 'boîtier vert allumé'),
    reglette: std({ color: 0xf2f1ed, roughness: 0.4 }, 'réglette'),
    diffuseur: new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffe4b8).multiplyScalar(2.4) }),
    embout: std({ color: 0xe8701e, roughness: 0.5, emissive: 0xe8701e, emissiveIntensity: 0.5 }, 'embout de réglette'),
    rouge: std({ color: 0xc8262c, roughness: 0.42 }, 'extincteur rouge'),
  };
  X.led.name = 'led de la cabine'; X.diffuseur.name = 'diffuseur de réglette allumé';
  return (ch._ascX = X);
}

// l'état de la cabine (un ascenseur par chantier)
function etat(ch) {
  return ch._ascenseur || (ch._ascenseur = { paliers: [], cab: null, phase: 'arret', k: 0, t: 0, duree: 1, sens: 0, dir: 1,
    cible: null, appel: null, passager: false, absent: 99, dedansT: 0, vu: '' });
}
const libelle = (base) => String(Math.round(base / 3.2));       // -3,06 -> -1 ; 0 -> 0 ; 3,5 -> 1 ; 6,6 -> 2

// =====================================================================
//  UN PALIER DE L'ASCENSEUR
// =====================================================================
// `base` : le plancher ; `groupe` : où poser (par défaut ch.decor — un étage passe le sien) ; `ouvert` : desservi (la
// cabine y vient, les portes s'ouvrent), sinon la porte est un mur ; `y0`, `y1` : la façade (du nu du mur sud au nu du
// mur nord de la gaine — le passage, lui, ne bouge pas : y 7,91-8,79) ; `hMur` : le haut du mur au-dessus du linteau (le
// plafond du palier) ; `zone` : la zone de lumière du palier (la lampe de la cabine y prend part) ; `bouton` : le mur qui
// porte la platine d'appel ('S' : contre le fixe, comme au 1er ; 'N' : sur le mur de la cage).
export function poserAscenseur(ch, { base = 0, groupe = null, ouvert = false, y0 = 7.355, y1 = ASC.yN, hMur = null, zone = null, bouton = 'S' } = {}) {
  const { C, M } = ch, G = groupe || ch.decor, b = base, X = matieres(ch), S = etat(ch);
  const { hP, hF, yP0, yP1 } = ASC;
  const hM = hMur ?? b + 2.6;
  const B = (x0, ya, x1, yb, h0, h1, mat, o = {}) => ch.boite(Math.min(x0, x1), Math.min(ya, yb), Math.max(x0, x1), Math.max(ya, yb), h0, h1, mat, { ombre: false, ...o, parent: G });

  // ---- LA FAÇADE PALIÈRE (VO g038, g056) : le fixe, le montant, le linteau — inox brossé, toute l'épaisseur du mur ----
  B(XA, y0, XB, yP0, b, b + hP, X.inox);
  B(XA, yP1, XB, y1, b, b + hP, X.inox);
  B(XA, y0, XB, y1, b + hP, b + hF, X.inox);
  // les joints : sous le linteau (sur toute la largeur), les deux bords du passage
  B(XA - 0.002, y0, XA, y1, b + hP - 0.004, b + hP + 0.002, X.joint);
  for (const y of [yP0, yP1]) B(XA - 0.002, y - 0.004, XA, y + 0.004, b, b + hP, X.joint);
  // le mur blanc au-dessus, jusqu'au plafond du palier
  if (hM > b + hF + 0.01) B(ASC.xF, y0, XB, y1, b + hF, hM, M.blanc);
  // les seuils d'aluminium (le palier, l'embrasure)
  B(XA - 0.09, yP0, XA, yP1, b, b + 0.005, X.alu);
  B(XA, yP0, XB + 0.05, yP1, b, b + 0.008, X.alu);
  // L'AFFICHEUR au milieu du passage, dans le linteau (centre à 2,125 m), sa lunette noire
  const aff = afficheur();
  const matAff = new THREE.MeshBasicMaterial({ map: aff.t, color: new THREE.Color(1.35, 1.35, 1.35) }); matAff.name = 'afficheur ' + b;
  // (f_0041 : la plaque de l'afficheur ≈ 0,2 × 0,09, sa fenêtre bleue ≈ 0,16 × 0,06, au milieu du linteau, au droit du
  // milieu du passage — le joint des vantaux est 1,5 cm plus au nord)
  const yA = (yP0 + yP1) / 2;
  B(XA - 0.005, yA - 0.1, XA, yA + 0.1, b + 2.08, b + 2.17, X.lunette);
  ch.panneau(matAff, 0.16, 0.06, XA - 0.0055, yA, b + 2.125, 'W', G);
  // LA PLATINE D'APPEL (VO g056 : petite platine carrée à ≈ 1,15 m, contre la façade) : l'inox, le bouton et son anneau
  // qui s'allume quand on appelle
  const yb = bouton === 'N' ? y1 : y0, sb = bouton === 'N' ? -1 : 1, xb = ASC.xF - 0.09;
  B(xb - 0.04, yb, xb + 0.04, yb + sb * 0.008, b + 1.07, b + 1.23, X.inox);
  const matAnneau = new THREE.MeshStandardMaterial({ color: 0x3a3632, roughness: 0.3 + b * 0.0007, emissive: 0xff6a1a, emissiveIntensity: 0 });
  matAnneau.name = 'anneau d\'appel ' + b;
  const anneau = maille(new THREE.CylinderGeometry(0.021, 0.021, 0.006, 20), matAnneau, xb, b + 1.15, -(yb + sb * 0.011), 0, G, { ombre: false });
  anneau.rotation.x = Math.PI / 2;
  const poussoir = maille(new THREE.CylinderGeometry(0.016, 0.016, 0.012, 20), X.alu, xb, b + 1.15, -(yb + sb * 0.014), 0, G, { ombre: false });
  poussoir.rotation.x = Math.PI / 2;
  // ---- LE MONDE SOLIDE : le fixe, le montant, le linteau ; le passage (une forme MOBILE si le palier est desservi) ----
  C.ajouterBoite(XA, -y0, XB + 0.05, -yP0, { y0: b, y1: hM });
  C.ajouterBoite(XA, -yP1, XB + 0.05, -y1, { y0: b, y1: hM });
  C.ajouterBoite(XA, -yP0, XB + 0.05, -yP1, { y0: b + hP, y1: hM });
  const forme = C.ajouterBoite(ASC.xF, -yP0, XB, -yP1, { y0: b, y1: b + hP, mobile: !!ouvert });

  // ---- LES DEUX VANTAUX (télescopiques : le rapide au nord, le lent au sud ; ils s'effacent derrière le fixe) ----
  // (dans un groupe à part, jamais cousu : ils bougent ; il suit la visibilité de son étage)
  const mob = new THREE.Group(); mob.name = 'ascenseur ' + b + ' (vantaux)';
  nePasFusionner(mob); ch.scene.add(mob);
  const vantail = (x0, x1, ya, yb2, bordN) => {
    const v = new THREE.Group(); v.position.set(0, 0, 0); mob.add(v);
    maille(boiteM(x1 - x0, hP - 0.012, yb2 - ya), X.inox, (x0 + x1) / 2, b + 0.006 + (hP - 0.012) / 2, -(ya + yb2) / 2, 0, v, { ombre: false });
    // le chant de rive (un filet sombre) côté joint : sur la face palière du vantail lent, sur la face cabine du rapide
    const yr = bordN ? yb2 : ya, xr = bordN ? x0 - 0.002 : x1 + 0.002;
    maille(boiteM(0.004, hP - 0.012, 0.006), X.joint, xr, b + 0.006 + (hP - 0.012) / 2, -(yr + (bordN ? -0.003 : 0.003)), 0, v, { ombre: false });
    return v;
  };
  const vLent = vantail(17.918, 17.94, yP0 - 0.005, yJ + 0.005, true);
  const vRapide = vantail(17.945, 17.967, yJ - 0.005, yP1 + 0.005, false);
  if (Math.abs(b) > 0.5) mob.traverse((o) => { o.userData.horsAOSol = true; });   // (ceux d'un étage : comme lui)
  // (ouverts, ils finissent tous deux contre le bord sud du fixe — sans dépasser le mur de la gaine)
  const ySud = Math.max(yP0 - 0.465, y0 + 0.005);
  const course = { lent: yP0 - 0.005 - ySud, rapide: yJ - 0.005 - ySud };

  // ---- LA CABINE (IMAGINÉE), seulement là où elle vient ----
  let lampe = null, cop = null;
  if (ouvert) {
    const K = ASC.cab, h = b + K.h;
    // le sol de granit, le seuil, les murs d'inox, le plafond blanc et ses quatre LED
    B(K.x0, K.y0, K.x1, K.y1, b, b + 0.012, X.granit, { ombre: false });
    B(K.x0, K.y0 + 0.04, K.x0 + 0.06, K.y1 - 0.04, b, b + 0.014, X.alu);
    B(K.x0, K.y0, K.x1, K.y0 + 0.04, b, h, X.inoxCab);
    B(K.x0, K.y1 - 0.04, K.x1, K.y1, b, h, X.inoxCab);
    B(K.x1 - 0.04, K.y0, K.x1, K.y1, b, h, X.inoxCab);
    B(K.x0, K.y0, K.x0 + 0.06, yP0, b, h, X.inoxCab);
    B(K.x0, yP1, K.x0 + 0.06, K.y1, b, h, X.inoxCab);
    B(K.x0, yP0, K.x0 + 0.06, yP1, b + hP, h, X.inoxCab);
    for (const [xa, ya, xb2, yb2] of [[K.x0 + 0.06, K.y0 + 0.04, K.x1 - 0.04, K.y0 + 0.05], [K.x0 + 0.06, K.y1 - 0.05, K.x1 - 0.04, K.y1 - 0.04], [K.x1 - 0.05, K.y0 + 0.04, K.x1 - 0.04, K.y1 - 0.04]]) B(xa, ya, xb2, yb2, b + 0.012, b + 0.11, X.noir);
    B(K.x0, K.y0, K.x1, K.y1, h, h + 0.03, X.plafond);
    for (const [x, y] of [[18.45, 8.07], [18.45, 8.68], [19.25, 8.07], [19.25, 8.68]]) {
      const d = maille(new THREE.CircleGeometry(0.032, 20), X.led, x, h - 0.002, -y, 0, G, { ombre: false, recoit: false });
      d.rotation.x = Math.PI / 2; d.userData.horsAOSol = true;
    }
    // la paroi du fond en deux panneaux (un joint à 1,0 m ; pas de miroir : la carte d'environnement de la zone, prise
    // hors de la cabine, y mettait un trou noir) et la main courante d'inox, sur deux consoles
    B(K.x1 - 0.042, K.y0 + 0.04, K.x1 - 0.04, K.y1 - 0.04, b + 1.0, b + 1.006, X.joint);
    const mc = maille(new THREE.CylinderGeometry(0.019, 0.019, 0.98, 14), X.inoxCab, K.x1 - 0.1, b + 0.92, -(K.y0 + K.y1) / 2, 0, G, { ombre: false });
    mc.rotation.x = Math.PI / 2;
    for (const y of [8.0, 8.75]) B(K.x1 - 0.1, y - 0.01, K.x1 - 0.04, y + 0.01, b + 0.9, b + 0.93, X.inoxCab);
    // LA BOÎTE À BOUTONS, sur la paroi nord, près de la porte
    cop = boiteBoutons();
    const matCop = new THREE.MeshStandardMaterial({ map: cop.t, roughness: 0.35, metalness: 0.3, emissive: 0xffffff, emissiveMap: cop.t, emissiveIntensity: 0.12 });
    matCop.name = 'boîte à boutons ' + b;
    ch.panneau(matCop, 0.16, 0.56, 18.24, K.y1 - 0.042, b + 1.22, 'S', G);
    // le monde solide : les parois, le plafond (la caméra s'y arrête), le plancher (au 2e, rien d'autre ne le porte)
    C.ajouterBoite(K.x0, -(K.y0 - 0.06), ASC.xM, -(K.y0 + 0.04), { y0: b, y1: b + 2.5 });
    C.ajouterBoite(K.x0, -(K.y1 - 0.04), ASC.xM, -(K.y1 + 0.06), { y0: b, y1: b + 2.5 });
    C.ajouterBoite(K.x1 - 0.04, -(K.y0 - 0.06), ASC.xM + 0.1, -(K.y1 + 0.06), { y0: b, y1: b + 2.5 });
    C.plafond(K.x0, -K.y1, K.x1, -K.y0, h);
    C.sol(ASC.xF - 0.05, -(K.y0 - 0.06), ASC.xM, -(K.y1 + 0.06), b);
    // sa lumière : un spot du jeu (js/ecole_lumieres.js), éteint tant que la cabine est fermée et vide (sans ombre, il
    // éclairerait le palier au travers des portes) ; jamais cuit au sol
    if (zone) { lampe = { x: 18.85, z: -(K.y0 + K.y1) / 2, h: h, zone, type: 'aucune', force: 0.75, base: b, cuire: false, poids: 1.6 }; ch.lampes.push(lampe); }
  }

  const P = { base: b, nom: libelle(b), ouvert: !!ouvert, groupe: G, mob, vLent, vRapide, course, forme, aff, matAnneau, cop, lampe, kVu: -1 };
  S.paliers.push(P);
  S.paliers.sort((p, q) => p.base - q.base);
  if (!S.cab && P.ouvert && Math.abs(b) < 0.5) S.cab = P;             // (la cabine attend au rez-de-chaussée)
  aff.dessiner(S.cab ? S.cab.nom : P.nom, 0);
  if (cop) cop.dessiner(S.paliers.map((p) => p.nom).reverse(), P.nom, null);
  return P;
}

// =====================================================================
//  LA BANDE SUD DU PALIER EST DU 1er (VO 68,2-70 s, q_0274-0281) — crochet de js/ecole_est.js poserPalierEst
// =====================================================================
// Le mur sud de la bande (la cloison des salles côté rue, y 7,035), d'ouest en est (pose de la caméra résolue sur
// f_0031, 68,2 s : dans l'embrasure de la porte du palier, (13,66 ; 8,27), à ≈ 1,45 m, cap 39° au sud de l'est, f 430
// px — la façade à 3,87 m de profondeur, l'angle nord-ouest du doublage à -18,3°, son angle sud-ouest, contre le bord
// est du tableau, à -11,8°, le bord ouest du tableau à -0,3°) : le grand tableau abstrait dans son cadre fin de bois
// foncé (x 15,2-16,03, de 1,2 à 2,35 m), accroché contre le DOUBLAGE (x 16,05-17,9, 32 cm : il commence au droit du
// pilastre de la cage, la bande n'a plus que 1,65 m devant l'ascenseur) ; sur la face ouest du doublage, haut, un disque
// de laiton ; sur sa face nord, le boîtier vert lumineux et sa plaque blanche (x ≈ 16,3 ; 1,3-1,48 et 1,1-1,2 m), la
// réglette murale (x 16,65-17,75, 2,3 m : l'éclairage de la bande, aucun plafonnier), l'extincteur au pied de
// l'ascenseur et la platine d'appel ; au fond, la façade palière. Aucune porte : ni le 103 ni la 104 ne s'ouvrent ici
// (la vidéo ne montre pas de porte entre x ≈ 14,5 et 17,9), ni l'issue de secours de js/ecole_etage1.js (elle tombait
// dans la gaine).
export function poserBandeSud(ch, { groupe, lampes = null }) {
  const { C, M } = ch, G = groupe, X = matieres(ch), b = N1;
  const B = (x0, ya, x1, yb, h0, h1, mat, o = {}) => ch.boite(Math.min(x0, x1), Math.min(ya, yb), Math.max(x0, x1), Math.max(ya, yb), h0, h1, mat, { ombre: false, ...o, parent: G });
  const yS = 7.035, yD = 7.355, xD = 16.05, H1 = b + 2.5;
  // LE DOUBLAGE, jusqu'au plafond de la bande, ses plinthes gris foncé (photo 28 : celles du palier)
  B(xD, yS, ASC.xF, yD, b, H1, M.blanc);
  C.ajouterBoite(xD, -yS, ASC.xF + 0.01, -yD, { y0: b, y1: H1 });
  B(xD, yD, XA, yD + 0.015, b, b + 0.082, X.plinthe);
  B(xD - 0.015, yS + 0.017, xD, yD + 0.015, b, b + 0.082, X.plinthe);
  // LE TABLEAU ABSTRAIT : la toile dans un cadre fin de bois foncé
  {
    const x0 = 15.2, x1 = 16.03, h0 = b + 1.2, h1 = b + 2.35, e = 0.028, y = yS;
    ch.panneau(X.tableau, x1 - x0 - 2 * e, h1 - h0 - 2 * e, (x0 + x1) / 2, y + 0.016, (h0 + h1) / 2, 'N', G);
    for (const [xa, xb, ha, hb] of [[x0, x1, h0, h0 + e], [x0, x1, h1 - e, h1], [x0, x0 + e, h0, h1], [x1 - e, x1, h0, h1]]) B(xa, y, xb, y + 0.026, ha, hb, X.cadre);
  }
  // le petit disque de laiton (une sonnerie ?), haut sur la face ouest du doublage (f_0031 : entre son angle et le
  // tableau, à ≈ 2,4 m)
  const disque = maille(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 18), X.laiton, xD - 0.015, b + 2.4, -7.2, 0, G, { ombre: false });
  disque.rotation.z = Math.PI / 2;
  // LE BOÎTIER VERT LUMINEUX dans son cadre blanc (≈ 11 × 19 cm ; déverrouillage ou interrupteur à voyant) et la petite
  // plaque blanche dessous
  B(16.24, yD, 16.35, yD + 0.045, b + 1.29, b + 1.48, M.boitier);
  B(16.255, yD + 0.045, 16.335, yD + 0.048, b + 1.31, b + 1.46, X.vert);
  B(16.25, yD, 16.34, yD + 0.014, b + 1.1, b + 1.2, M.boitier);
  // LA RÉGLETTE MURALE (x 16,65-17,75, 2,3 m ; f_0031 : son embout orange vers 16,6) : le corps blanc, le diffuseur
  // allumé, les embouts orange (VO g038, g074)
  {
    const x0 = 16.65, x1 = 17.75, h = b + 2.3, y = yD;
    B(x0, y, x1, y + 0.085, h - 0.03, h + 0.04, X.reglette);
    B(x0 + 0.03, y + 0.012, x1 - 0.03, y + 0.092, h - 0.045, h - 0.03, X.diffuseur);
    B(x0 + 0.03, y + 0.085, x1 - 0.03, y + 0.092, h - 0.03, h + 0.03, X.diffuseur);
    for (const [a, c] of [[x0, x0 + 0.03], [x1 - 0.03, x1]]) B(a, y, c, y + 0.095, h - 0.05, h + 0.045, X.embout);
    G.children.slice(-5).forEach((o) => { o.userData.horsAOSol = true; });
    const L = { x: (x0 + x1) / 2, z: -(y + 0.25), h, zone: 'e1est', type: 'tube', force: 1.1, base: b, cuire: false };
    ch.lampes.push(L); if (lampes) lampes.push(L);
  }
  // L'EXTINCTEUR au pied de l'ascenseur, sur le doublage, contre l'angle (f_0031, g056 : de ≈ 0,55 à 1,05 m ; pas de
  // pictogramme au-dessus)
  {
    const x = 17.7, y = yD + 0.1;
    maille(new THREE.CylinderGeometry(0.075, 0.075, 0.42, 18), X.rouge, x, b + 0.76, -y, 0, G);
    maille(new THREE.CylinderGeometry(0.03, 0.045, 0.07, 12), M.noirMat, x, b + 1.005, -y, 0, G);
    B(x - 0.012, y - 0.02, x + 0.07, y + 0.02, b + 1.01, b + 1.04, M.noirMat);
    B(x - 0.04, yD, x + 0.04, yD + 0.03, b + 0.9, b + 0.98, M.noirMat);
    const t = maille(new THREE.CylinderGeometry(0.011, 0.011, 0.34, 8), M.noirMat, x - 0.08, b + 0.82, -(y + 0.02), 0, G); t.rotation.z = 0.12;
    B(x - 0.03, y + 0.071, x + 0.03, y + 0.077, b + 0.7, b + 0.8, M.boitier);      // (l'étiquette blanche, g056)
    C.ajouterCercle(x, -y, 0.09, { y0: b, y1: b + 1.1 });
  }
  // LE PALIER DE L'ASCENSEUR, desservi
  return poserAscenseur(ch, { base: b, groupe: G, ouvert: true, y0: yD, hMur: H1, zone: 'e1est', bouton: 'S' });
}

// =====================================================================
//  LA CABINE QUI ROULE (à chaque image)
// =====================================================================
const doux = (k) => k * k * (3 - 2 * k);
// Haythem (et la caméra) portés d'un palier à l'autre, portes closes : on décale tout ce qui suit sa hauteur
function transporter(jeu, dy) {
  const p = jeu.user;
  for (const v of [p.pos, p.posPrec, p.posAff]) if (v) v.y += dy;
  if (Number.isFinite(p.solAff)) p.solAff += dy;
  if (p.mesh) p.mesh.position.y += dy;
  for (const v of [jeu.camPos, jeu.camTarget, jeu.lookCur, jeu.camera && jeu.camera.position]) if (v) v.y += dy;
}
// le palier desservi suivant (va-et-vient)
function suivant(S, servis) {
  const i = servis.indexOf(S.cab);
  let j = i + S.dir;
  if (j < 0 || j >= servis.length) { S.dir = -S.dir; j = i + S.dir; }
  return servis[Math.max(0, Math.min(servis.length - 1, j))];
}
export function majAscenseur(ch, dt, jeu) {
  const S = ch._ascenseur;
  if (!S || !S.paliers.length || !jeu || !jeu.user) return;
  const L = S.paliers, servis = L.filter((p) => p.ouvert);
  // (les vantaux d'un étage : visibles avec lui)
  for (const P of L) if (P.groupe !== ch.decor && P.mob.visible !== P.groupe.visible) P.mob.visible = P.groupe.visible;
  if (servis.length && !S.cab) S.cab = servis[0];
  if (servis.length) {
    const u = jeu.user.pos, x = u.x, y = -u.z, hh = u.y, K = ASC.cab;
    const niv = L.find((p) => Math.abs(hh - p.base) < 1.0) || null;
    const ouv = !!(niv && niv.ouvert);
    // (devant : le bout du dégagement ou de la bande, à 1,6 m de la porte — pas le couloir est, ni le palier)
    const devant = ouv && x > ASC.xF - 1.6 && x < ASC.xF && y > ASC.yP0 - 0.75 && y < ASC.yN + 0.05;
    const dedans = ouv && x >= ASC.xF - 0.02 && x < ASC.xM && y > K.y0 && y < K.y1;
    const seuil = ouv && x > ASC.xF - 0.5 && x < K.x0 + 0.32 && y > ASC.yP0 - 0.1 && y < ASC.yP1 + 0.1;
    const ici = niv === S.cab, vit = dt / 0.85;          // (les portes s'ouvrent ou se ferment en 0,85 s)
    if (S.phase === 'arret') {
      const present = ici && (devant || dedans);
      S.absent = present ? 0 : S.absent + dt;
      if (ici && dedans && !seuil && S.k > 0.95) S.dedansT += dt; else if (!(ici && dedans)) S.dedansT = 0;
      if (S.dedansT > 1.8 && servis.length > 1) {
        S.cible = suivant(S, servis); S.passager = true; S.phase = 'ferme';
      } else if (ouv && niv !== S.cab && devant) {
        S.cible = niv; S.appel = niv; S.passager = false; S.phase = 'ferme';
      } else S.k = Math.max(0, Math.min(1, S.k + (present || S.absent < 2.2 ? vit : -vit)));
    } else if (S.phase === 'ferme') {
      // (dans l'embrasure, les portes se rouvrent : la cellule de la cabine)
      if (ici && seuil) { S.phase = 'arret'; S.dedansT = 0; S.absent = 0; S.cible = null; S.passager = false; }
      else {
        S.k = Math.max(0, S.k - vit);
        if (S.k <= 0) {
          const di = Math.abs(L.indexOf(S.cible) - L.indexOf(S.cab));
          S.phase = 'route'; S.t = 0; S.duree = 1.4 + 1.3 * di; S.de = S.cab; S.sens = Math.sign(S.cible.base - S.cab.base) || 1;
          if (ici && dedans) {
            // HAYTHEM EST DEDANS : il part avec la cabine (porté tout de suite au palier d'arrivée, portes closes)
            transporter(jeu, S.cible.base - S.cab.base);
            S.cible.groupe.visible = true; S.cible.mob.visible = true;
            jeu.addShake?.(0.006, 0.3);
          }
        }
      }
    } else if (S.phase === 'route') {
      S.t += dt;
      if (S.t >= S.duree) { S.cab = S.cible; S.cible = null; S.appel = null; S.sens = 0; S.phase = 'ouvre'; if (S.passager) jeu.addShake?.(0.005, 0.25); }
    } else if (S.phase === 'ouvre') {
      S.k = Math.min(1, S.k + vit);
      // (arrivé, il a quatre secondes pour sortir avant que la cabine ne reparte avec lui)
      if (S.k >= 1) { S.phase = 'arret'; S.absent = 0; S.dedansT = -2.2; S.passager = false; }
    }
    // LES VANTAUX, LA FORME DU PASSAGE, LA LAMPE DE LA CABINE
    for (const P of L) {
      const k = P === S.cab ? doux(S.k) : 0;
      if (Math.abs(k - P.kVu) > 1e-4) {
        P.kVu = k;
        P.vLent.position.z = k * P.course.lent;          // (vers le sud : z monte)
        P.vRapide.position.z = k * P.course.rapide;
      }
      if (P.ouvert) P.forme.off = k > 0.9;
      if (P.lampe) P.lampe.type = (P === S.cab && S.k > 0.02) || (dedans && niv === P) ? 'spot' : 'aucune';
      const lum = S.appel === P ? 2.4 : 0;
      if (P.matAnneau.emissiveIntensity !== lum) P.matAnneau.emissiveIntensity = lum;
    }
  }
  // L'AFFICHAGE (les afficheurs des paliers, les boîtes à boutons) : seulement quand il change
  let txt = S.cab ? S.cab.nom : L[0].nom, fl = 0;
  if (S.phase === 'route' && S.de && S.cible) { txt = (S.t / S.duree < 0.5 ? S.de : S.cible).nom; fl = S.sens; }
  const cib = S.passager && S.cible ? S.cible.nom : null;
  const vu = txt + '|' + fl + '|' + cib + '|' + L.length;
  if (vu !== S.vu) {
    S.vu = vu;
    const noms = L.map((p) => p.nom).reverse();
    for (const P of L) { P.aff.dessiner(txt, fl); if (P.cop) P.cop.dessiner(noms, txt, cib); }
  }
}
