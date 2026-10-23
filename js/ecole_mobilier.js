// =====================================================================
//  LE MOBILIER DE L'ÉCOLE IRIS (crochet de js/carte_ecole.js)
// =====================================================================
// Ce que l'on DÉPLACERAIT si l'on vidait l'école : chaises, écran, présentoirs, affiches, extincteur, équipement de
// l'accueil. La coque du bâtiment (murs, portes, plafonds, lumières, comptoir) est dans js/carte_ecole.js ; ce module
// reçoit son chantier `ch` :
//   ch.scene, ch.decor (le groupe où poser), ch.C (le monde solide), ch.M (les matières, js/ecole_matieres.js),
//   ch.boite(x0, y0, x1, y1, h0, h1, mat, { collision }) et ch.panneau(mat, w, h, x, y, hc, face) en coordonnées du PLAN
//   (x le long de la façade, y vers le fond ; voir l'en-tête de js/carte_ecole.js), ch.sieges (où l'on peut s'asseoir :
//   { x, z, y, fx, fz, sx, sz, nom } en coordonnées du MONDE, z = -y).
// Positions et couleurs : le relevé des photos (salle d'attente : photos 02, 21 ; hall ouest : 06 ; passage : 07, 19 ;
// accueil : 03).
import * as THREE from 'three';
import { maille, boiteM } from './ecole_portes.js';
import { texAffiche, texEcran, texPictoExtincteur } from './ecole_matieres.js';
import { canvasTex } from './kit_decor.js';

// LA SALLE D'ATTENTE RECULE VERS LA RUE de 4,20 m (11/10, plan V2 — scratchpad iris_audit/plan_v2.md § 2.1 et § 2.2 ; la
// carte, js/carte_ecole.js) : son contenu, relevé sur les photos 02 et 21, la suit d'un bloc
const DY_A = -4.2;
const A = (y) => y + DY_A;
// (retour de Haythem du 12/10, r03 : « trop étroite » — le mur sud recule de 0,20 vers la rue, la salle passe de 2,925 à
// 3,125 nu à nu, mesurée sur la photo 02 : js/carte_ecole.js DY_R03 ; ce qu'il porte, ou ce qui s'y adosse, le suit — S)
const DY_R03 = -0.20;
const S = (y) => A(y) + DY_R03;
const ATT_YS = 9.0 + DY_A + DY_R03; // la ligne du mur sud de la salle d'attente (4,6) : le verre des jours est sur elle

// ---- LES CHAISES COQUE (type Eames DAR) : coque moulée, piètement « tour Eiffel » chromé ----
// Couleurs relevées (photos 02, 21, rééquilibrées sur le blanc des murs) : blanc cassé, bleu canard (un bleu-vert
// grisé, pas un bleu), grège (taupe rosé), vert anis, noir, gris rosé (rose poudré).
// (relecture du 11/10 : sur r02 agrandie, la canard est un bleu grisé où le bleu passe le vert — 0x6b9294 tirait sur le
// vert d'eau : 0x678e9b)
const COQUE = { blanc: 0xefebe0, canard: 0x678e9b, grege: 0x8e8580, citron: 0xb8bc28, noir: 0x2e2c2c, rose: 0xc6aca0 };
let _coque = null, _ourlet = null;
// LA COQUE, une surface paramétrée sur un plan presque RECTANGULAIRE (super-ellipse : la coque Eames est plus large que
// profonde, aux angles arrondis). (09/10/2026, refaite d'après les photos 02 et 21 : la première, un bord qui montait
// en pente douce sur toute la moitié extérieure, faisait une soucoupe plate.) Le profil, de l'axe vers le bord : une
// ASSISE presque plate (légèrement creusée), puis un large CONGÉ qui redresse la paroi presque à la verticale (72°) —
// un baquet. La hauteur de la paroi suit le tour : le bord avant RETOMBE sous les genoux (-3 cm, la « cascade »), les
// accoudoirs montent à 18 cm au-dessus de l'assise, le dossier à 38 cm, renversé vers l'arrière.
// (Retour de Haythem du 11/10, r02 : « les chaises de gauche ressemblent à des palettes plates ; sur la photo, ce sont de
// vraies coques : bord relevé, accoudoirs, dossier, galbe ». La coque de la veille ne relevait son bord qu'à partir du
// milieu des flancs — les coins avant à 1 cm de l'assise — et sa paroi s'étalait sur la moitié du rayon : vue de trois
// quarts, une selle plate. Refaite d'après les photos 02, 21 et r02 — et les cotes de la DAR : 0,63 x 0,56, assise à
// 0,45, accoudoirs à 0,65, dossier à 0,82.) La coque est un BAQUET : une assise un peu creusée, plus haute devant, sur les
// deux tiers du rayon ; puis une paroi qui se redresse en 11 cm jusqu'à 83° ; le bord fait l'ACCOUDOIR dès les coins avant
// (12 cm au-dessus de l'assise), court à 18,5 cm le long des flancs, puis monte en DOSSIER (34 cm), renversé de 15° ; à
// l'avant, entre les coins, il retombe de 3,5 cm sous les genoux (la « cascade »). Le plan se resserre vers le dos.
// (Intégration v1.9, 12/10 — doute 3 de la relecture r03 : la coque faisait 0,63 x 0,67 hors tout, 0,83 de haut, et
// paraissait trop grosse sur la photo 02 rejouée — la citron y couvrait 137 px de large pour 120 sur la photo, 92 de haut
// pour 83. Ramenée aux cotes d'une vraie DAR : 0,63 de large, 0,60 de profondeur, l'assise à 0,45 devant, les
// accoudoirs à 0,635, le haut du dossier à 0,80, ourlet compris. Le plan raccourcit (demi-profondeur 0,278 -> 0,25), le
// dossier monte un peu moins (+0,157 au lieu de +0,175, les flancs +0,22 au lieu de +0,235) et se renverse un peu moins
// (0,24 au lieu de 0,26) ; la largeur, le baquet et le piètement ne changent pas.)
export function geoCoque() {
  if (_coque) return _coque;
  const NA = 72, NS = 7, NC = 16, A = 0.312, P = 0.25, Y = 0.45, n = 3.6, T0 = 0.66, K = 0.92;
  const pos = [], idx = [], ourlet = [];
  const lisse = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const NR = NS + NC;
  for (let j = 0; j <= NR; j++) {
    // ρ : la fraction du rayon ; η : la part de la paroi déjà montée (0 sur l'assise, 1 au bord). Le congé est un arc de
    // 83° (K = 0,92 du quart de cercle) : la paroi finit presque verticale, comme la fibre moulée de la DAR.
    let rho, eta;
    if (j <= NS) { rho = (j / NS) * T0; eta = 0; }
    else {
      const s = (j - NS) / NC * K * Math.PI / 2, sK = Math.sin(K * Math.PI / 2), cK = 1 - Math.cos(K * Math.PI / 2);
      rho = T0 + (1 - T0) * Math.sin(s) / sK; eta = (1 - Math.cos(s)) / cK;
    }
    for (let i = 0; i <= NA; i++) {
      const phi = i / NA * Math.PI * 2, s = Math.sin(phi), c = Math.cos(phi);
      const r = 1 / Math.pow(Math.pow(Math.abs(s), n) + Math.pow(Math.abs(c), n), 1 / n);
      const dos = (1 - c) / 2;                                       // 0 devant, 1 derrière
      const larg = 1 - 0.1 * dos * dos;                              // le plan se resserre vers le dos (0,63 -> 0,57)
      const bord = -0.035 + 0.22 * lisse(0.015, 0.22, dos) + 0.157 * lisse(0.48, 1, dos);
      const assise = (-0.02 * (1 - rho * rho) + 0.018 * c * rho) * (1 - eta);
      const h = bord * eta;
      const p = [s * A * r * rho * larg, Y + assise + h, c * P * r * rho - 0.24 * Math.max(0, h) * dos * dos];
      pos.push(...p);
      if (j === NR) ourlet.push(new THREE.Vector3(...p));
    }
  }
  for (let j = 0; j < NR; j++) for (let i = 0; i < NA; i++) {
    const a0 = j * (NA + 1) + i, a1 = a0 + 1, b0 = a0 + NA + 1, b1 = b0 + 1;
    idx.push(a0, b0, a1, a1, b0, b1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx); g.computeVertexNormals();
  // L'OURLET : le bord roulé de la coque (8,5 mm), qui accroche la lumière et donne l'épaisseur de la fibre
  ourlet.pop();
  _ourlet = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ourlet, true), NA * 2, 0.0085, 6, true);
  return (_coque = g);
}
// (14/10 : la même coque pour les DAR de l'espace pause du 1er, js/ecole_etage1_pause.js — VO q_0195, q_0214, q_0218)
export function geoOurletCoque() { geoCoque(); return _ourlet; }
const _matsCoque = new Map();
// le voile d'ombre d'une chaise : un dégradé radial noir, transparent, sans écriture de profondeur (partagé)
let _geoVoile = null, _matVoile = null;
function matVoile() {
  if (_matVoile) return _matVoile;
  const t = canvasTex(128, 128, (g, w, h) => {
    const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    gr.addColorStop(0, 'rgba(0,0,0,0.42)'); gr.addColorStop(0.45, 'rgba(0,0,0,0.3)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.clearRect(0, 0, w, h); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  }, null, true, 1);
  return (_matVoile = new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
}
function chaise(ch, x, y, face, couleur) {
  const M = ch.M, fx = face === 'S' ? 0 : face === 'N' ? 0 : face === 'E' ? 1 : -1, fz = face === 'S' ? 1 : face === 'N' ? -1 : 0;
  const g = new THREE.Group(); g.position.set(x, 0, -y); g.rotation.y = Math.atan2(fx, fz);
  { const v = Object.keys(COQUE).find((k) => COQUE[k] === couleur) || null; g.userData.meuble = { type: 'chaise-coque', nom: 'la chaise coque ' + ({ blanc: 'blanche', canard: 'canard', grege: 'grège', citron: 'citron', noir: 'noire', rose: 'rose' }[v] || ''), variante: v, voile: false }; }   // (prop hunt, L-K 23/10 : js/registre_meubles.js ; son voile au sol est dans son groupe)
  if (!_matsCoque.has(couleur)) _matsCoque.set(couleur, new THREE.MeshStandardMaterial({ color: couleur, roughness: 0.38, side: THREE.DoubleSide }));
  // L'OMBRE DE LA COQUE. Ni dans l'ombre cuite au sol (vue de dessus, la coque faisait une tache noire de sa taille
  // posée sur des pieds fins), ni dans la carte d'ombre de la lumière principale (presque d'aplomb, elle découpait sous
  // chaque chaise un pavé noir à bord net) : sur les photos 02 et 21, la lumière vient de tous les plafonniers à la fois
  // et l'ombre d'une chaise n'est qu'un voile flou. Ce voile est une tache dégradée posée au sol ; les pieds, eux,
  // gardent leurs ombres fines.
  const coque = maille(geoCoque(), _matsCoque.get(couleur), 0, 0, 0, 0, g, { ombre: false });
  const ourlet = maille(_ourlet, _matsCoque.get(couleur), 0, 0, 0, 0, g, { ombre: false });
  coque.userData.horsAOSol = ourlet.userData.horsAOSol = true;
  // (v1.9 : le voile suit la coque ramenée à 0,60 de profondeur, centrée 4 cm en arrière de l'axe du piètement)
  const voile = new THREE.Mesh(_geoVoile || (_geoVoile = new THREE.PlaneGeometry(0.84, 0.76).rotateX(-Math.PI / 2)), matVoile());
  voile.position.set(0, 0.003, -0.03); voile.renderOrder = 1; voile.userData.horsAOSol = true; g.add(voile);
  // le piètement chromé (sans ombre portée : sous une lumière presque d'aplomb, la platine et les croisillons
  // découpaient un rectangle noir crénelé ; le voile suffit) et ses patins gris foncé de 15 mm
  // (11/10, r02 : le vrai piètement « tour Eiffel » — quatre pieds écartés, la ceinture de fil à 19 cm qui les relie, et
  // de chaque pied, à hauteur de la ceinture, un fil qui remonte sous le centre de l'assise : le X des photos 02 et 21)
  const tige = (a, b, r) => {
    const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
    const m = maille(new THREE.CylinderGeometry(r, r, va.distanceTo(vb), 6), M.inox, 0, 0, 0, 0, g, { ombre: false });
    m.position.copy(va).add(vb).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.sub(va).normalize());
    return m;
  };
  const pied = (px, pz, y) => [px * (0.235 - 0.08 * y / 0.4), y, pz * (0.212 - 0.082 * y / 0.4)];
  for (const [px, pz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    tige(pied(px, pz, 0.01), pied(px, pz, 0.405), 0.0075);
    tige(pied(px, pz, 0.19), [0, 0.39, 0], 0.0045);
    maille(new THREE.CylinderGeometry(0.0075, 0.0085, 0.012, 8), M.patin || (M.patin = new THREE.MeshStandardMaterial({ color: 0x45433f, roughness: 0.6 })), px * 0.235, 0.006, pz * 0.212, 0, g, { ombre: false });
  }
  for (const [a, b] of [[[-1, -1], [-1, 1]], [[1, -1], [1, 1]], [[-1, 1], [1, 1]], [[-1, -1], [1, -1]]]) tige(pied(...a, 0.19), pied(...b, 0.19), 0.0045);
  maille(boiteM(0.24, 0.012, 0.21), M.inox, 0, 0.4, -0.01, 0, g, { ombre: false });
  ch.decor.add(g);
  // l'assise (le jeu y pose les hanches) et d'où l'on se relève, 60 cm devant (en monde : z = -y)
  ch.sieges.push({ x: x + fx * 0.02, z: -y + fz * 0.02, y: 0.45, fx, fz, sx: x + fx * 0.7, sz: -y + fz * 0.7, nom: 'la chaise' });
  return g;
}

// ---- UN PANNEAU MURAL en boîte mince (affiche contrecollée, tableau de liège) ----
// (UV de 0 à 1 sur chaque face : l'image entière sur la face avant)
function cadreMural(ch, mat, x, y, face, w, h0, h1, ep = 0.01) {
  const g = new THREE.BoxGeometry(w, h1 - h0, ep);
  const m = new THREE.Mesh(g, mat);
  const d = { E: [ep / 2, 0], W: [-ep / 2, 0], S: [0, -ep / 2], N: [0, ep / 2] }[face];
  m.position.set(x + d[0], (h0 + h1) / 2, -(y + d[1]));
  m.rotation.y = { S: 0, N: Math.PI, E: Math.PI / 2, W: -Math.PI / 2 }[face];
  m.receiveShadow = true;
  ch.decor.add(m);
  return m;
}

export function poserMobilier(ch) {
  const { M, C } = ch;
  // =====================================================================
  //  LA SALLE D'ATTENTE (photos 02, 03, 21 ; 11/10 : y 4,8-7,875, DY_A)
  // =====================================================================
  // la rangée nord, dos au mur safran, tournée vers le sud ; la rangée sud sous les jours dépolis, tournée vers le nord
  // (11/10, r02 : l'ordre et les couleurs se relisent tels quels — au nord, d'ouest en est, blanc, canard, grège, citron,
  // blanc ; au sud, noir, rose, canard sous le jour ouest — 10 cm plus à l'ouest, la borne est à côté. La rangée nord
  // recule de 2 cm : sur les photos, le haut des dossiers touche la lisse blanche du mur safran)
  // (Relecture du 11/10 — r02 et la photo 02 rejouées ENSEMBLE, la 02 posée sur la porte grise du hall ouest, taille
  // comprise, et sur l'angle ouest du mur sud qu'elle voit en x 4,49. AU SUD, le bord avant des assises, rétroprojeté sur
  // les deux photos, met la canard vers x 6,7-6,9, la rose vers 6,0, la noire vers 5,1-5,4 : sous le jour ouest et le jour
  // aux affiches — la canard était 0,6 m trop à l'est : vue du bout ouest, elle se levait sous la borne, là où r02 ne
  // montre que le sol et le socle. On garde 7,0 / 6,2 / 5,4. AU NORD, la blanche du bout ouest a sa coque à 1,2 m de
  // l'appareil de r02 (son assise à 3 400 px, son dossier à 2 800) et la 02 met celle du bout est vers 9,4 : la rangée
  // glisse de 0,3 m vers l'est, au même pas de 0,7)
  // (v1.9, 12/10 : la coque ramenée à 0,60 de profondeur — geoCoque —, son dossier finit 4,3 cm plus en avant : la rangée
  // nord recule d'autant, en 7,455, le haut des dossiers toujours au nu du mur safran (7,80), sous la lisse blanche ; la
  // rangée sud reste en 5,05 : le dos de ses coques, qui mordait de 3 cm dans la double lisse grise, s'y adosse à 1 cm.
  // Le passage entre les bords avant des deux rangées passe de 1,80 à 1,89 m)
  [[6.8, 'blanc'], [7.5, 'canard'], [8.2, 'grege'], [8.9, 'citron'], [9.6, 'blanc']].forEach(([x, c]) => chaise(ch, x, 7.455, 'S', COQUE[c]));
  // (r03, 12/10 : la rangée sud reste adossée au mur des jours, qui recule de 0,20 — S)
  [[5.4, 'noir'], [6.2, 'rose'], [7.0, 'canard']].forEach(([x, c]) => chaise(ch, x, S(9.45), 'N', COQUE[c]));
  // (les boîtes suivent : 6 à 8 cm devant le bord avant des coques, comme avant)
  C.ajouterBoite(6.45, -7.79, 9.95, -7.12, { y1: 0.8 });
  for (const x of [5.4, 6.2, 7.0]) C.ajouterBoite(x - 0.32, -S(9.77), x + 0.32, -S(9.1), { y1: 0.8 });
  // l'écran de 65 pouces (x 6,5-7,95, h 1,55-2,40) et l'affiche blanche aux graphismes vert pâle (x 8,4-9,4 ; r02 :
  // ce sont deux affiches côte à côte, le chevron vert et les logos « eph » — photo 02 agrandie)
  ch.boite(6.5, A(11.94), 7.95, A(12.0), 1.55, 2.4, M.noir);
  ch.panneau(new THREE.MeshBasicMaterial({ map: texEcran(), color: new THREE.Color(1.25, 1.25, 1.25) }), 1.39, 0.79, 7.225, A(11.935), 1.975, 'S');
  ch.panneau(new THREE.MeshStandardMaterial({ map: texAfficheVerte(), roughness: 0.7 }), 1.0, 1.5, 8.9, A(11.994), 1.8, 'S');
  ch.panneau(new THREE.MeshStandardMaterial({ map: texAffiche('#ffffff', '#f5f5f0', 4), roughness: 0.7 }), 0.15, 0.21, 7.0, A(11.994), 1.4, 'S');
  // LA BORNE numérique noire (retour de Haythem du 11/10, r02 : « sur la photo, elle est debout sur son socle noir plat, un
  // peu à l'écart à droite du pilier ; son écran montre une mosaïque de vraies photos en couleurs — dans le jeu, elle est
  // collée au pilier et montre des pictogrammes de personnages bleus »). Sur la photo 21 en pleine définition, vue du bout
  // ouest : à droite du pilier, à 50 px de lui, devant le bout est du jour c 8,35 — le haut de son cadre dépasse au-dessus
  // d'elle —, le pied de son socle à 4 m de l'appareil : (8,4 ; 5,14), le dos contre le mur sud, tournée vers le
  // nord-ouest (on voit son écran et, à droite, son flanc) ; entre elle et le pilier, 1 m. (Retour r02 du 11/10 : c'est
  // derrière elle, au bout du mur sud, que s'ouvre l'antichambre vers le hall.)
  // Le socle est une plaque noire de 0,62 x 0,42, épaisse de 2,5 cm, qui avance devant l'écran ; le fût de 1,92 m, un rien
  // renversé ; l'écran de 0,54 x 1,28, de 0,6 à 1,88 m — dessous, le pied noir du fût et son petit logo.
  {
    // (Relecture du 11/10 : r02 et la photo 02 rejouées ensemble. Sur r02, le pied du fût est à 4,1 m de l'appareil
    // — 565 px sous l'horizon —, sous les relèvements de ses deux bords : la borne est CONTRE LE MUR SUD, en x 8,6, devant
    // le jour est, le nu (7,87-9,06), à 0,33 m du bout du mur (retour r02) ; sur la photo 02, elle est bien hors du
    // cadre. Son haut n'est qu'à 100 px au-dessus de l'horizon quand son pied est à 565 px dessous : 1,82 m hors tout)
    // Et elle regarde le NORD, droit dans la salle, le dos au mur : vu du bout ouest, son écran n'a que 95 px de large pour
    // 160 de borne, son flanc noir à droite — un écran de 0,54 vu sous 60°. Tournée vers le nord-ouest, elle faisait face
    // à l'appareil.
    // (r03, 12/10 : toujours contre le mur sud, qui recule de 0,20 — y 4,88)
    const bx = 8.6, by = 5.08 + DY_R03, th = Math.PI;
    const borne = new THREE.Group(); borne.position.set(bx, 0, -by); borne.rotation.y = th; ch.decor.add(borne);
    borne.userData.meuble = { type: 'borne', nom: 'la borne', mural: true };   // (prop hunt, L-K)
    maille(boiteM(0.62, 0.025, 0.42), M.noir, 0, 0.0125, 0.1, 0, borne);
    const fut = new THREE.Group(); fut.position.y = 0.025; fut.rotation.x = -0.025; borne.add(fut);
    // (relecture : fût de 1,795 ; l'écran n'en couvre que les deux tiers hauts — r02 agrandie : 175 px d'écran sur 275 de
    // fût —, de 0,62 à 1,77 ; dessous, le fût noir et son logo)
    maille(boiteM(0.62, 1.795, 0.07), M.noir, 0, 0.8975, 0, 0, fut);
    const mos = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 1.15), new THREE.MeshBasicMaterial({ map: texMosaique(), color: new THREE.Color(1.08, 1.08, 1.08) }));
    mos.position.set(0, 1.195, 0.0355); fut.add(mos);
    const logo = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.035), new THREE.MeshBasicMaterial({ color: 0x6d6f73 }));
    logo.position.set(0, 0.45, 0.0356); fut.add(logo);
    // (la boîte du socle, tournée avec lui : un objet tourné de rotation.y = θ a a = -θ ; le socle avance de 0,1 devant)
    C.ajouterBoiteOrientee(bx + Math.sin(th) * 0.1, -by + Math.cos(th) * 0.1, 0.31, 0.21, -th, { y1: 2 });
  }
  // LES PRÉSENTOIRS à brochures noirs, tournés vers l'ouest : CINQ tablettes inclinées, et non six (retour de Haythem du
  // 11/10, r02 : « noir, à cinq étagères de brochures » — on les compte aussi sur la photo 01), 1,75 m de haut ;
  // ses tablettes descendent jusqu'au sol, au pas de 33 cm — la dernière rangée de brochures à 0,15 m, la première sous le
  // chapeau
  //  - LE SEUL qu'on voie de la salle (r02 : « le jeu en met DEUX côte à côte sur le mur du fond ; sur la photo, il y en a
  //    UN seul ») : adossé à la face ouest de la pile, à gauche du radiateur, à 0,3 m de lui (photo 21 en pleine
  //    définition : y 6,0-6,8 ; le jeu le mettait 0,25 plus au sud) ;
  //  - celui de la photo 01, sur roulettes, contre le mur est du C01 : il y est, mais PLUS LOIN dans le couloir, y 8,1-8,9 —
  //    sous la fin du plafond bas du C01, sur la photo 01 —, là où le bout du mur safran le cache à qui regarde depuis le
  //    bout ouest de la salle. En y 8,2, il dépassait du mur jaune, à côté de l'autre : les « deux présentoirs » de r02.
  const br = new THREE.MeshStandardMaterial({ map: texBrochures(), roughness: 0.6 });
  const presentoir = (x, y, roulettes) => {
    const pres = new THREE.Group(); pres.position.set(x, 0, -y); pres.rotation.y = -Math.PI / 2; ch.decor.add(pres);
    pres.userData.meuble = { type: 'presentoir', nom: 'le présentoir', mural: true };   // (prop hunt, L-K)
    const b0 = roulettes ? 0.07 : 0.02;
    // (13/10, relecture C2 — photo 01, le présentoir vu de chant depuis le C01 : son flanc n'est pas un panneau plein
    // de 36 cm — c'est un montant noir étroit, 12 cm, à l'arrière, et devant lui les tablettes inclinées et leurs
    // brochures de couleur DÉPASSENT, bien visibles de côté ; le jeu montrait une caisse noire. Les flancs réduits au
    // montant arrière ; de face — r02, photo 21 — rien ne change.)
    for (const sx of [-0.39, 0.39]) maille(boiteM(0.022, 1.73, 0.13), M.noir, sx, b0 + 0.865, -0.115, 0, pres);
    maille(boiteM(0.76, 1.62, 0.012), M.noir, 0, b0 + 0.88, -0.17, 0, pres);
    maille(boiteM(0.8, 0.03, 0.36), M.noir, 0, b0 + 1.715, 0, 0, pres);
    maille(boiteM(0.76, 0.05, 0.3), M.noir, 0, b0 + 0.025, 0, 0, pres);
    for (let i = 0; i < 5; i++) {
      const t = maille(boiteM(0.76, 0.02, 0.3), M.noir, 0, b0 + 0.12 + i * 0.33, 0.02, 0, pres); t.rotation.x = -0.35;
      const b = new THREE.Mesh(new THREE.PlaneGeometry(0.74, 0.25), br);
      b.position.set(0, b0 + 0.24 + i * 0.33, 0.05); b.rotation.x = -0.3; pres.add(b);
      maille(boiteM(0.76, 0.05, 0.012), M.noir, 0, b0 + 0.12 + i * 0.33, 0.165, 0, pres);
    }
    if (roulettes) for (const [sx, sz] of [[-0.36, -0.14], [0.36, -0.14], [-0.36, 0.14], [0.36, 0.14]]) {
      const r = maille(new THREE.CylinderGeometry(0.03, 0.03, 0.022, 12), M.noirMat, sx, 0.03, sz, 0, pres, { ombre: false });
      r.rotation.z = Math.PI / 2;
    }
    C.ajouterBoite(x - 0.25, -(y - 0.42), x + 0.19, -(y + 0.42), { y1: 1.8 });
  };
  presentoir(13.11, 6.4, false);
  // (13/10, lot C2 — photo 01 à sa pose refaite, js/carte_ecole.js `C01` : le présentoir qu'elle montre n'est PAS dans le
  // couloir. Son pied tombe en (12,9-13,3 ; 6,7-7,1), contre la face ouest de la pile, au sud de l'entrée du C01 — c'est
  // celui de la salle d'attente, vu de dos : il n'y en a qu'UN, et le second, posé en y 8,1-8,9, se trouvait devant les
  // portes de la gaine, qui sont en face du local, y 8,31-9,78.)
  // LE KAKÉMONO « 1ère école pour le BTS SIO en France » (retour de Haythem du 11/10, r02 : « le panneau noir au bout du
  // mur » — sur la photo 21 en pleine définition, un panneau noir à lettres blanches et dorées, plus haut qu'un homme,
  // juste après la fin du jaune ; le même que la VO de 2021, q_0038-0047, au bout est du mur safran, devant lui). Vu du
  // bout ouest, presque de chant : il est donc DEVANT le mur, à 0,25 m, de x 11,0 à 11,75, un rien tourné vers la salle ;
  // sa cassette d'aluminium au sol, son mât, sa barre haute. Il ne gêne ni les chaises ni l'entrée du C01.
  {
    // (13/10, relecture C2 — photo 01, du C01 vers le sud : à gauche du bout du mur ouest du couloir, on ne voit QUE le
    // mur du bureau, son jour et le sol — pas de panneau noir. La visée qui rase ce bout de mur, de (12,16 ; 11,77) par
    // (11,70 ; 7,95), passe en x 11,65 à la hauteur du kakémono : en x 10,95-11,81, il y dépassait de 16 cm, une bande
    // noire de haut en bas. Reculé de 18 cm vers l'ouest : de 10,77 à 11,62, toujours au bout du mur jaune.)
    const kx = 11.195, ky = 7.54, th = -0.105;
    const k = new THREE.Group(); k.position.set(kx, 0, -ky); k.rotation.y = th; ch.decor.add(k);
    k.userData.meuble = { type: 'kakemono', nom: 'le kakémono', mural: true };   // (prop hunt, L-K)
    maille(boiteM(0.86, 0.085, 0.11), M.aluGris, 0, 0.0425, 0, 0, k);
    for (const s of [-1, 1]) maille(boiteM(0.04, 0.012, 0.3), M.aluGris, s * 0.36, 0.006, 0, 0, k, { ombre: false });
    maille(new THREE.CylinderGeometry(0.008, 0.008, 2.0, 8), M.aluGris, 0, 1.08, -0.035, 0, k, { ombre: false });
    maille(boiteM(0.82, 0.02, 0.02), M.aluGris, 0, 2.09, -0.012, 0, k, { ombre: false });
    const tk = new THREE.MeshStandardMaterial({ map: texKakemono(), roughness: 0.55, side: THREE.DoubleSide });
    const toile = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 2.0), tk); toile.position.set(0, 1.08, -0.008); toile.castShadow = true; k.add(toile);
    C.ajouterBoiteOrientee(kx, -ky, 0.43, 0.13, -th, { y1: 2.1 });
  }
  // (le DRAPEAU NOIR au bout est du jour est — r02 : « l'ouverture vers le hall, sombre, avec un pictogramme noir
  // au-dessus » — n'est pas celui de la Si 0.1 : c'est celui du bureau de direction, à l'angle où est aussi sa plaque,
  // VO q_0040-0043 ; retour r02 du 11/10 : js/ecole_rdc_centre.js. La porte de la Si 0.1 est dans l'antichambre.)
  // LES AFFICHETTES DU FOND (photo orange, carte WIFI) : au bout du mur, près de l'angle du hall, sous le haut-parleur
  // (photo 03) — sur la face ouest de la pile du hall, x 13,30, js/ecole_rdc_centre.js ; son angle sud-ouest, y 4,7.
  // (Relecture du 10/10 : sur la photo 03 recalée — caméra (12,2 ; 5,4), cap 136,5 —, les affichettes sont à 0,1-0,25 m
  // de l'angle et le haut-parleur juste au-dessus, y 4,9 et non 5,15.) (11/10, plan V2 : ce sont les MÊMES que celles du
  // fond de la photo 21, à côté du radiateur — le jeu les avait aussi posées sur le mur x 13,5, en y 10,05 : retirées)
  // (11/10, r02 : sur la photo 21 en pleine définition, elles sont à mi-chemin du radiateur et de l'angle — y 4,98, la
  // moyenne des photos 03 et 21 ; le haut-parleur au-dessus d'elles)
  const wifi = new THREE.MeshStandardMaterial({ map: texWifi(), roughness: 0.45 });
  ch.panneau(wifi, 0.2, 0.17, 13.294, 4.98, 1.45, 'W');
  ch.panneau(new THREE.MeshStandardMaterial({ map: texAffiche('#c7783a', '#f4ead9', 12), roughness: 0.6 }), 0.26, 0.19, 13.294, 4.98, 1.72, 'W');
  // (relecture du 11/10 : le radiateur de la pile — js/carte_ecole.js — n'est pas tout blanc : un cadre blanc autour d'une
  // façade gris clair, des photos 03 et 21 ; 0,63 de la luminance du mur, mesurée sur la photo 03) (r02 : y 5,2-5,7, 1,25 m)
  ch.panneau(new THREE.MeshStandardMaterial({ color: 0xa0a19c, roughness: 0.55 }), 0.42, 0.98, 13.219, 5.45, 0.66, 'W');
  const hp = new THREE.Group(); hp.position.set(13.24, 2.32, -5.0); ch.decor.add(hp);
  maille(boiteM(0.1, 0.17, 0.13), M.boitier, 0, 0, 0, 0, hp, { ombre: false });
  maille(new THREE.CylinderGeometry(0.035, 0.035, 0.01, 16), M.grille, -0.051, 0.01, 0, 0, hp, { ombre: false }).rotation.z = Math.PI / 2;
  // les affiches du pilier gris (planté dans la salle, x 9,71-10,31 × y 5,23-5,83 : js/carte_ecole.js, retour r02)
  // (r02, photo 21 en pleine définition : sur sa face OUEST, l'affiche blanche aux dessins de couleur, de 1,48 à 2,12, et
  // l'orange dessous, de 1,0 à 1,45 ; sur sa face NORD, deux feuilles l'une sur l'autre — une crème en haut, une rouge
  // en bas —, près de l'angle nord-ouest ; la feuille verte unique du jeu n'y est pas)
  // (Relecture du 11/10 : le pilier est en x 8,80-9,66 × y 5,59-6,02 — js/carte_ecole.js — ; sa face ouest n'a que 0,43 de
  // large : l'affiche blanche, un A2 qui la remplit presque sur r02, fait 0,40 x 0,57)
  // (retour r03 du 12/10 : le pilier a glissé sur le rayon de r02 avec la salle élargie, x 9,18-10,04 × y 5,46-5,89 —
  // js/carte_ecole.js ; ses affiches le suivent)
  const PO = { x: 9.18, xe: 10.04, yc: 5.675, yn: 5.89 };
  ch.panneau(new THREE.MeshStandardMaterial({ map: texAfficheDessins(), roughness: 0.7 }), 0.4, 0.57, PO.x - 0.006, PO.yc, 1.8, 'W');
  ch.panneau(new THREE.MeshStandardMaterial({ map: texAfficheOrange(), roughness: 0.7 }), 0.3, 0.42, PO.x - 0.006, PO.yc, 1.23, 'W');
  ch.panneau(new THREE.MeshStandardMaterial({ map: texAffiche('#e9dcc0', '#f8f3e6', 70), roughness: 0.7 }), 0.24, 0.44, PO.x + 0.2, PO.yn + 0.006, 1.71, 'N');
  ch.panneau(new THREE.MeshStandardMaterial({ map: texAffiche('#c9443f', '#f4e4e0', 71), roughness: 0.7 }), 0.24, 0.42, PO.x + 0.2, PO.yn + 0.006, 1.22, 'N');
  // (10/10, VO q_0039-0050 : sa face EST, vers le hall — l'A3 bleu-gris au dessin d'écran d'ordinateur, de 1,5 à 1,9 m,
  // et l'A4 blanche à vignettes de photos dessous. La plaque « iris », l'annuaire et l'horloge qu'il portait sur sa face
  // sud sont sur la pile du hall : js/ecole_rdc_centre.js)
  ch.panneau(new THREE.MeshStandardMaterial({ map: texEcranA3(), roughness: 0.7 }), 0.3, 0.42, PO.xe + 0.006, PO.yc, 1.7, 'E');
  ch.panneau(new THREE.MeshStandardMaterial({ map: texVignettes(), roughness: 0.7 }), 0.21, 0.297, PO.xe + 0.006, PO.yc, 1.25, 'E');
  // LES AFFICHES COLLÉES SUR LE VERRE (retour de Haythem du 11/10, r02 : « les affiches sont collées sur le verre » — elles
  // flottaient à 8 cm devant lui, au nu du mur). Sur la photo 21 en pleine définition, deux grandes affiches, l'une sur
  // l'autre, sur la moitié est du jour OUEST (c 6,65) : en haut, une blanche à titre rouge (0,42 x 0,48), en bas, une
  // blanche à vignettes de couleur (0,40 x 0,66), qui descend presque à l'appui ; le jour est (c 8,35) est nu. (Les A4 du
  // jeu, deux par jour, n'y sont pas.) Contre le verre, au milieu du mur : y 4,806 + 2 mm.
  // (RELECTURE DU 11/10 : LES AFFICHES SONT SUR LE JOUR DU MILIEU. Le mur sud a TROIS jours — js/carte_ecole.js — : la
  // photo 02, prise du bout est vers l'ouest, voit de près un jour à affiches et au loin un jour nu ; r02, prise du bout
  // ouest vers l'est, voit AUSSI de près un jour à affiches et au loin un jour nu — et ce sont les mêmes affiches : la
  // colonne est, une blanche à titre rouge sur une blanche aux six carrés noir, rouge, vert. Le jour à affiches est donc
  // entre deux jours nus. Il en porte quatre, en deux colonnes (photo 02 agrandie) : à l'est, les deux de r02, de 1,79 à
  // 2,25 et de 1,30 à 1,75 ; à l'ouest, deux A3, des carrés de couleur en haut, une bande de carrés sombres en bas)
  ch.panneau(new THREE.MeshStandardMaterial({ map: texAfficheTitre(), roughness: 0.7 }), 0.42, 0.46, 7.41, ATT_YS + 0.008, 2.02, 'N');
  ch.panneau(new THREE.MeshStandardMaterial({ map: texAfficheVignettesCouleur(), roughness: 0.7 }), 0.4, 0.45, 7.41, ATT_YS + 0.008, 1.525, 'N');
  ch.panneau(new THREE.MeshStandardMaterial({ map: texAfficheVignettesCouleur(false), roughness: 0.7 }), 0.3, 0.42, 6.93, ATT_YS + 0.008, 1.92, 'N');
  ch.panneau(new THREE.MeshStandardMaterial({ map: texAfficheVignettesCouleur(true), roughness: 0.7 }), 0.3, 0.42, 6.93, ATT_YS + 0.008, 1.43, 'N');

  // =====================================================================
  //  LE HALL OUEST (photo 06 ; plan V2, 11/10 — scratchpad iris_audit/plan_v2.md § 2.2 : la photo 06 rejouée au
  //  centimètre, retour de Haythem du 10/10, « la porte n'est pas aussi loin » ; js/carte_ecole.js construireMurs)
  // =====================================================================
  // LE PLAN D'ÉVACUATION, sur la face est de la PILE (x 2,45, y 4,05-4,97) : centré sur elle, à 0,45 m de la paroi
  // vitrée, un cadre A2 en hauteur de 0,44 x 0,62, de 1,08 à 1,70 (photo 06 rejouée à la pose recalée — haut à 248 px,
  // bas à 402 : le jeu le mettait à 1,30-1,92, sur une lame de 25 cm, 2,7 m plus au nord)
  // (13/10, photo 06 refaite à sa pose — (5,04 ; 5,88) h 1,37, tangage −5,3, roulis −1,8 : il fait 0,40 de large, 121 px
  // et non 134, son axe en y 4,475, de 1,08 à 1,70 ; photo 19, par la vitre, à la pose refaite sur les vitrages : 0,36
  // de large, axe 4,41, de 1,00 à 1,55. Entre les deux : 0,38 x 0,59, axe 4,45, de 1,04 à 1,63. Sa feuille :
  // texPlanEvacuation.)
  cadreMural(ch, new THREE.MeshStandardMaterial({ map: texPlanEvacuation(), roughness: 0.5 }), 2.45, 4.45, 'E', 0.38, 1.04, 1.63);
  // la prise électrique contre l'huisserie nord de la porte grise, au ras de la plinthe (photo 06, vidéo v_001)
  ch.boite(1.75, 6.01, 1.765, 6.09, 0.16, 0.24, M.blanc, { ombre: false });
  for (const dy of [-0.018, 0.018]) ch.boite(1.765, 6.05 + dy - 0.005, 1.768, 6.05 + dy + 0.005, 0.195, 0.205, M.noirMat, { ombre: false });
  // L'EXTINCTEUR rouge sur sa console et ses deux plaques (photo 06 : au fond du renfoncement, à 0,95 m au nord de la
  // porte grise et à 0,3 m de l'angle). Plus bas qu'il n'était : la photo 06 rejouée à la pose recalée — la porte, son
  // oculus et le pictogramme y tombent à quelques pixels — met le corps de 0,66 à 1,08 (372 à 440 px), la poignée verte
  // vers 1,15 et le haut de la boucle du tuyau vers 1,28 (le jeu : corps 0,96-1,44, poignée 1,56 ; plan V2 : 0,60-1,20,
  // 1,46). Au-dessus, le pictogramme à 1,92 et la petite plaque rouge et bleue à 1,53.
  // (relecture du 11/10, photo 06 rejouée : il est TRAPU, 0,18 m de diamètre — un 6 litres —, et non 0,15)
  // (13/10, photo 06 refaite à sa pose, agrandie : son corps va de 0,66 à 1,00 sous une tête arrondie — 70 px, le jeu
  // en montrait 90 —, d'un rouge plus sourd ; la poignée vers 1,10, la boucle du tuyau jusqu'à 1,25 ; il est 7 cm plus
  // au nord, ses deux plaques avec lui — le pictogramme, 12 cm, à 1,87, la petite plaque à 1,49)
  // (14/10, photo 06 à sa pose, agrandie sept fois : il PENCHE de 7° vers le nord sur son crochet ; son rouge est sombre
  // — (130, 35, 25) sous un mur à (172, 158, 131), le jeu le rendait vermillon, (235, 25, 25) — ; le tuyau fait une
  // grande BOUCLE DANS LE PLAN DU MUR, de l'épaule sud jusqu'à 27 cm au-dessus du corps, et redescend sur la tête — le
  // jeu la tournait vers la pièce : de face, un trait ; la poignée est verte, vers le nord ; l'étiquette, claire à
  // lignes rouges, couvre la moitié basse du corps)
  // (et la même pose le met en y 6,78-6,98, sa tête en 6,90 : 9 cm plus au sud que le 13/10 ; ses plaques en y 6,92)
  const yE = 6.88, rougeExt = new THREE.MeshStandardMaterial({ color: 0x8a2219, roughness: 0.32, metalness: 0.1 }); rougeExt.name = 'extincteur rouge (hall ouest)';
  const ext = new THREE.Group(); ext.position.set(1.86, 0.83, -yE); ext.rotation.x = -0.12; ch.decor.add(ext);
  ext.userData.meuble = { type: 'extincteur', nom: 'l’extincteur', mural: true };   // (prop hunt, L-K)
  maille(new THREE.CylinderGeometry(0.09, 0.09, 0.34, 18), rougeExt, 0, 0, 0, 0, ext);
  maille(new THREE.SphereGeometry(0.09, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2), rougeExt, 0, 0.17, 0, 0, ext);
  maille(new THREE.CylinderGeometry(0.03, 0.045, 0.07, 10), M.noirMat, 0, 0.255, 0, 0, ext);
  maille(boiteM(0.04, 0.06, 0.06), M.noirMat, -0.095, 0.13, 0, 0, ext);
  const vertExt = new THREE.MeshStandardMaterial({ color: 0x1f4a33, roughness: 0.5 }); vertExt.name = 'poignée verte (extincteur)';
  maille(boiteM(0.03, 0.02, 0.13), vertExt, 0.005, 0.305, -0.04, 0, ext).rotation.x = -0.22;
  maille(boiteM(0.026, 0.016, 0.1), M.noirMat, 0.005, 0.275, -0.035, 0, ext);
  const etiq = maille(new THREE.CylinderGeometry(0.0915, 0.0915, 0.2, 18, 1, true, -0.9, 1.8), new THREE.MeshStandardMaterial({ map: canvasTex(96, 96, (g, w, h) => {
    g.fillStyle = '#d9d2c6'; g.fillRect(0, 0, w, h); g.fillStyle = '#a3261d';
    g.fillRect(8, 6, w - 16, 9); for (let k = 0; k < 6; k++) g.fillRect(10, 24 + k * 9, w - 20 - (k % 3) * 12, 3);
    g.strokeStyle = '#a3261d'; g.lineWidth = 2; g.strokeRect(22, 78, 16, 14); g.strokeRect(54, 78, 16, 14);
  }, null, false, 4), roughness: 0.5 }), 0, -0.03, 0, Math.PI / 2, ext, { ombre: false });
  void etiq;
  const tuyau = new THREE.CatmullRomCurve3([[0.035, 0.26, -0.005], [0.04, 0.36, 0.0], [0.045, 0.43, 0.04], [0.045, 0.44, 0.09], [0.04, 0.37, 0.125], [0.035, 0.25, 0.122], [0.03, 0.14, 0.1]].map((p) => new THREE.Vector3(...p)));
  maille(new THREE.TubeGeometry(tuyau, 28, 0.011, 7), M.noirMat, 0, 0, 0, 0, ext, { ombre: false });
  maille(boiteM(0.022, 0.2, 0.022), M.noirMat, 0.035, 0.02, -0.098, 0, ext, { ombre: false });
  C.ajouterCercle(1.86, -yE, 0.11, { y0: 0.6, y1: 1.3 });
  ch.panneau(new THREE.MeshStandardMaterial({ map: texPictoExtincteur(), roughness: 0.6 }), 0.12, 0.12, 1.755, yE + 0.04, 1.87, 'E');
  ch.panneau(new THREE.MeshStandardMaterial({ map: texPlaqueRougeBleue(), roughness: 0.5 }), 0.1, 0.1, 1.755, yE + 0.04, 1.49, 'E');
  // l'affiche jaune du tri, à gauche des portes de l'escalier : sur la face est de l'avancée nord du mur OUEST (09/10 :
  // elle était sur le mur des portes, cachée par le vantail ouvert ; photos 04, 20 : on la voit à gauche du vantail, sur
  // le mur en fuite). (Plan V2, photo 06 : son bord gauche à 0,29 m de l'angle de l'avancée, y 7,51 ; la photo rejouée la
  // met de 1,08 à 2,04 — une affiche A1 en hauteur, 0,68 x 0,96 —, sa moitié droite derrière le vantail ouvert rabattu à
  // plat, y 7,955-8,955, comme sur la photo 06.)
  // (13/10, photos 06, 20 et 04 refaites à leur pose : son haut est 10 cm plus bas, à 1,93 — sur la 06, au rang 172 et
  // non 155 ; sur la 20, 12 cm —, et son bas à 0,90, rang 392 : 0,68 x 1,03 ; son dessin : texTriHall)
  // (14/10, la pose refaite de la 06 — 15 points, 9 px : rangs 170 et 392 à son bord gauche, soit 0,96-1,98 ; la 04 de
  // même ; la 20, floue, 0,85-1,92. Elle remonte de 4 cm, son bord gauche en y 7,53.)
  cadreMural(ch, new THREE.MeshStandardMaterial({ map: texTriHall(), roughness: 0.6 }), 2.45, 7.87, 'E', 0.68, 0.94, 1.97);
  // LES DEUX A4 DU VANTAIL FERMÉ des portes de l'escalier (vantail est, x 3,45-4,45, face hall à y 8,935), l'un au-dessus
  // de l'autre, côté gonds (photos 06, 20 : une fiche de consignes de 1,25 à 1,70, une photo imprimée de 1,75 à 2,0 ; le
  // jeu les mettait côte à côte vers 1,65)
  // (13/10, photo 20 refaite à sa pose — (3,57 ; 6,51) h 1,27 : ils vont de 1,08 à 1,82, 12 cm plus bas ; en haut, une
  // photo imprimée aux tons chauds sous pochette, en bas la fiche blanche à bandeau gris et ses trois pavés bleus)
  ch.panneau(new THREE.MeshStandardMaterial({ map: texFicheBleue(), roughness: 0.6 }), 0.3, 0.44, 4.1, 8.932, 1.3, 'S');
  ch.panneau(new THREE.MeshStandardMaterial({ map: texPhotoImprimee(), roughness: 0.35 }), 0.3, 0.29, 4.1, 8.932, 1.68, 'S');
  // le diffuseur d'alarme blanc, sur la retombée au-dessus de l'entrée du couloir C05, contre l'angle (photos 04 et 05 :
  // un boîtier carré à grille ronde ; relecture du 09/10 ; plan V2 : la retombée du hall au bout du mur safran, qui
  // recule avec la salle d'attente — DY_A, -4,20 : y 11,965 -> 7,765 ; la bande visible va de 2,30 à 2,60)
  // (13/10, lot C2 — photos 05 et 04 rejouées : tout en haut de la retombée, contre son angle — l'arête nord-sud est
  // en x 5,15, js/carte_ecole.js —, x 5,21-5,33, son dessus sous le plafond de dalles)
  const diff = new THREE.Group(); diff.position.set(5.27, 2.525, -7.765); ch.decor.add(diff);
  maille(boiteM(0.12, 0.13, 0.07), M.boitier, 0, 0, 0, 0, diff, { ombre: false });
  maille(new THREE.CylinderGeometry(0.035, 0.035, 0.01, 16), M.grille, 0, -0.005, 0.038, 0, diff, { ombre: false }).rotation.x = Math.PI / 2;
  diff.traverse((m) => { m.userData.horsAOSol = true; });

  // =====================================================================
  //  LE PASSAGE (photos 07, 19)
  // =====================================================================
  // (plan V2, 11/10 : le passage arrêté à la paroi vitrée en y 4,05, son mur est sur la ligne x 4,5 ; les deux lièges du mur
  // est sont vers la rue, y 0,4-1,4 et 1,5-2,6 — photos 07, 10 —, pas contre la paroi)
  // (13/10, photo 07 refaite à sa pose — (3,90 ; 5,28) h 1,23 cap 194,4, tangage −10,2, f 600 —, agrandie : sur le mur
  // est, UN SEUL tableau de liège, long de 2,1 m, de y 0,95 à 3,05, de 1,08 à 1,86, couvert de feuilles ; puis, contre la
  // paroi, une grande affiche au dégradé rose et bleu, y 3,1-3,6, de 1,12 à 1,86. Le jeu avait deux tableaux d'un mètre
  // vers la rue et trois affichettes.)
  // (14/10, photos 07 et 10 côte à côte : sur l'une comme sur l'autre, le liège finit à 0,3-0,4 m du jambage de la
  // grille ; il faisait 2,1 m dans un passage que le jeu garde 0,6 m trop long — de la rue, 0,95 m de mur nu le séparait
  // du jambage. Il prend les 0,5 m de trop : DEUX tableaux bord à bord, de y 0,45 à 3,05 — la photo 07 montre leur joint.)
  // (14/10, relecture : le mur est du passage recule au nu x 4,70 — js/carte_ecole.js construireParoiPassage ; ce qu'il
  // porte le suit)
  // (les photos 10 et 07 reposées sur la porte à sa taille — 4 px sur seize points pour la 10, l'appareil à 1,62 m : le
  // liège va de y 0,47 à 2,35 sur la 10, jusqu'à 2,77 sur la 07, plus rasante ; de 1,06-1,12 à 1,97-2,05, et 1,90-1,98.
  // Les deux rayons de son bout nord se croisent en (4,73 ; 2,52), de 1,09 à 2,05. Deux tableaux de y 0,45 à 2,5, de
  // 1,08 à 2,03 — il n'y a plus de demi-mètre de trop à leur faire prendre — ; l'affiche au dégradé contre eux,
  // y 2,55-3,05, de 1,2 à 1,86 ; au-delà, 1 m de mur nu jusqu'à la paroi, comme sur la photo 10.)
  cadreMural(ch, M.aluGris, 4.7, 1.475, 'W', 2.09, 1.06, 2.05, 0.02);
  const liege = texLiegePassage(); liege.repeat.set(2.05 / 2.6, 1);
  cadreMural(ch, new THREE.MeshStandardMaterial({ map: liege, roughness: 0.9 }), 4.68, 1.475, 'W', 2.05, 1.08, 2.03, 0.012);
  ch.boite(4.666, 1.467, 4.68, 1.483, 1.06, 2.05, M.aluGris, { ombre: false });
  cadreMural(ch, new THREE.MeshStandardMaterial({ map: texAfficheDegradee(), roughness: 0.6 }), 4.7, 2.8, 'W', 0.5, 1.2, 1.86, 0.006);
  // le mur ouest, entre la porte « Sortie » (y 1,15-2,05) et la paroi : la bande aux trois pictogrammes, y 2,29-2,67 à
  // 1,34, et la charte aux coups de pinceau bleus et rouges contre la paroi, y 2,95-3,45, de 1,32 à 1,92 (photo 07 ;
  // photo 06, par la vitre)
  // (14/10, relecture, photo 07 reposée sur la porte à sa taille : le bord sud de la charte en y 2,6-2,7, de 1,40 à 2,05
  // — photo 06, par la vitre : y 2,7-3,2 ; elle et la bande reculent de 30 cm vers la rue, comme la porte « Sortie »)
  ch.panneau(new THREE.MeshStandardMaterial({ map: texBandePictos(), roughness: 0.7 }), 0.38, 0.14, 1.756, 2.18, 1.4, 'E');
  ch.panneau(new THREE.MeshStandardMaterial({ map: texCharte(), roughness: 0.7 }), 0.5, 0.62, 1.756, 2.9, 1.71, 'E');
  // la porte « Sortie » porte trois étiquettes, un peu du côté des gonds : la flèche bleu canard à 1,60, le disque
  // barré rouge à 1,42, la petite étiquette rouge à 1,27 (photo 07) — posées sur le vantail, elles tournent avec lui
  {
    const ps = ch.portes.auto.find((P) => P.g.name === 'porte service (passage)'), v = ps && ps.vantaux[0];
    if (v) {
      const e = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.48), new THREE.MeshStandardMaterial({ map: texEtiquettesSortie(), roughness: 0.6, transparent: true, alphaTest: 0.5 }));
      e.position.set(v.s * 0.32, 1.42, 0.0235); e.castShadow = false; v.g.add(e);
    }
  }
  // le pan plein de la paroi, à gauche de la double porte (le dos de la pile du plan d'évacuation, x 1,75-2,45) : photo
  // 10 rejouée, une affiche de 1,33 à 1,71 et, en bas, une grille de ventilation à lames de 0,45 x 0,7 (relecture du
  // 11/10, photo 10 agrandie : l'« affiche » est un petit tableau sombre où sont épinglées six feuilles blanches, x 1,93-
  // 2,29, et au-dessus, une étiquette blanche)
  // (14/10, relecture, photo 10 reposée — la porte du fond à sa taille, à 4,45 m de la façade : le tableau de x 1,93 à
  // 2,37, de 1,41 à 1,83, l'étiquette à 1,98 ; la grille de x 1,84 à 2,37, de 0,10 à 0,92 — 9 % plus grands et plus hauts
  // que sur la pose du 13/10, qui rapprochait la paroi)
  ch.panneau(new THREE.MeshStandardMaterial({ map: texTableauFeuilles(), roughness: 0.7 }), 0.44, 0.42, 2.15, 4.046, 1.62, 'S');
  ch.panneau(new THREE.MeshStandardMaterial({ color: 0xf1f0ec, roughness: 0.6 }), 0.13, 0.05, 2.11, 4.046, 1.98, 'S');
  // (13/10, photo 10 agrandie : la grille est d'un gris moyen, pas blanche)
  ch.boite(1.84, 4.03, 2.37, 4.048, 0.1, 0.92, new THREE.MeshStandardMaterial({ color: 0xa9aaa6, roughness: 0.5, metalness: 0.2 }), { ombre: false });
  for (let h = 0.14; h < 0.89; h += 0.05) ch.boite(1.87, 4.025, 2.34, 4.03, h, h + 0.025, M.grille, { ombre: false });
  // L'AFFICHETTE SCOTCHÉE sur le vantail OUEST de la porte automatique, juste au-dessus de son autocollant « iris »
  // (photo 07 côté hall, photo 19 côté passage, en transparence ; relecture du 09/10) : elle part avec le vantail
  const pp = ch.portes.auto.find((P) => P.g.name === 'porte passage');
  const vo = pp && pp.vantaux.find((v) => v.s > 0);
  // LES REFLETS DES VITRAGES, côté passage (14/10, photos 19 et 10 : vus du passage, les deux vantaux sont des miroirs
  // sombres — les deux réglettes s'y reflètent en biais, des angles du haut vers le milieu, et le jour de la rue au
  // centre ; le hall, derrière, se devine. Le verre clair du jeu, à 16 % d'opacité, ne renvoyait rien.) Deux faces de
  // plus sur chaque vantail, tournées vers le passage seulement — du hall, elles n'existent pas : un voile sombre, et
  // le reflet PEINT, relevé sur la photo 19 : le jour de la rue sur le tiers du côté du battement, de 0,75 à 1,55 (la
  // réglette peinte, toujours au même endroit, a laissé place à son vrai reflet le 14/10 : plus bas).
  // (14/10, relecture — photo 19 rejouée à sa pose, les teintes rapportées au plafond du passage : vu du passage, le
  // HALL EST JAUNE — la face de la pile à (199, 172, 119), le mur du fond à (182, 168, 129), le sol brun sombre (100, 89,
  // 67) —, le passage lui-même d'un blanc neutre ; le jeu rendait le hall d'un gris neutre, bleuté au milieu, (188, 176,
  // 153) et (135, 125, 102) au sol : la lumière du hall est plus chaude que celle du passage, et l'appareil s'est réglé
  // sur le passage. Le voile sombre MULTIPLIE donc, d'un jaune sourd — 0,92 / 0,80 / 0,56 de 1,35 à 1,8 m —, et
  // presque neutre en haut du vitrage, où l'on voit le plafond du hall, gris neutre sur la photo (127, 122, 121). Les
  // réglettes ne sont plus peintes sur le verre : leur vrai reflet, js/carte_ecole.js.)
  if (pp) {
    const sombre = new THREE.MeshBasicMaterial({ map: canvasTex(4, 64, (g, w, h) => {
      const s = (v) => Math.round(255 * Math.pow(v, 1 / 2.2));
      // (le bas, où l'on voit le sol du hall — brun sombre, (97, 85, 66) sur la photo, (132, 112, 74) au jeu —, plus
      // sombre ; le haut, où l'on voit son plafond, un rien bleuté)
      const PTS = [[0, [0.6, 0.53, 0.46]], [1.0, [0.62, 0.55, 0.47]], [1.35, [0.92, 0.8, 0.56]], [1.8, [0.92, 0.8, 0.56]], [2.05, [0.8, 0.81, 0.9]], [2.4, [0.8, 0.81, 0.9]]];
      for (let j = 0; j < h; j++) {
        const z = ((h - 1 - j) / (h - 1)) * 2.254 + 0.09, i1 = PTS.findIndex((p) => p[0] >= z), k = i1 < 0 ? PTS.length - 1 : Math.max(1, i1);
        const [z0, a] = PTS[k - 1], [z1, b] = PTS[k];
        const q = Math.max(0, Math.min(1, (z - z0) / (z1 - z0))), f = q * q * (3 - 2 * q);
        g.fillStyle = `rgb(${a.map((t, i) => s(t + (b[i] - t) * f)).join(',')})`; g.fillRect(0, j, w, 1);
      }
    }, null, false, 1), blending: THREE.MultiplyBlending, transparent: true, depthWrite: false, toneMapped: false, fog: false });
    sombre.name = 'voile sombre des vitrages du passage';
    const texReflet = (miroir) => canvasTex(128, 320, (g, w, h) => {
      g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
      if (miroir) { g.translate(w, 0); g.scale(-1, 1); }
      const X = (u) => u * w, Y = (hh) => (2.344 - hh) / 2.254 * h;
      // le jour de la rue : un pan bleuté aux bords fondus
      const gr = g.createLinearGradient(X(0.62), 0, X(1), 0); gr.addColorStop(0, 'rgba(120,140,160,0)'); gr.addColorStop(0.35, 'rgba(120,140,160,0.75)'); gr.addColorStop(1, 'rgba(140,158,176,0.95)');
      g.fillStyle = gr; g.fillRect(X(0.62), Y(1.55), X(0.38), Y(0.75) - Y(1.55));
      g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(X(0.62), Y(0.9), X(0.38), 3);
    }, null, false, 4);
    // (relecture C1 du 14/10 : le reflet d'un spot du passage — celui de la réglette est — posait sur le haut du vitrage
    // est une grosse tache claire et floue, au-dessus du reflet des tubes, que la photo 19 n'a pas : le verre de cette
    // porte, presque mat au reflet des lampes, n'en garde rien ; les tubes, eux, s'y reflètent : js/carte_ecole.js)
    let verreP = null;
    pp.g.traverse((o) => { if (o.material && o.material.name === 'verre clair') { verreP = verreP || o.material.clone(); verreP.roughness = 0.6; verreP.envMapIntensity = 0.5; o.material = verreP; } });
    for (const v of pp.vantaux) {
      const reflet = new THREE.MeshBasicMaterial({ map: texReflet(v.s < 0), color: new THREE.Color(0.42, 0.42, 0.42), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
      reflet.name = 'reflet peint des vitrages du passage';
      for (const [m, z, o] of [[sombre, 0.0028, 1], [reflet, 0.0034, 2]]) {
        // (14/10, relecture : le vitrage d'un vantail de 1,035 x 2,47 au cadre de 9 cm — 0,855 de large, de 0,09 à 2,344)
        const r = new THREE.Mesh(new THREE.PlaneGeometry(1.035 - 0.18, 2.254), m);
        r.position.set(v.s * 1.035 / 2, 1.217, z); r.castShadow = false; r.receiveShadow = false; r.renderOrder = o; r.userData.vitre = true; r.userData.horsAOSol = true; r.userData.sansNormales = true; v.g.add(r);
      }
    }
  }
  if (vo) {
    // (13/10, photo 19 refaite à sa pose : x 2,78-3,06, de 1,33 à 1,53 — une feuille blanche au QR code jaune et à la
    // photo orangée, texAffichetteQR)
    // (14/10, relecture, la porte à sa taille : une A4 en large, 0,30 x 0,21, de 1,42 à 1,63 — photo 07 posée sur la
    // porte : 1,44-1,65 ; photo 06 : 1,44-1,63 ; photo 19 : 1,41-1,62 ; son axe à 0,48 des gonds)
    const a = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.21), new THREE.MeshStandardMaterial({ map: texAffichetteQR(), roughness: 0.75 }));
    a.position.set(0.48, 1.525, 0.004); a.castShadow = false; a.userData.vitre = true; vo.g.add(a);
    // (14/10, photos 07 et 06 agrandies : du hall, on ne voit pas un dos gris mais LA MÊME IMAGE À L'ENVERS, par
    // transparence — la photo à gauche, le QR code jaune au milieu —, un peu éteinte)
    const gd = new THREE.PlaneGeometry(0.3, 0.21), uvd = gd.attributes.uv;
    for (let i = 0; i < uvd.count; i++) uvd.setX(i, 1 - uvd.getX(i));
    const dos = new THREE.Mesh(gd, new THREE.MeshStandardMaterial({ map: a.material.map, color: 0xcdc8be, roughness: 0.8 }));
    dos.position.set(0.48, 1.525, -0.004); dos.rotation.y = Math.PI; dos.castShadow = false; dos.userData.vitre = true; vo.g.add(dos);
  }

  // (la plaque « Toilettes » du C01, photo 01 — le fauteuil roulant : avec les toilettes PMR, js/ecole_pieces.js ; 09/10)

  // =====================================================================
  //  L'ACCUEIL : le comptoir nord-sud, l'open-space, ses écrans, ses fauteuils et le manteau moutarde (VO 92,5-95,8 s,
  //  photo 03) — js/ecole_hall.js (10/10)
  // =====================================================================
  // (l'affiche bleue étroite que la photo 03 montre « entre les fenêtres de l'accueil » n'est pas sur le trumeau, entre les
  // deux vraies fenêtres, mais contre l'angle du mitoyen, entre la fenêtre c 18,98 et son reflet dans le miroir — retour
  // r05 du 13/10 : elle est posée avec le miroir, js/ecole_hall.js ; le trumeau est blanc, comme sur la VO q_0381)
  // (le totem noir « 1ère école pour le BTS SIO en France » de 2021 : retiré le 11/10 — la borne l'a remplacé, photo 21)
}

// ---- les petites textures du mobilier ----
// L'ÉCRAN DE LA BORNE (photo 21) : une mosaïque de PHOTOS d'étudiants — des vignettes à dominante bleue et grise, des
// visages, quelques touches chaudes —, pas des aplats de couleurs vives (09/10).
// (Retour de Haythem du 11/10, r02 : « dans le jeu, l'écran montre des pictogrammes de personnages bleus ; sur la photo,
// une mosaïque de vraies photos en couleurs ». Relue sur la photo 21 en pleine définition : TROIS colonnes de trois
// grandes vignettes en hauteur, séparées d'un filet sombre — des photos d'étudiants et des couvertures de plaquettes,
// toutes baignées d'un bleu ciel pâle, leurs sujets en bruns, gris et bleu nuit ; une bande saumon dans la vignette du
// milieu, une couverture bleu nuit à titre jaune en bas. Pour qu'on y lise des PHOTOS et non des icônes, chaque vignette
// est peinte comme une photo floue : un décor fait de dizaines de taches de lumière et d'ombre, des gens de toutes
// tailles, penchés, coupés par le bord, serrés les uns contre les autres, puis le tout passé au flou d'objectif, teinté
// du bleu de l'écran et grainé.)
function texMosaique() {
  return canvasTex(384, 818, (g, w, h) => {
    let germe = 11;
    const rnd = () => { germe = (germe * 16807) % 2147483647; return germe / 2147483647; };
    const choix = (t) => t[Math.floor(rnd() * t.length)];
    g.fillStyle = '#0a0c10'; g.fillRect(0, 0, w, h);
    const peaux = [[226, 188, 160], [205, 152, 118], [178, 124, 92], [132, 88, 62], [238, 206, 182], [160, 108, 80]];
    const cheveux = [[29, 22, 18], [59, 42, 30], [90, 61, 38], [18, 18, 22], [122, 90, 58], [180, 142, 92]];
    const habits = [[34, 46, 78], [222, 226, 230], [96, 104, 116], [60, 64, 70], [150, 112, 84], [44, 70, 110], [180, 92, 70], [120, 130, 140], [200, 190, 170]];
    const decor = [[214, 222, 228], [176, 190, 204], [120, 140, 160], [196, 180, 160], [90, 100, 110], [230, 232, 230], [150, 160, 150]];
    const rgb = (c, k = 1, a = 1) => `rgba(${Math.min(255, Math.round(c[0] * k))},${Math.min(255, Math.round(c[1] * k))},${Math.min(255, Math.round(c[2] * k))},${a})`;
    const tache = (c, x, y, r, a) => { const gr = c.createRadialGradient(x, y, 0, x, y, r), col = choix(decor); gr.addColorStop(0, rgb(col, 1, a)); gr.addColorStop(1, rgb(col, 1, 0)); c.fillStyle = gr; c.fillRect(x - r, y - r, 2 * r, 2 * r); };
    // UNE PERSONNE en volumes, un peu penchée : épaules et bras (plusieurs ellipses), buste éclairé d'en haut, cou, visage
    // à modelé (clair au front, ombré à la mâchoire), cheveux, ombre portée floue sur le décor
    const personne = (c, x, y, r) => {
      const hab = choix(habits), p = choix(peaux), ch = choix(cheveux), a = (rnd() - 0.5) * 0.35;
      c.save(); c.translate(x, y); c.rotate(a);
      c.fillStyle = 'rgba(20,24,30,0.25)'; c.beginPath(); c.ellipse(r * 0.4, r * 3.4, r * 2.6, r * 2.6, 0, 0, 7); c.fill();
      const dc = c.createLinearGradient(0, r * 1.2, 0, r * 6); dc.addColorStop(0, rgb(hab, 1.2)); dc.addColorStop(1, rgb(hab, 0.5)); c.fillStyle = dc;
      c.beginPath(); c.ellipse(-r * 1.3, r * 2.8, r * 0.9, r * 1.6, 0.3, 0, 7); c.ellipse(r * 1.3, r * 2.8, r * 0.9, r * 1.6, -0.3, 0, 7); c.fill();
      c.beginPath(); c.moveTo(-r * 2.2, r * 6.5); c.quadraticCurveTo(-r * 2.1, r * 1.8, 0, r * 1.6); c.quadraticCurveTo(r * 2.1, r * 1.8, r * 2.2, r * 6.5); c.fill();
      c.fillStyle = rgb(p, 0.72); c.fillRect(-r * 0.33, r * 0.75, r * 0.66, r * 1.0);
      const dv = c.createRadialGradient(-r * 0.25, -r * 0.3, r * 0.1, 0, 0, r * 1.2);
      dv.addColorStop(0, rgb(p, 1.14)); dv.addColorStop(0.7, rgb(p, 0.92)); dv.addColorStop(1, rgb(p, 0.62));
      c.fillStyle = dv; c.beginPath(); c.ellipse(0, 0, r * 0.8, r * 1.0, 0, 0, 7); c.fill();
      c.fillStyle = rgb(ch); c.beginPath(); c.ellipse(0, -r * 0.48, r * 0.88, r * 0.6, 0, Math.PI * 1.0, Math.PI * 2.0); c.fill();
      c.beginPath(); c.ellipse(rnd() < 0.5 ? -r * 0.5 : r * 0.5, -r * 0.2, r * 0.42, r * 0.7, 0, 0, 7); c.fill();
      c.fillStyle = 'rgba(40,24,16,0.4)'; c.fillRect(-r * 0.36, -r * 0.05, r * 0.18, r * 0.07); c.fillRect(r * 0.18, -r * 0.05, r * 0.18, r * 0.07);
      c.fillStyle = 'rgba(120,50,40,0.35)'; c.fillRect(-r * 0.2, r * 0.45, r * 0.4, r * 0.08);
      c.restore();
    };
    // une vignette est peinte à part, puis recopiée floutée, teintée du bleu de l'écran et grainée
    const peindre = (cw, chh, type) => {
      const cv = document.createElement('canvas'); cv.width = cw; cv.height = chh; const c = cv.getContext('2d');
      const d = c.createLinearGradient(0, 0, 0, chh), f = type === 'couverture' ? ['#203c7a', '#13234a'] : type === 'brun' ? ['#c9a27a', '#5e3f28'] : choix([['#dbe9f0', '#8fa8ba'], ['#e8e4dc', '#a49c90'], ['#d8b48c', '#8a6440'], ['#f0ece6', '#b7aa98']]);
      d.addColorStop(0, f[0]); d.addColorStop(1, f[1]); c.fillStyle = d; c.fillRect(0, 0, cw, chh);
      if (type !== 'couverture') for (let i = 0; i < 40; i++) tache(c, rnd() * cw, rnd() * chh, 6 + rnd() * cw * 0.35, 0.18 + rnd() * 0.3);
      if (type === 'saumon') { c.fillStyle = 'rgb(217,140,108)'; c.fillRect(cw * 0.3, 0, cw * 0.3, chh * 0.6); }
      if (type === 'couverture') { c.fillStyle = '#e9c84a'; c.fillRect(8, 12, cw * 0.72, 11); c.fillRect(8, 30, cw * 0.46, 7); }
      if (type === 'salle') {
        for (let i = 0; i < 4; i++) { c.fillStyle = 'rgba(40,46,56,0.9)'; c.fillRect(4 + i * cw / 4, chh * 0.42, cw / 4 - 6, chh * 0.13); c.fillStyle = 'rgba(160,205,236,0.9)'; c.fillRect(6 + i * cw / 4, chh * 0.43, cw / 4 - 10, chh * 0.1); }
      }
      // les gens : du plus loin au plus près, de plus en plus grands, coupés par les bords
      const n = type === 'portrait' ? 1 : type === 'couverture' ? 1 : 3 + Math.floor(rnd() * 4);
      for (let i = 0; i < n; i++) {
        const t = n === 1 ? 1 : i / (n - 1), r = cw * (n === 1 ? 0.26 : 0.07 + 0.09 * t + rnd() * 0.03);
        const x = n === 1 ? cw * (0.45 + rnd() * 0.1) : cw * (-0.05 + rnd() * 1.1), y = n === 1 ? chh * 0.32 : chh * (0.3 + 0.35 * t + rnd() * 0.08);
        personne(c, x, y, r);
      }
      return cv;
    };
    // (relecture du 11/10, r02 agrandie : QUATRE rangées de trois, et des vignettes plus chaudes — des bruns, des ocres,
    // du blanc — sous un voile bleu plus léger : c'est l'écran qui bleuit, pas les photos)
    const grille = [['brun', 'portrait', 'groupe'], ['portrait', 'saumon', 'brun'], ['groupe', 'brun', 'portrait'], ['salle', 'couverture', 'groupe']];
    const m = 6, cw = Math.floor((w - 4 * m) / 3), chh = Math.floor((h - 5 * m) / 4);
    for (let j = 0; j < 4; j++) for (let i = 0; i < 3; i++) {
      const x = m + i * (cw + m), y = m + j * (chh + m), cv = peindre(cw, chh, grille[j][i]);
      g.save(); g.beginPath(); g.rect(x, y, cw, chh); g.clip();
      g.filter = 'blur(1.6px) saturate(0.9)'; g.drawImage(cv, x, y); g.filter = 'none';
      g.fillStyle = 'rgba(110,190,240,0.22)'; g.fillRect(x, y, cw, chh);
      for (let k = 0; k < cw * chh / 30; k++) { g.fillStyle = rnd() < 0.5 ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.09)'; g.fillRect(x + rnd() * cw, y + rnd() * chh, 1.5, 1.5); }
      g.restore();
    }
  }, null, false, 4);
}
// L'AFFICHE BLANCHE AUX GRAPHISMES VERTS du mur safran (photos 02 et 21 ; retour de Haythem du 11/10, r02) : ce sont
// DEUX affiches côte à côte — à gauche, une blanche barrée d'un grand chevron vert pâle, le logo « eph » et des titres
// verts ; à droite, une blanc cassé, le logo « Eph » à point rouge et ses colonnes de texte gris
function texAfficheVerte() {
  return canvasTex(340, 512, (g, w, h) => {
    const m = w / 2;
    g.fillStyle = '#fbfbf8'; g.fillRect(0, 0, m - 3, h);
    g.fillStyle = '#efeeea'; g.fillRect(m + 3, 0, m - 3, h);
    g.fillStyle = '#d6e6c4';
    g.beginPath(); g.moveTo(40, 20); g.lineTo(120, 20); g.lineTo(150, 150); g.lineTo(110, 330); g.lineTo(60, 330); g.lineTo(96, 150); g.closePath(); g.fill();
    g.fillStyle = '#6b6f6a'; g.font = '600 26px "Segoe UI", Arial, sans-serif'; g.fillText('eph', 14, 70);
    g.fillStyle = '#7da35a'; for (let l = 0; l < 3; l++) g.fillRect(14, 96 + l * 14, 120 - l * 20, 7);
    g.fillStyle = '#4c5a45'; g.fillRect(14, 160, 130, 5); g.fillRect(14, 172, 100, 5);
    g.fillStyle = '#9a9e98'; for (let l = 0; l < 16; l++) g.fillRect(14, 200 + l * 15 + (l > 7 ? 14 : 0), (l % 5 === 4 ? 70 : 125), 4);
    g.fillStyle = '#3d3d3d'; g.fillRect(14, h - 70, 90, 6);
    g.fillStyle = '#d0262d'; g.beginPath(); g.arc(m + 22, 36, 4, 0, 7); g.fill();
    g.fillStyle = '#5c5f62'; g.font = '600 28px "Segoe UI", Arial, sans-serif'; g.fillText('Eph', m + 20, 64);
    g.fillStyle = '#8a8d90'; for (let l = 0; l < 4; l++) g.fillRect(m + 16, 92 + l * 13, 130 - l * 12, 6);
    g.fillStyle = '#a6a9ab'; for (let l = 0; l < 22; l++) g.fillRect(m + 16, 160 + l * 13 + (l > 10 ? 16 : 0), (l % 4 === 3 ? 60 : 128), 4);
  }, null, false, 4);
}
// LE KAKÉMONO (VO q_0038-0047 ; photo 21 en pleine définition, de chant) : noir ; en haut, le logo « iris » blanc dans son
// cadre à crochet ; « 1ÈRE ÉCOLE POUR LE BTS SIO EN FRANCE » en lettres dorées, « ÉCOLE DE L'INFORMATIQUE ET DU NUMÉRIQUE »
// en blanc, « BAC À BAC+5 » doré ; en bas, l'adresse du site et un code QR
function texKakemono() {
  return canvasTex(256, 640, (g, w, h) => {
    g.fillStyle = '#121214'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#d8d8d8'; g.lineWidth = 3; g.beginPath(); g.moveTo(70, 24); g.lineTo(58, 24); g.lineTo(58, 56); g.stroke();
    g.fillStyle = '#f4f4f2'; g.font = '600 46px "Century Gothic", "Avenir", "Segoe UI", sans-serif'; g.textAlign = 'center'; g.fillText('iris', w / 2, 70);
    g.fillStyle = '#e9a01c'; g.fillRect(w / 2 - 34, 30, 12, 7);
    const dore = '#d9aa48', blanc = '#f1efe9';
    const ligne = (t, y, c, taille, poids = 700) => { g.fillStyle = c; g.font = `${poids} ${taille}px Georgia, "Times New Roman", serif`; g.fillText(t, w / 2, y, w - 30); };
    ligne('1ÈRE ÉCOLE', 160, dore, 26); ligne('POUR LE BTS SIO', 192, dore, 26); ligne('EN FRANCE', 224, dore, 26);
    ligne('ÉCOLE', 300, blanc, 22, 500); ligne('DE L\'INFORMATIQUE', 328, blanc, 22, 500); ligne('ET DU NUMÉRIQUE', 356, blanc, 22, 500);
    ligne('BAC À BAC+5', 420, dore, 22);
    g.fillStyle = '#9a9a9a'; g.font = '500 13px "Segoe UI", Arial, sans-serif'; g.fillText('www.iris.fr', w / 2 - 30, 600);
    g.fillStyle = '#f1efe9'; g.fillRect(w - 64, 566, 44, 44); g.fillStyle = '#121214';
    for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) if ((i * 5 + j * 3 + i * j) % 3 === 0) g.fillRect(w - 61 + i * 6.5, 569 + j * 6.5, 6, 6);
  }, null, false, 8);
}
// L'AFFICHE BLANCHE AUX DESSINS DE COULEUR du pilier (photo 21 en pleine définition) : des coups de pinceau et des
// pictogrammes bleus, orange et violets en haut, des colonnes de texte orangé au milieu, les logos en bas
function texAfficheDessins() {
  return canvasTex(256, 372, (g, w, h) => {
    g.fillStyle = '#fbfaf6'; g.fillRect(0, 0, w, h);
    g.lineCap = 'round';
    for (const [c, x0, y0, x1, y1, e] of [['#3d6fd0', 20, 40, 70, 110, 16], ['#e8862c', 80, 30, 110, 80, 12], ['#7a4cc4', 60, 120, 120, 90, 10], ['#2fa3d9', 150, 60, 230, 120, 14], ['#e04e3a', 200, 30, 230, 60, 9], ['#f2b705', 120, 120, 150, 135, 10]]) {
      g.strokeStyle = c; g.lineWidth = e; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2 + 20, (y0 + y1) / 2 - 25, x1, y1); g.stroke();
    }
    for (const [x, y, c] of [[170, 30, '#e8862c'], [200, 150, '#3d6fd0'], [40, 150, '#2fa3d9']]) { g.strokeStyle = c; g.lineWidth = 4; g.beginPath(); g.arc(x, y, 13, 0, 7); g.stroke(); }
    g.fillStyle = '#e59a62';
    for (let c = 0; c < 3; c++) for (let l = 0; l < 7; l++) g.fillRect(18 + c * 80, 182 + l * 15, 50 + ((c + l) % 3) * 8, 6);
    g.fillStyle = '#2a2a2a'; g.fillRect(18, h - 34, 40, 14); g.fillStyle = '#3d6fd0'; g.fillRect(200, h - 36, 38, 18);
    g.strokeStyle = '#1f1f1f'; g.lineWidth = 4; g.beginPath(); g.moveTo(150, h - 30); g.lineTo(240, h - 70); g.stroke();
  }, null, false, 4);
}
// LE TRACT ORANGE du pilier : le haut orange à titre blanc, un bandeau noir et la photo d'un écran, des vignettes en bas
function texAfficheOrange() {
  return canvasTex(256, 360, (g, w, h) => {
    g.fillStyle = '#fbfaf6'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#f08a24'; g.fillRect(0, 0, w, h * 0.42);
    g.fillStyle = '#ffffff'; g.font = '800 26px Impact, "Arial Black", sans-serif'; g.textAlign = 'center'; g.fillText('REJOINS L\'AVENTURE', w / 2, 46, w - 20);
    g.fillStyle = '#1b1b1d'; g.fillRect(40, 70, w - 80, 70); g.fillStyle = '#e8e8e8'; g.fillRect(60, 84, w - 120, 40);
    g.fillStyle = '#f08a24'; g.fillRect(0, 150, w, 10);
    for (let i = 0; i < 3; i++) { g.fillStyle = ['#3a3f47', '#59616b', '#2c3138'][i]; g.fillRect(14 + i * 80, 196, 70, 54); }
    g.fillStyle = '#9aa0a6'; for (let l = 0; l < 3; l++) g.fillRect(16, 276 + l * 14, 150 - l * 30, 5);
    g.fillStyle = '#f08a24'; g.fillRect(w - 60, h - 46, 46, 34);
  }, null, false, 4);
}
// LES DEUX GRANDES AFFICHES DU JOUR OUEST (photo 21 en pleine définition) : la blanche à titre rouge — un en-tête rouge,
// un titre, des paragraphes —, et la blanche à vignettes de couleur — un titre rouge, six images vertes, orange, rouges
// et bleues, du texte et des logos en bas
function texAfficheTitre() {
  return canvasTex(256, 292, (g, w, h) => {
    g.fillStyle = '#fbfaf7'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#c8332c'; g.fillRect(150, 12, 90, 14); g.fillStyle = '#2b2b2b'; g.fillRect(16, 14, 60, 8);
    g.fillStyle = '#c8332c'; g.font = '800 19px "Segoe UI", Arial, sans-serif'; g.fillText('INFORMATIONS', 16, 58);
    g.fillStyle = '#4a4a4a'; for (let l = 0; l < 13; l++) g.fillRect(16, 76 + l * 14, (l % 4 === 3 ? 0.5 : 0.85) * (w - 32), 5);
    g.fillStyle = '#c8332c'; g.fillRect(16, h - 30, 70, 6);
  }, null, false, 4);
}
// (Relecture du 11/10, r02 et photo 02 agrandies : les six carrés de « PORTES OUVERTES » sont noir, rouge, vert pâle /
// vert, noir, rouge — et non un arc-en-ciel ; l'affiche fait 0,40 x 0,45, d'où un canevas de 256 x 288. La variante
// `sombre` est sa voisine de la colonne ouest, sur la photo 02 : une bande de carrés sombres sous un bloc de texte)
function texAfficheVignettesCouleur(sombre = false) {
  return canvasTex(256, 288, (g, w, h) => {
    g.fillStyle = '#fbfaf7'; g.fillRect(0, 0, w, h);
    g.fillStyle = sombre ? '#3c4a7a' : '#c8332c'; g.font = '800 19px "Segoe UI", Arial, sans-serif'; g.fillText(sombre ? 'PROGRAMME' : 'PORTES OUVERTES', 16, 30, w - 30);
    g.fillStyle = '#4a4a4a'; g.fillRect(16, 40, 150, 5); g.fillRect(16, 50, 110, 5);
    const c = sombre ? [['#2a2a2c', '#141416'], ['#3a3a3e', '#1c1c1f'], ['#2a2a2c', '#141416'], ['#77a35c', '#4e7a3a'], ['#2a2a2c', '#141416'], ['#d9473b', '#9c2a22']]
      : [['#2a2a2c', '#141416'], ['#de4b3d', '#a5291f'], ['#9cc27a', '#6f9a52'], ['#6f9e52', '#466f33'], ['#2a2a2c', '#141416'], ['#e0503f', '#a8301f']];
    for (let i = 0; i < 6; i++) {
      const x = 16 + (i % 3) * 77, y = 68 + Math.floor(i / 3) * 62, d = g.createLinearGradient(0, y, 0, y + 54);
      d.addColorStop(0, c[i][0]); d.addColorStop(1, c[i][1]); g.fillStyle = d; g.fillRect(x, y, 70, 54);
      g.fillStyle = 'rgba(255,240,225,0.55)'; g.beginPath(); g.arc(x + 35, y + 24, 9, 0, 7); g.fill();
    }
    g.fillStyle = '#5a5a5a'; for (let l = 0; l < 5; l++) g.fillRect(16, 204 + l * 12, (0.5 + (l % 3) * 0.15) * w, 4);
    for (let i = 0; i < 4; i++) { g.fillStyle = ['#1f1f1f', '#c8332c', '#3d7ac9', '#5aa35a'][i]; g.fillRect(16 + i * 58, h - 22, 44, 12); }
  }, null, false, 4);
}
// LES BROCHURES du présentoir (photos 01, 21) : des couvertures de magazine — fond blanc ou clair, une grande photo aux
// tons doux, un bandeau de titre de couleur — et non des tranches de couleurs vives (09/10)
// (11/10, r02 : sur la photo 21 en pleine définition, QUATRE couvertures par tablette, de la taille d'un A5, qui se
// chevauchent un peu — lilas, vert pomme, blanc, gris, une rouge — et non neuf vignettes étroites de 7 cm)
function texBrochures() {
  return canvasTex(512, 168, (g, w, h) => {
    g.fillStyle = '#111'; g.fillRect(0, 0, w, h);
    const fonds = ['#ece6f2', '#eef3e6', '#f6f4f0', '#e2e4e8', '#f4ece8', '#e9e4f0'];
    const photos = [['#b3a2cf', '#5f4e86'], ['#a9c98a', '#4f7a3a'], ['#c8a07a', '#6e4e38'], ['#9aa8b8', '#4e5a6c'], ['#d98a7a', '#8a3a30'], ['#c4b6dc', '#6a5a92']];
    const titres = ['#7b4fb0', '#5aa33e', '#e04e3a', '#2f6fb0', '#222222', '#9a62c8'];
    for (let r = 0; r < 2; r++) for (let i = 0; i < 4; i++) {
      const k = r * 4 + i, x = 6 + i * 126 + (r ? 60 : 0), y = r ? 30 : 6, cw = 118, chh = h - 12 - (r ? 24 : 0);
      if (r && i === 3) continue;
      g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(x + 4, y + 4, cw, chh);
      g.fillStyle = fonds[k % fonds.length]; g.fillRect(x, y, cw, chh);
      const p = photos[(k * 5 + 2) % photos.length], d = g.createLinearGradient(0, y + 26, 0, y + chh - 22);
      d.addColorStop(0, p[0]); d.addColorStop(1, p[1]); g.fillStyle = d; g.fillRect(x + 5, y + 26, cw - 10, chh - 50);
      g.fillStyle = 'rgba(240,222,204,0.85)'; g.beginPath(); g.ellipse(x + cw * (0.35 + (k % 3) * 0.15), y + 62, 10, 12, 0, 0, 7); g.fill();
      g.fillStyle = 'rgba(30,30,40,0.55)'; g.beginPath(); g.ellipse(x + cw * (0.35 + (k % 3) * 0.15), y + 98, 20, 22, 0, Math.PI, 0); g.fill();
      g.fillStyle = titres[k % titres.length]; g.fillRect(x + 5, y + 5, cw - 10, 16);
      g.fillStyle = 'rgba(40,40,40,0.55)'; g.fillRect(x + 6, y + chh - 18, cw * 0.7, 4); g.fillRect(x + 6, y + chh - 10, cw * 0.5, 4);
    }
  }, null, false, 4);
}
// l'affichette WIFI (photo 03) : noire, le titre et deux lignes en blanc, le QR code à droite
// LE PETIT TABLEAU du pan plein du passage (photo 10) : sombre, six feuilles blanches épinglées sur deux colonnes
function texTableauFeuilles() {
  return canvasTex(96, 100, (g, w, h) => {
    g.fillStyle = '#20232b'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 6; k++) {
      const x = 8 + (k % 2) * 44, y = 7 + Math.floor(k / 2) * 31;
      g.fillStyle = k === 3 ? '#e4ddd0' : '#f4f3ef'; g.fillRect(x, y, 36, 26);
      g.fillStyle = '#9aa0a6'; for (let l = 0; l < 3; l++) g.fillRect(x + 4, y + 6 + l * 6, 20 + ((k + l) % 3) * 4, 2);
    }
  }, null, false, 4);
}
// LA PETITE PLAQUE sous le pictogramme de l'extincteur du hall ouest (photo 06, à 1,54 m) : un carré rouge au liseré
// blanc sur un fond bleu, la consigne en blanc dessous
function texPlaqueRougeBleue() {
  return canvasTex(64, 64, (g, w, h) => {
    // (14/10, photo 06 agrandie : un carré ROUGE BRIQUE, son quart bas gauche bleu, des lignes blanches en haut à gauche —
    // et non un cadre bleu autour d'un pavé rouge vif)
    g.fillStyle = '#9a3a2c'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#2f55a4'; g.fillRect(0, 34, 30, 30);
    g.fillStyle = '#e9dfd8'; for (let k = 0; k < 3; k++) g.fillRect(5, 9 + k * 7, 24 - k * 4, 3); g.fillRect(34, 16, 10, 4); g.fillRect(48, 12, 9, 4);
    g.fillRect(5, 52, 18, 5);
  }, null, false, 4);
}
// LE PLAN D'ÉVACUATION DU HALL OUEST (13/10, photos 06 et 19 agrandies) : une feuille blanche sous un cadre d'aluminium,
// un filet bleu foncé, le bandeau « Consignes de sécurité », deux étiquettes bleues et une pastille verte, le plan de
// l'étage au trait fin sur les six dixièmes du haut, puis trois encadrés à en-tête bleu — « Accident » et « Incendie » côte
// à côte, « Évacuation » dessous — aux petits pictogrammes verts et rouges ; pas les gros pavés de couleur de la
// consigne générique (js/ecole_matieres.js texConsignes)
function texPlanEvacuation() {
  return canvasTex(320, 496, (g, w, h) => {
    g.fillStyle = '#b9bcc0'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#f6f5f0'; g.fillRect(7, 7, w - 14, h - 14);
    g.strokeStyle = '#1f3f8f'; g.lineWidth = 3; g.strokeRect(13, 13, w - 26, h - 26);
    g.fillStyle = '#1f3f8f'; g.fillRect(15, 15, w - 30, 30);
    g.fillStyle = '#ffffff'; g.font = '700 19px "Segoe UI", Arial, sans-serif'; g.fillText('Consignes de sécurité', 22, 37);
    g.fillStyle = '#1f3f8f'; g.fillRect(22, 54, 92, 13); g.fillRect(228, 52, 66, 10);
    g.fillStyle = '#ffffff'; g.font = '600 9px "Segoe UI", Arial, sans-serif'; g.fillText('Plan d’évacuation', 26, 64);
    g.fillStyle = '#3aa565'; g.beginPath(); g.arc(128, 78, 8, 0, 7); g.fill();
    g.fillStyle = '#8b9098'; for (const [x, y, l] of [[22, 74, 40], [22, 82, 70], [22, 90, 52]]) g.fillRect(x, y, l, 2);
    // le plan au trait : l'enveloppe, les cloisons, des cotes
    g.strokeStyle = '#5d6168'; g.lineWidth = 1.4;
    g.strokeRect(70, 100, 122, 96); g.strokeRect(192, 100, 96, 62); g.strokeRect(196, 162, 92, 52); g.strokeRect(150, 150, 46, 46);
    g.strokeRect(84, 146, 44, 60); g.strokeRect(84, 214, 120, 58); g.strokeRect(160, 228, 44, 44);
    g.lineWidth = 0.8; g.strokeStyle = '#8b8f96';
    for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(152 + k * 9, 150); g.lineTo(152 + k * 9, 196); g.moveTo(150, 156 + k * 9); g.lineTo(196, 156 + k * 9); g.stroke(); }
    for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(164 + k * 10, 228); g.lineTo(164 + k * 10, 272); g.stroke(); }
    g.fillStyle = '#8b8f96';
    for (const [x, y, l] of [[78, 108, 30], [120, 112, 48], [204, 112, 40], [212, 140, 52], [92, 158, 24], [92, 226, 40], [100, 250, 30], [220, 180, 40], [46, 150, 16], [46, 240, 16]]) g.fillRect(x, y, l, 1.5);
    g.fillStyle = '#c84b4b'; g.fillRect(120, 270, 30, 2); g.fillRect(196, 200, 2, 12);
    // les trois encadrés
    const cadre = (x, y, l, ht, titre, lt) => {
      g.strokeStyle = '#1f3f8f'; g.lineWidth = 2.5; g.strokeRect(x, y, l, ht);
      g.fillStyle = '#1f3f8f'; g.fillRect(x + 5, y + 6, lt, 13);
      g.fillStyle = '#ffffff'; g.font = '600 9px "Segoe UI", Arial, sans-serif'; g.fillText(titre, x + 9, y + 16);
    };
    const ligne = (x, y, l) => { g.fillStyle = '#878c93'; g.fillRect(x, y, l, 2); g.fillRect(x, y + 5, l * 0.7, 2); };
    const picto = (x, y, c) => { g.fillStyle = c; g.fillRect(x, y, 12, 12); g.fillStyle = 'rgba(255,255,255,0.75)'; g.fillRect(x + 3, y + 3, 6, 6); };
    cadre(22, 292, 76, 62, 'Accident', 56); picto(28, 316, '#3aa565'); ligne(46, 318, 44); picto(28, 334, '#3aa565'); ligne(46, 337, 40);
    cadre(104, 292, 194, 62, 'Incendie', 62); picto(118, 316, '#d0342f'); picto(146, 316, '#d0342f'); picto(196, 298, '#d0342f'); ligne(214, 300, 76); picto(196, 318, '#d0342f'); ligne(214, 321, 70); ligne(118, 338, 60); ligne(196, 340, 64);
    cadre(22, 362, 276, 110, 'Évacuation', 70);
    for (let k = 0; k < 3; k++) { picto(32, 388 + k * 26, '#3aa565'); ligne(52, 391 + k * 26, 62); picto(126, 372 + k * 30, k === 2 ? '#d0342f' : '#3aa565'); ligne(146, 375 + k * 30, 58); picto(214, 372 + k * 30, '#3aa565'); ligne(234, 375 + k * 30, 54); }
  }, null, false, 8);
}
// L'AFFICHE DU TRI DU HALL OUEST (13/10, photo 06 agrandie ; photos 04 et 20) : un jaune d'or — (171, 130, 48) sur la
// photo, le jeu la rendait orangée —, sous une marge blanche ; une corbeille blanche évasée, une chute prune qui y tombe,
// une grande flèche prune qui monte à droite, coupée par le bord, et le disque blanc d'une tête en haut à droite ; deux
// lignes de petit texte en bas à gauche
function texTriHall() {
  return canvasTex(256, 362, (g, w, h) => {
    g.fillStyle = '#f3f1ea'; g.fillRect(0, 0, w, h);
    const X = (u) => 5 + u * (w - 10), Y = (v) => 5 + v * (h - 16);
    // (14/10 : un jaune moins saturé — photos 06 et 20, à 0,93 / 0,80 / 0,43 du mur ; il sortait à 0,94 / 0,75 / 0,24)
    g.fillStyle = '#e9be64'; g.fillRect(X(0), Y(0), w - 10, h - 16);
    const poly = (c, pts) => { g.fillStyle = c; g.beginPath(); pts.forEach(([u, v], i) => (i ? g.lineTo(X(u), Y(v)) : g.moveTo(X(u), Y(v)))); g.closePath(); g.fill(); };
    poly('#5c2a4a', [[0.447, 0.396], [0.94, 0.185], [1.0, 0.21], [1.0, 0.8], [0.82, 0.8], [0.73, 0.71], [0.73, 0.396]]);
    poly('#5c2a4a', [[0.33, 0.525], [0.42, 0.465], [0.515, 0.5], [0.5, 0.53]]);
    poly('#f4f2ec', [[0.205, 0.515], [0.605, 0.515], [0.54, 0.77], [0.32, 0.77]]);
    g.fillStyle = '#f4f2ec'; g.beginPath(); g.arc(X(0.84), Y(0.165), 0.105 * (w - 10), 0, 7); g.fill();
    g.fillStyle = '#b5782a'; g.fillRect(X(0.035), Y(0.957), 0.42 * (w - 10), 2.5); g.fillRect(X(0.035), Y(0.978), 0.3 * (w - 10), 2.5);
  }, null, false, 8);
}
// LES DEUX FEUILLES DU VANTAIL FERMÉ des portes de l'escalier (13/10, photos 20 et 04 agrandies) : la fiche blanche —
// un bandeau gris en tête, des lignes, trois pavés bleus de front, des lignes, une rangée de petites cases — et, au-
// dessus, une photo imprimée (des tons ocre et bruns, un coin blanc) sous sa pochette
function texFicheBleue() {
  return canvasTex(192, 282, (g, w, h) => {
    g.fillStyle = '#f2f3f4'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#aab2bc'; g.fillRect(10, 12, w - 20, 26);
    g.fillStyle = '#7d848d'; for (let k = 0; k < 4; k++) g.fillRect(14, 52 + k * 10, w - 40 - (k % 2) * 30, 3);
    g.fillStyle = '#2f5fae'; for (let k = 0; k < 3; k++) g.fillRect(14 + k * 58, 108, 50, 26);
    g.fillStyle = '#7d848d'; for (let k = 0; k < 6; k++) g.fillRect(14, 152 + k * 11, w - 34 - (k % 3) * 22, 3);
    g.strokeStyle = '#7d848d'; g.lineWidth = 2; for (let k = 0; k < 4; k++) g.strokeRect(40 + k * 30, 236, 20, 20);
  }, null, false, 4);
}
function texPhotoImprimee() {
  return canvasTex(192, 186, (g, w, h) => {
    g.fillStyle = '#e9e6de'; g.fillRect(0, 0, w, h);
    const d = g.createLinearGradient(0, 0, w, h); d.addColorStop(0, '#c9b58a'); d.addColorStop(0.5, '#a8814a'); d.addColorStop(1, '#5e4a36');
    g.fillStyle = d; g.fillRect(8, 8, w - 16, h - 16);
    g.fillStyle = '#e4c24a'; g.fillRect(70, 44, 44, 40); g.fillStyle = '#f1efe9'; g.fillRect(20, 20, 46, 62); g.fillRect(124, 100, 50, 60);
    g.fillStyle = 'rgba(60,44,30,0.7)'; g.fillRect(24, 100, 80, 58);
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.moveTo(w - 70, 0); g.lineTo(w, 0); g.lineTo(w, 60); g.closePath(); g.fill();
  }, null, false, 4);
}
// LE GRAND TABLEAU DE LIÈGE DU PASSAGE (13/10, photos 07 et 10 agrandies) : un seul panneau de 2,1 m, chargé de feuilles
// blanches, bleues et mauves, de tracts roses, punaisés de travers et qui se chevauchent — pas neuf affiches de
// couleurs vives rangées en damier
function texLiegePassage() {
  return canvasTex(960, 288, (g, w, h) => {
    const r = graineMob(77);
    g.fillStyle = '#b98b56'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 9000; k++) { g.fillStyle = r() < 0.5 ? 'rgba(118,80,42,0.32)' : 'rgba(224,186,136,0.28)'; g.fillRect(r() * w, r() * h, 1.6, 1.6); }
    // (14/10, photo 07 rapportée au mur : le tableau est à 0,90 / 0,92 / 0,95 — presque tout BLANC, des A4 bord à bord
    // sur deux rangs ; le jeu, à 0,72 / 0,65 / 0,58, montrait surtout le liège sous des feuilles de 12 à 18 cm)
    const tons = ['#f4f3ee', '#f4f3ee', '#eef0f3', '#3a5fa8', '#f4f3ee', '#e9e6de', '#f4f3ee', '#f4f3ee', '#8fb4d8', '#f1e7c8', '#f4f3ee', '#f4f3ee', '#eceae4', '#c9a9c9', '#6a3f8e', '#f4f3ee'];
    for (let i = 0; i < 26; i++) {
      const pw = 72 + r() * 10, ph = pw * (1.36 + r() * 0.08), x = 6 + (i % 13) * 72 + (r() - 0.5) * 14, y = (i < 13 ? 18 : 150) + (r() - 0.5) * 22;
      const c = tons[Math.floor(r() * tons.length)], clair = c > '#c';
      g.save(); g.translate(x + pw / 2, y + ph / 2); g.rotate((r() - 0.5) * 0.14);
      g.fillStyle = 'rgba(60,40,20,0.25)'; g.fillRect(-pw / 2 + 2, -ph / 2 + 3, pw, ph);
      g.fillStyle = c; g.fillRect(-pw / 2, -ph / 2, pw, ph);
      g.fillStyle = clair ? 'rgba(60,70,90,0.55)' : 'rgba(255,255,255,0.7)';
      g.fillRect(-pw / 2 + 5, -ph / 2 + 6, pw * 0.6, 5);
      for (let l = 0; l < 6; l++) g.fillRect(-pw / 2 + 5, -ph / 2 + 18 + l * 8, pw * (0.5 + r() * 0.35), 2.5);
      if (r() < 0.22) { g.fillStyle = ['#7b5a9a', '#c9a13c', '#3a5fa8'][Math.floor(r() * 3)]; g.fillRect(-pw / 2 + 5, ph / 2 - 20, pw - 10, 12); }
      g.restore();
    }
  }, null, false, 8);
}
// (un tirage pseudo-aléatoire stable pour les textures du passage)
function graineMob(n) { let a = n >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
// L'AFFICHE AU DÉGRADÉ du mur est du passage, contre la paroi (13/10, photo 07 agrandie) : du rose au bleu, un grand
// titre blanc en haut, un second au milieu, un pavé bleu clair en bas
function texAfficheDegradee() {
  return canvasTex(256, 362, (g, w, h) => {
    const d = g.createLinearGradient(0, 0, w * 0.4, h); d.addColorStop(0, '#d9a7c4'); d.addColorStop(0.45, '#b98ac6'); d.addColorStop(1, '#5b8fd0');
    g.fillStyle = d; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,0.92)'; g.font = '800 27px "Segoe UI", Arial, sans-serif'; g.fillText('STRATÉGIES', 16, 62);
    g.font = '800 40px "Segoe UI", Arial, sans-serif'; g.fillText('TECH', 60, 200);
    g.fillStyle = 'rgba(255,255,255,0.75)'; for (let k = 0; k < 3; k++) g.fillRect(18, 86 + k * 12, 150 - k * 30, 4);
    g.fillStyle = 'rgba(120,190,235,0.85)'; g.fillRect(40, 250, 130, 70);
    g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.arc(104, 286, 14, 0, 7); g.fill();
  }, null, false, 8);
}
// LA CHARTE du mur ouest du passage, contre la paroi (13/10, photos 07 et 06 agrandies) : une feuille blanche barrée de
// larges coups de pinceau bleus et rouges où se lit le texte en blanc
function texCharte() {
  return canvasTex(256, 362, (g, w, h) => {
    g.fillStyle = '#f6f5f0'; g.fillRect(0, 0, w, h);
    const coup = (x, y, l, e, c) => { g.fillStyle = c; g.beginPath(); g.moveTo(x, y + 3); g.lineTo(x + l - 8, y); g.lineTo(x + l, y + e * 0.5); g.lineTo(x + l - 6, y + e); g.lineTo(x + 4, y + e - 2); g.closePath(); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.85)'; g.fillRect(x + 12, y + e * 0.42, l * 0.6, 3); };
    coup(20, 14, 150, 30, '#3f86c9'); coup(96, 56, 140, 30, '#3f86c9');
    g.fillStyle = '#51607a'; g.font = '700 15px "Segoe UI", Arial, sans-serif'; g.fillText('CHARTE DE VIE', 60, 112); g.fillText('À L’ÉCOLE', 96, 130);
    coup(14, 146, 96, 30, '#4a6fc0'); coup(128, 150, 112, 26, '#d5475a');
    coup(18, 190, 86, 30, '#d5475a'); coup(118, 186, 124, 30, '#3f86c9');
    coup(30, 236, 190, 30, '#3f86c9'); coup(16, 282, 150, 30, '#d5475a'); coup(170, 286, 70, 24, '#4a6fc0');
    g.fillStyle = '#8b9098'; g.fillRect(20, 334, 120, 3); g.fillRect(20, 343, 80, 3);
  }, null, false, 8);
}
// la petite bande aux trois pictogrammes (crayon, horloge, stylo), mur ouest du passage (photo 07)
function texBandePictos() {
  return canvasTex(152, 56, (g, w, h) => {
    g.fillStyle = '#f3f2ee'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#23262b'; g.fillRect(10, 8, 5, 40);
    g.strokeStyle = '#5a78b8'; g.lineWidth = 3; g.beginPath(); g.arc(72, 26, 11, 0, 7); g.stroke();
    g.strokeStyle = '#3f79b5'; g.lineWidth = 4; g.beginPath(); g.moveTo(112, 42); g.lineTo(136, 10); g.stroke();
    g.fillStyle = '#8b9098'; g.fillRect(24, 38, 30, 3);
  }, null, false, 4);
}
// LES TROIS ÉTIQUETTES DE LA PORTE « SORTIE » du passage (13/10, photo 07 agrandie) : la flèche « ← Sortie » bleu canard,
// le disque barré rouge sur fond blanc, la petite étiquette rouge
function texEtiquettesSortie() {
  return canvasTex(128, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = '#2f6f86'; g.fillRect(4, 4, 120, 48);
    g.fillStyle = '#ffffff'; g.font = '700 24px "Segoe UI", Arial, sans-serif'; g.fillText('Sortie', 44, 37);
    g.fillRect(16, 25, 22, 5); g.beginPath(); g.moveTo(8, 27.5); g.lineTo(20, 17); g.lineTo(20, 38); g.closePath(); g.fill();
    g.fillStyle = '#fbfbf8'; g.fillRect(18, 74, 92, 104);
    g.strokeStyle = '#d5475a'; g.lineWidth = 9; g.beginPath(); g.arc(64, 126, 36, 0, 7); g.stroke();
    g.beginPath(); g.moveTo(40, 100); g.lineTo(88, 152); g.stroke();
    g.fillStyle = '#44484e'; g.fillRect(52, 118, 26, 6); g.fillRect(58, 130, 14, 4);
    g.fillStyle = '#d5475a'; g.fillRect(24, 206, 80, 26);
    g.fillStyle = '#ffffff'; g.fillRect(32, 216, 64, 5);
  }, null, true, 4);
}
// L'AFFICHETTE SCOTCHÉE SUR LA VITRE (13/10, photo 19 agrandie) : une feuille blanche en largeur, deux lignes de texte et
// un mot surligné de jaune à gauche, un QR code jaune au milieu, une photo aux tons orangés à droite
function texAffichetteQR() {
  return canvasTex(256, 182, (g, w, h) => {
    g.fillStyle = '#f7f6f2'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#44484e'; g.fillRect(24, 78, 78, 4); g.fillStyle = '#e9c63c'; g.fillRect(34, 90, 56, 9); g.fillStyle = '#44484e'; g.fillRect(40, 93, 44, 3);
    g.fillStyle = '#e3bd32'; g.fillRect(108, 62, 46, 46); g.fillStyle = '#5a4a14';
    for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) if ((i * 5 + j * 3 + i * j) % 3 === 0) g.fillRect(110 + i * 4.7, 64 + j * 4.7, 4, 4);
    const d = g.createLinearGradient(160, 0, w, h); d.addColorStop(0, '#d98a4a'); d.addColorStop(0.5, '#9a8f8a'); d.addColorStop(1, '#5c6a86');
    g.fillStyle = d; g.fillRect(160, 10, 86, 162);
    g.fillStyle = 'rgba(240,236,228,0.9)'; g.beginPath(); g.ellipse(196, 96, 22, 14, -0.3, 0, 7); g.fill(); g.beginPath(); g.ellipse(214, 132, 16, 10, 0.2, 0, 7); g.fill();
    g.fillStyle = 'rgba(40,44,60,0.7)'; g.fillRect(206, 20, 34, 46);
  }, null, false, 8);
}
function texWifi() {
  return canvasTex(160, 136, (g, w, h) => {
    g.fillStyle = '#121212'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#f2f2f2'; g.font = '700 15px "Segoe UI", Arial, sans-serif'; g.fillText('WIFI IRIS', 12, 30);
    g.font = '500 9px "Segoe UI", Arial, sans-serif'; g.fillText('réseau : iris-etudiants', 12, 62); g.fillText('scanne le code', 12, 78);
    g.fillStyle = '#f2f2f2'; g.fillRect(98, 48, 50, 50); g.fillStyle = '#121212';
    for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) if ((i * 7 + j * 3 + i * j) % 3 === 0) g.fillRect(101 + i * 6.5, 51 + j * 6.5, 6, 6);
  }, null, false, 4);
}

// LES DEUX AFFICHES DE LA FACE EST DU PILIER GRIS (VO q_0039-0050, 10/10) : l'A3 bleu-gris au dessin d'écran
// d'ordinateur (un écran, son clavier, des bulles), l'A4 blanche à vignettes de photos
function texEcranA3() {
  return canvasTex(256, 362, (g, w, h) => {
    g.fillStyle = '#9fb3c8'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#e9eef4'; g.fillRect(16, 16, w - 32, 54);
    g.fillStyle = '#2b4c6e'; g.fillRect(28, 30, w * 0.55, 12); g.fillRect(28, 50, w * 0.35, 8);
    g.fillStyle = '#2c3440'; g.fillRect(40, 96, w - 80, 120); g.fillStyle = '#e6edf5'; g.fillRect(50, 106, w - 100, 100);
    g.fillStyle = '#f08a24'; g.fillRect(64, 120, 70, 10); g.fillStyle = '#7f95ad'; for (let k = 0; k < 4; k++) g.fillRect(64, 142 + k * 14, 110 - k * 12, 6);
    g.fillStyle = '#2c3440'; g.fillRect(w / 2 - 12, 216, 24, 18); g.fillRect(w / 2 - 50, 234, 100, 8); g.fillRect(56, 256, w - 112, 22);
    g.fillStyle = '#ffffff'; for (const [x, y, r] of [[40, 300, 14], [92, 318, 10], [200, 296, 16]]) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
    g.fillStyle = '#4a5a6c'; g.fillRect(16, h - 26, w * 0.5, 8);
  }, null, false, 4);
}
function texVignettes() {
  return canvasTex(256, 362, (g, w, h) => {
    g.fillStyle = '#fbfbf8'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#2b4c6e'; g.fillRect(16, 16, w * 0.6, 14); g.fillStyle = '#9aa0a6'; g.fillRect(16, 38, w * 0.4, 8);
    const tons = [['#8aa0b8', '#4e5f73'], ['#c8a07a', '#6e4e38'], ['#9fb39a', '#4f6650'], ['#b9b4c8', '#5d566e'], ['#d6c2a8', '#7d6650'], ['#7f95a8', '#3a4a5c']];
    for (let i = 0; i < 6; i++) {
      const x = 16 + (i % 2) * 116, y = 62 + Math.floor(i / 2) * 96, [a, b] = tons[i];
      const d = g.createLinearGradient(0, y, 0, y + 80); d.addColorStop(0, a); d.addColorStop(1, b); g.fillStyle = d; g.fillRect(x, y, 108, 80);
      g.fillStyle = 'rgba(240,222,204,0.85)'; g.beginPath(); g.arc(x + 54, y + 34, 12, 0, 7); g.fill();
    }
  }, null, false, 4);
}
