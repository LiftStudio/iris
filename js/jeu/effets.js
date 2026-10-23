// =====================================================================
//  LES EFFETS DU JEU — lot L-H (23/10/2026 ; spec §§ 3.6, 4.5.17, 5.5.12 ; conception_cod § 7 ; carte_props § 5 ; vague 3 : L-Q)
// =====================================================================
// Ce qu'on VOIT des tirs : impacts (trous, peinture en Airsoft, fêlures des vitres, brûlures des explosions), traceurs,
// douilles, éclairs de bouche, étincelles et poussières, explosions et fumées, grenades en vol ; et deux choses que les
// règles décrivent sans les dessiner : les anneaux de la domination (`hud.points`) et les cibles en carton du stand
// (`hud.cibles`). Tout est en POOLS : un InstancedMesh chacun, créé une fois par session et COMPILÉ à la préparation
// (Player.preparerRendu, puis la scène — aucun programme neuf en pleine manche), enfant DIRECT de la scène,
// `dynamique` (hors des cuissons, des cartes d'environnement, des ombres de contact, de la coupe par zones), sans ombre,
// `frustumCulled = false` (la sphère d'un InstancedMesh ne suit pas ses instances) ; posé dans la scène à la préparation,
// RETIRÉ à la sortie (la balade retrouve ses enfants). Chaque pool = UN appel de dessin (rien quand il est vide).
// AUCUNE LUMIÈRE dans la scène de jeu (une de plus : 27 s d'image figée, carte_props § 5.4) : les éclairs, traceurs,
// étincelles et le cœur des explosions sont des quads additifs `toneMapped: false` que le bloom fait briller.
// Les abonnés ne font que NOTER l'événement : tout est fabriqué dans `maj` (une fois par image, après la caméra), quand
// tous les événements du pas sont là — un impact y retrouve le tir qui l'a fait (le même pas, sur son rayon : la
// couleur de l'équipe du tireur pour la peinture, le bout du traceur). Le monde solide n'est lu qu'ici, jamais dans un
// rappel d'une autre requête. Impacts (spec § 4.5.17) : quads alignés sur la normale de la balle, SEULEMENT sur les formes
// hautes (y1 − y0 > 1,8, ou `joueur === false` : les plafonds) et jamais sur un vantail (il bouge) ni un meuble (ses
// formes sont grossières : un décalque flotterait devant la chaise) ; ailleurs une gerbe (sol : poussière ; vitre :
// fêlure + éclats) ; effacés par rétrécissement après 25 s, ou par l'anneau (le plus vieux recyclé). Traceurs : une balle
// sur trois de Haythem, toutes celles des bots (on voit d'où ça tire), un trait de 2,5 m à 400 m/s. Douilles : œil +
// (0,12 droite, −0,08 bas, 0,35 avant), deux rebonds, « tink » (js/jeu/sons_jeu.js). Éclairs : quads croisés, 3 images,
// à la bouche (`acteur.aff.bouche`, posée par L-C) — pas pour Haythem en vue FPS : son arme de vue a le sien (L-V).
// HABILLAGE (réglage jeu.habillage) : AIRSOFT par défaut — peinture à la couleur de l'équipe du tireur au lieu des trous,
// éclairs ternes (le gaz), traceurs aux couleurs des équipes, pas de douilles (une réplique à gaz n'en éjecte pas), la
// grenade en nuage de poudre ; MILITAIRE : les trous, les douilles, le feu. Jamais de sang (§ 3.6, R33).
// L'option « Priorité fluidité » (jeu.fluidite) est posée sur js/fx.js (`fluidite`) tant que les effets sont branchés.
import * as THREE from 'three';
import { TELEPHONE } from '../appareil.js';
import { EQUIPES } from './constantes.js';
import { Rng } from './rng.js';
import { Player } from '../player.js';
import { MEUBLES } from '../registre_meubles.js';

// LES CHIFFRES DES EFFETS (§§ 3.6, 3.10, 4.5.17 ; les autres réglés à l'œil, 23/10)
export const REGLAGES_EFFETS = {
  pools: TELEPHONE ? { impacts: 96, traceurs: 16, douilles: 24, eclairs: 8, etincelles: 48, explosion: 40, grenades: 6, anneaux: 9, cibles: 12 }
    : { impacts: 256, traceurs: 32, douilles: 64, eclairs: 16, etincelles: 128, explosion: 96, grenades: 8, anneaux: 9, cibles: 12 },
  impact: { trou: 0.09, peinture: [0.12, 0.19], felure: 0.26, brulure: 1.3, vie: 25, effacement: 1, decalage: 0.002, hautMin: 1.8 },
  traceur: { vitesse: 400, longueur: 2.5, largeur: 0.016, parMetre: 0.0016, uneSur: 3, portee: 120 },
  douille: { droite: 0.12, bas: 0.08, avant: 0.35, vitesse: [1.8, 1.2, 0.3], restitution: 0.3, rebonds: 2, vie: 3, distance: 15 },
  // (tailles relevées au navigateur le 23/10 : à 3 m, un éclair de 14 cm vu de face n'était qu'un point)
  eclair: { images: 3, taille: { fa24: 0.22, pm9: 0.18, fp12: 0.28, tp50: 0.3, p17: 0.15 } },
  // la correspondance impact ↔ tir du même pas : l'impact à moins de 12° du rayon du tir
  appariement: Math.cos(12 * Math.PI / 180),
  gravite: 9.81,
};
// les couleurs (linéaires ; au-delà de 1, le bloom les fait briller)
const COUL = {
  eclair: [5.5, 3.3, 1.3], eclairGaz: [1.1, 1.25, 1.45], traceur: [4.2, 3.0, 1.5], etincelle: [5, 2.8, 1.1], verre: [1.6, 1.9, 2.2],
  // (fumée plus sombre et feu plus vif : vus au navigateur le 23/10, un gris de 0,32 sur un mur blanc ne se voyait presque pas)
  feu: [6, 2.4, 0.6], fumee: [0.13, 0.125, 0.12], poussiere: [0.5, 0.47, 0.42], platre: [0.78, 0.76, 0.72], tissu: [0.5, 0.46, 0.4],
  eclat: [0.85, 0.92, 1], brule: [1, 1, 1], trou: [1, 1, 1], neutre: [0.95, 0.88, 0.3], laiton: [0.79, 0.62, 0.3], cartouche: [0.62, 0.08, 0.06],
  frag: [0.22, 0.26, 0.16], flash: [0.42, 0.44, 0.46], blanc: [3.2, 3.2, 3.4],
};
// une couleur d'acteur : son équipe ; chacun pour soi (pas d'équipe) : une couleur par acteur
const PALETTE = ['#ff5a4f', '#3d8bff', '#7ed957', '#ffcf3d', '#c56bff', '#21d4c2', '#ff8a1f', '#ff6fb5'];
const _c = new THREE.Color();
function couleurActeur(a) {
  const e = a && a.equipe && EQUIPES[a.equipe];
  _c.set(e ? e.couleur : a ? PALETTE[(a.id | 0) % PALETTE.length] : '#f2e04a');
  return [_c.r, _c.g, _c.b];
}

// ---------------------------------------------------------------- les textures (canevas, une fois par session)
function canevas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }
function texture(c) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.needsUpdate = true;
  return t;
}
// la case k d'un atlas 2 × 2 de 256 : son coin dans le canevas (la case 0 en bas à gauche, comme l'UV)
const CASE = (k) => [(k % 2) * 128, 128 - (k >> 1) * 128];
// l'UV de départ de la case k (aFx.xy)
const UV = (k) => [(k % 2) * 0.5, (k >> 1) * 0.5];
function blob(g, R, cx, cy, r, n, irr) {
  g.beginPath();
  for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI * 2, rr = r * (1 - irr + irr * 2 * R.next()); const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr; if (i) g.lineTo(x, y); else g.moveTo(x, y); }
  g.closePath();
}
// LES IMPACTS : 0 le trou (cratère sombre, éclats clairs autour, fissures), 1 la peinture (blanche, teinte par l'instance),
// 2 la fêlure d'une vitre, 3 la brûlure d'une explosion
function atlasImpacts() {
  const [c, g] = canevas(256, 256), R = new Rng(7);
  { const [x, y] = CASE(0), cx = x + 64, cy = y + 64;
    // (23/10, vu au navigateur : un cœur noir de 2 cm et un liseré clair ne se voyaient pas sur le plâtre blanc à plus de
    // 2 m — le cratère est plus large, ourlé d'un halo gris de poussière brûlée, les fissures plus longues)
    g.save(); g.filter = 'blur(1.2px)';
    const halo = g.createRadialGradient(cx, cy, 10, cx, cy, 52); halo.addColorStop(0, 'rgba(70,64,58,0.55)'); halo.addColorStop(1, 'rgba(70,64,58,0)');
    g.fillStyle = halo; blob(g, R, cx, cy, 50, 20, 0.3); g.fill();
    const gr = g.createRadialGradient(cx, cy, 4, cx, cy, 30); gr.addColorStop(0, 'rgba(8,7,6,1)'); gr.addColorStop(0.55, 'rgba(32,29,26,0.95)'); gr.addColorStop(1, 'rgba(60,55,50,0)');
    g.fillStyle = gr; blob(g, R, cx, cy, 30, 14, 0.28); g.fill();
    g.strokeStyle = 'rgba(28,25,22,0.85)'; g.lineWidth = 1.8;
    for (let i = 0; i < 7; i++) { const a = R.next() * 6.28, l = 26 + R.next() * 32; g.beginPath(); g.moveTo(cx + Math.cos(a) * 12, cy + Math.sin(a) * 12); g.lineTo(cx + Math.cos(a + 0.18) * l * 0.6, cy + Math.sin(a + 0.18) * l * 0.6); g.lineTo(cx + Math.cos(a) * l, cy + Math.sin(a) * l); g.stroke(); }
    g.fillStyle = 'rgba(0,0,0,1)'; g.beginPath(); g.arc(cx, cy, 10, 0, 6.28); g.fill(); g.restore(); }
  { const [x, y] = CASE(1), cx = x + 64, cy = y + 64;
    g.save(); g.filter = 'blur(0.8px)'; g.fillStyle = '#ffffff';
    blob(g, R, cx, cy, 30, 22, 0.22); g.fill();
    for (let i = 0; i < 9; i++) { const a = R.next() * 6.28, d = 22 + R.next() * 18, r = 6 + R.next() * 9; g.beginPath(); g.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, r, 0, 6.28); g.fill(); }
    for (let i = 0; i < 12; i++) { const a = R.next() * 6.28, d = 42 + R.next() * 18, r = 1.5 + R.next() * 3.5; g.beginPath(); g.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, r, 0, 6.28); g.fill(); }
    // (le cœur plus dense : la bille a éclaté là)
    g.globalCompositeOperation = 'source-atop'; const gr = g.createRadialGradient(cx, cy, 0, cx, cy, 30); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(225,225,225,1)'); g.fillStyle = gr; g.fillRect(x, y, 128, 128);
    g.restore(); }
  { const [x, y] = CASE(2), cx = x + 64, cy = y + 64;
    g.save(); g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 1.3;
    for (let i = 0; i < 11; i++) { let a = (i / 11) * 6.28 + R.next() * 0.4, px = cx, py = cy; g.beginPath(); g.moveTo(px, py); for (let s = 0; s < 5; s++) { a += (R.next() - 0.5) * 0.4; const l = 8 + R.next() * 9; px += Math.cos(a) * l; py += Math.sin(a) * l; g.lineTo(px, py); } g.stroke(); }
    g.lineWidth = 1;
    for (const r0 of [14, 30]) { g.beginPath(); for (let i = 0; i <= 14; i++) { const a = (i / 14) * 6.28, r = r0 * (0.85 + R.next() * 0.3); if (i) g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); else g.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } g.stroke(); }
    const gr = g.createRadialGradient(cx, cy, 0, cx, cy, 9); gr.addColorStop(0, 'rgba(255,255,255,0.95)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(cx - 10, cy - 10, 20, 20);
    g.restore(); }
  { const [x, y] = CASE(3), cx = x + 64, cy = y + 64;
    g.save(); g.filter = 'blur(2px)';
    for (let i = 0; i < 26; i++) { const a = R.next() * 6.28, d = R.next() * 38, r = 10 + R.next() * 18, gr = g.createRadialGradient(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 0, cx + Math.cos(a) * d, cy + Math.sin(a) * d, r);
      gr.addColorStop(0, 'rgba(8,7,6,0.35)'); gr.addColorStop(1, 'rgba(8,7,6,0)'); g.fillStyle = gr; g.fillRect(x, y, 128, 128); }
    g.restore(); }
  return texture(c);
}
// LES LUEURS (additives) : 0 le halo rond, 1 la traînée (étincelle, traceur), 2 l'étoile (le devant d'un éclair, la flash),
// 3 la flamme (les côtés d'un éclair)
function atlasLueurs() {
  const [c, g] = canevas(256, 256), R = new Rng(11);
  { const [x, y] = CASE(0), cx = x + 64, cy = y + 64, gr = g.createRadialGradient(cx, cy, 0, cx, cy, 62);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.18, 'rgba(255,255,255,0.75)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.18)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(x, y, 128, 128); }
  { const [x, y] = CASE(1);
    // (la traînée : vive vers u = 1, la tête ; en travers, un cœur étroit dans un halo qui remplit la case — le quad fait
    // la largeur voulue à l'écran)
    for (let i = 0; i < 128; i++) { const u = i / 127, e = Math.pow(Math.sin(Math.PI * Math.min(1, u * 1.08)), 0.5) * (0.3 + 0.7 * u);
      const gr = g.createLinearGradient(0, y + 8, 0, y + 120);
      gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.32, `rgba(255,255,255,${(e * 0.25).toFixed(3)})`); gr.addColorStop(0.5, `rgba(255,255,255,${e.toFixed(3)})`);
      gr.addColorStop(0.68, `rgba(255,255,255,${(e * 0.25).toFixed(3)})`); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.fillRect(x + i, y + 8, 1, 112); } }
  { const [x, y] = CASE(2), cx = x + 64, cy = y + 64;
    g.save(); g.translate(cx, cy);
    for (let i = 0; i < 8; i++) { g.rotate(Math.PI / 4 + (R.next() - 0.5) * 0.3); const l = 40 + R.next() * 22, gr = g.createLinearGradient(0, 0, l, 0); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.beginPath(); g.moveTo(0, -4); g.lineTo(l, 0); g.lineTo(0, 4); g.closePath(); g.fill(); }
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, 26); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(-30, -30, 60, 60);
    g.restore(); }
  { const [x, y] = CASE(3);
    // (la flamme sort de la bouche vers +u : large et vive à la base, effilée au bout)
    g.save(); g.filter = 'blur(1.5px)';
    for (let i = 0; i < 3; i++) { g.fillStyle = `rgba(255,255,255,${0.45 - i * 0.1})`; g.beginPath(); g.moveTo(x + 4, y + 64); const w = 22 - i * 5;
      g.bezierCurveTo(x + 30, y + 64 - w, x + 80, y + 64 - w * 0.6, x + 122 - i * 14, y + 64); g.bezierCurveTo(x + 80, y + 64 + w * 0.6, x + 30, y + 64 + w, x + 4, y + 64); g.fill(); }
    g.restore(); }
  return texture(c);
}
// LES FUMÉES (mélangées) : 0 la bouffée, 1 la poussière, 2 la goutte (peinture, éclat de verre), 3 le débris
function atlasFumees() {
  const [c, g] = canevas(256, 256), R = new Rng(13);
  for (const k of [0, 1]) {
    const [x, y] = CASE(k), cx = x + 64, cy = y + 64;
    for (let i = 0; i < (k ? 30 : 18); i++) { const a = R.next() * 6.28, d = R.next() * (k ? 30 : 26), r = (k ? 10 : 18) + R.next() * (k ? 14 : 18);
      const gr = g.createRadialGradient(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 0, cx + Math.cos(a) * d, cy + Math.sin(a) * d, r);
      const v = 200 + Math.floor(R.next() * 55); gr.addColorStop(0, `rgba(${v},${v},${v},${k ? 0.3 : 0.24})`); gr.addColorStop(1, `rgba(${v},${v},${v},0)`); g.fillStyle = gr; g.fillRect(x, y, 128, 128); }
  }
  { const [x, y] = CASE(2), cx = x + 64, cy = y + 64, gr = g.createRadialGradient(cx - 6, cy - 6, 0, cx, cy, 40);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.85, 'rgba(235,235,235,1)'); gr.addColorStop(1, 'rgba(235,235,235,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, 40, 0, 6.28); g.fill(); }
  { const [x, y] = CASE(3); g.fillStyle = '#ffffff'; blob(g, R, x + 64, y + 64, 40, 7, 0.45); g.fill(); }
  return texture(c);
}
// LES ANNEAUX DE LA DOMINATION : 0 l'anneau (bord vif, intérieur léger), 1-3 les lettres A, B, C
function atlasAnneaux() {
  const [c, g] = canevas(256, 256);
  { const [x, y] = CASE(0), cx = x + 64, cy = y + 64;
    const gi = g.createRadialGradient(cx, cy, 0, cx, cy, 58); gi.addColorStop(0, 'rgba(255,255,255,0.05)'); gi.addColorStop(0.85, 'rgba(255,255,255,0.16)'); gi.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gi; g.beginPath(); g.arc(cx, cy, 60, 0, 6.28); g.fill();
    g.strokeStyle = 'rgba(255,255,255,1)'; g.lineWidth = 5; g.beginPath(); g.arc(cx, cy, 58, 0, 6.28); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.45)'; g.lineWidth = 2; g.setLineDash([9, 7]); g.beginPath(); g.arc(cx, cy, 50, 0, 6.28); g.stroke(); g.setLineDash([]); }
  ['A', 'B', 'C'].forEach((L, i) => { const [x, y] = CASE(i + 1); g.fillStyle = '#ffffff'; g.font = 'bold 92px "Arial Black", Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(L, x + 64, y + 68); });
  return texture(c);
}
// LA CIBLE DU STAND : un carton brun, la silhouette imprimée (contour noir, zones claires) — la géométrie est la silhouette
// (même gabarit que ses panneaux de touche, js/jeu/touches.js : buste 0,5 × 1,3 m de 0,10 à 1,40, tête 0,24 × 0,28 à 1,46-1,74)
const CIBLE = { l: 0.5, h: 1.75 };
function textureCible() {
  const W = 256, H = 896, [c, g] = canevas(W, H), R = new Rng(17);
  const X = (x) => (x / CIBLE.l + 0.5) * W, Y = (y) => (1 - y / CIBLE.h) * H;
  g.fillStyle = '#b08658'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 2600; i++) { const v = R.next(); g.fillStyle = `rgba(${v < 0.5 ? '60,40,20' : '230,200,160'},${0.04 + R.next() * 0.06})`; g.fillRect(R.next() * W, R.next() * H, 1 + R.next() * 3, 1 + R.next() * 2); }
  // (les cannelures du carton ondulé, à peine)
  g.strokeStyle = 'rgba(80,55,30,0.06)'; g.lineWidth = 2; for (let y = 0; y < H; y += 9) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  // les zones : la tête, le buste en anneaux, le centre
  g.strokeStyle = '#141210'; g.lineWidth = 6;
  g.beginPath(); g.ellipse(X(0), Y(1.6), X(0.12) - X(0), Y(1.46) - Y(1.6), 0, 0, 6.28); g.stroke();
  g.fillStyle = 'rgba(245,238,225,0.85)'; g.beginPath(); g.ellipse(X(0), Y(1.6), (X(0.12) - X(0)) * 0.55, (Y(1.46) - Y(1.6)) * 0.55, 0, 0, 6.28); g.fill();
  for (const [k, a] of [[1, 0.9], [0.72, 0], [0.46, 0.9], [0.22, 0]]) {
    const w = (X(0.23) - X(0)) * k, h = (Y(0.35) - Y(1.0)) * k;
    g.fillStyle = a ? 'rgba(245,238,225,0.85)' : 'rgba(176,134,88,1)'; g.beginPath(); g.ellipse(X(0), Y(1.0), w, h, 0, 0, 6.28); g.fill();
    g.lineWidth = 3; g.stroke();
  }
  g.lineWidth = 3; g.beginPath(); g.moveTo(X(-0.03), Y(1.0)); g.lineTo(X(0.03), Y(1.0)); g.moveTo(X(0), Y(0.97)); g.lineTo(X(0), Y(1.03)); g.stroke();
  // le contour de la silhouette, imprimé au bord
  g.lineWidth = 10; g.strokeStyle = '#1b1814';
  g.beginPath(); g.moveTo(X(-0.25), Y(0.1)); g.lineTo(X(-0.25), Y(1.32)); g.quadraticCurveTo(X(-0.25), Y(1.4), X(-0.17), Y(1.4)); g.lineTo(X(-0.07), Y(1.4)); g.moveTo(X(0.07), Y(1.4));
  g.lineTo(X(0.17), Y(1.4)); g.quadraticCurveTo(X(0.25), Y(1.4), X(0.25), Y(1.32)); g.lineTo(X(0.25), Y(0.1)); g.stroke();
  // le pied : du bois
  g.fillStyle = '#7a5532'; g.fillRect(X(-0.025), Y(0.1), X(0.025) - X(-0.025), H - Y(0.1));
  g.fillStyle = 'rgba(20,18,16,0.85)'; g.font = 'bold 22px Arial, sans-serif'; g.textAlign = 'center'; g.fillText('IRIS · STAND', X(0), Y(0.22));
  return texture(c);
}
function geometrieCible() {
  const l = CIBLE.l / 2, S = [];
  const corps = new THREE.Shape(); corps.moveTo(-l, 0.1); corps.lineTo(l, 0.1); corps.lineTo(l, 1.32); corps.quadraticCurveTo(l, 1.4, l - 0.08, 1.4);
  corps.lineTo(-l + 0.08, 1.4); corps.quadraticCurveTo(-l, 1.4, -l, 1.32); corps.closePath(); S.push(corps);
  const cou = new THREE.Shape(); cou.moveTo(-0.07, 1.39); cou.lineTo(0.07, 1.39); cou.lineTo(0.07, 1.48); cou.lineTo(-0.07, 1.48); cou.closePath(); S.push(cou);
  const tete = new THREE.Shape(); tete.absellipse(0, 1.6, 0.12, 0.14, 0, Math.PI * 2, false, 0); S.push(tete);
  const pied = new THREE.Shape(); pied.moveTo(-0.025, 0); pied.lineTo(0.025, 0); pied.lineTo(0.025, 0.11); pied.lineTo(-0.025, 0.11); pied.closePath(); S.push(pied);
  const geo = new THREE.ShapeGeometry(S, 6), p = geo.attributes.position, uv = geo.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / CIBLE.l + 0.5, p.getY(i) / CIBLE.h);
  return geo;
}
// L'ÉCLAIR : deux quads croisés le long du canon (la flamme, case 3) et un quad de face (l'étoile, case 2) — l'UV de chaque
// quad déjà dans sa case (le matériau des lueurs multiplie par 0,5 et ajoute aFx.xy = 0 pour ce pool)
function geometrieEclair() {
  // (repère de l'instance : −Z vers l'avant du tir. Le matériau des lueurs fait vMapUv × 0,5 + aFx.xy, et aFx.xy = 0 pour
  // ce pool : un UV de 1 à 2 tombe dans la case 3 (la flamme), un u de 0 à 1 et un v de 1 à 2 dans la case 2 (l'étoile))
  const P = [], U = [], I = [];
  const quad = (a, b, c, d, u0, v0, u1, v1) => { const k = P.length / 3; P.push(...a, ...b, ...c, ...d); U.push(u0, v0, u1, v0, u1, v1, u0, v1); I.push(k, k + 1, k + 2, k, k + 2, k + 3); };
  // les deux flammes croisées, de la bouche (z 0, la base : u 1) à la pointe (z −1 : u 2)
  quad([0, -0.5, 0], [0, -0.5, -1], [0, 0.5, -1], [0, 0.5, 0], 1.02, 1.02, 1.98, 1.98);
  quad([-0.5, 0, 0], [-0.5, 0, -1], [0.5, 0, -1], [0.5, 0, 0], 1.02, 1.02, 1.98, 1.98);
  // l'étoile, de face, juste devant la bouche
  quad([-0.45, -0.45, -0.02], [0.45, -0.45, -0.02], [0.45, 0.45, -0.02], [-0.45, 0.45, -0.02], 0.02, 1.02, 0.98, 1.98);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
  g.setIndex(I);
  g.computeVertexNormals();
  return g;
}

// ---------------------------------------------------------------- les matériaux instanciés
// aFx (par instance) : xy = l'UV de la case de l'atlas, z = l'opacité ; la case fait `cellule` de l'atlas
function instancier(mat, cellule) {
  const c = cellule.toFixed(4);
  mat.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec4 aFx;\nvarying float vFxA;')
      .replace('#include <uv_vertex>', `#include <uv_vertex>\n#ifdef USE_MAP\n\tvMapUv = vMapUv * ${c} + aFx.xy;\n#endif\n\tvFxA = aFx.z;`);
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vFxA;')
      .replace('#include <alphamap_fragment>', '#include <alphamap_fragment>\n\tdiffuseColor.a *= vFxA;');
  };
  mat.customProgramCacheKey = () => 'iris-effets-aFx-' + c;
  return mat;
}
function poolMesh(geo, mat, n, nom, { couleur = true, fx = true } = {}) {
  if (fx) geo.setAttribute('aFx', new THREE.InstancedBufferAttribute(new Float32Array(n * 4), 4).setUsage(THREE.DynamicDrawUsage));
  const m = new THREE.InstancedMesh(geo, mat, n);
  m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  if (couleur) { for (let i = 0; i < n; i++) m.setColorAt(i, _c.setRGB(1, 1, 1)); m.instanceColor.setUsage(THREE.DynamicDrawUsage); }
  for (let i = 0; i < n; i++) m.setMatrixAt(i, ZERO);
  m.count = n; m.frustumCulled = false; m.castShadow = false; m.receiveShadow = false;
  m.userData.dynamique = true; m.userData.effets = true; m.name = 'effets : ' + nom;
  // (transparent : hors de la passe de normales de l'occlusion — js/fx.js _decoupes —, sinon un quad plein y laisse un carré)
  if (mat.transparent) m.userData.sansNormales = true;
  m.renderOrder = 4;
  return m;
}
const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _e = new THREE.Euler();
const _v = new THREE.Vector3(), _w = new THREE.Vector3(), _n = new THREE.Vector3(), _s = new THREE.Vector3(), _Z = new THREE.Vector3(0, 0, 1);
const _cam = { x: 0, y: 0, z: 0, rx: 1, ry: 0, rz: 0, ux: 0, uy: 1, uz: 0, fx: 0, fy: 0, fz: -1 };
// une matrice d'instance écrite à la main : colonnes X, Y, Z et la position
function ecrire(a, i, xx, xy, xz, yx, yy, yz, zx, zy, zz, px, py, pz) {
  const o = i * 16;
  a[o] = xx; a[o + 1] = xy; a[o + 2] = xz; a[o + 3] = 0; a[o + 4] = yx; a[o + 5] = yy; a[o + 6] = yz; a[o + 7] = 0;
  a[o + 8] = zx; a[o + 9] = zy; a[o + 10] = zz; a[o + 11] = 0; a[o + 12] = px; a[o + 13] = py; a[o + 14] = pz; a[o + 15] = 1;
}
function effacer(a, i) { const o = i * 16; for (let k = 0; k < 16; k++) a[o + k] = 0; a[o + 15] = 1; }

// ---------------------------------------------------------------- les PARTICULES (lueurs additives ou fumées mélangées)
// une particule : position, vitesse, âge, vie, taille de départ et d'arrivée, rotation, gravité, freinage, traînée (étirée
// le long de sa vitesse : une étincelle), opacité de départ, sa case et sa couleur
class Particules {
  constructor(mesh) {
    this.mesh = mesh; const n = mesh.count; this.n = n; this.k = 0; this.vivantes = 0;
    this.p = new Float32Array(n * 3); this.v = new Float32Array(n * 3);
    this.age = new Float32Array(n); this.vie = new Float32Array(n);
    this.t0 = new Float32Array(n); this.t1 = new Float32Array(n); this.rot = new Float32Array(n); this.grav = new Float32Array(n);
    this.frein = new Float32Array(n); this.trainee = new Float32Array(n); this.a0 = new Float32Array(n); this.cas = new Uint8Array(n);
    this.fx = mesh.geometry.attributes.aFx;
  }
  emettre(x, y, z, vx, vy, vz, vie, t0, t1, coul, { cas = 0, a0 = 1, grav = 0, frein = 0, trainee = 0, rot = Math.random() * 6.28 } = {}) {
    const i = this.k; this.k = (this.k + 1) % this.n;
    if (!(this.age[i] < this.vie[i])) this.vivantes++;
    this.p[i * 3] = x; this.p[i * 3 + 1] = y; this.p[i * 3 + 2] = z; this.v[i * 3] = vx; this.v[i * 3 + 1] = vy; this.v[i * 3 + 2] = vz;
    this.age[i] = 0; this.vie[i] = vie; this.t0[i] = t0; this.t1[i] = t1; this.rot[i] = rot; this.grav[i] = grav; this.frein[i] = frein; this.trainee[i] = trainee; this.a0[i] = a0; this.cas[i] = cas;
    this.mesh.setColorAt(i, _c.setRGB(coul[0], coul[1], coul[2]));
    this.mesh.instanceColor.needsUpdate = true;
    const [u, w] = UV(cas); this.fx.setXYZW(i, u, w, a0, 0);
    return i;
  }
  vider() { this.age.fill(0); this.vie.fill(0); this.vivantes = 0; const a = this.mesh.instanceMatrix.array; for (let i = 0; i < this.n; i++) effacer(a, i); this.mesh.instanceMatrix.needsUpdate = true; this.mesh.visible = false; }
  maj(dt) {
    const a = this.mesh.instanceMatrix.array, F = this.fx.array, C = _cam;
    let n = 0;
    for (let i = 0; i < this.n; i++) {
      if (!(this.age[i] < this.vie[i])) continue;
      this.age[i] += dt;
      if (this.age[i] >= this.vie[i]) { effacer(a, i); continue; }
      n++;
      const j = i * 3, k = this.age[i] / this.vie[i], fr = this.frein[i] ? Math.exp(-this.frein[i] * dt) : 1;
      this.v[j + 1] -= this.grav[i] * dt; this.v[j] *= fr; this.v[j + 1] *= fr; this.v[j + 2] *= fr;
      const px = (this.p[j] += this.v[j] * dt), py = (this.p[j + 1] += this.v[j + 1] * dt), pz = (this.p[j + 2] += this.v[j + 2] * dt);
      const t = this.t0[i] + (this.t1[i] - this.t0[i]) * (1 - (1 - k) * (1 - k));
      F[i * 4 + 2] = this.a0[i] * (k < 0.15 ? 1 : 1 - (k - 0.15) / 0.85);
      // le regard de la caméra vers la particule
      let fx = px - C.x, fy = py - C.y, fz = pz - C.z; const fl = Math.hypot(fx, fy, fz) || 1; fx /= fl; fy /= fl; fz /= fl;
      if (this.trainee[i] > 0) {
        // ÉTIRÉE le long de sa vitesse (vue de face) : X = la vitesse sans sa part vers l'œil, Y = Z × X
        const vx = this.v[j], vy = this.v[j + 1], vz = this.v[j + 2], vit = Math.hypot(vx, vy, vz);
        let xx = vx - (vx * fx + vy * fy + vz * fz) * fx, xy = vy - (vx * fx + vy * fy + vz * fz) * fy, xz = vz - (vx * fx + vy * fy + vz * fz) * fz;
        const xl = Math.hypot(xx, xy, xz);
        if (xl < 1e-6) { xx = C.rx; xy = C.ry; xz = C.rz; } else { xx /= xl; xy /= xl; xz /= xl; }
        const yx = -fy * xz + fz * xy, yy = -fz * xx + fx * xz, yz = -fx * xy + fy * xx;
        // (la largeur : au moins ≈ 1,5 px à l'écran — le cœur de la traînée fait un tiers de la case)
        const W = Math.max(t, fl * 0.0035), L = Math.max(W * 1.5, t + vit * this.trainee[i]);
        ecrire(a, i, xx * L, xy * L, xz * L, yx * W, yy * W, yz * W, -fx, -fy, -fz, px - xx * L * 0.35, py - xy * L * 0.35, pz - xz * L * 0.35);
      } else {
        // FACE À LA CAMÉRA, tournée de `rot`
        const c = Math.cos(this.rot[i]) * t, s = Math.sin(this.rot[i]) * t;
        ecrire(a, i, C.rx * c + C.ux * s, C.ry * c + C.uy * s, C.rz * c + C.uz * s, -C.rx * s + C.ux * c, -C.ry * s + C.uy * c, -C.rz * s + C.uz * c, -C.fx, -C.fy, -C.fz, px, py, pz);
      }
    }
    this.vivantes = n;
    this.mesh.visible = n > 0;
    if (n || this._avant) { this.mesh.instanceMatrix.needsUpdate = true; this.fx.needsUpdate = true; }
    this._avant = n > 0;
  }
}

// ---------------------------------------------------------------- Effets
export class Effets {
  constructor(game) {
    this.game = game; this.partie = null; this._des = [];
    this._file = []; this.pools = null; this.racines = [];
    this._kImp = 0; this._tirs = []; this._trajets = []; this._points = []; this._douillesAttente = []; this._cibAff = new Map(); this._grenVues = new Map(); this._image = 0;
    this.t = 0; this.stats = { impacts: 0, decalques: 0, gerbes: 0, traceurs: 0, douilles: 0, eclairs: 0, explosions: 0 };
  }

  // ---------------------------------------------------------------- les pools (une fois par session)
  _creer() {
    if (this.pools) return this.pools;
    const N = REGLAGES_EFFETS.pools;
    const tImp = atlasImpacts(), tLue = atlasLueurs(), tFum = atlasFumees(), tAnn = atlasAnneaux(), tCib = textureCible();
    this.textures = [tImp, tLue, tFum, tAnn, tCib];
    // (les transparents à deux faces en UNE passe — `forceSinglePass` : three les dessine sinon deux fois, dos puis face)
    // les matériaux : les impacts éclairés comme le mur (le trou est sombre, la peinture brille un peu), les lueurs
    // additives sans tonalité (le bloom), les fumées mélangées, les douilles et les grenades en métal, la cible en carton
    const mImp = instancier(new THREE.MeshStandardMaterial({ map: tImp, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4,
      roughness: 0.82, metalness: 0 }), 0.5);
    mImp.name = 'effets : impacts';
    const mLue = instancier(new THREE.MeshBasicMaterial({ map: tLue, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, fog: false, side: THREE.DoubleSide, forceSinglePass: true }), 0.5);
    mLue.name = 'effets : lueurs';
    const mAnn = instancier(new THREE.MeshBasicMaterial({ map: tAnn, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, fog: false, side: THREE.DoubleSide, forceSinglePass: true,
      polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }), 0.5);
    mAnn.name = 'effets : anneaux';
    const mFum = instancier(new THREE.MeshBasicMaterial({ map: tFum, transparent: true, depthWrite: false, fog: false, side: THREE.DoubleSide, forceSinglePass: true }), 0.5);
    mFum.name = 'effets : fumées';
    const mMet = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.85, roughness: 0.38 }); mMet.name = 'effets : laiton et grenades';
    const mCib = new THREE.MeshStandardMaterial({ map: tCib, side: THREE.DoubleSide, roughness: 0.95, metalness: 0 }); mCib.name = 'effets : cibles du stand';
    const plan = () => new THREE.PlaneGeometry(1, 1);
    const P = {
      impacts: poolMesh(plan(), mImp, N.impacts, 'impacts'),
      traceurs: poolMesh(plan(), mLue, N.traceurs, 'traceurs'),
      douilles: poolMesh(new THREE.CylinderGeometry(1, 1, 1, 8, 1).rotateZ(Math.PI / 2), mMet, N.douilles, 'douilles', { fx: false }),
      eclairs: poolMesh(geometrieEclair(), mLue, N.eclairs, 'éclairs'),
      etincelles: poolMesh(plan(), mLue, N.etincelles, 'étincelles'),
      explosion: poolMesh(plan(), mFum, N.explosion, 'explosion et fumées'),
      grenades: poolMesh(new THREE.IcosahedronGeometry(1, 1), mMet, N.grenades, 'grenades en vol', { fx: false }),
      anneaux: poolMesh(plan(), mAnn, N.anneaux, 'anneaux de la domination'),
      cibles: poolMesh(geometrieCible(), mCib, N.cibles, 'cibles du stand', { fx: false }),
    };
    // (les éclairs : leurs UV sont déjà dans leurs cases — aFx.xy = 0 ; seule l'opacité vit)
    this.pools = P;
    this.racines = Object.values(P);
    this.etincelles = new Particules(P.etincelles);
    this.fumees = new Particules(P.explosion);
    // l'état des autres pools
    const n = (k) => N[k];
    this.imp = { t: new Float32Array(n('impacts')).fill(-1), taille: new Float32Array(n('impacts')), P: new Float32Array(n('impacts') * 3), Q: new Float32Array(n('impacts') * 4), sx: new Float32Array(n('impacts')) };
    this.tra = { o: new Float32Array(n('traceurs') * 3), d: new Float32Array(n('traceurs') * 3), L: new Float32Array(n('traceurs')), age: new Float32Array(n('traceurs')).fill(1e9), k: 0, lg: new Float32Array(n('traceurs')) };
    this.dou = { p: new Float32Array(n('douilles') * 3), v: new Float32Array(n('douilles') * 3), w: new Float32Array(n('douilles') * 3), q: new Float32Array(n('douilles') * 4),
      age: new Float32Array(n('douilles')).fill(1e9), reb: new Uint8Array(n('douilles')), l: new Float32Array(n('douilles')), r: new Float32Array(n('douilles')), sol: new Float32Array(n('douilles')),
      cartouche: new Uint8Array(n('douilles')), k: 0 };
    this.ecl = { images: new Int8Array(n('eclairs')), k: 0 };
    for (const m of this.racines) m.visible = false;
    return P;
  }
  // les pools dans la scène (enfants DIRECTS : js/kit_decor.js, js/ombre_cache.js, js/ombres_contact.js les reconnaissent)
  // (le compteur `effetsJeu` de la scène dit à js/fx.js de relever ses découpes tout de suite)
  _poser() { const S = this.game.scene; let n = 0; for (const m of this.racines) if (m.parent !== S) { S.add(m); n++; } if (n) S.userData.effetsJeu = (S.userData.effetsJeu | 0) + 1; }
  _retirer() { let n = 0; for (const m of this.racines) if (m.parent) { m.parent.remove(m); n++; } if (n) { const S = this.game.scene; S.userData.effetsJeu = (S.userData.effetsJeu | 0) + 1; } }

  // LA PRÉPARATION (Partie.preparer, sous l'écran « PRÉPARATION DE LA PARTIE ») : pools créés, posés, compilés — leurs
  // programmes pour la cible du rendu, ceux du préréglage de repli de la qualité automatique (Player.preparerRendu)
  async preparer(progres) {
    this._creer(); this._poser();
    for (const m of this.racines) m.visible = true;
    const pr = Player.preparerRendu ? this.racines.map((m) => Player.preparerRendu(m)).filter(Boolean) : [];
    if (pr.length) await Promise.race([Promise.all(pr), new Promise((r) => setTimeout(r, 6000))]);
    for (const m of this.racines) m.visible = false;
  }

  brancher(partie) {
    for (const d of this._des) d();
    this._des = []; this.partie = partie; this._file.length = 0;
    this._creer(); this._poser(); this._vider();
    // (l'événement noté AVEC son genre : Partie.evt fait { t, type, ...données }, et une explosion ou une grenade porte un
    // champ `type` à elle — 'frag' | 'flash' — qui écrase celui de l'événement ; demande à F2 au rapport)
    // (`trajet` : le chemin exact de chaque plomb, de l'œil au point d'arrêt — un ajout de L-A au § 4.6 : le traceur y va
    // tout droit ; sans lui, il va à l'impact du même pas sur le rayon du tir)
    for (const quoi of ['tir', 'trajet', 'impact', 'touche', 'elim', 'explosion', 'flash', 'faux']) this._des.push(partie.sur(quoi, (e) => { this._file.push({ quoi, e }); }));
    this._fluidite();
  }
  debrancher() {
    for (const d of this._des) d();
    this._des = []; this._file.length = 0;
    if (this.pools) { this._vider(); this._retirer(); }
    if (this.game.fx) this.game.fx.fluidite = false;
    this.partie = null;
  }
  _vider() {
    const P = this.pools; if (!P) return;
    this.etincelles.vider(); this.fumees.vider();
    for (const k of ['impacts', 'traceurs', 'douilles', 'eclairs', 'grenades', 'anneaux', 'cibles']) {
      const m = P[k], a = m.instanceMatrix.array;
      m.instanceMatrix.clearUpdateRanges(); m.instanceColor?.clearUpdateRanges(); m.geometry.attributes.aFx?.clearUpdateRanges();
      for (let i = 0; i < m.count; i++) effacer(a, i);
      m.instanceMatrix.needsUpdate = true; m.visible = false;
    }
    this.imp.t.fill(-1); this._kImp = 0; this.tra.age.fill(1e9); this.dou.age.fill(1e9); this.ecl.images.fill(0);
    this._douillesAttente.length = 0; this._cibAff.clear(); this._tirs.length = 0; this._grenVues.clear(); this._nGren = 0; this._nAnn = 0; this._nCib = 0;
  }
  // « Priorité fluidité » (réglage jeu.fluidite) : le budget de js/fx.js, relu à chaque image (Options pendant la pause)
  _fluidite() { const fx = this.game.fx; if (fx) fx.fluidite = !!this._jeu().fluidite; }
  _jeu() { const s = this.game.settings; return (s && (s.data ? s.data.jeu : s.jeu)) || {}; }
  get airsoft() { return this._jeu().habillage !== 'militaire'; }

  // ---------------------------------------------------------------- L'IMAGE
  maj(dt) {
    const P = this.partie; if (!P || !this.pools) return;
    this.t += dt;
    this._fluidite();
    // la caméra : position, droite, haut, avant (sa matrice remise à jour : Partie.image vient après updateCamera)
    const cam = this.game.camera; cam.updateMatrixWorld();
    const e = cam.matrixWorld.elements, C = _cam;
    C.x = e[12]; C.y = e[13]; C.z = e[14]; C.rx = e[0]; C.ry = e[1]; C.rz = e[2]; C.ux = e[4]; C.uy = e[5]; C.uz = e[6]; C.fx = -e[8]; C.fy = -e[9]; C.fz = -e[10];
    // 1. les événements du pas (les tirs d'abord : un impact y retrouve son tireur)
    if (this._file.length) {
      const L = this._file; this._file = [];
      this._tirs.length = 0; this._points.length = 0; this._trajets.length = 0;
      for (const w of L) if (w.quoi === 'tir') this._tirs.push(w.e); else if (w.quoi === 'trajet') this._trajets.push(w.e);
      for (const w of L) if (w.quoi === 'impact' || w.quoi === 'touche') this._points.push(w.e);
      for (const w of L) { try { this._evenement(w.quoi, w.e, P); } catch (err) { console.warn('[effets]', w.quoi, err); } }
      for (const ev of this._tirs) { try { this._traceur(ev, P); } catch (err) { console.warn('[effets] traceur', err); } }
    }
    // 2. ce qui vit : particules, traceurs, éclairs, douilles, impacts qui s'effacent, grenades, anneaux, cibles
    this.etincelles.maj(dt); this.fumees.maj(dt);
    this._majTraceurs(dt); this._majEclairs(dt); this._majDouilles(dt, P); this._majImpacts(); this._majGrenades(P);
    this._majAnneaux(dt, P.hud && P.hud.points); this._majCibles(dt, P.hud && P.hud.cibles);
  }

  _evenement(quoi, ev, P) {
    switch (quoi) {
      case 'tir': return this._tir(ev, P);
      case 'impact': return this._impact(ev, P);
      case 'touche': return this._touche(ev, P);
      case 'explosion': return this._explosion(ev, P);
      case 'faux': return this._faux(ev, P);
      default:
    }
  }
  // le tir du même pas dont le rayon passe par ce point (le plus aligné, à moins de 12°)
  _tirDe(x, y, z, t) {
    let best = null, bc = REGLAGES_EFFETS.appariement;
    for (const r of this._tirs) {
      if (Math.abs(r.t - t) > 1e-6) continue;
      const dx = x - r.ox, dy = y - r.oy, dz = z - r.oz, l = Math.hypot(dx, dy, dz) || 1, c = (dx * r.dx + dy * r.dy + dz * r.dz) / l;
      if (c > bc) { bc = c; best = r; }
    }
    return best;
  }
  _visible(x, y, z, d = 60) { const C = _cam; return Math.hypot(x - C.x, y - C.y, z - C.z) < d; }

  // ---------------------------------------------------------------- LE TIR : l'éclair à la bouche, la douille
  _bouche(a, out) {
    const o = a.aff && a.aff.bouche, eye = a.oeil(_w, true);
    if (o && Math.hypot(o.x - eye.x, o.y - eye.y, o.z - eye.z) < 1.2) return out.set(o.x, o.y, o.z);
    // (pas de bouche posée — le squelette de L-C — : devant le buste, côté arme)
    const l = a.cmd.lacet, fx = -Math.sin(l), fz = -Math.cos(l), rx = Math.cos(l), rz = -Math.sin(l);
    return out.set(eye.x + fx * 0.55 + rx * 0.16, eye.y - 0.24, eye.z + fz * 0.55 + rz * 0.16);
  }
  _tir(ev, P) {
    const a = P.acteurParId(ev.a); if (!a || !a.corps) return;
    if (ev.arme === 'couteau') return;
    const fps = a.local && a.corps === a.joueur && !a.prop;
    if (!this._visible(ev.ox, ev.oy, ev.oz, 80)) return;
    // l'ÉCLAIR (pas pour Haythem en vue FPS : son arme de vue a le sien)
    // (Haythem en vue FPS : son arme de vue n'a que sa lumière de bouche — la flamme est posée ici, dans la scène, là où
    // l'écran montre le bout du canon : `_boucheVue`)
    this._eclair(a, ev, fps);
    // la DOUILLE (Militaire : une réplique à gaz n'en éjecte pas) — le TP-50 et le FP-12 éjectent au réarmement
    if (!this.airsoft && this._visible(ev.ox, ev.oy, ev.oz, REGLAGES_EFFETS.douille.distance)) {
      const retard = ev.arme === 'tp50' ? 0.27 : ev.arme === 'fp12' ? 0.38 : 0;
      this._douillesAttente.push({ t: this.t + retard, a: ev.a, arme: ev.arme, dx: ev.dx, dy: ev.dy, dz: ev.dz, fps });
    }
  }
  _eclair(a, ev, fps = false) {
    const E = this.ecl, P = this.pools.eclairs, i = E.k; E.k = (E.k + 1) % P.count;
    const b = fps ? this._boucheVue(a, ev, _s) : this._bouche(a, _s), R = REGLAGES_EFFETS.eclair, gaz = this.airsoft;
    const T = (R.taille[ev.arme] || 0.14) * (0.85 + Math.random() * 0.3) * (gaz ? 0.55 : 1) * (fps ? 0.7 : 1);
    // −Z de l'instance le long du tir, roulis au hasard
    _n.set(ev.dx, ev.dy, ev.dz).normalize();
    _q.setFromUnitVectors(_v.set(0, 0, -1), _n); _q2.setFromAxisAngle(_v.set(0, 0, 1), Math.random() * 6.28); _q.multiply(_q2);
    _m.compose(b, _q, _w.set(T * 0.9, T * 0.9, T * 1.6));
    P.setMatrixAt(i, _m);
    const c = gaz ? COUL.eclairGaz : COUL.eclair; P.setColorAt(i, _c.setRGB(c[0], c[1], c[2]));
    P.geometry.attributes.aFx.setXYZW(i, 0, 0, gaz ? 0.55 : 1, 0);
    E.images[i] = R.images; if (E.vu) E.vu[i] = 0;
    P.instanceMatrix.needsUpdate = true; P.instanceColor.needsUpdate = true; P.geometry.attributes.aFx.needsUpdate = true; P.visible = true;
    this.stats.eclairs++;
    // (et une petite lueur ronde : l'éclair éclaire l'air autour de lui)
    if (!gaz) this.etincelles.emettre(b.x, b.y, b.z, 0, 0, 0, 0.05, T * 2.6, T * 3.2, [2.8, 1.6, 0.6], { cas: 0, a0: 0.85 });
  }
  // (3 images : celle du tir, puis deux qui pâlissent ; rien ne bouge en pause)
  _majEclairs(dt) {
    const E = this.ecl, P = this.pools.eclairs, a = P.instanceMatrix.array, F = P.geometry.attributes.aFx;
    if (dt <= 0) return;
    let n = 0, chg = false;
    for (let i = 0; i < P.count; i++) {
      if (E.images[i] <= 0) continue;
      if (E.vu && E.vu[i]) { E.images[i]--; chg = true; if (E.images[i] <= 0) { effacer(a, i); continue; } F.setZ(i, F.getZ(i) * 0.6); }
      else (E.vu || (E.vu = new Uint8Array(P.count)))[i] = 1;
      n++;
    }
    if (chg) { P.instanceMatrix.needsUpdate = true; F.needsUpdate = true; }
    P.visible = n > 0;
  }

  // ---------------------------------------------------------------- LES TRACEURS : du bout de l'arme au point touché
  _traceur(ev, P) {
    const a = P.acteurParId(ev.a); if (!a || ev.arme === 'couteau') return;
    const R = REGLAGES_EFFETS.traceur;
    if (a.local && (ev.seq | 0) % R.uneSur !== 0) return;
    // le point d'arrivée : le trajet de son premier plomb (L-A), sinon l'impact ou la touche du même pas sur son rayon,
    // sinon au loin
    let best = null, bc = REGLAGES_EFFETS.appariement;
    for (const j of this._trajets) if (j.a === ev.a && Math.abs(j.t - ev.t) < 1e-6 && !(j.plomb | 0)) { best = j; bc = 2; break; }
    if (!best) for (const p of this._points) {
      if (Math.abs(p.t - ev.t) > 1e-6) continue;
      const dx = p.x - ev.ox, dy = p.y - ev.oy, dz = p.z - ev.oz, l = Math.hypot(dx, dy, dz) || 1, c = (dx * ev.dx + dy * ev.dy + dz * ev.dz) / l;
      if (c > bc) { bc = c; best = p; }
    }
    const fx = best ? best.x : ev.ox + ev.dx * R.portee, fy = best ? best.y : ev.oy + ev.dy * R.portee, fz = best ? best.z : ev.oz + ev.dz * R.portee;
    // le départ : la bouche (Haythem en vue FPS : sous et à droite de l'œil, là où l'arme de vue tient son canon)
    const fps = a.local && a.corps === a.joueur && !a.prop;
    const o = fps ? this._boucheVue(a, ev, _s) : this._bouche(a, _s);
    const dx = fx - o.x, dy = fy - o.y, dz = fz - o.z, L = Math.hypot(dx, dy, dz);
    if (L < 1.5) return;
    const T = this.tra, i = T.k; T.k = (T.k + 1) % this.pools.traceurs.count;
    T.o[i * 3] = o.x; T.o[i * 3 + 1] = o.y; T.o[i * 3 + 2] = o.z; T.d[i * 3] = dx / L; T.d[i * 3 + 1] = dy / L; T.d[i * 3 + 2] = dz / L;
    T.L[i] = L; T.age[i] = 0; T.lg[i] = Math.min(R.longueur, L);
    const c = this.airsoft ? couleurActeur(a).map((x) => 0.6 + x * 2.6) : COUL.traceur;
    this.pools.traceurs.setColorAt(i, _c.setRGB(c[0], c[1], c[2])); this.pools.traceurs.instanceColor.needsUpdate = true;
    const [u, w] = UV(1); this.pools.traceurs.geometry.attributes.aFx.setXYZW(i, u, w, 1, 0);
    this.stats.traceurs++;
  }
  // LE BOUT DU CANON DE L'ARME DE VUE, dans la scène : le repère `bouche` de l'arme montrée (sa scène et sa caméra à elle,
  // js/jeu/viewmodel.js) projeté à l'écran, puis reposé à `D` m de la caméra du jeu sur la même ligne de vue — l'éclair
  // et le départ du traceur tombent au bout du canon dessiné ; sans arme de vue, sous et à droite de l'œil
  _boucheVue(a, ev, out) {
    const D = 0.8, cam = this.game.camera, vm = this.partie && this.partie.aff && this.partie.aff.viewmodel;
    const sup = vm && vm.superposition, bo = sup && sup.scene && sup.camera ? this._repereBouche(sup.scene) : null;
    if (bo) {
      bo.getWorldPosition(_v); _v.project(sup.camera);
      if (Math.abs(_v.x) < 1.2 && Math.abs(_v.y) < 1.2) {
        _w.set(_v.x, _v.y, 0.5).unproject(cam).sub(cam.position).normalize();
        return out.copy(cam.position).addScaledVector(_w, D);
      }
    }
    const eye = a.oeil(_n, true), C = _cam, k = a.arsenal ? a.arsenal.visee : 0;
    const d = 0.55, r = 0.1 * (1 - k), b = 0.09 * (1 - k) + 0.04 * k;
    return out.set(eye.x + ev.dx * d + C.rx * r - C.ux * b, eye.y + ev.dy * d + C.ry * r - C.uy * b, eye.z + ev.dz * d + C.rz * r - C.uz * b);
  }
  // le repère `bouche` de l'arme VISIBLE de l'arme de vue (gardé tant qu'elle ne change pas)
  _repereBouche(scene) {
    const g = this._vmBouche;
    if (g && g.arme.visible && g.arme.parent && this._vmImage === this._image) return g.b;
    let b = null, arme = null;
    scene.traverseVisible((o) => { if (!b && o.userData && o.userData.reperes && o.userData.reperes.bouche && o.userData.reperes.bouche.isObject3D) { b = o.userData.reperes.bouche; arme = o; } });
    this._vmBouche = b ? { b, arme } : null; this._vmImage = this._image;
    return b;
  }
  _majTraceurs(dt) {
    const T = this.tra, M = this.pools.traceurs, a = M.instanceMatrix.array, R = REGLAGES_EFFETS.traceur, C = _cam;
    let n = 0, chg = false;
    for (let i = 0; i < M.count; i++) {
      if (T.age[i] > 1e8) continue;
      chg = true;
      T.age[i] += dt;
      const tete = T.age[i] * R.vitesse, queue = tete - T.lg[i];
      if (queue >= T.L[i]) { T.age[i] = 1e9; effacer(a, i); continue; }
      const s0 = Math.max(0, queue), s1 = Math.min(T.L[i], tete);
      if (s1 <= s0) { effacer(a, i); n++; continue; }
      const dx = T.d[i * 3], dy = T.d[i * 3 + 1], dz = T.d[i * 3 + 2], m = (s0 + s1) / 2, l = s1 - s0;
      const px = T.o[i * 3] + dx * m, py = T.o[i * 3 + 1] + dy * m, pz = T.o[i * 3 + 2] + dz * m;
      let fx = px - C.x, fy = py - C.y, fz = pz - C.z; const fl = Math.hypot(fx, fy, fz) || 1; fx /= fl; fy /= fl; fz /= fl;
      // X le long du trait, Y en travers (vu de face), largeur qui suit la distance (≈ 2 px à l'écran ; le cœur de la
      // traînée fait un tiers de la case, d'où × 3)
      const w = Math.max(R.largeur, fl * R.parMetre) * 3;
      let yx = fy * dz - fz * dy, yy = fz * dx - fx * dz, yz = fx * dy - fy * dx; const yl = Math.hypot(yx, yy, yz) || 1; yx /= yl; yy /= yl; yz /= yl;
      ecrire(a, i, dx * l, dy * l, dz * l, yx * w, yy * w, yz * w, -fx, -fy, -fz, px, py, pz);
      n++;
    }
    if (chg) M.instanceMatrix.needsUpdate = true;
    M.visible = n > 0;
  }

  // ---------------------------------------------------------------- LES DOUILLES : éjectées à droite, deux rebonds, au sol 3 s
  _ejecter(q, P) {
    const a = P.acteurParId(q.a); if (!a || !a.corps) return;
    const D = this.dou, R = REGLAGES_EFFETS.douille, M = this.pools.douilles, i = D.k; D.k = (D.k + 1) % M.count;
    const l = a.cmd.lacet, fx = -Math.sin(l), fz = -Math.cos(l), rx = Math.cos(l), rz = -Math.sin(l);
    let x, y, z;
    if (q.fps) { const e = a.oeil(_n, true); x = e.x + rx * R.droite + fx * R.avant; y = e.y - R.bas; z = e.z + rz * R.droite + fz * R.avant; }
    else { const b = this._bouche(a, _n); x = b.x - fx * 0.45 + rx * 0.04; y = b.y + 0.03; z = b.z - fz * 0.45 + rz * 0.04; }
    const v = a.corps.vel || { x: 0, z: 0 }, [vr, vu, va] = R.vitesse;
    D.p[i * 3] = x; D.p[i * 3 + 1] = y; D.p[i * 3 + 2] = z;
    D.v[i * 3] = rx * vr + (Math.random() - 0.5) * 2 * va + (v.x || 0) * 0.8 + fx * 0.3;
    D.v[i * 3 + 1] = vu + (Math.random() - 0.5) * 2 * va;
    D.v[i * 3 + 2] = rz * vr + (Math.random() - 0.5) * 2 * va + (v.z || 0) * 0.8 + fz * 0.3;
    D.w[i * 3] = (Math.random() - 0.5) * 30; D.w[i * 3 + 1] = (Math.random() - 0.5) * 30; D.w[i * 3 + 2] = (Math.random() - 0.5) * 30;
    _q.setFromAxisAngle(_v.set(0, 1, 0), l + Math.PI / 2); D.q[i * 4] = _q.x; D.q[i * 4 + 1] = _q.y; D.q[i * 4 + 2] = _q.z; D.q[i * 4 + 3] = _q.w;
    const cart = q.arme === 'fp12', pist = q.arme === 'pm9' || q.arme === 'p17';
    D.l[i] = cart ? 0.065 : q.arme === 'tp50' ? 0.07 : pist ? 0.019 : 0.045; D.r[i] = cart ? 0.0105 : q.arme === 'tp50' ? 0.0065 : pist ? 0.0048 : 0.0055;
    D.cartouche[i] = cart ? 1 : 0;
    const C = this.game.collisions; D.sol[i] = C ? C.solEn(x, z, y - 0.2) : y - 1.5;
    D.age[i] = 0; D.reb[i] = 0;
    const c = cart ? COUL.cartouche : COUL.laiton; M.setColorAt(i, _c.setRGB(c[0], c[1], c[2])); M.instanceColor.needsUpdate = true;
    this.stats.douilles++;
  }
  _majDouilles(dt, P) {
    if (this._douillesAttente.length) {
      for (let k = this._douillesAttente.length - 1; k >= 0; k--) { const q = this._douillesAttente[k]; if (this.t >= q.t) { this._douillesAttente.splice(k, 1); this._ejecter(q, P); } }
    }
    const D = this.dou, R = REGLAGES_EFFETS.douille, M = this.pools.douilles, a = M.instanceMatrix.array, g = REGLAGES_EFFETS.gravite;
    let n = 0, chg = false;
    for (let i = 0; i < M.count; i++) {
      if (D.age[i] > 1e8) continue;
      chg = true; D.age[i] += dt;
      if (D.age[i] > R.vie + 0.3) { D.age[i] = 1e9; effacer(a, i); continue; }
      n++;
      const j = i * 3;
      if (D.reb[i] <= R.rebonds && dt > 0) {
        D.v[j + 1] -= g * dt;
        D.p[j] += D.v[j] * dt; D.p[j + 1] += D.v[j + 1] * dt; D.p[j + 2] += D.v[j + 2] * dt;
        _q.set(D.q[i * 4], D.q[i * 4 + 1], D.q[i * 4 + 2], D.q[i * 4 + 3]);
        _q2.setFromEuler(_e.set(D.w[j] * dt, D.w[j + 1] * dt, D.w[j + 2] * dt)); _q.multiply(_q2);
        D.q[i * 4] = _q.x; D.q[i * 4 + 1] = _q.y; D.q[i * 4 + 2] = _q.z; D.q[i * 4 + 3] = _q.w;
        const sol = D.sol[i] + D.r[i];
        if (D.p[j + 1] <= sol && D.v[j + 1] < 0) {
          D.p[j + 1] = sol;
          if (D.reb[i] === 0) this.partie?.aff?.sons?.douille?.(D.p[j], D.p[j + 1], D.p[j + 2], !!D.cartouche[i]);
          D.reb[i]++;
          if (D.reb[i] > R.rebonds) {
            // au repos, couchée (son axe à plat, tournée au hasard)
            _q.setFromAxisAngle(_v.set(0, 1, 0), Math.random() * 6.28); D.q[i * 4] = _q.x; D.q[i * 4 + 1] = _q.y; D.q[i * 4 + 2] = _q.z; D.q[i * 4 + 3] = _q.w;
          } else { D.v[j + 1] = -D.v[j + 1] * R.restitution; D.v[j] *= 0.5; D.v[j + 2] *= 0.5; D.w[j] *= 0.5; D.w[j + 1] *= 0.5; D.w[j + 2] *= 0.5; }
        }
      }
      const k = D.age[i] > R.vie ? Math.max(0, 1 - (D.age[i] - R.vie) / 0.3) : 1;
      _q.set(D.q[i * 4], D.q[i * 4 + 1], D.q[i * 4 + 2], D.q[i * 4 + 3]);
      _m.compose(_v.set(D.p[j], D.p[j + 1], D.p[j + 2]), _q, _w.set(D.l[i] * k, D.r[i] * k, D.r[i] * k));
      _m.toArray(a, i * 16);
    }
    if (chg) M.instanceMatrix.needsUpdate = true;
    M.visible = n > 0;
  }

  // ---------------------------------------------------------------- LES IMPACTS : décalque (formes hautes, plafonds), gerbe ailleurs
  // la forme touchée : celle de l'événement (L-A) ; à défaut (le squelette de la balistique ne la donne pas) celle dont
  // la surface passe par le point, et sa normale
  _forme(ev) {
    const C = this.game.collisions; if (!C) return null;
    if (ev.forme !== null && ev.forme !== undefined && C.formes[ev.forme]) return { f: C.formes[ev.forme], n: null };
    return formeAuPoint(C, ev.x, ev.y, ev.z);
  }
  _impact(ev, P) {
    this.stats.impacts++;
    if (!this._visible(ev.x, ev.y, ev.z)) return;
    const air = this.airsoft, tir = this._tirDe(ev.x, ev.y, ev.z, ev.t), tireur = tir ? P.acteurParId(tir.a) : null;
    const coul = air ? couleurActeur(tireur) : null;
    const F = this._forme(ev);
    let nx = ev.nx, ny = ev.ny, nz = ev.nz;
    if (F && F.n) { nx = F.n[0]; ny = F.n[1]; nz = F.n[2]; }
    const nl = Math.hypot(nx, ny, nz) || 1; nx /= nl; ny /= nl; nz /= nl;
    const f = F && F.f, mat = ev.mat === 'mur' && f && f.vitre ? 'vitre' : ev.mat;
    const plomb = (ev.plomb | 0) > 0;
    if (mat === 'vitre') {
      this._decalque(ev.x, ev.y, ev.z, nx, ny, nz, 2, REGLAGES_EFFETS.impact.felure * (plomb ? 0.6 : 1), COUL.eclat);
      for (let i = 0; i < (plomb ? 2 : 7); i++) this.fumees.emettre(ev.x, ev.y, ev.z, nx * 1.5 + (Math.random() - 0.5) * 2.5, ny * 1.5 + Math.random() * 1.5, nz * 1.5 + (Math.random() - 0.5) * 2.5,
        0.5 + Math.random() * 0.4, 0.008, 0.012, COUL.eclat, { cas: 3, a0: 0.9, grav: 9.81 });
      if (!plomb) this.etincelles.emettre(ev.x, ev.y, ev.z, 0, 0, 0, 0.08, 0.05, 0.12, COUL.verre, { cas: 2, a0: 0.8 });
      return;
    }
    const decal = mat === 'plafond' || (f && decalquable(f) && mat !== 'sol' && mat !== 'meuble');
    if (decal && !(plomb && Math.random() < 0.4)) {
      const I = REGLAGES_EFFETS.impact;
      if (air) this._decalque(ev.x, ev.y, ev.z, nx, ny, nz, 1, I.peinture[0] + Math.random() * (I.peinture[1] - I.peinture[0]), coul);
      else this._decalque(ev.x, ev.y, ev.z, nx, ny, nz, 0, I.trou * (0.85 + Math.random() * 0.3) * (plomb ? 0.7 : 1), COUL.trou);
    }
    this._gerbe(ev.x, ev.y, ev.z, nx, ny, nz, mat, decal, air, coul, plomb);
  }
  // la gerbe d'un impact : la poussière du mur ou du sol, des étincelles (Militaire), des gouttes de peinture (Airsoft)
  _gerbe(x, y, z, nx, ny, nz, mat, decal, air, coul, plomb) {
    this.stats.gerbes++;
    const k = plomb ? 0.5 : 1, r = Math.random;
    if (air) {
      for (let i = 0; i < Math.round(6 * k); i++) this.fumees.emettre(x + nx * 0.02, y + ny * 0.02, z + nz * 0.02, nx * (1 + r() * 2) + (r() - 0.5) * 2.2, ny * (1 + r() * 2) + r() * 1.6, nz * (1 + r() * 2) + (r() - 0.5) * 2.2,
        0.35 + r() * 0.3, 0.012, 0.02, coul, { cas: 2, a0: 1, grav: 9.81 });
      this.fumees.emettre(x + nx * 0.05, y + ny * 0.05, z + nz * 0.05, nx * 0.3, ny * 0.3 + 0.1, nz * 0.3, 0.45, 0.08, 0.28, coul.map((c) => 0.35 + c * 0.6), { cas: 1, a0: 0.45, frein: 3 });
      return;
    }
    const sol = mat === 'sol', c = sol ? COUL.poussiere : mat === 'meuble' ? COUL.tissu : COUL.platre;
    // la poussière : une bouffée qui sort de la surface et ralentit
    for (let i = 0; i < (sol ? 3 : 2); i++) this.fumees.emettre(x + nx * 0.03, y + ny * 0.03, z + nz * 0.03, nx * (0.6 + r() * 0.8) + (r() - 0.5) * 0.4, ny * (0.6 + r() * 0.8) + (sol ? 0.4 : 0.1), nz * (0.6 + r() * 0.8) + (r() - 0.5) * 0.4,
      0.6 + r() * 0.6, 0.06, 0.3 + r() * 0.2, c, { cas: sol ? 1 : 0, a0: sol ? 0.55 : 0.45, frein: 3.5, grav: -0.15 });
    // les éclats (sombres) et les étincelles (vives) : moins sur un meuble, aucune étincelle au sol
    for (let i = 0; i < Math.round((decal ? 3 : 4) * k); i++) this.fumees.emettre(x, y, z, nx * (2 + r() * 2) + (r() - 0.5) * 2, ny * (2 + r() * 2) + r() * 1.5, nz * (2 + r() * 2) + (r() - 0.5) * 2,
      0.4 + r() * 0.3, 0.012, 0.012, mat === 'meuble' ? [0.3, 0.22, 0.14] : [0.35, 0.33, 0.3], { cas: 3, a0: 1, grav: 9.81 });
    // (des étincelles COURTES — vues au navigateur le 23/10, 3-7 m/s pendant 0,3 s en faisaient des fils jusqu'à 1 m du mur)
    if (!sol) for (let i = 0; i < Math.round((mat === 'meuble' ? 2 : 3) * k); i++) this.etincelles.emettre(x + nx * 0.01, y + ny * 0.01, z + nz * 0.01,
      nx * (1.5 + r() * 2.5) + (r() - 0.5) * 2.4, ny * (1.5 + r() * 2.5) + (r() - 0.5) * 2.4 + 0.6, nz * (1.5 + r() * 2.5) + (r() - 0.5) * 2.4,
      0.07 + r() * 0.1, 0.01, 0.006, COUL.etincelle, { cas: 1, a0: 1, grav: 9.81, trainee: 0.014 });
    if (!sol && !plomb) this.etincelles.emettre(x + nx * 0.02, y + ny * 0.02, z + nz * 0.02, 0, 0, 0, 0.06, 0.06, 0.14, [2.4, 1.5, 0.7], { cas: 0, a0: 0.9 });
  }
  // un DÉCALQUE : quad aligné sur la normale, 2 mm devant la surface, tourné au hasard ; le plus vieux recyclé
  _decalque(x, y, z, nx, ny, nz, cas, taille, coul) {
    const M = this.pools.impacts, I = this.imp, i = this._kImp; this._kImp = (this._kImp + 1) % M.count;
    const d = REGLAGES_EFFETS.impact.decalage;
    _n.set(nx, ny, nz); _q.setFromUnitVectors(_Z, _n); _q2.setFromAxisAngle(_Z, Math.random() * 6.28); _q.multiply(_q2);
    const px = x + nx * d, py = y + ny * d, pz = z + nz * d;
    _m.compose(_v.set(px, py, pz), _q, _w.set(taille, taille, taille));
    M.setMatrixAt(i, _m);
    I.t[i] = this.t; I.taille[i] = taille; I.P[i * 3] = px; I.P[i * 3 + 1] = py; I.P[i * 3 + 2] = pz; I.Q[i * 4] = _q.x; I.Q[i * 4 + 1] = _q.y; I.Q[i * 4 + 2] = _q.z; I.Q[i * 4 + 3] = _q.w;
    M.setColorAt(i, _c.setRGB(coul[0], coul[1], coul[2]));
    const [u, w] = UV(cas); M.geometry.attributes.aFx.setXYZW(i, u, w, cas === 3 ? 0.85 : 1, 0);
    // (seul ce qui a changé repart vers la carte graphique)
    M.instanceMatrix.addUpdateRange(i * 16, 16); M.instanceMatrix.needsUpdate = true;
    M.instanceColor.addUpdateRange(i * 3, 3); M.instanceColor.needsUpdate = true;
    M.geometry.attributes.aFx.addUpdateRange(i * 4, 4); M.geometry.attributes.aFx.needsUpdate = true;
    M.visible = true;
    this.stats.decalques++;
    return i;
  }
  // l'effacement : passé 25 s, l'impact rétrécit en 1 s puis disparaît
  _majImpacts() {
    const M = this.pools.impacts, I = this.imp, R = REGLAGES_EFFETS.impact; let chg = false, n = 0;
    for (let i = 0; i < M.count; i++) {
      if (I.t[i] < 0) continue;
      const age = this.t - I.t[i];
      if (age < R.vie) { n++; continue; }
      const k = 1 - (age - R.vie) / R.effacement;
      if (k <= 0) { I.t[i] = -1; M.setMatrixAt(i, ZERO); }
      else { n++; _q.set(I.Q[i * 4], I.Q[i * 4 + 1], I.Q[i * 4 + 2], I.Q[i * 4 + 3]); const s = I.taille[i] * k; _m.compose(_v.set(I.P[i * 3], I.P[i * 3 + 1], I.P[i * 3 + 2]), _q, _w.set(s, s, s)); M.setMatrixAt(i, _m); }
      M.instanceMatrix.addUpdateRange(i * 16, 16); chg = true;
    }
    if (chg) M.instanceMatrix.needsUpdate = true;
    M.visible = n > 0;
  }
  get impactsActifs() { let n = 0; for (const t of this.imp ? this.imp.t : []) if (t >= 0) n++; return n; }

  // ---------------------------------------------------------------- LA TOUCHE : pas de sang — la poussière de la tenue, ou la peinture
  _touche(ev, P) {
    if (!this._visible(ev.x, ev.y, ev.z)) return;
    const c = P.acteurParId(ev.cible); if (!c || c.local && c.corps === c.joueur && !c.prop) return;   // (le sien : le HUD et le son)
    const air = this.airsoft, r = Math.random, tireur = P.acteurParId(ev.par);
    const dx = ev.dx || 0, dz = ev.dz || 0, l = Math.hypot(dx, dz) || 1, ux = dx / l, uz = dz / l;
    if (air) {
      const coul = couleurActeur(tireur);
      for (let i = 0; i < 7; i++) this.fumees.emettre(ev.x, ev.y, ev.z, ux * (0.5 + r()) + (r() - 0.5) * 2, r() * 1.8, uz * (0.5 + r()) + (r() - 0.5) * 2, 0.35 + r() * 0.3, 0.012, 0.022, coul, { cas: 2, grav: 9.81 });
      this.fumees.emettre(ev.x, ev.y, ev.z, -ux * 0.2, 0.15, -uz * 0.2, 0.4, 0.06, 0.24, coul.map((x) => 0.35 + x * 0.6), { cas: 1, a0: 0.5, frein: 3 });
    } else {
      for (let i = 0; i < 2; i++) this.fumees.emettre(ev.x, ev.y, ev.z, -ux * 0.4 + (r() - 0.5) * 0.5, 0.2 + r() * 0.3, -uz * 0.4 + (r() - 0.5) * 0.5, 0.45 + r() * 0.3, 0.05, 0.22, COUL.tissu, { cas: 0, a0: 0.4, frein: 3 });
      for (let i = 0; i < 3; i++) this.fumees.emettre(ev.x, ev.y, ev.z, ux * (1 + r()) + (r() - 0.5), r() * 1.2, uz * (1 + r()) + (r() - 0.5), 0.3 + r() * 0.2, 0.01, 0.01, [0.2, 0.19, 0.18], { cas: 3, grav: 9.81 });
    }
    // (une cible du stand touchée s'éclaire un instant)
    if (c.role === 'cible') { const s = this._cibAff.get(c.id); if (s) s.flash = 1; }
  }
  // ---------------------------------------------------------------- LE VRAI MEUBLE touché (prop hunt) : des éclats, là où la balle l'a pris
  _faux(ev, P) {
    const pose = MEUBLES.poses && MEUBLES.poses[ev.pose]; if (!pose) return;
    let x = pose.cx ?? pose.x, y = ((pose.y0 ?? pose.y) + (pose.y1 ?? pose.y + 0.8)) / 2, z = pose.cz ?? pose.z;
    // le dernier tir de ce chasseur, contre la boîte orientée de la pose
    for (let k = this._tirs.length - 1; k >= 0; k--) {
      const r = this._tirs[k]; if (r.a !== ev.a) continue;
      const t = rayonBoite(r.ox, r.oy, r.oz, r.dx, r.dy, r.dz, pose);
      if (t !== null) { x = r.ox + r.dx * t; y = r.oy + r.dy * t; z = r.oz + r.dz * t; }
      break;
    }
    this._gerbe(x, y, z, 0, 1, 0, 'meuble', false, this.airsoft, couleurActeur(P.acteurParId(ev.a)), false);
  }

  // ---------------------------------------------------------------- LES EXPLOSIONS
  _explosion(ev, P) {
    this.stats.explosions++;
    if (!this._visible(ev.x, ev.y, ev.z, 120)) return;
    const r = Math.random, x = ev.x, y = ev.y + 0.15, z = ev.z, E = this.etincelles, F = this.fumees;
    const genre = genreGrenade(ev, 'explosion');
    if (genre === 'flash') {
      E.emettre(x, y, z, 0, 0, 0, 0.16, 3.5, 4.5, COUL.blanc, { cas: 2, a0: 1 });
      E.emettre(x, y, z, 0, 0, 0, 0.35, 1.5, 2.6, [2, 2, 2.2], { cas: 0, a0: 1 });
      for (let i = 0; i < 12; i++) E.emettre(x, y, z, (r() - 0.5) * 9, r() * 5, (r() - 0.5) * 9, 0.25 + r() * 0.25, 0.02, 0.01, COUL.blanc, { cas: 1, grav: 6, trainee: 0.02 });
      for (let i = 0; i < 4; i++) F.emettre(x, y, z, (r() - 0.5) * 0.8, 0.3 + r() * 0.3, (r() - 0.5) * 0.8, 2 + r(), 0.4, 1.4 + r() * 0.6, [0.55, 0.55, 0.56], { cas: 0, a0: 0.45, frein: 1.5 });
      return;
    }
    const tireur = ev.a !== undefined && ev.a !== null ? P.acteurParId(ev.a) || this._lanceur(ev, P) : this._lanceur(ev, P), air = this.airsoft;
    const C = this.game.collisions, sol = C ? C.solEn(x, z, y + 0.3) : y - 0.2;
    if (air) {
      // la grenade Airsoft : un pop, un NUAGE DE POUDRE à la couleur de l'équipe, les billes qui fusent, une tache au sol
      const coul = couleurActeur(tireur), pastel = coul.map((c) => 0.45 + c * 0.55);
      E.emettre(x, y, z, 0, 0, 0, 0.09, 1.2, 1.6, [2.6, 2.6, 2.6], { cas: 0, a0: 1 });
      for (let i = 0; i < 10; i++) F.emettre(x + (r() - 0.5) * 0.4, y + r() * 0.3, z + (r() - 0.5) * 0.4, (r() - 0.5) * 3, 0.6 + r() * 1.4, (r() - 0.5) * 3, 1.8 + r() * 1.2, 0.5, 2.4 + r() * 1.2, pastel, { cas: 0, a0: 0.75, frein: 2.2 });
      for (let i = 0; i < 18; i++) E.emettre(x, y, z, (r() - 0.5) * 14, r() * 6, (r() - 0.5) * 14, 0.2 + r() * 0.3, 0.012, 0.008, [2.2, 2.2, 2.2], { cas: 1, grav: 9.81, trainee: 0.015 });
      if (y - sol < 0.6) this._decalque(x, sol + 0.002, z, 0, 1, 0, 1, 1.4, coul);
      return;
    }
    // la frag : le cœur (lueur), la boule de feu, la fumée qui monte, les étincelles, les débris, la brûlure au sol
    E.emettre(x, y, z, 0, 0, 0, 0.1, 2.4, 3.2, [3.5, 2.4, 1.3], { cas: 0, a0: 1 });
    E.emettre(x, y, z, 0, 0, 0, 0.12, 1.8, 2.6, [4, 2.6, 1.2], { cas: 2, a0: 0.9 });
    for (let i = 0; i < 6; i++) F.emettre(x + (r() - 0.5) * 0.5, y + r() * 0.4, z + (r() - 0.5) * 0.5, (r() - 0.5) * 2, 0.5 + r(), (r() - 0.5) * 2, 0.32 + r() * 0.15, 0.6, 2.0 + r() * 0.6, COUL.feu, { cas: 0, a0: 1, frein: 4 });
    for (let i = 0; i < 9; i++) F.emettre(x + (r() - 0.5) * 0.8, y + r() * 0.5, z + (r() - 0.5) * 0.8, (r() - 0.5) * 1.6, 0.5 + r() * 0.6, (r() - 0.5) * 1.6, 2.6 + r() * 1.4, 0.8, 3 + r() * 1.2, COUL.fumee, { cas: 0, a0: 0.9, frein: 1.2, grav: -0.12 });
    for (let i = 0; i < 26; i++) E.emettre(x, y, z, (r() - 0.5) * 16, r() * 9, (r() - 0.5) * 16, 0.35 + r() * 0.5, 0.02, 0.012, COUL.etincelle, { cas: 1, grav: 9.81, trainee: 0.022 });
    for (let i = 0; i < 12; i++) F.emettre(x, y, z, (r() - 0.5) * 9, 1 + r() * 5, (r() - 0.5) * 9, 0.7 + r() * 0.5, 0.03, 0.03, [0.12, 0.11, 0.1], { cas: 3, grav: 9.81 });
    for (let i = 0; i < 3; i++) F.emettre(x, sol + 0.1, z, (r() - 0.5) * 4, 0.2, (r() - 0.5) * 4, 1.4 + r(), 0.5, 2.2, COUL.poussiere, { cas: 1, a0: 0.5, frein: 2 });
    if (y - sol < 0.6) this._decalque(x, sol + 0.002, z, 0, 1, 0, 3, REGLAGES_EFFETS.impact.brulure, COUL.brule);
  }
  // le lanceur d'une grenade (l'événement d'explosion ne le dit pas) : la grenade de ce type vue en vol le plus près de là
  // à l'image d'avant (elle a quitté la liste en explosant)
  _lanceur(ev, P) {
    let best = null, bd = 3;
    const genre = genreGrenade(ev, 'explosion');
    for (const [id, g] of this._grenVues) { const d = Math.hypot(g.x - ev.x, g.y - ev.y, g.z - ev.z); if (g.type === genre && d < bd) { bd = d; best = id; } }
    if (best === null) return null;
    const g = this._grenVues.get(best); this._grenVues.delete(best);
    return P.acteurParId(g.a);
  }

  // ---------------------------------------------------------------- LES GRENADES EN VOL (lues dans l'état)
  _majGrenades(P) {
    const M = this.pools.grenades, L = (P.grenades && P.grenades.liste) || [], a = M.instanceMatrix.array;
    let n = 0;
    const V = this._grenVues; this._image++;
    for (const g of L) {
      const q = V.get(g.id); if (q) { q.x = g.x; q.y = g.y; q.z = g.z; q.vu = this._image; } else V.set(g.id, { a: g.a, type: g.type, x: g.x, y: g.y, z: g.z, vu: this._image });
      if (n >= M.count) continue;
      const flash = g.type === 'flash', s = flash ? 0.03 : 0.036;
      _q.setFromEuler(_e.set(this.t * 9 + g.id, this.t * 5, 0));
      _m.compose(_v.set(g.x, g.y, g.z), g.posee ? _q.identity() : _q, _w.set(s, flash ? s * 1.6 : s * 1.15, s));
      _m.toArray(a, n * 16);
      const c = flash ? COUL.flash : COUL.frag; M.setColorAt(n, _c.setRGB(c[0], c[1], c[2]));
      n++;
    }
    for (const [id, q] of V) if (q.vu < this._image - 3) V.delete(id);       // (une explosion la réclame à l'image qui suit)
    for (let i = n; i < (this._nGren || 0); i++) effacer(a, i);
    if (n || this._nGren) { M.instanceMatrix.needsUpdate = true; if (n) M.instanceColor.needsUpdate = true; }
    this._nGren = n; M.visible = n > 0;
  }

  // ---------------------------------------------------------------- LES ANNEAUX DE LA DOMINATION (hud.points)
  // par point : l'anneau au sol (couleur du possesseur, pouls), l'anneau de la capture qui grandit (couleur de qui prend),
  // la lettre au centre, tournée vers la caméra
  _majAnneaux(dt, points) {
    const M = this.pools.anneaux, a = M.instanceMatrix.array, F = M.geometry.attributes.aFx, C = _cam;
    const L = Array.isArray(points) ? points : [];
    let n = 0;
    let fx = C.fx, fz = C.fz; const fl = Math.hypot(fx, fz) || 1; fx /= fl; fz /= fl;
    for (let k = 0; k < L.length && n + 3 <= M.count; k++) {
      const p = L[k]; if (!p || !Number.isFinite(p.x)) continue;
      const r = p.r || 2.5, y = (p.y || 0) + 0.025, eq = p.possesseur && EQUIPES[p.possesseur];
      const base = eq ? _c.set(eq.couleur) : _c.setRGB(0.85, 0.85, 0.85);
      const cap = p.capture && p.capture.equipe && p.capture.k > 0 ? p.capture : null;
      const pouls = 0.8 + 0.2 * Math.sin(this.t * (cap ? 9 : 2.6) + k);
      // l'anneau
      ecrire(a, n, 2 * r, 0, 0, 0, 0, -2 * r, 0, 1, 0, p.x, y, p.z);
      M.setColorAt(n, _c.setRGB(base.r * 1.4, base.g * 1.4, base.b * 1.4)); F.setXYZW(n, ...UV(0), 0.85 * pouls, 0); n++;
      // la capture
      const kc = cap ? Math.max(0.02, Math.min(1, cap.k)) : 0, ec = cap && EQUIPES[cap.equipe];
      if (kc > 0) { ecrire(a, n, 2 * r * kc, 0, 0, 0, 0, -2 * r * kc, 0, 1, 0, p.x, y + 0.005, p.z); if (ec) _c.set(ec.couleur); M.setColorAt(n, _c.setRGB(_c.r * 1.8, _c.g * 1.8, _c.b * 1.8)); F.setXYZW(n, ...UV(0), 0.9, 0); }
      else effacer(a, n);
      n++;
      // la lettre (A, B, C : l'identifiant du point, sinon son rang)
      const id = String(p.id ?? '').toUpperCase(), li = id === 'A' || id === 'B' || id === 'C' ? id.charCodeAt(0) - 65 : k % 3, s = Math.min(1.2, r * 0.45);
      ecrire(a, n, -fz * s, 0, fx * s, fx * s, 0, fz * s, 0, 1, 0, p.x, y + 0.01, p.z);
      M.setColorAt(n, _c.setRGB(base.r * 1.2, base.g * 1.2, base.b * 1.2)); F.setXYZW(n, ...UV(li + 1), 0.7, 0); n++;
    }
    for (let i = n; i < (this._nAnn || 0); i++) effacer(a, i);
    if (n || this._nAnn) { M.instanceMatrix.needsUpdate = true; M.instanceColor.needsUpdate = true; F.needsUpdate = true; }
    this._nAnn = n; M.visible = n > 0;
  }

  // ---------------------------------------------------------------- LES CIBLES DU STAND (hud.cibles)
  // levée en 0,15 s, tombée en arrière en 0,12 s avec un petit rebond, un éclair blanc quand elle est touchée
  _majCibles(dt, cibles) {
    const M = this.pools.cibles, a = M.instanceMatrix.array;
    const L = Array.isArray(cibles) ? cibles : [];
    let n = 0;
    for (let k = 0; k < L.length && n < M.count; k++) {
      // (le mannequin du stand est un vrai corps, L-C : pas de carton pour lui)
      const c = L[k]; if (!c || !Number.isFinite(c.x) || c.mannequin) continue;
      let s = this._cibAff.get(c.id);
      if (!s) { s = { k: c.touchee ? 0 : c.k ?? 1, b: 0, flash: 0 }; this._cibAff.set(c.id, s); }
      const but = c.touchee ? 0 : Math.max(0, Math.min(1, c.k ?? 1));
      if (dt > 0) {
        if (but > s.k) { s.k = Math.min(but, s.k + dt / 0.15); s.b = 0; }
        else if (but < s.k) { s.k = Math.max(but, s.k - dt / 0.12); if (s.k <= 0) s.b = 1; }
        s.b = Math.max(0, s.b - dt / 0.3);
        s.flash = Math.max(0, s.flash - dt * 8);
      }
      // (au sol, le carton rebondit une fois)
      const kAff = s.k + 0.08 * Math.sin(Math.PI * (1 - s.b)) * s.b;
      const phi = (1 - kAff) * Math.PI / 2;
      _q.setFromEuler(_e.set(-phi, c.cap || 0, 0, 'YXZ'));
      _m.compose(_v.set(c.x, c.y || 0, c.z), _q, _w.set(1, 1, 1));
      _m.toArray(a, n * 16);
      const f = 1 + s.flash * 1.5; M.setColorAt(n, _c.setRGB(f, f, f));
      n++;
    }
    for (let i = n; i < (this._nCib || 0); i++) effacer(a, i);
    if (n || this._nCib) { M.instanceMatrix.needsUpdate = true; M.instanceColor.needsUpdate = true; }
    this._nCib = n; M.visible = n > 0;
  }
}

// le genre d'une grenade ('frag' | 'flash') dans un événement `explosion` ou `grenade` : son champ `type` — qui, chez Partie.evt,
// écrase le nom de l'événement — ou `arme` (ainsi chez L-A), `grenade`, `genre`
export function genreGrenade(e, quoi) { return e.arme === 'frag' || e.arme === 'flash' ? e.arme : e.type && e.type !== quoi ? e.type : e.grenade ?? e.genre ?? 'frag'; }

// ---------------------------------------------------------------- le monde solide, en lecture
// un DÉCALQUE va sur une forme HAUTE (un mur : y1 − y0 > 1,8) ou un plafond (`joueur === false`), jamais sur un vantail
// (il bouge : `mobile`, `vantail`), ni une forme éteinte, ni une barrière invisible (`limite`)
export function decalquable(f) {
  if (!f || f.off || f.mobile || f.vantail || f.porte || f.limite !== undefined && f.limite !== null && f.limite !== false) return false;
  return f.y1 - f.y0 > REGLAGES_EFFETS.impact.hautMin || f.joueur === false;
}
// la forme dont la surface passe par le point (à 6 cm près) et sa normale sortante — pour un impact dont la balistique
// n'a pas dit la forme (le squelette du socle) ; lu hors de toute autre requête au monde solide
export function formeAuPoint(C, x, y, z) {
  let best = null, bd = 0.06, bn = null;
  const voir = (f) => {
    if (f.off || f.balle === false || f.limite !== undefined && f.limite !== null && f.limite !== false) return;
    let d, n;
    if (f.t === 'c') {
      const ox = x - f.x, oz = z - f.z, r = Math.hypot(ox, oz) || 1e-9, dr = r - f.r, dy0 = f.y0 - y, dy1 = y - f.y1;
      d = Math.max(dr, dy0, dy1);
      n = d === dr ? [ox / r, 0, oz / r] : d === dy1 ? [0, 1, 0] : [0, -1, 0];
    } else {
      let lx, lz, hx, hz, c = 1, s = 0;
      if (f.t === 'b') { hx = (f.x1 - f.x0) / 2; hz = (f.z1 - f.z0) / 2; lx = x - (f.x0 + hx); lz = z - (f.z0 + hz); }
      else { hx = f.hx; hz = f.hz; c = f.c; s = f.s; const ox = x - f.cx, oz = z - f.cz; lx = ox * c + oz * s; lz = -ox * s + oz * c; }
      const ax = Math.abs(lx) - hx, az = Math.abs(lz) - hz, ay0 = f.y0 - y, ay1 = y - f.y1;
      d = Math.max(ax, az, ay0, ay1);
      let ln;
      if (d === ax) ln = [Math.sign(lx) || 1, 0]; else if (d === az) ln = [0, Math.sign(lz) || 1]; else ln = null;
      n = ln ? [ln[0] * c - ln[1] * s, 0, ln[0] * s + ln[1] * c] : d === ay1 ? [0, 1, 0] : [0, -1, 0];
    }
    if (Math.abs(d) < bd) { bd = Math.abs(d); best = f; bn = n; }
  };
  C._parcourir(x - 0.08, z - 0.08, x + 0.08, z + 0.08, voir);
  return best ? { f: best, n: bn } : null;
}
// le rayon O + t·D contre la boîte orientée d'une pose du registre (P = { cx, cz, hx, hz, y0, y1, c, s }) : t ou null
function rayonBoite(ox, oy, oz, dx, dy, dz, P) {
  if (!Number.isFinite(P.hx)) return null;
  const c = P.c ?? 1, s = P.s ?? 0, px = ox - P.cx, pz = oz - P.cz;
  const lx = px * c + pz * s, lz = -px * s + pz * c, ldx = dx * c + dz * s, ldz = -dx * s + dz * c;
  let t0 = 0, t1 = 60;
  const slab = (o, d, lo, hi) => { if (Math.abs(d) < 1e-9) return o >= lo && o <= hi; let a = (lo - o) / d, b = (hi - o) / d; if (a > b) { const k = a; a = b; b = k; } t0 = Math.max(t0, a); t1 = Math.min(t1, b); return t0 <= t1; };
  if (!slab(lx, ldx, -P.hx, P.hx) || !slab(lz, ldz, -P.hz, P.hz) || !slab(oy, dy, P.y0, P.y1)) return null;
  return t0;
}
