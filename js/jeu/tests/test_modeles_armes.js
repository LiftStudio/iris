// =====================================================================
//  LES TESTS DES MODÈLES D'ARMES — les VRAIES armes 3D (lot L-X, 24/10/2026 ; ceux de L-W, 23/10, repris pour les GLB)
// =====================================================================
// Lancés par le harnais sous `?test=1&rapport=1&lot=L-W` (le fichier de L-W dans FICHIERS_TESTS ; L-X le possède depuis
// la demande de Haythem du 23/10), PC puis `?tel=1`, dans une page FRAÎCHE (le test 0 vérifie que rien n'a été chargé au
// démarrage). Les tests ne cliquent jamais à l'écran : tout passe par window.__jeu et creerArme. Les planches (studio, vue
// FPS, bots, courses) restent dans window.__planche* ; avec `&recepteur=<port>` (un récepteur local, outil du rapport L-X)
// chaque photo est aussi envoyée pour être regardée.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { creerArme, libererArme, viderCacheArmes, prechargerArmes, etatArmes, forcerFaitMain, chargerModele, remplacerRepli, modeleArme,
  REPERES, OS_ARMES, COURSES_OS, ENCOMBREMENTS, IDS_ARMES, MATERIAUX_ARMES, BASE_ARMES } from '../modeles_armes.js';
import { TELEPHONE } from '../../appareil.js';

const ARMES_FEU = ['fa24', 'pm9', 'fp12', 'tp50', 'p17'];
const NOMS = { fa24: 'FA-24', pm9: 'PM-9', fp12: 'FP-12', tp50: 'TP-50', p17: 'P-17', couteau: 'COUTEAU', frag: 'FRAG', flash: 'FLASH' };
const NOMS_OS = ['chargeur', 'culasse', 'glissiere', 'pompe', 'detente', 'goupille'];
// les triangles des vrais modèles (manifeste de l'atelier, 23/10)
const TRIANGLES = { fa24: 9236, pm9: 7721, fp12: 1740, tp50: 4808, p17: 3991, couteau: 1550, frag: 3642, flash: 5562 };
const CLASSE_DE = { fa24: 'assaut', pm9: 'infiltration', fp12: 'defense', tp50: 'tireur', p17: 'assaut' };
const r3 = (v) => Math.round(v * 1000) / 1000;
const mailles = (g) => { const L = []; g.traverse((o) => { if (o.isMesh) L.push(o); }); return L; };
const triangles = (g) => mailles(g).reduce((s, m) => s + (m.geometry.index ? m.geometry.index.count : m.geometry.attributes.position.count) / 3, 0);
const RECEPTEUR = new URLSearchParams(location.search).get('recepteur');
function envoyer(nom, url) {
  if (!RECEPTEUR || !url) return;
  fetch(`http://127.0.0.1:${RECEPTEUR}/?nom=${encodeURIComponent(nom)}`, { method: 'POST', body: url }).catch(() => { /* pas de récepteur */ });
}

// UN RENDU DE CONTRÔLE dans une cible à part (appels, programmes, textures) : la scène telle quelle, une caméra qui voit tout
function rendreCible(game, scene) {
  const r = game.renderer, rt = rendreCible.rt || (rendreCible.rt = new THREE.WebGLRenderTarget(128, 128));
  const cam = rendreCible.cam || (rendreCible.cam = new THREE.OrthographicCamera(-1.5, 1.5, 1.5, -1.5, 0.01, 10));
  cam.position.set(3, 0.4, 0); cam.lookAt(0, 0, 0); cam.updateMatrixWorld(true);
  const prec = r.getRenderTarget(), auto = r.info.autoReset;
  r.info.autoReset = true;
  try { r.setRenderTarget(rt); r.render(scene, cam); }
  finally { r.setRenderTarget(prec); r.info.autoReset = auto; }
  return { appels: r.info.render.calls, triangles: r.info.render.triangles, programmes: r.info.programs ? r.info.programs.length : 0, textures: r.info.memory.textures };
}
const charger = (src) => new Promise((ok, ko) => { const im = new Image(); im.onload = () => ok(im); im.onerror = ko; im.src = src; });

// LE STUDIO DES PHOTOS (planches 7 et 10, de L-W) : une superposition dessinée par le jeu (__jeu.photo : bloom, sortie,
// étalonnage), la carte d'environnement de RoomEnvironment, un fond dégradé collé à la caméra — aucune lumière ajoutée
// (interdite dans js/jeu/ hors viewmodel.js) ; chaque photo mesurée contre la même sans l'arme (la part de l'image qui est l'arme)
function studio(jeu, game, nc, nl, titre) {
  const r = game.renderer, fx = game.fx;
  const pm = new THREE.PMREMGenerator(r), env = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose();
  const sc = new THREE.Scene(); sc.environment = env; sc.environmentIntensity = 0.85;
  const cam = new THREE.PerspectiveCamera(22, game.camera.aspect, 0.01, 50); sc.add(cam);
  const fg = new THREE.PlaneGeometry(2, 2), haut = new THREE.Color(0x8d939b), bas = new THREE.Color(0x3c4046), col = [];
  for (let i = 0; i < 4; i++) { const c = i < 2 ? haut : bas; col.push(c.r, c.g, c.b); }
  fg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  const fm = new THREE.MeshBasicMaterial({ vertexColors: true, depthWrite: false, toneMapped: false });
  const fond = new THREE.Mesh(fg, fm); fond.position.z = -40; fond.scale.set(60, 60, 1); fond.renderOrder = -1; cam.add(fond);
  const sup = { scene: sc, camera: cam };
  fx.superpositions.push(sup);
  const P = planche(nc, nl, titre);
  const b = new THREE.Box3(), s = new THREE.Sphere();
  return {
    scene: sc,
    cadrer(g, az, el, marge = 1.06) {
      g.updateMatrixWorld(true);
      b.makeEmpty(); for (const m of mailles(g)) { m.geometry.computeBoundingBox(); b.union(m.geometry.boundingBox); }
      b.getBoundingSphere(s);
      cam.fov = 22;
      const tv = Math.tan(cam.fov * Math.PI / 360), th = tv * game.camera.aspect;
      const d = Math.max(s.radius / Math.sin(Math.atan(th)), (b.max.y - b.min.y) * 0.62 / tv) * marge;
      const a = az * Math.PI / 180, e = el * Math.PI / 180;
      cam.position.set(s.center.x + d * Math.cos(e) * Math.sin(a), s.center.y + d * Math.sin(e), s.center.z - d * Math.cos(e) * Math.cos(a));
      cam.lookAt(s.center);
    },
    tireur() {
      const a0 = game.camera.aspect;
      cam.fov = a0 >= 16 / 9 ? 52 : 2 * Math.atan(Math.tan(26 * Math.PI / 180) * (16 / 9) / a0) * 180 / Math.PI;
      cam.position.set(-0.135, 0.125, 0.32).applyAxisAngle(new THREE.Vector3(0, 1, 0), -0.035); cam.rotation.set(0, -0.035, 0);
    },
    async photo(g, j, i, titre) {
      cam.aspect = game.camera.aspect; cam.updateProjectionMatrix(); cam.updateMatrixWorld(true);
      g.visible = false; const vide = jeu.photo('fond'); g.visible = true;
      return P.case(j, i, titre, jeu.photo(titre), vide);
    },
    planche: () => P.fin(),
    fermer() { const k = fx.superpositions.indexOf(sup); if (k >= 0) fx.superpositions.splice(k, 1); env.dispose(); fg.dispose(); fm.dispose(); },
  };
}
// une PLANCHE de `nc` × `nl` cases de 400 px ; chaque case : la photo, son titre, et (si `vide` est donnée) la part de
// l'image qui diffère d'elle — et la luminance de ces pixels (moyenne, part brûlée > 0,97, part noire < 0,03)
function planche(nc, nl, titre) {
  const g = window.__game, W = 400, H = Math.round(400 / g.camera.aspect), cv = document.createElement('canvas');
  cv.width = nc * W; cv.height = nl * H + 26;
  const cx = cv.getContext('2d'); cx.fillStyle = '#16181b'; cx.fillRect(0, 0, cv.width, cv.height);
  cx.font = '600 15px system-ui, sans-serif'; cx.textBaseline = 'top'; cx.fillStyle = '#fff'; cx.fillText(titre || '', 8, 6);
  return {
    async case(j, i, t, url, vide = null) {
      const x = j * W, y = 26 + i * H;
      let ref = null;
      if (vide) { cx.drawImage(await charger(vide), x, y, W, H); ref = cx.getImageData(x, y, W, H).data; }
      cx.drawImage(await charger(url), x, y, W, H);
      const px = cx.getImageData(x, y, W, H).data;
      let n = 0, lum = 0, brule = 0, noir = 0;
      if (ref) for (let k = 0; k < px.length; k += 8) {
        if (Math.abs(px[k] - ref[k]) + Math.abs(px[k + 1] - ref[k + 1]) + Math.abs(px[k + 2] - ref[k + 2]) <= 48) continue;
        const l = (0.2126 * px[k] + 0.7152 * px[k + 1] + 0.0722 * px[k + 2]) / 255;
        n++; lum += l; if (l > 0.97) brule++; if (l < 0.03) noir++;
      }
      cx.fillStyle = 'rgba(0,0,0,0.55)'; cx.fillRect(x, y, W, 22); cx.fillStyle = '#fff'; cx.fillText(t, x + 6, y + 4);
      return { part: ref ? n / (px.length / 8) : 1, lum: n ? lum / n : 0, brule: n ? brule / n : 0, noir: n ? noir / n : 0 };
    },
    fin: () => cv.toDataURL('image/jpeg', 0.88),
  };
}
// des images faites, et le temps simulé de la partie avancé d'au moins `s` secondes
async function simuler(t, p, s) { const t0 = p.t; for (let k = 0; k < 400 && p.t - t0 < s; k++) await t.images(3); }

export default function (jeu) {
  const game = window.__game;
  const T = (nom, fn, o) => jeu.ajouterTest('L-W', nom, fn, o);

  // 0. RIEN AU DÉMARRAGE, TOUT À LA PRÉPARATION : la page fraîche n'a demandé aucun GLB d'arme (la balade ne s'allonge
  // pas) ; une partie lancée les charge pendant sa préparation (le 1er creerArme lance prechargerArmes), et le repli fait
  // main que l'arme de vue et les bots ont reçu en attendant est REMPLI EN PLACE par la vraie arme (mêmes objets)
  T('0 · rien au démarrage, les vraies armes à la préparation', async (t) => {
    const avant = etatArmes(), demandes = performance.getEntriesByType('resource').filter((e) => e.name.includes('/armes/')).length;
    jeu.figerQualite(true);
    await jeu.lancer('essai', { graine: 42, mannequins: 0, bots: 2 });
    const p = game.partie, vm = p.aff.viewmodel;
    const groupes = vm ? Object.values(vm.armes) : [], idsVue = vm ? Object.keys(vm.armes) : [];
    const modeles0 = groupes.map((g) => g.userData.modele).join('/');
    const E = await prechargerArmes();                                        // (la même promesse que celle lancée par la préparation)
    await t.images(4);
    const vus = groupes.filter((g, k) => vm.armes[idsVue[k]] === g && g.userData.modele === 'glb' && mailles(g).length === 1).length;
    const bots = p.acteurs.filter((a) => !a.local && a.aff && a.aff.arme3e);
    const bots3e = bots.filter((a) => a.aff.arme3e.userData.modele === 'glb').length;
    const prog0 = game.renderer.info.programs.length;
    await simuler(t, p, 1.5);
    const prog1 = game.renderer.info.programs.length;
    jeu.quitter('balade'); jeu.figerQualite(false);
    const ok = !avant.demande && demandes === 0 && E.prets.length === 8 && Object.keys(E.echecs).length === 0 && E.attente === 0
      && vus === groupes.length && groupes.length === 8 && bots.length > 0 && bots3e === bots.length && prog1 === prog0;
    t.note('préchargement (ms)', Math.round(E.ms));
    return { ok, attendu: 'aucun GLB demandé avant la partie ; à la préparation les 8 chargés, 0 échec ; les 8 armes de vue et les armes des bots remplies en place (1 maillage, glb) ; programmes constants ensuite',
      obtenu: `avant : demandé ${avant.demande}, ${demandes} requêtes /armes/ · préparation : ${modeles0} → ${vus}/${groupes.length} glb · bots ${bots3e}/${bots.length} glb · ${E.prets.length} prêts, échecs ${JSON.stringify(E.echecs)}, en attente ${E.attente}, ${Math.round(E.ms)} ms · programmes ${prog0} → ${prog1}` };
  }, { delai: 180 });

  // 1. LES HUIT VRAIES ARMES : un maillage, un appel (vue ≤ 8 demandés, 3e ≤ 3), les triangles du vrai modèle (≤ 30 000),
  // textures 1024 (512 au téléphone), couleur sRGB, normales linéaires et normalScale (1, −1) de GLTFLoader, depuis BASE_ARMES
  T('1 · huit vraies armes : appels, triangles, textures', async () => {
    await prechargerArmes();
    const L = [], fautes = [], taille = TELEPHONE ? 512 : 1024;
    for (const id of IDS_ARMES) for (const vue of [true, false]) {
      const g = creerArme(id, { pourVue: vue }), sc = new THREE.Scene(); sc.add(g);
      const n = mailles(g).length, tr = triangles(g), R = rendreCible(game, sc), m = mailles(g)[0], mat = m.material;
      const tex = [mat.map, mat.normalMap, mat.roughnessMap].map((x) => (x && x.image ? x.image.width : 0));
      const ok = g.userData.modele === 'glb' && n === 1 && R.appels === 1 && tr === TRIANGLES[id] && tr <= 30000 && tex.every((w) => w === taille)
        && mat.map.colorSpace === THREE.SRGBColorSpace && mat.normalMap.colorSpace !== THREE.SRGBColorSpace && mat.normalScale.y === -1 && (vue ? m.isSkinnedMesh : !m.isSkinnedMesh)
        && mat === MATERIAUX_ARMES.glb(id);
      if (!ok) fautes.push(`${id} ${vue ? 'vue' : '3e'} : ${g.userData.modele}, ${n} maillages, ${R.appels} appels, ${tr} triangles, textures ${tex.join('/')}, normalScale ${mat.normalScale && mat.normalScale.y}`);
      if (vue) L.push(`${NOMS[id]} ${tr} tri. ${tex[0]} px`);
      libererArme(g);
    }
    return { ok: fautes.length === 0, attendu: `1 maillage et 1 appel par arme (vue SkinnedMesh, 3e Mesh), triangles du vrai modèle, textures ${taille} px, couleur sRGB, normalScale (1, −1) ; ${BASE_ARMES}`,
      obtenu: fautes.length ? fautes.join(' · ') : L.join(' · ') + ' · ' + BASE_ARMES };
  });

  // 2. LES REPÈRES, RELEVÉS SUR LE VRAI MODÈLE : la table REPERES = extras.iris.reperes du GLB (1 mm) ; dans chaque groupe,
  // enfants directs, `position` = la table ; les os (Bone) = les vraies pièces, à leurs pivots ; les jumeaux mobiles suivent leur
  // os, et seulement eux
  T('2 · repères (= le vrai modèle) et os', async () => {
    await prechargerArmes();
    const fautes = []; let ecart = 0, ecartGlb = 0, suivis = 0, compares = 0;
    const w = new THREE.Vector3(), w0 = new THREE.Vector3();
    for (const id of IDS_ARMES) {
      for (const vue of [true, false]) {
        const g = creerArme(id, { pourVue: vue }); g.updateMatrixWorld(true);
        for (const [nom, p] of Object.entries(REPERES[id])) {
          if (!Array.isArray(p)) continue;
          const R = g.userData.reperes[nom];
          if (!R) { fautes.push(`${id} : repère ${nom} absent`); continue; }
          const d = Math.max(R.getWorldPosition(w).distanceTo(w0.set(p[0], p[1], p[2])), R.position.distanceTo(w0)); ecart = Math.max(ecart, d);
          if (d > 0.001 || R.parent !== g) fautes.push(`${id} ${vue ? 'vue' : '3e'} ${nom} à ${r3(d * 1000)} mm`);
        }
        const os = g.userData.os, mob = g.userData.reperesMobiles;
        if (!vue) { if (os !== null || mob !== null) fautes.push(`${id} 3e : des os`); libererArme(g); continue; }
        for (const [nom, J] of Object.entries(mob)) {
          const p = REPERES[id][nom], d = J.getWorldPosition(w).distanceTo(w0.set(p[0], p[1], p[2]));
          if (d > 0.001 || !J.parent || !J.parent.isBone) fautes.push(`${id} : jumeau ${nom} à ${r3(d * 1000)} mm`);
        }
        for (const n of NOMS_OS) {
          const b = os ? os[n] : undefined, voulu = OS_ARMES[id][n];
          if (voulu && !(b && b.isBone && b.name === n && b.position.distanceTo(w0.set(...voulu)) <= 0.001)) fautes.push(`${id} : os ${n} absent ou loin de son pivot`);
          if (!voulu && b !== null) fautes.push(`${id} : os ${n} en trop`);
        }
        for (const [n, c] of Object.entries(COURSES_OS[id])) {
          const b = os[n], av = {};
          const tous = [...Object.entries(g.userData.reperes), ...Object.entries(mob).map(([nom, J]) => [nom + ' (mobile)', J])];
          for (const [nom, R] of tous) av[nom] = R.getWorldPosition(new THREE.Vector3());
          b.position.x += c.x || 0; b.position.y += c.y || 0; b.position.z += c.z || 0; g.updateMatrixWorld(true);
          for (const [nom, R] of tous) {
            let porte = false; R.traverseAncestors((a) => { if (a === b) porte = true; });
            const d = R.getWorldPosition(w).sub(av[nom]);
            if (porte) { suivis++; if (Math.abs(d.x - (c.x || 0)) + Math.abs(d.y - (c.y || 0)) + Math.abs(d.z - (c.z || 0)) > 1e-6) fautes.push(`${id} : ${nom} ne suit pas ${n}`); }
            else if (d.length() > 1e-9) fautes.push(`${id} : ${nom} bouge avec ${n}`);
          }
          b.position.fromArray(OS_ARMES[id][n]); g.updateMatrixWorld(true);
        }
        libererArme(g);
      }
    }
    // la table contre les extras du GLB (relus par un chargement d'essai, rien de retenu)
    for (const id of IDS_ARMES) {
      const M = await chargerModele(id, undefined, { garder: false }), R = M && M.iris && M.iris.reperes;
      if (!R) { fautes.push(`${id} : extras.iris absents`); continue; }
      for (const [nom, p] of Object.entries(R)) {
        const q = REPERES[id][nom === 'origine' ? 'centrePoignee' : nom];
        if (!Array.isArray(q)) continue;
        compares++; const d = Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]); ecartGlb = Math.max(ecartGlb, d);
        if (d > 0.001) fautes.push(`${id} ${nom} : table à ${r3(d * 1000)} mm du GLB`);
      }
    }
    if (Math.abs(REPERES.fp12.courseMainG - COURSES_OS.fp12.pompe.z) > 1e-9) fautes.push('FP-12 : courseMainG ≠ la course de la pompe');
    return { ok: fautes.length === 0 && suivis === 11 && compares >= 50, attendu: 'repères = REPERES ± 1 mm (enfants du groupe) = extras.iris du GLB ± 1 mm ; os Bone aux pivots ; 11 jumeaux qui suivent leur os',
      obtenu: fautes.length ? fautes.slice(0, 12).join(' · ') : `écart max ${r3(ecart * 1000)} mm · table / GLB ${r3(ecartGlb * 1000)} mm sur ${compares} repères · ${suivis} jumeaux suivis` };
  });

  // 3. L'ENCOMBREMENT des vrais modèles (longueur selon −Z) = ENCOMBREMENTS ± 1 % ; l'écart au § 3.3 noté
  T('3 · encombrement', async () => {
    await prechargerArmes();
    const fautes = [], L = [], SPEC = { fa24: 0.84, pm9: 0.62, fp12: 0.95, tp50: 1.10, p17: 0.19 };
    for (const id of ARMES_FEU) for (const vue of [true, false]) {
      const g = creerArme(id, { pourVue: vue }), b = new THREE.Box3();
      for (const m of mailles(g)) { m.geometry.computeBoundingBox(); b.union(m.geometry.boundingBox); }
      const long = b.max.z - b.min.z, e = long / ENCOMBREMENTS[id] - 1;
      if (Math.abs(e) > 0.01) fautes.push(`${id} ${vue ? 'vue' : '3e'} ${r3(long)} m`);
      if (vue) L.push(`${NOMS[id]} ${r3(long)} m (§ 3.3 : ${SPEC[id]}, ${long >= SPEC[id] ? '+' : ''}${((long / SPEC[id] - 1) * 100).toFixed(0)} %)`);
      libererArme(g);
    }
    return { ok: fautes.length === 0, attendu: 'longueurs mesurées = ENCOMBREMENTS ± 1 % (les vraies armes)', obtenu: fautes.length ? fautes.join(' · ') : L.join(' · ') };
  });

  // 4. LES OS RIGIDES : poids 1 sur un seul os ; bouger un os de 10 cm ne bouge que SES sommets (ceux de sa vraie pièce), tous de 10 cm
  T('4 · os rigides (les vraies pièces)', async () => {
    await prechargerArmes();
    const fautes = [], L = [], v = new THREE.Vector3();
    for (const id of IDS_ARMES) {
      const g = creerArme(id, { pourVue: true }), os = g.userData.os, M = mailles(g); g.updateMatrixWorld(true);
      const compte = {};
      for (const m of M) {
        const W = m.geometry.attributes.skinWeight.array, I = m.geometry.attributes.skinIndex.array, B = m.skeleton.bones;
        for (let i = 0; i < W.length; i += 4) {
          if (W[i] !== 1 || W[i + 1] !== 0 || W[i + 2] !== 0 || W[i + 3] !== 0) { fautes.push(`${id} : poids ${W[i]},${W[i + 1]}`); break; }
          const n = B[I[i]].name; compte[n] = (compte[n] || 0) + 1;
        }
      }
      for (const n of Object.keys(OS_ARMES[id])) {
        const b = os[n], k = compte[n] || 0;
        if (k !== g.userData.sommetsParOs[n] || k === 0) fautes.push(`${id} ${n} : ${k} sommets portés, ${g.userData.sommetsParOs[n]} comptés`);
        const avant = M.map((m) => { const n0 = m.geometry.attributes.position.count, A = new Float32Array(3 * n0); for (let i = 0; i < n0; i++) { m.getVertexPosition(i, v); A[3 * i] = v.x; A[3 * i + 1] = v.y; A[3 * i + 2] = v.z; } return A; });
        b.position.y -= 0.10; g.updateMatrixWorld(true);
        let bouges = 0, exacts = 0;
        M.forEach((m, j) => {
          const A = avant[j];
          for (let i = 0; i < A.length / 3; i++) {
            m.getVertexPosition(i, v);
            const d = Math.hypot(v.x - A[3 * i], v.y - A[3 * i + 1], v.z - A[3 * i + 2]);
            if (d > 1e-7) { bouges++; if (Math.abs(A[3 * i + 1] - v.y - 0.10) < 1e-5 && Math.abs(v.x - A[3 * i]) < 1e-5 && Math.abs(v.z - A[3 * i + 2]) < 1e-5) exacts++; }
          }
        });
        b.position.fromArray(OS_ARMES[id][n]); g.updateMatrixWorld(true);
        if (bouges !== k || exacts !== k) fautes.push(`${id} ${n} : ${bouges} sommets bougés (${exacts} de 10 cm) pour ${k} portés`);
        L.push(`${NOMS[id]}.${n} ${bouges}/${k}`);
      }
      libererArme(g);
    }
    return { ok: fautes.length === 0, attendu: 'chaque os bougé de 10 cm : exactement les sommets de sa pièce, tous de 10 cm, poids 1', obtenu: fautes.length ? fautes.slice(0, 10).join(' · ') : L.join(' · ') };
  });

  // 5. LE PARTAGE : après le préchargement, aucune requête de plus ; 20 exemplaires de chaque (vue et 3e) = 0 matériau, 0 programme
  // de plus ; les textures : +1 par squelette de vue rendu (celle de ses os), rendues par libererArme ; les tampons partagés
  // entre la vue et la 3e personne (position, normale, uv, index : les mêmes objets)
  T('5 · réseau, textures, partage', async () => {
    await prechargerArmes();
    const requetes = [], obs = new PerformanceObserver((l) => requetes.push(...l.getEntries()));
    obs.observe({ type: 'resource' });
    const sc = new THREE.Scene(), mats = new Set(), premiers = [];
    for (const id of IDS_ARMES) for (const vue of [true, false]) { const g = creerArme(id, { pourVue: vue }); sc.add(g); premiers.push(g); }
    for (const g of premiers) for (const m of mailles(g)) mats.add(m.material);
    let partages = 0;
    for (let k = 0; k < premiers.length; k += 2) { const a = mailles(premiers[k])[0].geometry, b = mailles(premiers[k + 1])[0].geometry; if (a.attributes.position === b.attributes.position && a.index === b.index && a.attributes.uv === b.attributes.uv) partages++; }
    const A = rendreCible(game, sc), plus = [];
    for (let i = 0; i < 20; i++) for (const id of IDS_ARMES) for (const vue of [true, false]) { const g = creerArme(id, { pourVue: vue }); sc.add(g); plus.push(g); }
    const mats2 = new Set(); for (const g of [...premiers, ...plus]) for (const m of mailles(g)) mats2.add(m.material);
    const B = rendreCible(game, sc);
    const sq = plus.filter((g) => g.userData.squelette).length, sq0 = premiers.filter((g) => g.userData.squelette).length;
    for (const g of plus) libererArme(g);
    const C = rendreCible(game, sc);
    for (const g of premiers) libererArme(g);
    const D = rendreCible(game, sc);
    await new Promise((r) => setTimeout(r, 300));
    requetes.push(...obs.takeRecords()); obs.disconnect();
    const ok = requetes.length === 0 && mats.size === 8 && mats2.size === 8 && partages === 8 && B.programmes === A.programmes
      && B.textures - A.textures === sq && C.textures === A.textures && D.textures === A.textures - sq0;
    return { ok, attendu: '0 requête ; 8 matériaux (un par arme) ; tampons partagés vue / 3e ; +20 × 16 : 0 matériau, 0 programme, textures = 1 par squelette de vue (rendues)',
      obtenu: `requêtes ${requetes.length} · ${mats.size} matériaux → ${mats2.size} · tampons partagés ${partages}/8 · programmes ${A.programmes} → ${B.programmes} · textures ${A.textures} → ${B.textures} (+${B.textures - A.textures} pour ${sq} squelettes) → ${C.textures} → ${D.textures}` };
  });

  // 6. LA CRÉATION d'un exemplaire ≤ 5 ms (les géométries cousues une fois au chargement) ; la couture de chaque GLB notée
  T('6 · création ≤ 5 ms', async (t) => {
    await prechargerArmes();
    for (const id of IDS_ARMES) { libererArme(creerArme(id, { pourVue: true })); libererArme(creerArme(id, { pourVue: false })); }
    const M = {}; let pire = 0, quel = '';
    for (const id of IDS_ARMES) for (const vue of [true, false]) {
      const L = [];
      for (let k = 0; k < 5; k++) { const t0 = performance.now(); const g = creerArme(id, { pourVue: vue }); L.push(performance.now() - t0); libererArme(g); }
      L.sort((a, b) => a - b); M[id + (vue ? ' vue' : ' 3e')] = Math.round(L[2] * 100) / 100;
      if (L[2] > pire) { pire = L[2]; quel = id + (vue ? ' vue' : ' 3e'); }
    }
    // (le repli fait main, à froid, comme le mesurait L-W)
    forcerFaitMain(true); viderCacheArmes(); const t1 = performance.now(); for (const id of IDS_ARMES) libererArme(creerArme(id, { pourVue: true })); const repli = performance.now() - t1; forcerFaitMain(false);
    t.note('création (ms, médiane de 5)', M); t.note('repli fait main à froid, les 8 en vue (ms)', Math.round(repli));
    const ok = t.temps('création, la pire (ms)', Math.round(pire * 100) / 100, 5);
    return { ok, attendu: '≤ 5 ms par exemplaire', obtenu: `pire ${quel} ${pire.toFixed(2)} ms · repli à froid ${Math.round(repli)} ms les 8 · ` + Object.entries(M).map(([k, v]) => `${k} ${v}`).join(' · ') };
  });

  // 7. LA PLANCHE PHOTO des vraies armes : 8 × 4 vues (flanc gauche, trois-quarts avant, vue du tireur — trois-quarts arrière
  // pour le couteau et les grenades —, la 3e personne des bots), par __jeu.photo, dans le studio
  T('7 · planche photo', async () => {
    await prechargerArmes();
    const vues = (id, j) => ['flanc gauche', 'trois-quarts avant', ARMES_FEU.includes(id) ? 'vue du tireur' : 'trois-quarts arrière', '3e personne (bots)'][j];
    const S = studio(jeu, game, 4, IDS_ARMES.length, 'IRIS · vraies armes 3D (lot L-X) · studio'), contenu = [];
    try {
      for (let i = 0; i < IDS_ARMES.length; i++) {
        const id = IDS_ARMES[i];
        let g = null;
        for (let j = 0; j < 4; j++) {
          if (j === 0 || j === 3) { if (g) { S.scene.remove(g); libererArme(g); } g = creerArme(id, { pourVue: j === 0 }); S.scene.add(g); }
          if (j === 2 && ARMES_FEU.includes(id)) S.tireur(); else S.cadrer(g, ...(j === 0 ? [-90, 8] : j === 1 ? [-35, 24] : j === 2 ? [-140, 30] : [-60, 14]));
          contenu.push(await S.photo(g, j, i, `${NOMS[id]} · ${vues(id, j)}`));
        }
        S.scene.remove(g); libererArme(g);
      }
    } finally { S.fermer(); }
    window.__plancheArmes = S.planche(); envoyer('planche_studio.jpg', window.__plancheArmes);
    const vides = contenu.filter((c) => c.part < 0.01).length;
    return { ok: vides === 0 && contenu.length === 32, attendu: '32 photos, l’arme visible sur chacune (≥ 1 % de l’image)',
      obtenu: `${contenu.length} photos · ${vides} vides · part de l’arme ${contenu.map((c) => Math.round(c.part * 100)).join('/')} % (window.__plancheArmes)` };
  });

  // 8. LA GÉOMÉTRIE SAINE : aucune valeur non finie, normales unitaires, aucun indice hors bornes, aucun triangle d'aire nulle
  T('8 · géométrie saine', async () => {
    await prechargerArmes();
    let nan = 0, nor = 0, deg = 0, hors = 0, n = 0;
    const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
    for (const id of IDS_ARMES) {
      const g = creerArme(id, { pourVue: false }), G = mailles(g)[0].geometry, P = G.attributes.position, N = G.attributes.normal, I = G.index;
      for (let i = 0; i < P.count; i++) {
        n++;
        if (!Number.isFinite(P.getX(i) + P.getY(i) + P.getZ(i) + N.getX(i) + N.getY(i) + N.getZ(i))) nan++;
        if (Math.abs(Math.hypot(N.getX(i), N.getY(i), N.getZ(i)) - 1) > 1e-3) nor++;
      }
      for (let t = 0; t < I.count; t += 3) {
        const i0 = I.getX(t), i1 = I.getX(t + 1), i2 = I.getX(t + 2);
        if (Math.max(i0, i1, i2) >= P.count) { hors++; continue; }
        a.fromBufferAttribute(P, i0); b.fromBufferAttribute(P, i1).sub(a); c.fromBufferAttribute(P, i2).sub(a);
        if (b.cross(c).length() < 1e-14) deg++;
      }
      if (!Number.isFinite(G.boundingSphere.radius)) nan++;
      libererArme(g);
    }
    return { ok: nan === 0 && nor === 0 && hors === 0, attendu: '0 non fini, 0 normale non unitaire, 0 indice hors bornes (triangles nuls notés)', obtenu: `${n} sommets · ${nan} non finis · ${nor} normales · ${hors} hors bornes · ${deg} triangles nuls` };
  });

  // 9. DANS L'ARME DE VUE (essai) : les 8 armes de vue sont les vraies (SkinnedMesh, glb), l'arme en main + les bras ≤ 8 appels,
  // aucun programme de plus pendant 3 s de tir et une recharge
  T('9 · dans l’arme de vue (essai)', async (t) => {
    await prechargerArmes();
    jeu.figerQualite(true);
    await jeu.lancer('essai', { graine: 42, mannequins: 3 });
    const p = game.partie, vm = p && p.aff && p.aff.viewmodel;
    if (!vm) { jeu.quitter('balade'); jeu.figerQualite(false); return { ok: false, attendu: 'un viewmodel', obtenu: 'aucun' }; }
    await t.images(6);
    const ids = Object.keys(vm.armes), vraies = ids.filter((id) => vm.armes[id].userData.modele === 'glb' && mailles(vm.armes[id]).every((m) => m.isSkinnedMesh)).length;
    const a = vm.courante, caches = [];
    let appels = 0, appelsTout = 0;
    if (a) {
      appelsTout = rendreCible(game, vm.scene).appels;
      vm.scene.traverse((o) => {
        if (!(o.isMesh || o.isLine || o.isPoints || o.isSprite) || !o.visible) return;
        let sous = false; o.traverseAncestors((x) => { if (x === a) sous = true; });
        if (!sous) { o.visible = false; caches.push(o); }
      });
      try { appels = rendreCible(game, vm.scene).appels; } finally { for (const o of caches) o.visible = true; }
    }
    const prog0 = game.renderer.info.programs.length, tir0 = jeu.compteurs().tirs;
    jeu.commande(0, { tir: true }, 3); await simuler(t, p, 3);
    jeu.commande(0, { tir: false, recharger: true }, 0.1); await simuler(t, p, 3);
    const prog1 = game.renderer.info.programs.length, tirs = jeu.compteurs().tirs - tir0;
    jeu.quitter('balade'); jeu.figerQualite(false);
    const ok = vraies === 8 && !!a && appels === 1 && appelsTout <= 8 && prog1 === prog0 && tirs > 5;
    return { ok, attendu: '8 vraies armes de vue (SkinnedMesh), l’arme 1 appel, avec les bras ≤ 8, programmes constants', obtenu: `${vraies}/8 vraies · ${a ? a.userData.arme : '—'} ${appels} appel(s), ${appelsTout} avec les bras · programmes ${prog0} → ${prog1} (${tirs} tirs)` };
  });

  // 10. LES PIÈCES MOBILES EN BOUT DE COURSE (planche à regarder : rien ne flotte, rien ne traverse) : chaque os au bout de son
  // geste (COURSES_OS : la culasse du TP-50 levée de 60° ET reculée ; les chargeurs à 40 %), vue du tireur et flanc gauche
  T('10 · pièces mobiles en bout de course', async () => {
    await prechargerArmes();
    const ids = ['fa24', 'pm9', 'fp12', 'tp50', 'p17', 'frag', 'flash'];
    const S = studio(jeu, game, 2, ids.length, 'IRIS · les vraies pièces mobiles en bout de course (lot L-X)'), contenu = [];
    try {
      for (let i = 0; i < ids.length; i++) {
        const id = ids[i], g = creerArme(id, { pourVue: true }), os = g.userData.os; S.scene.add(g);
        for (const [n, c] of Object.entries(COURSES_OS[id])) {
          const b = os[n], f = n === 'chargeur' ? 0.4 : 1;
          b.rotation.set(c.rx || 0, 0, c.rz || 0); b.position.x += f * (c.x || 0); b.position.y += f * (c.y || 0); b.position.z += f * (c.z || 0);
        }
        for (let j = 0; j < 2; j++) {
          if (j === 0 && ARMES_FEU.includes(id)) S.tireur(); else S.cadrer(g, j === 0 ? -140 : -90, j === 0 ? 30 : 8, 1.15);
          contenu.push(await S.photo(g, j, i, `${NOMS[id]} · ${Object.keys(COURSES_OS[id]).join(', ')} au bout · ${j === 0 ? (ARMES_FEU.includes(id) ? 'vue du tireur' : 'trois-quarts arrière') : 'flanc gauche'}`));
        }
        S.scene.remove(g); libererArme(g);
      }
    } finally { S.fermer(); }
    window.__plancheCourses = S.planche(); envoyer('planche_courses.jpg', window.__plancheCourses);
    const vides = contenu.filter((c) => c.part < 0.01).length;
    return { ok: vides === 0 && contenu.length === 2 * ids.length, attendu: `${2 * ids.length} photos, l’arme visible sur chacune`,
      obtenu: `${contenu.length} photos · ${vides} vides (window.__plancheCourses)` };
  });

  // 11. LE REPLI ET L'ÉCHANGE EN PLACE : le modèle fait main (recalé : sa bouche et sa main gauche à quelques cm de la table)
  // porte les repères de la table ; rempli par la vraie arme, c'est le MÊME groupe (champs des autres gardés, drapeaux recopiés)
  T('11 · repli fait main, puis rempli en place', async () => {
    await prechargerArmes();
    const fautes = [], L = [];
    for (const id of IDS_ARMES) for (const vue of [true, false]) {
      forcerFaitMain(true);
      const g = creerArme(id, { pourVue: vue }); forcerFaitMain(false);
      const avant = { modele: g.userData.modele, n: mailles(g).length, R: Object.keys(g.userData.reperes).length };
      g.userData.arme3e = id; g.userData.horsContact = true;                                       // (ce que posent la réserve des bots, l'arme de vue)
      for (const m of mailles(g)) { m.castShadow = false; m.frustumCulled = false; m.renderOrder = 3; }
      const sc = new THREE.Scene(); sc.add(g); g.position.set(1, 2, 3); g.updateMatrixWorld(true);
      const ok = remplacerRepli(g);
      const m = mailles(g), w = new THREE.Vector3();
      let ecart = 0;
      for (const [nom, p] of Object.entries(REPERES[id])) if (Array.isArray(p)) ecart = Math.max(ecart, g.userData.reperes[nom].position.distanceTo(w.set(...p)));
      // en vue : le squelette suit le groupe déplacé (un os bougé de 10 cm bouge ses sommets de 10 cm, en monde)
      let skin = true;
      if (vue && g.userData.os && Object.values(g.userData.os).some(Boolean)) {
        const n = Object.keys(OS_ARMES[id])[0], b = g.userData.os[n], mm = m[0], idx = [...mm.geometry.attributes.skinIndex.array].findIndex((k, i) => i % 4 === 0 && mm.skeleton.bones[k] === b) / 4;
        const p0 = new THREE.Vector3(); sc.updateMatrixWorld(true); mm.skeleton.update(); mm.getVertexPosition(idx, p0); p0.applyMatrix4(mm.matrixWorld);
        b.position.y += 0.1; sc.updateMatrixWorld(true); mm.skeleton.update(); const p1 = new THREE.Vector3(); mm.getVertexPosition(idx, p1); p1.applyMatrix4(mm.matrixWorld);
        skin = Math.abs(p1.y - p0.y - 0.1) < 1e-4 && Math.abs(p1.x - p0.x) < 1e-4;
      }
      const bon = avant.modele === 'main' && avant.n >= 1 && ok && g.userData.modele === 'glb' && m.length === 1 && ecart <= 0.001 && g.userData.arme3e === id
        && g.userData.horsContact && m[0].castShadow === false && m[0].frustumCulled === false && m[0].renderOrder === 3 && g.parent === sc && skin && (vue ? m[0].isSkinnedMesh : !m[0].isSkinnedMesh);
      if (!bon) fautes.push(`${id} ${vue ? 'vue' : '3e'} : ${avant.modele} ${avant.n} → ${g.userData.modele} ${m.length}, repères ${r3(ecart * 1000)} mm, peau ${skin}`);
      L.push(`${NOMS[id]}${vue ? '' : ' 3e'} ${avant.n}→${m.length}`);
      libererArme(g);
    }
    return { ok: fautes.length === 0, attendu: 'repli (main, repères de la table) → le même groupe garni de la vraie arme : 1 maillage, repères ± 1 mm, champs et drapeaux gardés, os qui suivent le groupe',
      obtenu: fautes.length ? fautes.slice(0, 8).join(' · ') : L.join(' · ') };
  });

  // 12. UN GLB QUI MANQUE : null, aucune exception, le repli reste (rien n'est retenu de l'essai)
  T('12 · GLB absent : le repli reste', async () => {
    const avant = etatArmes();
    const M = await chargerModele('fa24', 'assets/armes/absent_l_x.glb', { garder: false });
    const g = creerArme('fa24', { pourVue: true }), apres = etatArmes();
    const ok = M === null && g.userData.modele === (avant.prets.includes('fa24') ? 'glb' : 'main') && JSON.stringify(apres.echecs) === JSON.stringify(avant.echecs);
    libererArme(g);
    return { ok, attendu: 'chargement raté → null, sans exception ni échec retenu ; creerArme marche', obtenu: `modèle ${M} · arme ${g.userData.modele} · échecs ${JSON.stringify(apres.echecs)}` };
  });

  // 13. LA VUE FPS, JOUÉE : les 5 armes + couteau + frag + flash dans l'arme de vue de L-V avec les bras de Haythem — hanche,
  // visée, recharge (0,9 s), sprint ; couteau, grenade tenue, flash tenue — par __jeu.photo, chacune aussi SANS l'arme (bras
  // cachés) : la part de l'image qui est l'arme et sa LUMINANCE (ni noire, ni brûlée) ; erreur des mains ≤ 1 cm en hanche
  T('13 · vue FPS jouée (photos, éclairage, mains)', async (t) => {
    await prechargerArmes();
    jeu.figerQualite(true);
    const etats = [['hanche', null, 0.6], ['visée', { visee: true }, 0.8], ['recharge 0,9 s', 'recharge', 0.9], ['sprint', { sprint: true, ay: 1, amp: 1 }, 1.0]];
    const P = planche(4, 7, 'IRIS · vraies armes en vue FPS (lot L-X) · hanche, visée, recharge, sprint · couteau et grenades'), res = [], fautes = [];
    try {
      for (let i = 0; i < 5; i++) {
        const id = ARMES_FEU[i];
        await jeu.lancer('essai', { graine: 42, classe: CLASSE_DE[id], mannequins: 0 });
        const p = game.partie, vm = p.aff.viewmodel;
        if (id === 'p17') { jeu.commande(0, { armeN: 2 }, 1 / 60); await simuler(t, p, 0.8); }
        jeu.viser(0, { lacet: game.camYaw, tangage: 0.05 });
        await simuler(t, p, 0.6);
        for (let j = 0; j < etats.length; j++) {
          const [nom, cmd, s] = etats[j];
          if (cmd === 'recharge') { jeu.commande(0, { tir: true }, 0.4); await simuler(t, p, 0.45); jeu.commande(0, { tir: false, recharger: true }, 1 / 60); }
          else if (cmd) jeu.commande(0, cmd, s + 0.5);
          await simuler(t, p, s);
          if (j === 0) { const D = vm.diag; if (!(D.erreurD <= 0.01 && D.erreurG <= 0.01)) fautes.push(`${id} mains ${r3(D.erreurD * 100)} / ${r3(D.erreurG * 100)} cm`); res.push(`${NOMS[id]} mains ${r3(D.erreurD * 100)}/${r3(D.erreurG * 100)} cm`); }
          const url = jeu.photo(`${id} ${nom}`);
          // la même image sans l'arme ni les bras, puis l'arme seule (sans bras) : sa part et sa luminance
          const bv = vm.bras ? vm.bras.groupe.visible : false;
          if (vm.bras) vm.bras.groupe.visible = false;
          const seule = jeu.photo('seule'); vm.scene.visible = false; const vide = jeu.photo('vide'); vm.scene.visible = true;
          if (vm.bras) vm.bras.groupe.visible = bv;
          const c = await P.case(j, i, `${NOMS[id]} · ${nom}`, url);
          const mes = await planche(1, 1).case(0, 0, '', seule, vide);
          envoyer(`fps_${id}_${j}.jpg`, url);
          if (!(id === 'tp50' && j === 1)) {
            res.push(`${NOMS[id]} ${nom} ${Math.round(mes.part * 100)} % lum ${r3(mes.lum)}`);
            if (mes.part < 0.005 || mes.lum < 0.05 || mes.brule > 0.03) fautes.push(`${id} ${nom} : part ${r3(mes.part)}, lum ${r3(mes.lum)}, brûlé ${r3(mes.brule)}`);
          }
          jeu.commande(0, { visee: false, sprint: false, ay: 0, amp: 0, tir: false }, 0.2); await simuler(t, p, 0.5);
          void c;
        }
        // couteau, grenade, flash tenues (avec l'arme de l'essai assaut)
        if (id === 'fa24') {
          const gestes = [['couteau', { couteau: true }, 0.16], ['frag tenue', { letale: true }, 0.7], ['flash tenue', { tactique: true }, 0.35]];
          for (let j = 0; j < gestes.length; j++) {
            const [nom, cmd, s] = gestes[j];
            jeu.commande(0, cmd, nom === 'couteau' ? 1 / 60 : s + 0.3); await simuler(t, p, s);
            const url = jeu.photo(nom); envoyer(`fps_geste_${j}.jpg`, url);
            await P.case(j, 5, nom, url);
            jeu.commande(0, { letale: false, tactique: false }, 0.1); await simuler(t, p, 2.5);
          }
        }
        jeu.quitter('balade');
      }
    } finally { jeu.figerQualite(false); }
    window.__plancheVueFPS = P.fin(); envoyer('planche_vue_fps.jpg', window.__plancheVueFPS);
    return { ok: fautes.length === 0, attendu: 'mains ≤ 1 cm en hanche ; l’arme visible (≥ 0,5 % de l’image), luminance moyenne ≥ 0,05, brûlé ≤ 3 % (photos : window.__plancheVueFPS)',
      obtenu: (fautes.length ? 'FAUTES ' + fautes.join(' · ') + ' — ' : '') + res.join(' · ') };
  }, { delai: 300 });

  // 14. DANS LES MAINS DES BOTS : un bot allié de chaque classe posé à 2,2 m devant Haythem, de trois quarts, qui ne bouge
  // plus — son arme est la vraie (glb, 1 appel), sa main gauche sur le VRAI garde-main (≤ 3 cm) ; photos
  T('14 · dans les mains des bots (photos)', async (t) => {
    await prechargerArmes();
    const { priseMain } = await import('../pose_arme.js');
    const { Arsenal, CLASSES } = await import('../armes.js');
    jeu.figerQualite(true);
    const P = planche(5, 1, 'IRIS · vraies armes dans les mains des bots (lot L-X)'), res = [], fautes = [];
    try {
      await jeu.lancer('essai', { graine: 7, mannequins: 0, bots: 1 });
      const p = game.partie, a = p.acteurs.find((x) => !x.local), h = p.local;
      for (let i = 0; i < 5; i++) {
        const id = ARMES_FEU[i];
        a.arsenal = new Arsenal(a, CLASSES[CLASSE_DE[id]]);
        if (id === 'p17') jeu.commande(a.id, { armeN: 2 }, 1 / 60);
        const l = game.camYaw, x = h.pos.x - Math.sin(l) * 2.2, z = h.pos.z - Math.cos(l) * 2.2;
        jeu.teleporter(a.id, x, h.pos.y, z, l + Math.PI * 0.62);
        jeu.commande(a.id, { ax: 0, ay: 0, amp: 0, tir: false, sprint: false }, 30);
        jeu.viser(a.id, { lacet: l + Math.PI * 0.62, tangage: 0 });
        jeu.viser(0, { lacet: l, tangage: 0.12 });
        await simuler(t, p, 1.0);
        const g = a.aff && a.aff.arme3e, A = a.joueur.avatar;
        let dg = 99;
        if (g && A) { const e = a.h / 1.73, w = new THREE.Vector3(...REPERES[id].mainG).applyMatrix4(g.matrixWorld); dg = priseMain(A, id === 'p17' ? 'Left' : 'Left', e, new THREE.Vector3()).distanceTo(w); }
        const url = jeu.photo(`bot ${id}`); envoyer(`bot_${id}.jpg`, url);
        await P.case(i, 0, `${NOMS[id]} · bot`, url);
        const ok = !!g && g.userData.arme3e === id && g.userData.modele === 'glb' && mailles(g).length === 1 && dg <= 0.03;
        res.push(`${NOMS[id]} ${g ? g.userData.modele : '—'} main G ${r3(dg * 100)} cm`);
        if (!ok) fautes.push(res[res.length - 1]);
      }
      jeu.quitter('balade');
    } finally { jeu.figerQualite(false); }
    window.__plancheBots = P.fin(); envoyer('planche_bots.jpg', window.__plancheBots);
    return { ok: fautes.length === 0, attendu: 'chaque arme d’un bot = la vraie (glb, 1 maillage), sa main gauche ≤ 3 cm du vrai garde-main', obtenu: res.join(' · ') };
  }, { delai: 200 });

  // 15. LA CADENCE : une partie de 4 c. 4 en qualité moyenne figée, 7 bots — appels ajoutés par les armes (vue : 1 au lieu de
  // 3 à 5 ; 3e personne : 1 par bot au lieu de 3) et image médiane notées ; la comparaison au repli fait main se fait dans une
  // 2e page sous `&armes=main` (rapport L-X)
  T('15 · cadence (4 c. 4, moyenne)', async (t) => {
    await prechargerArmes();
    jeu.figerQualite(true); const q0 = game.fx.quality; await jeu.qualite('moyenne');
    try {
      await jeu.lancer('equipes', { graine: 42, allies: 3, ennemis: 4 });
      const p = game.partie;
      await simuler(t, p, 8);
      const I = await jeu.images(120);
      const armes3e = p.acteurs.filter((a) => !a.local && a.aff && a.aff.arme3e && a.aff.arme3e.parent);
      const glb = armes3e.filter((a) => a.aff.arme3e.userData.modele === 'glb').length;
      jeu.quitter('balade');
      t.note('image médiane, 4 c. 4 moyenne (ms)', I.medMs); t.note('appels', I.appels);
      const ok = glb === armes3e.length && armes3e.length > 0 && t.temps('image médiane 4 c. 4 (ms)', I.medMs, 33, I.valable);
      return { ok, attendu: 'armes des bots = vraies (glb) ; image médiane ≤ 33 ms (relatif : machine partagée)', obtenu: `${glb}/${armes3e.length} vraies · médiane ${r3(I.medMs)} ms, p95 ${r3(I.p95Ms)} · ${I.appels} appels · ${I.triangles} triangles · valable ${I.valable} · qualité ${game.fx.quality}` };
    } finally { await jeu.qualite(typeof q0 === 'string' ? q0 : 'auto'); jeu.figerQualite(false); }
  }, { delai: 200 });

  // 16. POUR L-H (demande 4) : la vraie géométrie des grenades en vol, un InstancedMesh par type
  T('16 · grenades en vol (modeleArme)', async () => {
    await prechargerArmes();
    const f = modeleArme('frag'), l = modeleArme('flash'), x = modeleArme('inconnue');
    const ok = !!f && !!l && x === null && f.geometrie.index && f.materiau.isMeshStandardMaterial && !f.geometrie.attributes.skinIndex;
    return { ok, attendu: '{ geometrie, materiau } pour frag et flash (sans os), null sinon', obtenu: `frag ${f ? f.geometrie.index.count / 3 : '—'} tri. · flash ${l ? l.geometrie.index.count / 3 : '—'} tri. · inconnue ${x}` };
  });
}
