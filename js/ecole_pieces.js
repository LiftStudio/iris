// =====================================================================
//  LES PIÈCES FERMÉES DU REZ-DE-CHAUSSÉE (crochet de js/carte_ecole.js)
// =====================================================================
// Les pièces que Haythem n'a pas (encore) photographiées, derrière les portes qui restaient fermées : leurs portes
// s'ouvrent maintenant toutes seules (js/ecole_portes.js, état 'auto') et l'on peut y entrer. Leur intérieur est
// IMAGINÉ — plausible pour une école de commerce et du numérique parisienne — EN ATTENDANT DES PHOTOS : quand elles
// arriveront, c'est ce module qu'on reprend (la coque, elle, reste celle de js/carte_ecole.js).
//
//   LA SALLE A (informatique)  x 4,9-9,9    y 0-8,925  trois rangées de cinq postes tournés vers le nord (écrans,
//        claviers, unités centrales, chaises de bureau où l'on s'assoit), le bureau de l'enseignant, la toile de
//        projection descendue devant les jours dépolis et son vidéoprojecteur, le tableau blanc du mur est, les stores
//        enrouleurs des trois fenêtres sur rue, six dalles LED dans le plafond à plateaux, l'imprimante, l'horloge
//   LE BUREAU B                x 10,05-13,2 y 0-4,74   bureau de chêne clair, fauteuil, deux chaises visiteurs (on s'y
//        assoit), armoire, bibliothèque, tableau, grande plante, tapis, porte-manteau
//   LE COULOIR DE SERVICE      x 0-1,6      y 0-13,6   derrière la porte grise du hall ouest et la porte blanche du
//        passage : il mène à la porte de secours de la façade (barre anti-panique) ; bacs roulants, chariot de ménage,
//        escabeau, cartons, extincteur, goulotte
//   LE LOCAL TECHNIQUE         x 5,95-11,55 y 12,15-15,9 (porte « local » du couloir C01) baies serveurs aux diodes qui
//        clignotent, onduleur, tableau électrique, étagères, photocopieur, établi, climatiseur, chemins de câbles ; pas
//        de faux plafond (la dalle brute à 3,25 m) et des réglettes LED suspendues
//   LES TOILETTES              x 5,95-11,55 y 16,05-20,6 (porte « toilettes » du C01) faïence blanche, sol de grès
//        30 x 30, trois cabines aux portes safran (le safran de la salle d'attente) et une cabine PMR ouverte, plan de
//        vasques et grand miroir rétroéclairé, sèche-mains
//
// CE QUE LE MODULE REÇOIT : le chantier `ch` de js/carte_ecole.js (coordonnées du PLAN : x le long de la façade, y vers
// le fond ; dans le jeu X = x, Z = -y) — ch.mur, ch.porte, ch.plafond, ch.boite, ch.spot, ch.opale, ch.sortie, ch.C (le
// monde solide), ch.M (les matières), ch.lampes, ch.sieges. CE QU'IL REND : { zones } — les zones de lumière des cinq
// pièces (js/ecole_lumieres.js : spots qui suivent Haythem, carte d'environnement reprise dans chaque pièce), que la
// carte ajoute aux siennes.
//
// MÊMES MATIÈRES ET MÊME LUMIÈRE que le reste : la peinture blanche, les plinthes de bois verni, le carrelage
// anthracite, les plafonds à plateaux ou de plâtre ; chaque luminaire est une LAMPE de sa pièce (spots réels et lumière
// cuite au sol) ; chaque pièce a sa zone, sans voisines (une porte n'est pas une ouverture : un spot de la pièce d'à
// côté éclairerait à travers le mur). Tout est dessiné en code : aucune ressource ajoutée.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { TELEPHONE } from './appareil.js';
import { maille, boiteM } from './ecole_portes.js';
import { canvasTex, normalesDepuisGrille, avecRelief, nePasFusionner } from './kit_decor.js';
import { texAffiche, texConsignes, texPictoExtincteur } from './ecole_matieres.js';

const H_DALLE = 3.25;                       // le dessous de la dalle du 1er étage
// ---- les pièces, en plan (le nu intérieur des murs) ----
const SA = { x0: 4.9, x1: 9.9, y0: 0, y1: 8.925 };          // la salle A
const BB = { x0: 10.05, x1: 13.2, y0: 0, y1: 4.74 };        // le bureau B
const SV = { x0: 0, x1: 1.6, y0: 0, y1: 13.6 };             // le couloir de service
const LT = { x0: 5.95, x1: 11.55, y0: 12.15, y1: 15.9 };    // le local technique
const WC = { x0: 5.95, x1: 11.55, y0: 16.05, y1: 20.6 };    // les toilettes

// LES ZONES DE LUMIÈRE (js/ecole_lumieres.js) : rectangles en MONDE [x0, z0, x1, z1, hauteur mini], le point de prise de
// vue de la carte d'environnement (au-dessus des meubles, au milieu de la pièce)
const zone = (id, R, env) => ({ id, rects: [[R.x0, -R.y1, R.x1, -R.y0, -1]], voisines: [], env });
const ZONES = [
  zone('salleA', SA, { x: 7.4, y: 1.6, z: -4.0 }),
  zone('bureauB', BB, { x: 11.7, y: 1.55, z: -3.0 }),
  zone('service', SV, { x: 0.8, y: 1.5, z: -6.8 }),
  zone('local', LT, { x: 8.4, y: 1.7, z: -13.9 }),
  zone('wc', WC, { x: 8.8, y: 1.5, z: -17.9 }),
];

// =====================================================================
//  PETITS OUTILS
// =====================================================================
const ROT = { S: 0, N: Math.PI, E: Math.PI / 2, W: -Math.PI / 2 };
// la direction d'une face, en MONDE (fx, fz) : ce que regarde quelqu'un assis tourné vers elle
const DIR = { S: [0, 1], N: [0, -1], E: [1, 0], W: [-1, 0] };
// un générateur pseudo-aléatoire À GRAINE (le même décor à chaque chargement)
function graine(s) {
  let x = s >>> 0 || 1;
  return () => { x ^= x << 13; x >>>= 0; x ^= x >> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; };
}
// UN GROUPE posé au point (x, y) du plan, à la hauteur h, son +z local tourné vers `face` : les meubles sont dessinés
// « de face » (+z = vers celui qui s'en sert) puis tournés
function groupe(ch, x, y, face = 'S', h = 0) {
  const g = new THREE.Group(); g.position.set(x, h, -y); g.rotation.y = ROT[face];
  ch.decor.add(g);
  return g;
}
// une boîte (centre local x, y, z ; largeur w en x, hauteur h, profondeur d en z), une boîte aux arêtes arrondies, un
// cylindre, un plan
const B = (g, mat, w, h, d, x, y, z, o) => maille(boiteM(w, h, d), mat, x, y, z, 0, g, o);
const _ronds = new Map();
function geoRonde(w, h, d, r) {
  const k = [w, h, d, r].map((v) => v.toFixed(3)).join('/');
  if (!_ronds.has(k)) _ronds.set(k, new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2, h / 2, d / 2) * 0.999));
  return _ronds.get(k);
}
const R = (g, mat, w, h, d, r, x, y, z, o) => maille(geoRonde(w, h, d, r), mat, x, y, z, 0, g, o);
// LE DOSSIER GALBÉ d'une chaise de bureau : une boîte arrondie dont les bords viennent envelopper le dos (+z)
let _dossier = null;
function geoDossier() {
  if (_dossier) return _dossier;
  const g = new RoundedBoxGeometry(0.43, 0.45, 0.06, 3, 0.028), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const u = p.getX(i) / 0.215, v = p.getY(i) / 0.225; p.setZ(i, p.getZ(i) + 0.05 * u * u - 0.015 * v * v); }
  g.computeVertexNormals();
  return (_dossier = g);
}
// UN VÊTEMENT pendu (patère, porte-manteau) par sa bride de col ; `y` le crochet. La silhouette d'une veste vue de face
// (encolure, épaules tombantes, corps qui s'évase un peu jusqu'à l'ourlet), extrudée avec un biseau épais : un tissu
// rembourré, pas une planche. Les manches pendent le long du corps, un peu devant ; la capuche retombe dans le dos ; la
// fermeture éclair et les poches passepoilées, d'un ton plus sombre. Le bas penche vers le mur (ou le mât) : une veste
// accrochée s'y appuie. (L'ancienne version, un cône aplati, se lisait comme un abat-jour bleu.)
const _vestes = new Map();
function geoVeste(haut) {
  const k = haut.toFixed(3);
  if (_vestes.has(k)) return _vestes.get(k);
  const s = new THREE.Shape(), h = -haut;
  s.moveTo(-0.065, -0.035);
  s.quadraticCurveTo(-0.15, -0.045, -0.185, -0.085);              // l'épaule gauche, tombante
  s.lineTo(-0.2, -0.15); s.lineTo(-0.205, h * 0.55); s.quadraticCurveTo(-0.215, h * 0.85, -0.225, h);
  s.lineTo(0.225, h);
  s.quadraticCurveTo(0.215, h * 0.85, 0.205, h * 0.55); s.lineTo(0.2, -0.15); s.lineTo(0.185, -0.085);
  s.quadraticCurveTo(0.15, -0.045, 0.065, -0.035);
  s.quadraticCurveTo(0, -0.09, -0.065, -0.035);                   // l'encolure
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.045, bevelEnabled: true, bevelThickness: 0.028, bevelSize: 0.022, bevelSegments: 3, curveSegments: 8 });
  geo.translate(0, 0, -0.0225);
  geo.computeVertexNormals();
  _vestes.set(k, geo);
  return geo;
}
function vetement(g, mat, x, y, z, { haut = 0.8, rot = 0, capuche = true } = {}) {
  const v = new THREE.Group(); v.position.set(x, y, z); v.rotation.y = rot; v.rotation.x = 0.05; g.add(v);
  maille(geoVeste(haut), mat, 0, 0, 0, 0, v);
  // les manches (un peu plus courtes que le corps, légèrement écartées au coude)
  const lm = haut * 0.78;
  for (const sx of [-1, 1]) {
    const m = R(v, mat, 0.1, lm, 0.095, 0.04, sx * 0.205, -0.1 - lm / 2, 0.035);
    m.rotation.z = sx * 0.05;
  }
  // la capuche qui retombe dans le dos, la bride de col sur le crochet
  if (capuche) { const c = maille(new THREE.SphereGeometry(0.12, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat, 0, -0.07, -0.045, 0, v); c.rotation.x = Math.PI; c.scale.set(1, 0.85, 0.42); }
  const col = maille(new THREE.TorusGeometry(0.05, 0.016, 6, 16), mat, 0, -0.04, 0.0, 0, v, { ombre: false }); col.rotation.x = Math.PI / 2; col.scale.y = 0.55;
  // la fermeture éclair et deux poches passepoilées
  const sombre = mat.__sombre || (mat.__sombre = new THREE.MeshStandardMaterial({ color: mat.color.clone().multiplyScalar(0.45), roughness: 0.7 }));
  B(v, sombre, 0.008, haut - 0.08, 0.004, 0, -0.04 - (haut - 0.08) / 2, 0.0515, { ombre: false });
  for (const sx of [-1, 1]) { const p = B(v, sombre, 0.11, 0.008, 0.004, sx * 0.11, -haut * 0.68, 0.0518, { ombre: false }); p.rotation.z = -sx * 0.35; }
  return v;
}
const CY = (g, mat, r, h, x, y, z, seg = 12, o) => maille(new THREE.CylinderGeometry(r, r, h, seg), mat, x, y, z, 0, g, o);
function plan(g, mat, w, h, x, y, z, rotY = 0) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  m.position.set(x, y, z); m.rotation.y = rotY; m.castShadow = false; m.receiveShadow = true;
  g.add(m);
  return m;
}
// UNE PLINTHE de bois verni (8 cm) au pied d'une face de mur : axe 'x' = mur est-ouest à y = `ligne`, 'y' = mur nord-sud
// à x = `ligne` ; de a0 à a1 le long du mur ; `s` = +1 si la pièce est du côté +y (ou +x)
function plinthe(ch, axe, ligne, a0, a1, s) {
  const v0 = ligne, v1 = ligne + s * 0.015;
  if (axe === 'x') ch.boite(a0, Math.min(v0, v1), a1, Math.max(v0, v1), 0, 0.08, ch.M.bois, { ombre: false });
  else ch.boite(Math.min(v0, v1), a0, Math.max(v0, v1), a1, 0, 0.08, ch.M.bois, { ombre: false });
}
// UN SIÈGE (js/game.js : on s'y assoit) : le point d'assise en plan, sa hauteur, la face qu'on regarde assis, et le
// point où l'on se relève (décalage en plan : par défaut derrière le siège — devant, c'est la table)
function siege(ch, x, y, h, face, nom, sortie = null) {
  const [fx, fz] = DIR[face];
  const [dx, dy] = sortie || [-fx * 0.6, fz * 0.6];
  ch.sieges.push({ x, z: -y, y: h, fx, fz, sx: x + dx, sz: -(y + dy), nom });
}

// =====================================================================
//  LES MATIÈRES DES PIÈCES (reprises de js/ecole_matieres.js quand elles existent)
// =====================================================================
function matieres(M) {
  const std = (o) => new THREE.MeshStandardMaterial(o);
  const P = {
    strat: std({ color: 0xf1f0eb, roughness: 0.36 }),                         // stratifié blanc des tables
    voile: std({ color: 0xe4e4e0, roughness: 0.5, metalness: 0.3 }),            // voile de fond en tôle laquée
    metal: std({ color: 0x5c6065, roughness: 0.38, metalness: 0.65 }),          // piètements
    plastique: std({ color: 0x1b1c1f, roughness: 0.45 }),                       // écrans, claviers, piètements de chaise
    plastiqueGris: std({ color: 0x3a3c41, roughness: 0.5 }),
    chrome: std({ color: 0xd4d7da, roughness: 0.16, metalness: 0.78 }),     // (pas tout à fait 1 : sans carte d'environnement, il resterait noir)
    // le chrome poli des robinets : un rien bleuté, parce qu'il ne fait que renvoyer la faïence et les portes safran
    // chaudes des toilettes (avec le chrome ordinaire, ils sortaient couleur bois) ; métal à 0,7 seulement : sans carte
    // d'environnement (téléphone), il garde un fond gris clair au lieu de sortir noir
    robinet: std({ color: 0xd0d8e0, roughness: 0.12, metalness: 0.7 }),
    tissu: std({ color: 0x2b2e33, roughness: 0.95 }),                           // chaises de bureau
    tissuBleu: std({ color: 0x2c3e57, roughness: 0.95 }),
    blancMat: std({ color: 0xf2f1ec, roughness: 0.55 }),
    grisClair: std({ color: 0xd8d8d3, roughness: 0.5 }),                        // armoires, photocopieur (RAL 7035)
    chene: std({ color: 0xc19a6b, roughness: 0.5 }),                            // plateau du bureau B
    safranHPL: std({ color: 0xe8a320, roughness: 0.32 }),                       // portes des cabines (le safran de l'attente)
    grisHPL: std({ color: 0x8b8d8f, roughness: 0.4 }),                          // cloisons des cabines
    quartz: std({ color: 0x35363a, roughness: 0.28 }),                          // plan des vasques
    ceramique: std({ color: 0xf6f6f3, roughness: 0.12 }),
    miroir: std({ color: 0xffffff, roughness: 0.03, metalness: 1 }),
    tableauBlanc: std({ map: texTableauBlanc(), roughness: 0.14 }),
    pot: std({ color: 0xe9e6df, roughness: 0.7 }),
    terre: std({ color: 0x3b2a1e, roughness: 1 }),
    tronc: std({ color: 0x5a4632, roughness: 0.9 }),
    feuille: std({ map: texFeuille(), alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.55 }),
    carton: std({ map: texCarton(), roughness: 0.9 }),
    jaune: std({ color: 0xf2b705, roughness: 0.5 }),
    vert: std({ color: 0x2f6b3a, roughness: 0.55 }),
    bleu: std({ color: 0x2462a8, roughness: 0.5 }),
    rouge: M.rougeEtiquette,
    alu: M.alu, inox: M.inox, noir: M.noir, noirMat: M.noirMat, blanc: M.blanc,
  };
  // LES ÉCRANS (allumés : ils éclairent un peu, le bloom les fait tout juste briller)
  P.ecrans = [0, 1, 2, 3, 4].map((k) => new THREE.MeshBasicMaterial({ map: texEcranPC(k), color: new THREE.Color(1.05, 1.05, 1.05) }));
  // la toile de projection (l'image projetée) et la dalle LED (blanc neutre, 4000 K, assez fort pour le bloom)
  P.diapo = new THREE.MeshBasicMaterial({ map: texDiapo(), color: new THREE.Color(1.12, 1.12, 1.12) });
  P.dalle = new THREE.MeshBasicMaterial({ map: texDalleLED(), color: new THREE.Color(2.3, 2.25, 2.15) });
  P.led = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.6, 2.5, 2.35) });
  // le store enrouleur (toile « screen » grise) : le jour la traverse, d'où un peu d'émissif bleuté
  P.store = std({ map: texToile(), roughness: 0.95, emissive: 0xd9e2ea, emissiveIntensity: 0.28, side: THREE.DoubleSide });
  return P;
}

// =====================================================================
//  LES TEXTURES DESSINÉES
// =====================================================================
// LES ÉCRANS DES POSTES : cinq sortes, prêtées tour à tour — le bureau aux couleurs d'iris, un éditeur de code, un
// tableur et son graphique, une maquette de site, un logiciel de présentation
function texEcranPC(k) {
  return canvasTex(256, 144, (g, w, h) => {
    const r = graine(97 + k * 31);
    const barre = (fond) => {
      g.fillStyle = fond; g.fillRect(0, h - 11, w, 11);
      for (let i = 0; i < 6; i++) { g.fillStyle = ['#f2b705', '#4c8ee8', '#3e9b6b', '#e04e3a', '#c9c9c9', '#7b5cd6'][i]; g.fillRect(98 + i * 11, h - 9, 7, 7); }
      g.fillStyle = '#d9d9d9'; g.fillRect(w - 26, h - 8, 20, 4);
    };
    if (k === 0) {
      const d = g.createLinearGradient(0, 0, w, h); d.addColorStop(0, '#1c3768'); d.addColorStop(0.55, '#3b2a6b'); d.addColorStop(1, '#7a2a68');
      g.fillStyle = d; g.fillRect(0, 0, w, h);
      for (const [c, rr] of [['#7b2a6e', 96], ['#d6337a', 82], ['#f08a3c', 68], ['#d6337a', 54]]) { g.strokeStyle = c; g.lineWidth = 10; g.beginPath(); g.arc(w - 6, h - 11, rr, Math.PI, Math.PI * 1.5); g.stroke(); }
      g.fillStyle = '#ffffff'; g.font = '600 40px "Century Gothic", "Avenir", "Segoe UI", sans-serif'; g.textBaseline = 'alphabetic';
      g.fillText('iris', 34, 80); g.fillStyle = '#f08a24'; g.fillRect(36, 47, 7, 5);
      g.font = '500 10px "Segoe UI", sans-serif'; g.fillStyle = '#d7def0'; g.fillText('Connectez-vous aux métiers de demain', 35, 96);
      for (let i = 0; i < 4; i++) { g.fillStyle = ['#f2c14e', '#e8e8e8', '#7fb2f0', '#9ad0a0'][i]; g.fillRect(8, 8 + i * 24, 15, 12); g.fillStyle = 'rgba(255,255,255,0.6)'; g.fillRect(6, 23 + i * 24, 19, 2); }
      barre('rgba(14,16,26,0.92)');
    } else if (k === 1) {
      g.fillStyle = '#1f2027'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#17181d'; g.fillRect(0, 0, 50, h);
      g.fillStyle = '#2b2d36'; g.fillRect(0, 0, w, 10); g.fillStyle = '#1f2027'; g.fillRect(52, 2, 44, 8);
      for (let i = 0; i < 10; i++) { g.fillStyle = i === 3 ? '#8fb3ff' : '#5d616d'; g.fillRect(7 + (i % 3 === 2 ? 6 : 0), 16 + i * 10, 18 + ((i * 7) % 16), 3); }
      const cols = ['#c678dd', '#61afef', '#98c379', '#e5c07b', '#e06c75', '#abb2bf', '#56b6c2'];
      for (let l = 0; l < 13; l++) {
        g.fillStyle = '#4b4f5a'; g.fillRect(55, 15 + l * 9, 6, 3);
        let x = 68 + ((l % 5) ? (1 + (l % 3)) * 7 : 0);
        const n = 1 + Math.floor(r() * 4);
        for (let t = 0; t < n; t++) { const L = 8 + r() * 34; g.fillStyle = cols[Math.floor(r() * cols.length)]; g.fillRect(x, 15 + l * 9, L, 3.5); x += L + 4; }
      }
      g.fillStyle = '#e5e5e5'; g.fillRect(118, 15 + 6 * 9, 1.5, 5);       // le curseur
      barre('#101116');
    } else if (k === 2) {
      g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#1f7244'; g.fillRect(0, 0, w, 12); g.fillStyle = '#f1f1f1'; g.fillRect(0, 12, w, 10);
      g.strokeStyle = '#dadada'; g.lineWidth = 1;
      for (let x = 14; x < w; x += 26) { g.beginPath(); g.moveTo(x + 0.5, 22); g.lineTo(x + 0.5, h - 11); g.stroke(); }
      for (let y = 22; y < h - 11; y += 9) { g.beginPath(); g.moveTo(0, y + 0.5); g.lineTo(w, y + 0.5); g.stroke(); }
      g.fillStyle = '#dbe9f6'; g.fillRect(15, 23, 129, 8);
      for (let j = 0; j < 9; j++) for (let i = 0; i < 5; i++) { g.fillStyle = '#6a6a6a'; g.fillRect(18 + i * 26 + r() * 6, 34 + j * 9, 8 + r() * 10, 3); }
      // le graphique en barres
      g.fillStyle = '#ffffff'; g.fillRect(150, 30, 98, 82); g.strokeStyle = '#c8c8c8'; g.strokeRect(150.5, 30.5, 97, 81);
      const bars = [0.4, 0.55, 0.5, 0.72, 0.66, 0.9];
      bars.forEach((v, i) => { g.fillStyle = i % 2 ? '#e9a01c' : '#2f6fb0'; g.fillRect(158 + i * 14, 104 - v * 64, 9, v * 64); });
      barre('#e9e9e9');
    } else if (k === 3) {
      g.fillStyle = '#f6f4ef'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#26262b'; g.fillRect(0, 0, w, 14);
      for (let i = 0; i < 4; i++) { g.fillStyle = '#bdbdc4'; g.fillRect(150 + i * 24, 5, 16, 3); }
      g.fillStyle = '#ffffff'; g.font = '600 9px "Century Gothic", "Segoe UI", sans-serif'; g.fillText('iris', 8, 10);
      const d = g.createLinearGradient(0, 14, w, 70); d.addColorStop(0, '#e9a01c'); d.addColorStop(1, '#d6337a');
      g.fillStyle = d; g.fillRect(0, 14, w, 60);
      g.fillStyle = '#ffffff'; g.fillRect(16, 30, 110, 9); g.fillRect(16, 44, 80, 5); g.fillRect(16, 56, 40, 10);
      for (let i = 0; i < 3; i++) { g.fillStyle = '#ffffff'; g.fillRect(12 + i * 81, 82, 72, 48); g.fillStyle = ['#7b5cd6', '#2f6fb0', '#3e9b6b'][i]; g.fillRect(12 + i * 81, 82, 72, 22); g.fillStyle = '#9a9aa2'; g.fillRect(18 + i * 81, 110, 50, 3); g.fillRect(18 + i * 81, 117, 36, 3); }
      barre('rgba(20,20,24,0.9)');
    } else {
      g.fillStyle = '#e8e6e3'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#c4462b'; g.fillRect(0, 0, w, 12);
      g.fillStyle = '#f7f6f4'; g.fillRect(0, 12, 42, h - 23);
      for (let i = 0; i < 4; i++) { g.fillStyle = '#ffffff'; g.fillRect(6, 18 + i * 28, 30, 18); g.fillStyle = '#e9a01c'; g.fillRect(6, 18 + i * 28, 4, 18); }
      g.fillStyle = '#ffffff'; g.fillRect(54, 20, 192, 108);
      g.fillStyle = '#e9a01c'; g.fillRect(54, 20, 8, 108);
      g.fillStyle = '#1b1b1b'; g.fillRect(72, 32, 110, 9); g.fillStyle = '#8a8a8a'; g.fillRect(72, 46, 70, 4);
      ['#7b2a6e', '#d6337a', '#f08a3c', '#e9a01c'].forEach((c, i) => { g.fillStyle = c; g.fillRect(80 + i * 6, 60 + i * 15, 70 - i * 12, 12); });
      for (let i = 0; i < 4; i++) { g.fillStyle = '#b0b0b0'; g.fillRect(176, 62 + i * 12, 56, 3); }
      barre('#d4d2cf');
    }
  }, null, false, 4);
}
// L'IMAGE PROJETÉE (la toile de la salle A) : bordure noire de la toile, une diapositive de cours aux couleurs de
// l'école — le titre, l'entonnoir du parcours client, des puces
function texDiapo() {
  return canvasTex(640, 392, (g, w, h) => {
    g.fillStyle = '#121212'; g.fillRect(0, 0, w, h);
    const m = 14, W = w - 2 * m, H = h - 2 * m;
    g.fillStyle = '#fbfaf6'; g.fillRect(m, m, W, H);
    // le léger vignetage du projecteur (le centre est plus clair)
    const v = g.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w * 0.62);
    v.addColorStop(0, 'rgba(255,255,255,0)'); v.addColorStop(1, 'rgba(120,110,100,0.18)');
    g.fillStyle = v; g.fillRect(m, m, W, H);
    g.fillStyle = '#e9a01c'; g.fillRect(m, m, 16, H);
    g.fillStyle = '#1b1b1b'; g.font = '700 34px "Segoe UI", Arial, sans-serif'; g.textBaseline = 'alphabetic';
    g.fillText('Le parcours client', m + 40, m + 56);
    g.fillStyle = '#7a7a7a'; g.font = '500 17px "Segoe UI", Arial, sans-serif';
    g.fillText('Marketing digital · séance 4', m + 40, m + 84);
    g.fillStyle = '#111111'; g.font = '600 24px "Century Gothic", "Avenir", "Segoe UI", sans-serif'; g.fillText('iris', w - m - 64, m + 44);
    g.fillStyle = '#f08a24'; g.fillRect(w - m - 63, m + 22, 5, 4);
    // l'entonnoir
    const et = [['#7b2a6e', 'Découverte'], ['#b52f74', 'Considération'], ['#e0542f', 'Décision'], ['#e9a01c', 'Fidélisation']];
    et.forEach(([c, t], i) => {
      const y = m + 112 + i * 54, l0 = 300 - i * 46, l1 = 300 - (i + 1) * 46, x = m + 60;
      g.fillStyle = c; g.beginPath(); g.moveTo(x + (300 - l0) / 2, y); g.lineTo(x + (300 + l0) / 2, y); g.lineTo(x + (300 + l1) / 2, y + 48); g.lineTo(x + (300 - l1) / 2, y + 48); g.closePath(); g.fill();
      g.fillStyle = '#ffffff'; g.font = '600 16px "Segoe UI", Arial, sans-serif'; g.textAlign = 'center'; g.fillText(t, x + 150, y + 30); g.textAlign = 'left';
    });
    // les puces
    const pu = ['Attirer : SEO, réseaux sociaux', 'Convaincre : contenus, avis', 'Convertir : tunnel, relance', 'Fidéliser : CRM, newsletter'];
    pu.forEach((t, i) => {
      g.fillStyle = '#e9a01c'; g.beginPath(); g.arc(m + 412, m + 140 + i * 50, 5, 0, 7); g.fill();
      g.fillStyle = '#333333'; g.font = '500 15px "Segoe UI", Arial, sans-serif'; g.fillText(t, m + 426, m + 145 + i * 50);
    });
    g.fillStyle = '#9a9a9a'; g.font = '500 11px "Segoe UI", Arial, sans-serif'; g.fillText('iris — école du numérique et du commerce', m + 40, h - m - 12);
    g.fillText('12', w - m - 30, h - m - 12);
  }, null, false, 8);
}
// LE TABLEAU BLANC : un peu de fantôme d'effaçage, et le cours du jour au feutre (bleu, noir, rouge)
function texTableauBlanc() {
  return canvasTex(512, 384, (g, w, h) => {
    g.fillStyle = '#fbfbf9'; g.fillRect(0, 0, w, h);
    const r = graine(515);
    for (let k = 0; k < 14; k++) { g.fillStyle = `rgba(120,130,150,${0.025 + r() * 0.03})`; g.beginPath(); g.ellipse(r() * w, r() * h, 30 + r() * 80, 8 + r() * 20, r() * 0.4, 0, 7); g.fill(); }
    const main = '"Segoe Print", "Bradley Hand", "Comic Sans MS", cursive';
    g.fillStyle = '#1d4fa3'; g.font = `700 34px ${main}`; g.fillText('AIDA', 34, 58);
    g.strokeStyle = '#1d4fa3'; g.lineWidth = 3; g.beginPath(); g.moveTo(32, 66); g.lineTo(140, 64); g.stroke();
    // l'entonnoir au feutre noir
    g.strokeStyle = '#1e1e1e'; g.lineWidth = 3.5; g.beginPath();
    g.moveTo(40, 96); g.lineTo(300, 96); g.lineTo(212, 330); g.lineTo(128, 330); g.closePath(); g.stroke();
    for (const y of [154, 212, 272]) { const t = (y - 96) / 234, a = 40 + 88 * t, b = 300 - 88 * t; g.beginPath(); g.moveTo(a, y); g.lineTo(b, y); g.stroke(); }
    g.fillStyle = '#1d4fa3'; g.font = `600 22px ${main}`;
    ['Attention', 'Intérêt', 'Désir', 'Action'].forEach((t, i) => g.fillText(t, 120 + i * 6, 132 + i * 59));
    // la flèche rouge et la conversion
    g.strokeStyle = '#c62828'; g.lineWidth = 3.5; g.beginPath(); g.moveTo(225, 310); g.quadraticCurveTo(300, 330, 340, 300); g.stroke();
    g.beginPath(); g.moveTo(340, 300); g.lineTo(326, 300); g.moveTo(340, 300); g.lineTo(336, 314); g.stroke();
    g.fillStyle = '#c62828'; g.font = `700 24px ${main}`; g.fillText('conversion !', 330, 282);
    g.fillStyle = '#1e1e1e'; g.font = `500 18px ${main}`;
    g.fillText('taux = ventes / visites', 330, 120); g.fillText('ex. 120 / 4000 = 3 %', 330, 150);
    g.strokeStyle = '#2e7d32'; g.lineWidth = 2.5; g.strokeRect(322, 96, 176, 66);
  }, null, false, 8);
}
// LA DALLE LED 60 x 120 : le diffuseur opale, un rien plus sombre au bord, le cadre d'aluminium
function texDalleLED() {
  return canvasTex(64, 128, (g, w, h) => {
    g.fillStyle = '#d8d8d6'; g.fillRect(0, 0, w, h);
    const d = g.createRadialGradient(w / 2, h / 2, 6, w / 2, h / 2, h * 0.62);
    d.addColorStop(0, '#ffffff'); d.addColorStop(1, '#e6e6e4');
    g.fillStyle = d; g.fillRect(3, 3, w - 6, h - 6);
  }, null, false, 2);
}
// LA TOILE DU STORE : un tissage fin
function texToile() {
  return canvasTex(64, 64, (g, w, h) => {
    g.fillStyle = '#c9c5bc'; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(80,76,70,0.18)';
    for (let i = 0; i < w; i += 2) { g.fillRect(i, 0, 1, h); g.fillRect(0, i, w, 1); }
  }, [5, 4], false, 4);
}
// L'HORLOGE (10 h 10, comme sur les catalogues)
function texHorloge() {
  return canvasTex(128, 128, (g, w) => {
    const c = w / 2;
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(c, c, 62, 0, 7); g.fill();
    g.strokeStyle = '#1a1a1a'; g.lineWidth = 4; g.beginPath(); g.arc(c, c, 60, 0, 7); g.stroke();
    for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2, L = i % 5 ? 4 : 10; g.lineWidth = i % 5 ? 1.2 : 3; g.beginPath(); g.moveTo(c + Math.sin(a) * 54, c - Math.cos(a) * 54); g.lineTo(c + Math.sin(a) * (54 - L), c - Math.cos(a) * (54 - L)); g.stroke(); }
    const aig = (a, L, ep, coul) => { g.strokeStyle = coul; g.lineWidth = ep; g.lineCap = 'round'; g.beginPath(); g.moveTo(c, c); g.lineTo(c + Math.sin(a) * L, c - Math.cos(a) * L); g.stroke(); };
    aig((10 + 10 / 60) / 12 * Math.PI * 2, 30, 5, '#1a1a1a'); aig(10 / 60 * Math.PI * 2, 46, 3.5, '#1a1a1a'); aig(38 / 60 * Math.PI * 2, 48, 1.5, '#d0262d');
    g.fillStyle = '#1a1a1a'; g.beginPath(); g.arc(c, c, 4, 0, 7); g.fill();
  }, null, true, 2);
}
// LA FAÏENCE DES TOILETTES : carreaux blancs de 60 x 30 à joints alignés, joint gris clair de 2 mm. Tuile de dessin :
// 1,2 x 1,2 m (deux carreaux de large, quatre de haut). Et son relief (le joint en creux).
function texFaience() {
  const map = canvasTex(512, 512, (g, w, h) => {
    const r = graine(404), cw = w / 2, chh = h / 4;
    for (let j = 0; j < 4; j++) for (let i = 0; i < 2; i++) {
      const t = (r() - 0.5) * 5, x0 = i * cw, y0 = j * chh;
      g.fillStyle = `rgb(${242 + t},${241 + t},${237 + t})`; g.fillRect(x0, y0, cw, chh);
      const d = g.createLinearGradient(x0, y0, x0 + cw, y0 + chh);
      d.addColorStop(0, 'rgba(255,255,255,0.10)'); d.addColorStop(0.5, 'rgba(255,255,255,0)'); d.addColorStop(1, 'rgba(200,198,190,0.08)');
      g.fillStyle = d; g.fillRect(x0, y0, cw, chh);
    }
    g.fillStyle = '#cdcac3';
    for (let i = 0; i <= 2; i++) g.fillRect(i * cw - 1, 0, 2, h);
    for (let j = 0; j <= 4; j++) g.fillRect(0, j * chh - 1, w, 2);
  }, [1 / 1.2, 1 / 1.2], false, 8);
  const nor = normalesDepuisGrille(256, 256, (g, w, h) => { for (let j = 0; j < 4; j++) for (let i = 0; i < 2; i++) g.fillRect(i * w / 2 + 1.2, j * h / 4 + 1.2, w / 2 - 2.4, h / 4 - 2.4); }, 1.5, 0.9);
  return { map, nor };
}
// LE GRÈS DU SOL DES TOILETTES : 30 x 30 gris clair moucheté, joint gris foncé. Tuile de dessin : 1,2 m (4 x 4).
function texSolWC() {
  const map = canvasTex(512, 512, (g, w, h) => {
    const r = graine(808), c = w / 4;
    for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) {
      const t = (r() - 0.5) * 8;
      g.fillStyle = `rgb(${168 + t},${165 + t},${159 + t})`; g.fillRect(i * c, j * c, c, c);
      for (let k = 0; k < 260; k++) { const v = 150 + (r() - 0.5) * 70; g.fillStyle = `rgba(${v},${v - 2},${v - 5},0.35)`; g.fillRect(i * c + r() * c, j * c + r() * c, 1.4, 1.4); }
    }
    g.fillStyle = '#7d7a74';
    for (let i = 0; i <= 4; i++) { g.fillRect(i * c - 1.5, 0, 3, h); g.fillRect(0, i * c - 1.5, w, 3); }
  }, [1 / 1.2, 1 / 1.2], false, 8);
  const nor = normalesDepuisGrille(256, 256, (g, w, h) => { const c = w / 4; for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) g.fillRect(i * c + 1.5, j * c + 1.5, c - 3, c - 3); }, 1.4, 1.0);
  return { map, nor };
}
// UNE FEUILLE de ficus lyrata (en violon), sur fond transparent
function texFeuille() {
  return canvasTex(128, 192, (g, w, h) => {
    g.beginPath(); g.moveTo(w / 2, h - 4);
    g.bezierCurveTo(w * 0.12, h * 0.78, w * 0.0, h * 0.42, w * 0.2, h * 0.16);
    g.bezierCurveTo(w * 0.33, h * 0.02, w * 0.67, h * 0.02, w * 0.8, h * 0.16);
    g.bezierCurveTo(w * 1.0, h * 0.42, w * 0.88, h * 0.78, w / 2, h - 4);
    const d = g.createLinearGradient(0, 0, w, h); d.addColorStop(0, '#5c8c3f'); d.addColorStop(1, '#2b4d20');
    g.fillStyle = d; g.fill();
    g.strokeStyle = 'rgba(196,224,150,0.65)'; g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(w / 2, h - 4); g.quadraticCurveTo(w * 0.53, h * 0.5, w * 0.5, h * 0.07); g.stroke();
    g.lineWidth = 1.2; g.strokeStyle = 'rgba(176,210,130,0.45)';
    for (let k = 1; k < 7; k++) {
      const y = h - 12 - k * h * 0.12;
      g.beginPath(); g.moveTo(w / 2, y); g.quadraticCurveTo(w * 0.3, y - 10, w * 0.14, y - 24); g.moveTo(w / 2, y); g.quadraticCurveTo(w * 0.7, y - 10, w * 0.86, y - 24); g.stroke();
    }
  }, null, true, 4);
}
// LE CARTON (scotch, étiquette)
function texCarton() {
  return canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = '#b48a5a'; g.fillRect(0, 0, w, h);
    const r = graine(77);
    for (let k = 0; k < 500; k++) { g.fillStyle = r() < 0.5 ? 'rgba(120,85,45,0.18)' : 'rgba(210,175,130,0.18)'; g.fillRect(r() * w, r() * h, 2, 1); }
    g.fillStyle = 'rgba(200,170,120,0.85)'; g.fillRect(w / 2 - 9, 0, 18, h);
    g.fillStyle = '#f4f2ea'; g.fillRect(14, 70, 44, 28); g.fillStyle = '#555'; for (let i = 0; i < 3; i++) g.fillRect(18, 76 + i * 7, 30 - i * 6, 3);
  }, null, false, 4);
}
// LES DOS DE CLASSEURS (bureau B, local) : couleurs franches, étiquettes blanches
function texClasseurs(n = 1) {
  return canvasTex(256, 128, (g, w, h) => {
    const r = graine(31 + n * 7), cols = ['#1f4e9a', '#c62828', '#2e7d32', '#f2b705', '#1b1b1b', '#7b2a6e', '#e9a01c', '#5a7f8c'];
    g.fillStyle = '#2a2a2a'; g.fillRect(0, 0, w, h);
    let x = 0;
    while (x < w) {
      const L = 14 + Math.floor(r() * 16), hh = h - Math.floor(r() * 26);
      g.fillStyle = cols[Math.floor(r() * cols.length)]; g.fillRect(x, h - hh, L - 1, hh);
      g.fillStyle = '#f4f4ef'; g.fillRect(x + 3, h - hh + 14, L - 7, 24);
      g.beginPath(); g.fillStyle = 'rgba(0,0,0,0.5)'; g.arc(x + L / 2, h - 18, 3, 0, 7); g.fill();
      x += L;
    }
  }, null, false, 4);
}
// LE TABLEAU DU BUREAU B : une impression abstraite aux couleurs de la vitrophanie (arcs, aplats)
function texArt() {
  return canvasTex(256, 320, (g, w, h) => {
    g.fillStyle = '#f3efe6'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#e9a01c'; g.fillRect(28, 40, 120, 160);
    for (const [c, r] of [['#7b2a6e', 150], ['#d6337a', 124], ['#f08a3c', 98], ['#fbf6ee', 72]]) { g.fillStyle = c; g.beginPath(); g.arc(200, 250, r, Math.PI, Math.PI * 1.5); g.lineTo(200, 250); g.fill(); }
    g.fillStyle = '#1d3f73'; g.beginPath(); g.arc(90, 230, 44, 0, 7); g.fill();
    g.fillStyle = '#1a1a1a'; g.fillRect(28, 286, 70, 3);
  }, null, false, 4);
}
// UNE PLAQUE DE PORTE (le style de la plaque « Toilettes » du C01 : noire, pictogramme et texte blancs)
function texPlaque(titre, picto) {
  return canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = '#1a1a1a'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#f2f2f2'; g.fillStyle = '#f2f2f2'; g.lineWidth = 4;
    if (picto === 'ecran') { g.strokeRect(30, 22, 68, 44); g.fillRect(58, 66, 12, 12); g.fillRect(44, 78, 40, 5); }
    else if (picto === 'bureau') { g.beginPath(); g.arc(64, 30, 10, 0, 7); g.fill(); g.fillRect(52, 44, 24, 26); g.fillRect(28, 66, 72, 6); g.fillRect(34, 72, 5, 16); g.fillRect(89, 72, 5, 16); }
    else if (picto === 'eclair') { g.beginPath(); g.moveTo(72, 16); g.lineTo(44, 58); g.lineTo(62, 58); g.lineTo(52, 92); g.lineTo(86, 46); g.lineTo(66, 46); g.closePath(); g.fill(); }
    g.font = `600 ${titre.length > 10 ? 13 : 16}px "Segoe UI", Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillText(titre, 64, 116);
  }, null, false, 2);
}
// LE TABLEAU ÉLECTRIQUE (porte) : gris clair, triangle « danger électrique », étiquette
function texTableauElec() {
  return canvasTex(128, 256, (g, w, h) => {
    g.fillStyle = '#d9d9d4'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(0,0,0,0.12)'; g.strokeRect(4, 4, w - 8, h - 8);
    g.fillStyle = '#f2c200'; g.beginPath(); g.moveTo(64, 30); g.lineTo(98, 88); g.lineTo(30, 88); g.closePath(); g.fill();
    g.strokeStyle = '#111'; g.lineWidth = 4; g.stroke();
    g.fillStyle = '#111'; g.beginPath(); g.moveTo(68, 44); g.lineTo(54, 66); g.lineTo(64, 66); g.lineTo(58, 82); g.lineTo(74, 58); g.lineTo(64, 58); g.closePath(); g.fill();
    g.fillStyle = '#ffffff'; g.fillRect(24, 108, 80, 26); g.fillStyle = '#222'; g.font = '700 16px "Segoe UI", Arial, sans-serif'; g.textAlign = 'center'; g.fillText('TGBT', 64, 127);
  }, null, false, 4);
}
// LA FAÇADE D'UNE BAIE SERVEUR (derrière la porte perforée) : commutateurs aux rangées de prises, serveurs, cordons
// de brassage ; et ses DIODES sur une texture à part, qui clignote (deux états, l'un sous l'autre)
function texBaie() {
  return canvasTex(128, 320, (g, w, h) => {
    g.fillStyle = '#0d0e10'; g.fillRect(0, 0, w, h);
    const r = graine(4242), u = h / 42;
    let y = 4;
    while (y < h - 10) {
      const n = r() < 0.45 ? 1 : r() < 0.7 ? 2 : 4, hh = n * u - 1;
      g.fillStyle = n === 1 ? '#25282d' : '#1c1e22'; g.fillRect(8, y, w - 16, hh);
      if (n === 1) {
        for (let i = 0; i < 12; i++) { g.fillStyle = '#0a0a0a'; g.fillRect(14 + i * 8, y + 2, 6, hh - 4); }
        for (let i = 0; i < 12; i++) if (r() < 0.6) { g.fillStyle = ['#2f6fb0', '#f2b705', '#2e9b4b', '#d0d0d0'][Math.floor(r() * 4)]; g.fillRect(15 + i * 8, y + hh - 2, 4, 3); }
      } else {
        g.fillStyle = '#34373d'; for (let i = 0; i < 6; i++) g.fillRect(14 + i * 6, y + 2, 3, hh - 4);
        g.fillStyle = '#4b4f57'; g.fillRect(w - 40, y + 3, 24, 3);
      }
      y += n * u + (r() < 0.2 ? u : 0);
    }
  }, null, false, 4);
}
function texDiodes() {
  return canvasTex(64, 256, (g, w, h) => {
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    for (let etat = 0; etat < 2; etat++) {
      const r = graine(9 + etat * 3), y0 = etat * h / 2;
      for (let k = 0; k < 70; k++) {
        const x = 4 + Math.floor(r() * 14) * 4, y = y0 + 3 + Math.floor(r() * 30) * 4;
        g.fillStyle = r() < 0.75 ? '#38ff6a' : '#ffb020'; g.fillRect(x, y, 2, 2);
      }
    }
  }, null, false, 1);
}
// LE TAPIS du bureau B : tissage gris chiné, bordure plus sombre
function texTapis() {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#8a8680'; g.fillRect(0, 0, w, h);
    const r = graine(616);
    for (let k = 0; k < 6000; k++) { const v = 120 + (r() - 0.5) * 70; g.fillStyle = `rgba(${v},${v - 3},${v - 6},0.35)`; g.fillRect(r() * w, r() * h, 2, 1); }
    g.strokeStyle = '#4e4b47'; g.lineWidth = 10; g.strokeRect(10, 10, w - 20, h - 20);
  }, null, false, 4);
}
// LE PICTOGRAMME PMR (porte de la cabine accessible)
function texPMR() {
  return canvasTex(64, 64, (g, w, h) => {
    g.fillStyle = '#1f5fae'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#fff'; g.strokeStyle = '#fff'; g.lineWidth = 5;
    g.beginPath(); g.arc(30, 13, 5, 0, 7); g.fill();
    g.beginPath(); g.moveTo(30, 20); g.lineTo(30, 36); g.lineTo(44, 36); g.lineTo(48, 50); g.stroke();
    g.beginPath(); g.arc(28, 42, 13, 0.5, 4.3); g.stroke();
  }, null, false, 1);
}
// L'AFFICHETTE « ISSUE DE SECOURS » (verte) et le panneau jaune « sol glissant »
function texIssue() {
  return canvasTex(256, 96, (g, w, h) => {
    g.fillStyle = '#12a150'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#f4fff6'; g.font = '700 30px "Segoe UI", Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('ISSUE DE SECOURS', w / 2, 36); g.font = '500 18px "Segoe UI", Arial, sans-serif'; g.fillText('Appuyer pour ouvrir', w / 2, 70);
  }, null, false, 2);
}
function texSolGlissant() {
  return canvasTex(128, 192, (g, w, h) => {
    g.fillStyle = '#f2c200'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#111'; g.beginPath(); g.moveTo(64, 18); g.lineTo(112, 102); g.lineTo(16, 102); g.closePath(); g.fill();
    g.fillStyle = '#f2c200'; g.beginPath(); g.moveTo(64, 32); g.lineTo(100, 95); g.lineTo(28, 95); g.closePath(); g.fill();
    g.fillStyle = '#111'; g.beginPath(); g.arc(70, 50, 5, 0, 7); g.fill(); g.fillRect(52, 58, 18, 5); g.fillRect(46, 76, 34, 4);
    g.font = '700 18px "Segoe UI", Arial, sans-serif'; g.textAlign = 'center'; g.fillText('ATTENTION', 64, 132); g.font = '600 15px "Segoe UI", Arial, sans-serif'; g.fillText('sol glissant', 64, 156);
  }, null, false, 2);
}

// =====================================================================
//  LES MEUBLES ET LES OBJETS (dessinés de face : +z local vers l'utilisateur)
// =====================================================================
// LA CHAISE DE BUREAU (salle A, local, bureau B) : piètement étoile à cinq branches et roulettes, vérin chromé,
// assise et dossier rembourrés, accoudoirs en option ; le dossier `haut` pour le fauteuil du bureau B. Collision : un
// petit disque ; siège : l'assise à 49 cm.
function chaiseBureau(ch, P, x, y, face, { accoudoirs = false, haut = false, tissu = null, nom = 'la chaise de bureau', sortie = null, rot = 0, rayon = 0.22 } = {}) {
  const g = groupe(ch, x, y, face); g.rotation.y += rot;
  const T = tissu || P.tissu;
  for (let i = 0; i < 5; i++) {
    const a = i / 5 * Math.PI * 2 + 0.31;
    const b = maille(boiteM(0.04, 0.028, 0.29), P.plastique, Math.sin(a) * 0.15, 0.072, Math.cos(a) * 0.15, a, g);
    b.rotation.x = 0.1;
    const rl = maille(new THREE.CylinderGeometry(0.024, 0.024, 0.022, 10), P.plastique, Math.sin(a) * 0.29, 0.026, Math.cos(a) * 0.29, a, g, { ombre: false });
    rl.rotation.z = Math.PI / 2;
  }
  CY(g, P.plastique, 0.04, 0.07, 0, 0.09, 0, 14);
  CY(g, P.chrome, 0.022, 0.3, 0, 0.27, 0, 12);
  B(g, P.plastique, 0.22, 0.05, 0.24, 0, 0.425, 0);
  R(g, T, 0.49, 0.075, 0.47, 0.03, 0, 0.475, 0.02);
  const dos = new THREE.Group(); dos.position.set(0, 0.46, -0.21); dos.rotation.x = -0.1; g.add(dos);
  B(dos, P.plastique, 0.06, 0.3, 0.03, 0, 0.12, -0.03);
  if (haut) R(dos, T, 0.45, 0.66, 0.07, 0.028, 0, 0.52, 0);
  else maille(geoDossier(), T, 0, 0.37, 0, 0, dos);
  if (haut) R(dos, T, 0.3, 0.12, 0.08, 0.04, 0, 0.92, 0.01);          // l'appui-tête
  if (accoudoirs) for (const s of [-1, 1]) {
    B(g, P.plastique, 0.03, 0.2, 0.05, s * 0.255, 0.58, -0.04);
    R(g, P.plastique, 0.07, 0.03, 0.25, 0.012, s * 0.255, 0.695, -0.0);
  }
  ch.C.ajouterCercle(x, -y, rayon, { y1: 1.0 });
  if (nom) siege(ch, x, y, 0.49, face, nom, sortie);
  return g;
}
// L'ÉCRAN 24 POUCES sur son pied : `mat` l'image allumée
function ecranPC(ch, P, x, y, h, face, mat) {
  const g = groupe(ch, x, y, face, h);
  R(g, P.plastique, 0.22, 0.014, 0.17, 0.006, 0, 0.007, -0.03, { ombre: false });
  B(g, P.plastiqueGris, 0.05, 0.25, 0.025, 0, 0.135, -0.07);
  R(g, P.plastique, 0.556, 0.335, 0.03, 0.008, 0, 0.33, -0.045);
  plan(g, mat, 0.53, 0.3, 0, 0.335, -0.0295);
  return g;
}
// LE CLAVIER ET LA SOURIS
function clavier(ch, P, x, y, h, face) {
  const g = groupe(ch, x, y, face, h);
  R(g, P.plastique, 0.44, 0.02, 0.135, 0.006, 0, 0.01, 0, { ombre: false });
  B(g, P.plastiqueGris, 0.41, 0.004, 0.11, 0, 0.021, 0.004, { ombre: false });
  R(g, P.plastique, 0.062, 0.03, 0.105, 0.025, 0.31, 0.015, 0.0, { ombre: false });
  return g;
}
// L'UNITÉ CENTRALE (sous la table) : boîtier noir, liseré bleu allumé
function unite(ch, P, x, y, face) {
  const g = groupe(ch, x, y, face);
  B(g, P.plastique, 0.19, 0.42, 0.42, 0, 0.23, 0);
  B(g, P.plastiqueGris, 0.17, 0.02, 0.4, 0, 0.01, 0, { ombre: false });
  B(g, P.bleu, 0.006, 0.12, 0.004, 0.06, 0.36, 0.212, { ombre: false });
  return g;
}
// UNE TABLE de stratifié blanc, x0-x1 (le long de x), ya-yb (ya : le côté des chaises), plateau à `h`, piètement luge
// d'acier gris à ses deux bouts, voile de fond côté yb, goulotte sous le plateau
function table(ch, P, x0, x1, ya, yb, { h = 0.745, voile = true, mat = null } = {}) {
  const s = yb > ya ? 1 : -1, y0 = Math.min(ya, yb), y1 = Math.max(ya, yb);
  ch.boite(x0, y0, x1, y1, h - 0.025, h, mat || P.strat);
  for (const x of [x0 + 0.035, x1 - 0.035]) {
    for (const y of [y0 + 0.07, y1 - 0.07]) ch.boite(x - 0.02, y - 0.02, x + 0.02, y + 0.02, 0.025, h - 0.025, P.metal);
    ch.boite(x - 0.022, y0 + 0.03, x + 0.022, y1 - 0.03, 0, 0.025, P.metal);
    ch.boite(x - 0.02, y0 + 0.05, x + 0.02, y1 - 0.05, h - 0.065, h - 0.025, P.metal, { ombre: false });
  }
  if (voile) ch.boite(x0 + 0.06, yb - s * 0.03 - 0.006, x1 - 0.06, yb - s * 0.03 + 0.006, 0.3, h - 0.03, P.voile);
  ch.boite(x0 + 0.1, Math.min(yb - s * 0.2, yb - s * 0.07), x1 - 0.1, Math.max(yb - s * 0.2, yb - s * 0.07), h - 0.12, h - 0.03, P.metal, { ombre: false });
  ch.C.ajouterBoite(x0, -y0, x1, -y1, { y1: h });
}
// UN RADIATEUR à panneaux (comme ceux du hall) contre une face de mur
function radiateur(ch, x0, y0, x1, y1, h0, h1) {
  const M = ch.M;
  ch.boite(x0, y0, x1, y1, h0, h1, M.radiateur, { collision: true });
  ch.boite(x0 + 0.01, y0 + 0.01, x1 - 0.01, y1 - 0.01, h1, h1 + 0.005, M.grille, { ombre: false });
}
// UN CADRE MURAL (affiche, tableau) : baguette noire, image dedans ; `face` la direction où il regarde
function cadre(ch, P, mat, x, y, face, w, h, hc, { baguette = null, ep = 0.025 } = {}) {
  const g = groupe(ch, x, y, face, hc);
  const bg = baguette || P.noirMat;
  B(g, bg, w, h, ep, 0, 0, ep / 2, { ombre: false });
  plan(g, mat, w - 0.04, h - 0.04, 0, 0, ep + 0.001);
  return g;
}
// UNE PLANTE en pot (ficus lyrata) : pot blanc, terre, tronc, feuilles en violon en spirale
function plante(ch, P, x, y, { h = 1.5, pot = 0.19, n = 16, graineN = 1 } = {}) {
  const g = groupe(ch, x, y, 'S');
  maille(new THREE.CylinderGeometry(pot, pot * 0.8, pot * 2.1, 22), P.pot, 0, pot * 1.05, 0, 0, g);
  maille(new THREE.CylinderGeometry(pot * 0.93, pot * 0.93, 0.02, 22), P.terre, 0, pot * 2.1 - 0.025, 0, 0, g, { ombre: false });
  const r = graine(graineN * 13 + 5);
  CY(g, P.tronc, 0.016, h * 0.75, 0, pot * 2.1 + h * 0.375 - 0.05, 0, 6);
  for (let i = 0; i < n; i++) {
    const a = i * 2.39996 + r() * 0.4, t = i / (n - 1), hy = pot * 2.1 + 0.15 + t * (h - 0.45);
    const L = 0.24 + r() * 0.1 - t * 0.05;
    const geo = new THREE.PlaneGeometry(L * 0.7, L); geo.translate(0, L / 2, 0);
    const f = new THREE.Mesh(geo, P.feuille);
    f.position.set(Math.sin(a) * 0.03, hy, Math.cos(a) * 0.03);
    f.rotation.y = a; f.rotateX(0.55 + r() * 0.5 - t * 0.25); f.rotateZ((r() - 0.5) * 0.5);
    f.castShadow = true; f.receiveShadow = true;
    g.add(f);
  }
  ch.C.ajouterCercle(x, -y, pot + 0.04, { y1: h });
  return g;
}
// LA CORBEILLE (cylindre d'acier noir ou inox)
function corbeille(ch, P, x, y, mat = null, r = 0.14, h = 0.34) {
  const g = groupe(ch, x, y);
  maille(new THREE.CylinderGeometry(r, r * 0.9, h, 18), mat || P.noirMat, 0, h / 2, 0, 0, g);
  CY(g, P.plastique, r * 0.96, 0.012, 0, h - 0.004, 0, 18, { ombre: false });
  return g;
}

// =====================================================================
//  LA SALLE A (informatique)
// =====================================================================
// Rangées face au NORD (la toile de projection descend devant les jours dépolis du mur de la salle d'attente) ; la porte
// du hall ouest (y = 6,85) ouvre sur l'allée ouest (x 4,9-5,95) et le devant de la classe. Trois rangées de deux tables
// accolées (deux postes + trois postes, 78 cm chacun), espacées de 2 m : 70 cm de passage derrière chaque rangée de
// chaises (le joueur fait 60 cm de large).
const RANGEES = [[6.0, 6.7], [4.0, 4.7], [2.0, 2.7]];          // (côté chaises, côté écrans)
const POSTES = [6.34, 7.12, 7.9, 8.68, 9.46];
function salleA(ch, P) {
  const { M, C } = ch;
  // la plinthe qui manque (le mur du passage, côté salle) et les radiateurs sous les fenêtres
  plinthe(ch, 'y', SA.x0, 0, 5.0, 1);
  for (const c of [5.78, 7.43, 9.08]) radiateur(ch, c - 0.5, 0, c + 0.5, 0.09, 0.15, 0.78);
  // ---- les postes ----
  let k = 0;
  for (const [ya, yb] of RANGEES) {
    table(ch, P, 5.95, 7.508, ya, yb); table(ch, P, 7.512, 9.85, ya, yb);
    POSTES.forEach((x, i) => {
      ecranPC(ch, P, x, yb - 0.22, 0.745, 'S', P.ecrans[(k + i * 2) % P.ecrans.length]);
      clavier(ch, P, x - 0.04, ya + 0.2, 0.745, 'S');
      unite(ch, P, x + 0.21, yb - 0.26, 'S');
      // les chaises ne sont pas toutes rangées pile sous la table
      const r = graine(k * 11 + i * 3 + 1);
      chaiseBureau(ch, P, x + (r() - 0.5) * 0.08, ya - 0.38 - r() * 0.04, 'N', { rot: (r() - 0.5) * 0.35, rayon: 0.17, sortie: [0, -0.55] });
    });
    k++;
  }
  // un peu de vie : une gourde, un cahier, un sac à dos appuyé contre le bureau de l'enseignant
  const gourde = groupe(ch, 7.45, 4.4, 'S', 0.745); CY(gourde, P.bleu, 0.035, 0.22, 0, 0.11, 0, 14); CY(gourde, P.chrome, 0.025, 0.03, 0, 0.235, 0, 10);
  const cahier = groupe(ch, 8.95, 2.32, 'S', 0.745); B(cahier, P.jaune, 0.21, 0.012, 0.29, 0, 0.006, 0, { ombre: false }); cahier.rotation.y = 0.3;
  const sac = new THREE.Group(); sac.rotation.x = -0.16; groupe(ch, 6.38, 7.62, 'E').add(sac);
  R(sac, P.tissuBleu, 0.3, 0.42, 0.17, 0.07, 0, 0.21, 0); R(sac, P.tissuBleu, 0.22, 0.16, 0.06, 0.03, 0, 0.16, 0.1);
  C.ajouterCercle(6.38, -7.62, 0.15, { y1: 0.45 });
  // ---- le bureau de l'enseignant (devant à gauche), son voile de façade safran, son poste tourné vers lui ----
  table(ch, P, 4.95, 6.2, 8.25, 7.55, { voile: false });
  ch.boite(4.99, 7.55, 6.16, 7.57, 0.12, 0.72, M.orange);
  ecranPC(ch, P, 5.55, 7.78, 0.745, 'N', P.ecrans[4]);
  clavier(ch, P, 5.5, 8.08, 0.745, 'N');
  const doc = groupe(ch, 6.0, 7.9, 'N', 0.745); B(doc, P.blancMat, 0.21, 0.02, 0.3, 0, 0.01, 0, { ombre: false }); doc.rotation.y += 0.25;
  chaiseBureau(ch, P, 5.55, 8.56, 'S', { accoudoirs: true, nom: 'le fauteuil de l’enseignant', sortie: [0.95, -0.35] });
  corbeille(ch, P, 5.12, 8.68);
  C.ajouterCercle(5.12, -8.68, 0.16, { y1: 0.4 });
  // ---- la toile de projection, descendue devant les jours dépolis ----
  const tl = groupe(ch, 7.45, 8.66, 'S');
  CY(tl, P.blancMat, 0.055, 2.5, 0, 2.52, 0.0, 16).rotation.z = Math.PI / 2;                 // le carter
  for (const s of [-1, 1]) B(tl, P.plastiqueGris, 0.03, 0.06, 0.08, s * 1.27, 2.55, 0);      // les embouts
  plan(tl, P.diapo, 2.24, 1.37, 0, 1.76, 0.0);
  B(tl, P.plastique, 2.28, 0.03, 0.025, 0, 1.065, 0);                                        // la barre de charge
  CY(tl, P.plastiqueGris, 0.004, 0.25, 0.4, 0.93, 0.0, 4, { ombre: false });                  // la cordelette
  C.ajouterBoite(6.3, -8.59, 8.6, -8.71, { y0: 1.05, y1: 2.6 });
  // ---- le vidéoprojecteur au plafond, tourné vers la toile ----
  const vp = groupe(ch, 7.45, 4.3, 'N', 2.6);
  CY(vp, P.alu, 0.02, 0.22, 0, -0.11, 0, 8);
  B(vp, P.alu, 0.18, 0.02, 0.14, 0, -0.22, 0);
  R(vp, P.blancMat, 0.34, 0.11, 0.27, 0.025, 0, -0.29, 0);
  maille(new THREE.CylinderGeometry(0.035, 0.04, 0.025, 18), P.plastique, 0.07, -0.29, 0.14, 0, vp).rotation.x = Math.PI / 2;
  maille(new THREE.CircleGeometry(0.03, 18), P.led, 0.07, -0.29, 0.153, 0, vp, { ombre: false, recoit: false });
  B(vp, P.plastiqueGris, 0.12, 0.004, 0.1, -0.08, -0.234, 0, { ombre: false });
  vp.traverse((m) => { m.userData.horsAOSol = true; });
  // ---- le tableau blanc, au mur est, son auget et ses feutres ----
  const tb = groupe(ch, SA.x1, 7.7, 'W', 1.475);
  B(tb, P.alu, 1.64, 1.19, 0.022, 0, 0, 0.011);
  plan(tb, P.tableauBlanc, 1.6, 1.15, 0, 0, 0.0225);
  B(tb, P.alu, 1.2, 0.025, 0.07, 0, -0.6, 0.04);
  ['#1d4fa3', '#1e1e1e', '#c62828'].forEach((c, i) => {
    const f = CY(tb, new THREE.MeshStandardMaterial({ color: c, roughness: 0.5 }), 0.009, 0.13, -0.3 + i * 0.09, -0.578, 0.045, 8, { ombre: false });
    f.rotation.z = Math.PI / 2;
  });
  B(tb, P.plastiqueGris, 0.14, 0.035, 0.05, 0.3, -0.57, 0.045, { ombre: false });
  // l'horloge au-dessus
  const hz = groupe(ch, SA.x1, 7.7, 'W', 2.33);
  CY(hz, P.plastique, 0.155, 0.035, 0, 0, 0.018, 28).rotation.x = Math.PI / 2;
  const cad = new THREE.Mesh(new THREE.CircleGeometry(0.145, 32), new THREE.MeshStandardMaterial({ map: texHorloge(), roughness: 0.3 }));
  cad.position.set(0, 0, 0.036); hz.add(cad);
  // ---- les stores enrouleurs des trois fenêtres (descendus plus ou moins) ----
  [[5.78, 1.62], [7.43, 1.95], [9.08, 1.35]].forEach(([c, bas]) => {
    const g = groupe(ch, c, 0.07, 'S', 0);
    CY(g, P.blancMat, 0.04, 1.42, 0, 2.53, 0, 14).rotation.z = Math.PI / 2;
    const L = 2.5 - bas;
    plan(g, P.store, 1.32, L, 0, bas + L / 2, -0.01);
    B(g, P.alu, 1.34, 0.03, 0.015, 0, bas, -0.01);
    CY(g, P.alu, 0.003, 1.0, 0.69, 1.95, -0.02, 4, { ombre: false });
  });
  // ---- les dalles LED du plafond (sur la trame des plateaux : 60 x 120, y = 9,0 - 1,2 k) ----
  for (const x of [6.25, 8.65]) for (const y of [2.4, 4.8, 7.2]) dalleLED(ch, P, x, y, 2.6, 'salleA');
  // le point d'accès wifi et le détecteur de fumée
  const ap = groupe(ch, 7.45, 6.6, 'S', 2.6); CY(ap, P.blancMat, 0.1, 0.035, 0, -0.018, 0, 24, { ombre: false }); maille(new THREE.CircleGeometry(0.012, 10), P.led, 0, -0.0365, 0.05, 0, ap, { recoit: false }).rotation.x = Math.PI / 2;
  const df = groupe(ch, 5.4, 3.6, 'S', 2.6); CY(df, P.blancMat, 0.055, 0.045, 0, -0.023, 0, 18, { ombre: false });
  for (const o of [ap, df]) o.traverse((m) => { m.userData.horsAOSol = true; });
  // ---- le fond de la classe : l'imprimante sur son meuble bas, deux affiches au mur de l'allée, les patères ----
  const im = groupe(ch, 5.24, 0.42, 'E');
  B(im, P.grisClair, 0.5, 0.7, 0.55, 0, 0.35, 0);
  B(im, P.plastiqueGris, 0.46, 0.01, 0.5, 0, 0.705, 0, { ombre: false });
  R(im, P.blancMat, 0.46, 0.34, 0.44, 0.02, 0, 0.88, -0.01);
  B(im, P.plastiqueGris, 0.3, 0.012, 0.2, 0, 1.06, -0.04);
  B(im, P.plastique, 0.12, 0.05, 0.02, 0.12, 0.98, 0.215, { ombre: false });
  B(im, P.blancMat, 0.2, 0.004, 0.28, -0.05, 0.85, 0.05, { ombre: false });
  C.ajouterBoite(4.95, -0.15, 5.53, -0.69, { y1: 1.1 });
  cadre(ch, P, new THREE.MeshStandardMaterial({ map: texAffiche('#7b2a6e', '#fbfbf8', 61), roughness: 0.6 }), SA.x0, 1.9, 'E', 0.52, 0.72, 1.6);
  cadre(ch, P, new THREE.MeshStandardMaterial({ map: texAffiche('#e9a01c', '#fbfbf8', 62), roughness: 0.6 }), SA.x0, 3.5, 'E', 0.52, 0.72, 1.6);
  const pat = groupe(ch, SA.x0, 5.35, 'E', 1.72);
  B(pat, P.chene, 1.0, 0.1, 0.02, 0, 0, 0.01);
  for (let i = 0; i < 5; i++) { const p = CY(pat, P.chrome, 0.008, 0.07, -0.4 + i * 0.2, 0.0, 0.05, 8, { ombre: false }); p.rotation.x = Math.PI / 2 - 0.3; }
  vetement(pat, P.tissuBleu, -0.2, 0.0, 0.1, { haut: 0.62 });            // une veste accrochée
  // ---- la plaque « Salle A » côté hall, du côté de la poignée (comme la plaque « Toilettes » du C01, photo 01) ----
  cadre(ch, P, new THREE.MeshStandardMaterial({ map: texPlaque('Salle A', 'ecran'), roughness: 0.4 }), 4.75, 6.08, 'W', 0.17, 0.17, 1.6, { ep: 0.006 });
}
// UNE DALLE LED encastrée dans le plafond à plateaux : cadre d'aluminium blanc, diffuseur allumé ; c'est une LAMPE
function dalleLED(ch, P, x, y, h, zone) {
  const g = groupe(ch, x, y, 'S', h);
  B(g, P.alu, 0.6, 0.012, 1.2, 0, -0.006, 0, { ombre: false });
  const d = new THREE.Mesh(new THREE.PlaneGeometry(0.57, 1.17), P.dalle);
  d.rotation.x = Math.PI / 2; d.position.y = -0.0125; g.add(d);
  g.traverse((m) => { m.userData.horsAOSol = true; m.castShadow = false; });
  ch.lampes.push({ x, z: -y, h, zone, type: 'dalle', force: 1.05, cuireForce: 1.15 });
}

// =====================================================================
//  LE BUREAU B
// =====================================================================
function bureauB(ch, P) {
  const { C } = ch;
  plinthe(ch, 'y', BB.x1, 0, 0.3, -1);
  radiateur(ch, 11.15, 0, 12.05, 0.09, 0.15, 0.65);
  // le tapis
  const tapis = new THREE.MeshStandardMaterial({ map: texTapis(), roughness: 1 });
  ch.boite(10.45, 0.35, 12.95, 3.45, 0, 0.01, tapis, { ombre: false });
  // le bureau de chêne clair sur piètement noir, son caisson blanc
  ch.boite(11.0, 1.35, 12.5, 2.15, 0.72, 0.75, P.chene);
  for (const x of [11.04, 12.46]) for (const y of [1.39, 2.11]) ch.boite(x - 0.02, y - 0.02, x + 0.02, y + 0.02, 0.01, 0.72, P.noirMat);
  ch.boite(11.04, 2.09, 12.46, 2.11, 0.62, 0.7, P.noirMat, { ombre: false });
  ch.boite(11.98, 1.42, 12.42, 1.98, 0.02, 0.6, P.blancMat);
  for (const h of [0.08, 0.27, 0.45]) ch.boite(12.03, 1.405, 12.37, 1.42, h, h + 0.12, P.grisClair, { ombre: false });
  C.ajouterBoite(11.0, -1.35, 12.5, -2.15, { y1: 0.75 });
  // sur le bureau : l'écran, le portable ouvert, le téléphone, des papiers, la lampe, le pot à crayons
  ecranPC(ch, P, 11.62, 1.95, 0.75, 'S', P.ecrans[2]);
  clavier(ch, P, 11.58, 1.6, 0.75, 'S');
  const lp = groupe(ch, 12.2, 1.72, 'S', 0.75); lp.rotation.y = -0.35;
  R(lp, P.alu, 0.32, 0.016, 0.22, 0.006, 0, 0.008, 0, { ombre: false });
  const cou = new THREE.Group(); cou.position.set(0, 0.016, -0.11); cou.rotation.x = -0.25; lp.add(cou);
  B(cou, P.alu, 0.32, 0.21, 0.007, 0, 0.105, 0);
  plan(cou, P.ecrans[3], 0.3, 0.18, 0, 0.108, 0.0040);
  const tel = groupe(ch, 11.13, 1.85, 'S', 0.75); R(tel, P.plastique, 0.18, 0.05, 0.2, 0.015, 0, 0.025, 0, { ombre: false }); R(tel, P.plastique, 0.05, 0.035, 0.19, 0.015, -0.055, 0.065, 0, { ombre: false });
  const pap = groupe(ch, 11.16, 1.52, 'S', 0.75); pap.rotation.y = 0.2; B(pap, P.blancMat, 0.21, 0.012, 0.297, 0, 0.006, 0, { ombre: false });
  const lampe = groupe(ch, 12.38, 2.0, 'S', 0.75);
  CY(lampe, P.noirMat, 0.07, 0.015, 0, 0.008, 0, 18); CY(lampe, P.noirMat, 0.008, 0.42, 0, 0.22, 0, 6);
  maille(new THREE.ConeGeometry(0.08, 0.12, 18, 1, true), P.noirMat, -0.05, 0.43, 0.04, 0, lampe).rotation.z = 0.5;
  const pot = groupe(ch, 11.07, 2.05, 'S', 0.75); CY(pot, P.noirMat, 0.035, 0.1, 0, 0.05, 0, 14); for (let i = 0; i < 3; i++) CY(pot, [P.bleu, P.rouge, P.jaune][i], 0.005, 0.15, -0.012 + i * 0.012, 0.11, (i - 1) * 0.008, 6, { ombre: false });
  // le fauteuil (haut dossier) et les deux chaises visiteurs
  chaiseBureau(ch, P, 11.7, 0.86, 'N', { accoudoirs: true, haut: true, nom: 'le fauteuil du bureau', sortie: [-0.8, 0] });
  chaiseLuge(ch, P, 11.3, 2.72, 'S');
  chaiseLuge(ch, P, 12.15, 2.72, 'S', -0.12);
  // l'armoire haute (deux portes) au mur est
  ch.boite(12.76, 0.3, 13.2, 2.1, 0, 1.98, P.grisClair, { collision: true });
  ch.boite(12.75, 0.31, 12.76, 1.195, 0.03, 1.95, P.blancMat, { ombre: false });
  ch.boite(12.75, 1.205, 12.76, 2.09, 0.03, 1.95, P.blancMat, { ombre: false });
  for (const y of [1.14, 1.26]) ch.boite(12.72, y - 0.01, 12.75, y + 0.01, 0.95, 1.2, P.chrome, { ombre: false });
  const boites = groupe(ch, 12.98, 1.2, 'W', 1.98);
  R(boites, P.carton, 0.4, 0.28, 0.32, 0.01, -0.35, 0.14, 0); R(boites, P.blancMat, 0.34, 0.12, 0.3, 0.01, 0.15, 0.06, 0);
  // la bibliothèque au mur ouest, ses classeurs
  const bib = groupe(ch, BB.x0 + 0.14, 0.95, 'E');
  for (const s of [-1, 1]) B(bib, P.blancMat, 0.02, 1.85, 0.28, s * 0.6, 0.925, 0);
  B(bib, P.blancMat, 1.22, 0.02, 0.28, 0, 1.84, 0);
  B(bib, P.blancMat, 1.18, 1.83, 0.01, 0, 0.925, -0.135, { ombre: false });
  const cl = [0, 1, 2].map((i) => new THREE.MeshStandardMaterial({ map: texClasseurs(i + 1), roughness: 0.6 }));
  for (let i = 0; i < 5; i++) {
    const h = 0.04 + i * 0.36; B(bib, P.blancMat, 1.18, 0.02, 0.26, 0, h, 0);
    if (i < 4) { B(bib, P.plastique, 1.1, 0.3, 0.22, 0, h + 0.16, -0.01, { ombre: false }); plan(bib, cl[i % 3], 1.1, 0.3, 0, h + 0.16, 0.101); }
  }
  ch.C.ajouterBoite(BB.x0, -0.3, BB.x0 + 0.29, -1.6, { y1: 1.85 });
  // le tableau (impression encadrée) au-dessus du fauteuil des visiteurs, la grande plante, le porte-manteau
  cadre(ch, P, new THREE.MeshStandardMaterial({ map: texArt(), roughness: 0.7 }), BB.x0, 2.75, 'E', 0.82, 1.02, 1.62, { baguette: P.chene, ep: 0.03 });
  plante(ch, P, 10.48, 4.25, { h: 1.65, graineN: 3 });
  const pm = groupe(ch, 12.92, 4.35, 'S');
  CY(pm, P.noirMat, 0.17, 0.02, 0, 0.01, 0, 20); CY(pm, P.noirMat, 0.016, 1.75, 0, 0.88, 0, 8);
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.4; const c = CY(pm, P.noirMat, 0.008, 0.18, Math.sin(a) * 0.07, 1.67, Math.cos(a) * 0.07, 6, { ombre: false }); c.rotation.set(Math.cos(a) * 0.8, 0, -Math.sin(a) * 0.8); }
  vetement(pm, P.tissu, 0.0, 1.66, 0.12, { haut: 0.85, rot: 0.3 });  // un manteau sombre (devant le mât, qu'il frôle)
  C.ajouterCercle(12.92, -4.35, 0.2, { y1: 1.8 });
  corbeille(ch, P, 12.75, 2.35, null, 0.12, 0.3);
  // la plaque « Bureau B » côté cou
  cadre(ch, P, new THREE.MeshStandardMaterial({ map: texPlaque('Bureau B', 'bureau'), roughness: 0.4 }), 12.72, 4.86, 'N', 0.17, 0.17, 1.6, { ep: 0.006 });
}
// LA CHAISE VISITEUR « luge » : tube chromé en traîneau, coque et dossier de tissu
function chaiseLuge(ch, P, x, y, face, rot = 0) {
  const g = groupe(ch, x, y, face); g.rotation.y += rot;
  for (const s of [-1, 1]) {
    const pa = CY(g, P.chrome, 0.011, 0.5, s * 0.22, 0.012, 0.0, 8); pa.rotation.x = Math.PI / 2;
    for (const z of [0.21, -0.21]) CY(g, P.chrome, 0.011, 0.44, s * 0.22, 0.23, z * 0.95, 8);
    const d = CY(g, P.chrome, 0.011, 0.45, s * 0.22, 0.68, -0.23, 8); d.rotation.x = -0.12;
  }
  R(g, P.tissu, 0.5, 0.06, 0.46, 0.025, 0, 0.47, 0.0);
  const dos = R(g, P.tissu, 0.48, 0.34, 0.05, 0.02, 0, 0.75, -0.24); dos.rotation.x = -0.12;
  ch.C.ajouterCercle(x, -y, 0.25, { y1: 0.95 });
  siege(ch, x, y, 0.47, face, 'la chaise', [-DIR[face][0] * 0.65, DIR[face][1] * 0.65]);
  return g;
}

// =====================================================================
//  LE COULOIR DE SERVICE
// =====================================================================
// Derrière la porte grise du hall ouest et la porte blanche « Sortie » du passage : un couloir de 1,6 m le long du
// mitoyen ouest qui mène à la porte de secours de la façade (travée 1). Fermé au nord par la porte de la réserve.
function couloirService(ch, P) {
  const { M, C } = ch;
  // le mitoyen ouest (30 cm), le mur du fond et sa porte (fermée : la réserve n'est pas visitée)
  ch.mur({ de: [-0.15, 0], a: [-0.15, 13.75], ep: 0.3, mats: M.blanc, plinthes: ['E'] });
  ch.mur({ de: [-0.3, 13.675], a: [1.675, 13.675], mats: M.blanc, plinthes: ['S'], ouvertures: [{ c: 0.8, l: 0.93, h: 2.04 }] });
  ch.porte('x', 13.675, 0.8, { l: 0.93, h: 2.04, modele: 'grise', oculus: false, etat: 'fermee', cote: 'S', notices: 1, nom: 'réserve (service)' });
  // les plinthes du mur du passage et du hall, côté couloir (les portes laissées libres)
  for (const [a0, a1] of [[0, 3.65], [4.65, 9.06], [10.09, 13.6]]) plinthe(ch, 'y', SV.x1, a0, a1, -1);
  // le plafond de plâtre, les hublots, le bloc de sortie au-dessus de la porte de secours
  ch.plafond(SV.x0, SV.y0, SV.x1, SV.y1, 2.45, 'platre');
  for (const y of [2.2, 6.8, 11.4]) ch.opale(0.8, y, 2.45, 'service', { r: 0.15 });
  ch.sortie(0.8, 0.12, 2.32, 'N');
  // LA PORTE DE SECOURS, vue de dedans : sa barre anti-panique (le vantail est au nu extérieur, y = -0,35)
  const bp = groupe(ch, 0.8, -0.35, 'N', 0);
  B(bp, P.inox, 0.74, 0.045, 0.05, 0, 0.98, 0.07);
  for (const s of [-1, 1]) R(bp, P.plastique, 0.07, 0.09, 0.09, 0.01, s * 0.38, 0.98, 0.045);
  plan(bp, new THREE.MeshStandardMaterial({ map: texIssue(), roughness: 0.5 }), 0.32, 0.12, 0, 1.55, 0.002);
  // ---- ce qu'on range dans un couloir de service ----
  // deux bacs roulants (couvercle jaune : le tri ; vert foncé : les ordures), contre le mitoyen
  [[1.6, P.jaune], [2.3, P.vert]].forEach(([y, couv]) => {
    const g = groupe(ch, 0.4, y, 'E');
    R(g, P.plastiqueGris, 0.58, 0.95, 0.68, 0.04, 0, 0.5, 0);
    R(g, couv, 0.6, 0.05, 0.72, 0.02, 0, 1.0, -0.01);
    for (const s of [-1, 1]) { const r = CY(g, P.plastique, 0.1, 0.05, s * 0.27, 0.1, -0.3, 14); r.rotation.z = Math.PI / 2; }
    B(g, P.plastique, 0.5, 0.04, 0.05, 0, 0.98, -0.37);
    C.ajouterBoite(0.04, -(y - 0.31), 0.76, -(y + 0.31), { y1: 1.05 });
  });
  // le chariot de ménage : cadre gris, seau jaune, sac bleu, balai
  const cm = groupe(ch, 0.36, 6.5, 'E');
  B(cm, P.plastiqueGris, 0.95, 0.03, 0.5, 0, 0.12, 0);
  B(cm, P.plastiqueGris, 0.95, 0.03, 0.5, 0, 0.62, 0);
  for (const [sx, sz] of [[-0.45, -0.23], [0.45, -0.23], [-0.45, 0.23], [0.45, 0.23]]) { CY(cm, P.plastiqueGris, 0.012, 0.95, sx, 0.55, sz, 6); CY(cm, P.plastique, 0.035, 0.03, sx, 0.035, sz, 10); }
  maille(new THREE.CylinderGeometry(0.17, 0.14, 0.26, 18), P.jaune, -0.22, 0.27, 0, 0, cm);
  R(cm, P.bleu, 0.36, 0.5, 0.36, 0.08, 0.24, 0.9, 0);
  const balai = CY(cm, P.alu, 0.012, 1.4, -0.3, 0.85, 0.05, 6); balai.rotation.z = 0.15;
  C.ajouterBoite(0.08, -5.98, 0.64, -7.02, { y1: 1.15 });
  // l'escabeau replié, appuyé au mur
  const es0 = groupe(ch, 0.2, 8.0, 'E'), es = new THREE.Group(); es.rotation.x = -0.12; es0.add(es);
  for (const s of [-1, 1]) B(es, P.alu, 0.04, 1.55, 0.025, s * 0.2, 0.775, 0);
  for (let i = 0; i < 4; i++) B(es, P.alu, 0.4, 0.02, 0.07, 0, 0.3 + i * 0.3, 0.02);
  C.ajouterBoite(0, -7.75, 0.2, -8.25, { y1: 1.6 });
  // les cartons empilés
  [[0.3, 11.95, 0, 0.55, 0.45, 0.4], [0.33, 12.5, 0, 0.5, 0.45, 0.35], [0.31, 12.2, 0.4, 0.45, 0.4, 0.3]].forEach(([x, y, h0, w, d, h]) => {
    const g = groupe(ch, x, y, 'E', h0); g.rotation.y += (x * 7) % 0.2 - 0.1; R(g, P.carton, d, h, w, 0.01, 0, h / 2, 0);
  });
  C.ajouterBoite(0.03, -11.68, 0.6, -12.76, { y1: 0.75 });
  // l'extincteur et son pictogramme, la goulotte électrique, le plan d'évacuation, le coffret électrique
  const ex = groupe(ch, 0.11, 4.9, 'E');
  CY(ex, P.rouge, 0.075, 0.48, 0, 1.2, 0, 16); CY(ex, P.noirMat, 0.04, 0.08, 0, 1.48, 0, 10);
  C.ajouterCercle(0.11, -4.9, 0.09, { y0: 0.9, y1: 1.6 });
  cadre(ch, P, new THREE.MeshStandardMaterial({ map: texPictoExtincteur(), roughness: 0.6 }), SV.x0, 4.9, 'E', 0.16, 0.16, 1.85, { ep: 0.004 });
  ch.boite(SV.x0, SV.y0, SV.x0 + 0.06, SV.y1, 2.2, 2.28, P.blancMat, { ombre: false });
  cadre(ch, P, new THREE.MeshStandardMaterial({ map: texConsignes(), roughness: 0.5 }), SV.x1, 6.9, 'W', 0.45, 0.62, 1.6, { ep: 0.01 });
  const co = groupe(ch, SV.x0, 10.5, 'E', 1.5);
  B(co, P.grisClair, 0.45, 0.6, 0.14, 0, 0, 0.07); B(co, P.plastiqueGris, 0.08, 0.02, 0.02, 0.15, 0, 0.145, { ombre: false });
  C.ajouterBoite(SV.x0, -10.27, SV.x0 + 0.15, -10.73, { y0: 1.2, y1: 1.8 });
}

// =====================================================================
//  LE LOCAL TECHNIQUE
// =====================================================================
function localTechnique(ch, P) {
  const { M, C } = ch;
  // le mur entre le local et les toilettes ; le plafond (la dalle brute) ; les plinthes qui manquent
  ch.mur({ de: [5.875, 15.975], a: [11.55, 15.975], mats: M.blanc, plinthes: ['S'] });
  ch.plafond(LT.x0, LT.y0, LT.x1, LT.y1, H_DALLE, 'platre');
  plinthe(ch, 'x', LT.y0, LT.x0, LT.x1, 1);
  plinthe(ch, 'y', LT.x0, LT.y0, LT.y1, 1);
  for (const [a0, a1] of [[LT.y0, 13.34], [14.36, LT.y1]]) plinthe(ch, 'y', LT.x1, a0, a1, -1);
  // ---- les deux baies serveurs (42 U) au mur nord, leurs diodes qui clignotent ----
  const face = new THREE.MeshStandardMaterial({ map: texBaie(), roughness: 0.6 });
  const diodes = texDiodes(); diodes.repeat.set(1, 0.5);
  for (const [x, ph] of [[8.85, 0], [9.5, 1]]) {
    const g = groupe(ch, x, 15.38, 'S');
    B(g, P.plastique, 0.6, 2.0, 1.0, 0, 1.0, 0);
    B(g, P.plastiqueGris, 0.58, 0.04, 0.98, 0, 2.02, 0, { ombre: false });
    plan(g, face, 0.5, 1.86, 0, 1.0, 0.502);
    // la porte perforée (une grille sombre devant) et sa poignée
    const grille = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 1.94), new THREE.MeshStandardMaterial({ color: 0x0b0b0c, roughness: 0.4, metalness: 0.5, transparent: true, opacity: 0.45, depthWrite: false }));
    grille.position.set(0, 1.0, 0.515); g.add(grille);
    B(g, P.chrome, 0.02, 0.16, 0.03, 0.24, 1.05, 0.52, { ombre: false });
    // les diodes : une texture à deux états, l'un sous l'autre, dont on change l'état de temps en temps
    const mat = new THREE.MeshBasicMaterial({ map: diodes.clone(), color: new THREE.Color(2.2, 2.2, 2.2), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
    mat.map.repeat.set(1, 0.5); mat.map.needsUpdate = true;
    const d = plan(g, mat, 0.46, 1.8, 0, 1.0, 0.505);
    nePasFusionner(d);
    d.onBeforeRender = () => { const t = Math.floor(performance.now() / 420 + ph * 1.7); mat.map.offset.y = (t % 3 === 0) ? 0.5 : 0; };
    C.ajouterBoite(x - 0.3, -14.88, x + 0.3, -15.88, { y1: 2.05 });
  }
  // l'onduleur, le tableau électrique (TGBT) au mur nord
  ch.boite(9.95, 15.18, 10.4, 15.88, 0, 0.92, P.plastique, { collision: true });
  ch.boite(10.0, 15.17, 10.35, 15.18, 0.75, 0.85, P.plastiqueGris, { ombre: false });
  maille(new THREE.CircleGeometry(0.008, 8), P.led, 10.3, 0.8, -15.168, 0, ch.decor, { ombre: false });
  const te = groupe(ch, 11.0, 15.9, 'S', 0.35);
  B(te, P.grisClair, 0.8, 1.7, 0.25, 0, 0.85, 0.125);
  plan(te, new THREE.MeshStandardMaterial({ map: texTableauElec(), roughness: 0.55 }), 0.76, 1.66, 0, 0.85, 0.2505);
  B(te, P.plastiqueGris, 0.03, 0.12, 0.03, 0.32, 0.85, 0.265, { ombre: false });
  C.ajouterBoite(10.6, -15.62, 11.4, -15.9, { y0: 0.35, y1: 2.05 });
  // les étagères métalliques du mur ouest : cartons d'archives, ramettes, vieux écrans, rouleaux de câble
  for (const [yc, gn] of [[13.05, 1], [14.65, 2]]) {
    const g = groupe(ch, 6.2, yc, 'E');
    const r = graine(gn * 19);
    for (const sx of [-0.73, 0.73]) for (const sz of [-0.22, 0.22]) B(g, P.metal, 0.03, 2.0, 0.03, sx, 1.0, sz);
    for (let i = 0; i < 5; i++) {
      const h = 0.08 + i * 0.46; B(g, P.grisClair, 1.48, 0.02, 0.46, 0, h, 0);
      if (i === 4) continue;
      let x = -0.68;
      while (x < 0.6) {
        const q = r(), w = q < 0.5 ? 0.33 : 0.22, hh = q < 0.5 ? 0.26 : 0.16;
        if (r() < 0.8) R(g, q < 0.5 ? P.carton : (q < 0.75 ? P.blancMat : P.bleu), w - 0.02, hh, 0.36, 0.008, x + w / 2, h + 0.01 + hh / 2, (r() - 0.5) * 0.04);
        x += w;
      }
    }
    C.ajouterBoite(5.95, -(yc - 0.76), 6.45, -(yc + 0.76), { y1: 2.0 });
  }
  // le climatiseur (unité murale) au-dessus des étagères
  const cl = groupe(ch, LT.x0, 14.0, 'E', 2.55);
  R(cl, P.blancMat, 0.9, 0.3, 0.22, 0.04, 0, 0.15, 0.11);
  B(cl, P.plastiqueGris, 0.8, 0.012, 0.06, 0, 0.02, 0.19, { ombre: false });
  maille(new THREE.CircleGeometry(0.006, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.4, 1.8, 2.4) }), 0.33, 0.2, 0.221, 0, cl, { ombre: false });
  // le photocopieur contre le mur sud (le dos du mur safran), ses ramettes
  const pc = groupe(ch, 7.2, 12.5, 'N');
  B(pc, P.grisClair, 0.62, 0.95, 0.66, 0, 0.475, 0);
  for (let i = 0; i < 3; i++) B(pc, P.plastiqueGris, 0.56, 0.006, 0.01, 0, 0.18 + i * 0.22, 0.333, { ombre: false });
  B(pc, P.blancMat, 0.6, 0.14, 0.6, 0, 1.02, -0.01);
  B(pc, P.plastique, 0.22, 0.06, 0.1, 0.18, 1.1, 0.27);
  maille(new THREE.PlaneGeometry(0.12, 0.05), P.ecrans[0], 0.18, 1.1, 0.321, 0, pc, { ombre: false });
  B(pc, P.plastiqueGris, 0.3, 0.012, 0.25, -0.38, 0.82, 0.02);
  C.ajouterBoite(6.88, -12.15, 7.75, -12.85, { y1: 1.15 });
  for (let i = 0; i < 4; i++) { const rm = groupe(ch, 8.1, 12.4, 'N', i * 0.055); rm.rotation.y += i * 0.05; B(rm, i % 2 ? P.blancMat : P.bleu, 0.3, 0.054, 0.21, 0, 0.027, 0); }
  // l'établi : plateau gris, portable ouvert (un terminal), écran, commutateur, boîte à outils ; la chaise
  table(ch, P, 8.6, 10.2, 12.85, 12.17, { voile: false, mat: P.grisClair });
  ecranPC(ch, P, 9.75, 12.35, 0.745, 'N', P.ecrans[1]);
  const lpt = groupe(ch, 9.05, 12.45, 'N', 0.745); lpt.rotation.y += 0.3;
  R(lpt, P.plastique, 0.34, 0.018, 0.23, 0.006, 0, 0.009, 0, { ombre: false });
  const lid = new THREE.Group(); lid.position.set(0, 0.018, -0.115); lid.rotation.x = -0.28; lpt.add(lid);
  B(lid, P.plastique, 0.34, 0.22, 0.008, 0, 0.11, 0); plan(lid, P.ecrans[1], 0.31, 0.19, 0, 0.113, 0.0045);
  const sw = groupe(ch, 8.75, 12.33, 'N', 0.745); B(sw, P.plastiqueGris, 0.44, 0.045, 0.24, 0, 0.0225, 0);
  for (let i = 0; i < 8; i++) { B(sw, P.plastique, 0.025, 0.018, 0.004, -0.16 + i * 0.045, 0.024, 0.121, { ombre: false }); B(sw, i % 3 ? P.bleu : P.jaune, 0.012, 0.012, 0.05, -0.16 + i * 0.045, 0.024, 0.145, { ombre: false }); }
  const bo = groupe(ch, 10.0, 12.55, 'N', 0.745); R(bo, P.rouge, 0.36, 0.16, 0.18, 0.02, 0, 0.08, 0); B(bo, P.noirMat, 0.2, 0.02, 0.03, 0, 0.175, 0);
  chaiseBureau(ch, P, 9.35, 13.28, 'S', { nom: 'la chaise de l’établi', sortie: [0, 0.65] });
  // les chemins de câbles à 2,85 m (tôle galvanisée), leurs tiges, les câbles qui descendent dans les baies
  const galva = new THREE.MeshStandardMaterial({ color: 0xb4b8bb, roughness: 0.45, metalness: 0.75 });
  const chemin = (x0, y0, x1, y1) => {
    const w = 0.3, h = 2.85;
    const [ax0, ay0, ax1, ay1] = x1 - x0 > y1 - y0 ? [x0, y0 - w / 2, x1, y0 + w / 2] : [x0 - w / 2, y0, x0 + w / 2, y1];
    ch.boite(ax0, ay0, ax1, ay1, h, h + 0.006, galva, { ombre: false });
    if (x1 - x0 > y1 - y0) { for (const y of [ay0, ay1 - 0.006]) ch.boite(ax0, y, ax1, y + 0.006, h, h + 0.06, galva, { ombre: false }); }
    else { for (const x of [ax0, ax1 - 0.006]) ch.boite(x, ay0, x + 0.006, ay1, h, h + 0.06, galva, { ombre: false }); }
    // les câbles posés dedans (bleu : réseau, jaune : fibre)
    const cx0 = (ax0 + ax1) / 2, cy0 = (ay0 + ay1) / 2;
    if (x1 - x0 > y1 - y0) { ch.boite(ax0, cy0 - 0.07, ax1, cy0 + 0.02, h + 0.006, h + 0.04, P.bleu, { ombre: false }); ch.boite(ax0, cy0 + 0.04, ax1, cy0 + 0.08, h + 0.006, h + 0.025, P.jaune, { ombre: false }); }
    else { ch.boite(cx0 - 0.07, ay0, cx0 + 0.02, ay1, h + 0.006, h + 0.04, P.bleu, { ombre: false }); ch.boite(cx0 + 0.04, ay0, cx0 + 0.08, ay1, h + 0.006, h + 0.025, P.jaune, { ombre: false }); }
    for (let t = 0.2; t < 1; t += 0.33) { const x = ax0 + (ax1 - ax0) * t, y = ay0 + (ay1 - ay0) * t; ch.boite(x - 0.005, y - 0.005, x + 0.005, y + 0.005, h + 0.006, H_DALLE, P.metal, { ombre: false }); }
  };
  chemin(8.5, 15.4, 11.3, 15.4);
  chemin(11.15, 12.4, 11.15, 15.55);
  for (const x of [8.85, 9.5]) for (const [dx, dy, m] of [[-0.03, 0, P.bleu], [0.0, 0.03, P.bleu], [0.03, -0.01, P.jaune], [0.0, -0.03, P.bleu]]) {
    CY(ch.decor, m, 0.009, 0.86, x + dx, 2.43, -(15.4 + dy), 6, { ombre: false });
  }
  // deux réglettes LED suspendues : des LAMPES (type tube)
  for (const x of [7.4, 9.9]) {
    const g = groupe(ch, x, 13.95, 'E', 2.92);
    B(g, P.blancMat, 0.08, 0.06, 1.25, 0, 0, 0);
    maille(boiteM(0.06, 0.005, 1.2), P.led, 0, -0.032, 0, 0, g, { ombre: false, recoit: false });
    for (const z of [-0.45, 0.45]) CY(g, P.metal, 0.002, H_DALLE - 2.95, 0, (H_DALLE - 2.95) / 2 + 0.03, z, 4, { ombre: false });
    g.traverse((m) => { m.userData.horsAOSol = true; m.castShadow = false; });
    ch.lampes.push({ x, z: -13.95, h: 2.9, zone: 'local', type: 'tube', force: 1.0, cuireForce: 1.05 });
  }
  // l'extincteur CO2 près de la porte
  const ex = groupe(ch, LT.x1 - 0.1, 15.25, 'W');
  CY(ex, P.rouge, 0.07, 0.55, 0, 1.2, 0, 16); CY(ex, P.noirMat, 0.035, 0.1, 0, 1.52, 0, 10);
  const cor = CY(ex, P.noirMat, 0.03, 0.18, 0.08, 1.35, 0.0, 10); cor.rotation.z = 0.5;
  C.ajouterCercle(LT.x1 - 0.1, -15.25, 0.09, { y0: 0.9, y1: 1.6 });
  // la plaque « Local technique » côté C01
  cadre(ch, P, new THREE.MeshStandardMaterial({ map: texPlaque('Local technique', 'eclair'), roughness: 0.4 }), 11.7, 13.05, 'E', 0.17, 0.17, 1.6, { ep: 0.006 });
}

// =====================================================================
//  LES TOILETTES
// =====================================================================
// La porte du C01 (y = 19,05) ouvre sur un sas carrelé : en face, le plan de trois vasques sous un grand miroir
// rétroéclairé (mur sud) ; au fond (mur nord), trois cabines aux cloisons grises et aux portes safran, fermées, et la
// cabine accessible (PMR), sa porte ouverte vers l'extérieur.
function toilettes(ch, P) {
  const { M, C } = ch;
  // les murs : nord (le fond), ouest (la suite du mur du C05) ; le plafond
  ch.mur({ de: [5.8, 20.675], a: [11.55, 20.675], mats: M.blanc });
  ch.mur({ de: [5.875, 18.6], a: [5.875, 20.75], mats: M.blanc });
  ch.plafond(WC.x0, WC.y0, WC.x1, WC.y1, 2.5, 'platre');
  // ---- la faïence (jusqu'à 2 m, sur les quatre murs, la porte laissée libre) et son listel d'aluminium ----
  const F = texFaience();
  const faience = new THREE.MeshStandardMaterial({ map: F.map, roughness: 0.16 });
  avecRelief(faience, F.nor, 0.6);
  const ep = 0.012, hF = 2.0;
  const pans = [
    [WC.x0, WC.y0, WC.x0 + ep, WC.y1], [WC.x0, WC.y1 - ep, WC.x1, WC.y1],
    [WC.x1 - ep, WC.y0, WC.x1, 18.54], [WC.x1 - ep, 19.56, WC.x1, WC.y1], [WC.x0, WC.y0, WC.x1, WC.y0 + ep],
  ];
  for (const [x0, y0, x1, y1] of pans) {
    ch.boite(x0, y0, x1, y1, 0, hF, faience, { ombre: false });
    ch.boite(x0, y0, x1, y1, hF, hF + 0.012, P.chrome, { ombre: false });
  }
  // ---- le sol de grès 30 x 30 : un calque posé sur le carrelage, qui reprend la lumière et l'ombre cuites du sol ----
  solToilettes(ch);
  ch.boite(11.5, 18.58, 11.7, 19.52, 0, 0.005, P.inox, { ombre: false });       // la barre de seuil
  // ---- les spots, la bouche de ventilation ----
  for (const [x, y] of [[6.9, 19.45], [9.2, 19.85], [7.6, 17.3], [9.9, 17.3]]) ch.spot(x, y, 2.5, 'wc');
  const vmc = groupe(ch, 8.8, 18.55, 'S', 2.5); CY(vmc, P.blancMat, 0.085, 0.02, 0, -0.01, 0, 20, { ombre: false }); CY(vmc, P.plastiqueGris, 0.05, 0.022, 0, -0.011, 0, 16, { ombre: false });
  vmc.traverse((m) => { m.userData.horsAOSol = true; });
  // ---- LES CABINES ----
  const hB = 0.15, hH = 2.0, e = 0.025;
  // les cloisons (gris), surélevées de 15 cm sur des pieds inox
  const cloison = (x, y0, y1) => {
    ch.boite(x - e / 2, y0, x + e / 2, y1, hB, hH, P.grisHPL);
    for (const y of [y0 + 0.1, y1 - 0.1]) ch.boite(x - 0.012, y - 0.012, x + 0.012, y + 0.012, 0, hB, P.inox, { ombre: false });
  };
  cloison(7.85, 18.3, WC.y1); cloison(8.75, 19.05, WC.y1); cloison(9.65, 19.05, WC.y1); cloison(10.55, 19.05, WC.y1);
  // les façades : pilastres gris, portes safran fermées (voyant vert « libre »), la lisse inox en haut
  const yF = 19.05;
  for (const [a, b] of [[7.85, 8.75], [8.75, 9.65], [9.65, 10.55]]) {
    ch.boite(a, yF - e, a + 0.15, yF, hB, hH, P.grisHPL); ch.boite(b - 0.15, yF - e, b, yF, hB, hH, P.grisHPL);
    ch.boite(a + 0.155, yF - e, b - 0.155, yF, hB, hH - 0.02, P.safranHPL);
    const p = groupe(ch, b - 0.22, yF - e, 'S', 1.0);
    CY(p, P.inox, 0.022, 0.012, 0, 0, 0.006, 16, { ombre: false }).rotation.x = Math.PI / 2;
    maille(new THREE.CircleGeometry(0.012, 12), P.vert, 0, 0, 0.0125, 0, p, { ombre: false });
    B(p, P.inox, 0.1, 0.018, 0.018, 0.04, -0.09, 0.03, { ombre: false });
    for (const h of [0.35, 1.7]) ch.boite(a + 0.15, yF - e - 0.01, a + 0.19, yF - e, h, h + 0.1, P.inox, { ombre: false });
    // dedans : la cuvette suspendue et sa plaque de commande (à peine visibles par le haut et le bas des portes)
    wcSuspendu(ch, P, (a + b) / 2, WC.y1, 'S');
  }
  ch.boite(7.85, yF - e - 0.03, 10.55, yF - e, hH - 0.03, hH, P.inox, { ombre: false });
  C.ajouterBoite(7.84, -(yF - e - 0.02), 10.56, -WC.y1, { y1: 1.98 });
  // LA CABINE PMR (x 5,95-7,85, y 18,3-20,6) : façade grise, porte safran de 90 cm ouverte vers le sas, barres d'appui,
  // cuvette, petit lavabo et miroir — on peut y entrer
  const yP = 18.3;
  ch.boite(WC.x0, yP - e, 6.85, yP, hB, hH, P.grisHPL); ch.boite(7.75, yP - e, 7.85, yP, hB, hH, P.grisHPL);
  ch.boite(WC.x0, yP - e - 0.03, 7.85, yP - e, hH - 0.03, hH, P.inox, { ombre: false });
  for (const x of [6.05, 6.75, 7.8]) ch.boite(x - 0.012, yP - 0.025, x + 0.012, yP, 0, hB, P.inox, { ombre: false });
  const pv = groupe(ch, 7.75, yP - e / 2, 'S', hB); pv.rotation.y = 1.4;           // le gond à l'est, ouverte de 80°
  B(pv, P.safranHPL, 0.89, hH - hB - 0.02, e, -0.445, (hH - hB - 0.02) / 2, 0);
  plan(pv, new THREE.MeshStandardMaterial({ map: texPMR(), roughness: 0.4 }), 0.12, 0.12, -0.45, 1.45 - hB, e / 2 + 0.002);
  B(pv, P.inox, 0.03, 0.03, 0.3, -0.8, 1.0 - hB, 0.0, { ombre: false });
  C.ajouterBoite(WC.x0, -(yP - e - 0.01), 6.85, -(yP + 0.01), { y1: 1.98 });
  C.ajouterBoite(7.74, -(yP - e - 0.01), 7.86, -(yP + 0.01), { y1: 1.98 });
  C.ajouterBoiteOrientee(7.75 - Math.cos(1.4) * 0.445, -(yP - e / 2) + Math.sin(1.4) * 0.445, 0.445, 0.02, -1.4, { y1: 1.98 });
  wcSuspendu(ch, P, 6.45, WC.y1, 'S');
  C.ajouterCercle(6.45, -(WC.y1 - 0.3), 0.24, { y1: 0.5 });
  const ba = groupe(ch, WC.x0, 20.0, 'E', 0.8);                          // les barres d'appui (mur ouest)
  const barre = CY(ba, P.inox, 0.017, 0.7, 0, 0, 0.07, 10, { ombre: false }); barre.rotation.z = Math.PI / 2;
  for (const s of [-1, 1]) { const p = CY(ba, P.inox, 0.017, 0.07, s * 0.33, 0, 0.035, 8, { ombre: false }); p.rotation.x = Math.PI / 2; }
  const rel = groupe(ch, 6.82, WC.y1 - 0.012, 'S', 0.8); B(rel, P.inox, 0.03, 0.03, 0.75, 0, 0, 0.37, { ombre: false }); B(rel, P.inox, 0.06, 0.12, 0.04, 0, 0, 0.0, { ombre: false });
  // le lave-mains : une petite vasque posée sur sa tablette (devant la faïence : z local 0,012), robinet mural au-dessus
  const lvP = groupe(ch, 7.5, WC.y1, 'S', 0.8);
  B(lvP, P.ceramique, 0.42, 0.04, 0.3, 0, 0, 0.162);
  vasque(lvP, P, 0, 0.02, 0.172, 0.72);
  robinetMural(lvP, P, 0, 0.17, 0.012, 0.13);
  // (la boîte de projection : toute la pièce, pas la cabine — le point de prise de vue est dans le sas, hors de la
  // cabine ; projeté sur la cabine, le reflet allait chercher les portes safran là où il n'y a que la façade grise)
  miroir(ch, P, 7.5, WC.y1 - 0.012, 1.35, 0.45, 0.6, 'S', WC);
  C.ajouterBoite(7.3, -(WC.y1 - 0.32), 7.72, -WC.y1, { y1: 0.85 });
  // ---- LES VASQUES : plan de quartz anthracite, trois vasques à poser, robinets, grand miroir rétroéclairé ----
  const yV = WC.y0 + ep;
  ch.boite(7.3, yV, 10.4, yV + 0.52, 0.82, 0.86, P.quartz);
  ch.boite(7.3, yV + 0.48, 10.4, yV + 0.52, 0.66, 0.82, P.quartz);
  for (const x of [7.32, 10.38]) ch.boite(x - 0.02, yV + 0.02, x + 0.02, yV + 0.46, 0.0, 0.82, P.quartz);
  C.ajouterBoite(7.28, -yV, 10.42, -(yV + 0.53), { y1: 0.9 });
  for (const x of [7.85, 8.85, 9.85]) {
    const g = groupe(ch, x, yV, 'N', 0.86);
    vasque(g, P, 0, 0, 0.29);
    mitigeur(g, P, 0, 0, 0.07);
    const sav = groupe(ch, x + 0.36, yV + 0.08, 'N', 0.86); CY(sav, P.blancMat, 0.03, 0.15, 0, 0.075, 0, 12); CY(sav, P.robinet, 0.01, 0.04, 0, 0.17, 0.0, 8);
  }
  // (la glace peinte des petites qualités : en face, les trois portes safran et, à gauche, l'ouverture de la cabine PMR ;
  // vues d'1,60 m à un pas du miroir, les cabines tiennent entre 19 et 76 % de sa hauteur)
  const reflet = { x0: 7.32, x1: 10.38, bas: 0.19, haut: 0.76, portes: [[8.005, 8.595], [8.905, 9.495], [9.805, 10.395]], jours: [[7.32, 7.75]] };
  const mir = miroir(ch, P, 8.85, yV, 1.475, 3.06, 0.91, 'N', WC, { reel: true, sonde: ZONES.find((z) => z.id === 'wc').env, reflet });
  maille(boiteM(3.0, 0.012, 0.012), P.led, 0, 0.49, 0.012, 0, mir, { ombre: false, recoit: false });
  // ---- le sèche-mains, la poubelle, le distributeur d'essuie-mains, le panneau « sol glissant » ----
  const sm = groupe(ch, WC.x1 - ep, 16.85, 'W', 1.05);
  R(sm, P.blancMat, 0.3, 0.32, 0.17, 0.04, 0, 0.16, 0.085); B(sm, P.inox, 0.12, 0.03, 0.06, 0, -0.005, 0.11, { ombre: false });
  C.ajouterBoite(WC.x1 - 0.2, -16.7, WC.x1, -17.0, { y0: 1.0, y1: 1.4 });
  corbeille(ch, P, 10.85, WC.y0 + 0.25, P.inox, 0.15, 0.6);
  C.ajouterCercle(10.85, -(WC.y0 + 0.25), 0.17, { y1: 0.6 });
  const pn = groupe(ch, 9.1, 17.75, 'S'); pn.rotation.y = 0.5;
  const plq = new THREE.MeshStandardMaterial({ map: texSolGlissant(), roughness: 0.5, side: THREE.DoubleSide });
  for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.6), plq); p.position.set(0, 0.29, s * 0.1); p.rotation.x = s * -0.32; p.castShadow = true; pn.add(p); }
  C.ajouterCercle(9.1, -17.75, 0.2, { y1: 0.62 });
}
// UN MIROIR contre un mur, regardant vers `face` : cadre d'aluminium, glace de w x h centrée à la hauteur `h0`.
//   - le VRAI miroir (`reel`, sur PC) : un miroir planaire (Reflector de three, comme le reflet du sol mouillé de
//     js/fx.js) — la scène est re-rendue depuis la caméra symétrique, Haythem s'y voit. Il ne coûte que quand il est à
//     l'écran ; posé à la racine de la scène et marqué `dynamique`, il est caché pendant les prises de la carte
//     d'environnement et la cuisson de l'ombre au sol (il y redessinerait la scène au milieu d'une autre prise). La
//     passe des normales de l'occlusion (GTAO, `overrideMaterial`) ne le refait pas : celui de l'image est déjà fait.
//   - sinon (téléphone, petit miroir) : la carte d'environnement de la pièce, PROJETÉE SUR SA BOÎTE (`boite`, en plan,
//     du sol au plafond) — le rayon réfléchi est prolongé jusqu'aux murs de la pièce puis relu depuis le point de prise
//     de vue : les reflets tombent à leur place au lieu de flotter à l'infini.
//   - et sans carte d'environnement du tout (qualités basse et moyenne, téléphones : js/fx.js `env: false`), une glace
//     peinte : un reflet flou, clair en haut — une glace métallique n'aurait rien à refléter et sortirait noire.
// C'est le CADRE qui choisit, à chaque image où il est à l'écran : le vrai miroir seulement avec la carte
// d'environnement (haute qualité et au-delà, donc une machine qui peut payer le second rendu), sinon la glace.
// Et le vrai miroir seulement quand Haythem est DANS la pièce (`sonde` : le point de prise de vue de la pièce, que
// js/ecole_lumieres.js reprend quand il y entre) : sans ce garde-fou, il refaisait toute la scène à chaque image où il
// était dans le champ — depuis le couloir C01, le C05 ou l'escalier, à travers les murs. Le cadre ignore la caméra du
// reflet lui-même (il y est vu aussi) : seule la vraie caméra décide.
function miroir(ch, P, x, y, h0, w, h, face, boite, { reel = false, sonde = null, reflet = null } = {}) {
  const g = groupe(ch, x, y, face, h0);
  const cadre = B(g, P.alu, w + 0.04, h + 0.04, 0.02, 0, 0, 0.01, { ombre: false });
  nePasFusionner(cadre);
  const matBoite = matMiroirBoite(ch, boite), peinte = matGlacePeinte(reflet);
  const glace = plan(g, matBoite, w, h, 0, 0, 0.0205);
  nePasFusionner(glace);
  let vrai = null;
  cadre.onBeforeRender = (renderer, scene, camera) => {
    if (vrai && camera === vrai.camera) return;
    const env = !!scene.environment, Q = scene.userData.pointEnv;
    if (Q) matBoite.__sonde.set(Q.x, Q.y, Q.z);
    const ici = !sonde || (!!Q && Math.hypot(Q.x - sonde.x, Q.y - sonde.y, Q.z - sonde.z) < 0.1);
    if (vrai) vrai.visible = env && ici;
    glace.visible = !(vrai && vrai.visible);
    glace.material = env ? matBoite : peinte;
  };
  if (reel && !TELEPHONE) {
    const res = 768;
    const m = new Reflector(new THREE.PlaneGeometry(w, h), { textureWidth: res, textureHeight: Math.round(res * 0.5625), clipBias: 0.003, multisample: 0 });
    m.material.uniforms.color.value.setRGB(0.47, 0.47, 0.47);   // (gris moyen : la glace rend ~94 % de la lumière)
    const [fx, fz] = DIR[face];
    m.position.set(x + fx * 0.0205, h0, -y + fz * 0.0205); m.rotation.y = ROT[face];
    m.userData.dynamique = true; m.userData.horsAOSol = true; m.name = 'miroir';
    const refleter = m.onBeforeRender;
    m.onBeforeRender = (renderer, scene, camera, ...rest) => {
      if (scene.overrideMaterial) return;
      const ombres = renderer.shadowMap.autoUpdate, mat = scene.matrixWorldAutoUpdate;
      renderer.shadowMap.autoUpdate = false; scene.matrixWorldAutoUpdate = false;
      try { refleter.call(m, renderer, scene, camera, ...rest); } finally { renderer.shadowMap.autoUpdate = ombres; scene.matrixWorldAutoUpdate = mat; }
    };
    ch.scene.add(m);
    vrai = m; m.visible = false; glace.visible = true;
  }
  return g;
}
// LA GLACE PEINTE (sans carte d'environnement) : un dégradé gris perle, plus clair en haut (le plafond éclairé), deux
// traînées de lumière en biais ; un peu d'émissif, pour qu'elle reste claire comme une vraie glace. `reflet` : ce que la
// glace renvoie, peint flou — `cabines` (le grand miroir des vasques : en face, les portes safran entre leurs montants
// gris, la lisse inox, le carrelage dessous), sinon rien de précis. Sans ce reflet, au téléphone, le grand miroir se
// lisait comme un tableau blanc.
const _glaces = new Map();
function matGlacePeinte(reflet = null) {
  const cle = reflet ? JSON.stringify(reflet) : '-';
  if (_glaces.has(cle)) return _glaces.get(cle);
  const t = canvasTex(reflet ? 256 : 128, reflet ? 80 : 128, (g, w, h) => {
    const d = g.createLinearGradient(0, 0, 0, h);
    d.addColorStop(0, '#e9ecec'); d.addColorStop(0.45, '#c5cacb'); d.addColorStop(1, '#9ea4a6');
    g.fillStyle = d; g.fillRect(0, 0, w, h);
    if (reflet) {
      // (u croît vers -x du plan : la glace regarde le nord, son +x local est le -x du plan ; v = 0 en haut du canvas)
      const U = (x) => (reflet.x1 - x) / (reflet.x1 - reflet.x0) * w, v0 = h * (1 - reflet.haut), v1 = h * (1 - reflet.bas);
      g.filter = 'blur(2.5px)';
      g.fillStyle = '#c9c7bf'; g.fillRect(0, v1, w, h - v1);                         // le carrelage, en bas
      g.fillStyle = '#e4e1d8'; g.fillRect(0, 0, w, v0);                              // le mur et le plafond, en haut
      g.fillStyle = '#8f9193'; g.fillRect(0, v0, w, v1 - v0);                        // les montants gris
      g.fillStyle = '#d99c2c';
      for (const [a, b] of reflet.portes) g.fillRect(U(b), v0 + 2, U(a) - U(b), v1 - v0 - 2);
      g.fillStyle = '#e6e4dd';
      for (const [a, b] of reflet.jours || []) g.fillRect(U(b), v0 + 2, U(a) - U(b), v1 - v0 - 2);   // une ouverture : du clair
      g.fillStyle = '#dfe3e6'; g.fillRect(0, v0 - 2, w, 3);                         // la lisse inox
      g.filter = 'none';
      // un voile clair (la glace n'est pas une photo) et les deux traînées de lumière
      g.fillStyle = 'rgba(236,238,238,0.28)'; g.fillRect(0, 0, w, h);
    }
    g.fillStyle = 'rgba(255,255,255,0.22)';
    const k = w / 128;
    for (const [x0, l] of [[18, 22], [58, 9]]) { g.beginPath(); g.moveTo(x0 * k, 0); g.lineTo((x0 + l) * k, 0); g.lineTo((x0 + l - 40) * k, h); g.lineTo((x0 - 40) * k, h); g.closePath(); g.fill(); }
  }, null, false, 2);
  const m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.18, metalness: 0.1, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.32 });
  _glaces.set(cle, m);
  return m;
}
// le matériau de glace à carte d'environnement projetée sur la boîte de la pièce (plan -> monde : z = -y)
function matMiroirBoite(ch, b) {
  const m = new THREE.MeshStandardMaterial({ color: 0xf4f6f6, roughness: 0.03, metalness: 1 });
  const u = { uBoiteMin: { value: new THREE.Vector3(b.x0, 0, -b.y1) }, uBoiteMax: { value: new THREE.Vector3(b.x1, H_DALLE, -b.y0) }, uSonde: { value: new THREE.Vector3(0, 1.5, 0) } };
  m.__sonde = u.uSonde.value;
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, u);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vMondeMiroir;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvMondeMiroir = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;');
    const chunk = THREE.ShaderChunk.envmap_physical_pars_fragment.replace('reflectVec = inverseTransformDirection( reflectVec, viewMatrix );',
      'reflectVec = inverseTransformDirection( reflectVec, viewMatrix );\n'
      + '{ vec3 f1 = ( uBoiteMax - vMondeMiroir ) / reflectVec, f2 = ( uBoiteMin - vMondeMiroir ) / reflectVec, fm = max( f1, f2 );\n'
      + '  float d = min( min( fm.x, fm.y ), fm.z ); reflectVec = normalize( vMondeMiroir + reflectVec * d - uSonde ); }');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vMondeMiroir;\nuniform vec3 uBoiteMin;\nuniform vec3 uBoiteMax;\nuniform vec3 uSonde;')
      .replace('#include <envmap_physical_pars_fragment>', chunk);
  };
  m.customProgramCacheKey = () => 'iris-miroir-boite-1';
  return m;
}
// LA CUVETTE SUSPENDUE (posée contre le mur `y` face à `face`) et sa plaque de commande
function wcSuspendu(ch, P, x, y, face) {
  const g = groupe(ch, x, y, face, 0);
  R(g, P.ceramique, 0.36, 0.32, 0.54, 0.12, 0, 0.3, 0.29);
  R(g, P.blancMat, 0.37, 0.025, 0.46, 0.02, 0, 0.47, 0.31);
  B(g, P.chrome, 0.24, 0.16, 0.012, 0, 1.05, 0.018, { ombre: false });
  const rp = groupe(ch, x + 0.32, y - 0.25, face, 0.72); CY(rp, P.blancMat, 0.055, 0.11, 0, 0, 0, 14).rotation.z = Math.PI / 2;
}
// UNE VASQUE À POSER (céramique blanche, profil tourné), dans le groupe `g`, en (x, z), à la hauteur `y` ; `s` l'échelle
// (1 : 40 cm de diamètre)
let _vasque = null;
function vasque(g, P, x, y, z, s = 1) {
  if (!_vasque) {
    const pts = [[0, 0], [0.12, 0.0], [0.17, 0.03], [0.19, 0.08], [0.2, 0.13], [0.19, 0.13], [0.175, 0.085], [0.155, 0.045], [0.1, 0.025], [0, 0.025]].map(([a, b]) => new THREE.Vector2(a, b));
    _vasque = new THREE.LatheGeometry(pts, 32);
  }
  const m = maille(_vasque, P.ceramique, x, y, z, 0, g); m.scale.setScalar(s);
  maille(new THREE.CircleGeometry(0.025 * s, 14), P.robinet, x, y + 0.027 * s, z, 0, g, { ombre: false }).rotation.x = -Math.PI / 2;
  return m;
}
// LE MITIGEUR HAUT « col de cygne » posé sur le plan, dans le groupe `g` (dont +z regarde l'usager), en (x, y, z) : la
// rosace, le fût, le bec en demi-anneau qui retombe au-dessus de la vasque, l'aérateur, la manette en biais
function mitigeur(g, P, x, y, z) {
  const r = 0.055, ht = 0.24;
  CY(g, P.robinet, 0.025, 0.012, x, y + 0.006, z, 18, { ombre: false });
  CY(g, P.robinet, 0.016, ht, x, y + ht / 2, z, 14);
  const bec = maille(new THREE.TorusGeometry(r, 0.011, 8, 18, Math.PI), P.robinet, x, y + ht, z + r, 0, g);
  bec.rotation.y = Math.PI / 2;                              // (le demi-anneau dans le plan y-z : du fût vers l'usager)
  CY(g, P.robinet, 0.013, 0.03, x, y + ht - 0.012, z + 2 * r, 12, { ombre: false });
  const man = CY(g, P.robinet, 0.007, 0.09, x + 0.03, y + ht - 0.07, z - 0.012, 8, { ombre: false });
  man.rotation.z = -0.9; man.rotation.x = -0.3;
}
// LE ROBINET MURAL (lave-mains) : rosace au mur, bec droit qui avance de `L`, aérateur, manette sur le dessus
function robinetMural(g, P, x, y, z, L) {
  CY(g, P.robinet, 0.026, 0.016, x, y, z + 0.008, 18, { ombre: false }).rotation.x = Math.PI / 2;
  CY(g, P.robinet, 0.012, L, x, y, z + L / 2, 12).rotation.x = Math.PI / 2;
  CY(g, P.robinet, 0.012, 0.025, x, y - 0.012, z + L - 0.008, 12, { ombre: false });
  const man = CY(g, P.robinet, 0.006, 0.05, x, y + 0.025, z + 0.05, 8, { ombre: false }); man.rotation.x = 1.0;
}
// LE SOL DES TOILETTES : un plan de grès posé à 3 mm au-dessus du carrelage. Il porte, sur sa seconde couche d'UV, la
// même lumière cuite et la même ombre cuite que le carrelage (js/ecole_lumieres.js, js/kit_decor.js) : la carte les
// pose sur le matériau du carrelage APRÈS les crochets, alors on les reprend au moment de dessiner (onBeforeRender),
// dès qu'elles existent ou changent. Les UV1 suivent le repère du sol : le plan invisible « sol (repère) » de la carte.
function solToilettes(ch) {
  const rep = ch.scene.getObjectByName('sol (repère)');
  const W = rep.geometry.parameters.width, L = rep.geometry.parameters.height;
  const rx0 = rep.position.x - W / 2, ry0 = -rep.position.z - L / 2;
  const S = texSolWC();
  const mat = new THREE.MeshStandardMaterial({ map: S.map, roughness: 0.55 });
  avecRelief(mat, S.nor, 0.5);
  const pos = [], uv = [], uv1 = [];
  for (const [x, y] of [[WC.x0, WC.y0], [WC.x1, WC.y0], [WC.x1, WC.y1], [WC.x0, WC.y1]]) {
    pos.push(x, 0.003, -y); uv.push(x - WC.x0, y - WC.y0); uv1.push((x - rx0) / W, (y - ry0) / L);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute('uv1', new THREE.Float32BufferAttribute(uv1, 2));
  g.setIndex([0, 1, 2, 0, 2, 3]);
  const m = new THREE.Mesh(g, mat); m.receiveShadow = true; m.name = 'grès des toilettes';
  nePasFusionner(m);
  const sol = ch.M.sol;
  m.onBeforeRender = () => {
    if (mat.lightMap !== sol.lightMap || mat.aoMap !== sol.aoMap) {
      mat.lightMap = sol.lightMap; mat.lightMapIntensity = sol.lightMapIntensity;
      mat.aoMap = sol.aoMap; mat.aoMapIntensity = sol.aoMapIntensity;
      mat.needsUpdate = true;
    }
  };
  ch.scene.add(m);
}

// =====================================================================
//  LE CROCHET
// =====================================================================
export function poserPieces(ch) {
  const P = matieres(ch.M);
  salleA(ch, P);
  bureauB(ch, P);
  couloirService(ch, P);
  localTechnique(ch, P);
  toilettes(ch, P);
  return { zones: ZONES };
}
