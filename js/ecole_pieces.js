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
//   LE COULOIR DE SERVICE      x 0-1,6      y 0-8,95   derrière la porte blanche « Sortie » du passage : il mène à la
//        porte de secours de la façade (barre anti-panique) ; bacs roulants, chariot de ménage, escabeau, cartons,
//        extincteur, goulotte. (09/10 : la vidéo du sous-sol montre que la porte grise du hall ouest ouvre sur le palier de
//        l'escalier du -1, js/ecole_soussol.js : le couloir s'arrête au mur de ce palier, y = 9,1)
//   (09/10, photo 23 : le mur est du C05 porte DEUX portes de toilettes, femmes puis hommes, et sa porte bleue du fond
//   est celle d'une salle de cours ; la bande entre le C05 et le C01, x 5,9-11,6, est redistribuée en conséquence)
//   LES TOILETTES FEMMES       x 5,95-8,85  y 12,15-15,3 (porte du C05, y 13,75) trois cabines aux portes safran le
//        long du mur est, deux vasques et leur miroir au mur ouest, au nord de la porte
//   LES TOILETTES HOMMES       x 5,95-8,85  y 15,45-18,6 (porte du C05, y 16,85) deux cabines, trois urinoirs et leurs
//        écrans au mur nord, deux vasques et leur miroir ; dans les deux : faïence blanche, grès 30 x 30, sèche-mains
//   LES TOILETTES PMR          x 9,0-11,55  y 17,55-20,6 (porte « toilettes PMR » du C01, y 19,05 — sa plaque montre un
//        fauteuil roulant, photo 01) cuvette, barres d'appui, lave-mains accessible, miroir
//   LE LOCAL TECHNIQUE         x 9,0-11,55  y 12,15-17,4 (porte « local » du couloir C01, ce qui reste de la bande)
//        baies serveurs aux diodes qui clignotent, onduleur, tableau électrique, étagères, établi, climatiseur, chemins
//        de câbles ; pas de faux plafond (la dalle brute à 3,25 m) et des réglettes LED suspendues
//   LA SALLE DAVID CLARK (B 0.2)  x 1,75-8,85 y 18,75-24,35, derrière la porte bleue du fond du C05 (sa plaque, photo 23)
//        une salle de cours : trois rangs de tables pour deux tournés vers le tableau blanc et l'écran du mur est,
//        vidéoprojecteur, bureau de l'enseignant ; trois fenêtres au nord sur une COUR éclairée par le jour (le
//        bâtiment, imaginé, dépasse ici son fond de 20,75)
//
// CE QUE LE MODULE REÇOIT : le chantier `ch` de js/carte_ecole.js (coordonnées du PLAN : x le long de la façade, y vers
// le fond ; dans le jeu X = x, Z = -y) — ch.mur, ch.porte, ch.plafond, ch.boite, ch.spot, ch.opale, ch.sortie, ch.C (le
// monde solide), ch.M (les matières), ch.lampes, ch.sieges. CE QU'IL REND : { zones } — les zones de lumière de ses
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
import { maille, boiteM, fenetreFacade } from './ecole_portes.js';
import { canvasTex, normalesDepuisGrille, avecRelief, nePasFusionner } from './kit_decor.js';
import { texAffiche, texConsignes, texPictoExtincteur, jourDehors } from './ecole_matieres.js';

const H_DALLE = 3.25;                       // le dessous de la dalle du 1er étage
// ---- les pièces, en plan (le nu intérieur des murs) ----
const SA = { x0: 4.9, x1: 9.9, y0: 0, y1: 8.925 };          // la salle A
const BB = { x0: 10.05, x1: 13.2, y0: 0, y1: 4.74 };        // le bureau B
const SV = { x0: 0, x1: 1.6, y0: 0, y1: 8.95 };             // le couloir de service (jusqu'au palier du sous-sol)
// (09/10 : la bande entre le C05 et le C01 — x 5,95-11,55, y 12,15-20,6 — était un local et des toilettes ; elle est
// redistribuée d'après la photo 23 : une cloison nord-sud en x 8,925, les toilettes du C05 à l'ouest, le local et les
// toilettes PMR du C01 à l'est)
const LT = { x0: 9.0, x1: 11.55, y0: 12.15, y1: 17.4 };     // le local technique (ce qui reste)
const WF = { x0: 5.95, x1: 8.85, y0: 12.15, y1: 15.3 };     // les toilettes femmes (porte du C05, y 13,75)
const WH = { x0: 5.95, x1: 8.85, y0: 15.45, y1: 18.6 };     // les toilettes hommes (porte du C05, y 16,85)
const PM = { x0: 9.0, x1: 11.55, y0: 17.55, y1: 20.6 };     // les toilettes PMR (porte du C01, y 19,05)
const DC = { x0: 1.75, x1: 8.85, y0: 18.75, y1: 24.35 };    // la salle David Clark, B 0.2 (porte bleue du C05)

// LES ZONES DE LUMIÈRE (js/ecole_lumieres.js) : rectangles en MONDE [x0, z0, x1, z1, hauteur mini], le point de prise de
// vue de la carte d'environnement (au-dessus des meubles, au milieu de la pièce)
const zone = (id, R, env) => ({ id, rects: [[R.x0, -R.y1, R.x1, -R.y0, -1]], voisines: [], env });
const ZONES = [
  zone('salleA', SA, { x: 7.4, y: 1.6, z: -4.0 }),
  zone('bureauB', BB, { x: 11.7, y: 1.55, z: -3.0 }),
  zone('service', SV, { x: 0.8, y: 1.5, z: -6.8 }),
  zone('local', LT, { x: 10.2, y: 1.7, z: -14.9 }),
  // (relecture du 09/10 : les deux toilettes du C05 prennent leur vue HAUT, à 2,20 m, et loin des portes safran des
  // cabines — à 50 cm d'elles, à hauteur d'homme, la carte n'était qu'un mur safran : faïence, peinture, embrasure et
  // jusqu'au mur du C05 vu par la porte sortaient orangés. Femmes : dans le sas, côté porte ; hommes : devant les urinoirs)
  zone('wcF', WF, { x: 6.4, y: 2.2, z: -12.95 }),
  zone('wcH', WH, { x: 6.95, y: 2.2, z: -17.85 }),
  zone('pmr', PM, { x: 10.3, y: 1.5, z: -18.9 }),
  zone('salleDC', DC, { x: 5.3, y: 1.6, z: -21.6 }),
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
    coque: std({ color: 0x3a3b3e, roughness: 0.5 }),                           // chaises de classe (salle David Clark)
    coqueJaune: std({ color: 0xe2aa2c, roughness: 0.45 }),
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
// LA PLAQUE DES TOILETTES (photos 23 et 01, 09/10) : noire, une petite mention en haut, le pictogramme blanc dans un cadre
// carré au trait, « Toilettes » dessous ; `picto` : 'femme' | 'homme' | 'pmr' (la personne debout et le fauteuil)
function texPlaqueWC(picto) {
  return canvasTex(96, 128, (g, w) => {
    g.fillStyle = '#2a2826'; g.fillRect(0, 0, w, 128);
    g.fillStyle = '#d8d6d2'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    g.font = '600 7px "Segoe UI", Arial, sans-serif'; g.fillText('RDC', w / 2, 13);
    g.strokeStyle = '#f2f2f2'; g.lineWidth = 2.5; g.strokeRect(24, 22, 48, 60);
    g.fillStyle = '#f2f2f2'; g.lineCap = 'round';
    const tete = (x, y) => { g.beginPath(); g.arc(x, y, 4.3, 0, 7); g.fill(); };
    const trait = (pts, ep = 3.6) => { g.lineWidth = ep; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); };
    if (picto === 'femme') {
      tete(48, 32);
      g.beginPath(); g.moveTo(44, 38); g.lineTo(52, 38); g.lineTo(58, 62); g.lineTo(38, 62); g.closePath(); g.fill();
      trait([[44.5, 62], [44.5, 76]]); trait([[51.5, 62], [51.5, 76]]); trait([[43, 41], [38.5, 55]], 3); trait([[53, 41], [57.5, 55]], 3);
    } else if (picto === 'homme') {
      tete(48, 32);
      g.fillRect(42, 38, 12, 23); trait([[44.5, 60], [44.5, 76]], 4.4); trait([[51.5, 60], [51.5, 76]], 4.4);
      trait([[40, 41], [39, 58]], 3.4); trait([[56, 41], [57, 58]], 3.4);
    } else {
      tete(36, 32); g.fillRect(32, 38, 8, 20); trait([[34, 57], [34, 76]], 3.4); trait([[38.5, 57], [38.5, 76]], 3.4);
      tete(58, 38); trait([[57, 44], [57, 58], [65, 58], [67, 70]], 3.4); trait([[57, 49], [64, 51]], 3);
      g.lineWidth = 2.6; g.beginPath(); g.arc(56, 66, 9, 0.3, 4.6); g.stroke();
    }
    g.font = '600 11px "Segoe UI", Arial, sans-serif'; g.fillText('Toilettes', w / 2, 104);
  }, null, false, 2);
}
// LA PLAQUE DE LA SALLE (photo 23, à droite de la porte bleue) : noire, trois lignes blanches
function texPlaqueSalle() {
  return canvasTex(192, 112, (g, w, h) => {
    g.fillStyle = '#242322'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#f2f2f2'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    g.font = '600 19px "Segoe UI", Arial, sans-serif'; g.fillText('Salle', w / 2, 30);
    g.font = '500 21px "Segoe UI", Arial, sans-serif'; g.fillText('David Clark', w / 2, 62);
    g.font = '600 19px "Segoe UI", Arial, sans-serif'; g.fillText('B 0.2', w / 2, 94);
  }, null, false, 4);
}
// L'AFFICHE DES PORTES DES TOILETTES (photo 23) : « DES PROTECTIONS HYGIÉNIQUES GRATUITES / À VOTRE DISPOSITION » sur
// un bandeau orange, une illustration (deux étudiants devant le distributeur, dans un couloir clair), le logo iris en bas
function texAfficheProtections() {
  return canvasTex(256, 362, (g, w, h) => {
    g.fillStyle = '#fbfaf6'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffc148'; g.fillRect(12, 12, w - 24, 112);
    g.fillStyle = '#3b2a18'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    g.font = '800 23px "Segoe UI", Arial, sans-serif';
    g.fillText('DES PROTECTIONS', w / 2, 42); g.fillText('HYGIÉNIQUES', w / 2, 68); g.fillText('GRATUITES', w / 2, 94);
    g.font = '700 11px "Segoe UI", Arial, sans-serif'; g.fillText('À VOTRE DISPOSITION', w / 2, 113);
    g.fillStyle = '#7a736c'; g.font = '500 8px "Segoe UI", Arial, sans-serif'; g.fillText('Un geste de respect, d’égalité et de bien-être', w / 2, 137);
    // l'illustration : le couloir, sa fenêtre, le distributeur au mur
    g.fillStyle = '#e4e9ee'; g.fillRect(14, 146, w - 28, 176);
    g.fillStyle = '#cdd8e2'; g.fillRect(24, 156, 70, 90); g.strokeStyle = '#f5f7f9'; g.lineWidth = 3; g.strokeRect(24, 156, 70, 90); g.beginPath(); g.moveTo(59, 156); g.lineTo(59, 246); g.stroke();
    g.fillStyle = '#d3d7db'; g.fillRect(14, 292, w - 28, 30);
    g.fillStyle = '#f4f4f2'; g.fillRect(186, 176, 44, 58); g.strokeStyle = '#9aa2aa'; g.lineWidth = 2; g.strokeRect(186, 176, 44, 58);
    g.fillStyle = '#2c2c30'; for (const x of [198, 218]) { g.beginPath(); g.arc(x, 196, 7, 0, 7); g.fill(); }
    // l'étudiante (cheveux bruns, haut orange, sac) et l'étudiant (chemise mauve) qui appuie sur le distributeur
    const corps = (x, haut, bas, peau, cheveux, long) => {
      g.fillStyle = bas; g.fillRect(x - 15, 262, 30, 50);
      g.fillStyle = haut; g.beginPath(); g.moveTo(x - 20, 266); g.lineTo(x - 17, 222); g.quadraticCurveTo(x, 210, x + 17, 222); g.lineTo(x + 20, 266); g.closePath(); g.fill();
      g.fillStyle = peau; g.beginPath(); g.ellipse(x, 196, 12, 15, 0, 0, 7); g.fill(); g.fillRect(x - 4, 208, 8, 8);
      g.fillStyle = cheveux; g.beginPath(); g.ellipse(x, 186, 13, 8, 0, Math.PI, 0); g.fill();
      if (long) { g.fillRect(x - 14, 186, 6, 36); g.fillRect(x + 8, 186, 6, 34); }
    };
    corps(88, '#e9873a', '#3c4a63', '#e8b48f', '#4a2d1c', true);
    g.fillStyle = '#b36b2c'; g.fillRect(64, 228, 12, 30);
    corps(146, '#a79bc8', '#2e3445', '#c98d68', '#22160f', false);
    g.strokeStyle = '#a79bc8'; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(160, 228); g.lineTo(190, 204); g.stroke();
    // le pied : le logo iris sur son pavé sombre
    g.fillStyle = '#ffc148'; g.fillRect(12, 330, w - 24, 4);
    g.fillStyle = '#1d1d1f'; g.fillRect(w / 2 - 26, 336, 52, 20);
    g.fillStyle = '#ffffff'; g.font = '600 15px "Century Gothic", "Avenir", "Segoe UI", sans-serif'; g.fillText('iris', w / 2, 351);
    g.fillStyle = '#f08a24'; g.fillRect(w / 2 - 12, 340, 3, 2);
  }, null, false, 4);
}
// LA SECONDE AFFICHE (photo 23) : blanche, de petits personnages et des pictogrammes en bandes, un titre — illisible
// sur la photo : les bons gestes de la vie commune
function texAffichePersonnages() {
  return canvasTex(256, 362, (g, w, h) => {
    g.fillStyle = '#fdfdfb'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#1e1e22'; g.textAlign = 'center'; g.font = '800 20px "Segoe UI", Arial, sans-serif'; g.fillText('LES BONS GESTES', w / 2, 36);
    g.fillStyle = '#d0262d'; g.fillRect(w / 2 - 40, 44, 80, 4);
    const r = graine(733);
    for (let j = 0; j < 4; j++) for (let i = 0; i < 3; i++) {
      const x = 46 + i * 82, y = 92 + j * 66, c = ['#1e1e22', '#d0262d', '#5b6470'][(i + j) % 3];
      g.fillStyle = c; g.beginPath(); g.arc(x, y - 18, 7, 0, 7); g.fill();
      g.fillRect(x - 7, y - 10, 14, 20); g.fillRect(x - 6, y + 10, 4, 14); g.fillRect(x + 2, y + 10, 4, 14);
      g.save(); g.translate(x + 9, y - 6); g.rotate((r() - 0.5) * 1.6); g.fillRect(0, -2, 13, 4); g.restore();
      g.fillStyle = '#9aa0a6'; g.fillRect(x - 26, y + 30, 52, 3);
    }
    g.fillStyle = '#1d1d1f'; g.fillRect(w / 2 - 22, h - 26, 44, 16);
    g.fillStyle = '#ffffff'; g.font = '600 12px "Century Gothic", "Avenir", "Segoe UI", sans-serif'; g.fillText('iris', w / 2, h - 14);
  }, null, false, 4);
}
// LE TABLEAU BLANC DE LA SALLE DAVID CLARK : le cours de réseaux du jour — la pile TCP/IP et le principe de bout en
// bout (David D. Clark, l'architecte d'Internet qui donne son nom à la salle)
function texTableauReseau() {
  return canvasTex(512, 256, (g, w, h) => {
    g.fillStyle = '#fbfbf9'; g.fillRect(0, 0, w, h);
    const r = graine(919);
    for (let k = 0; k < 10; k++) { g.fillStyle = `rgba(120,130,150,${0.02 + r() * 0.03})`; g.beginPath(); g.ellipse(r() * w, r() * h, 30 + r() * 70, 6 + r() * 14, r() * 0.4, 0, 7); g.fill(); }
    const main = '"Segoe Print", "Bradley Hand", "Comic Sans MS", cursive';
    g.fillStyle = '#1d4fa3'; g.font = `700 24px ${main}`; g.fillText('Le modèle TCP/IP', 22, 34);
    g.strokeStyle = '#1d4fa3'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(20, 41); g.lineTo(220, 40); g.stroke();
    ['Application', 'Transport', 'Internet', 'Accès réseau'].forEach((t, i) => {
      g.strokeStyle = '#1e1e1e'; g.lineWidth = 2.5; g.strokeRect(30, 58 + i * 44, 150, 34);
      g.fillStyle = '#1e1e1e'; g.font = `600 16px ${main}`; g.fillText(t, 42, 81 + i * 44);
      g.fillStyle = '#c62828'; g.font = `500 12px ${main}`; g.fillText(['HTTP, DNS', 'TCP / UDP', 'IP', 'Ethernet, Wi-Fi'][i], 192, 80 + i * 44);
    });
    // le principe de bout en bout : deux hôtes, un réseau « bête » au milieu
    g.strokeStyle = '#1e1e1e'; g.lineWidth = 2.5;
    for (const x of [318, 470]) { g.strokeRect(x - 18, 88, 36, 26); g.beginPath(); g.moveTo(x - 10, 120); g.lineTo(x + 10, 120); g.stroke(); }
    g.beginPath(); g.moveTo(336, 101); g.lineTo(452, 101); g.stroke();
    for (const x of [370, 418]) { g.beginPath(); g.arc(x, 101, 10, 0, 7); g.stroke(); }
    g.fillStyle = '#1d4fa3'; g.font = `600 15px ${main}`; g.fillText('bout en bout', 342, 74);
    g.fillStyle = '#1e1e1e'; g.font = `500 13px ${main}`; g.fillText("l'intelligence aux extrémités", 300, 150); g.fillText('le réseau transporte', 300, 170);
    g.strokeStyle = '#2e7d32'; g.lineWidth = 2.2; g.strokeRect(292, 132, 200, 48);
  }, null, false, 8);
}
// L'IMAGE PROJETÉE de la salle David Clark : bordure noire de la toile, une diapositive du cours de réseaux
function texDiapoReseau() {
  return canvasTex(512, 320, (g, w, h) => {
    g.fillStyle = '#121212'; g.fillRect(0, 0, w, h);
    const m = 10, W = w - 2 * m, H = h - 2 * m;
    g.fillStyle = '#fbfaf6'; g.fillRect(m, m, W, H);
    g.fillStyle = '#2f6fb0'; g.fillRect(m, m, W, 46);
    g.fillStyle = '#ffffff'; g.font = '700 24px "Segoe UI", Arial, sans-serif'; g.fillText('Le principe de bout en bout', m + 18, m + 31);
    g.fillStyle = '#ffffff'; g.font = '600 18px "Century Gothic", "Avenir", "Segoe UI", sans-serif'; g.fillText('iris', w - m - 44, m + 30);
    g.fillStyle = '#555'; g.font = '500 13px "Segoe UI", Arial, sans-serif'; g.fillText('BTS SIO · Réseaux · séance 3', m + 18, m + 70);
    // le schéma : hôte A, trois routeurs, hôte B
    g.strokeStyle = '#3a3a3a'; g.lineWidth = 3; g.beginPath(); g.moveTo(m + 70, 170); g.lineTo(w - m - 70, 170); g.stroke();
    for (const [x, t] of [[m + 70, 'hôte A'], [w - m - 70, 'hôte B']]) { g.fillStyle = '#e9a01c'; g.fillRect(x - 30, 145, 60, 50); g.fillStyle = '#333'; g.font = '600 13px "Segoe UI", Arial, sans-serif'; g.textAlign = 'center'; g.fillText(t, x, 215); g.textAlign = 'left'; }
    for (const x of [190, 256, 322]) { g.fillStyle = '#2f6fb0'; g.beginPath(); g.arc(x, 170, 18, 0, 7); g.fill(); }
    g.fillStyle = '#333'; g.font = '500 13px "Segoe UI", Arial, sans-serif'; g.textAlign = 'center'; g.fillText('routeurs : ils ne font que transmettre', w / 2, 128); g.textAlign = 'left';
    for (const [i, t] of ['Contrôle des erreurs : dans les hôtes (TCP)', 'Le réseau reste simple et robuste'].entries()) {
      g.fillStyle = '#e9a01c'; g.beginPath(); g.arc(m + 26, 252 + i * 26, 4, 0, 7); g.fill();
      g.fillStyle = '#333'; g.font = '500 14px "Segoe UI", Arial, sans-serif'; g.fillText(t, m + 38, 257 + i * 26);
    }
  }, null, false, 8);
}
// LA COUR derrière la salle David Clark : des dalles de béton de 50 cm (tuile de 2 m), et la travée d'une façade
// d'immeuble enduite (2,40 x 3,00 m : une fenêtre à cadre blanc, son appui, l'enduit un peu passé)
function texDallesCour() {
  return canvasTex(256, 256, (g, w, h) => {
    const r = graine(4321), c = w / 4;
    for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) {
      const t = (r() - 0.5) * 14;
      g.fillStyle = `rgb(${150 + t},${148 + t},${142 + t})`; g.fillRect(i * c, j * c, c, c);
      for (let k = 0; k < 90; k++) { const v = 130 + (r() - 0.5) * 60; g.fillStyle = `rgba(${v},${v},${v - 4},0.35)`; g.fillRect(i * c + r() * c, j * c + r() * c, 1.5, 1.5); }
    }
    g.fillStyle = '#6f6c66';
    for (let i = 0; i <= 4; i++) { g.fillRect(i * c - 1, 0, 2, h); g.fillRect(0, i * c - 1, w, 2); }
  }, [0.5, 0.5], false, 8);
}
function texFacadeCour() {
  const t = canvasTex(192, 240, (g, w, h) => {
    const mx = w / 2.4, my = h / 3.0, r = graine(2468);
    g.fillStyle = '#ddd5c6'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 900; k++) { const v = 205 + (r() - 0.5) * 30; g.fillStyle = `rgba(${v},${v - 6},${v - 16},0.3)`; g.fillRect(r() * w, r() * h, 2, 2); }
    // (v = 0 en haut du canvas : le haut de la travée)
    const fx = 0.62 * mx, fw = 1.16 * mx, fy = h - 2.32 * my, fh = 1.56 * my;
    g.fillStyle = '#f2f1ec'; g.fillRect(fx - 4, fy - 4, fw + 8, fh + 8);
    const d = g.createLinearGradient(0, fy, 0, fy + fh); d.addColorStop(0, '#6e7f8f'); d.addColorStop(0.5, '#3f4a55'); d.addColorStop(1, '#2c333b');
    g.fillStyle = d; g.fillRect(fx + 3, fy + 3, fw - 6, fh - 6);
    g.fillStyle = '#f2f1ec'; g.fillRect(fx + fw / 2 - 2, fy, 4, fh); g.fillRect(fx, fy + fh * 0.32, fw, 3);
    g.fillStyle = 'rgba(255,255,255,0.18)'; g.beginPath(); g.moveTo(fx + 8, fy + 8); g.lineTo(fx + 28, fy + 8); g.lineTo(fx + 8, fy + 40); g.fill();
    g.fillStyle = '#bcb4a5'; g.fillRect(fx - 8, fy + fh + 4, fw + 16, 6);
    g.fillStyle = 'rgba(90,80,64,0.12)'; g.fillRect(fx, fy + fh + 10, fw, 24);
  }, [1 / 2.4, 1 / 3.0], false, 8);
  t.offset.set(0, 0.5);
  return t;
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
// Derrière la porte blanche « Sortie » du passage : un couloir de 1,6 m le long du mitoyen ouest qui mène à la porte de
// secours de la façade (travée 1). Fermé au nord par le mur du palier du sous-sol (la porte grise du hall ouest ouvre sur
// ce palier : js/ecole_soussol.js) ; derrière, au-dessus du rampant de l'escalier, la réserve reste close.
function couloirService(ch, P) {
  const { M, C } = ch;
  // le mitoyen ouest (30 cm), le mur du fond (le mur sud du palier du sous-sol : plinthe de bois de ce côté-ci, peinte
  // de l'autre), et celui de la réserve, au-dessus du pied du rampant (sans porte : on ne la voit de nulle part)
  ch.mur({ de: [-0.15, 0], a: [-0.15, 9.1], ep: 0.3, mats: M.blanc, plinthes: ['E'] });
  ch.mur({ de: [-0.3, 9.025], a: [1.675, 9.025], mats: M.blanc, plinthes: ['S'] });
  ch.mur({ de: [-0.3, 13.675], a: [1.675, 13.675], mats: M.blanc });
  // les plinthes du mur du passage et du hall, côté couloir (la porte laissée libre)
  for (const [a0, a1] of [[0, 3.65], [4.65, SV.y1]]) plinthe(ch, 'y', SV.x1, a0, a1, -1);
  // le plafond de plâtre, les hublots, le bloc de sortie au-dessus de la porte de secours
  ch.plafond(SV.x0, SV.y0, SV.x1, SV.y1, 2.45, 'platre');
  for (const y of [1.9, 4.9, 7.6]) ch.opale(0.8, y, 2.45, 'service', { r: 0.15 });
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
  // les cartons empilés (09/10 : redescendus entre les bacs et la porte du passage — le nord du couloir est le palier)
  [[0.3, 2.95, 0, 0.55, 0.45, 0.4], [0.33, 3.5, 0, 0.5, 0.45, 0.35], [0.31, 3.2, 0.4, 0.45, 0.4, 0.3]].forEach(([x, y, h0, w, d, h]) => {
    const g = groupe(ch, x, y, 'E', h0); g.rotation.y += (x * 7) % 0.2 - 0.1; R(g, P.carton, d, h, w, 0.01, 0, h / 2, 0);
  });
  C.ajouterBoite(0.03, -2.68, 0.6, -3.76, { y1: 0.75 });
  // l'extincteur et son pictogramme, la goulotte électrique, le plan d'évacuation, le coffret électrique
  const ex = groupe(ch, 0.11, 4.9, 'E');
  CY(ex, P.rouge, 0.075, 0.48, 0, 1.2, 0, 16); CY(ex, P.noirMat, 0.04, 0.08, 0, 1.48, 0, 10);
  C.ajouterCercle(0.11, -4.9, 0.09, { y0: 0.9, y1: 1.6 });
  cadre(ch, P, new THREE.MeshStandardMaterial({ map: texPictoExtincteur(), roughness: 0.6 }), SV.x0, 4.9, 'E', 0.16, 0.16, 1.85, { ep: 0.004 });
  ch.boite(SV.x0, SV.y0, SV.x0 + 0.06, SV.y1, 2.2, 2.28, P.blancMat, { ombre: false });
  cadre(ch, P, new THREE.MeshStandardMaterial({ map: texConsignes(), roughness: 0.5 }), SV.x1, 6.9, 'W', 0.45, 0.62, 1.6, { ep: 0.01 });
  // (le coffret, redescendu au-dessus du chariot)
  const co = groupe(ch, SV.x0, 5.5, 'E', 1.5);
  B(co, P.grisClair, 0.45, 0.6, 0.14, 0, 0, 0.07); B(co, P.plastiqueGris, 0.08, 0.02, 0.02, 0.15, 0, 0.145, { ombre: false });
  C.ajouterBoite(SV.x0, -5.27, SV.x0 + 0.15, -5.73, { y0: 1.2, y1: 1.8 });
}

// =====================================================================
//  LA BANDE ENTRE LE C05 ET LE C01 : ses cloisons (09/10)
// =====================================================================
// La photo 23 montre deux portes de toilettes dans le mur est du C05 (femmes au sud, hommes au nord) ; la porte du C01
// en y 19,05 garde les toilettes PMR (sa plaque, photo 01) et celle en y 13,85 le local. Une cloison nord-sud en x 8,925
// partage la bande : à l'ouest les toilettes du C05, l'une derrière l'autre ; à l'est le local, puis les toilettes PMR.
// Au nord, cette cloison devient le mur est de la salle David Clark.
function cloisonsBande(ch) {
  const B0 = ch.M.blanc;
  ch.mur({ de: [8.925, 12.15], a: [8.925, 17.475], mats: B0, plinthes: ['E'] });
  ch.mur({ de: [8.925, 17.475], a: [8.925, 18.6], mats: B0 });
  ch.mur({ de: [8.925, 18.6], a: [8.925, 24.5], mats: B0, plinthes: ['W'] });
  ch.mur({ de: [5.875, 15.375], a: [8.925, 15.375], mats: B0 });                         // femmes / hommes
  ch.mur({ de: [8.925, 17.475], a: [11.55, 17.475], mats: B0, plinthes: ['S'] });        // local / PMR
  ch.mur({ de: [8.925, 20.675], a: [11.55, 20.675], mats: B0 });                         // le fond des toilettes PMR
  ch.mur({ de: [5.95, 18.675], a: [8.925, 18.675], mats: B0, plinthes: ['N'] });         // hommes / salle David Clark
}

// =====================================================================
//  LE LOCAL TECHNIQUE (ce qui reste : x 9,0-11,55, y 12,15-17,4)
// =====================================================================
// Sa porte du C01 (y 13,85, gonds au nord) s'ouvre dedans : rien devant elle (x 10,6-11,55, y 13,3-14,4).
function localTechnique(ch, P) {
  const { M, C } = ch;
  // le plafond (la dalle brute) ; les plinthes qui manquent (le dos du mur safran, le mur du C01)
  ch.plafond(LT.x0, LT.y0, LT.x1, LT.y1, H_DALLE, 'platre');
  plinthe(ch, 'x', LT.y0, LT.x0, LT.x1, 1);
  for (const [a0, a1] of [[LT.y0, 13.34], [14.36, LT.y1]]) plinthe(ch, 'y', LT.x1, a0, a1, -1);
  // ---- les deux baies serveurs (42 U) au mur nord, leurs diodes qui clignotent ----
  const face = new THREE.MeshStandardMaterial({ map: texBaie(), roughness: 0.6 });
  const diodes = texDiodes(); diodes.repeat.set(1, 0.5);
  for (const [x, ph] of [[9.45, 0], [10.1, 1]]) {
    const g = groupe(ch, x, 16.88, 'S');
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
    C.ajouterBoite(x - 0.3, -16.38, x + 0.3, -17.38, { y1: 2.05 });
  }
  // l'onduleur à côté des baies ; le tableau électrique (TGBT) au mur du C01, au nord de la porte
  ch.boite(10.55, 16.7, 11.0, 17.39, 0, 0.92, P.plastique, { collision: true });
  ch.boite(10.6, 16.69, 10.95, 16.7, 0.75, 0.85, P.plastiqueGris, { ombre: false });
  maille(new THREE.CircleGeometry(0.008, 8), P.led, 10.9, 0.8, -16.688, 0, ch.decor, { ombre: false });
  const te = groupe(ch, LT.x1, 15.75, 'W', 0.35);
  B(te, P.grisClair, 0.8, 1.7, 0.25, 0, 0.85, 0.125);
  plan(te, new THREE.MeshStandardMaterial({ map: texTableauElec(), roughness: 0.55 }), 0.76, 1.66, 0, 0.85, 0.2505);
  B(te, P.plastiqueGris, 0.03, 0.12, 0.03, 0.32, 0.85, 0.265, { ombre: false });
  C.ajouterBoite(LT.x1 - 0.28, -15.35, LT.x1, -16.15, { y0: 0.35, y1: 2.05 });
  // les étagères métalliques du mur ouest : cartons d'archives, ramettes, vieux écrans, rouleaux de câble
  for (const [yc, gn] of [[13.0, 1], [14.6, 2]]) {
    const g = groupe(ch, LT.x0 + 0.25, yc, 'E');
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
    C.ajouterBoite(LT.x0, -(yc - 0.76), LT.x0 + 0.5, -(yc + 0.76), { y1: 2.0 });
  }
  // le climatiseur (unité murale) au-dessus des étagères
  const cl = groupe(ch, LT.x0, 14.2, 'E', 2.55);
  R(cl, P.blancMat, 0.9, 0.3, 0.22, 0.04, 0, 0.15, 0.11);
  B(cl, P.plastiqueGris, 0.8, 0.012, 0.06, 0, 0.02, 0.19, { ombre: false });
  maille(new THREE.CircleGeometry(0.006, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.4, 1.8, 2.4) }), 0.33, 0.2, 0.221, 0, cl, { ombre: false });
  // l'établi contre le mur sud (le dos du mur safran) : plateau gris, portable ouvert (un terminal), écran, commutateur,
  // boîte à outils ; la chaise
  table(ch, P, 9.6, 11.2, 12.85, 12.17, { voile: false, mat: P.grisClair });
  ecranPC(ch, P, 10.75, 12.35, 0.745, 'N', P.ecrans[1]);
  const lpt = groupe(ch, 10.1, 12.45, 'N', 0.745); lpt.rotation.y += 0.3;
  R(lpt, P.plastique, 0.34, 0.018, 0.23, 0.006, 0, 0.009, 0, { ombre: false });
  const lid = new THREE.Group(); lid.position.set(0, 0.018, -0.115); lid.rotation.x = -0.28; lpt.add(lid);
  B(lid, P.plastique, 0.34, 0.22, 0.008, 0, 0.11, 0); plan(lid, P.ecrans[1], 0.31, 0.19, 0, 0.113, 0.0045);
  const sw = groupe(ch, 9.76, 12.33, 'N', 0.745); B(sw, P.plastiqueGris, 0.3, 0.045, 0.24, 0, 0.0225, 0);
  for (let i = 0; i < 6; i++) { B(sw, P.plastique, 0.025, 0.018, 0.004, -0.11 + i * 0.045, 0.024, 0.121, { ombre: false }); B(sw, i % 3 ? P.bleu : P.jaune, 0.012, 0.012, 0.05, -0.11 + i * 0.045, 0.024, 0.145, { ombre: false }); }
  const bo = groupe(ch, 11.0, 12.55, 'N', 0.745); R(bo, P.rouge, 0.3, 0.16, 0.18, 0.02, 0, 0.08, 0); B(bo, P.noirMat, 0.18, 0.02, 0.03, 0, 0.175, 0);
  chaiseBureau(ch, P, 10.35, 13.25, 'S', { nom: 'la chaise de l’établi', sortie: [0, 0.65] });
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
  chemin(9.15, 16.88, 11.3, 16.88);
  chemin(11.2, 12.4, 11.2, 16.73);
  for (const x of [9.45, 10.1]) for (const [dx, dy, m] of [[-0.03, 0, P.bleu], [0.0, 0.03, P.bleu], [0.03, -0.01, P.jaune], [0.0, -0.03, P.bleu]]) {
    CY(ch.decor, m, 0.009, 0.86, x + dx, 2.43, -(16.88 + dy), 6, { ombre: false });
  }
  // deux réglettes LED suspendues, dans la longueur du local : des LAMPES (type tube)
  for (const y of [13.6, 16.0]) {
    const g = groupe(ch, 10.25, y, 'S', 2.92);
    B(g, P.blancMat, 0.08, 0.06, 1.25, 0, 0, 0);
    maille(boiteM(0.06, 0.005, 1.2), P.led, 0, -0.032, 0, 0, g, { ombre: false, recoit: false });
    for (const z of [-0.45, 0.45]) CY(g, P.metal, 0.002, H_DALLE - 2.95, 0, (H_DALLE - 2.95) / 2 + 0.03, z, 4, { ombre: false });
    g.traverse((m) => { m.userData.horsAOSol = true; m.castShadow = false; });
    ch.lampes.push({ x: 10.25, z: -y, h: 2.9, zone: 'local', type: 'tube', force: 1.0, cuireForce: 1.05 });
  }
  // l'extincteur CO2 près de la porte
  const ex = groupe(ch, LT.x1 - 0.1, 14.9, 'W');
  CY(ex, P.rouge, 0.07, 0.55, 0, 1.2, 0, 16); CY(ex, P.noirMat, 0.035, 0.1, 0, 1.52, 0, 10);
  const cor = CY(ex, P.noirMat, 0.03, 0.18, 0.08, 1.35, 0.0, 10); cor.rotation.z = 0.5;
  C.ajouterCercle(LT.x1 - 0.1, -14.9, 0.09, { y0: 0.9, y1: 1.6 });
  // la plaque « Local technique » côté C01
  cadre(ch, P, new THREE.MeshStandardMaterial({ map: texPlaque('Local technique', 'eclair'), roughness: 0.4 }), 11.7, 13.05, 'E', 0.17, 0.17, 1.6, { ep: 0.006 });
}

// =====================================================================
//  LES TOILETTES
// =====================================================================
// Trois pièces : femmes et hommes par le C05 (photo 23), PMR par le C01 (photo 01). Faïence blanche jusqu'à 2 m et son
// listel d'aluminium, sol de grès 30 x 30, plafond de plâtre à 2,50, spots ; les cabines aux cloisons grises et aux
// portes safran (le safran de la salle d'attente), fermées ; les vasques à poser sur un plan de quartz anthracite et leur
// grand miroir (un vrai miroir sur PC, quand Haythem est dans la pièce). Chaque pièce a sa zone, sans voisines.
let _faience = null;
function matFaience() {
  if (!_faience) { const F = texFaience(); _faience = new THREE.MeshStandardMaterial({ map: F.map, roughness: 0.16 }); avecRelief(_faience, F.nor, 0.6); }
  return _faience;
}
// LA FAÏENCE sur les quatre murs d'une pièce `R`, les portes laissées libres : `trous` = [[mur ('N'|'S'|'E'|'W'), a0, a1]]
// (a0-a1 le long du mur, en plan)
function faience(ch, P, R, trous = []) {
  const mat = matFaience(), ep = 0.012, hF = 2.0;
  for (const m of ['S', 'N', 'W', 'E']) {
    let segs = [m === 'S' || m === 'N' ? [R.x0, R.x1] : [R.y0, R.y1]];
    for (const [t, t0, t1] of trous) if (t === m) segs = segs.flatMap(([u, v]) => [[u, Math.min(v, t0)], [Math.max(u, t1), v]].filter(([p, q]) => q - p > 0.01));
    for (const [u, v] of segs) {
      const r = m === 'S' ? [u, R.y0, v, R.y0 + ep] : m === 'N' ? [u, R.y1 - ep, v, R.y1] : m === 'W' ? [R.x0, u, R.x0 + ep, v] : [R.x1 - ep, u, R.x1, v];
      ch.boite(r[0], r[1], r[2], r[3], 0, hF, mat, { ombre: false });
      ch.boite(r[0], r[1], r[2], r[3], hF, hF + 0.012, P.chrome, { ombre: false });
    }
  }
}
// UNE RANGÉE DE CABINES dont les façades sont alignées sur x = `xF` (elles regardent l'ouest) et le fond sur le mur x =
// `xB` : `bords` = les y des cloisons, du sud au nord ; `fermer` : les bouts qui ne sont pas un mur (une cloison pleine).
// Pilastres gris, portes safran fermées (gonds au sud, voyant vert « libre » et poignée au nord), lisse inox en haut ;
// dedans, la cuvette suspendue (à peine visible par le haut et le bas des portes).
function cabines(ch, P, xF, xB, bords, { fermer = [] } = {}) {
  const hB = 0.15, hH = 2.0, e = 0.025;
  const cloison = (y) => {
    ch.boite(xF, y - e / 2, xB, y + e / 2, hB, hH, P.grisHPL);
    for (const x of [xF + 0.1, xB - 0.1]) ch.boite(x - 0.012, y - 0.012, x + 0.012, y + 0.012, 0, hB, P.inox, { ombre: false });
  };
  for (let i = 1; i < bords.length - 1; i++) cloison(bords[i]);
  for (const y of fermer) cloison(y);
  for (let i = 0; i < bords.length - 1; i++) {
    const a = bords[i], b = bords[i + 1];
    ch.boite(xF, a, xF + e, a + 0.15, hB, hH, P.grisHPL); ch.boite(xF, b - 0.15, xF + e, b, hB, hH, P.grisHPL);
    ch.boite(xF, a + 0.155, xF + e, b - 0.155, hB, hH - 0.02, P.safranHPL);
    const p = groupe(ch, xF, b - 0.22, 'W', 1.0);
    CY(p, P.inox, 0.022, 0.012, 0, 0, 0.006, 16, { ombre: false }).rotation.x = Math.PI / 2;
    maille(new THREE.CircleGeometry(0.012, 12), P.vert, 0, 0, 0.0125, 0, p, { ombre: false });
    B(p, P.inox, 0.1, 0.018, 0.018, -0.04, -0.09, 0.03, { ombre: false });
    for (const h of [0.35, 1.7]) ch.boite(xF - 0.01, a + 0.15, xF, a + 0.19, h, h + 0.1, P.inox, { ombre: false });
    wcSuspendu(ch, P, xB, (a + b) / 2, 'W');
  }
  ch.boite(xF - 0.03, bords[0], xF, bords[bords.length - 1], hH - 0.03, hH, P.inox, { ombre: false });
  ch.C.ajouterBoite(xF - 0.02, -bords[0], xB, -bords[bords.length - 1], { y1: 1.98 });
}
// LE PLAN DE DEUX VASQUES contre le mur OUEST d'une pièce `R`, de y0 à y1 (au nord de la porte : on les voit en entrant),
// son grand miroir rétroéclairé ; `idZone` : la zone de la pièce (le vrai miroir ne se calcule que quand Haythem y est),
// `portes` : les portes safran d'en face, que la glace peinte des petites qualités reflète
function lavabos(ch, P, R, y0, y1, idZone, portes) {
  const x = R.x0 + 0.012;
  ch.boite(x, y0, x + 0.52, y1, 0.82, 0.86, P.quartz);
  ch.boite(x + 0.48, y0, x + 0.52, y1, 0.66, 0.82, P.quartz);
  for (const y of [y0 + 0.02, y1 - 0.02]) ch.boite(x + 0.02, y - 0.02, x + 0.46, y + 0.02, 0, 0.82, P.quartz);
  ch.C.ajouterBoite(x - 0.01, -y0, x + 0.53, -y1, { y1: 0.9 });
  for (const y of [y0 + (y1 - y0) * 0.27, y0 + (y1 - y0) * 0.73]) {
    const g = groupe(ch, x, y, 'E', 0.86);
    vasque(g, P, 0, 0, 0.29);
    mitigeur(g, P, 0, 0, 0.07);
  }
  const sav = groupe(ch, x + 0.08, (y0 + y1) / 2, 'E', 0.86); CY(sav, P.blancMat, 0.03, 0.15, 0, 0.075, 0, 12); CY(sav, P.robinet, 0.01, 0.04, 0, 0.17, 0.02, 8);
  // (la glace peinte : u croît avec le y du plan — la glace regarde l'est ; on lui passe des y changés de signe)
  const w = y1 - y0 - 0.06;
  const reflet = { x0: -(y1 - 0.03), x1: -(y0 + 0.03), bas: 0.16, haut: 0.8, portes: portes.map(([a, b]) => [-b, -a]) };
  const mir = miroir(ch, P, x, (y0 + y1) / 2, 1.5, w, 0.9, 'E', R, { reel: true, sonde: ZONES.find((z) => z.id === idZone).env, reflet });
  maille(boiteM(w - 0.06, 0.012, 0.012), P.led, 0, 0.47, 0.012, 0, mir, { ombre: false, recoit: false });
}
// LE SÈCHE-MAINS mural (à la face `face` d'un mur, en x, y) et la poubelle inox
function secheMains(ch, P, x, y, face) {
  const g = groupe(ch, x, y, face, 1.05);
  R(g, P.blancMat, 0.3, 0.32, 0.17, 0.04, 0, 0.16, 0.085); B(g, P.inox, 0.12, 0.03, 0.06, 0, -0.005, 0.11, { ombre: false });
  const [fx, fz] = DIR[face];
  ch.C.ajouterBoite(Math.min(x, x + fx * 0.2) - Math.abs(fz) * 0.15, Math.min(-y, -y + fz * 0.2) - Math.abs(fx) * 0.15, Math.max(x, x + fx * 0.2) + Math.abs(fz) * 0.15, Math.max(-y, -y + fz * 0.2) + Math.abs(fx) * 0.15, { y0: 1.0, y1: 1.4 });
}
function poubelleWC(ch, P, x, y) {
  corbeille(ch, P, x, y, P.inox, 0.15, 0.6);
  ch.C.ajouterCercle(x, -y, 0.17, { y1: 0.6 });
}
// LA PLAQUE « Toilettes » côté C05, au nord de la porte (côté serrure), et LES DEUX AFFICHES A4 scotchées sur le vantail
// (photo 23) : elles partent avec lui quand il s'ouvre. (Relecture du 09/10 : la plaque touche presque l'huisserie — sur
// la photo 23, à peine 4-5 cm entre les deux, le tiers de sa largeur ; elle était à 19 cm : centre à 0,58 du milieu de
// la porte, et non plus 0,72)
let _affichesWC = null;
function signaletiqueC05(ch, P, yPorte, picto) {
  cadre(ch, P, new THREE.MeshStandardMaterial({ map: texPlaqueWC(picto), roughness: 0.4 }), 5.8, yPorte + 0.58, 'W', 0.12, 0.16, 1.54, { ep: 0.005 });
  if (!_affichesWC) _affichesWC = [texAfficheProtections(), texAffichePersonnages()].map((t) => new THREE.MeshStandardMaterial({ map: t, roughness: 0.75 }));
  const porte = ch.portes.auto.find((q) => Math.abs(q.cx - 5.875) < 0.01 && Math.abs(q.cz + yPorte) < 0.01);
  const v = porte && porte.vantaux[0];
  if (!v) return;
  // (dans le repère du vantail : le gond en x = 0, le vantail vers +x — le nord —, la face du C05 en -z ; la fente
  // vitrée a son axe à 0,20 du bord libre, son noyer s'arrête à 0,305 : la première affiche juste à côté, à un doigt, la
  // seconde vers les gonds ; de 1,27 à 1,57 m, juste au-dessus de la béquille, photo 23)
  [[0.43, 0], [0.215, 1]].forEach(([x, k]) => {
    const a = new THREE.Mesh(new THREE.PlaneGeometry(0.205, 0.29), _affichesWC[k]);
    a.position.set(x, 1.42 + k * 0.012, -0.0235); a.rotation.y = Math.PI; a.rotation.z = (k ? -0.012 : 0.008); a.castShadow = false;
    v.g.add(a);
  });
}

// LES TOILETTES FEMMES (x 5,95-8,85, y 12,15-15,3 ; porte du C05 en y 13,75) : trois cabines le long du mur est, les
// vasques au mur ouest au nord de la porte, le sèche-mains au mur sud
function toilettesFemmes(ch, P) {
  ch.plafond(WF.x0, WF.y0, WF.x1, WF.y1, 2.5, 'platre');
  faience(ch, P, WF, [['W', 13.28, 14.22]]);
  solGres(ch, WF);
  ch.boite(5.8, 13.33, 6.0, 14.17, 0, 0.005, P.inox, { ombre: false });       // la barre de seuil
  const bords = [WF.y0 + 0.012, 13.2, 14.25, WF.y1 - 0.012];
  cabines(ch, P, 7.4, WF.x1 - 0.012, bords);
  lavabos(ch, P, WF, 14.36, 15.288, 'wcF', [[14.405, 15.13]]);
  secheMains(ch, P, 6.7, WF.y0 + 0.012, 'N');
  poubelleWC(ch, P, 6.2, 12.42);
  for (const [x, y] of [[6.6, 12.9], [6.7, 14.6], [7.95, 13.7]]) ch.spot(x, y, 2.5, 'wcF');
  signaletiqueC05(ch, P, 13.75, 'femme');
}
// LES TOILETTES HOMMES (x 5,95-8,85, y 15,45-18,6 ; porte du C05 en y 16,85) : deux cabines le long du mur est, trois
// urinoirs et leurs écrans au mur nord, les vasques au mur ouest au nord de la porte
function toilettesHommes(ch, P) {
  const { C } = ch;
  ch.plafond(WH.x0, WH.y0, WH.x1, WH.y1, 2.5, 'platre');
  faience(ch, P, WH, [['W', 16.38, 17.32]]);
  solGres(ch, WH);
  ch.boite(5.8, 16.43, 6.0, 17.27, 0, 0.005, P.inox, { ombre: false });
  cabines(ch, P, 7.4, WH.x1 - 0.012, [WH.y0 + 0.012, 16.5, 17.55], { fermer: [17.55] });
  lavabos(ch, P, WH, 17.46, 18.588, 'wcH', []);
  // les urinoirs (céramique suspendue, chasse chromée) et les écrans de séparation gris
  const yN = WH.y1 - 0.012;
  for (const x of [7.1, 7.72, 8.34]) urinoir(ch, P, x, yN);
  for (const x of [6.79, 7.41, 8.03]) {
    ch.boite(x - 0.015, yN - 0.42, x + 0.015, yN, 0.55, 1.35, P.grisHPL);
    ch.boite(x - 0.017, yN - 0.44, x + 0.017, yN - 0.42, 0.55, 1.35, P.inox, { ombre: false });
  }
  C.ajouterBoite(6.77, -(yN - 0.45), 8.6, -yN, { y0: 0.3, y1: 1.4 });
  secheMains(ch, P, 6.7, WH.y0 + 0.012, 'N');
  poubelleWC(ch, P, 6.2, 15.72);
  // le panneau jaune « sol glissant » des anciennes toilettes (relecture du 09/10 : il s'était perdu en route), dans le
  // cul-de-sac au sud de la porte, tourné vers elle — il ne gêne pas le chemin des urinoirs
  const pn = groupe(ch, 7.02, 15.9, 'W'); pn.rotation.y -= 0.45;
  const plq = new THREE.MeshStandardMaterial({ map: texSolGlissant(), roughness: 0.5, side: THREE.DoubleSide });
  for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.6), plq); p.position.set(0, 0.29, s * 0.1); p.rotation.x = s * -0.32; p.castShadow = true; pn.add(p); }
  C.ajouterCercle(7.02, -15.9, 0.2, { y1: 0.62 });
  for (const [x, y] of [[6.6, 16.0], [6.9, 17.95], [7.95, 16.5], [8.0, 17.95]]) ch.spot(x, y, 2.5, 'wcH');
  signaletiqueC05(ch, P, 16.85, 'homme');
}
// UN URINOIR suspendu, regardant le sud (contre le mur nord, en x), sa commande de chasse
let _creux = null;
function urinoir(ch, P, x, y) {
  const g = groupe(ch, x, y, 'S', 0);
  R(g, P.ceramique, 0.36, 0.64, 0.32, 0.1, 0, 0.83, 0.16);
  // le creux de la vasque : une face ombrée, plus sombre en haut
  if (!_creux) _creux = new THREE.MeshStandardMaterial({ roughness: 0.2, map: canvasTex(32, 64, (q, w, h) => { const d = q.createLinearGradient(0, 0, 0, h); d.addColorStop(0, '#9fa3a6'); d.addColorStop(0.6, '#d9dbdc'); d.addColorStop(1, '#eceeee'); q.fillStyle = d; q.fillRect(0, 0, w, h); }, null, false, 1) });
  plan(g, _creux, 0.24, 0.44, 0, 0.84, 0.322);
  CY(g, P.robinet, 0.012, 0.3, 0, 1.33, 0.05, 10);
  B(g, P.robinet, 0.07, 0.09, 0.02, 0, 1.52, 0.012, { ombre: false });
  CY(g, P.robinet, 0.02, 0.04, 0, 0.52, 0.16, 10);
}
// LES TOILETTES PMR (x 9,0-11,55, y 17,55-20,6 ; porte du C01 en y 19,05) : la cuvette contre le mur nord, la barre
// d'appui au mur ouest et la barre relevable à côté (le transfert se fait par l'est), le lave-mains accessible au mur
// ouest et son miroir, le cordon d'appel rouge ; un cercle de 1,50 m libre au milieu
function toilettesPMR(ch, P) {
  const { C } = ch;
  ch.plafond(PM.x0, PM.y0, PM.x1, PM.y1, 2.5, 'platre');
  faience(ch, P, PM, [['E', 18.54, 19.56]]);
  solGres(ch, PM);
  ch.boite(11.5, 18.58, 11.7, 19.52, 0, 0.005, P.inox, { ombre: false });
  for (const [x, y] of [[10.3, 18.35], [9.95, 19.85]]) ch.spot(x, y, 2.5, 'pmr');
  wcSuspendu(ch, P, 9.48, PM.y1 - 0.012, 'S');
  C.ajouterCercle(9.48, -(PM.y1 - 0.3), 0.24, { y1: 0.5 });
  const ba = groupe(ch, PM.x0 + 0.012, 20.0, 'E', 0.8);
  const barre = CY(ba, P.inox, 0.017, 0.7, 0, 0, 0.07, 10, { ombre: false }); barre.rotation.z = Math.PI / 2;
  for (const s of [-1, 1]) { const p = CY(ba, P.inox, 0.017, 0.07, s * 0.33, 0, 0.035, 8, { ombre: false }); p.rotation.x = Math.PI / 2; }
  const rel = groupe(ch, 9.86, PM.y1 - 0.012, 'S', 0.8); B(rel, P.inox, 0.03, 0.03, 0.75, 0, 0, 0.37, { ombre: false }); B(rel, P.inox, 0.06, 0.12, 0.04, 0, 0, 0.0, { ombre: false });
  // le cordon d'appel (rouge), à portée de la cuvette
  ch.boite(PM.x0 + 0.012, 19.5, PM.x0 + 0.04, 19.58, 2.05, 2.15, P.blancMat, { ombre: false });
  ch.boite(PM.x0 + 0.03, 19.535, PM.x0 + 0.036, 19.545, 0.25, 2.05, P.rouge, { ombre: false });
  ch.boite(PM.x0 + 0.02, 19.52, PM.x0 + 0.045, 19.56, 0.22, 0.28, P.rouge, { ombre: false });
  // le lave-mains (rien dessous : on y vient en fauteuil), son robinet mural, le miroir, le distributeur
  const lv = groupe(ch, PM.x0 + 0.012, 18.25, 'E', 0.8);
  B(lv, P.ceramique, 0.45, 0.04, 0.32, 0, 0, 0.172);
  vasque(lv, P, 0, 0.02, 0.18, 0.75);
  robinetMural(lv, P, 0, 0.17, 0.012, 0.14);
  C.ajouterBoite(PM.x0, -18.02, PM.x0 + 0.34, -18.48, { y0: 0.7, y1: 0.85 });
  miroir(ch, P, PM.x0 + 0.012, 18.25, 1.4, 0.5, 0.7, 'E', PM);
  const sav = groupe(ch, PM.x0 + 0.012, 18.66, 'E', 1.05); R(sav, P.blancMat, 0.1, 0.18, 0.09, 0.02, 0, 0.09, 0.045);
  secheMains(ch, P, 10.5, PM.y0 + 0.012, 'N');
  poubelleWC(ch, P, 11.2, 17.85);
  // la plaque côté C01, au sud de la porte (photo 01 : le fauteuil roulant et « Toilettes »)
  cadre(ch, P, new THREE.MeshStandardMaterial({ map: texPlaqueWC('pmr'), roughness: 0.4 }), 11.7, 18.3, 'E', 0.15, 0.2, 1.6, { ep: 0.006 });
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
  // le dévidoir de papier, à côté, contre le mur (dans le repère de la cuvette : x à côté, z devant ; il flottait à 25 cm
  // du mur, 09/10)
  CY(g, P.blancMat, 0.055, 0.11, 0.34, 0.72, 0.075, 14).rotation.z = Math.PI / 2;
  B(g, P.chrome, 0.13, 0.02, 0.02, 0.34, 0.785, 0.01, { ombre: false });
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
// LE SOL DES TOILETTES : un plan de grès posé à 3 mm au-dessus du carrelage, sur le rectangle `R`. Il porte, sur sa
// seconde couche d'UV, la même lumière cuite et la même ombre cuite que le carrelage (js/ecole_lumieres.js,
// js/kit_decor.js) : la carte les pose sur le matériau du carrelage APRÈS les crochets, alors on les reprend au moment de
// dessiner (onBeforeRender), dès qu'elles existent ou changent. Les UV1 suivent le repère du sol : le plan invisible
// « sol (repère) » de la carte. (Un seul matériau pour les trois toilettes.)
let _gres = null;
function solGres(ch, R) {
  const rep = ch.scene.getObjectByName('sol (repère)');
  const W = rep.geometry.parameters.width, L = rep.geometry.parameters.height;
  const rx0 = rep.position.x - W / 2, ry0 = -rep.position.z - L / 2;
  if (!_gres) {
    const S = texSolWC();
    _gres = new THREE.MeshStandardMaterial({ map: S.map, roughness: 0.55 });
    avecRelief(_gres, S.nor, 0.5);
  }
  const mat = _gres, pos = [], uv = [], uv1 = [];
  for (const [x, y] of [[R.x0, R.y0], [R.x1, R.y0], [R.x1, R.y1], [R.x0, R.y1]]) {
    pos.push(x, 0.003, -y); uv.push(x - R.x0, y - R.y0); uv1.push((x - rx0) / W, (y - ry0) / L);
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
//  LA SALLE DAVID CLARK (B 0.2), derrière la porte bleue du fond du C05
// =====================================================================
// (09/10) La photo 23 montre, à droite de la porte bleue, une plaque de salle à trois lignes : « Salle … B 0.? » ; la
// plaque directionnelle des photos 22 et 24 annonce au rez-de-chaussée « Salle Tim Berners-Lee B 0.1 » et « Salle David
// Clark B 0.2 » — la longueur de la ligne du milieu désigne plutôt la seconde. L'intérieur est IMAGINÉ : une salle de
// cours sobre, comme la salle A et la salle 101. Elle déborde le fond du bâtiment (y 20,75) jusqu'à 24,5 : ses trois
// fenêtres donnent au nord sur une cour éclairée par le jour — c'est ce jour qui allume le verre bleu de sa porte sur la
// photo 05.
//   Le tableau blanc et l'écran au mur est : la lumière des fenêtres arrive par la gauche des élèves. Trois rangs de
//   deux tables pour deux (12 places) ; trois allées est-ouest (le long du mur sud, où arrive la porte, au milieu, et le
//   long des fenêtres) d'où l'on rejoint chaque chaise, et une allée au fond (mur ouest) qui les relie. Le bureau de
//   l'enseignant devant l'écran, à 1,15 m du premier rang.
const RANGS_DC = [3.15, 4.5, 5.85], TABLES_DC = [20.2, 22.35];
function salleDavidClark(ch, P) {
  const { M, C } = ch;
  // ---- la coque : le mur ouest, le mur nord (30 cm) et ses trois fenêtres sur la cour, le plafond à plateaux ----
  ch.mur({ de: [1.675, 18.6], a: [1.675, 24.5], mats: M.blanc, plinthes: ['E'] });
  const FEN = [2.95, 5.3, 7.65];
  ch.mur({ de: [1.6, 24.5], a: [9.0, 24.5], ep: 0.3, mats: { N: matCour().crepi, S: M.blanc }, plinthes: ['S'], ouvertures: FEN.map((c) => ({ c, l: 1.4, bas: 0.9, h: 2.35 })) });
  const nord = new THREE.Group(); nord.position.set(0, 0, -24.5); ch.decor.add(nord);
  for (const c of FEN) {
    fenetreFacade(nord, M, { x: c, l: 1.4, bas: 0.9, haut: 2.35, ep: 0.3, barreaux: false });
    C.ajouterBoite(c - 0.7, -24.65, c + 0.7, -24.35, { y0: 0.9, y1: 2.35, vitre: true });
    radiateur(ch, c - 0.55, DC.y1 - 0.09, c + 0.55, DC.y1, 0.15, 0.72);
  }
  ch.plafond(DC.x0, DC.y0, DC.x1, DC.y1, 2.6, 'plateaux');
  // ---- la lumière : six dalles LED ; le jour des fenêtres (un spot réel au milieu, et la lumière cuite des trois) ----
  for (const x of [3.1, 5.3, 7.5]) for (const y of [20.35, 22.75]) dalleLED(ch, P, x, y, 2.6, 'salleDC');
  ch.lampes.push({ type: 'jour', x: 5.3, z: -25.4, h: 2.6, cx: 5.3, cz: -22.2, sx: 5.3, sz: -24.0, ox: 5.3, oz: -24.9, zone: 'salleDC', poids: 1.3, cuire: false });
  for (const c of FEN) ch.lampes.push({ type: 'jour', x: c, z: -25.4, h: 2.4, sx: c, sz: -23.95, ox: c, oz: -25.0, zone: 'salleDC', reel: false, cuireForce: 0.8 });
  // ---- au mur est : le tableau blanc (le cours de réseaux), l'horloge, l'écran déroulé ; le vidéoprojecteur ----
  tableauBlancMural(ch, P, DC.x1, 20.6, 'W', 2.4, texTableauReseau());
  const hz = groupe(ch, DC.x1, 20.6, 'W', 2.36);
  CY(hz, P.plastique, 0.155, 0.035, 0, 0, 0.018, 28).rotation.x = Math.PI / 2;
  const cad = new THREE.Mesh(new THREE.CircleGeometry(0.145, 32), new THREE.MeshStandardMaterial({ map: texHorloge(), roughness: 0.3 }));
  cad.position.set(0, 0, 0.036); hz.add(cad);
  ecranDeroule(ch, P, DC.x1, 22.85, 'W', 1.7, 1.06, new THREE.MeshBasicMaterial({ map: texDiapoReseau(), color: new THREE.Color(1.08, 1.08, 1.08) }));
  // (entre deux dalles, à 4,65 m de l'écran)
  const vp = groupe(ch, 4.2, 22.85, 'E', 2.6);
  CY(vp, P.alu, 0.02, 0.22, 0, -0.11, 0, 8);
  B(vp, P.alu, 0.18, 0.02, 0.14, 0, -0.22, 0);
  R(vp, P.blancMat, 0.34, 0.11, 0.27, 0.025, 0, -0.29, 0);
  maille(new THREE.CylinderGeometry(0.035, 0.04, 0.025, 18), P.plastique, 0.07, -0.29, 0.14, 0, vp).rotation.x = Math.PI / 2;
  maille(new THREE.CircleGeometry(0.03, 18), P.led, 0.07, -0.29, 0.153, 0, vp, { ombre: false, recoit: false });
  vp.traverse((m) => { m.userData.horsAOSol = true; });
  C.ajouterBoite(4.0, -22.65, 4.4, -23.05, { y0: 2.2, y1: 2.6, joueur: false });     // (la caméra ne le traverse pas)
  // ---- le bureau de l'enseignant (tourné vers la classe), son fauteuil, son portable ----
  tableEleve(ch, P, 7.65, 22.85, 0.7, 1.4);
  chaiseBureau(ch, P, 8.3, 22.85, 'W', { accoudoirs: true, nom: 'le fauteuil de l’enseignant', sortie: [0, 1.0] });
  const lp = groupe(ch, 7.68, 23.0, 'E', 0.745);
  R(lp, P.alu, 0.32, 0.016, 0.22, 0.006, 0, 0.008, 0, { ombre: false });
  const ecl = new THREE.Group(); ecl.position.set(0, 0.016, -0.11); ecl.rotation.x = -0.25; lp.add(ecl);
  B(ecl, P.alu, 0.32, 0.21, 0.007, 0, 0.105, 0);
  plan(ecl, P.ecrans[4], 0.3, 0.18, 0, 0.108, 0.004);
  const docs = groupe(ch, 7.55, 22.4, 'E', 0.745); docs.rotation.y += 0.2; B(docs, P.blancMat, 0.21, 0.015, 0.297, 0, 0.0075, 0, { ombre: false });
  // ---- les tables des élèves et leurs chaises (tournées vers l'est) ; quelques coques jaunes ----
  let n = 0;
  for (const xr of RANGS_DC) for (const yc of TABLES_DC) {
    tableEleve(ch, P, xr, yc, 0.6, 1.4);
    for (const s of [-1, 1]) {
      const yy = yc + s * 0.35, allee = yc + s * 1.05;
      chaiseClasse(ch, P, xr - 0.52, yy, 'E', { sortie: [0, allee - yy], mat: (n++ % 7 === 3) ? P.coqueJaune : P.coque });
    }
  }
  // un cahier, une trousse, une gourde : la classe vient de sortir
  const cahier = groupe(ch, 5.85, 22.0, 'E', 0.745); cahier.rotation.y += 0.25; B(cahier, P.bleu, 0.21, 0.012, 0.29, 0, 0.006, 0, { ombre: false });
  const gourde = groupe(ch, 4.55, 20.5, 'E', 0.745); CY(gourde, P.vert, 0.035, 0.22, 0, 0.11, 0, 14); CY(gourde, P.chrome, 0.025, 0.03, 0, 0.235, 0, 10);
  const trousse = groupe(ch, 3.15, 19.85, 'E', 0.745); trousse.rotation.y += 0.6; R(trousse, P.rouge, 0.2, 0.06, 0.08, 0.025, 0, 0.03, 0, { ombre: false });
  // ---- le fond de la classe (mur ouest) : deux affiches, les patères, la plante ; la corbeille, l'extincteur ----
  cadre(ch, P, new THREE.MeshStandardMaterial({ map: texAffiche('#2f6fb0', '#fbfbf8', 71), roughness: 0.6 }), DC.x0, 20.3, 'E', 0.52, 0.72, 1.6);
  cadre(ch, P, new THREE.MeshStandardMaterial({ map: texAffiche('#e9a01c', '#fbfbf8', 72), roughness: 0.6 }), DC.x0, 21.2, 'E', 0.52, 0.72, 1.6);
  const pat = groupe(ch, DC.x0, 22.75, 'E', 1.72);
  B(pat, P.chene, 1.0, 0.1, 0.02, 0, 0, 0.01);
  for (let i = 0; i < 5; i++) { const p = CY(pat, P.chrome, 0.008, 0.07, -0.4 + i * 0.2, 0.0, 0.05, 8, { ombre: false }); p.rotation.x = Math.PI / 2 - 0.3; }
  vetement(pat, P.tissu, 0.2, 0.0, 0.1, { haut: 0.7 });
  plante(ch, P, 2.05, 23.95, { h: 1.4, graineN: 7 });
  // (la corbeille au pied du tableau, dans l'angle sud-est — relecture du 09/10 : posée en (4,45 ; 18,98), dans l'allée
  // sud, elle la coupait en deux : passé la porte, on ne pouvait plus longer le mur vers l'ouest)
  corbeille(ch, P, 8.64, 19.12);
  C.ajouterCercle(8.64, -19.12, 0.16, { y1: 0.4 });
  // (l'extincteur dans l'angle sud-est, au mur du tableau : dans l'allée sud, il la bouchait)
  const ex = groupe(ch, DC.x1 - 0.09, 19.05, 'W');
  CY(ex, P.rouge, 0.075, 0.48, 0, 1.2, 0, 16); CY(ex, P.noirMat, 0.04, 0.08, 0, 1.48, 0, 10);
  C.ajouterCercle(DC.x1 - 0.09, -19.05, 0.09, { y0: 0.9, y1: 1.6 });
  cadre(ch, P, new THREE.MeshStandardMaterial({ map: texPictoExtincteur(), roughness: 0.6 }), DC.x1, 19.05, 'W', 0.16, 0.16, 1.85, { ep: 0.004 });
  // le point d'accès wifi et le détecteur de fumée
  const ap = groupe(ch, 5.3, 21.55, 'S', 2.6); CY(ap, P.blancMat, 0.1, 0.035, 0, -0.018, 0, 24, { ombre: false }); maille(new THREE.CircleGeometry(0.012, 10), P.led, 0, -0.0365, 0.05, 0, ap, { recoit: false }).rotation.x = Math.PI / 2;
  const df = groupe(ch, 2.9, 21.55, 'S', 2.6); CY(df, P.blancMat, 0.055, 0.045, 0, -0.023, 0, 18, { ombre: false });
  for (const o of [ap, df]) o.traverse((m) => { m.userData.horsAOSol = true; });
  // ---- côté C05, à droite de la porte bleue : la plaque de la salle (photo 23) ----
  plaque(ch, new THREE.MeshStandardMaterial({ map: texPlaqueSalle(), roughness: 0.4 }), 5.705, 18.6, 'S', 0.15, 0.088, 1.62);
}
// UNE PLAQUE DE PORTE (signalétique noire de l'école) : une plaquette de 5 mm, l'image sur toute sa face
function plaque(ch, mat, x, y, face, w, h, hc) {
  const g = groupe(ch, x, y, face, hc);
  B(g, ch.M.noirMat, w, h, 0.005, 0, 0, 0.0025, { ombre: false });
  plan(g, mat, w, h, 0, 0, 0.0055);
  return g;
}
// LE TABLEAU BLANC mural (cadre d'aluminium, auget, feutres) contre un mur, tourné vers `face`, son image `tex`
function tableauBlancMural(ch, P, x, y, face, w, tex) {
  const g = groupe(ch, x, y, face, 1.5);
  B(g, P.alu, w + 0.04, 1.24, 0.022, 0, 0, 0.011);
  plan(g, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.14 }), w, 1.2, 0, 0, 0.0225);
  B(g, P.alu, w * 0.6, 0.025, 0.07, 0, -0.63, 0.04);
  ['#1d4fa3', '#1e1e1e', '#c62828'].forEach((c, i) => {
    const f = CY(g, new THREE.MeshStandardMaterial({ color: c, roughness: 0.5 }), 0.009, 0.13, -0.3 + i * 0.09, -0.608, 0.045, 8, { ombre: false });
    f.rotation.z = Math.PI / 2;
  });
  B(g, P.plastiqueGris, 0.14, 0.035, 0.05, 0.3, -0.6, 0.045, { ombre: false });
  return g;
}
// L'ÉCRAN DÉROULÉ (carter blanc sous le plafond, toile, barre de lestage) et l'image du vidéoprojecteur `mat`
function ecranDeroule(ch, P, x, y, face, w, h, mat) {
  const g = groupe(ch, x, y, face, 0), haut = 2.5;
  CY(g, P.blancMat, 0.045, w + 0.16, 0, haut, 0.07, 14).rotation.z = Math.PI / 2;
  for (const s of [-1, 1]) B(g, P.plastiqueGris, 0.02, 0.06, 0.05, s * (w / 2 + 0.05), haut, 0.03, { ombre: false });
  const yc = haut - 0.06 - (h + 0.08) / 2;
  plan(g, P.blancMat, w + 0.02, h + 0.08, 0, yc, 0.07);
  plan(g, mat, w * 0.96, h * 0.94, 0, yc, 0.072);
  B(g, P.plastique, w + 0.03, 0.02, 0.02, 0, haut - 0.14 - h, 0.07);
  return g;
}
// UNE TABLE D'ÉLÈVE (stratifié blanc sur quatre pieds d'acier et deux ceintures), centrée en (x, y), `lx` x `ly` en plan
function tableEleve(ch, P, x, y, lx, ly) {
  const x0 = x - lx / 2, x1 = x + lx / 2, y0 = y - ly / 2, y1 = y + ly / 2, h = 0.745;
  ch.boite(x0, y0, x1, y1, h - 0.025, h, P.strat);
  for (const [px, py] of [[x0 + 0.05, y0 + 0.05], [x1 - 0.05, y0 + 0.05], [x0 + 0.05, y1 - 0.05], [x1 - 0.05, y1 - 0.05]]) ch.boite(px - 0.018, py - 0.018, px + 0.018, py + 0.018, 0, h - 0.025, P.metal);
  for (const px of [x0 + 0.05, x1 - 0.05]) ch.boite(px - 0.01, y0 + 0.07, px + 0.01, y1 - 0.07, h - 0.09, h - 0.027, P.metal, { ombre: false });
  ch.C.ajouterBoite(x0, -y0, x1, -y1, { y1: h + 0.02 });
}
// LA CHAISE DE CLASSE : coque de polypropylène sur quatre pieds d'acier (comme celles de la salle 101) ; on s'y assoit
// (l'assise à 46 cm), et l'on se relève dans l'allée (`sortie` : décalage en plan)
function chaiseClasse(ch, P, x, y, face, { sortie = null, mat = null } = {}) {
  const g = groupe(ch, x, y, face), m = mat || P.coque;
  R(g, m, 0.43, 0.022, 0.41, 0.01, 0, 0.455, 0.01);
  const d = R(g, m, 0.42, 0.27, 0.02, 0.01, 0, 0.72, -0.2); d.rotation.x = -0.16;
  for (const [px, pz] of [[-0.18, 0.17], [0.18, 0.17], [-0.18, -0.17], [0.18, -0.17]]) { const p = CY(g, P.metal, 0.011, 0.445, px, 0.2225, pz, 8); p.rotation.x = pz > 0 ? -0.06 : 0.06; }
  for (const px of [-0.17, 0.17]) { const p = CY(g, P.metal, 0.01, 0.22, px, 0.56, -0.21, 8); p.rotation.x = -0.16; }
  for (const pz of [-0.17, 0.17]) B(g, P.metal, 0.38, 0.012, 0.012, 0, 0.43, pz, { ombre: false });
  ch.C.ajouterCercle(x, -y, 0.2, { y1: 0.9 });
  siege(ch, x, y, 0.46, face, 'la chaise', sortie);
  return g;
}

// =====================================================================
//  LA COUR (imaginée), derrière les fenêtres de la salle David Clark
// =====================================================================
// Des dalles de béton, le pignon aveugle du mitoyen à l'ouest, en face et à l'est des façades d'immeubles enduites et
// percées de fenêtres, deux bacs de buis ; le ciel couvert au-dessus (le fond de la scène). On ne la voit que par les
// fenêtres : rien de solide. Ses matières reçoivent le jour (jourDehors), comme la rue.
let _cour = null;
function matCour() {
  if (_cour) return _cour;
  const std = (o) => new THREE.MeshStandardMaterial(o);
  _cour = {
    dalles: jourDehors(std({ map: texDallesCour(), roughness: 0.85 }), 0.32),
    facade: jourDehors(std({ map: texFacadeCour(), roughness: 0.9 }), 0.3),
    crepi: jourDehors(std({ color: 0xd8d0c0, roughness: 0.95 }), 0.3),
    pignon: jourDehors(std({ color: 0xcfc7b8, roughness: 0.95 }), 0.28),
    bac: jourDehors(std({ color: 0x6f6d68, roughness: 0.8 }), 0.25),
    // le buis taillé : un feuillage serré, des points clairs et sombres (pas un coussin lisse)
    buis: jourDehors(std({ roughness: 0.95, map: canvasTex(128, 128, (q, w, h) => {
      q.fillStyle = '#34502b'; q.fillRect(0, 0, w, h);
      const r = graine(5150);
      for (let k = 0; k < 1400; k++) { const c = r(); q.fillStyle = c < 0.45 ? 'rgba(20,38,16,0.55)' : c < 0.8 ? 'rgba(88,122,64,0.5)' : 'rgba(140,160,90,0.45)'; q.fillRect(r() * w, r() * h, 2 + r() * 3, 2 + r() * 2); }
    }, [2, 2], false, 4) }), 0.16),
  };
  return _cour;
}
function cour(ch) {
  const K = matCour();
  ch.boite(-0.3, 24.65, 13.65, 31.0, -0.05, 0.0, K.dalles, { ombre: false });
  ch.boite(-0.3, 31.0, 13.65, 31.4, 0, 15, K.facade, { ombre: false });
  ch.boite(-0.6, 24.65, -0.3, 31.4, 0, 16.5, K.pignon, { ombre: false });
  ch.boite(13.65, 24.65, 14.0, 31.4, 0, 15, K.facade, { ombre: false });
  for (const x of [3.4, 8.4]) {
    ch.boite(x - 0.6, 29.85, x + 0.6, 30.45, 0, 0.5, K.bac, { ombre: false });
    maille(geoRonde(1.12, 0.5, 0.52, 0.2), K.buis, x, 0.72, -30.15, 0, ch.decor, { ombre: false });
    maille(geoRonde(0.7, 0.36, 0.44, 0.16), K.buis, x + (x < 5 ? 0.18 : -0.2), 0.98, -30.12, 0.3, ch.decor, { ombre: false });
  }
  // la grille d'évacuation, la descente d'eau pluviale du pignon, le seuil et la porte de service de l'immeuble d'en face
  ch.boite(5.1, 27.3, 5.5, 27.7, 0, 0.004, ch.M.grille, { ombre: false });
  ch.boite(-0.3, 30.7, -0.2, 30.8, 0, 15, K.bac, { ombre: false });
  ch.boite(6.17, 30.96, 7.13, 31.0, 0, 2.15, ch.M.acierNoir, { ombre: false });
  ch.boite(6.07, 30.86, 7.23, 31.0, 0, 0.04, K.bac, { ombre: false });
}

// =====================================================================
//  LE CROCHET
// =====================================================================
export function poserPieces(ch) {
  const P = matieres(ch.M);
  salleA(ch, P);
  bureauB(ch, P);
  couloirService(ch, P);
  cloisonsBande(ch);
  localTechnique(ch, P);
  toilettesFemmes(ch, P);
  toilettesHommes(ch, P);
  toilettesPMR(ch, P);
  salleDavidClark(ch, P);
  cour(ch);
  return { zones: ZONES };
}
