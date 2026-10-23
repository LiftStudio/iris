// =====================================================================
//  LE HARNAIS DES TESTS : window.__jeu (socle S0, 22/10 ; spec §§ 4.10, 4.10.1)
// =====================================================================
// Tout ce qu'un test fait au jeu passe par ici — jamais un clic à l'écran. Il ne dépend NI de requestAnimationFrame (un
// onglet caché n'en a plus : `images(n)` fait alors les images à la main et le dit, `valable: false`), NI d'un son réel
// (sous ?test=1 : `audio.creerContexte` rend un OfflineAudioContext, et `journalAudio` note ce qui est PROGRAMMÉ sur les
// paramètres et les sources). Sous ?test=1 encore : les réglages restent EN MÉMOIRE (rien n'est écrit dans
// iris.settings.v1), la ligne [optim] de la construction est relevée, et `&rapport=1&lot=<clé>` lance les tests du lot et
// pose window.__rapport. LA BALADE BIT-IDENTIQUE : `rejouerBalade()` rejoue le parcours scripté de
// js/jeu/tests/enregistrer_balade.js (hasard semé, horloge simulée, état remis à zéro, une seule tâche synchrone) et le
// compare à js/jeu/tests/reference_balade.json, enregistrée sur a8b22dd.
import * as THREE from 'three';
import { Player } from '../player.js';
import { PAS } from './constantes.js';
import { hacher } from './rng.js';
import { MEUBLES, rattraperRegistre, zonerRegistre } from '../registre_meubles.js';
import { pointsDe, POINTS_APPARITION } from './apparitions.js';
import { BORNES_NAV, Nav } from './nav.js';
import { entree } from '../settings.js';
import { ASC } from '../ecole_ascenseur.js';

// LES FICHIERS DE TESTS, par lot, dans cet ordre (`&rapport=1` sans `&lot=` : tous) ; un fichier absent = pas de tests
export const FICHIERS_TESTS = [['S0', 'test_socle.js'], ['L-A', 'test_armes.js'], ['L-B', 'test_mouvement.js'], ['L-W', 'test_modeles_armes.js'],
  ['L-V', 'test_viewmodel.js'], ['L-C', 'test_corps.js'], ['L-D', 'test_nav.js'], ['L-E', 'test_combat.js'], ['L-K', 'test_meubles.js'],
  ['L-F', 'test_prop.js'], ['L-G', 'test_hud.js'], ['L-U', 'test_menus.js'], ['L-H', 'test_effets.js'], ['L-I', 'test_mobile.js'],
  ['L-M', 'test_monde.js'], ['F2', 'test_fusion.js'], ['L-J', 'test_ia.js'], ['L-O', 'test_ia_prop.js'], ['L-P', 'test_progression.js'],
  ['L-Q', 'test_killcam.js'], ['INT', 'test_integration.js']];

const ARGS = (() => { try { return new URLSearchParams(location.search); } catch (e) { return new URLSearchParams(''); } })();
const TEST = ARGS.get('test') === '1';
const QUALITES = { basse: 'low', moyenne: 'medium', haute: 'high', ultra: 'ultra', auto: 'auto', low: 'low', medium: 'medium', high: 'high' };

// ---- sous ?test=1, AVANT la construction de l'école : la ligne [optim] relevée (js/kit_decor.js optimiserDecor) ----
const RELEVE = { optim: null };
if (TEST && typeof console !== 'undefined') {
  const info = console.info;
  console.info = function (...a) {
    if (typeof a[0] === 'string' && a[0].startsWith('[optim]')) { let i = 1; RELEVE.optim = a[0].replace(/%[dsi]/g, () => String(a[i++])); }
    return info.apply(console, a);
  };
}
// ---- le journal audio : ce qui est PROGRAMMÉ (paramètres et sources), anneau de 4 096 ----
const JOURNAL = { entrees: [], vider() { this.entrees.length = 0; } };
function espionAudio() {
  if (typeof AudioParam === 'undefined' || AudioParam.prototype.__espion) return;
  const noter = (param, methode, valeur, quand) => { JOURNAL.entrees.push({ param, methode, valeur, quand }); if (JOURNAL.entrees.length > 4096) JOURNAL.entrees.shift(); };
  for (const m of ['setValueAtTime', 'linearRampToValueAtTime', 'exponentialRampToValueAtTime', 'setTargetAtTime', 'cancelScheduledValues']) {
    const f = AudioParam.prototype[m];
    AudioParam.prototype[m] = function (v, t, ...r) { noter(this, m, m === 'cancelScheduledValues' ? null : v, m === 'cancelScheduledValues' ? v : t); return f.call(this, v, t, ...r); };
  }
  for (const m of ['start', 'stop']) {
    const f = AudioScheduledSourceNode.prototype[m];
    AudioScheduledSourceNode.prototype[m] = function (quand = 0, ...r) { noter(this, m, null, quand); return f.call(this, quand, ...r); };
  }
  AudioParam.prototype.__espion = true;
}

const attendre = (s) => new Promise((r) => setTimeout(r, s * 1000));
const mediane = (L) => { const s = L.slice().sort((a, b) => a - b); return s.length ? s[s.length >> 1] : 0; };
const centile = (L, p) => { const s = L.slice().sort((a, b) => a - b); return s.length ? s[Math.min(s.length - 1, Math.floor(s.length * p))] : 0; };

export function installerHarnais(game, deps, api, { test = TEST } = {}) {
  const D = deps || {};
  const H = { test, captureSimulee: null, figerDegrade: false, manuel: false, surveillance: null };
  const C = () => game.collisions;
  // ---- sous ?test=1 : son hors ligne, réglages en mémoire ----
  if (test) {
    const audio = D.audio || game.audio;
    if (audio && !audio.ctx) audio.creerContexte = () => new OfflineAudioContext(2, 441000, 44100);
    espionAudio();
    const s = game.settings;
    if (s) { s.save = function () { this._emit(); }; H.reglages = JSON.parse(JSON.stringify(s.data)); }
  }
  // les compteurs (tous les événements de la partie en cours) et le chronomètre de Partie.pas / Partie.image
  const N = { tirs: 0, touches: 0, tetes: 0, elims: 0, impacts: 0, sons: 0, chemins: 0, aStarMs: 0 };
  const T = { pas: [], image: [] };
  document.addEventListener('iris-partie', (e) => {
    const p = game.partie;
    if (!p || e.detail.etat !== 'entree' || p.__chrono) return;
    p.__chrono = true;
    const pas = p.pas.bind(p), image = p.image.bind(p);
    p.pas = (dt) => { const t0 = performance.now(); pas(dt); const d = performance.now() - t0; T.pas.push(d); if (T.pas.length > 4000) T.pas.shift(); };
    p.image = (dt) => { const t0 = performance.now(); image(dt); const d = performance.now() - t0; T.image.push(d); if (T.image.length > 1000) T.image.shift(); };
    // les chemins demandés et le temps de l'A* (la file : `demander` empile, `pasFile` calcule), sur chaque graphe une fois ;
    // les sons joués (l'affichage est partagé d'une partie à l'autre : enveloppé une fois)
    for (const n of [p.nav, p.navProps]) {
      if (!n || n.__chrono) continue;
      n.__chrono = true;
      const dem = n.demander.bind(n), file = n.pasFile.bind(n), ch = n.chemin.bind(n);
      n.demander = (...a) => { N.chemins++; return dem(...a); };
      n.pasFile = () => { const t0 = performance.now(); const r = file(); N.aStarMs += performance.now() - t0; return r; };
      n.chemin = (...a) => { const t0 = performance.now(); const r = ch(...a); N.aStarMs += performance.now() - t0; return r; };
    }
    const S = p.aff && p.aff.sons;
    if (S && !S.__chrono) { S.__chrono = true; const j3 = S.jouer3d.bind(S); S.jouer3d = (...a) => { N.sons++; return j3(...a); }; }
    p.sur('*', (ev) => {
      if (ev.type === 'tir') N.tirs++; else if (ev.type === 'touche') { N.touches++; if (ev.tete) N.tetes++; } else if (ev.type === 'elim') N.elims++;
      else if (ev.type === 'impact') N.impacts++;
    });
  });
  let rejeu = null, reference = null;
  const chargerRejeu = async () => {
    if (!rejeu) { await import('./tests/enregistrer_balade.js'); rejeu = window.__rejeuBalade; }
    if (!reference) reference = await fetch(new URL('./tests/reference_balade.json', import.meta.url), { cache: 'no-cache' }).then((r) => r.json());
    return rejeu;
  };
  const profil = () => (window.__chargement && window.__chargement.telephone ? 'tel' : 'pc');
  // l'école telle qu'en balade (pour les tests qui ne font pas de partie)
  const versBalade = () => { if (game.partie) api.quitter('balade'); else if (game.mode !== 'lobby') api.quitter('balade'); game.paused = false; };
  const local = () => (game.partie ? game.partie.local : null);
  const acteur = (id) => (game.partie ? game.partie.acteurParId(id) : null);
  // UNE IMAGE à la main (rendu compris) : le chemin de l'onglet caché
  const imageMain = (dt = 1 / 60) => { game.frame(dt); };

  const J = {
    get harnais() { return H; },
    get journalAudio() { return JOURNAL; },
    releve: RELEVE,
    PAS,
    async pret() {
      for (let i = 0; i < 1200 && !(game.mode === 'menu' || game.mode === 'lobby'); i++) await attendre(0.1);
      // (une partie demandée par l'adresse : on l'attend)
      const P = ARGS.get('partie');
      if (P && P !== 'balade' && api.MODES && api.MODES[P]) for (let i = 0; i < 300 && !game.partie; i++) await attendre(0.1);
      if (!J.demarrage) {
        // L'ÉTAT DU DÉMARRAGE, relevé une fois, avant tout test (point 12) : le mode, la partie, le menu et le focus manette
        const menu = document.getElementById('menu-jeu'), nav = game.input.manette && game.input.manette.nav;
        let focus = null;
        if (nav && menu && !menu.hidden) {
          const avant = entree.manette;
          entree.manette = true;
          try { const r = nav.racine(); if (r) { nav.verifier(r); focus = nav.cur && nav.cur.dataset ? nav.cur.dataset.act || nav.cur.textContent : null; } }
          finally { nav.poser(null); nav.cle = null; entree.manette = avant; }
        }
        J.demarrage = { mode: game.mode, partie: game.partie ? game.partie.id : null, menu: !!(menu && !menu.hidden), focus };
        // (&qualite=basse|moyenne|haute|ultra|auto : le préréglage des mesures, posé en mémoire avant tout test)
        if (ARGS.get('qualite')) { const q = await J.qualite(ARGS.get('qualite')); if (H.reglages) H.reglages.graphics.quality = q; }
      }
      await chargerRejeu();
      rejeu.poseC0(game);
      return true;
    },
    lancer: (mode, opts) => api.lancer(mode, opts),
    quitter: (vers = 'menu') => api.quitter(vers),
    etat: () => (game.partie ? game.partie.etat() : null),
    empreinte: () => (game.partie ? game.partie.empreinte() : null),
    acteurs() {
      const p = game.partie; if (!p) return [];
      const Lu = game.carte.lumieres;
      return p.acteurs.map((a) => ({ id: a.id, nom: a.nom, equipe: a.equipe, role: a.role, x: a.pos.x, y: a.pos.y, z: a.pos.z,
        zone: Lu && Lu.zoneEn ? (Lu.zoneEn(a.pos.x, a.pos.z, a.pos.y + 0.1) || {}).id || null : null, niveau: a.niveau(), vie: a.vie, vivant: a.vivant,
        arme: a.arsenal && a.arsenal.arme ? a.arsenal.arme.id : null, chargeur: a.arsenal ? a.arsenal.chargeur : 0,
        etatCerveau: a.cerveau ? a.cerveau.etat || null : null, prop: a.prop ? a.prop.cle : null }));
    },
    teleporter(id, x, y, z, lacet) {
      const a = acteur(id); if (!a) return false;
      const c = a.corps;
      c.pos.set(x, y, z); c.vel.set(0, 0, 0); if (c.posPrec) c.posPrec.copy(c.pos); if (c.posAff) c.posAff.copy(c.pos); c.solAff = y;
      if (lacet !== undefined) { a.cmd.lacet = lacet; if (c.setFacing) c.setFacing(-Math.sin(lacet), -Math.cos(lacet)); if (a.local) game.camYaw = lacet; }
      if (H.surveillance) H.surveillance.dernier.delete(id);      // (la surveillance ne la compte pas comme un secours)
      return true;
    },
    teleporterZone(id, zone) { const L = pointsDe(zone); if (!L.length) return false; const p = L[0]; return J.teleporter(id, p.x, p.y, p.z); },
    // viser : un acteur (son buste), un point, ou { lacet, tangage }
    viser(id, cible) {
      const a = acteur(id); if (!a) return null;
      let l, t;
      if (cible && cible.lacet !== undefined) { l = cible.lacet; t = cible.tangage || 0; }
      else {
        const b = typeof cible === 'number' ? acteur(cible) : null;
        const x = b ? b.pos.x : cible.x, y = b ? b.pos.y + 1.27 * b.h / 1.73 : cible.y, z = b ? b.pos.z : cible.z;
        const o = a.oeil(new THREE.Vector3());
        l = Math.atan2(-(x - o.x), -(z - o.z)); t = Math.atan2(-(y - o.y), Math.hypot(x - o.x, z - o.z));
      }
      if (a.local) { game.camYaw = l; game.camPitch = t; }
      a.cmd.lacet = l; a.cmd.tangage = t;
      const p = game.partie, F = p.forcees.get(id);
      if (!a.local) p.forcees.set(id, { champs: { ...(F ? F.champs : {}), lacet: l, tangage: t }, fin: Infinity });
      return { lacet: l, tangage: t };
    },
    // des champs de commande forcés pendant `duree` s (Haythem piloté sans clavier)
    commande(id, partielle, duree) {
      const p = game.partie; if (!p) return false;
      const F = p.forcees.get(id);
      p.forcees.set(id, { champs: { ...(F ? F.champs : {}), ...partielle }, fin: p.t + duree });
      return true;
    },
    // tirer n balles (vise d'abord si `cible`) : les comptes de ce qui s'est passé
    tirer(id, { n = 1, cible = null, intervalle = null } = {}) {
      const p = game.partie, a = acteur(id); if (!p || !a || !a.arsenal) return null;
      if (cible !== null) J.viser(id, cible);
      const f = a.arsenal.arme, dt = intervalle ?? 60 / f.rpm;
      const c = { tirs: 0, touches: 0, tetes: 0, decor: 0, elims: 0 };
      const des = p.sur('*', (e) => {
        if (e.type === 'tir' && e.a === id) c.tirs++;
        else if (e.type === 'touche' && e.par === id) { c.touches++; if (e.tete) c.tetes++; }
        else if (e.type === 'elim' && e.par === id) c.elims++;
        else if (e.type === 'impact') c.decor++;
      });
      for (let k = 0; k < n * 4 && c.tirs < n; k++) {
        J.commande(id, { tir: true }, f.auto ? dt * (n - c.tirs) + PAS : PAS);
        J.avancer(f.auto ? dt * (n - c.tirs) + PAS : PAS * 2);
        if (!f.auto) { J.commande(id, { tir: false }, Math.max(dt, PAS)); J.avancer(Math.max(dt, PAS)); }
      }
      J.commande(id, { tir: false }, PAS); J.avancer(PAS);
      des();
      return c;
    },
    // LA SIMULATION SEULE : Partie.pas en boucle, sans image (l'horloge des sons avance avec), aussi vite que la machine le
    // permet, dans cette tâche — `vitesse` (le facteur du temps réel visé, § 4.10) est donc toujours atteint ; `rendu` : une
    // image d'affichage tous les deux pas (poses, HUD, rendu)
    avancer(secondes, { rendu = false, vitesse = 1 } = {}) {
      const p = game.partie; if (!p) return { ms: 0, pas: 0 };
      const n = Math.max(0, Math.round(secondes / PAS)), t0 = performance.now(), S = p.aff && p.aff.sons;
      for (let i = 0; i < n; i++) {
        if (game.partie !== p) break;
        p.pas(PAS);
        if (S) S.maj(PAS, game.camera);
        if (rendu && i % 2 === 1) { game.interpoler(); game.updateCamera(1 / 60); p.image(1 / 60); game.fx.render(1 / 60); }
      }
      return { ms: performance.now() - t0, pas: n };
    },
    // n IMAGES mesurées ; sans rAF (onglet caché, ou forcé) : faites à la main, `valable: false`
    async images(n = 10) {
      const r = game.renderer, inf = r.info, auto = inf.autoReset;
      const sansRaf = H.manuel || document.hidden || performance.now() - (H.dernierRaf || 0) > 250;
      const ms = [], appels = [], tri = [];
      inf.autoReset = false;
      try {
        if (sansRaf) {
          for (let i = 0; i < n; i++) {
            inf.reset(); const t0 = performance.now(); imageMain(1 / 60); ms.push(performance.now() - t0);
            appels.push(inf.render.calls); tri.push(inf.render.triangles);
          }
        } else {
          // (un seul relais posé sur game.frame, une fois : des mesures qui se chevauchent ne s'empilent pas)
          if (!H.relais) {
            H.relais = new Set();
            const frame = game.frame.bind(game);
            game.frame = (dt) => {
              if (!H.relais.size) { frame(dt); return; }
              inf.reset(); const t0 = performance.now(); frame(dt);
              const m = { ms: performance.now() - t0, calls: inf.render.calls, tri: inf.render.triangles };
              for (const f of [...H.relais]) f(m);
            };
          }
          await new Promise((fin) => {
            let k = 0, fini = false;
            const f = (m) => { ms.push(m.ms); appels.push(m.calls); tri.push(m.tri); if (++k >= n) finir(); };
            const finir = () => { if (fini) return; fini = true; H.relais.delete(f); clearTimeout(to); fin(); };
            const to = setTimeout(finir, 4000 + n * 100);
            H.relais.add(f);
          });
        }
      } finally { if (!H.relais || !H.relais.size) { inf.autoReset = true; inf.reset(); } }   // (three : vrai par défaut)
      return { medMs: mediane(ms), p95Ms: centile(ms, 0.95), maxMs: Math.max(0, ...ms), appels: Math.round(mediane(appels)), triangles: Math.round(mediane(tri)),
        programmes: r.info.programs ? r.info.programs.length : 0, gels: ms.filter((x) => x > 100).length, valable: !sansRaf, n: ms.length };
    },
    // (coinces, horsMonde, teleportsSecours : ceux de la surveillance en cours, ou de la dernière — verifierBots, surveiller)
    compteurs() {
      const S = H.surveillance || H.derniereSurveillance;
      return { ...N, pasMs: T.pas.length ? T.pas.reduce((s, v) => s + v, 0) / T.pas.length : 0, imageMs: T.image.length ? T.image.reduce((s, v) => s + v, 0) / T.image.length : 0,
        voix: game.partie && game.partie.aff.sons ? game.partie.aff.sons.voix.length : 0,
        coinces: S ? S.coinces.size : 0, horsMonde: S ? S.horsMonde.size : 0, teleportsSecours: S ? S.teleports : 0 };
    },
    viderChrono() { T.pas.length = 0; T.image.length = 0; },
    chrono: T,
    // LE GRAPHE (§ 4.10), lu sur le CONTRAT de js/jeu/nav.js — nb, px / pz, niveau, zone (255 : hors zone), debut / liens
    // (CSR), noeudPres, depuisCache — : obtenu comme une partie l'obtient (le cache, sinon la génération), chronométré.
    // `o` : les options de Nav.obtenir (le graphe des props : { rayon: 0.2, franchir: false }).
    async verifierNav(o = {}) {
      const t0 = performance.now(), nav = await Nav.obtenir(game, o), ms = performance.now() - t0, n = nav.nb, pas = nav.pas || 0.25;
      const comp = new Int32Array(n).fill(-1); let composantes = 0;
      for (let s = 0; s < n; s++) {
        if (comp[s] >= 0) continue;
        const file = [s]; comp[s] = composantes;
        for (let i = 0; i < file.length; i++) {
          const u = file[i];
          for (let j = nav.debut[u]; j < nav.debut[u + 1]; j++) { const v = nav.liens[j]; if (comp[v] < 0) { comp[v] = composantes; file.push(v); } }
        }
        composantes++;
      }
      const parNiveau = {}, zones = new Set();
      for (let i = 0; i < n; i++) { const k = nav.niveau[i]; parNiveau[k] = (parNiveau[k] || 0) + pas * pas; if (nav.zone[i] !== 255) zones.add(nav.zone[i]); }
      for (const k in parNiveau) parNiveau[k] = Math.round(parNiveau[k] * 100) / 100;
      let apparitions = 0, cabine = 0;
      for (const q of POINTS_APPARITION) if (nav.noeudPres(q.x, q.y, q.z) >= 0) apparitions++;
      // (la cabine de l'ascenseur : plan x > 17,95, y de 7,7 à 9,05 — en monde, z = −y)
      for (let i = 0; i < n; i++) if (nav.px[i] > 17.95 && nav.pz[i] < -7.7 && nav.pz[i] > -9.05) cabine++;
      return { noeuds: n, liens: nav.liens.length, composantes, parNiveau, zonesAtteintes: zones.size, apparitions, cabine, ms, cache: !!nav.depuisCache, empreinte: nav.empreinte };
    },
    // les bots qui errent, surveillés à chaque pas (étape 10 de Partie.pas)
    async verifierBots({ duree = 120, bots = 8, cerveau = 'errant' } = {}) {
      await api.lancer('essai', { graine: 3, mannequins: [], bots: 0, humain: false });
      const p = game.partie;
      for (let k = 0; k < bots; k++) {
        const L = pointsDe('ecole'), q = L[k % L.length];
        p.ajouterActeur({ id: 100 + k, nom: 'Errant ' + k, equipe: null, x: q.x, y: q.y, z: q.z, lacet: 0, cerveau });
      }
      J.surveiller(true);
      J.avancer(duree);
      const S = J.surveiller(false);
      const r = { coinces: [...S.coinces], horsMonde: [...S.horsMonde], sousLeSol: [...S.sousLeSol], dansUnMur: [...S.murs], traverseMurs: [...S.traverseMurs],
        zonesVisitees: S.zones.size, teleportsSecours: S.teleports };
      api.quitter('balade');
      return r;
    },
    // LA SURVEILLANCE des acteurs (§ 4.10), allumée (vrai) ou éteinte (faux : elle rend ce qu'elle a vu) — verifierBots
    // l'allume ; un test peut l'allumer autour d'un trajet (elle coûte un rayon par acteur et par pas : hors des mesures)
    surveiller(oui) {
      if (oui) {
        H.surveillance = { horsMonde: new Set(), sousLeSol: new Set(), dansUnMur: new Map(), murs: new Set(), traverseMurs: new Set(), coinces: new Set(),
          zones: new Set(), immobile: new Map(), dernier: new Map(), teleports: 0 };
        return H.surveillance;
      }
      const S = H.surveillance; H.surveillance = null; if (S) H.derniereSurveillance = S;
      return S;
    },
    // MÊME GRAINE → MÊME PARTIE : deux essais (2 bots au cerveau minimal, armés), `secondes` simulées chacun
    async verifierDeterminisme(graine = 42, secondes = 30, opts = {}) {
      const un = async () => {
        await api.lancer(opts.mode || 'essai', { graine, mannequins: 3, bots: 2, ...opts });
        H.figerDegrade = true; game.partie.degrade = false;
        J.avancer(secondes);
        const e = game.partie.empreinte();
        api.quitter('balade');
        return e;
      };
      try { const a = await un(), b = await un(); return { a, b, egal: a === b }; } finally { H.figerDegrade = false; }
    },
    // L'ÉTAT : etat() → appliquer() dans une partie neuve → etat() identique
    async verifierEtat(opts = {}) {
      const o = { graine: 7, mannequins: 3, bots: 2, ...opts };
      await api.lancer(opts.mode || 'essai', o);
      J.avancer(opts.secondes ?? 2.5);
      const e1 = game.partie.etat();
      api.quitter('balade');
      await api.lancer(opts.mode || 'essai', o);
      game.partie.appliquer(JSON.parse(JSON.stringify(e1)));
      const e2 = game.partie.etat();
      api.quitter('balade');
      const h1 = hacher(e1, 1e-9), h2 = hacher(e2, 1e-9);
      J._dernierEtat = { e1, e2 };
      return h1 === h2;
    },
    // LES ENTRÉES : emotes fantômes, saut après la pause, clic qui capture, fronts trop vieux, aide en partie
    async verifierEntrees() {
      const inp = game.input, r = { emoteFantome: 0, sautApresPause: 0, clicDeCapture: 0, frontsVieux: 0, aideEnPartie: 0 };
      const touche = (code, bas = true) => window.dispatchEvent(new KeyboardEvent(bas ? 'keydown' : 'keyup', { code, bubbles: true }));
      const enPartie = !!game.partie, u = enPartie ? local() : null, corps = enPartie ? (u && u.corps) : game.user;
      // (1) un chiffre tapé roue fermée, puis la roue ouverte : aucune emote
      if (!enPartie) {
        game.user.stopEmote();
        touche('Digit3'); touche('Digit3', false);
        for (let i = 0; i < 3; i++) imageMain();
        touche('KeyT'); imageMain(); touche('KeyT', false); imageMain(); imageMain();
        if (game.user.emote) r.emoteFantome++;
        game.wheel.close(); game.user.stopEmote(); inp.purger();
      } else {
        touche('KeyT'); imageMain(); touche('KeyT', false); imageMain();
        if (game.wheel.isOpen) r.emoteFantome++;
        inp.purger();
      }
      // (2) un saut tapé pendant la pause : il ne part pas à la reprise
      if (corps) {
        game.togglePause(); touche('Space'); touche('Space', false); game.togglePause();
        if (game.paused) { game.partie?.fermerCalque?.(true); game.paused = false; }
        for (let i = 0; i < 4; i++) imageMain();
        if (corps.airborne) r.sautApresPause++;
        for (let i = 0; i < 90; i++) imageMain();
      }
      // (3) le clic qui capture le pointeur ne tire pas (ni un clic dans les 150 ms qui suivent)
      if (inp.sourisJeu) {
        const canvas = game.renderer.domElement;
        const proto = Object.getOwnPropertyDescriptor(Document.prototype, 'pointerLockElement');
        let faux = null;
        Object.defineProperty(document, 'pointerLockElement', { configurable: true, get: () => faux });
        const souris = (type, b = 0) => window.dispatchEvent(new MouseEvent(type, { button: b, bubbles: true }));
        try {
          souris('mousedown'); souris('mouseup');                       // pas capturé
          if (inp.pressedSet.has('Souris:0') || inp.releasedSet.has('Souris:0')) r.clicDeCapture++;
          faux = canvas; document.dispatchEvent(new Event('pointerlockchange'));
          souris('mousedown'); souris('mouseup');                       // capturé, mais < 150 ms
          if (inp.pressedSet.has('Souris:0')) r.clicDeCapture++;
          await attendre(0.2);
          souris('mousedown'); const ok = inp.pressedSet.has('Souris:0'); souris('mouseup');
          if (!ok) r.clicDeCapture += 100;                              // (le témoin : capturé depuis 200 ms, le clic tire)
        } finally { delete document.pointerLockElement; if (proto) Object.defineProperty(Document.prototype, 'pointerLockElement', proto); inp.tCapture = -Infinity; inp.purger(); }
      }
      // (4) un front que rien ne consomme est oublié au bout de 0,35 s
      touche('AltLeft'); touche('AltLeft', false);
      const avant = inp.pressedSet.has('AltLeft');
      await attendre(0.42); inp.endFrame();
      if (!avant || inp.pressedSet.has('AltLeft')) r.frontsVieux++;
      inp.purger();
      // (5) l'aide de la balade, jamais en partie
      if (enPartie) { const h = document.getElementById('hud-hint'); if (h && h.textContent.trim()) r.aideEnPartie++; }
      return r;
    },
    simulerCapture(etat) { H.captureSimulee = etat === 'accordee' || etat === 'refusee' ? etat : null; },
    forcerImagesManuelles(v) { H.manuel = !!v; },
    // LE REGISTRE (§ 4.10) : rattrapé et rangé par pièce comme à la préparation d'un prop hunt, puis lu — `horsTolerance` et
    // `nonEtiquetes` sont ceux que le registre a notés (js/registre_meubles.js MEUBLES, L-K)
    verifierMeubles() {
      const t0 = performance.now(), parZone = {};
      rattraperRegistre(game.scene); zonerRegistre(game.carte && game.carte.lumieres);
      for (const [z, L] of MEUBLES.parZone) parZone[z] = L.length;
      return { types: MEUBLES.types.size, poses: MEUBLES.poses.length, deguisables: [...MEUBLES.types.values()].filter((T) => T.deguisable).length,
        parZone, horsTolerance: [...(MEUBLES.horsTolerance || [])], nonEtiquetes: [...(MEUBLES.nonEtiquetes || [])], ms: performance.now() - t0 };
    },
    // LA BALADE AU BIT PRÈS (§ 4.10.1) : le rejeu, contre la référence de a8b22dd
    async rejouerBalade() {
      versBalade();
      await chargerRejeu();
      const rnd = Math.random, now = performance.now;
      const r1 = rejeu.rejouer(game), r2 = rejeu.rejouer(game);
      const P = profil(), ref = reference[P], S = reference.seuils || { pos: 1e-9, cam: 1e-6 };
      const e3 = rejeu.ecart(r1.vue3, ref.vue3), e1 = rejeu.ecart(r1.vue1, ref.vue1);
      const m3 = rejeu.ecart(r1.vue3, r2.vue3), m1 = rejeu.ecart(r1.vue1, r2.vue1);
      game._cam = null; game.placerAuDepart();
      for (let i = 0; i < 120; i++) game.carte.maj?.(1 / 60, game);
      const ecartMax = { pos: Math.max(e3.pos, e1.pos), cam: Math.max(e3.cam, e1.cam) };
      return { profil: P, ecartMax, vue3: e3, vue1: e1, seuils: S, memeOnglet: { vue3: m3, vue1: m1 }, identiques: m3.pos === 0 && m3.cam === 0 && m1.pos === 0 && m1.cam === 0,
        fonctionsRendues: Math.random === rnd && performance.now === now, parcours: r1.parcours,
        ok: ecartMax.pos <= S.pos && ecartMax.cam <= S.cam && m3.pos === 0 && m1.pos === 0 && m3.cam === 0 && m1.cam === 0 };
    },
    get reference() { return reference; },
    async chargerReference() { await chargerRejeu(); return reference; },
    instantane() { return rejeu ? rejeu.instantane(game) : null; },
    memoire() {
      const r = game.renderer;
      return { ...r.info.memory, programmes: r.info.programs ? r.info.programs.length : 0, enfants: game.scene.children.length };
    },
    // une PHOTO, juste après un rendu (fait ici, à la main, de la scène telle que la dernière image l'a posée : l'image est
    // encore dans le tampon, et ni la simulation ni la caméra n'avancent)
    photo(nom = 'photo') { game.fx.render(1 / 60); return game.renderer.domElement.toDataURL('image/jpeg', 0.88); },
    mesurer(fn, n = 50) { const L = []; for (let i = 0; i < n; i++) { const t0 = performance.now(); fn(i); L.push(performance.now() - t0); } return { med: mediane(L), p95: centile(L, 0.95) }; },
    async qualite(nom) {
      const s = game.settings, q = QUALITES[nom] || nom;
      if (s) { s.data.graphics.quality = q; game.applySettings(); }
      await attendre(0.05);
      return q;
    },
    figerQualite(v) { const fx = game.fx; if (v) { H._auto = fx.auto; fx.auto = false; } else if (H._auto !== undefined) fx.auto = H._auto; },
    // LES SIÈGES (§ 4.10.1) : chacun des 346, Haythem posé devant (ou sur la ligne de son rang), assis en ≤ 1,5 s, relevé, libre
    async verifierSieges({ debut = 0, fin = Infinity } = {}) {
      versBalade();
      const t0 = performance.now(), u = game.user, inp = game.input, L = game.siegesTous;
      const code = inp.bind.interact.find((c) => c && !c.startsWith('Tactile:'));
      const refus = []; let assis = 0, total = 0;
      const pas = () => { Player.poseVisible = true; game.update(PAS); };
      for (let i = debut; i < Math.min(L.length, fin); i++) {
        const s = L[i]; total++;
        game.placerAuDepart(); u.stopEmote();
        if (s.rang) {
          const R = s.rang;
          u.pos.set(R.ax + R.ux * s.t, R.sol, R.az + R.uz * s.t); u.rang = { R, t: s.t, ox: 0, oz: 0 };
          game.carte.maj?.(0, game);                                 // (la liste des sièges refiltrée pour son niveau)
        } else {
          // DEVANT le siège : son point de sortie (là où l'on se relève), sinon à 0,6 m de lui dans l'une des quatre
          // directions — le premier point libre d'où c'est LUI le siège proposé (le plus proche à moins de 1,1 m)
          const fx = s.fx ?? 0, fz = s.fz ?? 1, cands = [];
          if (s.sx !== undefined) cands.push([s.sx, s.sz === undefined ? s.z : s.sz]);
          for (const [a, b] of [[fx, fz], [-fx, -fz], [fz, -fx], [-fz, fx]]) cands.push([s.x + a * 0.6, s.z + b * 0.6]);
          // (un point libre d'abord ; une chaise d'établi n'en a pas — son point de sortie est dans le meuble, le pas suivant
          // l'en sort, comme en jeu : alors le premier d'où elle est proposée)
          let pose = false;
          for (const exiger of [true, false]) {
            for (const [x, z] of cands) {
              const y = C().solEn(x, z, (s.sol || 0) + 0.3);           // (s.y : la hauteur de l'assise AU-DESSUS de son sol)
              if (exiger && !C().libre(x, z, 0.3, y)) continue;
              u.pos.set(x, y, z); game.carte.maj?.(0, game);
              let best = null, bd = 1.1;
              for (const q of game.sieges) { const d = Math.hypot(x - q.x, z - q.z); if (d < bd) { bd = d; best = q; } }
              if (best === s) { pose = true; break; }
            }
            if (pose) break;
          }
          if (!pose) { const [x, z] = cands[0]; u.pos.set(x, C().solEn(x, z, (s.sol || 0) + 0.3), z); game.carte.maj?.(0, game); }
          u.setFacing(s.x - u.pos.x, s.z - u.pos.z);
        }
        u.vel.set(0, 0, 0); u.memoriser(); u.presenter(1);
        game._presSiege = null;
        inp.pressedSet.add(code); pas(); inp.pressedSet.delete(code);
        let k = 0;
        for (; k < 180 && !(u.assis && u.assis.k >= 1); k++) pas();
        const ok = !!(u.assis && u.assis.k >= 1 && Math.hypot(u.assis.a.x - s.x, u.assis.a.z - s.z) < 1e-6);
        if (ok) {
          inp.pressedSet.add(code); pas(); inp.pressedSet.delete(code);
          for (let j = 0; j < 120 && u.assis; j++) pas();
          // (relevé : 0,1 s debout — le pas suivant sort le disque des meubles où le point de sortie le pose, comme en jeu)
          for (let j = 0; j < 12; j++) pas();
        }
        // libre à sa place — ou, dans un rang serré, relevé SUR LA LIGNE du rang (le monde solide garde le rang en un bloc :
        // la ligne ne vaut que pour qui s'y est faufilé, js/player.js _glisserRang)
        const R = s.rang, G = u.rang;
        const libre = R ? !!G && G.R === R && Math.hypot(u.pos.x - (R.ax + R.ux * G.t + G.ox), u.pos.z - (R.az + R.uz * G.t + G.oz)) < 0.05
          : C().libre(u.pos.x, u.pos.z, 0.3, u.pos.y);
        if (ok && !u.assis && libre) assis++; else refus.push(i);
        u.assis = null; u.rang = null;
        if (i % 20 === 19) await attendre(0);
      }
      game.placerAuDepart();
      for (let i = 0; i < 120; i++) game.carte.maj?.(1 / 60, game);
      return { total, assis, refus, ms: performance.now() - t0 };
    },
    // L'ASCENSEUR en balade : appel au RDC, montée au 2e, descente (simulé, comme rejouerBalade)
    verifierAscenseur() {
      versBalade();
      const t0 = performance.now(), u = game.user, S = game.carte.chantier && game.carte.chantier._ascenseur;
      if (!S) return { appel: false, montee: false, descente: false, ms: 0 };
      const avant = { ...S };
      const r = { appel: false, montee: false, descente: false };
      const poser = (x, z) => { u.pos.set(x, u.pos.y, z); u.posPrec.copy(u.pos); u.posAff.copy(u.pos); u.vel.set(0, 0, 0); };
      const image = () => { game.carte.maj?.(1 / 60, game); };
      const rdc = S.paliers.find((p) => Math.abs(p.base) < 0.5);
      game.placerAuDepart();
      u.pos.y = 0; poser(ASC.xF - 0.9, -(ASC.yP0 + ASC.yP1) / 2);
      for (let i = 0; i < 300 && !r.appel; i++) { image(); if (S.cab === rdc && S.k >= 0.99 && S.phase === 'arret') r.appel = true; }
      // dedans : la cabine part de palier en palier (va-et-vient) — on attend le 2e, puis le retour au RDC
      const xIn = (ASC.cab.x0 + ASC.cab.x1) / 2 + 0.25, zIn = -(ASC.cab.y0 + ASC.cab.y1) / 2;
      let haut = false;
      for (let i = 0; i < 60 * 120 && !r.descente; i++) {
        poser(xIn, zIn); image();
        if (!haut && S.cab && Math.abs(S.cab.base - 6.6) < 0.5 && S.phase !== 'route') { haut = true; r.montee = true; }
        if (haut && S.cab === rdc && S.phase !== 'route') r.descente = true;
      }
      game.placerAuDepart();
      for (let i = 0; i < 400; i++) image();
      Object.assign(S, avant);
      image();
      return { ...r, ms: performance.now() - t0 };
    },
    verifierRaf() {
      return new Promise((fin) => {
        let n = 0; const t0 = performance.now();
        const f = () => { n++; if (performance.now() - t0 < 1000) requestAnimationFrame(f); else fin({ rafParSeconde: n, cache: document.hidden }); };
        requestAnimationFrame(f);
        setTimeout(() => fin({ rafParSeconde: n, cache: document.hidden }), 1500);
      });
    },
    async oublierCache() {
      try { const R = await navigator.serviceWorker?.getRegistrations?.(); for (const r of R || []) await r.unregister(); } catch (e) { /* pas de service worker */ }
      try { for (const k of await caches.keys()) await caches.delete(k); } catch (e) { /* pas de cache */ }
    },
    // ---- LES TESTS ----
    _tests: [],
    ajouterTest(lot, nom, fn, opts = {}) { J._tests.push({ lot, nom, fn, delai: opts.delai ?? 120, apresFusion: !!opts.apresFusion }); },
    // (`filtre` : ne lancer que les tests dont le nom commence par lui — la mise au point d'un test)
    async tests(lot = null, filtre = null) {
      const t0 = performance.now(), R = { lot, ok: true, total: 0, echecs: [], signales: [], mesures: {}, ms: 0 };
      const fusion = ARGS.get('fusion') === '1', calme = ARGS.get('calme') === '1';
      for (const T of J._tests) {
        if (lot && T.lot !== lot) continue;
        if (filtre && !T.nom.startsWith(filtre)) continue;
        if (T.apresFusion && !fusion) continue;
        R.total++;
        // un état propre : la balade, Haythem au départ, l'entrée vidée, les réglages en mémoire, le journal vidé
        try {
          versBalade(); game.placerAuDepart(); game.input.purger(); H.captureSimulee = null;
          if (H.reglages && game.settings) { game.settings.data = JSON.parse(JSON.stringify(H.reglages)); game.applySettings(); }
          JOURNAL.vider(); await J.images(2);
        } catch (e) { /* (un état propre au mieux) */ }
        const ctx = {
          graine: 1, mesurer: J.mesurer, attendre, images: J.images,
          // (`valable` : faux pour une mesure faite onglet caché — des images faites à la main, `images(n).valable` — : notée
          // « non valable », elle ne fait jamais échouer… sauf sous &calme=1, où l'onglet doit être devant)
          temps(nom, mesure, seuil, valable = !document.hidden) {
            R.mesures[nom] = mesure;
            if (!valable) { R.signales.push({ nom, mesure, seuil, nonValable: true }); return !calme; }
            if (mesure <= seuil) return true;
            if (!calme && mesure <= seuil * 1.5) { R.signales.push({ nom, mesure, seuil }); return true; }
            return false;
          },
          note(nom, valeur) { R.mesures[nom] = valeur; },
        };
        let res;
        try {
          res = await Promise.race([T.fn(ctx), attendre(T.delai).then(() => ({ ok: false, attendu: 'fini en ' + T.delai + ' s', obtenu: 'délai dépassé' }))]);
        } catch (e) { res = { ok: false, attendu: 'pas d’exception', obtenu: String(e && e.stack || e) }; }
        if (!res || !res.ok) { R.ok = false; R.echecs.push({ nom: `${T.lot} · ${T.nom}`, attendu: res ? res.attendu : '?', obtenu: res ? res.obtenu : '?' }); }
        else R.mesures[T.nom] = res.obtenu;
      }
      try { versBalade(); game.placerAuDepart(); } catch (e) { /* */ }
      R.ms = performance.now() - t0;
      return R;
    },
    async chargerTests(lot = null) {
      for (const [k, f] of FICHIERS_TESTS) {
        if (lot && k !== lot) continue;
        try { const m = await import('./tests/' + f); if (m && m.default) m.default(J); }
        catch (e) { if (!/Failed to fetch|404|Cannot find|error loading/i.test(String(e))) console.warn('[harnais] tests de', k, ':', e); }
      }
    },
  };
  // LA SURVEILLANCE des acteurs (étape 10 de Partie.pas, quand elle est allumée : J.surveiller) — chaque pas : hors du monde
  // (y < −3,6 ou hors des bornes de la navigation), sous le sol (0,6 m perdus d'un pas, sans saut), À TRAVERS un mur (le
  // segment du pas, à 1 m au-dessus des pieds, coupe une forme : rayonLibre, les formes où il part étant ignorées),
  // TÉLÉPORTÉ (plus de 1 m en un pas : le secours d'un bot coincé, compté) ; toutes les 0,1 s : dans un mur plus de 0,2 s,
  // la zone visitée, coincé (moins de 0,6 m en 5 s alors que sa commande veut avancer). La position d'avant est la sienne :
  // posPrec, qu'un déplacement peut reposer, ne compte pas.
  H.surveiller = (p) => {
    const S = H.surveillance; if (!S) return;
    const c = C(), Lu = game.carte.lumieres;
    for (const a of p.acteurs) {
      // (un mort oublie sa position : sa réapparition n'est pas une téléportation)
      if (!a.vivant || !a.corps || a.role === 'cible') { S.dernier.delete(a.id); continue; }
      const q = a.corps.pos, pr = S.dernier.get(a.id), h = 1 + (a.corps.jumpY || 0);
      if (q.y < -3.6 || q.x < BORNES_NAV.xMin - 1 || q.x > BORNES_NAV.xMax + 1 || q.z < BORNES_NAV.zMin - 1 || q.z > BORNES_NAV.zMax + 1) S.horsMonde.add(a.id);
      if (pr) {
        const d = Math.hypot(q.x - pr.x, q.z - pr.z);
        if (d > 1) S.teleports++;
        else if (d > 1e-4 && c.rayonLibre(pr.x, pr.y + h, pr.z, q.x, q.y + h, q.z, 0) < 1 - 1e-6) S.traverseMurs.add(a.id);
        if (pr.y - q.y > 0.6 && !a.corps.airborne) S.sousLeSol.add(a.id);
      }
      S.dernier.set(a.id, { x: q.x, y: q.y, z: q.z });
      if (p.tick % 12 === 0) {
        const m = !c.libre(q.x, q.z, 0.25, q.y);
        const t = S.dansUnMur.get(a.id) || 0;
        S.dansUnMur.set(a.id, m ? t + 0.1 : 0);
        if (m && t + 0.1 > 0.2) S.murs.add(a.id);
        const Z = Lu && Lu.zoneEn ? Lu.zoneEn(q.x, q.z, q.y + 0.1) : null; if (Z) S.zones.add(Z.id);
        const veut = !!(a.cmd.ax || a.cmd.ay), I = S.immobile.get(a.id);
        if (!veut || !I || Math.hypot(q.x - I.x, q.z - I.z) > 0.6) S.immobile.set(a.id, { x: q.x, z: q.z, t: p.t });
        else if (p.t - I.t > 5) S.coinces.add(a.id);
      }
    }
  };
  // le rAF observé (images(n) sait s'il en a)
  const raf = () => { H.dernierRaf = performance.now(); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
  // au démarrage (après « APPUIE ») : sous &rapport=1, les tests du lot, puis window.__rapport
  H.demarre = async () => {
    if (!test || ARGS.get('rapport') !== '1') return;
    const lot = ARGS.get('lot') || null;
    await J.pret();
    await J.chargerTests(lot);
    const R = await J.tests(lot);
    window.__rapport = { ...R, url: location.href, qualite: game.fx.quality, telephone: profil() === 'tel', fini: true };
    console.info('[harnais] rapport', lot || 'tous', R.ok ? 'OK' : 'ÉCHECS', R.total, 'tests', Math.round(R.ms), 'ms');
  };
  window.__jeu = J;
  return H;
}
