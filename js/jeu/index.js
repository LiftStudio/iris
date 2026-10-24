// =====================================================================
//  LE JEU : COMBAT ET PROP HUNT (socle S0, 22/10 ; spec §§ 0, 4.2, 4.5.5, 5.4 étape 4)
// =====================================================================
// IRIS devient un jeu à trois portes, toutes en solo contre des bots : la BALADE LIBRE d'aujourd'hui (inchangée), le
// COMBAT à la 1re personne (équipes SISR contre SLAM, chacun pour soi, domination, stand de tir) et le PROP HUNT (les props
// SONT les vrais meubles de l'école). js/main.js appelle `installerJeu` une fois, après le tactile ; js/game.js n'importe
// rien d'ici (`lancerPartie` reçoit la classe). Ce module pose :
//   - le MENU PRINCIPAL (js/jeu/menus_jeu.js), son corps fictif et `game.carteMenu` (la carte vivante qui le suit), la
//     caméra du menu (`game.cameraMenu`) ;
//   - le calque « CLIQUE POUR JOUER » (#calque-clic : la partie gelée jusqu'au clic qui capture le pointeur) ;
//   - l'AFFICHAGE PARTAGÉ, créé UNE fois par session (à la 1re partie) et rebranché à chaque partie : arme de vue, effets,
//     sons, HUD, tableau, mini-carte, profil, killcam, progression (pools et programmes compilés une seule fois) ;
//   - le HARNAIS (window.__jeu ; sous ?test=1 le son hors ligne, l'espion audio, les tests) ;
//   - `demarrer()` : après « APPUIE POUR COMMENCER », le menu — ou la balade directe (?partie=balade, réglage
//     game.demarrage), ou une partie (?partie=essai|equipes|melee|domination|stand|prophunt, &graine=, &bots=, &diff=, &zone=).
// Tous les modules de js/jeu/ sont importés ici, statiquement : la liste de chargement les compte (les tests, eux, sont
// importés à la demande sous ?test=1, hors liste et hors cache).
import { PartieEssai } from './partie_essai.js';
import { PartieFPS } from './partie_fps.js';
import { PartieStand } from './partie_stand.js';
import { PartieProp } from './partie_prop.js';
import { MenuJeu } from './menus_jeu.js';
import { Viewmodel } from './viewmodel.js';
import { Effets } from './effets.js';
import { SonsJeu } from './sons_jeu.js';
import { SonsProp } from './sons_prop.js';
import { HudJeu } from './hud_jeu.js';
import { HudProp } from './hud_prop.js';
import { TableauScores } from './tableau_scores.js';
import { MiniCarte } from './minicarte.js';
import { Profil } from './profil.js';
import { Killcam } from './killcam.js';
import { AffProgression } from './aff_progression.js';
import { installerHarnais } from './harnais.js';
// (les autres modules du jeu, pour la liste de chargement et pour le harnais, qui les introspecte)
import './anim_vue.js';
import './modeles_armes.js';
import './teintes.js';
import './portraits.js';
import './nav_cache.js';
import './assistance_visee.js';
import './cerveau_prop.js';

export const MODES = { essai: PartieEssai, equipes: PartieFPS, melee: PartieFPS, domination: PartieFPS, stand: PartieStand, prophunt: PartieProp };

export function installerJeu(game, deps) {
  const D = deps || {};
  let params = null;
  try { params = new URLSearchParams(location.search); } catch (e) { params = new URLSearchParams(''); }
  const arg = (k) => params.get(k);
  let aff = null, dernier = null;
  // L'AFFICHAGE PARTAGÉ, à la 1re partie (une fois par session)
  const affichage = () => {
    if (aff) return aff;
    const sons = new SonsJeu(D.audio || game.audio);
    aff = { viewmodel: new Viewmodel(game), effets: new Effets(game), sons, sonsProp: new SonsProp(sons), hud: new HudJeu(game),
      hudProp: new HudProp(game), tableau: new TableauScores(game), minicarte: new MiniCarte(game), profil: new Profil(),
      killcam: new Killcam(game), progression: new AffProgression(game) };
    return aff;
  };
  // LE CALQUE « CLIQUE POUR JOUER » (§ 4.3.5 ; style : css/jeu/hud.css)
  const calque = document.createElement('div');
  calque.id = 'calque-clic'; calque.hidden = true;
  calque.innerHTML = '<div class="calque-clic-texte">CLIQUE POUR JOUER</div>';
  // (le clic capture le pointeur et relance ; venu du doigt — ou la dernière entrée étant la manette —, il relance SANS
  // capture : un téléphone n'en a pas, la demande serait refusée et le calque resterait)
  calque.addEventListener('click', (e) => {
    e.stopPropagation();
    const p = game.partie; if (!p) return;
    if (e.pointerType === 'touch' || !p.besoinCapture()) p.fermerCalque(true); else p.capturer();
  });
  document.body.appendChild(calque);

  const api = {};
  // LE MENU PRINCIPAL et son corps fictif (la carte vivante le suit en mode 'menu')
  const menu = new MenuJeu(game, { options: D.options, lancer: (m, o) => api.lancer(m, o).catch((e) => console.error('[jeu]', e)), quitter: (v) => api.quitter(v) });
  game.carteMenu = Object.create(game, { user: { value: menu.corps } });
  game.cameraMenu = (dt, poser) => menu.camera(dt, poser);
  // (le tactile suit le mode : caché au menu, celui de la partie en partie, celui d'aujourd'hui en balade)
  const tactile = () => { try { (D.touch || window.__touch)?.refresh?.(); } catch (e) { /* pas de tactile */ } };
  document.addEventListener('iris-menu', tactile);
  document.addEventListener('iris-partie', tactile);

  // LE HARNAIS (window.__jeu ; sous ?test=1, avant tout son et tout démarrage)
  const harnais = installerHarnais(game, D, api, { test: arg('test') === '1' });
  game.depsJeu = { get affichage() { return affichage(); }, harnais, relancer: () => api.relancer() };

  Object.assign(api, {
    menu, MODES,
    get affichage() { return aff; },
    get harnais() { return harnais; },
    // UNE PARTIE : `mode` parmi MODES (équipes, chacun pour soi, domination : PartieFPS avec opts.mode)
    async lancer(mode, opts = {}) {
      if (mode === 'balade') { api.quitter('balade'); return null; }
      const Classe = MODES[mode];
      if (!Classe) throw new Error('[jeu] mode inconnu : ' + mode);
      const o = { ...opts };
      if (Classe === PartieFPS) o.mode = mode;
      dernier = { mode, opts: { ...opts } };
      // (F2 relecture : une partie lancée hors du menu — « Recommencer » de la pause, ?partie= — dit aussi son mode à l'écran
      // PRÉPARATION ; sinon sa ligne restait vide, et l'étape « Meubles » du prop hunt n'apparaissait qu'en route)
      if (!menu._lance) menu._lance = { mode, opts: { ...opts } };
      menu.preparation(0, 'Plan de l’école');
      let p;
      try { p = await game.lancerPartie(Classe, o, (etape, f) => menu.preparation(f, etape)); }
      finally { menu.preparation(1, null); }
      // la fin de la partie : son écran (pas l'écran de pause), le pointeur rendu
      p.sur('fin', (e) => {
        if (game.partie !== p) return;
        if (document.pointerLockElement) document.exitPointerLock?.();
        // (F2, demandes de L-E, L-F et L-U : l'événement ENTIER — gagnant, scores, bilan — et un texte qui dit le gagnant :
        // le nom d'un acteur quand `gagnant` est un id — chacun pour soi, prop hunt —, le verdict du défi au stand)
        const g = e.gagnant, nom = typeof g === 'number' ? ((p.acteurParId(g) || {}).nom || null) : null;
        const texte = p.id === 'stand' ? (p.resultat ? p._verdict(p.resultat) : 'Stand terminé')
          : g === null || g === undefined ? 'Égalité'
          : typeof g === 'string' ? (g === 'A' ? 'Victoire des SISR' : g === 'B' ? 'Victoire des SLAM' : g === 'props' ? 'Les props gagnent' : 'Les chasseurs gagnent')
          : nom ? (p.local && g === p.local.id ? 'Tu gagnes la partie' : `Victoire de ${nom}`) : 'Partie finie';
        menu.fin({ ...e, texte });
      });
      tactile();
      return p.etat();
    },
    relancer() { if (dernier) return api.lancer(dernier.mode, dernier.opts); return null; },
    // QUITTER une partie : vers le menu, la balade, ou rien (null)
    quitter(vers = 'menu') {
      menu.cacher();
      if (game.partie) game.quitterPartie(vers);
      else if (vers === 'menu') game.entrerMenu();
      else if (vers === 'balade') {
        const duMenu = game.mode !== 'lobby';
        game.enterLobby();
        if (duMenu) game.placerAuDepart();       // (la caméra de la balade posée d'emblée derrière Haythem)
      }
      tactile();
    },
    // APRÈS « APPUIE POUR COMMENCER »
    demarrer() {
      const p = arg('partie') || ((game.settings && game.settings.game && game.settings.game.demarrage) === 'balade' ? 'balade' : 'menu');
      if (p === 'balade') { game.enterLobby(); }
      else if (MODES[p]) {
        const o = { graine: +(arg('graine') || 1) || 1 };
        const bots = arg('bots'), diff = arg('diff'), zone = arg('zone');
        if (bots !== null) { if (p === 'essai') o.bots = +bots; else if (p === 'melee') o.ennemis = +bots; else { o.allies = Math.floor(+bots / 2); o.ennemis = Math.ceil(+bots / 2); } }
        if (diff) o.difficulte = diff;
        if (zone) o.zone = zone;
        game.enterLobby({ aide: false });           // (le HUD de la partie ; la balade ne se montre pas)
        api.lancer(p, o).catch((e) => { console.error('[jeu] partie impossible :', e); game.entrerMenu(); });
      } else game.entrerMenu();
      tactile();
      harnais.demarre?.();
    },
  });
  return api;
}
