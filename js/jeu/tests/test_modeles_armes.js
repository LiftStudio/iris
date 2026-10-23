// =====================================================================
//  LES TESTS DES MODÈLES D'ARMES (lot L-W, 23/10/2026 ; spec § 5.5.3, acceptation, points 1 à 7, et deux pour F2)
// =====================================================================
// Lancés par le harnais sous `?test=1&rapport=1&lot=L-W` (window.__rapport), PC puis `?tel=1`. Les tests ne cliquent jamais
// à l'écran : tout passe par window.__jeu et par creerArme. Les rendus de contrôle se font dans une petite cible à part
// (jamais à l'écran) ; la planche photo (point 7) passe par __jeu.photo, l'arme dessinée en superposition dans un studio
// (fond dégradé, carte d'environnement de RoomEnvironment — aucune lumière ajoutée), et reste dans window.__plancheArmes.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { creerArme, libererArme, viderCacheArmes, REPERES, OS_ARMES, COURSES_OS, ENCOMBREMENTS, IDS_ARMES, MATERIAUX_ARMES } from '../modeles_armes.js';

const ARMES_FEU = ['fa24', 'pm9', 'fp12', 'tp50', 'p17'];
const NOMS = { fa24: 'FA-24', pm9: 'PM-9', fp12: 'FP-12', tp50: 'TP-50', p17: 'P-17', couteau: 'COUTEAU', frag: 'FRAG', flash: 'FLASH' };
const NOMS_OS = ['chargeur', 'culasse', 'glissiere', 'pompe', 'detente', 'goupille'];
const r3 = (v) => Math.round(v * 1000) / 1000;
const mailles = (g) => { const L = []; g.traverse((o) => { if (o.isMesh) L.push(o); }); return L; };
const triangles = (g) => mailles(g).reduce((s, m) => s + (m.geometry.index ? m.geometry.index.count : m.geometry.attributes.position.count) / 3, 0);

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

export default function (jeu) {
  const game = window.__game;

  // 1. LES HUIT ARMES : appels (maillages × matériaux) et triangles, comptés ET rendus
  jeu.ajouterTest('L-W', '1 · huit armes, appels et triangles', async () => {
    const L = [], fautes = [];
    for (const id of IDS_ARMES) for (const vue of [true, false]) {
      const g = creerArme(id, { pourVue: vue }), sc = new THREE.Scene(); sc.add(g);
      const n = mailles(g).length, t = triangles(g), R = rendreCible(game, sc);
      const ok = n === g.userData.appels && R.appels === n && n <= (vue ? 6 : 3) && t <= (vue ? 8000 : 1500) && !!g.userData.arme;
      if (!ok) fautes.push(`${id} ${vue ? 'vue' : '3e'} : ${n} maillages, ${R.appels} appels rendus, ${t} triangles`);
      L.push(`${NOMS[id]} ${vue ? 'vue' : '3e'} ${R.appels}/${t}`);
      libererArme(g);
    }
    return { ok: fautes.length === 0, attendu: 'vue ≤ 6 appels et ≤ 8 000 triangles ; 3e personne ≤ 3 et ≤ 1 500', obtenu: fautes.length ? fautes.join(' · ') : L.join(' · ') };
  });

  // 2. LES REPÈRES au mm près, et les os selon l'arme (en vue, les repères portés suivent leur os)
  jeu.ajouterTest('L-W', '2 · repères et os', async () => {
    const fautes = []; let ecart = 0, suivis = 0;
    const w = new THREE.Vector3(), w0 = new THREE.Vector3();
    for (const id of IDS_ARMES) for (const vue of [true, false]) {
      const g = creerArme(id, { pourVue: vue }); g.updateMatrixWorld(true);
      for (const [nom, p] of Object.entries(REPERES[id])) {
        if (!Array.isArray(p)) continue;
        const R = g.userData.reperes[nom];
        if (!R) { fautes.push(`${id} : repère ${nom} absent`); continue; }
        const d = R.getWorldPosition(w).distanceTo(w0.set(p[0], p[1], p[2])); ecart = Math.max(ecart, d);
        if (d > 0.001) fautes.push(`${id} ${vue ? 'vue' : '3e'} ${nom} à ${r3(d * 1000)} mm`);
      }
      const os = g.userData.os;
      if (!vue) { if (os !== null) fautes.push(`${id} 3e : des os`); libererArme(g); continue; }
      for (const n of NOMS_OS) {
        const b = os ? os[n] : undefined, voulu = !!OS_ARMES[id][n];
        if (voulu && !(b && b.isBone && b.name === n)) fautes.push(`${id} : os ${n} absent`);
        if (!voulu && b !== null) fautes.push(`${id} : os ${n} en trop`);
      }
      // chaque os bougé de sa course : ses repères le suivent d'autant, les autres ne bougent pas
      for (const [n, c] of Object.entries(COURSES_OS[id])) {
        const b = os[n], av = {};
        for (const [nom, R] of Object.entries(g.userData.reperes)) av[nom] = R.getWorldPosition(new THREE.Vector3());
        b.position.x += c.x || 0; b.position.y += c.y || 0; b.position.z += c.z || 0; g.updateMatrixWorld(true);
        for (const [nom, R] of Object.entries(g.userData.reperes)) {
          let porte = false; R.traverseAncestors((a) => { if (a === b) porte = true; });
          const d = R.getWorldPosition(w).sub(av[nom]);
          if (porte) { suivis++; if (Math.abs(d.x - (c.x || 0)) + Math.abs(d.y - (c.y || 0)) + Math.abs(d.z - (c.z || 0)) > 1e-6) fautes.push(`${id} : ${nom} ne suit pas ${n}`); }
          else if (d.length() > 1e-9) fautes.push(`${id} : ${nom} bouge avec ${n}`);
        }
        b.position.fromArray(OS_ARMES[id][n]); g.updateMatrixWorld(true);
      }
      libererArme(g);
    }
    // la main gauche du FP-12 sur la pompe : courseMainG = la course de l'os
    if (Math.abs(REPERES.fp12.courseMainG - COURSES_OS.fp12.pompe.z) > 1e-9) fautes.push('FP-12 : courseMainG ≠ la course de la pompe');
    return { ok: fautes.length === 0, attendu: 'repères = REPERES ± 1 mm ; os de OS_ARMES (Bone), aucun en 3e ; repères portés qui suivent leur os',
      obtenu: fautes.length ? fautes.slice(0, 12).join(' · ') : `écart max ${r3(ecart * 1000)} mm · ${suivis} repères portés suivis` };
  });

  // 3. L'ENCOMBREMENT (longueur selon −Z) à ± 3 %, dans les deux versions
  jeu.ajouterTest('L-W', '3 · encombrement', async () => {
    const fautes = [], L = [];
    for (const id of ARMES_FEU) for (const vue of [true, false]) {
      const g = creerArme(id, { pourVue: vue }), b = new THREE.Box3();
      for (const m of mailles(g)) { m.geometry.computeBoundingBox(); b.union(m.geometry.boundingBox); }
      const long = b.max.z - b.min.z, e = long / ENCOMBREMENTS[id] - 1;
      if (Math.abs(e) > 0.03) fautes.push(`${id} ${vue ? 'vue' : '3e'} ${r3(long)} m`);
      if (vue) L.push(`${NOMS[id]} ${r3(long)} m (${e >= 0 ? '+' : ''}${(e * 100).toFixed(1)} %, z ${r3(b.min.z)} → ${r3(b.max.z)})`);
      libererArme(g);
    }
    return { ok: fautes.length === 0, attendu: '0,84 · 0,62 · 0,95 · 1,10 · 0,19 m ± 3 %', obtenu: fautes.length ? fautes.join(' · ') : L.join(' · ') };
  });

  // 4. LES OS RIGIDES : poids 1 sur un seul os ; bouger un os de 10 cm ne bouge que SES sommets, tous de 10 cm, compte exact
  jeu.ajouterTest('L-W', '4 · os rigides', async () => {
    const fautes = [], L = [];
    const v = new THREE.Vector3();
    for (const id of IDS_ARMES) {
      const g = creerArme(id, { pourVue: true }), os = g.userData.os, M = mailles(g); g.updateMatrixWorld(true);
      // les poids : (1, 0, 0, 0) partout, et le compte de chaque os
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
            if (d > 1e-7) { bouges++; if (Math.abs(A[3 * i + 1] - v.y - 0.10) < 1e-6 && Math.abs(v.x - A[3 * i]) < 1e-6 && Math.abs(v.z - A[3 * i + 2]) < 1e-6) exacts++; }
          }
        });
        b.position.fromArray(OS_ARMES[id][n]); g.updateMatrixWorld(true);
        if (bouges !== k || exacts !== k) fautes.push(`${id} ${n} : ${bouges} sommets bougés (${exacts} de 10 cm) pour ${k} portés`);
        L.push(`${NOMS[id]}.${n} ${bouges}/${k}`);
      }
      libererArme(g);
    }
    return { ok: fautes.length === 0, attendu: 'chaque os bougé de 10 cm : exactement ses sommets, tous de 10 cm, poids 1', obtenu: fautes.length ? fautes.slice(0, 10).join(' · ') : L.join(' · ') };
  });

  // 5. AUCUNE REQUÊTE, AUCUNE TEXTURE ; 20 exemplaires de plus = 0 matériau et 0 programme de plus (textures : celle des os de
  // chaque squelette de vue rendu, et rien d'autre ; rendues par libererArme)
  jeu.ajouterTest('L-W', '5 · réseau, textures, partage', async () => {
    const res0 = performance.getEntriesByType('resource').length;
    viderCacheArmes();
    const sc = new THREE.Scene(), tous = new Set(MATERIAUX_ARMES.tous), mats = new Set(), cartes = [];
    const premiers = [];
    for (const id of IDS_ARMES) for (const vue of [true, false]) { const g = creerArme(id, { pourVue: vue }); g.position.set(0, 0, 0); sc.add(g); premiers.push(g); }
    const res1 = performance.getEntriesByType('resource').length;
    for (const g of premiers) for (const m of mailles(g)) {
      mats.add(m.material);
      for (const [k, x] of Object.entries(m.material)) if (x && x.isTexture) cartes.push(`${m.material.name}.${k}`);
    }
    const etrangers = [...mats].filter((m) => !tous.has(m)).length;
    const A = rendreCible(game, sc);
    const plus = [];
    for (let i = 0; i < 20; i++) for (const id of IDS_ARMES) for (const vue of [true, false]) { const g = creerArme(id, { pourVue: vue }); sc.add(g); plus.push(g); }
    const mats2 = new Set(); for (const g of [...premiers, ...plus]) for (const m of mailles(g)) mats2.add(m.material);
    const B = rendreCible(game, sc);
    const sq = plus.filter((g) => g.userData.squelette).length, sq0 = premiers.filter((g) => g.userData.squelette).length;
    for (const g of plus) libererArme(g);
    const C = rendreCible(game, sc);
    for (const g of premiers) libererArme(g);
    const D = rendreCible(game, sc);
    const ok = res1 === res0 && cartes.length === 0 && etrangers === 0 && mats2.size === mats.size && B.programmes === A.programmes
      && B.textures - A.textures === sq && C.textures === A.textures && D.textures === A.textures - sq0;
    return { ok, attendu: '0 requête, 0 carte, matériaux de MATERIAUX_ARMES ; +20 × 16 : 0 matériau, 0 programme, textures = 1 par squelette de vue (rendues)',
      obtenu: `requêtes +${res1 - res0} · cartes ${cartes.length} · ${mats.size} matériaux (${etrangers} hors table) → ${mats2.size} · programmes ${A.programmes} → ${B.programmes} · `
        + `textures ${A.textures} → ${B.textures} (+${B.textures - A.textures} pour ${sq} squelettes) → ${C.textures} → ${D.textures} · appels ${A.appels} → ${B.appels}` };
  });

  // 6. LA CRÉATION : ≤ 5 ms par arme, à froid (le cache de géométries vidé ; le code déjà compilé par une première passe)
  jeu.ajouterTest('L-W', '6 · création ≤ 5 ms', async (t) => {
    viderCacheArmes();
    for (const id of IDS_ARMES) { libererArme(creerArme(id, { pourVue: true })); libererArme(creerArme(id, { pourVue: false })); }
    const M = {}; let pire = 0, quel = '';
    for (const id of IDS_ARMES) for (const vue of [true, false]) {
      const L = [];
      for (let k = 0; k < 3; k++) { viderCacheArmes(); const t0 = performance.now(); const g = creerArme(id, { pourVue: vue }); L.push(performance.now() - t0); libererArme(g); }
      L.sort((a, b) => a - b); M[id + (vue ? ' vue' : ' 3e')] = Math.round(L[1] * 100) / 100;
      if (L[1] > pire) { pire = L[1]; quel = id + (vue ? ' vue' : ' 3e'); }
    }
    const t0 = performance.now(); for (let i = 0; i < 20; i++) libererArme(creerArme('fa24', { pourVue: true })); const cache = (performance.now() - t0) / 20;
    t.note('création à froid (ms, médiane de 3)', M); t.note('création en cache, FA-24 vue (ms)', Math.round(cache * 1000) / 1000);
    const ok = t.temps('création à froid, la pire (ms)', Math.round(pire * 100) / 100, 5);
    return { ok, attendu: '≤ 5 ms par arme (à froid)', obtenu: `pire ${quel} ${pire.toFixed(2)} ms · en cache ${cache.toFixed(3)} ms · ` + Object.entries(M).map(([k, v]) => `${k} ${v}`).join(' · ') };
  });

  // 7. LA PLANCHE PHOTO : 8 armes × 3 vues (flanc gauche — celui que voit le joueur —, trois-quarts avant, la vue du tireur),
  // chacune par __jeu.photo (le rendu du jeu : bloom, sortie, étalonnage), l'arme en superposition dans un studio
  jeu.ajouterTest('L-W', '7 · planche photo', async () => {
    const r = game.renderer, fx = game.fx;
    const pm = new THREE.PMREMGenerator(r), env = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose();
    const sc = new THREE.Scene(); sc.environment = env; sc.environmentIntensity = 0.85;
    const cam = new THREE.PerspectiveCamera(22, game.camera.aspect, 0.01, 50); sc.add(cam);
    // le fond : un grand carré dégradé collé à la caméra (couleurs aux sommets ; aucune texture)
    const fg = new THREE.PlaneGeometry(2, 2), haut = new THREE.Color(0x8d939b), bas = new THREE.Color(0x3c4046), col = [];
    for (let i = 0; i < 4; i++) { const c = i < 2 ? haut : bas; col.push(c.r, c.g, c.b); }
    fg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    const fm = new THREE.MeshBasicMaterial({ vertexColors: true, depthWrite: false, toneMapped: false });
    const fond = new THREE.Mesh(fg, fm); fond.position.z = -40; fond.scale.set(60, 60, 1); fond.renderOrder = -1; cam.add(fond);   // (60 m de côté à 40 m : tout le cadre, même à 52°)
    const sup = { scene: sc, camera: cam };
    fx.superpositions.push(sup);
    const W = 400, H = Math.round(400 / cam.aspect), cv = document.createElement('canvas'); cv.width = 3 * W; cv.height = 8 * H;
    const cx = cv.getContext('2d'); cx.font = '600 15px system-ui, sans-serif'; cx.textBaseline = 'top';
    const vues = ['flanc gauche', 'trois-quarts avant', 'vue du tireur'], contenu = [];
    const charger = (src) => new Promise((ok, ko) => { const im = new Image(); im.onload = () => ok(im); im.onerror = ko; im.src = src; });
    const b = new THREE.Box3(), s = new THREE.Sphere();
    try {
      for (let i = 0; i < IDS_ARMES.length; i++) {
        const id = IDS_ARMES[i], g = creerArme(id, { pourVue: true }); sc.add(g); g.updateMatrixWorld(true);
        b.makeEmpty(); for (const m of mailles(g)) { m.geometry.computeBoundingBox(); b.union(m.geometry.boundingBox); }
        b.getBoundingSphere(s);
        for (let j = 0; j < 3; j++) {
          if (j === 2 && ARMES_FEU.includes(id)) {
            // la vue du tireur : la caméra là où la met la pose de hanche (repère caméra 0,135 ; −0,125 ; −0,32 ; lacet 0,035), 52°
            cam.fov = 52; cam.position.set(-0.135, 0.125, 0.32).applyAxisAngle(new THREE.Vector3(0, 1, 0), -0.035); cam.rotation.set(0, -0.035, 0);
          } else {
            const [az, el] = j === 0 ? [-90, 8] : j === 1 ? [-35, 24] : [-140, 30];
            // (la distance qui fait tenir l'arme dans le cadre : sa sphère dans la largeur, sa hauteur dans la hauteur)
            cam.fov = 22;
            const tv = Math.tan(cam.fov * Math.PI / 360), th = tv * game.camera.aspect;
            const d = Math.max(s.radius / Math.sin(Math.atan(th)), (b.max.y - b.min.y) * 0.62 / tv) * 1.06;
            const a = az * Math.PI / 180, e = el * Math.PI / 180;
            // (az −90 : la caméra à −X, le flanc gauche ; −35 : devant, à gauche ; −140 : derrière, à gauche)
            cam.position.set(s.center.x + d * Math.cos(e) * Math.sin(a), s.center.y + d * Math.sin(e), s.center.z - d * Math.cos(e) * Math.cos(a));
            cam.lookAt(s.center);
          }
          cam.aspect = game.camera.aspect; cam.updateProjectionMatrix(); cam.updateMatrixWorld(true);
          // (la part de l'image qui est l'arme : la même photo sans elle, comparée pixel à pixel — vignette et grain compris)
          g.visible = false; const vide = await charger(jeu.photo('fond')); g.visible = true;
          cx.drawImage(vide, j * W, i * H, W, H);
          const ref = cx.getImageData(j * W, i * H, W, H).data;
          const im = await charger(jeu.photo(`${id} ${vues[j]}`));
          cx.drawImage(im, j * W, i * H, W, H);
          const px = cx.getImageData(j * W, i * H, W, H).data;
          let n = 0; for (let k = 0; k < px.length; k += 16) if (Math.abs(px[k] - ref[k]) + Math.abs(px[k + 1] - ref[k + 1]) + Math.abs(px[k + 2] - ref[k + 2]) > 48) n++;
          contenu.push(n / (px.length / 16));
          cx.fillStyle = 'rgba(0,0,0,0.55)'; cx.fillRect(j * W, i * H, W, 22); cx.fillStyle = '#fff'; cx.fillText(`${NOMS[id]} · ${vues[j]}`, j * W + 6, i * H + 4);
        }
        sc.remove(g); libererArme(g);
      }
    } finally {
      const k = fx.superpositions.indexOf(sup); if (k >= 0) fx.superpositions.splice(k, 1);
      env.dispose(); fg.dispose(); fm.dispose();
    }
    window.__plancheArmes = cv.toDataURL('image/jpeg', 0.9);
    const vides = contenu.filter((c) => c < 0.01).length;
    return { ok: vides === 0 && window.__plancheArmes.length > 20000, attendu: '24 photos, l’arme visible sur chacune (≥ 1 % de l’image)',
      obtenu: `${contenu.length} photos · ${vides} vides · part de l’arme ${contenu.map((c) => Math.round(c * 100)).join('/')} % · planche ${Math.round(window.__plancheArmes.length / 1024)} Ko (window.__plancheArmes)` };
  });

  // 8. LA GÉOMÉTRIE SAINE : aucune valeur non finie, normales unitaires, aucun triangle d'aire nulle
  jeu.ajouterTest('L-W', '8 · géométrie saine', async () => {
    let nan = 0, nor = 0, deg = 0, n = 0;
    for (const id of IDS_ARMES) for (const vue of [true, false]) {
      const g = creerArme(id, { pourVue: vue });
      for (const m of mailles(g)) {
        const P = m.geometry.attributes.position.array, N = m.geometry.attributes.normal.array;
        for (let i = 0; i < P.length; i += 3) {
          n++;
          if (!Number.isFinite(P[i] + P[i + 1] + P[i + 2] + N[i] + N[i + 1] + N[i + 2])) nan++;
          if (Math.abs(Math.hypot(N[i], N[i + 1], N[i + 2]) - 1) > 1e-3) nor++;
        }
        for (let t = 0; t < P.length; t += 9) {
          const ux = P[t + 3] - P[t], uy = P[t + 4] - P[t + 1], uz = P[t + 5] - P[t + 2], vx = P[t + 6] - P[t], vy = P[t + 7] - P[t + 1], vz = P[t + 8] - P[t + 2];
          if (Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx) < 1e-12) deg++;
        }
        if (!Number.isFinite(m.geometry.boundingSphere.radius)) nan++;
      }
      libererArme(g);
    }
    return { ok: nan === 0 && nor === 0 && deg === 0, attendu: '0 non fini, 0 normale non unitaire, 0 triangle nul', obtenu: `${n} sommets · ${nan} non finis · ${nor} normales · ${deg} triangles nuls` };
  });

  // 9. L'ARME DE VUE DU SOCLE avec les vrais modèles (avant F2) : essai, l'arme en hanche, ≤ 6 appels pour l'arme seule, aucun
  // programme de plus pendant 3 s de tir et une recharge
  jeu.ajouterTest('L-W', '9 · dans l’arme de vue (essai)', async (t) => {
    jeu.figerQualite(true);                                        // (la qualité automatique recompile en changeant de préréglage)
    await jeu.lancer('essai', { graine: 42, mannequins: 3 });
    const p = game.partie, vm = p && p.aff && p.aff.viewmodel;
    if (!vm) { jeu.quitter('balade'); jeu.figerQualite(false); return { ok: false, attendu: 'un viewmodel', obtenu: 'aucun' }; }
    await t.images(6);
    const ids = Object.keys(vm.armes), modeles = ids.filter((id) => vm.armes[id].userData.arme === id && vm.armes[id].userData.reperes && mailles(vm.armes[id]).every((m) => m.isSkinnedMesh)).length;
    const a = vm.courante, appels = rendreCible(game, vm.scene).appels;
    const prog0 = game.renderer.info.programs.length, tir0 = jeu.compteurs().tirs;
    jeu.commande(0, { tir: true }, 3); let t0 = performance.now(); while (performance.now() - t0 < 3000) await t.images(10);
    jeu.commande(0, { tir: false, recharger: true }, 0.1); t0 = performance.now(); while (performance.now() - t0 < 3000) await t.images(10);
    const prog1 = game.renderer.info.programs.length, tirs = jeu.compteurs().tirs - tir0;
    jeu.quitter('balade'); jeu.figerQualite(false);
    const ok = modeles === 8 && !!a && appels === a.userData.appels && appels <= 6 && prog1 === prog0 && tirs > 5;
    return { ok, attendu: '8 armes de creerArme (SkinnedMesh), l’arme en main ≤ 6 appels, programmes constants', obtenu: `${modeles}/8 modèles · ${a ? a.userData.arme : '—'} ${appels} appels · programmes ${prog0} → ${prog1} (${tirs} tirs)` };
  });

  // ---- À F2 (apresFusion : le VRAI module de l'autre lot) ----
  // L-V : la main droite sur `mainD`, la gauche sur `mainG` (ou la prise de l'animation) à ≤ 1 cm — L-V expose les poignets de
  // ses bras (`vm.mains() → { D, G }`, positions monde), sinon F2 branche le test sur ce qu'il expose
  jeu.ajouterTest('L-W', 'F2 · mains de L-V sur les repères', async (t) => {
    await jeu.lancer('essai', { graine: 42 });
    const vm = game.partie && game.partie.aff.viewmodel; await t.images(6);
    const fautes = [], L = [];
    for (const id of ARMES_FEU) {
      vm.montrer(id); vm.maj(0, { arme: id, etatArme: 'pret', tEtat: 1, visee: 0 }); vm.scene.updateMatrixWorld(true);
      const M = typeof vm.mains === 'function' ? vm.mains() : null, R = vm.armes[id].userData.reperes;
      if (!M) { fautes.push('vm.mains() absent'); break; }
      const dD = M.D.distanceTo(R.mainD.getWorldPosition(new THREE.Vector3())), dG = M.G.distanceTo(R.mainG.getWorldPosition(new THREE.Vector3()));
      L.push(`${NOMS[id]} ${r3(dD * 100)}/${r3(dG * 100)} cm`); if (dD > 0.01 || dG > 0.01) fautes.push(`${id} ${r3(dD * 100)}/${r3(dG * 100)} cm`);
    }
    jeu.quitter('balade');
    return { ok: fautes.length === 0, attendu: 'mains à ≤ 1 cm de mainD / mainG en hanche', obtenu: fautes.length ? fautes.join(' · ') : L.join(' · ') };
  }, { apresFusion: true });
  // L-C : les armes des bots sont les modèles 3e personne (racines de scène, `dynamique`, ≤ 3 appels, la bouche suivie)
  jeu.ajouterTest('L-W', 'F2 · armes des bots (L-C)', async (t) => {
    const { armeTroisieme } = await import('../pose_arme.js');
    await jeu.lancer('equipes', { graine: 42, allies: 1, ennemis: 2 });
    await t.images(10);
    const fautes = [], L = [];
    for (const a of game.partie.acteurs.filter((x) => !x.local)) {
      const g = armeTroisieme(a);
      if (!g) { fautes.push(`${a.nom} : pas d’arme`); continue; }
      const ok = !!g.userData.arme && g.userData.os === null && mailles(g).length <= 3 && g.parent === game.scene && g.userData.dynamique === true && !!g.userData.reperes.bouche;
      L.push(`${a.nom} ${g.userData.arme}`); if (!ok) fautes.push(`${a.nom} : ${g.userData.arme} mal posée`);
    }
    jeu.quitter('balade');
    return { ok: fautes.length === 0 && L.length > 0, attendu: 'chaque bot tient un modèle 3e personne de creerArme', obtenu: fautes.length ? fautes.join(' · ') : L.join(' · ') };
  }, { apresFusion: true });
}
