// =====================================================================
//  LA CARTE : L'ÉCOLE IRIS — pour l'instant une SALLE D'ESSAI (provisoire)
// =====================================================================
// Ce module a le rôle qu'avait buildArena dans LA CAGE (js/court.js) : il construit TOUT ce que la scène contient de
// fixe — sol, murs, plafond, mobilier —, l'éclairage et la carte d'environnement, et il déclare les MURS au monde solide
// (js/collisions.js) que le joueur et la caméra interrogent. Le jeu (js/game.js) ne connaît que ce qu'il rend :
//   construireCarte(scene, renderer) -> { nom, collisions, depart: { x, z, fx, fz }, bornes, sieges }
// et ce qu'il pose dans scene.userData, que le rendu (js/fx.js), la météo (js/weather.js) et les ombres de contact
// (js/ombres_contact.js) lisent comme ils lisaient ceux des terrains :
//   env { sun, hemi, fill, clouds, court, wetMats }   les lumières que la météo règle ; `court` = le sol (reflet, ombre cuite)
//   sunDir                                            la direction de la lumière principale (rayons, ombres de contact)
//   zoneOmbre { min, max }                            ce que la carte d'ombre doit couvrir (js/fx.js _cadrerOmbre)
//   envTerrain, envLocale, sondeCiel, gainSonde       la carte d'environnement prise sur place et sa sonde (js/kit_decor.js)
//   solContact, solCuit                               le plan des ombres de contact et de l'ombre cuite au sol
//   interieur                                         vrai : la météo prend son réglage « intérieur » (ni pluie ni soleil)
//   animate(t)                                        appelé à chaque image (le vent des feuillages)
//
// LA SALLE D'ESSAI (en attendant l'école d'après les photos de Haythem, references/ecole/) : une pièce de 20 x 12 m
// et 2,70 m sous plafond, aux couleurs de l'école — carrelage gris foncé en grandes dalles, murs blancs à plinthes de
// bois, un mur d'accent jaune avec sa lisse blanche et sa rangée de chaises coque (on peut s'y asseoir), un pilier jaune
// à bande blanche et son panneau DAE, un pilier rond, des portes grises fermées, un écran, des affiches, une plante —
// et UNE VRAIE OUVERTURE de porte qui mène à un bout de couloir en impasse. Plafond en dalles acoustiques perforées
// sur ossature, spots ronds encastrés. De quoi éprouver le moteur : collisions (murs droits, coins rentrants, piliers
// carré et rond, ouverture étroite, mobilier), caméra dans un couloir de 2,4 m, éclairage intérieur.
// REPÈRE : x vers l'est (le mur jaune), z vers le sud ; la porte ouverte est au nord (z = -6), le couloir va vers -z.
import * as THREE from 'three';
import { Collisions } from './collisions.js';
import { canvasTex, normalesDepuisGrille, avecRelief, detailPhoto, carteLocale, poserSondeLocale, planifierOcclusionSol,
  optimiserDecor, nePasFusionner, windify, transmissionSoleil, animerVent, rnd } from './kit_decor.js';
import { TELEPHONE } from './appareil.js';

const H = 2.7;                 // hauteur sous plafond
const EP = 0.2;                // épaisseur des murs
const SALLE = { x0: -10, x1: 10, z0: -6, z1: 6 };
const PORTE = { x: 6, l: 1.3, h: 2.1 };            // l'ouverture du mur nord
const COULOIR = { x0: PORTE.x - 1.2, x1: PORTE.x + 1.2, z0: -14, z1: -6 };
const DIR_LUMIERE = new THREE.Vector3(0.16, 1, 0.22).normalize();   // la lumière des plafonniers, presque d'aplomb

// =====================================================================
//  MATIÈRES
// =====================================================================
// Une boîte dont les UV sont en MÈTRES (u le long de la face, v vers le haut) : un même matériau à texture répétée
// habille ainsi des murs de toutes longueurs, et l'optimisation du décor peut les coudre en un seul maillage.
function boiteM(w, h, d) {
  const g = new THREE.BoxGeometry(w, h, d);
  const p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i));
    if (ax > 0.5) uv.setXY(i, z, y); else if (ay > 0.5) uv.setXY(i, x, z); else uv.setXY(i, x, y);
  }
  return g;
}
function maille(geo, mat, x, y, z, rotY = 0, parent = null, { ombre = true, recoit = true } = {}) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z); m.rotation.y = rotY;
  m.castShadow = ombre; m.receiveShadow = recoit;
  if (parent) parent.add(m);
  return m;
}

// LE CARRELAGE (photos 01 à 05) : grandes dalles de grès gris foncé, 60 x 60, un peu marbrées, joints fins plus sombres,
// pose droite. Satiné : les spots s'y reflètent (photo 02). Une tuile de dessin = 4 x 4 dalles = 2,4 m.
const DALLE = 0.6;
function texCarrelage() {
  const N = 4, px = 1024, c = px / N;
  const t = canvasTex(px, px, (g) => {
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const base = 74 + rnd(-6, 6), x0 = i * c, y0 = j * c;
      g.fillStyle = `rgb(${base},${base + 1},${base + 4})`; g.fillRect(x0, y0, c, c);
      // la marbrure de la pierre reconstituée : des nuages doux et quelques veines claires
      for (let k = 0; k < 26; k++) {
        const r = rnd(c * 0.08, c * 0.35), cx = x0 + rnd(0, c), cy = y0 + rnd(0, c), v = base + rnd(-14, 16);
        const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r);
        gr.addColorStop(0, `rgba(${v},${v + 1},${v + 3},0.22)`); gr.addColorStop(1, `rgba(${v},${v},${v},0)`);
        g.save(); g.beginPath(); g.rect(x0, y0, c, c); g.clip(); g.fillStyle = gr; g.fillRect(cx - r, cy - r, 2 * r, 2 * r); g.restore();
      }
      g.save(); g.beginPath(); g.rect(x0, y0, c, c); g.clip();
      g.strokeStyle = 'rgba(150,150,154,0.10)'; g.lineWidth = 1.2;
      for (let k = 0; k < 3; k++) {
        g.beginPath(); let x = x0 + rnd(0, c), y = y0 + rnd(0, c); g.moveTo(x, y);
        for (let s = 0; s < 8; s++) { x += rnd(-18, 18); y += rnd(-18, 18); g.lineTo(x, y); }
        g.stroke();
      }
      // le grain : de minuscules éclats
      for (let k = 0; k < 900; k++) { const v = base + rnd(-22, 22); g.fillStyle = `rgba(${v},${v},${v + 2},0.5)`; g.fillRect(x0 + rnd(0, c), y0 + rnd(0, c), 1.4, 1.4); }
      g.restore();
    }
    // les joints
    g.fillStyle = '#3c3d40';
    for (let k = 0; k <= N; k++) { g.fillRect(k * c - 1.5, 0, 3, px); g.fillRect(0, k * c - 1.5, px, 3); }
  }, [1, 1], false, 16);
  return t;
}
let _normCarrelage = null;
function normalesCarrelage() {
  return _normCarrelage || (_normCarrelage = normalesDepuisGrille(512, 512, (g, w) => {
    const N = 4, c = w / N;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) g.fillRect(i * c + 1.5, j * c + 1.5, c - 3, c - 3);
  }, 1.4, 1.2));
}

// LE PLAFOND (photos 02, 03, 21) : dalles acoustiques blanc cassé de 60 x 60, percées d'un semis régulier de petits trous,
// posées sur une ossature en T blanche. Une tuile de dessin = 2 x 2 dalles = 1,2 m.
function texPlafond() {
  const N = 2, px = 512, c = px / N;
  return canvasTex(px, px, (g) => {
    g.fillStyle = '#e8e3d6'; g.fillRect(0, 0, px, px);
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const x0 = i * c, y0 = j * c, b = 14;
      g.fillStyle = `rgb(${229 + rnd(-3, 3)},${224 + rnd(-3, 3)},${212 + rnd(-3, 3)})`; g.fillRect(x0 + 4, y0 + 4, c - 8, c - 8);
      g.fillStyle = 'rgba(120,112,98,0.55)';
      for (let y = y0 + b; y < y0 + c - b; y += 7) for (let x = x0 + b; x < x0 + c - b; x += 7) g.fillRect(x, y, 2, 2);
    }
    // l'ossature : un T blanc, légèrement plus clair, ombré d'un côté
    g.fillStyle = '#f6f4ee';
    for (let k = 0; k <= N; k++) { g.fillRect(k * c - 4, 0, 8, px); g.fillRect(0, k * c - 4, px, 8); }
    g.fillStyle = 'rgba(0,0,0,0.10)';
    for (let k = 0; k <= N; k++) { g.fillRect(k * c + 4, 0, 2, px); g.fillRect(0, k * c + 4, px, 2); }
  }, [1, 1], false, 8);
}

// UN ENDUIT PEINT : presque uni, une très légère nuée (rouleau), en mètres (1 tuile = 2 m)
function texPeinture(hex) {
  const c = new THREE.Color(hex), r = c.r * 255, gg = c.g * 255, b = c.b * 255;
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = `rgb(${r},${gg},${b})`; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 60; k++) {
      const R = rnd(20, 70), x = rnd(0, w), y = rnd(0, h), d = rnd(-5, 5);
      const gr = g.createRadialGradient(x, y, 0, x, y, R);
      gr.addColorStop(0, `rgba(${r + d},${gg + d},${b + d},0.35)`); gr.addColorStop(1, `rgba(${r},${gg},${b},0)`);
      g.fillStyle = gr; g.fillRect(x - R, y - R, 2 * R, 2 * R);
    }
  }, [0.5, 0.5], false, 8);
}

function materiaux() {
  const M = {};
  const carr = texCarrelage(); carr.repeat.set(1 / (4 * DALLE), 1 / (4 * DALLE));     // (UV en mètres : boiteM / sol)
  M.sol = new THREE.MeshStandardMaterial({ map: carr, roughness: 0.38, metalness: 0 });
  avecRelief(M.sol, normalesCarrelage(), 0.6);
  M.blanc = new THREE.MeshStandardMaterial({ map: texPeinture(0xeeebe3), roughness: 0.86 });
  M.jaune = new THREE.MeshStandardMaterial({ map: texPeinture(0xf0a417), roughness: 0.78 });
  // un peu de relief et de rugosité variée sur les murs peints (béton photographié, sans grain : la couleur reste)
  for (const m of [M.blanc, M.jaune]) detailPhoto(m, 'beton', 1, 1, { relief: 0.12, grain: 0, rugo: true });
  const tp = texPlafond(); tp.repeat.set(1 / 1.2, 1 / 1.2);
  M.plafond = new THREE.MeshStandardMaterial({ map: tp, roughness: 0.92 });
  M.bois = new THREE.MeshStandardMaterial({ color: 0xb98a55, roughness: 0.55 });       // plinthes, chambranles clairs
  M.porte = new THREE.MeshStandardMaterial({ color: 0x8e959b, roughness: 0.5, metalness: 0.15 });
  M.cadre = new THREE.MeshStandardMaterial({ color: 0x5e6266, roughness: 0.45, metalness: 0.3 });
  M.vitre = new THREE.MeshStandardMaterial({ color: 0x1d262c, roughness: 0.08, metalness: 0.4 });
  M.inox = new THREE.MeshStandardMaterial({ color: 0xc9ccd0, roughness: 0.25, metalness: 0.9 });
  M.noir = new THREE.MeshStandardMaterial({ color: 0x17181a, roughness: 0.4 });
  M.rouge = new THREE.MeshStandardMaterial({ color: 0xc8231b, roughness: 0.35, metalness: 0.1 });
  M.lisse = new THREE.MeshStandardMaterial({ color: 0xf4f2ec, roughness: 0.5 });
  M.pot = new THREE.MeshStandardMaterial({ color: 0x55595d, roughness: 0.6, metalness: 0.2 });
  M.terre = new THREE.MeshStandardMaterial({ color: 0x3a2c22, roughness: 1 });
  M.tige = new THREE.MeshStandardMaterial({ color: 0x6f8a3c, roughness: 0.7 });
  // les spots : un disque qui ÉCLAIRE (valeurs au-dessus de 1 : le bloom les fait briller en haute)
  M.spot = new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 0.95, 0.86).multiplyScalar(2.6) });
  M.spotBord = new THREE.MeshStandardMaterial({ color: 0xf2f2f0, roughness: 0.3, metalness: 0.6 });
  return M;
}

// =====================================================================
//  LES MURS : collisions et géométrie au même endroit
// =====================================================================
// Un mur déclaré aux collisions (`C.mur`) rend ses morceaux pleins ; on y pose exactement la même géométrie, des
// plinthes de bois au pied de chaque face (seulement au pied d'un morceau qui part du sol), et un chambranle autour de
// chaque ouverture. Les murs ne PROJETTENT pas d'ombre : la lumière de la carte d'ombre figure les plafonniers, et un
// mur de 2,70 m y jetterait une bande d'ombre nette que des plafonniers ne font pas.
function poserMur(groupe, C, M, x0, z0, x1, z1, mat, o = {}) {
  const w = C.mur(x0, z0, x1, z1, EP, { h: o.h ?? H, ouvertures: o.ouvertures || [] });
  const rot = -Math.atan2(w.uz, w.ux);
  const faces = o.faces || [1, -1];                  // les côtés qui reçoivent des plinthes (1 = à gauche du trait)
  for (const p of w.pleins) {
    const L = p.a1 - p.a0, am = (p.a0 + p.a1) / 2, cx = w.x0 + w.ux * am, cz = w.z0 + w.uz * am;
    maille(boiteM(L, p.y1 - p.y0, EP), mat, cx, (p.y0 + p.y1) / 2, cz, rot, groupe, { ombre: false });
    if (p.y0 < 1e-3) {
      for (const s of faces) {
        const nx = -w.uz * s, nz = w.ux * s, d = EP / 2 + 0.008;
        maille(boiteM(L, 0.08, 0.016), M.bois, cx + nx * d, 0.04, cz + nz * d, rot, groupe, { ombre: false });
      }
    }
  }
  // le chambranle autour des ouvertures (bois clair, comme les plinthes)
  for (const ov of w.ouvertures) {
    const am = (ov.a0 + ov.a1) / 2, cx = w.x0 + w.ux * am, cz = w.z0 + w.uz * am, l = ov.a1 - ov.a0;
    for (const s of [-1, 1]) {
      const ax = cx + w.ux * s * (l / 2 + 0.03), az = cz + w.uz * s * (l / 2 + 0.03);
      maille(boiteM(0.06, ov.haut, EP + 0.04), M.bois, ax, ov.haut / 2, az, rot, groupe, { ombre: false });
    }
    maille(boiteM(l + 0.12, 0.06, EP + 0.04), M.bois, cx, ov.haut + 0.03, cz, rot, groupe, { ombre: false });
  }
  return w;
}

// UNE PORTE FERMÉE posée contre un mur (décor) : vantail gris, cadre sombre, oculus vertical, poignée inox
// (photos 01, 04, 05). `x, z` : centre au sol, `nx, nz` : la normale du mur vers la pièce.
function porteFermee(groupe, M, x, z, nx, nz, { l = 0.93, h = 2.04, double = false } = {}) {
  const rot = Math.atan2(nx, nz), g = new THREE.Group();
  g.position.set(x + nx * (EP / 2), 0, z + nz * (EP / 2)); g.rotation.y = rot;
  const L = double ? l * 2 : l;
  maille(boiteM(L + 0.1, 0.06, 0.05), M.cadre, 0, h + 0.03, 0.01, 0, g);
  for (const s of [-1, 1]) maille(boiteM(0.05, h, 0.05), M.cadre, s * (L / 2 + 0.025), h / 2, 0.01, 0, g);
  const vantaux = double ? [-l / 2, l / 2] : [0];
  for (const vx of vantaux) {
    maille(boiteM(l - 0.01, h - 0.01, 0.04), M.porte, vx, h / 2, 0.02, 0, g);
    maille(boiteM(0.1, 0.62, 0.045), M.vitre, vx + (double ? 0 : -0.18), 1.35, 0.022, 0, g);
    maille(boiteM(0.14, 0.022, 0.02), M.inox, vx + (double ? (vx < 0 ? 0.3 : -0.3) : 0.33), 1.02, 0.06, 0, g);
  }
  groupe.add(g);
  return g;
}

// LES CHAISES COQUE (photo 02) : coque moulée d'une seule pièce sur un piètement chromé en fils, en couleurs mêlées.
// La coque est un morceau de sphère aplati, creusé ; on s'y assoit (`sieges`). `cap` : la direction où regarde l'assis.
const COULEURS_COQUES = [0xf1efe8, 0x5f8f97, 0xcbb8a6, 0xb6c43a, 0x9c9d9b, 0x2b2c2e];
function chaiseCoque(groupe, M, x, z, fx, fz, couleur) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = Math.atan2(fx, fz);
  const mat = new THREE.MeshStandardMaterial({ color: couleur, roughness: 0.32 });
  // la coque : une demi-sphère écrasée (dossier et accoudoirs remontent), vue de l'intérieur aussi
  const coque = new THREE.SphereGeometry(0.34, 22, 12, 0, Math.PI * 2, Math.PI * 0.52, Math.PI * 0.48);
  coque.scale(1.05, 0.95, 0.95); coque.rotateX(-0.12);
  const m = maille(coque, mat, 0, 0.74, 0.02, 0, g);
  m.material.side = THREE.DoubleSide;
  // l'assise : le fond plat de la coque
  maille(new THREE.CylinderGeometry(0.26, 0.24, 0.03, 20), mat, 0, 0.44, 0.03, 0, g);
  // le piètement : quatre pieds inclinés et l'entretoise
  for (const [px, pz] of [[-0.2, -0.17], [0.2, -0.17], [-0.2, 0.2], [0.2, 0.2]]) {
    const p = maille(new THREE.CylinderGeometry(0.009, 0.009, 0.45, 6), M.inox, px * 0.85, 0.215, pz * 0.85, 0, g);
    p.rotation.z = -px * 0.35; p.rotation.x = pz * 0.35;
  }
  maille(boiteM(0.34, 0.012, 0.3), M.inox, 0, 0.42, 0.02, 0, g);
  groupe.add(g);
  return g;
}

// L'ÉCRAN D'ACCUEIL (photo 02) : un écran plat au mur, qui éclaire (le logo de l'école, le message du jour)
function texEcran() {
  return canvasTex(512, 288, (g, w, h) => {
    const d = g.createLinearGradient(0, 0, w, h); d.addColorStop(0, '#1c5d8f'); d.addColorStop(1, '#0e2a44');
    g.fillStyle = d; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,0.08)';
    for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(rnd(0, w), rnd(0, h), rnd(20, 90), 0, 7); g.fill(); }
    g.fillStyle = '#ffffff'; g.font = '600 96px "Century Gothic", "Avenir", "Futura", "Segoe UI", sans-serif';
    g.textBaseline = 'middle'; g.fillText('iris', 36, 112);
    g.font = '500 26px "Segoe UI", sans-serif'; g.fillStyle = '#d6e6f5';
    g.fillText('Bienvenue', 40, 196); g.fillText('Bonne journée à toutes et à tous', 40, 232);
  }, null, false, 4);
}
// UNE AFFICHE : un bloc de couleur, un titre, des lignes de texte figurées
function texAffiche(teinte) {
  return canvasTex(256, 362, (g, w, h) => {
    g.fillStyle = '#f7f6f1'; g.fillRect(0, 0, w, h);
    g.fillStyle = teinte; g.fillRect(0, 0, w, h * 0.34);
    g.fillStyle = 'rgba(255,255,255,0.85)'; g.fillRect(18, 34, w * 0.55, 16); g.fillRect(18, 60, w * 0.4, 10);
    g.fillStyle = '#9aa0a6';
    for (let y = h * 0.42; y < h - 30; y += 15) g.fillRect(18, y, rnd(w * 0.4, w - 36), 6);
  }, null, false, 4);
}
// LE PANNEAU DAE (photos 04, 05) : vert, le cœur et l'éclair, « DAE »
function texDAE() {
  return canvasTex(256, 96, (g, w, h) => {
    g.fillStyle = '#0d8a4a'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ffffff'; g.beginPath();
    g.moveTo(52, 30); g.bezierCurveTo(52, 16, 26, 16, 26, 36); g.bezierCurveTo(26, 52, 52, 66, 52, 76);
    g.bezierCurveTo(52, 66, 78, 52, 78, 36); g.bezierCurveTo(78, 16, 52, 16, 52, 30); g.fill();
    g.fillStyle = '#0d8a4a'; g.beginPath(); g.moveTo(56, 26); g.lineTo(44, 50); g.lineTo(54, 50); g.lineTo(48, 70); g.lineTo(62, 44); g.lineTo(52, 44); g.closePath(); g.fill();
    g.fillStyle = '#ffffff'; g.font = '700 50px "Segoe UI", Arial, sans-serif'; g.textBaseline = 'middle'; g.fillText('DAE', 100, 50);
  }, null, false, 4);
}
// UNE FEUILLE de bambou (découpe alpha) : une bande de quelques feuilles lancéolées sur une tige
function texFeuilles() {
  return canvasTex(256, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    for (let i = 0; i < 9; i++) {
      const x = rnd(30, w - 30), y = rnd(30, h - 30), a = rnd(-0.9, 0.9) + (i % 2 ? Math.PI : 0), L = rnd(70, 110), l = rnd(9, 14);
      g.save(); g.translate(x, y); g.rotate(a);
      const v = Math.round(rnd(70, 120));
      g.fillStyle = `rgb(${v - 30},${v + 40},${v - 50})`;
      g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(L * 0.45, -l, L, 0); g.quadraticCurveTo(L * 0.45, l, 0, 0); g.fill();
      g.strokeStyle = 'rgba(40,60,20,0.5)'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, 0); g.lineTo(L, 0); g.stroke();
      g.restore();
    }
  }, null, true, 4);
}
function planteBambou(groupe, M, x, z) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  maille(new THREE.CylinderGeometry(0.3, 0.26, 0.55, 24), M.pot, 0, 0.275, 0, 0, g);
  maille(new THREE.CylinderGeometry(0.27, 0.27, 0.02, 24), M.terre, 0, 0.54, 0, 0, g, { ombre: false });
  const feuille = new THREE.MeshStandardMaterial({ map: texFeuilles(), alphaTest: 0.45, side: THREE.DoubleSide, roughness: 0.75 });
  windify(feuille, (sh) => transmissionSoleil(sh, 0.35), 0.7, 2.0);
  const prof = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: feuille.map, alphaTest: 0.45, side: THREE.DoubleSide });
  windify(prof, null, 0.7, 2.0);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + rnd(0, 0.6), r = rnd(0.04, 0.16), hT = rnd(1.5, 2.15);
    const t = maille(new THREE.CylinderGeometry(0.012, 0.016, hT, 6), M.tige, Math.cos(a) * r, 0.54 + hT / 2, Math.sin(a) * r, 0, g);
    t.rotation.z = rnd(-0.08, 0.08); t.rotation.x = rnd(-0.08, 0.08);
  }
  // les feuillages : des plans croisés qui montent le long des tiges (dans le repère de la plante : le vent les y suit)
  for (let i = 0; i < 16; i++) {
    const y = rnd(1.0, 2.35), s = rnd(0.45, 0.7);
    const p = maille(new THREE.PlaneGeometry(s, s), feuille, rnd(-0.18, 0.18), y, rnd(-0.18, 0.18), rnd(0, Math.PI), g);
    p.rotation.x = rnd(-0.4, 0.4); p.customDepthMaterial = prof;
  }
  nePasFusionner(g);
  groupe.add(g);
  return g;
}

// UN SPOT ENCASTRÉ (photos 01, 02, 21) : un disque lumineux dans une couronne métallique, à fleur du plafond
function spot(groupe, M, x, z, y = H) {
  const c = maille(new THREE.CylinderGeometry(0.13, 0.13, 0.012, 24), M.spotBord, x, y - 0.006, z, 0, groupe, { ombre: false, recoit: false });
  const d = maille(new THREE.CircleGeometry(0.105, 24), M.spot, x, y - 0.014, z, 0, groupe, { ombre: false, recoit: false });
  d.rotation.x = Math.PI / 2;
  c.userData.horsAOSol = true; d.userData.horsAOSol = true;
}

// =====================================================================
//  LA CARTE
// =====================================================================
export function construireCarte(scene, renderer = null) {
  const C = new Collisions();
  const M = materiaux();
  const decor = new THREE.Group(); decor.name = 'salle d\'essai';
  scene.add(decor);
  scene.background = new THREE.Color(0x0b0d10);
  scene.fog = null;                                    // (à l'intérieur : pas de brume)

  // ---- le sol : UN plan sous la salle et le couloir (le reflet du sol mouillé et l'ombre cuite s'y posent) ----
  const SX0 = SALLE.x0 - 0.3, SX1 = SALLE.x1 + 0.3, SZ0 = COULOIR.z0 - 0.3, SZ1 = SALLE.z1 + 0.3;
  const W = SX1 - SX0, L = SZ1 - SZ0, cx = (SX0 + SX1) / 2, cz = (SZ0 + SZ1) / 2;
  const geoSol = new THREE.PlaneGeometry(W, L);
  // UV en mètres pour le carrelage ; la carte d'ombre cuite (aoMap) garde ses propres UV de 0 à 1 (channel 1)
  const uv = geoSol.attributes.uv, uv1 = uv.clone();
  for (let i = 0; i < uv.count; i++) uv.setXY(i, cx + (uv.getX(i) - 0.5) * W, -(cz + (0.5 - uv.getY(i)) * L));
  geoSol.setAttribute('uv1', uv1);
  const sol = new THREE.Mesh(geoSol, M.sol);
  sol.rotation.x = -Math.PI / 2; sol.position.set(cx, 0, cz); sol.receiveShadow = true; sol.name = 'sol';
  scene.add(sol); nePasFusionner(sol);

  // ---- les murs de la salle (le nord percé de la porte ouverte) ----
  // (les murs sont posés SUR les traits x = ±10, z = ±6 : la face intérieure est à 10 cm du trait)
  const t = EP / 2;
  poserMur(decor, C, M, SALLE.x0 - t, SALLE.z0, SALLE.x1 + t, SALLE.z0, M.blanc,
    { ouvertures: [{ a: PORTE.x - (SALLE.x0 - t), l: PORTE.l, h: PORTE.h }], faces: [-1, 1] });
  poserMur(decor, C, M, SALLE.x0 - t, SALLE.z1, SALLE.x1 + t, SALLE.z1, M.blanc, { faces: [-1] });
  poserMur(decor, C, M, SALLE.x0, SALLE.z0 + t, SALLE.x0, SALLE.z1 - t, M.blanc, { faces: [-1] });
  poserMur(decor, C, M, SALLE.x1, SALLE.z0 + t, SALLE.x1, SALLE.z1 - t, M.jaune, { faces: [1] });
  // ---- le couloir en impasse derrière la porte ----
  poserMur(decor, C, M, COULOIR.x0, COULOIR.z0, COULOIR.x0, SALLE.z0 - t, M.blanc, { faces: [-1] });
  poserMur(decor, C, M, COULOIR.x1, COULOIR.z0, COULOIR.x1, SALLE.z0 - t, M.blanc, { faces: [1] });
  poserMur(decor, C, M, COULOIR.x0 - t, COULOIR.z0, COULOIR.x1 + t, COULOIR.z0, M.blanc, { faces: [1] });

  // ---- la lisse blanche du mur jaune (photo 02 : à hauteur de dossier) ----
  maille(boiteM(0.03, 0.14, SALLE.z1 - SALLE.z0 - 0.4), M.lisse, SALLE.x1 - t - 0.015, 0.86, 0, 0, decor);

  // ---- les plafonds (la caméra s'y arrête ; pas d'ombre : la lumière principale vient de plus haut) ----
  const plafond = (x0, z0, x1, z1) => {
    C.plafond(x0, z0, x1, z1, H);
    const g = boiteM(x1 - x0, 0.04, z1 - z0);
    const m = maille(g, M.plafond, (x0 + x1) / 2, H + 0.02, (z0 + z1) / 2, 0, decor, { ombre: false });
    m.userData.horsAOSol = true;
  };
  plafond(SALLE.x0 - 0.2, SALLE.z0 - 0.2, SALLE.x1 + 0.2, SALLE.z1 + 0.2);
  plafond(COULOIR.x0 - 0.2, COULOIR.z0 - 0.2, COULOIR.x1 + 0.2, SALLE.z0 - 0.1);

  // ---- les piliers : un carré jaune à bande blanche (et son DAE), un rond blanc ----
  const P1 = { x: -3, z: 0.5, c: 0.5 };
  C.ajouterBoite(P1.x - P1.c / 2, P1.z - P1.c / 2, P1.x + P1.c / 2, P1.z + P1.c / 2);
  maille(boiteM(P1.c, H, P1.c), M.jaune, P1.x, H / 2, P1.z, 0, decor);
  maille(boiteM(P1.c + 0.01, 0.22, P1.c + 0.01), M.lisse, P1.x, 1.2, P1.z, 0, decor);
  const dae = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.11), new THREE.MeshStandardMaterial({ map: texDAE(), roughness: 0.4 }));
  dae.position.set(P1.x, 1.62, P1.z + P1.c / 2 + 0.006); decor.add(dae);
  const P2 = { x: 3.5, z: 1.8, r: 0.24 };
  C.ajouterCercle(P2.x, P2.z, P2.r);
  maille(new THREE.CylinderGeometry(P2.r, P2.r, H, 28), M.blanc, P2.x, H / 2, P2.z, 0, decor);
  maille(new THREE.CylinderGeometry(P2.r + 0.012, P2.r + 0.012, 0.08, 28), M.bois, P2.x, 0.04, P2.z, 0, decor, { ombre: false });

  // ---- les chaises coque le long du mur jaune, où l'on peut s'asseoir ----
  const sieges = [];
  const xChaise = SALLE.x1 - t - 0.42;
  const zs = [-4.2, -3.45, -2.7, -1.95, -1.2, -0.45, 0.3];
  zs.forEach((z, i) => {
    chaiseCoque(decor, M, xChaise, z, -1, 0, COULEURS_COQUES[i % COULEURS_COQUES.length]);
    // l'assise (le jeu y pose les hanches), et d'où l'on se relève : 60 cm devant
    sieges.push({ x: xChaise + 0.02, z, y: 0.45, fx: -1, fz: 0, sx: xChaise - 0.7, sz: z, nom: 'la chaise' });
  });
  C.ajouterBoite(xChaise - 0.33, zs[0] - 0.36, SALLE.x1 - t, zs[zs.length - 1] + 0.36);
  // l'écran au-dessus des chaises
  const ecran = new THREE.Mesh(new THREE.PlaneGeometry(1.16, 0.66), new THREE.MeshBasicMaterial({ map: texEcran(), color: new THREE.Color(1.15, 1.15, 1.15) }));
  ecran.position.set(SALLE.x1 - t - 0.045, 1.95, -1.5); ecran.rotation.y = -Math.PI / 2; decor.add(ecran);
  maille(boiteM(0.04, 0.72, 1.24), M.noir, SALLE.x1 - t - 0.02, 1.95, -1.5, 0, decor);

  // ---- les portes fermées (décor) ----
  porteFermee(decor, M, SALLE.x0, -2.5, 1, 0);                              // mur ouest
  porteFermee(decor, M, -5.5, SALLE.z1, 0, -1, { double: true });          // mur sud : la double porte
  porteFermee(decor, M, PORTE.x, COULOIR.z0, 0, 1);                         // le fond du couloir
  porteFermee(decor, M, COULOIR.x0, -10.5, 1, 0);                           // une porte de salle dans le couloir

  // ---- les affiches du mur ouest, l'extincteur du couloir ----
  ['#2f6fb0', '#d6542b', '#3e9b6b'].forEach((c, i) => {
    const a = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.594), new THREE.MeshStandardMaterial({ map: texAffiche(c), roughness: 0.7 }));
    a.position.set(SALLE.x0 + t + 0.006, 1.55, 1.2 + i * 0.6); a.rotation.y = Math.PI / 2; decor.add(a);
  });
  const ext = new THREE.Group(); ext.position.set(COULOIR.x1 - t - 0.12, 0, -9.2);
  maille(new THREE.CylinderGeometry(0.075, 0.075, 0.5, 16), M.rouge, 0, 1.0, 0, 0, ext);
  maille(new THREE.CylinderGeometry(0.03, 0.04, 0.08, 10), M.noir, 0, 1.29, 0, 0, ext);
  decor.add(ext);
  C.ajouterCercle(ext.position.x, ext.position.z, 0.09, { y0: 0.7, y1: 1.4 });

  // ---- la plante du coin ----
  const pl = planteBambou(decor, M, SALLE.x0 + 0.55, SALLE.z1 - 0.55);
  C.ajouterCercle(pl.position.x, pl.position.z, 0.3);

  // ---- les spots du plafond ----
  const spots = [];
  for (let x = -7.5; x <= 7.5; x += 2.5) for (const z of [-3, 0.5, 3.5]) spots.push([x, z]);
  for (let z = -7.5; z >= -13; z -= 2.2) spots.push([PORTE.x, z]);
  for (const [x, z] of spots) spot(decor, M, x, z);

  // =====================================================================
  //  LA LUMIÈRE
  // =====================================================================
  // La lumière principale est une directionnelle presque d'aplomb : elle figure l'ensemble des plafonniers, avec la
  // carte d'ombre du moteur (ombres douces, cadrées sur la carte). L'hémisphère est le rebond des murs et du sol ; le
  // remplissage, une lumière douce de biais qui modèle les visages ; et quelques LAMPES PONCTUELLES sous les spots les
  // plus proches du centre font les flaques de lumière et les reflets sur le carrelage (sans ombre : elles sont là pour
  // le modelé). La carte d'environnement prise sur place (haute et au-dessus) et sa sonde (ailleurs) font le reste.
  const hemi = new THREE.HemisphereLight(0xfff3e2, 0x5a5650, 0.5); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff1de, 2.2);
  sun.position.copy(DIR_LUMIERE).multiplyScalar(30).add(new THREE.Vector3(cx, 0, cz));
  sun.target.position.set(cx, 0, cz); scene.add(sun.target);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera; sc.left = -16; sc.right = 16; sc.top = 16; sc.bottom = -16; sc.near = 1; sc.far = 60;
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.025;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xe8eef8, 0.25);
  fill.position.set(cx - 18, 9, cz + 14); fill.target.position.set(cx, 0, cz); scene.add(fill.target);
  fill.castShadow = false; fill.userData.sansOmbre = true; scene.add(fill);
  const nLampes = TELEPHONE ? 2 : 6;
  const choix = spots.slice().sort((a, b) => Math.hypot(a[0], a[1]) - Math.hypot(b[0], b[1])).slice(0, nLampes);
  for (const [x, z] of choix) {
    const l = new THREE.PointLight(0xffe2c2, 3.2, 7.5, 2);
    l.position.set(x, H - 0.25, z); l.castShadow = false;
    scene.add(l);
  }

  scene.userData.interieur = true;
  scene.userData.sunDir = DIR_LUMIERE.clone();
  scene.userData.env = { sun, hemi, fill, clouds: [], court: sol, wetMats: [] };
  // l'ombre ne couvre que la carte (à 50 cm près) : ses texels vont là où l'on marche
  scene.userData.zoneOmbre = { min: [SX0 - 0.5, 0, SZ0 - 0.5], max: [SX1 + 0.5, H, SZ1 + 0.5] };
  scene.userData.albedoSol = false;                    // le rebond du sol est réglé à la main (hémisphère)
  scene.userData.pointEnv = { x: 0, y: 1.6, z: 0.5 };
  scene.userData.envTerrain = carteLocale(scene); scene.userData.envLocale = true;
  poserSondeLocale(scene, 1.25, 1.15);
  // les ombres de contact sous le joueur et le mobilier, le pied des murs : un peu plus marquées qu'en plein air
  scene.userData.ombreContact = { contact: 0.5, occlusion: 1.8, borne: 0.65 };
  scene.userData.occlusionSol = { rayon: 1.6, intensite: 1.0 };
  scene.userData.animate = (tps) => animerVent(tps);

  // (l'ombre cuite se lit sur la deuxième couche d'UV : la première est en mètres, pour le carrelage)
  scene.userData.aoCanal = 1;
  optimiserDecor(scene);
  planifierOcclusionSol(scene, renderer, sol, W, L, { cx, cz });

  return {
    nom: 'Salle d\'essai',
    collisions: C,
    depart: { x: -1, z: 1.2, fx: 0.15, fz: -1 },
    bornes: { xMin: SX0, xMax: SX1, zMin: SZ0, zMax: SZ1 },
    sieges,
  };
}
