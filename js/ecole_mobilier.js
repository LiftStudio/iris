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
// Couleurs relevées (photos 02, 21) : blanc, bleu canard, grège, citron vert, noir, rose poudré.
const COQUE = { blanc: 0xefebe0, canard: 0x5a7f8c, grege: 0x8e8580, citron: 0xbdba1e, noir: 0x2e2c2c, rose: 0xc9afa0 };
let _coque = null;
// LA COQUE, une surface paramétrée sur un plan presque RECTANGULAIRE (super-ellipse : la coque Eames est plus large que
// profonde, aux angles arrondis) : une assise à peine creusée, puis un bord qui REMONTE près du pourtour — à peine
// devant (le bord qui retombe sous les genoux), en accoudoirs sur les côtés (18 cm), en dossier derrière (38 cm, raide
// et un peu renversé).
function geoCoque() {
  if (_coque) return _coque;
  const NA = 48, NR = 14, A = 0.31, P = 0.27, Y = 0.43, n = 3.2;
  const pos = [], idx = [];
  const lisse = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  for (let j = 0; j <= NR; j++) {
    const t = j / NR, mont = Math.pow(lisse(0.5, 1, t), 1.15);
    for (let i = 0; i <= NA; i++) {
      const phi = i / NA * Math.PI * 2, s = Math.sin(phi), c = Math.cos(phi);
      const r = 1 / Math.pow(Math.pow(Math.abs(s), n) + Math.pow(Math.abs(c), n), 1 / n);
      const dos = (1 - c) / 2;                                       // 0 devant, 1 derrière
      const bord = 0.035 + 0.15 * lisse(0.12, 0.55, dos) + 0.2 * lisse(0.6, 1, dos);
      const creux = -0.02 * (1 - t * t);
      const devant = c > 0 ? -0.045 * Math.pow(c, 4) * lisse(0.8, 1, t) : 0;
      const k = t * (1 + 0.06 * mont);
      pos.push(s * A * r * k, Y + creux + bord * mont + devant, c * P * r * k - 0.06 * mont * Math.pow(dos, 2));
    }
  }
  for (let j = 0; j < NR; j++) for (let i = 0; i < NA; i++) {
    const a0 = j * (NA + 1) + i, a1 = a0 + 1, b0 = a0 + NA + 1, b1 = b0 + 1;
    idx.push(a0, b0, a1, a1, b0, b1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx); g.computeVertexNormals();
  return (_coque = g);
}
const _matsCoque = new Map();
function chaise(ch, x, y, face, couleur) {
  const M = ch.M, fx = face === 'S' ? 0 : face === 'N' ? 0 : face === 'E' ? 1 : -1, fz = face === 'S' ? 1 : face === 'N' ? -1 : 0;
  const g = new THREE.Group(); g.position.set(x, 0, -y); g.rotation.y = Math.atan2(fx, fz);
  if (!_matsCoque.has(couleur)) _matsCoque.set(couleur, new THREE.MeshStandardMaterial({ color: couleur, roughness: 0.38, side: THREE.DoubleSide }));
  maille(geoCoque(), _matsCoque.get(couleur), 0, 0, 0, 0, g);
  for (const [px, pz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const p = maille(new THREE.CylinderGeometry(0.008, 0.008, 0.44, 6), M.inox, px * 0.17, 0.21, pz * 0.15, 0, g);
    p.rotation.z = -px * 0.2; p.rotation.x = pz * 0.2;
    maille(new THREE.CylinderGeometry(0.014, 0.014, 0.012, 8), M.noirMat, px * 0.215, 0.006, pz * 0.195, 0, g);
  }
  for (const s of [-1, 1]) {
    const e = maille(new THREE.CylinderGeometry(0.006, 0.006, 0.5, 5), M.inox, 0, 0.2, 0, 0, g);
    e.rotation.z = Math.PI / 2; e.rotation.y = s * 0.72;
  }
  maille(boiteM(0.22, 0.012, 0.2), M.inox, 0, 0.37, -0.01, 0, g);
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
  // la borne numérique noire (x 9,45), son écran en mosaïque de photos, tournée vers le nord-ouest
  const borne = new THREE.Group(); borne.position.set(9.45, 0, -9.35); borne.rotation.y = Math.PI * 0.82; ch.decor.add(borne);
  maille(boiteM(0.6, 0.02, 0.5), M.noir, 0, 0.01, 0, 0, borne);
  maille(boiteM(0.6, 1.95, 0.08), M.noir, 0, 0.995, 0, 0, borne);
  const mos = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 1.6), new THREE.MeshBasicMaterial({ map: texMosaique(), color: new THREE.Color(1.1, 1.1, 1.1) }));
  mos.position.set(0, 1.05, 0.041); borne.add(mos);
  C.ajouterBoite(9.12, -9.65, 9.78, -9.05, { y1: 2 });
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
  ch.panneau(new THREE.MeshStandardMaterial({ map: texAffiche('#3b3b3b', '#1d1d1d', 6), roughness: 0.6 }), 0.78, 1.9, 13.377, 12.55, 1.02, 'W');
  C.ajouterBoite(13.28, -12.95, 13.5, -12.15, { y1: 2 });
  ch.panneau(new THREE.MeshStandardMaterial({ map: texAffiche('#111111', '#151515', 7), roughness: 0.5 }), 0.2, 0.3, 13.494, 9.55, 1.65, 'W');
  ch.panneau(new THREE.MeshStandardMaterial({ map: texAffiche('#f08a3c', '#ffffff', 8), roughness: 0.6 }), 0.2, 0.3, 13.494, 9.55, 1.9, 'W');
  // les affiches du pilier (une A2 blanche, un tract orange, deux feuilles côté nord)
  ch.panneau(new THREE.MeshStandardMaterial({ map: texAffiche('#e8eef8', '#ffffff', 9), roughness: 0.7 }), 0.42, 0.6, 10.294, 9.2, 1.6, 'W');
  ch.panneau(new THREE.MeshStandardMaterial({ map: texAffiche('#f08a3c', '#ffffff', 10), roughness: 0.7 }), 0.3, 0.42, 10.294, 9.2, 1.1, 'W');
  ch.panneau(new THREE.MeshStandardMaterial({ map: texAffiche('#3e9b6b', '#ffffff', 11), roughness: 0.7 }), 0.21, 0.3, 10.6, 9.506, 1.55, 'N');
  // les affiches scotchées sur les jours dépolis
  [[6.3, 1.7, '#e07b2a'], [6.95, 1.85, '#2f6fb0'], [8.0, 1.75, '#3e9b6b'], [8.65, 1.9, '#7b2a6e']].forEach(([x, h, c], i) =>
    ch.panneau(new THREE.MeshStandardMaterial({ map: texAffiche(c, '#fbfbf8', 20 + i), roughness: 0.7 }), 0.21, 0.297, x, 9.088, h, 'N'));

  // =====================================================================
  //  LE HALL OUEST (photo 06)
  // =====================================================================
  cadreMural(ch, new THREE.MeshStandardMaterial({ map: texConsignes(), roughness: 0.5 }), 1.75, 8.45, 'E', 0.45, 1.3, 1.92);
  // l'extincteur rouge sur sa console (h 0,95-1,55) et ses pictogrammes
  const ext = new THREE.Group(); ext.position.set(1.86, 0, -11.2); ch.decor.add(ext);
  maille(new THREE.CylinderGeometry(0.075, 0.075, 0.48, 16), M.rougeEtiquette, 0, 1.2, 0, 0, ext);
  maille(new THREE.CylinderGeometry(0.03, 0.045, 0.08, 10), M.noirMat, 0, 1.48, 0, 0, ext);
  maille(boiteM(0.04, 0.06, 0.06), M.noirMat, -0.08, 1.35, 0, 0, ext);
  C.ajouterCercle(1.86, -11.2, 0.09, { y0: 0.9, y1: 1.6 });
  ch.panneau(new THREE.MeshStandardMaterial({ map: texPictoExtincteur(), roughness: 0.6 }), 0.16, 0.16, 1.755, 11.2, 1.9, 'E');
  // l'affiche jaune du tri, à gauche des portes de l'escalier
  cadreMural(ch, new THREE.MeshStandardMaterial({ map: texTri(), roughness: 0.6 }), 2.2, 13.6, 'S', 0.6, 1.1, 1.95);

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
}

// ---- les petites textures du mobilier ----
function texMosaique() {
  return canvasTex(128, 372, (g, w, h) => {
    g.fillStyle = '#0d0f12'; g.fillRect(0, 0, w, h);
    const cols = ['#5a7f9c', '#c49a6c', '#7c5a8e', '#d6d0c4', '#3e6b5a', '#b65a3c', '#8aa4c8'];
    let k = 0;
    for (let y = 4; y < h - 4; y += 46) for (let x = 4; x < w - 4; x += 62) { g.fillStyle = cols[(k++ * 3) % cols.length]; g.fillRect(x, y, 58, 42); }
  }, null, false, 4);
}
function texBrochures() {
  return canvasTex(256, 84, (g, w, h) => {
    g.fillStyle = '#111'; g.fillRect(0, 0, w, h);
    const cols = ['#e04e3a', '#2f6fb0', '#f2b705', '#ffffff', '#7b2a6e', '#3e9b6b', '#f08a3c', '#cccccc'];
    for (let i = 0; i < 9; i++) { g.fillStyle = cols[(i * 5) % cols.length]; g.fillRect(4 + i * 28, 6, 24, h - 12); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(4 + i * 28, 6 + (h - 12) * 0.6, 24, 6); }
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
