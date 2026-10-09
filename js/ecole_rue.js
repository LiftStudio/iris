// =====================================================================
//  LA RUE DEVANT L'ÉCOLE IRIS (crochet de js/carte_ecole.js) — première version
// =====================================================================
// Une petite rue de Paris en impasse (photos 08 à 18) : à l'ouest l'impasse (~20 m après le mitoyen), fermée par une
// grille noire sur un muret ; à l'est la rue file ~40 m jusqu'à un carrefour en T. Trottoir côté école de 2,4 m (enrobé
// gris clair, bordure de granit de 12 cm), chaussée de 5,2 m dont une file de stationnement côté sud, trottoir d'en face
// de 1,7 m. En face : l'immeuble moderne 5/7 (enduit blanc et bandeaux de mélèze), puis un jardin derrière une grille
// noire doublée de brande, l'immeuble des années 60 au fond ; côté école, le n° 8 haussmannien à l'ouest, le n° 4 en
// pierre à l'est.
// CETTE VERSION pose le sol, les façades (des volumes texturés) et les limites : de quoi sortir de l'école par la porte 6
// ou le passage, et voir la rue depuis l'intérieur. Restent à venir (le relevé les décrit tous) : les totems « iris »,
// les jardinières, les bancs, les poubelles, les vélos et leur station de réparation, les voitures garées, les drapeaux.
// Coordonnées du PLAN (voir js/carte_ecole.js) : y < 0 = dehors ; le trottoir est au niveau du hall, la chaussée 12 cm
// plus bas (une dalle du monde solide).
import * as THREE from 'three';
import { canvasTex, detailPhoto } from './kit_decor.js';
import { maille, boiteM } from './ecole_portes.js';
import { jourDehors } from './ecole_matieres.js';

const X0 = -20, X1 = 45;                     // de l'impasse au carrefour
const Y_TROTTOIR = -2.8, Y_CHAUSSEE = -8.15, Y_FACE = -10;
const H_CHAUSSEE = -0.12;

// L'ENROBÉ : un gris uni, des reprises plus sombres, un grain fin (le détail photographique du béton par-dessus)
function texEnrobe(hex, graine) {
  const r = (hex >> 16) & 255, g0 = (hex >> 8) & 255, b = hex & 255;
  let x = graine; const rnd = () => { x = (x * 16807) % 2147483647; return x / 2147483647; };
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = `rgb(${r},${g0},${b})`; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 14; k++) {
      const d = -14 + rnd() * 10;
      g.fillStyle = `rgba(${r + d},${g0 + d},${b + d},0.35)`; g.fillRect(rnd() * w, rnd() * h, 40 + rnd() * 160, 30 + rnd() * 120);
    }
    for (let k = 0; k < 9000; k++) { const v = r - 30 + rnd() * 60; g.fillStyle = `rgba(${v},${v},${v + 2},0.35)`; g.fillRect(rnd() * w, rnd() * h, 1.5, 1.5); }
  }, [1 / 4, 1 / 4], false, 8);
}
// UNE FAÇADE D'IMMEUBLE dessinée (une travée x un étage par tuile) : fond, fenêtre, appui, garde-corps éventuel
function texFacade({ fond, cadre = '#2b282a', verre = '#4d5a66', travee = 1.8, etage = 3.0, fl = 1.2, fh = 1.6, balcon = false, bandeau = null, persiennes = null }) {
  const W = 256, H = Math.round(W * etage / travee);
  return canvasTex(W, H, (g, w, h) => {
    const mx = w / travee, my = h / etage;
    g.fillStyle = fond; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 600; k++) { g.fillStyle = `rgba(${Math.random() < 0.5 ? '0,0,0' : '255,255,255'},0.04)`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    if (bandeau) { g.fillStyle = bandeau; g.fillRect(0, h - 0.35 * my, w, 0.35 * my); g.fillRect(0, 0, w, 0.12 * my); }
    const x = (w - fl * mx) / 2, y = h - (0.9 + fh) * my;
    g.fillStyle = cadre; g.fillRect(x - 3, y - 3, fl * mx + 6, fh * my + 6);
    const gr = g.createLinearGradient(0, y, 0, y + fh * my); gr.addColorStop(0, '#a9b8c6'); gr.addColorStop(0.5, verre); gr.addColorStop(1, '#2c333b');
    g.fillStyle = gr; g.fillRect(x, y, fl * mx, fh * my);
    g.fillStyle = cadre; g.fillRect(x + fl * mx / 2 - 2, y, 4, fh * my);
    if (persiennes) { g.fillStyle = persiennes; g.fillRect(x - 0.35 * mx, y, 0.3 * mx, fh * my); g.fillRect(x + fl * mx + 0.05 * mx, y, 0.3 * mx, fh * my); }
    if (balcon) { g.fillStyle = '#1f1f1f'; for (let i = 0; i < 14; i++) g.fillRect(x - 6 + i * (fl * mx + 12) / 13, y + fh * my * 0.55, 2, fh * my * 0.45); g.fillRect(x - 8, y + fh * my * 0.55, fl * mx + 16, 3); }
    g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(x - 6, y + fh * my + 3, fl * mx + 12, 4);
  }, [1 / travee, 1 / etage], false, 4);
}

export function poserRue(ch) {
  const { M, C } = ch;
  // (toutes les matières de la rue reçoivent le jour du ciel couvert : js/ecole_matieres.js jourDehors)
  const std = (o) => jourDehors(new THREE.MeshStandardMaterial(o), 0.12);
  // ---- le sol : trottoir, bordures, chaussée, trottoir d'en face ----
  const trottoir = std({ map: texEnrobe(0x858385, 7), roughness: 0.9 });
  const chaussee = std({ map: texEnrobe(0x727173, 11), roughness: 0.92 });
  for (const m of [trottoir, chaussee]) detailPhoto(m, 'beton', 4, 4, { relief: 0.5, grain: 0.15, rugo: true });
  const granit = std({ color: 0xa0a09b, roughness: 0.75 });
  const plan = (x0, y0, x1, y1, h, mat) => {
    const g = new THREE.PlaneGeometry(x1 - x0, y1 - y0); g.rotateX(-Math.PI / 2);
    const uv = g.attributes.uv, p = g.attributes.position;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, p.getX(i) + (x0 + x1) / 2, -p.getZ(i) + (y0 + y1) / 2);
    const m = maille(g, mat, (x0 + x1) / 2, h, -(y0 + y1) / 2, 0, ch.scene, { ombre: false });
    m.userData.nofuse = true;
    return m;
  };
  plan(X0, Y_TROTTOIR, X1, -0.4, 0, trottoir);
  plan(X0, Y_CHAUSSEE, X1, Y_TROTTOIR - 0.15, H_CHAUSSEE, chaussee);
  plan(X0, Y_FACE, X1, Y_CHAUSSEE - 0.15, 0, trottoir);
  for (const y of [Y_TROTTOIR, Y_CHAUSSEE]) ch.boite(X0, y - 0.15, X1, y, H_CHAUSSEE, 0, granit, { ombre: false });
  // la chaussée, 12 cm sous le trottoir : une dalle pour le joueur ; les bordures se franchissent (une marche)
  C.sol(X0, -(Y_TROTTOIR - 0.15), X1, -(Y_CHAUSSEE), H_CHAUSSEE);
  // les lignes blanches effacées de la file de stationnement (côté sud) et le rond d'interdiction près du passage
  const peinture = std({ color: 0xe8e8e6, roughness: 0.8, transparent: true, opacity: 0.55, depthWrite: false });
  ch.boite(X0, Y_CHAUSSEE + 2.0, X1, Y_CHAUSSEE + 2.1, H_CHAUSSEE + 0.003, H_CHAUSSEE + 0.004, peinture, { ombre: false });
  for (let x = -8; x < 40; x += 5) ch.boite(x, Y_CHAUSSEE, x + 0.1, Y_CHAUSSEE + 2.0, H_CHAUSSEE + 0.003, H_CHAUSSEE + 0.004, peinture, { ombre: false });

  // ---- les façades ----
  const facade = (x0, y0, x1, y1, h, mat, { collision = true } = {}) => {
    const m = ch.boite(x0, y0, x1, y1, 0, h, mat, { ombre: false, collision });
    m.userData.horsAOSol = true;
    return m;
  };
  // côté école : le n° 8 (ouest, haussmannien crème) et le n° 10 à l'angle de l'impasse ; le n° 4 (est, pierre), puis un
  // immeuble blanc aux jardinières de géraniums, puis des immeubles crème jusqu'au carrefour
  const creme = std({ map: texFacade({ fond: '#e3dccf', cadre: '#f2efe8', verre: '#56626e', travee: 1.9, etage: 3.0, balcon: true }), roughness: 0.85 });
  const pierre4 = std({ map: texFacade({ fond: '#c9c0b5', cadre: '#efece6', verre: '#505c68', travee: 2.0, etage: 3.1, balcon: true }), roughness: 0.85 });
  const blanc = std({ map: texFacade({ fond: '#efefe8', cadre: '#ffffff', verre: '#56626e', travee: 1.9, etage: 2.9, persiennes: '#dfe3d8' }), roughness: 0.85 });
  facade(X0 - 6, -0.4, -0.3, 14, 19, creme);
  facade(20.1, -0.4, 30, 14, 20, pierre4);
  facade(30, -0.4, 38, 14, 17, blanc);
  facade(38, -0.4, X1 + 0.5, 14, 19, creme);
  // en face : le 5/7 (enduit blanc, bandeaux de mélèze), le jardin derrière sa grille, le bloc des années 60 derrière ;
  // vers le carrefour, des immeubles crème
  const moderne = std({ map: texFacade({ fond: '#ece8de', cadre: '#b08a5e', verre: '#5b6874', travee: 2.4, etage: 3.0, fl: 1.9, fh: 1.4, bandeau: '#b08a5e' }), roughness: 0.8 });
  const annees60 = std({ map: texFacade({ fond: '#e9e6df', cadre: '#ffffff', verre: '#4f5b66', travee: 2.6, etage: 2.8, fl: 2.0, fh: 1.4, balcon: true }), roughness: 0.85 });
  facade(X0 - 6, Y_FACE - 14, 9, Y_FACE, 18, moderne);
  facade(9, Y_FACE - 30, 30, Y_FACE - 16, 24, annees60);
  facade(30, Y_FACE - 14, X1 + 0.5, Y_FACE, 19, creme);
  // le jardin : muret de 0,5 m, grille noire de 2 m doublée de brande ; quelques arbres qui débordent sur la rue
  const brande = std({ color: 0x4a3f35, roughness: 1 });
  ch.boite(9, Y_FACE - 0.3, 30, Y_FACE, 0, 0.5, granit, { collision: true });
  ch.boite(9, Y_FACE - 0.25, 30, Y_FACE - 0.2, 0.5, 2.5, brande, { ombre: false });
  for (let x = 9.05; x < 30; x += 0.14) ch.boite(x, Y_FACE - 0.04, x + 0.02, Y_FACE - 0.02, 0.5, 2.55, M.barreaux, { ombre: false });
  C.ajouterBoite(9, -(Y_FACE - 0.3), 30, -Y_FACE + 0.05, { y1: 2.6 });
  const feuillage = std({ color: 0x4f6b3a, roughness: 0.95, flatShading: true });
  const tronc = std({ color: 0x5b4a3c, roughness: 1 });
  for (const [x, y, r, h] of [[13, -12.5, 3.2, 9], [20.5, -13, 3.8, 10.5], [26, -12.2, 2.8, 8.5]]) {
    maille(new THREE.CylinderGeometry(0.22, 0.3, h * 0.6, 8), tronc, x, h * 0.3, -y, 0, ch.decor, { ombre: false });
    const c = maille(new THREE.IcosahedronGeometry(r, 1), feuillage, x, h * 0.75, -y, 0, ch.decor, { ombre: false });
    c.scale.y = 0.8; c.userData.horsAOSol = true;
  }
  // L'IMPASSE (ouest) : grille noire sur un muret, des pots de plantes devant, des arbres derrière
  ch.boite(X0 - 0.3, Y_FACE, X0, -0.4, 0, 0.5, granit, { collision: true });
  for (let y = Y_FACE + 0.1; y < -0.4; y += 0.14) ch.boite(X0 - 0.17, y, X0 - 0.15, y + 0.02, 0.5, 2.5, M.barreaux, { ombre: false });
  ch.boite(X0 - 0.2, Y_FACE, X0 - 0.12, -0.4, 2.45, 2.5, M.barreaux, { ombre: false });
  C.ajouterBoite(X0 - 0.3, -(-0.4), X0, -Y_FACE, { y1: 2.6 });
  for (const [y, r] of [[-3, 3.4], [-7, 3.0]]) {
    maille(new THREE.CylinderGeometry(0.25, 0.32, 5, 8), tronc, X0 - 4, 2.5, -y, 0, ch.decor, { ombre: false });
    maille(new THREE.IcosahedronGeometry(r, 1), feuillage, X0 - 4, 6.5, -y, 0, ch.decor, { ombre: false }).userData.horsAOSol = true;
  }
  facade(X0 - 12, Y_FACE - 10, X0 - 6, 14, 22, annees60, { collision: false });
  // LE CARREFOUR (est) : la rue transversale et l'immeuble crème d'en face ; on s'arrête au bord du carrefour
  plan(X1, -30, X1 + 14, 14, H_CHAUSSEE, chaussee);
  facade(X1 + 14, -30, X1 + 24, 20, 20, creme, { collision: false });
  C.ajouterBoite(X1 - 0.5, -(-0.4), X1, -Y_FACE, { y1: 3 });
  // (les façades d'en face et des voisins sont solides : la rue est fermée de partout)
}
