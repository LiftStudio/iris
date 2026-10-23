// =====================================================================
//  LES TESTS DU LOT L-C — les corps des acteurs (23/10 ; spec § 5.5.5, acceptation, points 1 à 14)
// =====================================================================
// Lancés par le harnais sous `?test=1&rapport=1&lot=L-C` (window.__rapport), PC puis `?tel=1`. Les tests ne cliquent
// jamais à l'écran : tout passe par window.__jeu et les images sont faites à la main (pas de rAF : deux pas de
// simulation, l'interpolation, la caméra, puis Partie.image — poses, poupées, cadence — comme js/game.js frame, sans le
// rendu). Un test rend { ok, attendu, obtenu }. Les photos de lisibilité (point 13) sont gardées dans window.__photosLC.
import * as THREE from 'three';
import { PAS, EQUIPES } from '../constantes.js';
import { Player } from '../../player.js';
import { Couches } from '../../couches.js';
import { TELEPHONE } from '../../appareil.js';
import { FICHES_BOTS, FICHE_HAYTHEM, preparerAvatars, creerCorps, libererCorps, avatarsPrets, plafondAvatars } from '../avatars.js';
import { teinteEquipe, TEINTE } from '../teintes.js';
import { accroupir } from '../accroupi.js';
import { priseMain, POSE_3E } from '../pose_arme.js';
import { Poupee, POUPEE } from '../poupee.js';
import { CADENCE } from '../cadence_acteurs.js';
import { capsules } from '../touches.js';
import { REPERES } from '../modeles_armes.js';
import { AvatarRig } from '../../avatar.js';
import { hacher } from '../rng.js';

const DEG = Math.PI / 180;
const r2 = (v) => Math.round(v * 100) / 100, r3 = (v) => Math.round(v * 1000) / 1000;
const egal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const sansEnfants = (o) => { const c = { ...o }; delete c.enfants; return c; };
const moyenne = (L) => (L.length ? L.reduce((s, v) => s + v, 0) / L.length : 0);
const centile = (L, p) => { const s = L.slice().sort((a, b) => a - b); return s.length ? s[Math.min(s.length - 1, Math.floor(s.length * p))] : 0; };
const AMIS = FICHES_BOTS.map((f) => f.id);

export default function (jeu) {
  const game = window.__game;
  const T = (nom, fn, opts) => jeu.ajouterTest('L-C', nom, fn, opts);
  const profil = () => (window.__chargement && window.__chargement.telephone ? 'tel' : 'pc');
  const attendre = (s) => new Promise((r) => setTimeout(r, s * 1000));
  const C = () => game.collisions;
  // UNE IMAGE à la main : deux pas, l'interpolation (a = 1 : la position affichée = la simulée), la caméra, l'image
  const image = (n = 1, a = 1) => {
    const p = game.partie;
    for (let i = 0; i < n; i++) { p.pas(PAS); p.pas(PAS); p.interpoler(a); game.updateCamera(1 / 60); p.image(1 / 60); }
  };
  // les avatars de ces acteurs chargés (clips compris)
  const prets = async (L, s = 15) => {
    const t0 = performance.now();
    while (performance.now() - t0 < s * 1000 && L.some((a) => !(a.joueur && a.joueur.anim && a.joueur.avatarModel && a.joueur.avatarModel.visible))) await attendre(0.05);
    return L.every((a) => a.joueur && a.joueur.anim && a.joueur.avatarModel);
  };
  // un point libre au sol près de (x, z), à la hauteur y
  const libre = (x, y, z) => { const q = { x, z }; C().resoudre(q, 0.35, null, y); return { x: q.x, y: C().solEn(q.x, q.z, y + 0.3), z: q.z }; };
  // un bot sans cerveau (la commande forcée par __jeu.commande / viser)
  const bot = (p, id, o = {}) => {
    const q = libre(o.x ?? 2, o.y ?? 0, o.z ?? 4.5);
    return p.ajouterActeur({ id, nom: o.nom || 'Bot ' + id, equipe: o.equipe === undefined ? 'B' : o.equipe, fiche: o.fiche || FICHE_HAYTHEM, x: q.x, y: q.y, z: q.z,
      lacet: o.lacet ?? 0, classe: o.classe === undefined ? 'assaut' : o.classe, cerveau: o.cerveau ?? null, difficulte: 'regulier' });
  };
  // la tête de l'os (+0,085 sur son Y, × h / 1,8 : banc/touches.js) et celle des boîtes de touche (le socle)
  const _v = new THREE.Vector3(), _y = new THREE.Vector3();
  const teteOs = (a, out) => { const B = a.joueur.avatar.bone('Head'); B.getWorldPosition(out); _y.setFromMatrixColumn(B.matrixWorld, 1).normalize(); return out.addScaledVector(_y, 0.085 * a.joueur.h / 1.8); };
  const teteSimulee = (a, out) => { const L = capsules(a, []), k = L.find((c) => c.zone === 'tete'); return out.set(k.ax, k.ay, k.az); };

  // 1. LA PRÉPARATION des six avatars : temps (froid / chaud), DefaultLoadingManager.onLoad jamais, programmes ± 2
  T('1 preparerAvatars : 6 amis, temps, onLoad, programmes', async (t) => {
    const M = THREE.DefaultLoadingManager, onLoad = M.onLoad;
    let charges = 0;
    M.onLoad = function (...a) { charges++; return onLoad && onLoad.apply(this, a); };
    const prog = () => game.renderer.info.programs.length;
    let p0, p1, t1, t2;
    try {
      // (le décor chaud d'abord : ses préchauffes ne doivent pas tomber dans la mesure)
      for (let k = game._chaudN || 0; k < 5; k++) { game._chaudN = k + 1; game.prechaufferScene(); }
      await attendre(1); await jeu.images(4);
      p0 = prog();
      let t0 = performance.now(); await preparerAvatars(game, AMIS, null); t1 = performance.now() - t0;
      await jeu.images(4);
      t0 = performance.now(); await preparerAvatars(game, AMIS, null); t2 = performance.now() - t0;
      await jeu.images(4);
      p1 = prog();
    } finally { M.onLoad = onLoad; }
    const P = avatarsPrets();
    const okT1 = t.temps('préparation 1re fois (ms)', t1, 6000), okT2 = t.temps('préparation cache chaud (ms)', t2, 3000);
    return { ok: okT1 && okT2 && charges === 0 && Math.abs(p1 - p0) <= 2 && P.fiches.length === plafondAvatars(),
      attendu: '1re fois ≤ 6 s, cache chaud ≤ 3 s, onLoad jamais, programmes ± 2, avatars préparés = plafond (6 PC, 3 tél.)',
      obtenu: `1re ${Math.round(t1)} ms · chaude ${Math.round(t2)} ms · onLoad ${charges} · programmes ${p0} → ${p1} · préparés ${P.fiches.join(', ')}` };
  }, { delai: 90 });

  // 2. LA MÉMOIRE DES TEXTURES des six bots ; au téléphone, 3 avatars distincts au plus
  T('2 textures des six bots ≤ 140 Mo ; téléphone : 3 distincts', async () => {
    await preparerAvatars(game, AMIS, null);
    const corps = FICHES_BOTS.map((f) => creerCorps(f, game.scene, {}));
    for (const c of corps) c.mesh.visible = false;
    const t0 = performance.now();
    while (performance.now() - t0 < 15000 && corps.some((c) => !c.avatarModel)) await attendre(0.05);
    // les textures de Haythem (déjà là avant toute partie)
    const deHaythem = new Set();
    game.user.avatarModel?.traverse((o) => { if (o.isMesh && o.material) for (const k of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap', 'alphaMap']) if (o.material[k]) deHaythem.add(o.material[k].image || o.material[k]); });
    const vues = new Set(); let octets = 0;
    for (const c of corps) c.avatarModel?.traverse((o) => {
      if (!o.isMesh || !o.material) return;
      for (const k of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap', 'alphaMap']) {
        const tx = o.material[k]; if (!tx) continue;
        const img = tx.image || tx; if (vues.has(img) || deHaythem.has(img)) continue;
        vues.add(img);
        const w = img.width || 0, h = img.height || 0;
        octets += w * h * 4 * (tx.generateMipmaps !== false ? 4 / 3 : 1);
      }
    });
    const distincts = new Set(corps.map((c) => c.avatarUrl)).size;
    for (const c of corps) libererCorps(c);
    await Promise.all(corps.map((c) => c.liberation));
    const Mo = octets / 1048576, plafond = plafondAvatars();
    return { ok: Mo <= 140 && distincts <= plafond, attendu: `≤ 140 Mo de textures nouvelles ; ≤ ${plafond} avatars distincts`,
      obtenu: `${Mo.toFixed(1)} Mo (${vues.size} textures) · ${distincts} avatars distincts pour 6 fiches${TELEPHONE ? ' (téléphone)' : ''}` };
  }, { delai: 60 });

  // 3. LES DRAPEAUX DE creerCorps : jamais dans un rang, aucun pas joué par les couches d'un bot, jamais les mains sur
  // les genoux (même vidé : endurance forcée à 5 à chaque pas)
  T('3 drapeaux : 0 rang, 0 pas des couches, 0 mains sur les genoux', async () => {
    // (les rangées de la salle David Clark ne sont pas des rangs SERRÉS — Player.rangs : S −1.14, S 1.3, salle 2 du 2e ;
    // le test pousse donc aussi des bots dans le bout ouvert de chaque rang de la S 1.3, comme Haythem au test 28 du socle)
    const R = Player.rangs.filter((r) => Math.abs(r.sol - 3.5) < 0.3 && (r.ouvA || r.ouvB));
    await jeu.lancer('essai', { graine: 3, mannequins: [], bots: 0, humain: false, zone: 'ecole' });
    const p = game.partie, L = [];
    // 4 errants à la David Clark, 4 bots poussés dans des rangs
    for (let k = 0; k < 4; k++) L.push(p.ajouterActeur({ id: 10 + k, nom: 'Errant ' + k, equipe: 'A', x: 5.38 + (k % 2) * 1.2, y: 0, z: -15.12 + Math.floor(k / 2) * 1.2, lacet: 0, cerveau: 'errant', classe: 'assaut' }));
    const pousses = [];
    for (let k = 0; k < Math.min(4, R.length); k++) {
      const r = R[k], b = r.ouvA ? 0 : 1, s = b ? -1 : 1, ex = b ? r.bx : r.ax, ez = b ? r.bz : r.az;
      // à 15 cm du bout, poussé vers l'intérieur du rang
      const x = ex - r.ux * s * 0.15, z = ez - r.uz * s * 0.15, lacet = Math.atan2(-(r.ux * s), -(r.uz * s));
      const a = p.ajouterActeur({ id: 20 + k, nom: 'Poussé ' + k, equipe: 'B', x, y: r.sol, z, lacet, cerveau: null, classe: 'assaut' });
      pousses.push(a); L.push(a);
    }
    await prets(L);
    for (const a of pousses) jeu.commande(a.id, { ay: 1, ax: 0, lacet: a.cmd.lacet, marche: true }, 120);
    const corps = new Set(L.map((a) => a.joueur.pos));
    const son = Couches.son, compte = { pas: 0, crissement: 0, reception: 0 };
    const espion = {};
    for (const m of Object.keys(compte)) { espion[m] = son[m]; son[m] = function (pos, ...r) { if (corps.has(pos)) compte[m]++; return espion[m].call(this, pos, ...r); }; }
    let rangs = 0, souffle = 0, max = 0;
    try {
      for (let i = 0; i < 120 * 60; i++) {
        image();
        for (const a of L) {
          const j = a.joueur; j.stamina = 5;
          if (j.rang) rangs++;
          if (j.couches.souffle > 0 || j.couches.veutSouffler) souffle++;
        }
        if (i % 600 === 599) await attendre(0);
      }
      for (const a of L) max = Math.max(max, a.joueur.couches.souffle);
    } finally { for (const m of Object.keys(compte)) son[m] = espion[m]; }
    const d = pousses.map((a) => r2(Math.hypot(a.pos.x - a.joueur.posPrec.x, a.pos.z - a.joueur.posPrec.z)));
    jeu.quitter('balade');
    const sons = compte.pas + compte.crissement + compte.reception;
    return { ok: rangs === 0 && sons === 0 && souffle === 0, attendu: '120 s : 0 entrée dans un rang, 0 son des couches d’un bot, jamais les mains sur les genoux (endurance à 5)',
      obtenu: `${L.length} bots (${pousses.length} poussés dans les rangs de la S 1.3) · rangs ${rangs} · sons ${compte.pas}/${compte.crissement}/${compte.reception} · souffle ${souffle} (max ${max})` };
  }, { delai: 240 });

  // 4. L'ARME EN MAIN : le canon dans la direction de la commande (≤ 0,5°), les mains sur les prises (≤ 2 cm), le coût,
  // posé UNE fois par image
  T('4 poserArme : canon ≤ 0,5°, mains ≤ 2 cm, ≤ 0,2 ms, une fois par image', async (t) => {
    await jeu.lancer('essai', { graine: 4, mannequins: [], bots: 0, humain: false });
    const p = game.partie, R = [];
    const ids = ['fa24', 'pm9', 'fp12', 'tp50'];
    const classes = { fa24: 'assaut', pm9: 'infiltration', fp12: 'defense', tp50: 'tireur' };
    for (let k = 0; k < 5; k++) R.push(bot(p, 30 + k, { x: 2 + k * 3, z: 4.5, classe: classes[ids[k]] || 'assaut', equipe: k % 2 ? 'A' : 'B' }));
    await prets(R);
    // le 5e au pistolet (2e arme)
    jeu.commande(34, { armeN: 2 }, PAS); image(30);
    const rng = (() => { let s = 99; return () => ((s = (s * 1103515245 + 12345) >>> 0) / 4294967296); })();
    const ecartsC = [], mainsD = [], mainsG = [], par = {};
    const _z = new THREE.Vector3(), _d = new THREE.Vector3(), _g = new THREE.Vector3(), _h = new THREE.Vector3();
    for (let n = 0; n < 200; n++) {
      const a = R[n % R.length], l = (rng() * 2 - 1) * Math.PI, tg = (rng() * 2 - 1) * 1.2;
      jeu.viser(a.id, { lacet: l, tangage: tg });
      image(3);
      const g = a.aff.arme3e; if (!g) { ecartsC.push(180); continue; }
      _z.set(0, 0, -1).transformDirection(g.matrixWorld);
      a.regard(_d);
      ecartsC.push(_z.angleTo(_d) / DEG);
      const id = g.userData.arme3e, Rp = REPERES[id], e = a.h / 1.73;
      _g.setFromMatrixPosition(g.matrixWorld);
      mainsD.push(priseMain(a.joueur.avatar, 'Right', e, _h).distanceTo(_g));
      _g.set(...Rp.mainG).applyMatrix4(g.matrixWorld);
      const dg = priseMain(a.joueur.avatar, 'Left', e, _h).distanceTo(_g);
      mainsG.push(dg); (par[id] || (par[id] = [])).push(dg);
    }
    // le coût de l'arme en main (apresPose : accroupi + arme), et le compte des poses et des ajouts par image
    const a0 = R[0], j0 = a0.joueur, ap = j0.apresPose, ms = [];
    j0.apresPose = (q, dt) => { const t0 = performance.now(); ap(q, dt); ms.push(performance.now() - t0); };
    let poses = 0, ajouts = 0;
    const po = j0.poser.bind(j0); j0.poser = (...x) => { poses++; return po(...x); };
    const aj = AvatarRig.prototype.ajouter;
    AvatarRig.prototype.ajouter = function (...x) { if (this === j0.avatar) ajouts++; return aj.apply(this, x); };
    const parImage = [], ajParImage = [];
    try {
      jeu.viser(a0.id, { lacet: 0.3, tangage: 0.1 });
      for (let i = 0; i < 60; i++) { poses = 0; ajouts = 0; image(); parImage.push(poses); ajParImage.push(ajouts); }
    } finally { AvatarRig.prototype.ajouter = aj; j0.apresPose = ap; delete j0.poser; }
    jeu.quitter('balade');
    const okT = t.temps('arme en main par acteur (ms)', moyenne(ms), 0.2);
    const unParImage = parImage.every((x) => x === 1) && new Set(ajParImage).size === 1;
    const c95 = centile(ecartsC, 1), d95 = Math.max(...mainsD), g95 = Math.max(...mainsG);
    return { ok: okT && c95 <= 0.5 && d95 <= 0.02 && g95 <= 0.02 && unParImage,
      attendu: 'canon / commande ≤ 0,5° (200 couples, tangage ± 1,2), mains ≤ 2 cm, ≤ 0,2 ms par acteur, 1 pose et le même nombre d’ajouts à chaque image',
      obtenu: `canon max ${c95.toFixed(3)}° · main droite max ${(d95 * 100).toFixed(2)} cm · gauche max ${(g95 * 100).toFixed(2)} cm (${Object.entries(par).map(([k, L]) => k + ' ' + (Math.max(...L) * 100).toFixed(1)).join(', ')}) · ${moyenne(ms).toFixed(3)} ms · poses par image ${[...new Set(parImage)]} · ajouts ${[...new Set(ajParImage)]}` };
  }, { delai: 120 });

  // 5. L'ACCROUPI : hanches abaissées de 0,42 ± 0,01 m, pieds au sol ± 2 cm
  T('5 accroupir(p, 1) : hanches −0,42 ± 0,01, pieds ± 2 cm', async () => {
    await jeu.lancer('essai', { graine: 5, mannequins: [], bots: 0, humain: false });
    const p = game.partie, a = bot(p, 40, { x: 6, z: 4.5, classe: null });
    await prets([a]); image(20);
    const A = a.joueur.avatar, h0 = new THREE.Vector3(), h1 = new THREE.Vector3(), f0 = {}, f1 = {};
    A.bone('Hips').getWorldPosition(h0);
    for (const c of ['Left', 'Right']) { f0[c] = A.bone(c + 'ToeBase').getWorldPosition(new THREE.Vector3()); }
    accroupir(a.joueur, 1);
    a.joueur.mesh.updateMatrixWorld(true);
    A.bone('Hips').getWorldPosition(h1);
    for (const c of ['Left', 'Right']) { f1[c] = A.bone(c + 'ToeBase').getWorldPosition(new THREE.Vector3()); }
    const bas = h0.y - h1.y, pieds = Math.max(f0.Left.distanceTo(f1.Left), f0.Right.distanceTo(f1.Right));
    const sol = C().solEn(a.pos.x, a.pos.z, a.pos.y + 0.3), hauteurPieds = Math.max(f1.Left.y, f1.Right.y) - sol;
    // et en jeu : accroupi tenu (la simulation), la tête affichée
    jeu.commande(40, { accroupi: true }, 2); image(30);
    const tete = teteOs(a, new THREE.Vector3()).y - sol, sim = teteSimulee(a, new THREE.Vector3()).y - sol;
    jeu.quitter('balade');
    return { ok: Math.abs(bas - 0.42) <= 0.01 && pieds <= 0.02, attendu: 'hanches abaissées de 0,42 ± 0,01 m, pieds gardés ± 2 cm',
      obtenu: `hanches −${r3(bas)} m · pieds déplacés ${(pieds * 100).toFixed(2)} cm (orteils à ${(hauteurPieds * 100).toFixed(1)} cm du sol) · accroupi en jeu : tête affichée ${r2(tete)} m, simulée ${r2(sim)} m` };
  }, { delai: 60 });

  // 6. CENT POUPÉES à impulsions tirées (Militaire) : à plat en moins d'une seconde, jamais dans une forme, aucun NaN,
  // cachées à 4,4 s
  T('6 cent poupées : à plat < 1 s, jamais dans une forme, 0 NaN, cachées à 4,4 s', async () => {
    game.settings.data.jeu.habillage = 'militaire';
    await jeu.lancer('essai', { graine: 6, mannequins: [], bots: 0, humain: false });
    const p = game.partie, a = bot(p, 50, { x: 6, z: 4.5, classe: null });
    await prets([a]); image(10);
    const rng = (() => { let s = 7; return () => ((s = (s * 1103515245 + 12345) >>> 0) / 4294967296); })();
    // des lieux : le milieu des pièces et contre les murs (le coup pousse vers le mur)
    const lieux = [[6, 0, 4.5], [14.88, 0, -3.12], [11.63, 0, -4.62], [4.63, 0, -6.87], [15.63, 0, -9.87], [12.38, 0, -11.37], [12.63, 3.5, -7.87], [9.38, -3.06, -9.37], [14.63, 6.6, -5.87], [3.63, 0, -3.87]];
    let plats = 0, dansForme = 0, nan = 0, cachees = 0, tPlat = [];
    const _a = new THREE.Vector3();
    for (let n = 0; n < 100; n++) {
      const L = lieux[n % lieux.length], q = libre(L[0] + (rng() - 0.5), L[1], L[2] + (rng() - 0.5));
      jeu.teleporter(50, q.x, q.y, q.z, rng() * Math.PI * 2);
      a.vivant = true; a.poupee = null;
      image(6);
      // le coup : 2,5 m/s dans une direction tirée (horizontale ± 30° vers le haut ou le bas), à un point du corps
      const ang = rng() * Math.PI * 2, el = (rng() - 0.5) * 1.0;
      const imp = new THREE.Vector3(Math.cos(ang) * Math.cos(el), Math.sin(el), Math.sin(ang) * Math.cos(el)).multiplyScalar(POUPEE.impulsion);
      const os = ['Head', 'Spine2', 'Hips', 'LeftLeg', 'RightArm'][n % 5], pt = a.joueur.avatar.bone(os).getWorldPosition(new THREE.Vector3());
      a.joueur.vel.set((rng() - 0.5) * 6, 0, (rng() - 0.5) * 6);
      a.vivant = false;
      const P = new Poupee(a.joueur, imp, { x: pt.x, y: pt.y, z: pt.z, tete: os === 'Head' }, C());
      a.poupee = P;
      let tA = null;
      for (let k = 0; k < 4.5 * 120; k++) {
        P.pas(PAS);
        if (k % 2) P.poser();
        const sol = C().solEn(P.P.Hips.p.x, P.P.Hips.p.z, P.P.Hips.p.y + 0.3);
        const haut = Math.max(P.P.Hips.p.y, P.P.Spine2.p.y, P.P.Head.p.y) - sol;
        if (tA === null && haut < 0.38 && P.vitesse < 0.25) tA = P.t;
        for (const nm of ['Hips', 'Spine2', 'Head']) {
          const x = P.P[nm].p;
          if (!Number.isFinite(x.x + x.y + x.z)) nan++;
          else if (k % 4 === 0 && !C().libre(x.x, x.z, 0.05, x.y, 0.05, -0.05)) dansForme++;
        }
        if (Math.abs(P.t - 4.39) < PAS / 2 && P.cachee) cachees--;            // (pas encore à 4,39 s)
      }
      P.poser();
      for (const b of Object.values(a.joueur.avatar.bones)) { b.getWorldPosition(_a); if (!Number.isFinite(_a.x + _a.y + _a.z)) { nan++; break; } }
      if (P.cachee && !a.joueur.mesh.visible) cachees++;
      if (tA !== null && tA < 1) plats++;
      if (tA !== null) tPlat.push(tA);
      nan += P.nan;
      P.liberer(true); a.poupee = null; a.vivant = true; a.joueur.mesh.visible = true;
      if (n % 10 === 9) await attendre(0);
    }
    jeu.quitter('balade');
    return { ok: plats === 100 && dansForme === 0 && nan === 0 && cachees === 100, attendu: '100 sur 100 à plat (hanches, poitrine, tête < 0,38 m, aucun point à plus de 0,25 m/s) en < 1 s, 0 point dans une forme, 0 NaN, cachées à 4,4 s (pas avant)',
      obtenu: `à plat en < 1 s : ${plats}/100 (médiane ${r2(centile(tPlat, 0.5))} s, max ${r2(Math.max(0, ...tPlat))} s) · dans une forme ${dansForme} · NaN ${nan} · cachées à 4,4 s ${cachees}/100` };
  }, { delai: 180 });

  // 7. LA CADENCE avec 7 bots sur 300 images. La caméra est posée À LA MAIN (loin dans la rue, à l'ouest, en dehors des
  // bornes du jeu où aucun corps ne peut aller) : les distances de 16 à 50 m tiennent dans la rue de 26 m
  T('7 cadence : autre niveau, > 34 m, caché, redevenu dessiné, coût des poses', async (t) => {
    await jeu.lancer('essai', { graine: 7, mannequins: [], bots: 0, humain: false });
    const p = game.partie, cam = game.camera;
    const B = [bot(p, 60, { x: -2.5, z: 4.5 }), bot(p, 61, { x: 4, z: 3.5 }), bot(p, 62, { x: 8, z: 5.0 }), bot(p, 63, { x: 12, z: 4.5 }),
      bot(p, 64, { x: 20, z: 4.0 }), bot(p, 65, { x: 12.63, y: 3.5, z: -7.87 }), bot(p, 66, { x: 14.63, y: 6.6, z: -5.87 })];
    await prets(B);
    const X0 = -18, imageCam = (lacet) => {
      p.pas(PAS); p.pas(PAS); p.interpoler(1);
      cam.position.set(X0, 1.62, 4.5); cam.rotation.set(-0.03, lacet, 0, 'YXZ'); cam.updateMatrixWorld();
      p.image(1 / 60);
    };
    for (let i = 0; i < 10; i++) imageCam(-Math.PI / 2);
    const haut = p.acteurParId(66), N = 300;
    const poses = new Map(B.map((a) => [a.id, 0])), ombres = new Map(B.map((a) => [a.id, 0])), dess = new Map(B.map((a) => [a.id, 0]));
    const po = Player.prototype.poser;
    let msPoses = 0, fautes = 0, loinVus = 0;
    Player.prototype.poser = function (...x) { const t0 = performance.now(); const r = po.apply(this, x); msPoses += performance.now() - t0; return r; };
    const ages = [], tPose = new Map();
    try {
      for (let i = 0; i < N; i++) {
        // toutes les 6 images, la caméra se retourne : les bots de la rue sortent du cadre puis y reviennent
        const lacet = (Math.floor(i / 6) % 2) ? Math.PI / 2 : -Math.PI / 2;
        const avant = new Map(B.map((a) => [a.id, a.dessine]));
        imageCam(lacet);
        const n = p.imageN - 1;
        for (const a of B) {
          if (a.aPoser) { poses.set(a.id, poses.get(a.id) + 1); tPose.set(a.id, p.t); }
          if (a.ombre) ombres.set(a.id, ombres.get(a.id) + 1);
          if (!a.dessine) continue;
          dess.set(a.id, dess.get(a.id) + 1);
          if (avant.get(a.id) === false) { ages.push(p.t - (tPose.get(a.id) ?? -1)); continue; }
          // la règle de distance, image par image
          const d = a._d, attendu = d < CADENCE.pres ? true : d < CADENCE.loin ? (n + a.id) % 2 === 0 : (n + a.id) % 3 === 0;
          if (d >= CADENCE.loin) loinVus++;
          if (!TELEPHONE && a.aPoser !== attendu) fautes++;
        }
      }
    } finally { Player.prototype.poser = po; }
    jeu.quitter('balade');
    const okT = t.temps('poses par image (ms)', msPoses / N, 1.1);
    const autreNiveau = dess.get(haut.id) === 0 && ombres.get(haut.id) === 0;
    // (300 images à 60 im/s : 5 s → 20 poses à 4 Hz)
    const aQuatre = Math.abs(poses.get(haut.id) - 20) <= 1;
    const age0 = ages.length >= 50 && ages.every((x) => x === 0);
    const dist = B.map((a) => a.id + ':' + Math.round(Math.hypot(a.pos.x - X0, a.pos.z - 4.5))).join(' ');
    return { ok: okT && autreNiveau && aQuatre && age0 && fautes === 0 && loinVus > 50,
      attendu: 'bot du 2e : jamais dessiné ni ombré, posé à 4 Hz (20 en 5 s) ; règle de distance (< 18 m chaque image, < 34 m une sur deux, au-delà une sur trois) sans faute ; ≥ 50 retours dans le cadre, posés dans l’image même ; ≤ 1,1 ms de poses par image',
      obtenu: `2e : dessiné ${dess.get(haut.id)}, ombre ${ombres.get(haut.id)}, ${poses.get(haut.id)} poses · fautes de cadence ${fautes} (${loinVus} images à > 34 m) · retours ${ages.length}, âges ${[...new Set(ages.map(r3))]} · distances ${dist} · poses ${B.map((a) => a.id + ':' + poses.get(a.id) + '/' + dess.get(a.id)).join(' ')} · ${(msPoses / N).toFixed(3)} ms par image` };
  }, { delai: 120 });

  // 8. CINQUANTE MORTS ET RÉAPPARITIONS du même bot : aucun clip figé, enfants de la scène constants, mémoire stable
  T('8 50 morts et réapparitions : clips, enfants, mémoire', async () => {
    game.settings.data.jeu.habillage = 'airsoft';
    await jeu.lancer('essai', { graine: 8, mannequins: [], bots: 0, humain: false });
    const p = game.partie, a = bot(p, 70, { x: 6, z: 4.5 });
    await prets([a]); image(30);
    const q = { x: a.pos.x, y: a.pos.y, z: a.pos.z };
    const mem = () => ({ ...game.renderer.info.memory, enfants: game.scene.children.length });
    let m0 = null, figes = 0, nonDebout = 0, armes = 0;
    const L = a.joueur.avatar.bone('LeftUpLeg'), q0 = new THREE.Quaternion();
    for (let n = 0; n < 50; n++) {
      // tué d'une balle au torse, depuis l'ouest
      p.infliger(a, 500, { par: -1, arme: 'fa24', zone: 'torse', x: a.pos.x, y: a.pos.y + 1.2, z: a.pos.z, dx: 1, dy: 0, dz: 0 });
      if (!a.poupee) { a.poupee = new Poupee(a.joueur, new THREE.Vector3(2.5, 0, 0), { x: a.pos.x, y: a.pos.y + 1.2, z: a.pos.z }, C()); }
      image(Math.round(2.3 * 60));
      // la réapparition (ce que font les règles : js/jeu/partie_fps.js)
      a.poupee = null; a.joueur.mesh.visible = true; a.reapparaitre(q.x, q.y, q.z, 0, p.t);
      image(10);
      // il court : la jambe bouge d'une image à l'autre, le clip de course joue
      jeu.commande(70, { ay: 1, lacet: n % 2 ? Math.PI / 2 : -Math.PI / 2 }, 0.5);
      image(10); q0.copy(L.quaternion); image(3);
      if (L.quaternion.angleTo(q0) < 1e-3 || !a.joueur.locoActif) figes++;
      image(20);
      jeu.teleporter(70, q.x, q.y, q.z, 0); image(30);
      // debout : la tête à sa hauteur, l'arme en main
      const tete = teteOs(a, new THREE.Vector3()).y - a.pos.y;
      if (tete < 1.4 * a.h / 1.73) nonDebout++;
      if (a.aff.arme3e && a.aff.arme3e.parent && a.aff.arme3e.visible) armes++;
      if (n === 4) m0 = mem();
      if (n % 5 === 4) await attendre(0);
    }
    const m1 = mem();
    jeu.quitter('balade');
    const pc = (x, y) => Math.abs(x - y) / Math.max(1, x);
    return { ok: figes === 0 && nonDebout === 0 && armes === 50 && m0.enfants === m1.enfants && pc(m0.geometries, m1.geometries) <= 0.02 && pc(m0.textures, m1.textures) <= 0.02,
      attendu: '0 clip figé après une réapparition, debout, l’arme en main ; enfants de la scène constants ; géométries et textures ± 2 %',
      obtenu: `figés ${figes} · pas debout ${nonDebout} · armé ${armes}/50 · enfants ${m0.enfants} → ${m1.enfants} · géo ${m0.geometries} → ${m1.geometries} · tex ${m0.textures} → ${m1.textures}` };
  }, { delai: 240 });

  // 9. TROIS CYCLES lancer (7 bots) / quitter : mémoire, enfants, instantané
  T('9 trois cycles à 7 bots : mémoire, enfants, instantané', async () => {
    const cycle = async () => {
      await jeu.lancer('equipes', { graine: 9, allies: 3, ennemis: 4, humain: true, avatars: ['gabriel', 'koji', 'ethan'] });
      const p = game.partie, L = p.acteurs.filter((a) => !a.local);
      await prets(L);
      jeu.avancer(7);
      image(60);
      const B = L.map((a) => a.joueur);
      jeu.quitter('balade'); await Promise.all(B.map((j) => j.liberation));
      for (let i = 0; i < 120; i++) game.carte.maj(1 / 60, game);
      await jeu.images(2);
    };
    const suites = () => { let n = 0; game.scene.traverse((o) => { if (o.userData.suite) n++; }); return n; };
    await cycle();
    const m0 = jeu.memoire(), i0 = jeu.instantane(), s0 = suites();
    for (let k = 0; k < 3; k++) await cycle();
    const m1 = jeu.memoire(), i1 = jeu.instantane(), s1 = suites();
    m1.geometries -= s1 - s0;
    const pc = (a, b) => Math.abs(a - b) / Math.max(1, a);
    return { ok: pc(m0.geometries, m1.geometries) <= 0.02 && pc(m0.textures, m1.textures) <= 0.02 && m0.enfants === m1.enfants && egal(i0, i1),
      attendu: 'géométries et textures ± 2 %, enfants identiques, instantané identique',
      obtenu: `géo ${m0.geometries} → ${m1.geometries} (hors ${s1 - s0} suites neuves du décor) · tex ${m0.textures} → ${m1.textures} · enfants ${m0.enfants} → ${m1.enfants} · instantané ${egal(i0, i1)}` };
  }, { delai: 240 });

  // 10. LA TEINTE : deux brassards de 8 cm enfants des os des bras, tenue à 60 %, aucun matériau du décor ni de Haythem
  T('10 teinteEquipe : brassards 8 cm, tenue 60 %, matériaux partagés intacts', async () => {
    const empreinte = () => {
      // (par matériau, une fois : les « suites » du décor coupé, créées à la demande, portent les matériaux de leur bloc)
      const M = new Map();
      game.scene.traverse((o) => {
        if (!o.isMesh || !o.material) return;
        for (const m of Array.isArray(o.material) ? o.material : [o.material]) M.set(m.uuid, [m.uuid, m.version, m.color ? m.color.getHexString() : '', m.opacity, m.transparent, m.emissive ? m.emissive.getHexString() : '']);
      });
      return hacher([...M.values()].sort((a, b) => (a[0] < b[0] ? -1 : 1)));
    };
    const e0 = empreinte();
    await preparerAvatars(game, ['koji'], null);
    const A = creerCorps(FICHE_HAYTHEM, game.scene, { equipe: 'A' }), Bc = creerCorps(FICHES_BOTS[3], game.scene, { equipe: 'B' });
    const t0 = performance.now();
    while (performance.now() - t0 < 10000 && (!A.avatarModel || !Bc.avatarModel)) await attendre(0.05);
    const res = [];
    for (const [c, eq] of [[A, 'A'], [Bc, 'B']]) {
      const br = c.brassards || [], sc = new THREE.Vector3();
      const h = br.map((b) => { b.geometry.computeBoundingBox(); b.parent.getWorldScale(sc); return (b.geometry.boundingBox.max.y - b.geometry.boundingBox.min.y) * sc.y; });
      const parents = br.map((b) => b.parent && b.parent.name.replace(/^mixamorig:?/, ''));
      let force = null, coul = null;
      c.avatarModel.traverse((o) => { if (o.isSkinnedMesh && o.material && o.material.__cage && /look/i.test(o.material.name)) { force = o.material.__cage.uFitCorps.value.w; coul = '#' + o.material.__cage.uFitA.value.getHexString(); } });
      res.push({ eq, n: br.length, h, parents, force, coul, attendue: EQUIPES[eq].couleur, mat: br[0] && '#' + br[0].material.color.getHexString() });
    }
    // les matériaux du décor et de Haythem, hors ceux des deux corps
    const L = [];
    game.scene.traverse((o) => { if (o.isMesh && o.material && !o.userData.brassard) { let x = o; while (x && x !== A.mesh && x !== Bc.mesh) x = x.parent; if (!x) L.push(o); } });
    for (const c of [A, Bc]) libererCorps(c);
    await Promise.all([A.liberation, Bc.liberation]);
    const e1 = empreinte();
    const ok = res.every((r) => r.n === 2 && r.h.every((x) => Math.abs(x - 0.08) <= 0.002) && egal(r.parents.slice().sort(), ['LeftArm', 'RightArm'])
      && Math.abs(r.force - TEINTE.force) < 1e-9 && r.coul === r.attendue && r.mat === r.attendue) && e0 === e1;
    return { ok, attendu: '2 brassards de 8 cm ± 2 mm sous LeftArm / RightArm, tenue à 0,6 de la couleur de l’équipe, empreinte des matériaux de la scène identique',
      obtenu: res.map((r) => `${r.eq} : ${r.n} brassards ${r.h.map((x) => (x * 100).toFixed(1) + ' cm')} sous ${r.parents} · tenue ${r.force} ${r.coul} (${r.attendue}) · brassard ${r.mat}`).join(' | ') + ` · empreinte ${e0 === e1 ? 'identique' : e0 + ' ≠ ' + e1}` };
  }, { delai: 60 });

  // 11. LES BOÎTES DE TOUCHE (formules du socle) contre l'os Head, en course, pour les 7 fiches
  T('11 tête simulée / os Head en course ≤ 6 cm (moy.), ≤ 10 cm (95e), 7 fiches', async () => {
    const res = [];
    for (const f of [FICHE_HAYTHEM, ...FICHES_BOTS]) {
      await jeu.lancer('essai', { graine: 11, mannequins: [], bots: 0, humain: false, avatars: f === FICHE_HAYTHEM ? [] : [f.id] });
      const p = game.partie;
      const a = p.ajouterActeur({ id: 80, nom: f.nom, equipe: 'A', fiche: f, x: 14.88, y: 0, z: -3.12, lacet: 0, cerveau: 'errant', classe: 'assaut' });
      await prets([a]);
      const E = [], v1 = new THREE.Vector3(), v2 = new THREE.Vector3();
      for (let i = 0; i < 20 * 60; i++) {
        image();
        if (a.joueur.speedNow > 4 && !a.joueur.airborne && i > 60) E.push(teteOs(a, v1).distanceTo(teteSimulee(a, v2)));
      }
      jeu.quitter('balade');
      res.push({ id: f.id, n: E.length, moy: moyenne(E), p95: centile(E, 0.95) });
    }
    const ok = res.every((r) => r.n >= 120 && r.moy <= 0.06 && r.p95 <= 0.10);
    return { ok, attendu: 'pour chaque fiche, en course (> 4 m/s, ≥ 2 s d’images) : écart moyen ≤ 6 cm, 95e centile ≤ 10 cm',
      obtenu: res.map((r) => `${r.id} ${(r.moy * 100).toFixed(1)} / ${(r.p95 * 100).toFixed(1)} cm (${r.n})`).join(' · ') };
  }, { delai: 240 });

  // 12. LA BALADE AU BIT PRÈS (L-C touche js/player.js et js/couches.js)
  T('12 balade rejouée au bit près', async () => {
    const r = await jeu.rejouerBalade();
    return { ok: r.ok && r.identiques && r.fonctionsRendues, attendu: `écart ≤ ${r.seuils.pos} / ${r.seuils.cam}, deux rejeux identiques`,
      obtenu: `profil ${r.profil} · vue 3 ${r.vue3.pos} / ${r.vue3.cam} · vue 1 ${r.vue1.pos} / ${r.vue1.cam} · même onglet ${r.identiques}` };
  }, { delai: 120 });

  // 13. LA LISIBILITÉ : 10 photos d'un SISR et d'un SLAM clonés de Haythem, à 10, 20 et 30 m, au −1, au hall, dans la rue
  // (jugées et notées au rapport ; window.__photosLC)
  T('13 lisibilité : 10 photos (SISR et SLAM clonés de Haythem)', async () => {
    await jeu.lancer('essai', { graine: 13, mannequins: [], bots: 0, humain: true, avatars: [] });
    const p = game.partie;
    const sisr = bot(p, 90, { equipe: 'A' }), slam = bot(p, 91, { equipe: 'B' });
    await prets([sisr, slam]);
    window.__photosLC = {};
    // [lieu, caméra (x, y, z, lacet), direction des bots (dx, dz), distances]
    const plans = [['rue', [-2.0, 0, 4.6], [1, 0], [10, 20, 30]], ['hall', [21.2, 0, -3.0], [-1, 0], [10, 20]],
      ['moins1', [1.4, -3.06, -10.9], [1, 0], [10, 15]], ['couloir', [15.6, 0, -18.5], [0, 1], [10, 15]], ['proche', [-2.0, 0, 4.6], [1, 0], [5]]];
    let n = 0;
    for (const [lieu, cam, dir, ds] of plans) {
      for (const d of ds) {
        const q = libre(cam[0], cam[1], cam[2]);
        const lacet = Math.atan2(-dir[0], -dir[1]);
        jeu.teleporter(0, q.x, q.y, q.z, lacet); game.camPitch = 0.02;
        const bx = q.x + dir[0] * d, bz = q.z + dir[1] * d, px = -dir[1], pz = dir[0];
        const s1 = libre(bx + px * 0.6, q.y, bz + pz * 0.6), s2 = libre(bx - px * 0.6, q.y, bz - pz * 0.6);
        jeu.teleporter(90, s1.x, s1.y, s1.z, lacet + Math.PI); jeu.teleporter(91, s2.x, s2.y, s2.z, lacet + Math.PI);
        for (const id of [90, 91]) jeu.viser(id, { lacet: lacet + Math.PI, tangage: 0 });
        image(20);
        for (let i = 0; i < 40; i++) game.carte.maj(1 / 60, p.jeuCarte);
        game.fx.render(1 / 60);
        window.__photosLC[`${String(++n).padStart(2, '0')}_${lieu}_${d}m`] = jeu.photo(lieu + d);
      }
    }
    jeu.quitter('balade');
    const L = Object.values(window.__photosLC);
    return { ok: L.length === 10 && L.every((x) => typeof x === 'string' && x.length > 5000), attendu: '10 photos (jugées au rapport)',
      obtenu: Object.keys(window.__photosLC).join(', ') };
  }, { delai: 120 });

  // 14. L'HABILLAGE : Airsoft, poupée 1,5 s puis effacement en 0,6 s ; Militaire, 4 s, enfoncement, disparition
  T('14 habillage : Airsoft 1,5 s + 0,6 s ; Militaire 4 s, enfoncement 0,5 m, disparition', async () => {
    const R = {};
    for (const hab of ['airsoft', 'militaire']) {
      game.settings.data.jeu.habillage = hab;
      await jeu.lancer('essai', { graine: 14, mannequins: [], bots: 0, humain: true });
      const p = game.partie;
      jeu.teleporter(0, -2, 0, 4.6, -Math.PI / 2);
      const a = bot(p, 95, { x: 4, z: 4.6, lacet: Math.PI / 2 });
      await prets([a]); image(20);
      p.infliger(a, 500, { par: 0, arme: 'fa24', zone: 'torse', x: a.pos.x, y: a.pos.y + 1.2, z: a.pos.z, dx: 1, dy: 0, dz: 0 });
      const P = a.poupee, mat = (() => { let m = null; a.joueur.avatarModel.traverse((o) => { if (!m && o.isSkinnedMesh) m = o.material; }); return m; })();
      const sol = C().solEn(a.pos.x, a.pos.z, a.pos.y + 0.3), hips = new THREE.Vector3(), L = [];
      for (let i = 0; i < 5 * 60; i++) {
        image();
        a.joueur.avatar.bone('Hips').getWorldPosition(hips);
        L.push({ t: P.t, vis: a.joueur.mesh.visible, op: mat.opacity, tr: mat.transparent, y: hips.y - sol });
      }
      jeu.quitter('balade');
      const a1 = L.find((x) => x.t >= 1.45 && x.t <= 1.5), mi = L.find((x) => x.t >= 1.79 && x.t <= 1.81), cache = L.find((x) => !x.vis);
      const y4 = L.find((x) => x.t >= 3.95 && x.t <= 4.0), y44 = L.filter((x) => x.t > 4.0 && x.vis).pop();
      R[hab] = { avant: a1, milieu: mi, cache: cache ? r2(cache.t) : null, y4: y4 ? r2(y4.y) : null, enfonce: y4 && y44 ? r2(y4.y - y44.y) : null, poupee: !!P };
    }
    game.settings.data.jeu.habillage = 'airsoft';
    const A = R.airsoft, M = R.militaire;
    const okA = A.poupee && A.avant && A.avant.vis && A.avant.op === 1 && A.milieu && A.milieu.tr && Math.abs(A.milieu.op - 0.5) < 0.06 && Math.abs(A.cache - 2.1) <= 0.03;
    const okM = M.poupee && M.avant && M.avant.vis && M.avant.op === 1 && Math.abs(M.cache - 4.4) <= 0.03 && M.enfonce >= 0.45;
    return { ok: okA && okM, attendu: 'Airsoft : opaque à 1,5 s, à moitié effacé à 1,8 s, caché à 2,1 s · Militaire : opaque, s’enfonce de 0,5 m entre 4,0 et 4,4 s, caché à 4,4 s',
      obtenu: `Airsoft : opacité ${A.avant && A.avant.op} à 1,5 s, ${A.milieu && r2(A.milieu.op)} à 1,8 s, caché à ${A.cache} s · Militaire : opacité ${M.avant && M.avant.op}, hanches ${M.y4} m à 4 s, enfoncées de ${M.enfonce} m, caché à ${M.cache} s` };
  }, { delai: 90 });
}
