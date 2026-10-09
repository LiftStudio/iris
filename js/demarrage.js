// =====================================================================
//  LE JEU PRÊT AVANT DE LEVER LE RIDEAU — la fin de l'écran de chargement (js/chargement.js)
// =====================================================================
// Une fois les fichiers là et l'école construite (js/main.js), il reste ce qu'on ne doit pas voir arriver : Haythem et
// ses clips (sinon il paraît figé, puis saute dans sa première animation), et surtout la PREMIÈRE IMAGE, qui compilerait
// d'un bloc tous les programmes de la scène (dans LA CAGE, mesuré sur une Radeon intégrée : 12 s d'image figée). On fait
// donc tout cela DERRIÈRE l'écran de chargement, barre à l'appui :
//
//   1. JOUEUR ET ANIMATIONS : tout ce que les chargeurs de three ont en cours (DefaultLoadingManager, suivi dès l'import
//      de ce module, donc avant la construction de l'école), Haythem et ses clips.
//   2. EFFETS : Game.prechaufferScene, les programmes de la scène compilés EN PARALLÈLE par le pilote
//      (KHR_parallel_shader_compile) : le fil principal reste libre, la barre avance programme par programme.
//   3. PREMIÈRE IMAGE : la boucle du jeu démarre ici ; ce qui restait (passes du post-traitement) se compile dans cette
//      image-là, encore sous l'écran de chargement.
// Chaque attente a son plafond : un fichier qui ne vient pas, un pilote lent, jamais un écran bloqué pour de bon.
import * as THREE from 'three';

const M = THREE.DefaultLoadingManager;
const suivi = { lances: 0, finis: 0, t: performance.now() };
{
  // (itemStart / itemEnd sont des méthodes de l'instance : on les enveloppe, le gestionnaire garde son comportement —
  // js/kit_decor.js chaîne déjà son onLoad)
  const debut = M.itemStart, fin = M.itemEnd;
  M.itemStart = function (url) { suivi.lances++; suivi.t = performance.now(); return debut.call(this, url); };
  M.itemEnd = function (url) { suivi.finis++; suivi.t = performance.now(); return fin.call(this, url); };
}

const pause = (ms) => new Promise((ok) => setTimeout(ok, ms));
// l'image suivante, ou 250 ms au plus (onglet caché : pas d'image)
const imageSuivante = () => new Promise((ok) => {
  let f = false; const fin = () => { if (!f) { f = true; ok(); } };
  requestAnimationFrame(() => requestAnimationFrame(fin)); setTimeout(fin, 250);
});

const CALME_MS = 500;            // plus rien en cours depuis... : les chargements en chaîne (clips après le modèle) ont démarré
const PLAFOND_JOUEURS = 30000, PLAFOND_CLIPS = 12000, PLAFOND_SHADERS = 30000;

// LES TEXTURES DE L'AVATAR, envoyées à la carte graphique dès maintenant (le joueur clone les matériaux du fichier en
// cache, qui gardent les mêmes textures : elles sont alors déjà sur la carte). Même filtrage que Player.preparerRendu.
function envoyerTextures(game, o) {
  const r = game.renderer;
  if (!o || !r || !r.initTexture) return;
  const an = (game.fx && game.fx._aniso) || 1, vues = new Set();
  o.traverse((m) => {
    if (!m.isMesh || !m.material) return;
    for (const mat of Array.isArray(m.material) ? m.material : [m.material]) {
      for (const k of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap']) {
        const t = mat[k];
        if (!t || vues.has(t)) continue;
        vues.add(t);
        if (t.anisotropy < an) t.anisotropy = an;
        try { r.initTexture(t); } catch (e) { /* elle partira au premier dessin */ }
      }
    }
  });
}

// `avatar` : la promesse du modèle de Haythem (js/player.js prechargerModele), ou null
export async function preparerJeu(game, ch, { avatar = null } = {}) {
  // ---- 1. joueur et animations ----
  ch.etape('joueurs', 0);
  let avatarPret = !avatar;
  if (avatar) Promise.resolve(avatar).then((gltf) => { avatarPret = true; envoyerTextures(game, gltf && gltf.scene); }, () => { avatarPret = true; });
  const t0 = performance.now();
  for (;;) {
    const enCours = suivi.lances - suivi.finis, ecoule = performance.now() - t0;
    ch.avance(suivi.lances ? suivi.finis / suivi.lances : 1);
    // Haythem : son modèle puis ses clips (Player._loadAnims) ; s'ils tardent, on n'insiste pas
    const j = game.user;
    const clips = !j || !j.avatarUrl || !!j.anim || ecoule > PLAFOND_CLIPS;
    const calme = enCours <= 0 && performance.now() - suivi.t > CALME_MS;
    if (calme && avatarPret && clips) break;
    if (ecoule > PLAFOND_JOUEURS) { console.warn('[chargement] des modèles se chargent encore, on n\'attend plus :', enCours); break; }
    await pause(80);
  }
  ch.avance(1);

  // ---- 2. effets (programmes compilés en parallèle) ----
  ch.etape('shaders', 0);
  await ch.souffle();                      // le libellé peint avant la partie synchrone de la compilation
  const progs = game.renderer.info.programs, avant = new Set(progs);
  try { game.prechaufferScene(); } catch (e) { console.warn('[chargement] préchauffe :', e); }
  const neufs = progs.filter((p) => !avant.has(p));
  const t1 = performance.now();
  for (;;) {
    let prets = 0;
    for (const p of neufs) { try { if (p.isReady()) prets++; } catch (e) { prets++; } }
    ch.avance(neufs.length ? prets / neufs.length : 1);
    if (prets >= neufs.length) break;
    if (performance.now() - t1 > PLAFOND_SHADERS) { console.warn('[chargement] compilation encore en cours, on n\'attend plus :', neufs.length - prets); break; }
    await pause(50);
  }

  // ---- 3. première image ----
  ch.etape('image', 0);
  await ch.souffle();
  ch.figerTrace?.();
  game.start();                            // la première image est rendue tout de suite (Game.start)
  ch.avance(0.6);
  await imageSuivante();
  ch.avance(1);
}
