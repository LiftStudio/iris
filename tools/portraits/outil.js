// =====================================================================
//  L'OUTIL DES PORTRAITS (lot L-U, 23/10 ; spec § 4.5.16, arbitrage 40)
// =====================================================================
// Le moteur de portraits de LA CAGE (js/portraits.js l. 35-106 : rendu 192 × 192 hors écran, fond transparent, clé chaude
// devant à droite, remplissage froid derrière à gauche, contre-jour, cadrage buste sur l'os de la tête) recopié et taillé
// pour un usage UNIQUE : il rend les sept avatars (assets/haythem.glb et les six assets/tel/<ami>.glb), pose
// `window.__portraits = { id: dataURL WebP }` (qualité 0,85, baissée seulement si une image dépassait 30 Ko) et
// `window.__planche` (les sept côte à côte, pour le rapport), et, avec ?envoyer=<port>, poste le tout à
// `python -I tools/portraits/ecrire.py --ecouter <port> assets/portraits/`, qui écrit les fichiers.
// Hors du jeu : ce contexte WebGL et ses quatre lumières n'existent que dans cette page d'outil (jamais dans js/jeu/).
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const TAILLE = 192, QUALITE = 0.85, MAX_OCTETS = 30 * 1024;
export const AVATARS = [
  { id: 'haythem', nom: 'Haythem', model: '../../assets/haythem.glb' },
  { id: 'gabriel', nom: 'Gabriel', model: '../../assets/tel/gabriel.glb' },
  { id: 'imad', nom: 'Imad', model: '../../assets/tel/imad.glb' },
  { id: 'marcantoine', nom: 'Marc-Antoine', model: '../../assets/tel/marcantoine.glb' },
  { id: 'koji', nom: 'Koji', model: '../../assets/tel/koji.glb' },
  { id: 'djafar', nom: 'Djafar', model: '../../assets/tel/djafar.glb' },
  { id: 'ethan', nom: 'Ethan', model: '../../assets/tel/ethan.glb' },
];
// le cadrage (LA CAGE : caméra à 0,30 à droite, 0,05 au-dessus et 1,28 devant la tête, qui vise 6 cm sous elle ; champ 26°)
export const CADRAGE = { dx: 0.30, dy: 0.05, dz: 1.28, sous: 0.06, champ: 26 };

const etat = document.getElementById('etat'), planche = document.getElementById('planche');
const dire = (t) => { if (etat) etat.textContent = t; };
const octets = (url) => Math.floor((url.length - url.indexOf(',') - 1) * 3 / 4);

// L'ATELIER : un rendu hors écran à fond transparent, la lumière de studio de LA CAGE
function atelier() {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setSize(TAILLE, TAILLE);
  renderer.setPixelRatio(1);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xdfe9f5, 0x40464f, 1.35));
  const cle = new THREE.DirectionalLight(0xfff2e0, 2.5); cle.position.set(1.4, 2.2, 2.6); scene.add(cle);
  const rempl = new THREE.DirectionalLight(0xbfd4ff, 1.0); rempl.position.set(-2.2, 1.2, -1.4); scene.add(rempl);
  const contre = new THREE.DirectionalLight(0xffffff, 1.5); contre.position.set(-0.6, 1.6, -2.4); scene.add(contre);
  const cam = new THREE.PerspectiveCamera(CADRAGE.champ, 1, 0.05, 20);
  return { renderer, scene, cam, loader: new GLTFLoader() };
}

// LE BUSTE d'un avatar : la tête trouvée par son os (sinon le haut de la boîte), la caméra posée devant elle, un rendu, une
// image WebP (sa qualité baissée par pas de 0,05 tant qu'elle dépasse 30 Ko) ; le modèle libéré ensuite
async function buste(A, def) {
  const { renderer, scene, cam, loader } = A;
  const gltf = await loader.loadAsync(def.model);
  const model = gltf.scene;
  model.traverse((o) => { if (o.isMesh) o.frustumCulled = false; });
  scene.add(model);
  model.updateMatrixWorld(true);
  let tete = null;
  model.traverse((o) => { if (o.isBone && /(^|:)Head$/.test(o.name)) tete = o; });
  const c = new THREE.Vector3();
  if (tete) tete.getWorldPosition(c);
  else { const b = new THREE.Box3().setFromObject(model); c.set((b.min.x + b.max.x) / 2, b.max.y - 0.16, (b.min.z + b.max.z) / 2); }
  cam.position.set(c.x + CADRAGE.dx, c.y + CADRAGE.dy, c.z + CADRAGE.dz);
  cam.lookAt(c.x, c.y - CADRAGE.sous, c.z);
  cam.updateProjectionMatrix();
  renderer.render(scene, cam);
  let q = QUALITE, url = renderer.domElement.toDataURL('image/webp', q);
  while (octets(url) > MAX_OCTETS && q > 0.5) { q -= 0.05; url = renderer.domElement.toDataURL('image/webp', q); }
  scene.remove(model);
  model.traverse((o) => {
    if (!o.isMesh) return;
    o.geometry?.dispose?.();
    for (const m of Array.isArray(o.material) ? o.material : [o.material]) { if (!m) continue; for (const k of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'aoMap']) m[k]?.dispose?.(); m.dispose?.(); }
  });
  return { url, qualite: +q.toFixed(2), octets: octets(url), tete: !!tete };
}

// LA PLANCHE : les sept portraits côte à côte sur un damier, le nom dessous (pour le rapport du lot)
async function fairePlanche(P) {
  const ids = AVATARS.map((a) => a.id), w = TAILLE + 16, cv = document.createElement('canvas');
  cv.width = w * ids.length + 16; cv.height = TAILLE + 52;
  const g = cv.getContext('2d');
  g.fillStyle = '#12161f'; g.fillRect(0, 0, cv.width, cv.height);
  for (let i = 0; i < ids.length; i++) {
    const x = 16 + i * w, y = 12;
    for (let a = 0; a < TAILLE; a += 16) for (let b = 0; b < TAILLE; b += 16) { g.fillStyle = ((a + b) / 16) % 2 ? '#2a2f3a' : '#353b48'; g.fillRect(x + a, y + b, 16, 16); }
    const im = new Image(); im.src = P[ids[i]];
    await im.decode();
    g.drawImage(im, x, y);
    g.fillStyle = '#e8ebf2'; g.font = '600 14px system-ui, sans-serif'; g.textAlign = 'center';
    g.fillText(AVATARS[i].nom, x + TAILLE / 2, y + TAILLE + 24);
  }
  return cv.toDataURL('image/webp', 0.9);
}

async function principal() {
  const A = atelier(), P = {}, infos = {};
  for (const def of AVATARS) {
    dire(`Rendu de ${def.nom}…`);
    const r = await buste(A, def);
    P[def.id] = r.url; infos[def.id] = { qualite: r.qualite, octets: r.octets, tete: r.tete };
    const f = document.createElement('figure');
    f.innerHTML = `<img alt=""><figcaption>${def.nom} · ${(r.octets / 1024).toFixed(1)} Ko · q ${r.qualite}${r.tete ? '' : ' · sans os de tête'}</figcaption>`;
    f.querySelector('img').src = r.url;
    planche.appendChild(f);
    await new Promise((ok) => setTimeout(ok, 0));
  }
  A.renderer.dispose(); A.renderer.forceContextLoss?.();
  window.__portraits = P; window.__portraitsInfos = infos;
  window.__planche = await fairePlanche(P);
  const port = new URLSearchParams(location.search).get('envoyer');
  if (port) {
    // (text/plain : une requête « simple », sans pré-vol ; ecrire.py répond avec Access-Control-Allow-Origin)
    const r = await fetch(`http://127.0.0.1:${+port}/`, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ portraits: P, planche: window.__planche }) })
      .then((x) => x.text()).catch((e) => 'envoi impossible : ' + e.message);
    dire(`Fini — ${Object.keys(P).length} portraits. ${r}`);
  } else dire(`Fini — ${Object.keys(P).length} portraits (window.__portraits ; ?envoyer=<port> pour les écrire).`);
  window.__portraitsFini = true;
}
principal().catch((e) => { console.error(e); dire('Erreur : ' + e.message); window.__portraitsErreur = String(e); });
