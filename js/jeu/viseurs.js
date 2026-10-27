// =====================================================================
//  LES VISEURS — point rouge, holographique, lunette × 3 (27/10/2026, demande de Haythem : « ajoute la possibilité de changer
//  le viseur de ton arme »)
// =====================================================================
// Trois optiques MODELÉES PAR LE CODE (aucun fichier), à l'échelle des vraies : un point rouge type micro (tube de 3,1 cm),
// un viseur holographique à fenêtre rectangulaire, une lunette compacte × 3 à cloche d'objectif. Chacune a son EMBASE, posée
// sur le rail de l'arme (MONTAGES : la hauteur du dessus du rail, mesurée sur les vrais GLB le 27/10), son verre (reflets de
// la carte d'environnement de l'arme de vue) et son RÉTICULE lumineux (une texture dessinée, additive, qui s'allume en
// visée). Le repère local : l'axe optique sur −Z (vers la bouche), l'origine au milieu de l'optique sur cet axe.
//
// `oeil` (repère de l'arme) : le point de l'axe que la visée pose à 0,24 m de l'œil (viewmodel.js) — choisi pour que la
// lentille arrière soit à `recul` de l'œil (14 cm pour les viseurs de type point rouge, 7,5 cm pour la lunette).
// Ce qui change au jeu (le zoom, le temps de visée) est dans la fiche (js/jeu/series.js VISEURS) ; ici, ce qu'on voit.
import * as THREE from 'three';

// LES MONTAGES (repère de l'arme, m) : `rail` le dessus du rail (ou du boîtier), `z` le milieu de l'optique, `axe` la
// hauteur de l'axe optique — le guidon d'origine juste sous le point (la co-visée « tiers bas » : FA-24 guidon à 0,131,
// l'axe à 0,138) ; la hausse rabattable de la FA-24 se COUCHE quand une optique est montée (`hausse` : la boîte de ses
// sommets, écrasés sur le rail — coucherHausse) ; PM-9 : hausse 0,106, guidon 0,098 — l'axe au-dessus des deux
export const MONTAGES = {
  fa24: { rail: 0.094, z: -0.13, axe: 0.138, zLunette: -0.17, hausse: { y: 0.097, z0: -0.035, z1: 0.03, x: 0.02 } },
  pm9: { rail: 0.091, z: -0.11, axe: 0.128, zLunette: -0.13 },
  fp12: { rail: 0.045, z: -0.15, axe: 0.082, zLunette: -0.17 },
};
export const TYPES_VISEURS = ['pointRouge', 'holo', 'lunette'];

const NOIR = () => new THREE.MeshStandardMaterial({ color: 0x18191b, roughness: 0.42, metalness: 0.55, name: 'viseur anodisé' });
const GRIS = () => new THREE.MeshStandardMaterial({ color: 0x2c2e31, roughness: 0.6, metalness: 0.4, name: 'viseur embase' });
const VERRE = (teinte = 0x7da2c8) => new THREE.MeshStandardMaterial({ color: teinte, roughness: 0.04, metalness: 0.9, transparent: true,
  opacity: 0.16, depthWrite: false, side: THREE.DoubleSide, name: 'viseur verre' });

// UN RÉTICULE dessiné (256 px) : `dessin(ctx, n)` trace en blanc sur fond transparent ; la teinte est celle du matériau
function reticule(dessin, taille, couleur) {
  const n = 256, cv = document.createElement('canvas'); cv.width = cv.height = n;
  const c = cv.getContext('2d');
  c.clearRect(0, 0, n, n); c.fillStyle = '#fff'; c.strokeStyle = '#fff';
  dessin(c, n);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  // (mélange NORMAL, couleur poussée au-delà de 1 : en additif, un point rouge sur un mur clair ne se voyait plus)
  const mat = new THREE.MeshBasicMaterial({ map: tex, color: new THREE.Color(couleur).multiplyScalar(1.6), transparent: true, opacity: 1,
    depthWrite: false, toneMapped: false, name: 'viseur réticule' });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(taille, taille), mat);
  m.renderOrder = 3; m.name = 'réticule';
  return m;
}
// un point lumineux au halo doux
const POINT = (c, n, r = 0.07) => {
  const g = c.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n * r * 1.8);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.45, 'rgba(255,255,255,0.95)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = g; c.beginPath(); c.arc(n / 2, n / 2, n * r * 1.8, 0, Math.PI * 2); c.fill();
};

const tube = (r, l, mat, seg = 28) => { const g = new THREE.CylinderGeometry(r, r, l, seg, 1, true); g.rotateX(Math.PI / 2); return new THREE.Mesh(g, mat); };
const disque = (r, mat, seg = 28) => new THREE.Mesh(new THREE.CircleGeometry(r, seg), mat);
const boite = (x, y, z, mat) => new THREE.Mesh(new THREE.BoxGeometry(x, y, z), mat);
const anneau = (r0, r1, mat) => new THREE.Mesh(new THREE.RingGeometry(r0, r1, 28), mat);

// L'EMBASE : du dessous de l'optique (`bas`, local) jusqu'au rail (`hRail` sous l'axe), avec sa vis de serrage à gauche
function embase(groupe, hRail, bas, long, mat) {
  const h = Math.max(0.004, hRail - bas);
  // (un col étroit et évidé — deux joues de 4 mm — plutôt qu'un bloc plein : vu de l'œil, il ne fait plus un pilier noir)
  for (const s of [-1, 1]) { const j = boite(0.004, h, long * 0.9, mat); j.position.set(s * 0.0075, -bas - h / 2, 0); groupe.add(j); }
  const pont = boite(0.019, 0.004, long * 0.9, mat); pont.position.set(0, -bas - 0.002, 0); groupe.add(pont);
  const pied = boite(0.026, 0.006, long * 0.8, mat); pied.position.set(0, -hRail + 0.003, 0); groupe.add(pied);
  const vis = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.008, 14), mat); vis.rotation.z = Math.PI / 2;
  vis.position.set(-0.016, -hRail + 0.006, 0); groupe.add(vis);
}

// LE POINT ROUGE (type micro : tube Ø 31 mm × 32 mm, pare-soleil avant, tourelles de réglage dessus et à droite)
function pointRouge(hRail) {
  const g = new THREE.Group(), N = NOIR(), E = GRIS(), V = VERRE(0x9ab8d8);
  const corps = tube(0.0155, 0.032, N); g.add(corps);
  const fond = tube(0.0135, 0.031, new THREE.MeshStandardMaterial({ color: 0x050506, roughness: 0.9, side: THREE.BackSide })); g.add(fond);
  const pare = tube(0.0165, 0.009, N); pare.position.z = -0.0195; g.add(pare);
  for (const z of [-0.024, 0.016]) { const a = anneau(0.0128, 0.0167, N); a.position.z = z; if (z > 0) a.rotation.y = Math.PI; g.add(a); }
  const av = disque(0.0135, V); av.position.z = -0.012; g.add(av);
  const ar = disque(0.0135, V); ar.position.z = 0.015; ar.rotation.y = Math.PI; g.add(ar);
  const t1 = new THREE.Mesh(new THREE.CylinderGeometry(0.0062, 0.0062, 0.007, 18), N); t1.position.set(0, 0.0185, -0.002); g.add(t1);
  const t2 = new THREE.Mesh(new THREE.CylinderGeometry(0.0062, 0.0062, 0.007, 18), N); t2.rotation.z = Math.PI / 2; t2.position.set(0.0185, 0, -0.002); g.add(t2);
  const bouton = boite(0.008, 0.006, 0.010, E); bouton.position.set(-0.0165, 0.004, 0.006); g.add(bouton);
  embase(g, hRail, 0.0135, 0.030, E);
  const R = reticule((c, n) => POINT(c, n, 0.07), 0.010, 0xff1a10); R.position.z = 0.0145; g.add(R);
  return { groupe: g, reticule: R, arriere: 0.016, recul: 0.14 };
}

// LE HOLOGRAPHIQUE (boîtier de piles long, fenêtre rectangulaire 30 × 23 mm sous un capot, boutons à l'arrière ; réticule :
// le cercle de 65 MOA et son point)
function holo(hRail) {
  const g = new THREE.Group(), N = NOIR(), E = GRIS(), V = VERRE(0xa9d0c8);
  const base = boite(0.034, 0.014, 0.080, N); base.position.set(0, -0.0205, -0.004); g.add(base);
  const haut = 0.0135, bas = -0.0135, demi = 0.0175, ep = 0.0035, L = 0.032;
  const capot = boite(demi * 2 + ep * 2, ep, L, N); capot.position.set(0, haut + ep / 2, 0.006); g.add(capot);
  for (const s of [-1, 1]) { const c = boite(ep, haut - bas + ep, L, N); c.position.set(s * (demi + ep / 2), (haut + bas) / 2 + ep / 2, 0.006); g.add(c); }
  const fa = new THREE.Mesh(new THREE.PlaneGeometry(demi * 2, haut - bas), V); fa.position.z = -0.009; g.add(fa);
  const fr = new THREE.Mesh(new THREE.PlaneGeometry(demi * 2, haut - bas), V); fr.position.z = 0.021; fr.rotation.y = Math.PI; g.add(fr);
  for (const x of [-0.008, 0.008]) { const b = boite(0.007, 0.006, 0.006, E); b.position.set(x, -0.0165, 0.037); g.add(b); }
  const lentille = boite(0.016, 0.010, 0.004, E); lentille.position.set(0, -0.009, -0.036); g.add(lentille);
  embase(g, hRail, 0.0275, 0.06, E);
  const R = reticule((c, n) => {
    c.lineWidth = n * 0.022; c.globalAlpha = 0.95;
    c.beginPath(); c.arc(n / 2, n / 2, n * 0.36, 0, Math.PI * 2); c.stroke();
    for (const [x, y] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) { c.beginPath(); c.moveTo(n / 2 + x * n * 0.36, n / 2 + y * n * 0.36); c.lineTo(n / 2 + x * n * 0.30, n / 2 + y * n * 0.30); c.stroke(); }
    c.globalAlpha = 1; POINT(c, n, 0.035);
  }, 0.018, 0xff3322);
  R.position.z = 0.020; g.add(R);
  return { groupe: g, reticule: R, arriere: 0.022, recul: 0.15 };
}

// LA LUNETTE × 3 (corps Ø 36 mm, cloche d'objectif Ø 48 mm, oculaire, la fibre optique dessus ; réticule : le chevron rouge
// et ses graduations de chute)
function lunette(hRail) {
  const g = new THREE.Group(), N = NOIR(), E = GRIS(), V = VERRE(0x6f8fb4);
  const corps = tube(0.018, 0.070, N); corps.position.z = 0.0; g.add(corps);
  const cone = new THREE.CylinderGeometry(0.024, 0.018, 0.022, 28, 1, true); cone.rotateX(-Math.PI / 2);
  const c = new THREE.Mesh(cone, N); c.position.z = -0.046; g.add(c);
  const cloche = tube(0.024, 0.026, N); cloche.position.z = -0.070; g.add(cloche);
  const oc = tube(0.0195, 0.022, N); oc.position.z = 0.046; g.add(oc);
  const bonnette = anneau(0.016, 0.0205, N); bonnette.position.z = 0.057; bonnette.rotation.y = Math.PI; g.add(bonnette);
  const nez = anneau(0.020, 0.0245, N); nez.position.z = -0.083; g.add(nez);
  const av = disque(0.021, V); av.position.z = -0.080; g.add(av);
  const ar = disque(0.016, V); ar.position.z = 0.055; ar.rotation.y = Math.PI; g.add(ar);
  const fond = tube(0.0165, 0.13, new THREE.MeshStandardMaterial({ color: 0x040405, roughness: 0.95, side: THREE.BackSide })); fond.position.z = -0.012; g.add(fond);
  const fibre = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.06, 12), new THREE.MeshStandardMaterial({ color: 0xc8402a, roughness: 0.3, emissive: 0x401008 }));
  fibre.rotation.x = Math.PI / 2; fibre.position.set(0, 0.021, -0.005); g.add(fibre);
  for (const z of [-0.028, 0.018]) { const s = boite(0.008, 0.005, 0.008, N); s.position.set(0, 0.0205, z); g.add(s); }
  const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.008, 18), N); tr.rotation.z = Math.PI / 2; tr.position.set(0.021, 0, 0); g.add(tr);
  embase(g, hRail, 0.016, 0.05, E);
  const R = reticule((c2, n) => {
    c2.lineWidth = n * 0.018; c2.lineJoin = 'miter';
    c2.beginPath(); c2.moveTo(n * 0.40, n * 0.56); c2.lineTo(n / 2, n * 0.47); c2.lineTo(n * 0.60, n * 0.56); c2.stroke();
    c2.lineWidth = n * 0.008; c2.beginPath(); c2.moveTo(n / 2, n * 0.53); c2.lineTo(n / 2, n * 0.86); c2.stroke();
    for (let k = 1; k <= 4; k++) { const y = n * (0.60 + k * 0.06), w = n * (0.09 - k * 0.015); c2.beginPath(); c2.moveTo(n / 2 - w, y); c2.lineTo(n / 2 + w, y); c2.stroke(); }
  }, 0.026, 0xff4428);
  R.position.z = 0.0535; g.add(R);
  return { groupe: g, reticule: R, arriere: 0.057, recul: 0.075 };
}

const FABRIQUES = { pointRouge, holo, lunette };

// LA HAUSSE COUCHÉE : les sommets de la hausse rabattable (dans la boîte `M.hausse`, repère de l'arme) écrasés sur le rail,
// sur une COPIE de la géométrie (celle du GLB est partagée avec les armes des bots) ; `couche(vrai|faux)` échange les deux
export function coucherHausse(id, arme) {
  const H = MONTAGES[id] && MONTAGES[id].hausse;
  if (!H) return null;
  let m = null; arme.traverse((o) => { if (o.isMesh && !m && o.geometry && o.geometry.attributes.position.count > 1000) m = o; });
  if (!m) return null;
  arme.updateMatrixWorld(true);
  const M = new THREE.Matrix4().copy(arme.matrixWorld).invert().multiply(m.matrixWorld), Mi = M.clone().invert();
  const g0 = m.geometry, g1 = g0.clone(), P = g1.attributes.position, v = new THREE.Vector3();
  let n = 0;
  for (let i = 0; i < P.count; i++) {
    v.fromBufferAttribute(P, i).applyMatrix4(M);
    if (v.y <= H.y || v.z < H.z0 || v.z > H.z1 || Math.abs(v.x) > H.x) continue;
    v.y = MONTAGES[id].rail + 0.003 + (v.y - H.y) * 0.08; v.applyMatrix4(Mi); P.setXYZ(i, v.x, v.y, v.z); n++;
  }
  P.needsUpdate = true;
  return { n, couche: (oui) => { m.geometry = oui ? g1 : g0; } };
}

// LES VISEURS D'UNE ARME de vue, créés une fois (cachés) : { type: { groupe, reticule, oeil: [x, y, z] } } — null si l'arme
// n'a pas de montage
export function creerViseurs(id, arme) {
  const M = MONTAGES[id];
  if (!M) return null;
  const out = {};
  for (const type of TYPES_VISEURS) {
    const z = type === 'lunette' ? M.zLunette : M.z, v = FABRIQUES[type](M.axe - M.rail);
    v.groupe.position.set(0, M.axe, z); v.groupe.visible = false; v.groupe.name = 'viseur ' + type;
    v.groupe.traverse((o) => { if (o.isMesh) { o.frustumCulled = false; o.castShadow = false; o.receiveShadow = false; } });
    arme.add(v.groupe);
    out[type] = { groupe: v.groupe, reticule: v.reticule, oeil: [0, M.axe, z + v.arriere - (0.24 - v.recul)] };
  }
  return out;
}
