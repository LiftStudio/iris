// =====================================================================
//  LES PIÈCES FERMÉES DU REZ-DE-CHAUSSÉE (crochet de js/carte_ecole.js)
// =====================================================================
// Les pièces que Haythem n'a pas (encore) photographiées, derrière les portes qui restaient fermées : leurs portes
// s'ouvrent maintenant toutes seules (js/ecole_portes.js, état 'auto') et l'on peut y entrer. Leur intérieur est
// IMAGINÉ — plausible pour une école de commerce et du numérique parisienne — EN ATTENDANT DES PHOTOS : quand elles
// arriveront, c'est ce module qu'on reprend (la coque, elle, reste celle de js/carte_ecole.js).
//
//   LA Si 0.1 « TIM BERNERS-LEE » (l'ex-salle A, informatique)  x 4,575-9,9  y 0-4,725 (11/10, plan V2 ; sans son angle
//        nord-est, x 9,09-9,9 × y 3,0-4,725, à l'antichambre : retour r02)  deux rangs de cinq et quatre postes
//        tournés vers le nord (écrans, claviers, unités centrales, chaises de bureau où l'on s'assoit), le
//        poste de l'enseignant, la toile de projection descendue devant les jours dépolis et son vidéoprojecteur, le
//        tableau blanc du mur est, les stores enrouleurs des trois fenêtres sur rue, quatre dalles LED dans le plafond à
//        plateaux, l'imprimante, l'horloge ; sa porte s'ouvre dans le retour x 9,165, sur l'antichambre
//   LE BUREAU DE DIRECTION B 0.3  x 10,05-13,2 y 0-2,85, l'angle nord-est écorné (11/10 ; r02 : son mur nord en y 2,925)
//        bureau de chêne clair, fauteuil,
//        deux chaises visiteurs (on s'y assoit), armoire, bibliothèque, tableau, grande plante, tapis, porte-manteau ; sa
//        porte vitrée au bout du passage de la pile (photos 01, 03)
//   LE COULOIR DE SERVICE      x 0-1,6      y 0-8,95   derrière la porte blanche « Sortie » du passage : il mène à la
//        porte de secours de la façade (barre anti-panique) ; bacs roulants, chariot de ménage, escabeau, cartons,
//        extincteur, goulotte. (09/10 : la vidéo du sous-sol montre que la porte grise du hall ouest ouvre sur le palier de
//        l'escalier du -1, js/ecole_soussol.js : le couloir s'arrête au mur de ce palier, y = 9,1)
//   (09/10, photo 23 : le mur est du C05 porte DEUX portes de toilettes, femmes puis hommes, et sa porte bleue du fond
//   est celle d'une salle de cours ; la bande entre le C05 et le C01, x 6,1-11,6, est redistribuée en conséquence.
//   V2, 11/10 — iris_audit/plan_v2.md § 2.2 : le fond recalé sur le gabarit IGN, de la salle d'attente au fond du
//   bâtiment, y 23,7)
//   LES TOILETTES FEMMES       x 6,125-8,85 y 7,95-10,45 (porte du C05, y 8,575) deux cabines aux portes safran le
//        long du mur est, deux vasques et leur miroir au mur ouest, au nord de la porte
//   LES TOILETTES HOMMES       x 6,125-8,85 y 10,6-13,925 (porte du C05, y 11,05) deux cabines, trois urinoirs et leurs
//        écrans au mur nord, deux vasques et leur miroir ; dans les deux : faïence blanche, grès 30 x 30, sèche-mains
//   LES TOILETTES PMR          x 9,0-11,55  y 12,1-14,4 (porte « toilettes PMR » du C01, y 12,9 — sa plaque montre un
//        fauteuil roulant, photo 01) cuvette, barres d'appui, lave-mains accessible, miroir, un cercle de 1,50 m libre
//   LE LOCAL TECHNIQUE         x 9,0-11,55  y 7,95-11,95 (porte « local » du couloir C01, y 10,6)
//        baies serveurs aux diodes qui clignotent, onduleur, tableau électrique, étagère, établi, climatiseur, chemins
//        de câbles ; pas de faux plafond (la dalle brute à 3,25 m) et des réglettes LED suspendues
//   LA SALLE DAVID CLARK (Si 0.2) x 0,475-8,85 y 14,15-23,625, derrière la porte bleue du fond du C05 et son entrée (sa
//        plaque, photo 23) — PHOTOGRAPHIÉE (retour r06 du 13/10) : la salle informatique aveugle, moquette vert olive,
//        faux plafond de dalles à 2,35 et luminaires à grille, le gros poteau, les rangées de tables de hêtre et leurs
//        postes, les chaises coque moutarde sur luge noire, l'armoire anthracite
//   LES LOCAUX FERMÉS du fond (la réserve ouest, le local du fond derrière la porte « fond du C01 ») : personne n'y est
//        entré — ni sol, ni meuble, rien dedans
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
import { maille, boiteM } from './ecole_portes.js';
import { canvasTex, normalesDepuisGrille, avecRelief, nePasFusionner, detailPhoto } from './kit_decor.js';
import { texAffiche, texConsignes, texPictoExtincteur } from './ecole_matieres.js';

const H_DALLE = 3.25;                       // le dessous de la dalle du 1er étage
// ---- les pièces, en plan (le nu intérieur des murs) ----
// (11/10, plan V2 — scratchpad iris_audit/plan_v2.md § 2.2 : la salle d'attente recule de DY_A = -4,20, son mur sud est la
// ligne y 4,8 ; la salle A, devenue la Si 0.1, perd 4,2 m de profondeur ; son mur ouest est le mur est du passage, x 4,5)
// (retour de Haythem du 12/10, r03 : la salle d'attente s'élargit — son mur sud, le mur nord de la Si 0.1, recule de
// 0,20 vers la rue, ligne 4,6, js/carte_ecole.js DY_R03 — : la Si 0.1, imaginée, perd 0,20 m de profondeur)
const DY_R03 = -0.20;
const SA = { x0: 4.575, x1: 9.9, y0: 0, y1: 4.725 + DY_R03 };   // la Si 0.1, l'ex-salle A
// (retour de Haythem du 11/10, r02 : son angle nord-est, x 9,09-9,9 × y 3,0-4,725, est à l'antichambre — le mur sud de
// la salle d'attente s'arrête en x 9,24 ; le retour x 9,165 porte sa porte, js/carte_ecole.js)
const BB = { x0: 10.05, x1: 13.2, y0: 0, y1: 2.85 };        // le bureau B (jusqu'à son mur nord, la ligne y 2,925)
// (son angle nord-est est écorné : de 12,425 à 13,2 il s'arrête en y 2,425 — js/carte_ecole.js ; retour r02 du 11/10 : son
// mur nord n'est plus la ligne y 4,8 mais la ligne y 3,1, d'un bout à l'autre — devant lui, l'antichambre ; relecture :
// la ligne 2,925, nu nord 3,0, photo 03 rejouée)
// le couloir de service (plan V2, 11/10 : arrêté au mur sud du palier « 0 » du sous-sol, ligne 4,95, qui a suivi la
// porte grise)
const SV = { x0: 0, x1: 1.6, y0: 0, y1: 4.925 };
// (09/10 : la bande entre le C05 et le C01 est redistribuée d'après la photo 23 : une cloison nord-sud en x 8,925, les
// toilettes du C05 à l'ouest, le local et les toilettes PMR du C01 à l'est)
// (V2, 11/10 — iris_audit/plan_v2.md § 2.1 et § 2.2 : l'escalier principal et le C05 reculent de 4,675 m vers la rue, la
// salle d'attente de 4,20 m (lot C) ; derrière, le fond se desserre jusqu'au vrai fond du bâtiment, y 23,7 (IGN). Le mur
// des portes de l'escalier est la ligne Y_ESC, le mur safran la ligne 7,875 ; les toilettes perdent 0,65 m, le local
// 1,25 m, et la salle David Clark rentre dans le bâtiment)
const DY_S = -4.675;
const Y_ESC = 13.675 + DY_S;                                 // 9,0 : le mur des portes de l'escalier
// (13/10, lot C2 — le C01 refait sur la photo 01, js/carte_ecole.js `C01` : la porte du local est à l'entrée du couloir,
// y 8,58-9,41, celle des toilettes PMR en 10,80-11,73 — 1,65 m plus près de la salle d'attente ; la cloison entre les
// deux pièces passe de la ligne 12,025 à la ligne 10,6 : le local n'a plus que 2,58 m de profondeur, les toilettes PMR
// 2,23 ; derrière elles, jusqu'au fond du C01, un vide fermé)
const C01 = { yL: 8.995, lL: 0.83, yP: 11.265, lP: 0.93 };
const LT = { x0: 9.0, x1: 11.55, y0: 7.95, y1: 10.525 };     // le local technique (porte du C01, y 8,995)
// (13/10, lot C2 — le C05 refait sur la photo 23, js/carte_ecole.js `C05` : son mur est sur la ligne 5,995 (nu du couloir
// 5,92, nu des toilettes 6,07), son mur du fond en 12,71-12,86 ; les deux portes des toilettes ont des vantaux de 0,93,
// celui des femmes centré en 8,48, celui des hommes en 10,983 — la cloison entre les deux pièces recule de 17,5 cm, ligne
// 10,35, pour laisser son huisserie à la porte des hommes)
const C05 = { xO: 4.53, xE: 5.92, xM: 5.995, yFond: 12.71, lWC: 0.93, yF: 8.48, yH: 10.983 };
const WF = { x0: 6.07, x1: 8.85, y0: 7.95, y1: 10.275 };     // les toilettes femmes (porte du C05, y 8,48)
const WH = { x0: 6.07, x1: 8.85, y0: 10.425, y1: 13.925 };   // les toilettes hommes (porte du C05, y 10,983)
const PM = { x0: 9.0, x1: 11.55, y0: 10.675, y1: 12.9 };     // les toilettes PMR (porte du C01, y 11,265)
// (13/10, retour r06 de Haythem — la photo de la salle, « c'est la salle qui doit être là » : elle va jusqu'au fond du
// bâtiment, y 23,625 — 8,375 x 9,475 m, la réserve du fond imaginée y passe —, sous un plafond de dalles à 2,35)
const DC = { x0: 0.475, x1: 8.85, y0: 14.15, y1: 23.625, h: 2.35 };   // la salle David Clark, Si 0.2 (79 m²)
const DCE = { x0: 4.75, x1: C05.xE, y0: C05.yFond + 0.15, y1: 14.15 };   // son entrée, derrière la porte bleue du C05

// LES ZONES DE LUMIÈRE (js/ecole_lumieres.js) : rectangles en MONDE [x0, z0, x1, z1, hauteur mini], le point de prise de
// vue de la carte d'environnement (au-dessus des meubles, au milieu de la pièce)
const zone = (id, R, env) => ({ id, rects: [[R.x0, -R.y1, R.x1, -R.y0, -1]], voisines: [], env });
const ZONES = [
  // (11/10, plan V2 : la salle A est la Si 0.1 — jusqu'aux axes de ses murs, x 4,5-9,975 × y 0-4,8. Sans voisine, comme
  // les autres pièces : sa porte n'est pas une ouverture, et les spots de la salle d'attente, qui n'ont pas d'ombre,
  // l'éclaireraient à travers le mur)
  // (retour r02 du 11/10 : sans son angle nord-est, à l'antichambre — jusqu'à l'axe du retour x 9,165 au nord de y 3,1)
  // (r03, 12/10 : jusqu'à l'axe du mur sud de la salle d'attente, la ligne 4,6)
  { ...zone('si01', SA, { x: 7.7, y: 1.6, z: -2.45 }), rects: [[4.5, -(4.8 + DY_R03), 9.165, -SA.y0, -1], [9.165, -2.925, 9.975, -SA.y0, -1]] },
  // (10/10 : le bureau B a perdu son angle nord-est, le passage au sud-ouest de la pile du hall ; 11/10 : jusqu'aux axes de
  // ses murs — retour r02 : son mur nord est la ligne y 3,1, la ligne 2,925 à la relecture ; js/carte_ecole.js et
  // js/ecole_rdc_centre.js)
  { ...zone('bureauB', BB, { x: 11.0, y: 1.6, z: -1.6 }), rects: [[9.975, -2.925, 12.5, -BB.y0, -1], [12.5, -2.5, 13.275, -BB.y0, -1]] },
  { ...zone('service', SV, { x: 0.8, y: 1.5, z: -2.6 }), rects: [[0, -4.95, 1.675, 0, -1]] },
  zone('local', LT, { x: 10.3, y: 1.7, z: -9.05 }),
  // (relecture du 09/10 : les deux toilettes du C05 prennent leur vue HAUT, à 2,20 m, et loin des portes safran des
  // cabines — à 50 cm d'elles, à hauteur d'homme, la carte n'était qu'un mur safran : faïence, peinture, embrasure et
  // jusqu'au mur du C05 vu par la porte sortaient orangés. Femmes : côté porte ; hommes : devant les urinoirs)
  // (V2, 11/10 : la zone prend aussi l'embrasure de la porte, x 6,05-6,125 — elle n'était à personne)
  { ...zone('wcF', WF, { x: 6.5, y: 2.2, z: -8.6 }), rects: [[C05.xM, -WF.y1, WF.x1, -WF.y0, -1]] },
  { ...zone('wcH', WH, { x: 7.0, y: 2.2, z: -13.1 }), rects: [[C05.xM, -WH.y1, WH.x1, -WH.y0, -1]] },
  zone('pmr', PM, { x: 10.3, y: 1.5, z: -11.8 }),
  // (V2, 11/10 : la salle David Clark et son entrée, ouvertes sur le C05 par la porte bleue — `dc`, plan_v2.md § 2.2)
  // (r06, 13/10 : jusqu'au mur du fond, y 23,7 ; la carte prise dans l'allée du milieu, entre les rangées)
  { id: 'dc', rects: [[DC.x0 - 0.075, -(DC.y1 + 0.075), 8.925, -14.075, -1], [C05.xO, -14.075, C05.xM, -(C05.yFond + 0.075), -1]], voisines: ['c05'], env: { x: 4.95, y: 1.6, z: -19.6 } },
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
// (13/10, lot C2 — photo 23 à sa pose refaite : la plaque est presque CARRÉE, 18 x 19 cm — le même dessin sur un fond
// plus large)
function texPlaqueWC(picto) {
  return canvasTex(120, 128, (g, w0) => {
    g.fillStyle = '#2a2826'; g.fillRect(0, 0, w0, 128);
    const w = 96; g.translate((w0 - w) / 2, 0);
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
// LA PLAQUE DE LA SALLE (photo 23, à droite de la porte bleue) : noire, trois lignes blanches — « Si 0.2 », une salle
// informatique (l'annuaire du hall, VO 7,9-8,1 s ; 10/10). (11/10 : la même pour la Si 0.1 « Tim Berners-Lee »)
function texPlaqueSalle(nom = 'David Clark', code = 'Si 0.2') {
  return canvasTex(192, 112, (g, w, h) => {
    g.fillStyle = '#242322'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#f2f2f2'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    g.font = '600 19px "Segoe UI", Arial, sans-serif'; g.fillText('Salle', w / 2, 30);
    g.font = '500 21px "Segoe UI", Arial, sans-serif'; g.fillText(nom, w / 2, 62, w - 16);
    g.font = '600 19px "Segoe UI", Arial, sans-serif'; g.fillText(code, w / 2, 94);
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
// LA SALLE DAVID CLARK, ses matières dessinées (retour r06 du 13/10, sa photo) :
// LA MOQUETTE aiguilletée vert olive, mouchetée : un fond kaki, une nuée de points d'un ou deux millimètres — olive
// sombre, kaki clair, vert, brun —, quelques nuées plus larges et plus sombres (les passages, les taches de la photo,
// en bas à droite). Tuile de 2 m.
function texMoquette() {
  const W = TELEPHONE ? 256 : 512;
  return canvasTex(W, W, (g, w, h) => {
    const r = graine(6060), k = w / 512;
    g.fillStyle = '#827d58'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 26; i++) {
      const x = r() * w, y = r() * h, R = (30 + r() * 90) * k, d = r() < 0.6 ? -1 : 1;
      const gr = g.createRadialGradient(x, y, 0, x, y, R);
      gr.addColorStop(0, d < 0 ? 'rgba(52,50,28,0.16)' : 'rgba(150,142,96,0.12)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(x - R, y - R, 2 * R, 2 * R);
    }
    const tons = ['#58553d', '#5d5a3e', '#979070', '#aba682', '#6d7250', '#7a6e52', '#8a8562', '#4a4834'];
    for (let i = 0; i < w * h * 0.55; i++) {
      g.fillStyle = tons[(r() * tons.length) | 0]; g.globalAlpha = 0.35 + r() * 0.5;
      const s = (r() < 0.8 ? 1 : 2) * k;
      g.fillRect(r() * w, r() * h, s, s);
    }
    g.globalAlpha = 1;
  }, [1 / 2, 1 / 2], false, 8);
}
// LE LUMINAIRE ENCASTRÉ À GRILLE (ventelles), vu de dessous, allumé (photo r06 : le cadre blanc, les lames d'aluminium
// en travers et en long, des cellules bleutées où brillent les tubes) : `lx` x `ly` m, le long côté en u
function texLumGrille(lx, ly) {
  const W = (TELEPHONE ? 64 : 128) * Math.round(lx / 0.6), H = (TELEPHONE ? 64 : 128) * Math.round(ly / 0.6);
  return canvasTex(W, H, (g, w, h) => {
    // (photo r06 : le 60 x 60, quatre tubes et huit lames en travers ; le 60 x 120, trois rangs de huit cellules)
    const b = h * 0.05, nl = lx > 0.9 ? 3 : 4, nt = 8;
    g.fillStyle = '#eceae4'; g.fillRect(0, 0, w, h);
    const cw = (w - 2 * b) / nt, chh = (h - 2 * b) / nl;
    for (let j = 0; j < nl; j++) for (let i = 0; i < nt; i++) {
      const x = b + i * cw, y = b + j * chh;
      const gr = g.createLinearGradient(0, y, 0, y + chh);
      gr.addColorStop(0, '#8f9db2'); gr.addColorStop(0.45, '#e9f0fa'); gr.addColorStop(0.55, '#ffffff'); gr.addColorStop(1, '#7d8aa0');
      g.fillStyle = gr; g.fillRect(x, y, cw, chh);
      g.fillStyle = 'rgba(70,82,104,0.35)'; g.fillRect(x, y, cw * 0.18, chh); g.fillRect(x + cw * 0.82, y, cw * 0.18, chh);
    }
    g.fillStyle = '#f4f5f6';
    for (let i = 0; i <= nt; i++) g.fillRect(b + i * cw - w * 0.006, b, w * 0.012, h - 2 * b);
    for (let j = 0; j <= nl; j++) g.fillRect(b, b + j * chh - h * 0.012, w - 2 * b, h * 0.024);
    g.strokeStyle = 'rgba(0,0,0,0.3)'; g.lineWidth = 1; g.strokeRect(b, b, w - 2 * b, h - 2 * b);
  }, null, false, 4);
}
// LE PLATEAU DE HÊTRE clair des tables (photo r06 : presque miel sous la lumière) : un fil long et fin. Tuile : 2 m x
// 0,5 m (u le long de la table ; `enLong` : v le long, pour les tables nord-sud)
function texHetreDC(enLong) {
  return canvasTex(enLong ? 128 : 512, enLong ? 512 : 128, (g, w, h) => {
    const r = graine(1302);
    g.fillStyle = '#c99556'; g.fillRect(0, 0, w, h);
    if (enLong) { g.translate(w, 0); g.rotate(Math.PI / 2); }
    const L = enLong ? h : w, E = enLong ? w : h;
    for (let k = 0; k < 70; k++) {
      const y = r() * E, a = 0.05 + r() * 0.08, c = r() < 0.5 ? 'rgba(170,128,76,' : 'rgba(238,210,160,';
      g.strokeStyle = c + a + ')'; g.lineWidth = 0.6 + r() * 1.6;
      g.beginPath(); g.moveTo(0, y);
      for (let x = 0; x <= L; x += 32) g.lineTo(x, y + Math.sin(x * 0.01 + k) * 2.5);
      g.stroke();
    }
  }, enLong ? [1 / 0.5, 1 / 2] : [1 / 2, 1 / 0.5], false, 8);
}
// LE FAUX PLAFOND de la salle (photo r06) : des dalles minérales de 60 x 60 d'un blanc neutre, à peine mouchetées, dans
// une ossature dont on ne voit qu'un filet gris foncé, simple (celle du C05 a un T blanc bordé de deux feuillures). Tuile
// de 1,2 m (quatre dalles), le joint sur le bord.
function texDallesDC() {
  const W = TELEPHONE ? 256 : 512;
  return canvasTex(W, W, (g, w, h) => {
    const r = graine(6061), k = w / 512;
    g.fillStyle = '#ecebe7'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < w * h / 20; i++) { const v = 222 + (r() - 0.5) * 34; g.fillStyle = `rgba(${v},${v - 1},${v - 5},0.3)`; g.fillRect(r() * w, r() * h, k, k); }
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { const t = (r() - 0.5) * 8; g.fillStyle = `rgba(${128 + t},${128 + t},${128 + t},0.05)`; g.fillRect(i * w / 2, j * h / 2, w / 2, h / 2); }
    const L = Math.max(1, 2.4 * k);
    g.fillStyle = 'rgba(112,108,100,0.9)';
    for (let i = 0; i <= 2; i++) { g.fillRect(i * w / 2 - L / 2, 0, L, h); g.fillRect(0, i * h / 2 - L / 2, w, L); }
  }, [1 / 1.2, 1 / 1.2], false, 8);
}
// LES AURÉOLES DES LUMINAIRES SUR LE MUR OUEST (photo r06 : deux grandes taches claires sous les luminaires les plus
// proches du mur, coupées net en haut, à 1,9 m, et fondues vers le bas) : un dégradé posé sur le mur, additif
function texAureole() {
  return canvasTex(128, 128, (g, w, h) => {
    const gr = g.createRadialGradient(w / 2, h * 0.3, 0, w / 2, h * 0.3, w / 2);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.45, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const c = g.createLinearGradient(0, 0, 0, h * 0.22);
    c.addColorStop(0, 'rgba(0,0,0,1)'); c.addColorStop(1, 'rgba(0,0,0,0)');
    g.globalCompositeOperation = 'destination-out'; g.fillStyle = c; g.fillRect(0, 0, w, h * 0.22);
  }, null, true, 2);
}
// LA BOUCHE D'EXTRACTION du plafond (photo r06, en haut à gauche) : une platine blanche, un disque percé
function texBouche() {
  return canvasTex(128, 64, (g, w, h) => {
    g.fillStyle = '#f2f1ed'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#dedbd4'; g.beginPath(); g.arc(w * 0.62, h / 2, h * 0.42, 0, 7); g.fill();
    g.fillStyle = '#3c3a36';
    for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) if (i * i + j * j <= 10) { g.beginPath(); g.arc(w * 0.62 + i * 5, h / 2 + j * 5, 1.6, 0, 7); g.fill(); }
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

// L'AFFICHE DE LA PORTE DU BUREAU DE DIRECTION (photo 01 : collée dans le haut du vantail vitré, côté gonds) : une photo en
// noir et blanc, un étudiant en tee-shirt blanc sur un fond gris sombre, de trois quarts
function texAfficheEtudiant() {
  return canvasTex(176, 264, (g, w, h) => {
    const d = g.createLinearGradient(0, 0, w, h); d.addColorStop(0, '#5d5d5b'); d.addColorStop(1, '#262625');
    g.fillStyle = d; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(w * 0.62, 0, w * 0.38, h);
    // le tee-shirt blanc (épaules, manches), les bras croisés, sombres
    g.fillStyle = '#e6e5e1'; g.beginPath(); g.moveTo(w * 0.16, h); g.lineTo(w * 0.2, h * 0.5); g.quadraticCurveTo(w * 0.5, h * 0.38, w * 0.82, h * 0.5);
    g.lineTo(w * 0.88, h); g.closePath(); g.fill();
    g.fillStyle = '#c9c8c3'; g.fillRect(w * 0.2, h * 0.52, w * 0.1, h * 0.2); g.fillRect(w * 0.72, h * 0.52, w * 0.1, h * 0.2);
    g.fillStyle = '#4a4744'; g.beginPath(); g.ellipse(w * 0.52, h * 0.78, w * 0.3, h * 0.07, -0.08, 0, 7); g.fill();
    // le cou, le visage (de trois quarts), les cheveux courts
    g.fillStyle = '#9b9893'; g.fillRect(w * 0.45, h * 0.33, w * 0.12, h * 0.08);
    g.fillStyle = '#b3b0aa'; g.beginPath(); g.ellipse(w * 0.52, h * 0.26, w * 0.13, h * 0.1, 0.1, 0, 7); g.fill();
    g.fillStyle = '#1d1c1b'; g.beginPath(); g.ellipse(w * 0.5, h * 0.19, w * 0.14, h * 0.06, 0.1, Math.PI, 0); g.fill();
    g.fillStyle = 'rgba(30,30,30,0.5)'; g.fillRect(w * 0.47, h * 0.25, w * 0.04, h * 0.012); g.fillRect(w * 0.56, h * 0.25, w * 0.04, h * 0.012);
    // le bandeau de titre en bas
    g.fillStyle = 'rgba(245,245,240,0.92)'; g.fillRect(0, h * 0.9, w, h * 0.1);
    g.fillStyle = '#2b2b2b'; g.fillRect(w * 0.1, h * 0.935, w * 0.55, h * 0.025);
  }, null, false, 4);
}

// =====================================================================
//  LA Si 0.1 « TIM BERNERS-LEE » (l'ex-salle A, informatique ; IMAGINÉE)
// =====================================================================
// (11/10, plan V2 : l'annuaire du hall et sa plaque donnent Si 0.1 et Si 0.2 au niveau 0, côté ouest — la salle A est la
// Si 0.1. Elle perd 4,2 m de profondeur avec la salle d'attente, dont le mur sud est son mur nord : x 4,575-9,9 × y
// 0-4,725. Retour r02 du 11/10 : son angle nord-est, x 9,09-9,9 × y 3,0-4,725, est à l'antichambre — le mur sud de la
// salle d'attente s'arrête en x 9,24 — et sa porte est dans le retour x 9,165, y 3,58-4,38 (js/carte_ecole.js) : elle s'ouvre
// dans la salle et se rabat le long du mur nord.) (Retour r03 du 12/10 : la salle d'attente s'élargit de 0,20 vers la rue,
// la Si 0.1 n'a plus que 4,525 m de profondeur, y 0-4,525 : plus bas, RANGEES.)
// Deux rangs de cinq postes face au NORD (la toile descend devant les jours dépolis), tables arrêtées à x 9,4 : 0,5 m le
// long du mur est, là où la porte se rabat ; 0,6 m de passage derrière chaque rangée de chaises (le joueur en fait 0,6),
// 1,2 m d'une table à l'autre, 0,9 m devant le premier rang. L'allée ouest (1,4 m) mène à l'imprimante, dans
// l'angle sud-ouest, et au poste de l'enseignant, dans l'angle nord-ouest, contre le mur nord. Plus de sac, de patère ni
// de veste : « ne pas meubler l'imaginé ».
// (Vérification finale du 11/10, en marchant : on n'y entrait pas. Le long du mur est, les tables à x 9,4 ne laissaient
// que 0,5 m, et le coin du poste de l'enseignant passait à 0,64 m de celui du premier rang — 4 cm de jeu pour le joueur :
// de la porte, on ne quittait pas la bande devant la toile, et les dix chaises n'étaient proposées depuis aucun point
// atteint au pas de 5 cm. Les postes passent à 0,64 m, les tables s'arrêtent à x 9,12 — 0,78 m le long du mur est, de la
// porte au fond — et le poste de l'enseignant à x 5,25 — 0,81 m entre les deux coins.)
// (Retour r03 du 12/10 : la salle perd 0,20 m au nord — DY_R03. Le rang du fond recule de 0,05, la toile se plaque
// contre les jours, le poste de l'enseignant suit le mur nord ; les chaises se rangent 5 cm plus près des tables
// (0,33 du bord) et se relèvent à 0,5 m et non 0,55. Restent, au pas du joueur (0,60) : 0,61 entre les radiateurs et les
// chaises du premier rang, 0,61 entre ses tables et les chaises du fond, 0,64 entre le rang du fond et la toile — le
// passage depuis la porte, où se rabat le vantail —, et les points où l'on se relève sont libres.)
const RANGEES = [[1.3, 1.95], [3.1, 3.75]];          // (côté chaises, côté écrans)
const POSTES = [6.32, 6.96, 7.6, 8.24, 8.88];
function salleA(ch, P) {
  const { C } = ch;
  // la plinthe qui manque (le mur du passage, côté salle) et les radiateurs sous les fenêtres
  plinthe(ch, 'y', SA.x0, 0, SA.y1, 1);
  for (const c of [5.78, 7.43, 9.08]) radiateur(ch, c - 0.5, 0, c + 0.5, 0.09, 0.15, 0.78);
  // ---- les postes (0,68 m chacun : deux tables accolées, deux postes + trois postes) ----
  // (retour r02 du 11/10 : la porte est maintenant dans le retour x 9,165, au nord-est, et le mur y 3,1 ferme le haut de la
  // bande du mur est ; le retour mordait sur le bout du rang du fond, qui s'arrête à x 8,56, un poste de moins. De la
  // porte, on longe le mur nord entre le rang et la toile, puis l'allée ouest — entre le poste de l'enseignant et les
  // tables — mène aux deux rangs, et l'allée entre eux à la bande du mur est)
  let k = 0;
  for (const [ya, yb] of RANGEES) {
    const xFin = k ? 8.56 : 9.12;
    table(ch, P, 6.0, 7.278, ya, yb); table(ch, P, 7.282, xFin, ya, yb);
    POSTES.filter((x) => x < xFin - 0.2).forEach((x, i) => {
      ecranPC(ch, P, x, yb - 0.22, 0.745, 'S', P.ecrans[(k + i * 2) % P.ecrans.length]);
      clavier(ch, P, x - 0.04, ya + 0.2, 0.745, 'S');
      unite(ch, P, x + 0.2, yb - 0.26, 'S');
      // les chaises ne sont pas toutes rangées pile sous la table
      const r = graine(k * 11 + i * 3 + 1);
      chaiseBureau(ch, P, x + (r() - 0.5) * 0.08, ya - 0.33 - r() * 0.04, 'N', { rot: (r() - 0.5) * 0.35, rayon: 0.17, sortie: [0, -0.5] });
    });
    k++;
  }
  // un peu de vie : une gourde, un cahier
  const gourde = groupe(ch, 7.36, 3.4, 'S', 0.745); CY(gourde, P.bleu, 0.035, 0.22, 0, 0.11, 0, 14); CY(gourde, P.chrome, 0.025, 0.03, 0, 0.235, 0, 10);
  const cahier = groupe(ch, 8.72, 1.62, 'S', 0.745); B(cahier, P.jaune, 0.21, 0.012, 0.29, 0, 0.006, 0, { ombre: false }); cahier.rotation.y = 0.3;
  // ---- le poste de l'enseignant (devant à gauche pour les élèves), contre le mur nord ; il s'y assoit face au mur, son
  // écran tourné vers lui ; derrière le fauteuil, l'allée ouest reste libre (0,75 m jusqu'au premier rang) ----
  // (r03 : contre le mur nord, qui recule de 0,20 — DY_R03)
  const yN = DY_R03;
  table(ch, P, 4.63, 5.25, 4.1 + yN, 4.7 + yN, { voile: false });
  ecranPC(ch, P, 4.94, 4.5 + yN, 0.745, 'S', P.ecrans[4]);
  clavier(ch, P, 4.9, 4.24 + yN, 0.745, 'S');
  const doc = groupe(ch, 5.14, 4.32 + yN, 'S', 0.745); B(doc, P.blancMat, 0.21, 0.02, 0.3, 0, 0.01, 0, { ombre: false }); doc.rotation.y += 0.25;
  chaiseBureau(ch, P, 4.94, 3.72 + yN, 'N', { accoudoirs: true, nom: 'le fauteuil de l’enseignant', sortie: [0.55, -0.45] });
  corbeille(ch, P, 4.76, 3.3 + yN);
  C.ajouterCercle(4.76, -(3.3 + yN), 0.16, { y1: 0.4 });
  // ---- la toile de projection, descendue devant les jours dépolis, au droit des rangs ----
  // (r03 : plaquée contre le mur, son carter à 5 cm du nu, y 4,525 — y 4,42 et non 4,6 - 0,20)
  const tl = groupe(ch, 7.7, 4.42, 'S');
  CY(tl, P.blancMat, 0.055, 2.5, 0, 2.52, 0.0, 16).rotation.z = Math.PI / 2;                 // le carter
  for (const s of [-1, 1]) B(tl, P.plastiqueGris, 0.03, 0.06, 0.08, s * 1.27, 2.55, 0);      // les embouts
  plan(tl, P.diapo, 2.24, 1.37, 0, 1.76, 0.0);
  B(tl, P.plastique, 2.28, 0.03, 0.025, 0, 1.065, 0);                                        // la barre de charge
  CY(tl, P.plastiqueGris, 0.004, 0.25, 0.4, 0.93, 0.0, 4, { ombre: false });                  // la cordelette
  C.ajouterBoite(6.55, -4.39, 8.85, -4.47, { y0: 1.05, y1: 2.6 });
  // ---- le vidéoprojecteur au plafond, tourné vers la toile, à 3 m d'elle ----
  const vp = groupe(ch, 7.7, 1.6, 'N', 2.6);
  CY(vp, P.alu, 0.02, 0.22, 0, -0.11, 0, 8);
  B(vp, P.alu, 0.18, 0.02, 0.14, 0, -0.22, 0);
  R(vp, P.blancMat, 0.34, 0.11, 0.27, 0.025, 0, -0.29, 0);
  maille(new THREE.CylinderGeometry(0.035, 0.04, 0.025, 18), P.plastique, 0.07, -0.29, 0.14, 0, vp).rotation.x = Math.PI / 2;
  maille(new THREE.CircleGeometry(0.03, 18), P.led, 0.07, -0.29, 0.153, 0, vp, { ombre: false, recoit: false });
  B(vp, P.plastiqueGris, 0.12, 0.004, 0.1, -0.08, -0.234, 0, { ombre: false });
  vp.traverse((m) => { m.userData.horsAOSol = true; });
  // ---- le tableau blanc, au mur est, au droit du premier rang, son auget et ses feutres ----
  // (retour r02 du 11/10 : le mur est s'arrête à la ligne y 3,1 — le tableau, centré en 2,5, la débordait)
  const tb = groupe(ch, SA.x1, 1.55, 'W', 1.475);
  B(tb, P.alu, 1.64, 1.19, 0.022, 0, 0, 0.011);
  plan(tb, P.tableauBlanc, 1.6, 1.15, 0, 0, 0.0225);
  B(tb, P.alu, 1.2, 0.025, 0.07, 0, -0.6, 0.04);
  ['#1d4fa3', '#1e1e1e', '#c62828'].forEach((c, i) => {
    const f = CY(tb, new THREE.MeshStandardMaterial({ color: c, roughness: 0.5 }), 0.009, 0.13, -0.3 + i * 0.09, -0.578, 0.045, 8, { ombre: false });
    f.rotation.z = Math.PI / 2;
  });
  B(tb, P.plastiqueGris, 0.14, 0.035, 0.05, 0.3, -0.57, 0.045, { ombre: false });
  // l'horloge au-dessus
  const hz = groupe(ch, SA.x1, 1.55, 'W', 2.33);
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
  // ---- les dalles LED du plafond (sur la trame des plateaux 60 x 120 posée depuis l'angle x 4,575, y 0), au-dessus des
  // deux rangs ----
  for (const x of [6.675, 8.475]) for (const y of [1.8, 3.6]) dalleLED(ch, P, x, y, 2.6, 'si01');
  // le point d'accès wifi et le détecteur de fumée
  const ap = groupe(ch, 7.7, 2.55, 'S', 2.6); CY(ap, P.blancMat, 0.1, 0.035, 0, -0.018, 0, 24, { ombre: false }); maille(new THREE.CircleGeometry(0.012, 10), P.led, 0, -0.0365, 0.05, 0, ap, { recoit: false }).rotation.x = Math.PI / 2;
  const df = groupe(ch, 5.3, 2.4, 'S', 2.6); CY(df, P.blancMat, 0.055, 0.045, 0, -0.023, 0, 18, { ombre: false });
  for (const o of [ap, df]) o.traverse((m) => { m.userData.horsAOSol = true; });
  // ---- le fond de la classe : l'imprimante sur son meuble bas, dans l'angle sud-ouest ; deux affiches au mur de l'allée ----
  const im = groupe(ch, SA.x0 + 0.34, 0.42, 'E');
  B(im, P.grisClair, 0.5, 0.7, 0.55, 0, 0.35, 0);
  B(im, P.plastiqueGris, 0.46, 0.01, 0.5, 0, 0.705, 0, { ombre: false });
  R(im, P.blancMat, 0.46, 0.34, 0.44, 0.02, 0, 0.88, -0.01);
  B(im, P.plastiqueGris, 0.3, 0.012, 0.2, 0, 1.06, -0.04);
  B(im, P.plastique, 0.12, 0.05, 0.02, 0.12, 0.98, 0.215, { ombre: false });
  B(im, P.blancMat, 0.2, 0.004, 0.28, -0.05, 0.85, 0.05, { ombre: false });
  C.ajouterBoite(SA.x0 + 0.05, -0.15, SA.x0 + 0.63, -0.69, { y1: 1.1 });
  cadre(ch, P, new THREE.MeshStandardMaterial({ map: texAffiche('#7b2a6e', '#fbfbf8', 61), roughness: 0.6 }), SA.x0, 1.55, 'E', 0.52, 0.72, 1.6);
  cadre(ch, P, new THREE.MeshStandardMaterial({ map: texAffiche('#e9a01c', '#fbfbf8', 62), roughness: 0.6 }), SA.x0, 2.65, 'E', 0.52, 0.72, 1.6);
  // ---- LA PLAQUE « Salle Tim Berners-Lee — Si 0.1 », côté antichambre (IMAGINÉE, le modèle de celle de la Si 0.2,
  // photo 23) : sur le vantail, côté gonds — le bout de mur au nord de la porte porte déjà, de l'autre côté de l'angle, la
  // plaque du bureau de direction ; elle part avec lui ----
  // (retour r02 du 11/10 : la porte est dans le retour x 9,165 — la plaque sur la face du vantail tournée vers l'antichambre)
  const pSi = ch.portes.auto.find((Q) => Math.abs(Q.cx - 9.165) < 0.01 && Math.abs(Q.cz + 3.98) < 0.01);
  const vSi = pSi && pSi.vantaux[0];
  if (vSi) {
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.099), new THREE.MeshStandardMaterial({ map: texPlaqueSalle('Tim Berners-Lee', 'Si 0.1'), roughness: 0.4 }));
    pl.position.set(vSi.s * 0.22, 1.6, -pSi.cote * 0.024); pl.rotation.y = pSi.cote > 0 ? Math.PI : 0; pl.castShadow = false; vSi.g.add(pl);
  }
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
//  LE BUREAU DE DIRECTION B 0.3 (le « bureau B » ; IMAGINÉ, sauf sa porte)
// =====================================================================
// (11/10, plan V2 : son angle nord-est est écorné — js/carte_ecole.js — et sa porte vitrée est au bout du passage de la
// pile, dans le retour y 2,5, x 12,5-13,275 : elle s'ouvre dans le bureau, gonds à l'ouest. Retour r02 du 11/10 : son mur
// nord est la ligne y 3,1, d'un bout à l'autre — devant lui, l'antichambre par où r02 voit le hall. Le mobilier se
// range autour : le bureau de chêne et le fauteuil sous les deux fenêtres hautes, les chaises des visiteurs devant, la
// bibliothèque et le tableau au mur ouest, l'armoire au mur est, raccourcie au sud du débattement de la porte ; de la
// porte au fauteuil, on passe entre l'armoire et le bout du bureau, 0,86 m.)
function bureauB(ch, P) {
  const { C } = ch;
  plinthe(ch, 'y', BB.x1, 0, 0.3, -1);
  radiateur(ch, 11.15, 0, 12.05, 0.09, 0.15, 0.65);
  // le tapis (sous le bureau, le fauteuil et les chaises des visiteurs)
  const tapis = new THREE.MeshStandardMaterial({ map: texTapis(), roughness: 1 });
  // (relecture du 11/10 : le mur nord sur la ligne 2,925, nu sud 2,85 — le tapis, le bureau de chêne et tout ce qu'il porte
  // reculent encore de 0,1 m vers la façade, les chaises des visiteurs de 0,15, le fauteuil de 0,06)
  // (intégration v1.7 : encore 0,08 m vers la façade, tout le groupe du bureau de chêne — tapis, bureau, fauteuil, chaises
  // des visiteurs ; à 1,98, derrière les chaises, il ne restait que 0,62 m jusqu'au mur — 0,02 de jeu pour Haythem, rayon
  // 0,30 — et 0,25 entre l'angle du bureau et la plante : de la porte, on n'y passait qu'en forçant, et l'on se relevait de la
  // chaise ouest dans son propre cercle. Maintenant 0,70 derrière elles, et 0,35 au coin du bureau)
  ch.boite(10.25, 0.22, 12.25, 2.52, 0, 0.01, tapis, { ombre: false });
  // le bureau de chêne clair sur piètement noir, son caisson blanc
  ch.boite(10.4, 0.82, 11.9, 1.62, 0.72, 0.75, P.chene);
  for (const x of [10.44, 11.86]) for (const y of [0.86, 1.58]) ch.boite(x - 0.02, y - 0.02, x + 0.02, y + 0.02, 0.01, 0.72, P.noirMat);
  ch.boite(10.44, 1.56, 11.86, 1.58, 0.62, 0.7, P.noirMat, { ombre: false });
  ch.boite(11.38, 0.89, 11.82, 1.45, 0.02, 0.6, P.blancMat);
  for (const h of [0.08, 0.27, 0.45]) ch.boite(11.43, 0.875, 11.77, 0.89, h, h + 0.12, P.grisClair, { ombre: false });
  C.ajouterBoite(10.4, -0.82, 11.9, -1.62, { y1: 0.75 });
  // sur le bureau : l'écran, le portable ouvert, le téléphone, des papiers, la lampe, le pot à crayons
  ecranPC(ch, P, 11.02, 1.42, 0.75, 'S', P.ecrans[2]);
  clavier(ch, P, 10.98, 1.07, 0.75, 'S');
  const lp = groupe(ch, 11.6, 1.19, 'S', 0.75); lp.rotation.y = -0.35;
  R(lp, P.alu, 0.32, 0.016, 0.22, 0.006, 0, 0.008, 0, { ombre: false });
  const cou = new THREE.Group(); cou.position.set(0, 0.016, -0.11); cou.rotation.x = -0.25; lp.add(cou);
  B(cou, P.alu, 0.32, 0.21, 0.007, 0, 0.105, 0);
  plan(cou, P.ecrans[3], 0.3, 0.18, 0, 0.108, 0.0040);
  const tel = groupe(ch, 10.53, 1.32, 'S', 0.75); R(tel, P.plastique, 0.18, 0.05, 0.2, 0.015, 0, 0.025, 0, { ombre: false }); R(tel, P.plastique, 0.05, 0.035, 0.19, 0.015, -0.055, 0.065, 0, { ombre: false });
  const pap = groupe(ch, 10.56, 0.99, 'S', 0.75); pap.rotation.y = 0.2; B(pap, P.blancMat, 0.21, 0.012, 0.297, 0, 0.006, 0, { ombre: false });
  const lampe = groupe(ch, 11.78, 1.47, 'S', 0.75);
  CY(lampe, P.noirMat, 0.07, 0.015, 0, 0.008, 0, 18); CY(lampe, P.noirMat, 0.008, 0.42, 0, 0.22, 0, 6);
  maille(new THREE.ConeGeometry(0.08, 0.12, 18, 1, true), P.noirMat, -0.05, 0.43, 0.04, 0, lampe).rotation.z = 0.5;
  const pot = groupe(ch, 10.47, 1.52, 'S', 0.75); CY(pot, P.noirMat, 0.035, 0.1, 0, 0.05, 0, 14); for (let i = 0; i < 3; i++) CY(pot, [P.bleu, P.rouge, P.jaune][i], 0.005, 0.15, -0.012 + i * 0.012, 0.11, (i - 1) * 0.008, 6, { ombre: false });
  // le fauteuil (haut dossier), dont on se relève vers l'est, et les deux chaises visiteurs, devant la moitié ouest du
  // bureau ; à l'est, le passage de la porte vers le fond du bureau
  // (retour r02 du 11/10 : le bureau n'a plus que 3 m de profondeur, son mur nord en y 3,1 — le bureau de chêne, son
  // fauteuil et les chaises reculent de 0,2 m vers la façade ; on se relève des chaises derrière elles, à 0,3 m du mur)
  // (relecture : à 1,98, on se relève derrière elles à 0,52 — hors de leur propre cercle —, à 0,35 m du nu du mur)
  // (intégration v1.7 : à 1,90, on se relève derrière elles à 0,56 — leur cercle de 0,25 et le rayon de Haythem, 0,30 —, à
  // 0,39 m du nu du mur ; le fauteuil en 0,44)
  chaiseBureau(ch, P, 11.1, 0.44, 'N', { accoudoirs: true, haut: true, nom: 'le fauteuil du bureau', sortie: [0.75, 0] });
  chaiseLuge(ch, P, 10.3, 1.9, 'S', 0.1, [0.08, 0.56]);
  chaiseLuge(ch, P, 10.85, 1.9, 'S', -0.12, [0, 0.56]);
  // l'armoire (deux portes) au mur est, au sud du débattement de la porte (y 1,7-2,45)
  ch.boite(12.76, 0.3, 13.2, 1.5, 0, 1.98, P.grisClair, { collision: true });
  ch.boite(12.75, 0.31, 12.76, 0.895, 0.03, 1.95, P.blancMat, { ombre: false });
  ch.boite(12.75, 0.905, 12.76, 1.49, 0.03, 1.95, P.blancMat, { ombre: false });
  for (const y of [0.84, 0.96]) ch.boite(12.72, y - 0.01, 12.75, y + 0.01, 0.95, 1.2, P.chrome, { ombre: false });
  const boites = groupe(ch, 12.98, 0.9, 'W', 1.98);
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
  // le tableau (impression encadrée) au-dessus des chaises des visiteurs, la grande plante, le porte-manteau
  // (retour r02 du 11/10 : le mur nord en y 3,1 — le tableau redescend au-dessus des chaises, la plante passe dans l'angle
  // nord-est, à côté de la porte, hors de son passage)
  // (relecture : le mur nord en 2,925 — le tableau en 2,2, la plante en (12,1 ; 2,5), à 0,33 m des deux murs de l'angle)
  // (intégration v1.7 : la plante 5 cm plus avant dans l'angle, à 0,28 et 0,30 m des deux murs — son cercle de 0,23 fermait
  // avec l'angle du bureau de chêne le passage vers les chaises des visiteurs)
  cadre(ch, P, new THREE.MeshStandardMaterial({ map: texArt(), roughness: 0.7 }), BB.x0, 2.2, 'E', 0.82, 1.02, 1.62, { baguette: P.chene, ep: 0.03 });
  plante(ch, P, 12.15, 2.55, { h: 1.65, graineN: 3 });
  // (le porte-manteau : dans l'angle de la fenêtre, à côté de la bibliothèque — au nord, il fermait le passage ; 10/10)
  const pm = groupe(ch, 10.52, 0.24, 'S');
  CY(pm, P.noirMat, 0.17, 0.02, 0, 0.01, 0, 20); CY(pm, P.noirMat, 0.016, 1.75, 0, 0.88, 0, 8);
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.4; const c = CY(pm, P.noirMat, 0.008, 0.18, Math.sin(a) * 0.07, 1.67, Math.cos(a) * 0.07, 6, { ombre: false }); c.rotation.set(Math.cos(a) * 0.8, 0, -Math.sin(a) * 0.8); }
  vetement(pm, P.tissu, 0.0, 1.66, 0.12, { haut: 0.85, rot: 0.3 });  // un manteau sombre (devant le mât, qu'il frôle)
  C.ajouterCercle(10.52, -0.24, 0.2, { y1: 1.8 });
  corbeille(ch, P, 10.6, 0.62, null, 0.12, 0.3);
  // L'AFFICHE DE LA PORTE VITRÉE (photo 01 : vue du C01, de face, dans le haut du vantail, côté gonds ; son dos blanc côté
  // bureau) : elle part avec le vantail
  const pB = ch.portes.auto.find((Q) => Math.abs(Q.cx - 12.89) < 0.01 && Math.abs(Q.cz + 2.5) < 0.01);
  const vB = pB && pB.vantaux[0];
  if (vB) {
    const geo = new THREE.PlaneGeometry(0.44, 0.66);
    const af = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: texAfficheEtudiant(), roughness: 0.6 }));
    af.position.set(vB.s * 0.3, 1.66, -0.004); af.rotation.y = Math.PI; af.castShadow = false; af.userData.vitre = true; vB.g.add(af);
    const dos = new THREE.Mesh(geo, P.blancMat);
    dos.position.set(vB.s * 0.3, 1.66, 0.004); dos.castShadow = false; dos.userData.vitre = true; vB.g.add(dos);
  }
  // (10/10 : la plaque « Bureau B » a cédé la place à celle du bureau de direction B 0.3 et à son drapeau, VO q_0044 :
  // js/ecole_rdc_centre.js)
}
// LA CHAISE VISITEUR « luge » : tube chromé en traîneau, coque et dossier de tissu
function chaiseLuge(ch, P, x, y, face, rot = 0, sortie = null) {
  const g = groupe(ch, x, y, face); g.rotation.y += rot;
  for (const s of [-1, 1]) {
    const pa = CY(g, P.chrome, 0.011, 0.5, s * 0.22, 0.012, 0.0, 8); pa.rotation.x = Math.PI / 2;
    for (const z of [0.21, -0.21]) CY(g, P.chrome, 0.011, 0.44, s * 0.22, 0.23, z * 0.95, 8);
    const d = CY(g, P.chrome, 0.011, 0.45, s * 0.22, 0.68, -0.23, 8); d.rotation.x = -0.12;
  }
  R(g, P.tissu, 0.5, 0.06, 0.46, 0.025, 0, 0.47, 0.0);
  const dos = R(g, P.tissu, 0.48, 0.34, 0.05, 0.02, 0, 0.75, -0.24); dos.rotation.x = -0.12;
  ch.C.ajouterCercle(x, -y, 0.25, { y1: 0.95 });
  siege(ch, x, y, 0.47, face, 'la chaise', sortie || [-DIR[face][0] * 0.65, DIR[face][1] * 0.65]);
  return g;
}

// =====================================================================
//  LE COULOIR DE SERVICE
// =====================================================================
// Derrière la porte blanche « Sortie » du passage : un couloir de 1,6 m le long du mitoyen ouest qui mène à la porte de
// secours de la façade (travée 1). (Plan V2, 11/10 : fermé au nord, en y 4,925, par le mur sud du palier « 0 » du
// sous-sol — la porte grise du hall ouest ouvre sur ce palier : js/ecole_soussol.js, qui pose ce mur.) Au-delà, au-dessus
// du rampant de l'escalier, la réserve reste close.
function couloirService(ch, P) {
  const { M, C } = ch;
  // le mitoyen ouest (30 cm), jusqu'au mur du palier ; le mur nord de la réserve (sans porte : on ne la voit de nulle
  // part), dans l'alignement du mur nord de la cage de l'escalier principal (plan V2 : la réserve x 0-1,6, y 10,175-13,925)
  ch.mur({ de: [-0.15, 0], a: [-0.15, 5.0], ep: 0.3, mats: M.blanc, plinthes: ['E'] });
  ch.mur({ de: [-0.3, 14.0], a: [1.675, 14.0], mats: M.blanc });
  // les plinthes du mur du passage et du hall, côté couloir (la porte laissée libre)
  for (const [a0, a1] of [[0, 1.15], [2.05, SV.y1]]) plinthe(ch, 'y', SV.x1, a0, a1, -1);
  // le plafond de plâtre, les hublots, le bloc de sortie au-dessus de la porte de secours
  ch.plafond(SV.x0, SV.y0, SV.x1, SV.y1, 2.45, 'platre');
  for (const y of [1.0, 3.6]) ch.opale(0.8, y, 2.45, 'service', { r: 0.15 });
  ch.sortie(0.8, 0.12, 2.32, 'N');
  // LA PORTE DE SECOURS, vue de dedans : sa barre anti-panique (le vantail est au nu extérieur, y = -0,35)
  const bp = groupe(ch, 0.8, -0.35, 'N', 0);
  B(bp, P.inox, 0.74, 0.045, 0.05, 0, 0.98, 0.07);
  for (const s of [-1, 1]) R(bp, P.plastique, 0.07, 0.09, 0.09, 0.01, s * 0.38, 0.98, 0.045);
  plan(bp, new THREE.MeshStandardMaterial({ map: texIssue(), roughness: 0.5 }), 0.32, 0.12, 0, 1.55, 0.002);
  // ---- ce qu'on range dans un couloir de service (plan V2 : tout au sud de y 4,8, le couloir n'a plus que 4,9 m) ----
  // deux bacs roulants (couvercle jaune : le tri ; vert foncé : les ordures), contre le mitoyen
  [[1.6, P.jaune], [2.3, P.vert]].forEach(([y, couv]) => {
    const g = groupe(ch, 0.4, y, 'E');
    R(g, P.plastiqueGris, 0.58, 0.95, 0.68, 0.04, 0, 0.5, 0);
    R(g, couv, 0.6, 0.05, 0.72, 0.02, 0, 1.0, -0.01);
    for (const s of [-1, 1]) { const r = CY(g, P.plastique, 0.1, 0.05, s * 0.27, 0.1, -0.3, 14); r.rotation.z = Math.PI / 2; }
    B(g, P.plastique, 0.5, 0.04, 0.05, 0, 0.98, -0.37);
    C.ajouterBoite(0.04, -(y - 0.31), 0.76, -(y + 0.31), { y1: 1.05 });
  });
  // le chariot de ménage : cadre gris, seau jaune, sac bleu, balai (au fond du couloir, en travers, devant le mur du palier)
  const cm = groupe(ch, 0.85, 4.6, 'N');
  B(cm, P.plastiqueGris, 0.95, 0.03, 0.5, 0, 0.12, 0);
  B(cm, P.plastiqueGris, 0.95, 0.03, 0.5, 0, 0.62, 0);
  for (const [sx, sz] of [[-0.45, -0.23], [0.45, -0.23], [-0.45, 0.23], [0.45, 0.23]]) { CY(cm, P.plastiqueGris, 0.012, 0.95, sx, 0.55, sz, 6); CY(cm, P.plastique, 0.035, 0.03, sx, 0.035, sz, 10); }
  maille(new THREE.CylinderGeometry(0.17, 0.14, 0.26, 18), P.jaune, -0.22, 0.27, 0, 0, cm);
  R(cm, P.bleu, 0.36, 0.5, 0.36, 0.08, 0.24, 0.9, 0);
  const balai = CY(cm, P.alu, 0.012, 1.4, -0.3, 0.85, 0.05, 6); balai.rotation.z = 0.15;
  C.ajouterBoite(0.33, -4.32, 1.37, -4.88, { y1: 1.15 });
  // l'escabeau replié, appuyé au mitoyen, à côté de la porte de secours
  const es0 = groupe(ch, 0.2, 0.75, 'E'), es = new THREE.Group(); es.rotation.x = -0.12; es0.add(es);
  for (const s of [-1, 1]) B(es, P.alu, 0.04, 1.55, 0.025, s * 0.2, 0.775, 0);
  for (let i = 0; i < 4; i++) B(es, P.alu, 0.4, 0.02, 0.07, 0, 0.3 + i * 0.3, 0.02);
  C.ajouterBoite(0, -0.5, 0.2, -1.0, { y1: 1.6 });
  // les cartons empilés (09/10 : redescendus entre les bacs et la porte du passage — le nord du couloir est le palier)
  [[0.3, 2.95, 0, 0.55, 0.45, 0.4], [0.33, 3.5, 0, 0.5, 0.45, 0.35], [0.31, 3.2, 0.4, 0.45, 0.4, 0.3]].forEach(([x, y, h0, w, d, h]) => {
    const g = groupe(ch, x, y, 'E', h0); g.rotation.y += (x * 7) % 0.2 - 0.1; R(g, P.carton, d, h, w, 0.01, 0, h / 2, 0);
  });
  C.ajouterBoite(0.03, -2.68, 0.6, -3.76, { y1: 0.75 });
  // l'extincteur et son pictogramme, la goulotte électrique, le plan d'évacuation, le coffret électrique
  const ex = groupe(ch, 0.11, 3.95, 'E');
  CY(ex, P.rouge, 0.075, 0.48, 0, 1.2, 0, 16); CY(ex, P.noirMat, 0.04, 0.08, 0, 1.48, 0, 10);
  C.ajouterCercle(0.11, -3.95, 0.09, { y0: 0.9, y1: 1.6 });
  cadre(ch, P, new THREE.MeshStandardMaterial({ map: texPictoExtincteur(), roughness: 0.6 }), SV.x0, 3.95, 'E', 0.16, 0.16, 1.85, { ep: 0.004 });
  ch.boite(SV.x0, SV.y0, SV.x0 + 0.06, SV.y1, 2.2, 2.28, P.blancMat, { ombre: false });
  // (les consignes, sur le dos du mur du passage, en face des bacs)
  cadre(ch, P, new THREE.MeshStandardMaterial({ map: texConsignes(), roughness: 0.5 }), SV.x1, 3.0, 'W', 0.45, 0.62, 1.6, { ep: 0.01 });
  // (le coffret, au-dessus du chariot)
  const co = groupe(ch, SV.x0, 4.55, 'E', 1.5);
  B(co, P.grisClair, 0.45, 0.6, 0.14, 0, 0, 0.07); B(co, P.plastiqueGris, 0.08, 0.02, 0.02, 0.15, 0, 0.145, { ombre: false });
  C.ajouterBoite(SV.x0, -4.32, SV.x0 + 0.15, -4.78, { y0: 1.2, y1: 1.8 });
}

// =====================================================================
//  LA BANDE ENTRE LE C05 ET LE C01 : ses cloisons (09/10)
// =====================================================================
// La photo 23 montre deux portes de toilettes dans le mur est du C05 (femmes au sud, hommes au nord) ; la porte PMR du
// C01 garde les toilettes PMR (sa plaque, photo 01) et celle du sud le local. Une cloison nord-sud en x 8,925 partage la
// bande : à l'ouest les toilettes du C05, l'une derrière l'autre ; à l'est le local, puis les toilettes PMR. Au nord,
// cette cloison devient le mur est de la salle David Clark (V2, 11/10 : du mur safran, y 7,875, au mur nord de la salle,
// y 21,0, puis au fond du bâtiment, 23,7 — r06 ; derrière elle, au nord du C01, le local du fond, fermé — plan_v2.md § 2.2).
function cloisonsBande(ch) {
  const B0 = ch.M.blanc;
  // (13/10, lot C2 : la cloison local / PMR sur la ligne 10,6 ; le fond des toilettes PMR sur la ligne 12,975)
  const yLP = (LT.y1 + PM.y0) / 2;
  ch.mur({ de: [8.925, 7.875], a: [8.925, yLP], mats: B0, plinthes: ['E'] });
  ch.mur({ de: [8.925, yLP], a: [8.925, 14.075], mats: B0 });
  // (r06, 13/10 : jusqu'au mur du fond, y 23,7 — la salle David Clark prend la réserve du fond ; sa plinthe est grise)
  ch.mur({ de: [8.925, 14.075], a: [8.925, DC.y1 + 0.15], mats: { W: matDC(ch.M).mur, E: B0 } });
  ch.mur({ de: [C05.xM, (WF.y1 + WH.y0) / 2], a: [8.925, (WF.y1 + WH.y0) / 2], mats: B0 });   // femmes / hommes (13/10 : ligne 10,35)
  ch.mur({ de: [8.925, yLP], a: [11.625, yLP], mats: B0, plinthes: ['S'] });            // local / PMR
  ch.mur({ de: [8.925, PM.y1 + 0.075], a: [11.55, PM.y1 + 0.075], mats: B0 });          // le fond des toilettes PMR
  ch.mur({ de: [8.925, 14.475], a: [11.55, 14.475], mats: B0 });                        // (et celui du vide fermé, derrière elles)
}

// =====================================================================
//  LE LOCAL TECHNIQUE (x 9,0-11,55, y 7,95-11,95)
// =====================================================================
// Sa porte du C01 (y 10,6, gonds au nord) : rien devant elle (x 10,6-11,55, y 10,05-11,15). (V2, 11/10 : 4,0 m de
// profondeur au lieu de 5,25 — une seule étagère, les baies au mur nord, l'établi au mur sud ; on y circule.)
function localTechnique(ch, P) {
  const { M, C } = ch;
  // le plafond (la dalle brute) ; les plinthes qui manquent (le dos du mur safran, le mur du C01)
  ch.plafond(LT.x0, LT.y0, LT.x1, LT.y1, H_DALLE, 'platre');
  plinthe(ch, 'x', LT.y0, LT.x0, LT.x1, 1);
  for (const [a0, a1] of [[LT.y0, C01.yL - C01.lL / 2 - 0.045], [C01.yL + C01.lL / 2 + 0.045, LT.y1]]) plinthe(ch, 'y', LT.x1, a0, a1, -1);
  // ---- les deux baies serveurs (42 U) au mur nord, leurs diodes qui clignotent ----
  const face = new THREE.MeshStandardMaterial({ map: texBaie(), roughness: 0.6 });
  const diodes = texDiodes(); diodes.repeat.set(1, 0.5);
  const yB = LT.y1 - 0.52;
  for (const [x, ph] of [[9.45, 0], [10.1, 1]]) {
    const g = groupe(ch, x, yB, 'S');
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
    C.ajouterBoite(x - 0.3, -(yB - 0.5), x + 0.3, -(yB + 0.5), { y1: 2.05 });
  }
  // l'onduleur à côté des baies ; le tableau électrique (TGBT) au mur du C01, au nord de la porte
  ch.boite(10.55, LT.y1 - 0.7, 11.0, LT.y1 - 0.01, 0, 0.92, P.plastique, { collision: true });
  ch.boite(10.6, LT.y1 - 0.71, 10.95, LT.y1 - 0.7, 0.75, 0.85, P.plastiqueGris, { ombre: false });
  maille(new THREE.CircleGeometry(0.008, 8), P.led, 10.9, 0.8, -(LT.y1 - 0.712), 0, ch.decor, { ombre: false });
  const te = groupe(ch, LT.x1, LT.y1 - 0.47, 'W', 0.35);
  B(te, P.grisClair, 0.8, 1.7, 0.25, 0, 0.85, 0.125);
  plan(te, new THREE.MeshStandardMaterial({ map: texTableauElec(), roughness: 0.55 }), 0.76, 1.66, 0, 0.85, 0.2505);
  B(te, P.plastiqueGris, 0.03, 0.12, 0.03, 0.32, 0.85, 0.265, { ombre: false });
  C.ajouterBoite(LT.x1 - 0.28, -(LT.y1 - 0.87), LT.x1, -(LT.y1 - 0.07), { y0: 0.35, y1: 2.05 });
  // l'étagère métallique du mur ouest : cartons d'archives, ramettes, vieux écrans, rouleaux de câble
  // (13/10, lot C2 : le local n'a plus que 2,58 m de profondeur — plus d'étagère au mur ouest, elle entrait dans les baies)
  for (const [yc, gn] of []) {
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
  // le climatiseur (unité murale) au-dessus de l'étagère
  const cl = groupe(ch, LT.x0, 9.0, 'E', 2.55);
  R(cl, P.blancMat, 0.9, 0.3, 0.22, 0.04, 0, 0.15, 0.11);
  B(cl, P.plastiqueGris, 0.8, 0.012, 0.06, 0, 0.02, 0.19, { ombre: false });
  maille(new THREE.CircleGeometry(0.006, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.4, 1.8, 2.4) }), 0.33, 0.2, 0.221, 0, cl, { ombre: false });
  // l'établi contre le mur sud (le dos du mur safran) : plateau gris, portable ouvert (un terminal), écran, commutateur,
  // boîte à outils ; la chaise
  table(ch, P, 9.6, 11.2, LT.y0 + 0.7, LT.y0 + 0.02, { voile: false, mat: P.grisClair });
  ecranPC(ch, P, 10.75, LT.y0 + 0.2, 0.745, 'N', P.ecrans[1]);
  const lpt = groupe(ch, 10.1, LT.y0 + 0.3, 'N', 0.745); lpt.rotation.y += 0.3;
  R(lpt, P.plastique, 0.34, 0.018, 0.23, 0.006, 0, 0.009, 0, { ombre: false });
  const lid = new THREE.Group(); lid.position.set(0, 0.018, -0.115); lid.rotation.x = -0.28; lpt.add(lid);
  B(lid, P.plastique, 0.34, 0.22, 0.008, 0, 0.11, 0); plan(lid, P.ecrans[1], 0.31, 0.19, 0, 0.113, 0.0045);
  const sw = groupe(ch, 9.76, LT.y0 + 0.18, 'N', 0.745); B(sw, P.plastiqueGris, 0.3, 0.045, 0.24, 0, 0.0225, 0);
  for (let i = 0; i < 6; i++) { B(sw, P.plastique, 0.025, 0.018, 0.004, -0.11 + i * 0.045, 0.024, 0.121, { ombre: false }); B(sw, i % 3 ? P.bleu : P.jaune, 0.012, 0.012, 0.05, -0.11 + i * 0.045, 0.024, 0.145, { ombre: false }); }
  const bo = groupe(ch, 11.0, LT.y0 + 0.4, 'N', 0.745); R(bo, P.rouge, 0.3, 0.16, 0.18, 0.02, 0, 0.08, 0); B(bo, P.noirMat, 0.18, 0.02, 0.03, 0, 0.175, 0);
  chaiseBureau(ch, P, 10.35, LT.y0 + 1.1, 'S', { nom: 'la chaise de l’établi', sortie: [0, 0.65] });
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
  chemin(9.15, yB, 11.3, yB);
  chemin(11.2, LT.y0 + 0.25, 11.2, yB - 0.15);
  // (intégration du 10/10 : pour la caméra, un plafond sous les chemins et les réglettes — vue plongeante depuis
  // l'établi, à 2,91 m, elle entrait dans le chemin du nord)
  ch.C.plafond(LT.x0, -LT.y0, LT.x1, -LT.y1, 2.85, 0.4);
  for (const x of [9.45, 10.1]) for (const [dx, dy, m] of [[-0.03, 0, P.bleu], [0.0, 0.03, P.bleu], [0.03, -0.01, P.jaune], [0.0, -0.03, P.bleu]]) {
    CY(ch.decor, m, 0.009, 0.86, x + dx, 2.43, -(yB + dy), 6, { ombre: false });
  }
  // deux réglettes LED suspendues, dans la longueur du local : des LAMPES (type tube)
  for (const y of [8.6, 9.85]) {
    const g = groupe(ch, 10.25, y, 'S', 2.92);
    B(g, P.blancMat, 0.08, 0.06, 1.25, 0, 0, 0);
    maille(boiteM(0.06, 0.005, 1.2), P.led, 0, -0.032, 0, 0, g, { ombre: false, recoit: false });
    for (const z of [-0.45, 0.45]) CY(g, P.metal, 0.002, H_DALLE - 2.95, 0, (H_DALLE - 2.95) / 2 + 0.03, z, 4, { ombre: false });
    g.traverse((m) => { m.userData.horsAOSol = true; m.castShadow = false; });
    ch.lampes.push({ x: 10.25, z: -y, h: 2.9, zone: 'local', type: 'tube', force: 1.0, cuireForce: 1.05 });
  }
  // l'extincteur CO2 près de la porte (au sud : au nord, le tableau électrique)
  const ex = groupe(ch, LT.x1 - 0.1, 8.32, 'W');
  CY(ex, P.rouge, 0.07, 0.55, 0, 1.2, 0, 16); CY(ex, P.noirMat, 0.035, 0.1, 0, 1.52, 0, 10);
  const cor = CY(ex, P.noirMat, 0.03, 0.18, 0.08, 1.35, 0.0, 10); cor.rotation.z = 0.5;
  C.ajouterCercle(LT.x1 - 0.1, -8.32, 0.09, { y0: 0.9, y1: 1.6 });
  // la plaque « Local technique » côté C01, contre l'huisserie sud de la porte (photo 01 : la petite plaque noire)
  // (13/10, lot C2 — photo 01 à sa pose refaite : sur le bout de mur entre l'angle de l'entrée et l'huisserie, à 0,2 m
  // de l'angle, de 1,55 à 1,77 m ; elle était au sud de la porte, mais 1,65 m plus loin dans le couloir)
  cadre(ch, P, new THREE.MeshStandardMaterial({ map: texPlaque('Local technique', 'eclair'), roughness: 0.4 }), 11.7, 8.02, 'E', 0.18, 0.19, 1.66, { ep: 0.006 });
  // LES DEUX AFFICHETTES du vantail (photo 01) : l'une au-dessus de l'autre, au milieu — une étiquette sombre, bleu nuit,
  // de 1,61 à 1,81 m, une feuille blanche dessous, de 1,34 à 1,59 ; elles partent avec le vantail
  {
    const porte = ch.portes.auto.find((q) => Math.abs(q.cx - 11.625) < 0.01 && Math.abs(q.cz + C01.yL) < 0.01), v = porte && porte.vantaux[0];
    if (v) {
      const feuilles = [[new THREE.MeshStandardMaterial({ map: texAffiche('#f4f4f0', '#1f2a4a', 31), roughness: 0.6 }), 0.105, 0.2, 1.71], [new THREE.MeshStandardMaterial({ map: texConsignes(), roughness: 0.75 }), 0.17, 0.25, 1.465]];
      for (const [mat, w, h, hc] of feuilles) { const a = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); a.position.set(v.s * C01.lL / 2, hc, 0.0235); a.castShadow = false; v.g.add(a); }
    }
  }
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
// la porte, et non plus 0,72.) (V2, 11/10 : le mur est du C05 est la ligne x 6,05, sa face ouest en 5,975. Relecture du
// 11/10, photo 23 à sa pose, jeu à la même pose : les deux plaques sont à 1,60-1,65 m de leur milieu, pas 1,54 — dans le
// jeu, elles tombaient 0,1 m sous celles de la photo)
let _affichesWC = null;
function signaletiqueC05(ch, P, yPorte, picto) {
  // (13/10, lot C2 — photo 23 à sa pose refaite, f 1 600 : les deux plaques font 18 x 19 cm, de 1,51 à 1,70 m, leur
  // bord à 5 cm de l'huisserie — centre à 0,66 du milieu d'une porte de 0,93 ; elles faisaient 12 x 16)
  cadre(ch, P, new THREE.MeshStandardMaterial({ map: texPlaqueWC(picto), roughness: 0.4 }), C05.xE, yPorte + 0.66, 'W', 0.18, 0.19, 1.605, { ep: 0.005 });
  if (!_affichesWC) _affichesWC = [texAfficheProtections(), texAffichePersonnages()].map((t) => new THREE.MeshStandardMaterial({ map: t, roughness: 0.75 }));
  const porte = ch.portes.auto.find((q) => Math.abs(q.cx - C05.xM) < 0.01 && Math.abs(q.cz + yPorte) < 0.01);
  const v = porte && porte.vantaux[0];
  if (!v) return;
  // (dans le repère du vantail : le gond en x = 0, le vantail vers +x — le nord —, la face du C05 en -z ; la fente
  // vitrée a son axe à 0,20 du bord libre, son noyer s'arrête à 0,305 : la première affiche juste à côté, à un doigt, la
  // seconde vers les gonds ; de 1,32 à 1,62 m, au-dessus de la béquille, photo 23 — relecture du 11/10, à sa pose :
  // 1,31-1,62, le jeu les mettait 5 cm plus bas)
  // (13/10, lot C2 — la pose refaite, f 1 600 : l'affiche orange est bien une A4, 0,205 de large ; son bord nord à
  // 0,40 du chant libre, contre le noyer de la fente, de 1,275 à 1,575 m — 4,5 cm plus bas qu'au jeu ; sur un vantail de
  // 0,93 : centres à 0,4275 et 0,2125 des gonds)
  [[0.4275, 0], [0.2125, 1]].forEach(([x, k]) => {
    const a = new THREE.Mesh(new THREE.PlaneGeometry(0.205, 0.29), _affichesWC[k]);
    a.position.set(x, 1.425 + k * 0.012, -0.0235); a.rotation.y = Math.PI; a.rotation.z = (k ? -0.012 : 0.008); a.castShadow = false;
    v.g.add(a);
  });
}

// LES TOILETTES FEMMES (x 6,125-8,85, y 7,95-10,45 ; porte du C05 en y 8,575) : V2, 11/10 — 2,5 m de profondeur au lieu
// de 3,15 : deux cabines le long du mur est, les vasques au mur ouest au nord de la porte, le sèche-mains et la poubelle
// au mur sud (le dos du mur safran), à l'écart du chemin des cabines
// (13/10, lot C2 — le C05 refait sur la photo 23 : la porte en y 8,48, un vantail de 0,93 qui s'ouvre vers la pièce, ses
// gonds à 6,5 cm du mur sud ; la pièce va de x 6,07 à 8,85 et de y 7,95 à 10,275 — 2,33 m de profondeur.)
function toilettesFemmes(ch, P) {
  const yP = C05.yF, dl = C05.lWC / 2;
  ch.plafond(WF.x0, WF.y0, WF.x1, WF.y1, 2.5, 'platre');
  faience(ch, P, WF, [['W', yP - dl - 0.05, yP + dl + 0.05]]);
  solGres(ch, WF);
  ch.boite(C05.xE, yP - dl, WF.x0 + 0.05, yP + dl, 0, 0.005, P.inox, { ombre: false });       // la barre de seuil
  const yM = (WF.y0 + WF.y1) / 2, bords = [WF.y0 + 0.012, yM, WF.y1 - 0.012];
  cabines(ch, P, 7.4, WF.x1 - 0.012, bords);
  lavabos(ch, P, WF, yP + dl + 0.12, WF.y1 - 0.012, 'wcF', [[yM + 0.155, WF.y1 - 0.167]]);
  // (relecture du 11/10 : le vantail, gonds au sud, balaie sa largeur dans la pièce — ouvert à 83°, son bout passait
  // dans la poubelle en (7,0 ; 8,16) ; elle et le sèche-mains glissent contre la première cabine. 13/10 : un vantail de
  // 0,93 — son bout passe en x 7,0 ; ils reculent de 5 cm vers les cabines)
  secheMains(ch, P, 7.22, WF.y0 + 0.012, 'N');
  poubelleWC(ch, P, 7.22, 8.12);
  for (const [x, y] of [[6.65, 8.5], [6.65, 9.72], [8.1, yM]]) ch.spot(x, y, 2.5, 'wcF');
  signaletiqueC05(ch, P, yP, 'femme');
}
// LES TOILETTES HOMMES (x 6,125-8,85, y 10,6-13,925 ; porte du C05 en y 11,05) : deux cabines le long du mur est, trois
// urinoirs et leurs écrans au mur nord, les vasques au mur ouest au nord de la porte, le sèche-mains et la poubelle dans
// l'angle nord-ouest (V2, 11/10 : la porte est maintenant au bout sud de la pièce — plus de cul-de-sac au sud d'elle)
function toilettesHommes(ch, P) {
  // (13/10, lot C2 — le C05 refait sur la photo 23 : la porte en y 10,983, un vantail de 0,93 ; la pièce commence en
  // y 10,425 et en x 6,07 ; les cabines et les vasques suivent)
  const { C } = ch, yP = C05.yH, dl = C05.lWC / 2;
  ch.plafond(WH.x0, WH.y0, WH.x1, WH.y1, 2.5, 'platre');
  faience(ch, P, WH, [['W', yP - dl - 0.05, yP + dl + 0.05]]);
  solGres(ch, WH);
  ch.boite(C05.xE, yP - dl, WH.x0 + 0.05, yP + dl, 0, 0.005, P.inox, { ombre: false });
  cabines(ch, P, 7.4, WH.x1 - 0.012, [WH.y0 + 0.012, 11.56, 12.69], { fermer: [12.69] });
  lavabos(ch, P, WH, yP + dl + 0.12, 12.92, 'wcH', [[11.715, 12.535]]);
  // les urinoirs (céramique suspendue, chasse chromée) et les écrans de séparation gris
  const yN = WH.y1 - 0.012;
  for (const x of [7.1, 7.72, 8.34]) urinoir(ch, P, x, yN);
  for (const x of [6.79, 7.41, 8.03]) {
    ch.boite(x - 0.015, yN - 0.42, x + 0.015, yN, 0.55, 1.35, P.grisHPL);
    ch.boite(x - 0.017, yN - 0.44, x + 0.017, yN - 0.42, 0.55, 1.35, P.inox, { ombre: false });
  }
  C.ajouterBoite(6.77, -(yN - 0.45), 8.6, -yN, { y0: 0.3, y1: 1.4 });
  secheMains(ch, P, WH.x0 + 0.012, 13.38, 'E');
  poubelleWC(ch, P, WH.x0 + 0.275, 13.62);
  // le panneau jaune « sol glissant » des anciennes toilettes (relecture du 09/10 : il s'était perdu en route), dans
  // l'angle entre la seconde cabine et le dernier urinoir, tourné vers la porte — il ne gêne pas le chemin des urinoirs
  const pn = groupe(ch, 8.58, 12.93, 'W'); pn.rotation.y -= 0.45;
  const plq = new THREE.MeshStandardMaterial({ map: texSolGlissant(), roughness: 0.5, side: THREE.DoubleSide });
  for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.6), plq); p.position.set(0, 0.29, s * 0.1); p.rotation.x = s * -0.32; p.castShadow = true; pn.add(p); }
  C.ajouterCercle(8.58, -12.93, 0.2, { y1: 0.62 });
  for (const [x, y] of [[6.6, 11.2], [6.9, 13.15], [7.95, 11.65], [8.0, 13.15]]) ch.spot(x, y, 2.5, 'wcH');
  signaletiqueC05(ch, P, yP, 'homme');
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
// LES TOILETTES PMR (x 9,0-11,55, y 12,1-14,4 ; porte du C01 en y 12,9) : la cuvette contre le mur nord, la barre
// d'appui au mur ouest et la barre relevable à côté (le transfert se fait par l'est), le lave-mains accessible au mur
// ouest et son miroir, le cordon d'appel rouge ; un cercle de 1,50 m libre au milieu (V2, 11/10 : centré en (10,3 ;
// 13,25), la pièce n'a plus que 2,3 m de profondeur). (Relecture du 11/10 : la porte recule à 12,9, photo 01 recalée —
// js/carte_ecole.js ; la poubelle passe sous le sèche-mains, hors du balayage du vantail)
function toilettesPMR(ch, P) {
  // (13/10, lot C2 — photo 01 à sa pose refaite : la porte en y 10,80-11,73, la pièce de 10,675 à 12,9)
  const { C } = ch, yP = C01.yP;
  ch.plafond(PM.x0, PM.y0, PM.x1, PM.y1, 2.5, 'platre');
  faience(ch, P, PM, [['E', yP - 0.51, yP + 0.51]]);
  solGres(ch, PM);
  ch.boite(11.5, yP - 0.47, 11.7, yP + 0.47, 0, 0.005, P.inox, { ombre: false });
  for (const [x, y] of [[10.3, PM.y0 + 0.65], [9.95, PM.y1 - 0.65]]) ch.spot(x, y, 2.5, 'pmr');
  wcSuspendu(ch, P, 9.48, PM.y1 - 0.012, 'S');
  C.ajouterCercle(9.48, -(PM.y1 - 0.3), 0.24, { y1: 0.5 });
  const ba = groupe(ch, PM.x0 + 0.012, PM.y1 - 0.6, 'E', 0.8);
  const barre = CY(ba, P.inox, 0.017, 0.7, 0, 0, 0.07, 10, { ombre: false }); barre.rotation.z = Math.PI / 2;
  for (const s of [-1, 1]) { const p = CY(ba, P.inox, 0.017, 0.07, s * 0.33, 0, 0.035, 8, { ombre: false }); p.rotation.x = Math.PI / 2; }
  const rel = groupe(ch, 9.86, PM.y1 - 0.012, 'S', 0.8); B(rel, P.inox, 0.03, 0.03, 0.75, 0, 0, 0.37, { ombre: false }); B(rel, P.inox, 0.06, 0.12, 0.04, 0, 0, 0.0, { ombre: false });
  // le cordon d'appel (rouge), à portée de la cuvette
  const yc = PM.y1 - 1.1;
  ch.boite(PM.x0 + 0.012, yc, PM.x0 + 0.04, yc + 0.08, 2.05, 2.15, P.blancMat, { ombre: false });
  ch.boite(PM.x0 + 0.03, yc + 0.035, PM.x0 + 0.036, yc + 0.045, 0.25, 2.05, P.rouge, { ombre: false });
  ch.boite(PM.x0 + 0.02, yc + 0.02, PM.x0 + 0.045, yc + 0.06, 0.22, 0.28, P.rouge, { ombre: false });
  // le lave-mains (rien dessous : on y vient en fauteuil), son robinet mural, le miroir, le distributeur
  const yL = PM.y0 + 0.7;
  const lv = groupe(ch, PM.x0 + 0.012, yL, 'E', 0.8);
  B(lv, P.ceramique, 0.45, 0.04, 0.32, 0, 0, 0.172);
  vasque(lv, P, 0, 0.02, 0.18, 0.75);
  robinetMural(lv, P, 0, 0.17, 0.012, 0.14);
  C.ajouterBoite(PM.x0, -(yL - 0.23), PM.x0 + 0.34, -(yL + 0.23), { y0: 0.7, y1: 0.85 });
  miroir(ch, P, PM.x0 + 0.012, yL, 1.4, 0.5, 0.7, 'E', PM);
  const sav = groupe(ch, PM.x0 + 0.012, yL + 0.41, 'E', 1.05); R(sav, P.blancMat, 0.1, 0.18, 0.09, 0.02, 0, 0.09, 0.045);
  secheMains(ch, P, 10.5, PM.y0 + 0.012, 'N');
  poubelleWC(ch, P, 10.5, PM.y0 + 0.2);
  // la plaque côté C01, au sud de la porte, contre son huisserie (photo 01 : le fauteuil roulant et « Toilettes »). Relecture
  // du 11/10, à la pose refaite : y 12,21-12,39, de 1,51 à 1,66 m — la plaque des toilettes du C05, 0,12 x 0,16 ; elle
  // faisait 0,15 x 0,20 et paraissait, au même point de vue, deux fois plus haute que sur la photo
  // (13/10, lot C2 — la pose refaite, f 650 : y 10,56-10,74, de 1,515 à 1,68 m — la même plaque de 18 x 19 que celles
  // du C05, son bord à 6 cm du vantail)
  cadre(ch, P, new THREE.MeshStandardMaterial({ map: texPlaqueWC('pmr'), roughness: 0.4 }), 11.7, yP - C01.lP / 2 - 0.15, 'E', 0.18, 0.19, 1.6, { ep: 0.005 });
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
//  LA SALLE DAVID CLARK (Si 0.2), derrière la porte bleue du fond du C05
// =====================================================================
// (09/10) La photo 23 montre, à droite de la porte bleue, une plaque de salle à trois lignes ; l'annuaire de la pile, sur
// la vidéo officielle, lit « Si 0.1 » et « Si 0.2 » — des salles informatiques. (V2, 11/10 : elle commence derrière la
// porte bleue et son entrée de 1,225 x 1,325.)
// LE RETOUR r06 DE HAYTHEM (13/10, 14 h 58) : la photo de la salle et sa capture du jeu devant la porte bleue entrouverte —
// « c'est la salle qui doit être là ». La salle IMAGINÉE de la v1.9 (bureaux blancs, carrelage gris foncé, chaises
// grises, deux fenêtres sur une courette) était fausse : elle est refaite entière sur la photo, rejouée à sa pose.
// LA POSE (photo d'agence grand-angle, 558 x 397 px) : les deux points de fuite des joints du plafond, (503 ; 206) et
// (−42 ; 206), donnent la focale (268 px, 92° de champ) et le cap ; les dalles de 60, comptées dans les deux sens (0,586
// fois la hauteur sous plafond de l'appareil par dalle), cette hauteur : 1,02 m ; la profondeur des tables du mur ouest
// (0,70) et l'armoire (1,95), la hauteur de l'appareil : 1,32. Il est sur le SEUIL, en (5,35 ; 14,49), cap −40 (vers le
// nord-ouest) : le mur ouest à 4,87 m — le nu 0,475 du plan V2, tel quel —, le mur du fond à 9,1-9,35 m — le fond du
// bâtiment, y 23,625 (IGN). La salle fait 8,375 x 9,475 m (79 m²) : elle prend la RÉSERVE DU FOND, imaginée ; le plan V2
// lui donnait 6,8 m.
// CE QUE MONTRE LA PHOTO, ET QUI EST ICI, à sa place relevée (fil de fer sur la photo) :
//   - le faux plafond de dalles 60 x 60 à 2,35, calepiné depuis le mur ouest et le mur du fond (les joints relevés tombent
//     sur x 0,475 + 0,6 k et y 23,625 − 0,6 k) ; neuf luminaires encastrés à GRILLE, chacun dans sa case relevée (sept de
//     60 x 60, deux de 60 x 120 : l'un en travers au-dessus de la rangée de droite, l'autre en long au fond) ; la bouche
//     d'extraction en haut à gauche ;
//   - les murs blancs, la plinthe grise ; aucune fenêtre (la salle est aveugle : plus de courette) ;
//   - la moquette aiguilletée vert olive, mouchetée ;
//   - le gros poteau blanc au milieu, 0,60 x 0,30 (sa face sud large et claire, sa face est étroite et dans l'ombre),
//     x 3,45-4,05 × y 17,5-17,8 ; le second, un tube gris de 10 cm, au fond (3,33 ; 22,85) ;
//   - les tables de hêtre clair sur piètement gris : la rangée du mur ouest (cinq tables de 1,6 x 0,7 bout à bout, ses
//     écrans serrés contre le mur, son voile beige), l'îlot du devant en T (deux petites tables, 0,8 et 1,0 x 0,6, et la
//     table de l'unité centrale), la rangée du poteau (ses chaises à l'est, au pas de 0,62), la rangée de droite (ses
//     chaises à l'ouest, au pas de 0,69 : l'appareil est au bout de leur allée), et, hors de la photo, celle du mur est ;
//   - les écrans noirs (éteints), les claviers, les souris, les unités centrales noires sur et sous les tables, les
//     câbles de l'îlot ;
//   - les chaises coque jaune moutarde sur luge noire, la chaise visiteur bleu marine de l'îlot (on s'assoit partout) ;
//   - le vidéoprojecteur blanc sur la table de devant ; l'armoire métallique anthracite à deux portes, au mur ouest,
//     devant une gaine (sa face avant est à 0,755 m du mur), ses sacs dessus ; le petit meuble blanc au fond à droite.
//   Hors de la photo (le mur sud, derrière l'appareil ; le mur est) : le tableau blanc où projette le vidéoprojecteur,
//   l'extincteur, la corbeille, la rangée du mur est. LA LUMIÈRE : le blanc franc des luminaires à grille, rien d'autre.
const BLANC_DC = new THREE.Color(0xf6f2ea);
let _dc = null;
function matDC(M) {
  if (_dc) return _dc;
  const ch_M_dalles = M.dalles, ch_M_blanc = M.blanc;
  const std = (o, n) => { const m = new THREE.MeshStandardMaterial(o); if (n) m.name = n; return m; };
  _dc = {
    moquette: std({ map: texMoquette(), roughness: 0.97 }, 'moquette vert olive (salle David Clark)'),
    hetre: std({ map: texHetreDC(false), roughness: 0.45 }, 'plateau de hêtre (salle David Clark)'),
    hetreY: std({ map: texHetreDC(true), roughness: 0.451 }, 'plateau de hêtre, en long (salle David Clark)'),
    pied: std({ color: 0x77797a, roughness: 0.42, metalness: 0.35 }, 'piètement gris (salle David Clark)'),
    // (le plafond de la salle : des dalles d'un blanc neutre — celles du C05, sous sa lumière chaude, sortaient jaunes :
    // 160/133/88 au jeu contre 158/145/118 sur la photo, au même point)
    dalles: (() => { const t = texDallesDC(), m = ch_M_dalles.clone(); m.map = t; m.emissiveMap = t; m.color = new THREE.Color(0xf4f4f1); m.emissive = new THREE.Color(0xe2e4e6); m.emissiveIntensity = 0.16; m.name = 'plafond en dalles 60x60 (salle David Clark)'; return m; })(),
    // (les murs : le blanc de l'école un ton plus bas — v4 rejouée : 186/174/155 au jeu contre 145/135/117 sur la photo, au
    // mur du fond ; 179/163/142 contre 156/137/103 en haut du mur ouest ; c'est la lumière des luminaires qui les éclaire,
    // en auréoles)
    mur: (() => { const m = ch_M_blanc.clone(); m.color.multiplyScalar(0.85); m.name = 'peinture blanche (salle David Clark)'; detailPhoto(m, 'beton', 1, 1, { relief: 0.035, grain: 0, rugo: false }); return m; })(),
    aureole: new THREE.MeshBasicMaterial({ map: texAureole(), color: new THREE.Color(0.3, 0.29, 0.27), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }),
    // (v1-v3 rejouées : elle sortait orange — 133/81/2 au jeu contre 147/103/2 sur la photo, à l'assise de la première
    // chaise du mur ouest : un moutarde plus jaune, sans bleu)
    moutarde: std({ color: 0xc0a018, roughness: 0.48, side: THREE.DoubleSide }, 'coque jaune moutarde (salle David Clark)'),
    luge: std({ color: 0x18181a, roughness: 0.4, metalness: 0.5 }, 'luge noire (salle David Clark)'),
    marine: std({ color: 0x1f2a52, roughness: 0.9 }, 'tissu bleu marine (salle David Clark)'),
    armoire: std({ color: 0x545c67, roughness: 0.45, metalness: 0.15 }, 'armoire anthracite'),   // (photo : 40/43/48, un gris ardoise)
    caisse: std({ color: 0xc9c7bf, roughness: 0.45, metalness: 0.2 }, 'caisson gris clair'),
    ecran: std({ color: 0x0a0b0d, roughness: 0.16, metalness: 0.1 }, 'écran éteint'),
    tour: std({ color: 0x141517, roughness: 0.42 }, 'unité centrale noire'),
    voile: std({ color: 0xd6cdba, roughness: 0.6 }, 'voile de fond beige'),
    plinthe: std({ color: 0x75726c, roughness: 0.5 }, 'plinthe grise (salle David Clark)'),
    tube: std({ color: 0x8e8f90, roughness: 0.4, metalness: 0.5 }, 'poteau tubulaire gris'),
    meuble: std({ color: 0xdedcd8, roughness: 0.45 }, 'meuble blanc (salle David Clark)'),
    bouche: std({ map: texBouche(), roughness: 0.6 }),
    jaune: std({ color: 0xd9c12c, roughness: 0.5 }), cable: std({ color: 0xe4e3de, roughness: 0.5 }), bleu: std({ color: 0x2c5bb5, roughness: 0.5 }),
    sac: std({ color: 0x25222a, roughness: 0.85 }), sacViolet: std({ color: 0x4a3653, roughness: 0.85 }),
    lum: new THREE.MeshBasicMaterial({ map: texLumGrille(0.6, 0.6), color: BLANC_DC.clone().multiplyScalar(1.4) }),
    lumL: new THREE.MeshBasicMaterial({ map: texLumGrille(1.2, 0.6), color: BLANC_DC.clone().multiplyScalar(1.4) }),
  };
  _dc.lum.name = 'luminaire à grille 60x60 (salle David Clark)'; _dc.lumL.name = 'luminaire à grille 60x120 (salle David Clark)';
  return _dc;
}
// UNE PLINTHE GRISE (8 cm) au pied d'une face de mur : comme `plinthe`, de la matière de la salle
function plintheDC(ch, D, axe, ligne, a0, a1, s) {
  const v0 = ligne, v1 = ligne + s * 0.012;
  if (axe === 'x') ch.boite(a0, Math.min(v0, v1), a1, Math.max(v0, v1), 0, 0.08, D.plinthe, { ombre: false });
  else ch.boite(Math.min(v0, v1), a0, Math.max(v0, v1), a1, 0, 0.08, D.plinthe, { ombre: false });
}
// UN LUMINAIRE À GRILLE dans sa case du plafond (x0-x1 × y0-y1, 60 x 60 ou 60 x 120) : c'est une LAMPE de la salle
function lumGrille(ch, D, x0, y0, x1, y1) {
  const lx = x1 - x0, ly = y1 - y0, long = lx >= ly, L = Math.max(lx, ly), l = Math.min(lx, ly), h = DC.h;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const m = maille(new THREE.PlaneGeometry(L - 0.012, l - 0.012).rotateX(Math.PI / 2), L > 0.9 ? D.lumL : D.lum, cx, h - 0.004, -cy, long ? 0 : Math.PI / 2, ch.decor, { ombre: false, recoit: false });
  m.userData.horsAOSol = true;
  ch.lampes.push({ x: cx, z: -cy, h, zone: 'dc', type: 'dalle', force: L > 0.9 ? 1.1 : 0.95, cuireForce: L > 0.9 ? 0.95 : 0.8, couleur: BLANC_DC });
}
// UNE TABLE de hêtre clair sur piètement gris (photo r06) : x0-x1 × y0-y1 en plan, le plateau de 25 mm à 0,745 (le fil
// dans le long), quatre pieds carrés de 4 cm, la ceinture sous le plateau ; `voile` : le voile de fond beige, côté x0 (la
// rangée du mur ouest : on le voit sous les tables, près du mur)
function tableDC(ch, D, x0, y0, x1, y1, { voile = false } = {}) {
  const h = 0.745, e = 0.04, r = 0.025, c0 = h - 0.085, c1 = h - 0.025;
  ch.boite(x0, y0, x1, y1, c1, h, (y1 - y0) > (x1 - x0) ? D.hetreY : D.hetre);
  for (const [px, py] of [[x0 + r, y0 + r], [x1 - r - e, y0 + r], [x0 + r, y1 - r - e], [x1 - r - e, y1 - r - e]]) ch.boite(px, py, px + e, py + e, 0, c1, D.pied);
  ch.boite(x0 + r, y0 + r, x1 - r, y0 + r + 0.02, c0, c1, D.pied, { ombre: false });
  ch.boite(x0 + r, y1 - r - 0.02, x1 - r, y1 - r, c0, c1, D.pied, { ombre: false });
  ch.boite(x0 + r, y0 + r, x0 + r + 0.02, y1 - r, c0, c1, D.pied, { ombre: false });
  ch.boite(x1 - r - 0.02, y0 + r, x1 - r, y1 - r, c0, c1, D.pied, { ombre: false });
  if (voile) ch.boite(x0 + 0.1, y0 + 0.07, x0 + 0.112, y1 - 0.07, 0.12, c0, D.voile, { ombre: false });
  ch.C.ajouterBoite(x0, -y0, x1, -y1, { y1: h + 0.02 });
}
// L'ÉCRAN ÉTEINT (photo r06 : tous noirs) sur son pied, sur la table : `w` de large, tourné vers `face`
function ecranDC(ch, D, x, y, face, w = 0.5) {
  const g = groupe(ch, x, y, face, 0.745), hh = w * 0.6;
  B(g, D.tour, 0.2, 0.012, 0.16, 0, 0.006, -0.02, { ombre: false });
  B(g, D.tour, 0.045, 0.16, 0.025, 0, 0.09, -0.065);
  R(g, D.tour, w, hh, 0.028, 0.004, 0, 0.11 + hh / 2, -0.05);
  plan(g, D.ecran, w - 0.024, hh - 0.024, 0, 0.11 + hh / 2, -0.0355);
  return g;
}
// L'UNITÉ CENTRALE NOIRE, sur la table (h 0,745) ou dessous (h 0), sa face avant tournée vers `face` ; `clair` : un
// vieux boîtier gris clair (sous la table de devant)
function tourDC(ch, D, P, x, y, face, h = 0, { clair = false, haut = 0.42 } = {}) {
  const g = groupe(ch, x, y, face, h);
  B(g, clair ? D.caisse : D.tour, 0.18, haut, 0.44, 0, haut / 2, 0);
  B(g, P.alu, 0.16, 0.012, 0.004, 0, haut - 0.05, 0.222, { ombre: false });
  B(g, P.plastiqueGris, 0.012, 0.012, 0.004, 0.05, 0.33, 0.222, { ombre: false });
  return g;
}
// LA CHAISE COQUE JAUNE MOUTARDE SUR LUGE NOIRE (photo r06) : la coque d'un seul tenant, en bois moulé — l'assise
// creusée qui remonte en se pinçant à la taille dans le haut dossier renversé, 0,88 m — sur deux luges de tube noir EN
// PORTE-À-FAUX (photo r06, la chaise de la table de l'unité centrale : pas de pied devant ; le tube descend de l'arrière
// de l'assise au sol et file vers l'avant, sous elle) ; on s'y assoit (46 cm), on se relève derrière elle (`sortie`)
let _coqueDC = null;
function geoCoqueDC() {
  if (_coqueDC) return _coqueDC;
  // le profil de la coque (z vers l'avant, y en haut) et sa largeur le long du profil
  const prof = new THREE.CatmullRomCurve3([[0, 0.43, 0.22], [0, 0.455, 0.12], [0, 0.462, -0.02], [0, 0.468, -0.13], [0, 0.5, -0.2],
    [0, 0.58, -0.235], [0, 0.7, -0.255], [0, 0.8, -0.275], [0, 0.88, -0.3]].map((p) => new THREE.Vector3(...p)), false, 'catmullrom', 0.4);
  const N = 22, M = 8, P = prof.getSpacedPoints(N), pos = [], idx = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N, q = P[i];
    const larg = t < 0.45 ? 0.44 - 0.02 * t : t < 0.62 ? 0.43 - 0.36 * (t - 0.45) : 0.37 + 0.18 * (t - 0.62);
    const dos = Math.min(1, Math.max(0, (t - 0.5) / 0.2));
    for (let j = 0; j <= M; j++) {
      const x = (j / M - 0.5) * larg, k = x * x;
      pos.push(x, q.y + (1 - dos) * 0.5 * k, q.z + dos * 1.6 * k);
    }
  }
  for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) { const a = i * (M + 1) + j, b = a + M + 1; idx.push(a, b, a + 1, a + 1, b, b + 1); }
  const coque = new THREE.BufferGeometry();
  coque.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); coque.setIndex(idx); coque.computeVertexNormals();
  const pts = [[0, 0.455, 0.12], [0, 0.45, -0.12], [0, 0.4, -0.2], [0, 0.2, -0.215], [0, 0.04, -0.2], [0, 0.012, -0.15], [0, 0.012, 0.2], [0, 0.03, 0.25]];
  const luge = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), false, 'catmullrom', 0.2), 28, 0.0105, 5, false);
  return (_coqueDC = { coque, luge });
}
function chaiseMoutarde(ch, D, x, y, face, sortie = null) {
  const g = groupe(ch, x, y, face), G = geoCoqueDC();
  maille(G.coque, D.moutarde, 0, 0, 0, 0, g);
  for (const sx of [-0.19, 0.19]) maille(G.luge, D.luge, sx, 0, 0, 0, g);
  const t = CY(g, D.luge, 0.009, 0.38, 0, 0.215, -0.215, 6, { ombre: false }); t.rotation.z = Math.PI / 2;
  ch.C.ajouterCercle(x, -y, 0.17, { y1: 0.9 });
  siege(ch, x, y, 0.46, face, 'la chaise', sortie);
  return g;
}
// LA CHAISE VISITEUR BLEU MARINE (photo r06, à l'îlot) : quatre pieds de tube gris, l'assise et le dossier rembourrés de
// bleu marine dans leur cadre de tube
function chaiseMarine(ch, D, x, y, face, sortie = null) {
  const g = groupe(ch, x, y, face);
  for (const [px, pz] of [[-0.215, 0.2], [0.215, 0.2], [-0.215, -0.2], [0.215, -0.2]]) CY(g, D.pied, 0.011, 0.45, px, 0.225, pz, 8);
  // (le dossier bas : son haut à 0,82 — photo r06)
  for (const px of [-0.215, 0.215]) { const t = CY(g, D.pied, 0.011, 0.37, px, 0.635, -0.232, 8); t.rotation.x = -0.12; }
  const tr = CY(g, D.pied, 0.011, 0.43, 0, 0.815, -0.254, 8); tr.rotation.z = Math.PI / 2;
  R(g, D.marine, 0.45, 0.07, 0.44, 0.025, 0, 0.475, 0.0);
  const dos = R(g, D.marine, 0.41, 0.26, 0.05, 0.02, 0, 0.665, -0.228); dos.rotation.x = -0.12;
  ch.C.ajouterCercle(x, -y, 0.22, { y1: 0.95 });
  siege(ch, x, y, 0.48, face, 'la chaise', sortie);
  return g;
}
// UN CÂBLE (tube fin) le long de points du plan [x, y, h]
function cableDC(ch, mat, pts, r = 0.004) {
  const c = new THREE.CatmullRomCurve3(pts.map(([x, y, h]) => new THREE.Vector3(x, h, -y)));
  return maille(new THREE.TubeGeometry(c, 6 * pts.length, r, 4, false), mat, 0, 0, 0, 0, ch.decor, { ombre: false });
}
function salleDavidClark(ch, P) {
  const { M, C } = ch, D = matDC(M), H = DC.h;
  // ---- la coque : aucune fenêtre ----
  // le mur ouest (30 cm), le mur du fond (le fond du bâtiment, IGN), le mur est (cloisonsBande, jusqu'au fond)
  ch.mur({ de: [0.325, 12.75], a: [0.325, DC.y1 + 0.15], ep: 0.3, mats: { E: D.mur, W: M.blanc } });
  ch.mur({ de: [0.175, DC.y1 + 0.075], a: [9.0, DC.y1 + 0.075], mats: { S: D.mur, N: M.blanc } });
  // le mur sud : la réserve ouest et le mur nord de la cage (lot B) d'un côté, les toilettes hommes de l'autre ; ouvert
  // sur l'entrée. Devant la cage, un simple doublage (la cage a son mur à elle, ligne 14,0).
  ch.mur({ de: [0.475, 14.0375], a: [1.6, 14.0375], ep: 0.225, mats: { N: D.mur, S: M.blanc } });
  ch.mur({ de: [1.6, 14.1125], a: [DCE.x0, 14.1125], ep: 0.075, mats: { N: D.mur, S: M.blanc } });
  ch.mur({ de: [WH.x0, 14.0375], a: [8.85, 14.0375], ep: 0.225, mats: { N: D.mur, S: M.blanc } });
  // LA GAINE du coin sud-ouest, contre laquelle se range l'armoire (sa face avant est à 0,755 m du mur ouest sur la
  // photo r06 : derrière elle, un coffrage de 0,25) ; la bouche d'extraction au plafond, tout près
  ch.boite(DC.x0, DC.y0, 0.73, 15.42, 0, H, D.mur, { collision: true });
  // les plinthes grises (les faces de la salle)
  plintheDC(ch, D, 'y', DC.x0, 15.42, DC.y1, 1); plintheDC(ch, D, 'x', DC.y1, DC.x0, DC.x1, -1); plintheDC(ch, D, 'y', DC.x1, DC.y0, DC.y1, -1);
  plintheDC(ch, D, 'x', DC.y0, 0.73, DCE.x0, 1); plintheDC(ch, D, 'x', DC.y0, C05.xM + 0.075, DC.x1, 1);
  plintheDC(ch, D, 'y', 0.73, DC.y0, 14.55, 1); plintheDC(ch, D, 'x', 15.42, DC.x0, 0.73, 1);
  // les plafonds de dalles : la salle à 2,35, son entrée à 2,45 (celui du C05, au-dessus de la porte bleue)
  ch.plafond(DC.x0, DC.y0, DC.x1, DC.y1, H, 'dalles').material = D.dalles;
  ch.plafond(C05.xO, DCE.y0, DCE.x1, DCE.y1, 2.45, 'dalles');
  // LA MOQUETTE (le carrelage s'arrête au seuil, js/carte_ecole.js)
  solMoquette(ch, D, DC);
  // ---- les poteaux : le gros, blanc, au milieu ; le tube gris du fond ----
  ch.boite(3.45, 17.5, 4.05, 17.8, 0, H, M.blanc, { collision: true });
  plintheDC(ch, D, 'x', 17.5, 3.45, 4.05, -1); plintheDC(ch, D, 'x', 17.8, 3.45, 4.05, 1);
  plintheDC(ch, D, 'y', 3.45, 17.5, 17.8, -1); plintheDC(ch, D, 'y', 4.05, 17.5, 17.8, 1);
  ch.boite(3.28, 22.8, 3.38, 22.9, 0, H, D.tube, { collision: true });
  // ---- la lumière : les neuf luminaires à grille relevés sur la photo, chacun dans sa case ; ceux du mur est et du
  // devant, hors de la photo, sur la même trame ----
  for (const L of [[1.075, 15.225, 1.675, 15.825], [2.875, 16.425, 3.475, 17.025], [5.275, 17.625, 6.475, 18.225],
    [1.075, 17.625, 1.675, 18.225], [1.075, 20.025, 1.675, 20.625], [3.475, 18.825, 4.075, 19.425],
    [2.875, 21.225, 3.475, 21.825], [5.275, 20.025, 5.875, 21.225], [5.275, 22.425, 5.875, 23.025],
    [7.075, 15.225, 7.675, 15.825], [7.075, 17.625, 7.675, 18.825], [7.075, 20.025, 7.675, 20.625], [7.075, 22.425, 7.675, 23.025],
    // (v1 rejouée : aucun au-dessus de l'appareil ni de l'îlot — la photo n'en montre pas en haut à gauche)
    [5.275, 15.225, 5.875, 15.825], [1.075, 22.425, 1.675, 23.025]]) lumGrille(ch, D, ...L);
  // (les auréoles du mur ouest, sous les luminaires de la première rangée de cases : relevées sur la photo en y 17,6 et
  // 20,2, leur haut à 1,9-2,0 ; pas sous celui de l'armoire, la photo n'en montre pas)
  for (const y of [17.925, 20.325, 22.725]) {
    const a = maille(new THREE.PlaneGeometry(1.7, 1.5), D.aureole, DC.x0 + 0.004, 1.42, -y, Math.PI / 2, ch.decor, { ombre: false, recoit: false });
    a.renderOrder = 2; nePasFusionner(a);
  }
  const bo = maille(new THREE.PlaneGeometry(0.32, 0.15).rotateX(Math.PI / 2), D.bouche, 1.4, H - 0.004, -14.96, Math.PI / 2, ch.decor, { ombre: false });
  bo.userData.horsAOSol = true;
  // ---- l'armoire anthracite à deux portes, contre la gaine, tournée vers l'est (x 0,73-1,23 × y 14,55-15,42, 1,98 m) ----
  {
    const x0 = 0.73, x1 = 1.23, y0 = 14.55, y1 = 15.42, h = 1.98, ym = 14.985;
    ch.boite(x0, y0, x1, y1, 0, h, D.caisse, { collision: true });
    ch.boite(x1, y0 + 0.022, x1 + 0.008, ym - 0.002, 0.07, h - 0.022, D.armoire);
    ch.boite(x1, ym + 0.002, x1 + 0.008, y1 - 0.022, 0.07, h - 0.022, D.armoire);
    const s = groupe(ch, x1 + 0.008, ym + 0.055, 'E', 1.02);
    CY(s, P.chrome, 0.017, 0.014, 0, 0, 0.007, 14).rotation.x = Math.PI / 2;
    // les sacs posés dessus, à son bout sud (photo r06 : le reste du dessus est nu)
    const sac = groupe(ch, 0.98, 14.8, 'E', h); R(sac, D.sac, 0.4, 0.13, 0.36, 0.05, 0, 0.065, 0); R(sac, D.sacViolet, 0.36, 0.1, 0.32, 0.04, 0.02, 0.18, 0.02).rotation.y = 0.12;
  }
  corbeille(ch, P, 0.95, 14.33);
  C.ajouterCercle(0.95, -14.33, 0.16, { y1: 0.4 });
  // ---- la rangée du mur ouest : cinq tables de 1,6 x 0,7 bout à bout, de l'armoire au fond ; les écrans serrés contre
  // le mur (relevés : 15,80 16,13 16,52 17,02, l'unité centrale en 17,56, puis un écran tous les 0,58 et une unité
  // centrale entre deux) ; trois chaises sur la photo, cinq en tout ----
  for (let k = 0; k < 5; k++) tableDC(ch, D, DC.x0, 15.55 + k * 1.6, DC.x0 + 0.7, 15.55 + (k + 1) * 1.6, { voile: true });
  [[15.8, 0.32], [16.13, 0.34], [16.52, 0.44], [17.02, 0.46], [18.02, 0.46], [18.62, 0.46], [19.2, 0.46], [19.78, 0.46], [20.95, 0.46],
    [21.53, 0.46], [22.11, 0.46], [22.69, 0.46], [23.27, 0.42]].forEach(([y, w]) => { ecranDC(ch, D, DC.x0 + 0.2, y, 'E', w); clavier(ch, P, DC.x0 + 0.47, y, 0.745, 'E'); });
  for (const y of [17.56, 20.37]) tourDC(ch, D, P, DC.x0 + 0.24, y, 'E', 0.745);
  for (const y of [16.3, 18.3, 19.5, 21.25, 22.4]) tourDC(ch, D, P, DC.x0 + 0.42, y, 'E');
  for (const y of [15.95, 17.38, 18.72, 20.6, 22.45]) chaiseMoutarde(ch, D, 1.5, y, 'W', [0.42, 0]);
  // ---- l'îlot du devant (en T) : deux petites tables bout à bout (0,8 et 1,0 x 0,6), la table de l'unité centrale au
  // nord ; le vidéoprojecteur, l'écran, le clavier et la souris, une feuille, l'unité centrale et sa voisine claire, les
  // câbles jaune et blancs ; la chaise bleu marine glissée sous la table, la chaise moutarde de l'unité centrale ----
  tableDC(ch, D, 2.25, 15.69, 3.05, 16.29); tableDC(ch, D, 3.05, 15.69, 4.08, 16.29); tableDC(ch, D, 3.38, 16.29, 4.08, 17.45);
  {
    const vp = groupe(ch, 2.85, 16.08, 'S', 0.745); vp.rotation.y += 0.25;
    R(vp, P.blancMat, 0.31, 0.1, 0.25, 0.02, 0, 0.055, 0);
    CY(vp, P.plastique, 0.034, 0.02, 0.085, 0.058, 0.126, 18).rotation.x = Math.PI / 2;
    B(vp, P.plastiqueGris, 0.12, 0.004, 0.09, -0.06, 0.106, 0.0, { ombre: false });
    const f = groupe(ch, 3.2, 15.92, 'S', 0.745); f.rotation.y += 0.15; B(f, P.blancMat, 0.297, 0.003, 0.21, 0, 0.0015, 0, { ombre: false });
  }
  ecranDC(ch, D, 3.6, 16.2, 'S', 0.46); clavier(ch, P, 3.6, 15.92, 0.745, 'S');
  tourDC(ch, D, P, 3.74, 16.97, 'S', 0.745); tourDC(ch, D, P, 3.57, 16.62, 'E', 0.745, { clair: true, haut: 0.33 });
  B(groupe(ch, 3.665, 16.528, 'E', 0.745), D.sacViolet, 0.004, 0.08, 0.12, 0, 0.2, 0, { ombre: false });
  tourDC(ch, D, P, 3.5, 16.66, 'S', 0, { clair: true });
  cableDC(ch, D.jaune, [[3.74, 16.75, 1.0], [3.7, 16.55, 0.76], [3.55, 16.4, 0.752], [3.62, 16.32, 0.75], [3.66, 16.3, 0.55], [3.6, 16.32, 0.2], [3.55, 16.4, 0.01]]);
  cableDC(ch, D.cable, [[3.62, 16.25, 0.86], [3.7, 16.32, 0.75], [3.8, 16.31, 0.5], [3.75, 16.35, 0.2], [3.7, 16.5, 0.01]]);
  cableDC(ch, D.cable, [[3.0, 16.1, 0.8], [3.2, 16.24, 0.752], [3.4, 16.28, 0.752], [3.52, 16.3, 0.62], [3.5, 16.33, 0.3]]);
  cableDC(ch, D.bleu, [[3.6, 16.32, 0.4], [3.5, 16.0, 0.012], [3.35, 15.45, 0.008], [3.42, 15.3, 0.008]], 0.0045);
  chaiseMarine(ch, D, 2.7, 15.9, 'N', [0, -0.75]);
  chaiseMoutarde(ch, D, 4.27, 16.95, 'W', [0.6, 0]);
  // ---- la rangée du poteau, au nord de lui : quatre tables de 1,4 x 0,7 ; ses postes au pas de 0,62 (écran tourné
  // vers l'est, l'unité centrale debout à côté ; pas de clavier : la photo n'en montre aucun), ses chaises à l'est, à demi rentrées (le bout de leurs luges en x 4,2
  // sur la photo) ----
  for (let k = 0; k < 4; k++) tableDC(ch, D, 3.4, 17.85 + k * 1.4, 4.1, 17.85 + (k + 1) * 1.4);
  for (let k = 0; k < 7; k++) {
    const y = 18.5 + k * 0.62;
    ecranDC(ch, D, 3.66, y + 0.08, 'E', 0.42);
    tourDC(ch, D, P, 3.62, y - 0.22, 'E', 0.745);
    chaiseMoutarde(ch, D, 4.25, y, 'W', [0.62, 0]);
  }
  // ---- la rangée de droite : quatre tables de 1,4 x 0,75 ; ses postes au pas de 0,69 (l'écran et l'unité centrale côté
  // est, tournés vers l'ouest), ses chaises à l'ouest, rentrées sous la table (leurs luges en x 5,5-5,6 sur la photo) ----
  for (let k = 0; k < 4; k++) tableDC(ch, D, 5.7, 16.65 + k * 1.4, 6.45, 16.65 + (k + 1) * 1.4);
  for (let k = 0; k < 8; k++) {
    const y = 16.99 + k * 0.69;
    ecranDC(ch, D, 6.18, y - 0.08, 'W', 0.46); clavier(ch, P, 5.92, y - 0.06, 0.745, 'W');
    tourDC(ch, D, P, 6.24, y + 0.24, 'W', 0.745);
    chaiseMoutarde(ch, D, 5.68, y, 'E', [-0.62, 0]);
  }
  // ---- la rangée du mur est (hors de la photo) : six tables de 1,4 x 0,7, douze postes, leurs chaises ----
  for (let k = 0; k < 6; k++) tableDC(ch, D, 8.15, 15.05 + k * 1.4, DC.x1, 15.05 + (k + 1) * 1.4);
  for (let k = 0; k < 12; k++) {
    const y = 15.4 + k * 0.7;
    ecranDC(ch, D, 8.62, y, 'W', 0.46); clavier(ch, P, 8.36, y, 0.745, 'W');
    if (k % 2 === 0) tourDC(ch, D, P, 8.6, y + 0.35, 'W');
    chaiseMoutarde(ch, D, 7.78, y, 'E', [-0.5, 0]);
  }
  // ---- le petit meuble blanc du fond, à droite (photo r06), contre le mur du fond ----
  ch.boite(5.65, 23.2, 6.4, DC.y1, 0, 1.15, D.meuble, { collision: true });
  ch.boite(6.02, 23.195, 6.03, 23.2, 0.08, 1.1, D.plinthe, { ombre: false });
  for (const x of [5.97, 6.08]) ch.boite(x - 0.006, 23.18, x + 0.006, 23.2, 0.85, 0.97, P.alu, { ombre: false });
  // ---- le mur sud (derrière l'appareil de la photo) : le tableau blanc où projette le vidéoprojecteur, l'extincteur ----
  tableauBlancMural(ch, P, 2.9, DC.y0, 'N', 2.4, texTableauReseau());
  const ex = groupe(ch, 6.45, DC.y0 + 0.09, 'N');
  CY(ex, P.rouge, 0.075, 0.48, 0, 1.2, 0, 16); CY(ex, P.noirMat, 0.04, 0.08, 0, 1.48, 0, 10);
  C.ajouterCercle(6.45, -(DC.y0 + 0.09), 0.09, { y0: 0.9, y1: 1.6 });
  cadre(ch, P, new THREE.MeshStandardMaterial({ map: texPictoExtincteur(), roughness: 0.6 }), 6.45, DC.y0, 'N', 0.16, 0.16, 1.85, { ep: 0.004 });
  // ---- côté C05, à droite de la porte bleue : la plaque de la salle (photo 23) ----
  // (13/10, lot C2 — photo 23 à sa pose refaite : x 5,68-5,84, de 1,59 à 1,68 m, sur le mur du fond en y 12,71)
  plaque(ch, new THREE.MeshStandardMaterial({ map: texPlaqueSalle(), roughness: 0.4 }), 5.76, C05.yFond, 'S', 0.16, 0.09, 1.635);
}
// LA MOQUETTE de la salle David Clark : un plan posé à 2 mm au-dessus du sol (le carrelage s'arrête au seuil), sur le
// rectangle `R`. Comme le grès des toilettes (solGres), il porte sur sa seconde couche d'UV la lumière et l'ombre cuites
// du rez-de-chaussée, reprises du carrelage au moment de dessiner.
function solMoquette(ch, D, R) {
  const rep = ch.scene.getObjectByName('sol (repère)');
  const W = rep.geometry.parameters.width, L = rep.geometry.parameters.height;
  const rx0 = rep.position.x - W / 2, ry0 = -rep.position.z - L / 2;
  const mat = D.moquette, pos = [], uv = [], uv1 = [];
  for (const [x, y] of [[R.x0, R.y0], [R.x1, R.y0], [R.x1, R.y1], [R.x0, R.y1]]) {
    pos.push(x, 0.002, -y); uv.push(x - R.x0, y - R.y0); uv1.push((x - rx0) / W, (y - ry0) / L);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute('uv1', new THREE.Float32BufferAttribute(uv1, 2));
  g.setIndex([0, 1, 2, 0, 2, 3]);
  const m = new THREE.Mesh(g, mat); m.receiveShadow = true; m.name = 'moquette (salle David Clark)';
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
  return { zones: ZONES };
}
