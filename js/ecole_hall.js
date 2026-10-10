// =====================================================================
//  LE HALL D'ENTRÉE DE L'ÉCOLE IRIS : L'ACCUEIL, L'OPEN-SPACE, L'ANGLE NORD-EST, LE PLAFOND (crochet de js/carte_ecole.js)
// =====================================================================
// D'après la VIDÉO OFFICIELLE DE VISITE (VO, 26/04/2021 : references/ecole/visite_officielle, 6,4-7,4 s en entrant par la
// porte 6, 92,5-95,8 s en revenant du couloir est vers la rue) et les photos de Haythem de 2026 (03, 16, 24), qui
// l'emportent là où elles voient quelque chose (10/10). Le mobilier « Covid » de 2021 (écrans de plexiglas sur le
// comptoir, colonne de gel, flacons) n'est PAS repris.
//
// LE PLAN (repère de js/carte_ecole.js : x le long de la façade, y vers le fond ; dans le jeu X = x, Z = -y) :
//   le comptoir d'accueil   x 16,45-17,15 y 1,1-2,45   NORD-SUD, face à l'ouest (l'axe de la porte 6), 1,10 m, sa rainure
//                                                     à 0,55, sa tablette haute grise en saillie (VO q_0373-0380, photo
//                                                     03 : vu de biais, son bout nord plus haut que son bout sud)
//   la tablette PMR         x 16,2-17,15  y 2,45-2,95  le comptoir abaissé à 0,78 contre le pupitre ; l'écran, l'unité
//                                                     centrale et le range-documents violet derrière (VO q_0380)
//   le pupitre              x 16,45-17,45 y 2,95-3,55  façade nord de chêne grisé, rainure sombre à 0,8 m, dessus gris
//   l'open-space            x 17,2-19,8   y 0,3-6,0    derrière le comptoir : bureaux bleu-gris en L le long des fenêtres
//                                                     et du mitoyen, fauteuils noirs, imprimante, carton, dossiers
//   le mitoyen est          x 19,8        y 0-7,5      peint GRIS ARDOISE ; l'affiche noire à l'immeuble blanc et cadre
//                                                     magenta, la photo encadrée d'une tour, la caméra dôme
//   l'angle nord-est        x 16,3-19,8   y 5,5-7,5    OUVERT sur le hall (VO 6,4-7,4 s : ni murs ni porte) : le
//                                                     photocopieur contre le pan cannelé, le caisson et ses corbeilles, le
//                                                     mur blanc aux étiquettes ocre « INFORMATIQUE », la table blanche et
//                                                     sa chaise de hêtre ; le présentoir de bois au nord-est du pupitre
//   le plafond              x 14,35-16,45 y 0,5-4,1    huit lignes lumineuses nord-sud dans l'axe de la porte 6 (VO 92,6-93,6
//                                                     s ; la photo 24 en voit les joints en 2026), les spots ronds autour
//                                                     (posés par la carte)
// (Le cannelé à un seul pan et le mur plein : js/ecole_est.js ; la pile, sa plaque et son annuaire : un autre lot.)
//
//   poserHall(ch)       (appelé par construireAccueil, js/carte_ecole.js)
import * as THREE from 'three';
import { maille, boiteM } from './ecole_portes.js';
import { canvasTex, detailPhoto } from './kit_decor.js';
import { texPeinture } from './ecole_matieres.js';

// ---- les cotes (plan) ----
const H_PLAF = 2.6;                                 // le plafond du hall
const CPT = { x0: 16.45, x1: 17.15, y0: 1.1, y1: 2.45, h: 1.10 };   // le comptoir haut
const PMR = { y0: 2.45, y1: 2.95, h: 0.78 };                        // la tablette PMR
const PUP = { x0: 16.45, x1: 17.45, y0: 2.95, y1: 3.55, h: 1.12 };  // le pupitre
const X_PERS = 17.78;                                               // le dos du plan de travail du personnel
const Y_MUR = 7.5;                                  // la face hall du mur nord (y 7,5-7,65)
const X_MIT = 19.8;                                 // la face du mitoyen est

// =====================================================================
//  LES TEXTURES (dessinées : aucun fichier de plus à charger)
// =====================================================================
function graine(s) {
  let x = s >>> 0 || 1;
  return () => { x ^= x << 13; x >>>= 0; x ^= x >> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; };
}
// LE STRATIFIÉ CHÊNE GRISÉ du pupitre (VO q_0377, q_0380) : un fond taupe gris, des veines verticales fines et serrées,
// à peine marquées (de loin, presque uni). Tuile : 1 m.
function texChene() {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#a99c8b'; g.fillRect(0, 0, w, h);
    const r2 = graine(77);
    for (let k = 0; k < 220; k++) {
      const x = r2() * w, l = 0.5 + r2() * 1.8, a = 0.04 + r2() * 0.08;
      g.fillStyle = r2() < 0.55 ? `rgba(98,86,72,${a})` : `rgba(206,198,186,${a})`; g.fillRect(x, 0, l, h);
    }
  }, [1, 1], false, 4);
}
// UNE ÉTIQUETTE MURALE OCRE (VO q_0027-0028, recadrage hall_work/c_72_info) : aplat jaune moutarde, un mot en capitales
// blanches, grasses, serrées. La grande dit « INFORMATIQUE » ; le mot de la petite est illisible à 640 px.
function texEtiquette(mot, w, h) {
  const W = 512, H = Math.round(W * h / w);
  return canvasTex(W, H, (g) => {
    g.fillStyle = '#d9ad3e'; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(0, 0, W, H * 0.45);
    g.fillStyle = '#fbf7ee'; g.textAlign = 'center'; g.textBaseline = 'middle';
    let s = Math.round(H * 0.42);
    do { g.font = `800 ${s}px "Segoe UI", Arial, sans-serif`; s -= 2; } while (g.measureText(mot).width > W * 0.84 && s > 10);
    g.fillText(mot, W / 2, H * 0.53);
  }, null, false, 4);
}
// L'AFFICHE DU MITOYEN (VO q_0378-0381) : fond noir, la façade d'un immeuble en blanc — une grille de fenêtres noires,
// vue un peu en contre-plongée —, un petit texte blanc en haut à gauche, « iris » en bas à droite (le cadre magenta est
// une moulure à part)
function texImmeuble() {
  return canvasTex(256, 352, (g, w, h) => {
    g.fillStyle = '#121214'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#e9e9e6'; g.font = '600 13px "Segoe UI", Arial, sans-serif';
    g.fillText('L’ÉCOLE', 18, 30); g.fillStyle = '#9a9aa0'; g.fillRect(18, 38, 70, 4); g.fillRect(18, 46, 52, 4);
    // la façade : un trapèze (plus large en bas), des rangées de fenêtres qui rétrécissent vers le haut
    const xb0 = 30, xb1 = 226, xt0 = 52, xt1 = 204, yt = 74, yb = 300;
    g.fillStyle = '#f2f2ef'; g.beginPath(); g.moveTo(xt0, yt); g.lineTo(xt1, yt); g.lineTo(xb1, yb); g.lineTo(xb0, yb); g.closePath(); g.fill();
    const rangs = 9, cols = 7;
    for (let j = 0; j < rangs; j++) {
      const t0 = (j + 0.22) / rangs, t1 = (j + 0.78) / rangs;
      const y0 = yt + (yb - yt) * t0, y1 = yt + (yb - yt) * t1;
      const L0 = xt0 + (xb0 - xt0) * t0, R0 = xt1 + (xb1 - xt1) * t0;
      for (let i = 0; i < cols; i++) {
        const u0 = (i + 0.18) / cols, u1 = (i + 0.82) / cols;
        g.fillStyle = (i + j) % 5 === 0 ? '#3a3a40' : '#141416';
        g.fillRect(L0 + (R0 - L0) * u0, y0, (R0 - L0) * (u1 - u0), y1 - y0);
      }
    }
    g.fillStyle = '#ffffff'; g.font = '600 26px "Century Gothic", "Avenir", "Segoe UI", sans-serif'; g.fillText('iris', w - 64, h - 18);
    g.fillStyle = '#f1b40c'; g.fillRect(w - 64, h - 40, 6, 4);
  }, null, false, 4);
}
// LA PHOTO ENCADRÉE (VO q_0377-0381) : une tour moderne blanche sous un ciel pâle, ses étages en bandeaux, un petit logo
// en bas à gauche
function texTour() {
  return canvasTex(256, 374, (g, w, h) => {
    const ciel = g.createLinearGradient(0, 0, 0, h); ciel.addColorStop(0, '#b9c8d8'); ciel.addColorStop(1, '#e9edf1');
    g.fillStyle = ciel; g.fillRect(0, 0, w, h);
    // la tour, un peu en perspective : la face claire à gauche, l'ombre à droite
    g.fillStyle = '#f4f4f2'; g.beginPath(); g.moveTo(70, 40); g.lineTo(150, 30); g.lineTo(156, 330); g.lineTo(62, 330); g.closePath(); g.fill();
    g.fillStyle = '#c9ced4'; g.beginPath(); g.moveTo(150, 30); g.lineTo(196, 48); g.lineTo(200, 330); g.lineTo(156, 330); g.closePath(); g.fill();
    for (let y = 52; y < 326; y += 11) {
      g.fillStyle = 'rgba(70,86,104,0.55)'; g.fillRect(70 - (y - 40) * 0.027, y, 82 + (y - 40) * 0.047, 4);
      g.fillStyle = 'rgba(60,72,88,0.45)'; g.fillRect(157, y + 1, 41, 3);
    }
    g.fillStyle = '#6f777f'; g.fillRect(0, 330, w, h - 330);
    g.fillStyle = '#1b1b1d'; g.fillRect(14, h - 30, 46, 18);
    g.fillStyle = '#ffffff'; g.font = '600 12px "Century Gothic", "Segoe UI", sans-serif'; g.fillText('iris', 22, h - 16);
  }, null, false, 4);
}
// LES BROCHURES BLANCHES « iris » du présentoir de bois (VO q_0026-0028) : couvertures claires, le pavé noir, une photo
function texBrochures() {
  return canvasTex(256, 96, (g, w, h) => {
    g.fillStyle = '#6e5232'; g.fillRect(0, 0, w, h);
    const r2 = graine(19);
    for (let i = 0; i < 3; i++) {
      const x = 6 + i * 84;
      g.fillStyle = '#f6f5f1'; g.fillRect(x, 6, 76, h - 8);
      g.fillStyle = '#151517'; g.fillRect(x + 8, 12, 40, 16);
      g.fillStyle = '#ffffff'; g.font = '600 13px "Century Gothic", "Segoe UI", sans-serif'; g.fillText('iris', x + 14, 25);
      g.fillStyle = '#f1b40c'; g.fillRect(x + 14, 14, 3, 2);
      const c = ['#6c8fb3', '#c98f5a', '#8aa880'][(i + Math.floor(r2() * 3)) % 3];
      g.fillStyle = c; g.fillRect(x + 8, 36, 60, 34);
      g.fillStyle = '#9aa0a6'; g.fillRect(x + 8, 76, 50, 4);
    }
  }, null, false, 4);
}
// LE COUSSIN RAYÉ noir et blanc du fauteuil derrière le pupitre (VO q_0373)
function texZebre() {
  return canvasTex(64, 64, (g, w, h) => {
    g.fillStyle = '#e9e7e2'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#16161a';
    for (let k = -4; k < 8; k++) { g.beginPath(); g.moveTo(k * 12, 0); g.lineTo(k * 12 + 6, 0); g.lineTo(k * 12 + 6 + 20, h); g.lineTo(k * 12 + 20, h); g.closePath(); g.fill(); }
  }, null, false, 2);
}
// LE CYLINDRE BLANC marqué « iris » sur le bureau d'angle (VO q_0380)
function texPotIris() {
  return canvasTex(128, 64, (g, w, h) => {
    g.fillStyle = '#f2f1ec'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#151517'; g.font = '600 26px "Century Gothic", "Segoe UI", sans-serif'; g.fillText('iris', 12, 40);
    g.fillStyle = '#f1b40c'; g.fillRect(12, 16, 5, 3);
  }, null, false, 2);
}
// LE CONTREPLAQUÉ DE HÊTRE PERFORÉ du dossier des chaises de salle de cours (VO q_0027, la chaise sous les étiquettes)
function texHetrePerfore() {
  return canvasTex(128, 64, (g, w, h) => {
    g.fillStyle = '#d4a86e'; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(150,104,60,0.25)'; for (let x = 0; x < w; x += 3) g.fillRect(x, 0, 1, h);
    g.fillStyle = '#5a3e24';
    for (let j = 0; j < 3; j++) for (let i = 0; i < 8; i++) { g.beginPath(); g.arc(14 + i * 14.5, 16 + j * 16, 3.2, 0, 7); g.fill(); }
  }, null, false, 2);
}

// =====================================================================
//  LES MATIÈRES DU HALL
// =====================================================================
function matieresHall(M) {
  const std = (o, nom) => { const m = new THREE.MeshStandardMaterial(o); m.name = nom; return m; };
  const H = {
    // le mitoyen gris ardoise bleuté (VO q_0373-0381 : brut #5A5A74 sous l'étalonnage froid, rééquilibré sur le blanc
    // voisin #EFEDE8 : #5F6575), mat
    ardoise: std({ map: texPeinture(0x5f6575, 4), roughness: 0.82 }, 'peinture gris ardoise (mitoyen de l\'accueil)'),
    // le comptoir : un stratifié blanc gris (plus clair que M.comptoir), la tablette haute gris clair, la rainure
    comptoir: std({ color: 0xe4e4e6, roughness: 0.42 }, 'stratifié blanc gris (comptoir)'),
    tablette: std({ color: 0xcfcfd2, roughness: 0.32 }, 'tablette gris clair (comptoir)'),
    rainure: std({ color: 0x3a3b3f, roughness: 0.5 }, 'rainure du comptoir'),
    chene: std({ map: texChene(), roughness: 0.5 }, 'stratifié chêne grisé (pupitre)'),
    dessus: std({ color: 0xc9c9cc, roughness: 0.35 }, 'dessus gris du pupitre'),
    bureau: std({ color: 0x3d4150, roughness: 0.48 }, 'bureau bleu-gris foncé'),
    pied: std({ color: 0x2c2f37, roughness: 0.4, metalness: 0.4 }, 'piètement des bureaux'),
    violet: std({ color: 0x6a2a8a, roughness: 0.45 }, 'range-documents violet'),
    carton: std({ color: 0xa77b4f, roughness: 0.9 }, 'carton'),
    copieur: std({ color: 0xdcdcd8, roughness: 0.45 }, 'photocopieur (corps)'),
    copieur2: std({ color: 0xaeaeab, roughness: 0.5 }, 'photocopieur (scanner, tiroirs)'),
    caisson: std({ color: 0xc8c8c5, roughness: 0.55 }, 'caisson gris clair'),
    corbeille: std({ color: 0x55585e, roughness: 0.5 }, 'corbeille à courrier grise'),
    corbeilleO: std({ color: 0xe8862a, roughness: 0.5 }, 'corbeille à courrier orange'),
    tableB: std({ color: 0xf1f0ec, roughness: 0.4 }, 'table blanche'),
    hetre: std({ color: 0xd4a86e, roughness: 0.5 }, 'contreplaqué de hêtre'),
    hetrePerfore: std({ map: texHetrePerfore(), roughness: 0.5, side: THREE.DoubleSide }, 'dossier de hêtre perforé'),
    boisPres: std({ color: 0xa8794a, roughness: 0.55 }, 'bois du présentoir'),
    magenta: std({ color: 0x8a2f7a, roughness: 0.5 }, 'cadre magenta'),
    argent: std({ color: 0xb8bbbe, roughness: 0.3, metalness: 0.8 }, 'cadre argent'),
    ecran: std({ color: 0x1e2836, roughness: 0.2, emissive: 0x4a6280, emissiveIntensity: 0.22 }, 'écran allumé'),
  };
  // (les murs peints : le léger relief d'enduit des autres peintures)
  detailPhoto(H.ardoise, 'beton', 1, 1, { relief: 0.035, grain: 0, rugo: false });
  // LES LIGNES LUMINEUSES du plafond : des rubans de LED qui éblouissent (MeshBasic au-dessus de 1 : le bloom les fait
  // briller, comme les spots — js/ecole_matieres.js M.spot)
  H.ligne = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff3e2).multiplyScalar(3.6) }); H.ligne.name = 'ligne lumineuse du plafond';
  H.profil = std({ color: 0xd9d9d6, roughness: 0.4, metalness: 0.5 }, 'profil des lignes lumineuses');
  void M;
  return H;
}

// =====================================================================
//  LES OUTILS
// =====================================================================
const ROT = { S: 0, N: Math.PI, E: Math.PI / 2, W: -Math.PI / 2 };
const DIR = { S: [0, 1], N: [0, -1], E: [1, 0], W: [-1, 0] };      // (en monde : x, z)
// un groupe posé au point (x, y) du plan, son « avant » (+z local) tourné vers `face`
function groupe(ch, x, y, face) {
  const g = new THREE.Group(); g.position.set(x, 0, -y); g.rotation.y = ROT[face]; ch.decor.add(g);
  return g;
}
// une boîte en coordonnées LOCALES d'un groupe : centre (x, y, z), tailles (w, h, d)
const BL = (g, mat, w, h, d, x, y, z, o) => maille(boiteM(w, h, d), mat, x, y, z, 0, g, o);
const CL = (g, mat, r, h, x, y, z, seg = 10, o) => maille(new THREE.CylinderGeometry(r, r, h, seg), mat, x, y, z, 0, g, o);
// UN SIÈGE pour le jeu (js/game.js : on s'assoit à moins de 1,1 m) : regard vers `face`, relevé en (sx, sy) du plan
function siege(ch, x, y, h, face, sx, sy, nom) {
  const [fx, fz] = DIR[face];
  ch.sieges.push({ x: x + fx * 0.03, z: -y + fz * 0.03, y: h, fx, fz, sx, sz: -sy, nom, sol: 0 });
}

// LE FAUTEUIL DE BUREAU NOIR (VO q_0373-0380) : piètement étoile à roulettes, vérin, assise rembourrée, dossier résille,
// accoudoirs. `zebre` : le coussin rayé noir et blanc.
function fauteuil(ch, x, y, face, { zebre = false, sx, sy, nom = 'le fauteuil', rot = 0 } = {}) {
  const M = ch.M, g = groupe(ch, x, y, face); g.rotation.y += rot;
  for (let k = 0; k < 5; k++) {
    const a = k / 5 * Math.PI * 2, b = BL(g, M.noir, 0.05, 0.03, 0.3, Math.sin(a) * 0.15, 0.075, Math.cos(a) * 0.15, { ombre: false });
    b.rotation.y = a;
    maille(new THREE.SphereGeometry(0.025, 8, 6), M.noir, Math.sin(a) * 0.29, 0.025, Math.cos(a) * 0.29, 0, g, { ombre: false });
  }
  CL(g, M.inox, 0.022, 0.32, 0, 0.25, 0);
  BL(g, M.noir, 0.5, 0.08, 0.48, 0, 0.45, 0.02);
  const dos = BL(g, M.noir, 0.46, 0.56, 0.05, 0, 0.82, -0.22); dos.rotation.x = -0.12;
  for (const s of [-1, 1]) { BL(g, M.noir, 0.04, 0.2, 0.04, s * 0.25, 0.58, 0.0, { ombre: false }); BL(g, M.noir, 0.06, 0.025, 0.26, s * 0.25, 0.69, 0.02, { ombre: false }); }
  if (zebre) {
    const z = new THREE.MeshStandardMaterial({ map: texZebre(), roughness: 0.85 });
    BL(g, z, 0.44, 0.05, 0.42, 0, 0.515, 0.02, { ombre: false });
  }
  ch.C.ajouterCercle(x, -y, 0.24, { y1: 1.1 });
  siege(ch, x, y, 0.5, face, sx ?? x, sy ?? y, nom);
  return g;
}
// UNE CHAISE DE HÊTRE des salles de cours (VO q_0027 ; hall_work/c_72_coin) : assise et dossier de contreplaqué, le
// dossier perforé, le piètement chromé
function chaiseHetre(ch, x, y, face, sx, sy) {
  const { M } = ch, H = ch._hall, g = groupe(ch, x, y, face);
  for (const [px, pz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const p = CL(g, M.inox, 0.011, 0.46, px * 0.19, 0.23, pz * 0.18, 8, { ombre: false });
    p.rotation.z = -px * 0.06;
  }
  for (const s of [-1, 1]) CL(g, M.inox, 0.011, 0.5, s * 0.19, 0.7, -0.21, 8, { ombre: false });
  BL(g, H.hetre, 0.42, 0.014, 0.41, 0, 0.465, 0.0);
  const d = BL(g, H.hetrePerfore, 0.42, 0.24, 0.012, 0, 0.84, -0.215); d.rotation.x = -0.1;
  ch.C.ajouterCercle(x, -y, 0.22, { y1: 1.0 });
  siege(ch, x, y, 0.47, face, sx, sy, 'la chaise');
  return g;
}
// UN ÉCRAN DE BUREAU (pied, dalle noire ; `allume` : l'écran vu de face)
function ecran(ch, x, y, h, face, allume = false) {
  const { M } = ch, H = ch._hall, g = groupe(ch, x, y, face); g.position.y = h;
  BL(g, M.noir, 0.2, 0.012, 0.16, 0, 0.006, 0, { ombre: false });
  BL(g, M.noir, 0.05, 0.16, 0.03, 0, 0.09, -0.03, { ombre: false });
  BL(g, M.noir, 0.56, 0.34, 0.03, 0, 0.33, 0.0);
  if (allume) { const e = new THREE.Mesh(new THREE.PlaneGeometry(0.53, 0.3), H.ecran); e.position.set(0, 0.33, 0.016); g.add(e); }
  return g;
}

// =====================================================================
//  LE HALL (crochet de js/carte_ecole.js : construireAccueil)
// =====================================================================
export function poserHall(ch) {
  const { M, C } = ch;
  const H = ch._hall = matieresHall(M);
  const B = (x0, y0, x1, y1, h0, h1, mat, o) => ch.boite(Math.min(x0, x1), Math.min(y0, y1), Math.max(x0, x1), Math.max(y0, y1), h0, h1, mat, o);

  // =====================================================================
  //  LE MITOYEN EST, PEINT GRIS ARDOISE (VO q_0373-0381)
  // =====================================================================
  // (la vidéo ne le voit qu'au sud de y ≈ 4,5 ; au nord, le coin derrière le présentoir, sous la caméra dôme, sort sombre
  // à 6,7 s — on garde le gris jusqu'au mur nord. Plinthe de bois, comme tout le hall.)
  ch.mur({ de: [19.95, -0.4], a: [19.95, 7.65], ep: 0.3, mats: { W: H.ardoise, E: M.blanc }, plinthes: ['W'] });
  // L'AFFICHE À L'IMMEUBLE (0,8 x 1,1 m, centre à 1,75 m, vers y 4,3) dans son cadre magenta-violet
  const xa = X_MIT - 0.012;
  ch.panneau(new THREE.MeshStandardMaterial({ map: texImmeuble(), roughness: 0.55 }), 0.72, 1.02, xa - 0.004, 4.3, 1.75, 'W');
  for (const [y0, y1, h0, h1] of [[3.9, 4.7, 2.26, 2.3], [3.9, 4.7, 1.2, 1.24], [3.9, 3.94, 1.2, 2.3], [4.66, 4.7, 1.2, 2.3]]) B(xa - 0.02, y0, X_MIT, y1, h0, h1, H.magenta, { ombre: false });
  // LA PHOTO ENCADRÉE d'une tour (0,65 x 0,95 m, cadre argent, vers y 2,8)
  ch.panneau(new THREE.MeshStandardMaterial({ map: texTour(), roughness: 0.3 }), 0.6, 0.9, xa - 0.004, 2.8, 1.78, 'W');
  for (const [y0, y1, h0, h1] of [[2.475, 3.125, 2.23, 2.255], [2.475, 3.125, 1.305, 1.33], [2.475, 2.5, 1.305, 2.255], [3.1, 3.125, 1.305, 2.255]]) B(xa - 0.018, y0, X_MIT, y1, h0, h1, H.argent, { ombre: false });
  // LES DEUX CAMÉRAS DÔMES au plafond : au-dessus des affiches (VO q_0380), dans l'angle nord-est (VO 6,7 s)
  for (const [x, y] of [[19.55, 3.35], [18.95, 7.2]]) {
    const d = maille(new THREE.SphereGeometry(0.06, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M.boitier, x, H_PLAF, -y, 0, ch.decor, { ombre: false });
    const c = maille(new THREE.CylinderGeometry(0.075, 0.075, 0.02, 20), M.boitier, x, H_PLAF - 0.01, -y, 0, ch.decor, { ombre: false });
    d.userData.horsAOSol = c.userData.horsAOSol = true;
  }

  // =====================================================================
  //  LE COMPTOIR D'ACCUEIL NORD-SUD, LA TABLETTE PMR, LE PUPITRE (VO q_0373-0384, photo 03)
  // =====================================================================
  // (RELEVÉ DU 10/10. Les projections au sol de hall.md, à 93 s, mettaient le pupitre en y 4,2-5,0 ; mais à 7,0 s, depuis
  // la porte 6, on voit le photocopieur EN ENTIER, pied compris, à 18-28° à droite de l'axe — un bloc de 1,12 m en x 16,2
  // y 4,2-5,0 le cacherait. À 92,6 s, la caméra passe la porte nord (≈ 15,15 ; 7,05, cap ≈ 173°) : le pied de la face
  // nord du pupitre est à ≈ 3,8 m, celui du bout sud du comptoir à ≈ 6 m ; la face avant passe par (16,3 ; 1,26) et
  // (16,55 ; 2,54). D'où : le comptoir de y 1,1 à 2,45, la tablette PMR jusqu'à 2,95, le pupitre jusqu'à 3,55 ; derrière
  // lui le fauteuil rayé (≈ 17,95 ; 3,1), et le présentoir de bois plus au nord, vers (17,2 ; 4,9), qui se voit au bord
  // droit à 7,0 s et au bord gauche à 92,6 s.)
  // le comptoir haut : socle sombre en retrait, caisson de stratifié blanc gris, la rainure à 0,55 m sur la face avant
  // (ouest) et sur le bout sud, la tablette haute grise qui déborde de 8 cm côté visiteurs
  B(CPT.x0 + 0.06, CPT.y0 + 0.06, CPT.x1, CPT.y1, 0, 0.1, M.socle);
  B(CPT.x0, CPT.y0, CPT.x1, CPT.y1, 0.1, CPT.h - 0.06, H.comptoir);
  B(CPT.x0 - 0.004, CPT.y0, CPT.x0, CPT.y1, 0.545, 0.56, H.rainure, { ombre: false });
  B(CPT.x0, CPT.y0 - 0.004, CPT.x1, CPT.y0, 0.545, 0.56, H.rainure, { ombre: false });
  B(CPT.x0 - 0.08, CPT.y0 - 0.02, CPT.x1 + 0.02, CPT.y1, CPT.h - 0.06, CPT.h, H.tablette);
  // la tablette PMR : le comptoir abaissé contre le pupitre (le dessus déborde de 25 cm : les genoux d'un fauteuil roulant)
  B(CPT.x0 + 0.06, PMR.y0, CPT.x1, PMR.y1, 0, 0.1, M.socle);
  B(CPT.x0, PMR.y0, CPT.x1, PMR.y1, 0.1, PMR.h - 0.035, H.comptoir);
  B(CPT.x0 - 0.25, PMR.y0, CPT.x1, PMR.y1, PMR.h - 0.035, PMR.h, H.tablette);
  // (son flanc sud, de chêne grisé, jusqu'au sol : VO 93,6 s, sous la tablette)
  B(CPT.x0 - 0.25, PMR.y0, CPT.x0, PMR.y0 + 0.025, 0, PMR.h - 0.035, H.chene);
  B(CPT.x0 - 0.25, PMR.y0 - 0.004, CPT.x0, PMR.y0, 0.79, 0.81, H.rainure, { ombre: false });
  // le pupitre : un bloc à façade nord de chêne grisé (la rainure sombre à 0,8 m), ses faces ouest et sud blanches comme
  // le comptoir (VO 92,6-93,6 s), le dessus gris débordant
  B(PUP.x0 + 0.05, PUP.y0, PUP.x1, PUP.y1 - 0.05, 0, 0.08, M.socle);
  B(PUP.x0, PUP.y0, PUP.x1, PUP.y1, 0.08, PUP.h - 0.04, H.chene);
  B(PUP.x0 - 0.004, PUP.y0, PUP.x0, PUP.y1, 0.08, PUP.h - 0.04, H.comptoir, { ombre: false });
  B(PUP.x0, PUP.y0 - 0.004, PUP.x1, PUP.y0, PMR.h, PUP.h - 0.04, H.comptoir, { ombre: false });
  B(PUP.x0, PUP.y1, PUP.x1, PUP.y1 + 0.004, 0.79, 0.81, H.rainure, { ombre: false });
  B(PUP.x0 - 0.05, PUP.y0 - 0.02, PUP.x1 + 0.02, PUP.y1 + 0.05, PUP.h - 0.04, PUP.h, H.dessus);
  // derrière (est) : le plan de travail du personnel à 0,75 m, le long du comptoir et du pupitre, sur trois pieds
  B(CPT.x1, CPT.y0 + 0.05, X_PERS, PUP.y1 - 0.03, 0.72, 0.75, H.tablette);
  for (const y of [CPT.y0 + 0.1, 2.3, PUP.y1 - 0.1]) B(X_PERS - 0.06, y - 0.025, X_PERS - 0.02, y + 0.025, 0, 0.72, H.pied, { ombre: false });
  // le monde solide : tout le bloc, d'un tenant (la tablette PMR comprise)
  C.ajouterBoite(CPT.x0 - 0.08, -CPT.y1, X_PERS, -(CPT.y0 - 0.02), { y1: CPT.h });
  C.ajouterBoite(CPT.x0 - 0.25, -PUP.y0, X_PERS, -PMR.y0, { y1: PMR.h });
  C.ajouterBoite(PUP.x0 - 0.05, -(PUP.y1 + 0.05), X_PERS, -PUP.y0, { y1: PUP.h });
  // SUR LA TABLETTE PMR, côté personnel : l'écran noir (vu de dos par les visiteurs), l'unité centrale, le range-documents
  // violet contre le pupitre (VO q_0380)
  ecran(ch, 16.95, 2.68, PMR.h, 'E', true);
  B(16.98, 2.47, 17.14, 2.55, PMR.h, PMR.h + 0.4, M.noir);
  B(16.6, 2.72, 16.84, 2.93, PMR.h, PMR.h + 0.3, H.violet);
  // sur le plan de travail : l'écran de l'hôtesse, celui du pupitre, le téléphone ; sur le comptoir : des brochures
  ecran(ch, 17.42, 1.85, 0.75, 'E', true);
  ecran(ch, 17.6, 3.25, 0.75, 'E', true);
  B(17.3, 1.25, 17.5, 1.45, 0.75, 0.81, M.noir);
  B(16.6, 1.35, 16.88, 1.57, CPT.h, CPT.h + 0.012, M.store, { ombre: false });
  // la petite boîte blanche sur le dessus du pupitre, vers son bout est (VO 92,6 et 93,6 s)
  B(17.08, 3.22, 17.3, 3.42, PUP.h, PUP.h + 0.15, M.radiateur);

  // =====================================================================
  //  L'OPEN-SPACE DU PERSONNEL (VO q_0373-0384)
  // =====================================================================
  // LES BUREAUX BLEU-GRIS FONCÉ en L : le long des fenêtres (sous l'allège de 0,95) et le long du mitoyen ; plateau de
  // 3 cm, voile de fond, piètement sombre, un caisson à tiroirs sous chacun
  const bureau = (x0, y0, x1, y1, voile) => {
    B(x0, y0, x1, y1, 0.72, 0.75, H.bureau);
    const [vx0, vy0, vx1, vy1] = voile;
    B(vx0, vy0, vx1, vy1, 0.3, 0.72, H.bureau, { ombre: false });
  };
  bureau(17.85, 0.05, 19.78, 0.75, [17.85, 0.06, 19.78, 0.09]);
  bureau(19.06, 0.75, 19.78, 4.6, [19.74, 0.75, 19.77, 4.6]);
  for (const [x, y] of [[17.88, 0.72], [19.09, 4.57]]) B(x - 0.03, y - 0.03, x + 0.03, y + 0.03, 0, 0.72, H.pied, { ombre: false });
  for (const [x0, y0, x1, y1] of [[18.55, 0.1, 18.97, 0.62], [19.2, 2.0, 19.74, 2.42]]) {
    B(x0, y0, x1, y1, 0, 0.6, H.bureau);
    for (const h of [0.2, 0.4]) B(x0, y1, x1, y1 + 0.004, h - 0.006, h + 0.006, H.pied, { ombre: false });
  }
  C.ajouterBoite(17.85, -0.75, 19.8, 0, { y1: 0.75 });
  C.ajouterBoite(19.06, -4.6, 19.8, -0.75, { y1: 0.75 });
  // l'armoire basse au bout nord, l'imprimante et le carton dessus (VO q_0380)
  B(19.32, 4.7, 19.78, 5.95, 0, 0.95, H.bureau);
  B(19.36, 4.8, 19.74, 5.25, 0.95, 1.22, M.store);
  B(19.36, 4.84, 19.72, 5.2, 1.22, 1.235, M.noir, { ombre: false });
  B(19.38, 5.35, 19.76, 5.85, 0.95, 1.2, H.carton);
  C.ajouterBoite(19.32, -5.95, 19.8, -4.7, { y1: 1.25 });
  // les écrans, les dossiers, le pot blanc « iris »
  // (de part et d'autre du trumeau et de son affiche bleue, js/ecole_mobilier.js)
  ecran(ch, 18.75, 0.28, 0.75, 'N', true); ecran(ch, 19.4, 0.28, 0.75, 'N');
  ecran(ch, 19.5, 3.75, 0.75, 'W', true);
  ['#1d1d20', '#f0efea', '#5a6070', '#1d1d20', '#2f5f9a'].forEach((c, i) => {
    const m = new THREE.MeshStandardMaterial({ color: c, roughness: 0.5 });
    B(17.95 + i * 0.065, 0.12, 18.01 + i * 0.065, 0.42, 0.75, 1.07, m);
  });
  const pot = maille(new THREE.CylinderGeometry(0.09, 0.085, 0.26, 20), new THREE.MeshStandardMaterial({ map: texPotIris(), roughness: 0.4 }), 19.6, 0.88, -0.4, 0, ch.decor);
  void pot;
  // LES FAUTEUILS NOIRS : l'hôtesse face au comptoir, le bureau des fenêtres, le bureau du mitoyen ; derrière le pupitre,
  // celui au coussin rayé ; le manteau moutarde sur le dossier de l'un d'eux (photo 03)
  fauteuil(ch, 18.0, 1.85, 'W', { sx: 18.65, sy: 1.85, nom: 'le fauteuil de l\'accueil' });
  const f2 = fauteuil(ch, 18.4, 1.2, 'S', { sx: 18.4, sy: 1.85, nom: 'le fauteuil' });
  fauteuil(ch, 18.6, 3.75, 'E', { sx: 18.05, sy: 3.95, nom: 'le fauteuil' });
  fauteuil(ch, 18.0, 3.2, 'W', { zebre: true, sx: 18.2, sy: 2.6, nom: 'le fauteuil' });
  BL(f2, new THREE.MeshStandardMaterial({ color: 0xc9a227, roughness: 0.9 }), 0.48, 0.5, 0.07, 0, 0.82, -0.27);

  // =====================================================================
  //  L'ANGLE NORD-EST, OUVERT (VO 6,4-7,4 s ; hall_work/c_66_info, c_72_coin)
  // =====================================================================
  // LE PHOTOCOPIEUR multifonction contre le pan cannelé, côté hall : socle à tiroirs, corps, sortie, scanner et chargeur
  {
    const g = groupe(ch, 16.68, 7.12, 'S');
    BL(g, H.copieur, 0.64, 0.56, 0.66, 0, 0.3, 0);
    for (const h of [0.14, 0.27, 0.4, 0.53]) BL(g, H.copieur2, 0.6, 0.01, 0.005, 0, h, 0.332, { ombre: false });
    BL(g, M.noir, 0.64, 0.06, 0.66, 0, 0.03, 0, { ombre: false });
    BL(g, H.copieur, 0.64, 0.34, 0.62, 0, 0.75, -0.02);
    BL(g, H.copieur2, 0.5, 0.04, 0.5, 0.02, 0.94, 0.0, { ombre: false });
    BL(g, H.copieur, 0.66, 0.1, 0.62, 0, 1.01, -0.02);
    BL(g, H.copieur2, 0.6, 0.06, 0.5, 0, 1.09, -0.04);
    BL(g, M.noir, 0.16, 0.05, 0.08, 0.2, 1.02, 0.3, { ombre: false });             // (le pupitre de commande)
    BL(g, H.copieur2, 0.06, 0.3, 0.4, -0.35, 0.72, 0.0);                          // (le bac manuel, à l'ouest)
    C.ajouterBoite(16.33, -7.45, 17.02, -6.77, { y1: 1.15 });
  }
  // LE CAISSON gris clair et sa pile de cinq corbeilles à courrier (celle du haut orange)
  B(17.04, 6.9, 17.46, 7.46, 0, 1.0, H.caisson);
  for (let k = 0; k < 5; k++) {
    const h = 1.0 + k * 0.065, m = k === 4 ? H.corbeilleO : H.corbeille;
    B(17.06, 6.95, 17.42, 7.4, h, h + 0.008, m, { ombre: false });
    B(17.06, 6.95, 17.42, 6.965, h, h + 0.05, m, { ombre: false });
    for (const x of [17.06, 17.41]) B(x, 6.95, x + 0.01, 7.4, h, h + 0.05, m, { ombre: false });
    B(17.09, 6.98, 17.39, 7.37, h + 0.008, h + 0.02, M.store, { ombre: false });
  }
  C.ajouterBoite(17.04, -7.46, 17.46, -6.9, { y1: 1.35 });
  // LA TABLE BLANCHE sous les étiquettes (1,2 x 0,6 m), l'objet noir et le gobelet dessus ; LA CHAISE DE HÊTRE devant
  B(17.55, 6.88, 18.75, 7.47, 0.72, 0.75, H.tableB);
  for (const x of [17.58, 18.72]) for (const y of [6.91, 7.44]) B(x - 0.02, y - 0.02, x + 0.02, y + 0.02, 0, 0.72, M.alu, { ombre: false });
  B(17.85, 7.15, 18.05, 7.3, 0.75, 0.8, M.noir);
  maille(new THREE.CylinderGeometry(0.035, 0.03, 0.1, 14), M.radiateur, 18.42, 0.8, -7.28, 0, ch.decor);
  C.ajouterBoite(17.55, -7.47, 18.75, -6.88, { y1: 0.75 });
  chaiseHetre(ch, 18.15, 6.55, 'N', 18.15, 5.95);
  // LES ÉTIQUETTES OCRE sur le mur blanc (VO q_0027-0028, mesurées contre le semi-fixe de la porte nord : la grande de x
  // 17,54 à 18,38, de 1,98 à 2,36 m ; la petite de 17,76 à 18,16, de 1,50 à 1,88 m)
  ch.panneau(new THREE.MeshStandardMaterial({ map: texEtiquette('INFORMATIQUE', 0.84, 0.38), roughness: 0.6 }), 0.84, 0.38, 17.96, Y_MUR - 0.004, 2.17, 'S');
  // (le mot de la petite ne se lit pas : sept lettres environ — IMAGINÉ)
  ch.panneau(new THREE.MeshStandardMaterial({ map: texEtiquette('SERVICE', 0.4, 0.38), roughness: 0.6 }), 0.4, 0.38, 17.96, Y_MUR - 0.004, 1.69, 'S');
  // LE PRÉSENTOIR DE BOIS (≈ 0,5 x 1,5 m, quatre tablettes inclinées, les brochures blanches « iris ») au nord du
  // pupitre, tourné vers l'ouest (VO 6,4-7,4 s au bord droit, à ≈ 30° ; 92,6 s au bord gauche)
  {
    const g = groupe(ch, 17.2, 4.9, 'W'), br = new THREE.MeshStandardMaterial({ map: texBrochures(), roughness: 0.6 });
    for (const s of [-1, 1]) BL(g, H.boisPres, 0.02, 1.5, 0.34, s * 0.25, 0.75, 0);
    BL(g, H.boisPres, 0.5, 1.5, 0.015, 0, 0.75, -0.165);
    BL(g, H.boisPres, 0.52, 0.02, 0.36, 0, 1.5, 0);
    for (let i = 0; i < 4; i++) {
      const h = 0.3 + i * 0.33, t = BL(g, H.boisPres, 0.48, 0.015, 0.26, 0, h, 0.03); t.rotation.x = -0.32;
      BL(g, H.boisPres, 0.48, 0.05, 0.012, 0, h + 0.02, 0.16, { ombre: false });
      const b = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.22), br); b.position.set(0, h + 0.12, 0.06); b.rotation.x = -0.32; g.add(b);
    }
    C.ajouterBoite(17.02, -5.15, 17.38, -4.65, { y1: 1.5 });
  }

  // =====================================================================
  //  LE PLAFOND : LES HUIT LIGNES LUMINEUSES NORD-SUD (VO 92,6-93,6 s ; hall_work/c_926_plafond, g_93_plafond)
  // =====================================================================
  // dans l'axe de la porte 6, au pas de 0,30 m, de la porte jusqu'à y ≈ 4,1 (les spots ronds autour : js/carte_ecole.js) ;
  // un ruban de 2 cm dans un profil d'aluminium de 4 cm, à fleur du plâtre
  for (let k = 0; k < 8; k++) {
    const x = 14.35 + k * 0.3;
    const p = B(x - 0.02, 0.5, x + 0.02, 4.1, H_PLAF - 0.006, H_PLAF - 0.001, H.profil, { ombre: false });
    const l = B(x - 0.01, 0.52, x + 0.01, 4.08, H_PLAF - 0.008, H_PLAF - 0.006, H.ligne, { ombre: false });
    p.userData.horsAOSol = l.userData.horsAOSol = true; l.receiveShadow = false;
  }
}
