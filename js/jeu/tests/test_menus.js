// =====================================================================
//  LES TESTS DES MENUS ET DES OPTIONS (lot L-U, 23/10 ; spec § 5.5.11, acceptation, points 1 à 14)
// =====================================================================
// Lancés par le harnais sous `?test=1&rapport=1&lot=L-U` (window.__rapport). Tout passe par window.__jeu, le menu de la
// session (MENUS.courant), le panneau des options et la navigation à la manette SIMULÉE (js/manette_menus.js NavMenus :
// croix, A, B) — jamais un clic à l'écran : des `click()` sur les éléments, des événements synthétiques.
import * as THREE from 'three';
import { settings, entree, PAD_BOUTONS } from '../../settings.js';
import { cmParTour } from '../../ui.js';
import { TELEPHONE } from '../../appareil.js';
import { LIMITES } from '../constantes.js';
import { FICHES_BOTS, FICHE_HAYTHEM } from '../avatars.js';
import { portrait, PORTRAITS } from '../portraits.js';
import { MENUS, ACCUEIL, PLANS, DUREE_PLAN, FONDU, ZONES_PROP, vignette } from '../menus_jeu.js';
import { PAS } from '../constantes.js';

const egal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const sansEnfants = (o) => { const c = { ...o }; delete c.enfants; return c; };
const r2 = (v) => Math.round(v * 100) / 100;
const I = Object.fromEntries(PAD_BOUTONS.map((n, i) => [n, i]));
const vu = (el) => !!el && !el.hidden && el.getClientRects().length > 0;
const $ = (s, r = document) => r.querySelector(s);
const bilan = (res) => { const ko = res.filter((r) => !r[1]).map((r) => r[0]); return { ok: ko.length === 0, ko }; };

export default function (jeu) {
  const game = window.__game;
  const T = (nom, fn, opts) => jeu.ajouterTest('L-U', nom, fn, opts);
  const profil = () => (window.__chargement && window.__chargement.telephone ? 'tel' : 'pc');
  const menu = () => MENUS.courant;
  const options = () => menu() && menu().deps.options;
  const L = TELEPHONE ? LIMITES.tel : LIMITES.pc;
  // les réglages NEUFS (les DEFAULTS de js/settings.js) sans toucher à ceux en mémoire : un test qui vérifie une valeur par
  // défaut ne dépend pas de la sauvegarde de cette origine (une partie jouée à la main sur ce port y laisse ses choix)
  const neufs = () => { const g = settings.data; settings.charger(null); const n = JSON.parse(JSON.stringify(settings.data)); settings.data = g; return n; };

  // LA MANETTE SIMULÉE : un appui bref sur `nom` (enfoncé une image, relâché la suivante), sur l'écran du dessus
  const nav = () => game.input.manette.nav;
  const pad = (nom) => {
    const N = nav(), r = N.racine(); if (!r) return null;
    const bas = PAD_BOUTONS.map(() => false), g0 = { x: 0, y: 0, m: 0, brut: 0 }, d0 = { x: 0, y: 0, m: 0 };
    bas[I[nom]] = true;
    N.traiter(r, bas, ['Up', 'Down', 'Left', 'Right'].includes(nom) ? [] : [I[nom]], g0, d0, 1 / 60);
    const r2b = N.racine(); if (r2b) N.traiter(r2b, PAD_BOUTONS.map(() => false), [], g0, d0, 1 / 60);
    return N.cur;
  };
  const focus = () => { const N = nav(), r = N.racine(); if (r) N.verifier(r); return N.cur; };
  const avecManette = async (fn) => { const a = entree.manette; entree.manette = true; try { return await fn(); } finally { entree.manette = a; nav().poser(null); nav().cle = null; } };
  // le menu, frais (mode 'menu', l'accueil)
  const auMenu = async () => { jeu.quitter('menu'); for (let i = 0; i < 3; i++) game.frame(1 / 60); return menu(); };
  // une partie de combat courte, jusqu'à la manche (présentation 3 s + décompte 3 s simulés)
  const combatCourt = async (o = {}) => {
    await jeu.lancer(o.mode || 'equipes', { graine: 11, zone: 'ss', allies: 0, ennemis: 1, difficulte: 'recrue', scoreCible: 5, duree: 120, ...o });
    jeu.avancer(6.2);
    return game.partie;
  };
  // la fin d'une partie de combat, par ses règles (le score cible atteint)
  const finir = (p) => {
    if (p.scores) p.scores.A = p.scoreCible; else if (p.local) p.local.stats.elims = p.scoreCible;
    jeu.avancer(PAS * 3);
  };

  // 1. L'ACCUEIL : les six portes dans l'ordre, le focus manette sur BALADE, la croix et A jusqu'à chacune, B qui revient
  T('1 accueil : six portes, manette (croix, A, B)', async () => {
    const M = await auMenu(), res = [];
    const B = [...document.querySelectorAll('#menu-jeu .mj-b')].map((b) => b.textContent.trim());
    res.push(['mode menu', game.mode === 'menu' && vu($('#menu-jeu'))]);
    res.push(['six portes dans l’ordre', egal(B, ['BALADE LIBRE', 'COMBAT', 'PROP HUNT', 'STAND DE TIR', 'OPTIONS', 'CRÉDITS'])]);
    await avecManette(async () => {
      const f0 = focus();
      res.push(['focus sur BALADE', !!f0 && f0.dataset.act === 'balade']);
      // (chaque porte atteinte à la croix depuis BALADE : une colonne sur un écran ordinaire, deux sur un écran bas — un
      // téléphone couché —, où ↓ saute une porte ; on parcourt donc les quatre directions depuis chaque porte atteinte)
      const N = nav(), atteintes = new Map([[f0, 'balade']]), file = f0 ? [f0] : [];
      while (file.length) {
        const el = file.shift();
        for (const dir of ['Down', 'Right', 'Up', 'Left']) {
          N.poser(el); const c = pad(dir);
          if (c && c.dataset.act && !atteintes.has(c)) { atteintes.set(c, c.dataset.act); file.push(c); }
        }
      }
      const vus = [...atteintes.values()];
      res.push([`croix depuis BALADE : ${vus.join(', ')}`, ACCUEIL.every((a) => vus.includes(a.act)) && vus.length === ACCUEIL.length]);
      N.poser(null); N.cle = null; focus();
      // chaque sous-écran, ouvert par A et refermé par B
      const ecrans = [['combat', '#reglage-jeu'], ['prophunt', '#reglage-jeu'], ['stand', '#reglage-jeu'], ['options', '#options'], ['credits', '#credits-jeu']];
      for (const [act, sel] of ecrans) {
        const N = nav(); N.poser(null); N.cle = null; focus();
        N.poser($(`#menu-jeu [data-act="${act}"]`));      // (atteinte à la croix : vérifié au-dessus)
        pad('A');
        const ouvert = vu($(sel)) && (sel !== '#reglage-jeu' || $('#reglage-jeu').dataset.screen === (act === 'prophunt' ? 'prop' : act));
        // (dans un sous-écran, le focus se pose sur son action principale ; B revient)
        focus();
        pad('B');
        res.push([`${act} : A ouvre, B revient`, ouvert && !vu($(sel)) && vu($('#menu-jeu'))]);
      }
    });
    const r = bilan(res);
    return { ok: r.ok, attendu: res.map((x) => x[0]).join(' · '), obtenu: r.ok ? 'tout vrai' : 'faux : ' + r.ko.join(' ; ') };
  });

  // 2. BALADE LIBRE : la balade, sans partie — puis le rejeu au bit près
  T('2 BALADE LIBRE → balade, rejeu au bit près', async () => {
    await auMenu();
    $('#menu-jeu [data-act="balade"]').click();
    const lobby = game.mode === 'lobby' && game.partie === null && !vu($('#menu-jeu'));
    const r = await jeu.rejouerBalade();
    return { ok: lobby && r.ok && r.identiques, attendu: 'mode lobby, partie nulle, menu caché ; rejeu ≤ seuils, deux rejeux identiques',
      obtenu: `lobby ${lobby} · vue 3 ${r.vue3.pos} / ${r.vue3.cam} · vue 1 ${r.vue1.pos} / ${r.vue1.cam} · identiques ${r.identiques}` };
  }, { delai: 120 });

  // 3. LA CAMÉRA DU MENU : trois plans de 12 s, fondu de 1,2 s ; 360 positions jamais dans une forme ; tactile caché ; pas
  // « en jeu » pour la qualité automatique
  T('3 caméra du menu : plans, fondu, 360 positions libres', async () => {
    const M = await auMenu(), C = game.collisions, res = [];
    const t0 = M.tCam; M.tCam = 0;
    const fautes = [], plans = [], fondus = [];
    try {
      for (let i = 0; i < 360; i++) {
        M.camera(0.1, true);
        const p = game.camera.position, sol = C.solEn(p.x, p.z, p.y), plaf = C.plafondEn ? C.plafondEn(p.x, p.z, sol) : Infinity;
        const libre = C.libre(p.x, p.z, 0.15, p.y - 0.15, 0.3, 0);
        if (!libre || p.y - sol < 0.5 || plaf - p.y < 0.1) fautes.push(`${r2(M.tCam)} s (${r2(p.x)} ; ${r2(p.y)} ; ${r2(p.z)})${libre ? '' : ' dans une forme'}${p.y - sol < 0.5 ? ' trop bas' : ''}${plaf - p.y < 0.1 ? ' sous le plafond' : ''}`);
        plans.push(M.plan); fondus.push(M.fondu);
        // (le corps fictif au sol sous la caméra)
        if (Math.hypot(M.corps.pos.x - p.x, M.corps.pos.z - p.z) > 1e-6 || Math.abs(M.corps.pos.y - sol) > 1e-6) fautes.push('corps fictif pas sous la caméra à ' + r2(M.tCam));
      }
    } finally { M.tCam = t0; }
    // l'échantillon i est à t = 0,1 (i + 1) : plan 0 jusqu'à 12 s, 1 jusqu'à 24, 2 jusqu'à 36
    const okPlans = plans.slice(0, 119).every((k) => k === 0) && plans.slice(120, 239).every((k) => k === 1) && plans.slice(240, 359).every((k) => k === 2);
    const f = (t) => fondus[Math.round(t * 10) - 1];
    const okFondu = f(6) === 0 && f(11.3) === 0 && f(11.7) > 0.4 && f(11.7) < 0.6 && (f(12.0) >= 0.99 || f(12.1) >= 0.8) && f(12.3) > 0.4 && f(12.3) < 0.6 && f(12.7) === 0;
    res.push([`${PLANS.length} plans de ${DUREE_PLAN} s`, PLANS.length === 3 && okPlans]);
    res.push([`fondu de ${FONDU} s (6 s : ${f(6)} · 11,7 : ${f(11.7)} · 12 : ${f(12)} · 12,3 : ${f(12.3)} · 12,7 : ${f(12.7)})`, okFondu]);
    res.push([`360 positions libres${fautes.length ? ' — ' + fautes.slice(0, 4).join(' ; ') : ''}`, fautes.length === 0]);
    const TC = window.__touch;
    res.push(['tactile caché', !TC || TC.root.hidden]);
    res.push(['pas « en jeu » (fx._enJeu)', game.fx._enJeu() === false]);
    const r = bilan(res);
    return { ok: r.ok, attendu: res.map((x) => x[0].split(' (')[0].split(' —')[0]).join(' · '), obtenu: r.ok ? res.map((x) => x[0]).join(' · ') : 'faux : ' + r.ko.join(' ; ') };
  });

  // 4. LES RÉGLAGES DU COMBAT : les champs du § 2.2, la domination sur toute l'école, la somme des bots bornée, les visages,
  // l'habillage ; et RIEN de chargé : 0 .glb, 0 contexte WebGL, DefaultLoadingManager.onLoad jamais appelé
  T('4 réglages COMBAT : champs, bornes, avatars, rien de chargé', async () => {
    const res = [];
    const nRes = performance.getEntriesByType('resource').length;
    const getCtx = HTMLCanvasElement.prototype.getContext;
    let contextes = 0;
    HTMLCanvasElement.prototype.getContext = function (k, ...a) { if (/webgl/i.test(k)) contextes++; return getCtx.call(this, k, ...a); };
    const onLoad = THREE.DefaultLoadingManager.onLoad; let charges = 0;
    THREE.DefaultLoadingManager.onLoad = function (...a) { charges++; return onLoad && onLoad.apply(this, a); };
    try {
      const M = await auMenu();
      settings.data.jeu = neufs().jeu;                // (les choix d'un tout premier lancement)
      $('#menu-jeu [data-act="combat"]').click();
      await jeu.images(2);
      const R = $('#reglage-jeu');
      const lignes = [...R.querySelectorAll('[data-ligne]')].map((l) => l.dataset.ligne);
      res.push([`lignes ${lignes.join(', ')}`, egal(lignes, ['habillage', 'mode', 'zone', 'effectifs', 'difficulte', 'limite', 'temps', 'classe', 'avatars'])]);
      // (la fiche tient dans l'écran : LANCER visible sans faire défiler la page, le corps défile seul)
      const lr = $('#reglage-jeu .rj-lancer').getBoundingClientRect(), br = $('#reglage-jeu .rj-boite').getBoundingClientRect();
      res.push([`LANCER dans l’écran (${Math.round(lr.bottom)} ≤ ${innerHeight})`, lr.top >= 0 && lr.bottom <= innerHeight && br.bottom <= innerHeight + 1]);
      res.push(['habillage en tête, Airsoft par défaut', lignes[0] === 'habillage' && $('[data-champ="jeu.habillage"].on', R)?.dataset.v === '"airsoft"']);
      const btn = (ch, v) => R.querySelector(`[data-champ="${ch}"][data-v='${JSON.stringify(v)}']`);
      const modes = [...R.querySelectorAll('[data-champ="jeu.combat.mode"]')].map((b) => JSON.parse(b.dataset.v));
      const diffs = [...R.querySelectorAll('[data-champ="jeu.combat.difficulte"]')].map((b) => JSON.parse(b.dataset.v));
      const classes = [...R.querySelectorAll('[data-champ="jeu.combat.classe"]')].map((b) => JSON.parse(b.dataset.v));
      const zones = [...R.querySelectorAll('[data-champ="jeu.combat.zone"]')].map((b) => JSON.parse(b.dataset.v));
      res.push(['modes, zones, difficultés, classes', egal(modes, ['equipes', 'melee', 'domination']) && egal(zones, ['ecole', 'rdc_rue', 'ss', 'etages'])
        && egal(diffs, ['recrue', 'regulier', 'aguerri', 'veteran', 'mixte']) && egal(classes, ['assaut', 'infiltration', 'defense', 'tireur'])]);
      // la domination : seulement sur toute l'école
      btn('jeu.combat.zone', 'ss').click(); btn('jeu.combat.mode', 'domination').click();
      const zKo = [...R.querySelectorAll('[data-champ="jeu.combat.zone"]')].filter((b) => b.disabled).map((b) => JSON.parse(b.dataset.v));
      res.push([`domination : zones grisées ${zKo.join(', ')}`, egal(zKo, ['rdc_rue', 'ss', 'etages']) && settings.data.jeu.combat.zone === 'ecole' && btn('jeu.combat.zone', 'ecole').classList.contains('on')
        && M.optionsDe('combat').opts.zone === 'ecole']);
      btn('jeu.combat.mode', 'equipes').click();
      // la somme des bots : bornée (PC 9, avertissement au-delà de 7 ; téléphone 5, au-delà de 3)
      const plus = (ch) => R.querySelector(`[data-champ="${ch}"][data-d="1"]`), moins = (ch) => R.querySelector(`[data-champ="${ch}"][data-d="-1"]`);
      for (let k = 0; k < 6; k++) { const b = moins('jeu.combat.allies'); if (b && !b.disabled) b.click(); }
      for (let k = 0; k < 8; k++) { const b = plus('jeu.combat.ennemis'); if (b && !b.disabled) b.click(); }
      for (let k = 0; k < 8; k++) { const b = plus('jeu.combat.allies'); if (b && !b.disabled) b.click(); }
      const c = settings.data.jeu.combat, somme = c.allies + c.ennemis;
      res.push([`somme des bots ${c.allies} + ${c.ennemis} = ${somme} (au plus ${L.bots})`, somme === L.bots && plus('jeu.combat.allies').disabled && plus('jeu.combat.ennemis').disabled]);
      res.push([`avertissement au-delà de ${L.conseil}`, !!R.querySelector('[data-ligne="effectifs"] .rj-avert')]);
      while (settings.data.jeu.combat.allies + settings.data.jeu.combat.ennemis > L.conseil) moins(settings.data.jeu.combat.allies > 0 ? 'jeu.combat.allies' : 'jeu.combat.ennemis').click();
      res.push(['pas d’avertissement à ' + L.conseil, !R.querySelector('[data-ligne="effectifs"] .rj-avert')]);
      // chacun pour soi : des adversaires (1 à 5), pas d'alliés
      btn('jeu.combat.mode', 'melee').click();
      const o = M.optionsDe('combat');
      res.push(['chacun pour soi : adversaires seuls', !!R.querySelector('[data-champ="jeu.combat.adversaires"]') && !R.querySelector('[data-champ="jeu.combat.allies"]') && o.opts.allies === 0 && o.opts.ennemis >= 1]);
      btn('jeu.combat.mode', 'equipes').click();
      // les visages : 6 cochables, leur portrait (<img> vers assets/portraits/<id>.webp, ou l'initiale)
      const amis = [...R.querySelectorAll('.rj-ami')];
      const imgs = amis.map((a) => a.querySelector('img'));
      res.push([`6 amis (${amis.map((a) => a.dataset.ami).join(', ')})`, amis.length === 6 && egal(amis.map((a) => a.dataset.ami), FICHES_BOTS.map((f) => f.id))]);
      res.push(['portraits <img> assets/portraits/<id>.webp', imgs.every((im, i) => im && im.getAttribute('src') === `assets/portraits/${FICHES_BOTS[i].id}.webp`)]);
      res.push(['aucun coché → Haythem cloné', settings.data.jeu.combat.avatars.length === 0 && /clones de Haythem/.test(R.querySelector('[data-ligne="avatars"]').textContent)]);
      R.querySelector('#rj-ami-gabriel').click(); R.querySelector('#rj-ami-marcantoine').click();     // (chaque clic redessine : on retrouve le bouton)
      res.push(['cochés : gabriel, marcantoine', egal(settings.data.jeu.combat.avatars, ['gabriel', 'marcantoine']) && R.querySelectorAll('.rj-ami.on').length === 2 && egal(M.optionsDe('combat').opts.avatars, ['gabriel', 'marcantoine'])]);
      // limite et temps, préréglés par mode
      res.push(['limite et temps préréglés', settings.data.jeu.combat.limites.equipes.score === (TELEPHONE ? 20 : 40) && settings.data.jeu.combat.limites.melee.score === 20
        && settings.data.jeu.combat.limites.domination.score === 150 && settings.data.jeu.combat.limites.equipes.duree === 600]);
      await jeu.images(2);
    } finally {
      HTMLCanvasElement.prototype.getContext = getCtx; THREE.DefaultLoadingManager.onLoad = onLoad;
    }
    const glb = performance.getEntriesByType('resource').slice(nRes).filter((e) => /\.glb(\?|$)/i.test(e.name)).map((e) => e.name.split('/').pop());
    res.push([`0 .glb (${glb.join(', ') || 'aucun'}) · ${contextes} contexte WebGL · onLoad ${charges}`, glb.length === 0 && contextes === 0 && charges === 0]);
    const r = bilan(res);
    return { ok: r.ok, attendu: res.map((x) => x[0].split(' (')[0]).join(' · '), obtenu: r.ok ? res.map((x) => x[0]).join(' · ') : 'faux : ' + r.ko.join(' ; ') };
  });

  // 5. LES RÉGLAGES DU PROP HUNT : les champs, une zone grisée (avec sa raison) sous 6 types déguisables, la zone par défaut
  // calculée comme PartieProp la calcule, Facile au tout premier lancement
  T('5 réglages PROP HUNT : zones grisées, défaut calculé, Facile', async () => {
    const res = [], M = await auMenu();
    M.reglage('prop');
    const R = $('#reglage-jeu');
    const lignes = [...R.querySelectorAll('[data-ligne]')].map((l) => l.dataset.ligne);
    res.push([`lignes ${lignes.join(', ')}`, ['zone', 'manches', 'acteurs', 'difficulte', 'role', 'seul', 'aides'].every((k) => lignes.includes(k))]);
    const zb = (z) => R.querySelector(`[data-champ="jeu.prop.zone"][data-v='${JSON.stringify(z)}']`);
    // avec le vrai registre : grisée si et seulement si moins de 6 types
    const vrais = ZONES_PROP.map((z) => [z, M.compterTypes(z)]);
    res.push([`grisée ⇔ < 6 types (${vrais.map(([z, n]) => z + ' ' + n).join(', ')})`, vrais.every(([z, n]) => zb(z).disabled === (n < 6))]);
    // sans le lot R : le −1 sans étiquettes, le 2e à 3 types → grisés, avec leur raison ; le défaut : le 1er
    const vrai = M.compterTypes, faux = { ss: 0, e2: 3, e1: 10, rdc: 12, ecole_int: 25 };
    try {
      M.compterTypes = (z) => faux[z];
      M.reglage('prop');
      const gr = ZONES_PROP.filter((z) => zb(z).disabled);
      const raisons = [...R.querySelectorAll('[data-ligne="zone"] .rj-raison')].map((s) => s.textContent);
      res.push([`sans le lot R : grisées ${gr.join(', ')}`, egal(gr, ['ss', 'e2']) && raisons.length === 2 && /il en faut 6|registre/.test(raisons.join(' '))]);
      res.push(['défaut calculé : le 1er', M.zonesProp().defaut === 'e1' && /AUTO : Le 1er/.test(R.querySelector('[data-ligne="zone"]').textContent)]);
      // un choix explicite gardé tant que la zone n'est pas grisée ; une zone grisée n'est jamais jouée (AUTO)
      zb('rdc').click();
      res.push(['choix explicite gardé', settings.data.jeu.prop.zone === 'rdc' && M.optionsDe('prop').opts.zone === 'rdc']);
      settings.data.jeu.prop.zone = 'e2';
      res.push(['zone grisée → AUTO au lancement', M.optionsDe('prop').opts.zone === null]);
      faux.ss = 7;
      res.push(['le −1 à 7 types : défaut le −1', M.zonesProp().defaut === 'ss']);
    } finally { M.compterTypes = vrai; }
    // Facile au tout premier lancement (des réglages neufs)
    const garde = JSON.parse(JSON.stringify(settings.data));
    try { settings.charger(null); res.push(['Facile au premier lancement', settings.data.jeu.prop.difficulte === 'facile' && settings.data.jeu.prop.zone === null]); }
    finally { settings.data = garde; }
    const r = bilan(res);
    return { ok: r.ok, attendu: res.map((x) => x[0].split(' (')[0]).join(' · '), obtenu: r.ok ? res.map((x) => x[0]).join(' · ') : 'faux : ' + r.ko.join(' ; ') };
  });

  // 6. LES CHOIX REVIENNENT À LA RÉOUVERTURE (settings.jeu, en mémoire pendant les tests)
  T('6 les choix reviennent (settings.jeu)', async () => {
    const res = [], M = await auMenu();
    M.reglage('combat');
    const R = $('#reglage-jeu'), btn = (ch, v) => R.querySelector(`[data-champ="${ch}"][data-v='${JSON.stringify(v)}']`);
    btn('jeu.combat.mode', 'melee').click(); btn('jeu.combat.difficulte', 'veteran').click(); btn('jeu.combat.classe', 'tireur').click(); btn('jeu.habillage', 'militaire').click();
    btn('jeu.combat.limites.melee.score', 25).click(); btn('jeu.combat.limites.melee.duree', 900).click();
    M.accueil(); M.reglage('prop');
    btn('jeu.prop.manches', 8).click(); btn('jeu.prop.premierRole', 'chasseur').click();
    M.accueil(); M.reglage('stand'); btn('jeu.stand.defi', 'recul').click();
    $('#reglage-jeu [data-act="retour"]').click();
    M.reglage('combat');
    const on = (ch) => { const b = R.querySelector(`[data-champ="${ch}"].on`); return b ? JSON.parse(b.dataset.v) : undefined; };
    res.push(['combat : chacun pour soi, vétéran, tireur, militaire, 25 en 15:00', on('jeu.combat.mode') === 'melee' && on('jeu.combat.difficulte') === 'veteran' && on('jeu.combat.classe') === 'tireur' && on('jeu.habillage') === 'militaire'
      && on('jeu.combat.limites.melee.score') === 25 && on('jeu.combat.limites.melee.duree') === 900]);
    M.reglage('prop');
    res.push(['prop : 8 manches, chasseur d’abord', on('jeu.prop.manches') === 8 && on('jeu.prop.premierRole') === 'chasseur']);
    M.reglage('stand');
    res.push(['stand : recul', on('jeu.stand.defi') === 'recul']);
    // (et l'enregistrement : les choix des DEFAULTS de js/settings.js survivent à une relecture du stockage)
    const relu = JSON.parse(JSON.stringify(settings.data)), garde = JSON.parse(JSON.stringify(settings.data));
    try {
      settings.charger(relu);
      res.push(['relus du stockage', settings.data.jeu.combat.mode === 'melee' && settings.data.jeu.combat.difficulte === 'veteran' && settings.data.jeu.prop.manches === 8 && settings.data.jeu.habillage === 'militaire']);
      // (les choix hors des DEFAULTS de js/settings.js — limite et temps, stand — : oubliés par la relecture, rattrapés de la
      // sauvegarde brute comme au démarrage)
      const oublies = settings.data.jeu.combat.limites === undefined && settings.data.jeu.stand === undefined;
      M._rattraper(relu);
      const J = M._jeu();
      res.push([`rattrapés au démarrage (oubliés par la relecture : ${oublies})`, J.combat.limites.melee.score === 25 && J.combat.limites.melee.duree === 900 && J.stand.defi === 'recul']);
    } finally { settings.data = garde; }
    M.accueil();
    const r = bilan(res);
    return { ok: r.ok, attendu: res.map((x) => x[0]).join(' · '), obtenu: r.ok ? 'tout vrai' : 'faux : ' + r.ko.join(' ; ') };
  });

  // 7. LANCER → PRÉPARATION (la barre, les étapes nommées) → la présentation en ≤ 4 s la 1re fois sur PC (temps)
  T('7 LANCER → préparation → présentation', async (t) => {
    const res = [], M = await auMenu();
    const vus = [], prep = $('#prep-jeu');
    const orig = M.preparation.bind(M);
    let barreMax = 0, visible = false;
    M.preparation = (f, e) => { orig(f, e); if (e) { vus.push(e); visible = visible || vu(prep); barreMax = Math.max(barreMax, parseFloat($('.prep-jeu-plein', prep).style.width) || 0); } };
    let ms = 0, msProp = 0;
    try {
      M.reglage('combat');
      const t0 = performance.now();
      $('#reglage-jeu [data-act="lancer"]').click();
      for (let i = 0; i < 400 && !(game.partie && game.partie.phase === 'presentation'); i++) await t.attendre(0.025);
      ms = performance.now() - t0;
      const p = game.partie;
      res.push([`en partie (${p ? p.id : '—'}, ${p ? p.phase : '—'})`, !!p && p.phase === 'presentation' && !vu(prep) && !vu($('#reglage-jeu'))]);
      const noms = [...new Set(vus.map((e) => e.replace(/['’]/g, '’')))];
      res.push([`étapes : ${noms.join(' · ')}`, ['Plan de l’école', 'Les élèves arrivent', 'Armes et effets'].every((n) => noms.includes(n)) && visible && barreMax >= 99]);
      const ol = [...prep.querySelectorAll('.pj-etapes li')].map((li) => li.textContent);
      res.push([`liste : ${ol.join(' · ')}`, ol.length === 3 && ol.every((n) => n !== 'Meubles')]);
      // le prop hunt : la 4e étape, « Meubles »
      jeu.quitter('menu'); vus.length = 0;
      M.reglage('prop');
      const t1 = performance.now();
      $('#reglage-jeu [data-act="lancer"]').click();
      for (let i = 0; i < 600 && !(game.partie && game.partie.id === 'prophunt'); i++) await t.attendre(0.025);
      msProp = performance.now() - t1;
      const ol2 = [...prep.querySelectorAll('.pj-etapes li')].map((li) => li.textContent);
      res.push([`prop hunt : ${ol2.join(' · ')}`, !!game.partie && game.partie.id === 'prophunt' && vus.some((e) => e === 'Meubles') && ol2.length === 4 && ol2[2] === 'Meubles']);
    } finally { M.preparation = orig; jeu.quitter('balade'); }
    const okT = t.temps('LANCER → présentation (ms, 1re fois)', ms, TELEPHONE ? 10000 : 4000);
    t.note('LANCER → prop hunt (ms)', Math.round(msProp));
    res.push([`${Math.round(ms)} ms (≤ ${TELEPHONE ? 10000 : 4000})`, okT]);
    const r = bilan(res);
    return { ok: r.ok, attendu: res.map((x) => x[0].split(' (')[0].split(' :')[0]).join(' · '), obtenu: r.ok ? res.map((x) => x[0]).join(' · ') : 'faux : ' + r.ko.join(' ; ') };
  }, { delai: 90 });

  // 8. LA FIN : un écran à elle (pas #overlay) — REJOUER relance avec les mêmes réglages, CHANGER DE MODE ouvre les
  // réglages, MENU PRINCIPAL, BALADE (l'école telle qu'en balade : instantane() = la référence)
  T('8 fin : REJOUER, CHANGER DE MODE, MENU PRINCIPAL, BALADE', async (t) => {
    const res = [], F = $('#fin-jeu');
    jeu.quitter('balade'); for (let i = 0; i < 120; i++) game.carte.maj(1 / 60, game);
    const avant = jeu.instantane();
    // LA PRÉCISION du bilan : deux tirs de FP-12 (huit plombs chacun) à 2,5 m — les statistiques de l'acteur comptent un
    // tir et jusqu'à huit touches par coup ; le bilan compte des touches sur des plombs : jamais plus de 100 %
    const pf = await combatCourt({ classe: 'defense' }), H = pf.local, E = pf.acteurs.find((a) => a.equipe === 'B'), C = game.collisions;
    // (deux places libres du −1 à 2,5 m l'une de l'autre, qui se voient : cherchées, le lot R refait le −1 ; rayonLibre rend
    // la part libre du segment, 1 = rien entre les deux)
    let place = null;
    for (let cx = 1; cx <= 16 && !place; cx++) for (let cz = -12; cz <= -7 && !place; cz++) {
      const y = C.solEn(cx, cz, -2.5), y2 = C.solEn(cx + 2.5, cz, -2.5);
      if (Math.abs(y - y2) < 0.05 && C.libre(cx, cz, 0.4, y) && C.libre(cx + 2.5, cz, 0.4, y2) && C.rayonLibre(cx, y + 1.4, cz, cx + 2.5, y2 + 1.3, cz, 0.1) >= 0.999) place = [cx, y, cz, y2];
    }
    if (place) { jeu.teleporter(H.id, place[0], place[1], place[2]); jeu.teleporter(E.id, place[0] + 2.5, place[3], place[2]); jeu.tirer(H.id, { n: 2, cible: E.id }); }
    const precF = +((menu().bilan(pf).chiffres.find(([n]) => n === 'précision') || [])[1] || '').replace(/\D/g, '');
    res.push([`précision au FP-12 : ${precF} % (${H.stats.touches} touches pour ${H.stats.tirs} tirs)`, !!place && H.stats.touches > H.stats.tirs && precF > 0 && precF <= 100]);
    let p = await combatCourt();
    finir(p);
    res.push([`écran de fin (${$('.fj-titre', F)?.textContent} · ${$('.fj-sous', F)?.textContent})`, vu(F) && !vu($('#overlay')) && game.partie === p && p.phase === 'fin' && /VICTOIRE/.test($('.fj-titre', F).textContent)]);
    await t.attendre(2.6);
    res.push(['bilan après 2,5 s : podium, chiffres, 4 boutons', F.classList.contains('bilan') && F.querySelectorAll('.fj-marche').length >= 1 && F.querySelectorAll('.fj-chiffres div').length === 6
      && egal([...F.querySelectorAll('.fj-actions button')].map((b) => b.textContent), ['REJOUER', 'CHANGER DE MODE', 'MENU PRINCIPAL', 'BALADE'])]);
    // ÉCHAP sur l'écran de fin : pas de pause par-dessus
    // (sur le corps de la page, comme une vraie touche : à la cible `window`, Chromium sert d'abord les écouteurs posés avant)
    document.body.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', bubbles: true })); document.body.dispatchEvent(new KeyboardEvent('keyup', { code: 'Escape', bubbles: true }));
    game.frame(1 / 60);
    res.push(['ÉCHAP : pas de pause par-dessus (la partie gelée sous l’écran de fin)', !vu($('#overlay')) && game.paused && vu(F)]);
    // REJOUER
    const o1 = { ...p.opts };
    $('[data-act="rejouer"]', F).click();
    for (let i = 0; i < 400 && !(game.partie && game.partie !== p && game.partie.phase === 'presentation'); i++) await t.attendre(0.025);
    const p2 = game.partie;
    const memes = p2 && p2 !== p && p2.id === p.id && ['zone', 'allies', 'ennemis', 'difficulte', 'scoreCible', 'duree'].every((k) => p2.opts[k] === o1[k]);
    res.push([`REJOUER : mêmes réglages, graine neuve (${p2 ? p2.graine : '—'} / ${p.graine})`, !!memes && p2.graine !== p.graine && !vu(F)]);
    // CHANGER DE MODE
    jeu.avancer(6.2); finir(p2); M_bilan();
    $('[data-act="changer"]', F).click();
    res.push(['CHANGER DE MODE → réglages du combat', game.mode === 'menu' && game.partie === null && vu($('#reglage-jeu')) && $('#reglage-jeu').dataset.screen === 'combat' && !vu(F)]);
    // MENU PRINCIPAL
    p = await combatCourt(); finir(p); M_bilan();
    $('[data-act="menu"]', F).click();
    res.push(['MENU PRINCIPAL', game.mode === 'menu' && game.partie === null && vu($('#menu-jeu')) && !vu(F)]);
    // BALADE
    p = await combatCourt({ mode: 'melee', ennemis: 1 }); finir(p); M_bilan();
    res.push([`chacun pour soi : ${$('.fj-titre', F)?.textContent}`, vu(F) && /VICTOIRE|PLACE/.test($('.fj-titre', F).textContent)]);
    $('[data-act="balade"]', F).click();
    for (let i = 0; i < 120; i++) game.carte.maj(1 / 60, game);
    const apres = jeu.instantane(), ref = jeu.reference[profil()].instantane;
    res.push(['BALADE : instantané = référence', game.mode === 'lobby' && game.partie === null && !vu(F) && egal(sansEnfants(apres), sansEnfants(ref)) && egal(sansEnfants(apres), sansEnfants(avant))]);
    const r = bilan(res);
    return { ok: r.ok, attendu: res.map((x) => x[0].split(' (')[0].split(' :')[0]).join(' · '), obtenu: r.ok ? res.map((x) => x[0]).join(' · ') : 'faux : ' + r.ko.join(' ; ') };
    function M_bilan() { menu()._montrerBilan(); }
  }, { delai: 120 });

  // 9. LES CRÉDITS : chacun présent (Avaturn, Mixamo, la formule de la CMU, Sketchfab CC BY 4.0 et ses auteurs, voitures.glb,
  // Poly Haven, three.js, es-module-shims, les polices)
  T('9 crédits : chacun présent', async () => {
    const M = await auMenu();
    $('#menu-jeu [data-act="credits"]').click();
    const C = $('#credits-jeu'), x = C.textContent.replace(/\s+/g, ' ');
    const exiges = ['Avaturn', 'Haythem', 'Gabriel', 'Mixamo', 'The data used in this project was obtained from mocap.cs.cmu.edu. The database was created with funding from NSF EIA-0196217.',
      'Sketchfab', 'Creative Commons Attribution 4.0', 'Muhammad Rahman', 'reizibarrientos', 'Shivay gaming', 'Josh Breakdance 1990', 'Kachujin G Rosales Chicken Dance',
      'voitures.glb', 'Comrade1280', 'Poly Haven', 'three.js', 'es-module-shims', 'Bebas Neue', 'Oswald', 'SIL Open Font License'];
    const manque = exiges.filter((m) => !x.includes(m));
    const bannis = ['LeBron', 'Dribble', 'Bécon', 'Linden'].filter((m) => x.includes(m));    // (ni le basket ni le parc de LA CAGE)
    const ouvert = vu(C);
    $('#credits-jeu [data-act="retour"]').click();
    return { ok: ouvert && !manque.length && !bannis.length && vu($('#menu-jeu')), attendu: exiges.length + ' mentions, ni basket ni parc, RETOUR',
      obtenu: `${exiges.length - manque.length}/${exiges.length}${manque.length ? ' — manque : ' + manque.join(', ') : ''}${bannis.length ? ' — en trop : ' + bannis.join(', ') : ''}` };
  });

  // 10. L'ONGLET COMBAT DES OPTIONS : chaque réglage écrit le sien ; la sensibilité en cm par tour à 800 ppp (0,45 → 17,7 cm)
  T('10 onglet COMBAT : chaque réglage écrit le sien', async () => {
    const O = options(), res = [], N = neufs();
    // (les valeurs par défaut de l'onglet, quelle que soit la sauvegarde de cette origine)
    settings.data.controls.fps = N.controls.fps; settings.data.jeu.habillage = N.jeu.habillage; settings.data.jeu.fluidite = N.jeu.fluidite;
    settings.data.game.demarrage = N.game.demarrage;
    O.open('combat');
    const P = $('#opt-panels');
    try {
      const tabs = [...document.querySelectorAll('#opt-tabs button')].map((b) => b.dataset.tab);
      res.push([`onglets ${tabs.join(' · ')}`, egal(tabs, ['graphics', 'audio', 'controls', 'emotes', 'combat']) && O.onglet === 'combat']);
      res.push([`0,45 → ${$('[data-val="controls.fps.sens"]', P)?.textContent}`, $('[data-val="controls.fps.sens"]', P)?.textContent === '17,7 cm' && Math.abs(cmParTour(0.45) - 17.73) < 0.01]);
      const champ = $('[data-range="controls.fps.champ"]', P);
      res.push(['champ 75-110', champ && +champ.min === 75 && +champ.max === 110 && +champ.value === 90]);
      const visee = $('[data-range="controls.fps.sensVisee"]', P);
      res.push(['visée 0,5-1,5', visee && +visee.min === 0.5 && +visee.max === 1.5]);
      // chaque curseur, chaque groupe, chaque bascule : il écrit SON réglage
      const curseur = (ch, v) => { const r = $(`[data-range="${ch}"]`, P); r.value = String(v); r.dispatchEvent(new Event('input')); r.dispatchEvent(new Event('change')); return settings.get(ch) === v; };
      const groupe = (ch, v) => { const b = $(`[data-seg="${ch}"] button[data-v="${v}"]`, P); b.click(); return String(settings.get(ch)) === String(v); };
      const bascule = (ch) => { const a = settings.get(ch); $(`[data-toggle="${ch}"]`, P).click(); return settings.get(ch) === !a; };
      const essais = [['champ', curseur('controls.fps.champ', 100)], ['sensibilité', curseur('controls.fps.sens', 0.9)], ['sensibilité en visée', curseur('controls.fps.sensVisee', 1.25)],
        ['visée en bascule', groupe('controls.fps.viseeMaintenue', 'false') && settings.get('controls.fps.viseeMaintenue') === false],
        ['accroupi maintenu', bascule('controls.fps.accroupiMaintenu')], ['sprint auto', bascule('controls.fps.sprintAuto')], ['aide à la visée', bascule('controls.fps.aideVisee')],
        ['tir auto tactile', bascule('controls.fps.tirAuto')], ['réticule', groupe('controls.fps.reticule', '#4de1ff')], ['secousses', curseur('controls.fps.secousses', 0.5)],
        ['habillage', groupe('jeu.habillage', 'militaire')], ['priorité fluidité', bascule('jeu.fluidite')], ['démarrage', groupe('game.demarrage', 'balade')]];
      for (const [n, ok] of essais) res.push([n, ok]);
      res.push(['17,7 → ' + $('[data-val="controls.fps.sens"]', P)?.textContent + ' à 0,9', $('[data-val="controls.fps.sens"]', P)?.textContent === '8,9 cm']);
    } finally { O.close(); }
    const r = bilan(res);
    return { ok: r.ok, attendu: res.map((x) => x[0]).join(' · '), obtenu: r.ok ? 'tout vrai' : 'faux : ' + r.ko.join(' ; ') };
  });

  // 11. LES COMMANDES : lier une touche en COMBAT laisse la balade identique ; Souris:0-4 et Molette:haut/bas captées ; un
  // Ctrl lié → « Ctrl + W ferme l'onglet »
  T('11 commandes : profils, souris, molette, Ctrl', async (t) => {
    const O = options(), res = [];
    O.open('controls');
    const P = $('#opt-panels');
    const balade = JSON.stringify(settings.bindingsDe('balade'));
    try {
      res.push(['trois profils', egal([...P.querySelectorAll('.sous-onglets button')].map((b) => b.dataset.prof), ['balade', 'combat', 'prop'])]);
      $('#cmd-combat', P).click();
      res.push(['profil COMBAT montré', O.profil === 'combat' && !!$('[data-bind="tir"][data-prof="combat"]', P)]);
      const cellule = (id, s) => $(`[data-bind="${id}"][data-slot="${s}"]`, P);
      // une touche
      cellule('recharger', 1).click();
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyT', bubbles: true, cancelable: true }));
      res.push(['KeyT sur Recharger (COMBAT)', settings.bindingsDe('combat').recharger[1] === 'KeyT' && JSON.stringify(settings.bindingsDe('balade')) === balade]);
      // les cinq boutons de la souris et les deux crans de la molette
      const vus = [];
      const ids = ['visee', 'couteau', 'interagir', 'scanner', 'armePrec', 'walk', 'serie1'];
      for (let b = 0; b < 5; b++) {
        cellule(ids[b], 1).click();
        window.dispatchEvent(new MouseEvent('mousedown', { button: b, bubbles: true, cancelable: true }));
        window.dispatchEvent(new MouseEvent('mouseup', { button: b, bubbles: true, cancelable: true }));
        await t.attendre(0.35);
        vus.push(settings.bindingsDe('combat')[ids[b]][1]);
      }
      for (const [k, dy] of [[5, -120], [6, 120]]) {
        cellule(ids[k], 1).click();
        window.dispatchEvent(new WheelEvent('wheel', { deltaY: dy, bubbles: true, cancelable: true }));
        vus.push(settings.bindingsDe('combat')[ids[k]][1]);
      }
      res.push([`captés : ${vus.join(', ')}`, egal(vus, ['Souris:0', 'Souris:1', 'Souris:2', 'Souris:3', 'Souris:4', 'Molette:haut', 'Molette:bas'])]);
      res.push(['la balade identique', JSON.stringify(settings.bindingsDe('balade')) === balade]);
      // un Ctrl lié : l'avertissement
      res.push(['pas d’avertissement sans Ctrl', !/Ctrl \+ W ferme l/.test(P.textContent)]);
      cellule('accroupi', 1).click();
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ControlLeft', bubbles: true, cancelable: true }));
      res.push(['Ctrl lié → « Ctrl + W ferme l’onglet »', settings.bindingsDe('combat').accroupi[1] === 'ControlLeft' && /Ctrl \+ W ferme l/.test($('#opt-panels').textContent)]);
      // en BALADE, la souris n'est pas une touche (elle tourne la caméra) : la case n'attend que le clavier
      $('#cmd-balade', P).click();
      cellule('jump', 1).click();
      window.dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true, cancelable: true }));
      window.dispatchEvent(new MouseEvent('mouseup', { button: 0, bubbles: true, cancelable: true }));
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', bubbles: true, cancelable: true }));
      res.push(['balade : pas de Souris:0', JSON.stringify(settings.bindingsDe('balade')) === balade]);
    } finally { O.close(); }
    const r = bilan(res);
    return { ok: r.ok, attendu: res.map((x) => x[0].split(' :')[0]).join(' · '), obtenu: r.ok ? res.map((x) => x[0]).join(' · ') : 'faux : ' + r.ko.join(' ; ') };
  });

  // 12. LES ONGLETS D'AUJOURD'HUI (graphismes, audio, commandes, emotes) : rendus sans exception, comportement inchangé
  T('12 onglets d’aujourd’hui inchangés', async () => {
    const O = options(), res = [];
    const q0 = settings.graphics.quality;
    try {
      for (const tab of ['graphics', 'audio', 'controls', 'emotes']) {
        let err = null;
        try { O.open(tab); } catch (e) { err = e; }
        res.push([tab, !err && $('#opt-panels').children.length > 0 && O.onglet === tab]);
      }
      O.open('controls');
      res.push(['commandes : la balade d’abord, ses actions', O.profil === 'balade' && !!$('#opt-panels [data-bind="emote"][data-prof="balade"]') && !!$('#opt-panels [data-range="controls.sensitivity"]')]);
      O.open('graphics');
      const cible = q0 === 'medium' ? 'high' : 'medium';
      $(`#opt-panels [data-seg="graphics.quality"] button[data-v="${cible}"]`).click();
      res.push([`qualité → ${cible}`, settings.graphics.quality === cible]);
      $(`#opt-panels [data-seg="graphics.quality"] button[data-v="${q0}"]`)?.click();
      res.push(['qualité rendue', settings.graphics.quality === q0]);
      O.open('audio');
      const r = $('#opt-panels [data-range="audio.master"]'); r.value = '0.35'; r.dispatchEvent(new Event('change'));
      res.push(['volume écrit', settings.audio.master === 0.35]);
    } finally { O.close(); }
    const r = bilan(res);
    return { ok: r.ok, attendu: res.map((x) => x[0]).join(' · '), obtenu: r.ok ? 'tout vrai' : 'faux : ' + r.ko.join(' ; ') };
  }, { delai: 90 });

  // 13. LES PORTRAITS : sept fichiers 192 × 192 à fond transparent, ≤ 30 Ko ; portrait(fiche) en < 0,1 ms, null sans image
  // (l'initiale sur un dégradé) ; le premier Tab d'une manche sans image > 50 ms ; et un stockage qui lève ne casse rien
  T('13 portraits : fichiers, portrait(), Tab, stockage qui lève', async (t) => {
    const res = [], ids = ['haythem', ...FICHES_BOTS.map((f) => f.id)];
    res.push([`PORTRAITS : ${PORTRAITS.join(', ')}`, egal([...PORTRAITS].sort(), [...ids].sort())]);
    const fautes = [];
    for (const id of ids) {
      try {
        const rep = await fetch(`assets/portraits/${id}.webp`, { cache: 'no-cache' });
        if (!rep.ok) { fautes.push(id + ' absent'); continue; }
        const b = await rep.blob(), im = await createImageBitmap(b);
        const cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height;
        const g = cv.getContext('2d', { willReadFrequently: true }); g.drawImage(im, 0, 0);
        // (les deux coins du HAUT : le buste remplit le bas de l'image, épaules comprises)
        const coins = [[1, 1], [190, 1], [96, 1]].map(([x, y]) => g.getImageData(x, y, 1, 1).data[3]);
        const milieu = g.getImageData(96, 90, 1, 1).data[3];
        if (im.width !== 192 || im.height !== 192) fautes.push(`${id} ${im.width} × ${im.height}`);
        if (coins.some((a) => a !== 0)) fautes.push(`${id} coins du haut opaques`);
        if (milieu < 200) fautes.push(`${id} visage transparent`);
        if (b.size > 30 * 1024) fautes.push(`${id} ${b.size} octets`);
      } catch (e) { fautes.push(id + ' : ' + e.message); }
    }
    res.push([`7 fichiers 192 × 192, fond transparent, ≤ 30 Ko${fautes.length ? ' — ' + fautes.join(', ') : ''}`, fautes.length === 0]);
    const m = jeu.mesurer(() => { for (let i = 0; i < 1000; i++) portrait(FICHES_BOTS[i % 6]); }, 20);
    const url = portrait(FICHE_HAYTHEM), sans = portrait({ id: 'inconnu', nom: 'Zoé' });
    res.push([`portrait() ${(m.med / 1000).toExponential(1)} ms l’appel`, url === 'assets/portraits/haythem.webp' && sans === null && m.med / 1000 < 0.1]);
    const v = vignette({ id: 'inconnu', nom: 'Zoé', color1: '#123456', color2: '#abcdef' });
    res.push(['sans image : l’initiale sur un dégradé', v.tagName === 'SPAN' && v.classList.contains('portrait-initiale') && v.textContent === 'Z']);
    // le premier Tab d'une manche (le tableau des scores, avec ses portraits)
    const p = await combatCourt({ allies: 2, ennemis: 3, avatars: ['gabriel', 'imad'] });
    // (30 images SANS Tab d'abord : si elles passent déjà 50 ms — la machine chargée par les autres agents —, la mesure
    // du Tab ne dit rien de lui et elle est notée « non valable », comme onglet caché)
    await jeu.images(30);                           // (les premières images d'une partie compilent encore : passées)
    const libre = await jeu.images(30);
    game.input.presser('Tab');
    const im = await jeu.images(30);
    game.input.relacher('Tab');
    jeu.quitter('balade');
    const charge = libre.maxMs > 50, valable = im.valable && !charge;
    const okTab = t.temps('premier Tab : image la plus longue (ms)', im.maxMs, 50, valable);
    t.note('sans Tab : image la plus longue (ms)', Math.round(libre.maxMs));
    res.push([`premier Tab : ${Math.round(im.maxMs)} ms au plus${!im.valable ? ' (onglet caché : non valable)' : charge ? ` (déjà ${Math.round(libre.maxMs)} ms sans Tab : non valable)` : ''}`, okTab]);
    // un stockage qui lève (navigation privée, quota) : les menus marchent encore
    const gi = Storage.prototype.getItem, si = Storage.prototype.setItem;
    let err = null;
    Storage.prototype.getItem = () => { throw new Error('stockage refusé'); };
    Storage.prototype.setItem = () => { throw new Error('stockage refusé'); };
    try {
      const M = await auMenu();
      for (const mo of ['combat', 'prop', 'stand']) { M.reglage(mo); const b = $('#reglage-jeu .rj-corps button:not([disabled]):not(.on)'); if (b) b.click(); }
      M.accueil();
    } catch (e) { err = e; } finally { Storage.prototype.getItem = gi; Storage.prototype.setItem = si; }
    res.push([`stockage qui lève${err ? ' : ' + err.message : ''}`, !err]);
    const r = bilan(res);
    return { ok: r.ok, attendu: res.map((x) => x[0].split(' :')[0].split(' —')[0]).join(' · '), obtenu: r.ok ? res.map((x) => x[0]).join(' · ') : 'faux : ' + r.ko.join(' ; ') };
  }, { delai: 90 });

  // 14. LA PAUSE DE LA BALADE : « Modes de jeu » → le menu (mode 'menu', pointeur libre, entrée purgée)
  T('14 pause de la balade : « Modes de jeu » → menu', async () => {
    jeu.quitter('balade');
    game.togglePause();
    const b = [...document.querySelectorAll('#overlay-buttons button')].find((x) => x.textContent.trim() === 'Modes de jeu');
    game.input.presser('KeyW');
    b?.click();
    const ok = !!b && game.mode === 'menu' && !game.paused && !document.pointerLockElement && game.input.pressedSet.size === 0 && vu($('#menu-jeu')) && !vu($('#overlay'));
    const obtenu = `bouton ${!!b} · mode ${game.mode} · pause ${game.paused} · fronts ${game.input.pressedSet.size} · accueil ${vu($('#menu-jeu'))}`;
    jeu.quitter('balade');
    return { ok, attendu: 'menu, pas en pause, pointeur libre, entrée purgée, accueil visible', obtenu };
  });

  // À F2 : le parcours complet à la manette sur les vrais écrans (menu → COMBAT → LANCER → la vraie fin de L-E → REJOUER →
  // MENU PRINCIPAL), et les portraits à côté des vrais avatars de L-C (✋, au rapport de F2)
  T('F2 parcours manette sur les vraies fins', async (t) => {
    const res = [];
    await auMenu();
    await avecManette(async () => {
      focus(); nav().poser($('#menu-jeu [data-act="combat"]'));     // (la croix y mène : test 1)
      let c = null, n = 0;
      pad('A'); focus();
      res.push(['réglages du combat, focus sur LANCER', vu($('#reglage-jeu')) && nav().cur && nav().cur.dataset.act === 'lancer']);
      pad('A');
      for (let i = 0; i < 400 && !game.partie; i++) await t.attendre(0.025);
      const p = game.partie;
      res.push(['partie lancée à la manette', !!p]);
      if (p) {
        jeu.avancer(6.2); finir(p); menu()._montrerBilan(); focus();
        res.push(['focus sur REJOUER', nav().cur && nav().cur.dataset.act === 'rejouer']);
        c = nav().cur; n = 0;
        while (c && c.dataset.act !== 'menu' && n++ < 6) c = pad('Right');
        pad('A');
        res.push(['MENU PRINCIPAL à la manette', game.mode === 'menu' && !game.partie]);
      }
    });
    jeu.quitter('balade');
    const r = bilan(res);
    return { ok: r.ok, attendu: res.map((x) => x[0]).join(' · '), obtenu: r.ok ? 'tout vrai' : 'faux : ' + r.ko.join(' ; ') };
  }, { delai: 90, apresFusion: true });
}
