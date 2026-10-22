// =====================================================================
//  LE REJEU DÉTERMINISTE DE LA BALADE (socle S0, 22/10 ; spec § 4.10.1)
// =====================================================================
// Un script SANS import ni export : il se colle tel quel dans la console d'un arbre a8b22dd — c'est ainsi que la
// référence js/jeu/tests/reference_balade.json a été enregistrée (§ 5.4, étape 0) — et le harnais l'importe à la demande
// (js/jeu/harnais.js rejouerBalade) : la MÊME suite de commandes et les MÊMES remises à zéro des deux côtés, seul le code du
// jeu change. Il pose `window.__rejeuBalade`.
//
// POURQUOI TANT DE REMISES À ZÉRO. Le code de la balade n'est pas reproductible tel quel : couches.js:53 tire la phase de
// respiration au hasard et couches.js:252-254 le regard errant ; ils bougent l'os Head, sur lequel est posée la vue 1
// (game.js:1018-1022) et qui règle en vue 3 _voitTete / _dansLImage, donc _camLibre, donc le cap assisté (_assistCap, qui
// lit aussi performance.now par camManuT), donc camYaw et _decalCmd, donc la direction de marche. Et l'avatar garde son
// histoire : le mélangeur de three n'écrit un os que si la valeur calculée a CHANGÉ (PropertyMixer.apply), et il mémorise
// la pose courante des os comme « état d'origine » à chaque activation (saveOriginalState) — une pose procédurale (assis)
// entre deux clips la déplace pour la suite. D'où, DANS CET ORDRE, au début de chaque passe :
//   (a) Math.random remplacé par un xorshift32 semé (graine 1), performance.now par l'horloge simulée du rejeu
//       (1e6 + n × 1000/120 ms) ; tout le rejeu tient dans UNE tâche synchrone (aucun await : la boucle rAF du jeu ne
//       s'intercale pas) ; les deux fonctions sont rendues dans un finally ;
//   (b) remise à zéro de ce que placerAuDepart() ne remet pas : les couches refaites sous le hasard semé, le mélangeur
//       coupé (A.couper : toutes les actions arrêtées, les os rendus à leur état d'origine) puis TOUS les os de l'avatar
//       reposés sur la pose C0 (relevée au premier appel dans un onglet frais, ou par le harnais avant tout test : celle
//       que le mélangeur a mémorisée au chargement), la mémoire des reprises et des couches de l'avatar oubliée, l'état
//       de locomotion et d'allure de Haythem (phase, échelle, endurance, pose procédurale `cur` = REST de player.js:97),
//       la caméra (_cam, camManuT, _omCap, l'assistance, la secousse), l'entrée vidée, le pointeur libéré ; la caméra au
//       rapport 16/9 (le cadrage ne dépend plus de la fenêtre ni de l'émulation mobile) ; les sons des couches coupés
//       (Couches.son = null : un son tire au hasard dans ses arguments, audio.js:97-104) ; puis placerAuDepart() et
//       120 images de la carte vivante (2 s) Haythem immobile au départ : les portes reprennent leur état de repos ;
//   (c) puis 2 400 pas de game.update(1/120) appelés à la main (Player.poseVisible vrai au 2e pas de chaque paire, comme
//       frame à 60 im/s), et tous les 2 pas carte.maj(1/60, game), updateCamera(1/60), input.endFrame().
// LE PARCOURS (20 s ; le cap est posé par camYaw à chaque pas des segments de marche, ce qui rend le trajet le même en
// vue 3 et en vue 1) : 0,4 s immobile au départ du hall ; marche jusqu'à la chaise de la salle d'attente la plus proche
// (9,6 ; −7,44), on s'assoit (E), on se lève en poussant vers l'est ; sprint (Maj tenu) par le hall, la porte 6 et la rue
// vers l'est jusqu'à vider l'endurance ; saut ; virage de 90° (camYaw) vers le sud, en marchant (Alt) ; retour en courant
// par la porte 6 jusque dans le hall. Un échantillon toutes les 0,5 s (41) : { t, x, y, z, fx, fz, camYaw, cam, q }.
(function () {
  'use strict';
  const PAS = 1 / 120, N = 2400, ECH = 60, REPOS = 120;
  const REST = { tL: 0, tR: 0, tLz: 0, tRz: 0, kL: 0.08, kR: 0.08, aL: 0.15, aR: 0.15, aLz: 0.12, aRz: -0.12, aLy: 0, aRy: 0, eLy: 0, eRy: 0, eL: -0.25, eR: -0.25, hL: 0, hR: 0, torsoX: 0, torsoY: 0, bob: 0, headX: 0 };
  const SIEGE = { x: 9.6, z: -7.44, sx: 9.6, sz: -6.755 };
  const RETOUR = [[17.0, 3.4, 0.6], [15.1, 1.2, 0.5], [14.9, -2.6, 0.4]];   // (x, z, arrivée à)
  const xorshift = (s) => { let x = (s >>> 0) || 1; return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; };
  // FNV-1a sur le JSON arrondi (la même règle que hacher() de js/jeu/rng.js, recopiée : ce script n'importe rien)
  function hacher(o, precision = 1e-4) {
    const s = JSON.stringify(o, (k, v) => (typeof v === 'number' ? Math.round(v / precision) * precision : v));
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return h.toString(16).padStart(8, '0');
  }
  const code = (game, id) => { const b = game.input.bind[id] || []; return b.find((c) => c && !c.startsWith('Tactile:')) || null; };

  // LA POSE C0 de l'avatar de Haythem : tous ses os (position, rotation, échelle) une fois le mélangeur coupé
  function poseC0(game) {
    const u = game.user, M = u.avatarModel;
    if (!M) return null;
    if (game.__poseC0 && game.__poseC0.modele === M) return game.__poseC0;
    if (u.anim) u.anim.couper();
    const os = [];
    M.traverse((o) => { if (o.isBone) os.push({ o, p: o.position.toArray(), q: o.quaternion.toArray(), s: o.scale.toArray() }); });
    game.__poseC0 = { modele: M, os };
    return game.__poseC0;
  }

  // (b) — sous le hasard semé
  function remettre(game, vue) {
    const u = game.user, A = u.anim, R = u.avatar, inp = game.input;
    if (document.pointerLockElement) document.exitPointerLock?.();
    inp.downSet.clear(); inp.pressedSet.clear(); inp.releasedSet.clear(); inp.touchAxis = null; inp.touchSprint = false;
    if (inp.fronts && inp.fronts.clear) inp.fronts.clear();
    u.couches = new u.couches.constructor(u);
    // (l'horloge du mélangeur aussi : les fondus de three sont datés en Float32 sur mixer.time — à 500 s, au 1/30 000e de
    // seconde près —, et deux rejeux à des heures différentes ne donnaient pas les mêmes poids, 8e-6 m sur la vue 1)
    if (A) { A.couper(); A.mixer.time = 0; A.haut = null; A.coupe = false; }
    const P = poseC0(game);
    if (P) for (const b of P.os) { b.o.position.fromArray(b.p); b.o.quaternion.fromArray(b.q); b.o.scale.fromArray(b.s); }
    if (R) { R._surOk = false; R._postOk = false; if (R._fondu) { R._fondu.t = 0; R._fondu.dur = 0; } R._mem = undefined; }
    if (u.avatarModel) u.avatarModel.position.y = 0;
    u.animKey = null; u._clipAvant = undefined; u._yAffAvant = 0; u._vitClip = undefined;
    Object.assign(u, { locoPhase: 0, locoEtat: null, sensLoco: 'av', sensT: 0, sprintVu: 0, locoActif: false, locoFoulee: 0, locoCad: 0,
      kBras: 0, kTronc: 0, kAir: 0, virageVif: 0, omegaCap: 0, landT: 0, stamina: 100, staminaMul: 1, speedNow: 0, sprinting: false,
      speedMul: 1, lateral: 0, lateralDir: 0, backward: 0, walkPhase: 0, animT: 0, _bougeAnim: false, marche: false, yAff: 0,
      yPrec: 0, solDecal: 0, _aTourne: false, armsOverride: false, jumpVelSol: 0, cibleRegard: null });
    u.cur = { ...REST };
    game._cam = null; game.camManuT = undefined; game._omCap = 0; game._assistOn = false; game._assistR = null; game._assistT = 0;
    game._assistY = undefined; game._presSiege = null; game._presRang = false; game.acc = 0;
    if (game.shake) game.shake.t = 0;
    game.vue = vue;
    game.camera.aspect = 16 / 9; game.camera.updateProjectionMatrix();
    game.placerAuDepart();
    for (let i = 0; i < REPOS; i++) game.carte.maj?.(1 / 60, game);
  }

  // LE SCRIPT : ce que les touches font au pas n (temps t = n/120), d'après l'état (le cap vers un point)
  function etape(game, n, S) {
    const u = game.user, t = n * PAS, inp = game.input;
    inp.pressedSet.clear();                                     // (un front ne vit qu'un pas : celui où le script le pose)
    const tenir = (id, oui) => {
      const c = S.codes[id]; if (!c) return;
      if (oui && !inp.downSet.has(c)) inp.downSet.add(c);          // tenu, sans front (rien ne lit ces fronts-là)
      else if (!oui && inp.downSet.has(c)) inp.downSet.delete(c);
    };
    const front = (id) => { const c = S.codes[id]; if (c) inp.pressedSet.add(c); };
    const cap = (x, z) => { game.camYaw = Math.atan2(-(x - u.pos.x), -(z - u.pos.z)); };
    const vers = (x, z) => Math.hypot(x - u.pos.x, z - u.pos.z);
    let avant = false, sprint = false, marche = false;
    if (t < 0.4) { /* immobile */ }
    else if (S.phase === 0) {                                   // jusqu'à la chaise
      if (vers(SIEGE.sx, SIEGE.sz) > 0.3 && t < 4) { avant = true; cap(SIEGE.sx, SIEGE.sz); }
      else { front('interact'); S.phase = 1; S.t1 = t; }
    } else if (S.phase === 1) {                                 // assis 1,5 s, puis on pousse vers l'est
      if (t - S.t1 >= 1.5) { avant = true; game.camYaw = -Math.PI / 2; }
      if (t - S.t1 >= 2.1) { S.phase = 2; S.t2 = t; }
    } else if (S.phase === 2) {                                 // sprint : le hall, la porte 6, la rue vers l'est
      avant = true; sprint = true;
      if (S.etape2 === undefined) S.etape2 = 0;
      if (S.etape2 === 0) { cap(14.6, -2.5); if (vers(14.6, -2.5) < 0.6) S.etape2 = 1; }
      else if (S.etape2 === 1) { cap(15.1, 1.8); if (vers(15.1, 1.8) < 0.6) S.etape2 = 2; }
      else game.camYaw = -Math.PI / 2;
      if (t - S.t2 >= 5.2) { S.phase = 3; S.t3 = t; front('jump'); }
    } else if (S.phase === 3) {                                 // en l'air, toujours vers l'est
      avant = true; game.camYaw = -Math.PI / 2;
      if (t - S.t3 >= 0.8) { S.phase = 4; S.t4 = t; game.camYaw = Math.PI; }   // virage de 90° vers le sud
    } else if (S.phase === 4) {                                 // en marchant
      avant = true; marche = true; game.camYaw = Math.PI;
      if (t - S.t4 >= 1.4) { S.phase = 5; S.etape5 = 0; }
    } else if (S.phase === 5) {                                 // retour par la rue et la porte 6 jusque dans le hall
      const P = RETOUR[S.etape5];
      if (P) { avant = true; cap(P[0], P[1]); if (vers(P[0], P[1]) < P[2]) S.etape5++; }
    }
    tenir('forward', avant); tenir('sprint', sprint); tenir('walk', marche);
  }

  function echantillon(game, n) {
    const u = game.user, c = game.camera;
    return { t: n * PAS, x: u.pos.x, y: u.pos.y, z: u.pos.z, fx: u.facing.x, fz: u.facing.z, camYaw: game.camYaw,
      cam: c.position.toArray(), q: c.quaternion.toArray() };
  }

  // UNE PASSE (vue 3 ou vue 1) : tout dans cette tâche
  function passe(game, vue) {
    const Couches = game.user.couches.constructor, PlayerC = game.user.constructor;
    const rnd = Math.random, now = performance.now, son = Couches.son, aspect = game.camera.aspect, mode = game.mode;
    const vueAvant = game.vue;
    let n = 0;
    const out = [];
    try {
      Math.random = xorshift(1);
      performance.now = () => 1e6 + n * 1000 / 120;
      Couches.son = null;
      game.mode = 'lobby';
      remettre(game, vue);
      const S = { phase: 0, codes: {} };
      for (const id of ['forward', 'sprint', 'walk', 'jump', 'interact']) S.codes[id] = code(game, id);
      out.push(echantillon(game, 0));
      for (n = 1; n <= N; n++) {
        etape(game, n, S);
        PlayerC.poseVisible = n % 2 === 0;
        game.update(PAS);
        if (n % 2 === 0) { game.carte.maj?.(1 / 60, game); game.updateCamera(1 / 60); game.input.endFrame(); }
        if (n % ECH === 0) out.push(echantillon(game, n));
      }
      out.parcours = { phase: S.phase, assis: S.t1 !== undefined };
    } finally {
      Math.random = rnd; performance.now = now; Couches.son = son; PlayerC.poseVisible = true;
      game.camera.aspect = aspect; game.camera.updateProjectionMatrix();
      game.mode = mode; game.vue = vueAvant;
      game.input.downSet.clear(); game.input.pressedSet.clear(); game.input.releasedSet.clear();
    }
    return out;
  }

  // le rejeu complet : { vue3, vue1 } (une tâche par passe ; Haythem remis au départ ensuite)
  function rejouer(game = window.__game) {
    poseC0(game);
    const vue3 = passe(game, 3), vue1 = passe(game, 1);
    game._cam = null; game.placerAuDepart();
    return { vue3, vue1, parcours: { vue3: vue3.parcours, vue1: vue1.parcours } };
  }

  // l'écart le plus grand entre deux suites d'échantillons : positions et cap, camYaw, caméra
  function ecart(a, b) {
    const e = { pos: 0, cam: 0, n: 0 };
    if (!a || !b || a.length !== b.length) return { pos: Infinity, cam: Infinity, n: -1 };
    for (let i = 0; i < a.length; i++) {
      const A = a[i], B = b[i];
      for (const k of ['x', 'y', 'z', 'fx', 'fz', 'camYaw']) e.pos = Math.max(e.pos, Math.abs(A[k] - B[k]));
      for (let j = 0; j < 3; j++) e.cam = Math.max(e.cam, Math.abs(A.cam[j] - B.cam[j]));
      for (let j = 0; j < 4; j++) e.cam = Math.max(e.cam, Math.abs(A.q[j] - B.q[j]));
      e.n++;
    }
    return e;
  }

  // LES SIÈGES : tous (346), quel que soit le niveau de Haythem. Sur a8b22dd, la liste complète n'existe que dans une
  // fermeture de js/ecole_etage1.js : on la relit en faisant passer Haythem par les quatre niveaux (carte.maj refiltre la
  // liste sur place), puis on le remet au départ. Avec le socle : game.siegesTous.
  function tousLesSieges(game) {
    if (game.siegesTous) return game.siegesTous.slice();
    const u = game.user, y0 = u.pos.y, vus = new Set();
    for (const y of [-3.06, 3.5, 6.6, 0]) { u.pos.y = y; game.carte.maj?.(0, game); for (const s of game.sieges) vus.add(s); }
    u.pos.y = y0; game.carte.maj?.(0, game);
    return [...vus];
  }
  const empreinteSieges = (L) => hacher(L.map((s) => [s.x, s.z, s.y, s.nom || '']).sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]));

  // LE HUD DE LA BALADE, sans ce qui bouge d'une image à l'autre (aide, annonces, endurance, images par seconde) et sans
  // ce que le jeu y ajoute (data-jeu)
  function empreinteHud() {
    const h = document.getElementById('hud');
    if (!h) return null;
    const c = h.cloneNode(true);
    for (const e of [...c.querySelectorAll('[data-jeu]')]) e.remove();
    for (const id of ['hud-hint', 'hud-feedback', 'hud-streak', 'hud-fps']) { const e = c.querySelector('#' + id); if (e) { e.textContent = ''; e.removeAttribute('class'); } }
    const f = c.querySelector('#stamina-fill'); if (f) f.removeAttribute('style');
    c.removeAttribute('hidden');
    return hacher(c.innerHTML);
  }

  const lumieres = (scene) => { let n = 0; scene.traverse((o) => { if (o.isLight) n++; }); return n; };

  // L'ÉCOLE TELLE QU'EN BALADE (§ 4.10.1 instantane) : comparée avant une partie et après sa sortie
  function instantane(game = window.__game) {
    const C = game.collisions, ch = game.carte.chantier || {}, S = ch._ascenseur;
    const portes = (game.carte.portes && game.carte.portes.auto || []).map((P) => ({ nom: P.g.name, k: Math.round(P.k * 1000) / 1000, off: !!(P.forme && P.forme.off) }));
    let formesOff = 0;
    for (const f of C.formes) if (f.off) formesOff++;
    const B = game.user.bounds;
    return {
      portes, formesOff,
      ascenseur: S ? { phase: S.phase || null, cab: S.paliers ? S.paliers.indexOf(S.cab) : -1, k: Math.round((S.k || 0) * 1000) / 1000 } : null,
      bornes: { xMin: B.xMin, xMax: B.xMax, zMin: B.zMin, zMax: B.zMax },
      profil: game.partie ? game.partie.profil : 'balade', sourisJeu: !!game.input.sourisJeu, vue: game.vue,
      sieges: game.siegesTous ? game.siegesTous.length : tousLesSieges(game).length,
      enfants: game.scene.children.length, lumieres: lumieres(game.scene), decalCmd: game._decalCmd || 0,
      miroirCoupe: window.__miroirAccueil && window.__miroirAccueil.etat ? !!window.__miroirAccueil.etat.coupe : null,
      corps: { visible: !!game.user.mesh.visible, capFixe: !!game.user.capFixe, rayon: game.user.rayon ?? null, hautCorps: game.user.hautCorps ?? null },
    };
  }

  // L'ENREGISTREMENT (étape 0) : ce que reference_balade.json garde pour un profil (pc ou tel). `optim` : la ligne
  // [optim] lue dans la console par l'agent et passée ici.
  function enregistrer(game = window.__game, { optim = null } = {}) {
    const r1 = rejouer(game), r2 = rejouer(game);
    const auto = { vue3: ecart(r1.vue3, r2.vue3), vue1: ecart(r1.vue1, r2.vue1) };
    const sieges = tousLesSieges(game);
    game._cam = null; game.placerAuDepart();
    for (let i = 0; i < REPOS; i++) game.carte.maj?.(1 / 60, game);
    return {
      vue3: r1.vue3, vue1: r1.vue1, parcours: r1.parcours, memeOnglet: auto,
      sieges: { n: sieges.length, empreinte: empreinteSieges(sieges) },
      tactile: window.__touch && window.__touch._contexte ? window.__touch._contexte() : null,
      optim, programmes: game.renderer.info.programs ? game.renderer.info.programs.length : null,
      lumieres: lumieres(game.scene), instantane: instantane(game), hud: empreinteHud(),
      telephone: !!(window.__chargement && window.__chargement.telephone),
    };
  }

  window.__rejeuBalade = { version: 1, PAS, N, ECH, rejouer, passe, ecart, enregistrer, instantane, empreinteHud, empreinteSieges,
    tousLesSieges, poseC0, hacher, lumieres };
})();
