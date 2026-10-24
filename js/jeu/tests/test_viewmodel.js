// =====================================================================
//  LES TESTS DE L'ARME DE VUE (lot L-V, 23/10/2026 ; spec § 5.5.4, acceptation, points 1 à 15)
// =====================================================================
// Lancés par le harnais sous `?test=1&rapport=1&lot=L-V` (window.__rapport). Les tests ne cliquent jamais : tout passe par
// window.__jeu, et l'arme de vue se pilote aussi par des ÉTATS FABRIQUÉS (`maj(dt, etat)` est une pure lecture d'état) —
// c'est ainsi qu'on parcourt les gestes que l'arsenal du socle n'a pas encore (couteau, grenade, glissade, franchissement :
// L-A, L-B) ; ce que le vrai module d'un autre lot doit montrer est rejoué par F2 (`apresFusion`).
// LA MAQUETTE (`maquette(id)`) : des boîtes aux cotes de CoD § 6.2 (boîtier, poignée inclinée, garde-main, chargeur,
// canon, crosse) posées sur les REPÈRES de la spécification — le banc de réglage des mains tant que les vrais modèles de
// L-W ne sont pas là (le socle n'a qu'une boîte par arme). Elle ne sert qu'aux tests et aux photos.
import * as THREE from 'three';
import { REPERES } from '../modeles_armes.js';
import { Viewmodel, CHAMP_VUE, repereVisee } from '../viewmodel.js';
import { CHRONOS, VOIES, evaluer } from '../anim_vue.js';
import { ARMES } from '../armes.js';

const DEG = Math.PI / 180;
const r3 = (v) => Math.round(v * 1000) / 1000;

// ---------------------------------------------------------------- la maquette (cotes de CoD § 6.2)
let _matM = null;
export function maquette(id) {
  const m = _matM || (_matM = { corps: new THREE.MeshStandardMaterial({ color: 0x2b2d30, roughness: 0.6, metalness: 0.3 }),
    teinte: new THREE.MeshStandardMaterial({ color: 0x9a8665, roughness: 0.7 }), acier: new THREE.MeshStandardMaterial({ color: 0x24272b, roughness: 0.38, metalness: 0.85 }) });
  const g = new THREE.Group(); g.name = 'maquette ' + id;
  const boite = (mat, w, h, l, x, y, z, rx = 0) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), mat); b.position.set(x, y, z); b.rotation.x = rx; g.add(b); return b; };
  const cyl = (mat, r, l, x, y, z) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, l, 10), mat); c.rotation.x = Math.PI / 2; c.position.set(x, y, z); g.add(c); return c; };
  const os = {};
  if (id === 'fa24' || id === 'pm9' || id === 'tp50') {
    const L = id === 'pm9' ? 0.62 / 0.84 : id === 'tp50' ? 1.10 / 0.84 : 1;
    boite(m.teinte, 0.05, 0.075, 0.28 * Math.min(1, L), 0, 0.03, -0.08);                               // boîtier
    boite(m.corps, 0.03, 0.11, 0.04, 0, -0.055, 0.025, -18 * DEG);                                       // poignée, 18°
    const gm = REPERES[id].mainG[2];
    boite(m.corps, 0.056, 0.06, 0.26 * L, 0, 0.03, gm + 0.02);                                          // garde-main
    const b = REPERES[id].bouche;
    cyl(m.acier, 0.011, Math.abs(b[2]) - 0.42 * L, 0, b[1], (b[2] - 0.42 * L) / 2);                     // canon
    boite(m.corps, 0.04, 0.08, 0.20, 0, 0.02, 0.10 * (REPERES[id].crosse ? REPERES[id].crosse[2] / 0.2 : 1));   // crosse
    os.chargeur = boite(m.corps, 0.03, id === 'tp50' ? 0.09 : 0.17, 0.06, 0, id === 'tp50' ? -0.03 : -0.075, id === 'pm9' ? -0.06 : -0.11, id === 'fa24' ? 0.2 : 0);
    boite(m.acier, 0.03, 0.03, 0.05, 0, REPERES[id].visee[1] - 0.012, REPERES[id].visee[2]);            // visée
  } else if (id === 'fp12') {
    boite(m.teinte, 0.05, 0.07, 0.30, 0, 0.03, -0.10); boite(m.corps, 0.03, 0.11, 0.04, 0, -0.055, 0.025, -18 * DEG);
    cyl(m.acier, 0.012, 0.62, 0, 0.035, -0.47); cyl(m.acier, 0.011, 0.40, 0, 0.005, -0.42);
    os.pompe = boite(m.corps, 0.05, 0.05, 0.18, 0, 0.0, REPERES.fp12.mainG[2]); boite(m.corps, 0.04, 0.08, 0.22, 0, 0.02, 0.11);
  } else if (id === 'p17') {
    os.glissiere = boite(m.corps, 0.028, 0.035, 0.19, 0, 0.035, -0.045); boite(m.corps, 0.026, 0.11, 0.035, 0, -0.045, 0.015, -15 * DEG);
  } else if (id === 'couteau') { boite(m.acier, 0.004, 0.03, 0.17, 0, 0, -0.11); boite(m.corps, 0.02, 0.025, 0.11, 0, 0, 0.0); }
  else { const s = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), m.teinte); g.add(s); }
  for (const o of Object.values(os)) o.userData.repos = null;
  g.userData.os = { chargeur: os.chargeur || null, culasse: null, glissiere: os.glissiere || null, pompe: os.pompe || null, detente: null, goupille: null };
  g.userData.arme = id; g.userData.reperes = {}; g.userData.maquette = true;
  g.traverse((o) => { if (o.isMesh) o.frustumCulled = false; });
  return g;
}
// LES MAQUETTES posées dans l'arme de vue à la place des armes du socle (rendues par `rendre()`)
export function poserMaquettes(vm) {
  const avant = { ...vm.armes };
  for (const id of ['fa24', 'pm9', 'fp12', 'tp50', 'p17', 'couteau', 'frag', 'flash']) {
    const a = vm.armes[id]; if (!a) continue;
    const q = maquette(id); q.visible = a.visible;
    a.parent.add(q); a.parent.remove(a); vm.armes[id] = q;
    if (vm.objets[id]) vm.objets[id] = q;
    if (vm.courante === a) vm.courante = q;
  }
  return () => {
    for (const [id, a] of Object.entries(avant)) {
      const q = vm.armes[id]; if (q === a) continue;
      a.visible = q.visible; q.parent.add(a); q.parent.remove(q); vm.armes[id] = a;
      if (vm.objets[id]) vm.objets[id] = a;
      if (vm.courante === q) vm.courante = a;
    }
  };
}

// ---------------------------------------------------------------- les états fabriqués
// l'état de VueFPS.etatArme (§ 4.5.7) et les champs que l'arme de vue lit dans l'arsenal, donnés ici (rien n'est lu de la
// partie en cours) ; `o` les remplace
export const ETAT = { arme: 'fa24', etatArme: 'pret', tEtat: 1, visee: 0, tirFront: false, reculV: 0, reculH: 0, sprint: false, sprintTact: false,
  glisse: 0, vitesse: 0, lacetV: 0, tangageV: 0, accroupi: 0, enAir: false, mort: false, lateral: 0, tirSeq: 0, vers: null, duree: null,
  tactique: true, chargeur: 30, grenade: 'frag', cuisson: false };
export const etat = (o = {}) => ({ ...ETAT, ...o });
// LES POSES FIXES et LES GESTES de chaque arme : [nom, état] (les gestes : l'état à l'heure t de la piste)
const POSES = [['hanche', {}], ['visee', { visee: 1 }], ['sprint', { sprint: true, vitesse: 6.6 }], ['sprintTact', { sprint: true, sprintTact: true, vitesse: 7.8 }],
  ['glisse', { glisse: 1, vitesse: 7 }], ['franchit', { etatArme: 'franchit' }], ['accroupi', { accroupi: 1 }]];
const ARMES_VUE = ['fa24', 'pm9', 'fp12', 'tp50', 'p17'];
function gestes(id) {
  const f = ARMES[id], L = [];
  if (id === 'fp12') {
    const r = f.recharge;
    for (const [n, vide] of [[2, false], [7, true]]) {
      const D = r.debut + r.parCartouche * n + r.fin + (vide ? r.pompe : 0);
      L.push(['recharge' + (vide ? 'Vide' : ''), D, { etatArme: 'recharge', tactique: !vide, duree: D, chargeur: vide ? 0 : 5 }]);
    }
  } else { L.push(['rechargeTact', f.recharge.tact, { etatArme: 'recharge', tactique: true }]); L.push(['rechargeVide', f.recharge.vide, { etatArme: 'recharge', tactique: false, chargeur: 0 }]); }
  const autre = id === 'p17' ? 'fa24' : 'p17';
  L.push(['change', f.rangement + ARMES[autre].sortie, { etatArme: 'change', vers: autre }]);
  L.push(['couteau', ARMES.couteau.coup, { etatArme: 'couteau' }]);
  L.push(['grenade', 1.5, { etatArme: 'lancer', cuisson: true }], ['flash', 1.0, { etatArme: 'lancer', grenade: 'flash', cuisson: false }]);
  return L;
}
// l'arme de vue de la partie en cours, ses poses calmées (sortie de l'étui finie, ressorts au repos)
const calmer = (vm, e, n = 90) => { vm._sortieT = -1; for (let i = 0; i < n; i++) vm.maj(1 / 60, e); };
// un ÉTAT FORCÉ pendant les images rendues (Partie.image lit VueFPS.etatArme) : `f(t)` rend l'état à l'instant t (s)
function forcer(p, f) {
  let t = 0, avant = performance.now();
  p.vue.etatArme = () => { const n = performance.now(); t += Math.min(0.1, (n - avant) / 1000); avant = n; return f(t); };
  return () => { delete p.vue.etatArme; };
}
// l'angle (rad) d'un point SOUS le plan du bord bas du cône de la caméra (champ vertical `fov`, degrés) : > 0 = sous le bord
function sousLeBord(cam, v, fov) {
  const q = v.clone().applyMatrix4(cam.matrixWorldInverse), h = fov / 2 * DEG;
  return -Math.asin((q.y * Math.cos(h) - q.z * Math.sin(h)) / q.length());
}
const game0 = () => window.__game;
// le compte des variantes de programmes des matériaux de l'arme de vue (three : properties.programs, une par clé)
function programmesVue(vm) {
  const r = game0().renderer, vus = new Set(); let n = 0;
  vm.scene.traverse((o) => { if (o.material) for (const m of Array.isArray(o.material) ? o.material : [o.material]) vus.add(m); });
  for (const m of vus) { const P = r.properties.get(m).programs; n += P ? P.size : 0; }
  return n;
}
// ce qu'une image de l'arme de vue coûte en APPELS : sa scène rendue seule dans une petite cible
let _cible = null;
function appelsVue(vm) {
  const r = game0().renderer, avant = r.getRenderTarget(), auto = r.info.autoReset;
  _cible = _cible || new THREE.WebGLRenderTarget(64, 36, { type: THREE.HalfFloatType });
  try { r.info.autoReset = true; r.setRenderTarget(_cible); r.render(vm.scene, vm.camera); return { appels: r.info.render.calls, triangles: r.info.render.triangles }; }
  finally { r.setRenderTarget(avant); r.info.autoReset = auto; }
}
// un NaN quelque part dans l'arme de vue (matrices, os des bras, lumières, champ)
function sansNaN(vm) {
  const ok = (a) => { for (const x of a) if (!Number.isFinite(x)) return false; return true; };
  if (!ok(vm.racine.matrixWorld.elements) || !ok(vm.tenus.matrixWorld.elements) || !Number.isFinite(vm.camera.fov)) return false;
  for (const L of [vm.hemi, vm.cle, vm.bouche]) if (!Number.isFinite(L.intensity) || !ok(L.position.toArray())) return false;
  if (vm.bras) for (const [b] of vm.bras.repos) if (!ok(b.quaternion.toArray()) || !ok(b.position.toArray())) return false;
  for (const o of Object.values(vm.objets)) if (!ok(o.position.toArray()) || !ok(o.quaternion.toArray())) return false;
  return ['erreurD', 'erreurG', 'chargeur', 'piston', 'cabre', 'roulis', 'cle'].every((k) => Number.isFinite(vm.diag[k]));
}
const essai = async (jeu, o = {}) => { await jeu.lancer('essai', { graine: 31, mannequins: 1, ...o }); await jeu.images(2); return game0().partie; };
const nomQ = (q) => (q === 'low' ? 'basse' : q === 'medium' ? 'moyenne' : q === 'ultra' ? 'ultra' : 'haute');

export default function (jeu) {
  const game = window.__game;
  const T = (nom, fn, opts) => jeu.ajouterTest('L-V', nom, fn, opts);

  // 1. LES APPELS de la superposition : ≤ 8 dans tous les états (bras 2 + arme ≤ 6 ; avec la boîte du socle : 3) — comptés
  // qualité figée en moyenne (§ 4.10.1)
  T('1 appels de la superposition ≤ 8', async () => {
    jeu.figerQualite(true);
    const q0 = game.fx.quality;
    try { await jeu.qualite('moyenne'); return await test1(); } finally { await jeu.qualite(nomQ(q0)); jeu.figerQualite(false); }
  });
  const test1 = async () => {
    const p = await essai(jeu), vm = p.aff.viewmodel;
    let max = 0, pire = '', hanche = 0, bras = 0;
    const L = [];
    for (const id of ARMES_VUE) {
      for (const [n, o] of POSES) L.push([id + '.' + n, etat({ arme: id, ...o })]);
      for (const [n, D, o] of gestes(id)) for (const t of [0.1, 0.3, 0.6, 0.9, 1.3]) if (t < D) L.push([id + '.' + n + '@' + t, etat({ arme: id, tEtat: t, ...o })]);
    }
    for (const [n, e] of L) {
      vm.maj(1 / 60, e); vm.maj(1 / 60, e);
      const { appels } = appelsVue(vm);
      if (n === 'fa24.hanche') hanche = appels;
      if (appels > max) { max = appels; pire = n; }
    }
    if (vm.bras) vm.bras.groupe.traverse((o) => { if (o.isMesh) bras++; });
    jeu.quitter('balade');
    return { ok: max <= 8 && hanche >= 1 && bras === 2, attendu: '≤ 8 appels dans chaque état (bras 2 + arme ≤ 6) ; boîte du socle : 3 à la hanche',
      obtenu: `${L.length} états · max ${max} (${pire}) · hanche ${hanche} · bras ${bras} maillages · qualité ${game.fx.quality}` };
  };

  // 2. LES LUMIÈRES de la scène de l'arme : 3, les mêmes, pendant 60 s qui parcourent tous les états ; la scène de JEU intacte
  T('2 trois lumières pendant 60 s de tous les états', async () => {
    const p = await essai(jeu), vm = p.aff.viewmodel;
    const lum = (s) => { const L = []; s.traverse((o) => { if (o.isLight) L.push(o); }); return L; };
    const L0 = lum(vm.scene), jeu0 = lum(game.scene).length;
    const seq = [];
    for (const id of ARMES_VUE) {
      for (const [, o] of POSES) seq.push([1, () => ({ arme: id, ...o })]);
      for (const [, D, o] of gestes(id)) seq.push([D, (t) => ({ arme: id, tEtat: t, ...o })]);
    }
    let n = 0, mauvais = 0, k = 0, t = 0, tirs = 0;
    while (n < 3600) {
      const [D, f] = seq[k % seq.length];
      if (t >= D) { k++; t = 0; continue; }
      if (n % 7 === 0) tirs++;
      const o = f(t);
      vm.maj(1 / 60, etat({ ...o, tirSeq: tirs, vitesse: o.vitesse ?? (n % 300 < 150 ? 5 : 0) }));
      const L = lum(vm.scene);
      if (L.length !== 3 || L.some((l, i) => l !== L0[i] || !l.visible || !Number.isFinite(l.intensity) || l.castShadow)) mauvais++;
      t += 1 / 60; n++;
    }
    const jeu1 = lum(game.scene).length;
    jeu.quitter('balade');
    return { ok: L0.length === 3 && mauvais === 0 && jeu0 === jeu1, attendu: '3 lumières (hémisphère, clé, bouche), les mêmes, à chacune des 3 600 images (60 s) ; scène de jeu : même nombre',
      obtenu: `${L0.length} (${L0.map((l) => l.type).join(', ')}) · ${mauvais} image(s) fautive(s) sur ${n} (${k} états) · scène de jeu ${jeu0} → ${jeu1}` };
  });

  // 3. LES PROGRAMMES constants après la préparation, pendant 10 s de tir, recharges, changements, sprint, glissade, visée,
  // couteau, grenade (images RENDUES ; les gestes que l'arsenal du socle n'a pas : par l'état forcé) — la qualité FIGÉE
  // (§ 4.10.1 : sous ?tel=1, la qualité automatique changeait de préréglage en route et ajoutait un programme au DÉCOR)
  T('3 programmes constants pendant 10 s de gestes', async (t) => {
    jeu.figerQualite(true);
    try { return await test3(t); } finally { jeu.figerQualite(false); }
  }, { delai: 60 });
  const test3 = async (t) => {
    const p = await essai(jeu), vm = p.aff.viewmodel, r = game.renderer;
    await jeu.images(4);
    const g0 = r.info.programs.length, v0 = programmesVue(vm);
    const etapes = [];
    for (const id of ARMES_VUE) {
      etapes.push([0.4, (s) => etat({ arme: id, tirSeq: Math.floor(s * 12), vitesse: 5 })]);
      for (const [, D, o] of gestes(id)) etapes.push([Math.min(D, 1.2), (s) => etat({ arme: id, tEtat: s, ...o })]);
      etapes.push([0.3, () => etat({ arme: id, sprint: true, vitesse: 6.6 })], [0.3, () => etat({ arme: id, glisse: 1, vitesse: 7 })], [0.3, () => etat({ arme: id, visee: 1 })]);
    }
    const D = etapes.reduce((s, [d]) => s + d, 0), k = 10 / D;
    const rendre = forcer(p, (s) => { s /= k; let a = 0; for (const [d, f] of etapes) { if (s < a + d) return f(s - a); a += d; } return etat(); });
    const t0 = performance.now(); let images = 0;
    // (le vrai tir de l'arsenal en même temps)
    jeu.commande(0, { tir: true }, 10);
    try { while (performance.now() - t0 < 10500) { const R = await jeu.images(10); images += R.n; } } finally { rendre(); }
    const g1 = r.info.programs.length, v1 = programmesVue(vm);
    jeu.quitter('balade');
    t.note('images rendues (3)', images);
    return { ok: v0 === v1 && g1 === g0 && images > 50, attendu: 'variantes des programmes de l’arme et programmes du jeu constants (qualité figée)',
      obtenu: `arme ${v0} → ${v1} · jeu ${g0} → ${g1} · ${images} images, ${etapes.length} étapes en ${Math.round(D * k)} s · qualité ${game.fx.quality}` };
  };

  // 4 et 5. LES ÉPAULES hors champ et LES MAINS tenues : toutes les poses, toutes les clés des pistes au pas de 0,05 s
  const parcours = (vm, f) => {
    for (const id of ARMES_VUE) {
      for (const [n, o] of POSES) { calmer(vm, etat({ arme: id, ...o }), 60); f(id + '.' + n, true); }
      for (const [n, D, o] of gestes(id)) {
        calmer(vm, etat({ arme: id }), 30);
        for (let s = 0; s <= D + 1e-9; s += 0.05) { vm.maj(1 / 60, etat({ arme: id, tEtat: s, ...o })); f(id + '.' + n + '@' + s.toFixed(2), false); }
      }
    }
  };
  T('4 épaules ≥ 4° sous le bord bas, dans toutes les poses et toutes les clés', async () => {
    const p = await essai(jeu), vm = p.aff.viewmodel, cam = vm.camera;
    let pire = Infinity, ou = '', n = 0;
    parcours(vm, (nom) => {
      cam.updateMatrixWorld();
      for (const A of [vm._ancreD, vm._ancreG]) {
        const a = Math.min(sousLeBord(cam, A, cam.fov), sousLeBord(cam, A, CHAMP_VUE)) / DEG; n++;
        if (a < pire) { pire = a; ou = nom; }
      }
    });
    jeu.quitter('balade');
    return { ok: pire >= 4, attendu: '≥ 4° sous le bord bas de la caméra de l’arme (52°, et son champ du moment)', obtenu: `pire ${r3(pire)}° (${ou}) sur ${n} ancres` };
  });
  T('5 mains : IK ≤ 1 cm en pose fixe, ≤ 2 cm en geste', async () => {
    const p = await essai(jeu), vm = p.aff.viewmodel;
    let fixe = 0, geste = 0, ouF = '', ouG = '', n = 0;
    parcours(vm, (nom, estFixe) => {
      const e = Math.max(vm.diag.erreurD, vm.diag.erreurG); n++;
      if (estFixe) { if (e > fixe) { fixe = e; ouF = nom; } } else if (e > geste) { geste = e; ouG = nom; }
    });
    jeu.quitter('balade');
    return { ok: !!vm.bras && fixe <= 0.01 && geste <= 0.02, attendu: 'erreur du poignet ≤ 1 cm (poses), ≤ 2 cm (gestes)',
      obtenu: `bras ${!!vm.bras} · poses ${r3(fixe * 100)} cm (${ouF || '—'}) · gestes ${r3(geste * 100)} cm (${ouG || '—'}) · ${n} mesures` };
  });

  // 6. LA VISÉE : le repère `visee` sur l'axe de la caméra de l'arme à ± 1 mm, à 0,24 m ; centré à ± 1 px en 1280 × 720
  T('6 visée : le repère sur l’axe à 0,24 m, centré à ± 1 px', async () => {
    const p = await essai(jeu), vm = p.aff.viewmodel, cam = vm.camera;
    const L = [];
    let ok = true;
    for (const id of ARMES_VUE) {
      calmer(vm, etat({ arme: id, visee: 1 }), 120);
      cam.updateMatrixWorld();
      const v = new THREE.Vector3(...repereVisee(id)).applyMatrix4(vm.racine.matrixWorld).applyMatrix4(cam.matrixWorldInverse);
      const a = cam.aspect; cam.aspect = 1280 / 720; cam.updateProjectionMatrix();
      const q = v.clone().project(cam); cam.aspect = a; cam.updateProjectionMatrix();
      const px = q.x * 640, py = q.y * 360;
      const bon = Math.abs(v.x) <= 0.001 && Math.abs(v.y) <= 0.001 && Math.abs(v.z + 0.24) <= 0.001 && Math.abs(px) <= 1 && Math.abs(py) <= 1;
      ok = ok && bon;
      L.push(`${id} (${r3(v.x * 1000)}, ${r3(v.y * 1000)}, ${r3(v.z * 1000)}) mm · ${r3(px)}/${r3(py)} px`);
    }
    jeu.quitter('balade');
    return { ok, attendu: 'x, y à ± 1 mm, z = −240 ± 1 mm ; écart au centre ≤ 1 px', obtenu: L.join(' ; ') };
  });

  // 7. LA RECHARGE DE LA FA-24 FORCÉE : le chargeur part à 0,55 s, le neuf en place à 1,35 s (± 1 image de tEtat) — par l'état
  // fabriqué, puis par la VRAIE recharge de l'arsenal (son événement « insere » à l'heure du chargeur en place)
  T('7 recharge FA-24 : le chargeur part à 0,55 s, en place à 1,35 s', async () => {
    const p = await essai(jeu), vm = p.aff.viewmodel, img = 1 / 60;
    calmer(vm, etat(), 30);
    let part = null, place = null;
    for (let s = 0; s <= 1.9 + 1e-9; s += img) {
      vm.maj(img, etat({ etatArme: 'recharge', tEtat: s, tactique: true, duree: 1.9 }));
      if (part === null && vm.diag.chargeur > 0.002) part = s;
      if (part !== null && place === null && s > 1.0 && vm.diag.chargeur < 0.0002) place = s;
    }
    // la vraie : 5 balles tirées, R, les images au fil de l'arsenal
    const A = p.local.arsenal;
    jeu.tirer(0, { n: 5 });
    let tInsere = null;
    const des = p.sur('recharge', (ev) => { if (ev.a === 0 && ev.phase === 'insere') tInsere = A.tEtat; });
    jeu.commande(0, { recharger: true }, 1 / 60);
    // (« ± 1 image » de la vraie : l'image où on le voit et la précédente encadrent l'heure, à la durée de CETTE image près —
    // les images de la boucle ne font pas toutes 1/60 s)
    let partV = null, placeV = null, n = 0, vue = false, sAvant = 0, dPart = img, dPlace = img;
    while (n++ < 600) {
      await jeu.images(1);
      if (A.etatArme !== 'recharge') { if (vue) break; continue; }
      vue = true;
      const s = A.tEtat;
      if (partV === null && vm.diag.chargeur > 0.002) { partV = s; dPart = Math.max(img, s - sAvant); }
      if (partV !== null && placeV === null && s > 1.0 && vm.diag.chargeur < 0.0002) { placeV = s; dPlace = Math.max(img, s - sAvant); }
      sAvant = s;
    }
    des();
    jeu.quitter('balade');
    const pr = (x) => (x === null ? '—' : r3(x));
    const ok = part !== null && Math.abs(part - 0.55) <= img + 1e-6 && place !== null && Math.abs(place - 1.35) <= img + 1e-6
      && partV !== null && Math.abs(partV - 0.55) <= dPart + 1e-6 && placeV !== null && Math.abs(placeV - 1.35) <= dPlace + 1e-6
      && tInsere !== null && Math.abs(tInsere - 1.35) <= dPlace + 1e-6;
    return { ok, attendu: 'départ 0,55 ± 1 image, en place 1,35 ± 1 image (fabriqué, et la vraie recharge : balles entrées à 1,35)',
      obtenu: `fabriqué : part ${pr(part)} s, en place ${pr(place)} s · vraie : part ${pr(partV)} s (image ${pr(dPart)}), en place ${pr(placeV)} s (image ${pr(dPlace)}), balles entrées ${pr(tInsere)} s` };
  });

  // 8. LE RECUL VISUEL : pics du piston et du cabré du § 3.4 à ± 5 %, retour sous 2 % en ≤ 0,25 s (le ressort de l'arme de vue,
  // quand l'arsenal ne donne pas le sien) ; la caméra et ses 15 % : à F2 (test « F2 recul »)
  T('8 recul visuel : pics à ± 5 %, retour sous 2 % en ≤ 0,25 s', async () => {
    const p = await essai(jeu), vm = p.aff.viewmodel, h = 1 / 240;
    const L = []; let ok = true;
    for (const id of ARMES_VUE) {
      const R = ARMES[id].recul;
      calmer(vm, etat({ arme: id, tirSeq: 0 }), 60);
      let pPic = 0, cPic = 0, retour = 0;
      for (let s = 0; s < 0.6; s += h) {
        vm.maj(h, etat({ arme: id, tirSeq: 1 }));
        const P = vm.diag.piston, C = vm.diag.cabre;
        if (P > pPic) pPic = P;
        if (C > cPic) cPic = C;
        if (Math.abs(P) > 0.02 * R.piston || Math.abs(C) > 0.02 * R.cabre) retour = s + h;
      }
      const bon = Math.abs(pPic / R.piston - 1) <= 0.05 && Math.abs(cPic / R.cabre - 1) <= 0.05 && retour <= 0.25;
      ok = ok && bon;
      L.push(`${id} piston ${r3(pPic * 100)}/${r3(R.piston * 100)} cm · cabré ${r3(cPic)}/${R.cabre}° · retour ${r3(retour)} s`);
    }
    // LA CAMÉRA REÇOIT 15 % DU CABRÉ, et l'arme montre le même : le cabré de l'arsenal (`reculV`, nul au squelette) posé ici
    // par le ressort de la fiche (ω 35, ζ 0,55, pic 2,2°), lu par VueFPS.poser et par l'arme de vue dans les vraies images
    // (le vrai ressort de L-A : test « F2 recul »)
    const A = p.local.arsenal, Rf = ARMES.fa24.recul, w = 35, z = 0.55, wd = w * Math.sqrt(1 - z * z), tp = Math.atan(wd / (z * w)) / wd;
    const pulse = (s) => Math.exp(-z * w * s) * Math.sin(wd * s) / (Math.exp(-z * w * tp) * Math.sin(wd * tp));
    let sR = -1, camPire = 0, armePire = 0, vus = 0, picVu = 0;
    Object.defineProperty(A, 'reculV', { configurable: true, get: () => (sR > 0 ? Rf.cabre * pulse(sR) : 0) });
    try {
      calmer(vm, etat(), 1);
      for (let k = 0; k <= 20; k++) {
        sR = k / 60;
        await jeu.images(1);
        const rv = A.reculV, cam = (game.camera.rotation.x + game.camPitch) / DEG;
        picVu = Math.max(picVu, rv);
        if (rv > 0.1 * Rf.cabre) {
          vus++;
          camPire = Math.max(camPire, Math.abs(cam / (0.15 * rv) - 1));
          armePire = Math.max(armePire, Math.abs(vm.diag.cabre / rv - 1));
        }
      }
    } finally { delete A.reculV; }
    const okCam = vus >= 5 && camPire <= 0.01 && armePire <= 0.01;
    L.push(`caméra : ${vus} images, écart à 15 % ${r3(camPire * 100)} % · arme = reculV à ${r3(armePire * 100)} % (pic ${r3(picVu)}°)`);
    jeu.quitter('balade');
    return { ok: ok && okCam, attendu: 'piston et cabré = § 3.4 ± 5 % ; sous 2 % en ≤ 0,25 s ; la caméra reçoit 15 % du cabré (± 1 %), l’arme le même',
      obtenu: L.join(' ; ') };
  });

  // 9. LA LUNETTE DU TP-50 : visée ≥ 0,85 → l'arme de vue cachée ; < 0,85 → montrée
  T('9 TP-50 : cachée à 85 % de visée, montrée en deçà', async () => {
    const p = await essai(jeu), vm = p.aff.viewmodel;
    const vu = () => vm.racine.visible && (!vm.bras || vm.bras.groupe.visible);
    calmer(vm, etat({ arme: 'tp50', visee: 0.84 }), 10); const a = vu();
    vm.maj(1 / 60, etat({ arme: 'tp50', visee: 0.85 })); const b = vu();
    vm.maj(1 / 60, etat({ arme: 'tp50', visee: 1 })); const c = vu();
    vm.maj(1 / 60, etat({ arme: 'tp50', visee: 0.5 })); const d = vu();
    vm.maj(1 / 60, etat({ arme: 'fa24', visee: 1 })); const e = vu();
    jeu.quitter('balade');
    return { ok: a && !b && !c && d && e, attendu: '0,84 montrée · 0,85 et 1 cachée · 0,5 montrée · FA-24 en visée montrée', obtenu: `${a} · ${b} · ${c} · ${d} · ${e}` };
  });

  // 10. LE COÛT de `maj` (≤ 0,15 ms par image, temps) ; 10 000 images aux états tirés au hasard : 0 NaN
  T('10 maj ≤ 0,15 ms ; 10 000 états au hasard sans NaN', async (t) => {
    const p = await essai(jeu), vm = p.aff.viewmodel;
    const e0 = etat({ vitesse: 5, lateral: 2 });
    calmer(vm, e0, 200);
    const N = 3000, l0 = game.camYaw, t0 = performance.now();
    for (let i = 0; i < N; i++) { game.camYaw = l0 + 0.002 * (i % 200); vm.maj(1 / 60, e0); }
    const ms = (performance.now() - t0) / N;
    // (le hasard semé : le test est rejouable)
    let s = 12345; const al = () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; };
    const ets = ['pret', 'tir', 'recharge', 'change', 'sprint', 'couteau', 'lancer', 'franchit'];
    let nan = 0, seq = 0;
    for (let i = 0; i < 10000; i++) {
      const id = ARMES_VUE[Math.floor(al() * 5)], et = ets[Math.floor(al() * ets.length)];
      if (al() < 0.3) seq++;
      game.camYaw += (al() - 0.5) * 0.3; game.camPitch = Math.max(-1.4, Math.min(1.4, game.camPitch + (al() - 0.5) * 0.2));
      vm.maj(al() < 0.05 ? 0 : al() * 0.1, etat({ arme: id, etatArme: et, tEtat: al() * 3, visee: al() < 0.3 ? al() : 0, sprint: al() < 0.3, sprintTact: al() < 0.1,
        glisse: al() < 0.1 ? al() : 0, vitesse: al() * 8, accroupi: al() < 0.2 ? 1 : 0, enAir: al() < 0.1, lateral: (al() - 0.5) * 10, tirSeq: seq,
        vers: al() < 0.5 ? ARMES_VUE[Math.floor(al() * 5)] : null, tactique: al() < 0.5, duree: al() * 4, cuisson: al() < 0.5, grenade: al() < 0.5 ? 'frag' : 'flash',
        reculV: al() < 0.2 ? al() * 8 : 0, mort: al() < 0.02 }));
      if (!sansNaN(vm)) nan++;
    }
    game.camYaw = l0; game.camPitch = 0;
    jeu.quitter('balade');
    const okT = t.temps('maj de l’arme de vue (ms)', ms, 0.15);
    return { ok: okT && nan === 0, attendu: '≤ 0,15 ms par image ; 0 NaN sur 10 000 états', obtenu: `${r3(ms)} ms · ${nan} image(s) avec NaN` };
  });

  // 11. LES BRAS : ≤ 6 000 triangles, deux maillages ; l'avatar de Haythem inchangé (sommets et boîte, avant et après la
  // préparation d'une arme de vue NEUVE — sa géométrie en cache est partagée)
  T('11 bras ≤ 6 000 triangles ; l’avatar de Haythem inchangé', async () => {
    const empreinte = () => {
      const L = [];
      const voir = (racine) => racine && racine.traverse((o) => {
        if (!o.isMesh || !o.geometry) return;
        const a = o.geometry.attributes.position, idx = o.geometry.index; let h = 0;
        for (let i = 0; i < a.array.length; i += 7) h = (h * 31 + Math.round(a.array[i] * 1e5)) | 0;
        const b = new THREE.Box3().setFromBufferAttribute(a);
        L.push([o.name, a.count, idx ? idx.count : 0, h, ...b.min.toArray(), ...b.max.toArray()].join(':'));
      });
      voir(game.user.avatarModel);
      return L.join('|');
    };
    const avant = empreinte(), vm2 = new Viewmodel(game);
    await vm2.preparer(null);
    const apres = empreinte(), tri = vm2.bras ? vm2.bras.triangles : 0;
    let maillages = 0; if (vm2.bras) vm2.bras.groupe.traverse((o) => { if (o.isMesh) maillages++; });
    vm2.liberer();
    return { ok: !!avant && avant === apres && tri > 1000 && tri <= 6000 && maillages === 2, attendu: '≤ 6 000 triangles en 2 maillages ; empreinte de Haythem identique',
      obtenu: `${tri} triangles, ${maillages} maillages · empreinte ${avant === apres ? 'identique' : 'CHANGÉE'} (${avant.length} car.)` };
  });

  // 12. DESSINÉE APRÈS L'ŒIL sur le chemin du composer, et sur le chemin léger et sans composer (trois photos)
  T('12 dessinée après l’œil : composer, chemin léger, sans composer', async () => {
    jeu.figerQualite(true);
    const fx = game.fx, r = game.renderer, q0 = fx.quality;
    const p = await essai(jeu), vm = p.aff.viewmodel;
    const rendre = r.render; let vus = 0;
    r.render = function (s, c) { if (s === vm.scene) vus++; return rendre.call(this, s, c); };
    const res = {};
    try {
      await jeu.qualite('haute'); await jeu.images(3);
      vus = 0; game.frame(1 / 60); res.composer = vus; res.ordre = fx.composer.passes.indexOf(fx.passeSuperposee) === fx.composer.passes.indexOf(fx.oeil) + 1;
      res.photoC = jeu.photo('composer').length;
      await jeu.qualite('moyenne'); await jeu.images(3);
      res.leger = fx._legere ? fx._legere() : null;
      vus = 0; game.frame(1 / 60); res.moyenne = vus; res.photoL = jeu.photo('leger').length;
      const en = fx.enabled; fx.enabled = false;
      try { vus = 0; game.frame(1 / 60); res.sans = vus; res.photoS = jeu.photo('sans').length; } finally { fx.enabled = en; }
    } finally { r.render = rendre; await jeu.qualite(nomQ(q0)); jeu.figerQualite(false); }
    jeu.quitter('balade');
    const ok = res.composer === 1 && res.ordre && res.moyenne === 1 && res.sans === 1 && res.photoC > 5000 && res.photoL > 5000 && res.photoS > 5000;
    return { ok, attendu: 'une fois par image après l’œil (composer), une fois en moyenne (chemin léger quand la machine le prend), une fois sans composer ; 3 photos',
      obtenu: `composer ${res.composer} (après l’œil ${res.ordre}) · moyenne ${res.moyenne} (léger ${res.leger}) · sans ${res.sans} · photos ${res.photoC}/${res.photoL}/${res.photoS} car.` };
  });

  // 13. SIX PHOTOS (hanche, visée, sprint, sprint tactique, recharge à 0,9 s, glissade) — rendues, gardées dans
  // window.__photosVue pour le rapport
  T('13 six photos : hanche, visée, sprint, tactique, recharge 0,9 s, glissade', async () => {
    const p = await essai(jeu), vm = p.aff.viewmodel;
    const L = [['hanche', {}], ['visee', { visee: 1 }], ['sprint', { sprint: true, vitesse: 6.6 }], ['sprintTact', { sprint: true, sprintTact: true, vitesse: 7.8 }],
      ['recharge09', { etatArme: 'recharge', tEtat: 0.9, tactique: true }], ['glisse', { glisse: 1, vitesse: 7 }]];
    const P = window.__photosVue = {};
    for (const [n, o] of L) {
      const rendre = forcer(p, () => etat(o));
      try { vm._sortieT = -1; await jeu.images(24); P[n] = jeu.photo(n); } finally { rendre(); }
    }
    jeu.quitter('balade');
    const tailles = Object.values(P).map((d) => d.length), distinctes = new Set(Object.values(P)).size;
    return { ok: tailles.length === 6 && tailles.every((x) => x > 5000) && distinctes === 6, attendu: '6 photos non vides et différentes',
      obtenu: `${tailles.length} photos (${tailles.map((x) => Math.round(x / 1000)).join(', ')} k car.), ${distinctes} différentes` };
  });

  // 14. L'ENVIRONNEMENT À ELLE : la même texture PMREM avant et après Basse → Moyenne → Haute → Ultra → Basse ; les programmes
  // de l'arme constants ; aucune texture libérée encore référencée
  T('14 environnement fixe et programmes de l’arme constants à travers les qualités', async () => {
    jeu.figerQualite(true);
    const q0 = game.fx.quality;
    const p = await essai(jeu), vm = p.aff.viewmodel;
    const env0 = vm.scene.environment;
    const tex = new Set([env0]);
    vm.scene.traverse((o) => { if (o.material) for (const m of Array.isArray(o.material) ? o.material : [o.material]) for (const k of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap']) if (m[k]) tex.add(m[k]); });
    let liberees = 0; const ecoute = () => { liberees++; };
    for (const x of tex) if (x) x.addEventListener('dispose', ecoute);
    await jeu.images(3);
    const v0 = programmesVue(vm), suite = [];
    try {
      for (const q of ['basse', 'moyenne', 'haute', 'ultra', 'basse']) { await jeu.qualite(q); await jeu.images(4); suite.push(`${q} ${programmesVue(vm)}`); }
    } finally {
      for (const x of tex) if (x) x.removeEventListener('dispose', ecoute);
      await jeu.qualite(nomQ(q0)); jeu.figerQualite(false);
    }
    const v1 = programmesVue(vm), meme = vm.scene.environment === env0 && !!env0;
    jeu.quitter('balade');
    return { ok: meme && v0 === v1 && liberees === 0, attendu: 'même texture d’environnement ; variantes de programmes de l’arme constantes ; 0 texture libérée',
      obtenu: `environnement ${meme ? 'le même' : 'CHANGÉ'} · programmes ${v0} → ${suite.join(' → ')} → ${v1} · ${liberees} texture(s) libérée(s) sur ${tex.size}` };
  });

  // 15. LA VITRINE (l'armurerie de la vague 3) au MENU : la superposition dans fx, l'arme qui tourne d'une image à l'autre,
  // aucune lumière dans la scène de jeu ; vitrine(null) la retire
  T('15 vitrine au menu : superposée, elle tourne ; null la retire', async () => {
    await essai(jeu); jeu.quitter('menu'); await jeu.images(2);
    const vm = game.depsJeu.affichage.viewmodel, fx = game.fx;
    const lum = () => { let n = 0; game.scene.traverse((o) => { if (o.isLight) n++; }); return n; };
    const l0 = lum();
    vm.vitrine('fa24');
    const dedans = fx.superpositions.includes(vm._supV);
    game.frame(1 / 60); const a = vm.racine.rotation.y;
    await new Promise((r) => setTimeout(r, 50));
    game.frame(1 / 60); const b = vm.racine.rotation.y;
    const montree = vm.racine.visible && !!vm.courante && vm.courante.visible && !(vm.bras && vm.bras.groupe.visible);
    const l1 = lum();
    vm.vitrine(null);
    const dehors = !fx.superpositions.some((s) => s.scene === vm.scene);
    const mode = game.mode;
    jeu.quitter('balade');
    return { ok: dedans && b !== a && montree && l0 === l1 && dehors && mode === 'menu', attendu: 'superposée au menu, lacet qui change, arme seule ; 0 lumière ajoutée au jeu ; retirée',
      obtenu: `mode ${mode} · superposée ${dedans} · lacet ${r3(a)} → ${r3(b)} · arme seule ${montree} · lumières du jeu ${l0} → ${l1} · retirée ${dehors}` };
  });

  // 16. LES CONTRATS DES PISTES (relecture du 23/10 ; § 4.5.9) : CHRONOS complet pour les cinq armes (rechargeTact,
  // rechargeVide, sortie, rangement : des pistes à clés), leurs temps ceux des FICHES (recharges, rangement, couteau 0,60 s,
  // grenade : goupille 0,15, lancer 0,35, remontée 0,25), le chargeur EN PLACE à l'heure des balles entrées (`recharge.ajout`) et parti
  // avant ; `evaluer` en Hermite MONOTONE (jamais au-delà des deux clés qui encadrent l'instant)
  T('16 contrats des pistes : CHRONOS complet, temps des fiches, Hermite monotone', async () => {
    const fautes = [], v = new Float64Array(VOIES.length), ck = VOIES.indexOf('ck');
    const egal = (a, b) => Math.abs(a - b) < 1e-9;
    for (const id of ARMES_VUE) {
      const C = CHRONOS[id], r = ARMES[id].recharge;
      for (const k of ['rechargeTact', 'rechargeVide', 'sortie', 'rangement']) if (!C[k] || !(C[k].cles.length >= 2) || !Number.isFinite(C[k].duree)) fautes.push(`${id}.${k}`);
      if (fautes.length) continue;
      const tact = r.parCartouche ? r.debut + r.parCartouche + r.fin : r.tact, vide = r.parCartouche ? r.debut + r.parCartouche * ARMES[id].chargeur + r.fin + r.pompe : r.vide;
      if (!egal(C.rechargeTact.duree, tact) || !egal(C.rechargeVide.duree, vide) || !egal(C.rangement.duree, ARMES[id].rangement)) fautes.push(`${id} durées`);
      if (!r.parCartouche) for (const P of [C.rechargeTact, C.rechargeVide]) {
        if (!(Math.abs(evaluer(P, r.ajout, v)[ck]) < 1e-6) || !(evaluer(P, r.ajout - 0.1, v)[ck] > 0.5) || !(evaluer(P, 0.55 * r.ajout / 1.35 + 0.01, v)[ck] > 0.5)) fautes.push(`${id} chargeur`);
      }
    }
    const G = CHRONOS.grenade;
    if (!egal(CHRONOS.couteau.coup.duree, ARMES.couteau.coup) || !egal(G.goupille.duree, 0.15) || !egal(G.lancer.duree, 0.35) || !egal(G.remontee.duree, 0.25)) fautes.push('couteau / grenade');
    // Hermite monotone : 40 points entre chaque paire de clés de chaque piste
    let n = 0, depasse = 0;
    const toutes = [];
    for (const C of Object.values(CHRONOS)) for (const P of (C.cles ? [C] : Object.values(C))) if (P && P.cles) toutes.push(P);
    for (const P of toutes) {
      const K = P.cles, o = new Float64Array(P.voies.length);
      for (let j = 1; j < K.length; j++) for (let s = 1; s < 40; s++) {
        evaluer(P, K[j - 1].t + (K[j].t - K[j - 1].t) * s / 40, o); n++;
        for (let i = 0; i < o.length; i++) if (o[i] < Math.min(K[j - 1].v[i], K[j].v[i]) - 1e-9 || o[i] > Math.max(K[j - 1].v[i], K[j].v[i]) + 1e-9) { depasse++; break; }
      }
    }
    return { ok: fautes.length === 0 && depasse === 0 && n > 1000, attendu: 'pistes présentes, temps des fiches, chargeur en place aux balles entrées ; 0 dépassement entre deux clés',
      obtenu: `${fautes.length ? 'fautes : ' + fautes.join(', ') : 'contrats tenus'} · ${toutes.length} pistes, ${n} points, ${depasse} dépassement(s)` };
  });

  // 17. LES GESTES QUAND L'ARSENAL LES DIT AUTREMENT QUE LE SQUELETTE (relecture du 23/10, avant F2 — l'arsenal de L-A,
  // fini : il passe à l'arme qui vient à la fin du RANGEMENT, pas de la sortie ; son `tEtat` repart au lâcher de la grenade,
  // `phaseLancer` dit où en est le geste) : l'arme rangée puis la nouvelle, jamais l'inverse ; la goupille n'est pas rejouée
  T('17 gestes : arme qui bascule au rangement, grenade dont le temps repart au lâcher', async () => {
    const p = await essai(jeu), vm = p.aff.viewmodel, img = 1 / 60, iM = CHRONOS.couteau.coup.i;
    // le changement P-17 → FA-24, l'arme de l'arsenal basculée à 0,15 s (le rangement du P-17, plus court que celui de la
    // FA-24 : lu sur l'arme qui VIENT, la FA-24 serait rangée une 2e fois)
    calmer(vm, etat({ arme: 'p17' }), 30);
    const vues = [], cles = [];
    for (let s = 0; s <= ARMES.p17.rangement + ARMES.fa24.sortie + 1e-9; s += img) {
      const bascule = s >= ARMES.p17.rangement;
      vm.maj(img, etat({ arme: bascule ? 'fa24' : 'p17', etatArme: 'change', tEtat: s, vers: 'fa24' }));
      if (vues[vues.length - 1] !== vm.diag.arme) vues.push(vm.diag.arme);
      if (vm.diag.geste && cles[cles.length - 1] !== vm.diag.geste) cles.push(vm.diag.geste);
    }
    const okChange = vues.join('>') === 'p17>fa24' && cles.join('>') === 'p17.rangement>fa24.sortie';
    // la flash : goupille 0,15 s, lâchée (tEtat repart), lancer 0,35 s, remontée 0,25 s
    calmer(vm, etat(), 30);
    let pinRetombe = false, ph = [], lancerVu = false;
    const suite = [];
    for (let s = 0; s < 0.15; s += img) suite.push({ etatArme: 'lancer', grenade: 'flash', phaseLancer: 'goupille', tEtat: s, duree: null });
    for (let s = 0; s < 0.60; s += img) suite.push({ etatArme: 'lancer', grenade: 'flash', phaseLancer: s < 0.35 ? 'lance' : 'remontee', tEtat: s, duree: 0.60 });
    let pinVu = 0;
    for (const o of suite) {
      vm.maj(img, etat(o));
      const pin = vm._geste.main[iM.pin];
      if (o.phaseLancer === 'lance' && pinVu > 0.99 && pin < 0.99 && vm._geste.poidsMain > 0.5) pinRetombe = true;
      pinVu = Math.max(pinVu, pin);
      if (o.phaseLancer === 'lance' && vm._geste.main[iM.ov] < 0.5) lancerVu = true;      // (la grenade quitte la main)
      if (ph[ph.length - 1] !== o.phaseLancer) ph.push(o.phaseLancer);
    }
    vm.maj(img, etat()); for (let i = 0; i < 20; i++) vm.maj(img, etat());
    const rendue = vm.racine.visible && vm._geste.poidsMain === 0;
    jeu.quitter('balade');
    const ok = okChange && !pinRetombe && pinVu > 0.99 && lancerVu && rendue;
    return { ok, attendu: 'armes p17 > fa24 et pistes p17.rangement > fa24.sortie ; anneau arraché en 0,15 s et pas remis ; grenade lâchée ; arme rendue',
      obtenu: `armes ${vues.join(' > ')} · pistes ${cles.join(' > ')} · anneau ${r3(pinVu)} (retombé ${pinRetombe}) · lâchée ${lancerVu} · phases ${ph.join(' > ')} · rendue ${rendue}` };
  });

  // ---------------------------------------------------------------- À F2 (les vrais modules des autres lots)
  // L-W : ≤ 8 appels avec les vraies armes ; les repères posés par L-W = la table REPERES ; les mains tenues (≤ 1 cm)
  T('F2 vraies armes : ≤ 8 appels, repères = table, mains ≤ 1 cm', async () => {
    jeu.figerQualite(true);
    const q0 = game.fx.quality;
    try { await jeu.qualite('moyenne'); return await testF2armes(); } finally { await jeu.qualite(nomQ(q0)); jeu.figerQualite(false); }
  }, { apresFusion: true });
  const testF2armes = async () => {
    const p = await essai(jeu), vm = p.aff.viewmodel;
    let max = 0, ecart = 0, main = 0;
    for (const id of ARMES_VUE) {
      const a = vm.armes[id], R = a.userData.reperes || {};
      for (const [n, v] of Object.entries(REPERES[id])) if (Array.isArray(v) && R[n]) ecart = Math.max(ecart, R[n].position.distanceTo(new THREE.Vector3(...v)));
      for (const [, o] of POSES) { calmer(vm, etat({ arme: id, ...o }), 30); max = Math.max(max, appelsVue(vm).appels); main = Math.max(main, vm.diag.erreurD, vm.diag.erreurG); }
      for (const [, D, o] of gestes(id)) for (let s = 0; s < D; s += 0.1) { vm.maj(1 / 60, etat({ arme: id, tEtat: s, ...o })); max = Math.max(max, appelsVue(vm).appels); }
    }
    jeu.quitter('balade');
    return { ok: max <= 8 && ecart <= 0.001 && main <= 0.01, attendu: '≤ 8 appels ; repères ± 1 mm ; mains ≤ 1 cm', obtenu: `${max} appels · repères ${r3(ecart * 1000)} mm · mains ${r3(main * 100)} cm` };
  };
  // L-A et L-B : le cabré de l'arsenal (reculV) est celui que montre l'arme, la caméra en reçoit 15 % (VueFPS) ; les états réels
  // de l'arsenal (couteau, lancer) montrés par leur geste
  T('F2 recul de l’arsenal, caméra à 15 % ; couteau et grenade réels', async () => {
    const p = await essai(jeu), vm = p.aff.viewmodel, A = p.local.arsenal, iM = CHRONOS.couteau.coup.i, fiche = ARMES.fa24.recul.cabre;
    let pic = 0, picImg = 0, picVm = 0, cam = 0;
    // (F2 : la crête de reculV lue à CHAQUE pas de 1/120 s, et les images faites à la main à 1/60 s — onglet devant, les
    // vraies images de rAF tombent n'importe où sur la courbe du ressort, crête à 34 ms : 1,618° lus pour 2,2° ; l'arme et la
    // caméra comparées au reculV de LEURS images, picImg)
    const pas0 = p.pas;
    p.pas = function (dt) { pas0.call(this, dt); pic = Math.max(pic, A.reculV); };
    jeu.forcerImagesManuelles(true);
    try {
      jeu.tirer(0, { n: 1 });
      for (let i = 0; i < 12; i++) {
        await jeu.images(1);
        picVm = Math.max(picVm, vm.diag.cabre); picImg = Math.max(picImg, A.reculV);
        cam = Math.max(cam, (game.camera.rotation.x + game.camPitch) / DEG);      // (rotation.x = −(tangage − 0,15·reculV·DEG))
      }
    } finally { jeu.forcerImagesManuelles(false); delete p.pas; }
    jeu.commande(0, { couteau: true }, 1 / 60); await jeu.images(4); const gC = vm.diag.geste;
    await jeu.images(60);
    // la frag tenue 0,5 s puis lâchée : la main la lance (la goupille n'est pas rejouée quand le temps de l'arsenal repart)
    jeu.commande(0, { letale: true }, 0.5);
    let gG = null, lancee = false, rejouee = false, vuPin = 0;
    for (let i = 0; i < 90; i++) {
      await jeu.images(1);
      if (vm.diag.geste === 'grenade') gG = 'grenade';
      const pin = vm._geste.main[iM.pin], ph = A.phaseLancer;
      if (ph === 'lance' && vuPin > 0.99 && pin < 0.99) rejouee = true;
      if (ph === 'lance' && vm._geste.main[iM.ov] < 0.5) lancee = true;
      vuPin = Math.max(vuPin, pin);
    }
    jeu.quitter('balade');
    const ok = pic > 0 && Math.abs(pic / fiche - 1) <= 0.05 && Math.abs(picVm / picImg - 1) <= 0.05 && Math.abs(cam / (0.15 * picImg) - 1) <= 0.1
      && gC === 'couteau' && gG === 'grenade' && lancee && !rejouee;
    return { ok, attendu: 'crête de reculV = cabré de la fiche ± 5 % (§ 3.4, critère 8) ; l’arme la montre ± 5 % ; caméra 15 % ± 10 % ; couteau ; frag lancée, goupille pas rejouée',
      obtenu: `reculV ${r3(pic)}° (fiche ${fiche}°), ${r3(picImg)}° aux images · arme ${r3(picVm)}° · caméra ${r3(cam)}° · gestes ${gC} / ${gG} · lancée ${lancee} · goupille rejouée ${rejouee}` };
  }, { apresFusion: true });
}
