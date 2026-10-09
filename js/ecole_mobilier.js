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

// ---- LES CHAISES COQUE (type Eames DAR) : coque moulée, piètement « tour Eiffel » chromé ----
// Couleurs relevées (photos 02, 21, rééquilibrées sur le blanc des murs) : blanc cassé, bleu canard (un bleu-vert
// grisé, pas un bleu), grège (taupe rosé), vert anis, noir, gris rosé (rose poudré).
const COQUE = { blanc: 0xefebe0, canard: 0x6b9294, grege: 0x8e8580, citron: 0xb8bc28, noir: 0x2e2c2c, rose: 0xc6aca0 };
let _coque = null, _ourlet = null;
// LA COQUE, une surface paramétrée sur un plan presque RECTANGULAIRE (super-ellipse : la coque Eames est plus large que
// profonde, aux angles arrondis). (09/10/2026, refaite d'après les photos 02 et 21 : la première, un bord qui montait
// en pente douce sur toute la moitié extérieure, faisait une soucoupe plate.) Le profil, de l'axe vers le bord : une
// ASSISE presque plate (légèrement creusée), puis un large CONGÉ qui redresse la paroi presque à la verticale (72°) —
// un baquet. La hauteur de la paroi suit le tour : le bord avant RETOMBE sous les genoux (-3 cm, la « cascade »), les
// accoudoirs montent à 18 cm au-dessus de l'assise, le dossier à 38 cm, renversé vers l'arrière.
function geoCoque() {
  if (_coque) return _coque;
  const NA = 56, NS = 8, NC = 12, A = 0.31, P = 0.27, Y = 0.43, n = 3.2, T0 = 0.5, K = 0.8;
  const pos = [], idx = [], ourlet = [];
  const lisse = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const NR = NS + NC;
  for (let j = 0; j <= NR; j++) {
    // ρ : la fraction du rayon ; η : la part de la paroi déjà montée (0 sur l'assise, 1 au bord). Le congé est un arc de
    // 72° (K = 0,8 du quart de cercle) : la paroi finit raide mais pas verticale — la coque s'évase un peu vers le haut.
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
      const bord = -0.03 + 0.21 * lisse(0.1, 0.5, dos) + 0.2 * lisse(0.55, 1, dos);
      const creux = -0.022 * (1 - rho * rho);
      const h = bord * eta;
      const p = [s * A * r * rho, Y + creux + h, c * P * r * rho - 0.22 * Math.max(0, h) * dos * dos];
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
  // L'OURLET : le bord roulé de la coque (6 mm), qui accroche la lumière et donne l'épaisseur de la fibre
  ourlet.pop();
  _ourlet = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ourlet, true), NA * 2, 0.006, 6, true);
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
  if (!_matsCoque.has(couleur)) _matsCoque.set(couleur, new THREE.MeshStandardMaterial({ color: couleur, roughness: 0.32, side: THREE.DoubleSide }));
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
  for (const [px, pz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const p = maille(new THREE.CylinderGeometry(0.008, 0.008, 0.44, 6), M.inox, px * 0.17, 0.21, pz * 0.15, 0, g, { ombre: false });
    p.rotation.z = -px * 0.2; p.rotation.x = pz * 0.2;
    maille(new THREE.CylinderGeometry(0.0075, 0.0085, 0.01, 8), M.patin || (M.patin = new THREE.MeshStandardMaterial({ color: 0x45433f, roughness: 0.6 })), px * 0.215, 0.005, pz * 0.195, 0, g, { ombre: false });
  }
  for (const s of [-1, 1]) {
    const e = maille(new THREE.CylinderGeometry(0.006, 0.006, 0.5, 5), M.inox, 0, 0.2, 0, 0, g, { ombre: false });
    e.rotation.z = Math.PI / 2; e.rotation.y = s * 0.72;
  }
  maille(boiteM(0.22, 0.012, 0.2), M.inox, 0, 0.37, -0.01, 0, g, { ombre: false });
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
  //  LA SALLE D'ATTENTE (photos 02, 21)
  // =====================================================================
  // la rangée nord, dos au mur safran, tournée vers le sud ; la rangée sud sous les jours dépolis, tournée vers le nord
  [[6.5, 'blanc'], [7.2, 'canard'], [7.9, 'grege'], [8.6, 'citron'], [9.3, 'blanc']].forEach(([x, c]) => chaise(ch, x, 11.55, 'S', COQUE[c]));
  [[6.3, 'noir'], [7.0, 'rose'], [7.7, 'canard']].forEach(([x, c]) => chaise(ch, x, 9.45, 'N', COQUE[c]));
  C.ajouterBoite(6.15, -11.9, 9.65, -11.2, { y1: 0.8 });
  C.ajouterBoite(5.95, -9.8, 8.05, -9.1, { y1: 0.8 });
  // l'écran de 65 pouces (x 6,5-7,95, h 1,55-2,40) et l'affiche blanche aux graphismes vert pâle (x 8,4-9,4)
  ch.boite(6.5, 11.94, 7.95, 12.0, 1.55, 2.4, M.noir);
  ch.panneau(new THREE.MeshBasicMaterial({ map: texEcran(), color: new THREE.Color(1.25, 1.25, 1.25) }), 1.39, 0.79, 7.225, 11.935, 1.975, 'S');
  ch.panneau(new THREE.MeshStandardMaterial({ map: texAffiche('#cfe8d2', '#fbfbf8', 3), roughness: 0.7 }), 1.0, 1.5, 8.9, 11.994, 1.8, 'S');
  ch.panneau(new THREE.MeshStandardMaterial({ map: texAffiche('#ffffff', '#f5f5f0', 4), roughness: 0.7 }), 0.15, 0.21, 7.0, 11.994, 1.4, 'S');
  // la borne numérique noire (x 9,45), son écran en mosaïque de photos, tournée vers l'ouest-nord-ouest : on la voit de
  // face depuis le bout ouest de la salle (photo 21 ; 09/10 : elle était tournée vers le nord-est, vue de chant)
  // (et poussée contre le bout du mur de la salle A, x 9,45 -> 9,7 : sur la photo, son pied touche presque l'angle)
  const borne = new THREE.Group(); borne.position.set(9.7, 0, -9.42); borne.rotation.y = -Math.PI * 0.62; ch.decor.add(borne);
  maille(boiteM(0.6, 0.02, 0.5), M.noir, 0, 0.01, 0, 0, borne);
  maille(boiteM(0.6, 1.95, 0.08), M.noir, 0, 0.995, 0, 0, borne);
  const mos = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 1.6), new THREE.MeshBasicMaterial({ map: texMosaique(), color: new THREE.Color(1.1, 1.1, 1.1) }));
  mos.position.set(0, 1.05, 0.041); borne.add(mos);
  C.ajouterBoite(9.35, -9.78, 10.05, -9.08, { y1: 2 });
  // le présentoir à brochures noir contre le mur du fond (x 13,3, y 11,3), tourné vers l'ouest
  const pres = new THREE.Group(); pres.position.set(13.28, 0, -11.3); pres.rotation.y = -Math.PI / 2; ch.decor.add(pres);
  for (const sx of [-0.39, 0.39]) maille(boiteM(0.02, 1.55, 0.35), M.noir, sx, 0.8, 0, 0, pres);
  const br = texBrochures();
  for (let i = 0; i < 5; i++) {
    const t = maille(boiteM(0.76, 0.02, 0.28), M.noir, 0, 0.32 + i * 0.27, 0.02, 0, pres); t.rotation.x = -0.35;
    const b = new THREE.Mesh(new THREE.PlaneGeometry(0.74, 0.24), new THREE.MeshStandardMaterial({ map: br, roughness: 0.6 }));
    b.position.set(0, 0.42 + i * 0.27, 0.05); b.rotation.x = -0.3; pres.add(b);
  }
  C.ajouterBoite(12.9, -11.72, 13.5, -10.88, { y1: 1.6 });
  // le kakémono noir à l'entrée du couloir C01, les affichettes du mur du fond (WIFI, photo)
  // (contre le mur est, à l'entrée du C01, tourné vers l'ouest : photo 21)
  ch.boite(13.38, 12.15, 13.42, 12.95, 0, 2.0, M.noir);
  ch.boite(13.3, 12.2, 13.48, 12.9, 0, 0.06, M.aluGris);
  // (photo 22 : c'est le panneau des formations — « Initial ou alternance », les bandeaux orange Bac pro, BTS, Bac+3, Bac+5)
  ch.panneau(new THREE.MeshStandardMaterial({ map: texFormations(), roughness: 0.6 }), 0.78, 1.9, 13.377, 12.55, 1.02, 'W');
  C.ajouterBoite(13.28, -12.95, 13.5, -12.15, { y1: 2 });
  // (09/10 : les affichettes du fond suivent le radiateur, juste à gauche du pilier sur la photo 21 ; y 9,55 -> 10,05)
  const wifi = new THREE.MeshStandardMaterial({ map: texWifi(), roughness: 0.45 });
  ch.panneau(wifi, 0.2, 0.17, 13.494, 10.05, 1.5, 'W');
  ch.panneau(new THREE.MeshStandardMaterial({ map: texAffiche('#c7783a', '#f4ead9', 8), roughness: 0.6 }), 0.24, 0.17, 13.494, 10.05, 1.75, 'W');
  // ... et les mêmes au bout du mur, près de l'angle du hall, sous le haut-parleur (photo 03)
  ch.panneau(wifi, 0.2, 0.17, 13.494, 7.95, 1.45, 'W');
  ch.panneau(new THREE.MeshStandardMaterial({ map: texAffiche('#c7783a', '#f4ead9', 12), roughness: 0.6 }), 0.26, 0.19, 13.494, 7.95, 1.72, 'W');
  const hp = new THREE.Group(); hp.position.set(13.44, 2.32, -7.97); ch.decor.add(hp);
  maille(boiteM(0.1, 0.17, 0.13), M.boitier, 0, 0, 0, 0, hp, { ombre: false });
  maille(new THREE.CylinderGeometry(0.035, 0.035, 0.01, 16), M.grille, -0.051, 0.01, 0, 0, hp, { ombre: false }).rotation.z = Math.PI / 2;
  // les affiches du pilier (il est maintenant planté dans la salle, y 9,75-10,35) : sur la face ouest, l'A3 blanche aux
  // dessins de couleur et le tract orange dessous ; sur la face nord, une feuille étroite (photo 21)
  ch.panneau(new THREE.MeshStandardMaterial({ map: texAffiche('#e8eef8', '#ffffff', 9), roughness: 0.7 }), 0.42, 0.6, 10.294, 10.05, 1.72, 'W');
  ch.panneau(new THREE.MeshStandardMaterial({ map: texAffiche('#f08a3c', '#ffffff', 10), roughness: 0.7 }), 0.3, 0.42, 10.294, 10.05, 1.2, 'W');
  ch.panneau(new THREE.MeshStandardMaterial({ map: texAffiche('#3e9b6b', '#ffffff', 11), roughness: 0.7 }), 0.21, 0.42, 10.45, 10.356, 1.55, 'N');
  // LA FACE SUD DU PILIER, celle qu'on voit en arrivant par le cou (photo 22, l'ancienne photo du hall) : la plaque
  // « iris » de l'Institut et l'annuaire des salles en dessous, et l'horloge à diodes rouges au-dessus — elle donne
  // l'heure et le jour de l'ordinateur du joueur
  cadreMural(ch, new THREE.MeshStandardMaterial({ map: texPlaqueIris(), roughness: 0.45 }), 10.6, 9.75, 'S', 0.46, 1.02, 1.94, 0.012);
  ch.boite(10.39, 9.69, 10.81, 9.75, 2.1, 2.34, M.noir);
  ch.panneau(matHorloge(), 0.4, 0.2, 10.6, 9.6895, 2.22, 'S');
  // les affiches scotchées sur les jours dépolis
  [[6.3, 1.7, '#e07b2a'], [6.95, 1.85, '#2f6fb0'], [8.0, 1.75, '#3e9b6b'], [8.65, 1.9, '#7b2a6e']].forEach(([x, h, c], i) =>
    ch.panneau(new THREE.MeshStandardMaterial({ map: texAffiche(c, '#fbfbf8', 20 + i), roughness: 0.7 }), 0.21, 0.297, x, 9.088, h, 'N'));

  // =====================================================================
  //  LE HALL OUEST (photo 06)
  // =====================================================================
  // (sur l'avancée sud du mur ouest, x 2,0 : js/carte_ecole.js ; 09/10)
  cadreMural(ch, new THREE.MeshStandardMaterial({ map: texConsignes(), roughness: 0.5 }), 2.0, 8.45, 'E', 0.45, 1.3, 1.92);
  // l'extincteur rouge sur sa console (h 0,95-1,55) et ses pictogrammes (relecture du 09/10 : à 0,9 m de la porte grise,
  // au fond du renfoncement raccourci — photos 02 et 06 ; y 11,2 -> 10,95)
  const ext = new THREE.Group(); ext.position.set(1.86, 0, -10.95); ch.decor.add(ext);
  maille(new THREE.CylinderGeometry(0.075, 0.075, 0.48, 16), M.rougeEtiquette, 0, 1.2, 0, 0, ext);
  maille(new THREE.SphereGeometry(0.075, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), M.rougeEtiquette, 0, 1.44, 0, 0, ext);
  maille(new THREE.CylinderGeometry(0.03, 0.045, 0.08, 10), M.noirMat, 0, 1.5, 0, 0, ext);
  maille(boiteM(0.04, 0.06, 0.06), M.noirMat, -0.08, 1.35, 0, 0, ext);
  // (photo 06 : la poignée noire et son levier, l'étiquette blanche, le tuyau noir qui fait une boucle le long du corps
  // jusqu'à la lance clipsée en bas ; 09/10)
  maille(boiteM(0.12, 0.018, 0.035), M.noirMat, 0.03, 1.56, 0, 0, ext).rotation.z = -0.25;
  const etiq = maille(new THREE.CylinderGeometry(0.0765, 0.0765, 0.2, 16, 1, true, -0.7, 1.4), M.boitier, 0, 1.18, 0, Math.PI / 2, ext, { ombre: false });
  void etiq;
  const tuyau = new THREE.CatmullRomCurve3([[0.03, 1.5, 0.02], [0.11, 1.45, 0.05], [0.12, 1.2, 0.07], [0.1, 1.0, 0.06], [0.06, 0.97, 0.06]].map((p) => new THREE.Vector3(...p)));
  maille(new THREE.TubeGeometry(tuyau, 24, 0.009, 6), M.noirMat, 0, 0, 0, 0, ext, { ombre: false });
  C.ajouterCercle(1.86, -10.95, 0.09, { y0: 0.9, y1: 1.6 });
  ch.panneau(new THREE.MeshStandardMaterial({ map: texPictoExtincteur(), roughness: 0.6 }), 0.16, 0.16, 1.755, 10.95, 1.9, 'E');
  // l'affiche jaune du tri, à gauche des portes de l'escalier : sur l'avancée nord du mur OUEST, dans l'angle (09/10 :
  // elle était sur le mur des portes, cachée par le vantail ouvert ; photos 04, 20 : on la voit à gauche du vantail, sur
  // le mur en fuite). (Relecture du 09/10 : l'avancée, plus longue, avance jusqu'à x 2,35 ; l'affiche est à 45 cm de
  // son angle sud, juste à gauche du vantail ouvert sur les photos 06 et 04 — à y 13,17, le vantail la cachait encore.)
  cadreMural(ch, new THREE.MeshStandardMaterial({ map: texTri(), roughness: 0.6 }), 2.35, 12.1, 'E', 0.6, 1.1, 1.95);
  // le diffuseur d'alarme blanc, sur la retombée au-dessus de l'entrée du couloir C05, contre l'angle (photos 04 et 05 :
  // un boîtier carré à grille ronde ; relecture du 09/10)
  const diff = new THREE.Group(); diff.position.set(5.39, 2.49, -11.965); ch.decor.add(diff);
  maille(boiteM(0.12, 0.13, 0.07), M.boitier, 0, 0, 0, 0, diff, { ombre: false });
  maille(new THREE.CylinderGeometry(0.035, 0.035, 0.01, 16), M.grille, 0, -0.005, 0.038, 0, diff, { ombre: false }).rotation.x = Math.PI / 2;
  diff.traverse((m) => { m.userData.horsAOSol = true; });

  // =====================================================================
  //  LE PASSAGE (photos 07, 19)
  // =====================================================================
  const liege = texLiege();
  for (const [y0, y1] of [[2.3, 3.3], [3.4, 4.6]]) {
    const yc = (y0 + y1) / 2, w = y1 - y0;
    cadreMural(ch, M.aluGris, 4.75, yc, 'W', w + 0.04, 0.98, 1.92, 0.02);
    cadreMural(ch, new THREE.MeshStandardMaterial({ map: liege, roughness: 0.9 }), 4.73, yc, 'W', w, 1.0, 1.9, 0.012);
  }
  ['#2f6fb0', '#d6542b', '#f08a3c'].forEach((c, i) => ch.panneau(new THREE.MeshStandardMaterial({ map: texAffiche(c, '#fbfbf8', 30 + i), roughness: 0.7 }), 0.3, 0.42, 4.715, 2.55 + i * 0.6, 1.45 + (i % 2) * 0.15, 'W'));
  ch.panneau(new THREE.MeshStandardMaterial({ map: texAffiche('#e0e0e0', '#ffffff', 40), roughness: 0.7 }), 0.42, 0.3, 1.756, 4.75, 1.55, 'E');
  ch.panneau(new THREE.MeshStandardMaterial({ map: texAffiche('#2f6fb0', '#ffffff', 41), roughness: 0.7 }), 0.42, 0.6, 1.756, 3.2, 1.5, 'E');
  // L'AFFICHETTE SCOTCHÉE sur le vantail OUEST de la porte automatique, juste au-dessus de son autocollant « iris »
  // (photo 07 côté hall, photo 19 côté passage, en transparence ; relecture du 09/10) : elle part avec le vantail
  const pp = ch.portes.auto.find((P) => Math.abs(P.cx - 3.2) < 0.01 && Math.abs(P.cz + 5.0) < 0.01);
  const vo = pp && pp.vantaux.find((v) => v.s > 0);
  if (vo) {
    const a = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.2), new THREE.MeshStandardMaterial({ map: texAffiche('#c98f3e', '#efe9df', 60), roughness: 0.75, side: THREE.DoubleSide }));
    a.position.set(0.38, 1.45, -0.004); a.rotation.y = Math.PI; a.castShadow = false; a.userData.vitre = true; vo.g.add(a);
  }

  // =====================================================================
  //  LE COULOIR C01 (photo 01) : la plaque « Toilettes »
  // =====================================================================
  ch.panneau(new THREE.MeshStandardMaterial({ map: texToilettes(), roughness: 0.4 }), 0.15, 0.2, 11.706, 18.3, 1.6, 'E');

  // =====================================================================
  //  L'ACCUEIL (photo 03) : deux écrans, un téléphone, des papiers, deux fauteuils noirs
  // =====================================================================
  for (const x of [17.0, 18.6]) {
    const e = new THREE.Group(); e.position.set(x, 0.75, -1.25); e.rotation.y = Math.PI; ch.decor.add(e);
    maille(boiteM(0.55, 0.34, 0.03), M.noir, 0, 0.32, 0, 0, e);
    maille(boiteM(0.06, 0.15, 0.04), M.noir, 0, 0.08, 0.02, 0, e);
    maille(boiteM(0.2, 0.01, 0.15), M.noir, 0, 0.005, 0.02, 0, e);
  }
  ch.boite(17.6, 1.2, 17.9, 1.4, 0.75, 0.78, M.store);
  for (const x of [17.0, 18.6]) {
    const f = new THREE.Group(); f.position.set(x, 0, -0.7); ch.decor.add(f);
    maille(boiteM(0.48, 0.08, 0.46), M.noir, 0, 0.48, 0, 0, f);
    maille(boiteM(0.46, 0.55, 0.06), M.noir, 0, 0.82, 0.22, 0, f);
    maille(new THREE.CylinderGeometry(0.025, 0.025, 0.4, 8), M.inox, 0, 0.25, 0, 0, f);
    maille(boiteM(0.6, 0.03, 0.06), M.noir, 0, 0.04, 0, 0, f);
    maille(boiteM(0.06, 0.03, 0.6), M.noir, 0, 0.04, 0, 0, f);
  }
  ch.boite(18.36, 0.42, 18.84, 0.48, 0.52, 1.1, new THREE.MeshStandardMaterial({ color: 0xc9a227, roughness: 0.9 }));   // le manteau moutarde
  // l'affiche bleue étroite sur le trumeau entre les fenêtres de l'accueil
  ch.panneau(new THREE.MeshStandardMaterial({ map: texAffiche('#2b4c9b', '#2b4c9b', 50), roughness: 0.6 }), 0.3, 0.9, 18.15, 0.006, 1.55, 'N');
  // LE TOTEM NOIR « 1ère école pour le BTS SIO en France » (photo 22 : il était dans la salle d'attente, à la place de
  // la borne d'aujourd'hui) : contre le mur nord du hall, face à la porte 6 — on le voit en entrant. (09/10 : poussé dans
  // l'angle nord-ouest du hall, x 13,65-14,45 — la porte du couloir est s'ouvre maintenant en x 14,70-16,10, photo 24)
  const totem = new THREE.Group(); totem.position.set(14.05, 0, -7.4); ch.decor.add(totem);
  maille(boiteM(0.86, 0.03, 0.26), M.aluGris, 0, 0.015, 0, 0, totem);
  maille(boiteM(0.8, 2.0, 0.04), M.noir, 0, 1.03, 0, 0, totem);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 1.96), new THREE.MeshStandardMaterial({ map: texTotemBTS(), roughness: 0.5 }));
  face.position.set(0, 1.03, 0.021); face.receiveShadow = true; totem.add(face);
  C.ajouterBoite(13.6, -7.55, 14.5, -7.25, { y1: 2.05 });
}

// ---- les petites textures du mobilier ----
// L'ÉCRAN DE LA BORNE (photo 21) : une mosaïque de PHOTOS d'étudiants — des vignettes à dominante bleue et grise, des
// visages, quelques touches chaudes —, pas des aplats de couleurs vives (09/10). Chaque vignette : un ciel ou un mur en
// dégradé, une silhouette sombre, un visage clair.
function texMosaique() {
  return canvasTex(256, 744, (g, w, h) => {
    g.fillStyle = '#0d0f12'; g.fillRect(0, 0, w, h);
    const fonds = [['#7f9fc4', '#3d5878'], ['#a9b7c8', '#59677a'], ['#6b84a6', '#27364f'], ['#c9b49a', '#6d5a48'], ['#8fb0c9', '#4a6a86'], ['#b0a8a0', '#4c4744']];
    let k = 0;
    for (let y = 6; y < h - 6; y += 92) for (let x = 6; x < w - 6; x += 124) {
      const f = fonds[(k * 5 + (k >> 1)) % fonds.length], d = g.createLinearGradient(0, y, 0, y + 86);
      d.addColorStop(0, f[0]); d.addColorStop(1, f[1]); g.fillStyle = d; g.fillRect(x, y, 118, 86);
      const cx = x + 30 + ((k * 37) % 60), r = 11 + (k % 3) * 3;
      g.fillStyle = ['#1d2430', '#3a2c2a', '#2b3b55', '#e7e2da'][k % 4]; g.beginPath(); g.ellipse(cx, y + 86, r * 2.1, r * 2.4, 0, Math.PI, 0); g.fill();
      g.fillStyle = ['#d8ae90', '#a87458', '#e3c2a6', '#8a5a42'][(k + 1) % 4]; g.beginPath(); g.arc(cx, y + 86 - r * 2.6, r, 0, 7); g.fill();
      g.fillStyle = '#20180f'; g.beginPath(); g.arc(cx, y + 86 - r * 2.9, r * 1.02, Math.PI, 0); g.fill();
      k++;
    }
  }, null, false, 4);
}
// LES BROCHURES du présentoir (photos 01, 21) : des couvertures de magazine — fond blanc ou clair, une grande photo aux
// tons doux, un bandeau de titre de couleur — et non des tranches de couleurs vives (09/10)
function texBrochures() {
  return canvasTex(512, 168, (g, w, h) => {
    g.fillStyle = '#111'; g.fillRect(0, 0, w, h);
    const fonds = ['#f4f2ee', '#eceae4', '#f6f4f0', '#dfe4ea', '#f2efe8'];
    const photos = [['#8aa0b8', '#4e5f73'], ['#c8a07a', '#6e4e38'], ['#9fb39a', '#4f6650'], ['#b9b4c8', '#5d566e'], ['#d6c2a8', '#7d6650'], ['#7f95a8', '#3a4a5c']];
    const titres = ['#e04e3a', '#2f6fb0', '#f2b705', '#7b2a6e', '#3e9b6b', '#f08a3c', '#222222'];
    for (let i = 0; i < 9; i++) {
      const x = 6 + i * 56, y = 10, cw = 50, chh = h - 20;
      g.fillStyle = fonds[i % fonds.length]; g.fillRect(x, y, cw, chh);
      const p = photos[(i * 4 + 1) % photos.length], d = g.createLinearGradient(0, y + 18, 0, y + chh - 16);
      d.addColorStop(0, p[0]); d.addColorStop(1, p[1]); g.fillStyle = d; g.fillRect(x + 3, y + 18, cw - 6, chh - 38);
      g.fillStyle = 'rgba(240,226,210,0.8)'; g.beginPath(); g.arc(x + cw * 0.55, y + 50, 7, 0, 7); g.fill();
      g.fillStyle = titres[(i * 3) % titres.length]; g.fillRect(x + 3, y + 4, cw - 6, 10);
      g.fillStyle = 'rgba(40,40,40,0.55)'; g.fillRect(x + 4, y + chh - 14, cw * 0.7, 3); g.fillRect(x + 4, y + chh - 8, cw * 0.5, 3);
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
function texWifi() {
  return canvasTex(160, 136, (g, w, h) => {
    g.fillStyle = '#121212'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#f2f2f2'; g.font = '700 15px "Segoe UI", Arial, sans-serif'; g.fillText('WIFI IRIS', 12, 30);
    g.font = '500 9px "Segoe UI", Arial, sans-serif'; g.fillText('réseau : iris-etudiants', 12, 62); g.fillText('scanne le code', 12, 78);
    g.fillStyle = '#f2f2f2'; g.fillRect(98, 48, 50, 50); g.fillStyle = '#121212';
    for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) if ((i * 7 + j * 3 + i * j) % 3 === 0) g.fillRect(101 + i * 6.5, 51 + j * 6.5, 6, 6);
  }, null, false, 4);
}
function texToilettes() {
  return canvasTex(96, 128, (g, w, h) => {
    g.fillStyle = '#1a1a1a'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#f2f2f2';
    g.beginPath(); g.arc(30, 30, 7, 0, 7); g.fill(); g.fillRect(24, 40, 12, 30);
    g.beginPath(); g.arc(64, 30, 7, 0, 7); g.fill(); g.beginPath(); g.moveTo(64, 40); g.lineTo(74, 70); g.lineTo(54, 70); g.fill();
    g.strokeStyle = '#f2f2f2'; g.lineWidth = 4; g.beginPath(); g.arc(48, 92, 10, 0, 7); g.stroke();
    g.font = '600 13px "Segoe UI", sans-serif'; g.fillText('Toilettes', 18, 120);
  }, null, false, 2);
}

// ---- LA SIGNALÉTIQUE DE L'ÉCOLE (photo 22) ----
// le logo « iris » : le mot en blanc, la coche orange sur le point du premier i ; (x, y) = le milieu de sa ligne de base
function logoIris(g, x, y, taille, couleur = '#ffffff') {
  g.font = `600 ${taille}px "Century Gothic", "Avenir", "Futura", "Segoe UI", sans-serif`;
  g.textBaseline = 'alphabetic'; g.textAlign = 'left';
  const w = g.measureText('iris').width, wi = g.measureText('i').width, x0 = x - w / 2;
  g.fillStyle = couleur; g.fillText('iris', x0, y);
  g.fillStyle = '#f08a24'; g.fillRect(x0 + wi * 0.12, y - taille * 0.8, wi * 0.76, taille * 0.15);
}
// un QR code figuré (blanc, modules noirs, les trois repères)
function qrFigure(g, x, y, c) {
  g.fillStyle = '#f4f4f4'; g.fillRect(x, y, c, c);
  const m = c / 25; g.fillStyle = '#111';
  for (let i = 1; i < 24; i++) for (let j = 1; j < 24; j++) if (((i * 13 + j * 7 + i * j * 3) % 5) < 2) g.fillRect(x + i * m, y + j * m, m, m);
  for (const [a, b] of [[1, 1], [17, 1], [1, 17]]) {
    g.fillStyle = '#111'; g.fillRect(x + a * m, y + b * m, 7 * m, 7 * m);
    g.fillStyle = '#f4f4f4'; g.fillRect(x + (a + 1) * m, y + (b + 1) * m, 5 * m, 5 * m);
    g.fillStyle = '#111'; g.fillRect(x + (a + 2) * m, y + (b + 2) * m, 3 * m, 3 * m);
  }
}
// LA PLAQUE DU PILIER : en haut, sur blanc, le logo dans son pavé noir et « Institut supérieur de ressources
// informatiques » ; en bas, sur noir, l'annuaire (la salle en blanc, le niveau en orange à droite)
function texPlaqueIris() {
  return canvasTex(384, 768, (g, w, h) => {
    g.fillStyle = '#f7f7f4'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#161616'; g.fillRect(84, 44, 216, 128);
    logoIris(g, w / 2, 140, 86);
    g.fillStyle = '#3c3c3c'; g.font = '600 21px "Segoe UI", Arial, sans-serif'; g.textAlign = 'center';
    ['INSTITUT SUPÉRIEUR', 'DE RESSOURCES', 'INFORMATIQUES'].forEach((t, i) => g.fillText(t, w / 2, 222 + i * 28));
    g.fillStyle = '#161616'; g.fillRect(0, 372, w, h - 372);
    const salles = [['Accueil - Réception', 'RDC'], ['Salle Tim Berners-Lee', 'B 1'], ['Salle David Clark', 'B 2'], ['Pause extérieure', 'RDC'],
      ['Nos niveaux 1/2/3/4/5', '▲'], ['Nos niveaux -1/-2', '▼'], ['Direction des Études', '1']];
    salles.forEach(([s, n], i) => {
      const y = 418 + i * 48;
      g.textAlign = 'left'; g.fillStyle = '#f2f2f2'; g.font = '500 20px "Segoe UI", Arial, sans-serif'; g.fillText(s, 22, y);
      g.textAlign = 'right'; g.fillStyle = '#f08a24'; g.font = '700 20px "Segoe UI", Arial, sans-serif'; g.fillText(n, w - 22, y);
      g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(22, y + 16, w - 44, 1.5);
    });
    g.textAlign = 'left';
  }, null, false, 8);
}
// L'HORLOGE À DIODES ROUGES : l'heure en grand, le jour et la date dessous (« VEN 09 »), sur fond noir ; les segments
// éteints se devinent. Elle suit l'horloge de l'ordinateur (redessinée toutes les 10 s).
function matHorloge() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128;
  const g = c.getContext('2d'), t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  const JOURS = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];
  const dessiner = () => {
    const d = new Date(), p2 = (n) => String(n).padStart(2, '0');
    g.fillStyle = '#0a0a0a'; g.fillRect(0, 0, 256, 128);
    g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    g.font = '700 66px "Consolas", "Lucida Console", "Courier New", monospace';
    g.fillStyle = 'rgba(255,40,20,0.1)'; g.fillText('88:88', 128, 66);
    g.shadowColor = '#ff2a14'; g.shadowBlur = 10; g.fillStyle = '#ff3a22';
    g.fillText(`${p2(d.getHours())}:${p2(d.getMinutes())}`, 128, 66);
    g.shadowBlur = 0; g.font = '700 34px "Consolas", "Lucida Console", "Courier New", monospace';
    g.fillStyle = 'rgba(255,40,20,0.1)'; g.fillText('888 88', 128, 112);
    g.shadowBlur = 8; g.fillStyle = '#ff3a22'; g.fillText(`${JOURS[d.getDay()]} ${p2(d.getDate())}`, 128, 112);
    g.shadowBlur = 0;
    t.needsUpdate = true;
  };
  dessiner(); setInterval(dessiner, 10000);
  return new THREE.MeshBasicMaterial({ map: t, color: new THREE.Color(1.6, 1.6, 1.6) });
}
// LE PANNEAU DES FORMATIONS (kakémono noir, photo 22) : le logo, « Initial ou alternance », puis les quatre bandeaux
// orange (du plus clair au plus soutenu) et leurs formations, l'adresse du site et le QR code au pied
function texFormations() {
  return canvasTex(320, 780, (g, w, h) => {
    g.fillStyle = '#151515'; g.fillRect(0, 0, w, h);
    logoIris(g, w / 2, 92, 72);
    g.fillStyle = '#f2f2f2'; g.font = '600 17px "Segoe UI", Arial, sans-serif'; g.textAlign = 'center';
    g.fillText('INITIAL OU ALTERNANCE', w / 2, 140);
    const blocs = [['BAC PRO', '#f7a541', ['BAC pro SEN']], ['BTS', '#f39325', ['BTS SIO', 'BTS SN']],
      ['BAC+3', '#ee7d11', ['DEESIRS', 'DEESINF', 'DEESWEB', 'Traffic Manager', 'Développeur', "  d'applications mobiles"]],
      ['BAC+5', '#e46510', ['Master européen', '  en informatique', 'Master européen', '  en e-communication']]];
    let y = 160;
    g.textAlign = 'left';
    for (const [titre, teinte, lignes] of blocs) {
      g.fillStyle = teinte; g.fillRect(16, y, w - 32, 34);
      g.fillStyle = '#ffffff'; g.font = '800 23px "Segoe UI", Arial, sans-serif'; g.fillText(titre, 28, y + 26);
      y += 56;
      g.font = '500 16px "Segoe UI", Arial, sans-serif'; g.fillStyle = '#e8e8e8';
      for (const l of lignes) { const suite = l.startsWith('  '); g.fillText(suite ? l.trim() : '• ' + l, suite ? 44 : 28, y); y += 21; }
      y += 6;
    }
    g.fillStyle = '#d8d8d8'; g.font = '600 16px "Segoe UI", Arial, sans-serif'; g.fillText('www.ecoleiris.fr', 24, h - 34);
    qrFigure(g, w - 92, h - 96, 72);
  }, null, false, 8);
}
// LE TOTEM « 1ère école pour le BTS SIO en France » (photo 22) : noir, le logo en haut, l'accroche en grandes capitales,
// « Bac à Bac+5 » en orange, le site et le QR code au pied
function texTotemBTS() {
  return canvasTex(320, 800, (g, w, h) => {
    const d = g.createLinearGradient(0, 0, 0, h); d.addColorStop(0, '#1b1b1b'); d.addColorStop(1, '#0f0f0f');
    g.fillStyle = d; g.fillRect(0, 0, w, h);
    logoIris(g, w / 2, 128, 96);
    g.textAlign = 'center'; g.fillStyle = '#9a9a9a'; g.font = '600 12px "Segoe UI", Arial, sans-serif';
    g.fillText('INSTITUT SUPÉRIEUR DE RESSOURCES INFORMATIQUES', w / 2, 162);
    // « 1ère ÉCOLE » : le « ère » en exposant, la ligne mesurée puis centrée
    g.fillStyle = '#ffffff'; g.textAlign = 'left';
    const grand = '800 40px "Segoe UI", Arial, sans-serif', petit = '800 20px "Segoe UI", Arial, sans-serif';
    g.font = grand; const w1 = g.measureText('1').width, wE = g.measureText(' ÉCOLE').width;
    g.font = petit; const wr = g.measureText('ère').width;
    let x = (w - (w1 + wr + wE)) / 2;
    g.font = grand; g.fillText('1', x, 290); x += w1;
    g.font = petit; g.fillText('ère', x + 1, 270); x += wr + 1;
    g.font = grand; g.fillText(' ÉCOLE', x, 290);
    g.textAlign = 'center';
    g.font = '700 27px "Segoe UI", Arial, sans-serif';
    g.fillText('POUR LE BTS SIO', w / 2, 330); g.fillText('EN FRANCE', w / 2, 364);
    g.fillStyle = '#f08a24'; g.fillRect(w / 2 - 40, 392, 80, 4);
    g.fillStyle = '#f2f2f2'; g.font = '600 22px "Segoe UI", Arial, sans-serif';
    ['ÉCOLE', "DE L'INFORMATIQUE", 'ET DU NUMÉRIQUE'].forEach((t, i) => g.fillText(t, w / 2, 444 + i * 30));
    g.fillStyle = '#f08a24'; g.font = '800 30px "Segoe UI", Arial, sans-serif'; g.fillText('BAC À BAC+5', w / 2, 574);
    g.fillStyle = '#d8d8d8'; g.font = '600 17px "Segoe UI", Arial, sans-serif'; g.fillText('www.ecoleiris.fr', w / 2 - 36, h - 40);
    qrFigure(g, w - 88, h - 92, 66);
    g.textAlign = 'left';
  }, null, false, 8);
}
