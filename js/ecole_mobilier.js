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
import { texAffiche, texConsignes, texTri, texEcran, texPictoExtincteur } from './ecole_matieres.js';
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
// (13 cm au-dessus de l'assise), court à 20 cm le long des flancs, puis monte en DOSSIER (37,5 cm), renversé de 15° ; à
// l'avant, entre les coins, il retombe de 3,5 cm sous les genoux (la « cascade »). Le plan se resserre vers le dos.
function geoCoque() {
  if (_coque) return _coque;
  const NA = 72, NS = 7, NC = 16, A = 0.312, P = 0.278, Y = 0.45, n = 3.6, T0 = 0.66, K = 0.92;
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
      const bord = -0.035 + 0.235 * lisse(0.015, 0.22, dos) + 0.175 * lisse(0.48, 1, dos);
      const assise = (-0.02 * (1 - rho * rho) + 0.018 * c * rho) * (1 - eta);
      const h = bord * eta;
      const p = [s * A * r * rho * larg, Y + assise + h, c * P * r * rho - 0.26 * Math.max(0, h) * dos * dos];
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
  if (!_matsCoque.has(couleur)) _matsCoque.set(couleur, new THREE.MeshStandardMaterial({ color: couleur, roughness: 0.38, side: THREE.DoubleSide }));
  // L'OMBRE DE LA COQUE. Ni dans l'ombre cuite au sol (vue de dessus, la coque faisait une tache noire de sa taille
  // posée sur des pieds fins), ni dans la carte d'ombre de la lumière principale (presque d'aplomb, elle découpait sous
  // chaque chaise un pavé noir à bord net) : sur les photos 02 et 21, la lumière vient de tous les plafonniers à la fois
  // et l'ombre d'une chaise n'est qu'un voile flou. Ce voile est une tache dégradée posée au sol ; les pieds, eux,
  // gardent leurs ombres fines.
  const coque = maille(geoCoque(), _matsCoque.get(couleur), 0, 0, 0, 0, g, { ombre: false });
  const ourlet = maille(_ourlet, _matsCoque.get(couleur), 0, 0, 0, 0, g, { ombre: false });
  coque.userData.horsAOSol = ourlet.userData.horsAOSol = true;
  const voile = new THREE.Mesh(_geoVoile || (_geoVoile = new THREE.PlaneGeometry(0.86, 0.8).rotateX(-Math.PI / 2)), matVoile());
  voile.position.set(0, 0.003, -0.02); voile.renderOrder = 1; voile.userData.horsAOSol = true; g.add(voile);
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
  [[6.8, 'blanc'], [7.5, 'canard'], [8.2, 'grege'], [8.9, 'citron'], [9.6, 'blanc']].forEach(([x, c]) => chaise(ch, x, 7.42, 'S', COQUE[c]));
  // (r03, 12/10 : la rangée sud reste adossée au mur des jours, qui recule de 0,20 — S)
  [[5.4, 'noir'], [6.2, 'rose'], [7.0, 'canard']].forEach(([x, c]) => chaise(ch, x, S(9.45), 'N', COQUE[c]));
  C.ajouterBoite(6.45, -7.75, 9.95, -7.05, { y1: 0.8 });
  for (const x of [5.4, 6.2, 7.0]) C.ajouterBoite(x - 0.32, -S(9.8), x + 0.32, -S(9.1), { y1: 0.8 });
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
    const b0 = roulettes ? 0.07 : 0.02;
    for (const sx of [-0.39, 0.39]) maille(boiteM(0.022, 1.73, 0.36), M.noir, sx, b0 + 0.865, 0, 0, pres);
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
  presentoir(13.31, 8.5, true);
  // LE KAKÉMONO « 1ère école pour le BTS SIO en France » (retour de Haythem du 11/10, r02 : « le panneau noir au bout du
  // mur » — sur la photo 21 en pleine définition, un panneau noir à lettres blanches et dorées, plus haut qu'un homme,
  // juste après la fin du jaune ; le même que la VO de 2021, q_0038-0047, au bout est du mur safran, devant lui). Vu du
  // bout ouest, presque de chant : il est donc DEVANT le mur, à 0,25 m, de x 11,0 à 11,75, un rien tourné vers la salle ;
  // sa cassette d'aluminium au sol, son mât, sa barre haute. Il ne gêne ni les chaises ni l'entrée du C01.
  {
    const kx = 11.375, ky = 7.54, th = -0.105;
    const k = new THREE.Group(); k.position.set(kx, 0, -ky); k.rotation.y = th; ch.decor.add(k);
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
  // (retour r03 du 12/10 : le pilier a glissé sur le rayon de r02 avec la salle élargie, x 9,35-10,21 × y 5,39-5,82 —
  // js/carte_ecole.js ; ses affiches le suivent)
  const PO = { x: 9.35, xe: 10.21, yc: 5.605, yn: 5.82 };
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
  cadreMural(ch, new THREE.MeshStandardMaterial({ map: texConsignes(), roughness: 0.5 }), 2.45, 4.51, 'E', 0.44, 1.08, 1.7);
  // la prise électrique contre l'huisserie nord de la porte grise, au ras de la plinthe (photo 06, vidéo v_001)
  ch.boite(1.75, 6.01, 1.765, 6.09, 0.16, 0.24, M.blanc, { ombre: false });
  for (const dy of [-0.018, 0.018]) ch.boite(1.765, 6.05 + dy - 0.005, 1.768, 6.05 + dy + 0.005, 0.195, 0.205, M.noirMat, { ombre: false });
  // L'EXTINCTEUR rouge sur sa console et ses deux plaques (photo 06 : au fond du renfoncement, à 0,95 m au nord de la
  // porte grise et à 0,3 m de l'angle). Plus bas qu'il n'était : la photo 06 rejouée à la pose recalée — la porte, son
  // oculus et le pictogramme y tombent à quelques pixels — met le corps de 0,66 à 1,08 (372 à 440 px), la poignée verte
  // vers 1,15 et le haut de la boucle du tuyau vers 1,28 (le jeu : corps 0,96-1,44, poignée 1,56 ; plan V2 : 0,60-1,20,
  // 1,46). Au-dessus, le pictogramme à 1,92 et la petite plaque rouge et bleue à 1,53.
  // (relecture du 11/10, photo 06 rejouée : il est TRAPU, 0,18 m de diamètre — un 6 litres —, et non 0,15)
  const ext = new THREE.Group(); ext.position.set(1.86, 0, -6.9); ch.decor.add(ext);
  maille(new THREE.CylinderGeometry(0.09, 0.09, 0.42, 18), M.rougeEtiquette, 0, 0.87, 0, 0, ext);
  maille(new THREE.SphereGeometry(0.09, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2), M.rougeEtiquette, 0, 1.08, 0, 0, ext);
  maille(new THREE.CylinderGeometry(0.03, 0.045, 0.08, 10), M.noirMat, 0, 1.17, 0, 0, ext);
  maille(boiteM(0.04, 0.06, 0.06), M.noirMat, -0.095, 1.02, 0, 0, ext);
  // (photo 06 : la poignée et son levier, l'étiquette blanche, le tuyau noir qui fait une boucle au-dessus de la tête
  // puis descend le long du corps jusqu'à la lance clipsée en bas ; 09/10)
  maille(boiteM(0.12, 0.018, 0.035), M.noirMat, 0.03, 1.22, 0, 0, ext).rotation.z = -0.25;
  const etiq = maille(new THREE.CylinderGeometry(0.0915, 0.0915, 0.22, 18, 1, true, -0.7, 1.4), M.boitier, 0, 0.86, 0, Math.PI / 2, ext, { ombre: false });
  void etiq;
  const tuyau = new THREE.CatmullRomCurve3([[0.0, 1.19, 0.02], [-0.05, 1.28, 0.05], [0.07, 1.29, 0.07], [0.13, 1.12, 0.08], [0.125, 0.85, 0.08], [0.085, 0.7, 0.075]].map((p) => new THREE.Vector3(...p)));
  maille(new THREE.TubeGeometry(tuyau, 24, 0.009, 6), M.noirMat, 0, 0, 0, 0, ext, { ombre: false });
  C.ajouterCercle(1.86, -6.9, 0.11, { y0: 0.6, y1: 1.3 });
  ch.panneau(new THREE.MeshStandardMaterial({ map: texPictoExtincteur(), roughness: 0.6 }), 0.16, 0.16, 1.755, 6.9, 1.92, 'E');
  ch.panneau(new THREE.MeshStandardMaterial({ map: texPlaqueRougeBleue(), roughness: 0.5 }), 0.1, 0.1, 1.755, 6.9, 1.53, 'E');
  // l'affiche jaune du tri, à gauche des portes de l'escalier : sur la face est de l'avancée nord du mur OUEST (09/10 :
  // elle était sur le mur des portes, cachée par le vantail ouvert ; photos 04, 20 : on la voit à gauche du vantail, sur
  // le mur en fuite). (Plan V2, photo 06 : son bord gauche à 0,29 m de l'angle de l'avancée, y 7,51 ; la photo rejouée la
  // met de 1,08 à 2,04 — une affiche A1 en hauteur, 0,68 x 0,96 —, sa moitié droite derrière le vantail ouvert rabattu à
  // plat, y 7,955-8,955, comme sur la photo 06.)
  cadreMural(ch, new THREE.MeshStandardMaterial({ map: texTri(), roughness: 0.6 }), 2.45, 7.85, 'E', 0.68, 1.08, 2.04);
  // LES DEUX A4 DU VANTAIL FERMÉ des portes de l'escalier (vantail est, x 3,45-4,45, face hall à y 8,935), l'un au-dessus
  // de l'autre, côté gonds (photos 06, 20 : une fiche de consignes de 1,25 à 1,70, une photo imprimée de 1,75 à 2,0 ; le
  // jeu les mettait côte à côte vers 1,65)
  ch.panneau(new THREE.MeshStandardMaterial({ map: texAffiche('#2f6fb0', '#fbfbf8', 13), roughness: 0.75 }), 0.3, 0.45, 4.1, 8.932, 1.475, 'S');
  ch.panneau(new THREE.MeshStandardMaterial({ map: texAffiche('#9aa6b4', '#eef0f2', 14), roughness: 0.6 }), 0.3, 0.25, 4.1, 8.932, 1.875, 'S');
  // le diffuseur d'alarme blanc, sur la retombée au-dessus de l'entrée du couloir C05, contre l'angle (photos 04 et 05 :
  // un boîtier carré à grille ronde ; relecture du 09/10 ; plan V2 : la retombée du hall au bout du mur safran, qui
  // recule avec la salle d'attente — DY_A, -4,20 : y 11,965 -> 7,765 ; la bande visible va de 2,30 à 2,60)
  const diff = new THREE.Group(); diff.position.set(5.39, 2.45, -7.765); ch.decor.add(diff);
  maille(boiteM(0.12, 0.13, 0.07), M.boitier, 0, 0, 0, 0, diff, { ombre: false });
  maille(new THREE.CylinderGeometry(0.035, 0.035, 0.01, 16), M.grille, 0, -0.005, 0.038, 0, diff, { ombre: false }).rotation.x = Math.PI / 2;
  diff.traverse((m) => { m.userData.horsAOSol = true; });

  // =====================================================================
  //  LE PASSAGE (photos 07, 19)
  // =====================================================================
  // (plan V2, 11/10 : le passage arrêté à la paroi vitrée en y 4,05, son mur est sur la ligne x 4,5 ; les deux lièges du mur
  // est sont vers la rue, y 0,4-1,4 et 1,5-2,6 — photos 07, 10 —, pas contre la paroi)
  const liege = texLiege();
  for (const [y0, y1] of [[0.4, 1.4], [1.5, 2.6]]) {
    const yc = (y0 + y1) / 2, w = y1 - y0;
    cadreMural(ch, M.aluGris, 4.425, yc, 'W', w + 0.04, 0.98, 1.92, 0.02);
    cadreMural(ch, new THREE.MeshStandardMaterial({ map: liege, roughness: 0.9 }), 4.405, yc, 'W', w, 1.0, 1.9, 0.012);
  }
  [[0.75, '#2f6fb0'], [1.95, '#d6542b'], [2.3, '#f08a3c']].forEach(([y, c], i) => ch.panneau(new THREE.MeshStandardMaterial({ map: texAffiche(c, '#fbfbf8', 30 + i), roughness: 0.7 }), 0.3, 0.42, 4.39, y, 1.45 + (i % 2) * 0.15, 'W'));
  // le mur ouest, entre la porte « Sortie » (y 1,15-2,05) et la paroi
  ch.panneau(new THREE.MeshStandardMaterial({ map: texAffiche('#e0e0e0', '#ffffff', 40), roughness: 0.7 }), 0.42, 0.3, 1.756, 3.5, 1.55, 'E');
  ch.panneau(new THREE.MeshStandardMaterial({ map: texAffiche('#2f6fb0', '#ffffff', 41), roughness: 0.7 }), 0.42, 0.6, 1.756, 2.75, 1.5, 'E');
  // le pan plein de la paroi, à gauche de la double porte (le dos de la pile du plan d'évacuation, x 1,75-2,45) : photo
  // 10 rejouée, une affiche de 1,33 à 1,71 et, en bas, une grille de ventilation à lames de 0,45 x 0,7 (relecture du
  // 11/10, photo 10 agrandie : l'« affiche » est un petit tableau sombre où sont épinglées six feuilles blanches, x 1,93-
  // 2,29, et au-dessus, une étiquette blanche)
  ch.panneau(new THREE.MeshStandardMaterial({ map: texTableauFeuilles(), roughness: 0.7 }), 0.37, 0.39, 2.11, 4.046, 1.52, 'S');
  ch.panneau(new THREE.MeshStandardMaterial({ color: 0xf1f0ec, roughness: 0.6 }), 0.13, 0.05, 2.13, 4.046, 1.8, 'S');
  ch.boite(1.82, 4.03, 2.27, 4.048, 0.14, 0.85, M.alu, { ombre: false });
  for (let h = 0.18; h < 0.82; h += 0.05) ch.boite(1.85, 4.025, 2.24, 4.03, h, h + 0.025, M.grille, { ombre: false });
  // L'AFFICHETTE SCOTCHÉE sur le vantail OUEST de la porte automatique, juste au-dessus de son autocollant « iris »
  // (photo 07 côté hall, photo 19 côté passage, en transparence ; relecture du 09/10) : elle part avec le vantail
  const pp = ch.portes.auto.find((P) => P.g.name === 'porte passage');
  const vo = pp && pp.vantaux.find((v) => v.s > 0);
  if (vo) {
    const a = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.2), new THREE.MeshStandardMaterial({ map: texAffiche('#c98f3e', '#efe9df', 60), roughness: 0.75, side: THREE.DoubleSide }));
    a.position.set(0.42, 1.45, -0.004); a.rotation.y = Math.PI; a.castShadow = false; a.userData.vitre = true; vo.g.add(a);
  }

  // (la plaque « Toilettes » du C01, photo 01 — le fauteuil roulant : avec les toilettes PMR, js/ecole_pieces.js ; 09/10)

  // =====================================================================
  //  L'ACCUEIL : le comptoir nord-sud, l'open-space, ses écrans, ses fauteuils et le manteau moutarde (VO 92,5-95,8 s,
  //  photo 03) — js/ecole_hall.js (10/10)
  // =====================================================================
  // l'affiche bleue étroite sur le trumeau entre les fenêtres de l'accueil
  ch.panneau(new THREE.MeshStandardMaterial({ map: texAffiche('#2b4c9b', '#2b4c9b', 50), roughness: 0.6 }), 0.3, 0.9, 18.15, 0.006, 1.55, 'N');
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
function texLiege() {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#b88a55'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 3000; k++) { const v = Math.random(); g.fillStyle = v < 0.5 ? 'rgba(120,80,40,0.35)' : 'rgba(220,180,130,0.3)'; g.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5); }
    const cols = ['#ffffff', '#f2b705', '#2f6fb0', '#e04e3a', '#ffffff', '#3e9b6b', '#f7f7f2'];
    for (let i = 0; i < 9; i++) {
      const x = 8 + (i % 3) * 82 + Math.random() * 10, y = 8 + Math.floor(i / 3) * 82 + Math.random() * 10;
      g.save(); g.translate(x + 35, y + 35); g.rotate((Math.random() - 0.5) * 0.12);
      g.fillStyle = cols[i % cols.length]; g.fillRect(-35, -38, 66, 76);
      g.fillStyle = 'rgba(60,60,60,0.5)'; for (let l = 0; l < 5; l++) g.fillRect(-28, -26 + l * 12, 50, 4);
      g.fillStyle = '#d0262d'; g.beginPath(); g.arc(0, -34, 3, 0, 7); g.fill();
      g.restore();
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
    g.fillStyle = '#244a9a'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffffff'; g.fillRect(6, 5, w - 12, 34); g.fillStyle = '#d32f2f'; g.fillRect(9, 8, w - 18, 28);
    g.fillStyle = '#f2f2f2'; for (let k = 0; k < 3; k++) g.fillRect(9, 44 + k * 6, w - 18 - k * 8, 2);
  }, null, false, 4);
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
